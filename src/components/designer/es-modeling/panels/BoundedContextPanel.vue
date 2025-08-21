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
            :isShowGenAITab="true"
            :genAIDto="genAIDto"
            @close="closePanel"
            @changeTranslate="changeTranslate"
            @updateBCName="updateBCName()"
            @generateWithDescription="handleGenerateWithDescription"
            @onClickStopGenerateWithDescription="$emit('onClickStopGenerateWithDescription')"
            v-on:update:members="value.members = $event"
            class="pb-10"
    >
        <template slot="md-level-btn">
            <v-chip @click="toggleDesignLevel" style="margin-right: 16px; margin-bottom: 5px; cursor: pointer;" color="primary" outlined>
                <v-icon left>{{ isDesignLevelVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                {{ $t('CommandDefinitionPanel.implementationSettings') }}
            </v-chip>
        </template>

        <template slot="t-description-text">
            {{ $t('panelInfo.BoundedContextCMPanel') }}
        </template>

        <template slot="t-generation-text">
            Bounded Contexts become a name of the files
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
            
        <template slot="element">
            <div v-show="isDesignLevelVisible" class="pa-4 pb-0">
                <span class="panel-title">{{ $t('TitleText.readWriteAuthority') }}</span>
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
                                :label="$t('labelText.select')"
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

    export default {
        mixins: [EventStormingModelPanel],
        name: 'boundedcontext-panel',
        props: {
            genAIDto: {
                type: Object, 
                required: true, 
                default: {
                    isGenerateWithDescriptionDone: true
                }
            }
        },
        components: {
            CommonPanel
        },
        data() {
            return {
                userTableHeaders: [
                    {
                        text: this.$t('BoundedContextPanel.name'),
                        align: 'start',
                        sortable: false,
                        value: 'userName',
                    },
                    {
                        text: this.$t('BoundedContextPanel.readable'),
                        value: 'readable',
                    },
                    {
                        text: this.$t('BoundedContextPanel.writable'),
                        value: 'writable',
                    },
                    {
                        text: this.$t('BoundedContextPanel.admin'),
                        value: 'admin',
                    }
                ]
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
            }
        },
        beforeDestroy(){
            var me = this;
            if(me.value._type.endsWith('BoundedContext') && me.value.name){
                if(/[-._\s]/.test(me.value.name)) me.value.name = me.value.name.replace(/[-._\s]/g, '');
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

            onReceived(content){
                // this.value.description = content;
            },

            updateBCName(){
                this.$emit('updateBCName')
            },

            onClickReGenerateInside(){
                this.$emit('onClickReGenerateInside', {
                    ...this.value,
                    description: this.value.description
                })
            },

            handleGenerateWithDescription(boundedContext) {
                this.$emit('generateWithDescription', boundedContext);
            }
        }
    }
</script>
