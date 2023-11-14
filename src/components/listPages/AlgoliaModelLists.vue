<template>
    <v-container style="max-width: 1500px;">
        <slot name="body">
            <div>
<!--                <AutoModelingDialog-->
<!--                    v-if="showDialog"-->
<!--                    ref="autoModelingDialog"-->
<!--                    mode="project"-->
<!--                    :showChat="true"-->
<!--                    :projectId="projectUid"-->
<!--                    @closeDialog="closeDialog"-->
<!--                ></AutoModelingDialog>-->
                <v-row class="main-tap-list" style="margin-top:-80px; margin-bottom:10px; position:absolute; max-width:60%; min-width:10%; z-index:1; left: 50%; transform: translate(-50%, 0%);">
                    <v-tabs
                        v-model="tabId"
                        :key="renderTabId"
                        background-color="transparent"
                        color="blue darken-1"
                        show-arrows
                        centered
                    >
                        <div v-for="(tabObj,index) in filterTabLists" style="align-self: center;">
                            <v-tab
                                v-if="tabObj.show"
                                :disabled="showLoading && index != selectedTabIndex"
                                :href="`#${tabObj.id}`"
                                :key="tabObj.id"
                                style="height:45px;"
                            >
                                {{tabObj.display}}

                                <v-avatar v-if="index > 0 && tabObj.totalCount!=null" color="green lighten-5" size="30"
                                          style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                    {{tabObj.totalCount == null ? '...': (tabObj.totalCount == 0 ? '0' : tabObj.totalCount)}}
                                </v-avatar>
                            </v-tab>
                        </div>

                        <v-tab
                                v-if="!isOnPrem"
                                :to="'/courses'"
                        >
                        LEARN
                        </v-tab>
                        <v-row style="width:100%; height:57px;" dense>

                            <v-icon @click="searchOpen = !searchOpen" style="width:26px; height:26px; margin-top:16px; margin-left:15px;">mdi-magnify</v-icon>
                        </v-row>
                    </v-tabs>
                </v-row>
                <!-- <v-row class="mobile-tab-list">
                    <div
                        v-for="(tabObj,index) in filterTabLists"
                        :key="tabObj.id"
                    >
                        <v-btn 
                            v-if="tabObj.show"
                            :disabled="showLoading && index != selectedTabIndex"
                            style="height:45px; margin-right: 10px;"
                            text
                            icon
                            @click="tabId = tabObj.id" 
                        >
                            <Icon class="mobile-tab" style="width:24px; height: 24px;" :icon="tabObj.icon" />

                            <v-avatar 
                                v-if="index > 0 && tabObj.totalCount!=null" 
                                color="green lighten-5" 
                                size="22"
                                style="position: absolute; top: -12px; right: -5px; font-size: 10px;"
                            >
                                {{tabObj.totalCount == null ? '...': (tabObj.totalCount == 0 ? '0' : tabObj.totalCount)}}
                            </v-avatar>
                        </v-btn>
                    </div>

                    <v-btn 
                        v-if="!isOnPrem"
                        style="height:45px; margin-right: 5px;"
                        to="/courses"
                        text
                        icon
                    >
                        <Icon class="mobile-tab" style="width:24px; height: 24px;" icon="tabler:book" />
                    </v-btn>

                        <v-btn 
                            @click="searchOpen = !searchOpen" 
                            style="height:45px; margin-right: 5px;" 
                            text 
                            icon
                        >
                            <Icon class="mobile-tab" style="width:24px; height: 24px;" icon="ion:search-outline" />
                        </v-btn>
                </v-row> -->

                <div class="mobile-tab-list" style="position: fixed; bottom:15px; right:30px; z-index:999;">
                    <v-speed-dial
                        v-model="fab"
                        direction="top"
                        transition="slide-y-transition"
                    >
                        <template v-slot:activator>
                            <v-btn
                                v-model="fab"
                                fab
                                depressed
                                dark
                                color="blue darken-2"
                            >
                            <v-icon v-if="fab">
                                mdi-close
                            </v-icon>
                            <v-icon v-else>
                                mdi-menu
                            </v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-tabs
                                v-model="tabId"
                                :key="renderTabId"
                                vertical
                                color="primary"
                            >
                                <v-tab @click="searchOpen = !searchOpen">
                                    <v-icon style="width:26px; height:26px;">mdi-magnify</v-icon>
                                </v-tab>
                                <div v-for="(tabObj,index) in filterTabLists">
                                    <v-tab
                                        v-if="tabObj.show"
                                        :disabled="showLoading && index != selectedTabIndex"
                                        :href="`#${tabObj.id}`"
                                        :key="tabObj.id"
                                        style="height:45px;"
                                    >
                                        {{tabObj.display}}

                                        <v-avatar v-if="index > 0 && tabObj.totalCount!=null" color="green lighten-5" size="30"
                                                style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                            {{tabObj.totalCount == null ? '...': (tabObj.totalCount == 0 ? '0' : tabObj.totalCount)}}
                                        </v-avatar>
                                    </v-tab>
                                </div>
                                <v-tab
                                    v-if="!isOnPrem"
                                    :to="'/courses'"
                                >
                                    LEARN
                                </v-tab>
                            </v-tabs>
                        </v-list>
                    </v-speed-dial>
                </div>

                <v-alert
                        v-if="searchOpen"
                        elevation="2"
                        style="position:fixed; top:50px; z-index:2; height:70px; width:40%; left: 50%; transform: translate(-50%, 0%);"
                >
                    <div>
                        <v-row style="align-items: baseline;">
                            <v-menu offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-chip
                                            :color="selectedMode.color"
                                            dark
                                            style="margin-right: 10px;"
                                            v-bind="attrs"
                                            v-on="on"
                                    >
                                        {{selectedMode.type}}
                                    </v-chip>
                                </template>
                                <v-list>
                                    <v-list-item
                                            v-for="(item, index) in listMode"
                                            :key="index"
                                            @click="selectMode(item)"
                                    >
                                        <v-list-item-title>{{ item.display }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                            <v-text-field
                                    v-model="searchObj.name"
                                    outlined
                                    class="gs-main-search"
                                    :label="searchObj.name ? filterListsCount : 'Search for name'"
                                    autofocus
                                    hide-details
                                    dense
                            ></v-text-field>
                            <v-icon @click="searchClose(true)" style="width:26px; height:26px; margin-top: 13px;">mdi-close</v-icon>
                        </v-row>
                        <v-row>
                            <v-btn @click="searchClose()" block text style="height: 25px"> <v-icon>mdi-chevron-up</v-icon> </v-btn>
                        </v-row>
                    </div>
                </v-alert>

                <v-tabs-items v-model="selectedTabIndex">
                    <v-tab-item v-if="selectedTabIndex == -1" :value="selectedTabIndex">
                        <!-- SEARCH -->
                        <v-row style="margin-top:0px;">
                            <v-col v-if="showLoading || (filteredList == undefined && typeof filteredList == 'undefined')"
                                   style="height: 100%;">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <EventStormingListCard
                                        :information="project"
                                        @delete="deleteProjectItem"
                                        @openAutoModelingDialog=openAutoModelingDialog
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </EventStormingListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>

                    <v-tab-item v-else-if="selectedTabIndex == 0" :value="selectedTabIndex">
                        <!-- HOME -->
                        <div class="clearfix gs-main-page-top-box">
                            <div class="gs-main-page-title-box">
                                <transition name="fade" mode="out-in">
                                    <div v-if="showMainText" key="1">
                                        <div class="gs-main-page-top-title">{{$t('main.title')}}</div>
                                        <div class="gs-main-page-sub-title">{{$t('main.content1')}}<br>
                                            {{$t('main.content2')}}<br>
                                            {{$t('main.content3')}}
                                        </div>
                                    </div>

                                    <div v-else key="2">
                                        <div class="gs-main-page-top-title">{{$t('main.title2')}}</div>
                                        <div class="gs-main-page-sub-title">{{$t('main.content4')}}<br>
                                            {{$t('main.content5')}}<br>
                                            {{$t('main.content6')}}<br>
                                            {{$t('main.content7')}}
                                        </div>
                                    </div>
                                </transition>
                            </div>
                            <div class="gs-main-page-top-image">
                                <v-img src="https://user-images.githubusercontent.com/59447401/211722720-3e35a11a-e2ff-4232-9d99-c52f80f04692.png"></v-img>
                            </div>
                        </div>
                        <v-col class="gs-main-page-top-box-mobile" align="center">
                            <div class="gs-main-page-top-image-mobile">
                                <v-img class="main-logo-image" src="https://github.com/kyusooK/spring-boot-acme-k/assets/123912988/79774ba2-2618-47d0-ab7e-8ef760c077e7"></v-img>
                                <v-img class="main-chair-image" src="https://user-images.githubusercontent.com/59447401/211722720-3e35a11a-e2ff-4232-9d99-c52f80f04692.png"></v-img>
                                
                            </div>
                            <transition name="fade" mode="out-in">
                                <div v-if="showMainText" key="1">
                                    <div class="gs-main-page-top-title-mobile">{{$t('main.title')}}</div>
                                    <div class="gs-main-page-sub-title-mobile">{{$t('main.content1')}}<br>
                                        {{$t('main.content2')}}<br>
                                        {{$t('main.content3')}}
                                    </div>
                                </div>
                                <div v-else key="2">
                                    <div class="gs-main-page-top-title-mobile">{{$t('main.title2')}}</div>
                                    <div class="gs-main-page-sub-title-mobile">{{$t('main.content4')}}<br>
                                            {{$t('main.content5')}}<br>
                                            {{$t('main.content6')}}<br>
                                            {{$t('main.content7')}}
                                    </div>
                                </div>
                            </transition>
                        </v-col>
                        <AutoModelingDialog
                            mode="es"
                            :showDialog="false"
                            :showChat="true"
                            @startCreateModel="openCanvas"
                            :projectId="null"
                        ></AutoModelingDialog>
                        <div class="title-page-title gs-modeling-tools-title-page-title">{{$t('tools.modeling')}}</div>
                        <v-row class="title-page-card-box-row">
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="title-page-card-box"
                                        outlined
                                >
                                    <v-card-title style="text-align: center;" class="home-card-title">{{$t('tools.eventstorming')}}</v-card-title>
                                    <v-img @click="moveToPages('es')"
                                           class="introduction-img"
                                           src="https://user-images.githubusercontent.com/113568664/208291359-e7ce6d88-776b-4447-a236-d7a1cddadcf4.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.eventstorming-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('es')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('es')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="moveToPages('es')">{{$t('tools.create-btn')}}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        outlined
                                        class="title-page-card-box"
                                >
                                    <v-card-title style="text-align: center;" class="home-card-title">{{$t('tools.kubernetes')}}</v-card-title>
                                    <v-img @click="moveToPages('k8s')"
                                           class="introduction-img"
                                           src="https://user-images.githubusercontent.com/113568664/208291286-15b57907-3126-48f6-bf71-490df5ce027d.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.kubernetes-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('k8s')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('k8s')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="moveToPages('k8s')">{{$t('tools.create-btn')}}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        outlined
                                        class="title-page-card-box"
                                >
                                    <v-card-title style="text-align: center;" class="home-card-title">{{$t('tools.bmc')}}</v-card-title>
                                    <v-img @click="moveToPages('bm')"
                                           class="introduction-img"
                                           src="https://user-images.githubusercontent.com/92732781/233012222-d0662c4b-5546-4e7b-af28-c07617a57ef0.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.bmc-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed disabled text @click="goTutorials('bm')">{{$t('tools.tutorial-btn')}}
                                        </v-btn>
                                        <v-btn small depressed disabled text @click="goVideo('bm')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="moveToPages('bm')">{{$t('tools.create-btn')}}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        outlined
                                        class="title-page-card-box"
                                >
                                    <v-card-title style="text-align: center;" class="home-card-title">{{$t('tools.bpmn')}}</v-card-title>
                                    <v-img @click="moveToPages('bpmn')"
                                           class="introduction-img"
                                           src="https://user-images.githubusercontent.com/92732781/233012303-64841fa2-2952-43eb-a768-f75be9a73679.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.bpmn-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('bpmn')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('bpmn')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="moveToPages('bpmn')"> {{$t('tools.create-btn')}}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                        <div class="title-page-title">{{$t('tutorials.tutorial')}}</div>
                        <v-row class="title-page-card-box-row">
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="red"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.biz')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('ggd')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271741-4e4cdd7a-37af-4445-902c-a3229c392e6e.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.ddd')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.ddd-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('run-mu')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271746-a3f5fce0-ad12-4cf3-88cb-a6348d990044.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.unit')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.unit-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('req-res')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271766-11c1234e-8ee9-4ef5-9c4a-36df00530766.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.reqres')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.reqres-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('cb')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271764-07de1f1c-96de-49fe-99ea-d12c658a8644.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.cb')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.cb-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('pub-sub')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271759-4bb531e0-e8ad-4964-a8f7-65ceae30c79c.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.pubsub')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.pubsub-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('com-cor')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271747-7c7d01e4-30c6-4b44-804c-be834713d8fa.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.comcor')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.comcor-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('jwt-auth')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271754-e0c813d9-9f85-4af5-8770-4ddce2383d90.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.jwt')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.jwt-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('dp-fh')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271752-19bcfa58-61f0-47ca-9e42-b3e017eda354.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.hateoas')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.hateoas-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('dp-gql')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/211271748-f3662a80-cb9b-4190-96e9-33a5b244b1f5.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.graphql')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.graphql-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-row style="margin-left: 3px; margin-top:0px; margin-bottom:-25px;">
                                        <v-chip
                                                class="ma-2"
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                        <a @click="moveToPages('axon')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/225213375-c0dcc8cc-c696-48f0-be8d-b0330f6b9ee5.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <v-list-item-subtitle class="mb-1" style="font-weight: 500; font-size:14px; color:black;">
                                                {{$t('tutorials.axon')}}
                                            </v-list-item-subtitle>
                                            <div style="font-size:12px; color:#757575;">{{$t('tutorials.axon-inst')}}</div>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                        </v-row>
                        <div class="title-page-title">{{$t('examples.modeling')}}</div>
                        <v-row class="title-page-card-box-row">
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('petshop')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/92732781/163898754-62dc9532-5505-41b0-852b-6070ac817eff.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.pet')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/e25a97f84aa34376697cc220496a9608'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('food-delivery')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/92732781/163902964-56a0dc31-b069-4bd0-8b15-9d52a1dc84eb.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.food')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/2737b4f61c1ea85e3de602479ddc1e3a'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('shop')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/92732781/163904161-c15eba6a-be32-4ee5-9541-f258ef72f7a4.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.shop')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/0f89dcccd80e9ec9fb6540c3236cfe2b'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('k8s-blueprint')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/92732781/163903262-60260260-dae9-47f9-bf88-1bdc6fe7de88.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.k8s')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/e8f1d14ea6a9a714f79f73aa4fff0601'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('google-drive')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/92732781/163904696-8f9202b3-2301-4ca4-bae6-f90f9a07d64e.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.google')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/d8525abb1acc3cf621b6aacf371fa4be'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>

                            <v-col
                                    lg="3"
                                    md="4"
                                    sm="6"
                                    xs="12"
                            >
                                <v-card
                                        class="mx-auto"
                                        width="356"
                                        min-height="150"
                                        outlined
                                >
                                    <v-list-item three-line>
                                        <a @click="moveToPages('axonex')">
                                            <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                                   src="https://user-images.githubusercontent.com/113568664/224649981-78c46486-4ef0-46e6-b861-2f1a662c4c91.png">
                                            </v-img>
                                        </a>
                                        <v-list-item-content>
                                            <div style="margin-top:10px; font-weight: 500; font-size:16px; color:black;">
                                                {{$t('examples.axon')}}
                                            </div>
                                            <v-card-actions class="title-card-actions-btn" style="margin-bottom:-15px;">
                                                <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                                       :to="'/storming/human-resource-mgmt-0303:v0.0.1'">
                                                    {{$t('examples.enter-btn')}}
                                                </v-btn>
                                            </v-card-actions>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                    <v-tab-item v-else-if="0 < selectedTabIndex && selectedTabIndex < 4" :value="selectedTabIndex" :key="selectedTabIndex">
                        <!-- MINE, SHARE,PUBLIC -->
                        <v-row style="margin-top:0px;">
                            <v-col v-if="showLoading || (filteredList == undefined && typeof filteredList == 'undefined')"
                                   style="height: 100%;">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <EventStormingListCard
                                        :information="project"
                                        @delete="deleteProjectItem"
                                        @openAutoModelingDialog=openAutoModelingDialog
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </EventStormingListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                    <v-tab-item v-else-if="selectedTabIndex == 4" :value="selectedTabIndex">
                        <!-- LOCAL -->
                        <v-row style="margin-top:0px;">
                            <v-col v-if="(showLoading && filteredList && filteredList.length < 10) || filteredList == undefined && typeof filteredList == 'undefined'"
                                   style="height: 100%;">
                                <v-row>
                                    <v-col
                                            v-for="idx in 9"
                                            cols="6"
                                            md="4"
                                    >
                                        <v-card
                                                outlined
                                                class="mx-auto"
                                                style="width: 500px; height: 400px; justify-content: center"
                                                align="center"
                                        >
                                            <v-skeleton-loader
                                                    ref="skeleton"
                                                    type="card"
                                                    class="mx-auto"
                                            >
                                            </v-skeleton-loader>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col v-else-if="filteredList == null && typeof filteredList == 'object' "
                                   style="height: 590px;">
                                No Items
                            </v-col>
                            <v-col
                                    v-else
                                    v-for="(project,index) in filteredList"
                                    :key="project.projectId"
                                    xl="4"
                                    lg="4"
                                    md="6"
                                    sm="12"
                            >
                                <EventStormingListCard
                                        :information="project"
                                        @delete="deleteProjectItem"
                                        @openAutoModelingDialog=openAutoModelingDialog
                                >
                                    <template slot="chips">
                                        <slot name="chips"></slot>
                                    </template>
                                    <template slot="action" slot-scope="project">
                                        <slot name="action" :project="project"></slot>
                                    </template>
                                </EventStormingListCard>
                            </v-col>
                        </v-row>
                    </v-tab-item>
                </v-tabs-items>
                <div style="text-align-last: center;" v-if="selectedTabIndex != 0 ">
                    <div v-if="showLoadingForMorePage" class="ticontainer" style="margin-left: 50%; margin-top: 30px;">
                        <div class="tiblock">
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                            <div class="tidot"></div>
                        </div>
                    </div>
                    <div v-if="!showLoading && !showMoreButton" block text style="padding:10px 0 10px 0;">마지막 페이지</div>
                    <v-row v-else-if="showLoading && showMoreButton">
                        <v-col
                                v-for="idx in 9"
                                cols="6"
                                md="4"
                        >
                            <v-card
                                    outlined
                                    class="mx-auto"
                                    style="width: 500px; height: 400px; justify-content: center;"
                                    align="center"
                            >
                                <v-skeleton-loader
                                        ref="skeleton"
                                        type="card"
                                        class="mx-auto"
                                >
                                </v-skeleton-loader>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </slot>

        <slot name="footer">
            <div style="min-height: 190px;">
                <v-footer padless>
                    <ProvisionIndication :style="!showLoading && showMoreButton ? 'padding-top:40px':''"
                                         divider></ProvisionIndication>
                </v-footer>
            </div>
        </slot>


        <v-dialog v-model="deleteDialog" v-if="deleteItem" persistent max-width="470">
            <v-card>
                <v-card-title class="headline">{{$t('word.deleteNotification')}}</v-card-title>
                <v-img :src="deleteItem.img"></v-img>
                <v-card-text>AuthorEmail: {{ deleteItem.authorEmail ? deleteItem.authorEmail.split('@')[0] : 'anyone' }}
                </v-card-text>
                <v-card-text>ProjectName: {{deleteItem.projectName ? deleteItem.projectName : 'untitled'}}</v-card-text>
                <v-card-text>date: {{convertTimeStampToDate(deleteItem.createdTimeStamp)}}</v-card-text>
                <v-card-text>LastModifiedDate: {{convertTimeStampToDate(deleteItem.lastModifiedTimeStamp)}}</v-card-text>
                <v-card-text>## 알림 ## "공유"된 파일의 경우 공동작업자가 사본을 생성할 수 있습니다.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDeleteDialog()">{{$t('word.close')}}</v-btn>
                    <v-btn color="red darken-1" text @click="deleteProject()">{{$t('word.delete')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";
    import {YoutubeIcon} from 'vue-feather-icons'
    import 'instantsearch.css/themes/satellite-min.css';
    import AutoModelingDialog from '../designer/modeling/AutoModelingDialog.vue';
    // import VueCookies from "vue-cookies";
    var _ = require('lodash');

    export default {
        name: 'algolia-model-lists',
        mixins: [CommonStorageBase],
        components: {
            'EventStormingListCard': () => import('./EventStormingListCard'),
            'ProvisionIndication': () => import('../payment/ProvisionIndication'),
            YoutubeIcon,
            AutoModelingDialog,
        },
        data() {
            return {
                projectUid: "",
                showDialog: false,
                showMainText: true,
                fab: false,
                labURLNumber: 4,
                showLoadingForMorePage: false,
                //tabs
                tabId: 'home',
                setFirstTime: true,
                tabLists: [
                    { id: 'home'  , display: 'Home'  , show: true, },
                    { id: 'mine'  , display: 'Mine'  , show: false, count: 0, totalCount: null, },
                    { id: 'public', display: 'Public', show: false , count: 0, totalCount: null, },
                    { id: 'share' , display: 'Shared', show: false, count: 0, totalCount: null, },
                    { id: 'local' , display: 'Local' , show: true , count: 0, totalCount: null, },
                ],
                //list
                public: undefined,
                mine: undefined,
                share: undefined,
                local: undefined,
                //search
                searchOpen: false,
                searchObj:{
                  name: '',
                  type: 'all'
                },
                mouseOverOpenList: false,
                listMode: [
                    {type: 'es', display: 'EventStorming', color: 'green'},
                    {type: 'k8s', display: 'Kubernetes', color: '#3498db'},
                    {type: 'bm', display: 'Business model canvas', color: '#bdc3c7'},
                    {type: 'uml', display: 'UML', color: '#45AAF2'},
                    {type: 'bpmn', display: 'BPMN', color: '#34495e'},
                    {type: 'sticky', display: 'STICKY NOTE', color: 'purple'},
                    {type: 'all', display: 'All', color: 'primary'},
                ],
                //delete
                deleteItem: null,
                deleteDialog: false,

                //loading
                showLoading: false,
                showInitVideos: {
                    show: null,
                    id: ['aC3LgJZ6XIU', 'L-y2aju--v0', 'iZhq2pT8UPc', '7_n8KHi7eWc', '4J8mViMo8lE']
                },
                currentVideoIndex: 0,
                checkbox: false,
                firstVideo: false,
                secondVideo: false,
                thirdVideo: false,
                forthVideo: false,
                fifthVideo: false,
                renderTabId: 0,
            }
        },
        beforeDestroy() {
            console.log('Ev beforeDestroy')
        },
        async created() {
            this.labURL = window.location.href.split('/');
            this.showLoading = true;
            this.$EventBus.$emit('showNewButton', true);
            // this.tabId = localStorage.getItem('tabId') ? localStorage.getItem('tabId') : 'home'
            if(window.MODE == 'bpm') {
                this.tabLists= [
                        { id: 'home'  , display: 'Home'  , show: true },
                        { id: 'mine'  , display: 'Mine'  , show: true, count: 0, totalCount: null },
                        { id: 'public', display: 'Public', show: true , count: 0, totalCount: null },
                        // { id: 'share' , display: 'Shared', show: false, count: 0, totalCount: null },
                        // { id: 'local' , display: 'Local' , show: true , count: 0, totalCount: null },
                    ]
            }
                
            // if(this.isOnPrem){
            //     this.labURLNumber = 3
            // }
            await this.setUserInfo();
            this.initPage();


            this.$EventBus.$emit('progressValue', false);
        },
        mounted() {
            var me = this

            setInterval(me.toggleMainTexts, 5000);
            $(window).scroll(function () {
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if (!me.showLoading && me.showMoreButton && !me.searchObj.name) {
                        if (!me.showLoadingForMorePage) {
                            me.settingMorePage()
                        }
                    }
                }
            });

            me.$EventBus.$on('searchItem', function (value, type, isModeling) {
                if (isModeling) {
                    me.showLoading = true
                    me.searchObj.name = value
                    me.searchObj.type = type ? type : 'all'
                }
            });
            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal
            });

            // Vue.use(VueCookies);
            // Vue.$cookies.config("7d");
            var cookies = me.$cookies.get("unactivateYoutube");
            if (cookies == "true") {
                me.showInitVideos.show = false
                me.checkbox = true
            } else {
                me.showInitVideos.show = true
                me.checkbox = false
            }
        },
        watch: {
            "searchObj":{
                deep: true,
                handler:_.debounce(
                    function () {
                        var me = this
                        if (me.searchOpen) {
                            me.settingSearchPage()
                        } else {
                            me.settingFirstPage(true)
                        }

                    }, 300
                ),
            },

            // "search":
            //     _.debounce(
            //         function () {
            //             var me = this
            //             if (me.search) {
            //                 me.settingSearchPage()
            //             } else {
            //                 me.settingFirstPage(true)
            //             }
            //
            //         }, 300
            //     ),
        },
        computed: {
            selectedMode(){
              return this.listMode.find(x=>x.type == this.searchObj.type);
            },
            isOnPrem() {
                if(window.MODE == 'onprem' || window.MODE == "bpm")
                    return true
                else
                    return false
            },
            myUid() {
                if (this.userInfo.uid) {
                    return this.userInfo.uid
                }
                return localStorage.getItem("uid") ? localStorage.getItem("uid") : 'anyone';
            },
            standardTabCount() {
                return 5
            },
            selectedTabIndex(){
                var me = this
                if(me.searchOpen){
                    return -1;
                }
                if(me.setFirstTime || me.tabId == '/courses'){
                    me.tabId = me.labURL[me.labURLNumber].match(/[#]?([A-Za-z0-9\s]+)/i) ? me.labURL[me.labURLNumber].match(/[#]?([A-Za-z0-9\s]+)/i)[1]: 'home';
                    me.setFirstTime = false 
                } 
                // me.tabId = me.tabId == '/courses' ? localStorage.getItem('tabId') : me.tabId

                var tabType = me.tabId == 'home' ? '': `#${me.tabId.toLowerCase()}`
                                if (me.labURL && me.labURL[me.labURLNumber]) {
                    me.labURL[me.labURLNumber] = tabType
                    window.location.href = me.labURL.join('/')
                } else {
                    window.location.href = window.location.href + tabType
                    me.labURL = window.location.href.split('/')
                }
                return me.filterTabLists.findIndex(item => item.id == me.tabId)
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    me.tabLists.filter(function(tabItem){
                        tabItem.show = true
                    });
                } else {
                    me.tabLists.filter(function(tabItem){
                        if(tabItem.id == 'mine' || tabItem.id == 'share'  || tabItem.id == 'public' ){
                            tabItem.show = false
                        }else {
                            tabItem.show = true
                        }
                    });
                }
                return me.tabLists
            },
            searchCount() {
                var me = this
                var cnt = 0
                if (me.filteredPublic)
                    cnt = cnt + me.filteredPublic.length
                if (me.filteredMine)
                    cnt = cnt + me.filteredMine.length
                if (me.filteredShared)
                    cnt = cnt + me.filteredShared.length
                if (me.filteredLocal)
                    cnt = cnt + me.filteredLocal.length

                return cnt
            },
            showMoreButton() {
                var me = this
                if (me.searchObj.name) {
                    return false
                }
                if ( me.filterTabLists[me.selectedTabIndex] && ( me.selectedTabIndex < me.standardTabCount) ) {
                    if (me.filterTabLists[me.selectedTabIndex].totalCount < 9 || me.filterTabLists[me.selectedTabIndex].count == me.filterTabLists[me.selectedTabIndex].totalCount ) {
                        return false
                    } else if (me.filterTabLists[me.selectedTabIndex].count < me.filterTabLists[me.selectedTabIndex].totalCount) {
                        return true
                    }
                }
            },
            filteredList() {
                var me = this
                var lists = undefined
                if(me.searchOpen){
                    lists = []
                    lists = lists.concat(me.filteredPublic ? me.filteredPublic: []);
                    lists = lists.concat(me.filteredMine ? me.filteredMine: []);
                    lists = lists.concat(me.filteredLocal ? me.filteredLocal: []);
                    lists = lists.concat(me.filteredShared? me.filteredShared: []);
                } else {
                    // var findIndex = me.filterTabLists.findIndex(tab)
                    if (me.filterTabLists[me.selectedTabIndex].id == 'public') {
                        console.log( this.filteredPublic)
                        lists = this.filteredPublic
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'mine') {
                        lists = this.filteredMine
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'share') {
                        lists = this.filteredShared
                    } else if (me.filterTabLists[me.selectedTabIndex].id == 'local') {
                        lists = this.filteredLocal
                    }
                }

                me.renderTabId++;

                if( !lists ) {
                    return lists;
                }

                if( lists.length == 0 ){
                    return lists = null;
                }

                return lists.sort(function (a, b) {
                    let aTime = a.lastModifiedTimeStamp ? a.lastModifiedTimeStamp : a.lastModifiedDate
                    let bTime = b.lastModifiedTimeStamp ? b.lastModifiedTimeStamp : b.lastModifiedDate
                    return bTime - aTime;
                });
            },
            filteredPublic() {
                var list = undefined
                if (this.public) {
                    list = this.public
                } else {
                    list = null
                }
                return list
            },
            filteredMine() {
                var list = undefined
                if (this.mine) {
                    list = this.mine
                } else {
                    list = null
                }
                return list
            },
            filteredShared() {
                var list = undefined
                if (this.share) {
                    list = this.share
                } else {
                    list = null
                }
                return list

            },
            filteredLocal() {
                var list = undefined
                if (this.local) {
                    list = this.local
                    return list.sort(function (a, b) {
                        let aTime = a.lastModifiedTimeStamp ? a.lastModifiedTimeStamp : a.lastModifiedDate
                        let bTime = b.lastModifiedTimeStamp ? b.lastModifiedTimeStamp : b.lastModifiedDate
                        return bTime - aTime;
                    });
                }else {
                    list = null
                }
                return list

            },
            filterListsCount() {
                var me = this

                if (me.showLoading) {
                    return '검색중..'
                } else {
                    return `검색 결과 : 총 ${me.searchCount} 건 찾았습니다.`
                }

            },
        },
        methods: {
            closeDialog(){
                this.showDialog = false
            },
            openAutoModelingDialog(projectId){
                this.showDialog = true
                this.projectUid = projectId
            },
            toggleMainTexts() {
                this.showMainText = !this.showMainText;
            },
            selectMode(item){
                this.searchObj.type = item.type
            },
            openCanvas(val){
                var me = this
                var dbuid = me.dbuid()
                localStorage.setItem(dbuid + '-model-info', JSON.stringify(val))
                //localStorage.setItem(dbuid + '-Project-Name', val.name)
                // localStorage.setItem(dbuid + '-Scenario', val.result)
                if(val.type == 'ES'){
                    me.$router.push({path: `storming/${dbuid}`});
                } else if(val.type == 'BM'){
                    me.$router.push({path: `business-model-canvas/${dbuid}`});
                }
            },  
            searchClose(close) {
                var me = this
                if(close) me.searchObj.name = '';
                if(close) me.searchObj.type = 'all';
                me.searchOpen = false
                me.mouseOverOpenList = false
            },
            moveToPages(type) {
                var me = this
                try {
                    let path = `storming/${me.dbuid()}`;
                    if (!type) type = 'es'

                    if (type == 'es') {
                        path = `storming/${me.dbuid()}`
                        // me.$router.push({path: `storming/${me.dbuid()}`});
                    } else if (type == 'k8s') {
                        path = `kubernetes/${me.dbuid()}`
                        // me.$router.push({path: `kubernetes/${me.dbuid()}`});
                    } else if (type == 'bm') {
                        path = `business-model-canvas/${me.dbuid()}`
                        // me.$router.push({path: `business-model-canvas/${me.dbuid()}`});
                    } else if (type == 'bpmn') {
                        path = `bpmn/${me.dbuid()}`
                        // me.$router.push({path: `bpmn/${me.dbuid()}`});
                    } else if (type == 'axonex') {
                        path = `/storming/human-resource-mgmt-0303:v0.0.1`
                        // me.$router.push({path: `/storming/human-resource-mgmt-0303:v0.0.1`});
                    } else if (type == 'petshop') {
                        path = `/storming/e25a97f84aa34376697cc220496a9608`
                        // me.$router.push({path: `/storming/e25a97f84aa34376697cc220496a9608`});
                    } else if (type == 'food-delivery') {
                        path = `/storming/2737b4f61c1ea85e3de602479ddc1e3a`
                        // me.$router.push({path: `/storming/2737b4f61c1ea85e3de602479ddc1e3a`});
                    } else if (type == 'shop') {
                        path = `/storming/0f89dcccd80e9ec9fb6540c3236cfe2b`
                        // me.$router.push({path: `/storming/0f89dcccd80e9ec9fb6540c3236cfe2b`});
                    } else if (type == 'k8s-blueprint') {
                        path = `/kubernetes/e8f1d14ea6a9a714f79f73aa4fff0601`
                        // me.$router.push({path: `/kubernetes/e8f1d14ea6a9a714f79f73aa4fff0601`});
                    } else if (type == 'google-drive') {
                        path = `/storming/d8525abb1acc3cf621b6aacf371fa4be`
                        // me.$router.push({path: `/storming/d8525abb1acc3cf621b6aacf371fa4be`});
                    } else if (type == 'cna-full-course') {
                        path = `/courses/cna-full/full-course-cna`
                        // me.$router.push({path: `/courses/cna-full/full-course-cna`});
                    } else if (type == 'object-oriented') {
                        path = `/courses/objectOrientedBasics/objectOrientedBasics`
                        // me.$router.push({path: `/courses/objectOrientedBasics/objectOrientedBasics`});
                    } else if (type == 'bpm-with-uEngine5') {
                        path = `/courses/bpm/bpm`
                        // me.$router.push({path: `/courses/bpm/bpm`});
                    } else if (type == 'axon') {
                        path = `/courses/cna-full-english/cna-full-english/axon-template`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/axon-template`});
                    } else if (type == 'ggd') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-ddd-google-drive`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/ddd-google-drive-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-ddd-google-drive`});
                    } else if (type == 'run-mu') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-cna-start-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/cna-start-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-cna-start-2022`});
                    } else if (type == 'req-res') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-monolith-2-misvc-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/monolith-2-misvc-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-monolith-2-misvc-2022`});
                    } else if (type == 'pub-sub') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-pub-sub-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/pub-sub-2022-assocaiate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-pub-sub-2022`});
                    } else if (type == 'com-cor') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-compensation-correlation-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/compensation-correlation-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-compensation-correlation-2022`});
                    } else if (type == 'dp-gql') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-dp-graphql-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/dp-graphql-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-dp-graphql-2022`});
                    } else if (type == 'cb') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-circuit-breaker-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/circuit-breaker-2022-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-circuit-breaker-2022`});
                    } else if (type == 'jwt-auth') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-Oauth2withKeycloak`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/Oauth2withKeycloak-associate`
                        // me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-Oauth2withKeycloak`});
                    } else if (type == 'dp-fh') {
                        path = me.isForeign ?
                            `/courses/cna-full-english/cna-full-english/en-dp-frontend-2022`:
                            `/courses/fea33dd0-8030-11ed-9757-3db21672e322/1f2deec0-c856-11ed-aa53-950d34db487f/dp-frontend-2022-associate`
                        // me.$router.push({path: `courses/cna-full-english/cna-full-english/en-dp-frontend-2022`});
                    }
                    if(window.MODE != "bpm")
                        me.$router.push({path: path});
                } catch (e) {
                    alert('Error-NewProject', e)
                }

            },
            showVideo(i) {
                var me = this;
                if (i == 1) {
                    me.firstVideo = !me.firstVideo;
                } else if (i == 2) {
                    me.secondVideo = !me.secondVideo;
                } else if (i == 3) {
                    me.thirdVideo = !me.thirdVideo;
                } else if (i == 4) {
                    me.forthVideo = !me.forthVideo;
                } else if (i == 5) {
                    me.fifthVideo = !me.fifthVideo;
                }
            },
            unactivateYoutube() {
                var me = this
                // Vue.use(VueCookies);
                // Vue.$cookies.config("7d");

                // me.selectedIndex = 0;

                if (me.checkbox) {
                    me.showInitVideos.show = false;
                    me.$cookies.set("unactivateYoutube", "true");
                } else {
                    me.$cookies.set("unactivateYoutube", "false");
                }

            },
            goVideo: function (type) {
                if (type == 'es') {
                    if (this.isForeign) {
                        window.open(" https://www.youtube.com/watch?v=G46GbI8aa3o&list=PLEr96Fo5umW9w_5SmjXhOar1xRRWcZsbB&index=1", "_blank");
                    } else {
                        window.open("https://www.youtube.com/watch?v=BqKfq3ASU1g&list=PLEr96Fo5umW99TW0kmXQHzL3XEztDXPjI", "_blank");
                    }
                } else if (type == 'k8s') {
                    window.open("https://www.youtube.com/watch?v=vtPtymnmo6M&list=PLEr96Fo5umW8oIZrO0bLVUWaqPOuB3msk&index=1", "_blank");
                } else if (type == 'bpmn') {
                    window.open("https://www.youtube.com/watch?v=9RtGeyvZrJo&t=4s", "_blank");
                }

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
            displayCnt(tabId) {
                var me = this
                if (tabId == 'local' && me.local) {
                    if (me.searchObj.type == 'all') {
                        return me.local.length
                    } else {
                        return me.local.filter(project => project.type == me.searchObj.type).length
                    }

                } else if (tabId == 'mine' && me.mine) {
                    if (me.searchObj.type == 'all') {
                        return me.mine.length
                    } else {
                        return me.mine.filter(project => project.type == me.searchObj.type).length
                    }
                } else if (tabId == 'share' && me.share) {
                    if (me.searchObj.type == 'all') {
                        return me.share.length
                    } else {
                        return me.share.filter(project => project.type == me.searchObj.type).length
                    }
                } else if (tabId == 'public' && me.public) {
                    if (me.searchObj.type == 'all') {
                        return me.public.length
                    } else {
                        return me.public.filter(project => project.type == me.searchObj.type).length
                    }
                }
                return 0
            },
            initPage() {
                var me = this
                me.settingFirstPage();
            },
            async onLoadLocalModel(){
                var me = this
                try {
                    let result = await me.list(`localstorage://localLists`);
                    result = result ? JSON.parse(result) : null;
                    let cnt = result ? result.length : 0

                    return {lists : result, count: cnt, totalCount: cnt }
                }catch(e){
                    console.log(`Error] Load LocalModel: ${e}`)
                }
            },

            async onLoadServerModel(options){
                var me = this;
                try{
                    let search = me.searchObj.name ? me.searchObj.name :''
                    let result = await me.$searchIndex.search(search, options)
                    let lists = result ? result.hits : null;
                    let cnt = lists ? lists.length : 0

                    return {lists : lists, count: cnt, totalCount: result.nbHits }
                }catch (e) {
                    console.log(`Error] Load ServerModel: ${e}`)
                }
            },
            async settingFirstPage(init) {
                var me = this
                try{
                    if (me.selectedTabIndex < me.standardTabCount) {
                        let tabId = me.filterTabLists[me.selectedTabIndex].id;


                        if (init) {
                            me.showLoading = true
                            me.initLists(tabId)
                        }

                        for(let obj of me.filterTabLists) {
                            if(obj.id != 'home') {
                                let result = null
                                if(obj.id == 'local' && obj.show){
                                    result = await me.onLoadLocalModel();
                                    if(me.searchObj.name){
                                        result.lists = result.lists.filter(item => item.projectName && item.projectName.includes(me.searchObj.name));
                                    }

                                    if(me.searchObj.type != 'all'){
                                        result.lists = result.lists.filter(item => item.type == me.searchObj.type);
                                    }
                                    me.local = result.lists
                                } else if(obj.id == 'mine'&& obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        let data = await this.list(`db://userLists/${me.userInfo.uid}/mine`)
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map(x =>x.versions = null);
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `authorId:${me.userInfo.uid}`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                        result.lists.map(x =>x.versions = null);
                                    }
                                    me.mine = result.lists
                                } else if(obj.id == 'share' && obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        let data = await this.getObject(`db://userLists/${me.userInfo.uid}/share`)
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map((x,idx) =>{
                                            x.versions = null
                                            if(!x.projectId) {
                                                result.lists[idx] = null
                                            }
                                        });
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `permissions:${me.userInfo.uid}`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                    }
                                    
                                    me.share = result.lists
                                } else if(obj.id == 'public' && obj.show){
                                    if(window.MODE == 'bpm' || window.MODE == 'onprem') {
                                        // let result = {}
                                        let data = await this.getObject("db://definitions")
                                        result = await this.setListByAcebase(data)
                                        await Promise.all([result])
                                        result.lists.map((x,idx) =>{
                                            x.versions = null
                                            if(!x.projectId) {
                                                result.lists[idx] = null
                                            }
                                        });
                                        let newArr = result.lists.filter((element, i) => element != null);
                                        result.count = newArr.length
                                        result.totalCount = newArr.length
                                        result.lists = newArr
                                    } else {
                                        result = await me.onLoadServerModel({
                                            filters: `permissions:everyone`,
                                            tagFilters: '-associatedProject', // - is Negation
                                            hitsPerPage: 9,
                                        });
                                        result.lists.map(x =>x.versions = null);
                                    }
                                    me.public = result.lists
                                }
                                // console.log(result)
                                obj.count = result ? result.count : 0
                                obj.totalCount = result ? result.totalCount : 0
                            }
                        }
                    }
                }catch (e) {
                    console.log(e)
                }finally {
                    me.showLoading = false
                }
            },
            setListByAcebase(data) {
                return new Promise(function (resolve, reject) {
                    try {
                        let result = {}
                        result.lists = []
                        if(data != null && Object.keys(data).length != 0) {
                            const keys = Object.keys(data);
                            keys.forEach(function (key, idx) {
                                if(data[key].information)
                                    result.lists.push(data[key].information)
                                else 
                                result.lists.push(data[key])
                                if(keys.length-1 == idx) {
                                    resolve(result)
                                }
                            })
                        } else {
                            console.log("return? - null")
                            result.count = 0
                            result.totalCount = 0
                            resolve(result)
                        }
                    } catch (e) {
                        console.log(e)
                        reject()
                    }
                })
            },
            async settingSearchPage() {
                var me = this
                try {
                    me.showLoading = true

                    for(let obj of me.filterTabLists) {
                        if (obj.id != 'home') {
                            let result = null
                            if (obj.id == 'local' && obj.show) {
                                result = await me.onLoadLocalModel();

                                if(me.searchObj.name){
                                    result.lists = result.lists.filter(item => item.projectName && item.projectName.includes(me.searchObj.name));
                                }

                                if(me.searchObj.type != 'all'){
                                    result.lists = result.lists.filter(item => item.type == me.searchObj.type);
                                }

                                me.local = result.lists
                            } else if (obj.id == 'mine' && obj.show) {
                                let filters = `authorId:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.mine = result.lists
                            } else if (obj.id == 'share' && obj.show) {
                                let filters = `permissions:${me.userInfo.uid}`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.share = result.lists
                            } else if (obj.id == 'public' && obj.show) {
                                let filters = `permissions:everyone`;
                                filters = me.searchOpen && me.searchObj.type != 'all' ? filters.concat(` AND type:${me.searchObj.type}`) : filters

                                result = await me.onLoadServerModel({
                                    filters: filters,
                                    tagFilters: '-associatedProject', // - is Negation
                                    alternativesAsExact: ['multiWordsSynonym'],
                                    hitsPerPage: 9,
                                });
                                me.public = result.lists
                            }
                            obj.count = result ? result.count : 0
                            obj.totalCount = result ? result.totalCount : 0
                        }
                    }

                } catch (e) {
                    alert(e.message)
                }finally {
                    me.showLoading = false
                }

            },
            async settingMorePage() {

                var me = this
                if (me.selectedTabIndex < me.standardTabCount) {
                    me.showLoadingForMorePage = true
                    let tabId = me.filterTabLists[me.selectedTabIndex].id;
                    let current = me.filterTabLists[me.selectedTabIndex].count
                    let show = me.filterTabLists[me.selectedTabIndex].show
                    let result = null;

                    if(tabId == 'mine' && show){
                        let filters = `authorId:${me.userInfo.uid}`;

                        let mineOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            mineOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(mineOptions);
                        me.mine = result ? result.lists : me.mine
                    } else  if(tabId == 'share' && show){
                        let filters = `permissions:${me.userInfo.uid}`;

                        let shareOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            shareOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(shareOptions);
                        me.share =  result ? result.lists : me.share
                    } else  if(tabId == 'public' && show){
                        let filters = `permissions:everyone`;

                        let publicOptions = {
                            filters: filters,
                            tagFilters: '-associatedProject', // - is Negation
                            hitsPerPage: current + 9,
                        }
                        if(me.searchObj.name){
                            publicOptions['alternativesAsExact'] = ['multiWordsSynonym']
                        }
                        result = await me.onLoadServerModel(publicOptions);
                        me.public =  result ? result.lists : me.public
                    }
                    me.filterTabLists[me.selectedTabIndex].count = result ? result.count : me.filterTabLists[me.selectedTabIndex].count
                }
                me.showLoading = false
                me.showLoadingForMorePage = false
            },
            noItemLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = null
                } else if (tabId == 'public') {
                    me.public = null
                } else if (tabId == 'mine') {
                    me.mine = null
                } else if (tabId == 'share') {
                    me.share = null
                }
            },
            initLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = undefined
                } else if (tabId == 'public') {
                    me.public = undefined
                } else if (tabId == 'mine') {
                    me.mine = undefined
                } else if (tabId == 'share') {
                    me.share = undefined
                }
            },
            deleteProjectItem(item) {
                var me = this
                me.deleteItem = item
                me.openDeleteDialog()
            },
            async deleteProject() {
                var me = this

                try {
                    if (me.deleteItem) {
                        var isServer = false
                        let projectId = me.deleteItem.projectId ? me.deleteItem.projectId : me.deleteItem.objectID
                        let authorId = me.deleteItem.author ? me.deleteItem.author : me.deleteItem.authorId

                        var modelSnap = await me.list(`db://definitions/${projectId}/information`)
                        if (modelSnap) {
                            isServer = true
                        }
                        if (isServer) {
                            await me.delete(`db://userLists/${authorId}/mine/${projectId}`)
                        }
                        me.$EventBus.$emit(`completeDelete_${projectId}`)

                        me.delete(`localstorage://${projectId}`)
                        me.delete(`localstorage://image_${projectId}`)


                        // let imageObjects = await me.getObject(`localstorage://serverImageLists`);
                        //
                        // delete imageObjects[me.projectId]
                        //
                        // await me.putObject(`localstorage://serverImageLists`, imageObjects);



                        var localLists = await me.getObject(`localstorage://localLists`)
                        var index = localLists.findIndex(info => info.projectId == projectId)
                        if (index != -1)
                            localLists.splice(index, 1)
                        await me.putObject(`localstorage://localLists`, localLists)
                    }
                    me.closeDeleteDialog()
                } catch (e) {
                    alert('Error:', e)
                }
            },
            openDeleteDialog() {
                this.deleteDialog = true
            },
            closeDeleteDialog() {
                this.deleteItem = null
                this.deleteDialog = false
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
            },
            objectToArray(obj){
                return Object.keys(obj).map(key=> ({ ...obj[key], key }) );
            },
            sortArrayByKey(array, key , asc){
                try{
                    return array.sort(function compare(a, b) {
                        if (a[key] < b[key]) return asc ? -1 : 1;
                        if (a[key] > b[key]) return asc ? 1 : -1;
                        return 0;
                    });
                }catch (e) {
                    return array
                }
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    children.unshift(child);
                });
                return children;
            },
            dbuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },
        },

    }
</script>

<style scoped>

    .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
    opacity: 0;
    }   

    .ytp-chrome-top-buttons {
        display: none;
    }

    .ytp-title {
        display: none;
    }

    .ytp-title-channel {
        display: none;
    }

    .title-page-card-box {
        height: 260px;
        padding: 0;
        margin-bottom: 30px;
        height: 105%;
    }

    .title-card-actions-btn {
        position: absolute;
        right: 0;
        bottom: 0;
    }

    .title-page-title {
        margin: 10px 0 20px 0;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        color: #1E88E5;
    }

    .home-card-title {
        text-align: left;
        display: block;
        line-height: 10px;
        font-size: 15px;
    }

    .introduction-img {
        height: 170px;
        cursor: pointer;
    }

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

    .text-reader:hover {
        background-color: #E0ECF8;
        color: #1565C0;
    }

    .v-pagination__navigation {
        box-shadow: none !important;
    }

    .v-pagination__item {
        box-shadow: 0 0 black;
        color: #8e44ad;
    }

    .x-pagination a, .x-pagination span {
        -webkit-box-shadow: none !important;
        -moz-box-shadow: none !important;
        box-shadow: none !important;
        border: 1px solid #eaeaea;
    }

    .tiblock {
        align-items: center;
        display: flex;
        height: 17px;
    }

    .ticontainer .tidot {
        background-color: rgb(215, 215, 215)
    }

    .tidot {
        -webkit-animation: mercuryTypingAnimation 1.5s infinite ease-in-out;
        display: inline-block;
        border-radius: 10px;
        height: 12px;
        width: 12px;
        margin-right: 15px;
    }

    @-webkit-keyframes mercuryTypingAnimation {
        0% {
            -webkit-transform: translateY(0px)
        }
        28% {
            -webkit-transform: translateY(-5px)
        }
        44% {
            -webkit-transform: translateY(0px)
        }
    }

    .tidot:nth-child(1) {
        -webkit-animation-delay: 200ms;
    }

    .tidot:nth-child(2) {
        -webkit-animation-delay: 300ms;
    }

    .tidot:nth-child(3) {
        -webkit-animation-delay: 400ms;
    }

    .title-page-card-box-row {
        margin-bottom:60px;
    }
    .main-logo-image {
        display: none;
    }
    .mobile-tab {
        display:none;
    }
    .mobile-tab-list {
        display:none;
    }
    /* .main-search {
        position:fixed; 
        top:50px; 
        z-index:2; 
        height:70px; 
        width:40%; 
        left: 50%; 
        transform: translate(-50%, 0%);
    } */


    @media only screen and (max-width: 1110px) {
        .main-tap-list {
            max-width:50% !important;
        }

    }

    @media only screen and (max-width: 850px) {
        #textsize {
            font-size: 11px;
        }

        #mode_btn {
            margin-left: -10px;
        }

    }

    @media only screen and (max-width: 800px) {
        .main-search {
            width: 50%;
        }

    }

    @media only screen and (max-width: 600px) {
        .main-logo-image {
            display:block;
        }
        .main-chair-image {
            display: none;
        }
        /* .mobile-menu-tab {
            width: 45px;
        }
        .mobile-tab {
            display:block;
        }
        .web-tab {
            display:none;
        }
        .mobile-tab-list {
            display: flex;
            margin-top:-76px; 
            margin-bottom:10px; 
            position:absolute; 
            z-index:1;  
            max-width:100%; 
            min-width:10%;
            left: 50%; 
            transform: translate(-50%, 0%);
        } */
        .mobile-tab-list {
            display:block;
        }
        .main-tap-list {
            display:none;
        }

        .main-search {
            width: 75%;
        }
    }

    /* @media only screen and (max-width: 575px) {
        .mobile-tab-list {
            left: 40%;
        }

    }
    @media only screen and (max-width: 475px) {
        .mobile-tab-list {
            left: 25px;
            transform: none;
        }

    }


    @media only screen and (max-width: 400px) {
        .mobile-tab-list {
            left: 10px;
            transform: none;
        }

    } */
</style>