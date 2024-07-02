export default class LinkUtils {                                                   // Link 생성을 관련 로직을 담고 있는 클래스
    static appendSvgElement(parent, elementType, className, attributes = {}) {     // SVG 요소 추가 및 속성 설정을 위한 범용 함수
      const element = parent.append(elementType).attr('class', className);         // 부모 요소에 새로운 SVG 요소를 추가하고, 클래스 이름과 속성을 설정합니다.
      Object.keys(attributes).forEach(key => {                                     // attributes 객체의 각 키-값 쌍에 대해, SVG 요소에 해당 속성을 설정합니다.
        element.attr(key, attributes[key]);
      });
      return element;                                                              // 설정이 완료된 SVG 요소를 반환합니다.
    }
  
    static createLinks(svg, links) {                                               // 링크(선)을 생성하는 함수
      const linkGroup = this.appendSvgElement(svg, 'g', 'links');                  // SVG 내에 링크들을 그룹핑하기 위한 'g' 요소를 추가합니다. 클래스 이름은 'links'입니다.
      const link = linkGroup.selectAll('line')                                     // 링크 데이터를 기반으로 line 요소를 생성합니다.
        .data(links)                                                               // 링크 데이터를 바인딩합니다.
        .enter()                                                                   // 데이터에 해당하는 새로운 line 요소를 추가합니다.
        .append('line')                                                            // line 요소를 추가합니다.
        .attr('stroke-width', 2)                                                   // 선의 두께를 설정합니다.
        .style('stroke', '#999')                                                   // 선의 색상을 설정합니다.
        .attr('marker-end', 'url(#end-marker)');                                   // 선의 끝에 마커(화살표 등)를 추가합니다.
  
      return link;
    }
  
    static createMarkers(svg) {                                                    // 마커(화살표 등)를 생성하는 함수
      const defs = this.appendSvgElement(svg, 'defs');                             // SVG 내에 정의(defs) 요소를 추가합니다. 마커와 같은 재사용 가능한 요소를 정의하는 데 사용됩니다.
      const marker = this.appendSvgElement(defs, 'marker', '', {                   // 마커를 정의합니다. 마커의 속성들을 설정합니다.
        'id': 'end-marker',                                                        // 마커의 ID를 설정합니다. 링크에서 이 ID를 참조하여 마커를 사용합니다.
        'viewBox': '0 -5 10 10',                                                   // 마커의 뷰박스를 설정합니다.
        'refX': 40,                                                                // TODO 마커의 참조점 X 좌표를 설정합니다. 동적으로 계산해야하는데 모르겠음..
        'refY': 0,                                                                 // 마커의 참조점 Y 좌표를 설정합니다.
        'markerWidth': 6,                                                          // 마커의 너비를 설정합니다.
        'markerHeight': 6,                                                         // 마커의 높이를 설정합니다.
        'orient': 'auto'                                                           // 마커의 방향을 자동으로 설정합니다.
      });
      marker.append('path')                                                        // 마커 내에 경로(path) 요소를 추가하여 마커의 모양을 정의합니다.
        .attr('d', 'M0,-5L10,0L0,5')                                               // 경로의 d 속성을 설정합니다. 이는 마커의 모양을 결정합니다.
        .attr('fill', '#999');                                                     // 경로의 채우기 색상을 설정합니다.
    }
  
    static createLinkText(svg, links) {                                            // 링크에 텍스트를 추가하는 함수
      const linkTextGroup = this.appendSvgElement(svg, 'g', 'link-text');          // SVG 내에 링크 텍스트들을 그룹핑하기 위한 'g' 요소를 추가합니다. 클래스 이름은 'link-text'입니다.
      const linkText = linkTextGroup.selectAll('text')                             // 링크 데이터를 기반으로 text 요소를 생성합니다.
        .data(links)                                                               // 링크 데이터를 바인딩합니다.
        .enter()                                                                   // 데이터에 해당하는 새로운 text 요소를 추가합니다.
        .append('text')                                                            // text 요소를 추가합니다.
        .text(d => d.type)                                                         // 링크의 타입(데이터의 'type' 속성)을 텍스트로 설정합니다.
        .attr('text-anchor', 'middle')                                             // 텍스트의 정렬을 중앙으로 설정합니다.
        .attr('fill', '#555')                                                      // 텍스트 색상을 설정합니다.
        .style('font-size', '12px');                                               // 텍스트의 폰트 크기를 설정합니다.
  
      return linkText;
    }
  }