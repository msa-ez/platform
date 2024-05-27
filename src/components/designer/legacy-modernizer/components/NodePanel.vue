<template>
  <div class="node-info-panel">
    <div class="table-name">{{ data.name }} 테이블</div>
    <button @click="handleUploadNodeInfo" class="btn btn-primary">자바로 변환</button>
  </div>
</template>

<script>

/**
 * 역할:
 * - 노드의 정보를 표시하고, 해당 정보를 자바 코드로 변환하는 요청을 서버에 전송하는 기능을 제공합니다.
 * 
 * 구성 요소:
 * - props:
 *   - data: 노드 데이터 객체입니다. 필수입니다.
 * - methods:
 *   - handleUploadNodeInfo: 사용자가 버튼을 클릭할 때 실행되며, 노드 데이터를 자바 코드로 변환하는 요청을 서버에 전송합니다.
 * 
 * 로직 원리:
 * 1. 사용자가 '자바로 변환' 버튼을 클릭합니다.
 * 2. handleUploadNodeInfo 메소드가 호출되며, 이 메소드는 노드 데이터를 이용하여 서버에 자바 코드 변환을 요청합니다.
 * 3. 요청이 성공하면, 변환된 자바 코드를 받아 사용자에게 표시할 수 있습니다.
 * 4. 요청 과정 중에는 로딩 상태를 관리하고, 성공 또는 실패 이벤트를 발생시킵니다.
 */

export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  methods: {
    async handleUploadNodeInfo() {
      console.log("테이블 노드 정보 전달");
      this.$emit('node-info-send', { id: this.data.id });
    }
  }
};
</script>

<style scoped src="../../../../../public/static/legacy-modernizer/NodeInfoPanel.css"></style>