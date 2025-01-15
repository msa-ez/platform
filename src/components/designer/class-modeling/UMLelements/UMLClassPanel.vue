<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right width="500">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline">{{ titleName }}</v-list-item-title>
                    </v-list-item-content>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text>
                        <v-text-field
                                v-model="value.name"
                                label="Class Name"
                                autofocus
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-text-field
                                v-model="value.displayName"
                                label="Display Name"
                                :disabled="isReadOnly"
                        ></v-text-field>

                        <v-radio-group label="Class Type" v-model="classType">
                            <v-radio
                                    label="Aggregate Root"
                                    value="AggregateRoot"
                                    :disabled="isReadOnly"
                            ></v-radio>
                            <v-radio
                                    label="General Class"
                                    value="Class"
                                    :disabled="isReadOnly"
                            ></v-radio>
                            <v-radio
                                    label="Value Object"
                                    value="ValueObject"
                                    :disabled="isReadOnly"
                            ></v-radio>
                            <v-radio
                                    label="Abstract"
                                    value="Abstract"
                                    :disabled="isReadOnly"
                            ></v-radio>
                            <v-radio
                                    label="Interface"
                                    value="Interface"
                                    :disabled="isReadOnly"
                            ></v-radio>
                        </v-radio-group>

                        <v-text-field
                                v-if="value.isVO"
                                v-model="value.referenceClass"
                                label="Reference Aggregate Root"
                                :disabled="isReadOnly"
                        ></v-text-field>
                    </v-card-text>
                </v-card>

                <v-card outlined>
                    <v-card-text>
                        <event-storming-attribute
                                v-model="value.fieldDescriptors"
                                :entities="entities"
                                :type="value._type"
                                :elementId="value.elementView.id"
                                :isReadOnly="isReadOnly"
                        ></event-storming-attribute>
                    </v-card-text>
                </v-card>

                <v-card outlined>
                    <v-card-text>
                        <span class="headline">Operations</span>
                        <v-layout flat>
                            <v-col>
                                <draggable v-model="value.operations"
                                        v-bind="dragOptions"
                                        @start="drag = true"
                                        @end="drag = false"
                                >
                                    <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                        <div v-for="(operation, idx) in value.operations" :key="idx">
                                            <v-row class="mb-6" no-gutters>
                                                <!--v-col cols="2">
                                                    <div>{{operation.class}}</div>
                                                </v-col-->
                                                <v-col cols="3">
                                                    <div v-if="!operationEdit || value.operations.indexOf(operation) != operationEditIndex">
                                                        {{operation.returnType}}
                                                    </div>
                                                    <v-select class="mr-2 mt-0 pt-0"
                                                            v-else-if="operationEdit && value.operations.indexOf(operation) == operationEditIndex "
                                                            v-model="operation.returnType" 
                                                            :items="returnTypeList"
                                                            item-text="text" 
                                                            item-value="value"
                                                            item-disabled="disabled"
                                                            :disabled="isReadOnly"
                                                    ></v-select>
                                                </v-col>
                                                <v-col cols="7">
                                                    <div v-if="!operationEdit || value.operations.indexOf(operation) != operationEditIndex">
                                                        {{operation.name}}
                                                    </div>
                                                    <v-text-field class="mr-2 mt-0 pt-0"
                                                            v-else-if="operationEdit && value.operations.indexOf(operation) == operationEditIndex "
                                                            v-model="operation.name" 
                                                            required
                                                            :disabled="isReadOnly"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="2">
                                                    <v-btn  v-if="operationEdit && value.operations.indexOf(operation) == operationEditIndex"
                                                            x-small icon
                                                            class="mr-1"
                                                            @click="UMLOperationModify(operation)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>save</v-icon>
                                                    </v-btn>
                                                    <v-btn  v-else-if="!operationEdit || value.operations.indexOf(operation) != operationEditIndex"
                                                            x-small icon
                                                            class="mr-2"
                                                            @click="UMLOperationEdit(operation)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>edit</v-icon>
                                                    </v-btn>
                                                    <v-btn  x-small icon
                                                            @click="UMLOperationDelete(operation)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>delete</v-icon>
                                                    </v-btn>
                                                    <v-btn v-if="operationEdit && value.operations.indexOf(operation) == operationEditIndex"
                                                            x-small icon
                                                            class="ml-1"
                                                            @click="AddParam"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>mdi-plus</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                            <div v-if="operationEdit && value.operations.indexOf(operation) == operationEditIndex">
                                                <v-row v-for="(param, idx) in parameters" :key="idx">
                                                    <v-select 
                                                            style="width: 40px;"
                                                            v-model="param.type"
                                                            :items="returnTypeList" 
                                                            label="Parameter Type"
                                                    ></v-select>
                                                    <v-text-field 
                                                            style="margin-right: 10px;"
                                                            v-model="param.name"
                                                            label="Parameter Name"
                                                    ></v-text-field>
                                                    <v-btn  style="margin-top: 15px;"
                                                            icon small 
                                                            @click="DeleteParam(idx)">
                                                        <v-icon>delete</v-icon>
                                                    </v-btn>
                                                </v-row>
                                            </div>
                                        </div>
                                    </transition-group>
                                </draggable>
                                <div v-if="!operationEdit">
                                    <v-row justify="center">
                                        <v-select 
                                                style="width: 40px;"
                                                v-model="operationReturnType" 
                                                :items="returnTypeList" 
                                                label="Return Type"
                                                :disabled="isReadOnly"
                                        ></v-select>
                                        <v-text-field 
                                                style="margin-right: 10px;"
                                                v-model="operationName" 
                                                :label="$t('labelText.name')"
                                                required
                                                v-on:keyup.enter="UMLOperationADD"
                                                :disabled="isReadOnly"
                                        ></v-text-field>
                                        <v-tooltip top>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn  color="primary"
                                                        dark small fab
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        style="margin-top: 15px;"
                                                        @click="AddParam"
                                                        :disabled="isReadOnly"
                                                >
                                                    <v-icon>mdi-plus</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Add Parameters</span>
                                        </v-tooltip>
                                    </v-row>
                                    <v-row justify="center" v-for="(param, idx) in parameters" :key="idx">
                                        <v-select 
                                                style="width: 40px;"
                                                v-model="param.type"
                                                :items="returnTypeList" 
                                                label="Parameter Type"
                                                :disabled="isReadOnly"
                                        ></v-select>
                                        <v-text-field 
                                                style="margin-right: 10px;"
                                                v-model="param.name"
                                                label="Parameter Name"
                                                :disabled="isReadOnly"
                                        ></v-text-field>
                                        <v-btn  style="margin-top: 15px;"
                                                icon small 
                                                @click="DeleteParam(idx)"
                                                :disabled="isReadOnly"
                                        >
                                            <v-icon>delete</v-icon>
                                        </v-btn>
                                    </v-row>
                                </div>
                                <v-row v-if="!operationEdit" justify="end">
                                    <v-btn v-if="value.parentOperations.length > 0" 
                                            color="info" 
                                            depressed text
                                            @click="operationsDialog = true;"
                                            :disabled="isReadOnly"
                                    >Override</v-btn>
                                    <v-btn  depressed text
                                            style="color:#1E88E5;"
                                            @click="UMLOperationADD"
                                            :disabled="isReadOnly"
                                    >Add Operation</v-btn>
                                </v-row>
                            </v-col>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-list>

            <v-dialog v-model="operationsDialog" max-width="600">
                <v-card>
                    <v-card-title>Override Operations</v-card-title>
                    <v-card-text style="padding-bottom: 0px;">
                        <v-data-table
                                :headers="operationHeaders"
                                :items.sync="value.parentOperations"
                                hide-default-footer
                                class="elevation-1"
                                style="margin-bottom: 10px;">
                            <template v-slot:item.action="{ item }">
                                <v-row>
                                    <v-btn x-small outlined style="margin-right: 5px;" @click="updateOperation(item, 'override')">Override</v-btn>
                                    <!-- <v-btn x-small outlined @click="updateOperation(item, 'overload')">Overload</v-btn> -->
                                </v-row>
                            </template>
                        </v-data-table>

                        <v-row justify="center" v-if="addParameter">
                            <v-flex xs4>
                                <v-select
                                        v-model="operationReturnType" 
                                        :items="returnTypeList" 
                                        label="Return Type"
                                        style="margin-right: 15px;"
                                ></v-select>
                            </v-flex>
                            <v-flex xs6>
                                <v-text-field
                                        v-model="operationName" 
                                        :label="$t('labelText.name')"
                                        style="margin-right: 15px;"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs1>
                                <v-tooltip left>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn  color="primary"
                                                dark small fab
                                                v-bind="attrs"
                                                v-on="on"
                                                style="margin-top: 15px;"
                                                @click="AddParam">
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Add Parameters</span>
                                </v-tooltip>
                            </v-flex>
                        </v-row>
                        <v-row justify="center" v-for="(param, idx) in parameters" :key="idx">
                            <v-flex xs4>
                                <v-select 
                                        v-model="param.type"
                                        :items="returnTypeList" 
                                        label="Parameter Type"
                                        style="margin-right: 15px;"
                                ></v-select>
                            </v-flex>
                            <v-flex xs6>
                                <v-text-field 
                                        v-model="param.name"
                                        label="Parameter Name"
                                        style="margin-right: 15px;"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs1>
                                <v-btn icon style="margin-top: 15px;" @click="DeleteParam(idx)">
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </v-flex>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-navigation-drawer>
    </v-layout>

</template>

<script>
    import draggable from 'vuedraggable'
    import UMLPropertyPanel from '../UMLPropertyPanel'
    import AttributeEditor from '../../es-modeling/EventStormingAttributeEditor'

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    var changeCase = require('change-case');
    var pluralize = require('pluralize');

    export default {
        mixins: [UMLPropertyPanel],
        name: 'uml-class-panel',
        components: {
            draggable,
            'event-storming-attribute': AttributeEditor,
        },
        data: function () {
            return {
                drag: false,
                
                // operations
                operationEdit: false,
                operationEditIndex: 0,

                returnTypeList: [ 'void', 'String', 'Long', 'Double', 'Boolean', 'Int', 'Byte', 'Float', 'Short' ],
                operationReturnType: 'void',
                
                operationName: '',
                parameters: [],
                isOverride: false,
                operationHeaders: [
                    {
                        text: 'Name',
                        value: 'name',
                        align: 'center'
                    },
                    {
                        text: 'Classifier',
                        value: 'class',
                        align: 'center'
                    },
                    {
                        text: 'Return Type',
                        value: 'returnType',
                        align: 'center'
                    },
                    {
                        text: '',
                        value: 'action',
                        sortable: false,
                        align: 'end'
                    },
                ],
                operationsDialog: false,
                addParameter: false,

                classType: 'Class',
            }
        },
        computed: {
            dragOptions() {
                return {
                    animation: 200,
                    group: "description",
                    disabled: this.isReadOnly,
                    ghostClass: "ghost"
                };
            },
            titleName() {
                if(this.value.isVO) {
                    return "Value Object"
                } else {
                    return "Entity Class"
                }
            }
        },
        beforeDestroy() {
        },
        created: function () {
            // var me = this
        },
        mounted() {
            var me = this

            Vue.nextTick(() => {
                if(me.value.isAggregateRoot) {
                    me.classType = "AggregateRoot"
                }
                if(me.value.isVO) {
                    me.classType = "ValueObject"
                }
                if(me.value.isAbstract) {
                    me.classType = "Abstract"
                }
                if(me.value.isInterface) {
                    me.classType = "Interface"
                }
                if(!me.value.isAggregateRoot && !me.value.isVO && !me.value.isAbstract && !me.value.isInterface) {
                    me.classType = "Class"
                }

                me.setReturnTypeList()
            });
        },
        watch: {
            'value.name': {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal != oldVal) {
                        me.value.namePascalCase = changeCase.pascalCase(newVal);
                        me.value.nameCamelCase = changeCase.camelCase(newVal);
                        me.value.namePlural = pluralize(newVal);
                    }
                }
            },
            "value.isVO": function(val) {
                var me = this
                if(val) {
                    if (me.value.fieldDescriptors.length > 0) {
                        me.value.fieldDescriptors.forEach(function (item, idx) {
                            if(item.isKey) {
                                item.isKey = false
                            }
                        })
                    }
                    me.value._type = 'org.uengine.uml.model.vo.Class'
                } else {
                    if (me.classType == "AggregateRoot" || me.classType == "Class") {
                        if (me.value.fieldDescriptors.length > 0) {
                            var hasId = me.value.fieldDescriptors.some(item => item.isKey);
                            if(!hasId) {
                                me.value.fieldDescriptors.push({
                                    "_type": "org.uengine.uml.model.FieldDescriptor",
                                    "name": "id",
                                    "className": "Long",
                                    "isKey": true,
                                    "isVO": false,
                                    "namePascalCase": "Long",
                                    "nameCamelCase": "long",
                                    "label": "- id: Long",
                                    "isList": false,
                                });
                                me.value.fieldDescriptors = me.value.fieldDescriptors.reduce((acc, current) => {
                                    const duplicate = acc.find(item => item.name === current.name && item.className === current.className && item.isVO === current.isVO);
                                    if (duplicate) {
                                        // If any of the duplicates has isKey as true, set isKey to true
                                        duplicate.isKey = duplicate.isKey || current.isKey;
                                    } else {
                                        acc.push(current);
                                    }
                                    return acc;
                                }, []);
                            }
                        }
                    }
                }
            },
            classType: function(val) {
                var me = this
                if(val == 'AggregateRoot') {
                    me.value.isAggregateRoot = true
                    me.value.isVO = false
                    me.value.isAbstract = false
                    me.value.isInterface = false
                    me.value.elementView.titleH = 50
                } else {
                    me.value.isAggregateRoot = false
                    if(val == 'ValueObject') {
                        me.value.isVO = true
                        me.value.isAbstract = false
                        me.value.isInterface = false
                        me.value.elementView.titleH = 50
                    } else if(val == 'Abstract') {
                        me.value.isVO = false
                        me.value.isAbstract = true
                        me.value.isInterface = false
                        me.value.elementView.titleH = 30
                    } else if(val == 'Interface') {
                        me.value.isVO = false
                        me.value.isAbstract = false
                        me.value.isInterface = true
                        me.value.elementView.titleH = 50
                    } else {
                        me.value.isVO = false
                        me.value.isAbstract = false
                        me.value.isInterface = false
                        me.value.elementView.titleH = 30
                    }
                }
            },
        },
        methods:{
            executeBeforeDestroy() {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        /*
                            _value : 기존 값.
                            value  : Panel 사용되는 값,
                        */
                        if(!me.value) return;
                        var diff = jsondiffpatch.diff(me._value, me.value)
                        if (diff) {
                            console.log('UMLClassPanel - executeBeforeDestroy')
                            if (!me.isReadOnly) {
                                if(!me.canvas.embedded) {
                                    me.canvas.changedByMe = true
                                } else {
                                    // var aggElement = me.canvas.aggregateRootList[0];
                                    var aggElement = me.canvas.aggregateRootList[0];
                                    if (aggElement) {
                                        if(me.value.parentId && me.value.isAggregateRoot) {
                                            me.$set(aggElement.aggregateRoot, "fieldDescriptors", me.value.fieldDescriptors);
                                            me.$set(aggElement.aggregateRoot, "operations", me.value.operations);
                                        }
                                    }
                                }
                                // all sync
                                Object.keys(me.value).forEach(function (itemKey) {
                                    if(!(itemKey == 'elementView' || itemKey == 'relationView')){
                                        // Exception: 위치정보
                                        me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                    }
                                })

                                // ele set name -> set to relation name
                                let relations = Object.values(me.canvas.value.relations).filter(rel => rel!==null && rel.to===me.value.elementView.id)
                                relations.forEach(rel => {
                                    if (rel.name == '') {
                                        rel.name = me.value.name
                                    }

                                    const obj = {
                                        action: "updateRelation",
                                        relation: rel
                                    }
                                    me.$EventBus.$emit(`${rel.from}`, obj)
                                })

                                // re setting 값을 emit
                                me.$emit('_value-change', me._value)
                            }
                        }
                        me.closePanelAction()
                    }
                })
            },
            UMLOperationADD() {
                var me = this
                var isNew = true
                if(!me.value.operations) {
                    me.value.operations = []
                } else if(me.value.operations.length > 0) {
                    me.value.operations.forEach(function(item) {
                        if(item.name == me.operationName) {
                            isNew = false
                        }
                    })
                }
                
                if(!isNew) {
                    return
                }

                var label = '+ ' + me.operationName + "("
                if(me.parameters.length > 0) {
                    me.parameters.forEach(function (param, index) {
                        label += param.name + ": " + param.type + ", "
                        if(index == me.parameters.length - 1) {
                            label = label.slice(0, -2)
                        }
                    })
                }
                label += "): " + me.operationReturnType
                var obj = {
                    "name": me.operationName,
                    "class": me.value.name,
                    "returnType": me.operationReturnType,
                    "parameters": me.parameters,
                    "label": label,
                    "isOverride": me.isOverride,
                }
                me.value.operations.push(obj)
                
                me.operationReturnType = 'void'
                me.operationName = ''
                me.parameters = []
                me.isOverride = false
            },
            UMLOperationDelete(val) {
                var me = this;
                me.value.operations.forEach(function (operation, idx) {
                    if (operation.name == val.name && operation.type == val.type && operation.class == val.class) {
                        if (idx > -1) {
                            me.value.operations.splice(idx, 1)
                        }
                    }
                })
            },
            UMLOperationEdit(val) {
                var me = this
                me.operationEditIndex = me.value.operations.indexOf(val)
                me.operationEdit = true
                me.parameters = val.parameters
            },
            UMLOperationModify(val) {
                var me = this
                var label = "+ " + val.name + "("
                if(val.parameters.length > 0) {
                    val.parameters.forEach(function (param, index) {
                        label += param.name + ": " + param.type + ", "
                        if(index == val.parameters.length - 1) {
                            label = label.slice(0, -2)
                        }
                    })
                }
                label += "): " + val.returnType
                var tmpObject = {
                    "name": val.name,
                    "class": me.value.name,
                    "returnType": val.returnType,
                    "parameters": me.parameters,
                    "label": label,
                    "isOverride": val.isOverride,
                }

                me.value.operations[me.operationEditIndex] = tmpObject
                me.operationEdit = false
                me.parameters = []
            },
            updateOperation(value, edit) {
                var me = this
                me.operationReturnType = value.returnType
                me.operationName = value.name
                
                if(edit == 'override') {
                    me.parameters = value.parameters
                    me.isOverride = true
                    me.UMLOperationADD()
                    me.operationsDialog = false;
                } else {
                    me.AddParam()
                }
            },
            AddParam() {
                var me = this;
                if(me.addParameter) {
                    me.parameters.push({
                        type: '',
                        name: ''
                    });
                } else {
                    me.addParameter = true;
                }
            },
            DeleteParam(index) {
                this.parameters.splice(index, 1)
            },
            setReturnTypeList() {
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
                    {text: 'BigDecimal', value: 'BigDecimal'},
                ]
                var complexTypes = [
                    {text: 'Complex Types', disabled: true},
                ]

                if (Object.values(me.canvas.value.elements).length > 1) {
                    Object.values(me.canvas.value.elements).forEach(function (item) {
                        if (item) {
                            if (item._type.includes('Class')) {
                                var isExistClass = false
                                complexTypes.forEach(function(type) {
                                    if(type.text == changeCase.pascalCase(item.name)) {
                                        isExistClass = true
                                    }
                                })
                                if(!isExistClass && item.name != undefined) {
                                    complexTypes.push({
                                        text: changeCase.pascalCase(item.name), 
                                        value: changeCase.pascalCase(item.name)
                                    })
                                }
                            }
                        }
                    })
                }
                me.returnTypeList = [...primitiveTypes, ...complexTypes]

            },
        },
    }
</script>
