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

        <template slot="t-description-text">
            도메인 전문가가 정의함. 이벤트 퍼블리싱
        </template>

        <template slot="t-generation-text">
            Event becomes a domain event class containing the properties of the event that must be dispatched, and finally serialized into JSON format so that it can be posted to an event store such as Kafka.
        </template>

        <template slot="t-edit-user">
            <div
                    v-if=" newEditUserImg.length > 0 && isReadOnly && !value.mirrorElement"
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

        <template slot="element">

            <div>
                <v-card flat>
                    <v-card-text>
                        <event-storming-attribute
                                v-model="value.fieldDescriptors"
                                :isReadOnly="isReadOnly"
                                :type="value._type"
                                :elementId="value.elementView.id"
                                @sync-attribute="syncFromAggregate"
                        ></event-storming-attribute>
                    </v-card-text>
                </v-card>

                <v-card flat>
                    <v-card-text class="panel-title">Trigger By LifeCycle</v-card-text>
                    <v-card-text>
                        <v-radio-group v-model="value.trigger" style="width: 290px;" :disabled="isReadOnly">
                            <v-row dense>
                                <v-col dense>
                                    <v-radio label="Pre Persist" value="@PrePersist" v-if="lifeCycleCommand.includes('POST')" style="width: 110px" ></v-radio>
                                    <v-radio label="Pre Update" value="@PreUpdate" v-if="lifeCycleCommand.includes('PATCH')"></v-radio>
                                    <v-radio label="Pre Update" value="@PreUpdate" v-if="lifeCycleCommand.includes('PUT')"></v-radio>
                                    <v-radio label="Pre Remove" value="@PreRemove" v-if="lifeCycleCommand.includes('DELETE')"></v-radio>
                                </v-col>
                                <v-col dense>
                                    <v-radio label="Post Persist" value="@PostPersist" v-if="lifeCycleCommand.includes('POST')"></v-radio>
                                    <v-radio label="Post Update" value="@PostUpdate" v-if="lifeCycleCommand.includes('PATCH')"></v-radio>
                                    <v-radio label="Post Update" value="@PostUpdate" v-if="lifeCycleCommand.includes('PUT')"></v-radio>
                                    <v-radio label="Post Remove" value="@PostRemove" v-if="lifeCycleCommand.includes('DELETE')" style="width: 130px" ></v-radio>
                                </v-col>
                            </v-row>
                        </v-radio-group>
                    </v-card-text>
                </v-card>

                <v-card>
                    <v-card-text class="panel-title">Trigger By Command</v-card-text>
                    <v-card-text v-if="commandLists && commandLists.length">

                        <v-row style="font-size:16px; padding:20px 0 20px 0;">
                            <v-col cols="4" v-for="(command,idx) in commandLists" v-bind:key="idx">● {{command.name}}</v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-card>
                    <v-card-text class="panel-title">Trigger By Policy</v-card-text>
                    <v-card-text v-if="policyLists && policyLists.length">

                        <v-row style="font-size:16px; padding:20px 0 20px 0;">
                            <v-col cols="4" v-for="(policy,idx) in policyLists" v-bind:key="idx">● {{policy.name}}</v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-card>
                    <v-card-text class="panel-title">Associated Aggregate</v-card-text>
                    <v-card-text>
                        <v-text-field
                                v-model="relatedAggregateName"
                                label="Attach Aggregate && check Name"
                                single-line
                                disabled
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </div>
        </template>

    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";

    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [EventStormingModelPanel],
        name: 'event-panel',
        props: {
            test:Object,
            isPBCModel: Boolean,
        },
        components: {
            CommonPanel
        },
        data() {
            return {
                // Event
                commandLists: [],
                policyLists: [],
                lifeCycleCommand: "",
                relatedAggregate: null,
            }
        },
        created: function () { },
        beforeDestroy(){

        },
        computed:{
            relatedAggregateName(){
                if(this.relatedAggregate){
                    return this.relatedAggregate.name
                }
                return null;
            },
        },
        methods: {
            executeBeforeDestroy() {
                var me = this
                this.$EventBus.$emit('addAttribute')
                me.$super(EventStormingModelPanel).executeBeforeDestroy()
            },
            panelInit(){
                var me = this
                // Element
                // me.relatedAggregate = me.canvas.getAttachedAggregate(me.value)
                me.relatedAggregate = me.isPBCModel ? me.value.aggregate : me.canvas.getAttachedAggregate(me.value)
                me.findCommandLists()
                me.findPolicyLists()
                me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#event-sticker'

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            findCommandLists() {
                var me = this;
                me.commandLists = [];

                if (Object.values(me.canvas.value.relations).length > 0) {
                    Object.values(me.canvas.value.relations).forEach(function (rel, index) {
                        if (rel && rel._type.endsWith('Relation')) {
                            if (rel.sourceElement && rel.targetElement) {
                                if (rel.sourceElement._type.endsWith('Command') && rel.targetElement._type.endsWith('Event')) {
                                    if (me.value.elementView.id == rel.targetElement.elementView.id) {
                                        var coId = rel.sourceElement.elementView.id
                                        var coVal = me.canvas.attachedLists().commandLists[coId]

                                        if (coVal) {
                                            if (coVal.isRestRepository) {
                                                me.lifeCycleCommand = coVal.restRepositoryInfo.method

                                                // Lifecycle 초기 세팅
                                                if(coVal.restRepositoryInfo.method == 'DELETE' && me.value.trigger!='@PostRemove'){
                                                    me.value.trigger = '@PreRemove'
                                                } else if(coVal.restRepositoryInfo.method == 'PATCH' && me.value.trigger!='@PostUpdate'){
                                                    me.value.trigger = '@PreUpdate'
                                                } else if(coVal.restRepositoryInfo.method == 'PUT' && me.value.trigger!='@PreUpdate'){
                                                    me.value.trigger = '@PostUpdate'
                                                }

                                            } else {
                                                // me.checkTrigger = false
                                                me.commandLists.push(coVal)
                                                // me.copyValue.trigger = ""
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })
                }

                if (me.commandLists.length == 0 && me.lifeCycleCommand == '') {
                    me.lifeCycleCommand = "POST PATCH DELETE UPDATE"
                }
            },
            findPolicyLists() {
                var me = this;
                me.policyLists = [];

                if (Object.values(me.canvas.value.relations).length > 0) {
                    Object.values(me.canvas.value.relations).forEach(function (rel, index) {
                        if (rel && rel._type.endsWith('Relation')) {
                            if (rel.sourceElement && rel.targetElement) {
                                if (rel.sourceElement._type.endsWith('Policy') && rel.targetElement._type.endsWith('Event')) {
                                    if (me.value.elementView.id == rel.targetElement.elementView.id) {
                                        var coId = rel.sourceElement.elementView.id
                                        var coVal = me.canvas.attachedLists().policyLists[coId]

                                        if (coVal) {
                                            me.policyLists.push(coVal)

                                        }
                                    }
                                }
                            }
                        }
                    })
                }

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
            async changedNamePanel(newVal) {
                var me = this
                me.value.name = newVal.replace(/\n/g, "").replace(/ /gi, "")
                me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = me.value.name

                var translateObj = await me.getTranslate(me.value.name);
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
        }
    }
</script>
