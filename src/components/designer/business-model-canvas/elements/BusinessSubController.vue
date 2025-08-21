<template>
    <div>
        <sub-controller
                :image="'../business/'+ perspective + '.png'"
                v-on:click="showAddComponent"
        ></sub-controller>

        <business-model-tooltip
                :elementId="elementId"
                :options="elementList"
                :ref="'modelTooltip'"
                @option-clicked="createModelElement"
        ></business-model-tooltip>
    </div>
</template>

<script>

    export default {
        name: 'business-sub-controller',
        props: {
            perspective: String,
            elementId: String,
        },
        created() {
            var me = this
            me.businessCanvas = me.getComponent('business-model-canvas')
        },
        computed: {},
        data: function () {
            return {
                businessCanvas: null,
                elementList: [],
            }
        },
        watch: {},
        mounted: function () {
        },
        methods: {
            createModelElement: function (event) {
                var me = this

                if (me.businessCanvas) {
                    var elementInfo = event.option
                    me.businessCanvas.addBusinessTactic(elementInfo)
                }
            },
            showAddComponent: function (event, groupElement) {
                var me = this
                
                if (me.businessCanvas) {
                    me.businessCanvas.elementTypes.forEach( function (category, index) {
                        if(me.perspective == category[0].component) {
                            me.elementList = []
                            category.forEach( function (item, key) {
                                item.name = item.label
                                me.elementList.push(item)
                            })
                        }
                    })
                    
                    event.pageY = event.pageY - 62;
                    me.$refs.modelTooltip.showMenu(event, groupElement)
                }
            },
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


<style scoped lang="scss" rel="stylesheet/scss">
    .ui-draggable-handle {
        -ms-touch-action: none;
        touch-action: none;
    }
</style>

