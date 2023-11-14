<template>
    <div>
        <horizontal-lane-element
                selectable
                movable
                resizable
                deletable
                :id.sync="value.elementView.id"
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
        >
            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>

            <sub-elements v-for="(index) in newEditUserImg.length" :key="index">
                <image-element
                        v-bind:image="newEditUserImg[index-1].picture"
                        :sub-width="'24px'"
                        :sub-height="'24px'"
                        :sub-right="(10*(index-1))+'px'"
                        :sub-bottom="value.elementView.height"
                ></image-element>
            </sub-elements>

            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </horizontal-lane-element>

        <bpmn-role-panel
                v-if="drawer"
                v-model="value"
                :serviceIds="serviceIds"
                :roleDef="roleDef"
                :roleResolution="roleResolution"
                @updateServiceIds="updateServiceIds"
                @updateRoleDef="updateRoleDef"
                @updateRoleResolution="updateRoleResolution"
                @close="closePanel"
        ></bpmn-role-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel from './RolePanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-role',
        props: {},
        component: {
            'bpmn-role-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {}
            },
            type(){
                return 'org.uengine.kernel.Role'
            },
            createNew(x, y, width, height, elementId){
                return {
                    _type: this.type(),
                    name: '',
                    displayName: {},
                    roleResolutionContext: null,
                    selected: false,
                    elementView: {
                        '_type': 'org.uengine.kernel.view.DefaultActivityView',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    _instanceInfo: [],
                }
            }
        },
        data: function () {
            return {
                serviceIds: null,
                roleDef: 'Human',
                roleResolution: false
            };
        },
        watch: {
            'drawer': function(val){
                // this.loadRolesFromEureka();
            },
            'value.name': function (newVal, oldVal) {
                var me = this;
                //롤의 이름이 변경되었을 때
                //휴먼 액티비티 중 oldname 을 가지고 있는 role 을 같이 변경한다.
                $.each(Object.values(this.bpmnVue.value.elements), function (i, activitiy) {
                    if (activitiy && activitiy.value && activitiy.value.name == oldVal) {
                        activitiy.value = JSON.parse(JSON.stringify(me.value));
                        console.log(activitiy.value.tracingTag + ' Human activitiy role changed by role name updated!!');
                    }
                });
            },
            'roleResolution': function(val) {
              if(val) {
                  if(!this.value.roleResolutionContext) {
                      this.value.roleResolutionContext = {
                          endpoint: null,
                          scope: null
                      };
                  }
                  this.value.roleResolutionContext._type = val;
              } else {
                  this.value.roleResolutionContext = null;
              }
            }
        },
        created: function () {
            // this.loadRolesFromEureka();

            if(this.value.roleResolutionContext){
                this.roleResolution = this.value.roleResolutionContext._type;
            }
        },
        methods: {
            loadRolesFromEureka: function(){
                var me = this;
                this.$root.codi('eureka/apps').get()
                    .then(function (response) {
                    console.log(response.data);
                    response.data.applications.application.forEach(function(application) {
                        if(me.serviceIds == null) {
                            me.serviceIds = [];
                        }
                        me.serviceIds.push(application.name);
                    });
                });
            },
            updateServiceIds(val) {
                this.serviceIds = val
            },
            updateRoleDef(val) {
                this.roleDef = val
            },
            updateRoleResolution(val) {
                this.roleResolution = val
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

