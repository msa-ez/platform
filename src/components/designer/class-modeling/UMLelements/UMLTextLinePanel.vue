<template>
    <v-layout wrap>
        <v-navigation-drawer absolute permanent right width="500">
            <v-list class="pa-1">
                <v-list-item>
                    <v-list-item-avatar>
                        <img :src="img">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="headline">{{ titleName }}</v-list-item-title>
                    </v-list-item-content>
                    <v-btn icon @click.native="closePanel()">
                        <v-icon color="grey lighten-1">mdi-close</v-icon>
                    </v-btn>
                </v-list-item>
            </v-list>

            <v-list class="pt-0" dense flat>
                <v-divider></v-divider>
                <v-card outlined>
                    <v-card-text v-if="value._type.endsWith('Text')">
                        <v-text-field
                                v-model="value.name"
                                :error="value.name == ''"
                                :label="$t('labelText.name')"
                                autofocus
                                :disabled="isReadOnly"
                        ></v-text-field>
                    </v-card-text>

                    <v-card-text v-if="value._type.endsWith('Line')">
                        <v-label>Color</v-label>
                        <div style="display: flex;">
                            <div v-for="(color, idx) in colorList" :key="idx">
                                <v-btn v-if="value.color == color && (value.color == '#F1A746' || value.color == '#5099F7' || value.color == '#BB94BF' || value.color == '#F8D454' || value.color == '#ED73B6')"
                                        class="my-2 mx-2"
                                        fab x-small
                                        depressed
                                        :color="color"
                                        @click="changeColor(color)"
                                        :disabled="isReadOnly"
                                >
                                    <v-icon>mdi-check-bold</v-icon>
                                </v-btn>
                                <v-btn v-else-if="value.color == color && (value.color == '#000000' || value.color == '#9E9E9E' || value.color == '#5FC08B' || value.color == '#8E24AA')"
                                        class="my-2 mx-2"
                                        fab x-small
                                        depressed dark
                                        :color="color"
                                        @click="changeColor(color)"
                                        :disabled="isReadOnly"
                                >
                                    <v-icon dark>mdi-check-bold</v-icon>
                                </v-btn>
                                <v-btn v-else
                                        class="my-2 mx-2"
                                        fab x-small
                                        depressed
                                        :color="color"
                                        @click="changeColor(color)"
                                        :disabled="isReadOnly"
                                ></v-btn>
                            </div>
                        </div>
                        <div class="my-5">
                            <v-label>Size</v-label>
                            <div style="display: flex;">
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 5px;"
                                        @click="resizedEdge(5)"
                                        :disabled="isReadOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 10px;"
                                        @click="resizedEdge(10)"
                                        :disabled="isReadOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 15px;"
                                        @click="resizedEdge(15)"
                                        :disabled="isReadOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 20px;"
                                        @click="resizedEdge(20)"
                                        :disabled="isReadOnly"
                                ></v-btn>
                            </div>
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
    import UMLPropertyPanel from '../UMLPropertyPanel'

    export default {
        mixins: [UMLPropertyPanel],
        name: 'uml-text-line-panel',
        props: {
            titleName: {
                type: String,
                default: ''
            }
        },
        data: function () {
            return {
                colorList: [ '#F1A746', '#5099F7', '#BB94BF', '#F8D454', '#ED73B6', '#5FC08B', '#8E24AA', '#000000', '#9E9E9E' ],
            }
        },
        computed: {
        },
        created: function () {
            var me = this
        },
        methods:{
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
        },
    }
</script>
