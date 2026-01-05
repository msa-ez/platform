<template></template>

<script>
    import StorageBaseAceBase_ from "./StorageBaseAceBase_";
    // const db = new AceBaseClient({host: `${window.DB_HOST}`, port: `${window.DB_PORT}`, https: true, dbname: `${window.DB_NAME}`});
    export default {
        name: "storage-base-acebase",
        mixins: [StorageBaseAceBase_],
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
                
                const processValue = (value) => {
                    if (value === "@") {
                        return null;  // 빈 문자열 → null
                    } else if (Array.isArray(value) && value.length === 1 && value[0] === "@") {
                        return [];  // 마커 → 빈 배열
                    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
                               Object.keys(value).length === 1 && value["@"] === true) {
                        return {};  // 마커 객체 → 빈 객체
                    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        // 객체인 경우 재귀적으로 처리
                        const result = {};
                        for (const [k, v] of Object.entries(value)) {
                            result[k] = processValue(v);
                        }
                        return result;
                    } else if (Array.isArray(value)) {
                        // 배열인 경우 각 요소를 재귀적으로 처리
                        return value.map(item => processValue(item));
                    } else {
                        return value;
                    }
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
                
                // 초기값이 전달되었는지 추적
                var initialValueReceived = false
                var initialValueTimeout = setTimeout(function() {
                    // 500ms 내에 초기값이 오지 않으면 직접 가져오기 (안전장치)
                    if (!initialValueReceived) {
                        console.log('AceBase watch: initial value not received, fetching directly for:', path)
                        me.get(path).then(function(initialValue) {
                            if (initialValue !== null && initialValue !== undefined) {
                                callback(initialValue)
                            }
                        }).catch(function(err) {
                            console.log('Error getting initial value for watch:', err)
                        })
                    }
                }, 500)

                // 변경사항 감시 (Firebase와 동일하게 snapshot.exists() 확인)
                me._watch(reference, function (snapshot){
                    if (snapshot) {
                        initialValueReceived = true
                        clearTimeout(initialValueTimeout)
                        console.log('AceBase watch triggered:', snapshot.ref.path)
                        // snapshot.exists() 확인 (Firebase와 동일)
                        if (snapshot.exists && snapshot.exists()) {
                            var value = snapshot.val()
                            var restoredValue = me._restoreDataFromStorage(value)
                            callback(restoredValue)
                        } else {
                            callback(null)
                        }
                    }else{
                        initialValueReceived = true
                        clearTimeout(initialValueTimeout)
                        callback(null)
                    }
                })
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
                var reference = window.$acebase.ref(path);
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
