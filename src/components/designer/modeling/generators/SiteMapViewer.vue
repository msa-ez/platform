<template>
    <div class="site-map-viewer" :class="{ 'embedded': embedded }">
        <div class="toolbar">
            <div class="toolbar-left">
                <v-row class="pa-0 ma-0 pt-4" style="align-items: center; gap: 10px;">
                    <v-btn v-if="!embedded" class="auto-modeling-btn" color="primary" @click="generateSiteMap" :disabled="isGenerating">
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
                        <span class="progress-text" v-if="currentGeneratedLength > 0">({{ currentGeneratedLength }} text generated...)</span>
                    </template>
                </v-row>
            </div>
            
            <!-- 줌 컨트롤 추가 -->
            <div class="zoom-controls" :style="{ 'margin-right': embedded ? '5%' : '0' }">
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

        <!-- 미매핑 요소 확인 다이얼로그 -->
        <v-dialog v-model="showUnmappedDialog" max-width="600px" persistent>
            <v-card>
                <v-card-title class="headline">
                    {{ $t('siteMap.unmapped.title') }}
                    <v-spacer></v-spacer>
                    <v-btn icon @click="closeUnmappedDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                    <v-card-text>
                        <p>{{ $t('siteMap.unmapped.description') }}</p>
                        <div class="unmapped-list mt-4">
                            <div v-for="element in unmappedElements" :key="element.id" class="unmapped-item mb-3">
                                <div class="d-flex align-center mb-1">
                                    <v-checkbox
                                        v-model="selectedElements"
                                        :value="element.id"
                                        class="mr-2"
                                        hide-details
                                        @change="updateSelection"
                                    ></v-checkbox>
                                    <v-chip 
                                        :color="element._type.endsWith('Command') ? 'primary' : 'success'" 
                                        small 
                                        class="mr-2"
                                    >
                                        {{ element._type.endsWith('Command') ? 'Command' : 'View' }}
                                    </v-chip>
                                    <span class="item-name font-weight-medium">{{ element.displayName || element.name }}</span>
                                </div>
                                <div class="bc-assignment ml-6">
                                    <v-icon small class="mr-1" color="grey">mdi-arrow-right</v-icon>
                                    <span class="text-caption grey--text">
                                        {{ $t('siteMap.unmapped.willBeAddedTo') }} 
                                        <strong>{{ getBoundedContextName(element.boundedContext && element.boundedContext.name) }}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="selection-summary mt-3 pa-3" style="background-color: #f5f5f5; border-radius: 4px;">
                            <div class="d-flex align-center">
                                <v-icon class="mr-2" color="info">mdi-information</v-icon>
                                <span class="text-caption">
                                    {{ $t('siteMap.unmapped.selectedCount', { 
                                        selected: selectedElements.length, 
                                        total: unmappedElements.length 
                                    }) }}
                                </span>
                            </div>
                        </div>
                    </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="selectAllElements" color="info" text>
                        {{ $t('siteMap.unmapped.selectAll') }}
                    </v-btn>
                    <v-btn @click="deselectAllElements" color="info" text>
                        {{ $t('siteMap.unmapped.deselectAll') }}
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeUnmappedDialog" color="grey">
                        {{ $t('siteMap.unmapped.cancel') }}
                    </v-btn>
                    <v-btn 
                        @click="confirmAddUnmappedElements" 
                        color="primary"
                        :disabled="selectedElements.length === 0"
                    >
                        {{ $t('siteMap.unmapped.confirm') }} ({{ selectedElements.length }})
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        
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
                <div class="root-nodes" v-if="hasRootNode()">
                    <div 
                        v-for="(rootNode, index) in localSiteMap" 
                        :key="rootNode.id"
                        class="root-node"
                        :class="{ 'multiple-roots': localSiteMap.length > 1 }"
                    >
                        <SiteMapNode 
                            :isGenerating="isGenerating"
                            :node="rootNode"
                            :parent-title="null"
                            :available-bounded-contexts="(rootNode.boundedContexts || [])"
                            :is-root="true"
                            @add-child="addChildNode"
                            @delete-node="deleteNode"
                            @update-node="updateNode"
                            @node-collapse-changed="handleNodeCollapseChanged"
                        />
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
        },
        embedded: {
            type: Boolean,
            default: false,
            required: false
        },
        currentGeneratedLength: {
            type: Number,
            default: 0,
            required: false
        },
        modelValue: {
            type: Object,
            default: () => ({}),
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
                migrationCompleted: false, // 마이그레이션 완료 플래그
                showUnmappedDialog: false, // 미매핑 요소 다이얼로그 표시 여부
                unmappedElements: [], // 미매핑된 요소들
                selectedElements: [], // 선택된 요소들의 ID
                currentZoom: 1, // 현재 줌 레벨
                minZoom: 0.5, // 최소 줌 레벨
                maxZoom: 2.0, // 최대 줌 레벨
                panOffset: { x: 0, y: 0 }, // 패닝 오프셋
                isPanning: false, // 패닝 중인지 여부
                lastMouseX: 0, // 마지막 마우스 X 좌표
                lastMouseY: 0, // 마지막 마우스 Y 좌표
                isAllCollapsed: false, // 전체 접기/펼치기 상태

                rafId: null, // RequestAnimationFrame ID
                isDragging: false, // 드래그 중인지 여부
                lastPanTime: 0, // 마지막 패닝 시간
                panThrottle: 16, 

                modelBoundedContexts: [],
                modelCommands: [],
                modelViews: []
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
                    // 기존 localSiteMap의 상태를 보존하면서 새로운 데이터로 업데이트
                    const newLocalSiteMap = JSON.parse(JSON.stringify(newSiteMap));
                    
                    
                    // 기존 localSiteMap이 있고, 루트 노드의 접기/펼치기 상태가 있다면 보존
                    if (this.hasRootNode() && this.getRootNode().hasOwnProperty('isCollapsed')) {
                        if (newLocalSiteMap.length > 0) {
                            newLocalSiteMap[0].isCollapsed = this.getRootNode().isCollapsed;
                        }
                    }
                    
                    this.localSiteMap = newLocalSiteMap;
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
            } else {
                // 기존 사이트맵이 있는 경우 루트 노드의 접기/펼치기 상태 초기화
                if (this.hasRootNode() && !this.getRootNode().hasOwnProperty('isCollapsed')) {
                    // isCollapsed 속성이 없다면 기본값 설정
                    this.getRootNode().isCollapsed = false;
                }
            }
            
            // 줌과 패닝 초기화
            this.$nextTick(() => {
                try {
                    this.centerRootNode();
                } catch (error) {
                    console.warn('Error in centerRootNode:', error);
                }
                
                // 휠 이벤트 리스너 추가 (Ctrl+휠로 줌)
                const container = this.$refs.siteMapContainer;
                if (container) {
                    container.addEventListener('wheel', this.handleWheel, { passive: false });
                }
            });
        } catch (error) {
            console.error('Error in SiteMapViewer:', error);
        }

        if(this.embedded && this.modelValue){
            this.modelBoundedContexts = Object.values(this.modelValue.elements).filter(ele => ele!=null && ele._type.endsWith("BoundedContext") && ele.name !== "ui");
            this.modelCommands = Object.values(this.modelValue.elements).filter(ele => ele!=null && ele._type.endsWith("Command"));
            this.modelViews = Object.values(this.modelValue.elements).filter(ele => ele!=null && ele._type.endsWith("View"));

            this.migrateSiteMap();
            
            // BC 정보가 설정되지 않은 경우 설정
            this.setupBoundedContexts();
        }
    },
    beforeDestroy() {
        // 컴포넌트 정리 시 RequestAnimationFrame 정리
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }

        this.closeSiteMapViewer();
    },
    methods: {
        migrateSiteMap(){
            if (!this.modelValue || !this.modelValue.elements) return;
            
            if (this.migrationCompleted) return;
            
            // 사이트맵에 이미 매핑된 노드들의 name 수집
            const mappedNames = new Set();
            this.collectMappedNames(this.localSiteMap, mappedNames);
            
            // modelValue에서 매핑되지 않은 Command와 View 찾기
            const unmappedElements = [];
            Object.values(this.modelValue.elements).forEach(ele => {
                if (ele && (ele._type.endsWith("Command") || ele._type.endsWith("View"))) {
                    const elementName = ele.namePascalCase || ele.name;
                    if (elementName && !mappedNames.has(elementName)) {
                        unmappedElements.push(ele);
                    }
                }
            });
            
            // 매핑되지 않은 요소들이 있으면 다이얼로그 표시
            if (unmappedElements.length > 0) {
                this.unmappedElements = unmappedElements;
                // 기본적으로 모든 요소 선택
                this.selectedElements = unmappedElements.map(ele => ele.id);
                this.showUnmappedDialog = true;
            } else {
                this.migrationCompleted = true;
            }
        },
        
        collectMappedNames(nodes, mappedNames) {
            nodes.forEach(node => {
                if (node.name && node.name !== "NewPage") {
                    mappedNames.add(node.name);
                }
                if (node.children) {
                    this.collectMappedNames(node.children, mappedNames);
                }
            });
        },
        
        addUnmappedElements(elements) {
            // 선택된 요소들만 필터링
            const selectedElements = elements.filter(element => 
                this.selectedElements.includes(element.id)
            );
            
            // Bounded Context별로 그룹핑
            const elementsByBC = this.groupElementsByBoundedContext(selectedElements);
            
            // 각 Bounded Context에 대해 그룹을 찾거나 생성하고 요소들을 추가
            Object.keys(elementsByBC).forEach(bcName => {
                const bcElements = elementsByBC[bcName];
                const boundedContext = this.findBoundedContextByName(bcName);
                
                if (boundedContext) {
                    let bcGroup = this.findBoundedContextGroupByName(bcName);
                    if (!bcGroup) {
                        bcGroup = this.createBoundedContextGroup(boundedContext);
                    }
                    
                    // 요소들을 그룹에 추가
                    bcElements.forEach(element => {
                        const newNode = this.createNodeFromElement(element);
                        if (newNode) {
                            if (!bcGroup.children) {
                                bcGroup.children = [];
                            }
                            bcGroup.children.push(newNode);
                        }
                    });
                }
            });
            
            this.$nextTick(() => {
                this.$emit('update:siteMap', this.localSiteMap);
            });
        },
        
        groupElementsByBoundedContext(elements) {
            const elementsByBC = {};
            elements.forEach(element => {
                const bcId = element.boundedContext && element.boundedContext.id;
                if (bcId) {
                    // id로 BC를 찾아서 name으로 그룹화
                    const bc = this.findBoundedContextById(bcId);
                    const bcName = bc ? bc.name : bcId;
                    
                    if (!elementsByBC[bcName]) {
                        elementsByBC[bcName] = [];
                    }
                    elementsByBC[bcName].push(element);
                }
            });
            return elementsByBC;
        },
        
        findBoundedContextByName(bcName) {
            return this.modelBoundedContexts.find(bc => bc.name === bcName);
        },
        
        findBoundedContextById(bcId) {
            return this.modelBoundedContexts.find(bc => bc.id === bcId);
        },
        
        findBoundedContextGroup(bcId) {
            // 첫 번째 루트 노드에서 해당 Bounded Context 그룹 찾기
            if (this.localSiteMap.length > 0) {
                const rootNode = this.localSiteMap[0];
                if (rootNode.children) {
                    return rootNode.children.find(child => 
                        child.boundedContext === bcId && child.functionType === ""
                    );
                }
            }
            return null;
        },
        
        findBoundedContextGroupByName(bcName) {
            // 첫 번째 루트 노드에서 해당 Bounded Context 그룹 찾기 (name으로)
            if (this.localSiteMap.length > 0) {
                const rootNode = this.localSiteMap[0];
                if (rootNode.children) {
                    return rootNode.children.find(child => 
                        child.boundedContext === bcName && child.functionType === ""
                    );
                }
            }
            return null;
        },
        
        createBoundedContextGroup(boundedContext) {
            const rootNode = this.localSiteMap[0];
            if (!rootNode.children) {
                rootNode.children = [];
            }
            
            const bcGroup = {
                id: this.generateId(),
                title: boundedContext.displayName || boundedContext.name,
                name: "NewPage",
                description: boundedContext.description || "",
                type: "navigation",
                boundedContext: boundedContext.name, // id 대신 name 사용
                functionType: "",
                uiRequirements: "",
                children: []
            };
            
            rootNode.children.push(bcGroup);
            return bcGroup;
        },
        
        createNodeFromElement(element) {
            const isCommand = element._type.endsWith("Command");
            const isView = element._type.endsWith("View");
            
            if (!isCommand && !isView) return null;
            
            // boundedContext id를 name으로 변환
            let bcName = "";
            if (element.boundedContext && element.boundedContext.id) {
                const bc = this.findBoundedContextById(element.boundedContext.id);
                bcName = bc ? bc.name : element.boundedContext.id;
            }
            
            return {
                id: this.generateId(),
                title: element.displayName || element.name,
                name: element.namePascalCase || element.name,
                description: element.description || "",
                type: "navigation",
                boundedContext: bcName, // name 사용
                functionType: isCommand ? "command" : "view",
                uiRequirements: "",
                children: []
            };
        },
        
        getBoundedContextName(bcName) {
            if (!bcName) return this.$t('siteMap.unmapped.noBoundedContext');
            const bc = this.findBoundedContextByName(bcName);
            return bc ? (bc.displayName || bc.name) : this.$t('siteMap.unmapped.unknownBoundedContext');
        },
        
        closeUnmappedDialog() {
            this.showUnmappedDialog = false;
            this.unmappedElements = [];
            this.selectedElements = [];
            this.migrationCompleted = true; // 사용자가 취소해도 마이그레이션 완료로 처리
        },
        
        confirmAddUnmappedElements() {
            this.showUnmappedDialog = false;
            this.addUnmappedElements(this.unmappedElements);
            this.unmappedElements = [];
            this.selectedElements = [];
            this.migrationCompleted = true;
        },
        
        selectAllElements() {
            this.selectedElements = this.unmappedElements.map(ele => ele.id);
        },
        
        deselectAllElements() {
            this.selectedElements = [];
        },
        
        updateSelection() {
            // 체크박스 변경 시 자동으로 호출됨
            // 추가 로직이 필요하면 여기에 구현
        },
        
        findNewNodesInSiteMap() {
            if (!this.modelValue || !this.modelValue.elements) {
                return [];
            }
            
            // Event Storming에 존재하는 Command/View의 name 수집
            const existingElementNames = new Set();
            Object.values(this.modelValue.elements).forEach(element => {
                if (element && (element._type.endsWith("Command") || element._type.endsWith("View"))) {
                    const elementName = element.namePascalCase || element.name;
                    if (elementName) {
                        existingElementNames.add(elementName);
                    }
                }
            });
            
            // 사이트맵에서 새로운 노드들 찾기
            const newNodes = [];
            this.collectNewNodes(this.localSiteMap, existingElementNames, newNodes);
            
            return newNodes;
        },
        
        collectNewNodes(nodes, existingElementNames, newNodes) {
            nodes.forEach(node => {
                // functionType이 "view" 또는 "command"인 노드만 확인
                if (node.functionType === "view" || node.functionType === "command") {
                    const nodeName = node.name;
                    
                    if (nodeName && !existingElementNames.has(nodeName)) {
                        newNodes.push({
                            id: node.id,
                            title: node.title,
                            name: node.name,
                            description: node.description,
                            boundedContext: node.boundedContext,
                            functionType: node.functionType,
                            uiRequirements: node.uiRequirements,
                            type: node.functionType === "command" ? "Command" : "View"
                        });
                    }
                }
                
                // 하위 노드들도 재귀적으로 확인
                if (node.children && node.children.length > 0) {
                    this.collectNewNodes(node.children, existingElementNames, newNodes);
                }
            });
        },
        
        generateId() {
            return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        },
        
        getAvailableBoundedContexts() {
            // modelBoundedContexts에서 name들을 추출하여 반환
            if (this.modelBoundedContexts && this.modelBoundedContexts.length > 0) {
                return this.modelBoundedContexts.map(bc => ({
                    id: bc.id,
                    name: bc.name,
                    displayName: bc.displayName || bc.name,
                    description: bc.description || ""
                }));
            }
            return [];
        },
        
        setupBoundedContexts() {
            const availableBoundedContexts = this.getAvailableBoundedContexts();
            
            if (availableBoundedContexts.length > 0) {
                this.localSiteMap.forEach(rootNode => {
                    if (!rootNode.boundedContexts || rootNode.boundedContexts.length === 0) {
                        rootNode.boundedContexts = availableBoundedContexts;
                    }
                });
            }
        },
        
        addRootNode() {
            const availableBoundedContexts = this.getAvailableBoundedContexts();
            
            const rootNode = {
                id: this.generateId(),
                title: this.$t('siteMap.defaults.newWebsite'),
                description: this.$t('siteMap.defaults.siteDescription'),
                type: "root",
                children: [],
                isCollapsed: false,
                boundedContexts: availableBoundedContexts
            };
            this.localSiteMap = [rootNode];
            this.$emit('update:siteMap', this.localSiteMap);
        },

        // 루트 노드 찾기 헬퍼 메서드
        getRootNode() {
            return this.localSiteMap.length > 0 ? this.localSiteMap[0] : null;
        },

        // 루트 노드가 있는지 확인
        hasRootNode() {
            return this.localSiteMap.length > 0;
        },
        
        addNode() {
            if (!this.hasRootNode()) {
                this.addRootNode();
            } else {
                this.addChildNode(this.getRootNode().id);
            }
        },
        
        addChildNode(parentId) {
            const parentNode = this.findNode(parentId, this.localSiteMap);
            if (parentNode) {
                // 부모 노드가 루트인지 그룹인지에 따라 functionType 결정
                const isRootNode = parentNode.type === "root";
                const functionType = isRootNode ? "" : "command"; // 루트면 그룹(""), 그룹이면 command
                
                // boundedContext 목록 생성 (modelBoundedContexts의 name들 사용)
                const availableBoundedContexts = this.getAvailableBoundedContexts();
                
                // 부모 노드의 boundedContext를 상속받기 (그룹 노드인 경우)
                let boundedContext = "";
                if (isRootNode) {
                    // 루트 노드에서 추가하는 경우 첫 번째 BC 사용
                    boundedContext = availableBoundedContexts.length > 0 ? availableBoundedContexts[0].name : "";
                } else {
                    // 그룹 노드에서 추가하는 경우 부모의 boundedContext 상속
                    boundedContext = parentNode.boundedContext || (availableBoundedContexts.length > 0 ? availableBoundedContexts[0].name : "");
                }
                
                const newNode = {
                    id: this.generateId(),
                    title: this.$t('siteMap.defaults.newPage'),
                    name: "NewPage",
                    description: this.$t('siteMap.defaults.pageDescription'),
                    type: "navigation",
                    boundedContext: boundedContext,
                    functionType: functionType,
                    uiRequirements: "",
                    children: []
                };
                
                if (!parentNode.children) {
                    parentNode.children = [];
                }
                parentNode.children.push(newNode);
                
                // 부모 컴포넌트에 변경사항 알림
                this.$emit('update:siteMap', this.localSiteMap);
            }
        },
        
        deleteNode(nodeId) {
            if (this.hasRootNode() && this.getRootNode().id === nodeId) {
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
            
            const rootNode = this.getRootNode();
            if (!rootNode) return { siteMap: { title: "", description: "", boundedContexts: [], navigation: [] } };
            
            const navigation = rootNode.children ? rootNode.children.map(child => ({
                id: child.id,
                title: child.title,
                name: child.name,
                description: child.description,
                boundedContext: child.boundedContext,
                functionType: child.functionType,
                uiRequirements: child.uiRequirements,
                children: child.children ? child.children.map(subChild => ({
                    id: subChild.id,
                    title: subChild.title,
                    name: subChild.name,
                    description: subChild.description,
                    boundedContext: subChild.boundedContext,
                    functionType: subChild.functionType,
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
            // 사이트맵에서 Event Storming에 없는 새로운 노드들 찾기
            const newNodes = this.findNewNodesInSiteMap();
            
            // 새로운 노드들을 Event Storming에 추가 (embedded일 때만)
            let addedElements = [];
            if (newNodes.length > 0 && this.embedded) {
                addedElements = this.addNewNodesToEventStorming(newNodes);
            }
            
            this.$emit('close:siteMapViewer', {
                siteMap: this.localSiteMap,
                newNodes: newNodes,
                addedElements: addedElements
            });
        },

        centerRootNode() {
            // 기본적인 중앙 정렬만 수행 (복잡한 로직 제거)
            if (!this.hasRootNode()) return;
            
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
                    console.error('Error in centerRootNode:', error);
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
            // 입력 필드, 버튼, 선택 요소에서는 드래그 시작하지 않음
            const target = event.target;
            if (target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.tagName === 'SELECT' || 
                target.tagName === 'BUTTON' ||
                target.closest('input, textarea, select, button')) {
                return;
            }
            
            if (event.button === 0) { // 왼쪽 마우스 버튼
                this.isPanning = true;
                this.isDragging = true;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                event.preventDefault(); // 기본 동작 방지
            }
        },
        pan(event) {
            // 입력 필드, 버튼, 선택 요소에서는 패닝하지 않음
            const target = event.target;
            if (target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.tagName === 'SELECT' || 
                target.tagName === 'BUTTON' ||
                target.closest('input, textarea, select, button')) {
                return;
            }
            
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



        // 접기/펼치기 후 시점 자동 조정
        adjustViewAfterCollapse() {
            if (this.localSiteMap.length === 0) return;
            
            const container = this.$refs.siteMapContainer;
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            // 현재 루트 노드의 위치를 계산하여 중앙에 맞춤
            const rootNode = this.getRootNode();
            if (!rootNode) return;
            let estimatedHeight = 100; // 기본 높이
            
            if (rootNode.children && rootNode.children.length > 0 && !rootNode.isCollapsed) {
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
        
        // ===== Event Storming Element 추가 관련 메서드들 =====
        
        addNewNodesToEventStorming(newNodes) {
            if (!this.modelValue || !this.modelValue.elements) {
                return [];
            }
            
            const addedElements = [];
            
            newNodes.forEach(node => {
                // 해당 BC를 찾기
                const boundedContext = this.findBoundedContextByName(node.boundedContext);
                if (!boundedContext) {
                    console.warn(`BoundedContext not found: ${node.boundedContext}`);
                    return;
                }
                
                // BC의 위치를 기준으로 새 요소의 위치 계산
                const bcElement = this.modelValue.elements[boundedContext.id];
                if (!bcElement || !bcElement.elementView) {
                    console.warn(`BoundedContext element not found: ${boundedContext.id}`);
                    return;
                }
                
                // BC 내부의 적절한 위치 계산 (BC 오른쪽에 배치)
                const bcX = bcElement.elementView.x || 0;
                const bcY = bcElement.elementView.y || 0;
                const bcWidth = bcElement.elementView.width || 350;
                
                // BC 내부의 기존 요소들 위치 확인하여 적절한 위치 찾기
                const newElementPosition = this.calculateNewElementPosition(bcElement, bcX, bcY, bcWidth);
                
            // 새 요소 생성
            const newElement = this.createEventStormingElement(node, newElementPosition);
            
            if (!newElement) {
                console.warn(`Failed to create element for node: ${node.title}`);
                return; // forEach에서 return은 continue와 같음
            }
            
            // Event Storming에 추가
            this.addElementToEventStorming(newElement);
            
            // 추가된 요소를 배열에 저장
            addedElements.push(newElement);
            });
            
            return addedElements;
        },
        
        findBoundedContextByName(bcName) {
            return this.modelBoundedContexts.find(bc => bc.name === bcName);
        },
        
        calculateNewElementPosition(bcElement, bcX, bcY, bcWidth) {
            const bcHeight = bcElement.elementView.height || 400;
            const elementWidth = 100;
            const elementHeight = 100;
            const padding = 20; // BC 내부 여백
            
            // BC 내부의 기존 요소들 위치 확인
            const existingElements = this.getElementsInBoundedContext(bcElement.id);
            
            // BC 내부 좌표로 변환 (BC 내부 기준)
            const bcInnerX = bcX + padding;
            const bcInnerY = bcY + padding;
            const bcInnerWidth = bcWidth - (padding * 2);
            const bcInnerHeight = bcHeight - (padding * 2);
            
            if (existingElements.length === 0) {
                // BC 내부에 요소가 없으면 BC 내부 왼쪽 상단에 배치
                return {
                    x: bcInnerX,
                    y: bcInnerY
                };
            }
            
            // 기존 요소들을 BC 내부 좌표로 변환하여 격자 형태로 배치
            const gridCols = Math.floor(bcInnerWidth / (elementWidth + 10)); // 10px 간격
            const gridRows = Math.floor(bcInnerHeight / (elementHeight + 10));
            
            // 격자 위치 찾기
            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    const candidateX = bcInnerX + col * (elementWidth + 10);
                    const candidateY = bcInnerY + row * (elementHeight + 10);
                    
                    // 이 위치가 기존 요소들과 겹치는지 확인
                    const isOverlapping = existingElements.some(existingEl => {
                        if (!existingEl.elementView) return false;
                        
                        const existingX = existingEl.elementView.x || 0;
                        const existingY = existingEl.elementView.y || 0;
                        const existingWidth = existingEl.elementView.width || 100;
                        const existingHeight = existingEl.elementView.height || 100;
                        
                        return !(candidateX >= existingX + existingWidth || 
                               candidateX + elementWidth <= existingX ||
                               candidateY >= existingY + existingHeight || 
                               candidateY + elementHeight <= existingY);
                    });
                    
                    if (!isOverlapping) {
                        return {
                            x: candidateX,
                            y: candidateY
                        };
                    }
                }
            }
            
            // 격자에 빈 공간이 없으면 기존 요소들 오른쪽에 배치
            const rightmostX = Math.max(...existingElements.map(el => {
                if (!el.elementView) return bcInnerX;
                return (el.elementView.x || 0) + (el.elementView.width || 100);
            }));
            
            return {
                x: Math.min(rightmostX + 10, bcInnerX + bcInnerWidth - elementWidth),
                y: bcInnerY
            };
        },
        
        getElementsInBoundedContext(bcId) {
            if (!this.modelValue || !this.modelValue.elements) {
                return [];
            }
            
            return Object.values(this.modelValue.elements).filter(element => {
                return element && element.boundedContext && element.boundedContext.id === bcId;
            });
        },
        
        createEventStormingElement(node, position) {
            // EventStormingModelCanvas에서 uuid 메서드 가져오기
            let canvas = this.$parent;
            while (canvas && !canvas.uuid) {
                canvas = canvas.$parent;
            }
            
            if (!canvas || !canvas.uuid) {
                console.warn('EventStormingModelCanvas not found or uuid method not available');
                return null;
            }
            
            const elementId = canvas.uuid();
            const boundedContext = this.findBoundedContextByName(node.boundedContext);
            
            if (node.type === "Command") {
                return this.createCommandElement(node, position, elementId, boundedContext);
            } else {
                return this.createViewElement(node, position, elementId, boundedContext);
            }
        },
        
        createCommandElement(node, position, elementId, boundedContext) {
            return {
                _type: "org.uengine.modeling.model.Command",
                id: elementId,
                name: node.name,
                oldName: "",
                displayName: "",
                namePlural: "",
                namePascalCase: "",
                nameCamelCase: "",
                description: null,
                author: this.modelValue.author || "",
                aggregate: { id: "" },
                boundedContext: { id: boundedContext ? boundedContext.id : "" },
                mirrorElement: null,
                elementView: {
                    _type: "org.uengine.modeling.model.Command",
                    id: elementId,
                    x: position.x,
                    y: position.y,
                    width: 100,
                    height: 100,
                    style: "{}",
                    "z-index": 999
                },
                hexagonalView: {
                    _type: "org.uengine.modeling.model.CommandHexagonal",
                    id: elementId,
                    subWidth: 100,
                    width: 20,
                    height: 20,
                    style: "{}"
                },
                isRestRepository: true,
                controllerInfo: {
                    apiPath: "",
                    method: "PUT",
                    fullApiPath: ""
                },
                restRepositoryInfo: {
                    method: "POST"
                },
                relationEventInfo: [],
                relationCommandInfo: [],
                trigger: "@PostPersist",
                fieldDescriptors: [],
                visibility: "public",
                rotateStatus: false
            };
        },
        
        createViewElement(node, position, elementId, boundedContext) {
            return {
                _type: "org.uengine.modeling.model.View",
                id: elementId,
                visibility: "public",
                name: node.name,
                oldName: "",
                displayName: "",
                namePascalCase: "",
                namePlural: "",
                aggregate: { id: "" },
                description: null,
                author: this.modelValue.author || "",
                boundedContext: { id: boundedContext ? boundedContext.id : "" },
                fieldDescriptors: [
                    {
                        _type: "org.uengine.model.FieldDescriptor",
                        name: "id",
                        className: "Long",
                        nameCamelCase: "id",
                        namePascalCase: "Id",
                        isKey: true
                    }
                ],
                queryParameters: [],
                queryOption: {
                    apiPath: "",
                    useDefaultUri: true,
                    multipleResult: false
                },
                controllerInfo: {
                    url: ""
                },
                elementView: {
                    _type: "org.uengine.modeling.model.View",
                    id: elementId,
                    x: position.x,
                    y: position.y,
                    width: 100,
                    height: 100,
                    style: "{}"
                },
                editingView: false,
                dataProjection: "cqrs",
                createRules: [
                    {
                        _type: "viewStoreRule",
                        operation: "CREATE",
                        when: null,
                        fieldMapping: [
                            {
                                viewField: null,
                                eventField: null,
                                operator: "="
                            }
                        ],
                        where: [
                            {
                                viewField: null,
                                eventField: null
                            }
                        ]
                    }
                ],
                updateRules: [
                    {
                        _type: "viewStoreRule",
                        operation: "UPDATE",
                        when: null,
                        fieldMapping: [
                            {
                                viewField: null,
                                eventField: null,
                                operator: "="
                            }
                        ],
                        where: [
                            {
                                viewField: null,
                                eventField: null
                            }
                        ]
                    }
                ],
                deleteRules: [
                    {
                        _type: "viewStoreRule",
                        operation: "DELETE",
                        when: null,
                        fieldMapping: [
                            {
                                viewField: null,
                                eventField: null
                            }
                        ],
                        where: [
                            {
                                viewField: null,
                                eventField: null
                            }
                        ]
                    }
                ],
                rotateStatus: false
            };
        },
        
        addElementToEventStorming(element) {
            // EventStormingModelCanvas에 직접 접근하여 요소 추가
            let canvas = this.$parent;
            while (canvas && !canvas.addElementAction) {
                canvas = canvas.$parent;
            }
            
            if (canvas && canvas.addElementAction) {
                canvas.addElementAction(element);
            } else {
                console.warn('EventStormingModelCanvas not found');
            }
        }
    }
};
</script>

<style scoped>
.embedded {
    position: absolute;
    width: 100%;
    height: 90%;
    left: 0;
    right: 0;
    overflow: hidden;
}

.site-map-viewer {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 600px;
    background: #f8f9fa;
    overflow: hidden; /* 전체 컨테이너에서 스크롤 방지 */
}

.site-map-viewer.embedded {
    position: absolute;
    width: 100%;
    height: 90%;
    left: 0;
    right: 0;
    overflow: hidden;
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

/* embedded 상태에서는 스크롤 비활성화 */
.site-map-viewer.embedded .site-map-container {
    overflow: hidden;
}

/* embedded 상태에서 site-map-tree 최적화 */
.site-map-viewer.embedded .site-map-tree {
    min-width: 100%;
    width: 100%;
    justify-content: flex-start;
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

/* 일반 상태에서는 스크롤 활성화 */
.site-map-viewer:not(.embedded) .site-map-container {
    overflow-x: auto; /* 가로 스크롤 활성화 */
    overflow-y: auto; /* 세로 스크롤 활성화 */
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

.root-nodes {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 40px;
    justify-content: center;
    align-items: flex-start;
}

.root-node {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.root-node.multiple-roots {
    margin-bottom: 20px;
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

/* Unmapped elements dialog styles */
.unmapped-list {
    max-height: 300px;
    overflow-y: auto;
}

.unmapped-item {
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #fafafa;
    transition: all 0.2s ease;
}

.unmapped-item:hover {
    background-color: #f5f5f5;
    border-color: #d0d0d0;
}

.item-name {
    font-weight: 500;
}

.bc-assignment {
    display: flex;
    align-items: center;
    margin-top: 4px;
}
</style>
