<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <template v-for="(message, index) in messages">
            <v-card v-if="message.type === 'modelDraftDialogWithXAIDto'" :key="index" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <ModelDraftDialogWithXAI
                    :draftOptions="message.draftOptions"
                    :draftUIInfos="message.draftUIInfos"
                    :isGeneratorButtonEnabled="message.isGeneratorButtonEnabled"
                    :uiType="'ESDialoger'"
                    :messageUniqueId="message.uniqueId"

                    @onClose="message.actions.stop()"
                    @onRetry="message.actions.retry()"

                    @generateFromDraft="generateFromDraftWithXAI"
                    @feedbackFromDraft="feedbackFromDraft"
                ></ModelDraftDialogWithXAI>
            </v-card>

            <div v-if="message.type === 'botMessage'" :key="index" style="margin-top: 30px !important;">
                <v-col class="auto-modeling-message-box">
                    <v-card class="auto-modeling-message-card">
                        <v-card-text class="auto-modeling-message">
                            {{ message.message }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </div>

            <div v-if="message.type === 'userMessage'" :key="index" style="margin-top: 30px !important;">
                <v-col class="auto-modeling-message-box d-flex justify-end">
                    <v-card class="auto-modeling-message-card">
                        <v-card-text class="auto-modeling-message">
                            {{ message.message }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </div>
        </template>
    </div>
</template>
  
<script>
import ModelDraftDialogWithXAI from '../../../../../context-mapping-modeling/dialogs/ModelDraftDialogWithXAI.vue'

export default {
    name: "es-dialoger-messages",
    props: {
        messages: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    components: {
        ModelDraftDialogWithXAI
    },
    methods: {
        generateFromDraftWithXAI(draftOptions) {
            this.$emit('generateFromAggregateDrafts', draftOptions)
        },

        feedbackFromDraft(boundedContextInfo, feedback, draftOptions, messageUniqueId) {
            this.$emit('feedbackFromAggregateDrafts', boundedContextInfo, feedback, draftOptions, messageUniqueId)
        }
    }
}
</script>

  