<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right width="500">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline">{{ value.relationType }}</v-list-item-title>
                    </v-list-item-content>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat >
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text>
                        <v-text-field 
                                v-model="value.name" 
                                label="Relation Name"
                                required
                                autofocus
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-text-field 
                                v-model="value.displayName" 
                                label="Display Name"
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-select 
                                v-if="!value.relationType.includes('Realization')"
                                v-model="value.relationType"
                                :items="relationTypes"
                                item-text="name"
                                item-value="type"
                                label="Relation Type"
                                :disabled="isReadOnly"
                        ></v-select>

                        <div v-if="value.relationType.includes('Aggregation') || value.relationType.includes('Composition') || value.relationType.includes('Association')">
                            <v-select 
                                    v-model="value.sourceMultiplicity"
                                    :items="multiplicityList"
                                    label="Source Multiplicity"
                                    :disabled="isReadOnly"
                            ></v-select>
                            <v-select 
                                    v-model="value.targetMultiplicity"
                                    :items="multiplicityList"
                                    label="Target Multiplicity"
                                    :disabled="isReadOnly"
                            ></v-select>
                        </div>

                        <v-text-field 
                                v-model="value.fromLabel"
                                label="Source Role"
                                :disabled="isReadOnly"
                        ></v-text-field>
                        <v-text-field 
                                v-model="value.toLabel"
                                label="Target Role"
                                :disabled="isReadOnly"
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-list>
        </v-navigation-drawer>
    </v-layout>

</template>

<script>
    import UMLPropertyPanel from '../UMLPropertyPanel'

    var pluralize = require('pluralize');

    export default {
        mixins: [UMLPropertyPanel],
        name: 'uml-relation-panel',
        props: {
            titleName: {
                type: String,
                default: ''
            }
        },
        data: function () {
            return {
                relationTypes: [
                    {
                        name: 'Association',
                        type: 'Association'
                    },
                    {
                        name: 'Aggregation',
                        type: 'Aggregation'
                    },
                    {
                        name: 'Generalization',
                        type: 'Generalization'
                    },
                    {
                        name: 'Composition',
                        type: 'Composition'
                    },
                ],
                multiplicityList: [ '1', '1..n', '0..n', '0..1' ],
                isEdited: false,
            }
        },
        computed: {
        },
        watch: {
            "value.name": {
                deep: true,
                handler(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        this.isEdited = true;
                    }
                }
            },
            "value.relationType": {
                deep: true,
                handler(newVal) {
                    var me = this;
                    if (me.value.name !== '') {
                        if(newVal.includes('Aggregation') || newVal.includes('Composition')) {
                            me.value.name = pluralize(me.value.name);
                        } else {
                            me.value.name = pluralize.singular(me.value.name);
                        }
                        me.isEdited = true;
                    }
                }
            },
            "value.targetMultiplicity": {
                deep: true,
                handler(newVal) {
                    var me = this;
                    if (newVal === '1..n' || newVal === '0..n') {
                        me.value.name = pluralize(me.value.name);
                    } else {
                        me.value.name = pluralize.singular(me.value.name);
                    }
                    me.isEdited = true;
                }
            }
        },
        created: function () {
        },
        beforeDestroy() {
            var me = this
            if (me.canvas.value.relations[me.value.id] && me.isEdited) {
                const obj = {
                    action: "updateRelation",
                    relation: me.value
                }
                me.$EventBus.$emit(`${me.value.from}`, obj)
            }
        },
        methods:{
        },
    }
</script>
