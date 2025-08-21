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
                        'stroke-width': 3,
                        fill: '#FFFFFF',
                        'fill-opacity': 0,
                        r: '10'
                    }"
            ></geometry-rect>

            <sub-elements>
                <bpmn-loop-type :loopType="loopType"></bpmn-loop-type>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <bpmn-sub-controller 
                    :type="type" 
                    :className="className" 
                    :callee-definition-id="value.definitionId"
            ></bpmn-sub-controller>
        </geometry-element>

        <bpmn-task-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
                @fetchDefinitionList="fetchDefinitionList"
        ></bpmn-task-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel from './TaskPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-call-activity',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'bpmn-task-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {}
            },
            type(){
                return 'Task'
            },
            className(){
                return 'org.uengine.kernel.bpmn.CallActivity'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    tracingTag: newTracingTag,
                    selected: false,
                    definitionId: "",
                    variableBindings: [],
                    roleBindings: [],
                    elementView: {
                        '_type': 'org.uengine.kernel.view.DefaultActivityView',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    rowData: [],
                    recommendedDefinitionList: [{ name: '' }]
                }
            }
        },
        data: function () {
            return {
                // rowData : [],
                // recommendedDefinitionList: [{name: ''}]
            };
        },
        //매번 창을 열때 (창을 열때 activity 를 갱신시켜주는건 프로퍼티 패널에 장치가 되있음.) 리스트를 갱신하길 원함.
        //그러기 위해서는 watch 를 해야하는데, watch 대상은 activity 이다.
        watch: {
            drawer: function (editingMode) {
                console.log('editing mode changed');
                if(editingMode) {
                    this.loadData();
                }
            },
        },
        // created: function() {
        //     this.fetchDefinitionList();
        // },
        mounted: function(){
            //데피니션 리스트 조회
            this.loadData();
            this.fetchDefinitionList();
        },
        methods: {
            loadData: function () {
                var me = this;
                var src = 'definitions/all';

                me.$root.codi(src).get().then(function (response) {
                    me.value.rowData = response.data;
                    var definitions = [];

                    $.each(response.data, function (i, definition) {
                        var length = definition.length;
                        var lastDot = definition.lastIndexOf('.') + 1;
                        var fileName  = definition.substring(lastDot, length);
                        
                        if(fileName == "json") {
                            definition = definition.replace('.json', '');
                            definitions.push({
                                name: definition
                            })
                        }
                    });
                    
                    me.value.rowData = definitions;
                })
            },
            fetchDefinitionList(list, param){
            /** TODO: Definition Acebase에서 조회 후 불러오기 */

            //     var query = param;
            //     var me = this;
            //     var access_token = localStorage["access_token"];

            //     var backend = hybind(`${me.getProtocol()}//api.${me.getTenantId()}`, {headers: {'access_token': access_token}});
            //     me.value.recommendedDefinitionList = [({name: '-----List-----'})];
            //     var search = {};
            //     backend.$bind("definition/search/findByDefIdContaining?defId=" + query, search);

            //     search.$load().then(function(definition){
            //         console.log(definition)
            //         for(var i = 0; i < definition.length; i++) {
            //             var tmp = definition[i].name;
            //             me.value.recommendedDefinitionList.push({name: tmp});
            //         }
            //     });

            //     // me.recommendedDefinitionList.splice(0);
            //     return me.value.recommendedDefinitionList
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

