<template>
    <div>
        <geometry-element
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
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"

                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:removeShape="onRemoveShape"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"

                :label.sync="namePanel"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                :_style="{
                    'fill-r': 1,
                    'fill-cx': .1,
                    'fill-cy': .1,
                    'stroke-width': 10,
                    'stroke': '#FFAD71',
                    'fill': '#FFAD71',
                    'fill-opacity': 1,
                    'r': '1'
                }"
            >
            </geometry-rect>


            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< cost structure >>'">
                </text-element>
            </sub-elements>
        </geometry-element>

        <business-model-panel
                v-if="propertyPanel"
                v-model="value"
                :image="image"
                :isReadOnly="!isEditElement"
                @close="closePanel"
        ></business-model-panel>


    </div>
</template>

<script>
    import BusinessModelElement from "./BusinessModelElement";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [BusinessModelElement],
        name: 'cost-structure',
        components:{
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        props: {},
        computed: {
            className() {
                return 'org.uengine.modeling.business.CostStructure'
            },
            createNew(elementId, x, y, width, height, description, label) {
                return {
                    _type: this.className(),
                    name: label,
                    label: label,
                    description: description,
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    }
                }
            },

        },
        data: function () {
            return {
                // isRead: false,
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
            };
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
