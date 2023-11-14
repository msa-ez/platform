<template>
</template>

<script>
    import ModelElement from "../../modeling/ModelElement";

    export default {
        mixins: [ModelElement],
        name: 'hexagonal-model-element',
        props: {},
        data() {
            return {
                namePanel:'',
                descriptionPanel:'',
            }
        },
        created: function () {
            var me = this
            //필수
            try {
                var className = me.value ? me.value._type : null
                me.namePanel = me.value.name

                // Init Sticker & Relation setting
                if (className && className.endsWith('Relation')) {
                    //relations

                } else {
                    //elements
                    if (me.value.description) {
                        me.descriptionPanel = me.value.description
                    }
                }


                if (className) {
                    var componentName = me.getComponentByClassName(className).name
                    var component = me.canvas.elementTypes.find(x => x.component == componentName)
                    if (component) {
                        me.image = component.src
                    }
                }

            } catch (e) {
                alert('Error: modelCanvas 선언 필수.', e)
            }
        },
        computed: {
            isEditElement() {
                var me = this
                if (me.canvas) {

                    if (me.canvas.isReadOnlyModel) {
                        return false
                    } else if (!me.isServerModel) {
                        return true
                    } else {
                        if (me.canvas.information && me.canvas.information.author) {
                            if (me.newEditUserImg && me.newEditUserImg.length > 0){

                                if (me.getEditUid == me.newEditUserImg[0].uid) {
                                    //project author
                                    return true
                                } else {
                                    if( me.canvas.participantLists.filter(user => user.uid == me.newEditUserImg[0].uid).length == 0 ){
                                        me.newEditUserImg.splice(0, 1)
                                        // Not Exit User
                                        return true
                                    }
                                    return false
                                }
                            }
                        }
                    }
                }
                return true
            },

        },
        methods: {
            setElementCanvas(){
                var me = this
                me.modelCanvasComponent = me.getComponent('event-storming-model-canvas');
                me.canvas = me.getComponent('event-storming-model-canvas');
            },
            /**
             * 자신에게 도형들이 그룹으로 들어왔을때의 이벤트
             * @param groupElement
             * @param elements
             */
            onAddToGroup: function (groupElement, elements, eventOffset) {
                var me = this
                // console.log('onAddToGroup', elements);
            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToGroup: function (groupElement, element, eventOffset) {
                console.log('Hexagonal:', groupElement, element, eventOffset)

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
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                try{
                    var offsetX, offsetY, offsetW, offsetH

                    var originX = me.value.hexagonalView.x
                    var originY = me.value.hexagonalView.y
                    var originW = me.value.hexagonalView.width
                    var originH = me.value.hexagonalView.height

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

                    var afterViewObj = {x: offsetX, y: offsetY, width: offsetW, height: offsetH}
                    var beforeViewObj = {x: originX, y: originY, width: originW, height: originH}


                    if ( me.canvas.isCustomMoveExist ) {
                        me.movingElement = false

                        // move Element
                        me.onMoveElement(afterViewObj, false)
                        // move Queue
                        me.delayedMoveQueue(beforeViewObj, afterViewObj)
                    }
                }catch (e) {
                    alert(`[Error] delayedMove: ${e}`)
                }
            },
            delayedRelationMove(vertices) {
                var me = this
                try{
                    var originVertices = JSON.parse(JSON.stringify(me.value.hexagonalView.value))
                    var newVertices = []
                    var offsetVertices

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    if ( me.canvas.isCustomMoveExist ) {
                        me.movingElement = false

                        // move Relation
                        me.onMoveRelation(offsetVertices , false)
                        // relation Queue
                        me.delayedRelationMoveQueue(originVertices, offsetVertices)
                    }
                }catch (e) {
                    alert(`[Error] Hexagonal - delayedRelationMove: ${e}`)
                }
            },
            delayedMoveQueue(beforeViewObj , afterViewObj){
                var me = this
                try{
                    var types = me.value._type.split('.')
                    var pushObj =
                        {
                            action: 'elementMove',
                            elementType: types[types.length - 1],
                            elementName: me.value.name,
                            editUid: me.getEditUid,
                            elementId: me.value.elementView.id,
                            before: JSON.stringify(beforeViewObj),
                            after: JSON.stringify(afterViewObj),
                            timeStamp: Date.now(),
                            isHexagonal: true
                        }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] DelayedMoveQueue PUSH: ${e}`)
                }
            },
            delayedRelationMoveQueue(originVertices , offsetVertices){
                var me = this
                try {
                    var pushObj =
                        {
                            action: 'relationMove',
                            editUid: me.getEditUid,
                            relationId: me.value.relationView.id,
                            before: originVertices,
                            after: offsetVertices,
                            timeStamp: Date.now(),
                            isHexagonal: true
                        }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] DelayedRelationMoveQueue PUSH: ${e}`)
                }
            },
            onMoveElement(newObj,STATUS_COMPLETE){
                var me = this

                me.value.hexagonalView.x = newObj.x
                me.value.hexagonalView.y = newObj.y
                me.value.hexagonalView.width = newObj.width
                me.value.hexagonalView.height = newObj.height

                me.$nextTick(function () {
                    me.movingElement = true
                    me.STATUS_COMPLETE = STATUS_COMPLETE
                })
            },
            onMoveRelation(newObj,STATUS_COMPLETE){
                var me = this
                me.value.hexagonalView.value = newObj

                me.$nextTick(function () {
                    me.movingElement = true
                    me.STATUS_COMPLETE = STATUS_COMPLETE
                })
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                // $.each(window.Vue.hexagonalModelingComponents, function (i, component) {
                //     if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                //         componentByClassName = component.default;
                //     }
                // });
                $.each(window.Vue.eventStormingModelingComponents, function (i, component) {
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
