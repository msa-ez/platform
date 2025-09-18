<template>
    <v-row v-if="!generateDone" 
           class="generator-progress draggable"
           :class="{ 'is-dragging': isDragging }"
           :style="{
               position: 'fixed',
               left: currentX + 'px',
               top: currentY + 'px',
               zIndex: 1000,
               cursor: isDragging ? 'grabbing' : 'grab'
           }"
           @mousedown="startDrag">
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
                        v-if="progress !== null"
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
                    <div class="full-thinking-content">{{ thinkMessage }}</div>
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
                showFullThinking: false,
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
                offsetX: 0,
                offsetY: 0,
                currentX: 20,  // 초기 X 위치 (mounted에서 계산됨)
                currentY: 90   // 초기 Y 위치 (top: 90px와 동일)
            }
        },
        computed: {
            thinkMessagePreview() {
                const allLines = this.thinkMessage.split('\n').filter(line => line.trim() !== '')
                const lastThreeLines = allLines.slice(-3)
                return lastThreeLines.join('\n')
            }
        },
        watch: {
            generateDone(newVal) {
                if (!newVal) {
                    this.$nextTick(() => {
                        this.calculateInitialPosition()
                    })
                }
            }
        },
        methods: {
            stopGeneration() {
                this.$emit('stopGeneration')
            },
            startDrag(event) {
                // 클릭한 지점과 컴포넌트의 현재 위치 간의 오프셋 계산
                this.isDragging = true
                this.dragStartX = event.clientX
                this.dragStartY = event.clientY
                this.offsetX = event.clientX - this.currentX
                this.offsetY = event.clientY - this.currentY
                
                // 전역 이벤트 리스너 추가
                document.addEventListener('mousemove', this.onDrag)
                document.addEventListener('mouseup', this.stopDrag)
                
                // 텍스트 선택 방지
                event.preventDefault()
            },
            onDrag(event) {
                if (!this.isDragging) return
                
                // 새로운 위치 계산
                this.currentX = event.clientX - this.offsetX
                this.currentY = event.clientY - this.offsetY
                
                // 실제 컴포넌트 크기를 구해서 화면 경계 제한
                if (this.$el) {
                    const rect = this.$el.getBoundingClientRect()
                    const actualWidth = rect.width
                    const actualHeight = rect.height
                    
                    const maxX = window.innerWidth - actualWidth
                    const maxY = window.innerHeight - actualHeight
                    
                    this.currentX = Math.max(0, Math.min(this.currentX, maxX))
                    this.currentY = Math.max(0, Math.min(this.currentY, maxY))
                }
            },
            stopDrag() {
                this.isDragging = false
                
                // 전역 이벤트 리스너 제거
                document.removeEventListener('mousemove', this.onDrag)
                document.removeEventListener('mouseup', this.stopDrag)
            },
            calculateInitialPosition() {
                // 컴포넌트의 실제 DOM 요소에서 너비 구하기
                if (this.$el) {
                    const rect = this.$el.getBoundingClientRect()
                    const actualWidth = rect.width
                    
                    // 실제 너비가 0보다 큰 경우에만 위치 계산
                    if (actualWidth > 0) {
                        // right: 35px와 동일한 위치 계산
                        this.currentX = window.innerWidth - actualWidth - 35
                        
                        // 화면 경계 내에서 제한
                        const maxX = window.innerWidth - actualWidth
                        this.currentX = Math.max(0, Math.min(this.currentX, maxX))
                    } else {
                        // 아직 렌더링이 완료되지 않은 경우 약간의 지연 후 재시도
                        setTimeout(() => {
                            this.calculateInitialPosition()
                        }, 50)
                    }
                }
            },
            handleResize() {
                // 창 크기 변경 시 컴포넌트 위치 재조정
                if (this.$el && !this.isDragging) {
                    const rect = this.$el.getBoundingClientRect()
                    const actualWidth = rect.width
                    const actualHeight = rect.height
                    
                    // 현재 위치가 화면 경계를 벗어났는지 확인하고 조정
                    const maxX = window.innerWidth - actualWidth
                    const maxY = window.innerHeight - actualHeight
                    
                    this.currentX = Math.max(0, Math.min(this.currentX, maxX))
                    this.currentY = Math.max(0, Math.min(this.currentY, maxY))
                }
            }
        },
        mounted() {
            // 창 크기 변경 시 위치 재조정
            window.addEventListener('resize', this.handleResize)
        },
        beforeDestroy() {
            // 컴포넌트가 파괴되기 전에 이벤트 리스너 정리
            document.removeEventListener('mousemove', this.onDrag)
            document.removeEventListener('mouseup', this.stopDrag)
            window.removeEventListener('resize', this.handleResize)
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

/* 드래그 관련 스타일 */
.generator-progress.draggable {
    width: 50%;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.generator-progress.is-dragging {
    transition: none !important;
}

.generator-progress.is-dragging .v-card {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
    transform: scale(1.02);
    transition: transform 0.1s ease;
}

.generator-progress:not(.is-dragging) .v-card {
    transition: all 0.3s ease;
}
</style>