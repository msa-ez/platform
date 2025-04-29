<template>
    <div></div>
</template>

<script>
    import StorageBase from "./designer/modeling/StorageBase";

    export default {
        name: 'list-pages',
        mixins: [StorageBase],
        props: {
            itemsPerPage: {
                type: Number,
                default() {
                    return 9;
                }
            },
        },
        data() {
            return {
                tmpSearch: '',
                search: '',
                pageIndex: 1,
                items: null,
                itemsTotalRow: 0,
                itemsTotalPages: 1,
            }
        },
        created() {
            this.loadAuthor()
        },
        computed: {
            isAdmin() {
                if (this.userInfo.authorized && this.userInfo.authorized == 'admin') {
                    return true
                }
                return false
            },
            getLoginUser() {
                if (this.userInfo.email) {
                    return this.userInfo
                }
                return null
            },

        },
        methods: {
            loadAuthor() {
                var me = this
                var authorized = null
                if (localStorage.getItem('accessToken')) {
                    me.userInfo.email = localStorage.getItem('email')
                    me.userInfo.uid = localStorage.getItem('uid')
                    if (me.userInfo.email.includes('@uengine.org')) {
                        authorized = 'admin'
                    } else {
                        authorized = 'student'
                    }
                    me.userInfo.authorized = authorized
                }
            },
            async _getArrayAndSnapByPath(path, options) {
                var me = this
                try {
                    if (path) {
                        var getSnapshot = await me.list(path)
                        var getArray = await me._getArrayByPath(path, options)

                        me.itemsTotalRow = Object.keys(getSnapshot).length
                        me.itemsTotalPages = Math.ceil(me.itemsTotalRow / me.itemsPerPage)

                        return {snapshot: getSnapshot, returnArray: getArray}
                    }
                    return null
                } catch (e) {
                    return null
                    alert(e)
                }
            },
            async _getArrayByPath(path, options) {
                var me = this

                try {
                    var array = null
                    if (path) {
                        var snapshots = await me.list(path, options)

                        if (snapshots) {
                            me.reversedChildren(snapshots).forEach(function (item, index) {
                                if (item) {
                                    if (!array) array = []
                                    array.push(item)
                                }
                            })
                        }
                    }
                    return array
                } catch (e) {
                    return null
                    alert(e)
                }
            },

            async watchArrayByPath(path, options, callback) {
                var me = this

                try {
                    if (path) {
                        me.watch_added(path, options, function (item) {
                            if (item) {
                                callback(item)
                            }
                        })
                    }
                } catch (e) {
                    callback(null)
                    alert(e)
                }
            },
            getArrayAndSnapByPath(path, option) {
                return this._getArrayAndSnapByPath(path, option)
            },
            getArrayByPath(path, option) {
                return this._getArrayByPath(path, option)
            },
            reversedChildren(snapshot) {
                try {
                    var children = [];
                    if (snapshot.key) {
                        snapshot.forEach(function (child) {
                            var key = child.key
                            var item = child.val()
                            if (typeof item != 'object') {
                                var obj = {
                                    key: key,
                                    value: item
                                }
                                children.unshift(obj);
                            } else {
                                item.key = key
                                children.unshift(item);
                            }

                        });


                    } else if (typeof snapshot == 'object') {
                        var keysArray = Object.keys(snapshot)
                        var reverseKeys = keysArray.reverse()
                        reverseKeys.forEach(function (key) {
                            var item = snapshot[key]
                            if (item) {
                                item.key = key
                                children.push(item)
                            }
                        })
                    }

                    return children;
                } catch (e) {
                    return []
                    alert(e)
                }
            },
            loadTextFromFile(obj) {
                var me = this
                const fileInfo = obj.target.files[0];
                const reader = new FileReader();

                reader.readAsText(fileInfo);

                reader.onload = function (info) {
                    var loadedProject = JSON.parse(info.target.result)
                    // console.log('loadTextFromFile:: ',loadedProject)
                    me.saveLocalToMine(loadedProject)
                }
            },
            showLoginDialog() {
                this.$EventBus.$emit('showLoginDialog')
            }


        }
    }
</script>