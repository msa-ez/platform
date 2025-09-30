<template>
    <div class="site-map-node" :class="{ 'collapsed': isCollapsed, 'root': isRoot }" ref="nodeContainer">
        <div class="node-content" 
             :class="{ 
                 'home-page': isRoot,
                 'section-page': node.children && node.children.length > 0,
                 'content-page': !node.children || node.children.length === 0
             }"
             :data-node-id="node.id"
             ref="nodeContent">
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
                    :placeholder="isRoot ? $t('siteMap.node.siteTitle') : $t('siteMap.node.pageTitle')"
                    @input="updateNode"
                />
                <!-- 노드 삭제 버튼 (우측 상단 구석) -->
                <button class="node-delete-btn" @click="$emit('delete-node', node.id)" :title="$t('siteMap.node.deleteNode')" :disabled="isGenerating" v-if="!isRoot">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="node-url" v-if="node.url && !isRoot">
                <div class="field-label">{{ $t('siteMap.node.url') }}</div>
                <input 
                    v-model="node.url" 
                    :disabled="isGenerating"
                    class="node-input url-input"
                    :placeholder="$t('siteMap.node.urlPlaceholder')"
                    @input="updateNode"
                />
            </div>
            <div class="node-description">
                <input 
                    v-model="node.description" 
                    :disabled="isGenerating"
                    class="node-input description-input"
                    :placeholder="isRoot ? $t('siteMap.node.siteDescription') : $t('siteMap.node.pageDescription')"
                    @input="updateNode"
                />
            </div>
            
            <!-- Reference 정보 -->
            <div class="node-references" v-if="hasReferences">
                <div class="references-section">
                    <div class="reference-group" v-if="node.reference">
                        <div class="reference-label">
                            <i class="fas fa-link"></i>
                            {{ $t('siteMap.node.reference') }}
                        </div>
                        <div class="reference-tags">
                            <span 
                                class="reference-tag"
                                :class="getReferenceTypeClass(node.reference)"
                                :title="$t('siteMap.node.referenceTooltip', { reference: node.reference })"
                            >
                                {{ node.reference }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="node-actions">
                <span class="child-count" v-if="node.children && node.children.length > 0">
                    {{ $t('siteMap.node.childCount', { count: node.children.length }) }}
                </span>
                <!-- 추가 버튼 표시 -->
                <button class="action-btn" @click="$emit('add-child', node.id)" :title="isRoot ? '페이지 추가' : $t('siteMap.node.addChildNode')" :disabled="isGenerating">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        
        <!-- 하위 노드들 -->
        <div class="children-container" :class="{ 'root-node': isRoot }" v-if="node.children && node.children.length > 0 && !isCollapsed">
            <div class="children-wrapper">
                <div 
                    v-for="(child, index) in node.children" 
                    :key="child.id"
                    class="child-node"
                >
                    <!-- 페이지 그룹 (자식 노드가 있는 경우) -->
                    <div v-if="child.children && child.children.length > 0" class="page-group">
                        <div class="page-group-header">
                            <div class="page-group-title">
                                <i :class="getPageTypeIcon(child)" style="margin-right: 8px;"></i>
                                {{ child.title }}
                            </div>
                            <!-- 그룹 삭제 버튼 (우측 상단 구석) -->
                            <button class="group-delete-btn" @click="$emit('delete-node', child.id)" :title="$t('siteMap.node.deleteNode')" :disabled="isGenerating">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <div class="page-components">
                            <div 
                                v-for="component in child.children" 
                                :key="component.id"
                                class="component-node"
                            >
                                <div class="component-content">
                                    <div class="component-title">
                                        <button class="ui-icon-button" 
                                                @click.stop="openUIPanel(component.title)"
                                                :title="'UI 패널 열기: ' + component.title">
                                            <i :class="getPageTypeIcon(component)"></i>
                                        </button>
                                        <input 
                                            v-model="component.title" 
                                            class="component-input title-input"
                                            @input="updateNode"
                                            :placeholder="$t('siteMap.node.pageTitle')"
                                        />
                                    </div>
                                    <div class="component-description">
                                        <input 
                                            v-model="component.description" 
                                            class="component-input description-input"
                                            @input="updateNode"
                                            :placeholder="$t('siteMap.node.pageDescription')"
                                        />
                                    </div>
                                    <!-- 컴포넌트 삭제 버튼 (우측 상단 구석) -->
                                    <button class="component-delete-btn" @click="$emit('delete-node', component.id)" :title="$t('siteMap.node.deleteNode')" :disabled="isGenerating">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <!-- 그룹 하단에 컴포넌트 추가 버튼 -->
                            <div class="add-component-section">
                                <button class="add-component-btn" @click="$emit('add-child', child.id)" :title="child.title + '에 구성요소 추가'" :disabled="isGenerating">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- 단일 노드 (자식이 없는 경우) -->
                    <div v-else>
                        <SiteMapNode 
                            :isGenerating="isGenerating"
                            :node="child"
                            :parent-title="node.title"
                            :canvas="canvas"
                            @add-child="$emit('add-child', $event)"
                            @delete-node="$emit('delete-node', $event)"
                            @update-node="$emit('update-node', $event)"
                            @node-collapse-changed="$emit('node-collapse-changed', $event)"
                            @open-ui-panel="$emit('open-ui-panel', $event)"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 접힌 상태 표시 -->
        <div class="collapsed-preview" v-if="node.children && node.children.length > 0 && isCollapsed">
            <div class="collapsed-content">
                <div class="collapsed-header">
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
                        :class="{ 
                            'section-preview': child.children && child.children.length > 0,
                            'page-preview': !child.children || child.children.length === 0
                        }"
                    >
                        <i :class="getPageTypeIcon(child)"></i>
                        <span class="preview-title">{{ child.title }}</span>
                        <span class="preview-url" v-if="child.url">{{ child.url }}</span>
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
    name: 'SiteMapNode',
    props: {
        node: {
            type: Object,
            required: true
        },
        parentTitle: {
            type: String,
            default: ''
        },
        isGenerating: {
            type: Boolean,
            default: false
        },
        isRoot: {
            type: Boolean,
            default: false
        },
        canvas: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            isCollapsed: false,
            updateTimeout: null
        };
    },
    computed: {
        hasReferences() {
            // 페이지 레벨(children이 있는 경우)에서는 참조 정보를 표시하지 않음
            if (this.node.children && this.node.children.length > 0) {
                return false;
            }
            return this.node.reference && this.node.reference.trim() !== '';
        }
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
                    url: this.node.url,
                    description: this.node.description
                });
            }, 300); // 300ms 지연
        },
        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            // 접기/펼치기 상태 변경을 부모 컴포넌트에 알림
            this.$emit('node-collapse-changed', this.node.id, this.isCollapsed);
        },
        getPageTypeIcon(node) {
            if (node.children && node.children.length > 0) {
                return 'fas fa-folder';
            } else {
                return 'fas fa-file';
            }
        },
        
        getReferenceTypeClass(reference) {
            if (!reference) return '';
            // Command인지 ReadModel인지 구분 (일반적인 네이밍 패턴 기반)
            if (reference.includes('Command') || reference.includes('Create') || 
                reference.includes('Update') || reference.includes('Delete') ||
                reference.includes('Login') || reference.includes('Register')) {
                return 'command-tag';
            } else if (reference.includes('ReadModel') || reference.includes('View') || 
                      reference.includes('Search') || reference.includes('List') ||
                      reference.includes('Detail') || reference.includes('Profile')) {
                return 'readmodel-tag';
            }
            return 'reference-tag';
        },

        openUIPanel(nodeTitle) {
            if (!this.canvas || !this.canvas.elements) {
                console.warn('Canvas 또는 elements가 없습니다.');
                return;
            }

            // canvas의 elements에서 UI 타입이고 이름이 같은 요소를 찾기
            const uiElements = Object.values(this.canvas.elements).filter(element => {
                return element && 
                       element._type === 'org.uengine.modeling.model.UI' && 
                       element.name === nodeTitle+"UI";
            });

            if (uiElements.length === 0) {
                alert(`'${nodeTitle}UI'와 일치하는 UI 요소를 찾을 수 없습니다.`);
                return;
            }

            if (uiElements.length > 1) {
                console.warn(`'${nodeTitle}UI'와 일치하는 UI 요소가 ${uiElements.length}개 있습니다. 첫 번째 요소를 선택합니다.`);
            }

            const uiElement = uiElements[0];
            
            // UI 요소의 패널을 열기 위해 해당 요소의 openPanel 메서드 호출
            // 부모 컴포넌트를 통해 UI 요소에 접근
            this.$emit('open-ui-panel', uiElement);
        }

    }
};
</script>

<style scoped>
.site-map-node {
    position: relative;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.node-content {
    background: white;
    border: 2px solid #007bff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    position: relative;
    width: 300px;
    flex-shrink: 0;
}

.node-content:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}


.collapse-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.collapse-btn:hover {
    background: #f8f9fa;
    color: #007bff;
}

.collapse-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.node-title {
    margin-bottom: 12px;
    padding-right: 40px;
}

.node-parent-info {
    font-size: 11px;
    color: #6c757d;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.node-parent-info i {
    font-size: 10px;
}

.title-input {
    width: 100%;
    border: none;
    background: none;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
    padding: 4px 0;
    outline: none;
}

.title-input:focus {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 4px 8px;
}

.node-url {
    margin-bottom: 8px;
}

.field-label {
    font-size: 11px;
    color: #6c757d;
    font-weight: 500;
    margin-bottom: 4px;
}

.url-input {
    width: 100%;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    background: #f8f9fa;
}

.url-input:focus {
    outline: none;
    border-color: #007bff;
    background: white;
}

.node-description {
    margin-bottom: 12px;
}

.description-input {
    width: 100%;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 13px;
    resize: vertical;
    min-height: 40px;
    font-family: inherit;
}

.description-input:focus {
    outline: none;
    border-color: #007bff;
}

.node-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.child-count {
    font-size: 11px;
    color: #6c757d;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 10px;
    white-space: nowrap;
}

.action-btn {
    background: none;
    border: 1px solid #dee2e6;
    color: #6c757d;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
}

.action-btn:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.delete-btn:hover {
    background: #f8f9fa;
    border-color: #dc3545;
    color: #dc3545;
}

.children-wrapper {
    display: flex;
    gap: 80px;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    margin-top: 40px;
    padding: 20px 0;
}

/* 부모 노드에서 가로선으로 가는 세로선 */
.children-wrapper::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    width: 2px;
    height: 20px;
    background: #495057;
    transform: translateX(-50%);
}

/* 자식 노드들을 연결하는 가로선 */
.children-wrapper::after {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 2px;
    background: #495057;
}

/* 페이지 그룹 컨테이너 */
.page-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 200px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    border: 2px solid #e9ecef;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 페이지 그룹으로 가는 세로선 */
.page-group::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    width: 2px;
    height: 40px;
    background: #495057;
    transform: translateX(-50%);
}


/* 그룹 우측 상단 추가 버튼 */
.add-component-corner-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.add-component-corner-btn:hover:not(:disabled) {
    background: #0056b3;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.add-component-corner-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

/* 페이지 그룹 헤더 */
.page-group-header {
    font-weight: bold;
    font-size: 16px;
    color: #495057;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #dee2e6;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-group-title {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

/* 페이지 구성요소들 */
.page-components {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

/* 구성요소 노드 */
.component-node {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.component-node:hover {
    border-color: #007bff;
    box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
}

/* 구성요소 액션 버튼들 */
.component-actions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    justify-content: flex-end;
}

.action-btn.small {
    padding: 4px 6px;
    font-size: 10px;
    min-width: auto;
}


/* 구성요소 내용 */
.component-content {
    padding: 0;
}

.component-title {
    font-weight: 600;
    font-size: 14px;
    color: #495057;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
}

.component-description {
    font-size: 12px;
    color: #6c757d;
    line-height: 1.4;
}

/* 구성요소 입력 필드 */
.component-input {
    background: transparent;
    border: none;
    outline: none;
    font-size: inherit;
    color: inherit;
    width: 100%;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.component-input:focus {
    background: white;
    border: 1px solid #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.title-input {
    font-weight: 600;
    font-size: 14px;
    color: #495057;
}

.description-input {
    font-size: 12px;
    color: #6c757d;
    margin-top: 4px;
}


.child-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 200px;
}





/* 접힌 상태 표시 */
.collapsed-preview {
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

.collapsed-preview-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
}

.preview-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    font-size: 12px;
}

.preview-item i {
    color: #6c757d;
    font-size: 10px;
}

.preview-title {
    font-weight: 500;
    color: #212529;
}

.preview-url {
    font-size: 10px;
    color: #6c757d;
    font-family: 'Courier New', monospace;
    margin-left: 4px;
}

.preview-more {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 11px;
    color: #6c757d;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    .node-content {
        min-width: 250px;
        padding: 12px;
    }
    
    .children-wrapper {
        gap: 20px;
    }
    
    .node-actions {
        flex-direction: column;
        gap: 4px;
    }
    
    .action-btn {
        width: 24px;
        height: 24px;
    }
}

/* Command/ReadModel 참조 정보 스타일 */
.node-references {
    margin-top: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.references-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.reference-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.reference-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.reference-label i {
    font-size: 10px;
}

.reference-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.reference-tag {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    cursor: help;
    transition: all 0.2s ease;
}

.command-tag {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #bbdefb;
}

.command-tag:hover {
    background: #bbdefb;
    color: #0d47a1;
}

.readmodel-tag {
    background: #f3e5f5;
    color: #7b1fa2;
    border: 1px solid #e1bee7;
}

.readmodel-tag:hover {
    background: #e1bee7;
    color: #4a148c;
}

/* 반응형에서 참조 정보 */
@media (max-width: 768px) {
    .node-references {
        margin-top: 8px;
        padding: 6px;
    }
    
    .reference-tags {
        gap: 3px;
    }
    
    .reference-tag {
        font-size: 9px;
        padding: 1px 4px;
    }
}

/* 노드 삭제 버튼 (우측 상단 구석) */
.node-delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #6c757d;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.7;
    z-index: 10;
}

.node-delete-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    color: #dc3545;
}

.node-delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
}

/* 그룹 삭제 버튼 */
.group-delete-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: #6c757d;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.7;
    z-index: 10;
}

.group-delete-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    color: #dc3545;
}

.group-delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
}

/* 컴포넌트 삭제 버튼 */
.component-delete-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #6c757d;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.7;
    z-index: 10;
}

.component-delete-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    color: #dc3545;
}

.component-delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
}

/* 컴포넌트 추가 섹션 */
.add-component-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #dee2e6;
    text-align: center;
}

.add-component-btn {
    background: #007bff;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.add-component-btn:hover {
    background: #0056b3;
    transform: scale(1.1);
}

.add-component-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
}

/* 페이지 그룹 헤더 위치 조정 */
.page-group-header {
    position: relative;
    padding-right: 30px; /* 삭제 버튼을 위한 공간 확보 */
}

/* 컴포넌트 콘텐츠 위치 조정 */
.component-content {
    position: relative;
    padding-right: 25px; /* 삭제 버튼을 위한 공간 확보 */
}

/* 노드 타이틀 위치 조정 */
.node-title {
    position: relative;
    padding-right: 30px; /* 삭제 버튼을 위한 공간 확보 */
}

/* UI 아이콘 버튼 스타일 */
.ui-icon-button {
    margin-right: 8px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 6px;
    border-radius: 4px;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 32px;
    color: #6c757d;
    transition: all 0.2s ease;
    vertical-align: middle;
}

.ui-icon-button:hover {
    color: #007bff !important;
    background-color: rgba(0, 123, 255, 0.1);
    transform: scale(1.1);
}

.ui-icon-button:active {
    transform: scale(0.95);
    color: #0056b3 !important;
}

.ui-icon-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
}
</style>