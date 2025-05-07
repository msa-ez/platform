import {
    set as cursorSet,
    unset as cursorUnset
  } from 'diagram-js/lib/util/Cursor';
  
  import {
    install as installClickTrap
  } from 'diagram-js/lib/util/ClickTrap';
  
  import {
    delta as deltaPos
  } from 'diagram-js/lib/util/PositionUtil';
  
  import {
    toPoint
  } from 'diagram-js/lib/util/Event';
  
  import {
    event as domEvent,
    closest as domClosest
  } from 'min-dom';
  
  import BaseMoveCanvas from 'diagram-js/lib/navigation/movecanvas/MoveCanvas';
  
  var THRESHOLD = 15;
  var elementReg;
  var me;
  
  function MoveCanvas(eventBus, canvas, elementRegistry) {
    // 부모 클래스 생성자 호출
    BaseMoveCanvas.call(this, eventBus, canvas);
    
    this.eventBus = eventBus;
    this.canvas = canvas;
    this.elementRegistry = elementRegistry;
    elementReg = elementRegistry;
    this.canvasSize = (({ height, width, x, y }) => ({ height, width, x, y }))(canvas.viewbox());
    this.scaleOffset = 1;
    this.scale = 1;
    canvas.movedDistance = {x:-100, y:0};
    this.resetMovedDistance = function(){
      canvas.movedDistance = {x:-100, y:0};
    }
      var context;
  
      me = this;
  
      // listen for move on element mouse down;
      // allow others to hook into the event before us though
      // (dragging / element moving will do this)
      eventBus.on('element.mousedown', 500, function(e) {
        return handleStart(e.originalEvent);
      });
      
      function handleMove(event) {
        var start = context.start,
            button = context.button,
            position = toPoint(event),
            delta = deltaPos(position, start);
      
        if (!context.dragging && length(delta) > THRESHOLD) {
          context.dragging = true;
      
          if (button === 0) {
            installClickTrap(eventBus);
          }
      
          cursorSet('grab');
        }
      
        if (context.dragging) {
      
          var lastPosition = context.last || context.start;
      
          delta = deltaPos(position, lastPosition);
          me.scale = me.canvas.viewbox().scale / me.scaleOffset;
      
          // 스케일 조정된 경계를 계산
          var scaledWidth = me.canvasSize.width * me.scale;
          var scaledHeight = me.canvasSize.height * me.scale;
          var scaledLeft = me.canvasSize.x - (scaledWidth - me.canvasSize.width) / 2;
          var scaledTop = me.canvasSize.y - (scaledHeight - me.canvasSize.height) / 2;
          var scaledRight = scaledLeft + scaledWidth + (scaledWidth - me.canvasSize.width) / 2;
          var scaledBottom = scaledTop + scaledHeight + (scaledHeight - me.canvasSize.height) / 2;
          var canvasLeft = me.canvasSize.x;
          var canvasTop = me.canvasSize.y;
          var canvasRight = canvasLeft + me.canvasSize.width;
          var canvasBottom = canvasTop + me.canvasSize.height;
  
          // 경계를 초과하게 될 경우 이동하지 않게 변경
          var adjustedDeltaX = delta.x;
          var adjustedDeltaY = delta.y;
          var scaledMovedDistanceX = canvas.movedDistance.x * me.scale;
          var scaledMovedDistanceY = canvas.movedDistance.y * me.scale;
      
          if(delta.x < 0 && scaledLeft > canvasLeft + scaledMovedDistanceX + delta.x){
              adjustedDeltaX = 0;
          }
          if(delta.x > 0 && scaledRight < canvasRight + scaledMovedDistanceX + delta.x){
              adjustedDeltaX = 0;
          }
          if(delta.y < 0 && scaledTop > canvasTop + scaledMovedDistanceY + delta.y){
              adjustedDeltaY = 0;
          }
          if(delta.y > 0 && scaledBottom < canvasBottom + scaledMovedDistanceY + delta.y){
              adjustedDeltaY = 0;
          }
  
  
  
          // 캔버스 스크롤 실행
          if (adjustedDeltaX !== 0 || adjustedDeltaY !== 0) {
            canvas.scroll({
              dx: adjustedDeltaX,
              dy: adjustedDeltaY
            });
          }
      
          canvas.movedDistance.x += (adjustedDeltaX / me.scale);
          canvas.movedDistance.y += (adjustedDeltaY / me.scale);
  
          // 마지막 위치를 업데이트
          context.last = {
            x: position.x,
            y: position.y
          };
        }
      
        // 선택 방지
        event.preventDefault();
      }
      
    
      function handleEnd(event) {
        domEvent.unbind(document, 'mousemove', handleMove);
        domEvent.unbind(document, 'mouseup', handleEnd);
    
        context = null;
    
        cursorUnset();
      }
    
      function handleStart(event) {
    
        // event is already handled by '.djs-draggable'
        if (domClosest(event.target, '.djs-draggable')) {
          return;
        }
    
        var button = event.button;
    
        // reject right mouse button or modifier key
        if (button >= 2 || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
    
        context = {
          button: button,
          start: toPoint(event)
        };
    
        domEvent.bind(document, 'mousemove', handleMove);
        domEvent.bind(document, 'mouseup', handleEnd);
    
        // we've handled the event
        return true;
      }
    
      this.isActive = function() {
        return !!context;
      };
    
  
  }
  
  MoveCanvas.$inject = [
    'eventBus',
    'canvas',
    'elementRegistry'
  ];

  MoveCanvas.prototype = Object.create(BaseMoveCanvas.prototype);
  MoveCanvas.prototype.constructor = MoveCanvas;
  
  function length(point) {
    return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
  }

  export default {
    __init__: ['moveCanvas'],
    moveCanvas: ['type', MoveCanvas]
  };