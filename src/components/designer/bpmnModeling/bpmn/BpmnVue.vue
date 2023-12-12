<template>
    <div>
        <opengraph
                focus-canvas-on-select
                wheelScalable
                :dragPageMovable="dragPageMovable"
                :enableContextmenu="false"
                :enableRootContextmenu="false"
                :enableHotkeyCtrlC="false"
                :enableHotkeyCtrlV="false"
                :enableHotkeyDelete="false"
                :slider="false"
                :movable="!monitor"
                :resizable="!monitor"
                :selectable="!monitor"
                :connectable="!monitor"
                :width="1500"
                :height="1000"
                v-if="data.definition"
                ref="bpmnOpengraph"
                v-on:canvasReady="bpmnReady"
                v-on:userAction="onUserAction"
                v-on:connectShape="onConnectShape"
                v-on:removeShape="onRemoveShape"
                v-on:divideLane="onDivideLane"
                v-on:beforeDestroyElement="onBeforeDestroyElement"
        >

            <!--롤은 Lane 형식의 큰 틀-->
            <div v-for="(role, idx) in data.definition.roles" :key="idx">
                <bpmn-role 
                        v-if="role != null" 
                        :role="role"
                ></bpmn-role>
            </div>

            <!--액티비티는 각 활동 요소-->
            <div v-for="(activity, idx) in data.definition.childActivities[1]" :key="idx">
                <!--component 로 지칭한 것은 뒤의 is 가 가르키는 컴포넌트 이름으로 뜸-->

                <!--//TODO 여기의 status 를 http://localhost:8080/instance/1/variables 에서 얻어온 status 로 교체하여야 한다.-->
                <!--ex) :status="???"-->
                <!--그러기 위해서는 SvgGraph(데이터 불러오는 부분) 에서, definition 가져온 이후에, definition 안에 있는 childActivities 를 까서-->
                <!--그 안에 tracingTag 가 동일한 것들에 대해 status 를 매핑시켜주어야 한다.-->
                <component v-if="activity != null" :is="getComponentByClassName(activity._type)"
                           :activity="activity" :definition="data.definition"
                           :status="activity.status" :faultMessage="activity.faultMessage"
                ></component>
            </div>

            <!--릴레이션은 액티비티간 연결선(흐름)-->
            <div v-for="(relation, idx) in data.definition.sequenceFlows" :key="idx">
                <bpmn-relation 
                        v-if="relation != null" 
                        :relation="relation"
                       :definition="data.definition"
                ></bpmn-relation>
            </div>
            <div v-for="(relation, idx) in data.definition.messageFlows" :key="idx">
                <bpmn-message-flow 
                        v-if="relation != null" 
                        :relation="relation"
                        :definition="data.definition"
                ></bpmn-message-flow>
            </div>
        </opengraph>

        <bpmn-component-changer
                v-if="data.definition"
                :data="componentChangerData"
        ></bpmn-component-changer>

        <!-- 프로세스 변수 -->
        <v-dialog
                v-model="processVariablesDialog"
                v-if="data.definition"
                max-width="900">
            <v-card>
                <v-card-title>Process Variables</v-card-title>
                <v-card-text>
                    <bpmn-object-grid 
                            v-model="processVariables"
                            :full-fledged="true" 
                    ></bpmn-object-grid>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="closeProcessVariables">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 프로세스 정의 -->
        <v-dialog
                v-if="data.definition"
                v-model="definitionSettings"
                ref="definitionSettings"
                max-width="320">
            <v-card>
                <v-card-title>Definition Settings</v-card-title>
                <v-card-text>
                    <v-form novalidate @submit.stop.prevent="submit">
                        <v-container>
                            <v-text-field 
                                    v-model="defintionSettings.shortDescription.text"
                                    label="Description"
                            ></v-text-field>
                            <v-text-field 
                                    v-model="data.definition.instanceNamePattern"
                                    label="Instance Name Pattern"
                            ></v-text-field>
                        </v-container>

                        <v-switch
                                v-model="data.definition.initiateByFirstWorkitem" 
                                id="my-test1" 
                                name="my-test1"
                                color="primary"
                                label="Initiate by event"
                        ></v-switch>
                        <v-switch 
                                v-model="data.definition.volatile" 
                                id="my-test1" 
                                name="my-test1" 
                                color="primary"
                                label=" Volatile"
                        ></v-switch>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="closeDefinitionSettings">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import BpmnObjectGrid from '../BpmnObjectGrid'
    
    /**
     * 디자이너를 그리는 부분.
     */
    export default {
        name: 'bpmn-vue',
        props: {
            loaded: Boolean,
            definition: Object,
            monitor: Boolean,
            backend: Object,
            dragPageMovable: Boolean
        },
        component: {
            BpmnObjectGrid
        },
        mounted: function () {
            //timer start
            var startTime = Date.now();

            this.id = this.uuid();
            this.data.definition = this.validateDefinition(this.definition);

            this.preLocale = this.data.definition._selectedLocale;

            // 프로세스 정의 초기화
            var shortDescription = this.data.definition.shortDescription;
            if (!shortDescription) {
                shortDescription = new Object();
                shortDescription._type = 'org.uengine.contexts.TextContext';
                shortDescription.text = "";
            }

            if (!this.data.definition.initiateByFirstWorkitem)
                this.data.definition.initiateByFirstWorkitem = false;

            if (!this.data.definition.volatile)
                this.data.definition.volatile = false;

            // mount시 현재 locale 값으로 text 처리 - 프로세스 정의
            if (shortDescription.localedTexts && shortDescription.localedTexts[this.preLocale]) {
                shortDescription.text = shortDescription.localedTexts[this.preLocale];
            }
            this.defintionSettings = {
                shortDescription: shortDescription
            };

            // mount시 현재 locale 값으로 text 처리 - 프로세스 변수
            var processVariables = this.data.definition.processVariableDescriptors;
            if (processVariables && processVariables.length) {
                var copy = JSON.parse(JSON.stringify(processVariables));
                var me = this;
                $.each(copy, function (i, variable) {
                    if (variable.displayName) {
                        if (variable.displayName.localedTexts && variable.displayName.localedTexts[me.data.definition._selectedLocale]) {
                            variable.displayName = variable.displayName.localedTexts[me.data.definition._selectedLocale];
                            variable.displayName._type="org.uengine.contexts.TextContext"
                        } else {
                            variable.displayName = variable.displayName.text;
                            variable.displayName._type="org.uengine.contexts.TextContext"
                        }
                    }
                });
                this.processVariables = copy;
            }

            this.history = [JSON.parse(JSON.stringify(this.data.definition))];
            this.$nextTick(function () {
                //$nextTick delays the callback function until Vue has updated the DOM
                // (which usually happens as a result of us changing the data
                //  so make any DOM changes here
                this.canvas._CONFIG.FAST_LOADING = false;
                // this.canvas.updateSlider();

                //timer end
                this.$refs.bpmnOpengraph.printTimer(startTime, new Date().getTime());

                this.$emit('update:loaded', true)
            });
        },

        data: function () {
            return {
                timerMap: {},
                enableHistoryAdd: false,
                processVariables: [],
                data: {
                    definition: null,
                    trigger: {},
                // pv: {
                //     name: ''
                // }
                },
                history: [],
                historyIndex: 0,
                undoing: false,
                undoed: false,
                id: null,
                // canvas: null,
                propertyEditing: false,
                componentChangerData: null,
                preventEvent: false,
                preLocale: null,
                defintionSettings: null,
                definitionSettings: false,
                processVariablesDialog: false,
            };
        },

        watch: {
            defintionSettings: {
                handler: function (newVal) {
                    if (!this.defintionSettings.shortDescription.localedTexts) {
                        this.defintionSettings.shortDescription.localedTexts = {
                            _type: 'java.util.HashMap'
                        };
                    }
                    this.defintionSettings.shortDescription.localedTexts[this.data.definition._selectedLocale] = this.defintionSettings.shortDescription.text;
                },
                deep: true
            },
            processVariables: {
                handler: function (after, before) {
                    console.log('processVariables update!!', after);
                    if (after && after.length) {
                        var me = this;
                        var processVariables = me.data.definition.processVariableDescriptors;
                        var copy = JSON.parse(JSON.stringify(after));
                        $.each(copy, function (i, c) {
                            var localedTexts;
                            $.each(processVariables, function (j, p) {
                                if (c.name == p.name) {
                                    localedTexts = p.displayName.localedTexts;
                                }
                            });
                            if (!localedTexts) {
                                localedTexts = {
                                    _type: 'java.util.HashMap'
                                };
                            }
                            localedTexts[me.data.definition._selectedLocale] = c.displayName;
                            c.displayName = {
                                _type: "org.uengine.contexts.TextContext",
                                text: c.displayName,
                                localedTexts: localedTexts
                            }
                        });
                        this.data.definition.processVariableDescriptors = copy;
                    }
                },
                deep: true
            },
            data: {
                handler: function (after, before) {
                    this.$emit('update:definition', after.definition);

                    if (this.propertyEditing) {
                        this.enableHistoryAdd = false;
                        console.log('definition updated while property panel open.');
                    }
                    //그 외의 경우는 정해진 상황을 강제하여 히스토리에 저장한다.
                    else {
                        if (this.enableHistoryAdd) {
                            this.enableHistoryAdd = false;
                        } else {
                            if (this.preLocale != after.definition._selectedLocale) {

                                // locale change시 defintionSettings locale 변경
                                if (this.defintionSettings.shortDescription.localedTexts[after.definition._selectedLocale]) {
                                    this.defintionSettings.shortDescription.text = this.defintionSettings.shortDescription.localedTexts[after.definition._selectedLocale];
                                }

                                // locale change시 processVariable locale 변경
                                var copy = JSON.parse(JSON.stringify(after.definition.processVariableDescriptors));
                                $.each(copy, function (i, variable) {
                                    if (variable.displayName) {
                                        if (variable.displayName.localedTexts && variable.displayName.localedTexts[after.definition._selectedLocale]) {
                                            variable.displayName._type="org.uengine.contexts.TextContext"
                                            variable.displayName.text = variable.displayName.localedTexts[after.definition._selectedLocale];
                                        } else {
                                            variable.displayName._type="org.uengine.contexts.TextContext"
                                            variable.displayName.text = variable.displayName.text;
                                        }
                                    }
                                });
                                this.processVariables = copy;
                                this.preLocale = after.definition._selectedLocale;
                            }
                            console.log('definition updated, but not allow add history.');
                            return;
                        }
                    }

                    if (!this.undoing) {
                        console.log('definition updated, we will add history.', after.definition);
                        if (this.undoed) { //if undoed just before, clear the history from the current historyIndex
                            this.history.splice(this.historyIndex, this.history.length - this.historyIndex);
                            this.undoed = false;
                        }
                        this.history.push(JSON.parse(JSON.stringify(after.definition))); //heavy
                        this.historyIndex = this.history.length - 1;
                    } else {
                        console.log('definition updated, but triggered by undo,redo action. will skip add history.');
                        this.undoing = false;
                    }
                },
                deep: true
            }
        },

        computed: {
            canUndo: function () {
                return this.historyIndex > 0
            },
            canRedo: function () {
                return this.history.length - 1 - this.historyIndex > 0
            },
            bpmnRole: function () {
                return 'bpmn-vue';
            },

        },

        methods: {
            openProcessVariables() {
                // this.$refs['processVariables'].open();
                this.processVariablesDialog = true
            },
            closeProcessVariables() {
                // this.$refs['processVariables'].close();
                this.processVariablesDialog = false
            },
            openDefinitionSettings() {
                // this.$refs['definitionSettings'].open();
                // this.$refs['definitionSettings'].open();
                this.definitionSettings = true
            },
            closeDefinitionSettings() {
                // this.$refs['definitionSettings'].close();
                // this.$refs['definitionSettings'].hide();
                this.definitionSettings = false
            },
            getRelativeFlowsByOpengraphId: function (id) {
                var me = this;
                var relations = [];
                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    if (activity.messageFlows && activity.messageFlows.length) {
                        $.each(activity.messageFlows, function (i, relation) {
                            if (relation && (relation.sourceRef == id || relation.targetRef == id)) {
                                relations.push(relation);
                            }
                        })
                    }
                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        $.each(activity.sequenceFlows, function (i, relation) {
                            if (relation && (relation.sourceRef == id || relation.targetRef == id)) {
                                relations.push(relation);
                            }
                        })
                    }
                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        $.each(activity.childActivities[1], function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                recursiveCheck(me.data.definition);
                return relations;
            },

            /**
             * 오픈그래프 아이디로 액티비티 또는 릴레이션을 찾는다.
             **/
            getActAndRelByOpengraphId: function (id) {
                var me = this;
                var selected;
                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    if (activity.tracingTag && activity.tracingTag == id) {
                        selected = activity;
                    }
                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        $.each(activity.sequenceFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = relation;
                            }
                        })
                    }
                    if (activity.messageFlows && activity.messageFlows.length) {
                        $.each(activity.messageFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = relation;
                            }
                        })
                    }
                    if (!selected) {
                        if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                            $.each(activity.childActivities[1], function (i, child) {
                                recursiveCheck(child);
                            })
                        }
                    }
                }
                recursiveCheck(me.data.definition);
                return selected;
            },

            getWhereRoleAmIByTracingTag: function (id) {
                var me = this;
                var selected;
                var roleName = null;
                var element = me.canvas.getElementById(id);
                var frontestGroupElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(element));
                if (frontestGroupElement && me.canvas.getRenderer().isLane(frontestGroupElement)) {
                    roleName = frontestGroupElement.shape.label;
                }
                return roleName;
            },

            getWherePoolAmIByTracingTag: function (id) {
                var me = this;
                var selected;
                var poolName = null;
                var element = me.canvas.getElementById(id);
                var laneElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(element));

                if (!laneElement || !me.canvas.getRenderer().isLane(laneElement)) {
                    return null;
                }

                var poolElement = me.canvas.getRenderer().getFrontForBoundary(me.canvas.getBoundary(laneElement));

                if (poolElement && me.canvas.getRenderer().isLane(poolElement)) {
                    return poolElement.shape.label;
                } else {
                    return laneElement.shape.label;
                }

            },

            /**
             * 오픈그래프 아이디로 부모 서브프로세스를 찾는다. 부모가 데피니션일 경우 null 리턴.
             **/
            getParentActByOpengraphId: function (id) {
                var me = this;
                var selected;
                var recursiveCheck = function (activity, parent) {
                    if (!activity) {
                        return;
                    }
                    if (activity.tracingTag == id) {
                        selected = parent;
                    }
                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        $.each(activity.sequenceFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = parent;
                            }
                        })
                    }
                    if (activity.messageFlows && activity.messageFlows.length) {
                        $.each(activity.messageFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                selected = parent;
                            }
                        })
                    }
                    if (!selected) {
                        if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                            $.each(activity.childActivities[1], function (i, child) {
                                recursiveCheck(child, activity);
                            })
                        }
                    }
                }
                recursiveCheck(me.data.definition, null);
                if (selected._type && selected._type == 'org.uengine.kernel.ProcessDefinition') {
                    return null;
                } else {
                    return selected;
                }
            },

            onBeforeDestroyElement: function (opengraphComponent, callback) {
                var id = opengraphComponent.id;

                //여기서 문제: 오픈그래프 객체를 제대로 삭제 안하면 이상해짐.
                //아마도 더블클릭은 먹히지만, shape 이 먹히지 않는걸로 보아,
                //drawshape 시에 id 를 재사용하여 그리는 방식에서 shape 가 동작을 잘 안하는 모양.
                //해당 코드를 봐서, shape 의 각종 메소드를 완전히 오버라이딩 하는 법을 찾자.
                //해결 => 오픈그래프 라이브러리 drawShape 에서, element node 에 shape 재등록을 실시함.

                var activityOrRelation = this.getActAndRelByOpengraphId(id);
                if (activityOrRelation) {
                    console.log('onBeforeDestroyElement!!', id)
                    callback(false);
                }
            },

            addChild: function (child, parent, isRelation) {
                if (isRelation) {
                    if (child._type == "org.uengine.kernel.bpmn.MessageFlow") {
                        this.data.definition.messageFlows.push(child);
                    } else if (parent) {
                        console.log('parent.tracingTag', parent.tracingTag);
                        if (!parent.sequenceFlows) {
                            parent.sequenceFlows = []
                        }
                        parent.sequenceFlows.push(child);
                    } else {
                        console.log('parent is root');
                        this.data.definition.sequenceFlows.push(child);
                    }


                } else {
                    if (parent) {
                        console.log('parent.tracingTag', parent.tracingTag);
                        if (!parent.childActivities) {
                            parent.childActivities = [
                                'java.util.ArrayList',
                                []
                            ]
                        }
                        parent.childActivities[1].push(child);
                    } else {
                        console.log('parent is root');
                        this.data.definition.childActivities[1].push(child);
                    }
                }
            },

            /**
             * 주어진 액티비티를 이동시킨다.
             * targetTracingTag 이 없다면 데피니션으로 이동시킨다.
             **/
            moveActivity: function (sourceTracingTag, targetTracingTag) {
                var me = this;
                var parent;
                if (targetTracingTag) {
                    parent = me.getActAndRelByOpengraphId(targetTracingTag);
                }

                var activity = me.getActAndRelByOpengraphId(sourceTracingTag);
                var copy = JSON.parse(JSON.stringify(activity));

                me.removeComponentByOpenGraphComponentId(sourceTracingTag);
                this.addChild(copy, parent);
                //연결선 공식 만들기.

                var relations = this.getRelativeFlowsByOpengraphId(sourceTracingTag);
                $.each(relations, function (i, relation) {
                    var relationId = relation.sourceRef + '-' + relation.targetRef;
                    var relationCopy = JSON.parse(JSON.stringify(relation));
                    var relativeParent;
                    if (relation.sourceRef == sourceTracingTag) {
                        relativeParent = me.getParentActByOpengraphId(relation.targetRef);
                    } else {
                        relativeParent = me.getParentActByOpengraphId(relation.sourceRef);
                    }
                    console.log('relativeParent', relativeParent);

                    me.removeComponentByOpenGraphComponentId(relationId);
                    var enableDraw = true;
                    if (!parent && relativeParent) {
                        enableDraw = false;
                    } else if (parent && !relativeParent) {
                        enableDraw = false;
                    } else if (parent && relativeParent && parent.tracingTag != relativeParent.tracingTag) {
                        enableDraw = false;
                    }

                    if (enableDraw) {
                        me.addChild(relationCopy, null);
                    } else {
                        if (me.$root.$children[0] && me.$root.$children[0].snackbar) {
                            me.$root.$children[0].error('동일한 서브프로세스에 위치한 액티비티가 아닐 경우 연결할 수 없습니다.');
                        }
                    }
                });
                //움직인 activity 를 source, target 가지는 모든 릴레이션을 구함.
                //각 릴레이션의 상대 activity 를 구함.
                //parent 가 있다면, 상대 activity 의 parent 가 동일할 경우
                //기존 위치한 릴레이션을 삭제함.
                //parent 에 릴레이션을 넣음.

                //parent 가 없다면, 상대 activity 의 parent 도 없을 경우
                //기존 위치한 릴레이션 삭제함.
                //parent 에 릴레이션 넣음.

                //양쪽 경우 다, 상대 activity 의 parent 가 틀릴 경우 릴레이션 삭제.

                me.data.definition = JSON.parse(JSON.stringify(me.data.definition));

                //문제는, 외부를 그린 후 내부 에 의해 삭제되어버림.
                //액티비티에 삭제 방지를 걸고, 렌더링 후 삭제 방지를 푼다.
                //서브프로세스 내부는 삭제를 방지하기?? => No
                //이럴 경우 또 히스토리 조정에 따라 먹히지 않게 됨.
                //내부를 그린 후 외부에서 삭제되어도 마찬가지.
                //그럼, 삭제하기 전에, 데피니션에 트레이싱 태그가 있으면 삭제하지 않는걸로 하면 된다.
                //그러기 위해서, before remove 가 필요.
                console.log('moved!!', sourceTracingTag, targetTracingTag);
            },
            /**
             * 이 과정에서는 부모-자식 양방향 통신이 필요한 요소나,
             * watch 가 필요한 요소들이 null 로 인해 감지를 하지 못할 경우를 위해
             * 값을 채워넣는다.
             *
             * 값을 채우지 않고 null 이 흘러간다면, 뒤이은 컴포넌트에서 값을 업데이트하여도 Vue 라이프사이클은 이를 감지하지 못한다.
             **/
            validateDefinition: function (value) {
                var bpmnComponent, required, me = this;
                var definition = JSON.parse(JSON.stringify(value));

                //롤 검증.
                if (!definition.roles) {
                    definition.roles = [];
                }
                bpmnComponent = me.getComponentByName('bpmn-role');
                $.each(definition.roles, function (i, role) {
                    required = bpmnComponent.default.computed.createNew();
                    for (var key in required) {
                        if (!role[key]) {
                            role[key] = required[key];
                        }
                    }
                    if (!role.elementView.style) {
                        role.elementView.style = JSON.stringify({});
                    }
                })

                //기본 액티비티 검증.
                if (!definition.childActivities) {
                    definition.childActivities = [
                        'java.util.ArrayList',
                        []
                    ]
                }
                if (!definition.childActivities[1]) {
                    definition.childActivities[1] = [];
                }

                //기본 시퀀스 플로우 검증.
                if (!definition.sequenceFlows) {
                    definition.sequenceFlows = [];
                }

                //기본 시퀀스 플로우 검증.
                if (!definition.messageFlows) {
                    definition.messageFlows = [];
                }

                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    //액티비티일 경우
                    if (activity._type && activity._type != 'org.uengine.kernel.ProcessDefinition') {
                        bpmnComponent = me.getComponentByClassName(activity._type);
                        required = bpmnComponent.computed.createNew();
                        for (var key in required) {
                            if (!activity[key]) {
                                activity[key] = required[key];
                            }
                        }
                        if (!activity.elementView.style) {
                            activity.elementView.style = JSON.stringify({});
                        }
                    }

                    //시퀀스 플로우 필수값
                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        $.each(activity.sequenceFlows, function (i, relation) {
                            bpmnComponent = me.getComponentByName('bpmn-relation');
                            required = bpmnComponent.computed.createNew();
                            for (var key in required) {
                                if (!relation[key]) {
                                    relation[key] = required[key];
                                }
                            }
                            if (!relation.relationView.style) {
                                relation.relationView.style = JSON.stringify({});
                            }
                        })
                    }

                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        $.each(activity.childActivities[1], function (i, child) {
                            recursiveCheck(child);
                        });
                    }
                }
                recursiveCheck(definition);

                //processVariableDescriptors 검증
                if (!definition.processVariableDescriptors) {
                    definition.processVariableDescriptors = [];
                }

                return definition;
            },
            /**
             * 도형이 삭제되었을 경우.
             **/
            onRemoveShape: function (component) {
                console.log('remove component by user action', component.id);
                this.removeComponentByOpenGraphComponentId(component.id);
            },
            /**
             * Lane 이 분기되었을 경우.
             **/
            onDivideLane: function (dividedLane) {
                var me = this;
                var boundary = dividedLane.shape.geom.getBoundary();
                var bpmnComponent = me.getComponentByName('bpmn-role');

                var additionalData = bpmnComponent.computed.createNew(
                    boundary.getCentroid().x,
                    boundary.getCentroid().y,
                    boundary.getWidth(),
                    boundary.getHeight());

                additionalData.elementView.id = dividedLane.id;
                additionalData.elementView.parent = me.canvas.getParent(dividedLane).id;

                me.data.definition.roles.push(additionalData);
            },
            /**
             * 도형이 연결되었을 경우.
             **/
            onConnectShape: function (edge, from, to) {
                var me = this;
                //존재하는 릴레이션인 경우 (뷰 컴포넌트), 데이터 매핑에 의해 자동으로 from, to 가 변경되어있기 때문에 따로 로직은 필요없음.
                //=> 바뀌어야 함.
                //신규 릴레이션인 경우에는 릴레이션 생성
                var edgeElement, originalData;
                var isComponent = false;
                if (edge.shape) {
                    edgeElement = edge;
                } else {
                    isComponent = true;
                    edgeElement = edge.element;
                    originalData = this.getActAndRelByOpengraphId(edgeElement.id);
                }

                if (edgeElement && from && to) {
                    var vertices = '[' + edgeElement.shape.geom.vertices.toString() + ']';
                    var componentInfo = {
                        component: "bpmn-relation",
                        from: from.id,
                        to: to.id,
                        vertices: vertices
                    }

                    if (isComponent) {
                        me.canvas.removeShape(edgeElement, true);
                        this.removeComponentByOpenGraphComponentId(edgeElement.id);
                        //기존 컴포넌트가 있는 경우 originalData 와 함께 생성
                        this.addComponenet(componentInfo, null, JSON.parse(JSON.stringify(originalData)));
                    } else {
                        me.canvas.removeShape(edgeElement, true);
                        //기존 컴포넌트가 없는 경우 신규 생성
                        this.addComponenet(componentInfo);
                    }
                }
            },
            /**
             * 그래프 상에서 사용자 액션에 의한 변경사항 발생시
             **/
            onUserAction: function () {
                if (this.preventEvent) {
                    this.preventEvent = false;
                    console.log('** onUserAction fired, but preventEvent!!');
                } else {
                    console.log('** onUserAction fired.');
                    this.enableHistoryAdd = true;
                    //TODO 데피니션 업데이트 watch 를 강제 활성화시키는 더 좋은 방법 찾아보기.
                    this.data.trigger = JSON.parse(JSON.stringify(this.data.trigger));
                }
            },
            /**
             * 캔버스 준비시
             **/
            bpmnReady: function (opengraph) {
                this.canvas = opengraph.canvas;
                this.canvas._CONFIG.FAST_LOADING = true;
                console.log('this.canvas._CONFIG.FAST_LOADING');
                this.$emit('bpmnReady', opengraph);
            },
            /**
             * 드랍이벤트, 컨트롤러를 통한 추가, 선연결 변경시
             * @param {Object} shapeInfo (shapeId,x,y,width,height,label)
             **/
            addComponenet: function (componentInfo, newTracingTag, originalData) {
                this.enableHistoryAdd = true;
                var me = this;
                var additionalData = {};

                //릴레이션 추가인 경우
                if (componentInfo.component == 'bpmn-relation') {
                    var from = componentInfo.from;
                    var to = componentInfo.to;

                    var fromParent = this.getParentActByOpengraphId(componentInfo.from);
                    var toParent = this.getParentActByOpengraphId(componentInfo.to);

                    var fromAct = this.getActAndRelByOpengraphId(componentInfo.from);
                    var toAct = this.getActAndRelByOpengraphId(componentInfo.to);

                    var fromPool = this.getWherePoolAmIByTracingTag(fromAct.tracingTag)
                    var toPool = this.getWherePoolAmIByTracingTag(toAct.tracingTag)

                    console.log({formRole: fromPool, toRole: toPool})

                    var relationComponentTag = (fromPool == toPool || toPool == null ? "bpmn-relation" : "bpmn-message-flow")

                    var bpmnComponent = me.getComponentByName(relationComponentTag);
                    additionalData = bpmnComponent.default.computed.createNew(
                        componentInfo.from,
                        componentInfo.to,
                        componentInfo.vertices);

                    if (originalData) {
                        for (var key in originalData) {
                            if (key != 'sourceRef' && key != 'targetRef' && key != 'relationView') {
                                additionalData[key] = originalData[key];
                            }
                        }
                    }

                    var enableDraw = true;
                    //서로 다른 서브프로세스 부모를 가진 경우는 연결을 추가하지 않는다.
                    if (fromParent && !toParent) {
                        enableDraw = false;
                    }
                    if (!fromParent && toParent) {
                        enableDraw = false;
                    }
                    if (fromParent && toParent && fromParent.tracingTag != toParent.tracingTag) {
                        enableDraw = false;
                    }
                    if (enableDraw) {
                        if (fromParent && toParent && fromParent.tracingTag == toParent.tracingTag) {
                            this.addChild(additionalData, fromParent, true);
                        } else {
                            this.addChild(additionalData, null, true);
                        }
                    } else {
                        if (me.$root.$children[0] && me.$root.$children[0].snackbar) {
                            me.$root.$children[0].error('동일한 서브프로세스에 위치한 액티비티가 아닐 경우 연결할 수 없습니다.');
                        }
                        console.log('Can not create relation between other subprocess.',
                            componentInfo.from,
                            componentInfo.to);
                    }
                }
                //롤 추가인 경우
                else if (componentInfo.component == 'bpmn-role') {
                    var bpmnComponent = me.getComponentByName('bpmn-role');

                    additionalData = bpmnComponent.default.computed.createNew(
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height);
                    me.data.definition.roles.push(additionalData);
                }
                //액티비티 추가인 경우
                else {
                    var bpmnComponent = me.getComponentByName(componentInfo.component);
                    if (!newTracingTag) {
                        newTracingTag = me.createNewTracingTag();
                    }
                    console.log('newTracingTag', newTracingTag);

                    additionalData = bpmnComponent.default.computed.createNew(
                        newTracingTag,
                        componentInfo.x,
                        componentInfo.y,
                        componentInfo.width,
                        componentInfo.height);

                    var envelope = new OG.geometry.Envelope([
                            componentInfo.x - componentInfo.width / 2,
                            componentInfo.y - componentInfo.height / 2
                        ], componentInfo.width,
                        componentInfo.height
                    );
                    var frontGroupElement = me.canvas.getRenderer().getFrontForBoundary(envelope);
                    console.log(frontGroupElement)
                    if (frontGroupElement) {
                        var parent = this.getActAndRelByOpengraphId(frontGroupElement.id);
                        this.addChild(additionalData, parent);
                    } else {
                        this.addChild(additionalData, null);
                    }
                }
            },

            /**
             * 자바 클래스로 Bpmn 컴포넌트를 가져온다.
             **/
            getComponentByClassName: function (className) {
                var componentByClassName;
                $.each(window.Vue.bpmnComponents, function (i, component) {
                    if (component.default.computed && component.default.computed.className && component.default.computed.className() == className) {
                        componentByClassName = component.default;
                    }
                });
                return componentByClassName;
            },

            /**
             * 컴포넌트 이름으로 Bpmn 컴포넌트를 가져온다.
             **/
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue.bpmnComponents, function (i, component) {
                    if (component.default.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },

            undo: function () {
                if (this.canUndo) {
                    this.canvas._CONFIG.FAST_LOADING = true;
                    this.historyIndex -= 1
                    this.undoing = true;
                    this.undoed = true;
                    this.data.definition = this.history[this.historyIndex];
                    console.log('length: ' + this.history.length, ' historyIndex : ', this.historyIndex, this.data.definition);
                    this.$nextTick(function () {
                        this.canvas._CONFIG.FAST_LOADING = false;
                        this.canvas.updateSlider();
                    })
                }
            },

            redo: function () {
                if (this.canRedo) {
                    this.canvas._CONFIG.FAST_LOADING = true;
                    this.historyIndex += 1
                    this.undoing = true;
                    this.undoed = true;
                    this.data.definition = this.history[this.historyIndex]
                    console.log('length: ' + this.history.length, ' historyIndex : ', this.historyIndex, this.data.definition);
                    this.$nextTick(function () {
                        this.canvas._CONFIG.FAST_LOADING = false;
                        this.canvas.updateSlider();
                    })
                }
            },

            /**
             * 새로운 트레이싱 태그를 생성한다.
             *
             * 기본으로 히스토리를 검색하며, 주어진 데피니션이 있을 경우 추가로 검색한다.
             **/
            createNewTracingTag: function (additionalDefinition) {
                var me = this, maxTracingTag = 0,
                    isInt = function (value) {
                        return !isNaN(value) &&
                            parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
                    }
                var me = this;
                var selected;
                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    if (isInt(activity.tracingTag) && activity.tracingTag > maxTracingTag) {
                        maxTracingTag = parseInt(activity.tracingTag);
                    }
                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        $.each(activity.childActivities[1], function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                //히스토리에 있는 데이터도 참조하여, 충돌되는 트레이싱 태그가 없도록 한다. (가장 큰 트레이싱 태그 +1)
                if (me.history && me.history.length) {
                    $.each(me.history, function (i, definition) {
                        recursiveCheck(definition);
                    })
                }
                if (additionalDefinition) {
                    recursiveCheck(additionalDefinition);
                }
                return maxTracingTag + 1 + '';
            },

            /**
             * 데피니션에 트레이싱 태그가 있는지 확인한다.
             **/
            checkExistTracingTag: function (tracingTag) {
                var me = this, isExist = false;
                var recursiveCheck = function (activity) {
                    if (!activity) {
                        return;
                    }
                    if (activity && activity.tracingTag == tracingTag) {
                        isExist = true;
                    }
                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        $.each(activity.childActivities[1], function (i, child) {
                            recursiveCheck(child);
                        })
                    }
                }
                if (me.data.definition) {
                    recursiveCheck(me.data.definition);
                }
                return isExist;
            },

            /**
             * 오픈그래프 컴포넌트 아이디에 해당하는 Bpmn 컴포넌트를 삭제한다.
             **/
            removeComponentByOpenGraphComponentId: function (id) {
                var me = this;
                var recursiveRemove = function (activity) {
                    if (!activity) {
                        return;
                    }
                    //릴레이션 삭제
                    if (activity.messageFlows && activity.messageFlows.length) {
                        $.each(activity.messageFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                console.log('** remove sequenceFlow', id);
                                activity.messageFlows[i] = undefined;
                            }
                        });
                    }

                    if (activity.sequenceFlows && activity.sequenceFlows.length) {
                        $.each(activity.sequenceFlows, function (i, relation) {
                            if (relation && relation.sourceRef + '-' + relation.targetRef + '' == id) {
                                console.log('** remove sequenceFlow', id);
                                activity.sequenceFlows[i] = undefined;
                            }
                        });
                    }
                    //액티비티 삭제
                    if (activity.childActivities && activity.childActivities[1] && activity.childActivities[1].length) {
                        $.each(activity.childActivities[1], function (i, child) {
                            console.log('toRemove', child, id);
                            if (child && child.elementView && child.elementView.id == id) {
                                activity.childActivities[1][i] = undefined;
                            } else {
                                //재귀호출
                                recursiveRemove(child);
                            }
                        })
                    }
                }

                //롤 삭제
                $.each(me.data.definition.roles, function (i, role) {
                    if (role && role.elementView && role.elementView.id == id) {
                        console.log('** remove role', id);
                        me.data.definition.roles[i] = undefined;
                    }
                });

                //릴레이션, 액티비티 삭제
                recursiveRemove(me.data.definition);
            },

            /**
             * 무작위 랜덤 아이디 생성
             * @returns {string} 랜덤 아이디
             */
            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
</style>
