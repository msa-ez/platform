<template>
    <!-- 관리자 화면. isAdmin 유저만 접근.
         · 승인 대기: 신규 가입자 승인/거절
         · 전체 사용자: 목록 조회 + 활성화(approved)/비활성화(rejected) 토글 -->
    <v-dialog :value="value" @input="$emit('input', $event)" max-width="760" scrollable>
        <v-card>
            <v-card-title>
                사용자 관리
                <v-spacer></v-spacer>
                <v-btn icon :loading="loading" @click="reload"><v-icon>mdi-refresh</v-icon></v-btn>
                <v-btn icon @click="$emit('input', false)"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>

            <v-tabs v-model="tab" grow>
                <v-tab>승인 대기 <v-chip x-small class="ml-2" v-if="pending.length">{{ pending.length }}</v-chip></v-tab>
                <v-tab>전체 사용자 <v-chip x-small class="ml-2" v-if="users.length">{{ users.length }}</v-chip></v-tab>
            </v-tabs>

            <v-card-text style="height:440px;">
                <v-tabs-items v-model="tab">
                    <!-- 승인 대기 -->
                    <v-tab-item>
                        <div v-if="!pending.length" class="empty">승인 대기 중인 사용자가 없습니다.</div>
                        <v-list v-else two-line>
                            <v-list-item v-for="u in pending" :key="u.uid">
                                <v-list-item-content>
                                    <v-list-item-title>{{ nameOf(u) }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ u.email }}<span v-if="u.department"> · {{ u.department }}</span></v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action class="row-actions">
                                    <v-btn small color="primary" :loading="busy===u.uid" @click="approve(u)">승인</v-btn>
                                    <v-btn small text color="red" :disabled="busy===u.uid" @click="reject(u)">거절</v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-tab-item>

                    <!-- 전체 사용자 -->
                    <v-tab-item>
                        <div v-if="!users.length" class="empty">사용자가 없습니다.</div>
                        <v-list v-else two-line>
                            <v-list-item v-for="u in users" :key="u.uid">
                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ nameOf(u) }}
                                        <v-chip x-small class="ml-2" :color="statusColor(u)" dark>{{ statusLabel(u) }}</v-chip>
                                        <v-chip x-small class="ml-1" v-if="u.authorized === 'admin'" color="indigo" dark>admin</v-chip>
                                    </v-list-item-title>
                                    <v-list-item-subtitle>{{ u.email }}<span v-if="u.department"> · {{ u.department }}</span></v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action class="row-actions">
                                    <!-- 본인/관리자 계정은 잠금 방지를 위해 비활성화 불가 -->
                                    <span v-if="isProtected(u)" class="locked">{{ u.uid === myUid ? '본인' : '관리자' }}</span>
                                    <template v-else>
                                        <v-btn v-if="u.status === 'pending'" small color="primary" :loading="busy===u.uid" @click="approve(u)">승인</v-btn>
                                        <v-btn v-else-if="u.status === 'rejected'" small color="primary" :loading="busy===u.uid" @click="approve(u)">활성화</v-btn>
                                        <v-btn v-else small text color="red" :loading="busy===u.uid" @click="reject(u)">비활성화</v-btn>
                                    </template>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-tab-item>
                </v-tabs-items>
                <div v-if="error" class="err">{{ error }}</div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: 'approval-admin',
        props: {
            value: { type: Boolean, default: false },
        },
        data() {
            return { tab: 0, users: [], loading: false, busy: null, error: '' };
        },
        computed: {
            myUid() { return window.localStorage.getItem('uid'); },
            pending() { return this.users.filter(function (u) { return u.status === 'pending'; }); },
        },
        watch: {
            value(v) { if (v) this.reload(); },
        },
        methods: {
            gw() { return window.$pgGateway; },
            nameOf(u) { return u.displayName || u.username || u.email; },
            // 본인 또는 ADMIN_EMAILS 관리자 계정은 비활성화 불가(서버에서도 동일하게 차단).
            isProtected(u) { return u.uid === this.myUid || u.authorized === 'admin'; },
            statusLabel(u) {
                return u.status === 'approved' ? '활성' : (u.status === 'pending' ? '대기' : '비활성');
            },
            statusColor(u) {
                return u.status === 'approved' ? 'green' : (u.status === 'pending' ? 'orange' : 'red');
            },
            async reload() {
                this.error = '';
                this.loading = true;
                try {
                    this.users = await this.gw().adminUsers();
                } catch (e) {
                    this.error = '목록을 불러오지 못했습니다. 관리자 권한을 확인해주세요.';
                } finally {
                    this.loading = false;
                }
            },
            async approve(u) {
                this.busy = u.uid; this.error = '';
                try { await this.gw().adminApprove(u.uid); await this.reload(); }
                catch (e) { this.error = '활성화(승인) 처리에 실패했습니다.'; }
                finally { this.busy = null; }
            },
            async reject(u) {
                this.busy = u.uid; this.error = '';
                try { await this.gw().adminReject(u.uid); await this.reload(); }
                catch (e) { this.error = '비활성화(거절) 처리에 실패했습니다.'; }
                finally { this.busy = null; }
            },
        },
    };
</script>

<style scoped>
    .empty { text-align:center; color:#9E9E9E; padding:48px 0; font-size:14px; }
    .err { color:#E53935; font-size:13px; margin-top:8px; text-align:center; }
    .locked { font-size:12px; color:#9E9E9E; }
    .row-actions { flex-direction:row; align-items:center; }
    .row-actions .v-btn { margin-left:6px; }
</style>
