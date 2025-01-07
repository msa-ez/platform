const { TokenCounter } = require("..");
const { sentences, sentence, longText } = require("./mocks");

class TokenCounterTest {
    static test() {
        console.log("=== TokenCounter 테스트 시작 ===\n");


        // 1. getTokenCount 테스트
        console.log("1. getTokenCount 테스트");
        sentences.forEach((text, index) => {
            console.log(`텍스트 ${index + 1} 토큰 수:`, TokenCounter.getTokenCount(text, "gpt-4o"));
            console.log(`테스트 텍스트: ${text}\n`);
        });


        // 2. getTotalTokenCount 테스트
        console.log("2. getTotalTokenCount 테스트");
        const totalTokens = TokenCounter.getTotalTokenCount(sentences, "gpt-4o");
        console.log(`전체 텍스트의 총 토큰 수: ${totalTokens}\n`);


        // 3. isWithinTokenLimit 테스트
        console.log("3. isWithinTokenLimit 테스트");
        const tokenLimit = 10;
        sentences.forEach((text, index) => {
            console.log(`텍스트 ${index + 1}이 ${tokenLimit} 토큰 제한 내 여부:`,
                TokenCounter.isWithinTokenLimit(text, "gpt-4o", tokenLimit));
        });
        console.log();


        // 4. splitByTokenLimit 테스트
        console.log("4. splitByTokenLimit 테스트");
        console.log("4.1 기본 분할 테스트 (overlap 없음)");
        const chunks = TokenCounter.splitByTokenLimit(longText, "gpt-4o", 10);
        chunks.forEach((chunk, index) => {
            console.log(`청크 ${index + 1}:`, chunk);
        });

        console.log("\n4.2 overlap 적용 테스트");
        const chunksWithOverlap = TokenCounter.splitByTokenLimit(longText, "gpt-4o", 10, 3);
        chunksWithOverlap.forEach((chunk, index) => {
            console.log(`청크 ${index + 1}:`, chunk);
        });

        try {
            console.log("\n4.3 잘못된 overlap 테스트");
            TokenCounter.splitByTokenLimit(longText, "gpt-4o", 10, 10);
        } catch (error) {
            console.log("예상된 에러 발생:", error.message);
        }
        console.log();


        // 5. truncateToTokenLimit 테스트
        console.log("5. truncateToTokenLimit 테스트");
        
        console.log("5.1 기본 truncate 테스트");
        const truncated = TokenCounter.truncateToTokenLimit(longText, "gpt-4o", 15);
        console.log("15 토큰으로 제한된 텍스트:", truncated);
        
        console.log("\n5.2 옵션 조합 테스트");
        const optionsCombinations = [
            { addEllipsis: false, preserveSentences: false, debug: true },
            { addEllipsis: true, preserveSentences: false, debug: true },
            { addEllipsis: false, preserveSentences: true, debug: true },
            { addEllipsis: true, preserveSentences: true, debug: true }
        ];

        optionsCombinations.forEach((options, index) => {
            console.log(`\n옵션 조합 ${index + 1}:`, options);
            const result = TokenCounter.truncateToTokenLimit(
                sentence, "gpt-4o", 15, options
            );
            console.log("결과:", result);
        });

        try {
            console.log("\n5.3 유효성 검사 테스트");
            TokenCounter.truncateToTokenLimit("", "gpt-4o", 15);
        } catch (error) {
            console.log("빈 문자열 에러:", error.message);
        }

        try {
            TokenCounter.truncateToTokenLimit(sentence, "gpt-4o", 0);
        } catch (error) {
            console.log("잘못된 maxTokens 에러:", error.message);
        }

        console.log("\n=== TokenCounter 테스트 완료 ===");
    }
}

module.exports = TokenCounterTest;