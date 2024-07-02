<template>
    <v-card flat>
        <p style="text-align: center; color: darkgray; padding: 10px; font-weight: bold;">데이터베이스에서 얻은 Debezium 트랜잭션 로그를 통해서 이벤트 스토밍 모델을 생성할 수 있습니다.</p>
        <v-textarea v-model="debeziumLogs" label="Debezium Logs" style="font-size: small; padding-top:0px;" rows="15" persistent-placeholder></v-textarea>
    </v-card>
</template>
  
<script>
import DebeziumLogsTabGenerator from "./DebeziumLogsTabGenerator.js"

export default {
    name: 'DebeziumLogsTab',
    data() {
        return {
            debeziumLogs: ''
        }
    },
    methods: {
        getValidErrorMsg(){
            if(!this.debeziumLogs) return "Debezium Logs is required"
            return ""
        },

        getUserProps() {
            return {
                "DebeziumLogs": this.debeziumLogs
            }
        },

        getGenerater(client) {
            return new DebeziumLogsTabGenerator(client)
        }
    }
}
</script>