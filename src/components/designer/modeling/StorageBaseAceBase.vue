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
                                } catch(e) {
                                    try {
                                        w.reference.off('value');
                                    } catch(_) {}
                                }
                                w.reference.on('value', w.handler);
                                
                                // 누락 보정: 현재값 강제 동기화
                                try {
                                    var v = await instance.get(path);
                                    w.userCallback(v !== null && v !== undefined ? v : null);
                                } catch(e) {
                                    // get 실패는 무시
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
                return await this._put(reference)
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

                if (!snapshots) return null;
                
                var data = snapshots.val();
                // jobs 경로는 LangGraph Proxy에서 복원하므로 여기서는 복원하지 않음
                // (Firebase와 동일한 동작: StorageBaseFireBase.watch()도 복원하지 않음)
                if (path.startsWith('jobs/') || path.includes('/jobs/')) {
                    return data;
                }
                // Firebase와 동일하게 마커 복원 처리
                return me._restoreDataFromStorage(data);
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
                    return Array.isArray(snapshots) && snapshots.length > 0
                        ? me.forwardChildren(snapshots)
                        : (Object.keys(snapshots).length > 0 ? snapshots.val() : null )
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
                    } catch(e) {
                        try {
                            me._watchCallbacks[path].reference.off('value');
                        } catch(_) {}
                    }
                    delete me._watchCallbacks[path];
                }

                // exists() 쓰지 말고 value로 판단
                var handler = function (snapshot){
                    var value = snapshot && typeof snapshot.val === 'function' ? snapshot.val() : null;
                    if (value === null || value === undefined) {
                        return userCallback(null);
                    }
                    if (isJobsPath) {
                        return userCallback(value);
                    } else {
                        var restoredValue = me._restoreDataFromStorage(value);
                        return userCallback(restoredValue);
                    }
                };

                // watch 정보를 저장 (userCallback 포함)
                if (!me._watchCallbacks) {
                    me._watchCallbacks = {};
                }
                me._watchCallbacks[path] = {
                    reference: reference,
                    handler: handler,
                    userCallback: userCallback
                };

                // 구독 등록
                reference.on('value', handler);

                // 최초 1회 정합성 보장(get)
                me.get(path).then(function(v) {
                    userCallback(v !== null && v !== undefined ? v : null);
                }).catch(function() {
                    userCallback(null);
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
