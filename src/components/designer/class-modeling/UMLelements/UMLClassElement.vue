<template>
</template>

<script>
    import Element from '../../modeling/ModelElement'
    import isAttached from '../../../../utils/isAttached';

    export default {
        mixins: [Element],
        name: 'uml-class-element',
        props: {},
        computed: {
            getNamePanel() {
                return this.value.displayName ? this.value.displayName : this.namePanel
            },
            selectable(){
                return !this.movingElement
            },
            movable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            resizable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            deletable() {
                return !this.canvas.isReadOnlyModel && !this.canvas.isMirrorClassModel
            },
            connectable() {
                return !this.canvas.isReadOnlyModel && !this.canvas.isMirrorClassModel
            },
        },
        data: function () {
            return {
                modelCanvasComponent: null,
                isMovedElement: false,
                namePanel: '',
            };
        },
        watch: {
            "value.displayName": function (newVal, oldVal) {
                this.namePanel = newVal || this.value.name;
            },
            "value.name": function (newVal, oldVal) {
                this.namePanel = this.value && this.value.displayName ? this.value.displayName : newVal;
                this.validate();
            },
            "value.elementView": {
                deep: true,
                handler: function (newVal, oldVal) {
                    var me = this
                    if (!me.canvas.isServerModel) {
                        // Only Local
                        me.validate()
                    }
                }
            },
        },
        created: function () {
            var me = this;
            // me.modelCanvasComponent = me.getComponent('uml-class-model-canvas');
            // me.canvas = me.getComponent('uml-class-model-canvas');

            // Init Common panel-value Setting
            if (me.value && me.value.displayName) {
                me.namePanel = me.value.displayName;
            } else {
                me.namePanel = me.value.name;
            }
        },
        mounted: function () {
            var me = this;

            me.$EventBus.$on('isMovedElement', function (id) {
                if (me.value && me.value.elementView) {
                    //only Element
                    if (me.value.elementView.id == id || me.value.id == id) {
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

            me.refreshImg();
        },
        methods: {
            setElementCanvas(){
                var me = this;
                me.modelCanvasComponent = me.getComponent('uml-class-model-canvas');
                me.canvas = me.getComponent('uml-class-model-canvas');
            },
            closePanel() {
                if(!this.propertyPanel) this.propertyPanel = true
                this.propertyPanel = false
                if(this.value._type.endsWith('Class'))
                    this.refreshImg()
            },
            onMoveShape: function () {
                this.$EventBus.$emit('isMovedElement', this.value.elementView.id)
            },
            movedNewActivity() {
                var me = this
                if (me.canvas.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userMovedOn',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        // editElement: me.value.elementView.id
                        editElement: me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    }
                    // me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            movedOldActivity() {
                var me = this
                if (me.canvas.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userMovedOff',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        // editElement: me.value.elementView.id
                        editElement: me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    }
                    // me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                try{
                    var offsetX, offsetY, offsetW, offsetH

                    var originX = me.value.elementView.x
                    var originY = me.value.elementView.y
                    var originW = me.value.elementView.width
                    var originH = me.value.elementView.height

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

                    me.delayedMoveAction(beforeViewObj, afterViewObj)

                }catch (e) {
                    alert(`[Error] ModelElement-delayedMove: ${e}`)
                }
            },
            delayedRelationMove(vertices) {
                var me = this
                try{
                    var originVertices = JSON.parse(JSON.stringify(me.value.relationView.value))
                    var newVertices = []
                    var offsetVertices

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    me.delayedRelationMoveAction(originVertices, offsetVertices)
                }catch (e) {
                    alert(`[Error] ModelElement - delayedRelationMove: ${e}`)
                }
            },
            // onRemoveShape(model) {
            //     var me = this
            //     var id = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
            //     var location = me.value.elementView ? model.$parent.canvas.value.elements : model.$parent.canvas.value.relations

            //     if (location && id) {
            //         location[id] = null
            //     }
                
            //     if (me.value.relationView) {
            //         var obj = {
            //             action: 'delete',
            //             element: me.value
            //         }
            //         me.$EventBus.$emit(`${me.value.relationView.id}`, obj)
            //     }

            //     try {
            //         if (me.canvas.isCustomMoveExist
            //             && me.canvas.isServerModel
            //             && me.canvas.isQueueModel) {
            //             if (me.value) {
            //                 // me.STATUS_COMPLETE = false
            //                 // me.canvas.value.elements[me.value.elementView.id] = null;

            //                 var action = me.value.elementView ? 'elementDelete' : 'relationDelete'
            //                 var obj = {
            //                     action: action,
            //                     editUid: me.getEditUid,
            //                     timeStamp: Date.now(),
            //                     item: JSON.stringify(me.value)
            //                 }
            //                 if (me.canvas.projectId)
            //                     me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj)
            //             }
            //         } else {
            //             console.log('local:onRemoveShape, kubernetes')
            //             var id = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
            //             var location = me.value.elementView ? model.$parent.canvas.value.elements : model.$parent.canvas.value.relations

            //             if (location && id)
            //                 location[id] = null

            //             if(me.initLoad){
            //                 me.changedTemplateCode = true
            //             }

            //         }
            //         me.validate()
            //     } catch (e) {
            //         alert('Error-onRemove: ', e)
            //     }
            // },
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
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToClass: function (groupElement, element, eventOffset) {
                var parentElement = groupElement.$parent
                if (groupElement.tagName) {
                    // Canvas로 나가는 경우
                } else {
                    if(groupElement.label != element.$parent.value.name) {
                        if(element.text.includes('-')) {
                            var arr = (element.text.replace('- ', '')).split(': ');
                            var attrObject = {
                                "_type": "org.uengine.model.FieldDescriptor",
                                "name": arr[0],
                                "className": arr[1],
                                "label": element.text,
                            };
                            parentElement.value.fieldDescriptors.push(attrObject);

                            var delIdx = -1
                            element.$parent.value.fieldDescriptors.forEach(function (item, index) {
                                if (item.label == element.text) {
                                    delIdx = index
                                } 
                            })
                            if(delIdx != -1) {
                                element.$parent.value.fieldDescriptors.splice(delIdx, 1)
                            }
                        } else {
                            var arr = (element.text.replace('+ ', '')).split('(')
                            var arr2 = arr[1].split('): ')

                            var paramStr = arr2[0]
                            var newParams = []
                            if(params != "") {
                                var params = paramStr.split(', ')
                                if(params.length > 0) {
                                    params.forEach(function (item) {
                                        var param = item.split(': ')
                                        newParams.push({
                                            'type': param[1],
                                            'name': param[0]
                                        })
                                    })
                                }
                            }

                            var operationObj = {
                                "name": arr[0],
                                "class": parentElement.value.name,
                                "returnType": arr2[1],
                                "parameters": newParams,
                                "label": element.text,
                            };
                            parentElement.value.operations.push(operationObj)

                            var delIdx = -1
                            element.$parent.value.operations.forEach(function (item, index) {
                                if (item.label == element.text) {
                                    delIdx = index
                                } 
                            })
                            if(delIdx != -1) {
                                element.$parent.value.operations.splice(delIdx, 1)
                            }
                        }
                        this.refreshImg()
                    }
                }
            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToGroup: function (groupElement, element, eventOffset) {
                
                if (groupElement.tagName) {
                    // Canvas로 나가는 경우
                }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
