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
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :label.sync="getDescriptionPanel ? '': namePanel"
                :image.sync="refreshedImg"
                :_style="{
                'text-anchor': 'start',
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '13',
                'font-color':'#FAFAFA',
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                v-if="movingElement"
                :_style="{
                  'fill-r': 1,
                  'fill-cx': .1,
                  'fill-cy': .1,
                  'stroke-width': 0,
                  'stroke': '#8E24AA',
                  'fill': '#8E24AA',
                  'fill-opacity': .5,
                  'r': '1' }"
            >
            </geometry-rect>

            <geometry-rect
                v-else
                :_style="{
              'fill-r': 1,
              'fill-cx': .1,
              'fill-cy': .1,
              'stroke-width': 1.4,
              'stroke': '#AB47BC',
              'fill': '#AB47BC',
              'fill-opacity': 1,
              'r': '1'}"
            >
            </geometry-rect>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>

                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :subStyle="{'font-color':'white'}"
                        :text="value.classReference ? value.classReference : '<< Issue >>'"
                >
                </text-element>

                <text-element
                        v-if="getDescriptionPanel"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold','font-color':'white'}"
                        :text="getNamePanel">
                </text-element>

                <text-element
                        v-if="getDescriptionPanel"
                        :sub-width="'120%'"
                        :sub-height="detailHeight"
                        :sub-top="detailTop"
                        :sub-left="detailLeft"
                        :subStyle="{'font-size': '12px', 'text-anchor':'start','font-color':'white'}"
                        :text="getDescriptionPanel">
                </text-element>

                <image-element
                        v-if="showValidation"
                        v-bind:image="showValidationImg"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                >
                </image-element>
                <storming-sub-controller :type="value._type" :value="value"
                                         :readOnly="canvas.isReadOnlyModel"></storming-sub-controller>
            </sub-elements>
        </geometry-element>

        <issue-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></issue-definition-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import IssueDefinitionPanel from "../panels/IssueDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [Element],
        name: 'issue-definition',
        components:{
            IssueDefinitionPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        computed: {
            subjectTop() {
                return 30
            },
            subjectHeight() {
                return 8
            },
            detailHeight() {
                if (this.value.description) {
                    var count = this.value.description.split('\n').filter((element) => element != '').length
                    return this.subjectHeight + (count * 5)
                }
                return this.subjectHeight
            },
            detailLeft() {
                return 10
            },
            detailTop() {
                return this.subjectTop + this.detailHeight
            },
            defaultStyle() {
                return {}
            },
            type() {
                return 'Issue'
            },
            className() {
                return 'org.uengine.modeling.model.Issue'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.Issue',
                    id: elementId,
                    name: '',
                    oldName: '',
                    description: null,
                    author: null,
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Issue',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    boundedContext: {},
                }
            },
            // showError() {
            //     var me = this
            //     if (me.value.name == '') {
            //         return 'Must have a name.'
            //     }
            //     return null
            // },
        },
        data: function () {
            return {
                itemH: 200,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
            };
        },
        created: function () {
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/event/issue.png`
        },
        watch: {
            "getDescription": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
        },
        methods: {
            // close(){
            //     this.closePanel()
            // },
            onMoveAction(){
                this.$super(Element).onMoveAction()
            },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(executeValidate) {

                }
            }
        }

    }
</script>




<style scoped lang="scss" rel="stylesheet/scss">
    .panel-title {
        font-size: 25px;
        color: #757575;
    }
</style>