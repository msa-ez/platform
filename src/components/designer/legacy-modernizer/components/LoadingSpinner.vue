<template>
  <div class="spinner-overlay">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>

/**
 * 역할:
 * - 로딩 중임을 사용자에게 알리는 시각적 표시를 제공합니다.
 * 
 * 구성 요소:
 * - spinner-overlay: 로딩 중인 상태를 전체 화면에 오버레이로 표시합니다.
 * - spinner-border: CSS를 통해 스타일링된 로딩 스피너를 표시합니다.
 * 'Loading...' 텍스트는 시각적으로 숨겨져 있으나, 스크린 리더를 사용하는 사용자를 위해 접근성을 제공합니다.
 */

export default {
  name: 'LoadingSpinner'
};
</script>

<style scoped src="../../../../../public/static/legacy-modernizer/LoadingSpinner.css"></style>