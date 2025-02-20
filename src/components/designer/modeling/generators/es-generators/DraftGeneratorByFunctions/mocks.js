/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputs = [
    {
        "description": "{\"userStories\":[{\"title\":\"UC-001: 민원 신청서 작성\",\"description\":\"민원 신청자로서, 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력할 수 있도록 한다. 전제조건은 시스템에 로그인(인증) 완료와 필요한 개인정보 및 민원 관련 정보(예: 주민등록번호, 주소 등)의 준비이다. 기본 흐름은 UI에서 'newApplication' 폼 호출 후 신청서 항목 입력, 입력값 유효성 검사, 임시저장 성공 메시지 반환을 포함하며, 예외 흐름에서는 입력값 검증 실패 시 오류 메시지 출력 및 수정 요청을 한다.\",\"acceptance\":[\"필수 항목이 모두 입력되어야 임시 저장이 가능하다\",\"입력값 유효성 검사를 통해 오류가 발생하면 적절한 메시지가 표시된다\",\"임시 저장 성공 시 성공 메시지가 반환된다\"]},{\"title\":\"UC-002: 민원 신청서 제출\",\"description\":\"민원 신청자로서, 임시 저장 상태인 신청서를 불러와 최종 제출하여 민원 담당자가 검토할 수 있도록 한다. 전제조건은 UC-001을 통해 임시 저장된 신청서가 존재하는 것이다. 기본 흐름은 임시 저장된 신청서를 로드 후 'submitApplication' 호출, 필수 항목 재검증 및 제증명 처리 대기 상태 변경, 제출 완료 메시지 반환을 포함하며, 예외 흐름에서는 필수 정보 미입력 시 제출 불가 메시지를 출력하고 수정하도록 유도한다.\",\"acceptance\":[\"임시 저장된 신청서가 존재해야 한다\",\"필수 정보 재검증 후 제출이 가능해야 한다\",\"제출 완료 메시지가 반환되어야 한다\",\"필수 정보가 누락된 경우 제출 불가 메시지가 표시되어야 한다\"]},{\"title\":\"UC-003: 민원 신청서 검토 및 승인/반려\",\"description\":\"민원 담당자로서, 제출된 민원 신청서를 검토하여 승인 또는 반려 여부를 결정한다. 전제조건은 UC-002를 통해 제출된 신청서가 대기 리스트에 있으며, 민원 담당자 권한이 있는 상태여야 한다. 기본 흐름은 'listPendingApplications'를 호출하여 대기중인 신청서를 조회하고, 상세 내용을 확인한 후 'approveApplication' 또는 'rejectApplication'을 호출하여 승인 시 신청서 상태 변경 및 후속 발급 프로세스를 자동 시작하고, 반려 시 반려 사유를 기록하며 민원 신청자에게 통보하는 과정을 포함한다. 예외 흐름은 시스템 오류 발생 시 오류 로그 기록 및 재시도 요청을 포함한다.\",\"acceptance\":[\"대기중인 신청서 리스트가 정상적으로 조회되어야 한다\",\"신청서 상세 내용 확인이 가능해야 한다\",\"승인 또는 반려 후 상태가 변경되어야 한다\",\"시스템 오류 발생 시 적절한 로그 기록 및 재시도 요청이 이루어져야 한다\"]}],\"entities\":{\"Applicant\":{\"properties\":[{\"name\":\"applicantId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"residentRegistrationNumber\",\"type\":\"string\",\"required\":true},{\"name\":\"address\",\"type\":\"string\",\"required\":true}]},\"Application\":{\"properties\":[{\"name\":\"applicationId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"applicantId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Applicant\"},{\"name\":\"applicationData\",\"type\":\"json\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"Draft\",\"Submitted\",\"Approved\",\"Rejected\"]},{\"name\":\"createdDate\",\"type\":\"date\",\"required\":true},{\"name\":\"updatedDate\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"ValidApplicationData\",\"description\":\"신청서 작성 시 모든 필수 필드가 정확히 입력되어야 하며, 유효성 검사를 통과해야 한다.\"},{\"name\":\"TemporarySaveRule\",\"description\":\"임시 저장 상태의 신청서는 추후 수정이 가능하며, 최종 제출 전에는 유효성 검증이 필요하다.\"},{\"name\":\"FinalSubmissionValidation\",\"description\":\"제출 전 필수 정보가 모두 입력되지 않은 경우 제출이 거부되어야 한다.\"},{\"name\":\"ReviewProcess\",\"description\":\"제출된 신청서에 대해서만 민원 담당자가 승인 또는 반려 조치를 수행할 수 있다.\"}],\"interfaces\":{\"ApplicationSubmissionScreen\":{\"sections\":[{\"name\":\"ApplicationForm\",\"type\":\"form\",\"fields\":[{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"residentRegistrationNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"address\",\"type\":\"text\",\"required\":true},{\"name\":\"applicationContent\",\"type\":\"textarea\",\"required\":true}],\"actions\":[\"newApplication\",\"submitApplication\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"ApplicationReviewScreen\":{\"sections\":[{\"name\":\"PendingApplications\",\"type\":\"table\",\"fields\":[],\"actions\":[\"viewDetails\",\"approveApplication\",\"rejectApplication\"],\"filters\":[\"dateRange\",\"status\"],\"resultTable\":{\"columns\":[\"applicationId\",\"applicantName\",\"status\",\"createdDate\"],\"actions\":[\"approveApplication\",\"rejectApplication\",\"viewDetails\"]}}]}}}",
        "boundedContext": {
            "name": "ApplicationManagement",
            "alias": "민원신청관리",
            "displayName": "민원신청관리",
            "description": "[{\"type\":\"userStory\",\"text\":\"UC-001: 민원 신청서 작성\\n• 액터: 민원 신청자\\n• 목적: 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력한다.\\n• 전제조건: 민원 신청자가 시스템에 로그인(인증) 완료되어 있어야 함, 필요한 개인정보 및 민원 관련 정보(예: 주민등록번호, 주소 등)가 준비되어 있음.\\n• 기본 흐름: 민원 신청자는 UI 화면에서 \\\"newApplication\\\" 폼을 호출 → 신청서 항목 입력 → 입력값 유효성 검사 → 임시저장 성공 메시지 반환.\\n• 예외 흐름: 입력값 검증 실패 시, 오류 메시지를 출력하고 수정 요청.\\n\\nUC-002: 민원 신청서 제출\\n• 액터: 민원 신청자\\n• 목적: 작성 완료된 민원 신청서를 최종 제출하여 민원 담당자가 검토할 수 있도록 함.\\n• 전제조건: UC-001을 통한 임시 저장 상태의 신청서 존재.\\n• 기본 흐름: 임시 저장된 신청서를 불러와 \\\"submitApplication\\\" 호출 → 필수 항목 재검증 및 제증명 처리 대기 상태 변경 → 제출 완료 메시지 반환.\\n• 예외 흐름: 필수 정보 미입력 시 제출 불가 메시지 출력 및 수정 유도.\\n\\nUC-003: 민원 신청서 검토 및 승인/반려\\n• 액터: 민원 담당자\\n• 목적: 제출된 민원 신청서를 검토하여 승인 또는 반려 여부 결정.\\n• 전제조건: UC-002를 통해 제출된 신청서가 대기 리스트에 있음, 민원 담당자 권한 보유.\\n• 기본 흐름: 민원 담당자는 \\\"listPendingApplications\\\"로 대기중인 신청서 조회 → 상세내용 확인 → \\\"approveApplication\\\" 또는 \\\"rejectApplication\\\" 호출 → 승인 시 신청서 상태 변경 및 후속 발급 프로세스 자동 시작, 반려 시 반려 사유 기록 및 민원 신청자 통보.\\n• 예외 흐름: 시스템 오류 발생 시 오류 로그 기록 및 재시도 요청.\"},{\"type\":\"ddl\",\"text\":\"민원 신청 관리 컨텍스트는 민원 신청서 작성, 임시 저장 및 제출, 그리고 검토 및 승인/반려 처리와 관련된 모든 도메인 로직과 데이터를 포함한다. 이 컨텍스트 내에서는 신청서의 상태, 검증 로직, 사용자 입력 데이터 등이 집중 관리된다.\"}]",
            "aggregates": [
                {
                    "name": "Application",
                    "alias": "민원신청서"
                }
            ]
        },
        "accumulatedDrafts": {
            "ApplicationManagement": [],
            "DocumentIssuance": [
                {
                    "aggregate": {
                        "name": "Document",
                        "alias": "발급문서"
                    },
                    "enumerations": [],
                    "valueObjects": []
                }
            ],
            "SystemOperations": [
                {
                    "aggregate": {
                        "name": "SystemStatus",
                        "alias": "시스템상태"
                    },
                    "enumerations": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "User",
                        "alias": "사용자"
                    },
                    "enumerations": [],
                    "valueObjects": []
                }
            ]
        },
        "analysisResult": {
            "userStories": [
                {
                    "title": "UC-001: 민원 신청서 작성",
                    "description": "민원 신청자로서, 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력할 수 있도록 한다. 전제조건은 시스템에 로그인(인증) 완료와 필요한 개인정보 및 민원 관련 정보(예: 주민등록번호, 주소 등)의 준비이다. 기본 흐름은 UI에서 'newApplication' 폼 호출 후 신청서 항목 입력, 입력값 유효성 검사, 임시저장 성공 메시지 반환을 포함하며, 예외 흐름에서는 입력값 검증 실패 시 오류 메시지 출력 및 수정 요청을 한다.",
                    "acceptance": [
                        "필수 항목이 모두 입력되어야 임시 저장이 가능하다",
                        "입력값 유효성 검사를 통해 오류가 발생하면 적절한 메시지가 표시된다",
                        "임시 저장 성공 시 성공 메시지가 반환된다"
                    ]
                },
                {
                    "title": "UC-002: 민원 신청서 제출",
                    "description": "민원 신청자로서, 임시 저장 상태인 신청서를 불러와 최종 제출하여 민원 담당자가 검토할 수 있도록 한다. 전제조건은 UC-001을 통해 임시 저장된 신청서가 존재하는 것이다. 기본 흐름은 임시 저장된 신청서를 로드 후 'submitApplication' 호출, 필수 항목 재검증 및 제증명 처리 대기 상태 변경, 제출 완료 메시지 반환을 포함하며, 예외 흐름에서는 필수 정보 미입력 시 제출 불가 메시지를 출력하고 수정하도록 유도한다.",
                    "acceptance": [
                        "임시 저장된 신청서가 존재해야 한다",
                        "필수 정보 재검증 후 제출이 가능해야 한다",
                        "제출 완료 메시지가 반환되어야 한다",
                        "필수 정보가 누락된 경우 제출 불가 메시지가 표시되어야 한다"
                    ]
                },
                {
                    "title": "UC-003: 민원 신청서 검토 및 승인/반려",
                    "description": "민원 담당자로서, 제출된 민원 신청서를 검토하여 승인 또는 반려 여부를 결정한다. 전제조건은 UC-002를 통해 제출된 신청서가 대기 리스트에 있으며, 민원 담당자 권한이 있는 상태여야 한다. 기본 흐름은 'listPendingApplications'를 호출하여 대기중인 신청서를 조회하고, 상세 내용을 확인한 후 'approveApplication' 또는 'rejectApplication'을 호출하여 승인 시 신청서 상태 변경 및 후속 발급 프로세스를 자동 시작하고, 반려 시 반려 사유를 기록하며 민원 신청자에게 통보하는 과정을 포함한다. 예외 흐름은 시스템 오류 발생 시 오류 로그 기록 및 재시도 요청을 포함한다.",
                    "acceptance": [
                        "대기중인 신청서 리스트가 정상적으로 조회되어야 한다",
                        "신청서 상세 내용 확인이 가능해야 한다",
                        "승인 또는 반려 후 상태가 변경되어야 한다",
                        "시스템 오류 발생 시 적절한 로그 기록 및 재시도 요청이 이루어져야 한다"
                    ]
                }
            ],
            "entities": {
                "Applicant": {
                    "properties": [
                        {
                            "name": "applicantId",
                            "type": "string",
                            "required": true,
                            "isPrimaryKey": true
                        },
                        {
                            "name": "name",
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "residentRegistrationNumber",
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "address",
                            "type": "string",
                            "required": true
                        }
                    ]
                },
                "Application": {
                    "properties": [
                        {
                            "name": "applicationId",
                            "type": "string",
                            "required": true,
                            "isPrimaryKey": true
                        },
                        {
                            "name": "applicantId",
                            "type": "string",
                            "required": true,
                            "isForeignKey": true,
                            "foreignEntity": "Applicant"
                        },
                        {
                            "name": "applicationData",
                            "type": "json",
                            "required": true
                        },
                        {
                            "name": "status",
                            "type": "enum",
                            "required": true,
                            "values": [
                                "Draft",
                                "Submitted",
                                "Approved",
                                "Rejected"
                            ]
                        },
                        {
                            "name": "createdDate",
                            "type": "date",
                            "required": true
                        },
                        {
                            "name": "updatedDate",
                            "type": "date",
                            "required": true
                        }
                    ]
                }
            },
            "businessRules": [
                {
                    "name": "ValidApplicationData",
                    "description": "신청서 작성 시 모든 필수 필드가 정확히 입력되어야 하며, 유효성 검사를 통과해야 한다."
                },
                {
                    "name": "TemporarySaveRule",
                    "description": "임시 저장 상태의 신청서는 추후 수정이 가능하며, 최종 제출 전에는 유효성 검증이 필요하다."
                },
                {
                    "name": "FinalSubmissionValidation",
                    "description": "제출 전 필수 정보가 모두 입력되지 않은 경우 제출이 거부되어야 한다."
                },
                {
                    "name": "ReviewProcess",
                    "description": "제출된 신청서에 대해서만 민원 담당자가 승인 또는 반려 조치를 수행할 수 있다."
                }
            ],
            "interfaces": {
                "ApplicationSubmissionScreen": {
                    "sections": [
                        {
                            "name": "ApplicationForm",
                            "type": "form",
                            "fields": [
                                {
                                    "name": "name",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "residentRegistrationNumber",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "address",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "applicationContent",
                                    "type": "textarea",
                                    "required": true
                                }
                            ],
                            "actions": [
                                "newApplication",
                                "submitApplication"
                            ],
                            "filters": [],
                            "resultTable": {
                                "columns": [],
                                "actions": []
                            }
                        }
                    ]
                },
                "ApplicationReviewScreen": {
                    "sections": [
                        {
                            "name": "PendingApplications",
                            "type": "table",
                            "fields": [],
                            "actions": [
                                "viewDetails",
                                "approveApplication",
                                "rejectApplication"
                            ],
                            "filters": [
                                "dateRange",
                                "status"
                            ],
                            "resultTable": {
                                "columns": [
                                    "applicationId",
                                    "applicantName",
                                    "status",
                                    "createdDate"
                                ],
                                "actions": [
                                    "approveApplication",
                                    "rejectApplication",
                                    "viewDetails"
                                ]
                            }
                        }
                    ]
                }
            },
            "inference": "제공된 요구사항은 민원 신청서 작성, 임시저장, 제출 및 검토/승인/반려를 포함하는 세 가지 유스케이스(UC-001, UC-002, UC-003)를 다루고 있다. 명시적으로 민원 신청자는 시스템에 로그인하고 필요한 개인정보와 민원 관련 정보를 준비한 상태여야 하며, 작성 과정에서는 입력값 유효성 검사가 수행되어 임시 저장을 할 수 있다. 또한, 임시 저장된 신청서가 최종 제출 전 재검증되며, 민원 담당자는 제출된 신청서를 검토 후 승인 혹은 반려를 결정해야 한다. 민원 신청 관리 컨텍스트 내에서 신청서 상태, 검증 로직, 사용자 입력 데이터 등을 집중 관리하는 도메인 모델이 필요하다."
        },
        "existingAggregates": [
            "Document",
            "SystemStatus",
            "User"
        ],
        "boundedContextDisplayName": "민원신청관리",
        "subjectText": "Generating options for 민원신청관리 Bounded Context"
    },
    {
        "description": "{\"userStories\":[{\"title\":\"UC-004: 민원 신청 발급 처리\",\"description\":\"민원 담당자는 UC-003에서 승인된 민원 신청서를 확인한 후 'issueDocument'를 호출하여 PDF 또는 해당 포맷의 공식 민원 문서를 발급한다. 문서 발급은 승인 처리 후 자동 또는 수동으로 실행 가능하다. 생성된 문서는 민원 신청자의 계정에 업로드되거나 이메일로 전송되며, 발급 성공 메시지가 제공된다. 문서 생성 실패 시에는 오류 로그가 기록되고 민원 담당자에게 재시도 요청 또는 수동 발급 처리가 진행된다.\",\"acceptance\":[\"민원 신청서가 승인 상태여야 문서 발급이 진행된다.\",\"문서 발급 시 'issueDocument' 함수가 호출된다.\",\"PDF 혹은 지정된 포맷의 문서가 성공적으로 생성되어 민원 신청자에게 전달된다.\",\"문서 생성 실패 시 오류 로그가 기록되고, 민원 담당자에게 재시도 요청 또는 수동 발급 처리 옵션이 제공된다.\"]}],\"entities\":{\"IssuedDocument\":{\"properties\":[{\"name\":\"documentId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"citizenApplicationId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"CitizenApplication\"},{\"name\":\"format\",\"type\":\"enum\",\"required\":true,\"values\":[\"PDF\",\"Other\"]},{\"name\":\"issueDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"Issued\",\"Failed\"]},{\"name\":\"errorLog\",\"type\":\"string\"}]}},\"businessRules\":[{\"name\":\"ApprovedApplicationRequired\",\"description\":\"문서 발급은 UC-003에서 승인된 민원 신청서만을 대상으로 진행되어야 한다.\"},{\"name\":\"IssueDocumentInvocation\",\"description\":\"민원 담당자는 승인된 신청서를 확인한 후 'issueDocument' 함수를 호출하여 문서 발급을 시작한다.\"},{\"name\":\"DocumentCreationFailureHandling\",\"description\":\"문서 생성에 실패할 경우, 오류 로그를 기록하고 민원 담당자에게 재시도 요청 또는 수동 발급 처리 옵션을 제공해야 한다.\"}],\"interfaces\":{\"DocumentIssuance\":{\"sections\":[{\"name\":\"ApprovedApplicationsList\",\"type\":\"table\",\"fields\":[{\"name\":\"applicationNumber\",\"type\":\"string\",\"required\":true},{\"name\":\"applicantName\",\"type\":\"string\",\"required\":true},{\"name\":\"approvalStatus\",\"type\":\"string\",\"required\":true}],\"actions\":[\"issueDocument\",\"retryIssue\"],\"filters\":[],\"resultTable\":{\"columns\":[\"applicationNumber\",\"applicantName\",\"approvalStatus\",\"issueDate\",\"status\"],\"actions\":[\"viewDetails\",\"issueDocument\",\"retryIssue\"]}}]}}}",
        "boundedContext": {
            "name": "DocumentIssuance",
            "alias": "문서발급서비스",
            "displayName": "문서발급서비스",
            "description": "[{\"type\":\"userStory\",\"text\":\"UC-004: 민원 신청 발급 처리\\n• 액터: 민원 담당자 (승인 처리 후 자동 또는 수동 실행 가능)\\n• 목적: 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급.\\n• 전제조건: UC-003에서 민원 신청서가 승인된 상태, 문서 발급에 필요한 서식 및 인증 로직 준비됨.\\n• 기본 흐름: 승인된 신청서를 확인 후 \\\"issueDocument\\\" 호출 → PDF 혹은 해당 포맷 문서 생성 → 생성된 문서를 민원 신청자 계정에 업로드하거나 이메일 전송 → 발급 성공 메시지 제공.\\n• 예외 흐름: 문서 생성 실패 시 오류 로그 기록, 민원 담당자에게 재시도 요청 또는 수동 발급 처리.\"},{\"type\":\"ddl\",\"text\":\"문서 발급 서비스 컨텍스트는 승인된 민원 신청서를 기반으로 문서 생성, 발급 및 전송 프로세스를 담당하며, 문서 생성의 각 단계(데이터 확인, 포맷팅, 전송 등)가 이 컨텍스트에서 집중 관리된다.\"}]",
            "aggregates": [
                {
                    "name": "Document",
                    "alias": "발급문서"
                }
            ]
        },
        "accumulatedDrafts": {
            "ApplicationManagement": [
                {
                    "aggregate": {
                        "name": "ApplicationSubmission",
                        "alias": "신청서작성및제출"
                    },
                    "enumerations": [
                        {
                            "name": "Applicant",
                            "alias": "민원신청자"
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "ApplicationData",
                            "alias": "신청서내용",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "SubmissionStatus",
                            "alias": "제출상태",
                            "referencedAggregateName": ""
                        }
                    ]
                },
                {
                    "aggregate": {
                        "name": "ApplicationReview",
                        "alias": "신청서검토및승인"
                    },
                    "enumerations": [],
                    "valueObjects": [
                        {
                            "name": "ApplicationReference",
                            "alias": "신청서참조",
                            "referencedAggregate": {
                                "name": "ApplicationSubmission",
                                "alias": "신청서작성및제출"
                            }
                        },
                        {
                            "name": "ReviewDecision",
                            "alias": "검토결과",
                            "referencedAggregateName": ""
                        }
                    ]
                }
            ],
            "DocumentIssuance": [],
            "SystemOperations": [
                {
                    "aggregate": {
                        "name": "SystemStatus",
                        "alias": "시스템상태"
                    },
                    "enumerations": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "User",
                        "alias": "사용자"
                    },
                    "enumerations": [],
                    "valueObjects": []
                }
            ]
        },
        "analysisResult": {
            "userStories": [
                {
                    "title": "UC-004: 민원 신청 발급 처리",
                    "description": "민원 담당자는 UC-003에서 승인된 민원 신청서를 확인한 후 'issueDocument'를 호출하여 PDF 또는 해당 포맷의 공식 민원 문서를 발급한다. 문서 발급은 승인 처리 후 자동 또는 수동으로 실행 가능하다. 생성된 문서는 민원 신청자의 계정에 업로드되거나 이메일로 전송되며, 발급 성공 메시지가 제공된다. 문서 생성 실패 시에는 오류 로그가 기록되고 민원 담당자에게 재시도 요청 또는 수동 발급 처리가 진행된다.",
                    "acceptance": [
                        "민원 신청서가 승인 상태여야 문서 발급이 진행된다.",
                        "문서 발급 시 'issueDocument' 함수가 호출된다.",
                        "PDF 혹은 지정된 포맷의 문서가 성공적으로 생성되어 민원 신청자에게 전달된다.",
                        "문서 생성 실패 시 오류 로그가 기록되고, 민원 담당자에게 재시도 요청 또는 수동 발급 처리 옵션이 제공된다."
                    ]
                }
            ],
            "entities": {
                "IssuedDocument": {
                    "properties": [
                        {
                            "name": "documentId",
                            "type": "string",
                            "required": true,
                            "isPrimaryKey": true
                        },
                        {
                            "name": "citizenApplicationId",
                            "type": "string",
                            "required": true,
                            "isForeignKey": true,
                            "foreignEntity": "CitizenApplication"
                        },
                        {
                            "name": "format",
                            "type": "enum",
                            "required": true,
                            "values": [
                                "PDF",
                                "Other"
                            ]
                        },
                        {
                            "name": "issueDate",
                            "type": "date",
                            "required": true
                        },
                        {
                            "name": "status",
                            "type": "enum",
                            "required": true,
                            "values": [
                                "Issued",
                                "Failed"
                            ]
                        },
                        {
                            "name": "errorLog",
                            "type": "string"
                        }
                    ]
                }
            },
            "businessRules": [
                {
                    "name": "ApprovedApplicationRequired",
                    "description": "문서 발급은 UC-003에서 승인된 민원 신청서만을 대상으로 진행되어야 한다."
                },
                {
                    "name": "IssueDocumentInvocation",
                    "description": "민원 담당자는 승인된 신청서를 확인한 후 'issueDocument' 함수를 호출하여 문서 발급을 시작한다."
                },
                {
                    "name": "DocumentCreationFailureHandling",
                    "description": "문서 생성에 실패할 경우, 오류 로그를 기록하고 민원 담당자에게 재시도 요청 또는 수동 발급 처리 옵션을 제공해야 한다."
                }
            ],
            "interfaces": {
                "DocumentIssuance": {
                    "sections": [
                        {
                            "name": "ApprovedApplicationsList",
                            "type": "table",
                            "fields": [
                                {
                                    "name": "applicationNumber",
                                    "type": "string",
                                    "required": true
                                },
                                {
                                    "name": "applicantName",
                                    "type": "string",
                                    "required": true
                                },
                                {
                                    "name": "approvalStatus",
                                    "type": "string",
                                    "required": true
                                }
                            ],
                            "actions": [
                                "issueDocument",
                                "retryIssue"
                            ],
                            "filters": [],
                            "resultTable": {
                                "columns": [
                                    "applicationNumber",
                                    "applicantName",
                                    "approvalStatus",
                                    "issueDate",
                                    "status"
                                ],
                                "actions": [
                                    "viewDetails",
                                    "issueDocument",
                                    "retryIssue"
                                ]
                            }
                        }
                    ]
                }
            },
            "inference": "요구사항 분석 결과, UC-004는 민원 담당자가 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급하는 프로세스를 구현해야 합니다. 이 프로세스는 자동 또는 수동으로 실행 가능하며, 서식 및 인증 로직이 미리 준비되어 있어야 합니다. 또한, 문서 생성 실패 시 오류 로그를 기록하고 재시도 또는 수동 발급 처리를 할 수 있는 예외 흐름도 포함됩니다. 문서 생성의 각 단계(데이터 확인, 포맷팅, 전송 등)가 집중 관리되어야 하며, 'issueDocument' 함수 호출을 통해 문서가 생성되어 민원 신청자에게 업로드되거나 이메일로 전송되어야 합니다."
        },
        "existingAggregates": [
            "ApplicationSubmission",
            "ApplicationReview",
            "SystemStatus",
            "User"
        ],
        "boundedContextDisplayName": "문서발급서비스",
        "subjectText": "Generating options for 문서발급서비스 Bounded Context"
    },
    {
        "description": "{\"userStories\":[{\"title\":\"UC-005: 시스템 관리 및 모니터링\",\"description\":\"시스템 관리자는 monitorSystem 함수를 이용하여 전체 시스템 상태를 확인하고, 장애나 비정상 상황 발생 시 알림을 확인 후 즉각적으로 조치하거나 관련 이슈를 전달합니다. 또한, 정기적인 업데이트 및 보안 점검을 수행하며, 모니터링 도구 오류 발생 시 백업 로깅 시스템으로 전환하여 수동 모니터링을 실시합니다.\",\"acceptance\":[\"관리자는 관리자 전용 콘솔 접근 권한을 보유한다.\",\"monitorSystem 함수를 통해 시스템 상태가 정상적으로 조회되어야 한다.\",\"장애 또는 비정상 상황 발생 시 알림이 즉각적으로 나타나야 한다.\",\"모니터링 도구 오류 발생 시 백업 로깅 시스템으로 전환된다.\",\"정기적 업데이트 및 보안 점검 기능이 정상적으로 수행된다.\"]}],\"entities\":{\"SystemAdmin\":{\"properties\":[{\"name\":\"adminId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"role\",\"type\":\"string\",\"required\":true}]},\"SystemStatus\":{\"properties\":[{\"name\":\"statusId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"overallStatus\",\"type\":\"string\",\"required\":true,\"values\":[\"Normal\",\"Warning\",\"Critical\"]},{\"name\":\"lastChecked\",\"type\":\"datetime\",\"required\":true},{\"name\":\"alerts\",\"type\":\"string\"}]}},\"businessRules\":[{\"name\":\"BackupLoggingRule\",\"description\":\"모니터링 도구에 오류가 발생하면 자동으로 백업 로깅 시스템으로 전환하여 수동 모니터링을 가능하게 한다.\"},{\"name\":\"AccessControlRule\",\"description\":\"관리자 콘솔 및 monitorSystem 함수는 시스템 관리자 권한을 가진 사용자만 접근할 수 있다.\"},{\"name\":\"SystemIntegrityRule\",\"description\":\"시스템 상태 및 모니터링 결과는 정기적으로 업데이트되어야 하며, 보안 점검 기준을 만족해야 한다.\"}],\"interfaces\":{\"AdminConsole\":{\"sections\":[{\"name\":\"SystemStatusOverview\",\"type\":\"table\",\"fields\":[],\"actions\":[\"monitorSystem\",\"initiateBackup\",\"performSecurityUpdate\"],\"filters\":[\"dateRange\",\"overallStatus\"],\"resultTable\":{\"columns\":[\"statusId\",\"overallStatus\",\"lastChecked\",\"alerts\"],\"actions\":[\"viewDetails\"]}},{\"name\":\"AlertManagement\",\"type\":\"form\",\"fields\":[{\"name\":\"alertMessage\",\"type\":\"text\",\"required\":true},{\"name\":\"actionTaken\",\"type\":\"text\",\"required\":true}],\"actions\":[\"acknowledgeAlert\",\"dispatchIncident\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}",
        "boundedContext": {
            "name": "SystemOperations",
            "alias": "시스템관리",
            "displayName": "시스템관리",
            "description": "[{\"type\":\"userStory\",\"text\":\"UC-005: 시스템 관리 및 모니터링\\n• 액터: 시스템 관리자\\n• 목적: 서비스 안정성 확보와 운영 효율성을 위해 시스템을 관리, 모니터링.\\n• 전제조건: 관리자 전용 콘솔 접근 권한 보유.\\n• 기본 흐름: 시스템 관리자는 \\\"monitorSystem\\\" 함수를 통해 전체 시스템 상태 확인 → 장애 또는 비정상 상황 발생 시 알림 확인 및 즉각 조치 또는 이슈 전달 → 정기적 업데이트 및 보안 점검 실행.\\n• 예외 흐름: 모니터링 도구 오류 시 백업 로깅 시스템으로 전환 후 수동 모니터링 조치.\\n\\n추가적으로, 사용자 로그인, 권한 부여 및 세션 관리와 관련한 기능들은 전체 시스템에서 분리된 사용자 및 인증 관리 영역으로 취급되나, 시스템 운영 컨텍스트와 밀접하게 연계되어 관리된다.\"},{\"type\":\"ddl\",\"text\":\"시스템 운영 및 관리 컨텍스트는 시스템 관리자와 관련된 모든 운영, 모니터링, 보안 및 사용자 인증 관련 기능과 데이터를 관리하며, 서비스 전체의 안정성을 위한 인프라스트럭처적 기능들을 포함한다.\"}]",
            "aggregates": [
                {
                    "name": "SystemStatus",
                    "alias": "시스템상태"
                },
                {
                    "name": "User",
                    "alias": "사용자"
                }
            ]
        },
        "accumulatedDrafts": {
            "ApplicationManagement": [
                {
                    "aggregate": {
                        "name": "ApplicationSubmission",
                        "alias": "신청서작성및제출"
                    },
                    "enumerations": [
                        {
                            "name": "Applicant",
                            "alias": "민원신청자"
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "ApplicationData",
                            "alias": "신청서내용",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "SubmissionStatus",
                            "alias": "제출상태",
                            "referencedAggregateName": ""
                        }
                    ]
                },
                {
                    "aggregate": {
                        "name": "ApplicationReview",
                        "alias": "신청서검토및승인"
                    },
                    "enumerations": [],
                    "valueObjects": [
                        {
                            "name": "ApplicationReference",
                            "alias": "신청서참조",
                            "referencedAggregate": {
                                "name": "ApplicationSubmission",
                                "alias": "신청서작성및제출"
                            }
                        },
                        {
                            "name": "ReviewDecision",
                            "alias": "검토결과",
                            "referencedAggregateName": ""
                        }
                    ]
                }
            ],
            "DocumentIssuance": [
                {
                    "aggregate": {
                        "name": "DocumentIssuanceProcess",
                        "alias": "문서발급프로세스"
                    },
                    "enumerations": [],
                    "valueObjects": [
                        {
                            "name": "ApplicationReference",
                            "alias": "신청서참조",
                            "referencedAggregate": {
                                "name": "ApplicationSubmission",
                                "alias": "신청서작성및제출"
                            }
                        },
                        {
                            "name": "IssueCommand",
                            "alias": "발급요청",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "ProcessStatus",
                            "alias": "프로세스상태",
                            "referencedAggregateName": ""
                        }
                    ]
                },
                {
                    "aggregate": {
                        "name": "IssuedDocument",
                        "alias": "발급문서"
                    },
                    "enumerations": [],
                    "valueObjects": [
                        {
                            "name": "DocumentFormat",
                            "alias": "문서형식",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "IssuanceStatus",
                            "alias": "발급상태",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "ErrorLog",
                            "alias": "오류로그",
                            "referencedAggregateName": ""
                        }
                    ]
                }
            ],
            "SystemOperations": []
        },
        "analysisResult": {
            "userStories": [
                {
                    "title": "UC-005: 시스템 관리 및 모니터링",
                    "description": "시스템 관리자는 monitorSystem 함수를 이용하여 전체 시스템 상태를 확인하고, 장애나 비정상 상황 발생 시 알림을 확인 후 즉각적으로 조치하거나 관련 이슈를 전달합니다. 또한, 정기적인 업데이트 및 보안 점검을 수행하며, 모니터링 도구 오류 발생 시 백업 로깅 시스템으로 전환하여 수동 모니터링을 실시합니다.",
                    "acceptance": [
                        "관리자는 관리자 전용 콘솔 접근 권한을 보유한다.",
                        "monitorSystem 함수를 통해 시스템 상태가 정상적으로 조회되어야 한다.",
                        "장애 또는 비정상 상황 발생 시 알림이 즉각적으로 나타나야 한다.",
                        "모니터링 도구 오류 발생 시 백업 로깅 시스템으로 전환된다.",
                        "정기적 업데이트 및 보안 점검 기능이 정상적으로 수행된다."
                    ]
                }
            ],
            "entities": {
                "SystemAdmin": {
                    "properties": [
                        {
                            "name": "adminId",
                            "type": "string",
                            "required": true,
                            "isPrimaryKey": true
                        },
                        {
                            "name": "name",
                            "type": "string",
                            "required": true
                        },
                        {
                            "name": "role",
                            "type": "string",
                            "required": true
                        }
                    ]
                },
                "SystemStatus": {
                    "properties": [
                        {
                            "name": "statusId",
                            "type": "string",
                            "required": true,
                            "isPrimaryKey": true
                        },
                        {
                            "name": "overallStatus",
                            "type": "string",
                            "required": true,
                            "values": [
                                "Normal",
                                "Warning",
                                "Critical"
                            ]
                        },
                        {
                            "name": "lastChecked",
                            "type": "datetime",
                            "required": true
                        },
                        {
                            "name": "alerts",
                            "type": "string"
                        }
                    ]
                }
            },
            "businessRules": [
                {
                    "name": "BackupLoggingRule",
                    "description": "모니터링 도구에 오류가 발생하면 자동으로 백업 로깅 시스템으로 전환하여 수동 모니터링을 가능하게 한다."
                },
                {
                    "name": "AccessControlRule",
                    "description": "관리자 콘솔 및 monitorSystem 함수는 시스템 관리자 권한을 가진 사용자만 접근할 수 있다."
                },
                {
                    "name": "SystemIntegrityRule",
                    "description": "시스템 상태 및 모니터링 결과는 정기적으로 업데이트되어야 하며, 보안 점검 기준을 만족해야 한다."
                }
            ],
            "interfaces": {
                "AdminConsole": {
                    "sections": [
                        {
                            "name": "SystemStatusOverview",
                            "type": "table",
                            "fields": [],
                            "actions": [
                                "monitorSystem",
                                "initiateBackup",
                                "performSecurityUpdate"
                            ],
                            "filters": [
                                "dateRange",
                                "overallStatus"
                            ],
                            "resultTable": {
                                "columns": [
                                    "statusId",
                                    "overallStatus",
                                    "lastChecked",
                                    "alerts"
                                ],
                                "actions": [
                                    "viewDetails"
                                ]
                            }
                        },
                        {
                            "name": "AlertManagement",
                            "type": "form",
                            "fields": [
                                {
                                    "name": "alertMessage",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "actionTaken",
                                    "type": "text",
                                    "required": true
                                }
                            ],
                            "actions": [
                                "acknowledgeAlert",
                                "dispatchIncident"
                            ],
                            "filters": [],
                            "resultTable": {
                                "columns": [],
                                "actions": []
                            }
                        }
                    ]
                }
            },
            "inference": "사용자가 제공한 요구사항은 시스템 관리자(시스템 운영 및 관리 컨텍스트)와 관련된 기능, 특히 시스템의 모니터링 및 관리에 관한 내용을 담고 있다. 여기에는 monitorSystem 함수를 통한 시스템 상태 확인, 장애 및 비정상 상황 발생 시 알림 확인, 즉각적인 조치 혹은 이슈 전달, 정기적인 업데이트 및 보안 점검, 그리고 모니터링 도구 오류 시 백업 로깅 시스템으로 전환하는 예외 흐름이 포함된다. 또한, 사용자 로그인, 권한 부여 및 세션 관리는 분리된 영역으로 취급되지만 시스템 운영과 밀접하게 연계되어 관리된다. 이를 토대로 시스템 관리 전용 사용자 스토리, 관련 엔티티, 비즈니스 규칙, 그리고 관리자 콘솔 인터페이스를 정의한다."
        },
        "existingAggregates": [
            "ApplicationSubmission",
            "ApplicationReview",
            "DocumentIssuanceProcess",
            "IssuedDocument"
        ],
        "boundedContextDisplayName": "시스템관리",
        "subjectText": "Generating options for 시스템관리 Bounded Context"
    }
]

/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputsWithFeedback = [
    {
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서, 나는 새로운 도서를 등록하여 도서관의 데이터를 최신 상태로 유지하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리를 입력받아야 한다.\",\"ISBN은 13자리 숫자여야 하고 중복 확인이 필요하다.\",\"카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 한다.\",\"등록된 도서는 기본적으로 '대출가능' 상태로 설정되어야 한다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"관리자로서, 나는 도서의 대출 상태를 관리하고 폐기 처리할 수 있어야 한다.\",\"acceptance\":[\"대출/반납 상황에 따라 도서 상태가 '대출중', '예약중'으로 자동 변경되어야 한다.\",\"폐기된 도서는 더 이상 대출이 불가능해야 한다.\",\"관리자는 도서를 '폐기' 상태로 변경할 수 있어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"UniqueISBN\",\"description\":\"ISBN은 중복될 수 없다.\"},{\"name\":\"BookStatusChange\",\"description\":\"대출/반납 상황에 따라 도서 상태가 자동으로 변경되어야 한다.\"},{\"name\":\"DiscardedBooksRestriction\",\"description\":\"폐기된 도서는 대출이 불가능해야 한다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"status\",\"type\":\"select\",\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"Edit\",\"Discard\"]}]}}}",
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": [
                {
                    "type": "userStory",
                    "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                },
                {
                    "type": "ddl",
                    "text": "도서명, ISBN, 저자, 출판사, 카테고리"
                }
            ],
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ]
        },
        "accumulatedDrafts": {
            "BookManagement": [],
            "LoanManagement": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    "entities": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "Member",
                        "alias": "회원"
                    },
                    "entities": [],
                    "valueObjects": []
                }
            ]
        },
        "feedback": {
            "previousDraftOutput": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "LoanReference",
                                        "alias": "대출 참조",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        }
                                    },
                                    {
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    },
                                    {
                                        "name": "BookStatus",
                                        "alias": "도서 상태"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    }
                                ]
                            },
                            {
                                "aggregate": {
                                    "name": "BookStatus",
                                    "alias": "도서 상태"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "BookReference",
                                        "alias": "도서 참조",
                                        "referencedAggregate": {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    },
                                    {
                                        "name": "LoanReference",
                                        "alias": "대출 참조",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "feedbacks": [
                "Aggregate가 3개인 경우를 포함해서 옵션을 생성해주세요."
            ]
        }
    }
]