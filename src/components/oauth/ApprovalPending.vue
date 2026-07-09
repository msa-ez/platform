<template>
    <!-- 가입 승인 전(pending) / 거절(rejected) 유저를 전면 차단하는 오버레이.
         pending 이면 주기적으로 승인상태를 폴링해, 관리자가 승인하면 자동으로 진입한다. -->
    <v-overlay :value="true" :opacity="0.92" z-index="99999" color="#1E1E2F">
        <div style="text-align:center; max-width:420px; padding:24px;">
            <template v-if="status === 'rejected'">
                <v-icon size="64" color="red lighten-1">mdi-account-cancel</v-icon>
                <div style="font-size:20px; font-weight:700; margin-top:16px;">접근이 거부되었습니다</div>
                <div style="font-size:14px; color:#BDBDBD; margin-top:8px; line-height:1.6;">
                    관리자가 이 계정의 접근을 거부/차단했습니다.<br>문의가 필요하면 관리자에게 연락해주세요.
                </div>
            </template>
            <template v-else>
                <v-progress-circular indeterminate size="56" width="4" color="light-blue lighten-2"></v-progress-circular>
                <div style="font-size:20px; font-weight:700; margin-top:20px;">가입 승인 대기 중입니다</div>
                <div style="font-size:14px; color:#BDBDBD; margin-top:8px; line-height:1.6;">
                    관리자 승인 후 msaez 를 이용할 수 있습니다.<br>
                    승인되면 이 화면에서 <b>자동으로</b> 넘어갑니다.
                </div>
                <div v-if="email" style="font-size:12px; color:#8A8AA0; margin-top:14px;">
                    {{ email }}
                </div>
            </template>

            <v-btn text small color="grey lighten-1" style="margin-top:24px;" @click="logout">
                <v-icon left small>mdi-logout</v-icon> 로그아웃
            </v-btn>
        </div>
    </v-overlay>
</template>

<script>
    export default {
        name: 'approval-pending',
        props: {
            // 'pending' | 'rejected'
            status: { type: String, default: 'pending' },
            email: { type: String, default: '' },
        },
        data() {
            return { timer: null };
        },
        mounted() {
            // rejected 는 종단 상태 → 폴링 불필요. pending 만 승인 폴링.
            if (this.status === 'pending') {
                this.poll();
                this.timer = setInterval(this.poll, 5000);
            }
        },
        beforeDestroy() {
            if (this.timer) clearInterval(this.timer);
        },
        methods: {
            async poll() {
                try {
                    var gw = window.$pgGateway;
                    if (!gw || !gw.authStatus) return;
                    var res = await gw.authStatus();
                    if (!res) return;
                    if (res.status === 'approved') {
                        // 승인됨 — 재발급 토큰이 오면 교체하고 새로고침으로 깨끗이 재진입.
                        if (res.access_token) window.localStorage.setItem('accessToken', res.access_token);
                        if (res.role) window.localStorage.setItem('authorized', res.role);
                        window.localStorage.setItem('approvalStatus', 'approved');
                        if (this.timer) clearInterval(this.timer);
                        this.$emit('approved');
                        window.location.reload();
                    } else if (res.status === 'rejected') {
                        window.localStorage.setItem('approvalStatus', 'rejected');
                        if (this.timer) clearInterval(this.timer);
                        this.$emit('rejected');
                    }
                } catch (e) {
                    // 네트워크 일시 오류는 무시하고 다음 주기에 재시도.
                    console.warn('[approval] status poll failed:', e && e.message);
                }
            },
            logout() {
                ['accessToken', 'gitToken', 'gitAccessToken', 'email', 'name', 'userName',
                 'uid', 'picture', 'providerUid', 'authorized', 'approvalStatus', 'author'].forEach(function (k) {
                    window.localStorage.removeItem(k);
                });
                window.sessionStorage.removeItem('swpAutoInitTried');
                window.location.href = window.location.origin;
            },
        },
    };
</script>
