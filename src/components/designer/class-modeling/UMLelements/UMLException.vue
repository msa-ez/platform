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
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:addedToGroup="onAddedToGroup"
                :image.sync="refreshedImg"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold', 'font-size': '14',
                }"
        >
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

            <sub-elements>
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :subStyle="{
                            'stroke': '#FFA400',
                            'fill': '#FFA400',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< Exception >>'"
                ></text-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="10"
                        :sub-left="0"
                        :text.sync="name"
                        :subStyle="{
                            'font-size': '14', 'font-weight': 'bold',
                        }"
                ></text-element>
            </sub-elements>

            <sub-elements>
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.height-titleH"
                        :sub-top="titleH"
                        :subStyle="{
                            'stroke': '#050038',
                            'fill': '#050038',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.height-titleH"
                        :sub-top="titleH"
                        :sub-left="10"
                        :text.sync="value.message"
                        :subStyle="{
                            'text-anchor': 'start', 
                            'font-size': '14',
                            'font-color': '#FAFAFA',
                        }"
                ></text-element>
            </sub-elements>
        </group-element>

        <uml-exception-panel
                v-if="propertyPanel"
                v-model="value"
                :titleName="'Exception Class'"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></uml-exception-panel>
    </div>
</template>

<script>
    import Element from './UMLClassElement'

    var changeCase = require('change-case');

    export default {
        mixins: [Element],
        name: 'uml-exception-class',
        props: {},
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_exception.png`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.uml.model.Exception'
            },
            createNew(elementId, x, y, width, height, angle) {
                return {
                    _type: this.className(),
                    name: '',
                    nameCamelCase: '',
                    namePascalCase: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': angle,
                    },
                    selected: false,
                    message: '',
                    httpStatus: '',
                }
            },
            name() {
                try {
                    return this.value.name
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {
                titleH: 50,
            };
        },
        created: function () {
        },
        watch: {
            "name": {
                deep: true,
                handler: function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        this.value.nameCamelCase = changeCase.camelCase(newVal);
                        this.value.namePascalCase = changeCase.pascalCase(newVal);
                        this.value.message = changeCase.pascalCase(newVal);
                    }
                }
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
