<template>
    <v-card
        class="trace-info-viewer-card"
        :style="cardStyle"
        elevation="12"
    >
        <v-card-title 
            class="headline d-flex align-center"
            style="cursor: move;"
            @mousedown.prevent="dragMouseDown"
        >
            <div>TRACEABILITY</div>
            <v-spacer></v-spacer>
            
            <!-- 참조 네비게이션 컨트롤 -->
            <div v-if="totalHighlights > 0" class="highlight-navigation d-flex align-center mr-4">
                <v-btn 
                    icon 
                    small 
                    :disabled="currentHighlightIndex <= 1"
                    @click="goToPrevHighlight"
                    title="이전 참조"
                >
                    <v-icon>mdi-chevron-up</v-icon>
                </v-btn>
                
                <span class="highlight-counter mx-2">
                    {{ currentHighlightIndex }} / {{ totalHighlights }}
                </span>
                
                <v-btn 
                    icon 
                    small 
                    :disabled="currentHighlightIndex >= totalHighlights"
                    @click="goToNextHighlight"
                    title="다음 참조"
                >
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </div>
            
            <v-btn icon @click="$emit('onClose')">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-card-title>

        <v-tabs v-model="tab" grow>
            <v-tab>
                USER STORY
                <v-chip 
                    v-if="userStoryRefCount > 0" 
                    small 
                    color="primary" 
                    text-color="white" 
                    class="ml-2"
                >
                    {{ userStoryRefCount }}
                </v-chip>
            </v-tab>
            <v-tab>
                DDL
                <v-chip 
                    v-if="ddlRefCount > 0" 
                    small 
                    color="primary" 
                    text-color="white" 
                    class="ml-2"
                >
                    {{ ddlRefCount }}
                </v-chip>
            </v-tab>
        </v-tabs>

        <v-card-text class="content-area">
            <v-tabs-items v-model="tab" class="tab-items-container">
                <v-tab-item class="tab-item-scrollable" eager>
                    <pre><code v-html="highlightedUserStory"></code></pre>
                </v-tab-item>
                <v-tab-item class="tab-item-scrollable" eager>
                    <pre><code v-html="highlightedDdl"></code></pre>
                </v-tab-item>
            </v-tabs-items>
        </v-card-text>
        
        <div class="resize-handle" @mousedown.prevent="resizeMouseDown"></div>
    </v-card>
</template>
  
<script>
import { RefsMergeUtil } from "../../utils"

const STORAGE_KEYS = {
    POSITION: 'trace-info-viewer-position',
    SIZE: 'trace-info-viewer-size',
};

export default {
    name: "trace-info-viewer",
    props: {
        userInputs: {
            type: Object,
            default: () => ({ userStory: "", ddl: "" })
        },
        directRefInfos: {
            type: Object,
            default: () => ({ refs: [] })
        }
    },
    data() {
        return {
            tab: 0,
            position: {
                top: 16,
                left: 80,
            },
            size: {
                width: 617,
                height: 626,
            },
            dragging: false,
            resizing: false,
            dragStart: { x: 0, y: 0 },
            elementStart: { top: 0, left: 0 },
            resizeStart: { x: 0, y: 0, width: 0, height: 0 },
            
            // 하이라이트 네비게이션을 위한 데이터
            allHighlights: [], // 모든 하이라이트 요소들을 저장
            currentHighlightIndex: 1, // 현재 하이라이트 인덱스 (1-based)
            debounceTimer: null, // 스크롤 이벤트 디바운싱용
            scrollListeners: [], // 스크롤 이벤트 리스너들을 저장
        };
    },
    computed: {
        cardStyle() {
            return {
                top: `${this.position.top}px`,
                left: `${this.position.left}px`,
                width: `${this.size.width}px`,
                height: `${this.size.height}px`,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
            };
        },
        processedHtml() {
            const userStory = this.userInputs.userStory || '';
            const ddl = this.userInputs.ddl || '';
            try {

                const fullText = userStory + "\n" + ddl;

                if (!fullText || !this.directRefInfos || !this.directRefInfos.refs || this.directRefInfos.refs.length === 0) {
                    return {
                        userStoryHtml: userStory.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                        ddlHtml: ddl.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                    };
                }
                
                const openTag = '<span class="highlight">';
                const closeTag = '</span>';
                const lines = fullText.split('\n');
                let lineMarkers = lines.map(line => line.split('').map(char => {
                    const escapedChar = char.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return { char: escapedChar, tags: [] };
                }));

                const consolidatedRefs = this.getConsolidatedRefs();
                
                consolidatedRefs.forEach(ref => {
                    const [[startLine, startCol], [endLine, endCol]] = ref;
                    const sLine = startLine - 1;
                    const sCol = startCol - 1;
                    const eLine = endLine - 1;
                    const eCol = (lineMarkers[eLine] && lineMarkers[eLine][endCol]) ? endCol : endCol - 1; // 마지막 칼럼 인덱스는 -1을 제외하는게 UI상으로 적절하게 표시됨

                    if (sLine < 0 || sLine >= lineMarkers.length || eLine < 0 || eLine >= lineMarkers.length) return;

                    if (sLine === eLine) {
                        if (lineMarkers[sLine][sCol]) lineMarkers[sLine][sCol].tags.unshift(openTag);
                        if (lineMarkers[sLine][eCol]) lineMarkers[sLine][eCol].tags.push(closeTag);
                    } else {
                        if (lineMarkers[sLine][sCol]) lineMarkers[sLine][sCol].tags.unshift(openTag);
                        if (lineMarkers[eLine][eCol]) lineMarkers[eLine][eCol].tags.push(closeTag);
                        
                        for (let i = sLine; i <= eLine; i++) {
                            if (i > sLine && i < eLine) { // Full lines in between
                                if(lineMarkers[i].length > 0) {
                                    lineMarkers[i][0].tags.unshift(openTag);
                                    lineMarkers[i][lineMarkers[i].length - 1].tags.push(closeTag);
                                } else {
                                    lineMarkers[i].push({ char: '', tags: [openTag, closeTag]});
                                }
                            }
                        }
                    }
                });

                const htmlLines = lineMarkers.map(line => {
                    return line.reduce((html, marker) => html + marker.tags.join('') + marker.char, '');
                });
                
                const userStoryLineCount = userStory.split('\n').length;
                const userStoryHtml = htmlLines.slice(0, userStoryLineCount).join('\n');
                const ddlHtml = htmlLines.slice(userStoryLineCount).join('\n');
                
                return { userStoryHtml, ddlHtml };

            } catch(e) {
                console.error("Failed to process refs in TraceInfoViewer", e)
                return {
                    userStoryHtml: userStory.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                    ddlHtml: ddl.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                };
            }
        },
        highlightedUserStory() {
            return this.processedHtml.userStoryHtml;
        },
        highlightedDdl() {
            return this.processedHtml.ddlHtml;
        },
        userStoryRefCount() {
            try {
                if (!this.directRefInfos || !this.directRefInfos.refs || this.directRefInfos.refs.length === 0) {
                    return 0;
                }
                
                const userStory = this.userInputs.userStory || '';
                const userStoryLineCount = userStory.split('\n').length;
                
                const consolidatedRefs = this.getConsolidatedRefs();
                
                return consolidatedRefs.filter(ref => {
                    const [[startLine, startCol], [endLine, endCol]] = ref;
                    // USER STORY 영역에 속하는 참조: 시작 라인이 USER STORY 영역 내에 있는 경우
                    return startLine >= 1 && startLine <= userStoryLineCount;
                }).length;
            }
            catch(e) {
                console.error("Failed to get userStoryRefCount", e);
                return 0;
            }
        },
        ddlRefCount() {
            try {
                if (!this.directRefInfos || !this.directRefInfos.refs || this.directRefInfos.refs.length === 0) {
                    return 0;
                }
                
                const userStory = this.userInputs.userStory || '';
                const userStoryLineCount = userStory.split('\n').length;
                
                const consolidatedRefs = this.getConsolidatedRefs();
                
                return consolidatedRefs.filter(ref => {
                    const [[startLine, startCol], [endLine, endCol]] = ref;
                    // DDL 영역에 속하는 참조: 시작 라인이 USER STORY 영역을 넘어서는 경우
                    return startLine > userStoryLineCount;
                }).length;
            }
            catch(e) {
                console.error("Failed to get ddlRefCount", e);
                return 0;
            }
        },
        totalHighlights() {
            return this.allHighlights.length;
        }
    },
    watch: {
        directRefInfos: {
            handler() {
                // directRefInfos가 변경될 때마다 하이라이트 업데이트 및 자동 스크롤 실행
                this.$nextTick(() => {
                    this.updateHighlights();
                    this.setupScrollListeners();
                    this.autoScrollToFirstHighlight();
                });
            },
            deep: true,
            immediate: false
        },
        userInputs: {
            handler() {
                // userInputs가 변경될 때도 하이라이트 업데이트 및 자동 스크롤 실행
                this.$nextTick(() => {
                    this.updateHighlights();
                    this.setupScrollListeners();
                    this.autoScrollToFirstHighlight();
                });
            },
            deep: true,
            immediate: false
        },
        tab: {
            handler() {
                // 탭이 변경될 때 하이라이트 업데이트
                this.$nextTick(() => {
                    this.updateHighlights();
                    this.setupScrollListeners();
                });
            },
            immediate: false
        }
    },
    mounted() {
        this._loadWindowState();
        window.addEventListener('keydown', this.handleKeyDown);
        
        // 하이라이트 업데이트 및 스크롤 이벤트 리스너 등록
        this.$nextTick(() => {
            this.updateHighlights();
            this.setupScrollListeners();
            this.autoScrollToFirstHighlight();
        });
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        this.removeScrollListeners();
        
        // 디바운스 타이머 정리
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    },
    methods: {
        // ### 하이라이트 네비게이션 관련 메서드 ### //
        updateHighlights() {
            this.updateHighlightsWithRetry();
        },
        
        updateHighlightsWithRetry(maxRetries = 10, currentRetry = 0) {
            try {
                this.allHighlights = [];
                
                // 모든 탭 컨테이너를 순회하면서 하이라이트 요소들을 수집
                const tabContainers = this.$el ? this.$el.querySelectorAll('.tab-item-scrollable') : [];
                
                // 예상되는 탭 수 (USER STORY + DDL = 2개)
                const expectedTabCount = 2;
                
                // eager 속성으로 인해 모든 탭이 렌더링되므로 더 적은 재시도로도 충분
                // 탭 컨테이너가 아직 모두 렌더링되지 않았으면 재시도
                if (tabContainers.length < expectedTabCount && currentRetry < maxRetries) {
                    setTimeout(() => {
                        this.updateHighlightsWithRetry(maxRetries, currentRetry + 1);
                    }, 50);
                    return;
                }
                
                // 탭 컨테이너가 없거나 최대 재시도 횟수에 도달한 경우
                if (tabContainers.length === 0) {
                    console.warn("No tab containers found after retries");
                    return;
                }
                
                // consolidatedRefs를 기반으로 하이라이트 그룹 생성
                const consolidatedRefs = this.getConsolidatedRefs();
                const userStory = this.userInputs.userStory || '';
                const userStoryLineCount = userStory.split('\n').length;
                
                consolidatedRefs.forEach((ref, refIndex) => {
                    const [[startLine, startCol], [endLine, endCol]] = ref;
                    
                    // 탭 인덱스 결정 (USER STORY: 0, DDL: 1)
                    const tabIndex = startLine <= userStoryLineCount ? 0 : 1;
                    const container = tabContainers[tabIndex];
                    
                    if (!container) return;
                    
                    // 해당 탭 컨테이너에서 첫 번째 하이라이트 요소 찾기 (대표 요소로 사용)
                    const highlights = container.querySelectorAll('.highlight');
                    if (highlights.length > 0) {
                        // 병합된 참조의 순서에 맞는 대표 하이라이트 요소 선택
                        // DOM에서 하이라이트들이 순서대로 나타나므로, 현재 refIndex에 해당하는 그룹의 첫 번째 요소를 찾음
                        let representativeHighlight = null;
                        
                        // 현재 탭에서 이미 처리된 참조 개수 계산
                        const refsInCurrentTab = consolidatedRefs.slice(0, refIndex).filter(r => {
                            const [[rStartLine]] = r;
                            return tabIndex === 0 ? rStartLine <= userStoryLineCount : rStartLine > userStoryLineCount;
                        });
                        
                        const highlightIndexInTab = refsInCurrentTab.length;
                        representativeHighlight = highlights[highlightIndexInTab];
                        
                        if (representativeHighlight) {
                            this.allHighlights.push({
                                element: representativeHighlight,
                                tabIndex: tabIndex,
                                container: container,
                                // 병합된 참조 정보 추가
                                refData: ref,
                                refIndex: refIndex,
                                // DOM에서의 전체 순서를 위한 고유 식별자
                                globalIndex: this.allHighlights.length,
                                // 요소의 위치 정보 (스크롤 동기화에 사용)
                                offsetTop: representativeHighlight.offsetTop,
                            });
                        }
                    }
                });
                
                // 현재 인덱스가 범위를 벗어나면 조정
                if (this.currentHighlightIndex > this.allHighlights.length) {
                    this.currentHighlightIndex = Math.max(1, this.allHighlights.length);
                } else if (this.currentHighlightIndex < 1 && this.allHighlights.length > 0) {
                    this.currentHighlightIndex = 1;
                }
            } catch (e) {
                console.error("Failed to update highlights", e);
                // 에러가 발생해도 재시도
                if (currentRetry < maxRetries) {
                    setTimeout(() => {
                        this.updateHighlightsWithRetry(maxRetries, currentRetry + 1);
                    }, 50);
                }
            }
        },
        
        navigateToHighlight(index) {
            try {
                if (index < 1 || index > this.allHighlights.length) {
                    return;
                }
                
                const highlightInfo = this.allHighlights[index - 1]; // 0-based로 변환
                if (!highlightInfo) {
                    return;
                }
                
                // 해당 하이라이트가 속한 탭으로 전환
                this.tab = highlightInfo.tabIndex;
                this.currentHighlightIndex = index;
                
                // 탭 전환 후 DOM이 업데이트될 때까지 기다린 후 스크롤
                this.$nextTick(() => {
                    setTimeout(() => {
                        if (highlightInfo.element && highlightInfo.element.scrollIntoView) {
                            highlightInfo.element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                                inline: 'nearest'
                            });
                        }
                    }, 100); // 탭 전환 애니메이션을 위한 지연
                });
            } catch (e) {
                console.error("Failed to navigate to highlight", e);
            }
        },
        
        goToNextHighlight() {
            if (this.currentHighlightIndex < this.totalHighlights) {
                this.navigateToHighlight(this.currentHighlightIndex + 1);
            }
        },
        
        goToPrevHighlight() {
            if (this.currentHighlightIndex > 1) {
                this.navigateToHighlight(this.currentHighlightIndex - 1);
            }
        },
        
        handleScroll(container, tabIndex) {
            // 디바운싱으로 성능 최적화
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            
            this.debounceTimer = setTimeout(() => {
                try {
                    // 현재 활성 탭의 스크롤만 처리
                    if (tabIndex !== this.tab) {
                        return;
                    }
                    
                    const containerRect = container.getBoundingClientRect();
                    const viewportCenter = containerRect.top + containerRect.height / 2;
                    
                    let closestHighlightIndex = -1;
                    let minDistance = Infinity;
                    
                    // 현재 탭의 하이라이트들만 확인
                    this.allHighlights.forEach((highlightInfo, index) => {
                        if (highlightInfo.tabIndex === tabIndex) {
                            const element = highlightInfo.element;
                            if (element) {
                                const elementRect = element.getBoundingClientRect();
                                const elementCenter = elementRect.top + elementRect.height / 2;
                                const distance = Math.abs(elementCenter - viewportCenter);
                                
                                // 뷰포트 내에 있는 요소 중 가장 가까운 것을 찾기
                                if (elementRect.top <= viewportCenter && elementRect.bottom >= viewportCenter) {
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        closestHighlightIndex = index + 1; // 1-based 인덱스
                                    }
                                }
                            }
                        }
                    });
                    
                    // 뷰포트 내에 하이라이트가 없으면 가장 가까운 것을 찾기
                    if (closestHighlightIndex === -1) {
                        this.allHighlights.forEach((highlightInfo, index) => {
                            if (highlightInfo.tabIndex === tabIndex) {
                                const element = highlightInfo.element;
                                if (element) {
                                    const elementRect = element.getBoundingClientRect();
                                    const elementCenter = elementRect.top + elementRect.height / 2;
                                    const distance = Math.abs(elementCenter - viewportCenter);
                                    
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        closestHighlightIndex = index + 1; // 1-based 인덱스
                                    }
                                }
                            }
                        });
                    }
                    
                    if (closestHighlightIndex !== -1 && closestHighlightIndex !== this.currentHighlightIndex) {
                        this.currentHighlightIndex = closestHighlightIndex;
                    }
                } catch (e) {
                    console.error("Failed to handle scroll", e);
                }
            }, 100); // 100ms 디바운싱
        },
        
        setupScrollListeners() {
            this.setupScrollListenersWithRetry();
        },
        
        setupScrollListenersWithRetry(maxRetries = 10, currentRetry = 0) {
            try {
                // 기존 리스너 제거 (중복 방지)
                this.removeScrollListeners();
                
                const tabContainers = this.$el ? this.$el.querySelectorAll('.tab-item-scrollable') : [];
                
                // 예상되는 탭 수 (USER STORY + DDL = 2개)
                const expectedTabCount = 2;
                
                // eager 속성으로 인해 모든 탭이 렌더링되므로 더 적은 재시도로도 충분
                // 탭 컨테이너가 아직 모두 렌더링되지 않았으면 재시도
                if (tabContainers.length < expectedTabCount && currentRetry < maxRetries) {
                    setTimeout(() => {
                        this.setupScrollListenersWithRetry(maxRetries, currentRetry + 1);
                    }, 50);
                    return;
                }
                
                // 탭 컨테이너가 없거나 최대 재시도 횟수에 도달한 경우
                if (tabContainers.length === 0) {
                    console.warn("No tab containers found for scroll listeners after retries");
                    return;
                }
                
                tabContainers.forEach((container, tabIndex) => {
                    const scrollHandler = () => this.handleScroll(container, tabIndex);
                    container.addEventListener('scroll', scrollHandler, { passive: true });
                    
                    // 리스너 참조를 저장 (나중에 제거하기 위해)
                    if (!this.scrollListeners) {
                        this.scrollListeners = [];
                    }
                    this.scrollListeners.push({ container, handler: scrollHandler });
                });
            } catch (e) {
                console.error("Failed to setup scroll listeners", e);
                // 에러가 발생해도 재시도
                if (currentRetry < maxRetries) {
                    setTimeout(() => {
                        this.setupScrollListenersWithRetry(maxRetries, currentRetry + 1);
                    }, 50);
                }
            }
        },
        
        removeScrollListeners() {
            try {
                if (this.scrollListeners) {
                    this.scrollListeners.forEach(({ container, handler }) => {
                        container.removeEventListener('scroll', handler);
                    });
                    this.scrollListeners = [];
                }
            } catch (e) {
                console.error("Failed to remove scroll listeners", e);
            }
        },
        
        // ### 윈도우 상태 조절 및 저장 ### //
        _loadWindowState() {
            try {
                const storedPosition = localStorage.getItem(STORAGE_KEYS.POSITION);
                if (storedPosition) {
                    const pos = JSON.parse(storedPosition);
                    // Ensure it's within viewport bounds on load
                    pos.top = Math.max(0, Math.min(pos.top, window.innerHeight - this.size.height));
                    pos.left = Math.max(0, Math.min(pos.left, window.innerWidth - this.size.width));
                    this.position = pos;
                }
                const storedSize = localStorage.getItem(STORAGE_KEYS.SIZE);
                if (storedSize) {
                    this.size = JSON.parse(storedSize);
                }
            } catch (e) {
                console.error("Failed to load state from localStorage", e);
            }
        },

        saveState() {
            try {
                localStorage.setItem(STORAGE_KEYS.POSITION, JSON.stringify(this.position));
                localStorage.setItem(STORAGE_KEYS.SIZE, JSON.stringify(this.size));
            } catch (e) {
                console.error("Failed to save state to localStorage", e);
            }
        },

        dragMouseDown(e) {
            this.dragging = true;
            this.dragStart = { x: e.clientX, y: e.clientY };
            this.elementStart = { ...this.position };
            
            window.addEventListener('mousemove', this.mouseMove);
            window.addEventListener('mouseup', this.mouseUp);
        },

        resizeMouseDown(e) {
            this.resizing = true;
            this.resizeStart = { 
                x: e.clientX, 
                y: e.clientY, 
                width: this.size.width,
                height: this.size.height,
            };
            window.addEventListener('mousemove', this.mouseMove);
            window.addEventListener('mouseup', this.mouseUp);
        },

        mouseMove(e) {
            e.preventDefault();
            if (this.dragging) {
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                this.position.top = this.elementStart.top + dy;
                this.position.left = this.elementStart.left + dx;
            } else if (this.resizing) {
                const dx = e.clientX - this.resizeStart.x;
                const dy = e.clientY - this.resizeStart.y;
                this.size.width = Math.max(400, this.resizeStart.width + dx);
                this.size.height = Math.max(300, this.resizeStart.height + dy);
            }
        },

        mouseUp() {
            if (this.dragging || this.resizing) {
                this.saveState();
            }
            this.dragging = false;
            this.resizing = false;
            window.removeEventListener('mousemove', this.mouseMove);
            window.removeEventListener('mouseup', this.mouseUp);
        },

        // ### 그 외 ### //
        handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.$emit('onClose');
            }
        },


        autoScrollToFirstHighlight() {
            try {
                const userStoryCount = this.userStoryRefCount;
                const ddlCount = this.ddlRefCount;
                if (userStoryCount === 0 && ddlCount === 0) {
                    return;
                }

                let targetTab = 0;
                if (userStoryCount === 0 && ddlCount > 0) {
                    targetTab = 1;
                }

                // 탭이 이미 올바른 탭으로 설정되어 있는 경우
                if (this.tab === targetTab) {
                    // 바로 스크롤 시도
                    setTimeout(() => {
                        this._scrollToHighlightWithRetry(targetTab);
                    }, 100);
                } else {
                    // 탭 전환이 필요한 경우
                    this.tab = targetTab;
                    // 탭 전환 완료 후 스크롤 시도
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this._scrollToHighlightWithRetry(targetTab);
                        }, 300); // 탭 전환 애니메이션을 위한 충분한 지연
                    });
                }
            } catch (e) {
                console.error("Failed to auto scroll to first highlight", e);
            }
        },
        
        // ### 연속된 라인을 병합하는 유틸리티 메서드 ### //
        getConsolidatedRefs() {
            if (!this.directRefInfos || !this.directRefInfos.refs || this.directRefInfos.refs.length === 0) {
                return [];
            }
            
            const mergedRefs = RefsMergeUtil.mergeRefs(this.directRefInfos.refs);
            return this.consolidateConsecutiveLines(mergedRefs);
        },
        
        consolidateConsecutiveLines(refs) {
            if (!refs || refs.length === 0) {
                return refs;
            }

            // 시작 라인 번호로 정렬
            const sortedRefs = [...refs].sort((a, b) => {
                const [startA] = a[0];
                const [startB] = b[0];
                return startA - startB;
            });

            const consolidated = [];
            let currentGroup = sortedRefs[0];

            for (let i = 1; i < sortedRefs.length; i++) {
                const currentRef = sortedRefs[i];
                const [[currentStartLine, currentStartCol], [currentEndLine, currentEndCol]] = currentRef;
                const [[groupStartLine, groupStartCol], [groupEndLine, groupEndCol]] = currentGroup;

                // 현재 그룹의 마지막 라인 + 1이 다음 참조의 시작 라인과 같으면 병합
                if (groupEndLine + 1 === currentStartLine) {
                    // 그룹 확장: 시작점은 그대로, 끝점은 현재 참조의 끝점으로 업데이트
                    currentGroup = [[groupStartLine, groupStartCol], [currentEndLine, currentEndCol]];
                } else {
                    // 연속되지 않으면 현재 그룹을 결과에 추가하고 새 그룹 시작
                    consolidated.push(currentGroup);
                    currentGroup = currentRef;
                }
            }

            // 마지막 그룹 추가
            consolidated.push(currentGroup);

            return consolidated;
        },
        
        _scrollToHighlightWithRetry(targetTab, maxRetries = 10, currentRetry = 0) {
            this.$nextTick(() => {
                const containers = this.$el.querySelectorAll('.tab-item-scrollable');
                const activeContainer = containers && containers[targetTab];
                
                if (!activeContainer && currentRetry < maxRetries) {
                    // eager 속성으로 인해 더 빠른 렌더링이 가능하므로 재시도 간격 단축
                    setTimeout(() => {
                        this._scrollToHighlightWithRetry(targetTab, maxRetries, currentRetry + 1);
                    }, 50);
                    return;
                }
                
                if (!activeContainer) {
                    console.warn("Tab container not found after retries");
                    return;
                }
                
                // 컨테이너가 스크롤 가능한 상태인지 확인
                const containerRect = activeContainer.getBoundingClientRect();
                const isScrollable = activeContainer.scrollHeight > activeContainer.clientHeight;
                
                if (!isScrollable && currentRetry < maxRetries) {
                    // 컨테이너의 높이가 아직 제대로 계산되지 않았으면 재시도
                    setTimeout(() => {
                        this._scrollToHighlightWithRetry(targetTab, maxRetries, currentRetry + 1);
                    }, 100);
                    return;
                }
                
                const firstHighlight = activeContainer.querySelector('.highlight');
                if (firstHighlight) {
                    // 탭 전환 완료를 위한 추가 지연
                    setTimeout(() => {
                        try {
                            // scrollIntoView와 함께 직접 스크롤 설정도 시도
                            const highlightRect = firstHighlight.getBoundingClientRect();
                            const containerRect = activeContainer.getBoundingClientRect();
                            
                            // firstHighlight의 상대적 위치 계산
                            const highlightOffsetTop = firstHighlight.offsetTop;
                            
                            // 컨테이너 중앙에 위치하도록 스크롤 위치 계산
                            const targetScrollTop = Math.max(0, highlightOffsetTop - (activeContainer.clientHeight / 2));
                            
                            // 두 가지 방법으로 스크롤 시도
                            // 1. scrollIntoView 시도
                            firstHighlight.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                                inline: 'nearest'
                            });
                            
                            // 2. 직접 scrollTop 설정 (fallback)
                            setTimeout(() => {
                                if (Math.abs(activeContainer.scrollTop - targetScrollTop) > 10) {
                                    activeContainer.scrollTo({
                                        top: targetScrollTop,
                                        behavior: 'smooth'
                                    });
                                }
                            }, 100);
                            
                        } catch (e) {
                            console.error("Failed to scroll to highlight", e);
                            
                            // 에러 발생 시 간단한 fallback
                            try {
                                const highlightOffsetTop = firstHighlight.offsetTop;
                                activeContainer.scrollTop = Math.max(0, highlightOffsetTop - 100);
                            } catch (fallbackError) {
                                console.error("Fallback scroll also failed", fallbackError);
                            }
                        }
                    }, 200); // 탭 전환 애니메이션을 위한 충분한 지연
                }
            });
        }
    }
}
</script>

<style scoped>
.trace-info-viewer-card {
    overflow: hidden;
    z-index: 202; /* Ensure it's above the dialog overlay */
}

.content-area {
    overflow: hidden;
    flex-grow: 1;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
}

.tab-items-container {
    flex-grow: 1;
    height: 100%;
}

.tab-item-scrollable {
    height: 100%;
    overflow-y: auto;
}

pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: white;
    padding: 16px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    min-height: 100%;
}

code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nwse-resize;
    z-index: 10;
}

.highlight-navigation {
    border-left: 1px solid #e0e0e0;
    padding-left: 16px;
}

.highlight-counter {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    min-width: 40px;
    text-align: center;
}

</style>
<style>
/* Global style for highlight */
.highlight {
    background: linear-gradient(to top, rgba(255, 220, 0, 0.6) 70%, transparent 50%);
    padding: 0 2px;
    border-radius: 3px;
    font-weight: 500;
}
</style>