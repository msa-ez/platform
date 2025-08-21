<template>
    <div>
        <group-element
                selectable
                movable
                resizable
                deletable
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
                v-on:addToGroup="onAddToGroup"
                :label.sync="name"
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
                        'stroke': '#000000',
                        'stroke-dasharray': '- ',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
            <uml-sub-controller
                    v-if="isEditElement"
                    :value="value" 
            ></uml-sub-controller>
        </group-element>
    </div>
</template>

<script>
    import Element from './UMLClassElement'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'uml-class-group',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'ClassGroup'
            },
            createNew(elementId, x, y, width, height, name, angle) {
                return {
                    _type: this.className(),
                    name: name,
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
                    aggregateRoot: null,
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
                umlCanvas: null,
            };
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
