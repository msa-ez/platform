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
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold', 
                    'font-size': '16',
                    'font-color':'#FAFAFA',
                    'label-width': labelWidth,
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-polygon
                :vertices="[
                    [0, 0],    // 왼쪽 하단
                    [50, 0],   // 오른쪽 하단 (화살표 꼬리)
                    [55, 40],   // 오른쪽 끝점 (화살표 머리)
                    [50, 75],   // 오른쪽 상단 (화살표 꼬리)
                    [0, 75],    // 왼쪽 상단
                    [0, 25]     // 왼쪽 하단으로 돌아옴
                ]"
                :_style="{
                    'font-family' :'나눔스퀘어네오',
                    'fill-r': 1,
                    'fill-cx': .1,
                    'fill-cy': .1,
                    'stroke-width': 0,
                    'stroke': '#535353',
                    'fill': '#535353',
                    'fill-opacity': 1,
                    'font-weight': 'bold',
                    'font-size': '16',
                    'vertical-align': 'top',
                    'r': '1',
                }"
            ></geometry-polygon>
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <text-element
                    :sub-width="'100%'"
                    :sub-height="titleH"
                    :sub-top="0"
                    :sub-left="0"
                    :subStyle="{'font-color':'white'}"
                    :text="'<< Phases >>'"
                >
                </text-element>
                <text-element
                    :sub-width="'100%'"
                    :subStyle="{'font-color':'white','font-size': '16px', 'font-weight': 'bold'}"
                    :text="value.name"
                    :sub-height="subjectHeight"
                    :sub-top="subjectTop"
                    :sub-left="0"
                >
                </text-element>
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

    export default {
        mixins: [Element],
        name: 'phase-element',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            subjectTop() {
                return this.value.elementView.height / 2
            },
            subjectHeight() {
                return 8
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'Phase'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/event/issue.png`
            },
            createNew(elementId, x, y, width, height, description, name) {
                return {
                    _type: this.className(),
                    name: name || '',
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
        }

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
