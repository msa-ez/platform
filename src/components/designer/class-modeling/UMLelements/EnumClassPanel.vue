<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right width="500" style="z-index: 102;">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline" style="display: flex; align-items: center;">
                            {{ titleName }}
                            <v-icon 
                                color="grey lighten-1" 
                                style="margin-left: 8px;" 
                                @click="openTraceInfoViewerForEnum()" 
                                v-if="isTraceInfoViewerUsableForEnum()"
                            >
                                mdi-text-box-search-outline
                            </v-icon>
                        </v-list-item-title>
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
                                :label="$t('labelText.name')"
                                required
                                autofocus
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-text-field
                                v-model="value.displayName"
                                label="Display Name"
                                :disabled="isReadOnly"
                        ></v-text-field>

                        <span class="headline">Items</span>
                        <v-checkbox
                                v-model="value.useKeyValue" 
                                label="Use Key & Value"
                                :disabled="isReadOnly"
                        ></v-checkbox>
                        <v-layout flat>
                            <v-col>
                                <draggable v-model="value.items"
                                        v-bind="dragOptions"
                                        @start="drag = true"
                                        @end="drag = false"
                                >
                                    <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                        <div v-for="(item, idx) in value.items" :key="'item'+idx">
                                            <v-row class="mb-6" no-gutters>
                                                <v-col v-if="value.useKeyValue" cols="5">
                                                    <div v-if="!itemEdit || value.items.indexOf(item) != itemEditIndex">
                                                        {{item.key}}
                                                    </div>
                                                    <v-text-field class="mr-2 mt-0 pt-0"
                                                            v-else-if="itemEdit && value.items.indexOf(item) == itemEditIndex "
                                                            v-model="item.key" 
                                                            :disabled="isReadOnly"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col :cols="value.useKeyValue ? '5' : '10'">
                                                    <div v-if="!itemEdit || value.items.indexOf(item) != itemEditIndex">
                                                        {{item.value}}
                                                    </div>
                                                    <v-text-field class="mr-2 mt-0 pt-0"
                                                            v-else-if="itemEdit && value.items.indexOf(item) == itemEditIndex "
                                                            v-model="item.value" 
                                                            :disabled="isReadOnly"
                                                    ></v-text-field>
                                                </v-col>
                                                
                                                <v-col cols="2" class="d-flex align-center justify-end">
                                                    <v-icon color="grey lighten-1" class="mr-2" @click="openTraceInfoViewerForItem(item)" v-if="isTraceInfoViewerUsableForItem(item)" small>
                                                        mdi-text-box-search-outline
                                                    </v-icon>
                                                    <v-btn  v-if="itemEdit && value.items.indexOf(item) == itemEditIndex "
                                                            x-small icon
                                                            class="mr-2"
                                                            @click="modifyItem(item)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>save</v-icon>
                                                    </v-btn>
                                                    <v-btn  v-else-if="!itemEdit || value.items.indexOf(item) != itemEditIndex"
                                                            x-small icon
                                                            class="mr-2"
                                                            @click="editItem(item)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>edit</v-icon>
                                                    </v-btn>
                                                    <v-btn  x-small icon
                                                            @click="deleteItem(item)"
                                                            :disabled="isReadOnly"
                                                    >
                                                        <v-icon>delete</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </transition-group>
                                </draggable>
                                
                                <v-row justify="center">
                                    <v-text-field
                                            v-if="value.useKeyValue"
                                            v-model="itemKey" 
                                            label="Key"
                                            :disabled="isReadOnly"
                                    ></v-text-field>
                                    <v-text-field 
                                            v-model="itemValue" 
                                            label="Value"
                                            v-on:keyup.enter="addItem"
                                            required
                                            :disabled="isReadOnly"
                                    ></v-text-field>
                                </v-row>

                                <v-row justify="end">
                                    <v-btn  depressed text
                                            style="color:#1E88E5;"
                                            @click="addItem"
                                            :disabled="isReadOnly"
                                    >Add Item</v-btn>
                                </v-row>
                            </v-col>
                        </v-layout>
                    </v-card-text>
                </v-card>
            </v-list>
        </v-navigation-drawer>
    </v-layout>

</template>

<script>
    import draggable from 'vuedraggable'
    import UMLPropertyPanel from '../UMLPropertyPanel'
    import { TraceInfoViewerUtil, TraceInfoController } from '../../modeling/generators/features/EventStormingModelCanvas'

    export default {
        mixins: [UMLPropertyPanel],
        name: 'uml-enum-panel',
        props: {
            titleName: {
                type: String,
                default: ''
            }
        },
        components: {
            draggable,
        },
        data: function () {
            return {
                drag: false,

                itemEdit: false,
                itemEditIndex: 0,
                itemKey: '',
                itemValue: '',
                elementTraceDescription: null,
                itemTraceDescriptionMap: null,
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
        },
        created: function () {
        },
        methods:{
            addItem() {
                var me = this
                var tmpObject
                if(me.value.useKeyValue) {
                    tmpObject = {
                        "key": me.itemKey,
                        "value": me.itemValue
                    }
                } else {
                    tmpObject = {
                        "value": me.itemValue
                    }
                }
                if (me.itemValue) {
                    me.value.items.push(tmpObject)
                }
                me.itemKey = ""
                me.itemValue = ""
            },
            editItem(val) {
                var me = this
                me.itemEditIndex = me.value.items.indexOf(val)
                me.itemEdit = true                
            },
            modifyItem(val) {
                var me = this
                var tmpObject
                tmpObject = {
                    "name": val.name,
                    "value": val.value
                }
                if(me.value.useKeyValue) {
                    tmpObject['key'] = val.key
                }

                me.value.items[me.itemEditIndex] = tmpObject
                me.itemEdit = false
            },
            deleteItem(val) {
                var me = this;
                me.value.items.forEach(function (items, idx) {
                    if (items.name == val.name && items.value == val.value) {
                        if (idx > -1) {
                            me.value.items.splice(idx, 1)
                        }
                    }
                })
            },

            
            openTraceInfoViewerForEnum() {
                try {
                    const traceInfoController = new TraceInfoController(this.value, this)
                    traceInfoController.showTraceInfoViewer()
                }
                catch(e) {
                    const msg = "Failed to open trace info viewer. You can remake the element to fix this. Reason: " + e.message;
                    console.error(msg, e);
                    alert(msg);
                    return;
                }
            },

            openTraceInfoViewerForItem(item) {
                try {
                    const originalRefs = TraceInfoViewerUtil.getOriginalRefsForEnumItem(this, this.value, item);
                    if(!originalRefs) {
                        const msg = "Failed to open trace info viewer. You can remake the property or element to fix this. Reason: Can not find originalRefs for EnumItem.";
                        console.error(msg);
                        alert(msg);
                        return;
                    }
                    TraceInfoViewerUtil.showTraceInfoViewer(this, originalRefs);
                }
                catch(e) {
                    const msg = "Failed to open trace info viewer. You can remake the property or element to fix this. Reason: " + e.message;
                    console.error(msg, e);
                    alert(msg);
                    return;
                }
            },

            isTraceInfoViewerUsableForEnum() {
                const traceInfoController = new TraceInfoController(this.value, this)
                return traceInfoController.isRefsExist();
            },

            isTraceInfoViewerUsableForItem(item) {
                const originalRefs = TraceInfoViewerUtil.getOriginalRefsForEnumItem(this, this.value, item);
                return originalRefs && originalRefs.length > 0;
            }
        },
    }
</script>
