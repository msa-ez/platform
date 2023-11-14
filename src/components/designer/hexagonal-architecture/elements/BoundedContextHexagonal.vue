<template>
    <div>
        <group-element
                selectable
                :id.sync="value.hexagonalView.id"
                :x.sync="value.hexagonalView.x"
                :y.sync="value.hexagonalView.y"
                :width.sync="value.hexagonalView.width"
                :height.sync="value.hexagonalView.height"
                :angle.sync="value.hexagonalView.angle"
                :resizable="!canvas.isReadOnlyModel && !movingElement"
                :movable="!canvas.isReadOnlyModel && !movingElement"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                :deletable="!canvas.isReadOnlyModel && isEditElement"
                v-on:removeShape="onRemoveShape"
                v-on:addToGroup="onAddToGroup"
                :label.sync="labelName"
                :image.sync="refreshedImg"
                :_style="{
                'label-angle':value.hexagonalView.angle,
                'font-weight': 'bold',
                'font-size': '16',
                }"
        >

            <!--  outside -->
            <geometry-polygon
                    :vertices="[ [22,0], [78,0], [100,50], [78,100], [22,100], [0,50],[22,0] ]"
                    :_style="{
              'fill-r': 1,
              'fill-cx': .1,
              'fill-cy': .1,
              'stroke-width': 1.4,
              'stroke': '#000000',
              'fill': '#00ff0000',
              'fill-opacity': 1,
              'vertical-align': 'top',
              'font-weight': 'bold',
              'font-size': '16',
               'r': '1'}"
            ></geometry-polygon>
<!--            <geometry-polygon-->
<!--                    :vertices="[ [30,20], [70,20], [80, 50], [70,80], [30,80], [20,50],[30,20] ]"-->
<!--                    :_style="{ 'stroke': '#000000',}" ></geometry-polygon>-->





            <sub-elements>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="30"
                        :sub-top="0"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="value.name">
                </text-element>
            </sub-elements>

            <sub-elements>
                <!--  outside -->
<!--                <polygon-->
<!--                        :vertices="[ [22,0], [78,0], [100,50], [78,100], [22,100], [0,50],[22,0] ]"-->
<!--                        :_style="{-->
<!--                          'fill-r': .5,-->
<!--                          'fill-cx': .1,-->
<!--                          'fill-cy': .1,-->
<!--                          'stroke-width': 1.4,-->
<!--                          'stroke': '#000000',-->
<!--                          'fill': '#00ff0000',-->
<!--                          'fill-opacity': 1,-->
<!--                          'r': '1',-->
<!--                }"></polygon>-->
<!--                &lt;!&ndash; inside &ndash;&gt;-->
<!--                <polygon-->
<!--                        :vertices="[ [30,20], [70,20], [80, 50], [70,80], [30,80], [20,50],[30,20] ]"-->
<!--                        :_style="{-->
<!--                          'fill-r': 1,-->
<!--                          'fill-cx': .1,-->
<!--                          'fill-cy': .1,-->
<!--                          'stroke-width': 1.4,-->
<!--                          'stroke': '#00ff0000',-->
<!--                          'fill': '#F8D454',-->
<!--                          'fill-opacity': 1,-->
<!--                          'r': '1',-->
<!--                 }"></polygon>-->

                <hexagonal-sub-controller
                        v-model="value"
                ></hexagonal-sub-controller>
            </sub-elements>
        </group-element>

        <bounded-context-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="!isEditElement"
                :image="image"
                @close="closePanel"
        ></bounded-context-panel>
    </div>
</template>

<script>
    import HexagonalModelElement from "./HexagonalModelElement";
    import BoundedContextPanel from "../../es-modeling/panels/BoundedContextPanel";

    var changeCase = require('change-case');
    var pluralize = require('pluralize');


    export default {
        components: {BoundedContextPanel},
        mixins: [HexagonalModelElement],
        name: 'bounded-context-hexagonal',
        props: {},
        computed: {
            labelName() {
                var me = this

                if (me.value.innerElements && me.value.innerElements.Aggregate) {
                    var text = ''
                    me.value.innerElements.Aggregate.forEach(function (agg) {
                        text = text + agg.name + '\n'
                    })
                    return text
                }
                return ''
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.BoundedContextHexagonal'
            },
            createNew(elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.BoundedContext',
                    name: 'BoundedContext' + x,
                    aggregates: [],
                    policies: [],
                    views: [],
                    elementView: {
                        '_type': 'org.uengine.modeling.model.BoundedContext',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.BoundedContextHexagonal',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    portGenerated: 0,
                }
            }
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        watch: {},
        mounted: function () {

        },
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
