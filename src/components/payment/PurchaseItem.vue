<template>
</template>

<script>
    import VRuntimeTemplate from "v-runtime-template";
    import PaymentBase from "./PaymentBase";

    export default {
        name: 'purchase-item',
        mixins: [PaymentBase],
        components: {
            VRuntimeTemplate,
        },
        props: {
            labInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
            classInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
        },
        data() {
            return {
                tenantLogo: null,
                videoHeight: '250px',
            }
        },
        computed: {
            // isForeign(){
            //     if (window.countryCode == 'ko') {
            //         return false
            //     }
            //     return true
            // },
            isForeign(){
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
            getClassName() {
                if (this.classInfo && this.classInfo.className) {
                    return this.classInfo.className
                }
                return null
            },
            getLabName() {
                if (this.labInfo && this.labInfo.labName) {
                    return this.labInfo.labName
                }
                return null
            },
            getNowTimeStamp() {
                return Date.now()
            },
            isEnterpriseClass() {
                if (this.classInfo && !this.classInfo.openClass && this.classInfo.connectionKey) {
                    return true
                }
                return false
            },
        },
        async created() {
            if (!this.isLogin)
                await this.loginUser()
        },
        methods: {
            convertTimeStampToDate(timeStamp) {
                if (timeStamp) {
                    if (typeof timeStamp == 'string')
                        timeStamp = Number(timeStamp)
                    var date = new Date(timeStamp);
                    var year = date.getFullYear().toString()
                    var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
                    var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
                    var hour = ("0" + date.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
                    var minute = ("0" + date.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
                    var second = ("0" + date.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)

                    return year + "." + month + "." + day
                }
                return null
            },
        },
    }
</script>

<style>
    .paid-border {
        width: 100%;
        border-style: solid;
        border-color: gainsboro;
        margin-bottom: 3px;
        border-radius: 10px;
        border-width: thin;
    }


    .play-button {
        border-radius: 10px;
        opacity: 0.7;
    }

    .play-button:hover {
        color: dodgerblue;
    }

    .thumbnail-img {
        border-radius: 10px;
    }

    .text-blur {
        /*color: transparent;*/
        -ms-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        z-index: 1;
        pointer-events: none;
    }

    .testclass {
        width: 120% !important;
        margin-left: 10% !important;
        text-align: center;
    }

</style>