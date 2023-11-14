<template>

</template>

<script>
    export default {
        name: 'bpmn-vue-finder',
        created: function () {
        },
        data: function () {
            return {
                bpmnVue: null
            }
        },
        watch: {},
        mounted: function () {
            //이 bpmn 요소(액티비티,롤,릴레이션)의 BpmnVue 를 등록한다.
            var bpmnVue = null;
            var parent;
            var getParent = function (component) {
                parent = component.$parent;
                if (parent) {
                    if (parent.bpmnRole == 'bpmn-vue') {
                        bpmnVue = parent;
                    } else {
                        getParent(parent);
                    }
                }
            }
            getParent(this);
            this.bpmnVue = bpmnVue;
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
