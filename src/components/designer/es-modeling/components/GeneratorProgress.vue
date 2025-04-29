<template>
    <v-row v-if="!generateDone" 
           class="generator-progress">
        <v-card elevation="2" class="pa-2" width="100%">
            <v-progress-linear
                v-if="globalProgress !== null"
                :value="globalProgress"
                color="primary"
                height="4"
                class="mt-n2 mx-n2"
                style="position: absolute; top: 0; left: 8px; width: 100%;"
            ></v-progress-linear>

            <div class="d-flex align-center">
                <div class="progress-container">
                    <v-progress-circular
                        :value="progress"
                        :indeterminate="progress === null"
                        color="primary"
                        size="24"
                    ></v-progress-circular>
                </div>
                
                <span class="ml-3 message-text">{{ displayMessage }}</span>
                
                <v-spacer></v-spacer>
                
                <v-btn 
                    v-if="thinkMessage"
                    text
                    small
                    class="mx-1"
                    @click="showFullThinking = !showFullThinking"
                >
                    <v-icon small left>mdi-brain</v-icon>
                    SHOW THINK
                </v-btn>

                <v-btn 
                    @click="stopGeneration"
                    color="error"
                    class="ml-2"
                    small
                    outlined
                >
                    <v-icon left small>mdi-stop</v-icon>
                    STOP
                </v-btn>
            </div>

            <div v-if="thinkMessage" class="think-preview mt-2 grey--text text-caption">
                {{ thinkMessagePreview }}
            </div>
            
            <v-expand-transition>
                <v-card v-if="showFullThinking && thinkMessage" class="mt-3 pa-2" outlined>
                    <div class="caption font-weight-medium mb-1">모델의 전체 추론 과정:</div>
                    <div class="full-thinking-content">
                        {{ thinkMessage }}
                    </div>
                </v-card>
            </v-expand-transition>
        </v-card>
    </v-row>
</template>

<script>
    export default {
        name: 'generator-progress',
        props: {
            generateDone: {
                type: Boolean,
                default: false
            },
            displayMessage: {
                type: String,
                default: ''
            },
            thinkMessage: {
                type: String,
                default: ''
            },
            progress: {
                type: Number,
                default: null
            }, 
            globalProgress: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                showFullThinking: false
            }
        },
        computed: {
            thinkMessagePreview() {
                const allLines = this.thinkMessage.split('\n').filter(line => line.trim() !== '')
                const lastThreeLines = allLines.slice(-3)
                return lastThreeLines.join('\n')
            }
        },
        methods: {
            stopGeneration() {
                this.$emit('stopGeneration')
            }
        }
    }
</script>

<style scoped>
.progress-container {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-text {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.think-preview {
    white-space: pre-line;
    line-height: 1.4;
    min-height: 5.6em; /* 항상 3줄 공간 확보 */
    max-height: 5.6em; /* 최대 3줄로 제한 */
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
}

.full-thinking-content {
    max-height: 300px;
    overflow-y: auto;
    white-space: pre-wrap;
    font-size: 0.9em;
}
</style>