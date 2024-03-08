<template>

</template>

<script>
    import BpmnVueFinder from './BpmnVueFinder'
    import ModelElement from '../../modeling/ModelElement'

    export default {
        mixins: [BpmnVueFinder, ModelElement],
        name: 'bpmn-base',
        props: {
            activity: Object,
            definition: Object,
            role: Object,
            relation: Object,
            status: String,
            loopType: String,
            value: Object
        },
        created: function () {
            var me = this;
            me.namePanel = me.value.name
        },
        data: function () {
            return {
                _id: null,
                drawer: false,
                namePanel: '',
            }
        },
        computed: {
            type(){
                return ''
            },
            bpmnRole: function () {
                return 'bpmn-component';
            },
            style: {
                get: function () {
                    var style;
                    //스타일이 없다면 디폴트 스타일을 사용한다.
                    if (this.value.elementView) {
                        style = this.value.elementView.style;
                    } else if (this.value.relationView) {
                        style = this.value.relationView.style;
                    }
                    if (style) {
                        var jsonStyle = JSON.parse(style);
                        if ($.isEmptyObject(jsonStyle)) {
                            return this.defaultStyle;
                        } else {
                            return jsonStyle;
                        }
                    } else {
                        return this.defaultStyle;
                    }
                },
                set: function (val) {
                    if (this.value.elementView) {
                        this.value.elementView.style = JSON.stringify(val);
                    } else if (this.value.relationView) {
                        this.value.relationView.style = JSON.stringify(val);
                    }
                }
            },
            getNamePanel() {
                return this.namePanel
            },
        },
        watch: {
            'staySelected': function (newVal, oldVal) {
                if (newVal) {
                    this.selectedStayActivity()
                } else {
                    this.deSelectedStayActivity()
                }

            },
            'selected': _.debounce(function (newVal, oldVal) {
                if (newVal) {
                    if (this.drawer) {
                        this.staySelected = false
                    } else {
                        this.staySelected = true
                    }
                } else {
                    this.staySelected = false
                }

            }, 2000),
            "value.name": function (newVal) {
                this.namePanel = newVal
                this.refresh()
            },
            "getNamePanel": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    if (newVal != oldVal)
                        this.refresh()
                }, 200)
            },
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = me.getComponent('bpmn-modeling-canvas');
            },
            selectedActivity: function () {
                if(this.value) {
                    this.selected = true;
                }
            },
            deSelectedActivity: function () {
                if(this.value) {
                    this.drawer = false;
                    this.selected = false;
                }
            },
            selectedFlow: function () {
                if(this.value) {
                    this.selected = true;
                }
            },
            deSelectedFlow: function () {
                if(this.value) {
                    this.drawer = false;
                    this.selected = false;
                }
            },
            selectedStayActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userSelectedOn',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    // me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
            },
            deSelectedStayActivity() {
                var me = this
                if (me.isLogin && me.canvas.isServerModel && !me.canvas.isClazzModeling && !me.canvas.isReadOnlyModel) {
                    var obj = {
                        action: 'userSelectedOff',
                        editUid: me.userInfo.uid,
                        name: me.userInfo.name,
                        picture: me.userInfo.profile,
                        timeStamp: Date.now(),
                        editElement: me.value.elementView.id
                    }
                    // me.pushObject(`db://definitions/${me.params.projectId}/queue`, obj)
                }
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
            closeComponentChanger: function () {
                this.bpmnVue.componentChangerData = {};
            },
            openComponentChanger: function (top, left) {
                var me = this;
                //TODO 저 프로퍼티 패널이 deselect 되었을 때 닫히지 않게 하려면...?
                this.bpmnVue.componentChangerData = {
                    bpmnComponent: me,
                    top: top,
                    left: left
                };
            },
            showProperty: function (event, component) {
                this.drawer = true;
            },
            closePanel() {
                this.drawer = false;
            },
            /**
             * 도형이 그룹 속으로 이동했을 때 데피니션의 모델을 이동시킨다.
             * @param groupOpengraphComponent 오픈그래프 그룹 컴포넌트
             * @param opengraphComponent 이동된 오픈그래프 컴포넌트
             * @param eventOffset
             */
            onAddedToGroup: function (groupOpengraphComponent, opengraphComponent, eventOffset) {
                var me = this;

                //액티비티가 아닐 경우 스킵.
                if (!me.value) {
                    return;
                }

                //아래 작업이 수행되기 전 데피니션 히스토리 업데이트 금지.
                me.bpmnVue.preventEvent = true;

                me.$nextTick(function () {
                    //서브프로세스 안에는 lane 들어갈 수 없으니 안심하자!!! 고려하지 말자!!!
                    me.bpmnVue.preventEvent = false;
                    me.bpmnVue.enableHistoryAdd = true;

                    //내 자신의 트래이싱 태그
                    var myTracingTag = me.value.tracingTag;

                    //신규 서브 프로세스
                    var newSubProcess = me.bpmnVue.getActAndRelByOpengraphId(groupOpengraphComponent.id);

                    //기존 서브 프로세스
                    var currentSubProcess = me.bpmnVue.getParentActByOpengraphId(myTracingTag);

                    //신규 서브프로세스가 없을때, 기존 서브프로세스가 있다면 데피니션으로 이동.
                    if (!newSubProcess) {
                        if (currentSubProcess) {
                            // me.bpmnVue.moveActivity(myTracingTag, null);
                        }
                    }

                    //신규 서브프로세스가 있을때
                    //기존 서브프로세스가 있고, 기존 서브프로세스와 트레이싱 태그가 같다면 스킵. (같은 서브프로세스 내부의 이동이다.)
                    //신규 서브프로세스가 서브프로세스면 신규그룹 속으로 이동.
                    //신규 서브프로세스가 서브프로세스가 아니면 데피니션으로 이동.
                    else {
                        if (currentSubProcess && newSubProcess.tracingTag == currentSubProcess.tracingTag) {
                            console.log('currentSubProcess == newSubProcess', newSubProcess.tracingTag);
                            return;
                        }
                        if (newSubProcess._type == 'org.uengine.kernel.bpmn.SubProcess') {
                            // me.bpmnVue.moveActivity(myTracingTag, newSubProcess.tracingTag);
                        } else {
                            // me.bpmnVue.moveActivity(myTracingTag, null);
                        }
                    }
                });
            },
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            refresh() {
                this.refreshImg()
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>
