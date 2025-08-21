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
            <v-chip @click="toggleDesignLevel" style="margin-right: 16px; margin-bottom: 5px; cursor: pointer;" color="primary" outlined>
                <v-icon left>{{ isDesignLevelVisible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                {{ $t('CommandDefinitionPanel.implementationSettings') }}
            </v-chip>
        </template>

        <template slot="element">
            <div v-show="isDesignLevelVisible">
                <RuleExampleDialog v-if="openExample" v-model="value" @closeExampleDialog="closeExampleDialog()" />
                <v-card flat class="ma-0 pa-4">
                    <v-card-text class="ma-0 pa-0">
                        <v-checkbox class="ma-0 pa-0" v-model="value.isSaga" label="Saga"></v-checkbox> 
                        <event-storming-attribute  v-if="value.isSaga"
                                v-model="value.fieldDescriptors"
                                :isReadOnly="isReadOnly"
                                :type="value._type"
                                :elementId="value.elementView.id"
                        ></event-storming-attribute>
                    </v-card-text>
                </v-card>
            </div>
        </template>


        <template slot="t-description-text">
            {{ $t('panelInfo.PolicyDefinitionPanel') }}
        </template>

        <template slot="t-generation-text">
            Policies become the "Ports and Adaptors for Aggregate Root".
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

        <template slot="md-title-side">
            <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn class="mb-2"
                        color="primary"
                        :disabled="isReadOnly || !exampleAvailable"
                        @click="openExampleDialog()"
                        v-bind="attrs"
                        v-on="on"
                        style="text-transform: none"
                    >Examples</v-btn>
                </template>
                <span>{{ $t('RuleExampleDialog.generateExamples') }}</span>
            </v-tooltip>
            <v-tooltip left v-if="!exampleAvailable">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on"
                        style="margin-left: -8px; margin-top: -15px; width: 10px; height: 10px;">
                        <v-icon color="grey lighten-1">mdi-help-circle</v-icon>
                    </v-btn>
                </template>
                <span>
                    The following steps are required to use the 'EXAMPLES'. <br>
                    1. There must be a policy sticker that forms the event sticker and outgoingRelation. <br>
                    2. A relationship with the event that occurs through the policy must be formed. <br>
                    e.g.<br>
                    <img width="795" alt="image" src="https://github.com/user-attachments/assets/dc66113d-516b-42a5-b717-c8365abecd7e">
                </span>
            </v-tooltip>
        </template>
    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import RuleExampleDialog from "../RuleExampleDialog"
    // Translate
    var googleTranslate = require('google-translate')(process.env.VUE_APP_TRANSLATE_KEY);
    var changeCase = require('change-case');

    export default {
        mixins: [EventStormingModelPanel],
        name: 'policy-panel',
        components: {
            CommonPanel,
            RuleExampleDialog
        },
        data() {
            return {
                exampleAvailable: false
            }
        },
        computed: {

        },
        beforeDestroy() {
        },
        created: function () { 
            this.exampleAvailable = this.validateRuleExample()
        },
        watch: {},
        methods: {
            panelInit(){
                var me = this
                // Policy
                if (me.isForeign) {
                    me.relatedUrl = 'https://intro.msaez.io/tool/event-storming-tool/#policy-sticker'
                } else {
                    me.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#policy-sticker'
                }

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
                            if(detection){
                                if (detection.language != 'en') {
                                    googleTranslate.translate(newVal, 'en', function (err, translation) {
                                        var obj={
                                            'usedTranslate' : true,
                                            'translateText' : changeCase.pascalCase(translation.translatedText)
                                        }
                                        resolve(obj)
                                    });
                                } else if (detection.language == 'en') {
                                    var obj={
                                        'usedTranslate' : true,
                                        'translateText' : changeCase.pascalCase(newVal)
                                    }
                                    resolve(obj)
                                }
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
