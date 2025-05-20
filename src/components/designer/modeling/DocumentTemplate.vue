<template>
    <div class="document-template">
        <!-- 섹션 선택 체크박스 -->
        <div class="section-selector">
            <v-checkbox
                v-model="selectedSections.userScenario"
                :label="$t('DocumentTemplate.sections.userScenario')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.valueStream"
                :label="$t('DocumentTemplate.sections.valueStream')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.boundedContext"
                :label="$t('DocumentTemplate.sections.boundedContext')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.aggregateDesign"
                :label="$t('DocumentTemplate.sections.aggregateDesign')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.eventStorming"
                :label="$t('DocumentTemplate.sections.eventStorming')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.aggregateDetail"
                :label="$t('DocumentTemplate.sections.aggregateDetail')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
        </div>

        <!-- 표지 -->
        <div class="cover pdf-content-item">
            <h1 class="main-title">{{projectInfo.projectName}}</h1>
            <div class="subtitle">{{ $t('DocumentTemplate.cover.subtitle') }}</div>
            <div class="logo-container">
                <img src="/static/image/logo.png" alt="MSAEZ Logo" class="logo">
            </div>
            <div class="footer">
                <p>{{ $t('DocumentTemplate.cover.footer') }}</p>
            </div>
        </div>

    
        <!-- 목차 -->
        <div class="table-of-contents pdf-content-item">
            <h2>목 차</h2>
            <ol class="toc-list">
                <template v-if="selectedSections.userScenario">
                    <li>{{ sectionNumbers.userScenario }}. {{ $t('DocumentTemplate.sections.userScenario') }}</li>
                </template>
                <template v-if="selectedSections.valueStream">
                    <li>{{ sectionNumbers.valueStream }}. {{ $t('DocumentTemplate.sections.valueStream') }}</li>
                </template>
                <template v-if="selectedSections.boundedContext">
                    <li>{{ sectionNumbers.boundedContext }}. {{ $t('DocumentTemplate.sections.boundedContext') }}
                        <ul>
                            <li>{{ sectionNumbers.boundedContext }}-1. {{ $t('DocumentTemplate.boundedContext.decompositionCriteria') }}</li>
                            <li>{{ sectionNumbers.boundedContext }}-2. {{ $t('DocumentTemplate.boundedContext.decompositionResults') }}</li>
                            <li>{{ sectionNumbers.boundedContext }}-3. {{ $t('DocumentTemplate.boundedContext.contextStrategyMap') }}</li>
                            <li>{{ sectionNumbers.boundedContext }}-4. {{ $t('DocumentTemplate.boundedContext.details') }}</li>
                        </ul>
                    </li>
                </template>
                <template v-if="selectedSections.aggregateDesign">
                    <li>{{ sectionNumbers.aggregateDesign }}. {{ $t('DocumentTemplate.sections.aggregateDesign') }}
                        <ul>
                            <li>{{ sectionNumbers.aggregateDesign }}-1. {{ $t('DocumentTemplate.aggregateDesign.model') }}</li>
                            <li>{{ sectionNumbers.aggregateDesign }}-2. {{ $t('DocumentTemplate.aggregateDesign.analysis') }}</li>
                            <li>{{ sectionNumbers.aggregateDesign }}-3. {{ $t('DocumentTemplate.aggregateDesign.designCriteria') }}</li>
                        </ul>
                    </li>
                </template>
                <template v-if="selectedSections.eventStorming">
                    <li>{{ sectionNumbers.eventStorming }}. {{ $t('DocumentTemplate.sections.eventStorming') }}
                        <ul>
                            <li>{{ sectionNumbers.eventStorming }}-1. {{ $t('DocumentTemplate.eventStorming.systemWideModel') }}</li>
                            <li>{{ sectionNumbers.eventStorming }}-2. {{ $t('DocumentTemplate.eventStorming.boundedContextDetails') }}</li>
                        </ul>
                    </li>
                </template>
                <template v-if="selectedSections.aggregateDetail">
                    <li>{{ sectionNumbers.aggregateDetail }}. {{ $t('DocumentTemplate.sections.aggregateDetail') }}</li>
                </template>
            </ol>
        </div>

    
        <!-- 본문 -->
        <!-- 사용자 시나리오 (actor & event) -->
        <div v-if="selectedSections.userScenario" class="section">
            <div class="pdf-content-item">
                <h2>{{ sectionNumbers.userScenario }}. {{ $t('DocumentTemplate.sections.userScenario') }}</h2>
                <div v-if="projectInfo && projectInfo.userStory">
                    <div class="story-content">
                        <p v-for="(paragraph, pIndex) in formattedUserStory" 
                            :key="pIndex" 
                            class="story-paragraph"
                            v-html="paragraph"
                        >
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 사용자 스토리 -->
        <div v-if="selectedSections.userScenario" class="section">
            <div class="pdf-content-item">
                <h3>{{ sectionNumbers.userScenario }}-2. User Story</h3>
                <div v-if="projectInfo && projectInfo.userStory">
                    <div v-if="chunkedUserStory.length > 0" class="story-content">
                        <p v-for="(paragraph, pIndex) in chunkedUserStory[0]" 
                            :key="pIndex" 
                            class="story-paragraph"
                            v-html="paragraph"
                        >
                        </p>
                    </div>
                </div>
            </div>
            <div v-for="(storyChunk, index) in chunkedUserStory.slice(1)" 
                :key="index" 
                class="pdf-content-item"
            >
                <div class="story-content">
                    <p v-for="(paragraph, pIndex) in storyChunk" 
                        :key="pIndex" 
                        class="story-paragraph"
                        v-html="paragraph"
                    >
                    </p>
                </div>
            </div>
        </div>

        <!-- 밸류 스트림(Value stream) 분석 -->
        <div v-if="selectedSections.valueStream" class="section">
            <!-- 첫 번째 단계 -->
            <div class="pdf-content-item">
                <h2>{{ sectionNumbers.valueStream }}. {{ $t('DocumentTemplate.sections.valueStream') }}</h2>
                <div class="value-stream-description">
                    <p>{{ $t('DocumentTemplate.valueStream.description', { projectName: projectInfo.projectName }) }}</p>
                    <p>{{ $t('DocumentTemplate.valueStream.purpose') }}</p>
                </div>
                
                <div v-if="projectInfo.draft && getValueStreamSteps.length > 0" class="value-stream-steps">
                    <div class="value-stream-step">
                        <h3>{{ getLevelRangeTitle(getValueStreamSteps[0].levels) }}</h3>
                        <div class="step-levels">
                            <span v-for="level in getValueStreamSteps[0].levels" :key="level" class="level-badge">
                                Level {{ level }}
                            </span>
                        </div>
                        <div class="step-description">
                            <p>{{ getValueStreamSteps[0].description }}</p>
                        </div>
                        <div class="step-actors">
                            <div v-for="actor in getValueStreamSteps[0].actors" :key="actor.name" class="actor-group">
                                <h4>{{ actor.name }}</h4>
                                <ul>
                                    <li v-for="event in actor.events" :key="event.name">
                                        <strong>{{ event.displayName }}</strong>: {{ event.description }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 나머지 단계들 -->
            <div v-for="(step, index) in getValueStreamSteps.slice(1)" :key="index" class="pdf-content-item">
                <div class="value-stream-step">
                    <h3>{{ getLevelRangeTitle(step.levels) }}</h3>
                    <div class="step-levels">
                        <span v-for="level in step.levels" :key="level" class="level-badge">
                            Level {{ level }}
                        </span>
                    </div>
                    <div class="step-description">
                        <p>{{ step.description }}</p>
                    </div>
                    <div class="step-actors">
                        <div v-for="actor in step.actors" :key="actor.name" class="actor-group">
                            <h4>{{ actor.name }}</h4>
                            <ul>
                                <li v-for="event in actor.events" :key="event.name">
                                    <strong>{{ event.displayName }}</strong>: {{ event.description }}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 바운디드 컨텍스트 정의 -->
        <div v-if="selectedSections.boundedContext" class="section">
            <div class="pdf-content-item">
                <h2>{{ sectionNumbers.boundedContext }}. {{ $t('DocumentTemplate.sections.boundedContext') }}</h2>
                
                <!-- 분해 기준과 분해 결과를 하나의 pdf-content-item에 포함 -->
                <div class="section-content">
                    <!-- 분해 기준 -->
                    <h3>{{ sectionNumbers.boundedContext }}-1. {{ $t('DocumentTemplate.boundedContext.decompositionCriteria') }}</h3>
                    <div v-if="generationOption" class="criteria-section">
                    <!-- BCGenerationOption의 체크박스 UI를 가져옴 -->
                    <div v-for="(aspect, index) in generationOption.selectedAspects" :key="`card-${index}`">
                        <v-card
                            class="mb-2"
                            outlined
                        >
                            <v-card-text>
                                <v-row class="ma-0 pa-0">
                                    <span class="font-weight-bold">{{ aspect }}</span>
                                </v-row>
                                <p>{{ getAspectDescription(aspect) }}</p>

                                <!-- 추가 입력 필드가 있는 경우 표시 -->
                                <v-row v-if="hasAspectDetails(aspect) && generationOption.aspectDetails[getAspectKey(aspect)]"
                                    class="ma-0 mt-3"
                                >
                                    <v-col cols="12" class="pa-0">
                                        <p class="mb-0">{{ generationOption.aspectDetails[getAspectKey(aspect)] }}</p>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </div>

                    <!-- 추가 요구사항이 있는 경우 표시 -->
                    <v-card v-if="generationOption.additionalOptions" class="mt-4" outlined>
                        <v-card-text>
                            <div class="font-weight-bold mb-2">{{ $t('DocumentTemplate.bcGenerationOption.additionalRequirements') }}:</div>
                            <p class="mb-0">{{ generationOption.additionalOptions }}</p>
                        </v-card-text>
                    </v-card>
                </div>

                    <!-- 분해 결과 -->
                    <h3>{{ sectionNumbers.boundedContext }}-2. {{ $t('DocumentTemplate.boundedContext.decompositionResults') }}</h3>
                    <div style="text-align: center;">
                        <vue-mermaid
                            :id="`mermaid-${renderKey}`"
                            :key="`mermaid-${renderKey}`"
                            :nodes="mermaidNodes"
                            type="graph TD"
                            :config="mermaidConfig"
                        ></vue-mermaid>
                    </div>
                </div>
            </div>
        </div>

        <!-- 바운디드 컨텍스트 추가정보 -->
        <div v-if="selectedSections.boundedContext" class="section">
            <div class="pdf-content-item">
                <h3>{{ sectionNumbers.boundedContext }}-3. {{ $t('DocumentTemplate.boundedContext.details') }}</h3>
                <div class="section-content" v-if="selectedBoundedContext">
                    <!-- 컨텍스트 맵 -->
                    <h3>{{ $t('DocumentTemplate.boundedContext.contextStrategyMap') }}</h3>
                    <div style="text-align: center;">
                        <BoundedContextMatrix 
                            :boundedContexts="selectedBoundedContext.boundedContexts" 
                        />
                    </div>

                    <!-- 분해 이유 -->
                    <h3>{{ $t('DocumentTemplate.boundedContext.decompositionRationale') }}</h3>
                    <p>{{ selectedBoundedContext.thoughts }}</p>
                </div>
            </div>

            <!-- 상세 정보 테이블을 별도의 pdf-content-item으로 분리 -->
            <div class="pdf-content-item" v-if="selectedBoundedContext">
                <!-- 바운디드 컨텍스트 상세 정보 -->
                <h3>{{ sectionNumbers.boundedContext }}-4. {{ $t('DocumentTemplate.boundedContext.details') }}</h3>
                <v-simple-table class="bounded-context-table">
                    <thead>
                        <tr>
                            <th>{{ $t('DocumentTemplate.boundedContext.boundedContext') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.role') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.importance') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.implementationStrategy') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="bc in selectedBoundedContext.boundedContexts" :key="bc.name">
                            <td>{{ bc.alias }}</td>
                            <td>{{ bc.role }}</td>
                            <td>{{ bc.importance }}</td>
                            <td>{{ bc.implementationStrategy }}</td>
                        </tr>
                    </tbody>
                </v-simple-table>

                <!-- 컨텍스트 간 관계 -->
                <h3>{{ $t('DocumentTemplate.boundedContext.contextRelationships') }}</h3>
                <v-simple-table class="relations-table">
                    <thead>
                        <tr>
                            <th>{{ $t('DocumentTemplate.boundedContext.sourceContext') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.targetContext') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.relationshipType') }}</th>
                            <th>{{ $t('DocumentTemplate.boundedContext.interactionPattern') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(relation, index) in selectedBoundedContext.explanations" :key="index">
                            <td>{{ relation.sourceContext }}</td>
                            <td>{{ relation.targetContext }}</td>
                            <td>{{ relation.relationType }}</td>
                            <td>{{ relation.interactionPattern }}</td>
                        </tr>
                    </tbody>
                </v-simple-table>
            </div>
        </div>

        <!-- 애그리거트 설계 섹션 -->
        <div v-if="selectedSections.aggregateDesign" class="section">
            <!-- 섹션 제목과 설명 -->
            <div class="cover-section-title pdf-content-item" v-if="getAggregateDrafts.length > 0">
                <div class="main-title">{{ sectionNumbers.aggregateDesign }}. {{ $t('DocumentTemplate.sections.aggregateDesign') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.aggregateDesign.defineAggregates') }}<br>{{ $t('DocumentTemplate.aggregateDesign.ensureBusinessInvariants') }}<br>{{ $t('DocumentTemplate.aggregateDesign.identifyKeyCommands') }}</div>
            </div>

            <div v-for="(draft, index) in getAggregateDrafts" :key="`draft-${index}`">
                <!-- 4-1. 애그리거트 모델 -->
                <div class="pdf-content-item">
                    <h3>{{ sectionNumbers.aggregateDesign }}-1. {{ $t('DocumentTemplate.aggregateDesign.boundedContext') }}: {{ draft.boundedContextAlias }} - {{ $t('DocumentTemplate.aggregateDesign.model') }}</h3>
                    <div v-for="(option, optionIndex) in draft.options" :key="`option-${index}-${optionIndex}`" class="mermaid-container">
                        <vue-mermaid-string
                            :id="`aggregate-mermaid-${index}-${optionIndex}`"
                            :key="getAggregateMermaidRenderKey(index, optionIndex)"
                            :value="getAggregateMermaidNodes(option.structure, index, optionIndex)"
                        />
                    </div>
                </div>

                <!-- 4-2. 애그리거트 분석 -->
                <div class="pdf-content-item">
                    <h3>{{ sectionNumbers.aggregateDesign }}-2. {{ $t('DocumentTemplate.aggregateDesign.boundedContext') }}: {{ draft.boundedContextAlias }} - {{ $t('DocumentTemplate.aggregateDesign.analysis') }}</h3>
                    <div v-for="(option, optionIndex) in draft.options" :key="`analysis-${index}-${optionIndex}`">
                        <v-simple-table dense class="pros-cons-table">
                            <thead>
                                <tr>
                                    <th>{{ $t('DocumentTemplate.aggregateDesign.item') }}</th>
                                    <th>{{ $t('DocumentTemplate.aggregateDesign.pro') }}</th>
                                    <th>{{ $t('DocumentTemplate.aggregateDesign.con') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="key in Object.keys(option.pros)" :key="key">
                                    <td class="font-weight-bold" style="width: 120px;">{{ key }}</td>
                                    <td>{{ option.pros[key] }}</td>
                                    <td>{{ option.cons[key] }}</td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </div>
                </div>

                <!-- 4-3. 설계 기준 -->
                <div v-for="(option, optionIndex) in draft.options" :key="`criteria-${index}-${optionIndex}`">
                    <template v-if="option.analysisResult && getDesignCriteriaCombined(option.analysisResult).length > 0">
                        <div v-for="(chunk, chunkIndex) in splitTableRows(getDesignCriteriaCombined(option.analysisResult))" :key="`criteria-chunk-${chunkIndex}`" class="pdf-content-item">
                            <h3 v-if="chunkIndex === 0">{{ sectionNumbers.aggregateDesign }}-3. {{ $t('DocumentTemplate.aggregateDesign.boundedContext') }}: {{ draft.boundedContextAlias }} - {{ $t('DocumentTemplate.aggregateDesign.designCriteria') }}</h3>
                            <div v-if="chunk.some(i => i.type === 'rule')">
                                <h4 class="section-title">{{ $t('DocumentTemplate.aggregateDesign.businessRules') }}</h4>
                                <v-simple-table dense class="rules-table">
                                    <thead>
                                        <tr>
                                            <th>{{ $t('DocumentTemplate.aggregateDesign.ruleName') }}</th>
                                            <th>{{ $t('DocumentTemplate.aggregateDesign.description') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="rule in chunk.filter(i => i.type === 'rule')" :key="rule.name">
                                            <td class="font-weight-bold" style="width: 150px;">{{ rule.name }}</td>
                                            <td>{{ rule.description }}</td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </div>
                            <div v-if="chunk.some(i => i.type === 'entityProp')">
                                <h4 class="section-title">{{ $t('DocumentTemplate.aggregateDesign.entityDefinitions') }}</h4>
                                <div v-for="entityName in getEntitiesInChunk(chunk)" :key="entityName" class="entity-section">
                                    <h5 class="entity-name">{{ entityName }}</h5>
                                    <v-simple-table dense class="entity-table">
                                        <thead>
                                            <tr>
                                                <th>{{ $t('DocumentTemplate.aggregateDesign.field') }}</th>
                                                <th>{{ $t('DocumentTemplate.aggregateDesign.type') }}</th>
                                                <th>{{ $t('DocumentTemplate.aggregateDesign.required') }}</th>
                                                <th>{{ $t('DocumentTemplate.aggregateDesign.note') }}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="prop in chunk.filter(i => i.type === 'entityProp' && i.entityName === entityName)" :key="prop.name">
                                                <td>{{ prop.name }}</td>
                                                <td>{{ prop.type }}</td>
                                                <td>{{ prop.required ? 'Y' : 'N' }}</td>
                                                <td>
                                                    <span v-if="prop.isPrimaryKey">{{ $t('DocumentTemplate.aggregateDesign.primaryKey') }}</span>
                                                    <span v-if="prop.foreignEntity">{{ $t('DocumentTemplate.aggregateDesign.fk') }} ({{ prop.foreignEntity }})</span>
                                                    <span v-if="prop.values">{{ prop.values.join(', ') }}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-simple-table>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- 이벤트스토밍 모델 섹션 -->
        <div v-if="selectedSections.eventStorming" class="section">
            <!-- 섹션 제목과 설명 -->
            <div class="cover-section-title pdf-content-item" v-if="getEventStormingModels.length > 0">
                <div class="main-title">{{ sectionNumbers.eventStorming }}. {{ $t('DocumentTemplate.sections.eventStorming') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.eventStorming.modelSystemBehavior') }}<br>{{ $t('DocumentTemplate.eventStorming.basedOnDerived') }}<br>{{ $t('DocumentTemplate.eventStorming.visuallyOrganize') }}</div>
            </div>

            <!-- 각 모델별 페이지 -->
            <div v-for="(model, modelIndex) in getEventStormingModels" :key="`model-${modelIndex}`">
                <div v-for="(bc, bcIndex) in model.BoundedContexts" :key="`bc-${modelIndex}-${bcIndex}`">
                    <!-- 바운디드 컨텍스트 제목 -->
                    <div v-for="(chunk, chunkIndex) in splitTableRows(getCombinedTableData(bc))" :key="`combined-chunk-${chunkIndex}`" class="pdf-content-item">
                        <h3>{{ sectionNumbers.eventStorming }}-{{ bcIndex + 1 }}. {{ $t('DocumentTemplate.eventStorming.model') }}: {{ model.modelName }} - {{ $t('DocumentTemplate.eventStorming.boundedContext') }}: {{ bc.name }}</h3>
                        <!-- 타입별로 분류하여 테이블 헤더와 함께 렌더링 -->
                        <div v-if="chunk.filter(i => i.type === 'aggregate').length">
                            <h4>{{ $t('DocumentTemplate.eventStorming.aggregate') }}</h4>
                            <v-simple-table dense class="component-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('DocumentTemplate.eventStorming.name') }}</th>
                                        <th>{{ $t('DocumentTemplate.eventStorming.description') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in chunk.filter(i => i.type === 'aggregate')" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.description || item.displayName }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </div>
                        <div v-if="chunk.filter(i => i.type === 'command').length">
                            <h4>{{ $t('DocumentTemplate.eventStorming.commands') }}</h4>
                            <v-simple-table dense class="component-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('DocumentTemplate.eventStorming.name') }}</th>
                                        <th>{{ $t('DocumentTemplate.eventStorming.description') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in chunk.filter(i => i.type === 'command')" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.description || item.displayName }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </div>
                        <div v-if="chunk.filter(i => i.type === 'event').length">
                            <h4>{{ $t('DocumentTemplate.eventStorming.events') }}</h4>
                            <v-simple-table dense class="component-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('DocumentTemplate.eventStorming.name') }}</th>
                                        <th>{{ $t('DocumentTemplate.eventStorming.description') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in chunk.filter(i => i.type === 'event')" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.description || item.displayName }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </div>
                        <div v-if="chunk.filter(i => i.type === 'policy').length">
                            <h4>{{ $t('DocumentTemplate.eventStorming.policies') }}</h4>
                            <v-simple-table dense class="component-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('DocumentTemplate.eventStorming.name') }}</th>
                                        <th>{{ $t('DocumentTemplate.eventStorming.description') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in chunk.filter(i => i.type === 'policy')" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.description || item.displayName }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </div>
                        <div v-if="chunk.filter(i => i.type === 'readModel').length">
                            <h4>{{ $t('DocumentTemplate.eventStorming.readModels') }}</h4>
                            <v-simple-table dense class="component-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('DocumentTemplate.eventStorming.name') }}</th>
                                        <th>{{ $t('DocumentTemplate.eventStorming.description') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in chunk.filter(i => i.type === 'readModel')" :key="item.id">
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.description || item.displayName }}</td>
                                    </tr>
                                </tbody>
                            </v-simple-table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 애그리게잇 상세 정보 섹션 -->
        <div v-if="selectedSections.aggregateDetail" class="section">
            <!-- 섹션 제목과 설명 -->
            <div class="cover-section-title pdf-content-item" v-if="getEventStormingModels.length > 0">
                <div class="main-title">{{ sectionNumbers.aggregateDetail }}. {{ $t('DocumentTemplate.sections.aggregateDetail') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.aggregateDetail.defineDetailedStructure') }}<br>{{ $t('DocumentTemplate.aggregateDetail.propertiesRelationships') }}<br>{{ $t('DocumentTemplate.aggregateDetail.domainRules') }}</div>
            </div>

            <!-- 각 바운디드 컨텍스트별 애그리게잇 정보 -->
            <div v-for="(model, modelIndex) in getEventStormingModels" :key="`model-${modelIndex}`">
                <div v-for="(bc, bcIndex) in model.BoundedContexts" :key="`bc-${modelIndex}-${bcIndex}`">
                    <div v-for="agg in bc.aggregate" :key="`agg-${bcIndex}-${agg.id}`">
                        <!-- 애그리게잇 제목 -->
                        <div class="pdf-content-item">
                            <h3>{{ $t('DocumentTemplate.aggregateDetail.boundedContext') }}: {{ bc.name }} - {{ $t('DocumentTemplate.aggregateDetail.aggregate') }}: {{ agg.name }}</h3>
                            
                            <!-- 모든 테이블 데이터를 하나의 배열로 합치기 -->
                            <template v-if="getAggregateDetailData(agg).length > 0">
                                <div v-for="(chunk, chunkIndex) in splitTableRows(getAggregateDetailData(agg))" :key="`detail-chunk-${chunkIndex}`">
                                    <!-- 애그리게잇 루트 필드 정보 -->
                                    <div v-if="chunk.some(item => item.type === 'rootField')">
                                        <h4>{{ $t('DocumentTemplate.aggregateDetail.aggregateRootFieldInformation') }}</h4>
                                        <v-simple-table dense class="field-table">
                                            <thead>
                                                <tr>
                                                    <th>{{ $t('DocumentTemplate.aggregateDetail.fieldName') }}</th>
                                                    <th>{{ $t('DocumentTemplate.aggregateDetail.type') }}</th>
                                                    <th>{{ $t('DocumentTemplate.aggregateDetail.key') }}</th>
                                                    <th>{{ $t('DocumentTemplate.aggregateDetail.description') }}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="field in chunk.filter(i => i.type === 'rootField')" :key="field.name">
                                                    <td>{{ field.name }}</td>
                                                    <td>{{ field.className }}</td>
                                                    <td>{{ field.isKey ? 'Yes' : 'No' }}</td>
                                                    <td>
                                                        <span v-if="field.referenceClass">{{ $t('DocumentTemplate.aggregateDetail.reference') }}: {{ field.referenceClass }}</span>
                                                        <span v-else-if="field.displayName">{{ field.displayName }}</span>
                                                        <span v-else>-</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </v-simple-table>
                                    </div>

                                    <!-- 엔티티 정보 -->
                                    <div v-if="chunk.some(item => item.type === 'entity')">
                                        <h4>{{ $t('DocumentTemplate.aggregateDetail.entityInformation') }}</h4>
                                        <div v-for="entity in chunk.filter(i => i.type === 'entity')" :key="entity.id" class="entity-detail">
                                            <div class="entity-header">
                                                <strong>{{ entity.name }}</strong>
                                                <span v-if="entity.displayName" class="entity-display-name">
                                                    ({{ entity.displayName }})
                                                </span>
                                            </div>
                                            <v-simple-table dense class="field-table">
                                                <thead>
                                                    <tr>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.fieldName') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.type') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.key') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.description') }}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="prop in entity.properties" :key="prop.name">
                                                        <td>{{ prop.name }}</td>
                                                        <td>{{ prop.type }}</td>
                                                        <td>{{ prop.required ? 'Y' : 'N' }}</td>
                                                        <td>
                                                            <span v-if="prop.isPrimaryKey">{{ $t('DocumentTemplate.aggregateDetail.primaryKey') }}</span>
                                                            <span v-if="prop.foreignEntity">{{ $t('DocumentTemplate.aggregateDetail.fk') }} ({{ prop.foreignEntity }})</span>
                                                            <span v-if="prop.values">{{ prop.values.join(', ') }}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </v-simple-table>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VueMermaid from '@/components/VueMermaid.vue';
import VueMermaidString from 'vue-mermaid-string';
import BoundedContextMatrix from '@/components/designer/modeling/generators/BoundedContextMatrix.vue';
import BpmnUengineViewer from '@/components/designer/bpmnModeling/bpmn/BpmnUengineViewer.vue';
import EventStormingModelCanvas from '@/components/designer/es-modeling/EventStormingModelCanvas.vue';

export default {
    name: 'DocumentTemplate',
    components: {
        VueMermaid,
        VueMermaidString,
        BoundedContextMatrix,
        BpmnUengineViewer,
        EventStormingModelCanvas
    },
    props: {
        projectInfo: {
            type: Object,
            required: true
        },
        cachedModels: {
            type: Object,
            required: true
        },
        eventStormingModels: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            renderKey: 0,
            mermaidConfig: {
                theme: 'default',
                startOnLoad: false,
                securityLevel: 'loose',
                flowchart: {
                    htmlLabels: true,
                    curve: 'basis',
                    rankSpacing: 100,
                    nodeSpacing: 100,
                    padding: 15
                },
                themeVariables: {
                    'groupBkgColor': '#fff',
                    'groupBorderColor': '#666',
                    'groupBorderWidth': '2px',
                    'groupPadding': 20
                }
            },
            mermaidDtos: {},
            bpmXml: null,
            selectedSections: {
                userScenario: false,
                valueStream: true,
                boundedContext: true,
                aggregateDesign: true,
                eventStorming: true,
                aggregateDetail: true
            }
        }
    },
    computed: {
        getProcessAnalysisMessages() {
            if (!this.projectInfo.draft) return [];
            return this.projectInfo.draft.filter(msg => msg.type === 'processAnalysis');
        },

        groupedActors() {
            const actors = [];
            this.getProcessAnalysisMessages.forEach(message => {
                if (message.content && message.content.analysisResult) {
                    actors.push(...message.content.analysisResult.actors);
                }
            });

            // 레인 번호로 정렬
            actors.sort((a, b) => a.lane - b.lane);

            // 레인 번호 기준으로 그룹화 (0-4, 5-9, ...)
            const groups = [];
            const groupSize = 7;
            const maxLane = Math.max(...actors.map(actor => actor.lane));
            
            for (let startLane = 0; startLane <= maxLane; startLane += groupSize) {
                const groupActors = actors.filter(actor => 
                    actor.lane >= startLane && actor.lane < startLane + groupSize
                );
                if (groupActors.length > 0) {
                    groups.push(groupActors);
                }
            }
            
            return groups;
        },

        formattedUserStory() {
            if (!this.projectInfo || !this.projectInfo.userStory) return [];
            
            // 원본 텍스트를 그대로 유지
            const text = this.projectInfo.userStory;
            
            // 빈 줄을 기준으로 문단 분리 (줄바꿈 2개 이상)
            return text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        },

        chunkedUserStory() {
            if (!this.formattedUserStory) return [];
            
            const chunks = [];
            const TARGET_LENGTH = 1500;
            
            let currentChunk = [];
            let currentLength = 0;
            
            for (const paragraph of this.formattedUserStory) {
                // 현재 문단의 길이가 TARGET_LENGTH를 초과하는 경우
                if (paragraph.length > TARGET_LENGTH) {
                    // 현재 청크에 내용이 있으면 먼저 저장
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk);
                        currentChunk = [];
                        currentLength = 0;
                    }
                    
                    // 긴 문단을 문장 단위로 분할
                    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
                    let currentSentences = [];
                    let sentenceLength = 0;
                    
                    for (const sentence of sentences) {
                        if (sentenceLength + sentence.length > TARGET_LENGTH) {
                            if (currentSentences.length > 0) {
                                chunks.push([currentSentences.join('')]);
                                currentSentences = [];
                                sentenceLength = 0;
                            }
                        }
                        currentSentences.push(sentence);
                        sentenceLength += sentence.length;
                    }
                    
                    if (currentSentences.length > 0) {
                        currentChunk = [currentSentences.join('')];
                        currentLength = sentenceLength;
                    }
                }
                // 일반적인 경우
                else {
                    // 현재 청크에 추가했을 때 너무 길어지면 새로운 청크 시작
                    if (currentLength + paragraph.length > TARGET_LENGTH) {
                        chunks.push(currentChunk);
                        currentChunk = [];
                        currentLength = 0;
                    }
                    
                    currentChunk.push(paragraph);
                    currentLength += paragraph.length;
                }
            }
            
            // 마지막 청크 추가
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
            
            return chunks;
        },

        selectedBoundedContext() {
            if (!this.projectInfo.draft) return null;
            
            const boundedContextResult = this.projectInfo.draft.find(
                msg => msg.type === 'boundedContextResult'
            );
            
            if (!boundedContextResult) return null;
            
            // 선택된 관점의 결과 반환
            return boundedContextResult.result[boundedContextResult.selectedAspect];
        },

        mermaidNodes() {
            if (!this.selectedBoundedContext) return [];

            const nodes = [];
            const boundedContexts = this.selectedBoundedContext.boundedContexts || [];
            const relations = this.selectedBoundedContext.relations || [];
            
            // 도메인 타입별로 그룹화
            const domainGroups = {
                'Core Domain': [],
                'Supporting Domain': [],
                'Generic Domain': []
            };

            // 노드 생성 및 그룹화
            boundedContexts.forEach((bc, index) => {
                const node = {
                    id: `BC${index}`,
                    text: bc.alias.replace(/·/g, '/').replace(/\./g, '/'),
                    editable: true,
                    edgeType: 'stadium',
                    style: this.getDomainStyle(bc.importance),
                    group: bc.importance || 'Generic Domain',
                    next: [],
                    link: []
                };
                nodes.push(node);
                
                if (bc.importance && domainGroups[bc.importance]) {
                    domainGroups[bc.importance].push(node);
                } else {
                    domainGroups['Generic Domain'].push(node);
                }
            });
            
            // 관계 정보 추가
            relations.forEach((rel) => {
                const sourceIndex = boundedContexts.findIndex(bc => bc.name === rel.upStream.name);
                const targetIndex = boundedContexts.findIndex(bc => bc.name === rel.downStream.name);
                
                if (sourceIndex !== -1 && targetIndex !== -1) {
                    const sourceNode = nodes[sourceIndex];
                    sourceNode.next.push(`BC${targetIndex}`);
                    sourceNode.link.push(`-->|"${rel.type}"|`);
                }
            });

            this.$nextTick(() => {
                this.renderKey++;
            });
            return nodes;
        },

        generationOption() {
            if (!this.projectInfo.draft) return null;
            
            const option = this.projectInfo.draft.find(
                msg => msg.type === 'bcGenerationOption'
            );
            
            return option ? option.generateOption : null;
        },

        getAggregateDrafts() {
            if (!this.projectInfo.draft) return [];
            
            const aggregateDraftMessages = this.projectInfo.draft.filter(msg => msg.type === 'aggregateDraftDialogDto');
            if (aggregateDraftMessages.length === 0) return [];

            const drafts = [];
            
            const aggregateDrafts = aggregateDraftMessages[0].selectedOptionItem;
            for (const [key, value] of Object.entries(aggregateDrafts)) {
                if (key === 'type') continue;
                
                let option = aggregateDraftMessages[0].draftOptions.find(option => option.boundedContext === key);
                if (value && value.boundedContext) {
                    drafts.push({
                        boundedContextAlias: value.boundedContext.alias || key,
                        options: [
                            {
                                structure: value.structure,
                                pros: value.pros,
                                cons: value.cons,
                                analysisResult: option.analysisResult
                            }
                        ]
                    });
                }
            }

            return drafts;
        },

        getEventStormingModels() {
            // 1. eventStormingModels가 존재하는지 체크
            if (!this.eventStormingModels) {
                return [];
            }

            // 2. 배열로 변환
            const modelArray = Array.isArray(this.eventStormingModels) 
                ? this.eventStormingModels 
                : Object.values(this.eventStormingModels);

            return modelArray.map(model => {
                // 3. 필요한 데이터가 있는지 체크
                if (!model || !model.information || !model.models) {
                    return null;
                }

                // 4. elements가 배열인지 확인하고 변환
                const elements = Array.isArray(model.models.elements) 
                    ? model.models.elements 
                    : Object.values(model.models.elements || {});

                // 5. BoundedContext 필터링 및 매핑
                const boundedContexts = elements
                    .filter(element => element && element._type.includes('BoundedContext'))
                    .map(bc => {
                        return {
                            id: bc.id,
                            name: bc.name,
                            aggregate: elements.filter(
                                element => element && element._type.includes('Aggregate') && element.boundedContext.id === bc.id
                            ),
                            command: elements.filter(
                                element => element && element._type.includes('Command') && element.boundedContext.id === bc.id
                            ),
                            event: elements.filter(
                                element => element && element._type.includes('Event') && element.boundedContext.id === bc.id
                            ),
                            policy: elements.filter(
                                element => element && element._type.includes('Policy') && element.boundedContext.id === bc.id
                            ),
                            actor: elements.filter(
                                element => element && element._type.includes('Actor') && element.boundedContext.id === bc.id
                            ),
                            policy: elements.filter(
                                element => element && element._type.includes('Policy') && element.boundedContext.id === bc.id
                            ),
                            readModel: elements.filter(
                                element => element && element._type.includes('View') && element.boundedContext.id === bc.id
                            )
                        };
                    });

                // 6. 결과 반환
                return {
                    modelName: model.information.projectName,
                    BoundedContexts: boundedContexts
                };
            }).filter(Boolean); // null 값 제거
        },
        sectionNumbers() {
            const numbers = {};
            let currentNumber = 1;

            if (this.selectedSections.userScenario) {
                numbers.userScenario = currentNumber++;
            }
            if (this.selectedSections.valueStream) {
                numbers.valueStream = currentNumber++;
            }
            if (this.selectedSections.boundedContext) {
                numbers.boundedContext = currentNumber++;
            }
            if (this.selectedSections.aggregateDesign) {
                numbers.aggregateDesign = currentNumber++;
            }
            if (this.selectedSections.eventStorming) {
                numbers.eventStorming = currentNumber++;
            }
            if (this.selectedSections.aggregateDetail) {
                numbers.aggregateDetail = currentNumber++;
            }

            return numbers;
        },
        getValueStreamSteps() {
            if (!this.projectInfo.draft) return [];
            const processAnalysis = this.projectInfo.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];

            const { events } = processAnalysis.content.analysisResult;
            
            // 이벤트를 level별로 그룹화
            const levelGroups = {};
            events.forEach(event => {
                if (!levelGroups[event.level]) {
                    levelGroups[event.level] = [];
                }
                levelGroups[event.level].push(event);
            });

            // level 순서대로 정렬
            const sortedLevels = Object.keys(levelGroups).sort((a, b) => Number(a) - Number(b));

            // 페이지당 최대 이벤트 수
            const MAX_EVENTS_PER_PAGE = 5;
            const steps = [];
            let currentStep = {
                levels: [],
                events: [],
                actors: new Map()
            };

            // 각 level을 순회하면서 페이지 구성
            for (let i = 0; i < sortedLevels.length; i++) {
                const level = sortedLevels[i];
                const levelEvents = levelGroups[level];
                const nextLevel = sortedLevels[i + 1];
                const nextLevelEvents = nextLevel ? levelGroups[nextLevel] : [];

                // 현재 레벨의 이벤트 수가 MAX_EVENTS_PER_PAGE를 초과하는 경우
                if (levelEvents.length > MAX_EVENTS_PER_PAGE) {
                    // 현재 페이지가 비어있지 않다면 저장
                    if (currentStep.events.length > 0) {
                        steps.push({
                            levels: [...currentStep.levels],
                            description: this.generateStepDescription(currentStep.events),
                            actors: Array.from(currentStep.actors.entries()).map(([name, events]) => ({
                                name,
                                events
                            }))
                        });
                        currentStep = {
                            levels: [],
                            events: [],
                            actors: new Map()
                        };
                    }

                    // 현재 레벨의 이벤트를 여러 페이지로 나누기
                    for (let j = 0; j < levelEvents.length; j += MAX_EVENTS_PER_PAGE) {
                        const chunkEvents = levelEvents.slice(j, j + MAX_EVENTS_PER_PAGE);
                        const chunkActors = new Map();
                        
                        chunkEvents.forEach(event => {
                            if (!chunkActors.has(event.actor)) {
                                chunkActors.set(event.actor, []);
                            }
                            chunkActors.get(event.actor).push(event);
                        });

                        steps.push({
                            levels: [Number(level)],
                            description: this.generateStepDescription(chunkEvents),
                            actors: Array.from(chunkActors.entries()).map(([name, events]) => ({
                                name,
                                events
                            }))
                        });
                    }
                    continue;
                }

                // 현재 페이지에 추가할 수 있는지 확인
                if (currentStep.events.length + levelEvents.length <= MAX_EVENTS_PER_PAGE) {
                    // 현재 페이지에 추가
                    currentStep.levels.push(Number(level));
                    currentStep.events.push(...levelEvents);
                    
                    // 액터별로 이벤트 그룹화
                    levelEvents.forEach(event => {
                        if (!currentStep.actors.has(event.actor)) {
                            currentStep.actors.set(event.actor, []);
                        }
                        currentStep.actors.get(event.actor).push(event);
                    });
                } else {
                    // 현재 페이지가 가득 찼으면 저장하고 새 페이지 시작
                    if (currentStep.events.length > 0) {
                        steps.push({
                            levels: [...currentStep.levels],
                            description: this.generateStepDescription(currentStep.events),
                            actors: Array.from(currentStep.actors.entries()).map(([name, events]) => ({
                                name,
                                events
                            }))
                        });
                    }
                    
                    // 새 페이지 시작
                    currentStep = {
                        levels: [Number(level)],
                        events: [...levelEvents],
                        actors: new Map()
                    };
                    
                    // 액터별로 이벤트 그룹화
                    levelEvents.forEach(event => {
                        if (!currentStep.actors.has(event.actor)) {
                            currentStep.actors.set(event.actor, []);
                        }
                        currentStep.actors.get(event.actor).push(event);
                    });
                }
            }

            // 마지막 페이지 추가
            if (currentStep.events.length > 0) {
                steps.push({
                    levels: currentStep.levels,
                    description: this.generateStepDescription(currentStep.events),
                    actors: Array.from(currentStep.actors.entries()).map(([name, events]) => ({
                        name,
                        events
                    }))
                });
            }

            return steps;
        }
    },
    mounted() {
        this.generateBPMN();
        console.log(this.bpmXml);
    },
    methods: {
        getDomainStyle(importance) {
            const colors = {
                'Core Domain': 'fill:#8fbcaa,stroke:#333,stroke-width:2px',
                'Supporting Domain': 'fill:#b39ddb,stroke:#333,stroke-width:2px',
                'Generic Domain': 'fill:#9e9e9e,stroke:#333,stroke-width:2px'
            };
            return colors[importance] || 'fill:#ddd,stroke:#333,stroke-width:2px';
        },

        getAspectDescription(aspect) {
            const descriptions = {
                [this.$t('DevideBoundedContextDialog.domainAspect')]: 
                    this.$t('BCGenerationOption.domainAspectDescription'),
                [this.$t('DevideBoundedContextDialog.processAspect')]: 
                    this.$t('BCGenerationOption.processAspectDescription'),
                [this.$t('DevideBoundedContextDialog.organizationalAspect')]: 
                    this.$t('BCGenerationOption.organizationalAspectDescription'),
                [this.$t('DevideBoundedContextDialog.personaAspect')]: 
                    this.$t('BCGenerationOption.personaAspectDescription'),
                [this.$t('DevideBoundedContextDialog.transactionPerformanceAspect')]: 
                    this.$t('BCGenerationOption.transactionPerformanceAspectDescription'),
                [this.$t('DevideBoundedContextDialog.infrastructureAspect')]: 
                    this.$t('BCGenerationOption.infrastructureAspectDescription')
            };
            return descriptions[aspect] || '';
        },

        hasAspectDetails(aspect) {
            return aspect === this.$t('DevideBoundedContextDialog.organizationalAspect') ||
                aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect');
        },

        getAspectKey(aspect) {
            if(aspect === this.$t('DevideBoundedContextDialog.organizationalAspect')){
                return 'organizationalAspect';
            }else if(aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect')){
                return 'infrastructureAspect';
            }
        },

        getAggregateMermaidNodes(structure, index, optionIndex) {
            const key = `${index}-${optionIndex}`;
            if (!this.mermaidDtos[key]) {
                this.mermaidDtos[key] = {
                    mermaidString: '',
                    renderKey: 0
                };
            }

            const initConfig = {
                theme: "default",
                themeVariables: {
                    fontSize: "14px"
                }
            };
            let config = "%%{init: " + JSON.stringify(initConfig) + "}%%\n";
            let mermaidString = config + "graph TD\n";
            
            if (!structure || !Array.isArray(structure)) {
                mermaidString += "None[None]\n";
                return mermaidString;
            }
            
            const groups = {}; 
            const relSet = new Set(); 
            
            const getValidAlias = (alias) => {
                return alias.replace(/[^a-zA-Z0-9가-힣_]/g, '');
            }
            
            const addClassToGroup = (groupKey, classId, label, role) => {
                if (!groups[groupKey]) {
                    groups[groupKey] = { id: groupKey, label: label, classes: {} };
                }
                if (!groups[groupKey].classes[classId]) {
                    groups[groupKey].classes[classId] = { id: classId, label: label, role: role };
                } else if (role === "Aggregate Root" && groups[groupKey].classes[classId].role !== "Aggregate Root") {
                    groups[groupKey].classes[classId].role = "Aggregate Root";
                }
            };

            structure.forEach(item => {
                if (item.aggregate && item.aggregate.alias) {
                    const aggAlias = item.aggregate.alias;
                    const aggKey = getValidAlias(aggAlias);
                    addClassToGroup(aggKey, aggKey, aggAlias, "Aggregate Root");
                    
                    if (Array.isArray(item.enumerations)) {
                        item.enumerations.forEach(enumeration => {
                            if (!enumeration.alias) return;
                            const enumKey = getValidAlias(enumeration.alias);
                            addClassToGroup(aggKey, enumKey, enumeration.alias, "Enumeration");   
                            relSet.add(`    ${aggKey} --> ${enumKey}`);
                        });
                    }
                    
                    if (Array.isArray(item.valueObjects)) {
                        item.valueObjects.forEach(vo => {
                            if (!vo.alias) return;
                            const voKey = getValidAlias(vo.alias);
                            addClassToGroup(aggKey, voKey, vo.alias, "Value Object");
                            relSet.add(`    ${aggKey} --> ${voKey}`);
                            
                            if (vo.referencedAggregate && vo.referencedAggregate.alias) {
                                const refAggAlias = vo.referencedAggregate.alias;
                                const refAggKey = getValidAlias(refAggAlias);
                                addClassToGroup(refAggKey, refAggKey, refAggAlias, "Aggregate Root");
                                
                                if (aggKey !== refAggKey) {
                                    relSet.add(`    ${voKey} --> ${refAggKey}`);
                                }
                            }
                        });
                    }
                }
            });
            
            // 노드 정의에는 들여쓰기 없이
            Object.values(groups).forEach(group => {
                mermaidString += `subgraph ${group.id} \n`;
                Object.values(group.classes).forEach(cls => {
                    mermaidString += `${cls.id}[-${cls.role}-<br/>${cls.id}]\n`;  // 들여쓰기 제거
                });
                mermaidString += `end\n`;
            });
            
            // 관계 정의에만 들여쓰기 유지
            relSet.forEach(rel => {
                mermaidString += `${rel}\n`;  // 이미 relSet에 들여쓰기가 포함되어 있음
            });

            this.mermaidDtos[key].mermaidString = mermaidString;
            this.mermaidDtos[key].renderKey++;
            
            return this.mermaidDtos[key].mermaidString;
        },

        getAggregateMermaidRenderKey(index, optionIndex) {
            const key = `${index}-${optionIndex}`;
            return this.mermaidDtos[key] ? this.mermaidDtos[key].renderKey : 0;
        },

        generateBPMN() {
            let analysisResult = this.getProcessAnalysisMessages[0].content.analysisResult;

            if (!analysisResult || !analysisResult.actors || !analysisResult.events) {
                this.bpmXml = null;
                return;
            }
            const { actors, events } = analysisResult;

            // 1. 이벤트를 레벨 순서대로 정렬
            const eventsByLevel = [...events].sort((a, b) => a.level - b.level);

            // 2. 각 액터별로 이벤트를 level 순서대로 정렬
            const actorEventMap = {};
            actors.forEach(actor => {
                actorEventMap[actor.name] = [];
            });
            eventsByLevel.forEach(ev => {
                if (actorEventMap[ev.actor]) {
                    actorEventMap[ev.actor].push(ev.name);
                }
            });

            // 3. Pool/Lane 정의 (flowNodeRef를 level 순서대로)
            let lanes = actors.map(actor => `
                <bpmn:lane id="Lane_${actor.lane}" name="${actor.name}">
                    ${actorEventMap[actor.name].map(ev => `<bpmn:flowNodeRef>${ev}</bpmn:flowNodeRef>`).join('\n')}
                </bpmn:lane>
            `).join('\n');

            // 4. 이벤트(Task/Start/End 등) 정의 (level 순서대로)
            let eventMap = {};
            let flowNodes = eventsByLevel.map(ev => {
                eventMap[ev.name] = ev;
                if (ev.level === 1) {
                    return `<bpmn:startEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else if (!ev.nextEvents || ev.nextEvents.length === 0) {
                    return `<bpmn:endEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else {
                    return `<bpmn:task id="${ev.name}" name="${ev.displayName}" />`;
                }
            }).join('\n');

            // 5. 시퀀스 플로우 정의
            let sequenceFlows = [];
            events.forEach(ev => {
                if (ev.nextEvents) {
                    ev.nextEvents.forEach(next => {
                        sequenceFlows.push(
                            `<bpmn:sequenceFlow id="Flow_${ev.name}_to_${next}" sourceRef="${ev.name}" targetRef="${next}" />`
                        );
                    });
                }
            });

            // 6. 시각적 요소(BPMN-DI) 생성
            // 각 lane(액터)별로 y축을 다르게, 각 이벤트는 level에 따라 x축을 다르게 배치
            const laneHeight = 160; // 더 크게!
            const nodeWidth = 80;
            const nodeHeight = 60;
            const xGap = 140;
            const yStart = 80;
            const xStart = 100;

            // 이벤트별 위치 계산
            const nodePositions = {};
            actors.forEach((actor, laneIdx) => {
                actorEventMap[actor.name].forEach(evName => {
                    const ev = events.find(e => e.name === evName);
                    if (!ev) return;
                    // x: level에 따라, y: lane에 따라
                    nodePositions[evName] = {
                        x: xStart + (ev.level - 1) * xGap,
                        y: yStart + laneIdx * laneHeight
                    };
                });
            });

            // Lane의 BPMNShape 생성 (선택)
            let bpmnLaneShapes = actors.map((actor, laneIdx) => {
                // lane의 높이는 해당 lane의 노드 개수에 따라 동적으로 조정할 수도 있음
                return `
                <bpmndi:BPMNShape id="Shape_Lane_${actor.lane}" bpmnElement="Lane_${actor.lane}">
                    <dc:Bounds x="0" y="${yStart + laneIdx * laneHeight - 20}" width="${xStart + xGap * 15}" height="${laneHeight}" />
                </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // BPMNShape 생성
            let bpmnShapes = Object.entries(nodePositions).map(([evName, pos]) => {
                return `
                <bpmndi:BPMNShape id="Shape_${evName}" bpmnElement="${evName}">
                    <dc:Bounds x="${pos.x}" y="${pos.y}" width="${nodeWidth}" height="${nodeHeight}"/>
                </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // BPMNEdge(시퀀스 플로우) 생성
            let bpmnEdges = sequenceFlows.map(flowXml => {
                const match = flowXml.match(/sourceRef="([^"]+)" targetRef="([^"]+)"/);
                if (!match) return '';
                const [, source, target] = match;
                const src = nodePositions[source];
                const tgt = nodePositions[target];
                if (!src || !tgt) return '';
                const waypoints = [
                    `<di:waypoint x="${src.x + nodeWidth}" y="${src.y + nodeHeight/2}"/>`,
                    `<di:waypoint x="${tgt.x}" y="${tgt.y + nodeHeight/2}"/>`
                ].join('\n');
                return `
                <bpmndi:BPMNEdge id="Edge_${source}_to_${target}" bpmnElement="Flow_${source}_to_${target}">
                    ${waypoints}
                </bpmndi:BPMNEdge>
                `;
            }).join('\n');

            // 7. 프로세스 조립
            this.bpmXml = `<?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                        xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                        xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                        xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                        xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                        id="Definitions_1"
                        targetNamespace="http://bpmn.io/schema/bpmn">
        <bpmn:process id="Process_1" isExecutable="false">
            <bpmn:laneSet>
            ${lanes}
            </bpmn:laneSet>
            ${flowNodes}
            ${sequenceFlows.join('\n')}
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            ${bpmnLaneShapes}
            ${bpmnShapes}
            ${bpmnEdges}
            </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
        </bpmn:definitions>
        `;
        },

        splitTableRows(rows, chunkSize = 10) {
            if (!Array.isArray(rows)) return [];
            const chunks = [];
            for (let i = 0; i < rows.length; i += chunkSize) {
                chunks.push(rows.slice(i, i + chunkSize));
            }
            return chunks;
        },

        getCombinedTableData(bc) {
            const combinedData = [];
            
            // 애그리게잇 데이터 추가
            if (bc.aggregate && bc.aggregate.length > 0) {
                combinedData.push(...bc.aggregate.map(item => ({ ...item, type: 'aggregate' })));
            }
            
            // 커맨드 데이터 추가
            if (bc.command && bc.command.length > 0) {
                combinedData.push(...bc.command.map(item => ({ ...item, type: 'command' })));
            }
            
            // 이벤트 데이터 추가
            if (bc.event && bc.event.length > 0) {
                combinedData.push(...bc.event.map(item => ({ ...item, type: 'event' })));
            }
            
            // 정책 데이터 추가
            if (bc.policy && bc.policy.length > 0) {
                combinedData.push(...bc.policy.map(item => ({ ...item, type: 'policy' })));
            }
            
            // 리드모델 데이터 추가
            if (bc.readModel && bc.readModel.length > 0) {
                combinedData.push(...bc.readModel.map(item => ({ ...item, type: 'readModel' })));
            }
            
            return combinedData;
        },

        getAggregateDetailData(agg) {
            const combinedData = [];
            
            // 애그리게잇 루트 필드 데이터 추가
            if (agg.aggregateRoot && agg.aggregateRoot.fieldDescriptors) {
                combinedData.push(...agg.aggregateRoot.fieldDescriptors.map(field => ({
                    ...field,
                    type: 'rootField'
                })));
            }
            
            // 엔티티 데이터 추가
            if (agg.aggregateRoot && agg.aggregateRoot.entities && agg.aggregateRoot.entities.elements) {
                Object.entries(agg.aggregateRoot.entities.elements).forEach(([id, entity]) => {
                    combinedData.push({
                        ...entity,
                        id,
                        type: 'entity'
                    });
                });
            }
            
            return combinedData;
        },
        getDesignCriteriaCombined(analysisResult) {
            const combined = [];
            // 비즈니스 규칙
            if (analysisResult.businessRules && Array.isArray(analysisResult.businessRules)) {
                combined.push(...analysisResult.businessRules.map(rule => ({ ...rule, type: 'rule' })));
            }
            // 엔티티 정의
            if (analysisResult.entities) {
                Object.entries(analysisResult.entities).forEach(([entityName, entity]) => {
                    if (entity.properties && Array.isArray(entity.properties)) {
                        entity.properties.forEach(prop => {
                            combined.push({ ...prop, type: 'entityProp', entityName });
                        });
                    }
                });
            }
            return combined;
        },
        getEntitiesInChunk(chunk) {
            // chunk 내에 등장하는 entityName의 유니크 리스트 반환
            return [...new Set(chunk.filter(i => i.type === 'entityProp').map(i => i.entityName))];
        },
        getEventsByActor(actorName) {
            if (!this.projectInfo.draft) return [];
            const processAnalysis = this.projectInfo.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
            
            return processAnalysis.content.analysisResult.events.filter(event => event.actor === actorName);
        },
        generateStepDescription(events) {
            // 이벤트들의 설명을 기반으로 단계 설명 생성
            const descriptions = events.map(event => event.description);
            return descriptions.join(' ');
        },
        getLevelRangeTitle(levels) {
            if (!levels || levels.length === 0) return '';
            const sorted = [...levels].sort((a, b) => a - b);
            if (sorted.length === 1) {
                return `Level ${sorted[0]}`;
            } else {
                return `Level ${sorted[0]} ~ Level ${sorted[sorted.length - 1]}`;
            }
        }
    }
}
</script>

<style scoped>
/* 기본 레이아웃 */
.document-template {
    background: white;
    padding: 20px;
    margin: 0 auto;
    max-width: 210mm;
}

/* 표지 스타일 */
.cover {
    height: 297mm;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
}

.main-title {
    font-size: 36px;
    font-weight: bold;
    margin-top: 100px;
}

.subtitle {
    font-size: 24px;
    margin-top: 40px;
}

.logo-container {
    margin: auto;
}

.logo {
    width: 200px;
}

.footer {
    font-size: 14px;
    color: #666;
}

/* 목차 스타일 */
.table-of-contents {
    padding: 40px;
}

.toc-list {
    margin-top: 20px;
}

.toc-list li {
    margin: 10px 0;
}

.toc-list ul {
    margin-left: 20px;
    list-style-type: none;
}

/* 섹션 스타일 */
.section {
    margin-bottom: 70px;
    padding: 20px 0;
    position: relative;
}

.section-content {
    padding: 20px 0;
}

/* 제목 스타일 */
h2 {
    font-size: 28px;
    color: #333;
    margin-bottom: 30px;
    padding-bottom: 15px;
    position: relative;
    border-bottom: 3px solid #333;
}

h2:after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 100px;
    height: 3px;
    background: #4CAF50;
}

h3 {
    font-size: 22px;
    color: #444;
    margin: 25px 0 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

h4 {
    font-size: 18px;
    color: #555;
    margin: 20px 0 10px;
}

/* 액터 카드 스타일 */
.actor-section {
    margin: 20px 0;
}

.actor-item {
    margin-bottom: 1.5em;
    padding-bottom: 1em;
    border-bottom: 1px solid #eee;
}

.actor-item:last-child {
    border-bottom: none;
}

.actor-name {
    margin-bottom: 0.5em;
    font-size: 1.1em;
}

.actor-lane {
    color: #666;
    margin-left: 8px;
    font-size: 0.9em;
}

.actor-events {
    color: #333;
    line-height: 1.4;
}

.events-label {
    color: #666;
    margin-right: 8px;
}

.event-item:last-child {
    all: unset;
}

.story-content {
    width: 100%;
    white-space: pre-line;
}

.story-paragraph {
    margin-bottom: 1.5em;
    line-height: 1.5;
    font-size: 0.9em;
    text-align: justify;
    word-break: keep-all;
    overflow-wrap: break-word;
    display: block;
    width: 100%;
}

/* PDF 변환 관련 스타일 */
.pdf-content-item {
    margin-bottom: 20px;
    position: relative;
    padding: 20px;
    border: 1px solid #ccc;
    min-height: 297mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: white;
    transform: translateZ(0); /* 하드웨어 가속 활성화 */
    -webkit-font-smoothing: antialiased; /* 폰트 스무딩 */
}

/* 다이어그램 컨테이너 스타일 */
.mermaid-container, .bpmn-uengine-viewer {
    background: white;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    margin: 10px 0;
    transform: translateZ(0);
}

/* 텍스트 컨텐츠 스타일 */
.story-content, .actor-section, .section-content {
    margin: 10px 0;
    transform: translateZ(0);
}

/* 테이블 스타일 */
.v-simple-table {
    margin: 10px 0;
    transform: translateZ(0);
}

/* 이미지 최적화 */
img {
    max-width: 100%;
    height: auto;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

/* 다이어그램 내부 요소 */
.mermaid-container svg,
.bpmn-uengine-viewer svg {
    max-width: 100%;
    height: auto;
    transform: translateZ(0);
}

/* 밸류 스트림 다이어그램 스타일 */
.value-stream-diagram {
    margin: 30px 0;
    height: 400px;
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
}

.work-in-progress {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.wip-text {
    text-align: center;
    margin-top: 20px;
}

/* 바운디드 컨텍스트 추가 정보 */
.bounded-context-table, .relations-table {
    margin-top: 20px;
    border: 1px solid #e0e0e0;
}

.bounded-context-table th, .relations-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 12px;
    text-align: left;
}

.bounded-context-table td, .relations-table td {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
}

.requirement-row {
    background-color: #fafafa;
}

.requirements-container {
    padding: 8px 0;
}

.requirement-item {
    margin: 8px 0;
    display: flex;
}

.requirement-number {
    min-width: 24px;
    color: #666;
}

.requirement-text {
    flex: 1;
}

/* Aggregate Drafts */
.aggregate-page {
    min-height: 297mm;
    max-height: 297mm;
    overflow: hidden;
}

.aggregate-models {
    margin-top: 20px;
}

.aggregate-option {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.analysis-section {
    margin-top: 15px;
}

.pros-cons-table {
    margin-top: 10px;
    border: 1px solid #e0e0e0;
    width: 100%;
    font-size: 0.9em;
}

.pros-cons-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 8px;
    text-align: left;
}

.pros-cons-table td {
    padding: 8px;
    border-bottom: 1px solid #e0e0e0;
}

.pros-cons-table td:first-child {
    background-color: #fafafa;
    width: 100px;
    font-weight: bold;
}

/* 설계 기준 스타일 */
.design-criteria {
    margin: 20px 0;
    padding: 15px;
    background-color: white;
    flex: 1;
}

.criteria-section {
    margin-bottom: 30px;
}

.criteria-section:last-child {
    margin-bottom: 0;
}

.section-title {
    color: #333;
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
}

.rules-table,
.entity-table,
.events-table,
.interface-table {
    width: 100%;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-collapse: collapse;
}

.rules-table th,
.entity-table th,
.events-table th,
.interface-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
}

.rules-table td,
.entity-table td,
.events-table td,
.interface-table td {
    padding: 12px;
    border: 1px solid #ddd;
}

.entity-name,
.interface-name {
    font-size: 16px;
    margin: 10px 0;
    color: #333;
}

/* 애그리거트 분석 테이블 스타일 */
.pros-cons-table {
    margin-top: 10px;
    border: 1px solid #ddd;
    width: 100%;
    font-size: 0.9em;
    border-collapse: collapse;
}

.pros-cons-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
}

.pros-cons-table td {
    padding: 12px;
    border: 1px solid #ddd;
}

.pros-cons-table td:first-child {
    background-color: #fafafa;
    width: 120px;
    font-weight: bold;
}

/* 엔티티 상세 정보 테이블 스타일 */
.field-table {
    width: 100%;
    margin-top: 10px;
    border: 1px solid #ddd;
    border-collapse: collapse;
}

.field-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 12px;
    text-align: left;
    border: 1px solid #ddd;
}

.field-table td {
    padding: 12px;
    border: 1px solid #ddd;
}

.entity-detail {
    margin: 15px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
}

.entity-header {
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
}

.entity-display-name {
    color: #666;
    margin-left: 8px;
    font-size: 0.9em;
}

.field-table, .enum-table {
    margin-top: 10px;
}

.field-table th, .enum-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 8px;
    text-align: left;
}

.field-table td, .enum-table td {
    padding: 8px;
    border-bottom: 1px solid #eee;
}

/* 섹션 선택기 스타일 */
.section-selector {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
}

.section-checkbox {
    margin-bottom: 8px;
}

.section-checkbox:last-child {
    margin-bottom: 0;
}

.cover-section-title {
    height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px 40px;
    background: white;
}
.cover-section-title .main-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 40px;
    margin-top: 0;
}
.cover-section-title .subtitle {
    font-size: 22px;
    color: #555;
    margin-top: 0;
    line-height: 1.6;
}

.value-stream-steps {
    margin-top: 30px;
}

.value-stream-step {
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #fafafa;
    height: calc(100% - 40px); /* 패딩 고려한 높이 계산 */
}

.step-description {
    margin: 15px 0;
    padding: 10px;
    background-color: #fff;
    border-left: 4px solid #4CAF50;
}

.step-actors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
    height: calc(100% - 100px); /* 설명 영역 높이를 제외한 나머지 공간 */
    overflow-y: auto;
}

.actor-group {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    height: fit-content;
}

.actor-group h4 {
    color: #333;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 1;
}

.actor-group ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.actor-group li {
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #eee;
}

.actor-group li:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.actor-group strong {
    color: #2196F3;
    display: block;
    margin-bottom: 5px;
}

.step-levels {
    margin: 10px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.level-badge {
    background-color: #e3f2fd;
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
    font-weight: 500;
}
</style>