<template>
    <div>
        <group-element
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
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addToGroup="onAddToGroup"
                :label.sync="namePanel"
                :image.sync="refreshedImg"
                :_style="{
                    'vertical-align': 'top',
                    'font-weight': 'bold',
                    'font-size': '16'
                }"
        >
            <sub-elements v-if="canvas.isHexagonal">
                <geometry-element
                        :selectable="!movingElement"
                        :movable="!canvas.isReadOnlyModel && !movingElement"
                        :resizable="!canvas.isReadOnlyModel && !movingElement"
                        :deletable="!canvas.isReadOnlyModel && isEditElement"
                        :id.sync="elementCoordinate.id"
                        :x.sync="elementCoordinate.x"
                        :y.sync="elementCoordinate.y"
                        :width.sync="elementCoordinate.width"
                        :height.sync="elementCoordinate.height"
                        :customMoveActionExist="canvas.isCustomMoveExist"
                        v-on:customMoveAction="delayedMove"
                        v-on:moveShape="onMoveShape"
                        v-on:removeShape="onRemoveShape"
                        v-on:selectShape="selectedActivity"
                        v-on:deSelectShape="deSelectedActivity"
                        v-on:dblclick="openPanel"
                        v-on:addToGroup="onAddToGroup"
                        :_style="{
                        'vertical-align': 'top',
                        'font-weight': 'bold',
                        'font-size': '16'
                        }"
                >
                    <sub-elements>
                        <geometry-polygon
                                :vertices="[ [25,0], [75,0], [100,50], [75,100], [25,100], [0,50], [25,0] ]"
                                :_style="{
                                        'fill-r': 1,
                                        'fill-cx': .1,
                                        'fill-cy': .1,
                                        'stroke-width': 3,
                                        'stroke': '#000000',
                                        'fill': '#42A5F5',
                                        'fill-opacity': 1,
                                        'r': '1',
                                        'z-index': -1
                                    }"
                        ></geometry-polygon>
                        <geometry-polygon
                                :vertices="[ [35,20], [65,20], [80,50], [65,80], [35,80], [20,50], [35,20] ]"
                                :_style="{
                                        'fill-r': 1,
                                        'fill-cx': .1,
                                        'fill-cy': .1,
                                        'stroke-width': 1.4,
                                        'stroke': '#000000',
                                        'stroke-dasharray': '- ',
                                        'fill': '#FFFF00',
                                        'fill-opacity': 1,
                                        'r': '1',
                                        'z-index': -1
                                    }"
                        ></geometry-polygon>
                    </sub-elements>
                </geometry-element>
            </sub-elements>

            <sub-elements v-else>
                <geometry-rect
                        v-if="movingElement"
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 3,
                            'stroke': '#000000',
                            'fill': '#e3e1e1',
                            'fill-opacity': .5,
                            'vertical-align': 'top',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'r': '1'
                        }"
                ></geometry-rect>
                <geometry-rect
                        v-else
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 3,
                            'stroke': '#000000',
                            'fill-opacity': 1,
                            'vertical-align': 'top',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'r': '1'
                        }"
                ></geometry-rect>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-controller
                    v-if="value.modelValue.projectId"
                    :image="'open-in-new.png'"
                    @click="openProject(false)"
            ></sub-controller>
            <sub-controller
                    v-if="value.modelValue.openAPI"
                    :image="'open-in-new.png'"
                    @click="openProject(true)"
            ></sub-controller>

        </group-element>

        <pbc-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></pbc-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import GroupElement from "../../../opengraph/shape/GroupElement";
    import ImageElement from "../../../opengraph/shape/ImageElement";
    import SubElements from "../../../opengraph/shape/SubElements";
    import PBCPanel from "../panels/PBCPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "../../modeling/MultiUserStatusIndicator.vue"

    var _ = require('lodash')
    export default {
        components: {
            SubElements,
            ImageElement,
            GroupElement,
            PBCPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        mixins: [Element],
        name: 'packaged-business-capabilities',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.PBC'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.PBC',
                    id: elementId,
                    name: 'PBC' + x,
                    description: null,
                    author: null,
                    boundedContextes: [],
                    aggregates: [],
                    events: [],
                    commands: [],
                    policies: [],
                    views: [],
                    modelValue: {},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.PBC',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 500,
                        'height': 500,
                        'style': JSON.stringify({})
                    },
                    hexagonalView:{
                        '_type': 'org.uengine.modeling.model.PBCHexagonal',
                        'id': elementId,
                        'x': 0,
                        'y': 0,
                        'width': 0,
                        'height': 0,
                        'style': JSON.stringify({})
                    },
                    relations: [],
                }
            }
        },
        data: function () {
            return {
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                panelValue: null,
            };
        },
        created: function () {
            var me = this
            me.panelValue = JSON.parse(JSON.stringify(me.value))
        },
        beforeDestroy(){
            this.deletePBCModeling(this.value.elementView.id);
        },
        watch: {
            "value.commands": {
                deep: true,
                handler: function (newVal, oldVal) {
                    var me = this
                    me.drawPBCModeling()
                }
            },
            "panelValue":function(newVal, oldVal){
                this.drawPBCModeling()
            },
            "value.elementView": {
                deep: true,
                handler: function (newVal, oldVal) {
                    var me = this
                    me.drawPBCModeling()
                }
            },
        },
        methods: {
            onMoveAction(){ },
            validate(executeRelateToValidate, panelValue){
                // onCreate, onMove
                // me.elementValidationResults.splice(validationResultIndex, 1)
            },
            deletePBCModeling(pbcId){
                var me = this
                if(
                    me.canvas
                    && me.canvas.pbcValue
                ) {
                    var pbcElements = me.canvas.pbcValue.elements
                    var pbcRelations = me.canvas.pbcValue.relations

                    //remove
                    if (Object.keys(pbcElements).length > 0) {
                        var removeKeyArray = Object.keys(pbcElements).filter(key => pbcElements[key] && pbcElements[key].pbcId == pbcId)
                        if (removeKeyArray.length > 0) {
                            removeKeyArray.forEach(function (elementKey) {
                                pbcElements[elementKey] = null;
                                // delete me.canvas.pbcValue.elements[elementKey];
                            })
                        }
                    }
                    if (Object.keys(pbcRelations).length > 0) {
                        var removeKeyArray = Object.keys(pbcRelations).filter(key => pbcRelations[key] && pbcRelations[key].pbcId == pbcId)
                        if (removeKeyArray.length > 0) {
                            removeKeyArray.forEach(function (elementKey) {
                                pbcRelations[elementKey] = null;
                                // delete me.canvas.pbcValue.relations[elementKey];
                            })
                        }
                    }
                }
            },
            drawPBCModeling(){
                var me = this

                try {
                    if(
                        me.canvas
                        && me.canvas.pbcValue
                    ){
                        var pbcId = me.value.elementView.id
                        var pbcElements = me.canvas.pbcValue.elements
                        var pbcRelations = me.canvas.pbcValue.relations
                        let pbcX = me.value.elementView.x;
                        let pbcY = me.value.elementView.y;
                        let pbcWidth = me.value.elementView.width;
                        let pbcHeight = me.value.elementView.height;
                        let currentValue = me.propertyPanel ? me.panelValue : me.value
                        currentValue = JSON.parse(JSON.stringify(currentValue));

                        me.deletePBCModeling(pbcId);

                        if(currentValue){
                            var element = currentValue;
                            var pbcTopY = pbcY - pbcHeight/2
                            let leftSideElement = [];
                            let rightSideElement = [];


                            leftSideElement = leftSideElement.concat(element.commands, element.views)
                            // leftSideElement = leftSideElement.concat(element.commands)
                            leftSideElement = leftSideElement.filter(ele => ele && (!ele.visibility || ele.visibility == 'public'))
                            if(leftSideElement.length > 0) {
                                let leftElementLen = leftSideElement.length;
                                let leftElementH = (pbcHeight/leftElementLen) - 5 ;
                                leftElementH = leftElementH > 100 ? 100 : leftElementH
                                var yDistance = (pbcHeight - leftElementH*leftElementLen)/(leftElementLen+1);

                                leftSideElement.forEach(function(item, idx) {
                                    item.pbcId = pbcId
                                    item.elementView.x = pbcX - pbcWidth/4
                                    item.elementView.y = pbcTopY + (leftElementH/2) + yDistance*(idx+1) + (leftElementH * idx)
                                    item.elementView.height = leftElementH;
                                    me.$set(pbcElements, item.elementView.id, item)

                                    if(item.aggregate && Object.keys(item.aggregate).length > 0){
                                        console.log(item.aggregate)
                                        item.aggregate.pbcId = pbcId
                                        item.aggregate.elementView.id = item.aggregate.elementView.id + idx
                                        item.aggregate.elementView.x = item.elementView.x + item.elementView.width
                                        item.aggregate.elementView.y = item.elementView.y
                                        item.aggregate.elementView.height = item.elementView.height

                                        me.$set(pbcElements, item.aggregate.elementView.id, item.aggregate)
                                    }


                                })
                            }

                            rightSideElement = rightSideElement.concat(element.events);
                            rightSideElement = rightSideElement.filter(ele => ele && (!ele.visibility || ele.visibility == 'public'));
                            if(rightSideElement.length > 0) {
                                let rightElementLen = rightSideElement.length;
                                let rightElementH = (pbcHeight/rightElementLen) - 5 ;
                                rightElementH = rightElementH > 100 ? 100 : rightElementH
                                var yDistance = (pbcHeight - rightElementH*rightElementLen)/(rightElementLen+1);

                                rightSideElement.forEach(function(item, idx) {
                                    item.pbcId = pbcId
                                    item.elementView.x = pbcX + pbcWidth/4
                                    item.elementView.y = pbcTopY + (rightElementH/2) + yDistance*(idx+1) + rightElementH*idx
                                    item.elementView.height = rightElementH;
                                    me.$set(pbcElements, item.elementView.id, item)
                                })
                            }



                            if(element.relations && element.relations.length > 0) {
                                let filterRelations = element.relations.filter( relation => pbcElements[relation.from] && pbcElements[relation.to]);
                                filterRelations.forEach(function(relation) {
                                    if(relation) {
                                        var vertices = JSON.parse(relation.relationView.value)
                                        var start = vertices[0]
                                        var end = vertices[vertices.length - 1]
                                        var newVertices = JSON.stringify([start, end])
                                        relation.pbcId = pbcId
                                        // modify relation
                                        relation.relationView.value = newVertices
                                        relation.relationView.style = null
                                        me.$set(pbcRelations, relation.relationView.id, relation)
                                    }
                                });
                            }
                        }
                    }
                }catch (e) {
                    console.log(`ERROR] Draw PBC Modeling: ${e}`)
                }

            },
            openProject(isOpenAPI) {
                var me = this
                if(isOpenAPI){
                    window.open(me.value.modelValue.openAPI, '_blank')
                } else {
                    window.open(`#/storming/${me.value.modelValue.projectId}`, '_blank')
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
