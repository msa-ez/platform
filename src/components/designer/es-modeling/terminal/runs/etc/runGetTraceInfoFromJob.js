import { EsValueLangGraphStudioProxy } from "../../../../modeling/generators/proxies"
import { LoggingUtil } from "../../../../modeling/generators/utils"

export default async function runGetTraceInfoFromJob(commandArgs, client) {
    const logger = LoggingUtil.makeFromNamespace("runGetTraceInfoFromJob")
    const jobId = commandArgs[0]
    if(!jobId) {
        alert("Job ID를 입력하세요")
        return false
    }

    const traceInfo = await EsValueLangGraphStudioProxy.getTraceInfoFromJob(jobId)
    logger.debug("Trace Info: ", traceInfo)
}

