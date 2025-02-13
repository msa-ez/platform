const SanityCheckGenerator = require("./SanityCheckGenerator")

class SanityCheckGeneratorTest {
    static async test() {
        const generator = new SanityCheckGenerator({
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] Sanity Check 결과 : ", returnObj.modelValue.output)
            }
        })

        generator.generate()
    }
}

module.exports = SanityCheckGeneratorTest;