<template>
    <div style="width: 90%;">
        <v-card flat>
            <v-tabs vertical>
                <v-tab style="justify-content: start;">
                    <div>
                        <v-icon left>mdi-content-paste</v-icon>{{$t('myPage.tab_usage')}}
                    </div>
                </v-tab>
                <v-tab v-if="false" style="justify-content: start;">
                    <div>
                        <v-icon left>mdi-content-paste</v-icon>{{$t('myPage.tab_billing')}}
                    </div>
                </v-tab>
                <v-tab style="justify-content: start;">
                    <div>
                        <v-icon left>mdi-lock</v-icon>{{$t('myPage.tab_privacy')}}
                    </div>
                </v-tab>
                <v-tab style="justify-content: start;">
                    <div>
                        <v-icon left>mdi-account-circle-outline</v-icon>{{$t('myPage.tab_admin')}}
                    </div>
                </v-tab>

                <v-tab-item>
                    <PersonalUsagePage></PersonalUsagePage>
                </v-tab-item>
                <v-tab-item v-if="false">
                    Billing...
                </v-tab-item>
                <v-tab-item>
                    <PersonalInfo></PersonalInfo>
                </v-tab-item>
                <v-tab-item>
                    <AdminUsagePage></AdminUsagePage>
                </v-tab-item>
            </v-tabs>
        </v-card>
    </div>
</template>
    
<script>
    import PersonalUsagePage from './PersonalUsagePage.vue';
    import AdminUsagePage from './AdminUsagePage.vue';
    import PersonalInfo from '../oauth/PersonalInfo.vue';
    
    export default {
        name: 'admin-page',
        mixins: [],
        components: { PersonalUsagePage, AdminUsagePage, PersonalInfo},
        data() {
            return {
                
            }
        },
        computed:{
            
        },
        methods:{
        }
    }
</script>