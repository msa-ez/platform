<template>
    <div>
        <geometry-element
                :selectable="!movingElement"
                :movable="!canvas.isReadOnlyModel && !movingElement"
                :resizable="!canvas.isReadOnlyModel && !movingElement && isEditElement"
                :deletable="!canvas.isReadOnlyModel && isEditElement"
                connectable
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
                    'font-color': fontColor,
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 0,
                        'stroke': value.color ? value.color : '#F1A746',
                        'fill': value.color ? value.color : '#F1A746',
                        'fill-opacity': 1,
                        'r': '1',
                    }"
            ></geometry-rect>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
        </geometry-element>
       
        <sticky-model-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :showError="showError"
                :widthStyle="panelStyle"
                @close="closePanel"
        ></sticky-model-panel>

    </div>
</template>

<script>
    import Element from './StickyModelElement'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'stickyNoteBoard',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'StickyNoteBoard'
            },
            createNew(elementId, x, y, width, height, description, color) {
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
                    color: color,
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
                fontColor: this.value.color == '#F8D454' ? '#000000' : '#FAFAFA'
            };
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
            "value.color": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    this.fontColor = newVal == '#F8D454' ? '#000000' : '#FAFAFA'
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 100)
            },
            "value.elementView.width": {
                handler(newVal) {
                    var me = this
                    var obj = {
                        type: me.value._type,
                        width: newVal,
                        height: me.value.elementView.height
                    }
                    me.$store.dispatch('resize', obj)
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
                    me.$store.dispatch('resize', obj)
                }
            },
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
