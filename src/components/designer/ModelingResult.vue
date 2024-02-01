<template>
    <div>
        <AutoModelingDialog  
            :showDialog="false"
            :showChat="true"
            :projectInfo="projectInfo"
        ></AutoModelingDialog>
    </div>
</template>
<script>
    import AutoModelingDialog from './modeling/AutoModelingDialog.vue';
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
