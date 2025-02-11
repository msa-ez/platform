<template></template>

<script>
    import StorageBase from "./ModelStorageBase";
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
            isReadOnly: {
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
            closePanel() {
                this.$emit('close')
            },
            updatePanel(isClose) {
                var me = this;
                me.$app.try({
                    context: me,
                    async action(me) {
                        if (!me.value) return;

                        var diff = jsondiffpatch.diff(me._value, me.value);
                        if (diff) {
                            if (!me.isReadOnly) {
                                me.canvas.changedByMe = true;
                                Object.keys(me.value).forEach(function (itemKey) {
                                    if (me.canvas.isCustomMoveExist) {
                                        if (!(itemKey == 'elementView' || itemKey == 'relationView')) {
                                            me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]));
                                        }
                                    } else {
                                        me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]));
                                    }
                                });
                                me.$emit('_value-change', me._value);
                            }
                        }
                        if (isClose) {
                            me.closePanelAction();
                        }
                    }
                });
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
                this.updatePanel(true)
            },

            updateElementVisibility() {
                // localStorage에서 processMode 값을 불러오고, 없으면 true로 설정
                let storedProcessMode = localStorage.getItem('processMode');
                if (storedProcessMode === null) {
                    storedProcessMode = 'true';
                    localStorage.setItem('processMode', storedProcessMode);
                }
                const processMode = storedProcessMode === 'true'; // 문자열 'true'를 불리언 true로 변환

                // processMode에 따라 요소의 표시 여부를 설정
                this.$nextTick(() => {
                    const elements = document.querySelectorAll('text[text-anchor="start"]');
                    elements.forEach(el => {
                        el.style.display = processMode ? 'block' : 'none';
                    });
                });
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
                        me.pushOpenPanelQueue()
                    },
                    onFail(){
                        console.log(`[Error] Open PanelAction: ${e}`)
                    }
                })
                this.updateElementVisibility();
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
                        me.pushClosePanelQueue()
                    },
                    onFail(){
                        console.log(`[Error] Close PanelAction: ${e}`)
                    }
                })
                this.updateElementVisibility();
            },
             /**
             * Panel Open Queue
             **/
            pushOpenPanelQueue(){
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        if(!me.canvas.isUserInteractionActive()) return;
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
                        if(!me.canvas.isUserInteractionActive()) return;
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
