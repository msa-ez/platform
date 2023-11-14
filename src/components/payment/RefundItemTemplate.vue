<template>
    <div style="background: white; height: 100%; width: 100%;">

        <div class="main-title" style="margin-left: 5%; padding-top: 20px;"> {{getMainTitle}}</div>
        <v-row style="margin-left: 3%; margin-right: 3%;">

            <v-col cols="7" style="margin-top: 10px;">
                <div class="sub-title">환불 내용</div>
                <v-divider></v-divider>
                <slot>
                    <div class="content-title" style="margin-top: 15px;">* 환불 상품</div>
                    <div class="content-text" style="margin-left: 5px;">{{getTitle}}</div>
                </slot>

                <v-row style="margin-top: 15px;">
                    <v-col>
                        <div class="content-title">* 환불 금액</div>
                        <div class="content-text-bold" style="margin-left: 5px;"> {{getPaidAmount}} {{ isPgPayment ?
                            '원':'Coin'}}
                        </div>
                    </v-col>
                </v-row>

                <div class="content-title" style="margin-top: 15px;">* 사용 기간</div>
                <div class="content-text" style="margin-left: 5px;">{{getPeriodDate}}</div>
            </v-col>


            <v-col cols="5" style="margin-top: 10px; margin-bottom: -65px;">
                <div class="sub-title"> 구매자 정보</div>
                <v-divider></v-divider>
                <div class="content-title" style="margin-top: 15px;">* 이메일</div>
                <div class="content-text" style="margin-left: 5px;"> {{getUserEmail}}</div>
                <div class="sub-title" style="margin-top: 15px;"> 환불 사유</div>
                <v-divider></v-divider>
                <div style="margin-top: 15px;">
                    <v-autocomplete
                            v-if="refundReasons"
                            v-model="refundReasons.reasonId"
                            :items="refundReasons.reasons"
                            item-text="reason"
                            item-value="id"
                            filled
                            rounded
                            dense
                    ></v-autocomplete>
                    <v-text-field
                            v-if="refundReasons && refundReasons.reasonId == 4"
                            v-model="refundReasons.refundText"
                            placeholder="환불 사유"
                            style="margin-top: -5%;"
                            outlined
                            dense
                    ></v-text-field>
                </div>

                <div style="margin-top: -15%;">
                    <v-checkbox v-model="agreeRefunded">
                        <template v-slot:label>
                            <div class="gs-content-detail">
                                (필수) 환불 진행에 동의 하십니까?
                            </div>
                        </template>
                    </v-checkbox>
                </div>
            </v-col>
        </v-row>


        <v-row style="justify-content: flex-end; margin-right: 10px; margin-top: 4%;">
            <div>
                <v-btn
                        :disabled="refunding || !agreeRefunded "
                        color="primary"
                        style="background: #175fc7;"
                        @click="submit()">
                    {{getSubmitText}}
                </v-btn>
                <v-btn
                        text
                        @click="close(true)">
                    {{$t('word.close')}}
                </v-btn>
            </div>
        </v-row>
    </div>
</template>

<script>

    export default {
        name: 'refund-item-template',
        data() {
            return {
                agreeRefunded: false,
            }
        },
        props: {
            refunding: {
                type: Boolean,
                default: function () {
                    return false;
                }
            },
            refundReasons: {
                type: Object,
                default: function () {
                    return null;
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
            itemAmount: {
                type: Number,
                default: function () {
                    return 0;
                }
            },
            issuedDate: {
                type: Number,
                default: function () {
                    return 0;
                }
            },
            expiredDate: {
                type: Number,
                default: function () {
                    return 0;
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
            userEmail: {
                type: String,
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
            paymentType: {
                type: String,
                default: function () {
                    return null;
                }
            },
        },
        computed: {
            getMainTitle() {
                return '환불 진행'
            },
            getTitle() {
                return this.title
            },
            getPaidAmount() {
                return this.itemAmount
            },
            isPgPayment() {
                if (this.paymentType == 'pg') {
                    return true
                }
                return false
            },
            getSubmitText() {
                return '환불'
            },
            getPeriodDate() {
                var started = this.convertTimeStampToDate(this.issuedDate)
                var ended = this.convertTimeStampToDate(this.expiredDate)
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
            getUserEmail() {
                if (this.userEmail) {
                    return this.userEmail
                }
                return null
            },
            getUserName() {
                return null
            },
        },
        methods: {
            close(force) {
                this.agreeRefunded = false
                this.$emit('close', force)
            },
            submit() {
                this.agreeRefunded = false
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
            },
        },
    }
</script>

<style>
    .testclass {
        width: 120% !important;
        margin-left: 10% !important;
        text-align: center;
    }
</style>