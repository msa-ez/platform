<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >
        <!-- <template v-if="AggregateRulePanelStatus" slot="root">
            <aggregate-rules-panel :copy-value="value"  :givenItems="givenItems" :attachedPolicies="attachedPolicies" @close="closePanel" @left="left"></aggregate-rules-panel>
        </template> -->

        <template slot="t-description-text">
            비즈니스 로직 처리의 도메인 객체 덩어리 (서로 연결된 하나 이상의 엔터티 및 value objects의 집합체)
        </template>

        <template slot="t-generation-text">
            Aggregate becomes the main body of software implementation - Domain Classes.
        </template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly && !value.mirrorElement"
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
                    <v-row>
                        <div style="margin-left: 10px;"> {{newEditUserImg[0].name}} is now editing...</div>
                        <div style="font-size: 12px; margin-right: 10px;"> ( Click to force editing ) </div>
                    </v-row>
                </v-chip>
            </div>
        </template>



        <!-- <template slot="md-title-side">
            <v-btn
                    text
                    color="primary"
                    style="margin-left: 10px; margin-top: -12px;"
                    @click="changeAggregateRulePanelStatus()"
                    :disabled="isReadOnly"
            >Rules</v-btn>
        </template> -->

        <template slot="generateWithAi">
            <div><span>
                <div>
                    <v-btn v-if="generateDone" :disabled="!value.boundedContext.id || !value.description" class="auto-modeling-btn" color="primary" @click="generate()"><v-icon>mdi-auto-fix</v-icon>(RE)Generate Inside</v-btn>
                    <v-btn v-if="!generateDone" class="auto-modeling-btn" color="primary" @click="stop()"><v-icon>mdi-auto-fix</v-icon>Stop Generation</v-btn>
                    <!-- <v-btn v-if="!value.description" :disabled="true" class="auto-modeling-btn" text><v-icon>mdi-auto-fix</v-icon>(RE)Generate Inside</v-btn> -->
                </div>
            </span></div>
        </template>

        <template slot="element">
            <div>
                <v-card flat>
                    <v-card-text>
                        <event-storming-attribute
                                v-model="value.aggregateRoot.fieldDescriptors"
                                :isReadOnly="isReadOnly"
                                :type="value._type"
                                :elementId="value.elementView.id"
                                :entities="value.aggregateRoot.entities"
                                :duplicatedFieldList="duplicatedFieldList"
                                @open-umlclass="openClassDiagram"
                        ></event-storming-attribute>
                    </v-card-text>
                </v-card>

                <div v-if="value.uiStyle">
                    <v-text-field label="icon" v-model="value.uiStyle.icon"></v-text-field>
                </div>
            </div>
        </template>

    </common-panel>

</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import AggregateRulesPanel from "../panels/AggregateDefinitionRulesPanel";
    import isAttached from "../../../../utils/isAttached";

    // Translate
    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [EventStormingModelPanel],
        name: 'aggregate-panel',
        props: {
            generator: Object,
            duplicatedFieldList: Array,
        },
        components: {
            AggregateRulesPanel,
            CommonPanel
        },
        computed: {

        },
        created: function () { },
        data() {
            return {
                // AggregateRulePanelStatus: false,
                // attachedPolicies : {},
                givenItems:[],
                ruleValues: {
                    ruleName: null,
                    whenItems: [],
                    thenItems: [],
                    givenValue: null,
                    whenValue: null,
                    thenValue: null,
                    show: false,
                    editMode: false,
                    attributes: []
                },
                // UML Class
                aggregateRoots: [],
                state:{
                    generator: "AggregateGenerator",
                    firstMessageIsTyping: true,
                    secondMessageIsTyping: true,
                    userStory: '',
                    communicationStyle: 'Choreography', // 'Orchestration'
                    aggregateDetail: false,
                    uiStyle: this.uiStyle
                },
                generateDone: {
                    type: Boolean,
                    required: true
                },
            }
        },
        computed: {
            // input(){
            //     let parent = this.$parent;
            //     while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;

            //     let model = Object.assign([], parent.value)
            //     let boundedContext = null
            //     if(this.value && this.value.boundedContext){
            //         boundedContext = model.elements[this.value.boundedContext.id]
            //     }

            //     return{ 
            //         description: this.value.description,
            //         aggregate: this.value,
            //         boundedContext: boundedContext,
            //     }
            // },
        },
        mounted() {
        },
        watch: {},
        methods: {
            panelInit(){
                var me = this
                // Element
                me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#aggregate-sticker'
                me.setRootMethods();

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            setEntityTypeList() {
                var me = this
                if (me.value.aggregateRoot.entities == undefined) {
                    return false
                }

                me.entityTypeList = [
                    {text: 'Primitive Types', disabled: true},
                    {text: 'Integer', value: 'Integer'},
                    {text: 'String', value: 'String'},
                    {text: 'Boolean', value: 'Boolean'},
                    {text: 'Float', value: 'Float'},
                    {text: 'Double', value: 'Double'},
                    {text: 'Long', value: 'Long'},
                    {text: 'Date', value: 'Date'},
                ]

                if (Object.values(me.value.aggregateRoot.entities.elements).length > 1) {
                    me.entityTypeList.push({text: 'Complex Types', disabled: true})
                    Object.values(me.value.aggregateRoot.entities.elements).forEach(function (item) {
                        if (item) {
                            if (item.name != me.value.name) {
                                me.entityTypeList.push({text: item.name, value: item.name})
                            }
                        }
                    })
                }
            },
            // left(){
            //     var me = this
            //     me.AggregateRulePanelStatus = !me.AggregateRulePanelStatus
            // },
            // changeAggregateRulePanelStatus() {
            //     var me = this
            //     var attachedPolicies = {} // agg에 붙어있는 폴리시들
            //     if (me.canvas.attachedLists.policyLists && Object.values(me.canvas.attachedLists.policyLists).length > 0) {
            //         Object.values(me.canvas.attachedLists.policyLists).forEach(function (policy, idx) {

            //             if (isAttached(policy, me.value)) {
            //                 attachedPolicies[policy.id] = policy;
            //             }
            //         })
            //     }

            //     me.givenItems = []
            //     me.givenItems.push(this._value)
            //     me.attachedPolicies = attachedPolicies

            //     me.AggregateRulePanelStatus = !me.AggregateRulePanelStatus

            // },
            openClassDiagram() {
                var me = this
                if (me.value.aggregateRoot.entities == undefined) {
                    me.value.aggregateRoot['entities'] = {'elements': {}, 'relations': {}}
                }
                me.setRootMethods();

                var umlValue = {
                    type: 'Domain Class Modeling',
                    aggId: me.value.elementView.id,
                    aggList: [JSON.parse(JSON.stringify(me.value))]
                };
                me.canvas.overlayText = 'Loading';
                me.canvas.openEmbeddedCanvas(umlValue);
                me.closePanel();
            },
            setRootMethods() {
                var me = this;

                Object.values(me.canvas.value.elements).forEach((element) => {
                    if (me.canvas.validateElementFormat(element) && element._type.endsWith("Command")) {

                        if (isAttached(me.value, element)) {
                            if(!element.isRestRepository && element.name) {
                                var method = {
                                    "name": element.name,
                                    "class": me.value.name,
                                    "returnType": "void",
                                    "parameters": [],
                                    "label": '+ ' + element.name + "(): void",
                                    "isOverride": false,
                                    "isRootMethod": false,
                                }
                                if(me.value.aggregateRoot.operations.length > 0) {
                                    me.value.aggregateRoot.operations.forEach(function(item, idx) {
                                        if(item.name == method.name) {
                                            item.isRootMethod = true
                                            method.isRootMethod = true
                                        }
                                    })
                                    if(!method.isRootMethod) {
                                        method.isRootMethod = true
                                        me.value.aggregateRoot.operations.push(method)
                                    }
                                } else {
                                    me.value.aggregateRoot.operations.push(method)
                                }
                            }
                        }
                    }
                })
                // me.copyValue = me.value;
            },
            selectKey(item) {
                var me = this

                me.value.aggregateRoot.fieldDescriptors.forEach(function (ele, idx) {
                    if (idx == me.value.aggregateRoot.fieldDescriptors.indexOf(item)) {
                        ele.isKey = item.isKey
                    } else {
                        ele.isKey = false
                    }
                })

            },

            async changedNamePanel(newVal){
                var me = this
                me.value.name = newVal.replace(/\n/g, "").replace(/ /gi, "")
                me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = me.value.name

                var translateObj = await me.getTranslate(me.value.name);
                me.usedTranslate = translateObj.usedTranslate
                me.translateText = translateObj.translateText
            },
            getTranslate(newVal){
                try{
                    return new Promise(async function (resolve) {
                        googleTranslate.detectLanguage(newVal, function (err, detection) {
                            if(detection){
                                if (detection.language != 'en') {
                                    googleTranslate.translate(newVal, 'en', function (err, translation) {
                                        var obj={
                                            'usedTranslate' : true,
                                            'translateText' : changeCase.pascalCase(translation.translatedText)
                                        }
                                        resolve(obj)
                                    });
                                } else if (detection.language == 'en') {
                                    var obj={
                                        'usedTranslate' : true,
                                        'translateText' : changeCase.pascalCase(newVal)
                                    }
                                    resolve(obj)
                                }
                            }
                        });
                    })
                }catch (e) {
                    return undefined;
                }
            },
            onReceived(content){
                // this.value.description = content;
            },

            onModelCreated(model){
                this.$EventBus.$emit('createAggregate', model, this.value);
            },

            async onGenerationFinished(model){
                this.$emit('update:generateDone', true);
                this.$EventBus.$emit('generationFinished');
            },

            generate(){
                this.executeBeforeDestroy();
                this.closePanel();

                this.generator.generate();
                this.state.startTemplateGenerate = true;
                this.$emit('update:generateDone', false);
                this.generateDone = false;
            },

            stop(){
                this.generator.stop()
                this.generateDone = true
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
        }
    }
</script>
