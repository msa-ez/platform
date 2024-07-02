/**
 * 역할:
 * - JSON 데이터를 서버에 POST 요청으로 전송합니다.
 * - 서버로부터 스트림 형태로 응답을 받아, 데이터 청크를 읽고 이벤트를 발생시킵니다.
 * 
 * 매개변수:
 * - data: JSON 형태로 변환될 데이터 객체입니다.
 * 
 * 반환값:
 * - 없음 (하지만, 스트림 처리 중 에러가 발생하면 에러 메시지를 반환할 수 있습니다.)
 * 
 * 로직 원리:
 * 1. fetch API를 사용하여 서버에 JSON 데이터를 POST 요청합니다.
 * 2. 응답을 스트림으로 받아 getReader()로 스트림 리더를 생성합니다.
 * 3. while 루프를 사용하여 스트림의 끝에 도달할 때까지 데이터 청크를 계속 읽습니다.
 * 4. 각 데이터 청크를 TextDecoder로 디코딩하고, 'data' 이벤트를 발생시켜 이를 애플리케이션의 다른 부분에서 사용할 수 있도록 합니다.
 * 5. 스트림의 끝에 도달하면 루프를 종료합니다.
 * 6. 에러가 발생하면 'error' 이벤트를 발생시키고 에러 메시지를 반환합니다.
 */

import EventEmitter from 'events';
const streamEmitter = new EventEmitter();

export default {
  async uploadNodeInfo(nodeInfo) {
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch('http://localhost:5502/convertJava/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(nodeInfo)
      });
      /* eslint-disable no-constant-condition */
      if (response.body) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decodedValue = new TextDecoder().decode(value);
          streamEmitter.emit('send-stream-data', decodedValue);
        }
      }
      /* eslint-disable no-constant-condition */
    } catch (error) {
      console.error('Cyper upload failed:', error.response.data);
      streamEmitter.emit('error', error.message);
      return { error: 'Cyper upload failed. Please try again.' };
    }
  },
  streamEmitter,
};
