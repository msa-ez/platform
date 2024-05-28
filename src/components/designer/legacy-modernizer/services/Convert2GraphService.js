/**
 * 역할:
 * - 단순 데이터를 서버로 전송합니다.
 * - 서버로부터의 응답 데이터를 반환합니다.
 *
 * 매개변수:
 * - data: 서버로 전송할 데이터 객체입니다.
 *
 * 반환값:
 * - 성공 시: 서버로부터의 응답 데이터를 반환합니다.
 * - 실패 시: 에러 메시지를 포함한 객체를 반환합니다.
 *
 * 로직 원리:
 * 1. axios를 사용하여 POST 요청을 서버에 보냅니다.
 * 2. 요청이 성공하면 응답 데이터를 반환합니다.
 * 3. 요청이 실패하면 에러를 캐치하고, 적절한 에러 메시지를 반환합니다.
 */

import axios from 'axios';

export default {
  async sendData(data) {
    try {
      const response = await axios.post('http://localhost:5502/sendData/', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Data Send Success', response.data);
      return response.data;
    } catch (error) {
      console.error('Data send failed:', error.response ? error.response.data : error.message);
      throw new Error('Data send failed. Please try again.');
    }
  },
};
