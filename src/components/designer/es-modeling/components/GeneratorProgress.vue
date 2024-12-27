<template>
    <v-row v-if="!generateDone" 
           class="generator-progress">
        <v-card elevation="2" class="pa-2">
            <div class="d-flex align-center">
                <v-progress-circular
                    :value="progress"
                    :indeterminate="progress === null"
                    color="primary"
                    size="24"
                ></v-progress-circular>
                
                <span class="ml-3">{{ displayMessage }}</span>
                
                <v-btn 
                    @click="stopGeneration"
                    color="error"
                    class="ml-2"
                    small
                    outlined
                >
                    <v-icon left small>mdi-stop</v-icon>
                    중지
                </v-btn>
            </div>
        </v-card>
    </v-row>
</template>

<script>
    export default {
        name: 'generator-progress',
        props: {
            generateDone: {
                type: Boolean,
                default: false
            },
            displayMessage: {
                type: String,
                default: ''
            },
            progress: {
                type: Number,
                default: null
            }
        },
        methods: {
            stopGeneration() {
                this.$emit('stopGeneration')
            }
        }
    }
</script>