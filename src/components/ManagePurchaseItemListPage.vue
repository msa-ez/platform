<template>
    <v-container style="max-width: 1500px">
        <div>
            <v-row>
                <h1>코인 쿠폰 목록</h1>
                <div style="align-self:center; margin-right: 10px; margin-left: 30px; ">쿠폰 발행</div>
                <v-text-field
                        v-model="coinValueByCoupon"
                        label="Input Coin Value"
                        @keydown.enter="registerCoupon()"
                        style="max-width: 10%; margin-left: 30px;"
                >
                </v-text-field>
            </v-row>

            <v-data-table
                    :headers="couponHeaders"
                    :items="couponItemLists"
                    :items-per-page="7"
                    class="elevation-1"
            >
                <template v-slot:item.when="{ item }">
                    {{ convertTimeStampToDate(item.when) }}
                </template>

            </v-data-table>
        </div>
        <div style="margin-top: 30px;">
            <h1>사용자 구매목록</h1>
            <v-data-table
                    :headers="headers"
                    :items="itemLists"
                    :items-per-page="7"
                    class="elevation-1"
            >
                <template v-slot:item.when="{ item }">
                    {{ convertTimeStampToDate(item.when) }}
                </template>
                <template v-slot:item.expiredDate="{ item }">
                    {{ convertExpiredDateToDate(item.when,item.expiredDate) }}
                </template>
            </v-data-table>
            <!--            <div style="text-align:end; ">-->
            <!--                <v-btn text @click="prevPurchaseItems()">-->
            <!--                    <v-icon> mdi-chevron-left</v-icon>-->
            <!--                </v-btn>-->
            <!--                <v-btn text @click="nextPurchaseItems()">-->
            <!--                    <v-icon> mdi-chevron-right</v-icon>-->
            <!--                </v-btn>-->
            <!--            </div>-->
        </div>
    </v-container>
</template>

<script>
    // import StorageBase from "./designer/modeling/StorageBase";
    import CommonStorageBase from "./CommonStorageBase";

    export default {
        name: 'managePurchaseItemListPage',
        mixins: [CommonStorageBase],
        components: {},
        props: {},
        data() {
            return {
                totalCount: 0,
                findUser: {
                    email: '',
                    coin: null,
                },
                putDepositCoin: 0,
                coinValueByCoupon: 0,
                headers: [
                    {
                        text: '관리 번호',
                        align: 'start',
                        sortable: false,
                        value: 'manageKey',
                    },
                    {text: '유저 이메일', value: 'userId'},
                    {text: '상품 고유 번호', value: 'itemId'},
                    {text: '개인 구매 번호', value: 'purchaseHistoryId'},
                    {text: '리소스 번호', value: 'resourceId'},
                    {text: '상품 가격', value: 'price'},
                    {text: '구매 일자', value: 'when'},
                    {text: '만료 일자', value: 'expiredDate'},
                ],
                purchaseItemData: [],
                couponHeaders: [
                    {
                        text: '쿠폰 번호',
                        align: 'start',
                        sortable: false,
                        value: 'manageKey',
                    },
                    {text: '쿠폰 코인금액', value: 'coin'},
                    {text: '사용 유저', value: 'usedUserEmail'},
                    {text: '사용 유무', value: 'used'},
                    {text: '사용 일자', value: 'when'},
                    {text: '발행자', value: 'issuedUserEmail'},
                ],
                couponItemData: []
            }
        },
        computed: {
            couponItemLists() {
                var me = this
                console.log(me.couponItemData)
                if (me.couponItemData) {
                    return me.couponItemData
                }
                return []
            },
            itemLists() {
                var me = this
                if (me.purchaseItemData) {
                    return me.purchaseItemData
                }
                return []
            },
            isAdmin() {
                var email = localStorage.getItem('email')
                if (localStorage.getItem('accessToken')) {
                    if (email && email.includes('@uengine.org')) {
                        return true
                    }
                }
                return false
            },
        },
        created() {
            var me = this
            if (me.isAdmin) {
                me.getLastManagePurchaseItem()
                me.getLastManageCouponItems()
            }

        },
        mounted() {
            var me = this

        },
        methods: {
            async depositCoin() {
                var me = this
                var convertEmail = me.findUser.email.replace(/\./gi, '_')
                try {
                    if (me.putDepositCoin) {
                        var obj = {
                            action: 'deposit',
                            state: 'admin_deposit',
                            price: me.putDepositCoin,
                            when: Date.now(),
                            userId: me.findUser.email,
                            expiredDate: 0,
                        }
                        // await me.pushString(`db://enrolledUsers/${convertEmail}/purchaseHistory`, obj)
                        await me.pushObject(`db://enrolledUsers/${convertEmail}/purchaseHistory`, obj)
                    } else {
                        alert('coin 입력')
                    }
                } catch (e) {
                    alert(e)
                }

            },
            async getFindUser() {
                var me = this
                try {
                    if (me.findUser.email) {
                        var convertEmail = me.findUser.email.replaceAll('.', '_')
                        var getCoin = await me.getString(`db://enrolledUsers/${convertEmail}/savedCoin`)
                        if (typeof getCoin == 'number') {
                            me.findUser.coin = getCoin
                        } else {
                            me.findUser.coin = 1000
                        }
                    }
                } catch (e) {
                    alert(e)
                }

            },
            async registerCoupon() {
                var me = this
                try {
                    if (typeof me.coinValueByCoupon != 'number') me.coinValueByCoupon = Number(me.coinValueByCoupon)

                    var IssueEmail = localStorage.getItem('email') ? localStorage.getItem('email') : null
                    var obj = {
                        coin: me.coinValueByCoupon,
                        issuedUserEmail: IssueEmail,
                        used: false
                    }

                    // var key = await me.pushString(`db://coupon`, obj)
                    var key = await me.pushObject(`db://coupon`, obj)
                    me.coinValueByCoupon = 0
                    me.couponItemData.__ob__.dep.notify()
                    alert('쿠폰 ' + key + ' (가) 추가 되었습니다.')
                } catch (e) {
                    alert(e)
                }

            },
            prevPurchaseItems() {
                console.log('Prev')
            },
            async nextPurchaseItems() {
                console.log('Next')
                // var me = this
                // var lastItem = me.purchaseItemData[me.purchaseItemData.length - 1]
                // var option = {
                //     sort: "desc",
                //     orderBy: 'child://when',
                //     size: 10,
                //     startAt: lastItem.when,
                //     endAt: null,
                // }
                // var snapshots = await me.list('db://managePurchaseItems', option)
                // if (snapshots) {
                //     me.reversedChildren(snapshots).forEach(function (snapshot) {
                //         var manageKey = snapshot.key
                //         var mangeItem = snapshot.val()
                //         var obj = Object.assign({manageKey: manageKey}, mangeItem)
                //         me.purchaseItemData.push(obj)
                //     })
                // }

            },
            async getLastManageCouponItems() {
                var me = this
                var totalSnap = await me.list('db://coupon')

                if (totalSnap) {
                    me.totalCount = Object.keys(totalSnap).length
                }
                if (totalSnap) {
                    Object.keys(totalSnap).forEach(function (snapshotKey) {
                        var manageKey = snapshotKey
                        var mangeItem = totalSnap[manageKey]
                        var obj = Object.assign({manageKey: manageKey}, mangeItem)
                        me.couponItemData.push(obj)
                    })
                }
            },
            async getLastManagePurchaseItem() {
                var me = this
                var option = {
                    sort: "desc",
                    orderBy: 'issuedDate',
                    size: 10,
                    startAt: null,
                    endAt: null,
                }
                var totalSnap = await me.list('db://purchaseItemHistoryLists')
                var snapshots = await me.list('db://purchaseItemHistoryLists', option)

                if (totalSnap) {
                    me.totalCount = Object.keys(totalSnap).length
                }
                if (totalSnap) {
                    Object.keys(totalSnap).forEach(function (snapshotKey) {
                        var manageKey = snapshotKey
                        var mangeItem = totalSnap[snapshotKey]
                        var obj = Object.assign({manageKey: manageKey}, mangeItem)
                        me.purchaseItemData.push(obj)
                    })
                }
                //last 10
                // if (snapshots) {
                //     me.reversedChildren(snapshots).forEach(function (snapshot) {
                //         var manageKey = snapshot.key
                //         var mangeItem = snapshot.val()
                //         var obj = Object.assign({manageKey: manageKey}, mangeItem)
                //         me.purchaseItemData.push(obj)
                //     })
                // }
            },
            reversedChildren(snapshot) {
                var children = [];
                snapshot.forEach(function (child) {
                    children.unshift(child);
                });
                return children;
            },
            convertTimeStampToDate(timeStamp) {
                if (timeStamp) {
                    if (typeof timeStamp == 'string')
                        timeStamp = Number(timeStamp)
                    var date = new Date(timeStamp);
                    return date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 " + date.getHours() + "시 " + date.getMinutes() + "분"
                } else {
                    return null
                }
            },
            convertExpiredDateToDate(startDate, millisecond) {
                if (typeof millisecond == 'string')
                    millisecond = Number(millisecond)

                if (millisecond == 0) {
                    return '무제한 '
                } else {
                    return this.convertTimeStampToDate(startDate + millisecond)
                }
            }
        }
    }
</script>
