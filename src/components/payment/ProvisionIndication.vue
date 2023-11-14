<template>
    <div style="width: 100%; background: white">
        <v-divider v-if="divider"></v-divider>

        <div style="margin-top: 39px; margin-bottom:48px;">
            <v-card flat>
                <div>
                    <v-row style="justify-content: space-between;">
                        <div style="margin-left: 1%;" >
                            <v-row> 
                                <v-img v-if="logo" src="http://uengine.org/assets/img/uengine/logo_bright.png"
                                       contain style="max-width: 120px"></v-img>
                                <div :style="provisionStyle">
                                    <div  v-if="!isForeign">
                                        {{$t('company.name')}} <br/>
                                        {{$t('word.address')}} : {{$t('company.address')}}, {{$t('word.number')}} : {{$t('company.number')}}<br/>
                                        {{$t('word.ceo')}}  : {{$t('company.ceo')}},  {{$t('word.registrationNumber')}} : {{$t('company.registrationNumber')}}<br/>
                                        {{$t('info.refundComment')}} / {{$t('word.refundUser')}} : {{$t('company.refundUser')}}  ({{$t('company.refundNumber')}})<br/>
                                    </div>
                                    <div> Copyright © uEngine All Rights Reserved </div>

                                    <!--                                    주식회사 유엔진솔루션즈 <br/>-->
                                    <!--                                    주소 : 서울특별시 서초구 신반포로45길 18 502호(잠원동, 주일빌딩), Tel : 02-567-8301<br/>-->
                                    <!--                                    대표이사 : 장진영, 사업자등록번호 : 2118795355<br/>-->
                                    <!--                                    상품에 대하여 교환/환불 민원 발생시 '(주)유엔진솔루션즈'에서 처리하며, 모든 책임은 '(주)유엔진솔루션즈'에 있습니다. 민원담당자 : 이수헌 02-567-8301<br/><br/>-->
                                    <!--                                    Copyright © uEngine All Rights Reserved-->
                                </div>
                            </v-row>
                        </div>

                        <div style="margin-top: 5px;">
                            <v-btn text @click="provision()"> {{$t('word.terms')}}</v-btn>
                            <v-btn text @click="provision()"> {{$t('word.privacy')}}</v-btn>
                        </div>
                    </v-row>
                </div>
            </v-card>
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
            provisionStyle() {
                if (this.logo) {
                    return 'font-size: small; margin-left: 25px;'
                }
                return 'font-size: small; margin-left: 10px;'
            },
        }
    }
</script>