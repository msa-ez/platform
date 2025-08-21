<template>
    <div>
        <image-element
                v-if="loopType == 'Standard'"
                v-bind:image="loop_standard_image"
                :sub-width="'15px'"
                :sub-height="'15px'"
                :sub-bottom="'5px'"
                :sub-align="'center'"
        ></image-element>
        <geometry-element
                v-if="loopType == 'MIParallel'"
                :sub-width="'15px'"
                :sub-height="'15px'"
                :sub-bottom="'5px'"
                :sub-align="'center'"
        >
            <geometry-line :from="[0, 30]" :to="[0, 0]"></geometry-line>
            <geometry-line :from="[15, 30]" :to="[15, 0]"></geometry-line>
            <geometry-line :from="[30, 30]" :to="[30, 0]"></geometry-line>
        </geometry-element>
        <geometry-element
                v-if="loopType == 'MISequential'"
                :sub-width="'15px'"
                :sub-height="'15px'"
                :sub-bottom="'5px'"
                :sub-align="'center'"
        >
            <geometry-line :from="[0, 30]" :to="[30, 30]"></geometry-line>
            <geometry-line :from="[0, 15]" :to="[30, 15]"></geometry-line>
            <geometry-line :from="[0, 0]" :to="[30, 0]"></geometry-line>
        </geometry-element>
    </div>
</template>

<script>
    export default {
        name: 'bpmn-loop-type',
        props: {
            loopType: String
        },
        computed: {},
        data: function () {
            return {
                loop_standard_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/loop_standard.png'
            };
        },
        watch: {},
        mounted: function () {
        },
        methods: {}
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
</style>