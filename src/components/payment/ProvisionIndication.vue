<template>
    <div>
        <v-divider></v-divider>
        <div style="text-align: center; padding-bottom:10px;">
            <v-col>
                <div style="font-size: 13px; padding:0px; opacity: 0.8;">
                    <div v-if="!isForeign">
                        {{$t('company.name')}} <br/>
                        {{$t('word.address')}} : {{$t('company.address')}}, {{$t('word.number')}} : {{$t('company.number')}}<br/>
                        {{$t('word.ceo')}}  : {{$t('company.ceo')}},  {{$t('word.registrationNumber')}} : {{$t('company.registrationNumber')}}<br/>
                        {{$t('info.refundComment')}} / {{$t('word.refundUser')}} : {{$t('company.refundUser')}}  ({{$t('company.refundNumber')}})<br/>
                    </div>
                    <div> Copyright © uEngine All Rights Reserved </div>
                </div>
                <v-row style="margin:0px;" justify="center">
                    <div @click="provision()" class="footer-btn">{{$t('word.terms')}}</div>
                    <div>&nbsp;&nbsp;|&nbsp;&nbsp;</div>
                    <div @click="provision()" class="footer-btn">{{$t('word.privacy')}}</div>
                </v-row>
            </v-col>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'provision-indication',
        props: {
            divider: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            logo: {
                type: Boolean,
                default() {
                    return false;
                }
            },
        },
        methods: {
            provision() {
                this.$router.push({path: '/provision'});
            },
        },
        computed: {
            isForeign(){
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        }
    }
</script>

<style>
.footer-btn {
    cursor: pointer;
    font-size:13px;
    margin-top:3px;
    font-weight: 500;
}
.footer-is-mobile {
    display: none;
}

@media only screen and (max-width:1080px) {
    .footer-is-mobile {
        display: block;
    }
    .footer-is-web {
        display: none;
    }   
}
</style>