<template></template>

<script>
    import CommonStorageBase from "../CommonStorageBase";

    export default {
        name: 'pg-payment_',
        mixins: [CommonStorageBase],
        created() {
        },
        methods: {
            async _pay(obj) {
                var me = this
                await this.setUserInfo()
                if (obj && me.isLogin) {
                    console.log('PG', obj)
                    var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                    var itemId = obj.itemId ? obj.itemId : obj.resourceId
                    var getName = ''

                    var getTitle = obj.title
                    var getResourceType = obj.resourceType
                    var getPaymentType = obj.paymentType
                    // Ori
                    // var getAmount = obj.amount ? Number(obj.amount) : Number(obj.price)
                    // var getPgAmount = getAmount * 100
                    var getPgAmount = obj.amount ? Number(obj.amount) : Number(obj.price)
                    var getAmount = getPgAmount/ 100

                    var getPurchaseHistoryId = await me.pushString(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`)
                    var getIssuedDate = obj.issuedDate ? obj.issuedDate : Date.now()
                    var getClassName = obj.className ? obj.className : null
                    var getLabName = obj.labName ? obj.labName : null
                    var getPeriod = obj.period >= 0 ? Number(obj.period) : 90
                    var getNewExpiredDate = getPeriod == 0 ? getPeriod : getIssuedDate + (getPeriod * 24 * 60 * 60 * 1000) //90일
                    var getExpiredDate = obj.expiredDate == null ? getNewExpiredDate : obj.expiredDate


                    if ((getResourceType.includes('ide') && !getResourceType.includes('video')) || getResourceType.includes('consulting')) {
                        var idePrice = await me.getString(`db://pricing/${getResourceType}`) // 1000
                        getPgAmount = (getAmount / 60) * idePrice
                    }

                    if (getPurchaseHistoryId) {
                        return new Promise(async function (resolve, reject) {
                            IMP.request_pay({ // param
                                pg: "html5_inicis",
                                pay_method: "card",
                                merchant_uid: getPurchaseHistoryId,
                                name: getTitle,
                                amount: getPgAmount,
                                buyer_email: me.userInfo.email,
                                buyer_name: me.userInfo.name,
                                buyer_uid: me.userInfo.uid,
                            }, async function (rsp) {
                                // callback
                                if (rsp.success) {
                                    var paymentObj = {
                                        itemId: itemId,
                                        action: 'withdraw',
                                        paymentType: 'pg',
                                        paidAmount: getPgAmount,
                                        amount: getPgAmount,
                                        resourceType: getResourceType, // ide, class, lab, archive,
                                        relatedTo: rsp.imp_uid,
                                        historyId: rsp.merchant_uid, // 트리거 에서 이용
                                        className: getClassName,
                                        labName: getLabName,
                                        issuedDate: getIssuedDate,
                                        expiredDate: getExpiredDate,
                                        userEmail: me.userInfo.email
                                    }
                                    await me.pushObject(`db://payments/`, paymentObj)
                                    resolve(true)
                                } else {
                                    // 결제 실패 시 로직,
                                    alert("결제에 실패하였습니다.( " + rsp.error_msg + ' )');
                                    resolve(false)
                                }
                            });
                        })
                    } else {
                        return false
                    }
                } else {
                    return false
                }

            },
            async _refund(obj) {
                var me = this

                var action = 'refund'
                var amount = obj.amount
                var issuedDate = obj.issuedDate
                var expiredDate = obj.expiredDate
                var refundedDate = obj.refundedDate ? obj.refundedDate : Date.now()
                var itemId = obj.itemId
                var paidAmount = obj.paidAmount
                var paymentType = obj.paymentType
                var resourceType = obj.resourceType
                var userId = obj.userId
                var labName = obj.labName ? obj.labName : null
                var className = obj.className ? obj.className : null
                var relatedTo = obj.key ? obj.key : obj.relatedTo
                var reason = obj.refundedReason ? obj.refundedReason : null

                var refundObj = {
                    action: action,
                    itemId: itemId,
                    amount: amount,
                    paidAmount: paidAmount,
                    paymentType: paymentType,
                    resourceType: resourceType, // ide, class, lab, archive, pg
                    relatedTo: relatedTo,
                    className: className,
                    labName: labName,
                    issuedDate: issuedDate,
                    expiredDate: expiredDate,
                    refundedDate: refundedDate,
                    userEmail: userId,
                    refundedReason: reason
                }
                console.log('!!! PG Refund :: ', refundObj)
                await me.pushObject(`db://payments/`, refundObj)
            },
            convertCoinToPrice(price) {
                price = Number(price)
                price = Math.abs(price)
                price = price * 100
                price = Math.round(price)
                return price
            },
        }

    }
</script>