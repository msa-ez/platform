<template>
    <sub-controller></sub-controller>
</template>

<script>
    import ModelElement from "../../modeling/ModelElement";
    import SubController from "../../../opengraph/shape/SubController";

    export default {
        components: {SubController},
        mixins: [ModelElement],
        name: 'user-story-map-element',
        props: {},
        data() {
            return {
                panelStyle: 'width:500px;',
                namePanel: '',
                descriptionPanel: '',
                failed_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-red.png',
                info_red_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/close-icon-red.png',
                info_white_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-white.png',
                labelWidth: 65
            }
        },
        created: function () {
            var me = this
            //필수
            try {
                me.setUserInfo()
                var className = me.value ? me.value._type : null
                me.namePanel = me.value.name
                if (me.value.description) {
                    me.descriptionPanel = me.value.description
                }

                if (className) {
                    var componentName = me.canvas.getComponentByClassName(className).name
                    var component = me.canvas.elementTypes.find(x => x.component == componentName)
                    if (component) {
                        me.img = component.src
                    }
                }

            } catch (e) {
                alert('Error: modelCanvas 선언 필수.', e)
            }
        },
        computed: {
            getNamePanel() {
                return this.namePanel
            },
            getDescriptionPanel() {
                return this.descriptionPanel
            },
            elementAuthor() {
                return this.value.author
            },
        },
        watch: {
            "value.name": function (newVal) {
                this.namePanel = newVal
                this.refreshImg()
            },
            "value.description": function (newVal) {
                this.descriptionPanel = newVal
                this.refreshImg()
            },
            "getNamePanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
            "getDescriptionPanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = me.getComponent('user-story-map-canvas');
            },
            // override
            onActivityDeselected(){
                if (this.value) {
                    if (this.value._type == "StickyTextElement" && this.value.name.length == 0) {
                        this.propertyPanel = true
                        return
                    } else {
                        this.propertyPanel = false
                    }
                }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
