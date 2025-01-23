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

        <template slot="md-level-btn">
            <v-chip @click="toggleDesignLevel" style="margin-right: 16px; cursor: pointer;" color="primary" outlined>
                <v-icon left>{{ isDesignLevelVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                {{ $t('CommandDefinitionPanel.implementationSettings') }}
            </v-chip>
        </template>

        <template slot="t-description-text">
            {{ $t('panelInfo.DomainEventDefinitionPanel') }}
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
                    <v-row class="ma-0 pa-0">
                        <div>{{newEditUserImg[0].name}} is editing...</div>
                        <div style="font-size: 12px;">( Click to edit )</div>
                    </v-row>
                </v-chip>
            </div>
        </template>

        <template slot="element">
            <div v-show="isDesignLevelVisible">
                <v-card flat>
                    <v-card-text>
                        <event-storming-attribute
                                v-model="value.fieldDescriptors"
                                :isReadOnly="isReadOnly"
                                :type="value._type"
                                :elementId="value.elementView.id"
                                @sync-attribute="syncFromAggregate"
                                :useMonitoring="useMonitoring"
                        ></event-storming-attribute>
                    </v-card-text>
                </v-card>

                <div class="pa-4">
                    <v-card-text class="pa-0 ma-0 panel-title">{{ $t('DomainEventDefinitionPanel.triggerByLifeCycle') }}</v-card-text>
                    <detail-component
                        :title="$t('DomainEventDefinitionPanel.triggerByLifeCycleDetailTitle')"
                        :details="triggerByLifeCycleDetailSubTitle"
                    />
                    <v-radio-group v-model="value.trigger" style="width: 290px;" :disabled="isReadOnly" class="mt-1">
                        <v-row dense class="pa-0 ma-0">
                            <v-col dense class="pa-0">
                                <v-radio label="Pre Persist" value="@PrePersist" v-if="lifeCycleCommand.includes('POST')" style="width: 110px" ></v-radio>
                                <v-radio label="Pre Update" value="@PreUpdate" v-if="lifeCycleCommand.includes('PATCH')"></v-radio>
                                <v-radio label="Pre Update" value="@PreUpdate" v-if="lifeCycleCommand.includes('PUT')"></v-radio>
                                <v-radio label="Pre Remove" value="@PreRemove" v-if="lifeCycleCommand.includes('DELETE')"></v-radio>
                            </v-col>
                            <v-col dense class="pa-0">
                                <v-radio label="Post Persist" value="@PostPersist" v-if="lifeCycleCommand.includes('POST')"></v-radio>
                                <v-radio label="Post Update" value="@PostUpdate" v-if="lifeCycleCommand.includes('PATCH')"></v-radio>
                                <v-radio label="Post Update" value="@PostUpdate" v-if="lifeCycleCommand.includes('PUT')"></v-radio>
                                <v-radio label="Post Remove" value="@PostRemove" v-if="lifeCycleCommand.includes('DELETE')" style="width: 130px" ></v-radio>
                            </v-col>
                        </v-row>
                    </v-radio-group>
                </div>

                <div class="pa-4">
                    <v-card-text class="panel-title pa-0 ma-0">{{ $t('DomainEventDefinitionPanel.triggerByCommand') }}</v-card-text>
                    <detail-component
                        :title="$t('DomainEventDefinitionPanel.triggerByCommandDetailTitle')"
                        :details="triggerByCommandDetailSubTitle"
                    />
                    <v-row v-if="commandLists && commandLists.length" class="pa-0 ma-0" style="font-size:16px;">
                        <v-col cols="4" 
                            v-for="(command,idx) in commandLists" 
                            v-bind:key="idx"
                            class="pl-0"
                        >● {{command.name}}</v-col>
                    </v-row>
                </div>

                <div class="pa-4">
                    <v-card-text class="panel-title pa-0 ma-0">{{ $t('DomainEventDefinitionPanel.triggerByPolicy') }}</v-card-text>
                    <detail-component
                        :title="$t('DomainEventDefinitionPanel.triggerByPolicyDetailTitle')"
                        :details="triggerByPolicyDetailSubTitle"
                    />
                    <v-row v-if="policyLists && policyLists.length" class="pa-0 ma-0" style="font-size:16px;">
                        <v-col cols="4" 
                            v-for="(policy,idx) in policyLists" 
                            v-bind:key="idx"
                            class="pl-0"
                        >● {{policy.name}}</v-col>
                    </v-row>
                </div>

                <div class="pa-4">
                    <v-card-text class="panel-title pa-0 ma-0">{{ $t('TitleText.associatedAggregate') }}</v-card-text>
                    <detail-component
                        :title="$t('DomainEventDefinitionPanel.associatedAggregateTitle')"
                        :details="associatedAggregateTitle"
                    />
                    <v-text-field
                        v-model="relatedAggregateName"
                        label="Attach Aggregate && check Name"
                        single-line
                        disabled
                    ></v-text-field>
                </div>
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
            useMonitoring: {
                type: Boolean,
                default: false
            }
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
                triggerByLifeCycleDetailSubTitle: [
                    {
                        title: "DomainEventDefinitionPanel.triggerByLifeCycleDetailSubTitle1"
                    },
                    {
                        title: "DomainEventDefinitionPanel.triggerByLifeCycleDetailSubTitle2"
                    },
                    {
                        title: "DomainEventDefinitionPanel.triggerByLifeCycleDetailSubTitle3"
                    },
                    {
                        title: "DomainEventDefinitionPanel.triggerByLifeCycleDetailSubTitle5"
                    },
                    {
                        title: "DomainEventDefinitionPanel.triggerByLifeCycleDetailSubTitle6"
                    }
                ],
                triggerByCommandDetailSubTitle: [
                    {
                        title: "DomainEventDefinitionPanel.triggerByCommandDetailSubTitle1",
                        image: "triggerByCommandDetailSubTitle1.png"
                    }
                ],
                triggerByPolicyDetailSubTitle: [
                    {
                        title: "DomainEventDefinitionPanel.triggerByPolicyDetailSubTitle1",
                        image: "triggerByPolicyDetailSubTitle1.png"
                    }
                ],
                associatedAggregateTitle: [
                    {
                        title: "DomainEventDefinitionPanel.associatedAggregateSubTitle1",
                        image: "associatedAggregateSubTitle1.png"
                    },
                ]
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
                if (me.isForeign) {
                    me.relatedUrl = 'https://intro.msaez.io/tool/event-storming-tool/#event-sticker'
                } else {
                    me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#event-sticker'
                }

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

