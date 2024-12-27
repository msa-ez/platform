<template>
    <v-container fluid>
        <div>
            <v-tabs
                    v-model="selectedTab"
                    background-color="transparent"
                    color="blue darken-1"
                    style="max-width: 1500px; margin:0 auto;"
            >

                <v-tabs-slider color="green lighten-2"></v-tabs-slider>

                <v-tab
                        v-for="(tab,index,keys) in fillteredlabsTabLists()"
                        :key="keys"
                        :value="keys"
                >
                    {{tab.tabName}}
                </v-tab>

                <v-dialog
                        v-model="openMoveArchiveDialog"
                        persistent
                        width="400"
                >
                    <v-card height="200">
                        <v-card-title style="background-color: #E57373; color: white; margin-left:-10px;">Move to
                            Archive
                        </v-card-title>
                        <div style="padding:15px;">{{ deleteCardListCnt }}개의 클래스가 종료됩니다.</div>
                        <v-checkbox
                                v-model="moveCheck"
                                hide-details
                                :label="'클래스가 종료됨을 확인했습니다.'"
                                color="red"
                                value="red"
                                style="padding-left:12px; margin-top:-10px;"
                        ></v-checkbox>
                        <div style="position:absolute; right:5px; bottom:10px;">
                            <v-btn
                                    v-if="!isMoving"
                                    color="#F44336"
                                    style="float: right; "
                                    :disabled="!moveCheck"
                                    @click="movetoArchiveSelectedCards()"
                                    text
                            >종료
                            </v-btn>
                            <v-progress-circular
                                    v-if="isMoving"
                                    indeterminate
                                    color="#E57373"
                                    style="float: right;"
                            >
                            </v-progress-circular>
                            <v-btn
                                    style="float: right;"
                                    @click="openMoveArchiveDialog = false"
                                    text
                            >취소
                            </v-btn>
                        </div>
                    </v-card>
                </v-dialog>
                <v-tab-item
                    v-for="(tab, index, keys) in fillteredlabsTabLists()"
                    :key="keys"
                    :value="keys"
                >
                    <!-- 로그인하지 않았을 때 공개 강의만 표시 -->
                    <div v-if="!isLogin && tab.key === 'free'" style="margin:12px 0 12px 0;">
                        <v-row>
                            <v-row v-if="filteredFreeClassList == undefined && typeof filteredFreeClassList != 'object'">
                                <v-col
                                    v-for="idx in 8"
                                    cols="12"
                                    sm="3">
                                    <v-card
                                        outlined
                                        class="mx-auto"
                                        style="width: 95%; height: 400px; justify-content: center;"
                                        align="center"
                                        indeterminate
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
                            <v-col v-else-if="filteredFreeClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredFreeClassList.length > 0"
                                v-for="(clazz, index) in filteredFreeClassList" :key="index" md="3">
                                <class-card
                                    :clazz="clazz" :clazzIdList="clazzIdList"
                                    :teacherClassList="teacherClassList"
                                    :selectedTab="selectedTab"
                                    @changeSelectedTab="setSelectedTab"
                                    @changeTeacherClassList="setTeacherClassList"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <!-- 로그인한 경우 기존 로직 유지 -->
                    <div v-else style="margin:12px 0 12px 0;">
                        <div style="margin:12px 0 12px 0;" v-if="selectedTab == 0">
                        <v-row>
                            <v-row v-if="filteredRecommendClassList == undefined  && typeof filteredRecommendClassList != 'object'">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="filteredRecommendClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <!-- 추천강의가 없습니다. -->
                            <v-col v-else-if="filteredRecommendClassList.length > 0 "
                                   v-for="(clazz, index) in filteredRecommendClassList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                            :teacherClassList="teacherClassList"
                                            :selectedTab="selectedTab"
                                            @changeSelectedTab="setSelectedTab"
                                            @changeTeacherClassList="setTeacherClassList"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>

                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 1">
                        <v-row>
                            <v-row v-if="filteredFreeClassList == undefined  && typeof filteredFreeClassList != 'object'">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="filteredFreeClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredFreeClassList.length > 0"
                                   v-for="(clazz, index) in filteredFreeClassList" :key="index" md="3">
                                <class-card
                                        :clazz="clazz" :clazzIdList="clazzIdList"
                                        :teacherClassList="teacherClassList"
                                        :selectedTab="selectedTab"
                                        @changeSelectedTab="setSelectedTab"
                                        @changeTeacherClassList="setTeacherClassList"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 2">
                        <v-row>
                            <v-row v-if="filteredEnterpriseClassList == undefined && typeof filteredEnterpriseClassList != 'object'">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="filteredEnterpriseClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredEnterpriseClassList.length > 0 "
                                   v-for="(clazz, index) in filteredEnterpriseClassList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                            :teacherClassList="teacherClassList"
                                            :selectedTab="selectedTab"
                                            @changeTeacherClassList="setTeacherClassList"
                                            @changeSelectedTab="setSelectedTab"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 3">
                        <v-row>
                            <v-row v-if="filteredStudyClassList == undefined && typeof filteredStudyClassList != 'object'">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="filteredStudyClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredStudyClassList.length >0 "
                                   v-for="(clazz, index) in filteredStudyClassList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                            :teacherClassList="teacherClassList"
                                            :selectedTab="selectedTab"
                                            @changeTeacherClassList="setTeacherClassList"
                                            @changeSelectedTab="setSelectedTab"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 4">
                        <v-row>
                            <v-row v-if="filteredCompleteClassList == undefined && typeof filteredCompleteClassList != 'object' ">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="filteredCompleteClassList == null" style="margin-left:15px;">
                                <div style="text-align: center;height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredCompleteClassList.length > 0"
                                   v-for="(clazz, index) in filteredCompleteClassList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                            :teacherClassList="teacherClassList"
                                            :selectedTab="selectedTab"
                                            @changeTeacherClassList="setTeacherClassList"
                                            @changeSelectedTab="setSelectedTab"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 5">
                        <v-row>
                            <v-row v-if="filteredTeacherClazzList == undefined && typeof filteredTeacherClazzList != 'object'">
                                <v-col
                                    v-for="idx in 8"
                                    cols="12"
                                    sm="3"
                                >
                                    <v-card
                                        outlined
                                        class="mx-auto"
                                        style="width: 95%; height: 400px; justify-content: center;"
                                        align="center"
                                        indeterminate

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
                            <v-col v-else-if="filteredTeacherClazzList == null" style="margin-left:15px;">
                                <div style="text-align: center; height: 580px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="filteredTeacherClazzList.length > 0 "
                                   v-for="(clazz, index) in filteredTeacherClazzList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                    :teacherClassList="teacherClassList"
                                    :selectedTab="selectedTab"
                                    @changeTeacherClassList="setTeacherClassList"
                                    @changeSelectedTab="setSelectedTab"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    <div style="margin: 12px 0 12px 0;" v-else-if="selectedTab == 6">
                        <div v-if="isLogin">
                            <v-row class="ma-0 pa-0" justify="center">
                                <v-card outlined
                                    class="pa-4 pt-0 pb-0"
                                >
                                    <v-card-title class="ma-0 pa-0">{{newClass.newName}}</v-card-title>
                                    <v-card outlined
                                        style=" margin-top: -10px;
                                        height: 202px;
                                        margin: 0 auto;
                                        text-align: center;
                                        line-height: 202px;
                                        background-color: white"
                                        @click="openAlbum = true"
                                    >
                                        <v-icon
                                            v-if="!imgURL"
                                            color="primary"
                                            fab
                                            x-large
                                            dark
                                        >
                                            mdi-file-image
                                        </v-icon>
                                        <v-img
                                            v-if="imgURL"
                                            style="height: 200px;
                                            margin: 0 auto;
                                            margin-top: 0px;
                                            text-align: center;"
                                            :src="imgURL"
                                        ></v-img>
                                    </v-card>
                                    <validation-observer
                                        ref="observer"
                                        v-slot="{ invalid }"
                                    >
                                        <form @submit.prevent="submit">
                                            <div>
                                                <validation-provider
                                                    v-slot="{ errors }"
                                                    name="Name"
                                                    rules="required"
                                                >
                                                    <v-text-field
                                                        color="#0080FF"
                                                        label="강의제목"
                                                        :error-messages="errors"
                                                        v-model="newClass.newName"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <validation-provider
                                                    v-slot="{ errors }"
                                                    name="Name"
                                                    rules="required|alpha_dash"
                                                >
                                                    <v-text-field
                                                        label="강의 코드"
                                                        :error-messages="errors"
                                                        v-model="newClass.newId"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <v-row class="ma-0 pa-0">
                                                    <v-dialog v-model="StartDateMenu"
                                                        width="290px"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                            <v-text-field
                                                                v-model="newClass.newStartDate"
                                                                label="StartDate"
                                                                readonly
                                                                v-bind="attrs"
                                                                v-on="on"
                                                            ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                            v-model="newClass.newStartDate"
                                                            :min="new Date().toISOString().substr(0, 10)"
                                                            @input="StartDateMenu = false"
                                                        ></v-date-picker>
                                                    </v-dialog>
                                                    <v-icon class="pl-4 pr-4">mdi-arrow-right-bold</v-icon>
                                                    <v-dialog
                                                        v-model="EndDateMenu"
                                                        width="290px"
                                                    >
                                                        <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                            v-model="newClass.newEndDate"
                                                            label="EndDate"
                                                            readonly
                                                            v-bind="attrs"
                                                            v-on="on"
                                                        ></v-text-field>
                                                        </template>
                                                        <v-date-picker
                                                            v-model="newClass.newEndDate"
                                                            :min="newClass.newStartDate"
                                                            @input="EndDateMenu = false"
                                                        ></v-date-picker>
                                                    </v-dialog>
                                                </v-row>
                                                <v-row class="ma-0 pa-0">
                                                    <v-col class="pa-0">
                                                        <v-checkbox
                                                            class="new-class-check"
                                                            v-model="newClass.setRecommendClass"
                                                            label="추천 강의"
                                                        >
                                                        </v-checkbox>
                                                    </v-col>    
                                                    <v-col class="pa-0">
                                                        <v-checkbox
                                                            class="new-class-check"
                                                            v-model="newClass.setFreeClass"
                                                            :disabled="newClass.setEnterpriseClass"
                                                            label="공개 강의"
                                                        >
                                                        </v-checkbox>
                                                    </v-col>
                                                    <v-col class="pa-0">
                                                        <v-checkbox
                                                            class="new-class-check"
                                                            v-model="newClass.setPaidClass"
                                                            :disabled="newClass.setEnterpriseClass"
                                                            label="유료 강의"
                                                        >
                                                        </v-checkbox>
                                                    </v-col>
                                                </v-row>
                                                <v-row class="ma-0 pa-0" align="center">
                                                    <v-col class="pa-0">
                                                        <v-checkbox
                                                            class="new-class-check"
                                                            v-model="newClass.setEnterpriseClass"
                                                            :disabled="newClass.setFreeClass || newClass.setPaidClass"
                                                            label="기업 강의"
                                                        >
                                                        </v-checkbox>
                                                    </v-col>   
                                                    <v-col v-if="newClass.setEnterpriseClass">
                                                        <v-text-field
                                                            style="width: fit-content;"
                                                            label="connectionKey"
                                                            v-model="newClass.selecteConnectionKey"
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </div>
                                        </form>
                                    </validation-observer>
                                    <v-row class="ma-0 pa-0">
                                        <v-switch
                                            v-model="newClass.active"
                                            label="Active"
                                        ></v-switch>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="primary"
                                            :disabled="invalid || isLoading"
                                            type="submit"
                                            @click="createNewClazz(newClass)"
                                        >강의 생성
                                        </v-btn>
                                    </v-row>
                                </v-card>
                            </v-row>
                        </div>
                        <div v-else style="height: 500px; margin-top: 0px;">
                            <Login/>
                        </div>
                    </div>
                    <div style="margin:12px 0 12px 0;" v-else-if="selectedTab == 7">
                        <v-row>
                            <v-row v-if="ArchiveClazzList == undefined && typeof ArchiveClazzList != 'object'">
                                <v-col
                                        v-for="idx in 8"
                                        cols="12"
                                        sm="3">
                                    <v-card
                                            outlined
                                            class="mx-auto"
                                            style="width: 95%; height: 400px; justify-content: center;"
                                            align="center"
                                            indeterminate

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
                            <v-col v-else-if="ArchiveClazzList == null" style="margin-left:15px;">
                                <div style="text-align: center; height: 600px;">
                                    강의가 없습니다.
                                </div>
                            </v-col>
                            <v-col v-else-if="ArchiveClazzList.length > 0 "
                                   v-for="(clazz, index) in ArchiveClazzList" :key="index" md="3">
                                <class-card :clazz="clazz" :clazzIdList="clazzIdList"
                                            :teacherClassList="teacherClassList"
                                            :selectedTab="selectedTab"
                                            :archive=true
                                            @changeTeacherClassList="setTeacherClassList"
                                            @changeSelectedTab="setSelectedTab"
                                ></class-card>
                            </v-col>
                        </v-row>
                    </div>
                    </div>
                </v-tab-item>
            </v-tabs>
        </div>
        <v-dialog
                v-model="openAlbum"
                width="1000"
        >
            <v-card width="1000">
                <v-card-title style="background-color: #0984e3; color: white;">Select Class Thumbnail</v-card-title>
                <v-row dense>
                    <v-col
                            v-for="card in cards"
                            :key="card.title"
                            :cols="card.flex"
                    >
                        <v-img
                                style="margin: 10px;"
                                :src="card.src"
                                class="white--text align-end"
                                height="200px"
                                @click="imgURL = card.src, openAlbum = false"
                        >
                        </v-img>
                    </v-col>
                </v-row>
                <v-btn style="margin: 10px; width: 500px; margin-left: 250px;" color="primary" @click="selectFile()">
                    Select Thumbnail in Local
                </v-btn>
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
        
        <v-footer
            padless
            style="background-color: transparent;"
        >
            <ProvisionIndication style="margin:0; padding:0px; width:100%;"></ProvisionIndication>
        </v-footer>

    </v-container>
</template>

<script>
    import {file} from 'jszip';
    import ClassCard from "./ClassCard";
    import firebase from 'firebase'
    import Login from '../oauth/Login'
    import {ValidationObserver, ValidationProvider} from 'vee-validate';
    import ProvisionIndication from "../payment/ProvisionIndication";


    // import LabBase from './LabBase'
    // import StorageBase from "../designer/modeling/StorageBase";
    import StorageBase from "./LabStorageBase";
    import {v1} from 'uuid';


    export default {
        name: "ClazzListPage",
        components: {
            ProvisionIndication,
            ClassCard,
            ValidationProvider,
            ValidationObserver,
            Login,
        },
        mixins: [StorageBase],
        data: () => ({
            labURLNumber: 5,
            invalid: false,
            labURL: null,
            cards: [
                {
                    title: '1',
                    src: 'https://user-images.githubusercontent.com/65217813/130400684-9cad8a49-c465-4e19-9035-eeca20928f67.png',
                    flex: 4
                },
                {
                    title: '2',
                    src: 'https://user-images.githubusercontent.com/65217813/130400689-694ff6e7-918a-4289-8192-a909396b8ccb.png',
                    flex: 4
                },
                {
                    title: '3',
                    src: 'https://user-images.githubusercontent.com/65217813/130400690-0605672e-e2b6-4a68-a6c6-d76a1a38999d.png',
                    flex: 4
                },
                {
                    title: '4',
                    src: 'https://user-images.githubusercontent.com/65217813/130400692-61e5abba-54e9-4762-abce-250332f1472d.png',
                    flex: 4
                },
                {
                    title: '5',
                    src: 'https://user-images.githubusercontent.com/65217813/130400695-25172796-20f4-4fb6-9c05-daf21bf93953.png',
                    flex: 4
                },
                {
                    title: '6',
                    src: 'https://user-images.githubusercontent.com/65217813/130400696-026494c5-9038-4f11-855c-2604186ac9cf.png',
                    flex: 4
                },
            ],
            imageUrl: null,
            StartDateMenu: false,
            EndDateMenu: false,
            recommendClassList: undefined,
            completeClassList: undefined,
            teacherClassList: undefined,
            freeClassList: undefined,
            studyClassList: undefined,
            enterpriseClassList: undefined,
            archiveClassList: undefined,
            listNumber: {
                runningNum: 0,
                planningNum: 0,
                setNum: 0
            },
            overlay: false,
            selectedTab: 0,
            email: null,
            search: '',
            connectionKey: null,
            loaded: false,
            courseName: '',
            className: '',
            addClass: true,
            classImg: null,
            labsTabLists: [
                {tabName: '추천 강의', key: 'recommend'},
                {tabName: '공개 강의', key: 'free'},
                {tabName: '기업 강의', key: 'enterprise'},
                {tabName: '수강중인 클래스', key: 'study'},
                {tabName: '종료된 강의', key: 'ended'},
                {tabName: '강의중인 클래스', key: 'lecture'},
                {tabName: '강의 생성', key: 'add'},
                {tabName: '보관소', key: 'archive'},

            ],
            tempSearch: '',
            selectedClazz: null,
            previewUserImage: null,
            classthumbnailImg: {},

            //new
            showLoading: false,
            imageUrl: null,
            imagefile: null,
            text: '',

            newClass: {
                newName: 'New Class',
                newId: '',
                newClassId: '',
                setRecommendClass: false,
                setFreeClass: false,
                setEnterpriseClass: false,
                setPaidClass: false,
                selecteConnectionKey: '',
                // pay: '',
                newStartDate: new Date().toISOString().substr(0, 10),
                newEndDate: new Date().toISOString().substr(0, 10),
                active: true,
            },

            deleteCardList: {},
            deleteCardListCnt: 0,
            getCourseList: [],
            // rules: {
            //     name: [
            //         val => (val || '').length > 0 || 'This field is required',
            //     ],
            //     id: [
            //         val => (val || '').length > 0 || 'This field is required',
            //         val => /^[a-zA-z0-9\-\/]*$/.test(val) || '영문, 숫자, " - " 만 입력 가능합니다.' ,
            //     ],
            // },
            clazzIdList: [],
            snackBar: {
                Text: '',
                show: false,
                Color: null,
            },

            //new
            getNewClass: false,
            isLoading: false,
            imgURL: null,
            openAlbum: false,

            isselectCardMode: false,
            openDeleteDialog: false,
            deleteCheck: false,

            openMoveArchiveDialog: false,
            moveCheck: false,
            isMoving: false,
            deletedCardsList: {},
        }),
        computed: {
            isDoneList() {
                var cal = this.listNumber.planningNum + this.listNumber.runningNum
                if (this.listNumber.setNum == 0) {
                    return false
                } else if (this.listNumber.setNum == cal) {
                    return true
                }
                return false
            },
            testSearch() {
                return this.search
            },

            filteredRecommendClassList() {
                var me = this
                var filter = me.recommendClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(recommendClass => {
                            if (recommendClass.className != undefined) {
                                return recommendClass.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            filteredFreeClassList() {
                var me = this
                var filter = me.freeClassList
                if (filter) {
                    filter = me.freeClassList
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(freeClass => {
                            if (freeClass.className != undefined) {
                                return freeClass.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            filteredEnterpriseClassList() {
                var me = this
                var filter = me.enterpriseClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(enterpriseClass => {
                            if (enterpriseClass.className != undefined) {
                                return enterpriseClass.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            filteredStudyClassList() {
                var me = this
                var filter = me.studyClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(studyClass => {
                            if (studyClass.className != undefined) {
                                return studyClass.className.toLowerCase().includes(me.search.toLowerCase())
                            }
                        })
                    }
                }
                return filter
            },
            filteredTeacherClazzList() {
                var me = this
                var filter = me.teacherClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(clazz => {
                            if (clazz.className != undefined) {
                                return clazz.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            filteredCompleteClassList() {
                var me = this
                var filter = me.completeClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(clazz => {
                            if (clazz.className != undefined) {
                                return clazz.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            ArchiveClazzList() {
                var me = this
                var filter = me.archiveClassList
                if (filter) {
                    filter.sort(me.compare)
                    if (me.testSearch) {
                        return filter.filter(clazz => {
                            if (clazz.className != undefined) {
                                return clazz.className.toLowerCase().includes(me.search.toLowerCase())
                            }

                        })
                    }
                }
                return filter
            },
            // sortedRecommendClassList() {
            //     var me = this
            //     var o = me.recommendClassList;
            //     var sorted = {},
            //         key, a = [];
            //     // 키이름을 추출하여 배열에 집어넣음
            //     for (key in o) {
            //         if (o.hasOwnProperty(key)) a.push(key);
            //     }
            //     // 키이름 배열을 정렬
            //     a.sort();
            //     // 정렬된 키이름 배열을 이용하여 object 재구성
            //     for (key = 0; key < a.length; key++) {
            //         sorted[a[key]] = o[a[key]];
            //     }
            //     return sorted;
            // },
        },
        watch: {
            "isLogin": function () {
                var me = this
                if (!me.email) {
                    me.freeClassList = null
                    me.recommendClassList = null
                    me.enterpriseClassList = null
                    me.studyClassList = null
                    me.teacherClassList = null
                    me.completeClassList = null
                    me.getClazzList();
                }
            },
            // "clazzList":
            //     _.debounce(
            //         function (oldVal, newVal) {
            //             var me = this
            //             console.log("watch");
            //             newVal.sort(me.compare)
            //         }, 400
            //     ),
            "tempSearch":
                _.debounce(
                    function (newVal) {
                        var me = this
                        me.search = newVal
                    }, 400
                ),
            "userImage": {
                handler(newVal) {
                    console.log(newVal)
                    var me = this
                    localStorage.setItem("picture", me.userIcon(newVal))
                }
            },
            "selectedTab": function () {
                var me = this
                var classType = null

                me.selectCardMode('changeTab')

                if (this.selectedTab == 0) {
                    classType = '#recommend'
                } else if (this.selectedTab == 1) {
                    classType = '#free'
                } else if (this.selectedTab == 2) {
                    classType = '#enterprise'
                } else if (this.selectedTab == 3) {
                    classType = '#study'
                } else if (this.selectedTab == 4) {
                    classType = '#complete'
                } else if (this.selectedTab == 5) {
                    classType = '#teacher'
                } else if (this.selectedTab == 6) {
                    classType = '#addNewClass'
                    this.newClass.newName = 'New Class'
                } else if (this.selectedTab == 7) {
                    classType = '#archive'
                    this.deletedCardsList = {}
                    this.getArchiveClazzList()
                }

                if (me.labURL[me.labURLNumber]) {
                    me.labURL[me.labURLNumber] = classType
                    window.location.href = me.labURL.join('/')
                } else {
                    window.location.href = window.location.href + '/' + classType
                    me.labURL = window.location.href.split('/')
                }

                this.newClass.newId = v1()
                this.newClass.newClassId = ''
                this.newClass.setRecommendClass = false
                this.newClass.setFreeClass = false
                this.newClass.setEnterpriseClass = false
                this.newClass.setPaidClass = false
                this.newClass.selecteConnectionKey = ''
                // pay: '',
                this.newClass.newStartDate = new Date().toISOString().substr(0, 10)
                this.newClass.newEndDate = new Date().toISOString().substr(0, 10)
                this.isLoading = false
                this.imgURL = null
            }
        },
        created() {
            var me = this
            me.setUserInfo()
            me.$EventBus.$emit("inSideCourse", true)
        },
        mounted() {
            var me = this

            if (window.MODE == "onprem") {
                me.labURLNumber = 4
            }
            if (window.location.href) {
                me.labURL = window.location.href.split('/')
                if (me.labURL[me.labURLNumber]) {
                    if (me.labURL[me.labURLNumber] == '#recommend') {
                        me.selectedTab = 0
                    } else if (me.labURL[me.labURLNumber] == '#free') {
                        me.selectedTab = 1
                    } else if (me.labURL[me.labURLNumber] == '#enterprise') {
                        me.selectedTab = 2
                    } else if (me.labURL[me.labURLNumber] == '#study') {
                        me.selectedTab = 3
                    } else if (me.labURL[me.labURLNumber] == '#complete') {
                        me.selectedTab = 4
                    } else if (me.labURL[me.labURLNumber] == '#teacher') {
                        me.selectedTab = 5
                    } else if (me.labURL[me.labURLNumber] == '#addNewClass') {
                        me.selectedTab = 6
                    } else if (me.labURL[me.labURLNumber] == '#archive') {
                        me.selectedTab = 7
                    }
                }
            }

            me.email = localStorage.getItem("email");
            me.getClazzList();

            me.$EventBus.$on('searchItem', function (value, type, isModeling) {
                if (!isModeling) {
                    me.tempSearch = value
                }
            })

            me.$EventBus.$on('selectedClass', function (selectInfo, classInfo) {
                if (selectInfo) {
                    me.deleteCardList[classInfo.classId] = classInfo
                    me.deleteCardListCnt++;
                } else {
                    me.deleteCardList[classInfo.classId] = null
                    me.deleteCardListCnt--;
                }
                //console.log(me.deleteCardList, me.deleteCardListCnt)
            })


            me.$EventBus.$on('addNewClass', function (data) {
                if (data) {
                    me.selectedTab = 6
                }
            })
        },
        beforeDestroy() {
            this.$EventBus.$emit("inSideCourse", false)
        },
        methods: {
            fillteredlabsTabLists() {
                // 로그인 상태가 아닐 경우, 공개 강의만 반환
                if (!this.isLogin) {
                    return this.labsTabLists.filter(tab => tab.key === 'free');
                }
                // 로그인 상태일 경우, 모든 강의 반환
                return this.labsTabLists;
            },
            movetoArchiveSelectedCards() {
                var me = this
                var deleteCnt = 0
                try {
                    me.isMoving = true
                    Object.keys(me.deleteCardList).forEach(async function (classId) {
                        if (me.deleteCardList[classId]) {
                            me.deletedCardsList[classId] = me.deleteCardList[classId]
                            me.deleteCardList[classId].archive = true
                            me.putObject('storage://labs-msaez.io/archive/' + me.deleteCardList[classId].courseId + "/classes/" + me.deleteCardList[classId].classId + '/Class_Metadata.json', me.deleteCardList[classId])
                            me.deleteCardList[classId].courseInfo = await me.getObject('storage://labs-msaez.io/running/' + me.deleteCardList[classId].courseId + '/Course_Metadata.json')
                            if (me.deleteCardList[classId].courseInfo) {
                                me.putObject('storage://labs-msaez.io/archive/' + me.deleteCardList[classId].courseId + '/Course_Metadata.json', me.deleteCardList[classId].courseInfo)
                            }

                            var deleteList = await me.list('storage://labs-msaez.io/running/' + me.deleteCardList[classId].courseId + "/classes/" + me.deleteCardList[classId].classId + "/", true)
                            if (deleteList) {
                                deleteList.forEach(function (data) {
                                    me.delete('storage://labs-msaez.io/' + data.name)
                                    // console.log(data)
                                });
                                deleteCnt++;
                                if (deleteCnt == me.deleteCardListCnt) {
                                    me.isMoving = false
                                    me.openMoveArchiveDialog = false
                                    me.snackBar.show = true
                                    me.snackBar.Text = '클래스가 정상적으로 종료되었습니다.'
                                    me.snackBar.Color = "primary"
                                    me.selectCardMode()
                                    me.$EventBus.$emit('deletedClassCards', me.deletedCardsList)
                                }
                            }
                        }
                    })
                } catch (e) {
                    console.log(e.message)
                }
            },
            // 여러 클래스 삭제 로직 수정필요 
            // deleteSelectedCards() {
            //     var me = this
            //     var deleteCnt = 0
            //     try {
            //         me.isMoving = true
            //         Object.keys(me.deleteCardList).forEach(async function (classId) {
            //             if(me.deleteCardList[classId]){
            //                 me.deletedCardsList[classId] = me.deleteCardList[classId]   
            //                 if(me.deleteCardList[classId].archive){
            //                     var path = 'archive/'
            //                 } else {
            //                     var path = 'running/'
            //                 }
            //                 var reNameClassId = me.deleteCardList[classId].classId.replace("running@","")
            //                 // console.log('db://labs/' + me.getBucketByTenantId() + '/' + me.deleteCardList[classId].courseId + '/classes/' + me.deleteCardList[classId].classId)

            //                 if(me.deleteCardListCnt > 1){
            //                     var getAllList = await me.list('storage://labs-msaez.io/' + path + me.deleteCardList[classId].courseId, true)
            //                     var classCnt = 0
            //                     var deleteList = null
            //                     var settingDeleteList = []
            //                     if(getAllList){
            //                         getAllList.forEach(function (data) {
            //                             if(data.name.includes('Class_Metadata.json')){
            //                                 classCnt = classCnt + 1
            //                             }
            //                             if(data.name.includes(classId)){
            //                                 settingDeleteList.push(data.name)
            //                             }
            //                         })
            //                     }
            //                     if(classCnt == me.deleteCardListCnt){
            //                         deleteList = getAllList

            //                         if(path == 'archive/'){
            //                         var getRunningClassList = await me.list('storage://labs-msaez.io/running/' + me.deleteCardList[classId].courseId, true)
            //                             if(getRunningClassList){
            //                                 var deleteCheck = false
            //                                 getRunningClassList.some(function (data) {
            //                                     if(data.name.includes('Class_Metadata.json')){
            //                                         deleteCheck = true
            //                                         return true
            //                                     }
            //                                 })
            //                                 if(!deleteCheck){
            //                                     getRunningClassList.forEach(function (data) {
            //                                         me.delete('storage://labs-msaez.io/' + data.name)
            //                                     });
            //                                 }

            //                             }
            //                         }
            //                     } else {
            //                         deleteList = settingDeleteList
            //                     }

            //                 } else {
            //                     deleteList = await me.list('storage://labs-msaez.io/' + path + me.deleteCardList[classId].courseId +  "/classes/"  +  reNameClassId + "/", true)
            //                 }
            //                 await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + me.deleteCardList[classId].courseId + '/classes/' + me.deleteCardList[classId].classId)

            //                 if(deleteList){
            //                     deleteList.forEach(function (data) {
            //                         me.delete('storage://labs-msaez.io/' + data.name)
            //                     });
            //                     deleteCnt++;
            //                     if(deleteCnt == me.deleteCardListCnt){
            //                         me.isMoving = false
            //                         me.openDeleteDialog = false
            //                         me.snackBar.show = true
            //                         me.snackBar.Text = '클래스가 정상적으로 삭제되었습니다.'
            //                         me.snackBar.Color = "primary"
            //                         me.selectCardMode()
            //                         me.$EventBus.$emit('deletedClassCards', me.deletedCardsList)
            //                     }
            //                 }
            //             }
            //         })
            //     } catch(e) {
            //         console.log(e.message)
            //     } 
            // },
            selectCardMode(mode) {
                if (mode != 'changeTab') {
                    this.isselectCardMode = !this.isselectCardMode
                }
                if (!this.isselectCardMode) {
                    this.deleteCardList = {}
                    this.deleteCardListCnt = 0
                }
                this.$EventBus.$emit('selectCardMode', this.isselectCardMode)
            },
            async getArchiveClazzList() {
                var me = this
                try {
                    me.archiveClassList = undefined
                    var getArchiveCourseList = []
                    //me.listNumber.runningNum = 0
                    //me.listNumber.planningNum = 0
                    //me.listNumber.setNum = 0
                    var t0 = performance.now()
                    const labList = await me.list(`storage://labs-msaez.io/archive/`);
                    console.log(labList)
                    if (labList.prefixes) {
                        labList.prefixes.forEach(async function (lab) {
                            // const lab = clazz.path_.replace(`labs-msaez.io/running/`);
                            const clazzList = await me.list(`storage://${lab.location.path_}/classes`);
                            // console.log(clazzList)

                            clazzList.prefixes.forEach(async function (clazz) {
                                if (clazz.location.path_) {
                                    if (clazz.location.path_.includes("undefined")) {
                                        console.log(clazz.location.path_)
                                    }
                                    const clazzMetadata = await me.getObject(`storage://${clazz.location.path_}/Class_Metadata.json`);
                                    const classObj = {"name": clazz.location.path_}
                                    if (!clazzMetadata.Error)
                                        me.setClassList(clazzMetadata, classObj)
                                }
                            })
                        })
                    }
                    // me.list_watch(`storage://labs-msaez.io/archive/`, false, function (mainObj) {
                    // me.list_watch(`storage://labs-msaez.io/archive/`, false, function (mainObj) {
                    //     if (mainObj.prefixes) {
                    //         //var courseList = mainObj.prefix.replace('running/', '')
                    //         getArchiveCourseList.push(mainObj.prefixes)
                    //         //진행중 클래스
                    //         // me.list_watch(`storage://labs-msaez.io/${mainObj.prefix}classes/`, false, function (completedClass) {
                    //         // TODO: 수정
                    //         // me.list(`storage://labs-msaez.io/${mainObj.prefix}classes/`, false, function (completedClass) {
                    //         //     if (completedClass && completedClass.prefix) {
                    //         //         //var t1 = performance.now()
                    //         //         //console.log("Get ClassMetadata: " + (t1 - t0) + " milliseconds.")
                    //         //         // me.list_watch(`storage://labs-msaez.io/${completedClass.prefix}`, false, async function (classObj) {
                    //         //         me.list(`storage://labs-msaez.io/${completedClass.prefix}`, false, async function (classObj) {
                    //         //             //if (classObj.name && classObj.name.includes('Class_Metadata.json')) {
                    //         //                 var classMetaInfo = await me.getObject(`storage://labs-msaez.io/${classObj.name}`)
                    //         //                 if (classMetaInfo) {
                    //         //                     //me.listNumber.runningNum = me.listNumber.runningNum + 1
                    //         //                     me.setClassList(classMetaInfo, classObj, true)
                    //         //                 }
                    //         //             //}
                    //         //         })
                    //         //     }
                    //         // })
                    //     }
                    // })

                } catch (e) {
                    alert(e.message)
                }
            },
            selectFile() {
                var me = this
                var input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.id = "uploadInput";

                input.click();
                input.onchange = function (event) {
                    var file = event.target.files[0]
                    var reader = new FileReader();

                    reader.onload = function () {
                        var result = reader.result;
                        me.imgURL = result

                    };
                    reader.readAsDataURL(file);
                };
                me.openAlbum = false

            },
            setTeacherClassList(classList) {
                var me = this
                me.teacherClassList = classList
            },
            setSelectedTab(tabNumber) {
                var me = this
                me.selectedTab = tabNumber
            },
            submit() {
                // this.$refs.observer.validate()
            },

            onClickImageUpload() {
                this.$refs.imageInput[0].click()
            },
            onChangeImages(e) {
                console.log(e.target.files)
                const file = e.target.files[0];
                this.imageUrl = URL.createObjectURL(file);
            },
            compare(a, b) {
                if (Date.parse(a.classStartDate) > Date.parse(b.classStartDate)) return -1;
                if (Date.parse(b.classStartDate) > Date.parse(a.classStartDate)) return 1;

                return 0;
            },
            userIcon(number) {
                if (number < 10) {
                    return `static/usericon/00${number}.svg`
                } else {
                    return `static/usericon/0${number}.svg`
                }
            },
            toDataURL(url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        callback(reader.result);
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            },
            async getThumbnailImg(clazz) {
                var me = this
                if (clazz.thumbnail)
                    return clazz.thumbnail

                var thumbnailImg = null
                var existPath = await me.list(`storage://labs-msaez.io/running/${clazz.courseId}/classes/${clazz.classId.replace("@", "/")}/`)
                if (existPath) {
                    try {
                        var path = existPath.find(x => x.name && ((x.name.includes('.png') || x.name.includes('.jpg'))))
                        if (path) {
                            thumbnailImg = await this.getImageURL(`storage://labs-msaez.io/running/${path.name}`)
                            return thumbnailImg
                        }
                    } catch (e)  {
                        // 이미지 못찾을 경우 기본 이미지 return
                        thumbnailImg = await this.getImageURL(`storage://labs-msaez.io/running/${clazz.courseId}/default.png`)
                        return thumbnailImg
                    }
                }
                thumbnailImg = await this.getImageURL(`storage://labs-msaez.io/running/${clazz.courseId}/default.png`)
                return thumbnailImg
            },
            joinClass(clazz) {
                var me = this
                me.$router.push('/courses/running/' + clazz.courseId + '/' + clazz.classId);
            },
            async getClazzList() {
                var me = this
                try {
                    me.listNumber.runningNum = 0
                    me.listNumber.planningNum = 0
                    me.listNumber.setNum = 0
                    var t0 = performance.now()
                    const labList = await me.list(`storage://labs-msaez.io/running/`);
                    console.log(labList)
                    if (labList.prefixes) {
                        labList.prefixes.forEach(async function (lab) {
                            // const lab = clazz.path_.replace(`labs-msaez.io/running/`);
                            const clazzList = await me.list(`storage://${lab.location.path_}/classes`);
                            // console.log(clazzList)
                            clazzList.prefixes.forEach(async function (clazz) {
                                if (clazz.location.path_) {
                                    if (clazz.location.path_.includes("undefined")) {
                                        console.log(clazz.location.path_)
                                    }
                                    const clazzDetail = await me.list(`storage://${clazz.location.path_}`);
                                    clazzDetail.items.forEach(async function (detail) {
                                        if (detail.location.path_.includes("Class_Metadata.json")) {
                                            const clazzMetadata = await me.getObject(`storage://${detail.location.path_}`);
                                            const classObj = {"name": detail.location.path_}
                                            if (!clazzMetadata.Error)
                                                me.setClassList(clazzMetadata, classObj)
                                        }
                                    })
                                    clazzDetail.prefixes.forEach(async function (detail) {
                                        if (detail.location.path_.includes("completed")) {
                                            const clazzMetadata = await me.getObject(`storage://${detail.location.path_}/Class_Metadata.json`);
                                            const classObj = {"name": clazz.location.path_}
                                            if (!clazzMetadata.Error)
                                                me.setClassList(clazzMetadata, classObj)
                                        }
                                    })
                                    // clazzDetail.prefixes.forEach(async function (detail) {
                                    //     const clazzInfo = await me.list(`storage://${detail.location.path_}`);
                                    //     clazzInfo.items.forEach(async function (info) {
                                    //         if(info.location.path_.includes("Class_Metadata.json")) {
                                    //             const classObj = {"name": info.location.path_}
                                    //             if (!clazzMetadata.Error)
                                    //                 me.setClassList(clazzMetadata, classObj)
                                    //         }
                                    //     })
                                    //     clazzInfo.prefixes.forEach(async function(info) {
                                    //         if (detail.location.path_.includes("completed")) {
                                    //             const clazzMetadata = await me.getObject(`storage://${info.location.path_}/Class_Metadata.json`);
                                    //             const classObj = {"name": clazz.location.path_}
                                    //             if (!clazzMetadata.Error)
                                    //                 me.setClassList(clazzMetadata, classObj)
                                    //         }
                                    //     })
                                    // })


                                }
                            })
                        })
                    }
                    var t1 = performance.now()
                    console.log("Get ClassMetadata: " + (t1 - t0) + " milliseconds.")
                    // me.list_watch(`storage://labs-msaez.io/running/`, false, function (mainObj) {
                    // me.list(`storage://labs-msaez.io/running/`, false, function (mainObj) {
                    //     console.log(mainObj)
                    //     if (mainObj.prefix) {
                    //         var courseList = mainObj.prefix.replace('running/', '')
                    //         me.getCourseList.push(courseList)
                    //         //진행중 클래스
                    //         // me.list_watch(`storage://labs-msaez.io/${mainObj.prefix}classes/`, false, function (runningClass) {
                    //         me.list(`storage://labs-msaez.io/${mainObj.prefix}classes/`, false, function (runningClass) {
                    //             if (runningClass && runningClass.prefix) {
                    //                 var t1 = performance.now()
                    //                 console.log("Get ClassMetadata: " + (t1 - t0) + " milliseconds.")
                    //                 // me.list_watch(`storage://labs-msaez.io/${runningClass.prefix}`, false, async function (classObj) {
                    //                 me.list(`storage://labs-msaez.io/${runningClass.prefix}`, false, async function (classObj) {
                    //                     if (classObj.name && classObj.name.includes('Class_Metadata.json')) {
                    //                         var classMetaInfo = await me.getObject(`storage://labs-msaez.io/${classObj.name}`)
                    //                         if (classMetaInfo) {
                    //                             me.listNumber.runningNum = me.listNumber.runningNum + 1
                    //                             me.setClassList(classMetaInfo, classObj)
                    //                         }
                    //                     }
                    //                 })
                    //             }
                    //         })
                    //
                    //         //예정된 클래스
                    //         // me.list_watch(`storage://labs-msaez.io/${mainObj.prefix}classes/planned/`, false, function (plannedClass) {
                    //         me.list(`storage://labs-msaez.io/${mainObj.prefix}classes/planned/`, false, function (plannedClass) {
                    //             if (plannedClass && plannedClass.prefix) {
                    //                 // me.list_watch(`storage://labs-msaez.io/${plannedClass.prefix}`, false, async function (classObj) {
                    //                 me.list(`storage://labs-msaez.io/${plannedClass.prefix}`, false, async function (classObj) {
                    //                     if (classObj) {
                    //                         if (classObj.name && classObj.name.includes('Class_Metadata.json')) {
                    //                             var classMetaInfo = await me.getObject(`storage://labs-msaez.io/${classObj.name}`)
                    //                             if (classMetaInfo) {
                    //                                 me.listNumber.planningNum = me.listNumber.planningNum + 1
                    //                                 me.setClassList(classMetaInfo, classObj)
                    //                             }
                    //                         }
                    //                     }
                    //                 })
                    //             }
                    //         })
                    //     }
                    // })

                } catch (e) {
                    alert(e.message)
                }


            },
            async setClassList(classMetadata, classObj, archive) {
                var me = this
                if (!classMetadata.classId) {
                    var nameParts = classObj.name.split("/");
                    classMetadata.classId = nameParts[4];
                    me.clazzIdList.push(classMetadata.classId)
                } else {
                    me.clazzIdList.push(classMetadata.classId)
                }

                // OpenClass 로직
                var now = Date.now();
                var userId = localStorage.getItem('email')
                me.email = userId
                if (userId)
                    var userInfo = await me.getObject(`db://enrolledUsers/${userId.replace(/\./gi, '_')}`)

                if (classMetadata.openClass) {
                    var nameParts = classObj.name.split("/");
                    classMetadata.classId = nameParts[4];
                    classMetadata.courseId = nameParts[2];

                    var courseMetaData = await me.getObject(`storage://labs-msaez.io/running/${classMetadata.courseId}/Course_Metadata.json`)
                    if (courseMetaData) {
                        classMetadata.course = courseMetaData;
                    }
                    var parseDate = new Date(classMetadata.classEndDate)
                    parseDate.setDate(parseDate.getDate() + 1)
                    if (parseDate < now) {
                        classMetadata.status = 'completed'
                    } else if (Date.parse(classMetadata.classStartDate) < now && now < parseDate) {
                        classMetadata.status = 'running'
                    } else if (now < Date.parse(classMetadata.classStartDate)) {
                        classMetadata.status = 'prepared'
                    }

                    var classKey = classMetadata.courseId + "@" + classMetadata.classId

                    if (userInfo) {
                        if (userInfo.enrolledClass) {
                            if (userInfo.enrolledClass[classKey]) {
                                if (!me.studyClassList) me.studyClassList = []
                                me.studyClassList.push(classMetadata)
                            }
                        }
                    }
                    if (classMetadata.featured) {
                        if (!me.recommendClassList) me.recommendClassList = []
                        me.recommendClassList.push(classMetadata)
                    }


                    //if (classMetadata.teacherId == me.email && me.email != null) {
                    // 강사
                    //  if (!me.teacherClassList) me.teacherClassList = []
                    //  me.teacherClassList.push(classMetadata)
                    //} 
                    if (classMetadata.active != false || me.isAdmin) {
                        if (archive) {
                            if (!me.archiveClassList) me.archiveClassList = []
                            me.archiveClassList.push(classMetadata)
                        } else if (classMetadata.status == 'completed') {
                            if (!me.completeClassList) me.completeClassList = []
                            me.completeClassList.push(classMetadata)
                        } else {
                            if (!me.freeClassList) me.freeClassList = []
                            me.freeClassList.push(classMetadata)
                            if (classMetadata.teacherId == me.email && me.email != null) {
                                if (!me.teacherClassList) me.teacherClassList = []
                                me.teacherClassList.push(classMetadata)
                            }
                        }
                    }

                } else {
                    // OpenClass가 아닌 Logic
                    var nameParts = classObj.name.split("/");
                    classMetadata.classId = nameParts[4];
                    classMetadata.courseId = nameParts[2];

                    var courseMetaData = await me.getObject(`storage://labs-msaez.io/running/${classMetadata.courseId}/Course_Metadata.json`)
                    if (courseMetaData) {
                        classMetadata.course = courseMetaData;
                        // classMetadata.thumbnail = await me.getThumbnailImg(classMetadata)
                    }

                    var parseDate = new Date(classMetadata.classEndDate)
                    parseDate.setDate(parseDate.getDate() + 1)
                    if (parseDate < now) {
                        classMetadata.status = 'completed'
                    } else if (Date.parse(classMetadata.classStartDate) < now && now < parseDate) {
                        classMetadata.status = 'running'
                    } else if (now < Date.parse(classMetadata.classStartDate)) {
                        classMetadata.status = 'prepared'
                    }

                    if (userInfo) {
                        var classKey = classMetadata.courseId + "@" + classMetadata.classId
                        if (userInfo.enrolledClass) {
                            if (userInfo.enrolledClass[classKey]) {
                                if (!me.studyClassList) me.studyClassList = []
                                me.studyClassList.push(classMetadata)
                            }
                        }
                    }
                    if (classMetadata.active != false || me.isAdmin) {
                        if (archive) {
                            if (!me.archiveClassList) me.archiveClassList = []
                            me.archiveClassList.push(classMetadata)
                        } else if (classMetadata.status == 'completed') {
                            if (!me.completeClassList) me.completeClassList = []
                            me.completeClassList.push(classMetadata)
                        } else {
                            if (!me.enterpriseClassList) me.enterpriseClassList = []
                            me.enterpriseClassList.push(classMetadata)
                            if (classMetadata.teacherId == me.email && me.email != null) {
                                // 강사
                                if (!me.teacherClassList) me.teacherClassList = []
                                me.teacherClassList.push(classMetadata)
                            }
                        }
                    }

                }
                classMetadata.thumbnail = await me.getThumbnailImg(classMetadata)
                me.listNumber.setNum = me.listNumber.setNum + 1

                if (me.isDoneList) {
                    console.log('isDoneList')
                    if (!me.recommendClassList) {
                        me.recommendClassList = null
                    }
                    if (!me.completeClassList) {
                        me.completeClassList = null
                    }
                    if (!me.teacherClassList) {
                        me.teacherClassList = null
                    }
                    if (!me.freeClassList) {
                        me.freeClassList = null
                    }
                    if (!me.studyClassList) {
                        me.studyClassList = null
                    }
                    if (!me.enterpriseClassList) {
                        me.enterpriseClassList = null
                    }
                    if (!me.archiveClassList) {
                        me.archiveClassList = null
                    }
                }

            },
            async createNewClazz(newClass) {
                var me = this
                try {
                    me.isLoading = true
                    var teacherEmail = localStorage.getItem("email")
                    if (newClass.newName && newClass.newId) {
                        var file = {
                            ownerId: localStorage.getItem("email"),
                            instructorName: localStorage.getItem("userName"),
                            instructorId: localStorage.getItem("email"),
                            courseName: newClass.newName,
                            courseDesc: newClass.newName
                        }

                        await me.putObject(`storage://labs-msaez.io/running/${newClass.newId}/Course_Metadata.json`, file)
                        if (newClass.setRecommendClass) {
                            var featuredClass = true
                        }
                        if (newClass.setFreeClass) {
                            var openclass = true
                        }
                        if (newClass.setEnterpriseClass) {
                            var connectionKey = newClass.selecteConnectionKey
                        }
                        if (newClass.setPaidClass) {
                            // var pay = newClass.pay
                            var paidClass = true
                        }
                        if (!newClass.setRecommendClass && !newClass.setFreeClass && !newClass.setEnterpriseClass && !newClass.setPaidClass)
                            var openclass = true

                        var labinfo = {
                            "labName": "First-Lab",
                            "tool": "url",
                            "labTime": 10,
                            "labScenario": "클래스 생성시 자동으로 생성되는 랩입니다.",
                            "checkPoints": [
                                {
                                    "text": "모든 요구사항을 만족하는가"
                                }
                            ],
                            "hints": [{
                                "text": "hint"
                            }]
                        }
                        await me.putObject(`storage://labs-msaez.io/running/${newClass.newId}/labs/1st-Lab/Lab_Metadata.json`, labinfo)
                        var instruction = '# Instruction'
                        await me.putObject(`storage://labs-msaez.io/running/${newClass.newId}/labs/1st-Lab/instruction.md`, instruction)
                        var overlapCount = 0
                        for (var i = 0; i < me.getCourseList.length; i++) {
                            if (me.getCourseList[i] == newClass.newId)
                                overlapCount++;
                            if (overlapCount > 0)
                                break;
                        }
                        if (overlapCount == 0) {
                            if (me.imgURL) {
                                var setThumbnail = me.imgURL
                            } else {
                                var setThumbnail = "https://user-images.githubusercontent.com/65217813/114511671-30460780-9c73-11eb-883b-af8a62300972.png"
                            }
                            var classInfo = {
                                teacherId: teacherEmail,
                                className: newClass.newName,
                                featured: featuredClass,
                                connectionKey: connectionKey,
                                openClass: openclass,
                                paymentClass: paidClass,
                                description: "강의 특징: 본 강의는 웹브라우저 접속과 Zoom 접속만으로 모든 실습 세션을 진행합니다. 수강생은 아무런 도구 설치 필요없이 모든 실습을 마칠 수 있습니다. 비대면 강의 방법과 마이크로서비스 구현 방법에 대한 두가지 궁금증을 한번에 풀어보세요.",
                                classStartDate: newClass.newStartDate,
                                classEndDate: newClass.newEndDate,
                                groupedUsers: [{
                                    groupName: "Mercury",
                                    users: [{
                                        name: "홍길동", "email": "gdhong@uengine.org"
                                    }]
                                }],
                                labsList: [
                                    "1st-Lab"
                                ],
                                classId: newClass.newId,
                                courseId: newClass.newId,
                                course: {
                                    instructorName: localStorage.getItem("userName"),
                                    instructorId: teacherEmail,
                                    courseName: newClass.newName,
                                    courseDesc: newClass.newName,
                                },
                                status: "running",
                                thumbnail: setThumbnail,
                                active: newClass.active,

                            }
                            //console.log(classInfo)

                            var convertEmail = teacherEmail.replace(/\./gi, '_')
                            var enrolledClassInfo = newClass.newId + "/" + newClass.newId
                            await me.putObject(`storage://labs-msaez.io/running/${newClass.newId}/classes/${newClass.newId}/Class_Metadata.json`, classInfo)
                            firebase.database().ref(`enrolledUsers/${convertEmail}/ownClasses/${enrolledClassInfo}`).set(true);

                            newClass.newName = 'New Class'
                            newClass.newId = v1()
                            newClass.setRecommendClass = false
                            newClass.setFreeClass = false
                            newClass.setEnterpriseClass = false
                            newClass.setPaidClass = false
                            newClass.active = true
                            newClass.selecteConnectionKey = ''
                            // newClass.pay = ''
                            newClass.newStartDate = new Date().toISOString().substr(0, 10)
                            newClass.newEndDate = new Date().toISOString().substr(0, 10)
                            me.snackBar.show = true
                            me.snackBar.Text = '생성되었습니다.'
                            me.snackBar.Color = "primary"
                            if (!me.teacherClassList) me.teacherClassList = []
                            me.teacherClassList.push(classInfo)
                            me.imgURL = null
                            me.selectedTab = 5
                        } else {
                            me.snackBar.show = true
                            me.snackBar.Text = '이미 존재하는 강의 코드입니다.'
                            me.snackBar.Color = "red"
                        }

                        // alert('이미 존재하는 강의 코드입니다.')
                    } else {
                        me.snackBar.show = true
                        me.snackBar.Text = '강의 코드를 입력하십시오.'
                        me.snackBar.Color = "red"
                    }
                    me.isLoading = false
                } catch (e) {
                    me.snackBar.show = true
                    me.snackBar.Text = '강의 생성을 실패하였습니다 : ' + e.message
                    me.snackBar.Color = "red"
                    me.isLoading = false
                    // alert('강의 생성을 실패하였습니다 : ' + e.message)
                }
            }
        }
    };
</script>

<style>
    @media only screen and (max-width: 1150px) and (min-width: 960px) {
        #calendar-arrow-icon {
            width: 0.3% !important;
        }

        #calendar-text-field {
            width: 104px !important;
        }

        #calendar-icon-none {
            display: block !important;
        }

        #calendar-icon-block {
            display: none !important;
        }
    }
</style>