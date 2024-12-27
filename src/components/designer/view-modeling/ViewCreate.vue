<template>
    <v-card
        outlined
        :disabled="isRead"
        min-width="450px"
    >
        <v-row align="center" justify="end" dense>
            <v-btn style="margin:5px 5px 0 0;" text small v-if="value.createRules.length != 1" @click.native="removeMainRow(index)">
                <v-icon small dark>mdi-delete</v-icon>
            </v-btn>
        </v-row>

        <v-list-item-subtitle style="margin-top:15px; padding-bottom:15px;">
            <v-col align="start" justify="start" style="padding-top: 10px">
                <v-row align="start" justify="start" style=" margin-left: 5px; margin-right: 5px;">
                    <v-autocomplete
                        v-model="createItem.when"
                        :items="eventLists"
                        item-text="name"
                        return-object
                        prefix="CREATE WHEN"
                        label=" Select Event"
                        style="font-size: 15px; marign-top:15px;"
                        dense
                    ></v-autocomplete>
                </v-row>


                <div style="font-size: 15px; margin-left: 10px;">SET</div>
                <v-simple-table dense style="margin-left: 5px; margin-right:5px;">
                    <template v-slot:default>
                        <thead>
                        <tr>

                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item,key) in fieldMappingLists">
                            <td class="text-right" v-if="key == fieldMappingLists.length-1 && !saveBtn">
                                <v-autocomplete
                                        v-model="item.viewField"
                                        :items="value.fieldDescriptors"
                                        item-text="name"
                                        return-object
                                        label="readModelField"
                                ></v-autocomplete>
                            </td>
                            <td class="text-left" v-else> {{value.name}}.{{ item.viewField ? item.viewField.name : '' }}</td>


                            <td class="text-center" v-if="key == fieldMappingLists.length-1 && !saveBtn">
                                <div v-if="item.operator">
                                    <v-autocomplete
                                            v-model="item.operator"
                                            :items="operatorItems"
                                            label="operator"
                                            style="text-align-last: center;"
                                    ></v-autocomplete>
                                </div>
                            </td>
                            <td class="text-center" v-else> {{item.operator}}</td>


                            <td class="text-left" v-if="key == fieldMappingLists.length-1 && !saveBtn">

                                <div v-if="item.eventField && item.eventField.className == true">
                                    <v-text-field
                                            v-model="item.eventField.value"
                                            color="blue-grey lighten-2"
                                            label="value"
                                    ></v-text-field>
                                </div>
                                <div v-else>
                                    <v-autocomplete
                                            :value="item.eventField"
                                            @change="onChangeEventField($event, item)"
                                            :items="selectedEventFieldLists"
                                            item-text="name"
                                            return-object
                                            label="eventField"
                                    ></v-autocomplete>
                                </div>
                            </td>

                            <td class="text-left" v-else>
                                <div v-if="item.eventField && item.eventField.className == true">
                                    {{item.eventField.value }}
                                </div>
                                <div v-else>
                                    {{ createItem.when ? createItem.when.name : null }}.{{ item.eventField ? item.eventField.name : '' }}
                                </div>
                            </td>

                            <td class="text-center">
                                <div class="row" style="place-content:center; ">
                                    <v-btn small text
                                           @click.native="removeRow(createItem.fieldMapping,key)">
                                        <v-icon small> mdi-minus-circle-outline </v-icon>
                                    </v-btn>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>

                <v-row align="center" justify="end">
                    <v-btn text block style="height: 20px;" @click.native="addRow()">
                        <v-icon small> mdi-plus-circle-outline </v-icon>
                    </v-btn>
                </v-row>

            </v-col>
        </v-list-item-subtitle>
    </v-card>

</template>

<script>
    export default {
        name: 'ViewCreate',
        props: {
            value: Object,
            createItem: Object,
            index: Number,
            isRead: Boolean,
        },
        data: function () {
            return {
                saveBtn: false,
                operatorItems: ['+=', '-=', '=']
            }
        },
        computed: {
            fieldMappingLists(){
                //init set
                if (this.createItem.fieldMapping) {
                    this.createItem.fieldMapping.forEach(function (item) {
                        if (item && !item.operator) {
                            item.operator = '='
                        }
                    })
                }
                return this.createItem.fieldMapping
            },
            selectedEventFieldLists: function () {
                var me = this
                var array = []
                var obj = {
                    name: 'Direct-Val',
                    className: true,
                    value: '',
                }

                if (!me.isEmptyObject(me.createItem.when)) {
                    if (me.eventLists.findIndex(x => x.elementView.id === me.createItem.when.elementView.id) != -1) {
                        array = me.eventLists[me.eventLists.findIndex(x => x.elementView.id === me.createItem.when.elementView.id)].fieldDescriptors
                    }
                }
                var copyArray = JSON.parse(JSON.stringify(array))
                if (copyArray.findIndex(x => x.name == 'Direct-Val') == -1)
                    copyArray.push(obj)

                return  copyArray
            },
            eventLists: function () {
                var me = this
                var designer = me.getComponent('event-storming-model-canvas')
                return Object.values(designer.attachedLists().eventLists)
            },
        },
        created() {
        },
        methods: {
            onChangeEventField(selectField, row){
                if( selectField.name == "Direct-Val" && selectField.className){
                    row.eventField = JSON.parse(JSON.stringify(selectField))
                } else {
                    row.eventField = selectField;
                }
            },
            changeOperator(item, operatorItem) {
                if (item && item.operator) {
                    item.operator = operatorItem
                } else {
                    item.operator = '='
                }
            },
            isEmptyObject(obj) {
                var boolean = false
                if (obj == null) return true;
                if (Object.keys(obj) === 0) return true;

                return boolean
            },
            test() {
                if (this.saveBtn) {
                    this.saveBtn = false
                } else {
                    this.saveBtn = true
                }

            },
            removeMainRow(viewId) {
                var me = this
                me.value.createRules[viewId] = null
                me.value.createRules = me.value.createRules.filter(n => n)
            },
            removeRow: function (table, removeKey) {
                var me = this
                table.some(function (views, idx) {
                    if (idx == removeKey) {
                        if (idx > -1) {
                            table.splice(idx, 1)
                        }
                    }
                })
            },
            addRow: function () {
                var me = this
                try {
                    var canvas = me.getComponent('event-storming-model-canvas')
                    var fieldMapping = this.createItem.fieldMapping
                    var len = fieldMapping.length - 1

                    // me.validateRow(this.createItem.fieldMapping);

                    if (
                        fieldMapping[len]
                        && fieldMapping[len].viewField
                        && fieldMapping[len].viewField.name != ''
                        && fieldMapping[len].eventField
                        && (fieldMapping[len].eventField.className ? fieldMapping[len].eventField.value != '' : (fieldMapping[len].eventField && fieldMapping[len].eventField.name != ''))
                        || len == -1
                    ) {
                        var obj = {
                            viewField: null,
                            eventField: null,
                            operator: '='
                        }

                        fieldMapping.push(obj)
                    } else {
                        canvas.alertInfo.text = 'Please fill out the target mapping field'
                        canvas.alertInfo.show = true
                    }

                } catch (e) {
                    canvas.alertInfo.text = 'Error - Create'
                    canvas.alertInfo.show = true
                }
            },
            validateRow(fieldMapping){
                if(!fieldMapping) return false;

                let len = fieldMapping.length;
                // if(
                // fieldMapping[len]
                // && fieldMapping[len].viewField
                // && fieldMapping[len].viewField.name != ''
                // && fieldMapping[len].eventField
                // && (fieldMapping[len].eventField.className ? fieldMapping[len].eventField.value != '' : (fieldMapping[len].eventField && fieldMapping[len].eventField.name != ''))

                return false;
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
        }

    }
</script>