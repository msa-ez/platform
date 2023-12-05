<template>
    <div>
        <v-dialog v-model="isOpenRules">
            <v-card style="padding: 15px; display: inline-table;">
                <table class="rules-table" cellspacing="0">
                    <tr>
                        <td style="font-size: 20px; font-weight: 500; padding-bottom: 12px;" colspan="999">{{ rule.ruleName }}</td>
                    </tr>
                    <tr class="tr-divider" style="text-align: center; font-size: 18px; font-weight: 500;">
                        <td :colspan="givenAttLength">Given</td>
                        <td :colspan="whenAttLength">When</td>
                        <td colspan="999">Then</td>
                    </tr>
                    
                    <tr class="tr-divider" style="text-align: center; font-weight: 500;">
                        <td :colspan="givenAttLength">{{ ruleExampleTableHeaders.given }}</td>
                        <td :colspan="whenAttLength">{{ ruleExampleTableHeaders.when }}</td>
                        <td v-for="row in ruleExampleTableHeaders.then" :colspan="thenAttLength[row]">{{ row }}</td>
                    </tr>
                    <tr class="tr-divider">
                        <td v-for="key in Object.keys(rule.values[0]['given'][0].value)">{{ key }}</td>
                        <td v-for="key in Object.keys(rule.values[0]['when'][0].value)">{{ key }}</td>
                        
                        <template v-for="attribute in rule.values[0]['then']">
                            <td v-for="key in Object.keys(attribute.value)">{{ key }}</td>
                        </template>
                    </tr>
                    <template v-for="(value, idx) in rule.values">
                        <tr class="tr-divider tr-input"
                            style="border-bottom: 1px solid #E0E0E0;"
                        >
                            <template v-for="(givenObject, givenKey) in value['given'][0].value">
                                <template v-if="checkGivenType(givenObject)">
                                    <td @click="selectTableData('given', givenKey, value['given'][0].name, idx)">
                                        <component v-if="'given-' + value['given'][0].name + '-' + givenKey == selectedItemPath && selectedItemIndex == idx"
                                            class="td-component-size"
                                            :is="getComponentType(selectedAttType)"
                                            v-model="value['given'][0].value[givenKey]" 
                                            :label="selectedAttType"
                                            @save="closeExampleEditor()"
                                            @selectChip="closeExampleEditor"
                                        ></component>
                                        <div v-else>
                                            <v-chip class="rule-chip" v-if="chipLabels[value['given'][0].value[givenKey]]">{{ chipLabels[value['given'][0].value[givenKey]] }}</v-chip>
                                            <template v-else>{{ value['given'][0].value[givenKey] }}</template>
                                        </div>
                                    </td>
                                </template>
                                <table v-else class="rules-table" style="width: 100%;">
                                    <tr>
                                        <td v-for="(givenArrValue, givenArrKey) in value['given'][0].value[givenKey][0]" class="given-td-uml">{{ givenArrKey }}</td>
                                    </tr>
                                    <tr v-for="(givneValue, givenIdx) in value['given'][0].value[givenKey]">
                                        <td v-for="(givenArrValue, givenArrKey) in givneValue" @click="selectTableData('given', givenArrKey, value['given'][0].name, idx, givenKey, givenIdx)">
                                            <component v-if="'given-' + value['given'][0].name + '-' + givenKey + '-' + givenArrKey == selectedItemPath && selectedItemIndex == idx && selectedGivenIndex == givenIdx"
                                                class="td-component-size"
                                                :is="getComponentType(selectedAttType)"
                                                v-model="givneValue[givenArrKey]" 
                                                :label="selectedAttType"
                                                @save="closeExampleEditor()"
                                                @selectChip="closeExampleEditor"
                                            ></component>
                                            <div v-else>
                                                <v-chip class="rule-chip" v-if="chipLabels[givneValue[givenArrKey]]">{{ chipLabels[givneValue[givenArrKey]] }}</v-chip>
                                                <template v-else>{{ givneValue[givenArrKey] }}</template>
                                            </div>
                                        </td>
                                        <v-icon @click="removeGivenExample(givenKey, idx, givenIdx)">mdi-delete</v-icon>
                                    </tr>
                                    <v-icon @click="addGivenExample(givenKey, idx)">mdi-plus</v-icon>
                                </table>
                            </template>
                            <td v-for="key in Object.keys(value['when'][0].value)" @click="selectTableData('when', key, value['when'][0].name, idx)">
                                <component v-if="'when-' + value['when'][0].name + '-' + key == selectedItemPath && selectedItemIndex == idx"
                                    class="td-component-size"
                                    :is="getComponentType(selectedAttType)"
                                    v-model="value['when'][0].value[key]" 
                                    :label="selectedAttType"
                                    @save="closeExampleEditor()"
                                    @selectChip="closeExampleEditor"
                                ></component>
                                <div v-else>
                                    <v-chip class="rule-chip" v-if="chipLabels[value['when'][0].value[key]]">{{ chipLabels[value['when'][0].value[key]] }}</v-chip>
                                    <template v-else>{{ value['when'][0].value[key] }}</template>
                                </div>
                            </td>
                            
                            <template v-for="then in value['then']">
                                <td v-for="key in Object.keys(then.value)" @click="selectTableData('then', key, then.name, idx)">
                                    <component v-if="'then-' + then.name + '-' + key == selectedItemPath && selectedItemIndex == idx"
                                        class="td-component-size"
                                        :is="getComponentType(selectedAttType)"
                                        v-model="then.value[key]" 
                                        :label="selectedAttType"
                                        @save="closeExampleEditor()"
                                        @selectChip="closeExampleEditor"
                                    ></component>
                                    <div v-else>
                                        <v-chip class="rule-chip" v-if="chipLabels[then.value[key]]">{{ chipLabels[then.value[key]] }}</v-chip>
                                        <template v-else>{{ then.value[key] }}</template>
                                    </div>
                                </td>
                            </template>
                            <v-icon style="position: absolute; right: 10px; margin-top: 5px;" @click="removeExample(idx)">mdi-delete</v-icon>
                        </tr>
                    </template>
                </table>
                <v-text-field readonly v-model="rule.description"></v-text-field>
                <v-layout>
                    <v-spacer/>
                    <v-icon @click="addExample()">mdi-plus</v-icon>
                    <v-icon @click="resetExampleDialog()">mdi-refresh</v-icon>
                    <v-btn v-if="!isGenerating" @click="startExampleGenerate()" color="primary" text>Generate Examples</v-btn>
                    <v-btn v-if="isGenerating" @click="stopExampleGenerate()" color="primary" text>
                        <v-progress-circular 
                            size="15"
                            :width="3"
                            style="margin-right: 10px;"
                            indeterminate
                            color="primary"
                        ></v-progress-circular>
                        Stop generating
                    </v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import isAttached from '../../../utils/isAttached';
    import getParent from '../../../utils/getParent';
    import RuleExampleGenerator from '../modeling/generators/RuleExampleGenerator'
    import String from '../../primitives/String.vue'
    import Number from '../../primitives/Number.vue'
    import Boolean from '../../primitives/Boolean.vue'

    export default {
        name: 'rule-example-dialog',
        props: {
            value: {
                type: Object,
                default: function () {
                    return null
                }
            },
        },
        components:{
            String,
            Number,
            Boolean
        },
        data() {
            return {
                exampleFrameWork: null,
                isGenerating: false,
                generatorComponent: null,
                ruleExampleTableHeaders: {
                    given: null,
                    when: null,
                    then: []
                },
                givenAttLength: null,
                whenAttLength: null,
                thenAttLength: {},
                givenItems: [],
                whenItems: [],
                thenItems: [],
                rule: {
                    ruleName: null,
                    givenItems: [],
                    whenItems: [],
                    thenItems: [],
                    values: []
                },
                givenArrObject: {},
                isOpenRules: false,
                canvas: null,
                selectedAttType: null,
                selectedItemPath: null,
                selectedItemIndex: 0,
                selectedGivenIndex: 0,
            }
        },
        watch: {
            "isOpenRules":function(newVal){
                if(newVal == false){
                    this.$emit("save")
                    this.$emit("closeExampleDialog")
                    this.value.examples = this.rule.values
                }
            }
        },
        created() {
            var me = this
            me.canvas = getParent(me.$parent, "event-storming-model-canvas");
            me.openExampleDialog()
            me.generatorComponent = new RuleExampleGenerator(this);
        },
        computed: {
            chipLabels() {
                return {
                    null: 'null',
                    'N/A': 'N/A'
                };
            }
        },
        methods: {
            checkGivenType(given) {
                var isArray = Array.isArray(given);
                var isObject = typeof given == 'object';
                return !isArray || !isObject;
            },
            removeGivenExample(givenKey, idx, givenIdx) {
                const items = this.rule.values[idx]['given'][0].value[givenKey];
                if (!items) {
                    console.error('No items found');
                    return;
                }
                if (items.length === 1) {
                    console.error('Cannot delete as only one item remains');
                    return;
                }
                if (givenIdx >= items.length) {
                    console.error('Invalid index to delete');
                    return;
                }
                items.splice(givenIdx, 1);
            },
            removeExample(idx) {
                if (this.rule.values.length > 1) {
                    this.rule.values.splice(idx, 1);
                }
            },
            addExample(){
                var me = this
                if(!me.exampleFrameWork){
                    me.setExampleFrameWork()
                }
                if(me.exampleFrameWork){
                    me.rule.values.push(JSON.parse(JSON.stringify(me.exampleFrameWork)))
                }
            },
            addGivenExample(givenKey, idx) {
                var me = this;
                var field = me.rule.givenItems[0].aggregateRoot.fieldDescriptors.find(x => x.name == givenKey);
                let givenObject = {};

                if (me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId]) {
                    me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (givenField) {
                        givenObject[givenField.name] = "N/A";
                    });
                    if (!me.rule.values[0]['given'][0].value[field.name]) {
                        me.$set(me.rule.values[0]['given'][0].value, field.name, []);
                    }
                    me.rule.values[idx]['given'][0].value[field.name].push(givenObject);
                } else {
                    console.error('Field classId not found in entities.elements');
                }
            },
            getComponentType(type) {
                switch(type) {
                    case 'Long':
                    case 'Integer':
                    case 'Float':
                    case 'Double':
                    case 'BigDecimal':
                        return 'Number';
                    case 'Boolean':
                        return 'Boolean';
                    default:
                        return 'String'; // 기본값 or 오류 처리
                }
            },
            closeExampleEditor() {
                this.selectedItemPath = null;
                this.selectedAttType = null;
                this.selectedItemIndex = null;
            },
            selectTableData(type, key, name, idx, givenUmlKey, givenIdx) {
                event.stopPropagation();
                var me = this;
                var selectedItem;
                if (type == 'given') {
                    selectedItem = me.rule[type + 'Items'].find(x => x.name == name).aggregateRoot.fieldDescriptors.find(x => x.name == key);
                } else {
                    selectedItem = me.rule[type + 'Items'].find(x => x.name == name).fieldDescriptors.find(x => x.name == key);
                }
                if (!givenUmlKey) {
                    me.selectedItemPath = `${type}-${name}-${key}`;
                } else {
                    var typeItem = me.rule[type + 'Items'].find(x => x.name == name);
                    var givenItem = typeItem.aggregateRoot.fieldDescriptors.find(x => x.name == givenUmlKey);
                    selectedItem = typeItem.aggregateRoot.entities.elements[givenItem.classId].fieldDescriptors.find(x => x.name == key);
                    me.selectedItemPath = `${type}-${name}-${givenUmlKey}-${key}`;
                    me.selectedGivenIndex = givenIdx;
                }
                me.selectedItemIndex = idx;
                me.selectedAttType = selectedItem ? selectedItem.className : "";
            },
            resetExampleDialog(){
                var me = this
                if(me.value && me.value.examples){
                    me.value.examples = null
                }
                me.openExampleDialog()
            },
            onGenerationFinished(){
                var me = this
                if(!me.exampleFrameWork){
                    me.setExampleFrameWork()
                }
                if(me.exampleFrameWork){
                    me.rule.values.forEach(function (value){
                        Object.keys(value).forEach(function (key){
                            if(value[key].length != me.exampleFrameWork[key].length){
                                var items = JSON.parse(JSON.stringify(me.exampleFrameWork[key]))
                                items.forEach(function (item, idx){
                                    Object.keys(item.value).forEach(function (fieldKey){
                                        value[key].forEach(function (generatedItem){
                                            Object.keys(generatedItem.value).forEach(function (generatedItemKey){
                                                if(generatedItemKey == fieldKey){
                                                    items[idx].value[fieldKey] = generatedItem.value[generatedItemKey]
                                                }
                                            })
                                        })
                                    })
                                })
                                value[key] = items
                            }
                        })
                    })
                }
                me.isGenerating = false
                me.value.examples = me.rule.values
            },
            onModelCreated(content){
                this.rule.values = content
            },
            startExampleGenerate(){
                var me = this
                me.isGenerating = true
                me.generatorComponent.generate()
            },  
            stopExampleGenerate(){
                var me = this
                me.isGenerating = false
                me.generatorComponent.stop()
            },  
            openExampleDialog(){
                var me = this
                try {
                    if(me.value && me.value.examples && me.value.examples.givenItems){
                        me.resetExampleDialog()
                    } else {
                        me.thenAttLength = {}
                        me.setItems()
                        me.setAttributes()
                        me.setTable()
                    }
                } catch(e){
                    console.log('[Error] OpenExampleDialog : ', e)
                } 
            },
            setItems(){
                var me = this
                me.rule.givenItems = []
                me.rule.whenItems = []
                me.rule.thenItems = []

                if(me.value && me.value._type.includes("Policy") || me.value && me.value._type.includes("Command")){
                    if(me.value.aggregate && me.value.aggregate.id && me.canvas.value.elements[me.value.aggregate.id]){
                        me.rule.givenItems.push(me.canvas.value.elements[me.value.aggregate.id])
                    } else if (me.canvas.attachedLists.aggregateLists && Object.values(me.canvas.attachedLists.aggregateLists).length > 0) {
                        Object.values(me.canvas.attachedLists.aggregateLists).forEach(function (aggregate, idx) {
                            if (isAttached(aggregate, me.value)) {
                                me.rule.givenItems.push(aggregate)
                            }
                        })
                    } 

                    var whenItems = [] 
                    var thenItems = []
                    var attachedCommand
                    if(Object.values(me.canvas.value.relations).length > 0){
                        if(me.rule.givenItems.length == 0){
                            Object.values(me.canvas.value.relations).some(function(rel){
                                if(rel != null){
                                    if(me.value._type.includes("Policy")){
                                        if(rel.sourceElement._type == 'org.uengine.modeling.model.Policy' && rel.targetElement._type == 'org.uengine.modeling.model.Command'){
                                            if(rel.sourceElement.elementView.id == me.value.elementView.id){
                                                attachedCommand = rel.targetElement
                                            }
                                        }
                                    }
                                    if(attachedCommand){
                                        return true;
                                    } 
                                }
                            })
                            if(attachedCommand){
                                if(attachedCommand.aggregate && attachedCommand.aggregate.id && me.canvas.value.elements[attachedCommand.aggregate.id]){
                                    me.rule.givenItems.push(me.canvas.value.elements[attachedCommand.aggregate.id])
                                }
                                // Object.values(me.canvas.attachedLists.aggregateLists).some(function (aggregate, idx) {
                                //     if (isAttached(aggregate, attachedCommand)) {
                                //         me.rule.givenItems.push(aggregate)
                                //         return true;
                                //     }
                                // })
                            }
                        }
                        Object.values(me.canvas.value.relations).forEach(function(rel){
                            if(rel != null){
                                if(me.value._type.includes("Policy")){
                                    // when
                                    if(rel.sourceElement._type == 'org.uengine.modeling.model.Event' && rel.targetElement._type == 'org.uengine.modeling.model.Policy'){
                                        if(rel.targetElement.elementView.id == me.value.elementView.id){
                                            if(!whenItems.find(x => x.elementView.id == rel.sourceElement.elementView.id)){
                                                whenItems.push(me.canvas.value.elements[rel.sourceElement.elementView.id]);
                                            }
                                        }
                                    }
                                    // then
                                    if(attachedCommand){
                                        if(rel.sourceElement._type == 'org.uengine.modeling.model.Command' && rel.targetElement._type == 'org.uengine.modeling.model.Event'){
                                            if(rel.sourceElement.elementView.id == attachedCommand.elementView.id){
                                                if(!thenItems.find(x => x.elementView.id == rel.targetElement.elementView.id)){
                                                    thenItems.push(me.canvas.value.elements[rel.targetElement.elementView.id]);
                                                }
                                            }
                                        }
                                    } else {
                                        if(rel.sourceElement._type == 'org.uengine.modeling.model.Policy' && rel.targetElement._type == 'org.uengine.modeling.model.Event'){
                                            if(rel.sourceElement.elementView.id == me.value.elementView.id){
                                                if(!whenItems.find(x => x.elementView.id == rel.targetElement.elementView.id)){
                                                    thenItems.push(me.canvas.value.elements[rel.targetElement.elementView.id]);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    // when
                                    if(rel.sourceElement._type == 'org.uengine.modeling.model.Command' && rel.targetElement._type == 'org.uengine.modeling.model.Event'){
                                        if(rel.sourceElement.elementView.id == me.value.elementView.id){
                                            if(!whenItems.find(x => x.elementView.id == rel.sourceElement.elementView.id)){
                                                whenItems.push(me.canvas.value.elements[rel.sourceElement.elementView.id]);
                                            }
                                            if(!thenItems.find(x => x.elementView.id == rel.targetElement.elementView.id)){
                                                thenItems.push(me.canvas.value.elements[rel.targetElement.elementView.id]);
                                            }
                                        }
                                    }
                                }                                
                            }
                        })
                    }
                    me.rule.whenItems = whenItems
                    me.rule.thenItems = thenItems
                    me.rule.ruleName = `Whenever ${me.rule.whenItems[0].name}, ${me.rule.thenItems[0].name}`
                } 
            },
            setAttributes(){
                var me = this
                if(me.value && me.value.examples 
                && me.value.examples[0].given
                && me.value.examples[0].when
                && me.value.examples[0].then)
                {
                    me.rule.values = me.value.examples
                    me.rule.thenItems.forEach(function (item){
                        me.thenAttLength[item.name] = item.fieldDescriptors.length
                    })
                } else {
                    me.setExampleFrameWork()
                    me.rule.values = [] 
                    me.rule.values.push(me.exampleFrameWork)
                }
            },
            setExampleFrameWork(){
                var me = this;
                let values = {
                    "given": [
                        {
                            name: null,
                            type: "Aggregate",
                            value: {}
                        }
                    ],
                    "when": [
                        {
                            name: null,
                            type: null,
                            value: {}
                        }
                    ],
                    "then": [],
                }

                values['given'][0].name = me.rule.givenItems[0].name;
                values['when'][0].name = me.rule.whenItems[0].name;

                if(me.rule.whenItems[0]._type.includes("Event")){
                    values['when'][0].type = "Event";
                } else {
                    values['when'][0].type = "Command";
                }

                // 여기서 'given' 값을 설정하는 부분을 수정합니다.
                me.rule.givenItems[0].aggregateRoot.fieldDescriptors.forEach(function (field){
                    var givenArr = [];
                    let givenObject = {};
                    if(me.rule.givenItems[0].aggregateRoot.entities.elements && me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId]) {
                        me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (givenField){
                            givenObject[givenField.name] = "N/A";
                        });
                        givenArr.push(givenObject);
                        givenObject = givenArr;
                    } else {
                        givenObject = "N/A";
                    }
                    values['given'][0].value[field.name] = givenObject;
                });

                me.rule.whenItems[0].fieldDescriptors.forEach(function (field){
                    values['when'][0].value[field.name] = "N/A";
                });

                me.rule.thenItems.forEach(function (item){
                    var obj = {
                        name: item.name,
                        type: "Event",
                        value: {}
                    }
                    item.fieldDescriptors.forEach(function (field){
                        obj.value[field.name] = "N/A";
                    });
                    values['then'].push(obj);
                    me.thenAttLength[item.name] = item.fieldDescriptors.length;
                });
                me.exampleFrameWork = values;
            },
            setTable(){
                var me = this
                me.rule.description = me.value.description
                me.ruleExampleTableHeaders = {
                    given: null,
                    when: null,
                    then: []
                }
                me.ruleExampleTableHeaders.given = me.rule.givenItems[0].name
                me.ruleExampleTableHeaders.when = me.rule.whenItems[0].name
                me.rule.thenItems.forEach(function (item){
                    me.ruleExampleTableHeaders.then.push(item.name)
                })
                
                me.givenAttLength = me.rule.givenItems[0].aggregateRoot.fieldDescriptors.length
                me.whenAttLength = me.rule.whenItems[0].fieldDescriptors.length

                me.isOpenRules = true
            },
        }
    }
</script>
<style>
.given-td-uml:hover {
    background-color:transparent !important;
    cursor: default !important;
}

.given-td:hover {
    background-color:transparent !important;
    cursor: default !important;
}
.tr-input td {
    min-width:85px;
    max-width:150px;
}

.td-component-size {
    min-width:90px;
}
.rules-table {
    border-collapse: collapse;
    width: 98%;
}

.tr-divider td {
    border: 1px solid #E0E0E0;
    padding: 5px;
}
.rules-table tr:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(4)) td:hover {
    background-color: #E0E0E0;
    cursor: pointer;
}

.add-new-example:hover {
    background-color: #E0E0E0;
}
.rule-chip {
    cursor: pointer;
}
</style>