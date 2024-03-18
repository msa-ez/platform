<template>

    <div>
        <v-chip :color="value ? 'primary':'grey'" class="ma-5">
            {{value ? value.projectName: 'Not Selected'}}
        </v-chip>

        <EventStormingListPage
                v-if="!isReadOnly"
                :buinessName="search"
                searchType="es"
        >
            <div slot="header">
            </div>

            <v-btn slot="action" @click="select(project)" text slot-scope="{ project }">
                SELECT
            </v-btn>

            <div slot="chips">
            </div>

            <div slot="footer">
            </div>

        </EventStormingListPage>
    </div>
</template>

<script>
    import EventStormingListPage from "../listPages/EventStormingListPage";

    export default {
        name:'project-picker',
        props: {
            search: String,
            value: Object,
            isReadOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
        },
        components: {
            EventStormingListPage
        },
        methods: {

            select(project) {
                this.value = project.project;
                console.log(this.value)
                this.$emit('input', this.value);
            }
        }
    }
</script>