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

        <template slot="t-title-name">ReadModel</template>

        <template slot="md-level-btn">
            <v-chip @click="toggleDesignLevel" style="margin-right: 16px; cursor: pointer;" color="primary" outlined>
                <v-icon left>{{ isDesignLevelVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                {{ $t('CommandDefinitionPanel.implementationSettings') }}
            </v-chip>
        </template>

        <template slot="t-description-text">
            {{ $t('panelInfo.ViewDefinitionPanel') }}
        </template>

        <template slot="t-generation-text">
            Read Models become the implementation for data projection.
        </template>

        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
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

        <template slot="generateWithAi">
            <div><span>
                <div>
                    <v-btn v-if="value.description && generateDone" class="auto-modeling-btn" color="primary" @click="generate()"><v-icon>mdi-auto-fix</v-icon>(RE)Generate Inside</v-btn>
                    <v-btn v-if="value.description && !generateDone" class="auto-modeling-btn" color="primary" @click="stop()"><v-icon>mdi-auto-fix</v-icon>Stop Generation</v-btn>
                </div>
            </span></div>
        </template>

        <template slot="md-title-side">
            <v-btn
                color="primary"
                :disabled="isReadOnly || !exampleAvailable || value.dataProjection != 'query-for-aggregate'"
                @click="openExampleDialog()"
            >Examples</v-btn>
            <v-tooltip bottom v-if="!exampleAvailable">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on"
                    >
                        <v-icon color="grey lighten-1">mdi-help-circle</v-icon>
                    </v-btn>
                </template>
                <span>
                    The following steps are required to use the 'EXAMPLES'.<br>
                    1. There must be a ReadModel Sticker in another bound Context that forms a sync call relationship with the command. <br>
                    e.g.<br>
                    <img width="794" alt="image" src="https://github.com/user-attachments/assets/b8a91e73-c806-4ad2-b668-1b1e04e1c3e9">
                </span>
            </v-tooltip>
        </template>

        <template slot="element">
            <div v-show="isDesignLevelVisible" class="pa-4 pt-0">
                <RuleExampleDialog v-if="openExample" v-model="value" @closeExampleDialog="closeExampleDialog()" />
                <v-card flat>
                    <v-card-text class="pa-0">
                        <v-radio-group class="ma-0 pa-0 delete-raido-detail"
                            :disabled="isReadOnly"
                            v-model="value.dataProjection" row
                        >
                            <v-radio :disabled="isOnlyCQRS" label="CQRS" value="cqrs"></v-radio>
                            <v-radio label="Query For Aggregate" value="query-for-aggregate"></v-radio>
                            <v-radio label="Query For Multiple Aggregate" value="query-for-multiple-aggregate"></v-radio>
                            <v-radio disabled label="GraphQL" value="graphql"></v-radio>
                        </v-radio-group>

                        <detail-component v-if="value.dataProjection == 'cqrs'"
                            :title="$t('ViewDefinitionPanel.CQRSDetailTitle')"
                            :details="CQRSDetails"
                        />

                        <detail-component v-if="value.dataProjection == 'query-for-aggregate'"
                            :title="$t('ViewDefinitionPanel.QueryForAggregateDetailTitle')"
                            :details="QueryForAggregateDetails"
                        />
                        <!-- <v-alert
                            color="grey darken-1"
                            text
                            type="info"
                            class="pa-2 alert-text"
                            v-if="titleName != 'External' && titleName != 'Issue' && titleName != 'UI' "
                        >
                        ReadModel의 사용 목적을 설정하세요 <br>
                        </v-alert> -->

                        <div class="mt-4" v-if="value.dataProjection == 'query-for-aggregate'">
                            <div>
                                <span class="panel-title">{{ $t('TitleText.associatedAggregate') }}</span>
                                <v-text-field
                                        v-model="relatedAggregateName"
                                        label="Position the sticker adjacent to the Aggregate sticker"
                                        single-line
                                        disabled
                                ></v-text-field>

                                <v-radio-group class="delete-raido-detail" v-model="value.queryOption.useDefaultUri" :disabled="isReadOnly" row>
                                    <v-radio label="Default GET URI" :value="true"></v-radio>
                                    <v-radio label="Extended GET URI" :value="false"></v-radio>
                                </v-radio-group>

                                <v-row style="align-items: center" v-if="!value.queryOption.useDefaultUri">
                                    <v-text-field
                                            v-model="value.queryOption.apiPath"
                                            :disabled="isReadOnly"
                                            label="Get Path"
                                    ></v-text-field>
                                </v-row>

                                <v-radio-group class="delete-raido-detail" v-model="value.queryOption.multipleResult" :disabled="isReadOnly" row>
                                    <v-radio label="Single Result" :value="false"></v-radio>
                                    <v-radio label="Multiple Result" :value="true"></v-radio>
                                </v-radio-group>
                            </div>

                            <v-card flat>
                                <v-card-text class="pa-0 pt-4">
                                    <event-storming-attribute
                                            label="Query Parameters"
                                            v-model="value.queryParameters"
                                            :isReadOnly="isReadOnly"
                                            :type="value._type"
                                            :dataProjection="value.dataProjection"
                                            :elementId="value.elementView.id"
                                            @sync-attribute="syncFromAggregate"
                                            :entities="relatedAggregate ? relatedAggregate.aggregateRoot.entities : null"
                                            :fields="relatedAggregate ? relatedAggregate.aggregateRoot.fieldDescriptors : null"
                                    ></event-storming-attribute>
                                </v-card-text>
                            </v-card>
                        </div>

                        <div class="mt-4" v-if="value.dataProjection == 'query-for-multiple-aggregate'">
                            <v-card flat>
                                <v-card-text class="pa-0 pt-4">
                                    <event-storming-attribute
                                            label="Query Parameters"
                                            v-model="value.queryParameters"
                                            :isReadOnly="isReadOnly"
                                            :type="value._type"
                                            :dataProjection="value.dataProjection"
                                            :elementId="value.elementView.id"
                                            @sync-attribute="syncFromAggregate('queryParameters')"
                                            :entities="relatedAggregate ? relatedAggregate.aggregateRoot.entities : null"
                                            :fields="relatedAggregate ? relatedAggregate.aggregateRoot.fieldDescriptors : null"
                                    ></event-storming-attribute>
                                </v-card-text>

                                <v-card-text class="pa-0">
                                    <event-storming-attribute
                                            label="Read Model Attributes"
                                            v-model="value.fieldDescriptors"
                                            :isReadOnly="isReadOnly"
                                            :type="value._type"
                                            :dataProjection="value.dataProjection"
                                            :elementId="value.elementView.id"
                                            @sync-attribute="syncFromAggregate('fieldDescriptors')"
                                            :entities="relatedAggregate ? relatedAggregate.aggregateRoot.entities : null"
                                            :fields="relatedAggregate ? relatedAggregate.aggregateRoot.fieldDescriptors : null"
                                    ></event-storming-attribute>
                                </v-card-text>
                            </v-card>
                        </div>

                        <div class="mt-4" v-if="value.dataProjection == 'cqrs'">
                            <v-card flat>
                                <v-card-text class="pa-0">
                                    <event-storming-attribute
                                            label="Read Model Attributes"
                                            v-model="value.fieldDescriptors"
                                            :isReadOnly="isReadOnly"
                                            :type="value._type"
                                            :elementId="value.elementView.id"
                                            @sync-attribute="syncFromAggregate"
                                    ></event-storming-attribute>
                                </v-card-text>
                            </v-card>

                            <v-col class="pa-0" v-for="(item,key) in value.createRules">
                                <ViewCreate
                                        v-model="value"
                                        :createItem="item"
                                        :index="key"
                                        :isRead="isReadOnly"
                                ></ViewCreate>
                            </v-col>
                            <v-row class="ma-0 pa-0">
                                <v-btn
                                    class="cqrs-add-btn"
                                    outlined
                                    :disabled="isReadOnly"
                                    @click="viewMainRowAdd('create')"
                                    block
                                >
                                    <v-icon left>mdi-plus</v-icon>
                                    Add "CREATE" Card
                                </v-btn>
                            </v-row>

                            <v-col class="pa-0" v-for="(item,key) in value.updateRules">
                                <ViewUpdate
                                        v-model="value"
                                        :updateItem="item"
                                        :index="key"
                                        :isRead="isReadOnly"
                                >
                                </ViewUpdate>
                            </v-col>
                            <v-row class="ma-0 pa-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                    class="cqrs-add-btn"
                                    outlined
                                    :disabled="isReadOnly"
                                    @click="viewMainRowAdd('update')"
                                    block
                                >
                                    <v-icon left>mdi-plus</v-icon>
                                    Add "UPDATE" Card
                                </v-btn>
                            </v-row>

                            <v-col class="pa-0" v-for="(item,key) in value.deleteRules">
                                <ViewDelete
                                        v-model="value"
                                        :deleteItem="item"
                                        :index="key"
                                        :isRead="isReadOnly"
                                ></ViewDelete>
                            </v-col>
                            <v-row class="ma-0 pa-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                    class="cqrs-add-btn"
                                    outlined
                                    :disabled="isReadOnly"
                                    @click="viewMainRowAdd('delete')"
                                    block
                                >
                                    <v-icon left>mdi-plus</v-icon>
                                    Add "DELETE" Card
                                </v-btn>
                            </v-row>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        </template>
    </common-panel>

</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import ViewCreate from "../../view-modeling/ViewCreate";
    import ViewUpdate from "../../view-modeling/ViewUpdate";
    import ViewDelete from "../../view-modeling/ViewDelete";
    import RuleExampleDialog from "../RuleExampleDialog"

    export default {
        mixins: [EventStormingModelPanel],
        name: 'view-panel',
        props: {
            generator: Object,
            generateDone: {
                type: Boolean,
                required: true
            },
            isPBCModel: Boolean,
        },
        components: {
            CommonPanel,
            ViewCreate,
            ViewUpdate,
            ViewDelete,
            RuleExampleDialog
        },
        data() {
            return {
                relatedAggregate: null,
                state:{
                    generator: "CQRSGenerator",
                    userStory: '',
                },
                // generateDone: true,
                exampleAvailable: false,
                CQRSDetails: [
                    {
                        title : "ViewDefinitionPanel.CQRSDetailSubTitle1",  
                    },
                    {
                        title : "ViewDefinitionPanel.CQRSDetailSubTitle2",
                    },
                    {
                        title : "ViewDefinitionPanel.CQRSDetailSubTitle3",
                    }
                ],
                QueryForAggregateDetails: [
                    {
                        title : "ViewDefinitionPanel.QueryForAggregateDetailSubTitle1",
                    },
                    {
                        title : "ViewDefinitionPanel.QueryForAggregateDetailSubTitle2",
                    },
                    {
                        title : "ViewDefinitionPanel.QueryForAggregateDetailSubTitle3",
                    },
                    {
                        title : "ViewDefinitionPanel.QueryForAggregateDetailSubTitle4",
                    }
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
            isOnlyCQRS() {
                try {
                    var me = this
                    if (me.canvas.value && me.canvas.value.relations) {
                        var index = Object.values(me.canvas.value.relations).findIndex(relation => relation && relation._type.endsWith('Relation') && relation.from == me.value.elementView.id)
                        if (index == -1) {
                            return false
                        } else {
                            return true
                        }
                    }
                    return false
                } catch (e) {
                    return false
                }
            },
            // input(){
            //     let parent = this.$parent;
            //     while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;

            //     let model = Object.assign([], parent.value)

            //     return{
            //         description: this.value.description,
            //         value: this.value,
            //         model: model,
            //     }
            // },

        },
        created: function () { 
            this.exampleAvailable = this.validateRuleExample()
        },
        mounted(){
            var me = this;
            me.$EventBus.$on("onModelCreated", function (model) {
                me.onModelCreated(model);
            });
        },
        methods: {
            syncFromAggregate(type) {
                var me = this
                var aggregateField = null
                var entityTypeList =  ['Integer', 'String', 'Boolean', 'Float', 'Double', 'Long', 'Date']

                if (me.isEmptyObject(me.relatedAggregate)) {
                    alert("Attach 'Associated aggregate'. ")
                } else {
                    var aggLists = me.canvas.attachedLists().aggregateLists;

                    if( Object.keys(aggLists).length > 0 ){
                        var eventFields = JSON.parse(JSON.stringify(me.value.queryParameters));
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
                                    if(type === 'queryParameters'){
                                        me.value.queryParameters.push(aggField)
                                    }else{
                                        me.value.fieldDescriptors.push(aggField)
                                    }
                                } else {
                                    if(type === 'queryParameters'){
                                        me.value.queryParameters[eventKey] = aggField
                                    }else{
                                        me.value.fieldDescriptors[eventKey] = aggField
                                    }
                                }
                                me.value.queryParameters.__ob__.dep.notify();
                            })
                        }
                    }
                }
            },
            panelInit(){
                var me = this
                // Element
                // me.relatedAggregate = me.canvas.getAttachedAggregate(me.value)
                me.relatedAggregate = me.isPBCModel ? me.value.aggregate : me.canvas.getAttachedAggregate(me.value)

                // Common
                this.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#%EB%A9%94%EB%89%B4%EB%B3%84-%EC%83%81%EC%84%B8'
                me.$super(EventStormingModelPanel).panelInit()// }
            },
            viewMainRowAdd(type) {
                var me = this

                if (me.value.dataProjection == 'cqrs') {

                    if (type == 'create') {

                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'CREATE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null, 'operator': '='}],
                            where: [{"viewField": null, "eventField": null}],
                        }

                        me.value.createRules.push(obj)
                    } else if (type == 'update') {
                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'UPDATE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null, 'operator': '='}],
                            where: [{"viewField": null, "eventField": null}],
                        }
                        me.value.updateRules.push(obj)
                    } else if (type == 'delete') {
                        var obj = {
                            _type: 'viewStoreRule',
                            operation: 'DELETE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null}],
                            where: [{"viewField": null, "eventField": null}],
                        }
                        me.value.deleteRules.push(obj)
                    }

                } else if (me.value.dataProjection == 'uimashup') {
                    // var ob = {
                    //     isKey: false,
                    //     name: '',
                    //     className: '',
                    //     sourceRepository: '',
                    //     repositoryDirectValue: '',
                    //     hateoas: '',
                    //     link: ''
                    // }
                    // me.value.viewFieldDescriptors.push(ob);
                }
            },
            onReceived(content){
                // this.value.description = content;
            },
            onModelCreated(model){
                var me = this
                if(model){
                    me.value = model;
                }
            },
            async onGenerationFinished(model){
                this.$emit('update:generateDone', true);
                this.$EventBus.$emit('generationFinished');
            },
            generate(){
                this.executeBeforeDestroy();

                this.generator.generate();
                this.state.startTemplateGenerate = true;
                this.$emit('update:generateDone', false);
                this.generateDone = false;
            },
            stop(){
                this.generator.stop();
                this.generateDone = true
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .cqrs-add-btn {
        color: #757575;
        width: 100%;
        margin: 4px 0px 16px 0px;
    }
</style>