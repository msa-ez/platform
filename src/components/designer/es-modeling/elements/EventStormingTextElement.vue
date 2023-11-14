<template>
    <div>
        <geometry-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                :id.sync="value.elementView.id"
                :x.sync="elementCoordinate.x"
                :y.sync="elementCoordinate.y"
                :width.sync="elementCoordinate.width"
                :height.sync="elementCoordinate.height"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'text-anchor': 'middle',
                }"
                :image.sync="refreshedImg"
        >
            <geometry-rect
                    v-if="!movingElement"
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'fill-opacity': 0,
                        'stroke-width': 0,
                        r: '1',
                    }"
            >
            </geometry-rect>

            <sub-elements>
                <text-element
                        :sub-width="'100%'"
                        :sub-top="0"
                        :sub-left="0"
                        :text.sync="namePanel"
                        :subStyle="{'font-size': fontSize, 'font-weight': 'bold'}"
                ></text-element>
            </sub-elements>
        </geometry-element>


        <event-storming-text-element-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></event-storming-text-element-panel>

    </div>
</template>

<script>
    import EventStormingTextElementPanel from "../panels/EventStormingTextElementPanel";
    import Element from './EventStormingModelElement'

    export default {
        mixins: [Element],
        name: 'es-text-element',
        components:{EventStormingTextElementPanel},
        computed: {
            className() {
                return 'org.uengine.modeling.model.Text'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/text_element.png`
            },
            createNew(canvas, elementId, x, y, width, height) {
                return {
                    _type: 'org.uengine.modeling.model.Text',
                    id: elementId,
                    name: 'Text',
                    author: null,
                    oldName: '',
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Text',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    description: '',
                    imgSrc: this.imgSrc(),
                }
            },
        },
        data: function () {
            return {
                fontSize: Math.floor(this.value.elementView.width * 0.5)
            };
        },
        created: function () {
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/symbol/text_element.png`
        },
        watch: {
            "value.elementView.width": function(val) {
                this.fontSize = Math.floor(val * 0.5)
            },
        },
        methods: {
            closePanel() {
                if (this.value.name.length == 0) {
                    this.propertyPanel = true
                    return
                } else {
                    this.propertyPanel = false
                    this.selected = false
                    this.staySelected = false
                }
            },
            onMoveAction(){ },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                // this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(executeValidate) {

                }

                // Element
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( isExistValidationResult ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( !isExistValidationResult ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }
            }
        }

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
