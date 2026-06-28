// Firebase 식 push-ID 생성기.
// 20자, 앞 8자가 시간(밀리초)을 인코딩 → 시간순 = 사전식 정렬 가능.
// 협업 편집 큐(definition_queue.seq_key)가 `key > lastKey` 비교에 의존하므로
// 정렬 가능성이 필수다 (DB-migration-plan.md §2.6 / §4.2).
const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

let lastPushTime = 0;
let lastRandChars = [];

export function generatePushId(now = Date.now()) {
  const duplicateTime = now === lastPushTime;
  lastPushTime = now;

  const timeStampChars = new Array(8);
  let t = now;
  for (let i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(t % 64);
    t = Math.floor(t / 64);
  }
  let id = timeStampChars.join('');

  if (!duplicateTime) {
    for (let i = 0; i < 12; i++) {
      lastRandChars[i] = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0]/4294967296) * 64);
    }
  } else {
    // 같은 밀리초 → 마지막 난수를 증가시켜 단조 증가 보장
    let i;
    for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
      lastRandChars[i] = 0;
    }
    if (i >= 0) lastRandChars[i]++;
  }
  for (let i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i]);
  }
  return id;
}
