import { getDelayedMockedDatas } from "../../mocks"
import { ProxyInputObjectConverter } from "../../../../modeling/generators/proxies"
import { LoggingUtil } from "../../../../modeling/generators/utils"

export default function testProxyInputObjectConverter(commandArgs, client, runner) {
    runner.describe('ProxyInputObjectConverter', ({ it }) => {
        it('주어진 초안 옵션들을 기반으로 적절한 프록시 Input Object를 생성해야 함', async () => {
            const logger = LoggingUtil.makeFromNamespace("testProxyInputObjectConverter")
            const mockedEsProxyNewJobParams = await getDelayedMockedDatas("esProxyNewJobParamsForTest")
            logger.debug("주입되는 Input Object: ", mockedEsProxyNewJobParams)
            const inputObject = ProxyInputObjectConverter.toEsProxyInputObject(
                mockedEsProxyNewJobParams.selectedDraftOptions,
                mockedEsProxyNewJobParams.userInfo,
                mockedEsProxyNewJobParams.information,
                mockedEsProxyNewJobParams.preferedLanguage
            )
            logger.debug("생성된 Input Object: ", inputObject)

            // 기본 구조 검증
            runner.expect(inputObject).toBeTruthy()
            runner.expect(inputObject.requestType).toBe("fromDraft")
            runner.expect(inputObject.draft).toBeTruthy()
            runner.expect(inputObject.ids).toBeTruthy()
            runner.expect(inputObject.preferedLanguage).toBeTruthy()

            // ids 검증
            runner.expect(inputObject.ids.uid).toBeTruthy()
            runner.expect(inputObject.ids.projectId).toBeTruthy()

            // draft 구조 검증
            const draft = inputObject.draft
            runner.expect(draft.structures).toBeTruthy()
            runner.expect(Array.isArray(draft.structures)).toBeTruthy()
            runner.expect(draft.metadatas).toBeTruthy()
            runner.expect(draft.additionalRequests).toBeTruthy()

            // structures 배열 검증
            runner.expect(draft.structures.length).toBeGreaterThan(0)
            for(const structure of draft.structures) {
                runner.expect(structure.boundedContextName).toBeTruthy()
                runner.expect(structure.boundedContextAlias).toBeTruthy()
                runner.expect(Array.isArray(structure.aggregates)).toBeTruthy()
                
                for(const aggregate of structure.aggregates) {
                    runner.expect(aggregate.aggregateName).toBeTruthy()
                    runner.expect(aggregate.aggregateAlias).toBeTruthy()
                    runner.expect(Array.isArray(aggregate.enumerations)).toBeTruthy()
                    runner.expect(Array.isArray(aggregate.valueObjects)).toBeTruthy()

                    for(const enumeration of aggregate.enumerations) {
                        runner.expect(enumeration.name).toBeTruthy()
                        runner.expect(enumeration.alias).toBeTruthy()
                    }

                    for(const valueObject of aggregate.valueObjects) {
                        runner.expect(valueObject.name).toBeTruthy()
                        runner.expect(valueObject.alias).toBeTruthy()
                    }
                }
            }

            // metadatas 검증
            runner.expect(draft.metadatas.boundedContextRequirements).toBeTruthy()
            const bcNames = draft.structures.map(s => s.boundedContextName)
            for(const bcName of bcNames) {
                runner.expect(draft.metadatas.boundedContextRequirements[bcName]).toBeTruthy()
            }

            // additionalRequests 검증
            runner.expect(draft.additionalRequests.essentialAggregateAttributes).toBeTruthy()
            runner.expect(draft.additionalRequests.essentialEventNames).toBeTruthy()
            runner.expect(draft.additionalRequests.essentialCommandNames).toBeTruthy()
            runner.expect(draft.additionalRequests.essentialReadModelNames).toBeTruthy()

            // essentialAggregateAttributes 검증
            for(const bcName of bcNames) {
                if(draft.additionalRequests.essentialAggregateAttributes[bcName]) {
                    const bcAggregates = draft.structures.find(s => s.boundedContextName === bcName).aggregates
                    const aggregateNames = bcAggregates.map(a => a.aggregateName)
                    
                    for(const aggregateName of Object.keys(draft.additionalRequests.essentialAggregateAttributes[bcName])) {
                        runner.expect(aggregateName).toBeOneOf(aggregateNames)
                        runner.expect(Array.isArray(draft.additionalRequests.essentialAggregateAttributes[bcName][aggregateName])).toBeTruthy()
                    }
                }
            }

            // essentialEventNames 검증
            for(const bcName of Object.keys(draft.additionalRequests.essentialEventNames)) {
                runner.expect(bcName).toBeOneOf(bcNames)
                runner.expect(Array.isArray(draft.additionalRequests.essentialEventNames[bcName])).toBeTruthy()
                runner.expect(draft.additionalRequests.essentialEventNames[bcName].length).toBeGreaterThan(0)
            }

            // essentialCommandNames 검증
            for(const bcName of Object.keys(draft.additionalRequests.essentialCommandNames)) {
                runner.expect(bcName).toBeOneOf(bcNames)
                runner.expect(Array.isArray(draft.additionalRequests.essentialCommandNames[bcName])).toBeTruthy()
            }

            // essentialReadModelNames 검증
            for(const bcName of Object.keys(draft.additionalRequests.essentialReadModelNames)) {
                runner.expect(bcName).toBeOneOf(bcNames)
                runner.expect(Array.isArray(draft.additionalRequests.essentialReadModelNames[bcName])).toBeTruthy()
            }
        });
    });
}