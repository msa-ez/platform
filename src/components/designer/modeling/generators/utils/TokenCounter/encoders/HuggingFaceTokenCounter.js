class HuggingFaceTokenCounter {
    static async getTokenCount(text, model) {
        const response = await fetch("http://localhost:4000/llm/count-tokens", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": model,
                "text": text
            })
        });
        if(!response.ok || response.error)
            throw new Error("[!] Error occurred while counting tokens.", response);

        const data = await response.json();
        return data.tokenCount;
    }
}

module.exports = HuggingFaceTokenCounter;