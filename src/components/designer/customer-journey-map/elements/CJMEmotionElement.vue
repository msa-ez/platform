<template>
    <div>
        <geometry-element
            :selectable="!movingElement"
            :movable="!canvas.isReadOnlyModel && !movingElement"
            :resizable="!canvas.isReadOnlyModel && !movingElement && isEditElement"
            :deletable="!canvas.isReadOnlyModel && isEditElement"
            :connectable="!canvas.isReadOnlyModel"
            :id.sync="value.elementView.id"
            :x.sync="value.elementView.x"
            :y.sync="value.elementView.y"
            :width.sync="value.elementView.width"
            :height.sync="value.elementView.height"
            :customMoveActionExist="canvas.isCustomMoveExist"
            v-on:customMoveAction="delayedMove"
            v-on:moveShape="onMoveShape"
            v-on:removeShape="onRemoveShape"
            v-on:dblclick="openPanel"
            v-on:selectShape="selectedActivity"
            v-on:deSelectShape="deSelectedActivity"
            :label.sync="value.name"
            :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold', 
                'font-size': '16',
                'label-width': labelWidth,
            }"
        >
            <geometry-rect
                :_style="{
                    'fill-r': 1,
                    'fill-cx': .1,
                    'fill-cy': .1,
                    'stroke-width': 1.4,
                    'stroke': '#326ce5',
                    fill: '#326ce5',
                    'stroke-opacity': 0,
                    'fill-opacity': 0,
                    r: '1',
                    'z-index': '998'
                }"
            ></geometry-rect>
            <sub-elements>
                <image-element
                    :image="value.imgSrc"
                    :sub-bottom="0"
                    :sub-left="0"
                    :sub-width="value.elementView.width"
                    :sub-height="value.elementView.height"
                >
                </image-element>
            </sub-elements>
        </geometry-element>

        <cjm-model-panel
            v-if="propertyPanel"
            v-model="value"
            :isReadOnly="!isEditElement"
            :showError="showError"
            :widthStyle="panelStyle"
            @close="closePanel"
        ></cjm-model-panel>
    </div>
</template>

<script>
    import Element from './CJMModelElement'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    import ImageElement from "../../../opengraph/shape/ImageElement.vue";


    export default {
        mixins: [Element],
        name: 'cjm-emotion-element',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            ImageElement
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'CJMEmotionElement'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion3.svg`
            },
            createNew(elementId, x, y, width, height, description) {
                return {
                    _type: this.className(),
                    name: '',
                    description: description,
                    author: null,
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    imgSrc: this.imgSrc(),
                }
            },
            showError() {
                var me = this
                if (me.value.name == '') {
                    return 'Must have a name.'
                }
                return null
            },
        },
        data: function () {
            return {
            };
        },
        created: function () {
        },
        watch: {
            "getDescription": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
            "showError": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
            "value.elementView.width": {
                handler(newVal) {
                    var me = this
                    var obj = {
                        type: me.value._type,
                        width: newVal,
                        height: me.value.elementView.height
                    }
                    if(me.$store) me.$store.dispatch('resize', obj)
                }
            },
            "value.elementView.height": {
                handler(newVal) {
                    var me = this
                    var obj = {
                        type: me.value._type,
                        width: me.value.elementView.width,
                        height: newVal
                    }
                    if(me.$store) me.$store.dispatch('resize', obj)
                }
            },
        },
        methods: {}

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
