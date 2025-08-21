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
            <v-text-field
                    label="Project"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.project"
            ></v-text-field>
            <v-text-field
                    label="Repository URL"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.source.repoURL"
            ></v-text-field>
            <v-text-field
                    label="Target Revision"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.source.targetRevision"
            ></v-text-field>
            <v-text-field
                    label="Path"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.source.path"
            ></v-text-field>
            <v-text-field
                    label="Destination Server"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.destination.server"
            ></v-text-field>
            <v-text-field
                    label="Destination Namespace"
                    :disabled="isReadOnly"
                    v-model="value.object.spec.destination.namespace"
            ></v-text-field>
        </template>
    </kubernetes-common-panel>

</template>


<script>
    import KubernetesPanel from "../KubernetesPanel";

    export default {
        mixins: [KubernetesPanel],
        name: 'application-property-panel',
        computed: {
            descriptionText() {
                return 'Application'
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
                }
            },
        },
        methods: {
        }
    }
</script>


