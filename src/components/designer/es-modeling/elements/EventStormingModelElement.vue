<template>
    <sub-controller></sub-controller>
</template>

<script>
    import ModelElement from "../../modeling/ModelElement";
    import VueSuperMethod from 'vue-super-call'
    import SubController from "../../../opengraph/shape/SubController";
    import getParent from "../../../../utils/getParent";
    import isAttached from '../../../../utils/isAttached';

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
                panelStyle: 'width:500px;',
                namePanel: '',
                descriptionPanel: '',
                isPassedClosePanel: false,
                staySetTimeout: null,

                rotateStatus: false,
                isMovedElement: false,
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
                ////////////////////// Validation ERROR CODE /////////////////////////////
                ESE_NOT_NAME: 0,
                ESE_NOT_BC: 1,
                ESE_NOT_AGG: 2,
                ESE_NOT_PK: 3,
                ESE_DUPLICATE_FIELD: 4,
                ESE_API_PATH_ERROR: 5,
                ESE_DUPLICATE_METHOD: 6,
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
                me.onMoveAction()
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
                if(this.isHexagonalModeling){
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
                                if( me.canvas.information.author == me.getEditUid){
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


                                var editable = true
                                me.newEditUserImg.some(function(user, index){
                                    if(user.uid == me.getEditUid){
                                        return true
                                    }
                                    // edit condition
                                    if( user.action == 'userPanelOpen' ){
                                        editable = false
                                        return true
                                    }
                                })

                                return editable
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
            // "STATUS_COMPLETE":function(newVal) {
            //     if (newVal  && this.canvas.isServerModel) {
            //         // onMoving Event (Only Server)
            //         this.validate()
            //         this.onMoveAction();
            //     }
            // },
            // "value.elementView": {
            //     deep: true,
            //     handler: function (newVal, oldVal) {
            //         var me = this
            //         if (!me.canvas.isServerModel) {
            //             // onMoving Event ( Only Local)
            //             me.validate()
            //             me.onMoveAction();
            //         }
            //     }
            // },
            "value.name": function (newVal, oldVal) {
                this.namePanel = newVal;
                this.onChangedElementName(newVal, oldVal);
                this.validate(false)
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
            'staySelected': function (newVal, oldVal) {
                if (newVal) {
                    this.canvas.pushUserSelectionActivatedQueue(this.value)
                } else {
                    this.canvas.pushUserSelectionDeactivatedQueue(this.value)
                }

            },
            'selected': _.debounce(function (newVal, oldVal) {
                if (newVal) {
                    if (this.propertyPanel) {
                        this.staySelected = false
                    } else {
                        this.staySelected = true
                    }
                } else {
                    this.staySelected = false
                }

            }, 2000),
            "filteredElementValidationResults": _.debounce(function () {
                this.refreshImg()
            }, 200),
        },
        mounted() {
            var me = this
            // Recovery!!!
            me.$EventBus.$on('isMovedElement', function (id) {
                if (me.value.elementView) {
                    //only Element
                    if (me.value.elementView.id == id) {
                        me.isMovedElement = true
                        me.canvas.pushUserMovementActivatedQueue(me.value)
                        // me.movedNewActivity()
                    } else {
                        if (me.isMovedElement == true) {
                            me.isMovedElement = false
                            me.canvas.pushUserMovementDeactivatedQueue(me.value)
                            // me.movedOldActivity()

                        }
                    }
                }
            });

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

        },
        methods: {
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
                } finally {
                    // 추후 제거. canvas 일치.
                    me.modelCanvasComponent = me.canvas
                }

            },
            setMirrorElementId(){
                var me = this
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
                    let component = me.canvas.elementTypes.find(x => x.component == me.getComponentByClassName(me.value._type).name)
                    me.image = component ? component.src : me.image

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
            // onRemoveShape(element) {
            //     var me = this
            //     try {
            //         me.canvas.removeElementAction(me.value)

            //         me.validate();

            //         // selected Element Remove
            //         if (me.value.elementView && element && element.id === me.value.elementView.id) {
            //             Object.values(me.canvas.value.elements).forEach((element) => {
            //                 if(!me.canvas.validateElementFormat(element)) return;
            //                 if (element && element.elementView.id !== me.value.elementView.id) {
            //                     let component = me.canvas.$refs[element.elementView.id];
            //                     if (component) {
            //                         component = component[0];
            //                         if (component.selected) {
            //                             component.onRemoveShape();
            //                         }
            //                     }
            //                 }
            //             });
            //         }
            //     } catch (e) {
            //         alert(`[Error] ModelElement-onRemoveShape: ${e}`)
            //     }
            // },
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                try{
                    var offsetX, offsetY, offsetW, offsetH

                    var originX = 0;
                    var originY = 0;
                    var originW = 0;
                    var originH = 0;

                    if ( me.canvas.isHexagonal ){
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

                    me.canvas.moveElementAction(me.value, beforeViewObj, afterViewObj)
                }catch (e) {
                    alert(`[Error] ModelElement-delayedMove: ${e}`)
                }
            },
            delayedRelationMove(vertices) {
                var me = this
                try{
                    var getVertices = me.canvas.isHexagonal ? me.value.hexagonalView.value : me.value.relationView.value

                    var originVertices = JSON.parse(JSON.stringify(getVertices))
                    var newVertices = []
                    var offsetVertices

                    vertices.forEach(function (ver, index) {
                        newVertices.push([ver.x, ver.y])
                    })
                    offsetVertices = JSON.stringify(newVertices)

                    me.canvas.moveElementAction(me.value, originVertices, offsetVertices)
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

                        // me.canvas.addElements(me.canvas.value, tmp);
                        me.canvas.appendElement(tmp);
                    }
                }
            },
            onMoveShape: function () {
                // console.log('onMoveShape in ES')
                // this.$EventBus.$emit('isMovedElement', this.value.elementView.id);
            },
            selectedActivity: function () {
                var me = this
                if (this.value) {
                    this.selected = true

                    // selected Template
                    var elementType = me.value._type ? me.value._type : null
                    var elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    me.$EventBus.$emit('selectedElementObj', {selected: true, id: elementIds, type: elementType})
                }

            },
            deSelectedActivity: function () {
                var me = this
                if (this.value) {
                    this.propertyPanel = false
                    this.selected = false
                    this.staySelected = false

                    // deselected Template
                    let elementIds = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                    me.$EventBus.$emit('selectedElementObj', {selected: false, id: elementIds})
                }

            },
            movedNewActivity() {
                var me = this
                try {
                    if (me.isLogin && me.isCustomMoveExist && !me.isClazzModeling && !me.canvas.isHexagonal && !me.canvas.isReadOnlyModel ) {
                        var obj = {
                            action: 'userMovedOn',
                            editUid: me.userInfo.uid,
                            name: me.userInfo.name,
                            picture: me.userInfo.profile,
                            timeStamp: Date.now(),
                            editElement: me.value.elementView.id
                        }
                        // me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj)
                    }
                } catch (e) {
                    alert(`[Error] ESModelElement-movedNewActivity: ${e}`)
                }
            },
            movedOldActivity() {
                var me = this

                try {
                    if (me.isLogin && me.isCustomMoveExist && !me.isClazzModeling && !me.canvas.isHexagonal && !me.canvas.isReadOnlyModel) {
                        var obj = {
                            action: 'userMovedOff',
                            editUid: me.userInfo.uid,
                            name: me.userInfo.name,
                            picture: me.userInfo.profile,
                            timeStamp: Date.now(),
                            editElement: me.value.elementView.id
                        }
                        // me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, obj)
                    }
                } catch (e) {
                    alert(`[Error] ESModelElement-movedOldActivity: ${e}`)
                }
            },
            onRotateShape: function (element, angle) {
                // console.log('ES: onRotateShape: ', element,angle)
                // this.value.elementView.angle = angle
            },
            removeAction(){},
            onMoveAction(){
                var me = this
                if( me.value.mirrorElement ) return;
                if( me.value._type.endsWith('BoundedContext') || me.value._type.endsWith('PBC')) return;

                let attachedBoundedContext = me.canvas.getAttachedBoundedContext(me.value)
                if( attachedBoundedContext ){
                    let newId = attachedBoundedContext.elementView.id

                    // 움직일때 BC 변화 파악.
                    if( newId != me.value.boundedContext.id ){
                        me.value.boundedContext = {id: newId};
                        if(me.canvas.initLoad) {
                            me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }
                } else if(me.value.boundedContext && me.value.boundedContext.id){
                    me.value.boundedContext = {}
                    if(me.canvas.initLoad) me.canvas.changedByMe = true;
                }

            },
            validate() {
                var me = this

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
            delayedMoveAction(beforeViewObj, afterViewObj) {
                /*
                    !!!  REMOVE !!!!
                    changedMethod: moveElementAction
                */
                var me = this

                if (me.isCustomMoveExist) {
                    me.movingElement = false;
                    me.STATUS_COMPLETE = false;

                    // FIRST UI Then Queue push
                    me.onMoveElement(afterViewObj, false)

                    me.delayedMoveQueue(beforeViewObj, afterViewObj)
                    me.$EventBus.$emit('isMovedElement', me.value.elementView.id );

                }
            },
            delayedRelationMoveAction(originVertices, offsetVertices) {
                /*
                !!!  REMOVE !!!!
                changedMethod: canvas.moveElementAction
                */
                var me = this

                if (me.isCustomMoveExist) {
                    me.movingElement = false
                    me.STATUS_COMPLETE = false;

                    // FIRST UI Then Queue push
                    me.onMoveRelation(offsetVertices, false)

                    // relation Queue
                    me.delayedRelationMoveQueue(originVertices, offsetVertices)
                }
            },
            onMoveElement(newObj,STATUS_COMPLETE){
                /*
                    !!!  REMOVE !!!!
                    changedMethod: moveElement
                */
                var me = this

                try{

                    if(me.canvas.isHexagonal) {
                        me.value.hexagonalView.x = newObj.x;
                        me.value.hexagonalView.y = newObj.y;
                        me.value.hexagonalView.width = newObj.width;
                        me.value.hexagonalView.height = newObj.height
                    } else {
                        me.value.elementView.x = newObj.x;
                        me.value.elementView.y = newObj.y;
                        me.value.elementView.width = newObj.width;
                        me.value.elementView.height = newObj.height;
                    }

                    me.movingElement = true;
                }catch (e) {
                    alert(`[Error] ModelElement-onMove Element: ${e}`)
                }
            },
            onMoveRelation(newObj,STATUS_COMPLETE){
                /*
                  !!!  REMOVE !!!!
                  changedMethod: moveElement
                */
                var me = this

                try{
                    if(me.canvas.isHexagonal){
                        me.value.hexagonalView.value = newObj
                    } else {
                        me.value.relationView.value = newObj
                    }
                    me.movingElement = true;
                }catch (e) {
                    alert(`[Error] ModelElement-onMoveRelation: ${e}`)
                }
            },
            delayedMoveQueue(beforeViewObj , afterViewObj){
                /*
                 !!!  REMOVE !!!!
                 changedMethod: pushMovedQueue
                */
                var me = this
                try{
                    var types = me.value._type.split('.')
                    var pushObj =
                        {
                            action: 'elementMove',
                            elementType: types[types.length - 1],
                            elementName: me.value.name,
                            editUid: me.getEditUid,
                            elementId: me.value.elementView.id,
                            before: JSON.stringify(beforeViewObj),
                            after: JSON.stringify(afterViewObj),
                            timeStamp: Date.now(),
                        }

                    if( me.canvas.isHexagonal ){
                        pushObj.isHexagonal = true
                    }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] ModelElement-DelayedMoveQueue PUSH: ${e}`)
                }
            },
            delayedRelationMoveQueue(originVertices , offsetVertices){
                var me = this
                try {
                    var pushObj =
                        {
                            action: 'relationMove',
                            editUid: me.getEditUid,
                            relationId: me.value.relationView.id,
                            before: originVertices,
                            after: offsetVertices,
                            timeStamp: Date.now(),
                        }
                    if(me.canvas.isHexagonal){
                        pushObj.isHexagonal = true
                    }
                    me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, pushObj)
                }catch (e) {
                    alert(`[Error] ModelElement-DelayedRelationMoveQueue: ${e}`)
                }
            },
            getComponentByClassName: function (className) {
                var componentByClassName;

                // $.each(window.Vue.eventStormingModelingComponents, function (i, component) {
                $.each(window.Vue.eventStormingModelingComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
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
