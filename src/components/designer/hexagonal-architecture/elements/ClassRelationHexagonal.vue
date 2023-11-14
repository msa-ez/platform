<template>
    <div>
        <edge-element
                selectable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :movable="!canvas.isReadOnlyModel"
                :id.sync="value.hexagonalView.id"
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                v-on:removeShape="onRemoveShape"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                :image.sync="refreshedImg"
        >
        </edge-element>

        <class-relation-panel
                v-if="propertyPanel"
                v-model="value"
                :readOnly="canvas.isReadOnlyModel"
                :image="image"
                @close="closePanel"
        ></class-relation-panel>
    </div>
</template>

<script>

    import ClassRelationPanel from "../../es-modeling/panels/ClassRelationPanel";
    import Element from "./HexagonalModelElement";

    export default {
        mixins: [Element],
        components:{ClassRelationPanel},
        name: 'class-relation-hexagonal',
        data: function () {
            return {
                name: '',
            }
        },
        created: function () {
        },
        computed: {
            defaultStyle() {
                return {
                    "arrow-start": "none",
                    "arrow-end": "block",
                }
            },
            className() {
                return 'org.uengine.modeling.model.RelationHexagonal'
            },
            style_() {
                if (this.value.hexagonalView.style) {
                    if (typeof this.value.hexagonalView.style == 'string') this.value.hexagonalView.style = JSON.parse(this.value.hexagonalView.style)
                    return this.value.hexagonalView.style
                }
                return this.defaultStyle
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: 'org.uengine.modeling.model.Relation',
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    relationView: {
                        id: elementId,
                        style: null,
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.RelationHexagonal',
                        'id' : elementId,
                        'style' : null,
                        'value': vertices,
                        'from': from.hexagonalView.id,
                        'to': to.hexagonalView.id,
                        needReconnect: true,
                    },
                    sourceMultiplicity: 1,
                    targetMultiplicity: 1,
                }
            },
            vertices: {
                get: function () {
                    try {
                        return JSON.parse(this.value.hexagonalView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.hexagonalView.value = JSON.stringify(val);
                }
            }
        },
        watch: {},
        mounted: function () {
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
