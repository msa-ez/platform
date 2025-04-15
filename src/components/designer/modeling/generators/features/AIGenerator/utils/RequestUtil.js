class RequestUtil {

  /**
   * @description 이 함수는 지정된 URL로 POST 요청을 보내기 위한 목적으로 사용됩니다.
   *              전달받은 데이터와 헤더 정보를 함께 전송하며, 비동기 요청의 진행 상황, 완료 이벤트, 에러 발생 시
   *              지정한 콜백 함수를 호출할 수 있습니다.
   * 
   * @example 기본 POST 요청 예시
   * // 간단한 데이터 전송 예시 - JSON 형식 데이터 전송
   * RequestUtil.sendPostRequest(
   *   'https://example.com/api',
   *   JSON.stringify({ key: 'value' }),
   *   { 'Content-Type': 'application/json' }
   * );
   * // 주의: 응답 상태와 네트워크 연결 상황을 반드시 확인하여 에러 처리를 해야 합니다.
   * 
   * @example 이벤트 핸들러를 활용한 POST 요청 예시
   * // 요청의 진행상황, 완료, 에러 이벤트를 처리할 때 사용
   * RequestUtil.sendPostRequest(
   *   'https://example.com/api',
   *   JSON.stringify({ user: 'test' }),
   *   { 'Content-Type': 'application/json' },
   *   (event) => { console.log('응답 내용:', event.currentTarget.responseText); },
   *   (event) => { console.log('요청 완료:', event); },
   *   (error) => { console.error('요청 에러 발생:', error); }
   * );
   * // 주의: 이벤트 핸들러 내부에서 예외 처리와 적절한 리소스 정리를 고려해야 합니다.
   * 
   * @note
   * - 데이터: data 파라미터는 전송할 데이터로, 문자열이나 FormData 객체 등 적절한 형식으로 전달되어야 합니다.
   * - 헤더: headers 객체를 통해 각종 인증 정보 또는 컨텐츠 타입 등을 설정할 수 있으므로, 올바른 헤더 값을 전달해야 합니다.
   * - 이벤트 핸들러: onProgress, onLoadEnd, onError와 같은 콜백 함수들이 올바르게 정의되지 않으면
   *   의도치 않은 동작이나 에러 핸들링 실패가 발생할 수 있습니다.
   */
  static sendPostRequest(url, data, headers = {}, onProgress, onLoadEnd, onError, resolve, reject, signal) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    Object.keys(headers).forEach(header => {
      xhr.setRequestHeader(header, headers[header]);
    });

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
      });
    }

    if (onProgress) xhr.onprogress = (event) => onProgress(event, resolve, reject);
    if (onLoadEnd) xhr.onloadend = (event) => onLoadEnd(event, resolve, reject);
    if (onError) xhr.onerror = (event) => onError(event, resolve, reject);

    xhr.send(data);
    return xhr;
  }

}
  
module.exports = RequestUtil;