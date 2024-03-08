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
            // me.canvas = me.getComponent('uml-class-model-canvas');
            // me.canvas = me.getComponent('uml-class-model-canvas');

            // Init Common panel-value Setting
            if (me.value && me.value.displayName) {
                me.namePanel = me.value.displayName;
            } else {
                me.namePanel = me.value.name;
            }
        },
        methods: {
            setElementCanvas(){
                var me = this;
                me.canvas = me.getComponent('uml-class-model-canvas');
            },
            closePanel() {
                if(!this.propertyPanel) this.propertyPanel = true
                this.propertyPanel = false
                if(this.value._type.endsWith('Class'))
                    this.refreshImg()
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
