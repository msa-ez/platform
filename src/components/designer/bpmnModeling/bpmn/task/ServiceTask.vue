<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                connectable
                deletable
                :id.sync="value.tracingTag"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :_style.sync="style"
                :parentId.sync="value.elementView.parent"
                :label.sync="namePanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:dblclick="showProperty"
                v-on:selectShape="closeComponentChanger(); selectedActivity();"
                v-on:deSelectShape="closeComponentChanger(); deSelectedActivity();"
                v-on:removeShape="onRemoveShape"
                v-on:redrawShape="closeComponentChanger"
                v-on:addedToGroup="onAddedToGroup"
        >
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.2,
                        fill: '#FFFFFF',
                        'fill-opacity': 0,
                        r: '10'
                    }"
            ></geometry-rect>

            <sub-elements>
                <image-element
                        v-bind:image="service_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-top="'5px'"
                        :sub-left="'5px'"
                ></image-element>
                <bpmn-loop-type :loopType="loopType"></bpmn-loop-type>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-task-panel
                v-if="drawer"
                v-model="value"
                :linkList.sync="links"
                @close="closePanel"
                @giveJSONHint="giveJSONHint"
        ></bpmn-task-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel from './TaskPanel';
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-service-task',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'bpmn-task-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle() {
                return {}
            },
            type() {
                return 'Task'
            },
            className() {
                return 'org.uengine.kernel.bpmn.ServiceTask'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    role: {
                        name: ''
                    },
                    outputMapping: [],
                    tracingTag: newTracingTag,
                    selected: false,
                    elementView: {
                        '_type': 'org.uengine.kernel.view.DefaultActivityView',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    }
                }
            }
        },
        data: function () {
            return {
                links: null,
                service_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? 
                    '' : '/') + 'static/image/symbol/Service.png'
            };
        },
        watch: {
            drawer: function (opened) {
                if (opened) {
                    this.value.role.name =
                    this.bpmnVue.getWhereRoleAmIByTracingTag(this.value.tracingTag);

                    var me = this;
                    var serviceId = this.value.role.name;

                    this.$root.codi('eureka/apps/' + this.value.role.name).get()
                        .then(function (response) {

                        var homepage = response.data.application.instance[0].homePageUrl; //dont' use
                        homepage = serviceId.toLowerCase(); //use path by zuul rather

                        me.$root.codi(homepage).get().then(function(response2){
                            if(response2.data._links){
                              me.links = response2.data._links;
                            }
                        });

                    });
                }
            },
        },
        created: function() {
          if(!this.value.role)
              this.value.role = {name:''};
        },
        mounted: function () {
        },
        methods: {
            giveJSONHint: function(){
                var url = function(href) {
                    var l = document.createElement("a");
                    l.href = href;
                    l.path = l.pathname.substr(1);

                    try {
                        l.path = l.path.split("%7")[0];
                    } catch(e) {}

                    return l;
                };

                var link = url(this.value.uriTemplate);

                var me = this;
                this.$root.codi(link.path).get().then(function(response){
                    if(response.data._links.profile){
                        var link = url(response.data._links.profile.href);

                        me.$root.codi(link.path).get().then(function(response){
                            console.log(response.data);

                            if(response.data.alps.descriptors[0].descriptors){
                                var jsonHint = {};

                                response.data.alps.descriptors[0].descriptors.forEach(function(property){
                                    jsonHint[property.name] = '<%='+property.name+'%>';
                                });

                                me.value.inputPayloadTemplate = JSON.stringify(jsonHint, null, 2);
                                var temp = me.value;
                                me.value = null;
                                me.value = temp;
                            }
                        });
                    }
                });
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
