<template></template>

<script>
    import LabBaseSelected from './LabBaseFirebaseAndMinioComposition' /// selected strategy

    export default {
        mixins: [LabBaseSelected],
        async created() {
            var me = this

            if (this.$route.path != '/courses') {
                var classInfo = await this.getClassInfo();
                var userId = localStorage.getItem('email')
                if (me.classId) {
                        var classId = me.classId
                } else {
                    var classId = me.$route.query.classId
                }

                if (me.courseId) {
                    var courseId = me.courseId
                } else {
                    var courseId = me.$route.query.courseId
                }
                var setUserInfo = await this.getObject('db://labs/' + `${me.getTenantId().split('.')[0]}/${courseId}/classes/${classId.replace('@', '/')}/enrolledUsers/${me.hashCode(userId)}`)
                // console.log(setUserInfo)
                var uploadUserData = function () {
                    var userId = localStorage.getItem('email')
                    var userName = localStorage.getItem('userName');
                    var uploadObject = {
                        userName: setUserInfo.userName,
                        photoURL: localStorage.getItem('picture'),
                        email: userId,
                        group: setUserInfo.group
                    }
                    if (classInfo && userId)
                        me.putObject('db://labs/' + `${me.getTenantId().split('.')[0]}/${courseId}/classes/${classId.replace('@', '/')}/enrolledUsers/${me.hashCode(userId)}`, uploadObject)
                }

                if (classInfo && classInfo.connectionKey) {
                    //기업강의
                    if (!classInfo.openClass) {
                        //connectionKey 0 , openClass x
                        var connectionClassId = me.$route.query.classId ? me.$route.query.classId : me.$route.params.classId
                        var userEmail = localStorage.getItem('email')

                        if (me.isAdmin || classInfo.teacherId == userEmail) {
                            // classInfo.connectionKey = true
                        } else if (!localStorage.getItem(connectionClassId) || !userId) {
                            var routerlink = `/login-page?courseId=${me.courseId}&classId=${me.classId}`
                            //로그인 파악.

                            if (!window.location.href.includes("login-page")) {
                                if (me.labId) {
                                    routerlink = routerlink + `&labId=${me.labId}`
                                }
                                me.$router.push(routerlink);
                                return;
                            }


                        } else if (localStorage.getItem(connectionClassId) != classInfo.connectionKey) {
                            alert("접속 키가 다릅니다.")
                            localStorage.removeItem(connectionClassId);
                            window.location.reload();
                        }
                    }

                    //connectionKey 0, openClass 0
                    var userId = localStorage.getItem('email')
                    var userList = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`));
                    if (userId) {
                        if (!userList) {
                            uploadUserData()
                        } else {
                            var enrolledUserList = []
                            Object.keys(userList).forEach(function (key) {
                                enrolledUserList.push(userList[key].email)
                            })
                            const equalId = (element) => element == userId;
                            if (enrolledUserList.findIndex(equalId) == -1) {
                                uploadUserData()
                            }
                        }
                    }

                }

                //connectionKey x openClass 0 or x
                // if (localStorage.getItem('authorized') == null) {
                //     if (!window.location.href.includes("login-page")) {
                //         if (me.labId) {
                //             this.$router.push(`/login-page?courseId=${me.courseId}&classId=${me.classId}&labId=${me.labId}`)
                //         } else {
                //             this.$router.push(`/login-page?courseId=${me.courseId}&classId=${me.classId}`)
                //         }
                //         return;
                //     }
                // }

                var userList = []
                if (userId) {
                    if (classInfo && classInfo.groupedUsers) {
                        if (Object.keys(classInfo.groupedUsers).length > 0) {
                            Object.keys(classInfo.groupedUsers).forEach(function (groupKey) {
                                classInfo.groupedUsers[groupKey]["users"].forEach(function (user) {
                                    userList.push(user.email)
                                })
                            })
                            const equalId = (element) => element == localStorage.getItem('email');
                            if (userList.findIndex(equalId) == -1) {
                                uploadUserData();
                            }
                        } else {
                            uploadUserData()
                        }
                    } else {
                        uploadUserData()
                    }
                }

            }

        }
    };
</script>
