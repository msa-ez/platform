<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width:400px">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="image">
                    </v-list-item-avatar>
                    <v-list-item-title class="headline">{{ titleName }}
                    </v-list-item-title>
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn icon @click.native="closePanel()">
                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text>
                        <span class="headline">Basic Info</span>
                        <v-text-field
                                label="Name"
                                v-model="value.name"
                                autofocus
                                :disabled="readOnly"
                        ></v-text-field>
                        <v-textarea
                                v-if="value.description != null"
                                outlined
                                name="input-7-4"
                                label="description"
                                v-model="value.description"
                                :disabled="readOnly"
                        ></v-textarea>
                    </v-card-text>
                </v-card>

                <v-card>
                    <v-card-text>
                        <span class="headline">Implementation</span>

                        <project-picker
                                v-model="value.dddModel"
                                :search="namePanel"
                                :readOnly="readOnly"
                        ></project-picker>
                    </v-card-text>
                </v-card>
            </v-list>
        </v-navigation-drawer>
    </v-layout>
</template>


<script>
    import ProjectPicker from "../../EventStormingList/ProjectPicker";
    import ModelPanel from "../modeling/ModelPanel";

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'business-model-panel',
        mixins: [ModelPanel],
        props: {},
        components: {
            ProjectPicker
        },
        data: function () {
            return {
                namePanel: '',
                descriptionPanel: ''
            }
        },
        computed: {
            titleName() {
                var me = this
                return me.value._type.split('.')[4]
            },
        },
        watch: {
            "value.name": _.debounce(async function (newVal) {
                var me = this
                me.changedNamePanel(me.value.name)
            }, 500),
            "value.description": _.debounce(async function (newVal) {
                var me = this
                me.changedDescriptionPanel(me.value.description)
            }, 500),
            //
            // "namePanel": _.debounce(function (newVal) {
            //     var me = this
            //     var id = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
            //     me.value.name = newVal.trim()
            //     me.canvas.$refs[`${id}`][0].namePanel = me.value.name
            // }, 500),
            //
            // "descriptionPanel": _.debounce(function (newVal) {
            //     var me = this
            //     me.value.description = newVal
            //     me.canvas.$refs[`${me.value.elementView.id}`][0].descriptionPanel = me.value.description
            // }, 500)
        },
        created: function () {
            // me.namePanel = me.value.name
            this.panelOpenAction()

        },
        beforeDestroy() {

        },
        methods:{
            setElementCanvas(){
                var me = this
                me.canvas = me.$parent.getComponent('business-model-canvas')
            },
            changedNamePanel(newVal){
                var me = this

                if (me.value.elementView)
                    me.canvas.$refs[`${me.value.elementView.id}`][0].namePanel = newVal ? newVal : ''
                else if (me.value.relationView)
                    me.canvas.$refs[`${me.value.relationView.id}`][0].namePanel = newVal ? newVal : ''
            },
            changedDescriptionPanel(newVal) {
                var me = this
                if (me.value.elementView)
                    me.canvas.$refs[`${me.value.elementView.id}`][0].descriptionPanel = newVal ? newVal : ''
                else if (me.value.relationView)
                    me.canvas.$refs[`${me.value.relationView.id}`][0].descriptionPanel = newVal ? newVal : ''
            },
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
