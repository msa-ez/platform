<template>
    <div>
        <sub-controller
                v-if="clone.intermediate"
                cloneable
                :image="'event_intermediate.png'"
                v-on:clone="intermediateClone">
            <circle-element :width="100" :height="28"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.end"
                cloneable
                :image="'event_end.png'"
                v-on:clone="endClone">
            <circle-element :width="30" :height="30"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.gateway"
                cloneable
                :image="'gateway_exclusive.png'"
                v-on:clone="exclusiveGatewayClone">
            <circle-element :width="40" :height="40"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.task"
                cloneable
                :image="'task.png'"
                v-on:clone="taskClone">
            <circle-element :width="100" :height="70"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.annotaion"
                cloneable
                :image="'annotation.png'"
                v-on:clone="annotaionClone">
            <circle-element :width="100" :height="30"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.call"
                :image="'popup.png'"
                v-on:click="popDefinition">
            <circle-element :width="100" :height="30"></circle-element>
        </sub-controller>

        <sub-controller
                v-if="clone.wrench"
                :image="'wrench.png'"
                v-on:click="showComponentChange"
        ></sub-controller>

        <!-- <sub-controller
            v-if="clone.deleteActivity"
            :image="'trash.png'"
            v-on:click="deleteActivity">
        </sub-controller> -->
    </div>
</template>

<script>
    import BpmnVueFinder from './BpmnVueFinder'
    import BpmnComponentFinder from './BpmnComponentFinder'

    export default {
        mixins: [BpmnVueFinder, BpmnComponentFinder],
        name: 'bpmn-sub-controller',
        props: {
            type: String,
            className: String,
            calleeDefinitionId:String
        },
        computed: {},
        data: function () {
            return {
                clone: {
                    intermediate: false,
                    end: false,
                    gateway: false,
                    task: false,
                    annotaion: false,
                    wrench: false,
                    call: false,
                    deleteActivity: false
                }
            }
        },
        watch: {},
        mounted: function () {
            //종료 이벤트인 경우 어노테이션, 도형바꾸기만 가능.
            if (this.type == 'EndEvent') {
                this.clone.annotaion = true;
                this.clone.wrench = true;
                this.clone.deleteActivity = true;
            }

            //풀은 도형바꾸기 불가능
            else if (this.type == 'Pool') {
                this.clone.intermediate = true;
                this.clone.end = true;
                this.clone.gateway = true;
                this.clone.task = true;
                this.clone.annotaion = true;
                this.clone.deleteActivity = true;
            }

            //데이터나 롤은 어노테이션만 가능
            else if (this.type == 'Data' || this.type == 'Role') {
                this.clone.annotaion = true;
                this.clone.deleteActivity = true;
            }
            else if (this.className == 'org.uengine.kernel.bpmn.CallActivity'){
                this.clone.intermediate = true;
                this.clone.end = true;
                this.clone.gateway = true;
                this.clone.task = true;
                this.clone.annotaion = true;
                this.clone.wrench = true;
                this.clone.call = true;
                this.clone.deleteActivity = true;
            }
            //나머지는 모두 가능
            else {
                this.clone.intermediate = true;
                this.clone.end = true;
                this.clone.gateway = true;
                this.clone.task = true;
                this.clone.annotaion = true;
                this.clone.wrench = true;
                this.clone.deleteActivity = true;
            }
        },
        /**
         * clone : 컨트롤러에 의해 신규 bpmn 이 생성되었을 경우
         * showComponentChange : 컨트롤러중 렌치 모양을 클릭하여 도형 변경 창을 여는 경우
         */
        methods: {
            deleteActivity: function () {
                this.$root.$children[0].$children[3].$children[2].deleteActivity();
                console.log(this.$root.$children[0].$children[3].$children[2]);
            },
            popDefinition: function () {
                window.open('#/definition/' + this.bpmnComponent.value.definitionId, '_blank')
            },
            createEdgeAndElement: function (edgeElement, sourceElement, targetElement, component) {
                var me = this;

                let boundary = targetElement.shape.geom.getBoundary();
                var targetInfo = {
                    x: boundary.getCentroid().x,
                    y: boundary.getCentroid().y,
                    width: boundary.getWidth(),
                    height: boundary.getHeight(),
                    component: component
                }

                if(me.bpmnVue) {
                    // make element
                    var newTracingTag = me.bpmnVue.createNewTracingTag();
                    var targetValue = me.bpmnVue.addElement(targetInfo, newTracingTag);
                    me.bpmnVue.canvas.removeShape(targetElement);

                    // make relation
                    me.customConnectShape(edgeElement, sourceElement, targetValue);
                }
            },
            customConnectShape: function (edge, from, toValue) {
                var me = this;

                if (edge && from && toValue) {
                    var vertices = '[' + edge.shape.geom.vertices.toString() + ']';
                    var sourceComponent = from.$parent ? from.$parent : from
                    var sourceValue = sourceComponent.value ? sourceComponent.value : sourceComponent
                    
                    var edgeInfo = {
                        component: 'bpmn-relation',
                        from: sourceValue,
                        to: toValue,
                        vertices: vertices,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }
                    me.bpmnVue.addElement(edgeInfo)
                }
            },
            intermediateClone: function (edgeElement, sourceElement, targetElement) {
                this.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'bpmn-intermediate-event');
            },
            endClone: function (edgeElement, sourceElement, targetElement) {
                this.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'bpmn-end-event');
            },
            exclusiveGatewayClone: function (edgeElement, sourceElement, targetElement) {
                this.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'bpmn-exclusive-gateway');
            },
            taskClone: function (edgeElement, sourceElement, targetElement) {
                this.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'bpmn-task');
            },
            annotaionClone: function (edgeElement, sourceElement, targetElement) {
                this.createEdgeAndElement(edgeElement, sourceElement, targetElement, 'bpmn-annotaion');
            },
            showComponentChange: function (event, opengraphComponent) {
                if (this.bpmnComponent) {
                    // console.log('showComponentChange', this.bpmnComponent.value.elementView);
                    var canvasEl = $(this.bpmnVue.canvas._CONTAINER);
                    var x = opengraphComponent.x;
                    var y = opengraphComponent.y;
                    var width = opengraphComponent.width;
                    var height = opengraphComponent.height;

                    var pageX = x * this.bpmnVue.canvas.getScale() + canvasEl.offset().left - canvasEl[0].scrollLeft;
                    var pageY = y * this.bpmnVue.canvas.getScale() + canvasEl.offset().top - canvasEl[0].scrollTop;
                    // var pageX = x + canvasEl.offset().left - canvasEl[0].scrollLeft;
                    // var pageY = y + canvasEl.offset().top - canvasEl[0].scrollTop;
                    var top = pageY - 70;
                    var left = pageX + (width / 2 + 10);
                    this.bpmnComponent.openComponentChanger(top, left);
                }
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

