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
                    text
                    color="primary"
                    style="margin-left: 10px; margin-top: -12px;"
                    :disabled="isReadOnly || !exampleAvailable || value.dataProjection != 'query-for-aggregate'"
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
                    The following steps are required to use the 'EXAMPLES'.<br>
                    1. There must be a ReadModel Sticker in another bound Context that forms a sync call relationship with the command. <br>
                    e.g.<br>
                    <img width="794" alt="image" src="https://github.com/user-attachments/assets/b8a91e73-c806-4ad2-b668-1b1e04e1c3e9">
                </span>
            </v-tooltip>
        </template>

        <template slot="element">
            <RuleExampleDialog v-if="openExample" v-model="value" @closeExampleDialog="closeExampleDialog()" />
            <v-card flat>
                <v-card-text>
                    <v-radio-group :disabled="isReadOnly"
                                   v-model="value.dataProjection" row>
                        <v-radio :disabled="isOnlyCQRS" label="CQRS" value="cqrs"></v-radio>
                        <v-radio label="Query For Aggregate" value="query-for-aggregate"></v-radio>
                        <v-radio label="Query For Multiple Aggregate" value="query-for-multiple-aggregate"></v-radio>
                        <v-radio disabled label="GraphQL" value="graphql"></v-radio>
                    </v-radio-group>
                    <!-- <v-alert
                        color="grey darken-1"
                        text
                        type="info"
                        class="pa-2 alert-text"
                        v-if="titleName != 'External' && titleName != 'Issue' && titleName != 'UI' "
                    >
                    ReadModel의 사용 목적을 설정하세요 <br>
                    </v-alert> -->

                    <div v-if="value.dataProjection == 'query-for-aggregate'">

                        <div style="margin-left:15px;">
                            <span class="panel-title">Associated Aggregate</span>
                            <v-text-field
                                    v-model="relatedAggregateName"
                                    label="Position the sticker adjacent to the Aggregate sticker"
                                    single-line
                                    disabled
                                    style="margin-top:-15px;"
                            ></v-text-field>



                            <v-radio-group v-model="value.queryOption.useDefaultUri" :disabled="isReadOnly" row>
                                <v-radio label="Default GET URI" :value="true"></v-radio>
                                <v-radio label="Extended GET URI" :value="false"></v-radio>
                            </v-radio-group>

                            <v-row style="align-items: center" v-if="!value.queryOption.useDefaultUri">
                                <v-text-field
                                        v-model="value.queryOption.apiPath"
                                        :disabled="isReadOnly"
                                        style="margin-left: 10px;"
                                        label="Get Path"
                                ></v-text-field>
                            </v-row>


                            <v-radio-group v-model="value.queryOption.multipleResult" :disabled="isReadOnly" row>
                                <v-radio label="Single Result" :value="false"></v-radio>
                                <v-radio label="Multiple Result" :value="true"></v-radio>
                            </v-radio-group>
                        </div>

                        <v-card flat>
                            <v-card-text>
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

                    <div v-if="value.dataProjection == 'query-for-multiple-aggregate'">
                        <v-card flat>
                            <v-card-text style="padding-top: 10px;">
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

                            <v-card-text class="pa-0">
                                <event-storming-attribute
                                        label="Read Model Attributes"
                                        v-model="value.fieldDescriptors"
                                        :isReadOnly="isReadOnly"
                                        :type="value._type"
                                        :elementId="value.elementView.id"
                                        @sync-attribute="syncFromAggregate"
                                        :entities="relatedAggregate ? relatedAggregate.aggregateRoot.entities : null"
                                        :fields="relatedAggregate ? relatedAggregate.aggregateRoot.fieldDescriptors : null"
                                ></event-storming-attribute>
                            </v-card-text>
                        </v-card>
                    </div>

                    <div v-if="value.dataProjection == 'cqrs'">
                        <v-card flat>
                            <v-card-text class="pa-0">
                                <event-storming-attribute
                                        label="Read Model Attributes"
                                        v-model="value.fieldDescriptors"
                                        :isReadOnly="isReadOnly"
                                        :type="value._type"
                                        :elementId="value.elementView.id"
                                ></event-storming-attribute>
                            </v-card-text>
                        </v-card>

                        <v-col v-for="(item,key) in value.createRules">
                            <ViewCreate
                                    v-model="value"
                                    :createItem="item"
                                    :index="key"
                                    :isRead="isReadOnly"
                            ></ViewCreate>
                        </v-col>
                        <v-row align="start" justify="end">
                            <v-tooltip left>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" class="cqrs-add-btn" outlined :disabled="isReadOnly"
                                           @click="viewMainRowAdd('create')">
                                        <v-icon> mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add "CREATE" Card</span>
                            </v-tooltip>
                        </v-row>

                        <v-col v-for="(item,key) in value.updateRules">
                            <ViewUpdate
                                    v-model="value"
                                    :updateItem="item"
                                    :index="key"
                                    :isRead="isReadOnly"
                            >
                            </ViewUpdate>
                        </v-col>
                        <v-row align="center" justify="end">
                            <v-tooltip left>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" class="cqrs-add-btn" outlined :disabled="isReadOnly"
                                           @click="viewMainRowAdd('update')">
                                        <v-icon> mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add "UPDATE" Card</span>
                            </v-tooltip>
                        </v-row>

                        <v-col v-for="(item,key) in value.deleteRules">
                            <ViewDelete
                                    v-model="value"
                                    :deleteItem="item"
                                    :index="key"
                                    :isRead="isReadOnly"
                            ></ViewDelete>
                        </v-col>
                        <v-row align="start" justify="end">
                            <v-tooltip left>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" class="cqrs-add-btn" outlined :disabled="isReadOnly"
                                           @click="viewMainRowAdd('delete')">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add "DELETE" Card</span>
                            </v-tooltip>
                        </v-row>
                    </div>
                </v-card-text>
            </v-card>
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
            syncFromAggregate() {
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
                                    me.value.queryParameters.push(aggField)
                                } else {
                                    me.value.queryParameters[eventKey] = aggField
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
        margin:5px 30px 50px 0;
        color: #757575;
    }
</style>