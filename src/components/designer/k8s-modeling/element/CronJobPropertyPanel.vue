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
            <v-list-item-title class="headline">
                {{ value._type }}
            </v-list-item-title>
        </template>

        <template slot="descriptionText">
            <span>{{ descriptionText }}</span>
        </template>

        <template slot="edit-property">
            <v-text-field
                    label="Image"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.jobTemplate.spec.template.spec.containers[0].image"
            ></v-text-field>
            <v-select
                    label="restartPolicy"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.jobTemplate.spec.template.spec.restartPolicy"
                    :items="restartPolicyList"
            ></v-select>
            <v-label>Schedule</v-label>
            <v-cron-field
                    v-model="value.object.spec.schedule"
                    :isReadOnly="isReadOnly"
            ></v-cron-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import CronField from './CronField.vue';
    import KubeCommonPanel from "../KubeCommonPanel.vue";
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        name: 'cronjob-property-panel',
        mixins: [KubernetesPanel],
        components: {
            CronField,
            KubeCommonPanel
        },
        computed: {
            descriptionText() {
                return 'CronJob'
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
                restartPolicyList: ['Always', 'OnFailure', 'Never'],
                activeTab: 0,
                tabItems: ["status", "property"],
            }
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.spec.jobTemplate.spec.template.spec.containers[0].name = val;
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
                window.open('https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/')
            },
        }
    }
</script>

