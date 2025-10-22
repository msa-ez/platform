import { runCommandRegistry } from "../runs/runCommand"

import { testCommandRegistry } from "../tests/testCommand"

import { getCommandRegistry } from "../gets/getCommand"

import { setCommandRegistry } from "../sets/setCommand"

import { utilCommandRegistry } from "../utils/utilCommand"

import { checkCommandRegistry } from "../checks/checkCommand"

const commandRegistry = {
    run: {
        run: runCommandRegistry
    },
    test: {
        test: testCommandRegistry
    },
    get: {
        get: getCommandRegistry,
    },
    set: {
        set: setCommandRegistry,
    },
    util: {
        util: utilCommandRegistry
    },
    check: {
        check: checkCommandRegistry
    }
}

export const helpCommand = async function (commandName, commandArgs, client) {
    const searchCommandType = commandName
    const searchCommandTitle = commandArgs[0]
    const helpStrings = makeHelpStrings(searchCommandType, searchCommandTitle, commandRegistry)
    console.log(helpStrings.join("\n"))
}

function makeHelpStrings(searchCommandType, searchCommandTitle, commandRegistry) {
    let helpStrings = []

    if(searchCommandType === "help") {
        helpStrings.push("# Help Commands")
        helpStrings.push("## help: 모든 콘솔 명령어 목록 출력")
        helpStrings.push("## help all: 모든 콘솔 명령어 목록 출력")
        helpStrings.push("## help <commandType>: 특정 타입의 콘솔 명령어 목록 출력")
        helpStrings.push("## help <commandType> <commandTitle>: 특정 타입에 속한 특정 명령어 집합 상세 정보 출력")
        return helpStrings
    }

    if(searchCommandType === "all" || !searchCommandType) {
        helpStrings.push("# All Commands")
        for(const commandType in commandRegistry) {
            helpStrings.push(`## ${commandType}`)
            for(const commandTitle in commandRegistry[commandType]) {
                helpStrings.push(getCommandRegistryString(commandTitle, commandRegistry[commandType][commandTitle]))
                helpStrings.push("")
            }
            helpStrings.push("")
        }
        return helpStrings
    }

    if(searchCommandType && searchCommandTitle) {
        if(commandRegistry[searchCommandType][searchCommandTitle]) {
            helpStrings.push(getCommandRegistryString(searchCommandTitle, commandRegistry[searchCommandType][searchCommandTitle]))
        }
        else {
            helpStrings.push(`유효하지 않은 콘솔 명령어입니다. ${searchCommandType} ${searchCommandTitle}`)
        }
        return helpStrings
    }

    if(searchCommandType && !searchCommandTitle) {
        if(commandRegistry[searchCommandType]) {
            helpStrings.push(`## ${searchCommandType}`)
            for(const commandTitle in commandRegistry[searchCommandType]) {
                helpStrings.push(getCommandRegistryString(commandTitle, commandRegistry[searchCommandType][commandTitle]))
                helpStrings.push("")
            }
        }
        else {
            helpStrings.push(`유효하지 않은 콘솔 명령어입니다. ${searchCommandType}`)
        }
        return helpStrings
    }

    helpStrings.push(`유효하지 않은 콘솔 명령어입니다. ${searchCommandType} ${searchCommandTitle}`)
    return helpStrings
}

function getCommandRegistryString(title, commandRegistry) {
    let helpStrings = []
    
    helpStrings.push(`### ${title}`)
    for(const command of Object.values(commandRegistry)) {
        helpStrings.push(`   - ${command.usage}: ${command.description}`)
    }

    return helpStrings.join("\n")
}