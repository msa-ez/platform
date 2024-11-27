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
            @updateBCName="updateBCName()"
            v-on:update:members="value.members = $event"
            class="pb-10"
    >

        <template slot="t-description-text">
            {{ $t('panelInfo.BoundedContextCMPanel') }}
        </template>

        <template slot="t-generation-text">
            Bounded Contexts become a name of the files
        </template>

        <template slot="md-title-side">

        </template>

        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
            >
                <v-chip
                        small
                        color="orange"
                        text-color="white"
                        style="font-weight:bold;"
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
                    <v-btn v-if="generateDone" :disabled="!value.description" class="auto-modeling-btn" color="primary" @click="generate()"><v-icon>mdi-auto-fix</v-icon>(RE)Generate Inside</v-btn>
                    <v-btn v-if="!generateDone" class="auto-modeling-btn" color="primary" @click="stop()"><v-icon>mdi-auto-fix</v-icon>Stop Generation</v-btn>
                    <!-- <v-btn v-if="!value.description" class="auto-modeling-btn" color="primary" @click="explain()"><v-icon>mdi-auto-fix</v-icon>Generate description</v-btn> -->
                </div>
            </span></div>
        </template>
            
        <template slot="element">
            <div class="pa-4 pb-0">
                <span class="panel-title">Read/Write Authority</span>
                <!-- <v-alert
                    color="grey darken-1"
                    text
                    type="info"
                    class="pa-2 mb-2 alert-text"
                    v-if="titleName != 'External' && titleName != 'Issue' && titleName != 'UI' "
                >
                권한을 부여할 유저와 부여할 권한을 설정하세요
                </v-alert> -->
                <v-card flat>
                    <v-card-text class="pa-0">
                        <v-autocomplete
                                v-if="selectedTemplateLists"
                                v-model="value.preferredPlatform"
                                :items="selectedTemplateLists"
                                item-text="display"
                                item-value="template"
                                :disabled="isReadOnly"
                                label="Preferred Platform"
                        ></v-autocomplete>

                        <v-autocomplete
                                v-model="value.members"
                                :items="userLists"
                                filled
                                chips
                                color="blue-grey lighten-2"
                                label="Select"
                                item-text="userName"
                                return-object
                                :disabled="isReadOnly"
                                :multiple="true"
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                        v-bind="data.attrs"
                                        :input-value="data.selected"
                                        close
                                        @click="data.select"
                                        @click:close="remove(data.item)"
                                >
                                    <v-avatar left>
                                        <v-img :src="data.item.userPic"></v-img>
                                    </v-avatar>
                                    {{ data.item.userName }}
                                </v-chip>
                            </template>
                        </v-autocomplete>

                        <!-- <v-text-field
                                v-model="value.gitURL"
                                label="gitURL"
                                filled
                        ></v-text-field> -->
                    </v-card-text>
                </v-card>

                <v-card flat v-if="value.members">
                    <v-card-text class="pa-0">
                        <div>
                            <v-data-table
                                    :headers="userTableHeaders"
                                    :items="value.members"
                                    class="elevation-1 mb-8"
                            >
                                <template v-slot:item.readable="{ item }">
                                    <v-simple-checkbox
                                            v-model="item.readable"
                                            :ripple="false"
                                    ></v-simple-checkbox>
                                </template>
                                <template v-slot:item.writable="{ item }">
                                    <v-simple-checkbox
                                            v-model="item.writable"
                                            :ripple="false"
                                    ></v-simple-checkbox>
                                </template>
                                <template v-slot:item.admin="{ item }">
                                    <v-simple-checkbox
                                            v-model="item.admin"
                                            :ripple="false"
                                    ></v-simple-checkbox>
                                </template>
                            </v-data-table>
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
    import Explainer from "../../modeling/generators/ModelExplainGenerator";
    import getParent from "../../../../utils/getParent"

    export default {
        mixins: [EventStormingModelPanel],
        name: 'boundedcontext-panel',
        props: {
            generator: Object
        },
        components: {
            CommonPanel
        },
        data() {
            return {
                userTableHeaders: [
                    {
                        text: 'Name',
                        align: 'start',
                        sortable: false,
                        value: 'userName',
                    },
                    {
                        text: 'Readable',
                        value: 'readable',
                    },
                    {
                        text: 'Writable',
                        value: 'writable',
                    },
                    {
                        text: 'Admin',
                        value: 'admin',
                    }
                ],

                state:{
                    generator: "BCGenerator",
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
                generator: null,
                explainer: null,
                model: null

            }
        },
        computed: {
            userLists() {
                var me = this;
                var result = [];
                if (me.canvas.information) {
                    if (me.canvas.information.permissions) {
                        var arr = Object.keys(me.canvas.information.permissions);

                        for (var key in arr) {
                            result.push(me.canvas.information.permissions[arr[key]]);
                        }
                    }
                }
                return result;
            },
            selectedTemplateLists() {
                var me = this
                var list = null
                if (me.canvas && me.canvas.templateList) {
                    if (!list) list = []
                    list = JSON.parse(JSON.stringify(me.canvas.templateList))
                    return list
                }
                return list
            },
            input(){
                return{ 
                    description: this.value.description,
                    boundedContext: this.value,
                }
            },

        },
        created: function () { },
        mounted(){
           this.setExplainer();
        },
        beforeDestroy(){
            var me = this;
            if(me.value._type.endsWith('BoundedContext') && me.value.name){
                if(/[-._]/.test(me.value.name))me.value.name = me.value.name.replace(/[-._]/g, '');
                if(me.value.name.match(/[A-Z]/)) me.value.name = me.value.name.toLowerCase();
            }
        },
        methods: {
            panelInit(){
                var me = this
                // Element
                if (me.isForeign) {
                    me.relatedUrl = 'https://intro.msaez.io/tool/event-storming-tool/#bounded-context-sticker'
                } else {
                    me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#bounded-context-sticker'
                }

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            setExplainer(){
                var me = this;
                //me.generator
                me.explainer = new Explainer({
                    input: {bcName: me.value.name, model: null},
                    onReceived(explain){
                        me.value.description = explain;
                    }
                })
            },
            onReceived(content){
                // this.value.description = content;
            },

            onModelCreated(model){
                this.$EventBus.$emit('createModelInBoundedContext', model);
            },

            async onGenerationFinished(){
                this.$emit('update:generateDone', true);
                this.$EventBus.$emit('generationFinished');
            },  

            generate(){
                let modelCanvas = getParent(this.$parent, 'event-storming-model-canvas')
                this.model = modelCanvas.value

                this.executeBeforeDestroy()  //TODO [Refactoring] method 명은 apply() 정도가 좋겠음.

                this.generator.generate();
                if(this.generator.initRetryCount) this.generator.initRetryCount()

                this.state.startTemplateGenerate = true
                this.$emit('update:generateDone', false);
                this.generateDone = false;    
            },

            stop(){
                this.generator.stop()
                this.generateDone = true
            },

            explain(){

                let parent = this.$parent;
                while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;

                let model = Object.assign([], parent.value)

                this.explainer.client.input.model = model
                this.explainer.client.input.bcName = this.value.name
                this.explainer.generate();
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
            updateBCName(){
                this.$emit('updateBCName')
            }
        }
    }
</script>
