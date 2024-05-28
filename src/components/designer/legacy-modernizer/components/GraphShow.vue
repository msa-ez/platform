<template>
  <div ref="graphContainer" class="graph-container card">

    <node-panel
      v-if="showNodePanel"
      :data="nodeInfoData"
      @node-info-send="handleSendNode"
      @error="handleError"
    >
    </node-panel>

    <div>
      <div style="display: flex; flex-direction: column; width: 20vw; height: calc(100vh - 180px); justify-content: flex-end; position: absolute; right:0px; top:0px;"
        v-if="showTableInfo || showJavaResult"
      >
        <div style="height:30%; position: relative; overflow:auto;">
          <tableInfo
            v-if="showTableInfo"
            :data="nodeInfoData">
          </tableInfo>
        </div>
        <div style="height:70%; position: relative; overflow:auto; margin-top:5px;">
          <JavaShow
            v-show="showJavaResult"
            ref="javaShowComponent"
            @error="handleError">
          </JavaShow>
        </div>
      </div>
    </div>

    <loading-spinner v-if="isLoading"></loading-spinner>

  </div>
</template>

<script>
import * as d3 from 'd3';
import { createNodes, createLabels, nodeDrag } from './graphUtil/Node.js';
import LinkUtils from './graphUtil/Link.js'; 
import NodePanel from './NodePanel.vue';
import JavaShow from './JavaShow.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import TableInfo from './TableInfo.vue';

/**
 * 역할:
 * - 그래프를 표시하고 사용자 상호작용을 관리하는 컴포넌트입니다.
 *
 * 구성 요소:
 * - NodePanel: 선택된 노드의 정보를 보여줍니다.
 * - JavaShow: 선택된 노드 정보를 자바 코드로 변환하여 보여줍니다.
 * - LoadingSpinner: 데이터 로딩 중임을 사용자에게 알려주는 스피너입니다.
 * - TableInfo : 선택된 테이블의 상세 정보를 보여주는 패널입니다
 * 
 * 로직 원리:
 * 1. 데이터가 업데이트되면 updateGraph 메소드를 호출하여 그래프를 새로 그립니다.
 * 2. 노드 클릭 시 해당 노드의 정보를 NodePanel과 TableInfo에 전달하고, 각 정보를 화면에 표시합니다 
 * 3. Node의 정보는 JavaShow 컴포넌트로도 전달되고, 자바 코드로 변환되어, 화면에 표시됩니다
 * 4. 에러 발생 시 사용자에게 알림을 제공합니다.
 */

export default {
  components: {
    NodePanel,
    JavaShow,
    LoadingSpinner,
    TableInfo,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    loading: {  
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      showNodePanel: false,            // 노드 패널의 표시 여부
      nodeInfoData: null,              // 선택된 노드의 정보를 저장
      showJavaResult: false,           // 자바 결과 표시 여부
      isLoading: false,                // 현재 로딩 중인지의 상태
      showTableInfo: false,            // 테이블 정보 표시 여부
    };
  },
  watch: {                             // 속성의 변화를 감시합니다.
    data: {
      deep: true,                      // deep: true는 객체 내부까지 감시합니다.
      handler(newData) {
        this.updateGraph(newData);
      }
    },
    loading: {
      handler(newVal) {
        this.isLoading = newVal;
      }
    },
  },
  mounted() {
    this.updateGraph();                // 컴포넌트가 마운트되면 초기 그래프를 그립니다 
  },
  methods: {
    handleSendNode(nodeInfo) {         // 자바로 변환 버튼 클릭 이벤트 핸들러
      this.showJavaResult = true;
      this.$refs.javaShowComponent.handleConvertJava(nodeInfo);
    },
    handleError(error) {               // 에러 헨들러
      console.error('Error:', error);
      alert(error);
    },

    updateGraph() {
      this.$nextTick(() => {                                            // 모든 DOM 업데이트가 완료된 후 실행됩니다.
        const width = this.$refs.graphContainer.clientWidth;            // 그래프 컨테이너의 너비
        const height = this.$refs.graphContainer.clientHeight;          // 그래프 컨테이너의 높이
        d3.select(this.$refs.graphContainer).selectAll('svg').remove(); // 기존 SVG를 제거합니다.
        const { nodes, links } = this.prepareGraphData();               // 그래프 데이터를 준비합니다.
        const nodeSide = 50;                                            // 노드의 크기
        this.drawGraph(nodes, links, nodeSide, width, height);          // 그래프를 그립니다.
      });
    },

    prepareGraphData() {               // 전달 받은 데이터에서 노드와 링크 정보를 추출하여 가공
      if (!this.data || !this.data.query_result || !this.data.query_result.Nodes || !this.data.query_result.Relationships) {
        return { nodes: [], links: [] };                                 
      }
      const nodes = this.data.query_result.Nodes.map((d) => ({
        nodeId: d['Node ID'],          // 노드 ID
        label: d.Labels[0],            // 노드 라벨 
        name: d.Properties.name,       // 노드 이름
        ...d.Properties,               // 노드의 나머지 속성들
      }));

      const links = this.data.query_result.Relationships.map((d) => ({
        source: d['Start Node ID'],    // 연결 시작 노드 ID
        target: d['End Node ID'],      // 연결 종료 노드 ID
        type: d.Type,                  // 관계 타입  
      }));

      return { nodes, links };
    },


    drawGraph(nodes, links, nodeSide, width, height) {              // SVG 요소를, 생성하고, 그래프의 주요 요소들을 그리기
      const svg = d3
        .select(this.$refs.graphContainer)                          // D3를 사용하여 그래프를 그릴 div 선택
        .append('svg')                                              // 선택한 div에 SVG 요소 추가
        .attr('width', width)                                       // SVG 너비 설정
        .attr('height', height)                                     // SVG 높이 설정 (왜 height 변수를 쓰면 안되지?)
        .attr('overflow', 'hidden')
        .call(d3.zoom().on('zoom', (event) => {                     // 줌 인/아웃 기능 활성화   
          svg.attr('transform', event.transform);}))
        .append('g')                                                // 그룹 요소 추가(그룹핑을 위함) 


      const link = LinkUtils.createLinks(svg, links);               // 링크 생성 메소드 호출
      LinkUtils.createMarkers(svg);                                 // 마커 생성 메소드 호출
      const linkText = LinkUtils.createLinkText(svg, links);        // 링크 라벨 생성 메소드 호출

      const node = createNodes(svg, nodes, nodeSide);               // 노드 생성 메소드 호출
      const labels = createLabels(svg, nodes, nodeSide);            // 노드 라벨 생성 메소드 호출

      node.on('click', (event, d) => {                              // 클릭 이벤트 핸들러 추가
        if (d.label === 'Table') {
          console.log("테이블 노드 클릭!");
          this.nodeInfoData = d;                                    // 클릭된 노드의 정보를 저장
          this.showNodePanel = true;                                // NodePanel을 표시        
          this.showTableInfo = true;
        }
      });

      const simulation = d3                                                    // d3의 시뮬레이션을 설정하여 노드 간의 물리적 상호작용을 정의
        .forceSimulation(nodes)                                                // 노드를 기반으로 시뮬레이션 시작
        .force('link', d3.forceLink(links).id((d) => d.nodeId).distance(200))  // 노드 간 거리 설정
        .force('charge', d3.forceManyBody().strength(-1000))                   // 노드 간 척력 설정
        .force('center', d3.forceCenter(width / 2, height / 2))                // 중심 위치 설정
        .force('collision', d3.forceCollide().radius(nodeSide + 10));          // 충돌 반경 설정

      node.call(nodeDrag(simulation));                                         // 노드에 드래그 기능을 적용합니다.

      simulation.on('tick', () => {           // 시뮬레이션 기능을 사용하여 그래프의 노드와 링크(연결선)의 위치를 동적으로 업데이트
        link
          .attr('x1', (d) => d.source.x)      // 링크의 시작점 x 좌표를 설정합니다. d.source.x는 연결된 소스 노드의 x 좌표입니다.
          .attr('y1', (d) => d.source.y)      // 링크의 시작점 y 좌표를 설정합니다. d.source.y는 연결된 소스 노드의 y 좌표입니다.
          .attr('x2', (d) => d.target.x)      // 링크의 끝점 x 좌표를 설정합니다. d.target.x는 연결된 타겟 노드의 x 좌표입니다.
          .attr('y2', (d) => d.target.y);     // 링크의 끝점 y 좌표를 설정합니다. d.target.y는 연결된 타겟 노드의 y 좌표입니다.

        node
          .attr('transform', (d) => {
            if (d.label === 'Table') {
              return `translate(${d.x - 70 / 2},${d.y - 70 / 2})`;                // 사각형의 경우 중심을 기준으로 위치 조정
            } else {
              return `translate(${d.x},${d.y})`;                                  // 그 외의 경우 (원, 다이아몬드, 오각형 등)
            }
          });

        labels
          .selectAll('tspan')
          .attr('x', (d) => d.x)                                          // 라벨의 x 좌표를 설정합니다. 각 라벨은 해당 노드의 x 좌표에 위치합니다.
          .attr('y', (d, i, nodes) => d.y + (i - nodes.length / 2) * 10); // 라벨의 y 좌표를 설정합니다. 이 계산은 라벨을 노드 중심에 수직으로 정렬하기 위해 사용됩니다.

        linkText
          .attr('x', (d) => (d.source.x + d.target.x) / 2)                // 링크 텍스트의 x 좌표를 설정합니다. 이는 소스 노드와 타겟 노드의 중간 지점입니다.
          .attr('y', (d) => (d.source.y + d.target.y) / 2);               // 링크 텍스트의 y 좌표를 설정합니다. 이는 소스 노드와 타겟 노드의 중간 지점입니다.
      });
    },
  },
};
</script>

<style scoped>
.link {
  stroke: #999;
  stroke-opacity: 0.6;
}

.node {
  stroke: #fff;
  stroke-width: 1.5px;
}

/*TODO height 반응형 필요**/
.graph-container {
  position: relative;
  box-sizing: border-box; 
  width: 100%; 
  height: calc(100vh - 180px); 
  background-color: #ffffff; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>