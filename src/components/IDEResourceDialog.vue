<template>
    <div>
        <v-card>
            <v-card-title>
                <div class="main-title">Resource Size Setting</div>
            </v-card-title>

            <v-card-text>
                <v-row style="width: 100%">
                    <v-col v-if="ide" style="max-width: 50%;">
                        <div class="sub-title" style="text-align-last: start; margin-top: 8px;">IDE</div>
                        <v-divider></v-divider>
                        <v-radio-group v-model="quotaSize"
                                       style="margin-top: 20px; margin-left: 5px;">
                            <v-radio value="low">
                                <template v-slot:label>
                                    <div>Low <strong class="success--text">2 CPU</strong> / <strong
                                            class="success--text">4 Gb</strong></div>
                                </template>
                            </v-radio>
                            <v-radio value="medium">
                                <template v-slot:label>
                                    <div>Medium <strong class="primary--text">4 CPU</strong> / <strong
                                            class="primary--text">8 Gb</strong></div>
                                </template>
                            </v-radio>
                            <v-radio value="high">
                                <template v-slot:label>
                                    <div>High <strong class="error--text">8 CPU</strong> / <strong class="error--text">16
                                        Gb</strong></div>
                                </template>
                            </v-radio>
                        </v-radio-group>
                    </v-col>
                    <v-col :style="k8sStyle">
                        <div class="sub-title" style="text-align-last: start; margin-top: 8px;">kubernetes</div>
                        <v-divider></v-divider>
                        <v-radio-group v-model="toolQuotaSize"
                                       style="margin-left: 5px; margin-top: 20px;">
                            <v-radio value="none">
                                <template v-slot:label>
                                    <div>사용 안함</div>
                                </template>
                            </v-radio>
                            <v-radio value="low">
                                <template v-slot:label>
                                    <div>Low <strong class="success--text">2 CPU</strong> / <strong
                                            class="success--text">4 Gb</strong></div>
                                </template>
                            </v-radio>
                            <v-radio value="medium">
                                <template v-slot:label>
                                    <div>Medium <strong class="primary--text">4 CPU</strong> / <strong
                                            class="primary--text">8 Gb</strong></div>
                                </template>
                            </v-radio>
                            <v-radio value="high">
                                <template v-slot:label>
                                    <div>High <strong class="error--text">8 CPU</strong> / <strong class="error--text">16
                                        Gb</strong></div>
                                </template>
                            </v-radio>
                        </v-radio-group>
                    </v-col>
                </v-row>
                <div style="text-align: start; margin-left: 16%;">
                    <div v-if="ide && isChangedIDE">
                        <v-icon small color="red"> mdi-alert</v-icon>
                        IDE Resource Size 변경시 기존의 <b>Process kill</b> 됩니다.
                    </div>
                    설정된 'Resource Size'에 따라 소진 시간(<b>{{quotaSizeText}}</b>)됩니다.
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="closeResourceQuota()">OK</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import StorageBase from "./designer/modeling/StorageBase";

    export default {
        name: "ide-resource-dialog",
        props: {
            ide: {
                type: Boolean,
                default: function () {
                    return true
                }
            }
        },
        mixins: [StorageBase],
        data() {
            return {

                //tool
                toolQuotaSize: 'low',
                toolResourceQuota: {
                    memory: "4Gi",
                    cpu: "2",
                },
                toolResourceType: 'k8s-4m2c',
                toolMediumPrice: 2000,
                toolHighPrice: 3000,

                // ide
                originQuotaSize: null,
                quotaSize: 'low',
                resourceQuota: {
                    memory: "4Gi",
                    cpu: "2",
                },
                resourceType: 'ide-4m2c',
                ideMediumPrice: 2000,
                ideHighPrice: 3000,


            }
        },
        computed: {
            isChangedIDE() {
                if (this.originQuotaSize) {
                    if (this.originQuotaSize != this.quotaSize) {
                        return true
                    }
                }
                return false
            },
            k8sStyle() {
                if (this.ide) {
                    return 'max-width: 50%;'
                }
                return 'max-width: 100%;'
            },
            quotaSizeText() {
                var me = this
                var idePrice = 0
                var toolPrice = 0
                //ide
                if (me.quotaSize == 'medium') {
                    idePrice = me.ideMediumPrice
                } else if (me.quotaSize == 'high') {
                    idePrice = me.ideHighPrice
                } else {
                    idePrice = 1000
                }

                //tool
                if (me.toolQuotaSize == 'none') {
                    toolPrice = 0
                } else if (me.toolQuotaSize == 'low') {
                    toolPrice = 1000
                } else if (me.toolQuotaSize == 'medium') {
                    toolPrice = me.toolMediumPrice
                } else if (me.toolQuotaSize == 'high') {
                    toolPrice = me.toolHighPrice
                }

                var totalPrice = idePrice + toolPrice

                return `${totalPrice / 1000}초 소진 /1초(s)`

            },
        },
        async created() {
            var me = this
            //ide setting

            me.ideMediumPrice = await me.getString(`db://pricing/ide-8m4c`)
            me.ideHighPrice = await me.getString(`db://pricing/ide-16m8c`)
            //get IDE SIZE
            me.originQuotaSize = JSON.parse(JSON.stringify(me.quotaSize))

            var namespace;
            // k8s setting
            me.toolMediumPrice = await me.getString(`db://pricing/k8s-8m4c`)
            me.toolHighPrice = await me.getString(`db://pricing/k8s-16m8c`)
            if(me.$route.query.param)
                namespace = me.$route.query.param;
            else

            var getSpec = await me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${me.$route.query.param}/resourcequotas/resource-quota`)
            if (getSpec.status == 200) {
                var cpu = getSpec.data.spec.hard["limits.cpu"]
                var memory = getSpec.data.spec.hard["limits.memory"]

                me.resourceQuota.cpu = cpu
                me.resourceQuota.memory = memory
                if (cpu == '2' && memory == '4Gi') {
                    me.toolQuotaSize = 'low'
                } else if (cpu == '4' && memory == '8Gi') {
                    me.toolQuotaSize = 'medium'
                } else if (cpu == '8' && memory == '16Gi') {
                    me.toolQuotaSize = 'high'
                } else {
                    me.toolQuotaSize = 'low'
                }
            } else {
                me.toolQuotaSize = 'low'
            }

        },
        watch: {
            'quotaSize': function (newVal) {
                var me = this
                switch (newVal) {
                    case "low":
                        me.resourceQuota = {
                            memory: "4Gi",
                            cpu: "2"
                        }
                        me.resourceType = 'ide-4m2c'
                        break;
                    case "medium":
                        me.resourceQuota = {
                            memory: "8Gi",
                            cpu: "4"
                        }
                        me.resourceType = 'ide-8m4c'
                        break;
                    case "high":
                        me.resourceQuota = {
                            memory: "16Gi",
                            cpu: "8"
                        }
                        me.resourceType = 'ide-16m8c'
                        break;
                }
            },
            'toolQuotaSize': function (newVal) {
                var me = this
                switch (newVal) {
                    case "none":
                        me.toolResourceQuota = {
                            memory: "0Gi",
                            cpu: "0"
                        }
                        me.toolResourceType = null
                        break;
                    case "low":
                        me.toolResourceQuota = {
                            memory: "4Gi",
                            cpu: "2"
                        }
                        me.toolResourceType = `k8s-4m2c`
                        break;
                    case "medium":
                        me.toolResourceQuota = {
                            memory: "8Gi",
                            cpu: "4"
                        }
                        me.toolResourceType = `k8s-8m4c`
                        break;
                    case "high":
                        me.toolResourceQuota = {
                            memory: "16Gi",
                            cpu: "8"
                        }
                        me.toolResourceType = `k8s-16m8c`
                        break;
                }
            }

        },
        methods: {
            closeResourceQuota() {
                var me = this
                var ide = null
                var tool = null

                ide = {
                    resourceQuota: me.resourceQuota,
                    resourceType: me.resourceType
                }

                tool = {
                    resourceQuota: me.toolResourceQuota,
                    resourceType: me.toolResourceType
                }

                me.$emit('submit', ide, tool)
            },
        },
    }

</script>