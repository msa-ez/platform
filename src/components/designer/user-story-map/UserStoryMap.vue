<template>
    <UserStoryMapCanvas :key="componentKey" :render-count="componentKey" @forceUpdateKey="forceRerender()"/>
</template>

<script>
    import UserStoryMapCanvas from './UserStoryMapCanvas.vue'

    export default {
        name: 'user-story-map',
        components: {
            UserStoryMapCanvas
        },
        data() {
            return {
                componentKey: 0,
            }
        },
        methods: {
            forceRerender() {
                this.componentKey += 1;
            },
        }
    }
</script>
