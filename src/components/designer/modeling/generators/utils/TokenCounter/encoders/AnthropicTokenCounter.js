const { TokenUtil } = require("../../../features/AIGenerator");

class AnthropicTokenCounter {
    static async getTokenCount(text, model) {
        const apiKey = await TokenUtil.getToken("anthropic")
        if(!apiKey)
            throw new Error("[!] Anthropic API key is not set.");

        const response = await fetch("http://localhost:4000/proxy/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "param-url": "https://api.anthropic.com/v1/messages/count_tokens",
                "param-is-use-agent": "true",
                "param-method": "POST",
                "param-headers": JSON.stringify({
                    "content-type": "application/json",
                    "anthropic-version": "2023-06-01",
                    "x-api-key": apiKey,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
            },
            body: JSON.stringify({
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            })
        });
        if(!response.ok)
            throw new Error("[!] Error occurred while counting tokens.", response);

        const data = await response.json();
        return data.input_tokens;
    }
}

module.exports = AnthropicTokenCounter;