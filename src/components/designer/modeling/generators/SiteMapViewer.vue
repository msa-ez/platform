<template>
    <div class="site-map-viewer">
        <div class="toolbar">
            <div class="toolbar-left">
                <v-row class="pa-0 ma-0 pt-4" style="align-items: center; gap: 10px;">
                    <v-btn class="auto-modeling-btn" color="primary" @click="generateSiteMap" :disabled="isGenerating">
                        {{ $t('siteMap.toolbar.regenerate') }}
                    </v-btn>
                    <v-btn class="auto-modeling-btn" color="secondary" @click="addNode" :disabled="isGenerating">
                        {{ $t('siteMap.toolbar.addNode') }}
                    </v-btn>
                    <!-- <v-btn class="auto-modeling-btn" color="info" @click="toggleAllNodes" :disabled="isGenerating">
                        <i class="fas fa-compress-alt"></i> {{ isAllCollapsed ? $t('siteMap.toolbar.expandAll') : $t('siteMap.toolbar.collapseAll') }}
                    </v-btn> -->
                    <template v-if="isGenerating">
                        <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
                        <span class="progress-text" v-if="totalChunks > 0">{{ $t('siteMap.toolbar.progress', { rate: processingRate }) }}</span>
                    </template>
                </v-row>
            </div>
            
            <!-- 줌 컨트롤 추가 -->
            <div class="zoom-controls">
                <v-btn icon small @click="zoomOut" :disabled="currentZoom <= minZoom" class="zoom-btn">
                    <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span class="zoom-level">{{ Math.round(currentZoom * 100) }}%</span>
                <v-btn icon small @click="zoomIn" :disabled="currentZoom >= maxZoom" class="zoom-btn">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <!-- <v-btn icon small @click="resetZoom" class="zoom-btn">
                    <v-icon>mdi-magnify-close</v-icon>
                </v-btn> -->
            </div>
        </div>
        
        <div class="site-map-container" 
             ref="siteMapContainer"
             @wheel="handleWheel"
             @mousedown="startPan"
             @mousemove="pan"
             @mouseup="stopPan"
             @mouseleave="stopPan"
             :class="{ 'dragging': isDragging }">
            <div class="site-map-tree" 
                 :style="{ 
                     transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${currentZoom})`,
                     transformOrigin: '0 0'
                 }">
                <div class="root-node" v-if="localSiteMap.length > 0">
                    <div class="node-content">
                        <!-- 접기/펼치기 버튼 (우측) -->
                        <button 
                            v-if="localSiteMap[0].children && localSiteMap[0].children.length > 0"
                            class="collapse-btn" 
                            @click="toggleRootCollapse" 
                            :title="isRootCollapsed ? '펼치기' : '접기'"
                            :disabled="isGenerating"
                        >
                            <span class="arrow-icon">{{ isRootCollapsed ? '▼' : '▲' }}</span>
                        </button>
                        
                        <div class="node-title">
                            <input 
                                v-model="localSiteMap[0].title" 
                                :disabled="isGenerating"
                                class="node-input title-input"
                                :placeholder="$t('siteMap.node.siteTitle')"
                                @input="updateNode(localSiteMap[0].id, { title: localSiteMap[0].title })"
                            />
                        </div>
                        <div class="node-description">
                            <input 
                                v-model="localSiteMap[0].description" 
                                class="node-input description-input"
                                :placeholder="$t('siteMap.node.siteDescription')"
                            />
                        </div>
                        <div class="node-actions">
                            <button class="action-btn" @click="addChildNode(localSiteMap[0].id)">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button 
                                v-if="localSiteMap[0].children && localSiteMap[0].children.length > 0"
                                class="action-btn toggle-btn" 
                                @click="toggleRootCollapse" 
                                :title="isRootCollapsed ? $t('siteMap.node.expand') : $t('siteMap.node.collapse')"
                                :disabled="isGenerating"
                            >
                                <i :class="isRootCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
                            </button>
                            <button class="action-btn delete-btn" @click="deleteNode(localSiteMap[0].id)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 하위 노드들 -->
                    <div class="children-container" v-if="localSiteMap[0].children && localSiteMap[0].children.length > 0 && !isRootCollapsed">
                        <div class="children-wrapper">
                            <div 
                                v-for="(child, index) in localSiteMap[0].children" 
                                :key="child.id"
                                class="child-node"
                            >
                                <SiteMapNode 
                                    :isGenerating="isGenerating"
                                    :node="child"
                                    :parent-title="localSiteMap[0].title"
                                    :available-bounded-contexts="(localSiteMap[0].boundedContexts || [])"
                                    @add-child="addChildNode"
                                    @delete-node="deleteNode"
                                    @update-node="updateNode"
                                    @node-collapse-changed="handleNodeCollapseChanged"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <!-- 접힌 상태 표시 -->
                    <div class="collapsed-indicator" v-if="localSiteMap[0].children && localSiteMap[0].children.length > 0 && isRootCollapsed">
                        <div class="collapsed-content">
                            <i class="fas fa-ellipsis-h"></i>
                            <span class="collapsed-text">{{ $t('siteMap.node.collapsed', { count: localSiteMap[0].children.length }) }}</span>
                            <button class="expand-btn" @click="toggleRootCollapse" :disabled="isGenerating">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 빈 상태 -->
                <div v-else class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-sitemap"></i>
                    </div>
                    <h3>{{ $t('siteMap.empty.title') }}</h3>
                    <p>{{ $t('siteMap.empty.description') }}</p>
                    <button class="auto-modeling-btn" color="primary" :disabled="isGenerating" @click="addRootNode">
                        <i class="fas fa-plus"></i> {{ $t('siteMap.empty.addRootNode') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SiteMapNode from './SiteMapNode.vue';

export default {
    name: "SiteMapViewer",
    components: {
        SiteMapNode
    },
    props: {
        userStory: {
            type: String,
            default: () => "",
            required: false
        },
        siteMap: {
            type: Array,
            default: () => [],
            required: false
        },
        resultDevideBoundedContext: {
            type: Object,
            default: () => ({}),
            required: false
        },
        isGenerating: {
            type: Boolean,
            default: false,
            required: false
        },
        processingRate: {
            type: Number,
            default: 0,
            required: false
        },
        currentChunk: {
            type: Number,
            default: 0,
            required: false
        },
        totalChunks: {
            type: Number,
            default: 0,
            required: false
        }
    },
    data() {
        return {
            nodeIdCounter: 1,
            input: {
                frontendRequirements: "",
                resultDevideBoundedContext: []
            },
            generator: null,
            updateTimeout: null,
            localSiteMap: [],
            currentZoom: 1, // 현재 줌 레벨
            minZoom: 0.5, // 최소 줌 레벨
            maxZoom: 2.0, // 최대 줌 레벨
            panOffset: { x: 0, y: 0 }, // 패닝 오프셋
            isPanning: false, // 패닝 중인지 여부
            lastMouseX: 0, // 마지막 마우스 X 좌표
            lastMouseY: 0, // 마지막 마우스 Y 좌표
            isRootCollapsed: false, // 루트 노드 접기/펼치기 상태
            isAllCollapsed: false, // 전체 접기/펼치기 상태
            // 성능 최적화를 위한 추가 변수들
            rafId: null, // RequestAnimationFrame ID
            isDragging: false, // 드래그 중인지 여부
            lastPanTime: 0, // 마지막 패닝 시간
            panThrottle: 16, // 60fps로 제한 (16ms)
        };
    },
    computed: {
        nodeCount() {
            return this.countNodes(this.localSiteMap);
        }
    },
    watch: {
        // props 변경 시 지역 변수 동기화
        siteMap: {
            handler(newSiteMap) {
                if (newSiteMap && Array.isArray(newSiteMap)) {
                    this.localSiteMap = JSON.parse(JSON.stringify(newSiteMap)); // 깊은 복사
                }
            },
            immediate: true,
            deep: true
        }
    },
    created() {
    },
    mounted() {
        try {
            if(this.siteMap.length == 0){
                this.addRootNode();
            }
            
            // 줌과 패닝 초기화
            this.$nextTick(() => {
                try {
                    this.centerRootNode();
                } catch (error) {
                    console.warn('초기 중앙 정렬 실패:', error);
                }
                
                // 휠 이벤트 리스너 추가 (Ctrl+휠로 줌)
                const container = this.$refs.siteMapContainer;
                if (container) {
                    container.addEventListener('wheel', this.handleWheel, { passive: false });
                }
            });
        } catch (error) {
            console.error('컴포넌트 마운트 중 오류 발생:', error);
        }
    },
    methods: {
        generateId() {
            return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        },
        
        addRootNode() {
            const rootNode = {
                id: this.generateId(),
                title: this.$t('siteMap.defaults.newWebsite'),
                description: this.$t('siteMap.defaults.siteDescription'),
                type: "root",
                children: []
            };
            this.localSiteMap = [rootNode];
            this.$emit('update:siteMap', this.localSiteMap);
        },
        
        addNode() {
            if (this.localSiteMap.length === 0) {
                this.addRootNode();
            } else {
                this.addChildNode(this.localSiteMap[0].id);
            }
        },
        
        addChildNode(parentId) {
            const parentNode = this.findNode(parentId, this.localSiteMap);
            if (parentNode) {
                const newNode = {
                    id: this.generateId(),
                    title: this.$t('siteMap.defaults.newPage'),
                    description: this.$t('siteMap.defaults.pageDescription'),
                    type: "navigation",
                    boundedContext: "",
                    uiRequirements: "",
                    children: []
                };
                
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                parentNode.children.push(newNode);
                
                // 부모 컴포넌트에 변경사항 알림
                this.$emit('update:siteMap', this.localSiteMap);
                
                // 새로운 노드가 추가되면 스크롤을 오른쪽으로 이동
                this.$nextTick(() => {
                    this.scrollToNewNode(parentNode);
                });
            }
        },
        
        scrollToNewNode(parentNode) {
            // 스크롤 강제 이동 제거 - 사용자가 직접 스크롤하도록 함
            console.log('새 노드가 추가되었습니다:', parentNode.title);
        },
        
        deleteNode(nodeId) {
            if (this.localSiteMap.length === 1 && this.localSiteMap[0].id === nodeId) {
                // 루트 노드 삭제
                this.localSiteMap = [];
                this.$emit('update:siteMap', this.localSiteMap);
            } else {
                this.removeNodeFromTree(nodeId, this.localSiteMap);
            }
            
            // 부모 컴포넌트에 변경사항 알림
            this.$emit('update:siteMap', this.localSiteMap);
        },
        
        removeNodeFromTree(nodeId, nodes) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === nodeId) {
                    nodes.splice(i, 1);
                    return true;
                }
                if (nodes[i].children && nodes[i].children.length > 0) {
                    if (this.removeNodeFromTree(nodeId, nodes[i].children)) {
                        return true;
                    }
                }
            }
            return false;
        },
        
        updateNode(nodeId, updatedData) {
            const node = this.findNode(nodeId, this.localSiteMap);
            if (node) {
                Object.assign(node, updatedData);
                
                // 디바운싱으로 성능 개선
                if (this.updateTimeout) {
                    clearTimeout(this.updateTimeout);
                }
                
                this.updateTimeout = setTimeout(() => {
                    // 부모 컴포넌트에 변경사항 알림
                    this.$emit('update:siteMap', this.localSiteMap);
                }, 500); // 500ms 지연
            }
        },
        
        findNode(nodeId, nodes) {
            for (const node of nodes) {
                if (node.id === nodeId) {
                    return node;
                }
                if (node.children && node.children.length > 0) {
                    const found = this.findNode(nodeId, node.children);
                    if (found) return found;
                }
            }
            return null;
        },
        
        countNodes(nodes) {
            let count = 0;
            for (const node of nodes) {
                count++;
                if (node.children && node.children.length > 0) {
                    count += this.countNodes(node.children);
                }
            }
            return count;
        },
        
        convertToExportFormat() {
            if (this.localSiteMap.length === 0) {
                return {
                    siteMap: {
                        title: this.$t('siteMap.defaults.emptySiteMap'),
                        description: "",
                        boundedContexts: [],
                        navigation: []
                    }
                };
            }
            
            const rootNode = this.localSiteMap[0];
            const navigation = rootNode.children ? rootNode.children.map(child => ({
                id: child.id,
                title: child.title,
                description: child.description,
                boundedContext: child.boundedContext,
                uiRequirements: child.uiRequirements,
                children: child.children ? child.children.map(subChild => ({
                    id: subChild.id,
                    title: subChild.title,
                    description: subChild.description,
                    boundedContext: subChild.boundedContext,
                    uiRequirements: subChild.uiRequirements
                })) : []
            })) : [];
            
            return {
                siteMap: {
                    title: rootNode.title,
                    description: rootNode.description,
                    boundedContexts: rootNode.boundedContexts || [],
                    navigation: navigation
                }
            };
        },

        closeSiteMapViewer() {
            this.$emit('close:siteMapViewer')
            this.$emit('update:siteMap', this.localSiteMap)
        },

        centerRootNode() {
            // 기본적인 중앙 정렬만 수행 (복잡한 로직 제거)
            if (this.localSiteMap.length === 0) return;
            
            this.$nextTick(() => {
                try {
                    const container = this.$refs.siteMapContainer;
                    if (container) {
                        const containerRect = container.getBoundingClientRect();
                        const centerX = containerRect.width / 2;
                        const centerY = containerRect.height / 2;
                        
                        // 간단한 중앙 정렬
                        this.panOffset = {
                            x: centerX - 140, // 280/2
                            y: centerY - 50   // 기본 높이의 절반
                        };
                    }
                } catch (error) {
                    console.error('중앙 정렬 중 오류 발생:', error);
                    this.panOffset = { x: 0, y: 0 };
                }
            });
        },

        generateSiteMap(){
            this.$emit('generate:siteMap')
        },

        // 줌 컨트롤 메서드
        zoomIn() {
            this.currentZoom = Math.min(this.currentZoom + 0.1, this.maxZoom);
        },
        zoomOut() {
            this.currentZoom = Math.max(this.currentZoom - 0.1, this.minZoom);
        },
        resetZoom() {
            this.currentZoom = 1;
            this.panOffset = { x: 0, y: 0 };
        },

        // 패닝 기능
        startPan(event) {
            if (event.button === 0) { // 왼쪽 마우스 버튼
                this.isPanning = true;
                this.isDragging = true;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                event.preventDefault(); // 기본 동작 방지
            }
        },
        pan(event) {
            if (this.isPanning && this.isDragging) {
                // throttling으로 성능 최적화
                const now = Date.now();
                if (now - this.lastPanTime < this.panThrottle) {
                    return;
                }
                this.lastPanTime = now;
                
                const dx = event.clientX - this.lastMouseX;
                const dy = event.clientY - this.lastMouseY;
                
                // RequestAnimationFrame으로 부드러운 애니메이션
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                }
                
                this.rafId = requestAnimationFrame(() => {
                    this.panOffset.x += dx;
                    this.panOffset.y += dy;
                    this.lastMouseX = event.clientX;
                    this.lastMouseY = event.clientY;
                });
            }
        },
        stopPan() {
            this.isPanning = false;
            this.isDragging = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        },

        // 휠 스크롤 핸들링
        handleWheel(event) {
            // Ctrl+휠로 줌, 일반 휠로는 패닝
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                const delta = event.deltaY;
                const zoomFactor = 0.001;
                const newZoom = this.currentZoom * (1 - delta * zoomFactor);
                const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
                
                // 줌 시 마우스 포인터 위치를 중심으로 줌
                const rect = event.currentTarget.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                
                // RequestAnimationFrame으로 부드러운 줌
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                }
                
                this.rafId = requestAnimationFrame(() => {
                    // 새로운 transform 구조에서 정확한 줌 중심점 계산
                    // 마우스 포인터 아래의 콘텐츠 위치를 계산
                    const contentX = (mouseX - this.panOffset.x) / this.currentZoom;
                    const contentY = (mouseY - this.panOffset.y) / this.currentZoom;
                    
                    // 새로운 줌 레벨에서 같은 콘텐츠 위치를 마우스 포인터 아래에 유지
                    const newPanX = mouseX - contentX * clampedZoom;
                    const newPanY = mouseY - contentY * clampedZoom;
                    
                    // 줌 레벨과 패닝 오프셋 업데이트
                    this.currentZoom = clampedZoom;
                    this.panOffset.x = newPanX;
                    this.panOffset.y = newPanY;
                });
            } else {
                // 일반 휠로는 패닝 (throttling 적용)
                event.preventDefault();
                const now = Date.now();
                if (now - this.lastPanTime < this.panThrottle) {
                    return;
                }
                this.lastPanTime = now;
                
                const deltaX = event.deltaX * 0.5;
                const deltaY = event.deltaY * 0.5;
                
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                }
                
                this.rafId = requestAnimationFrame(() => {
                    this.panOffset.x -= deltaX;
                    this.panOffset.y -= deltaY;
                });
            }
        },

        toggleRootCollapse() {
            this.isRootCollapsed = !this.isRootCollapsed;
            
            // 루트 노드의 children을 숨김 처리
            if (this.localSiteMap[0].children) {
                this.localSiteMap[0].children.forEach(child => {
                    child.isCollapsed = this.isRootCollapsed;
                });
            }
            
            // 시점 자동 조정 일시적으로 비활성화 (기본 기능 복구를 위해)
            // this.$nextTick(() => {
            //     this.adjustViewAfterCollapse();
            // });
            
            this.$emit('update:siteMap', this.localSiteMap);
        },

        // 접기/펼치기 후 시점 자동 조정
        adjustViewAfterCollapse() {
            if (this.localSiteMap.length === 0) return;
            
            const container = this.$refs.siteMapContainer;
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            // 현재 루트 노드의 위치를 계산하여 중앙에 맞춤
            const rootNode = this.localSiteMap[0];
            let estimatedHeight = 100; // 기본 높이
            
            if (!this.isRootCollapsed && rootNode.children && rootNode.children.length > 0) {
                // 펼쳐진 상태일 때는 하위 노드들을 고려한 높이 계산
                // 각 레벨별로 더 정확한 높이 계산
                estimatedHeight = this.calculateTreeHeight(rootNode);
            }
            
            // 줌 레벨에 따른 보정 적용 (더 정교한 보정)
            let zoomCorrection = 1;
            if (this.currentZoom < 0.6) {
                // 극도로 줌 아웃된 상태에서는 더 큰 보정
                zoomCorrection = 1.5;
            } else if (this.currentZoom < 0.8) {
                // 줌 아웃 상태에서는 더 정확한 위치 계산
                zoomCorrection = 1.2;
            } else if (this.currentZoom > 1.5) {
                // 줌 인 상태에서는 미세 조정
                zoomCorrection = 0.95;
            } else if (this.currentZoom > 2.0) {
                // 극도로 줌 인된 상태에서는 더 큰 보정
                zoomCorrection = 0.9;
            }
            
            // 목표 패닝 오프셋 계산
            const targetPanOffset = {
                x: centerX - (280 / 2) * this.currentZoom * zoomCorrection,
                y: centerY - (estimatedHeight / 2) * this.currentZoom * zoomCorrection
            };
            
            // 즉시 시점 조정 (애니메이션 없이)
            this.panOffset.x = targetPanOffset.x;
            this.panOffset.y = targetPanOffset.y;
        },

        // 부드러운 시점 조정 애니메이션 (현재는 사용하지 않음)
        animateViewAdjustment(targetPanOffset) {
            const startPanOffset = { ...this.panOffset };
            const startTime = Date.now();
            const duration = 300; // 300ms 애니메이션
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeOutCubic 이징 함수
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                this.panOffset.x = startPanOffset.x + (targetPanOffset.x - startPanOffset.x) * easeProgress;
                this.panOffset.y = startPanOffset.y + (targetPanOffset.y - startPanOffset.y) * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },

        // 트리 높이를 정확하게 계산하는 메서드
        calculateTreeHeight(node, level = 0) {
            if (!node) return 0;
            
            let height = 100; // 기본 노드 높이
            
            // isCollapsed 속성이 정의되지 않았을 수 있으므로 안전하게 처리
            const isCollapsed = node.isCollapsed === true;
            
            if (node.children && node.children.length > 0 && !isCollapsed) {
                // 하위 노드들의 높이 계산
                const childrenHeight = node.children.reduce((total, child) => {
                    return total + this.calculateTreeHeight(child, level + 1);
                }, 0);
                
                // 레벨에 따른 간격 추가
                const levelSpacing = level === 0 ? 30 : 25; // 루트 레벨과 하위 레벨 간격 다르게
                height += childrenHeight + levelSpacing;
            }
            
            return height;
        },

        // 개별 노드 접기/펼치기 이벤트 처리
        handleNodeCollapseChanged(nodeId, isCollapsed) {
            const node = this.findNode(nodeId, this.localSiteMap);
            if (node) {
                node.isCollapsed = isCollapsed;
                
                // 시점 자동 조정 일시적으로 비활성화 (기본 기능 복구를 위해)
                // this.$nextTick(() => {
                //     this.adjustViewAfterCollapse();
                // });
                
                this.$emit('update:siteMap', this.localSiteMap);
            }
        },

        toggleAllNodes() {
            this.isAllCollapsed = !this.isAllCollapsed;
            
            this.localSiteMap.forEach(node => {
                if (node.type === 'root') {
                    node.isCollapsed = this.isAllCollapsed;
                } else if (node.type === 'navigation') {
                    node.isCollapsed = this.isAllCollapsed;
                }
            });
            
            // 시점 자동 조정 일시적으로 비활성화 (기본 기능 복구를 위해)
            // this.$nextTick(() => {
            //     this.adjustViewAfterCollapse();
            // });
            
            this.$emit('update:siteMap', this.localSiteMap);
        },

        // 컴포넌트 정리 시 RequestAnimationFrame 정리
        beforeDestroy() {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
        }


    }
};
</script>

<style scoped>
.site-map-viewer {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 600px;
    background: #f8f9fa;
    overflow: hidden; /* 전체 컨테이너에서 스크롤 방지 */
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-bottom: 1px solid #e9ecef;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar-left {
    display: flex;
    gap: 10px;
}

.toolbar-right {
    display: flex;
    align-items: center;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-info:hover {
    background: #138496;
}

.node-counter {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

/* 줌 컨트롤 스타일 */
.zoom-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.zoom-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
}

.zoom-level {
    font-size: 12px;
    font-weight: 500;
    color: #495057;
    min-width: 40px;
    text-align: center;
}

/* 줌/패닝 관련 스타일 */
.site-map-container {
    flex: 1;
    overflow: hidden; /* 스크롤바 제거하고 줌/패닝으로 대체 */
    padding: 20px;
    min-height: 0;
    cursor: grab;
    position: relative;
}

.site-map-container:active {
    cursor: grabbing;
}

.site-map-tree {
    display: flex;
    justify-content: center;
    min-height: 100%;
    min-width: max-content;
    padding: 0 20px;
    /* transition: transform 0.1s ease; 제거 - 성능 최적화 */
    will-change: transform; /* GPU 가속 힌트 */
    transform-style: preserve-3d; /* 3D 가속 */
    backface-visibility: hidden; /* 성능 향상 */
    perspective: 1000px; /* 3D 변환 최적화 */
}

/* 드래그 중일 때 커서 스타일 */
.site-map-container.dragging {
    cursor: grabbing;
}

.site-map-container:not(.dragging) {
    cursor: grab;
}

/* 줌 레벨에 따른 커서 스타일 */
.site-map-tree[style*="scale(0.5)"] .node-content {
    cursor: zoom-in;
}

.site-map-tree[style*="scale(2.0)"] .node-content {
    cursor: zoom-out;
}

.site-map-container {
    flex: 1;
    overflow-x: auto; /* 가로 스크롤 활성화 */
    overflow-y: auto; /* 세로 스크롤 활성화 */
    padding: 20px;
    min-height: 0; /* flex 아이템이 축소될 수 있도록 */
    scrollbar-width: thin; /* Firefox 스크롤바 */
    scrollbar-color: #007bff #f8f9fa; /* Firefox 스크롤바 색상 */
    scroll-behavior: smooth; /* 부드러운 스크롤 */
}

.site-map-tree {
    display: flex;
    justify-content: center;
    min-height: 100%;
    min-width: max-content; /* 내용물 크기만큼 최소 너비 설정 */
    padding: 0 20px; /* 좌우 여백 */
}

.root-node {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.node-content {
    background: white;
    border: 2px solid #28a745;
    border-radius: 10px;
    padding: 16px;
    min-width: 280px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    position: relative;
    transition: all 0.2s ease;
}

/* 접기/펼치기 버튼 스타일 */
.collapse-btn {
    position: absolute;
    right: -32px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    background: #ffffff;
    border: 2px solid #28a745;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #28a745;
    transition: all 0.2s ease;
    z-index: 10;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.collapse-btn:hover {
    background: #28a745;
    color: white;
    transform: scale(1.1);
}

.collapse-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.arrow-icon {
    display: block;
    line-height: 1;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
}

.node-parent-info {
    margin-bottom: 8px;
}

.node-title {
    margin-bottom: 8px;
}

.title-input {
    width: 100%;
}

.node-description {
    margin-bottom: 15px;
}

.node-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.title-input {
    font-weight: 600;
    font-size: 16px;
}

.description-input {
    font-size: 12px;
    color: #666;
}

.node-bcs {
    margin-bottom: 10px;
}

.field-label {
    font-size: 10px;
    color: #495057;
    font-weight: 500;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.bc-chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.bc-chip {
    display: inline-block;
    padding: 2px 8px;
    background: #f1f3f5;
    color: #343a40;
    border-radius: 12px;
    font-size: 11px;
}

.node-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.node-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #007bff;
    color: white;
}

.delete-btn:hover {
    background: #dc3545;
}

.children-container {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

/* 루트 노드에서 두 번째 노드로 가는 연결선 */
.children-container::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 30px;
    background: #007bff;
}

.children-line {
    width: 2px;
    height: 30px;
    background: #007bff;
    margin-bottom: 20px;
    position: relative;
}

.children-line::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: #007bff;
}

.children-line::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: #007bff;
}

.children-wrapper {
    display: flex;
    gap: 60px; /* 간격 증가 */
    flex-wrap: nowrap; /* 줄바꿈 없이 가로로 배치 */
    justify-content: flex-start; /* 왼쪽부터 배치 */
    min-height: 100px; /* 최소 높이 보장 */
    align-items: flex-start; /* 상단 정렬로 변경 */
    padding: 10px 0; /* 세로 패딩만 유지 */
    position: relative;
}

/* 연결선 추가 - 갈래로 퍼지는 형태 */
.children-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 2px;
    background: #007bff;
    z-index: 1;
}

.child-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0; /* 노드가 축소되지 않도록 */
    position: relative;
}

/* 각 하위 노드에 연결되는 수직선 */
.child-node::before {
    content: '';
    position: absolute;
    top: 0; /* 가로선에서 시작 */
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 20px;
    background: #007bff;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6c757d;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    color: #dee2e6;
}

.empty-state h3 {
    margin-bottom: 10px;
    color: #495057;
}

.empty-state p {
    margin-bottom: 20px;
    color: #6c757d;
}

/* 스크롤바 스타일링 (Chrome/Safari) */
.site-map-container::-webkit-scrollbar {
    width: 12px; /* 세로 스크롤바 너비 */
    height: 12px; /* 가로 스크롤바 높이 */
}

.site-map-container::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 6px;
}

.site-map-container::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 6px;
}

.site-map-container::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
}

/* 접힌 상태 표시 스타일 */
.collapsed-indicator {
    margin-top: 20px;
    display: flex;
    justify-content: center;
}

.collapsed-content {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8f9fa;
    padding: 12px 20px;
    border-radius: 25px;
    border: 2px dashed #dee2e6;
    color: #6c757d;
    font-size: 14px;
}

.collapsed-content i {
    font-size: 12px;
}

.collapsed-text {
    font-weight: 500;
}

.expand-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.expand-btn:hover {
    background: #007bff;
    color: white;
}

.expand-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .toolbar {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
    }
    
    .toolbar-left {
        justify-content: center;
    }
    
    .zoom-controls {
        justify-content: center;
        margin-top: 10px;
    }
    
    .btn {
        flex: 1;
        justify-content: center;
    }
    
    .children-wrapper {
        gap: 20px;
    }
    
    .node-content {
        min-width: 200px;
    }
}
</style>
