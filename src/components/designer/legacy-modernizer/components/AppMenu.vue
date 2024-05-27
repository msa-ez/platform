<template>
  <div class="app-menu">
    <div class="menu-title">Stored procedure to Java</div>
    <v-divider class="divider-style"></v-divider>
    <v-row class="ma-0 pa-0 d-flex justify-left">
      <v-col cols="12" class="d-flex justify-left">
        <svg width="30" height="30">
          <polygon points="15,0 30,15 22.5,30 7.5,30 0,15" style="fill:#F28B66;" transform="rotate(180, 15, 15)"></polygon>
        </svg>
        <div class="shape-description-text">Procedure</div>
      </v-col>
      <v-col cols="12" class="d-flex justify-left">
        <svg width="30" height="30">
          <polygon points="15,0 30,15 15,30 0,15" style="fill:#57C7E3;"></polygon>
        </svg>
        <div class="shape-description-text">Flow Control</div>
      </v-col>
      <v-col cols="12" class="d-flex justify-left">
        <svg width="30" height="30">
          <circle cx="15" cy="15" r="15" fill="hsl(200, 100%, 70%)"></circle>
        </svg>
        <div class="shape-description-text">Operation</div>
      </v-col>
      <v-col cols="12" class="d-flex justify-left">
        <svg width="30" height="30">
          <rect width="30" height="30" fill="#FFC454"></rect>
        </svg>
        <div class="shape-description-text">Entity</div>
      </v-col>
    </v-row>
    <v-divider class="divider-style"></v-divider>
    <ul>
      <li v-for="(flowchart, index) in flowcharts" :key="index"
        class="text-center"
      >
        <v-card
          class="flowchart-card"
          outlined
          :style="flowchart.status == true ? 'background-color:#1976D2; color:white;' : ''"
        >
          {{ flowchart.name }}
        </v-card>
        <!-- 마지막 카드가 아닐 경우 화살표를 표시 -->
        <v-icon v-if="index < flowcharts.length - 1" class="arrow-down">mdi-arrow-down</v-icon>
      </li>
    </ul>
  </div>
</template>

<script>

/**
 * 역할: 애플리케이션의 메뉴를 관리합니다.
 * 기능: 사용자가 선택할 수 있는 메뉴 옵션을 제공합니다.
 */

export default {
  name: 'AppMenu',
  data() {
    return {
      flowcharts: [
        {
          name : 'Upload Stored Procedure Code',
          status: true
        },
        {
          name : 'Analyzing Code Structure',
          status: false
        },
        {
          name : 'Understanding & Convert to Graph',
          status: false
        },
        {
          name : 'Select Entity',
          status: false
        },
        {
          name : 'ava Code Generation',
          status: false
        },
      ]
    }
  },
};
</script>

<style scoped src="../../../../../public/static/legacy-modernizer/AppMenu.css"></style>
