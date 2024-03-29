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
                        'stroke': value.color,
                        fill: value.color,
                        'fill-opacity': 1,
                        r: '1'
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
                        :text="value._type">
                </text-element>
                <image-element
                        :image="value.icon"
                        :sub-bottom="5"
                        :sub-left="5"
                        :sub-width="25"
                        :sub-height="25">
                </image-element>
            </sub-elements>
        </geometry-element>

        <property-panel
                v-if="propertyPanel"
                v-model="value"
                :img="value.icon"
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
    import PropertyPanel from './CRDPropertyPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [Element],
        name: 'crdTemplate',
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            "property-panel": PropertyPanel
        },
        props: {},
        computed: {
            className() {
                return 'CrdTemplate'
            },
            createNew(elementId, x, y, width, height, object, kind, icon, color) {
                return {
                    _type: kind,
                    name: '',
                    namespace: '',
                    elementView: {
                        '_type': kind,
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    object: object ? object : {
                        "apiVersion": "",
                        "kind": "",
                        "metadata": {
                            "name": "",
                        },
                        "spec": {}
                    },
                    advancedAttributePaths: {},
                    connectableType: [],
                    icon: icon,
                    color: color,
                }
            },
            namespace: {
                get: function () {
                    return this.value.object.metadata.namespace
                },
                set: function (newVal) {
                    this.value.object.metadata.namespace = newVal
                }
            },
            name() {
                try {
                    return this.value.object.metadata.name;
                } catch (e) {
                    return "";
                }

            },
        },
        data: function () {
            return {};
        },
        created: function () {
            var me = this
        },
        mounted() {
            var me = this
        },
        watch: {
            "value": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                }, 200)
            },
        },
        methods: {
            isConnected(to, from) {
                var connectable = from.connectableType.some((type) => {
                    if(type == to._type) {
                        return true
                    }
                })
                var res = false
                if(connectable) {
                    res = true
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