<template>
    <div>
        <group-element
                selectable
                movable
                resizable
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:click="clicked"
                v-on:addToGroup="onAddToGroup"
                v-on:removeShape="onRemoveShape"
                :label.sync="value.name"
                :_style="{
                    'vertical-align': 'top',
                    'font-weight': 'bold',
                    'font-size': '16'
                }"
        >
            <geometry-rect
                :_style="{
                    'fill-r': 1,
                    'fill-cx': .1,
                    'fill-cy': .1,
                    'stroke-width': 1.4,
                    'text-anchor': 'start',
                    'stroke': '#000000',
                    'fill-opacity': 1,
                    'vertical-align': 'top',
                    'font-weight': 'bold',
                    'font-size': '16',
                    'r': '1'
                }"
            ></geometry-rect>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <image-element
                    v-bind:image="value.icon"
                    :sub-width="'20px'"
                    :sub-height="'20px'"
                    :sub-top="'10px'"
                    :sub-right="'10px'"
            ></image-element>
            </sub-elements>

            <sub-elements>
                <business-sub-controller
                        :perspective="value.perspective"
                        :elementId="value.elementView.id"
                ></business-sub-controller>
            </sub-elements>
        </group-element>
    </div>
</template>

<script>
    import BusinessModelElement from "./BusinessModelElement";
    import GroupElement from "../../../opengraph/shape/GroupElement";
    import ImageElement from "../../../opengraph/shape/ImageElement";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        components: {
            ImageElement,
            GroupElement,
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        mixins: [BusinessModelElement],
        name: 'business-model-perspective',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective'
            },
            createNew(elementId, x, y, width, height) {
                return {
                    _type: this.className(),
                    name: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 300,
                        'height': 300,
                        'style': JSON.stringify({})
                    },
                }
            }
        },
        data: function () {
            return {

            };
        },
        created: function () {
        },
        watch: {},
        mounted: function () {
            var me = this

            var boundedId = this.value.elementView.id

            var $tr = $('#' + boundedId);
            $tr.parent().children().first().before($tr)

        },
        methods: {

            clicked(){

                this.$emit('click')
            }

        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
