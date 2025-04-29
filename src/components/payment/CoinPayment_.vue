<template></template>

<script>
    // import StorageBase from "../designer/modeling/StorageBase";
    import CommonStorageBase from "../CommonStorageBase";

    export default {
        name: 'CoinPayment_',
        mixins: [CommonStorageBase],
        methods: {
            async _pay(obj) {
                var me = this
                await this.setUserInfo()
                if (obj && me.isLogin) {
                    var convertEmail = me.userInfo.email.replace(/\./gi, '_')
                    var itemId = obj.itemId ? obj.itemId : obj.resourceId

                    var getResourceType = obj.resourceType
                    var getAmount = obj.amount ? Number(obj.amount) : Number(obj.price) // 원화 지불금액.
                    // var getPaidAmount = getAmount
                    var getPaidAmount = getAmount / 100 // Coin 지불금액
                    var getPaymentType = obj.paymentType ? obj.paymentType : (obj.type ? obj.type : 'coin')
                    var getPurchaseHistoryId = await me.pushString(`db://enrolledUsers/${convertEmail}/purchaseItemHistory`)
                    var getIssuedDate = obj.issuedDate ? obj.issuedDate : Date.now()
                    var getRelatedTo = obj.relatedTo ? obj.relatedTo : (obj.itemId ? obj.itemId : null)
                    var getClassName = obj.className ? obj.className : null
                    var getLabName = obj.labName ? obj.labName : null
                    var getPeriod = obj.period >= 0 ? Number(obj.period) : 90
                    var getNewExpiredDate = getPeriod == 0 ? 0 : getIssuedDate + (getPeriod * 24 * 60 * 60 * 1000) //90일
                    var getExpiredDate = obj.expiredDate == null ? getNewExpiredDate : obj.expiredDate


                    // resourceType amount
                    //    ide       60분
                    //  class       100코인

                    if ( (getResourceType.includes('ide') && !getResourceType.includes('video'))  || getResourceType.includes('consulting')) {
                        getPaidAmount = (getAmount / 60) * 10
                    } else {
                        getAmount  = getPaidAmount
                    }

                    var paymentObj = {
                        itemId: itemId,
                        action: 'withdraw',
                        amount: getAmount,
                        paidAmount: getPaidAmount,
                        paymentType: getPaymentType,
                        resourceType: getResourceType, // ide, class, lab, archive, pg
                        relatedTo: getRelatedTo,
                        historyId: getPurchaseHistoryId, // 트리거 에서 이용
                        className: getClassName,
                        labName: getLabName,
                        issuedDate: getIssuedDate,
                        expiredDate: getExpiredDate,
                        userEmail: me.userInfo.email
                    }
                    await me.pushObject(`db://payments/`, paymentObj)
                    return true
                }
                return false
            },
            async _refund(obj) {
                var me = this
                if (obj) {
                    var action = 'refund'
                    var amount = obj.amount
                    var issuedDate = obj.issuedDate
                    var expiredDate = obj.expiredDate
                    var itemId = obj.itemId
                    var paidAmount = obj.paidAmount
                    var paymentType = obj.paymentType
                    var resourceType = obj.resourceType
                    var userId = obj.userId
                    var labName = obj.labName ? obj.labName : null
                    var className = obj.className ? obj.className : null
                    var relatedTo = obj.key ? obj.key : obj.relatedTo
                    var reason = obj.refundedReason ? obj.refundedReason : null
                    var refundedDate = obj.refundedDate ? obj.refundedDate : Date.now()

                    // if (resourceType.includes('ide') && !paymentType.includes('ide')) {
                    //     if (itemId == 'buy_ide') {
                    //         itemId = 'refund_ide'
                    //     }
                    // }

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
                    console.log('!!! Coin Refund :: ', refundObj)
                    await me.pushObject(`db://payments/`, refundObj)
                    return true
                }
                return false
            },
        },
    }
</script>
