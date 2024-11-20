<template>

    <common-panel
            v-model="value"
            :image="image"
            :is-read-only="isReadOnly"
            :width-style="widthStyle"
            :related-url="relatedUrl"
            :validation-lists="validationLists"
            :translate-obj="translateObj"
            :element-author-display="elementAuthorDisplay"
            @close="closePanel"
            @changeTranslate="changeTranslate"
    >
        <template slot="t-description-text">{{ $t('panelInfo.UIDefinitionPanel') }}</template>
        <!-- <template slot="t-generation-text"></template> -->

        <template slot="t-edit-user">
            <div
                    v-if="newEditUserImg.length > 0 && isReadOnly"
            >
                <v-chip
                        small
                        color="orange"
                        text-color="white"
                        style="font-weight:bold"
                        @click.once="forceEditPanel()"
                >
                    <v-avatar left>
                        <v-icon>mdi-lead-pencil</v-icon>
                    </v-avatar>
                    <v-row class="ma-0 pa-0">
                        <div>{{newEditUserImg[0].name}} is editing...</div>
                        <div style="font-size: 12px;">( Click to edit )</div>
                    </v-row>
                </v-chip>
            </div>
        </template>

        <template slot="element">
            <div>
                <v-card flat>
                    <v-card-text class="panel-title">UI Type</v-card-text>
                    <v-card-text>
                        <div class="d-flex">
                            <v-checkbox
                                    v-for="item in uiTypeList" 
                                    :key="item"
                                    v-model="value.uiType"
                                    :label="item"
                                    :value="item"
                                    class="mr-auto"
                            ></v-checkbox>
                        </div>
                    </v-card-text>
                </v-card>

                <v-card v-if="value.uiType === 'Chart'" flat>
                    <v-card-text>
                        <div class="d-flex">
                            <div class="panel-title mr-auto">Chart</div>
                            <v-progress-circular
                                    v-if="recommending"
                                    indeterminate
                                    color="primary"
                                    class="mr-2"
                            ></v-progress-circular>
                            <v-btn
                                    :disabled="recommending"
                                    color="primary"
                                    @click="recommend"
                            >
                                guide me
                            </v-btn>
                        </div>
                    </v-card-text>

                    <div v-if="recommendData.length > 0">
                        <v-card v-for="(item, index) in recommendData"
                                :key="index"
                                outlined 
                                class="mx-5"
                        >
                            <v-card-title class="subtitle-1">
                                {{ item.chartType }}
                            </v-card-title>
                            <v-card-text>
                                {{ item.reason }}
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="success"
                                        @click="getFieldMapping(item.chartType)"
                                >
                                    Apply
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </div>
                    
                    <v-card-text>
                        <v-select
                                v-model="value.chart.type"
                                :items="chartList"
                                label="Type"
                                outlined
                                dense
                        ></v-select>

                        <div v-if="value.chart.type !== ''">
                            <v-select
                                    v-model="value.chart.fieldMapping.category"
                                    label="Category (x-axis)"
                                    :items="readModelFieldDescriptors"
                                    item-text="name"
                                    item-value="name"
                                    multiple
                                    outlined
                                    dense
                            ></v-select>

                            <v-select
                                    v-model="value.chart.fieldMapping.data"
                                    label="Data (y-axis)"
                                    :items="readModelFieldDescriptors"
                                    item-text="name"
                                    item-value="name"
                                    multiple
                                    outlined
                                    dense
                            ></v-select>
                        </div>
                    </v-card-text>
                </v-card>

                <v-card v-else-if="value.uiType === 'Grid'" flat>
                    <v-card-text>
                        <div class="d-flex">
                            <div class="panel-title mr-auto">Grid</div>
                            <v-progress-circular
                                    v-if="recommending"
                                    indeterminate
                                    color="primary"
                                    class="mr-2"
                            ></v-progress-circular>
                            <v-btn
                                    :disabled="recommending"
                                    color="primary"
                                    @click="recommend"
                            >
                                guide me
                            </v-btn>
                        </div>
                    </v-card-text>
                    
                    <v-card-text>
                        <v-select
                                v-model="value.grid.columns"
                                label="Columns"
                                :items="readModelFieldDescriptors"
                                item-text="name"
                                item-value="name"
                                multiple
                                outlined
                                dense
                        ></v-select>
                    </v-card-text>
                </v-card>

                <v-card v-else-if="value.uiType === 'Card'" flat>
                    <v-card-text class="panel-title">
                        Card
                    </v-card-text>
                    <v-card-text>
                        <v-card>
                            <v-card-title class="d-flex">
                                <v-select
                                        v-model="value.card.title"
                                        :items="readModelFieldDescriptors"
                                        item-text="name"
                                        item-value="name"
                                        label="Title Field"
                                        dense
                                        style="max-width: 250px; margin-right: auto;"
                                ></v-select>
                                <v-checkbox
                                        v-model="useSubtitle"
                                        label="Use Sub Title"
                                        dense
                                        style="min-width: 140px;"
                                ></v-checkbox>
                            </v-card-title>
                            <v-card-subtitle v-if="useSubtitle">
                                <v-select
                                        v-model="value.card.subtitle"
                                        :items="readModelFieldDescriptors"
                                        item-text="name"
                                        item-value="name"
                                        label="Sub-Title Field"
                                        dense
                                ></v-select>
                            </v-card-subtitle>
                            <v-card-text>
                                <v-select
                                        v-model="value.card.text"
                                        :items="readModelFieldDescriptors"
                                        item-text="name"
                                        item-value="name"
                                        label="Text Field"
                                        dense
                                ></v-select>
                            </v-card-text>
                        </v-card>
                    </v-card-text>
                </v-card>
            </div>
        </template>
    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";
    import UIChartRecommendationGenerator from "../../modeling/generators/UIChartRecommendationGenerator.js"
    import UIChartFieldGenerator from "../../modeling/generators/UIChartFieldGenerator.js"
    import UIGridRecommendationGenerator from "../../modeling/generators/UIGridRecommendationGenerator.js"

    var changeCase = require('change-case');

    export default {
        mixins: [EventStormingModelPanel],
        name: 'ui-definition-panel',
        components: {
            CommonPanel
        },
        data() {
            return {
                uiTypeList: [ "Chart", "Grid", "Card" ],
                chartList: [ "bar", "line", "pie", "radar"],
                readModel: null,
                readModelFieldDescriptors: [],
                recommending: false,
                recommendData: [],
                useSubtitle: false,
            }
        },
        created () { },
        watch: {
            useSubtitle(newVal) {
                if(!newVal) {
                    this.value.card.subtitle = "" 
                }
            },
        },
        methods: {
            panelInit(){
                var me = this
                // UI
                me.getReadModelFieldDescriptors();
                if (this.value.uiType === "Card" && this.value.card.subtitle !== "") {
                    this.useSubtitle =  true
                }
                this.relatedUrl = 'https://intro-kor.msaez.io/tool/event-storming-tool/#%EB%A9%94%EB%89%B4%EB%B3%84-%EC%83%81%EC%84%B8'
                // Common
                me.$super(EventStormingModelPanel).panelInit();
            },
            getReadModelFieldDescriptors() {
                var me = this;

                Object.values(me.canvas.value.elements).forEach((element) => {
                    if (element) {
                        if (element._type.endsWith("View")) {
                            var outer = {
                               x: (element.elementView.x - element.elementView.width / 2) - 10,
                               y: (element.elementView.y - element.elementView.height / 2) - 10,
                               width: element.elementView.width + 20,
                               height: element.elementView.height + 20
                           }

                           var inner = {
                               x: me.value.elementView.x - me.value.elementView.width / 2,
                               y: me.value.elementView.y - me.value.elementView.height / 2,
                               width: me.value.elementView.width,
                               height: me.value.elementView.height
                           }

                           if (me.canvas._isAttached(outer, inner)) {
                                me.readModel = element;
                           }
                        }
                    }
                });

                Object.values(me.canvas.value.relations).forEach((relation) => {
                    if (relation) {
                        if (relation.from === me.value.elementView.id) {
                            me.readModel = relation.targetElement;
                        }
                    }
                });

                if (me.readModel && me.readModel.dataProjection == 'cqrs') {
                    me.readModelFieldDescriptors = me.readModel.fieldDescriptors;
                }
            },
            async recommend() {
                var me = this;
                await me.getReadModelFieldDescriptors();
                
                me.input = {
                    readModel: {
                        name: changeCase.camelCase(me.readModel.name),
                        fieldDescriptors: ""
                    }
                };

                me.readModelFieldDescriptors.forEach((field, index) => {
                    me.input.readModel.fieldDescriptors += "\t" + changeCase.camelCase(field.name);
                    if (index < me.readModelFieldDescriptors.length - 1) {
                        me.input.readModel.fieldDescriptors += ",\n";
                    } else {
                        me.input.readModel.fieldDescriptors += "\n";
                    }
                });
                
                var generator
                if (me.value.uiType === "Chart") {
                    generator = new UIChartRecommendationGenerator({
                        input: me.input, 
                        onModelCreated(charts) {
                            me.recommendData = charts;
                            me.recommending = false;
                        }
                    });

                    await generator.generate();

                } else if (me.value.uiType === "Grid") {
                    generator = new UIGridRecommendationGenerator({
                        input: me.input, 
                        onModelCreated(data) {
                            me.value.grid.columns = data.columns;
                            me.recommending = false;
                        }
                    });

                    await generator.generate();

                }

                me.recommending = true;

            },
            async getFieldMapping(type) {
                var me = this;
                me.input.chartType = type;

                var generator = new UIChartFieldGenerator({
                    input: me.input, 
                    onModelCreated(fieldData) {
                        me.value.chart.type = changeCase.camelCase(type);
                        me.value.chart.fieldMapping = fieldData;
                        me.recommending = false;
                    }
                });

                await generator.generate();
                me.recommendData = [];
                me.recommending = true;

            },
        }
    }
</script>
