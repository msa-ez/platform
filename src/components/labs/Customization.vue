<template>
</template>

<script>
    export default {
        name: 'customization',
        props: {
            title: {
                type: String,
                default: function () {
                    return 'EventStorming2Code';
                }
            },
            home: {
                type: String,
                default: function () {
                    return 'https://intro.msaez.io/'
                }
            },
        },
        created(){
            var me = this
            var app = this.getComponent('App')
            window.document.title = this.title

            if (me.$root.$children && me.$root.$children[0].customizationHome) {
                me.$root.$children[0].customizationHome = me.home
            } else {
                app.customizationHome = me.home
            }
        },
        mounted() {
            // var me = this
            // var app = this.getComponent('App')

            // console.log('mounted- customizationcustomizationcustomizationcustomization')
            // window.document.title = this.title
            //
            // if (me.$root.$children && me.$root.$children[0].customizationHome) {
            //     me.$root.$children[0].customizationHome = me.home
            // } else {
            //     app.customizationHome = me.home
            // }
        },
        methods: {
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
        }
    }
</script>