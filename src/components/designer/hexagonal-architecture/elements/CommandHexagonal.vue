<template>
    <div>
        <geometry-element
                selectable
                :movable="true"
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
                'font-weight': 'bold','font-size': '16',
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
          'fill': '#5099F7',
          'fill-opacity': 1,
          'r': '10',
          'z-index': '998',
        }"
            >
            </geometry-rect>
        </geometry-element>

        <command-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="canvas.isReadOnlyModel"
                :image="image"
                @close="closePanel"
        ></command-definition-panel>

    </div>
</template>

<script>
    import CommandDefinitionPanel from "../../es-modeling/panels/CommandDefinitionPanel";
    import Element from "./HexagonalModelElement";

    export default {
        mixins: [Element],
        components:{CommandDefinitionPanel},
        name: 'command-hexagonal',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.CommandHexagonal'
            },
            createNew(elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.Command',
                    name: '',
                    namePlural: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    author: null,
                    aggregate: {},
                    boundedContext: {},

                    // alertURL: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/alert-icon.png',
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Command',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'z-index': 999
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.CommandHexagonal',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    //new pannel
                    isRestRepository: true,
                    controllerInfo: {
                        apiPath: '',
                        method: 'GET'
                    },
                    restRepositoryInfo: {
                        method: 'GET'
                    },
                    relationEventInfo: [],
                    relationCommandInfo: [],
                    trigger: '@PostPersist',

                }
            }
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
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
