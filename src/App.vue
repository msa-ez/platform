<template>
    <div v-if="ideLoading">
        <!-- ide loading page-->
        <router-view></router-view>
    </div>
    <v-app id="inspire"
           @keydown.esc="overlay = false"
           style="overflow: hidden"
           v-else
    >
        <!-- v-if="showAppBar" -->
        <v-app-bar
            :clipped-left="$vuetify.breakpoint.lgAndUp"
            elevation="0"
            app
            fixed
            class="gs-main-top-app-bar"
            :style="isRootPage ? 'background-color: white !important;' : ''"
        >

            <v-toolbar-title class="ml-0 pl-3" style="height: 64px; width: 140px; overflow: visible;">
                <v-layout>
                    <div v-if="inSideRounge">
                        <v-icon @click="moveToCourses()" style="font-size: 30px; margin-top: 20px; margin-right: 10px;">mdi-arrow-left</v-icon>
                        <v-icon v-if="isMobile" @click="naviControll()" style="font-size: 30px; margin-top: 20px; margin-right: 10px;">mdi-format-list-bulleted</v-icon>
                    </div>
                    <div>
                        <LogoView></LogoView>
                    </div>
                    <!--                    <lab-portal></lab-portal>-->
                    <!--<div class="font-weight-bold" style="font-size: 16px; margin-top: 24px"> by uEngine</div>-->
                </v-layout>
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <!-- elcetron -->
            <div v-if="labInfo && labInfo.tool == 'url' && inSideElectron">
                <v-icon style="margin-right: 3px;" @click="goBack()">mdi-arrow-left</v-icon>
                <v-icon style="margin-right: 5px;" @click="goForward()">mdi-arrow-right</v-icon>
                <v-icon style="margin-left:5px; margin-right: 5px;"
                        @click="reLoadPage()"
                        @contextmenu.prevent="contextOpen($event)"
                >
                    mdi-reload
                </v-icon>
            </div>

            <v-text-field
                    v-if="labInfo && labInfo.tool == 'url' && inSideElectron"
                    style="margin-top: 25px; width: 400px;"
                    filled
                    rounded
                    dense
                    v-model="urlText"
                    @keydown.enter="sendUrl(urlText)"
            >
            </v-text-field>
            <div v-if="labInfo && labInfo.tool == 'url' && inSideElectron">
                <v-icon style="margin-left: 5px;" @click="screenPlus()">mdi-plus</v-icon>
                <v-icon style="margin-left: 5px;" @click="screenMinus()">mdi-minus</v-icon>
            </div>
            
            <v-row style="width:100%; height:57px; justify-content: center;" v-else-if="inCourse && !showNewButton" dense>
                <v-text-field
                        class="learn-main-search"
                        v-model="search"
                        outlined
                        autofocus
                        label="Search Class"
                ></v-text-field>
            </v-row>
            <!--             particiate Lists-->
            <div style="width: 15%;">
                <participant-icons
                    v-if="showParticipantIcons"
                    :lists="participantLists"
                    @openParticipantPanel="openParticipantPanel"
                    class="clear-icon"
                >
                </participant-icons>
            </div>

            <v-btn v-if="inCourse && !showNewButton"
                @click="addNewClass()"
                v-on="on"
                v-bind="attrs"
                text
                elevation="0"
                style="
                font-weight: 700;
                margin: 27px 140px 0px 0px;
                padding: 0px 5px 0px 5px !important;"
            >
                <v-icon style="margin: -3px 1px 0px 0px;" :size="26">mdi-file-plus</v-icon>
                신규 강의 생성
            </v-btn>
            <!-- 이벤트 스토밍만 열던 기존 버튼 -->
            <!-- <v-btn v-if="showNewButton"
                class="making-main-nav-modeling-is-mobile"
                text
                style="font-size:16px; margin-top:8px; font-weight: 700; padding:0px;"
                :style="isLogin ? 'margin-right:145px' : 'margin-right:130px;'"
                @click.native="moveToModel('es')"
            ><v-icon style="margin-top:-3px;">mdi-file-plus</v-icon>
            {{$t('making.title')}}
            </v-btn> -->
            <!-- 만들기 클릭했을 때 열리던 다이얼로그 -->
            <v-dialog v-model="makingDialog"
                max-width="90%"
            >
                <!-- 만들기 버튼 -->
                <!-- <template v-slot:activator="{ on, attrs }">
                    <v-btn class="making-main-nav-modeling-is-mobile cp-main-nav-modeling-is-mobile"
                        :class="isForeign ? 'isForeign-create-main-nav-is-mobile' : 'isForeign-not-create-main-nav-is-mobile'"
                        v-on="on"
                        v-bind="attrs"
                        text
                        :style="isForeign ? {'margin-right': '300px', 'margin-top': '4px'} : 'margin-right: 245px'"
                    >
                        <v-icon style="margin:0px 3px 0px 0px;" :size="26">mdi-file-plus</v-icon>
                        <div :style="isForeign ? { marginTop: '-2px' } : { marginTop: '2px' }">{{$t('making.title')}}</div>
                    </v-btn>
                </template> -->
                <v-card style="height:85vh; overflow:auto;">
                    <!-- 만들기 설계(design) -->
                    <div>
                        <v-row class="ma-0 pa-0 making-sub-title" align="center" style="display: flex; align-items: center; padding: 20px 0px 0px 20px !important">
                            <div v-if="design.some(item => item.tagStatus === 'Stable') || showBeta">
                                {{$t('making.design')}}
                            </div>
                            <!-- 베타보기 칩 (ex. 여러 다른 모델링등 쿠버네티스 등등) -->
                            <!-- <v-chip @click="toggleBeta" style="margin-left: 16px; cursor: pointer;" color="primary" outlined>
                                <v-icon left>{{ showBeta ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                                {{ showBeta ? $t('app.hideBeta') : $t('app.showBeta') }}
                            </v-chip> -->
                        </v-row>
                        <v-row style="margin:0px;">
                            <v-col class="making-col"
                                v-for="(item, index) in design"
                                :key="index"
                                lg="4"
                                md="4"
                                sm="6"
                                xs="12"
                            >
                                <v-card v-if="item.tagStatus === 'Stable' || (item.tagStatus === 'Beta' && showBeta)"
                                    class="mx-auto"
                                    outlined
                                    style="padding:15px; height:100%; position: relative;"
                                >
                                    <v-row class="ma-0">
                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                            {{$t(item.title)}}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <v-chip v-if="item.tagStatus === 'Stable'" class="gs-stable-chip">
                                            {{ item.tagStatus }}
                                        </v-chip>
                                        <v-chip v-else outlined color="orange">{{ item.tagStatus }}</v-chip>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-img @click.native="moveToModel(item.type)"
                                                class="cp-create-model-img"
                                                :src="item.image"
                                                style="height:150px; margin:10px 0px; cursor:pointer;"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                    <div style="font-size:14px; color:#757575; margin: 10px 0px 30px 0px;">{{ $t(item.subtitle) }}</div>
                                    <v-card-actions style="position: absolute; right:0px; bottom:0px;">
                                        <v-spacer></v-spacer>
                                        <v-btn depressed text class="making-btn" @click="goTutorials(item.type)" :disabled="item.disabled">{{ $t('tools.tutorial-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" @click="goVideo(item.type)" :disabled="item.disabled">{{ $t('tools.video-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" style="color:#1E88E5;"
                                            @click.native="moveToModel(item.type)">{{ $t('tools.create-btn') }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- 만들기 프로젝트(project) -->
                    <!-- <div>
                        <div v-if="makingProject.some(item => item.tagStatus === 'Stable') || showBeta" class="making-sub-title">{{$t('making.project')}}</div>
                        <v-row
                            style="margin:0px;"
                        >
                            <v-col class="making-col"
                                v-for="(item,index) in makingProject"
                                :key="index"
                                lg="4"
                                md="4"
                                sm="6"
                                xs="12"
                            >
                                <v-card v-if="item.tagStatus === 'Stable' || (item.tagStatus === 'Beta' && showBeta)"
                                    class="mx-auto"
                                    outlined
                                    style="padding:15px; height:100%; position: relative;"
                                >
                                    <v-row class="ma-0">
                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                            {{$t(item.title)}}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <v-chip v-if="item.tagStatus === 'Stable'" class="gs-stable-chip">
                                            {{ item.tagStatus }}
                                        </v-chip>
                                        <v-chip v-else outlined color="orange">{{ item.tagStatus }}</v-chip>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-img @click.native="moveToModel(item.type)"
                                                :src="item.image"
                                                style="height:150px; margin:10px 0px; cursor:pointer;"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                    <div style="font-size:14px; color:#757575; margin: 10px 0px 30px 0px;">{{ $t(item.subtitle) }}</div>
                                    <v-card-actions style="position: absolute; right:0px; bottom:0px;">
                                        <v-spacer></v-spacer>
                                        <v-btn depressed text class="making-btn" @click="goTutorials(item.type)" :disabled="item.disabled">{{ $t('tools.tutorial-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" @click="goVideo(item.type)" :disabled="item.disabled">{{ $t('tools.video-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" style="color:#1E88E5;"
                                            @click.native="moveToModel(item.type)">{{ $t('tools.create-btn') }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div> -->

                    <!-- 만들기 기획(planning) -->
                    <div>
                        <div v-if="planning.some(item => item.tagStatus === 'Stable') || showBeta" class="making-sub-title">{{$t('making.planning')}}</div>
                        <v-row
                            style="margin:0px;"
                        >
                            <v-col class="making-col"
                                v-for="(item,index) in planning"
                                :key="index"
                                lg="3"
                                md="3"
                                sm="6"
                                xs="12"
                            >
                                <v-card v-if="item.tagStatus === 'Stable' || (item.tagStatus === 'Beta' && showBeta)"
                                    class="mx-auto"
                                    outlined
                                    style="padding:15px; height:100%; position: relative;"
                                >
                                    <v-row class="ma-0">
                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                            {{$t(item.title)}}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <v-chip v-if="item.tagStatus === 'Stable'" class="gs-stable-chip">
                                            {{ item.tagStatus }}
                                        </v-chip>
                                        <v-chip v-else outlined color="orange">{{ item.tagStatus }}</v-chip>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-img @click.native="moveToModel(item.type)"
                                                :src="item.image"
                                                style="height:150px; margin:10px 0px; cursor:pointer;"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                    <div style="font-size:14px; color:#757575; margin: 10px 0px 30px 0px;">{{ $t(item.subtitle) }}</div>
                                    <v-card-actions style="position: absolute; right:0px; bottom:0px;">
                                        <v-spacer></v-spacer>
                                        <v-btn depressed text class="making-btn" @click="goTutorials(item.type)" :disabled="item.disabled">{{ $t('tools.tutorial-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" @click="goVideo(item.type)" :disabled="item.disabled">{{ $t('tools.video-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" style="color:#1E88E5;"
                                            @click.native="moveToModel(item.type)">{{ $t('tools.create-btn') }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- 마이그레이션  -->
                    <div>
                        <div v-if="migration.some(item => item.tagStatus === 'Stable') || showBeta" class="making-sub-title">{{$t('making.migration')}}</div>
                        <v-row
                            style="margin:0px;"
                        >
                            <v-col class="making-col"
                                v-for="(item,index) in migration"
                                :key="index"
                                lg="4"
                                md="4"
                                sm="6"
                                xs="12"
                            >
                                <v-card v-if="item.tagStatus === 'Stable' || (item.tagStatus === 'Beta' && showBeta)"
                                    class="mx-auto"
                                    outlined
                                    style="padding:15px; height:100%; position: relative;"
                                >
                                    <v-row class="ma-0">
                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                            {{$t(item.title)}}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <v-chip v-if="item.tagStatus === 'Stable'" class="gs-stable-chip">
                                            {{ item.tagStatus }}
                                        </v-chip>
                                        <v-chip v-else outlined color="orange">{{ item.tagStatus }}</v-chip>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-img @click.native="moveToModel(item.type)"
                                                :src="item.image"
                                                style="height:150px; margin:10px 0px; cursor:pointer;"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                    <div style="font-size:14px; color:#757575; margin: 10px 0px 30px 0px;">{{ $t(item.subtitle) }}</div>
                                    <v-card-actions style="position: absolute; right:0px; bottom:0px;">
                                        <v-spacer></v-spacer>
                                        <v-btn depressed text class="making-btn" @click="goTutorials(item.type)" :disabled="item.disabled">{{ $t('tools.tutorial-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" @click="goVideo(item.type)" :disabled="item.disabled">{{ $t('tools.video-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" style="color:#1E88E5;"
                                            @click.native="moveToModel(item.type)">{{ $t('tools.create-btn') }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- 만들기 운영(development) -->
                    <div>
                        <div v-if="development.some(item => item.tagStatus === 'Stable') || showBeta" class="making-sub-title">{{$t('making.operation')}}</div>
                        <v-row
                            style="margin:0px;"
                        >
                            <v-col class="making-col"
                                v-for="(item,index) in development"
                                :key="index"
                                lg="4"
                                md="4"
                                sm="6"
                                xs="12"
                            >
                                <v-card  v-if="item.tagStatus === 'Stable' || (item.tagStatus === 'Beta' && showBeta)"
                                    class="mx-auto"
                                    outlined
                                    style="padding:15px; height:100%; position: relative;"
                                >
                                    <v-row class="ma-0">
                                        <div style="font-weight: 500; font-size:18px; color:black;">
                                            {{$t(item.title)}}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <v-chip v-if="item.tagStatus === 'Stable'" class="gs-stable-chip">
                                            {{ item.tagStatus }}
                                        </v-chip>
                                        <v-chip v-else outlined color="orange">{{ item.tagStatus }}</v-chip>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12">
                                            <v-img @click.native="moveToModel(item.type)"
                                                :src="item.image"
                                                style="height:150px; margin:10px 0px; cursor:pointer;"
                                            ></v-img>
                                        </v-col>
                                    </v-row>
                                    <div style="font-size:14px; color:#757575; margin: 10px 0px 30px 0px;">{{ $t(item.subtitle) }}</div>
                                    <v-card-actions style="position: absolute; right:0px; bottom:0px;">
                                        <v-spacer></v-spacer>
                                        <v-btn depressed text class="making-btn" @click="goTutorials(item.type)" :disabled="item.disabled">{{ $t('tools.tutorial-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" @click="goVideo(item.type)" :disabled="item.disabled">{{ $t('tools.video-btn') }}</v-btn>
                                        <v-btn depressed text class="making-btn" style="color:#1E88E5;"
                                            @click.native="moveToModel(item.type)">{{ $t('tools.create-btn') }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>
                </v-card>
            </v-dialog>

            <v-btn
                @click="navigateToSlack"
                class="question-btn"
                :class="isRootPage ? 'question-btn-hide' : ''"
                text
                elevation="0"
                color="primary"
                style="text-transform: none;"
            >
                <div style="font-weight: 700; font-size: 16px;">{{ $t('inquiry.title') }}</div>
            </v-btn>
            
            <v-btn
                v-if="!(isLogin || isGuestLogin)"
                @click="loginPage()"
                fab icon
                style="margin-right:10px"
            >
                <v-avatar
                    size="40"
                >
                    <v-icon x-large>mdi-account-circle</v-icon>
                </v-avatar>
            </v-btn>


            <v-menu
                    v-if="(isLogin || isGuestLogin)"
                    v-model="openMenu"
                    open-on-hover
                    offset-y
            >
                <template v-slot:activator="{ on }">
                    <!-- 추가 -->
                    <v-badge
                            :value="isLogin"
                            color="green"
                            :top="LoginHover"
                            :left="LoginHover"
                            :bottom="!LoginHover"
                            overlap
                            style="margin-right: 30px;"
                            transition="slide-x-transition"
                    >
                        <template v-slot:badge>
                            <div v-if="isLogin"> {{getSavedCoin}}</div>
                        </template>

                        <v-hover style="margin-right:-20px;" v-model="LoginHover">
                            <v-avatar size="40" v-on="on">
                                <div v-if="loadingMigrateHistory">
                                    <v-progress-circular
                                            indeterminate
                                            color="green"
                                    ></v-progress-circular>
                                </div>
                                <div v-else>
                                    <div v-if="userInfo && userInfo.profile">
                                        <img
                                                :src=userInfo.profile
                                                style="width:100%;"
                                        >
                                    </div>
                                    <div v-else>
                                        <v-icon x-large>mdi-account-circle</v-icon>
                                    </div>
                                </div>
                            </v-avatar>
                        </v-hover>
                    </v-badge>
                </template>


                <v-list style="width:310px;">
                    <v-list-item-group>
                        <div style="font-size: small; cursor:default; display: table-cell; padding-left:16px;">
                            <div v-if="isLogin">{{userInfo.email}} ({{userInfo.providerUid}})</div>
                            <div v-else-if="isGuestLogin">(GUEST) {{userInfo.email}}</div>
                        </div>
                        <v-divider style="margin-top: 5px;"></v-divider>
                        <v-list-item
                                v-for="(item, index) in paymentLists"
                                :key="index"
                                @click="onClickLoginMenu(item.key)"
                                class="text-reader"
                        >
                            <v-list-item-title>{{ $t(item.display) }}</v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>

        </v-app-bar>
        
        <course-navigator v-if="courseNavi && $route.path.includes('eventstorming')"
                          :value.sync="naviObject"></course-navigator>
        <v-content :style="headerFloating == true ? 'margin-top:-64px;':'margin-top:0px;'">
            <v-progress-linear v-if="progressValue" fixed indeterminate color="orange" height="10"></v-progress-linear>
            <v-container :style="labTool == 'quiz' ? 'background-color: #E3F2FD':''" fluid fill-height>
                <v-layout row wrap>
                    <v-flex xs12>
                        <router-view></router-view>

                        <!--new Terminal -->
                        <!--                        <terminal-page-->
                        <!--                                :terminal="terminal"-->
                        <!--                                :userInfo="userInfo"-->
                        <!--                                @terminalOff="terminalOff"-->
                        <!--                                @terminalOn="terminalOn"-->
                        <!--                                @snackbar="sendSnackbar"-->
                        <!--                        ></terminal-page>-->

                        <!--old Terminal -->
                        <div v-if="terminal">
                            <v-btn color="error" @click="terminalOff"
                                   style="position: fixed; height: 5%; top: 65%; right: 5px;">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>

                            <iframe
                                    v-if="terminalUrl"
                                    id="eventTerminal"
                                    :src="terminalUrl"
                                    @load="onLoad"
                                    :style="{width: terminalWidth + 'px'}"
                                    style="height:30%; right: 0; bottom: 0; display: block; position: fixed;"
                            ></iframe>

                            <div v-else>
                                <v-skeleton-loader
                                        v-bind="attrs"
                                        type="card-avatar"
                                ></v-skeleton-loader>
                            </div>
                        </div>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
        <vue-context ref="menu" @open="onOpen" @close="onClose">
            <v-list>
                <v-list-item
                        @click.prevent="onClick($event.target.innerText)"
                >
                    <v-list-item-content>
                        <v-list-item-title v-text="'강력 새로고침'"></v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </vue-context>

        <!--  refund  -->
        <v-dialog
                v-model="refundDialog"
                max-width="700px"
                @click:outside="closeRefundDialog"
        >
            <v-card style="width:100%; height: 400px;">
                <RefundItem @close="closeRefundDialog" :refundInfo="refundInfo"></RefundItem>
            </v-card>
        </v-dialog>

        <!--   ide Time -->
        <v-dialog
                v-model="openPaymentTime"
                max-width="700px"
                @click:outside="closeToolTime"
        >
            <v-card style="width:100%; height: 450px;">
                <PaymentToolTime @close="closeToolTime"></PaymentToolTime>
            </v-card>
        </v-dialog>

        <!--   Coupon && Recommend -->
        <v-dialog
                v-model="showGetCoin"
                max-width="650px"
                @click:outside="closeGetCoin"
        >
            <v-card style="width:100%; height: 200px;">
                <GetCoin @close="closeGetCoin"></GetCoin>
            </v-card>
        </v-dialog>


        <!--  설명 Dialog -->
        <v-dialog
                v-model="infoDialog"
                style="width: 700px; height: 700px;"
        >
            <v-card>
                <v-card-title class="headline">How to use EventStorming-tool?</v-card-title>

                <v-carousel
                        v-model="infoNum"
                        show-arrows="true"
                >
                    <v-carousel-item
                            v-for="(slider, i) in infoSlider"
                            :key="slider"
                            :src="slider"
                    >
                    </v-carousel-item>
                </v-carousel>

            </v-card>
        </v-dialog>


        <!--  subscriptionDialog  -->
        <v-dialog
                v-model="subscriptionDialog"
                max-width="400"
                @click:outside="closeSubscriptionDialog"
        >
            <v-card style="width:100%; height: 100%;">
                <v-row style="justify-content: space-between; margin-left: 0px; margin-right: 0px;">
                    <div class="main-title" style="margin-left: 5%; padding-top: 20px;"> 구독 구매</div>
                </v-row>
                <v-row style="margin-left: 3%; margin-right: 3%; margin-top: 3%;">
                    <SubscriptionItemTemplate @close="closeSubscriptionDialog"></SubscriptionItemTemplate>
                </v-row>
            </v-card>
        </v-dialog>

        <!--login-->
        <v-dialog
            v-model="loginDialog"
            width="900"
            @click:outside="closeLoginDialog()"
        >
            <Login :loginMsg="loginText" @close="closeLoginDialog()" @login="login"></Login>
        </v-dialog>

        <!-- Setting Dialog -->
        <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog = false; kubeToken=''; kubeHost='';">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark text @click="saveSetting()">Save</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-list three-line subheader>
                    <v-subheader>Connection Setting</v-subheader>
                    <v-list-tile avatar>
                        <v-list-tile-content>
                            <v-list-tile-sub-title>
                                <v-text-field
                                        label="Kube Host"
                                        v-model="kubeHost"
                                        hint="Ex) https://api.k8s.bzdvops.com"
                                        outline
                                ></v-text-field>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                    <v-list-tile avatar>
                        <v-list-tile-content>
                            <v-list-tile-sub-title>
                                <v-text-field
                                        label="Kube Token"
                                        v-model="kubeToken"
                                        outline
                                ></v-text-field>
                            </v-list-tile-sub-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list>
            </v-card>
        </v-dialog>

        <!-- AI 모델 설정 다이얼로그 -->
        <v-dialog
                v-model="showAiModelSettingDialog"
                max-width="800px"
                persistent
                @click:outside="closeAiModelSettingDialog"
        >
            <v-card style="width:100%;">
                <AIModelSetting 
                  @onConfirm="handleAiSettingsConfirm" 
                  @onClose="closeAiModelSettingDialog"
                  :isUserStoryUIMode="false"
                  :errorMessage="aiSettingsErrorMessage"
                  :isVisible="showAiModelSettingDialog"
                >
                </AIModelSetting>
            </v-card>
        </v-dialog>

        <!-- 표준 문서 관리 다이얼로그 -->
        <v-dialog
                v-model="showStandardDocumentsDialog"
                max-width="800px"
                persistent
                @click:outside="closeStandardDocumentsDialog"
        >
            <v-card style="width:100%;">
                <StandardDocumentsManagement 
                  :userInfo="userInfo"
                  @onClose="closeStandardDocumentsDialog"
                >
                </StandardDocumentsManagement>
            </v-card>
        </v-dialog>

        <!-- Snackbar insert info -->
        <v-snackbar
                v-model="snackbar"
                color="error"
                :timeout=10000
        >
            {{ snackbarText }}
            <v-btn
                    dark
                    text
                    @click="snackbar = false"
            >
                Close
            </v-btn>
        </v-snackbar>

        <v-dialog v-model="podStatusDialog" hide-overlay>
            <v-card width="100%">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{hashName}} Events</v-toolbar-title>
                    <!--                    <v-divider></v-divider>-->
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click="podStatusDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text style="max-height: 500px; width: 100%;">
                    <pod-events :hash-name="hashName" v-if="podStatusDialog"></pod-events>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-alert type="info" outlined border="top" dismissible v-if="progressing"
                style="position: fixed; bottom: 0; margin-bottom: 0px; z-index:999; width: 100%; background-color: #ffffff !important">
            <h3>{{$t('word.progressState')}}</h3>
            <v-stepper
                    style="box-shadow: 0px 0px 0px 0px rgb(0 0 0 / 0%), 0px 0px 0px 0px rgb(0 0 0 / 0%), 0px 0px 0px 0px rgb(0 0 0 / 0%)"
                    v-model="step">
                <v-stepper-header flat>
                    <template v-for="(n,index) in steps">
                        <v-stepper-step
                                v-if="n.text == 'IDE Creating...'"
                                :key="`${n.text}`"
                                :complete="step > index +1"
                                :step="index + 1"
                                :rules="[() => !n.error]"
                                non-linear
                                @click="podStatusDialog = true"
                                color="success"
                        >{{ n.text }}
                        </v-stepper-step>
                        <v-stepper-step
                                v-else
                                :key="`${n.text}`"
                                :complete="step > index +1"
                                :step="index + 1"
                                :rules="[() => !n.error]"
                                non-linear
                                color="success"
                        >{{ n.text }}
                        </v-stepper-step>
                        <v-divider
                                v-if="index != steps.length -1 && index !== steps"
                                :key="index"
                        ></v-divider>
                    </template>
                </v-stepper-header>
            </v-stepper>
        </v-alert>
    </v-app>
</template>

<script>
    import axios from 'axios'
    import LogoView from './components/oauth/Logo.vue'
    import https from 'https'
    import CourseNavigator from "./components/labs/CourseNavigator";
    // import LabBase from './components/labs/LabBase';
    import ParticipantIcons from "./components/designer/modeling/ParticipantIcons";
    import StorageBase from "./components/CommonStorageBase";
    import PaymentToolTime from "./components/payment/PaymentToolTime";
    import RefundItem from "./components/payment/RefundItem";
    import GetCoin from "./components/payment/GetCoin";
    import {mdiProgressClock} from '@mdi/js';
    import PodEvents from "./components/PodEvents"
    import VueContext from 'vue-context';
    import 'vue-context/src/sass/vue-context.scss';
    import SubscriptionItemTemplate from "./components/payment/SubscriptionItemTemplate";
    const fs = require('fs');
    import Draggable from 'vue-draggable';
    import AIModelSetting from './components/designer/modeling/generators/features/ESDialoger/components/AIModelSetting/AIModelSetting.vue';
    import StandardDocumentsManagement from './components/designer/modeling/generators/features/ESDialoger/components/StandardDocumentsManagement/StandardDocumentsManagement.vue';
    import { mapState, mapMutations } from 'vuex';

    export default {
        name: 'App',
        props: {},
        mixins: [StorageBase],
        data: () => ({
            //search
            search: '',
            searchMode: 'all',
            headerFloating: false,
            openReloadMenu: false,
            openMenu: false,
            labInfo: null,
            urlText: null,
            // tenantLogo: null,
            terminalUrl: '',
            terminal: false,
            openGuide: false,
            // forceUpdate: true,
            iframeLoading: true,

            infoSlider: [
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/event.png',
                'https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/policy.png',
            ],
            attrs: {
                class: 'mb-6',
                boilerplate: true,
                elevation: 2,
            },
            messageLists: [],
            infoNum: 0,
            chatWindow: false,
            dialog: false,
            drawer: false,
            infoDialog: false,
            kubeHost: '',
            kubeToken: '',
            loginDialog: false,
            openPaymentTime: false,
            refundDialog: false,
            refundInfo: null,
            subscriptionDialog: false,

            showGetCoin: false,
            loadingMigrateHistory: false,
            ideLoading: false,
            items: [
                // {icon: 'fa-book', text: 'Introduce', route: '/'},
                // {icon: 'fa-sticky-note', text: 'EventStormingListPage', route: '/' },
                {icon: 'fa-sticky-note', text: 'EventStorming', route: '/'},
            ],
            api: [],
            snackbar: false,
            snackbarText: '',
            fab: false,
            courseNavi: false,
            overlay: true,
            message: '',
            // uid: '',
            // userName: '',
            messageRef: {},
            progressValue: false,
            naviObject: {
                drawer: false,
                instruction: [],
                checkPoints: [],
                hints: [],
                logs: ''
            },
            progressing: false,
            podStatusDialog: false,
            steps: [{text: "Code Generate", error: false},
                {text: "Code To Zip", error: false},
                {text: "Upload Zip", error: false},
                {text: "IDE Exist Check", error: false},
                {text: "IDE Creating...", error: false},
                {text: "Setting Config", error: false},
                {text: "IDE Start!", error: false}],
            step: 1,
            hashName: "",
            terminalWidth: "100%",
            interval: '',
            podStatusInterval: '',
            showReplayBar: false,
            slider: 45,
            participantLists: [],
            customizationHome: 'https://intro.msaez.io',
            showBeta: false,
            paymentLists: [
                {key: 'manager', display: `loginList.purchaseList`},
                {key: 'getCoin', display: `loginList.CoinsCoupons`},
                {key: 'payQuestion', display: `loginList.inquiry`},
                {key: 'aiModelSetting', display: "loginList.aiModelSetting"},
                {key: 'standardDocuments', display: "loginList.standardDocuments"},
                {key: 'logout', display: `loginList.logout`}
            ],
            loginText: 'Login',
            LoginHover: false,
            planning : [
                {
                    type: 'bm', 
                    title: 'tools.bm',
                    image: '/static/image/main/mainBMC.png',
                    subtitle: 'tools.bm-inst',
                    disabled: true,
                    tagStatus: 'Beta'
                },
                {
                    type: 'cjm', 
                    title: 'tools.cjm',
                    image: 'https://miro.medium.com/v2/resize:fit:0/1*GeerSkalcxLlE3bp83i1XA.png',
                    subtitle: 'tools.cjm-inst',
                    disabled: true,
                    tagStatus: 'Beta'
                },
                {
                    type: 'sticky', 
                    title: 'tools.sticky',
                    subtitle: 'tools.sticky-inst',
                    image: '/static/image/main/mainSticky.png',
                    disabled: true,
                    tagStatus: 'Beta'
                },
                {
                    type: 'userStoryMap', 
                    title: 'tools.userStoryMap',
                    subtitle: 'tools.userStoryMap-inst',
                    image: '/static/image/userStoryMap.png',
                    disabled: true,
                    tagStatus: 'Beta'
                },
            ],
            design : [
                {
                    type: 'es',
                    title: 'tools.eventstorming',
                    image: '/static/image/main/mainModeling.png',
                    subtitle: 'tools.eventstorming-inst',
                    disabled: false,
                    tagStatus: 'Stable'
                },
                {
                    type: 'project', 
                    title: 'tools.project',
                    image: '/static/image/main/mainProject.png',
                    subtitle: 'tools.project-inst',
                    disabled: true,
                    tagStatus: 'Stable'
                },
                {
                    type: 'uml', 
                    title: 'tools.uml',
                    image: '/static/image/main/mainUml.png',
                    subtitle: 'tools.uml-inst',
                    disabled: true,
                    tagStatus: 'Beta'
                },
                {
                    type: 'bpmn', 
                    title: 'tools.bpmn',
                    image: '/static/image/main/mainBPMN.png',
                    subtitle: 'tools.bpmn-inst',
                    tagStatus: 'Beta'
                },
            ],
            migration : [
                {
                    type: 'lm', 
                    title: 'tools.legacy-modernizer',
                    image: '/static/image/main/maink8s.png',
                    subtitle: 'tools.legacy-modernizer-inst',
                    disabled: false,
                    tagStatus: 'Beta'
                },
            ],
            development : [
                {
                    type: 'k8s', 
                    title: 'tools.kubernetes',
                    image: '/static/image/main/maink8s.png',
                    subtitle: 'tools.kubernetes-inst',
                    disabled: false,
                    tagStatus: 'Beta'
                },
            ],
            makingProject : [
            ],
            selectedItem: null,
            showNewButton: false,
            inCourse: false,
            isMobile: false,
            stepSetTimeOut: null,
            labTool: null,
            inSideRounge: false,
            inSideLab: false,
            editor: '',
            content: '',
            editorData: '',
            editorConfig: {
                toolbar: [
                    ['Bold', '-', 'NumberedList', 'BulletedList', 'Image' ],
                    ['Link', 'Unlink', ],
                    ],
                
            },
            activeTab: 0,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            offsetX: 0,
            offsetY: 0,
            makingDialog: null,
            showAiModelSettingDialog: false,
            showStandardDocumentsDialog: false
        }),
        components: {
            SubscriptionItemTemplate,
            PodEvents,
            ParticipantIcons,
            axios,
            https,
            CourseNavigator,
            PaymentToolTime,
            GetCoin,
            RefundItem,
            VueContext,
            LogoView,
            AIModelSetting,
            StandardDocumentsManagement,
        },
        // beforeMount(){
        // },
        computed: {
            ...mapState({
                isAiSettingsRequired: state => state.ai.isAiSettingsRequired,
                aiSettingsErrorMessage: state => state.ai.aiSettingsErrorMessage
            }),
            isRootPage() {
                return this.$route.path === "/";
            },
            isForeign() {
                try {
                    let lang = this.$i18n.locale;
                    return lang !== 'ko';
                } catch (error) {
                    console.error('Error determining locale:', error);
                    // 기본값으로 false 반환
                    return false;
                }
            },

            // showAppBar(){
            //     if(window.location.href.includes('/start-Electron')){
            //         return false
            //     } else {
            //         return true
            //     }
            // },
            inSideElectron() {
                return window.ipcRenderer
            },
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            getSavedCoin() {
                if (this.userInfo.savedCoin) {
                    return Number(this.userInfo.savedCoin.toFixed(2))
                }
                return 0
            },
            getSavedToolTime() {
                if (this.userInfo.savedToolTime) {
                    return Number(this.userInfo.savedToolTime.toFixed(2))
                }
                return 0
            },
            showParticipantIcons() {
                return this.participantLists.length > 0 ? true : false
            },
            activeFab() {
                switch (this.tabs) {
                    case 'one':
                        return {class: 'purple', icon: 'account_circle'}
                    case 'two':
                        return {class: 'red', icon: 'edit'}
                    case 'three':
                        return {class: 'green', icon: 'keyboard_arrow_up'}
                    default:
                        return {}
                }
            },
            // authorized() {
            //     var me = this
            //     // console.log(window.localStorage.getItem("accessToken"),  window.localStorage.getItem("userName"))
            //     if (window.localStorage.getItem("accessToken") == null && window.localStorage.getItem("userName") == null) {
            //         window.authorized = false;
            //         return false
            //     } else if (window.localStorage.getItem("userName")) {
            //         window.authorized = true;
            //         return true
            //     } else if (window.localStorage.getItem("accessToken")) {
            //         // this.$http.defaults.headers.common['Authorization'] = `Bearer ${localStorage.accessToken}`;
            //         // var us={
            //         //     'author': window.localStorage.getItem("author"),
            //         //     'userName':window.localStorage.getItem("userName"),
            //         //     'picture': window.localStorage.getItem("picture"),
            //         //     'email': window.localStorage.getItem("email")
            //         // }
            //
            //         window.authorized = true;
            //         me.loginDialog = false;
            //         return true
            //     }
            // },
        },
        created: async function () {
            var me = this

            Vue.prototype.$app = me

            me.$EventBus.$on('open-new-making-dialog', function () {
                me.makingDialog = true
            })

            if (this.$isElectron) {
                // Electron-specific code
                localStorage.setItem('accessToken', "electron_token")
                localStorage.setItem('email',"email@email.com")
                localStorage.setItem('name', "electron-user")
                localStorage.setItem('uid', "xxxx-xxxx-xxxx-xxxx-xxxx")
            } else {
                // Browser-specific code
                // With SignInWithRedirect.vue
                me.getRef('auth')
                    .getRedirectResult()
                    .then((result) => {
                        if (result.credential) {
                            /** @type {firebase.auth.OAuthCredential} */
                            me.onSignInWithRedirectResult(result);
                        }
                    }).catch((error) => {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                });
            }
            try {
                // setting locale
                await me.setLocale();

                //set userInfo
                await me.loginUser()

                // remove userId
                // var routerPathList = me.$route.path.split('/')
                // var canvasUrlType = routerPathList[1]
                // var routerObj  = me.$router.options && me.$router.options.routes ? me.$router.options.routes.find(obj => obj.path.split('/:')[0] == `/${canvasUrlType}`) : null
                //
                // if(routerObj && routerObj.name.toLowerCase().includes('canvas')){
                //     if(routerPathList.length > 3){
                //         var modelId = routerPathList[3]
                //         me.$router.push({path: `/${canvasUrlType}/${modelId}`});
                //     }
                // }



                if (me.$route.name == 'IdeLoadingPage') {
                    me.ideLoading = true
                }


                //tenant check
                //this.tenantLogoUrl = await me.getThumbnailImg("tenants/"+ me.getTenantId() + "/thumbnail.png");
                // if (!window.location.host.includes('localhost'))
                //     me.tenantLogo = await me.getImageURL("storage://labs-msaez.io/logo.png");
                // me.tenantLogo = await me.getImageURL("/logo.png");

                // me.removeFireBaseImage();
            } catch (e) {
                console.log(e)
                console.log('[Error] APP.vue Created')
            }

        },
        watch: {
            // window || window.location.href.includes(localStorage.getItem('projectId'))
            // "step": function(){
            //     if(this.step < 5){
            //         clearTimeout(this.stepSetTimeOut)
            //         this.stepSetTimeOut = setTimeout(() => {
            //             if(this.step < 5 && this.step != 1){
            //                 window.location.reload();
            //             } 
            //         }, 20000);
            //     } else {
            //         clearTimeout(this.stepSetTimeOut)
            //     }
            // },
            'search': function (newVal) {
                if (this.showNewButton) {
                    this.$EventBus.$emit('searchItem', this.search, this.searchMode, true)
                } else {
                    this.$EventBus.$emit('searchItem', this.search, null, false)
                }
            },
            'searchMode': function () {
                if (this.showNewButton) {
                    this.$EventBus.$emit('searchItem', this.search, this.searchMode, true)
                } else {
                    this.$EventBus.$emit('searchItem', this.search, null, true)
                }
            },
            "openReloadMenu": function () {
                if (window.ipcRenderer) {
                    if (this.openReloadMenu) {
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
                } else {
                    console.log('msaez')
                }
            },
            "openMenu": function () {
                if (window.ipcRenderer) {
                    if (this.openMenu) {
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
                } else {
                    console.log('msaez')
                }
            },
            "iFrame": function (newVal) {
                console.log('iFrame', newVal)
            },
            isAiSettingsRequired(newVal) {
                if (newVal) {
                    this.showAiModelSettingDialog = true;
                }
            }
        },
            "editorData":
                _.debounce(function(newValue, oldValue){
                    this.saveMemo()
                }, 1000),
        beforeDestroy() {
            var me = this
            if (me.isLogin) {
                var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                // me.watch_off(`db://enrolledUsers/${convertEmail}/purchaseHistory`)
                // firebase.database().ref(`enrolledUsers/${convertEmail}/purchaseHistory`).off();
            }
            window.localStorage.removeItem("accessToken");
        },
        async mounted() {
            var me = this

            // var arr = [
            //     "a7819938c7c6a6818bc00e4a0ce148d2",
            //     "a7824cc98de78600dc66722338ad6142",
            //     "a788d224331f59423e1b7d082d3da2b6"
            // ]
            // arr.forEach(async function (key){
            //     await me.delete(`db://definitions/${key}/information/img`)
            //     // console.log(key)
            //     var versionList = await me.list(`db://definitions/${key}/versionLists`)
            //     if(versionList){
            //         Object.keys(versionList).forEach(async function (verKey){
            //             await me.delete(`db://definitions/${key}/versionLists/${verKey}/versionInfo/img`)
            //             console.log(key, verKey)
            //         })
            //     }
            // })
            // console.log(this.$route.params.oauth)
            if(window.location.search.includes("oauth=gitlab"))
                me.$router.push("/oauth/gitlab")
            if(window.location.search.includes("oauth=acebase"))
                me.$router.push("/oauth/acebase")
            if(window.document.title == '라운지'){
                me.inSideRounge = true
            }
            me.$EventBus.$on('isMounted-ModelCanvas', function (data) {
                if(data == 'true') {
                    me.headerFloating = true
                } else {
                    me.headerFloating = false
                }
                
            })
            me.$EventBus.$on('setLabTool', function (data) {
                me.labTool = data
            })

            if (window.location.href.includes('/courses') && !window.location.href.includes('/courses/')) {
                me.inCourse = true
            }
            // me.labInfo = await this.getLabInfo();
            // if(window && window.ipcRenderer){
            //     window.ipcRenderer.on("newURL", function (event, url) {
            //         if(url){
            //             console.log(url)
            //             // me.urlText = url
            //         } 
            //     })
            // }

            if (localStorage.getItem('projectName')) {
                me.overlay = false
            }
            me.$EventBus.$on('inSideCourse', function (data) {
                me.inCourse = data
            })
            me.$EventBus.$on('mobileMode', function (data) {
                me.isMobile = data
            })
            me.$EventBus.$on('setLabInfo', function (data) {
                me.urlText = ''
                if (data) {
                    me.labInfo = data
                    if(me.labInfo.URL){
                        me.urlText = me.labInfo.URL
                    }
                    // console.log(me.urlText)
                } else {
                    me.labInfo = null
                }
            })
            me.$EventBus.$on("inSideLab", function (data) {
                me.inSideLab = data
            })
            me.$EventBus.$on("inSideRounge", function (data) {
                me.inSideRounge = data
            })
            //<<<<< old terminal
            me.$EventBus.$on('terminalOn', function (data) {
                // me.getTerminalToken();
                try {
                    me.$EventBus.$emit('loadTerminal');
                    me.terminalWidth = $('.canvas-panel').width()
                    me.getTerminalConfig(data);
                } catch (e) {

                }
            })
            me.$EventBus.$on('terminalOff', function () {
                try {
                    me.terminalUrl = '';
                    me.terminal = false;
                } catch (e) {
                }
            })
            me.$EventBus.$on('terminalFrameOn', function () {
                me.terminalWidth = $('.canvas-panel').width()
            })
            //  old terminal >>>>>

            me.$EventBus.$on('progressing', function (data) {
                me.progressing = data.progressing
                switch (data.type) {
                    case "ES":
                        me.steps = [
                            {text: "Code Generate", error: false},
                            {text: "Code To Zip", error: false},
                            {text: "Upload Zip", error: false},
                            {text: "IDE Exist Check", error: false},
                            {text: "IDE Creating...", error: false},
                            {text: "Setting Config", error: false},
                            {text: "IDE Start!", error: false}
                        ]
                        break;
                    case "Lab":
                        me.steps = [
                            {text: "Check Template File", error: false},
                            {text: "IDE Exist Check", error: false},
                            {text: "IDE Creating...", error: false},
                            {text: "Setting Config", error: false},
                            {text: "IDE Start!", error: false}
                        ]
                        break;
                }

                /** Step 단계 정리 ( 1. EventStorming IDE )
                 * 1. Code Generate
                 * 2. Code To Zip
                 * 3. Upload Zip
                 * 4. IDE Exist Check
                 * 5. Setting Config
                 * 6. IDE Creating...
                 *  -> Pod 상태를 받아 와야 할듯..
                 *  고민 - Click시에 IDE 생성 진행 상태 관련 정보 받아오는 UI 만들기?
                 * 7. IDE Starting...
                 */

                /** Step 단계 정리 ( 2. LabTool IDE )
                 * 1. Check Template File
                 * 2. IDE Exist Check...
                 * 3. Setting Config...
                 * 4. IDE Creating...
                 *  -> Pod 상태를 받아 와야 할듯..
                 *  고민 - Click시에 IDE 생성 진행 상태 관련 정보 받아오는 UI 만들기?
                 * 5. IDE Starting
                 */

            })

            me.$EventBus.$on('nextStep', function (data) {
                me.step = me.step + 1
                // !!!
            })
            me.$EventBus.$on('hashName', function (data) {
                me.hashName = data.hashName
            })
            me.$EventBus.$on('hideProgressing', function (data) {
                me.progressing = false
            })
            me.$EventBus.$on('openProgressing', function (data) {
                me.progressing = true
            })
            me.$EventBus.$on('endProgressing', function (data) {
                // 초기값으로 변경.
                me.progressing = false
                me.step = 1;
                me.steps = [];
                me.hashName = "";
            })

            me.$EventBus.$on('progressingError', function () {
                me.steps[me.step - 1].error = true
            })

            me.$EventBus.$on('sendCode', function (val) {
                if (me.terminal) {
                    $('iframe').get(0).contentWindow.wt.term.term.send(val)
                } else {
                    me.snackbar = true;
                    me.snackbarText = "Open the terminal before clicking on the command.";
                }
            })

            me.$EventBus.$on('progressValue', function (newVal) {
                me.progressValue = newVal
            })

            me.$EventBus.$on('showReplayBar', function (newVal) {
                console.log(newVal)
                me.showReplayBar = newVal
            })

            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal
            })

            me.$EventBus.$on('openPaymentTime', function (newVal) {
                me.openPaymentTime = newVal
            })

            me.$EventBus.$on('refundDialog', function (newVal, refundInfo) {
                me.refundInfo = refundInfo
                me.refundDialog = newVal
            })

            me.$EventBus.$on('subscriptionDialog', function (newVal) {
                if (newVal) {
                    me.openSubscriptionDialog()
                } else {
                    me.closeSubscriptionDialog()
                }
            })


            me.$EventBus.$on('openGetCoin', function (newVal) {
                me.showGetCoin = newVal
            })

            me.$EventBus.$on('showLoginDialog', function () {
                me.openLoginDialog()
                // me.loginDialog = true
                // me.messageLists.push({'이동되었습니다.'})
            })
            me.$EventBus.$on('closeChat', function (val) {
                // console.log("chat close", me.messageRef)
                me.messageLists = [];
                me.messageRef.off();
            })

            me.$EventBus.$on('participant', function (val) {
                me.participantLists = val
            })

            me.$EventBus.$on('storming-start', function (data) {
                console.log(data)
                me.courseNavi = true;
                me.naviObject.labsName = data.labName
                me.naviObject.drawer = true;
                me.naviObject.checkPoints = data.checkPoints;
                me.naviObject.hints = data.hints;
                me.naviObject.lab = data.lab;
                me.naviObject.instruction = data.instruction;
                me.naviObject.email = data.email

            })
            this.$EventBus.$on('guideClose', function () {
                me.openGuide = true
            })
            me.$EventBus.$on("urlUpdate", function (data) {
                me.urlText = data
            })

            me.$EventBus.$on('lab_VideoSize', function () {
                setTimeout(function () {
                    me.terminalWidth = $('.canvas-panel').width();
                }, 200)

            })

            $(document).keydown((evt) => {
                if (evt.keyCode == 27) {
                    this.overlay = false
                }
            });

            if (me.$route.query.access_token) {
                localStorage.setItem("accessToken", me.$route.query.access_token)
                var tmpURL = window.location.protocol + "//" + window.location.host + "/";
                window.location.href = tmpURL;
            }

            //새로고침 감지 && 탭 닫기
            // window.onbeforeunload = function (e) {
            //     console.log(me.isLogin)
            //     if (me.isLogin) {
            //         me.logout()
            //     }
            // }

        },
        methods: {
            ...mapMutations({
                setAiSettingsRequired: 'ai/SET_AI_SETTINGS_REQUIRED'
            }),
            toggleBeta() {
                this.showBeta = !this.showBeta;
            },
            disabledTypes(type) {
                // bpmn 타입에 대해 한국에서만 버튼이 활성화되도록 설정
                if (type === 'bpmn') {
                    return this.isForeign; // 한국이 아닌 경우에만 disabled
                }
                // 다른 타입에 대한 기본 disabled 상태
                const item = this.design.find(item => item.type === type);
                return item ? item.disabled : true;
            },
            login() {
                this.$EventBus.$emit('jumpToLab');
            },
            navigateToSlack() {
                window.open("https://join.slack.com/t/uenginehq/shared_invite/zt-2qh7j779f-UWwa~p~OvAla7s8pjikWRw", "_blank");
            },
            goTutorials: function (type) {
                if (type == 'es') {
                    if (this.isForeign) {
                        window.open("https://intro.msaez.io/tool/event-storming-tool/", "_blank");
                    } else {
                        window.open("https://intro-kor.msaez.io/tool/event-storming-tool/", "_blank");
                    }
                } else if (type == 'k8s') {
                    if (this.isForeign) {
                        window.open("https://intro.msaez.io/tool/infrastructure-modeling/", "_blank");
                    } else {
                        window.open("https://intro-kor.msaez.io/tool/infrastructure-modeling/", "_blank");
                    }
                } else if (type == 'bpmn') {
                    window.open("https://bpm-intro.uengine.io/getting-started/", "_blank");
                }

            },
            goVideo: function (type) {
                if (type == 'es') {
                    if (this.isForeign) {
                        window.open("https://www.youtube.com/watch?v=G46GbI8aa3o&list=PLEr96Fo5umW9w_5SmjXhOar1xRRWcZsbB&index=1", "_blank");
                    } else {
                        window.open("https://www.youtube.com/watch?v=BqKfq3ASU1g&list=PLEr96Fo5umW99TW0kmXQHzL3XEztDXPjI", "_blank");
                    }
                } else if (type == 'k8s') {
                    window.open("https://www.youtube.com/watch?v=vtPtymnmo6M&list=PLEr96Fo5umW8oIZrO0bLVUWaqPOuB3msk&index=1", "_blank");
                } else if (type == 'bpmn') {
                    window.open("https://www.youtube.com/watch?v=9RtGeyvZrJo&t=4s", "_blank");
                }
            },
            onSignInWithRedirectResult(result){
                var me = this
                try{
                    var token = result.credential.accessToken;
                    var uid = result.user.uid;
                    var provider = result.credential.providerId.split('.')[0];
                    var userEmail = result.user.providerData[0].email;
                    var userProfile = result.user.providerData[0].photoURL;
                    var state = result.operationType;
                    var userName = provider.includes('github') ? result.additionalUserInfo.username : result.additionalUserInfo.profile.name;

                    window.localStorage.setItem("author", userEmail)
                    window.localStorage.setItem("userName", userName)
                    window.localStorage.setItem("email", userEmail)
                    window.localStorage.setItem("picture", userProfile)
                    window.localStorage.setItem("accessToken", token)
                    window.localStorage.setItem("uid", uid)
                    window.localStorage.setItem("loginType", provider)

                    if (userEmail && userEmail.includes('@uengine.org')) {
                        window.localStorage.setItem("authorized", 'admin');
                    } else {
                        window.localStorage.setItem("authorized", 'student');
                    }

                    me.$EventBus.$emit('login', token)
                    me.$emit('login')

                    if(provider.includes('github')){
                        window.localStorage.setItem("gitAccessToken", token)
                        window.localStorage.setItem("gitToken", token)
                        window.localStorage.setItem("gitUserName", userName)
                        window.localStorage.setItem("gitOrgName", userName)
                        me.$emit('isGitLogin')
                    }

                    //firebase DB input
                    me.writeUserData(uid, userName, userEmail, userProfile, provider)
                    if(me.$gtag){
                        me.$gtag.event('login', {method: provider})
                    }
                } catch (e) {
                    console.log(`Error] signInWithRedirectResult: ${e}`)

                }
            },
            writeUserData(userId, name, email, imageUrl, provider) {
                // With onSignInWithRedirectResult
                var authorized = 'admin';
                if (email.includes('@uengine.org')) {
                    authorized = 'admin'
                } else {
                    authorized = 'student'
                }

                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                    authorized: authorized,
                    loginDate: Date.now()
                }
                var eObj = {
                    uid: userId,
                    userName: name,
                    profile_picture: imageUrl,
                    email: email,
                }

                this.putObject(`db://users/${userId}`, obj)
                //새로운 로그인 유저
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    this.putObject(`db://enrolledUsers/${convertEmail}`, eObj)
                }

            },
            // async removeFireBaseImage(){
            //     var me = this
            //     // var baseUrl = 'userLists/everyone/share_first'
            //     var baseUrl = '/userLists/everyone/share'
            //     firebase.database().ref(`${baseUrl}`).once('value',function (snapshot) {
            //         snapshot.forEach(function(snap){
            //             var projectId = snap.key
            //             me.delete(`db://${baseUrl}/${projectId}/img`);
            //         });
            //     });
            // },
            naviControll() {
                this.$EventBus.$emit('naviControll')
            },
            moveToCourses(){
                this.$router.push('/courses')
            },
            sendSnackbar(on, text) {
                var me = this
                me.snackbar = on;
                me.snackbarText = text
            },
            async try(options){

                if(!options) alert("options must have following: {context, action, onFail(optional), successMsg, failMsg}")
                if(!options.context) alert("options must have following: {context, action, onFail(optional), successMsg, failMsg}")
                if(!options.action) alert("options must have following: {context, action, onFail(optional), successMsg, failMsg}")
                
                let context = options.context

                try{
                    this.$EventBus.$emit('progressValue', true)
                    await options.action(context)
                    if(options.successMsg){
                        this.sendSnackbar(true, successMsg)
                    }
                }catch(e){
                    if(options.failMsg)
                        this.sendSnackbar(true, failMsg)
                    else
                        this.sendSnackbar(true, e.message)

                    if(options.onFail){
                        options.onFail(e)
                    }
                    
                    console.log(e)
                }finally{
                    this.$EventBus.$emit('progressValue', false)
                }
            },
            setLocale() {
                try {
                    var me = this
                    $.getJSON("https://ipinfo.io", function (data) {
                        var country = data.country // 접속자 국가
                        if (country == "KR") {
                            me.$i18n.locale = 'ko'
                        } else {
                            me.$i18n.locale = 'en'
                        }
                    });
                } catch (e) {
                    me.$i18n.locale = 'ko'
                }
            },
            addNewClass() {
                this.$EventBus.$emit("addNewClass", true)
            },
            contextOpen(event) {
                this.$refs.menu.open(event);
            },
            onOpen() {
                console.log('The context menu was opened');
                this.openReloadMenu = true
            },
            onClose() {
                console.log('The context menu was closed');
                this.openReloadMenu = false
            },
            onClick(text) {
                if (text == "강력 새로고침") {
                    if (window.ipcRenderer) {
                        window.ipcRenderer.send("reloadIgnoringCache");
                    }
                }
            },
            sendUrl(text) {
                var me = this
                try {
                    var setUrl = null
                    if (text.includes('https://') || text.includes('http://')) {
                        setUrl = text
                    } else {
                        setUrl = 'https://' + text
                    }
                    var setClassId = me.classId.replace('running@', '')
                    var userId = localStorage.getItem('email').replace('.', '_')
                    me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/' + userId + '/myURL', setUrl)
                    if (me.isAdmin) {
                        var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
                        copyLabInfo.URL = setUrl
                        me.putObject(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
                        me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/URL', setUrl);
                    } else {
                        console.log('student')
                        this.$EventBus.$emit("urlUpdateForStudent", setUrl)
                    }
                    me.urltextfield = false
                } catch (e) {
                    console.log(e.message)
                }

            },
            goBack() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("goBack");
                }
            },
            goForward() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("goForward");
                }
            },
            reLoadPage() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("reload");
                }
            },
            screenMinus() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("screenMinus");
                }
            },
            screenPlus() {
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("screenPlus");
                }
            },
            setColor(index) {
                this.selectedItem = index;
            },
            async moveToModel(type) {
                var me = this
                if(!me.userInfo.providerUid) await await me.loginUser()
               
                me.makingDialog = false
                try {
                    if (!type) type = me.mode
                    let path = me.userInfo.providerUid ? `/${me.userInfo.providerUid}` : ''
                
                    if (type == 'es') {
                        path = `${path}/storming`
                    } else if (type == 'k8s') {
                        path = `${path}/kubernetes`
                    } else if (type == 'bm') {
                        path = `${path}/business-model-canvas`
                    } else if (type == 'lm') {
                        path = `${path}/legacy-modernizer`
                    } else {
                        path = `${path}/${type}`
                    } 
                    path = `${path}/${me.dbuid()}`

                    me.$router.push({path: path});
                } catch (e) {
                    alert('Error-NewProject', e)
                }
            },
            loadTextFromFile(test) {
                var me = this
                try {
                    const fileInfo = test.target.files[0];
                    const reader = new FileReader();

                    reader.readAsText(fileInfo);

                    reader.onload = function (info) {
                        var loadedProject = JSON.parse(info.target.result)
                        me.saveLocalToMine(loadedProject)
                    }
                } catch (e) {
                    alert('Error-Download:', e)
                }
            },

            async saveLocalToMine(loadedFile) {
                var me = this
                if (me.isLogin) {
                    var author = me.userInfo.uid ? me.userInfo.uid : localStorage.getItem('uid')
                    var authorName = me.userInfo.name ? me.userInfo.name : localStorage.getItem('userName')
                    var authorEmail = me.userInfo.email ? me.userInfo.email : localStorage.getItem('email')
                    var authorProfile = me.userInfo.profile ? me.userInfo.profile : localStorage.getItem('picture')
                    var date = loadedFile.date ? loadedFile.date : Date.now()
                    var img = loadedFile.img ? loadedFile.img : 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'
                    var type = loadedFile.type ? loadedFile.type : 'es'
                    var projectName = loadedFile.projectName ? loadedFile.projectName : 'untitled'
                    var comment = ''
                    var lastModifiedDate = date
                    var lastModifiedEmail = authorEmail
                    var lastModifiedUser = author
                    var getElements = loadedFile.elements ? loadedFile.elements : {}
                    var getRelations = loadedFile.relations ? loadedFile.relations : {}
                    var getValue = {'elements': getElements, 'relations': getRelations}

                    var newProjectId = me.dbuid()
                    var newVersionKey = await me.pushString(`db://definitions/${newProjectId}/versionLists`)


                    var information = {
                        author: author,
                        authorEmail: authorEmail,
                        comment: comment,
                        img: img,
                        lastModifiedEmail: lastModifiedEmail,
                        lastModifiedUser: lastModifiedUser,
                        lastVersionName: newVersionKey,
                        projectName: projectName,
                        type: type,
                        lastModifiedTimeStamp: lastModifiedDate,
                        createdTimeStamp:date,
                    }
                    var lastVersionValue = {
                        value: JSON.stringify(getValue),
                    }

                    var putUser = {
                        uid: author,
                        name: authorName,
                        picture: authorProfile
                    }

                    // var putMine = {
                    //     author: author,
                    //     authorEmail: authorEmail,
                    //     authorProfile: authorProfile,
                    //     comment: comment,
                    //     date: date,
                    //     img: img,
                    //     projectId: newProjectId,
                    //     lastModifiedDate: lastModifiedDate,
                    //     projectName: projectName,
                    //     type: type
                    // }

                    me.putObject(`db://definitions/${newProjectId}/information`, information);

                    me.putObject(`storage://definitions/${newProjectId}/versionLists/${newVersionKey}/versionValue`, JSON.stringify(getValue))
                    // me.putObject(`db://definitions/${newProjectId}/versionLists/${newVersionKey}/versionValue`, lastVersionValue)

                    me.putObject(`db://userLists/${author}`, putUser)
                    // me.putObject(`db://userLists/${author}/mine/${newProjectId}`, putMine)

                    setTimeout(function () {
                        var pathName = type == 'es' ? 'storming' : (type == 'k8s' ? 'kubernetes' : 'business-model-canvas')
                        me.$router.push({path: `${pathName}/${newProjectId}`});
                    }, 500)
                } else {
                    var newProjectId = me.dbuid()
                    var author = localStorage.getItem('uid') ? localStorage.getItem('uid') : 'anyone'
                    var date = loadedFile.date ? loadedFile.date : Date.now()
                    var img = loadedFile.img ? loadedFile.img : 'https://user-images.githubusercontent.com/54785805/125735022-10b4560f-51c3-4d0d-8c05-9641c6d8a8b0.png'
                    var type = loadedFile.type ? loadedFile.type : 'es'
                    var projectName = loadedFile.projectName ? loadedFile.projectName : 'untitled'
                    var getElements = loadedFile.elements ? loadedFile.elements : {}
                    var getRelations = loadedFile.relations ? loadedFile.relations : {}
                    var getValue = {'elements': getElements, 'relations': getRelations}

                    var lists = await me.getObject(`localstorage://localLists`)
                    var newInfo = {
                        img: img,
                        projectName: projectName,
                        projectId: newProjectId,
                        type: type,
                        lastModifiedTimeStamp: lastModifiedDate,
                        createdTimeStamp:date,
                    }
                    lists.push(newInfo)
                    me.putObject(`localstorage://localLists`, lists)
                    me.putObject(`localstorage://${newProjectId}`, JSON.stringify(getValue))

                    var pathName = type == 'es' ? 'storming' : (type == 'k8s' ? 'kubernetes' : 'business-model-canvas')
                    me.$router.push({path: `${pathName}/${newProjectId}`});
                }

            },
            openLoginDialog() {
                this.loginDialog = true
            },
            closeLoginDialog() {
                this.loginDialog = false
            },
            openToolTime() {
                this.openPaymentTime = true
            },
            closeToolTime() {
                this.openPaymentTime = false
            },
            openRefundDialog() {
                this.refundDialog = true
            },
            closeRefundDialog() {
                this.refundInfo = null
                this.refundDialog = false
            },
            openSubscriptionDialog() {
                this.subscriptionDialog = true
            },
            closeSubscriptionDialog() {
                this.subscriptionDialog = false
            },
            openGetCoin() {
                this.showGetCoin = true
            },
            closeGetCoin() {
                this.showGetCoin = false
            },
            provision() {
                this.$router.push({path: '/provision'});
            },
            onClickLoginMenu(key) {
                var me = this
                try {
                    if (key == 'logout') {
                        me.logout();
                        if (window.ipcRenderer) {
                            window.ipcRenderer.send("closeView");
                        }
                    } else if (key == 'payQuestion') {
                        alert("'help@uengine.org' 으로 메일 문의 바랍니다. ") 
                    } else if (key == 'aiModelSetting') {
                        me.openAiModelSettingDialog()
                    } else if (key == 'standardDocuments') {
                        me.openStandardDocumentsDialog()
                    } else {
                        console.log("app")
                        if (me.isLogin) {
                            if (key == 'manager') {
                                me.$router.push('/myPage')
                            } else if (key == 'getCoin') {
                                me.openGetCoin()
                            }
                        } else {
                            me.openLoginDialog()
                        }
                    }
                } catch (e) {
                    console.log(e);
                    alert('error-loginMenu', e)
                }

            }
            ,
            openParticipantPanel(boolean) {
                var me = this
                me.$EventBus.$emit('participantPanel', boolean)
            }
            ,
            goMessage() {
                var me = this
                me.$router.push('/MessageTest')
            }
            ,
            openPanelParticiateLists() {
                this.$EventBus.$emit('participantsListsPanel', true)
            }
            ,
            // Multi(){
            //   this.$EventBus.$emit('webRtcDialog')
            // },
            onLoad() {
                console.log('iframe loaded');
                this.iframeLoading = false;
            }
            ,
            getTerminalToken() {
                var me = this
                var item = {
                    "type": "Token",
                    "name": localStorage.getItem('clusterName'),
                    "apiServer": localStorage.getItem('clusterAddress'),
                    "token": localStorage.getItem('kuberToken'),
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post("api/kube-token", item).then(function (response) {
                    me.terminalUrl = "terminal/?token=" + response.data.token;
                    me.terminal = true;
                }).catch(function (err) {
                    me.snackbar = true;
                    me.snackbarText = "To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.";
                })
            },
            getTerminalConfig(data) {
                var me = this
                var item = {
                    "type": "Token",
                    "name": data.name,
                    // "apiServer": localStorage.getItem('clusterAddress'),
                    "kubeConfig": data.config
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post("api/kube-config", item).then(function (response) {
                    me.terminalUrl = "terminal/?token=" + response.data.token;
                    me.terminal = true;
                }).catch(function (err) {
                    me.snackbar = true;
                    me.snackbarText = "To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.";
                })
            },
            // new terminal
            // terminalOn() {
            //     try {
            //         this.terminal = true;
            //     } catch (e) {
            //         console.log(e)
            //     }
            // },
            terminalOff() {
                var me = this;
                // new terminal
                // try {
                //     me.terminal = false;
                // } catch (e) {
                //     console.log(e)
                // }

                // old terminal
                me.$EventBus.$emit('terminalOff');
            },

            // onIframeLoad() {
            //     console.log('iframe loaded');
            // },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            }
            ,
            logout() {
                var me = this

                if (me.isLogin) {
                    var obj = {
                        state: 'signOut',
                        logoutDate: Date.now()
                    }
                    me.putObject(`db://users/${me.userInfo.uid}`, obj)
                }

                if(window.MODE == 'onprem') {
                    localStorage.clear();
                    me.$EventBus.$emit('login', null);
                    if(me.$gtag){
                        me.$gtag.event('logout', {method: 'google'});
                    }
                    var newURL = window.location.protocol + "//" + window.location.host + "/";
                    window.location.href = newURL;
                } else {
                    me.getRef('auth').signOut().then(function (result) {
                        window.localStorage.removeItem("gitAccessToken");
                        window.localStorage.removeItem("accessToken");
                        window.localStorage.removeItem("author");
                        window.localStorage.removeItem("userName");
                        window.localStorage.removeItem("email");
                        window.localStorage.removeItem("projectName");
                        window.localStorage.removeItem("picture");
                        window.localStorage.removeItem("loadData");
                        window.localStorage.removeItem("uid");
                        window.localStorage.removeItem("authorized");
                        window.localStorage.removeItem("connectionKey");

                        window.localStorage.removeItem("loginType");
                        window.localStorage.removeItem("gitUserName");
                        window.localStorage.removeItem("gitOrgName");

                        me.$EventBus.$emit('login', null)
                        if(me.$gtag){
                            me.$gtag.event('logout', {method: 'google'})
                        }
                        var newURL = window.location.protocol + "//" + window.location.host + "/";
                        window.location.href = newURL;
                    })
                }
            },

            saveSetting() {
                var me = this;
                me.dialog = false;
                this.$http.put(`${API_HOST}/kube/user/saveUserDetail`, {
                    username: me.userInfo.user_name,
                    host: me.kubeHost,
                    token: me.kubeToken
                }).then((result) => {
                    let tmp = {kubeHost: me.kubeHost, kubeToken: me.kubeHost, userName: me.userInfo.user_name}
                    me.$store.dispatch('LOGIN', tmp)
                })
            }
            ,
            loginPage() {
                var me = this
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("loginPage", me.getTenantId());
                    window.ipcRenderer.on("loginData", function (event, arg) {
                        var tmp = JSON.parse(arg)
                        console.log(tmp)
                        window.localStorage.setItem("author", tmp.author)
                        window.localStorage.setItem("userName", tmp.userName)
                        window.localStorage.setItem("email", tmp.email)
                        window.localStorage.setItem("picture", tmp.picture)
                        window.localStorage.setItem("accessToken", tmp.accessToken)
                        window.localStorage.setItem("uid", tmp.uid)
                        window.localStorage.setItem("authorized", tmp.authorized);
                        if (tmp.type == "github") {
                            window.localStorage.setItem("gitAccessToken", tmp.gitAccessToken)
                        }
                        location.reload()
                    })
                } else {
                    me.openLoginDialog()
                }

            }
            ,
            // wikiOpen() {
            //     if (this.isForeign) {
            //         window.open("https://intro.msaez.io/", "_blank")
            //     } else {
            //         window.open("https://intro-kor.msaez.io/", "_blank")
            //     }
            // },

            githubIssuesOpen() {
                if (this.isForeign) {
                    window.open("https://github.com/msa-ez/msa-ez.github.io/issues", "_blank")
                } else {
                    window.open("https://github.com/msa-ez/msa-ez.github.io/issues", "_blank")
                }
            },
            dragStart(event) {
                var me = this;
                me.isDragging = true;
                me.startX = event.clientX;
                me.startY = event.clientY;
                me.currentX = me.$refs.draggable.offsetLeft;
                me.currentY = me.$refs.draggable.offsetTop;
                me.offsetX = me.startX - me.currentX;
                me.offsetY = me.startY - me.currentY;
            },
            dragging(event) {
                var me = this;
                if (me.isDragging) {
                    me.currentX = event.clientX - me.offsetX;
                    me.currentY = event.clientY - me.offsetY;
                    me.$refs.draggable.style.left = `${me.currentX}px`;
                    me.$refs.draggable.style.top = `${me.currentY}px`;
                }
            },
            dragStop() {
                var me = this;
                me.isDragging = false;
            },
            openAiModelSettingDialog() {
                this.showAiModelSettingDialog = true;
                this.setAiSettingsRequired(true);
            },
            handleAiSettingsConfirm() {
                this.closeAiModelSettingDialog();
            },
            closeAiModelSettingDialog() {
                this.showAiModelSettingDialog = false;
                this.setAiSettingsRequired(false);
            },
            openStandardDocumentsDialog() {
                this.showStandardDocumentsDialog = true;
            },
            closeStandardDocumentsDialog() {
                this.showStandardDocumentsDialog = false;
            }
        }
    }

</script>
<style>
    .making-btn {
        font-size:16px !important;
        font-weight: 500;
    }
    .question-btn {
        position: absolute;
        top:15px; right:95px;
        font-weight: 700;
        padding:0px 5px 0px 5px !important;
    }
    .making-col {
        padding:20px;
    }
    .making-sub-title {
        font-size:20px;
        font-weight: 700;
        margin-left:20px;
        margin-top:30px;
    }
    .main-nav-modeling-is-mobile:hover {
        color: #2C81D5 !important;
    }
    .main-nav-modeling-is-mobile {
        display:block;
    }
    .upload {
        height: 48px;
        cursor: pointer;
        line-height: 48px;
        padding-left: 16px;
        color: rgba(0, 0, 0, 0.87);
    }

    .upload:hover {
        background-color: #f9f9f9;
    }

    /*.iframe-wrapper {*/
    /*    border: 1px solid gray;*/
    /*    height: 600px;*/
    /*}*/

    /*.vue-friendly-iframe {*/

    /*    height: 35%;*/
    /*    width: 100%;*/
    /*}*/

    /*iframe {*/
    /*    height: 100%;*/
    /*    width: 100%;*/
    /*}*/
    /*iframe {*/
    /*    height: 100%;*/
    /*    width: 100%;*/
    /*}*/
    .text-reader input[type="file"] { /* 파일 필드 숨기기 */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        border: 0;
    }

    .learn-main-search {
        width: 60px !important;
        margin-left: 10px !important;
        margin-right: 10px !important;
    }

    .learn-main-search .v-input__slot {
        min-height: 36px !important;
        width: 100% !important;
        margin-top: 10px;
    }

    .learn-main-search .v-label {
        top: 8px !important;
    }

    .list-type-btn:hover {
        border: 0.1px solid rgba(255, 255, 255) !important;
    }

    .making-main-nav-modeling-is-mobile {
        font-size:16px;
        margin-top:1px;
        font-weight: 700;
        padding:0px 5px 0px 5px !important;
        text-transform: none;
    }
    
    /* 추가 */
    @media only screen and (max-width: 1250px) { 
        .main-nav-modeling-is-mobile {
            display:none;
        }

        .isForeign-not-create-main-nav-is-mobile {
            top: 98px !important;
            margin-right: 48px !important;
        }

        .isForeign-create-main-nav-is-mobile {
            top: 93px !important;
            margin-right: 68px !important;
        }
        .question-btn {
            top:15px;
            right: 100px
        }
    }

    @media only screen and (max-width: 1110px) {
        .app-docs-text, .app-new-text {
            display: none;
        }

        .app-docs-btn, .app-new-btn {
            min-width:32px !important;
            max-width:32px !important;
        }
        
    }

    @media only screen and (max-width: 781px) {
        #textsize {
            font-size: 11px;
        }
    }

    @media only screen and (max-width: 700px) {
        #textsize {
            font-size: 11px;
        }
        
        .question-btn-hide {
            display: none;
        }
    }

    @media only screen and (max-width: 499px) {
        .app-docs-btn, .app-new-btn {
            display:none;
        }
        
        .question-btn {
            top:60px;
            right: 5px
        }

        .isForeign-not-create-main-nav-is-mobile {
            position: absolute;
            top: 143px !important;
            right: 19px !important;
            margin-right: 0px !important;
        }

    }

</style>