<template>
    <v-simple-table fixed-header style="width: 100%" height="100%;">
        <template v-slot:default>
            <thead>
            <tr>
                <th class="text-left">
                    Reason
                </th>
                <th class="text-left">
                    Timestamp
                </th>
                <th class="text-left">
                    Message
                </th>

            </tr>
            </thead>
            <tbody>
            <tr
                    v-for="item in events"
                    :key="item.involvedObject.uid"
            >
                <td>{{ item.reason }}</td>
                <td>{{ item.lastTimestamp }}</td>
                <td>{{ item.message }}</td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script>
    import TenantAware from "./labs/TenantAware";

    export default {
        name: "PodEvents.vue",
        data() {
            return {
                podStatusInterval: "",
                events: []
            }
        },
        mixins: [TenantAware],
        props: {
            hashName: String
        },
        created() {
            var me = this;
            this.podStatusInterval = setInterval(function () {
                me.$http.get(`${window.location.protocol}//api.${me.getTenantId()}/api/v1/namespaces/default/events?fieldSelector=involvedObject.name=${me.hashName}`)
                    .then(function (result) {
                        me.events = result.data.items
                    })
                    .catch(e => alert(e))
            }, 2000)
        },
        beforeDestroy() {
            clearInterval(this.podStatusInterval);
        }
    }
</script>

<style scoped>

</style>