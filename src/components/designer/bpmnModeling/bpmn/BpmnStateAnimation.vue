<template>
    <div>
        <div v-if="status == 'Failed'">
            <!--Failed 체크 이미지-->
            <div v-if="type == 'StartEvent' || type == 'EndEvent' || type == 'IntermediateEvent' || type == 'Gateway'">
                <image-element
                        v-bind:image="failed_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                >
                    <md-tooltip md-direction="bottom">My tooltip</md-tooltip>
                </image-element>
            </div>
            <div v-else>
                <image-element
                        v-bind:image="failed_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'6%'"
                        :sub-top="'5px'"
                >
                    <md-tooltip md-direction="bottom">My tooltip</md-tooltip>
                </image-element>
            </div>
        </div>

        <div v-if="status == 'Stopped'">
            <!--Stopped 체크 이미지-->
            <div v-if="type == 'StartEvent' || type == 'EndEvent' || type == 'IntermediateEvent' || type == 'Gateway'">
                <image-element
                        v-bind:image="stopped_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                ></image-element>
            </div>
            <div v-else>
                <image-element
                        v-bind:image="stopped_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'6%'"
                        :sub-top="'5px'"
                ></image-element>
            </div>
        </div>

        <div v-if="status == 'Completed'">
            <!--Completed 체크 이미지-->
            <div v-if="type == 'StartEvent' || type == 'EndEvent' || type == 'IntermediateEvent' || type == 'Gateway'">
                <image-element
                        v-bind:image="complete_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                >
                    <md-tooltip md-direction="right">My tooltip</md-tooltip>
                </image-element>
            </div>
            <div v-else>
                <image-element
                        v-bind:image="complete_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'6%'"
                        :sub-top="'5px'"
                ></image-element>
            </div>
        </div>
      
        <div v-if="status == 'Running'">
            <!--Running 체크 이미지-->
            <div v-if="type == 'StartEvent' || type == 'EndEvent' || type == 'IntermediateEvent' || type == 'Gateway'">
                <image-element
                        v-bind:image="running_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'-10px'"
                        :sub-bottom="'-5px'"
                ></image-element>
            </div>
            <div v-else>
                <image-element
                        v-bind:image="running_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-align="'center'"
                        :sub-top="'0px'"
                ></image-element>
            </div>
            
            <!--Running 테두리 애니메이션-->
            <component :is="(type == 'StartEvent' || type == 'EndEvent' || type == 'IntermediateEvent' || type == 'Gateway') ? 
                    'circle-element' : 'rectangle-element'"
                    :sub-z-index="-1"
                    :sub-width="'120%'"
                    :sub-height="'120%'"
                    :sub-right="'-10%'"
                    :sub-bottom="'-10%'"
                    :sub-style="animationStyle"
            ></component>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'bpmn-state-animation',
        props: {
            status: String,
            type: String,
            faultMessage: String
        },
        data: function () {
            var animationStyle = {
                'fill-opacity': 1,
                'animation': [
                    {
                        start: {
                            fill: 'white'
                        },
                        to: {
                            fill: '#C9E2FC'
                        },
                        ms: 1000
                    },
                    {
                        start: {
                            fill: '#C9E2FC'
                        },
                        to: {
                            fill: 'white'
                        },
                        ms: 1000,
                        delay: 1000
                    }
                ],
                'animation-repeat': true,
                'fill': '#C9E2FC',
                'r': '10',
                'stroke-width': '0.2',
                'stroke-dasharray': '--'
            };
            if (this.type == 'StartEvent' || this.type == 'EndEvent' || this.type == 'IntermediateEvent' || this.type == 'Gateway') {
                delete animationStyle.r;
            }
            return {
                animationStyle: animationStyle,
                complete_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/complete.png',
                running_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/running.png',
                stopped_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/stopped.png',
                failed_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/failed.png',
                // faultMessage: ''
            }
        },
        watch: {},
        mounted() {},
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
