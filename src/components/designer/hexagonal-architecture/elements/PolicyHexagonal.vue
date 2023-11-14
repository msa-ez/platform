<template>
    <div>
        <geometry-element
                selectable
                :movable="false"
                :id.sync="value.hexagonalView.id"
                :x.sync="value.hexagonalView.x"
                :y.sync="value.hexagonalView.y"
                :width.sync="value.hexagonalView.width"
                :height.sync="value.hexagonalView.height"
                :deletable="!canvas.isReadOnlyModel && isEditElement"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:addedToGroup="onAddedToGroup"
                :label.sync="namePanel"
                :image.sync="refreshedImg"
                :_style="{
                'label-angle':value.hexagonalView.angle,
                'font-weight': 'bold','font-size': '16'
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
          'fill-r': 1,
          'fill-cx': .1,
          'fill-cy': .1,
          'stroke-width': 1.4,
         'stroke': '#ffffff',
          'fill': '#BB94BF',
          'fill-opacity': 1,
           'r': '10',
          'z-index': '998',
        }"
            >
            </geometry-rect>
        </geometry-element>



        <policy-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="canvas.isReadOnlyModel"
                :image="image"
                @close="closePanel"
        ></policy-definition-panel>
    </div>
</template>

<script>
    import Element from "./HexagonalModelElement";
    import PolicyDefinitionPanel from "../../es-modeling/panels/PolicyDefinitionPanel";

    export default {
        mixins: [Element],
        name: 'policy-hexagonal',
        props: {},
        components:{PolicyDefinitionPanel},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.PolicyHexagonal'
            },
            createNew(elementId, x, y, width, height, description, label) {

                return {
                    _type: 'org.uengine.modeling.model.Policy',
                    name: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    author: null,
                    boundedContext: {},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Policy',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.PolicyHexagonal',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    relationEventInfo: [],
                    relationAggregateInfo: [],
                    relationViewInfo: []
                }
            },

        },
        data: function () {
            return {
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
            };
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
