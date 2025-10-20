import { runCommandRegistry } from "../runs/runCommand"
import { runGeneratorCommandRegistry } from "../runs/generator/runGenerator"
import { runUtilCommandRegistry } from "../runs/util/runUtil"

import { testCommandRegistry } from "../tests/testCommand"
import { testGeneratorCommandRegistry } from "../tests/generator/testGenerator"
import { testUtilCommandRegistry } from "../tests/util/testUtil"

import { getCommandRegistry } from "../gets/getCommand"

import { utilCommandRegistry } from "../utils/utilCommand"

const commandRegistry = {
    run: {
        run: runCommandRegistry,
        runGenerator: runGeneratorCommandRegistry,
        runUtil: runUtilCommandRegistry
    },
    test: {
        test: testCommandRegistry,
        testGenerator: testGeneratorCommandRegistry,
        testUtil: testUtilCommandRegistry
    },
    get: {
        get: getCommandRegistry,
    },
    util: {
        util: utilCommandRegistry
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