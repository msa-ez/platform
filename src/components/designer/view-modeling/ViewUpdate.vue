<template>
    <v-card
            outlined
            :disabled="isRead"
            min-width="450px"
            style="margin:-15px 0 0 -13px;"
    >
        <v-row align="center" justify="end" dense>
            <v-btn style="margin:5px 5px 0 0;" text small v-if="value.updateRules.length != 1" @click.native="removeMainRow(index)">
                <v-icon small>mdi-minus-circle-outline</v-icon>
            </v-btn>
        </v-row>

        <v-list-item-subtitle>
            <v-col align="start" justify="start" style="padding-top: 10px;">
                <v-row align="start" justify="start" style=" margin-left: 5px; margin-right: 5px;">
                    <v-autocomplete
                            v-model="updateItem.when"
                            :items="eventLists"
                            item-text="name"
                            return-object
                            prefix="UPDATE WHEN"
                            label=" Select Event"
                            style="font-size: 15px"
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
                            <td class="text-right" v-if="key == fieldMappingLists.length-1 && !saveSetBtn">
                                <v-autocomplete
                                        v-model="item.viewField"
                                        :items="value.fieldDescriptors"
                                        item-text="name"
                                        return-object
                                        label="readModelField"
                                ></v-autocomplete>
                            </td>
                            <td class="text-left" v-else> {{value.name}}.{{item.viewField ? item.viewField.name : ''  }}</td>


                            <td class="text-center" v-if="key == fieldMappingLists.length-1 && !saveSetBtn">
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


                            <td class="text-left" v-if="key == fieldMappingLists.length-1 && !saveSetBtn">
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
                                    {{ updateItem.when ? updateItem.when.name : null}}.{{ item.eventField ?
                                    item.eventField.name: null }}
                                </div>
                            </td>

                            <td class="text-center">
                                <v-btn small text
                                       @click.native="removeRow(updateItem.fieldMapping,key)">
                                    <v-icon small>  mdi-minus-circle-outline </v-icon>
                                </v-btn>
                            </td>
                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>


                <v-row align="center" justify="end">
                    <v-btn style="margin:12px 0 12px 0;" text block @click.native="addRow('set')">
                        <v-icon small> mdi-plus-circle-outline</v-icon>
                    </v-btn>
                </v-row>


                <div style="font-size: 15px; margin-left: 10px;">WHERE</div>
                <v-simple-table
                        dense style="margin-left: 5px; margin-right:5px;"
                >
                    <template v-slot:default>
                        <thead>
                        <tr>

                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item,key) in updateItem.where">
                            <td class="text-right" v-if="key == updateItem.where.length-1  && !saveWhereBtn">
                                <v-autocomplete
                                        v-model="item.viewField"
                                        :items="value.fieldDescriptors"
                                        item-text="name"
                                        return-object
                                        label="readModelField"
                                ></v-autocomplete>
                            </td>
                            <td class="text-left" v-else> {{ value.name }}.{{ item.viewField.name }}</td>

                            <td class="text-center"> =</td>

                            <td class="text-left" v-if="key == updateItem.where.length-1  && !saveWhereBtn">
                                <v-autocomplete
                                        v-model="item.eventField"
                                        :items="noInputSyncEventField"
                                        item-text="name"
                                        return-object
                                        label="eventField"
                                ></v-autocomplete>
                            </td>
                            <td class="text-left" v-else>
                                {{ updateItem.when ? updateItem.when.name: null }}.{{ item.eventField ?
                                item.eventField.name: null}}
                            </td>

                        </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-col>

        </v-list-item-subtitle>

    </v-card>
</template>

<script>
    export default {
        name: 'ViewUpdate',
        props: {
            value: Object,
            updateItem: Object,
            index: Number,
            isRead: Boolean
        },
        data: function () {
            return {
                saveSetBtn: false,
                saveWhereBtn: false,
                operatorItems: ['+=', '-=', '=']
            }
        },
        computed: {
            fieldMappingLists() {
                //init set
                if (this.updateItem.fieldMapping) {
                    this.updateItem.fieldMapping.forEach(function (item) {
                        if (item && !item.operator) {
                            item.operator = '='
                        }
                    })
                }
                return this.updateItem.fieldMapping
            },
            noInputSyncEventField: function () {
                var me = this

                var array = []

                if (!me.isEmptyObject(this.updateItem.when)) {
                    if (this.eventLists.findIndex(x => x.elementView.id === this.updateItem.when.elementView.id) != -1) {
                        array = this.eventLists[this.eventLists.findIndex(x => x.elementView.id === this.updateItem.when.elementView.id)].fieldDescriptors
                    }
                }
                var copyArray = JSON.parse(JSON.stringify(array))

                return copyArray
            },
            selectedEventFieldLists: function () {
                var me = this

                var array = []
                var obj = {
                    name: 'Direct-Val',
                    className: true,
                    value: '',
                }

                if (!me.isEmptyObject(me.updateItem.when)) {
                    if (me.eventLists.findIndex(x => x.elementView.id === me.updateItem.when.elementView.id) != -1) {
                        array = me.eventLists[me.eventLists.findIndex(x => x.elementView.id === me.updateItem.when.elementView.id)].fieldDescriptors
                    }
                }
                var copyArray = JSON.parse(JSON.stringify(array))
                if (copyArray.findIndex(x => x.name == 'Direct-Val') == -1)
                    copyArray.push(obj)

                return copyArray
            },

            eventLists: function () {
                var me = this
                var designer = me.getComponent('event-storming-model-canvas')
                return Object.values(designer.attachedLists().eventLists)
            },
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
                if (Object.keys(obj).length == 0) return true;

                return boolean
            },
            saveSetRows() {
                if (this.saveSetBtn) {
                    this.saveSetBtn = false
                } else {
                    this.saveSetBtn = true
                }

            },
            saveWhereRows() {
                if (this.saveWhereBtn) {
                    this.saveWhereBtn = false
                } else {
                    this.saveWhereBtn = true
                }

            },
            removeMainRow(viewId) {
                var me = this
                me.value.updateRules[viewId] = null
                me.value.updateRules = me.value.updateRules.filter(n => n)
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
            addRow: function (location) {
                var me = this
                var canvas = me.getComponent('event-storming-model-canvas')

                try {
                    if (location == 'set') {
                        var fieldMapping = this.updateItem.fieldMapping
                        var len = fieldMapping.length - 1

                        if (fieldMapping[len]
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
                            fieldMapping.push(JSON.parse(JSON.stringify(obj)))

                        } else {
                            canvas.alertInfo.text = 'Please TextField input Text'
                            canvas.alertInfo.show = true
                        }
                    } else if (location == 'where') {
                        var fieldMapping = this.updateItem.where
                        var len = fieldMapping.length - 1

                        if (
                            fieldMapping[len]
                            && fieldMapping[len].viewField && fieldMapping[len].viewField.name != ''
                            && (fieldMapping[len].eventField.className ? fieldMapping[len].eventField.value != '' : (fieldMapping[len].eventField && fieldMapping[len].eventField.name != ''))
                        ) {
                            var obj = {
                                viewField: null,
                                eventField: null,
                                operator: '='
                            }
                            fieldMapping.push(JSON.parse(JSON.stringify(obj)))

                        } else {
                            canvas.alertInfo.text = 'Please TextField input Text'
                            canvas.alertInfo.show = true
                        }

                    }
                } catch (e) {
                    canvas.alertInfo.text = 'Error - Update'
                    canvas.alertInfo.show = true
                }

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