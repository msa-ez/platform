<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="canvas-panel" style="left:0; margin-top:-76px; height:100vh;" :key="componentKey">
        <v-layout right>
            <opengraph ref="opengraph"
                       :width=100000 :height=100000
                       :sliderLocationScale=sliderLocationScale
                       focus-canvas-on-select wheelScalable :labelEditable="true"
                       :dragPageMovable="dragPageMovable" :enableContextmenu="false" :enableRootContextmenu="false"
                       :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                       :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" :enableHotkeyCtrlD="false"
                       :enableHotkeyCtrlG="false" :slider="true" :movable="!readOnly" :resizable="!readOnly"
                       :selectable="true"
                       :connectable="!readOnly" v-if="value"
                       :autoSliderUpdate="true"
                       :imageBase="imageBase"
                       v-on:canvasReady="bindEvents"
            >

                <div v-if="value.elements &&  typeof value.elements == 'object'"
                     v-for="elementId in Object.keys(value.elements)">
                    <component
                            v-if="elementId && value.elements[elementId]"
                            :is="getComponentByClassName(value.elements[elementId]._type)"
                            :value.sync="value.elements[elementId]"
                            :ref="elementId"
                    ></component>
                </div>

                <div v-if="value.relations && typeof value.relations == 'object'"
                     v-for="relationId in Object.keys(value.relations)">
                    <component
                            v-if="relationId && value.relations[relationId]"
                            :is="getComponentByClassName(value.relations[relationId]._type)"
                            :value.sync="value.relations[relationId]"
                            :ref="relationId"
                    ></component>
                </div>
            </opengraph>

            <v-row align="start" justify="end"
                class="replay-menu-btn"
            >
                <v-text-field
                    class="replay-project-name"
                    disabled
                    v-model="projectName"
                    label="Project Name"
                >
                </v-text-field>
                <v-btn
                        v-if="showVersionBtn"
                        class="gs-model-z-index-1 replay-create-version-btn"
                        text
                        style="margin-top: 10px;"
                        color="primary"
                        @click="showDialog()"
                >
                    <v-icon>mdi-content-save</v-icon>
                    <div class="replay-create-version">Create Version</div>
                </v-btn>
            </v-row>


            <v-footer absolute >
                <div v-if="loading" style="width: 100%; height: 30px;">
                    <v-progress-linear
                            indeterminate
                            color="primary"
                    ></v-progress-linear>
                </div>
                <div v-else style="width: 100%;height: 40px;">


                    <v-slider
                        v-model="slider.current"
                        :min="slider.min"
                        :max="slider.max"
                        thumb-label="always"
                        step="1"
                    >
                        <template v-slot:thumb-label="{ value }">
                            <div style="white-space: nowrap; color: black;"
                                 @mouseover="onOverSliderQueue"
                                 @mouseleave="onOverSliderQueue"
                            >
                              {{ sliderCurrentDate }}
                            </div>
                        </template>

                        <template v-slot:append>
                            <!-- <div style="background-color:red;" class="replay-version-icon">
                                <Icon
                                    icon="mdi:flag"
                                    width="20px" height="20px"
                                    style="background-color:transparent;
                                    position:absolute;
                                    left:5px;
                                    color:#ffa726;
                                    margin-top:-5px;
                                    z-index:3;"
                                />
                            </div> -->
                            <div class="replay-version-icon-tool-tip"
                                style="background-color: black;
                                opacity: 0.5;
                                border-radius: 5px;
                                text-align: center;
                                z-index:3;
                                position:absolute;
                                left:5px;
                                bottom:50px;"
                            >
                                <v-slide-item
                                    v-for="title in detail.title"
                                    :key="title"
                                    :value="title"
                                >
                                    <div
                                        :input-value="active" 
                                        style="padding:10px;
                                        color:white;"
                                    >{{ title }}
                                    </div>
                                </v-slide-item>
                            </div>
                        
                            <!-- Version -->
                            <div v-for="versionItem in filteredVersionLists">
                                <!-- <div :class="versionItem.isVersion ? `v-slider__thumb orange lighten-1` : `v-slider__thumb yellow accent-4`" -->
                                <div 
                                     :style="markStyle(versionItem)"
                                     @click="onClickMark(versionItem, 'version')"
                                     @mouseover="onOverSliderMarkLists($event, versionItem, 'version')"
                                     @mouseleave="onOverSliderMarkLists($event, versionItem, 'version')"
                                >
                                <Icons
                                    :icon="'flag'" :size="20" :color="'orange'"
                                    style="background-color:transparent; position: absolute; bottom: 8px;"/>
                                </div>
                            </div>

                            <!-- Snapshot -->
                            <div v-for="snaphot in filteredSnapshotLists">
                                <div class="v-slider__thumb green lighten-1"
                                     :style="markStyle(snaphot)"
                                     @click="onClickMark(snaphot, 'snapshot')"
                                     @mouseover="onOverSliderMarkLists($event,snaphot, 'snapshot')"
                                     @mouseleave="onOverSliderMarkLists($event,snaphot, 'snapshot')"
                                ></div>
                            </div>


                        </template>
                    </v-slider>
                </div>
            </v-footer>

            <model-storage-dialog
                    :condition.sync="condition"
                    :showDialog="dialog"
                    @backup="addVersion"
                    @close="closeDialog()"
            >
            </model-storage-dialog>
        </v-layout>

        <v-layout>
            <div style="position: absolute; right: 0;bottom: 8%; width: 20%; height: 30%;" v-if="detail.show">
                <v-card v-if="detail.isMark" style="width: 100%; height: 100%;">
                    <v-card-title style="line-height: 1rem; padding: 10px;">
                        <v-card-text v-if="detail.isSnapshot" style="padding: 0px; font-weight: bold;">
                            SNAPSHOT
                        </v-card-text>
                        <v-card-text v-else-if="detail.isVersion" style="padding: 0px; font-weight: bold;">
                            VERSION
                        </v-card-text>
                    
                        <div class="mark-title">Name:&nbsp;</div>

                        <v-slide-group
                                v-model="copyItem"
                                show-arrows
                        >
                            <v-slide-item
                                    v-for="title in detail.title"
                                    :key="title"
                                    :value="title"
                                    v-slot="{ active, toggle }"
                            >
                                <v-btn
                                        class="mx-2"
                                        :input-value="active"
                                        active-class="primary white--text"
                                        depressed
                                        rounded
                                        @click="toggle"
                                >
                                    {{ title }}
                                </v-btn>
                            </v-slide-item>
                        </v-slide-group>
                        <div style="position: absolute; top: 0; right: 0;">
                            <v-btn icon small @click="copyURL()">
                                <v-icon small color="black"> mdi-content-copy</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>
                    <v-card-text>
                        <v-row style="padding: 6px;">
                            <div class="mark-title">Date:&nbsp;</div>{{detail.date}}
                        </v-row>
                    </v-card-text>
                    <v-card-text style="height: 75%;  padding: 0px;">
                        <div>{{detail.subTitle}}</div>
                        <img
                                v-if="detail.image"
                                contain
                                lazy-src="https://picsum.photos/id/11/10/6"
                                max-height="170"
                                max-width="303"
                                width="100%"
                                height="100%"
                                v-bind:src="`${detail.image}`"
                        >
                        <div v-if="detail.contents">
                            {{detail.contents}}
                        </div>
                    </v-card-text>
                </v-card>
                <v-card v-else style="width: 100%; height: 100%;">
                    <v-card-title style="line-height: 1rem; padding: 10px;">
                        <div class="mark-title">STATUS:&nbsp;</div> {{detail.title}}
                    </v-card-title>
                    <v-card-text>
                        <v-row style="padding: 6px;">
                            <div class="mark-title">Date:&nbsp;</div>{{detail.date}}
                        </v-row>
                    </v-card-text>
                    <v-card-text style="height: 60%;">
                        <v-row>
                            <v-avatar size="36">
                                <div  v-if="detail.image" style="width: 100%; height: 100%;">
                                    <img :src="detail.image">
                                </div>
                                <div v-else style="width: 100%; height: 100%;">
                                    <v-icon>
                                        mdi-account
                                    </v-icon>
                                </div>
                            </v-avatar>
                            <v-col>
                                <div> {{detail.subTitle}} </div>
                                <div> {{detail.contents}} </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </div>
        </v-layout>
        <!--   model IMAGE     -->
        <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
    </div>
</template>

<script>
    import EventStormingModeling from "./index";
    import ModelReplay from "../modeling/ModelReplay";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    // import SeparatePanelComponents from "../../SeparatePanelComponents";
    // import CodeGenerator from "../modeling/CodeGenerator";

    var jp = require('jsonpath');

    export default {
        name: 'event-storming-model-replay',
        props: {},
        mixins: [ModelReplay],
        components:{
           'model-storage-dialog': ModelStorageDialog,
            // 'separate-panel-components':SeparatePanelComponents,
            // CodeGenerator
        },
        data() {
            return {
                tickLabels: {
                    0: 'Figs',
                    1: 'Lemon',
                    2: 'Pear',
                    3: 'Apple',
                },
                svalue: 25,
                copyItem: null,
                replayFlagIcontoolTip: false,
                elementTypes: [
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'domain-event-definition',
                        'label': 'Event',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/event.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'command-definition',
                        'label': 'Command',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/command.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'policy-definition',
                        'label': 'Policy',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/policy.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'aggregate-definition',
                        'label': 'Aggregate',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'external-definition',
                        'label': 'External',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/external.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'view-definition',
                        'label': 'View',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/view.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                        'component': 'bounded-context-definition',
                        'label': 'Bounded Context',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/bounded2.png`

                    },
                    {
                        'icon': 'bpmn-icon-start-actor-none',//'OG.shape.essencia.Alpha',
                        'component': 'actor-definition',
                        'label': 'Actor',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/actor.png`
                    },
                ],
            }
        },
        created: function () {
            Vue.use(EventStormingModeling);
            this.canvasType = 'es';
            this.loginUser();
        },
        mounted() {

        },
        computed: {},
        watch: {},
        methods: {
            copyURL(){
                var me = this
                if( !me.copyItem ) me.copyItem = me.detail.item.key;

                let url = `${window.location.origin}/#/storming/${me.modelProjectId}:${me.copyItem}`
                if(me.detail.isSnapshot) {
                    url = window.location.href
                }
                
                const t = document.createElement("textarea");
                document.body.appendChild(t);
                t.value = url;
                t.select();
                document.execCommand('copy');
                // remove
                document.body.removeChild(t);
            },
            getComponentByClassName: function (className) {
                var componentByClassName;
                $.each(window.Vue.eventStormingModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
            onMoveRelationById(id, newValueObj, isHexagonal) {
                var me = this
                var modifiedView = isHexagonal ? me.value.relations[id].hexagonalView : me.value.relations[id].relationView

                if (me.value && me.value.relations && me.value.relations[id]) {
                    modifiedView.value = newValueObj
                }
            },
            onMoveElementById(id, newValueStr, isHexagonal) {
                var me = this
                if (me.value && me.value.elements && me.value.elements[id]) {
                    var newValueObj = JSON.parse(newValueStr)
                    var modifiedView = isHexagonal ? me.value.elements[id].hexagonalView : me.value.elements[id].elementView

                    modifiedView.x = newValueObj.x
                    modifiedView.y = newValueObj.y
                    modifiedView.width = newValueObj.width
                    modifiedView.height = newValueObj.height
                }
            },
        }
    }
</script>


<style scoped lang="css" rel="stylesheet/css">
    .canvas-panel {
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        overflow: hidden;
    }

    .replay-version-icon-tool-tip {
        display:none;
    }

    .replay-version-icon:hover ~ .replay-version-icon-tool-tip {
        display:block;
    }
    .mark-title {
        color: rgba(0,0,0,.6);
        font-size: .875rem;
        font-weight: 400;
        line-height: 1.375rem;
        letter-spacing: .0071428571em;
    }

    .v-slide-group.v-item-group .v-slide-group__prev{
        min-width: 22px;
    }
    .v-slide-group.v-item-group .v-slide-group__next{
        min-width: 22px;
    }
    .v-slide-group__prev{
        min-width: 22px !important;
    }
    .v-slide-group__next{
        min-width: 22px !important;
    }

    .replay-create-version {
        display:block;
    }

    .replay-menu-btn {
        position: absolute;
        max-width: 50%;
        left: 50%;
        transform: translate(-50%, 0%);
        z-index:1;
        margin-top: 10px;
    }

    @media only screen and (max-width:920px) {
        .replay-create-version {
            display:none;
        }
    }

    @media only screen and (max-width:790px) {
        .replay-menu-btn {
            position: absolute;
            max-width: 100%;
            right: 155px;
            transform: none;
            z-index:1;
            margin-top: 10px;
        }
        .replay-create-version-btn {
            position:absolute;
        }

        .replay-project-name {
            max-width:150px !important;
            margin-right:50px;
        }
    }
</style>

