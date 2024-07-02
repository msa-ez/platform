<template>
    <div>
        <geometry-element
                :selectable="!movingElement"
                :movable="!canvas.isReadOnlyModel && !movingElement"
                :resizable="!canvas.isReadOnlyModel && !movingElement && isEditElement"
                :deletable="!canvas.isReadOnlyModel && isEditElement"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                v-on:customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'text-anchor': 'middle',
                }"
        >
            <geometry-rect
                    v-if="!movingElement"
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'fill-opacity': 0,
                        'stroke-width': 0,
                        r: '1',
                    }"
            >
            </geometry-rect>

            <sub-elements>
                <text-element
                        :sub-width="'100%'"
                        :sub-top="0"
                        :sub-left="0"
                        :text.sync="name"
                        :subStyle="{'font-size': fontSize, 'font-weight': 'bold'}"
                ></text-element>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
        </geometry-element>

        <sticky-model-panel
                v-if="propertyPanel"
                v-model="value"
                :showError="showError"
                @close="closePanel"
        ></sticky-model-panel>
    </div>
</template>

<script>
    import Element from './StickyModelElement'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'sticky-text-element',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            className() {
                return 'StickyTextElement'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/text_element.png`
            },
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: 'Text',
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
            name() {
                try {
                    return this.value.name
                } catch (e) {
                    return ''
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
                fontSize: Math.floor(this.value.elementView.width * 0.5)
            };
        },
        created: function () {
        },
        watch: {
            "value.elementView.width": function(val) {
                this.fontSize = Math.floor(val * 0.5)
            },
        },
        methods: {
            closePanel() {
                if (this.value.name.length == 0) {
                    this.propertyPanel = true
                    return
                } else {
                    this.propertyPanel = false
                    this.selected = false
                    this.staySelected = false
                }
            }
        }

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
