const { promptWithThink, reponseTexts, errorResponseTexts } = require("./mocks")
const TextParseHelper = require("./TextParseHelper")

class TextParseHelperTest {
    static test() {
        for (let cutLength = 0; cutLength <= promptWithThink.length; cutLength++) {
            const sendPrompt = promptWithThink.substring(0, cutLength);
            console.log("### sendPrompt: ", sendPrompt);
            console.log(TextParseHelper.parseFrontTagContents(sendPrompt, "think"));
        }

        console.log("### OpenAI Response ###");
        console.log(
            TextParseHelper.parseResponseText(reponseTexts.openai, {
                splitFunction: (text) => text.replace("data: [DONE]", "")
                    .trim()
                    .split("data: ")
                    .filter(Boolean),

                extractFunction: (parsed) => {
                    if(parsed.choices && parsed.choices[0]){
                        return {
                            content: parsed.choices[0].delta.content || "",
                            id: parsed.id,
                            finish_reason: parsed.choices[0].finish_reason === 'length' ? 'length' : null,
                            error: parsed.error || null
                        }
                    }
                    return { content: "", id: parsed.id, finish_reason: null, error: parsed.error || null }
                }
            })
        )

        console.log("### Ollama Response ###");
        console.log(
            TextParseHelper.parseResponseText(reponseTexts.ollama, {
                splitFunction: (text) => text
                    .split("\n")
                    .filter(line => line.trim() !== ""),

                extractFunction: (parsed) => {
                    return {
                        content: parsed.message && parsed.message.content ? parsed.message.content : "",
                        id: "Ollama",
                        finish_reason: null,
                        error: parsed.error || null
                    }
                }
            })
        )

        console.log("### Anthropic Response ###");
        console.log(
            TextParseHelper.parseResponseText(reponseTexts.anthropic, {
                splitFunction: (text) => {
                    return text.trim()
                        .split(/\n\n+/)
                        .map((block) => {
                                const lines = block.split("\n");
                                for(const line of lines){
                                    if (line.startsWith("data:"))
                                        return line.replace("data:", "").trim()
                                }
                                return null
                            }
                        ).filter(Boolean)
                },

                extractFunction: (parsedEvents) => {
                    if(parsedEvents.type !== "content_block_delta") return {}

                    return {
                        content: (parsedEvents.delta && 
                                  parsedEvents.delta.type === "text_delta" && 
                                  parsedEvents.delta.text) ? parsedEvents.delta.text : "",
                        id: "Anthropic",
                        finish_reason: parsedEvents.delta && parsedEvents.delta.stop_reason ? parsedEvents.delta.stop_reason : null,
                        error: parsedEvents.error || null
                    }
                }
            })
        );
    }

    static testError() {
        // 이 에러는 o3-mini에서 주로 일어나며, 끝 부분에 "\n"이나 공백이 끝없이 반복됨
        console.log("### OpenAI O3 Overflow error test ###");
        const resultText = TextParseHelper.parseResponseText(errorResponseTexts["o3-overflow"], {
            splitFunction: (text) => text.replace("data: [DONE]", "")
                .trim()
                .split("data: ")
                .filter(Boolean),

            extractFunction: (parsed) => {
                if(parsed.choices && parsed.choices[0]){
                    return {
                        content: parsed.choices[0].delta.content || "",
                        id: parsed.id,
                        finish_reason: parsed.choices[0].finish_reason === 'length' ? 'length' : null,
                        error: parsed.error || null
                    }
                }
                return { content: "", id: parsed.id, finish_reason: null, error: parsed.error || null }
            }
        })

        console.log(resultText)
        console.log(resultText.joinedText)
        console.log(resultText.joinedText.length)
    }
}

module.exports = TextParseHelperTest