<template>
    <common-panel
            v-model="value"
            :image="image"
            :isReadOnly="isReadOnly"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >
        <template slot="md-level-btn">
            <v-chip @click="toggleDesignLevel" style="margin-right: 16px; cursor: pointer;" color="primary" outlined>
                <v-icon left>{{ isDesignLevelVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                {{ $t('CommandDefinitionPanel.implementationSettings') }}
            </v-chip>
        </template>
        
        <template slot="t-description-text">
            {{ $t('panelInfo.CommandDefinitionPanel') }}
        </template>

        <template slot="t-generation-text">
            Commands become the inbound Adaptor implementations and the Port methods of the Aggregate Root according to the Hexagonal / Clean Architecture.
        </template>

        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && !value.mirrorElement && isReadOnly"
                    style="text-align:center"
            >
                <v-chip
                        small
                        color="orange"
                        text-color="white"
                        style="font-weight:bold"
                        @click.once="forceEditPanel()"
                >
                    <v-avatar left>
                        <v-icon>mdi-lead-pencil</v-icon>
                    </v-avatar>
                    <v-row class="ma-0 pa-0">
                        <div>{{newEditUserImg[0].name}} is editing...</div>
                        <div style="font-size: 12px;">( Click to edit )</div>
                    </v-row>
                </v-chip>
            </div>
        </template>

        <template slot="md-title-side">
            <v-btn
                color="primary"
                :disabled="isReadOnly || !exampleAvailable"
                @click="openExampleDialog()"
            >Examples</v-btn>
            <v-tooltip bottom v-if="!exampleAvailable">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on"
                        style="margin-left: -8px; margin-top: -15px; width: 10px; height: 10px;">
                        <v-icon color="grey lighten-1">mdi-help-circle</v-icon>
                    </v-btn>
                </template>
                <span>
                    The following steps are required to use the 'EXAMPLES'. <br>
                    1. A relationship with the event occurring through the command must be formed. <br>
                    e.g.<br>
                    <img width="366" alt="image" src="https://github.com/user-attachments/assets/2bf62154-0a8a-4269-867e-996ad90d2947">
                </span>
            </v-tooltip>
        </template>

        <template slot="element">
            <div>
                <RuleExampleDialog v-if="openExample" v-model="value" @closeExampleDialog="closeExampleDialog()" />
                <v-card flat>
                    <v-card-text>
                        <v-col class="pa-0">
                            <span class="panel-title">{{ $t('TitleText.associatedAggregate') }}</span>
                            <v-text-field
                                    v-model="relatedAggregateName"
                                    label="Attach Aggregate && check Name"
                                    single-line
                                    disabled
                            ></v-text-field>


                            <div v-show="isDesignLevelVisible">
                                <span class="panel-title">Method</span>
                                <!-- <v-alert
                                    color="grey darken-1"
                                    text
                                    type="info"
                                    class="pa-2 alert-text"
                                    style="margin-left: -10px;"
                                >
                                메소드의 목적을 설정하세요. <br>
                                Default: 기본 RESTful API // Extend: 확장된 URI
                                </v-alert> -->
                                <v-radio-group v-model="value.isRestRepository" :disabled="isReadOnly" row>
                                    <v-radio label="Default Verbs" :value="true"></v-radio>
                                    <v-radio label="Extend Verb URI" :value="false"></v-radio>
                                </v-radio-group>
                                <detail-component
                                    :title="$t('CommandDefinitionPanel.commandMethodDetailTitle')"
                                    :details="commandMethodDetailTitles"
                                />

                                <v-col class="pa-0" v-if="value.isRestRepository">
                                    <v-autocomplete
                                            :disabled="isReadOnly"
                                            v-model="value.restRepositoryInfo.method"
                                            :items="getRestfulList"
                                            label="Method"
                                            persistent-hint>
                                    </v-autocomplete>
                                </v-col>


                                <v-col class="pa-0" v-else>
                                    <v-row class="pa-0 ma-0" style="align-items: center">
                                        <v-text-field
                                                v-model="value.controllerInfo.apiPath"
                                                :disabled="isReadOnly"
                                                label="API Path"
                                                :prefix="`${elementPrefix}`"
                                        ></v-text-field>
                                    </v-row>
                                    <v-autocomplete
                                            v-model="value.controllerInfo.method"
                                            :disabled="isReadOnly"
                                            label="Method"
                                            persistent-hint
                                            :items="getControllerList"
                                    ></v-autocomplete>
                                    <detail-component
                                        :title="$t('CommandDefinitionPanel.commandUsageDetailTitle')"
                                        :details="commandUsageDetailTitles"
                                    />
                                    <!-- <v-alert
                                        color="grey darken-1"
                                        text
                                        type="info"
                                        class="pa-2 alert-text"
                                        style="margin-left: -20px;"
                                    >
                                    메소드의 타입을 설정하세요. <br>
                                    POST: 등록 // PUT, PATCH: 수정 // DELETE: 삭제
                                    </v-alert> -->
                                    <event-storming-attribute class="cm-attribute"
                                            label="Request Body"
                                            v-model="value.fieldDescriptors"
                                            :entities="entities"
                                            :isReadOnly="isReadOnly"
                                            :type="value._type"
                                            :elementId="value.elementView.id"
                                            @sync-attribute="syncFromAggregate"
                                    ></event-storming-attribute>
                                </v-col>

                                <span class="panel-title">Httpie command usages</span>
                                <v-row class="pa-0 ma-0" style="align-items: center;">
                                    <v-btn icon small @click="copyRestRepositoryMethod()"
                                        style="align-self: start; margin-top: 15px;"
                                    >
                                        <v-icon small> mdi-content-copy</v-icon>
                                    </v-btn>
                                    <v-textarea
                                            v-model="commandExample"
                                            solo
                                            class="mx-2"
                                            style="margin-top: 20px;"
                                            auto-grow
                                    ></v-textarea>
                                </v-row>
                            </div>
                        </v-col>
                    </v-card-text>
                </v-card>
            </div>
        </template>
    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import RuleExampleDialog from "../RuleExampleDialog"

    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');
    var pluralize = require('pluralize');

    export default {
        mixins: [EventStormingModelPanel],
        name: 'command-panel',
        props:{
            entities: {
                type: Object,
                default: function () {
                    return {}
                }
            },
            isPBCModel: Boolean,
        },
        components: {
            CommonPanel,
            RuleExampleDialog
        },
        data() {
            return {
                show: false,
                httpCommand: null,
                commandExample: null,
                relatedAggregate: null,
                exampleAvailable: false,
                commandMethodDetailTitles: [
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle1" 
                    },
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle2" 
                    },
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle3" 
                    },
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle4" 
                    },
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle5" 
                    },
                    {
                        title: "CommandDefinitionPanel.commandMethodDetailSubTitle6" 
                    },
                ],
                commandUsageDetailTitles: [
                    {
                        title: "CommandDefinitionPanel.commandUsageDetailSubTitle1" 
                    },
                ]
            }
        },
        computed: {
            relatedAggregateName(){
                if(this.relatedAggregate){
                    return this.relatedAggregate.name
                }
                return null;
            },
            getRestfulList(){
                return this.restfulList.slice(1)
            },
            getControllerList(){
                return this.restfulList.filter(method => method === 'POST' || method === 'PUT' || method === 'DELETE');
            },
            elementPrefix(){
                var me = this
                if(me.isOpenAPIPBC) return '';

                if(me.value){
                    if(me.value.isRestRepository){
                        return null
                    }else{
                        if(me.value && me.relatedAggregateName){
                            var aggName = me.relatedAggregateName
                            if(me.value.controllerInfo.method == 'POST') {
                                me.setApiPath();
                                return `/${pluralize(changeCase.camelCase(aggName))}`;
                            } else {
                                return `/${pluralize(changeCase.camelCase(aggName))}/{id}/`;
                            }
                        }else{
                            return '/{ Aggregate }/{id}/'
                        }
                    }
                }
                return null

            },
        },
        beforeDestroy() {

        },
        created: function () { 
            this.exampleAvailable = this.validateRuleExample()
         },
        watch: {
            // "value.controllerInfo":{
            //     deep: true,
            //     handler: function (newVal, oldVal) {
            //         this.setHttpCommand()
            //     }
            // },

            "value.name": function(newVal) {
                this.setApiPath()
                this.setHttpCommand()
            },
            "value.controllerInfo.method": function(newVal) {
                this.setApiPath()
                this.setHttpCommand()
            },
            "value.restRepositoryInfo.method":function(newVal){
                this.setHttpCommand()
            },
            "value.isRestRepository":function(newVal){
                this.setHttpCommand()
            },
            "value.name":function(newVal){
                this.setHttpCommand()
            },
            "value.fieldDescriptors":{
                deep: true,
                handler: function () {
                    this.setHttpCommand()
                }
            },
        },
        methods: {
            panelInit(){
                var me = this
                // Element
                // me.relatedAggregate = me.canvas.getAttachedAggregate(me.value)
                me.relatedAggregate = me.isPBCModel ? me.value.aggregate : me.canvas.getAttachedAggregate(me.value)
                if (me.isForeign) {
                    me.relatedUrl = 'https://intro.msaez.io/tool/event-storming-tool/#command-sticker'
                } else {
                    me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#command-sticker'
                }

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            setApiPath(){
                var me = this
                var getName = me.value.name
                var lowerCase = JSON.parse(JSON.stringify(getName)).toLowerCase()
                lowerCase = lowerCase.replace(' ', '');
                try {
                    if(!me.value.controllerInfo.apiPath){
                        me.value.controllerInfo.apiPath = lowerCase
                    }
                    if(me.value.controllerInfo.method != 'POST'){
                        me.value.controllerInfo.apiPath = lowerCase
                    }else{
                        me.value.controllerInfo.apiPath = '/'+lowerCase;
                    }
                } catch {
                    console.log('methods : setApiPath() Error')
                }

            },
            async changedNamePanel(newVal) {
                var me = this
                // element 전달.
                me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = newVal.replace(/\n/g, "").replace(/ /gi, "")

                var translateObj = await me.getTranslate(newVal);
                me.usedTranslate = translateObj.usedTranslate
                me.translateText = translateObj.translateText
            },
            getTranslate(newVal) {
                try {
                    return new Promise(async function (resolve) {
                        googleTranslate.detectLanguage(newVal, function (err, detection) {
                            if(detection){
                                if (detection.language != 'en') {
                                    googleTranslate.translate(newVal, 'en', function (err, translation) {
                                        var obj = {
                                            'usedTranslate': true,
                                            'translateText': changeCase.pascalCase(translation.translatedText)
                                        }
                                        resolve(obj)
                                    });
                                }
                            }
                        });
                    })
                } catch (e) {
                    return undefined;
                }
            },
            setHttpCommand(){
                var me = this
                var aggName = 'aggs'
                var descriptor = me.value.fieldDescriptors.find(descriptor => descriptor.name);
                var descriptorName = descriptor ? descriptor.name : undefined;

                if(me.value.isRestRepository){
                    var fieldDescriptorsName = 'aggFieldName="value" '
                    if(me.value && me.relatedAggregateName){
                        aggName = me.relatedAggregateName
                        aggName = pluralize(changeCase.camelCase(aggName))
                        aggName = aggName.toLowerCase()

                        if(me.relatedAggregate && me.relatedAggregate.aggregateRoot && me.relatedAggregate.aggregateRoot.fieldDescriptors.length > 1 ){
                            fieldDescriptorsName = ''
                            me.relatedAggregate.aggregateRoot.fieldDescriptors.forEach(function (fieldItem) {
                                if(!fieldItem.isKey && !fieldItem.isVO && (fieldItem.className == 'String' || fieldItem.className == 'Long' || fieldItem.className == 'Integer' || fieldItem.className == 'Double' || fieldItem.className == 'BigDecimal')){
                                    switch(fieldItem.className){
                                        case "String":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="value" ` )
                                            break;
                                        case "Long":
                                        case "Integer":
                                        case "Float":
                                        case "BigDecimal":
                                        case "Double":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}=0 ` )
                                            break;
                                        case "Boolean":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}=true ` )
                                            break;
                                        default:
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="value" `);
                                            break;
                                    }
                                }
                                else if(!fieldItem.isKey && (fieldItem.className != 'String' || fieldItem.className != 'Long' || fieldItem.className != 'Integer' || fieldItem.className != 'Double' || fieldItem.className != 'BigDecimal' || fieldItem.className != 'Date')){
                                    Object.values((me.relatedAggregate.aggregateRoot.entities.relations) || {})
                                    .filter(relation =>  relation.targetElement.namePascalCase === fieldItem.className)
                                    .forEach((field) => {
                                        var target = field.targetElement;
                                        var tempField = '';
                                        if(target.isVO){
                                            var field = target.fieldDescriptors
                                            field.forEach(item => {
                                                switch(item.className) {
                                                    case "String":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"value"`, ", ");
                                                        break;
                                                    case "Long":
                                                    case "Integer":
                                                    case "Float":
                                                    case "BigDecimal":
                                                    case "Double":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"0"`, ", ");
                                                        break;
                                                    case "Boolean":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"true"`, ", ");
                                                        break;
                                                    default:
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"value"`, ", ");
                                                        break;
                                                }
                                            });
                                            tempField = tempField.slice(0, -2);
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${target.nameCamelCase}:='{${tempField}}' `);

                                        }else{
                                            if(target._type.endsWith("enum")){
                                                fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="${target.items[0].value}" ` )
                                            }
                                        }
                                    });
                                }
                            })
                        }
                    }

                    if(me.isOpenAPIPBC){
                        // RestRepository  -> Default Verbs
                        if(me.value.restRepositoryInfo.method == 'POST'){
                            me.commandExample = `http POST localhost:8080/${me.value.restRepositoryInfo.apiPath} ${fieldDescriptorsName}`
                        }else if(me.value.restRepositoryInfo.method == 'PATCH'){
                            me.commandExample = `http PATCH localhost:8080/${me.value.restRepositoryInfo.apiPath}/1 ${fieldDescriptorsName}`
                        }else if(me.value.restRepositoryInfo.method == 'DELETE'){
                            me.commandExample = `http DELETE localhost:8080/${me.value.restRepositoryInfo.apiPath}/1`
                        }else if(me.value.restRepositoryInfo.method == 'PUT'){
                            me.commandExample = `http PUT localhost:8080/${me.value.restRepositoryInfo.apiPath}/1 ${fieldDescriptorsName}`
                        }
                    } else {
                        // RestRepository  -> Default Verbs
                        if(me.value.restRepositoryInfo.method == 'POST'){
                            me.commandExample = `http POST localhost:8080/${aggName} ${fieldDescriptorsName}`
                        }else if(me.value.restRepositoryInfo.method == 'PATCH'){
                            me.commandExample = `http PATCH localhost:8080/${aggName}/1 ${fieldDescriptorsName}`
                        }else if(me.value.restRepositoryInfo.method == 'DELETE'){
                            me.commandExample = `http DELETE localhost:8080/${aggName}/1`
                        }else if(me.value.restRepositoryInfo.method == 'PUT'){
                            me.commandExample = `http PUT localhost:8080/${aggName}/1 ${fieldDescriptorsName}`
                        }
                    }
                }else{
                    var fieldDescriptorsName = 'fieldName="value" '
                    if(me.value && me.value.fieldDescriptors){
                        if(me.value.fieldDescriptors && me.value.fieldDescriptors.length > 0 ){
                            fieldDescriptorsName = ''
                            me.value.fieldDescriptors.forEach(function (fieldItem) {
                                if(!fieldItem.isKey && !fieldItem.isVO && (fieldItem.className == 'String' || fieldItem.className == 'Long' || fieldItem.className == 'Integer' || fieldItem.className == 'Double' || fieldItem.className == 'BigDecimal')){
                                    switch(fieldItem.className){
                                        case "String":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="value" ` )
                                            break;
                                        case "Long":
                                        case "Integer":
                                        case "Float":
                                        case "BigDecimal":
                                        case "Double":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}=0 ` )
                                            break;
                                        case "Boolean":
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}=true ` )
                                            break;
                                        default:
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="value" ` )
                                            break;
                                    }
                                }else if(!fieldItem.isKey && (fieldItem.className != 'String' || fieldItem.className != 'Long' || fieldItem.className != 'Integer' || fieldItem.className != 'Double' || fieldItem.className != 'BigDecimal')){
                                    Object.values((me.relatedAggregate.aggregateRoot.entities.relations) || {})
                                    .filter(relation =>  relation.targetElement.namePascalCase === fieldItem.className)
                                    .forEach((field) => {
                                        var target = field.targetElement;
                                        var tempField = '';
                                        if(target.isVO){
                                            var field = target.fieldDescriptors
                                            field.forEach(item => {
                                                switch(item.className) {
                                                    case "String":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"value"`, ", ");
                                                        break;
                                                    case "Long":
                                                    case "Integer":
                                                    case "Float":
                                                    case "BigDecimal":
                                                    case "Double":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"0"`, ", ");
                                                        break;
                                                    case "Boolean":
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"true"`, ", ");
                                                        break;
                                                    default:
                                                        tempField = tempField.concat(`"${item.nameCamelCase}":"value"`, ", ");
                                                        break;
                                                }
                                            });
                                            tempField = tempField.slice(0, -2);
                                            fieldDescriptorsName = fieldDescriptorsName.concat(`${target.nameCamelCase}:='{${tempField}}' `);

                                        }else{
                                            if(target._type.endsWith("enum")){
                                                fieldDescriptorsName = fieldDescriptorsName.concat(`${fieldItem.name}="${target.items[0].value}" ` )
                                            }
                                        }
                                    });
                                }
                            })
                        }
                    }

                    if(me.isOpenAPIPBC){
                        if(me.value.controllerInfo.method == 'POST'){
                            me.commandExample = `http POST localhost:8080${me.value.controllerInfo.apiPath} ${fieldDescriptorsName}`
                        }else{
                            me.commandExample = `http PUT localhost:8080${me.value.controllerInfo.apiPath} ${fieldDescriptorsName}`
                        }
                    } else {
                        // Controller -> Extend Verb
                        if(me.value.controllerInfo.method == 'POST'){
                            me.commandExample = `http POST localhost:8080/${pluralize(changeCase.camelCase(me.relatedAggregateName))}${me.value.controllerInfo.apiPath} ${fieldDescriptorsName}`
                        }else if(me.value.controllerInfo.method == 'PUT'){
                            me.commandExample = `http PUT localhost:8080/${pluralize(changeCase.camelCase(me.relatedAggregateName))}/1/${me.value.controllerInfo.apiPath} ${fieldDescriptorsName}`
                        }else if(me.value.controllerInfo.method == 'DELETE'){
                            me.commandExample = `http DELETE localhost:8080/${pluralize(changeCase.camelCase(me.relatedAggregateName))}/1/${me.value.controllerInfo.apiPath} ${fieldDescriptorsName}`
                        }
                        me.setApiPath()
                    }
                }

            },
            copyRestRepositoryMethod(){
                const t = document.createElement("textarea");
                document.body.appendChild(t);
                t.value = this.commandExample
                t.select();
                document.execCommand('copy');
                document.body.removeChild(t);

                this.$EventBus.$emit('snackbar', {show :true, text : 'Copied to clipboard!', timeout: 1000 ,bottom: true })
            },
            syncFromAggregate() {
                var me = this
                var aggregateField = null
                var entityTypeList =  ['Integer', 'String', 'Boolean', 'Float', 'Double', 'Long', 'Date']

                if (me.isEmptyObject(me.relatedAggregate)) {
                    alert("Attach 'Associated aggregate'. ")
                } else {
                    var aggLists = me.canvas.attachedLists().aggregateLists;

                    if( Object.keys(aggLists).length > 0 ){
                        var eventFields = JSON.parse(JSON.stringify(me.value.fieldDescriptors));
                        aggregateField = aggLists[me.relatedAggregate.elementView.id] ? aggLists[me.relatedAggregate.elementView.id].aggregateRoot.fieldDescriptors : null;

                        if (aggregateField) {
                            aggregateField.forEach(function (aggField) {

                                let eventKey = -1
                                if(aggField.isKey){
                                    eventKey = eventFields.findIndex(eventField => eventField.isKey)
                                }else{
                                    eventKey = eventFields.findIndex(eventField => !eventField.isKey && eventField.name == aggField.name && eventField.className == aggField.className)
                                }

                                if (eventKey == -1) {
                                    me.value.fieldDescriptors.push(aggField)
                                } else {
                                    me.value.fieldDescriptors[eventKey] = aggField
                                }
                                me.value.fieldDescriptors.__ob__.dep.notify();
                            })
                        }
                    }
                }
            },
        }
    }
</script>

<style>
.cm-attribute .layout {
    margin-top: 16px !important;
    margin-left: -2px !important;
}
</style>
