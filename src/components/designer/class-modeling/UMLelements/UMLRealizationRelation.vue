<template>
    <div>
        <edge-element
                :selectable="selectable"
                :movable="movable"
                :deletable="deletable"
                :connectable="connectable"
                :id="value.relationView.id"
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="name"
                :fromLabel="value.fromLabel ? value.fromLabel : ''"
                :toLabel="value.toLabel ? value.toLabel : ''"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
        ></edge-element>

        <uml-relation-panel
                v-if="propertyPanel"
                v-model="value"
                :titleName="'UML Class Relation'"
                :img="imgSrc"
                :readOnly="canvas.isReadOnlyModel"
                @close="closePanel"
        ></uml-relation-panel>
    </div>
</template>

<script>
    import Element from './UMLClassElement'

    var changeCase = require('change-case');
    var pluralize = require('pluralize');

    export default {
        mixins: [Element],
        name: 'uml-realization-relation',
        props: {
            value: Object
        },
        computed: {
            defaultStyle() {
                return {}
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/entity.png`
            },
            style_() {
                var style = {
                    "arrow-start": "none",
                    "arrow-end": "open_block",
                    "stroke-dasharray": "- "
                };
                return style;
            },
            className() {
                return 'uml.realization.Relation'
            },
            createNew(elementId, from, to, vertices) {
                return {
                    name: "",
                    _type: this.className(),
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    selected: false,
                    relationView: {
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none"
                        }),
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true
                    },
                    relationType: "Realization",
                    fromLabel: "",
                    toLabel: "",
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
            },
            name() {
                try {
                    if(this.value.relationType.includes('Generalization')) {
                        return "";
                    } else {
                        return this.value.name;
                    }
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {
            };
        },
        watch: {
        },
        created: function () {
            var me = this
        },
        mounted: function () {
            var me = this

            var from = me.canvas.value.elements[me.value.from]
            var to = me.canvas.value.elements[me.value.to]

            if(from.relations && !from.relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[me.value.from].relations.push(me.value.relationView.id)
            }
            if(to.relations && !to.relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[me.value.to].relations.push(me.value.relationView.id)
            }

        },
        beforeDestroy() {
            var me = this

            var from = me.canvas.value.elements[me.value.from]
            var to = me.canvas.value.elements[me.value.to]

            if(from && from.relations && from.relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[me.value.from].relations.splice(from.relations.indexOf(me.value.relationView.id), 1)
            }
            if(to && to.relations && to.relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[me.value.to].relations.splice(to.relations.indexOf(me.value.relationView.id), 1)
            }
        },
        methods: {
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>