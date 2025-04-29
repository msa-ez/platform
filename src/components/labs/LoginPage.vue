<template>
    <div :style="getStyle">
        <Login @type="setStyle" @login="back()"></Login>
    </div>
    <!--    <Login @login="back"></Login>-->
</template>

<script>
    import Login from '../oauth/Login'

    export default {
        name: "LoginPage",
        components: {
            Login
        },
        mounted: {},
        data: () => ({
            style: null,
        }),
        computed: {
            userId() {
                return localStorage.getItem('email')
            },
            getStyle() {
                if (this.style || this.$route.query.labId)
                    return this.style
                else
                    return ''
            },
        },
        methods: {
            setStyle(type) {
                if (type == 'standard' || type == 'connectionKey' ) {
                    this.style = 'width:20%; margin:auto;'
                } else {
                    this.style = ''
                }
            },
            back() {
                var me = this
                if (me.$route.query.labId) {
                    me.$router.push(`courses/${me.$route.query.courseId}/${me.$route.query.classId}/${me.$route.query.labId}/${me.userId}`)
                } else {
                    me.$router.push(`courses/${me.$route.query.courseId}/${me.$route.query.classId}`)
                }

            }
        }
    }
</script>

<style scoped>

</style>