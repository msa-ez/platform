<template>
    <div class="bc-matrix">
      <div class="matrix-container">
        <div class="y-axis-label">Model Complexity</div>
        <div class="y-axis">
          <div>High</div>
          <div>Low</div>
        </div>
  
        <!-- 매트릭스 영역 -->
        <div class="matrix-area">
          <div v-for="bc in boundedContexts" 
               :key="bc.name"
               class="bc-item"
               :style="getBcStyle(bc)"
               :title="`${bc.alias}\n중요도: ${bc.importance}`">
            {{ bc.alias }}
          </div>
        </div>
  
        <div class="x-axis">Business Differentiation</div>
        <div class="x-axis-label">
          <div>Low</div>
          <div>High</div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BoundedContextMatrix',
    props: {
      boundedContexts: {
        type: Array,
        required: true
      }
    },
    methods: {
      getBcStyle(bc) {
        // 좌표계 반전 (bottom은 위에서부터, left는 왼쪽에서부터 계산)
        return {
          backgroundColor: this.getDomainColor(bc.importance),
          position: 'absolute',
          left: `${bc.differentiation * 100}%`,
          bottom: `${bc.complexity * 100}%`,
          transform: 'translate(-50%, 50%)',
          cursor: 'pointer',
          minWidth: '100px'
        }
      },
      getDomainColor(importance) {
        const colors = {
          'Core Domain': '#8fbcaa',
          'Supporting Domain': '#b39ddb',
          'Generic Domain': '#9e9e9e'
        }
        return colors[importance] || '#ddd'
      }
    }
  }
  </script>
  
  <style scoped>
  .bc-matrix {
    padding: 20px;
  }
  
  .matrix-container {
    position: relative;
    display: grid;
    grid-template-columns: 30px 1fr;
    grid-template-rows: 1fr 30px;
    gap: 10px;
    height: 600px;
  }
  
  .matrix-area {
    position: relative;
    border: 1px solid #ccc;
    background: #fff;
    grid-column: 2;
    grid-row: 1;
  }
  
  .bc-item {
    position: absolute;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    z-index: 1;
    white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  }
  
  .bc-item:hover {
    transform: translate(-50%, 50%) scale(1.1) !important;
    z-index: 2;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  .y-axis-label {
    writing-mode: vertical-lr;
    transform: rotate(180deg);
    text-align: center;
    grid-row: 1;
    grid-column: 1;
  }
  
  .y-axis {
    position: absolute;
    left: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0;
  }

  .y-axis div {
    font-size: 12px;
    transform: translateX(-50%);
  }

  .y-axis div:first-child {  /* High */
    margin-top: 10px;
  }

  .y-axis div:last-child {   /* Low */
    margin-bottom: 10px;
  }
  
  .x-axis {
    grid-column: 2;
    text-align: center;
    padding-top: 5px;
  }
  
  .x-axis-label {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    grid-column: 2;
  }
  
  /* 매트릭스 그리드 라인 */
  .matrix-area::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    border-top: 1px dashed #ccc;
  }
  
  .matrix-area::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    border-left: 1px dashed #ccc;
  }
  </style>