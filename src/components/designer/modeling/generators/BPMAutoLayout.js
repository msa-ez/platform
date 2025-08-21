/**
 * 그래프 관련 코어 클래스
 * 데이터 구조와 레이아웃 알고리즘을 포함합니다.
 */

/**
 * 그래프 데이터 구조 클래스
 * 노드와 엣지를 관리하며 그룹화 기능을 제공합니다.
 */
class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.groups = [];
        this.groupOrder = [];
        this.childGraphs = new Map();
    }

    addNode(id, label) {
        this.nodes.push({
            id,
            label,
            x: 0,
            y: 0,
            layer: 0,
            order: 0,
            group: null, // 기본값: 그룹에 속하지 않음
            width: 0,    // 노드의 너비
            height: 0    // 노드의 높이
        });
        return this;
    }

    addEdge(source, target) {
        this.edges.push({
            source,
            target
        });
        return this;
    }

    getNode(id) {
        return this.nodes.find(node => node.id === id);
    }

    getNodeIndex(id) {
        return this.nodes.findIndex(node => node.id === id);
    }

    // 노드에서 나가는 모든 엣지 가져오기
    getOutgoingEdges(nodeId) {
        return this.edges.filter(edge => edge.source === nodeId);
    }

    // 노드로 들어오는 모든 엣지 가져오기
    getIncomingEdges(nodeId) {
        return this.edges.filter(edge => edge.target === nodeId);
    }
    
    // 새 그룹을 생성하고 노드 추가
    createGroup(groupId, nodeIds) {
        // 노드에 그룹 속성 설정
        nodeIds.forEach(nodeId => {
            const node = this.getNode(nodeId);
            if (node) {
                node.group = groupId;
            }
        });
        
        // 그룹 정보 추가
        this.groups.push({
            id: groupId,
            nodes: nodeIds,
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0
        });
        
        // 위치 기반으로 groupOrder에 추가 (정렬된 상태 유지)
        // 일단 새 그룹을 추가하고, 위치에 따라 그룹 순서를 재정렬
        this.groupOrder.push(groupId);
        
        // 가로/세로 레이아웃 모드 확인 (horizontal 값은 SugiyamaLayout에서 참조)
        const isHorizontalLayout = window.isHorizontalLayout || false;
        
        // 그룹의 평균 위치 계산을 위한 함수
        const getGroupAveragePosition = (gId) => {
            const nodesInGroup = this.getNodesInGroup(gId);
            if (!nodesInGroup || nodesInGroup.length === 0) return { x: 0, y: 0 };
            
            // 그룹 내 모든 노드의 평균 위치 계산
            let sumX = 0, sumY = 0;
            nodesInGroup.forEach(node => {
                sumX += node.x || 0;
                sumY += node.y || 0;
            });
            
            return {
                x: sumX / nodesInGroup.length,
                y: sumY / nodesInGroup.length
            };
        };
        
        // 그룹 ID 배열을 위치 기준으로 재정렬
        this.groupOrder.sort((a, b) => {
            const posA = getGroupAveragePosition(a);
            const posB = getGroupAveragePosition(b);
            
            // 가로 모드일 경우 y좌표(위에서 아래로) 기준 정렬
            if (isHorizontalLayout) {
                return posA.y - posB.y;  // y값이 작은 것(위쪽)이 먼저
            } 
            // 세로 모드일 경우 x좌표(왼쪽에서 오른쪽으로) 기준 정렬
            else {
                return posA.x - posB.x;  // x값이 작은 것(왼쪽)이 먼저
            }
        });

        return this;
    }
    
    // 특정 그룹에 속한 노드 가져오기
    getNodesInGroup(groupId) {
        return this.nodes.filter(node => node.group === groupId);
    }
    
    // ID로 그룹 가져오기
    getGroup(groupId) {
        return this.groups.find(group => group.id === groupId);
    }
}

/**
 * 스기야마(Sugiyama) 레이아웃 알고리즘 클래스
 * 계층적 그래프 레이아웃을 생성합니다.
 */
class SugiyamaLayout {
    constructor(graph) {
        this.graph = graph;
        this.layers = [];
    }

    // 단계 1: 노드를 계층에 할당
    assignLayers() {
        // 계층 초기화
        this.graph.nodes.forEach(node => { node.layer = 0; });
        
        let assigned = new Set();
        let queue = [];
        
        // 루트 노드 찾기 (들어오는 간선이 없는 노드)
        this.graph.nodes.forEach(node => {
            if (this.graph.getIncomingEdges(node.id).length === 0) {
                queue.push(node.id);
                assigned.add(node.id);
                node.layer = 0;
            }
        });
        
        // BFS로 계층 할당
        while (queue.length > 0) {
            const currentId = queue.shift();
            const currentNode = this.graph.getNode(currentId);
            
            this.graph.getOutgoingEdges(currentId).forEach(edge => {
                const targetNode = this.graph.getNode(edge.target);
                targetNode.layer = Math.max(targetNode.layer, currentNode.layer + 1);
                
                if (!assigned.has(edge.target)) {
                    queue.push(edge.target);
                    assigned.add(edge.target);
                }
            });
        }
        
        // 노드를 계층 배열로 구성
        this.layers = [];
        let maxLayer = 0;
        
        this.graph.nodes.forEach(node => {
            maxLayer = Math.max(maxLayer, node.layer);
        });
        
        for (let i = 0; i <= maxLayer; i++) {
            this.layers[i] = this.graph.nodes.filter(node => node.layer === i);
        }
        
        return this;
    }
    
    // 단계 2: 계층 내 노드 순서 최적화 (교차 최소화)
    minimizeCrossings() {
        for (let i = 1; i < this.layers.length; i++) {
            this.orderLayer(i);
        }
        
        // 추가 단계: 같은 그룹의 노드가 계층 내에서 인접하도록 보장
        this.ensureGroupsAdjacentInLayers();
        
        return this;
    }
    
    // 같은 그룹의 노드가 각 계층에서 인접하도록 보장
    ensureGroupsAdjacentInLayers() {
        // 각 계층에 대해
        for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
            const layer = this.layers[layerIndex];
            
            // 노드를 그룹별로 분류
            const groupedNodes = {};
            layer.forEach(node => {
                if (node.group !== null) {
                    if (!groupedNodes[node.group]) {
                        groupedNodes[node.group] = [];
                    }
                    groupedNodes[node.group].push(node);
                }
            });
            
            // 계층의 노드 순서를 재조정하여 그룹화된 노드를 인접하게 유지
            if (Object.keys(groupedNodes).length > 0) {
                // 먼저 그룹에 속하지 않은 노드의 위치 할당
                let currentPos = 0;
                const newOrder = [];
                
                // 그룹에 속하지 않은 노드 추가
                layer.filter(node => node.group === null).forEach(node => {
                    node.order = currentPos++;
                    newOrder.push(node);
                });
                
                // 그룹화된 노드 추가 (인접성 보장)
                for (const groupId in groupedNodes) {
                    const groupNodes = groupedNodes[groupId];
                    groupNodes.sort((a, b) => a.barycenter - b.barycenter);
                    
                    // 연속적인 순서 할당
                    groupNodes.forEach(node => {
                        node.order = currentPos++;
                        newOrder.push(node);
                    });
                }
                
                // 현재 계층을 새 순서로 대체
                this.layers[layerIndex] = newOrder;
            }
        }
    }
    
    // 계층 내 노드 순서 최적화
    orderLayer(layerIndex) {
        if (layerIndex <= 0 || layerIndex >= this.layers.length) return;
        
        const currentLayer = this.layers[layerIndex];
        const prevLayer = this.layers[layerIndex - 1];
        
        // 간단한 순서 지정: 이전 계층의 연결된 노드 기반 무게중심(barycenter) 계산
        currentLayer.forEach(node => {
            const incomingEdges = this.graph.getIncomingEdges(node.id);
            if (incomingEdges.length === 0) {
                node.barycenter = 0;
                return;
            }
            
            let sum = 0;
            incomingEdges.forEach(edge => {
                const sourceNode = this.graph.getNode(edge.source);
                const sourceIndex = prevLayer.findIndex(n => n.id === sourceNode.id);
                if (sourceIndex >= 0) {
                    sum += sourceIndex;
                }
            });
            
            node.barycenter = sum / incomingEdges.length;
        });
        
        // 무게중심 값으로 계층 정렬
        currentLayer.sort((a, b) => a.barycenter - b.barycenter);
        
        // 계층 내 순서 업데이트
        currentLayer.forEach((node, index) => {
            node.order = index;
        });
    }
    
    // 단계 3: x, y 좌표 할당
    assignCoordinates() {
        const defaultNodeWidth = 100;
        const defaultNodeHeight = 40;
        const layerHeight = 150;
        const horizontalSpacing = 20;
        const minNodeMargin = 10; // 노드와 레인 경계 사이의 최소 여백
        
        console.log(`[DEBUG_LAYOUT] 레이아웃 시작 - 총 ${this.layers.length}개 레이어, ${this.graph.nodes.length}개 노드`);
        
        // 그룹 경계 미리 계산 및 초기화
        this.initializeGroupBoundaries();

        // 그룹 순서에 따라 수평 위치 배치
        const groupOrderMap = {};
        this.graph.groupOrder.forEach((groupId, index) => {
            groupOrderMap[groupId] = index;
        });

        // 각 그룹의 수평 위치 범위 계산
        const groupHorizontalRanges = this.calculateGroupHorizontalRanges(0, 0);
        
        // 레인 경계 정보 로그 [DEBUG_LANE_INFO]
        console.log('[DEBUG_LANE_INFO] 레인 경계 정보:');
        for (const groupId in groupHorizontalRanges) {
            const range = groupHorizontalRanges[groupId];
            console.log(`  - 레인 ID=${groupId}: 좌측=${range.minX}, 우측=${range.maxX}, 너비=${range.maxX - range.minX}`);
        }

        // 레이어별 노드 배치
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            
            console.log(`[DEBUG_LAYER] 레이어 ${i} 처리 중: ${layer.length}개 노드`);
            
            // 그룹별로 노드 분류
            const nodesPerGroup = {};
            layer.forEach(node => {
                if (!nodesPerGroup[node.group]) {
                    nodesPerGroup[node.group] = [];
                }
                nodesPerGroup[node.group].push(node);
            });
            
            // 각 그룹 내에서 노드 배치
            for (const groupId in nodesPerGroup) {
                const groupNodes = nodesPerGroup[groupId];
                const groupRange = groupHorizontalRanges[groupId];
                
                if (!groupRange) {
                    console.log(`[DEBUG_ERROR] 그룹 ID=${groupId}에 대한 범위 정보 없음!`);
                    continue;
                }
                
                // 각 노드의 크기 확인 및 조정
                groupNodes.forEach(node => {
                    const originalWidth = node.width;
                    console.log(`[DEBUG_NODE_SIZE] 노드 크기 통일: ID=${node.id}, 원래 너비=${originalWidth || 'undefined'}, 새 너비=${node.width}`);
                });
                
                // 각 노드의 크기를 고려한 총 필요 너비 계산
                const totalNodesWidth = groupNodes.length * defaultNodeWidth;
                const totalSpacing = horizontalSpacing * (groupNodes.length - 1);
                
                // 공간이 부족하면 간격 조절
                let actualSpacing = horizontalSpacing;
                const availableWidth = groupRange.maxX - groupRange.minX - (2 * minNodeMargin);
                if (totalNodesWidth + totalSpacing > availableWidth) {
                    actualSpacing = Math.max(5, (availableWidth - totalNodesWidth) / (groupNodes.length - 1 || 1));
                    console.log(`[DEBUG_SPACING] 노드 간격 조정: 그룹=${groupId}, 원래 간격=${horizontalSpacing}, 새 간격=${actualSpacing.toFixed(1)}`);
                }
                
                // 그룹 내 시작 X 위치 계산 (좌측 정렬)
                let startX = groupRange.minX + minNodeMargin;
                
                // 시작 위치가 레인 경계 내에 있는지 확인
                const originalStartX = startX;
                startX = Math.max(groupRange.minX + minNodeMargin, startX);
                if (originalStartX !== startX) {
                    console.log(`[DEBUG_START_POS] 시작 위치 조정: 그룹=${groupId}, 원래=${originalStartX.toFixed(1)}, 새 위치=${startX.toFixed(1)}`);
                }
                
                let currentX = startX;
                
                // 노드 순서대로 배치
                groupNodes.sort((a, b) => a.order - b.order);
                
                console.log(`[DEBUG_NODE_PLACEMENT] 그룹=${groupId}, 레이어=${i}, 노드 배치 시작: ${groupNodes.length}개 노드`);
                
                groupNodes.forEach((node, idx) => {
                    const width = defaultNodeWidth;
                    const height = node.height || defaultNodeHeight;
                    
                    // 노드가 레인 경계를 벗어나지 않도록 조정
                    let nodeX = currentX + width / 2;
                    
                    // 원래 계산된 위치 기록
                    const originalX = nodeX;
                    
                    // 왼쪽 경계 체크
                    const leftBound = groupRange.minX + minNodeMargin;
                    if (nodeX - width/2 < leftBound) {
                        nodeX = leftBound + width/2;
                    }
                    
                    // 오른쪽 경계 체크
                    const rightBound = groupRange.maxX - minNodeMargin;
                    if (nodeX + width/2 > rightBound) {
                        nodeX = rightBound - width/2;
                    }
                    
                    // 위치가 조정된 경우 로그
                    if (originalX !== nodeX) {
                        console.log(`[DEBUG_NODE_ADJUST] 노드 위치 조정: ID=${node.id}, 원래=${originalX.toFixed(1)}, 조정=${nodeX.toFixed(1)}`);
                    }
                    
                    node.x = nodeX;
                    node.y = i * layerHeight + 40;
                    
                    console.log(`[DEBUG_NODE_FINAL] 노드 최종 위치: ID=${node.id}, x=${node.x.toFixed(1)}, y=${node.y}, 레인=${node.group}`);
                    
                    // 다음 노드 위치 계산
                    currentX = nodeX + width/2 + actualSpacing;
                });

                console.log(`[DEBUG_GROUP_SUMMARY] 그룹 ${groupId} 노드 배치 완료: 시작X=${startX.toFixed(1)}, 범위=[${groupRange.minX}-${groupRange.maxX}]`);
            }
        }
        
        // 그룹 경계 최종 업데이트
        this.updateGroupBoundaries(layerHeight);
        
        // 노드 위치 최종 확인 [DEBUG_FINAL_CHECK]
        console.log('[DEBUG_FINAL_CHECK] 노드 위치와 그룹 경계 최종 확인:');
        this.graph.nodes.forEach(node => {
            if (!node.group || !node.width) return;
            
            const group = this.graph.getGroup(node.group);
            if (!group) return;
            
            const nodeLeft = node.x - node.width/2;
            const nodeRight = node.x + node.width/2;
            const isOutOfBounds = nodeLeft < group.minX || nodeRight > group.maxX;
            
            console.log(`  - 노드: ID=${node.id}, Label=${node.label}, 위치=${node.x.toFixed(1)}, 범위=[${nodeLeft.toFixed(1)}-${nodeRight.toFixed(1)}]`);
            console.log(`    그룹: ID=${node.group}, 범위=[${group.minX.toFixed(1)}-${group.maxX.toFixed(1)}]`);
            console.log(`    상태: ${isOutOfBounds ? '경계 이탈!' : '정상'}`);
        });
        
        return this;
    }
    
    // 그룹의 수평 위치 범위 계산
    calculateGroupHorizontalRanges(totalWidth, spacing) {
        const ranges = {};
        const groupCount = this.graph.groupOrder.length;
        
        if (groupCount === 0) return ranges;
        
        // 고정된 총 너비 대신 동적으로 계산
        let calculatedTotalWidth = 0;
        
        // 각 그룹별 레이어당 노드 수 계산 및 최대 밀도 파악
        const groupLayerDensity = {};
        
        this.graph.groupOrder.forEach(groupId => {
            const nodesInGroup = this.graph.getNodesInGroup(groupId);
            
            // 그룹별 레이어당 노드 수 파악
            const layerCounts = {};
            let maxNodesInLayer = 0;
            
            nodesInGroup.forEach(node => {
                const layer = node.layer || 0;
                if (!layerCounts[layer]) layerCounts[layer] = 0;
                layerCounts[layer]++;
                
                // 레이어별 최대 노드 수 업데이트
                maxNodesInLayer = Math.max(maxNodesInLayer, layerCounts[layer]);
            });
            
            groupLayerDensity[groupId] = {
                layerCounts,
                maxNodesInLayer
            };
            
            console.log(`[DEBUG_DENSITY] 그룹=${groupId}, 최대 레이어 밀도=${maxNodesInLayer}개 노드`);
        });
        
        // 각 그룹별 노드의 최대 X 좌표를 찾아 총 너비 계산
        this.graph.groupOrder.forEach(groupId => {
            const nodesInGroup = this.graph.getNodesInGroup(groupId);
            
            if (nodesInGroup.length > 0) {
                // 그룹 내 최대/최소 X 좌표 찾기
                let minNodeX = Infinity;
                let maxNodeX = -Infinity;
                
                nodesInGroup.forEach(node => {
                    // 노드의 실제 경계를 고려
                    const halfWidth = (node.width || 80) / 2;
                    minNodeX = Math.min(minNodeX, node.x - halfWidth);
                    maxNodeX = Math.max(maxNodeX, node.x + halfWidth);
                });
                
                // 기본 그룹 너비 계산
                let groupWidth = (maxNodeX - minNodeX) + 40; // 좌우 각각 20px 여유 공간
                
                // 레이어 밀도에 따른 너비 조정
                const density = groupLayerDensity[groupId];
                if (density && density.maxNodesInLayer > 1) {
                    // 같은 레이어에 2개 이상 노드가 있을 경우 너비 확장
                    const densityFactor = Math.min(3, Math.log2(density.maxNodesInLayer + 1));
                    const baseNodeWidth = 200; // 기본 노드 너비 (여유 공간 포함)
                    const minWidthForDensity = baseNodeWidth * density.maxNodesInLayer * 0.8; // 노드 중첩 허용
                    
                    // 너비가 밀도에 비해 부족하면 확장
                    if (groupWidth < minWidthForDensity) {
                        const originalWidth = groupWidth;
                        groupWidth = minWidthForDensity;
                        console.log(`[DEBUG_WIDTH_ADJUST] 그룹=${groupId}, 레이어 밀도로 인한 너비 확장: ${originalWidth.toFixed(1)} → ${groupWidth.toFixed(1)}`);
                    }
                }
                
                calculatedTotalWidth += groupWidth;
            } else {
                // 노드가 없는 그룹은 기본 너비 할당
                calculatedTotalWidth += 200; // 기본 너비
            }
        });
        
        // 적어도 필요한 최소 너비 보장
        const minTotalWidth = this.graph.groupOrder.length * 200;
        if (calculatedTotalWidth < minTotalWidth) {
            calculatedTotalWidth = minTotalWidth;
        }
        
        console.log(`[DEBUG_WIDTH] 계산된 총 너비: ${calculatedTotalWidth}px (그룹 수: ${groupCount})`);
        
        // 레인 간 간격 제거: 레인 사이의 간격을 0으로 설정
        const laneSpacing = 0; // 레인 사이 간격 제거 (기존 spacing 대신 사용)
        
        // 레이어 밀도에 따라 그룹별 비율 조정
        const groupWidthRatios = {};
        let totalRatio = 0;
        
        this.graph.groupOrder.forEach(groupId => {
            const density = groupLayerDensity[groupId];
            // 기본 비율 1, 밀도에 따라 최대 3배까지 증가
            const ratio = density && density.maxNodesInLayer > 1 
                ? 1 + Math.min(2, Math.log2(density.maxNodesInLayer) / 2)
                : 1;
            groupWidthRatios[groupId] = ratio;
            totalRatio += ratio;
        });
        
        // 비율에 따라 너비 분배
        let currentX = 0;
        this.graph.groupOrder.forEach(groupId => {
            const ratio = groupWidthRatios[groupId];
            const groupWidth = (calculatedTotalWidth * ratio) / totalRatio;
            
            ranges[groupId] = {
                minX: currentX,
                maxX: currentX + groupWidth
            };
            
            console.log(`[DEBUG_GROUP_WIDTH] 그룹=${groupId}, 비율=${ratio.toFixed(2)}, 너비=${groupWidth.toFixed(1)}`);
            currentX += groupWidth;
        });
        
        console.log('[DEBUG_RANGES] 그룹 수평 범위 계산:', ranges);
        return ranges;
    }
    
    // 그룹 경계 초기화
    initializeGroupBoundaries() {
        this.graph.groups.forEach(group => {
            group.minX = Infinity;
            group.maxX = -Infinity;
            group.minY = Infinity;
            group.maxY = -Infinity;
        });
    }
    
    // 그룹 경계 최종 업데이트
    updateGroupBoundaries(layerHeight) {
        // 전체 그래프에서 가장 큰 레이어 값 찾기
        let globalMaxLayer = 0;
        this.graph.nodes.forEach(node => {
            globalMaxLayer = Math.max(globalMaxLayer, node.layer || 0);
        });
        
        // 레인 순서대로 경계 계산 (붙어 있는 레인 구조 보장)
        // 고정된 totalWidth 대신 동적으로 계산된 총 너비 사용
        const groupHorizontalRanges = this.calculateGroupHorizontalRanges(0, 0);
        
        // 레인 간격 없이 각 레인의 경계 설정
        this.graph.groupOrder.forEach((groupId, index) => {
            const group = this.graph.getGroup(groupId);
            if (group) {
                const groupRange = groupHorizontalRanges[groupId];
                if (!groupRange) return;
                
                const laneMinX = groupRange.minX;
                const laneMaxX = groupRange.maxX;
                
                group.minX = laneMinX;
                group.maxX = laneMaxX;
                
                // Y 경계는 모든 레인이 동일하게 설정
                const totalHeight = (globalMaxLayer + 1) * layerHeight;
                group.minY = 0;
                group.maxY = totalHeight;
                
                // 그룹 높이 설정
                group.height = group.maxY - group.minY;
                
                // 이 레인에 속한 모든 노드를 레인 경계 내에 강제 배치
                const nodeMargin = 10; // 노드와 레인 경계 사이 여백
                this.graph.nodes.forEach(node => {
                    if (node.group === groupId) {
                        this.ensureNodeWithinLaneBounds(node, laneMinX, laneMaxX, nodeMargin);
                    }
                });
            }
        });
        
        console.log('[DEBUG_BOUNDARIES] 그룹 경계 업데이트 완료:', this.graph.groups);
        return this;
    }
    
    // 그룹의 최소/최대 X, Y 값 계산 (기존 코드를 새 로직으로 대체)
    calculateGroupBoundaries() {
        // 이미 updateGroupBoundaries에서 처리하므로 여기서는 별도 처리 필요 없음
        return this;
    }
    
    // 그룹 위치 조정 (새로운 모델에서는 불필요해짐)
    adjustGroupsToAvoidOverlaps(spacing = 20) {
        // 그룹 간 수평 구분이 이미 보장되므로 추가 조정 필요 없음
        return this;
    }
    
    // 그룹화된 노드 위치 조정 - 모든 노드가 자신의 레인 내에 있도록 강제 조정
    adjustNodePositionsForGroups() {
        console.log('[DEBUG_ADJUST_POSITIONS] 노드 위치 최종 조정 시작');
        
        // 각 그룹의 노드가 그룹 경계 내에 있는지 확인하고 조정
        this.graph.nodes.forEach(node => {
            if (node.group) {
                const group = this.graph.getGroup(node.group);
                if (group) {
                    const nodeHalfWidth = (node.width || 80) / 2;
                    const nodeMargin = 10;
                    
                    // 조정 전 상태 확인
                    const beforeX = node.x;
                    const beforeLeft = node.x - nodeHalfWidth;
                    const beforeRight = node.x + nodeHalfWidth;
                    const beforeOutOfBounds = beforeLeft < group.minX + nodeMargin || beforeRight > group.maxX - nodeMargin;
                    
                    if (beforeOutOfBounds) {
                        console.log(`[DEBUG_OUT_OF_BOUNDS] 경계 이탈 노드 발견: ID=${node.id}, Label=${node.label}`);
                        console.log(`  - 현재 위치: x=${node.x.toFixed(1)}, 범위=[${beforeLeft.toFixed(1)}-${beforeRight.toFixed(1)}]`);
                        console.log(`  - 그룹 경계: ID=${node.group}, 범위=[${group.minX.toFixed(1)}-${group.maxX.toFixed(1)}]`);
                    }
                    
                    // 노드가 그룹 경계를 벗어나는지 확인하고 조정
                    this.ensureNodeWithinLaneBounds(node, group.minX, group.maxX, nodeMargin);
                    
                    // 조정 후 상태 확인
                    const afterX = node.x;
                    if (beforeX !== afterX) {
                        console.log(`[DEBUG_POSITION_FIXED] 노드 위치 조정됨: ID=${node.id}, 전=${beforeX.toFixed(1)}, 후=${afterX.toFixed(1)}`);
                    }
                }
            }
        });
        
        console.log('[DEBUG_ADJUST_POSITIONS] 노드 위치 최종 조정 완료');
        return this;
    }

    /**
     * 각 그룹의 높이를 계산하여 그룹 객체에 저장합니다.
     * 수정: 그룹별로 분리된 레인 구조를 유지합니다.
     */
    calculateGroupHeights(layerHeight = 120) {
        // 기존 로직은 updateGroupBoundaries로 대체되었으므로 호환성 유지용으로만 존재
        return this;
    }

    generateEdgeCoordinates() {
        console.log('[DEBUG_EDGES] 엣지 좌표 생성 시작');
        const spacing = 20;
        const gridSize = 20;
        const maxSteps = 300;
        
        /**
        * getBoundaryPoint: 장애물 회피를 고려하여 노드의 시작/종료 포트를 동적으로 결정
        */
       const getBoundaryPoint = (node, to, allObstacles) => {
           const spacing = 20;
           const testLength = 60; // 테스트 선 길이
           const directions = {
               right: { dx: 1, dy: 0 },
               left: { dx: -1, dy: 0 },
               top: { dx: 0, dy: -1 },
               bottom: { dx: 0, dy: 1 }
           };

           const isHorizontalLayout = window.isHorizontalLayout || false;
       
           const halfWidth = isHorizontalLayout 
               ? (node.height || defaultNodeHeight) / 2 
               : (node.width || defaultNodeWidth) / 2;
           const halfHeight = isHorizontalLayout 
               ? (node.width || defaultNodeWidth) / 2 
               : (node.height || defaultNodeHeight) / 2;
       
           const portPoints = {
               left: { x: node.x - halfWidth, y: node.y , direction: 'left'},
               right: { x: node.x + halfWidth, y: node.y , direction: 'right'},
               top: { x: node.x, y: node.y - halfHeight , direction: 'top'},
               bottom: { x: node.x, y: node.y + halfHeight , direction: 'bottom'}
           };
       
           const priority = { 'free': 3, 'group': 2, 'node': 1 };
       
           const checkDirection = (dirKey) => {
               const { x, y } = portPoints[dirKey];
               const { dx, dy } = directions[dirKey];
               let status = 'free';
       
               for (let d = 0; d < testLength; d += 10) {
                   const px = x + dx * d;
                   const py = y + dy * d;
                   for (const obs of allObstacles) {
                       if (obs.id === node.id) continue; // 자기 자신 제외
                       const left = obs.x - obs.width / 2;
                       const right = obs.x + obs.width / 2;
                       const top = obs.y - obs.height / 2;
                       const bottom = obs.y + obs.height / 2;
       
                       if (px >= left && px <= right && py >= top && py <= bottom) {
                           if (obs.type === 'node') return 'node';
                           if (obs.type === 'group' && status !== 'node') status = 'group';
                       }
                   }
               }
       
               return status;
           };
       
           // to 방향에 기반하여 우선순위 방향 리스트 계산
           const dx = to.x - node.x;
           const dy = to.y - node.y;
           const absDx = Math.abs(dx);
           const absDy = Math.abs(dy);
       
           const toDirs = [];
           if (dy < 0) toDirs.push('top');
           if (dy > 0) toDirs.push('bottom');
           if (dx > 0) toDirs.push('right');
           if (dx < 0) toDirs.push('left');
       
           const allDirs = ['top', 'right', 'bottom', 'left'];
           const orderedDirs = [...toDirs, ...allDirs.filter(d => !toDirs.includes(d))];
       
           const directionScores = {};
           for (const dir of orderedDirs) {
               directionScores[dir] = checkDirection(dir);
           }
       
           // 가장 우선순위 높은 방향 선택 (to 상대 위치 기반)
           const bestDir = Object.entries(directionScores)
               .sort((a, b) => priority[b[1]] - priority[a[1]])[0][0];
       
           return portPoints[bestDir];
       };
    
        const getAllObstacles = () => {
            return this.graph.nodes
                .filter(node => node.id && node.width && node.height)
                .map(node => ({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    width: node.width + spacing,
                    height: node.height + spacing
                }));
        };
    
        const intersectsObstacle = (p, obstacles) => {
            return obstacles.some(obs => {
                const left = obs.x - obs.width / 2;
                const right = obs.x + obs.width / 2;
                const top = obs.y - obs.height / 2;
                const bottom = obs.y + obs.height / 2;
    
                return (
                    p.x >= left &&
                    p.x <= right &&
                    p.y >= top &&
                    p.y <= bottom
                );
            });
        };
    
        const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
        const findOrthogonalPath = (start, end, obstacles) => {
            // 직접 장애물 검사 없이 두 점을 직선으로 연결할 수 있는지 확인
            const canDrawDirectLine = (p1, p2) => {
                // 두 점이 동일한 x 또는 y 좌표를 가지면 직선
                if (p1.x === p2.x || p1.y === p2.y) {
                    const steps = 10; // 충분히 작은 간격으로 샘플링
                    const dx = (p2.x - p1.x) / steps;
                    const dy = (p2.y - p1.y) / steps;
                    
                    // 직선 경로에 장애물이 있는지 확인
                    for (let i = 0; i <= steps; i++) {
                        const x = p1.x + dx * i;
                        const y = p1.y + dy * i;
                        if (intersectsObstacle({ x, y }, obstacles)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            };

            // 직선 연결 가능성 먼저 확인
            if (canDrawDirectLine(start, end)) {
                return optimizePath([start, end]);
            }
            
            // 한 번의 꺾임으로 연결 가능한지 검사
            const midPoint1 = { x: end.x, y: start.y };
            const midPoint2 = { x: start.x, y: end.y };
            
            // 수평 먼저 시도 (왼쪽/오른쪽으로 진행 후 위/아래로)
            if (canDrawDirectLine(start, midPoint1) && canDrawDirectLine(midPoint1, end)) {
                return optimizePath([start, midPoint1, end]);
            }
            
            // 수직 먼저 시도 (위/아래로 진행 후 왼쪽/오른쪽으로)
            if (canDrawDirectLine(start, midPoint2) && canDrawDirectLine(midPoint2, end)) {
                return optimizePath([start, midPoint2, end]);
            }
            
            // === 여기서부터는 기존 A* 알고리즘 기반 경로 탐색 ===
            const visited = new Set();
            const queue = [{ 
                point: start, 
                path: [start],
                turns: 0 // 꺾임 수 추적
            }];
            const serialize = (p) => `${p.x},${p.y}`;
            
            // 강제 종료 조건 추가: 시작점과 종료점의 거리가 너무 멀면 단순 경로 반환
            const directDistance = manhattan(start, end);
            if (directDistance > 2000) {
                console.warn('경로가 너무 멀어서 단순 경로 반환');
                const midPoint = {
                    x: (start.x + end.x) / 2,
                    y: (start.y + end.y) / 2
                };
                return optimizePath([start, midPoint, end]);
            }
            
            // 방향 우선순위 설정 함수 추가
            const getDirectionPriority = (curr, target, currDirection) => {
                const dx = target.x - curr.x;
                const dy = target.y - curr.y;
                const directions = [];
                
                // 현재 진행 방향 유지를 선호 (꺾임 최소화)
                if (currDirection) {
                    if (currDirection.dx !== 0) {
                        // x 방향으로 진행 중이면 계속 x 방향으로
                        const continuedX = dx > 0 ? { dx: gridSize, dy: 0 } : { dx: -gridSize, dy: 0 };
                        directions.push(continuedX);
                    } else if (currDirection.dy !== 0) {
                        // y 방향으로 진행 중이면 계속 y 방향으로
                        const continuedY = dy > 0 ? { dx: 0, dy: gridSize } : { dx: 0, dy: -gridSize };
                        directions.push(continuedY);
                    }
                }
                
                // 그 다음 목표 방향으로 진행
                if (Math.abs(dx) > Math.abs(dy)) {
                    directions.push({ dx: dx > 0 ? gridSize : -gridSize, dy: 0 });
                    directions.push({ dx: 0, dy: dy > 0 ? gridSize : -gridSize });
                } else {
                    directions.push({ dx: 0, dy: dy > 0 ? gridSize : -gridSize });
                    directions.push({ dx: dx > 0 ? gridSize : -gridSize, dy: 0 });
                }
                
                // 중복 방향 제거
                return [...new Map(directions.map(d => [`${d.dx},${d.dy}`, d])).values()];
            };

            let bestPath = null;
            let bestTurns = Infinity;

            for (let steps = 0; steps < maxSteps; steps++) {
                // Queue 크기 관리: 큐가 너무 커지면 가장 유망한 경로만 남김
                if (queue.length > 1000) {
                    // 꺾임이 적고 목표에 가까운 경로 우선
                    queue.sort((a, b) => {
                        // 꺾임 수와 맨해튼 거리의 가중합
                        const scoreA = a.turns * 10 + manhattan(a.point, end);
                        const scoreB = b.turns * 10 + manhattan(b.point, end);
                        return scoreA - scoreB;
                    });
                    queue.splice(100); // 가장 유망한 100개만 유지
                }
                
                if (queue.length === 0) break;
                
                // 우선순위가 가장 높은 경로 선택
                queue.sort((a, b) => {
                    // 꺾임 수가 적은 경로 우선
                    if (a.turns !== b.turns) return a.turns - b.turns;
                    // 그 다음 목표에 가까운 경로 우선
                    return manhattan(a.point, end) - manhattan(b.point, end);
                });
                
                const { point, path, turns } = queue.shift();
                
                // 이미 더 나은 경로를 찾았다면 종료
                if (bestPath && turns >= bestTurns) continue;
                
                // 목표에 충분히 가까우면 경로 완성
                if (manhattan(point, end) < gridSize) {
                    const fullPath = [...path, end];
                    
                    // 경로의 꺾임 수 계산
                    let pathTurns = 0;
                    for (let i = 1; i < fullPath.length - 1; i++) {
                        const prev = fullPath[i-1];
                        const curr = fullPath[i];
                        const next = fullPath[i+1];
                        
                        if (!((prev.x === curr.x && curr.x === next.x) || 
                             (prev.y === curr.y && curr.y === next.y))) {
                            pathTurns++;
                        }
                    }
                    
                    // 더 적은 꺾임의 경로를 찾았다면 갱신
                    if (pathTurns < bestTurns) {
                        bestPath = fullPath;
                        bestTurns = pathTurns;
                    }
                    
                    // 꺾임이 2개 이하면 즉시 반환 (충분히 좋은 경로)
                    if (pathTurns <= 2) {
                        return bestPath;
                    }
                    
                    continue;
                }
                
                // 현재 진행 방향 파악
                const currDirection = path.length > 1 ? {
                    dx: point.x - path[path.length - 2].x,
                    dy: point.y - path[path.length - 2].y
                } : null;
                
                // 우선순위에 따른 방향 탐색
                const priorityDirections = getDirectionPriority(point, end, currDirection);
                for (const direction of priorityDirections) {
                    const next = {
                        x: Math.round((point.x + direction.dx) / gridSize) * gridSize,
                        y: Math.round((point.y + direction.dy) / gridSize) * gridSize
                    };
                    const key = serialize(next);
                    if (visited.has(key)) continue;
                    visited.add(key);
                    
                    if (!intersectsObstacle(next, obstacles)) {
                        // 경로가 너무 길어지면 추가하지 않음
                        if (path.length > maxSteps / 2) continue;
                        
                        // 꺾임 수 계산
                        let newTurns = turns;
                        if (path.length > 1) {
                            const prev = path[path.length - 2];
                            const curr = point;
                            
                            const prevDx = curr.x - prev.x;
                            const prevDy = curr.y - prev.y;
                            
                            // 진행 방향이 바뀌었는지 확인
                            if ((prevDx !== 0 && direction.dx === 0) || 
                                (prevDy !== 0 && direction.dy === 0)) {
                                newTurns++;
                            }
                        }
                        
                        queue.push({ 
                            point: next, 
                            path: [...path, next],
                            turns: newTurns
                        });
                    }
                }
            }
            
            // 최적 경로를 찾았다면 반환
            if (bestPath) {
                return optimizePath(bestPath);
            }

            // 모든 단계를 사용했는데 경로를 찾지 못한 경우
            console.warn('최적 경로를 찾지 못함: 대체 경로 반환');
            const horizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);
            const midPoint = horizontal
                ? { x: end.x, y: start.y }
                : { x: start.x, y: end.y };
    
            return optimizePath([start, midPoint, end]);
        };
        
        const optimizePath = (path) => {
            if (path.length < 3) return path;
            
            // 1단계: 불필요한 중간 지점 제거
            const removeUnnecessaryPoints = (inputPath) => {
                const result = [inputPath[0]];
                
                for (let i = 1; i < inputPath.length - 1; i++) {
                    const prev = result[result.length - 1];
                    const curr = inputPath[i];
                    const next = inputPath[i + 1];
                    
                    // 세 점이 직선 상에 있으면 중간 점 제외
                    const isStraight = (prev.x === curr.x && curr.x === next.x) ||
                                     (prev.y === curr.y && curr.y === next.y);
                    
                    if (!isStraight) {
                        // 현재 지점이 실제로 필요한 꺾임인지 확인
                        const isNecessaryTurn = true;
                        if (isNecessaryTurn) {
                            result.push(curr);
                        }
                    }
                }
                
                result.push(inputPath[inputPath.length - 1]);
                return result;
            };
            
            // 2단계: 꺾임 최소화를 위한 점 정렬
            const alignCorners = (inputPath) => {
                if (inputPath.length <= 3) return inputPath;
                
                const result = [inputPath[0]];
                
                for (let i = 1; i < inputPath.length - 1; i++) {
                    const prev = inputPath[i - 1];
                    const curr = inputPath[i];
                    const next = inputPath[i + 1];
                    
                    // 가능한 경우 꺾임을 정렬 (격자에 맞추기)
                    let adjustedPoint = {...curr};
                    
                    // x 또는 y 좌표가 비슷하면 완전히 정렬
                    if (Math.abs(curr.x - prev.x) < gridSize / 2) {
                        adjustedPoint.x = prev.x;
                    }
                    if (Math.abs(curr.y - prev.y) < gridSize / 2) {
                        adjustedPoint.y = prev.y;
                    }
                    
                    result.push(adjustedPoint);
                }
                
                result.push(inputPath[inputPath.length - 1]);
                return result;
            };
            
            // 최적화 단계 적용
            let optimized = removeUnnecessaryPoints(path);
            optimized = alignCorners(optimized);
            
            return optimized;
        };
    
        const obstacles = getAllObstacles();
        const baseStep = 20; // 최초 직선 거리 (예: 20px)

        const adjustInitialStep = (point) => {
            const { x, y, direction } = point;
            switch (direction) {
                case 'left': return { x: x - baseStep, y, direction };
                case 'right': return { x: x + baseStep, y, direction };
                case 'top': return { x, y: y - baseStep, direction };
                case 'bottom': return { x, y: y + baseStep, direction };
                default: return point;
            }
        };
    
        this.graph.edges.forEach(edge => {
            const source = this.graph.getNode(edge.source);
            const target = this.graph.getNode(edge.target);
            if (!source || !target) return;
    

            const rawStart = getBoundaryPoint(source, target, obstacles);
            const rawEnd = getBoundaryPoint(target, source, obstacles);
            
            const startPoint = adjustInitialStep(rawStart);
            const endPoint = adjustInitialStep(rawEnd);

            const filteredObstacles = obstacles.filter(o => o.id !== source.id && o.id !== target.id);
            const path = findOrthogonalPath(startPoint, endPoint, filteredObstacles);

            edge.waypoints = [
              { x: rawStart.x, y: rawStart.y },
              ...path,
              { x: rawEnd.x, y: rawEnd.y }
            ];
        });
    
        // 엣지 처리 후 최종 확인
        this.graph.edges.forEach(edge => {
            if (!edge.waypoints || edge.waypoints.length < 2) {
                console.log(`[DEBUG_EDGE_ERROR] 엣지 정보 누락: source=${edge.source}, target=${edge.target}`);
                return;
            }
            
            // 엣지의 시작점과 끝점이 속한 레인 확인
            const sourceNode = this.graph.getNode(edge.source);
            const targetNode = this.graph.getNode(edge.target);
            
            if (sourceNode && targetNode) {
                const isCrossingLanes = sourceNode.group !== targetNode.group;
                
                if (isCrossingLanes) {
                    console.log(`[DEBUG_CROSSING_EDGE] 레인 경계 넘는 엣지: source=${edge.source}(${sourceNode.group}), target=${edge.target}(${targetNode.group})`);
                    // waypoints 확인하여 레인 경계를 명확히 지나는지 체크
                    const waypoints = edge.waypoints || [];
                    console.log(`  - Waypoints: ${waypoints.map(p => `(${p.x.toFixed(1)},${p.y.toFixed(1)})`).join(' -> ')}`);
                }
            }
        });
        
        console.log('[DEBUG_EDGES] 엣지 좌표 생성 완료');
        return this;
    }
    
    // 노드 위치가 레인 경계를 넘는지 확인하고 수정하는 함수 추가
    ensureNodeWithinLaneBounds(node, laneMinX, laneMaxX, nodeMargin) {
        if (!node || !node.width) return node;

        const nodeHalfWidth = node.width / 2;
        const leftBoundary = laneMinX + nodeMargin;
        const rightBoundary = laneMaxX - nodeMargin;
        
        // 노드 경계 넘음 상세 로그 추가 [DEBUG_LANE_BOUNDARY]
        const initialX = node.x;
        const leftEdge = node.x - nodeHalfWidth;
        const rightEdge = node.x + nodeHalfWidth;
        const isOutOfBounds = leftEdge < leftBoundary || rightEdge > rightBoundary;
        
        if (isOutOfBounds) {
            console.log(`[DEBUG_LANE_BOUNDARY] 노드 경계 이탈: ID=${node.id}, Label=${node.label}, Group=${node.group}`);
            console.log(`  - 노드 좌표: x=${node.x.toFixed(1)}, 너비=${node.width}, 좌측=${leftEdge.toFixed(1)}, 우측=${rightEdge.toFixed(1)}`);
            console.log(`  - 레인 경계: 좌측=${leftBoundary.toFixed(1)}, 우측=${rightBoundary.toFixed(1)}`);
        }
        
        // 노드가 레인 왼쪽 경계를 넘는 경우
        if (leftEdge < leftBoundary) {
            node.x = leftBoundary + nodeHalfWidth;
        }
        
        // 노드가 레인 오른쪽 경계를 넘는 경우
        if (rightEdge > rightBoundary) {
            node.x = rightBoundary - nodeHalfWidth;
        }
        
        // 위치가 변경된 경우 로그 기록
        if (initialX !== node.x) {
            console.log(`  - 위치 조정됨: ${initialX.toFixed(1)} → ${node.x.toFixed(1)}`);
        }
        
        return node;
    }
    
    // 전체 레이아웃 알고리즘 실행
    run() {
        this.assignLayers()
            .minimizeCrossings()
            .assignCoordinates()
            .calculateGroupHeights()
            .adjustNodePositionsForGroups() // 강제로 모든 노드가 자신의 레인 내에 있도록 조정하는 단계 추가
            .generateEdgeCoordinates();
        console.log(this.graph);
        return this.graph;
    }
}

/**
 * 유틸리티 함수
 */

// 랜덤 그래프 생성
function generateRandomGraph(nodeCount = 10, edgeDensity = 0.3) {
    const graph = new Graph();
    
    // 노드 추가
    for (let i = 0; i < nodeCount; i++) {
        const node = graph.addNode(i, `Node ${i}`).getNode(i);
        
        // 노드에 랜덤 크기 할당 (기본 크기의 60%~140%)
        const sizeVariation = 0.6 + Math.random() * 0.8; // 0.6 ~ 1.4
        node.width = Math.floor(80 * sizeVariation);
        node.height = Math.floor(40 * sizeVariation);
    }
    
    // 엣지 추가 (Sugiyama 알고리즘이 제대로 작동하도록 DAG 보장)
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (Math.random() < edgeDensity) {
                graph.addEdge(i, j);
            }
        }
    }
    
    return graph;
}

// 모듈 내보내기
export { 
    Graph, 
    SugiyamaLayout,
    generateRandomGraph
}; 

(function(global) {
    global.GraphAlgorithm = {
        Graph,
        SugiyamaLayout,
        generateRandomGraph
    };
})(typeof window !== 'undefined' ? window : this);