const { TokenUtil } = require("../../../features/AIGenerator");

class GoogleTokenCounter {
    static async getTokenCount(text, model) {
        const apiKey = await TokenUtil.getToken("google")
        if(!apiKey)
            throw new Error("[!] Google API key is not set.");

        const response = await fetch("http://localhost:4000/proxy/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "param-url": `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`,
                "param-is-use-agent": "true",
                "param-method": "POST",
                "param-headers": JSON.stringify({
                    "content-type": "application/json",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                })
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{
                        "text": text
                    }]
                }]
            })
        });
        if(!response.ok)
            throw new Error("[!] Error occurred while counting tokens.", response);

        const data = await response.json();
        return data.totalTokens;
    }
}

module.exports = GoogleTokenCounter;