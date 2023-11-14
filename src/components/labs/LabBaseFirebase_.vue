<template></template>

<script>
    import firebase from 'firebase'

    export default {
        name: "LabBaseFirebase",


        methods: {
            watch_added(path, metadata, callback) {
                var starCountRef = firebase.database().ref(path);
                starCountRef.on("child_added", function (snapshot, key) {
                    if (snapshot.val()) {
                        callback(snapshot.val(), snapshot.key)
                    }
                });
            },
            // watch_option_added(path, metadata, callback) {
            //     // sort: "desc",
            //     //     orderBy: 'child://lastModifiedDate',
            //     //     size: me.itemsPerPage,
            //     //     startAt: null,
            //     //     endAt: null,
            //     //
            //     var reference = firebase.database().ref(path);
            //
            //     if (metadata) {
            //
            //         // sort
            //         if (metadata.orderBy && metadata.orderBy.includes('child://')) {
            //             var orderString = metadata.orderBy.split('://')[1]
            //             reference = reference.orderByChild(orderString)
            //         } else {
            //             reference = reference.orderByKey()
            //         }
            //
            //
            //         if (metadata.startAt) {
            //             if (typeof metadata.startAt == 'string') {
            //                 if (!metadata.startAt.includes('equalTo://')) {
            //                     reference = reference.startAt(metadata.startAt)
            //                 }
            //             } else {
            //                 reference = reference.startAt(metadata.startAt)
            //             }
            //         }
            //
            //         if (metadata.endAt) {
            //             if (typeof metadata.endAt == 'string') {
            //                 if (!metadata.endAt.includes('equalTo://')) {
            //                     reference = reference.endAt(metadata.endAt)
            //                 }
            //             } else {
            //                 reference = reference.endAt(metadata.endAt)
            //             }
            //         }
            //
            //
            //         //startAt && endAt 모두 세팅시 size 필요 없음
            //         if (!(metadata.startAt && metadata.endAt)) {
            //             if ((typeof metadata.startAt == 'string' && metadata.startAt.includes('equalTo://')) ||
            //                 (typeof metadata.endAt == 'string' && metadata.endAt.includes('equalTo://'))
            //             ) {
            //                 if (metadata.startAt) {
            //                     var equalString = metadata.startAt.split('://')[1]
            //                 } else {
            //                     var equalString = metadata.endAt.split('://')[1]
            //                 }
            //                 reference = reference.equalTo(equalString)
            //                 if (metadata.size) {
            //                     if (metadata.sort && metadata.sort.includes('asc')) {
            //                         reference = reference.limitToFirst(metadata.size)
            //                     } else {
            //                         reference = reference.limitToLast(metadata.size)
            //                     }
            //                 }
            //             } else if (metadata.size) {
            //                 if (typeof metadata.size == 'number') {
            //                     if (metadata.sort && metadata.sort.includes('asc')) {
            //                         // reference = reference.limitToLast(metadata.size)
            //                         reference = reference.limitToFirst(metadata.size)
            //                     } else {
            //                         // reference = reference.limitToFirst(metadata.size)
            //                         reference = reference.limitToLast(metadata.size)
            //                     }
            //                 } else {
            //                     if (metadata.size.includes('first://')) {
            //                         var getSize = metadata.size.split('://')[1]
            //                         reference = reference.limitToFirst(getSize)
            //                     } else {
            //                         var getSize = metadata.size.split('://')[1]
            //                         reference = reference.limitToLast(getSize)
            //                     }
            //                 }
            //             }
            //         }
            //         reference.on('child_added', function (snapshot) {
            //             if (snapshot.exists()) {
            //                 var queue = snapshot.val()
            //                 if (typeof queue == 'boolean') {
            //                     var obj = {
            //                         key: snapshot.key,
            //                         value: queue
            //                     }
            //                     callback(obj)
            //                 }else{
            //                     queue.key = snapshot.key
            //                     callback(queue)
            //                 }
            //             } else {
            //                 callback(null)
            //             }
            //         });
            //     }
            // },
             watch_changed(path, callback) {
                var starCountRef = firebase.database().ref(path);
                starCountRef.on("child_changed", function (snapshot, key) {
                    if (snapshot.val()) {
                        callback(snapshot.val(), snapshot.key)
                    }
                });
            },
            _list(path, metadata) {
                return this.firebase_list(path, metadata);
            },
            async _get(path) {
                var me = this
                var starCountRef = firebase.database().ref(path);
                return new Promise(function (resolve, reject) {
                    starCountRef.once('value', function (snapshot) {
                        resolve(snapshot.val())
                    });
                })
            },
            _push(path, string) {
                return this.firebase_push(path, string)
            },
            _put(path, string) {
                return this.firebase_put(path, string)
            },
            _delete(path) {
                return this.firebase_delete(path)
            },
            firebase_list(path, metadata) {
                var starCountRef = firebase.database().ref(path);
                return new Promise(function (resolve, reject) {
                    starCountRef.once('value', function (snapshot) {
                        resolve(snapshot.val())
                    });
                })
            },
            firebase_option_list(path, metadata) {
                
                // orderBy: "key", "child://value"
                // size: 1
                // sort: "desc"
                // startAt: null
                // endAt: null

                var reference = firebase.database().ref(path)
                var totalCount = 0

                return new Promise(function (resolve, reject) {

                    if (metadata) {

                        if (typeof metadata == 'string' && metadata == 'snapshots') {
                            reference
                                .once('value', function (snapshots) {
                                    if (snapshots.exists()) {
                                        resolve(snapshots)
                                    } else {
                                        resolve(null)
                                    }
                                });
                        } else {

                            // sort
                            if (metadata.orderBy && metadata.orderBy.includes('child://')) {
                                var orderString = metadata.orderBy.split('://')[1]
                                reference = reference.orderByChild(orderString)
                            } else {
                                reference = reference.orderByKey()
                            }


                            if (metadata.startAt) {
                                if (typeof metadata.startAt == 'string') {
                                    if (!metadata.startAt.includes('equalTo://')) {
                                        reference = reference.startAt(metadata.startAt)
                                    }
                                } else {
                                    reference = reference.startAt(metadata.startAt)
                                }
                            }

                            if (metadata.endAt) {
                                if (typeof metadata.endAt == 'string') {
                                    if (!metadata.endAt.includes('equalTo://')) {
                                        reference = reference.endAt(metadata.endAt)
                                    }
                                } else {
                                    reference = reference.endAt(metadata.endAt)
                                }
                            }


                            //startAt && endAt 모두 세팅시 size 필요 없음
                            if (!(metadata.startAt && metadata.endAt)) {
                                if ((typeof metadata.startAt == 'string' && metadata.startAt.includes('equalTo://')) ||
                                    (typeof metadata.endAt == 'string' && metadata.endAt.includes('equalTo://'))
                                ) {
                                    if (metadata.startAt) {
                                        var equalString = metadata.startAt.split('://')[1]
                                    } else {
                                        var equalString = metadata.endAt.split('://')[1]
                                    }
                                    reference = reference.equalTo(equalString)
                                    if (metadata.size) {
                                        if (metadata.sort && metadata.sort.includes('asc')) {
                                            reference = reference.limitToFirst(metadata.size)
                                        } else {
                                            reference = reference.limitToLast(metadata.size)
                                        }
                                    }
                                } else if (metadata.size) {
                                    if (typeof metadata.size == 'number') {
                                        if (metadata.sort && metadata.sort.includes('asc')) {
                                            // reference = reference.limitToLast(metadata.size)
                                            reference = reference.limitToFirst(metadata.size)
                                        } else {
                                            // reference = reference.limitToFirst(metadata.size)
                                            reference = reference.limitToLast(metadata.size)
                                        }
                                    } else {
                                        if (metadata.size.includes('first://')) {
                                            var getSize = metadata.size.split('://')[1]
                                            reference = reference.limitToFirst(getSize)
                                        } else {
                                            var getSize = metadata.size.split('://')[1]
                                            reference = reference.limitToLast(getSize)
                                        }
                                    }
                                }
                            }

                            reference
                                .once('value', function (snapshots) {
                                    if (snapshots.exists()) {

                                        if (metadata.orderBy && metadata.orderBy.includes('child://')) {
                                            resolve(snapshots)
                                        } else {
                                            resolve(snapshots.val())
                                        }
                                    } else {
                                        resolve(null)
                                    }
                                })
                        }


                    } else {
                        reference
                            .once('value', function (snapshot) {
                                if (snapshot.exists()) {
                                    resolve(snapshot.val())
                                } else {
                                    resolve(null)
                                }
                            });
                    }


                })
            },
            watch(path, callback) {
                var starCountRef = firebase.database().ref(path);
                starCountRef.on('value', function (snapshot) {
                    if (snapshot.val()) {
                        callback(snapshot.val())
                    }
                });
            },
            firebase_push(path, string) {
                var ref = firebase.database().ref(path).push(string);
            },
            firebase_put(path, string) {
                var me = this
                try{
                    var parseString = JSON.parse(string)
                    if(parseString.elements) {
                        // 이곳에는 eventstorming 관련 데이터가 들어가야하므로, string 형태로 보내줌
                        firebase.database().ref('/' + path).set(string, function (error) {
                            if (error) {
                                // The write failed...
                            } else {
                                // Data saved successfully!
                            }
                        });
                    } else {
                        firebase.database().ref('/' + path).set(parseString, function (error) {
                            if (error) {
                                // The write failed...
                            } else {
                                // Data saved successfully!
                            }
                        });
                    }
                } catch {
                    firebase.database().ref('/' + path).set(string, function (error) {
                        if (error) {
                            // The write failed...
                        } else {
                            // Data saved successfully!
                        }
                    });
                }

                console.log("by firebase put")

            },
            firebase_delete(path) {
                var me = this
                firebase.database().ref(path).remove()
                console.log("by firebase delete")
            },


        }
    };
</script>
