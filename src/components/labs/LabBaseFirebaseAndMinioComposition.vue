<template></template>

<script>
    var Minio = require('minio');
    import LabBaseAbstract from './LabBaseAbstract'
    import LabBaseMinio_ from './LabBaseMinio_';
    import LabBaseFirebase_ from './LabBaseFirebase_';


    export default {
        name: "LabBaseMinio",
        mixins: [LabBaseAbstract],
        data() {
            return {
                standalone: null,
                distributed: null,
                firebase: null
            }
        },
        created() {

            var me= this

            var LabBaseMinioClass = Vue.extend(LabBaseMinio_)

            this.standalone = new LabBaseMinioClass();
            this.distributed = new LabBaseMinioClass();
            var LabBaseFirebaseClass = Vue.extend(LabBaseFirebase_)
            this.firebase = new LabBaseFirebaseClass();

        },
        methods: {
            watch(path, callback) {
                var server = this.getServer(path);
                return server.watch(path, callback);
            },
            watch_added(path, metadata, callback) {
                var server = this.getServer(path);
                return server.watch_added(path, metadata, callback);
            },
            watch_changed(path, callback) {
                var server = this.getServer(path);
                return server.watch_changed(path, callback);
            },
            // watch_option_added(path, option, callback) {
            //     var server = this.getServer(path);
            //     return server.watch_option_added(path, option, callback);
            // },
            _list(path, metadata) {
                var server = this.getServer(path);
                return server._list(path, metadata);

            },
            firebase_option_list(path, metadata) {
                var server = this.getServer(path);
                return server.firebase_option_list(path, metadata);
            },
            async _get(path) {
                var server = this.getServer(path);
                return server._get(path);

            },
            _put(path, string) {
                var server = this.getServer(path);
                return server._put(path, string);

            },
            _push(path, string) {
                var server = this.getServer(path);
                return server._push(path, string);

            },
            _delete(path) {
                var server = this.getServer(path);
                server._delete(path);
            },
            _getURL(path) {
                var server = this.getServer(path);
                return server._getURL(path);
            },
            getImageURL(path){
                var server = this.getServer(path);
                return server.getImageURL(path);

            },
            getServer(path) {
                var pathList = path.split('/')
                if (path.includes('Untitled1.ipynb') || path.includes('config') || path.includes('standalone://'))
                    return this.standalone;
                else if (pathList[0] == 'labs' || pathList[0] == 'enrolledUsers' || pathList[0]=="inUsePods") {
                    return this.firebase;
                } else
                    return this.distributed;
            }


        }
    };
</script>
