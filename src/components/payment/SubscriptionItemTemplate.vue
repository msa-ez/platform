<template>
    <div>
        <div v-for="item in subscription">
            <v-card outlined style="width: 355px; margin-left: 10px; margin-bottom:20px;">
                <v-card-title class="main-title" style = "margin-bottom:-10px;">{{getTypeText(item.type)}}</v-card-title>
                <v-card-text style = "margin-bottom:3px;">
                    <v-row>
                        <div class="content-title" style="margin:3% 0 0 14px;">IDE 사용시간 : </div>
                        <div class="content-text" style="margin:10px 0 0 10px;">
                            {{item.ideTime}} 분({{setIdeMinToHour(item.ideTime)}} 시간)
                        </div>
                    </v-row>
                    <v-row>
                        <div class="content-title" style="margin:3% 0 0 14px;">코드 다운로드 : </div>
                        <div class="content-text" style="margin:10px 0 0 10px;">{{downloadCodeText(item.downloadCode)}}</div>
                    </v-row>
                    <v-row>
                        <div class="content-title" style="margin:3% 0 0 14px;">랩 수강 : </div>
                        <div class="content-text" style="margin:10px 0 0 10px;">{{item.availableLabs}} 강의</div>
                    </v-row>
                </v-card-text>

                <v-card-text style="margin-top:-20px;">
                    <div v-if="item.periods">
                        <v-card outlined class="choice-item-card" v-for="it in item.periods" @click="submit(it)"
                            style = "margin-bottom:5px;"
                        >
                            <v-row style="justify-content: center; padding-top: 20px;">
                                <div class="sub-title" style="font-weight: bold;">{{priceToText(it.price)}}</div>
                                <div class="content-text"> / {{periodToText(it.period)}}</div>
                            </v-row>
                            <div style="font-size: x-small;text-align: right; margin-right:10px;">'환불 불가'</div>
                        </v-card>
                    </div>
                    <v-card outlined v-else class="choice-item-card" @click="submit(item)">
                        <v-row style="justify-content: center; margin-top: 5px; padding-top: 20px;">
                            <div class="sub-title" style="font-weight: bold;">{{priceToText(item.price)}}</div>
                            <div class="content-text"> / {{periodToText(item.period)}}</div>
                        </v-row>
                        <div style="font-size: x-small;text-align: right; margin-right:10px;">'환불 불가'</div>
                    </v-card>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
    import PaymentBase from "./PaymentBase";

    var changeCase = require('change-case');

    export default {
        name: 'subscription-item-template',
        mixins: [PaymentBase],
        props: {
            userSavedAmount: {
                type: Number,
                default: function () {
                    return 0;
                }
            },
            userName: {
                type: String,
                default: function () {
                    return '';
                }
            },
            userEmail: {
                type: String,
                default: function () {
                    return '';
                }
            },
        },
        data() {
            return {
                agreePayment: false,
                isPgPayment: false,
                basic: 2000000,
                subscription: []
            }
        },
        async created() {
            var me = this
            var list = await me.list(`db://subscriptionItems`)
            Object.keys(list).forEach(async function (key) {
                var mainItem = list[key]
                if (mainItem && mainItem.display) {
                    mainItem.type = key

                    if (mainItem.periods) {
                        Object.keys(mainItem.periods).forEach(async function (type) {
                            var getPrice = await me.getString(`db://pricing/subscription-${type}`)
                            if (!getPrice) {
                                getPrice = me.basic
                            }
                            var obj = {
                                type: type,
                                period: mainItem.periods[type],
                                price: getPrice
                            }
                            mainItem.periods[type] = obj

                        })
                    } else {
                        mainItem.price = await me.getString(`db://pricing/subscription-${mainItem.type}`)
                    }
                    me.subscription.push(mainItem)
                }

            })
        },
        components: {},
        computed: {
            selectedPaymentStyle() {
                if (this.isPgPayment) {
                    return 'width: 60px; height: 60px; border: solid; border-color: silver;'
                }
                return 'width: 60px; height: 60px;'
            },
            selectedCoinStyle() {
                if (this.isPgPayment) {
                    return 'width: 60px; height: 60px;'
                }
                return 'width: 60px; height: 60px; border: solid; border-color: silver;'
            },
            getSubmitText() {
                if (this.isPgPayment) {
                    return '결제'
                }
                return '코인 사용'
            }
        },
        methods: {
            setIdeMinToHour(min) {
                if (min) {
                    return min / 60
                }
                return 0
            },
            getTypeText(type) {
                if (type)
                    return changeCase.pascalCase(type)
                return null
            },
            getSubscriptionAmount(price) {
                if (price)
                    return price / 100
                return this.basic / 100
            },
            getExpiredDate(period) {
                if (!period) period = 30
                var now = Date.now()
                var expired = now + (period * 24 * 60 * 60 * 1000)
                return expired
            },
            priceToText(price) {
                if (price)
                    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return 0
            },
            periodToText(period) {
                if (period) {
                    if (period < 365) {
                        period = period / 30
                        return `${period} 개월`
                    } else {
                        period = period / 365
                        return `${period} 년`
                    }
                }
                return null

            },
            downloadCodeText(item) {
                if (item == -1)
                    return '무제한'
                return `${item} 회`
            },
            selectPayment(isCoin) {
                this.isPgPayment = isCoin
            },
            moveProvision() {
                window.open(`${window.location.host}/#/provision`)
            },
            async submit(item) {
                try {
                    var me = this
                    var setItemTitle = `${me.getTypeText(item.type)} 구독`
                    var setItemId = `buy_subscription`
                    var setResourceType = `subscription-${item.type}`
                    var setAmount = me.getSubscriptionAmount(item.price)
                    var setWhen = Date.now()
                    var setExpiredDate = me.getExpiredDate(item.period)


                    var postObj = {
                        title: setItemTitle,
                        action: 'withdraw',
                        itemId: setItemId,
                        resourceType: setResourceType,
                        amount: setAmount,
                        issuedDate: setWhen,
                        expiredDate: setExpiredDate,
                    }
                    var callback = await me.autoPay(postObj, true)
                    console.log('callback:: ', callback)
                } catch (e) {
                    console.log(e)
                    alert(`Error : ${e}`)
                } finally {
                    this.close()
                }
            },
            close(force) {
                this.$emit('close', force)
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
    .choice-card {
        border-style: solid;
        border-width: thin;
    }

    .choice-card:hover {
        background-color: aliceblue;
    }


    .choice-item-card:hover {
        background-color: aliceblue;
        cursor: pointer;
    }

</style>