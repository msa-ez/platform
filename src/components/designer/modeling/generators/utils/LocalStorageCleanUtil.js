class LocalStorageCleanUtil {
    /**
     * 불필요한 이미지 데이터를 제거해서 로컬 스토리지의 QuotaExceededError 에러를 방지함
     */
    static clean() {
        const keys = Object.keys(localStorage);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if(key.includes('image_')) {
                localStorage.removeItem(key);
            }
        }
    }
}

module.exports = LocalStorageCleanUtil;