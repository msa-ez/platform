<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <template v-for="(message, index) in messages">
            <v-card v-if="message.type === 'aggregateDraftDialogDto'" :key="index" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <AggregateDraftDialog
                    :draftOptions="message.draftOptions"
                    :draftUIInfos="message.draftUIInfos"
                    :isGeneratorButtonEnabled="message.isGeneratorButtonEnabled"
                    :uiType="'ESDialoger'"
                    :messageUniqueId="message.uniqueId"

                    @onClose="message.actions.stop()"
                    @onRetry="message.actions.retry()"

                    @generateFromDraft="generateFromDraft"
                    @feedbackFromDraft="feedbackFromDraft"
                ></AggregateDraftDialog>
            </v-card>

            <v-card 
                v-if="message.type === 'boundedContextResult'" 
                :key="`bounded-context-${message.uniqueId}`" 
                class="auto-modeling-user-story-card" 
                style="margin-top: 30px !important;"
            >
                <DevideBoundedContextDialog
                    :resultDevideBoundedContext="deepCopy(message.result)"
                    :isStartMapping="message.isStartMapping"
                    :isGeneratingBoundedContext="message.isGeneratingBoundedContext"
                    :processingRate="message.processingRate"
                    :currentProcessingBoundedContext="message.currentProcessingBoundedContext"
                    :selectedAspect="message.selectedAspect"
                    :summarizedResult="message.summarizedResult"
                    :messageId="message.uniqueId"
                    @createModel="$emit('createModel', $event)"
                    @closeDialog="$emit('closeDialog')"
                    @stop="$emit('stop')"
                    @reGenerate="$emit('reGenerate')"
                    @reGenerateWithFeedback="(feedback, messageId) => $emit('reGenerateWithFeedback', {
                        feedback,
                        messageId
                    })"
                    @mappingRequirements="$emit('mappingRequirements', $event)"
                ></DevideBoundedContextDialog>
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
import { AggregateDraftDialog } from '../../../es-generators'
import DevideBoundedContextDialog from '../../../../generators/DevideBoundedContextDialog.vue'

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
        AggregateDraftDialog,
        DevideBoundedContextDialog
    },
    methods: {
        generateFromDraft(draftOptions) {
            this.$emit('generateFromAggregateDrafts', draftOptions)
        },

        feedbackFromDraft(boundedContextInfo, feedback, draftOptions, messageUniqueId) {
            this.$emit('feedbackFromAggregateDrafts', boundedContextInfo, feedback, draftOptions, messageUniqueId)
        },

        deepCopy(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
    }
}
</script>

  