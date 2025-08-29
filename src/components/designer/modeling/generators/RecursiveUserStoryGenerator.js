import UserStoryGenerator from './UserStoryGenerator';
import TextChunker from './TextChunker';

class RecursiveUserStoryGenerator extends UserStoryGenerator {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });

        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.resolveCurrentProcess = null;

        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
    }

    // UserStoryGenerator의 createPrompt를 오버라이드하여 recursive 모드용 JSON 프롬프트 생성
    createPrompt() {
        let modelDescription = ""

        if(this.client.input.userStoryMapModel){
            let elements = this.client.input.userStoryMapModel.elements
            modelDescription += "Create only a bounded contexts by referring to the following user story.\n\n"
            modelDescription += "User story definition as follows: \n"
            Object.keys(elements).forEach(ele=>{
                if(elements[ele]._type ==="UserStory"){
                    modelDescription += "\n- user story: \n"
                    modelDescription += "story name: " + elements[ele].name + "\n"
                    modelDescription += "as: " + elements[ele].as + "\n"
                    modelDescription += "i want: " + elements[ele].iWant + "\n"
                    modelDescription += "so that: " + elements[ele].soThat + "\n"
                }
            });

            return modelDescription
        }else{
            if(this.client.input.painpointAnalysis){
                let modelPerPersona = this.client.input.painpointAnalysis
                modelDescription += "Persona definition and he(or her)'s painpoints and possible solutions as follows: \n\n"
                Object.keys(this.client.input.painpointAnalysis).forEach(persona=>{
                    modelDescription +="- "+ persona + "\n"
                    let relations = modelPerPersona[persona].relations
                    Object.keys(relations).forEach(key=>{
                        let painPoint = relations[key].sourceElement.name
                        let possibleSolution = relations[key].targetElement.name
        
                        modelDescription += `${painPoint}:${possibleSolution}\n`
                    });
                });
            }else {
                if(this.client.input.personas){
                    if(this.client.input.personas.length>0){
                        let personas = this.client.input.personas
                        modelDescription += "Create pain points and possible solutions that may arise by considering the following Personas. \n\n"
                        for(var i=0; i<personas.length; i++){
                            modelDescription +="- "+ personas[i].persona + "\n"
                        }
                    }
                }
            }
    
            if(this.client.input.businessModel){
                modelDescription += "\n Detailed Business Model of the service is: \n"
                let elementsByTypes = {};
                let model = this.client.input.businessModel;
                Object.keys(model)
                    .forEach(key=>{
                        let element = model[key]; 
                        if(!elementsByTypes[element._type]) elementsByTypes[element._type]=[]; 
                        elementsByTypes[element._type].push(element.name);
                    }
                );
    
                modelDescription += "\n" +Object.keys(elementsByTypes)
                    .reduce((sum, type) => {
                        let shortType = type.split(".").pop(); 
                        let stickers = elementsByTypes[type].join(", ");
                        return sum + `${shortType}:${stickers}\n`
                    }, 
                "");
            }

            modelDescription += `\n\nThe response is must be in the same language with the service name. Also, please list bounded contexts in the perspective of ${this.client.input.separationPrinciple}.`
        }

        // 기존 데이터가 있는 경우 title만 참조
        let existingDataPrompt = this.createExistingDataPrompt();

        // Recursive 모드: JSON 형식 요청
        return `
            Please analyze the following requirements and extract ONLY the actors, user stories, and business rules that are EXPLICITLY mentioned or directly implied.

            ${this.userStroyPrompt()}

            REQUIREMENTS ANALYSIS RULES:
            1. Actors:
            - Extract ONLY actors that are explicitly mentioned in the requirements
            - Do NOT create fictional or hypothetical actors
            - Focus on actual users, systems, or external entities mentioned in the text
            
            2. User Stories:
            - Create user stories ONLY for features and functionality explicitly described in the requirements
            - Do NOT invent additional features or expand beyond what is specified
            - Each story must be directly traceable to specific requirements in the text
            - Use the format: "As a [role], I want [specific feature], so that [stated benefit]"
            
            3. Business Rules:
            - Extract ONLY business rules that are explicitly stated or clearly implied in the requirements
            - Do NOT create generic or hypothetical business rules
            - Focus on actual constraints, validations, or processes mentioned in the text

            ${existingDataPrompt}

            OUTPUT FORMAT:
            Return a JSON object with the following structure:
            {
              "title": "서비스 제목",
              "actors": [
                {
                  "title": "액터 제목",
                  "description": "액터 설명",
                  "role": "액터 역할"
                }
              ],
              "userStories": [
                {
                  "title": "유저스토리 제목",
                  "as": "As a [role]",
                  "iWant": "I want [action]",
                  "soThat": "so that [benefit]",
                  "description": "상세 설명"
                }
              ],
              "businessRules": [
                {
                  "title": "비즈니스 규칙 제목",
                  "description": "규칙 설명"
                }
              ]
            }

            CRITICAL INSTRUCTIONS:
            - Generate content ONLY from the provided requirements text
            - Do NOT create fictional scenarios or hypothetical features
            - Do NOT expand beyond what is explicitly stated or directly implied
            - If the requirements text is insufficient to create meaningful content, return minimal but accurate content
            - Focus on extracting and organizing existing information rather than creating new content
            - The following topics are ALREADY COVERED in previous chunks. Do NOT duplicate them.

            The response must:
            - Be directly traceable to the provided requirements text
            - Avoid any fictional or hypothetical content
            - Return ONLY the JSON object, no additional text
        `
    }

    // Recursive 모드에서만 사용하는 기존 데이터 프롬프트 생성
    createExistingDataPrompt() {
        let prompt = '';
        
        // 기존 액터 정보 (title만)
        if (this.client.input.existingActors && this.client.input.existingActors.length > 0) {
            const existingActorTitles = this.client.input.existingActors.map(actor => actor.title);
            prompt += 'Already Generated Actors: ' + existingActorTitles.join(', ') + '\n';
            prompt += 'Create new actors if needed, but avoid duplicating existing ones.\n\n';
        }

        // 기존 유저 스토리 정보 (title만)
        if (this.client.input.existingUserStories && this.client.input.existingUserStories.length > 0) {
            const existingTitles = this.client.input.existingUserStories.map(story => story.title);
            
            prompt += 'Already Generated Topics (do not create related content):\n';
            prompt += existingTitles.join(', ') + '\n\n';
            prompt += 'Focus on generating new, unrelated user stories and features.\n\n';
        }

        // 기존 비즈니스 규칙 정보 (title만)
        if (this.client.input.existingBusinessRules && this.client.input.existingBusinessRules.length > 0) {
            const existingRuleTitles = this.client.input.existingBusinessRules.map(rule => rule.title);
            prompt += 'Already Generated Business Rules: ' + existingRuleTitles.join(', ') + '\n';
            prompt += 'Create new rules if needed, but avoid duplicating existing ones.\n\n';
        }

        // 기존 바운디드 컨텍스트 정보 (title만)
        if (this.client.input.existingBoundedContexts && this.client.input.existingBoundedContexts.length > 0) {
            const existingBCTitles = this.client.input.existingBoundedContexts.map(bc => bc.name);
            prompt += 'Already Generated Bounded Contexts: ' + existingBCTitles.join(', ') + '\n';
            prompt += 'Create new contexts if needed, but avoid duplicating existing ones.\n\n';
        }

        if (prompt) {
            prompt += 'IMPORTANT: When generating new content, ensure it complements and builds upon the existing data rather than duplicating it.';
        }

        return prompt;
    }

    async generateRecursively(requirementsText) {
        this.currentChunks = this.textChunker.splitIntoChunks(requirementsText || '');
        this.currentChunkIndex = 0;
        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };

        return new Promise(resolve => {
            this.resolveCurrentProcess = resolve;
            this.processNextChunk();
        });
    }

    processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const chunkText = this.currentChunks[this.currentChunkIndex];
            // 유지해야 하는 입력은 그대로 두고, userStory만 청크로 교체
            const originalInput = this.client.input || {};
            this.client.input = {
                ...originalInput,
                userStory: chunkText,
                existingActors: this.accumulated.actors || [],
                existingUserStories: this.accumulated.userStories || [],
                existingBusinessRules: this.accumulated.businessRules || [],
                existingBoundedContexts: this.accumulated.boundedContexts || []
            };
            
            // RecursiveSiteMapGenerator와 동일하게 직접 generate 호출
            this.generate();
        } else {
            // 모든 청크 처리 완료 → 최종 결과 구성
            const result = {
                title: this.accumulated.title || '새로운 서비스',
                actors: this.accumulated.actors,
                userStories: this.accumulated.userStories,
                businessRules: this.accumulated.businessRules,
                boundedContexts: this.accumulated.boundedContexts
            };

            if (this.resolveCurrentProcess) {
                this.resolveCurrentProcess(result);
            }
        }
    }



    handleGenerationFinished(model) {
        try {
            if (model) {
                // JSON 응답 파싱 시도
                let parsedData = null;
                
                if (typeof model === 'string') {
                    try {
                        // JSON 파싱 시도
                        parsedData = JSON.parse(model);
                        console.log('Successfully parsed JSON from string');
                    } catch (e) {
                        console.warn('Failed to parse JSON from string, treating as plain text');
                        // JSON 파싱 실패 시 텍스트로 처리
                        parsedData = { content: model };
                    }
                } else if (typeof model === 'object' && model !== null) {
                    parsedData = model;
                    console.log('Model is already an object');
                }
                
                if (parsedData) {
                    // 구조화된 데이터를 accumulated에 추가
                    if (parsedData.userStories && Array.isArray(parsedData.userStories)) {
                        console.log('Adding userStories:', parsedData.userStories.length);
                        this.accumulated.userStories.push(...parsedData.userStories);
                    }
                    
                    if (parsedData.actors && Array.isArray(parsedData.actors)) {
                        console.log('Adding actors:', parsedData.actors.length);
                        this.accumulated.actors.push(...parsedData.actors);
                    }
                    
                    if (parsedData.businessRules && Array.isArray(parsedData.businessRules)) {
                        console.log('Adding businessRules:', parsedData.businessRules.length);
                        this.accumulated.businessRules.push(...parsedData.businessRules);
                    }
                    
                    if (parsedData.boundedContexts && Array.isArray(parsedData.boundedContexts)) {
                        console.log('Adding boundedContexts:', parsedData.boundedContexts.length);
                        this.accumulated.boundedContexts.push(...parsedData.boundedContexts);
                    }
                    
                    // title은 최초 한 번만 채움
                    if (!this.accumulated.title && parsedData.title) {
                        this.accumulated.title = parsedData.title;
                        console.log('Updated title:', this.accumulated.title);
                    }
                }
            } else {
                console.log('Model is null or undefined');
            }

            console.log('Final accumulated after merge:', JSON.parse(JSON.stringify(this.accumulated)));
            console.log('Current chunk index:', this.currentChunkIndex, 'Total chunks:', this.currentChunks.length);

            // 다음 청크로 진행
            this.currentChunkIndex++;
            if (this.currentChunkIndex < this.currentChunks.length) {
                setTimeout(() => this.processNextChunk(), 0);
            } else {
                // 모든 청크 처리 완료
                if (this.resolveCurrentProcess) {
                    this.resolveCurrentProcess(this.accumulated);
                }
            }
            
            // 누적된 결과 반환
            return this.accumulated;
        } catch (e) {
            console.warn('Error processing chunk:', e);
            // 실패 시에도 다음 청크로 진행
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 0);
            // 에러 시에도 현재까지 누적된 결과 반환
            return this.accumulated;
        }
    }

    mergeActors(targetActors, newActors) {
        for (const actor of newActors) {
            const key = this.actorKey(actor);
            const existing = targetActors.find(a => this.actorKey(a) === key);
            if (existing) {
                // 병합: 설명/역할 보강
                if (!existing.description && actor.description) existing.description = actor.description;
                if (!existing.role && actor.role) existing.role = actor.role;
                if (!existing.responsibilities && actor.responsibilities) existing.responsibilities = actor.responsibilities;
            } else {
                // 새 액터 추가 (깊은 복사)
                targetActors.push(JSON.parse(JSON.stringify(actor)));
            }
        }
    }

    mergeUserStories(targetStories, newStories) {
        for (const story of newStories) {
            const key = this.userStoryKey(story);
            const existing = targetStories.find(s => this.userStoryKey(s) === key);
            if (existing) {
                // 병합: 설명/수용 기준 보강
                if (!existing.description && story.description) existing.description = story.description;
                if (!existing.acceptanceCriteria && story.acceptanceCriteria) existing.acceptanceCriteria = story.acceptanceCriteria;
                if (!existing.as && story.as) existing.as = story.as;
                if (!existing.iWant && story.iWant) existing.iWant = story.iWant;
                if (!existing.soThat && story.soThat) existing.soThat = story.soThat;
            } else {
                // 새 스토리 추가 (깊은 복사)
                targetStories.push(JSON.parse(JSON.stringify(story)));
            }
        }
    }

    mergeBusinessRules(targetRules, newRules) {
        for (const rule of newRules) {
            const key = this.businessRuleKey(rule);
            const existing = targetRules.find(r => this.businessRuleKey(r) === key);
            if (existing) {
                // 병합: 설명/로직 보강
                if (!existing.description && rule.description) existing.description = rule.description;
                if (!existing.logic && rule.logic) existing.logic = rule.logic;
                if (!existing.validation && rule.validation) existing.validation = rule.validation;
            } else {
                // 새 규칙 추가 (깊은 복사)
                targetRules.push(JSON.parse(JSON.stringify(rule)));
            }
        }
    }

    mergeBoundedContexts(targetBCs, newBCs) {
        for (const bc of newBCs) {
            const key = this.boundedContextKey(bc);
            const existing = targetBCs.find(b => this.boundedContextKey(b) === key);
            if (existing) {
                // 병합: 설명/역할 보강
                if (!existing.description && bc.description) existing.description = bc.description;
                if (!existing.role && bc.role) existing.role = bc.role;
                if (!existing.responsibilities && bc.responsibilities) existing.responsibilities = bc.responsibilities;
            } else {
                // 새 BC 추가 (깊은 복사)
                targetBCs.push(JSON.parse(JSON.stringify(bc)));
            }
        }
    }

    actorKey(actor) {
        return `${actor.name || ''}::${actor.type || ''}`;
    }

    userStoryKey(story) {
        return `${story.title || ''}::${story.as || ''}`;
    }

    businessRuleKey(rule) {
        return `${rule.name || ''}::${rule.type || ''}`;
    }

    boundedContextKey(bc) {
        return `${bc.name || ''}::${bc.role || ''}`;
    }


}

export default RecursiveUserStoryGenerator;
