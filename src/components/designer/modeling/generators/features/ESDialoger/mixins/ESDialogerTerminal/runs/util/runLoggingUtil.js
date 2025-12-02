const { LoggingUtil } = require("../../../../../../utils")

export default async function runLoggingUtil(commandArgs, client) {
    const loggingUtil = LoggingUtil.makeFromNamespace('ESDialogerTerminal')
    loggingUtil.debug('debug 레벨 로그', {a: 1, b: 2, c: 3})
    loggingUtil.info('info 레벨 로그', {a: 1, b: 2, c: 3})
    loggingUtil.warning('warning 레벨 로그', {a: 1, b: 2, c: 3})
    loggingUtil.error('error 레벨 로그', {a: 1, b: 2, c: 3})
}