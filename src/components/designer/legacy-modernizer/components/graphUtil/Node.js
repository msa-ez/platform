import * as d3 from 'd3';

class ShapeFactory {                                    // 도형을 생성하는 클래스입니다.
  static createShape(shapeType, options) {              // 도형의 타입과 옵션을 받아 해당하는 도형을 생성합니다.
    const shapes = {                                    // 사용 가능한 도형들을 정의합니다.
      'PROCEDURE': () => this.createPolygon(options),
      'CIRCLE': () => this.createCircle(options),
      'FOR': () => this.createDiamond(options),        
      'IF': () => this.createDiamond(options),
      'Table': () => this.createRectangle(options),          
      // 추후 다른 도형 추가 예정
    };
    return (shapes[shapeType] || shapes['CIRCLE'])();   // 주어진 shapeType에 해당하는 함수를 실행하거나, 없을 경우 기본값으로 원을 생성합니다.
  }

  static createPolygon({ pointsCallback, nodeSide }) {                                   // 다각형을 생성하는 메소드입니다.
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');   // SVG의 polygon 요소를 생성합니다.
    polygon.setAttribute('points', pointsCallback(nodeSide));                            // points 속성을 설정합니다. pointsCallback 함수를 사용하여 계산된 점들을 설정합니다
    return polygon;
  }

  static createCircle({ radius }) {                                                      // 원을 생성하는 메소드입니다.
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');     // SVG의 circle 요소를 생성합니다.
    circle.setAttribute('r', radius);                                                    // 원의 반지름을 설정합니다.
    return circle;
  }

  static createDiamond({ pointsCallback, nodeSide }) {                                   // 다이아몬드(마름모)를 생성하는 메소드입니다.
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');   // SVG의 polygon 요소를 생성합니다.
    diamond.setAttribute('points', pointsCallback(nodeSide));                            // points 속성을 설정합니다. pointsCallback 함수를 사용하여 계산된 점들을 설정합니다
    return diamond;
  }
  static createRectangle({ width, height }) {                                            // 사각형을 생성하는 메소드입니다.
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');         // SVG의 rect 요소를 생성합니다.
    rect.setAttribute('width', width);                                                   // 사각형의 너비를 설정합니다.
    rect.setAttribute('height', height);                                                 // 사각형의 높이를 설정합니다.
    return rect;
  }
}

class ColorFactory {                                  // 색상을 관리하는 클래스입니다.
  static getColor(label) {                            // 라벨에 따른 색상을 반환합니다.
    const colors = {                                  // 사용 가능한 색상들을 정의합니다.
      'PROCEDURE': '#F28B66',
      'FOR': '#57C7E3',
      'IF': '#88BF8B',
      'DECLARE': '#F16667',
      'UPDATE': '#ECB5C9',
      'SELECT': '#D9C8AE',
      'Table': '#FFC454',
      // 추후 다른 색상 추가 예정
    };

    return colors[label] || this.randomColor();       // 주어진 라벨에 해당하는 색상을 반환하거나, 없을 경우 랜덤 색상을 생성하여 반환합니다.
  }

  static randomColor() {                              // 랜덤 색상을 생성하는 메소드입니다.
    return `hsl(${Math.random() * 360}, 100%, 70%)`;  // HSL 색상 공간을 사용하여 랜덤 색상을 생성합니다.
  }
}

class PointsCalculator {                                  
  static diamondPoints(nodeSide) {                       // 다이아몬드 모양의 점들을 계산하는 정적 메소드입니다.
    const points = [];
    points.push(`0,${-nodeSide}`);                       // 상단 점
    points.push(`${nodeSide},0`);                        // 오른쪽 점
    points.push(`0,${nodeSide}`);                        // 하단 점
    points.push(`${-nodeSide},0`);                       // 왼쪽 점
    return points.join(' ');                             // 점들을 공백으로 구분하여 문자열로 반환합니다.
  }

  static pentagonPoints(nodeSide) {                      // 오각형 모양의 점들을 계산하는 정적 메소드입니다.
    const points = [];                                   // 점들을 저장할 배열을 초기화합니다.
    for (let i = 0; i < 5; i++) {                        // 오각형의 각 점을 계산하기 위한 반복문입니다.
      const angle = Math.PI / 2 + (2 * Math.PI * i) / 5; // 각도를 계산합니다. 오각형의 각 점에 대한 각도입니다.
      const x = nodeSide * Math.cos(angle);              // x 좌표를 계산합니다. radius * cos(angle)
      const y = nodeSide * Math.sin(angle);              // y 좌표를 계산합니다. radius * sin(angle)
      points.push(`${x},${y}`);                          // 계산된 x, y 좌표를 점 배열에 추가합니다.
    }
    return points.join(' ');                             // 점들을 공백으로 구분하여 문자열로 반환합니다.
  }

  // 추후 다른 도형의 점 계산 함수 추가 가능
}

export function createNodes(svg, nodes, nodeSide) {             // TODO : 값은 변수를 이용 , 노드를 생성하는 함수입니다.
  const nodeElements = svg
    .append('g')                                                // SVG 내에 노드들을 그룹핑하기 위한 'g' 요소를 추가합니다.
    .attr('class', 'nodes')                                     // 클래스 이름을 'nodes'로 설정합니다.
    .selectAll('node')                                          // 현재는 존재하지 않는 가상의 노드를 선택합니다
    .data(nodes)                                                // 데이터(노드에 대한 모든 정보)를 바인딩합니다.
    .enter()                                                    // 데이터에 해당하는 새로운 요소를 추가합니다.
    .append(d => {                                              // 도형의 타입에 따라 도형을 생성합니다. 각 노드의 라벨을 기반으로 도형을 결정합니다.
      let shapeOptions;
      switch (d.label) {
        case 'FOR':
        case 'IF':                                              // FOR 또는 IF 라벨일 경우
          shapeOptions = {
            sideLength: nodeSide,                               // 노드의 반지름을 옵션으로 전달합니다
            pointsCallback: () => PointsCalculator.diamondPoints(nodeSide)     // 다이아몬드를 그리기 위한 점들을 계산하는 함수를 옵션으로 전달합니다.
          };
          break;
        case 'PROCEDURE':                                       // PROCEDURE 라벨일 경우
          shapeOptions = {
            sideLength: nodeSide,                               // 노드의 반지름을 옵션으로 전달합니다
            pointsCallback: () => PointsCalculator.pentagonPoints(nodeSide)    // 5각형을 그리기 위한 점들을 계산하는 함수를 옵션으로 전달합니다.
          };
          break;
        case 'Table':
          shapeOptions = {
              width: 70,
              height: 70
          };
          break;
        default:                                                // 그 외의 경우 (기본적으로 원을 그립니다)
          shapeOptions = {
            radius: 40                                          // 노드의 반지름만 옵션으로 전달합니다.
          };
      }
      return ShapeFactory.createShape(d.label, shapeOptions);   // ShapeFactory를 사용하여 도형을 생성하고 반환합니다
    })
    .attr('fill', d => ColorFactory.getColor(d.label));         // 각 노드의 색상을 설정합니다. 라벨에 따라 색상을 결정합니다

  return nodeElements;
}

export function nodeDrag(simulation) {                           // 노드 드래그 기능을 구현하는 함수입니다.
  function dragstarted(event, d) {                               // 드래그가 시작될 때 호출되는 함수입니다.
    if (!event.active) simulation.alphaTarget(0.3).restart();    // 드래그가 활성화되면 시뮬레이션을 재시작합니다.
    d.fx = d.x;                                                  // 고정된 x 위치를 설정합니다.
    d.fy = d.y;                                                  // 고정된 y 위치를 설정합니다.
  }

  function dragged(event, d) {                                   // 드래그 중일 때 호출되는 함수입니다.
    d.fx = event.x;                                              // 드래그 중인 노드의 x 위치를 업데이트합니다.
    d.fy = event.y;                                              // 드래그 중인 노드의 y 위치를 업데이트합니다.
  }

  function dragended(event, d) {                                 // 드래그가 끝났을 때 호출되는 함수입니다.
    if (!event.active) simulation.alphaTarget(0);                // 드래그가 비활성화되면 시뮬레이션을 멈춥니다.
    d.fx = null;                                                 // 고정된 x 위치를 해제합니다.
    d.fy = null;                                                 // 고정된 y 위치를 해제합니다.
  }

  return d3.drag()                                               // d3.drag()을 사용하여 드래그 이벤트를 설정합니다.
    .on('start', dragstarted)                                    // 드래그 시작 이벤트에 dragstarted 함수를 연결합니다.
    .on('drag', dragged)                                         // 드래그 중 이벤트에 dragged 함수를 연결합니다.
    .on('end', dragended);                                       // 드래그 종료 이벤트에 dragended 함수를 연결합니다.
}

// TODO 검토 필요(라벨 색상 수정 필요)
export function createLabels(svg, nodes, nodeSide) {
  const labels = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#FFFFFF')
    .style('pointer-events', 'none')
    .style('font-size', '12px')
    .style('font-weight', '500') // 여기에 font-weight를 설정합니다.
    .each(function (d) {
      const text = d3.select(this);
      const words = d.name.split(/\s+/);
      let line = [];
      let lineNumber = 0;
      let lineHeight = 0.3; // lineHeight를 조정하여 tspan 간격을 늘립니다.
      let yAdjust = 0.5;    // 첫 번째 tspan의 위치를 조정하여 전체 텍스트를 아래로 이동시킵니다.
      let tspan = text.append('tspan').attr('x', 0).attr('dy', `${yAdjust}em`);
      words.forEach((word) => {
        line.push(word);
        const testLine = line.join(' ');
        tspan.text(testLine);
        if (tspan.node().getComputedTextLength() > nodeSide * Math.sqrt(2)) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          lineNumber++;
          // lineNumber를 이용하여 dy 값을 조정합니다. 첫 번째 줄 이후의 각 줄에 대해 lineHeight를 곱합니다.
          tspan = text.append('tspan').attr('x', 0).attr('dy', `${lineHeight * lineNumber + yAdjust}em`).text(word);
        }
      });
    });

  return labels;
}