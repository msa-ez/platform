<template>
    <v-dialog v-model="value" @click:outside="closeDialog" hide-overlay max-width="400">
        <v-card>
            <v-card-title>Git Setting for Model</v-card-title>
            <v-card-text>
                <v-text-field label="Git URL Input" v-model="gitURL"></v-text-field>
            </v-card-text>
            <v-card-actions style="justify-content: flex-end;">
                <v-btn text @click="closeDialog">Close</v-btn>
                <v-btn color="primary" text @click="setDialog">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: "GitInformation",
        data() {
            return {
                gitURL: ""
            }
        },
        props: {
            value: Boolean,
            git: String
        },
        watch: {
            // git: {
            //     handler: function (newVal) {
            //         this.$emit("update:git", newVal)
            //     }
            // }
        },
        methods: {
            setDialog() {
                this.$emit("update:git", this.gitURL)
                this.closeDialog()
            },
            closeDialog() {
                this.$emit('close')
            }
        }
    }
</script>

<style scoped>

</style>