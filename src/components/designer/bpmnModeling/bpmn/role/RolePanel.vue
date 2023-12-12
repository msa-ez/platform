<template>
    <bpmn-common-panel
            v-model="value"
            :image="image"
            :is-read-only="readOnly"
            :width-style="widthStyle"
            @close="closePanel"
    >
        <template slot="name-panel">
            <v-text-field
                    v-model="value.name"
                    label="Pool/Lane (Role) Name"
                    autofocus
            ></v-text-field>
        </template>
        <template slot="edit-property">
            <v-radio-group v-model="isRoleDef" row>
                <v-radio
                        id="roleDef"
                        name="roleDef"
                        value="Human"
                        label="Human"
                ></v-radio>
                <v-radio
                        id="roleDef"
                        name="roleDef"
                        value="System"
                        label="System"
                ></v-radio>
            </v-radio-group>
            
            <div v-if="isRoleDef=='Human'">
                <v-radio-group v-model="isRoleResolution" row style="margin-top: 0px !important;">
                    <v-radio
                            id="roleResolution"
                            name="roleResolution"
                            value="null"
                            label="None"
                            style="margin-right: 8px !important; font-size: 15px;"
                    ></v-radio>
                    <v-radio
                            id="roleResolution"
                            name="roleResolution"
                            value="org.uengine.five.overriding.IAMRoleResolutionContext"
                            label="Role Resolution By IAM Scope"
                            style="margin-right: 8px !important; font-size: 15px;"
                    ></v-radio>
                    <v-radio
                            id="roleResolution"
                            name="roleResolution"
                            value="org.uengine.kernel.DirectRoleResolutionContext"
                            label="Role Resolution By Direct user"
                            style="margin-right: 8px !important; font-size: 15px;"
                    ></v-radio>
                </v-radio-group>
                
                <v-text-field
                        v-if="value.roleResolutionContext && 
                            value.roleResolutionContext._type == 'org.uengine.five.overriding.IAMRoleResolutionContext'"
                        v-model="value.roleResolutionContext.scope"
                        label="Scope Name"
                ></v-text-field>

                <v-text-field 
                        v-if="value.roleResolutionContext && 
                            value.roleResolutionContext._type == 'org.uengine.kernel.DirectRoleResolutionContext'"
                        v-model="value.roleResolutionContext.endpoint"
                        label="User ID"
                ></v-text-field>
            </div>

            <div v-if="isRoleDef=='System'">
                <v-select
                        v-model="value.name"
                        :items="serviceIdList"
                        label="Select serviceId from eureka"
                ></v-select>
            </div>
        </template>
    </bpmn-common-panel>
</template>

<script>
    import BpmnPropertyPanel from '../BpmnPropertyPanel'

    export default {
        mixins: [BpmnPropertyPanel],
        name: 'bpmn-role-panel',
        props: {
            serviceIds: Array,
            roleDef: String,
            roleResolution: String,
        },
        data() {
            return {
            }
        },
        created: function () {
        },
        mounted: function () {
        },
        computed: {
            serviceIdList: {
                get() {
                    return this.serviceIds
                },
                set(val) {
                    this.$emit('updateServiceIds', val);
                }
            },
            isRoleDef: {
                get() {
                    return this.roleDef
                },
                set(val) {
                    this.$emit('updateRoleDef', val);
                }
            },
            isRoleResolution: {
                get() {
                    return this.roleResolution
                },
                set(val) {
                    this.$emit('updateRoleResolution', val);
                }
            }
        },
        watch: {
        },
        methods: {
            closePanel() {
                this.navigationDrawer = false;
                this.$emit('updateServiceIds', this.serviceIds);
                this.$emit('updateRoleDef', this.roleDef);
                this.$emit('updateRoleResolution', this.roleResolution);
                this.$emit('close');
            },
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">

</style>

