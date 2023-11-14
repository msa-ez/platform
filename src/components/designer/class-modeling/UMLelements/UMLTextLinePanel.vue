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
                                v-model="namePanel"
                                :error="namePanel == ''"
                                label="Name"
                                autofocus
                                :disabled="readOnly"
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
                                        :disabled="readOnly"
                                >
                                    <v-icon>mdi-check-bold</v-icon>
                                </v-btn>
                                <v-btn v-else-if="value.color == color && (value.color == '#000000' || value.color == '#9E9E9E' || value.color == '#5FC08B' || value.color == '#8E24AA')"
                                        class="my-2 mx-2"
                                        fab x-small
                                        depressed dark
                                        :color="color"
                                        @click="changeColor(color)"
                                        :disabled="readOnly"
                                >
                                    <v-icon dark>mdi-check-bold</v-icon>
                                </v-btn>
                                <v-btn v-else
                                        class="my-2 mx-2"
                                        fab x-small
                                        depressed
                                        :color="color"
                                        @click="changeColor(color)"
                                        :disabled="readOnly"
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
                                        :disabled="readOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 10px;"
                                        @click="resizedEdge(10)"
                                        :disabled="readOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 15px;"
                                        @click="resizedEdge(15)"
                                        :disabled="readOnly"
                                ></v-btn>
                                <v-btn class="mx-1 my-2"
                                        depressed tile
                                        color="#212121"
                                        style="width: 100px; height: 20px;"
                                        @click="resizedEdge(20)"
                                        :disabled="readOnly"
                                ></v-btn>
                            </div>
                        </div>
                        <div class="my-5">
                            <v-label>Style</v-label>
                            <div style="display: flex;">
                                <v-btn  class="mx-1 my-2"
                                        depressed text
                                        style="color:black;"
                                        @click="changeDashStyle('')"
                                        :disabled="readOnly"
                                >Solid</v-btn>
                                <v-btn  class="mx-1 my-2"
                                        depressed text
                                        style="color:black;"
                                        @click="changeDashStyle('.')"
                                        :disabled="readOnly"
                                >Dotted</v-btn>
                                <v-btn  class="mx-1 my-2"
                                        depressed text
                                        style="color:black;"
                                        @click="changeDashStyle('- ')"
                                        :disabled="readOnly"
                                >Dashed</v-btn>
                                <v-btn  class="mx-1 my-2"
                                        depressed text
                                        style="color:black;"
                                        @click="changeDashStyle('--')"
                                        :disabled="readOnly"
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
