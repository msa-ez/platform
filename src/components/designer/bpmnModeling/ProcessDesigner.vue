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

            <bpmn-vue v-if="definition"
                        ref="bpmn-vue"
                        :definition.sync="definition"
                        :monitor="monitor"
                        :backend="backend"
                        :dragPageMovable="dragPageMovable"
                        v-on:bpmnReady="bindEvents"
                        v-bind:style="cursorStyle"
                        :loaded.sync="loaded"
            ></bpmn-vue>

            <v-layout>
                <v-flex>
                    <v-row style="margin-left: 20px; margin-top: 10px">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn text small right @click.native="undo" v-on="on">
                                    <v-icon medium>mdi-undo</v-icon>
                                </v-btn>
                            </template>
                            <span>Undo</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn text small right @click.native="redo" v-on="on">
                                    <v-icon medium>mdi-redo</v-icon>
                                </v-btn>
                            </template>
                            <span>Redo</span>
                        </v-tooltip>
                    </v-row>
                </v-flex>
            </v-layout>

            <v-flex style="justify:end; align:start;">
                <v-row v-if="!monitor" justify="end" align="start" style="margin-right: 15px;">
                    <v-text-field style="margin-right: 10px; margin-top: 8px; max-width: 300px" 
                            label="Process Name"
                            v-model="definitionName"
                    ></v-text-field>
                    
                    <!-- 웹페이지 버튼들 -->
                    <div style="margin-right: 10px;">> 
                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        color="primary"
                                        dark
                                        v-on="on"
                                        @click="openDefinitionSettings">
                                    <v-icon>settings</v-icon>
                                    Settings
                                </v-btn>
                            </template>
                        </v-menu>

                        <v-menu offset-y
                                open-on-hover
                                left>
                            <template v-slot:activator="{ on }">
                                <v-btn text
                                        style="margin-right: 15px; margin-top: 15px;"
                                        id="processVariables" 
                                        color="orange"
                                        dark
                                        v-on="on"
                                        @click="openProcessVariables">
                                    <v-icon>sort_by_alpha</v-icon>
                                    Vars
                                </v-btn>
                            </template>
                        </v-menu>
                    </div>
                    <!-- 웹페이지 버튼들 끝 -->

                    <div v-if="versions" style="margin-right: 10px;">
                        <v-select v-for="(version, idx) in versions.slice().reverse()" 
                                :key="idx"
                                v-on="on"
                                v-model="selectedVersion" 
                                @change="changeVersion" 
                                :value="version"
                                style="margin-top: 10px; margin-right: 15px; max-width: 150px;">
                            <v-chip v-if="productionVersionId == version.versionId">production</v-chip>
                        </v-select>
                    </div>

                    <div v-if="definition" style="margin-right: 10px;">
                        <v-select v-model="definition._selectedLocale" 
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
                                        @click="save">
                                    <v-icon v-if="id && id.indexOf('@') == -1">save</v-icon>
                                    <v-icon v-else>history</v-icon>
                                </v-btn>
                            </template>
                        </v-menu>
                    </div>

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
                        <v-select v-for="(version, idx) in versions.slice().reverse()" 
                                :key="idx"
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
                            :definition="definition"
                            v-if="definition"
                            ref="instanceVariables"
                    ></bpmn-instance-variables>
                    

                    <user-picker
                            :id="instanceId"
                            ref="userPicker"
                            :roles="definition.roles"
                            v-if="definition"
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

            </v-card>

            <!-- <v-layout @contextmenu.native="openMenu" @mousedown.native="closeMenu"> -->
                <!-- <div style="position: absolute; left:48%; top: 37%; z-index: 99999" v-if="loaded == false">
                    <v-progress-circular :size="90" indeterminate style="z-index: 99999"></v-progress-circular>
                </div> -->
                <!-- <bpmn-vue v-if="definition"
                        ref="bpmn-vue"
                        :definition.sync="definition"
                        :monitor="monitor"
                        :backend="backend"
                        :dragPageMovable="dragPageMovable"
                        v-on:bpmnReady="bindEvents"
                        v-bind:style="cursorStyle"
                        :loaded.sync="loaded"
                ></bpmn-vue> -->

                <!-- <v-card v-if="!monitor" class="tools" style="top:600px;">
                    <v-row>
                        <v-tooltip right>
                            <template v-slot:activator="{ on }">
                                <v-btn small class="icons fa fa-undo" v-on="on" @click.native="undo" style="margin-left:7px;">
                                    <v-icon>mdi-undo</v-icon>
                                </v-btn>
                            </template>
                            <span>Undo</span>
                        </v-tooltip>

                        <v-tooltip right>
                            <template v-slot:activator="{ on }">
                                <v-btn small class="icons fa fa-repeat" v-on="on" @click.native="redo" style="margin-left:7px;">
                                    <v-icon>mdi-redo</v-icon>
                                </v-btn>
                            </template>
                            <span>Redo</span>
                        </v-tooltip>
                    </v-row>
                </v-card> -->

                <!-- <v-layout> -->
                <!--프로세스 아이디-->
                    <!-- <v-layout v-if="!monitor"> -->
                    <!-- <v-layout> -->
                        <!-- <v-row v-if="!monitor">
                            <v-text-field v-model="definitionName" type="text" label="Process Name"></v-text-field>

                            <v-btn class="md-primary" 
                                    @click="openDefinitionSettings"
                                    style="margin-top:10px ">
                                <v-icon>settings</v-icon>
                                Settings
                            </v-btn>

                            <v-btn class="md-primary" 
                                    id="processVariables" 
                                    @click="openProcessVariables" 
                                    style="margin-top:10px ">
                                <v-icon>sort_by_alpha</v-icon>
                                Vars
                            </v-btn>
                        </v-row> -->

                        <!-- <v-row v-if="versions">
                            Revision
                            <v-select v-for="(version, idx) in versions.slice().reverse()" :key="idx"
                                    v-model="selectedVersion" 
                                    @change="changeVersion" 
                                    :value="version"> -->
                                <!-- <md-option v-for="version in versions.slice().reverse()" :value="version">rev. {{version.ver}} -->
                                <!-- <v-chip v-if="productionVersionId == version.versionId">production</v-chip> -->
                                <!-- </md-option> -->
                            <!-- </v-select> -->
                        <!-- </v-row> -->

                        <!-- <v-row v-if="!monitor && definition" style="max-width: 100px;margin-left: 15px">
                            <v-select v-model="definition._selectedLocale" 
                                    :items="languageItems" 
                                    item-value="value" 
                                    item-text="title"
                                    @change="changeLocale" label="Language">
                            </v-select>
                        </v-row> -->
                    <!-- </v-layout> -->

                    <!--프로세스 정의-->
                    <!-- <v-layout v-if="!monitor">
                        <v-btn class="md-primary" id="processVariables" @click="openDefinitionSettings">
                            <v-icon>settings</v-icon>
                            Settings
                        </v-btn>

                        <v-btn c lass="md-primary" id="processVariables" @click="openProcessVariables">
                            <v-icon>sort_by_alpha</v-icon>
                            Vars
                        </v-btn>
                    </v-layout> -->

                    <!--프로세스 변수-->
                    <!-- <v-layout v-if="!monitor">
                        <v-btn class="md-primary" 
                                id="processVariables" 
                                @click="openProcessVariables">
                            <v-icon>sort_by_alpha</v-icon>
                            Vars
                        </v-btn>
                    </v-layout> -->

                    <!--로케일-->
                    <!-- <v-layout v-if="!monitor && definition" style="max-width: 100px;">
                        <v-select v-model="definition._selectedLocale" 
                                :items="languageItems" 
                                item-value="value" 
                                item-text="title"
                                @change="changeLocale" 
                                label="Language"
                        ></v-select>
                    </v-layout> -->

                    <!--프로세스 세이브-->
                    <!-- <v-layout v-if="!monitor" style="margin-left: 30px; margin-top: 10px">
                        <v-btn v-if="!monitor" 
                                class="md-fab md-primary md-mini" 
                                v-on:click="initiateProcess">
                            <v-icon>play_arrow</v-icon>
                        </v-btn>
                        <v-btn v-if="!monitor" 
                                class="md-fab md-warn md-mini" 
                                @click="save">
                            <v-icon v-if="id && id.indexOf('@') == -1">save</v-icon>
                            <v-icon v-else>history</v-icon>
                        </v-btn>
                    </v-layout> -->

                    <!--인스턴스 이름-->
                    <!-- <v-layout v-if="monitor">
                        <v-container>
                            Instance Name
                            <v-text-field v-model="instanceName" 
                                    type="text" 
                                    readonly
                            ></v-text-field>
                        </v-container>
                    </v-layout> -->

                    <!-- <v-layout v-if="monitor"> -->
                        <!--프로세스 변수-->
                        <!-- <v-btn id="instanceVariables" 
                                @click="openInstanceVariables"
                        >Variables</v-btn>
                        <bpmn-instance-variables
                                :id="instanceId"
                                :definition="definition"
                                v-if="definition"
                                ref="instanceVariables"
                        ></bpmn-instance-variables> -->
                        
                        <!--담당자 변경-->
                        <!-- <v-btn id="userPicker" 
                                @click="openUserPicker"
                        >Role Mappings</v-btn>
                        <user-picker
                                :id="instanceId"
                                ref="userPicker"
                                :roles="definition.roles"
                                v-if="definition"
                                style="min-width: 70%;"
                        ></user-picker> -->
                    <!-- </v-layout> -->

                <!-- </v-layout> -->
            <!-- </v-layout> -->
            

        </v-layout>
    
        <!--Back to Here Menu Start -->
        <!-- Todo : contextMenuActivated를 이용하여 작업해야 함 -->
        <!-- <ul class='custom-menu' v-if="contextMenuActivated"> -->
        <ul class='custom-menu'>
            <li data-action="backToHere">Back To Here</li>
        </ul>
        <!--Back to Here Menu End -->

        <canvas style="display: none" ref="image-gen"></canvas>
    
    </div>
</template>
<script>
    export default {
        name: 'bpmn-process-designer',
        props: {
            monitor: Boolean,
            backend: Object,
            id: String,
            value: {
                default: function () {
                    return {
                        _type: 'org.uengine.kernel.ProcessDefinition',
                        name: {},
                        childActivities: [
                            'java.util.ArrayList',
                            []
                        ],
           // processVariableDescriptors: [{
           //   _type: 'org.uengine.kernel.ProcessVariable',
           //   name: 'Var1',
           // }],
           // 'roles': [{
           //     _type: 'org.uengine.kernel.Role',
           //     name: 'initiator'
           // }],
                        'sequenceFlows': [],
                        _selectedLocale: 'ko',
                        _changedByLocaleSelector: false
                    }
                },
                type: Object
            },
            instanceId: String,
            rootInstanceId: String,
        },
        data() {
            return {
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
                definition: null,
                definitionName: null,
                instanceName: null,
                processVariables: [],
                dialog: false,
                items: [],
                active: false,
                mode: 'editor',
                shapeMenu: false,
                dragPageMovable: false,
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
                bthTracingTag: ""
            }
        },
        computed: {},

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
        },

        watch: {
            instanceId: function (val) {
                this.setMode();
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
            openProcessVariables() {
                this.$refs['bpmn-vue'].openProcessVariables();
            },
            openDefinitionSettings() {
                this.$refs['bpmn-vue'].openDefinitionSettings();
            },
            bindEvents: function (opengraph) {
                //this.$el
                var me = this;
                var el = me.$el;
                var canvasEl = $(opengraph.container);
                if (!canvasEl || !canvasEl.length) {
                    return;
                }
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

                            console.log(componentInfo)
                            me.$refs['bpmn-vue'].addComponenet(componentInfo);
                        }
                        canvasEl.removeData('DRAG_SHAPE');
                    }
                });
            },
            copy: function () {
                var me = this;
                me.copyActivity = [];
                me.copySquenceFlow = [];
                this.definition.childActivities[1].forEach(function (activity) {
                    if (activity) {
                        if (activity._selected) {
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

                    console.log("Delete Activity")
                    for (var i = 0; i < me.definition.childActivities[1].length; i++) {
                        if (me.definition.childActivities[1][i] != null) {
                            if (me.definition.childActivities[1][i]._selected == true) {
                                console.log(me.definition.childActivities[1][i]);
                                deleteTracing.push(me.definition.childActivities[1][i].tracingTag);
                                me.definition.childActivities[1][i] = null;
                            }
                        }
                    }

                    for (var y = 0; y < me.definition.sequenceFlows.length; y++) {
                        if (me.definition.sequenceFlows[y]) {
                            for (var x = 0; x < deleteTracing.length; x++) {
                                if (me.definition.sequenceFlows[y].sourceRef == deleteTracing[x]) {
                                    for (var z = 0; z < deleteTracing.length; z++) {
                                        if (me.definition.sequenceFlows[y].targetRef == deleteTracing[z]) {
                                            me.definition.sequenceFlows[y] = null
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                for (var z = 0; z < me.definition.sequenceFlows.length; z++) {
                    if (me.definition.sequenceFlows[z] != null) {
                        if (me.definition.sequenceFlows[z].selected == true) {
                            me.definition.sequenceFlows[z] = null;
                        }
                    }
                }

                for (var x = 0; x < me.definition.messageFlows.length; x++) {
                    if (me.definition.messageFlows[x] != null) {
                        if (me.definition.messageFlows[x].selected == true) {
                            me.definition.messageFlows[x] = null;
                        }
                    }
                }

                var tmp = me.definition.sequenceFlows;
                me.definition.sequenceFlows = null;
                me.definition.sequenceFlows = tmp;
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

                            newAct.tracingTag = bpmnVue.createNewTracingTag(me.definition);
                            newAct._selected = false;
                            newAct.elementView.x = newActX;
                            newAct.elementView.y = newActY;
                            newAct.elementView.id = newAct.tracingTag;
                            me.afterTracing.push(newAct.tracingTag);
                            me.definition.childActivities[1].push(newAct);
                        }
                    );

                    me.definition.sequenceFlows.forEach(function (element, index, array) {
                        if (element) {
                            var newFlow = JSON.parse(JSON.stringify(element));
                            for (var i = 0; i < me.beforeTracing.length; i++) {
                                if (newFlow.sourceRef == me.beforeTracing[i]) {
                                    for (var y = 0; y < me.beforeTracing.length; y++) {
                                        if (newFlow.targetRef == me.beforeTracing[y]) {
                                            newFlow.sourceRef = me.afterTracing[i];
                                            newFlow.targetRef = me.afterTracing[y];
                                            newFlow.relationView.value = '';
                                            me.definition.sequenceFlows.push(newFlow);
                                        }
                                    }
                                }
                            }
                        }
                    })
                }
            },
            undo: function () {
                this.$refs['bpmn-vue'].undo();
            },
            redo: function () {
                this.$refs['bpmn-vue'].redo();
            },
            //여기서는, 라우터에서 전달해준 monitor prop 를 가지고 디자이너 모드인지, 모니터 모드인지 판별함.
            setMode: function () {
                var me = this;
                me.loaded = false;
                me.definition = null;
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
                me.backend.$bind("instance/" + me.instanceId, instance);
                instance.$load().then(function (instance) {
                    me.instanceName = instance.name;

                    instance.definition.$load().then(function (definition) {
                        me.definitionName = definition.name;
                        definition.raw.$load().then(function (raw_definition) {
                            var definition = raw_definition.definition;
                            me.loadStatus(definition);
                            me.treeStructure();
                        });
                    });
                });
            },

            loadVersions: function () {
                var me = this;
                var definition = {};
                me.backend.$bind("definition/" + me.id + '.json', definition);
                definition.$load().then(function (definition) {
                    me.productionVersionId = definition.prodVerId;
                    if (definition.versions) {
                        definition.versions.$load().then(function (versions) {
                            if (versions && versions.length > 0) {
                                me.versions = versions;
                                me.selectedVersion = versions[versions.length - 1];
                            }
                        });
                    }
                });
            },

            changeVersion: function () {
                window.open('#/definition/' + this.id + '@' + this.selectedVersion.versionId, '_blank');
            },

            markProduction: function () {
                var me = this;
                var version = {};
                me.backend.$bind("version/" + me.id.substring(me.id.indexOf('@') + 1), version);
                version.$load().then(function () {
                    version.makeProduction.$create().then(
                        function () {
                            me.$root.$children[0].success('설정되었습니다.');
                            me.isProduction = true;
                        },
                        function () {
                            me.$root.$children[0].error('저장할 수 없습니다.');
                        }
                    );
                });

            },

            //트리 구조를 위해 subprocess가 있는지 확인한다.
            treeStructure: function () {
                var me = this;
                var instance = {};
                me.backend.$bind("instances/search/findChild?instId=" + me.rootInstanceId, instance);

                var tree = [];
                instance.$load().then(function (instances) {

                    for (var i in instances) {
                        if (instances[i] instanceof Object) {
                            //hateoas에서는 self 링크에 자신의 id가 담겨있다.
                            var selfLink = instances[i].$bind.self;
                            var instId = selfLink.substring(selfLink.lastIndexOf("/") + 1, selfLink.length);
                            tree[i] = {
                                "name": instances[i].defName,
                                "id": parseInt(instId),
                                "rootInstId": instances[i].rootInstId,
                                "mainInstId": instances[i].mainInstId,
                                "children": null
                            };
                        }
                    }
                    me.trees = me.listToTree(tree);
                });
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
                        me.definition = definition;
                        console.log({"definitionFilledWithInstanceInfo": me.definition})
                    })
            },
            getActivity: function (tracingTag, definition) {
                var me = this;
                if (!definition) definition = me.definition;

                for (var key in definition.childActivities[1]) {
                    if (definition.childActivities[1][key]["tracingTag"] == tracingTag) {
                        return definition.childActivities[1][key];
                    }
                }
            },
            updateElementStatus: function (elementId, status) {
//        var me = this;
//        let element = me.canvas.getElementById(elementId);
//        if (element) {
//          element.shape.status = status;
//          me.canvas.getRenderer().redrawShape(element);
//        }
            },
            getDefinition: function () {
                var me = this;
                var definition = JSON.parse(JSON.stringify(me.value));
                definition._selectedLocale = 'ko';
                definition._changedByLocaleSelector = false;
                me.definition = definition;
                me.definitionName = me.definition.name.text;
                me.changeLocale();
                // this.loadVersions();
            },
            save: function (nextAction) {
                var me = this;
                //각 액티비티, 롤, 시퀀스 플로우 중 빈 컴포넌트값을 거른다.
                var definitionToSave = JSON.parse(JSON.stringify(me.definition));

                //request definition name if empty.
                if (!me.definitionName) {
                    me.definitionName = prompt("Specify definition name");
                    if (!me.definitionName) {
                        return;
                    }
                }

                //if new definition, set id as definitionName.
                if (!me.id) {
                    me.id = me.definitionName;
                }
                definitionToSave.name.text = me.definitionName;

                var nullFilter = function (array) {
                    return array.filter(function (x) {
                        if (x) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                }

                //롤 널 체크
                definitionToSave.roles = nullFilter(definitionToSave.roles);

                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        activity.sequenceFlows = nullFilter(activity.sequenceFlows);
                    }
                    if (activity.messageFlows && activity.messageFlows.length) {
                        activity.messageFlows = nullFilter(activity.messageFlows);
                    }
                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        activity.childActivities[1] = nullFilter(activity.childActivities[1]);
                        $.each(activity.childActivities[1], function (i, child) {
                            //롤 배정
                            if (child._type == 'org.uengine.kernel.HumanActivity') {
                                child.role.name =
                                    me.$refs['bpmn-vue'].getWhereRoleAmIByTracingTag(child.tracingTag);
                                console.log('HumanActivity ' + child.name.text + ' saved role as ' + child.role.name);
                            }
                            recursiveCheck(child);
                        })
                    }
                }
                //액티비티, 릴레이션 널 체크, 휴먼 액티비티 롤 배정 (bpmn 패널을 더블클릭하면 배정되나, 안열어보고 배치한 것을 위해 설정)
                recursiveCheck(definitionToSave, null);

                //휴먼 액티비티 롤 배정 (bpmn 패널을 더블클릭하면 배정되나, 안열어보고 배치한 것을 위해 설정)
//        this.activity.role.name =
//          this.bpmnVue.getWhereRoleAmIByTracingTag(this.activity.tracingTag);

                // 프로세스 정의 처리
                definitionToSave.shortDescription = this.$refs['bpmn-vue'].defintionSettings.shortDescription;

                var definition = {};
                me.backend.$bind("definition/raw/" + me.id + '.json', definition);
                definition.definition = definitionToSave;
                definition.$save().then(
                    function (definition) {
                        me.$root.$children[0].success('저장되었습니다.');

                        // me.loadVersions();

                        if (nextAction && typeof nextAction === "function") {
                            nextAction(definition);
                        }
                    },
                    function (response) {
                        me.$root.$children[0].error('저장할 수 없습니다.');
                    }
                );

                //save image to localstorage
                var svg = me.$refs['bpmn-vue'].canvas._RENDERER.getRootElement();
                var svgData = new XMLSerializer().serializeToString(svg);

                function drawInlineSVG(canvas, rawSVG, callback) {
                    var ctx = canvas.getContext("2d");
                    var svg = new Blob([rawSVG], {type: "image/svg+xml;charset=utf-8"}),
                        domURL = self.URL || self.webkitURL || self,
                        url = domURL.createObjectURL(svg),
                        img = new Image;

                    img.onload = function () {
                        canvas.width = 600;
                        canvas.height = 300;

                        try {
                            //JavaScript syntax:	context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
                            // img:	Specifies the image, canvas, or video element to use
                            // sx:	Optional. The x coordinate where to start clipping
                            // sy:	Optional. The y coordinate where to start clipping
                            // swidth:	Optional. The width of the clipped image
                            // sheight:	Optional. The height of the clipped image
                            // x:	The x coordinate where to place the image on the canvas
                            // y:	The y coordinate where to place the image on the canvas
                            // width:	Optional. The width of the image to use (stretch or reduce the image)
                            // height:	Optional. The height of the image to use (stretch or reduce the image)

                            ctx.drawImage(img, 0, 0, 1000, 500, 0, 0, 600, 300);
                            domURL.revokeObjectURL(url);
                            callback(this);
                            $(img).remove();
                        } catch (e) {
                            $(img).remove();
                        }
                    };
                    img.src = url;
                }

                var canvas = me.$refs['image-gen'];
                drawInlineSVG(canvas, svgData, function () {
                    //window.open(canvas.toDataURL())
                    console.log(canvas.toDataURL());  // -> PNG data-uri
                    localStorage['svg-' + me.id] = canvas.toDataURL();
                });
            },


            initiateProcess: function () {
                var me = this;
                this.save(
                    function () {
                        var def = {};
                        me.backend.$bind("definition/" + me.id + ".json", def);
                        def.$load().then(function (definition) {
                            definition.instantiation.$create(null, {"simulation": true}).then(function (instance) {
                                window.open('#/instance/' + instance.instanceId + '/' + instance.instanceId, '_blank');
                            });
                        });
                    }
                );
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
                var childActivities = me.definition.childActivities[1];
                var _type = "";
                var _status = "";
                var _faultMessage = "";
                for (var key in childActivities) {
                    if (childActivities[key].tracingTag == event.toElement.parentNode.id) {
                        _type = childActivities[key]._type;
                        _status = childActivities[key].status;
                        me.bthTracingTag = childActivities[key].tracingTag;
                        if (childActivities[key].faultMessage) {
                            _faultMessage = childActivities[key]._faultMessage;
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
                var url = "instance/" + me.id + "/activity/" + me.bthTracingTag + "/backToHere";
                var instance = {};
                me.backend.$bind(url, instance);
                instance.$create().then(function () {
                    me.$root.$children[0].success('작업 내역을 선택한 위치로 되돌렸습니다.');
                    //메세지가 나오기 전에 바로 화면 refresh를 시도하는 것을 막기 위해
                    //타이머를 설정하여 일정 시간이 지나면 화면을 refresh 한다.
                    setInterval(function () {
                        // router refresh
                        me.$router.go(me.$router.currentRoute);
                    }, 1500)
                });
            },
            changeLocale() {
                var me = this;
                me.definition._changedByLocaleSelector = true;
                if (me.definition.childActivities) {
                    me.definition.childActivities[1].forEach(function (activity) {
                        if (activity && activity.name && activity.name.localedTexts) {
                            if (activity.name.localedTexts[me.definition._selectedLocale]) {
                                activity.name.text = activity.name.localedTexts[me.definition._selectedLocale];
                            }
                        }
                    });
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
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
</style>
