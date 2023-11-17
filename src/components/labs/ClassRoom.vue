<template>
    <v-container fluid>
        <div v-if="labInfo">
            <v-col>
                <div
                    :width="selectedUser ? '49.8%' :'100%'"
                    :style="selectedUser ? 'margin-left -0.8%' : 'margin:10px 0 10px -0.8%'">
                    
                    <b :style="!openWideScreen ? 'display:none':''" style = "font-size:24px; margin-left:5px; position:absolute; top:5px;">Lab: {{labInfo.labName}}</b>
                    <v-dialog
                            v-model="clearDialog"
                            width="400"
                            height="400"
                    >
                        <v-card>
                            <v-card-title
                                    class="headline red lighten-2"
                                    primary-title
                            >
                                랩실 초기화
                            </v-card-title>
                            <v-card-text v-if="deleting">
                                <v-progress-circular
                                        indeterminate
                                        color="red"
                                ></v-progress-circular>
                                삭제중 입니다.
                            </v-card-text>
                            <v-card-text v-else>
                                <v-checkbox
                                        v-model="maintainConfig"
                                        :label="`Config 유지 시 체크`"
                                ></v-checkbox>
                                <v-checkbox
                                        v-model="maintainFiles"
                                        :label="`파일 유지 시 체크`"
                                ></v-checkbox>
                                삭제 시, 옵션을 확인해주세요.
                            </v-card-text>


                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="primary"
                                        text
                                        @click="clearLab(selectedUser)"
                                >
                                    삭제
                                </v-btn>
                                <v-btn
                                        color="primary"
                                        text
                                        @click="clearDialog = false"
                                >
                                    취소
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                     <!-- + '/' + myId" -->
                    <!-- <v-btn
                        color="primary" text large
                        :to="'/courses/' + courseId + '/' + classId + '/' + labId"
                        :style="!openWideScreen ? 'display:none':''"
                    >
                        <v-icon style = "margin:2px 5px 0 -10px;">mdi-television-guide</v-icon>랩실
                    </v-btn> -->

                    <v-btn
                        color="primary" text
                        @click="missionDialog=true"
                        :style="!openWideScreen ? 'display:none':'margin-left:-15px;'"
                    >
                        <v-icon style = "margin:2px 5px 0 0;">mdi-flag</v-icon>미션
                    </v-btn>

                    <v-dialog
                            v-model="missionDialog"
                            width="1000"
                            height="800"
                    >
                        <v-card>
                            <v-card-title
                                    class="headline green lighten-2"
                                    primary-title
                            >
                                미션
                            </v-card-title>

                            <v-card-text>
                                <vue-markdown
                                        class="markdown-body"
                                        :source="labInfo.instructionHtml"
                                >
                                </vue-markdown>
                            </v-card-text>


                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="primary"
                                        text
                                        @click="missionDialog = false"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-btn
                        color="primary" text large
                        @click="theoryDialog=true"
                        :style="!openWideScreen ? 'display:none':'margin-left:-15px;'"
                    >
                        <v-icon  style = "margin:2px 5px 0 0;">mdi-file-chart</v-icon>이론/자료
                    </v-btn>

                    <v-dialog
                            v-model="theoryDialog"
                            :width="theoryExtended ? 1240:1000"
                            height="800"
                    >
                        <blur-purchase-item
                                :item-id="`${courseId}@${classId}@${labId}`"
                                :itemAmount="labInfo.price"
                                :itemPeriod="labInfo.period"
                                :itemOpenRange="100"
                                :itemResourceType="'lab'"
                                :lab-info="labInfo"
                                :class-info="classInfo"
                        >       
                        </blur-purchase-item>
                        <v-card>
                            <v-card-title
                                    class="headline grey lighten-2"
                                    primary-title
                            >
                                이론/자료
                                <v-col cols="12" sm="3">
                                    <v-btn icon :color="theoryExtended ? 'indigo':'blue'"
                                           @click="theoryExtended=!theoryExtended">
                                        <v-icon>mdi-file-chart</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-card-title>

                            <v-card-text>
                                <v-row>
                                    <v-col width=500>
                                        <div class="py-3" v-html="labInfo.theoryHtml"></div>
                                    </v-col>
                                    <v-col v-if="theoryExtended">
                                        <v-row v-if="isAdmin">
                                            <v-col>
                                                <v-text-field type="number" v-model="prize" label="상금 코인"/>
                                            </v-col>
                                            <v-col right>
                                                <v-btn v-if="$refs.question" @click="$refs.question.clearMessages"
                                                       color="teal" icon>
                                                    <v-icon alt="설문결과삭제">delete</v-icon>
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                        <poll-result 
                                            v-model="userMessages"
                                            @answered="onQuizAnswered"></poll-result>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                            <v-divider></v-divider>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="primary"
                                        text
                                        @click="theoryDialog = false"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-btn text v-for="(link, key) in links" :key="key"><a :href="link" target="_blank">{{key}}</a></v-btn>

                    <v-btn
                        color="primary" text large
                        @click="pollDialog=true"
                        v-if="isAdmin"
                        :style="!openWideScreen ? 'display:none':''"
                    >
                        <v-icon style = "margin:2px 5px 0 0;">mdi-poll</v-icon>설문
                    </v-btn>

                    <v-dialog
                            v-model="pollDialog"
                            width="1000"
                            height="800"
                            v-if="isAdmin"
                    >
                        <v-card>
                            <v-card-title
                                    class="headline grey lighten-2"
                                    primary-title
                            >
                                설문

                            </v-card-title>

                            <v-card-text>
                                <v-row>
                                    <v-col>
                                        <v-text-field type="number" v-model="prize" label="상금 코인"/>
                                    </v-col>
                                    <v-col right>
                                        <v-btn v-if="$refs.question" @click="$refs.question.clearMessages" tile
                                               large
                                               color="teal" icon>
                                            <v-icon alt="설문결과삭제">delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>

                                <poll-result v-model="userMessages" @answered="onQuizAnswered"></poll-result>
                            </v-card-text>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                        color="primary"
                                        text
                                        @click="pollDialog = false"
                                >
                                    Close
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <!-- <v-btn class="btn-answer"
                        color="primary" text large
                        @click="answerDialog=true"
                        :style="!openWideScreen ? 'display:none':''"
                    >
                        <v-icon style = "margin:2px 5px 0 0;">mdi-comment-check-outline</v-icon>응답
                    </v-btn> -->

                    <v-dialog
                            v-model="answerDialog"
                            width="500"
                            height="300"
                    >
                            <blur-purchase-item
                                    :item-id="`${courseId}@${classId}@${labId}`"
                                    :itemAmount="labInfo.price"
                                    :itemPeriod="labInfo.period"
                                    :itemOpenRange="100"
                                    :itemResourceType="'lab'"
                                    :lab-info="labInfo"
                                    :class-info="classInfo"
                            >
                            </blur-purchase-item>

                        <v-card>
                            <v-card-title
                                    class="headline grey lighten-2"
                                    primary-title
                            >
                                응답
                            </v-card-title>
                            <v-card-text>
                                <answer :lab-info="labInfo" :class-info="classInfo"></answer>
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

                    <!-- <v-btn class = "btn-lab-list"
                        color="primary" text large
                        :to="'/courses/' + courseId + '/' + classId"
                        :style="!openWideScreen ? 'display:none':''"
                    >
                        <v-icon style = "margin:2px 5px 0 0;">mdi-view-headline</v-icon>랩 목록
                    </v-btn> -->



                    <div  :style="selectedUser ? 'display:none' : ''"
                        style="display:contents"
                    >
                    
                        <v-btn class = "btn-group"
                            v-if="isAdmin"
                            color="primary" text large
                            @click="addGroup()"
                            :style="!openWideScreen ? 'display:none':''"
                        >
                            <v-icon style = "margin:2px 5px 0 0;">mdi-account-multiple-plus</v-icon>그룹 추가
                        </v-btn>

                        <v-btn
                            class = "btn-batch-execution"
                            v-if="isAdmin && labInfo.tool =='ide'"
                            color="primary" text large
                            @click="initLabIdeAll()"
                            :style="!openWideScreen ? 'display:none':''"
                        >
                            <v-icon style = "margin:2px 5px 0 0;">mdi-play-circle</v-icon>일괄 실행
                        </v-btn>

                        <!-- <v-btn class = "btn-screen-view"
                            v-if="isAdmin"
                            color="primary" text large
                            @click="viewModeChange()"
                            :style="!openWideScreen ? 'margin-left:-15px;':''"
                        >
                            <span v-if="viewMode == 'screen'"><v-icon style = "margin:2px 5px 0 0;">mdi-file-presentation-box</v-icon>제출 화면 보기</span>
                            <span v-if="viewMode == 'avatar'"><v-icon style = "margin:2px 5px 0 0;">mdi-file-presentation-box</v-icon>현재 화면 보기</span>
                        </v-btn> -->

                        <coin-drop style="z-index: 999;" ref="coinDrop" @drop="deposit" @allDrop="coinAllDropped"
                                v-model="scoreToBeDeposited">
                            <div slot="default"></div>
                        </coin-drop>
                    </div>

                    <template>
                        <div class = "class-btn-menu">
                            <v-menu
                                offset-y
                                open-on-hover
                                left
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                    class = "class-list-btn"
                                    color="primary" 
                                    icon
                                    large
                                    v-bind="attrs"
                                    v-on="on"
                                    :style="!openWideScreen ? 'display:none':''"
                                    style = "position:absolute;
                                        right:10px;
                                        top:37px;"
                                    >
                                        <v-icon style = "margin:2px 5px 0 0;">mdi-dots-horizontal</v-icon>
                                    </v-btn>
                                </template>

                                <v-list width="140px">
                                    <v-list-item class = "class-btn-answer" @click="answerDialog=true">
                                        <v-list-item-title>응답</v-list-item-title>
                                    </v-list-item>

                                    <v-list-item class = "class-btn-lab-list"
                                        :to="'/courses/' + courseId + '/' + classId"
                                    >
                                        <v-list-item-title>랩 목록</v-list-item-title>
                                    </v-list-item>
                                    
                                    <v-list-item class = "class-btn-group"
                                        v-if="isAdmin" @click="addGroup()"
                                    >
                                        <v-list-item-title>그룹 추가</v-list-item-title>
                                    </v-list-item>

                                    <v-list-item class = "class-btn-batch-execution"
                                        v-if="isAdmin && labInfo.tool =='ide'" @click="initLabIdeAll()"
                                    >
                                        <v-list-item-title>일괄 실행</v-list-item-title>
                                    </v-list-item>

                                    <!-- <v-list-item class = "class-btn-screen-view"
                                        v-if="isAdmin"  @click="viewModeChange()"
                                    >
                                        <v-list-item-title v-if="viewMode == 'screen'">제출 화면 보기</v-list-item-title>
                                        <v-list-item-title v-if="viewMode == 'avatar'">현재 화면 보기</v-list-item-title>
                                    </v-list-item> -->
                                </v-list>
                            </v-menu>
                        </div>


                        <div :style="selectedUser ? 'display:block' : 'display:none'" style="position:absolute; left:50%; top:0;">
                            <v-menu
                                offset-y
                                open-on-hover
                                left
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                    class = "class-list-btn"
                                    color="primary" 
                                    icon
                                    large
                                    v-bind="attrs"
                                    v-on="on"
                                    :style="!openWideScreen ? 'display:none':''"
                                    style = "position:absolute;
                                        right:10px;
                                        top:37px;"
                                    >
                                        <v-icon style = "margin:2px 5px 0 0;">mdi-dots-horizontal</v-icon>
                                    </v-btn>
                                </template>

                                <v-list width="140px">
                                    <v-list-item
                                        v-if="isAdmin" @click="addGroup()"
                                    >
                                        <v-list-item-title>그룹 추가</v-list-item-title>
                                    </v-list-item>

                                    <v-list-item
                                        v-if="isAdmin && labInfo.tool =='ide'" @click="initLabIdeAll()"
                                    >
                                        <v-list-item-title>일괄 실행</v-list-item-title>
                                    </v-list-item>

                                    <!-- <v-list-item
                                        v-if="isAdmin"  @click="viewModeChange()"
                                    >
                                        <v-list-item-title v-if="viewMode == 'screen'">제출 화면 보기</v-list-item-title>
                                        <v-list-item-title v-if="viewMode == 'avatar'">현재 화면 보기</v-list-item-title>
                                    </v-list-item> -->
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                </div>


                <v-dialog
                        v-model="changedUserDialog"
                        persistent
                        v-if="changedUser"
                        max-width="450"
                >
                    <v-card>
                        <v-card-title class="headline">유저 수정 및 삭제</v-card-title>
                        <v-card-text>
                            <v-icon v-if="Object.values(changedUser)[0].photoURL == undefined"
                                    x-large>
                                mdi-account-circle
                            </v-icon>
                            <v-avatar v-else class="ma-0">
                                <img :src=Object.values(changedUser)[0].photoURL>
                            </v-avatar>
                            <v-text-field
                                    label="Email"
                                    v-model="Object.values(changedUser)[0].email"
                                    disabled
                            ></v-text-field>

                            <v-text-field
                                    label="Name"
                                    v-model="Object.values(changedUser)[0].userName"
                            ></v-text-field>
                            <v-select
                                    :disabled="!isAdmin"
                                    :items="groupList"
                                    label="Group"
                                    v-model="Object.values(changedUser)[0].group"
                            >
                            </v-select>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn v-if="isAdmin" text color="red" @click="changedUserAction('delete')">삭제</v-btn>
                            <v-btn text @click.native="closeChangedUserDialog()"> {{$t('word.close')}}</v-btn>
                            <v-btn text @click="changedUserAction('modify')" bottom color="primary">수정</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
            <v-row style="margin-top:-35px;">
                <v-subheader>Class Room Status</v-subheader>
                <div class="ma-5" style="margin-right:20px; margin-top:0px; margin-bottom:0px">
                    <Countdown v-if="deadline && labStatus && labStatus.status=='started'"
                               :deadline="deadline"></Countdown>
                </div>
                <br>
                <div style="margin-left: -50px;">
                    <v-tooltip bottom
                        v-if="isAdmin && (labStatus.status=='READY' || labStatus.status=='completed')"
                    >
                        <template v-slot:activator="{ on, attrs }"
                        >
                            <v-btn
                                color="green" text large
                                @click="[startLab('start'), scoreStart()]"
                                style="padding:5px;"
                                v-on="on"
                                v-bind="attrs"
                            >
                                <v-icon style = "margin:2px 5px 0 0;">mdi-play</v-icon>시작
                            </v-btn>
                        </template>
                        <span>랩 스코어 시작</span>
                    </v-tooltip>

                    <v-tooltip bottom
                        v-if="isAdmin && labStatus.status=='started'"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn class = "btn-end"
                                color="red" text large
                                @click="[completeLab(), scoreTimeStop()]"
                                style="padding:5px;"
                                v-on="on"
                                v-bind="attrs"
                            >
                                <v-icon style = "margin:2px 5px 0 0;">mdi-checkbox-blank</v-icon>종료
                            </v-btn>
                        </template>
                        <span>랩 스코어 종료</span>
                    </v-tooltip>
                    
                    <span v-if="isAdmin" style="position:relative; top:2px; margin-left:5px;">{{ scoreTime.time }}</span>
                </div>
            </v-row>

            <v-row>
                <v-text-field
                        v-model="search"
                        style="margin:0 0 -25px 10px;  max-width: 300px;"
                        placeholder="Search User"
                        filled
                        rounded
                        dense
                ></v-text-field>
            </v-row>

            <v-row>
                <v-col v-for="(group, key, groupIdx) in getGroupUsers"
                       v-if="group && !group.userName"
                       :key="key"
                       class="sortable"
                >
                    <v-card :width="Object.keys(classInfo.groupedUsers).length==1 ? selectedUser ? '49%' :'100%':'350px'"
                            :style="openWideScreen ? 'height:800px; overflow:auto':'height:100%'"
                    >
                        <v-card-title
                                v-if="editGroupIdx == groupIdx"
                        >
                            <v-text-field
                                    v-model="editGroupName"
                                    label="Group Name"
                                    v-on:keyup.enter="submitGroupName(groupIdx,key)"
                            ></v-text-field>
                        </v-card-title>

                        <v-card-title v-else
                                      @dblclick="editMode(groupIdx,key)"
                        >
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <div v-if="getMemberCount.basicPassUserCount == 0" v-on="on">
                                        {{key}}
                                        ({{getMemberCount.allPassUserCount}}/{{labResultCount}}/{{getMemberCount.attendanceUserCount}}/{{getMemberCount.connectionUserCount}}/{{getMemberCount.usersCount}})
                                    </div>
                                    <div v-else v-on="on">
                                        {{key}}
                                        ({{getMemberCount.allPassUserCount}}/{{getMemberCount.basicPassUserCount}}/{{labResultCount}}/{{getMemberCount.attendanceUserCount}}/{{getMemberCount.connectionUserCount}}/{{getMemberCount.usersCount}})
                                    </div>
                                </template>
                                <span v-if="getMemberCount.basicPassUserCount == 0"> 수료한사람수/제출한사람수/출석한사람수/접속한사람수/전체사람수 </span>
                                <span v-else> 모두성공한사람수/수료한사람수/제출한사람수/출석한사람수/접속한사람수/전체사람수 </span>
                            </v-tooltip>
                            <span v-if="viewMode == 'screen'" style="margin-left:5px;">
                                <!-- <v-progress-circular
                                    v-if="isReloadingUserImage == true"
                                    indeterminate
                                    color="primary"
                                ></v-progress-circular> -->
                                <v-icon color="primary" v-if="isReloadingUserImage == true">mdi-spin mdi-refresh</v-icon>
                                <v-icon v-else @click="reloadUserImages()">mdi-refresh</v-icon>
                            </span>
                            <!-- 네비게이션 내 클래스룸 버튼 -->
                            <div :style="!openWideScreen ? '':'display:none'">
                                <v-icon v-if="avatarSize=='s'" @click="changeAvatarSize('isNavBar')" style=" margin-left:5px;">mdi-account-box-outline</v-icon>
                                <v-icon v-if="avatarSize=='m'" @click="changeAvatarSize('isNavBar')" style="margin-left:5px;">mdi-grid</v-icon>
                            </div>
                            <!-- 클래스룸 확장 시 버튼 -->
                            <div v-if="Object.keys(classInfo.groupedUsers).length==1" :style="!openWideScreen ? 'display:none':''">
                                <v-icon v-if="avatarSize=='m'" @click="changeAvatarSize()" style="margin-left:10px;">mdi-account-box-outline</v-icon>
                                <v-icon v-if="avatarSize=='s'" @click="changeAvatarSize()" style="margin-left:10px;">mdi-grid-large</v-icon>
                                <v-icon v-if="avatarSize=='l'" @click="changeAvatarSize()" style="margin-left:10px;">mdi-grid</v-icon>
                            </div>
                            <div v-else :style="!openWideScreen ? 'display:none':''">
                                <v-icon v-if="avatarSize=='s'" @click="changeAvatarSize('isNavBar')" style=" margin-left:5px;">mdi-account-box-outline</v-icon>
                                <v-icon v-if="avatarSize=='m'" @click="changeAvatarSize('isNavBar')" style="margin-left:5px;">mdi-grid</v-icon>
                            </div>
                            <v-progress-circular
                                v-if="showLoading"
                                style="margin-left: 10px;"
                                indeterminate
                                size="20"
                                color="primary"
                            ><!-- 유저목록 스피너 -->
                            </v-progress-circular>
                            <v-spacer></v-spacer>
                            <v-icon v-if="isAdmin && openWideScreen && Object.keys(classInfo.groupedUsers).length!=1" text @click="deleteGroup(groupIdx, key)">mdi-close</v-icon>
                            <v-checkbox
                                v-if="isAdmin"
                                v-model="checkbox"
                                :label="`이름 숨기기`"
                                @change="hideStudentName()"
                                style="width:200px;"
                            >
                            </v-checkbox>
                        </v-card-title>
                        <v-card-text center style="max-height: 100%; padding:10px;">
                            <div v-if="isAdmin">
                                <draggable
                                        :list=filteredUserList
                                        tag="div"
                                        class="row"
                                        align="center"
                                        group="a"
                                >
                                    <v-col
                                            id = "user-mouseover"
                                            @click="selectUser(user)"
                                            v-for="user in filteredUserList"
                                            v-if="userResults[user.email]"
                                            :key="user.email"
                                            align="center"
                                            style="min-height: 100px; border-radius:10px;"
                                            :style="selectedUser ? (selectedUser.email != user.email ? 'opacity:0.4':'background-color:#E0ECF8'):''"
                                            @mouseenter="mouseInUser(user)"
                                            @mouseleave="mouseOutUser(user)"
                                    >
                                    <div :style="avatarSize == 's' ? 'min-width:100px':(avatarSize == 'm' ? 'min-width:300px':(avatarSize == 'l' ? 'min-width:600px':''))">
                                        <v-badge
                                                v-if="viewMode=='avatar'" :key="keyForUserResultStatus"
                                                :class="!hideName ? (!userLabResult[user.email] ? (userMessages[user.email] ? (userMessages[user.email]=='헬프미' ? 'balloon_red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'balloon_blue':(!userMessagesChat[user.email] ? '':'balloon_grey')):(userMessages[user.email]=='picture' ? '':'balloon_grey'))):''):''):''"
                                                :color="!hideName ? (!userLabResult[user.email] ? (userMessages[user.email] ? (userMessages[user.email]=='헬프미' ? 'red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'blue':(!userMessagesChat[user.email] ? '':'grey')):(userMessages[user.email]=='picture' ? '':'grey'))):''):''):''"
                                                right
                                                style="margin-top: 10px; margin-bottom: -10px;"
                                        >
                                            <!-- @mouseup="viewImageInLab(user.email)" -->
                                            <template v-slot:badge style="margin-left:10px;" v-if="hideName==false">
                                                <v-icon
                                                        v-if="userMessages[user.email] == 'picture' && !userLabResult[user.email]" 
                                                        :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                        style="font-size: 22px; margin-top:8px; margin-left:-4px;"> 
                                                    mdi-message-image
                                                </v-icon>
                                                <!-- <v-icon v-else-if="mouseOverUser[user.email]" color="white"
                                                        @click="showChangedUserDialog(user)"
                                                        style="cursor: pointer;">
                                                    mdi-pencil
                                                </v-icon> -->
                                                <span slot="badge" v-if="userMessages[user.email] != 'chat' && userMessages[user.email] != 'picture' && !userLabResult[user.email]"><b>{{userMessages[user.email]}}</b></span>
                                                <span slot="badge" v-if="userMessages[user.email] == 'chat' && userMessagesChat[user.email] && !userLabResult[user.email]"><b>{{userMessagesChat[user.email]}}</b></span>
                                                <v-icon v-if="userMessages[user.email] == 'chat' && !userMessagesChat[user.email] && !userLabResult[user.email]" 
                                                :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                style="font-size: 22px; margin-top:8px; margin-left:-4px;"> 
                                                    mdi-message-processing
                                                </v-icon>
                                            </template>
                                            <!-- @selectedUser -->
                                            <div v-if="userLabResult[user.email]" :style="userLabResult[user.email] ? (userLabResult[user.email].status =='new' ? 'border:3px solid #44bd32':''):''">
                                                <div v-if="userRanking" 
                                                    style="position:absolute; right:1px; top:1px; font-weight:bold;"
                                                    :style="labInfo.tool=='ide' ? 'color:white':''"
                                                >
                                                    <div v-if="userRanking[user.email]>=0" style="font-size:15px; font-weight:500; background-color:white;">{{userRanking[user.email]+1}}</div>
                                                </div>
                                                <div v-if="isUserActive && isUserActive[user.email]">
                                                    <div v-if="isUserActive[user.email] == 'true'" style="position:absolute; left:8%; bottom:5%">
                                                        <div class="ticontainer">
                                                            <div class="tiblock">
                                                                <div class="tidot"></div>
                                                                <div class="tidot"></div>
                                                                <div class="tidot"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!-- <v-hover v-slot="{ hover }"
                                                    open-delay="1000"
                                                >
                                                    <div v-if="hover"><v-btn color="primary" dark>Sign up</v-btn></div>
                                                </v-hover> -->
                                                <div v-if="userLabResult[user.email].labResult != 'data:,' && openWideScreen" @click="viewImageInLab(user.email), notSelectUser=true">
                                                    <img :src=userLabResult[user.email].labResult style="width:100%">
                                                </div>
                                                <img v-else-if="userLabResult[user.email].labResult != 'data:,' && !openWideScreen" :src=userLabResult[user.email].labResult style="width:100%" @click="viewImageInLab(user.email)">
                                                <div v-else-if="userLabResult[user.email].labResult == 'data:,'" :style="avatarSize == 's' ? 'min-width:100px; min-height:100px':(avatarSize == 'm' ? 'min-width:300px; min-height:300px':(avatarSize == 'l' ? 'min-width:600px; min-height:600px':''))">
                                                    <div><v-icon :style="avatarSize == 's' ? 'margin-top:30%':(avatarSize == 'm' ? 'margin-top:40%':(avatarSize == 'l' ? 'margin-top:50%':''))" x-large>mdi-alert-outline</v-icon></div>
                                                </div>
                                                <v-icon v-if="user.photoURL == undefined" x-large
                                                        @click="selectUser(user)"
                                                        style="cursor: pointer; z-index: 5; position:absolute; left: 1%; bottom: 5%;"
                                                        :style="avatarSize == 'l' ? 'font-size:48px;':(avatarSize == 'm' ? 'font-size:36px;':(avatarSize == 's' ? 'font-size:24px;':''))"
                                                        class="ma-0">
                                                    mdi-account-circle
                                                </v-icon>
                                                <v-avatar v-else
                                                        style="cursor: pointer; z-index: 5; position:absolute; left: 1%; bottom: 4%;"
                                                        :style="avatarSize == 'm' ? 'width:36px; height:36px;':(avatarSize == 's' ? 'width:24px; height:24px;':'')"
                                                        class="ma-0">
                                                    <img
                                                        :src=user.photoURL
                                                    >
                                                </v-avatar>
                                            </div>
                                            <div v-else style="margin-bottom:20px;">
                                                <v-icon v-if="user.photoURL == undefined" x-large
                                                        @click="selectUser(user)"
                                                        style="cursor: pointer; z-index: 5;"
                                                        class="ma-0">
                                                    mdi-account-circle
                                                </v-icon>
                                                <v-avatar v-else
                                                        style="cursor: pointer; z-index: 5;"
                                                        class="ma-0">
                                                    <img
                                                        :src=user.photoURL
                                                    >
                                                </v-avatar>
                                                <div v-if="isUserActive && isUserActive[user.email]">
                                                    <div v-if="isUserActive[user.email] == 'true'" style="position:absolute; margin-top:7px; margin-left:15px">
                                                        <div class="ticontainer">
                                                            <div class="tiblock">
                                                                <div class="tidot"></div>
                                                                <div class="tidot"></div>
                                                                <div class="tidot"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </v-badge>
                                        <ReplayPlayer v-else-if="viewMode!='avatar'" :selected-user="user" :style="avatarSize == 's' ? 'width:150px':(avatarSize == 'm' ? 'width:300px':(avatarSize == 'l' ? 'width:600px':''))"></ReplayPlayer>
                                        <div style="margin-top:-10px;" v-if="hideName==false">
                                            <div v-if="userScores[user.email] && bestScores.indexOf(userScores[user.email].score) > -1" style="margin-top:15px;">
                                                <v-icon :color="['green','orange', 'silver', '#CD7F32'][bestScores.indexOf(userScores[user.email].score) + 1]"
                                                        right>mdi-trophy
                                                </v-icon>
                                            </div>
                                            <font :color="userResults[user.email] && (userResults[user.email].allPassed || userResults[user.email].labPass) ? 'green':''">
                                                  <br>
                                                    <b>{{user.userName}} 
                                                    <v-badge :color="userMessages[user.email] ? (userMessages[user.email]=='헬프미' ? 'red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'blue':(!userMessagesChat[user.email] ? '':'grey')):(userMessages[user.email]=='picture' ? '':'grey'))):''"
                                                            style="margin-left: 5px; margin-bottom: -2px;"
                                                            v-if="userLabResult[user.email]"
                                                        >
                                                                    <!-- @mouseover="viewImageInLab(user.email)" -->
                                                        <template v-slot:badge>
                                                            <v-icon v-if="userMessages[user.email] == 'picture' && userLabResult[user.email].labResult" 
                                                                    :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                                    style="font-size: 22px; margin-top: -4px; margin-left: -7px;"> 
                                                                mdi-image
                                                            </v-icon>
                                                            <span slot="badge" v-if="userMessages[user.email] != 'chat' && userMessages[user.email] != 'picture'"><b>{{userMessages[user.email]}}</b></span>
                                                            <span slot="badge" v-if="userMessages[user.email] == 'chat' && userMessagesChat[user.email]"><b>{{userMessagesChat[user.email]}}</b></span>
                                                            <v-icon v-if="userMessages[user.email] == 'chat' && !userMessagesChat[user.email] && userLabResult[user.email].labResult" 
                                                            :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                            style="font-size: 22px; margin-top: -4px; margin-left: -7px;"> 
                                                                mdi-dots-horizontal-circle
                                                            </v-icon>
                                                        </template>
                                                    </v-badge>
                                                    <br> {{userResults[user.email] ?
                                                    userResults[user.email].passMessage: ''}}</b>
                                                <span style="font-size:5px" :style="ideStatus[user.email.replace('@','_')] ? (ideStatus[user.email.replace('@','_')]==null ? {'color':'red'}:{'color':'green'}): {'color':'grey'}"> ●</span>
                                            
                                                <v-skeleton-loader v-if="userResults[user.email]==null"
                                                                   ref="skeleton"
                                                                   type="sentences"
                                                                   max-height="10"
                                                >
                                                </v-skeleton-loader>
                                            </font>

                                            <v-chip
                                                    class="ma-0"
                                                    :color="'green'"
                                                    text-color="white"

                                                v-if="showingScores && newUserScores[user.email] && (newUserScores[user.email].score > 0)"
                                            >
                                                {{newUserScores[user.email].score ? Math.round(newUserScores[user.email].score):0}}
                                            </v-chip>
                                        </div>
                                    </div>
                                    </v-col>
                                </draggable>
                            </div>

                            <div v-else>
                                <blur-purchase-item
                                        :item-id="`${courseId}@${classId}@${labId}`"
                                        :itemAmount="labInfo.price"
                                        :itemPeriod="labInfo.period"
                                        :itemOpenRange="100"
                                        :itemResourceType="'lab'"
                                        :lab-info="labInfo"
                                        :class-info="classInfo"
                                >
                                    <v-row align="center">
                                        <v-col align="center"
                                               @click="selectUser(user)"
                                               v-for="(user,userKey,userIdx) in filteredUserList"
                                               v-if="userResults[user.email]"
                                               :key="user.email"
                                               style="min-height: 100px; border-radius:10px;"
                                               :style="selectedUser ? (selectedUser.email != user.email ? 'opacity:0.4':'background-color:#E0ECF8'):''"
                                        >
                                        <div :style="avatarSize == 's' ? 'min-width:100px':(avatarSize == 'm' ? 'min-width:300px':(avatarSize == 'l' ? 'min-width:600px':''))">
                                            <v-badge
                                                    v-if="viewMode=='avatar'" :key="keyForUserResultStatus"
                                                    :class="!userLabResult[user.email] ? (userMessages[user.email] ? (userMessages[user.email]=='헬프미' ? 'balloon_red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'balloon_blue':(!userMessagesChat[user.email] ? '':'balloon_grey')):(userMessages[user.email]=='picture' ? '':'balloon_grey'))):''):''"
                                                    :color="!userLabResult[user.email] ? (userMessages[user.email]=='헬프미' ? 'red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'blue':''):'')):''"
                                                    right
                                                    style="margin-top: 10px; margin-bottom: -10px;"
                                            >
                                            <!-- @mouseover="viewImageInLab(user.email)" -->
                                                <template v-slot:badge style="margin-top:10px;">
                                                    <v-icon 
                                                            v-if="userMessages[user.email] == 'picture' && !userLabResult[user.email]" 
                                                            :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                            style="font-size: 22px; margin-top:8px; margin-left:-4px;"> 
                                                        mdi-message-image
                                                    </v-icon>
                                                    <!-- <v-icon v-else-if="mouseOverUser[user.email]" color="white"
                                                            @click="showChangedUserDialog(user)"
                                                            style="cursor: pointer;">
                                                        mdi-pencil
                                                    </v-icon> -->
                                                    <span slot="badge" v-if="userMessages[user.email] != 'chat' && userMessages[user.email] != 'picture' && !userLabResult[user.email]"><b>{{userMessages[user.email]}}</b></span>
                                                    <span slot="badge" v-if="userMessages[user.email] == 'chat' && userMessagesChat[user.email] && !userLabResult[user.email]"><b>{{userMessagesChat[user.email]}}</b></span>
                                                    <v-icon v-if="userMessages[user.email] == 'chat' && !userMessagesChat[user.email] && !userLabResult[user.email]" 
                                                    :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                    style="font-size: 22px; margin-top:8px; margin-left:-4px;"> 
                                                        mdi-message-processing
                                                    </v-icon>
                                                </template>
                                                <!-- @selectedUser -->
                                                    <div v-if="userLabResult[user.email]">
                                                        <div v-if="userRanking" 
                                                        style="position:absolute; right:5%; top:5%; font-weight:bold; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;"
                                                        :style="labInfo.tool=='ide' ? 'color:white':''"
                                                    >
                                                        <div v-if="userRanking[user.email]>=0" style="font-size:15px">#{{userRanking[user.email]+1}}</div>
                                                    </div>
                                                    <div v-if="isUserActive && isUserActive[user.email]">
                                                        <div v-if="isUserActive[user.email] == 'true'" style="position:absolute; left:8%; bottom:5%">
                                                            <div class="ticontainer">
                                                                <div class="tiblock">
                                                                    <div class="tidot"></div>
                                                                    <div class="tidot"></div>
                                                                    <div class="tidot"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="userLabResult[user.email].labResult != 'data:,' && openWideScreen" @click="viewImageInLab(user.email), notSelectUser=true">
                                                        <img :src=userLabResult[user.email].labResult style="width:100%">
                                                    </div>
                                                    <img v-else-if="userLabResult[user.email].labResult != 'data:,' && !openWideScreen" :src=userLabResult[user.email].labResult style="width:100%" @click="viewImageInLab(user.email)">
                                                    <div v-else-if="userLabResult[user.email].labResult == 'data:,'" :style="avatarSize == 's' ? 'min-width:100px; min-height:100px':(avatarSize == 'm' ? 'min-width:300px; min-height:300px':(avatarSize == 'l' ? 'min-width:600px; min-height:600px':''))">
                                                        <div><v-icon :style="avatarSize == 's' ? 'margin-top:30%':(avatarSize == 'm' ? 'margin-top:40%':(avatarSize == 'l' ? 'margin-top:50%':''))" x-large>mdi-alert-outline</v-icon></div>
                                                    </div>
                                                    <v-icon v-if="user.photoURL == undefined" x-large
                                                            @click="selectUser(user)"
                                                            style="cursor: pointer; z-index: 5; position:absolute; right:1%; bottom:5%;"
                                                            :style="avatarSize == 'l' ? 'font-size:48px;':(avatarSize == 'm' ? 'font-size:36px;':(avatarSize == 's' ? 'font-size:24px;':''))"
                                                            class="ma-0">
                                                        mdi-account-circle
                                                    </v-icon>
                                                    <v-avatar v-else
                                                            style="cursor: pointer; z-index: 5; position:absolute; right:1%; bottom:5%;"
                                                            :style="avatarSize == 'm' ? 'width:36px; height:36px;':(avatarSize == 's' ? 'width:24px; height:24px;':'')"
                                                            class="ma-0">
                                                        <img
                                                            :src=user.photoURL
                                                        >
                                                    </v-avatar>
                                                </div>
                                                <div v-else style="margin-bottom:20px;">
                                                    <v-icon v-if="user.photoURL == undefined" x-large
                                                            @click="selectUser(user)"
                                                            style="cursor: pointer; z-index: 5;"
                                                            class="ma-0">
                                                        mdi-account-circle
                                                    </v-icon>
                                                    <v-avatar v-else
                                                            style="cursor: pointer; z-index: 5;"
                                                            class="ma-0">
                                                        <img
                                                            :src=user.photoURL
                                                        >
                                                    </v-avatar>
                                                    <div v-if="isUserActive && isUserActive[user.email]">
                                                        <div v-if="isUserActive[user.email] == 'true'" style="position:absolute; margin-top:7px; margin-left:15px">
                                                            <div class="ticontainer">
                                                                <div class="tiblock">
                                                                    <div class="tidot"></div>
                                                                    <div class="tidot"></div>
                                                                    <div class="tidot"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!-- <span class="dot"
                                                      :style="ideStatus[user.email.replace('@','_')] ? (ideStatus[user.email.replace('@','_')]==null ? {'background-color':'red'}:{'background-color':'green'}): {'background-color':'grey'}"></span> -->
                                            </v-badge>
                                            <ReplayPlayer v-else-if="viewMode!='avatar'" :selected-user="user" :style="avatarSize == 's' ? 'width:150px':(avatarSize == 'm' ? 'width:300px':(avatarSize == 'l' ? 'width:600px':''))"></ReplayPlayer>
                                                <div>
                                                    <div v-if="userScores[user.email] && bestScores.indexOf(userScores[user.email].score) > -1" style="margin-top:15px;">
                                                        <v-icon :color="['green','orange', 'silver', '#CD7F32'][bestScores.indexOf(userScores[user.email].score) + 1]"
                                                                right>mdi-trophy
                                                        </v-icon>
                                                    </div>
                                                    <font :color="userResults[user.email] && (userResults[user.email].allPassed || userResults[user.email].labPass) ? 'green':''">
                                                        <br>
                                                        <b>{{user.userName}} 
                                                        <v-badge :color="userMessages[user.email] ? (userMessages[user.email]=='헬프미' ? 'red':(userMessages[user.email]=='chat' ? (userMessagesStatus[user.email] == 'new' ? 'blue':(!userMessagesChat[user.email] ? '':'grey')):(userMessages[user.email]=='picture' ? '':'grey'))):''"
                                                        style="margin-left: 5px; margin-bottom: -2px;"
                                                        v-if="userLabResult[user.email]"
                                                        >
                                                                        <!-- @mouseover="viewImageInLab(user.email)" -->
                                                            <template v-slot:badge>
                                                                <v-icon v-if="userMessages[user.email] == 'picture' && userLabResult[user.email].labResult"
                                                                        :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                                        style="font-size: 22px; margin-top: -4px; margin-left: -7px;"> 
                                                                    mdi-image
                                                                </v-icon>
                                                                <span slot="badge" v-if="userMessages[user.email] != 'chat' && userMessages[user.email] != 'picture'"><b>{{userMessages[user.email]}}</b></span>
                                                                <span slot="badge" v-if="userMessages[user.email] == 'chat' && userMessagesChat[user.email]"><b>{{userMessagesChat[user.email]}}</b></span>
                                                                <v-icon v-if="userMessages[user.email] == 'chat' && !userMessagesChat[user.email] && userLabResult[user.email].labResult" 
                                                                :color="userMessagesStatus[user.email] == 'new' ? 'blue':'grey'"
                                                                style="font-size: 22px; margin-top: -4px; margin-left: -7px;"> 
                                                                    mdi-dots-horizontal-circle
                                                                </v-icon>
                                                            </template>
                                                        </v-badge>
                                                        <br> {{userResults[user.email] ?
                                                        userResults[user.email].passMessage: ''}}</b>

                                                        <v-skeleton-loader v-if="userResults[user.email]==null"
                                                                        ref="skeleton"
                                                                        type="sentences"
                                                                        max-height="10"
                                                        >
                                                        </v-skeleton-loader>
                                                    </font>
                                                </div>

                                                <v-chip
                                                        class="ma-0"
                                                        :color="'green'"
                                                        text-color="white"

                                                        v-if="showingScores && newUserScores[user.email] && (newUserScores[user.email].score > 0)"
                                                >
                                                    {{newUserScores[user.email].score ? Math.round(newUserScores[user.email].score): '0'}}
                                                </v-chip>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </blur-purchase-item>
                            </div>
                        </v-card-text>
                    </v-card>

                    <!-- 미배정 -->
                    
                </v-col>

                <v-navigation-drawer
                        style="z-index:10"
                        v-if="selectedUser"
                        absolute permanent right
                        width="50%"
                >
                        <v-tabs
                                v-model="tab"
                                color="cyan"
                                flat
                        >

                            <v-tab
                                    v-for="item in items"
                                    :key="item.tab"
                            >
                                {{ item.tab }}
                            </v-tab>
                            <div style=" padding-top:12px; line-height:100%;">
                                <v-icon text @click="unselectUser()">mdi-close</v-icon>
                            </div>
                            <v-tab-item>
                                <v-divider></v-divider>
                                <v-icon x-large
                                        v-bind:style="{ color: selectedUser.color }">
                                    mdi-account-circle
                                </v-icon>
                                {{selectedUser.userName}} - {{selectedUser.email}}
                                <v-icon v-if="isAdmin || selectedUser.email == myId"
                                        color="black" small
                                        @click.native="showChangedUserDialog(selectedUser)"
                                        style="cursor: pointer;">
                                    mdi-pencil
                                </v-icon>
                                <v-subheader v-if="labInfo.tool=='ide'"> Hash Name: labs-{{ getHashCode() }}</v-subheader>
                                <v-subheader v-else-if="labInfo.tool =='jupyter'"> Hash Name: jpt-{{ getHashCode() }}
                                </v-subheader>
                                <v-list dense>
                                    <v-subheader>
                                        Checkpoints
                                    </v-subheader>
                                    <v-list-item v-for="(item,idx) in userResults[selectedUser.email]" :key="idx">
                                        <v-list-item-content>
                                            <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox
                                                    v-if="isAdmin"
                                                    @click.stop="sendCheckPoints(selectedUser.email, item)"
                                                    v-model="item.status"
                                                    success
                                            ></v-checkbox>
                                            <v-checkbox
                                                    v-if="!isAdmin"
                                                    v-model="item.status"
                                                    success
                                                    readonly
                                            ></v-checkbox>
                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list>
                                <v-divider></v-divider>
                                <div style="margin-top: 5px; margin-bottom: 20px;">
                                    <v-btn v-if="(isAdmin || selectedUser.email == myId)"
                                        :to="'/courses/' + courseId + '/' + classId + '/' + labId + '/' + selectedUser.email"
                                        small color="primary" target="_blank"
                                        style="margin-left: 10px; margin-bottom:5px; font-weight:850;">랩실 보기
                                    </v-btn>
                                    <v-btn v-if="(isAdmin || selectedUser.email == myId) && selectedUser.deleteInterval == undefined && labInfo.tool == 'event-storming'"
                                        @click="clearStorming(selectedUser)"
                                        small color="error" target="_blank"
                                        style="margin-left: 10px; margin-bottom:5px; font-weight:850;">초기화
                                    </v-btn>
                                    <v-btn v-else-if="(isAdmin || selectedUser.email == myId) && selectedUser.deleteInterval == undefined"
                                        @click="clearLabDialog(selectedUser)"
                                        small color="error" target="_blank"
                                        style="margin-left: 10px; margin-bottom:5px; font-weight:850;">초기화
                                    </v-btn>
                                    <v-btn
                                            v-if="isAdmin"
                                            color="green darken-1"
                                            dark
                                            small
                                            style="margin-left: 10px;  margin-bottom:5px; font-weight:850;"
                                            @click="scoreDialog = true"
                                    >
                                        상금 지급
                                    </v-btn>
                                    <!-- <v-btn v-else-if="isAdmin || selectedUser.email == myId"
                                        large color="error" target="_blank" style="margin-left: 30px;">
                                        <v-progress-circular color="primary"
                                                            indeterminate></v-progress-circular>
                                    </v-btn> -->
                                    <!-- ? -->
                                    <v-divider></v-divider>


                                    <!--                    <v-divider></v-divider>-->
                                    <v-row justify="center">
                                        <v-dialog
                                                v-model="scoreDialog"
                                                max-width="450"
                                        >
                                            <v-card>
                                                <div align="right"
                                                    style="margin-top: 5px; margin-right: 5px; margin-bottom: 5px">
                                                    <v-icon text @click="scoreDialog = false">mdi-close</v-icon>
                                                </div>

                                                <v-card-title class="headline">{{selectedUser.userName}}의 보유코인 :
                                                    {{userScores[selectedUser.email] ?
                                                    Math.round(userScores[selectedUser.email].score): 0}}coins
                                                </v-card-title>

                                                <v-card-text>
                                                    <v-col>
                                                        <v-text-field type="number" v-model="prize" label="상금 코인"/>
                                                    </v-col>

                                                    <v-btn @click="addIndividualScore()" style="margin-left: 260px;"
                                                        color="primary">지급
                                                    </v-btn>
                                                    <v-btn @click="removeIndividualScore()" style="margin-left: 10px;"
                                                        color="error">차감
                                                    </v-btn>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                    </v-row>
                                </div>
                                <!-- <div style="margin-top: 5px; margin-bottom: 20px;">
                                    <component v-if="tool.result"
                                               :is="'lab-tool-' + labInfo.tool"
                                               v-model="tool"
                                               :lab-info="labInfo"
                                               style="width: 100% !important; height:550px !important; margin:24px 0 -24px 0; position: relative !important;"
                                               readonly
                                               small
                                    >
                                    </component>
                                </div>

                                <v-skeleton-loader 
                                    v-if="typeof tool.result === 'undefined'"
                                    ref="skeleton"
                                    type="image"
                                    style="width: 100%;
                                        height:550px;
                                        padding-top:22px;
                                        margin:0;"
                                >
                                </v-skeleton-loader> -->
                            </v-tab-item>
                            <v-tab-item>
                                <ClassRoomChat :init-user="connectUserId" :selected-user="selectedUser"></ClassRoomChat>
                            </v-tab-item>
                            <!-- <v-tab-item>
                                <ReplayPlayer :selectedUser="selectedUser"></ReplayPlayer>
                            </v-tab-item> -->
                        </v-tabs>
                    <!-- <div v-else>
                        <v-card width="800">
                            <v-card-title>{{selectedUser.userName}}님의 결과</v-card-title>
                            <v-list dense>
                                    <v-subheader>
                                        Checkpoints
                                    </v-subheader>
                                    <v-list-item v-for="(item,idx) in userResults[selectedUser.email]" :key="idx">
                                        <v-list-item-content>
                                            <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                            <v-checkbox
                                                    v-if="isAdmin"
                                                    @click.stop="sendCheckPoints(selectedUser.email, item)"
                                                    v-model="item.status"
                                                    success
                                            ></v-checkbox>
                                            <v-checkbox
                                                    v-if="!isAdmin"
                                                    v-model="item.status"
                                                    success
                                                    readonly
                                            ></v-checkbox>
                                        </v-list-item-action>
                                    </v-list-item>
                                </v-list>
                                <v-divider></v-divider>
                            <div style="text-align: -webkit-center;">
                                <v-img v-if="selectUserInLab[selectedUser.email]" style="width: 90%" :src="selectUserInLab[selectedUser.email]"></v-img>
                            </div>
                        </v-card>
                    </div> -->
                </v-navigation-drawer>
            </v-row>
        </div>

        <div v-else>
            <v-row>
                <v-col>
                    <!-- classroom 메인 로딩창 -->
                    <v-skeleton-loader
                    indeterminate
                    ref="skeleton"
                    type="image"
                    style="width:50%;
                        height:10%;
                        position:absolute;
                        top:10px;
                        left:10px;"
                    >
                    </v-skeleton-loader>
                    <v-skeleton-loader
                    indeterminate
                    ref="skeleton"
                    type="image"
                    style="width:25%;
                        height:5%;
                        position:absolute;
                        top:13%;
                        left:10px;"
                    >
                    </v-skeleton-loader>
                    <v-skeleton-loader
                    indeterminate
                    ref="skeleton"
                    type="image"
                    style="width:99%;
                        height:67%;
                        position:absolute;
                        top:19%;
                        left:10px;"
                    >
                    </v-skeleton-loader>
                    <v-skeleton-loader
                    indeterminate
                    ref="skeleton"
                    type="image"
                    style="width:4%;
                        height:8%;
                        position:absolute;
                        top:90%;
                        left:10px;"
                    >
                    </v-skeleton-loader>
                </v-col>
            </v-row>
        </div>

        <question ref="question" v-if="isAdmin" :lab-info="labInfo" :class-info="classInfo"></question>
        <v-dialog
                v-model="chatImgDialog"
                width="1000"
                @click:outside="removeChatImg(), notSelectUser=false"
        >
            <div style="display: -webkit-box;" @mouseleave="chatImgDialog=false, notSelectUser=false">
                <v-img :src="chatImage" style="background-color: white;"></v-img>
                <v-card style="width: 200px;">
                    <v-list dense v-if="selectUserId">
                        <v-subheader>
                            Checkpoints
                        </v-subheader>
                        <v-list-item v-for="(item,idx) in userResults[selectUserId]" :key="idx">
                            <v-list-item-content>
                                <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-checkbox
                                        v-if="isAdmin"
                                        @click.stop="sendCheckPoints(selectUserId, item)"
                                        v-model="item.status"
                                        success
                                ></v-checkbox>
                                <v-checkbox
                                        v-if="!isAdmin"
                                        v-model="item.status"
                                        success
                                        readonly
                                ></v-checkbox>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-card>
            </div>
        </v-dialog>
    </v-container>
</template>

<script>

    import LabBase from "./LabStorageBase"
    import Answer from "./Answer"
    import UserNavigator from "./UserNavigator";
    import Question from "./Question";
    import LabToolKuberEz from "./tools/LabToolKuberEz"
    import LabToolEventStorming from "./tools/LabToolEventStorming"
    import LabToolIde from "./tools/LabToolIDE"
    import LabToolJupyter from "./tools/LabToolJupyter"
    import LabToolQuiz from "./tools/LabToolQuiz"
    import PollResult from "./PollResult"
    import BlurPurchaseItem from "../payment/BlurPurchaseItem";

    var _ = require('lodash');
    import firebase from 'firebase'
    //    import PieChart from 'v-easy-chart'
    import CoinDrop from "./CoinDrop"
    import Countdown from './Countdown'
    import IDEMixins from "./tools/IDEMixins";
    import draggable from "vuedraggable";
    import VueContext from 'vue-context';
    import ClassRoomChat from "./ClassRoomChat"
    import 'vue-context/src/sass/vue-context.scss';
    import ReplayPlayer from "./ReplayPlayer";
    import { mdiFormatLetterCase } from '@mdi/js';

    //    import {diff, addedDiff, deletedDiff, updatedDiff, detailedDiff} from 'deep-object-diff';

    export default {
        name: "ClassRoom",
        components: {
            ReplayPlayer,
            draggable,
            Question,
            UserNavigator,
            Answer,
            PollResult,
            CoinDrop,
            Countdown,
            LabToolEventStorming,
            LabToolIde,
            LabToolKuberEz,
            LabToolJupyter,
            VueContext,
            ClassRoomChat,
            'blur-purchase-item' : BlurPurchaseItem
        },
        props: {
            archive: Boolean,
        },
        mixins: [LabBase, IDEMixins],
        data: () => ({
            isScoreSettingDone: false,
            scoreChangedUserId: null,
            openWideScreen: false,
            allUsers: null,
            hideName: false,
            checkbox: false,
            imgUrl: null,
            socket: null,
            isLoadingforUserImages: false,
            userImg: null,
            clearDialog: false,
            upHere: false,
            message: "",
            editGroupName: '',
            classInfo: null,
            userResults: {},
            userScores: {},
            userMessages: {},
            userMessagesStatus: {},
            userMessagesSnapshot: {},
            userMessagesChat: {},

            scoreTime: {
                time: '00:00:00.0',
                timeBegan: null,
                timeStopped: null,
                stoppedDuration: 0,
                started: null,
                running: false,
            },
            labInfo: null,
            pollingJob: null,
            selectedUser: null,
            log: 'not loaded yet',
            show: true,
            missionSheet: false,
            tool: {result: null},
            ideStatus: {},
            tab: null,
            deleting : false,
            viewMode: "avatar",
            items: [
                {tab: 'Lab'},
                {tab: 'Chat'},
                {tab: 'Playing'},
            ],
            chatImgDialog: false,
            chartData: [
                {value: 335, name: "istanbul"},
                {value: 310, name: "ankara"},
                {value: 234, name: "izmir"},
                {value: 135, name: "adana"},
                {value: 1548, name: "mersin"}
            ],
            scoreDialog: false,
            pollDialog: null,
            theoryDialog: false,
            missionDialog: false,
            answerDialog: false,
            theoryExtended: false,
            showingScores: false,
            bestScore: 0,
            scoreToBeDeposited: 0,
            quizAnswer: null,
            labStatus: {
                status: null
            },
            deadline: null,
            deleteInterval: null,
            resolveDepositPromise: null,
            prize: null,
            totalDeposited: 0,
            editGroupIdx: null,
            cloneUserList: null,
            changedUserDialog: false,
            changedUser: null,
            mouseOverUser: {},
            classChatData: [],
            chatImage: null,
            reply: null,
            tmpChat: null,
            tmpIdx: null,
            search: '',
            maintainFiles: false,
            maintainConfig: false,
            selectUserId: '',
            newId: null,
            classChatLastKey: null,
            groupList: [],
            showLoading: false,
            // selectUserInLab: [],
            // userResultStatus: [],
            userLabResult: [],
            keyForUserResultStatus: 0,
            labResultCount: 0,
            rootPath: null,
            isReloadingUserImage: false,
            avatarSize: 's',
            isUserActive: null,
            userRanking: [],
            submitTimeStamp: null,
            notSelectUser: false,
            newUserScores: {},
        }),
        async created() {
            var me = this
        },
        computed: {
            filteredUserList(){
                var filteredUsers = []

                if (this.search == '') {
                    filteredUsers = Object.values(this.classInfo.groupedUsers).flatMap(team => team.users);
                }else{
                    Object.keys(this.classInfo.groupedUsers).forEach(teamName => {
                        this.classInfo.groupedUsers[teamName].users.forEach(user => {
                            if(user.userName.includes(this.search)){
                                filteredUsers.push(user);
                            }
                        })
                    })
                }
                return filteredUsers;
            },
            getGroupUsers(){
                var groupUser = this.classInfo.groupedUsers
                Object.keys(groupUser).forEach(function(teamName){
                    return groupUser[teamName].users.sort(function(a, b) { 
                        return a.userName < b.userName ? -1 : a.userName > b.userName ? 1 : 0;
                    });
                })
                return groupUser
            },
            connectUserName() {
                return localStorage.getItem("userName");
            },
            connectUserId() {
                return localStorage.getItem("email");
            },
            getMemberCount() {
                var me = this
                var basicPassedMemberCount = 0;
                var allPassedMemberCount = 0;
                var attendanceMemberCount = 0;
                var connectionMemberCount = 0;
                var memberCount = 0;
                me.showLoading = true
                me.$EventBus.$emit('showLoading', 'true')

                Object.keys(me.classInfo.groupedUsers).forEach(group => {

                    me.classInfo.groupedUsers[group].users.forEach(user => {
                        if(me.userResults[user.email]){
                            if (!user.email.includes('@uengine.org')) {
                                memberCount++;
                                if (me.userResults[user.email] && me.userResults[user.email].allPassed) {
                                    allPassedMemberCount++;
                                }
                                if (me.userResults[user.email] && me.userResults[user.email].basicPassed) {
                                    basicPassedMemberCount++;
                                }
                                if (me.userResults[user.email] && me.userResults[user.email].attendance) {
                                    attendanceMemberCount++;
                                }
                                if (me.userResults[user.email] && me.userResults[user.email].connection) {
                                    connectionMemberCount++;
                                }
                            }
                            me.showLoading = false
                        } 
                    })
                });

                return {
                    'allPassUserCount': allPassedMemberCount,
                    'basicPassUserCount': basicPassedMemberCount,
                    'attendanceUserCount': attendanceMemberCount,
                    'connectionUserCount': connectionMemberCount,
                    'usersCount': memberCount
                }

            },
            showMessage() {
                return true;
                //return !this.showingScores
            },
            links() {
                //override links
                if (this.labInfo && this.labInfo.links) {
                    var links = this.labInfo.links;

                    if (this.classInfo && this.classInfo.links)
                        Object.keys(this.classInfo.links).forEach(key => {
                            links[key] = this.classInfo.links[key];
                        });

                    return links
                }
                return this.classInfo ? this.classInfo.links : null;

            }
        },
        watch: {
            selectedUser(val) {
                var me = this
                this.reply = null
                if (val != null) {
                    me.pollingJob = setInterval(function () {
                        me.loadToolResult()
                    }, 3000);
                }
            },
        },
        beforeDestroy() {
            var me = this
            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`))
            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat/`))
            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/`))

            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/labResult`))
            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive`))
            me.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo`))
        },
        async mounted() {
            // console.log('mounted')
            await this.init();
            var me = this
            this.$EventBus.$emit("setLabInfo", null)
            
            if(sessionStorage.getItem("wideScreenMode") == 'true'){
                me.openWideScreen = true
            }else{
                me.openWideScreen = false
            }

            this.$EventBus.$on('wideScreenMode', function(){
                var wideScreenMode = sessionStorage.getItem("wideScreenMode")

                if(wideScreenMode == 'true'){
                    me.openWideScreen = true
                }else{
                    me.openWideScreen = false
                }
            })

            // me.$EventBus.$on('finishLoadUserScreen', function (data) {
            //     me.isReloadingUserImage = false;
            //     me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/loadStepforUserImage`), 'ready');
            // })
            // this.$EventBus.$on('changedClassroomSize', function(status){
            //     this.openWideScreen = status
            // })
            
            this.$EventBus.$on('clearLabResult', function(data){
                if(data){
                    me.userRanking = []
                    me.userLabResult = []
                    me.submitTimeStamp = null
                    me.labResultCount = 0
                }
            })

            this.$EventBus.$on('unselectUser', function(){
                me.unselectUser()
            })

            // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/watchUserScreen`), 'false');
            // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/loadStepforUserImage`), 'ready');
            this.$nextTick(function () {
                me.$watch("classInfo.groupedUsers", _.debounce(function (newVal) {
                    if(!me.changedUserDialog){
                        me.groupList = []
                        if ((Object.keys(newVal).length == 0)) {
                            }
                        if (Object.keys(newVal).length != 0) {
                            // console.log(this.classInfo.enrolledUsersList)

                            Object.keys(newVal).forEach(function (groupKey) {
                                me.groupList.push(groupKey)
                                newVal[groupKey]["users"].forEach(function (user) {
                                    if (me.classInfo.enrolledUsersList)
                                        Object.keys(me.classInfo.enrolledUsersList).forEach(function (enrolledKey) {
                                            if (me.classInfo.enrolledUsersList[enrolledKey].email == user.email) {
                                                if (me.classInfo.enrolledUsersList[enrolledKey].group != groupKey) {
                                                    me.classInfo.enrolledUsersList[enrolledKey].group = groupKey
                                                }
                                            }
                                        })
                                })
                            })
                            me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`), me.classInfo.enrolledUsersList)
                        }
                    }
                }, 500), {
                    deep: true
                })
            })
            
            this.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`), function (newVal) {
                var groupedUsers = {}
                // 조 파악
                me.allUsers = newVal
                Object.keys(newVal).forEach(function (key) {
                    if (!newVal[key].group) {
                        newVal[key].group = "미배정"
                    }
                    if(!me.newUserScores[newVal[key].email]) {
                        var obj = {
                            score: 0,
                            uuId: key
                        }
                        me.newUserScores[newVal[key].email] = obj
                    }
                    if(newVal[key].score && ((me.scoreChangedUserId && me.scoreChangedUserId == key) || !me.isScoreSettingDone)) {
                        me.newUserScores[newVal[key].email].score = newVal[key].score
                    }
                    if (Object.keys(groupedUsers).indexOf(newVal[key].group) == -1) {
                        groupedUsers[newVal[key].group] = {
                            users: []
                        }
                    }

                    if (newVal[key].state != 'delete')
                        groupedUsers[newVal[key].group].users.push(newVal[key])

                    if (me.classInfo) {
                        me.classInfo.enrolledUsersList = newVal
                        me.classInfo.groupedUsers = groupedUsers
                    }

                })
            })

            me.submitTimeStamp = new Map();

            me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/labResult`),null, function(data){
                if(data){
                    var userRanking = []
                    var email = data.key.replaceAll('_', '.')
                    if(!email.includes("@uengine.org") && !me.userLabResult[email]){
                        me.labResultCount++;
                    }
                    if(!me.submitTimeStamp){
                        me.submitTimeStamp = new Map();
                    }
                    me.submitTimeStamp.set(email, data.date)
                    const sort = Array.from(me.submitTimeStamp);

                    sort.sort((a, b) => a[1] - b[1]);

                    sort.forEach(function(value, key) {
                        if(!userRanking[value[0]]){
                            userRanking[value[0]] = null
                        } 
                        userRanking[value[0]] = key
                    })
                    me.userRanking = userRanking

                    me.userLabResult[email] = data
                    me.keyForUserResultStatus++;
                }
            })

            me.watch_changed('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/labResult`), function(data, key){
                if(data){
                    var userRanking = []
                    var email = key.replaceAll('_', '.')
                    if(!email.includes("@uengine.org") && !me.userLabResult[email]){
                        me.labResultCount++;
                    }
                    
                    if(data.date){
                        me.submitTimeStamp.set(email, data.date)
                        const sort = Array.from(me.submitTimeStamp);

                        sort.sort((a, b) => a[1] - b[1]);

                        sort.forEach(function(value, key) {
                            if(!userRanking[value[0]]){
                                userRanking[value[0]] = null
                            } 
                            userRanking[value[0]] = key
                        })
                        me.userRanking = userRanking
                    }

                    me.userLabResult[email] = data
                    me.keyForUserResultStatus++;
                }
            })
            var userActive = {}
            me.watch_changed('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive`), function(data, key){
                // console.log(data, key)
                var email = key.replaceAll('_', '.')
                if(data){
                    me.isUserActive = {}
                    if(data == 'true'){
                        userActive[email] = data
                    } else {
                        userActive[email] = "false"
                    }
                    me.isUserActive = userActive
                }
            })
            // !!
            var classChatData = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`));
            if(!classChatData){
                var classChatData = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`classChat`));
            }
            if (classChatData) {
                var classKeys = Object.keys(classChatData);

                    classKeys.forEach(function (key) {
                        me.classChatLastKey = key
                    })

                }
            // 각 채팅 별로 childAdded 되는 것 을 가지고와서 현재 안읽은 채팅이 몇개인지 확인.
            var classroomChatBadge
            this.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat/`),null, function (data) {
                // data.message = data.message.replaceAll("\n", "<br/>")
                me.classChatData.push(data)
                me.userMessagesStatus[data.userId] = 'old'
                if(!me.classChatLastKey || me.classChatLastKey < data.key){
                    me.newId = data.userId
                    me.userMessagesStatus[me.newId] = 'new'
                }
                if(data.message.length > 5){
                    classroomChatBadge = data.message.substring(0,5) + "..."
                }
                else {
                    classroomChatBadge = data.message
                }
                me.userMessagesChat[me.newId] = classroomChatBadge
                
            })
            
            this.loadAllUserResults();

        },
        destroyed() {
            clearInterval(this.pollingJob)
        },
        methods: {
            scoreStart() {
                var me = this
                me.resetScoreTime();
                if(me.scoreTime.running) return;
                
                if (me.scoreTime.timeBegan === null) {
                    me.scoreTime.timeBegan = new Date();
                }

                if (me.scoreTime.timeStopped !== null) {
                    me.scoreTime.stoppedDuration += (new Date() - me.scoreTime.timeStopped);
                }

                me.scoreTime.started = setInterval(me.clockRunning, 10);	
                me.scoreTime.running = true;
            },
            scoreTimeStop() {
                var me = this
                me.scoreTime.running = false;
                me.scoreTime.timeStopped = new Date();
                clearInterval(me.scoreTime.started);
            },
            clockRunning(){
                var me = this
                var currentTime = new Date()
                , timeElapsed = new Date(currentTime - me.scoreTime.timeBegan - me.scoreTime.stoppedDuration)
                , hour = timeElapsed.getUTCHours()
                , min = timeElapsed.getUTCMinutes()
                , sec = timeElapsed.getUTCSeconds()
                , ms = timeElapsed.getUTCMilliseconds();

                me.scoreTime.time = 
                    me.zeroPrefix(hour, 2) + ":" + 
                    me.zeroPrefix(min, 2) + ":" + 
                    me.zeroPrefix(sec, 2) + "." + 
                    me.zeroPrefix(ms, 1);
            },
            zeroPrefix(num, digit) {
                var zero = '';
                for(var i = 0; i < digit; i++) {
                    zero += '0';
                }
                return (zero + num).slice(-digit);
            },
            resetScoreTime() {
                var me = this

                me.scoreTime.running = false;
                clearInterval(me.scoreTime.started);
                me.scoreTime.stoppedDuration = 0;
                me.scoreTime.timeBegan = null;
                me.scoreTime.timeStopped = null;
                me.scoreTime.time = "00:00:00.0";
            },
            hideStudentName() {
                var me = this
                if(me.checkbox) {
                    me.hideName = true;
                }else {
                    me.hideName = false;
                }
            },
            changeAvatarSize(isNavBar) {
                var me = this
                if(isNavBar == 'isNavBar') {
                    if(me.avatarSize == 's') {
                        me.avatarSize = 'm';
                    }else if(me.avatarSize == 'm') {
                        me.avatarSize = 's';
                    }
                }else {
                    if(me.avatarSize == 's') {
                        me.avatarSize = 'm';
                    }else if(me.avatarSize == 'm') {
                        me.avatarSize = 'l';
                    }else if(me.avatarSize == 'l') {
                        me.avatarSize = 's';
                    }
                }
            },
            clearLabDialog() {
                this.clearDialog = true;
            },
            viewModeChange() {
                // var me = this
                // if (me.viewMode == "screen") {
                //     me.viewMode = "avatar"
                //     me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/watchUserScreen`), 'false');
                // } else if (me.viewMode == "avatar") {
                //     me.viewMode = "screen"
                //     me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/watchUserScreen`), 'true');
                //     me.isReloadingUserImage = true;
                // }
            },
            reloadUserImages(){
                // var me = this 
                // me.isReloadingUserImage = true;
                // me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/loadStepforUserImage`), 'startCapture');
            },
            replaceLast(find, replace, string) {

                var lastIndex = string.lastIndexOf(find);

                if (lastIndex === -1) {
                    return string;
                }

                var beginString = string.substring(0, lastIndex);
                var endString = string.substring(lastIndex + find.length);

                return beginString + replace + endString;
            },
            lineBreak() {
                this.message = this.message + '\n'
            },
            showChangedUserDialog(user) {
                var me = this
                var key = null
                me.changedUserDialog = false
                me.changedUser = {}
                if (me.classInfo.enrolledUsersList)
                    Object.entries(me.classInfo.enrolledUsersList).forEach(function (enroll) {
                        if (enroll[1].email == user.email) {
                            key = enroll[0]
                        }
                    })

                if (key) {
                    me.changedUser[key] = user
                }

                me.changedUserDialog = true
            },
            closeChangedUserDialog() {
                var me = this
                me.changedUser = null
                me.changedUserDialog = false
            },
            mouseInUser(user) {
                if (!this.mouseOverUser) this.mouseOverUser = {}
                this.mouseOverUser[user.email] = true
                this.mouseOverUser.__ob__.dep.notify()
            },
            mouseOutUser(user) {
                if (!this.mouseOverUser) this.mouseOverUser = {}
                this.mouseOverUser[user.email] = false
                this.mouseOverUser.__ob__.dep.notify()
            },
            changedUserAction(action) {
                var me = this

                if (me.changedUser && Object.entries(me.changedUser)[0][0]) {
                    var key = Object.entries(me.changedUser)[0][0]
                    var users = Object.entries(me.changedUser)[0][1]

                    if (action == 'delete') {
                        users.state = 'delete'
                    }

                    me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`) + key, users)
                } else {
                    alert('해당 유저를 찾을수 없습니다.')
                }

                me.closeChangedUserDialog()
            },
            viewImage(userId) {
                try {
                    if(this.isAdmin || this.isTeacher){
                        this.userMessagesStatus[userId] = 'old'
                    }
                    var copyClassChatData = JSON.parse(JSON.stringify(this.classChatData))
                    var chatData = copyClassChatData.reverse();
                    var image;

                    chatData.some(function (item) {
                        if ((item.userId == userId) && item.image) {
                            image = item.image;
                            return true;
                        }
                    })
                    this.chatImg(image, userId)
                } catch(e){
                    alert(e.message)
                }
                
            },
            async viewImageInLab(userId){
                var me = this
                if(me.openWideScreen){
                    if(me.userLabResult[userId].status == 'new'){
                        if(me.isAdmin || me.isTeacher){
                            me.userLabResult[userId].status = 'old'
                            me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/labResult/${userId.replace(/\./gi, '_')}`), this.userLabResult[userId])
                    
                        }
                    }
                    if(!me.chatImgDialog){
                        me.chatImg(me.userLabResult[userId].labResult, userId)  
                    }

                }else{
                    if(this.userLabResult[userId].status == 'new'){
                            if(this.isAdmin || this.isTeacher){
                                this.userLabResult[userId].status = 'old'
                                this.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/labResult/${userId.replace(/\./gi, '_')}`), this.userLabResult[userId])
                            }
                        }
                        this.chatImg(this.userLabResult[userId].labResult, userId)
                }

            },
            deleteGroup(groupIdx, key) {
                var me = this
                try {
                    if (me.classInfo.groupedUsers[key].users.length > 0) {
                        var tmpUsers = JSON.parse(JSON.stringify(me.classInfo.groupedUsers[key].users));
                        var findUnassignedGroupKey = null
                        Object.keys(me.classInfo.groupedUsers).forEach(function (groupName) {
                            if (groupName.includes("미배정")) {
                                findUnassignedGroupKey = groupName
                            }
                        });

                        if (findUnassignedGroupKey) {
                            tmpUsers.forEach(function (user) {
                                me.classInfo.groupedUsers[findUnassignedGroupKey].users.push(user)
                            })
                        } else {
                            var unAssignedGroup = {
                                users: tmpUsers
                            }
                            me.$set(me.classInfo.groupedUsers, "미배정", unAssignedGroup)
                            // me.classInfo.groupedUsers.push(unAssignedGroup)
                        }
                        me.$delete(me.classInfo.groupedUsers, key)
                    } else {
                        me.$delete(me.classInfo.groupedUsers, key)
                    }

                } catch(e){
                    alert(e.message)
                }
                
            },
            addGroup() {
                try {
                    var count = Object.keys(this.classInfo.groupedUsers).length;
                    var groupName = ''
                    // this.classInfo.groupedUsers[`생성된 조 ${count}`] = {};
                    this.groupList.forEach(function(data){
                        if(data.includes('Group' + count))
                            groupName = data + ' - new'
                    })
                    if(groupName == '')
                        groupName = 'Group' + count
                    
                    this.$set(this.classInfo.groupedUsers, groupName, {users: []})

                } catch(e){
                    alert(e.message)
                }
                
            },
            chatImg(imgSrc, selectUserId) {
                this.chatImage = imgSrc;
                this.chatImgDialog = true;
                this.selectUserId = selectUserId
            },
            removeChatImg() {
                this.chatImage = null
            },
            submitGroupName(groupIdx, key) {
                try {
                        if (this.isAdmin) {
                        var copyData = JSON.parse(JSON.stringify(this.classInfo.groupedUsers[key]));
                        this.$delete(this.classInfo.groupedUsers, key)
                        this.$set(this.classInfo.groupedUsers, this.editGroupName, copyData)
                        // this.classInfo.groupedUsers[groupIdx].groupName = this.editGroupName;
                        this.editGroupIdx = null;
                        this.editGroupName = '';
                    }

                } catch(e){
                    alert(e.message)
                }
                
            },
            editMode(groupIdx, key) {
                if (this.isAdmin) {
                    // console.log(this.classInfo.groupedUsers)
                    this.editGroupName = key;
                    this.editGroupIdx = groupIdx
                }
            },
            async init() {
                var me = this;
                try {
                    await this.loadLabInfo();
                    await this.loadClassInfo();

                    if(me.classInfo && me.classInfo.archive){
                        me.rootPath = 'archive/'
                    } else {
                        me.rootPath = 'running/'
                    }

                    // //기업강의
                    // if (this.classInfo && !this.classInfo.openClass && this.classInfo.connectionKey) {
                    //     this.labInfo.price = 0
                    // }

                    //score firebase

                    // message firebase
                    this.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/`), function (value) {
                        if (value) {
                            if (value.clear) {
                                me.userMessages = {}
                                me.userMessagesChat = {}
                                
                            } else {
                                var keyLists = Object.keys(value);
                                keyLists.forEach(function (key) {
                                    me.userMessages[value[key].email] = value[key].message
                                    // if(value[key].message != 'chat'){
                                    //     me.userMessagesChat[value[key].email] = value[key].message
                                    // } 
                                })
                            }
                        }
                        
                        me.userMessages.__ob__.dep.notify()
                    })

                    if (!this.classInfo.openClass) {
                        me.setUserImages();
                    }

                    await this.loadLabStatus();

                    if (this.labInfo.tool == 'ide') {
                        var userList = [];
                        Object.keys(this.classInfo.groupedUsers).forEach(function (key) {
                            me.classInfo.groupedUsers[key].users.forEach(function (user) {
                                userList.push(user.email)
                            })
                        })

                        setInterval(async function () {
                            var podList = await me.getPodList();
                            podList.forEach(function (pod) {
                                if (pod.metadata.name.includes('labs-') && pod.metadata.labels.environment == "labs") {
                                    me.$set(me.ideStatus, pod.metadata.labels.userId, pod.status.phase)
                                }
                            })
                        }, 3000)
                    }

                } catch(e){
                    alert(e.message)
                }
                
            },
            addIndividualScore() {
                var me = this
                if (!me.userScores[me.selectedUser.email])
                    me.userScores[me.selectedUser.email] = {};

                if (!me.userScores[me.selectedUser.email].score)
                    me.userScores[me.selectedUser.email].score = 0;

                // var userScore = me.userScores[me.selectedUser.email].score
                // userScore = Number(userScore)
                me.prize = Number(me.prize)

                // me.userScores[me.selectedUser.email].score = userScore + me.prize;
                me.userScores[me.selectedUser.email].score = me.userScores[me.selectedUser.email].score + me.prize;

                me.saveScore()
                me.updateBestScores()

                alert('지급 완료')
                me.prize = null;


            },
            getPodList() {
                var me = this
                return new Promise(function (resolve, reject) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods?serverUrl=${me.classInfo.serverUrl}&token=${me.classInfo.token}`).then(function (result) {
                        resolve(result.data.items)
                    }).catch(error => console.log(error));
                })

            },
            removeIndividualScore() {
                var me = this
                var userScore = me.userScores[me.selectedUser.email].score
                userScore = Number(userScore)
                me.prize = Number(me.prize)

                me.userScores[me.selectedUser.email].score = userScore - me.prize;

                me.saveScore()
                me.updateBestScores()

                alert('차감 완료')
                me.prize = null;
            },
            setUserImages() {
                var me = this
                // console.log(me.labInfo)
                try {
                    Object.keys(me.classInfo.groupedUsers).forEach(function (key, groupIdx) {
                        me.classInfo.groupedUsers[key].users.forEach(async function (user, userIdx) {
                            var userInfo = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`enrolledUsers/${user.email.replace(".","_")}`))
                            if(!userInfo){
                                var userInfo = await me.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.getOldClassPath(`enrolledUsers/${user.email.replace(".","_")}`))
                            }
                            if(userInfo){
                                user.photoURL = userInfo.photoURL;
                            }
                        })
                    })
                } catch (e) {
                    console.log(e.message)
                }
            },
            getHashCode(email) {
                var me = this
                var lab = me.labId;
                if (!email) {
                    email = me.selectedUser.email;
                }
                if (me.labInfo.independent) {
                    // lab 별로
                    var hashPath = me.getClassPath('labs/' + lab + '/' + email);
                    return me.hashCode(hashPath)
                } else {
                    var hashPath = me.getClassPath(email);
                    return me.hashCode(hashPath);
                }
            },
            async loadAllUserResults() {
                var me = this
                try {
                    var userList = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo`))

                    if(!userList[me.myId.replace(/\./gi, '_')]){
                        var userInfo = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/${me.myId.replace(/\./gi, '_')}`))
                        if(userInfo){
                            me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.myId.replace(/\./gi, '_')}`), userInfo)
                        }
                    }

                    // Object.keys(obj).forEach(function(key){
                    //     // console.log(obj, key)
                    //     var userEmail = key.replace('_', '.')
                    //     if(obj[key].checkpointResults){
                    //         if (typeof obj[key].checkpointResults == "string") {
                    //             var checkpoints = JSON.parse(obj[key].checkpointResults)
                    //         } else {
                    //             var checkpoints = obj[key].checkpointResults
                    //         }
                    //         if(!checkpoints){
                    //             checkpoints = null
                    //         }
                    //         me.loadUserResult(userEmail, checkpoints)
                    //     }
                    
                    //     // attendance
                    //     if (me.userResults[userEmail]) {
                    //         if (me.userResults[userEmail].passInfo && me.userResults[userEmail].passInfo.basicPassed == 0) {
                    //             me.userResults[userEmail].passMessage = '출석'
                    //             me.userResults[userEmail].attendance = true
                    //         }
                    //     } else {
                    //         me.userResults[userEmail] = {}
                    //         me.userResults[userEmail].passMessage = '출석'
                    //         me.userResults[userEmail].attendance = true
                    //     }
                    //     me.calculateGroupStatus();
                    // })


                    me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo`), null, function (data) {
                        if(data){
                            var userEmail = data.key.replaceAll('_', '.')
                            if(data.checkpointResults){
                                if (typeof data.checkpointResults == "string") {
                                    var checkpoints = JSON.parse(data.checkpointResults)
                                } else {
                                    var checkpoints = data.checkpointResults
                                }
                                if(!checkpoints){
                                    checkpoints = null
                                }
                                me.loadUserResult(userEmail, checkpoints)
                            }
                        
                            // attendance
                            if (me.userResults[userEmail]) {
                                if (me.userResults[userEmail].passInfo && me.userResults[userEmail].passInfo.basicPassed == 0) {
                                    me.userResults[userEmail].passMessage = '출석'
                                    me.userResults[userEmail].attendance = true
                                }
                            } else {
                                me.userResults[userEmail] = {}
                                me.userResults[userEmail].passMessage = '출석'
                                me.userResults[userEmail].attendance = true
                            }
                            me.calculateGroupStatus();
                        } 
                        
                    })


                    me.watch_changed('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo`), function (data, key) {
                        if(data){
                            var userEmail = key.replaceAll('_', '.')
                            if(data.checkpointResults){
                                if (typeof data.checkpointResults == "string") {
                                    var checkpoints = JSON.parse(data.checkpointResults)
                                } else {
                                    var checkpoints = data.checkpointResults
                                }
                                if(!checkpoints){
                                    checkpoints = null
                                }
                                me.loadUserResult(userEmail, checkpoints)
                            }
                        
                            // attendance
                            if (me.userResults[userEmail]) {
                                if (me.userResults[userEmail].passInfo && me.userResults[userEmail].passInfo.basicPassed == 0) {
                                    me.userResults[userEmail].passMessage = '출석'
                                    me.userResults[userEmail].attendance = true
                                }
                            } else {
                                me.userResults[userEmail] = {}
                                me.userResults[userEmail].passMessage = '출석'
                                me.userResults[userEmail].attendance = true
                            }
                            me.calculateGroupStatus();
                        } 
                        
                    })

                    me.userResults.__ob__.dep.notify()

                } catch (e) {
                    console.log(e)
                }
            },

            async selectUser(user) {
                if(!this.openWideScreen || this.notSelectUser) {
                    return false
                }
                if(this.userMessagesStatus[user.email] == 'new'){
                    if(this.isAdmin || this.isTeacher){
                        this.userMessagesStatus[user.email] = 'old'
                    }
                }
                this.selectedUser = user;
                this.tool.result = undefined;
                window.scrollTo(0,0)
            },
            unselectUser() {
                this.tab = 0;
                this.selectedUser = null;
            },
            async loadLabInfo() {
                try {
                    this.labInfo = await this.getLabInfo();
                    window.document.title = this.labInfo.labName

                } catch(e){
                    alert(e.message)
                }
                
            },
            initLabIdeAll() {
                var me = this;
                var userList = [];
                Object.keys(me.classInfo.enrolledUsersList).forEach(function (user) {
                    userList.push(me.classInfo.enrolledUsersList[user].email)
                })
                // alert(JSON.stringify(userList))
                userList.forEach(function (userEmail) {
                    me.startIDE(userEmail)
                    // 아래 remakeNameSpace 함수는 namespace가 정상적으로 생성안될때 주석해제하여 사용하면 됨.
                    me.remakeNameSpace(userEmail)
                })
            },
            async loadLabStatus() {
                var me = this;

                me.getLabStatus(this.labId).then(labStatus => {
                    this.labStatus = labStatus
                });
                // this.labStatus = await me.getLabStatus(this.labId);

                var scores = await this.getObject('storage://labs-msaez.io/' + me.rootPath + me.getClassPath(`userScores.json`));
                if (scores) {
                    this.userScores = scores;
                    this.showScore();
                }

            },
            async loadToolResult() {
                var me = this
                if (me.selectedUser)
                    try {
                        if (me.labInfo.tool == 'ide') {
                            var result = await me.getString('storage://labs-msaez.io/' + me.rootPath + me.getClassPath(`labs/${me.labId}/${me.selectedUser.email}/result.log`))
                        } else {
                            var result = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/toolResult`))
                            if(!result){
                                var result = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`labs/${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/toolResult`))
                            }
                        }
                        this.tool.result = result
                        this.tool.__ob__.dep.notify()
                    } catch (e) {
                        console.log(e)
                    }
            },
            async loadClassInfo() {
                // this.classInfo = await this.getClassInfo();
                //refactor needed ------- 심각
                if (this.classInfo && this.classInfo.teacherId == this.myId) {
                    if (!this.isAdmin) {
                        window.localStorage['authorized'] = 'admin';  // - 한번 강사는 남의 강의에도 들가기만 하면 끝까지 강의가 가능함.
                        window.location.reload();
                    }
                }

                this.classInfo.__ob__.dep.notify();
            },
            async clearStorming(selectedUser) {
                var me = this
                // console.log(selectedUser)
                var startingArtifact = await this.getObject(`storage://labs-msaez.io/${me.rootPath}${me.courseId}/labs/${me.labId}/${me.labInfo.startArtifact}`)
                if(me.labId) {
                    me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${selectedUser.email.replace(/\./gi, '_')}/toolResult`), startingArtifact);
                }
            },
            async loadUserResult(userId, userResult) {
                var me = this
                try {
                    // console.log(me.labInfo.checkPoints)
                    // var userResult = await this.getObject(
                    //     me.getClassPath(`labs/${this.labId}/${userId}/checkpointResults.json`)
                    // );
                    if (userResult == null && userId == me.myId && me.labId) { //== me.myId
                        // me.putObject(me.getClassPath(`labs/${this.labId}/${me.userId}/checkpointResults.json`), me.labInfo.checkPoints)
                        this.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${userId.replace(/\./gi, '_')}/checkpointResults`), me.labInfo.checkPoints)
                        userResult = me.labInfo.checkPoints
                    }

                    var copyCheckPoints = JSON.parse(JSON.stringify(me.labInfo.checkPoints));

                    copyCheckPoints.forEach(function (copyCheckPoint, idx) {
                        if (userResult != null) {
                            userResult.forEach(function (result) {
                                if (copyCheckPoint.id == null) {
                                    if (copyCheckPoint.text == result.text) {
                                        copyCheckPoints[idx].status = result.status
                                    }
                                } else if (copyCheckPoint.id == result.id) {
                                    copyCheckPoints[idx].status = result.status
                                }
                            })
                        }
                    })

                    this.userResults[userId] = copyCheckPoints;

                    var passInfo = this.getPassInfo(userId);

                    if (passInfo) {
                        this.userResults[userId].connection = true
                        this.userResults[userId].attendance = true
                        if (passInfo.basicPassed == 0) {
                            this.userResults[userId].passMessage = '접속'
                        } else {
                            if (passInfo.advancedPassed) {
                                this.userResults[userId].passMessage = passInfo.advancedPassed + "/" + passInfo.basicPassed + "/" + passInfo.all;
                            } else {
                                this.userResults[userId].passMessage = passInfo.basicPassed + "/" + passInfo.all;
                            }
                        }

                        this.userResults[userId].passInfo = passInfo;
                        if (passInfo.advancedPassed) {
                            this.userResults[userId].basicPassed = (passInfo.basicPassed == passInfo.basicAll);
                            this.userResults[userId].allPassed = ((passInfo.basicPassed + passInfo.advancedPassed) == passInfo.all);
                        } else {
                            this.userResults[userId].allPassed = (passInfo.basicPassed == passInfo.all);
                        }

                    }

                    var passCheck = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/classes/' + me.classId + '/labs/' + me.labId + "/userInfo/" + userId.replace(/\./gi, '_') + "/passed");
                    
                    if(passCheck){
                        this.userResults[userId].labPass = true
                    }

                    this.calculateGroupStatus();

                } catch (e) {

                    console.log(e)
                    // if (e.code == "NoSuchKey") {
                    //     // 만약 파일이 없는 에러일 경우 랩 info의 파일을 올려준다.
                    //     await me.putObject(`${this.courseId}/classes/running/${this.classId}/labs/${this.labId}/${userId}/checkpointResults.json`, me.labInfo.checkPoints)
                    // }
                }
            },
            calculateGroupStatus() {
                var me = this;
                Object.keys(me.classInfo.groupedUsers).forEach(group => {
                    var basicPassedMemberCount = 0;
                    var allPassedMemberCount = 0;
                    var attendanceMemberCount = 0;
                    var connectionMemberCount = 0;
                    var memberCount = 0;

                    me.classInfo.groupedUsers[group].users.forEach(user => {
                        if (!user.email.includes('@uengine.org')) {
                            memberCount++;
                            if (me.userResults[user.email] && me.userResults[user.email].connection) {
                                connectionMemberCount++;
                            }
                            if (me.userResults[user.email] && me.userResults[user.email].attendance) {
                                attendanceMemberCount++;
                            }
                            if (me.userResults[user.email] && me.userResults[user.email].basicPassed) {
                                basicPassedMemberCount++;
                            }
                            if (me.userResults[user.email] && me.userResults[user.email].allPassed) {
                                allPassedMemberCount++;
                            }
                        }
                    })

                    me.classInfo.groupedUsers[group].allPassedMemberCount = allPassedMemberCount;
                    me.classInfo.groupedUsers[group].basicPassedMemberCount = basicPassedMemberCount;
                    me.classInfo.groupedUsers[group].attendanceMemberCount = attendanceMemberCount;
                    me.classInfo.groupedUsers[group].connectionMemberCount = connectionMemberCount;
                    me.classInfo.groupedUsers[group].memberCount = memberCount;
                });
                this.classInfo.groupedUsers.__ob__.dep.notify();
            },
            async sendCheckPoints(email, item) {
                var me = this
                try {
                    // item.status = !item.status;
                    var tmpArray = []

                    me.userResults[email].forEach(function (item) {
                        tmpArray.push(item)
                    })
                    if(me.labId){
                        this.putObject(
                            'db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${email.replace(/\./gi, '_')}/checkpointResults`)
                            , tmpArray
                        );
                    }

                } catch(e){
                    alert(e.message)
                }
                
            },
            getPassInfo(userId) {
                try {
                    var checkpoints = this.userResults[userId];
                    if (!checkpoints)
                        return null;
                    else {
                        var advancedPassed = 0
                        var basicPassed = 0;
                        var basicAll = 0;

                        for (var i = 0; i < checkpoints.length; i++) {
                            if (checkpoints[i].type == 'advanced') {
                                if (checkpoints[i].status) advancedPassed++;
                            } else {
                                basicAll++;
                                if (checkpoints[i].status) basicPassed++;
                            }

                        }
                        if (basicAll == checkpoints.length) {
                            return {
                                basicPassed: basicPassed,
                                all: checkpoints.length
                            }
                        } else {
                            return {
                                advancedPassed: advancedPassed,
                                basicPassed: basicPassed,
                                basicAll: basicAll,
                                all: checkpoints.length
                            };
                        }

                    }

                } catch(e){
                    alert(e.message)
                }
                
            },

            showScore() {
                var me = this;
                me.showingScores = !me.showingScores;
                if (!me.showingScores) {
                    me.showingScores = true;
                }
                me.updateBestScores()
            },

            updateBestScores() {
                var me = this;
                var bestScores = [];
                //calculate 1,2,3rd ranks
                Object.keys(me.userScores).forEach(email => {
                    var score = me.userScores[email].score;
                    bestScores.push(score)
                });

                bestScores.sort(function (a, b) {
                    return b - a
                });

                if (bestScores.length > 0)
                    me.bestScores = bestScores.slice(0, 3);


            },


            deposit(score) {
                var me = this;

                var scoreAdded = false;

                Object.keys(me.classInfo.groupedUsers).forEach(
                    function (key) {

                        if (me.classInfo)
                            me.classInfo.groupedUsers[key].users.forEach(user => {
                                var email = user.email;

                                //if(partialScore>0)
                                scoreAdded = true; //-- debug point 1

                                if
                                ((!me.quizAnswer && me.userResults[email] && me.userResults[email].passInfo && me.userResults[email].passInfo.basicPassed > 0)
                                    ||
                                    (me.quizAnswer && me.userMessagesSnapshot[email] && me.userMessagesSnapshot[email].toLowerCase() == me.quizAnswer.toLowerCase())
                                ) {
                                    scoreAdded = true; //-- debug point 2

                                    if (!me.userScores[email])
                                        me.userScores[email] = {};

                                    if (!me.userScores[email].score)
                                        me.userScores[email].score = 0;


                                    var partialScore = me.quizAnswer ? 1 : me.userResults[email].passInfo.basicPassed / me.userResults[email].passInfo.all

                                    if (typeof me.userScores[email].score == 'string') me.userScores[email].score = Number(me.userScores[email].score);
                                    me.userScores[email].score += partialScore;
                                    me.newUserScores[email].score += partialScore;

                                    me.updateBestScores()
                                }
                            })
                    })

                // console.log('userScores: ', me.userScores)

                if (scoreAdded)

                    me.totalDeposited++;  // no problem here

                me.userScores.__ob__.dep.notify()


            },
            coinAllDropped() {
                var me = this;
                if (me.resolveDepositPromise) {

                    me.resolveDepositPromise();
                    me.resolveDepositPromise = null;

                }

            },

            async onQuizAnswered(answerAndPrize) {
                this.quizAnswer = answerAndPrize.answer;
                this.pollDialog = false;
                this.userMessagesSnapshot = JSON.parse(JSON.stringify(this.userMessages));
                await this.giveScore(this.prize);

                this.saveScore()
            },
            async clearLab(selectUser) {
                var me = this
                try {
                    var hashName = 'labs-' + this.getHashCode()
                    var lab = me.labId;

                    if (me.labInfo.independent) {
                        // lab 별로
                        var hashPath = me.getClassPath('labs/' + lab + '/' + selectUser.email);
                        var filePath = hashPath
                    } else {
                        // 클래스 단위로
                        var hashPath = me.getClassPath(selectUser.email);
                        var filePath = me.getClassPath('labs/' + selectUser.email);
                    }
                    var ideUrl;
                    if (me.classInfo.ideUrl) {
                        ideUrl = me.classInfo.ideUrl;
                    } else {
                        ideUrl = me.getTenantId();
                    }
                    var params = new URLSearchParams();
                    params.append('filePath', `labs-${me.getTenantId()}/${filePath}`);
                    params.append('lab', `${lab}`);
                    if (!me.maintainFiles) {
                        me.$http.delete(`${me.getProtocol()}//file.${ideUrl}/api/delete`, {
                            data: {
                                filePath: `labs-${me.getTenantId()}/${filePath}`,
                                lab: lab,
                                hashName: hashName
                            },
                            headers: {'Content-Type': 'application/json'}
                        });
                    }

                    if (!me.maintainConfig) {
                        var course = me.courseId;
                        var clazz = me.classId;
                        var clazzName = clazz
                        me.$http.delete(`${me.getProtocol()}//file.${ideUrl}/api/deleteConfig`, {
                            data: {
                                "tenant": me.getTenantId(),
                                "course": course,
                                "clazz": clazzName,
                                "userId": selectUser.email.replace("@", "_"),
                                "hashName": hashName
                            },
                            headers: {'Content-Type': 'application/json'}
                        });
                    }
                    me.deleting = true
                    this.$http.delete(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}?serverUrl=${me.classInfo.serverUrl}&token=${me.classInfo.token}`);
                    selectUser.deleteInterval = setInterval(
                        function () {
                            me.$http.get(`http://api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status?serverUrl=${me.classInfo.serverUrl}&token=${me.classInfo.token}`).then(function () {
                            }).catch(function (e) {
                                // 에러가 나면 없는 pod 결과가 경우임. 따라서 완전히 제거된 상태
                                clearInterval(selectUser.deleteInterval)
                                selectUser.deleteInterval = undefined
                                me.clearDialog = false
                                me.deleting = false
                            })
                        }, 2000)
                    var filePath = me.getClassPath('labs/' + this.labId + '/' + this.selectedUser.email);

                } catch(e){
                    alert(e.message)
                }
                
            },
            getListRecursive(path, metadata) {
                var me = this;
                var listObj = [];

                return;
            },
            async startLab(status) {
                var me = this;
                try {
                    if(status == 'READY'){
                        await this.delete('storage://labs-msaez.io/running/' + me.getClassPath(`labs/${me.labId}/status/READY`))
                    }
                    await this.putString('storage://labs-msaez.io/running/' + me.getClassPath(`labs/${me.labId}/status/started`), 'started')
                    this.labStatus.status = 'started'
                    this.labStatus.startedAt = new Date()

                } catch(e){
                    alert(e.message)
                }
                
            },

            async completeLab() {
                var me = this;
                await me.giveScore(parseInt(prompt("스코어를 입력하세요")));

                try {
                    await me.delete('storage://labs-msaez.io/running/' + me.getClassPath(`labs/${me.labId}/status/started`))
                    await me.putString('storage://labs-msaez.io/running/' + me.getClassPath(`labs/${me.labId}/status/READY`), 'READY')
                    me.saveScore();
                    me.labStatus.status = 'READY'
                    me.labStatus.completedAt = new Date();
                    me.resetScoreTime();
                } catch (e) {
                    alert("강의 결과 저장에 실패했습니다:" + e.message)
                    console.log(e)
                }
            },

            saveScore() {
                var me = this

                Object.keys(me.newUserScores).forEach(function (email){
                    console.log(email, me.newUserScores[email])
                    if(me.newUserScores[email].score > 0) {
                        me.scoreChangedUserId = me.newUserScores[email].uuId
                        me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`) + me.newUserScores[email].uuId + '/score', me.newUserScores[email].score);
                    }
                })
            },
            giveScore(score) {
                var me = this;
                me.showScore();

                score = Number.parseInt("" + score);
                this.$refs.coinDrop.drop(score);
                
                me.isScoreSettingDone = true

                return new Promise((resolve, reject) => {
                    me.resolveDepositPromise = resolve;
                });
                

            }


        }
    };
</script>
<style lang="scss" scoped>
    ::v-deep .v-skeleton-loader.v-skeleton-loader--is-loading {
        .v-skeleton-loader__image {
            height: 100%;
        }
    }
</style>
<style scoped>
    .theme--light.v-btn--active:before,
    .theme--light.v-btn--active:hover:before,
    .theme--light.v-btn:focus:before {
        opacity: 0;
    }
    .theme--light.v-btn--active:hover::before {
        opacity: 0.05;
    }
</style>
<style>
    .dot {
        height: 10px;
        width: 10px;
        margin-top: 32px;
        right: -8px;
        border-radius: 50%;
        position: absolute;
    }

    .chatBubble {
        display: inline-flex;
        width: auto;
        word-break: break-word !important;
        border-radius: 20px;
        font-size: 15px;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px;
    }

    .balloon_blue:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        border-top-color: #2c98f0;
        border-bottom: 0;
        border-left: 0;
        margin-left: 25px;
        margin-bottom: 59px;
    }

    .balloon_red:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        border-top-color: #f2453d;
        border-bottom: 0;
        border-left: 0;
        margin-left: 25px;
        margin-bottom: 59px;
    }
    .balloon_grey:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 9px solid transparent;
        border-top-color: #9e9e9e;
        border-bottom: 0;
        border-left: 0;
        margin-left: 25px;
        margin-bottom: 59px;
    }


    #user-mouseover:hover{background-color: #E0ECF8;
                            cursor: pointer;}

/* width 값에 따른 버튼 스타일 */
    @media only screen and (max-width:1280px){
        
    }
    @media only screen and (max-width:1180px){
        .btn-screen-view{display:none;}
    }
    @media only screen and (max-width:1080px){
        .btn-batch-execution{display:none;}
    }
    @media only screen and (max-width:980px){
        .btn-score{display:none;}
    }
    @media only screen and (max-width:880px){
        .btn-group{display:none;}
    }
    @media only screen and (max-width:780px){
        .btn-lab-list{display:none;}
    }
    @media only screen and (max-width:680px){
        .btn-answer{display:none;}
    }


/* width 값에 따른 리스트 스타일 */
    
    .class-btn-menu,
    .class-btn-answer,
    .class-btn-batch-execution,
    .class-btn-lab-list,
    .class-btn-group,
    .class-btn-score,
    .class-btn-atch-execution,
    .class-btn-screen-view,
    .class-btn-end,
    .class-btn-re-start{
        display:none;
    }

/* width 값에 따른 리스트 스타일 */

    @media only screen and (max-width:1280px){
        .class-btn-menu{display:flex;}
    }
    @media only screen and (max-width:1180px){
        .class-btn-screen-view{display:flex;}
    }
    @media only screen and (max-width:1080px){
        .class-btn-batch-execution{display:flex;}
    }
    @media only screen and (max-width:980px){
        .class-btn-score{display:flex;}
    }
    @media only screen and (max-width:880px){
        .class-btn-group{display:flex;}
    }
    @media only screen and (max-width:780px){
        .class-btn-lab-list{display:flex;}
    }
    @media only screen and (max-width:680px){
        .class-btn-answer{display:flex;}
    }

    .tiblock {
        align-items: center;
        display: flex;
        height: 17px;
    }

    .ticontainer .tidot {
        background-color: #2c98f0;
    }

    .tidot {
        -webkit-animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
        border-radius: 2px;
        display: inline-block;
        height: 4px;
        margin-right: 2px;
        width: 4px;
    }

    @-webkit-keyframes mercuryTypingAnimation{
    0%{
    -webkit-transform:translateY(0px)
    }
    28%{
    -webkit-transform:translateY(-5px)
    }
    44%{
    -webkit-transform:translateY(0px)
    }
    }

    .tidot:nth-child(1){
    -webkit-animation-delay:200ms;
    }
    .tidot:nth-child(2){
    -webkit-animation-delay:300ms;
    }
    .tidot:nth-child(3){
    -webkit-animation-delay:400ms;
    }
    
</style>

