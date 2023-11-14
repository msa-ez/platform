<template></template>

<script>
    // import StorageBaseFireBase from "../designer/modeling/StorageBaseFireBase_";
    // import StorageBase from "../designer/modeling/StorageBase";
    import StorageBase from "../CommonStorageBase";

    export default {
        name: 'PaymentAbstract',
        mixins: [StorageBase],
        props: {
            itemId: {
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
            itemResourceType: {
                type: String,
                default: function () {
                    return null;
                }
            },
        },
        data() {
            return {
                paid: false,
                buying: false
            }
        },
        // async created() {
        // if (!this.isLogin)
        //     await this.loginUser()
        // },
        computed: {
            isPaid() {
                if (this.getItemAmount == 0) {
                    return true
                }
                return this.paid
            },
            getItemId() {
                if (this.itemId)
                    return this.itemId
                return this.resourceId
            },
            getItemAmount() {
                return Number(this.itemAmount)
            },
            userSavedCoin() {
                var me = this
                if (me.isLogin && me.userInfo) {
                    var coin = Number(me.userInfo.savedCoin)
                    return coin
                }
                return 0
            },
            getItemResourceType() {
                return this.itemResourceType
            },

        },
        methods: {
            _pay(obj, type) {
                throw new Error("must be implemented")
            },
            _refund(obj, type) {
                throw new Error("must be implemented")
            },
            async pay(obj, type) {
                return await this._pay(obj, type)
            },
            async refund(obj, type) {
                return await this._refund(obj, type)
            },
        }
    }
</script>