<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="canvas-panel" style="left:0">

        <v-overlay v-if="showOverlay">
            <v-col align="center">
                <div>{{ showOverlay }}</div>
                <v-progress-circular indeterminate size="64">
                    <v-btn text @click="closeOverlay()"></v-btn>
                </v-progress-circular>
            </v-col>
        </v-overlay>

        <v-alert
                dense
                elevation="6"
                colored-border
                :value="alertInfo.show"
                :border="alertInfo.border"
                :type="alertInfo.type"
                :max-width="alertInfo.maxWidth"
                :color="alertInfo.color"
                width="100%"
                style="align-self: center; position: absolute; z-index:999; margin-left: 35%;"
        >
            <div style="color: black;"> {{alertInfo.text}}</div>
            <a v-if="alertInfo.link" target="_blank" :href="alertInfo.link">Github Persenal Access Token 발행 방법</a>
            <div style="text-align: right;">
                <v-btn v-if="alertInfo.submit" @click="alertSubmit(alertInfo.fnNum)" small color="green"
                       style="margin-right: 5px;" dark>
                    {{alertInfo.submit}}
                </v-btn>
                <v-btn @click="alertClose(alertInfo.fnNum)" small text>{{$t('word.close')}}</v-btn>
            </div>
        </v-alert>


        <v-layout right>
            <opengraph ref="opengraph"
                    :width=100000 :height=100000
                    :sliderLocationScale=sliderLocationScale
                    focus-canvas-on-select wheelScalable 
                    :labelEditable="true"
                    :dragPageMovable="dragPageMovable" 
                    :enableContextmenu="false" 
                    :enableRootContextmenu="false"
                    :enableHotkeyCtrlC="false" 
                    :enableHotkeyCtrlV="false"
                    :enableHotkeyDelete="false" 
                    :enableHotkeyCtrlZ="false" 
                    :enableHotkeyCtrlD="false"
                    :enableHotkeyCtrlG="false" 
                    :slider="true"
                    :movable="!getReadOnly"
                    :resizable="!getReadOnly"
                    :selectable="true"
                    :connectable="!getReadOnly"
                    v-if="value"
                    :autoSliderUpdate="true"
                    :imageBase="imageBase"
                    v-on:update:sliderLocationScale="sliderLocationScale = $event"
                    v-on:connectShape="onConnectShape"
                    v-on:canvasReady="bindEvents"
        >
                <!--  Model -->
                <div v-if="value.elements && typeof value.elements == 'object'" :key="elementId"
                        v-for="elementId in Object.keys(value.elements)">
                    <component
                            v-if="elementId && value.elements[elementId]"
                            :is="getComponentByClassName(value.elements[elementId]._type)"
                            :value.sync="value.elements[elementId]"
                            :ref="elementId"
                    ></component>
                </div>

                <div v-if=" value.relations && typeof value.relations == 'object'" :key="relationId"
                        v-for="relationId in Object.keys(value.relations)">
                    <component
                            v-if="relationId && value.relations[relationId]"
                            :is="getComponentByClassName(value.relations[relationId]._type)"
                            :value.sync="value.relations[relationId]"
                            :ref="relationId"
                    ></component>
                </div>
            </opengraph>


            <v-layout row>
                <v-flex v-if="!getReadOnly">
                    <v-row class="gs-modeling-undo-redo" style="margin-top:24px;">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn class="gs-model-z-index-2 gs-undo-opacity-hover" :disabled="checkUndo" text small right @click.native="undo()"
                                       v-on="on">
                                    <v-icon medium>mdi-undo</v-icon>
                                </v-btn>
                            </template>
                            <span>Undo</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn class="gs-model-z-index-2 gs-undo-opacity-hover" :disabled="checkRedo" text small right @click.native="redo()"
                                       v-on="on">
                                    <v-icon medium>mdi-redo</v-icon>
                                </v-btn>
                            </template>
                            <span>Redo</span>
                        </v-tooltip>
                    </v-row>
                </v-flex>

                <div class="sticky-mobile-btn">
                    <v-speed-dial
                        v-model="fab"
                        style="position:absolute; bottom:50px; right:50px;"
                    >
                        <template v-slot:activator>
                            <v-btn
                                    v-model="fab"
                                    color="blue darken-2"
                                    dark
                                    fab
                                    small
                            >
                                <v-icon v-if="fab">
                                    mdi-playlist-remove
                                </v-icon>
                                <v-icon v-else>
                                    mdi-playlist-check
                                </v-icon>
                            </v-btn>
                        </template>
                        <v-row id="mobile-action-btn" justify="end" align="start"
                                style="margin-right: 10px;">
                                <slot name="saveButton">
                                <v-menu
                                        open-on-hover
                                        offset-y
                                >
                                    <template v-slot:activator="{ on }">

                                        <v-btn
                                                text
                                                v-if="getReadOnly"
                                                :color="joinRequestedText.show ? 'primary' :'success'"
                                                dark
                                                @click="requestInviteUser()"
                                                small
                                        >
                                            <div v-if="joinRequestedText.show">
                                                <v-icon>{{icon.join}}</v-icon>
                                            </div>
                                            {{ joinRequestedText.text }}
                                        </v-btn>

                                        <v-btn
                                                text
                                                v-if="getReadOnly"
                                                dark
                                                @click="saveComposition('fork')"
                                                small
                                        >
                                            <v-icon>{{icon.fork}}</v-icon>
                                            FORK
                                        </v-btn>
                                        <v-btn
                                                text
                                                v-else
                                                color="primary"
                                                dark
                                                @click="saveComposition('save')"
                                                v-on="on"
                                                small
                                        >
                                            <v-icon>{{icon.save}}</v-icon>
                                            SAVE
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                                v-for="(item, index) in saveItems"
                                                :key="index"
                                                @click="functionSelect(item.title,index)"
                                        >
                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </slot>


                            <slot name="shareButton">
                                <v-menu
                                        v-if="isOwnModel && isServerModel && !getReadOnly "
                                        class="pa-2"
                                        offset-y
                                        open-on-hover
                                >
                                    <template v-slot:activator="{ on }">
                                        <div>
                                            <v-btn
                                                    text
                                                    dark
                                                    v-on="on"
                                                    @click="openInviteUsers()"
                                                    small
                                            >
                                                <v-icon>{{icon.share}}</v-icon>
                                                SHARE
                                                <v-avatar v-if="requestCount" size="25" color="red"
                                                            style="margin-left: 2px;"> {{ requestCount
                                                    }}
                                                </v-avatar>
                                            </v-btn>
                                        </div>
                                    </template>
                                    <v-list>
                                        <v-list-item
                                                v-for="(item, index) in shareItems"
                                                :key="index"
                                                @click="functionSelect(item.title,index)"
                                        >
                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </slot>
                            <slot name="versionButton">
                                <v-menu
                                        text
                                        v-if="isServerModel"
                                        class="pa-2"
                                        open-on-hover
                                        offset-y>
                                    <template v-slot:activator="{ on }">
                                        <div>
                                            <v-btn
                                                    dark
                                                    @click='showReplay()'
                                                    small
                                                    :disabled="disableBtn"
                                                    text
                                            >
                                                <v-icon>mdi-restart</v-icon>
                                                Replay
                                            </v-btn>
                                        </div>
                                    </template>
                                </v-menu>
                            </slot>
                        </v-row>
                    </v-speed-dial>
                </div>


                <slot name="top">
                    <v-flex style="justify:end; align:start;">
                        <v-row class="gs-model-z-index-1" 
                                style="position: absolute;
                                    left: 50%;
                                    transform: translate(-50%, 0%);
                                    margin-top:0px;
                                "
                        >
                            <v-row justify="end"
                                    align="start" 
                                    style="margin-right: 5px; 
                                        margin-top:15px; 
                                        width:300px;
                                    "
                            >
                                <slot name="projectName">
                                    <v-col id="project-name"
                                            align="start" 
                                            justify="end" 
                                            cols="10" 
                                            md="10" 
                                            sm="10"
                                    >
                                        <v-text-field
                                                v-model="projectName"
                                                :disabled="getReadOnly || (fullPath && fullPath.includes('replay'))"
                                                :color="projectNameColor"
                                                :error-messages="projectNameHint"
                                                label="Project Name" 
                                                @click.native="unselectedAll"
                                        ></v-text-field>
                                    </v-col>
                                </slot>
                            </v-row>
                            <div class="sticky-btn">
                                <v-row id="action-btn" justify="end" align="start" style="margin-right: 15px; margin-top: 15px;">
                                    <slot name="versionButton">
                                        <v-menu
                                                v-if="isServerModel"
                                                class="pa-2"
                                                open-on-hover
                                                offset-y
                                                left
                                        >
                                            <template v-slot:activator="{ on }">
                                                <div>
                                                    <v-btn
                                                            text
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            @click='showReplay()'
                                                            :disabled="disableBtn"
                                                    >
                                                        <v-icon>mdi-restart</v-icon>
                                                        Replay
                                                    </v-btn>
                                                </div>
                                            </template>
                                        </v-menu>
                                    </slot>

                                    <slot name="saveButton">
                                        <v-menu
                                                class="pa-2"
                                                open-on-hover
                                                offset-y
                                                left
                                        >
                                            <template v-slot:activator="{ on }">
                                                <div v-if="getReadOnly">
                                                    <v-btn
                                                            text
                                                            color="primary"
                                                            :disabled="disableBtn"
                                                            @click="saveComposition('fork')"
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                    >
                                                        <v-icon>{{icon.fork}}</v-icon>
                                                        FORK
                                                    </v-btn>
                                                    <v-btn
                                                            :color="joinRequestedText.show ? 'primary' :'success'"
                                                            :disabled="disableBtn"
                                                            @click="requestInviteUser()"
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            text
                                                    >
                                                        <div v-if="joinRequestedText.show">
                                                            <v-icon>{{icon.join}}</v-icon>
                                                        </div>
                                                        {{ joinRequestedText.text }}
                                                    </v-btn>
                                                </div>
                                                <div v-else>
                                                    <v-btn
                                                        v-if="isOwnModel"
                                                        style="margin-right: 5px; margin-top: 15px;"
                                                        color="primary"
                                                        text
                                                        :disabled="disableBtn"
                                                        @click="saveComposition('save')"
                                                        v-on="on"
                                                    >
                                                        <v-icon>{{icon.save}}</v-icon>
                                                        SAVE
                                                    </v-btn>
                                                    <v-btn
                                                            text
                                                            v-else
                                                            color="primary"
                                                            :disabled="disableBtn"
                                                            @click="saveComposition('fork')"
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                    >
                                                        <v-icon>{{icon.fork}}</v-icon>
                                                        FORK
                                                    </v-btn>
                                                </div>
                                            </template>
                                            <v-list>
                                                <v-list-item
                                                        v-for="(item, index) in saveItems"
                                                        :key="index"
                                                        @click="functionSelect(item.title,index)"
                                                >
                                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </slot>
                                    <slot name="shareButton">
                                        <v-menu
                                                v-if="isOwnModel && isServerModel&& !getReadOnly "
                                                offset-y
                                                open-on-hover
                                                left
                                        >
                                            <template v-slot:activator="{ on }">
                                                <div>
                                                    <v-btn
                                                            text
                                                            style="margin-right: 5px; margin-top: 15px;"
                                                            :disabled="!initLoad"
                                                            v-on="on"
                                                            @click="openInviteUsers()"
                                                    >
                                                        <v-icon>{{icon.share}}</v-icon>
                                                        SHARE
                                                        <v-avatar v-if="requestCount" size="25" color="red"
                                                                    style="margin-left: 2px;"> {{ requestCount }}
                                                        </v-avatar>
                                                    </v-btn>
                                                </div>
                                            </template>
                                            <v-list>
                                                <v-list-item
                                                        v-for="(item, index) in shareItems"
                                                        :key="index"
                                                        @click="functionSelect(item.title,index)"
                                                >
                                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </slot>
                                </v-row>
                            </div>
                        </v-row>
                    </v-flex>
                </slot>
                <v-fab-transition>
                    <v-btn
                            v-if="!rtcLogin && ((isServerModel && (information && information.permissions)))"
                            color="blue"
                            dark
                            fab
                            small
                            absolute
                            bottom
                            right
                            style="margin:0 5px 40px 0;"
                            @click="onJoin()"
                    >
                        <v-icon>mdi-camera</v-icon>
                    </v-btn>
                </v-fab-transition>
            </v-layout>


            <v-card class="tools" style="top:100px; text-align: center;">
                <span class="bpmn-icon-hand-tool" 
                        v-bind:class="{
                            icons : !dragPageMovable,
                            hands : dragPageMovable
                        }"
                        _width="30"
                        _height="30" 
                        @click="toggleGrip"
                >
                     <v-tooltip md-direction="right">Hands</v-tooltip>
                </span>
                
                <v-tooltip v-for="(item, key) in elementTypes" 
                        :key="key" 
                        right
                >
                    <template v-slot:activator="{ on }">
                        <span class="draggable"
                                align="center"
                                :_component="item.component"
                                :_width="item.width"
                                :_height="item.height"
                        >
                            <img v-if="!getReadOnly"
                                    height="30px" 
                                    width="30px" 
                                    :src="item.src" 
                                    v-on="on"
                            >
                        </span>
                    </template>
                    <span>{{ item.label }}</span>
                </v-tooltip>
            </v-card>
        </v-layout>

        <ParticipantPanel
                v-if="showParticipantPanel"
                :lists="participantLists"
        ></ParticipantPanel>

        <!--  dialog       -->
        <model-canvas-share-dialog
                v-model="inviteLists"
                :showDialog="inviteDialog"
                :checkPublic="showPublicModel"
                :canvas="canvas"
                canvasComponentName="sticky-model-canvas"
                @all="invitePublic"
                @apply="applyInviteUsers"
                @close="closeInviteUsers"
                @add="addInviteUser"
                @remove="removeInviteUser"
        ></model-canvas-share-dialog>

        <model-storage-dialog
                :condition="storageCondition"
                :showDialog="showStorageDialog"
                @save="saveModel"
                @fork="forkModel"
                @backup="backupModel"
                @close="storageDialogCancel"
        ></model-storage-dialog>


        <dialog-purchase-item
                v-model="purchaseItemDialog"
                :purchase-item-info="purchaseItemDialogInfo"
                @result="purchaseItemDialogSubmit"
                @close="purchaseItemDialogClose"
        ></dialog-purchase-item>

        <v-dialog v-model="forkAlertDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Fork
                    <v-icon>{{icon.fork}}</v-icon>
                </v-card-title>

                <v-card-text>
                    권한이 없어서 수정 할 수 없습니다. Fork를 하여 사용해 주세요.
               </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="saveComposition('fork')"
                            color="green darken-1"
                            text
                    >
                        Fork
                    </v-btn>
                    <v-btn @click.native="forkAlertDialog = false"
                            color="red darken-1"
                            text
                    >
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- model IMAGE -->
        <modeler-image-generator 
                ref="modeler-image-generator"
        ></modeler-image-generator>


        <hsc-window-style-metal>
            <hsc-window title="User Camera"
                        :closeButton="true"
                        :isOpen.sync="webRtcDialog"
                        :resizable="true"
                        :isScrollable="true"
                        :minWidth="400"
                        :minHeight="110"
                        :maxWidth="800"
                        :maxHeight="110"
                        positionHint="5 / -10"
                        style="
                        color: rgb(0, 0, 0);
                        box-shadow: rgba(0, 0, 0, 0.5) 0px 4pt 8pt;
                        background: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255));
                        z-index: 0;
                        overflow: visible;
                        width: 404px;
                        height: 154.2px;"
            >
                <v-layout>
                    <v-col>
                        <v-row style="margin-left: 2px; margin-bottom: 2px">
                            <vue-webrtc ref="webrtc"
                                        width="100%"
                                        height="160px"
                                        cameraHeight="50px"
                                        enableAudio
                                        class="video-list"
                                        :roomId="rtcRoomId"
                                        @error="onError"/>

                        </v-row>
                    </v-col>
                </v-layout>
            </hsc-window>
        </hsc-window-style-metal>
    </div>
</template>

<script>
    import StickyModeling from "./index";
    import ModelCanvas from "../modeling/ModelCanvas";
    import ParticipantPanel from "../modeling/ParticipantPanel";
    import DialogPurchaseItem from "../../payment/DialogPurchaseItem";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import ModelCanvasShareDialog from "../modeling/ModelCanvasShareDialog";
    import GeneratorUI from "../modeling/generators/GeneratorUI";

    import * as io from 'socket.io-client';
    import { mdiAbTesting } from '@mdi/js';
    import { diffString, diff } from "json-diff";

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'sticky-model-canvas',
        mixins: [ModelCanvas],
        components: {
            ParticipantPanel,
            mdiAbTesting,
            diffString,
            diff,
            io,
            GeneratorUI,
            'model-canvas-share-dialog': ModelCanvasShareDialog,
            'model-storage-dialog': ModelStorageDialog,
            'dialog-purchase-item' : DialogPurchaseItem
        },
        data() {
            return {
                fab: false,

                //db permission
                isMultiShareType: 'ReadOnly',
                isMultiShareTypeList: ['ReadOnly', 'Write'],
                
                //button items
                shareItems: [
                    {title: 'Share'},
                ],
                saveItems: [
                    {title: 'Save to Server'},
                    {title: 'Download model File'},
                    {title: 'Duplicate'},
                ],

                //project Name
                projectNameHint: null,
                projectNameColor: null,
                rules: {
                    required: value => !!value || 'ProjectName required.',
                    min: v => v.length >= 8 || 'Min 8 characters',
                    emailMatch: () => ('The email and password you entered don\'t match'),
                },
                
                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
                
                //version
                version: '',
                revisionInfo: {},
                
                //fork
                forkAlertDialog: false,

                elementTypes: [
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/event.png`,
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/command.png`,
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/policy.png`,
                        'color': '#BB94BF'
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/aggregate.png`,
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/external.png`,
                    },
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/view.png`,
                    },
                    {
                        'icon': 'bpmn-icon-start-issue-none',
                        'component': 'stickyNoteBoard',
                        'label': 'Sticky Note Board',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/event/issue.png`,
                    },
                    {
                        'component': 'sticky-line-element',
                        'label': 'Line',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`,
                    },
                    {
                        'component': 'sticky-text-element',
                        'label': 'Text',
                        'width': '100',
                        'height': '100',
                        'src': `${window.location.protocol + "//" + window.location.host}/static/image/symbol/text_element.png`,
                    },
                ],

            }
        },
        computed: {
            getReadOnly() {
                return this.readOnly
            },
            disableBtn() {
                if (this.isDisable || !this.initLoad) {
                    return true
                }
                return false
            },
        },
        created: function () {
            var me = this
            try {
                Vue.use(StickyModeling);
                me.canvasType = 'sticky'
                if (this.$isElectron) {
                    me.isQueueModel = false
                } else {
                    me.isQueueModel = true
                }
                me.track()
            } catch (e) {
                alert('Error: StickyModelCanvas Created().', e)
            }
        },
        mounted: function () {
        }
        ,
        watch: {
            value: {
                deep: true,
                handler:
                    _.debounce(function (newVal, oldVal) {
                        var me = this
                        if (newVal) {
                            // following is right way
                            me.$emit("input", newVal);
                            me.$emit("change", newVal, me.projectName);
                        }
                    }, 1000)
            },
            projectName: _.debounce(function (newVal, oldVal) {
                    var me = this
                    if (me.initLoad) {
                        me.modelChanged = true
                    }

                    if (newVal) {
                        me.projectNameHint = null
                        me.projectNameColor = null
                    } else {
                        me.projectNameHint = 'Project name is required.'
                        me.projectNameColor = 'red'
                    }
            }, 0),
        },
        methods: {
            bindEvents: function (opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }

                this.canvas = opengraph.canvas;
                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start: function () {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height'),
                            'description': $(this).attr('_description'),
                            'src': $(this).children('img').attr('src'),
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });

                canvasEl.droppable({
                    drop: function (event, ui) {
                        var componentInfo = canvasEl.data('DRAG_SHAPE'),
                            shape, element;
                        if (componentInfo) {
                            var dropX = event.pageX - canvasEl.offset().left + canvasEl[0].scrollLeft;
                            var dropY = event.pageY - canvasEl.offset().top + canvasEl[0].scrollTop;
                            var scale = opengraph.canvas._CONFIG.SLIDER[0].innerText / 100

                            dropX = dropX / scale;
                            dropY = dropY / scale;

                            componentInfo = {
                                component: componentInfo.component,
                                x: dropX,
                                y: dropY,
                                width: parseInt(componentInfo.width, 10),
                                height: parseInt(componentInfo.height, 10),
                                description: componentInfo.description ? componentInfo.description : '',
                                src: componentInfo.src ? componentInfo.src : '',
                            }


                            me.addElement(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },
            addElement: function (componentInfo, bounded) {
                this.enableHistoryAdd = true;
                var me = this;
                var vueComponent = me.getComponentByName(componentInfo.component);
                var element;

                if(!componentInfo.isRelation) {
                    if(componentInfo.src.includes('event.png')) {
                        componentInfo.color = '#F1A746'
                    } else if(componentInfo.src.includes('command.png')) {
                        componentInfo.color = '#5099F7'
                    } else if(componentInfo.src.includes('policy.png')) {
                        componentInfo.color = '#BB94BF'
                    } else if(componentInfo.src.includes('aggregate.png')) {
                        componentInfo.color = '#F8D454'
                    } else if(componentInfo.src.includes('external.png')) {
                        componentInfo.color = '#ED73B6'
                    } else if(componentInfo.src.includes('view.png')) {
                        componentInfo.color = '#5FC08B'
                    } else if(componentInfo.src.includes('issue.png')) {
                        componentInfo.color = '#8E24AA'
                    }
                }

                if (componentInfo.isRelation && componentInfo.component.includes('relation')) {
                    /* make Relation */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.sourceElement.value,
                        componentInfo.targetElement.value,
                        componentInfo.vertices,
                    );
                } else if(componentInfo.component.includes('line')) {
                    var vertices = [[componentInfo.x, componentInfo.y], [componentInfo.x+200, componentInfo.y]]
                    vertices = JSON.stringify(vertices)

                    /* make Line Element */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        vertices
                    );

                } else if(componentInfo.component.includes('text')) {
                    /* make Text Element */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height,
                    );

                } else {
                    /* make Element */
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        me.$store.getters.getWidth(componentInfo.component),
                        me.$store.getters.getHeight(componentInfo.component),
                        componentInfo.description,
                        componentInfo.color
                    );
                }

                me.addElementPush(me.value, element)
            },
            async purchaseItemDialogSubmit(result) {
                var me = this
                try {
                    if (result) {
                        var returnResult = false
                        var type = me.purchaseItemDialogInfo.resourceType
                        if (type == 'codeView') {
                            returnResult = await me.codeModalShow()
                        } else if (type == 'downloadCode') {
                            returnResult = await me.generateZip()
                        }

                        // console.log('returnResult', returnResult)
                        if (returnResult) {
                            alert(`'${type}' 를 성공 하였습니다.`)
                        } else if (returnResult == false) {
                            // console.log('fail: ', me.purchaseItemDialogInfo)
                            me.purchaseItemDialogClose(false)
                            alert(`'${type}' 를 실패 하였습니다.`)
                        }
                    } else {
                        alert('결제를 실패했습니다.')
                    }
                    me.purchaseItemDialogClose()
                } catch (e) {
                    me.purchaseItemDialogClose()
                }
            },
            onConnectShape: function (edge, from, to) {
                var me = this;
                var edgeElement;
                if (edge.shape) {
                    edgeElement = edge;
                }

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var componentInfo = {
                        component: 'sticky-note-relation',
                        sourceElement: from.$parent,
                        targetElement: to.$parent,
                        vertices: vertices,
                        isFilled: true,
                        isRelation: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        }
                    }

                    from.$parent.value.elementView.id = from.id;
                    to.$parent.value.elementView.id = to.id;

                    me.canvas.removeShape(edgeElement, true);
                    this.addElement(componentInfo);
                }
            },
            filterProjectName(projectName) {
                var filterName = ''
                var pattern1 = /[0-9ㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+|<>?:{}]/gi; // 영어 소문자

                if (projectName) {
                    // filterName = projectName.replace(/\s/gi, "");
                    filterName = projectName
                    if (pattern1.test(filterName)) {
                        filterName = filterName.replace(pattern1, '');
                    }
                    filterName = filterName.toLowerCase()
                    return filterName
                }
                return filterName
            },
            getComponentByClassName: function (className) {
                var componentByClassName;
                var me = this

                $.each(window.Vue.stickyModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });

                return componentByClassName;
            },
            onError(error, stream) {
                console.log('On Error Event', error, stream);
            },
            showReplay() {
                var me = this
                if (false) {
                    alert('준비중 입니다.')
                } else {
                    var proId = me.information.projectId ? me.information.projectId : me.params.projectId
                    var author = me.information.author ? me.information.author : me.params.userUid
                    let route = me.$router.resolve({path: `/replay/${proId}/last/last`});
                    window.open(route.href, '_blank');
                }

            },
            async functionSelect(title) {
                var me = this
                if (title == 'Save to Server') {
                    me.saveComposition('save')

                } else if (title == 'Duplicate') {
                    me.saveComposition('duplicate')
                    // me.storageDialogReady('duplicate')
                } else if (title == 'Download model File') {
                    me.downloadModelToJson()
                } else if (title == 'Share') {
                    // me.openEventShareDialog()
                    me.openInviteUsers()
                }
            },
            _isAttached(outer, inner) {
                if (
                    //왼쪽 상단 모서리에 걸린 경우
                    (outer.x < inner.x + inner.width &&
                        outer.y < inner.y + inner.height)

                    &&

                    //우측 하단 모서리에 걸린 경우
                    (inner.x < outer.x + outer.width &&
                        inner.y < outer.y + outer.height)

                    &&

                    //오른쪽 상단 모서리에 걸린 경우
                    (inner.x < outer.x + outer.width &&
                        outer.y < inner.y + inner.height)

                    &&

                    //왼쪽 하단 모서리에 걸린 경우
                    (outer.x < inner.x + inner.width &&
                        inner.y < outer.y + outer.height)
                ) return true;

                return false;
            }
        }
    }
</script>

<style>
    .sticky-mobile-btn {
        display: none;
    }

    @media only screen and (max-width: 785px) {
        .sticky-mobile-btn {
            display:block;
        }
        .sticky-btn {
            display:none;
        }
    }
    @media only screen and (max-width: 781px) {

        #mobile-undo-redo {
            margin-left: 20px;
        }

        #action-btn {
            position: absolute;
            right: 0;
        }

        #mobile-action-btn {
            position: relative;
            right: 5px;
            bottom: -10px;
        }
    }

    #mobile-menu-popup-btn {
        position: fixed;
        right: 0;
        bottom: 0;
    }

    #mobile-menu-popup-btn .v-speed-dial {
        position: absolute;
    }

    #mobile-menu-popup-btn .v-btn--floating {
        position: relative;
    }

</style>