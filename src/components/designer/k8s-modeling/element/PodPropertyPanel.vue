<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :isReadOnly="isReadOnly"
            :validation-lists="validationLists"
            @openDesDoc="desDocOpen"
            @close="closePanel"
    >
        <template slot="headline">
            <v-tabs
                    v-model="activeTab"
                    v-if="value.status">
                <v-tab
                        v-for="(tab, idx) in tabItems"
                        :key="idx">
                    <v-list-item-title>{{ tab }}</v-list-item-title>
                </v-tab>
            </v-tabs>
            <v-list-item-title 
                    v-else
                    class="headline">
                {{ value._type }}
            </v-list-item-title>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-layout">
            <v-layout v-if="value.status && activeTab == 0" wrap>
                <v-flex>
                    <v-card flat>
                        <v-card-text>
                            <tree-view
                                    :data="status"
                                    :options="{
                                            rootObjectKey: 'status'
                                        }"
                            ></tree-view>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-layout v-else wrap>
                <v-flex shrink style="width: 180px;">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field                                
                                    :label="$t('labelText.name')"
                                    v-model="value.object.metadata.name"
                                    autofocus
                                    :disabled="isReadOnly"
                            ></v-text-field>
                            <v-text-field                                
                                        label="Image"
                                        v-model="value.object.spec.containers[0].image"
                                        :disabled="isReadOnly"
                            ></v-text-field>
                            <kube-number-field
                                    v-if="value.object.spec.containers[0].ports"
                                    :label="'Port'"
                                    v-model="value.object.spec.containers[0].ports[0].containerPort"
                                    :isReadOnly="isReadOnly"
                            ></kube-number-field>
                            <kube-attr-field 
                                    v-model="value" 
                                    :isReadOnly="isReadOnly"
                            ></kube-attr-field>
                        </v-card-text>
                    </v-card>
                </v-flex>
                <v-flex>
                    <kube-yaml-editor
                            v-model="value.object"
                            :isReadOnly="isReadOnly"
                    ></kube-yaml-editor>
                </v-flex>
            </v-layout>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'property-panel',
        components:{
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'Pod'
            },
            status() {
                if(this.value && this.value.status) {
                    return JSON.parse(JSON.stringify(this.value.status))
                } else {
                    return null
                }
            },
        },
        data: function () {
            return {
                activeTab: 0,
                tabItems: [ "status", "property" ],
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.metadata.labels.app = val;
                    this.value.object.spec.containers[0].name = val;
                }
            },
            status: {
                deep: true,
                handler: function () {
                }
            },
        },
        methods: {
            desDocOpen() {
                window.open('https://kubernetes.io/docs/concepts/workloads/pods/pod/')
            },
        }
    }
</script>


