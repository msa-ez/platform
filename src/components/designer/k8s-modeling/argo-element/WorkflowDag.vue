<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:labelChanged="onLabelChanged"
                v-on:addedToGroup="onAddedToGroup"
                v-on:dblclick="showWorkflowPanel"
                v-on:removeShape="beforeRemove(value); onRemoveShape(value)"
                :label.sync="name"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }">

            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#98cbff',
                        fill: '#98cbff',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
            
            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="5"
                        :text="value.name">
                </text-element>
            </sub-elements>
        </geometry-element>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'workflowDag',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        props: {},
        computed: {
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/argo/argo-icon-color.svg`
            },
            className() {
                return 'WorkflowDag'
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: "",
                    parentId: object ? object.elementView.id : "",
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: {
                        "name": "",
                        "template": "",
                        "arguments": {
                            "parameters": []
                        }
                    },
                    index: object ? object.tasks.length : -1,
                    connectableType: [ "WorkflowDag" ],
                }
            },
            name() {
                try {
                    return this.value.object.name;
                } catch (e) {
                    return "Untitled";
                }
            },
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        mounted: function () {
            var me = this;

            var parentElement = me.canvas.value.elements[me.value.parentId];
            if (parentElement) {
                if (!parentElement.tasks.includes(me.value.elementView.id)) {
                    me.onRemoveShape(me.value);
                } else {
                    me.value.name = parentElement.object.spec.templates[0].dag.tasks[me.value.index];
                }
            }

            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action=="addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "WorkflowDag"
                    && obj.element.targetElement.elementView.id == me.value.elementView.id) {
                    if(obj.element.targetElement.object.dependencies == undefined) {
                        obj.element.targetElement.object.dependencies = [];
                        obj.element.targetElement.object.dependencies.push(obj.element.sourceElement.object.name);
                    }
                    obj.element.targetElement.object.dependencies.forEach(name => {
                        if(name == obj.element.sourceElement.object.name) {
                            return;
                        } else {
                            obj.element.targetElement.object.dependencies.push(obj.element.sourceElement.object.name);
                        }
                    });
                    var item = {
                        action: "updateDag",
                        element: obj.element.targetElement
                    };
                    me.$EventBus.$emit(`${me.value.parentId}`, item);
                }
                if(obj.action=="deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "WorkflowDag"
                    && obj.element.targetElement.elementView.id == me.value.elementView.id) {
                    me.value.object.dependencies.splice(me.value.object.dependencies.indexOf(obj.element.sourceElement.object.name), 1);
                }
            });
        },
        watch: {
        },
        methods: {
            // override
            onActivityDeselected(){
                var me = this;
                if (me.value) {
                    me.openPanel = false
                    me.$EventBus.$emit(`${me.value.parentId}`, {
                        action: "closeProperty",
                        element: me.value
                    });
                }
            },
            beforeRemove(value) {
                var me = this;
                var obj = {
                    action: "deleteDag",
                    element: value
                }
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            },
            showWorkflowPanel() {
                var me = this;
                var obj = {
                    action: "showProperty",
                    element: me.value
                };
                me.$EventBus.$emit(`${me.value.parentId}`, obj);
            }
        },
    }
</script>

<style>

</style>