<template>
    <!-- width 390 -->
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right :style="panelWidthStyle">
            <!--  상단 이미지 및 선택 타이틀 이름-->
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img v-if="value._type == 'StickyTextElement'" :src="value.imgSrc">
                        <img v-else :src="imgSrc">
                    </v-list-item-avatar>
                    <v-col>
                        <v-list-item-title class="headline">{{value._type}}</v-list-item-title>
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
                    <v-card-text v-if="value._type != 'StickyTextElement'">
                        <div style="color: skyblue" v-if="isShowError">Notice: {{showError}}</div>
                        <v-text-field
                                v-model="value.name"
                                :disabled="canvas.isReadOnlyModel"
                                label="Name"
                                autofocus
                        ></v-text-field>
                        <v-textarea
                                v-model="value.description"
                                label="Description"
                                :disabled="canvas.isReadOnlyModel"
                                auto-grow
                        ></v-textarea>
                        <v-text-field
                                v-if="value._type == 'UserStory'"
                                v-model="value.as"
                                :disabled="canvas.isReadOnlyModel"
                                label="As"
                        ></v-text-field>
                        <v-text-field
                                v-if="value._type == 'UserStory'"
                                v-model="value.iWant"
                                :disabled="canvas.isReadOnlyModel"
                                label="I Want"
                        ></v-text-field>
                        <v-text-field
                                v-if="value._type == 'UserStory'"
                                v-model="value.soThat"
                                :disabled="canvas.isReadOnlyModel"
                                label="So that"
                        ></v-text-field>
                        <div class="my-5">
                            <v-label>Color</v-label>
                            <div style="display: flex;">
                                <div v-for="(color, idx) in colorList" :key="idx">
                                    <v-btn  v-if="value.color == color" 
                                            class="my-2 mx-2" 
                                            fab small 
                                            depressed 
                                            :color="color"
                                            @click="changeColor(color)"
                                    >
                                        <v-icon dark>mdi-check</v-icon>
                                    </v-btn>
                                    <v-btn  v-else 
                                            class="my-2 mx-2" 
                                            fab small 
                                            depressed 
                                            :color="color"
                                            @click="changeColor(color)"
                                    ></v-btn>
                                </div>
                            </div>
                        </div>
                    </v-card-text>

                    <v-card-text v-if="value._type == 'StickyTextElement'">
                        <div style="color: skyblue" v-if="isShowError">Notice: {{showError}}</div>
                        <v-text-field
                                v-model="value.name"
                                :disabled="canvas.isReadOnlyModel"
                                label="Name"
                                autofocus
                        ></v-text-field>
                    </v-card-text>

                    <v-card-text v-if="value._type == 'UserStoryMapLineElement'">
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
                        </div>
                        <div class="my-5">
                            <v-label>Line Style</v-label>
                            <div style="display: flex;">
                                <v-btn  class="mx-1 my-2"
                                        depressed color="primary"
                                        @click="changeDashStyle('')"
                                >Solid</v-btn>
                                <v-btn  class="mx-1 my-2" 
                                        depressed color="primary"
                                        @click="changeDashStyle('.')"
                                >Dotted</v-btn>
                                <v-btn  class="mx-1 my-2" 
                                        depressed color="primary"
                                        @click="changeDashStyle('- ')"
                                >Dashed</v-btn>
                                <v-btn  class="mx-1 my-2" 
                                        depressed color="primary"
                                        @click="changeDashStyle('--')"
                                >Long Dashed</v-btn>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-list>

        </v-navigation-drawer>
    </v-layout>
</template>

<script>
    import ModelPanel from "../modeling/ModelPanel";

    var _ = require('lodash')
    import draggable from 'vuedraggable'
    
    export default {
        name: 'user-story-map-panel',
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
                var me = this
                return 'User Story Map'
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
        beforeDestroy() {

        },
        created: function () {
            var me = this
            if(me.value._type == 'UserStoryMapLineElement') {
                me.colorList.push('#000000')
                me.colorList.push('#9E9E9E')
            }
        },
        data: function () {
            return {
                colorList: [ '#F1A746', '#5099F7', '#BB94BF', '#F8D454', '#ED73B6', '#5FC08B', '#8E24AA' ],
                imgSrcList: [ 
                    {
                        color: '#F1A746',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/event.png`
                    },
                    {
                        color: '#5099F7',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/command.png`
                    },
                    {
                        color: '#BB94BF',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/policy.png`
                    },
                    {
                        color: '#ED73B6',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/external.png`
                    },
                    {
                        color: '#5FC08B',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/view.png`
                    },
                    {
                        color: '#8E24AA',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/issue.png`
                    },
                    {
                        color: '#F8D454',
                        imgSrc: `${window.location.protocol + "//" + window.location.host}/static/image/event/actor.png`
                    },
                ],

            }
        },
        watch: {
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = me.$parent.getComponent('user-story-map-canvas')
            },
            changeName: function () {
                this.editingTransformer.name = this.editingTransformer._type;
            },
            showProperty: function (transformer) {
                this.editingTransformer = transformer;
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

    #suggested-words:hover {
        background-color: #E3F2FD;
        cursor: pointer;
    }
</style>