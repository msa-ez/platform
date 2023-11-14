<template>
    <div>
        <group-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                :connectable="connectable"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                :label="!value.isVO && !value.isAggregateRoot ? namePanel : ''"
                :image="refreshedImg"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold', 'font-size': '14',
                    'vertical-align': 'top'
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
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>

            <!-- title -->
            <sub-elements>
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH"
                        :subStyle="{
                            'stroke': '#FFA400',
                            'fill': '#FFA400',
                            'fill-opacity': 1,
                        }"
                        :image="refreshedImg"
                ></rectangle-element>
                <text-element
                        v-if="value.isAggregateRoot"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< AggregateRoot >>'"
                ></text-element>
                <text-element
                        v-if="value.isVO"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< ValueObject >>'"
                ></text-element>
                <text-element
                        v-if="value.isVO || value.isAggregateRoot"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH"
                        :sub-top="10"
                        :sub-left="0"
                        :text="getNamePanel"
                        :subStyle="{
                            'font-size': '14', 'font-weight': 'bold',
                        }"
                ></text-element>
            </sub-elements>

            <!-- attribute -->
            <sub-elements v-if="value.fieldDescriptors">
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.fieldH"
                        :sub-top="value.elementView.titleH"
                        :subStyle="{
                            'stroke': '#050038',
                            'fill': '#050038',
                            'fill-opacity': 1,
                        }"
                        :image="refreshedImg"
                ></rectangle-element>
            </sub-elements>

            <!-- operation -->
            <sub-elements v-if="value.operations">
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.methodH"
                        :sub-top="value.elementView.subEdgeH"
                        :subStyle="{
                            'stroke': '#7CAFC4',
                            'fill': '#7CAFC4',
                            'fill-opacity': 1,
                            'z-index': -1
                        }"
                        :image="refreshedImg"
                ></rectangle-element>
            </sub-elements>

            <uml-sub-controller
                    v-if="!canvas.isReadOnlyModel"
                    :value="value" 
            ></uml-sub-controller>
        </group-element>

        <div v-if="value.fieldDescriptors">
            <div v-for="(attr, index) in value.fieldDescriptors" :key="'a'+index">
                <uml-class-text
                        v-model="value"
                        :type="'attribute'"
                        :readOnly="canvas.isReadOnlyModel"
                        :styles="{
                            'name': attr.name,
                            'index': index,
                            'x': value.elementView.x,
                            'y': value.elementView.y,
                            'label': attributeLabels[index],
                            'width': value.elementView.width - 20,
                            'height': value.elementView.height,
                            'titleH': value.elementView.titleH,
                            'subEdgeH': value.elementView.subEdgeH,
                        }"
                ></uml-class-text>
            </div>
        </div>

        <div v-if="value.operations">
            <div v-for="(item, index) in value.operations" :key="'method'+index">
                <uml-class-text
                        v-model="value"
                        :type="'operation'"
                        :readOnly="canvas.isReadOnlyModel"
                        :styles="{
                            'name': item.name,
                            'index': index,
                            'x': value.elementView.x,
                            'y': value.elementView.y,
                            'label': operationLabels[index],
                            'width': value.elementView.width - 20,
                            'height': value.elementView.height,
                            'titleH': value.elementView.titleH,
                            'subEdgeH': value.elementView.subEdgeH,
                        }"
                ></uml-class-text>
            </div>
        </div>

        <uml-class-panel
                v-if="propertyPanel"
                v-model="value"
                :entities="canvas.value"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></uml-class-panel>
    </div>
</template>

<script>
    import UMLClass from '../UMLClassDefinition'
    const VODefinitions = require("../../../modeling/generators/VODefinitions");

    export default {
        mixins: [UMLClass],
        name: 'uml-vo-class-file',
        props: {},
        computed: {
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.uml.model.vo.file.Class'
            },
            createNew(elementId, x, y, width, height, angle) {
                return {
                    _type: this.className(),
                    name: 'File',
                    namePascalCase: 'File',
                    nameCamelCase: 'file',
                    fieldDescriptors: VODefinitions["File"],
                    operations: [],
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 200,
                        'height': 150,
                        'style': JSON.stringify({}),
                        'angle': angle,
                        'titleH': 50,
                        'subEdgeH': 150,
                        'fieldH': 100,
                        'methodH': 0
                    },
                    selected: false,
                    parentOperations: [],
                    relationType: null,
                    isVO: true,
                    relations: [],
                    groupElement: null,
                    isAggregateRoot: false,
                }
            },
        },
        data: function () {
            return {
            };
        },
        created: function () {
        },
        watch: {
            'value.name'(){
                this.value._type = 'org.uengine.uml.model.vo.Class';
            },
            'value.fieldDescriptors'() {
                this.value._type = 'org.uengine.uml.model.vo.Class';
            },
            'value.operations'() {
                this.value._type = 'org.uengine.uml.model.vo.Class';
            },
        },
        mounted: function () {
        },
        methods: {
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
