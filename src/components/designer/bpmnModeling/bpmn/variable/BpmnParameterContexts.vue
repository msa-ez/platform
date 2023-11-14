<template>
    <v-card outlined class="px-3 py-3 my-2">
        <v-card-text v-if="parameterContexts.length > 0">
            <div v-for="(parameterContext, idx) in parameterContexts" :key="idx">
                <v-row>
                    <v-col v-if="forSubProcess" cols="4">
                        <v-select
                                v-if="calleeDefinition" 
                                v-model="parameterContext.argument.text"
                                :items="calleeDefinition.processVariableDescriptors"
                                item-text="name"
                                item-value="name"
                                label="피호출측 변수"
                        ></v-select>
                        <v-text-field
                                v-else 
                                v-model="parameterContext.argument.text"
                                label="input" 
                                id="input"
                        ></v-text-field>
                    </v-col>

                    <v-col v-else cols="4">
                        <v-text-field 
                                name="input"
                                id="input"
                                label="아규먼트"
                                v-model="parameterContext.argument.text"
                        ></v-text-field>
                    </v-col>
                
                    <v-col v-if="parameterContext.transformerMapping" cols="3">
                        <v-select
                                v-model="parameterContext.transformerMapping.transformer"
                                style="min-width: 20px;"
                                :items="transformerList"
                                label="변환"
                        ></v-select>
                    </v-col>

                    <v-col cols="2">
                        <v-select
                                v-model="parameterContext.direction"
                                style="min-width: 20px;" 
                                @change="directionChanged(parameterContext)"
                                :items="connectDirections"
                                label="연결방향"
                        >
                            <template v-slot:selection>
                                <v-icon>{{ iconForDirection(parameterContext.direction) }}</v-icon>
                            </template>
                            
                            <template v-slot:item="data">
                                <div v-if="data.item != 'OUT '">
                                    <v-icon>{{iconForDirection(data.item)}}</v-icon>
                                </div>
                                <div v-else>
                                    <v-icon>all_inclusive</v-icon><v-icon>{{iconForDirection(data.item)}}</v-icon>
                                </div>
                            </template>
                        </v-select>
                    </v-col>

                    <v-col cols="5">
                        <bpmn-variable-selector 
                                v-model="parameterContext.variable" 
                                :definition="value"
                        ></bpmn-variable-selector>
                    </v-col>

                    <v-col cols="1">
                        <v-btn icon color="grey" class="px-0"
                        @click="removeMapping(parameterContext)">
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>

       <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary"
                    class="my-3"
                    @click="addMapping">
                Add Mapping
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

    export default {
        name: "bpmn-parameter-contexts",
        // computed: {
        //   calleeDefinition: function () {
      
        //     this.$root.codi('definition/' + this.calleeDefinitionId).get()
        //       .then(function (response) {
        //         me.calleeDefinition = response.data;
        //       })
      
        //     return {
      
        //       processVariableDescriptors: [
        //         {name: 'a'},
        //         {name: 'b'}
        //       ]
      
        //     }
        //   }
        // },
        props: {
            value: Object,
            parameterContexts: Array,
            // calleeDefinitionId: String,
            forSubProcess: Boolean,
            // forCallActivity: Boolean,
            // multi: Boolean,
            // labelForArgument: String
        },
        data: function () {
            return {
                // data: {
                //     parameterContexts: []
                // },
                calleeDefinition: null,
                // calleeDefinition: {
                //   processVariableDescriptors: [
                //     {name: '-- not loaded -- '},
                //   ]
                // }
                transformerList: [
                    { _type: null, entityType: null, text: '형태소 추출', disabled: true },
                    { _type: 'org.uengine.five.kernel.SemanticTransformer', entityType: 'SN', text: '숫자' },
                    { _type: 'org.uengine.five.kernel.SemanticTransformer', entityType: 'NNP', text: '이름' },
                    { _type: 'org.uengine.five.kernel.SemanticTransformer', entityType: 'NNG', text: '직업' },
                ],
                connectDirections: [ 'IN-OUT', 'IN', 'OUT', 'OUT ' ]
            };
        },
        created() {
            console.log(this.value)
        },
        watch: {
            'parameterContexts': {
                deep: true,
                handler: function (newVal, oldVal) {
                    console.log(newVal)
                }
            },
            // calleeDefinitionId  : function(val){
            //     this.refreshCalleeDefinition();
            // }
        },
        methods: {
            iconForDirection: function(direction){
                if(direction == "IN")
                    return "arrow_back";
                else if(direction == "OUT" || direction == "OUT ")
                    return "arrow_forward";
                else
                    return "settings_ethernet";
            },
            refreshCalleeDefinition: function(){
                if(!this.forSubProcess) return;

                if(this.forCallActivity){
                    var me = this;
                    this.$root.codi('definition/' + this.calleeDefinitionId + ".json").get()
                        .then(function (response) {
                            me.calleeDefinition = response.data.definition;
                    })
                } else {
                    me.calleeDefinition = this.definition;
                }
            },
            addMapping() {
                this.parameterContexts.push({
                    direction: 'IN-OUT',
                    variable: {
                        name: 'name'
                    },
                    argument: {
                        text: 'arg'
                    }
                })
            },
            removeMapping(parameterContext) {
                var index = this.parameterContexts.indexOf(parameterContext);
                //TODO: find and remove
                this.parameterContexts.splice(index,1)
            },
            directionChanged: function(parameterContext){
                if(parameterContext.direction == "OUT "){
                    parameterContext.direction = "OUT";
                    parameterContext.transformerMapping = {
                        _type: 'org.uengine.processdesigner.mapper.TransformerMapping',
                        transformer: {
                            _type: "org.uengine.five.kernel.SemanticTransformer",
                            entityType: "SSP"
                        }
                    }
                } else {
                    parameterContext.transformerMapping = null;
                }
            }
        }
    }

</script>


