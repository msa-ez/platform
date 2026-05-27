// PostgresGatewayClient — msaez-data-gateway 와 통신하는 클라이언트 (v1.0.30).
// AceBase 클라이언트 SDK 를 대체한다. HTTP(Data API) + WebSocket(watch).
//
// 브라우저: window.DB_HOST/DB_PORT/DB_NAME/DB_HTTPS 에서 설정을 읽는다.
// Node(테스트): 생성자에 config 를 직접 전달.
//
// fetch / WebSocket 는 브라우저 전역, Node 18+ 전역 모두 사용 가능.

export class PostgresGatewayClient {
  constructor(config) {
    const cfg = config || {};
    if (cfg.baseUrl) {
      this.baseUrl = cfg.baseUrl;
      this.wsUrl = cfg.wsUrl || cfg.baseUrl.replace(/^http/, 'ws') + '/watch';
    } else {
      const w = (typeof window !== 'undefined') ? window : {};
      const host = w.DB_HOST || 'localhost';
      const port = w.DB_PORT || 5757;
      const https = String(w.DB_HTTPS) === 'true';
      this.baseUrl = `${https ? 'https' : 'http'}://${host}:${port}`;
      this.wsUrl = `${https ? 'wss' : 'ws'}://${host}:${port}/watch`;
    }
    this.dbName = cfg.dbName || (typeof window !== 'undefined' && window.DB_NAME) || 'mydb';
    this._getToken = cfg.getToken || (() => {
      try { return window.localStorage.getItem('accessToken'); } catch (e) { return null; }
    });

    this.subs = new Map();   // subId -> { path, watchType, startAt, callback }
    this._subSeq = 0;
    this.ws = null;
    this.wsReady = false;
    this._wsClosed = false;

    // 쓰기 동시성 제한 — 다량의 쓰기를 한꺼번에 fetch 하면 브라우저가
    // ERR_INSUFFICIENT_RESOURCES 로 죽으므로 동시 in-flight 쓰기를 제한한다.
    // (AceBase 클라이언트 SDK 가 하던 쓰기 큐잉을 대체)
    this._wq = [];
    this._wqActive = 0;
    this._WQ_MAX = 6;

    this._connectWs();
  }

  // ── HTTP (Data API) ──────────────────────────────────────────────
  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = this._getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  }

  _dataUrl(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    return `${this.baseUrl}/data/${this.dbName}/${clean}`;
  }

  // 쓰기 fetch 를 동시성 제한 큐에 통과시켜 브라우저 fetch 폭주를 막는다.
  _throttledWrite(doFetch) {
    return new Promise((resolve, reject) => {
      this._wq.push({ doFetch, resolve, reject });
      this._drainWq();
    });
  }

  _drainWq() {
    while (this._wqActive < this._WQ_MAX && this._wq.length > 0) {
      const job = this._wq.shift();
      this._wqActive++;
      Promise.resolve().then(job.doFetch).then(job.resolve, job.reject)
        .then(() => { this._wqActive--; this._drainWq(); });
    }
  }

  async getData(path) {
    const r = await fetch(this._dataUrl(path), { headers: this._headers() });
    if (!r.ok) throw new Error(`GET ${path} -> HTTP ${r.status}`);
    return (await r.json()).value;
  }

  async listData(path, opts) {
    const url = new URL(this._dataUrl(path));
    if (opts) {
      if (opts.startAt != null) url.searchParams.set('startAt', opts.startAt);
      if (opts.endAt != null) url.searchParams.set('endAt', opts.endAt);
      if (opts.sort) url.searchParams.set('sort', opts.sort);
      if (opts.size != null) url.searchParams.set('size', opts.size);
    }
    const r = await fetch(url, { headers: this._headers() });
    if (!r.ok) throw new Error(`LIST ${path} -> HTTP ${r.status}`);
    return (await r.json()).value;
  }

  async setData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'PUT', headers: this._headers(), body: JSON.stringify(value),
    }));
    return r.ok;
  }

  async updateData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'PATCH', headers: this._headers(), body: JSON.stringify(value),
    }));
    return r.ok;
  }

  async pushData(path, value) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'POST', headers: this._headers(), body: JSON.stringify(value),
    }));
    if (!r.ok) return null;
    return (await r.json()).key;
  }

  async deleteData(path) {
    const r = await this._throttledWrite(() => fetch(this._dataUrl(path), {
      method: 'DELETE', headers: this._headers(),
    }));
    return r.ok;
  }

  // ── 인증 ─────────────────────────────────────────────────────────
  async oauthInitUrl(provider, callbackUrl) {
    const url = `${this.baseUrl}/oauth2/${this.dbName}/init`
      + `?provider=${encodeURIComponent(provider)}`
      + `&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`oauth init -> HTTP ${r.status}`);
    return (await r.json()).redirectUrl;
  }

  async authSignin(token) {
    // _getUserInfo() 가 reactive watcher / 컴포넌트 mount 등 다양한 경로로 자주
    // 호출되는데, 그때마다 매번 새 fetch 를 보내면 ES generator 가 도는 동안
    // 메인 스레드 점유 + connection pool 점유로 화면이 freeze 된다.
    // 같은 토큰에 대해 5분간 응답을 캐시하고, 동시 in-flight 요청은 같은 promise 로 dedup.
    if (this._signinCache && this._signinCache.token === token
        && Date.now() - this._signinCache.at < 5 * 60 * 1000) {
      return this._signinCache.user;
    }
    if (this._signinInflight && this._signinInflight.token === token) {
      return this._signinInflight.promise;
    }
    const promise = (async () => {
      const r = await fetch(`${this.baseUrl}/auth/${this.dbName}/signin`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      });
      if (!r.ok) return null;
      return (await r.json()).user;
    })();
    this._signinInflight = { token, promise };
    try {
      const user = await promise;
      this._signinCache = { token, user, at: Date.now() };
      return user;
    } finally {
      if (this._signinInflight && this._signinInflight.token === token) {
        this._signinInflight = null;
      }
    }
  }

  async authSignup(userInfo) {
    const r = await fetch(`${this.baseUrl}/auth/${this.dbName}/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo),
    });
    if (!r.ok) return null;
    return r.json();
  }

  // ── WebSocket (watch) ────────────────────────────────────────────
  _connectWs() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.wsReady = true;
        // 재연결 시 기존 구독 복구
        for (const [subId, s] of this.subs) this._sendWatch(subId, s);
      };
      this.ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString()); }
        catch (e) { return; }
        const s = this.subs.get(msg.id);
        if (s) {
          try { s.callback(msg); } catch (e) { /* 콜백 오류 격리 */ }
        }
      };
      this.ws.onclose = () => {
        this.wsReady = false;
        if (!this._wsClosed) setTimeout(() => this._connectWs(), 2000);
      };
      this.ws.onerror = () => { try { this.ws.close(); } catch (e) { /* noop */ } };
    } catch (e) {
      if (!this._wsClosed) setTimeout(() => this._connectWs(), 2000);
    }
  }

  _sendWatch(subId, s) {
    if (!this.wsReady) return;
    this.ws.send(JSON.stringify({
      action: 'watch', id: subId, path: s.path,
      watchType: s.watchType, startAt: s.startAt,
    }));
  }

  /** 구독 등록. callback 은 게이트웨이 메시지 {id,watchType,path,key?,value} 를 받는다. */
  subscribe(path, watchType, startAt, callback) {
    const subId = `s${++this._subSeq}`;
    const s = { path, watchType, startAt, callback };
    this.subs.set(subId, s);
    this._sendWatch(subId, s); // 아직 미연결이면 onopen 에서 복구
    return subId;
  }

  unsubscribe(subId) {
    if (!this.subs.has(subId)) return;
    this.subs.delete(subId);
    if (this.wsReady) {
      try { this.ws.send(JSON.stringify({ action: 'unwatch', id: subId })); }
      catch (e) { /* noop */ }
    }
  }

  get connected() {
    return this.wsReady;
  }

  close() {
    this._wsClosed = true;
    try { this.ws.close(); } catch (e) { /* noop */ }
  }
}
