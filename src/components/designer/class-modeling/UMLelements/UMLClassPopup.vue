<template>
    <div>
        <v-card>
            <v-card-title>Add {{editType}}</v-card-title>
            <v-card-text v-if="type == 'attribute'">
                <v-row justify="center">    
                    <v-select
                            v-model="tmpField.className"
                            :items="entityTypeList"
                            :label="$t('labelText.type')"
                            class="ml-2"
                            style="width: 80px;"
                            :disabled="isReadOnly"
                    ></v-select>
                    <v-text-field
                            v-model="tmpField.name"
                            required
                            :label="$t('labelText.name')"
                            class="mx-2"
                            @keydown.enter="addObject"
                    ></v-text-field>
                </v-row>
                <v-row justify="center">
                    <v-checkbox
                            v-model="tmpField.isKey"
                            label="Key"
                            class="mr-8"
                            :disabled="isReadOnly"
                    ></v-checkbox>
                    <v-checkbox
                            v-model="tmpField.isList"
                            label="List"
                            class="mr-8"
                            :disabled="isReadOnly"
                    ></v-checkbox>
                    <v-checkbox
                            v-model="tmpField.isName"
                            :label="$t('labelText.name')"
                            class="mr-8"
                            :disabled="isReadOnly"
                    ></v-checkbox>
                    <v-checkbox
                            v-model="tmpField.isLob"
                            label="Large Object"
                    ></v-checkbox>
                </v-row>
            </v-card-text>
            <v-card-text v-if="type == 'operation'">
                <v-row justify="center">
                    <v-select
                            v-model="tmpMethod.returnType"
                            :items="returnTypeList"
                            class="mx-2"
                            label="Return Type"
                            style="width: 80px;"
                            :disabled="isReadOnly"
                    ></v-select>
                    <v-text-field
                            v-model="tmpMethod.name"
                            required
                            :label="$t('labelText.name')"
                            class="mr-2"
                            @keydown.enter="addObject"
                    ></v-text-field>
                    <v-tooltip left>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn  color="primary"
                                    dark small fab
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-top: 10px;"
                                    :disabled="isReadOnly"
                                    @click="AddParam"
                                    class="mr-2"
                            >
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </template>
                        <span>Add Parameter</span>
                    </v-tooltip>
                </v-row>
                <div v-if="tmpMethod.parameters.length > 0">
                    <v-row justify="center" v-for="(param, idx) in tmpMethod.parameters" :key="idx">
                        <v-select
                                v-model="param.type"
                                :items="entityTypeList"
                                label="Parameter Type"
                                class="mx-2"
                                style="width: 80px;"
                                :disabled="isReadOnly"
                        ></v-select>
                        <v-text-field
                                v-model="param.name"
                                label="Parameter Name"
                                class="mr-2"
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-btn  color="primary"
                                dark small fab icon
                                style="margin-top: 10px;"
                                @click="tmpMethod.parameters.splice(idx, 1)"
                                class="mr-2"
                                :disabled="isReadOnly"
                        >
                            <v-icon>mdi-minus</v-icon>
                        </v-btn>
                    </v-row>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="close">Close</v-btn>
                <v-btn color="primary darken-1" text @click="addObject">
                    {{ isNew ? 'Add' : 'Save' }}
                </v-btn>
            </v-card-actions>

        </v-card>
    </div>
</template>

<script>

    var changeCase = require('change-case');

    export default {
        name: 'uml-class-popup',
        props: {
            value: Object,
            isReadOnly: Boolean,
            type: String,
            isNew: Boolean,
            index: Number,
        },
        computed: {
            editType() {
                return changeCase.pascalCase(this.type)
            },
        },
        data: function () {
            return {
                tmpField: {
                    _type: "org.uengine.model.FieldDescriptor",
                    name: "",
                    namePascalCase: "",
                    nameCamelCase: "",
                    className: "String",
                    isKey: false,
                    isName: false,
                    isList: false,
                    isVO: false,
                    isLob: false,
                    label: ""
                },
                tmpMethod: {
                    name: "",
                    class: this.value.name,
                    returnType: "void",
                    parameters: [],
                    label: "",
                    isOverride: false,
                },
                entityTypeList: [],
                returnTypeList: [ 'void', 'String', 'Long', 'Double', 'Boolean', 'Int', 'Byte', 'Float', 'Short' ],
            };
        },
        created: function () {
            var me = this
            me.setAttrTypes()
            if(!me.isNew) {
                if(me.type == 'attribute') {
                    me.tmpField = me.value.fieldDescriptors[me.index]
                } else {
                    me.tmpMethod = me.value.operations[me.index]
                }
            }
        },
        mounted: function () {
            // var me = this
        },
        watch: {
            "tmpField.name": {
                deep: true,
                handler(val) {
                    this.tmpField.namePascalCase = changeCase.pascalCase(val);
                    this.tmpField.nameCamelCase = changeCase.camelCase(val);
                    this.tmpField.label = "- " + changeCase.camelCase(val) + ": " + this.tmpField.className;
                }
            }
        },
        methods: {
            close() {
                this.$emit('close')
            },
            addObject() {
                var me = this
                if(me.type == 'attribute') {
                    me.tmpField.label = "- " + me.tmpField.nameCamelCase + ": " + me.tmpField.className
                    
                    if(me.isNew) {
                        me.value.fieldDescriptors.push(me.tmpField)
                    } else {
                        me.value.fieldDescriptors[me.index] = me.tmpField
                    }
                    
                    me.tmpField=  {
                        _type: "org.uengine.model.FieldDescriptor",
                        name: "",
                        namePascalCase: "",
                        nameCamelCase: "",
                        className: "String",
                        isKey: false,
                        isName: false,
                        isList: false,
                        isVO: false,
                        isLob: false,
                        label: ""
                    }
                } else if(me.type == 'operation') {
                    me.tmpMethod.label = "+ " + me.tmpMethod.name + "("
                    if(me.tmpMethod.parameters.length > 0) {
                        me.tmpMethod.parameters.forEach((param, idx) => {
                            me.tmpMethod.label += param.name + ": " + param.type
                            if(idx+1 < me.tmpMethod.parameters.length) {
                                me.tmpMethod.label += ", "
                            }
                        })
                    }
                    me.tmpMethod.label += "): " + me.tmpMethod.returnType
                    
                    if(me.isNew) {
                        me.value.operations.push(me.tmpMethod)
                    } else {
                        me.value.operations[me.index] = me.tmpMethod
                    }

                    me.tmpMethod = {
                        name: "",
                        class: this.value.name,
                        returnType: "void",
                        parameters: [],
                        label: "",
                        isOverride: false,
                    }
                }
                me.close()
            },
            AddParam() {
                var me = this;
                me.tmpMethod.parameters.push({
                    type: 'String',
                    name: ''
                });
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
            setAttrTypes() {
                var me = this
                var primitiveTypes = [
                    {text: 'Primitive Types', disabled: true},
                    {text: 'Integer', value: 'Integer'},
                    {text: 'String', value: 'String'},
                    {text: 'Boolean', value: 'Boolean'},
                    {text: 'Float', value: 'Float'},
                    {text: 'Double', value: 'Double'},
                    {text: 'Long', value: 'Long'},
                    {text: 'Date', value: 'Date'},
                ]
                var complexTypes = [
                    {text: 'Complex Types', disabled: true},
                    {text: 'Address', value: 'Address'},
                    {text: 'Photo', value: 'Photo'},
                    {text: 'User', value: 'User'},
                    {text: 'Money', value: 'Money'},
                    {text: 'Email', value: 'Email'},
                    {text: 'Payment', value: 'Payment'},
                    {text: 'Weather', value: 'Weather'},
                    {text: 'Likes', value: 'Likes'},
                    {text: 'Tags', value: 'Tags'},
                    {text: 'Comment', value: 'Comment'},
                ]
                var enumTypes = [
                    {text: 'Enumeration Type', disabled: true},
                ]

                var elements = me.getComponent('uml-class-model-canvas').value.elements

                if(elements) {
                    if (Object.values(elements).length > 1) {
                        Object.values(elements).forEach(function (item) {
                            if (item) {
                                if (item._type.includes('Class')) {
                                    var isExistClass = false
                                    complexTypes.forEach(function(type) {
                                        if(type.text == item.namePascalCase) {
                                            isExistClass = true
                                        }
                                    })
                                    if(!isExistClass && item.namePascalCase != undefined) {
                                        complexTypes.push({text: item.namePascalCase, value: item.namePascalCase})
                                    }
                                }
                                if (item._type.includes('enum')) {
                                    var isExistEnum = false
                                    enumTypes.forEach(function(type) {
                                        if(type.text == item.namePascalCase) {
                                            isExistEnum = true
                                        }
                                    })
                                    if(!isExistEnum && item.namePascalCase != undefined) {
                                        enumTypes.push({text: item.namePascalCase, value: item.namePascalCase})
                                    }
                                }
                            }
                        })
                    }
                }

                me.entityTypeList = [...primitiveTypes, ...complexTypes]
                me.entityTypeList = [...me.entityTypeList, ...enumTypes]
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
