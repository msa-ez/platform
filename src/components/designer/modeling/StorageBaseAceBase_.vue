<template></template>

<script>

    // db.auth.signIn('admin', '75sdDSFg37w5');
    // const { AceBaseClient } = require('acebase-client');
    export default {
        name: "storage-base-acebase_",
        data() {
            return {
                db: null
            }
        },
        created(){
            var me = this
            // const db = new AceBaseClient({ host: 'localhost', port: 5757, dbname: 'mydb', https: false });
            // db.ready(() => {
            //     console.log('Connected successfully');
            //     me.db = db
            //     // conso
            // });
        },
        methods: {
            _signIn(userInfo) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    userInfo.displayName = userInfo.username;
                    window.$acebase.auth.startAuthProviderSignIn(window.PROVIDER, `${window.location.protocol}//${window.location.host}/?oauth=acebase`)
                    .then(redirectUrl => {
                        window.location = redirectUrl; // Send user to auth provider's login screen
                    });
                })
            },
            _signUp(userInfo) {
                var me = this
                // acebase.auth.signIn('admin', '75sdDSFg37w5');
                return new Promise(function (resolve, reject) {
                    userInfo.displayName = userInfo.username;
                    window.$acebase.auth.signUp(userInfo).then(result => {
                        resolve(result)
                    }).catch(e => {
                        reject(e)
                    })
                })
            },
            _getRef(auth) {
                var me = this
                if (auth && auth == 'auth') {
                    return window.$acebase.auth
                } else if (auth && auth == 'db') {
                    // 수정필요
                    var reference = window.$acebase.ref()
                    return reference.query(reference.db)
                }
            },
            _getUserInfo() {
                var me = this
                return new Promise(async function (resolve, reject) {
                    if (window.localStorage.getItem("accessToken")){
                        try{
                            // var obj = {
                            //             name: "user",
                            //             email: "email@email.com",
                            //             uid: "xxxx-xxxx-xxxx-xxxx-xxxx",
                            //             // profile: result.user.picture,
                            //             // authorized: null,
                            //             accessToken: "electron-token",
                            //         }
                            //         resolve(obj)
                            window.$acebase.auth.signInWithToken(window.localStorage.getItem("accessToken"))
                                .then(result => {
                                    // ★ Gitea 지원: localStorage에서 providerUid와 picture 읽기 (provider별 필드 차이 대응)
                                    var providerUid = result.user.settings && result.user.settings.github_id 
                                        || result.user.settings && result.user.settings.gitea_sub
                                        || localStorage.getItem('providerUid');
                                    
                                    var profile = result.user.picture 
                                        || (result.user.settings && result.user.settings.github_avatar_url)
                                        || (result.user.settings && result.user.settings.gitea_avatar_url)
                                        || localStorage.getItem('picture');
                                    
                                    // picture가 객체인 경우 url 추출
                                    if (profile && typeof profile === 'object' && profile.url) {
                                        profile = profile.url;
                                    }
                                    
                                    var obj = {
                                        name: result.user.username ? result.user.username : result.user.displayName,
                                        email: result.user.email ? result.user.email : (result.user.settings && result.user.settings.github_login) || localStorage.getItem('email'),
                                        uid: result.user.uid,
                                        profile: profile,
                                        authorized: null,
                                        accessToken: result.accessToken,
                                        providerUid: providerUid
                                    }
                                    resolve(obj)
                                })
                        }catch (e) {
                            console.log('Error] AceBase _getUserInfo: ',e)
                            resolve(null)
                        }
                    } else {
                        resolve(null)
                    }
                })
            },
            _list(reference) {
                return new Promise(async function (resolve, reject) {
                    try{
                        // Firebase와 동일하게 shallow read를 위해 reflect('children') 사용
                        // 이렇게 하면 키만 가져오고 전체 데이터를 재귀적으로 가져오지 않음
                        const path = reference.path;
                        if (path && (path.includes('userLists') || path.includes('definitions'))) {
                            // 목록 조회의 경우 키만 먼저 가져오기
                            try {
                                const children = await reference.db.api.reflect(path, 'children', { limit: 1000 });
                                if (children && children.list && children.list.length > 0) {
                                    // 각 키에 대해 information 필드만 가져와서 객체로 구성
                                    const resultObj = {};
                                    const promises = children.list.map(async (child) => {
                                        const childRef = reference.child(child.key);
                                        return new Promise((resolveChild) => {
                                            // information 필드만 가져오기
                                            childRef.child('information').get((infoSnapshot) => {
                                                if (infoSnapshot && infoSnapshot.exists()) {
                                                    resultObj[child.key] = { information: infoSnapshot.val() };
                                                    resolveChild(true);
                                                } else {
                                                    // information이 없으면 전체를 가져오되, 이것은 예외 케이스
                                                    childRef.get((fullSnapshot) => {
                                                        if (fullSnapshot && fullSnapshot.exists()) {
                                                            resultObj[child.key] = fullSnapshot.val();
                                                            resolveChild(true);
                                                        } else {
                                                            resolveChild(false);
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    });
                                    
                                    await Promise.all(promises);
                                    
                                    // snapshot 형태로 반환 (val() 메서드가 resultObj를 반환하도록)
                                    resolve({
                                        val: () => resultObj,
                                        exists: () => Object.keys(resultObj).length > 0
                                    });
                                    return;
                                }
                            } catch (reflectError) {
                                console.log('AceBase reflect failed, falling back to get:', reflectError);
                                // reflect 실패 시 기존 방식으로 폴백
                            }
                        }
                        
                        // 기존 방식 (deep read) - reflect가 실패하거나 다른 경로인 경우
                        reference.get(snapshot => {
                            if (snapshot) {
                                resolve(snapshot)
                            } else {
                                resolve(null)
                            }
                        });
                    }catch (e) {
                        console.log('Error] AceBase _list: ',e)
                        resolve(null)
                    }
                })
            },
            _push(reference, value) {
                return new Promise(function (resolve, reject) {
                    var snapshots = null
                    try {
                        if(value){
                            reference
                            .push(value)
                            .then(userRef => {
                                resolve(userRef)
                            });
                        }else{
                            snapshots = reference.push()
                            resolve(snapshots)
                        }
                    } catch (e) {
                        console.log('Error] AceBase _push')
                        resolve(null)
                    }
                })
            },
            _delete(reference) {
                try{
                    reference.remove()
                        // .then(() => { /* removed successfully */ )};
                    return true
                }catch (e) {
                    console.log('Error] AceBase _delete: ', e)
                    return false
                }
            },
            _get(reference) {
                return new Promise(function (resolve, reject) {
                    try{
                        reference.get(snapshot => {
                            if (snapshot) {
                                resolve(snapshot)
                            } else {
                                resolve(null)
                            }
                        });
                    } catch (e) {
                        console.log('Error] AceBase _get: ', e)
                        resolve(null)
                    }
                })
            },
            _put(reference, value) {
                return new Promise(function (resolve, reject) {
                    try {
                        reference.update(value, (error) => {
                            if (error) {
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                    } catch (e) {
                        console.log('Error] AceBase _put: ', e)
                        resolve(false)
                    }
                })
            },
            _set(reference, value) {

                return new Promise(async function (resolve, reject) {
                    try {
                        reference.set(value, (error) => {
                            if (error) {
                                resolve(false)
                            } else {
                                resolve(true)
                            }
                        });
                    } catch (e) {
                        console.log('Error] AceBase _set: ', e)
                        resolve(false)
                    }
                })
            },
            _watch(reference, callback) {
                try{
                    reference.on('value', snapshot => {
                        if (snapshot) {
                            callback(snapshot)
                        } else {
                            callback(null)
                        }
                    })
                }catch (e) {
                    console.log('Error] AceBase _watch: ', e)
                    callback(undefined)
                }
            },
            _watch_added(reference, callback) {
                try{
                    reference
                        .on('child_added', (snapshot) =>{
                            if (snapshot) {
                                callback(snapshot)
                            } else {
                                callback(null)
                            }
                        })

                    // .on('child_added')
                    // .subscribe(snapshot => {
                    //     if (snapshot) {
                    //         callback(snapshot)
                    //     } else {
                    //         callback(null)
                    //     }
                    // });
                }catch (e) {
                    console.log('Error] AceBase _watch_added: ', e)
                    callback(undefined)
                }
            },
            _watch_off(reference) {
                reference.off('child_added')
                reference.off('value')
                reference.off('child_changed')
            },
            _isConnection(reference, callback){
                try{
                    reference.on("value", (snap) => {
                        if (snap.val() === false && navigator.onLine == false) {
                            callback(false)
                        }
                        callback(true)
                    });
                }catch (e) {
                    callback(undefined)
                    console.log('Error] AceBase _isConnection: ', e)
                }

            },
        }
    };
</script>
