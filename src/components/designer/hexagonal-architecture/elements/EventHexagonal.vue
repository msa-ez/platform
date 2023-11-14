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
                'font-weight': 'bold',
                'font-size': '16',
                'z-index':'999',
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
          'fill': '#F1A746',
          'fill-opacity': 1,
           'r': '10',
          'z-index': '998',
        }">
            </geometry-rect>
        </geometry-element>

        <domain-event-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="canvas.isReadOnlyModel"
                :image="image"
                @close="closePanel"
        ></domain-event-definition-panel>

    </div>
</template>

<script>
    import DomainEventDefinitionPanel from "../../es-modeling/panels/DomainEventDefinitionPanel";
    import Element from './HexagonalModelElement'

    export default {
        mixins: [Element],
        name: 'event-hexagonal',
        props: {},
        components:{DomainEventDefinitionPanel},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.EventHexagonal'
            },
            createNew(elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.Event',
                    name: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    author: null,
                    aggregate: {},
                    boundedContext: {},
                    fieldDescriptors: [
                        {
                            _type: "org.uengine.model.FieldDescriptor",
                            name: "id",
                            className: "Long",
                            nameCamelCase: 'id',
                            namePascalCase: 'Id',
                            isKey: true
                        }
                    ],
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Event',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.EventHexagonal',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    alertURL: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/alert-icon.png',
                    checkAlert: true,
                    relationPolicyInfo: [],
                    relationCommandInfo: [],
                    trigger: '@PostPersist',
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
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
