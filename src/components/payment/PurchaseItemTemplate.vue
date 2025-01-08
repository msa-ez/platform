<template>
    <div style="background: white; height: 100%; width: 100%; padding-bottom:20px; overflow-y: hidden; overflow-x: hidden;">
        <div v-if="choice == 0">
            <v-btn @click="close" small text style="float: right; right: -10px;"><v-icon small>mdi-close</v-icon></v-btn>
            <div class="main-title"
                 style="margin-left:38%; padding-top: 10px;"
            >수단 선택</div>
            <div style="width:100%; padding-left:8%; margin-top:20px;">
                <v-row style="margin-bottom:1%;">
                    <div class="content-title">결제 상품 :</div>
                    <div style="margin:4px 0 0 5px;" class="content-text">{{getTitle}}</div>
                </v-row>
                <v-row style="margin-bottom:1%;">
                    <div class="content-title">사용 기간 :</div>
                    <div style="margin:3px 0 0 5px;" class="content-text">{{getPeriodDate}}</div>
                </v-row>
            </div>
            <div style="width: 92%; margin-left: 4%;">
                <slot></slot>
            </div>

            <v-card style="width:100%; margin-bottom:10px; display:block; text-aling:center;"
                    outlined flat class="choice-card"
            >
                <v-card-text>
                    <v-row>
                        <v-card width="50%" height="200px;" @click="selectPaymentType(1)" :disabled="onlyPG">
                            <v-card-title style="justify-content: center;">코인</v-card-title>
                            <v-card-text style="text-align: center;">
                                <Icon icon="ph:coins-thin" width="70" height="70" />
                            </v-card-text>
                        </v-card>
                        <v-card width="50%" height="200px;" @click="selectPaymentType(2)">
                            <v-card-title style="justify-content: center;">카드</v-card-title>
                            <v-card-text style="text-align: center;"><Icon icon="bi:credit-card" width="70" height="70" /></v-card-text>
                        </v-card>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>

        <!--     COIN       -->
        <div v-else-if="choice == 1" style="height: 100%;">
            <v-row style="justify-content: space-between; margin-left: 0px; margin-right: 0px;">
                <div class="main-title" style="margin-left: 5%; padding-top: 20px; margin-bottom:-20px;">
                    {{getMainTitle}}
                </div>
                <v-btn x-small text @click="back()" style="margin-top: 15px; margin-right: 5px;">
                    <v-icon small>mdi-keyboard-backspace</v-icon>
                </v-btn>
            </v-row>
            <v-row style="margin-left: 3%; margin-right: 3%; margin-top:-40px;">
                <v-col style="margin-top: 10px;">
                    <!-- <div class="sub-title">결제 내용</div>
                    <v-divider></v-divider> -->
                    <div style="padding-left:7px;">
                        <v-row style="margin-top:15px;">
                            <div class="content-title">이 름 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;"> {{getUserName}}</div>
                        </v-row>

                        <v-row style="margin-bottom:5px;">
                            <div class="content-title">이메일 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;"> {{getUserEmail}}</div>
                        </v-row>

                        <v-divider style="margin:5px 0 0 -10px; padding-bottom:5px;"></v-divider>

                        <v-row style="margin-top:0px;">
                            <div class="content-title">결제 상품 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;">{{getTitle}}</div>
                        </v-row>

                        <v-row>
                            <div class="content-title">사용 기간 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;">{{getPeriodDate}}</div>
                        </v-row>

                        <v-row>
                            <div class="content-title">결제 금액 :</div>
                            <div class="content-text" style="font-weight:700; margin:3px 0 0 5px;">{{getPaidAmount}} {{
                                isPgPayment ? '원':'Coin'}}
                            </div>
                        </v-row>

                        <v-row>
                            <div class="content-title">남은 코인 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;">{{getCalculateAmount}}
                                Coin
                            </div>
                        </v-row>
                    </div>
                    <v-row style="justify-content: space-between; margin-top: 20px;">
                        <div style="font-size: 10px; align-self: center; margin:20px 0 0 3px;">'환불 불가' 상품</div>
                        <div>
                            <v-btn
                                    :disabled="paying"
                                    color="primary"
                                    style="background: #175fc7;"
                                    @click="submit()">
                                코인 사용
                            </v-btn>
                            <v-btn
                                    text
                                    @click="close(true)">{{$t('word.close')}}
                            </v-btn>
                        </div>
                    </v-row>
                </v-col>
            </v-row>
        </div>

        <!--     SELECTC CARD       -->
        <div v-else-if="choice == 2" style="height: 100%;">
            <v-btn @click="back()" small text style="float: right; right: -10px;"><v-icon small>mdi-keyboard-backspace</v-icon></v-btn>
            <div class="main-title"
                 style="margin-left:38%; padding-top: 10px;"
            >카드 결제</div>

            <v-card style="width:100%; margin-bottom:10px; display:block; text-aling:center;"
                    outlined flat class="choice-card"
            >
                <v-card-text>
                    <v-row>
                        <v-card width="50%" height="200px;" @click="selectPaymentType(3)">
                            <v-card-title style="justify-content: center;">단건</v-card-title>
                            <v-card-text style="text-align: center;"><Icon icon="fluent:book-24-filled" width="70" height="70" /></v-card-text>
                        </v-card>
                        <v-card width="50%" height="200px;" @click="selectPaymentType(4)">
                            <v-card-title style="justify-content: center;">구독</v-card-title>
                            <v-card-text style="text-align: center;"><Icon icon="icomoon-free:books" width="70" height="70" /></v-card-text>
                        </v-card>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>

        <!-- CARD ONLY ONE -->
        <div v-else-if="choice == 3" style="height: 100%;">
            <v-row style="justify-content: space-between; margin-left: 0px; margin-right: 0px;">
                <div class="main-title" style="margin-left: 5%; padding-top: 20px; margin-bottom:-20px;">
                    {{getMainTitle}}
                </div>
                <v-btn x-small text @click="back()" style="margin-top: 15px; margin-right: 5px;">
                    <v-icon small>mdi-keyboard-backspace</v-icon>
                </v-btn>
            </v-row>
            <v-row style="margin-left: 3%; margin-right: 3%; margin-top:-40px;">
                <v-col style="margin-top: 10px;">
                    <div style="padding-left:7px;">
                        <v-row style="margin-top:15px;">
                            <div class="content-title">이 름 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;"> {{getUserName}}</div>
                        </v-row>

                        <v-row style="margin-bottom:5px;">
                            <div class="content-title">이메일 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;"> {{getUserEmail}}</div>
                        </v-row>

                        <v-divider style="margin:5px 0 0 -10px; padding-bottom:5px;"></v-divider>

                        <v-row style="margin-top:0px;">
                            <div class="content-title">결제 상품 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;">{{getTitle}}</div>
                        </v-row>

                        <v-row>
                            <div class="content-title">사용 기간 :</div>
                            <div class="content-text" style="margin:3px 0 0 5px;">{{getPeriodDate}}</div>
                        </v-row>

                        <v-row>
                            <div class="content-title">결제 금액 :</div>
                            <div class="content-text" style="font-weight:700; margin:3px 0 0 5px;">{{getPaidAmount}} 원</div>
                        </v-row>

                        <div style="margin:0 0 -60px -12px;">
                            <v-checkbox v-model="agreePayment">
                                <template v-slot:label>
                                    <div class="gs-content-detail">
                                        (필수) 구매조건 및 개인정보취급방침 동의
                                        <v-tooltip bottom>
                                            <template v-slot:activator="{ on }">
                                                <a
                                                        @click="moveProvision()"
                                                        v-on="on"
                                                >
                                                    (보기)
                                                </a>
                                            </template>
                                            열기
                                        </v-tooltip>
                                    </div>
                                </template>
                            </v-checkbox>
                        </div>
                        <v-row style="justify-content: space-between; margin-top: 20px;">
                            <div style="font-size: 10px; align-self: center; margin:20px 0 0 3px;">'환불 불가' 상품</div>
                            <div>
                                <v-btn
                                        :disabled="paying || !agreePayment"
                                        color="primary"
                                        style="background: #175fc7;"
                                        @click="submit()">
                                    결제
                                </v-btn>
                                <v-btn
                                        text
                                        @click="close(true)">{{$t('word.close')}}
                                </v-btn>
                            </div>
                        </v-row>
                    </div>
                </v-col>
            </v-row>
        </div>
        <!--     SUBSCRIPTION       -->
        <div v-else-if="choice == 4" style="height: 100%;">
            <v-row style="justify-content: space-between; margin-left: 0px; margin-right: 0px;">
                <div class="main-title" style="margin-left: 5%; padding-top: 20px; margin-bottom:-20px;"></div>
                <v-btn x-small text @click="back()" style="margin-right: 5px; margin-top: 15px;">
                    <v-icon small>mdi-keyboard-backspace</v-icon>
                </v-btn>
            </v-row>
            <v-row style="margin-left: 3%; margin-right: 3%; margin-top: 3%; height: 100%; ">
                <SubscriptionItemTemplate
                        :userSavedAmount="getUserSavedAmount"
                        :userEmail="getUserEmail"
                        :userName="getUserName"
                        @close="close"
                ></SubscriptionItemTemplate>
            </v-row>
        </div>
    </div>
</template>

<script>
    import GetCoin from "./GetCoin";
    import SubscriptionItemTemplate from "./SubscriptionItemTemplate";

    export default {
        name: 'purchase-item-template',
        data() {
            return {
                open: false,
                isPgPayment: false,
                onlyPG: false,
                agreePayment: false,
                choice: 0,
            }
        },
        components: {GetCoin, SubscriptionItemTemplate},
        props: {
            paying: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            mainTitle: {
                type: String,
                default: function () {
                    return null;
                }
            },
            title: {
                type: String,
                default: function () {
                    return null;
                }
            },
            itemClassName: {
                type: String,
                default: function () {
                    return null;
                }
            },
            itemLabName: {
                type: String,
                default: function () {
                    return null;
                }
            },
            itemAmount: {
                type: Number,
                default: function () {
                    return 0;
                }
            },
            itemPeriod: {
                type: Number,
                default: function () {
                    return 90;
                }
            },
            thumbnailText: {
                type: String,
                default: function () {
                    return null;
                }
            },
            thumbnailImg: {
                type: String,
                default: function () {
                    return null;
                }
            },
            userInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
            resourceType: {
                type: String,
                default: function () {
                    return null;
                }
            },
        },
        computed: {
            selectedPaymentStyle() {
                if (this.isPgPayment) {
                    return 'border-color: silver;'
                }
                return 'width: 60px; height: 60px;'
            },
            selectedCoinStyle() {
                if (this.isPgPayment) {
                    return 'width: 60px; height: 60px;'
                }
                return 'border-color: silver;'
            },
            getUserEmail() {
                if (this.userInfo && this.userInfo.email) {
                    return this.userInfo.email
                }
                return null
            },
            getUserName() {
                if (this.userInfo && this.userInfo.name) {
                    return this.userInfo.name
                }
                return null
            },
            getMainTitle() {
                if (this.mainTitle)
                    return this.mainTitle

                if (this.isPgPayment) {
                    return ''
                } else {
                    // return '내용을 보기위해 코인을 사용합니다.'
                }
            },
            getTitle() {
                return this.title
            },
            getItemClassName() {
                if (this.itemClassName)
                    return this.itemClassName
                return null
            },
            getItemLabName() {
                if (this.itemLabName)
                    return this.itemLabName
                return null
            },
            getItemPeriod() {
                return this.itemPeriod
            },
            getItemAmount() {
                return Number(this.itemAmount) / 100
            },
            getItemPrice() {
                return Number(this.itemAmount)
            },
            getPaidAmount() {
                if (this.isPgPayment) {
                    return this.getItemPrice
                }
                return this.getItemAmount
            },
            getUserSavedAmount() {
                if (this.userInfo && this.userInfo.savedCoin) {
                    return Number(Number(this.userInfo.savedCoin).toFixed(2))
                }
                return 0
            },
            getCalculateAmount() {
                if ((this.getUserSavedAmount - this.getItemAmount).toFixed(2) < 0) {
                    this.onlyPG = true
                } else {
                    this.onlyPG = false
                }
                return (this.getUserSavedAmount - this.getItemAmount).toFixed(2)
            },
            getNowTimeStamp() {
                return Date.now()
            },
            getExpiredTimeStamp() {
                return this.getNowTimeStamp + ((this.getItemPeriod * 24 * 60 * 60) * 1000)
            },
            getPeriodDate() {
                var started = this.convertTimeStampToDate(this.getNowTimeStamp)
                var ended = this.convertTimeStampToDate(this.getExpiredTimeStamp)
                var periodDate = this.getItemPeriod
                if (periodDate != 0 && periodDate < 1) {
                    periodDate = periodDate * (24 * 60)
                    periodDate = `${periodDate} 분`
                } else {
                    if (periodDate == 0) {
                        periodDate = `90 일`
                    } else {
                        periodDate = `${periodDate} 일`
                    }
                }


                if (started == ended) {
                    return `${periodDate}`
                }
                return `${started} ~ ${ended}`
            },
            getSubmitText() {
                if (this.isPgPayment) {
                    return '결제'
                }
                return '코인 사용'
            },
            getThumbnailImg() {
                var me = this
                if (me.thumbnailImg) {
                    if (me.thumbnailImg.includes('//youtu.be')) {
                        var getKey = me.thumbnailImg.split('/')[me.thumbnailImg.split('/').length - 1]
                        return `${me.getProtocol()}//img.youtube.com/vi/${getKey}/hqdefault.jpg`
                    }
                }
                return me.thumbnailImg
            },
            getThumbnailText() {
                var me = this
                if (me.thumbnailText && me.thumbnailText.includes("</mark-down>")) {
                    return {mark: true, text: me.thumbnailText}
                }
                return {mark: false, text: me.thumbnailText}
            },
            getSubscriptAmount() {

            },
            getCalSubscriptAmount() {

            },

        },
        methods: {
            back() {
                if(this.choice == 1){
                    this.choice = 0
                }else if(this.choice == 2){
                    this.choice = 0
                }else if(this.choice == 3){
                    this.choice = 2
                }else if(this.choice == 4){
                    this.choice = 2
                }
            },
            selectPaymentType(choice){
                if(choice == 1){
                    this.isPgPayment = false;
                }else if(choice == 2){
                    this.isPgPayment = true;
                }else if(choice == 3){
                    this.isPgPayment = true;
                }
                this.choice = choice
            },
            moveProvision() {
                window.open(`${window.location.host}/#/provision`)
            },
            openGetCoin() {
                this.$EventBus.$emit('openGetCoin', true)
                this.close()
            },
            close(force) {
                this.back()
                this.$emit('close', force)
            },
            submit() {
                this.$emit('submit', this.isPgPayment)
            },
            convertTimeStampToDate(timeStamp) {
                if (typeof timeStamp == 'string')
                    timeStamp = Number(timeStamp)
                var date = new Date(timeStamp);
                var year = date.getFullYear().toString().slice(-2)
                var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
                var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)
                var hour = ("0" + date.getHours()).slice(-2); //시 2자리 (00, 01 ... 23)
                var minute = ("0" + date.getMinutes()).slice(-2); //분 2자리 (00, 01 ... 59)
                var second = ("0" + date.getSeconds()).slice(-2); //초 2자리 (00, 01 ... 59)
                return year + "년 " + month + "월 " + day + "일 " + hour + "시 "
            }
        },
    }
</script>

<style>
    .choice-card:hover {
        background-color: aliceblue;
        cursor: pointer !important;
    }

    .testclass {
        width: 120% !important;
        margin-left: 10% !important;
        text-align: center;
    }
</style>