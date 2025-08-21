<template>
    <div>
        <div>
            <div>
                <v-row>
                    <v-col cols="2">
                        <v-select
                                v-model="value._type"
                                :items="typeList"
                                item-text="key"
                                item-value="value"
                        ></v-select>
                        (
                    </v-col>
                    <v-col></v-col>
                </v-row>
            </div>

            <ul>
                <table width="100%" v-for="(childCondition, index) in value.conditionsVt" :key="index">
                    <td width="90%">
                        <component 
                                :is="childCondition._type.split('.').join('-')" 
                                v-model="value.conditionsVt[index]" 
                                :definition="definition"
                        ></component>
                    </td>
                    <td width="10%">
                        <v-btn @click="remove(index)">
                            <v-icon>clear</v-icon>
                        </v-btn>
                    </td>
                </table>
                
                <v-row>
                    <v-col cols="3">
                        <v-select
                                v-model="conditionType"
                                :items="conditionTypeList"
                                item-text="key"
                                item-value="value"
                        ></v-select>
                    </v-col>
                    <v-col cols="2">
                        <v-btn color="primary" @click="addCondition">Add</v-btn>
                    </v-col>
                </v-row>
            </ul>
            <div style="clear: both">
              )
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'org-uengine-kernel-Or',
        props: {
            definition: Object,
            value: Object
        },
        data: function(){
            return {
                conditionType: 'org.uengine.kernel.Or',
                myConditionType:'Or',
                typeList: [
                    { key: 'And', value: 'org.uengine.kernel.And' },
                    { key: 'Or', value: 'org.uengine.kernel.Or' },
                ],
                conditionTypeList: [
                    { key: 'And', value: 'org.uengine.kernel.And' },
                    { key: 'Or', value: 'org.uengine.kernel.Or' },
                    { key: 'Evaluate', value: 'org.uengine.kernel.Evaluate' },
                    { key: 'LoopCount', value: 'org.uengine.kernel.LoopCount' },
                ],
            };
        },
        watch: {
            'value': {
                deep: true,
                handler: function(){
                    this.$emit('input', this.value);
                }
            }
        },
        methods: {
            addCondition: function(){
                if(!this.value.conditionsVt) {
                    this.value = {
                        _type: 'org.uengine.kernel.Or',
                        conditionsVt: []
                    }
                }
                
                var pushCondition = {
                    _type: this.conditionType  
                };
                if (this.conditionType == "org.uengine.kernel.LoopCount") {
                    pushCondition._type = "org.uengine.kernel.Evaluate";
                    pushCondition.type = "loopCount";
                }

                this.value.conditionsVt.push(pushCondition);

                var temp = this.value;
                this.value = null;
                this.value = temp;

                this.$emit('input', this.value);
            },
            click: function () {
                console.log(this.conditionTypeAndOr);
                console.log(this.value.conditionsVt);
            },
            remove: function(index) {
                this.value.conditionsVt.splice(index, 1)

                var temp = this.value;
                this.value = null;
                this.value = temp;

                this.$emit('input', this.value);
            }
        }
    }

</script>


