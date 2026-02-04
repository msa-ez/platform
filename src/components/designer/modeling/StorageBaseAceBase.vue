<template></template>

<script>
    import StorageBaseAceBase_ from "./StorageBaseAceBase_";
    // const db = new AceBaseClient({host: `${window.DB_HOST}`, port: `${window.DB_PORT}`, https: true, dbname: `${window.DB_NAME}`});
    export default {
        name: "storage-base-acebase",
        mixins: [StorageBaseAceBase_],
        data() {
            return {
                _watchCallbacks: {}, // path -> {reference, handler, userCallback} 매핑을 저장하여 재연결 시 복구
                _watchAddedCallbacks: {}, // path -> {reference, handler, userCallback, metadata} 매핑을 저장하여 재연결 시 복구
                _watchAddedSeenKeys: {} // path -> {key: true} 매핑을 저장하여 중복 방지
            }
        },
        created() {
            var me = this
            // WebSocket 재연결 시 모든 watch 구독 복구 + resync (전역 훅은 한 번만 등록)
            if (window.$acebase && !window.__acebaseWatchReconnectHooked) {
                window.__acebaseWatchReconnectHooked = true;
                
                window.$acebase.on('connect', function() {
                    console.log('[StorageBaseAceBase] connected/reconnected -> resubscribe + resync');
                    
                    // 모든 StorageBaseAceBase 인스턴스의 watch 복구
                    if (window.__acebaseWatchInstances) {
                        window.__acebaseWatchInstances.forEach(function(instance) {
                            if (!instance || !instance._watchCallbacks) return;
                            
                            // watch(value) 복구
                            Object.keys(instance._watchCallbacks || {}).forEach(async function(path) {
                                var w = instance._watchCallbacks[path];
                                if (!w) return;
                                
                                // 재구독 (중복 방지: 기존 핸들러 off 후 on)
                                try {
                                    w.reference.off('value', w.handler);
                                    if (w.timer) {
                                        clearTimeout(w.timer);
                                        w.timer = null;
                                    }
                                } catch(e) {
                                    try {
                                        w.reference.off('value');
                                    } catch(_) {}
                                }
                                
                                // 1) 먼저 구독 등록 (레이스 방지)
                                w.reference.on('value', w.handler);
                                
                                // 2) 누락 보정: 현재값 강제 동기화 (재연결이므로 grace period 없이 바로 전달)
                                try {
                                    var v = await instance.get(path);
                                    if (v !== null && v !== undefined) {
                                        // 값이 있으면 즉시 전달 (실시간 업데이트)
                                        w.userCallback(v);
                                    }
                                    // null이면 전달하지 않음 (이미 구독 중이므로 값이 생기면 handler가 처리)
                                } catch(e) {
                                    // get 실패는 무시 (구독은 계속 작동)
                                }
                            });
                            
                            // watch_added(child_added) 복구
                            Object.keys(instance._watchAddedCallbacks || {}).forEach(async function(path) {
                                var w = instance._watchAddedCallbacks[path];
                                if (!w) return;
                                
                                // 재구독 (중복 방지: 기존 핸들러 off 후 on)
                                try {
                                    w.reference.off('child_added', w.handler);
                                } catch(e) {
                                    try {
                                        w.reference.off('child_added');
                                    } catch(_) {}
                                }
                                
                                // seenKeys 리셋 (재연결 시 서버 상태를 기준으로 재동기화)
                                if (!instance._watchAddedSeenKeys) {
                                    instance._watchAddedSeenKeys = {};
                                }
                                instance._watchAddedSeenKeys[path] = {};
                                
                                // 먼저 구독 등록 (레이스 컨디션 방지)
                                w.reference.on('child_added', w.handler);
                                
                                // 누락 보정: list()로 전체 데이터 다시 로드 (dedup 포함)
                                try {
                                    var items = await instance.list(path, w.metadata);
                                    if (Array.isArray(items)) {
                                        items.forEach(function(item) {
                                            if (item && item.key) {
                                                // dedup: 이미 본 key는 스킵 (child_added에서 이미 처리했을 수 있음)
                                                if (instance._watchAddedSeenKeys[path][item.key]) return;
                                                instance._watchAddedSeenKeys[path][item.key] = true;
                                                w.userCallback(item);
                                            }
                                        });
                                    }
                                } catch(e) {
                                    // list 실패는 무시
                                }
                            });
                        });
                    }
                });
            }
            
            // 인스턴스를 전역 배열에 등록 (중복 방지)
            if (!window.__acebaseWatchInstances) {
                window.__acebaseWatchInstances = [];
            }
            if (!window.__acebaseWatchInstances.includes(this)) {
                window.__acebaseWatchInstances.push(this);
            }
        },
        beforeDestroy() {
            // 인스턴스 제거 시 전역 배열에서도 제거
            if (window.__acebaseWatchInstances) {
                var index = window.__acebaseWatchInstances.indexOf(this);
                if (index > -1) {
                    window.__acebaseWatchInstances.splice(index, 1);
                }
            }
        },
        methods:{
            async put(path, string, isString){
                var me = this

                try {
                    //putObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }

                    var reference = window.$acebase.ref(path)
                    var snapshots = await me._put(reference,parseString)

                    return snapshots ? snapshots : false
                } catch (e) {
                    //putString
                    var reference = window.$acebase.ref(path)
                    var snapshots = await me._put(reference,string)

                    return snapshots ? snapshots : false
                }
            },
            async set(path,string,isString){
                var me = this

                try {
                    //setObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }

                    var reference = window.$acebase.ref(path)
                    var snapshots = await me._set(reference,parseString)

                    return snapshots ? snapshots : false

                } catch (e) {
                    //SetString
                    var reference = window.$acebase.ref(path)
                    var snapshots = await me._set(reference,string)

                    return snapshots ? snapshots : false
                }
            },
            async push(path, string, isString){
                var me = this

                try {
                    //pushObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }

                    var reference = window.$acebase.ref(path)
                    // var snapshots = await me._push(reference,parseString)

                    // push Key 미리 생성후 삽입
                    const snapshots = await me._push(reference)
                    parseString.key = snapshots.key
                    var pushPath = `${reference.path}/${snapshots.key}`
                    reference = window.$acebase.ref(pushPath)
                    await me._set(reference,parseString)


                    return snapshots ? snapshots.key : null
                } catch (e) {
                    //pushString
                    var reference = window.$acebase.ref(path)
                    var snapshots = await me._push(reference,string)
                    return snapshots ? snapshots.key : null
                }
            },
            async get(path){
                var me = this
                var reference = window.$acebase.ref(path);
                var snapshots = await me._get(reference)

                return snapshots ? snapshots.val() : null
            },
            
            /**
             * Storage에서 가져온 데이터를 원본 형태로 복원 (Firebase 호환)
             * @param {*} data Storage에서 가져온 데이터
             * @returns {*} 복원된 데이터
             */
            _restoreDataFromStorage(data) {
                if (data === null || data === undefined) {
                    return data;
                }
                
                // 🔥 루트 레벨 마커만 처리 (중첩 객체/배열에서는 마커 판별 안 함)
                if (data === "@") {
                    return null;  // 빈 문자열 → null
                }
                if (Array.isArray(data) && data.length === 1 && data[0] === "@") {
                    return [];  // 마커 → 빈 배열
                }
                if (
                    typeof data === 'object' &&
                    data !== null &&
                    !Array.isArray(data) &&
                    Object.keys(data).length === 1 &&
                    data["@"] === true
                ) {
                    return {};  // 마커 객체 → 빈 객체
                }
                
                // 중첩된 객체/배열은 마커 판별 없이 재귀적으로 처리
                const processValue = (value) => {
                    if (Array.isArray(value)) {
                        return value.map(item => processValue(item));
                    }
                    if (typeof value === 'object' && value !== null) {
                        const result = {};
                        for (const [k, v] of Object.entries(value)) {
                            result[k] = processValue(v);
                        }
                        return result;
                    }
                    return value;
                };
                
                return processValue(data);
            },
            async list(path, metadata){
                var me = this


                var reference = window.$acebase.ref(path)

                if(metadata){
                    reference = reference.query(reference.db)

                    var orderByKey = metadata.orderBy ? metadata.orderBy : 'key'

                    // SORT
                    if (metadata.sort && metadata.sort.includes('desc')) {
                        reference = reference.sort(orderByKey, false)
                    }else{
                        reference = reference.sort(orderByKey)
                    }

                    // RANGE
                    if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                        reference = reference.filter(orderByKey, '==', metadata.startAt)
                    } else if( metadata.startAt && !metadata.endAt ){
                        // Start ~
                        reference = reference.filter(orderByKey, '>=', metadata.startAt)
                    } else if( !metadata.startAt && metadata.endAt ){
                        // ~ END
                        reference = reference.filter(orderByKey, '<=', metadata.endAt)
                    } else if( metadata.startAt && metadata.endAt ){
                        // Start ~ END
                        reference = reference.filter(orderByKey, '<=', metadata.endAt)
                        reference = reference.filter(orderByKey, '>=', metadata.startAt)
                    }

                    // SIZE && DIRECTION
                    if (metadata.size) {
                        reference = reference.take(metadata.size)
                    }
                }

                var snapshots = await me._list(reference)

                if( snapshots && metadata ){
                    return me.forwardChildren(snapshots)
                }else{
                    // snapshot 객체인 경우 (reflect로 최적화된 경우)
                    if (snapshots && typeof snapshots.val === 'function') {
                        const val = snapshots.val();
                        return val && Object.keys(val).length > 0 ? val : null;
                    }
                    // 배열인 경우
                    if (Array.isArray(snapshots) && snapshots.length > 0) {
                        return me.forwardChildren(snapshots);
                    }
                    // 기존 방식 (snapshot 객체)
                    if (snapshots && snapshots.val) {
                        const val = snapshots.val();
                        return val && Object.keys(val).length > 0 ? val : null;
                    }
                    return null;
                }
            },
            isValidatePath(path){
                var me = this
                try{
                    var reference = window.$acebase.ref(path);
                    return {status : true, msg: null}
                }catch(e){
                    return {status : false, msg: e.message }
                }
                // ".", "#", "$", "[", or "]"
            },
            watch(path, userCallback){
                var me = this
                var reference = window.$acebase.ref(path)
                var isJobsPath = path.startsWith('jobs/') || path.includes('/jobs/');

                // 기존 구독 있으면 먼저 정리
                if (me._watchCallbacks && me._watchCallbacks[path]) {
                    try {
                        me._watchCallbacks[path].reference.off('value', me._watchCallbacks[path].handler);
                        if (me._watchCallbacks[path].timer) {
                            clearTimeout(me._watchCallbacks[path].timer);
                        }
                    } catch(e) {
                        try {
                            me._watchCallbacks[path].reference.off('value');
                        } catch(_) {}
                    }
                    delete me._watchCallbacks[path];
                }

                // grace period 동안 null을 확정하지 않기 위한 플래그 (초기값 중복 방지용)
                var initialDelivered = false;
                var timer = null;

                // 초기값 전달 함수 (초기값만 중복 방지)
                var emitInitial = function(v) {
                    if (initialDelivered) return;
                    initialDelivered = true;
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    userCallback(v);
                };

                // exists() 쓰지 말고 value로 판단
                // on('value') 핸들러 - 실시간 업데이트는 계속 전달해야 함
                var handler = function (snapshot){
                    var value = snapshot && typeof snapshot.val === 'function' ? snapshot.val() : null;
                    if (value === null || value === undefined) {
                        // on('value')에서 null이 와도 즉시 확정하지 않음 (grace period 후 확정)
                        return;
                    }
                    
                    // 값이 있으면 전달
                    var finalValue = isJobsPath ? value : me._restoreDataFromStorage(value);
                    
                    if (!initialDelivered) {
                        // 초기값이 아직 안 왔으면 이게 초기값
                        emitInitial(finalValue);
                    } else {
                        // 이미 초기값이 전달됐으면, 이건 실시간 업데이트 → 직접 콜백 호출
                        userCallback(finalValue);
                    }
                };

                // watch 정보를 저장 (userCallback, timer 포함)
                if (!me._watchCallbacks) {
                    me._watchCallbacks = {};
                }
                me._watchCallbacks[path] = {
                    reference: reference,
                    handler: handler,
                    userCallback: userCallback,
                    timer: null,
                    initialDelivered: false
                };

                // 1) 먼저 구독을 등록 (레이스 방지: 데이터 생성 이벤트를 놓치지 않음)
                reference.on('value', handler);

                // 2) get()으로 초기값 확인 (null이면 grace period 후 확정)
                me.get(path).then(function(v) {
                    if (v !== null && v !== undefined) {
                        // 값이 있으면 즉시 전달
                        emitInitial(v);
                    } else {
                        // null이면 500ms 동안 기다렸다가 값이 안 오면 null 확정
                        // (이 사이 on('value')로 값이 오면 그게 우선됨)
                        timer = setTimeout(function() {
                            if (!initialDelivered) {
                                emitInitial(null);
                            }
                        }, 500);
                        me._watchCallbacks[path].timer = timer;
                    }
                }).catch(function(err) {
                    // get 실패 시에도 grace period 후 null 확정
                    timer = setTimeout(function() {
                        if (!initialDelivered) {
                            emitInitial(null);
                        }
                    }, 500);
                    me._watchCallbacks[path].timer = timer;
                });
            },
            watch_added(path, metadata, callback){
                var me = this

                try{
                    var reference = window.$acebase.ref(path)

                    if(metadata){
                        // metadata all null check
                        if (metadata.orderBy) {
                            if (metadata.sort && metadata.sort.includes('desc')) {
                                reference = reference.sort(metadata.orderBy, false)
                            }else{
                                reference = reference.sort(metadata.orderBy, true)
                            }
                        }

                        // RANGE
                        var filterKey = metadata.orderBy ? metadata.orderBy : null

                        if(filterKey){
                            if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                                reference = reference.filter(filterKey, '==', metadata.startAt)
                            } else if( metadata.startAt && !metadata.endAt ){
                                // Start ~
                                reference = reference.filter(filterKey, '>=', metadata.startAt)
                            } else if( !metadata.startAt && metadata.endAt ){
                                // ~ END
                                reference = reference.filter(filterKey, '<=', metadata.endAt)
                            } else if( metadata.startAt && metadata.endAt ){
                                // Start ~ END
                                reference = reference.filter(filterKey, '>=', metadata.startAt)
                                reference = reference.filter(filterKey, '<=', metadata.endAt)
                            }
                        }
                    }

                    // 기존 구독 있으면 먼저 정리
                    if (me._watchAddedCallbacks && me._watchAddedCallbacks[path]) {
                        try {
                            me._watchAddedCallbacks[path].reference.off('child_added', me._watchAddedCallbacks[path].handler);
                        } catch(e) {
                            try {
                                me._watchAddedCallbacks[path].reference.off('child_added');
                            } catch(_) {}
                        }
                        delete me._watchAddedCallbacks[path];
                    }
                    
                    // seen keys 초기화
                    if (!me._watchAddedSeenKeys) {
                        me._watchAddedSeenKeys = {};
                    }
                    if (!me._watchAddedSeenKeys[path]) {
                        me._watchAddedSeenKeys[path] = {};
                    }

                    var handler = function (snapshot) {
                        if (snapshot && snapshot.exists()) {
                            var key = snapshot.key;
                            if (!key) {
                                callback(null);
                                return;
                            }
                            
                            // dedup: 이미 본 key는 스킵
                            if (me._watchAddedSeenKeys[path][key]) {
                                return;
                            }
                            me._watchAddedSeenKeys[path][key] = true;
                            
                            var queue = snapshot.val();

                            if (typeof queue == 'boolean') {
                                var obj = {
                                    key: key,
                                    value: queue
                                }
                                callback(obj)
                            } else if(typeof queue == 'string'){
                                var obj = {
                                    key: key,
                                    value: queue
                                }
                                callback(obj)
                            } else {
                                queue.key = key
                                callback(queue)
                            }
                        } else {
                            callback(null)
                        }
                    };

                    // watch_added 정보를 저장 (userCallback 포함)
                    if (!me._watchAddedCallbacks) {
                        me._watchAddedCallbacks = {};
                    }
                    me._watchAddedCallbacks[path] = {
                        reference: reference,
                        handler: handler,
                        userCallback: callback,
                        metadata: metadata
                    };

                    // 1) 먼저 child_added 구독 등록 (레이스 컨디션 방지)
                    reference.on('child_added', handler);
                    
                    // 2) 그 다음 list로 초기 데이터 로드 (dedup으로 중복 제거)
                    me.list(path, metadata).then(function(items) {
                        if (Array.isArray(items)) {
                            items.forEach(function(item) {
                                if (item && item.key) {
                                    // dedup: 이미 본 key는 스킵 (child_added에서 이미 처리했을 수 있음)
                                    if (me._watchAddedSeenKeys[path][item.key]) return;
                                    me._watchAddedSeenKeys[path][item.key] = true;
                                    callback(item);
                                }
                            });
                        }
                    }).catch(function() {
                        // list 실패는 무시
                    });
                }catch (e) {
                    console.log(e)
                }
            },
            watch_changed(path, callback) {
                var me = this
                var reference = window.$acebase.ref(path);
                
                // child_changed 이벤트 리스너 등록
                reference.on('child_changed', function(snapshot) {
                    if (snapshot && snapshot.exists && snapshot.exists()) {
                        var value = snapshot.val();
                        var key = snapshot.key;
                        // Firebase와 동일한 시그니처: callback(value, key)
                        callback(value, key);
                    }
                });
            },
            watch_off(path){
                var me = this
                var w = me._watchCallbacks && me._watchCallbacks[path];
                if (w) {
                    try {
                        w.reference.off('value', w.handler);
                    } catch(e) {
                        try {
                            w.reference.off('value');
                        } catch(_) {}
                    }
                    delete me._watchCallbacks[path];
                }
                
                // watch_added도 해제
                var wAdded = me._watchAddedCallbacks && me._watchAddedCallbacks[path];
                if (wAdded) {
                    try {
                        wAdded.reference.off('child_added', wAdded.handler);
                    } catch(e) {
                        try {
                            wAdded.reference.off('child_added');
                        } catch(_) {}
                    }
                    delete me._watchAddedCallbacks[path];
                    // seen keys도 정리
                    if (me._watchAddedSeenKeys && me._watchAddedSeenKeys[path]) {
                        delete me._watchAddedSeenKeys[path];
                    }
                }
                
                // 없으면 그냥 off 시도
                if (!w && !wAdded) {
                    try {
                        var ref = window.$acebase.ref(path);
                        ref.off('value');
                        ref.off('child_added');
                    } catch(e) {}
                }
                return true;
            },
            delete(path){
                var me = this
                
                var reference = window.$acebase.ref(path);
                return this._delete(reference)
            },
            isConnection(path,callback){
                var me = this
                // 'disconnected'|'connecting'|'connected'|'disconnecting';
                if(window.$acebase.connectionState == 'connecting' ||  window.$acebase.connectionState == 'connected'){
                    callback(true)
                }else{
                    callback(false)
                }
            },

            /////////// Function ///////////
            forwardChildren(snapshot) {
                var children = [];
                if(snapshot.length > 0){
                    snapshot.forEach(function (child) {
                        if(child.key != "count"){
                            var val = child.val()
                            val.key = child.key
                            children.push(val);
                        }
                    });
                    return children;
                }
               return null;
            },
            reversedChildren(snapshot) {
                var children = [];
                if(snapshot.length > 0){
                    snapshot.forEach(function (child) {
                        if(child.key != "count"){
                            var val = child.val()
                            val.key = child.key
                            children.unshift(val);
                        }
                    });
                    return children;
                }
                return null;
            },
            isEqualTo(a, b){
                try{
                    if(a && b){
                        return String(a).toLowerCase() == String(b).toLowerCase()
                    }
                    return false
                }catch (e) {
                    return false
                }
            },
            _getServerTimestamp() {
                return Date.now();
            },


        }
    };
</script>
