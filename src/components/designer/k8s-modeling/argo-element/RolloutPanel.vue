<template>
    <kubernetes-common-panel
            v-model="value"
            :img="img"
            :isReadOnly="isReadOnly"
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
            <kube-number-field
                    :label="'Replicas'"
                    v-model="value.object.spec.replicas"
                    :isReadOnly="isReadOnly"
            ></kube-number-field>
            <kube-number-field
                    :label="'RevisionHistoryLimit'"
                    v-model="value.object.spec.revisionHistoryLimit"
                    :isReadOnly="isReadOnly"
            ></kube-number-field>
            <v-text-field
                    label="App Name"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.selector.matchLabels.app"
            ></v-text-field>
            <v-text-field                                
                    label="Container Name"
                    v-model="value.object.spec.template.spec.containers[0].name"
                    :disabled="isReadOnly"
            ></v-text-field>
            <v-text-field                                
                    label="Image"
                    v-model="value.object.spec.template.spec.containers[0].image"
                    :disabled="isReadOnly"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'rollout-property-panel',
        computed: {
            descriptionText() {
                return 'Rollout'
            },
        },
        data: function () {
            return {}
        },
        watch: {
            'value.object.metadata.name': {
                deep: true,
                handler: function(val) {
                    this.value.name = val;
                    this.value.object.spec.selector.matchLabels.app = val;
                    this.value.object.spec.template.spec.containers[0].name = val;
                }
            },
        },
        methods: {
        }
    }
</script>

