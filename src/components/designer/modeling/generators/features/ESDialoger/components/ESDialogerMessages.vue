<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <!-- <template v-if="isLoading && isServerProject">
            <v-col v-for="i in 3" :key="`skeleton-${i}`">
                <v-card outlined class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                    <v-skeleton-loader ref="skeleton" type="card" class="mx-auto"></v-skeleton-loader>
                </v-card>
            </v-col>
        </template> -->

        <!-- <template v-else> -->
        <template>
            <template v-for="(message, index) in renderedMessages">
                <!-- Aggregate Draft Dialog Messages -->
                <template v-if="message.type === 'aggregateDraftDialogDto'">
                    <!-- Multiple Aggregate Draft Dialog Messages in Tabs -->
                    <v-card v-if="hasMultipleAggregateDraftMessages && index === aggregateDraftMessages[0].index" 
                           :key="'aggregate-draft-tabs'"
                           class="auto-modeling-user-story-card" 
                           style="margin-top: 30px !important;">
                        <v-tabs v-model="activeAggregateTab" show-arrows>
                            <v-tab v-for="(msg, idx) in aggregateDraftMessages" 
                                   :key="msg.uniqueId"
                                   :disabled="shouldHideMessage(msg)">
                                Version {{ idx + 1 }}
                            </v-tab>
                        </v-tabs>

                        <v-tabs-items v-model="activeAggregateTab">
                            <v-tab-item v-for="(msg, idx) in aggregateDraftMessages" 
                                       :key="msg.uniqueId"
                                       :disabled="shouldHideMessage(msg)">
                                <AggregateDraftDialog
                                    :draftOptions="msg.draftOptions"
                                    :draftUIInfos="msg.draftUIInfos"
                                    :isGeneratorButtonEnabled="msg.isGeneratorButtonEnabled"
                                    :uiType="'ESDialoger'"
                                    :messageUniqueId="msg.uniqueId"
                                    :isEditable="isEditable"
                                    :boundedContextVersion="msg.boundedContextVersion"

                                    @onClose="msg.actions.stop()"
                                    @onRetry="msg.actions.retry()"

                                    @generateFromDraft="generateFromDraft"
                                    @feedbackFromDraft="feedbackFromDraft"
                                    @updateSelectedOptionItem="updateSelectedOptionItem"
                                ></AggregateDraftDialog>
                            </v-tab-item>
                        </v-tabs-items>
                    </v-card>

                    <!-- Single Aggregate Draft Dialog Message -->
                    <v-card v-else-if="!hasMultipleAggregateDraftMessages"
                           :key="message.uniqueId"
                           class="auto-modeling-user-story-card" 
                           style="margin-top: 30px !important;"
                           :class="{'hidden': shouldHideMessage(message)}">
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
                            @updateSelectedOptionItem="updateSelectedOptionItem"
                        ></AggregateDraftDialog>
                    </v-card>
                </template>

                <!-- Other Messages -->
                <template v-else>
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
                            :isAnalizing="message.isAnalizing"
                            :isSummarizeStarted="message.isSummarizeStarted"
                            :processingRate="message.processingRate"
                            :currentProcessingBoundedContext="message.currentProcessingBoundedContext"
                            :selectedAspect="message.selectedAspect"
                            :summarizedResult="message.summarizedResult.summary"
                            :pbcLists="message.pbcLists"
                            :messageId="message.uniqueId"
                            :isEditable="isEditable"
                            :currentGeneratedLength="message.currentGeneratedLength"
                            :userStory="message.userStory"
                            :siteMap="message.siteMap"
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
                            @updateDevideBoundedContext="(selectedAspect, devideBoundedContext) => $emit('updateDevideBoundedContext', selectedAspect, devideBoundedContext)"
                            @generate:siteMap="$emit('generate:siteMap')"
                        ></DevideBoundedContextDialog>
                    </v-card>

                    <v-card 
                        v-if="message.type === 'processAnalysis'" 
                        :key="index" 
                        class="auto-modeling-user-story-card" 
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
                        class="auto-modeling-user-story-card" 
                        style="margin-top: 30px !important;"
                    >
                        <BCGenerationOption
                            :isSummarizeStarted="message.isSummarizeStarted"
                            :isGeneratingBoundedContext="message.isGeneratingBoundedContext"
                            :isStartMapping="message.isStartMapping"
                            :isAnalizing="message.isAnalizing"
                            :recommendedBoundedContextsNumber="message.recommendedBoundedContextsNumber"
                            :reasonOfRecommendedBoundedContextsNumber="message.reasonOfRecommendedBoundedContextsNumber"
                            :generateOption="message.generateOption"
                            :isEditable="isEditable"
                            @setGenerateOption="(option, boolean) => $emit('setGenerateOption', option, boolean)"
                        ></BCGenerationOption>
                    </v-card>

                    <v-card 
                        v-if="message.type === 'siteMapViewer'" 
                        :key="index" 
                        class="auto-modeling-user-story-card" 
                        style="margin-top: 30px !important;"
                    >
                        <SiteMapViewer 
                            :siteMap="message.siteMap" 
                            :userStory="message.userStory" 
                            :isEditable="isEditable"
                            :isGenerating="message.isGenerating"
                            :processingRate="message.processingRate"
                            :currentGeneratedLength="message.currentGeneratedLength"
                            :currentChunk="message.currentChunk"
                            :totalChunks="message.totalChunks"
                            :resultDevideBoundedContext="message.resultDevideBoundedContext"
                            @update:siteMap="updateSiteMap"
                            @generate:siteMap="$emit('generate:siteMap')"
                        ></SiteMapViewer>
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
            </template>
        </template>
    </div>
</template>
  
<script>
import { AggregateDraftDialog } from '../../../es-generators'
import DevideBoundedContextDialog from '../../../../generators/DevideBoundedContextDialog.vue'
import RequirementAnalysis from '../../../../generators/RequirementAnalysis.vue'
import BCGenerationOption from '../../../../generators/BCGenerationOption.vue'
import SiteMapViewer from '../../../../generators/SiteMapViewer.vue';
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
        SiteMapViewer,
        VueMermaidStringTest
    },
    data() {
        return {
            activeVersion: 1,
            isLoading: true,
            renderedMessages: [],
            renderIndex: 0,
            isProcessing: false,
            activeAggregateTab: 0
        }
    },
    computed: {
        aggregateDraftMessages() {
            return this.renderedMessages
                .map((msg, index) => ({ ...msg, index }))
                .filter(msg => msg.type === 'aggregateDraftDialogDto');
        },
        nonAggregateMessages() {
            return this.renderedMessages.filter(msg => msg.type !== 'aggregateDraftDialogDto');
        },
        hasAggregateDraftMessages() {
            return this.aggregateDraftMessages.length > 0;
        },
        hasMultipleAggregateDraftMessages() {
            return this.aggregateDraftMessages.length > 1;
        }
    },
    watch: {
        messages: {
            immediate: true,
            handler(newMessages) {
                if (this.isServerProject) {
                    this.isLoading = true;
                    
                    // Update existing messages and add new ones
                    newMessages.forEach((message, index) => {
                        const existingIndex = this.renderedMessages.findIndex(m => m.uniqueId === message.uniqueId);
                        if (existingIndex !== -1) {
                            // Update existing message
                            this.$set(this.renderedMessages, existingIndex, {
                                ...message
                            });
                        } else {
                            // Add new message
                            this.renderedMessages.push({
                                ...message
                            });
                        }
                    });

                    // Remove messages that are no longer in newMessages
                    this.renderedMessages = this.renderedMessages.filter(message => 
                        newMessages.some(m => m.uniqueId === message.uniqueId)
                    );

                    // Sort messages to maintain order
                    this.renderedMessages.sort((a, b) => {
                        const indexA = newMessages.findIndex(m => m.uniqueId === a.uniqueId);
                        const indexB = newMessages.findIndex(m => m.uniqueId === b.uniqueId);
                        return indexA - indexB;
                    });

                    this.renderIndex = this.renderedMessages.length;
                    this.isProcessing = true;
                    this.renderNextMessage();

                    // 모든 메시지가 완전히 로드되었는지 확인
                    const allMessagesComplete = this.renderedMessages.every(message => 
                        this.isMessageComplete(message)
                    );

                    if (allMessagesComplete) {
                        this.isLoading = false;
                    } else {
                        // 메시지가 완전히 로드될 때까지 대기
                        setTimeout(() => {
                            this.isLoading = false;
                        }, 1000);
                    }
                } else {
                    this.renderedMessages = [...newMessages];
                    this.isLoading = false;
                }
            },
            deep: true
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
                
                // case 'bcGenerationOption':
                //     return message.generateOption && 
                //         message.generateOption.selectedAspects &&
                //         Array.isArray(message.generateOption.selectedAspects) &&
                //         message.generateOption.selectedAspects.length > 0;
                
                // case 'botMessage':
                // case 'userMessage':
                //     return message.message && message.uniqueId;
                
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
        updateSiteMap(siteMap) {
            this.$emit('update:siteMap', siteMap)
        }
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

.v-tabs {
    border-bottom: 1px solid #e0e0e0;
}

.v-tab {
    text-transform: none !important;
    font-size: 14px;
    min-width: 120px;
}
</style>