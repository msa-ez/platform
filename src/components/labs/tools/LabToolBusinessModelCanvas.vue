<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <business-model-canvas v-if="small"
                           ref="designer"
                           v-model="value.result"
                           @change="onResultChange"
                           @codeChange="onCodeChange"
                           is-read="true"
                           class="small"
    >
    </business-model-canvas>
    <business-model-canvas v-else
                           ref="designer"
                           v-model="value.result"
                           @change="onResultChange"
                           @codeChange="onCodeChange"
    >
    </business-model-canvas>
</template>

<script>

    import BusinessModelCanvas from "../../designer/business-model-canvas/BusinessModelCanvas";
    var jp = require('jsonpath');

    export default {
        name: 'lab-tool-business-model-canvas',
        props: {
            value: Object,
            small: Boolean
        },
        components:{BusinessModelCanvas},
        data() {
            return {
                url: '',
            }
        },

        created: function () {
            if (this.value.result == null) {
                this.value.result = {elements: {}, relations: {}};
            }
        },

        mounted: function () {
            var me = this;
            setTimeout(() => {
                me.$EventBus.$emit('progressValue', false)
            }, 2000)

        },
        methods: {
            onResultChange(change) {
                this.value.result = change;

                this.$emit('input', this.value);
                this.$emit('change', this.value);

            },
            onCodeChange(change) {
                this.value.code = change;
                this.value.modelForElements = change.modelForElements;
                this.value.rootModel = change.rootModel;

                this.$emit('input', this.value);
                this.$emit('change', this.value);

            },

            //for user checkpoint expressions
            query(exp) {
                return jp.query(this.value.modelForElements, exp);
            }
        }
    }
</script>


<style scoped lang="css" rel="stylesheet/css">

    .canvas-panel.small {
        left: 0;
        right: 0;
        width: 800px;
        height: 1000px;
        position: relative;
        overflow: hidden;

        transform: scale(0.5) translate(-50%, -50%);
    }

</style>



