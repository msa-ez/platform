class ConfigUtil {
    /**
     * 애플리케이션 설정을 초기화합니다.
     * 명령행 인수 파싱 및 환경변수 설정을 처리합니다.
     * @returns {Object} 구성 객체
     */
    static initializeConfig() {
      const useOfflineTokenizer = process.argv.includes('--use-offline-tokenizer');
      this._setupEnvironmentVariables();
      
      return {
        tokenizer: {
          useOfflineTokenizer
        },
        server: {
          port: process.env.PORT || 4000
        }
      };
    }
    
    /**
     * 환경변수 설정을 처리합니다.
     */
    static _setupEnvironmentVariables() {
      if(!process.env.HF_TOKEN) {
        console.warn("HF_TOKEN 환경변수가 설정되지 않았습니다. 허깅페이스에서 일부 모델 다운로드시에 권한 문제가 발생할 수 있습니다. 허깅페이스에서 읽기 권한을 가진 토큰을 얻어서 .env 파일에 설정해주세요.");
      }
      else
        process.env.HUGGING_FACE_HUB_TOKEN = process.env.HF_TOKEN;
    }
  }
  
module.exports = ConfigUtil;