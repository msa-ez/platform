<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                :id="value.sourceRef + '-' + value.targetRef"
                :vertices.sync="vertices"
                :from.sync="value.sourceRef"
                :to.sync="value.targetRef"
                :_style="{ 
                    'stroke-width' : '1.3', 
                    'stroke-dasharray':'- ',
                    'marker': {
                        'end': {
                            'id': 'OG.marker.MessageFlowArrowStartMarker',
                            'size': [8, 6]
                        },
                        'start': {
                            'id': 'OG.marker.MessageFlowArrowEndMarker',
                            'size': [6, 6]
                        }
                    }
                }"
                :label.sync="namePanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:dblclick="showProperty"
                v-on:selectShape="closeComponentChanger(); selectedFlow();"
                v-on:deSelectShape="closeComponentChanger(); deSelectedFlow();"
                v-on:removeShape="onRemoveShape"
                v-on:redrawShape="closeComponentChanger"
                v-on:addedToGroup="onAddedToGroup"
        ></edge-element>

        <bpmn-relation-panel
                v-if="drawer"
                v-model="value"
                :otherwise="otherwise"
                @close="closePanel"
        ></bpmn-relation-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel  from './RelationPanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-message-flow',
        props: {},
        component: {
            'bpmn-relation-panel': BpmnPropertyPanel
        },
        created: function() {
            if(!OG.marker.MessageFlowArrowStartMarker) {
                OG.marker.MessageFlowArrowStartMarker = function () {
                    OG.marker.MessageFlowArrowStartMarker.superclass.call(this);
                    this.MARKER_ID = 'OG.marker.MessageFlowArrowStartMarker';
                };
                
                OG.marker.MessageFlowArrowStartMarker.prototype = new OG.marker.IMarker();
                OG.marker.MessageFlowArrowStartMarker.superclass = OG.marker.IMarker;
                OG.marker.MessageFlowArrowStartMarker.prototype.constructor = OG.marker.MessageFlowArrowStartMarker;
                OG.MessageFlowArrowStartMarker = OG.marker.MessageFlowArrowStartMarker;

                OG.marker.MessageFlowArrowStartMarker.prototype.createMarker = function() {
                    var geom1, geomCollection = [];
                    if (this.geom) {
                        return this.geom;
                    }
                    geom1 = new OG.geometry.Polygon([[20, 15],[50, 51],[20, 85]]);
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
            if(!OG.marker.MessageFlowArrowEndMarker){
                OG.marker.MessageFlowArrowEndMarker = function () {
                    OG.marker.MessageFlowArrowEndMarker.superclass.call(this);
                    this.MARKER_ID = 'OG.marker.MessageFlowArrowEndMarker';
                };

                OG.marker.MessageFlowArrowEndMarker.prototype = new OG.marker.IMarker();
                OG.marker.MessageFlowArrowEndMarker.superclass = OG.marker.IMarker;
                OG.marker.MessageFlowArrowEndMarker.prototype.constructor = OG.marker.MessageFlowArrowEndMarker;
                OG.MessageFlowArrowEndMarker = OG.marker.MessageFlowArrowEndMarker;
                
                OG.marker.MessageFlowArrowEndMarker.prototype.createMarker = function () {
                    var geom1, geomCollection = [];
                    if (this.geom) {
                        return this.geom;
                    }
                    geom1 = new OG.geometry.Circle([50, 50], 40);
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
        },
        computed: {
            defaultStyle() {
                return {}
            },
            type(){
                return 'Relation'
            },
            createNew(from, to, vertices, elementId){
                return {
                    name: '',
                    selected: false,
                    sourceRef: from,
                    _type: 'org.uengine.kernel.bpmn.MessageFlow',
                    targetRef: to,
                    relationView: {
                        style: JSON.stringify({}),
                        value: vertices,
                        id: elementId
                    },
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
        data: function () {
            return {
                otherwise: false
            };
        },
        watch: {},
        mounted: function () {},
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

