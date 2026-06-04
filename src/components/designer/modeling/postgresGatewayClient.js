// PostgresGatewayClient — msaez-data-gateway 와 통신하는 클라이언트 (v1.0.30).
// AceBase 클라이언트 SDK 를 대체한다. HTTP(Data API) + WebSocket(watch).
//
// 브라우저: window.DB_HOST/DB_PORT/DB_NAME/DB_HTTPS 에서 설정을 읽는다.
// Node(테스트): 생성자에 config 를 직접 전달.
//
// fetch / WebSocket 는 브라우저 전역, Node 18+ 전역 모두 사용 가능.

export class PostgresGatewayClient {
  constructor(config) {
    const cfg = config || {};
    if (cfg.baseUrl) {
      this.baseUrl = cfg.baseUrl;
      this.wsUrl = cfg.wsUrl || cfg.baseUrl.replace(/^http/, 'ws') + '/watch';
    } else {
      const w = (typeof window !== 'undefined') ? window : {};
      const host = w.DB_HOST || 'localhost';
      const port = w.DB_PORT || 5757;
      const https = String(w.DB_HTTPS) === 'true';
      this.baseUrl = `${https ? 'https' : 'http'}://${host}:${port}`;
      this.wsUrl = `${https ? 'wss' : 'ws'}://${host}:${port}/watch`;
    }
    this.dbName = cfg.dbName || (typeof window !== 'undefined' && window.DB_NAME) || 'mydb';
    this._getToken = cfg.getToken || (() => {
      try { return window.localStorage.getItem('accessToken'); } catch (e) { return null; }
    });

    this.subs = new Map();   // subId -> { path, watchType, startAt, callback }
    this._subSeq = 0;
    this.ws = null;
    this.wsReady = false;
    this._wsClosed = false;

    // 쓰기 동시성 제한 — 다량의 쓰기를 한꺼번에 fetch 하면 브라우저가
    // ERR_INSUFFICIENT_RESOURCES 로 죽으므로 동시 in-flight 쓰기를 제한한다.
    // (AceBase 클라이언트 SDK 가 하던 쓰기 큐잉을 대체)
    this._wq = [];
    this._wqActive = 0;
    this._WQ_MAX = 6;
    // 쓰기 큐가 비정상적으로 부풀어 브라우저 메모리를 압박하는 경우를 운영자가
    // 빨리 인지하도록 임계치 도달 시 1회 경고 (Fix 1 이 깨질 때의 진단 단서).
    this._wqWarnAt = 100;
    this._wqWarned = false;

    this._connectWs();
  }

  // ── HTTP (Data API) ──────────────────────────────────────────────
  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = this._getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }

  _dataUrl(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    return `${this.baseUrl}/data/${this.dbName}/${clean}`;
  }

  // 쓰기 fetch 를 동시성 제한 큐에 통과시켜 브라우저 fetch 폭주를 막는다.
  _throttledWrite(doFetch) {
    return new Promise((resolve, reject) => {
      this._wq.push({ doFetch, resolve, reject });
      if (!this._wqWarned && this._wq.length >= this._wqWarnAt) {
        this._wqWarned = true;
        console.warn(`[pgGateway] 쓰기 큐가 ${this._wq.length} 건을 넘었습니다 — `
          + `클라이언트가 한꺼번에 너무 많은 쓰기를 발사하고 있습니다. `
          + `update_value_particaly 의 echo loop 차단이 유지되는지 확인하세요.`);
      }
      this._drainWq();
    });
  }

  _drainWq() {
    while (this._wqActive < this._WQ_MAX && this._wq.length > 0) {
      const job = this._wq.shift();
      this._wqActive++;
      Promise.resolve().then(job.doFetch).then(job.resolve, job.reject)
        .then(() => { this._wqActive--; this._drainWq(); });
    }
  }

  async getData(path) {
    const r = await fetch(this._dataUrl(path), { headers: this._headers() });
    if (!r.ok) throw new Error(`GET ${path} -> HTTP ${r.status}`);
    return (await r.json()).value;
  }

  async listData(path, opts) {
    const url = new URL(this._dataUrl(path));
    if (opts) {
      if (opts.startAt != null) url.searchParams.set('startAt', opts.startAt);
      if (opts.endAt != null) url.searchParams.set('endAt', opts.endAt);
      if (opts.sort) url.searchParams.set('sort', opts.sort);
      if (opts.size != null) url.searchParams.set('size', opts.size);
    }
    const r = await fetch(url, { headers: this._headers() });
    if (!r.ok) throw new Error(`LIST ${path} -> HTTP ${r.status}`);
    return (await r.json()).value;
  }

  async setData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'PUT', headers: this._headers(), body: JSON.stringify(value),
    }));
    return r.ok;
  }

  async updateData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'PATCH', headers: this._headers(), body: JSON.stringify(value),
    }));
    return r.ok;
  }

  async pushData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'POST', headers: this._headers(), body: JSON.stringify(value),
    }));
    if (!r.ok) return null;
    return (await r.json()).key;
  }

  async deleteData(path) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'DELETE', headers: this._headers(),
    }));
    return r.ok;
  }

  // ── 인증 ─────────────────────────────────────────────────────────
  async oauthInitUrl(provider, callbackUrl) {
    const url = `${this.baseUrl}/oauth2/${this.dbName}/init`
      + `?provider=${encodeURIComponent(provider)}`
      + `&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`oauth init -> HTTP ${r.status}`);
    return (await r.json()).redirectUrl;
  }

  async authSignin(token) {
    // _getUserInfo() 가 reactive watcher / 컴포넌트 mount 등 다양한 경로로 자주
    // 호출되는데, 그때마다 매번 새 fetch 를 보내면 ES generator 가 도는 동안
    // 메인 스레드 점유 + connection pool 점유로 화면이 freeze 된다.
    // 같은 토큰에 대해 5분간 응답을 캐시하고, 동시 in-flight 요청은 같은 promise 로 dedup.
    if (this._signinCache && this._signinCache.token === token
        && Date.now() - this._signinCache.at < 5 * 60 * 1000) {
      return this._signinCache.user;
    }
    if (this._signinInflight && this._signinInflight.token === token) {
      return this._signinInflight.promise;
    }
    const promise = (async () => {
      const r = await fetch(`${this.baseUrl}/auth/${this.dbName}/signin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      });
      // 401 = 토큰 만료/무효. signOut shim 과 동일한 키 셋을 모두 제거해
      // 앱이 완전히 로그아웃 상태로 인식하게 만들고, alert + reload 로 사용자에게
      // 명확히 알림. dedupe (window._pgAuthExpiredAlerted) 로 alert 가 중복 안 뜨게.
      if (r.status === 401) {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem('accessToken');
            if (stored === token && !window._pgAuthExpiredAlerted) {
              window._pgAuthExpiredAlerted = true;
              // StorageBasePostgres._getRef('auth').signOut 와 동일한 키 셋.
              ['accessToken', 'gitToken', 'email', 'name', 'uid',
               'picture', 'providerUid'].forEach(function (k) {
                window.localStorage.removeItem(k);
              });
              // signin 캐시도 비워 다음 호출이 stale null 을 안 받게.
              this._signinCache = null;
              console.warn('[pgGateway] accessToken expired (401) — auth cleared. Redirecting to login.');
              // alert 후 페이지 reload → 로그인 화면으로 자연 유도.
              // setTimeout 으로 띄워 현재 진행 중인 promise chain 이 정리될 시간 확보.
              setTimeout(function () {
                try { window.alert('세션이 만료되었습니다. 다시 로그인해주세요.'); } catch (e) { /* noop */ }
                try { window.location.reload(); } catch (e) { /* noop */ }
              }, 0);
            }
          }
        } catch (e) { /* noop */ }
        return null;
      }
      if (!r.ok) return null;
      return (await r.json()).user;
    })();
    this._signinInflight = { token, promise };
    try {
      const user = await promise;
      this._signinCache = { token, user, at: Date.now() };
      return user;
    } finally {
      if (this._signinInflight && this._signinInflight.token === token) {
        this._signinInflight = null;
      }
    }
  }

  async authSignup(userInfo) {
    const r = await fetch(`${this.baseUrl}/auth/${this.dbName}/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo),
    });
    if (!r.ok) return null;
    return r.json();
  }

  // ── WebSocket (watch) ────────────────────────────────────────────
  _connectWs() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.wsReady = true;
        // 재연결 시 기존 구독 복구
        for (const [subId, s] of this.subs) this._sendWatch(subId, s);
      };
      this.ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString()); }
        catch (e) { return; }
        const s = this.subs.get(msg.id);
        if (s) {
          try { s.callback(msg); } catch (e) { /* 콜백 오류 격리 */ }
        }
      };
      this.ws.onclose = () => {
        this.wsReady = false;
        if (!this._wsClosed) setTimeout(() => this._connectWs(), 2000);
      };
      this.ws.onerror = () => { try { this.ws.close(); } catch (e) { /* noop */ } };
    } catch (e) {
      if (!this._wsClosed) setTimeout(() => this._connectWs(), 2000);
    }
  }

  _sendWatch(subId, s) {
    if (!this.wsReady) return;
    this.ws.send(JSON.stringify({
      action: 'watch', id: subId, path: s.path,
      watchType: s.watchType, startAt: s.startAt,
    }));
  }

  /** 구독 등록. callback 은 게이트웨이 메시지 {id,watchType,path,key?,value} 를 받는다. */
  subscribe(path, watchType, startAt, callback) {
    const subId = `s${++this._subSeq}`;
    const s = { path, watchType, startAt, callback };
    this.subs.set(subId, s);
    this._sendWatch(subId, s); // 아직 미연결이면 onopen 에서 복구
    return subId;
  }

  unsubscribe(subId) {
    if (!this.subs.has(subId)) return;
    this.subs.delete(subId);
    if (this.wsReady) {
      try { this.ws.send(JSON.stringify({ action: 'unwatch', id: subId })); }
      catch (e) { /* noop */ }
    }
  }

  get connected() {
    return this.wsReady;
  }

  close() {
    this._wsClosed = true;
    try { this.ws.close(); } catch (e) { /* noop */ }
  }
}
