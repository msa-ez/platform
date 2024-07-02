<template>
  <div class="table-info-panel">
    <v-row class="ma-0 pa-0"
      style="padding:10px 0px !important;"
    >
      <v-card-title class="ma-0 pa-0">{{ data.name }} 테이블</v-card-title>
      <v-spacer></v-spacer>
      <v-btn @click="handleUploadNodeInfo()"
        color="primary"
        small
        style="margin-right:5px;"
      >자바로 변환</v-btn>
      <v-btn @click=""
        icon small
      >
        <Icon icon="iconamoon:arrow-down-2" width="20" height="20"></Icon>
      </v-btn>
    </v-row>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">속성 이름</th>
          <th scope="col">속성 값</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, key) in filteredData" :key="key">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
/**
 * 역할:
 * - 데이터 객체에서 특정 속성을 제외한 정보를 테이블 형태로 표시하는 컴포넌트입니다.
 *
 * 구성 요소:
 * - data: 부모 컴포넌트로부터 받은 데이터 객체입니다.
 * - filteredData: 표시할 데이터에서 특정 키를 제외한 데이터를 계산하여 반환합니다.
 *
 * 로직 원리:
 * 1. 부모 컴포넌트로부터 data 객체를 props로 받습니다.
 * 2. filteredData 계산 속성을 통해 'index', 'x', 'y', 'vx', 'vy', 'fx', 'fy' 키를 제외한 데이터를 필터링합니다.
 * 3. 필터링된 데이터를 테이블 형태로 사용자에게 보여줍니다.
 */
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    filteredData() {
      const excludeKeys = ['index', 'x', 'y', 'vx', 'vy', 'fx', 'fy'];
      const result = {};
      Object.keys(this.data).forEach(key => {
        if (!excludeKeys.includes(key)) {
          result[key] = this.data[key];
        }
      });
      return result;
    }
  },
  methods: {
    async handleUploadNodeInfo() {
      this.$emit('node-info-send', { id: this.data.id });
    }
  },
}
</script>

<style scoped>
.table-info-panel {
  overflow: auto;
  padding:10px;
}

.table {
  width: 100%;
  border-collapse: collapse; /* 테이블의 테두리를 겹치게 함 */
  margin-bottom:10px;
}

.table th, .table td {
  padding: 8px; /* 셀 패딩 */
  text-align: left; /* 텍스트 왼쪽 정렬 */
  border-bottom: 1px solid #ddd; /* 셀 하단 테두리 */
}

.table th {
  background-color: #f2f2f2; /* 헤더 배경색 */
  color: #333; /* 헤더 텍스트 색상 */
}

</style>