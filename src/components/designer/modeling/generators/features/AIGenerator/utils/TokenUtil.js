const StorageBase = require('../../../../../../CommonStorageBase.vue').default;

/**
 * @description
 * 토큰 관리를 위한 유틸리티 클래스입니다.
 * 토큰 조회, 저장 및 검증을 담당합니다.
 */
class TokenUtil {
    /**
     * @description 각 vendor마다 유효한 토큰을 localStorage > DB(Firebase) > 사용자 입력 순으로 조회
     * @param {string} vendor - 토큰을 조회할 벤더 이름 (예: "openai")
     * @returns {Promise<string>} 조회된 토큰
     * @throws {Error} 토큰이 입력되지 않았을 경우 에러 발생
     */
    static async getToken(vendor) {
        try {

            let token = localStorage.getItem(`api_key_${vendor}`);
            if(token === "null") {
                token = null;
                localStorage.removeItem(`api_key_${vendor}`);
            }
            if(token) return token;

            const storage = new Vue(StorageBase);
            token = await storage.getString(`db://tokens/${vendor}`);
            if(token) {
                token = atob(token);
                return token;
            }

            const errorMessage = `The API key to be used does not exist. Please register your API key in User Profile > AI Settings.`;
            alert(errorMessage);
            throw new Error(errorMessage);
            
        } catch (error) {
            console.error(`[!] Error getting token`, {vendor, error});
            throw error;
        }
    }
}

module.exports = TokenUtil;