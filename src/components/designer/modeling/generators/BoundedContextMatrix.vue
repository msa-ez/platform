<template>
  <div class="pt-4 pb-4">
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
                   :title="`${bc.alias}\n중요도: ${bc.importance}\n복잡성: ${bc.complexity}\n차별성: ${bc.differentiation}\n구현 전략: ${bc.implementationStrategy}`">
                  {{ bc.alias }}
              </div>
          </div>

          <div class="x-axis-container">
              <div class="x-axis-label">Low</div>
              <div class="x-axis">Business Differentiation</div>
              <div class="x-axis-label">High</div>
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
        // 복잡도와 차별성이 비슷한 BC들을 구분하기 위한 오프셋 계산
        const offset = this.calculateOffset(bc);
        const idealXPercent = bc.differentiation * 100 + offset.x;
        const idealYPercent = bc.complexity * 100 + offset.y;

        let cssLeftValue;
        let cssTranslateXPercent;

        // Adjust positioning for items near horizontal edges
        // to prevent overflow, especially with long names.
        if (bc.differentiation >= 0.9) { // Near the right edge
          // Position item so its right edge is at idealXPercent (capped at 100%)
          cssLeftValue = Math.min(idealXPercent, 100);
          cssTranslateXPercent = -100; // translateX by -100% to align item's right edge
        } else if (bc.differentiation <= 0.1) { // Near the left edge
          // Position item so its left edge is at idealXPercent (capped at 0%)
          cssLeftValue = Math.max(idealXPercent, 0);
          cssTranslateXPercent = 0;    // translateX by 0% to align item's left edge
        } else {
          // Default behavior: item's center is at idealXPercent
          cssLeftValue = idealXPercent;
          cssTranslateXPercent = -50;  // translateX by -50% to center the item
        }

        const cssTranslateYPercent = 50; // translateY by 50% to center vertically (given 'bottom' positioning)
        
        return {
          backgroundColor: this.getDomainColor(bc.importance),
          position: 'absolute',
          left: `${cssLeftValue}%`,
          bottom: `${idealYPercent}%`,
          transform: `translate(${cssTranslateXPercent}%, ${cssTranslateYPercent}%)`,
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
      },
      calculateOffset(currentBc) {
        const offsetStep = 2; // 오프셋 크기 (%)
        let xOffset = 0;
        let yOffset = 0;

        // 다른 BC들과 위치 비교
        this.boundedContexts.forEach(bc => {
          if (bc !== currentBc) {
            const complexityDiff = Math.abs(bc.complexity - currentBc.complexity);
            const differentiationDiff = Math.abs(bc.differentiation - currentBc.differentiation);
            
            // 복잡도와 차별성이 매우 비슷한 경우 (임계값: 0.1)
            if (complexityDiff < 0.1 && differentiationDiff < 0.1) {
              // BC 이름의 첫 글자를 기준으로 일관된 오프셋 적용
              const nameCompare = currentBc.name.localeCompare(bc.name);
              if (nameCompare > 0) {
                xOffset += offsetStep;
                yOffset += offsetStep;
              }
            }
          }
        });

        return { x: xOffset, y: yOffset };
      },
    }
  }
  </script>

<style scoped>
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
  white-space: nowrap;
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
  top: -15px;
  height: 93%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.x-axis-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: 2;
  padding: 0 10px;
}

.x-axis {
  text-align: center;
  padding-top: 5px;
}

.x-axis-label {
  font-size: 12px;
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