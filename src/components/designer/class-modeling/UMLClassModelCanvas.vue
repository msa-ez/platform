<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="canvas-panel" :class="{ 'embedded' : embedded }">
        <div :key="eleCnt">
            <separate-panel-components
                :min="mainSeparatePanel.min"
                :max="mainSeparatePanel.max"
                :triggerLength="5"
                :paneLengthPercent.sync="mainSeparatePanel.current"
                @close="closeSeparatePanel()"
                :inBoundSeparatePanel="false"
            >
                <template v-slot:one>
                    <v-layout right>
                        <opengraph ref="opengraph" 
                                focus-canvas-on-select wheelScalable 
                                :labelEditable="true" :dragPageMovable="dragPageMovable" 
                                :enableContextmenu="false" :enableRootContextmenu="false"
                                :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                                :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" 
                                :enableHotkeyCtrlD="false" :enableHotkeyCtrlG="false" 
                                :slider="true" :movable="true" :resizable="true" 
                                :selectable="true" :connectable="true" :autoSliderUpdate="true"
                                v-if="value" 
                                v-on:canvasReady="bindEvents" 
                                v-on:connectShape="onConnectShape" 
                                :imageBase="imageBase">
                            <!--엘리먼트-->
                            <div v-for="elementId in Object.keys(value.elements)" :key="elementId">
                                <component 
                                        v-if="elementId && value.elements[elementId] != null"
                                        :is="getComponentByClassName(value.elements[elementId]._type)"
                                        :value.sync="value.elements[elementId]"
                                        :ref="elementId"
                                ></component>
                            </div>
                            <!-- Relation -->
                            <div v-for="relationId in Object.keys(value.relations)" :key="relationId">
                                <component 
                                        v-if="relationId && value.relations[relationId] != null"
                                        :is="getComponentByClassName(value.relations[relationId]._type)"
                                        :value.sync="value.relations[relationId]"
                                        :ref="relationId"
                                ></component>
                            </div>
                        </opengraph>

                        <div v-if="!embedded">
                            <v-row class="gs-modeling-undo-redo">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn class="gs-model-z-index-2 gs-undo-opacity-hover"
                                                :disabled="checkUndo" 
                                                text
                                                small
                                                right 
                                                @click.native="undo()"
                                                v-on="on"
                                        >
                                            <v-icon medium>mdi-undo</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Undo</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn class="gs-model-z-index-2 gs-undo-opacity-hover"
                                                :disabled="checkRedo"
                                                text
                                                small
                                                right 
                                                @click.native="redo()"
                                                v-on="on"
                                        >
                                            <v-icon medium>mdi-redo</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Redo</span>
                                </v-tooltip>
                            </v-row>
                        </div>

                        <!-- <div v-if="embedded"  -->
                        <div 
                                class="d-flex justify-end"
                                style="position: absolute; top: 22px; right: 70px;"
                                :style="embedded ? '':'z-index: 1'"
                        >
                            <!-- <v-btn
                                style="position: absolute; top:26px; right: 130px;"
                                color="orange"
                                @click="openCommandViewer()"
                                small
                                text
                            >
                                <v-icon>mdi-code-greater-than</v-icon>
                                <div>Java Parse</div>
                            </v-btn> -->
                            <!-- <v-btn
                                    v-if="!isReadOnlyModel"
                                    color="primary"
                                    text
                                    @click="openAutoModelingDialog()"
                                    style="margin-right:5px;"
                            >
                                <Icon icon="arcticons:openai-chatgpt" style="margin-right:5px; stroke-width: 3px;" width="24" height="24"/>
                                <div>Chat</div>
                            </v-btn> -->
                            <v-btn
                                    color="primary"
                                    @click="openCommandViewer()"
                            >
                                <v-icon>mdi-code-greater-than</v-icon>
                                <div>code</div>
                            </v-btn>
                        </div>

                        <v-flex v-if="!embedded" style="justify:end; align:start;">
                            <v-row class="gs-model-z-index-1" style="position: absolute; left: 50%; transform: translate(-50%, 0%); margin-top:20px;">
                                <v-text-field
                                    style="margin-right: 5px; max-width: 80px"
                                    label="Project Name"
                                    v-model="projectName"
                                ></v-text-field>

                                <text-reader 
                                    :importType="'json'" 
                                    @load="value = $event" 
                                    style="display: inline-block;"
                                    :fileName.sync="projectName"
                                ></text-reader>

                                <v-menu offset-y open-on-hover left style="margin-top:-20px;">
                                    <template v-slot:activator="{ on }">
                                        <div v-if="isReadOnlyModel">
                                            <v-btn class="uml-btn"
                                                    text
                                                    color="primary"
                                                    :disabled="disableBtn"
                                                    @click="saveComposition('fork')"
                                            >
                                                <v-icon>{{icon.fork}}</v-icon>
                                                <div class="uml-btn-text">FORK</div>
                                            </v-btn>
                                            <v-btn class="uml-btn"
                                                    :color="joinRequestedText.show ? 'primary' :'success'"
                                                    :disabled="disableBtn"
                                                    @click="requestInviteUser()"
                                                    text
                                                    style="margin-right: 5px;"
                                            >
                                                <div v-if="joinRequestedText.show">
                                                    <v-icon>{{icon.join}}</v-icon>
                                                </div>
                                                <div class="uml-btn-text">{{ joinRequestedText.text }}</div>
                                            </v-btn>
                                        </div>
                                        <div v-else>
                                            <v-btn class="uml-btn"
                                                v-if="isOwnModel || isClazzModeling"
                                                color="primary" text
                                                v-on="on"
                                                :disabled="disableBtn"
                                                @click="saveComposition('save')"
                                            >
                                                <v-icon>{{ icon.save }}</v-icon>
                                                <div class="uml-btn-text">SAVE</div>
                                            </v-btn>
                                            <v-btn class="uml-btn"
                                                v-else
                                                color="primary" text
                                                :disabled="disableBtn"
                                                @click="saveComposition('fork')"
                                            >
                                                <v-icon>{{icon.fork}}</v-icon>
                                                <div class="uml-btn-text">FORK</div>
                                            </v-btn>
                                        </div>                                
                                    </template>
                                    <v-list>
                                        <v-list-item 
                                                v-for="(item, index) in saveItems"
                                                :key="index"
                                                @click="functionSelect(item.title, index)">
                                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>

                                <v-menu v-if="isOwnModel && isServerModel && !isReadOnlyModel"
                                        offset-y 
                                        open-on-hover 
                                        left>
                                    <template v-slot:activator="{ on }">
                                        <v-btn class="uml-btn"
                                            text
                                            v-on="on"
                                            @click="openInviteUsers()"
                                            style="margin-right: 5px;"
                                            :disabled="!initLoad"
                                        >
                                            <v-icon>{{ icon.share }}</v-icon>
                                            <div class="uml-btn-text">SHARE</div>
                                        </v-btn>
                                    </template>
                                </v-menu>
                            </v-row>
                        </v-flex>

                        <div v-if="embedded && isReadOnlyModel">
                            <v-card class="tools" style="top:100px; text-align: center;">
                                <span class="bpmn-icon-hand-tool" 
                                        v-bind:class="{ icons : !dragPageMovable, hands : dragPageMovable }"
                                        _width="30"
                                        _height="30" 
                                        v-on:click="toggleGrip">
                                </span>
                            </v-card>
                        </div>

                        <v-card v-else class="tools" style="top:100px; text-align: center;">
                            <span class="bpmn-icon-hand-tool" 
                                    v-bind:class="{ icons : !dragPageMovable, hands : dragPageMovable }"
                                    _width="30"
                                    _height="30" 
                                    v-on:click="toggleGrip">
                                <v-tooltip md-direction="right">Hands</v-tooltip>
                            </span>
                            <v-tooltip right v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">
                                <template v-slot:activator="{ on }">
                                    <span
                                        @mouseover="changeCategory(categoryIndex)"
                                        class="icons draggable"
                                        align="center"
                                        :_component="category[0].component"
                                        :_width="category[0].width"
                                        :_height="category[0].height"
                                        :_description="category[0].description"
                                        :_label="category[0].label"
                                    >
                                        <img height="30px" width="30px" :src="category[0].src" v-on="on">
                                    </span>
                                </template>
                                <span>{{ category[0].label }}</span>
                            </v-tooltip>
                        </v-card>

                        <div v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">
                            <div v-if="selectedCategoryIndex == categoryIndex">
                                <v-tooltip right v-for="(item, key) in category" :key="key">
                                    <template v-slot:activator="{ on }" v-if="key>0">
                                        <span
                                                class="draggable"
                                                align="center"
                                                :_component="item.component"
                                                :_width="item.width"
                                                :_height="item.height"
                                                :_description="item.description"
                                                :_label="item.label"
                                                @click="item.x = 500 + Math.floor(Math.random()*200); item.y=280 + Math.floor(Math.random()*150); addElement(item);"
                                                :style="toolStyle(key, categoryIndex, category.length)"
                                        >
                                            <img valign="middle"
                                                    style="vertical-align:middle; border: 2 solid grey; -webkit-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);"
                                                    onmouseover="this.height=this.height*1.5;this.width=this.width*1.5;this.left=this.left-this.width*0.5;this.right=this.right-this.width*0.5;"
                                                    onmouseout="this.height=this.height/1.5;this.width=this.width/1.5;this.left=this.left+this.width*0.5;this.right=this.right+this.width*0.5;"
                                                    height="40px" width="40px" :src="item.src" v-on="on" border=2
                                            >
                                                <v-chip v-on="on">{{ item.label }}</v-chip>
                                        </span>
                                    </template>
                                    <v-card
                                            class="mx-auto"
                                            max-width="400"
                                            max-height="400"
                                            outlined
                                    >
                                        <v-list-item three-line>
                                            <v-list-item-content>
                                                <div class="overline mb-4">{{ category[0].label }}</div>
                                                <v-list-item-title class="headline mb-1">{{ item.label }}</v-list-item-title>
                                                <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
                                            </v-list-item-content>
                                            <v-list-item-avatar
                                                    tile
                                                    size="80"
                                                    color="white"
                                            >
                                                <v-img :src="item.src"></v-img>
                                            </v-list-item-avatar>
                                        </v-list-item>
                                    </v-card>
                                </v-tooltip>
                            </div>
                        </div>

                        <v-card v-if="showAutoModelingDialog" style="position: absolute; top: 100px; right: 25px; width: 500px;">
                            <v-system-bar style="justify-content: right;"><v-btn icon @click="closeAutoModelingDialog()"><v-icon small style="margin-right: -15px;">mdi-close</v-icon></v-btn></v-system-bar>
                            <v-card-text id="scroll_messageList" style="max-height: 70vh; overflow-y: scroll;">
                                <v-col cols="12">
                                    <div v-for="message in chatList" :key="message">
                                        <v-row v-if="message.type == 'prompt'" style="justify-content: right; margin-bottom: 20px;">
                                            <v-card style="display:inline-block; width: 350px; text-align: left;">
                                                <v-card-text class="auto-modeling-message">
                                                    {{ message.text }}
                                                </v-card-text>
                                            </v-card>
                                        </v-row>
                                        <v-row v-else-if="message.type == 'response'" style="margin-bottom: 20px;">
                                            <v-card style="display:inline-block; background-color: #DAF5FF; width: 400px; overflow-x: scroll; text-align: left;">
                                                <v-card-text class="auto-modeling-message">
                                                    <pre style="font-size: small;">{{ message.text }}</pre>
                                                </v-card-text>
                                            </v-card>
                                        </v-row>
                                        <!-- <v-textarea
                                            v-else-if="message.type == 'response'"
                                            v-model="message.text"
                                            solo
                                            class="auto-modeling-dialog-textarea"
                                            style="font-size: small; padding-top:0px; width: 350px;"
                                        >
                                        </v-textarea> -->
                                    </div>                                    
                                </v-col>
                                <div>
                                    <!-- <v-btn v-if="generationStopped"
                                        @click="validateDuplicateChatPrompt(promptList[promptList.length -1], 'retry')"
                                        style="z-index:999; margin-top: 15px; color: black;" text>
                                            <v-icon>mdi-refresh</v-icon>Regenerate Response
                                    </v-btn>
                                    <v-btn v-else @click="stopExplainCode()" style="z-index:999; margin-top: 15px; color: black;" text>
                                        <v-icon>mdi-stop-circle-outline</v-icon>Stop generating
                                    </v-btn> -->
                                </div>
                            </v-card-text>
                            <v-card style="text-align: -webkit-center; height: 65px;">
                                <v-text-field
                                    v-model="input.instruction"
                                    class="prompt_field"
                                    style="width: 492px; background-color: #FFFFFF; color: white;"
                                    outlined
                                    autofocus
                                    append-icon="mdi-send"
                                    @click:append="generate()"
                                    @keypress.enter="debouncedGenerate()"
                                >
                                </v-text-field>                                     
                            </v-card>
                        </v-card>
                    </v-layout>

                    <v-dialog v-model="classNameDialog" max-width="500">
                        <v-card>
                            <v-card-title class="headline">Class Name Definition</v-card-title>
                            <v-card-text>
                                <v-text-field
                                        label="Class Name"
                                        autofocus
                                        v-model="newClassCompInfo.name"
                                ></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green darken-1" text
                                        @click="addClassElement"
                                >
                                    Add
                                </v-btn>
                                <v-btn color="red darken-1" text 
                                        @click.native="classNameDialog = false"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <model-storage-dialog
                            :condition="storageCondition"
                            :showDialog="showStorageDialog"
                            @save="saveModel"
                            @fork="forkModel"
                            @backup="backupModel"
                            @close="storageDialogCancel"
                    ></model-storage-dialog>

                    <v-dialog v-model="forkAlertDialog" max-width="290">
                        <v-card>
                            <v-card-title class="headline">Fork
                                <v-icon>{{icon.fork}}</v-icon>
                            </v-card-title>
                            <v-card-text> 권한이 없어서 수정 할 수 없습니다. Fork를 하여 사용해 주세요.</v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green darken-1" text @click="saveComposition('fork')">Fork</v-btn>
                                <v-btn color="red darken-1" text @click.native="forkAlertDialog = false">Close</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <model-canvas-share-dialog
                            v-model="inviteLists"
                            :showDialog="inviteDialog"
                            :checkPublic="showPublicModel"
                            :canvas="canvas"
                            canvasComponentName="uml-class-model-canvas"
                            @all="invitePublic"
                            @apply="applyInviteUsers"
                            @close="closeInviteUsers"
                            @add="addInviteUser"
                            @remove="removeInviteUser"
                    ></model-canvas-share-dialog>

                    <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
                    <GeneratorUI v-if="projectId" ref="generatorUI" :projectId="projectId" :modelValue="value" :embedded="embedded" :defaultInputData="defaultGeneratorUiInputData" @createModel="createModel" @clearModelValue="clearModelValue" @modificateModel="modificateModel"></GeneratorUI>
                </template>
                <template v-slot:two>
                    <!-- v-if="embedded" -->
                    <CodeGenerator
                        v-model="codeGenValue"
                        :isOwnModel="isOwnModel"
                        :isServerModel="isServerModel"
                        :projectInformation="information"
                        :projectName="projectName"
                        :modelInitLoad="initLoad"
                        :modelingProjectId="projectId"
                        :asyncCodeForValue="false"
                        :callCodeForValue="changedTemplateCode"
                        :oldTreeHashLists.sync="oldTreeHashLists"
                        :newTreeHashLists.sync="newTreeHashLists"
                        :projectVersion="projectVersion"
                        @changedByMe="settingChangedByMe"
                        canvas-name="uml-class-model-canvas"
                    ></CodeGenerator>
                        <!-- @java-reverse="javaReverse" -->
                </template>
            </separate-panel-components>
        </div>
        <!-- Mouse Cursor -->
        <div v-for="(otherMouseEvent, email) in filteredMouseEventHandlers" :key="email">
            <MouseCursorComponent :mouseEvent="otherMouseEvent" :email="email" />
        </div>
    </div>
</template>

<script>
    import ClassModeling from "./index";
    import TextReader from "../../TextReader";
    import CodeViewer from "../CodeViewer";
    import ModelCanvas from '../modeling/ModelCanvas'
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import ModelCanvasShareDialog from "../modeling/ModelCanvasShareDialog";
    import SeparatePanelComponents from "../../SeparatePanelComponents";
    import CodeGenerator from "../modeling/CodeGenerator";
    import { v4 } from 'uuid';
    import Pusher from 'pusher-js';
    var changeCase = require('change-case');
    var pluralize = require('pluralize');
    var FileSaver = require('file-saver');
    import { saveAs } from 'file-saver';
    import Generator from '../modeling/generators/AggregateMemberGenerator.js'
    // import GeneratorUI from "../modeling/generators/GeneratorUI";
    import { digl } from '@crinkles/digl';
    import GeneratorUI from "../modeling/generators/GeneratorUI";
    import MouseCursorComponent from "../modeling/MouseCursorComponent.vue"

    const jsonpath = require('jsonpath-plus');
    var JSZip = require('jszip');

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [ModelCanvas],
        name: 'uml-class-model-canvas',
        components: {
            saveAs,
            Pusher,
            CodeViewer,
            'model-canvas-share-dialog': ModelCanvasShareDialog,
            'text-reader': TextReader,
            'model-storage-dialog': ModelStorageDialog,
            SeparatePanelComponents,
            CodeGenerator,
            GeneratorUI,
            MouseCursorComponent
            // GeneratorUI
        },
        props: {
            aggregateRootList: {
                type: Array,
                default: () => [],
            },
            esValue: Object,
        },
        data() {
            return {
                defaultGeneratorUiInputData: {
                    generator: "AggregateMemberGenerator",
                    instruction: "생성할 서비스명",
                    aggregateRoot: {
                        name: null,
                        fieldDescriptors: ""
                    }
                },
                eleCnt: 0,
                codeGenValue: null,
                autoScroll: true,
                dummyMessage: {
                    text: "What do you want to create?",
                    type: 'response'
                },
                chatListIndex: null,
                chatList: [],
                messageListIndex: null,
                openAiMessageList: [],
                autoGeneratedElementUid: [],
                input: {
                    instruction: null,
                    aggregateRoot: {
                        name: null,
                        fieldDescriptors: ""
                    }
                },
                showAutoModelingDialog: false,
                // aggregateId: null,

                saveItems: [
                    {title: 'Save to Server'},
                    {title: 'Download model File'},
                ],
                files: {
                    md: 'mdi-markdown',
                    txt: 'mdi-file-document-outline',
                    java: 'mdi-language-java',
                    xml: 'mdi-xml',
                    shell: 'mdi-powershell',
                    docker: 'mdi-docker',
                },
                code: '',
                active: [],
                // items: [],
                // undoing: false,
                // undoed: false,
                // tmpValue: [],
                // noPushUndo: false,

                //undo Redo
                // undoRedoArray: [],
                // undoRedoIndex: 0,
                // currentIndex: 0,
                // undoIndex: 0,

                // imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
                imageBase: `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/`,
                userId: '',
                snackbar: false,
                color: 'error',
                mode: 'multi-line',
                timeout: 6000,
                text: '수정중입니다.',
                pusher: {},
                connectCount: 0,
                connectInfo: [],
                show: false,
                channel: {},
                members: [],
                valueTmp: {},
                pathTmp: [],
                maxWidth: 0,
                maxHeight: 0,

                // class name dialog
                classNameDialog: false,
                newClassCompInfo: {},
                cloneValues: {},

                // fork
                forkAlertDialog: false,

                selectedCategoryIndex: null,
                elementTypes: [
                    [ 
                        {
                            'component': 'uml-class-definition',
                            'label': 'Class',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/entity.png`
                        },
                    ],
                    [
                        {
                            'component': 'uml-vo-class',
                            'label': 'Value',
                            'width': '100',
                            'height': '100',
                            'isVO': true,
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`
                        },
                        {
                            'component': 'uml-vo-class-address',
                            'label': 'Address',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Address',
                        },
                        {
                            'component': 'uml-vo-class-photo',
                            'label': 'Photo',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Photo'
                        },
                        {
                            'component': 'uml-vo-class-user',
                            'label': 'User',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'User'
                        },
                        {
                            'component': 'uml-vo-class-money',
                            'label': 'Money',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Money'
                        },
                        {
                            'component': 'uml-vo-class-email',
                            'label': 'Email',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Email'
                        },
                        {
                            'component': 'uml-vo-class-payment',
                            'label': 'Payment',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Payment'
                        },
                        {
                            'component': 'uml-vo-class-weather',
                            'label': 'Weather',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Weather'
                        },
                        {
                            'component': 'uml-vo-class-file',
                            'label': 'File',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'File'
                        },
                        {
                            'component': 'uml-vo-class-likes',
                            'label': 'Likes',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Likes'
                        },
                        {
                            'component': 'uml-vo-class-tags',
                            'label': 'Tags',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Tags'
                        },
                        {
                            'component': 'uml-vo-class-comment',
                            'label': 'Comment',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                            'isVO': true,
                            'description': 'Comment'
                        },
                    ],
                    [
                        {
                            'component': 'enum-class-definition',
                            'label': 'Enum',
                            'width': 200,
                            'height': 100,
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_enum.png`
                        },
                    ],
                    [
                        {
                            'component': 'uml-exception-class',
                            'label': 'Exception',
                            'width': 200,
                            'height': 100,
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_exception.png`
                        },
                    ],
                    [
                        {
                            'component': 'uml-text-element',
                            'label': 'Text',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/text_element.png`
                        },
                    ],
                    [
                        {
                            'component': 'uml-line-element',
                            'label': 'Line',
                            'width': '100',
                            'height': '100',
                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/edge.png`
                        },
                    ]
                ],

                // unload
                leaveSite: false,

            }
        },
        beforeDestroy: function () {
            var me = this
            if (me.embedded && me.aggregateRootList && me.aggregateRootList.length > 0) {
                var parentCanvas = me.getComponent('event-storming-model-canvas')
                var aggEl = me.aggregateRootList[0];
                var diff = jsondiffpatch.diff(aggEl.aggregateRoot.entities, me.value);
                if (parentCanvas && diff) {
                    var rootClass = Object.values(me.value.elements).find(el =>
                        el.isAggregateRoot && 
                        el.parentId === aggEl.id &&
                        el.name === aggEl.name
                    )
                    if (rootClass) {
                        me.$set(aggEl.aggregateRoot, "fieldDescriptors", rootClass.fieldDescriptors);
                        me.$set(aggEl.aggregateRoot, "operations", rootClass.operations);
                    }
                    me.$set(aggEl.aggregateRoot, "entities", JSON.parse(JSON.stringify(me.value)));
                    parentCanvas.updateUMLClassValue(aggEl);
                }
            }
            // this.canvas.removeSlider()
            // this.channel.pusher.unsubscribe('presence-event');
        },
        computed: {
            definitionSet() {
                return this.inputValue(this.active)
            },
            // drawer: {
            //     get: function () {
            //         var me = this
            //         var temp = false;
            //         var tmpArray = Object.values(me.value.elements)
            //         if (tmpArray.length > 0) {
            //             tmpArray.some(function (tmp, index) {
            //                 if (tmp.drawer) {
            //                     temp = true
            //                     return;
            //                 }
            //             })
            //         }
            //         return temp;
            //     }
            // },
            id: {
                get: function () {
                    return this.projectName
                }
            },
            disableBtn() {
                if (this.isDisable || !this.initLoad) {
                    return true
                }
                return false
            },
        },
        created() {
            var me = this
            if(me.embedded) {
                me.setCanvasType();
                if(me.aggregateRootList.length > 0) {
                    if (me.aggregateRootList[0].mirrorElement) {
                        me.readOnly = true;
                    }
                    me.addAggregateRootClass(me.aggregateRootList);
                }

                me.initLoad = true

                me.$nextTick(() => {
                    localStorage.removeItem('umlClass')
                    localStorage.removeItem('aggregateRoots')
                    localStorage.removeItem('umlClass_'+me.aggregateId)
                    localStorage.removeItem('aggregateRoots_'+me.aggregateId)
                })

            } else {
                me.isQueueModel = true;
            }
        },
        mounted: function() {
            var me = this
            me.userId = v4();

            window.addEventListener("wheel", me.handScroll);

            // const channel = me.pusher.subscribe('paint');
            // // channel.bind('draw', function(data) {
            // //     // console.log(data)
            // //     me.value = data.newVal
            // // });
            // channel.bind('draw', (data) => {
            //     const {userId: id, newVal} = data;
            //     if (me.userId !== id) {
            //         let used = false;
            //         if (newVal.name != 'class-relation') {
            //             me.value['definition'].some(function (tmp, index) {
            //                 if (tmp.elementView.id == newVal.elementView.id) {
            //                     me.value['definition'] = [
            //                         ...me.value['definition'].slice(0, index),
            //                         newVal,
            //                         ...me.value['definition'].slice(index)
            //                     ]
            //                     used = true;
            //                     return;
            //                 }
            //             })
            //             if (used == false) {
            //                 me.value.definition.push(newVal)
            //             }
            //             // me.value.definition.push(newVal)
            //         } else {
            //             me.value['relation'].some(function (tmp, index) {
            //                 // // console.log(tmp, index)
            //                 if (tmp._type != 'org.uengine.uml.model.bounded') {
            //                     me.value['relation'] = [
            //                         ...me.value['relation'].slice(0, index),
            //                         element,
            //                         ...me.value['relation'].slice(index)
            //                     ]
            //                     return;
            //                 }
            //                 if (me.value['relation'].length - 1 == index) {
            //                     me.value['relation'].push(element);
            //                 }
            //             })
            //         }
            //
            //     }
            // });
        },
        methods: {
            setCanvasType(){
                Vue.use(ClassModeling);
                this.canvasType = 'uml'
            },
            onChangedValue(oldVal, newVal){
                var me = this

                clearTimeout(me.valueChangedTimer);
                me.valueChangedTimer = setTimeout(function () {
                    var diff = jsondiffpatch.diff(oldVal, newVal);
                    if (!me.embedded && me.initLoad && diff) {
                        me.changeValueAction(diff);
                    }
                },500)
            },
            handScroll(){
                this.autoScroll = false
            },
            scrollToBottom() {
                const scrollText = document.getElementById('scroll_messageList');
                if (scrollText) {
                    scrollText.scrollTop = scrollText.scrollHeight;
                }
            },
            closeAutoModelingDialog(){
                this.showAutoModelingDialog = false
                this.input.instruction = ""
            },
            onReceived(content){
                if(this.chatListIndex == null){
                    this.chatListIndex = this.chatList.length
                }
                if(this.messageListIndex == null){
                    this.messageListIndex = this.openAiMessageList.length
                }
                var message = {
                    text: content,
                    type: "response"
                }
                this.chatList[this.chatListIndex] = message
                var response = {
                    content: content,
                    role: "assistant"
                }
                this.openAiMessageList[this.messageListIndex] = response
                if(this.autoScroll){
                    this.scrollToBottom();
                }
            },
            onModelCreated(content){
                this.createModel(content)
            },
            createModel(modelObj){
                var me = this;
                let aggRoot = null;
                me.value.relations = {};
                me.value.elements = {};

                
                if(modelObj && modelObj.elements && modelObj.elements.length > 0) {
                    for(var i=0; i<modelObj.elements.length; i++){
                        if(modelObj.elements[i].isAggregateRoot){
                            me.aggregateRootList.push(modelObj.elements[i])
                            me.value.elements[modelObj.elements[i].elementView.id] = modelObj.elements[i]
                            break
                        }
                    }

                    modelObj.elements.forEach((entity) => {
                        let isExist = false
                        Object.keys(me.value.elements).forEach((key) => {
                            if (me.value.elements[key] && me.value.elements[key].isAggregateRoot) {
                                aggRoot = me.aggregateRootList.find((el) => el.elementView.id == me.value.elements[key].parentId)
                            }

                            if(!me.value.elements[key]){
                                delete me.value.elements[key]
                            } else if(me.value.elements[key]._type === entity._type &&
                                    (me.value.elements[key].name === entity.name || (
                                        me.value.elements[key].displayName !== undefined &&
                                        me.value.elements[key].displayName === entity.name
                                    ))
                            ) {
                                isExist = true
                                const ele = JSON.parse(JSON.stringify(me.value.elements[key]))
                                if (ele.hasOwnProperty("fieldDescriptors") && entity.hasOwnProperty("fieldDescriptors")) {
                                    me.$set(ele, "fieldDescriptors", entity.fieldDescriptors)

                                } else if (ele.hasOwnProperty("items") && entity.hasOwnProperty("items")) {
                                    me.$set(ele, "items", entity.items)

                                }

                                me.$set(me.value.elements, key, ele)

                            } else if(me.value.elements[key]._type !== entity._type &&
                                    me.value.elements[key].isAggregateRoot &&
                                    (me.value.elements[key].name === entity.name || (
                                        me.value.elements[key].displayName !== undefined &&
                                        me.value.elements[key].displayName === entity.name
                                    ))
                            ) {
                                isExist = true
                                return
                            }
                        })

                        if (!isExist) {
                            me.$set(me.value.elements, entity.elementView.id, entity)
                        }
                    })

                }

                if(modelObj.relations){
                    let relationEl, sourceEl, targetEl
                    modelObj.relations.forEach((relation) => {
                        if(relation) {
                            Object.keys(me.value.elements).forEach((key) => {
                                if (me.value.elements[key]) {
                                    if (me.value.elements[key].name == relation.sourceEntity ||
                                            me.value.elements[key].displayName === relation.sourceEntity
                                    ) {
                                        sourceEl = me.value.elements[key]
                                    } else if (me.value.elements[key].name == relation.targetEntity ||
                                            me.value.elements[key].displayName === relation.targetEntity
                                    ) {
                                        targetEl = me.value.elements[key]
                                    }
                                } else {
                                    me.$delete(me.value.elements, key)
                                }
                            })
                            
                            if (sourceEl !== undefined && targetEl !== undefined) {
                                    relationEl = {
                                    from: sourceEl.elementView.id,
                                    to: targetEl.elementView.id,
                                    _type: "org.uengine.uml.model.Relation",
                                    fromLabel: "",
                                    name: targetEl.nameCamelCase,
                                    relationType: relation.type,
                                    relationView: {
                                        id: me.uuid(),
                                        from: sourceEl.elementView.id,
                                        to: targetEl.elementView.id,
                                    },
                                    selected: false,
                                    sourceElement: sourceEl,
                                    sourceMultiplicity: "1",
                                    targetElement: targetEl,
                                    targetMultiplicity: "1",
                                    toLabel: ""
                                }
                                
                                me.$set(me.value.relations, relationEl.relationView.id, relationEl)
                            }
                        }
                    })
                }

                Object.values(me.value.elements).forEach((element) => {
                    if (element) {
                        me.setAggregateField(element)
                    }
                })

                me.$nextTick(() => {
                    if(aggRoot){
                        me.$set(aggRoot.aggregateRoot.entities, "elements", me.value.elements)
                        me.$set(aggRoot.aggregateRoot.entities, "relations", me.value.relations)
                    }
                    me.alignClassElement()
                })
                
            },
            modificateModel(model){
                var me = this;
                if(model){
                    Object.keys(model).forEach(function (key){
                        if(key=="add"){
                            model["add"].forEach(function (field) {
                                if(!(field.className=='Integer' || field.className=='String' || field.className=='Boolean' || field.className=='Float' || 
                                    field.className=='Double' || field.className=='Long' || field.className=='Date')){
                                    
                                    let fieldVo = Object.values(me.value.elements).filter(element => element != null).find(element => element.name === field.className)
                                    if(!fieldVo){
                                        var componentInfo = {
                                            'component': 'uml-vo-class-'+field.className.toLowerCase(),
                                            'label': field.className,
                                            'width': '100',
                                            'height': '100',
                                            'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class_value.png`,
                                            'isVO': true,
                                            'description': field.className,
                                            'x': 500 + Math.floor(Math.random()*200),
                                            'y': 280 + Math.floor(Math.random()*150)
                                        }
                                        
                                        fieldVo = me.addElement(componentInfo)
                                        // me.$nextTick(() => {
                                        //     fieldVo = Object.values(me.value.elements).filter(element => element != null).find(element => element.name === field.className)
                                        // });
                                    }

                                    let aggregateRoot = Object.values(me.value.elements).filter(element => element != null).find(element => element.isAggregateRoot === true)

                                    if (aggregateRoot !== undefined && fieldVo !== undefined) {
                                        var relationEl = {
                                            from: aggregateRoot.elementView.id,
                                            to: fieldVo.elementView.id,
                                            _type: "org.uengine.uml.model.Relation",
                                            fromLabel: "",
                                            name: fieldVo.nameCamelCase,
                                            relationType: "Association",
                                            relationView: {
                                                id: me.uuid(),
                                                from: aggregateRoot.elementView.id,
                                                to: fieldVo.elementView.id,
                                            },
                                            selected: false,
                                            sourceElement: aggregateRoot,
                                            sourceMultiplicity: "1",
                                            targetElement: fieldVo,
                                            targetMultiplicity: "1",
                                            toLabel: ""
                                        }
                                        
                                        me.$set(me.value.relations, relationEl.relationView.id, relationEl)
                                    }
                                }  
                            })

                        }else if(key=="beforeReplace"){
                            // for(var i=0; i<model["beforeReplace"].length; i++){
                            //     if(model["beforeReplace"][i].isVO){ // Entity 일때만
                            //         Object.keys(me.value.elements).forEach(function (ele){
                            //             if(me.value.elements[ele]){
                            //                 if(me.value.elements[ele].elementView.id == model["beforeReplace"][i].classId){ // 바뀔 field에 해당하는 entitiy를 value에서 get
                            //                     Object.keys(me.value.elements[ele]).forEach(props => { // entity에 해당하는 elements의 field를 replace
                            //                         if (model["replace"][i].hasOwnProperty(props) && props!="_type") {
                            //                             me.value.elements[ele][props] = model["replace"][i][props];
                            //                         }
                            //                     });
                            //                 }
                            //             }
                            //         })
                            //     }
                            // }

                        }else if(key=="delete"){
                            for(var i=0; i<model["delete"].length; i++){
                                if(model["delete"][i].isVO){
                                    // Object.keys(me.value.elements).forEach(function (ele){
                                    //     if(me.value.elements[ele]){
                                    //         if(me.value.elements[ele].name.toLowerCase() == model["delete"][i].name.toLowerCase()){
                                    //             me.value.elements[ele] = null
                                    //         }
                                    //     }
                                    // })

                                    Object.keys(me.value.relations).forEach(function (rel){
                                        if(me.value.relations[rel]){
                                            if(me.value.relations[rel].to == model["delete"][i].classId){
                                                me.value.relations[rel] = null
                                            }
                                        }
                                    })
                                }
                            }
                        }

                    })
                    
                    if(model.updateElement){
                        if(model.replace.length > 0){
                            // 일부 key의 value가 바뀐 것을 me.value에 반영할 때, Vue instance 상에 직접 변화를 주기위한 별도 처리
                            Vue.set(me.value.elements, model.selectedElement.id, model.updateElement)
                        }else{
                            me.value.elements[model.selectedElement.id] = Object.assign(me.value.elements[model.selectedElement.id], model.updateElement)
                        }
                        me.$EventBus.$emit('selectedElement', {selected: true, id: me.value.elements[model.selectedElement.id].elementView.id, value: me.value.elements[model.selectedElement.id]})
                        me.changedByMe = true
                    }
                }
            },
            onGenerationFinished(){
                this.done = true;
                this.chatListIndex = null;
                this.messageListIndex = null;
                if(this.autoScroll){
                    this.scrollToBottom();
                }
                // this.$emit("input", this.value);
                // this.$emit("change", this.value);
                
            },  
            debouncedGenerate(){
                _.debounce(function () {
                    this.generate()
                }, 5000)
            },
            generate(){
                var me = this
                me.autoScroll = true;
                me.scrollToBottom();
                var message = {
                    text: me.input.instruction,
                    type: "prompt"
                }
                me.chatList.push(message)
                me.input.aggregateRoot = {
                    name: null,
                    fieldDescriptors: ""
                }
                if(me.aggregateRootList){
                    me.input.aggregateRoot.name = me.aggregateRootList[0].name
                    me.aggregateRootList[0].aggregateRoot.fieldDescriptors.forEach(function (fieldDescriptor){
                        me.input.aggregateRoot.fieldDescriptors = me.input.aggregateRoot.fieldDescriptors + fieldDescriptor.className + " " + fieldDescriptor.name + "\n"
                    })
                }
                me.generator = new Generator(this);
                me.generator.generate();
                me.input.instruction = ""
            },
            openAutoModelingDialog(){
                this.chatList = []
                this.openAiMessageList = []
                this.chatList.push(this.dummyMessage)
                this.showAutoModelingDialog = true
            },
            openCommandViewer() {
                var me = this
                let dummyValue
                if(me.embedded){
                    me.esValue.elements[me.aggregateRootList[0].id].aggregateRoot.entities.elements = me.value.elements
                    me.esValue.elements[me.aggregateRootList[0].id].aggregateRoot.entities.relations = me.value.relations
                    dummyValue = me.esValue
                } else {
                    dummyValue = JSON.parse('{"elements":{"boundedContext_uid":{"_type":"org.uengine.modeling.model.BoundedContext","id":"boundedContext_uid","name":"BoundedContext","oldName":"BoundedContext","description":null,"author":"author","aggregates":[{"id":"aggregate_uid"}],"policies":[],"members":[],"views":[],"gitURL":null,"elementView":{"_type":"org.uengine.modeling.model.BoundedContext","id":"boundedContext_uid","x":497,"y":438,"width":350,"height":350,"style":"{}"},"hexagonalView":{"_type":"org.uengine.modeling.model.BoundedContextHexagonal","id":"boundedContext_uid","x":497,"y":438,"width":350,"height":350,"style":"{}"},"portGenerated":0,"tempId":"","templatePerElements":{},"preferredPlatform":"spring-boot","preferredPlatformConf":{},"rotateStatus":false},"aggregate_uid":{"_type":"org.uengine.modeling.model.Aggregate","id":"aggregate_uid","name":"Aggregate","oldName":"","namePlural":"aggregates","namePascalCase":"Aggregate","nameCamelCase":"aggregate","author":"author","description":null,"mirrorElement":null,"elementView":{"_type":"org.uengine.modeling.model.Aggregate","id":"aggregate_uid","x":502,"y":435,"width":100,"height":100,"style":"{}"},"hexagonalView":{"_type":"org.uengine.modeling.model.AggregateHexagonal","id":"aggregate_uid","width":150,"height":50,"style":"{}"},"boundedContext":{"id":"boundedContext_uid"},"aggregateRoot":{"_type":"org.uengine.modeling.model.AggregateRoot","fieldDescriptors":[{"_type":"org.uengine.model.FieldDescriptor","name":"id","className":"Long","nameCamelCase":"id","namePascalCase":"Id","isKey":true}],"entities":{"elements":{},"relations":{}},"operations":[]},"events":[],"commands":[],"visibility":"public","rotateStatus":false}},"relations":{},"version":3,"scm":{"tag":null,"org":null,"repo":null,"forkedOrg":null,"forkedRepo":null},"basePlatform":null,"basePlatformConf":{},"toppingPlatforms":[],"toppingPlatformsConf":{},"k8sValue":{"elements":{},"relations":{}}}')
                    dummyValue.elements["aggregate_uid"].aggregateRoot.entities.elements = me.value.elements
                    dummyValue.elements["aggregate_uid"].aggregateRoot.entities.relations = me.value.relations
                }
                me.codeGenValue = dummyValue
                me.openSeparatePanel()
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            unLoadEvent(event) {
                localStorage.removeItem('aggregateRoots_' + this.aggregateId)
                localStorage.removeItem('umlClass_'+this.aggregateId)
                
                if (this.leaveSite) {
                    return;
                }

                event.preventDefault();
                event.returnValue = '';
            },
            functionSelect(title) {
                var me = this
                if (title == 'Save to Server') {
                    me.saveComposition('save')
                } else if (title == 'Download model File') {
                    me.download()
                } else if (title == 'Share') {
                    me.openInviteUsers()
                }
            },
            inputValue(name) {
                // // console.log(name)
                var test = [
                    name
                ]
                return test
            },
            codeModalShow() {
                this.$modal.show('code-modal');
            },
            umlModalShow() {
                // console.log("open UML")
                this.$modal.show('uml-modal');
            },
            generateZip() {
                var me = this
                me.codeList.forEach(function (list) {
                    if (!list.file) {
                        //Array
                        // // console.log(list.children)
                        // // console.log(list.name)
                        me.reverse(list.children, list.name)
                    } else {
                        me.pathTmp.push({path: list.name, code: list.code})
                        // var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
                        // FileSaver.saveAs(blob, list.name);
                        // console.log(list.name)
                    }
                })

                // console.log(me.pathTmp)
                var zip = new JSZip();

                var parents = [];


                me.pathTmp.forEach(function (generateData) {
                    // if(typeof generateData == String) {
                    //     // zip.file(generateData.path,)
                    // }
                    if (generateData.path.includes('/')) {
                        parents.push(generateData.path.split('/')[0])
                    }
                    zip.file(generateData.path, generateData.code)
                })
                // zip.file("package.json", "...");
                // zip.file("lib/index.js", "...");
                // zip.file("test/index.html", "...");
                // zip.file("test/asserts/file.js", "...");
                // zip.file("test/asserts/generate.js", "...");
                parents.forEach(function (prefix) {
                    zip.folder(prefix).forEach(function (relativePath, file) {
                        // console.log("iterating over", relativePath);
                        // console.log(file)
                    });
                })

                zip.generateAsync({type: "blob"})
                    .then(function (content) {
                        // Force down of the Zip file
                        saveAs(content, "archive.zip");
                    });

            },
            reverse(item, path) {
                var me = this
                item.forEach(function (list) {
                    if (list.children) {
                        //폴더 생성하기
                        // console.log(list.name)
                        var tmpPath = path + '/' + list.name
                        // console.log(tmpPath)

                        me.reverse(list.children, tmpPath);
                    } else {
                        //파일생성하
                        // console.log(list.name)
                        if (list.code) {
                            me.pathTmp.push({path: path + '/' + list.name, code: list.code})
                            // console.log(me.pathTmp)
                        }
                        // else {
                        //     me.pathTmp.push(path+'/'+list.name+'/')
                        // }
                    }
                })
            },
            // makeFiles(List){
            //
            //
            // },
            codeModalhide() {
                this.$modal.hide('code-modal');
            },
            unselectedAll: function () {
                Object.values(this.value.elements).forEach(function (element) {
                    if(element != null) {
                        // !!ERROR 원본데이터에 선언할 필요 없는 변수
                        // element.selected = false
                    }
                })

                Object.values(this.value.relations).forEach(function (relation) {
                    if(relation != null) {
                        // !!ERROR
                        // relation.selected = false
                    }
                })
            },
            ajax: function (url, method, payload, successCallback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                // xhr.withCredentials = true;
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4 || xhr.status != 200) return;
                    successCallback(xhr.responseText);
                };
                xhr.send(JSON.stringify(payload));
            },
            connectshow: function () {
                var me = this
                if (me.show == true) {
                    me.show = false
                } else {
                    me.show = true
                }
            },
            restApiPush: function () {
                var me = this;
                me.$http.post(`${me.getProtocol()}api.${me.getTenantId()}/event/${me.projectName}`, me.value, {
                        responseType: "arraybuffer",
                        headers: {
                            'Content-Type': 'application/zip;'
                        }
                    }
                ).then(function (response) {
                    // console.log("Trying saving zip ...");
                    // console.log(response.data.length);
                    var blob = new Blob([response.data], {type: 'application/zip'});
                    // console.log(blob.size);
                    var fileName = me.projectName + ".zip";
                    saveAs(blob, fileName);
                    // console.log("saveBlob succeeded");
                })
            },
            //멀티
            syncOthers(elements) {
                var me = this
                let userId = this.userId
                let newVal = elements

                const body = {
                    newVal,
                    userId,
                };
                fetch('http://localhost:4000/paint', {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        'content-type': 'application/json',
                    },
                }).then(() => console.log("throw"));
            },
            //복사
            copy: function () {
                var me = this
                if (!me.drawer) {
                    me.tempValue = []
                    Object.values(me.value.elements).forEach(function (tmp, idx) {
                        if(tmp != null) {
                            if (tmp.selected == true) {
                                me.tempValue.push(tmp)
                            }
                        }
                    })
                    Object.values(me.value.relations).forEach(function (tmp, idx) {
                        if (tmp.selected == true) {
                            me.tempValue.push(tmp)
                        }
                    })
                    // this.syncOthers(tmp);
                }
            },
            b64toBlob: function (b64Data, contentType, sliceSize) {
                contentType = contentType || '';
                sliceSize = sliceSize || 512;

                var byteCharacters = atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob = new Blob(byteArrays, {type: contentType});
                return blob;
            },
            //붙여넣기
            paste: function () {
                var me = this
                if (!me.drawer) {
                    var temp = JSON.parse(JSON.stringify(me.tempValue))

                    if (me.tempValue != null) {
                        temp.forEach(function (tmp, idx) {
                            tmp.elementView.id = me.uuid();
                            tmp.elementView.x = tmp.elementView.x + 10
                            tmp.elementView.y = tmp.elementView.y + 10
                            me.value.definition.push(tmp);
                            // me.redoArray.push(tmp);
                        })
                        // this.syncOthers(tmp);
                        //초기화
                    } else {
                    }
                }
            },
            download: function () {
                var me = this;
                var text = JSON.stringify(me.value);

                var filename = this.projectName + '.json';

                var file = new File([text], filename, {
                    type: "text/json;charset=utf-8"
                });
                FileSaver.saveAs(file);
            },
            deleteBoundary(definitionArray, deleteItem) {

                //해당 바운더리 찾기
                definitionArray.forEach(function (definitionTmp, index) {
                    if (deleteItem.boundedContext == definitionTmp.inputText && definitionTmp._type == 'org.uengine.uml.model.bounded') {
                        // console.log(deleteItem.boundedContext, definitionTmp.inputText)

                        definitionTmp.dataList.forEach(function (item, idx) {
                            if (item.inputText == deleteItem.inputText && item._type == deleteItem._type) {
                                // console.log(definitionTmp.dataList[idx])
                                definitionTmp.dataList[idx] = null;

                                definitionTmp.dataList = definitionTmp.dataList.filter(n => n)
                            }
                        })
                    }
                })
            },
            deleteActivity: function () {
                var me = this
                if (!me.drawer) {
                    let selected = []

                    let definitionArray = JSON.parse(JSON.stringify(me.value.definition));
                    let relationArray = JSON.parse(JSON.stringify(me.value.relation));

                    definitionArray.forEach(function (definitionTmp, index) {
                        if (definitionTmp.selected) {
                            if (definitionTmp.boundedContext) {
                                me.deleteBoundary(definitionArray, definitionTmp);

                            }
                            selected.push(definitionTmp.elementView.id)
                            definitionArray[index] = null
                        }
                    })

                    definitionArray = definitionArray.filter(n => n)


                    selected.forEach(function (selectedTmp,idx) {
                        relationArray.forEach(function (relation, index) {
                            if (relation.to == selectedTmp || relation.from == selectedTmp) {
                                relationArray[index] = null
                            }
                        })
                    })

                    relationArray = relationArray.filter(n => n)
                    relationArray.forEach(function (relationTmp, index) {
                        if (relationTmp.selected) {
                            relationArray[index] = null
                        }
                    })
                    relationArray = relationArray.filter(n => n)

                    me.value.definition = definitionArray
                    me.value.relation = relationArray
                    // this.syncOthers();
                }
            },
            toggleGrip: function () {
                this.dragPageMovable = !this.dragPageMovable;

                if (this.dragPageMovable) {
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else {
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            bindEvents: function (opengraph) {
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
                this.canvas = opengraph.canvas;
                
                // 이벤트 리스너 설정을 위한 함수 호출
                me.setupEventListeners(opengraph, canvasEl);

                //아이콘 드래그 드랍 이벤트 등록
                $(el).find('.draggable').draggable({
                    start: function () {
                        canvasEl.data('DRAG_SHAPE', {
                            'component': $(this).attr('_component'),
                            'width': $(this).attr('_width'),
                            'height': $(this).attr('_height'),
                            'label': $(this).attr('_label'),
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

                            dropX = dropX / opengraph.scale;
                            dropY = dropY / opengraph.scale;

                            componentInfo = {
                                component: componentInfo.component,
                                x: dropX,
                                y: dropY,
                                width: parseInt(componentInfo.width, 10),
                                height: parseInt(componentInfo.height, 10),
                                label: componentInfo.label,
                                name: componentInfo.label + Math.floor((1 + Math.random()) * 0x100)
                            }
                            // me.openClassNameDialog(componentInfo);
                            me.addElement(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            onConnectShape: function (edge, from, to) {
                var me = this;
                // // console.log(edge)
                //존재하는 릴레이션인 경우 (뷰 컴포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
                //=> 바뀌어야 함.
                //신규 릴레이션인 경우에는 릴레이션 생성
                var edgeElement, originalData;
                var isComponent = false;
                if (edge.shape) {
                    edgeElement = edge;
                } else {
                    isComponent = true;
                    edgeElement = edge.element;
                }

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var componentInfo = {
                        component: 'uml-class-relation',
                        sourceElement: from.$parent.value,
                        targetElement: to.$parent.value,
                        vertices: vertices,
                        isFilled: true,
                        relationView: {
                            style: JSON.stringify({}),
                            value: vertices,
                        },
                        type: 'Association'
                    }

                    from.$parent.value.elementView.id = from.id;
                    to.$parent.value.elementView.id = to.id;

                    if (isComponent) {
                        me.canvas.removeShape(edgeElement, true);
                        //this.removeComponentByOpenGraphComponentId(edgeElement.id);
                        //기존 컴포넌트가 있는 경우 originalData 와 함께 생성
                        if(originalData){
                            this.addElement(componentInfo, null, JSON.parse(JSON.stringify(originalData)));
                        } else {
                            this.addElement(componentInfo, null);
                        }
                    } else {
                        me.canvas.removeShape(edgeElement, true);
                        //기존 컴포넌트가 없는 경우 신규 생성
                        this.addElement(componentInfo);
                    }
                    // this.syncOthers();
                }
            },
            // undoRedo: function (cmd) {
            //     var me = this
            //     if (!me.drawer) {
            //         if (cmd == 'redo') {
            //             if (me.undoRedoIndex < me.undoRedoArray.length - 1) {
            //                 me.undoRedoIndex = me.undoRedoIndex + 1
            //                 me.value = JSON.parse(JSON.stringify(me.undoRedoArray[me.undoRedoIndex]));
            //             } else {
            //                 me.text = "Last element"
            //                 me.snackbar = true
            //                 me.timeout = 500
            //             }
            //         } else if (cmd == 'undo') {
            //             if (me.undoRedoIndex > 0) {
            //                 me.undoRedoIndex = me.undoRedoIndex - 1
            //                 me.value = JSON.parse(JSON.stringify(me.undoRedoArray[me.undoRedoIndex]));
            //             } else {
            //                 me.text = "Last Element"
            //                 me.snackbar = true
            //                 me.timeout = 500
            //             }
            //         }
            //     }

            // },
            addElement: function (componentInfo, isAggRoot) {
                var me = this;
                let vueComponent = me.getComponentByName(componentInfo.component);
                if (!vueComponent) return
                
                let element;
                if (componentInfo.component == 'uml-class-relation') {
                    if(componentInfo.targetElement.isInterface) {
                        vueComponent = me.getComponentByName('uml-realization-relation')
                    }
                    var targetMultiplicity = componentInfo.type.includes('Aggregation') ? "1..n": "1"
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.sourceElement,
                        componentInfo.targetElement,
                        componentInfo.vertices,
                        componentInfo.type,
                        targetMultiplicity
                    );
                    element.name = changeCase.camelCase(componentInfo.name)

                } else if(componentInfo.component == 'uml-class-group') {
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height,
                        componentInfo.label
                    );

                } else if(componentInfo.component == 'uml-class-definition' || componentInfo.component.includes('uml-vo-class')) {    
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height
                    );

                } else if(componentInfo.component.includes('line')) {
                    var vertices = [[componentInfo.x, componentInfo.y], [componentInfo.x + 200, componentInfo.y]]
                    vertices = JSON.stringify(vertices)

                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        vertices
                    );
                } else {
                    element = vueComponent.computed.createNew(
                        this.uuid(),
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height
                    );
                }

                if (componentInfo.name) element.name = componentInfo.name
                if(!me.embedded && !me.value) me.value = { 'elements': {}, 'relations': {} }
                
                me.addElementAction(element)

                // if(!isAggRoot) {
                //     me.addElementPush(me.value, element)

                //     // new UndoRedo
                //     if (me.undoRedoIndex != me.currentIndex) {
                //         //undoRedo 했을때
                //         //삭제후
                //         me.undoRedoArray.splice(me.undoRedoIndex + 1, me.currentIndex - me.undoRedoIndex);
                //         me.undoRedoIndex = me.undoRedoIndex + 1
                //         me.currentIndex = me.undoRedoIndex
                //     } else {
                //         me.undoRedoIndex = me.undoRedoIndex + 1
                //     }
                //     me.undoRedoArray.push(JSON.parse(JSON.stringify(me.value)));
                //     me.currentIndex = me.undoRedoArray.length - 1
                // } else {
                //     var location = element.elementView ? me.value.elements : me.value.relations
                //     var eleId = element.elementView ? element.elementView.id : element.relationView.id

                //     if (!Object.keys(location).includes(eleId)) {
                //         me.$set(location, eleId, element)
                //     }
                // }

                return element;
            },
            clearModelValue(){
                var me = this
                me.value.elements = {}
                me.eleCnt = 0
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                $.each(window.Vue.classModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
            changeCategory(key) {
                // console.log(key)
                var me = this
                if (me.selectedCategoryIndex == key)
                    me.selectedCategoryIndex = null;
                else
                    me.selectedCategoryIndex = key
            },
            toolStyle(cardIndex, categoryIndex, cardLength) {
                var me = this
                var angle = (cardIndex - categoryIndex / 10) * 40 / (cardLength + 1) - 10;
                var angle2 = cardIndex * 10 / cardLength - 3;
                var radians = (Math.PI / 180) * angle;

                var curvedX = Math.cos(radians) * 500 - 500;
                var curvedY = Math.sin(radians) * 700 + categoryIndex * 10 + 50;

                return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg);`;
            },
            addAggregateRootClass(aggregateRoots) {
                var me = this

                if(!aggregateRoots || aggregateRoots == null || aggregateRoots == undefined) {
                    return 
                }
                
                aggregateRoots.forEach((item, idx) => {
                    var element
                    var componentInfo = {
                        'component': 'uml-class-definition',
                        'label': item.name,
                        'width': 200,
                        'height': 100,
                        'x': 350 + (idx * 400),
                        'y': 150,
                        'isNew': true,
                    }

                    if (me.value && me.value.elements && Object.values(me.value.elements).length > 0) {
                        Object.values(me.value.elements).forEach((el) => {
                            if(el) {
                                if (el._type.includes("ClassGroup")) {
                                    me.$delete(me.value.elements, el.elementView.id, el);
                                }
                                if (el.isAggregateRoot) {
                                    el.name = item.name
                                    el.fieldDescriptors = item.aggregateRoot.fieldDescriptors
                                    el.operations = item.aggregateRoot.operations
                                    el.isVO = false

                                    if(el.elementView.x == 350) {
                                        el.elementView.x = 350 + (idx * 400)
                                    }
                                    componentInfo.isNew = false
                                    element = el;
                                }
                            }
                        })
                    } else {
                        me.$set(me.value, 'elements', {})
                        me.$set(me.value, 'relations', {})
                    }

                    if(componentInfo.isNew && !element) {
                        componentInfo.height = 80
                            + (item.aggregateRoot.fieldDescriptors.length * 20)
                            + (item.aggregateRoot.operations.length * 20)
                        element = me.addElement(componentInfo)
                        element.fieldDescriptors = item.aggregateRoot.fieldDescriptors
                        element.operations = item.aggregateRoot.operations
                        element.isAggregateRoot = true
                        element.isVO = false
                        element.parentId = item.id
                        element.name = item.name

                    } else if (!componentInfo.isNew && element) {
                        element.parentId = item.id
                        element.fieldDescriptors = item.aggregateRoot.fieldDescriptors
                        element.operations = item.aggregateRoot.operations
                        element.isAggregateRoot = true
                        element.isVO = false
                        element.parentId = item.id
                        element.name = item.name
                    }

                    if (element && element.isAggregateRoot) {
                        me.setAggregateField(element)
                    }
                })
            },
            setAggregateField(element) {
                if(!element) {
                    return
                }
                
                var me = this;
                var typeList = ['Integer', 'String', 'Boolean', 'Float', 'Double', 'Long', 'Date'];
                var componentInfo = {
                    'component': 'uml-vo-class',
                    'x': element.elementView.x,
                    'y': element.elementView.y,
                    'width': 200,
                    'height': 100,
                };

                element.fieldDescriptors.forEach((attr) => {
                    if (typeList.includes(attr.className)) {
                        return
                    }

                    var elements = Object.values(me.value.elements);
                    var target = elements.find((el) => {
                        if (el) {
                            var className = attr.className;
                            if (className && className.includes("List")) {
                                className = className.replace(/List</gi, "").replace(/>/gi, "");
                            }
                            return className === el.name
                        }
                    });

                    if ((elements.length > 0 && !target) || elements.length == 0) {
                        var className = attr.className;
                        if(className){
                            className = className.includes("List") ? className.replace(/List</gi, "").replace(/>/gi, "") : className;
                        }

                        if (me.elementTypes[1].some(ele => ele.label == className)) {
                            attr.isVO = true;
                        }

                        if(attr.isVO) {
                            componentInfo.x += Math.floor(Math.random()*200)
                            componentInfo.y += Math.floor(Math.random()*150)

                            let voInfo = null;
                            if (me.elementTypes[1].some(ele => ele.label == className)) {
                                voInfo = me.elementTypes[1].find(ele => ele.label == className);
                                componentInfo.component = voInfo.component;
                            }

                            target = me.addElement(componentInfo);
                            target.name = className;
                            target.namePascalCase = changeCase.pascalCase(className);
                            target.nameCamelCase = changeCase.camelCase(className);
                            target.isVO = true;
                            target.isAggregateRoot = false;

                            if (attr.referenceClass) {
                                target.referenceClass = attr.referenceClass;
                            }

                            if (voInfo === null) {
                                target.fieldDescriptors = [{
                                    "_type": "org.uengine.uml.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "isKey": false,
                                        "isVO": false,
                                        "namePascalCase": "Id",
                                        "nameCamelCase": "id",
                                        "label": "- id: Long",
                                        "classId": null
                                }]
                            }

                            me.setRelations(element, target, attr.name)

                        } else if (!attr.isVO && 
                                (attr.hasOwnProperty("items") || attr.hasOwnProperty("enumerationValues"))
                        ) {
                            componentInfo.component = 'enum-class-definition'
                            componentInfo.x += Math.floor(Math.random()*200)
                            componentInfo.y += Math.floor(Math.random()*150)
                            
                            var target = me.addElement(componentInfo)
                            target.name = attr.namePascalCase
                            target.namePascalCase = attr.namePascalCase
                            target.nameCamelCase = attr.nameCamelCase
                            target.isVO = false
                            target.isAggregateRoot = false
                            target.items = []

                            if (attr.enumerationValues && attr.enumerationValues.length > 0) {
                                console.log(attr.enumerationValues)
                            } else if (attr.items && attr.items.length > 0) {
                                target.items = attr.items
                            }

                            me.setRelations(element, target, attr.name)
                        }
                        
                    } else if (target) {
                        attr.isVO = target.isVO
                        attr.className = target.name
                        attr.classId = target.id ? target.id : target.elementView.id
                        attr.referenceClass = target.referenceClass

                        me.setRelations(element, target, attr.name)
                    }
                    
                })
            },
            setRelations(source, target, relationName) {
                var me = this;
                var isNew = true;
                var vertices = [[source.elementView.x, source.elementView.y], [target.elementView.x, target.elementView.y]]
                var relationInfo = {
                    component: 'uml-class-relation',
                    sourceElement: source,
                    targetElement: target,
                    type: 'Realization',
                    vertices: JSON.stringify(vertices),
                };

                if (target.isVO) {
                    relationInfo.type = "Association"
                }

                Object.values(me.value.relations).forEach(function(item, idx) {
                    if(item) {
                        if(item.sourceElement.elementView.id == source.elementView.id && 
                                item.targetElement.elementView.id == target.elementView.id &&
                                item.name == relationName
                        ) {
                            isNew = false;
                            item.name = relationName;
                        }
                    }
                })
                if(isNew) {
                    var relation = me.addElement(relationInfo)
                    relation.name = relationName
                }
                
            },

            openClassNameDialog(componentInfo, cloneInfo) {
                this.newClassCompInfo = componentInfo;
                this.newClassCompInfo.name = "";
                
                if (cloneInfo) {
                    this.cloneValues = cloneInfo
                }

                this.classNameDialog = true;
            },
            addClassElement() {
                if (this.cloneValues) {
                    this.newClassCompInfo.name = changeCase.pascalCase(this.newClassCompInfo.name)
                    var element = this.addElement(
                        this.newClassCompInfo, 
                        this.cloneValues.sourceValue.isAggregateRoot
                    )
                    this.customConnectShape(
                        this.cloneValues.edgeElement,
                        this.cloneValues.sourceValue,
                        element,
                        this.cloneValues.relationType
                    )
                } else {
                    this.addElement(this.newClassCompInfo)
                }

                this.cloneValues = {};
                this.newClassCompInfo = {};
                this.classNameDialog = false;
            },
            customConnectShape: function (edge, fromValue, toValue, type) {
                var me = this;

                if (edge && fromValue && toValue) {
                    var edgeInfo = {
                        component: 'uml-class-relation',
                        sourceElement: fromValue,
                        targetElement: toValue,
                        type: type,
                        name: toValue.name
                    }

                    var vertices = '[' + edge.shape.geom.vertices.toString() + ']';

                    if(type == 'Generalization') {
                        var arr = [];
                        for(var i = edge.shape.geom.vertices.length-1; i >= 0; i--) {
                            arr.push(edge.shape.geom.vertices[i]);
                        }
                        vertices = '[' + arr.toString() + ']';

                        edgeInfo.sourceElement = toValue
                        edgeInfo.targetElement = fromValue
                        
                    } else if (type == 'Composition' || type == 'Aggregation') {
                        edgeInfo.name = pluralize(changeCase.camelCase(edgeInfo.name))
                    }

                    edgeInfo.vertices = vertices
                    me.addElement(edgeInfo, fromValue.isAggregateRoot)
                }
            },

            alignClassElement() {
                var me = this
                let edges = []
                let list = []

                if (Object.values(me.value.relations).length > 0) {
                    Object.values(me.value.relations).forEach((item) => {
                        if (item) {
                            if (item.relationType == "Generalization") {
                                edges.push({
                                    source: item.targetElement.elementView.id,
                                    target: item.sourceElement.elementView.id
                                })
                            } else {
                                edges.push({
                                    source: item.sourceElement.elementView.id,
                                    target: item.targetElement.elementView.id
                                })
                            }
                        }
                    })

                    let result = digl(edges, { solitary: list })
                    let obj = {}
                    result.forEach((item, idx) => {
                        obj.groupIdx = idx
                        obj = me.setAlignResult(item, obj)
                    })
                }
            },
            setAlignResult(group, obj) {
                var me = this

                group.forEach((item, idx) => {
                    if (typeof item != 'string') {
                        obj.yIdx = idx
                        const newObj = me.setAlignResult(item, obj)
                        obj = newObj

                    } else {
                        if (item && me.value.elements[item]) {
                            let elView = JSON.parse(JSON.stringify(me.value.elements[item].elementView))
                            
                            if (idx === 0 && obj.yIdx == 0 && obj.groupIdx === 0) {
                                elView.x = elView.width*1.5
                                elView.y = elView.height*1.5
    
                                obj._x = elView.x
                                obj._y = elView.y

                            } else if ( idx > 0 && obj.yIdx >= 0 && obj.groupIdx === 0 ) {
                                elView.x = obj.x + elView.width*2
                                elView.y = obj.y

                            } else if ( idx === 0 && obj.yIdx > 0 && obj.groupIdx === 0 ) {
                                elView.x = obj._x
                                elView.y = obj.y + elView.height*2

                            } else if ( idx === 0 && obj.yIdx === 0 && obj.groupIdx > 0 ) {
                                elView.x = obj.x + elView.width*2
                                elView.y = obj._y

                            } else if ( idx > 0 && obj.yIdx >= 0 && obj.groupIdx > 0 ) {
                                elView.x = obj.x + elView.width*2
                                elView.y = obj.y

                            } else if ( idx === 0 && obj.yIdx > 0 && obj.groupIdx > 0 ) {
                                elView.x = obj.x
                                elView.y = obj.y + elView.height*2

                            }
                            obj.x = elView.x
                            obj.y = elView.y

                            me.$set(me.value.elements[item], "elementView", elView)
                            me.$EventBus.$emit('isMovedElement', elView.id)

                            return obj
                        }
                    }
                })
                return obj
            },

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">

    .embedded {
        position: absolute;
        width: 100%;
        height: 90%;
        left: 0;
        right: 0;
        overflow: hidden;
    }

    .canvas-panel {
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        position: absolute;
        overflow: hidden;

        .fullcanvas {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
        }

        .fullcanvashands {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 10%;
            left: 0;
            overflow: hidden;
            cursor: url('../../../../public/static/image/symbol/hands.png'), auto;
        }

        .tools {
            position: absolute;
            width: 48px;
            left: 20px;
            top: 20px;
            padding: 4px;
            overflow: hidden;

            .icons {
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .zoom {
            position: absolute;
            width: 42px;
            right: 20px;
            bottom: 120px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }

            .hands {
                font-size: 25px;
                margin-left: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
            }
        }

        .icons {
            cursor: pointer;
            font-size: 30px;

            &:hover {
                color: #ffc124;
            }
        }

        .hands {
            cursor: pointer;
            font-size: 30px;
            color: #ffc124;
        }

        .export,
        .history,
        .import,
        .save {
            position: absolute;
            padding: 8px;

            .icons {
                font-size: 25px;
                margin-left: 10px;
            }
        }

        .import {
            left: 80px;
            bottom: 20px;
        }

        .export {
            left: 180px;
            bottom: 20px;
        }

        .history {
            left: 280px;
            bottom: 20px;
        }
    }

    /* The whole thing */
    .custom-menu {
        display: none;
        z-index: 1000;
        position: absolute;
        overflow: hidden;
        border: 1px solid #CCC;
        white-space: nowrap;
        font-family: sans-serif;
        background: #FFF;
        color: #333;
        border-radius: 5px;
        padding: 0;
    }

    /* Each of the items in the list */
    .custom-menu li {
        padding: 8px 12px;
        cursor: pointer;
        list-style-type: none;
        transition: all 0.3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #DEF;
    }

    @media only screen and (max-width: 1030px) {
        .uml-btn-text {
            display:none;
        }
        .uml-btn {
            margin-top:10px !important;
            margin-right:-0px !important;
            max-width:20px !important;
            min-width:20px !important; 
        }
    }
</style>
