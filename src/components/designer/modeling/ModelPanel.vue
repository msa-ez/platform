<template></template>

<script>
    import StorageBase from "./ModelStorageBase";
    import getParent from '../../../utils/getParent'
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        name: 'model-panel',
        mixins: [StorageBase],
        model: {
            prop: '_value',
            event: '_value-change'
        },
        props: {
            // value: Object,
            _value:{
                type: Object,
                default: function () {
                    return null;
                }
            },
            readOnly: {
                type: Boolean,
                default: function () {
                    return false
                }
            },
            image: {
                type: String,
                default: ''
            },
            canvasComponentName: {
                type: String,
                default: function () {
                    return 'event-storming-model-canvas'
                },
            },
        },
        data: function () {
            return {
                elementId: null,
                user: {},
                value: null,
                copyValue: null,

                params: null,
                fullPath: null,
                paramKeys: null,
                canvas: null
            }
        },
        created() {
            var me = this
            me.$app.try({
                context: me,
                async action(me){
                    me.params = me.$route.params
                    me.paramKeys = Object.keys(me.params)
                    me.fullPath = me.$route.fullPath.split('/')
                    me.setElementCanvas();
                    me.value = JSON.parse(JSON.stringify(me._value))

                    me.panelInit()
                },
            })
        },
        beforeDestroy() {
            this.executeBeforeDestroy()
        },
        computed: {
            fixedDefalutStroage() {
                return 'db'
            },
            isClazzModeling() {
                if (this.canvas)
                    return this.canvas.isClazzModeling
                return false
            },
        },
        methods: {
            /**
             * Canvas 설정 
             **/
            setElementCanvas(){
                throw new Error('setElementCanvas() must be implement')
            },
            /**
             * Btn Click Event: Close Panel
             **/
            closePanel(){
                this.$emit('close')
            },
              /**
             * Create() > panelInit
             **/
            panelInit(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        me.openPanelAction()
                    }
                })
            },
             /**
             * BeforeEvent: Close Panel
             **/
            executeBeforeDestroy(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        /*
                            _value : 기존 값.
                            value  : Panel 사용되는 값,
                        */
                        var diff = jsondiffpatch.diff(me._value, me.value)
                        if (diff) {
                            if (!me.readOnly) {
                                me.canvas.changedByMe = true
                                Object.keys(me.value).forEach(function (itemKey) {
                                    if( me.canvas.isCustomMoveExist ){
                                        if(!(itemKey == 'elementView' || itemKey == 'relationView')){
                                            // Exception: 위치정보
                                            me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                        }
                                    } else {
                                        me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                    }

                                })
                                me.$emit('_value-change', me.value)
                            }
                        }
                        me.closePanelAction()
                    }
                })
            },
            /**
             * panelInit > openPanelAction
             * Panel open Action
             **/
            openPanelAction(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(!me.canvas.isUserInteractionActive()) return;
                        me.pushOpenPanelQueue()
                    },
                    onFail(){
                        console.log(`[Error] Open PanelAction: ${e}`)
                    }
                })
            },
            /**
             * executeBeforeDestroy > closePanelAction
             * Panel Close
             **/
            closePanelAction(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(!me.canvas.isUserInteractionActive()) return;
                        me.pushClosePanelQueue()
                    },
                    onFail(){
                        console.log(`[Error] Close PanelAction: ${e}`)
                    }
                })

            },
             /**
             * Panel Open Queue
             **/
            pushOpenPanelQueue(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(!me.value.elementView) return;
                        me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, {
                            action: 'userPanelOpen',
                            editUid: me.canvas.userInfo.uid,
                            name: me.canvas.userInfo.name,
                            picture: me.canvas.userInfo.profile,
                            timeStamp: Date.now(),
                            editElement: me.value.elementView.id
                        });
                    },
                    onFail(){
                        console.log(`[Error] Push Open PanelQueue: ${e}`)
                    }
                })
            },
             /**
             * Panel Close Queue
             **/
            pushClosePanelQueue(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(!me.value.elementView) return;
                        me.pushObject(`db://definitions/${me.canvas.projectId}/queue`, {
                            action: 'userPanelClose',
                            editUid: me.canvas.userInfo.uid,
                            name: me.canvas.userInfo.name,
                            picture: me.canvas.userInfo.profile,
                            timeStamp: Date.now(),
                            editElement: me.value.elementView.id
                        });
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
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue._components, function (i, component) {
                    if (component.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            }
       
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .v-icon.outlined {
        border: 1px solid currentColor;
        border-radius: 0%;
    }

    .md-sidenav .md-sidenav-content {
        width: 400px;
    }

    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

    .flip-list-move {
        transition: transform 0.5s;
    }

    .no-move {
        transition: transform 0s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group {
        min-height: 20px;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>
