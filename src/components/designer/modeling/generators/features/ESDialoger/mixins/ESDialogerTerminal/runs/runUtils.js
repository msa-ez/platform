import { getDelayedMockedDatas }  from "../mocks"

class RunUtils {
    static async initValueWithSelectedScenario(senarioName, client) {
        const senarioMocks = await getDelayedMockedDatas("senarioMocks")

        if(!senarioName) {
            senarioName = Object.keys(senarioMocks)[0]
        }
        if(!senarioMocks[senarioName]) {
            alert("유효하지 않은 시나리오 이름입니다.")
            throw new Error("유효하지 않은 시나리오 이름입니다.")
        }

        const selectedScenario = structuredClone(senarioMocks[senarioName])
        if(!client.value) client.value = {}
        client.value.userStory = selectedScenario.projectInfo.userStory
        client.state = selectedScenario.state
        client.resultDevideBoundedContext = selectedScenario.resultDevideBoundedContext
        client.boundedContextVersion = selectedScenario.boundedContextVersion
        client.frontEndResults = selectedScenario.frontEndResults
        client.pbcResults = selectedScenario.pbcResults
        client.pbcLists = selectedScenario.pbcLists
        RunUtils._initValueToExistingObject(client.projectInfo, selectedScenario.projectInfo)
        client.requirementsValidationResult = selectedScenario.requirementsValidationResult
        client.commandReadModelData = selectedScenario.commandReadModelData
        client.siteMap = selectedScenario.siteMap
        client.selectedAspect = selectedScenario.selectedAspect
        return selectedScenario
    }

    static _initValueToExistingObject(existingObject, newObject) {
        for(const key of Object.keys(newObject)) {
            existingObject[key] = newObject[key]
        }
    }
}

export default RunUtils;