const JsonAIGenerator = require("./JsonAIGenerator");

class CommandReadModelExtractor extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel");
        this.generatorName = 'CommandReadModelExtractor';
    }

    createPrompt() {
        return `You are an expert DDD architect. Extract Commands and ReadModels (Views) from user requirements and organize them by Bounded Context.

        REQUIREMENTS:
        ${this.client.input.requirements}

        BOUNDED CONTEXTS:
        ${JSON.stringify(this.client.input.resultDevideBoundedContext || [])}

        TASK:
        Extract all business operations (Commands) and query operations (ReadModels/Views) from the requirements and organize them by their corresponding Bounded Context.

        EXTRACTION GUIDELINES:

        ## Command Extraction Rules (비즈니스 로직):
        1. **상태 변경 작업**: 시스템의 상태나 데이터를 변경하는 모든 작업
           - 생성: CreateReservation, RegisterUser, CreateFlight
           - 수정: UpdateProfile, UpdateReservation, UpdateFlight
           - 삭제: CancelReservation, DeleteFlight, DeleteSeat
           - 처리: ProcessPayment, ConfirmReservation, VerifyEmail
        2. **비즈니스 프로세스**: 특정 비즈니스 규칙을 수행하는 작업
           - 검증: ValidateReservation, AuthenticateUser
           - 계산: CalculatePrice, ComputeRefund
           - 통지: SendNotification, IssueAuthToken
        3. **외부 시스템 연동**: 외부 시스템과의 상호작용
           - 동기화: SyncFlightInfo, SyncSeatInfo
           - 감지: DetectFraudulentReservation
        4. **명명 규칙**: 동사 + 명사 (Verb + Noun)
        5. **액터 식별**: user, admin, system, external

        ## ReadModel (View) Extraction Rules (조회 작업):
        1. **데이터 조회**: 상태를 변경하지 않고 데이터를 가져오는 작업
           - 단일 조회: UserProfile, ReservationDetail, FlightDetail
           - 목록 조회: FlightList, ReservationHistory, InquiryList
        2. **검색 및 필터링**: 조건에 따른 데이터 검색
           - 검색: FlightSearch, SearchReservations
           - 필터링: FilteredFlightList, AvailableSeats
        3. **통계 및 보고서**: 집계 데이터나 요약 정보
           - 통계: ReservationStatistics, SalesReport
           - 현황: SeatAvailability, FlightStatus
        4. **UI 지원 데이터**: 화면 구성에 필요한 데이터
           - 옵션 목록: AirportList, SeatClassOptions
           - 설정 정보: UserPreferences, SystemSettings
        5. **명명 규칙**: 명사 + 목적 (Noun + Purpose)
        6. **액터 식별**: user, admin, system

        ## Bounded Context Assignment:
        1. **Domain Alignment**: Assign commands/views to the most appropriate Bounded Context based on domain responsibility
        2. **Aggregate Alignment**: Consider which aggregates within each Bounded Context are most relevant
        3. **Business Logic**: Group related operations within the same Bounded Context

        OUTPUT FORMAT:
        {
          "extractedData": {
            "boundedContexts": [
              {
                "name": "BoundedContextName",
                "alias": "BoundedContextAlias",
                "commands": [
                  {
                    "name": "CommandName",
                    "alias": "CommandAlias",
                    "description": "Command description",
                    "actor": "user|admin|system",
                    "aggregate": "AggregateName",
                    "properties": [
                      {
                        "name": "propertyName",
                        "type": "String|Long|Integer|Boolean|Date",
                        "description": "Property description"
                      }
                    ]
                  }
                ],
                "readModels": [
                  {
                    "name": "ReadModelName",
                    "alias": "ReadModelAlias",
                    "description": "ReadModel description",
                    "actor": "user|admin|system",
                    "aggregate": "AggregateName",
                    "isMultipleResult": true|false,
                    "queryParameters": [
                      {
                        "name": "parameterName",
                        "type": "String|Long|Integer|Boolean|Date",
                        "description": "Parameter description"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }

        RULES:
        - Extract ALL business operations from requirements
        - Focus on domain-specific operations, not generic CRUD
        - Ensure commands and views are properly categorized
        - Use clear, descriptive names that reflect business intent
        - Assign appropriate actors for each operation
        - Return ONLY JSON, no explanations`;
    }

    createModel(text) {
        try {
            let model = super.createModel(text);
            
            if (model && model.extractedData) {
                return {
                    extractedData: model.extractedData,
                    currentGeneratedLength: JSON.stringify(model).length
                };
            }
        } catch (e) {
            console.log("CommandReadModelExtractor error:", e);
            return {
                extractedData: {
                    boundedContexts: []
                },
                currentGeneratedLength: 0
            };
        }
    }

    validateExtractedData(extractedData) {
        if (!extractedData || !extractedData.boundedContexts) {
            return false;
        }

        return extractedData.boundedContexts.every(bc => {
            return bc.name && bc.alias && 
                   Array.isArray(bc.commands) && 
                   Array.isArray(bc.readModels);
        });
    }

    mergeExtractedData(existingData, newData) {
        if (!existingData || !existingData.boundedContexts) {
            return newData;
        }

        const mergedBoundedContexts = [...existingData.boundedContexts];

        newData.boundedContexts.forEach(newBC => {
            const existingBCIndex = mergedBoundedContexts.findIndex(
                bc => bc.name === newBC.name
            );

            if (existingBCIndex !== -1) {
                // Merge commands and readModels
                mergedBoundedContexts[existingBCIndex].commands = [
                    ...mergedBoundedContexts[existingBCIndex].commands,
                    ...newBC.commands
                ];
                mergedBoundedContexts[existingBCIndex].readModels = [
                    ...mergedBoundedContexts[existingBCIndex].readModels,
                    ...newBC.readModels
                ];
            } else {
                mergedBoundedContexts.push(newBC);
            }
        });

        return {
            ...existingData,
            boundedContexts: mergedBoundedContexts
        };
    }
}

module.exports = CommandReadModelExtractor;
