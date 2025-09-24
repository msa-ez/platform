<template>
    <div>
        <v-dialog v-model="isOpenRules" :persistent="isGenerating ? true:false">
            <v-card style="padding: 15px; display: inline-table;">
                <table class="rules-table" cellspacing="0">
                    <tr>
                        <td style="font-size: 20px; font-weight: 500; padding-bottom: 12px;" colspan="999">{{
                            rule.ruleName }}</td>
                        <v-icon @click="isOpenRules = false"
                            style="position:absolute; right:10px; top:10px;">mdi-close</v-icon>
                    </tr>
                    <tr>
                        <td colspan="999">
                            <v-row class="ma-0 pa-0" align="center" justify="space-between">
                                <v-text-field v-model="rule.description" label="Describe your business logic here"
                                    class="delete-input-detail ma-0 pa-0"></v-text-field>
                                <v-btn v-if="!isGenerating" @click="startExampleGenerate()" color="primary" text
                                    class="ml-2 pl-1 pr-1" style="text-transform: none;">
                                    {{ $t('RuleExampleDialog.generateExamples') }}
                                </v-btn>
                                <v-btn v-if="isGenerating" @click="stopExampleGenerate()" color="primary" text
                                    class="ml-2 pl-1 pr-1" style="text-transform: none;">
                                    <v-progress-circular size="15" :width="3" style="margin-right: 10px;" indeterminate
                                        color="primary"></v-progress-circular>
                                    {{ $t('RuleExampleDialog.stopGenerating') }}
                                </v-btn>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-icon v-bind="attrs" v-on="on" class="ml-2"
                                            @click="resetExampleDialog()">mdi-refresh</v-icon>
                                    </template>
                                    <span>{{ $t('RuleExampleDialog.resetExamples') }}</span>
                                </v-tooltip>
                            </v-row>
                        </td>
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
                        <tr class="tr-divider tr-input" style="border-bottom: 1px solid #E0E0E0;">
                            <template v-for="(given, key) in value['given'][0].value">
                                <template v-if="checkItemType(given)">
                                    <td @click="selectTableData(ruleIdx, 'given', key)">
                                        <component
                                            v-if="'given-' + rule['givenItems'][0].name + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
                                            class="td-component-size" :is="getComponentType(selectedAttType)"
                                            v-model="value['given'][0].value[key]" :label="selectedAttType"
                                            :items="selectedEnumItems" @save="closeExampleEditor()"
                                            @selectChip="closeExampleEditor"></component>
                                        <div v-else>
                                            <v-chip class="rule-chip" v-if="chipLabels[given]">{{ chipLabels[given]
                                                }}</v-chip>
                                            <template v-else>{{ given }}</template>
                                        </div>
                                    </td>
                                </template>
                                <table v-else class="rules-table" style="width: 100%;">
                                    <tr>
                                        <td v-for="(givenArrValue, givenArrKey) in given[0]" :key="givenArrKey"
                                            class="given-td-uml">{{ givenArrKey }}</td>
                                    </tr>
                                    <tr v-for="(givenValue, givenIdx) in given" :key="givenIdx">
                                        <td v-for="(givenArrValue, givenArrKey) in givenValue" :key="givenArrKey"
                                            @click="selectTableData(ruleIdx, 'given', givenArrKey, null, null, key, givenIdx)">
                                            <component
                                                v-if="'given-' + rule['givenItems'][0].name + '-' + key + '-' + givenArrKey == selectedItemPath && selectedItemIndex == ruleIdx && selectedGivenIndex == givenIdx"
                                                class="td-component-size" :is="getComponentType(selectedAttType)"
                                                v-model="givenValue[givenArrKey]" :label="selectedAttType"
                                                @save="closeExampleEditor()" @selectChip="closeExampleEditor">
                                            </component>
                                            <div v-else>
                                                <v-chip class="rule-chip" v-if="chipLabels[givenValue[givenArrKey]]">{{
                                                    chipLabels[givenValue[givenArrKey]] }}</v-chip>
                                                <template v-else>{{ givenValue[givenArrKey] }}</template>
                                            </div>
                                        </td>
                                        <v-icon @click="removeExampleItem('given', key, ruleIdx, givenIdx, 0)">mdi-delete</v-icon>
                                    </tr>
                                    <v-icon @click="addExampleItem('given', key, ruleIdx, 0)">mdi-plus</v-icon>
                                </table>
                            </template>
                            <td v-for="key in Object.keys(value['when'][0].value)"
                                @click="selectTableData(ruleIdx, 'when', key)">
                                <component
                                    v-if="'when-' + rule['whenItems'][0].name + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
                                    class="td-component-size" :is="getComponentType(selectedAttType)"
                                    v-model="value['when'][0].value[key]" :label="selectedAttType"
                                    :items="selectedEnumItems"
                                    @save="closeExampleEditor()" @selectChip="closeExampleEditor"></component>
                                <div v-else>
                                    <v-chip class="rule-chip" v-if="chipLabels[value['when'][0].value[key]]">{{
                                        chipLabels[value['when'][0].value[key]] }}</v-chip>
                                    <template v-else>{{ value['when'][0].value[key] }}</template>
                                </div>
                            </td>

                            <template v-for="(then, thenIdx) in value['then']">
                                <template v-for="key in Object.keys(then.value)">
                                    <template v-if="checkItemType(then.value[key])">
                                        <td @click="selectTableData(ruleIdx, 'then', key, thenIdx, then.name)">
                                            <component
                                                v-if="'then-' + rule['thenItems'][thenIdx].name + '-' + key == selectedItemPath && selectedItemIndex == ruleIdx"
                                                class="td-component-size" :is="getComponentType(selectedAttType)"
                                                v-model="then.value[key]" :label="selectedAttType" :items="selectedEnumItems" @save="closeExampleEditor()"
                                                @selectChip="closeExampleEditor"></component>
                                            <div v-else>
                                                <v-chip class="rule-chip" v-if="chipLabels[then.value[key]]">{{ chipLabels[then.value[key]] }}</v-chip>
                                                <template v-else>{{ then.value[key] }}</template>
                                            </div>
                                        </td>
                                    </template>
                                    <table v-else class="rules-table" style="width: 100%;">
                                        <tr>
                                            <td v-for="(thenArrValue, thenArrKey) in then.value[key][0]" :key="thenArrKey"
                                                class="given-td-uml">{{ thenArrKey }}</td>
                                        </tr>
                                        <tr v-for="(thenValue, thenItemIdx) in then.value[key]" :key="thenItemIdx">
                                            <td v-for="(thenArrValue, thenArrKey) in thenValue" :key="thenArrKey"
                                                @click="selectTableData(ruleIdx, 'then', thenArrKey, thenIdx, then.name)">
                                                <component
                                                    v-if="'then-' + rule['thenItems'][thenIdx].name + '-' + thenArrKey == selectedItemPath && selectedItemIndex == ruleIdx"
                                                    class="td-component-size" :is="getComponentType(selectedAttType)"
                                                    v-model="thenValue[thenArrKey]" :label="selectedAttType" @save="closeExampleEditor()" @selectChip="closeExampleEditor">
                                                </component>
                                                <div v-else>
                                                    <v-chip class="rule-chip" v-if="chipLabels[thenValue[thenArrKey]]">{{ chipLabels[thenValue[thenArrKey]] }}</v-chip>
                                                    <template v-else>{{ thenValue[thenArrKey] }}</template>
                                                </div>
                                            </td>
                                            <v-icon @click="removeExampleItem('then', key, ruleIdx, thenItemIdx, thenIdx)">mdi-delete</v-icon>
                                        </tr>
                                        <v-icon @click="addExampleItem('then', key, ruleIdx, thenIdx)">mdi-plus</v-icon>
                                    </table>
                                </template>
                            </template> 
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon style="position: absolute; right: 15px; margin-top: 8px;" v-bind="attrs"
                                        v-on="on" @click="removeExample(ruleIdx)">mdi-delete</v-icon>
                                </template>
                                <span>Delete row</span>
                            </v-tooltip>
                        </tr>
                    </template>
                </table>
                <v-row class="ma-0 pa-0">
                    <v-card outlined class="ma-0 pa-0 mt-2 pt-1 pb-1"
                        style="cursor: pointer; width: 98%; text-align: center;" @click="addExample()">
                        <v-icon style="vertical-align: middle;">mdi-plus</v-icon>
                        <span class="ml-2" style="vertical-align: middle;">Add Row</span>
                    </v-card>
                </v-row>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import isAttached from '../../../utils/isAttached';
    import getParent from '../../../utils/getParent';
    import RuleExampleGenerator from '../modeling/generators/RuleExampleGenerator'
    import DebeziumLogsTabGenerator from '../modeling/generators/generatorTabs/DebeziumLogsTabGenerator'
    import String from '../../primitives/String.vue'
    import Number from '../../primitives/Number.vue'
    import Boolean from '../../primitives/Boolean.vue'
    import Enum from '../../primitives/Enum.vue'

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
            Boolean,
            Enum
        },
        data() {
            return {
                exampleFrameWork: null,
                isGenerating: false,
                generatorComponent: null,
                debeziumGeneratorComponent: null,
                currentUsingGeneratorName: null,
                debeziumMessageObj: {
                    modificationMessage: "",
                    gwtRequestValue: {
                        givenObjects: null,
                        whenObjects: null,
                        thenObjects: null
                    }
                },
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
                selectedEnumItems: [],
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
            me.debeziumGeneratorComponent = new DebeziumLogsTabGenerator(this, this.debeziumMessageObj);
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
            checkItemType(item) {
                var isArray = Array.isArray(item);
                var isObject = typeof item == 'object';
                return !isArray || !isObject;
            },
            removeExampleItem(type, key, ruleIdx, itemIdx, thenIdx) {
                let items;
                if(type == 'given'){
                    items = this.rule.values[ruleIdx]['given'][0].value[key];
                } else {
                    items = this.rule.values[ruleIdx][type][thenIdx].value[key];
                }
                if (!items) {
                    console.error('No items found');
                    return;
                }
                if (items.length === 1) {
                    console.error('Cannot delete as only one item remains');
                    return;
                }
                if (itemIdx >= items.length) {
                    console.error('Invalid index to delete');
                    return;
                }
                items.splice(itemIdx, 1);
            },
            addExampleItem(type, key, ruleIdx, thenIdx) {
                var me = this;
                let exampeObject = {};
                if(type == 'given'){
                    var field = me.rule.givenItems[0].aggregateRoot.fieldDescriptors.find(x => x.name == key);
                    if (me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId]) {
                        me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (givenField) {
                            exampeObject[givenField.name] = "N/A";
                        });
                        if (!me.rule.values[0]['given'][0].value[field.name]) {
                            me.$set(me.rule.values[0]['given'][0].value, field.name, []);
                        }
                        me.rule.values[ruleIdx]['given'][0].value[field.name].push(exampeObject);
                    } else {
                        console.error('Field classId not found in entities.elements');
                    }
                } else {
                    var field = me.rule.thenItems[thenIdx].aggregateRoot.fieldDescriptors.find(x => x.name == key);
                    if (me.rule.thenItems[thenIdx].aggregateRoot.entities.elements[field.classId]) {
                        me.rule.thenItems[thenIdx].aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (thenField) {
                            exampeObject[thenField.name] = "N/A";
                        });
                        if (!me.rule.values[0]['then'][thenIdx].value[field.name]) {
                            me.$set(me.rule.values[0]['then'][thenIdx].value, field.name, []);
                        }
                        me.rule.values[ruleIdx]['then'][thenIdx].value[field.name].push(exampeObject);
                    } else {
                        console.error('Field classId not found in entities.elements');
                    }
                }
            },
            
            removeExample(ruleIdx) {
                if (this.rule.values.length > 1) {
                    this.rule.values.splice(ruleIdx, 1);
                } else if(this.rule.values.length == 1){
                    this.resetExampleDialog()
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
                    case 'Enum':
                        return 'Enum';
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
                    let selectedData = me.rule[type + 'Items'].find(x => x.name == thenName)
                    if(selectedData && selectedData._type.includes("Aggregate")){
                        selectedItem = selectedData.aggregateRoot.fieldDescriptors.find(x => x.name == key);
                        if(!selectedItem) {
                            selectedItem = me.rule[type + 'Items'][thenIdx].aggregateRoot.fieldDescriptors.find(x => x.name == key);
                        }
                    } else {
                        selectedItem = selectedData.fieldDescriptors.find(x => x.name == key);
                        if(!selectedItem) {
                            selectedItem = me.rule[type + 'Items'][thenIdx].fieldDescriptors.find(x => x.name == key);
                        }
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
                if(me.rule[type + 'Items'][0].aggregateRoot.entities.elements[selectedItem.classId] && me.rule[type + 'Items'][0].aggregateRoot.entities.elements[selectedItem.classId]._type == "org.uengine.uml.model.enum"){
                    me.selectedAttType = "Enum"
                    me.selectedEnumItems = me.rule[type + 'Items'][0].aggregateRoot.entities.elements[selectedItem.classId].items.map(item => item.value);
                } else {
                    me.selectedAttType = selectedItem ? selectedItem.className : "";
                }
            },
            resetExampleDialog(){
                var me = this
                if(me.value && me.value.examples){
                    me.value.examples = null
                }
                me.openExampleDialog()
            },
            onGenerationFinished(content){
                const getRuleValues = (gwts) => {
                    const generateExamples = (gwts) => {
                        const getExample = (gwt) => {
                            const getGivens = (givens) => {
                                const given = givens[0]
                                return [
                                    {
                                    "type": "Aggregate",
                                    "name": given.name,
                                    "value": given.values
                                }]
                            }

                            const getWhens = (whens) => {
                                const when = whens[0]
                                return [
                                    {
                                        "type": "Event",
                                        "name": when.name,
                                        "value": when.values
                                    }
                                ]
                            }

                            const getThens = (thens) => {
                                return thens.map((then) => {
                                    return {
                                        "type": "Event",
                                        "name": then.name,
                                        "value": then.values
                                    }
                                })
                            }

                            return {
                                "given": getGivens(gwt.givens),
                                "when": getWhens(gwt.whens),
                                "then": getThens(gwt.thens)
                            }
                        }

                        return gwts.map((gwt) => {
                            return getExample(gwt)
                        })
                    }

                    return generateExamples(gwts)
                }

                switch(this.currentUsingGeneratorName){
                    case "DebeziumLogsTabGenerator":
                        this.rule.values = getRuleValues(content.modelValue.gwts)
                        break
                    case "RuleExampleGenerator":
                        break
                }

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
                switch(this.currentUsingGeneratorName){
                    case "DebeziumLogsTabGenerator":
                        break
                    case "RuleExampleGenerator":
                        this.rule.values = content
                        break
                }
            },
            startExampleGenerate(){
                const isDebeziumLogMessage = (message) => {
                    const getDebeziumLogStrings = (logs) => {
                        return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                    }

                    let debeziumLogStrings = getDebeziumLogStrings(message)
                    if(!debeziumLogStrings || debeziumLogStrings.length === 0) {
                        return false
                    }
                    return true
                }

                var me = this
                me.$EventBus.$emit('policyDescriptionUpdated', me.rule.description)
                me.isGenerating = true

                if(me.rule.description && isDebeziumLogMessage(me.rule.description)){
                    me.currentUsingGeneratorName = "DebeziumLogsTabGenerator"
                    me.debeziumGeneratorComponent.modelMode = "generateGWT"
                    me.debeziumMessageObj.modificationMessage = me.rule.description
                    me.debeziumMessageObj.gwtRequestValue.givenObjects = me.rule.givenItems
                    me.debeziumMessageObj.gwtRequestValue.whenObjects = me.rule.whenItems
                    me.debeziumMessageObj.gwtRequestValue.thenObjects = me.rule.thenItems
                    me.debeziumGeneratorComponent.generate()
                } else {
                    me.currentUsingGeneratorName = "RuleExampleGenerator"
                    me.generatorComponent.generate()
                }     
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

                if(me.value && (me.value._type.includes("Policy") || me.value._type.includes("Command") || me.value._type.includes("View"))){
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
                                } else if(me.value._type.includes("Command")){
                                    // when
                                    let defaultFieldDescriptor = {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                    let whenItem = JSON.parse(JSON.stringify(me.value))
                                    if(!whenItems.find(x => x.id == whenItem.id)){
                                        if(!whenItem.isRestRepository){
                                            if(me.value.fieldDescriptors.length == 0){
                                                whenItem.fieldDescriptors = []
                                                whenItem.fieldDescriptors.push(defaultFieldDescriptor)
                                            }
                                        } else if(whenItem.restRepositoryInfo.method == 'POST'){
                                            if(whenItem.aggregate && whenItem.aggregate.id && me.canvas.value.elements[whenItem.aggregate.id]){
                                                whenItem.fieldDescriptors = JSON.parse(JSON.stringify(me.canvas.value.elements[whenItem.aggregate.id].aggregateRoot.fieldDescriptors))
                                            } else {
                                                whenItem.fieldDescriptors = []
                                                whenItem.fieldDescriptors.push(defaultFieldDescriptor)
                                            }
                                        } else if(whenItem.restRepositoryInfo.method == 'DELETE'){
                                            whenItem.fieldDescriptors = []
                                            whenItem.fieldDescriptors.push(defaultFieldDescriptor)
                                        } 
                                        whenItems.push(whenItem)
                                    }

                                    if(rel.sourceElement._type == 'org.uengine.modeling.model.Command' && rel.targetElement._type == 'org.uengine.modeling.model.Event'){
                                        if(rel.sourceElement.elementView.id == me.value.elementView.id){
                                            if(!thenItems.find(x => x.elementView.id == rel.targetElement.elementView.id)){
                                                thenItems.push(me.canvas.value.elements[rel.targetElement.elementView.id]);
                                            }
                                        }
                                    } 
                                } else if(me.value._type.includes("View")){
                                    // when
                                    if(rel.sourceElement._type == 'org.uengine.modeling.model.Command' && rel.targetElement._type == 'org.uengine.modeling.model.View'){
                                        if(rel.targetElement.elementView.id == me.value.elementView.id){
                                            if(!whenItems.find(x => x.elementView.id == rel.sourceElement.elementView.id)){
                                                whenItems.push(me.canvas.value.elements[rel.sourceElement.elementView.id]);
                                            }
                                            if(!thenItems.find(x => x.elementView.id == rel.targetElement.elementView.id)){
                                                let element = JSON.parse(JSON.stringify(me.canvas.value.elements[rel.targetElement.elementView.id]));
                                                element.fieldDescriptors = element.queryParameters
                                                thenItems.push(element);
                                            }
                                        }
                                    }
                                }                                
                            }
                        })
                    }
                    me.rule.whenItems = whenItems
                    if((me.value._type.includes("Policy") || me.value._type.includes("Command")) && thenItems.length == 0){
                        thenItems = JSON.parse(JSON.stringify(me.rule.givenItems))
                    }
                    me.rule.thenItems = thenItems
                    me.rule.ruleName = `Whenever ${me.rule.whenItems[0].name}, ${me.rule.thenItems[0].name}`
                } 
            },
            setAttributes(){
                var me = this
                function areObjectsEqual(obj1, obj2) {
                    // Helper function to compare two arrays of objects
                    function compareArray(arr1, arr2) {
                        if (arr1.length !== arr2.length) return false;
                        for (let i = 0; i < arr1.length; i++) {
                            if (arr1[i].name !== arr2[i].name) {
                                return false;
                            }
                            // Compare keys in the 'value' object
                            const keys1 = Object.keys(arr1[i].value); 
                            const keys2 = Object.keys(arr2[i].value);
                            if (keys1.length !== keys2.length || !keys1.every(key => keys2.includes(key))) {
                                return false;
                            } else {
                                for (let key of keys1) {
                                    if (typeof arr1[i].value[key] !== typeof arr2[i].value[key]) {
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }

                    // Compare 'given', 'when', and 'then' arrays
                    return compareArray(obj1[0].given, obj2.given) &&
                        compareArray(obj1[0].when, obj2.when) &&
                        compareArray(obj1[0].then, obj2.then);
                }
                me.setExampleFrameWork();
                if(me.value && me.value.examples && me.value.examples.length > 0 && me.__isValidExample(me.value.examples[0]))
                {
                    var checkValue = areObjectsEqual(me.value.examples, me.exampleFrameWork)
                    if(checkValue){
                        me.rule.values = me.value.examples
                    } else {
                        me.rule.values = [];
                        
                        for(let i = 0; i < me.value.examples.length; i++){
                            if(!me.__isValidExample(me.value.examples[i])) continue;

                            const exampleFrameworkToUse = JSON.parse(JSON.stringify(me.exampleFrameWork))
                            const exampleToUse = JSON.parse(JSON.stringify(me.value.examples[i]))

                            me._mapValues(exampleFrameworkToUse.given, exampleToUse.given);
                            me._mapValues(exampleFrameworkToUse.when, exampleToUse.when);
                            me._mapValues(exampleFrameworkToUse.then, exampleToUse.then);

                            me.rule.values.push(exampleFrameworkToUse);
                        }
                    }

                    me.rule.thenItems.forEach(function (item){
                        let fieldDescriptors = item.fieldDescriptors || item.aggregateRoot.fieldDescriptors
                        me.thenAttLength[item.name] = fieldDescriptors.length;
                    })
                } else {
                    me.rule.values = [];
                    me.rule.values.push(me.exampleFrameWork)
                }
            },
            __isValidExample(example) {
                return example.given && example.given[0].value && 
                       example.when && example.when[0].value && 
                       example.then && example.then[example.then.lastIndex].value
            },
            _mapValues(frameworkArray, sourceArray){
                frameworkArray.forEach((frameworkItem, index) => {
                    const sourceItem = sourceArray[index];
                    if (sourceItem) {
                        Object.keys(frameworkItem.value).forEach(key => {
                            if (sourceItem.value[key] !== undefined) {

                                // 임시용
                                frameworkItem.value[key] = sourceItem.value[key];

                                // frameworkArray가 현재 적절한 타입으로 정의되어 있지 않아서 이 조건 검사는 버그를 일으키고 있음
                                // TODO: setExampleFrameWork에서 전달되는 given, when, then 객체의 타입에 따라서 정확하게 frameworkArray를 정확하게 구축하도록 만들고, 주석 해제하기
                                // if(typeof sourceItem.value[key] == typeof frameworkItem.value[key]){
                                //     frameworkItem.value[key] = sourceItem.value[key];
                                // }
                                
                            } else {
                                frameworkItem.value[key] = "N/A";
                            }
                        });
                    }
                });
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
                    if(me.rule.givenItems[0].aggregateRoot.entities.elements && me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId] && me.rule.givenItems[0].aggregateRoot.entities.elements[field.classId].fieldDescriptors) {
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

                if(me.rule.whenItems[0].fieldDescriptors && me.rule.whenItems[0].fieldDescriptors.length > 0){
                    me.rule.whenItems[0].fieldDescriptors.forEach(function (field){
                        values['when'][0].value[field.name] = "N/A";
                    });
                } else {
                    values['when'][0].value["N/A"] = "N/A";
                }

                me.rule.thenItems.forEach(function (item){
                    let type = item._type ? item._type.split('.').pop() : ''
                    var obj = {
                        name: item.name,
                        type: type,
                        value: {}
                    }
                    let fieldDescriptors = item.fieldDescriptors || item.aggregateRoot.fieldDescriptors
                    fieldDescriptors.forEach(function (field){
                        if (item.aggregateRoot && item.aggregateRoot.entities && item.aggregateRoot.entities.elements && item.aggregateRoot.entities.elements[field.classId] && item.aggregateRoot.entities.elements[field.classId].fieldDescriptors) {
                            let thenArr = [];
                            let thenObject = {};
                            item.aggregateRoot.entities.elements[field.classId].fieldDescriptors.forEach(function (thenField){
                                thenObject[thenField.name] = "N/A";
                            });
                            thenArr.push(thenObject);
                            obj.value[field.name] = thenArr;
                        } else {
                            obj.value[field.name] = "N/A";
                        }
                    });
                    values['then'].push(obj);
                    me.thenAttLength[item.name] = fieldDescriptors.length;
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