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
                v-model="selectedSections.apiSpecification"
                :label="$t('DocumentTemplate.sections.apiSpecification')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.aggregateDetail"
                :label="$t('DocumentTemplate.sections.aggregateDetail')"
                hide-details
                class="section-checkbox"
            ></v-checkbox>
            <v-checkbox
                v-model="selectedSections.traceabilityMatrix"
                :label="$t('DocumentTemplate.sections.traceabilityMatrix')"
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
            <ul class="toc-list">
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
                        </ul>
                    </li>
                </template>
                <template v-if="selectedSections.eventStorming">
                    <li>{{ sectionNumbers.eventStorming }}. {{ $t('DocumentTemplate.sections.eventStorming') }}</li>
                </template>
                <template v-if="selectedSections.apiSpecification">
                    <li>{{ sectionNumbers.apiSpecification }}. {{ $t('DocumentTemplate.sections.apiSpecification') }}</li>
                </template>
                <template v-if="selectedSections.aggregateDetail">
                    <li>{{ sectionNumbers.aggregateDetail }}. {{ $t('DocumentTemplate.sections.aggregateDetail') }}</li>
                </template>
                <template v-if="selectedSections.traceabilityMatrix">
                    <li>{{ sectionNumbers.traceabilityMatrix }}. {{ $t('DocumentTemplate.sections.traceabilityMatrix') }}</li>
                </template>
            </ul>
        </div>

    
        <!-- 본문 -->
        <!-- 사용자 시나리오 (actor & event) -->
        <div v-if="selectedSections.userScenario" class="section">
            <div class="pdf-content-item">
                <h2>{{ sectionNumbers.userScenario }}. {{ $t('DocumentTemplate.sections.userScenario') }}</h2>
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
            <div class="cover-section-title pdf-content-item">
                <div class="main-title">{{ sectionNumbers.valueStream }}. {{ $t('DocumentTemplate.sections.valueStream') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.valueStream.description', { projectName: projectInfo.projectName }) }}<br>{{ $t('DocumentTemplate.valueStream.purpose') }}</div>
            </div>
            <!-- 플로우 페이지 -->
            <div v-for="(page, pageIdx) in getValueStreamLinearPages"
                 :key="'flow-page-' + pageIdx"
                 class="pdf-content-item value-stream-linear-list section-page">
                <h3 class="section-subtitle">
                    {{ sectionNumbers.valueStream }}. {{ $t('DocumentTemplate.sections.valueStream') }}
                </h3>
                <div class="value-stream-flow-cards">
                    <div v-for="(path, idx) in page" :key="idx" class="value-stream-flow-card">
                        <h4 class="process-set-title">
                            {{ path.length === 1 ? path[0].displayName : `${path[0].displayName} ~ ${path[path.length - 1].displayName}` }}
                        </h4>
                        <div class="linear-path-row linear-text-row">
                            <span v-for="(event, eIdx) in path" :key="event.name">
                                {{ event.displayName }} ({{ event.actor }})<span v-if="eIdx < path.length - 1"> → </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 바운디드 컨텍스트 정의 -->
        <div v-if="selectedSections.boundedContext" class="section">
            <div class="pdf-content-item">
                <h2>{{ sectionNumbers.boundedContext }}. {{ $t('DocumentTemplate.sections.boundedContext') }}</h2>
                
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
                <h3>{{ sectionNumbers.boundedContext }}-3. {{ $t('DocumentTemplate.boundedContext.contextStrategyMap') }}</h3>
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
            </div>
        </div>

        <!-- 이벤트스토밍 모델 섹션 -->
        <div v-if="selectedSections.eventStorming" class="section">
            <!-- 섹션 제목과 설명 -->
            <div class="cover-section-title pdf-content-item" v-if="getEventStormingModels.length > 0">
                <div class="main-title">{{ sectionNumbers.eventStorming }}. {{ $t('DocumentTemplate.sections.eventStorming') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.eventStorming.modelSystemBehavior') }}<br>{{ $t('DocumentTemplate.eventStorming.basedOnDerived') }}<br>{{ $t('DocumentTemplate.eventStorming.visuallyOrganize') }}</div>

                <div class="model-info">
                    <div class="model-name">{{ getEventStormingModels[0].modelName }}</div>
                    <a :href="getEventstormingUrl" target="_blank" class="model-url">{{ getEventstormingUrl }}</a>
                </div>
            </div>

            <!-- 각 모델별 페이지 -->
            <div v-for="(model, modelIndex) in getEventStormingModels" :key="`model-${modelIndex}`">
                <div v-for="(bc, bcIndex) in model.BoundedContexts" :key="`bc-${modelIndex}-${bcIndex}`">
                    <!-- 바운디드 컨텍스트 제목 -->
                    <div v-for="(chunk, chunkIndex) in splitTableRows(getCombinedTableData(bc))" :key="`combined-chunk-${chunkIndex}`" class="pdf-content-item">
                        <h3>{{ sectionNumbers.eventStorming }}-{{ bcIndex + 1 }}. {{ $t('DocumentTemplate.eventStorming.boundedContext') }}: {{ bc.name }}</h3>
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

        <!-- API 명세 섹션 -->
        <div v-if="selectedSections.apiSpecification" class="section">
            <div class="cover-section-title pdf-content-item">
                <div class="main-title">{{ sectionNumbers.apiSpecification }}. {{ $t('DocumentTemplate.sections.apiSpecification') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.apiSpecification.description') }}</div>
            </div>

            <!-- 각 바운디드 컨텍스트별 API 명세 -->
            <div v-for="(model, modelIndex) in getEventStormingModels" :key="`model-${modelIndex}`">
                <div v-for="(bc, bcIndex) in model.BoundedContexts" :key="`bc-${modelIndex}-${bcIndex}`">
                    <div class="pdf-content-item">
                        <h3>{{ $t('DocumentTemplate.apiSpecification.boundedContext') }}: {{ bc.name }}</h3>
                        
                        <!-- API 테이블 -->
                        <v-simple-table dense class="api-table">
                            <thead>
                                <tr>
                                    <th>{{ $t('DocumentTemplate.apiSpecification.apiPath') }}</th>
                                    <th>{{ $t('DocumentTemplate.apiSpecification.method') }}</th>
                                    <th>{{ $t('DocumentTemplate.apiSpecification.command') }}</th>
                                    <th>{{ $t('DocumentTemplate.apiSpecification.description2') }}</th>
                                    <th>{{ $t('DocumentTemplate.apiSpecification.parameters') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="cmd in getApiCommands(bc)" :key="cmd.id">
                                    <td>{{ cmd.controllerInfo ? cmd.controllerInfo.apiPath : '-' }}</td>
                                    <td>{{ cmd.controllerInfo ? cmd.controllerInfo.method || '-' : '-' }}</td>
                                    <td>{{ cmd.displayName || cmd.name }}</td>
                                    <td>{{ cmd.description || '-' }}</td>
                                    <td>
                                        <div v-for="field in cmd.fieldDescriptors" :key="field.name">
                                            {{ field.name }} ({{ field.className }})
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
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
                                        <h4>{{agg.name}} {{ $t('DocumentTemplate.aggregateDetail.aggregateRootFieldInformation') }}</h4>
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
                                            <v-simple-table dense class="field-table" v-if="!entity._type.includes('enum')">
                                                <thead>
                                                    <tr>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.fieldName') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.type') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.key') }}</th>
                                                        <th>{{ $t('DocumentTemplate.aggregateDetail.description') }}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="prop in entity.fieldDescriptors" :key="prop.name">
                                                        <td>{{ prop.name }}</td>
                                                        <td>{{ prop.className }}</td>
                                                        <td>{{ prop.isKey ? 'Y' : 'N' }}</td>
                                                        <td>
                                                            <span v-if="prop.isPrimaryKey">{{ $t('DocumentTemplate.aggregateDetail.primaryKey') }}</span>
                                                            <span v-if="prop.foreignEntity">{{ $t('DocumentTemplate.aggregateDetail.fk') }} ({{ prop.foreignEntity }})</span>
                                                            <span v-if="prop.values">{{ prop.values.join(', ') }}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </v-simple-table>
                                            <v-simple-table dense class="field-table" v-else>
                                                <thead>
                                                    <tr>
                                                        <th>Items</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="item in entity.items" :key="item.name">
                                                        <td>{{ item.value }}</td>
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

        <!-- 추적성 매트릭스 섹션 -->
        <div v-if="selectedSections.traceabilityMatrix" class="section">
            <div class="cover-section-title pdf-content-item">
                <div class="main-title">{{ sectionNumbers.traceabilityMatrix }}. {{ $t('DocumentTemplate.sections.traceabilityMatrix') }}</div>
                <div class="subtitle">{{ $t('DocumentTemplate.traceabilityMatrix.description') }}</div>
            </div>

            <div class="pdf-content-item">
                <div v-if="traceabilityMatrixGroups.groups.length === 0 && traceabilityMatrixGroups.unmapped.length === 0" class="text--secondary" style="padding: 12px;">
                    {{ $t('DocumentTemplate.traceabilityMatrix.noData') }}
                </div>
                <div v-else>
                    <div class="trace-matrix-summary mb-3" style="padding: 0 4px;">
                        <span>{{ $t('DocumentTemplate.traceabilityMatrix.summaryGroups', { groups: traceabilityMatrixGroups.groups.length, unmapped: traceabilityMatrixGroups.unmapped.length }) }}</span>
                    </div>

                    <!-- US 별 그룹 블록: 각 US 헤더 + 좁은 3 컬럼 테이블 (유형 / 이름 / ID).
                         12 컬럼 매트릭스의 잘림 문제 해소 + US 단위 가독성 향상. -->
                    <div v-for="group in traceabilityMatrixGroups.groups"
                         :key="`us-group-${group.us.id}`"
                         class="trace-us-group pdf-content-item">
                        <h4 class="trace-us-header">
                            <span class="trace-us-id">{{ group.us.id }}</span>
                            <span class="trace-us-name">{{ group.us.name }}</span>
                        </h4>
                        <v-simple-table dense class="trace-group-table">
                            <thead>
                                <tr>
                                    <th style="width: 100px;">{{ $t('DocumentTemplate.traceabilityMatrix.elementType') }}</th>
                                    <th>{{ $t('DocumentTemplate.traceabilityMatrix.elementName') }}</th>
                                    <th style="width: 30%;">{{ $t('DocumentTemplate.traceabilityMatrix.elementId') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, idx) in group.rows" :key="`row-${group.us.id}-${idx}`">
                                    <td>
                                        <span class="trace-type-chip" :class="`trace-type-${row.type}`">{{ $t('DocumentTemplate.traceabilityMatrix.types.' + row.type) }}</span>
                                    </td>
                                    <td>
                                        <div class="trace-cell-name">
                                            {{ row.name || '-' }}
                                            <span v-if="row.provenance === 'inferred'"
                                                  style="display:inline-block;margin-left:6px;font-size:0.68em;padding:1px 5px;border-radius:3px;background:#fff3e0;color:#e65100;border:1px solid #ffcc80;vertical-align:middle;"
                                                  title="직접 근거 텍스트가 없어 상위 Aggregate 의 매핑을 상속한 추론 매핑입니다. 원본 요구사항에 해당 요소를 직접 가리키는 문장은 없습니다.">추론</span>
                                        </div>
                                        <div v-if="row.technical && row.technical !== row.name" class="trace-cell-technical">{{ row.technical }}</div>
                                        <div v-if="row.parent" class="trace-cell-parent">↳ {{ row.parent }}</div>
                                    </td>
                                    <td>
                                        <div class="trace-cell-id">{{ row.id || '-' }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </div>

                    <!-- 미매핑 요소 (LLM ref 누락/오류 진단용) -->
                    <div v-if="traceabilityMatrixGroups.unmapped.length > 0" class="trace-us-group pdf-content-item">
                        <h4 class="trace-us-header trace-us-header-unmapped">
                            {{ $t('DocumentTemplate.traceabilityMatrix.unmappedHeader') }}
                            <span class="trace-us-count">({{ traceabilityMatrixGroups.unmapped.length }})</span>
                        </h4>
                        <v-simple-table dense class="trace-group-table">
                            <thead>
                                <tr>
                                    <th style="width: 100px;">{{ $t('DocumentTemplate.traceabilityMatrix.elementType') }}</th>
                                    <th>{{ $t('DocumentTemplate.traceabilityMatrix.elementName') }}</th>
                                    <th style="width: 30%;">{{ $t('DocumentTemplate.traceabilityMatrix.elementId') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, idx) in traceabilityMatrixGroups.unmapped" :key="`unmapped-${idx}`">
                                    <td>
                                        <span class="trace-type-chip" :class="`trace-type-${row.type}`">{{ $t('DocumentTemplate.traceabilityMatrix.types.' + row.type) }}</span>
                                    </td>
                                    <td>
                                        <div class="trace-cell-name">{{ row.name || '-' }}</div>
                                        <div v-if="row.technical && row.technical !== row.name" class="trace-cell-technical">{{ row.technical }}</div>
                                        <div v-if="row.parent" class="trace-cell-parent">↳ {{ row.parent }}</div>
                                    </td>
                                    <td>
                                        <div class="trace-cell-id">{{ row.id || '-' }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>
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
import { resolveEventStormingModelTitle } from '@/components/designer/modeling/utils/resolveEventStormingModelTitle';

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
        },
        draft: {
            type: Array,
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
                apiSpecification: true,
                aggregateDetail: true,
                traceabilityMatrix: true
            }
        }
    },
    computed: {
        getProcessAnalysisMessages() {
            if (!this.draft) return [];
            return this.draft.filter(msg => msg.type === 'processAnalysis');
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
            
            const text = this.projectInfo.userStory;
            const paragraphs = [];
            let currentParagraph = '';
            let currentLineCount = 0;
            
            // 텍스트를 줄 단위로 분리
            const lines = text.split('\n');
            
            for (const line of lines) {
                // 현재 줄이 빈 줄인 경우
                if (line.trim() === '') {
                    if (currentParagraph.trim()) {
                        paragraphs.push(currentParagraph.trim());
                        currentParagraph = '';
                        currentLineCount = 0;
                    }
                    continue;
                }
                
                // 현재 문단에 줄 추가
                currentParagraph += (currentParagraph ? '\n' : '') + line;
                currentLineCount++;
                
                // 글자수나 라인수가 제한을 초과하면 새로운 문단 시작
                if (currentParagraph.length > 1500 || currentLineCount > 30) {
                    paragraphs.push(currentParagraph.trim());
                    currentParagraph = '';
                    currentLineCount = 0;
                }
            }
            
            // 마지막 문단 처리
            if (currentParagraph.trim()) {
                paragraphs.push(currentParagraph.trim());
            }
            
            return paragraphs;
        },

        chunkedUserStory() {
            if (!this.formattedUserStory) return [];
            
            const chunks = [];
            const TARGET_LENGTH = 1500;  // 텍스트 길이 제한
            const MAX_LINES_PER_CHUNK = 30; // 라인 수
            
            let currentChunk = [];
            let currentLength = 0;
            let currentLines = 0;
            
            for (const paragraph of this.formattedUserStory) {
                // 현재 문단의 라인 수 계산
                const paragraphLines = paragraph.split('\n').length;
                
                // 현재 문단의 길이가 TARGET_LENGTH를 초과하는 경우
                if (paragraph.length > TARGET_LENGTH) {
                    // 현재 청크에 내용이 있으면 먼저 저장
                    if (currentChunk.length > 0) {
                        chunks.push(currentChunk);
                        currentChunk = [];
                        currentLength = 0;
                        currentLines = 0;
                    }
                    
                    // 긴 문단을 문장 단위로 분할
                    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
                    let currentSentences = [];
                    let sentenceLength = 0;
                    let sentenceLines = 0;
                    
                    for (const sentence of sentences) {
                        const sentenceLineCount = sentence.split('\n').length;
                        
                        // 현재 청크에 추가했을 때 라인 수나 길이가 제한을 초과하는 경우
                        if (sentenceLines + sentenceLineCount > MAX_LINES_PER_CHUNK || 
                            sentenceLength + sentence.length > TARGET_LENGTH) {
                            if (currentSentences.length > 0) {
                                chunks.push([currentSentences.join('')]);
                                currentSentences = [];
                                sentenceLength = 0;
                                sentenceLines = 0;
                            }
                        }
                        currentSentences.push(sentence);
                        sentenceLength += sentence.length;
                        sentenceLines += sentenceLineCount;
                    }
                    
                    if (currentSentences.length > 0) {
                        currentChunk = [currentSentences.join('')];
                        currentLength = sentenceLength;
                        currentLines = sentenceLines;
                    }
                }
                // 일반적인 경우
                else {
                    // 현재 청크에 추가했을 때 라인 수나 길이가 제한을 초과하는 경우
                    if (currentLines + paragraphLines > MAX_LINES_PER_CHUNK || 
                        currentLength + paragraph.length > TARGET_LENGTH) {
                        chunks.push(currentChunk);
                        currentChunk = [];
                        currentLength = 0;
                        currentLines = 0;
                    }
                    
                    currentChunk.push(paragraph);
                    currentLength += paragraph.length;
                    currentLines += paragraphLines;
                }
            }
            
            // 마지막 청크 추가
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
            
            return chunks;
        },

        selectedBoundedContext() {
            if (!this.draft) return null;
            
            const boundedContextResult = this.draft.find(
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
                    text: bc.alias
                        .replaceAll('·', '/')
                        .replaceAll('(', '-')
                        .replaceAll('[', '-')
                        .replaceAll(')', '')
                        .replaceAll(']', ''),
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
            if (!this.draft) return null;
            
            const option = this.draft.find(
                msg => msg.type === 'bcGenerationOption'
            );
            
            return option ? option.generateOption : null;
        },

        getAggregateDrafts() {
            if (!this.draft) return [];
            
            const aggregateDraftMessages = this.draft.filter(msg => msg.type === 'aggregateDraftDialogDto');
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
                const projectFallback = this.projectInfo && (this.projectInfo.prompt || this.projectInfo.projectName);
                return {
                    modelName: resolveEventStormingModelTitle(model.information, model.models, projectFallback),
                    BoundedContexts: boundedContexts
                };
            }).filter(Boolean); // null 값 제거
        },

        /**
         * userStory 텍스트를 파싱해 사용자 스토리 섹션 목록을 만든다.
         * 인식 패턴 (예시 기준, 사용자 포맷 약속):
         *   - `##### [<ID>] <이름>` 형태의 헤더 — <ID>는 보통 `PROJ-US-FR-001` 또는 `US-FR-001`
         *   - 각 섹션의 라인 범위 = 이 헤더 라인 다음 라인부터 다음 같은 레벨 헤더 직전까지
         * 매핑 판정은 ES 요소의 ref 라인이 이 범위에 들어오는지로 결정.
         */
        userStorySections() {
            const text = this.projectInfo && this.projectInfo.userStory
            if (!text) return []
            const lines = text.split('\n')
            const headerRe = /^#####\s+\[([A-Za-z][\w-]*US-(?:FR|NFR)-\d+)\]\s+(.+?)\s*$/
            const sections = []
            let current = null
            for (let i = 0; i < lines.length; i++) {
                const m = lines[i].match(headerRe)
                if (m) {
                    if (current) {
                        current.endLine = i  // i 가 새 헤더 라인 (1-based 로는 i+1) → 직전 라인까지
                        sections.push(current)
                    }
                    current = {
                        id: m[1],
                        name: m[2].trim(),
                        startLine: i + 1,  // 1-based
                        endLine: lines.length  // 마지막 섹션은 일단 끝까지
                    }
                }
            }
            if (current) sections.push(current)
            return sections
        },

        traceabilityMatrixRows() {
            const sections = this.userStorySections
            const rows = []
            const stats = { aggregate: 0, command: 0, event: 0, policy: 0, readModel: 0, unmappedTotal: 0 }

            const models = this.eventStormingModels
                ? (Array.isArray(this.eventStormingModels) ? this.eventStormingModels : Object.values(this.eventStormingModels))
                : []

            const findUsForRefs = (refs) => {
                if (!Array.isArray(refs) || refs.length === 0 || sections.length === 0) return []
                const hits = new Set()
                for (const ref of refs) {
                    if (!ref || !ref[0] || !ref[1]) continue
                    const sLine = typeof ref[0][0] === 'number' ? ref[0][0] : null
                    const eLine = typeof ref[1][0] === 'number' ? ref[1][0] : sLine
                    if (sLine == null) continue
                    for (const sec of sections) {
                        if (sLine <= sec.endLine && eLine >= sec.startLine) hits.add(sec.id)
                    }
                }
                return [...hits]
            }

            const getRefsForElement = (model, bcTraceName, el) => {
                // traceInfo 우선 (원본 userStory 좌표계로 정규화됨)
                const traceInfo = model && model.models &&
                    model.models.langgraphStudioInfos &&
                    model.models.langgraphStudioInfos.esGenerator &&
                    model.models.langgraphStudioInfos.esGenerator.traceInfo
                const tn = el.traceName || el.name
                const t = el._type || ''
                if (traceInfo && bcTraceName && tn) {
                    if (t.includes('Aggregate')) {
                        return (((traceInfo.structureRefs || {})[bcTraceName] || {}).aggregates || {})[tn] || el.refs || []
                    }
                    if (t.includes('Command')) {
                        return (((traceInfo.commandRefs || {})[bcTraceName] || {}).commands || {})[tn] || el.refs || []
                    }
                    if (t.includes('View')) {
                        return (((traceInfo.commandRefs || {})[bcTraceName] || {}).readModels || {})[tn] || el.refs || []
                    }
                }
                // Event / Policy 또는 traceInfo 미존재 시 element.refs fallback (markdown 좌표일 가능성 있음 → 매핑 실패할 수 있음)
                return el.refs || []
            }

            const findRelatedAggregate = (el, aggregates) => {
                if (el.aggregate && el.aggregate.id) {
                    const a = aggregates.find(a => a.id === el.aggregate.id)
                    if (a) return a
                }
                return null
            }

            const makeRow = (us, bc, agg, cmd, evt, pol, provenance) => ({
                usId: us ? us.id : '(미매핑)',
                usName: us ? us.name : '',
                bcId: bc ? (bc.id || '') : '',
                bcName: bc ? (bc.displayName || bc.name || '') : '',
                aggId: agg ? (agg.id || '') : '',
                aggName: agg ? (agg.displayName || agg.name || '') : '',
                cmdId: cmd ? (cmd.id || '') : '',
                cmdName: cmd ? (cmd.displayName || cmd.name || '') : '',
                evtId: evt ? (evt.id || '') : '',
                evtName: evt ? (evt.displayName || evt.name || '') : '',
                polId: pol ? (pol.id || '') : '',
                polName: pol ? (pol.displayName || pol.name || '') : '',
                provenance: provenance || 'direct'
            })

            for (const model of models) {
                if (!model || !model.models || !model.models.elements) continue
                const elements = Array.isArray(model.models.elements)
                    ? model.models.elements
                    : Object.values(model.models.elements)

                const bcs = elements.filter(el => el && el._type && el._type.includes('BoundedContext'))
                for (const bc of bcs) {
                    const inBc = elements.filter(el => el && el.boundedContext && el.boundedContext.id === bc.id)
                    const aggs = inBc.filter(el => el._type && el._type.includes('Aggregate'))
                    const cmds = inBc.filter(el => el._type && el._type.includes('Command'))
                    // Event 는 PostIt 등 보조 타입 제거
                    const evts = inBc.filter(el => el._type && el._type.includes('Event'))
                    const pols = inBc.filter(el => el._type && el._type.includes('Policy'))
                    const bcTraceName = bc.traceName || bc.name

                    // BC 단위로 미리 Aggregate→US 매핑을 캐시한다.
                    // ES generator 가 element-level refs 를 sparse 하게 만드는 경우 대비
                    // (Aggregate 의 refs 가 있으면 그 아래 Command/Event/Policy 는 부모의 US 를 상속)
                    const aggUsCache = new Map()
                    for (const agg of aggs) {
                        const refs = getRefsForElement(model, bcTraceName, agg)
                        aggUsCache.set(agg.id, findUsForRefs(refs))
                    }
                    const emit = (el, kind, makeFn, parentAgg) => {
                        const refs = getRefsForElement(model, bcTraceName, el)
                        let usIds = findUsForRefs(refs)
                        let provenance = 'direct'

                        // 추론 단계: element 자체 refs 가 없으면 부모 Aggregate 의 매핑을 상속.
                        // Command/Event/Policy 는 구조상 Aggregate 에 속하므로 합당한 추론이나,
                        // direct 매핑과 구별되도록 provenance='inferred' 로 표시한다.
                        //
                        // NOTE: 기존의 'BC 의 US union' fallback (refs 없는 요소를 BC 의 모든 US 에
                        // 매핑) 은 제거. 한 요소가 BC 내 모든 user story 에 붙어버리는 대량 거짓
                        // 매핑의 원인이었음. 근거 없는 요소는 정직하게 '미매핑' 으로 남긴다.
                        // (ES generator 의 keyword fallback 제거와 동일한 '거짓보다 빈 값이 정직' 정책)
                        if (usIds.length === 0 && parentAgg && parentAgg.id !== el.id &&
                            aggUsCache.has(parentAgg.id) && aggUsCache.get(parentAgg.id).length > 0) {
                            usIds = aggUsCache.get(parentAgg.id)
                            provenance = 'inferred'
                        }

                        if (usIds.length === 0) {
                            stats[kind]++
                            stats.unmappedTotal++
                            rows.push(makeFn(null, 'none'))
                            return
                        }
                        for (const usId of usIds) {
                            const us = sections.find(s => s.id === usId)
                            rows.push(makeFn(us, provenance))
                        }
                    }

                    for (const agg of aggs) {
                        emit(agg, 'aggregate', (us, prov) => makeRow(us, bc, agg, null, null, null, prov), agg)
                    }
                    for (const cmd of cmds) {
                        const parentAgg = findRelatedAggregate(cmd, aggs)
                        emit(cmd, 'command', (us, prov) => makeRow(us, bc, parentAgg, cmd, null, null, prov), parentAgg)
                    }
                    for (const evt of evts) {
                        const parentAgg = findRelatedAggregate(evt, aggs)
                        emit(evt, 'event', (us, prov) => makeRow(us, bc, parentAgg, null, evt, null, prov), parentAgg)
                    }
                    for (const pol of pols) {
                        const parentAgg = findRelatedAggregate(pol, aggs)
                        emit(pol, 'policy', (us, prov) => makeRow(us, bc, parentAgg, null, null, pol, prov), parentAgg)
                    }
                }
            }

            // 매핑된 행을 먼저, 미매핑은 맨 뒤로
            const mapped = rows.filter(r => r.usId !== '(미매핑)')
            const unmapped = rows.filter(r => r.usId === '(미매핑)')
            return { rows: [...mapped, ...unmapped], mappedCount: mapped.length, unmappedCount: unmapped.length, stats }
        },

        /**
         * traceabilityMatrixRows 를 US 별로 그룹핑하고 요소 단위 행으로 재구성.
         * 12 컬럼 매트릭스 대신 US 헤더 + 좁은 3 컬럼 (유형 / 이름 / ID) 테이블 N 개 형태.
         * PDF 페이지 폭 제약과 가독성 양쪽 개선.
         */
        traceabilityMatrixGroups() {
            const flat = this.traceabilityMatrixRows
            const groupMap = new Map()
            const unmapped = []
            const seen = new Set()  // 중복 행 제거 (같은 US 안에서 같은 요소가 여러 ref 로 잡힌 경우)

            // flat.rows 는 (US, BC, Aggregate, Command|Event|Policy) 조합으로 한 행에 한 요소만
            // 채워져 있다. 여기서 type 별로 다시 풀어서 row 생성.
            const pickElement = (r) => {
                if (r.polId || r.polName) return { type: 'policy', id: r.polId, name: r.polName, technical: '', parent: r.aggName || '', provenance: r.provenance }
                if (r.evtId || r.evtName) return { type: 'event', id: r.evtId, name: r.evtName, technical: '', parent: r.aggName || '', provenance: r.provenance }
                if (r.cmdId || r.cmdName) return { type: 'command', id: r.cmdId, name: r.cmdName, technical: '', parent: r.aggName || '', provenance: r.provenance }
                if (r.aggId || r.aggName) return { type: 'aggregate', id: r.aggId, name: r.aggName, technical: '', parent: r.bcName || '', provenance: r.provenance }
                return null
            }

            for (const r of flat.rows) {
                const elem = pickElement(r)
                if (!elem) continue
                const isUnmapped = r.usId === '(미매핑)'
                const groupKey = isUnmapped ? '__unmapped__' : r.usId
                const dedupKey = `${groupKey}::${elem.type}::${elem.id || elem.name}`
                if (seen.has(dedupKey)) continue
                seen.add(dedupKey)

                if (isUnmapped) {
                    unmapped.push(elem)
                    continue
                }
                if (!groupMap.has(groupKey)) {
                    groupMap.set(groupKey, { us: { id: r.usId, name: r.usName }, rows: [], bcs: new Set() })
                }
                const group = groupMap.get(groupKey)
                // Service(BC) 행은 그룹별로 한 번만 (dedup 은 set 으로)
                if (r.bcId && !group.bcs.has(r.bcId)) {
                    group.bcs.add(r.bcId)
                    const serviceDedup = `${groupKey}::service::${r.bcId}`
                    if (!seen.has(serviceDedup)) {
                        seen.add(serviceDedup)
                        group.rows.push({
                            type: 'service',
                            id: r.bcId,
                            name: r.bcName,
                            technical: '',
                            parent: ''
                        })
                    }
                }
                group.rows.push(elem)
            }

            // 그룹 안에서 요소를 유형 순으로 정렬 (Service → Aggregate → Command → Event → Policy)
            const typeOrder = { service: 0, aggregate: 1, command: 2, event: 3, policy: 4 }
            const groups = []
            // US-ID 가 문자열 순(예: PROJ-US-FR-001 → -002 …) 자연 정렬 위해 sort
            const sortedKeys = [...groupMap.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
            for (const k of sortedKeys) {
                const g = groupMap.get(k)
                g.rows.sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || (a.name || '').localeCompare(b.name || ''))
                groups.push({ us: g.us, rows: g.rows })
            }
            unmapped.sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || (a.name || '').localeCompare(b.name || ''))

            return { groups, unmapped }
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
            if (this.selectedSections.apiSpecification) {
                numbers.apiSpecification = currentNumber++;
            }
            if (this.selectedSections.aggregateDetail) {
                numbers.aggregateDetail = currentNumber++;
            }
            if (this.selectedSections.traceabilityMatrix) {
                numbers.traceabilityMatrix = currentNumber++;
            }

            return numbers;
        },
        getValueStreamTreeRoots() {
            if (!this.draft) return [];
            const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
            const { events } = processAnalysis.content.analysisResult;
            const eventMap = Object.fromEntries(events.map(ev => [ev.name, ev]));
            // 트리 구조로 변환
            function buildTree(event, visited) {
                if (visited.has(event.name)) return null;
                visited.add(event.name);
                const children = (event.nextEvents || [])
                    .map(nextName => eventMap[nextName])
                    .filter(Boolean)
                    .map(child => buildTree(child, new Set(visited)))
                    .filter(Boolean);
                return { ...event, children };
            }
            // 시작 이벤트(들)로부터 각각 트리 생성
            const startEvents = events.filter(event => event.level === 1);
            return startEvents.map(ev => buildTree(ev, new Set())).filter(Boolean);
        },
        getValueStreamPaths() {
            if (!this.draft) return [];
            const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
            const { events } = processAnalysis.content.analysisResult;
            const eventMap = Object.fromEntries(events.map(ev => [ev.name, ev]));
            // 시작 이벤트 찾기 (level이 1인 이벤트)
            const startEvents = events.filter(event => event.level === 1);
            const paths = [];
            // 재귀적으로 모든 경로를 추출 (순환 방지)
            function traverse(event, path, visited) {
                if (visited.has(event.name)) return; // 순환 방지
                const newPath = [...path, event];
                visited.add(event.name);
                if (!event.nextEvents || event.nextEvents.length === 0) {
                    paths.push(newPath);
                    return;
                }
                event.nextEvents.forEach(nextName => {
                    const nextEvent = eventMap[nextName];
                    if (nextEvent) traverse(nextEvent, newPath, new Set(visited));
                });
            }
            startEvents.forEach(startEvent => {
                traverse(startEvent, [], new Set());
            });
            return paths;
        },
        getValueStreamSteps() {
            if (!this.draft) return [];
            const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
            const { events } = processAnalysis.content.analysisResult;
            // 시작 이벤트 찾기 (level이 1인 이벤트)
            const startEvents = events.filter(event => event.level === 1);
            const steps = [];
            // 각 시작 이벤트에 대해 흐름 추적 (분기 포함)
            startEvents.forEach(startEvent => {
                const visited = new Set();
                const flows = [];
                const buildFlow = (currentEvent) => {
                    if (visited.has(currentEvent.name)) return;
                    visited.add(currentEvent.name);
                    flows.push(currentEvent);
                    if (!currentEvent.nextEvents || currentEvent.nextEvents.length === 0) return;
                    // 분기점이면 각 분기별로 별도 플로우(여기선 단순히 이어붙임)
                    currentEvent.nextEvents.forEach(nextName => {
                        const nextEvent = events.find(e => e.name === nextName);
                        if (nextEvent) buildFlow(nextEvent);
                    });
                };
                buildFlow(startEvent);
                if (flows.length > 0) {
                    steps.push({
                        description: flows.map(ev => ev.displayName).join(' → '),
                        events: flows
                    });
                }
            });
            return steps;
        },
        getValueStreamLinearPaths() {
            if (!this.draft) return [];
            const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
            if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
            const { events } = processAnalysis.content.analysisResult;
            const eventMap = Object.fromEntries(events.map(ev => [ev.name, ev]));
            
            // 모든 이벤트를 시작점으로 사용
            const paths = [];
            const processedEvents = new Set();
            
            function traverse(event, path, visited) {
                if (visited.has(event.name)) return;
                const newPath = [...path, event];
                visited.add(event.name);
                processedEvents.add(event.name);
                
                // 다음 이벤트가 없는 경우 현재 경로 저장
                if (!event.nextEvents || event.nextEvents.length === 0) {
                    paths.push(newPath);
                    return;
                }
                
                // 다음 이벤트가 있는 경우
                event.nextEvents.forEach(nextName => {
                    const nextEvent = eventMap[nextName];
                    if (nextEvent) {
                        traverse(nextEvent, newPath, new Set(visited));
                    }
                });
            }
            
            // 모든 이벤트에 대해 경로 탐색
            events.forEach(event => {
                if (!processedEvents.has(event.name)) {
                    traverse(event, [], new Set());
                }
            });
            
            // 경로를 level 순서대로 정렬
            return paths.sort((a, b) => {
                const aLevel = Math.min(...a.map(e => e.level));
                const bLevel = Math.min(...b.map(e => e.level));
                return aLevel - bLevel;
            });
        },
        getValueStreamLinearPages() {
            // 페이지 분할 로직 적용
            const flows = this.getValueStreamLinearPaths;
            const pages = [];
            let currentPage = [];
            let currentPageSize = 0;
            
            // 각 플로우를 처리
            flows.forEach(flow => {
                // 현재 페이지에 추가했을 때 30개를 초과하거나 4개의 세트를 초과하는 경우
                if (currentPageSize + flow.length > 30 || currentPage.length >= 4) {
                    // 현재 페이지가 비어있지 않다면 저장
                    if (currentPage.length > 0) {
                        pages.push(currentPage);
                    }
                    
                    // 플로우가 30개를 초과하는 경우 분할
                    if (flow.length > 30) {
                        for (let i = 0; i < flow.length; i += 30) {
                            const chunk = flow.slice(i, i + 30);
                            pages.push([chunk]);
                        }
                        currentPage = [];
                        currentPageSize = 0;
                    } else {
                        // 새로운 페이지 시작
                        currentPage = [flow];
                        currentPageSize = flow.length;
                    }
                } else {
                    // 현재 페이지에 플로우 추가
                    currentPage.push(flow);
                    currentPageSize += flow.length;
                }
            });
            
            // 마지막 페이지가 있다면 추가
            if (currentPage.length > 0) {
                pages.push(currentPage);
            }
            
            return pages;
        },

        getEventstormingUrl() {
            let modelId = Object.keys(this.eventStormingModels)[0];
            modelId = modelId.replace('_es_', '_storming_');
            modelId = modelId.replaceAll('_', '/');
            return `https://www.msaez.io/#/${modelId}`;
        }
    },
    mounted() {
        // this.generateBPMN();
        // console.log(this.bpmXml);
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
        getEntitiesInChunk(chunk) {
            // chunk 내에 등장하는 entityName의 유니크 리스트 반환
            return [...new Set(chunk.filter(i => i.type !== 'rule').map(i => i.entityName))];
        },
        getEventsByActor(actorName) {
            if (!this.draft) return [];
            const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
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
        },
        trackEventFlow(startEvent, allEvents) {
            const flows = [];
            const visited = new Set();
            const MAX_EVENTS_PER_PAGE = 5;

            const buildFlow = (currentEvent, currentStep = null) => {
                if (visited.has(currentEvent.name)) return;
                visited.add(currentEvent.name);

                if (!currentStep) {
                    currentStep = {
                        events: [currentEvent],
                        actors: new Map([[currentEvent.actor, [currentEvent]]]),
                        isNewPage: true
                    };
                } else {
                    // 현재 페이지의 이벤트 수가 MAX_EVENTS_PER_PAGE를 초과하면 새 페이지 시작
                    if (currentStep.events.length >= MAX_EVENTS_PER_PAGE) {
                        // 현재 페이지 저장
                        flows.push({
                            description: this.generateStepDescription(currentStep.events),
                            actors: Array.from(currentStep.actors.entries()).map(([name, events]) => ({
                                name,
                                events
                            })),
                            hasNextPage: true
                        });

                        // 새 페이지 시작
                        currentStep = {
                            events: [currentEvent],
                            actors: new Map([[currentEvent.actor, [currentEvent]]]),
                            isNewPage: true
                        };
                    } else {
                        currentStep.events.push(currentEvent);
                        if (!currentStep.actors.has(currentEvent.actor)) {
                            currentStep.actors.set(currentEvent.actor, []);
                        }
                        currentStep.actors.get(currentEvent.actor).push(currentEvent);
                    }
                }

                // 다음 이벤트가 없는 경우 현재 흐름 저장
                if (!currentEvent.nextEvents || currentEvent.nextEvents.length === 0) {
                    flows.push({
                        description: this.generateStepDescription(currentStep.events),
                        actors: Array.from(currentStep.actors.entries()).map(([name, events]) => ({
                            name,
                            events
                        })),
                        hasNextPage: false
                    });
                    return;
                }

                // 다음 이벤트가 있는 경우
                currentEvent.nextEvents.forEach((nextEventName, index) => {
                    const nextEvent = allEvents.find(e => e.name === nextEventName);
                    if (!nextEvent) return;

                    // 첫 번째 다음 이벤트는 현재 흐름에 추가
                    if (index === 0) {
                        buildFlow(nextEvent, currentStep);
                    } else {
                        // 나머지 다음 이벤트들은 새로운 흐름 시작
                        const newStep = {
                            events: [...currentStep.events.slice(0, -1), currentEvent],
                            actors: new Map(currentStep.actors),
                            isNewPage: true
                        };
                        buildFlow(nextEvent, newStep);
                    }
                });
            };

            buildFlow(startEvent);
            return flows;
        },
        getApiCommands(bc) {
            if (!bc.command || !Array.isArray(bc.command)) return [];
            
            return bc.command
                .filter(cmd => cmd.controllerInfo && cmd.controllerInfo.apiPath) // API 정보가 있는 커맨드만 필터링
                .map(cmd => ({
                    ...cmd,
                    // API 경로가 상대 경로인 경우 전체 경로로 변환
                    controllerInfo: {
                        ...cmd.controllerInfo,
                        apiPath: cmd.controllerInfo.apiPath.startsWith('/') 
                            ? cmd.controllerInfo.apiPath 
                            : `/${cmd.controllerInfo.apiPath}`
                    }
                }));
        },
        getControllerInfo(commandName) {
            // Implement your logic to get controller information based on command name
            // This is just a placeholder implementation
            return {
                apiPath: `/api/v1/${commandName}`,
                method: 'GET',
                description: `Description of ${commandName}`,
                parameters: [
                    { name: 'param1', type: 'String', description: 'Parameter 1' },
                    { name: 'param2', type: 'Integer', description: 'Parameter 2' }
                ]
            };
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
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.value-stream-step {
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #fafafa;
    min-height: 297mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: white;
    transform: translateZ(0);
    -webkit-font-smoothing: antialiased;
}

.step-description {
    margin: 15px 0;
    padding: 15px;
    background-color: #fff;
    border-left: 4px solid #4CAF50;
    border-radius: 4px;
}

.step-actors {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
    flex: 1;
}

.actor-group {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

.actor-group h4 {
    color: #333;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
}

.event-flow {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.event-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.event-content {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    width: 100%;
}

.event-description {
    margin: 8px 0 0 0;
    font-size: 0.9em;
    color: #666;
}

.event-arrow {
    color: #2196F3;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    margin: 4px 0;
}

.event-branches {
    display: flex;
    justify-content: center;
    width: 100%;
    gap: 8px;
    margin-top: 8px;
}

.event-branch {
    display: flex;
    justify-content: center;
    align-items: center;
}

.event-branch .v-icon {
    color: #2196F3;
    font-size: 24px;
}

.value-stream-tree-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 297mm;
    padding: 40px 0;
    background: white;
}

.value-stream-linear-list {
    padding: 40px 0;
    min-height: 297mm;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
}
.value-stream-flow-card {
    background: #f8fafc;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    padding: 18px 22px;
    width: 100%;
    max-width: 900px;
    margin: 0 auto 16px auto;
    display: flex;
    flex-direction: column;
    gap: 0;
}
.linear-path-row {
    font-size: 1.08em;
    margin-bottom: 0;
    word-break: break-all;
    line-height: 1.7;
    background: none;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
    min-width: 320px;
}
.linear-text-row {
    padding: 8px 0 8px 0;
    border-bottom: none;
    margin-bottom: 0;
}
.linear-text-row:last-child {
    border-bottom: none;
}
.event-inline-block {
    display: inline-flex;
    align-items: center;
}
.event-badge {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 5px;
    padding: 4px 10px;
    margin: 0 4px;
    font-weight: 500;
    font-size: 1em;
    display: inline-flex;
    align-items: center;
}
.event-actor {
    color: #666;
    font-size: 0.95em;
    margin-left: 4px;
}
.arrow-inline {
    color: #2196F3;
    font-size: 1.2em;
    margin: 0 6px;
    font-weight: bold;
}
.linear-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, #e3e3e3 0%, #b3c6e0 100%);
    margin: 18px 0 0 0;
    border: none;
    border-radius: 1px;
}

.value-stream-page-title {
    font-size: 28px;
    color: #333;
    font-weight: bold;
    margin-bottom: 30px;
    margin-top: 0;
    padding-bottom: 15px;
    border-bottom: 3px solid #333;
    letter-spacing: -1px;
    text-align: left;
}
.value-stream-page-subtitle {
    font-size: 21px;
    color: #333;
    font-weight: bold;
    margin-bottom: 24px;
    margin-top: 0;
    letter-spacing: -0.5px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
    width: 100%;
}

.section-subtitle-wrapper {
    width: 100%;
    margin-bottom: 18px;
    padding-left: 0;
}
.value-stream-linear-list {
    padding: 40px 0;
    min-height: 297mm;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
}

.value-stream-flow-cards {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.pdf-content-item.section-page {
    padding: 40px;
    box-sizing: border-box;
}
.section-subtitle {
    width: 100%;
    display: block;
    padding-left: 0;
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 24px;
    font-size: 21px;
    font-weight: bold;
    color: #333;
}

.model-info {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    width: 90%;
}

.model-name {
    font-size: 22px;
    color: #333;
    margin-bottom: 12px;
    font-weight: 500;
    letter-spacing: -0.5px;
}

.model-url {
    font-size: 16px;
    color: #1976d2;
    text-decoration: none;
    word-break: break-all;
    display: inline-block;
}

.model-url:hover {
    text-decoration: underline;
}

.process-set-title {
    font-size: 16px;
    color: #333;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 500;
}

.api-table th, .api-table td {
    padding: 8px;
    border: 1px solid #ddd;
}

.api-table th {
    background-color: #f5f5f5;
    font-weight: bold;
}

/* 추적성 매트릭스 — 6 컬럼(이름) + ID 보조 표기, PDF 폭에 맞춰 압축 */
.trace-matrix-table {
    table-layout: fixed;
    width: 100%;
    font-size: 11px;
}
.trace-matrix-table th {
    background-color: #f5f5f5;
    font-weight: bold;
    font-size: 11px;
    padding: 6px 4px !important;
    white-space: normal;
    word-break: break-word;
}
.trace-matrix-table td {
    padding: 4px 4px !important;
    vertical-align: top;
    white-space: normal;
    word-break: break-word;
    border-top: 1px solid #e0e0e0;
}
.trace-matrix-table .trace-cell-name {
    font-weight: 500;
    line-height: 1.25;
}
.trace-matrix-table .trace-cell-id {
    font-size: 9px;
    color: #757575;
    font-family: monospace;
    margin-top: 2px;
    word-break: break-all;
}
.trace-matrix-table .trace-row-unmapped td {
    background-color: #fff8e1;
}
.trace-matrix-summary {
    font-size: 12px;
    color: #555;
}

/* US 별 그룹 블록 */
.trace-us-group {
    margin-bottom: 16px;
}
.trace-us-header {
    margin: 8px 0 4px 0;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 8px;
    background-color: #f5f7fa;
    border-left: 3px solid #1976d2;
}
.trace-us-header-unmapped {
    background-color: #fff8e1;
    border-left-color: #f9a825;
}
.trace-us-header .trace-us-id {
    font-family: monospace;
    color: #1976d2;
    margin-right: 8px;
}
.trace-us-header .trace-us-name {
    color: #333;
}
.trace-us-header .trace-us-count {
    font-size: 12px;
    color: #f9a825;
    font-weight: 400;
    margin-left: 6px;
}
.trace-group-table {
    font-size: 11px;
}
.trace-group-table th {
    background-color: #fafafa;
    font-weight: bold;
    font-size: 11px;
    padding: 6px 8px !important;
}
.trace-group-table td {
    padding: 4px 8px !important;
    vertical-align: top;
    white-space: normal;
    word-break: break-word;
    border-top: 1px solid #eeeeee;
}
.trace-group-table .trace-cell-technical {
    font-size: 10px;
    color: #888;
    font-family: monospace;
    margin-top: 1px;
}
.trace-group-table .trace-cell-parent {
    font-size: 10px;
    color: #999;
    margin-top: 2px;
}
.trace-type-chip {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
    color: #fff;
}
.trace-type-service   { background-color: #546e7a; }
.trace-type-aggregate { background-color: #1976d2; }
.trace-type-command   { background-color: #43a047; }
.trace-type-event     { background-color: #fb8c00; }
.trace-type-policy    { background-color: #8e24aa; }
</style>