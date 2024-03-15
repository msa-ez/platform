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
                :image.sync="refreshedImg"
                :label.sync="value.name"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold', 
                    'font-size': '16',
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 10,
                        'stroke': '#F8D454',
                        'fill': '#F8D454',
                        'fill-opacity': 1,
                        'r': '1',
                    }"
            ></geometry-rect>

            <sub-elements>
                <image-element
                        :image="userImage"
                        :sub-width="actorImgSizeW"
                        :sub-height="actorImgSizeH"
                        :sub-left="actorHorizon"
                        :sub-top="actorVertical"
                ></image-element>
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

    export default {
        mixins: [Element],
        name: 'persona-element',
        props: {},
        computed: {
            actorShortSide() {
                if (this.value.elementView.width < this.value.elementView.height) {
                    return this.value.elementView.width
                }
                return this.value.elementView.height
            },
            actorImgSizeW() {
                return this.actorShortSide * 0.4
            },
            actorImgSizeH() {
                return this.actorShortSide * 0.6
            },
            actorHorizon() {
                return this.value.elementView.width / 2 - this.actorImgSizeW / 2
            },
            actorVertical() {
                return this.value.elementView.height / 2 - this.actorImgSizeH / 2
            },
            actorHeadSize() {
                if (this.value.elementView.width < this.value.elementView.height) {
                    return this.value.elementView.width * 0.2
                }
                return this.value.elementView.height * 0.2
            },
            actorBody() {
                var start = [50, 45.4]
                var end = [50, 68]

                return {'start': start, 'end': end}
            },
            actorArm() {
                var start = [28, 50.4]
                var end = [72, 50.4]
                return {'start': start, 'end': end}
            },
            actorLegL() {
                var start = [50, 68]
                var end = [27, 80]
                return {'start': start, 'end': end}
            },
            actorLegR() {
                var start = [50, 68]
                var end = [72, 80]
                return {'start': start, 'end': end}
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'Persona'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/event/actor.png`
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
                userImage: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/actor_in_actor.png',
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
