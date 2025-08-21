<template>
    <div>
        <edge-element
                selectable
                connectable
                :deletable="deletable"
                :movable="movable"
                :id.sync="value.relationView.id"
                :vertices.sync="vertices"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                :_style="{
                    'arrow-start': 'none',
                    'arrow-end': 'none',
                    'stroke-width': value.size,
                    'stroke': value.color,
                    'stroke-dasharray': value.dashStyle,
                }"
        ></edge-element>

        <event-storming-line-element-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></event-storming-line-element-panel>

    </div>
</template>

<script>
    import EventStormingLineElementPanel from "../panels/EventStormingLineElementPanel";
    import Element from './EventStormingModelElement'

    export default {
        mixins: [Element],
        name: 'es-line-element',
        components:{EventStormingLineElementPanel},
        computed: {
            className() {
                return 'org.uengine.modeling.model.Line'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`
            },
            createNew(canvas, elementId, vertices) {
                return {
                    _type: 'org.uengine.modeling.model.Line',
                    id: elementId,
                    name: '',
                    author: null,
                    oldName: '',
                    displayName: '',
                    from: elementId,
                    to: elementId,
                    description: '',
                    relationView: {
                        id: elementId,
                        style: JSON.stringify(),
                        value: vertices,
                    },
                    size: 10,
                    color: '#000000',
                    dashStyle: '',
                    imgSrc: this.imgSrc(),
                    vertices: vertices,
                }
            },
            vertices: {
                get: function () {
                    try {
                        return JSON.parse(this.value.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.relationView.value = JSON.stringify(val);
                }
            }
        },
        data: function () {
            return {
            };
        },
        created: function () {
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`
        },
        watch: {
        },
        methods: {
            // close(){
            //     this.closePanel()
            // },
            onMoveAction(){ },
            validate(executeRelateToValidate, panelValue){
                var me = this
                if( me.canvas.isReplay ) return;
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                // this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(executeValidate) {

                }

                //Element
                if(validateValue){

                }
            }
        },

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
