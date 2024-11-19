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
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
            <sub-elements>
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH"
                        :sub-top="0"
                        :subStyle="{
                            'stroke': '#FFA400',
                            'fill': '#FFA400',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< enumeration >>'"
                ></text-element>

                <text-element
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

            <sub-elements v-if="value.items">
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.itemH"
                        :sub-top="value.elementView.titleH"
                        :subStyle="{
                            'stroke': '#050038',
                            'fill': '#050038',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.itemH"
                        :sub-top="value.elementView.titleH"
                        :sub-left="10"
                        :subStyle="{'font-size': '14px', 'text-anchor':'start', 'font-color': '#FAFAFA'}"
                        :text="attributeLabels"
                ></text-element>
            </sub-elements>
        </group-element>

        <!-- <div v-for="(item, index) in value.items" :key="'item'+index">
            <uml-class-text
                    :type="'item'"
                    :styles="{
                        'index': index,
                        'x': value.elementView.x,
                        'y': value.elementView.y,
                        'label': itemLabels[index],
                        'width': value.elementView.width - 20,
                        'height': value.elementView.height,
                        'titleH': value.elementView.titleH,
                        'subEdgeH': value.elementView.subEdgeH,
                    }"
            ></uml-class-text>
        </div> -->

        <uml-enum-panel
                v-if="propertyPanel"
                v-model="value"
                :titleName="'Enumeration'"
                :img="imgSrc"
                :isReadOnly="!isEditElement"
                @close="closePanel"
        ></uml-enum-panel>
    </div>
</template>

<script>
    import Element from './UMLClassElement'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    var changeCase = require('change-case');
    export default {
        mixins: [Element],
        name: 'enum-class-definition',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_enum.png`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.uml.model.enum'
            },
            createNew(elementId, x, y, width, height, angle) {
                return {
                    _type: this.className(),
                    id: elementId,
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
                        'titleH': 50,
                        'itemH': 90,
                        'subEdgeH': 120
                    },
                    selected: false,
                    items: [],
                    useKeyValue: false,
                }
            },
            name() {
                try {
                    if (this.value.displayName) {
                        return this.value.displayName;
                    }
                    return this.value.name
                } catch (e) {
                    return "";
                }
            },
            itemLabels() {
                try {
                    var me = this
                    var arr = []
                    if (me.value.items.length > 0) {
                        me.value.items.forEach(function (item) {
                            arr.push(item.value)
                        })
                    }
                    return arr
                } catch (e) {
                    return "";
                }
            },
            attributeLabels() {
                try {
                    // var me = this
                    // var arr = []
                    // if (me.value.fieldDescriptors.length > 0) {
                    //     me.value.fieldDescriptors.forEach(function (item) {
                    //         var labelName = item.displayName ? item.displayName : item.name;
                    //         var label = item.label ? item.label : '- ' + labelName + ': ' + item.className;
                    //         arr.push(label);
                    //     });
                    // }
                    // return arr
                    var me = this
                    var text = '';
                    me.value.items.forEach((item) => {
                        var labelName = item.value;
                        var label = item.value;
                        text += label + '\n';
                    })
                    return text;
                } catch (e) {
                    return "";
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
            "value.name": {
                deep: true,
                handler: function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        this.value.nameCamelCase = changeCase.camelCase(newVal)
                        this.value.namePascalCase = changeCase.pascalCase(newVal)
                    }
                }
            },
            "value.elementView.height": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal != oldVal) {
                        me.setHeight();
                    }
                }
            },
        },
        mounted: function () {
            var me = this

            if (me.value.name !== "") {
                me.value.nameCamelCase = changeCase.camelCase(me.value.name)
                me.value.namePascalCase = changeCase.pascalCase(me.value.name)
            }
        },
        methods: {
            setHeight() {
                var me = this
                
                me.value.elementView.itemH = me.value.elementView.height - me.value.elementView.titleH

                me.refreshImg();
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
