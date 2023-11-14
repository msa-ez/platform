<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="!canvas.isEditable"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
            v-on:update:members="value.members = $event"
    >

        <template slot="t-description-text">
            이벤트의 내용을 정의하고 시스템의 경계를 구분.
        </template>

        <template slot="t-generation-text">
            Bounded Contexts become a name of the files
        </template>

        <template slot="md-title-side">

        </template>

        <template slot="t-edit-user">

        </template>

        <template slot="generateWithAi">
            <div><span>
                <div>
                    <v-btn v-if="value.description && generateDone" class="auto-modeling-btn" color="primary" @click="generate()"><v-icon>mdi-auto-fix</v-icon>(RE)Generate Inside</v-btn>
                    <v-btn v-if="value.description && !generateDone" class="auto-modeling-btn" color="primary" @click="stop()"><v-icon>mdi-auto-fix</v-icon>Stop Generation</v-btn>
                    <v-btn v-if="!value.description" class="auto-modeling-btn" text @click="explain()"><v-icon>mdi-auto-fix</v-icon>Generate description</v-btn>
                </div>
            </span></div>
        </template>
            
        <template slot="element">
            <div>
                <span class="panel-title" style="margin-left:15px;">Read/Write Authority</span>
                <v-card flat>
                    <v-card-text>
                        <v-autocomplete
                                v-if="selectedTemplateLists"
                                v-model="value.preferredPlatform"
                                :items="selectedTemplateLists"
                                item-text="display"
                                item-value="template"
                                :disabled="!canvas.isEditable"
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
                                :disabled="!canvas.isEditable"
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
                    <v-card-text>
                        <div>
                            <v-data-table
                                    :headers="userTableHeaders"
                                    :items="value.members"
                                    class="elevation-1"
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
    import CommonPanel from "../../es-modeling/panels/CommonPanel";
    import BoundedContextPanel from "../../es-modeling/panels/BoundedContextPanel";
    import getParent from '../../../../utils/getParent'

    export default {
        mixins: [BoundedContextPanel],
        name: 'boundedcontext-cm-panel',
        props: {
            generator: Object
        },
        components: {
            CommonPanel
        },
        data() {
            return {

            }
        },
        computed: {

        },
        created: function () {
        },
        mounted(){},
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = getParent(me.$parent, "context-mapping-model-canvas");
                me.modelCanvasComponent = me.canvas
            },
            setExplainer(){}
        }
    }
</script>
