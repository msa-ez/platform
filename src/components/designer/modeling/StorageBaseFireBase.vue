<template></template>

<script>
    import firebase from 'firebase'
    import StorageBaseFireBase_ from "./StorageBaseFireBase_";

    export default {
        name: "storage-base-firebase",
        mixins: [StorageBaseFireBase_],
        mounted() {
            // 테스트 함수들을 전역으로 등록
            this.registerGlobalTestFunctions();
        },
        created() {
            // created에서도 등록 (더 빨리 실행됨)
            this.registerGlobalTestFunctions();
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

                    var reference = firebase.database().ref(path)
                    var snapshots = await me._put(reference,parseString)

                    return snapshots ? snapshots : false
                } catch (e) {
                    //putString
                    var reference = firebase.database().ref(path)
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

                    var reference = firebase.database().ref(path)
                    var snapshots = await me._set(reference,parseString)

                    return snapshots ? snapshots : false

                } catch (e) {
                    //SetString
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._set(reference,string)

                    return snapshots ? snapshots : false
                }

            },
            async push(path, string, isString){
                try {
                    var me = this
                    //pushObject
                    var parseString = string
                    if (!isString) {
                        parseString = JSON.parse(parseString)
                    }
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._push(reference,parseString)

                    return snapshots ? snapshots.key : null
                } catch (e) {
                    //pushString
                    var reference = firebase.database().ref(path)
                    var snapshots = await me._push(reference,string)
                    return snapshots ? snapshots.key : null
                }
            },
            async get(path){
                var me = this
                var reference = firebase.database().ref(path);
                var snapshots = await me._get(reference)

                if(snapshots && snapshots.Error){
                    return snapshots;
                }

                return snapshots ? snapshots.val() : null
            },
            async list(path, metadata){
                var me = this
                
                // API 키 변경 확인 (테스트용)
                const apiKeyChanged = await me.checkApiKeyChange();
                if (apiKeyChanged) {
                    console.warn(`API 키 변경 감지됨. Path: ${path}`);
                    return null;
                }
                
                var reference = firebase.database().ref(path)

                if( metadata ){
                        // SORT
                        if (metadata.orderBy) {
                            reference = reference.orderByChild(metadata.orderBy)
                        } else {
                            reference = reference.orderByKey()
                        }

                        // RANGE
                        if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                            reference = reference.equalTo(metadata.startAt)
                        } else if( metadata.startAt && !metadata.endAt ){
                            // Start ~
                            reference = reference.startAt(metadata.startAt)
                        } else if( !metadata.startAt && metadata.endAt ){
                            // ~ END
                            reference = reference.endAt(metadata.endAt)
                        } else if( metadata.startAt && metadata.endAt ){
                            // Start ~ END
                            reference = reference.startAt(metadata.startAt)
                            reference = reference.endAt(metadata.endAt)
                        }

                        // SIZE && DIRECTION
                        if (metadata.size) {
                            if (metadata.sort && metadata.sort.includes('desc')) {
                                reference = reference.limitToLast(metadata.size)
                            } else {
                                reference = reference.limitToFirst(metadata.size)
                            }
                        }
                }

                var snapshots = await me._list(reference)

                if(snapshots && snapshots.ErrorCode){
                    console.warn(`Permission denied for path: ${path}`);
                    return null;
                }

                if( snapshots && metadata ){
                    if( metadata.sort && metadata.sort.includes('desc') ){
                        return me.reversedChildren(snapshots)
                    }else{
                        return me.forwardChildren(snapshots)
                    }
                }else{
                    return snapshots ? snapshots.val() : null
                }
            },
            watch(path, callback){
                var me = this
                var reference = firebase.database().ref(path);
                me._watch(reference,function (snapshot){
                    if (snapshot && snapshot.exists()) {
                        callback(snapshot.val())
                    }else{
                        callback(null)
                    }
                })
            },
            watch_added(path, metadata, callback){
                var me = this
                var reference = firebase.database().ref(path);

                if( metadata ){
                    // SORT
                    if (metadata.orderBy && metadata.orderBy.toLowerCase() != 'key') {
                        reference = reference.orderByChild(metadata.orderBy)
                    } else {
                        reference = reference.orderByKey()
                    }

                    // RANGE
                    if (me.isEqualTo(metadata.startAt, metadata.endAt)){
                        reference = reference.equalTo(metadata.startAt)
                    } else if( metadata.startAt && !metadata.endAt ){
                        // Start ~
                        reference = reference.startAt(metadata.startAt)
                    } else if( !metadata.startAt && metadata.endAt ){
                        // ~ END
                        reference = reference.endAt(metadata.endAt)
                    } else if( metadata.startAt && metadata.endAt ){
                        // Start ~ END
                        reference = reference.startAt(metadata.startAt)
                        reference = reference.endAt(metadata.endAt)
                    }
                }


                 me._watch_added( reference ,function (snapshot) {
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
            },
            isValidatePath(path){
                var me = this
                try{
                    var reference = firebase.database().ref(path);
                    return {status : true, msg: null}
                }catch(e){
                    return {status : false, msg: e.message }
                }
                // ".", "#", "$", "[", or "]"
            },
            watch_off(path){
                var me = this
                var reference = firebase.database().ref(path);
                me._watch_off(reference)
            },
            delete(path) {
                var me = this
                var reference = firebase.database().ref(path)
                return me._delete(reference)
            },
            isConnection(path, callback){
                var reference = firebase.database().ref(".info/connected");

                this._isConnection(reference, function (snapshot) {
                        callback(snapshot)
                })
            },
            /////////// Function ///////////
            forwardChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    if(child.key != "count"){
                        var val = child.val()
                        val.key = child.key
                        children.push(val);
                    }
                });
                return children;
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    if(child.key != "count"){
                        var val = child.val()
                        val.key = child.key
                        children.unshift(val);
                    }
                });
                return children;
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

            // ========== API 키 변경 감지 및 검증 로직 ==========
            async checkApiKeyChange() {
                const currentApiKey = process.env.VUE_APP_FIREBASE_apiKey;
                const storedApiKey = localStorage.getItem('firebase_api_key');
                
                console.log('Current API Key:', currentApiKey);
                console.log('Stored API Key:', storedApiKey);
                
                if (storedApiKey && storedApiKey !== currentApiKey) {
                    alert(`API 키가 변경되었습니다!\n이전: ${storedApiKey}\n현재: ${currentApiKey}`);
                    return true; // API 키가 변경됨
                }
                
                // Firebase ID 토큰 유효성 확인
                const isTokenValid = await this.checkFirebaseTokenValidity();
                if (!isTokenValid) {
                    alert('Firebase ID 토큰이 무효합니다. 재로그인이 필요합니다.');
                    return true;
                }
                
                // 유효한 경우는 조용히 통과 (alert 없음)
                console.log('API 키와 토큰이 유효합니다.');
                return false; // API 키 변경 없음
            },

            async checkFirebaseTokenValidity() {
                return new Promise((resolve) => {
                    firebase.auth().onAuthStateChanged(async (user) => {
                        if (!user) {
                            console.log('No user logged in');
                            resolve(false);
                            return;
                        }
                        
                        try {
                            const idToken = await user.getIdToken(true);
                            console.log('Firebase ID Token is valid:', idToken ? 'Yes' : 'No');
                            resolve(true);
                        } catch (error) {
                            console.log('Firebase ID Token validation failed:', error.code, error.message);
                            resolve(false);
                        }
                    });
                });
            },

            async testApiKeyValidation() {
                console.log('=== API 키 검증 테스트 시작 ===');
                
                // 1. 현재 API 키 저장
                const currentApiKey = process.env.VUE_APP_FIREBASE_apiKey;
                localStorage.setItem('firebase_api_key', currentApiKey);
                alert(`[테스트] 현재 API 키가 저장되었습니다: ${currentApiKey}`);
                
                // 2. Firebase Auth 상태 확인
                const authState = await this.getFirebaseAuthState();
                alert(`[테스트] Firebase Auth 상태: ${authState}`);
                
                // 3. 간단한 Firebase 읽기 테스트
                const readTest = await this.testFirebaseRead();
                alert(`[테스트] Firebase 읽기 테스트: ${readTest}`);
                
                // 4. API 키 변경 시뮬레이션 (테스트용)
                this.simulateApiKeyChange();
                
                // 5. API 키 검증 테스트 (실제 검증 로직)
                const apiKeyChanged = await this.checkApiKeyChange();
                if (apiKeyChanged) {
                    alert(`[테스트] API 키 변경이 감지되었습니다!`);
                } else {
                    alert(`[테스트] API 키와 토큰이 정상입니다.`);
                }
                
                console.log('=== API 키 검증 테스트 완료 ===');
            },

            // 브라우저 콘솔에서 테스트할 수 있도록 전역 함수 등록
            registerGlobalTestFunctions() {
                window.testApiKeyValidation = () => this.testApiKeyValidation();
                window.checkApiKeyChange = () => this.checkApiKeyChange();
                window.testFirebaseRead = () => this.testFirebaseRead();
                window.getFirebaseAuthState = () => this.getFirebaseAuthState();
                window.simulateApiKeyChange = () => this.simulateApiKeyChange();
                window.testApiKeyCheckWithAlert = () => this.testApiKeyCheckWithAlert();
                
                console.log('테스트 함수들이 전역으로 등록되었습니다:');
                console.log('- testApiKeyValidation() : 전체 테스트 실행');
                console.log('- checkApiKeyChange() : API 키 변경 확인 (조용히)');
                console.log('- testApiKeyCheckWithAlert() : API 키 변경 확인 (alert 포함)');
                console.log('- testFirebaseRead() : Firebase 읽기 테스트');
                console.log('- getFirebaseAuthState() : Firebase Auth 상태 확인');
                console.log('- simulateApiKeyChange() : API 키 변경 시뮬레이션');
            },

            // API 키 검증을 alert와 함께 테스트하는 함수
            async testApiKeyCheckWithAlert() {
                console.log('=== API 키 검증 테스트 (Alert 포함) ===');
                
                const currentApiKey = process.env.VUE_APP_FIREBASE_apiKey;
                const storedApiKey = localStorage.getItem('firebase_api_key');
                
                alert(`현재 API 키: ${currentApiKey}\n저장된 API 키: ${storedApiKey || '없음'}`);
                
                if (storedApiKey && storedApiKey !== currentApiKey) {
                    alert(`❌ API 키가 변경되었습니다!\n이전: ${storedApiKey}\n현재: ${currentApiKey}`);
                    return true;
                }
                
                // Firebase ID 토큰 유효성 확인
                const isTokenValid = await this.checkFirebaseTokenValidity();
                if (!isTokenValid) {
                    alert(`❌ Firebase ID 토큰이 무효합니다. 재로그인이 필요합니다.`);
                    return true;
                }
                
                alert(`✅ API 키와 토큰이 모두 유효합니다!`);
                return false;
            },

            async getFirebaseAuthState() {
                return new Promise((resolve) => {
                    firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                            const email = user.email || (user.providerData && user.providerData[0] && user.providerData[0].email);
                            resolve(`로그인됨 - UID: ${user.uid}, Email: ${email}`);
                        } else {
                            resolve('로그인되지 않음');
                        }
                    });
                });
            },

            async testFirebaseRead() {
                try {
                    // 간단한 읽기 테스트 (configs는 모든 인증된 사용자가 읽을 수 있어야 함)
                    const snapshot = await firebase.database().ref('configs').once('value');
                    return `성공 - 데이터 존재: ${snapshot.exists()}`;
                } catch (error) {
                    return `실패 - 에러 코드: ${error.code}, 메시지: ${error.message}`;
                }
            },

            simulateApiKeyChange() {
                // 테스트용: API 키 변경 시뮬레이션
                const fakeApiKey = 'test_api_key_' + Date.now();
                localStorage.setItem('firebase_api_key', fakeApiKey);
                alert(`[테스트] API 키 변경 시뮬레이션 완료: ${fakeApiKey}`);
            },

            async handleApiKeyChange() {
                alert('API 키가 변경되었습니다. 재로그인이 필요합니다.');
                
                // 로그인 다이얼로그 표시
                if (window.$app && window.$app.loginDialog !== undefined) {
                    window.$app.loginDialog = true;
                }
            },

            // ========== 기존 메서드에 API 키 검증 추가 ==========
            async listWithApiKeyCheck(path, metadata) {
                // API 키 변경 확인
                const apiKeyChanged = await this.checkApiKeyChange();
                if (apiKeyChanged) {
                    await this.handleApiKeyChange();
                    return null;
                }
                
                // 기존 list 메서드 실행
                return await this.list(path, metadata);
            },

            async getWithApiKeyCheck(path) {
                // API 키 변경 확인
                const apiKeyChanged = await this.checkApiKeyChange();
                if (apiKeyChanged) {
                    await this.handleApiKeyChange();
                    return null;
                }
                
                // 기존 get 메서드 실행
                return await this.get(path);
            }
        }
    };
</script>
