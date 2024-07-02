<template>
   <!-- free or paid-->
    <div v-if="isPaid" style="height: 100%;">
        <slot></slot>
    </div>

    <!-- not paid-->
    <div v-else @click="recordUsage()">
        <v-progress-linear
                v-if="loading"
                indeterminate
                color="green"
        ></v-progress-linear>

        <div class="text-blur" :style="blurStyle">
            <v-row dense justify="end" style="position: absolute; top: 5px;right: 5px; z-index: 999;">
                <v-icon small color="white">fas fa-lock</v-icon>
            </v-row>
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import Usage from "../../utils/Usage"

    export default {
        name: 'BlurServiceByUsage',
        mixins: [],
        components: {
           
        },
        props: {
            visualRange:{
                type: Number,
                default: function () {
                    return 30;
                }
            },
            serviceType: {
                type: String,
                default: function(){
                    return null;
                }
            },
            metadata: {
                type: Object,
                default: function(){
                    return {};
                }
            },
        },
        data() {
            return {
                loading: false,
                isPaid: false,
                usage: null
            }
        },
        watch: {},
        computed: {
            blurStyle() {
                if (this.isPaid) return null
                return {
                    // 'filter': 'blur(3px)',
                    'height': '100%',
                    '-webkit-mask-image': `linear-gradient(to top,hsla(360,100%,100%,0.0)${100 - this.visualRange}% , hsla(120,100%,100%,1.0))`,
                }
            },
           
        },
        async created() {
            let issuedTimeStamp = Date.now()
            this.usage = new Usage({
                serviceType: this.serviceType,
                issuedTimeStamp: issuedTimeStamp,
                expiredTimeStamp: issuedTimeStamp,
                metadata: this.metadata
            });
            this.checking = true
            this.isPaid = await this.checkUsage()
        },
        methods: {
            async checkUsage(){
                return await this.usage.check()
            },
            async recordUsage(){
                this.loading = true
                this.isPaid = await this.usage.use()
                this.loading = false
            },
        },
    }
</script>

