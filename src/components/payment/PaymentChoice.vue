<template>
    <div>
        <v-card >
            코인 결제
        </v-card>
        <v-card>
            구독 상품
        </v-card>
        <v-card>
            단일 상품
        </v-card>
    </div>
</template>

<script>
    import StorageBase from "../designer/modeling/StorageBase";

    export default {
        name: 'payment-choice',
        mixins: [StorageBase],
        data() {
            return {
            }
        },
        created() {

        },
        components: {},
        computed: {},
        methods: {},
    }
</script>

<style>

</style>