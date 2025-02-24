<template id="lablocator">
    <v-container fluid style="height: 100%; padding: 0px;">
        <v-tooltip v-if="naviIndex == 0" right>
            <template v-slot:activator="{ on, attrs }">
                <v-card
                    style="position: fixed; left:20px; top:70px; z-index: 1; width:48px; height:26px; display: flex; align-items: center; justify-content: center;"
                    v-bind="attrs"
                    v-on="on"
                    @click="resizeGuide()"
                    color="primary"
                    v-if="isAdmin || myId==userId"
                    large
                >
                    <Icons :icon="'right'" :color="'#FFFFFF'"/>
                </v-card>
            </template>
            <span>인스트럭션 크기 조절</span>
        </v-tooltip>

        <v-row v-if="labInfo && labInfo.layout == 'vertical'"
            no-gutters 
            style="height: 100%;"
        >
            <LabLocatorChat
                    :lab-info="labInfo"
                    style="z-index: 9999"
            ></LabLocatorChat>
            <v-col>
                <v-row style="height: 300px; overflow: auto;">
                    <v-col>
                        <v-row style="position: fixed; top: 80px; background: #ffffff; width: 100%;">
                            <!-- <Countdown :deadline="deadline"></Countdown> -->
                            <v-btn @click="screenCapture()" large color="primary"
                                   v-if="isAdmin || myId==userId"
                                   class="ma-2" style="width:100px; height:36px; ">
                                제출
                            </v-btn>
                            <v-btn @click="test()" large color="primary"
                                   v-if="isAdmin && labInfo.tool == 'ide'"
                                   class="ma-2" style="width:104px; height:36px; font-size:12px;">
                                IDE 콘텐츠 저장
                            </v-btn>
                            <br/>
                            <v-btn :to="'/courses/' + courseId + '/' + classId + '/' + labId + '/class-room'"
                                   small
                                   class="ma-2">클래스룸
                            </v-btn>
                            <v-btn
                                    small
                                    @click="contextOpen()"
                                    :disabled="!loadAllgroupedLabsList"
                                    class="ma-2">랩 목록
                            </v-btn>
                            <v-dialog
                                    v-model="answerDialog"
                                    width="500"
                                    height="300"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                            v-bind="attrs"
                                            v-on="on"
                                            small
                                            class="ma-2"
                                    >
                                        응답
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title
                                            class="headline grey lighten-2"
                                            primary-title
                                    >
                                        응답
                                    </v-card-title>
                                    <v-card-text>
                                        <answer></answer>
                                    </v-card-text>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                                color="primary"
                                                text
                                                @click="answerDialog = false"
                                        >
                                            Close
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-row>
                        <v-row>
                            <v-list dense style="width: 100%">
                                <v-subheader>
                                    Instruction
                                </v-subheader>
                                <v-col>
                                    <!--                                    <v-sheet v-html="labInfo.instructionHtml"-->
                                    <!--                                             style="word-break:break-all !important"></v-sheet>-->
                                    <InstructionHtml
                                            v-if="labInfo.instructionHtml"
                                            :source="labInfo.instructionHtml"
                                            class="markdown-body"
                                    ></InstructionHtml>
                                    <vue-markdown
                                            v-else
                                            class="markdown-body"
                                            style="white-space:pre;"
                                            :source="labInfo.instructionMd"
                                    >
                                    </vue-markdown>

                                </v-col>
                                <v-divider></v-divider>
                                <v-subheader>
                                    Checkpoints
                                </v-subheader>
                                <div v-if="labInfo.tool == 'quiz'">
                                    <v-list-item v-for="(item,idx) in setNewCheckPoints" :key="idx">
                                        <v-list-item-content>
                                            <v-list-item-title>{{idx + 1}}. {{item.quizNumber}}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox
                                                    v-if="!(item.javascript || item.regExp) && isAdmin && renderComponent"
                                                    @click.stop="sendCheckPoints(item)"
                                                    v-model="item.status"
                                                    success
                                            ></v-checkbox>
                                            <v-checkbox
                                                    v-if="(item.javascript || item.regExp) || !isAdmin &&  renderComponent"
                                                    v-model="item.status"
                                                    success
                                                    readonly
                                            ></v-checkbox>
                                        </v-list-item-action>
                                    </v-list-item>
                                </div>
                                <div v-else>
                                    <v-list-item v-for="(item,idx) in labInfo.checkPoints" :key="idx">
                                        <v-list-item-content v-if="item.text">
                                            <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox
                                                    v-if="!(item.javascript || item.regExp) && isAdmin && renderComponent"
                                                    @click.stop="sendCheckPoints(item)"
                                                    v-model="item.status"
                                                    success
                                            ></v-checkbox>
                                            <v-checkbox
                                                    v-if="(item.javascript || item.regExp) || !isAdmin &&  renderComponent"
                                                    v-model="item.status"
                                                    success
                                                    readonly
                                            ></v-checkbox>
                                        </v-list-item-action>
                                    </v-list-item>
                                </div>
                            </v-list>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <!--                    <lab-tool v-model="tool" ref="toolComp"></lab-tool>-->
                    <component ref="toolComp"
                               :is="'lab-tool-' + labInfo.tool"
                               v-model="tool"
                               :lab-info="labInfo"
                               :class-info="classInfo"
                               :passAll="passAll"
                               :basicPassed="basicPassed"
                               :certi="certi"
                               @change="onResultChanged"
                               style="height: 100% !important; width: 100%">
                    </component>
                    <resize-observer @notify="handleResize"/>
                </v-row>
            </v-col>
        </v-row>
        <v-row v-else-if="labInfo" style="height: 100%; margin:0px !important;">
            <v-navigation-drawer
                    v-model="guideOpened"
                    app
                    clipped
                    stateless
                    :width="naviSize"
                    style="z-index:99;"
            >
                <!-- 비디오 추가 -->
                <v-dialog v-model="openVideoTextfield" width="400">
                    <v-card style="height: 100%;">
                        <v-card-title style="background-color: #0097e6; color: white; margin-left:-10px;">
                            <v-icon color="white">mdi-link-variant</v-icon>&nbsp;Input Link
                        </v-card-title>
                        <v-card-text>
                            <v-text-field 
                                v-model="video.url" 
                                clearable filled 
                                label="Youtube Link"
                                style="margin-top: 15px;">
                            </v-text-field>
                        </v-card-text>
                        <v-card-actions style="justify-content: flex-end; margin-top: -40px;">
                            <v-btn @click="openVideoTextfield = false" text>cancel</v-btn>
                            <v-btn @click="addVideo()" color="primary" text>save</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <div v-if="labInfo.tool == 'url'">
                    <replay-player></replay-player>
                </div>
                <div>
                    <div v-if="labInfo && labInfo.video && renderComponent">
                        <div>
                            <youtube-media
                                    style="width:100%; height: 100%;"
                                    :video-id="getLabVideoId"
                            ></youtube-media>
                        </div>
                    </div>
                    <!-- // 비디오 없는 경우 -->
                    <div v-else>
                        <v-card v-if="!openVideoTextfield && isOwner || isTeacher || isAdmin"
                                style="width: auto; height: 180px; background-color: #dcdde1; margin-bottom: 5px;"
                                @click="openVideoTextfield = true">
                            <div style="text-align: center;">
                                <v-icon style="font-size: 40px;
                                    margin-top: 64px;
                                    background-color: gray;
                                    width: 70px;
                                    height: 55px;
                                    color: #dcdde1;
                                    border-radius: 27%"
                                >mdi-play
                                </v-icon>
                            </div>
                        </v-card>
                    </div>
                    <div class="lab-locator-fixed">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="resizeGuide()"
                                        color="primary" v-if="isAdmin || myId==userId" icon large>
                                    <span style="color:#1976d2; font-weight:900; font-size:26px; margin-top:-4px;">↹</span>
                                </v-btn>
                            </template>
                            <span>인스트럭션 크기 조절</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="answerDialog=true"
                                        color="primary" icon large>
                                    <v-icon>mdi-comment-check-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>응답</span>
                        </v-tooltip>

                        <v-tooltip v-if="isOwner || isTeacher || isAdmin && video.url" bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="editLabVideo()"
                                        color="primary" icon large>
                                    <Icons :icon="'video-settings-rounded'" :width="30" :height="30" style="margin-top:-4px;" />
                                </v-btn>
                            </template>
                            <span>유튜브 Url 수정</span>
                        </v-tooltip>

                        <v-tooltip v-if="!opentextfield" bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-if="isOwner || isTeacher || isAdmin"
                                        v-bind="attrs" v-on="on"
                                        @click="openMarkdown(labInfo.instructionMd)"
                                        color="primary"
                                        icon large
                                        style="margin-left:5px;"
                                >
                                    <v-icon style="margin-top:5px;">mdi-border-color</v-icon>
                                </v-btn>
                                <!-- <MergeInstruction
                                        :cmOption="cmOption"
                                        :labInfo="labInfo"
                                        style="margin-top:-5px;"
                                /> -->
                            </template>
                            <span>인스트럭션 수정</span>
                        </v-tooltip>

                        <v-tooltip v-if="savebtn" bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="on"
                                        icon large
                                        style="margin-left:5px;"
                                        color="primary" :disabled="loading" @click="save(instructionText)">
                                    <v-icon>mdi-content-save</v-icon>
                                </v-btn>
                            </template>
                            <span>인스트럭션 저장</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    style="margin-left:5px;" v-bind="attrs" v-on="on"
                                    @click="uploadImage()"
                                    color="primary" icon large
                                >
                                    <Icons :icon="'add-picture'" :size="26" />
                                </v-btn>
                            </template>
                            <span>이미지 업로드</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="screenCapture()"
                                    color="primary" v-if="isAdmin || myId==userId" icon large
                                >
                                    <Icons v-if="!isCapturing" :icon="'upload-picture'" :size="26" />
                                    <v-icon v-else>{{setIcon}}</v-icon>
                                </v-btn>
                            </template>
                            <span>제출</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        style="margin-left:5px;" v-bind="attrs" v-on="on"
                                        @click="openClassRoom()"
                                        color="primary" icon large>
                                    <v-icon>
                                        mdi-account-multiple
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>유저 목록</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn fill="none" style="margin-left:5px;" v-bind="attrs" v-on="on"
                                        color="primary" icon large
                                        :disabled="!loadAllgroupedLabsList"
                                        @click="contextOpen()"
                                >
                                    <v-icon>mdi-view-headline</v-icon>
                                </v-btn>
                            </template>
                            <span>랩 목록</span>
                        </v-tooltip>

                        <v-dialog
                                v-model="answerDialog"
                                width="500"
                                height="300"
                        >
                            <v-card>
                                <v-card-title
                                        class="headline grey lighten-2"
                                        primary-title
                                >
                                    응답
                                </v-card-title>
                                <v-card-text>
                                    <answer></answer>
                                </v-card-text>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                            color="primary"
                                            text
                                            @click="answerDialog = false"
                                    >
                                        Close
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <!-- <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="test()" color="primary"
                                        v-if="isAdmin && labInfo.tool == 'ide'" icon large>
                                    <v-icon>mdi-content-save</v-icon>
                                </v-btn>
                            </template>
                            <span>IDE 콘텐츠 저장</span>
                        </v-tooltip>
                        
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn style="margin-left:5px;" v-bind="attrs" v-on="on" @click="resetConfig()"
                                    color="primary" v-if="myId==userId && labInfo.tool == 'ide'" icon large>
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>Reset Config</span>
                        </v-tooltip> -->

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-chip
                                        class="ma-2"
                                        :color="attendance ? 'green darken-1':'red darken-1'"
                                        text-color="white"
                                        v-bind="attrs"
                                        v-on="on"
                                        small
                                >
                                    {{labStateText}}
                                </v-chip>
                            </template>
                            <span v-if="attendance"> 출석처리 되었습니다</span>
                            <span v-else>출석처리가 되려면 3분을 기다려야 합니다</span>
                        </v-tooltip>
                    </div>


                    <v-navigation-drawer
                            v-model="menuOpen"
                            absolute
                            temporary
                            style="width:100%; z-index:100;"

                    >
                        <!-- <v-card
                            v-if="menuOpen"
                            class="mx-auto"
                            width="300"
                        > -->
                        <v-list :key="updateList">
                            <v-list-item-group
                                    color="primary"
                            >
                                <v-row style="margin:0;">
                                    <v-col clos="10">
                                        <v-btn @click.prevent="onClick(listText)" text>
                                            <v-icon>mdi-arrow-left</v-icon>
                                            <b>{{listText}}</b>
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-btn @click="contextOpen()" icon>
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider/>
                                <div v-for="(groupinfo, i) in classInfo.groupedLabsList" :key="i">
                                    <!-- <v-list-item v-if="groupinfo && !groupinfo.labsList.length > 0" @click="onClick(groupinfo.groupName)">
                                        <v-list-item-title>{{groupinfo.groupName}}</v-list-item-title>
                                    </v-list-item> -->

                                    <v-list-group
                                            v-if="groupinfo && groupinfo.labsList.length > 0 && currentLabInfo"
                                            :value="groupinfo.groupName == currentLabInfo.groupName ? true:false"
                                    >
                                        <template v-slot:activator>
                                            <v-list-item-title><b>{{groupinfo.groupName}}</b></v-list-item-title>
                                        </template>
                                        <div v-for="(lab, i) in groupinfo.labsList" :key="i">
                                            <div v-if="AlllabsList[groupinfo.groupName] && AlllabsList[groupinfo.groupName][lab]">
                                                <v-list-item
                                                        v-if="AlllabsList[groupinfo.groupName][lab].active || isAdmin"
                                                        link
                                                        :style="lab == currentLabInfo.labId ? 'background-color: #dcf0ff':''"
                                                        @mouseenter="mouseenterInLab = lab"
                                                        @mouseleave="mouseenterInLab = null"
                                                >
                                                    <v-list-item-content @click="onClick(lab)">
                                                        <v-list-item-title style="font-size: 13px;">
                                                            <li :style="AlllabsList[groupinfo.groupName][lab].active ? '':'opacity: 0.4;'">
                                                                {{AlllabsList[groupinfo.groupName][lab].labName}}
                                                                <v-chip v-if="AlllabsList[groupinfo.groupName][lab].labStatus && AlllabsList[groupinfo.groupName][lab].labStatus.status=='completed'"
                                                                        color="green"
                                                                        text-color="white"
                                                                        style="margin-left: 5px;"
                                                                        x-small>완료
                                                                </v-chip>
                                                                <v-chip v-if="AlllabsList[groupinfo.groupName][lab].labStatus && AlllabsList[groupinfo.groupName][lab].labStatus.status=='started'"
                                                                        color="red"
                                                                        text-color="white"
                                                                        style="margin-left: 5px;"
                                                                        x-small>진행중
                                                                </v-chip>
                                                                <v-chip
                                                                        v-if="AlllabsList[groupinfo.groupName][lab].passMessage"
                                                                        :color="AlllabsList[groupinfo.groupName][lab].passMessage == '접속'? 'blue darken-1' :'green' "
                                                                        text-color='white'
                                                                        x-small
                                                                        style="margin-left: 5px;"
                                                                >
                                                                    {{AlllabsList[groupinfo.groupName][lab].passMessage}}
                                                                </v-chip>
                                                            </li>
                                                        </v-list-item-title>
                                                    </v-list-item-content>

                                                    <v-list-item-icon>
                                                        <v-icon style="font-size: 18px;"
                                                                v-if="mouseenterInLab == lab"
                                                                @click.native="onClick(lab, 'newTab')">
                                                            mdi-open-in-new
                                                        </v-icon>
                                                    </v-list-item-icon>
                                                </v-list-item>
                                            </div>
                                            <v-list-item v-else @click.native="onClick(lab)">
                                                <li>{{lab}}</li>
                                            </v-list-item>
                                        </div>

                                    </v-list-group>
                                </div>
                            </v-list-item-group>
                        </v-list>
                        <!-- </v-card> -->
                    </v-navigation-drawer>
                    <!-- <v-menu
                        :content-class="setClass"
                        v-model="menuOpen"
                        bottom
                        origin="center center"
                        transition="scale-transition"
                    >
                        <v-list dense style="overflow-y:scroll; width: 370px; height: 200px;">
                            <v-list-item-group
                                color="primary"
                                v-model="selectedLabNumber"
                            >
                                <v-list-item
                                    @click.prevent="onClick($event.target.innerText)"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title v-text="listText"></v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                                <div v-for="(lab, i) in labsList" :key="i">
                                    <v-list-item
                                            @click.prevent="onClick(lab.labId)"
                                            :key="i"
                                    >
                                            <v-list-item-content>
                                                <v-list-item-title
                                                        v-text="lab ? lab.labName : ''"
                                                ></v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>
                                </div>
                            </v-list-item-group>
                        </v-list>
                    </v-menu> -->

                    <v-list dense style="margin-bottom:60px;">
                        <!-- <v-subheader>
                            <div v-if="labInfo.tool == 'url' && showUrlText">
                                <v-btn
                                        small
                                        rounded
                                        outlined
                                        color="primary"
                                        @click="openUrltextfield()"
                                        style="margin-right: 10px;"
                                >{{urlText}}
                                </v-btn>
                            </div>
                        </v-subheader> -->
                        <!-- <v-col v-if="urltextfield">
                            <v-text-field label="input url" v-model="urlText"
                                        @keydown.enter="sendUrl(urlText)"></v-text-field>
                            <div style="text-align: right">
                                <v-btn style="margin-right: 10px;" @click="urltextfield=false">cancel</v-btn>
                                <v-btn color="primary" @click="sendUrl(urlText)">send</v-btn>
                            </div>
                        </v-col> -->
                        <v-divider></v-divider>
                        <v-col v-if="opentextfield" style="margin-top:25px;">
                            <vue-simplemde style="overflow:scroll;" v-model="instructionText" ref="markdownEditor"/>
                        </v-col>
                        <!-- <v-col style="text-align: right">
                            <v-btn style="margin-right: 10px; color: white" v-if="savebtn && !isOwner" color="red"
                                @click="resetInstruction()">초기화
                            </v-btn>
                            <v-btn style="margin-right: 10px;" v-if="savebtn" @click="cancel()">Cancel</v-btn>
                        </v-col> -->
                        <v-col v-if="!opentextfield" :style="loadInstruction ? 'opacity: 0.4':''">
                            <InstructionHtml
                                    v-if="labInfo.instructionHtml"
                                    :source="labInfo.instructionHtml"
                            ></InstructionHtml>
                            <vue-markdown
                                    v-else
                                    class="markdown-body"
                                    :source="labInfo.instructionMd"
                                    style="margin:0 10px 0 0px;"
                            >
                            </vue-markdown>
                        </v-col>
                        <v-divider></v-divider>
                        <v-subheader>
                            Checkpoints
                            <v-col>
                                <v-icon v-if="isAdmin && !editCheckpoint && labInfo.tool !='quiz'" small
                                        @click="openEditCheckpointField()">
                                    mdi-border-color
                                </v-icon>
                            </v-col>
                        </v-subheader>
                        <div v-if="labInfo.tool =='quiz'">
                            <v-list-item v-for="(item,idx) in setNewCheckPoints" :key="idx">
                                <v-list-item-content v-if="editCheckpoint">
                                    <span style="display: flex;">
                                        <b>{{idx + 1}}.</b> 
                                        <v-text-field
                                                @click:append-outer="removeCheckpoint(item)"
                                                append-outer-icon="mdi-minus-circle-outline"
                                                style="margin-top: -20px; margin-left: 6px;"
                                                v-model="item.text"/>
                                    </span>
                                </v-list-item-content>
                                <v-list-item-content v-else>
                                    <v-list-item-title>{{idx + 1}}. {{item.quizNumber}}</v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action v-if="!editCheckpoint">
                                    <v-checkbox
                                            v-if="isAdmin && renderComponent"
                                            @click.stop="sendCheckPoints(item)"
                                            v-model="item.status"
                                            success
                                    ></v-checkbox>
                                    <v-checkbox
                                            v-if="!isAdmin && renderComponent"
                                            v-model="item.status"
                                            success
                                            readonly
                                    ></v-checkbox>
                                </v-list-item-action>
                            </v-list-item>
                        </div>
                        <div v-else>
                            <div v-if="editCheckpoint">
                                <v-list-item v-for="(item,idx) in copyCheckPoints" :key="idx">
                                    <v-list-item-content>
                                        <span style="display: flex;">
                                            <b>{{idx + 1}}.</b> 
                                            <v-text-field
                                                    @click:append-outer="removeCheckpoint(item)"
                                                    append-outer-icon="mdi-minus-circle-outline"
                                                    style="margin-top: -20px; margin-left: 6px;"
                                                    v-model="item.text"></v-text-field>
                                        </span>
                                    </v-list-item-content>
                                </v-list-item>
                            </div>
                            <div v-else>
                                <v-list-item v-for="(item,idx) in labInfo.checkPoints" :key="idx">
                                    <v-list-item-content>
                                        <v-list-item-title v-if="item.text">{{idx + 1}}. {{item.text}}
                                        </v-list-item-title>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-checkbox
                                                v-if="isAdmin && renderComponent"
                                                @click.stop="sendCheckPoints(item)"
                                                v-model="item.status"
                                                success
                                        ></v-checkbox>
                                        <v-checkbox
                                                v-if="!isAdmin && renderComponent"
                                                v-model="item.status"
                                                success
                                                readonly
                                        ></v-checkbox>
                                    </v-list-item-action>
                                </v-list-item>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <v-icon v-if="editCheckpoint" @click="addNewCheckpoint()">mdi-plus-circle</v-icon>
                        </div>
                        <div v-if="editCheckpoint" style="float: right; margin-top: 10px; margin-right: 10px;">
                            <v-btn text small @click="closeAddCheckPointField()">
                                cancel
                            </v-btn>
                            <v-icon v-if="updateCheckpointLoading" color="primary">mdi-spin mdi-loading</v-icon>
                            <v-btn v-else color="primary" text small
                                    @click="updateCheckpoints()">
                                save
                            </v-btn>
                        </div>
                        <div v-if="editCheckpoint">
                            <br><br>
                        </div>
                        <v-divider></v-divider>

                        <v-subheader v-if="(labInfo.hints && labInfo.hints.length > 0) || isAdmin">
                            Hints
                            <v-col>
                                <v-icon v-if="isAdmin && !editHints" small @click="editHints = true">
                                    mdi-border-color
                                </v-icon>
                            </v-col>
                        </v-subheader>
                        <div v-if="labInfo.hints">
                            <v-list-item v-for="(item,idx) in labInfo.hints" :key="idx">
                                <v-list-item-content v-if="editHints">
                                    <span style="display: flex;">
                                        <b>{{idx + 1}}.</b> 
                                        <v-text-field
                                                :rules="validateRules"
                                                @click:append-outer="removeHints(idx)"
                                                append-outer-icon="mdi-minus-circle-outline"
                                                style="margin-top: -20px; margin-left: 6px;"
                                                v-model="item.text"/>
                                    </span>
                                </v-list-item-content>
                                <v-list-item-content v-else>
                                    <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </div>
                        <!-- <span v-if="addHints" v-for="(count ,idx) in appendCount" :key="idx" style="display: flex; margin-top: 10px; margin-right: 15px; margin-left: 17px;">
                            <b>{{labInfo.hints.length + 1 + idx}}.</b> 
                            <v-text-field 
                                :rules="validateRules"
                                @click:append-outer="addHints = false, hints[idx] = ''"
                                append-outer-icon="mdi-minus-circle-outline"
                                style="margin-top: -20px; margin-left: 6px;" 
                                v-model="hints[idx]" />
                        </span> -->
                        <div style="text-align: center;">
                            <v-icon v-if="editHints" @click="addNewHint()">mdi-plus-circle</v-icon>
                        </div>
                        <div style="float: right; margin-top: 10px; margin-right: 10px;">
                            <v-btn v-if="editHints" text small @click="closeAddHintsField()">
                                cancel
                            </v-btn>
                            <v-btn color="primary" text small v-if="editHints"
                                    :disabled="checkValidateHints"
                                    @click="updateHints(labInfo, hints)">
                                save
                            </v-btn>
                        </div>
                        <div v-if="editCheckpoint">
                            <br><br>
                        </div>
                    </v-list>
                    <v-divider v-if="(labInfo.hints && labInfo.hints.length > 0) || isAdmin"></v-divider>
                
                </div>
                <LabLocatorChat
                        :lab-info="labInfo"
                ></LabLocatorChat>
            </v-navigation-drawer>
            <v-navigation-drawer
                    permanent
                    absolute
                    right
                    v-if="showClassroom"
                    :style="openWideScreen ? 'width: 100%;':'width: 400px;'"
                    style="z-index:3;"
            >
                <v-btn v-if="!openWideScreen" :disabled="loadingClassroom" @click="changedClassroomSize()" depressed
                       absolute style="right:50px; font-size:20px;" icon>
                    <v-icon>mdi-arrow-expand</v-icon>
                </v-btn>
                <v-btn
                        v-if="openWideScreen"
                        absolute
                        @click="changedClassroomSize()"
                        depressed icon
                        style="right:50px; font-size:20px;"
                >
                    <v-icon>mdi-keyboard-tab</v-icon>
                </v-btn>
                <v-btn @click="closeUserList()"
                       depressed
                       icon
                       absolute
                       style="font-size:20px; right:20px">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <ClassRoom v-if="showClassroom"/>
            </v-navigation-drawer>

            <div style="padding: 0px; height: 100% !important; width: 100%">
                <div style="height:100%;">
                    <div style="height:100%;">
                        <!--                        <lab-tool v-model="tool" :lab-info="labInfo" :class-info="classInfo" ref="toolComp"></lab-tool>-->
                        <component ref="toolComp"
                                    :is="'lab-tool-' + labInfo.tool"
                                    v-model="tool"
                                    :passAll="passAll"
                                    :certi="certi"
                                    :basicPassed="basicPassed"
                                    :lab-info="labInfo"
                                    :class-info="classInfo"
                                    @change="onResultChanged"
                        >
                        </component>
                        <resize-observer @notify="handleResize"/>
                    </div>
                </div>
            </div>
        </v-row>
        <v-row v-else>
            <v-col>
                <v-skeleton-loader
                        indeterminate
                        ref="skeleton"
                        type="image"
                        style="width:20%;
                        height:96.5%;
                        position:absolute;
                        top:10px;
                        left:10px;"
                >
                </v-skeleton-loader>
            </v-col>
            <v-col>
                <v-skeleton-loader
                        indeterminate
                        ref="skeleton"
                        type="image"
                        style="width:78%;
                        height:96.5%;
                        position:absolute;
                        top:10px;
                        left:21.5%;"
                >
                </v-skeleton-loader>
            </v-col>
        </v-row>
        <v-snackbar
                v-model="snackBar.show"
                timeout="3000"
                auto-height
                :color="snackBar.Color"
                multi-line
        >
            <v-layout align-center pr-4>
                <v-icon v-if="snackBar.icon" class="pr-3" dark large>{{ snackBar.icon }}</v-icon>
                <v-layout column>
                    <div v-if="snackBar.title">
                        <strong>{{ snackBar.title }}</strong>
                    </div>
                    <div>{{ snackBar.Text }}</div>
                </v-layout>
            </v-layout>
        </v-snackbar>
        <!-- <v-snackbar
                v-model="snackBar.show"
                timeout="3000"
                :color="snackBar.Color"
        >
            <b>{{ snackBar.Text }}</b>
            <template v-slot:action="{ attrs }">
                <v-btn
                        color="white"
                        text
                        v-bind="attrs"
                        @click="snackBar.show = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar> -->
        <v-snackbar
                v-model="submitImageSnackbar"
                color="success"
                :timeout=2000
                top
        >제출되었습니다.
        </v-snackbar>
        <v-dialog
                v-model="openResultDialog"
                width="800"
        >
            <v-card width="800">
                <v-card-title>결과 제출</v-card-title>
                <div style="text-align: -webkit-center;">
                    <v-img style="width: 90%" :src="tmpImage"></v-img>
                </div>
                <v-card-actions style="justify-content: right;">
                    <v-btn style="margin-right: 10px;" text @click="openResultDialog = false">취소</v-btn>
                    <v-btn :disabled="!tmpImage" color="primary" text @click="submitResultByUser(tmpImage)">제출</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
                v-model="imageWindow"
                width="800"
        >
            <v-card class="pa-4 ma-0">
                <v-row class="pa-0 ma-0">
                    <v-card-title class="pa-0 ma-0">결과 제출</v-card-title>
                    <v-spacer></v-spacer>
                    <v-icon @click="deleteImage()">mdi-close</v-icon>
                </v-row>
                <div>
                    <div v-if="!imgFile"
                         class="gs-info-bg"
                         style="text-align: center;"
                    >
                        <div>이미지 업로드 방법 선택</div>
                        <div class="gs-info-sub-bg" style="margin: 0 auto;">
                            <div class="gs-info-sub-title" style="text-align: left;">
                                1. 클립보드 이미지 붙여넣기 ctrl + V<br>
                                2. 내 PC 이미지 클릭 후 업로드
                            </div>
                        </div>
                    </div>
                    <v-img class="img-file-style" :src="imgFile ? imgFile:null"></v-img>
                </div>
                <v-row class="ma-0 pa-0 pt-4">
                    <v-spacer></v-spacer>
                    <v-btn style="margin-right: 10px;" text @click="selectFile()">내 PC 이미지</v-btn>
                    <v-btn
                        color="primary" text
                        @click="submitResultByUser(imgFile)"
                    >제출
                    </v-btn>
                </v-row>
            </v-card>
        </v-dialog>
        <div class="modal">
            <div class="modalBox">
            </div>
        </div>
    </v-container>
</template>


<script>
    // import LabBase from "./LabBase"
    import LabBase from "./LabStorageBase";
    // import LabTool from "./tools/LabTool"
    import ReplayPlayer from "./ReplayPlayer";
    import Countdown from 'vuejs-countdown'
    import Answer from './Answer'
    import LabLocatorChat from './LabLocatorChat'
    import html2canvas from 'html2canvas'
    import DiffMatchPatch from "diff-match-patch";
    import firebase from 'firebase'
    import IDEMixins from "./tools/IDEMixins"

    const diffPatcher = new DiffMatchPatch();
    import {mdiMarkdown} from '@mdi/js'
    import BillingCounter from '../BillingCounter'
    import LabToolJupyter from "./tools/LabToolJupyter";
    import LabToolEventStorming from "./tools/LabToolEventStorming";
    import LabToolKuberEz from "./tools/LabToolKuberEz";
    import LabToolQuiz from "./tools/LabToolQuiz";
    import LabToolIde from "./tools/LabToolIDE";
    import LabToolBusinessModelCanvas from "./tools/LabToolBusinessModelCanvas";
    import LabToolUrl from "./tools/LabToolUrl";
    import {codemirror} from 'vue-codemirror'
    import MergeInstruction from './MergeInstruction.vue'
    import VueContext from 'vue-context';
    import 'vue-context/src/sass/vue-context.scss';
    import ClassRoom from './ClassRoom';
    import InstructionHtml from "../InstructionHtml";
    import ProvisionIndication from "../payment/ProvisionIndication";

    var jp = require('jsonpath');
    var FileSaver = require('file-saver');

    //<< codeblock
    import Prism from 'prismjs'
    import Clipboard from 'clipboard'
    import {once} from "events";
    //codeblock >>

    export default {
        name: "LabLocator",
        components: {
            ProvisionIndication,
            InstructionHtml,
            BillingCounter,
            LabLocatorChat,
            ReplayPlayer,
            // LabTool,
            Countdown,
            Answer,
            LabToolJupyter,
            LabToolEventStorming,
            LabToolKuberEz,
            LabToolQuiz,
            LabToolIde,
            LabToolBusinessModelCanvas,
            LabToolUrl,
            codemirror,
            MergeInstruction,
            VueContext,
            ClassRoom
        },
        mixins: [LabBase, IDEMixins],
        props: {
            archive: Boolean
        },
        data: () => ({
            submitImageSnackbar: false,
            submitImage: null,
            sumbitType: null,
            sumbitKeyDownEvent: null,
            mouseenterInLab: null,
            copyCheckPoints: null,
            //GroupedLabsList
            setTimeOutId: null,
            updateList: 0,
            currentLabInfo: null,
            AlllabsList: {},

            //  
            tmpImage: null,
            urlText: null,
            // showUrlText: false,
            // htmlRules: value => {
            //     const pattern = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            //     return pattern.test(value) || 'Invalid URL'
            // },

            labInfo: null,
            renderComponent: true,
            tool: {result: null},
            guideOpened: true,
            autoSubmit: '',
            deadline: null,
            answerDialog: false,
            resultInterval: '',
            classInfo: null,
            naviSizeList: ["0", "400", "800vw"],
            naviIndex: 1,
            videoHeightIndex: 0,
            naviSize: '400',
            videoHeight: ['180px', '180px'],
            naviSizeScale: "up",
            attendanceSetTimeout: null,
            attendanceTime: 0,
            attendanceState: '접속',
            attendance: false,
            screenShot: null,
            opentextfield: false,
            savebtn: false,
            oldValue: '',
            // urltextfield: false,
            loading: true,
            setInstruction: '',
            snackBar: {
                Text: '',
                show: false,
                Color: null,
            },
            passAll: false,
            editCheckpoint: false,
            setOldCheckPoints: null,
            instructionText: null,
            certi: null,
            passAllCheckPoints: false,
            basicPassed: 0,
            submitted: false,
            standardCerti: [],
            addHints: false,
            editHints: false,
            setOldHints: null,
            hints: "",
            updateCheckpointLoading: false,

            loadInstruction: false,
            resetInstructionMd: '',
            // openLabList: false,


            video: {
                url: null,
                price: 0
            },
            openVideoTextfield: false,

            cmOption: {
                value: '',
                origLeft: null,
                orig: '',
                connect: 'align',
                mode: 'text/html',
                lineNumbers: true,
                collapseIdentical: false,
                highlightDifferences: true,
            },
            listText: "라운지로 이동",
            menuOpen: false,
            labsList: [],
            loadAllLabsList: false,
            loadAllgroupedLabsList: false,
            hideIpcRender: false,
            // updateYoutube: 0,
            openResultDialog: false,
            isCapturing: false,
            tmpImage: null,
            autoOpenIDE: true,
            isOwner: false,
            rootPath: null,
            setNewCheckPoints: [],

            validateRules: [
                v => !!v || '추가할 내용을 작성해주세요.',
            ],
            showClassroom: false,
            openWideScreen: false,
            activeFlag: false,
            timer: null,

            keydownEvent: null,
            mouseupEvent: null,
            loadingClassroom: true,
            intervalChatPush: null,
            imageWindow: false,
            imgFile: null,
        }),
        async created() {
            var me = this
            this.text = "input Url"
            window.addEventListener('message', function (e) {
                if (e.data.message === 'helpMessage') {
                    var message = {
                        email: me.$route.params.userId,
                        message: '헬프미',
                    }
                    me.putString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`messages/${me.$route.params.userId.replace(/\./gi, '_')}`), message);
                }

            });
            var attendanceExsit = null
            if (me.userId) {
                attendanceExsit = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/attendance`))
                if (!attendanceExsit) {
                    attendanceExsit = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/attendance`))
                }
            }

            // console.log('Email:: ', me.userId.replace(/\./gi, '_'), ' path:', me.getVideoId)

            me.$EventBus.$on('resizeGuide', function () {
                if (!me.guideOpened) {
                    me.guideOpened = true
                } else {
                    if (me.naviSizeScale == "up") {
                        me.naviIndex = me.naviIndex + 1;
                        me.naviSize = me.naviSizeList[me.naviIndex];
                        if (me.naviIndex == 2) {
                            me.videoHeightIndex = 1;
                            me.naviSizeScale = "down";
                        } else {
                            me.videoHeightIndex = 0;
                        }
                    } else {
                        me.naviIndex = me.naviIndex - 1;
                        me.naviSize = me.naviSizeList[me.naviIndex];
                        if (me.naviIndex == 0) {
                            me.naviSizeScale = "up";
                        }
                    }
                    me.$EventBus.$emit('lab_VideoSize', me.videoHeight[me.videoHeightIndex])
                }
            })

            if (attendanceExsit) {
                me.attendance = true
                me.attendanceState = '출석'
                me.attendanceTime = attendanceExsit
            } else {
                me.attendanceTimer()
            }

            me.$EventBus.$on('closeClassroom', function () {
                me.closeClassroom()
            })

            me.$EventBus.$on('showLoading', function () {
                me.loadingClassroom = false
            })

            me.$EventBus.$on('newMessageCnt', function (data) {
                var chatStatus = sessionStorage.getItem("chatStatus")

                if (data[0] > 0 && me.isAdmin && !data[1]) {
                    if (chatStatus == 'true') {
                        return false
                    }

                    clearInterval(me.intervalChatPush)
                    me.intervalChatPush = setInterval(() => {
                        if (window.document.title == "새 메세지가 도착했습니다" + " (" + data[0] + ")") {
                            window.document.title = me.labInfo.labName
                        } else {
                            window.document.title = "새 메세지가 도착했습니다" + " (" + data[0] + ")"
                        }
                    }, 1000);
                    //window.document.title = me.labInfo.labName + "("+data[0]+") - 새 메세지가 도착했습니다."
                } else {
                    clearInterval(me.intervalChatPush)
                    window.document.title = me.labInfo.labName
                }

            })
        },
        watch: {
            value(newVal) {
                this.$emit('input', newVal);
            },
            instructionText() {
                this.$nextTick(function () {
                    Prism.highlightAll()
                    this.instructionCodeBlockClipBoard()
                    this.instructionImage()
                });
            },
            openResultDialog() {
                var me = this

                if (me.openResultDialog) {
                    me.hideIpcRender = true

                    me.addKeydownEventListener("submit")

                } else {
                    me.hideIpcRender = false
                    window.removeEventListener("keydown", me.submitImage);
                }
            },
            answerDialog() {
                if (this.answerDialog) {
                    this.hideIpcRender = true
                } else this.hideIpcRender = false
            },
            openVideoTextfield() {
                if (this.openVideoTextfield) {
                    this.hideIpcRender = true
                } else this.hideIpcRender = false
            },
            hideIpcRender() {
                if (window.ipcRenderer) {
                    if (this.hideIpcRender) {
                        window.ipcRenderer.send("hideView");
                    } else {
                        var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("resizeView", {
                            x: $(".v-navigation-drawer").width(),
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
                }
            },
            guideOpened(newVal) {
                if (window.ipcRenderer) {
                    var width = newVal ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                    var height = $(".v-main").height()
                    window.ipcRenderer.send("resizeView", {
                        x: newVal ? $(".v-navigation-drawer").width() : 0,
                        y: $(".v-toolbar").height(),
                        width: width,
                        height: height
                    })
                }
            },
            "setInstructionText":
                _.debounce(function (newVal, oldVal) {
                    var me = this
                    // console.log(me.oldValue)
                    // console.log(newVal)
                    if (me.opentextfield) {
                        var diff = diffPatcher.patch_make(me.oldValue, newVal)
                        // console.log(diff)
                        if (me.oldValue != newVal) {
                            if (me.isAdmin) {
                                var message = {
                                    userId: localStorage.getItem('email'),
                                    userName: localStorage.getItem('userName'),
                                    diffMessage: diff,
                                    instruction: true,
                                }
                                try {
                                    me.pushString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction', message);
                                    me.oldValue = newVal
                                } catch (e) {
                                    alert('수정에 실패하였습니다. : ' + e.message)
                                }

                            }
                        }
                        me.loading = false
                    }
                }, 1000),
            // "text":
            //     _.debounce(function (newVal, oldVal) {
            //         var me = this;
            //         var message = {
            //             userId: 'uEngine',
            //             userName: 'uEngine',
            //             url: newVal,
            //         };
            //         me.pushString('labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice', message);
            //     }, 1000),
        },
        computed: {
            fileServerUrl() {
                var me = this
                var apiUrl = "kuberez.io";
                if (me.classInfo.ideUrl)
                    return `${me.getProtocol()}//${me.classInfo.ideUrl}-file-server.${apiUrl}`;
                else
                    return `${me.getProtocol()}//file.${apiUrl}`;
            },
            setIcon() {
                if (this.isCapturing) {
                    return 'mdi-spin mdi-loading'
                }
            },
            setClass() {
                var me = this
                if (me.isOwner || me.isTeacher || me.isAdmin) {
                    return 'admin'
                } else {
                    return 'student'
                }
            },
            savedIDEAmount() {
                if (this.userInfo && this.userInfo.savedToolTime)
                    return Number(this.userInfo.savedToolTime.toFixed(1))
                return 0
            },
            savedCoinAmount() {
                if (this.userInfo && this.userInfo.savedCoin)
                    return Number(this.userInfo.savedCoin)
                return 0
            },
            setInstructionText() {
                this.loading = true
                if (this.labInfo && this.instructionText) {

                    this.labInfo.instructionMd = this.instructionText
                }
                return this.instructionText

            },
            toolStyle() {
                if (this.myId) {
                    return 'padding: 0px; height: 100%; width: 100%;'
                }
                return 'padding: 0px; height: 80%; width: 100%;'

            },
            getNowTimeStamp() {
                return Date.now()
            },
            getLabVideoId() {
                var me = this
                if (me.labInfo && me.labInfo.video) {
                    return me.labInfo.video.split('/')[me.labInfo.video.split('/').length - 1]
                } else {
                    return null
                }
            },
            labStateText() {
                var me = this
                var all = me.labInfo.checkPoints ? me.labInfo.checkPoints.length : 0
                var advancedAll = 0
                var basicPassed = 0;
                var advancedPassed = 0;

                if (me.labInfo.checkPoints) {
                    me.labInfo.checkPoints.forEach(function (checkPoint) {
                        if (checkPoint && checkPoint.type == 'advanced') {
                            advancedAll++
                            if (checkPoint && checkPoint.status) advancedPassed++
                        } else {
                            if (checkPoint && checkPoint.status) basicPassed++
                        }
                    })
                    me.basicPassed = basicPassed

                }
                if (basicPassed == 0) {
                    if (!me.attendance)
                        return `${me.attendanceState} (${me.attendanceTime})`
                    else
                        return me.attendanceState
                } else {
                    if (advancedAll == 0) {
                        if (!me.attendance)
                            return basicPassed + '/' + all + '(' + me.attendanceTime + ')'
                        else
                            return basicPassed + '/' + all
                    } else {
                        return advancedPassed + '/' + basicPassed + '/' + all
                    }
                }


            },
            userId() {
                if (this.$route.params.userId)
                    return this.$route.params.userId;

                return this.myId;
            },
            toolResultPath() {
                var me = this;
                if (me.userId) {
                    return 'db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labInfo.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/toolResult`)
                } else {
                    return null
                }
            },
            checkValidateHints() {
                var me = this
                var validate = false
                Object.values(me.labInfo.hints).some(function (hint) {
                    if (hint.text == "") {
                        validate = true
                        return true
                    }
                })

                return validate
            },
            checkValidateCheckpoints() {
                var me = this
                var validate = false
                Object.values(me.labInfo.checkPoints).some(function (checkPoint) {
                    if (checkPoint.text == "") {
                        validate = true
                        return true
                    }
                })

                return validate
            }

        },
        beforeDestroy() {
            var me = this;
            if (this.toolResultPath && this.tool.result) {
                this.setString(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
                // console.log(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
            }
            this.$EventBus.$emit("endProgressing");
            me.$EventBus.$emit("inSideLab", false)
            // clearInterval(this.resultInterval)
            localStorage.removeItem('openIDE')
            var userEmail = null
            if (me.userId) {
                userEmail = me.userId.replace(/\./gi, '_')
            } else {
                var getEmail = localStorage.getItem('email')
                if (getEmail)
                    userEmail = getEmail.replace(/\./gi, '_')
            }
            if (userEmail)
                me.watch_off(`db://enrolledUsers/${userEmail}/purchaseItems/${me.courseId}@${me.classId}@${me.labId}`)

            // clearInterval(this.autoSubmit)
            clearTimeout(this.attendanceSetTimeout)
            if (window.ipcRenderer)
                window.ipcRenderer.send("closeView")
            // me.$EventBus.$off('resizeGuide');

            window.removeEventListener("keydown", me.keydownEvent)
            window.removeEventListener("mouseup", me.mouseupEvent)
            clearInterval(me.intervalChatPush)
            sessionStorage.setItem("chatStatus", 'false')
            sessionStorage.setItem("wideScreenMode", 'false')

        },
        async mounted() {
            var me = this

            me.$EventBus.$on('login', function() {
                // 새로고침 수행
                window.location.reload();
            });
            window.addEventListener("paste", this.myFunction);
            me.courseInfo = await this.getCourseInfo();
            if (me.courseInfo) {
                if (me.courseInfo.ownerId && me.courseInfo.ownerId == this.myId) {
                    me.isOwner = true
                }
            }
            if (this.myId == 'jyjang@uengine.org' || this.myId == 'help@uengine.org') {
                me.isOwner = true
            }
            me.$EventBus.$emit("inSideLab", true)
            window.addEventListener('message', function (e) {
                if (e.data.message === 'screenShot') {
                    me.tmpImage = e.data.screenShot;
                }
            });

            // window.onbeforeunload = function (e) {
            //     if(this.toolResultPath && this.tool.result){
            //         this.setString(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
            //         // console.log(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
            //     }
            // }

            var labIndexByLabId = {}
            this.classInfo = await this.getClassInfo();
            this.courseInfo = await this.getCourseInfo();

            if (me.classInfo) {
                if (me.classInfo.groupedLabsList) {
                    me.getGroupedLabsList();
                } else {
                    var group = {
                        groupName: "default",
                        labsList: []
                    }
                    for (var i = 0; i < me.classInfo.labsList.length; i++) {
                        group.labsList.push(me.classInfo.labsList[i])
                    }
                    me.classInfo.groupedLabsList = []
                    me.classInfo.groupedLabsList.push(group)

                    me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", me.classInfo)
                    me.getGroupedLabsList()
                }
            }
            let load = await this.loadLabInfo();
            

            Promise.all([load]).then(async function () {
                me.track()
                if (me.classInfo.archive) {
                    me.rootPath = 'archive/'
                } else {
                    me.rootPath = 'running/'
                }
                if (window.ipcRenderer)
                    window.ipcRenderer.send("closeView")


                

                me.$EventBus.$on("checkPointsUpdate", function (data) {
                    if (me.labInfo && me.labInfo.checkPoints) {
                        me.labInfo.checkPoints.push(data)
                        // me.setNewCheckPoints.push(data)
                        me.quizNumbering();
                    }
                })
                me.$EventBus.$on("DeletecheckPoints", function (data) {
                    // me.setNewCheckPoints = data
                    me.quizNumbering();
                })
                if (me.labInfo.tool == 'url') {
                    var md = document.querySelector('div[class="markdown-body"]')
                    md.querySelectorAll('a').forEach(anchor => {
                        anchor.href = "javascript:window.ipcRenderer.send('view', '" + anchor.href + "')"
                    })
                }

                if (me.getClassPath(me.labId) && me.getClassPath(me.labId) == localStorage.getItem('openIDE')) {
                    me.autoOpenIDE = true
                } else {
                    me.autoOpenIDE = false
                    localStorage.removeItem('openIDE')
                }

                // Object.keys(me.classInfo.labsList).forEach(function (index) {
                //     if (me.classInfo.labsList[index] == me.labInfo.labId) {
                //         me.selectedLabNumber = Number(index) + 1;
                //     }
                // })


                me.resetInstructionMd = me.labInfo.instructionMd
                if (me.labInfo.video) {
                    me.video.url = me.labInfo.video
                }


                // me.checkPaidItem();
                if (me.courseInfo && me.courseInfo.certification)
                    me.standardCerti = me.courseInfo.certification

                if (me.classInfo.certification) {
                    me.classInfo.certification.forEach(function (data) {
                        for (var i = 0; i < me.standardCerti.length; i++) {
                            if (me.standardCerti[i].labId == data.labId)
                                me.standardCerti[i] = data
                        }
                    })
                    // console.log(me.standardCerti)
                }
                // this.$EventBus.$on("urlUpdate", function (data) {
                //     me.urlText = data
                //     if(data == 'https://' || data == ''){
                //         me.showUrlText = false
                //     } else {
                //         me.showUrlText = true
                //     }
                // })
                me.loadInstruction = true
                var labInstruction = await me.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                if (!labInstruction) {
                    var labInstruction = await me.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath('labs/' + me.labId) + '/instruction')
                    if (!labInstruction) {
                        me.loadInstruction = false
                    } else {
                        Object.keys(labInstruction).forEach(function (data) {
                            if (labInstruction[data].message) {
                                me.instructionText = labInstruction[data].message
                            } else if (labInstruction[data].diffMessage) {
                                if (typeof labInstruction[data].diffMessage != "string") {
                                    var tmp = diffPatcher.patch_apply(labInstruction[data].diffMessage, me.instructionText)
                                    me.instructionText = tmp[0]
                                }
                            }
                        })
                        me.loadInstruction = false
                    }
                } else {
                    Object.keys(labInstruction).forEach(function (data) {
                        if (labInstruction[data].message) {
                            me.instructionText = labInstruction[data].message
                        } else if (labInstruction[data].diffMessage) {
                            if (typeof labInstruction[data].diffMessage != "string") {
                                var tmp = diffPatcher.patch_apply(labInstruction[data].diffMessage, me.instructionText)
                                me.instructionText = tmp[0]
                            }
                        }
                    })
                    me.loadInstruction = false
                }

            })


            // console.log('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(me.labId))
            // console.log('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(me.labId) + '/instruction')
            me.watch_added('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction', null, function (data) {
                if (data.userId != localStorage.getItem('email')) {
                    if (data.instruction) {
                        if (!me.opentextfield) {
                            try {
                                if (data.message) {
                                    me.instructionText = data.message
                                } else if (data.diffMessage) {
                                    if (typeof data.diffMessage != "string") {
                                        var tmp = diffPatcher.patch_apply(data.diffMessage, me.instructionText)
                                        me.instructionText = tmp[0]
                                    }
                                }
                            } catch (e) {
                                console.log(e)
                            }
                        }
                    }
                } else if (data.url && (me.labInfo.labId == data.lab))
                    me.text = data.url
            })
            $('.child').resizable({handles: 's'});
            // this.autoSubmit = setInterval(function () {
            //     me.submitResult();
            // }, 5000)

            if (me.isLogin) {
                me.watch('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`), function (callback) {
                    if (callback != null) {
                        me.labInfo.checkPoints = callback
                    }
                    if (typeof callback == "string") {
                        var data = JSON.parse(callback)
                    } else {
                        var data = callback
                    }
                    if (data)
                        me.mergeCheckPoint(callback);
                });
            }

            me.keydownEvent = _.debounce(function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if (me.activeFlag) {
                        clearTimeout(me.timer);
                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                        }, 3000);

                    } else {
                        me.activeFlag = true
                        me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "true")

                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                        }, 3000);

                    }
                }
            }, 1000, true)

            window.addEventListener("keydown", me.keydownEvent);

            me.mouseupEvent = _.debounce(function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if (me.activeFlag) {
                        clearTimeout(me.timer);
                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            if (me.isLogin) {
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }
                        }, 3000);

                    } else {
                        me.activeFlag = true
                        if (me.isLogin) {
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "true")
                        }

                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            if (me.isLogin) {
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }
                        }, 3000);

                    }
                }
            }, 1000, true)

            window.addEventListener("mouseup", me.mouseupEvent);

            // activity가 true인 도중에, 브라우저 나가기 방지
            window.addEventListener("beforeunload", (event) => {
                if (this.toolResultPath && this.tool.result) {
                    this.setString(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
                    // console.log(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
                }
                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                clearInterval(me.intervalChatPush)
                sessionStorage.setItem("chatStatus", 'false')
                sessionStorage.setItem("wideScreenMode", 'false')

            });

            var hashPath = me.getClassPath(localStorage.getItem('email'));

            // 로그인 상태 확인
            me.loginToUseLab();
            return me.hashCode(hashPath);
        },
        methods: {
            loginToUseLab(){
                var me = this
                if (!me.isLogin) {
                    me.$EventBus.$emit('showLoginDialog');
                }
            },
            addKeydownEventListener(type) {
                var me = this
                me.sumbitType = type
                me.submitImage = function (e) {
                    if (e.key == "Enter") {
                        if (me.sumbitType == "submit") {
                            var img = me.tmpImage
                        } else {
                            var img = me.imgFile
                        }
                        if (img) {
                            me.submitResultByUser(img)
                        }
                    }
                }
                window.addEventListener("keydown", me.submitImage);
            },
            myFunction(event) {
                document.getElementsByClassName("img-file-style")[0].style.display = "block";
                if (this.imageWindow) {
                    const items = event.clipboardData.items;
                    let blob = null;

                    for (const item of items) {
                        if (item.type.indexOf('image') === 0) {
                            blob = item.getAsFile();
                        }
                    }

                    if (blob != null) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            this.imgFile = evt.target.result;
                        };
                        reader.readAsDataURL(blob);
                    }
                }
            },
            resizeGuide() {
                var me = this
                this.$EventBus.$emit('resizeGuide');
            },
            uploadImage() {
                var me = this
                me.imageWindow = !me.imageWindow;
                if (!me.imageWindow) {
                    window.removeEventListener("keydown", me.submitImage);
                } else {
                    me.addKeydownEventListener("upload")
                }
                document.getElementsByClassName("img-file-style")[0].style.display = "none";

            },
            selectFile() {
                var me = this

                var input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.id = "uploadInput";
                me.imgFile = null
                input.click();
                input.onchange = function (event) {
                    var file = event.target.files[0]
                    var reader = new FileReader();

                    reader.onload = function () {
                        var result = reader.result;
                        me.imgFile = result;

                    };
                    reader.readAsDataURL(file);
                };
                this.imageWindow = true
                document.getElementsByClassName("img-file-style")[0].style.display = "block";
            },
            deleteImage() {
                var me = this
                me.imgFile = null
                me.imageWindow = false
                document.getElementsByClassName("img-file-style")[0].style.display = "none";
            },
            openClassRoom() {
                var me = this
                me.showClassroom = !me.showClassroom
            },
            changedClassroomSize() {
                var me = this
                me.openWideScreen = !me.openWideScreen
                var wideScreenMode = null
                if (me.openWideScreen == true) {
                    wideScreenMode = 'true'
                } else {
                    wideScreenMode = 'false'
                }

                sessionStorage.setItem("wideScreenMode", wideScreenMode)
                me.$EventBus.$emit('wideScreenMode')
            },
            closeUserList() {
                var me = this
                me.showClassroom = false
                me.loadingClassroom = true;
            },
            openEditCheckpointField() {
                var me = this
                me.editCheckpoint = true
                me.copyCheckPoints = JSON.parse(JSON.stringify(me.labInfo.checkPoints))
            },
            addNewCheckpoint() {
                var me = this
                var newCheckPoint = {
                    text: null,
                    javascript: null,
                    status: false
                }
                me.copyCheckPoints.push(newCheckPoint)
            },
            async resetConfig() {
                try {
                    var me = this
                    await me.deleteConfig()
                    await me.makeConfig(me.myId);

                    me.snackBar.show = true
                    me.snackBar.Text = "Config가 재생성 되었습니다."
                    me.snackBar.Color = "success"
                    me.snackBar.icon = "check_circle"
                    me.snackBar.title = "Success"
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = "Config 재생성에 실패하였습니다."
                    me.snackBar.Color = "error"
                    me.snackBar.icon = "error"
                    me.snackBar.title = "Error"
                }
            },
            getGroupedLabsList() {
                var me = this
                // var getLabInfoCnt = 0
                // me.openClassInfoCard = true

                me.classInfo.groupedLabsList.forEach(async groupInfo => {
                    groupInfo.labsList.forEach(async labId => {
                        var labs = await me.getLabInfo(labId)
                        if (labs) {
                            var getCheckpointResults = null
                            var getAttendance = null
                            var userId = me.userInfo.email
                            if (userId) {
                                // getCheckpointResults = await me.getString('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${labInfo.labId}/${userId.replace(/\./gi, '_')}/checkpointResults`))
                                // getAttendance = await me.getString('labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${labInfo.labId}/${userId.replace(/\./gi, '_')}/attendance`))
                                getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                                if (!getCheckpointResults) {
                                    getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                                }
                                getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                                if (!getAttendance) {
                                    getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                                }

                            }
                            labs.attendance = getAttendance
                            labs.passMessage = null
                         


                            if (getCheckpointResults) {
                                var basicPassed = 0;
                                var advancedPassed = 0;
                                getCheckpointResults.forEach(function (checkpoints) {
                                    if (checkpoints.type && checkpoints.type == 'advanced') {
                                        if (checkpoints.status) advancedPassed++;
                                    } else {
                                        if (checkpoints.status) basicPassed++;
                                    }

                                })
                                if (basicPassed == 0) {
                                    if (getAttendance) {
                                        labs.passMessage = '출석'
                                    } else {
                                        labs.passMessage = '접속'
                                    }
                                } else {
                                    if (advancedPassed) {
                                        labs.passMessage = advancedPassed + '/' + basicPassed + '/' + getCheckpointResults.length
                                    } else {
                                        labs.passMessage = basicPassed + '/' + getCheckpointResults.length
                                    }

                                }
                            } else {
                                if (getAttendance) {
                                    labs.passMessage = '출석'
                                }
                            }
                            //기업강의
                            // if (me.classInfo && !me.classInfo.openClass && me.classInfo.connectionKey) {
                            //     labInfo.price = 0
                            // }

                            // init
                            labs.certificate = false
                            labs.mandatory = null

                            // set Course Certifiction
                            if (me.courseInfo && me.courseInfo.certification) {
                                me.courseInfo.certification.forEach(function (certiInfo) {
                                    if (certiInfo.labId == labs.labId) {
                                        labs.certificate = true
                                        labs.mandatory = {}
                                        if (certiInfo.checkPoint) {
                                            labs.mandatory.checkPoint = certiInfo.checkPoint
                                        }
                                        if (certiInfo.attend) {
                                            labs.mandatory.attend = certiInfo.attend
                                        }
                                    }
                                })
                            }

                            //set Class Certifincation
                            if (me.classInfo && me.classInfo.certification) {
                                me.classInfo.certification.forEach(function (certiInfo) {
                                    if (certiInfo.labId == labs.labId) {
                                        if (certiInfo.disable) {
                                            labs.certificate = false
                                        } else {
                                            labs.certificate = true
                                        }

                                        labs.mandatory = certiInfo
                                        if (certiInfo.checkPoint) {
                                            labs.mandatory.checkPoint = certiInfo.checkPoint
                                        } else {
                                            delete labs.mandatory.checkPoint
                                        }
                                        if (certiInfo.attend) {
                                            labs.mandatory.attend = certiInfo.attend
                                        } else {
                                            delete labs.mandatory.attend
                                        }
                                    }
                                })
                            }


                            var labStatus = await me.getLabStatus(labs.labId)
                            labs.labStatus = labStatus

                        }

                        // if(labInfo){
                        labs.groupName = groupInfo.groupName
                        // }
                        if (labs.active != false) {
                            labs.active = true
                        }
                        if (!labs.instructionMd) {
                            labs.instructionMd = '## Instruction'
                        }
                        if (!me.AlllabsList[groupInfo.groupName]) {
                            me.AlllabsList[groupInfo.groupName] = {}
                        }
                        labs.groupName = groupInfo.groupName
                        if (me.labInfo && me.labInfo.labId == labs.labId) {
                            me.currentLabInfo = labs
                        }
                        me.AlllabsList[groupInfo.groupName][labs.labId] = labs
                        me.updateList++;


                        // getLabInfoCnt++;
                        // if(getLabInfoCnt == me.classInfo.groupedLabsList.length){
                        //     this.loadAllgroupedLabsList = true
                        // } 
                    })
                })
                if (me.classInfo.groupedLabsList.length > 0) {
                    this.loadAllgroupedLabsList = true
                }
                // console.log(me.AlllabsList)
            }, 
            instructionImage() {
                // 인스트럭션 이미지 클릭시 이미지 확대 모달창
                $('.markdown-body li img, .markdown-body p img').click(function () {
                    let img = new Image();
                    img.src = $(this).attr("src")
                    $('.modalBox').html(img);
                    $(".modal").show();
                });


                // 모달 클릭할때 이미지 닫음
                $(".modal").click(function (e) {
                    $(".modal").hide();
                });
            },
            instructionCodeBlockClipBoard() {
                const pres = document.getElementsByTagName("pre");
                if (pres.length > 0) {
                    for (let i = 0; i < pres.length; i++) {
                        // opentextfield가 false일 때만 복사 버튼 추가
                        if (!this.opentextfield) {
                            const wrapper = document.createElement('div');
                            wrapper.classList.add('pre-wrapper');
                            
                            // pre 태그의 부모 요소로 wrapper를 추가
                            pres[i].parentNode.insertBefore(wrapper, pres[i]);
                            wrapper.appendChild(pres[i]);

                            // 복사 버튼을 동적으로 생성하여 pre 태그 외부에 삽입
                            const copyBtn = document.createElement('div');
                            copyBtn.classList.add('markdown-body', 'instruction-copy-btn');
                            copyBtn.innerHTML = `
                                <i class="instruction-copy-icon far fa-copy"></i>
                                <div class="success-clipboard">Copied</div>
                            `;
                            
                            wrapper.appendChild(copyBtn); // pre-wrapper 안에 복사 버튼 삽입
                        }
                    }
                }

                // Clipboard.js 설정
                const clipboard = new Clipboard('.instruction-copy-btn', {
                    target: (trigger) => {
                        // 복사할 텍스트를 담고 있는 pre 태그를 target으로 설정
                        return trigger.previousElementSibling; // pre 태그를 반환
                    }
                });

                // 복사 버튼 클릭 시 동작 설정
                clipboard.on('success', (event) => {
                    // 복사 성공 메시지를 표시
                    $(event.trigger).find(".success-clipboard").fadeIn();
                    setTimeout(() => {
                        event.clearSelection();
                        $(event.trigger).find(".success-clipboard").fadeOut();
                    }, 700);
                });
            },

            track() {
                if(this.$gtag){
                    this.$gtag.pageview(
                        {
                            page_title: `${this.$route.params.labId} 랩실`,
                        page_path: this.$route.path
                        }
                    )
                }
            },
            closeIDE() {
                console.log('LabLocator------------------ IDE CLOSE')
            },
            contextOpen(event) {
                var me = this
                me.menuOpen = !me.menuOpen
                me.updateList++;
                // this.$refs.menu.open(event);
            },
            // onOpen(event, data, top, left) {
            //     console.log('The context menu was opened');
            //     console.log(event, data, top, left);
            // },
            onClick(labId, text) {
                var me = this
                me.showClassroom = false;
                try {
                    if (text == 'newTab') {
                        window.open(`#/courses/${me.courseId}/${me.classId}/${labId}`, '_blank');
                    } else {
                        if (labId != me.labId) {
                            if (labId == "라운지로 이동") {
                                //me.$router.push(`/courses/${me.courseId}/${me.classId}`);
                                window.location.href = '/#/courses/' + me.courseId + '/' + me.classId;
                                window.location.reload()
                            } else {
                                //me.$router.push(`/courses/${me.courseId}/${me.classId}/${labId}`);
                                window.location.href = '/#/courses/' + me.courseId + '/' + me.classId + '/' + labId;
                                window.location.reload()
                            }
                        }
                    }
                } catch (e) {
                    alert(e.message)
                }
            }, 
            editLabVideo() {
                var me = this
                me.openVideoTextfield = true
            },
            addVideo() {
                var me = this
                try {
                    me.labInfo.video = me.video.url
                    var copyLabInfo = JSON.parse(JSON.stringify(me.labInfo))
                    // var setClassId = me.classId.replace('running@', '')
                    // me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/running/' + setClassId + '/labs/' + me.labInfo.labId + '/youtubeLink', videoUrl)
                    me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
                    me.openVideoTextfield = false
                } catch (e) {
                    alert(e.message)
                }
            },
            // movedLab(labName){
            //     var me = this
            //     // var isMyId = me.userInfo.email
            //     var isMyId = localStorage.getItem('email')
            //     me.$router.push(`/courses/${me.courseId}/${me.classId}/${labName}/${isMyId}`);
            //     window.location.reload()
            // },
            closeAddCheckPointField() {
                this.editCheckpoint = false
                this.labInfo.checkPoints = JSON.parse(JSON.stringify(this.setOldCheckPoints))
            },
            removeCheckpoint(item) {
                var test
                var me = this
                Object.keys(me.copyCheckPoints).forEach(function (key) {
                    if (me.copyCheckPoints[key].text == item.text) {
                        test = key
                    }
                })
                me.copyCheckPoints.splice(test, 1)
            },
            async updateCheckpoints() {
                if (confirm("수정 시, 수강생들의 체크포인트 달성 여부가 초기화됩니다.\n계속 진행하시겠습니까?") == false) {
                    return false
                }

                var me = this
                me.updateCheckpointLoading = true
                var overlap = false
                var overlapCount = 0
                try {
                    me.labInfo.checkPoints = JSON.parse(JSON.stringify(me.copyCheckPoints))

                    Object.values(me.labInfo.checkPoints).some(function (item) {
                        overlapCount = 0
                        if (overlap == true) return true
                        Object.values(me.labInfo.checkPoints).some(function (item2) {
                            if (item.text == item2.text) {
                                overlapCount++;
                                if (overlapCount == 2) {
                                    overlap = true
                                    return true
                                }
                            }
                        })
                    })
                    if (overlap == true) {
                        alert('중복된 체크포인트명 입니다.')
                        me.updateCheckpointLoading = false
                        return false
                    } else {
                        Object.values(me.labInfo.checkPoints).forEach(function (checkpoint) {
                            checkpoint.status = false
                        })
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, me.labInfo)
                        var userList = await me.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}`))
                        Object.keys(userList.userInfo).forEach(async function (user) {
                            if (user.includes("_")) {
                                await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${user}/passed`))
                                await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${user}/submitted`))
                                await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${user}/checkpointResults`))
                                me.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${user}/checkpointResults`), me.labInfo.checkPoints)
                            }
                        })

                        this.editCheckpoint = false
                        me.setOldCheckPoints = JSON.parse(JSON.stringify(me.labInfo.checkPoints))
                    }
                    me.updateCheckpointLoading = false

                } catch (e) {
                    alert(e.message)
                }
            },
            closeAddHintsField() {
                this.addHints = false
                this.editHints = false
                this.hints = ""
                this.labInfo.hints = JSON.parse(JSON.stringify(this.setOldHints))
            },
            async updateHints(labInfo, hints) {
                var me = this
                var overlap = false
                var copyLabInfo = JSON.parse(JSON.stringify(labInfo))
                try {
                    if (hints != '') {
                        var obj = {
                            text: hint,
                        }
                        Object.keys(copyLabInfo.hints).some(function (key) {
                            if (copyLabInfo.hints[key].text == hints) {
                                overlap = true;

                                return true
                            }
                        })
                        if (overlap) {
                            me.snackBar.show = true
                            me.snackBar.Text = "동일한 힌트가 이미 존재합니다."
                            me.snackBar.Color = "error"
                            me.snackBar.icon = "error"
                            me.snackBar.title = "Error"
                            me.hints = ""

                            return false
                        } else {
                            copyLabInfo.hints.push(obj)
                        }
                    }

                    me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)

                    this.addHints = false
                    this.editHints = false
                    this.labInfo = copyLabInfo
                    me.setOldHints = JSON.parse(JSON.stringify(copyLabInfo.hints))

                } catch (e) {
                    alert(e.message)
                }
            },
            removeHints(idx) {
                this.labInfo.hints.splice(idx, 1)
            },
            addNewHint() {
                var me = this
                var newHint = {
                    text: ""
                }

                me.labInfo.hints.push(newHint)
            },
            handleResize({width, height}) {
                var me = this
                // console.log('resized', width, height)

                // var width = newVal ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                // var height = $(".v-main").height()
                if (window.ipcRenderer)
                    if (document.fullscreenElement != null) {
                        window.ipcRenderer.send("hideView");
                    } else {
                        window.ipcRenderer.send("resizeView", {
                            x: me.guideOpened ? $(".v-navigation-drawer").width() : 0,
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
            },
            // openUrltextfield() {
            //     var me = this
            //     if (me.isTeacher || me.isOwner)
            //         me.urltextfield = true
            //     else
            //         me.urltextfield = false
            // },
            // sendUrl(text) {
            //     var me = this
            //     try {
            //         var setUrl = null
            //         if(text.includes('https://') || text.includes('http://')){
            //             setUrl = text
            //         } else {
            //             setUrl = 'https://' + text
            //         }
            //         var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
            //         copyLabInfo.URL = setUrl
            //         me.putObject(`storage://labs-msaez.io/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
            //         var setClassId = me.classId.replace('running@', '')
            //         me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/running/' + setClassId + '/labs/' + me.labInfo.labId + '/URL', setUrl);
            //         me.urltextfield = false
            //     } catch (e){
            //         console.log(e.message)
            //     }

            // },
            openMarkdown(instruction) {
                this.instructionText = instruction
                this.setInstruction = instruction
                this.opentextfield = true
                this.savebtn = true
            },
            async resetInstruction() {
                var me = this
                try {
                    await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                    me.instructionText = me.resetInstructionMd
                    me.savebtn = false
                    me.opentextfield = false
                } catch (e) {
                    alert(e.message)
                }
            },
            cancel() {
                var me = this
                try {
                    var message = {
                        userId: localStorage.getItem('email'),
                        userName: localStorage.getItem('userName'),
                        message: me.setInstruction,
                        instruction: true
                    }
                    setTimeout(() => {
                        me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                        me.pushString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction', message);
                    }, 2000);
                    me.instructionText = me.setInstruction
                    me.savebtn = false
                    me.opentextfield = false
                    me.loading = true
                    me.instructionImage()
                    this.$nextTick(function () {
                        Prism.highlightAll()
                        me.instructionCodeBlockClipBoard()
                        me.instructionImage()
                    });
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = e.message
                    me.snackBar.Color = "error"
                    me.snackBar.icon = "error"
                    me.snackBar.title = "Error"
                }
            },
            async save(file) {
                // await this.test1234()
                var me = this
                // console.log(me.classInfo)
                // console.log(file)
                // console.log(this.courseInfo.ownerId)
                var copyClassId = me.classId.replace("running@", '')
                try {
                    var message = {
                        userId: localStorage.getItem('email'),
                        userName: localStorage.getItem('userName'),
                        message: file,
                        instruction: true
                    }
                    if (me.isOwner) {
                        var timeStamp = new Date();
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/instruction.md`, file)
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/instruction_history/instruction_${timeStamp.getTime()}.md`, me.setInstruction)
                    } else {
                        message.className = me.classInfo.className
                        message.classId = me.classInfo.classId
                        message.timeStamp = new Date().toLocaleString();
                        // message.userImage 
                        // instruction/labId
                        if (me.courseId != copyClassId) {
                            await me.delete('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/instruction/' + copyClassId + '/' + me.labId);
                            await me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/instruction/' + copyClassId + '/' + me.labId, message);
                        }
                    }
                    // 클래스/instruction
                    await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                    await me.pushString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction', message);
                    me.savebtn = false
                    me.opentextfield = false
                    me.loading = true
                    me.cmOption.value = file
                    this.$nextTick(function () {
                        Prism.highlightAll()
                        me.instructionCodeBlockClipBoard()
                        me.instructionImage()
                    });

                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = e.message
                    me.snackBar.Color = "error"
                    me.snackBar.icon = "error"
                    me.snackBar.title = "Error"
                }


            },
            attendanceTimer() {
                var me = this
                var timer = 3 * 60

                var doit = function () {
                    me.attendanceTime = timer
                    if (timer < 0) {
                        me.attendanceTime = Date.now()
                        me.attendanceState = '출석'
                        me.attendance = true
                        //!
                        me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/attendance`), me.attendanceTime)
                        // if (me.labInfo.mandatory.attend && me.attendance) {
                        //     me.validateCheckPoints();
                        // }
                        clearTimeout(me.attendanceSetTimeout)
                    } else {
                        me.attendanceSetTimeout = setTimeout(doit, 1000)
                    }
                    timer = timer - 1
                }
                doit()
            },
            async loadUserResult(userId) {
                var me = this
                try {
                    if (userId) {
                        var userResult = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`));
                        if (!userResult) {
                            var userResult = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`labs/${me.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`));
                        }
                        return userResult
                    } else {
                        return null
                    }
                } catch (e) {
                    console.log(e)
                }
            },
            async loadCheckPoints() {
                var me = this;
                try {
                    if (me.userId) {
                        var userResult = await this.getObject(
                            'db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${this.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`)
                        );
                        if (!me.userId) {
                            var userResult = await this.getObject(
                                'db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`labs/${this.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`)
                            );
                        }
                    } else {
                        var userResult = null
                    }

                    if (userResult == null) {
                        if (me.userId && me.labId) {
                            me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`), me.labInfo.checkPoints)
                            userResult = me.labInfo.checkPoints
                        } else {
                            userResult = null
                        }
                    }
                    if (userResult != null) {
                        me.mergeCheckPoint(userResult);
                    }
                    if (userResult != null) {
                        userResult.forEach(function (item, idx) {
                            if (!item.regExp && !item.javascript) {
                                me.labInfo.checkPoints[idx] = item
                            }
                        })
                    }

                    me.forceRerender();
                    me.quizNumbering();

                } catch (e) {
                    alert(e.message)
                }

            },
            resizeDrag(event) {
                // console.log(event)
                var height = this.videoHeight[this.videoHeightIndex];

                height = parseInt(height.replace("px", "")) + 1;

                this.videoHeight[this.videoHeightIndex] = `${height}px`;

            },
            async sendCheckPoints(item) {
                var me = this
                // item.status = !item.status;
                console.log(item)
                try {
                    if (item.status)
                        item.status = true
                    else item.status = false
                    await me.submitResult();
                    me.forceRerender();
                } catch (e) {
                    alert(e.message)
                }


                // var tmpArray = []
                // me.labInfo.checkPoints.forEach(checkPoint => tmpArray.push(checkPoint))
                // me.putObject(
                //     `${this.courseId}/classes/running/${this.classId}/labs/${this.labId}/${me.userId}/checkpointResults.json`, tmpArray
                // );
                //
                // var getUserResult = await me.loadUserResult(me.userId)
                // me.labInfo.checkPoints = getUserResult

            },
            onResultChanged(result) {
                this.testCheckpoints(result)
                this.checkHints(result)
            },
            async startLoadLabInfo() {
                var me = this
                try {
                    if (!me.labInfo.hints) {
                        me.labInfo.hints = []
                    }
                    // console.log(this.labInfo)
                    me.setOldCheckPoints = this.labInfo.checkPoints
                    me.setOldHints = this.labInfo.hints
                    // console.log(me.courseInfo)
                    if (me.courseInfo && me.courseInfo.certification) {
                        me.courseInfo.certification.forEach(function (certiInfo) {
                            if (certiInfo.labId == me.labInfo.labId) {
                                me.labInfo.certificate = true
                                me.labInfo.mandatory = {}
                                if (certiInfo.checkPoint) {
                                    me.labInfo.mandatory.checkPoint = certiInfo.checkPoint
                                }
                                if (certiInfo.attend) {
                                    me.labInfo.mandatory.attend = certiInfo.attend
                                }
                            }
                        })
                    }
                    // console.log(me.classInfo)
                    if (me.classInfo && me.classInfo.certification) {
                        me.classInfo.certification.some(function (certiInfo) {
                            if (certiInfo.labId == me.labInfo.labId) {
                                if (certiInfo.disable) {
                                    me.labInfo.certificate = false
                                } else {
                                    me.labInfo.certificate = true
                                }

                                me.labInfo.mandatory = certiInfo
                                if (certiInfo.checkPoint) {
                                    me.labInfo.mandatory.checkPoint = certiInfo.checkPoint
                                } else {
                                    delete me.labInfo.mandatory.checkPoint
                                }
                                if (certiInfo.attend) {
                                    me.labInfo.mandatory.attend = certiInfo.attend
                                } else {
                                    delete me.labInfo.mandatory.attend
                                }
                                return true
                            }
                        })
                    }
                    // console.log(me.labInfo)
                    if (this.labInfo.checkPoints && this.labInfo.checkPoints.length == 0) {
                        var me = this
                        try {
                            var obj = {
                                text: "모든 요구사항을 만족하는가",
                                status: false,
                                javascript: null,
                            }
                            this.labInfo.checkPoints.push(obj)
                            var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
                            me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
                        } catch (e) {
                            alert(e.message)
                        }
                    }

                    if (me.labInfo.instructionMd) {
                        me.oldValue = me.labInfo.instructionMd
                        me.instructionText = me.labInfo.instructionMd
                        me.cmOption.value = me.labInfo.instructionMd
                    }

                    if (this.classInfo && !this.classInfo.openClass && this.classInfo.connectionKey) {
                        // 기업강의
                        // this.labInfo.price = 0
                    }

                    if (!me.labInfo.modelUrl) {
                        var storedResult = await this.getObject(`${this.toolResultPath}`)
                        window.document.title = this.labInfo.labName

                        if (me.labInfo.startArtifact) {
                            var startingArtifact = await this.getObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/${me.labInfo.startArtifact}`)
                            if (startingArtifact) //important!
                                this.tool.result = startingArtifact;
                        }
                        if (storedResult) //important!
                            this.tool.result = storedResult;
                    }

                    this.tool.__ob__.dep.notify();
                    await this.loadCheckPoints();
                    window.document.title = this.labInfo.labName
                    this.getLabStatus(this.labId).then(labStatus => {
                        me.deadline = labStatus.startedAt// + me.labInfo.labTime * 60
                    });
                } catch (e) {
                    console.log(e.message)
                }
            },
            loadLabInfo() {
                var me = this;
                return new Promise(async function (resolve, reject) {
                    try {
                        me.labInfo = await me.getLabInfo();
                        if (me.labInfo && !me.labInfo.hints) {
                            me.labInfo.hints = []
                        }
                        if (!me.isAdmin) {
                            if (me.classInfo && me.classInfo.unactiveLabList) {
                                if (me.classInfo.unactiveLabList[me.labInfo.labId] == 'unActived') {
                                    alert('비활성화된 랩입니다. 라운지로 이동합니다.')
                                    me.$router.push(`/courses/${me.courseId}/${me.classId}`);
                                } else {
                                    me.startLoadLabInfo()
                                    resolve()
                                }
                            } else {
                                if (me.labInfo.active == false) {
                                    alert('비활성화된 랩입니다. 라운지로 이동합니다.')
                                    // resolve()
                                    me.$router.push(`/courses/${me.courseId}/${me.classId}`);
                                } else {
                                    me.startLoadLabInfo()
                                    resolve()
                                }
                            }
                        } else {
                            me.startLoadLabInfo()
                            resolve()
                        }
                    } catch (e) {
                        alert(e.message)
                    }
                })
            },
            // setUrl(url) {
            //     alert(url)
            // },
            async checkHints(result) {
                var me = this;
                try {
                    if (result.result) {
                        me.tool.result = result.result;
                    } else {
                        me.tool.result = result;
                    }

                    me.labInfo.hints.forEach(function (hint, idx) {
                        var resultTmp = me.tool.result;
                        var hintExp = new RegExp(hint.error, 'gi');
                        if (typeof resultTmp != 'string') {
                            resultTmp = JSON.stringify(resultTmp)
                        }
                        var status = resultTmp.match(hintExp);

                        if (status) {
                            hint.status = true;
                        }
                        ;
                    })

                } catch (e) {
                    alert(e.message)
                }

                // me.labInfo.hints.__ob__.dep.notify()
            },
            async testCheckpoints(result) {
                var me = this
                if (result.result) {
                    me.tool.result = result.result;
                } else {
                    me.tool.result = result;
                }
                me.tool.__ob__.dep.notify()

                var getCheckPoint = await this.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`));
                if (!getCheckPoint) {
                    var getCheckPoint = await this.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`));
                }
                this.labInfo.checkPoints.forEach(async function (checkpoint, idx) {
                    var result = me.tool.result;
                    var v = me.tool;
                    var t = me.$refs["toolComp"];
                    var passed = false;
                    if (checkpoint.javascript) {
                        if (checkpoint.javascript.endsWith('.js')) {
                            var jsPath = `${me.$route.params.courseId}/labs/${me.$route.params.labId}/${checkpoint.javascript}`
                            checkpoint.javascript = await me.getString(`storage://labs-msaez.io/running/${jsPath}`);
                        }

                        var everSet;

                        function returnValue(value) {
                            passed = value
                            everSet = true;
                        }

                        function containsAll(arr1, arr2) {
                            for (var i = 0; i < arr2.length; i++) {
                                if (!arr1.includes(arr2[i]))
                                    return false

                            }

                            return true;
                        }

                        function oneOf(arr1, arr2) {
                            for (var i = 0; i < arr2.length; i++) {
                                if (arr1.includes(arr2[i]))
                                    return true

                            }

                            return false;
                        }

                        var javascript = checkpoint.javascript;
                        try {
                            var passedReturn = eval(javascript);
                            if (!everSet)
                                passed = passedReturn;
                        } catch (e) {
                            console.error(e)
                        }

                    } else if (checkpoint.regExp) {
                        var expression = RegExp(checkpoint.regExp + '*', 'ig');
                        passed = expression.test(me.tool.result);
                    } else if (checkpoint.testShell) {
                        var testKey = checkpoint.testShell;
                        passed = me.testCheckpointWithShellInlineTest(result, testKey)
                    } else if (getCheckPoint[idx]) {
                        if (getCheckPoint[idx].status)
                            passed = getCheckPoint[idx].status;
                    }
                    checkpoint.status = passed;
                    checkpoint.__ob__.dep.notify()
                })
            },

            testCheckpointWithShellInlineTest(result, testKey) {
                const prefix = "####### test "; // 7-sharp test

                var lines = result.split("\n");
                var answerPart = null;
                var testKeyPart = null;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.startsWith(prefix)) {

                        var testKeyAndRegExp = line.split(":")
                        testKeyPart = "test " + testKeyAndRegExp[0].substring(prefix.length, testKeyAndRegExp[0].length).trim();
                        // answerPart = testKeyAndRegExp[1].trim();
                        // 2020.7.30 형국 수정 - json 형식의 데이터도 처리를 하기 위하여 변경
                        answerPart = testKeyAndRegExp.slice(1).join(':').trim();


                        if (answerPart.includes(',')) {
                            answerPart = answerPart.split(',').map(eachAnswer => {
                                return eachAnswer.trim()
                            })
                        }

                        continue;
                    }

                    if (testKeyPart == testKey && answerPart) {
                        //정답이 1개 인 경우
                        if (line.includes(answerPart)) {
                            return true;  //정답 맞췄다
                            answerPart = null;
                        }

                        //정답이 1개 이상인 경우
                        if (answerPart.forEach) {
                            answerPart.forEach(eachAnswer => {
                                if (line.includes(eachAnswer)) {
                                    answerPart.splice(answerPart.indexOf(eachAnswer), 1) //맞춘 정답은 배열에서 제외
                                }
                            })

                            if (answerPart.length == 0) {  //배열에 아무것도 안남으면 다 맞췄다.
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
            test() {
                try {
                    var me = this;
                    var path = "labs-" + this.getTenantId() + '/running/' + me.getClassPath(`labs/${me.userId}`)
                    me.$http.post(`${me.fileServerUrl}/api/uploadTemplate`, {
                        filePath: path,
                        course: me.courseId,
                        bucket: "labs-" + me.getTenantId(),
                        lab: me.labId,
                        templateFile: me.labInfo.templateFile ? me.labInfo.templateFile : "lab.zip"
                    })
                    me.snackBar.show = true
                    me.snackBar.Text = "저장되었습니다."
                    me.snackBar.Color = "success"
                    me.snackBar.icon = "check_circle"
                    me.snackBar.title = "Success"
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = "저장에 실패하였습니다." + e.message
                    me.snackBar.Color = "error"
                    me.snackBar.icon = "error"
                    me.snackBar.title = "Error"
                }
            },
            async mergeCheckPoint(getCheckPoint) {
                var me = this
                var copyCheckPointsforMerge = JSON.parse(JSON.stringify(me.labInfo.checkPoints));

                // 못받아와서 없는 체크포인트 추가
                if (typeof getCheckPoint == 'string') {
                    getCheckPoint = JSON.parse(getCheckPoint)
                }
                copyCheckPointsforMerge.forEach(function (copyCheckPoint, idx) {
                    if (getCheckPoint != null) {
                        getCheckPoint.forEach(function (result) {
                            if (copyCheckPoint.text == result.text) {
                                copyCheckPointsforMerge[idx] = result
                            }
                        })
                    }
                })
                me.labInfo.checkPoints = copyCheckPointsforMerge;

                // me.setNewCheckPoints = copyCheckPoints;
                me.quizNumbering();
            },
            closeClassroom() {
                var me = this
                me.openWideScreen = false;
            },
            async screenCapture(mode) {
                var me = this

                if (me.openWideScreen && !mode) {
                    await me.closeClassroom()

                    sessionStorage.setItem("wideScreenMode", 'false')
                    me.$EventBus.$emit('wideScreenMode')
                    me.$EventBus.$emit('unselectUser')
                }

                try {
                    me.isCapturing = true
                    if (this.labInfo.tool == 'ide') {
                        var ideHost = "";
                        if (me.classInfo.ideUrl) {
                            ideHost = me.classInfo.ideUrl
                        } else {
                            ideHost = "kuberez.io";
                        }

                        $('iframe').get().forEach(function (iframe, idx) {
                            if (iframe.getAttribute("iframe-src")) {
                                if (iframe.getAttribute("iframe-src").includes(ideHost)) {
                                    var body = $('iframe').get(idx);
                                    body.contentWindow.postMessage({
                                        message: 'captured'
                                    }, "*")
                                }
                            }
                        })
                    } else if (this.labInfo.tool == 'event-storming' || this.labInfo.tool == 'kuber-ez' || this.labInfo.tool == 'business-model-canvas') {
                        await html2canvas(document.querySelector(".canvas-panel")).then(function (canvas) {
                            var data = canvas.toDataURL();
                            me.tmpImage = data
                        });
                    } else if (window.ipcRenderer) {
                        await window.ipcRenderer.on("capture", function (event, img) {
                            if (img.diff) {
                                me.tmpImage = img.diff;
                            } else me.tmpImage = img;
                            console.log(me.tmpImage)
                        })
                        await window.ipcRenderer.send("capture")
                    }
                } catch (e) {
                    console.log(e.message)
                } finally {
                    if (!mode) {
                        this.openResultDialog = true
                    } else {
                        // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.myId.replace(/\./gi, '_')}/userScreen`), me.tmpImage)
                        // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/loadStepforUserImage`), 'loadUserScreen');
                    }
                    this.isCapturing = false
                }
            },
            async submitResultByUser(tmpImage) {
                var me = this
                // console.log(me.labInfo)
                // clearInterval(this.autoSubmit);
                await this.submitResult(tmpImage);
                var getCheckPoint = await me.loadUserResult(me.userId);
                if (getCheckPoint) {
                    me.mergeCheckPoint(getCheckPoint);
                }

                me.forceRerender();
                if (me.labInfo.tool == 'quiz') {
                    alert("페이지 최하단의 '이대로 제출' 버튼을 클릭하여 제출합니다.")
                } else if (!me.labInfo.certificate) {
                    me.submitImageSnackbar = true
                } else {
                    me.validateCheckPoints();
                }
                me.openResultDialog = false
                me.imageWindow = false
                me.imgFile = null
            },

            async submitResult(tmpImage) {
                var me = this;
                try {
                    var getUserResult = await me.loadUserResult(me.userId)
                    var tmp = []
                    if (me.labInfo.checkPoints) {
                        var originCheckPoints = JSON.parse(JSON.stringify(me.labInfo.checkPoints))
                    } else {
                        var originCheckPoints = null
                    }
                    if (originCheckPoints != null) {
                        originCheckPoints.forEach(function (item, idx) {
                            if (getUserResult) {
                                if (getUserResult[idx]) {
                                    if (getUserResult[idx].status == originCheckPoints[idx].status) {
                                        tmp.push(getUserResult[idx])
                                    } else if (getUserResult[idx].status != originCheckPoints[idx].status) {
                                        // 이곳 로직 변경됨 (기존로직은 주석처리)
                                        // if (getUserResult[idx].status) tmp.push(getUserResult[idx])
                                        // else if (originCheckPoints[idx].status) tmp.push(originCheckPoints[idx])
                                        tmp.push(originCheckPoints[idx])
                                    }
                                } else {
                                    tmp.push(originCheckPoints[idx])
                                }
                            } else {
                                tmp.push(originCheckPoints[idx])
                            }
                        })
                    }

                    if (me.userId && me.labId) {
                        var promises = [];
                        if (tmpImage) {
                            var result = {
                                labResult: tmpImage,
                                status: "new",
                                date: Date.now()
                            }
                            this.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/labResult/${me.userId.replace(/\./gi, '_')}`), result)
                        }
                        promises.push(
                            this.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/checkpointResults`), tmp)
                        );
                        if (!this.toolResultPath.includes('undefined')) {
                            promises.push(
                                this.setString(`${this.toolResultPath}`, JSON.stringify(this.tool.result))
                            );
                        }
                        return Promise.all(promises);
                    }
                } catch (e) {
                    alert(e.message)
                }

            },
            quizNumbering() {
                var me = this
                if (me.labInfo.tool == 'quiz') {
                    me.setNewCheckPoints = []
                    me.labInfo.checkPoints.forEach(function (data, idx) {
                        var quizIdx = idx + 1
                        data.quizNumber = 'Quiz ' + quizIdx
                        me.setNewCheckPoints[idx] = data
                    })
                    console.log(me.setNewCheckPoints)
                }
            },
            forceRerender() {
                // Remove my-component from the DOM
                this.renderComponent = false;

                this.$nextTick(() => {
                    // Add the component back in
                    this.renderComponent = true;
                });
            },
            async validateCheckPoints() {
                var me = this
                try {
                    var passed = false
                    var passCnt = 0
                    var disableCnt = 0
                    var userName = localStorage.getItem("userName")
                    var convertEmail = localStorage.getItem("email").replace(/\./gi, '_')

                    // this.submitted = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/" + convertEmail + "/submitted")
                    // if (this.submitted) {
                    //     alert('이미 제출된 랩입니다.')
                    // } else if (!me.submitted) {
                    if (me.labInfo.certificate) {
                        if (me.labInfo.mandatory.attend && me.attendance) {
                            // me.passAllCheckPoints = true
                            passed = true
                        }
                        if (!passed) {
                            if (me.labInfo.mandatory.checkPoint && me.labInfo.mandatory.checkPoint <= me.basicPassed) {
                                passed = true
                            }
                        }
                        // me.submitted = true
                        // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/" + convertEmail + "/submitted", me.submitted);
                        alert('제출하였습니다.')
                        if (passed) {
                            var obj = {
                                labId: me.labInfo.labId,
                                passed: true
                            }
                            me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`certificateByUser/${convertEmail}/passedLab/${me.labInfo.labId}`), obj)
                            // this.passAll = true
                            var classCerti = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`certificateByUser/${convertEmail}/passedLab`));
                            if (!classCerti) {
                                var classCerti = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`certificateByUser/${convertEmail}/passedLab`));
                            }
                            me.standardCerti.forEach(function (data) {
                                if (!data.disable) {
                                    var copyLabId = data.labId
                                    if (classCerti[copyLabId] && classCerti[copyLabId].passed) {
                                        passCnt++;
                                    }
                                } else {
                                    disableCnt++;
                                }
                            })

                            var certiScore = me.standardCerti.length - disableCnt
                            if (certiScore == passCnt) {
                                var passStatus = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + convertEmail + "/passed");
                                if (!passStatus) {
                                    var enrolledClassInfo = me.courseId + '@' + me.classId + '@' + this.labInfo.labId
                                    var resourceId = me.courseId + '@labs@' + this.labInfo.labId
                                    var certi = {
                                        className: this.classInfo.className,
                                        itemId: enrolledClassInfo,
                                        // labName: this.labInfo.labName,
                                        period: 365,
                                        resourceId: resourceId,
                                        userName: userName,
                                        teacherId: this.classInfo.teacherId,
                                        when: Date.now()
                                    }
                                    me.pushString(`db://enrolledUsers/${convertEmail}/certificates`, certi)
                                    me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + convertEmail + "/passed", true);
                                }
                            }
                        } else {
                            console.log('통과 x')
                        }
                    } else {
                        console.log('해당 랩은 발급 x')
                    }
                    // }

                } catch (e) {
                    alert(e.message)
                }

            },


        },


    };
</script>
<style lang="scss" scoped>
    ::v-deep .v-skeleton-loader.v-skeleton-loader--is-loading {
        .v-skeleton-loader__image {
            height: 100%;
        }
    }
</style>
<style>
    .lab-locator-fixed {
        position: sticky;
        top: -1px;
        background-color: white;
        z-index: 99;
        width: 99.8%;
    }

    .img-file-style {
        display: none;
    }

    .editor-toolbar {
        display: none;
    }

    .editor-toolbar svg {
        margin-right: 3px;
    }

    .v-list-item__title {
        white-space: normal !important
    }

    .v-sheet {
        word-break: break-all;
    }

    /* Instruction style ui 마크다운 형식 ui */
    .cm-null, .cm-header {
        background: none !important;
    }

    .cm-header-1 {
        font-size: 32px !important;
        font-weight: 600 !important;
    }

    .cm-header-2 {
        font-size: 24px !important;
        font-weight: 600 !important;
    }

    .cm-header-3 {
        font-size: 20px !important;
        font-weight: 600 !important;
    }

    .cm-header-4 {
        font-size: 16px !important;
        font-weight: 600 !important;
    }

    .CodeMirror-lines {
        font-size: 16px !important;
    }

    .cm-def .CodeMirror-Selectedtext {
        font-size: 16px !important;
        font-weight: 700 !important;
    }

    .CodeMirror .CodeMirror-code .cm-comment {
        font-size: 16px !important;
        background: none !important;
        font-weight: 700 !important;
    }

    .markdown-body pre code {
        font-size: 16px !important;
        font-weight: 700 !important;
    }

    .CodeMirror .CodeMirror-code .cm-link {
        background: none !important;
    }

    .modal {
        display: none;
        z-index: 500;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.8);
    }

    .modalBox {
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }

    .modalBox img {
        max-width: 100%;
        width: auto !important;
        height: auto !important;
    }

    .markdown-body li img:hover,
    .markdown-body p img:hover {
        cursor: -webkit-zoom-in;
    }

    .modal {
        cursor: zoom-out;
    }

    .success-clipboard {
        height: 22px;
        width: 60px;
        font-weight: 700;
        background-color: #1976d2;
        opacity: 0.8;
        margin-right: 5px;
        border-radius: 5px;
        float: left;
        text-align: center;
        color: white;
        display: none;
    }
</style>

<style scoped>
    .student {
        margin-top: 180px;
    }

    .admin {
        margin-top: 345px;
    }

    /* .v-menu__content {
        margin-top: 350px;
    } */


</style>

