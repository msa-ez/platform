<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right style="width: 600px;">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <!-- <v-tabs v-if="value._instanceInfo">
                        <v-tab>
                            <v-list-item-title>Instance Info</v-list-item-title>
                        </v-tab>
                        <v-tab>
                            <v-list-item-title>Actions</v-list-item-title>
                        </v-tab>
                    </v-tabs> -->
                    <v-tabs v-model="tab">
                        <v-tab v-for="tab in tabs" :key="tab" :id="tab.toLowerCase() + _uid">
                            <v-list-item-title>{{ tab }}</v-list-item-title>
                        </v-tab>
                    </v-tabs>
                    
                    <v-btn icon @click.native="close()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-simple-table v-if="value._instanceInfo">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">Key</th>
                            <th class="text-left">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in value._instanceInfo" :key="index">
                            <td>{{ index }}</td>
                            <td>{{ value._instanceInfo[index] }}</td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <div v-if="tab == 0" style="margin-top: 10px">
                    <v-card flat>
                        <v-card-text>
                            <v-text-field
                                    v-if="value.tracingTag !== null && value.tracingTag !== undefined"
                                    v-model="value.tracingTag"
                                    label="액티비티 ID*"
                                    counter="50"
                            ></v-text-field>
                            
                            <slot name="name-panel">
                                <v-text-field
                                        v-model="value.name"
                                        label="액티비티 명"
                                        autofocus
                                ></v-text-field>
                            </slot>

                            <slot name="edit-property"></slot>
                        </v-card-text>
                    </v-card>
                </div>
                <div v-if="tab == 1">
                    <v-card flat>
                        <v-card-text>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="x"
                                            v-model="value.elementView.x"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="y"
                                            v-model="value.elementView.y"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="width"
                                            v-model="value.elementView.width"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="6" class="py-0">
                                    <v-text-field
                                            label="height"
                                            v-model="value.elementView.height"
                                            type="number"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                            <v-text-field
                                    v-for="(item, idx) in style" :key="idx"
                                    v-model="style[idx].value"
                                    :label="item.key"
                            ></v-text-field>
                        </v-card-text>
                    </v-card>
                </div>
                
                <slot name="edit-tab"></slot>
            </v-list>
        </v-navigation-drawer>
    </v-layout>
</template>

<script>

    export default {
        name: 'bpmn-common-panel',
        mixins: [],
        props: {
            value:{
                type: Object,
                default: function () {
                    return null;
                }
            },
            widthStyle: {
                type: String,
                default: function () {
                    return 'width: 500px;'
                }
            },
            image: {
                type: String,
                default: ''
            },
        },
        data: function () {
            return {
                // common
                namePanel: '',
                tabs: [ 'Properties', 'Visual' ],
                tab: 0,
                style: [],
            }
        },
        created() {
            var me = this;

            var view = me.value.elementView || me.value.relationView
            var style = []
            if (view.style) {
                var itemStyle = JSON.parse(view.style)
                if (!$.isEmptyObject(itemStyle)) {
                    for (var key in itemStyle) {
                        style.push({
                            key: key,
                            value: itemStyle[key]
                        })
                    }
                }
                me.style = style
            }
        },
        computed: {
            panelWidthStyle(){
                return this.widthStyle;
            },
            getImage(){
                if(this.image){
                    return this.image
                }
                return null;
            },
        },
        watch:{
            style: {
                deep: true,
                handler: function (newVal, oldVal) {
                    var style = {};
                    if (newVal && newVal.length) {
                        $.each(newVal, function (i, item) {
                            style[item.key] = item.value;
                        });
                    }
                    var view = this.value.elementView || this.value.relationView;
                    view.style = JSON.stringify(style);
                }
            },
        },
        methods: {
            close(){
                this.$emit('close')
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
    .panel-title {
        font-size: 25px;
        color: #757575;
    }
</style>