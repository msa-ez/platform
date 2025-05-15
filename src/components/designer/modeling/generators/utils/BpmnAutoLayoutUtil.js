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
    // source/target이 실제 노드에 존재하는지 체크
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
  // lane.children 또는 lane.businessObject.flowNodeRef를 사용하여 노드-레인 매핑
  const nodeIdToLaneId = {};
  lanes.forEach(lane => {
    // BPMN-js에서는 lane.businessObject.flowNodeRef가 노드 ID 배열임
    const flowNodeRefs = (lane.businessObject && lane.businessObject.flowNodeRef) || [];
    flowNodeRefs.forEach(ref => {
      // ref는 BPMN 노드 객체이거나 ID일 수 있음
      const nodeId = typeof ref === 'string' ? ref : ref.id;
      nodeIdToLaneId[nodeId] = lane.id;
    });
  });
  // 노드에 group(lane) 할당 (flowNodeRef에 없는 노드도 자동 할당)
  nodes.forEach(n => {
    const gNode = graph.getNode(n.id);
    if (gNode) {
      if (nodeIdToLaneId[n.id]) {
        gNode.group = nodeIdToLaneId[n.id];
      } else {
        // flowNodeRef에 없는 노드는 가장 가까운 lane에 자동 할당
        // (여기서는 첫 번째 lane에 할당, 필요시 더 정교하게 개선 가능)
        if (lanes.length > 0) {
          gNode.group = lanes[0].id;
          console.warn('[AUTO_GROUP_ASSIGN] 노드', n.id, '를 flowNodeRef에 없어서', lanes[0].id, '에 자동 할당');
        }
      }
    }
  });

  // 5-2. 그룹(레인) 정보 생성 (기존 방식 유지)
  lanes.forEach(lane => {
    // lane에 속한 노드 ID 추출
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
  // 1. 모든 노드의 layer(계층)를 -1로 초기화
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = { ...graph.getNode(n.id), incoming: [], outgoing: [], group: graph.getNode(n.id).group }; });
  connections.forEach(conn => {
    if (conn.source && conn.target) {
      nodeMap[conn.source.id].outgoing.push(conn.target.id);
      nodeMap[conn.target.id].incoming.push(conn.source.id);
    }
  });
  Object.values(nodeMap).forEach(n => n.layer = -1);
  // 2. 시작 노드(들어오는 시퀀스 플로우 없는 노드)부터 BFS
  const queue = [];
  Object.values(nodeMap).forEach(n => {
    if (n.incoming.length === 0) {
      n.layer = 0;
      queue.push(n);
    }
  });
  while (queue.length > 0) {
    const current = queue.shift();
    current.outgoing.forEach(targetId => {
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
  let currentY = 40; // 첫 레인 시작 y
  lanes.forEach(lane => {
    const bounds = lane.businessObject && lane.businessObject.di && lane.businessObject.di.bounds;
    const laneId = lane.id;
    const nodesInLane = nodes.filter(n => nodeMap[n.id] && nodeMap[n.id].group === laneId);
    const requiredHeight = Math.max(180, minSpacing * (nodesInLane.length + 1));
    if (bounds) {
      bounds.y = currentY;
      bounds.height = requiredHeight;
      lane.y = currentY;
      lane.height = requiredHeight;
      currentY += requiredHeight; // 다음 레인 y로 누적
    }
  });
  // === 같은 레인/레이어에 여러 노드가 있을 때 y축 분산 (동적 lane 높이 기준, laneTop 기준) ===
  const laneIdToNodes = {};
  nodes.forEach(n => {
    const group = nodeMap[n.id] && nodeMap[n.id].group;
    if (!group) return;
    if (!laneIdToNodes[group]) laneIdToNodes[group] = [];
    laneIdToNodes[group].push(nodeMap[n.id]);
  });
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
  Object.values(nodeMap).forEach(n => {
    n.x = 100 + n.layer * layerSpacing;
    // n.y는 위에서 분산 배치됨
    // 실제 graph에도 반영
    const gNode = graph.getNode(n.id);
    if (gNode) {
      gNode.x = n.x;
      gNode.y = n.y;
    }
  });

  // 8. 노드 위치 반영 (SugiyamaLayout 결과를 100% 적용)
  nodes.forEach(n => {
    const gNode = graph.getNode(n.id);
    if (gNode) {
      // SugiyamaLayout의 x/y를 강제 적용
      modeling.moveShape(n, { x: gNode.x - n.x, y: gNode.y - n.y });
    }
  });

  // 9. 엣지(waypoints) 반영
  connections.forEach(conn => {
    const edge = graph.edges.find(e => e.source === conn.source.id && e.target === conn.target.id);
    if (edge) {
      // BPMN-js shape의 실제 bbox 좌표를 사용해서 정확히 테두리에 붙도록 계산
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const getAttachPoint = (el, toX, toY) => {
          const { x, y, width, height } = el;
          const cx = x + width / 2, cy = y + height / 2;
          const dx = toX - cx, dy = toY - cy;
          if (Math.abs(dx) > Math.abs(dy)) {
            // 좌/우
            return { x: cx + (dx > 0 ? width/2 : -width/2), y: cy };
          } else {
            // 위/아래
            return { x: cx, y: cy + (dy > 0 ? height/2 : -height/2) };
          }
        };
        // 출발/도착점 계산 (실제 shape 기준)
        const sourceAttach = getAttachPoint(sourceNode, targetNode.x + targetNode.width/2, targetNode.y + targetNode.height/2);
        const targetAttach = getAttachPoint(targetNode, sourceNode.x + sourceNode.width/2, sourceNode.y + sourceNode.height/2);
        // 항상 마지막에 수평(→)으로 들어가도록 보정
        let waypoints = [];
        const margin = 40;
        const targetLeft = targetNode.x;
        const targetCenterY = targetNode.y + targetNode.height / 2;
        if (Math.abs(sourceAttach.x - targetAttach.x) > Math.abs(sourceAttach.y - targetAttach.y)) {
          // 수평 우선: source → (target.x-margin, source.y) → (target.x-margin, targetCenterY) → (target.x, targetCenterY)
          waypoints = [
            sourceAttach,
            { x: targetLeft - margin, y: sourceAttach.y }, // 수평 이동
            { x: targetLeft - margin, y: targetCenterY },   // 수직 이동
            { x: targetLeft, y: targetCenterY }             // 마지막 수평 진입
          ];
        } else {
          // 수직 우선: source → (source.x, targetCenterY) → (target.x-margin, targetCenterY) → (target.x, targetCenterY)
          waypoints = [
            sourceAttach,
            { x: sourceAttach.x, y: targetCenterY },        // 수직 이동
            { x: targetLeft - margin, y: targetCenterY },   // 수평 이동
            { x: targetLeft, y: targetCenterY }             // 마지막 수평 진입
          ];
        }
        // 마지막 두 점이 충분히 떨어지도록 보정 (최소 20px)
        if (waypoints.length >= 2) {
          let beforeLast = waypoints[waypoints.length - 2];
          let last = waypoints[waypoints.length - 1];
          const minDist = 20;
          if (Math.abs(last.x - beforeLast.x) < minDist && Math.abs(last.y - beforeLast.y) < minDist) {
            waypoints[waypoints.length - 2] = { x: last.x - minDist, y: last.y };
          }
        }
        modeling.updateWaypoints(conn, waypoints);
        bpmnModeler.get('eventBus').fire('elements.changed', { elements: [conn] });
      }
    }
  });

  // 10. 각 레인(BPMNShape)의 width를 전체 노드의 최대 x+width에 맞춰 통일
  let globalMaxX = 0;
  nodes.forEach(n => {
    const right = n.x + (n.width || 0);
    if (right > globalMaxX) globalMaxX = right;
  });
  const unifiedLaneWidth = globalMaxX + 200;
  lanes.forEach(lane => {
    modeling.resizeShape(lane, { x: lane.x, y: lane.y, width: unifiedLaneWidth, height: lane.height });
  });

  // 11. 다이어그램 뷰포트 맞춤
  bpmnModeler.get('canvas').zoom('fit-viewport', 'auto');
} 