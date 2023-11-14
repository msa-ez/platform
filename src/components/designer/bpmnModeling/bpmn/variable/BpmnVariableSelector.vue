<template>
    <div style="width: 100%">
        <div style="margin-right: 20px;">
            <v-select
                    label="Process Data"
                    name="input"
                    id="input"
                    v-model="value.name"
                    @change="onChanged"
                    :items="processVariableDescriptors"
                    item-text="name"
                    item-value="name"
            >
                <template v-slot:message>
                    Roles
                </template>
                <template v-slot:item="data">
                    {{ data.item.name }}
                </template>
            </v-select>
        </div>

        <div v-if="keys.length > 0">
            <v-select
                    label="Property"
                    :items="keys"
            ></v-select>
        </div>
    </div>
</template>

<script>

    export default {
        name: "bpmn-variable-selector",
        props: {
            value: Object,
            definition: Object,
        },
        created: function() {
            if(this.value != null) {
                this.metaDataResolver();
            }
        },
        data: function () {
            return {
                keys: [],
                processVariableDescriptors: []
            }
        },
        watch: {
        },
        methods: {
            onChanged() {
                this.$emit('input', this.value);
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            metaDataResolver() {
                // // console.log("meta!")
                var me = this;
                var canvas = me.getComponent('bpmn-modeling-canvas');
                console.log(canvas.value.processVariableDescriptors)
                canvas.value.processVariableDescriptors.forEach(function (pv) {
                    pv["_type"] = "[Lorg.uengine.kernel.ProcessVariable"
                    me.processVariableDescriptors.push(pv)
                })


                // 하위 로직은 받아오는 데이터인데 정확히 모르겠음.
                // if(me.definition.processVariableDescriptors) {
                //     for(var i = 0; i < me.definition.processVariableDescriptors.length; i++) {
                //         var processVariable = me.definition.processVariableDescriptors[i]
                //         if(processVariable.name == me.value.name && processVariable.typeClassName.indexOf("#")) {
                //             var definitionAndClassName = processVariable.typeClassName.split("#");
                //             var definitionName = definitionAndClassName[0];
                //             var classNameOnly = definitionAndClassName[1];

                //             var result;
                //             var uri = (encodeURI(window.backend.$bind.ref + "/definition/raw/" + definitionName + ".ClassDiagram.json"))

                //             console.log("try to get class diagram: " + uri);

                //             var xhr = new XMLHttpRequest();

                //             xhr.open('GET', uri, false);
                //             xhr.setRequestHeader("access_token", localStorage['access_token']);
                //             xhr.onload = function () {
                //                 result = JSON.parse(xhr.responseText)
                //             };
                //             xhr.send();
                //             for(var y = 0; y < result.definition.classDefinitions[1].length; y++) {
                //                 if(classNameOnly == result.definition.classDefinitions[1][y].name) {
                //                     for(var z = 0; z < result.definition.classDefinitions[1][y].fieldDescriptors.length; z++) {
                //                         me.keys.push(result.definition.classDefinitions[1][y].fieldDescriptors[z].name);
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        }
    }

</script>


