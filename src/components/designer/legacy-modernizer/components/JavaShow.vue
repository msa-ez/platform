<template>
  <div class="llm-ui">
    <div class="content-area">
      <VueMarkdown :source="serverResponse"></VueMarkdown>
    </div>
  </div>
</template>

<script>
import Cyper2JavaService from '../services/Cyper2JavaService';
import VueMarkdown from 'vue-markdown';

/**
 * 역할:
 * - 사용자 데이터를 자바 코드로 변환하고 결과를 표시하는 컴포넌트입니다.
 *
 * 구성 요소:
 * - VueMarkdown: 서버 응답을 마크다운 형식으로 렌더링합니다.
 *
 * 로직 원리:
 * 1. handleConvertJava 메소드는 사용자 데이터를 자바 코드로 변환하는 요청을 처리합니다.
 * 2. 이때 요청 전에 로딩 상태를 true로 설정하고, 요청 후에는 false로 설정합니다.
 * 3. 변환 과정 중 발생하는 에러를 적절히 처리하고 사용자에게 피드백을 제공합니다.
 * 4. 컴포넌트 마운트 시, Cyper2JavaService의 streamEmitter를 통해 'data' 이벤트 리스너를 등록합니다.
 * 5. 서버로부터 데이터 청크가 도착할 때마다 serverResponse에 이를 추가합니다.
 * 4. 컴포넌트 파괴 전에 모든 'data' 이벤트 리스너를 제거하여 메모리 누수를 방지합니다.
 */


export default {
  components: {
    VueMarkdown
  },
  data() {
    return {
      serverResponse: '',
      hasReceivedResponse: false,
    };
  },
  mounted() {
    Cyper2JavaService.streamEmitter.on('send-stream-data', (chunk) => {
      if (!this.hasReceivedResponse) {
        this.serverResponse = chunk;  
        this.hasReceivedResponse = true;
      } else {
        this.serverResponse += chunk;
      }
    });
  },
  beforeDestroy() {
    Cyper2JavaService.streamEmitter.removeAllListeners('send-stream-data');
  },
  methods: {
    async handleConvertJava(nodeInfo) {
      console.log("자바로 변환 시작");
      this.serverResponse = '변환중...';
      
      try {
        await Cyper2JavaService.uploadNodeInfo(nodeInfo);
      } catch (error) {
        this.serverResponse = `Error: ${error}`;
      } finally {
        this.$emit('loading', false);
      }
    },
  },
};
</script>

<style scoped src="../../../../../public/static/legacy-modernizer/JavaShow.css"></style>
