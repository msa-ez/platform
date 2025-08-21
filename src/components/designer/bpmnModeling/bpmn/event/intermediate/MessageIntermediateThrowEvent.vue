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
            <geometry-circle
                    :center="[50,50]"
                    :radius="50"
            ></geometry-circle>

            <geometry-circle
                    :center="[50,50]"
                    :radius="40"
                    :_style="{
                        'stroke-width': 1
                    }"
            ></geometry-circle>

            <geometry-polygon
                    :vertices="[[24,32],[24,68],[74,68],[74,32]]"
                    :_style="{
                        'stroke-width': 0.8,
                        'fill': '#000000',
                        'fill-opacity': 1
                    }"
            ></geometry-polygon>

            <geometry-line
                    :from="[20,32]"
                    :to="[50,50]"
                    :_style="{'stroke': '#ffffff'}"
            ></geometry-line>

            <geometry-line
                    :from="[80,32]"
                    :to="[50,50]"
                    :_style="{'stroke': '#ffffff'}"
            ></geometry-line>

            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
        
            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-intermediate-event-panel
                v-if="drawer"
                :definition="definition"
                v-model="value"
                :linkList.sync="links"
                @close="closePanel"
                @addHeader="addHeader"
                @deleteHeader="deleteHeader"
                @giveJSONHint="giveJSONHint"
        ></bpmn-intermediate-event-panel>
    </div>
</template>

<script>
    import IBpmn from '../../IBpmn'
    import BpmnPropertyPanel from './IntermediateEventPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-message-intermediate-throw-event',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'bpmn-intermediate-event-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {
                    'label-position': 'bottom',
                    'label-width': 120,
                    'stroke-width': 1.5,
                }
            },
            type(){
                return 'IntermediateEvent'
            },
            className(){
                return 'org.uengine.kernel.bpmn.MessageIntermediateThrowEvent'
            },
            createNew(newTracingTag, x, y, width, height, elementId) {
                return {
                    _type: this.className(),
                    name: '',
                    role: {
                        name: ''
                    },
                    outputMapping: [],
                    headers: [],
                    tracingTag: newTracingTag,
                    selected: false,
                    queuingEnabled: false,
                    elementView: {
                        '_type': 'org.uengine.kernel.view.DefaultActivityView',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    useJSONTemplate: !this.inputVariableName,
                }
            }
        },
        data: function () {
            var inputVariableName;
            if(this.value.inputPayloadTemplate && this.value.inputPayloadTemplate.indexOf("<%=") == 0) {
                inputVariableName = this.value.inputPayloadTemplate.substring(3, this.value.inputPayloadTemplate.length - 2).trim();
            }
            return {
                links: null,
                useJSONTemplate: !inputVariableName,
                inputVariable: {
                    name: inputVariableName
                }
            };
        },
        watch: {
            drawer: function (opened) {
                if (opened) {
                    this.value.role.name = this.bpmnVue.getWhereRoleAmIByTracingTag(this.value.tracingTag);
                    var me = this;
                    var serviceId = null;
                    //if there is MessageFlow linked to its activity, by using the target pool name to list up uris
                    this.definition.messageFlows.forEach(function(messageFlow) {
                        if(messageFlow.sourceRef == me.value.tracingTag) {
                            serviceId = me.bpmnVue.getWhereRoleAmIByTracingTag(messageFlow.targetRef);
                        }
                    });
                    if(serviceId) {
                        this.value.role = {name: serviceId};
                        this.$root.codi('eureka/apps/' + serviceId).get().then(function (response) {
                            var homepage = response.data.application.instance[0].homePageUrl; //dont' use
                            homepage = serviceId.toLowerCase(); //use path by zuul rather
                            me.$root.codi(homepage).get().then(function(response2){
                                if(response2.data._links){
                                    me.links = response2.data._links;
                                }
                            });

                        });
                    }
                }
            },
            "inputVariable": {
                handler: function(){
                    this.value.inputPayloadTemplate = "<%=" + this.inputVariable.name + "%>"
                },
                deep: true
            }
        },
        mounted: function () {
        },
        methods: {
            addHeader: function(){
                if(!this.value.headers) {
                    this.value.headers = [];
                }
                this.value.headers.push({
                    name: '', 
                    value: '', 
                    _type: 'org.uengine.kernel.bpmn.HttpHeader'
                });
            },
            deleteHeader: function(index){
              this.value.headers.splice(index, 1);
            },
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
                this.$root.codi(link.path).get().then(function(response) {
                    if(response.data._links.profile) {
                        var link = url(response.data._links.profile.href);

                        me.$root.codi(link.path).get().then(function(response) {
                            console.log(response.data);

                            if(response.data.alps.descriptors[0].descriptors) {
                                var jsonHint = {};
                                
                                response.data.alps.descriptors[0].descriptors.forEach(function(property) {
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

