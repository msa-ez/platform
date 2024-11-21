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
        <template slot="t-img">
            <v-list-item-avatar>
                <img :src="value.imgSrc">
            </v-list-item-avatar>
        </template>

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


        <template slot="middle">
            <div>
                <v-divider></v-divider>
            </div>
        </template>

        <template slot="element">
            <v-card flat :disabled="isReadOnly">
                <v-card-title>Color</v-card-title>
                <v-card-text>
                    <div style="display: flex;">
                        <div v-for="(color, idx) in colorList" :key="idx">
                            <v-btn  v-if="value.color == color && (value.color == '#F1A746' || value.color == '#5099F7' || value.color == '#BB94BF' || value.color == '#F8D454' || value.color == '#ED73B6')"
                                    class="my-2 mx-2"
                                    fab x-small
                                    depressed
                                    :color="color"
                                    @click="changeColor(color)"
                            >
                                <v-icon>mdi-check-bold</v-icon>
                            </v-btn>
                            <v-btn  v-else-if="value.color == color && (value.color == '#000000' || value.color == '#9E9E9E' || value.color == '#5FC08B' || value.color == '#8E24AA')"
                                    class="my-2 mx-2"
                                    fab x-small
                                    depressed dark
                                    :color="color"
                                    @click="changeColor(color)"
                            >
                                <v-icon dark>mdi-check-bold</v-icon>
                            </v-btn>
                            <v-btn  v-else
                                    class="my-2 mx-2"
                                    fab x-small
                                    depressed
                                    :color="color"
                                    @click="changeColor(color)"
                            ></v-btn>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <v-card flat :disabled="isReadOnly">
                <v-card-title>Weight</v-card-title>
                <v-card-text>
                    <div style="display: flex;">
                        <v-btn  class="mx-1 my-2"
                                depressed tile
                                color="#212121"
                                style="width: 100px; height: 5px;"
                                @click="resizedEdge(5)"
                        ></v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed tile
                                color="#212121"
                                style="width: 100px; height: 10px;"
                                @click="resizedEdge(10)"
                        ></v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed tile
                                color="#212121"
                                style="width: 100px; height: 15px;"
                                @click="resizedEdge(15)"
                        ></v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed tile
                                color="#212121"
                                style="width: 100px; height: 20px;"
                                @click="resizedEdge(20)"
                        ></v-btn>
                    </div>
                </v-card-text>
            </v-card>

            <v-card flat :disabled="isReadOnly">
                <v-card-title>Style</v-card-title>
                <v-card-text>
                    <div style="display: flex;">
                        <v-btn  class="mx-1 my-2"
                                depressed text
                                style="color:black;"
                                @click="changeDashStyle('')"
                        >Solid</v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed text
                                style="color:black;"
                                @click="changeDashStyle('.')"
                        >Dotted</v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed text
                                style="color:black;"
                                @click="changeDashStyle('- ')"
                        >Dashed</v-btn>
                        <v-btn  class="mx-1 my-2"
                                depressed text
                                style="color:black;"
                                @click="changeDashStyle('--')"
                        >Long Dashed</v-btn>
                    </div>
                </v-card-text>
            </v-card>

        </template>

    </common-panel>
</template>


<script>
    import CommonPanel from "./CommonPanel";
    import EventStormingModelPanel from "../EventStormingModelPanel";

    export default {
        mixins: [EventStormingModelPanel],
        name: 'line-panel',
        components:{CommonPanel},
        data() {
            return {
                colorList: [ '#F1A746', '#5099F7', '#BB94BF', '#F8D454', '#ED73B6', '#5FC08B', '#8E24AA', '#000000', '#9E9E9E' ],
            }
        },
        computed: {
            titleName() {
                return 'Line'
            },
        },
        created: function () { },
        watch: {},
        methods: {
            panelInit(base){
                var me = this
                // Element

                // Common
                me.$super(EventStormingModelPanel).panelInit()
            },
            changeColor(color) {
                var me = this;
                me.value.color = color
            },
            resizedEdge(val) {
                var me = this;
                me.value.size = val
            },
            changeDashStyle(val) {
                var me = this;
                me.value.dashStyle = val
            },

        }
    }
</script>
