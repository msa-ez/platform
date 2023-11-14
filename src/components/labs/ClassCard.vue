<template>
    <v-card outlined
            class="mx-auto"
            style="width: 400px; height: 475px; justify-content: center"
            :style="isDeleted ? 'opacity: 0.5;' : ''">
        <v-row style="margin:-4px 0 -8px 0;" justify="end">
            <!-- <v-chip
                    v-if="clazz.status == 'prepared' && !isDeleted"
                    class="ma-2"
                    color="white"
                    text-color="white"
                    style="margin-right: 10px"
            >
            
            </v-chip> -->
            <!-- <v-chip
                    v-if="clazz.status == 'completed' && !isDeleted"
                    class="ma-2"
                    color="red"
                    text-color="white"
                    style="margin-right: 10px;"
                    small
            >
                교육 종료
            </v-chip>
            <v-chip
                    v-if="clazz.status == 'running' && !isDeleted"
                    class="ma-2"
                    color="green"
                    text-color="white"
                    style="margin-right: 10px;"
                    small
            >
                교육 중
            </v-chip> -->
            <v-chip
                    v-if="isDeleted"
                    class="ma-2"
                    color="red"
                    text-color="white"
                    style="margin-right: 10px;"
                    small
            >
                삭제됨
            </v-chip>
        </v-row>
        <!--                                <v-btn @click="thumbnailImg(clazz)"></v-btn>-->
        <v-checkbox
            v-if="selectCardMode"
            v-model="selectedCard"
            @change="selectedthisCard(clazz)"
            style="margin: 10px; margin-bottom: -35px;"
        ></v-checkbox>

        <v-img :aspect-ratio="16/9"
               max-width="400px"
               max-height="185px"
               style = "margin-top:12px;"
               :src="clazz.thumbnail">
        </v-img>

        <v-card-title style="display:flex; margin:-10px 0 -10px; 0;">
            <!--                        {{course}}-->
            <p>{{clazz.className}}<v-icon style="margin-top:-5px; margin-left:5px;" v-if="clazz.active == false">mdi-eye-off</v-icon></p>
        </v-card-title>
        <v-card-text>
            코스명 : {{clazz.course ? clazz.course.courseDesc : clazz.courseId}} <br>
            클래스 시작 : {{clazz.classStartDate}} <br>
            클래스 종료 : {{clazz.classEndDate}} <br>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <div style="position: absolute; bottom:5px; left:-10px;">
                <v-speed-dial
                    v-model="fab"
                    left
                    direction="right"
                    transition="slide-x-transition"
                    >
                    <template v-slot:activator>
                        <v-btn
                            v-if="!isDeleted"
                            v-model="fab"
                            fab
                            x-small
                            depressed
                            @click="setTeacherId()"
                        >
                        <v-icon v-if="fab">
                            mdi-close
                        </v-icon>
                        <v-icon v-else>
                            mdi-menu
                        </v-icon>
                        </v-btn>
                    </template>
                    <v-btn
                        fab
                        dark
                        x-small
                        depressed
                        :disabled="!isTeacherId"
                        :style="'margin-left:-3.5px;'"
                        color="#81C784"
                        @click="setEditClassData(clazz)"
                    >
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                        fab
                        dark
                        x-small
                        depressed
                        color="#7986CB"
                        :style="isTeacherId ? '':'margin-left:-38px;'"
                        @click="setCopyClassData(clazz)"
                    >
                        <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                    <v-btn
                        fab
                        dark
                        x-small
                        depressed
                        :disabled="!isTeacherId"
                        color="#E57373"
                        @click="openDeleteDialog=true"
                    >
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </v-speed-dial>
            </div>
            <v-btn  
            style = "font-weight:700; position:absolute; bottom:5px; right:5px; color:#1E88E5;"
                text
                :disabled="isDeleted"
                @click="joinClass(clazz)">
                Enter
            </v-btn>
            <div>
                <v-dialog
                    v-model="openDeleteDialog"
                    persistent
                    width="400"
                >
                    <v-card height="200">
                        <v-card-title style="background-color: #E57373; color: white; margin-left:-10px;">Delete</v-card-title>
                        <div style = "padding:15px;">{{ clazz.className }}</div>
                        <v-checkbox
                            v-model="deleteCheck"
                            hide-details
                            :label="'클래스가 삭제됨을 확인했습니다.'"
                            color="red"
                            value="red"
                            style = "padding-left:12px; margin-top:-10px;"
                        ></v-checkbox>
                        <div style = "position:absolute; right:5px; bottom:10px;">
                            <v-btn
                                color="#F44336"
                                style="float: right; "
                                :disabled="!deleteCheck"
                                @click="deleteClass(clazz)"
                                text
                            >삭제
                            </v-btn>
                            <v-btn
                                style="float: right;"
                                @click="cancelDelete()"
                                text
                            >취소
                            </v-btn>
                        </div>
                    </v-card>
                </v-dialog>
                <v-dialog
                    v-model="openEditDialog"
                    persistent
                    width="480"
                    style="overflow: scroll;"
                >
                    <v-card 
                        outlined
                        style="width: 480px; height: 820px; ">
                            <v-card-title style="background-color: #81C784; color: white; width: 478px; position: fixed; z-index: 100; margin-top:-1px;">Edit Class</v-card-title>
                        <!-- <input ref="imageInput" type="file" hidden @change="onChangeImages"> -->
                        <!-- @click="onClickImageUpload()" -->
                        <!-- !!!! -->
                        <div style="margin-bottom: -15px; margin-top: 60px; margin-left: 10px; display:flex;">
                            <v-switch
                                v-model="newClassData.active"
                                label="Active"
                            ></v-switch>
                            <div style="margin-top:13px; position:absolute; right:0">
                                <v-btn
                                    @click="cancelEdit()"
                                    text
                                    style = "width:85px;"
                                >Cancel
                                </v-btn>

                                <v-btn @click="addClass(clazz, newClassData)"
                                    color="#4CAF50"
                                    text
                                    type="submit"
                                    :disabled="invalid"
                                    style = "width:85px;
                                            margin-left:10px;"
                                >Save
                                </v-btn>
                            </div>
                        </div><br>

                        <v-card outlined
                            style="width: 480px; height: 250px;
                                margin:0 auto;
                                margin-top:-12px;
                                text-align:center;
                                line-height:250px;
                                background-color:white"
                                @click="openAlbum = true"
                        >
                                <v-icon 
                                color="primary"
                                fab
                                x-large
                                dark>mdi-camera-enhance</v-icon>
                                <v-img
                                    style="height: 248px;
                                            margin:0 auto;
                                            margin-top:-250px;
                                            text-align:center;"
                                    v-if="imageUrl" :src="imageUrl"
                                ></v-img>
                        </v-card>
                        <div style = "margin-left:25px;">
                            <validation-observer
                                    ref="observer"
                                    v-slot="{ invalid }"
                            >
                                <form @submit.prevent="submit">
                                    <div style = "margin-top:20px;">
                                        <validation-provider
                                            v-slot="{ errors }"
                                            name="Name"
                                            rules="required"
                                        >
                                            <v-text-field
                                            style = "width:315px;
                                                margin-left:10px;
                                                margin-top:-12px;"
                                            color="#0080FF"
                                            label="ClassName"
                                            :error-messages="errors"
                                            v-model="newClassData.newClassName"
                                            ></v-text-field>
                                        </validation-provider>
                                    <div>
                                        <v-col
                                            style = "height:50px; margin-top: -20px;"
                                            cols="10"
                                            >
                                            <!-- :rules="rules.overlap" -->
                                            <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                rules="required|alpha_dash"
                                            >
                                                <v-text-field
                                                    style = "width:310px;"
                                                    label="ClassId"
                                                    disabled
                                                    :error-messages="errors"
                                                    v-model="newClassData.newClassId"
                                                ></v-text-field>
                                            </validation-provider>
                                            <div class = "row" style="margin-top: 40px; margin-left:0;">
                                                <v-checkbox
                                                        class="new-class-check"
                                                        v-model="newClassData.setRecommendClass"
                                                        label="추천 강의">
                                                </v-checkbox>
                                                <v-checkbox
                                                        class="new-class-check"
                                                        style = "margin-left:22px;"
                                                        v-model="newClassData.setFreeClass"
                                                        :disabled="newClassData.setEnterpriseClass"
                                                        label="공개 강의">
                                                </v-checkbox>
                                                <v-checkbox
                                                        class="new-class-check"
                                                        style = "margin-left:22px;"
                                                        v-model="newClassData.setPaidClass"
                                                        :disabled="newClassData.setEnterpriseClass"
                                                        label="유료 강의">
                                                </v-checkbox>
                                                <v-row style="margin-left:auto; position:absolute; margin-top:50px;">
                                                    <v-checkbox
                                                        class="new-class-check"
                                                        v-model="newClassData.setEnterpriseClass"
                                                        :disabled="newClassData.setFreeClass || newClassData.setPaidClass"
                                                        label="기업 강의">
                                                    </v-checkbox>
                                                    <div v-if="newClassData.setEnterpriseClass" style="margin-left: 10px; margin-top:-24px;">
                                                        <v-col>
                                                            <v-text-field
                                                                    label="connectionKey"
                                                                    v-model="newClassData.selecteConnectionKey"
                                                            ></v-text-field>
                                                        </v-col>
                                                    </div>
                                                </v-row>
                                            </div>
                                            <div style = "margin-top:50px;">
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px;"
                                                        label="serverUrl"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newServerUrl"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px; margin-top:-15px;"
                                                        label="ideUrl"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newIdeUrl"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px; margin-top:-15px;"
                                                        label="token"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newToken"
                                                    ></v-text-field>
                                                </validation-provider>
                                            </div>
                                        </v-col>    
                                        <v-col
                                            style ="width:162px; margin-left:0; margin-top:3px;"
                                            class = "calendar-float"
                                        >
                                            <v-dialog
                                                v-model="menu"
                                                width="290px"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                <v-text-field
                                                    v-model="newClassData.StartDate"
                                                    label="StartDate"
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                v-model="newClassData.StartDate"
                                                :min="new Date().toISOString().substr(0, 10)"
                                                @input="menu = false"
                                                ></v-date-picker>
                                            </v-dialog>
                                        </v-col>
                                        <v-icon class = "calendar-float"
                                                style = "margin-top:30px;">mdi-arrow-right-bold
                                        </v-icon>
                                            <v-col
                                                class = "calendar-float"
                                                style ="width:153px; margin-top:3px;"
                                            >
                                                <v-dialog
                                                    v-model="menu2"
                                                    width="290px"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                            v-model="newClassData.EndDate"
                                                            label="EndDate"
                                                            readonly
                                                            v-bind="attrs"
                                                            v-on="on"
                                                        ></v-text-field>
                                                    </template>

                                                    <v-date-picker
                                                    v-model="newClassData.EndDate"
                                                    :min="newClassData.StartDate"
                                                    @input="menu2 = false"
                                                    >
                                                    </v-date-picker>
                                                </v-dialog>
                                            </v-col>
                                        </div>
                                    </div>
                                    <!-- <div style = "margin-right: 10px; bottom: 10px; position: absolute; right: 0;">
                                        <v-btn
                                            @click="cancelEdit()"
                                            text
                                            style = "width:85px;"
                                        >Cancel
                                        </v-btn>

                                        <v-btn @click="addClass(clazz, newClassData)"
                                            color="#4CAF50"
                                            text
                                            type="submit"
                                            :disabled="invalid"
                                            style = "width:85px;
                                                    margin-left:10px;"
                                        >Save
                                        </v-btn>
                                    </div> -->
                                </form>
                            </validation-observer>
                        </div>
                    </v-card>
                </v-dialog>
                <v-dialog
                    v-model="openloginDialog"
                    width="480"
                >
                    <Login />
                </v-dialog>
                <v-dialog
                    v-model="openCopyDialog"
                    persistent
                    width="480"
                >
                    <v-card 
                        outlined
                        style="width: 480px; height: 850px; ">
                        <v-card-title style="background-color: #7986CB; color: white; width: 478px; position: fixed; z-index: 100; margin-top:-1px;">Copy Class</v-card-title>
                        <!-- <input ref="imageInput" type="file" hidden @change="onChangeImages"> -->
                        <!-- @click="onClickImageUpload()" -->
                        <div style="margin-bottom: -10px; margin-top: 60px; margin-left: 10px; display:flex;">
                            <v-switch
                                v-model="newClassData.active"
                                label="Active"
                            ></v-switch>
                            <div style="margin-top:13px; position:absolute; right:0">
                                <v-btn
                                    @click="cancelCopy()"
                                    text
                                    style = "width:85px;"
                                >cancel
                                </v-btn>

                                <v-btn @click="addClass(clazz, newClassData)"
                                    color="#3F51B5"
                                    text
                                    type="submit"
                                    :disabled="invalid"
                                    style = "width:85px;
                                            margin-left:10px;"
                                >copy
                                </v-btn>
                            </div>
                        </div>

                        <v-card outlined
                            style="width: 480px; height: 250px;
                                margin:0 auto;
                                text-align:center;
                                line-height:250px;
                                background-color:white"
                                @click="openAlbum = true"
                        >
                                <v-icon 
                                color="primary"
                                fab
                                x-large
                                dark>mdi-camera-enhance</v-icon>
                                <v-img
                                    style="height: 248px;
                                            margin:0 auto;
                                            margin-top:-250px;
                                            text-align:center;"
                                    v-if="imageUrl" :src="imageUrl"
                                ></v-img>
                        </v-card>
                        <div style = "margin-left:25px;">
                            <validation-observer
                                    ref="observer"
                                    v-slot="{ invalid }"
                            >
                                <form @submit.prevent="submit">
                                    <div style = "margin-top:20px;">
                                        <validation-provider
                                            v-slot="{ errors }"
                                            name="Name"
                                            rules="required"
                                        >
                                            <v-text-field
                                            style = "width:315px;
                                                margin-left:10px;
                                                margin-top:-12px;"
                                            color="#0080FF"
                                            label="ClassName"
                                            :error-messages="errors"
                                            v-model="newClassData.newClassName"
                                            ></v-text-field>
                                        </validation-provider>
                                    <div>
                                        <v-col
                                            style = "height:50px; margin-top: -20px;"
                                            cols="10"
                                            >
                                            <!-- :rules="rules.overlap" -->
                                            <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                rules="required|alpha_dash"
                                            >
                                                <v-text-field
                                                    style = "width:310px;"
                                                    label="ClassId"
                                                    :error-messages="errors"
                                                    v-model="newClassData.newClassId"
                                                ></v-text-field>
                                            </validation-provider>
                                            <div class = "row" style="margin-top: 40px; margin-left:0;">
                                                <v-checkbox
                                                        class="new-class-check"
                                                        v-model="newClassData.setRecommendClass"
                                                        label="추천 강의">
                                                </v-checkbox>
                                                <v-checkbox
                                                        class="new-class-check"
                                                        style = "margin-left:22px;"
                                                        v-model="newClassData.setFreeClass"
                                                        :disabled="newClassData.setEnterpriseClass"
                                                        label="공개 강의">
                                                </v-checkbox>
                                                <v-checkbox
                                                        class="new-class-check"
                                                        style = "margin-left:22px;"
                                                        v-model="newClassData.setPaidClass"
                                                        :disabled="newClassData.setEnterpriseClass"
                                                        label="유료 강의">
                                                </v-checkbox>
                                                <v-row style="margin-left:auto; position:absolute; margin-top:50px;">
                                                    <v-checkbox
                                                        class="new-class-check"
                                                        v-model="newClassData.setEnterpriseClass"
                                                        :disabled="newClassData.setFreeClass || newClassData.setPaidClass"
                                                        label="기업 강의">
                                                    </v-checkbox>
                                                    <div v-if="newClassData.setEnterpriseClass" style="margin-left: 10px; margin-top:-24px;">
                                                        <v-col>
                                                            <v-text-field
                                                                    label="connectionKey"
                                                                    v-model="newClassData.selecteConnectionKey"
                                                            ></v-text-field>
                                                        </v-col>
                                                    </div>
                                                </v-row>
                                            </div>
                                            <div style = "margin-top:50px;">
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px;"
                                                        label="serverUrl"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newServerUrl"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px; margin-top:-15px;"
                                                        label="ideUrl"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newIdeUrl"
                                                    ></v-text-field>
                                                </validation-provider>
                                                <validation-provider
                                                v-slot="{ errors }"
                                                name="Name"
                                                >
                                                    <v-text-field
                                                        style = "width:336px; margin-top:-15px;"
                                                        label="token"
                                                        :error-messages="errors"
                                                        v-model="newClassData.newToken"
                                                    ></v-text-field>
                                                </validation-provider>
                                            </div>
                                        </v-col>    
                                        <v-col
                                            style ="width:162px; margin-left:0; margin-top:3px;"
                                            class = "calendar-float"
                                        >
                                            <v-dialog
                                                v-model="menu"
                                                width="290px"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                <v-text-field
                                                    v-model="newClassData.StartDate"
                                                    label="StartDate"
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                v-model="newClassData.StartDate"
                                                :min="new Date().toISOString().substr(0, 10)"
                                                @input="menu = false"
                                                ></v-date-picker>
                                            </v-dialog>
                                        </v-col>
                                        <v-icon class = "calendar-float"
                                                style = "margin-top:30px;">mdi-arrow-right-bold
                                        </v-icon>
                                            <v-col
                                                class = "calendar-float"
                                                style ="width:152px; margin-top:3px;"
                                            >
                                                <v-dialog
                                                    v-model="menu2"
                                                    width="290px"
                                                >
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field
                                                            v-model="newClassData.EndDate"
                                                            label="EndDate"
                                                            readonly
                                                            v-bind="attrs"
                                                            v-on="on"
                                                        ></v-text-field>
                                                    </template>

                                                    <v-date-picker
                                                    v-model="newClassData.EndDate"
                                                    :min="newClassData.StartDate"
                                                    @input="menu2 = false"
                                                    >
                                                    </v-date-picker>
                                                </v-dialog>
                                            </v-col>
                                        </div>
                                    </div>
                                    <!-- <div style = "margin-right: 10px; bottom: 10px; position: absolute; right: 0;">
                                        <v-btn
                                            @click="cancelCopy()"
                                            text
                                            style = "width:85px;"
                                        >cancel
                                        </v-btn>

                                        <v-btn @click="addClass(clazz, newClassData)"
                                            color="#3F51B5"
                                            text
                                            type="submit"
                                            :disabled="invalid"
                                            style = "width:85px;
                                                    margin-left:10px;"
                                        >copy
                                        </v-btn>
                                    </div> -->
                                </form>
                            </validation-observer>
                        </div>
                    </v-card>
                </v-dialog>
            </div>
        </v-card-actions>
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
                            @click="imageUrl = card.src, openAlbum = false"
                        >
                        </v-img>
                    </v-col>
                </v-row>
                <v-btn style="margin: 10px; width: 500px; margin-left: 250px;" color="primary" @click="selectFile()">Select Thumbnail in Local</v-btn>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
var Minio = require('minio'); 

    import LabBase from './LabStorageBase'
    import { ValidationObserver, ValidationProvider } from 'vee-validate'
    import { v1 } from 'uuid';
    import Login from '../oauth/Login'

    export default {
        name: "ClassCard",
        mixins: [LabBase],
        components: {
            ValidationProvider,
            ValidationObserver,
            Login
        },
        props: {
            archive: Boolean,
            clazz: Object,
            editMode: Boolean,
            clazzIdList: Array,
            teacherClassList: Array,
            selectedTab: Number,
        },
        data: () => ({
            invalid: false,
            newClassData: {
                newClassName: '',
                newClassId: '',
                StartDate: new Date().toISOString().substr(0, 10),
                EndDate: new Date().toISOString().substr(0, 10),
                setRecommendClass: false,
                setFreeClass: false,
                setEnterpriseClass: false,
                setPaidClass: false,
                selecteConnectionKey: "",
                newServerUrl:"",
                newIdeUrl:"",
                newToken:"",
                active: true,
                

            },
            openEditDialog: false,
            openCopyDialog: false,
            menu: false,
            modal: false,
            menu2: false,

            imageUrl: null,
            imagefile: null,

            deleteCheck: false,
            openDeleteDialog: false,
            fab: false,

            isDeleted: false,
            failtoCopy: false,
            // rules: {
            //     name: [
            //         val => (val || '').length > 0 || 'This field is required',
            //     ], 
            //     id: [
            //         val => (val || '').length > 0 || 'This field is required',
            //         val => /^[a-zA-z0-9\-\/]*$/.test(val) || '영문, 숫자, " - " 만 입력 가능합니다.' ,
            //     ],
            // },
            
            snackBar: {
                show: false,
                Text: '',
                Color: null,
            },
            isTeacherId: false,
            classIntroduction: null,
            newTeacherClassList: [],
            openloginDialog: false,
            openAlbum: false,
            cards: [
                { title: '1', src: 'https://user-images.githubusercontent.com/65217813/130400684-9cad8a49-c465-4e19-9035-eeca20928f67.png',flex: 4 },
                { title: '2', src: 'https://user-images.githubusercontent.com/65217813/130400689-694ff6e7-918a-4289-8192-a909396b8ccb.png', flex: 4 },
                { title: '3', src: 'https://user-images.githubusercontent.com/65217813/130400690-0605672e-e2b6-4a68-a6c6-d76a1a38999d.png', flex: 4 },
                { title: '4', src: 'https://user-images.githubusercontent.com/65217813/130400692-61e5abba-54e9-4762-abce-250332f1472d.png', flex: 4 },
                { title: '5', src: 'https://user-images.githubusercontent.com/65217813/130400695-25172796-20f4-4fb6-9c05-daf21bf93953.png', flex: 4 },
                { title: '6', src: 'https://user-images.githubusercontent.com/65217813/130400696-026494c5-9038-4f11-855c-2604186ac9cf.png', flex: 4 },
            ],
            selectCardMode: false,
            selectedCard: false,
        }),
        mounted() {
            var me = this
            me.setUserInfo()
            me.$EventBus.$on('selectCardMode', function (newVal) {
                me.selectCardMode = newVal
                me.selectedCard = false
            })
            me.$EventBus.$on('deletedClassCards', function (deletedCards) {
                if(deletedCards[me.clazz.classId]){
                    me.isDeleted = true
                }
            })
            // if(this.clazz.teacherId == localStorage.getItem("email"))
            //     me.isTeacherId = true
        },
        methods: {
            selectedthisCard(classInfo) {
                this.$EventBus.$emit('selectedClass', this.selectedCard, classInfo)
            },
            setTeacherId(){
                var me = this
                if(me.isLogin){
                    if(me.clazz.teacherId && me.clazz.teacherId == localStorage.getItem('email')){
                        me.isTeacherId = true
                    } else if(localStorage.getItem('email') == 'help@uengine.org' || localStorage.getItem('email') == 'jyjang@uengine.org') {
                        me.isTeacherId = true
                    }
                } else {
                    me.isTeacherId = false
                }
            },
            selectFile(){
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
                        me.imageUrl = result
                        
                    };
                    reader.readAsDataURL( file );
                };
                me.openAlbum = false
                        
            },
            submit () {
                try {
                    this.$refs.observer.validate()
                } catch(e){
                    alert(e.message)
                }
            },
            joinClass(clazz) {
                var me = this
                try {
                    // if(!clazz.classId.includes("running@")){
                    //     var claszzId = "running@" + clazz.classId
                    //     me.$router.push('/courses/' + clazz.courseId + '/' + claszzId);
                    // }
                    // else {
                    //     me.$router.push('/courses/' + clazz.courseId + '/' + clazz.classId);
                    // }


                    // if(this.archive){
                    //     me.$router.push('/courses/archive/' + clazz.courseId + '/' + clazz.classId);
                    // } else {
                    //     me.$router.push('/courses/running/' + clazz.courseId + '/' + clazz.classId);
                    // }
                    me.$router.push('/courses/' + clazz.courseId + '/' + clazz.classId);
                } catch(e){
                    alert(e.message)
                }
                
                
            },
            setEditClassData(clazz){
                var me = this
                try {
                    var setClassId = clazz.classId.replace("running@","")
                    me.openEditDialog=true
                    me.imageUrl = clazz.thumbnail
                    if(clazz.connectionKey) {
                        me.newClassData.selecteConnectionKey = clazz.connectionKey
                        me.newClassData.setEnterpriseClass = true
                    } 
                    
                    if(clazz.openClass){
                        me.newClassData.setFreeClass = true
                    } 
                    if(clazz.paymentClass){
                        me.newClassData.setPaidClass = true
                    } 
                    if(clazz.featured){
                        me.newClassData.setRecommendClass = true
                    }
                    me.newClassData.newClassName = clazz.className
                    me.newClassData.newClassId = setClassId
                    me.newClassData.StartDate = clazz.classStartDate
                    me.newClassData.EndDate = clazz.classEndDate
                    me.newClassData.newServerUrl = clazz.serverUrl
                    me.newClassData.newIdeUrl = clazz.ideUrl
                    me.newClassData.newToken = clazz.token
                    me.newClassData.active = clazz.active
                    console.log(clazz)

                } catch(e){
                    alert(e.message)
                }
                
                
            },
            cancelDelete(){
                this.openDeleteDialog=false
                this.deleteCheck=false
            },
            async deleteClass(clazz){
                var me = this
                // console.log(clazz)
                // TODO: Class Delete 수정 필요함
                // TODO: 삭제 할 때 왜 모든 리스트를 받아 온 후에 삭제를 하는지?
                // TODO: 단순 삭제 로직으로 변경
                try {
                    if(me.archive){
                        var path = 'archive'
                    } else {
                        var path = 'running'
                    }
                    // var reNameClassId = clazz.classId.replace("running@","")
                    console.log(clazz)
                    var getAllList = await me.list(`storage://labs-msaez.io/${path}/${clazz.courseId}/classes/${clazz.classId}`)
                    getAllList.items.forEach(function (item) {
                       me.delete(`storage://${item.location.path_}`)
                    });
                    //
                    // var classCnt = 0
                    // var deleteList = null
                    // console.log()
                    // if(getAllList){
                    //     getAllList.some(function (data) {
                    //         if(data.name.includes('Class_Metadata.json')){
                    //             classCnt = classCnt + 1
                    //             if(classCnt > 1){
                    //                 return true
                    //             }
                    //         }
                    //     })
                    // }
                    // if(classCnt < 2){
                    //     deleteList = getAllList
                    //     if(path == 'archive/'){
                    //         var getRunningClassList = await me.list('storage://labs-msaez.io/running/' + clazz.courseId, true)
                    //         if(getRunningClassList){
                    //             var deleteCheck = false
                    //             getRunningClassList.some(function (data) {
                    //                 if(data.name.includes('Class_Metadata.json')){
                    //                     deleteCheck = true
                    //                     return true
                    //                 }
                    //             })
                    //             if(!deleteCheck){
                    //                 getRunningClassList.forEach(function (data) {
                    //                     me.delete('storage://labs-msaez.io/' + data.name)
                    //                 });
                    //             }
                    //
                    //         }
                    //     }
                    // } else {
                    //     deleteList = await me.list('storage://labs-msaez.io/' + path + clazz.courseId +  "/classes/"  +  reNameClassId + "/", true)
                    // }
                    // if(deleteList){
                    //     deleteList.forEach(function (data) {
                    //         me.delete('storage://labs-msaez.io/' + data.name)
                    //     });
                    // }
                    // await me.delete('db://labs/' + me.getBucketByTenantId() + '/' + clazz.courseId + '/classes/' + clazz.classId)

                    me.openDeleteDialog = false
                    me.deleteCheck = false
                    me.isDeleted = true;
                } catch(e) {
                    me.snackBar.show = true
                    me.snackBar.Text = "Failed to delete class: " + e.message
                    me.snackBar.Color = "red"
                    // alert();
                }
                
            },
            setCopyClassData(clazz){
                var me = this
                try {
                    if(me.isLogin){
                        var setClassId = clazz.classId.replace("running@","")
                        // console.log(clazz)
                        me.openCopyDialog = true
                        me.imageUrl = clazz.thumbnail
                        me.newClassData.newClassName = clazz.className + '-복사본'
                        me.newClassData.newClassId = v1()
                        me.newClassData.newServerUrl = clazz.serverUrl
                        me.newClassData.newIdeUrl = clazz.ideUrl
                        me.newClassData.newToken = clazz.token
                        me.newClassData.active = true
                        if(clazz.connectionKey) {
                            me.newClassData.selecteConnectionKey = null
                            me.newClassData.setEnterpriseClass = true
                        } 
                        if(clazz.openClass){
                            me.newClassData.setFreeClass = true
                        } 
                        if(clazz.paymentClass){
                            me.newClassData.setPaidClass = true
                        } 
                        if(clazz.featured){
                            me.newClassData.setRecommendClass = true
                        }
                    } else {
                        me.openloginDialog = true
                    }

                } catch(e){
                    alert(e.message)
                }
                
                
            },
            cancelEdit(){
                var me = this
                me.openEditDialog = false
                me.newClassData.newClassName = ''
                me.newClassData.newClassId = ''
                me.newClassData.StartDate = new Date().toISOString().substr(0, 10)
                me.newClassData.EndDate = new Date().toISOString().substr(0, 10)
            },
            cancelCopy(){
                var me = this
                me.openCopyDialog = false
                me.newClassData.newClassName = ''
                me.newClassData.newClassId = ''
                me.newClassData.StartDate = new Date().toISOString().substr(0, 10)
                me.newClassData.EndDate = new Date().toISOString().substr(0, 10)
            },
            async addClass(clazzInfo, newClassData) {
                var me = this
                var path = null
                try {
                    if(me.archive){
                        path = 'archive/'
                    } else {
                        path = 'running/'
                    }
                    if(me.isLogin){
                        var teacherEmail = localStorage.getItem("email")
                        var clazz = JSON.parse(JSON.stringify(clazzInfo))
                        var classId = clazz.classId.replace('running@', '')
                        this.classIntroduction = await this.getString('storage://labs-msaez.io/' + path + clazz.courseId +  "/classes/" +  classId + '/introduction.md');
                        if(newClassData.newClassName && newClassData.newClassId){
                            // var reNameClassId = newClassData.newClassId
                            // newClassData.newClassId = 'running@' + newClassData.newClassId
                            var overlapCount = 0
                            if(me.openCopyDialog){
                                for (var i = 0; i < me.clazzIdList.length; i++) {
                                    if(me.clazzIdList[i] == newClassData.newClassId)
                                        overlapCount ++;
                                        if(overlapCount > 0)
                                            break;
                                    }
                            } else 
                                overlapCount = 0
    
                            if(overlapCount == 0) {
                                if(me.openEditDialog){
                                    var newTeacherId = clazz.teacherId
                                    var newInstructorName = clazz.instructorName
                                    var newInstructorId = clazz.instructorId
                                }
                                else {
                                    var newTeacherId = teacherEmail
                                    var newInstructorName = localStorage.getItem("userName")
                                    var newInstructorId = teacherEmail
                                }
                                if(!newClassData.setEnterpriseClass) {
                                    newClassData.selecteConnectionKey = undefined
                                }
                                var file = {
                                    instructorName : newInstructorName, 
                                    instructorId : newInstructorId,
                                    courseName : clazz.course.courseName, 
                                    courseDesc : clazz.course.courseDesc
                                    }
                                
                                var classInfo = {
                                    teacherId: newTeacherId, 
                                    className: newClassData.newClassName,
                                    description: clazz.description,
                                    classStartDate: newClassData.StartDate, 
                                    classEndDate: newClassData.EndDate, 
                                    connectionKey: newClassData.selecteConnectionKey,
                                    featured: newClassData.setRecommendClass,
                                    openClass: newClassData.setFreeClass, 
                                    paymentClass: newClassData.setPaidClass,
                                    groupedUsers: [{
                                        groupName: "Mercury",
                                        users: [{
                                            name: "홍길동", "email": "gdhong@uengine.org"
                                        }]
                                    }],
                                    serverUrl: newClassData.newServerUrl,
                                    ideUrl: newClassData.newIdeUrl,
                                    token: newClassData.newToken,
                                    labsList: clazz.labsList,
                                    groupedLabsList: clazz.groupedLabsList,
                                    deletedLabsList: clazz.deletedLabsList,
                                    classId: newClassData.newClassId,
                                    courseId: clazz.courseId,
                                    course: file,
                                    status: clazz.status,
                                    thumbnail: me.imageUrl,
                                    active: newClassData.active,
                                }
                                if(clazz.unactiveLabList){
                                    classInfo.unactiveLabList = clazz.unactiveLabList
                                }
                                    // console.log(classInfo)   
                                if(me.openEditDialog){
                                    me.putString('storage://labs-msaez.io/' + path + clazz.courseId +  "/classes/" +  newClassData.newClassId + '/introduction.md', this.classIntroduction)
                                    me.putObject('storage://labs-msaez.io/' + path + clazz.courseId +  "/classes/" +  newClassData.newClassId + "/Class_Metadata.json", classInfo)

                                    me.openEditDialog = false
                                    me.clazz.classStartDate = newClassData.StartDate
                                    me.clazz.className = newClassData.newClassName
                                    // 코스명 : {{clazz.course ? clazz.course.courseDesc : clazz.courseId}} <br>
                                    me.clazz.classEndDate = newClassData.EndDate
                                    me.clazz.connectionKey = newClassData.selecteConnectionKey
                                    me.clazz.thumbnail = me.imageUrl
                                    me.clazz.active = newClassData.active
                                    if(me.clazz.connectionKey)
                                        newClassData.setEnterpriseClass = true
                                        me.clazz.openClass = newClassData.setFreeClass
                                        me.clazz.paymentClass = newClassData.setPaidClass
                                        me.clazz.featured = newClassData.setRecommendClass
                                        me.clazz.ideUrl = newClassData.newIdeUrl
                                        me.clazz.token = newClassData.newToken
                                        me.clazz.serverUrl = newClassData.newServerUrl
                                    }else{
                                        me.putString('storage://labs-msaez.io/running/' + clazz.courseId +  "/classes/" +  newClassData.newClassId + '/introduction.md', this.classIntroduction)
                                        me.putObject('storage://labs-msaez.io/running/' + clazz.courseId +  "/classes/" +  newClassData.newClassId + "/Class_Metadata.json", classInfo)

                                        let labLists = await me.list(`db://labs/msaez/${clazz.courseId}/classes/${classId}/labs`)
                                        if(labLists){
                                            // labLists = JSON.parse(JSON.stringify(labLists));
                                            var copyLabLists = {}
                                            Object.keys(labLists).forEach(function(labId){
                                                // delete labLists[labId].userActive
                                                // delete labLists[labId].userInfo
                                                // delete labLists[labId].labResult
                                                if(labId != "undefined"){
                                                    if(labLists[labId].instruction){
                                                        copyLabLists[labId] = {}
                                                        copyLabLists[labId].instruction = labLists[labId].instruction
                                                    }
                                                }
                                            });
                                            // console.log(copyLabLists)
                                            me.putObject(`db://labs/msaez/${clazz.courseId}/classes/${newClassData.newClassId}/labs`, copyLabLists);
                                        }

                                        var convertEmail = teacherEmail.replace(/\./gi, '_')
                                        var enrolledClassInfo = clazz.courseId + "/" + newClassData.newClassId
                                        me.setString(`db://enrolledUsers/${convertEmail}/ownClasses/${enrolledClassInfo}`, true)
                                        me.openCopyDialog = false
                                        me.snackBar.show = true
                                        me.snackBar.Text = '복제되었습니다.'
                                        me.snackBar.Color = "primary"
                                        
                                        // if(!me.teacherClassList) me.teacherClassList = []
                                        // me.teacherClassList.push(classInfo)
                                        if(!me.teacherClassList){
                                            me.newTeacherClassList.push(classInfo)
                                        } else {
                                            me.newTeacherClassList = me.teacherClassList
                                            me.newTeacherClassList.push(classInfo)
                                        }
                                        me.$emit("changeTeacherClassList", me.newTeacherClassList)
                                        me.$emit("changeSelectedTab", 5)
                                    }
                                    me.newClassData.newClassName = ''
                                    me.newClassData.newClassId = ''
                                    me.newClassData.StartDate = new Date().toISOString().substr(0, 10)
                                    me.newClassData.EndDate = new Date().toISOString().substr(0, 10)
                        
                                
                            } else {
                                me.snackBar.show = true
                                me.snackBar.Text = '중복된 id 입니다.'
                                me.snackBar.Color = "red"
                            } 
                        }
                    } else {
                        me.snackBar.show = true
                        me.snackBar.Text = '로그인이 필요한 서비스입니다.'
                        me.snackBar.Color = "red"
                    }
                } catch(e){
                    me.snackBar.show = true
                    me.snackBar.Text = '복제 실패하였습니다 : ' + e.message
                    me.snackBar.Color = "red"
                }
            }
                
        },
    }
</script>

<style scoped>
    .calendar-float{float:left; margin-top:25px;}
</style>