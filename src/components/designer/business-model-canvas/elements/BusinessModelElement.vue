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
                isMovedElement: false,
            }
        },
        created: function () {
            var me = this
            try {
                me.setUserInfo()
                var className = me.value ? me.value._type : null
                if (className) {
                    var componentName = me.getComponentByClassName(className).name
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
            },
            'staySelected': function (newVal, oldVal) {
                if (newVal) {
                    this.selectedStayActivity()
                } else {
                    this.deSelectedStayActivity()
                }

            },
            'selected': _.debounce(function (newVal, oldVal) {
                if (newVal) {
                    if (this.propertyPanel) {
                        this.staySelected = false
                    } else {
                        this.staySelected = true
                    }
                } else {
                    this.staySelected = false
                }

            }, 2000),

        },
        mounted: function () {
            var me = this
            me.$EventBus.$on('isMovedElement', function (id) {
                if (me.value.elementView) {
                    //only Element
                    if (me.value.elementView.id == id) {
                        me.isMovedElement = true
                        me.movedNewActivity()
                    } else {
                        if (me.isMovedElement == true) {
                            me.isMovedElement = false
                            me.movedOldActivity()
                        }
                    }
                }
            })
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.modelCanvasComponent = me.getComponent('business-model-canvas');
                me.canvas = getParent(me.$parent, "business-model-canvas");
            },
            onMoveShape: function () {
                this.$EventBus.$emit('isMovedElement', this.value.elementView.id)
            },
            selectedActivity: function () {
                if (this.value) {
                    this.selected = true
                }
            },
            deSelectedActivity: function () {
                if (this.value) {
                    this.propertyPanel = false
                    this.selected = false
                    this.staySelected = false
                }
            },
            movedNewActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userMovedOn',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            movedOldActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userMovedOff',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            selectedStayActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userSelectedOn',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            deSelectedStayActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userSelectedOff',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }

            },
            getComponentByClassName: function (className) {
                var componentByClassName;
                $.each(window.Vue.bussinessModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
