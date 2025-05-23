// BpmnAutoLayoutUtil.js
// BPMN-js 다이어그램에 전체 플로우 기반 자동 레이아웃을 적용하는 유틸리티

import { Graph, SugiyamaLayout } from '../BPMAutoLayout';

/**
 * bpmn-js의 bpmnModeler 인스턴스를 받아 자동 레이아웃을 적용합니다.
 * @param {BpmnJS} bpmnModeler
 */
export async function applyBpmnAutoLayout(bpmnModeler) {
  if (!bpmnModeler) return;
  const elementRegistry = bpmnModeler.get('elementRegistry');
  const modeling = bpmnModeler.get('modeling');

  // elementRegistry의 모든 요소를 배열로 변환
  const allElements = elementRegistry.getAll();
  console.log('[DEBUG_ALL_ELEMENTS]', allElements.map(el => el.type));
  
  // 1. 모든 노드(풀/레인/라벨/연결 제외) 추출
  const nodes = allElements.filter(el =>
    !el.waypoints && el.type !== 'label' &&
    !['bpmn:Participant', 'bpmn:Lane', 'bpmn:Collaboration', 'bpmn:Process'].includes(el.type)
  );
  
  // 2. Lane(레인) 정보 추출
  const lanes = allElements.filter(el => el.type === 'bpmn:Lane');
  
  // 3. 시퀀스 플로우 추출
  const connections = allElements.filter(el => el.type === 'bpmn:SequenceFlow');
  console.log('[DEBUG_CONNECTIONS_RAW]', connections);

  // 4. 그래프 생성 및 노드/엣지 추가
  const graph = new Graph();
  console.log('[DEBUG_NODES]', nodes.map(n => n.id));
  console.log('[DEBUG_CONNECTIONS]', connections.map(c => ({
    id: c.id,
    source: c.source && c.source.id,
    target: c.target && c.target.id
  })));
  
  nodes.forEach(n => {
    graph.addNode(n.id, n.businessObject.name || n.id);
  });
  
  connections.forEach(conn => {
    const sourceId = conn.source && conn.source.id;
    const targetId = conn.target && conn.target.id;
    const sourceExists = sourceId && graph.getNode(sourceId);
    const targetExists = targetId && graph.getNode(targetId);
    if (sourceExists && targetExists) {
      console.log('[DEBUG_EDGE_ADD]', conn.id, sourceId, targetId);
      graph.addEdge(sourceId, targetId);
    } else {
      console.warn('[DEBUG_EDGE_SKIP]', conn.id, 'source:', sourceId, 'target:', targetId, 'sourceExists:', !!sourceExists, 'targetExists:', !!targetExists);
    }
  });
  console.log('[DEBUG_GRAPH_EDGES]', graph.edges);

  // 5. 그룹(레인) 정보 반영 및 노드에 group(lane) 직접 할당
  const nodeIdToLaneId = {};
  lanes.forEach(lane => {
    const flowNodeRefs = (lane.businessObject && lane.businessObject.flowNodeRef) || [];
    flowNodeRefs.forEach(ref => {
      const nodeId = typeof ref === 'string' ? ref : ref.id;
      nodeIdToLaneId[nodeId] = lane.id;
    });
  });
  
  nodes.forEach(n => {
    const gNode = graph.getNode(n.id);
    if (gNode) {
      if (nodeIdToLaneId[n.id]) {
        gNode.group = nodeIdToLaneId[n.id];
      } else if (lanes.length > 0) {
        gNode.group = lanes[0].id;
        console.warn('[AUTO_GROUP_ASSIGN] 노드', n.id, '를 flowNodeRef에 없어서', lanes[0].id, '에 자동 할당');
      }
    }
  });

  // 5-2. 그룹(레인) 정보 생성
  lanes.forEach(lane => {
    const flowNodeRefs = (lane.businessObject && lane.businessObject.flowNodeRef) || [];
    const laneNodeIds = flowNodeRefs.map(ref => (typeof ref === 'string' ? ref : ref.id)).filter(id => graph.getNode(id));
    if (laneNodeIds.length > 0) {
      graph.createGroup(lane.id, laneNodeIds);
    }
  });

  // 6. 노드 크기 정보 반영
  nodes.forEach(n => {
    const gNode = graph.getNode(n.id);
    if (gNode) {
      gNode.width = n.width || 120;
      gNode.height = n.height || 60;
    }
  });

  // 7. 레이아웃 실행
  // === 시퀀스 플로우 기반 계층(layer) 재할당 ===
  const nodeMap = {};
  nodes.forEach(n => { 
    nodeMap[n.id] = { 
      ...graph.getNode(n.id), 
      incoming: [], 
      outgoing: [], 
      group: graph.getNode(n.id).group 
    }; 
  });
  
  connections.forEach(conn => {
    if (conn.source && conn.target) {
      nodeMap[conn.source.id].outgoing.push(conn.target.id);
      nodeMap[conn.target.id].incoming.push(conn.source.id);
    }
  });
  
  Object.values(nodeMap).forEach(n => n.layer = -1);
  
  // 2. 시작 노드부터 BFS (순환 참조 방지를 위한 방문 체크 추가)
  const visited = new Set();
  const queue = [];
  Object.values(nodeMap).forEach(n => {
    if (n.incoming.length === 0) {
      n.layer = 0;
      queue.push(n);
      visited.add(n.id);
    }
  });
  
  while (queue.length > 0) {
    const current = queue.shift();
    current.outgoing.forEach(targetId => {
      if (visited.has(targetId)) return; // 이미 방문한 노드는 건너뛰기
      visited.add(targetId);
      
      const target = nodeMap[targetId];
      if (target && target.layer < current.layer + 1) {
        target.layer = current.layer + 1;
        queue.push(target);
      }
    });
  }

  // 3. layer별로 x좌표, lane별로 y좌표 배치
  const layerSpacing = 200;
  const laneIdToY = {};
  lanes.forEach((lane, idx) => {
    const bounds = lane.businessObject && lane.businessObject.di && lane.businessObject.di.bounds;
    laneIdToY[lane.id] = bounds ? (bounds.y + bounds.height / 2) : (idx * 200 + 100);
  });

  // === 레인 높이 및 y좌표 동적 누적 배치 ===
  const minSpacing = 80;
  let currentY = 40;
  
  // 레인 높이 계산 및 노드 분포
  const processLanes = () => {
    lanes.forEach(lane => {
      const bounds = lane.businessObject && lane.businessObject.di && lane.businessObject.di.bounds;
      const laneId = lane.id;
      const nodesInLane = nodes.filter(n => nodeMap[n.id] && nodeMap[n.id].group === laneId);
      
      if (nodesInLane.length === 0) return;
      
      // 노드 분포 계산
      const nodeYs = nodesInLane.map(n => nodeMap[n.id].y);
      const minY = Math.min(...nodeYs);
      const maxY = Math.max(...nodeYs);
      
      // 레인 높이 계산
      const requiredHeight = Math.max(80, (maxY - minY) + 100);
      
      // 레인 위치 및 크기 업데이트
      if (bounds) {
        bounds.y = currentY;
        bounds.height = requiredHeight;
        lane.y = currentY;
        lane.height = requiredHeight;
        currentY += requiredHeight;
        
        // 한 번만 리사이즈
        modeling.resizeShape(lane, { 
          x: lane.x, 
          y: lane.y, 
          width: lane.width, 
          height: lane.height 
        });
      }
    });
  };

  // 레인별 노드 분포
  const laneIdToNodes = {};
  nodes.forEach(n => {
    const group = nodeMap[n.id] && nodeMap[n.id].group;
    if (!group) return;
    if (!laneIdToNodes[group]) laneIdToNodes[group] = [];
    laneIdToNodes[group].push(nodeMap[n.id]);
  });

  // 레인 내 노드 배치
  lanes.forEach(lane => {
    const bounds = lane.businessObject && lane.businessObject.di && lane.businessObject.di.bounds;
    const laneTop = bounds ? bounds.y : 0;
    const laneHeight = bounds ? bounds.height : 180;
    const nodesInLane = laneIdToNodes[lane.id] || [];
    
    // 레이어별로 그룹핑
    const layerToNodes = {};
    nodesInLane.forEach(n => {
      if (!layerToNodes[n.layer]) layerToNodes[n.layer] = [];
      layerToNodes[n.layer].push(n);
    });
    
    Object.values(layerToNodes).forEach(nodesInLayer => {
      const spacing = laneHeight / (nodesInLayer.length + 1);
      nodesInLayer.forEach((n, idx) => {
        n.y = laneTop + spacing * (idx + 1);
      });
    });
  });

  // 노드 위치 설정
  Object.values(nodeMap).forEach(n => {
    n.x = 100 + n.layer * layerSpacing;
    const gNode = graph.getNode(n.id);
    if (gNode) {
      gNode.x = n.x;
      gNode.y = n.y;
    }
  });

  // 8. 노드 위치 반영
  nodes.forEach(n => {
    const gNode = graph.getNode(n.id);
    if (gNode) {
      modeling.moveShape(n, { x: gNode.x - n.x, y: gNode.y - n.y });
    }
  });

  // 9. 시퀀스 플로우 경로 설정
  connections.forEach(conn => {
    const source = conn.source;
    const target = conn.target;
    if (!source || !target) return;
    
    const sourcePort = {
      x: source.x + (source.width || 120),
      y: source.y + (source.height || 60) / 2
    };
    
    const targetPort = {
      x: target.x,
      y: target.y + (target.height || 60) / 2
    };
    
    const offset = 40;
    const waypoints = [
      sourcePort,
      { x: sourcePort.x + offset, y: sourcePort.y },
      { x: sourcePort.x + offset, y: targetPort.y },
      targetPort
    ];
    
    modeling.updateWaypoints(conn, waypoints);
    bpmnModeler.get('eventBus').fire('elements.changed', { elements: [conn] });
  });

  // 10. 레인 너비 통일
  let globalMaxX = 0;
  nodes.forEach(n => {
    const right = n.x + (n.width || 0);
    if (right > globalMaxX) globalMaxX = right;
  });
  
  const unifiedLaneWidth = globalMaxX + 200;
  lanes.forEach(lane => {
    modeling.resizeShape(lane, { 
      x: lane.x, 
      y: lane.y, 
      width: unifiedLaneWidth, 
      height: lane.height 
    });
  });

  // 11. 다이어그램 뷰포트 맞춤
  bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
} 