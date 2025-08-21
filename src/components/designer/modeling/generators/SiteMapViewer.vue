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
                    <template v-if="isGenerating">
                        <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
                        <span class="progress-text" v-if="totalChunks > 0">{{ $t('siteMap.toolbar.progress', { rate: processingRate }) }}</span>
                    </template>
                </v-row>
            </div>
            <!-- <div class="toolbar-right">
                <span class="node-counter">노드 수: {{ nodeCount }}</span>
            </div> -->
            <!-- <div class="toolbar-right">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            icon
                            class="ml-2"
                            v-bind="attrs"
                            v-on="on"
                            @click="closeSiteMapViewer()"
                        >
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </template>
                    <span>Close</span>
                </v-tooltip>
            </div> -->
        </div>
        
        <div class="site-map-container" ref="siteMapContainer">
            <div class="site-map-tree">
                <div class="root-node" v-if="localSiteMap.length > 0">
                    <div class="node-content" :data-node-id="localSiteMap[0].id">
                        <div class="node-title">
                            <input 
                                v-model="localSiteMap[0].title" 
                                class="node-input title-input"
                                :placeholder="$t('siteMap.node.siteTitle')"
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
                            <button class="action-btn delete-btn" @click="deleteNode(localSiteMap[0].id)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- 하위 노드들 -->
                    <div class="children-container" v-if="localSiteMap[0].children && localSiteMap[0].children.length > 0">
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
                                />
                            </div>
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
            localSiteMap: []
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
        if(this.siteMap.length == 0){
            this.addRootNode();
        }
        
        // 루트 노드를 중앙에 위치시키기
        this.$nextTick(() => {
            this.centerRootNode();
        });
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
            const container = this.$refs.siteMapContainer;
            if (container && this.localSiteMap.length > 0) {
                // 컨테이너의 중앙으로 스크롤
                const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
                container.scrollTo({
                    left: scrollLeft,
                    top: 0,
                    behavior: 'smooth'
                });
            }
        },

        generateSiteMap(){
            this.$emit('generate:siteMap')
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
    border: 2px solid #007bff;
    border-radius: 12px;
    padding: 20px;
    min-width: 250px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    position: relative;
}

.node-title {
    margin-bottom: 10px;
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
