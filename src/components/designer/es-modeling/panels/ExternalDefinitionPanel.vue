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
            외부 시스템
        </template>

        <template slot="t-generation-text"></template>


        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
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
                    <v-card-text class="panel-title">Api path</v-card-text>
                    <v-card-text>
                        <v-text-field
                                v-model="value.controllerInfo.apiPath"
                                outlined
                                :disabled="isReadOnly"
                                hint="맨 처음 '/' 제외한 apiPath를 작성해주세요. (Default '/')"
                        ></v-text-field>
                    </v-card-text>
                </v-card>
                <v-card flat>
                    <v-card-text class="panel-title">Method</v-card-text>
                    <v-card-text>
                        <v-autocomplete
                                v-model="value.controllerInfo.method"
                                :items="restfulList"
                                style="margin-left: 10px; margin-right: 10px;"
                                :disabled="isReadOnly"
                                label="Method" persistent-hint>
                        </v-autocomplete>
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
        name: 'external-panel',
        components: {
            CommonPanel
        },
        data() {
            return {
            }
        },
        created: function () { },
        methods: {
            panelInit(){
                var me = this
                // Exteranl

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
        }
    }
</script>
