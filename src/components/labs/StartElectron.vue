<template>
    <div style="text-align: -webkit-center; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: black;">
        <img @click="moveMainPage()" style="width: 13%; margin-top: 30px;" src="https://user-images.githubusercontent.com/65217813/127795764-5841748b-4af7-43ee-a8e1-0251471d81dc.png">
        <v-text-field 
            solo
            label="Class ID"
            :append-icon="isLoading" 
            style="margin-top: 20px; width: 600px;" 
            v-model="classId" 
            :error-messages="errMsg"
            @keypress.enter="sendURL(classId)"
            @click:append="sendURL(classId)"
        >
        </v-text-field>
        <div style="color: white; font-size: 23px;">
            <b>or</b>
        </div>
        <v-btn large color="primary" style="margin-top: 20px;" @click="moveMainPage()">Search Courses</v-btn>
    </div>
</template>

<script>
    import LabBase from "./LabStorageBase"
    export default {
        name: "StartElectron",
        props: {},
        mixins: [LabBase],
        components: {},
        data() {
            return {
                classId: null,
                errMsg: null,
                loading: false,
            }
        },
        watch: {
            "classId":function(){
                if(this.errMsg){
                    this.errMsg = null
                }
            }
        },
        computed: {
            isLoading(){
                if(this.loading){
                    return 'mdi-spin mdi-loading'
                } else {
                    return 'mdi-send'
                }
            },
        },
        methods: {
            async sendURL(classId) {
                var me = this
                try {
                    me.loading = true
                    var checkURL = await this.getObject('storage://labs-msaez.io/running/' + me.courseId +  "/classes/" +  classId + '/Class_Metadata.json')
                    if(checkURL){
                        var setURL = window.location.origin + '/#/courses/' + me.courseId + '/' + classId
                        console.log(setURL)
                        if(window.ipcRenderer){  
                            window.ipcRenderer.send("openWin", setURL)
                        }
                    } else {
                        var setClassId = null
                        var Courselist = []
                        var AllFileList = await this.list('storage://labs-msaez.io/running/')
                        Object.keys(AllFileList).forEach(function(key){
                            if(AllFileList[key].name){
                                Courselist.push(AllFileList[key].name.replace('running/', ''))
                            } else if(AllFileList[key].prefix){
                                Courselist.push(AllFileList[key].prefix.replace('running/', ''))
                            }
                        })
                        for(var i=0; i <= Courselist.length; i++){
                            var CourseId = await this.getObject('storage://labs-msaez.io/running/' + Courselist[i] +  "classes/" +  classId + '/Class_Metadata.json')
                            if(CourseId){
                                console.log(CourseId)
                                setClassId = Courselist[i]
                                break;
                            } else {
                                console.log('1')
                            }
                        }
                        if(setClassId){
                            var setURL = window.location.origin + '/#/courses/' + setClassId + classId
                            console.log(setURL)
                            if(window.ipcRenderer){
                                window.ipcRenderer.send("openWin", setURL)
                            }
                        } else {
                            me.errMsg = '존재하지않는 강의코드입니다.'
                        }
                    }
                    me.loading = false
                } catch(e){
                    console.log(e.message)
                }
                
            },
            moveMainPage(){
                var setURL = window.location.origin
                if(window.ipcRenderer){
                    window.ipcRenderer.send("openWin", setURL)
                }
            },
        }
    }
</script>

<style scoped>

</style>