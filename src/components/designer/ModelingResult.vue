<template>
    <div>
        <AutoModelingDialog  
            :showDialog="false"
            :showChat="true"
            :openChatUI="true"
            :projectInfo="projectInfo"
        ></AutoModelingDialog>
    </div>
</template>
<script>
    // import ProjectModel from './project-modeling/ProjectModel.vue'
    import AutoModelingDialog from './modeling/AutoModelingDialog.vue';
    // https://www.msaez.io:8081/#/result?%EC%9D%8C%EC%8B%9D%EB%B0%B0%EB%8B%AC%EC%95%B1
    export default {
        components: { AutoModelingDialog },
        data() {
            return {
                projectInfo: null,
                loading: false,
            }
        },
        created() {
            // var me = this;
            // alert(window.location.href.split("?")[1])

            this.loading = false;

            const decodedUrl = decodeURIComponent(window.location.href);
            const match = decodedUrl.match(/#\/result\?(.+)/);
            const resultString = match ? match[1] : "";

            this.projectInfo ={
                eventStorming: null,
                customerJourneyMap: null,
                businessModel: null,
                userStoryMap: null,
                prompt: resultString
            }
            this.loading = true;
        },
    };
</script>
