<template>
    <!-- 관리자(가입 승인) 화면. isAdmin 유저만 접근. 대기/거절 유저를 승인·거절한다. -->
    <v-dialog :value="value" @input="$emit('input', $event)" max-width="720" scrollable>
        <v-card>
            <v-card-title>
                가입 승인 관리
                <v-spacer></v-spacer>
                <v-btn icon :loading="loading" @click="reload"><v-icon>mdi-refresh</v-icon></v-btn>
                <v-btn icon @click="$emit('input', false)"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>

            <v-tabs v-model="tab" grow>
                <v-tab>승인 대기 <v-chip x-small class="ml-2" v-if="pending.length">{{ pending.length }}</v-chip></v-tab>
                <v-tab>거절/차단 <v-chip x-small class="ml-2" v-if="rejected.length">{{ rejected.length }}</v-chip></v-tab>
            </v-tabs>

            <v-card-text style="height:420px;">
                <v-tabs-items v-model="tab">
                    <!-- 승인 대기 -->
                    <v-tab-item>
                        <div v-if="!pending.length" class="empty">승인 대기 중인 사용자가 없습니다.</div>
                        <v-list v-else two-line>
                            <v-list-item v-for="u in pending" :key="u.uid">
                                <v-list-item-content>
                                    <v-list-item-title>{{ u.displayName || u.username || u.email }}</v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ u.email }}<span v-if="u.department"> · {{ u.department }}</span>
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action class="row-actions">
                                    <v-btn small color="primary" :loading="busy===u.uid" @click="approve(u)">승인</v-btn>
                                    <v-btn small text color="red" :disabled="busy===u.uid" @click="reject(u)">거절</v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-tab-item>

                    <!-- 거절/차단 -->
                    <v-tab-item>
                        <div v-if="!rejected.length" class="empty">거절/차단된 사용자가 없습니다.</div>
                        <v-list v-else two-line>
                            <v-list-item v-for="u in rejected" :key="u.uid">
                                <v-list-item-content>
                                    <v-list-item-title>{{ u.displayName || u.username || u.email }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ u.email }}<span v-if="u.department"> · {{ u.department }}</span></v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn small text color="primary" :loading="busy===u.uid" @click="approve(u)">승인으로 전환</v-btn>
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
            return { tab: 0, pending: [], rejected: [], loading: false, busy: null, error: '' };
        },
        watch: {
            value(v) { if (v) this.reload(); },
        },
        methods: {
            gw() { return window.$pgGateway; },
            async reload() {
                this.error = '';
                this.loading = true;
                try {
                    var gw = this.gw();
                    this.pending = await gw.adminPending();
                    // 거절 목록은 /admin/:db/users?status=rejected 로 조회.
                    var rej = await fetch(`${gw.baseUrl}/admin/${gw.dbName}/users?status=rejected`, { headers: gw._headers() });
                    this.rejected = rej.ok ? ((await rej.json()).users || []) : [];
                } catch (e) {
                    this.error = '목록을 불러오지 못했습니다. 관리자 권한을 확인해주세요.';
                } finally {
                    this.loading = false;
                }
            },
            async approve(u) {
                this.busy = u.uid; this.error = '';
                try { await this.gw().adminApprove(u.uid); await this.reload(); }
                catch (e) { this.error = '승인 처리에 실패했습니다.'; }
                finally { this.busy = null; }
            },
            async reject(u) {
                this.busy = u.uid; this.error = '';
                try { await this.gw().adminReject(u.uid); await this.reload(); }
                catch (e) { this.error = '거절 처리에 실패했습니다.'; }
                finally { this.busy = null; }
            },
        },
    };
</script>

<style scoped>
    .empty { text-align:center; color:#9E9E9E; padding:48px 0; font-size:14px; }
    .err { color:#E53935; font-size:13px; margin-top:8px; text-align:center; }
    .row-actions { flex-direction:row; align-items:center; }
    .row-actions .v-btn { margin-left:6px; }
</style>
