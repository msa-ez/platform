<template>
    <div class="d-flex align-center">
        <v-progress-circular
            v-if="leftBoundedContextCount > 0"
            :value="progress"
            :indeterminate="progress === null"
            color="primary"
            size="20"
            :width="3"
            class="mr-3"
        ></v-progress-circular>

        <div v-if="leftBoundedContextCount > 0" 
            class="text-body-2"
        >
            <template v-if="directMessage">
                <span>{{ directMessage }}</span>
            </template>
            <template v-else>
                <span>
                    <strong>{{ leftBoundedContextCount }}</strong> Bounded Contexts remaining...
                </span>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'progress-info',
    props: {
        progress: {
            type: Number,
            required: false,
            default: null
        },

        leftBoundedContextCount: {
            type: Number,
            required: false,
            default: 0
        },

        directMessage: {
            type: String,
            required: false,
            default: ''
        }
    }
}
</script>