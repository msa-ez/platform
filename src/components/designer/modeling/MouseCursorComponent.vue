<template>
  <div class="mouse-cursor" :id="email">
    <div class="mouse-cursor-name">
      <v-chip small :color="mouseEvent.color" text-color="white">
        {{ mouseEvent.name }}
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
    name: 'mouse-cursor-Component',
    props: {
        mouseEvent: Object,
        email: String
    }
}
</script>