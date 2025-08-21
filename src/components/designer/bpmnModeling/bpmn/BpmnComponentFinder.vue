<template>

</template>

<script>
    export default {
        name: 'bpmn-component-finder',
        created: function () {
        },
        data: function () {
            return {
                bpmnComponent: null
            }
        },
        watch: {},
        mounted: function () {
            //이 bpmn 요소(액티비티,롤,릴레이션)의 BpmnVue 를 등록한다.
            var bpmnComponent = null;
            var parent;
            var getParent = function (component) {
                parent = component.$parent;
                if (parent) {
                    if (parent.bpmnRole == 'bpmn-component') {
                        bpmnComponent = parent;
                    } else {
                        getParent(parent);
                    }
                }
            }
            getParent(this);
            this.bpmnComponent = bpmnComponent;
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">

</style>
