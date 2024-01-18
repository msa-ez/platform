<template>
    <v-container style="max-width: 1500px;">
        <slot name="body">
            <div>
                <v-row class="main-tap-list" style="margin-top:-80px; margin-bottom:10px; position:absolute; max-width:60%; min-width:10%; z-index:1; left: 50%; transform: translate(-50%, 0%);">
                    <v-tabs
                        v-model="selectedIndex"
                        background-color="transparent"
                        color="blue darken-1"
                        show-arrows
                        centered
                    >
                        <div v-for="(tabObj,index) in filterTabLists" style="align-self: center;">
                            <v-tab
                                v-if="tabObj.show"
                                :disabled="showLoading && index != selectedTab"
                                :key="tabObj.id"
                                @click="tabClickHandler(tabObj)"
                                style="height:45px;"
                            >
                                {{tabObj.display}}
                                <!-- <v-avatar v-if="index != 0" color="green lighten-5" size="30"
                                        style="margin-left: 5px; margin-bottom: 15px; font-size:10px;">
                                    {{ search ? displayCnt(tabObj.id) :tabObj.totalCount }}
                                </v-avatar> -->
                                <v-avatar v-if="index != 0 && tabObj.totalCount!=null" color="green lighten-5" size="30"
                                        style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                    {{ tabObj.totalCount }}
                                </v-avatar>
                                <v-avatar v-else-if="index != 0 && tabObj.totalCount==null" color="green lighten-5"
                                        size="30"
                                        style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                    ...
                                </v-avatar>
                                <v-avatar v-else-if="index != 0 && tabObj.totalCount==0" color="green lighten-5" size="30"
                                        style="margin-left: 5px;margin-bottom: 15px; font-size:10px;">
                                    0
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
                
                <v-alert
                    v-if="searchOpen"
                    elevation="2"
                    style="position:fixed; top:0px; z-index:2; height:90px; width:40%; left: 50%; transform: translate(-50%, 0%);"
                >
                    <v-row>
                        <slot name="header">
                            <div v-if="tmpSearch" style="position:absolute; left:5px; top:5px;"> {{ filterListsCount }}</div>
                        </slot>
                        <v-btn @mouseover="mouseOverOpenList = true"
                            text
                            rounded
                            x-small
                            style="width: auto; margin: 33px 5px 0px 0px; border:0.1px solid gray;"
                        >
                            {{ getSelectedMode.display }}
                        </v-btn>
                        <v-list v-if="mouseOverOpenList"
                            style="position:absolute; z-index:1;"
                        >
                            <v-list-item
                                v-for="(item, index) in listMode"
                                :key="index"
                                @click="changedMode(item.type)"
                            >
                                <v-list-item-title>{{ item.display }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <v-text-field
                            v-model="tmpSearch"
                            outlined
                            class="gs-main-search"
                        ></v-text-field>
                        <v-icon @click="searchClose()" style="width:26px; height:26px; margin-top:30px;">mdi-close</v-icon>
                    </v-row>
                </v-alert>

                <v-tabs-items v-model="selectedTab">
                    <v-tab-item v-if="selectedTab == 0" :value="selectedTab">
                        <div class="clearfix gs-main-page-top-box">
                            <div class="gs-main-page-title-box">
                                <div class="gs-main-page-top-title">Microservices Architecture made easy!</div>
                                <div class="gs-main-page-sub-title">Frontend, Auth/Authz, GraphQL, etc. - All Patterns supported by modeling<br>
                                    Event driven microservices with Kafka, Spring, Axon, Eventuate<br>
                                    Container & Kubernetes Deploy Diagramming
                                </div>
                            </div>
                            <div class="gs-main-page-top-image">
                                <v-img src="/static/image/main/top_image.png"></v-img>
                            </div>
                        </div>
                        <v-col class="gs-main-page-top-box-mobile" align="center">
                            <div class="gs-main-page-top-image-mobile">
                                <v-img src="/static/image/main/top_image.png"></v-img>
                            </div>
                            <div class="gs-main-page-top-title-mobile">Microservices Architecture made easy!</div>
                            <div class="gs-main-page-sub-title-mobile">Frontend, Auth/Authz, GraphQL, etc. - All Patterns supported by modeling<br>
                                Event driven microservices with Kafka, Spring, Axon, Eventuate<br>
                                Container & Kubernetes Deploy Diagramming
                            </div>
                        </v-col>
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
                                    <v-img @click="checkNewProject('es')"
                                           class="introduction-img"
                                           src="/static/image/main/introduce.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.eventstorming-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('es')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('es')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="checkNewProject('es')">{{$t('tools.create-btn')}}
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
                                    <v-img @click="checkNewProject('k8s')"
                                           class="introduction-img"
                                           src="/static/image/main/mainBPMN.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.kubernetes-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('k8s')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('k8s')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="checkNewProject('k8s')">{{$t('tools.create-btn')}}
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
                                    <v-img @click="checkNewProject('bm')"
                                           class="introduction-img"
                                           src="/static/image/main/bmc.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.bmc-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed disabled text @click="goTutorials('bm')">{{$t('tools.tutorial-btn')}}
                                        </v-btn>
                                        <v-btn small depressed disabled text @click="goVideo('bm')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="checkNewProject('bm')">{{$t('tools.create-btn')}}
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
                                    <v-img @click="checkNewProject('bpmn')"
                                           class="introduction-img"
                                           src="/static/image/main/bpmn.png"
                                    >
                                    </v-img>
                                    <v-card-subtitle>{{$t('tools.bpmn-inst')}}</v-card-subtitle>
                                    <v-card-actions class="title-card-actions-btn">
                                        <v-btn small depressed text @click="goTutorials('bpmn')">{{$t('tools.tutorial-btn')}}</v-btn>
                                        <v-btn small depressed text @click="goVideo('bpmn')">{{$t('tools.video-btn')}}</v-btn>
                                        <v-btn small depressed text style="color:#1E88E5; font-weight:850;"
                                               @click="checkNewProject('bpmn')"> {{$t('tools.create-btn')}}
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
                                                color="green"
                                                text-color="white"
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 200;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('axon')">
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
                                    <a @click="checkNewProject('ggd')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/DDD.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('run-mu')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/unit_msa.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('req-res')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/req_res.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('cb')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/circuit_breaker.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('pub-sub')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/pub_sub.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('com-cor')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/Compensation.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('jwt-auth')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/jwt.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('dp-fh')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/hateoas.png">
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
                                                style="width: auto; height: 20px; font-size: 12px; font-weight:bold; z-index: 9999;"
                                                small
                                        >
                                            {{$t('word.dev')}}
                                        </v-chip>
                                    </v-row>
                                    <v-list-item three-line>
                                    <a @click="checkNewProject('dp-gql')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/graphql.png">
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
                                    <a @click="checkNewProject('axonex')">
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
                                    <a @click="checkNewProject('petshop')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/petshop.png">
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
                                    <a @click="checkNewProject('food-delivery')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/food_delivery.png">
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
                                    <a @click="checkNewProject('shop')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/shopping.png">
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
                                    <a @click="checkNewProject('k8s-blueprint')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/k8s.png">
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
                                    <a @click="checkNewProject('google-drive')">
                                        <v-img class="mt-4 mr-3" style="height:115px; width:165px;"
                                            src="/static/image/main/google_drive.png">
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
                        </v-row>
                    </v-tab-item>
                    <v-tab-item v-else-if="selectedTab < standardTabCount" :value="selectedTab">
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
                <div style="text-align-last: center;" v-if="selectedTab != 0 ">
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
        <!-- <div style="position: fixed; z-index:999; right:5px; bottom:5px;">
            <button style="background-color:white; color:red; border-radius:100%; height:40px; width:40px; border:0; outline:0; padding-top:8px;"
                    @click="showInitVideos.show = true">
                <YoutubeIcon/>
            </button>
        </div> -->
        <!-- <v-dialog v-model="showInitVideos.show" v-if="showInitVideos.show" max-width="700" transition="fab-transition">
            <v-carousel
                    show-arrows-on-hover
                    style="background:black; height:400;"
                    v-model="currentVideoIndex"
            >
                <v-carousel-item
                        v-for="(showInitVideo, i) in showInitVideos.id"
                        :key="i"
                >
                    <v-sheet
                            height="100%"
                    >
                        <youtube-media
                                v-if="currentVideoIndex==i"
                                style="width:100.1`%; height: 100%"
                                :video-id="showInitVideo"
                        ></youtube-media>
                    </v-sheet>
                </v-carousel-item>
                <v-checkbox
                        v-model="checkbox"
                        :label="`Don't show anymore`"
                        @change="unactivateYoutube()"
                        style="width:200px; z-index: 99; margin-left:15px;"
                >
                </v-checkbox>
            </v-carousel>
        </v-dialog> -->


        <v-dialog v-model="deleteDialog" v-if="deleteItem" persistent max-width="470">
            <v-card>
                <v-card-title class="headline">{{$t('word.deleteNotification')}}</v-card-title>
                <v-img :src="deleteItem.img"></v-img>
                <v-card-text>AuthorEmail: {{ deleteItem.authorEmail ? deleteItem.authorEmail.split('@')[0] : 'anyone'
                    }}
                </v-card-text>
                <v-card-text>ProjectName: {{deleteItem.projectName ? deleteItem.projectName : 'untitled'}}</v-card-text>
                <v-card-text>date: {{convertTimeStampToDate(deleteItem.date)}}</v-card-text>
                <v-card-text>LastModifiedDate: {{convertTimeStampToDate(deleteItem.lastModifiedDate)}}</v-card-text>
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
    import VueCookies from "vue-cookies";

    var _ = require('lodash');

    export default {
        name: 'eventstorming-list-page',
        mixins: [CommonStorageBase],
        components: {
            'EventStormingListCard': () => import('./EventStormingListCard'),
            'ProvisionIndication': () => import('../payment/ProvisionIndication'),
            YoutubeIcon
        },
        data() {
            return {
                labURLNumber: 4,
                showLoadingForMorePage: false,
                //tabs
                selectedIndex: 0,
                tabListIndex: 0,
                tabLists: [
                    {key: 0, id: 'home', display: 'Home', show: true},
                    {key: 1, id: 'mine', display: 'Mine', count: 0, totalCount: null, show: false},
                    {key: 2, id: 'every', display: 'Public', count: 0, totalCount: null, show: true},
                    {key: 3, id: 'share', display: 'Shared', count: 0, totalCount: null, show: false},
                    {key: 4, id: 'local', display: 'Local', count: 0, totalCount: null, show: true},
                ],
                //list
                every: undefined,
                mine: undefined,
                share: undefined,
                local: undefined,
                //search
                tmpSearch: '',
                search: '',
                searchOpen: false,

                //mode
                mode: 'all',
                searchMode: 'all',
                mouseOverOpenList: false,
                listMode: [
                    {type: 'es', display: 'EventStorming', color: 'green'},
                    {type: 'k8s', display: 'Kubernetes', color: 'blue'},
                    {type: 'all', display: 'All', color: 'red'},
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
            }
        },
        beforeDestroy() {
            console.log('Ev beforeDestroy')
        },
        async created() {
            console.log('Ev created:: ')
            this.showLoading = true
            this.$nextTick(function () {
                this.$EventBus.$emit('showNewButton', true)
            });
            await this.setUserInfo()
            // me.watch('db://userLists/everyone/share_first', function (data) {
            //     // console.log(data)
            //     // me.getList()
            //     me.settingFirstPage()
            // })
            this.initPage()
            this.$EventBus.$emit('progressValue', false)

            if (this.tabListIndex == 1) {
                this.selectedIndex = 4
            } else if (this.tabListIndex == 2) {
                this.selectedIndex = 1
            } else if (this.tabListIndex == 3) {
                this.selectedIndex = 5
            } else if (this.tabListIndex == 4) {
                this.selectedIndex = 2
            }
        },
        mounted() {
            var me = this
            if(window.MODE == "onprem"){
                me.labURLNumber = 3
            }
            $(window).scroll(function () {
                if (Math.ceil($(window).scrollTop()) >= (($(document).height() - $(window).height()))) {
                    if (!me.showLoading && me.showMoreButton && !me.search) {
                        if (!me.showLoadingForMorePage) {
                            me.settingMorePage()
                        }
                    }
                }
            });

            for (var i in me.filterTabLists) {
                if (me.filterTabLists[i]['show'] == true) {
                    //find first tab
                    me.tabListIndex = Number(i);
                    me.selectedIndex = me.tabListIndex
                    break;
                }
            }

            me.$EventBus.$on('searchItem', function (value, type, isModeling) {
                if (isModeling) {
                    me.showLoading = true
                    me.tmpSearch = value
                    me.mode = type
                }
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

            if (window.location.href) {
                me.labURL = window.location.href.split('/')
                if (me.labURL && me.labURL[me.labURLNumber]) {
                    if (me.labURL[me.labURLNumber] == '#mine') {
                        me.tabListIndex = 1
                        me.selectedIndex = 4
                    } else if (me.labURL[me.labURLNumber] == '#public') {
                        me.tabListIndex = 2
                        me.selectedIndex = 1
                    } else if (me.labURL[me.labURLNumber] == '#shared') {
                        me.tabListIndex = 3
                        me.selectedIndex = 5
                    } else if (me.labURL[me.labURLNumber] == '#local') {
                        me.tabListIndex = 4
                        me.selectedIndex = 2
                    }
                }
            }
            me.$EventBus.$on('showNewButton', function (newVal) {
                me.showNewButton = newVal
            })
        },
        watch: {
            'tmpSearch': function (newVal) {
                this.showLoading = true
                this.search = newVal
                if(this.tmpSearch == '') {
                    this.settingFirstPage(true)
                }
            },
            "mode": _.debounce(
                function () {
                    this.settingCount()
                    this.settingFirstPage(true)
                }, 300
            ),
            "search":
                _.debounce(
                    function () {
                        var me = this
                        if (me.search) {
                            me.settingSearchPage()
                        } else {
                            me.settingFirstPage(true)
                        }

                    }, 300
                ),
            // 'selectedTab': function (newVal, oldVal) {
            // var me = this
            // if (newVal < me.standardTabCount) {
            //     if (!me.search) {
            //         // me.settingFirstPage()
            //     }
            // }
            // }
        },
        computed: {
            getSelectedMode() {
                if (this.searchMode == 'k8s')
                    return {display: 'Kubernetes', color: 'blue'}
                else if (this.searchMode == 'es')
                    return {display: 'EventStorming', color: 'green'}
                else if (this.searchMode == 'bm')
                    return {display: 'BusinessModel', color: 'grey'}
                else
                    return {display: 'All', color: 'red'}
            },
            isOnPrem() {
              if(window.MODE == 'onprem' || this.$isElectron)
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
            selectedTab() {
                var me = this
                var tabType = null

                if (this.tabListIndex == 0) {
                    if (me.labURL && me.labURL[me.labURLNumber]) {
                        me.labURL.splice(me.labURLNumber, 1)
                        window.location.href = me.labURL.join('/')
                    }
                } else {
                    if (this.tabListIndex == 1) {
                        tabType = '#mine'
                    } else if (this.tabListIndex == 2) {
                        tabType = '#public'
                    } else if (this.tabListIndex == 3) {
                        tabType = '#shared'
                    } else if (this.tabListIndex == 4) {
                        tabType = '#local'
                    }

                    if (me.labURL && me.labURL[me.labURLNumber]) {
                        me.labURL[me.labURLNumber] = tabType
                        window.location.href = me.labURL.join('/')
                    } else {
                        window.location.href = window.location.href + tabType
                        me.labURL = window.location.href.split('/')
                    }
                }

                return this.tabListIndex
            },
            standardTabCount() {
                return 5
            },
            filterTabLists() {
                var me = this
                if (me.isLogin) {
                    // me.tabLists[0].show = false
                    if(me.$isElectron) {
                        me.tabLists[1].show = true
                        me.tabLists[2].show = false
                        me.tabLists[3].show = false
                        me.tabLists[4].show = true
                    } else {
                        me.tabLists[1].show = true
                        me.tabLists[3].show = true
                    }
                } else {
                    // me.tabLists[0].show = true
                    me.tabLists[1].show = false
                    me.tabLists[3].show = false
                }
                return me.tabLists
            },
            searchCount() {
                var me = this
                var cnt = 0
                if (me.filteredEvery)
                    cnt = cnt + me.filteredEvery.length
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
                if (me.search) {
                    return false
                }
                if (me.filterTabLists && me.selectedTab && me.selectedTab < me.standardTabCount) {
                    if (me.filterTabLists[me.selectedTab].count < 9) {
                        return false
                    } else if (me.filterTabLists[me.selectedTab].count < me.filterTabLists[me.selectedTab].totalCount) {
                        return true
                    }
                }
            },
            filteredList() {
                var me = this
                var lists = undefined
                // var findIndex = me.filterTabLists.findIndex(tab)
                if (me.filterTabLists[me.selectedTab].id == 'every') {
                    lists = this.filteredEvery
                } else if (me.filterTabLists[me.selectedTab].id == 'mine') {
                    lists = this.filteredMine
                } else if (me.filterTabLists[me.selectedTab].id == 'share') {
                    lists = this.filteredShared
                } else if (me.filterTabLists[me.selectedTab].id == 'local') {
                    lists = this.filteredLocal
                }

                if (lists) {
                    // me.tabLists[me.selectedTab].count = lists.length
                    if (lists.length == 0)
                        return lists = null;
                    if ((me.mode == 'all' && me.tmpSearch) ||
                        (me.mode != 'all' && !me.tmpSearch) ||
                        (me.mode != 'all' && me.tmpSearch)) {
                        // serach or mode changed sort(last Modified Date)
                        return lists.sort(function (a, b) {
                            return b.lastModifiedDate - a.lastModifiedDate;
                        });
                    } else {
                        return lists
                    }
                }
                return lists
            },
            filteredEvery() {
                var list = undefined
                if (this.tmpSearch && this.every && this.mode != 'all') {
                    list = this.every.filter(project => project.type == this.mode)
                } else if (this.every) {
                    list = this.every
                } else if (this.every == null && typeof this.every == 'object') {
                    list = null
                }
                return list
            },
            filteredMine() {
                var list = undefined
                if (this.mode == 'all') {
                    list = this.mine
                } else if (this.mine) {
                    list = this.mine.filter(project => project.type == this.mode)
                } else if (this.mine == null && typeof this.mine == 'object') {
                    list = null
                }
                return list
            },
            filteredShared() {
                var list = undefined
                if (this.mode == 'all') {
                    list = this.share
                } else if (this.share) {
                    list = this.share.filter(project => project.type == this.mode)
                } else if (this.share == null && typeof this.share == 'object') {
                    list = null
                }
                return list

            },
            filteredLocal() {
                var list = undefined
                if (this.mode == 'all') {
                    list = this.local
                } else if (this.local) {
                    list = this.local.filter(project => project.type == this.mode)
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
            searchClose() {
                var me = this
                me.searchOpen = false
                me.mouseOverOpenList = false
            },
            changedMode(type) {
                var me = this
                me.searchMode = type
                me.mouseOverOpenList = false
                if (me.showNewButton) {
                    me.$EventBus.$emit('searchItem', me.search, me.searchMode, true)
                } else {
                    me.$EventBus.$emit('searchItem', me.search, null, true)
                }
            },
            checkNewProject(type) {
                var me = this
                try {
                    if (!type) type = 'es'

                    if (type == 'es') {
                        me.$router.push({path: `storming/${me.dbuid()}`});
                    } else if (type == 'k8s') {
                        me.$router.push({path: `kubernetes/${me.dbuid()}`});
                    } else if (type == 'bm') {
                        me.$router.push({path: `business-model-canvas/${me.dbuid()}`});
                    } else if (type == 'bpmn') {
                        me.$router.push({path: `bpmn/${me.dbuid()}`});
                    } else if (type == 'axonex') {
                        me.$router.push({path: `/storming/human-resource-mgmt-0303:v0.0.1`});
                    } else if (type == 'petshop') {
                        me.$router.push({path: `/storming/e25a97f84aa34376697cc220496a9608`});
                    } else if (type == 'food-delivery') {
                        me.$router.push({path: `/storming/2737b4f61c1ea85e3de602479ddc1e3a`});
                    } else if (type == 'shop') {
                        me.$router.push({path: `/storming/0f89dcccd80e9ec9fb6540c3236cfe2b`});
                    } else if (type == 'k8s-blueprint') {
                        me.$router.push({path: `/kubernetes/e8f1d14ea6a9a714f79f73aa4fff0601`});
                    } else if (type == 'google-drive') {
                        me.$router.push({path: `/storming/d8525abb1acc3cf621b6aacf371fa4be`});
                    } else if (type == 'cna-full-course') {
                        me.$router.push({path: `/courses/cna-full/full-course-cna`});
                    } else if (type == 'object-oriented') {
                        me.$router.push({path: `/courses/objectOrientedBasics/objectOrientedBasics`});
                    } else if (type == 'bpm-with-uEngine5') {
                        me.$router.push({path: `/courses/bpm/bpm`});
                    } else if (type == 'axon') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/axon-framework`});
                    } else if (type == 'ggd') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-ddd-google-drive`});
                    } else if (type == 'run-mu') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-cna-start-2022`});
                    } else if (type == 'req-res') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-monolith-2-misvc-2022`});
                    } else if (type == 'pub-sub') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-pub-sub-2022`});
                    } else if (type == 'com-cor') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-compensation-correlation-2022`});
                    } else if (type == 'dp-gql') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-dp-graphql-2022`});
                    } else if (type == 'cb') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-circuit-breaker-2022`});
                    } else if (type == 'jwt-auth') {
                        me.$router.push({path: `/courses/cna-full-english/cna-full-english/en-Oauth2withKeycloak`});
                    } else if (type == 'dp-fh') {
                        me.$router.push({path: `courses/cna-full-english/cna-full-english/en-dp-frontend-2022`});
                    } else {
                        me.$router.push({path: `storming/${me.myUid}/${me.dbuid()}`});
                    }

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

                me.selectedIndex = 0;

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
            tabClickHandler(obj) {
                var me = this
                if (obj.key == 0) {
                    me.tabListIndex = 0
                } else {
                    me.tabListIndex = me.filterTabLists.indexOf(obj);
                    if (!me.search) {
                        me.settingFirstPage()
                    }
                }
            },
            displayCnt(tabId) {
                var me = this
                if (tabId == 'local' && me.local) {
                    if (me.mode == 'all') {
                        return me.local.length
                    } else {
                        return me.local.filter(project => project.type == me.mode).length
                    }

                } else if (tabId == 'mine' && me.mine) {
                    if (me.mode == 'all') {
                        return me.mine.length
                    } else {
                        return me.mine.filter(project => project.type == me.mode).length
                    }
                } else if (tabId == 'share' && me.share) {
                    if (me.mode == 'all') {
                        return me.share.length
                    } else {
                        return me.share.filter(project => project.type == me.mode).length
                    }
                } else if (tabId == 'every' && me.every) {
                    if (me.mode == 'all') {
                        return me.every.length
                    } else {
                        return me.every.filter(project => project.type == me.mode).length
                    }
                }
                return 0
            },
            initPage() {
                var me = this
                me.settingCount()
                me.settingFirstPage()
            },
            // async getPublicModelListCount() {
            //     var me = this
            //     try {
            //         var publicModelListCnt = null
            //         var path = `db://userLists/everyone/share`
            //         var option = {
            //             sort: "desc",
            //             orderBy: 'child://type',
            //             size: null,
            //             startAt: null,
            //             endAt: null,
            //         }

            //         var getSnapshot = await me.list(path, option)

            //         if (getSnapshot) {
            //             publicModelListCnt = getSnapshot.numChildren()
            //         } 

            //         // console.log("publicModelListCnt: " + publicModelListCnt)
            //         // console.log(me.labURL[me.labURLNumber])
            //         if(me.filterTabLists[2].totalCount != publicModelListCnt){
            //             me.filterTabLists[2].totalCount = publicModelListCnt
            //             me.setString(`db://userLists/everyone/totalCount`, publicModelListCnt)
            //         }
            //     } catch (e) {
            //         alert(`settingCountError::${e}`)
            //     }
            // },
            settingCount() {
                var me = this
                try {
                    me.filterTabLists.forEach(async function (tab, index) {
                        var tabId = tab.id
                        var path = null
                        var getSnapshotStr = null
                        var option = null
                        if (tabId == 'every') {
                            // path = `db://userLists/everyone/share`
                            path = `db://userLists/everyone/totalCount`
                        } else if (me.isLogin && tabId == 'mine') {
                            path = `db://userLists/${me.userInfo.uid}/mine`
                        } else if (me.isLogin && tabId == 'share') {
                            path = `db://userLists/${me.userInfo.uid}/share`
                        } else if (tabId == 'local') {
                            path = `localstorage://localLists`
                        }

                        if (me.mode != 'all') {
                            option = {
                                sort: "desc",
                                orderBy: 'type',
                                size: null,
                                startAt: `${me.mode}`,
                                endAt: `${me.mode}`,
                            }
                        }


                        if(path && me.mode && me.mode != 'all' && tabId == 'every'){
                            getSnapshotStr = await me.list(`${path}_${me.mode}`)
                        } else if (path){

                            if(tabId == 'every'){
                                getSnapshotStr = await me.getObject(path)
                            } else {
                                getSnapshotStr = await me.list(path, option)
                            }

                            if(tabId == 'local'){
                                getSnapshotStr = JSON.parse(getSnapshotStr)
                            }


                            if(getSnapshotStr && tabId == 'every'){
                                me.filterTabLists[index].totalCount =  getSnapshotStr
                            }else if(getSnapshotStr) {
                                me.filterTabLists[index].totalCount = Array.isArray(getSnapshotStr) ?  getSnapshotStr.length : Object.keys(getSnapshotStr).length
                            }else{
                                me.filterTabLists[index].count = 0
                                me.filterTabLists[index].totalCount = 0
                            }
                        }else{
                            me.filterTabLists[index].count = 0
                            me.filterTabLists[index].totalCount = 0
                        }

                    })
                } catch (e) {
                    alert(`settingCountError::${e}`)
                }
            },
            async settingFirstPage(init) {
                var me = this
                if (me.selectedTab < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.selectedTab].id
                    var path = null
                    var option = null


                    //path
                    if (tabId == 'local') {
                        path = `localstorage://localLists`
                    } else if (tabId == 'every') {
                        if (me.mode && me.mode != 'all') {
                            path = `db://userLists/everyone/share_${me.mode}`
                        } else {
                            path = `db://userLists/everyone/share_first`
                        }
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`
                    } else if (me.isLogin && tabId == 'share') {
                        path = `db://userLists/${me.userInfo.uid}/share`
                    }


                    //setting Option
                    if (me.mode != 'all' && !me.tmpSearch) {
                        // mode option
                        option = {
                            sort: "desc",
                            orderBy: 'type',
                            size: null,
                            startAt: `${me.mode}`,
                            endAt: `${me.mode}`,
                        }
                    } else {
                        //basic
                        if (me.mode != 'all' && tabId != 'every') {
                            // mode: es, k8s  && tabId : 'mine','shared'
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: null,
                                startAt: null,
                                endAt: null,
                            }
                        } else {
                            // mode: all  && tabId : 'mine','shared'
                            var size = null
                            if (tabId != 'every') {
                                size = 9
                            }
                            option = {
                                sort: "desc",
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: null,
                            }
                        }
                    }

                    // setting list
                    var location = undefined

                    if (tabId == 'every') {
                        location = me.every
                    } else if (me.isLogin && tabId == 'mine') {
                        location = me.mine
                    } else if (me.isLogin && tabId == 'share') {
                        location = me.share
                    } else if (tabId == 'local') {
                        location = me.local
                    }

                    if (!location) me.showLoading = true


                    if (init) {
                        me.showLoading = true
                        me.initLists(tabId)
                    }
                    if (path) {
                        var snapshots = await me.list(path, option)

                        if (snapshots) {
                            if (tabId == 'local') {
                                snapshots = JSON.parse(snapshots)

                                if (snapshots.length == 0) {
                                    me.noItemLists(tabId)
                                } else {
                                    if (!location || location && location.length < me.filterTabLists[me.selectedTab].totalCount) {
                                        // reversedArray = me.sortArrayByKey(snapshots,'lastModifiedDate')


                                        snapshots.forEach(function (project) {
                                            if (!location) location = []
                                            if (!project.type) project.type = 'es'
                                            project.isLocalProject = true

                                            if (me.search && me.mode == 'all') {
                                                if (project.projectName.includes(me.search)) {
                                                    location.push(project)
                                                }
                                            } else if (me.search && me.mode != 'all') {
                                                if (project.projectName.includes(me.search) && project.type == me.mode) {
                                                    location.push(project)
                                                }
                                            } else if (!me.search && me.mode != 'all') {
                                                if (project.type == me.mode) {
                                                    location.push(project)
                                                }
                                            } else {
                                                location.push(project)
                                            }
                                        })
                                        me.filterTabLists[me.selectedTab].count = location.length
                                        me.local = location
                                    }
                                }

                            } else {


                                if (location && location.length < Object.keys(snapshots).length) {
                                    me.initLists(tabId)
                                    location = undefined
                                }


                                if (!location || location && location.length < me.tabLists[me.selectedTab].count) {
                                    // var reversedArray = me.objectToArray(snapshots)
                                    // reversedArray = me.sortArrayByKey(reversedArray,'lastModifiedDate')

                                    snapshots.forEach(function (projectObj) {
                                        var project = projectObj
                                        var projectId = projectObj.projectId

                                        if (!project.projectId) project.projectId = projectId
                                        if (!project.authorProfile) project.authorProfile = null
                                        if (!project.type) project.type = 'es'

                                        if (!location) location = []


                                        if (location.findIndex(x => x.projectId == projectId) == -1)
                                            location.push(project)
                                    })

                                    if (tabId == 'every') {
                                        //if (!me.every) 
                                        me.every = []
                                        if (location)
                                            me.every = me.every.concat(location)
                                        if (snapshots.length != 9) {
                                            if (snapshots.length < 9) {
                                                var length = 9 - snapshots.length
                                                me.settingMorePage(length)
                                            } else if (snapshots.length > 9) {
                                                var overCnt = snapshots.length - 9
                                                for (var i = 0; i < overCnt; i++) {
                                                    me.delete(`db://userLists/everyone/share_first/${me.every[9].projectId}`)
                                                    me.every.splice(9, 1)
                                                }
                                            }
                                        }
                                        // console.log(me.every)
                                        me.tabLists[me.selectedTab].count = me.every.length
                                    } else if (me.isLogin && tabId == 'mine') {
                                        if (!me.mine) me.mine = []
                                        if (location)
                                            me.mine = me.mine.concat(location);
                                        me.tabLists[me.selectedTab].count = me.mine.length
                                    } else if (me.isLogin && tabId == 'share') {
                                        if (!me.share) me.share = []
                                        if (location)
                                            me.share = me.share.concat(location)
                                        me.tabLists[me.selectedTab].count = me.share.length
                                    }
                                }
                            }
                        } else {
                            me.settingMorePage(9)
                            me.noItemLists(tabId)
                        }
                    } else {
                        me.noItemLists(tabId)
                    }
                }
                me.showLoading = false
            },
            settingSearchPage() {
                var me = this
                try {
                    me.showLoading = true
                    var searchDone = {
                        'local': false,
                        'mine': false,
                        'share': false,
                        'every': false
                    }
                    var snapshots = null

                    var allPath = {
                        'every': `db://userLists/everyone/share`,
                        'local': `localstorage://localLists`
                    }
                    if (me.isLogin) {
                        var addPth = {
                            'mine': `db://userLists/${me.userInfo.uid}/mine`,
                            'share': `db://userLists/${me.userInfo.uid}/share`,
                        }
                        Object.assign(allPath, addPth)
                    }


                    var searchWord = me.tmpSearch.replace(/(\s*)/g, "")
                    var options = {
                        sort: 'desc',
                        orderBy: 'projectName',
                        size: null,
                        startAt: `${searchWord}`,
                        endAt: `${searchWord}\uf8ff`,
                    }

                    Object.keys(allPath).forEach(async function (tabId) {
                        var path = allPath[tabId]
                        var tabIdx = me.filterTabLists.findIndex(tab => tab.id == tabId)
                        if (tabIdx != -1) {
                            if (tabId == 'local') {
                                me.local = undefined
                                snapshots = await me.list(`${path}`)

                                //list set
                                if (snapshots) {
                                    snapshots = JSON.parse(snapshots)
                                    me.local = snapshots.filter(item => item.projectName == me.search);
                                    if (me.local.length == 0) {
                                        me.local = null
                                        //count set
                                        me.filterTabLists[tabIdx].count = 0
                                    } else {
                                        //count set
                                        me.filterTabLists[tabIdx].count = me.local.length
                                    }
                                } else {
                                    me.local = null
                                    me.filterTabLists[tabIdx].count = 0
                                }
                                searchDone[tabId] = true
                            } else {
                                if (me.mode && me.mode != 'all' && tabId == 'every') {
                                    snapshots = await me.list(`${path}_${me.mode}`, options)
                                } else {
                                    snapshots = await me.list(path, options)
                                }

                                //setting init
                                me.initLists(tabId)


                                //setting value
                                if (snapshots) {
                                    me.filterTabLists[tabIdx].count = snapshots.length
                                    snapshots.forEach(function (snapshot, index) {
                                        var project = snapshot
                                        var projectId = snapshot.key

                                        if (!project.projectId) project.projectId = projectId
                                        if (!project.authorProfile) project.authorProfile = null
                                        if (!project.type) project.type = 'es'

                                        if (tabId == 'every') {
                                            if (!me.every) me.every = []
                                            me.every.push(project)
                                        } else if (me.isLogin && tabId == 'mine') {
                                            if (!me.mine) me.mine = []
                                            me.mine.push(project)
                                        } else if (me.isLogin && tabId == 'share') {
                                            if (!me.share) me.share = []
                                            me.share.push(project)
                                        }

                                        if (me.filterTabLists[tabIdx].count - 1 == index) {
                                            searchDone[tabId] = true
                                        }
                                    })
                                } else {
                                    me.filterTabLists[tabIdx].count = 0
                                    if (tabId == 'every') {
                                        me.every = null
                                    } else if (tabId == 'mine') {
                                        me.mine = null
                                    } else if (tabId == 'share') {
                                        me.share = null
                                    }
                                    searchDone[tabId] = true
                                }
                            }

                            if (me.isLogin) {
                                if (searchDone.local && searchDone.mine && searchDone.share && searchDone.every) {
                                    me.showLoading = false
                                }
                            } else {
                                if (searchDone.local && searchDone.every) {
                                    me.showLoading = false
                                }
                            }


                        }
                    })
                } catch (e) {
                    alert(e.message)
                }

            },
            async settingMorePage(length) {
                var me = this
                if (me.selectedTab && me.selectedTab < me.standardTabCount) {
                    var tabId = me.filterTabLists[me.selectedTab].id
                    var path = null
                    // me.showLoading = true 로딩표시 ui 수정 ... public 의 경우 전체가 로딩되는듯한 ,, 
                    me.showLoadingForMorePage = true

                    if (tabId == 'local') {
                        path = `localstorage://localLists`
                    } else if (tabId == 'every') {
                        path = `db://userLists/everyone/share`
                    } else if (me.isLogin && tabId == 'mine') {
                        path = `db://userLists/${me.userInfo.uid}/mine`
                    } else if (me.isLogin && tabId == 'share') {
                        path = `db://userLists/${me.userInfo.uid}/share`
                    }

                    if (path) {
                        if (tabId == 'local') {
                            me.showLoadingForMorePage = false
                        } else {
                            var lastModelIndex = -1
                            var lastModel = null
                            if (tabId == 'every') {
                                if(me.every){
                                    lastModelIndex = me.every.length - 1
                                    lastModel = me.every[lastModelIndex]
                                } 
                            } else if (me.isLogin && tabId == 'mine') {
                                lastModelIndex = me.mine.length - 1
                                lastModel = me.mine[lastModelIndex]
                            } else if (me.isLogin && tabId == 'share') {
                                lastModelIndex = me.share.length - 1
                                lastModel = me.share[lastModelIndex]
                            }

                        }
                        if (length) {
                            var size = length + 1
                        } else {
                            var size = 10
                        }

                        // if (lastModel) {
                            var option = {
                                sort: 'desc',
                                orderBy: 'lastModifiedDate',
                                size: size,
                                startAt: null,
                                endAt: lastModel && lastModel.lastModifiedDate ? lastModel.lastModifiedDate : null,
                            }
                            if (me.mode && me.mode != 'all' && me.selectedTab == 'every') {
                                var snapshots = await me.list(`${path}_${me.mode}`, option)
                            } else {
                                var snapshots = await me.list(path, option)
                            }

                            if (snapshots) {
                                var moreProject = {}

                                snapshots.forEach(function (projectObj, index) {
                                    if (index != 0) {
                                        var project = projectObj
                                        var projectId = projectObj.projectId

                                        if (!project.projectId) project.projectId = projectId
                                        if (!project.authorProfile) project.authorProfile = null
                                        if (!project.type) project.type = 'es'

                                        if (tabId == 'every') {
                                            if (!me.every) me.every = []
                                            me.every.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.every.length
                                            if (length) {
                                                moreProject[projectId] = project
                                            }
                                        } else if (me.isLogin && tabId == 'mine') {
                                            if (!me.mine) me.mine = []
                                            me.mine.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.mine.length
                                        } else if (me.isLogin && tabId == 'share') {
                                            if (!me.share) me.share = []
                                            me.share.push(project)
                                            me.filterTabLists[me.selectedTab].count = me.share.length
                                        }
                                    }

                                    if (Object.keys(snapshots).length == index + 1) {
                                        me.showLoadingForMorePage = false
                                    }
                                })
                                if (tabId == 'every') {
                                    if (length) {
                                        // console.log(moreProject)
                                        me.putObject('db://userLists/everyone/share_first', moreProject)
                                    }
                                }
                            } else {
                                me.showLoadingForMorePage = false
                            }
                        // }
                    }
                }
            },
            noItemLists(tabId) {
                var me = this
                if (tabId == 'local') {
                    me.local = null
                } else if (tabId == 'every') {
                    me.every = null
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
                } else if (tabId == 'every') {
                    me.every = undefined
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
                        var modelSnap = await me.list(`db://definitions/${me.deleteItem.projectId}/information`)
                        if (modelSnap) {
                            isServer = true
                        }
                        if (isServer) {
                            await me.delete(`db://userLists/${me.deleteItem.author}/mine/${me.deleteItem.projectId}`)
                        }
                        me.$EventBus.$emit(`completeDelete_${me.deleteItem.projectId}`)

                        me.delete(`localstorage://${me.deleteItem.projectId}`)
                        var localLists = await me.getObject(`localstorage://localLists`)
                        var index = localLists.findIndex(info => info.projectId == me.deleteItem.projectId)
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

    @media only screen and (max-width: 420px) {
        .main-tap-list {
            margin-left:5%;
        }
    }


    

</style>
