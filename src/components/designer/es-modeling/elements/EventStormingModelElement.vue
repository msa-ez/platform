<template>
    <sub-controller></sub-controller>
</template>

<script>
    import ModelElement from "../../modeling/ModelElement";
    import VueSuperMethod from 'vue-super-call'
    import SubController from "../../../opengraph/shape/SubController";
    import getParent from "../../../../utils/getParent";
    import isAttached from '../../../../utils/isAttached';
import { group } from "d3";

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    // Vue.prototype.$super = VueSuperMethod

    export default {
        components: {SubController},
        mixins: [ModelElement],
        name: 'event-storming-model-element',
        props: {
            isPBCModel: {
                type: Boolean,
                default: function() {
                    return false;
                }
            },
        },
        data() {
            return {
                currentConnectedRelations: [],
                // monitoring
                isProgress: false,
                progressColor: '#00C853',
                isFailedEvent: false,
                
                panelStyle: 'width:500px;',
                namePanel: '',
                descriptionPanel: '',
                isPassedClosePanel: false,
                staySetTimeout: null,

                rotateStatus: false,
                attachedBoundedContext: null,
                attachedBoundedContextId: null,
                attachedAggregate: null,
                attachedAggregateId: null,
                // oldName: "",
                info_red_image: 'static/image/symbol/close-icon-red.png',
                info_white_image: 'static/image/symbol/info-icon-white.png',
                error_white_image: 'static/image/symbol/error-icon-white.png',
                warning_white_image: 'static/image/symbol/warning-icon-white.png',
                link_image: 'static/image/symbol/icons-link.png',
                link_off_image: 'static/image/symbol/icons-link-off.png',
                alert_image: 'static/image/symbol/alert-icon.png',
                ////////////////////// Validation ERROR CODE /////////////////////////////
                ESE_NOT_NAME: 0,
                ESE_NOT_BC: 1,
                ESE_NOT_AGG: 2,
                ESE_NOT_PK: 3,
                ESE_DUPLICATE_FIELD: 4,
                ESE_API_PATH_ERROR: 5,
                ESE_DUPLICATE_METHOD: 6,
                ESE_MIS_MATCH: 7,
                ESE_NOT_CORRELATION_KEY: 8,
                validationCodeLists: {
                    0: {
                        'level': 'error',
                        'msg': ' Must have a name.'
                    },
                    1: {
                        'level': 'info',
                        'msg': 'Element must be in a Bounded Context.'
                    },
                    2: {
                        'level': 'warning',
                        'msg': 'Must be attached to an Aggregate.'
                    },
                    3: {
                        'level': 'error',
                        'msg': 'Key is undefined.'
                    },
                    4: {
                        'level': 'error',
                        'msg': 'Attribute name is duplicated.'
                    },
                    5: {
                        'level': 'error',
                        'msg': 'Blank, space, or special characters are not allowed for the API path.'
                    },
                    6: {
                        'level': 'warning',
                        'msg': 'Duplicate methods.'
                    },
                    7: {
                        'level': 'warning',
                        'msg': 'Match with the attributes registered in the Aggregate.'
                    },
                    8: {
                        'level': 'warning',
                        'msg': 'Event correlationKey is not set.'
                    }
                },
                /////////////////////////////////

            }
        },
        created: function () {
            var me = this
            //필수
            try {
                me.setUserInfo()
                me.setInitElement()

                me.validate(false)
                // me.onMoveAction()
            } catch (e) {
                // alert('Error: modelCanvas 선언 필수.', e)
                console.log('Error: modelCanvas 선언 필수.', e)
            }
        },
        computed: {
            isProjectConnecting(){
                if(!this.value.mirrorElement) return false
                if(!Object.keys(this.value).includes('definitionId')) return true; // For AI Generator (temp)
                if(!this.value.definitionId) return false
                if(!this.canvas) return false;

                return this.canvas.modelListOfassociatedProject().includes(this.value.definitionId)
            },
            selectable(){
                return !this.movingElement
            },
            movable(){
                return this.canvas.isEditable && !this.movingElement
            },
            resizable(){
                if( this.value.mirrorElement ) return false;

                return this.canvas.isEditable && !this.movingElement && this.isEditElement
            },
            deletable(){
                if( this.value.mirrorElement ) return true;

                return this.canvas.isEditable && !this.movingElement && this.isEditElement
            },
            elementCoordinate(){
                if(this.canvas.isHexagonal){
                    this.value.hexagonalView.angle = 0
                    return this.value.hexagonalView
                }
                return this.value.elementView
            },
            showValidation() {
                if (this.elementValidationResults.length == 0) return false
                if (this.isPBCModel) return false;
                if (!this.value.mirrorElement) return false;

                return true
            },
            showValidationImg() {
                if (this.elementValidationResults.length == 0) {
                    return null
                }
                var level = this.filteredElementValidationResults[0].level
                if (level) {
                    if (level == 'error') {
                        return this.info_red_image
                        // return this.error_white_image
                    } else if (level == 'warning') {
                        return this.warning_white_image
                    } else if (level == 'info') {
                        return this.info_white_image
                    }
                }
                return null
            },
            statusCompleteStyle() {
                if (this.STATUS_COMPLETE) {
                    return {'r': '0'}
                }
                return {'r': '2', 'fill-opacity': 1, 'fill': '#F24040', 'stroke': '#F24040'}
            },
            getNamePanel() {
                return this.value.displayName ? this.value.displayName : this.namePanel
            },
            getDescriptionPanel() {
                return this.descriptionPanel
            },
            elementAuthor() {
                return this.value.author
            },
            isEditElement() {
                // true : edit 0 , false: edit x
                var me = this
                if(me.isPBCModel){
                    return false;
                }
                if( me.value.mirrorElement ) return false;

                if (me.canvas && me.canvas.initLoad) {

                    if ( me.canvas.isReadOnlyModel ) {
                        return false
                    } else if (!me.canvas.isServerModel) {
                        return true
                    } else {
                        if (me.canvas.information && me.canvas.information.author) {
                            if (me.newEditUserImg && me.newEditUserImg.length > 0) {

                                //project author
                                if( me.canvas.information.author == me.canvas.userInfo.uid){
                                    return true
                                }
                                // another user check author editing
                                if( me.newEditUserImg.filter(x=>x.uid == me.canvas.information.author).length ==1 ){
                                    return false
                                }
                                // Not Exit User
                                var checkExistsUsers = me.canvas.participantLists.findIndex(obj => me.existsArrayCheckByUid(me.newEditUserImg, obj.uid));
                                if( checkExistsUsers  == -1 ){
                                    me.newEditUserImg.splice(0, 1)
                                    return true
                                }

                                return me.newEditUserImg.some(user => user.uid == me.canvas.userInfo.uid || user.action == 'userPanelOpen');
                            }
                        }
                    }
                }
                return true
            },
            isMembers() {
                var me = this
                var uid = me.canvas.userInfo.uid;
                if (me.canvas.information)
                    if (uid == me.canvas.information.author) {
                        return true
                    }
                var result = false;
                if (this.value.boundedContext) {
                    var keys = Object.keys(this.canvas.attachedLists);
                    keys.forEach(function (key) {
                        console.log('me.canvas.attachedLists[key].name:: ',me.canvas.attachedLists[key].name)
                        if (me.canvas.attachedLists[key].name == me.value.boundedContext.name) {
                            me.canvas.attachedLists[key].members.forEach(function (member) {
                                if (member.uid == uid) {
                                    result = true
                                }
                            })
                        }
                    })
                } else if (me.value._type == 'org.uengine.modeling.model.BoundedContext') {
                    if (me.value.members)
                        me.value.members.forEach(function (member) {
                            if (member.uid == uid) {
                                result = true
                            }
                        })
                    else
                        result = false

                }
                if (me.value._type == 'org.uengine.modeling.model.BoundedContext') {
                    // console.log(me.value.name + " : " + result)

                }
                return result

            }
        },
        watch: {
            "isProjectConnecting": function () {
                this.refreshImg()
            },
            "canvas.isHexagonal": function (newVal, oldVal) {
                this.refreshImg()
            },
            "statusCompleteStyle": {
                deep: true,
                handler: _.debounce(function () {
                    this.refreshImg()
                }, 200)
            },
            "value.name": function (newVal, oldVal) {
                this.namePanel = newVal;
                this.onChangedElementName(newVal, oldVal);
                this.validate(false)
            },
            "value.boundedContext.id": function(newVal, oldVal){
                if(newVal){
                    this.validate(false)
                }
            },
            "value.description": function (newVal) {
                this.descriptionPanel = newVal
                this.refreshImg()
            },
            "getNamePanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
            "getDescriptionPanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refreshImg()
                }, 200)
            },
            "filteredElementValidationResults": _.debounce(function () {
                this.refreshImg()
            }, 200),
        },
        mounted() {
            var me = this
            me.$ModelingBus.$on("clearOld", function () {
                if(me.initLoad)
                    me.value.oldName = undefined
            });

            me.$nextTick(function () {
                $(document).keydown((evt) => {
                    // element copy & paste
                    if (evt.keyCode == 67 && (evt.metaKey || evt.ctrlKey)) {
                        if (!evt.target.localName.includes('input')) {
                            // me.copy();
                        }
                    } else if (evt.keyCode == 86 && (evt.ctrlKey || evt.metaKey)) {
                        if (!evt.target.localName.includes('input')) {
                            // me.paste();
                        }

                    }
                });
            })

            me.$EventBus.$on('copyPaste', (id) => {
                if (id == me.value.id || id === me.value.elementView.id) {
                    me.copy();
                    me.paste();
                } else {
                    me.tmpValue = null;
                }
            })

            // monitoring
            me.$EventBus.$on('showProgress', (element) => {
                if(element.id == me.value.id) {
                    me.isProgress = true;
                    me.isFailedEvent = false;
                    me.progressColor = '#43A047';
                    me.progressEventSequence = element.sequence.toString();
                    if (element.isParticular) {
                        me.progressColor = '#00E5FF';
                    }
                    if (element.error) {
                        me.isFailedEvent = true;
                    }
                }
            });
            me.$EventBus.$on('hideProgress', (id) => {
                if(id == me.value.id) {
                    me.isProgress = false;
                    me.progressEventSequence = null;
                }
            });

        },
        methods: {
            updateConnectedStickers(connectedRelations) {
                const highlightingEnabled = localStorage.getItem('highlightingEnabled') === 'true';
                if (!highlightingEnabled) return;

                connectedRelations.forEach(relation => {
                    if(!relation) return;
                    if(!relation.to) return;
                    const targetSticker = document.getElementById(relation.to);
                    if(!targetSticker) return;
                    const pathElement = targetSticker.querySelector('path') || 
                            Array.from(targetSticker.childNodes).find(node => node.tagName === 'path');
                    if(!pathElement) return;
                    // 기본 스타일 설정
                    pathElement.setAttribute('stroke', '#7B1E1E');
                    pathElement.setAttribute('stroke-width', '5');

                    // dash 효과를 위한 속성
                    pathElement.style.strokeDasharray = '10';
                    pathElement.style.strokeDashoffset = '0';
                    pathElement.style.animation = 'flow-stroke 1s linear infinite';
                });
            },

            resetConnectedStickers(connectedRelations) {
                if (!connectedRelations) return;
                connectedRelations.forEach(relation => {
                    if(!relation) return;
                    if(!relation.to) return;
                    const targetSticker = document.getElementById(relation.to);
                    if(!targetSticker) return;
                    const pathElement = targetSticker.querySelector('path') || 
                            Array.from(targetSticker.childNodes).find(node => node.tagName === 'path');
                    if(!pathElement) return;
                    pathElement.setAttribute('stroke', 'none');
                    pathElement.setAttribute('stroke-width', '1');
                });
            },
            setElementCanvas(){
                var me = this
                try{
                    if (me.$route.path.includes('replay')) {
                        me.canvas = getParent(me.$parent, "event-storming-model-replay");
                        me.panelStyle = 'width:500px; margin-right:17.5%;'
                    } else {
                        me.canvas = getParent(me.$parent, "event-storming-model-canvas");
                    }
                } catch (e) {
                    if (me.$route.path.includes('replay')) {
                        me.canvas = me.getComponent('event-storming-model-replay');
                    } else {
                        me.canvas = me.getComponent('event-storming-model-canvas')
                    }
                } 
            },
            setMirrorElementId(){
                var me = this
                if( me.canvas.isReplay ) return;
                if( !me.value.name) return;

                // already connection (mirror)
                if( me.value.mirrorElement ) return;

                // reject origin connection.
                let connected = Object.values(me.canvas.mirrorValue.elements)
                    .find(ele =>
                        ele
                        && me.canvas.validateElementFormat(ele)
                        && ele._type == me.value._type  // equals type.
                        && ele.id != me.value.elementView.id // myself x
                        && ele.mirrorElement == me.value.elementView.id // connected element before
                    )
                if( connected ) return;

                // connect equals Name.
                let equalsElement = Object.values(me.canvas.mirrorValue.elements)
                    .find(ele =>
                        ele
                        && me.canvas.validateElementFormat(ele)
                        && ele.name
                        && ele._type == me.value._type  // equals type.
                        && ele.name.toLowerCase() == me.value.name.toLowerCase() // equals name
                        && ele.elementView.id != me.value.elementView.id // myself x
                        && !ele.mirrorElement // connected element x
                        && !me.canvas.value.elements[ele.elementView.id] // mine project
                    )

                if( equalsElement ) {
                    me.value.mirrorElement = equalsElement.elementView.id;
                    me.canvas.syncMirrorElements()
                    return;
                }

                // let reConnect = Object.values(me.canvas.mirrorValue.elements)
                //     .find(ele =>
                //         ele
                //         && ele._type == me.value._type  // equals type.
                //         && ele.name
                //         && ele.name.toLowerCase() == me.value.name.toLowerCase() // equals name
                //         && ele.elementView.id != me.value.elementView.id // myself x
                //         && !me.canvas.value.elements[ele.elementView.id] // mine project
                //         && ele.mirrorElement
                //         && !me.canvas.mirrorValue.elements[ele.mirrorElement] // remove Element.
                //         && me.canvas.modelListOfassociatedProject().includes(ele.definitionId)
                //     )
                // if(reConnect) {
                //     // reConnect.definitionId = me.canvas.projectId
                //     // reConnect.mirrorElement = me.value.elementView.id
                //     let obj = {'elements': {}}
                //     me.$set(
                //         obj.elements,
                //         reConnect.elementView.id,
                //         {   'mirrorElement': [reConnect.mirrorElement, me.value.elementView.id],
                //             'definitionId': [reConnect.definitionId, me.canvas.projectId]
                //         }
                //     )
                //
                //
                //     me.pushObject(`db://definitions/${me.canvas.information.associatedProject}/queue`, {
                //         action: 'valueModify',
                //         editUid: me.getEditUid,
                //         timeStamp: Date.now(),
                //         item: JSON.stringify(obj)
                //     });
                //
                //     console.log('reconnect!!')
                // }
            },
            setInitElement(){
                var me = this
                if ( me.value ) {
                    let component = me.canvas.elementTypes.find(x => x.component == me.canvas.getComponentByClassName(me.value._type).name)
                    me.image = component ? component.src : me.image

                    if(!me.value.displayName) me.value.displayName = '';
                    // init panel value.
                    me.namePanel = me.value.name;
                    me.descriptionPanel = me.value.description;
                    // me.onMoveAction()
                }
            },
            onChangedElementName(newVal, oldVal){ },
            openPanel() {
                // if(this.isPBCModel) {
                //     return
                // }
                if(this.propertyPanel) {
                    this.propertyPanel = false
                }
                this.propertyPanel = true
                this.staySelected = false
            },
            existsArrayCheckByUid(objArray, id) {
                var isFound = false;
                objArray.some(obj => {
                    if (obj.uid == id)
                        isFound = true;
                });
                return isFound;
            },
            onRotateElement(){
                if (this.value.elementView) {
                    var positionX = this.value.elementView.x / 1000
                    var positionY = this.value.elementView.y / 1000
                    $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                    if (this.value.rotateStatus) {
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(-30deg)`);
                        this.value.rotateStatus = true
                    } else if (this.value.rotateStatus == false) {
                        $(`#${this.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        $(`#${this.value.elementView.id}`).css('transform', `rotate(0deg)`);
                        this.value.rotateStatus = false
                    }
                }
            },
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                try{
                    let options = null
                    var offsetX, offsetY, offsetW, offsetH

                    var originX = 0;
                    var originY = 0;
                    var originW = 0;
                    var originH = 0;

                    if ( me.canvas.isHexagonal ){
                        if(!options) options = {}
                        options.isHexagonal = true
                        originX = me.value.hexagonalView.x
                        originY = me.value.hexagonalView.y
                        originW = me.value.hexagonalView.width
                        originH = me.value.hexagonalView.height
                    } else {
                        originX = me.value.elementView.x
                        originY = me.value.elementView.y
                        originW = me.value.elementView.width
                        originH = me.value.elementView.height
                    }


                    if (dx == null && dy == null) {
                        // resize

                        if (Math.abs(dl) <= Math.abs(dr)) {
                            // 오른쪽으로 움직임
                            if (dr >= 0) {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            }


                        } else if (Math.abs(dl) > Math.abs(dr)) {
                            // 왼쪽 으로 움직임
                            if (dl >= 0) {
                                offsetX = originX - (Math.abs(dl + dr) / 2.0)
                            } else {
                                offsetX = originX + (Math.abs(dl + dr) / 2.0)
                            }

                        }

                        if (Math.abs(dlw) <= Math.abs(du)) {
                            //위로 움직임
                            if (du >= 0) {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            }

                        } else if (Math.abs(dlw) > Math.abs(du)) {
                            //아래로 움직임
                            if (dlw >= 0) {
                                offsetY = originY + (Math.abs(du + dlw) / 2.0)
                            } else {
                                offsetY = originY - (Math.abs(du + dlw) / 2.0)
                            }

                        }

                        offsetW = dw
                        offsetH = dh

                    } else if (dw == null && dh == null) {
                        //move
                        offsetX = originX + dx
                        offsetY = originY + dy
                        offsetW = originW
                        offsetH = originH
                    } else {
                        console.log('error Move & Resize')
                    }

                    var afterViewObj = {x: offsetX, y: offsetY, width: offsetW, height: offsetH}
                    var beforeViewObj = {x: originX, y: originY, width: originW, height: originH}

                    me.canvas.moveElementAction(me.value, beforeViewObj, afterViewObj, null, options)
                }catch (e) {
                    alert(`[Error] ModelElement-delayedMove: ${e}`)
                }
            },
            // override
            delayedRelationMove(vertices) {
                var me = this
                try{
                    let options = null
                    let getVertices = []
                    if (me.canvas.isHexagonal) {
                        if(!options) options = {}
                        options.isHexagonal = true
                        getVertices = me.value.hexagonalView.value
                    } else {
                        getVertices = me.value.relationView.value
                    }

                    var originVertices = JSON.parse(JSON.stringify(getVertices))
                    var newVertices = []
                    var offsetVertices

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    me.canvas.moveElementAction(me.value, originVertices, offsetVertices, null, options)
                }catch (e) {
                    alert(`[Error] ModelElement - delayedRelationMove: ${e}`)
                }
            },
            changedPanelValue(value) {
                this.validate(false, value)
            },
            validationFromCode(code) {

                if (code == null) {
                    return null
                }

                if (code == undefined) {
                    return null
                }

                var validationCode = this.validationCodeLists[code]
                if (validationCode) {
                    validationCode.code = code
                    return validationCode
                }

                return null
            },
            copy() {
                var me = this;
                me.tmpValue = JSON.parse(JSON.stringify(me.value));
            },
            paste() {
                var me = this
                if (!me.canvas.isReadOnlyModel) {
                    if (me.tmpValue) {
                        var tmp = me.tmpValue;
                        tmp.id = me.canvas.uuid();
                        tmp.elementView.id = tmp.id;
                        tmp.elementView.x = tmp.elementView.x + Math.floor(Math.random() * 101);
                        tmp.elementView.y = tmp.elementView.y + Math.floor(Math.random() * 101);

                        me.canvas.appendElement(tmp);
                    }
                }
            },
            // override
            onActivitySelected() {
                var me = this;

                var connectedRelations = [];
                var visitedRelations = new Set();
                // localStorage에서 highlightingEnabled 값을 불러오기
                const highlightingEnabled = localStorage.getItem('highlightingEnabled') === 'true';
                if (highlightingEnabled) {
                    function findConnectedRelations(stickerId) {
                        Object.keys(me.canvas.value.relations).forEach(function(key) {
                            var relation = me.canvas.value.relations[key];
                            if (relation && !visitedRelations.has(key) && relation.from === stickerId) {
                                connectedRelations.push(relation);
                                visitedRelations.add(key);
                                // 재귀적으로 to(연결된 선)를 탐색
                                findConnectedRelations(relation.to);
                            }
                        });
                    }
                    me.currentConnectedRelations = connectedRelations
                    findConnectedRelations(me.value.id);

                    // 스티커를 클릭했을 때 연결된 모든 선의 정보를 이벤트 버스를 통해 전송
                    // 관련 코드 classRelation.vue 검색 -> if (!this.isProgress && this.isHighlighted)
                    me.$EventBus.$emit('selectedStickerConnections', connectedRelations);
                    me.updateConnectedStickers(connectedRelations)
                }

                if (me.value) {
                    var elementType = me.value._type ? me.value._type : null;
                    var elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id;
                    me.$EventBus.$emit('selectedElementObj', { selected: true, id: elementIds, type: elementType });
                }
            },
            // override
            onActivityDeselected(){
                var me = this
                if (me.value) {  
                    // deselected Template
                    let elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    me.$EventBus.$emit('selectedElementObj', {selected: false, id: elementIds})
                    // 스티커를 클릭했을 때 연결된 선 색상 초기화
                    me.$EventBus.$emit('deselectedStickerConnections');
                    me.resetConnectedStickers(me.currentConnectedRelations)
                }
            },
            onRotateShape: function (element, angle) {
                // console.log('ES: onRotateShape: ', element,angle)
                // this.value.elementView.angle = angle
            },
            onMoveAction(){
                var me = this
                if( me.canvas.isReplay ) return;
                if( me.value.mirrorElement ) return;
                if( me.value._type.endsWith('BoundedContext') || me.value._type.endsWith('PBC')) return;

                let attachedBoundedContext = me.canvas.getAttachedBoundedContext(me.value)
                if( attachedBoundedContext ){
                    let newId = attachedBoundedContext.elementView.id

                    // 움직일때 BC 변화 파악.
                    if( !me.value.boundedContext || newId != me.value.boundedContext.id ){
                        me.value.boundedContext = {id: newId};
                        if(me.canvas.initLoad && !me.canvas.isRendering) {
                            // me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }
                } else if(me.value.boundedContext && me.value.boundedContext.id){
                    me.value.boundedContext = {}
                    if(me.canvas.initLoad && !me.canvas.isRendering) {
                        // me.canvas.changedByMe = true;
                        me.canvas.changedTemplateCode = true
                    }
                }

            },
            validate() {
                var me = this
                if( me.canvas.isReplay ) return;

                if( me.value._type.endsWith('BoundedContext') || me.value._type.endsWith('PBC')) return;

                let attachedBoundedContext = me.canvas.getAttachedBoundedContext(me.value);
                if( attachedBoundedContext ){

                    // validationResults
                    var validationResultIndex = me.elementValidationResults.findIndex(x => (x.code == me.ESE_NOT_BC))
                    var isExistValidationResult = validationResultIndex == -1 ? false : true
                    if (isExistValidationResult) {
                        me.elementValidationResults.splice(validationResultIndex, 1)
                    }

                } else {
                    // validationResults
                    var validationResultIndex = me.elementValidationResults.findIndex(x => (x.code == me.ESE_NOT_BC))
                    var isExistValidationResult = validationResultIndex == -1 ? false : true
                    if (!isExistValidationResult) {
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_BC))
                    }
                }


            },
            isAttachedElement: function (otherElement) {
                var me = this;

                return isAttached(otherElement, me.value)
            },
            getDuplicatedField(val) {
                var seen = {};
                var duplicates = [];

                for (var item of val) {
                    var name = item.name;
                    if (seen[name]) {
                        duplicates.push(item);
                    } else {
                        seen[name] = true;
                    }
                }

                return duplicates;
            },
        }
    }
</script>
