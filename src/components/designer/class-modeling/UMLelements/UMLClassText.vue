<template>
    <div>
        <text-element
                :movable="!readOnly"
                :selectable="isMovable"
                :deletable="isDeletable"
                v-on:moveShape="onMoveShape"
                v-on:addedToGroup="onAddedToClass"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openEditDialog"
                :_style="{
                    'text-anchor': 'start', 
                    'font-size': '14',
                    'font-color': fontColor,
                }"
                :x.sync="x"
                :y.sync="y"
                :width.sync="width"
                :image.sync="refreshedImg"
                :text.sync="label"
        ></text-element>

        <v-dialog v-model="editDialog" width="500">
            <uml-class-popup
                    v-model="value"
                    :type="type"
                    :readOnly="readOnly"
                    :isNew="false"
                    :index="styles.index"
                    @close="closePopup"
            ></uml-class-popup>
        </v-dialog>
    </div>
</template>

<script>
    import Element from './UMLClassElement';

    export default {
        name: 'uml-class-text',
        mixins:[Element],
        props: {
            value: Object,
            type: String,
            styles: Object,
            readOnly: Boolean,
        },
        computed: {
            isDeletable() {
                var me = this;
                if (me.readOnly) {
                    return false;
                } else {
                    if(me.type == 'attribute') {
                        var field = me.$parent.value.fieldDescriptors[me.index];
                        if(!me.readOnly && !field.isKey) {
                            return true
                        } else {
                            return false
                        }
                    } else {
                        if(!me.readOnly) {
                            return true
                        } else {
                            return false
                        }
                    }
                }
            },
            isMovable() {
                var me = this
                if (me.readOnly) {
                    return false;
                } else {
                    if(me.type == 'item') {
                        return false
                    } else {
                        return true
                    }
                }
            }
        },
        data: function () {
            return {
                x: this.styles.x,
                y: this.styles.y,
                label: this.styles.label,
                width: this.styles.width,
                index: this.styles.index,
                refreshedImg: '',
                fontColor: '#000000',

                // edit
                editDialog: false,
            };
        },
        created: function () {
            var me = this
            if(me.type == 'item') {
                me.y = me.styles.y - me.styles.height/2 + me.styles.subEdgeH + 15 + me.index * 20
                me.fontColor = '#FAFAFA'
            } else if(me.type == 'attribute') {
                me.y = me.styles.y - me.styles.height/2 + me.styles.titleH + 15 + me.index * 20
                me.fontColor = '#FAFAFA'
            } else if(me.type == 'operation') {
                me.y = me.styles.y - me.styles.height/2 + me.styles.subEdgeH + 15 + me.index * 20
                if(me.styles.width - me.styles.label.length < 190 && me.styles.width > 200) {
                    me.y += me.index * 30
                }
            }
        },
        watch: {
            'styles': function(val) {
                var me = this
                me.index = me.styles.index
                if(me.type == 'item') {
                    me.y = me.styles.y - me.styles.height/2 + me.styles.subEdgeH + 15 + me.index * 20
                } else if(me.type == 'attribute') {
                    me.y = me.styles.y - me.styles.height/2 + me.styles.titleH + 15 + me.index * 20
                } else if(me.type == 'operation') {
                    me.y = me.styles.y - me.styles.height/2 + me.styles.subEdgeH + 15 + me.index * 20
                    if(me.styles.width - me.styles.label.length < 190 && me.styles.width > 200) {
                        me.y += me.index * 30
                    }
                }
                me.x = me.styles.x
                me.width = me.styles.width
                me.label = me.styles.label
                me.refreshImg()
            },
            label: {
                deep: true,
                handler() {
                    this.refreshImg()
                }
            }
        },
        mounted: function () {
            var me = this
        },
        methods: {
            onRemoveShape(val) {
                if(val.$parent && val.$parent.$parent) {
                    var me = this
                    if(me.type == 'attribute') {
                        val.$parent.$parent.value.fieldDescriptors.splice(val.$parent.index, 1)
                    } else if(me.type == 'operation') {
                        val.$parent.$parent.value.operations.splice(val.$parent.index, 1)
                    }
                }
            },
            openEditDialog() {
                var me = this
                if(me.type != 'item' && !me.readOnly) {
                    me.editDialog = true
                }
            },
            closePopup() {
                this.editDialog = false;
            },
            onMoveShape() {
                this.refreshImg()
            },
            /**
             * 자신이 그룹속으로 들어갔을 때의 이벤트
             * @param groupElement
             * @param element
             */
            onAddedToClass: function (groupElement, element, eventOffset) {
                var me = this
                var parentElement = groupElement.$parent
                if (groupElement.tagName) {
                    
                    // Canvas로 나가는 경우
                    me.setVertices({'x': element.x, 'y': element.y})
                    
                } else {
                    var El = element.$parent.$parent
                    if(groupElement.label != El.value.name) {
                        
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
                            El.value.fieldDescriptors.forEach(function (item, index) {
                                if (item.label == element.text) {
                                    delIdx = index
                                } 
                            })
                            if(delIdx != -1) {
                                El.value.fieldDescriptors.splice(delIdx, 1)
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
                            El.value.operations.forEach(function (item, index) {
                                if (item.label == element.text) {
                                    delIdx = index
                                } 
                            })
                            if(delIdx != -1) {
                                El.value.operations.splice(delIdx, 1)
                            }
                        }

                    } else {
                    
                        me.setVertices({'x': element.x, 'y': element.y})

                    }
                }
            },
            setVertices(value) {
                var me = this
                me.$nextTick(function () {
                    me.x = value.x
                    me.y = value.y
                })
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
