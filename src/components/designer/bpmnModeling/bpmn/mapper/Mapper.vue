<template>
    <div>
        <v-layout>
            <opengraph 
                    v-if="drawer"
                    :enableContextmenu="false"
                    v-on:connectShape="onConnectShape"
                    v-on:canvasReady="bindEvents"
            >
                <div v-for="(item, index) in left" :key="item.name">
                    <text-element
                            selectable
                            v-on:selectShape="selectedVariable(item)"
                            v-on:deSelectShape="deSelectedVariable"
                            :text="item.name"
                            :_style="{
                                'font-color': 'grey',
                                'text-anchor': 'start'
                            }"
                            :width="50"
                            :x="50"
                            :y="100 + (index*20)"
                    ></text-element>
                    <circle-element 
                            :x="100" 
                            :y="100 + (index*20)" 
                            :width="7" 
                            :height="7"
                            selectable 
                            connectable 
                            draggable 
                            movable
                            v-on:selectShape="selectedVariable(item)"
                            v-on:deSelectShape="deSelectedVariable"
                    ></circle-element>
                    <!-- <bpmn-mapper-context-menu
                            :elementId="item.name+index"
                            :options="menuList"
                            :ref="'vueSimpleContextMenu'"
                    ></bpmn-mapper-context-menu> -->
                </div>
                <div v-for="(relation, idx) in mapperRelations" :key="idx">
                    <edge-element
                            selectable
                            connectable
                            movable
                            deletable
                            :vertices.sync="relation.vertices"
                            :_style="{
                                'edge-type': 'straight'
                            }"
                            v-on:removeShape="deleteElement(relation)"
                    ></edge-element>
                </div>
                <!-- <div v-for="(item, index) in left" :key="item.name">
                    <bpmn-process-variables
                            v-if="item != null"
                            :value="item"
                            :y="100 + (index*20)"
                    ></bpmn-process-variables>
                </div>
                <div v-for="relation in mapperRelations" :key="relation.relationView.id">
                    <bpmn-mapper-relation 
                            v-if="relation != null" 
                            :value="relation"
                            :definition="value"
                            :ref="relation.relationView.id"
                    ></bpmn-mapper-relation>
                </div> -->

                <rectangle-element 
                        v-for="transformer in transformers" :key="transformer.type"
                        :x.sync="transformer.location.x" 
                        :y.sync="transformer.location.y" 
                        :width="100"  
                        :height="20"
                        :text="transformer.name"
                        selectable 
                        connectable 
                        draggable 
                        movable 
                        resizable 
                        deletable
                        v-on:selectShape="selectedTransformer(transformer)"
                        v-on:deSelectShape="deSelectedTransformer()"
                        v-on:removeShape="deleteElement(transformer)"
                >
                    <sub-elements>
                        <text-element
                                :text="transformer.name"
                                :sub-width="'100%'"
                                :sub-height="'30px'"
                                :sub-align="'left'"
                                :sub-vertical-align="'middle'"
                                :sub-style="{
                                    'font-color': 'grey'
                                }"
                        ></text-element>
                    </sub-elements>
                </rectangle-element>

                <div v-for="(item, index) in right" :key="item.name+index">
                    <text-element
                            selectable
                            v-on:selectShape="selectedVariable(item)"
                            v-on:deSelectShape="deSelectedVariable"
                            :text="item.name"
                            :_style="{
                                'font-color': 'grey',
                                'text-anchor': 'end'
                            }"
                            :width="50"
                            :x="550"
                            :y="100 + (index*20)"
                    ></text-element>

                    <circle-element
                            selectable 
                            connectable 
                            draggable 
                            movable
                            :x="500" 
                            :y="100 + (index*20)" 
                            :width="7" 
                            :height="7"
                    ></circle-element>
                </div>
            </opengraph>

            <div style="height:300px"></div>
        </v-layout>
        
        <div class="ma-6" style="padding-bottom: 30px">
            <v-btn color="primary" outlined @click="addTransformer">ADD TRANSFORMER</v-btn>

            <div v-if="editingTransformer" style="margin-top: 10px">
                <v-select
                        v-model="editingTransformer._type"
                        @change="changeName"
                        label="트랜스포머 유형"
                        :items="transformerList"
                        item-text="type"
                        item-value="value"
                        item-disabled="disabled"
                ></v-select>
                <v-text-field
                        v-model="editingTransformer.name"
                        label="이름"
                ></v-text-field>
            </div>

            <div v-if="editingVariable" style="margin-top: 10px">
                <v-text-field
                        label="Name"
                        v-model="editingVariable.name"
                ></v-text-field>
                <v-text-field
                        label="Display Name"
                        v-model="editingVariable.displayName.text"
                ></v-text-field>
                <v-text-field
                        label="Default Value In String"
                        v-model="editingVariable.defaultValueInString"
                ></v-text-field>
                <v-switch
                        v-model="value.global"
                        label="Global"
                ></v-switch>
                <v-select
                        v-model="value.persistOption"
                        label="Persist Option"
                ></v-select>
            </div>
        </div>
    </div>
</template>

<script>
    import MapperContextMenuVue from './MapperContextMenu';

    export default {
        name: 'bpmn-mapper',
        components: {
            'bpmn-mapper-context-menu': MapperContextMenuVue
        },
        props: {
            drawer: Boolean,
            definition: Object,
            value: Object,
        },
        data: function(){
            return {
                copyValue: this.value,
                mapperRelations: [],
                transformers: [],
                editingTransformer: null,
                editingVariable: null,
                transformerList: [
                    { type: 'Math', disabled: true },
                    { type: 'Max', value: 'org.uengine.processdesigner.mapper.transformers.MaxTransformer' },
                    { type: 'Round', value: 'org.uengine.processdesigner.mapper.transformers.RoundTransformer' },
                    { type: 'Sum', value: 'org.uengine.processdesigner.mapper.transformers.SumTransformer' },
                    { type: 'Floor', value: 'org.uengine.processdesigner.mapper.transformers.FloorTransformer' },
                    { type: 'Ceil', value: 'org.uengine.processdesigner.mapper.transformers.CeilTransformer' },
                    { type: 'Min', value: 'org.uengine.processdesigner.mapper.transformers.MinTransformer' },
                    { type: 'String', disabled: true },
                    { type: 'Concat', value: 'org.uengine.processdesigner.mapper.transformers.ConcatTransformer' },
                    { type: 'To Number', value: 'org.uengine.processdesigner.mapper.transformers.NumberTransformer' },
                    { type: 'String to Number Format', value: 'org.uengine.processdesigner.mapper.transformers.NumberFormatTransformer' },
                    { type: 'Data', disabled: true },
                    { type: 'Direct Value', value: 'org.uengine.processdesigner.mapper.transformers.DirectValueTransformer' },
                    { type: 'Replace', value: 'org.uengine.processdesigner.mapper.transformers.ReplaceTransformer' },
                    { type: 'Bean Property Value', value: 'org.uengine.processdesigner.mapper.transformers.BeanValueTransformer' },
                    { type: 'Validation', disabled: true },
                    { type: 'Is Not Null', value: 'org.uengine.processdesigner.mapper.transformers.NotNullValidatorTransformer' },
                    { type: 'RegExp Validation', value: 'org.uengine.processdesigner.mapper.transformers.RegularExpValidatorTransformer' },
                    { type: 'Size Validation', value: 'org.uengine.processdesigner.mapper.transformers.SizeValidatorTransformer' },
                    { type: 'Create Sequence', value: 'org.uengine.processdesigner.mapper.transformers.SequenceGeneratorTransformer' },
                ],
                menuList: [
                    {name: "Edit"},
                    {name: "Delete"},
                ]
            }
        },
        computed: {
            left: function() {
                var items = [];
                this.definition.processVariableDescriptors.forEach(function (variable) {
                    items.push(variable);
                });
                return items;
            },
            right: function() {
                return this.left;
            },
        },
        watch: {
            mapperRelations: {
                deep: true,
                handler: function(value) {
                    this.copyValue.mapperRelations = value;
                    this.$emit("input", this.copyValue);
                }
            },
            transformers: {
                deep: true,
                handler: function(value) {
                    this.copyValue.transformers = value;
                    this.$emit("input", this.copyValue);
                }
            }
        },
        mounted: function() {
            if(this.copyValue) {
                if(this.copyValue.transformers) {
                    this.transformers = this.copyValue.transformers;
                }
                if(this.copyValue.mapperRelations) {
                    this.mapperRelations = this.copyValue.mapperRelations
                }
            }
        },
        methods: {
            addTransformer: function() {
                this.transformers.push({
                    name: 'SUM',
                    _type: 'org.uengine.kernel.transformers.SumTransformer',
                    location:{
                        x: 300, 
                        y: 200
                    }
                })
            },
            showProperty: function(transformer) {
                this.editingTransformer = transformer;
            },
            changeName: function() {
                this.editingTransformer.name = this.editingTransformer._type;
            },
            /**
             * 도형이 연결되었을 경우.
             **/
            onConnectShape: function (edge, from, to) {
                var me = this;
                var edgeElement;
                if (edge.shape) {
                    edgeElement = edge;
                } else {
                    edgeElement = edge.element;
                }

                if (edgeElement && from && to) {
                    var vertices = [];
                    vertices.push(edge.shape.from);
                    vertices.push(edge.shape.geom.vertices[edge.shape.geom.vertices.length-1]);

                    // var bpmnComponent = me.getComponentByName('bpmn-mapper-relation');
                    // var componentInfo = {
                    //     component: "bpmn-mapper-relation",
                    //     from: from.id,
                    //     to: to.id,
                    //     vertices: JSON.stringify(vertices[0])
                    // }
                    // var additionalData = bpmnComponent.default.computed.createNew(
                    //     componentInfo.from,
                    //     componentInfo.to,
                    //     // componentInfo.vertices,
                    //     '[' + componentInfo.vertices + ']',
                    //     this.uuid()
                    // );

                    // me.mapperRelations.push(additionalData);
                    me.mapperRelations.push({
                        _type: 'mapper-relation',
                        vertices: vertices
                    });
                    me.canvas.removeShape(edgeElement, true);
                }
            },
            bindEvents: function (opengraph) {
                var me = this;
                me.canvas = opengraph.canvas;
            },
            deleteElement: function(element) {
                var me = this;
                if(element._type.includes('transformers')) {
                    me.transformers.splice(me.transformers.indexOf(element), 1);
                } else {
                    me.mapperRelations.splice(me.mapperRelations.indexOf(element), 1);
                }
            },
            selectedTransformer: function(transformer) {
                this.editingTransformer = transformer;
            },
            deSelectedTransformer: function() {
                this.editingTransformer = null;
            },
            selectedVariable: function(variable) {
                if(variable.typeClassName == 'class')
                    this.editingVariable = variable;
            },
            deSelectedVariable: function() {
                this.editingVariable = null;
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
            getComponentByName: function (name) {
                var componentByName;
                $.each(window.Vue.bpmnComponents, function (i, component) {
                    if (component.default.name == name) {
                        componentByName = component;
                    }
                });
                return componentByName;
            },
            handleClick(event, index) {
                var me = this
                // event.pageY = event.pageY - 100
                var obj = {
                    pageX: event.x,
                    pageY: event.y
                }
                me.$refs.vueSimpleContextMenu[index].showMenu(obj);
            },
        }
    }

</script>
