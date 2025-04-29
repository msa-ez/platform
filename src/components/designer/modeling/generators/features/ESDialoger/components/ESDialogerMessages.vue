<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <template v-if="isLoading && isServerProject">
            <v-col v-for="i in 3" :key="`skeleton-${i}`">
                <v-card outlined class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                    <v-skeleton-loader ref="skeleton" type="card" class="mx-auto"></v-skeleton-loader>
                </v-card>
            </v-col>
        </template>

        <template v-else v-for="(message, index) in renderedMessages">
            <v-card 
                v-if="message.type === 'aggregateDraftDialogDto'" 
                :key="index" 
                class="auto-modeling-user-story-card" 
                style="margin-top: 30px !important;"
                :class="{'hidden': shouldHideMessage(message)}"
            >

                <v-skeleton-loader v-if="message._isLoading && !isMessageComplete(message)"
                    type="card" class="mx-auto"
                ></v-skeleton-loader>

                <AggregateDraftDialog
                    v-else
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
                    @updateSelectedOptionItem="updateSelectedOptionItem"
                ></AggregateDraftDialog>
            </v-card>

            <v-card 
                v-if="message.type === 'boundedContextResult'" 
                :key="`bounded-context-${message.uniqueId}`" 
                class="auto-modeling-user-story-card" 
                style="margin-top: 30px !important;"
            >
                <v-skeleton-loader v-if="message._isLoading && !isMessageComplete(message)"
                    type="card" class="mx-auto"
                ></v-skeleton-loader>

                <DevideBoundedContextDialog
                    v-else
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
                class="auto-modeling-user-story-card" 
                style="margin-top: 30px !important;"
            >
                <v-skeleton-loader v-if="message._isLoading && !isMessageComplete(message)"
                    type="card" class="mx-auto"
                ></v-skeleton-loader>

                <RequirementAnalysis 
                    v-else
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
                class="auto-modeling-user-story-card" 
                style="margin-top: 30px !important;"
            >
                <v-skeleton-loader v-if="message._isLoading && !isMessageComplete(message)"
                    type="card" class="mx-auto"
                ></v-skeleton-loader>

                <BCGenerationOption
                    v-else
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
        isServerProject: {
            type: Boolean,
            required: true,
            default: false
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
            activeVersion: 1,
            isLoading: true,
            renderedMessages: [],
            renderIndex: 0 ,
            isProcessing: false
        }
    },
    watch: {
        messages: {
            immediate: true,
            handler(newMessages) {
                if (this.isServerProject) {
                    if (this.renderedMessages.length === 0) {
                        this.isLoading = true;
                        setTimeout(() => {
                            this.isLoading = false;
                        }, 1000);
                    }
                    
                    if (this.renderedMessages.length < newMessages.length) {
                        const newMessageCount = newMessages.length - this.renderedMessages.length;
                        for (let i = 0; i < newMessageCount; i++) {
                            const newMessage = newMessages[this.renderedMessages.length + i];
                            this.renderedMessages.push({
                                ...newMessage,
                                _isLoading: true
                            });
                        }
                        this.renderIndex = this.renderedMessages.length - newMessageCount;
                        this.isProcessing = true;
                        this.renderNextMessage();
                    } else {
                        newMessages.forEach((message, index) => {
                            if (this.renderedMessages[index]) {
                                const isComplete = this.isMessageComplete(message);
                                if (isComplete) {
                                    this.$set(this.renderedMessages, index, {
                                        ...message,
                                        _isLoading: false
                                    });
                                }
                            }
                        });
                    }
                } else {
                    this.renderedMessages = [...newMessages];
                }
            }
        }
    },
    beforeDestroy() {
        if (this.renderTimer) {
            clearTimeout(this.renderTimer);
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

        updateSelectedOptionItem(selectedOptionItem) {
            this.$emit('updateSelectedOptionItem', selectedOptionItem)
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
        },

        isMessageComplete(message) {
            if(!this.isServerProject) {
                return true;
            }

            switch (message.type) {
                case 'aggregateDraftDialogDto':
                    const isDraftOptionsValid = message.draftOptions && 
                        Array.isArray(message.draftOptions) && 
                        message.draftOptions.length > 0 &&
                        message.draftOptions.every(option => {
                            if (!option) return false;
                            if (!option.boundedContext || !option.boundedContextAlias) return false;
                            if (!Array.isArray(option.options)) return false;
                            return option.options.every(opt => opt && opt.structure);
                        });

                    const isDraftUIInfosValid = message.draftUIInfos && 
                        Object.prototype.hasOwnProperty.call(message.draftUIInfos, 'leftBoundedContextCount') &&
                        Object.prototype.hasOwnProperty.call(message.draftUIInfos, 'directMessage') &&
                        Object.prototype.hasOwnProperty.call(message.draftUIInfos, 'progress');

                    return isDraftOptionsValid && 
                        isDraftUIInfosValid
                
                case 'boundedContextResult':
                    const isResultValid = message.result && 
                        Object.keys(message.result).length > 0 &&
                        Object.values(message.result).every(aspect => {
                            if (!aspect) return false;
                            if (!aspect.boundedContexts || !Array.isArray(aspect.boundedContexts) || aspect.boundedContexts.length === 0) return false;
                            if (!aspect.relations || !Array.isArray(aspect.relations) || aspect.relations.length === 0) return false;
                            return !!aspect.thoughts;
                        });

                    return isResultValid
                
                case 'processAnalysis':
                    const isContentValid = message.content && 
                        message.content.analysisResult &&
                        message.content.content

                    return isContentValid
                
                case 'bcGenerationOption':
                    return message.generateOption && 
                        message.recommendedBoundedContextsNumber !== undefined;
                
                case 'botMessage':
                case 'userMessage':
                    return message.message && message.uniqueId;
                
                default:
                    return true;
            }
        },

        renderNextMessage() {
            if (this.renderIndex < this.messages.length) {
                const message = this.messages[this.renderIndex];
                
                if (this.processingMessage && this.processingMessage.uniqueId === message.uniqueId) {
                    const index = this.renderedMessages.findIndex(m => m.uniqueId === message.uniqueId);
                    if (index !== -1) {
                        this.$set(this.renderedMessages, index, { ...message });
                    }
                } else {
                    this.renderedMessages.push({ ...message });
                    this.processingMessage = message;
                }
                
                this.renderIndex++;
                this.isProcessing = true;

                this.renderTimer = setTimeout(() => {
                    this.renderNextMessage();
                }, 100);
            } else {
                this.isProcessing = false;
                this.processingMessage = null;
            }
        },
    }
}
</script>

<style scoped>
.hidden {
    display: none;
}

.mb-8 {
    margin-bottom: 20px;
}

.v-skeleton-loader {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
}
</style>