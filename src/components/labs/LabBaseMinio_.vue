<!-- <template></template>

<script>
    var Minio = require('minio');
    import TenantAware from './TenantAware';


    export default {
        name: "LabBaseMinio_",
        mixins: [TenantAware],
        data() {
            return {
                minioClient: null
            }
        },

        methods: {
            watch(path, callback) {
                var me = this
                me.pollingJob = setInterval(async function () {
                    callback(await me._get(path))
                }, 5000)
            },
            _list(path) {
                var me = this;
                var listObj = [];
                return new Promise((resolve, reject) => {
                    me.minioClient.listObjects(`labs-${me.getTenantId()}`, path, false)
                        .on('data', function (obj) {
                            listObj.push(obj)
                        })
                        .on('error', function (err) {
                            reject(err);
                        })
                        .on('end', function (err) {

                            var list = [];

                            listObj = listObj.sort(function (a, b) {
                                return a.lastModified - b.lastModified;
                            })

                            listObj.forEach(obj => {
                                if (obj.name) {
                                    list.push(obj.name)
                                } else if (obj.prefix) {
                                    list.push(obj.prefix)
                                }
                            })

                            resolve(list)

                        })
                });
            },

            async _getURL(path, tenant) {
                var me = this
                path = path.includes('://') ? path.split('://')[1] : path;
                return new Promise((resolve, reject) => {
                    me.minioClient.presignedUrl('GET', `labs-${me.getTenantId()}`, path, 60, function (err, presignedUrl) {
                        if (err) return reject(err);
                        console.log(presignedUrl);
                        resolve(presignedUrl)
                    })
                });
            },

            async __get(path) {
                var me = this

                var exist = await me._list(path);
                if (exist.length == 0) return null;

                return new Promise((resolve, reject) => {
                    var img = null
                    me.minioClient.getObject(`labs-${me.getTenantId()}`, path, function (err, labDataStream) {
                        if (err) {
                            resolve(null)
                            //reject(err);
                            return;
                        }
                        if (!labDataStream) {
                            resolve(null)
                            //reject(new Error("no stream connected"));
                            return;
                        }
                        labDataStream.on('data', function (labChunk) {
                                if (img) {
                                    img = [...img, ...labChunk];
                                } else {
                                    img = [...labChunk];
                                }
                            
                        })

                        labDataStream.on('end', function () {
                            var returnResult = null
                            if (path.includes('png') || path.includes('jpg')) {
                                returnResult = img
                            } else {
                                if (img) {
                                    returnResult = new Uint8Array(img).buffer;
                                }
                            }
                            resolve(returnResult);
                        })

                        labDataStream.on('error', function (err) {
                            resolve(null)
                            //reject(err);

                        })
                    })
                });


            },
            _put(path, string) {
                var me = this;
                return new Promise((resolve, reject) => {
                    me.minioClient.putObject(`labs-${me.getTenantId()}`, path, string, function (err, etag) {
                        if (err == null && etag) {
                            resolve(etag);
                        } else
                            reject(err);

                    });
                });
            },
            _delete(path) {
                var me = this
                return new Promise((resolve, reject) => {
                    me.minioClient.removeObject(`labs-${me.getTenantId()}`, path, function (err) {
                        if (err) {
                            reject(err)
                        }
                        resolve()
                    })
                })

            },

            async _get(path) {
                var source = await this.__get(path);

                if (!source) return null;

                var string = new TextDecoder("utf-8").decode(source)
                return (string);

            },

            async getImageURL(path) {
                var me = this;

                var imgChunk = await me.__get(path);
                if (!imgChunk) return null;

                var base64Data = btoa(String.fromCharCode.apply(null, imgChunk))
                if (path.includes('png')) {
                    return ('data:image/png;base64,' + base64Data)
                } else if (path.includes('jpg')) {
                    return ('data:image/jpg;base64,' + base64Data)
                }
            },


        }
    };
</script> -->