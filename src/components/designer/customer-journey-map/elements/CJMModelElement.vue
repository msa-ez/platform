<template>
    <sub-controller></sub-controller>
</template>

<script>
    import ModelElement from "../../modeling/ModelElement";
    import SubController from "../../../opengraph/shape/SubController";

    export default {
        components: {SubController},
        mixins: [ModelElement],
        name: 'cjm-model-element',
        props: {},
        data() {
            return {
                panelStyle: 'width:500px;',
                namePanel: '',
                descriptionPanel: '',
                isMovedElement: false,
                failed_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-red.png',
                info_red_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/close-icon-red.png',
                info_white_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-white.png',
                titleH: 30,
                labelWidth: 80
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
                    var componentName = me.getComponentByClassName(className).name
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
            getDescriptionWidth() {
                return this.value.elementView.width
            },
            elementAuthor() {
                return this.value.author
            },
            isEditElement() {
                if (this.canvas) {
                    if(this.canvas.readOnly) return false; // Don't edit

                    if(!this.canvas.isServerModel) return true // local
                    if(this.canvas.isOwnModel) return true; // own model
                    
                    if(!this.canvas.information) return false // Server Model But No info.
                    if(!this.canvas.information.permissions) return false; // No Permission.
                    if(this.canvas.information.permissions[this.canvas.userInfo.uid]) return true;
                }
                return true
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
            // 'staySelected': function (newVal, oldVal) {
            //     if (newVal) {
            //         this.selectedStayActivity()
            //     } else {
            //         this.deSelectedStayActivity()
            //     }
            //
            // },
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
        mounted() {
            var me = this
            me.$EventBus.$on('isMovedElement', function (id) {
                if (me.value.elementView) {
                    //only Element
                    if (me.value.elementView.id == id) {
                        me.isMovedElement = true
                        // me.movedNewActivity()
                    } else {
                        if (me.isMovedElement == true) {
                            me.isMovedElement = false
                            // me.movedOldActivity()
                        }
                    }
                }
            })

        },
        methods: {
            setElementCanvas(){
                var me = this;
                me.modelCanvasComponent = me.getComponent('customer-journey-map');
                me.canvas = me.getComponent('customer-journey-map');
            },
            onMoveShape: function () {
            //     this.$EventBus.$emit('isMovedElement', this.value.elementView.id)
            },
            selectedActivity: function () {
                if (this.value) {
                    this.selected = true
                }
            },
            deSelectedActivity: function () {
                if (this.value) {
                    if (this.value._type == "CJMTextElement" && this.value.name.length == 0) {
                        this.propertyPanel = true
                        return
                    } else {
                        this.propertyPanel = false
                        this.selected = false
                        this.staySelected = false
                    }
                }
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                $.each(window.Vue.customerJourneyMapComponents, function (i, component) {
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
