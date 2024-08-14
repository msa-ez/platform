<template>
    <v-card
            outlined
            :disabled="isRead"
            min-width="450px"
            max-width="450px"
            style="margin:-15px 0 0 -13px;"
    >
        <v-row align="center" justify="end" dense>
            <v-btn style="margin:5px 5px 0 0;" text v-if="value.deleteRules.length != 1"  @click.native="removeMainRow(index)">
                <v-icon small>mdi-minus-circle-outline</v-icon>
            </v-btn>
        </v-row>

        <v-list-item-subtitle>
            <v-col align="start" justify="start" style="padding-top: 10px">
                <v-row align="start" justify="start" style=" margin-left: 5px; margin-right: 5px;">
                    <v-autocomplete
                            v-model="deleteItem.when"
                            :items="eventLists"
                            item-text="name"
                            return-object
                            prefix="DELETE WHEN"
                            label=" Select Event"
                            style="font-size: 15px"
                    ></v-autocomplete>
                </v-row>


                <div style="font-size: 15px; margin-left: 13px;">WHERE</div>

                <v-simple-table
                        dense style="margin-left: 5px; margin-right:5px;"
                >
                    <template v-slot:default>
                        <thead>
                        <tr>

                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item,key) in deleteItem.where">
                            <td class="text-right" v-if="key == deleteItem.where.length-1  && !saveWhereBtn">
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

                            <td class="text-left" v-if="key == deleteItem.where.length-1  && !saveWhereBtn">
                                <v-autocomplete
                                        v-model="item.eventField"
                                        :items="noInputSyncEventField"
                                        item-text="name"
                                        return-object
                                        label="eventField"
                                ></v-autocomplete>
                            </td>
                            <td class="text-left" v-else>
                                {{ deleteItem.when ? deleteItem.when.name: null }}.{{ item.eventField ? item.eventField.name: null}}
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
        name: 'ViewDelete',
        props: {
            value: Object,
            deleteItem: Object,
            index: Number,
            isRead:Boolean
        },
        data: function () {
            return {
                saveWhereBtn: false
            }
        },
        computed: {
            getFieldMapping() {
                //init set
                return this.deleteItem.fieldMapping
            },
            noInputSyncEventField: function () {
                var me = this
                var array = []

                if (!me.isEmptyObject(this.deleteItem.when)) {
                    if (this.eventLists.findIndex(x => x.elementView.id === this.deleteItem.when.elementView.id) != -1) {
                        array = this.eventLists[this.eventLists.findIndex(x => x.elementView.id === me.deleteItem.when.elementView.id)].fieldDescriptors
                    }
                }
                var copyArray = JSON.parse(JSON.stringify(array))

                return copyArray
            },
            eventLists: function () {
                var me = this
                var designer = me.getComponent('event-storming-model-canvas')
                return Object.values(designer.attachedLists().eventLists)
            },

        },
        methods: {
            isEmptyObject(obj) {
                var boolean = false
                if (obj == null) return true;
                if (Object.keys(obj) == 0) return true;

                return boolean
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
                me.value.deleteRules[viewId]= null
                me.value.deleteRules =  me.value.deleteRules.filter(n=>n)
                // me.value.viewFieldDescriptors.deleteFieldDescriptors[viewId] = null
                // me.value.viewFieldDescriptors.deleteFieldDescriptors = me.value.viewFieldDescriptors.deleteFieldDescriptors.filter(n => n)

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
                var fieldMapping = me.deleteItem.fieldMapping
                var len = fieldMapping.length - 1

                if (((fieldMapping[len].eventField && fieldMapping[len].eventField.name != '') || (fieldMapping[len].viewField && fieldMapping[len].viewField.name != ''))) {
                    var obj = {
                        viewField: null,
                        eventField: null
                    }
                    fieldMapping.push(obj)
                } else {
                    var designer = this.getComponent('event-storming-model-canvas')
                    designer.text = "TextField input Text"
                    designer.snackbar = true
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