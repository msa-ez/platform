<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                movable
                :id.sync="value.relationView.id"
                :vertices.sync="vertices"
                :label="value.name"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:removeShape="onRemoveShape"
                :_style="{
                    'arrow-start': 'none',
                    'arrow-end': 'none',
                    'stroke-width': value.size,
                    'stroke': value.color,
                    'stroke-dasharray': value.dashStyle,
                }"
        ></edge-element>

        <sticky-model-panel
                v-if="propertyPanel"
                v-model="value"
                @close="closePanel"
        ></sticky-model-panel>
    </div>
</template>

<script>
    import Element from './UserStoryMapElement'

    export default {
        mixins: [Element],
        name: 'user-story-map-line-element',
        props: {},
        computed: {
            className() {
                return 'UserStoryMapLineElement'
            },
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`
            },
            createNew(elementId, vertices) {
                return {
                    _type: this.className(),
                    name: '',
                    relationView: {
                        id: elementId,
                        style: JSON.stringify(),
                        value: vertices,
                    },
                    size: 10,
                    color: '#000000',
                    dashStyle: '',
                    imgSrc: this.imgSrc(),
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
            "value.color": {
                deep: true,
                handler: function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        this.refreshImg()
                    }
                }
            },
            "value.size": {
                deep: true,
                handler: function(newVal, oldVal) {
                    if (newVal != oldVal) {
                        this.refreshImg()
                    }
                }
            }
        },
        methods: {
        },

    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
