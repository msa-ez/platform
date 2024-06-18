<template>
    <v-card flat>
        <v-text-field v-model="serviceName" label="Service Name" persistent-placeholder></v-text-field>
        <v-textarea v-model="debeziumLogs" label="Debezium Logs" style="font-size: small; padding-top:0px;" rows="15" persistent-placeholder></v-textarea>
    </v-card>
</template>
  
<script>
import DebeziumLogsTabGenerator from "./DebeziumLogsTabGenerator.js"

export default {
    name: 'DebeziumLogsTab',
    data() {
        return {
            serviceName: '',
            debeziumLogs: ''
        }
    },
    methods: {
        getValidErrorMsg(){
            if(!this.serviceName) return "Service Name is required"
            if(!this.debeziumLogs) return "Debezium Logs is required"
            return ""
        },

        getUserProps() {
            return {
                "ServiceName": this.serviceName,
                "DebeziumLogs": this.debeziumLogs
            }
        },

        getGenerater(client) {
            return new DebeziumLogsTabGenerator(client)
        }
    }
}
</script>