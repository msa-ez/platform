<template>
    <div>
        <edge-element
                selectable
                movable
                resizable
                connectable
                deletable
                :id="value.sourceRef + '-' + value.targetRef"
                :vertices.sync="vertices"
                :from.sync="value.sourceRef"
                :to.sync="value.targetRef"
                :_style.sync="style"
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
                :complexCondition="complexCondition"
                :definition="definition"
                :drawer="drawer"
                @close="closePanel"
        ></bpmn-relation-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel  from './RelationPanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-relation',
        props: {},
        components: {
            'bpmn-relation-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {}
            },
            type(){
                return 'Relation'
            },
            createNew(from, to, vertices, elementId){
                return {
                    name: '',
                    _type: 'org.uengine.kernel.bpmn.SequenceFlow',
                    selected: false,
                    sourceRef: from.tracingTag,
                    targetRef: to.tracingTag,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    priority: 1,
                    relationView: {
                        style: JSON.stringify({}),
                        value: vertices,
                        id: elementId
                    },
                    condition: {
                        _type: 'org.uengine.kernel.Evaluate',
                        pv: {
                            _type: 'org.uengine.kernel.ProcessVariable',
                            name: ''
                        },
                        condition: '==',
                        val: ''
                        //conditionExpression: 'arg2=="call"'
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
                otherwise: false,
                complexCondition: false,
                thisConditionType: 'org.uengine.kernel.Or'
            };
        },
        watch: {
            drawer: function (val) {
                //패널 열릴때 other wise 체크
                if (val) {
                    if (this.value.condition._type == 'org.uengine.kernel.Otherwise') {
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
                    this.condition = {
                        _type: 'org.uengine.kernel.Evaluate',
                        pv: {
                            _type: 'org.uengine.kernel.ProcessVariable',
                            name: '',
                        },
                        condition: '==',
                        val: ''
                    }
                }
                me.value.condition = condition;
            },
            complexCondition: function(val){
                if(val) {
                    if(this.value.condition && 
                        (this.value.condition._type.indexOf("Or") > -1 || this.value.condition._type.indexOf("And") > -1)) {
                        return;
                    }
                    var existingCondition = this.value.condition;
                    this.value.condition.conditionsVt = [];
                    this.value.condition._type="org.uengine.kernel.Or";
                    // if (existingCondition) {
                    //   this.value.condition.conditionsVt.push(existingCondition);
                    // }
                } else {
                    if(this.value.condition && 
                        (this.value.condition._type.indexOf("Or") > -1 || this.value.condition._type.indexOf("And") > -1)) {
                        this.complexCondition = true;   //not changeable to simple condition.
                    }
                }
            }
        },
        created: function() {
            if(this.value.condition && (this.value.condition._type.indexOf('Or') > -1 || this.value.condition._type.indexOf('And') > -1)) {
                this.complexCondition = true;
            }
        },
        mounted: function () {},
        methods: {
            setDefinition: function (def) {
                this.def = def
            },
            setData: function (data) {
                this.data = data
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

