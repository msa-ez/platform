<template>
    <div>
        <v-card flat color="white">
            <v-tabs style = "overflow:hidden;" fixed-tabs>
                <v-tab>쿠폰 입력</v-tab>
                <v-tab>친구 추천</v-tab>

                <!-- 코인 입력 -->
                <v-tab-item style="height: 100%; width: 100%;">
                    <v-card flat>
                        <div>
                            <v-text-field
                                    v-model="inputCoupon"
                                    style="width:92%; margin:5% 0 0 4%;"
                                    dense
                                    label="Coupon Number"
                                    @keypress.enter="onInputCoupon()"
                            >
                            </v-text-field>
                            <div style="margin-left:30px;">{{ couponState }}</div>
                        </div>
                        <v-card-actions>
                            <v-row style="justify-content: flex-end;">
                                <v-btn @click="closeDialog()" text>{{$t('word.close')}}</v-btn>
                                <v-btn @click="onInputCoupon()"
                                    color="primary" text
                                    style="font-weight:900; margin-right: 10px;"
                                >입력</v-btn>
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>

                <!-- 친구 추천 -->
                <v-tab-item style="height: 100%; width: 100%;">
                    <v-card flat>
                        <div>
                            <v-text-field
                                    v-model="inputInvitedEmail"
                                    style="width:92%; margin:5% 0 0 4%;"
                                    dense
                                    label="Your friend’s e-mail address here"
                                    @keypress.enter="onInvitedUser()"
                            ></v-text-field>
                            <div style="margin-left:30px;">{{ invitedState }}</div>
                        </div>
                        <v-card-actions>
                            <v-row style="justify-content: flex-end;">
                                <v-btn @click="closeDialog()" text>{{$t('word.close')}}</v-btn>
                                <v-btn @click="onInvitedUser()"
                                    color="primary" text
                                    style="font-weight:900; margin-right: 10px;">초대</v-btn>
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
            </v-tabs>
        </v-card>
    </div>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";

    export default {
        name: 'pricing',
        props: {},
        mixins: [CommonStorageBase],
        data: () => ({
            inputCoupon: '',
            couponState: '* 쿠폰 번호를 입력해 주세요.',
            inputInvitedEmail: '',
            invitedState: '* 친구를 초대하여 가입하면 500 Coin이 충전됩니다.',
        }),
        async created() {

        },
        watch: {},
        computed: {
            userEmail() {
                if (localStorage.getItem('email')) {
                    return localStorage.getItem('email')
                }
                return null
            },
            userName() {
                if (localStorage.getItem('userName')) {
                    return localStorage.getItem('userName')
                }
                return null
            },

        },
        methods: {
            async onInvitedUser() {
                var me = this
                try {
                    if (!this.isLogin)
                        await this.setUserInfo()


                    if (me.isLogin) {
                        if (me.inputInvitedEmail && me.inputInvitedEmail.includes('@gmail.com')) {
                            var convertEmail = me.inputInvitedEmail.replaceAll('.', '_')
                            var checkUser = await me.getString(`db://enrolledUsers/${convertEmail}`)
                            if (checkUser) {
                                me.inputInvitedEmail = ''
                                me.invitedState = '* 이미 가입된 유저 입니다.'
                            } else {
                                if (me.userEmail) {
                                    var obj = {
                                        toUser: me.inputInvitedEmail,
                                        fromUser: me.userInfo.email,
                                        fromUserName: me.userInfo.name,
                                        state: 'ready',
                                        issuedDate: Date.now()
                                    }
                                    await me.putObject(`db://invitations/${convertEmail}`, obj)
                                    me.inputInvitedEmail = ''
                                    alert('추천 메일 전송 요청 되었습니다.')
                                }
                            }

                        } else {
                            me.invitedState = '* Email 을 확인해주세요. Gmail 또는 GitHub 이메일로 추천해야 합니다.'
                        }
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }

                } catch (e) {
                    alert(`invitedUser-Error: ${e}`)
                }
            },
            async onInputCoupon() {
                var me = this
                if (!this.isLogin)
                    await this.setUserInfo()

                try {
                    if (me.isLogin) {
                        if (me.inputCoupon) {
                            var checkCoupon = await me.getString(`db://coupons/${me.inputCoupon}`)
                            if (checkCoupon) {
                                if (checkCoupon.used) {
                                    me.couponState = '* 사용된 쿠폰번호 입니다.'
                                } else {
                                    if (me.userInfo.email) {
                                        var obj = {
                                            usedUser: me.userInfo.email
                                        }
                                        await me.putObject(`db://coupons/${me.inputCoupon}`, obj)
                                        me.couponState = '* 쿠폰이 사용되었습니다.'
                                    } else {
                                        me.couponState = '* 새로고침 또는 재 로그인후 시도해주세요.'
                                    }

                                }

                            } else {
                                me.couponState = '* 존재 하지 않는 쿠폰번호 입니다. 확인해주세요.'
                            }

                        } else {
                            me.couponState = '* 쿠폰번호 을 확인해주세요.'
                        }
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }
                } catch (e) {
                    alert(`Coupon Error: ${e}`)
                }

            },
            closeDialog() {
                this.inputCoupon = ''
                this.couponState = '* 쿠폰 번호를 입력해 주세요.'
                this.inputInvitedEmail = ''
                this.invitedState = '* 친구를 초대하여 가입하면 500 Coin이 충전됩니다.'
                this.$emit('close')
            },
        }
    }
</script>

<style>
    .price-card {
        border-style: solid;
        border-width: thin;
    }


    .price-card:hover {
        background-color: aliceblue;
    }

    .coin-text {
        margin: 10px 0 0 15px;
        font-weight: 900;
        font-size: 18px;
    }

    .swing {
        animation: swing ease-in-out 1s infinite alternate;
        transform-origin: bottom -5px;
        float: left;
        box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
    }

    .swing img {
        border: 100px solid #f8f8f8;
        display: block;
    }


    @keyframes swing {
        0% {
            transform: rotate(3deg);
        }
        100% {
            transform: rotate(-3deg);
        }
    }
</style>
