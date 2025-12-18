<template>
    <div v-if="inference && !isStandardTransformed">
        <v-btn text color="primary" @click="isCotExpanded = !isCotExpanded">
            Chain Of Thoughts
            <v-icon right>{{ isCotExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
        <v-expand-transition>
            <div v-if="isCotExpanded" class="cot-content">{{ inference }}</div>
        </v-expand-transition>
    </div>
</template>


<script>
export default {
    name: 'CoTToggle',
    
    props: {
        inference: {
            type: String,
            required: false,
            default: ''
        },
        isStandardTransformed: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data() {
        return {
            isCotExpanded: false
        }
    }
}
</script>

<style scoped>
.cot-content {
    margin: 1rem 0;
    white-space: pre-wrap;
    font-family: monospace;
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>