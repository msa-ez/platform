/**
 * DataBasedWordExporter - 데이터 기반 Word 변환기
 * HTML 파싱 대신 원본 데이터를 직접 사용하여 안정적인 Word 문서 생성
 */

import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, PageBreak, TextRun, SectionType } from 'docx';
import * as htmlToImage from 'html-to-image';
import { DataBasedDocumentExporterBase } from './DataBasedDocumentExporterBase';

export class DataBasedWordExporter extends DataBasedDocumentExporterBase {
    constructor(projectInfo, draft, eventStormingModels, selectedSections, container = null) {
        super(projectInfo, draft, eventStormingModels, selectedSections, container);
    }

    /**
     * Word 문서 생성
     */
    async exportToWord() {
        const sections = [];
        
        // 표지
        sections.push(this.createCoverSection());
        
        // 목차
        sections.push(this.createTableOfContentsSection());
        
        // 각 섹션별로 생성 (비동기 처리)
        let isFirstContentSection = true;
        
        if (this.selectedSections.userScenario) {
            const userSections = this.createUserScenarioSections();
            if (userSections && userSections.length > 0) {
                userSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...userSections);
            }
        }
        
        if (this.selectedSections.valueStream) {
            const valueSections = this.createValueStreamSections();
            if (valueSections && valueSections.length > 0) {
                valueSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...valueSections);
            }
        }
        
        if (this.selectedSections.boundedContext) {
            const bcSections = await this.createBoundedContextSections();
            if (bcSections && bcSections.length > 0) {
                bcSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...bcSections);
            }
        }
        
        if (this.selectedSections.aggregateDesign) {
            const aggSections = await this.createAggregateDesignSections();
            if (aggSections && aggSections.length > 0) {
                aggSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...aggSections);
            }
        }
        
        if (this.selectedSections.eventStorming) {
            const eventSections = this.createEventStormingSections();
            if (eventSections && eventSections.length > 0) {
                eventSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...eventSections);
            }
        }
        
        if (this.selectedSections.apiSpecification) {
            const apiSections = this.createApiSpecificationSections();
            if (apiSections && apiSections.length > 0) {
                apiSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...apiSections);
            }
        }
        
        if (this.selectedSections.aggregateDetail) {
            const detailSections = this.createAggregateDetailSections();
            if (detailSections && detailSections.length > 0) {
                detailSections.forEach((section, idx) => {
                    if (idx === 0 && isFirstContentSection) {
                        isFirstContentSection = false;
                    } else {
                        this.addPageBreakToSection(section);
                    }
                });
                sections.push(...detailSections);
            }
        }

        const doc = new Document({
            sections: sections,
            styles: {
                default: {
                    document: {
                        run: {
                            font: "맑은 고딕",
                            size: 24, // 12pt
                        },
                    },
                },
            },
        });

        return await Packer.toBlob(doc);
    }


    /**
     * 표지 생성 (전체 페이지)
     */
    createCoverSection() {
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1cm
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                // 상단 여백을 위한 빈 문단들
                ...Array(20).fill(null).map(() => new Paragraph({ text: '' })),
                
                // 프로젝트명 (큰 제목)
                new Paragraph({
                    children: [
                        new TextRun({
                            text: this.projectInfo.projectName || 'Untitled',
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 600 }
                }),
                
                // 부제목
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '시스템 설계 문서',
                            size: 24, // 12pt
                            italics: true
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 1200 }
                }),
                
                // 하단 여백
                ...Array(25).fill(null).map(() => new Paragraph({ text: '' }))
            ]
        };
    }

    /**
     * 목차 생성 (새 페이지)
     */
    createTableOfContentsSection() {
        // 목차는 표지 다음에 오므로 pageBreakBefore 불필요
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: '목 차',
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // 목차 항목들
        if (this.selectedSections.userScenario) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.userScenario}. 사용자 시나리오`,
                spacing: { before: 0, after: 200 },
                indent: { left: 720 } // 0.5인치
            }));
        }
        
        if (this.selectedSections.valueStream) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.valueStream}. 밸류 스트림`,
                spacing: { before: 0, after: 200 },
                indent: { left: 720 }
            }));
        }
        
        if (this.selectedSections.boundedContext) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.boundedContext}. 바운디드 컨텍스트`,
                spacing: { before: 0, after: 100 },
                indent: { left: 720 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.boundedContext}-1. 분해 기준`,
                spacing: { before: 0, after: 100 },
                indent: { left: 1440 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.boundedContext}-2. 분해 결과`,
                spacing: { before: 0, after: 100 },
                indent: { left: 1440 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.boundedContext}-3. 컨텍스트 전략 맵`,
                spacing: { before: 0, after: 100 },
                indent: { left: 1440 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.boundedContext}-4. 상세 정보`,
                spacing: { before: 0, after: 200 },
                indent: { left: 1440 }
            }));
        }
        
        if (this.selectedSections.aggregateDesign) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.aggregateDesign}. 애그리거트 설계`,
                spacing: { before: 0, after: 100 },
                indent: { left: 720 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.aggregateDesign}-1. 애그리거트 모델`,
                spacing: { before: 0, after: 100 },
                indent: { left: 1440 }
            }));
            children.push(new Paragraph({
                text: `${this.sectionNumbers.aggregateDesign}-2. 애그리거트 분석`,
                spacing: { before: 0, after: 200 },
                indent: { left: 1440 }
            }));
        }
        
        if (this.selectedSections.eventStorming) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.eventStorming}. 이벤트 스토밍`,
                spacing: { before: 0, after: 200 },
                indent: { left: 720 }
            }));
        }
        
        if (this.selectedSections.apiSpecification) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.apiSpecification}. API 명세`,
                spacing: { before: 0, after: 200 },
                indent: { left: 720 }
            }));
        }
        
        if (this.selectedSections.aggregateDetail) {
            children.push(new Paragraph({
                text: `${this.sectionNumbers.aggregateDetail}. 애그리거트 상세 정보`,
                spacing: { before: 0, after: 200 },
                indent: { left: 720 }
            }));
        }
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1cm
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 섹션에 페이지 브레이크 추가 (첫 번째 섹션 제외)
     */
    addPageBreakToSection(section, isFirst = false) {
        if (!isFirst) {
            if (!section.properties) {
                section.properties = {};
            }
            if (!section.properties.page) {
                section.properties.page = {};
            }
            // Word에서 새 페이지 시작
            section.properties.page.pageBreakBefore = true;
        }
        return section;
    }

    /**
     * 바운디드 컨텍스트 섹션 생성 (주제별 페이지 분리)
     */
    async createBoundedContextSections() {
        const sections = [];
        const bcResult = this.extractBoundedContextResult();
        const generationOption = this.extractGenerationOption();
        
        if (!bcResult) return sections;
        
        // 1. 분해 기준 (새 페이지)
        if (generationOption) {
            sections.push(this.createDecompositionCriteriaSection(generationOption));
        }
        
        // 2. 분해 결과 (새 페이지) - Mermaid 다이어그램
        sections.push(await this.createDecompositionResultsSection(bcResult));
        
        // 3. 컨텍스트 전략 맵 (새 페이지) - BoundedContextMatrix 이미지
        sections.push(await this.createContextStrategyMapSection(bcResult));
        
        // 4. 상세 정보 (새 페이지)
        sections.push(this.createBoundedContextDetailsSection(bcResult));
        
        return sections;
    }

    /**
     * 분해 기준 섹션
     */
    createDecompositionCriteriaSection(generationOption) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.boundedContext}-1. 분해 기준`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // 선택된 관점들
        if (generationOption.selectedAspects && generationOption.selectedAspects.length > 0) {
            generationOption.selectedAspects.forEach(aspect => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: `• ${aspect}`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    spacing: { before: 0, after: 200 },
                    indent: { left: 360 }
                }));
            });
        }
        
        // 추가 요구사항
        if (generationOption.additionalOptions) {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: '추가 요구사항:',
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                spacing: { before: 400, after: 200 }
            }));
            children.push(new Paragraph({
                text: generationOption.additionalOptions,
                spacing: { before: 0, after: 200 },
                indent: { left: 360 }
            }));
        }
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 분해 결과 섹션 (Mermaid 다이어그램)
     */
    async createDecompositionResultsSection(bcResult) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.boundedContext}-2. 분해 결과`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // Mermaid 다이어그램 캡쳐
        if (this.container) {
            try {
                // vue-mermaid 요소 찾기
                let mermaidElement = this.container.querySelector('vue-mermaid');
                let svg = null;
                
                if (mermaidElement) {
                    svg = mermaidElement.querySelector('svg');
                }
                
                // SVG를 직접 찾기
                if (!svg) {
                    const svgs = this.container.querySelectorAll('svg');
                    for (const s of svgs) {
                        if (s.closest('vue-mermaid') || s.closest('.mermaid-container')) {
                            svg = s;
                            break;
                        }
                    }
                }
                
                if (svg && svg.outerHTML) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // CSS 오류를 무시하고 이미지 캡쳐 시도
                    // CSS 에러 무시를 위한 전역 에러 핸들러 설정 (임시)
                    const originalWarn = console.warn;
                    console.warn = function(...args) {
                        const message = args.join(' ');
                        // CSS 관련 에러는 무시
                        if (message.includes('Error inlining remote css') ||
                            message.includes('Error loading remote stylesheet') ||
                            message.includes('Error while reading CSS rules') ||
                            message.includes('Failed to read the \'cssRules\'') ||
                            message.includes('Failed to execute \'insertRule\'')) {
                            return;
                        }
                        originalWarn.apply(console, args);
                    };
                    
                    try {
                        const imageData = await htmlToImage.toPng(svg, {
                            backgroundColor: '#ffffff',
                            pixelRatio: 2,
                            quality: 1.0,
                            useCORS: false,
                            allowTaint: false,
                            cacheBust: true,
                            skipFonts: true, // 폰트 임베딩 건너뛰기 (CSS 에러 방지)
                            filter: (node) => {
                                if (node.tagName === 'SCRIPT' || node.tagName === 'LINK') {
                                    return false;
                                }
                                return true;
                            }
                        }).catch(async (err) => {
                            // CSS 에러가 아닌 경우에만 경고
                            if (!err.message || (!err.message.includes('cssRules') && !err.message.includes('CSSStyleSheet'))) {
                                console.warn('First capture attempt failed, retrying:', err);
                            }
                            return await htmlToImage.toPng(svg, {
                                backgroundColor: '#ffffff',
                                pixelRatio: 1.5,
                                quality: 0.9,
                                skipFonts: true
                            });
                        });
                        const imageBlob = await this.dataUrlToBlob(imageData);
                        const arrayBuffer = await this.blobToArrayBuffer(imageBlob);
                        
                        children.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: arrayBuffer,
                                    transformation: {
                                        width: 500,
                                        height: 400
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }));
                    } catch (captureError) {
                        // CSS 에러가 아닌 경우에만 경고
                        if (!captureError.message || (!captureError.message.includes('cssRules') && !captureError.message.includes('CSSStyleSheet'))) {
                            console.warn('SVG capture failed, trying parent element:', captureError);
                        }
                        // 부모 요소로 재시도
                        const parent = svg.parentElement;
                        if (parent) {
                            try {
                                const imageData = await htmlToImage.toPng(parent, {
                                    backgroundColor: '#ffffff',
                                    pixelRatio: 1.5,
                                    quality: 0.9,
                                    skipFonts: true
                                });
                                const imageBlob = await this.dataUrlToBlob(imageData);
                                const arrayBuffer = await this.blobToArrayBuffer(imageBlob);
                                
                                children.push(new Paragraph({
                                    children: [
                                        new ImageRun({
                                            data: arrayBuffer,
                                            transformation: {
                                                width: 500,
                                                height: 400
                                            }
                                        })
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { after: 200 }
                                }));
                            } catch (parentError) {
                                // CSS 에러가 아닌 경우에만 경고
                                if (!parentError.message || (!parentError.message.includes('cssRules') && !parentError.message.includes('CSSStyleSheet'))) {
                                    console.warn('Parent capture also failed:', parentError);
                                }
                                throw captureError;
                            }
                        } else {
                            throw captureError;
                        }
                    } finally {
                        // 원래 console.warn 복원
                        console.warn = originalWarn;
                    }
                } else {
                    children.push(new Paragraph({
                        text: '[Mermaid 다이어그램을 찾을 수 없습니다]',
                        spacing: { before: 0, after: 200 }
                    }));
                }
            } catch (error) {
                console.warn('Failed to capture mermaid diagram:', error);
                children.push(new Paragraph({
                    text: '[Mermaid 다이어그램 - 이미지 캡쳐 중 오류 발생]',
                    spacing: { before: 0, after: 200 }
                }));
            }
        } else {
            children.push(new Paragraph({
                text: '[Mermaid 다이어그램 - HTML 컨테이너 필요]',
                spacing: { before: 0, after: 200 }
            }));
        }
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 컨텍스트 전략 맵 섹션
     */
    async createContextStrategyMapSection(bcResult) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.boundedContext}-3. 컨텍스트 전략 맵`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // BoundedContextMatrix 캡쳐
        if (this.container) {
            try {
                const matrixElement = this.container.querySelector('.matrix-container');
                if (matrixElement) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // CSS 에러 무시를 위한 전역 에러 핸들러 설정 (임시)
                    const originalWarn = console.warn;
                    console.warn = function(...args) {
                        const message = args.join(' ');
                        // CSS 관련 에러는 무시
                        if (message.includes('Error inlining remote css') ||
                            message.includes('Error loading remote stylesheet') ||
                            message.includes('Error while reading CSS rules') ||
                            message.includes('Failed to read the \'cssRules\'') ||
                            message.includes('Failed to execute \'insertRule\'')) {
                            return;
                        }
                        originalWarn.apply(console, args);
                    };
                    
                    try {
                        const imageData = await htmlToImage.toPng(matrixElement, {
                            backgroundColor: '#ffffff',
                            pixelRatio: 2,
                            quality: 1.0,
                            useCORS: false,
                            allowTaint: false,
                            cacheBust: true,
                            skipFonts: true, // 폰트 임베딩 건너뛰기 (CSS 에러 방지)
                            filter: (node) => {
                                if (node.tagName === 'SCRIPT' || node.tagName === 'LINK') {
                                    return false;
                                }
                                return true;
                            }
                        }).catch(async (err) => {
                            // CSS 에러가 아닌 경우에만 경고
                            if (!err.message || (!err.message.includes('cssRules') && !err.message.includes('CSSStyleSheet'))) {
                                console.warn('First capture attempt failed, retrying:', err);
                            }
                            return await htmlToImage.toPng(matrixElement, {
                                backgroundColor: '#ffffff',
                                pixelRatio: 1.5,
                                quality: 0.9,
                                skipFonts: true
                            });
                        });
                        const imageBlob = await this.dataUrlToBlob(imageData);
                        const arrayBuffer = await this.blobToArrayBuffer(imageBlob);
                        
                        children.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: arrayBuffer,
                                    transformation: {
                                        width: 500,
                                        height: 400
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 }
                        }));
                    } finally {
                        // 원래 console.warn 복원
                        console.warn = originalWarn;
                    }
                } else {
                    children.push(new Paragraph({
                        text: '[BoundedContextMatrix 요소를 찾을 수 없습니다]',
                        spacing: { before: 0, after: 400 }
                    }));
                }
            } catch (error) {
                // CSS 에러가 아닌 경우에만 경고
                if (!error.message || (!error.message.includes('cssRules') && !error.message.includes('CSSStyleSheet'))) {
                    console.warn('Failed to capture BoundedContextMatrix:', error);
                }
                // 에러가 발생해도 계속 진행
                children.push(new Paragraph({
                    text: '[BoundedContextMatrix - 이미지 캡쳐 중 오류 발생]',
                    spacing: { before: 0, after: 400 }
                }));
            }
        } else {
            children.push(new Paragraph({
                text: '[BoundedContextMatrix - HTML 컨테이너 필요]',
                spacing: { before: 0, after: 400 }
            }));
        }
        
        // 분해 이유
        children.push(new Paragraph({
            children: [
                new TextRun({
                    text: '분해 이유',
                    size: 32, // 16pt
                    bold: true
                })
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200 }
        }));
        children.push(new Paragraph({
            text: bcResult.thoughts || '',
            spacing: { before: 0, after: 200 }
        }));
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 바운디드 컨텍스트 상세 정보 섹션
     */
    createBoundedContextDetailsSection(bcResult) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.boundedContext}-4. 상세 정보`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // 바운디드 컨텍스트 테이블
        if (bcResult.boundedContexts && bcResult.boundedContexts.length > 0) {
            const table = this.createBoundedContextTable(bcResult.boundedContexts);
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: '바운디드 컨텍스트 상세 정보',
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 0, after: 300 }
            }));
            children.push(table);
            children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
        }
        
        // 컨텍스트 간 관계 테이블
        const relations = bcResult.explanations || bcResult.relations || [];
        if (relations && relations.length > 0) {
            const table = this.createRelationsTable(relations);
            if (table) {
                children.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: '컨텍스트 간 관계',
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400, after: 300 }
                }));
                children.push(table);
            }
        }
        
        // 빈 섹션 방지: 최소한 제목이라도 있어야 함
        if (children.length <= 1) {
            children.push(new Paragraph({
                text: '상세 정보가 없습니다.',
                spacing: { before: 0, after: 200 }
            }));
        }
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 바운디드 컨텍스트 테이블 생성
     * 데이터: [{ alias, role, importance, implementationStrategy }, ...]
     */
    createBoundedContextTable(boundedContexts) {
        const rows = [];
        
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 4;
        const cellWidth = Math.floor(availableWidth / columnCount); // 각 셀 너비 (절대값)
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: '바운디드 컨텍스트', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '역할', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '중요도', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '구현 전략', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        boundedContexts.forEach(bc => {
            const cells = [
                new TableCell({
                    children: [new Paragraph({ text: bc.alias || bc.name || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: bc.role || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: bc.importance || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: bc.implementationStrategy || '' })]
                })
            ];
            rows.push(new TableRow({ children: cells }));
        });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth, cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * 컨텍스트 간 관계 테이블 생성
     * 데이터: [{ upStream, downStream, type, ... } 또는 { sourceContext, targetContext, relationType, interactionPattern }, ...]
     */
    createRelationsTable(explanations) {
        if (!explanations || explanations.length === 0) return null;
        
        const rows = [];
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 4;
        const cellWidth = Math.floor(availableWidth / columnCount);
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: '소스 컨텍스트', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '타겟 컨텍스트', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '관계 유형', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '상호작용 패턴', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        explanations.forEach(relation => {
            // 두 가지 데이터 구조 지원
            const sourceContext = relation.upStream ? (relation.upStream.alias || relation.upStream.name || '') : (relation.sourceContext || '');
            const targetContext = relation.downStream ? (relation.downStream.alias || relation.downStream.name || '') : (relation.targetContext || '');
            const relationType = relation.type || relation.relationType || '';
            const interactionPattern = relation.interactionPattern || relation.explanation || '';
            
            const cells = [
                new TableCell({
                    children: [new Paragraph({ text: sourceContext })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: targetContext })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: relationType })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: interactionPattern })]
                })
            ];
            rows.push(new TableRow({ children: cells }));
        });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth, cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * 이벤트 스토밍 테이블 생성 (예시)
     * 데이터: [{ name, description, displayName }, ...]
     */
    createEventStormingTable(items, title) {
        if (!items || items.length === 0) return null;
        
        const rows = [];
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 2;
        const cellWidth = Math.floor(availableWidth / columnCount);
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: '이름', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '설명', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        items.forEach(item => {
            const cells = [
                new TableCell({
                    children: [new Paragraph({ text: item.name || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: item.description || item.displayName || '' })]
                })
            ];
            rows.push(new TableRow({ children: cells }));
        });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * API 명세 테이블 생성
     * 데이터: command 배열에서 controllerInfo 추출
     */
    createApiSpecificationTable(commands) {
        if (!commands || commands.length === 0) return null;
        
        const rows = [];
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 5;
        const cellWidth = Math.floor(availableWidth / columnCount);
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: 'API 경로', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '메서드', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '커맨드', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '설명', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '파라미터', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        commands
            .filter(cmd => cmd.controllerInfo && cmd.controllerInfo.apiPath)
            .forEach(cmd => {
                const params = (cmd.fieldDescriptors || [])
                    .map(f => `${f.name} (${f.className})`)
                    .join(', ');
                
                const cells = [
                    new TableCell({
                        children: [new Paragraph({ text: cmd.controllerInfo.apiPath || '' })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: cmd.controllerInfo.method || '' })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: cmd.displayName || cmd.name || '' })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: cmd.description || '' })]
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: params || '-' })]
                    })
                ];
                rows.push(new TableRow({ children: cells }));
            });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth, cellWidth, cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * 애그리거트 상세 필드 테이블 생성
     * 데이터: fieldDescriptors 배열
     */
    createFieldTable(fieldDescriptors, title) {
        if (!fieldDescriptors || fieldDescriptors.length === 0) return null;
        
        const rows = [];
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 4;
        const cellWidth = Math.floor(availableWidth / columnCount);
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: '필드명', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '타입', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '키', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '설명', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        fieldDescriptors.forEach(field => {
            const description = [
                field.isPrimaryKey ? 'Primary Key' : '',
                field.foreignEntity ? `FK (${field.foreignEntity})` : '',
                field.values ? `Values: ${field.values.join(', ')}` : '',
                field.displayName || ''
            ].filter(Boolean).join('; ');
            
            const cells = [
                new TableCell({
                    children: [new Paragraph({ text: field.name || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: field.className || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: field.isKey ? 'Yes' : 'No' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: description || '-' })]
                })
            ];
            rows.push(new TableRow({ children: cells }));
        });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth, cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * 애그리거트 분석 테이블 (Pros/Cons)
     * 데이터: { pros: {...}, cons: {...} }
     */
    createProsConsTable(pros, cons) {
        if (!pros || !cons) return null;
        
        const rows = [];
        // A4 페이지 너비: 21cm = 11906 twips
        // Section margin 좌우 각 1440 twips (1cm) = 2880 twips
        // 사용 가능한 너비: 11906 - 2880 = 9026 twips
        const availableWidth = 9026;
        const columnCount = 3;
        const cellWidth = Math.floor(availableWidth / columnCount);
        
        // 헤더 행
        const headerCells = [
            new TableCell({
                children: [new Paragraph({ text: '항목', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '장점', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            }),
            new TableCell({
                children: [new Paragraph({ text: '단점', alignment: AlignmentType.CENTER })],
                shading: { fill: 'F5F5F5' }
            })
        ];
        rows.push(new TableRow({ children: headerCells }));
        
        // 데이터 행
        const keys = Object.keys(pros);
        keys.forEach(key => {
            const cells = [
                new TableCell({
                    children: [new Paragraph({ text: key })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: pros[key] || '' })]
                }),
                new TableCell({
                    children: [new Paragraph({ text: cons[key] || '' })]
                })
            ];
            rows.push(new TableRow({ children: cells }));
        });
        
        return new Table({
            rows: rows,
            width: { size: availableWidth, type: WidthType.DXA },
            columnWidths: [cellWidth, cellWidth, cellWidth],
            borders: {
                top: { size: 1, color: '000000' },
                bottom: { size: 1, color: '000000' },
                left: { size: 1, color: '000000' },
                right: { size: 1, color: '000000' },
                insideHorizontal: { size: 1, color: '000000' },
                insideVertical: { size: 1, color: '000000' }
            }
        });
    }

    /**
     * 사용자 시나리오 섹션 생성
     */
    createUserScenarioSections() {
        if (!this.projectInfo.userStory) return [];
        
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.userScenario}. 사용자 시나리오`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // 사용자 스토리를 문단 단위로 분할
        const paragraphs = this.projectInfo.userStory.split('\n\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
            children.push(new Paragraph({
                children: [
                    new TextRun({
                        text: paragraph.trim(),
                        size: 20 // 10pt
                    })
                ],
                spacing: { before: 0, after: 300 },
            }));
        });
        
        return [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        }];
    }

    /**
     * 밸류 스트림 섹션 생성
     */
    createValueStreamSections() {
        if (!this.draft) return [];
        const processAnalysis = this.draft.find(msg => msg.type === 'processAnalysis');
        if (!processAnalysis || !processAnalysis.content || !processAnalysis.content.analysisResult) return [];
        
        const { events } = processAnalysis.content.analysisResult;
        if (!events || events.length === 0) return [];
        
        const sections = [];
        
        // 1. 섹션 제목과 설명 (cover-section-title)
        sections.push({
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${this.sectionNumbers.valueStream}. 밸류 스트림`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 0, after: 300 }
                }),
                new Paragraph({
                    text: `${this.projectInfo.projectName || '프로젝트'}의 비즈니스 프로세스를 분석하여 고객 가치를 창출하는 흐름을 식별합니다.`,
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '시스템의 전체적인 흐름을 이해하고 최적화할 수 있는 기회를 찾기 위한 분석입니다.',
                    spacing: { before: 0, after: 400 }
                })
            ]
        });
        
        // 2. 이벤트 경로들 (하나의 섹션에 모음)
        const paths = this.extractValueStreamPaths(events);
        if (paths && paths.length > 0) {
            const children = [];
            
            paths.forEach((path, index) => {
                if (!path || path.length === 0) return;
                
                const pathTitle = path.length === 1 
                    ? path[0].displayName 
                    : `${path[0].displayName} ~ ${path[path.length - 1].displayName}`;
                
                children.push(new Paragraph({
                    children: [
                        new TextRun({
                            text: pathTitle,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: index === 0 ? 0 : 400, after: 300 }
                }));
                
                const pathText = path.map(e => `${e.displayName || e.name || ''} (${e.actor || ''})`).join(' → ');
                children.push(new Paragraph({
                    text: pathText,
                    spacing: { before: 0, after: 200 },
                }));
            });
            
            if (children.length > 0) {
                sections.push({
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: children
                });
            }
        } else {
            // 경로가 없으면 설명만 있는 페이지에 경로 없음 메시지 추가
            if (sections.length > 0) {
                sections[0].children.push(new Paragraph({
                    text: '밸류 스트림 경로 정보가 없습니다.',
                    spacing: { before: 400, after: 200 }
                }));
            }
        }
        
        return sections;
    }


    /**
     * 애그리거트 설계 섹션 생성
     */
    async createAggregateDesignSections() {
        const sections = [];
        const aggregateDrafts = this.extractAggregateDrafts();
        
        if (!aggregateDrafts || aggregateDrafts.length === 0) return sections;
        
        // 1. 섹션 제목과 설명 (cover-section-title)
        sections.push({
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${this.sectionNumbers.aggregateDesign}. 애그리거트 설계`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 0, after: 300 }
                }),
                new Paragraph({
                    text: '도메인의 핵심 개념을 애그리거트로 식별하고 설계합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '비즈니스 불변식을 보장하고 일관성을 유지하기 위한 경계를 정의합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '키 커맨드와 이벤트를 식별하여 애그리거트 간 상호작용을 설계합니다.',
                    spacing: { before: 0, after: 400 }
                })
            ]
        });
        
        // 2. 각 바운디드 컨텍스트별로 섹션 생성
        for (const draft of aggregateDrafts) {
            // 1. 애그리거트 모델 (Mermaid 다이어그램)
            sections.push(await this.createAggregateModelSection(draft));
            
            // 2. 애그리거트 분석 (Pros/Cons 테이블)
            sections.push(this.createAggregateAnalysisSection(draft));
        }
        
        return sections;
    }

    /**
     * 애그리거트 모델 섹션
     */
    async createAggregateModelSection(draft) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.aggregateDesign}-1. 애그리거트 모델: ${draft.boundedContextAlias}`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        // Mermaid 다이어그램 캡쳐 (Base 클래스의 메서드 사용)
        if (this.container) {
            try {
                const arrayBuffer = await this.captureAggregateMermaidImage(draft);
                if (arrayBuffer) {
                    children.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: arrayBuffer,
                                transformation: {
                                    width: 500,
                                    height: 400
                                }
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }));
                } else {
                    children.push(new Paragraph({
                        text: '[Mermaid 다이어그램을 찾을 수 없습니다]',
                        spacing: { before: 0, after: 200 }
                    }));
                }
            } catch (error) {
                console.warn('Failed to capture aggregate mermaid:', error);
                children.push(new Paragraph({
                    text: '[Mermaid 다이어그램 - 이미지 캡쳐 중 오류 발생]',
                    spacing: { before: 0, after: 200 }
                }));
            }
        } else {
            children.push(new Paragraph({
                text: '[Mermaid 다이어그램 - HTML 컨테이너 필요]',
                spacing: { before: 0, after: 200 }
            }));
        }
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 애그리거트 분석 섹션
     */
    createAggregateAnalysisSection(draft) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${this.sectionNumbers.aggregateDesign}-2. 애그리거트 분석: ${draft.boundedContextAlias}`,
                        size: 32, // 16pt
                        bold: true
                    })
                ],
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 400 }
            })
        ];
        
        draft.options.forEach(option => {
            if (option.pros && option.cons) {
                const table = this.createProsConsTable(option.pros, option.cons);
                if (table) {
                    children.push(table);
                    children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                }
            }
        });
        
        return {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: children
        };
    }

    /**
     * 이벤트 스토밍 섹션 생성
     */
    createEventStormingSections() {
        const sections = [];
        const models = this.extractEventStormingModels();
        
        if (!models || models.length === 0) return sections;
        
        // 1. 섹션 제목과 설명, 모델 정보 (cover-section-title)
        const firstModel = models[0];
        sections.push({
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${this.sectionNumbers.eventStorming}. 이벤트 스토밍`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 0, after: 300 }
                }),
                new Paragraph({
                    text: '시스템의 비즈니스 이벤트와 커맨드를 중심으로 도메인 모델을 시각화합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '도메인 전문가와 함께 도메인 이벤트를 도출하여 시스템의 동작을 이해합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '이벤트 스토밍 결과를 바탕으로 바운디드 컨텍스트와 애그리거트를 식별합니다.',
                    spacing: { before: 0, after: 400 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '모델명: ',
                            bold: true
                        }),
                        new TextRun({
                            text: firstModel.modelName || ''
                        })
                    ],
                    spacing: { before: 400, after: 200 }
                })
            ]
        });
        
        // 2. 각 바운디드 컨텍스트별 섹션
        models.forEach((model, modelIndex) => {
            model.BoundedContexts.forEach((bc, bcIndex) => {
                const children = [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${this.sectionNumbers.eventStorming}-${bcIndex + 1}. 바운디드 컨텍스트: ${bc.name}`,
                                size: 32, // 16pt
                                bold: true
                            })
                        ],
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 0, after: 400 }
                    })
                ];
                
                // Aggregate 테이블
                if (bc.aggregate && bc.aggregate.length > 0) {
                    const table = this.createEventStormingTable(bc.aggregate, '애그리거트');
                    if (table) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '애그리거트',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 0, after: 300 }
                        }));
                        children.push(table);
                        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                    }
                }
                
                // Command 테이블
                if (bc.command && bc.command.length > 0) {
                    const table = this.createEventStormingTable(bc.command, '커맨드');
                    if (table) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '커맨드',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 300 }
                        }));
                        children.push(table);
                        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                    }
                }
                
                // Event 테이블
                if (bc.event && bc.event.length > 0) {
                    const table = this.createEventStormingTable(bc.event, '이벤트');
                    if (table) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '이벤트',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 300 }
                        }));
                        children.push(table);
                        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                    }
                }
                
                // Policy 테이블
                if (bc.policy && bc.policy.length > 0) {
                    const table = this.createEventStormingTable(bc.policy, '정책');
                    if (table) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '정책',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 300 }
                        }));
                        children.push(table);
                        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                    }
                }
                
                // ReadModel 테이블
                if (bc.readModel && bc.readModel.length > 0) {
                    const table = this.createEventStormingTable(bc.readModel, '읽기 모델');
                    if (table) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '읽기 모델',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 300 }
                        }));
                        children.push(table);
                        children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                    }
                }
                
                sections.push({
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: children
                });
            });
        });
        
        return sections;
    }

    /**
     * API 명세 섹션 생성
     */
    createApiSpecificationSections() {
        const sections = [];
        const models = this.extractEventStormingModels();
        
        if (!models || models.length === 0) return sections;
        
        // 1. 섹션 제목과 설명 (cover-section-title)
        sections.push({
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${this.sectionNumbers.apiSpecification}. API 명세`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 0, after: 300 }
                }),
                new Paragraph({
                    text: '각 바운디드 컨텍스트에서 제공하는 REST API 명세를 정의합니다.',
                    spacing: { before: 0, after: 400 }
                })
            ]
        });
        
        // 2. 각 바운디드 컨텍스트별 API 명세
        models.forEach((model, modelIndex) => {
            model.BoundedContexts.forEach((bc, bcIndex) => {
                if (!bc.command || bc.command.length === 0) return;
                
                const apiCommands = bc.command.filter(cmd => cmd.controllerInfo && cmd.controllerInfo.apiPath);
                if (apiCommands.length === 0) return;
                
                const table = this.createApiSpecificationTable(apiCommands);
                if (!table) return;
                
                sections.push({
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 1440,
                                bottom: 1440,
                                left: 1440
                            }
                        }
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `바운디드 컨텍스트: ${bc.name}`,
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 0, after: 400 }
                        }),
                        table
                    ]
                });
            });
        });
        
        return sections;
    }

    /**
     * 애그리거트 상세 정보 섹션 생성
     */
    createAggregateDetailSections() {
        const sections = [];
        const models = this.extractEventStormingModels();
        
        if (!models || models.length === 0) return sections;
        
        // 1. 섹션 제목과 설명 (cover-section-title)
        sections.push({
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440
                    }
                }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${this.sectionNumbers.aggregateDetail}. 애그리거트 상세 정보`,
                            size: 32, // 16pt
                            bold: true
                        })
                    ],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 0, after: 300 }
                }),
                new Paragraph({
                    text: '각 애그리거트의 상세한 구조와 속성을 정의합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '애그리거트 루트와 엔티티의 필드 정보, 관계, 도메인 규칙을 명시합니다.',
                    spacing: { before: 0, after: 200 }
                }),
                new Paragraph({
                    text: '비즈니스 불변식과 유효성 검증 규칙을 문서화합니다.',
                    spacing: { before: 0, after: 400 }
                })
            ]
        });
        
        // 2. 각 바운디드 컨텍스트별 애그리거트 상세 정보
        models.forEach((model, modelIndex) => {
            model.BoundedContexts.forEach((bc, bcIndex) => {
                if (!bc.aggregate || bc.aggregate.length === 0) return;
                
                bc.aggregate.forEach(agg => {
                    const children = [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `바운디드 컨텍스트: ${bc.name} - 애그리거트: ${agg.name}`,
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 0, after: 400 }
                        })
                    ];
                    
                    // 애그리거트 루트 필드
                    if (agg.aggregateRoot && agg.aggregateRoot.fieldDescriptors) {
                        const fieldTable = this.createFieldTable(agg.aggregateRoot.fieldDescriptors, '애그리거트 루트');
                        if (fieldTable) {
                            children.push(new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${agg.name} 애그리거트 루트 필드 정보`,
                                        size: 32, // 16pt
                                        bold: true
                                    })
                                ],
                                heading: HeadingLevel.HEADING_3,
                                spacing: { before: 0, after: 300 }
                            }));
                            children.push(fieldTable);
                            children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
                        }
                    }
                    
                    // 엔티티 정보
                    if (agg.aggregateRoot && agg.aggregateRoot.entities && agg.aggregateRoot.entities.elements) {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: '엔티티 정보',
                                    size: 32, // 16pt
                                    bold: true
                                })
                            ],
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 400, after: 300 }
                        }));
                        
                        Object.entries(agg.aggregateRoot.entities.elements).forEach(([id, entity]) => {
                            if (entity.fieldDescriptors) {
                                const entityTable = this.createFieldTable(entity.fieldDescriptors, entity.name);
                                if (entityTable) {
                                    children.push(new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: entity.name,
                                                size: 32, // 16pt
                                                bold: true
                                            })
                                        ],
                                        spacing: { before: 300, after: 200 }
                                    }));
                                    children.push(entityTable);
                                    children.push(new Paragraph({ text: '', spacing: { after: 300 } }));
                                }
                            }
                        });
                    }
                    
                    sections.push({
                        properties: {
                            page: {
                                margin: {
                                    top: 1440, // 1cm (다른 섹션과 동일)
                                    right: 1440,
                                    bottom: 1440,
                                    left: 1440
                                }
                            }
                        },
                        children: children
                    });
                });
            });
        });
        
        return sections;
    }
}
