<template>
    <div :key="rerenderRulePanelKey">
        <div style="width: 100%; margin: 10px;">
            <v-btn icon @click.native="left()">
                <v-icon color="grey lighten-1">mdi-arrow-left</v-icon>
            </v-btn>
            <b>{{copyValue.name}}/Rules</b>
            <v-btn style="float: right; margin-right: 12px;" icon @click.native="closePanel()">
                <v-icon color="grey lighten-1">mdi-close</v-icon>
            </v-btn>
        </div>
        <v-divider/>
        <v-card v-for="(rule, idx) in copyValue.aggregateRules" :key="idx" style="margin-bottom: 15px;">
            <div :key="updateRulePanel">
                <v-card-title>
                    <div style="width: 100%;">
                        <v-btn style="float: right; margin: -15px;" icon @click.native="deleteAggregateRule(idx)">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-text-field
                            v-model="rule.ruleName"
                            :rules="[ruleRequired]"
                            label="Rule Name"
                        ></v-text-field>
                    </div>
                </v-card-title>
                <div style="margin: 15px;">
                    <v-autocomplete
                        v-model="rule.givenValue"
                        :items="givenItems"
                        item-text="name"
                        dense
                        return-object
                        label="Given"
                    ></v-autocomplete>
                    <v-autocomplete
                        v-model="rule.whenValue"
                        :items="rule.whenItems"
                        item-text="name"
                        dense
                        return-object
                        label="When"
                    ></v-autocomplete>
                    <v-autocomplete
                        v-model="rule.thenValue"
                        :items="rule.thenItems"
                        item-text="name"
                        dense
                        return-object
                        multiple
                        label="Then"
                    ></v-autocomplete>
                </div>
            </div>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    v-if="rule.givenValue || rule.thenValue"
                    color="primary"
                    text
                    small
                    @click.native="openExampleDialog(rule)"
                >
                    Examples
                </v-btn>
            </v-card-actions>
        </v-card>


        <div style="width: 100%; margin-bottom: 15px;">
            <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon @click.native="addAggregateRule()" v-bind="attrs" v-on="on">
                        <v-icon color="grey lighten-1">mdi-plus</v-icon>
                    </v-btn>
                </template>
                <span>Add New Rule</span>
            </v-tooltip>
        </div>

        <v-dialog v-if="isOpenRules" v-model="isOpenRules" width="100%">
            <v-card>
                <table>
                    <tr>
                        <td colspan="999">{{ openRules.ruleName }}</td>
                    </tr>
                    <tr>
                        <td :colspan="givenAttLength">Given</td>
                        <td :colspan="whenAttLength">When</td>
                        <td colspan="999">Then</td>
                    </tr>
                    
                    <tr>
                        <td :colspan="givenAttLength">{{ ruleExampleTableHeaders.given }}</td>
                        <td :colspan="whenAttLength">{{ ruleExampleTableHeaders.when }}</td>
                        <td v-for="row in ruleExampleTableHeaders.then" :colspan="thenAttLength[row]">{{ row }}</td>
                    </tr>
                    <tr>
                        <td v-for="att in openRules.attributes[0]['given']">{{ att.name }}</td>
                    
                        <td v-for="att in openRules.attributes[0]['when']">{{ att.name }}</td>
                        
                        <template v-for="attribute in openRules.attributes[0]['then']">
                            <td v-for="arr in attribute">{{ arr.name }}</td>
                        </template>
                    </tr>

                    <tr v-for="attributes in openRules.attributes">
                        <td v-for="att in attributes['given']">{{ att.value }}</td>
                    
                        <td v-for="att in attributes['when']">{{ att.value }}</td>
                        
                        <template v-for="attribute in attributes['then']">
                            <td v-for="arr in attribute">{{ arr.value }}</td>
                        </template>
                    </tr>
                </table>
                <v-text-field v-model="openRules.prompt"></v-text-field>
                <v-btn @click="startExampleGenerate(openRules)">example generate</v-btn>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
    import isAttached from '../../../../utils/isAttached';
    import RuleExampleGenerator from '../../modeling/generators/RuleExampleGenerator'

    export default {
        name: 'aggregate-rules-panel',
        props: {
            copyValue: {
                type: Object,
                default: function () {
                    return null
                }
            },
            givenItems: {
                type: Array,
                default: function () {
                    return []
                }
            },
            attachedPolicies:{
                type: Object,
                default: function () {
                    return null
                }
            }
        },
        components:{},
        data() {
            return {
                generatorComponent: null,
                isAttachedPolicyName: null,
                // ruleAttribute: null,
                ruleExampleTableHeaders: {
                    given: null,
                    when: null,
                    then: []
                },
                // ruleExampleAttributes: {
                //     given: null,
                //     when: null,
                //     then: []
                // },
                // givenAtt: [],
                // whenAtt: [],
                // thenAtt: [],
                givenAttLength: null,
                whenAttLength: null,
                thenAttLength: {},

                rerenderRulePanelKey: 0,
                updateRulePanel: 0,
                ruleRequired: value => !!value || 'Required.',
                thenColumnDefs: [],
                thenRowData: [],
                defaultColDef: {
                    editable: true,
                    resizable: true,
                },
                givenGridApi: null,
                thenGridApi: null,
                rowIndex: null,
                givenColumnDefs: [],
                givenRowData: [],
                ruleValues: {
                    ruleName: null,
                    whenItems: [],
                    thenItems: [],
                    givenValue: null,
                    whenValue: null,
                    thenValue: [],
                    show: false,
                    editMode: false,
                    attributes: []
                },
                openRules:{},
                isOpenRules: false,
            }
        },
        created() {
            var me = this
            me.canvas = me.getComponent('event-storming-model-canvas')
            if (!me.copyValue.aggregateRules) {
                me.addAggregateRule()
            } else {
                for (var i = 0; i < me.copyValue.aggregateRules.length; i++) {
                    me.copyValue.aggregateRules[i].show = false
                    me.copyValue.aggregateRules[i].editMode = false
                }
            }
            me.generatorComponent = new RuleExampleGenerator(this);
        },
        methods: {
            onModelCreated(content){
                var me = this
                content.forEach(function (data) {
                    if(data["then"]){
                        var thenAttList = []
                        me.openRules.thenValue.forEach(function (thenVal, index){ 
                            var thenRow = []
                            data["then"].forEach(function (then) {
                                thenVal.fieldDescriptors.forEach(function (field){
                                    if(field.name == then.name){
                                        thenRow.push(then)
                                        thenAttList[index] = thenRow
                                    } 
                                })
                            })
                        })
                        data["then"] = thenAttList
                    }
                })
                
                me.openRules.attributes = content
            },
            startExampleGenerate(openRules){
                var me = this
                me.generatorComponent.generate(openRules)
            },  
            left(){
                this.$emit('left')
            },
            closePanel() {
                this.$emit('close')
            },
            openExampleDialog(rule){
                var me = this

                try {
                    me.ruleExampleTableHeaders = {
                        given: null,
                        when: null,
                        then: []
                    }
                    me.ruleExampleTableHeaders.given = rule.givenValue.name
                    me.ruleExampleTableHeaders.when = rule.whenValue.name
                    rule.thenValue.forEach(function (item){
                        me.ruleExampleTableHeaders.then.push(item.name)
                    })

                    me.thenAttLength = {}
                    let attributes = {
                        "given": [],
                        "when": [],
                        "then": [],
                    }

                    rule.givenValue.aggregateRoot.fieldDescriptors.forEach(function (field){
                        attributes['given'].push({
                            name: field.name,
                            type: field.className,
                            value: "null"
                        })
                        // me.ruleExampleTableHeaders.givenAtt.push({
                        //     name: field.name,
                        //     type: field.className,
                        //     value: "null"
                        // })
                    })
                    me.givenAttLength = rule.givenValue.aggregateRoot.fieldDescriptors.length

                    rule.whenValue.fieldDescriptors.forEach(function (field){
                        attributes['when'].push({
                            name: field.name,
                            type: field.className,
                            value: "null"
                        })
                        // me.ruleExampleTableHeaders.whenAtt.push({
                        //     name: field.name,
                        //     type: field.className,
                        //     value: "null"
                        // })
                    })
                    me.whenAttLength = rule.whenValue.fieldDescriptors.length

                    rule.thenValue.forEach(function (item){
                        var attArry = []
                        item.fieldDescriptors.forEach(function (field){
                            var obj = {
                                name: field.name,
                                type: field.className,
                                value: "null"
                            }
                            attArry.push(obj)
                        })
                        attributes['then'].push(attArry)
                        // me.ruleExampleTableHeaders.thenAtt.push(attArry)
                        me.thenAttLength[item.name] = item.fieldDescriptors.length
                    })
                    // me.ruleAttribute = attributes
                    rule.attributes = [] 
                    rule.attributes.push(attributes)
                    me.openRules = rule
                    me.openRules.prompt = ""
                }catch (e) {
                    console.log('[Error] OpenExampleDialog : ', e)
                }finally {
                    me.isOpenRules = true
                }
            },
            
            ongivenGridReady(params) {
                this.givenGridApi = params.api;
            },
            onthenGridReady(params) {
                this.thenGridApi = params.api;
            },
            onRowSelected(event) {
                if (event.node.selected == true) {
                    this.rowIndex = event.node.rowIndex
                }
            },
            chooseGivenAggregate(index){
                var me = this
                this.copyValue.aggregateRules[index].givenItems = me.givenItems
                this.copyValue.aggregateRules[index].givenValue = me.givenItems[0]
            },

            addAggregateRuleAttribute(rule) {
                var me = this
                me.resetAttribute(rule, 'add');
            },
            deleteAggregateRuleAttribute(rule) {
                var me = this
                me.resetAttribute(rule, 'delete');
            },
            addAggregateRule() {
                var me = this                

                var values = JSON.parse(JSON.stringify(me.ruleValues))
                if(!me.copyValue.aggregateRules){
                    var idx = 0
                    me.copyValue.aggregateRules = []
                } else {
                    var idx = me.copyValue.aggregateRules.length
                }

                // me.aggregateRules.push(values)
                me.copyValue.aggregateRules.push(values)
                // me.copyValue.aggregateRules[idx].attributes.push(attribute)
                me.chooseGivenAggregate(idx)
                me.chooseWhenEvent(idx)
                me.chooseThenEvent(idx)

                // if(me.copyValue.aggregateRules[idx].givenValue && me.copyValue.aggregateRules[idx].thenValue){
                if(me.copyValue.aggregateRules[idx].whenValue && me.isAttachedPolicyName){
                    me.copyValue.aggregateRules[idx].ruleName = `Whenever ${me.copyValue.aggregateRules[idx].whenValue.name}, ${me.isAttachedPolicyName}`
                }
                if(idx == 0){
                    me.rerenderRulePanelKey++;
                } else {
                    me.updateRulePanel++;
                }
            },
            deleteAggregateRule(idx) {
                var me = this
                me.copyValue.aggregateRules.splice(idx, 1)
                me.updateRulePanel++;
            },
            chooseWhenEvent(index){
                var me = this

                var incomingEvent = [] 
                if(Object.values(me.canvas.value.relations).length>0){
                    Object.values(me.canvas.value.relations).forEach(function(rel, idx){
                        if(rel != null){
                            if(rel.sourceElement._type == 'org.uengine.modeling.model.Event' && rel.targetElement._type == 'org.uengine.modeling.model.Policy'){
                                // if(me.copyValue.aggregateRules[index].whenValue && me.copyValue.aggregateRules[index].whenValue.elementView){
                                //     if(me.copyValue.aggregateRules[index].whenValue.elementView.id == rel.targetElement.elementView.id){
                                //         incomingEvent.push(rel.sourceElement);
                                //     }
                                // }
                                // else{
                                    if(me.attachedPolicies[rel.targetElement.elementView.id]){
                                        incomingEvent.push(rel.sourceElement);
                                        me.isAttachedPolicyName = rel.targetElement.name
                                    }
                                // }
                            }
                        }
                    })
                }
                me.copyValue.aggregateRules[index].whenItems = incomingEvent
                if(incomingEvent.length > 0){
                    me.copyValue.aggregateRules[index].whenValue = incomingEvent[0]
                }
            },
            chooseThenEvent(index){
                var chosenEvent = []
                var me = this

                // if(Object.values(me.canvas.value.relations).length > 0){
                //     Object.values(me.canvas.value.relations).forEach(function(rel, idx){
                //         if(rel != null && me.copyValue.aggregateRules[index].whenValue && me.copyValue.aggregateRules[index].whenValue.elementView){
                //             if(rel.sourceElement._type == 'org.uengine.modeling.model.Policy' && rel.targetElement._type == 'org.uengine.modeling.model.Event'){
                //                 if(me.copyValue.aggregateRules[index].whenValue.elementView.id == rel.sourceElement.elementView.id){
                //                     chosenEvent.push(rel.targetElement)
                //                 }
                //             }
                //         }
                //     })
                // }
                // console.log('chosenEvent', chosenEvent.length)
                if(chosenEvent.length == 0){
                    var attachedEventList = []
                    if(Object.values(me.canvas.attachedLists.eventLists).length > 0){
                        Object.values(me.canvas.attachedLists.eventLists).forEach(function(event, idx){

                            if (isAttached(event, me.copyValue)) {
                                attachedEventList.push(event);
                            }
                        })

                        chosenEvent = attachedEventList
                    }
                }

                // this.aggregateRules[index].thenItems = chosenEvent
                this.copyValue.aggregateRules[index].thenItems = chosenEvent

                if(chosenEvent.length > 0){
                    this.copyValue.aggregateRules[index].thenValue = chosenEvent
                }
            },
            resetAttribute(rule, option){
                var me = this
                // me.givenGridApi.stopEditing();
                // me.thenGridApi.stopEditing();

                // for(var i = 0; i < me.givenRowData.length; i++){
                //     rule.attributes[i].givenAtt = []

                //     rule.attributes[i].aggregateAtt = []

                //     rule.attributes[i].thenAtt = []

                //     Object.keys(me.givenRowData[i]).forEach(function(data){
                //         if(data.includes(me.givenName)){
                //             var givenAtt = {
                //                 attKey: me.givenName + '_' + data.replace(me.givenName, ''),
                //                 attValue: me.givenRowData[i][data]
                //             }
                //             rule.attributes[i].givenAtt.push(givenAtt)
                //         }
                //         if(data.includes(me.aggregateName)){
                //             var aggregateAtt = {
                //                 attKey: me.aggregateName + '_' + data.replace(me.aggregateName, ''),
                //                 attValue: me.givenRowData[i][data]
                //             }
                //             rule.attributes[i].aggregateAtt.push(aggregateAtt)
                //         }
                //     })

                //     Object.keys(me.thenRowData[i]).forEach(function(data){
                //         if(data.includes(me.thenName)){
                //             var thenAtt = {
                //                 attKey: me.thenName + '_' + data.replace(me.thenName, ''),
                //                 attValue: me.thenRowData[i][data]
                //             }
                //             rule.attributes[i].thenAtt.push(thenAtt)
                //         }
                //     })
                // }

                // if(option == 'add'){
                //     var attribute = JSON.parse(JSON.stringify(me.ruleAttribute))
                //     rule.attributes.push(attribute)
                // } else if(option == 'delete'){
                //     rule.attributes.splice(me.rowIndex, 1)
                // } else if(option == 'save'){
                //     me.isOpenRules = false
                //     // rule.show = false
                //     // me.value.aggregateRules = me.copyValue.aggregateRules
                //     // console.log(me.value.aggregateRules)
                // }

                // if(option != 'save'){
                //     me.openExampleDialog(rule)
                // }
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
        }
    }
</script>
<style>
</style>