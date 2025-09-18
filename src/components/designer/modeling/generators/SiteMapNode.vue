<template>
    <div class="site-map-node" :class="{ 'collapsed': isCollapsed, 'root': isRoot }">
        <div class="node-content" 
             :class="{ 
                 'group-node': !node.functionType || node.functionType === '', 
                 'function-node': node.functionType && node.functionType !== ''
             }"
             :data-node-id="node.id" 
             :data-node-type="node.type">
            <!-- 접기/펼치기 버튼 (우측) -->
            <button 
                v-if="node.children && node.children.length > 0"
                class="collapse-btn" 
                @click="toggleCollapse" 
                :title="isCollapsed ? $t('siteMap.node.expand') : $t('siteMap.node.collapse')"
                :disabled="isGenerating"
                :class="{ 'collapsed': isCollapsed }"
            >
                <span class="arrow-icon">{{ isCollapsed ? '▶' : '▼' }}</span>
            </button>
            
            <div class="node-title">
                <div class="node-parent-info" v-if="parentTitle && parentTitle.trim() !== ''">
                    <i class="fas fa-level-up-alt"></i>
                    <span>{{ parentTitle }}</span>
                </div>
                <input 
                    v-model="node.title" 
                    :disabled="isGenerating"
                    class="node-input title-input"
                    :placeholder="$t('siteMap.node.pageTitle')"
                    @input="updateNode"
                />
            </div>
            <div class="node-description">
                <input 
                    v-model="node.description" 
                    :disabled="isGenerating"
                    class="node-input description-input"
                    :placeholder="$t('siteMap.node.pageDescription')"
                    @input="updateNode"
                />
            </div>
            <div class="node-name" v-if="node.type !== 'root' && node.functionType && node.functionType !== ''">
                <div class="field-label">{{ $t('siteMap.node.name') }}</div>
                <input 
                    v-model="node.name" 
                    :disabled="isGenerating"
                    class="node-input name-input"
                    :placeholder="$t('siteMap.node.namePlaceholder')"
                    @input="updateNode"
                />
            </div>
            <div class="node-bounded-context" v-if="node.type !== 'root'">
                <div class="field-label">{{ $t('siteMap.node.boundedContext') }}</div>
                <select 
                    v-model="node.boundedContext"
                    :disabled="isGenerating"
                    @change="updateNode"
                >
                    <option value="">{{ $t('siteMap.node.selectBoundedContext') }}</option>
                    <option 
                        v-for="bc in availableBoundedContexts" 
                        :key="typeof bc === 'string' ? bc : (bc.id || bc.title || bc.name)"
                        :value="typeof bc === 'string' ? bc : (bc.title || bc.name)"
                        :disabled="isGenerating"
                    >
                        {{ typeof bc === 'string' ? bc : (bc.displayName || bc.title || bc.name) }}
                    </option>
                </select>
            </div>
            <div class="node-function-type" v-if="node.type !== 'root'">
                <div class="field-label">{{ $t('siteMap.node.functionType') }}</div>
                <select 
                    v-model="node.functionType"
                    :disabled="isGenerating"
                    @change="updateNode"
                >
                    <option value="">{{ $t('siteMap.node.functionTypeCategory') }}</option>
                    <option value="view">{{ $t('siteMap.node.functionTypeView') }}</option>
                    <option value="command">{{ $t('siteMap.node.functionTypeCommand') }}</option>
                </select>
            </div>
            <div class="node-ui-requirements" v-if="node.type !== 'root' && node.functionType && node.functionType !== ''">
                <div class="field-label">{{ $t('siteMap.node.uiRequirements') }}</div>
                <textarea 
                    v-model="node.uiRequirements" 
                    :disabled="isGenerating"
                    class="node-textarea ui-requirements-textarea"
                    :placeholder="$t('siteMap.node.uiRequirementsPlaceholder')"
                    @input="updateNode"
                    rows="3"
                ></textarea>
            </div>
            <div class="node-actions">
                <span class="child-count" v-if="node.children && node.children.length > 0">
                    {{ $t('siteMap.node.childCount', { count: node.children.length }) }}
                </span>
                <button class="action-btn" @click="$emit('add-child', node.id)" :title="$t('siteMap.node.addChildNode')" :disabled="isGenerating">
                    <i class="fas fa-plus"></i>
                </button>
                <!-- 루트 노드가 아닐 때만 삭제 버튼 표시 -->
                <button v-if="!isRoot" class="action-btn delete-btn" @click="$emit('delete-node', node.id)" :title="$t('siteMap.node.deleteNode')" :disabled="isGenerating">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <!-- 하위 노드들 -->
        <div class="children-container" v-if="node.children && node.children.length > 0 && !isCollapsed">
            <div class="children-wrapper">
                <div 
                    v-for="(child, index) in node.children" 
                    :key="child.id"
                    class="child-node"
                >
                    <SiteMapNode 
                        :isGenerating="isGenerating"
                        :node="child"
                        :parent-title="node.title"
                        :available-bounded-contexts="availableBoundedContexts"
                        @add-child="$emit('add-child', $event)"
                        @delete-node="$emit('delete-node', $event)"
                        @update-node="$emit('update-node', $event)"
                        @node-collapse-changed="$emit('node-collapse-changed', $event)"
                    />
                </div>
            </div>
        </div>
        
        <!-- 접힌 상태 표시 -->
        <div class="collapsed-preview" v-if="node.children && node.children.length > 0 && isCollapsed">
            <div class="collapsed-content">
                <div class="collapsed-header">
                    <i class="fas fa-chevron-right"></i>
                    <span class="collapsed-text">{{ node.children.length }}개 하위 노드 접힘</span>
                    <button class="expand-btn" @click="toggleCollapse" :disabled="isGenerating">
                        <i class="fas fa-chevron-down"></i> 펼치기
                    </button>
                </div>
                <div class="collapsed-preview-list">
                    <div 
                        v-for="(child, index) in node.children.slice(0, 3)" 
                        :key="child.id"
                        class="preview-item"
                        :class="{ 'group-preview': !child.functionType || child.functionType === '' }"
                    >
                        <i :class="(!child.functionType || child.functionType === '') ? 'fas fa-folder' : 'fas fa-circle'"></i>
                        <span class="preview-title">{{ child.title }}</span>
                    </div>
                    <div v-if="node.children.length > 3" class="preview-more">
                        <i class="fas fa-ellipsis-h"></i>
                        <span>외 {{ node.children.length - 3 }}개</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SiteMapNode",
    props: {
        node: {
            type: Object,
            required: true
        },
        parentTitle: {
            type: String,
            default: ''
        },
        availableBoundedContexts: {
            type: Array,
            default: () => []
        },
        isGenerating: {
            type: Boolean,
            default: false
        },
        isRoot: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            updateTimeout: null,
            isCollapsed: false
        };
    },
    
    methods: {
        updateNode() {
            // 디바운싱으로 성능 개선
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            
            this.updateTimeout = setTimeout(() => {
                this.$emit('update-node', this.node.id, {
                    title: this.node.title,
                    description: this.node.description,
                    boundedContext: this.node.boundedContext,
                    uiRequirements: this.node.uiRequirements
                });
            }, 300); // 300ms 지연
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            // 접기/펼치기 상태 변경을 부모 컴포넌트에 알림
            this.$emit('node-collapse-changed', this.node.id, this.isCollapsed);
        }
    }
};
</script>

<style scoped>
.site-map-node {
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

/* 루트 노드와 일반 노드 구분 */
.node-content {
    border-color: #28a745 !important;
}

/* 루트 노드 스타일 */
.site-map-node.root .node-content {
    border-color: #007bff !important;
    border-width: 3px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.site-map-node.root .node-content:hover {
    border-color: #0056b3 !important;
    box-shadow: 0 8px 25px rgba(0,123,255,0.15);
}

/* 그룹 노드 스타일 */
.node-content.group-node {
    border-color: #6f42c1 !important;
    background: linear-gradient(135deg, #f8f6ff 0%, #ffffff 100%);
    border-style: dashed;
}

.node-content.group-node:hover {
    border-color: #5a32a3 !important;
    box-shadow: 0 5px 15px rgba(111, 66, 193, 0.15);
}

/* 기능 노드 스타일 */
.node-content.function-node {
    border-color: #28a745 !important;
    background: white;
    border-style: solid;
}

.node-content.function-node:hover {
    border-color: #1e7e34 !important;
    box-shadow: 0 5px 15px rgba(40, 167, 69, 0.15);
}

.node-content:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}

.node-title {
    margin-bottom: 8px;
}

.title-input {
    width: 100%;
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
    font-size: 10px;
    color: #6c757d;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 10px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.node-parent-info i {
    font-size: 8px;
}

.node-description {
    margin-bottom: 8px;
}

.node-bounded-context,
.node-ui-requirements {
    margin-bottom: 8px;
}

.field-label {
    font-size: 10px;
    color: #495057;
    font-weight: 500;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.node-input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    transition: border-color 0.2s ease;
}

.title-input {
    font-weight: 600;
    font-size: 14px;
}

.description-input {
    font-size: 11px;
    color: #666;
}

.bounded-context-input {
    font-size: 11px;
    color: #6f42c1;
    font-weight: 500;
}

.node-textarea {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 11px;
    transition: border-color 0.2s ease;
    font-family: inherit;
    line-height: 1.4;
}

.ui-requirements-textarea {
    font-size: 11px;
    color: #007bff;
    font-weight: 500;
    resize: none; /* 텍스트 영역 크기 조절 방지 */
}

.node-input:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40,167,69,0.25);
}

.node-textarea:focus {
    outline: none;
    border-color: #28a745;
    box-shadow: 0 0 0 2px rgba(40,167,69,0.25);
}

.node-actions {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
}

.child-count {
    font-size: 10px;
    color: #6c757d;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 10px;
    margin-right: 4px;
}

.action-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    transition: all 0.2s ease;
}

.action-btn:hover {
    background: #28a745;
    color: white;
}

.delete-btn:hover {
    background: #dc3545;
}

.children-container {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

/* 상위 노드에서 하위 노드로 가는 연결선 */
.children-container::before {
    content: '';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 25px;
    background: #28a745;
}

.children-line {
    width: 2px;
    height: 25px;
    background: #28a745;
    margin-bottom: 15px;
    position: relative;
}

.children-line::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 2px;
    background: #28a745;
}

.children-line::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 15px;
    height: 2px;
    background: #28a745;
}

.children-wrapper {
    display: flex;
    gap: 50px; /* 간격 증가 */
    flex-wrap: nowrap; /* 줄바꿈 없이 가로로 배치 */
    justify-content: flex-start; /* 왼쪽부터 배치 */
    min-height: 80px; /* 최소 높이 보장 */
    align-items: flex-start; /* 상단 정렬로 변경 */
    padding: 8px 0; /* 세로 패딩만 유지 */
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
    background: #28a745;
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
    height: 15px;
    background: #28a745;
}

/* 접힌/펼쳐진 상태에 따른 노드 스타일 */
.site-map-node.collapsed .node-content {
    border-color: #6c757d !important;
    background: #f8f9fa;
    opacity: 0.8;
}

.site-map-node.collapsed .node-content:hover {
    border-color: #495057 !important;
    background: #e9ecef;
    opacity: 1;
}

/* 접힌 상태에서 그룹 노드 구분 */
.site-map-node.collapsed .node-content.group-node {
    border-color: #8e7cc3 !important;
    background: #f0edff;
    border-style: dashed;
}

.site-map-node.collapsed .node-content.group-node:hover {
    border-color: #6f42c1 !important;
    background: #e6dfff;
    opacity: 1;
}

/* 노드 상태 표시기 */
.node-status-indicator {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 15;
}

.children-count {
    background: #007bff;
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* 접기/펼치기 버튼 스타일 개선 */
.collapse-btn.collapsed {
    border-color: #6c757d;
    color: #6c757d;
    background: #f8f9fa;
}

.collapse-btn.collapsed:hover {
    border-color: #495057;
    background: #495057;
    color: white;
}

/* 접힌 상태 미리보기 */
.collapsed-preview {
    margin-top: 15px;
    display: flex;
    justify-content: center;
}

.collapsed-content {
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 15px;
    padding: 12px 16px;
    min-width: 200px;
    text-align: center;
    transition: all 0.2s ease;
}

.collapsed-content:hover {
    border-color: #6c757d;
    background: #e9ecef;
}

.collapsed-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #6c757d;
    font-size: 12px;
    font-weight: 500;
}

.collapsed-header i {
    color: #6c757d;
    font-size: 10px;
}

.expand-btn {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    transition: all 0.2s ease;
    margin-left: 8px;
}

.expand-btn:hover {
    background: #007bff;
    color: white;
}

.expand-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 접힌 상태 미리보기 리스트 */
.collapsed-preview-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    text-align: left;
}

.preview-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #495057;
    width: 100%;
}

.preview-item i {
    font-size: 8px;
    color: #6c757d;
}

.preview-item.group-preview i {
    color: #6f42c1;
    font-size: 10px;
}

.preview-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.preview-more {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #6c757d;
    font-style: italic;
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid #dee2e6;
    width: 100%;
}

.preview-more i {
    font-size: 8px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .children-wrapper {
        gap: 20px;
    }
    
    .node-content {
        min-width: 240px;
        padding: 12px;
    }
    
    .action-btn {
        width: 24px;
        height: 24px;
        font-size: 10px;
    }
}
</style> 