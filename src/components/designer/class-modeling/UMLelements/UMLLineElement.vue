<template>
    <div>
        <edge-element
                :selectable="selectable"
                :movable="movable"
                :deletable="deletable"
                :connectable="connectable"
                :id.sync="value.relationView.id"
                :vertices.sync="vertices"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                :_style="{
                    'arrow-start': 'none',
                    'arrow-end': 'none',
                    'stroke-width': value.size,
                    'stroke': value.color,
                    'stroke-dasharray': value.dashStyle,
                }"
        ></edge-element>

        <uml-text-line-panel
                v-if="propertyPanel"
                v-model="value"
                :titleName="'Line'"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></uml-text-line-panel>
    </div>
</template>

<script>
    import Element from './UMLClassElement'

    export default {
        mixins: [Element],
        name: 'uml-line-element',
        props: {},
        computed: {
            className() {
                return 'org.uengine.modeling.model.Line'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`
            },
            createNew(elementId, vertices) {
                return {
                    _type: this.className(),
                    name: '',
                    from: elementId,
                    to: elementId,
                    description: '',
                    relationView: {
                        id: elementId,
                        style: JSON.stringify(),
                        value: vertices,
                    },
                    size: 10,
                    color: '#000000',
                    dashStyle: '',
                    imgSrc: this.imgSrc(),
                    vertices: vertices,
                }
            },
            vertices: {
                get: function () {
                    try {
                        return JSON.parse(this.value.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.relationView.value = JSON.stringify(val);
                }
            }
        },
        data: function () {
            return {
            };
        },
        created: function () {
        },
        watch: {
        },
        methods: {
        },

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
