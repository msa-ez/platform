const RecursiveRequirementsSummarizer = require("../../../../RecursiveRequirementsSummarizer")
const { recursiveRequirementsSummarizerInputs } = require("./mocks");

class RecursiveRequirementsSummarizerTest {
    static async test() {
        const inputs = structuredClone(recursiveRequirementsSummarizerInputs)

        const generator = new RecursiveRequirementsSummarizer({
            onModelCreated: (model) => {
                console.log("[*] 모델 생성: ", model)
            },
            onGenerationFinished: (model) => {
                console.log("[*] 결과 모델: ", model)
                generator.handleGenerationFinished(model)
            }
        })

        // 청킹 테스트를 위해 작은 크기로 설정
        generator.textChunker.chunkSize = 750
        generator.textChunker.spareSize = 75

        const finalResult = await generator.summarizeRecursively(inputs[0].text)
        console.log("[*] 최종 결과: ", finalResult)
    }

    static async testWithLargeText() {
        const inputs = structuredClone(recursiveRequirementsSummarizerInputs)

        const generator = new RecursiveRequirementsSummarizer({
            onModelCreated: (model) => {
                console.log("[*] 모델 생성: ", model)
            },
            onGenerationFinished: (model) => {
                console.log("[*] 결과 모델: ", model)
                generator.handleGenerationFinished(model)
            }
        })

        // 청킹 테스트를 위해 작은 크기로 설정
        generator.textChunker.chunkSize = 750
        generator.textChunker.spareSize = 75

        const finalResult = await generator.summarizeRecursively(inputs[1].text)
        console.log("[*] 최종 결과: ", finalResult)
    }
}

module.exports = RecursiveRequirementsSummarizerTest;