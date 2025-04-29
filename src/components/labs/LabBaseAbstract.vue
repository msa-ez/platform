<template>

</template>

<script>

    import marked from 'marked'
    import TenantAware from './TenantAware';

    export default {
        name: "LabBaseAbstract",
        components: {},
        mixins: [TenantAware],
        props: {},
        computed: {
            myId() {
                return localStorage.getItem("email");
            },
            myHashCode() {
                return this.hashCode(this.courseId + '/classes/' + this.classId + '/labs/' + this.labId + '/' + this.myId)
            },
            isAdmin() {
                if (this.classInfo != null) {
                    if (this.classInfo.teacherId == this.myId) {
                        return true
                    } else if (window.localStorage.getItem('authorized') == 'admin') {
                        return true
                    }
                } else if (window.localStorage.getItem('authorized') == 'admin') {
                    return true
                } else {
                    return false
                }
            },
            isTeacher() {
                if (this.classInfo != null) {
                    if (this.classInfo.teacherId == this.myId) {
                        return true
                    }
                }
                return false
            },
            // async isTeacher() {
            //     var classInfo = await this.getClassInfo();
            //     if (classInfo != null) {
            //         if (classInfo.teacherId == this.myId) {
            //             return true
            //         } else {
            //             return false
            //         }
            //     } else {
            //         return false
            //     }
            // },
            // isOwner() {
            //     if (this.courseInfo != null) {
            //         if (this.courseInfo.ownerId && this.courseInfo.ownerId == this.myId) {
            //             return true
            //         } else if(!this.courseInfo.ownerId && this.myId == 'jyjang@uengine.org'){
            //             return true
            //         } else {
            //             return false
            //         }
            //     } else {
            //         return false
            //     }
            // },
            courseId() {
                return this.$route.params.courseId;
            },
            labId() {
                return this.$route.params.labId;
            },
            classId() {

                return this.$route.params.classId;
            },
            classStatus() {
                return this.$route.params.status;
            },
        },
        data() {
            return {
                dialog: false,
                userInfo: {
                    name: '',
                    email: ''
                },
                userImage: null
            }
        },
        beforeDestroy() {
        },
        async mounted() {
            var me = this

            // 접속시 체크

        },
        methods: {

            /// underbar methods are ABSTRACT METHODS that must be implemented by derived classes

            _list(path, metadata) {
                throw new Error("must be implemented")
            },
            async _get(path) {
                throw new Error("must be implemented")
            },
            _put(path, string) {
                throw new Error("must be implemented")
            },
            _push(path, string) {
                throw new Error("must be implemented")
            },
            _delete(path) {
                throw new Error("must be implemented")
            },
            _getURL(path) {
                throw new Error("must be implemented")
            },
            async list(path, options) {
                var list = await this._list(path);
                console.log("path")
                if (options && options.sort && options.sort == "name") {
                    console.log("sort")
                    list = list.sort()
                }

                return list;
            },
            async getURL(path) {
                return await this._getURL(path);
            },
            async listMetadata(path, boolean) {
                if (boolean == undefined) boolean = true
                return await this._list(path, boolean);
            },
            // async getStringStandalone(path) {
            //     return await this._getStandalone(path);
            // },
            async getString(path) {
                return await this._get(path);
            },
            async delete(path) {
                return await this._delete(path)
            },
            async getObject(path) {
                var string = await this.getString(path);
                if (typeof string == 'string')
                    try {
                        var data = JSON.parse(string);
                    } catch (e) {
                        var data = string
                    }
                else
                    var data = string
                return data;
            },
            async pushString(path, string) {
                return await this._push(path, string);
            },
            async putString(path, string) {
                return await this._put(path, string);
            },
            async pushObject(path, obj) {
                var string = JSON.stringify(obj);
                return await this._push(path, string);
            },
            async putObject(path, obj) {
                var string = JSON.stringify(obj);
                return await this.putString(path, string);
            },
            // //set
            // async setString(path, string) {
            //     return await this._set(path, string, true);
            // },
            // async setObject(path, obj) {
            //     var string = JSON.stringify(obj);
            //     return await this._set(path, string);
            // },
            getLabInfo(labId) {
                var me = this
                if (!labId) labId = me.labId;

                return new Promise(async function (resolve) {
                    var labPath = `${me.courseId}/labs/${labId}/Lab_Metadata.json`

                    var labInfo = await me.getObject(labPath);
                    if (!labInfo) labInfo = {}
                    labInfo.labId = labId;

                    var markdownHtml = await me.getString(`${me.courseId}/labs/${me.labId}/instruction.html`)
                    if (markdownHtml) {
                        try {
                            labInfo.instructionHtml = markdownHtml
                        } catch (e) {
                            labInfo.instructionHtml = e.message
                        }
                    } else {
                        var markdown = await me.getString(`${me.courseId}/labs/${me.labId}/instruction.md`)
                        if (markdown)
                            try {
                                labInfo.instructionMd = markdown
                            } catch (e) {
                                labInfo.instructionMd = e.message
                            }

                    }

                    var theoryMD = await me.getString(`${me.courseId}/labs/${me.labId}/theory.md`)
                    if (theoryMD) {
                        try {
                            labInfo.theoryHtml = theoryMD.includes('<') ? theoryMD : marked(theoryMD, {sanitize: true})
                        } catch (e) {
                            labInfo.theoryHtml = e.message
                        }
                    }
                    //todo: load javascript here
                    resolve(labInfo);
                })
            },
            async getLabStatus(labId) {
                var me = this;

                var statusFilesMd = await this.listMetadata(me.getClassPath(`labs/${labId}/status/`));

                var labStatus = {
                    status: 'READY'
                }

                statusFilesMd.forEach(item => {   //Event Sourcing:  replaying the histories takes you to the current state
                    if (item.endsWith('completed')) {
                        labStatus.status = 'completed';
                        labStatus.completedAt = item.lastModified;
                    } else if (item.endsWith('started')) {
                        labStatus.status = 'started';
                        labStatus.startedAt = item.lastModified;
                    }
                });

                return labStatus;
            },
            getClassInfo: async function () {
                var me = this
                return new Promise(async function (resolve, reject) {
                    try {
                        var path = me.getClassPath('Class_Metadata.json');
// <<<<<<< HEAD
//                     var classInfo = await me.getObject(path);
//                     // classInfo.reuse = false
//                     if (classInfo) {
//                         classInfo.reuse = false
//                         var now = Date.now();
//                         var parseDate = new Date(classInfo.classEndDate)
//                         parseDate.setDate(parseDate.getDate() + 1)
//                         if (parseDate < now) {
//                             classInfo.status = 'completed'
//                         } else if (Date.parse(classInfo.classStartDate) < now && now < parseDate) {
//                             classInfo.status = 'running'
//                         } else if (now < Date.parse(classInfo.classStartDate)) {
//                             classInfo.status = 'prepared'
//                         }
//                         if (classInfo.openClass || !classInfo.connectionKey) {
//                             var enrolledUserList = await me.list('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`))
//                             // openClass의 경우에는 Firebase에서만
//                             var undefinedGroupList = {}
//                             if (!enrolledUserList) {
//                                 resolve(classInfo)
//                             } else {
//                                 var groupedUsers = {}
//                                 // 조 파악
//                                 Object.keys(enrolledUserList).forEach(function (key) {
//                                     if (!enrolledUserList[key].email) {
//                                         if (enrolledUserList[key].users) {
//                                             enrolledUserList[key].users.forEach(function (user) {
//                                                 var hashName = me.hashCode(user)
//                                                 enrolledUserList[hashName] = user
//                                             })
//                                         }
//                                     } else {
//                                         if (!enrolledUserList[key].group) {
//                                             enrolledUserList[key].group = '미배정'
//                                         }
// =======
                        var classInfo = await me.getObject(path);
                        if (typeof classInfo == 'string') classInfo = JSON.parse(classInfo)
                        if (classInfo) {
                            classInfo.reuse = false
                            var now = Date.now();
                            var parseDate = new Date(classInfo.classEndDate)
                            parseDate.setDate(parseDate.getDate() + 1)
                            if (parseDate < now) {
                                classInfo.status = 'completed'
                                classInfo.serverUrl = 'https://218.236.22.12:6443'
                                classInfo.token = undefined;
                                classInfo.ideUrl = 'kuberez.io'
                            } else if (Date.parse(classInfo.classStartDate) < now && now < parseDate) {
                                classInfo.status = 'running'
                            } else if (now < Date.parse(classInfo.classStartDate)) {
                                classInfo.status = 'prepared'
                            }
                            if (classInfo.openClass || !classInfo.connectionKey) {
                                var enrolledUserList = await me.list('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`))
                                // openClass의 경우에는 Firebase에서만
                                var undefinedGroupList = {}
                                if (!enrolledUserList) {
                                    resolve(classInfo)
                                } else {
                                    var groupedUsers = {}
                                    // 조 파악
                                    Object.keys(enrolledUserList).forEach(function (key) {
                                        if (!enrolledUserList[key].email) {
                                            if (enrolledUserList[key].users) {
                                                enrolledUserList[key].users.forEach(function (user) {
                                                    var hashName = me.hashCode(user)
                                                    enrolledUserList[hashName] = user
                                                })
                                            }
                                        } else {
                                            if (!enrolledUserList[key].group) {
                                                enrolledUserList[key].group = '미배정'
                                            }

                                            if (Object.keys(groupedUsers).indexOf(enrolledUserList[key].group) == -1) {
                                                groupedUsers[enrolledUserList[key].group] = {
                                                    users: []
                                                }
                                            }
                                            groupedUsers[enrolledUserList[key].group].users.push(enrolledUserList[key])
                                        }
                                    })
                                    classInfo["groupedUsers"] = groupedUsers
                                    classInfo["enrolledUsersList"] = enrolledUserList

                                    await me.putObject('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`), enrolledUserList)
                                    resolve(classInfo)
                                }

                            } else {
                                // openClass가 아닌 경우에는 classMetadata + Firebase
                                resolve(classInfo)
                            }
                        }
                    } catch (e) {
                        alert(e.message)
                        resolve(null)
                    }

                })

            },
            async getCourseInfo() {
                return await this.getObject(`${this.courseId}/Course_Metadata.json`);
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            getClassPath(path) {
                if (this.classId) {
                    var classId = this.classId.replace('@', '/')
                } else {
                    if (this.$route.query.classId)
                        var classId = this.$route.query.classId.replace('@', '/')
                }

                if (this.courseId) {
                    var courseId = this.courseId
                } else {
                    var courseId = this.$route.query.courseId
                }
                return `${courseId}/classes/${classId}/${path}`;
            },

        }
    };
</script>
