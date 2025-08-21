<template>
  <div class="bpmn-js-editor-wrapper">
    <div class="bpmn-toolbar">
      <!-- <button @click="zoomIn">+</button>
      <button @click="zoomOut">-</button>
      <button @click="fitViewport">Fit</button>
      <button @click="downloadXml">Download XML</button> -->
    </div>
    <div ref="canvas" class="bpmn-canvas" />
  </div>
</template>

<script>
import BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import { applyBpmnAutoLayout } from '@/components/designer/modeling/generators/utils/BpmnAutoLayoutUtil.js';

export default {
  name: 'BpmnJsEditor',
  props: {
    xml: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      bpmnModeler: null,
      importError: null,
      _hasImported: false
    };
  },
  watch: {
    xml: {
      handler(newXml) {
        if (this.bpmnModeler && newXml) {
          // 초기 로드인 경우 바로 import
          if (!this._hasImported) {
            this.importDiagram(newXml);
          } else {
            // 이후 업데이트는 현재 XML과 비교
            this.bpmnModeler.saveXML().then(({ xml: currentXml }) => {
              if (currentXml !== newXml) {
                this.importDiagram(newXml);
              }
            }).catch(() => {
              // saveXML 실패 시 (초기 로드 중) 바로 import
              this.importDiagram(newXml);
            });
          }
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.bpmnModeler = new BpmnJS({
      container: this.$refs.canvas,
      // 팔레트 완전 비활성화
      paletteProvider: {
        getPaletteEntries: () => ({})
      },
      // 속성 패널 비활성화
      propertiesProvider: {
        getTabs: () => []
      },
      // 추가 모듈 비활성화
      additionalModules: []
    });
    
    // 팔레트 패널 강제로 숨기기
    this.$nextTick(() => {
      const palette = this.$el.querySelector('.djs-palette');
      if (palette) {
        palette.style.display = 'none';
      }
      
      // 속성 패널도 숨기기
      const propertiesPanel = this.$el.querySelector('.djs-properties-panel');
      if (propertiesPanel) {
        propertiesPanel.style.display = 'none';
      }
    });
    
    this.setupChangeListener();
  },
  beforeDestroy() {
    if (this.bpmnModeler) {
      this.bpmnModeler.destroy();
      this.bpmnModeler = null;
    }
  },
  methods: {
    async importDiagram(xml) {
      try {
        // Save current view state if it exists
        const canvas = this.bpmnModeler.get('canvas');
        const currentZoom = canvas.zoom();
        const viewbox = canvas.viewbox();

        await this.bpmnModeler.importXML(xml);
        this.importError = null;

        // Only set initial zoom if this is the first import
        if (!this._hasImported) {
          canvas.zoom(1.5);
          this._hasImported = true;
        } else {
          // Restore previous view state
          canvas.zoom(currentZoom);
          canvas.viewbox(viewbox);
        }
        
        this.updateLaneStroke();
      } catch (err) {
        this.importError = err;
      }
    },
    setupChangeListener() {
      this.bpmnModeler.on('commandStack.changed', async () => {
        const { xml } = await this.bpmnModeler.saveXML({ format: true });
        // XML이 실제로 변경된 경우에만 이벤트 발생
        if (xml !== this.xml) {
          this.$emit('update:xml', xml);
        }
        this.updateLaneStroke();
      });
    },
    zoomIn() {
      this.bpmnModeler.get('canvas').zoom('in');
    },
    zoomOut() {
      this.bpmnModeler.get('canvas').zoom('out');
    },
    fitViewport() {
      this.bpmnModeler.get('canvas').zoom('fit-viewport');
    },
    downloadXml() {
      (async () => {
        const { xml } = await this.bpmnModeler.saveXML({ format: true });
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram.bpmn';
        a.click();
        URL.revokeObjectURL(url);
      })();
    },
    async autoLayout() {
      if (!this.bpmnModeler) return;
      await applyBpmnAutoLayout(this.bpmnModeler);
      const { xml } = await this.bpmnModeler.saveXML({ format: true });
      this.$emit('update:xml', xml);
    },
    updateLaneStroke() {
      this.$nextTick(() => {
        const laneGroups = this.$el.querySelectorAll('.djs-element[data-element-id^="Lane_"]');
        laneGroups.forEach(group => {
          const visual = group.querySelector('g.djs-visual');
          if (visual) {
            const rect = visual.querySelector('rect');
            if (rect) {
              let style = rect.getAttribute('style') || '';
              style = style.replace(/stroke:\s*[^;]+;/, 'stroke: #B9BFD2;');
              style = style.replace(/stroke-width:\s*[^;]+;/, 'stroke-width: 2px;');
              style = style.replace(/fill:\s*[^;]+;/, 'fill: #F4FAFF;');
              rect.setAttribute('style', style);
            }
          }
        });
      });
    }
  }
};
</script>

<style>
.bpmn-js-editor-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.bpmn-toolbar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255,255,255,0.9);
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  padding: 4px 8px;
}
.bpmn-toolbar button {
  margin: 0 2px;
  padding: 2px 8px;
  font-size: 16px;
  cursor: pointer;
}
.bpmn-canvas {
  width: 100%;
  height: 700px;
  background: #fafbfc;
  border: 1px solid #eee;
  border-radius: 4px;
  margin: 0 auto;
  display: block;
}
.bpmn-canvas .djs-container .djs-connection path {
  stroke-width: 3px !important;
}
.bpmn-canvas .djs-container .djs-lane .djs-visual rect {
  stroke-width: 0.4px !important;
  stroke: #808080 !important;
}

/* 팔레트 패널 완전 숨기기 */
.bpmn-canvas .djs-palette {
  display: none !important;
}

/* 속성 패널 완전 숨기기 */
.bpmn-canvas .djs-properties-panel {
  display: none !important;
}
</style> 