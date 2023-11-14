const BpmnVue = {
  install (Vue, opts = {}) {

    const files = require.context('.', true, /\.vue$/);
    const BpmnComponents = {}
    files.keys().forEach((key) => {
      if (key === './index.js') {
        return;
      }
      BpmnComponents[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
    });
    for (var key in BpmnComponents) {
      Vue.component(BpmnComponents[key].default.name, BpmnComponents[key].default);
    }

    //bpmn 컴포넌트 검색용
    Vue.bpmnComponents = BpmnComponents;

    //bpmn 용 이벤트 버스
    Vue.bpmnBus = new Vue();

    //bpmn 활성 컴포넌트 저장소
    Vue.bpmnLiveComponents = {};

    //윈도우 전역변수 등록 (다른 인스톨 플러그인에서 거진 하긴 해주지만 혹시 모르니...)
    if (window && !window.Vue) {
      window.Vue = Vue;
    }
  }
}

export default BpmnVue


