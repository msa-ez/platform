<template xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="canvas-panel">
        <!-- <v-overlay v-if="showOverlay">
            <v-col align="center">
                <div>{{ showOverlay }}</div>
                <v-progress-circular indeterminate size="64">
                    <v-btn text @click="closeOverlay()"></v-btn>
                </v-progress-circular>
            </v-col>
        </v-overlay> -->

        <v-layout right>
            <!-- <v-row >
                <v-layout v-if="id && id.indexOf('@') > -1">
                    <v-btn v-if="!isProduction" @click="markProduction" class="md-raised md-accent">
                        Mark Production (rev
                        {{id.substring(id.indexOf('@') + 1)}})
                    </v-btn>
                    <div v-else>
                        <v-btn class="md-primary">this is production (rev. {{id.substring(id.indexOf('@') + 1)}})</v-btn>
                    </div>
                </v-layout>
                
                <v-layout v-if="versions">
                    <v-btn class="md-primary" @click="loadVersions">latest version</v-btn>
                </v-layout>

                <v-list v-if="monitor" class="tree-list">
                    <bpmn-tree-list
                        :trees="trees">
                    </bpmn-tree-list>
                </v-list>
            </v-row> -->

            <opengraph
                    focus-canvas-on-select
                    wheelScalable
                    :dragPageMovable="dragPageMovable"
                    :enableContextmenu="false"
                    :enableRootContextmenu="false"
                    :enableHotkeyCtrlC="false"
                    :enableHotkeyCtrlV="false"
                    :enableHotkeyDelete="false"
                    :slider="false"
                    :movable="!monitor"
                    :resizable="!monitor"
                    :selectable="!monitor"
                    :connectable="!monitor"
                    :width="100000"
                    :imageBase="imageBase"
                    :height="100000"
                    v-if="value"
                    ref="bpmnOpengraph"
                    v-on:canvasReady="bindEvents"
                    v-on:connectShape="onConnectShape"
                    v-on:divideLane="onDivideLane"
            >
                <!--롤은 Lane 형식의 큰 틀-->
                <div v-for="roleId in Object.keys(value.elements)" :key="'role'+roleId">
                    <bpmn-role 
                            v-if="roleId && value.elements[roleId] && value.elements[roleId]._type == 'org.uengine.kernel.Role'" 
                            :value.sync="value.elements[roleId]"
                            :ref="roleId"
                    ></bpmn-role>
                </div>

                <!--액티비티는 각 활동 요소-->
                <div v-for="elementId in Object.keys(value.elements)" :key="elementId">
                    <!--component 로 지칭한 것은 뒤의 is 가 가르키는 컴포넌트 이름으로 뜸-->

                    <!--//TODO 여기의 status 를 http://localhost:8080/instance/1/variables 에서 얻어온 status 로 교체하여야 한다.-->
                    <!--ex) :status="???"-->
                    <!--그러기 위해서는 SvgGraph(데이터 불러오는 부분) 에서, definition 가져온 이후에, definition 안에 있는 childActivities 를 까서-->
                    <!--그 안에 tracingTag 가 동일한 것들에 대해 status 를 매핑시켜주어야 한다.-->
                    <component v-if="elementId && value.elements[elementId] != null" 
                            :is="getComponentByClassName(value.elements[elementId]._type)"
                            :value.sync="value.elements[elementId]" 
                            :definition="value"
                            :ref="elementId"
                    ></component>
                </div>

                <!--릴레이션은 액티비티간 연결선(흐름)-->
                <div v-for="relationId in Object.keys(value.relations)" :key="relationId">
                    <bpmn-message-flow 
                            v-if="relationId && value.relations[relationId] != null && value.relations[relationId]._type == 'org.uengine.kernel.bpmn.MessageFlow'" 
                            :value="value.relations[relationId]"
                            :definition="value"
                            :ref="relationId"
                    ></bpmn-message-flow>
                    <bpmn-relation 
                            v-else-if="relationId && value.relations[relationId] != null" 
                            :value="value.relations[relationId]"
                            :definition="value"
                            :ref="relationId"
                    ></bpmn-relation>
                </div>
            </opengraph>
            
            <div class="bpmn-mobile-btn" style="position: fixed; bottom:20px; right:20px; z-index:999;">
                <v-speed-dial
                    v-model="fab"
                    direction="top"
                    transition="slide-y-transition"
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
                    <v-menu offset-y
                        open-on-hover
                        left
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                text
                                style="margin-right: 15px; margin-top: 15px;"
                                color="primary"
                                dark
                                v-on="on"
                                @click="openDefinitionSettings"
                            >
                                <v-icon>settings</v-icon>
                                <div>Settings</div>
                            </v-btn>
                        </template>
                    </v-menu>

                    <v-menu offset-y
                        open-on-hover
                        left
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                text
                                style="margin-right: 15px; margin-top: 15px;"
                                color="orange"
                                dark
                                v-on="on"
                                @click="openProcessVariables"
                            >
                                <v-icon>sort_by_alpha</v-icon>
                                <div>Vars</div>
                            </v-btn>
                        </template>
                    </v-menu>
                    
                    <v-menu offset-y
                        open-on-hover
                        left
                        style="z-index:999 !important; position:relative;"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-if="readOnly"
                                style="margin-right: 5px; margin-top: 15px;"
                                color="primary"
                                @click="saveComposition('fork')"
                                text
                            >
                                <v-icon>{{icon.fork}}</v-icon>
                                <div>FORK</div>
                            </v-btn>
                            <v-btn
                                v-else
                                style="margin-right: 5px; margin-top: 15px;"
                                color="primary"
                                @click="saveComposition('save')"
                                v-on="on"
                                text
                            >
                                <v-icon>{{icon.save}}</v-icon>
                                <div>SAVE</div>
                            </v-btn>
                        </template>
                        <v-list v-if="!isClazzModeling">
                            <v-list-item
                                    v-for="item in saveItems" :key="item.title"
                                    @click="functionSelect(item.title)">
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <div v-if="isOwnModel && isServerModel && !readOnly">
                        <v-btn text
                                style="margin-right: 15px; margin-top: 15px;"
                                color="primary"
                                :disabled="!initLoad"
                                @click="openInviteUsers()">
                            <v-icon>{{icon.share}}</v-icon>
                            <div class="bpmn-btn-text">SHARE</div>
                            <v-avatar v-if="requestCount" 
                                    size="25" color="red"
                                    style="margin-left: 2px;"
                            >{{ requestCount }}</v-avatar>
                        </v-btn>
                    </div>

                    <div v-if="versions" style="margin-right: 10px;">
                        <v-select v-for="version in versions.slice().reverse()" 
                                :key="version"
                                v-on="on"
                                v-model="selectedVersion" 
                                @change="changeVersion" 
                                :value="version"
                                style="margin-top: 10px; margin-right: 15px; max-width: 150px;">
                            <v-chip v-if="productionVersionId == version.versionId">production</v-chip>
                        </v-select>
                    </div>

                    <div v-if="value" style="margin-right: 10px;">
                        <v-select class="bpmn-language-select"
                            v-model="selectedLocale" 
                            :items="languageItems" 
                            item-value="value" 
                            item-text="title"
                            @change="changeLocale" 
                            label="Language"
                            style="margin-top: 10px; margin-right: 15px; max-width: 150px;"
                        ></v-select>
                    </div>

                    <div>
                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn style="margin-right: 15px; margin-top: 15px;"
                                        color="primary"
                                        dark fab small
                                        v-on="on"
                                        @click="initiateProcess">
                                    <v-icon>play_arrow</v-icon>
                                </v-btn>
                            </template>
                        </v-menu>
                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn style="margin-right: 15px; margin-top: 15px;"
                                        color="orange"
                                        dark fab small
                                        v-on="on"
                                        @click="generatedefinition">
                                    <v-icon v-if="id && id.indexOf('@') == -1">save</v-icon>
                                    <v-icon v-else>history</v-icon>
                                </v-btn>
                            </template>
                        </v-menu>
                    </div>
                </v-speed-dial>
            </div>

            <v-flex style="justify:end; align:start;">
                <v-row class="gs-model-z-index-1" v-if="!monitor" justify="end" align="start" style="position: absolute; left: 50%; transform: translate(-50%, 0%); margin-top:0px;">
                    <v-text-field
                        style="margin-right: 10px; margin-top: 8px; max-width: 120px" 
                        label="Process Name"
                        v-model="projectName"
                    ></v-text-field>
                    
                    <!-- 웹페이지 버튼들 -->
                    <v-row class="bpmn-web-btn">
                        <div>
                            <v-menu offset-y
                                    open-on-hover
                                    left>
                                <template v-slot:activator="{ on }">
                                    <v-btn class="bpmn-btn"
                                        text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        color="primary"
                                        dark
                                        v-on="on"
                                        @click="openDefinitionSettings"
                                    >
                                        <v-icon>settings</v-icon>
                                        <div class="bpmn-btn-text">Settings</div>
                                    </v-btn>
                                </template>
                            </v-menu>

                            <v-menu offset-y
                                    open-on-hover
                                    left>
                                <template v-slot:activator="{ on }">
                                    <v-btn class="bpmn-btn"
                                        text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        color="orange"
                                        dark
                                        v-on="on"
                                        @click="openProcessVariables"
                                    >
                                        <v-icon>sort_by_alpha</v-icon>
                                        <div class="bpmn-btn-text">Vars</div>
                                    </v-btn>
                                </template>
                            </v-menu>
                            
                            <v-menu offset-y
                                    open-on-hover
                                    left>
                                <template v-slot:activator="{ on }">
                                    <v-btn class="bpmn-btn"
                                        v-if="readOnly"
                                        style="margin-right: 5px; margin-top: 15px;"
                                        color="primary"
                                        @click="saveComposition('fork')"
                                        text
                                    >
                                        <v-icon>{{icon.fork}}</v-icon>
                                        <div class="bpmn-btn-text">FORK</div>
                                    </v-btn>
                                    <v-btn class="bpmn-btn"
                                        v-else
                                        style="margin-right: 5px; margin-top: 15px;"
                                        color="primary"
                                        @click="saveComposition('save')"
                                        v-on="on"
                                        text
                                    >
                                        <v-icon>{{icon.save}}</v-icon>
                                        <div class="bpmn-btn-text">SAVE</div>
                                    </v-btn>
                                </template>
                                <v-list v-if="!isClazzModeling">
                                    <v-list-item
                                            v-for="item in saveItems" :key="item.title"
                                            @click="functionSelect(item.title)">
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                        <!-- 웹페이지 버튼들 끝 -->

                        <div v-if="isOwnModel && isServerModel && !isReadOnlyModel">
                            <v-btn text
                                    style="margin-right: 15px; margin-top: 15px;"
                                    color="primary"
                                    :disabled="!initLoad"
                                    @click="openInviteUsers()">
                                <v-icon>{{icon.share}}</v-icon>
                                <div class="bpmn-btn-text">SHARE</div>
                                <v-avatar v-if="requestCount" 
                                        size="25" color="red"
                                        style="margin-left: 2px;"
                                >{{ requestCount }}</v-avatar>
                            </v-btn>
                        </div>

                        <div v-if="versions" style="margin-right: 10px;">
                            <v-select v-for="version in versions.slice().reverse()" 
                                    :key="version"
                                    v-on="on"
                                    v-model="selectedVersion" 
                                    @change="changeVersion" 
                                    :value="version"
                                    style="margin-top: 10px; margin-right: 15px; max-width: 150px;">
                                <v-chip v-if="productionVersionId == version.versionId">production</v-chip>
                            </v-select>
                        </div>

                        <div v-if="value" style="margin-right: 10px;">
                            <v-select class="bpmn-language-select"
                                v-model="selectedLocale" 
                                :items="languageItems" 
                                item-value="value" 
                                item-text="title"
                                @change="changeLocale" 
                                label="Language"
                                style="margin-top: 10px; margin-right: 15px; max-width: 150px;"
                            ></v-select>
                        </div>

                        <div>
                            <v-menu offset-y
                                    open-on-hover
                                    left>
                                <template v-slot:activator="{ on }">
                                    <v-btn style="margin-right: 15px; margin-top: 15px;"
                                            color="primary"
                                            dark fab small
                                            v-on="on"
                                            @click="initiateProcess">
                                        <v-icon>play_arrow</v-icon>
                                    </v-btn>
                                </template>
                            </v-menu>
                            <v-menu offset-y
                                    open-on-hover
                                    left>
                                <template v-slot:activator="{ on }">
                                    <v-btn style="margin-right: 15px; margin-top: 15px;"
                                            color="orange"
                                            dark fab small
                                            v-on="on"
                                            @click="generatedefinition">
                                        <v-icon v-if="id && id.indexOf('@') == -1">save</v-icon>
                                        <v-icon v-else>history</v-icon>
                                    </v-btn>
                                </template>
                            </v-menu>
                        </div>
                    </v-row>
                </v-row>

                <v-row v-else justify="end" align="start" style="margin-right: 15px;">
                    <!--인스턴스 이름-->
                    <v-text-field style="margin-right: 10px; margin-top: 8px; max-width: 300px" 
                            v-model="instanceName"
                            label="Instance Name"
                            type="text"
                            readonly
                    ></v-text-field>
                    
                    <!-- 웹페이지 버튼들 -->
                    <div style="margin-right: 10px;">

                        <!--프로세스 변수-->
                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        id="instanceVariables" 
                                        color="primary"
                                        dark
                                        v-on="on"
                                        @click="openInstanceVariables">
                                    Variables
                                </v-btn>
                            </template>
                        </v-menu>                        
                        
                        <!--담당자 변경-->
                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        id="userPicker" 
                                        color="orange"
                                        dark
                                        v-on="on"
                                        @click="openUserPicker">
                                    Role Mappings
                                </v-btn>
                            </template>
                        </v-menu>

                    </div>
                    <!-- 웹페이지 버튼들 끝 -->

                    <div v-if="versions" style="margin-right: 10px;">
                        <v-select v-for="version in versions.slice().reverse()" 
                                :key="version"
                                v-on="on"
                                v-model="selectedVersion" 
                                @change="changeVersion" 
                                :value="version"
                                style="margin-top: 10px; margin-right: 15px; max-width: 150px;">
                            <v-chip v-if="productionVersionId == version.versionId">production</v-chip>
                        </v-select>
                    </div>

                    <bpmn-instance-variables
                            :id="instanceId"
                            :definition="value"
                            v-if="value"
                            ref="instanceVariables"
                    ></bpmn-instance-variables>
                    
                    <user-picker
                            :id="instanceId"
                            ref="userPicker"
                            :roles="roles"
                            v-if="value"
                            style="min-width: 70%;"
                    ></user-picker>

                </v-row>
            </v-flex>

            <v-card v-if="!monitor" class="tools" style="top:100px;">
                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <span class="bpmn-icon-hand-tool hands" 
                                _width="30" _height="30" 
                                v-bind:style="handsStyle" 
                                v-on="on"
                                @click="changeMultiple"
                        ></span>
                    </template>
                    <span>Drag On/Off</span>
                </v-tooltip>

                <v-tooltip right v-for="(item, idx) in dragItems" :key="idx">
                    <template v-slot:activator="{ on }">
                        <span class="icons draggable"
                                align="center"
                                :class="item.icon"
                                :_component="item.component"
                                :_width="item.width"
                                :_height="item.height"
                                v-on="on"
                        ></span>
                    </template>
                    <span>{{item.label}}</span>
                </v-tooltip>

                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <v-btn text small right @click.native="undo" v-on="on">
                            <v-icon medium>mdi-undo</v-icon>
                        </v-btn>
                    </template>
                    <span>Undo</span>
                </v-tooltip>
                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <v-btn text small right @click.native="redo" v-on="on">
                            <v-icon medium>mdi-redo</v-icon>
                        </v-btn>
                    </template>
                    <span>Redo</span>
                </v-tooltip>

            </v-card>

        </v-layout>

        <bpmn-component-changer
                v-if="value"
                :data="componentChangerData"
        ></bpmn-component-changer>

        <!-- v-dialog -->
        <!-- 프로세스 변수 -->
        <v-dialog
                v-model="processVariablesDialog"
                v-if="value"
                max-width="900">
            <v-card>
                <v-card-title>Process Variables</v-card-title>
                <v-card-text>
                    <bpmn-object-grid
                            v-model="value.processVariableDescriptors"
                            :full-fledged="true" 
                    ></bpmn-object-grid>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="closeProcessVariables">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 프로세스 정의 -->
        <v-dialog
                v-if="value"
                v-model="definitionSettings"
                ref="definitionSettings"
                max-width="320">
            <v-card>
                <v-card-title>Definition Settings</v-card-title>
                <v-card-text>
                    <v-form novalidate @submit.stop.prevent="submit">
                        <v-container>
                            <v-text-field 
                                    v-model="defintionSettings.shortDescription.text"
                                    label="Description"
                            ></v-text-field>
                            <v-text-field 
                                    v-model="instanceNamePattern"
                                    label="Instance Name Pattern"
                            ></v-text-field>
                        </v-container>

                        <v-switch
                                v-model="initiateByFirstWorkitem" 
                                id="my-test1" 
                                name="my-test1"
                                color="primary"
                                label="Initiate by event"
                        ></v-switch>
                        <v-switch 
                                v-model="volatile" 
                                id="my-test1" 
                                name="my-test1" 
                                color="primary"
                                label=" Volatile"
                        ></v-switch>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="closeDefinitionSettings">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    
        <!--Back to Here Menu Start -->
        <!-- Todo : contextMenuActivated를 이용하여 작업해야 함 -->
        <!-- <ul class='custom-menu' v-if="contextMenuActivated"> -->
        <ul class='custom-menu'>
            <li data-action="backToHere">Back To Here</li>
        </ul>
        <!--Back to Here Menu End -->


        <model-storage-dialog
                :condition="storageCondition"
                :showDialog="showStorageDialog"
                :isClazzModeling="isClazzModeling"
                @updateClassModelingId="updateClassModelingId"
                @save="saveModel"
                @fork="forkModel"
                @backup="backupModel"
                @close="storageDialogCancel"
        ></model-storage-dialog>

        <model-canvas-share-dialog
                v-model="inviteLists"
                :showDialog="inviteDialog"
                :checkPublic="showPublicModel"
                :canvas="canvas"
                canvasComponentName="bpmn-modeling-canvas"
                @all="invitePublic"
                @apply="applyInviteUsers"
                @close="closeInviteUsers"
                @add="addInviteUser"
                @remove="removeInviteUser"
        ></model-canvas-share-dialog>

        <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
    </div>
</template>
<script>
    import BpmnVue from "./bpmn";
    import ModelCanvas from "../modeling/ModelCanvas"
    import BpmnObjectGrid from "./BpmnObjectGrid";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import ModelCanvasShareDialog from "../modeling/ModelCanvasShareDialog";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [ModelCanvas],
        name: 'bpmn-modeling-canvas',
        components: {
            'bpmn-object-grid': BpmnObjectGrid,
            'model-storage-dialog': ModelStorageDialog,
            'model-canvas-share-dialog': ModelCanvasShareDialog,
        },
        props: {
            monitor: Boolean,
            backend: Object,
            instanceId: String,
            rootInstanceId: String,
        },
        data() {
            return {
                imageBase: `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/`,
                languageItems: [
                    {
                        title: 'Korea',
                        value: 'ko',
                    }, {
                        title: 'English',
                        value: 'en',
                    },],
                loaded: false,
                copyActivity: [],
                beforeTracing: [],
                afterTracing: [],
                contextMenuActivated: false,
                // definition: null,
                // projectName: null,
                instanceName: null,
                dialog: false,
                items: [],
                active: false,
                mode: 'editor',
                shapeMenu: false,
                // dragPageMovable: false,
                cursorStyle: null,
                handsStyle: null,
                versions: null, selectedVersion: null, isProduction: false, productionVersionId: null,
                dragItems: [
                    {
                        'icon': 'bpmn-icon-start-event-none',
                        'component': 'bpmn-start-event',
                        'label': 'Start Event',
                        'width': '30',
                        'height': '30'
                    },
                    {
                        'icon': 'bpmn-icon-intermediate-event-none',
                        'component': 'bpmn-intermediate-event',
                        'label': 'Intermediate Event',
                        'width': '30',
                        'height': '30'
                    },
                    {
                        'icon': 'bpmn-icon-end-event-none',
                        'component': 'bpmn-end-event',
                        'label': 'End Event',
                        'width': '30',
                        'height': '30'
                    },
                    {
                        'icon': 'bpmn-icon-gateway-xor',
                        'component': 'bpmn-exclusive-gateway',
                        'label': 'Gateway',
                        'width': '40',
                        'height': '40'
                    },
                    {
                        'icon': 'bpmn-icon-task',
                        'component': 'bpmn-task',
                        'label': 'Task',
                        'width': '100',
                        'height': '70'
                    },
                    {
                        'icon': 'bpmn-icon-subprocess-expanded',
                        'component': 'bpmn-subprocess',
                        'label': 'subprocess',
                        'width': '200',
                        'height': '150'
                    },
                    {
                        'icon': 'bpmn-icon-participant',
                        'component': 'bpmn-role',
                        'label': 'Role Lane',
                        'width': '400',
                        'height': '200'
                    }
                ],
                trees: [],
                bthTracingTag: "",
                

                // 기존 value
                selectedLocale: 'ko',
                changedByLocaleSelector: false,
                instanceNamePattern: '',
                initiateByFirstWorkitem: false,
                volatile: false,
                roles: null,

                // BpmnVue.vue data
                timerMap: {},
                enableHistoryAdd: false,
                processVariables: [],
                history: [],
                historyIndex: 0,
                undoing: false,
                undoed: false,
                id: null,
                propertyEditing: false,
                componentChangerData: null,
                preventEvent: false,
                preLocale: null,
                defintionSettings: {
                    shortDescription: {
                        text: ''
                    }
                },
                definitionSettings: false,
                processVariablesDialog: false,

                // ModelCanvas
                saveItems: [
                    {title: 'Save to Server'},
                    {title: 'Download model File'},
                    {title: 'Duplicate'},
                ],
                shareItems: [
                    {title: 'Share'},
                ],
            }
        },
        computed: {
            canUndo: function () {
                return this.historyIndex > 0
            },
            canRedo: function () {
                return this.history.length - 1 - this.historyIndex > 0
            },
            bpmnRole: function () {
                return 'bpmn-vue';
            },
        },

        created() {
            var me = this;
            try{
                Vue.use(BpmnVue);
                this.canvasType = 'bpmn'
                me.isQueueModel = false
                me.track()
                me.value = {
                    _type: 'org.uengine.kernel.ProcessDefinition',
                    elements: {},
                    relations: {},
                    processVariableDescriptors: []
                }
            } catch (e) {
                alert('Error: BpmnModelCanvas Created().', e)
            }

        },

        //컴포넌트가 Dom 에 등록되었을 떄(실제 렌더링 되기 위해 활성화 되었을 때.)
        mounted() {
            // this.monitor = true;
            $(document).keydown((evt) => {
                if (evt.keyCode == 67 && (evt.metaKey || evt.ctrlKey)) {
                    // this.copy();
                }
            });

            $(document).keydown((evt) => {
                if (evt.keyCode == 86 && (evt.ctrlKey || evt.metaKey)) {
                    // this.paste();
                }
            });

            $(document).keydown((evt) => {
                if (evt.keyCode == 46 || evt.keyCode == 8) {
                    // this.deleteActivity();
                }
            });

            var me = this;
            me.setMode();

            // If the menu element is clicked //TODO - vue js 방식으로 전환, IE - 9
            $(".custom-menu li").click(function () {
                // This is the triggered action name
                switch ($(this).attr("data-action")) {
                    // A case for each action. Your actions here
                    case "backToHere":
                        me.onBackToHere();
                        break;
                }
                // Hide it AFTER the action was triggered
                $(".custom-menu").hide(0);
            });

            // BpmnVue.vue mounted
            //timer start
            var startTime = Date.now();

            this.id = this.uuid();
            // this.value = this.validateDefinition(this.value);
            
            // 프로세스 정의 초기화
            var shortDescription = this.defintionSettings.shortDescription;
            if (!shortDescription) {
                shortDescription = new Object();
                shortDescription._type = 'org.uengine.contexts.TextContext';
                shortDescription.text = "";
            }

            // mount시 현재 locale 값으로 text 처리 - 프로세스 정의
            if (shortDescription.localedTexts && shortDescription.localedTexts[this.preLocale]) {
                shortDescription.text = shortDescription.localedTexts[this.preLocale];
            }
            this.defintionSettings = {
                shortDescription: shortDescription
            };

            // // mount시 현재 locale 값으로 text 처리 - 프로세스 변수
            var processVariables = this.value.processVariableDescriptors;
            if (processVariables && processVariables.length) {
                var copy = JSON.parse(JSON.stringify(processVariables));
                var me = this;
                $.each(copy, function (i, variable) {
                    if (variable.displayName) {
                        if (variable.displayName.localedTexts && variable.displayName.localedTexts[me.value._selectedLocale]) {
                            variable.displayName = variable.displayName.localedTexts[me.value._selectedLocale];
                            variable.displayName._type="org.uengine.contexts.TextContext"
                        } else {
                            variable.displayName = variable.displayName.text;
                            variable.displayName._type="org.uengine.contexts.TextContext"
                        }
                    }
                });
                this.processVariables = copy;
            }

            // this.history = [JSON.parse(JSON.stringify(this.value))];
            // this.$nextTick(function () {
            //     //$nextTick delays the callback function until Vue has updated the DOM
            //     // (which usually happens as a result of us changing the data
            //     //  so make any DOM changes here
            //     this.canvas._CONFIG.FAST_LOADING = false;
            //     // this.canvas.updateSlider();

            //     //timer end
            //     this.$refs.bpmnOpengraph.printTimer(startTime, new Date().getTime());

            //     this.$emit('update:loaded', true)
            // });
        },
        watch: {
            projectName: function (val) {
                this.value.name = {
                    "_type": "org.uengine.contexts.TextContext",
                    "text": val
                }
            },
            projectId: async function(val) {
                var me = this
                if(val) {
                    var projectData = await me.getObject(`localstorage://${val}_es`)
                    if(projectData) {
                        me.settingEventStormingData(projectData)

                        var modelForElements = projectData.value
                        modelForElements.Command.forEach(function(command) {
                            var commandId = command.elementView.id.replaceAll('-', '')
                            if(val == commandId) {
                                me.projectName = command.name
                            }
                        })
                    }
                }
            },
            instanceId: function (val) {
                this.setMode();
            },
            defintionSettings: {
                handler: function (newVal) {
                    if (!this.defintionSettings.shortDescription.localedTexts) {
                        this.defintionSettings.shortDescription.localedTexts = {
                            _type: 'java.util.HashMap'
                        };
                    }
                    this.defintionSettings.shortDescription.localedTexts[this.selectedLocale] = this.defintionSettings.shortDescription.text;
                },
                deep: true
            },
            processVariables: {
                handler: function (after, before) {
                    // console.log('processVariables update!!', after);
                    if (after && after.length) {
                        var me = this;
                        var processVariables = me.value.processVariableDescriptors;
                        var copy = JSON.parse(JSON.stringify(after));
                        $.each(copy, function (i, c) {
                            var localedTexts;
                            $.each(processVariables, function (j, p) {
                                if (c.name == p.name) {
                                    localedTexts = p.displayName.localedTexts;
                                }
                            });
                            if (!localedTexts) {
                                localedTexts = {
                                    _type: 'java.util.HashMap'
                                };
                            }
                            localedTexts[me.selectedLocale] = c.displayName;
                            c.displayName = {
                                text: c.displayName,
                                localedTexts: localedTexts,
                                _type: "org.uengine.contexts.TextContext"
                            }
                        });
                        me.value.processVariableDescriptors = copy;
                    }
                },
                deep: true
            },
            value: {
                deep: true,
                handler: 
                    _.debounce(function(newVal, oldVal) {
                        var me = this
                        if (newVal) {
                            me.$emit("input", newVal);
                            // me.$emit("change", newVal, this.projectName);

                            if (me.propertyEditing) {
                                me.enableHistoryAdd = false;
                                // console.log('definition updated while property panel open.');
                            } else {  // 그 외의 경우는 정해진 상황을 강제하여 히스토리에 저장한다.
                                if (me.enableHistoryAdd) {
                                    me.enableHistoryAdd = false;
                                } else {
                                    // if (this.preLocale != this.selectedLocale) {
                                    //     // locale change시 defintionSettings locale 변경
                                    //     if (this.defintionSettings.shortDescription.localedTexts[this.selectedLocale]) {
                                    //         this.defintionSettings.shortDescription.text = this.defintionSettings.shortDescription.localedTexts[this.selectedLocale];
                                    //     }
                                    //     // locale change시 processVariable locale 변경
                                    //     var copy = JSON.parse(JSON.stringify(newVal.processVariableDescriptors));
                                    //     $.each(copy, function (i, variable) {
                                    //         if (variable.displayName) {
                                    //             if (variable.displayName.localedTexts && variable.displayName.localedTexts[this.selectedLocale]) {
                                    //                 variable.displayName = variable.displayName.localedTexts[this.selectedLocale];
                                    //             } else {
                                    //                 variable.displayName = variable.displayName.text;
                                    //             }
                                    //         }
                                    //     });
                                    //     this.processVariables = copy;
                                    //     this.preLocale = this.selectedLocale;
                                    // }
                                    // console.log('definition updated, but not allow add history.');
                                    // return;
                                }
                            }
                            if (!me.undoing) {
                                // console.log('definition updated, we will add history.', newVal);
                                if (me.undoed) { //if undoed just before, clear the history from the current historyIndex
                                    me.history.splice(me.historyIndex, me.history.length - me.historyIndex);
                                    me.undoed = false;
                                }
                                me.history.push(JSON.parse(JSON.stringify(newVal))); //heavy
                                me.historyIndex = me.history.length - 1;
                            } else {
                                // console.log('definition updated, but triggered by undo,redo action. will skip add history.');
                                me.undoing = false;
                            }
                        }
                }, 1000)
            },
        },
        methods: {
            changeMultiple: function () {
                if (this.dragPageMovable == false && this.active == false) {
                    this.dragPageMovable = true;
                    this.active = true;
                    this.cursorStyle = 'cursor: url("/static/image/symbol/hands.png"), auto;';
                    this.handsStyle = ' color: #ffc124;';
                } else if (this.dragPageMovable == true && this.active == true) {
                    this.dragPageMovable = false;
                    this.active = false;
                    this.cursorStyle = null;
                    this.handsStyle = null;
                }
            },
            bindEvents: function (opengraph) {
                //this.$el
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
                            'height': $(this).attr('_height')
                        });
                    },
                    helper: 'clone',
                    appendTo: canvasEl
                });

                canvasEl.droppable({
                    drop: function (event, ui) {
                        var componentInfo = canvasEl.data('DRAG_SHAPE'), shape, element;
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
                                label: ''
                            }

                            me.addElement(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },
            copy: function () {
                var me = this;
                me.copyActivity = [];
                me.copySquenceFlow = [];
                Object.values(this.value.elements).forEach(function (activity) {
                    if (activity) {
                        if (activity.selected) {
                            me.copyActivity.push(activity);
                            me.beforeTracing = me.copyActivity.map(function (element) {
                                var returnTracingTag = element.tracingTag;
                                return returnTracingTag;
                            })
                        }
                    }
                });
                if (me.copyActivity.length > 0) {
                    me.$root.$children[0].success('Copied.');
                } else {
                    me.$root.$children[0].success('Not Selected');
                }
            },

            deleteActivity: function () {
                var me = this
                var deleteTracing = [];
                var bpmnVue = me.$children[0].$children[1].$children[3];
                var drawer = false;
                for (var j = 0; j < bpmnVue.$children[0].$children.length; j++) {
                    if (bpmnVue.$children[0].$children[j].drawer == true) {
                        drawer = true;
                    }
                }

                if (drawer == false) {
                    // console.log("Delete Activity")
                    var activities = Object.values(me.value.elements)
                    for (var i = 0; i < activities.length; i++) {
                        if (activities[i] != null) {
                            if (activities[i].selected == true) {
                                console.log(activities[i]);
                                deleteTracing.push(activities[i].tracingTag);
                                activities[i] = null;
                            }
                        }
                    }

                    var relations = Object.values(me.value.relations)
                    for (var y = 0; y < relations.length; y++) {
                        if (relations[y]) {
                            for (var x = 0; x < deleteTracing.length; x++) {
                                if (relations[y].sourceRef == deleteTracing[x]) {
                                    for (var z = 0; z < deleteTracing.length; z++) {
                                        if (relations[y].targetRef == deleteTracing[z]) {
                                            relations[y] = null
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                var relations = Object.values(me.value.relations)
                for (var z = 0; z < relations.length; z++) {
                    if (relations[z] != null) {
                        if (relations[z].selected == true) {
                            relations[z] = null;
                        }
                    }
                }

                // for (var x = 0; x < me.value.messageFlows.length; x++) {
                //     if (me.value.messageFlows[x] != null) {
                //         if (me.value.messageFlows[x].selected == true) {
                //             me.value.messageFlows[x] = null;
                //         }
                //     }
                // }

                // var tmp = me.value.sequenceFlows;
                // me.value.sequenceFlows = null;
                // me.value.sequenceFlows = tmp;
            },
            paste: function () {
                var me = this;
                var bpmnVue = me.$refs['bpmn-vue']
                var drawer = false;
                var newTracingTag = 0;

                for (var j = 0; j < bpmnVue.$children[0].$children.length; j++) {
                    if (bpmnVue.$children[0].$children[j].drawer == true) {
                        drawer = true;
                    }
                }
                if (drawer == false) {
                    me.afterTracing = [];

                    me.copyActivity.forEach(function (activity) {
                            var newAct = JSON.parse(JSON.stringify(activity));
                            var newActX = parseInt(activity.elementView.x + 20);
                            var newActY = parseInt(activity.elementView.y + 20);

                            newAct.tracingTag = bpmnVue.createNewTracingTag(me.value);
                            newAct.selected = false;
                            newAct.elementView.x = newActX;
                            newAct.elementView.y = newActY;
                            newAct.elementView.id = newAct.tracingTag;
                            me.afterTracing.push(newAct.tracingTag);
                            // me.value.childActivities[1].push(newAct);
                        }
                    );

                    Object.values(me.value.relations).forEach(function (element, index, array) {
                        if (element) {
                            var newFlow = JSON.parse(JSON.stringify(element));
                            for (var i = 0; i < me.beforeTracing.length; i++) {
                                if (newFlow.sourceRef == me.beforeTracing[i]) {
                                    for (var y = 0; y < me.beforeTracing.length; y++) {
                                        if (newFlow.targetRef == me.beforeTracing[y]) {
                                            newFlow.sourceRef = me.afterTracing[i];
                                            newFlow.targetRef = me.afterTracing[y];
                                            newFlow.relationView.value = '';
                                            // me.value.sequenceFlows.push(newFlow);
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            },
            //여기서는, 라우터에서 전달해준 monitor prop 를 가지고 디자이너 모드인지, 모니터 모드인지 판별함.
            setMode: function () {
                var me = this;
                me.loaded = false;
                me.$nextTick(function () {
                    if (me.monitor) {
                        me.getInstance();
                    } else {
                        me.getDefinition();
                    }
                });
            },

            getInstance: function () {
                var me = this;
                var instance = {};
                /** TODO: Instance 실행 정보 호출 */

                // me.backend.$bind("instance/" + me.instanceId, instance);
                // instance.$load().then(function (instance) {
                //     me.instanceName = instance.name;

                //     instance.definition.$load().then(function (definition) {
                //         definition.raw.$load().then(function (raw_definition) {
                //             var definition = raw_definition.definition;
                //             me.loadStatus(definition);
                //             me.treeStructure();
                //         });
                //     });
                // });
            },

            /** 
             * 버전 관리는 ModelCanvas쪽에서 하므로 제거
             * 
            */
            // loadVersions: function () {
                
            //     var me = this;
            //     var definition = {};
            //     me.backend.$bind("definition/" + me.id + '.json', definition);
            //     definition.$load().then(function (definition) {
            //         me.productionVersionId = definition.prodVerId;
            //         if (definition.versions) {
            //             definition.versions.$load().then(function (versions) {
            //                 if (versions && versions.length > 0) {
            //                     me.versions = versions;
            //                     me.selectedVersion = versions[versions.length - 1];
            //                 }
            //             });
            //         }
            //     });
            // },

            changeVersion: function () {
                window.open('#/definition/' + this.id + '@' + this.selectedVersion.versionId, '_blank');
            },

            /** 
             * 버전 관리는 ModelCanvas쪽에서 하므로 제거?
             * TODO: 활성화 버전 개념이 있어야 할 듯 - 스냅샷으로 사용?
             * 기본 ModelCanvas에서는 활성화 버전이 없으므로.
            */
            // markProduction: function () {
            //     var me = this;
            //     var version = {};
            //     me.backend.$bind("version/" + me.id.substring(me.id.indexOf('@') + 1), version);
            //     version.$load().then(function () {
            //         version.makeProduction.$create().then(
            //             function () {
            //                 me.$root.$children[0].success('설정되었습니다.');
            //                 me.isProduction = true;
            //             },
            //             function () {
            //                 me.$root.$children[0].error('저장할 수 없습니다.');
            //             }
            //         );
            //     });

            // },

            //트리 구조를 위해 subprocess가 있는지 확인한다.
            treeStructure: function () {
                var me = this;
                /**
                 * TODO: Instance 조회 시에 하위 인스턴스들 호출하는 내용으로 보임.
                 * 
                 */
                // var instance = {};
                // me.backend.$bind("instances/search/findChild?instId=" + me.rootInstanceId, instance);

                // var tree = [];
                // instance.$load().then(function (instances) {

                //     for (var i in instances) {
                //         if (instances[i] instanceof Object) {
                //             //hateoas에서는 self 링크에 자신의 id가 담겨있다.
                //             var selfLink = instances[i].$bind.self;
                //             var instId = selfLink.substring(selfLink.lastIndexOf("/") + 1, selfLink.length);
                //             tree[i] = {
                //                 "name": instances[i].defName,
                //                 "id": parseInt(instId),
                //                 "rootInstId": instances[i].rootInstId,
                //                 "mainInstId": instances[i].mainInstId,
                //                 "children": null
                //             };
                //         }
                //     }
                //     me.trees = me.listToTree(tree);
                // });
            },
            listToTree: function (list) {
                var map = {}, node, roots = [], i;
                for (i = 0; i < list.length; i += 1) {
                    map[list[i].id] = i;
                    list[i].children = [];
                }
                for (i = 0; i < list.length; i += 1) {
                    node = list[i];
                    if (i !== 0) {
                        list[map[node.mainInstId]].children.push(node);
                    } else {
                        roots.push(node);
                    }
                }
                return roots;
            },

            loadStatus: function (definition) {
                var me = this;
                me.$root.codi('instance{/id}/variables').get({id: me.instanceId})
                    .then(function (response) {
                        for (var key in response.data) {
                            var tracingTagAndPropName = key.split(":");

                            //set the instance data to each activities as '_instanceInfo' property (which is volatile!)
                            if (tracingTagAndPropName && tracingTagAndPropName.length > 1) {
                                var tracingTag = tracingTagAndPropName[0]
                                var propName = tracingTagAndPropName[1]

                                var activity = me.getActivity(tracingTag, definition);

                                if (activity) {
                                    if (!activity._instanceInfo)
                                        activity._instanceInfo = {};

                                    activity._instanceInfo[propName] = response.data[key];

                                    if ("_status" == propName) {
                                        activity.status = response.data[key];
                                    }
                                }
                            }
                        }
                        me.value = definition;
                        console.log({"definitionFilledWithInstanceInfo": me.value})
                    })
            },
            getActivity: function (tracingTag, definition) {
                var me = this;
                if (!definition) definition = me.value;

                for (var key in Object.keys(definition.elements)) {
                    if (definition.elements[key]["tracingTag"] == tracingTag) {
                        return definition.elements[key];
                    }
                }
            },
            updateElementStatus: function (elementId, status) {
                // var me = this;
                // let element = me.canvas.getElementById(elementId);
                // if (element) {
                //     element.shape.status = status;
                //     me.canvas.getRenderer().redrawShape(element);
                // }
            },
            getDefinition: function () {
                var me = this;
                me.selectedLocale = 'ko';
                me.changedByLocaleSelector = false;
                me.changeLocale();
                // this.loadVersions();
            },
            generatedefinition: function (nextAction) {
                // 제거 될 메서드

                var me = this;
                return new Promise(function (resolve) {
                    //각 액티비티, 롤, 시퀀스 플로우 중 빈 컴포넌트값을 거른다.
                    var definitionToSave = JSON.parse(JSON.stringify(me.value));

                    //request definition name if empty.
                    if (!me.projectName) {
                        return;
                    }

                    if (!me.id) {
                        me.id = me.projectName;
                    }

                    var nullFilter = function (array) {
                        return array.filter(function (x) {
                            if (x) {
                                return true;
                            } else {
                                return false;
                            }
                        });
                    }

                    var recursiveCheck = function (value) {
                        if (!value) {
                            return;
                        }
                        
                        if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                            // Object.values(value.elements) = nullFilter(Object.values(value.elements));
                            $.each(Object.values(value.elements), function (i, child) {
                                //롤 배정
                                if(child) {
                                    if (child._type == 'org.uengine.kernel.HumanActivity') {
                                        child.role.name =
                                            me.getWhereRoleAmIByTracingTag(child.tracingTag);
                                        console.log('HumanActivity ' + child.name.text + ' saved role as ' + child.role.name);
                                    }
                                    recursiveCheck(child);
                                }
                            
                            })
                        }
                    }
                    //액티비티, 릴레이션 널 체크, 휴먼 액티비티 롤 배정 (bpmn 패널을 더블클릭하면 배정되나, 안열어보고 배치한 것을 위해 설정)
                    recursiveCheck(definitionToSave, null);

                    // 프로세스 정의 처리

                    let definition = {};
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth() + 1;
                    const day = now.getDate();
                    const hours = now.getHours();
                    const minutes = now.getMinutes();
                    const seconds = now.getSeconds();
                    definition.date = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
                    definition.author = me.userInfo.email
                    definition.definition = definitionToSave;
                    console.log(definitionToSave)
                    resolve(definitionToSave)
                    // me.$http.post(`/definition/raw/${me.id}.json`, definition)
                })
            },
            async initiateProcess() {
                var me = this;
                me.saveComposition('save')
                me.$http.post(`/api/instance?defPath=${me.projectName}simulation=true`)
                // this.save(
                //     function () {
                //         var def = {};
                //         me.backend.$bind("definition/" + me.id + ".json", def);
                //         def.$load().then(function (definition) {
                //             definition.instantiation.$create(null, {"simulation": true}).then(function (instance) {
                //                 window.open('#/instance/' + instance.instanceId + '/' + instance.instanceId, '_blank');
                //             });
                //         });
                //     }
                // );
            },
            openInstanceVariables(ref) {
                this.$refs['instanceVariables'].openInstanceVariables();
            },
            openUserPicker(ref) {
                this.$refs['userPicker'].openUserPicker();
            },
            openMenu(event) {
                var me = this;
                //인스턴스일 경우에만 오른쪽 버튼 막기
                if (me.monitor) {
                    me.instanceOpenMenu(event);
                }
            },
            instanceOpenMenu(event) {
                event.preventDefault(); //오른쪽 버튼 막기
                var me = this;
                var activities = Object.keys(me.value.elements);
                var _type = "";
                var _status = "";
                var _faultMessage = "";
                for (var key in activities) {
                    if (me.value.elements[key].tracingTag == event.toElement.parentNode.id) {
                        _type = me.value.elements[key]._type;
                        _status = me.value.elements[key].status;
                        me.bthTracingTag = me.value.elements[key].tracingTag;
                        if (me.value.elements[key].faultMessage) {
                            _faultMessage = me.value.elements[key]._faultMessage;
                        }
                    }
                }
                _type = _type.substring(_type.lastIndexOf('.') + 1, _type.length); // 타입만 나오도록 수정

                //Activity일 경우에 오른쪽 버튼 이벤트 시작
                if (_type == 'Task' || _type == 'SendTask' || _type == 'ReceiveTask' || _type == 'UserTask' || _type == 'ManualTask' ||
                    _type == 'BusinessTask' || _type == 'ServiceTask' || _type == 'ScriptTask' || _type == 'HumanActivity' || _type == 'DefaultActivity') {
                    //Status가 Completed 일 경우에만 Back To Here 버튼 나오게 수정
                    if (_status == 'Completed') {
                        // Show contextmenu
                        $(".custom-menu").finish().show(0).// In the right position (the mouse)
                        css({
                            top: event.offsetY + "px",
                            left: event.offsetX + "px"
                        });
                    }
                }
            },
            closeMenu() {
                if (!$(event.target).parents(".custom-menu").length > 0) {
                    // Hide it
                    $(".custom-menu").hide(0);
                }
            },
            onBackToHere() {
                var me = this;
                /** TODO: Activity 뒤로 돌리는 것
                */
                var url = "instance/" + me.id + "/activity/" + me.bthTracingTag + "/backToHere";
                me.$http.post(url).then(function(result){
                    me.$root.$children[0].success('작업 내역을 선택한 위치로 되돌렸습니다.');
                    /** 메세지가 나오기 전에 바로 화면 refresh를 시도하는 것을 막기 위해
                        타이머를 설정하여 일정 시간이 지나면 화면을 refresh 한다.
                    */
                    setInterval(function () {
                        // router refresh
                        me.$router.go(me.$router.currentRoute);
                    }, 1500)
                })
                // me.backend.$bind(url, instance);
                // instance.$create().then(function () {
                //     me.$root.$children[0].success('작업 내역을 선택한 위치로 되돌렸습니다.');
                //     //메세지가 나오기 전에 바로 화면 refresh를 시도하는 것을 막기 위해
                //     //타이머를 설정하여 일정 시간이 지나면 화면을 refresh 한다.
                //     setInterval(function () {
                //         // router refresh
                //         me.$router.go(me.$router.currentRoute);
                //     }, 1500)
                // });
            },
            changeLocale() {
                var me = this;
                var elements = Object.values(me.value.elements)
                me.changedByLocaleSelector = true;
                if (elements) {
                    elements.forEach(function (element) {
                        if (element && element.name && element.name.localedTexts) {
                            if (element.name.localedTexts[me.selectedLocale]) {
                                element.name.text = element.name.localedTexts[me.selectedLocale];
                            }
                        }
                    });
                }
            },

            //  BpmnVue.vue methods
            openProcessVariables() {
                this.getClassVariables()
                this.processVariablesDialog = true
            },
            closeProcessVariables() {
                this.processVariablesDialog = false
            },
            openDefinitionSettings() {
                this.definitionSettings = true
            },
            closeDefinitionSettings() {
                this.definitionSettings = false
            },
            getRelativeFlowsByOpengraphId: function (id) {
                var me = this;
                var relations = [];
                var recursiveCheck = function (value) {
                    if (!value) {
                        return;
                    }
                    if (value.relations && Object.values(value.relations).length) {
                        $.each(Object.values(value.relations), function (i, relation) {
                            if (relation && (relation.sourceRef == id || relation.targetRef == id)) {
                                relations.push(relation);
                            }
                        })
                    }
                    if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                        $.each(Object.values(value.elements), function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                recursiveCheck(me.value);
                return relations;
            },

            /**
             * 오픈그래프 아이디로 액티비티 또는 릴레이션을 찾는다.
             **/
            getActAndRelByOpengraphId: function (id) {
                var me = this;
                var selected;
                var recursiveCheck = function (value) {
                    if (!value) {
                        return;
                    }
                    if (value.tracingTag && value.tracingTag == id) {
                        selected = value;
                    }
                    if (value.relations && Object.values(value.relations).length) {
                        $.each(Object.values(value.relations), function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = relation;
                            }
                        })
                    }
                    if (!selected) {
                        if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                            $.each(Object.values(value.elements), function (i, child) {
                                recursiveCheck(child);
                            })
                        }
                    }
                }
                recursiveCheck(me.value);
                return selected;
            },

            getWhereRoleAmIByTracingTag: function (id) {
                var me = this;
                var selected;
                var roleName = null;
                var element = me.canvas.getElementById(id);
                var frontestGroupElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(element));
                if (frontestGroupElement && me.canvas.getRenderer().isLane(frontestGroupElement)) {
                    roleName = frontestGroupElement.shape.label;
                }
                return roleName;
            },

            getWherePoolAmIByTracingTag: function (id) {
                var me = this;
                var selected;
                var poolName = null;
                var element = me.canvas.getElementById(id);
                var laneElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(element));

                if (!laneElement || !me.canvas.getRenderer().isLane(laneElement)) {
                    return null;
                }

                var poolElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(laneElement));

                if (poolElement && me.canvas.getRenderer().isLane(poolElement)) {
                    return poolElement.shape.label;
                } else {
                    return laneElement.shape.label;
                }

            },

            /**
             * 오픈그래프 아이디로 부모 서브프로세스를 찾는다. 부모가 데피니션일 경우 null 리턴.
             **/
            getParentActByOpengraphId: function (id) {
                var me = this;
                var selected;
                var recursiveCheck = function (value, parent) {
                    if (!value) {
                        return;
                    }
                    if (value.tracingTag == id) {
                        selected = parent;
                    }
                    if (value.relations && Object.values(value.relations).length) {
                        $.each(Object.values(value.relations), function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = parent;
                            }
                        })
                    }
                    if (!selected) {
                        if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                            $.each(Object.values(value.elements), function (i, child) {
                                recursiveCheck(child, value);
                            })
                        }
                    }
                }
                recursiveCheck(me.value, null);
                if (!selected || (selected._type && selected._type == 'org.uengine.kernel.ProcessDefinition')) {
                    return null;
                } else {
                    return selected;
                }
            },

            onBeforeDestroyElement: function (opengraphComponent, callback) {
                var id = opengraphComponent.id;

                //여기서 문제: 오픈그래프 객체를 제대로 삭제 안하면 이상해짐.
                //아마도 더블클릭은 먹히지만, shape 이 먹히지 않는걸로 보아,
                //drawshape 시에 id 를 재사용하여 그리는 방식에서 shape 가 동작을 잘 안하는 모양.
                //해당 코드를 봐서, shape 의 각종 메소드를 완전히 오버라이딩 하는 법을 찾자.
                //해결 => 오픈그래프 라이브러리 drawShape 에서, element node 에 shape 재등록을 실시함.

                var activityOrRelation = this.getActAndRelByOpengraphId(id);
                if (activityOrRelation) {
                    // console.log('onBeforeDestroyElement!!', id)
                    callback(false);
                }
            },

            addChild: function (child, parent, isRelation) {
                if (isRelation) {
                    if (child._type == "org.uengine.kernel.bpmn.MessageFlow") {
                        // this.value.messageFlows.push(child);
                    } else if (parent) {
                        // console.log('parent.tracingTag', parent.tracingTag);
                        if (!parent.sequenceFlows) {
                            parent.sequenceFlows = []
                        }
                        // parent.sequenceFlows.push(child);
                    } else {
                        // console.log('parent is root');
                        // this.value.sequenceFlows.push(child);
                    }
                } else {
                    if (parent) {
                        // console.log('parent.tracingTag', parent.tracingTag);
                        if (!parent.elements) {
                            parent.elements = {}
                        }
                        // parent.elements.push(child);
                    } else {
                        // console.log('parent is root');
                        // this.value.childActivities[1].push(child);
                    }
                }
            },

            /**
             * 주어진 액티비티를 이동시킨다.
             * targetTracingTag 이 없다면 데피니션으로 이동시킨다.
             **/
            moveActivity: function (sourceTracingTag, targetTracingTag) {
                var me = this;
                var parent;
                if (targetTracingTag) {
                    parent = me.getActAndRelByOpengraphId(targetTracingTag);
                }

                var activity = me.getActAndRelByOpengraphId(sourceTracingTag);
                var copy = JSON.parse(JSON.stringify(activity));

                // me.removeComponentByOpenGraphComponentId(sourceTracingTag);
                // this.addChild(copy, parent);
                //연결선 공식 만들기.

                var relations = this.getRelativeFlowsByOpengraphId(sourceTracingTag);
                $.each(relations, function (i, relation) {
                    var relationId = relation.sourceRef + '-' + relation.targetRef;
                    var relationCopy = JSON.parse(JSON.stringify(relation));
                    var relativeParent;
                    if (relation.sourceRef == sourceTracingTag) {
                        relativeParent = me.getParentActByOpengraphId(relation.targetRef);
                    } else {
                        relativeParent = me.getParentActByOpengraphId(relation.sourceRef);
                    }
                    console.log('relativeParent', relativeParent);

                    // me.removeComponentByOpenGraphComponentId(relationId);
                    var enableDraw = true;
                    if (!parent && relativeParent) {
                        enableDraw = false;
                    } else if (parent && !relativeParent) {
                        enableDraw = false;
                    } else if (parent && relativeParent && parent.tracingTag != relativeParent.tracingTag) {
                        enableDraw = false;
                    }

                    if (enableDraw) {
                        // me.addChild(relationCopy, null);
                    } else {
                        if (me.$root.$children[0] && me.$root.$children[0].snackbar) {
                            me.$root.$children[0].error('동일한 서브프로세스에 위치한 액티비티가 아닐 경우 연결할 수 없습니다.');
                        }
                    }
                });
                //움직인 activity 를 source, target 가지는 모든 릴레이션을 구함.
                //각 릴레이션의 상대 activity 를 구함.
                //parent 가 있다면, 상대 activity 의 parent 가 동일할 경우
                //기존 위치한 릴레이션을 삭제함.
                //parent 에 릴레이션을 넣음.

                //parent 가 없다면, 상대 activity 의 parent 도 없을 경우
                //기존 위치한 릴레이션 삭제함.
                //parent 에 릴레이션 넣음.

                //양쪽 경우 다, 상대 activity 의 parent 가 틀릴 경우 릴레이션 삭제.

                me.value = JSON.parse(JSON.stringify(me.value));

                //문제는, 외부를 그린 후 내부 에 의해 삭제되어버림.
                //액티비티에 삭제 방지를 걸고, 렌더링 후 삭제 방지를 푼다.
                //서브프로세스 내부는 삭제를 방지하기?? => No
                //이럴 경우 또 히스토리 조정에 따라 먹히지 않게 됨.
                //내부를 그린 후 외부에서 삭제되어도 마찬가지.
                //그럼, 삭제하기 전에, 데피니션에 트레이싱 태그가 있으면 삭제하지 않는걸로 하면 된다.
                //그러기 위해서, before remove 가 필요.
                console.log('moved!!', sourceTracingTag, targetTracingTag);
            },
            /**
             * 이 과정에서는 부모-자식 양방향 통신이 필요한 요소나,
             * watch 가 필요한 요소들이 null 로 인해 감지를 하지 못할 경우를 위해
             * 값을 채워넣는다.
             *
             * 값을 채우지 않고 null 이 흘러간다면, 뒤이은 컴포넌트에서 값을 업데이트하여도 Vue 라이프사이클은 이를 감지하지 못한다.
             **/
            validateDefinition: function (value) {
                var bpmnComponent, required, me = this;
                var definition = JSON.parse(JSON.stringify(value));

                bpmnComponent = me.getComponentByName('bpmn-role');
                // $.each(definition.roles, function (i, role) {
                //     required = bpmnComponent.default.computed.createNew();
                //     for (var key in required) {
                //         if (!role[key]) {
                //             role[key] = required[key];
                //         }
                //     }
                //     if (!role.elementView.style) {
                //         role.elementView.style = JSON.stringify({});
                //     }
                // })

                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    //액티비티일 경우
                    if (activity._type && activity._type != 'org.uengine.kernel.ProcessDefinition') {
                        bpmnComponent = me.getComponentByClassName(activity._type);
                        required = bpmnComponent.computed.createNew();
                        for (var key in required) {
                            if (!activity[key]) {
                                activity[key] = required[key];
                            }
                        }
                        if (!activity.elementView.style) {
                            activity.elementView.style = JSON.stringify({});
                        }
                    }

                    //시퀀스 플로우 필수값
                    if (activity.relations && Object.values(activity.relations).length) {
                        $.each(Object.values(activity.relations), function (i, relation) {
                            bpmnComponent = me.getComponentByName('bpmn-relation');
                            required = bpmnComponent.default.computed.createNew();
                            for (var key in required) {
                                if (!relation[key]) {
                                    relation[key] = required[key];
                                }
                            }
                            if (!relation.relationView.style) {
                                relation.relationView.style = JSON.stringify({});
                            }
                        })
                    }

                    if (activity.elements && Object.values(activity.elements) && Object.values(activity.elements).length) {
                        $.each(Object.values(activity.elements), function (i, child) {
                            recursiveCheck(child);
                        });
                    }
                }
                recursiveCheck(definition);

                //processVariableDescriptors 검증
                if (!definition.processVariableDescriptors) {
                    definition.processVariableDescriptors = [];
                }

                return definition;
            },
            /**
             * Lane 이 분기되었을 경우.
             **/
            onDivideLane: function (dividedLane) {
                var me = this;
                var boundary = dividedLane.shape.geom.getBoundary();
                var bpmnComponent = me.getComponentByName('bpmn-role');

                var additionalData = bpmnComponent.default.computed.createNew(
                    boundary.getCentroid().x,
                    boundary.getCentroid().y,
                    boundary.getWidth(),
                    boundary.getHeight(),
                    this.uuid()
                );

                // additionalData.elementView.id = dividedLane.id;
                additionalData.elementView.parent = me.canvas.getParent(dividedLane).id;

                // me.value.roles.push(additionalData);
                me.addElementPush(me.value, additionalData)
            },
            /**
             * 도형이 연결되었을 경우.
             **/
            onConnectShape: function (edge, from, to) {
                var me = this;
                //존재하는 릴레이션인 경우 (뷰 컴포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
                //=> 바뀌어야 함.
                //신규 릴레이션인 경우에는 릴레이션 생성
                var edgeElement, originalData;
                var isComponent = false;
                if (edge.shape) {
                    edgeElement = edge;
                }
                //  else {
                //     isComponent = true;
                //     edgeElement = edge.element;
                //     originalData = this.getActAndRelByOpengraphId(edgeElement.id);
                // }

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var componentInfo = {
                        component: "bpmn-relation",
                        from: from.$parent.value,
                        to: to.$parent.value,
                        vertices: vertices
                    }

                    // if (isComponent) {
                    //     me.canvas.removeShape(edgeElement, true);
                    //     this.removeComponentByOpenGraphComponentId(edgeElement.elementView.id);
                    //     //기존 컴포넌트가 있는 경우 originalData 와 함께 생성
                    //     this.addElement(componentInfo, null, JSON.parse(JSON.stringify(originalData)));
                    // } else {
                    me.canvas.removeShape(edgeElement, true);
                    //기존 컴포넌트가 없는 경우 신규 생성
                    this.addElement(componentInfo);
                    // }
                }
            },
            /**
             * 그래프 상에서 사용자 액션에 의한 변경사항 발생시
             **/
            onUserAction: function () {
                if (this.preventEvent) {
                    this.preventEvent = false;
                    // console.log('** onUserAction fired, but preventEvent!!');
                } else {
                    // console.log('** onUserAction fired.');
                    this.enableHistoryAdd = true;
                    //TODO 데피니션 업데이트 watch 를 강제 활성화시키는 더 좋은 방법 찾아보기.
                    // this.data.trigger = JSON.parse(JSON.stringify(this.data.trigger));
                }
            },
            /**
             * 캔버스 준비시
             **/
            bpmnReady: function (opengraph) {
                this.canvas = opengraph.canvas;
                this.canvas._CONFIG.FAST_LOADING = true;
                console.log('this.canvas._CONFIG.FAST_LOADING');
                this.$emit('bpmnReady', opengraph);
            },
            /**
             * 드랍이벤트, 컨트롤러를 통한 추가, 선연결 변경시
             * @param {Object} shapeInfo (shapeId,x,y,width,height,label)
             **/
            addElement: function (componentInfo, newTracingTag, originalData) {
                this.enableHistoryAdd = true;
                var me = this;
                var additionalData = {};

                //릴레이션 추가인 경우
                if (componentInfo.component == 'bpmn-relation') {
                    var fromParent = this.getParentActByOpengraphId(componentInfo.from.tracingTag);
                    var toParent = this.getParentActByOpengraphId(componentInfo.to.tracingTag);

                    // var fromAct = this.getActAndRelByOpengraphId(componentInfo.from.tracingTag);
                    // var toAct = this.getActAndRelByOpengraphId(componentInfo.to.tracingTag);

                    var fromPool = this.getWherePoolAmIByTracingTag(componentInfo.from.tracingTag)
                    var toPool = this.getWherePoolAmIByTracingTag(componentInfo.to.tracingTag)

                    // console.log({formRole: fromPool, toRole: toPool})

                    var relationComponentTag = (fromPool == toPool || toPool == null ? "bpmn-relation" : "bpmn-message-flow")

                    var bpmnComponent = me.getComponentByName(relationComponentTag);
                    additionalData = bpmnComponent.default.computed.createNew(
                        componentInfo.from,
                        componentInfo.to,
                        componentInfo.vertices,
                        this.uuid())
                    ;

                    if (originalData) {
                        for (var key in originalData) {
                            if (key != 'sourceRef' && key != 'targetRef' && key != 'relationView') {
                                additionalData[key] = originalData[key];
                            }
                        }
                    }

                    var enableDraw = true;
                    //서로 다른 서브프로세스 부모를 가진 경우는 연결을 추가하지 않는다.
                    if (fromParent && !toParent) {
                        enableDraw = false;
                    }
                    if (!fromParent && toParent) {
                        enableDraw = false;
                    }
                    if (fromParent && toParent && fromParent.tracingTag != toParent.tracingTag) {
                        enableDraw = false;
                    }
                    if (!enableDraw) {
                        if (me.$root.$children[0] && me.$root.$children[0].snackbar) {
                            me.$root.$children[0].error('동일한 서브프로세스에 위치한 액티비티가 아닐 경우 연결할 수 없습니다.');
                        }
                        console.log('Can not create relation between other subprocess.',
                            componentInfo.from,
                            componentInfo.to
                        );
                        return false;
                    }
                } else if (componentInfo.component == 'bpmn-role') {    // 롤 추가인 경우
                    var bpmnComponent = me.getComponentByName('bpmn-role');

                    additionalData = bpmnComponent.default.computed.createNew(
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height,
                        this.uuid()
                    );
                } else {    // 액티비티 추가인 경우
                    var bpmnComponent = me.getComponentByName(componentInfo.component);
                    if (!newTracingTag) {
                        newTracingTag = me.createNewTracingTag(me.value);
                    }
                    // console.log('newTracingTag', newTracingTag);

                    additionalData = bpmnComponent.default.computed.createNew(
                        newTracingTag,
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height,
                        this.uuid()
                    );
                }
                this.addElementPush(me.value, additionalData)

                return additionalData
            },

            /**
             * 자바 클래스로 Bpmn 컴포넌트를 가져온다.
             **/
            getComponentByClassName: function (className) {
                var componentByClassName;
                $.each(window.Vue.bpmnComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },

            /**
             * 컴포넌트 이름으로 Bpmn 컴포넌트를 가져온다.
             **/
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue.bpmnComponents, function (i, component) {
                    if (component.default.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },

            undo: function () {
                if (this.canUndo) {
                    this.canvas._CONFIG.FAST_LOADING = true;
                    this.historyIndex -= 1
                    this.undoing = true;
                    this.undoed = true;
                    this.value = this.history[this.historyIndex];
                    console.log('length: ' + this.history.length, ' historyIndex : ', this.historyIndex, this.value);
                    this.$nextTick(function () {
                        this.canvas._CONFIG.FAST_LOADING = false;
                        this.canvas.updateSlider();
                    })
                }
            },

            redo: function () {
                if (this.canRedo) {
                    this.canvas._CONFIG.FAST_LOADING = true;
                    this.historyIndex += 1
                    this.undoing = true;
                    this.undoed = true;
                    this.value = this.history[this.historyIndex]
                    console.log('length: ' + this.history.length, ' historyIndex : ', this.historyIndex, this.value);
                    this.$nextTick(function () {
                        this.canvas._CONFIG.FAST_LOADING = false;
                        this.canvas.updateSlider();
                    })
                }
            },

            /**
             * 새로운 트레이싱 태그를 생성한다.
             *
             * 기본으로 히스토리를 검색하며, 주어진 데피니션이 있을 경우 추가로 검색한다.
             **/
            createNewTracingTag: function (additionalDefinition) {
                var me = this; 
                var maxTracingTag = 0;
                var isInt = function (value) {
                    return !isNaN(value) &&
                        parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
                }
                var selected;
                var recursiveCheck = function (value) {
                    if (!value) {
                        return;
                    }
                    if (isInt(value.tracingTag) && value.tracingTag > maxTracingTag) {
                        maxTracingTag = parseInt(value.tracingTag);
                    }
                    if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                        $.each(Object.values(value.elements), function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                if (additionalDefinition) {
                    recursiveCheck(additionalDefinition);
                }
                //히스토리에 있는 데이터도 참조하여, 충돌되는 트레이싱 태그가 없도록 한다. (가장 큰 트레이싱 태그 +1)
                if (me.history && me.history.length) {
                    $.each(me.history, function (i, definition) {
                        recursiveCheck(definition);
                    })
                }
                return maxTracingTag + 1 + '';
            },

            /**
             * 데피니션에 트레이싱 태그가 있는지 확인한다.
             **/
            checkExistTracingTag: function (tracingTag) {
                var me = this, isExist = false;
                var recursiveCheck = function (value) {
                    if (!value) {
                        return;
                    }
                    if (value && value.tracingTag == tracingTag) {
                        isExist = true;
                    }
                    if (value.elements && Object.values(value.elements) && Object.values(value.elements).length) {
                        $.each(value.elements, function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                if (me.value) {
                    recursiveCheck(me.value);
                }
                return isExist;
            },

            /**
             * 오픈그래프 컴포넌트 아이디에 해당하는 Bpmn 컴포넌트를 삭제한다.
             **/
            removeComponentByOpenGraphComponentId: function (id) {
                var me = this;
                var recursiveRemove = function (activity) {
                    if (!activity) {
                        return;
                    }
                    //릴레이션 삭제
                    if (activity.relations && Object.values(activity.relations).length) {
                        $.each(Object.values(activity.relations), function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                // console.log('** remove sequenceFlow', id);
                                activity.relations[relation.relationView.id] = null;
                            }
                        });
                    }
                    //액티비티 삭제
                    if (activity.elements && Object.values(activity.elements) && Object.values(activity.elements).length) {
                        $.each(Object.values(activity.elements), function (i, child) {
                            // console.log('toRemove', child, id);
                            if (child && child.elementView && child.elementView.id == id) {
                                activity.elements[child.elementView.id] = null;
                            } else {
                                //재귀호출
                                recursiveRemove(child);
                            }
                        })
                    }
                }

                //릴레이션, 액티비티 삭제
                recursiveRemove(me.value);
            },

            /**
             * 무작위 랜덤 아이디 생성
             * @returns {string} 랜덤 아이디
             */
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },

            functionSelect(title) {
                var me = this
                if (title == 'Duplicate') {
                    me.saveComposition('duplicate')
                } else if (title == 'Download model File') {
                    me.downloadModelToJson()
                } else if (title == 'Save to Server') {
                    // 이곳에서 기초적인 Process Definition 정보 Setting
                    me.value.name = {
                        "_type": "org.uengine.contexts.TextContext",
                        "text": me.projectId
                    }
                    me.saveComposition('save')
                } else if (title == 'Share') {
                    me.openInviteUsers()
                }
            },

            getClassVariables() {
                var me = this;
                try {
                    //
                } catch (e) {
                    console.log(e)
                }
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

            settingEventStormingData(projectData) {
                var me = this
                var projectId = localStorage.getItem('projectId')
                
                me.value = {
                    _type: 'org.uengine.kernel.ProcessDefinition',
                    elements: {},
                    relations: {},
                    processVariableDescriptors: [],
                    esProjectId: projectData.projectId
                }
                
                var modelForElements = projectData.value

                var commandToEvent = modelForElements.Relation.filter(function(relation) {
                    var source = relation.sourceElement.elementView.id.replaceAll('-', '')
                    if(relation.sourceElement._type.endsWith("Command") &&
                        relation.targetElement._type.endsWith("Event") &&
                        source == projectId
                    ) {
                        return true
                    }
                })

                // pool (EventStorming project)
                var poolShape;
                var poolInfo = {
                    'icon': 'bpmn-icon-participant',
                    'component': 'bpmn-role',
                    'label': 'Role Lane',
                    'width': 850,
                    'height': commandToEvent.length * 100,
                    'x': 500 + Math.floor(Math.random()*200),
                    'y': 100 + Math.floor(Math.random()*150),
                }
                var poolElement = me.addElement(poolInfo)
                poolElement.name = projectData.projectName

                me.$nextTick(function() {
                    // lane
                    var shapeList = document.querySelectorAll('[_type="ROOT"]')
                    poolShape = shapeList[0].childNodes[0]
                    
                    if(poolShape) {
                        modelForElements.BoundedContext.forEach(function(bc, index) {
                            if(index > 0) {
                                me.canvas.getRenderer().divideLane(poolShape, 'QUARTER_LOW')
                            }
                        })
                    }
                    
                    var vertices, edgeInfo;

                    if(modelForElements.Relation && modelForElements.Relation.length > 0) {
                        // Commnad -> Event Relation
                        // start event (Commnad)
                        var startEventInfo = {
                            'icon': 'bpmn-icon-start-event-none',
                            'component': 'bpmn-start-event',
                            'label': 'Start Event',
                            'width': 30,
                            'height': 30,
                            'x': poolInfo.x - 350,
                            'y': poolInfo.height > 100 ? poolInfo.y - (commandToEvent.length-1)*50 : poolInfo.y 
                        }
                        var startEventElement = me.addElement(startEventInfo)
                        startEventElement.name = commandToEvent[0].sourceElement.name
                        me.settingLaneName(startEventElement, commandToEvent[0].sourceElement.boundedContext)
                        
                        // task (Commnad)
                        var cmdTaskInfo = {
                            'icon': 'bpmn-icon-task',
                            'component': 'bpmn-task',
                            'label': 'Task',
                            'width': 100,
                            'height': 70,
                            'x': startEventInfo.x + 150,
                            'y': startEventInfo.y
                        }
                        var cmdTaskElement = me.addElement(cmdTaskInfo)
                        cmdTaskElement.name = commandToEvent[0].sourceElement.name
                        // relation
                        vertices = [[startEventElement.elementView.x, startEventElement.elementView.y], [cmdTaskElement.elementView.x, cmdTaskElement.elementView.y]]
                        edgeInfo = {
                            component: 'bpmn-relation',
                            from: startEventElement,
                            to: cmdTaskElement,
                            vertices: JSON.stringify(vertices),
                            relationView: {
                                style: JSON.stringify({}),
                                value: JSON.stringify(vertices),
                            }
                        }
                        me.addElement(edgeInfo)

                        // intermediate event (Commnad -> Event)
                        var commnadEventInfo = {
                            'icon': 'bpmn-icon-intermediate-event-none',
                            'component': 'bpmn-intermediate-event',
                            'label': 'Intermediate Event',
                            'width': 30,
                            'height': 30,
                            'x': cmdTaskInfo.x + 150,
                        }
                        var commandEventList = []
                        commandToEvent.forEach(function(item, index) {
                            if(item.sourceElement.boundedContext.id == item.targetElement.boundedContext.id) {
                                commnadEventInfo.y = cmdTaskInfo.y + 100*index
                            } else {
                                commnadEventInfo.y = cmdTaskInfo.y + 100 + 100*index
                            }
                            var commandEventElement = me.addElement(commnadEventInfo)
                            commandEventElement.name = item.targetElement.name
                            commandEventElement._type = 'org.uengine.kernel.bpmn.SignalIntermediateThrowEvent'
                            commandEventList.push(commandEventElement)
                            me.settingLaneName(commandEventElement, item.targetElement.boundedContext)

                            // relation
                            vertices = [[cmdTaskElement.elementView.x, cmdTaskElement.elementView.y], [commandEventElement.elementView.x, commandEventElement.elementView.y]]
                            edgeInfo = {
                                component: 'bpmn-relation',
                                from: cmdTaskElement,
                                to: commandEventElement,
                                vertices: JSON.stringify(vertices),
                                relationView: {
                                    style: JSON.stringify({}),
                                    value: JSON.stringify(vertices),
                                }
                            }
                            me.addElement(edgeInfo)
                        })
                        
                        // Event -> Policy Relation
                        var eventToPolicy = modelForElements.Relation.filter(function(relation) {
                            if(relation.sourceElement._type.endsWith("Event") &&
                                relation.targetElement._type.endsWith("Policy")
                            ) {
                                var res = commandToEvent.some(function(ce) {
                                    if(ce.targetElement.name == relation.sourceElement.name) {
                                        return true
                                    }
                                })
                                return res
                            }
                        })
                        var policyEventInfo = {
                            'icon': 'bpmn-icon-intermediate-event-none',
                            'component': 'bpmn-intermediate-event',
                            'label': 'Intermediate Event',
                            'width': 30,
                            'height': 30,
                            'x': commnadEventInfo.x + 150
                        }
                        var policyEventList = []
                        eventToPolicy.forEach(function(item, index) {
                            commandEventList.forEach(function(event) {
                                if(event.name == item.sourceElement.name) {
                                    if(item.sourceElement.boundedContext.id != item.targetElement.boundedContext.id) {
                                        policyEventInfo.y = commnadEventInfo.y + 100 + 100*index
                                    } else {
                                        policyEventInfo.y = commnadEventInfo.y
                                    }
                                    vertices = [[event.elementView.x, event.elementView.y], [policyEventInfo.x, policyEventInfo.y]]
                                    edgeInfo = {
                                        component: 'bpmn-relation',
                                        from: event,
                                        vertices: JSON.stringify(vertices),
                                        relationView: {
                                            style: JSON.stringify({}),
                                            value: JSON.stringify(vertices),
                                        }
                                    }
                                    
                                }
                            })
                            // task (Policy)
                            var policyEventElement = me.addElement(policyEventInfo)
                            policyEventElement.name = item.targetElement.name
                            policyEventElement._type = 'org.uengine.kernel.bpmn.SignalIntermediateCatchEvent'
                            me.settingLaneName(policyEventElement, item.targetElement.boundedContext)
                            policyEventList.push(policyEventElement)
                            
                            // relation
                            edgeInfo.to = policyEventElement
                            me.addElement(edgeInfo)
                        })

                        // Policy -> Command
                        var policyToCommand = modelForElements.Relation.filter(function(relation) {
                            if(relation.sourceElement._type.endsWith("Policy") &&
                                relation.targetElement._type.endsWith("Command")
                            ) {
                                var res = eventToPolicy.some(function(ep) {
                                    if(ep.targetElement.name == relation.sourceElement.name) {
                                        return true
                                    }
                                })
                                return res
                            }
                        })
                        var cmdTaskList = []
                        cmdTaskInfo.x = policyEventInfo.x + 150
                        policyToCommand.forEach(function(item, index) {
                            policyEventList.forEach(function(event) {
                                if(item.sourceElement.name == event.name) {
                                    if(item.sourceElement.boundedContext.id != item.targetElement.boundedContext.id) {
                                        cmdTaskInfo.y = event.elementView.y + 100 + 100*index
                                    } else {
                                        cmdTaskInfo.y = event.elementView.y
                                    }
                                    // relation
                                    vertices = [[event.elementView.x, event.elementView.y], [cmdTaskInfo.x, cmdTaskInfo.y]]
                                    edgeInfo = {
                                        component: 'bpmn-relation',
                                        from: event,
                                        vertices: JSON.stringify(vertices),
                                        relationView: {
                                            style: JSON.stringify({}),
                                            value: JSON.stringify(vertices),
                                        }
                                    }
                                }
                            })
                            cmdTaskElement = me.addElement(cmdTaskInfo)
                            cmdTaskElement.name = item.targetElement.name
                            me.settingLaneName(cmdTaskElement, item.targetElement.boundedContext)
                            cmdTaskList.push(cmdTaskElement)

                            edgeInfo.to = cmdTaskElement
                            me.addElement(edgeInfo)
                        })
                        
                        // Command -> Event Relation
                        commandToEvent = modelForElements.Relation.filter(function(relation) {
                            var cmdId = relation.sourceElement.elementView.id.replaceAll('-', '')
                            if(relation.sourceElement._type.endsWith('Command') &&
                                relation.targetElement._type.endsWith("Event") &&
                                cmdId != projectId
                            ) {
                                var res = policyToCommand.some(function(pc) {
                                    if(pc.targetElement.name == relation.sourceElement.name) {
                                        return true
                                    }
                                })
                                return res
                            }
                        })
                        commnadEventInfo.x = cmdTaskInfo.x + 150
                        commandToEvent.forEach(function(item, index) {
                            cmdTaskList.forEach(function(task) {
                                if(item.sourceElement.name == task.name) {
                                    if(item.sourceElement.boundedContext.id != item.targetElement.boundedContext.id) {
                                        commnadEventInfo.y = task.elementView.y + 100 + 100*index
                                    } else {
                                        commnadEventInfo.y = task.elementView.y
                                    }
                                    // relation
                                    vertices = [[task.elementView.x, task.elementView.y], [commnadEventInfo.x, commnadEventInfo.y]]
                                    edgeInfo = {
                                        component: 'bpmn-relation',
                                        from: task,
                                        vertices: JSON.stringify(vertices),
                                        relationView: {
                                            style: JSON.stringify({}),
                                            value: JSON.stringify(vertices),
                                        }
                                    }
                                }
                            })
                            var commandEventElement = me.addElement(commnadEventInfo)
                            commandEventElement.name = item.targetElement.name
                            commandEventElement._type = 'org.uengine.kernel.bpmn.SignalIntermediateThrowEvent'
                            me.settingLaneName(commandEventElement, item.targetElement.boundedContext)
                            
                            edgeInfo.to = commandEventElement
                            me.addElement(edgeInfo)
                        })
                        
                    }
                    
                    localStorage.removeItem(projectId+'_es')
                })

            },
            settingLaneName(innerElement, boundedContext) {
                var me = this
                var laneName = ""
                Object.values(me.value.elements).forEach(function(element) {
                    if(element) {
                        if(element._type.endsWith('Role')) {
                            if(element.name == boundedContext.name) {
                                if(innerElement.elementView.y > element.elementView.y &&
                                    innerElement.elementView.y - element.elementView.y >= 100
                                ) {
                                    element.elementView.y += 50
                                    element.elementView.height += 100
                                    laneName = boundedContext.name
                                    return
                                }
                            }
                        }
                    }
                })

                if(laneName == "") {
                    Object.values(me.value.elements).forEach(function(element) {
                        if(element) {
                            if(element._type.endsWith('Role') && element.name == "") {
                                var outer = {
                                    x: element.elementView.x - element.elementView.width / 2,
                                    y: element.elementView.y - element.elementView.height / 2,
                                    width: element.elementView.width,
                                    height: element.elementView.height
                                }
                                var inner = {
                                    x: innerElement.elementView.x - innerElement.elementView.width / 2,
                                    y: innerElement.elementView.y - innerElement.elementView.height / 2,
                                    width: innerElement.elementView.width,
                                    height: innerElement.elementView.height
                                }
                                if (me._isAttached(outer, inner) && element.name == '') {
                                    element.name = boundedContext.name
                                }
                            }
                        }
                    })
                } else {
                    Object.values(me.value.elements).forEach(function(element) {
                        if(element) {
                            if(element._type.endsWith('Role')) {
                                if(element.name == "" && element.elementView.parent) {
                                    element.elementView.y += 100
                                } else if(element.name != "" && !element.elementView.parent) {
                                    element.elementView.y += 100
                                    element.elementView.height += 100
                                }
                            }
                        }
                    })
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .bpmn-mobile-btn {
        display:none;
    }
    .canvas-panel {
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        position: absolute;
        overflow: hidden;

        /*.fullcanvas {*/
        /*  position: absolute;*/
        /*  width: 100%;*/
        /*  height: 100%;*/
        /*  top: 10%;*/
        /*  left: 0px;*/
        /*  overflow: hidden;*/
        /*}*/

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

            &:hover {
                color: #ffc124;
            }
        }

        .import, .export, .save, .history {
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
        transition: all .3s ease;
        user-select: none;
    }

    .custom-menu li:hover {
        background-color: #DEF;
    }

    .bpmn-web-btn {
        margin-top:0px;
    }

    @media only screen and (max-width: 1620px) {
        .bpmn-btn-text {
            display:none;
        }
        .bpmn-btn {
            margin-right:-0px !important;
            max-width:20px !important;
            min-width:20px !important; 
        }
        .bpmn-language-select {
            margin-left:20px;
        }
    }
    @media only screen and (max-width: 1030px) {
        .bpmn-web-btn {
            display:none;
        }
        .bpmn-mobile-btn {
            display:block;
        }
    }
</style>
