<template>
    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="canvas.isReadOnlyModel"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >

        <template slot="t-description-text"> </template>

        <template slot="t-generation-text"> </template>

        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && canvas.isReadOnlyModel"
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
    </common-panel>

</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    // Translate
    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');

    export default {
        mixins: [EventStormingModelPanel],
        name: 'issue-panel',
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
                // ISSUE

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            async changedNamePanel(newVal){
                var me = this
                me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = newVal

                var translateObj = await me.getTranslate(newVal);
                me.usedTranslate = translateObj.usedTranslate
                me.translateText = translateObj.translateText
            },
            getTranslate(newVal){
                try{
                    return new Promise(async function (resolve) {
                        googleTranslate.detectLanguage(newVal, function (err, detection) {
                            if (detection.language != 'en') {
                                googleTranslate.translate(newVal, 'en', function (err, translation) {
                                    var obj={
                                        'usedTranslate' : true,
                                        'translateText' : translation.translatedText
                                    }
                                    resolve(obj)
                                });
                            }
                        });
                    })
                }catch (e) {
                    return undefined;
                }
            },

        }
    }
</script>
