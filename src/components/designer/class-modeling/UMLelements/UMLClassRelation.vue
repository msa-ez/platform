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
                :isReadOnly="!isEditElement"
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
        name: 'uml-class-relation',
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
                var style = {};
                if (this.value.relationType.endsWith("Aggregation")) {
                    style = {
                        "arrow-end": ("01".indexOf(this.value.sourceMultiplicity) > -1 ? "none" : "diamond"),
                        "arrow-start": ("01".indexOf(this.value.targetMultiplicity) > -1 ? "none" : "diamond")
                    };
                    if ("01".indexOf(this.value.sourceMultiplicity) == -1) {
                        if (!style.marker) style.marker = {};
                        style.marker.end = {
                            'id': 'OG.marker.AggregationMarker',
                            'size': [10, 8]
                        }
                    }
                    if ("01".indexOf(this.value.targetMultiplicity) == -1) {
                        if (!style.marker) style.marker = {};
                        style.marker.start = {
                            'id': 'OG.marker.AggregationMarker',
                            'size': [10, 8]
                        }
                    }
                } else if (this.value.relationType.endsWith("Generalization")) {
                    style = {
                        "arrow-start": "none",
                        'marker': {
                            'end': {
                                'id': 'OG.marker.GeneralizationMarker',
                                'size': [8, 8]
                            }
                        }
                    }
                } else if (this.value.relationType.endsWith("Composition")) {
                    style = {
                        "arrow-start": "diamond",
                        "arrow-end": "none",
                        'marker': {
                            'start': {
                                'id': 'OG.marker.CompositionMarker',
                                'size': [10, 8]
                            }
                        }
                    };
                }
                return style;
            },
            className() {
                return 'org.uengine.uml.model.Relation'
            },
            createNew(elementId, from, to, vertices, type, targetMultiplicity) {
                return {
                    name: "",
                    id: elementId,
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
                    sourceMultiplicity: "1",
                    targetMultiplicity: targetMultiplicity,
                    relationType: type,
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
                otherwise: false
            };
        },
        watch: {
            value: {
                deep: true,
                handler: function () {
                    // this.createAssociationFields()
                    // this.$emit("input", this.value)
                }
            },
        },
        created: function () {
            var me = this
            if(me.value.name == '' && !me.value.relationType.includes('Generalization')) {
                if(me.value.relationType.includes('Aggregation') || me.value.relationType.includes('Composition') ) {
                    me.value.name = pluralize(me.value.targetElement.nameCamelCase)
                } else {
                    me.value.name = me.value.targetElement.nameCamelCase
                }
            }

            if (this.value && this.value.relationView) {
                this.value.from = this.value.relationView.from;
                this.value.to = this.value.relationView.to;
            }
            if (!OG.marker.GeneralizationMarker) {
                OG.marker.GeneralizationMarker = function () {
                    OG.marker.GeneralizationMarker.superclass.call(this);
                    this.MARKER_ID = 'OG.marker.GeneralizationMarker';
                };
                OG.marker.GeneralizationMarker.prototype = new OG.marker.IMarker();
                OG.marker.GeneralizationMarker.superclass = OG.marker.IMarker;
                OG.marker.GeneralizationMarker.prototype.constructor = OG.marker.GeneralizationMarker;
                OG.GeneralizationMarker = OG.marker.GeneralizationMarker;
                OG.marker.GeneralizationMarker.prototype.createMarker = function () {
                    var geom1, geom2, geomCollection = [];
                    if (this.geom) {
                        return this.geom;
                    }
                    geom1 = new OG.geometry.Polygon([[20, 15], [50, 51], [20, 85]]);
                    geom1.style = new OG.geometry.Style({
                        'stroke-width': 0.8,
                        fill: '#ffffff',
                        'fill-opacity': 1
                    });
                    geomCollection.push(geom1);
                    this.geom = new OG.geometry.GeometryCollection(geomCollection);
                    return this.geom;
                };
            }
            if (!OG.marker.AggregationMarker) {
                OG.marker.AggregationMarker = function () {
                    OG.marker.AggregationMarker.superclass.call(this);
                    this.MARKER_ID = 'OG.marker.AggregationMarker';
                };
                OG.marker.AggregationMarker.prototype = new OG.marker.IMarker();
                OG.marker.AggregationMarker.superclass = OG.marker.IMarker;
                OG.marker.AggregationMarker.prototype.constructor = OG.marker.AggregationMarker;
                OG.GeneralizationMarker = OG.marker.AggregationMarker;
                OG.marker.AggregationMarker.prototype.createMarker = function () {
                    var geom1, geom2, geomCollection = [];
                    if (this.geom) {
                        return this.geom;
                    }
                    geom1 = new OG.geometry.Polygon([[20, 15], [40, 51], [20, 85], [0, 51]]);
                    geom1.style = new OG.geometry.Style({
                        'stroke-width': 0.8,
                        fill: '#ffffff',
                        'fill-opacity': 1
                    });
                    geomCollection.push(geom1);
                    this.geom = new OG.geometry.GeometryCollection(geomCollection);
                    return this.geom;
                };
            }
            if (!OG.marker.CompositionMarker) {
                OG.marker.CompositionMarker = function () {
                    OG.marker.CompositionMarker.superclass.call(this);
                    this.MARKER_ID = 'OG.marker.CompositionMarker';
                };
                OG.marker.CompositionMarker.prototype = new OG.marker.IMarker();
                OG.marker.CompositionMarker.superclass = OG.marker.IMarker;
                OG.marker.CompositionMarker.prototype.constructor = OG.marker.CompositionMarker;
                OG.GeneralizationMarker = OG.marker.CompositionMarker;
                OG.marker.CompositionMarker.prototype.createMarker = function () {
                    var geom1, geom2, geomCollection = [];
                    if (this.geom) {
                        return this.geom;
                    }
                    geom1 = new OG.geometry.Polygon([[20, 15], [40, 51], [20, 85], [0, 51]]);
                    geom1.style = new OG.geometry.Style({
                        'stroke-width': 0.8,
                        fill: '#000000',
                        'fill-opacity': 1
                    });
                    geomCollection.push(geom1);
                    this.geom = new OG.geometry.GeometryCollection(geomCollection);
                    return this.geom;
                };
            }
        },
        mounted: function () {
            var me = this

            if (me.value && me.value.relationView) {
                me.value.from = me.value.relationView.from;
                me.value.to = me.value.relationView.to;
            }

            let from = me.value.from ? me.value.from : me.value.relationView.from
            let to = me.value.to ? me.value.to : me.value.relationView.to

            if(!me.canvas.value.elements[from].relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[from].relations.push(me.value.relationView.id)
            }
            if(!me.canvas.value.elements[to].relations.includes(me.value.relationView.id)) {
                me.canvas.value.elements[to].relations.push(me.value.relationView.id)
            }

            me.$EventBus.$on(`${me.value.relationView.id}`, function (obj) {
                if(obj.action == 'delete' && obj.element) {
                    me.deleteRelation()
                }
            })

        },
        beforeDestroy() {
        },
        methods: {
            createAssociationFields() {
                var me = this;
                if (!this.value.relationType.endsWith('Aggregation')) {
                    return;
                }
                var umlCanvas = me.getComponent('uml-class-model-canvas');
                var classDefinitions = Object.values(umlCanvas.value.elements)
                if (classDefinitions) {
                    var classDefinitionByName = {};
                    classDefinitions.forEach(function (classDefinition) {
                        if(classDefinition != null) {
                            if (classDefinition.name == me.value.sourceElement.name) {
                                classDefinitionByName['source'] = classDefinition;
                            } else if (classDefinition.name == me.value.targetElement.name) {
                                classDefinitionByName['target'] = classDefinition;
                            }
                        }
                    });
                    if (!classDefinitionByName["source"] || !classDefinitionByName["target"]) {
                        return;
                    }
                    var associationFields = {};
                    ["source", "target"].forEach(function (direction) {
                        var classDefinition = classDefinitionByName[direction];
                        if (!classDefinition.fieldDescriptors) {
                            classDefinition.fieldDescriptors = [];
                        }
                        var associationFieldName = me[direction + 'Name']; //sourceName or targetName by direction
                        var oppositeDirection = (direction == "source" ? "target" : "source");
                        var associationFieldType = classDefinitionByName[oppositeDirection].name //class that opposite side
                        if (!associationFieldName) {
                            associationFieldName = associationFieldType.substring(0, 1).toLowerCase() + associationFieldType.substring(1);
                        }
                        var collectionClass = null;
                        var annotationPartOpposite = "One";
                        var annotationPart = "One";
                        if ("1 or 0".indexOf(me.value[oppositeDirection + "Multiplicity"]) == -1) { //opposite side is multiple
                            associationFieldType = "List<" + associationFieldType + ">";
                            associationFieldName = associationFieldName + "List";
                            collectionClass = associationFieldType;
                            annotationPartOpposite = "Many";
                        }
                        if ("1 or 0".indexOf(me.value[direction + "Multiplicity"]) == -1) {
                            annotationPart = "Many";
                        }
                        var associationField = null;
                        for (var i = 0; i < classDefinition.fieldDescriptors.length; i++) {
                            var fieldDescriptor = classDefinition.fieldDescriptors[i];
                            //fieldDescriptor._aggregation = null;
                            if (fieldDescriptor.name == associationFieldName || (me.relationView && fieldDescriptor._aggregationId == me.relationView.id)) {
                                associationField = classDefinition.fieldDescriptors[i];
                                break;
                            }
                        }
                        if (!associationField) {
                            associationField = {_aggregationId: me.relationView ? me.relationView.id : null};
                            classDefinition.fieldDescriptors.push(associationField);
                        }
                        associationField.className = associationFieldType;
                        associationField.name = associationFieldName;
                        associationField.collectionClass = collectionClass;
                        if (!associationField.attributes) {
                            associationField.attributes = {};
                        }
                        associationField.attributes['relationAnnotation'] = annotationPart + "To" + annotationPartOpposite;
                        associationFields[direction] = associationField;
                    });
                    //mapped by option
                    ["source", "target"].forEach(function (direction) {
                        var associationField = associationFields[direction];
                        var oppositeDirection = (direction == "source" ? "target" : "source");
                        var oppositeAssociationField = associationFields[oppositeDirection];
                        var relation = (associationField.attributes['relationAnnotation']);
                        
                        if (relation.indexOf("Many") == relation.length - 4) {
                            associationField.attributes['relationAnnotation.mappedBy'] = oppositeAssociationField.name;
                        }
                    })
                }
            },
            deleteRelation() {
                var me = this;

                let relFrom = me.value.from ? me.value.from : me.value.relationView.from
                let relTo = me.value.to ? me.value.to : me.value.relationView.to

                var from = me.canvas.value.elements[relFrom]
                var to = me.canvas.value.elements[relTo]

                if(from && from.relations.includes(me.value.relationView.id)) {
                    me.canvas.value.elements[relFrom].relations.splice(from.relations.indexOf(me.value.relationView.id), 1)
                }
                if(to && to.relations.includes(me.value.relationView.id)) {
                    me.canvas.value.elements[relTo].relations.splice(to.relations.indexOf(me.value.relationView.id), 1)
                }

                if (me.value.relationType !== "Generalization") {
                    const obj = {
                        action: "deleteRelation",
                        relation: JSON.parse(JSON.stringify(me.value))
                    }
                    me.$EventBus.$emit(`${me.value.from}`, obj)
                }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>