<template>
    <div>
        <v-dialog v-model="isOpenRules" :persistent="isGenerating ? true:false">
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
                    <template v-for="(value, ruleIdx) in rule.values">
                        <tr class="tr-divider tr-input"
                            style="border-bottom: 1px solid #E0E0E0;"
                        >
                            <template v-for="(given, key) in value['given'][0].value">
                                <template v-if="checkGivenType(given)">
                                    <td @click="selectTableData(ruleIdx, 'given', key)">
                                        <component v-if="'given-' + rule['givenItems'][0].name + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
                                            class="td-component-size"
                                            :is="getComponentType(selectedAttType)"
                                            v-model="value['given'][0].value[key]" 
                                            :label="selectedAttType"
                                            @save="closeExampleEditor()"
                                            @selectChip="closeExampleEditor"
                                        ></component>
                                        <div v-else>
                                            <v-chip class="rule-chip" v-if="chipLabels[given]">{{ chipLabels[given] }}</v-chip>
                                            <template v-else>{{ given }}</template>
                                        </div>
                                    </td>
                                </template>
                                <table v-else class="rules-table" style="width: 100%;">
                                    <tr>
                                        <td v-for="(givenArrValue, givenArrKey) in given[0]" class="given-td-uml">{{ givenArrKey }}</td>
                                    </tr>
                                    <tr v-for="(givenValue, givenIdx) in given">
                                        <td v-for="(givenArrValue, givenArrKey) in givenValue" @click="selectTableData(ruleIdx, 'given', givenArrKey, null, null, key, givenIdx)">
                                            <component v-if="'given-' + rule['givenItems'][0].name + '-' + key + '-' + givenArrKey == selectedItemPath && selectedItemIndex == ruleIdx && selectedGivenIndex == givenIdx"
                                                class="td-component-size"
                                                :is="getComponentType(selectedAttType)"
                                                v-model="givenValue[givenArrKey]" 
                                                :label="selectedAttType"
                                                @save="closeExampleEditor()"
                                                @selectChip="closeExampleEditor"
                                            ></component>
                                            <div v-else>
                                                <v-chip class="rule-chip" v-if="chipLabels[givenValue[givenArrKey]]">{{ chipLabels[givenValue[givenArrKey]] }}</v-chip>
                                                <template v-else>{{ givenValue[givenArrKey] }}</template>
                                            </div>
                                        </td>
                                        <v-icon @click="removeGivenExample(key, ruleIdx, givenIdx)">mdi-delete</v-icon>
                                    </tr>
                                    <v-icon @click="addGivenExample(key, ruleIdx)">mdi-plus</v-icon>
                                </table>
                            </template>
                            <td v-for="key in Object.keys(value['when'][0].value)" @click="selectTableData(ruleIdx, 'when', key)">
                                <component v-if="'when-' + rule['whenItems'][0].name + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
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
                            
                            <template v-for="(then, thenIdx) in value['then']">
                                <td v-for="key in Object.keys(then.value)" @click="selectTableData(ruleIdx, 'then', key, thenIdx, then.name)">
                                    <component v-if="'then-' + rule['thenItems'][thenIdx].name  + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
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
                            <v-icon style="position: absolute; right: 10px; margin-top: 5px;" @click="removeExample(ruleIdx)">mdi-delete</v-icon>
                        </tr>
                    </template>
                </table>
                <v-text-field v-model="rule.description"></v-text-field>
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
            removeGivenExample(key, ruleIdx, givenIdx) {
                const items = this.rule.values[ruleIdx]['given'][0].value[key];
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
            removeExample(ruleIdx) {
                if (this.rule.values.length > 1) {
                    this.rule.values.splice(ruleIdx, 1);
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
            addGivenExample(key, ruleIdx) {
                var me = this;
                var field = me.rule.givenItems[0].aggregateRoot.fieldDescriptors.find(x => x.name == key);
                let givenObject = {};

                if (me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId]) {
                    me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (givenField) {
                        givenObject[givenField.name] = "N/A";
                    });
                    if (!me.rule.values[0]['given'][0].value[field.name]) {
                        me.$set(me.rule.values[0]['given'][0].value, field.name, []);
                    }
                    me.rule.values[ruleIdx]['given'][0].value[field.name].push(givenObject);
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
            selectTableData(ruleIdx, type, key, thenIdx, thenName, givenUmlKey, givenIdx) {
                event.stopPropagation();
                var me = this;
                var selectedItem;
                var itemName;

                if (type == 'then') {
                    selectedItem = me.rule[type + 'Items'].find(x => x.name == thenName).fieldDescriptors.find(x => x.name == key);
                    if(!selectedItem) {
                        selectedItem = me.rule[type + 'Items'][thenIdx].fieldDescriptors.find(x => x.name == key);
                    }
                    itemName = me.rule[type + 'Items'][thenIdx].name
                } else {
                    itemName = me.rule[type + 'Items'][0].name
                    if (type == 'given') {
                        selectedItem = me.rule[type + 'Items'][0].aggregateRoot.fieldDescriptors.find(x => x.name == key);
                    } else {
                        selectedItem = me.rule[type + 'Items'][0].fieldDescriptors.find(x => x.name == key);
                    }
                }
                if (!givenUmlKey) {
                    me.selectedItemPath = `${type}-${itemName}-${key}`;
                } else {
                    var typeItem = me.rule[type + 'Items'][0].aggregateRoot
                    var givenItem = typeItem.fieldDescriptors.find(x => x.name == givenUmlKey);
                    selectedItem = typeItem.entities.elements[givenItem.classId].fieldDescriptors.find(x => x.name == key);
                    me.selectedItemPath = `${type}-${itemName}-${givenUmlKey}-${key}`;
                    me.selectedGivenIndex = givenIdx;
                }
                me.selectedItemIndex = ruleIdx;
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
                me.$EventBus.$emit('policyDescriptionUpdated', me.rule.description)
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
                    } else if (me.canvas.attachedLists().aggregateLists && Object.values(me.canvas.attachedLists().aggregateLists).length > 0) {
                        Object.values(me.canvas.attachedLists().aggregateLists).forEach(function (aggregate, idx) {
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
                && me.value.examples[0].given && me.value.examples[0].given[0].value
                && me.value.examples[0].when && me.value.examples[0].when[0].value
                && me.value.examples[0].then && me.value.examples[0].then[me.value.examples[0].then.lastIndex].value)
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

                if (me.rule.givenItems.length > 0) {
                    values['given'][0].name = me.rule.givenItems[0].name;
                }

                if (me.rule.whenItems.length > 0) {
                    values['when'][0].name = me.rule.whenItems[0].name;
                }

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