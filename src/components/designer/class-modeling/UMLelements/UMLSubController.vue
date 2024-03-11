<template>
    <div>
        <sub-controller
                :image="'association_arrow.png'"
                cloneable
                v-on:clone="associationEdgeAndElement">
            <circle-element :width="100" :height="100"></circle-element>
        </sub-controller>

        <sub-controller
                :image="'aggregation_arrow.png'"
                cloneable
                v-on:clone="aggregationEdgeAndElement">
            <circle-element :width="100" :height="100"></circle-element>
        </sub-controller>

        <sub-controller
                :image="'generalization_arrow.png'"
                cloneable
                v-on:clone="generalizationEdgeAndElement">
            <circle-element :width="100" :height="100"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="value._type.endsWith('Class')"
                :image="'tag.png'"
                v-on:click="addObject('attribute')"
        ></sub-controller>
        <sub-controller
                v-if="value._type.endsWith('Class')"
                :image="'repair.png'"
                v-on:click="addObject('operation')"
        ></sub-controller>
        
        <sub-controller
                v-if="value.isAggregateRoot"
                :image="'chatgpt.png'"
                @click="openAutoModeling"
        ></sub-controller>
        
        <v-dialog v-model="editDialog" width="500">
            <uml-class-popup
                    v-model="value"
                    :type="addType"
                    :readOnly="canvas.readOnly"
                    :isNew="true"
                    @close="closePopup"
            ></uml-class-popup>
        </v-dialog>
    </div>
</template>

<script>

    export default {
        name: 'uml-sub-controller',
        props: {
            value: Object,
        },
        created() {
            var me = this
            me.canvas = me.getComponent('uml-class-model-canvas')
        },
        computed: {},
        data: function () {
            return {
                canvas: null,
                editDialog: false,
                addType: '',
            }
        },
        watch: {
        },
        mounted: function () {
        },
        methods: {
            openAutoModeling(){
                this.canvas.openAutoModelingDialog()
            },  
            associationEdgeAndElement: function (edgeElement, sourceElement, targetElement) {
                var me = this
                if(targetElement) {
                    me.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'uml-class-definition', 'Association');
                }
            },
            aggregationEdgeAndElement: function (edgeElement, sourceElement, targetElement) {
                var me = this
                if(targetElement) {
                    me.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'uml-class-definition', 'Aggregation');
                }
            },
            generalizationEdgeAndElement: function (edgeElement, sourceElement, targetElement) {
                var me = this
                if(targetElement) {
                    me.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'uml-class-definition', 'Generalization');
                }
            },
            createEdgeAndElement: function (edgeElement, sourceElement, targetElement, componentName, relationType) {
                var me = this
                
                var sourceComponent = sourceElement.$parent ? sourceElement.$parent : sourceElement
                var sourceValue = sourceComponent.value ? sourceComponent.value : sourceComponent

                if(sourceValue.isAggregateRoot && relationType != 'Generalization') {
                    componentName = 'uml-vo-class'
                }

                let boundary = targetElement.shape.geom.getBoundary();
                var targetInfo = {
                    x: boundary.getCentroid().x,
                    y: boundary.getCentroid().y,
                    width: boundary.getWidth(),
                    height: boundary.getHeight(),
                    component: componentName,
                    name: "Class" + Math.floor((1 + Math.random()) * 0x100)
                }

                if (me.canvas) {
                    me.canvas.canvas.removeShape(targetElement);

                    // var cloneInfo = {
                    //     edgeElement: edgeElement,
                    //     sourceValue: sourceValue,
                    //     relationType: relationType
                    // }
                    // me.canvas.openClassNameDialog(targetInfo, cloneInfo);

                    // make element
                    var targetValue = me.canvas.addElement(targetInfo, sourceValue.isAggregateRoot);

                    // make relation
                    me.customConnectShape(edgeElement, sourceValue, targetValue, relationType)
                }
            },
            customConnectShape: function (edge, fromValue, toValue, type) {
                var me = this;

                if (edge && fromValue && toValue) {
                    var edgeInfo = {
                        component: 'uml-class-relation',
                        sourceElement: fromValue,
                        targetElement: toValue,
                        type: type
                    }

                    var vertices = '[' + edge.shape.geom.vertices.toString() + ']';

                    if(type == 'Generalization') {
                        var arr = [];
                        for(var i = edge.shape.geom.vertices.length-1; i >= 0; i--) {
                            arr.push(edge.shape.geom.vertices[i]);
                        }
                        vertices = '[' + arr.toString() + ']';

                        edgeInfo.sourceElement = toValue
                        edgeInfo.targetElement = fromValue
                    }

                    edgeInfo.vertices = vertices
                    me.canvas.addElement(edgeInfo, fromValue.isAggregateRoot)
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
            addObject(type) {
                this.editDialog = true;
                this.addType = type
            },
            closePopup() {
                this.editDialog = false;
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

