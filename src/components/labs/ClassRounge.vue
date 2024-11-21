<template>
    <div>
        <!-- <v-container v-if="isLogin" -->
        <v-container 
            fluid
            style = "position: fixed;
            width :100%;
            height:91.5vh; overflow-y:auto;"
        >
            <v-row no-gutters style="margin-top: -20px;"> 
                <v-col
                    :cols="isMobile ? 0:3"
                >
                    <v-navigation-drawer
                        v-model="drawer"
                        v-if="classInfo"
                        :permanent="!isMobile"
                        :style="isMobile ? 'width: 65%; margin-top: 56px;':'width: 25%; margin-top: 65px;'"
                        :fixed="true"
                        :temporary="isMobile"
                        hide-overlay
                        style="height:calc(100vh - 65px);"
                    >
                        <v-list-item>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon @click="openClassInfo()" style="margin-right: 10px;" v-on="on" :color="editModeController == 'openClassInfoCard' ? 'primary':''">mdi-home</v-icon>
                                </template>
                                <span> Home </span>
                            </v-tooltip>
                            <v-list-item-content v-if="classInfo && !isMobile">
                                <v-list-item-title><b>{{classInfo.className}}</b></v-list-item-title>
                                <v-list-item-subtitle>{{classInfo.classId}}</v-list-item-subtitle>
                            </v-list-item-content>
                            <div>
                                <v-tooltip bottom v-if="isAdmin">
                                    <template v-slot:activator="{ on }">
                                        <v-icon style="margin-left: 10px;"
                                                class="ismobile-mdi-pencil"
                                                :color="editModeController == 'inputLabinfo' ? 'primary':''"
                                                v-on="on"
                                                @click="addGrouporLab()">mdi-pencil
                                        </v-icon>
                                    </template>
                                    <span v-text="ModeText"> </span>
                                </v-tooltip>
                            </div>
                        </v-list-item>

                        <v-divider></v-divider>
                        
                        <div style="padding-bottom: 200px;
                            overflow-y: auto;
                            height:calc(100% - 65px);
                        ">

                            <v-list 
                                v-if="editModeController == 'inputLabinfo'"
                                dense
                                expand
                            >
                                <draggable :list="copyClassInfoforGroupList.groupedLabsList" @change="log">
                                    <v-list-group 
                                        v-for="(group, index) in copyClassInfoforGroupList.groupedLabsList" :key="index" 
                                        no-action 
                                        :value="index == 0 ? true:false"
                                    >
                                        <template #prependIcon>
                                            <v-list-item-icon v-if="group.groupName != 'uncategorized' && group.labsList.length == 0" style="margin: 0px;">
                                                <v-icon color="error" small @click="openDeleteGroupCard(group, index)">
                                                    mdi-minus-circle
                                                </v-icon>
                                            </v-list-item-icon>
                                        </template>

                                        <template v-slot:activator>
                                            <v-list-item-title :style="group.groupName != 'uncategorized' ? (group.labsList.length == 0 ? 'margin-left: -30px;':''):''" v-text="group.groupName"></v-list-item-title>
                                        </template>
                                        <draggable class="list-group" :list="group.labsList" group="people" @change="log">
                                            <v-list-item 
                                                v-for="(labId, i) in group.labsList"
                                                :key="i"
                                                link
                                                style="cursor: move;"
                                            >
                                                <v-list-item-title 
                                                    style="margin-left: 20px;"
                                                    :key="updateLabsList"
                                                >
                                                    <div v-if="AlllabsList[group.groupName] && AlllabsList[group.groupName][labId]">
                                                        <li :style="AlllabsList[group.groupName][labId].active ? '':'opacity: 0.4;'">
                                                            {{AlllabsList[group.groupName][labId].labName}}
                                                            <v-icon small v-if="AlllabsList[group.groupName][labId].price"> mdi-lock-outline
                                                            </v-icon>
                                                            <v-chip v-if="AlllabsList[group.groupName][labId].labStatus && AlllabsList[group.groupName][labId].labStatus.status=='completed'"
                                                                    color="green"
                                                                    style="margin-left: 5px;"
                                                                    outlined
                                                                    x-small>완료
                                                            </v-chip>
                                                            <v-chip v-if="AlllabsList[group.groupName][labId].labStatus && AlllabsList[group.groupName][labId].labStatus.status=='started'"
                                                                    color="red"
                                                                    style="margin-left: 5px;"
                                                                    outlined
                                                                    x-small>진행중
                                                            </v-chip>
                                                            <v-chip
                                                                    v-if="AlllabsList[group.groupName][labId].passMessage"
                                                                    :color="AlllabsList[group.groupName][labId].passMessage == '접속'? 'blue darken-1' :'green' "
                                                                    outlined
                                                                    x-small
                                                                    style="margin-left: 5px;"
                                                            >
                                                                {{AlllabsList[group.groupName][labId].passMessage}}
                                                            </v-chip>
                                                        </li>
                                                    </div>
                                                    <li v-else>{{labId}}</li>
                                                </v-list-item-title>
                                            </v-list-item>
                                        </draggable>
                                    </v-list-group>
                                </draggable>
                            </v-list>
                            
                            <v-list v-else dense expand
                                style="display: flex; flex-direction: column; max-width: 100%;"
                            >
                                <div v-for="(lab, i) in classInfo.groupedLabsList" :key="i">
                                    <v-list-group
                                        v-if="lab && lab.labsList.length > 0"
                                        :value="true"
                                        @click="selectGroup(lab)"
                                        class="lab-list-group-box"
                                    >
                                        <template v-slot:activator>
                                            <v-list-item-title>
                                                <b style="color: black;">{{lab.groupName}}</b>
                                            </v-list-item-title>
                                            <v-icon v-if="isLoadingLabInfo" color="primary">mdi-spin mdi-loading</v-icon>
                                        </template>
                                        <div v-for="(groupedLab, i) in lab.labsList" :key="i" style="display: flex; max-width: 100%;">
                                            <div v-if="AlllabsList[lab.groupName] && AlllabsList[lab.groupName][groupedLab]" style="white-space: nowrap;">
                                                <v-list-item
                                                    v-if="AlllabsList[lab.groupName][groupedLab].active == true || isAdmin"
                                                    link
                                                    @click="getSelectedLabInfo(lab, groupedLab)" 
                                                    :style="selectedLabInfo && selectedLabInfo.labId ==  groupedLab ? 'color: #2379cf':''"
                                                >
                                                    <v-list-item-title 
                                                        :style="selectedLabInfo && selectedLabInfo.labId ==  groupedLab ? 'color: #2379cf':''"
                                                        style="margin-left: 20px;"
                                                        :key="updateLabsList"
                                                    >
                                                        <li :style="AlllabsList[lab.groupName][groupedLab].active ? '':'opacity: 0.4;'">
                                                            {{AlllabsList[lab.groupName][groupedLab].labName}}
                                                            <v-icon small v-if="AlllabsList[lab.groupName][groupedLab].price"> mdi-lock-outline
                                                            </v-icon>
                                                            <v-chip v-if="AlllabsList[lab.groupName][groupedLab].labStatus && AlllabsList[lab.groupName][groupedLab].labStatus.status=='completed'"
                                                                    color="green"
                                                                    style="margin-left: 5px;"
                                                                    outlined
                                                                    x-small>완료
                                                            </v-chip>
                                                            <v-chip v-if="AlllabsList[lab.groupName][groupedLab].labStatus && AlllabsList[lab.groupName][groupedLab].labStatus.status=='started'"
                                                                    color="red"
                                                                    style="margin-left: 5px;"
                                                                    outlined
                                                                    x-small>진행중
                                                            </v-chip>
                                                            <v-chip
                                                                    v-if="AlllabsList[lab.groupName][groupedLab].passMessage"
                                                                    :color="AlllabsList[lab.groupName][groupedLab].passMessage == '접속'? 'blue darken-1' :'green' "
                                                                    outlined
                                                                    x-small
                                                                    style="margin-left: 5px;"
                                                            >
                                                                {{AlllabsList[lab.groupName][groupedLab].passMessage}}
                                                            </v-chip>
                                                        </li>
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </div>
                                            <v-list-item v-else link>
                                                <v-list-item-title 
                                                    style="margin-left: 20px; white-space: nowrap;"
                                                    :key="updateLabsList"
                                                    @click="getSelectedLabInfo(lab, groupedLab)" 
                                                >
                                                    <li>{{groupedLab}}</li>
                                                </v-list-item-title>
                                            </v-list-item>
                                        </div>
                                    </v-list-group>
                                </div>
                            </v-list>
                        </div>
                    </v-navigation-drawer>
                </v-col>
                <v-col
                    :cols="isMobile ? 12:9"
                    style="padding-bottom:100px;"
                >

                <div v-if="editModeController == 'selectedLabInfo'" :key="updateCard" class="pt-0 pl-2 pr-2 pt-3">
                    <v-progress-circular
                        v-if="isLoadingLabInfo"
                        indeterminate
                        color="primary"
                        style="padding: 20px; margin: 15px;"
                    ></v-progress-circular>
                    <div v-else>
                            <div v-if="selectedLabInfo" style="text-align:left;">
                                <!-- <v-chip color="#9E9E9E" small style="margin-top:-30px; color:white; font-weight:300;"><b>{{selectedLabInfo.labId}}</b>
                                </v-chip>
                                <v-chip color="#9E9E9E" small style="margin-top:-30px; margin-left: 5px; color:white; font-weight:300;"><b>{{selectedLabInfo.tool}}</b>
                                </v-chip> -->
                                <v-chip v-if="selectedLabInfo.labStatus && selectedLabInfo.labStatus.status=='completed'"
                                        color="green"
                                        outlined
                                        style="margin-top: -30px; margin-left: 5px;"
                                        small>완료
                                </v-chip>
                                <v-chip v-if="selectedLabInfo.labStatus && selectedLabInfo.labStatus.status=='started'"
                                        color="red"
                                        outlined
                                        style="margin-top: -30px; margin-left: 5px;"
                                        small>진행중
                                </v-chip>
                                <!-- <v-chip
                                        v-if="selectedLabInfo.passMessage"
                                        :color="selectedLabInfo.passMessage == '접속'? 'blue darken-1' :'green' "
                                        outlined
                                        small
                                        style="margin-top: -30px; margin-left: 5px;"
                                >
                                    {{selectedLabInfo.passMessage}}
                                </v-chip> -->
                                <!-- <v-icon v-if="AlllabsList[selectedLabInfo.groupName] && AlllabsList[selectedLabInfo.groupName][selectedLabInfo.labId] && AlllabsList[selectedLabInfo.groupName][selectedLabInfo.labId].active" style="margin-left: 5px;margin-top:-30px;"> mdi-eye-off-outline
                                </v-icon> -->
                                <v-col class="pa-0">
                                    <v-row class="pa-0 ma-0">
                                            <h2>{{selectedLabInfo.labName}}</h2>
                                            <!-- <v-tooltip right>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon v-if="selectedLabInfo.video" v-on="on" color="grey" @click="openLabVideoDialog()" style="margin-left: 5px;">mdi-youtube</v-icon>
                                                </template>
                                                <span>참고영상 시청</span>
                                            </v-tooltip> -->
                                        <v-spacer></v-spacer>
                                        <span>
                                            <v-icon v-if="selectedLabInfo.groupName == 'Ops'" @click="openGitpodIde()" size="20" style="margin-right:10px;">mdi-git</v-icon>
                                            <v-icon v-if="isAdmin" style="margin-right:10px;" size="20" @click="openDeleteLabDialog()">mdi-archive</v-icon>
                                            <v-icon v-if="isAdmin" @click="openEditLabInfo(selectedLabInfo)" size="20" style="margin-right:5px;">mdi-pencil</v-icon>
                                            <v-btn color="primary"
                                                @click="loginToUseLab()"
                                                style="font-weight:700; padding:10px;">
                                                <v-icon left style="margin-right: 3px;">
                                                    mdi-login
                                                </v-icon>
                                                INTO THE LAB
                                            </v-btn>
                                        </span>
                                    </v-row>
                                </v-col>
                            </div>
                                <div style="margin: 5px 0 10px 0;">
                                </div>
                            <div style="text-align:left; margin-top: 0px; color:rgba(0, 0, 0, 0.6)">
                                <h4 v-if="selectedLabInfo && selectedLabInfo.labScenario">{{selectedLabInfo.labScenario}}</h4>
                                <!-- <div v-if="selectedLabInfo.video">
                                    <youtube-media
                                        style="max-width:500px; height: 250px;"
                                        :video-id="selectedLabInfo.video"
                                    ></youtube-media>
                                </div> -->
                                <div style="margin:10px 0 -30px 0;" v-if="selectedLabInfo && selectedLabInfo.labTime">
                                    {{selectedLabInfo.labTime}}분 이내 완료
                                </div>
                                <!-- + '/' + myId" -->
                                
                                <div v-if="selectedLabInfo.instructionMd" style="font-weight:700; margin-top: 40px;"> 
                                    <b style="font-size: 17px;">Instruction </b>
                                    <v-divider></v-divider>
                                    <div>
                                        <vue-markdown
                                            class="markdown-body"
                                            :source="selectedLabInfo.instructionMd"
                                        >
                                        </vue-markdown>
                                        <v-divider></v-divider>
                                        <v-list dense>
                                            <v-list-item-title><b>CheckPoints</b></v-list-item-title>
                                                <v-list-item
                                                    v-for="(item, i) in selectedLabInfo.checkPoints"
                                                    :key="item.text"
                                                >
                                                    <v-list-item-content>
                                                        <v-list-item-title>{{i+1}}. {{ item.text }}</v-list-item-title>
                                                    </v-list-item-content>
                                            </v-list-item>
                                        </v-list>
                                    </div>
                                </div>
                                <v-divider></v-divider>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="editModeController == 'openClassInfoCard'" style="margin: 15px; margin-right: -5px;">
                        <div v-if="classInfo && courseId" style="margin: 15px;">
                            <div style="margin-left: 10px; float: right;">
                                <v-icon v-if="!editClassIntroduction && isAdmin"
                                    @click="openClassInfoDialog">mdi-information-outline
                                </v-icon>
                            </div>
                            <h1>강의 소개</h1>
                            <div v-if="classInfo.price && !isPaidClass">
                                <v-icon small> mdi-lock-outline</v-icon>
                                클래스 구매
                            </div>
                            <div style="display: flex;">
                                <h4>Introduction</h4>
                                <v-icon style="margin-left: 3px;" small dense v-if="!editClassIntroduction && isAdmin" @click="editClassIntroduction = true">
                                    mdi-pencil
                                </v-icon>
                            </div>
                            <div v-if="classIntroduction"
                                    style="margin-top: 5px; padding: 5px; margin-bottom: 5px;">
                                <vue-markdown
                                        v-if="!editClassIntroduction"
                                        :style="{ textDecoration: 'none !important' }"
                                        class="markdown-body"
                                        :source="classIntroduction"
                                >
                                </vue-markdown>
                            </div>
                            <v-divider v-if="!editClassIntroduction"></v-divider>
                            <div style="float: right; margin-top: -20px; margin-right: 10px;">
                                <v-btn small v-if="editClassIntroduction" text style = "font-size:700;"
                                        @click="editClassIntroduction=false">Cancel
                                </v-btn>
                                <v-btn small v-if="editClassIntroduction" text style = "font-size:700;" color="primary"
                                        @click="editIntroduction(classIntroduction)">Save
                                </v-btn>
                            </div>
                            <div style="margin-top: 5px; padding: 5px; margin-bottom: 5px;">
                                <v-col v-if="editClassIntroduction">
                                    <vue-simplemde v-model="classIntroduction" ref="markdownEditor"/>
                                </v-col>

                                <v-checkbox
                                        v-if="!editClassIntroduction && isOwner"
                                        v-model="editCourseMandatory"
                                        label="이 유형의 모든 클래스에 반영"
                                        color="primary"
                                        style="display: table-row;"
                                ></v-checkbox>
                                <v-row justify="center">
                                    <v-dialog
                                        v-model="classInfoDialog"
                                        width="600px"
                                    >
                                        <v-card>
                                            <v-btn icon @click.native="classInfoDialog = false" style="float: right;">
                                                <v-icon color="grey lighten-1">mdi-close</v-icon>
                                            </v-btn>
                                            <div style = "padding: 20px 0 0 25px;">
                                                <div v-if="classInfo.classId">
                                                    <span style = "font-weight:700; font-size:16px;">Class ID</span>
                                                    <v-text-field
                                                        id="copy-class-id"
                                                        label="ClassId"
                                                        :value="classInfo.classId"
                                                        append-icon="mdi-clipboard-text"
                                                        solo
                                                        readonly
                                                        @click:append="copytoClipBoard('classId')"
                                                        style="margin-right:25px;"
                                                    ></v-text-field>
                                                </div>
                                                <div v-if="classInfo.connectionKey">
                                                    <span style = "font-weight:700; font-size:16px;">Connection Key</span>
                                                    <v-text-field
                                                        id="copy-connection-key"
                                                        label="ConnectionKey"
                                                        :value="classInfo.connectionKey"
                                                        append-icon="mdi-clipboard-text"
                                                        solo
                                                        readonly
                                                        @click:append="copytoClipBoard('connectionKey')"
                                                        style="margin-right:25px;"
                                                    ></v-text-field>
                                                </div>
                                            </div>
                                            <div v-if="!classInfo.archive" style="text-align-last: center;">
                                                <v-divider style="margin: 20px;" />
                                                <v-btn small style="margin-bottom: 10px; margin-top: -10px;" color="error" @click="openMoveDialog = true">강의 종료</v-btn>
                                            </div>
                                        </v-card>
                                    </v-dialog>
                                </v-row>
                            </div>
                        </div>
                    </div>
                    
                    <div v-else-if="editModeController == 'editMode'" style="margin: 15px">
                            <div>
                                <v-text-field filled rounded dense label="lab-Id *" disabled
                                                v-model="editLabInfo.labId"
                                                style="max-width:300px;">
                                </v-text-field>

                                <v-text-field outlined label="lab-Name *"
                                        v-model="editLabInfo.labName"
                                        style="max-width:400px;"
                                        :rules="nameRules"
                                >
                                </v-text-field>
                                <v-switch
                                    v-model="editLabInfo.active"
                                    label="Active"
                                    color="primary"
                                ></v-switch>
                                <v-switch
                                        :input-value="editLabInfo.certificate"
                                        @click="onChangedMandatory(editLabInfo)"
                                        label="수료 기준 설정"
                                        color="primary"
                                ></v-switch>

                                <v-row v-if="editLabInfo.mandatory && editLabInfo.certificate"
                                        style="max-width: 360px;flex-flow: row;margin-left: 1px;">
                                    <v-autocomplete
                                            v-model="editLabInfo.mandatory.checkPoint"
                                            label="Mandatory passed"
                                            auto-select-first
                                            dense
                                            solo
                                            :items="getMandatoryMenuLists"
                                            item-text="text"
                                            item-value="value"
                                    ></v-autocomplete>
                                    <v-checkbox
                                            dense
                                            v-model="editLabInfo.mandatory.attend"
                                            label="출석 여부"
                                    ></v-checkbox>
                                </v-row>

                                <v-textarea outlined label="lab-Scenario" height="100"
                                            v-model="editLabInfo.labScenario"
                                            style="width: 100%;">
                                </v-textarea>
                                <v-select
                                    :items="groupNameList"
                                    label="group *"
                                    v-model="editLabInfo.groupName"
                                    required
                                    style="max-width:400px;"
                                ></v-select>
                                <v-select
                                        :items="['event-storming', 'ide', 'kuber-ez', 'url', 'business-model-canvas', 'quiz']"
                                        label="tool *"
                                        v-model="editLabInfo.tool"
                                        required
                                        style="max-width:400px;"
                                ></v-select>
                                <v-text-field
                                    v-if="editLabInfo.tool == 'event-storming'"
                                    v-model="editLabInfo.modelUrl"
                                    label="모델 URL 추가"
                                    color="primary"
                                ></v-text-field>
                                <v-switch
                                    v-if="editLabInfo.tool == 'ide'"
                                    v-model="editLabInfo.addWorkSpace"
                                    label="워크스페이스 생성"
                                    color="primary"
                                ></v-switch>
                                <v-row style = "height:50px;">
                                    <v-text-field 
                                        class="input-field" outlined label="lab-Price"
                                        :disabled="connectionKeyLength > 0" type="number"
                                        v-model="editLabInfo.price"
                                        style = "margin-left:10px; margin-right:10px; max-width:200px;"
                                    >
                                    </v-text-field>
                                </v-row>
                                <div style="margin-top:20px; float: right;">
                                    <v-btn style="
                                        font-weight:700;"
                                        @click="editModeController = 'selectedLabInfo'"
                                        text
                                    >취소
                                    </v-btn>
                                    <v-btn text
                                        :disabled="!editLabInfo.labName"
                                        style="
                                                margin-right: 0px; 
                                                font-weight:700;
                                                color:#1E88E5;"
                                        @click="submitEditLabInfo(editLabInfo)"
                                    >수정
                                    </v-btn>
                                </div>
                            </div>
                    </div>
                    <div v-else-if="selectedGroupInfo && editModeController == 'openGroupCard'">
                        <v-col>
                            <div style="display: flex;">
                                <h1>{{selectedGroupInfo.groupName}}</h1>
                                <v-icon v-if="selectedGroupInfo.groupName != 'uncategorized' && isAdmin" style="margin-left: 5px;" @click="openEditGroupCard(selectedGroupInfo)">mdi-pencil</v-icon>
                            </div>
                            <h3 v-if="selectedGroupInfo.goal">{{selectedGroupInfo.goal}}</h3>                                        
                            <v-select
                                v-model="selectedGroupInfo.labNameList"
                                :items="setSelectedGroupLabsNameList"
                                attach
                                chips
                                label="Labs"
                                multiple
                                readonly
                            ></v-select>

                        </v-col>
                    </div>
                    <div v-else-if="editModeController == 'EditModeforGroupCard'">
                        <v-col>
                            <v-text-field filled rounded dense label="groupName *" 
                                :disabled="setEditGroupInfo.groupName == 'uncategorized' ? true:false"
                                v-model="setEditGroupInfo.groupName" style="width: 300px;"
                                :rules="vaildateRules"
                            ></v-text-field>
                            <v-select
                                :disabled="setEditGroupInfo.groupName == 'uncategorized' ? true:false"
                                v-model="setEditGroupInfo.labNameList"
                                :items="setSelectedGroupLabsNameList"
                                attach
                                chips
                                label="Unselected lab will be move uncategorized Group"
                                multiple
                            ></v-select>

                            <v-textarea outlined label="lab-Scenario" height="200" v-model="setEditGroupInfo.goal"></v-textarea>                                        
                        </v-col>
                        <div style="float:right; font-weight:700; margin-top: 15px; margin-right: 15px; margin-bottom: 10px;">
                            <v-btn text @click="editModeController = 'openGroupCard'">cancel</v-btn>
                            <v-btn text
                                :disabled="vaildateCheckforEditGroupName"
                                type="submit"
                                style="color:#1E88E5; font-weight:700"
                                @click="editGroup(setEditGroupInfo)"
                            >수정
                            </v-btn>
                        </div>
                    </div>
                    <div v-else-if="editModeController == 'inputLabinfo'" style="margin: 15px; margin-right: -5px;">
                        <v-tabs 
                            v-model="tab"
                        >
                            <v-tab
                                v-for="item in items"
                                :key="item"
                            >
                                {{ item }}
                            </v-tab>
                        </v-tabs>

                        <v-tabs-items v-model="tab">
                            <v-tab-item
                                v-for="item in items"
                                :key="item"
                            >
                                <div v-if="item == 'New Group'" style="margin-right: 10px;">
                                    <v-col>
                                        <v-text-field filled rounded dense label="groupName *" 
                                            v-model="newGroup.groupName" style="width: 300px;"
                                            :rules="vaildateRules"
                                        ></v-text-field>
                                        <v-select
                                            v-model="newGroup.labsList"
                                            :items="uncategorizedGroupLabsList"
                                            attach
                                            chips
                                            label="Select Lab"
                                            multiple
                                        ></v-select>

                                        <v-textarea outlined label="lab-Scenario" height="200" v-model="newGroup.goal"></v-textarea>                                        
                                    </v-col>
                                    <v-btn text
                                        :disabled="vaildateCheckforGroupName"
                                        style="float:right;
                                            font-weight:700;
                                            margin-top: 15px;
                                            margin-right: 15px;
                                            color:#1E88E5;"
                                        type="submit"
                                        @click="addNewGroup(newGroup)"
                                    >생성
                                    </v-btn>
                                </div>

                                <div v-else-if="item == 'New Lab'" style="margin-right: 10px;">
                                    <v-col>
                                        <v-text-field :rules="vaildateRules"
                                            filled rounded dense label="lab-Id *" v-model="newLab.LabId" style="width: 300px;"></v-text-field>

                                        <v-text-field :rules="nameRules"
                                            outlined label="lab-Name *" v-model="newLab.LabName" style="width: 400px;"></v-text-field>
                                    </v-col>

                                    <v-col>
                                        <v-textarea outlined label="lab-Scenario" height="200" v-model="newLab.LabScenario"></v-textarea>
                                            
                                        <v-select
                                            :key="keyforGroupNameList"
                                            :rules="nameRules"
                                            :items="groupNameList"
                                            label="group *"
                                            v-model="newLab.groupName"
                                            required
                                            style="width: 400px;"
                                        ></v-select>

                                        <v-select
                                                :rules="nameRules"
                                                :items="['event-storming', 'ide', 'kuber-ez', 'url', 'business-model-canvas', 'quiz']"
                                                label="tool *"
                                                v-model="newLab.Labtool"
                                                required
                                                style="width: 400px;"
                                        >
                                        </v-select>
                                        <v-text-field
                                            v-if="newLab.Labtool == 'event-storming'"
                                            v-model="newLab.modelUrl"
                                            label="모델 URL 추가"
                                            color="primary"
                                        ></v-text-field>
                                        <v-switch
                                            v-if="newLab.Labtool == 'ide'"
                                            v-model="newLab.addWorkSpace"
                                            label="워크스페이스 생성"
                                            color="primary"
                                        ></v-switch>
                                    </v-col>
                                    <v-text-field class="input-field" outlined label="lab-Price"
                                        :disabled="connectionKeyLength > 0" type="number"
                                        v-model="newLab.LabPrice"
                                        style="width: 200px; margin-left: 10px;"
                                    >
                                    </v-text-field>
                                    <v-btn text
                                        style="float:right;
                                            font-weight:700;
                                            margin-top: -20px;
                                            margin-right: 15px;
                                            color:#1E88E5"
                                        type="submit"
                                        :disabled="vaildateCheckforLabId"
                                        @click="addNewLab(newLab)"
                                    >생성
                                    </v-btn>
                                </div>
                                
                                <div
                                    v-else 
                                    style="display: flex; margin: 0px 15px 15px 0px; width: -webkit-fill-available;"
                                >
                                    <v-navigation-drawer height="700" v-if="!isMobile" permanent>
                                        <v-list-item>
                                            <v-list-item-content>
                                            <v-list-item-title class="text-h6">
                                                AnotherLabsList
                                                <v-progress-circular
                                                    v-if="loadingForDeletedLabsList"
                                                    indeterminate
                                                    color="primary"
                                                    style="padding: 20px; margin: 15px;"
                                                ></v-progress-circular>
                                            </v-list-item-title>
                                            </v-list-item-content>
                                        </v-list-item>

                                        <v-divider></v-divider>

                                                <!-- v-if="AllDeletedLabsList"
                                                :key="keyforDeletedLabsList" -->
                                        <v-list
                                            dense
                                            nav
                                        >
                                            <v-list-item-group
                                                v-model="selectedItem"
                                                color="primary"
                                            >
                                                <v-list-item
                                                    v-for="(delab, i) in classInfo.deletedLabsList"
                                                    :key="i"
                                                    link
                                                    @click="openDeletedLabCard(delab)"
                                                >
                                                    <v-list-item-content :key="keyforDeletedLabsList">
                                                        <v-list-item-title v-if="AllDeletedLabsList[delab]">
                                                            {{ AllDeletedLabsList[delab].labName }}
                                                        </v-list-item-title>
                                                        <v-list-item-title v-else>
                                                            {{ delab }}
                                                        </v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                        <v-divider></v-divider>
                                    </v-navigation-drawer>
                                    <div v-else>
                                        <div v-if="!delabInfo && !loadingDeletedLabCard">
                                            <v-list-item>
                                                <v-list-item-content>
                                                <v-list-item-title class="text-h6">
                                                    AnotherLabsList
                                                    <v-progress-circular
                                                        v-if="loadingForDeletedLabsList"
                                                        indeterminate
                                                        color="primary"
                                                        style="padding: 20px; margin: 15px;"
                                                    ></v-progress-circular>
                                                </v-list-item-title>
                                                </v-list-item-content>
                                            </v-list-item>

                                            <v-divider></v-divider>

                                            <v-list>
                                                <v-list-item-group
                                                    v-model="selectedItem"
                                                    color="primary"
                                                >
                                                    <v-list-item
                                                    v-for="(delab, i) in classInfo.deletedLabsList"
                                                    :key="i"
                                                    link
                                                    @click="openDeletedLabCard(delab)"
                                                >
                                                    <v-list-item-content :key="keyforDeletedLabsList">
                                                        <v-list-item-title v-if="AllDeletedLabsList[delab]">
                                                            {{ AllDeletedLabsList[delab].labName }}
                                                        </v-list-item-title>
                                                        <v-list-item-title v-else>
                                                            {{ delab }}
                                                        </v-list-item-title>
                                                    </v-list-item-content>
                                                </v-list-item>
                                                </v-list-item-group>
                                            </v-list>
                                            <v-divider></v-divider>
                                        </div>
                                    </div>
                                        
                                    <v-progress-circular
                                        v-if="!delabInfo && loadingDeletedLabCard"
                                        indeterminate
                                        color="primary"
                                        style="padding: 20px; margin: 15px;"
                                    ></v-progress-circular>
                                    <div v-if="delabInfo" style="padding: 20px; width: -webkit-fill-available;">
                                        <v-text-field filled rounded dense label="lab-Id *" disabled style="width: 200px;"
                                                        v-model="delabInfo.labId">
                                        </v-text-field>

                                        <v-text-field outlined label="lab-Name *"
                                                        v-model="delabInfo.labName"
                                                        :rules="nameRules"
                                                        style="width: 250px;"
                                        >
                                        </v-text-field>
                                        <div>
                                            <v-switch
                                                    :input-value="delabInfo.certificate"
                                                    @click="onChangedMandatory(delabInfo)"
                                                    label="수료 기준 설정"
                                                    color="primary"
                                                    style="margin-top: -20px;"
                                            ></v-switch>

                                            <div v-if="delabInfo.mandatory && delabInfo.certificate"
                                                    style="margin-top: -15px; margin-left: 1px; ">
                                                <v-autocomplete
                                                        v-model="delabInfo.mandatory.checkPoint"
                                                        label="Mandatory passed"
                                                        auto-select-first
                                                        dense
                                                        solo
                                                        :items="getMandatoryMenuLists"
                                                        item-text="text"
                                                        item-value="value"
                                                ></v-autocomplete>
                                                <v-checkbox
                                                        style="margin-top: -25px;"
                                                        dense
                                                        v-model="delabInfo.mandatory.attend"
                                                        label="출석 여부"
                                                ></v-checkbox>
                                            </div>
                                        </div>

                                        <v-textarea outlined label="lab-Scenario" height="150"
                                                    v-model="delabInfo.labScenario">
                                        </v-textarea>
                                        <v-select
                                            :rules="nameRules"
                                            :items="groupNameList"
                                            label="group *"
                                            v-model="delabInfo.groupName"
                                            required
                                            style="width: 200px;"
                                        ></v-select>
                                        <v-select
                                                :items="['event-storming', 'ide', 'kuber-ez', 'url', 'business-model-canvas', 'quiz']"
                                                label="tool *"
                                                v-model="delabInfo.tool"
                                                required
                                                style="width: 250px;"
                                        ></v-select>
                                        <v-text-field
                                            v-if="delabInfo.tool == 'event-storming'"
                                            v-model="delabInfo.modelUrl"
                                            label="모델 URL 추가"
                                            color="primary"
                                        ></v-text-field>
                                        <v-switch
                                            v-if="delabInfo.tool == 'ide'"
                                            v-model="delabInfo.addWorkSpace"
                                            label="워크스페이스 생성"
                                            color="primary"
                                        ></v-switch>
                                        <v-text-field 
                                            class="input-field" outlined label="lab-Price"
                                            :disabled="connectionKeyLength > 0" type="number"
                                            v-model="delabInfo.price"
                                            style = "width: 250px;"
                                        >
                                        </v-text-field>
                                        <div style="float: right; margin-right: -30px;"
                                                :style="delabInfo.mandatory ? 'margin-top: -55px;':'margin-top: 10px'"
                                        >
                                            <v-btn
                                                v-if="isMobile" 
                                                style="font-weight:700;"
                                                @click="delabInfo = null, loadingDeletedLabCard = false"
                                                text
                                            >back 
                                            </v-btn>
                                            <v-btn color="primary"
                                                style="font-weight:700;"
                                                :disabled="!delabInfo.labName"
                                                @click="backtoList(delabInfo)"
                                                text
                                            >return
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </v-tab-item>
                        </v-tabs-items>
                    </div>
                <!-- </v-card> -->
                </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-dialog
                v-model="openDeleteDialog"
                v-if="editModeController == 'selectedLabInfo' && selectedLabInfo"
                persistent
                width="400"
            >
                <v-card height="200">
                    <v-card-title style="background-color: #F44336; color: white; margin-left:-10px;">Delete</v-card-title>
                    <div style = "padding:15px;">{{ selectedLabInfo.labName }}</div>
                    <v-checkbox
                        v-model="deleteCheck"
                        hide-details
                        :label="'해당 랩이 삭제됩니다.'"
                        color="red"
                        value="red"
                        style = "padding-left:12px; margin-top:-10px;"
                    ></v-checkbox>
                    <div style = "position:absolute; right:5px; bottom:10px;">
                        <v-btn
                            color="#F44336"
                            style="float: right; "
                            :disabled="!deleteCheck"
                            @click="deleteLab(selectedLabInfo)"
                            text
                        >삭제
                        </v-btn>
                        <v-btn
                            style="float: right;"
                            @click="openDeleteDialog = false, deleteCheck = false"
                            text
                        >취소
                        </v-btn>
                    </div>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="openDeleteGroup"
                persistent
                width="400"
            >
                <v-card height="200">
                    <v-card-title style="background-color: #F44336; color: white; margin-left:-10px;">Delete Group</v-card-title>
                    <div style = "padding:15px;">{{ deleteGroupName }}</div>
                    <v-checkbox
                        v-model="deleteCheckforGroup"
                        hide-details
                        :label="'해당 그룹이 삭제됩니다.'"
                        color="red"
                        value="red"
                        style = "padding-left:12px; margin-top:-10px;"
                    ></v-checkbox>
                    <div style = "position:absolute; right:5px; bottom:10px;">
                        <v-btn
                            color="#F44336"
                            style="float: right; "
                            :disabled="!deleteCheckforGroup"
                            @click="deleteGroup(deleteGroupName, deleteGroupIndex)"
                            text
                        >삭제
                        </v-btn>
                        <v-btn
                            style="float: right;"
                            @click="openDeleteGroup = false, deleteCheckforGroup = false"
                            text
                        >취소
                        </v-btn>
                    </div>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="openMoveDialog"
                persistent
                width="400"
            >
                <v-card height="200">
                    <v-card-title style="background-color: #F44336; color: white; margin-left:-10px;">강의 종료</v-card-title>
                    <div v-if="classInfo && classInfo.className" style = "padding:15px;">{{ classInfo.className }}</div>
                    <v-checkbox
                        v-model="moveCheck"
                        hide-details
                        :label="'해당 강의가 Archive 로 이동, 종료됨을 확인하였습니다.'"
                        color="red"
                        value="red"
                        style = "padding-left:12px; margin-top:-10px;"
                    ></v-checkbox>
                    <div style = "position:absolute; right:5px; bottom:10px;">
                        <v-btn
                            color="#F44336"
                            style="float: right; "
                            :disabled="!moveCheck"
                            @click="moveClasstoArchive()"
                            text
                        >확인
                        </v-btn>
                        <v-btn
                            style="float: right;"
                            @click="openMoveDialog = false, moveCheck = false"
                            text
                        >취소
                        </v-btn>
                    </div>
                </v-card>
            </v-dialog>
            <v-dialog 
                v-if="selectedLabInfo && selectedLabInfo.video" 
                v-model="videoDialog" 
                max-width="600" 
                transition="fab-transition" 
                :hide-overlay="!isMobile"
            >
                <v-card height="400px" :style="isMobile ? '':'position: absolute; bottom: 5px; right: 20px; width: 600px;'" :key="selectedLabInfo.labId">
                    <div style="height:34px; background-color:white;">
                        <v-btn style="position:absolute; right:5px;" text icon @click="videoDialog=false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </div>
                    <div style="height: 90%;">
                            <youtube-media
                                    style="width:100%; height: 100%;"
                                    :video-id="videoId"
                            ></youtube-media>
                        </div>
                </v-card>
            </v-dialog>
            <v-snackbar
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
            </v-snackbar>
        </v-container>
        <!-- <div v-else>
            <Login
                :LoginInformation1="$t('loginList.LoginInformation3')"
                :LoginInformation2="$t('loginList.LoginInformation4')"
            />
        </div> -->
    </div>
</template>

<script>
    import LabBase from "./LabStorageBase";
    import { forEach } from 'jszip';
    import draggable from 'vuedraggable'
    import BlurPurchaseItem from "../payment/BlurPurchaseItem";
    import ModelCanvasVue from "../designer/modeling/ModelCanvas.vue";
    import BlurServiceByUsage from "../payment/BlurServiceByUsage.vue";

    export default {
        name: "ClassDetail",
        display: "Simple",
        order: 0,
        components: {
            draggable,
            'blur-purchase-item' : BlurPurchaseItem,
            'blur-service-usage' : BlurServiceByUsage
        },
        mixins: [LabBase],
        props: {},
        data: () => ({
            labURLNumber: 7,
            labURL: null,
            videoDialog: false,
            AllLabsId: [],
            deleteGroupName: null,
            deleteGroupIndex: null,
            openDeleteGroup: false,
            isChanged: false,
            ModeText: '편집모드로 전환',
            setEditGroupInfo: null,
            keyforDeletedLabsList: 0,
            AllDeletedLabsList: [],
            loadingForDeletedLabsList: false,
            setLabIdList: [],
            updateLabsList: 0,
            setCurrnetGroupName: null,
            editModeController: null,
            AlllabsList: {},
            selectedGroupName: '',
            selectedGroupInfo: null,
            selectedGroupInfoOrigin: null,
            setSelectedGroupLabsList: null,
            keyforGroupNameList: 0,
            copyClassInfoforGroupList: null,
            nameRules: [
                v => !!v || 'This field is required',
            ],
            vaildateRules: [
                v => !!v || 'This field is required',
                v => !/[\sㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+=|<>?:.,;/'"`{}]/.test(v) || '특수문자가 포함되어있습니다.', 
            ],
            isLoading: true,
            updateCard: 0,
            isLoadingLabInfo: false,
            openClassInfoCard: false,
            deleteCheck: false,
            deleteCheckforGroup: false,
            gitPodLink: null,
            openDeleteDialog: false,
            selectedItem: null,
            items: [
            { title: 'Home', icon: 'mdi-home-city' },
            { title: 'My Account', icon: 'mdi-account' },
            { title: 'Users', icon: 'mdi-account-group-outline' },
            ],
            delabInfo: null,
            loadingDeletedLabCard: false,
            tab: null,
            items: [
                'New Group', 'New Lab', 'Another Labs'
            ],
            drawer: true,
            drawerDelabsList: false,
            selectedLabInfo: null,
            selectedLab: false,
            courseInfo: null,
            classInfo: null,
            labs: [],
            classIntroduction: null,
            isPaidClass: false,
            inputLabinfo: false,
            inputlabCardKey: 0,
            newGroup: {
                groupName: '',
                goal: '',
                labsList: [],
            },
            newLab: {
                LabId: '',
                LabName: '',
                LabScenario: '',
                addWorkSpace: false,
                modelUrl: '',
                Labtool: null,
                mandatory: 0,
                LabPrice: 0,
                groupName: 'uncategorized',
            },
            editCourseMandatory: false,
            mandatoryMenuLists: [
                {value: null, text: '없음 (달성하지 않아도 수료)'},
            ],
            deleteLabList: [],
            newDeletedLabsList: [],

            editList: false,
            deleteLabDialog: false,
            classInfoDialog: false,
            deleteCheck: false,
            setLabId: '',
            copyLabInfo: [],
            labIndex: null,

            editClassIntroduction: false,
            indeterminate: false,
            copyClassInfo: [],
            snackBar: {
                Text: '',
                show: false,
                Color: null,
            },

            //new
            invalid: true,
            openEditLabList: false,
            delabs: null,
            listIndex: null,
            returnLabsList: [],
            returnDelabs: [],
            setEditLab: "",
            editLabInfo: null,
            editLabInfoOrigin: null,

            logCount: 0,
            connectionKeyLength: 0,
            isOwner: false,
            disableSaveBtn: true,
            openMoveDialog: false,
            moveCheck: false,
            rootPath: null,

            groupedLabsList: [],
            testlist: [],
            groupNameList: [],
            uncategorizedGroupLabsList: [],
            isMobile: false,
            groupIndex: 0,
            accessKey: false,
        }),

        created(){

        },
        computed: {
            videoId() {
                var me = this
                if (me.selectedLabInfo && me.selectedLabInfo.video) {
                    return me.selectedLabInfo.video.split('/')[me.selectedLabInfo.video.split('/').length - 1]
                } else {
                    return null
                }
            },
            setSelectedGroupLabsNameList() {
                var me = this
                var setList = []
                for(var i = 0; i < me.setSelectedGroupLabsList.length; i++){
                    if(me.AlllabsList[me.selectedGroupInfo.groupName] && me.AlllabsList[me.selectedGroupInfo.groupName][me.setSelectedGroupLabsList[i]]){
                        setList[i] = me.AlllabsList[me.selectedGroupInfo.groupName][me.setSelectedGroupLabsList[i]].labName
                        me.setLabIdList[setList[i]] = me.AlllabsList[me.selectedGroupInfo.groupName][me.setSelectedGroupLabsList[i]].labId
                    }
                }
                me.selectedGroupInfo.labNameList = setList
                return setList
            },
            vaildateCheckforEditGroupName(){
                if(this.selectedGroupInfo.groupName == ""){
                    return true
                } else {
                    var par = /[\sㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+=|<>?:.,;/'"`{}]/
                    var t = par.test(this.selectedGroupInfo.groupName) 
                    return t
                } 
            },
            vaildateCheckforGroupName(){
                if(this.newGroup.groupName == ""){
                    return true
                } else {
                    var par = /[\sㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+=|<>?:.,;/'"`{}]/
                    var t = par.test(this.newGroup.groupName) 
                    return t
                } 
            },
            vaildateCheckforLabId(){
                if(this.newLab.LabId == ""){
                    return true
                } else if(this.newLab.LabName == ""){
                    return true
                } else if(this.newLab.Labtool == null){
                    return true
                } else {
                    var par = /[\sㄱ-ㅎ|ㅏ-ㅣ|가-힣~!@#$%^&*()_+=|<>?:.,;/'"`{}]/
                    var t = par.test(this.newLab.LabId)
                    return t
                }
            },
            getMandatoryMenuLists() {
                var me = this
                var filterMenuList = this.mandatoryMenuLists
                if (this.setEditLab) {
                    filterMenuList = JSON.parse(JSON.stringify(filterMenuList))
                    // var editLabInfo = me.labs.find(x => x.labId == me.setEditLab)
                    if (me.selectedLabInfo) {
                        var allCheckPoint = me.selectedLabInfo.checkPoints.length
                        me.selectedLabInfo.checkPoints.forEach(function (value, key) {
                            var obj = {
                                value: key + 1, text: `체크포인트 ${key + 1}/${allCheckPoint} 이상`
                            }
                            filterMenuList.push(obj)
                        })
                        return filterMenuList
                    }
                }
                return filterMenuList
            },
            userId() {
                if (localStorage.getItem('email'))
                    return localStorage.getItem('email')

                return this.myId;
            },
        },
        watch: {
            "editModeController": function(mode) {
                if(mode == 'inputLabinfo'){
                    this.ModeText = '보기모드로 전환'
                } else {
                    if(this.isChanged){
                        this.getGroupedLabsList()
                    }
                    this.ModeText = '편집모드로 전환'
                }
            },
            "tab": function() {
                var me = this
                if(me.tab == 2){
                    me.selectedItem = null
                    me.delabInfo = null
                    if(me.classInfo.deletedLabsList.length > 0 && me.AllDeletedLabsList.loaded != true){
                        me.loadingForDeletedLabsList = true
                        me.getDeletedLabsList()
                    }
                } else if(me.tab == 1) {
                    me.newLab = {
                        LabId: '',
                        LabName: '',
                        LabScenario: '',
                        Labtool: null,
                        mandatory: 0,
                        LabPrice: 0,
                        groupName: 'uncategorized'
                    }
                    if(me.accessKey) {
                        me.newLab.groupName = this.setLabId
                    }
                } else if(me.tab == 0){
                    me.newGroup = {
                        groupName: '',
                        goal: '',
                        labsList: [],
                    }
                }
                me.accessKey = false
            },
            "classInfo.connectionKey": function (data) {
                if(data){
                    this.connectionKeyLength = data.length
                } else {
                    this.connectionKeyLength = 0
                }
            },
            "videoId":function(newVal){
                var me = this
                if(newVal){
                    me.videoDialog = false
                    setTimeout(function() {
                        me.videoDialog = true
                    }, 250);
                }
            },
            'newLab.modelUrl':
            _.debounce(async function(newVal){
                var me = this
                me.validateModelUri(newVal)
            }, 1000),
        },
        async mounted() {
            var me = this

            if(window.MODE == "onprem"){
                me.labURLNumber = 6
            }

            me.$EventBus.$emit("setLabInfo", null)
            me.$EventBus.$emit('setLabTool', 'null')
            me.$EventBus.$emit("inSideCourse", false)
            me.$EventBus.$emit("inSideRounge", true)
            me.$EventBus.$emit("endProgressing")
            me.$EventBus.$on('jumpToLab', function() {
                me.moveToSelectedLab()
            });
            window.document.title = '라운지'
            if(window.innerWidth > 970){
                me.isMobile = false
                me.$EventBus.$emit('mobileMode', false);
            } else {
                me.isMobile = true
                me.$EventBus.$emit('mobileMode', true);
            }

            window.addEventListener("resize", function () {
                if(window.innerWidth > 970){
                    me.isMobile = false
                    me.$EventBus.$emit('mobileMode', false);
                } else {
                    me.isMobile = true
                    me.$EventBus.$emit('mobileMode', true);
                }
            });
            me.$EventBus.$on('naviControll', function () {
                me.drawer = !me.drawer
            })

            await me.load();
        },
        beforeDestroy(){
            this.$EventBus.$emit("inSideRounge", false)
        },
        methods: {
            selectedLabsCart(){

            },
            // customPay(){
            //     var me = this
            //     // rules 오픈후 작업.
            //     let userEmail = 'onlys8@naver_com'
            //     let classObj = me.AlllabsList.Dev;
            //     Object.keys(classObj).forEach(function(labId){
            //         let labObj = classObj[labId];
            //         let videoId = labObj.video.split('/')[labObj.video.split('/').length - 1];
            //         let isu = Date.now();
            //         // let ex = isu + (90 * 24 * 60 * 60 * 1000) //90일
            //
            //         let obj = {
            //             expiredDate: 0,
            //             // issuedDate: isu,
            //             // relatedTo: "direct"
            //         }
            //
            //         me.putObject(`db://enrolledUsers/${userEmail}/purchaseItemSnapshots/video@${videoId}`,obj)
            //     });
            //
            // },
            async validateModelUri(uri){
                var me = this
                if(!uri){
                    return false
                }
                if(/^http[s]?\:\/\//i.test(uri)){
                    let array = uri.split('/');
                    uri = array[array.length-1];
                }
                let ModelCanvasClass = Vue.extend(ModelCanvasVue);
                let modelCanvasVue = new ModelCanvasClass()
                var isMineModel = await modelCanvasVue.isExistPermission(uri, me.userInfo.uid)
                var isExistEveryone = await modelCanvasVue.isExistPermission(uri, 'everyone')
                var information = await modelCanvasVue.isExistServerModel(uri)
                
                // modelUrl에 url 또는 projectId를 입력하였지만 해당 모델이 존재하지 않을 때
                if(!information){
                    me.snackBar.show = true
                    me.snackBar.Text = 'The model does not exist.'
                    me.snackBar.Color = "red"
                    return false  
                }
                
                // model을 생성한 유저의 email과 랩을 생성하는 유저의 email이 다를 때
                if(!(isMineModel && isMineModel.isAuthor)){
                    me.snackBar.show = true
                    me.snackBar.Text = 'You can only share your own model.'
                    me.snackBar.Color = "red"
                    return false 
                }
                // public상태가 아닐 때
                if(!isExistEveryone){
                    var result = confirm("Do you want to share the model publicly?")
                    if(result == true){
                        modelCanvasVue.addPublicModel(uri)
                    }else{
                        return false;
                    }
                }
            },
            setSelectedLabPage(labInfo){
                var me = this
                me.selectedLabInfo = labInfo  
                me.isLoadingLabInfo = false
                me.editModeController = 'selectedLabInfo'
            },
            openLabVideoDialog(){
                var me = this
                me.videoDialog = true
            },
            openDeleteGroupCard(groupInfo, groupIndex){
                var me = this
                me.openDeleteGroup = true
                me.deleteCheckforGroup = false
                me.deleteGroupName = groupInfo.groupName
                me.deleteGroupIndex = groupIndex
            },
            deleteGroup(groupName, groupIndex){
                var me = this
                if(groupName == me.copyClassInfoforGroupList.groupedLabsList[groupIndex].groupName){
                    me.copyClassInfoforGroupList.groupedLabsList.splice(groupIndex, 1)
                }
                me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", me.copyClassInfoforGroupList)
                me.openDeleteGroup = false
                me.deleteCheckforGroup = false

                me.classInfo = JSON.parse(JSON.stringify(me.copyClassInfoforGroupList))

            },
            openEditGroupCard(selectedGroupInfo){
                var me = this
                me.editModeController = 'EditModeforGroupCard'
                me.setEditGroupInfo = JSON.parse(JSON.stringify(selectedGroupInfo))
            },
            log: function(evt) {
                var me = this
                // console.log(evt);
                // console.log(this.copyClassInfoforGroupList);
                me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", this.copyClassInfoforGroupList)
                me.classInfo = JSON.parse(JSON.stringify(this.copyClassInfoforGroupList))
                me.isChanged = true
            },
            async getDeletedLabsList(){
                var me = this
                me.AllDeletedLabsList.loaded = true
                var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))

                var labNameLists = await me.list(`storage://labs-msaez.io/running/${me.courseId}/labs/`, true)
                // console.log(labNameLists)
                if (labNameLists) {
                    var AllLabs = []
                    labNameLists.forEach(function (obj) {
                        if (obj.name.includes("Lab_Metadata.json")) {
                            var nameParts = obj.name.split("/");
                            if(!nameParts[3].includes('.')){
                                AllLabs.push(nameParts[3])
                            }
                        }
                    })
                    if(AllLabs.length != (me.AllLabsId.length + copyClassInfo.deletedLabsList.length)){
                        let difference = AllLabs.filter(x => !me.AllLabsId.includes(x));
                        // console.log(me.AllLabsId)
                        // console.log(difference)
                        if(difference.length > 0){
                            copyClassInfo.deletedLabsList = difference
                            me.classInfo.deletedLabsList = difference
                        }
                    }
                }

                for(var i = 0; i < copyClassInfo.deletedLabsList.length; i++){
                    me.AllDeletedLabsList[copyClassInfo.deletedLabsList[i]] = await me.getLabInfo(copyClassInfo.deletedLabsList[i])
                    me.AllDeletedLabsList[copyClassInfo.deletedLabsList[i]].groupName = 'uncategorized'
                    me.AllDeletedLabsList[copyClassInfo.deletedLabsList[i]].active = true
                    
                    me.keyforDeletedLabsList++;
                }
                // console.log(me.AllDeletedLabsList)
                me.loadingForDeletedLabsList = false
            },
            setGroupInfo(labInfo){
                var me = this
                if(labInfo){
                    me.groupIndex = me.classInfo.groupedLabsList.findIndex(x => x.groupName == labInfo.groupName)
                } else {
                    me.groupIndex = 0
                }

                if(me.groupIndex != -1){
                    me.selectedGroupInfoOrigin = JSON.parse(JSON.stringify(me.classInfo.groupedLabsList[me.groupIndex]))
                    me.selectedGroupInfo = JSON.parse(JSON.stringify(me.classInfo.groupedLabsList[me.groupIndex]))
                    me.setSelectedGroupLabsList = JSON.parse(JSON.stringify(me.classInfo.groupedLabsList[me.groupIndex].labsList))
                    me.selectedGroupName = JSON.parse(JSON.stringify(me.classInfo.groupedLabsList[me.groupIndex].groupName))
                }
            },
            addGrouporLab(){
                var me = this
                if(me.editModeController == 'inputLabinfo'){
                    me.editModeController = 'openClassInfoCard'
                } else {
                    me.editModeController = 'inputLabinfo'
                    me.tab = 0
                    for(var i = 0; i < this.classInfo.groupedLabsList.length; i++){
                        me.groupNameList[i] = this.classInfo.groupedLabsList[i].groupName
                        if(this.classInfo.groupedLabsList[i].groupName == 'uncategorized'){
                            me.uncategorizedGroupLabsList = this.classInfo.groupedLabsList[i].labsList
                        }
                    }
                }
            },
            editGroup(groupInfo){
                var me = this
                var test = []
                for(var i = 0; i < groupInfo.labNameList.length; i++){
                    if(me.setLabIdList[groupInfo.labNameList[i]]){
                        test.push(me.setLabIdList[groupInfo.labNameList[i]])
                    }
                }
                groupInfo.labsList = test
                var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))
                var index = copyClassInfo.groupedLabsList.findIndex(x => x.groupName == me.selectedGroupName)
                var uncategorizedGroupIndex = copyClassInfo.groupedLabsList.findIndex(x => x.groupName == 'uncategorized')
                var index3 = 0
                // console.log(groupInfo)
                for(var i = 0; i < copyClassInfo.groupedLabsList[index].labsList.length; i++){
                    var index2 = 0
                    if(groupInfo.labsList.length == copyClassInfo.groupedLabsList[index].labsList.length){
                        groupInfo.labsList.some(data => {
                            if(index2 < copyClassInfo.groupedLabsList[index].labsList.length){
                                if(data != copyClassInfo.groupedLabsList[index].labsList[i]){
                                    index2++;
                                } else {
                                    return true;
                                }
                            } else {
                                if(!copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList.length > 0) {
                                    copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList = []
                                }
                                copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList.push(copyClassInfo.groupedLabsList[index].labsList[i])
                                // if(me.AllDeletedLabsList.length > 0){
                                //     me.AllDeletedLabsList.push(me.AlllabsList[copyClassInfo.groupedLabsList[index].groupName][copyClassInfo.groupedLabsList[index].labsList[i]])
                                // }
                            }
                        })
                    } else {
                        if(copyClassInfo.groupedLabsList[index].labsList[i] != groupInfo.labsList[i - index3]){
                            if(!copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList.length > 0) {
                                copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList = []
                            }
                            copyClassInfo.groupedLabsList[uncategorizedGroupIndex].labsList.push(copyClassInfo.groupedLabsList[index].labsList[i])

                            // if(me.AllDeletedLabsList.length > 0){
                            //     me.AllDeletedLabsList.push(me.AlllabsList[copyClassInfo.groupedLabsList[index].groupName][copyClassInfo.groupedLabsList[index].labsList[i]])
                            // }
                            index3++;
                        } 
                    }
                }
                copyClassInfo.groupedLabsList[index] = groupInfo
                me.copyClassInfoforGroupList.groupedLabsList[index] = groupInfo

                if(groupInfo.groupName != me.selectedGroupInfoOrigin.groupName){
                    me.AlllabsList[groupInfo.groupName] = me.AlllabsList[me.selectedGroupInfoOrigin.groupName]

                    copyClassInfo.groupedLabsList[index].labsList.forEach(labId => {
                        me.AlllabsList[groupInfo.groupName][labId].groupName = groupInfo.groupName
                        // console.log(me.AlllabsList[groupInfo.groupName])
                    })

                    me.AlllabsList[me.selectedGroupInfoOrigin.groupName] = null 
                    var groupNameListIndex = me.groupNameList.findIndex(x => x == me.selectedGroupInfoOrigin.groupName)
                    me.groupNameList[groupNameListIndex] = groupInfo.groupName

                }

                me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", copyClassInfo)
                me.classInfo = copyClassInfo
                me.copyClassInfoforGroupList = copyClassInfo

                me.selectedGroupInfo = JSON.parse(JSON.stringify(groupInfo))
                me.editModeController = 'openGroupCard'
                me.getGroupedLabsList()
            },
            selectGroup(groupInfo){
                var me = this
                if(me.isAdmin || me.isOwner || me.isTeacher){
                    me.editModeController = 'openGroupCard'
                    me.selectedGroupInfoOrigin = JSON.parse(JSON.stringify(groupInfo))
                    me.selectedGroupInfo = JSON.parse(JSON.stringify(groupInfo))
                    me.setSelectedGroupLabsList = JSON.parse(JSON.stringify(groupInfo.labsList))
                    me.selectedGroupName = JSON.parse(JSON.stringify(groupInfo.groupName))
                }
            },
            openClassInfo(){
                var me = this
                this.editModeController = 'openClassInfoCard'
                this.selectedGroupName = null
                me.selectedLabInfo = null
                if(me.labURL[me.labURLNumber]){
                    me.labURL.splice(me.labURLNumber, 1)
                    window.location.href = me.labURL.join('/')
                }
            },
            addLab(lab){
                this.keyforGroupNameList ++;
                this.tab = 1
                this.accessKey = true
                this.newLab.groupName = lab
                this.setLabId = lab
                if(this.isMobile){
                    this.drawer = false
                }
            },
            getGroupedLabsList(){
                var me = this
                var getLabInfoCnt = 0
                var mountedLabStatus = false

                me.labURL = window.location.href.split('/')
                if(me.labURL[me.labURLNumber]){
                    mountedLabStatus = true
                }

                if(me.editModeController == null){
                    me.editModeController = 'openClassInfoCard'
                }
                this.groupNameList = []
                me.uncategorizedGroupLabsList = null
                me.groupedLabsList = []

                for(var i = 0; i < this.classInfo.groupedLabsList.length; i++){
                    me.groupNameList[i] = this.classInfo.groupedLabsList[i].groupName
                    if(this.classInfo.groupedLabsList[i].groupName == 'uncategorized'){
                        me.uncategorizedGroupLabsList = this.classInfo.groupedLabsList[i].labsList
                    }
                }
                
                me.classInfo.groupedLabsList.forEach(async groupInfo => {
                    groupInfo.labsList.forEach(async labId => {
                        me.selectedLabInfo = null
                        me.isLoadingLabInfo = true
                        var labs = await me.getLabInfo(labId)
                        if (labs) {
                            var getCheckpointResults = null
                            var getAttendance = null
                            var userId = me.userInfo.email
                            if(mountedLabStatus && labs.labId == me.labURL[me.labURLNumber].replace("#", "")){
                                me.setSelectedLabPage(labs)
                            }
                            if (userId) {
                                getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                                if(!getCheckpointResults){
                                    getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                                }
                                getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                                if(!getAttendance){
                                    getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                                }

                            }
                            labs.attendance = getAttendance
                            labs.passMessage = null
                            if (typeof labs.price == 'string') labs.price = Number(labs.price)
                            if (labs.price && labs.price >= 0)
                                labs.paid = false


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
                        if(labs.active != false){
                            labs.active = true
                        } 
                        // }
                        var instructionMd = await this.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + labs.labId) + '/instruction')
                        if(instructionMd){
                            Object.keys(instructionMd).some(function (data) {
                                if (instructionMd[data].message) {
                                    labs.instructionMd = instructionMd[data].message
                                    return true
                                }
                            })
                        } else {
                            if(!labs.instructionMd){
                                labs.instructionMd = '## Instruction'
                            }
                        }
                        if(!me.AlllabsList[groupInfo.groupName]){
                            me.AlllabsList[groupInfo.groupName] = {}
                        }
                        me.AlllabsList[groupInfo.groupName][labs.labId] = labs
                        me.AllLabsId.push(labs.labId)
                        me.labs.push(labs)
                        

                        getLabInfoCnt++;
                        this.updateLabsList++;
                        if(getLabInfoCnt == me.classInfo.groupedLabsList.length){
                            me.isLoading = false
                        }
                        me.isLoadingLabInfo = false
                        me.updateCard ++;

                        if(!me.editModeController){
                            me.editModeController = 'openClassInfoCard'
                        }
                    })
                })
                if(me.isChanged){
                    me.isChanged = false
                }
                // console.log(me.AlllabsList)
            },
            loginToUseLab(){
                var me = this
                if(!me.isLogin) {
                    me.$EventBus.$emit('showLoginDialog');
                }else {
                    me.moveToSelectedLab();
                }
            },
            moveToSelectedLab(){
                var me = this
                me.$router.push({path: `/courses/${me.courseId}/${me.classId}/${me.selectedLabInfo.labId}`});
            },
            backtoList(lab){
                var me = this 
                me.isLoadingLabInfo = true
                me.editModeController = 'selectedLabInfo'
                var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))

                var index = copyClassInfo.deletedLabsList.findIndex(x => x == lab.labId)
                copyClassInfo.deletedLabsList.splice(index, 1)

                copyClassInfo.groupedLabsList.some(groupedLab => {
                    if(groupedLab.groupName == lab.groupName){
                        groupedLab.labsList.push(lab.labId)
                        return true;
                    }
                })
                // console.log(copyClassInfo)
                me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", copyClassInfo)
                me.classInfo = copyClassInfo
                me.copyClassInfoforGroupList = copyClassInfo
                
                me.setGroupInfo(lab)
                me.getSelectedLabInfo(lab, lab.labId)
            },
            async openDeletedLabCard(lab){
                var me = this
                me.loadingDeletedLabCard = true
                me.delabInfo = null
                if(!me.AllDeletedLabsList[lab]){
                    me.delabInfo = await me.getLabInfo(lab)
                    me.delabInfo.groupName = 'uncategorized'
                    
                    // me.delabInfo = lab
                    // me.delabInfo.groupName = 'uncategorized'
                    // var delabInfoOrigin = JSON.parse(JSON.stringify(me.delabInfo))
                    // me.delabList[me.delabInfo.labId] = delabInfoOrigin

                } else {
                    // me.delabInfo = JSON.parse(JSON.stringify(me.delabList[lab]))
                    me.delabInfo = JSON.parse(JSON.stringify(me.AllDeletedLabsList[lab]))
                }
                me.loadingDeletedLabCard = false
                // console.log(me.delabList)
            },
            async moveClasstoArchive(){
                var me = this
                try {
                    me.classInfo.archive = true
                    me.putObject('storage://labs-msaez.io/archive/' + me.classInfo.courseId +  "/classes/" +  me.classInfo.classId + '/Class_Metadata.json', me.classInfo)
                    me.putObject('storage://labs-msaez.io/archive/' + me.classInfo.courseId + '/Course_Metadata.json', me.courseInfo)

                    var deleteList = await me.list('storage://labs-msaez.io/running/' + me.classInfo.courseId +  "/classes/" +  me.classInfo.classId + "/", true)
                    deleteList.forEach(function (data) {
                        me.delete('storage://labs-msaez.io/' + data.name)
                        // console.log(data)
                    });
                    me.$router.push('/courses')
                } catch(e){
                    console.log(e.message)
                }
            },
            openClassInfoDialog() {
                this.classInfoDialog = true;
            },
            copytoClipBoard (key) {
                let copyValue
                if(key == 'classId') {
                    copyValue = document.querySelector('#copy-class-id')
                } else {
                    copyValue = document.querySelector('#copy-connection-key')
                }
                copyValue.setAttribute('type', 'text')
                copyValue.select()
                var successful = document.execCommand('copy');
                if(successful) {
                    if(copyValue._value) {
                        alert(`'${copyValue._value}' copy successfully`);
                    } else {
                        alert(`copy successfully`);
                    }
                } else {
                    alert('Unable to copy');
                }
            },
            track() {
                this.$gtag.pageview(
                    {
                        page_title: `${this.$route.params.classId} 라운지`,
                        page_path: this.$route.path
                    }
                )
            },
            onChangedMandatory(labInfo) {
                try {
                    if (labInfo.certificate) {
                        labInfo.certificate = false
                        labInfo.mandatory = {}
                        labInfo.mandatory.disable = true
                    } else {
                        labInfo.mandatory = {}
                        labInfo.mandatory.checkPoint = 1
                        labInfo.mandatory.attend = false
                        labInfo.certificate = true
                        if (labInfo.mandatory.disable) {
                            delete labInfo.mandatory.disable
                        }
                    }

                } catch (e) {
                    alert(e.message)
                }


            },
            submitEditLabInfo(editLabInfo) {
                var me = this
                try {
                    var editClassId = me.classId.replace('running@', '')
                    var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))
                    var copyCourseInfo = JSON.parse(JSON.stringify(me.courseInfo))
                    if (editLabInfo) {
                        if(editLabInfo.modelUrl && /^http[s]?\:\/\//i.test(editLabInfo.modelUrl)){
                            let array = editLabInfo.modelUrl.split('/');
                            editLabInfo.modelUrl = array[array.length-1];
                        }
                        if(!editLabInfo.groupName){
                            editLabInfo.groupName = "uncategorized"
                        }
                        if(!me.AlllabsList[editLabInfo.groupName]){
                            me.AlllabsList[editLabInfo.groupName] = {}
                        }
                        me.AlllabsList[editLabInfo.groupName][editLabInfo.labId] = editLabInfo
                        // me.groupedLabsList[editLabInfo.labId] = editLabInfo
                        me.selectedLabInfo = editLabInfo
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${editLabInfo.labId}/Lab_Metadata.json`, editLabInfo)
                        // console.log(editLabInfo)

                        if(editLabInfo.groupName != this.editLabInfoOrigin.groupName){
                            var cnt = 0
                            copyClassInfo.groupedLabsList.some(labInfo => {
                                if(cnt < 2){
                                    if(labInfo.groupName == editLabInfo.groupName){
                                        // console.log('before:' ,labInfo.labsList)
                                        // if(!labInfo.labsList.length > 0) {
                                        //     labInfo.labsList.push(labInfo.groupName)
                                        // }
                                        labInfo.labsList.push(editLabInfo.labId)
                                        // console.log('after: ', labInfo.labsList)
                                        cnt ++;
                                    } else if(labInfo.groupName == this.editLabInfoOrigin.groupName){
                                        var index = labInfo.labsList.findIndex(x => x == editLabInfo.labId)
                                        // console.log('before:', labInfo.labsList)
                                        labInfo.labsList.splice(index, 1)
                                        // console.log('after: ', labInfo.labsList)
                                        cnt ++;
                                    }
                                } else if(cnt == 2) {
                                    return true;
                                }
                            })
                        }

                        //newCertification
                        var newCertification = []
                        var newCourseCertification = []
                        for(var i = 0; i < me.labs.length; i++){
                            if(me.labs[i].labId == editLabInfo.labId){
                                me.labs[i] = editLabInfo
                            }
                            var obj = me.labs[i].mandatory
                            if (obj) {
                                if (me.editCourseMandatory) {
                                    if (!me.labs[i].mandatory.disable) {
                                        newCourseCertification.push(obj)
                                    }
                                }

                                obj.labId = me.labs[i].labId
                                newCertification.push(obj)
                            }
                        }
                        copyClassInfo.certification = newCertification
                        // console.log('class', newCertification, 'course', newCourseCertification)

                        if (me.editCourseMandatory) {
                            copyCourseInfo.certification = newCourseCertification
                            me.putObject(`storage://labs-msaez.io/running/${me.courseId}/Course_Metadata.json`, copyCourseInfo)
                        }
                        me.putObject(`storage://labs-msaez.io/${me.rootPath + me.courseId}/classes/${editClassId}/Class_Metadata.json`, copyClassInfo)
                        me.setString(`db://pricing/${me.courseId}@${editClassId}@${editLabInfo.labId}`, Number(editLabInfo.price) * 100)
                    }
                    
                    me.classInfo = copyClassInfo
                    me.copyClassInfoforGroupList = copyClassInfo
                    me.setGroupInfo(editLabInfo)
                    // me.setEditLab = null
                    // me.editMode = false
                    me.editModeController = 'selectedLabInfo'
                } catch (e) {
                    alert(e.message)
                }
            },
            async deleteLab(lab){
                var me = this 
                var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))
                copyClassInfo.groupedLabsList.some(labInfo => {
                    if(lab.groupName){
                        if(labInfo.groupName == lab.groupName) {
                            var index = labInfo.labsList.findIndex(x => x == lab.labId)
                            labInfo.labsList.splice(index, 1)
                            if(!copyClassInfo.deletedLabsList){
                                copyClassInfo.deletedLabsList = []
                            }
                            copyClassInfo.deletedLabsList.push(lab.labId)
                            if(me.AllDeletedLabsList.length > 0){
                                me.AllDeletedLabsList[lab.labId] = lab
                            }
                            return true;
                        }
                    } else {
                        var index = copyClassInfo.groupedLabsList.findIndex(x => x.groupName == lab.labId)
                        // console.log(copyClassInfo.groupedLabsList, index)
                        copyClassInfo.groupedLabsList.splice(index, 1)
                        copyClassInfo.deletedLabsList.push(lab.labId)
                        if(me.AllDeletedLabsList.length > 0){
                            me.AllDeletedLabsList[lab.labId] = lab
                        }
                        return true;
                    }
                })
                // console.log(copyClassInfo)
                me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", copyClassInfo)
                me.classInfo = copyClassInfo
                me.copyClassInfoforGroupList = copyClassInfo
                me.setGroupInfo(lab)
                // me.selectedLabInfo = null
                // me.selectedLab = false
                me.openDeleteDialog = false
                me.deleteCheck = false
                me.editModeController = 'openClassInfoCard'
                // me.openClassInfoCard = true

                // await me.load();
            },
            openGitpodIde() {
                var me = this
                me.gitPodLink = "https://gitpod.io/#https://github.com/msa-school/lab-shop-compensation"
                // window.location.href = me.gitPodLink
                window.open(me.gitPodLink, "_blank");
            },
            openDeleteLabDialog() {
                var me = this 
                me.openDeleteDialog = true
                me.deleteCheck = false
            },
            openEditLabInfo(lab) {
                var me = this
                try {
                    me.editLabInfoOrigin = JSON.parse(JSON.stringify(lab))
                    me.setEditLab = lab.labId
                    me.editModeController = 'editMode'
                    // me.editMode = true
                    if(lab.groupName != me.setCurrnetGroupName){
                        lab.groupName = me.setCurrnetGroupName
                    }
                    if(!lab.groupName){
                        lab.groupName = "uncategorized"
                    }
                    me.editLabInfo = JSON.parse(JSON.stringify(lab))
                } catch (e) {
                    alert(e.message)
                }

            },

            submit() {
                try {
                    this.$refs.observer.validate()
                } catch (e) {
                    alert(e.message)
                }

            },
            editIntroduction(newIntroduction) {
                var me = this
                try {
                    var editClassId = me.classId.replace('running@', '')
                    
                    me.putString('storage://labs-msaez.io/running/' + me.courseId + "/classes/" + editClassId + "/introduction.md", newIntroduction)
                    this.editClassIntroduction = false
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = '수정에 실패하였습니다. : ' + e.message
                    me.snackBar.Color = "red"
                }
            },
            async addNewGroup(newGroup){
                var me = this
                var overlap = false
                try {

                    for(var i = 0; i < me.groupNameList.length; i++){
                        if(newGroup.groupName == me.groupNameList[i]){
                            overlap = true
                            break;
                        }
                    }
                    if(!overlap){
                        var copyClassInfo = JSON.parse(JSON.stringify(this.classInfo))
                        copyClassInfo.groupedLabsList.push(newGroup)
                        if(newGroup.labsList.length > 0){
                            copyClassInfo.groupedLabsList.forEach(data => {
                                if(data.groupName == 'uncategorized'){
                                    var testlist = JSON.parse(JSON.stringify(data.labsList))
                                    data.labsList.forEach(lab => {
                                        for(var i = 0; i < newGroup.labsList.length; i++){
                                            if(lab == newGroup.labsList[i]){
                                                if(!me.AlllabsList[newGroup.groupName]){
                                                    me.AlllabsList[newGroup.groupName] = {}
                                                }
                                                me.AlllabsList[newGroup.groupName][lab] = me.AlllabsList['uncategorized'][lab]
                                                me.AlllabsList['uncategorized'][lab] = null
                                                var index = testlist.findIndex(x => x == lab)
                                                testlist.splice(index, 1)
                                                break;
                                            }
                                        }
                                    })
                                    data.labsList = testlist
                                }
                            })
                        }
                        // console.log(copyClassInfo)
                        this.putObject("storage://labs-msaez.io/" + this.rootPath + this.courseId + "/classes/" + this.classId + "/Class_Metadata.json", copyClassInfo)
                        this.classInfo = copyClassInfo
                        me.copyClassInfoforGroupList = copyClassInfo
                        this.selectedLab = false 
                        this.groupNameList.push(newGroup.groupName)
                        if(!newGroup.labsList.length > 0){
                            this.addLab(newGroup.groupName)
                        } else {
                            me.editModeController = 'openClassInfoCard'
                        }
                        me.groupIndex = this.classInfo.groupedLabsList.findIndex(x => x.groupName == newGroup.groupName)
                        me.newGroup = {
                            groupName: '',
                            goal: '',
                            labsList: [],
                        }
                    } else {
                        me.snackBar.show = true
                        me.snackBar.Text = '중복된 그룹명입니다.'
                        me.snackBar.Color = "red"
                        me.newGroup.groupName = ''
                    }
                } catch(e){
                    console.log(e.message)
                }
                // await this.getGroupedLabsList()
            },
            async addNewLab(newLab) {
                var me = this
                var checkPointText
                var checkPointJavascript
                var quizList = []
                var overlap = false

                for(var i = 0; i < me.classInfo.groupedLabsList.length; i ++){
                    me.classInfo.groupedLabsList[i].labsList.some(data => {
                        if(newLab.LabId == data){
                            overlap = true
                            return true
                        }
                    })
                }
                try {
                    if(!overlap){
                        if(newLab.Labtool == 'quiz'){
                            var quizText = "<!--정답을 선택하려면 <check /> right 옵션을 추가하세요-->\n<div>\n질문\n</div> \n<check right id='1' text='답변'></check>\n<check id='2' text='답변2'></check>"
                            checkPointText = "Quiz 1"
                            checkPointJavascript = "result.quiz.quiz01.score == 1"
                                
                            me.putObject('storage://labs-msaez.io/running/' + me.courseId + "/labs" + '/' + newLab.LabId + "/quiz/quiz01.html", quizText)
                            quizList[0] = quizText
                            var setClassId = me.classId.replace('running@', '')
                            me.putObject('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + newLab.LabId + '/quizList', quizList)
                            me.openAddQuizInfo = false                        
                        } else {
                            checkPointText = "모든 요구사항을 만족하는가"
                            checkPointJavascript = null
                        }
                        var newPrice = Number(newLab.LabPrice)
                        var labinfo = {
                            "labId": newLab.LabId,
                            "labName": newLab.LabName,
                            "tool": newLab.Labtool,
                            "groupName": newLab.groupName,
                            "labTime": 10,
                            "price": newPrice,
                            "labScenario": newLab.LabScenario,
                            "checkPoints": [
                                {
                                    "text": checkPointText,
                                    "javascript": checkPointJavascript,
                                }
                            ],
                            "hints": [{
                                "text": "hint"
                            }]
                        }
                        // me.groupedLabsList.push(labinfo)

                        if(labinfo.tool == 'ide'){
                            labinfo.addWorkSpace = newLab.addWorkSpace
                        }
                        if(labinfo.tool == 'event-storming'){
                            if(newLab.modelUrl && /^http[s]?\:\/\//i.test(newLab.modelUrl)){
                                let array = newLab.modelUrl.split('/');
                                newLab.modelUrl = array[array.length-1];
                            }
                            labinfo.modelUrl = newLab.modelUrl
                        }
                        var Labinstruction = '## Instruction'
                        if (newLab.LabId && newLab.Labtool && newLab.LabName) {
                            me.putObject('storage://labs-msaez.io/running/' + me.courseId + "/labs/" + newLab.LabId + "/Lab_Metadata.json", labinfo)
                            me.putObject('storage://labs-msaez.io/running/' + me.courseId + "/labs/" + newLab.LabId + "/instruction.md", Labinstruction)
                            var copyClassInfo = JSON.parse(JSON.stringify(me.classInfo))
    
                            // copyClassInfo.labsList.push(newLab.LabId)
                            copyClassInfo.groupedLabsList.some(groupedLab => {
                                if(groupedLab.groupName == newLab.groupName){
                                    groupedLab.labsList.push(newLab.LabId)
                                    if(newLab.groupName == 'uncategorized'){
                                        me.uncategorizedGroupLabsList.push(newLab.LabId)
                                    }
                                    return true;
                                }
                            })
    
                            var editClassId = copyClassInfo.classId.replace('running@', '')
                            await me.putObject('storage://labs-msaez.io/' + me.rootPath + copyClassInfo.courseId + "/classes/" + editClassId + "/Class_Metadata.json", copyClassInfo)
                            me.classInfo = copyClassInfo
                            me.copyClassInfoforGroupList = copyClassInfo
                            
                            newLab.LabId = ''
                            newLab.LabName = ''
                            newLab.LabScenario = ''
                            newLab.Labtool = null
                            newLab.LabPrice = 0
                            newLab.addWorkSpace = false,
                            newLab.modelUrl = '',
                            
                            me.editModeController = 'selectedLabInfo'


                            me.setGroupInfo(labinfo)

                            me.getSelectedLabInfo(labinfo, labinfo.labId)

                        }
                    } else {
                        me.snackBar.show = true
                        me.snackBar.Text = '중복된 아이디입니다.'
                        me.snackBar.Color = "red"
                        newLab.LabId = ''
                    }
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = '생성에 실패하였습니다 : ' + e.message
                    me.snackBar.Color = "red"
                }

            },
            topBody() {
                $('body,html').animate({
                    scrollTop: 0
                }, 300);
            },
            paidClass(paidInfo) {
                this.isPaidClass = paidInfo.paid
            },
            paidLab(paidInfo) {
                var me = this
                var getLabId = paidInfo.id.split('@').reverse()[0]
                var getLab = null
                if (getLabId) {
                    getLab = me.labs.find(function (lab, index) {
                        if (lab && lab.labId == getLabId) {
                            me.labs[index].paid = paidInfo.paid
                        }
                        me.labs.__ob__.dep.notify();

                    })

                }
            },
            scrollToElement() {
                if (this.$el.getElementsByClassName) {
                    const el = this.$el.getElementsByClassName('scroll-to-me')[0];

                    if (el) {
                        // Use el.scrollIntoView() to instantly scroll to the element
                        el.scrollIntoView({behavior: 'smooth'});
                    }
                }
            },
            async getSelectedLabInfo(labInfo, labId){
                var me = this

                if(me.labURL[me.labURLNumber]){
                    me.labURL[me.labURLNumber] = '#' + labId
                    window.location.href = me.labURL.join('/')
                } else {
                    var lastString = window.location.href[window.location.href.length - 1];
                    if(lastString == '/'){
                        window.location.href = window.location.href + '#' + labId   
                    } else {
                        window.location.href = window.location.href + '/#' + labId   
                    }
                    me.labURL = window.location.href.split('/')
                }

                me.setCurrnetGroupName = labInfo.groupName
                me.selectedLabInfo = null
                me.editModeController = 'selectedLabInfo'
                me.isLoadingLabInfo = true
                if(!me.AlllabsList[labInfo.groupName]){
                    me.AlllabsList[labInfo.groupName] = {}
                }
                if(!me.AlllabsList[labInfo.groupName][labId]){
                    var labs = await me.getLabInfo(labId)
                    if (labs) {
                        var getCheckpointResults = null
                        var getAttendance = null
                        var userId = me.userInfo.email
                        if (userId) {
                            getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                            if(!getCheckpointResults){
                                getCheckpointResults = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`))
                            }
                            getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                            if(!getAttendance){
                                getAttendance = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`labs/${labs.labId}/userInfo/${userId.replace(/\./gi, '_')}/attendance`))
                            }

                        }
                        labs.attendance = getAttendance
                        labs.passMessage = null
                        if (typeof labs.price == 'string') labs.price = Number(labs.price)
                        if (labs.price && labs.price >= 0)
                            labs.paid = false


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
                    if(labInfo){
                        labs.groupName = labInfo.groupName
                    }
                    if(labs.active != false) {
                        labs.active = true
                    }
                    // me.groupedLabsList[labId] = labs
                    me.AlllabsList[labInfo.groupName][labId] = labs
                    me.selectedLabInfo = labs  

                    var instructionMd = await this.getObject('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath('labs/' + me.labId) + '/instruction')
                    if(instructionMd){
                        // me.selectedLabInfo.instructionMd = instructionMd
                        // console.log(instructionMd)
                    } else {
                        if(!me.selectedLabInfo.instructionMd){
                            me.selectedLabInfo.instructionMd = '## Instruction'
                        }
                    }
                } else {
                    me.selectedLabInfo = me.AlllabsList[labInfo.groupName][labId]
                }

                if(me.selectedLabInfo.video){
                    me.openLabVideoDialog()
                }

                me.isLoadingLabInfo = false
                me.updateCard ++;
            },
            async load() {
                var me = this
                try {
                    me.indeterminate = true

                    // var AlllabsList = []
                    var userId = me.userInfo.email
                    var labsByLabId = {}
                    var labIndexByLabId = {}
                    var deletedLabIndexByLabId = {}

                    var userEmail = localStorage.getItem('email')
                    this.courseInfo = await this.getCourseInfo();
                    if (this.courseInfo && this.courseInfo.ownerId) {
                        if(this.courseInfo.ownerId == userEmail){
                            this.isOwner = true
                        }
                    } 
                    if (userEmail == 'jyjang@uengine.org' || userEmail == 'help@uengine.org'){
                        this.isOwner = true
                    }
                    

                    this.classInfo = await this.getClassInfo();
                    // console.log(this.classInfo)

                    if(this.classInfo && this.classInfo!=null){
                        me.copyClassInfoforGroupList = JSON.parse(JSON.stringify(me.classInfo))
                        if(me.classInfo.archive){
                            me.rootPath = 'archive/'
                        } else {
                            me.rootPath = 'running/'
                        }
    
                        try {
                            var path = me.getClassPath('introduction.md');
                            this.classIntroduction = await this.getString(`storage://labs-msaez.io/running/${path}`);
                        } catch (e) {
                            console.log(e)
                        }
                    } else {
                        alert('존재하지 않는 강의입니다.')
                        this.$router.push('/courses')
                        return false
                    }

                    this.groupNameList = []
                    me.groupedLabsList = []
                    me.testlist = []

                    if(this.classInfo && this.classInfo.groupedLabsList) {
                        me.getGroupedLabsList();
                    } else {
                        var group = {
                            groupName: "uncategorized",
                            labsList: []
                        }
                        for (var i = 0; i < this.classInfo.labsList.length; i++) {
                            group.labsList.push(this.classInfo.labsList[i])
                        }
                        this.classInfo.groupedLabsList = []
                        this.classInfo.groupedLabsList.push(group)

                        me.putObject("storage://labs-msaez.io/" + me.rootPath + me.courseId + "/classes/" + me.classId + "/Class_Metadata.json", this.classInfo)
                        me.getGroupedLabsList()
                    }

                    me.setGroupInfo()
                } catch (e) {
                    alert(e)
                    console.log(e)
                }
            },
        }
    };
</script>

<style scoped>
@media only screen and (max-width:970px) {
    .ismobile-mdi-pencil {
        position:absolute;
        right:10px;
        top:13px;
    }
}
</style>













