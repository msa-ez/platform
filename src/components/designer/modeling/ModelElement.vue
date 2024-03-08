<template></template>

<script>
    import firebase from 'firebase'
    import Element from "./Element";
    import StorageBase from "./ModelStorageBase";

    export default {
        mixins: [Element, StorageBase],
        name: 'model-element',
        props: {},
        data() {
            return {
                // canvas
                canvas: null,
                // 움직임 변화
                movingElement: false,
                // 이전 움직였던 element 파악.
                isMovedElement: false,
                // panel 열림 닫힘.
                propertyPanel: false,
                // 우측상단 프로필 변수
                newEditUserImg: [],
                // queue complete
                STATUS_COMPLETE: true,
                // validate
                elementValidationResults: [],
                //url 변수
                fullPath: null,
                params: null,
                paramKeys: null,
                // element sticker image
                image: null,
                // component refresh.
                refreshedImg: '',

                // ??
                messageRef: {},
                EndProgressing: false,
            }
        },
        created: function () {
            var me = this
            me.fullPath = this.$route.fullPath.split('/')
            me.params = this.$route.params
            me.paramKeys = Object.keys(me.params)

            me.setElementCanvas()
            // me.messageRef = firebase.database().ref(`/${me.$route.params.author}/${me.$route.params.projectName}`);
        },
        beforeDestroy() {
            this.executeElementBeforeDestroy();   
        },
        watch: {
            "value.elementView": {
                deep: true,
                handler: function (newVal, oldVal) {
                    this.refreshImg()
                    var me = this
                    if (this.value.elementView) {
                        var positionX = me.value.elementView.x / 1000
                        var positionY = me.value.elementView.y / 1000
                        $(`#${me.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        if (me.value.rotateStatus) {
                        } else {
                            $(`#${me.value.elementView.id}`).css('transform-origin', `${positionX}% ${positionY}%`);
                        }
                    }
                }
            },
            "movingElement": function () {
                this.refreshImg()
            },
            "alertImage": function () {
                this.refreshImg()
            },
            "newEditUserImg": function () {
                this.refreshImg()
            },
            "value.rotateStatus": function () {
                var me = this
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

        },
        mounted: function () {
            var me = this
            let elementId = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
            me.$EventBus.$on(`${elementId}`, function (obj) {
                if ( obj.action == 'elementPush' ) {
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                } else if ( obj.action == 'elementDelete' ) {
                    //STATUS_COMPLETE_elementDelete
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                } else if ( obj.action == 'elementMove' ) {
                    if(!me.canvas.isServerModel || (me.canvas.isServerModel && obj.STATUS_COMPLETE) ){
                        me.validate()
                        me.onMoveAction();
                    }
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    me.movingElement = obj.movingElement
                } else if ( obj.action == 'valueModify' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationPush' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationDelete' ) {
                    me.$nextTick(function () {
                        me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    })
                } else if ( obj.action =='relationMove' ) {
                    if(!me.canvas.isServerModel || (me.canvas.isServerModel && obj.STATUS_COMPLETE) ){
                        me.validate()
                        me.onMoveAction();
                    }
                    me.STATUS_COMPLETE = obj.STATUS_COMPLETE
                    me.movingElement = obj.movingElement
                } else if (obj.action == 'userPanelOpen' || obj.action == 'userSelectedOn' || obj.action == 'userMovedOn') {
                    if(!me.newEditUserImg) {
                        me.newEditUserImg = []
                    }
                    if (me.newEditUserImg.findIndex(user => user.uid == obj.uid) == -1) {
                        me.newEditUserImg.push(obj)
                    }

                } else if (obj.action == 'userPanelClose' || obj.action == 'userSelectedOff' || obj.action == 'userMovedOff') {
                    if (me.newEditUserImg.length > 0) {
                        me.newEditUserImg.forEach(function (user, idx) {
                            if (user.uid == obj.uid) {
                                me.newEditUserImg.splice(idx, 1)
                            }
                        })
                    }
                }
            })

            // me.$EventBus.$on('es-EndProgressing', function (newVal) {
            //     me.EndProgressing = true
            // })

             me.$EventBus.$on('isMovedElement', function (id) {
                if(!me.value.elementView) return;

                if (elementId == id) {
                    if(me.isMovedElement) return;

                    me.isMovedElement = true
                    me.canvas.pushUserMovementActivatedQueue(me.value)
                } else {
                    if(!me.isMovedElement) return;
                    
                    me.isMovedElement = false
                    me.canvas.pushUserMovementDeactivatedQueue(me.value)
                }                
            });


            // Rotate Element
            me.onRotateElement()
        },
        computed: {
            selectable(){
                return !this.movingElement
            },
            movable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            resizable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            deletable(){
                return !this.canvas.isReadOnlyModel && !this.movingElement
            },
            filteredElementValidationResults(){
                var me = this
                var levelSort = ['error','warning','info']
                try{
                    return me.elementValidationResults.sort(function compare(a, b) {
                        var aIdx = levelSort.findIndex(x=>x == a.level)
                        var bIdx = levelSort.findIndex(x=>x == b.level)
                        return aIdx - bIdx;
                    });
                }catch (e) {
                    return me.elementValidationResults
                }finally {
                    me.refreshImg()
                }
            },
            getEditUid(){
                if( localStorage.getItem('uid') ){
                    return localStorage.getItem('uid')
                }
                return null
            },
            storage() {
                if (this.canvas) {
                    return this.canvas.storage
                } else {
                    return 'localstorage'
                }
            },
            isClazzModeling() {
                if (this.canvas)
                    return this.canvas.isClazzModeling
                return false
            },
        },
        methods: {
            setElementCanvas(){
                throw new Error('setElementCanvas() must be implement')
            },
            executeElementBeforeDestroy(){},
            validate() { return; },
            onMoveAction() { return; },
            exceptionError(message, options){
                var me = this
                var msg = message ? message : '[Element] Exception Error.'
                if(me.canvas){
                    me.canvas.exceptionError(msg,options)
                }
                console.error(`[Element] Exception: ${msg}`);
            },
            openPanel() {
                // var openPanelStatus = false
                // if(this.canvas.isServerModel && this.canvas.isQueueModel) {
                //     if(this.EndProgressing || this.value.name == "" || this.value.name.includes('BoundedContext')) {
                //         this.EndProgressing = true
                //         openPanelStatus = true
                //     }
                // } else {
                //     openPanelStatus = true
                // }
                // if(openPanelStatus) {
                    if(this.propertyPanel) this.propertyPanel = false
                    this.propertyPanel = true
                    this.staySelected = false
                // }
            },
            closePanel() {
                if(!this.propertyPanel) this.propertyPanel = true
                this.propertyPanel = false
            },
            deSelectedActivity: function () {
                var me = this

                if (me.value) {
                    me.selected = false
                    me.propertyPanel = false
                }
            },
            refreshImg() {
                var me = this
                me.refreshedImg = 'refresh'
                me.$nextTick(function () {
                    if (me.refreshedImg == 'refresh') {
                        me.refreshedImg = ''
                    } else {
                        me.refreshedImg = 'refresh'
                    }
                })
            },
            /**
             * Element 회전
             **/
            onRotateElement(){
                return
            },
            /**
             * OG > Element의 이동시 
             **/
            onMoveShape() {
                var me = this
                if(me.canvas.isCustomMoveExist){
                    let elementId = me.value.elementView ? me.value.elementView.id : me.value.relationView.id
                     me.$EventBus.$emit('isMovedElement', elementId)
                }
            },
            /**
             * OG >  
             * BeforeEvent: Element의 이동(서버)
             **/
            delayedMove(dx, dy, dw, dh, du, dlw, dl, dr) {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        let offsetX, offsetY, offsetW, offsetH

                        let originX = me.value.elementView.x
                        let originY = me.value.elementView.y
                        let originW = me.value.elementView.width
                        let originH = me.value.elementView.height

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
                        let afterViewObj = {x: offsetX, y: offsetY, width: offsetW, height: offsetH}
                        let beforeViewObj = {x: originX, y: originY, width: originW, height: originH}

                        me.canvas.moveElementAction(me.value, beforeViewObj, afterViewObj)
                    },
                    onFail(e){
                        console.log(`[Error] Delayed ElementMove: ${e}`)
                    }
                })
            },
             /**
              * OG > delayedRelationMove 
              * BeforeEvent: Relation 이동(서버)
              **/
            delayedRelationMove(vertices) {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        var originVertices = JSON.parse(JSON.stringify(me.value.relationView.value))
                        var newVertices = []
                        var offsetVertices

                        vertices.forEach(function (ver, index) {
                            newVertices.push([ver.x, ver.y])
                        })
                        offsetVertices = JSON.stringify(newVertices)

                        me.canvas.moveElementAction(me.value, originVertices, offsetVertices)
                    },
                    onFail(e){
                        console.log(`[Error] Delayed RelationMove: ${e}`)
                    }
                })
            },
             /**
             *  OG >  onRemoveShape 
             **/
            onRemoveShape(element) {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        me.canvas.removeElementAction(me.value)
                        me.validate()

                        if(!element) return;
                        // selected Element Remove
                        if (me.value.elementView && element && element.id === me.value.elementView.id) {
                            Object.values(me.canvas.value.elements).forEach((element) => {
                                if(!me.canvas.validateElementFormat(element)) return;
                                if (element && element.elementView.id !== me.value.elementView.id) {
                                    let component = me.canvas.$refs[element.elementView.id];
                                    if (component) {
                                        component = component[0];
                                        if (component.selected) {
                                            component.onRemoveShape();
                                        }
                                    }
                                }
                            });
                        }
                    },
                    onFail(e){
                        console.log(`[Error] RemoveShape: ${e}`)
                    }
                })
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            removeUndefinedValue(obj) {
                const newObj = {}; // 빈객체를 만들어놓고

                Object.keys(obj).forEach(key => {
                    // 키 값이 {오브젝트} 인 경우
                    if (obj[key] && Object.keys(obj[key]).length) {
                        newObj[key] = this.removeUndefinedValue(obj[key]); // newObj 안에서 또 재귀함수를 돌리자
                    }

                    // 키 값이 그외 값인 경우
                    else if (obj[key]) {
                        newObj[key] = obj[key]; // 조건을 통과하면 newObj에 똑같은 키와 값을 채워준다
                    }
                });

                return newObj;
            },
            getK8sElementTypes(){
                var me = this

                var canvas =  me.getComponent('kubernetes-model-canvas')
                var k8sElementTypes = canvas.elementTypes
                var typesList = []
                for(var i=0; i<k8sElementTypes.length; i++){
                    k8sElementTypes[i].forEach(function (ele) {
                        if(ele){
                            var type = ele.component
                            typesList.push(type.charAt(0).toUpperCase() + type.slice(1))
                        }
                    })
                }

                return typesList
            }

        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
