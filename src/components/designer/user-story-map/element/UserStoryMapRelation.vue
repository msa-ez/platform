<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                movable
                :id.sync="value.relationView.id"
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:removeShape="onRemoveShape"
        ></edge-element>
    </div>
</template>

<script>
    import Element from './UserStoryMapElement'

    export default {
        mixins: [Element],
        name: 'user-story-map-relation',
        props: {
            value: Object
        },
        data: function () {
            return {
                name: '',
            }
        },
        created: function () {
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'user-story-map-relation'
            },
            style_() {
                var style = {}
                return style
            },
            createNew(elementId, from, to, vertices) {
                return {
                    _type: this.className(),
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    relationView: {
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none",
                        }),
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    sourceMultiplicity: 1,
                    targetMultiplicity: 1,
                }
            },
            vertices: {
                get: function () {
                    var style;
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
        watch: {},
        mounted: function () {
        },
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
