<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                :connectable="!canvas.isReadOnlyModel"
                :deletable="!canvas.isReadOnlyModel"
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                v-on:removeShape="onRemoveShape"
                :label.sync="name"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold','font-size': '16'
                }"
                v-on:contextmenu.prevent.stop="handleClick($event)"
        >

            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#2dcbfb',
                        fill: '#2dcbfb',
                        'fill-opacity': 1,
                        r: '1',
                        'z-index': '998'
                    }"
            ></geometry-rect>
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-controller
                    :image="'terminal.png'"
                    @click.prevent.stop="handleClick($event)"
            ></sub-controller>

            <sub-elements>
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'Job'">
                </text-element>
                <image-element
                        :image="imgSrc"
                        :sub-top="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25">
                </image-element>
            </sub-elements>
            <k8s-sub-controller
                    v-for="(connectableType, idx) in filterConnectionTypes" :key="idx"
                    :element="value"
                    :image="connectableType.src"
                    :type="connectableType.component">
            </k8s-sub-controller>
        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="imgSrc"
                :validationLists="filteredElementValidationResults"
                :isReadOnly="!isEditElement"
                @close="closePanel"
        >
        </property-panel>

        <vue-context-menu
            :elementId="value.elementView.id"
            :options="menuList"
            :ref="'vueSimpleContextMenu'"
            @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import Element from "../KubernetesElement";
    import PropertyPanel from './JobPropertyPanel'
    import ImageElement from "../../../opengraph/shape/ImageElement";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'job',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            ImageElement,
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'Job'
            },
            imgSrc() {
                return `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/kubernetes/job.svg`
            },
            createNew(elementId, x, y, width, height, object) {
                return {
                    _type: this.className(),
                    name: '',
                    namespace: '',
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: object ? object : {
                        "apiVersion": "batch/v1",
                        "kind": "Job",
                        "metadata": {
                            "name": ""
                        },
                        "spec": {
                            "template": {
                                "spec": {
                                    "containers": [
                                        {
                                            "name": "",
                                            "image": ""
                                        }
                                    ],
                                    "restartPolicy": "Never"
                                }
                            },
                            "backoffLimit": 6,
                        },
                    },
                    status: null,
                    connectableType: [ "PersistentVolumeClaim", "ConfigMap", "Secret" ],
                    outboundVolumes: [],
                    outboundConfigMap: null,
                    outboundSecrets: [],
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch (e) {
                    return "Untitled";
                }
            },
            namespace: {
                get: function() {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal){
                    this.value.object.metadata.namespace = newVal
                }
            },
            outboundVolumeNames() {
                var me = this
                try {
                    var names = "";
                    me.value.outboundVolumes.forEach(element => {
                        names += element.object.metadata.name + ","
                    });

                    return names;
                } catch (e) {
                    return "";
                }
            },
            outboundConfigMapName() {
                try {
                    return this.value.outboundConfigMap.object.metadata.name + ",";
                } catch (e) {
                    return "";
                }
            },
            outboundSecretNames() {
                try {
                    var me = this;
                    var names = "";
                    me.value.outboundSecrets.forEach(el => {
                        names += el.object.metadata.name + ",";
                        me.setEnv(el);
                    });
                    return names;
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {};
        },
        created: function () {
        },
        mounted(){
            var me = this;

            this.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "PersistentVolumeClaim") {
                    var duplicate = me.value.outboundVolumes.find(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    var duplicateIndex = me.value.outboundVolumes.findIndex(item => item.elementView.id == obj.element.targetElement.elementView.id)
                    if (duplicate) {
                        // 재연결 및 업데이트 기능
                        obj.element.sourceElement = me.value
                        me.value.outboundVolumes[duplicateIndex] = obj.element.targetElement
                        me.value.outboundVolumes.__ob__.dep.notify();
                        return true
                    } else {
                        me.value.outboundVolumes.push(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "PersistentVolumeClaim") {
                    me.value.outboundVolumes.splice(me.value.outboundVolumes.indexOf(obj.element.targetElement), 1);
                }

                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ConfigMap") {
                    me.value.outboundConfigMap = obj.element.targetElement;
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "ConfigMap") {
                    me.value.outboundConfigMap = null;
                }
                
                if (obj.action == "addRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Secret") {
                    me.value.object.spec.template.spec.containers[0].env = [];
                    var res = me.value.outboundSecrets.some((el) => {
                        if(el.elementView.id == obj.element.targetElement.elementView.id) {
                            return true;
                        }
                    });
                    if(!res) {
                        me.value.outboundSecrets.push(obj.element.targetElement);
                        // me.setEnv(obj.element.targetElement);
                    }
                }
                if (obj.action == "deleteRelation" && obj.element && obj.element.targetElement && obj.element.targetElement._type == "Secret") {
                    me.value.outboundSecrets.splice(me.value.outboundSecrets.indexOf(obj.element.targetElement), 1);
                }
            })
        },
        watch: {
            name(appName) {
                this.menuList.forEach((cmd) => {
                    if(cmd.name.includes('-l app=')) {
                        cmd.name = "kubectl get po -l app=" + appName;
                    }
                })
            },
            outboundVolumeNames(val) {
                var me = this;
                me.value.object.spec.template.spec.volumes = [];
                me.value.object.spec.template.spec.containers[0].volumeMounts = [];

                if(val.length < 1) {
                    delete me.value.object.spec.template.spec.volumes;
                    delete me.value.object.spec.template.spec.containers[0].volumeMounts;
                } else {
                    me.value.outboundVolumes.forEach(element => {
                            me.value.object.spec.template.spec.volumes.push({
                                "name": element.object.metadata.name,
                                "persistentVolumeClaim": {
                                    "claimName": element.object.metadata.name
                                }
                            });
                            me.value.object.spec.template.spec.containers[0].volumeMounts.push({
                                "mountPath": "/data",
                                "name": element.object.metadata.name
                            });
                        }
                    );
                }
            },
            outboundConfigMapName(val) {
                var me = this;
                me.value.object.spec.template.spec.containers[0].envFrom = [];

                if(val.length < 1) {
                    delete me.value.object.spec.template.spec.containers[0].envFrom;
                } else {
                    me.value.object.spec.template.spec.containers[0].envFrom.push({
                        "configMapRef": {
                            "name": me.value.outboundConfigMap.object.metadata.name
                        }
                    });
                }
            },
            outboundSecretNames(val) {
                // console.log(val);
            },
            "value": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                }, 200)
            },
        },
        methods: {
            setEnv(el) {
                var me = this;
                var keyArr = Object.keys(el.object.data);
                me.value.object.spec.template.spec.containers[0].env = [];
                keyArr.forEach(key => {
                    var env = {
                        'name': key.toUpperCase(),
                        'valueFrom': {
                            'secretKeyRef': {
                                'name': el.object.metadata.name,
                                'key': key
                            }
                        }
                    }
                    me.value.object.spec.template.spec.containers[0].env.push(env);
                });
                if(me.value.object.spec.template.spec.containers[0].env.length == 0) {
                    delete me.value.object.spec.template.spec.containers[0].env
                }
            },
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    if(to._type == 'PersistentVolumeClaim' && from.object.spec.template.spec.volumes) { 
                        res = from.object.spec.template.spec.volumes.some((volume) => {
                            if(volume.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(to._type == 'ConfigMap' && from.object.spec.template.spec.containers[0].envFrom) {
                        res = from.object.spec.template.spec.containers[0].envFrom.some((cm) => {
                            if(cm.configMapRef.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    } else if(to._type == 'Secret' && from.object.spec.template.spec.containers[0].env) {
                        res = from.object.spec.template.spec.containers[0].env.some((secret) => {
                            if(secret.valueFrom.secretKeyRef.name == to.object.metadata.name) {
                                return true
                            }
                        })
                    }
                }
                return res
            },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                this.$super(Element).validate()

                //Element
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }

                me.canvas.changedTemplateCode = true
            },
        }
    }
</script>
  
<style>

</style>