/**
 * 역할:
 * - FormData 객체를 생성하고, 파일을 'file' 키에 추가하여 서버에 업로드합니다.
 * - 서버로부터의 응답 데이터를 반환합니다.
 *
 * 매개변수:
 * - file: 업로드할 파일 객체입니다.
 *
 * 반환값:
 * - 성공 시: 서버로부터의 응답 데이터를 반환합니다.
 * - 실패 시: 에러 메시지를 포함한 객체를 반환합니다.
 *
 * 로직 원리:
 * 1. FormData 객체를 생성합니다.
 * 2. FormData 객체에 'file' 키로 파일 객체를 추가합니다.
 * 3. axios를 사용하여 FormData를 포함한 POST 요청을 서버에 보냅니다.
 * 4. 요청이 성공하면 응답 데이터를 반환합니다.
 * 5. 요청이 실패하면 에러를 캐치하고, 적절한 에러 메시지를 반환합니다.
 */

import axios from 'axios';

export default {
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:5500/uploadFile/', formData);
      console.log("Upload Success", response.data);                    
      return response.data;
    } catch (error) {
      console.error('File upload failed:', error.response.data);
      throw new Error('File upload failed. Please try again.');
    }
  },
};
