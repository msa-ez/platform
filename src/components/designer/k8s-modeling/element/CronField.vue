<template>
    <div class="cron">
        <el-popover v-model="cronPopover" :disabled="isReadOnly">
            <cron @change="changeCron" @close="cronPopover = false" i18n="en"></cron>
            <el-input
                    :disabled="isReadOnly"
                    slot="reference"
                    @click="cronPopover = true"
                    v-model="cronVal"
                    placeholder="Schedule"
            ></el-input>
        </el-popover>
    </div>
</template>

<script>
    import {Popover, Input} from "element-ui";
    import "element-ui/lib/theme-chalk/index.css";
    import {cron} from "vue-cron"

    export default {
        name: 'v-cron-field',
        props: {
            value: String,
            isReadOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            }
        },
        components: {
            cron,
        },
        data() {
            return {
                cronVal: this.value,
                cronPopover: false,
            }
        },
        watch: {
            cronVal() {
                this.$emit("input", this.cronVal)
            }
        },
        methods: {
            changeCron(val) {
                this.cronVal = val.substring(0, (val.length - 4))
            },
        },
    }
</script>

<style>

</style>