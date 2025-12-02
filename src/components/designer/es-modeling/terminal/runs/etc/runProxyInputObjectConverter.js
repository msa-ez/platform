import { getDelayedMockedDatas } from "../../mocks"
import { ProxyInputObjectConverter } from "../../../../modeling/generators/proxies"
import { LoggingUtil } from "../../../../modeling/generators/utils"

export default async function runProxyInputObjectConverter(commandArgs, client) {
    const logger = LoggingUtil.makeFromNamespace("runProxyInputObjectConverter")
    const funcName = commandArgs[0]
    if(!funcName) {
        alert("함수 이름을 입력하세요")
        return false
    }

    const runFuncs = {
        "toEsProxyInputObject": async (commandArgs, client) => {
            const mockedEsProxyNewJobParams = await getDelayedMockedDatas("esProxyNewJobParamsForRun")
            logger.debug("주입되는 Input Object: ", mockedEsProxyNewJobParams)
            const inputObject = ProxyInputObjectConverter.toEsProxyInputObject(
                mockedEsProxyNewJobParams.selectedDraftOptions,
                mockedEsProxyNewJobParams.userInfo,
                mockedEsProxyNewJobParams.information,
                mockedEsProxyNewJobParams.preferedLanguage
            )
            logger.debug("생성된 Input Object: ", inputObject)
        }
    }
    if(!runFuncs[funcName]) {
        alert("유효하지 않은 함수 이름입니다. " + funcName)
        return false
    }
    await runFuncs[funcName](commandArgs, client)
}

