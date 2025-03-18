class VendorConnectTestUtil {
    static async testVendorConnect(vendor, params) {
        const vendorTests = {
            "openai": async () => {
                try {
                    const response = await fetch("https://api.openai.com/v1/models", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + params["api_key_openai"]
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            },

            "anthropic": async () => {
                try {
                    const response = await fetch("http://localhost:4000/proxy/request", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "param-url": "https://api.anthropic.com/v1/models",
                            "param-is-use-agent": "true",
                            "param-method": "GET",
                            "param-headers": JSON.stringify({
                                "content-type": "application/json",
                                "anthropic-version": "2023-06-01",
                                "x-api-key": params["api_key_anthropic"],
                                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            })
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            },

            "google": async () => {
                try {
                    const response = await fetch("http://localhost:4000/proxy/request", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "param-url": `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${params["api_key_google"]}`,
                            "param-is-use-agent": "true",
                            "param-method": "GET",
                            "param-headers": JSON.stringify({
                                "content-type": "application/json",
                                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            })
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            },
            
            "ollama": async () => {
                try {
                    const response = await fetch("http://localhost:4000/proxy/request", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "param-url": `${params["ollamaUrl"]}/api/tags`,
                            "param-is-use-agent": "false",
                            "param-method": "GET"
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            },

            "runpod": async () => {
                try {
                    const response = await fetch("http://localhost:4000/proxy/request", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "param-url": `${params["runpodUrl"]}/v1/models`,
                            "param-is-use-agent": "true",
                            "param-method": "GET",
                            "param-headers": JSON.stringify({
                                "content-type": "application/json",
                                "authorization": "Bearer " + params["api_key_runpod"],
                                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                            })
                        }
                    });
                    return response.ok;
                } catch (error) {
                    return false;
                }
            }
        }

        if(!vendorTests[vendor]) {
            throw new Error(`Unsupported vendor: ${vendor}`);
        }

        const isPassed = await vendorTests[vendor]();
        return isPassed;
    }
}

module.exports = VendorConnectTestUtil