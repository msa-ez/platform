<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right :style="panelWidthStyle">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="value.imgSrc">
                    </v-list-item-avatar>
                    <v-col>
                        <v-list-item-title class="headline">
                            {{ value._type }}
                        </v-list-item-title>
                    </v-col>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>


            <!--  해당 판넬의 내용  -->
            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text v-if="value._type != 'CJMTextElement' && value._type != 'CJMLineElement' && value._type != 'CJMEmotionElement'">
                        <div style="color: skyblue" v-if="isShowError">Notice: {{showError}}</div>
                        <v-text-field
                                v-model="value.name"
                                :disabled="isReadOnly"
                                label="Name"
                                autofocus
                        ></v-text-field>
                        <v-textarea
                                v-model="value.description"
                                label="Description"
                                :disabled="isReadOnly"
                        ></v-textarea>
                    </v-card-text>

                    <v-card-text v-if="value._type == 'CJMTextElement'">
                        <div style="color: skyblue" v-if="isShowError">Notice: {{showError}}</div>
                        <v-text-field
                                v-model="value.name"
                                :disabled="isReadOnly"
                                label="Name"
                                autofocus
                        ></v-text-field>
                    </v-card-text>

                    <v-card-text v-if="value._type == 'CJMEmotionElement'">
                        <v-row class="ma-0 pa-0" style="display: flex;">
                            Emotion Change
                        </v-row>
                        <v-row class="ma-0 pa-0">
                            <img v-for="(emotion, index) in emotionImages" :key="index" @click="changeEmotionImage(emotion)"
                                class="emotion-style ma-2"
                                :src="emotion" style="width: 50px; height: 50px;"
                            >
                        </v-row>
                    </v-card-text>
                    <v-card-text v-if="value._type == 'CJMLineElement'">
                        <v-label>Color</v-label>
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
                        <div class="my-5">
                            <v-label>Size</v-label>
                            <v-row class="ma-0 pa-0">
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
                            </v-row>
                        </div>
                        <div class="my-5">
                            <v-label>Line Style</v-label>
                            <v-row class="ma-0 pa-0">
                                <v-btn class="mx-1 my-2"
                                    depressed tile
                                    @click="changeDashStyle('')"
                                    style="width: 100px; height: 10px; border-bottom: 10px solid black;"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                    depressed tile
                                    @click="changeDashStyle('.')"
                                    style="width: 100px; height: 10px;"
                                >
                                    <svg width="100" height="10">
                                        <rect x="0" y="0" width="8" height="10" fill="black" />
                                        <rect x="14" y="0" width="8" height="10" fill="black" />
                                        <rect x="28" y="0" width="8" height="10" fill="black" />
                                        <rect x="42" y="0" width="8" height="10" fill="black" />
                                        <rect x="56" y="0" width="8" height="10" fill="black" />
                                        <rect x="70" y="0" width="8" height="10" fill="black" />
                                        <rect x="84" y="0" width="8" height="10" fill="black" />
                                    </svg>
                                </v-btn>
                                <v-btn class="mx-1 my-2"
                                    depressed tile
                                    @click="changeDashStyle('- ')"
                                    style="width: 100px; height: 10px; border-bottom: 10px dashed black;"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                    depressed tile
                                    @click="changeDashStyle('--')"
                                    style="width: 100px; height: 10px;"
                                >
                                    <svg width="100" height="10">
                                        <line x1="0" y1="5" x2="30" y2="5" stroke="black" stroke-width="10" />
                                        <line x1="35" y1="5" x2="65" y2="5" stroke="black" stroke-width="10" />
                                        <line x1="70" y1="5" x2="100" y2="5" stroke="black" stroke-width="10" />
                                    </svg>
                                </v-btn>
                            </v-row>
                        </div>
                    </v-card-text>
                </v-card>
            </v-list>

        </v-navigation-drawer>
    </v-layout>
</template>

<script>
    import ModelPanel from "../modeling/ModelPanel";
    import getParent from "../../../utils/getParent";
    import draggable from 'vuedraggable'

    var _ = require('lodash')
    export default {
        name: 'cjm-model-panel',
        mixins: [ModelPanel],
        props: {
            showError: {
                type: String,
                default: function () {
                    return null
                }
            },
            widthStyle: {
                type: String,
                default: function () {
                    return 'width: 500px;'
                }
            },
        },
        components: {
            draggable
        },
        computed: {
            isShowError() {
                return this.showError
            },
            panelWidthStyle() {
                return this.widthStyle
            },
            getDescriptionText() {
                return ''
            },
            imgSrc() {
                var me = this
                var imgSrc = ''
                me.imgSrcList.forEach(obj => {
                    if(me.value.color == obj.color) {
                        imgSrc = obj.imgSrc
                    }
                });
                return imgSrc
            },
            color() {
                return ''
            },
        },
        created: function () {
            var me = this
            if(me.value._type == 'CJMLineElement') {
                me.colorList.push('#000000')
                me.colorList.push('#9E9E9E')
            }
        },
        data: function () {
            return {
                colorList: [ '#F1A746', '#5099F7', '#BB94BF', '#F8D454', '#ED73B6', '#5FC08B', '#8E24AA' ],
                emotionImages: [
                    `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion1.svg`,
                    `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion2.svg`,
                    `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion3.svg`,
                    `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion4.svg`,
                    `${window.location.protocol + "//" + window.location.host}/static/image/symbol/emotion5.svg`,
                ],
            }
        },
        methods: {
            setElementCanvas(){
                var me = this;
                me.canvas = getParent(me.$parent, "customer-journey-map-canvas");
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
            changeEmotionImage(img) {
                var me = this;
                me.value.imgSrc = img;
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

    .emotion-style {
        cursor: pointer;
    }

    #suggested-words:hover {
        background-color: #E3F2FD;
        cursor: pointer;
    }
</style>