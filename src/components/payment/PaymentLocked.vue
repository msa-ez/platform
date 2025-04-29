<template>
    <div style="width: 100%; height: 100%;">
        <div :style="blurStyleByOpenRange">
            <slot></slot>
        </div>
        <div v-if="isLocked" style="position: absolute;top: 50%;right: 50%;">
            <v-icon @click="release()" x-large dark>mdi-lock-outline</v-icon>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'payment-locked',
        props: {
            value: Boolean,
        },
        mixins: [],
        components: {},
        data: () => ({}),
        created() {

        },
        watch: {},
        computed: {
            isLocked() {
                return this.value
            },

            blurStyleByOpenRange() {
                var me = this
                if (me.isLocked) {
                    return {
                        'height': '100%',
                        'filter': 'blur(5px)'
                    }
                }
                return {'height': '100%'}

            },
        },
        methods: {
            release() {
                this.$emit('locked', false)
            },
        }
    }
</script>

