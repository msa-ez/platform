<template>
    <div class="site-map-node">
        <div class="node-content" :data-node-id="node.id" :data-node-type="node.type">
            <div class="node-title">
                <div class="node-parent-info" v-if="parentTitle">
                    <i class="fas fa-level-up-alt"></i>
                    <span>{{ parentTitle }}</span>
                </div>
                <input 
                    v-model="node.title" 
                    class="node-input title-input"
                    placeholder="페이지 제목"
                    @input="updateNode"
                />
            </div>
            <div class="node-description">
                <input 
                    v-model="node.description" 
                    class="node-input description-input"
                    placeholder="페이지 설명"
                    @input="updateNode"
                />
            </div>
            <div class="node-bounded-context" v-if="node.type !== 'root'">
                <div class="field-label">Bounded Context:</div>
                <select 
                    v-model="node.boundedContext"
                    @change="updateNode"
                >
                    <option value="">선택하세요</option>
                    <option 
                        v-for="bc in availableBoundedContexts" 
                        :key="typeof bc === 'string' ? bc : (bc.id || bc.title)"
                        :value="typeof bc === 'string' ? bc : bc.title"
                    >
                        {{ typeof bc === 'string' ? bc : bc.title }}
                    </option>
                </select>
            </div>
            <div class="node-ui-requirements" v-if="node.type !== 'root'">
                <div class="field-label">UI Requirements:</div>
                <textarea 
                    v-model="node.uiRequirements" 
                    class="node-textarea ui-requirements-textarea"
                    placeholder="UI 요구사항 (예: 테이블 레이아웃, 카드 형태, 폼 검증 등)"
                    @input="updateNode"
                    rows="3"
                ></textarea>
            </div>
            <div class="node-actions">
                <span class="child-count" v-if="node.children && node.children.length > 0">
                    {{ node.children.length }}개 하위
                </span>
                <button class="action-btn" @click="$emit('add-child', node.id)" title="하위 노드 추가">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="action-btn delete-btn" @click="$emit('delete-node', node.id)" title="노드 삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <!-- 하위 노드들 -->
        <div class="children-container" v-if="node.children && node.children.length > 0">
            <div class="children-wrapper">
                <div 
                    v-for="(child, index) in node.children" 
                    :key="child.id"
                    class="child-node"
                >
                    <SiteMapNode 
                        :node="child"
                        :parent-title="node.title"
                        :available-bounded-contexts="availableBoundedContexts"
                        @add-child="$emit('add-child', $event)"
                        @delete-node="$emit('delete-node', $event)"
                        @update-node="$emit('update-node', $event)"
                    />
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
        }
    },
    data() {
        return {
            updateTimeout: null
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

/* 모든 노드를 동일한 색상으로 통일 */
.node-content {
    border-color: #28a745 !important;
}

.node-content:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}

.node-title {
    margin-bottom: 8px;
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