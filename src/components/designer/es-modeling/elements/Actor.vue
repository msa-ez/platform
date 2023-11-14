<template>
    <div>
        <geometry-element
                :selectable="selectable"
                :movable="movable"
                :deletable="deletable"
                :resizable="resizable"
                :id.sync="value.elementView.id"
                :x.sync="elementCoordinate.x"
                :y.sync="elementCoordinate.y"
                :width.sync="elementCoordinate.width"
                :height.sync="elementCoordinate.height"
                :angle.sync="elementCoordinate.angle"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"


                v-on:removeShape="onRemoveShape"
                :image.sync="refreshedImg"
                :label.sync="namePanel"
                :_style="{
                'label-angle':value.elementView.angle,
               'text-anchor': 'center',
               'vertical-align': 'top',

                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->

            <geometry-rect
                    v-if="movingElement"
                    :_style="{
          'fill-r': 1,
          'fill-cx': .1,
          'fill-cy': .1,
          'stroke-width': 1.4,
          'stroke': '#F8D454',
          fill: '#F8D454',
          'fill-opacity': .5,
          r: '1'
        }"
            >
            </geometry-rect>
            <geometry-rect
                    v-else
                    :_style="{

          'fill-r': 1,
          'fill-cx': .1,
          'fill-cy': .1,
          'stroke-width': 1.4,
          'stroke': '#F8D454',
          fill: '#F8D454',
          'fill-opacity': .7,
          r: '1'
        }"
            >
            </geometry-rect>


            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>

            <image-element
                    :image="userImage"
                    :sub-width="actorImgSizeW"
                    :sub-height="actorImgSizeH"
                    :sub-left="actorHorizon"
                    :sub-top="actorVertical"
            >
            </image-element>


            <storming-sub-controller :type="value._type" :value="value"
                                         :readOnly="canvas.isReadOnlyModel"></storming-sub-controller>
            </sub-elements>
        </geometry-element>


        <actor-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></actor-panel>


    </div>
</template>

<script>
    import ActorPanel from "../panels/ActorPanel";
    import Element from './EventStormingModelElement'
    import RectangleElement from "../../../opengraph/shape/RectangleElement";
    import CircleElement from "../../../opengraph/shape/CircleElement";
    import EdgeElement from "../../../opengraph/shape/EdgeElement";
    import EllipseElement from "../../../opengraph/shape/EllipseElement";
    import GeometryLine from "../../../opengraph/geometry/Line";
    import SubElements from "../../../opengraph/shape/SubElements";
    import StormingSubController from "../../modeling/StormingSubController";

    var changeCase = require('change-case');
    var pluralize = require('pluralize');
    var _ = require('lodash')

    export default {
        components: {
            SubElements,
            GeometryLine,
            EllipseElement,
            EdgeElement,
            CircleElement,
            RectangleElement,
            'storming-sub-controller' : StormingSubController,
            ActorPanel
        },
        mixins: [Element],
        name: 'actor-definition',
        props: {},
        computed: {
            actorShortSide() {
                if (this.value.elementView.width < this.value.elementView.height) {
                    return this.value.elementView.width
                }
                return this.value.elementView.height
            },
            actorImgSizeW() {
                return this.actorShortSide * 0.4
            },
            actorImgSizeH() {
                return this.actorShortSide * 0.6
            },
            actorHorizon() {
                return this.value.elementView.width / 2 - this.actorImgSizeW / 2
            },
            actorVertical() {
                return this.value.elementView.height / 2 - this.actorImgSizeH / 2
            },
            actorHeadSize() {
                if (this.value.elementView.width < this.value.elementView.height) {
                    return this.value.elementView.width * 0.2
                }
                return this.value.elementView.height * 0.2
            },
            actorBody() {
                var start = [50, 45.4]
                var end = [50, 68]

                return {'start': start, 'end': end}
            },
            actorArm() {
                var start = [28, 50.4]
                var end = [72, 50.4]
                return {'start': start, 'end': end}
            },
            actorLegL() {
                var start = [50, 68]
                var end = [27, 80]
                return {'start': start, 'end': end}
            },
            actorLegR() {
                var start = [50, 68]
                var end = [72, 80]
                return {'start': start, 'end': end}
            },
            defaultStyle() {
                return {}
            },
            type() {
                return 'Actor'
            },
            className() {
                return 'org.uengine.modeling.model.Actor'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.Actor',
                    id: elementId,
                    name: '',
                    oldName: '',
                    description: '',
                    author: null,
                    innerAggregate: {
                        'event': [],
                        'command': [],
                        'view': [],
                        'policy': [],
                        'external': []
                    },
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Actor',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({})
                    },
                    boundedContext: {}
                }

            }
        },
        data: function () {
            return {
                itemH: 200,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                userImage: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/actor_in_actor.png'
            };
        },
        created: function () {
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/event/actor.png`
        },
        watch: {

        },
        methods: {
            close(){
                this.closePanel()
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

                //Element
                if(validateValue){

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