<template></template>

<script>
    // StorageBasePostgres — v1.0.30 onprem 용 StorageBase 구현체.
    // AceBase 대신 msaez-data-gateway 와 통신한다 (DB-migration-plan.md §6).
    // StorageBaseAceBase 와 동일한 메서드 표면(put/set/push/get/list/watch/...)을
    // 노출하며, StorageBaseComposition 이 me.db / me.storage 로 사용한다.
    import { PostgresGatewayClient } from "./postgresGatewayClient";

    // 게이트웨이 클라이언트 싱글톤 (AceBase 의 window.$acebase 자리)
    function gateway() {
        if (!window.$pgGateway) {
            window.$pgGateway = new PostgresGatewayClient();
        }
        return window.$pgGateway;
    }

    export default {
        name: "storage-base-postgres",
        data() {
            return {
                _pgSubs: {} // path -> { value, child_added, child_changed: subId }
            };
        },
        created() {
            gateway(); // 클라이언트 부팅 (WebSocket 연결 시작)
        },
        methods: {
            // ── 쓰기 ─────────────────────────────────────────────────
            async put(path, string, isString) {
                var value = string;
                if (!isString) {
                    try { value = JSON.parse(string); } catch (e) { value = string; }
                }
                return await gateway().updateData(path, value);
            },
            async set(path, string, isString) {
                var value = string;
                if (!isString) {
                    try { value = JSON.parse(string); } catch (e) { value = string; }
                }
                return await gateway().setData(path, value);
            },
            async push(path, string, isString) {
                var value = string;
                if (!isString) {
                    try { value = JSON.parse(string); } catch (e) { value = string; }
                }
                return await gateway().pushData(path, value);
            },

            // ── 조회 ─────────────────────────────────────────────────
            async get(path) {
                try {
                    var value = await gateway().getData(path);
                    return value === undefined ? null : value;
                } catch (e) {
                    return null;
                }
            },
            async list(path, metadata) {
                var gw = gateway();
                if (metadata) {
                    var opts = {
                        startAt: metadata.startAt,
                        endAt: metadata.endAt,
                        sort: (metadata.sort && String(metadata.sort).includes('desc')) ? 'desc' : 'asc',
                        size: metadata.size
                    };
                    var map = await gw.listData(path, opts);
                    if (!map || typeof map !== 'object') return null;
                    // {key: val} -> [{...val, key}]  (StorageBaseAceBase.forwardChildren 호환)
                    var children = [];
                    Object.keys(map).forEach(function (k) {
                        if (k === 'count') return;
                        var v = map[k];
                        if (v && typeof v === 'object' && !Array.isArray(v)) {
                            v.key = k;
                            children.push(v);
                        } else {
                            children.push({ key: k, value: v });
                        }
                    });
                    return children.length > 0 ? children : null;
                }
                // metadata 없음 → {key: val} 맵 그대로
                var value = await gw.getData(path);
                return (value && typeof value === 'object' && Object.keys(value).length > 0)
                    ? value : null;
            },
            async getMetadata(path) {
                // PostgreSQL 게이트웨이는 별도 메타데이터 개념 없음
                return null;
            },

            // ── 삭제 ─────────────────────────────────────────────────
            async delete(path) {
                return await gateway().deleteData(path);
            },

            // ── watch (실시간) ───────────────────────────────────────
            _regSub(path, type, subId) {
                if (!this._pgSubs) this._pgSubs = {};
                if (!this._pgSubs[path]) this._pgSubs[path] = {};
                // 같은 type 의 기존 구독은 정리
                if (this._pgSubs[path][type]) {
                    gateway().unsubscribe(this._pgSubs[path][type]);
                }
                this._pgSubs[path][type] = subId;
            },
            watch(path, callback) {
                var subId = gateway().subscribe(path, 'value', null, function (msg) {
                    callback(msg.value);
                });
                this._regSub(path, 'value', subId);
            },
            watch_added(path, metadata, callback) {
                var startAt = metadata ? metadata.startAt : undefined;
                var subId = gateway().subscribe(path, 'child_added', startAt, function (msg) {
                    var v = msg.value;
                    if (v && typeof v === 'object' && !Array.isArray(v)) {
                        v.key = msg.key;
                        callback(v);
                    } else {
                        callback({ key: msg.key, value: v });
                    }
                });
                this._regSub(path, 'child_added', subId);
            },
            watch_changed(path, callback) {
                var subId = gateway().subscribe(path, 'child_changed', null, function (msg) {
                    callback(msg.value, msg.key);
                });
                this._regSub(path, 'child_changed', subId);
            },
            watch_off(path) {
                var subs = this._pgSubs && this._pgSubs[path];
                if (subs) {
                    var gw = gateway();
                    Object.keys(subs).forEach(function (type) {
                        gw.unsubscribe(subs[type]);
                    });
                    delete this._pgSubs[path];
                }
                return true;
            },
            async _list_watch(path, metadata, callback) {
                // 초기 list + 이후 child_added 구독
                var items = await this.list(path, metadata);
                if (Array.isArray(items)) items.forEach(function (it) { callback(it); });
                this.watch_added(path, metadata, callback);
            },

            // ── 인증 ─────────────────────────────────────────────────
            async _signIn(userInfo) {
                var callbackUrl = `${window.location.protocol}//${window.location.host}/?oauth=acebase`;
                // 로그인 provider 는 window.PROVIDER(코드생성용 git provider)와 분리한다.
                // AUTH_PROVIDER=posco 면 SWP SSO, 그 외에는 기존 Gitea OAuth 경로.
                var authProvider = window.AUTH_PROVIDER || window.PROVIDER || 'gitea';
                if (authProvider === 'posco') {
                    var ssoUrl = await gateway().ssoInitUrl(callbackUrl);
                    window.location = ssoUrl; // SWP 로그인 화면으로 이동
                    return;
                }
                var provider = window.PROVIDER || 'gitea';
                var redirectUrl = await gateway().oauthInitUrl(provider, callbackUrl);
                window.location = redirectUrl; // provider 로그인 화면으로 이동
            },
            async _signUp(userInfo) {
                return await gateway().authSignup(userInfo);
            },
            async _getUserInfo() {
                var token = window.localStorage.getItem('accessToken');
                if (!token) return null;
                var user = await gateway().authSignin(token);
                if (!user) return null;
                var settings = user.settings || {};
                return {
                    name: user.username || user.display_name,
                    email: user.email || window.localStorage.getItem('email'),
                    uid: user.uid,
                    profile: user.picture || window.localStorage.getItem('picture'),
                    authorized: null,
                    accessToken: token,
                    providerUid: settings.gitea_sub || settings.github_id
                        || window.localStorage.getItem('providerUid')
                };
            },
            _getRef(auth) {
                // AceBase 호환용. auth 참조 요청 시 Firebase-auth 호환 shim 을 반환해
                // App.vue/Login.vue 등의 getRef('auth').XXX 레거시 호출이 깨지지 않게 한다.
                if (auth === 'auth') {
                    var self = this;
                    var hasToken = !!window.localStorage.getItem('accessToken');
                    return {
                        currentUser: hasToken
                            ? { uid: window.localStorage.getItem('uid') } : null,
                        getRedirectResult: function () {
                            // OAuth 리다이렉트 결과는 AcebaseRedirectPage.vue 가 처리한다.
                            return Promise.resolve({ credential: null });
                        },
                        signInWithRedirect: function () { return self._signIn(); },
                        signInWithPopup: function () { return self._signIn(); },
                        signOut: function () {
                            ['accessToken', 'gitToken', 'email', 'name', 'uid',
                             'picture', 'providerUid'].forEach(function (k) {
                                window.localStorage.removeItem(k);
                            });
                            return Promise.resolve();
                        },
                        onAuthStateChanged: function () { /* no-op */ }
                    };
                }
                return gateway();
            },
            _getServerTimestamp() {
                return Date.now();
            },

            // ── 기타 / 호환 스텁 ─────────────────────────────────────
            isConnection(path, callback) {
                callback(gateway().connected);
            },
            isValidatePath(path) {
                return { status: true, msg: null };
            },
            _getURL(path) {
                // storage:// 파일 URL — 게이트웨이는 파일 스토리지 미지원, 경로 그대로 반환
                return path;
            },
            getImageURL(path) {
                return path;
            },
            _refreshFirebaseIdToken() {
                return null; // Firebase 전용 — 미사용
            },
            _getFirebaseIdToken() {
                return null; // Firebase 전용 — 미사용
            }
        }
    };
</script>
