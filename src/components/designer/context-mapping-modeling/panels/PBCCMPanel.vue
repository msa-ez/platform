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
        </template>

        <template slot="t-generation-text">
        </template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
            >
                <v-chip
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
            <div>
                <v-card flat>
                    <v-card-title style="color: #757575;">
                        Selected Model Info
                    </v-card-title>
                    <v-card-text>
                        <div>
                            Project ID   :
                            <a
                                    @click="moveToModel()"
                            >{{selectedProjectId}}</a>
                        </div>
                        <div>
                            Project Name : {{value.modelValue.projectName}}
                        </div>
                        <div>
                            Selected Version
                            <v-autocomplete
                                    v-model="selectVersion"
                                    :items="versionNameLists"
                                    :auto-select-first="true"
                                    :disabled="isReadOnly"
                                    :loading="loading"
                            ></v-autocomplete>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        </template>
    </common-panel>
</template>


<script>
    import CommonPanel from "../../es-modeling/panels/CommonPanel";
    import PBCPanel from "../../es-modeling/panels/PBCPanel";
    import getParent from '../../../../utils/getParent'

    export default {
        name: 'pbc-cm-panel',
        mixins: [PBCPanel],
        components: {
            CommonPanel,
        },
        data() {
            return {
            }
        },
        computed: {

        },
        created: function () {
        },
        watch: {

        },
        mounted(){},
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = getParent(me.$parent, "context-mapping-model-canvas");
            },
        }
    }
</script>
