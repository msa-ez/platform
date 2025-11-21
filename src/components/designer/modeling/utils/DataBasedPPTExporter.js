/**
 * DataBasedPPTExporter - 데이터 기반 PowerPoint 변환기
 * HTML 파싱 대신 원본 데이터를 직접 사용하여 안정적인 PowerPoint 문서 생성
 */

import PptxGenJS from 'pptxgenjs';
import { DataBasedDocumentExporterBase } from './DataBasedDocumentExporterBase';

export class DataBasedPPTExporter extends DataBasedDocumentExporterBase {
    constructor(projectInfo, draft, eventStormingModels, selectedSections, container = null) {
        super(projectInfo, draft, eventStormingModels, selectedSections, container);
    }

    /**
     * PowerPoint 문서 생성
     */
    async exportToPPT() {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_WIDE';
        pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 7.5 });
        pptx.layout = 'CUSTOM';
        
        // 표지 슬라이드
        this.createPPTCoverSlide(pptx);
        
        // 목차 슬라이드
        this.createPPTTableOfContentsSlide(pptx);
        
        // 각 섹션별로 슬라이드 생성
        if (this.selectedSections.userScenario) {
            await this.createPPTUserScenarioSlides(pptx);
        }
        
        if (this.selectedSections.valueStream) {
            await this.createPPTValueStreamSlides(pptx);
        }
        
        if (this.selectedSections.boundedContext) {
            await this.createPPTBoundedContextSlides(pptx);
        }
        
        if (this.selectedSections.aggregateDesign) {
            await this.createPPTAggregateDesignSlides(pptx);
        }
        
        if (this.selectedSections.eventStorming) {
            await this.createPPTEventStormingSlides(pptx);
        }
        
        if (this.selectedSections.apiSpecification) {
            await this.createPPTApiSpecificationSlides(pptx);
        }
        
        if (this.selectedSections.aggregateDetail) {
            await this.createPPTAggregateDetailSlides(pptx);
        }

        return await pptx.write({ outputType: 'blob' });
    }

    /**
     * 텍스트를 여러 줄로 분할하는 헬퍼 함수
     */
    splitTextIntoLines(text, maxCharsPerLine = 80) {
        if (!text) return [];
        
        const lines = [];
        const words = text.split(/\s+/);
        let currentLine = '';
        
        words.forEach(word => {
            if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
                currentLine = currentLine ? `${currentLine} ${word}` : word;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        });
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    /**
     * ArrayBuffer를 base64 data URL로 변환 (PPTXGenJS용)
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        // PPTXGenJS는 data URL 형식을 선호함
        return `data:image/png;base64,${base64}`;
    }

    /**
     * PPT 표지 슬라이드 생성
     */
    createPPTCoverSlide(pptx) {
        const slide = pptx.addSlide();
        if (!slide) {
            console.error('Failed to create cover slide');
            return;
        }
        slide.background = { color: 'FFFFFF' };
        
        slide.addText(this.projectInfo.projectName || 'Untitled', {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 48,
            bold: true,
            align: 'center',
            color: '000000'
        });
        
        slide.addText('시스템 설계 문서', {
            x: 0.5,
            y: 3.8,
            w: 9,
            h: 0.6,
            fontSize: 32,
            italic: true,
            align: 'center',
            color: '666666'
        });
    }

    /**
     * PPT 목차 슬라이드 생성
     */
    createPPTTableOfContentsSlide(pptx) {
        const slide = pptx.addSlide();
        if (!slide) {
            console.error('Failed to create table of contents slide');
            return;
        }
        slide.background = { color: 'FFFFFF' };
        
        slide.addText('목 차', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.8,
            fontSize: 36,
            bold: true,
            align: 'left',
            color: '000000'
        });
        
        let yPos = 1.5;
        const lineHeight = 0.4;
        
        if (this.selectedSections.userScenario) {
            slide.addText(`${this.sectionNumbers.userScenario}. 사용자 시나리오`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.valueStream) {
            slide.addText(`${this.sectionNumbers.valueStream}. 밸류 스트림`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.boundedContext) {
            slide.addText(`${this.sectionNumbers.boundedContext}. 바운디드 컨텍스트`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.aggregateDesign) {
            slide.addText(`${this.sectionNumbers.aggregateDesign}. 애그리거트 설계`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.eventStorming) {
            slide.addText(`${this.sectionNumbers.eventStorming}. 이벤트 스토밍`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.apiSpecification) {
            slide.addText(`${this.sectionNumbers.apiSpecification}. API 명세`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        }
        
        if (this.selectedSections.aggregateDetail) {
            slide.addText(`${this.sectionNumbers.aggregateDetail}. 애그리거트 상세 정보`, {
                x: 1,
                y: yPos,
                w: 8,
                h: lineHeight,
                fontSize: 20,
                align: 'left',
                color: '000000'
            });
        }
    }

    /**
     * PPT 사용자 시나리오 슬라이드 생성
     */
    async createPPTUserScenarioSlides(pptx) {
        if (!this.projectInfo || !this.projectInfo.userStory) return;
        
        const fullText = this.projectInfo.userStory;
        if (!fullText || !fullText.trim()) return;
        
        // 전체 텍스트를 줄 단위로 분리
        const allLines = fullText.split('\n');
        
        let currentSlide = pptx.addSlide();
        if (!currentSlide) {
            console.error('Failed to create user scenario slide');
            return;
        }
        currentSlide.background = { color: 'FFFFFF' };
        
        // 제목 추가
        currentSlide.addText(`${this.sectionNumbers.userScenario}. 사용자 시나리오`, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.6,
            fontSize: 32,
            bold: true,
            align: 'left',
            color: '000000'
        });
        
        // 제목의 실제 하단 계산
        // 제목: y: 0.3, h: 0.6 → 이론적 하단: 0.9
        // 하지만 fontSize: 32, bold: true이므로 실제로는 더 많은 공간을 차지할 수 있음
        // PPTXGenJS에서 텍스트 박스의 h는 최소 높이일 수 있고, 실제 텍스트가 더 길면 자동으로 확장됨
        // 제목의 실제 하단을 더 보수적으로 계산: y: 0.3 + h: 0.6 + 여유: 0.4 = 1.3
        // 그 이후 충분한 여백(0.4)을 두고 시작 = 1.7
        const titleY = 0.3;
        const titleH = 0.6;
        const titleSafetyMargin = 0.4; // 제목의 실제 높이 여유 (폰트 크기와 bold를 고려, 더 보수적으로)
        const titleBottomUserScenario = titleY + titleH + titleSafetyMargin; // 1.3
        const titleMarginUserScenario = 0.4; // 제목과 본문 간 충분한 여백 (0.3 → 0.4로 증가)
        let yPos = titleBottomUserScenario + titleMarginUserScenario; // 1.7 - 제목 하단 이후 충분한 여백을 두고 시작
        const maxY = 7.0; // 슬라이드 최대 높이
        const fontSize = 16;
        const lineHeight = 0.25; // 줄 높이
        const maxLinesPerBox = 18; // 텍스트 박스당 최대 줄 수
        const boxSpacing = 0.2; // 텍스트 박스 간 간격
        
        let currentBoxLines = [];
        let currentBoxLineCount = 0;
        let isFirstBoxCreated = false; // 첫 번째 박스 생성 여부 추적
        
        for (let i = 0; i < allLines.length; i++) {
            const line = allLines[i];
            const isLastLine = (i === allLines.length - 1);
            
            // 현재 줄을 박스에 추가
            currentBoxLines.push(line);
            currentBoxLineCount++;
            
            // 텍스트 박스를 생성해야 하는 조건:
            // 1. 최대 줄 수에 도달했거나
            // 2. 마지막 줄이거나
            // 3. 다음 줄을 추가하면 슬라이드 높이를 초과할 때
            const boxHeight = currentBoxLineCount * lineHeight;
            const shouldCreateBox = 
                currentBoxLineCount >= maxLinesPerBox ||
                isLastLine ||
                (yPos + boxHeight > maxY - 0.2); // 하단 여백 고려
            
            if (shouldCreateBox && currentBoxLines.length > 0) {
                // 새 슬라이드가 필요한지 확인 (현재 위치 + 박스 높이가 최대 높이를 넘으면)
                if (yPos + boxHeight > maxY - 0.2 && yPos > titleBottomUserScenario + titleMarginUserScenario) {
                    // 새 슬라이드 생성
                    currentSlide = pptx.addSlide();
                    if (!currentSlide) break;
                    currentSlide.background = { color: 'FFFFFF' };
                    currentSlide.addText(`${this.sectionNumbers.userScenario}. 사용자 시나리오 (계속)`, {
                        x: 0.5,
                        y: 0.3,
                        w: 9,
                        h: 0.6,
                        fontSize: 32,
                        bold: true,
                        align: 'left',
                        color: '000000'
                    });
                    // 새 슬라이드에서는 제목 하단 이후 충분한 여백을 두고 시작
                    // 제목 추가 후 yPos 재설정
                    yPos = titleBottomUserScenario + titleMarginUserScenario; // 1.7
                    isFirstBoxCreated = false; // 새 슬라이드에서는 첫 번째 박스로 리셋
                }
                
                // 첫 번째 텍스트 박스인 경우 yPos를 강제로 설정
                // 첫 번째 박스는 항상 제목 하단 이후 충분한 여백을 두고 시작해야 함
                if (!isFirstBoxCreated) {
                    yPos = titleBottomUserScenario + titleMarginUserScenario; // 1.7
                    isFirstBoxCreated = true; // 첫 번째 박스 생성 완료
                } else if (yPos < titleBottomUserScenario + titleMarginUserScenario) {
                    // 안전장치: yPos가 예상보다 작으면 강제로 설정
                    yPos = titleBottomUserScenario + titleMarginUserScenario; // 1.7
                }
                
                // 텍스트 박스 생성
                const textContent = currentBoxLines.join('\n');
                const actualBoxHeight = Math.min(boxHeight, maxY - yPos - 0.2); // 하단 여백 고려
                
                currentSlide.addText(textContent, {
                    x: 0.5,
                    y: yPos,
                    w: 9,
                    h: actualBoxHeight,
                    fontSize: fontSize,
                    align: 'left',
                    color: '000000',
                    wrap: true
                });
                
                // y 위치 업데이트
                yPos += actualBoxHeight + boxSpacing;
                
                // 다음 박스를 위해 초기화
                currentBoxLines = [];
                currentBoxLineCount = 0;
            }
        }
    }

    /**
     * PPT 밸류 스트림 슬라이드 생성
     */
    async createPPTValueStreamSlides(pptx) {
        if (!this.draft || !this.draft.events) return;
        const paths = this.extractValueStreamPaths(this.draft.events || []);
        if (!paths || paths.length === 0) return;
        
        const slide = pptx.addSlide();
        if (!slide) {
            console.error('Failed to create value stream slide');
            return;
        }
        slide.background = { color: 'FFFFFF' };
        
        slide.addText(`${this.sectionNumbers.valueStream}. 밸류 스트림`, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.6,
            fontSize: 36,
            bold: true,
            align: 'left',
            color: '000000'
        });
        
        let yPos = 1.2;
        const lineHeight = 0.25;
        
        paths.forEach((path, index) => {
            if (yPos > 6.5) return;
            const pathTitle = `경로 ${index + 1}: ${path.map(e => e.displayName || e.name).join(' → ')}`;
            slide.addText(pathTitle, {
                x: 0.5,
                y: yPos,
                w: 9,
                h: lineHeight,
                fontSize: 18,
                bold: true,
                align: 'left',
                color: '000000'
            });
            yPos += lineHeight + 0.1;
        });
    }

    /**
     * PPT 바운디드 컨텍스트 슬라이드 생성
     */
    async createPPTBoundedContextSlides(pptx) {
        const bcResult = this.extractBoundedContextResult();
        const generationOption = this.extractGenerationOption();
        if (!bcResult) return;
        
        // 분해 기준 슬라이드
        const slide1 = pptx.addSlide();
        if (!slide1) {
            console.error('Failed to create bounded context slide 1');
            return;
        }
        slide1.background = { color: 'FFFFFF' };
        slide1.addText(`${this.sectionNumbers.boundedContext}-1. 분해 기준`, {
            x: 0.5,
            y: 0.3,
            w: 9,
            h: 0.6,
            fontSize: 32,
            bold: true,
            align: 'left',
            color: '000000'
        });
        
        // 제목 하단 이후 충분한 여백을 두고 시작
        const titleBottomBoundedContext = 0.3 + 0.6; // 0.9
        const titleMarginBoundedContext = 0.5; // 제목과 본문 간 충분한 여백
        let yPos = titleBottomBoundedContext + titleMarginBoundedContext; // 1.4
        // 선택된 관점들
        if (generationOption && generationOption.selectedAspects && generationOption.selectedAspects.length > 0) {
            generationOption.selectedAspects.forEach(aspect => {
                if (yPos > 6.5) return;
                slide1.addText(`• ${aspect}`, {
                    x: 0.8,
                    y: yPos,
                    w: 8.5,
                    h: 0.3,
                    fontSize: 18,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                yPos += 0.4;
            });
        }
        
        // 추가 요구사항
        if (generationOption && generationOption.additionalOptions) {
            if (yPos > 6.0) {
                // 새 슬라이드 생성
                const newSlide = pptx.addSlide();
                if (newSlide) {
                    newSlide.background = { color: 'FFFFFF' };
                    newSlide.addText(`${this.sectionNumbers.boundedContext}-1. 분해 기준 (계속)`, {
                        x: 0.5,
                        y: 0.3,
                        w: 9,
                        h: 0.6,
                        fontSize: 32,
                        bold: true,
                        align: 'left',
                        color: '000000'
                    });
                    yPos = titleBottomBoundedContext + titleMarginBoundedContext; // 1.4
                }
            }
            
            if (yPos <= 6.0) {
                slide1.addText('추가 요구사항:', {
                    x: 0.5,
                    y: yPos,
                    w: 9,
                    h: 0.4,
                    fontSize: 20,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                yPos += 0.5;
                
                // 긴 텍스트는 여러 줄로 분할
                const lines = this.splitTextIntoLines(generationOption.additionalOptions, 80);
                lines.forEach(line => {
                    if (yPos > 6.5) return;
                    slide1.addText(line, {
                        x: 0.8,
                        y: yPos,
                        w: 8.5,
                        h: 0.25,
                        fontSize: 16,
                        align: 'left',
                        color: '000000'
                    });
                    yPos += 0.3;
                });
            }
        }
        
        // 분해 결과 (Mermaid 이미지) 슬라이드
        if (this.container) {
            const slide2 = pptx.addSlide();
            if (!slide2) {
                console.error('Failed to create bounded context slide 2');
                return;
            }
            slide2.background = { color: 'FFFFFF' };
            slide2.addText(`${this.sectionNumbers.boundedContext}-2. 분해 결과`, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: 32,
                bold: true,
                align: 'left',
                color: '000000'
            });
            
            const mermaidImage = await this.captureMermaidImage('vue-mermaid');
            if (mermaidImage) {
                try {
                    // ArrayBuffer를 base64로 변환
                    const base64Image = this.arrayBufferToBase64(mermaidImage);
                    slide2.addImage({
                        data: base64Image,
                        x: 0.5,
                        y: 1.2,
                        w: 9,
                        h: 5.5
                    });
                } catch (error) {
                    console.error('Failed to add mermaid image to slide:', error);
                    slide2.addText('다이어그램을 불러올 수 없습니다.', {
                        x: 0.5,
                        y: 3,
                        w: 9,
                        h: 1,
                        fontSize: 18,
                        align: 'center',
                        color: '666666'
                    });
                }
            } else {
                slide2.addText('다이어그램을 찾을 수 없습니다.', {
                    x: 0.5,
                    y: 3,
                    w: 9,
                    h: 1,
                    fontSize: 18,
                    align: 'center',
                    color: '666666'
                });
            }
        }
        
        // 컨텍스트 전략 맵 슬라이드
        if (this.container) {
            const slide3 = pptx.addSlide();
            if (!slide3) {
                console.error('Failed to create bounded context slide 3');
                return;
            }
            slide3.background = { color: 'FFFFFF' };
            slide3.addText(`${this.sectionNumbers.boundedContext}-3. 컨텍스트 전략 맵`, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: 32,
                bold: true,
                align: 'left',
                color: '000000'
            });
            
            const matrixImage = await this.captureBoundedContextMatrixImage();
            if (matrixImage) {
                try {
                    // ArrayBuffer를 base64로 변환
                    const base64Image = this.arrayBufferToBase64(matrixImage);
                    slide3.addImage({
                        data: base64Image,
                        x: 0.5,
                        y: 1.2,
                        w: 9,
                        h: 5.5
                    });
                } catch (error) {
                    console.error('Failed to add matrix image to slide:', error);
                    slide3.addText('컨텍스트 전략 맵을 불러올 수 없습니다.', {
                        x: 0.5,
                        y: 3,
                        w: 9,
                        h: 1,
                        fontSize: 18,
                        align: 'center',
                        color: '666666'
                    });
                }
            } else {
                slide3.addText('컨텍스트 전략 맵을 찾을 수 없습니다.', {
                    x: 0.5,
                    y: 3,
                    w: 9,
                    h: 1,
                    fontSize: 18,
                    align: 'center',
                    color: '666666'
                });
            }
        }
        
        // 분해 이유 텍스트 추가 (독립적인 섹션으로 분리)
        if (bcResult.thoughts) {
            const fullText = bcResult.thoughts;
            if (fullText && fullText.trim()) {
                // 전체 텍스트를 줄 단위로 분리
                const allLines = fullText.split('\n');
                
                let currentSlide = pptx.addSlide();
                if (!currentSlide) {
                    console.error('Failed to create thoughts slide');
                    return;
                }
                currentSlide.background = { color: 'FFFFFF' };
                
                // 제목 추가
                currentSlide.addText('분해 이유', {
                    x: 0.5,
                    y: 0.3,
                    w: 9,
                    h: 0.6,
                    fontSize: 32,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                // 제목의 실제 하단 계산
                // 제목: y: 0.3, h: 0.6 → 이론적 하단: 0.9
                // 하지만 fontSize: 32, bold: true이므로 실제로는 더 많은 공간을 차지할 수 있음
                // PPTXGenJS에서 텍스트 박스의 h는 최소 높이일 수 있고, 실제 텍스트가 더 길면 자동으로 확장됨
                // 제목의 실제 하단을 더 보수적으로 계산: y: 0.3 + h: 0.6 + 여유: 0.4 = 1.3
                // 그 이후 충분한 여백(0.5)을 두고 시작 = 1.8
                const titleY = 0.3;
                const titleH = 0.6;
                const titleSafetyMargin = 0.4; // 제목의 실제 높이 여유 (폰트 크기와 bold를 고려, 더 보수적으로)
                const titleBottomThoughts = titleY + titleH + titleSafetyMargin; // 1.3
                const titleMarginThoughts = 0.5; // 제목과 본문 간 충분한 여백 (0.4 → 0.5로 증가)
                let yPos = titleBottomThoughts + titleMarginThoughts; // 1.8 - 제목 하단 이후 충분한 여백을 두고 시작
                const maxY = 7.0; // 슬라이드 최대 높이
                const fontSize = 16;
                const lineHeight = 0.25; // 줄 높이
                const maxLinesPerBox = 18; // 텍스트 박스당 최대 줄 수
                const boxSpacing = 0.2; // 텍스트 박스 간 간격
                
                let currentBoxLines = [];
                let currentBoxLineCount = 0;
                let isFirstBoxCreated = false; // 첫 번째 박스 생성 여부 추적
                
                for (let i = 0; i < allLines.length; i++) {
                    const line = allLines[i];
                    const isLastLine = (i === allLines.length - 1);
                    
                    // 현재 줄을 박스에 추가
                    currentBoxLines.push(line);
                    currentBoxLineCount++;
                    
                    // 텍스트 박스를 생성해야 하는 조건:
                    // 1. 최대 줄 수에 도달했거나
                    // 2. 마지막 줄이거나
                    // 3. 다음 줄을 추가하면 슬라이드 높이를 초과할 때
                    const boxHeight = currentBoxLineCount * lineHeight;
                    const shouldCreateBox = 
                        currentBoxLineCount >= maxLinesPerBox ||
                        isLastLine ||
                        (yPos + boxHeight > maxY - 0.2); // 하단 여백 고려
                    
                    if (shouldCreateBox && currentBoxLines.length > 0) {
                        // 새 슬라이드가 필요한지 확인 (현재 위치 + 박스 높이가 최대 높이를 넘으면)
                        if (yPos + boxHeight > maxY - 0.2 && yPos > titleBottomThoughts + titleMarginThoughts) {
                            // 새 슬라이드 생성
                            currentSlide = pptx.addSlide();
                            if (!currentSlide) break;
                            currentSlide.background = { color: 'FFFFFF' };
                            currentSlide.addText('분해 이유 (계속)', {
                                x: 0.5,
                                y: 0.3,
                                w: 9,
                                h: 0.6,
                                fontSize: 32,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            // 새 슬라이드에서는 제목 하단 이후 충분한 여백을 두고 시작
                            // 제목 추가 후 yPos 재설정
                            yPos = titleBottomThoughts + titleMarginThoughts; // 1.8
                            isFirstBoxCreated = false; // 새 슬라이드에서는 첫 번째 박스로 리셋
                        }
                        
                        // 첫 번째 텍스트 박스인 경우 yPos를 강제로 설정
                        // 첫 번째 박스는 항상 제목 하단 이후 충분한 여백을 두고 시작해야 함
                        if (!isFirstBoxCreated) {
                            yPos = titleBottomThoughts + titleMarginThoughts; // 1.8
                            isFirstBoxCreated = true; // 첫 번째 박스 생성 완료
                        } else if (yPos < titleBottomThoughts + titleMarginThoughts) {
                            // 안전장치: yPos가 예상보다 작으면 강제로 설정
                            yPos = titleBottomThoughts + titleMarginThoughts; // 1.8
                        }
                        
                        // 텍스트 박스 생성
                        const textContent = currentBoxLines.join('\n');
                        // 텍스트 박스 높이 제한 제거: 슬라이드를 넘어가도 되지만 타이틀 영역은 침범하지 않도록
                        // wrap: true로 자동 줄바꿈 처리, 높이는 계산된 boxHeight 사용
                        const actualBoxHeight = boxHeight;
                        
                        // 텍스트 박스가 슬라이드 하단을 넘어가는지 확인
                        // 넘어가면 새 슬라이드로 분할하되, 타이틀 영역(1.3 이하)은 절대 침범하지 않음
                        if (yPos + actualBoxHeight > maxY && yPos > titleBottomThoughts + titleMarginThoughts) {
                            // 현재 박스를 새 슬라이드로 이동
                            currentSlide = pptx.addSlide();
                            if (!currentSlide) break;
                            currentSlide.background = { color: 'FFFFFF' };
                            currentSlide.addText('분해 이유 (계속)', {
                                x: 0.5,
                                y: 0.3,
                                w: 9,
                                h: 0.6,
                                fontSize: 32,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            yPos = titleBottomThoughts + titleMarginThoughts; // 1.7
                            isFirstBoxCreated = false;
                        }
                        
                        currentSlide.addText(textContent, {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            h: actualBoxHeight,
                            fontSize: fontSize,
                            align: 'left',
                            color: '000000',
                            wrap: true
                        });
                        
                        // y 위치 업데이트
                        yPos += actualBoxHeight + boxSpacing;
                        
                        // 다음 박스를 위해 초기화
                        currentBoxLines = [];
                        currentBoxLineCount = 0;
                    }
                }
            }
        }
        
        // 상세 정보 - 바운디드 컨텍스트 테이블 (별도 슬라이드)
        if (bcResult.boundedContexts && bcResult.boundedContexts.length > 0) {
            const slide4 = pptx.addSlide();
            if (slide4) {
                slide4.background = { color: 'FFFFFF' };
                slide4.addText(`${this.sectionNumbers.boundedContext}-4. 상세 정보`, {
                    x: 0.5,
                    y: 0.3,
                    w: 9,
                    h: 0.6,
                    fontSize: 32,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                slide4.addText('바운디드 컨텍스트 상세 정보', {
                    x: 0.5,
                    y: 1.0,
                    w: 9,
                    h: 0.4,
                    fontSize: 24,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                const bcTable = this.createPPTBoundedContextTable(bcResult.boundedContexts);
                if (bcTable && bcTable.length > 0) {
                    slide4.addTable(bcTable, {
                        x: 0.5,
                        y: 1.5,
                        w: 9,
                        colW: [2, 2.5, 1.5, 3]
                    });
                }
            }
        }
        
        // 컨텍스트 간 관계 테이블 (별도 슬라이드)
        const relations = bcResult.explanations || bcResult.relations || [];
        if (relations && relations.length > 0) {
            const slide5 = pptx.addSlide();
            if (slide5) {
                slide5.background = { color: 'FFFFFF' };
                slide5.addText(`${this.sectionNumbers.boundedContext}-4. 상세 정보`, {
                    x: 0.5,
                    y: 0.3,
                    w: 9,
                    h: 0.6,
                    fontSize: 32,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                slide5.addText('컨텍스트 간 관계', {
                    x: 0.5,
                    y: 1.0,
                    w: 9,
                    h: 0.4,
                    fontSize: 24,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                const relationsTable = this.createPPTRelationsTable(relations);
                if (relationsTable && relationsTable.length > 0) {
                    slide5.addTable(relationsTable, {
                        x: 0.5,
                        y: 1.5,
                        w: 9,
                        colW: [2, 2, 2, 3]
                    });
                }
            }
        }
    }

    /**
     * PPT 애그리거트 설계 슬라이드 생성
     */
    async createPPTAggregateDesignSlides(pptx) {
        const aggregateDrafts = this.extractAggregateDrafts();
        if (!aggregateDrafts || aggregateDrafts.length === 0) return;
        
        // 섹션 제목 슬라이드
        const titleSlide = pptx.addSlide();
        if (!titleSlide) {
            console.error('Failed to create aggregate design title slide');
            return;
        }
        titleSlide.background = { color: 'FFFFFF' };
        titleSlide.addText(`${this.sectionNumbers.aggregateDesign}. 애그리거트 설계`, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 44,
            bold: true,
            align: 'center',
            color: '000000'
        });
        
        for (const draft of aggregateDrafts) {
            // 애그리거트 모델 슬라이드 (Mermaid 이미지)
            if (this.container) {
                const slide = pptx.addSlide();
                if (!slide) {
                    console.error('Failed to create aggregate model slide');
                    continue;
                }
                slide.background = { color: 'FFFFFF' };
                slide.addText(`${this.sectionNumbers.aggregateDesign}-1. 애그리거트 모델: ${draft.boundedContextAlias || 'Unknown'}`, {
                    x: 0.5,
                    y: 0.3,
                    w: 9,
                    h: 0.6,
                    fontSize: 28,
                    bold: true,
                    align: 'left',
                    color: '000000'
                });
                
                const mermaidImage = await this.captureAggregateMermaidImage(draft);
                if (mermaidImage) {
                    try {
                        // ArrayBuffer를 base64로 변환
                        const base64Image = this.arrayBufferToBase64(mermaidImage);
                        slide.addImage({
                            data: base64Image,
                            x: 0.5,
                            y: 1.2,
                            w: 9,
                            h: 5.5
                        });
                    } catch (error) {
                        console.error('Failed to add aggregate mermaid image to slide:', error);
                        slide.addText('애그리거트 다이어그램을 불러올 수 없습니다.', {
                            x: 0.5,
                            y: 3,
                            w: 9,
                            h: 1,
                            fontSize: 18,
                            align: 'center',
                            color: '666666'
                        });
                    }
                } else {
                    slide.addText('애그리거트 다이어그램을 찾을 수 없습니다.', {
                        x: 0.5,
                        y: 3,
                        w: 9,
                        h: 1,
                        fontSize: 18,
                        align: 'center',
                        color: '666666'
                    });
                }
            }
            
            // 애그리거트 분석 슬라이드 (Pros/Cons 테이블)
            const analysisSlide = pptx.addSlide();
            if (!analysisSlide) {
                console.error('Failed to create aggregate analysis slide');
                continue;
            }
            analysisSlide.background = { color: 'FFFFFF' };
            analysisSlide.addText(`${this.sectionNumbers.aggregateDesign}-2. 애그리거트 분석: ${draft.boundedContextAlias || 'Unknown'}`, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: 28,
                bold: true,
                align: 'left',
                color: '000000'
            });
            
            if (draft.options && draft.options.length > 0) {
                const option = draft.options[0];
                const prosConsTable = this.createPPTProsConsTable(option.pros || {}, option.cons || {});
                if (prosConsTable && prosConsTable.length > 0) {
                    analysisSlide.addTable(prosConsTable, {
                        x: 0.5,
                        y: 1.2,
                        w: 9,
                        h: Math.min(prosConsTable.length * 0.4, 5),
                        colW: [2, 3.5, 3.5]
                    });
                }
            }
            
            // 설계 기준 슬라이드 - 페이지당 한 테이블만
            if (draft.options && draft.options.length > 0) {
                const option = draft.options[0];
                if (option.analysisResult) {
                    // 비즈니스 규칙 테이블 (별도 슬라이드)
                    if (option.analysisResult.businessRules && option.analysisResult.businessRules.length > 0) {
                        const rulesSlide = pptx.addSlide();
                        if (rulesSlide) {
                            rulesSlide.background = { color: 'FFFFFF' };
                            rulesSlide.addText(`${this.sectionNumbers.aggregateDesign}-3. 설계 기준: ${draft.boundedContextAlias || 'Unknown'}`, {
                                x: 0.5,
                                y: 0.3,
                                w: 9,
                                h: 0.6,
                                fontSize: 28,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            
                            rulesSlide.addText('비즈니스 규칙', {
                                x: 0.5,
                                y: 1.0,
                                w: 9,
                                h: 0.4,
                                fontSize: 24,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            
                            const rulesTable = this.createPPTBusinessRulesTable(option.analysisResult.businessRules);
                            if (rulesTable && rulesTable.length > 0) {
                                rulesSlide.addTable(rulesTable, {
                                    x: 0.5,
                                    y: 1.5,
                                    w: 9,
                                    colW: [2, 7]
                                });
                            }
                        }
                    }
                    
                    // 엔티티 정의 테이블 (엔티티별로 별도 슬라이드)
                    if (option.analysisResult.entities) {
                        Object.entries(option.analysisResult.entities).forEach(([entityName, entity]) => {
                            if (!entity.properties || entity.properties.length === 0) return;
                            
                            const entitySlide = pptx.addSlide();
                            if (entitySlide) {
                                entitySlide.background = { color: 'FFFFFF' };
                                entitySlide.addText(`${this.sectionNumbers.aggregateDesign}-3. 설계 기준: ${draft.boundedContextAlias || 'Unknown'}`, {
                                    x: 0.5,
                                    y: 0.3,
                                    w: 9,
                                    h: 0.6,
                                    fontSize: 28,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                
                                entitySlide.addText('엔티티 정의', {
                                    x: 0.5,
                                    y: 1.0,
                                    w: 9,
                                    h: 0.4,
                                    fontSize: 24,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                
                                entitySlide.addText(entityName, {
                                    x: 0.5,
                                    y: 1.4,
                                    w: 9,
                                    h: 0.3,
                                    fontSize: 20,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                
                                const entityTable = this.createPPTEntityDefinitionTable(entity.properties);
                                if (entityTable && entityTable.length > 0) {
                                    entitySlide.addTable(entityTable, {
                                        x: 0.5,
                                        y: 1.8,
                                        w: 9,
                                        colW: [2, 1.5, 1, 4.5]
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    /**
     * PPT 이벤트 스토밍 슬라이드 생성
     */
    async createPPTEventStormingSlides(pptx) {
        const models = this.extractEventStormingModels();
        if (!models || models.length === 0) return;
        
        // 섹션 제목 슬라이드
        const titleSlide = pptx.addSlide();
        if (!titleSlide) {
            console.error('Failed to create event storming title slide');
            return;
        }
        titleSlide.background = { color: 'FFFFFF' };
        titleSlide.addText(`${this.sectionNumbers.eventStorming}. 이벤트 스토밍`, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 44,
            bold: true,
            align: 'center',
            color: '000000'
        });
        
                models.forEach((model, modelIndex) => {
            model.BoundedContexts.forEach((bc, bcIndex) => {
                // Aggregate 테이블 (페이지당 한 테이블)
                if (bc.aggregate && bc.aggregate.length > 0) {
                    const table = this.createPPTEventStormingTable(bc.aggregate);
                    if (table && table.length > 0) {
                        let slide = pptx.addSlide();
                        if (!slide) {
                            console.error('Failed to create event storming slide');
                            return;
                        }
                        slide.background = { color: 'FFFFFF' };
                        slide.addText(`${this.sectionNumbers.eventStorming}-${bcIndex + 1}. 바운디드 컨텍스트: ${bc.name || 'Unknown'} - 애그리거트`, {
                            x: 0.5,
                            y: 0.3,
                            w: 9,
                            h: 0.6,
                            fontSize: 28,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        
                        let yPos = 1.2;
                        const titleHeight = 0.4;
                        const spacing = 0.2;
                        
                        slide.addText('애그리거트', {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            h: titleHeight,
                            fontSize: 24,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        yPos += titleHeight + spacing;
                        
                        slide.addTable(table, {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            colW: [2, 7]
                        });
                    }
                }
                
                // Command 테이블 (페이지당 한 테이블)
                if (bc.command && bc.command.length > 0) {
                    const table = this.createPPTEventStormingTable(bc.command);
                    if (table && table.length > 0) {
                        let slide = pptx.addSlide();
                        if (!slide) {
                            console.error('Failed to create event storming slide');
                            return;
                        }
                        slide.background = { color: 'FFFFFF' };
                        slide.addText(`${this.sectionNumbers.eventStorming}-${bcIndex + 1}. 바운디드 컨텍스트: ${bc.name || 'Unknown'} - 커맨드`, {
                            x: 0.5,
                            y: 0.3,
                            w: 9,
                            h: 0.6,
                            fontSize: 28,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        
                        let yPos = 1.2;
                        const titleHeight = 0.4;
                        const spacing = 0.2;
                        
                        slide.addText('커맨드', {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            h: titleHeight,
                            fontSize: 24,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        yPos += titleHeight + spacing;
                        
                        slide.addTable(table, {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            colW: [2, 7]
                        });
                    }
                }
                
                // Event 테이블 (페이지당 한 테이블)
                if (bc.event && bc.event.length > 0) {
                    const table = this.createPPTEventStormingTable(bc.event);
                    if (table && table.length > 0) {
                        let slide = pptx.addSlide();
                        if (!slide) {
                            console.error('Failed to create event storming slide');
                            return;
                        }
                        slide.background = { color: 'FFFFFF' };
                        slide.addText(`${this.sectionNumbers.eventStorming}-${bcIndex + 1}. 바운디드 컨텍스트: ${bc.name || 'Unknown'} - 이벤트`, {
                            x: 0.5,
                            y: 0.3,
                            w: 9,
                            h: 0.6,
                            fontSize: 28,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        
                        let yPos = 1.2;
                        const titleHeight = 0.4;
                        const spacing = 0.2;
                        
                        slide.addText('이벤트', {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            h: titleHeight,
                            fontSize: 24,
                            bold: true,
                            align: 'left',
                            color: '000000'
                        });
                        yPos += titleHeight + spacing;
                        
                        slide.addTable(table, {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            colW: [2, 7]
                        });
                    }
                }
            });
        });
    }

    /**
     * PPT API 명세 슬라이드 생성
     */
    async createPPTApiSpecificationSlides(pptx) {
        const commands = this.extractCommands();
        if (!commands || commands.length === 0) return;
        
        // 섹션 제목 슬라이드
        const titleSlide = pptx.addSlide();
        if (!titleSlide) {
            console.error('Failed to create API specification title slide');
            return;
        }
        titleSlide.background = { color: 'FFFFFF' };
        titleSlide.addText(`${this.sectionNumbers.apiSpecification}. API 명세`, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 44,
            bold: true,
            align: 'center',
            color: '000000'
        });
        
        // 바운디드 컨텍스트별로 그룹화
        const bcGroups = {};
        commands
            .filter(cmd => cmd.controllerInfo && cmd.controllerInfo.apiPath)
            .forEach(cmd => {
                const bcName = (cmd.boundedContext && cmd.boundedContext.name) || 'Unknown';
                if (!bcGroups[bcName]) {
                    bcGroups[bcName] = [];
                }
                bcGroups[bcName].push(cmd);
            });
        
        Object.entries(bcGroups).forEach(([bcName, bcCommands]) => {
            const slide = pptx.addSlide();
            if (!slide) {
                console.error('Failed to create API specification slide');
                return;
            }
            slide.background = { color: 'FFFFFF' };
            slide.addText(`바운디드 컨텍스트: ${bcName}`, {
                x: 0.5,
                y: 0.3,
                w: 9,
                h: 0.6,
                fontSize: 28,
                bold: true,
                align: 'left',
                color: '000000'
            });
            
            const apiTable = this.createPPTApiSpecificationTable(bcCommands);
            if (apiTable && apiTable.length > 0) {
                const rowHeight = 0.25;
                const maxY = 7.0;
                let currentSlide = slide;
                let yPos = 1.2;
                
                // 테이블이 너무 크면 여러 슬라이드로 분할
                // 헤더 1행 + 데이터 행들이므로 실제 데이터 행만 계산
                const dataRows = apiTable.length - 1; // 헤더 제외
                const maxDataRowsPerSlide = Math.floor((maxY - yPos - 0.5) / rowHeight) - 1; // 여유 공간 고려
                
                if (dataRows > maxDataRowsPerSlide && maxDataRowsPerSlide > 0) {
                    // 여러 슬라이드에 나누어 배치
                    const headerRow = apiTable[0]; // 헤더 저장
                    
                    for (let i = 1; i < apiTable.length; i += maxDataRowsPerSlide) {
                        if (i > 1) {
                            // 새 슬라이드 생성 (첫 번째가 아닌 경우)
                            currentSlide = pptx.addSlide();
                            if (!currentSlide) break;
                            currentSlide.background = { color: 'FFFFFF' };
                            currentSlide.addText(`바운디드 컨텍스트: ${bcName} (계속)`, {
                                x: 0.5,
                                y: 0.3,
                                w: 9,
                                h: 0.6,
                                fontSize: 28,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            yPos = 1.2;
                        }
                        
                        // 헤더 + 데이터 행들
                        const slicedTable = [headerRow, ...apiTable.slice(i, i + maxDataRowsPerSlide)];
                        
                        currentSlide.addTable(slicedTable, {
                            x: 0.5,
                            y: yPos,
                            w: 9,
                            colW: [2, 1, 1.5, 2, 2.5]
                        });
                    }
                } else {
                    // 한 슬라이드에 모두 배치
                    slide.addTable(apiTable, {
                        x: 0.5,
                        y: yPos,
                        w: 9,
                        colW: [2, 1, 1.5, 2, 2.5]
                    });
                }
            }
        });
    }

    /**
     * PPT 애그리거트 상세 정보 슬라이드 생성
     */
    async createPPTAggregateDetailSlides(pptx) {
        const models = this.extractEventStormingModels();
        if (!models || models.length === 0) return;
        
        // 섹션 제목 슬라이드
        const titleSlide = pptx.addSlide();
        if (!titleSlide) {
            console.error('Failed to create aggregate detail title slide');
            return;
        }
        titleSlide.background = { color: 'FFFFFF' };
        titleSlide.addText(`${this.sectionNumbers.aggregateDetail}. 애그리거트 상세 정보`, {
            x: 0.5,
            y: 2.5,
            w: 9,
            h: 1,
            fontSize: 44,
            bold: true,
            align: 'center',
            color: '000000'
        });
        
        models.forEach((model, modelIndex) => {
            model.BoundedContexts.forEach((bc, bcIndex) => {
                if (!bc.aggregate || bc.aggregate.length === 0) return;
                
                bc.aggregate.forEach(agg => {
                    // 애그리거트 루트 필드 테이블 (페이지당 한 테이블)
                    if (agg.aggregateRoot && agg.aggregateRoot.fieldDescriptors) {
                        const fieldTable = this.createPPTFieldTable(agg.aggregateRoot.fieldDescriptors);
                        if (fieldTable && fieldTable.length > 0) {
                            const slide = pptx.addSlide();
                            if (!slide) {
                                console.error('Failed to create aggregate detail slide');
                                return;
                            }
                            slide.background = { color: 'FFFFFF' };
                            slide.addText(`바운디드 컨텍스트: ${bc.name || 'Unknown'} - 애그리거트: ${agg.name || 'Unknown'} - 필드 정보`, {
                                x: 0.5,
                                y: 0.3,
                                w: 9,
                                h: 0.6,
                                fontSize: 24,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            
                            let yPos = 1.15;
                            
                            slide.addText(`${agg.name} 애그리거트 루트 필드 정보`, {
                                x: 0.5,
                                y: yPos,
                                w: 9,
                                h: 0.4,
                                fontSize: 20,
                                bold: true,
                                align: 'left',
                                color: '000000'
                            });
                            yPos += 0.5;
                            
                            slide.addTable(fieldTable, {
                                x: 0.5,
                                y: yPos,
                                w: 9,
                                colW: [2, 1.5, 1, 4.5]
                            });
                        }
                    }
                    
                    // 엔티티 정보 (각 엔티티당 별도 슬라이드)
                    if (agg.aggregateRoot && agg.aggregateRoot.entities && agg.aggregateRoot.entities.elements) {
                        Object.entries(agg.aggregateRoot.entities.elements).forEach(([id, entity]) => {
                            if (!entity.fieldDescriptors || entity.fieldDescriptors.length === 0) return;
                            
                            const entityTable = this.createPPTFieldTable(entity.fieldDescriptors);
                            if (entityTable && entityTable.length > 0) {
                                const slide = pptx.addSlide();
                                if (!slide) {
                                    console.error('Failed to create entity detail slide');
                                    return;
                                }
                                slide.background = { color: 'FFFFFF' };
                                slide.addText(`바운디드 컨텍스트: ${bc.name || 'Unknown'} - 애그리거트: ${agg.name || 'Unknown'} - 엔티티: ${entity.name || id}`, {
                                    x: 0.5,
                                    y: 0.3,
                                    w: 9,
                                    h: 0.6,
                                    fontSize: 24,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                
                                let yPos = 1.15;
                                
                                slide.addText('엔티티 정보', {
                                    x: 0.5,
                                    y: yPos,
                                    w: 9,
                                    h: 0.4,
                                    fontSize: 20,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                yPos += 0.5;
                                
                                slide.addText(entity.name || id, {
                                    x: 0.5,
                                    y: yPos,
                                    w: 9,
                                    h: 0.3,
                                    fontSize: 18,
                                    bold: true,
                                    align: 'left',
                                    color: '000000'
                                });
                                yPos += 0.4;
                                
                                slide.addTable(entityTable, {
                                    x: 0.5,
                                    y: yPos,
                                    w: 9,
                                    colW: [2, 1.5, 1, 4.5]
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    // ==================== PPT 테이블 생성 헬퍼 메서드 ====================

    /**
     * PPT 바운디드 컨텍스트 테이블 생성
     */
    createPPTBoundedContextTable(boundedContexts) {
        if (!boundedContexts || boundedContexts.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '바운디드 컨텍스트', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '역할', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '중요도', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '구현 전략', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        boundedContexts.forEach(bc => {
            rows.push([
                { text: bc.alias || bc.name || '', options: { fontSize: 12 } },
                { text: bc.role || '', options: { fontSize: 12 } },
                { text: bc.importance || '', options: { fontSize: 12 } },
                { text: bc.implementationStrategy || '', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT 비즈니스 규칙 테이블 생성
     */
    createPPTBusinessRulesTable(rules) {
        if (!rules || rules.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '규칙명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '설명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        rules.forEach(rule => {
            rows.push([
                { text: rule.name || '', options: { fontSize: 12 } },
                { text: rule.description || '', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT 엔티티 정의 테이블 생성
     */
    createPPTEntityDefinitionTable(properties) {
        if (!properties || properties.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '필드', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '타입', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '필수', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '비고', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        properties.forEach(prop => {
            const note = [
                prop.isPrimaryKey ? 'Primary Key' : '',
                prop.foreignEntity ? `FK (${prop.foreignEntity})` : '',
                prop.values ? prop.values.join(', ') : ''
            ].filter(Boolean).join('; ');
            
            rows.push([
                { text: prop.name || '', options: { fontSize: 12 } },
                { text: prop.type || '', options: { fontSize: 12 } },
                { text: prop.required ? 'Y' : 'N', options: { fontSize: 12 } },
                { text: note || '-', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT 컨텍스트 간 관계 테이블 생성
     */
    createPPTRelationsTable(relations) {
        if (!relations || relations.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '소스 컨텍스트', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '타겟 컨텍스트', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '관계 유형', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '상호작용 패턴', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        relations.forEach(relation => {
            // 두 가지 데이터 구조 지원
            const sourceContext = relation.upStream ? (relation.upStream.alias || relation.upStream.name || '') : (relation.sourceContext || '');
            const targetContext = relation.downStream ? (relation.downStream.alias || relation.downStream.name || '') : (relation.targetContext || '');
            const relationType = relation.type || relation.relationType || '';
            const interactionPattern = relation.interactionPattern || relation.explanation || '';
            
            rows.push([
                { text: sourceContext, options: { fontSize: 12 } },
                { text: targetContext, options: { fontSize: 12 } },
                { text: relationType, options: { fontSize: 12 } },
                { text: interactionPattern, options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT Pros/Cons 테이블 생성
     */
    createPPTProsConsTable(pros, cons) {
        if (!pros || !cons) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '항목', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '장점', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '단점', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        const keys = Object.keys(pros);
        keys.forEach(key => {
            rows.push([
                { text: key, options: { fontSize: 12 } },
                { text: pros[key] || '', options: { fontSize: 12 } },
                { text: cons[key] || '', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT 이벤트 스토밍 테이블 생성
     */
    createPPTEventStormingTable(items) {
        if (!items || items.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '이름', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '설명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        items.forEach(item => {
            rows.push([
                { text: item.name || '', options: { fontSize: 12 } },
                { text: item.description || item.displayName || '', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT API 명세 테이블 생성
     */
    createPPTApiSpecificationTable(commands) {
        if (!commands || commands.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: 'API 경로', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '메서드', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '커맨드', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '설명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '파라미터', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        commands.forEach(cmd => {
            const params = (cmd.fieldDescriptors || [])
                .map(f => `${f.name} (${f.className})`)
                .join(', ');
            
            rows.push([
                { text: cmd.controllerInfo.apiPath || '', options: { fontSize: 12 } },
                { text: cmd.controllerInfo.method || '', options: { fontSize: 12 } },
                { text: cmd.displayName || cmd.name || '', options: { fontSize: 12 } },
                { text: cmd.description || '', options: { fontSize: 12 } },
                { text: params || '-', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }

    /**
     * PPT 필드 테이블 생성
     */
    createPPTFieldTable(fieldDescriptors) {
        if (!fieldDescriptors || fieldDescriptors.length === 0) return null;
        
        const rows = [];
        
        // 헤더 행
        rows.push([
            { text: '필드명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '타입', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '키', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } },
            { text: '설명', options: { fill: { color: 'F5F5F5' }, align: 'center', bold: true, fontSize: 14 } }
        ]);
        
        // 데이터 행
        fieldDescriptors.forEach(field => {
            const description = [
                field.isPrimaryKey ? 'Primary Key' : '',
                field.foreignEntity ? `FK (${field.foreignEntity})` : '',
                field.values ? `Values: ${field.values.join(', ')}` : '',
                field.displayName || ''
            ].filter(Boolean).join('; ');
            
            rows.push([
                { text: field.name || '', options: { fontSize: 12 } },
                { text: field.className || '', options: { fontSize: 12 } },
                { text: field.isKey ? 'Yes' : 'No', options: { fontSize: 12 } },
                { text: description || '-', options: { fontSize: 12 } }
            ]);
        });
        
        return rows;
    }
}

