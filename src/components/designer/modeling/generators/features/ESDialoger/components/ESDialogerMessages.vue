<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <template v-for="(message, index) in messages">
            <v-card 
                v-if="message.type === 'aggregateDraftDialogDto'" 
                :key="index" 
                class="auto-modeling-user-story-card pdf-content-item" 
                style="margin-top: 30px !important;"
                :class="{'hidden': shouldHideMessage(message)}"
            >
                <AggregateDraftDialog
                    :draftOptions="message.draftOptions"
                    :draftUIInfos="message.draftUIInfos"
                    :isGeneratorButtonEnabled="message.isGeneratorButtonEnabled"
                    :uiType="'ESDialoger'"
                    :messageUniqueId="message.uniqueId"
                    :isEditable="isEditable"
                    :boundedContextVersion="message.boundedContextVersion"

                    @onClose="message.actions.stop()"
                    @onRetry="message.actions.retry()"

                    @generateFromDraft="generateFromDraft"
                    @feedbackFromDraft="feedbackFromDraft"
                ></AggregateDraftDialog>
            </v-card>

            <v-card 
                v-if="message.type === 'boundedContextResult'" 
                :key="`bounded-context-${message.uniqueId}`" 
                class="auto-modeling-user-story-card pdf-content-item" 
                style="margin-top: 30px !important;"
            >
                <DevideBoundedContextDialog
                    :resultDevideBoundedContext="deepCopy(message.result)"
                    :isStartMapping="message.isStartMapping"
                    :isGeneratingBoundedContext="message.isGeneratingBoundedContext"
                    :isAnalizing="message.isAnalizing"
                    :isSummarizeStarted="message.isSummarizeStarted"
                    :processingRate="message.processingRate"
                    :currentProcessingBoundedContext="message.currentProcessingBoundedContext"
                    :selectedAspect="message.selectedAspect"
                    :summarizedResult="message.summarizedResult"
                    :pbcLists="message.pbcLists"
                    :messageId="message.uniqueId"
                    :isEditable="isEditable"
                    :currentGeneratedLength="message.currentGeneratedLength"
                    @createModel="$emit('createModel', $event)"
                    @closeDialog="$emit('closeDialog')"
                    @stop="$emit('stop')"
                    @reGenerate="$emit('reGenerate')"
                    @reGenerateWithFeedback="(feedback, messageId) => $emit('reGenerateWithFeedback', {
                        feedback,
                        messageId
                    })"
                    @mappingRequirements="$emit('mappingRequirements', $event)"
                    @updateSelectedAspect="updateSelectedAspect"
                ></DevideBoundedContextDialog>
            </v-card>

            <v-card 
                v-if="message.type === 'processAnalysis'" 
                :key="index" 
                class="auto-modeling-user-story-card pdf-content-item" 
                style="margin-top: 30px !important;"
            >
                <RequirementAnalysis 
                    :analysisResult="message.content"
                    :isAnalizing="message.isAnalizing"
                    :isSummarizeStarted="message.isSummarizeStarted"
                    :isGeneratingBoundedContext="message.isGeneratingBoundedContext"
                    :isStartMapping="message.isStartMapping"
                    :processingRate="message.processingRate"
                    :isEditable="isEditable"
                    :currentGeneratedLength="message.currentGeneratedLength"
                    @showBCGenerationOption="emitShowBCGenerationOption"
                    @stop="$emit('stop')"
                />
            </v-card>

            <v-card 
                v-if="message.type === 'bcGenerationOption'" 
                :key="index" 
                class="auto-modeling-user-story-card pdf-content-item" 
                style="margin-top: 30px !important;"
            >
                <BCGenerationOption
                    :isSummarizeStarted="message.isSummarizeStarted"
                    :isGeneratingBoundedContext="message.isGeneratingBoundedContext"
                    :isStartMapping="message.isStartMapping"
                    :isAnalizing="message.isAnalizing"
                    :recommendedBoundedContextsNumber="message.recommendedBoundedContextsNumber"
                    :generateOption="message.generateOption"
                    :isEditable="isEditable"
                    @setGenerateOption="(option, boolean) => $emit('setGenerateOption', option, boolean)"
                ></BCGenerationOption>
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

            <div v-if="message.type === 'mermaidStringTest'" :key="index" style="margin-top: 30px !important;">
                <VueMermaidStringTest/>
            </div>
        </template>
    </div>
</template>
  
<script>
import { AggregateDraftDialog } from '../../../es-generators'
import DevideBoundedContextDialog from '../../../../generators/DevideBoundedContextDialog.vue'
import RequirementAnalysis from '../../../../generators/RequirementAnalysis.vue'
import BCGenerationOption from '../../../../generators/BCGenerationOption.vue'
import VueMermaidStringTest from './VueMermaidStringTest.vue'

export default {
    name: "es-dialoger-messages",
    props: {
        messages: {
            type: Array,
            required: true,
            default: () => []
        },
        isEditable: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    components: {
        AggregateDraftDialog,
        DevideBoundedContextDialog,
        RequirementAnalysis,
        BCGenerationOption,
        VueMermaidStringTest
    },
    data() {
        return {
            activeVersion: 1
        }
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
        },

        emitShowBCGenerationOption() {
            this.$emit('showBCGenerationOption')
        },

        updateSelectedAspect(aspect) {
            this.activeVersion = this.getVersionFromAspect(aspect);
            this.$emit('updateSelectedAspect', aspect)
        },

        shouldHideMessage(message) {
            if (message.type !== 'aggregateDraftDialogDto') return false;
            
            const boundedContextResults = this.messages.filter(m => m.type === 'boundedContextResult');
            if (boundedContextResults.length > 0) {
                const lastBCResult = boundedContextResults[boundedContextResults.length - 1];
                const resultKeys = Object.keys(lastBCResult.result || {});
                if (resultKeys.length <= 1) return false;
            }

            return message.boundedContextVersion !== this.activeVersion;
        },

        getVersionFromAspect(aspect) {
            const match = aspect.match(/_choice(\d+)$/);
            return match ? parseInt(match[1]) : 1;
        }
    }
}
</script>

<style scoped>
.hidden {
    display: none;
}
</style>