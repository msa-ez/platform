<template></template>

<script>
    import StorageBaseAceBase_ from "./StorageBaseAceBase_";
    // const db = new AceBaseClient({host: `${window.DB_HOST}`, port: `${window.DB_PORT}`, https: true, dbname: `${window.DB_NAME}`});
    export default {
        name: "storage-base-acebase",
        mixins: [StorageBaseAceBase_],
        data() {
            return {
                _watchCallbacks: {} // path -> {reference, callback} 매핑을 저장하여 재연결 시 복구
            }
        },
        created() {
            var me = this
            // WebSocket 재연결 시 모든 watch 구독 복구
            if (window.$acebase) {
                window.$acebase.on('connect', () => {
                    console.log('[StorageBaseAceBase] Reconnected, restoring watch subscriptions');
                    // 재연결 시 모든 watch 구독 복구
                    if (me._watchCallbacks && typeof me._watchCallbacks === 'object') {
                        Object.keys(me._watchCallbacks).forEach(path => {
                            var watchInfo = me._watchCallbacks[path];
                            if (watchInfo && watchInfo.reference && watchInfo.callback) {
                                me._watch(watchInfo.reference, watchInfo.callback);
                            }
                        });
                    }
                });
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
            watch(path, callback){
                var me = this
                var reference = window.$acebase.ref(path)

                // Firebase와 동일하게 동작: on('value')가 초기값과 변경사항을 모두 제공
                // AceBase의 on('value')는 초기값도 즉시 제공하므로 별도 get() 호출 불필요
                var watchCallback = function (snapshot){
                    if (snapshot && snapshot.exists()) {
                        var value = snapshot.val();
                        // jobs 경로는 LangGraph Proxy에서 복원하므로 여기서는 복원하지 않음
                        // (Firebase와 동일한 동작: StorageBaseFireBase.watch()도 복원하지 않음)
                        if (path.startsWith('jobs/') || path.includes('/jobs/')) {
                            callback(value)
                        } else {
                            var restoredValue = me._restoreDataFromStorage(value)
                            callback(restoredValue)
                        }
                    } else {
                        callback(null)
                    }
                };
                
                // watch 정보를 저장하여 재연결 시 복구할 수 있도록 함
                if (!me._watchCallbacks) {
                    me._watchCallbacks = {};
                }
                me._watchCallbacks[path] = {
                    reference: reference,
                    callback: watchCallback
                };
                
                me._watch(reference, watchCallback)
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

                    me._watch_added( reference, function (snapshot) {
                        if (snapshot && snapshot.exists()) {
                            var queue = snapshot.val()

                            if (typeof queue == 'boolean') {
                                var obj = {
                                    key: queue.key,
                                    value: queue
                                }
                                callback(obj)
                            } else if(typeof queue == 'string'){
                                var obj = {
                                    key: snapshot.key,
                                    value: queue
                                }
                                callback(obj)
                            } else {
                                queue.key = snapshot.key
                                callback(queue)
                            }
                        } else {
                            callback(null)
                        }
                    })
                }catch (e) {
                    console.log(e)
                }
            },
            watch_off(path){
                var me = this
                var watchInfo = me._watchCallbacks && me._watchCallbacks[path];
                var reference = watchInfo ? watchInfo.reference : window.$acebase.ref(path);
                if (me._watchCallbacks) {
                    delete me._watchCallbacks[path]; // watch 정보 정리
                }
                return this._watch_off(reference)
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
