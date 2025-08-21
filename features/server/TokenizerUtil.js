const fs = require('fs');
const path = require('path');

class TokenizerUtil {
    static async countTokens(text, model, isUseOfflineTokenizer = false) {
        try {

            const { AutoTokenizer } = await import('@huggingface/transformers');

            if (isUseOfflineTokenizer) {
                const tokenizerPath = path.join(process.cwd(), 'downloads', 'tokenizers', model);
                
                if (!fs.existsSync(tokenizerPath)) {
                    return { 
                        error: `오프라인 토크나이저를 찾을 수 없습니다: ${tokenizerPath}. 먼저 '--download-tokenizer ${model}' 옵션으로 다운로드하세요.` 
                    };
                }
                
                console.log(`오프라인 토크나이저 사용 중: ${tokenizerPath}`);
                let tokenizer = await AutoTokenizer.from_pretrained(tokenizerPath, { local_files_only: true });
                let out = await tokenizer.encode(text);
                return { tokenCount: out.length };
            }

            let tokenizer = await AutoTokenizer.from_pretrained(model);
            let out = await tokenizer.encode(text);
            return { tokenCount: out.length };

        } catch (error) {
            console.error(`Error on counting tokens: ${error.message}`);
            return { error: error.message };
        }
    }
}

module.exports = TokenizerUtil;