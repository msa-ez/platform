<template>
  <div class="dashboard">
    <app-menu ref="appMenu" class="menu-section"></app-menu>
    <div class="content-section">

      <file-select
       @send-success="handleSendData"
       @next-sequence="handleSequence"
       @error="handleError"
       @loading="setLoading"> 
      </file-select>

      <graph-show
      :data="CyperQuery || {}"
      @next-sequence="handleSequence"
      :loading="isLoading">
      </graph-show>

    </div>
  </div>
</template>

<script>
import FileSelect from './FileSelect.vue';
import GraphShow from './GraphShow.vue';
import AppMenu from './AppMenu.vue';

/** 
 * 역할:
 * - 파일 업로드, 그래프 표시, 에러 처리 등을 관리하는 대시보드 컴포넌트입니다.
 *
 * 구성 요소:
 * - FileSelect: 파일을 업로드하고 업로드 성공, 에러, 로딩 이벤트를 처리합니다.
 * - GraphShow: 업로드된 파일 데이터를 그래프 형태로 보여주며, 데이터 로딩 상태를 표시합니다.
 * - AppMenu: 애플리케이션 메뉴를 제공합니다.
 *
 * 로직 원리:
 * 1. 파일 업로드 성공 시 handleFileUpload 메소드를 통해 CyperQuery 데이터를 업데이트하고 로딩 상태를 false로 설정합니다.
 * 2. 에러 발생 시 handleError 메소드를 호출하여 에러를 로그하고 사용자에게 알림을 보냅니다.
 * 3. setLoading 메소드는 로딩 상태의 변경을 관리합니다.
 */

export default {
  components: {
    FileSelect,
    GraphShow,
    AppMenu
  },
  data() {
    return {
      CyperQuery: null,
      isLoading : false,
    };
  },
  methods: {
    handleSendData(cyperQuery) {
      this.CyperQuery = cyperQuery;
      this.setLoading(false);
      this.handleCompleteSequence(2);
    },
    handleSequence(index) {
      this.$refs.appMenu.setStatusTrue(index)
    },
    handleError(error) {
      console.error('Error:', error);
      this.setLoading(false);
      alert(error);
    },
    setLoading(status) {
      this.isLoading = status;
    },
  },
};
</script>

<style src="../../../../../public/static/legacy-modernizer/DashBoard.css"></style>
