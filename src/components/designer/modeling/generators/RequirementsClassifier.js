/**
 * 요구사항을 자동으로 분류하고 처리하는 클래스
 */
class RequirementsClassifier {
    constructor() {
        this.classificationRules = {
            // 스타일 변경 (기본 구조 유지)
            style: {
                keywords: ['색상', '색', 'color', '폰트', 'font', '크기', 'size', '스타일', 'style', '테두리', 'border', '배경', 'background'],
                patterns: [
                    /(버튼|button).*(색|color)/i,
                    /(폰트|font).*(변경|change)/i,
                    /(크기|size).*(조정|adjust)/i,
                    /(색상|color).*(변경|change)/i
                ],
                action: 'applyStyle'
            },
            
            // 컴포넌트 추가/수정 (기본 구조 유지)
            component: {
                keywords: ['추가', 'add', '버튼', 'button', '필드', 'field', '화면', 'screen', '페이지', 'page', '모달', 'modal', '팝업', 'popup'],
                patterns: [
                    /(추가|add).*(화면|screen|페이지|page)/i,
                    /(버튼|button).*(추가|add)/i,
                    /(필드|field).*(추가|add)/i,
                    /(성공|success).*(화면|screen)/i,
                    /(실패|fail|error).*(화면|screen)/i
                ],
                action: 'addComponent'
            },
            
            // 구조적 변경 (기본 구조 무시)
            structural: {
                keywords: ['카드', 'card', '대시보드', 'dashboard', '차트', 'chart', '그리드', 'grid', '레이아웃', 'layout', '테이블', 'table', '검색결과', '검색 결과', '조회결과', '조회 결과'],
                patterns: [
                    /(카드|card).*(로|으로)/i,
                    /(대시보드|dashboard).*(로|으로)/i,
                    /(차트|chart).*(로|으로)/i,
                    /(테이블|table).*(로|으로)/i,
                    /(그리드|grid).*(로|으로)/i,
                    /(검색결과|검색 결과|조회결과|조회 결과).*(카드|card|로|으로)/i,
                    /(카드|card).*(검색결과|검색 결과|조회결과|조회 결과)/i
                ],
                action: 'restructure'
            },
            
            // 기능적 변경 (기본 구조 유지)
            functional: {
                keywords: ['검색', 'search', '필터', 'filter', '정렬', 'sort', '페이지네이션', 'pagination', '확인', 'validation'],
                patterns: [
                    /(검색|search).*(기능|function)/i,
                    /(필터|filter).*(추가|add)/i,
                    /(정렬|sort).*(기능|function)/i,
                    /(페이지네이션|pagination)/i
                ],
                action: 'addFunctionality'
            }
        };
    }

    /**
     * 요구사항을 분석하고 분류
     * @param {string} requirements - 사용자 요구사항
     * @returns {Object} 분류 결과
     */
    classify(requirements) {
        if (!requirements || requirements.trim() === '') {
            return { type: 'none', confidence: 1.0, action: 'useDefault' };
        }

        const normalizedRequirements = requirements.toLowerCase().trim();
        const classifications = [];

        // 각 분류 규칙에 대해 점수 계산
        Object.entries(this.classificationRules).forEach(([type, rule]) => {
            let score = 0;
            
            // 키워드 매칭
            rule.keywords.forEach(keyword => {
                if (normalizedRequirements.includes(keyword)) {
                    score += 1;
                }
            });

            // 패턴 매칭
            rule.patterns.forEach(pattern => {
                if (pattern.test(requirements)) {
                    score += 2; // 패턴 매칭이 더 높은 점수
                }
            });

            if (score > 0) {
                classifications.push({
                    type,
                    score,
                    action: rule.action,
                    confidence: Math.min(score / 3, 1.0) // 최대 1.0으로 정규화
                });
            }
        });

        // 점수가 가장 높은 분류 선택
        if (classifications.length === 0) {
            return { type: 'unknown', confidence: 0.0, action: 'useDefault' };
        }

        // 점수순으로 정렬
        classifications.sort((a, b) => b.score - a.score);
        
        const primary = classifications[0];
        
        // 복합 요구사항인지 확인 (여러 타입이 비슷한 점수를 가진 경우)
        const hasMultipleTypes = classifications.length > 1 && 
                                classifications[1].score >= primary.score * 0.8;

        return {
            type: primary.type,
            confidence: primary.confidence,
            action: primary.action,
            isComplex: hasMultipleTypes,
            allClassifications: hasMultipleTypes ? classifications : [primary]
        };
    }

    /**
     * 분류된 요구사항에 따른 프롬프트 생성
     * @param {Object} classification - 분류 결과
     * @param {string} originalRequirements - 원본 요구사항
     * @param {string} uiType - UI 타입 (Command/View)
     * @returns {string} 생성된 프롬프트
     */
    generatePrompt(classification, originalRequirements, uiType) {
        const { type, action, isComplex, allClassifications } = classification;

        if (type === 'none') {
            return this.generateDefaultPrompt(uiType);
        }

        if (isComplex) {
            return this.generateComplexPrompt(allClassifications, originalRequirements, uiType);
        }

        return this.generateSpecificPrompt(type, action, originalRequirements, uiType);
    }

    generateDefaultPrompt(uiType) {
        return uiType === 'Command' 
            ? "Use the basic command structure with all fields in a simple form."
            : "Use the basic view structure with search form and results table.";
    }

    generateSpecificPrompt(type, action, requirements, uiType) {
        const baseStructure = uiType === 'Command' 
            ? "Keep the basic command form structure" 
            : "Keep the basic view structure with search and results";

        switch (action) {
            case 'applyStyle':
                return `${baseStructure} and apply these style changes: ${requirements}`;
            
            case 'addComponent':
                return `${baseStructure} and add these components: ${requirements}`;
            
            case 'restructure':
                return `Ignore the basic structure and create a new layout as requested: ${requirements}`;
            
            case 'addFunctionality':
                return `${baseStructure} and add these functional features: ${requirements}`;
            
            default:
                return `${baseStructure} and implement: ${requirements}`;
        }
    }

    generateComplexPrompt(classifications, requirements, uiType) {
        const actions = classifications.map(c => c.action);
        const hasStructural = actions.includes('restructure');
        
        if (hasStructural) {
            return `This is a complex requirement with multiple changes. Ignore the basic structure and create a comprehensive solution that addresses: ${requirements}`;
        } else {
            return `This is a complex requirement with multiple enhancements. Keep the basic structure and add all requested features: ${requirements}`;
        }
    }

    /**
     * 요구사항을 더 세분화된 카테고리로 분류
     * @param {string} requirements - 사용자 요구사항
     * @returns {Object} 세분화된 분류 결과
     */
    classifyDetailed(requirements) {
        const basicClassification = this.classify(requirements);
        
        if (basicClassification.type === 'none') {
            return basicClassification;
        }

        // 추가 세분화 로직
        const detailed = {
            ...basicClassification,
            subCategories: [],
            priority: 'medium',
            estimatedComplexity: 'low'
        };

        // 복잡도 평가
        const complexityKeywords = ['복잡', 'complex', '고급', 'advanced', '많은', 'many'];
        const hasComplexity = complexityKeywords.some(keyword => 
            requirements.toLowerCase().includes(keyword)
        );

        if (hasComplexity) {
            detailed.estimatedComplexity = 'high';
            detailed.priority = 'high';
        }

        // 우선순위 키워드
        const priorityKeywords = ['중요', 'important', '필수', 'required', '우선', 'priority'];
        const hasPriority = priorityKeywords.some(keyword => 
            requirements.toLowerCase().includes(keyword)
        );

        if (hasPriority) {
            detailed.priority = 'high';
        }

        return detailed;
    }
}

module.exports = RequirementsClassifier;
