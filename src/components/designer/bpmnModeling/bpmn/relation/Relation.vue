<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                :id="relation.sourceRef + '-' + relation.targetRef"
                :vertices.sync="vertices"
                :from.sync="relation.sourceRef"
                :to.sync="relation.targetRef"
                :_style.sync="style"
                :label.sync="relation.name"
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
                :item.sync="relation"
                :otherwise.sync="otherwise"
                @close="closePanel"
        ></bpmn-relation-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel  from './RelationPanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-relation-diabled',
        props: {},
        component: {
            'bpmn-relation-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle() {
                return {}
            },
            type() {
                return 'Relation'
            },
            createNew(from, to, vertices, elementId){
                return {
                    _type: 'org.uengine.kernel.bpmn.SequenceFlow',
                    selected: false,
                    sourceRef: from,
                    targetRef: to,
                    relationView: {
                        style: JSON.stringify({}),
                        value: vertices,
                        id: elementId
                    },
                    condition: {
                        _type: 'org.uengine.kernel.ExpressionEvaluateCondition',
                        //conditionExpression: 'arg2=="call"'
                    }
                }
            },
            vertices: {
                get: function () {
                    var style;
                    try {
                        return JSON.parse(this.relation.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.relation.relationView.value = JSON.stringify(val);
                }
            }
        },
        data: function () {
            return {
                otherwise: false
            };
        },
        watch: {
            drawer: function (val) {
                //패널 열릴때 other wise 체크
                if (val) {
                    if (this.relation.condition._type == 'org.uengine.kernel.Otherwise') {
                        this.otherwise = true;
                    } else {
                        this.otherwise = false;
                    }
                }
            },
            otherwise: function (_val) {
                var me = this;
                var condition = {};
                if (_val) { //otherwise 이면
                    condition._type = 'org.uengine.kernel.Otherwise'
                } else { //otherwise가 아니면
                    condition._type = 'org.uengine.kernel.ExpressionEvaluateCondition'
                    condition.conditionExpression = me.relation.condition.conditionExpression
                }
                me.relation.condition = condition;
            }
        },
        mounted: function () {},
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

