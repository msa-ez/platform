<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width: 600px;">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-tabs v-if="value._instanceInfo">
                        <v-tab v-if="value._instanceInfo">
                            <v-list-item-title>Instance Info</v-list-item-title>
                        </v-tab>
                    </v-tabs>
                    <v-tabs v-model="tab">
                        <v-tab v-for="tab in tabs" :key="tab" :id="tab.toLowerCase() + _uid">
                            <v-list-item-title>{{ tab }}</v-list-item-title>
                        </v-tab>
                    </v-tabs>
                    
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-simple-table  v-if="value._instanceInfo">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Key</th>
                            <th class="text-left">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in value._instanceInfo" :key="index">
                            <td>{{ index }}</td>
                            <td>{{ value._instanceInfo[index] }}</td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <div v-if="tab == 0" style="margin-top: 10px">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field
                                    v-if="tracingTag !== null"
                                    v-model="tracingTag"
                                    label="액티비티 ID*"
                                    counter="50"
                            ></v-text-field>

                            <!-- v-if="value.condition._type == 'org.uengine.kernel.Evaluate'" start -->
                            <div v-if="value.condition._type == 'org.uengine.kernel.Evaluate' || value.condition._type == 'org.uengine.five.kernel.LoopCountEvaluate'">
                                <v-text-field
                                        v-model="value.name"
                                        label="Sequence Name"
                                        autofocus
                                ></v-text-field>
                                <v-checkbox 
                                        v-model="isOtherwise"
                                        label="Otherwise Condition"
                                ></v-checkbox>
                                <v-text-field
                                        v-model="value.priority"
                                        label="Priority"
                                        type="number"
                                ></v-text-field>
                                <v-checkbox 
                                        v-model="isComplexCondition"
                                        label="Complex Rule"
                                ></v-checkbox>
                                <org-uengine-kernel-Or
                                        v-if="isComplexCondition"
                                        v-model="value.condition" 
                                        :definition="definition"
                                ></org-uengine-kernel-Or>
                                <org-uengine-kernel-Evaluate 
                                        v-else 
                                        v-model="value.condition" 
                                        :definition="definition"
                                ></org-uengine-kernel-Evaluate>
                            </div>
                            <!-- v-if="value.condition._type == 'org.uengine.kernel.Evaluate'" end -->

                            <!-- v-if="value.condition._type == 'org.uengine.kernel.ExpressionEvaluateCondition'" start -->
                            <div v-if="value.condition._type == 'org.uengine.kernel.ExpressionEvaluateCondition'">
                                <v-text-field
                                        v-model="value.name"
                                        label="릴레이션 이름"
                                        autofocus
                                ></v-text-field>
                                <v-checkbox 
                                        v-model="isOtherwise"
                                        label="Otherwise Condition"
                                ></v-checkbox>
                                <v-text-field
                                        v-if="!isOtherwise"
                                        v-model="value.condition.conditionExpression"
                                        label="컨디션"
                                ></v-text-field>
                            </div>
                            <!-- v-if="value.condition._type == 'org.uengine.kernel.ExpressionEvaluateCondition'" end -->

                            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageFlow'" start -->
                            <div v-if="value._type == 'org.uengine.kernel.bpmn.MessageFlow'">
                                <v-text-field
                                        v-model="value.name"
                                        label="Message Flow Name"
                                        autofocus
                                ></v-text-field>
                                <v-switch 
                                        v-model="value.localCall"
                                        label="Local Call"
                                ></v-switch>
                            </div>
                            <!-- v-if="value._type == 'org.uengine.kernel.bpmn.MessageFlow'" end -->

                        </v-card-text>
                    </v-card>
                </div>
                <div v-if="tab == 1">
                    <v-card>
                        <bpmn-mapper 
                                :drawer.sync="drawer" 
                                :definition="definition"
                                v-model="value"
                        ></bpmn-mapper>
                    </v-card>
                </div>
                <div v-if="tab == 2">
                    <v-card flat>
                        <v-card-text>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="x"
                                            v-model="x"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="y"
                                            v-model="y"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="width"
                                            v-model="width"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="height"
                                            v-model="height"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-text-field
                                    v-for="(item, idx) in style" :key="idx"
                                    v-model="style[idx].value"
                                    :label="item.key"
                            ></v-text-field>
                        </v-card-text>
                    </v-card>
                </div>
            </v-list>

        </v-navigation-drawer>
    </v-layout>
</template>

<script>
    import BpmnPropertyPanel from '../BpmnPropertyPanel'

    export default {
        mixins: [BpmnPropertyPanel],
        name: 'bpmn-relation-panel',
        props: {
            otherwise: Boolean,
            complexCondition: Boolean,
        },
        data() {
            return {
                tabs: [ 'Properties', 'Data Mapping', 'Visual' ],
                tab: null
            }
        },
        created: function () {
        },
        mounted: function () {
        },
        computed: {
            isOtherwise: {
                get() {
                    return this.otherwise
                },
                set(val) {
                    this.$emit('updateOtherwise', val)
                }
            },
            isComplexCondition: {
                get() {
                    return this.complexCondition
                },
                set(val) {
                    this.$emit('updateComplexCondition', val)
                }
            }
        },
        watch: {},
        methods: {}
    }
</script>


<style lang="scss" rel="stylesheet/scss">

</style>

