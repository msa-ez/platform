<template>

</template>

<script>
    // import Element from '../../modeling/Element'
    import Element from "../../modeling/ModelElement";
    import getParent from "../../../../utils/getParent";


    export default {
        mixins: [Element],
        name: 'business-model-element',
        props: {},
        data: function () {
            return {
                namePanel: '',
                descriptionPanel: '',
            }
        },
        created: function () {
            var me = this
            try {
                me.setUserInfo()
                var className = me.value ? me.value._type : null
                if (className) {
                    var componentName = me.canvas.getComponentByClassName(className).name
                    var component
                    me.canvas.elementTypes.forEach(function (elements) {
                        component = elements.find(x => x.component == componentName)
                    })
                    if (component) {
                        me.image = component.src
                    }
                }
                me.namePanel = me.value.name
            } catch (e) {
                alert('BM Model - init Load Error:', e)
            }
        },
        computed: {},
        watch: {
            "value.name": function (newVal) {
                this.namePanel = newVal
                this.refreshImg()
            },
            "getNamePanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            }
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = getParent(me.$parent, "business-model-canvas");
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
