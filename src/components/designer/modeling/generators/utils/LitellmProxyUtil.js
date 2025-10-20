const StorageBase = require('../../../../../components/CommonStorageBase.vue').default;

let cachedGatewayIP = null;
class LitellmProxyUtil {
    static async getChatCompletionsURL() {
        const gatewayURL = await LitellmProxyUtil.getGatewayURL();
        return `${gatewayURL}/v1/chat/completions`;
    }

    static async getGatewayURL() {
        const gatewayIP = await LitellmProxyUtil.getGatewayIP();
        return `https://${gatewayIP}`;
    }

    static async getGatewayIP() {
        if(cachedGatewayIP) return cachedGatewayIP;

        const configPath = 'db://configs/litellm_gateway_address'
        const storage = new Vue(StorageBase);
        cachedGatewayIP = await storage.getString(configPath);
        return cachedGatewayIP;
    }
}

module.exports = LitellmProxyUtil;