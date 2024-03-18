<template>
    <div>
        <div class="canvas-panel" style="left:0">
            <div :key="eleCnt">
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

                <v-layout>
                    <opengraph ref="opengraph" focus-canvas-on-select wheelScalable :labelEditable="true"
                            :sliderLocationScale=sliderLocationScale
                            :dragPageMovable="dragPageMovable" :enableContextmenu="false" :enableRootContextmenu="false"
                            :enableHotkeyCtrlC="false" :enableHotkeyCtrlV="false"
                            :enableHotkeyDelete="false" :enableHotkeyCtrlZ="false" :enableHotkeyCtrlD="false"
                            :enableHotkeyCtrlG="false" :slider="true" :movable="!isReadOnlyModel" :resizable="!isReadOnlyModel"
                            :selectable="true"
                            :connectable="!isReadOnlyModel" v-if="value" v-on:canvasReady="bindEvents" :autoSliderUpdate="true"
                            v-on:connectShape="onConnectShape" :imageBase="imageBase">

                        <!--background 9 perspectives-->
                        <component
                                v-for="(perspective, index) in perspectives"
                                :key="index"
                                :is="getComponentByClassName(perspective._type)"
                                v-model="perspectives[index]"
                                @click="changeCategory(perspectives[index])"></component>

                        <!--엘리먼트-->
                        <component
                                v-for="elementId in Object.keys(value.elements)"
                                v-if="elementId && value.elements[elementId] && value.elements"
                                :is="getComponentByClassName(value.elements[elementId]._type)"
                                :value.sync="value.elements[elementId]"
                                :ref="elementId"
                        ></component>

                        <component
                                v-for="relationId in Object.keys(value.relations)"
                                v-if="relationId && value.relations[relationId] && value.relations"
                                :is="getComponentByClassName(value.relations[relationId]._type)"
                                :value.sync="value.relations[relationId]"
                                :ref="relationId"
                        ></component>
                    </opengraph>


                    <slot name="undoRedo">
                        <v-flex v-if="!isReadOnlyModel">
                            <v-row class="gs-modeling-undo-redo">
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
                    </slot>

                    <div v-if="isMobile">
                        <v-speed-dial
                            v-model="fab"
                            class="business-mobile-speed-dial"
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
                            <v-col style="margin-right:390px;">
                                <v-btn small text dark
                                        @click="saveComposition('save')">save
                                </v-btn>
                                <v-btn
                                        text
                                        v-if="isOwnModel && !isReadOnlyModel"
                                        @click="openInviteUsers()"
                                        small
                                >
                                    <v-icon>{{icon.share}}</v-icon>
                                    SHARE
                                </v-btn>
                                <v-btn class="action-btn" text color=primary @click="generateImplementationModel()">
                                    <Icon icon="mdi:head-cog-outline"
                                        height="24"
                                        style="margin-right:5px;"
                                    />
                                    <div>implementation model</div>
                                </v-btn>
                            </v-col>
                        </v-speed-dial>
                    </div>

                    <slot name="top">
                        <v-flex style="align:start;">
                            <v-row class="gs-model-z-index-1 business-model-canvas-top-menu" >
                                <v-row align="start" style="margin-top:10px; width:150px;">
                                    <div class="business-model-canvas-mobile-home-button">
                                        <router-link to="/">
                                            <v-icon
                                                style="height: 24px;
                                                margin-top: 38px;
                                                margin-right: 5px;"
                                            >
                                                mdi-home
                                            </v-icon>
                                        </router-link>
                                    </div>
                                    <slot name="projectName">
                                        <v-col align="start" id="project-name">
                                            <v-text-field
                                                style="z-index:2;"
                                                :disabled="isReadOnlyModel"
                                                label="Project Name" v-model="projectName"
                                                @click.native="unselectedAll"
                                            >
                                            </v-text-field>
                                        </v-col>
                                    </slot>
                                </v-row>
                                <div class="action-btn-box">
                                    <v-row v-if="isOwnModel && isServerModel && !isReadOnlyModel">
                                        <v-col align="right">
                                            <v-btn class="action-btn" text color=primary @click="generateImplementationModel()">
                                                <Icon icon="mdi:head-cog-outline"
                                                    height="24"
                                                    style="margin-right:5px;"
                                                />
                                                <div>implementation model</div>
                                            </v-btn>
                                            <v-btn class="action-btn" @click="storageDialogReady('save')"
                                                    text>
                                                <v-icon>{{icon.save}}</v-icon>
                                                SAVE
                                            </v-btn>
                                            <v-btn
                                                    v-if="isOwnModel && isServerModel && !isReadOnlyModel"
                                                    text
                                                    @click="openInviteUsers()"
                                            >
                                                <v-icon>{{icon.share}}</v-icon>
                                                SHARE
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                    <v-row v-else>
                                        <v-btn
                                            v-if="isReadOnlyModel"
                                            class="gs-model-z-index-1 es-hide-fork-btn"
                                            text
                                            :color="joinRequestedText.show? 'primary': 'success'"
                                            @click="requestInviteUser()"
                                            style="margin-right: 5px; margin-top: 15px;">
                                            <div v-if="joinRequestedText.show">
                                                <v-icon>{{icon.join}}</v-icon>
                                            </div>
                                            {{joinRequestedText.text }}
                                        </v-btn>
                                        <v-btn
                                            v-if="!isReadOnlyModel"
                                            class="gs-model-z-index-1 es-hide-fork-btn"
                                            text
                                            :disabled="disableBtn"
                                            @click="saveComposition('fork')"
                                            style="margin-right: 5px; margin-top: 15px;">
                                        <v-icon>{{ icon.fork }}</v-icon>
                                        <div class="es-hide-fork">
                                            FORK
                                        </div>
                                    </v-btn>
                                    </v-row>
                                </div>
                            </v-row>
                        </v-flex>
                    </slot>

                    <a href="https://www.strategyzer.com/" target="_blank"
                        class="strategyzer-link"
                    >strategyzer.com</a>

                    <slot name="palette">
                        <v-card class="business-model-canvas-sticker">
                            <v-tooltip v-if="!isReadOnlyModel" right v-for="(category, categoryIndex) in elementTypes"
                                    :key="categoryIndex">

                                <template v-slot:activator="{ on }">
                                <span
                                        class="draggable"
                                        align="center"
                                        @mouseover="changeCategory(categoryIndex)"
                                        :_component="category[0].component"
                                        :_width="category[0].width"
                                        :_height="category[0].height"
                                        :_description="category[0].description"
                                        :_label="category[0].label"
                                >
                                    <img height="30px" width="30px" :src="category[0].src" v-on="on">
                                </span>
                                </template>

                                <span>{{ category[0].component }}</span>

                            </v-tooltip>
                        </v-card>
                        <div v-for="(category, categoryIndex) in elementTypes" :key="categoryIndex">
                            <div v-if="selectedCategoryIndex == categoryIndex">

                                <v-tooltip right v-for="(item, key) in category" :key="key">

                                    <template v-slot:activator="{ on }">
                                    <span
                                            class="draggable"
                                            align="center"
                                            :_component="item.component"
                                            :_width="item.width"
                                            :_height="item.height"
                                            :_description="item.description"
                                            :_label="item.label"
                                            @click="addBusinessTactic(item)"
                                            :style="toolStyle(key, categoryIndex, category.length)"
                                    >
                                        <img valign="middle"
                                            style="vertical-align:middle; border: 2 solid grey; -webkit-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);"
                                            onmouseover="this.height=this.height*1.5;this.width=this.width*1.5;this.left=this.left-this.width*0.5;this.right=this.right-this.width*0.5;"
                                            onmouseout="this.height=this.height/1.5;this.width=this.width/1.5;this.left=this.left+this.width*0.5;this.right=this.right+this.width*0.5;"
                                            height="40px" width="40px" :src="item.src" v-on="on" border=2>
                                        <v-chip v-on="on">{{item.label}}</v-chip>

                                    </span>
                                    </template>

                                    <v-card
                                            class="mx-auto"
                                            max-width="500"
                                            outlined
                                    >
                                        <v-list-item three-line>
                                            <v-list-item-content>
                                                <div class="overline mb-4">{{item.component}}</div>
                                                <v-list-item-title class="headline mb-1">{{item.label}}</v-list-item-title>
                                                <v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
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
                    </slot>
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
                        canvasComponentName="business-model-canvas"
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
                >
                </model-storage-dialog>

                
                <modeler-image-generator ref="modeler-image-generator"></modeler-image-generator>
            </div>
        </div>
        <AutoModelingDialog
            ref="autoModelingDialog"
            mode="es"
            @createModel="createModel"
            @clearModelValue="clearModelValue"
            :showDialog="dialogModeOfAutoModeling"
            :showChat="dialogModeOfAutoModeling"
            :BMState="BMState"
            :projectId="projectId"
            @startCreateModel="openEventStorming"
        ></AutoModelingDialog>
        <GeneratorUI v-if="projectId" ref="generatorUI" :projectId="projectId" :defaultInputData="defaultGeneratorUiInputData" @createModel="createModel" @clearModelValue="clearModelValue"></GeneratorUI>
        <!-- Mouse Cursor -->
        <div v-for="(otherMouseEvent, email) in filteredMouseEventHandlers" :key="email">
            <MouseCursorComponent :mouseEvent="otherMouseEvent" :email="email" />
        </div>
    </div>
</template>


<script>
    import BusinessModeling from "./index";
    import ParticipantPanel from "../modeling/ParticipantPanel";
    import ModelCanvas from "../modeling/ModelCanvas";
    import ModelStorageDialog from "../modeling/ModelStorageDialog";
    import ModelCanvasShareDialog from "../modeling/ModelCanvasShareDialog";
    import AutoModelingDialog from "../modeling/AutoModelingDialog";
    import GeneratorUI from "../modeling/generators/GeneratorUI";
    import MouseCursorComponent from "../modeling/MouseCursorComponent.vue"

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });


    export default {
        name: 'business-model-canvas',
        components: {
            ParticipantPanel,
            'model-canvas-share-dialog': ModelCanvasShareDialog,
            'model-storage-dialog': ModelStorageDialog,
            AutoModelingDialog,
            GeneratorUI,
            MouseCursorComponent
        },
        mixins: [ModelCanvas],
        created: function () {
            var me = this
            me.isQueueModel = true

            if (localStorage.getItem(me.$route.params.projectId + '-Project-Name')) {
                me.projectName = localStorage.getItem(me.$route.params.projectId + '-Project-Name')
                localStorage.removeItem(me.$route.params.projectId + '-Project-Name')
            }
        },
        methods: {
            setCanvasType(){
                Vue.use(BusinessModeling);
                this.canvasType = 'bm'
            },
            moveModelUrl(modelId){
                this.$router.push({path: `/business-model-canvas/${modelId}`});
            },
            async synchronizeAssociatedProject(associatedProject, newId, oldId) {
                var me = this;
                if(!associatedProject) return;

                let lists = await me.list(`db://definitions/${associatedProject}/information/businessModel`);
                let index = -1;
                if (lists && lists.modelList) {
                    if(oldId) {
                        index = lists.modelList.findIndex((id) => id == oldId);
                    } else {
                        index = lists.modelList.findIndex((id) => id == newId); //duplicate
                    }
                    index = index == -1 ? lists.modelList.length : index;
                }

                index = index == -1 ? 0 : index;
                await me.setString(`db://definitions/${associatedProject}/information/businessModel/modelList/${index}`, newId);
            },
            openEventStorming(val){
                var me = this
                var dbuid = me.dbuid()
                localStorage.setItem(dbuid + '-model-info', JSON.stringify(val))
                localStorage.setItem(dbuid + '-Project-Name', val.name)

                me.$router.push({path: `/storming/${dbuid}`});
            },  
            clearModelValue(){
                var me = this
                me.value.elements = {}
                me.eleCnt = 0
            },
            createModel(val){
                var me = this
                var perspectives = this.perspectives
                if(val){
                    if (val.associatedProject) me.information.associatedProject = val.associatedProject;
                    Object.keys(val).forEach(function (key){
                        perspectives.forEach(perspective => {
                            if (val[key].componentName == perspective.perspective.replaceAll("-", "")) {
                                val[key]['elementView'].x = perspective.elementView.x + Math.random() * perspective.elementView.width * 0.75 - perspective.elementView.width * 0.75 / 2;
                                val[key]['elementView'].y = perspective.elementView.y + Math.random() * perspective.elementView.height * 0.75 - perspective.elementView.height * 0.75 / 2;
                            }
        
                        })
                        val[key]['elementView'].x = Math.round(val[key]['elementView'].x)
                        val[key]['elementView'].y = Math.round(val[key]['elementView'].y)
                        if(me.eleCnt == val[key].eleNumber){
                            me.value.elements[key] = val[key]
                            me.eleCnt++;
                        }
                    })
                }
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                $.each(window.Vue.bussinessModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },
            changeCategory(key) {
                var me = this
                if (me.selectedCategoryIndex == key)
                    me.selectedCategoryIndex = null;
                else
                    me.selectedCategoryIndex = key
            },


            //    toolStyle(cardIndex, categoryIndex, cardLength) {
            //         var me = this
            //         var angle =  (cardIndex - categoryIndex/10) * 40 / (cardLength +1) - 10;
            //         var angle2 = cardIndex * 10 / cardLength - 3;
            //         var radians = (Math.PI/ 180) * angle;

            //         var curvedX = Math.cos(radians) * 500 - 500;
            //         var curvedY = Math.sin(radians) * 700 + categoryIndex * 10 + 50;

            //         return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg);`;
            //     },

            toolStyle(cardIndex, categoryIndex, cardLength) {
                var me = this
                var angle = (cardIndex - categoryIndex) * 40 / cardLength;
                var angle2 = cardIndex * 10 / cardLength - 3;
                var radians = (Math.PI / 180) * angle;

                var curvedX = Math.cos(radians) * 500 - 500;
                var curvedY = Math.sin(radians) * 700 + categoryIndex * 38;

                return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg);`;
            },


            ///// align horizontally
//             toolStyle(cardIndex, categoryIndex, cardLength) {
//                 var me = this
//                 var angle = 90 - cardIndex * 40 / cardLength;
//                 var angle2 = - cardIndex * 10 / cardLength + 3;
//                 var radians = (Math.PI/ 180) * (angle );

//                 var curvedX = Math.cos(radians) * cardLength * 75;
//                 var curvedY = Math.sin(radians) * 200 + categoryIndex * 38 - 200;

//                 return `left: ${100 + curvedX}px; top: ${104 + curvedY}px; text-align: center; position: absolute; transform: rotate(${angle2}deg); -webkit-box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.75); -moz-box-shadow: 5px 5px 10px 0px rgba(0,0,0,0.40); box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.40);`;
//             },

            addBusinessTactic: function (tactic) {
                tactic.x = '500';
                tactic.y = '500';
                this.perspectives.forEach(perspective => {

                    if (tactic.component.toLowerCase().endsWith(perspective.perspective.toLowerCase())) {
                        tactic.x = perspective.elementView.x + Math.random() * perspective.elementView.width * 0.75 - perspective.elementView.width * 0.75 / 2;
                        tactic.y = perspective.elementView.y + Math.random() * perspective.elementView.height * 0.75 - perspective.elementView.height * 0.75 / 2;
                    }

                })
                tactic.x = Math.round(tactic.x)
                tactic.y = Math.round(tactic.y)
                tactic.width = Number(tactic.width)
                tactic.height = Number(tactic.height)
                this.addElement(tactic)
            },

            async generateImplementationModel() {

                let prompt = "";//please convert following business model canvas to user story format including actors:";

                let elementsByTypes = {};
                Object.keys(this.value.elements)
                    .forEach(key=>{
                        let element = this.value.elements[key]; 
                        if(!elementsByTypes[element._type]) elementsByTypes[element._type]=[]; 
                        elementsByTypes[element._type].push(element.name);
                    }
                );

                prompt += "\n" +Object.keys(elementsByTypes)
                    .reduce((sum, type) => {
                        let shortType = type.split(".").pop(); 
                        let stickers = elementsByTypes[type].join(", ");
                        return sum + `${shortType}:${stickers}\n`
                    }, 
                "");


                this.$refs["autoModelingDialog"].openChatDialog({prompt: prompt});
                this.BMState = true;
                this.dialogModeOfAutoModeling = true;
                this.$refs["autoModelingDialog"].autoModelingInput = false;
            },

            async generateImplementationModel2() {
                var me = this;

                var bigModel = {elements: {}, relations: {}};
                for (var index in Object.values(me.value.elements)) {
                    var element = Object.values(me.value.elements)[index]
                    // var element = this.value.elements[key];

                    if (element && element.dddModel) {
                        try {
                            var dddModel = await me._loadDDDModel(element.dddModel.projectId, element.dddModel.projectVersion);

                            me._transformAxis(dddModel, element);

                            bigModel.elements = {...bigModel.elements, ...dddModel.elements};
                            bigModel.relations = {...bigModel.relations, ...dddModel.relations};
                        } catch (e) {
                            alert(e.message)
                        }

                    }

                }

                window.localStorage['bigModel'] = JSON.stringify(bigModel);

                window.open("/#/big-event-storming", "_blank")
            },

            _loadDDDModel(projectId, version) {
                var me = this;

                return new Promise(async function (resolve, reject) {
                    if (projectId.toLowerCase().endsWith('Init'.toLowerCase())) {
                        if (projectId == 'init') {
                            resolve(JSON.parse(localStorage.getItem('localLoadData')))
                        } else {
                            alert('Please select eventStorming Model')
                        }
                    } else {
                        // me.getString(`${me.fixedDefalutStroage}://definitions/${projectId}/`)
                        let versionInfo = await me.getObject(`db://definitions/${projectId}/versionLists/${version}`);
                        let versionValue = {elements: {}, relations: {}};

                        if( versionInfo && versionInfo.valueUrl ){
                            versionValue = await me.getObject(`storage://${versionInfo.valueUrl}`);
                        } else if( versionInfo && versionInfo.versionValue ) {
                            // For not migrate public model.
                            versionValue = JSON.parse(versionInfo.versionValue.value);
                        }

                        resolve(versionValue);

                        // me.database.ref('definitions/' + projectId + '/versionLists/' + version)
                        //     .once('value', function (snapshot) {
                        //         if (snapshot.exists()) {
                        //             resolve(JSON.parse(snapshot.val()['versionValue'].value))
                        //         } else {
                        //             reject(new Error('no snapshot'));
                        //         }
                        //     })
                    }

                })


            },

            _transformAxis(dddModel, businessElement) {
                Object.values(dddModel.elements).forEach(element => {
                    if (element) {
                        element.elementView.x = element.elementView.x + businessElement.elementView.x * 5;
                        element.elementView.y = element.elementView.y + businessElement.elementView.y * 3;
                    }

                })
                Object.values(dddModel.relations).forEach(relation => {
                    if (relation.relationView.value) {

                        var points = JSON.parse(relation.relationView.value)
                        points.forEach(point => {
                            point[0] = point[0] + businessElement.elementView.x * 5;
                            point[1] = point[1] + businessElement.elementView.y * 3;
                        })

                        relation.relationView.value = JSON.stringify(points);

                    }
                })

            }
        },

        data() {
            return {
                defaultGeneratorUiInputData: {
                    generator: "BMGenerator",
                    title: "생성할 서비스명",
                    userStory: "",
                },
                BMState: false,
                dialogModeOfAutoModeling: false,
                eleCnt: 0,
                imageBase: 'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/symbol/',
                selectedCategoryIndex: null,
                perspectives: [
                    {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Key Partners",
                        "perspective": "key-partner",
                        "icon": "static/image/symbol/icons-link.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "e8f5cd23-616c-b911-5bcd-a5bd1243df24",
                            "x": 300,
                            "y": 400,
                            "width": 300,
                            "height": 600,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Key Activities",
                        "perspective": "key-activity",
                        "icon": "static/image/symbol/check.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "d8deafd1-564b-19b7-1d0b-2ace2730f6cf",
                            "x": 600,
                            "y": 250,
                            "width": 300,
                            "height": 300,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Key Resources",
                        "perspective": "key-resource",
                        "icon": "static/image/symbol/business.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "462bb51c-8efb-6657-3b04-6c754876be40",
                            "x": 600,
                            "y": 550,
                            "width": 300,
                            "height": 300,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Value Proposition",
                        "perspective": "value-proposition",
                        "icon": "static/image/symbol/gift.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "2fde0b06-3c34-d5c1-d43c-36a52718a205",
                            "x": 900,
                            "y": 400,
                            "width": 300,
                            "height": 600,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Customer Relationships",
                        "perspective": "customer-relationship",
                        "icon": "static/image/symbol/heart.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "ecdf7402-a80d-1474-ec23-9363a74698af",
                            "x": 1200,
                            "y": 250,
                            "width": 300,
                            "height": 300,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Channels",
                        "perspective": "channel",
                        "icon": "static/image/symbol/truck.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "d0183098-e987-3214-7f42-20dcf8a364c5",
                            "x": 1200,
                            "y": 550,
                            "width": 300,
                            "height": 300,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Customer Segments",
                        "perspective": "customer-segment",
                        "icon": "static/image/symbol/customer-segment.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "84f0b913-207f-7229-cdb4-a536625138c2",
                            "x": 1500,
                            "y": 400,
                            "width": 300,
                            "height": 600,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Cost Structure",
                        "perspective": "cost-structure",
                        "icon": "static/image/symbol/tag.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "5b350418-d0aa-37de-7185-2ba8613bfa25",
                            "x": 525,
                            "y": 850,
                            "width": 750,
                            "height": 300,
                            "style": "{}"
                        },
                    }, {
                        "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                        "name": "Revenue Streams",
                        "perspective": "revenue-stream",
                        "icon": "static/image/symbol/sack-dollar.png",
                        "elementView": {
                            "_type": "org.uengine.modeling.businessmodelcanvas.BusinessModelPerspective",
                            "id": "636ae7aa-186a-0a54-00cf-bf221578aab4",
                            "x": 1275,
                            "y": 850,
                            "width": 750,
                            "height": 300,
                            "style": "{}"
                        },
                    },
                ],
                elementTypes: [

                    //ValuePropositions - Product System, Service
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'value proposition',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-proposition.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Complements',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/Complements.png`,
                            'description': 'Sell additional related or ancillary products or services to a customer.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Extensions/Plug-ins',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/ExtensionsPlugins.png`,
                            'description': 'Allow first- or thirdparty additions that add functionality.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Product Bundling',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/ProductBundling.png`,
                            'description': 'Offer several products for sale as one combined product.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Modular Systems',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/ModularSystems.png`,
                            'description': 'Provide a set of individual components that can be used independently, but gain utility when combined.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Product/Service Platforms',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/businessvalue-propositions//ServicePlatforms.png`,
                            'description': 'Develop systems that connect with other, partner products and services to create a holistic offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Integrated Offering',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/IntegratedOffering.png`,
                            'description': 'Combine otherwise discrete components into a complete experience.'
                        },


                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Try Before You Buy',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/TryBeforeYouBuy.png`,
                            'description': 'Let customers test and experience an offering before investing in it.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Guarantee',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/Guarantee.png`,
                            'description': 'Remove customer risk of lost money or time stemming from product failure or purchase error.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Loyalty Programs',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/LoyaltyPrograms.png`,
                            'description': 'Provide benefits and/or discounts to frequent and high-value customers.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Added Value',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/AddedValue.png`,
                            'description': 'Include an additional service/function as part of the base price.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Concierge',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/Concierge.png`,
                            'description': 'Provide premium service by taking on tasks for which customers don’t have time.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Total Experience Management',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/TotalExperienceManagement.png`,
                            'description': 'Provide thoughtful, holistic management of the consumer experience across an offering’s lifecycle.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Supplementary Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/SupplementaryService.png`,
                            'description': 'Offer ancillary services that fit with your offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Superior Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/SuperiorService.png`,
                            'description': 'Provide service(s) of higher quality, efficacy, or with a better experience than any competitor.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Personalized Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/PersonalizedService.png`,
                            'description': 'Use the customer’s own information to provide perfectly calibrated service.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'User Communities/ Support Systems',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/UserCommunitiesSupportSystems.png`,
                            'description': 'Provide a communal resource for product/service support, use and extension.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Lease or Loan',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/LeaseorLoan.png`,
                            'description': 'Let customers pay over time to lower upfront costs.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'value-proposition',
                            'label': 'Self-Service',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/value-propositions/SelfService.png`,
                            'description': 'Provide users with control over activities that would otherwise require an intermediary to complete.'
                        },

                    ],

                    //CustomerSegments -
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-segment',
                            'label': 'customer segment',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-segment.png`,
                            'description': ''
                        },
                    ],

                    //Channels - Channel
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'channel',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Diversification',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/Diversification.png`,
                            'description': 'Add and expand into new or different channels.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Flagship Store',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/FlagshipStore.png`,
                            'description': 'Create a store to showcase quintessential brand and product attributes.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Go Direct',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/GoDirect.png`,
                            'description': 'Skip traditional retail channels and connect directly with customers.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Non-Traditional Channels',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/NonTraditionalChannels.png`,
                            'description': 'Employ novel and relevant avenues to reach customers'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Pop-up Presence',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/PopupPresence.png`,
                            'description': 'Create a noteworthy but temporary environment to showcase and/or sell offerings'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Indirect Distribution',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/IndirectDistribution.png`,
                            'description': 'Use others as resellers who take ownership over delivering the offering to the final user'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Multi-Level Marketing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/MultiLevelMarketing.png`,
                            'description': 'Sell bulk or packaged goods to an affiliated but independent sales force that turns around and sells it for you.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Cross-selling',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/Crossselling.png`,
                            'description': 'Place products, services, or information that will enhance an experience in situations where customers are likely to want to access them.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'On-Demand',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/OnDemand.png`,
                            'description': 'Deliver goods in real-time whenever or wherever they are desired.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Context Specific',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/ContextSpecific.png`,
                            'description': 'Offer timely access to goods that are appropriate for a specific location, occasion, or situation.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'channel',
                            'label': 'Experience Center',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/channel/ExperienceCenter.png`,
                            'description': 'Create a space that encourages your customers to interact with your offerings—but purchase them through a different (and often lower-cost) channel.'
                        },
                    ],

                    //CustomerRelationships - Barand ,Cusomer Engagemnet
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'customer relationship',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationship.png`,
                            'description': 'Combine brands to mutually reinforce key attributes or enhance the credibility of an offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Co-Branding',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/CoBranding.png`,
                            'description': 'Combine brands to mutually reinforce key attributes or enhance the credibility of an offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Brand Leverage',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/BrandLeverage.png`,
                            'description': '“Lend” your credibility and allow others to use your name—thus extending your brand’s reach.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Private Label',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/PrivateLabel.png`,
                            'description': 'Provide goods made by others under your company’s brand.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Brand Extension',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/BrandExtension.png`,
                            'description': 'Offer a new product or service under the umbrella of an existing brand.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Component Branding',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/ComponentBranding.png`,
                            'description': 'Brand an integral component to make a final offering appear more valuable.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Transparency',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/Transparency.png`,
                            'description': 'Let customers see into your operations and participate with your brand and offerings.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Values Alignment',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/ValuesAlignment.png`,
                            'description': 'Make your brand stand for a big idea or a set of values and express them consistently in all aspects of your company.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Certification',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/Certification.png`,
                            'description': 'Develop a brand or mark that signifies and ensures certain characteristics in third-party offerings.'
                        },


                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Process Automation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/ProcessAutomation.png`,
                            'description': 'Remove the burden of repetitive tasks from the user to simplify life and make new experiences seem magical.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Experience Simplification',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/ExperienceSimplification.png`,
                            'description': 'Reduce complexity and focus on delivering specific experiences exceptionally well.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Curation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/Curation.png`,
                            'description': 'Use a distinct point of view to separate the proverbial wheat from the chaff—and in the process create a strong identity for yourself and your followers'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Experience Enabling',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/ExperienceEnabling.png`,
                            'description': 'Extend the realm of what’s possible to offer a previously improbable experience.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Mastery',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/Mastery.png`,
                            'description': 'Help customers to obtain great skill or deep knowledge of some activity or subject'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Autonomy and Authority',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/AutonomyandAuthority.png`,
                            'description': 'Grant users the power to use your offerings to shape their own experience.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Community and Belonging',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/CommunityandBelonging.png`,
                            'description': 'Facilitate visceral connections to make people feel they are part of a group or movement.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Personalization',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/Personalization.png`,
                            'description': 'Alter a standard offering to allow the projection of the customer’s identity.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Whimsy and Personality',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/WhimsyandPersonality.png`,
                            'description': 'Humanize your offering with small flourishes of on-brand, on-message ways of seeming alive.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'customer-relationship',
                            'label': 'Status and Recognition',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/customer-relationships/StatusandRecognition.png`,
                            'description': 'Offer cues that infer meaning, allowing users— and those who interact with them—to develop and nurture aspects of their identity.'
                        },
                    ],

                    //KeyActivities - Process, Structure
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'key activity',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activity.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Process Standardization',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/ProcessStandardization.png`,
                            'description': 'Use common products, processes, procedures, and policies to reduce complexity, costs, and errors.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Localization',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/Localization.png`,
                            'description': 'Adapt an offering, process, or experience to target a culture or region.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Process Efficiency',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/ProcessEfficiency.png`,
                            'description': 'Create or produce more while using fewer resources—measured in materials, energy consumption or time.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Flexible Manufacturing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/FlexibleManufacturing.png`,
                            'description': 'Use a production system that can rapidly react to changes and still operate efficiently'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Process Automation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/ProcessAutomation.png`,
                            'description': 'Apply tools and infrastructure to manage routine activities in order to free up employees.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Crowdsourcing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/Crowdsourcing.png`,
                            'description': 'Outsource repetitive or challenging work to a large group of semi-organized individuals.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'On-Demand Production',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/OnDemandProduction.png`,
                            'description': 'Produce items after an order has been received to avoid carrying costs of inventory.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Lean Production',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/LeanProduction.png`,
                            'description': 'Reduce waste and cost in your manufacturing process and other operations.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Logistics Systems',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/LogisticsSystems.png`,
                            'description': 'Manage the flow of goods, information and other resources between the point of origin and the point of use.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Strategic Design',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/StrategicDesign.png`,
                            'description': 'Employ a purposeful approach that manifests itself consistently across offerings, brands, and experiences.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Intellectual Property',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/IntellectualProperty.png`,
                            'description': 'Protect an idea that has commercial value—such as a recipe or industrial process—with legal tools like patents.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'User Generated',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/UserGenerated.png`,
                            'description': 'Put your users to work in creating and curating content that powers your offerings.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Predictive Analytics',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/PredictiveAnalytics.png`,
                            'description': 'Model past performance data and predict future outcomes to design and price offerings accordingly.'
                        },


                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Organizational Design',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/OrganizationalDesign.png`,
                            'description': 'Make form follow function and align infrastructure with core qualities and business processes.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Incentive Systems',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/IncentiveSystems.png`,
                            'description': 'Offer rewards (financial or non-financial) to provide motivation for a particular course of action.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'IT Integration',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/ITIntegration.png`,
                            'description': 'Integrate technology resources and applications.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Competency Center',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/CompetencyCenter.png`,
                            'description': 'Cluster resources, practices and expertise into support centers that increase efficiency and effectiveness across the broader organization.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Outsourcing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/Outsourcing.png`,
                            'description': 'Assign responsibility for developing or maintaining a system to a vendor.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Corporate University',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/CorporateUniversity.png`,
                            'description': 'Provide job-specific or company-specific training for managers.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Decentralized Management',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/DecentralizedManagement.png`,
                            'description': 'Distribute decision-making governance closer to the customer or other key business interfaces.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Knowledge Management',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/KnowledgeManagement.png`,
                            'description': 'Share relevant information internally to reduce redundancy and improve job performance.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-activity',
                            'label': 'Asset Standardization',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-activities/AssetStandardization.png`,
                            'description': 'Reduce operating costs and increase connectivity and modularity by standardizing your assets.'
                        },
                    ],

                    //KeyResources - Product Perfomace
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'key resources',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resource.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Superior Product',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/SuperiorProduct.png`,
                            'description': 'Develop an offering of exceptional design, quality, and/or experience.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Ease of Use',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/EaseofUse.png`,
                            'description': 'Make your product simple, intuitive and comfortable to use.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Engaging Functionality',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/EngagingFunctionality.png`,
                            'description': 'Provide an unexpected or newsworthy experiential component that elevates the customer interaction.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Safety',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/Safety.png`,
                            'description': 'Increase the customer’s level of confidence and security.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Feature Aggregation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/FeatureAggregation.png`,
                            'description': 'Combine existing features found across offerings into a single offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Added Functionality',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/AddedFunctionality.png`,
                            'description': 'Add new functionality to an existing offering.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Performance Simplification',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/PerformanceSimplification.png`,
                            'description': 'Omit superfluous details, features, and interactions to reduce complexity.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Environmental Sensitivity',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/EnvironmentalSensitivity.png`,
                            'description': 'Provide offerings that do no harm—or relatively less harm—to the environment.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Conservation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/Conservation.png`,
                            'description': 'Design your product so that customers can reduce their use of energy or materials.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Customization',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/Customization.png`,
                            'description': 'Enable altering of the product or service to suit individual requirements or specifications.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Focus',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/Focus.png`,
                            'description': 'Design an offering specifically for a particular audience at the expense of others.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-resource',
                            'label': 'Styling',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-resources/Styling.png`,
                            'description': 'Impart a style, fashion or image.'
                        },
                    ],

                    //keyPartners - Network
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'key partner',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partner.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Merger/Acquisition',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/MergerAcquisition.png`,
                            'description': 'Combine two or more entities to gain access to capabilities and assets.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Consolidation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/Consolidation.png`,
                            'description': 'Acquire multiple companies in the same market or complementary markets.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Open Innovation',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/OpenInnovation.png`,
                            'description': 'Obtain access to processes or patents from other companies to leverage, extend, and build on expertise and/or do the same with internal IP and processes.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Secondary Markets',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/SecondaryMarkets.png`,
                            'description': 'Connect waste streams, by-products, or other alternative offerings to those who want them.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Supply Chain Integration',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/SupplyChainIntegration.png`,
                            'description': 'Coordinate and integrate information and/or processes across a company or functions of the supply chain.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Complementary Partnering',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/ComplementaryPartnering.png`,
                            'description': 'Leverage assets by sharing them with companies that serve similar markets but offer different products and services.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Alliances',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/Alliances.png`,
                            'description': 'Share risks and revenues to jointly improve individual competitive advantage.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Franchising',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/Franchising.png`,
                            'description': 'License business principles, processes, and brand to paying partners'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Coopetition',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/Coopetition.png`,
                            'description': 'Join forces with someone who would normally be your competitor to achieve a common goal.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'key-partner',
                            'label': 'Collaboration',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/key-partners/Collaboration.png`,
                            'description': 'Partner with others for mutual benefit'
                        },
                    ],

                    //RevenueStreams - Profit Model
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'revenue stream',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-stream.png`,
                            'description': ''
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Premium',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Premium.png`,
                            'description': 'Price at a higher margin than competitors, usually for a superior product, offering, experience, service or brand.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Cost Leadership',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/CostLeadership.png`,
                            'description': 'Keep variable costs low and sell high volumes at low prices.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Scaled Transactions',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/ScaledTransactions.png`,
                            'description': 'Maximize margins by pursuing high volume, large scale transactions when unit costs are relatively fixed.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Microtransactions',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Microtransactions.png`,
                            'description': 'Sell many items for as little as a dollar—or even only one cent—to drive impulse purchases at volume.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Forced Scarcity',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/ForcedScarcity.png`,
                            'description': 'Limit the supply of offerings available, by quantity, time frame or access, to drive up demand and/or prices.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Subscription',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Subscription.png`,
                            'description': 'Create predictable cash flows by charging customers up front (a one time or recurring fee) to have access to the product/ service over time.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Membership',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Membership.png`,
                            'description': 'Charge a time-based payment to permit access to locations, offerings, or services that non-members don’t have.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Installed Base',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/InstalledBase.png`,
                            'description': 'Offer a “core” product for slim margins (or even a loss) to drive demand and loyalty; then realize profit on additional products and services.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Switchboard',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Switchboard.png`,
                            'description': 'Connect multiple sellers with multiple buyers; the more buyers and sellers who join, the more valuable the switchboard.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Auction',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Auction.png`,
                            'description': 'Allow a market—and its users—to set the price for goods and services.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'User-Defined',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/UserDefined.png`,
                            'description': 'Invite customers to set a price they wish to pay.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Freemium',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Freemium.png`,
                            'description': 'Offer basic services for free, while charging a premium for advanced or special features.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Flexible Pricing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/FlexiblePricing.png`,
                            'description': 'Vary prices for an offering based on demand.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Float',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Float.png`,
                            'description': 'Receive payment prior to building the offering—and use the cash to earn interest prior to making margins.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Financing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Financing.png`,
                            'description': 'Capture revenue not directly from the sale of a product, but from structured payment plans and after-sale interest.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Ad-Supported',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/AdSupported.png`,
                            'description': 'Provide content/services for free to one party while selling listeners, viewers or “eyeballs” to another party'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Licensing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/Licensing.png`,
                            'description': 'Grant permission to some other group or individual to use your offering in a defined way for a specified payment.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Metered Use',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/MeteredUse.png`,
                            'description': 'Allow customers to pay for only what they use'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Bundled Pricing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/BundledPricing.png`,
                            'description': 'Sell in a single transaction two or more items that could be sold as standalone offerings.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Disaggregate Pricing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/DisaggregatePricing.png`,
                            'description': 'Allow customers to buy exactly—and only—what they want.'
                        },
                        {
                            'icon': 'business-value-proposition',
                            'component': 'revenue-stream',
                            'label': 'Risk Sharing',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/revenue-streams/RiskSharing.png`,
                            'description': 'Waive standard fees/costs if certain metrics aren’t achieved, but receive outsize gains when they are.'
                        },
                    ],
                    //CostStructure -
                    [
                        {
                            'icon': 'business-value-proposition',
                            'component': 'cost-structure',
                            'label': '',
                            'width': '100',
                            'height': '100',
                            'src': `${window.location.protocol + "//" + window.location.host}/static/image/business/cost-structure.png`,
                            'description': ''
                        },
                    ],
                ],
            }
        },

    }

</script>


<style>
    .business-mobile-speed-dial {
        position:fixed;
        bottom:50px;
        right:50px;
    }
    .strategyzer-link {
        position: fixed;
        left:20px;
        top:65px;
        color:black !important;
        text-decoration: none;
    }
    .strategyzer-link:hover {
        color:#1976D2 !important;
    }
    .business-model-canvas-sticker {
        position: absolute;
        width: 48px;
        left: 20px;
        padding: 4px;
        overflow: hidden;
        top: 100px;
        text-align: center;
    }
    .business-model-canvas-mobile-home-button {
        display: none;
    }
    .business-model-canvas-top-menu {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0%);
    }
    .action-btn-box {
        margin-right: 10px;
        margin-top:25px;
    }

    .action-btn {
        margin-right: 8px;
    }

    @media only screen and (max-width: 1093px) {
        .action-btn-box {
            display:none;
        }
        .business-mobile-speed-dial {
            bottom:20px;
            right:13px;
        }
        .business-mobile-speed-dial .v-btn {
            width:56px;
            height:56px;
        }
    }

    @media only screen and (max-width: 600px) {
        .business-mobile-speed-dial {
            bottom:110px;
            right:13px;
        }
        .business-mobile-speed-dial .v-btn {
            width:40px;
            height:40px;
        }
        .business-model-canvas-top-menu {
            position: absolute;
            left:120px;
            top:5px;
        }
        .strategyzer-link {
            left:35px;
        }
        .business-model-canvas-mobile-home-button {
            display: block;
            z-index:1;
        }
        .business-model-canvas-sticker {
            width: 330px !important;
            top: auto !important;
            bottom: 45px;
            left: 33px;
            padding-top: 10px;
        }
        .business-model-canvas-sticker span img {
            margin-right:5px;
        }
    }
</style>