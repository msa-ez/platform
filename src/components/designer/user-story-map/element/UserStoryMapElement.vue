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
                isMovedElement: false,
                failed_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-red.png',
                info_red_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/close-icon-red.png',
                info_white_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/info-icon-white.png',
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
            elementAuthor() {
                return this.value.author
            },
            isEditElement() {
                if (this.canvas) {
                    if (this.canvas.readOnly) {
                        return false
                    } else {
                        if (this.canvas.information && this.canvas.information.author) {
                            if (localStorage.getItem('uid') == this.canvas.information.author) {
                                //project author
                                return true
                            } else {
                                if (this.elementAuthor) {
                                    return this.elementAuthor == localStorage.getItem('uid')
                                } else {
                                    if (this.canvas.information.author == this.userInfo.uid) {
                                        return true
                                    } else {
                                        return false
                                    }
                                }
                            }
                        }
                    }
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
        mounted() {
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
                me.modelCanvasComponent = me.getComponent('user-story-map-canvas');
                me.canvas = me.getComponent('user-story-map-canvas');
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
                    if (this.value._type == "StickyTextElement" && this.value.name.length == 0) {
                        this.propertyPanel = true
                        return
                    } else {
                        this.propertyPanel = false
                        this.selected = false
                        this.staySelected = false
                    }
                }
            },
            movedNewActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
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
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
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
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
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
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
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
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this

                var offsetX, offsetY, offsetW, offsetH

                var originX = me.value.elementView.x
                var originY = me.value.elementView.y
                var originW = me.value.elementView.width
                var originH = me.value.elementView.height

                if (me.canvas.isCustomMoveExist && me.params.projectId) {
                    me.movingElement = false
                    me.canvas.modelChanged = true
                    var types = me.value._type.split('.')

                    if (dx == null && dy == null) {
                        // resize

                        if (Math.abs(dl) <= Math.abs(dr)) {
                            // 오른쪽으로 움직임
                            if (dr >= 0) {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            }


                        } else if (Math.abs(dl) > Math.abs(dr)) {
                            // 왼쪽 으로 움직임
                            if (dl >= 0) {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            }

                        }

                        if (Math.abs(dlw) <= Math.abs(du)) {
                            //위로 움직임
                            if (du >= 0) {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            }

                        } else if (Math.abs(dlw) > Math.abs(du)) {
                            //아래로 움직임
                            if (dlw >= 0) {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            }

                        }

                        offsetW = dw
                        offsetH = dh

                    } else if (dw == null && dh == null) {
                        //move
                        offsetX = originX + dx
                        offsetY = originY + dy
                        offsetW = originW
                        offsetH = originH
                    } else {
                        console.log('error Move & Resize')
                    }

                    var pushObj =
                        {
                            action: 'elementMove',
                            elementType: types[types.length - 1],
                            elementName: me.value.name,
                            editUid: localStorage.getItem('uid'),
                            elementId: me.value.elementView.id,
                            before: JSON.stringify({x: originX, y: originY, width: originW, height: originH}),
                            after: JSON.stringify({x: offsetX, y: offsetY, width: offsetW, height: offsetH}),
                            timeStamp: Date.now(),
                        }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, pushObj)
                }
            },
            delayedRelationMove(vertices) {
                var me = this
                var orgineVertices = JSON.parse(JSON.stringify(me.value.relationView.value))
                var newVertices = []
                var offsetVertices

                if (me.canvas.isCustomMoveExist && me.params.projectId) {
                    me.movingElement = false
                    me.canvas.modelChanged = true

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    var pushObj =
                        {
                            action: 'relationMove',
                            editUid: localStorage.getItem('uid'),
                            relationId: me.value.relationView.id,
                            before: orgineVertices,
                            after: offsetVertices,
                            timeStamp: Date.now(),
                        }
                    me.pushObject(`db://definitions/${me.params.projectId}/queue`, pushObj)
                }
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                // $.each(window.Vue.eventStormingModelingComponents, function (i, component) {
                $.each(window.Vue.userStoryMapComponents, function (i, component) {
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
