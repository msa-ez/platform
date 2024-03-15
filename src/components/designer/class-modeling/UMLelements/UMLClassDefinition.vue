<template>
    <div>
        <group-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                :connectable="connectable"
                :id="value.id ? value.id : value.elementView.id"
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
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:addedToGroup="onAddedToGroup"
                :label="!value.isVO && !value.isAggregateRoot && !value.isInterface ? namePanel : ''"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold', 'font-size': '14',
                    'vertical-align': 'top'
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'fill': '#ffffff',
                        'stroke-width': 0,
                        'stroke': '#ffffff',
                        'fill-opacity': 0,
                        r: '1'
                    }"
            ></geometry-rect>

            <!-- title -->
            <sub-elements>
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH"
                        :subStyle="{
                            'stroke-width': 0,
                            'stroke': '#ffffff',
                            'fill': '#FFA400',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
                <text-element
                        v-if="value.isAggregateRoot"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< AggregateRoot >>'"
                ></text-element>
                <text-element
                        v-if="value.isVO"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< ValueObject >>'"
                ></text-element>
                <text-element
                        v-if="value.isInterface"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH/2"
                        :sub-top="0"
                        :sub-left="0"
                        :text="'<< Interface >>'"
                ></text-element>
                <text-element
                        v-if="value.isVO || value.isAggregateRoot || value.isInterface"
                        :sub-width="'100%'"
                        :sub-height="value.elementView.titleH"
                        :sub-top="10"
                        :sub-left="0"
                        :text="getNamePanel"
                        :subStyle="{
                            'font-size': '14', 'font-weight': 'bold',
                        }"
                ></text-element>
            </sub-elements>

            <!-- attribute -->
            <sub-elements v-if="value.fieldDescriptors">
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.fieldH"
                        :sub-top="value.elementView.titleH"
                        :subStyle="{
                            'stroke-width': 0,
                            'stroke': '#ffffff',
                            'fill': '#050038',
                            'fill-opacity': 1,
                        }"
                ></rectangle-element>
            </sub-elements>

            <!-- operation -->
            <sub-elements v-if="value.operations">
                <rectangle-element
                        :sub-width="'100%'"
                        :sub-height="value.elementView.methodH"
                        :sub-top="value.elementView.subEdgeH"
                        :subStyle="{
                            'stroke': '#7CAFC4',
                            'fill': '#7CAFC4',
                            'fill-opacity': 1,
                            'z-index': -1
                        }"
                ></rectangle-element>
            </sub-elements>

            <uml-sub-controller
                    v-if="!canvas.isReadOnlyModel"
                    :value="value" 
            ></uml-sub-controller>
        </group-element>

        <div v-if="value.fieldDescriptors">
            <div v-for="(attr, index) in value.fieldDescriptors" :key="'a'+index">
                <uml-class-text
                        v-model="value"
                        :type="'attribute'"
                        :isReadOnly="!isEditElement"
                        :styles="{
                            'name': attr.name,
                            'index': index,
                            'x': value.elementView.x,
                            'y': value.elementView.y,
                            'label': attributeLabels[index],
                            'width': value.elementView.width - 20,
                            'height': value.elementView.height,
                            'titleH': value.elementView.titleH,
                            'subEdgeH': value.elementView.subEdgeH,
                        }"
                ></uml-class-text>
            </div>
        </div>

        <div v-if="value.operations">
            <div v-for="(item, index) in value.operations" :key="'method'+index">
                <uml-class-text
                        v-model="value"
                        :type="'operation'"
                        :isReadOnly="!isEditElement"
                        :styles="{
                            'name': item.name,
                            'index': index,
                            'x': value.elementView.x,
                            'y': value.elementView.y,
                            'label': operationLabels[index],
                            'width': value.elementView.width - 20,
                            'height': value.elementView.height,
                            'titleH': value.elementView.titleH,
                            'subEdgeH': value.elementView.subEdgeH,
                        }"
                ></uml-class-text>
            </div>
        </div>

        <uml-class-panel
                v-if="propertyPanel"
                v-model="value"
                :entities="canvas.value"
                :img="imgSrc"
                :isReadOnly="!isEditElement"
                @close="closePanel"
        ></uml-class-panel>
    </div>
</template>

<script>
    import Element from './UMLClassElement'

    var changeCase = require('change-case');
    var pluralize = require('pluralize');

    export default {
        mixins: [Element],
        name: 'uml-class-definition',
        props: {},
        computed: {
            imgSrc() {
                return `${window.location.protocol + "//" + window.location.host}/static/image/symbol/entity.png`
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.uml.model.Class'
            },
            createNew(elementId, x, y, width, height, angle) {
                return {
                    _type: this.className(),
                    id: elementId,
                    name: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    fieldDescriptors: [
                        {
                            "_type": "org.uengine.uml.model.FieldDescriptor",
                            "name": "id",
                            "className": "Long",
                            "isKey": true,
                            "isVO": false,
                            "namePascalCase": "Id",
                            "nameCamelCase": "id",
                            "label": "- id: Long",
                        }
                    ],
                    operations: [],
                    elementView: {
                        '_type': this.className(),
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 200,
                        'height': 150,
                        'style': JSON.stringify({}),
                        'angle': angle,
                        'titleH': 50,
                        'subEdgeH': 120,
                        'fieldH': 90,
                        'methodH': 30
                    },
                    // drawer: false,
                    selected: false,
                    // editing: false,
                    relations: [],
                    parentOperations: [],
                    relationType: null,
                    isVO: false,
                    isAbstract: false,
                    isInterface: false,
                    isAggregateRoot: false,
                }
            },
            name() {
                try {
                    return this.value.name
                } catch (e) {
                    return "";
                }
            },
            attributeY() {
                try {
                    var me = this
                    var arr = []
                    var attrY = me.value.elementView.y - me.value.elementView.height/2 + 45
                    if (me.value.fieldDescriptors.length > 0) {
                        me.value.fieldDescriptors.forEach(function (item, idx) {
                            arr.push(attrY + (idx * 20))
                        })
                    }
                    return arr
                } catch (e) {
                    return "";
                }
            },
            operationY() {
                try {
                    var me = this
                    var arr = []
                    var operationY = me.value.elementView.y + me.value.elementView.height/2
                    if (me.value.operations.length > 0) {
                        me.value.operations.forEach(function (item, idx) {
                            arr.push(operationY - ((me.value.operations.length - idx) * 20))
                        })
                    }
                    return arr
                } catch (e) {
                    return "";
                }
            },
            attributeLabels() {
                try {
                    var me = this
                    var arr = []
                    if (me.value.fieldDescriptors.length > 0) {
                        me.value.fieldDescriptors.forEach(function (item) {
                            var labelName = item.displayName ? item.displayName : item.name;
                            var label = item.label ? item.label : '- ' + labelName + ': ' + item.className;
                            arr.push(label);
                        });
                    }
                    return arr
                } catch (e) {
                    return "";
                }
            },
            operationLabels() {
                try {
                    var me = this
                    var arr = []
                    if (me.value.operations.length > 0) {
                        me.value.operations.forEach(function (item) {
                            var label = item.label ? item.label : '+' + item.name + '()'
                            arr.push(label)
                        })
                    }
                    return arr
                } catch (e) {
                    return "";
                }
            },
        },
        data: function () {
            return {
            };
        },
        created: function () {
        },
        watch: {
            "value": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    me.refreshImg();
                }
            },
            "value.name": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal != oldVal && me.value.relations.length > 0) {
                        me.setRelationValue();
                    }
                }
            },
            "value.elementView.height": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal != oldVal) {
                        me.setHeight();
                    }
                }
            },
            "value.operations": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal.length != oldVal.length) {
                        me.setHeight()
                    }
                    me.setRelationValue()
                }
            },
            "value.relations": {
                deep: true,
                handler(newVal, oldVal) {
                    var me = this;
                    if(newVal) {
                        me.setRelationValue()
                    }
                }
            },
        },
        mounted: function () {
            var me = this
            
            if(!me.value.elementView.titleH || 
                    !me.value.elementView.subEdgeH || 
                    !me.value.elementView.fieldH || 
                    !me.value.elementView.methodH
            ) {
                me.setHeight()
            }

            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                if(obj.action == 'updateRelation' && obj.relation) {
                    me.updateAttribute(obj.relation)
                }

                if(obj.action == 'deleteRelation' && obj.relation) {
                    me.deleteRelAttribute(obj.relation)
                }
            })
            me.setRelationValue()
        },
        methods: {
            setHeight() {
                var me = this
                
                // title
                if(me.value.isVO || me.value.isAggregateRoot || me.value.isInterface) {
                    me.value.elementView.titleH = 50
                } else {
                    me.value.elementView.titleH = 30
                }
                
                // operations
                if(!me.value.operations || me.value.operations.length < 1) {
                    me.value.elementView.methodH = 30
                } else {
                    me.value.elementView.methodH = me.value.operations.length * 20 + 15
                }

                me.value.elementView.fieldH = me.value.elementView.height - me.value.elementView.titleH
                me.value.elementView.subEdgeH = me.value.elementView.height - me.value.elementView.methodH

                me.refreshImg();
            },
            setRelationValue() {
                var me = this

                me.value.relations.forEach(function(id, idx) {
                    var relation = me.canvas.value.relations[id]
                    if(relation) {
                        if(relation.from == me.value.elementView.id) {
                            if(!relation.relationType.includes('Generalization') &&
                                    !relation.relationType.includes('Realization') &&
                                    relation.targetElement.name != ""
                            ) {
                                me.updateAttribute(relation)
                            }
                        }
                        if(relation.to == me.value.elementView.id) {
                            if(relation.relationType.includes('Generalization')) {
                                relation.name = ''
                                me.canvas.value.elements[relation.from].parentOperations = me.value.operations
                            } else {
                                if(relation.name == '') {
                                me.canvas.value.relations[id].name = me.value.name
                                }
                            }
                        }
                    }
                })
            },
            updateAttribute(el) {
                var me = this
                var toName = el.targetElement.namePascalCase
                var name = el.name ? el.name : toName
                var isIncluded = me.value.fieldDescriptors.some((attr) => {
                    var className = attr.className;
                    if (className.includes("List")) {
                        className = className.replace(/List</gi, "").replace(/>/gi, "");
                    }
                    return el.to === attr.classId || (className === toName && attr.name === el.name);
                })
                
                if(!isIncluded) {
                    var attr = {
                        "_type": "org.uengine.uml.model.FieldDescriptor",
                        "name": changeCase.camelCase(name),
                        "className": toName,
                        "isKey": false,
                        "isVO": el.targetElement.isVO,
                        "namePascalCase": changeCase.pascalCase(name),
                        "nameCamelCase": changeCase.camelCase(name),
                        "label": "- "+ changeCase.camelCase(name) + ": " + toName,
                        "classId": el.to,
                        "isList": false,
                    }

                    if((el.relationType.includes('Aggregation') ||
                            el.relationType.includes('Composition')) && 
                            el.sourceMultiplicity == '1' && 
                            (el.targetMultiplicity == '1..n' || el.targetMultiplicity == '0..n')
                    ) {
                        attr.isList = true;
                        attr.name = changeCase.camelCase(pluralize(name));
                        attr.className = "List<" + attr.className + ">";
                        attr.label = "- "+ pluralize(attr.nameCamelCase) + 
                                ": List<" + attr.className + ">";
                    }
                    
                    me.value.fieldDescriptors.push(attr)

                } else {
                    var idx = me.value.fieldDescriptors.findIndex((attr) => (
                            ((attr.className == toName || 
                            changeCase.camelCase(attr.className) == changeCase.camelCase(toName) ||
                            changeCase.pascalCase(attr.className) == changeCase.pascalCase(toName) ||
                            (attr.className.includes("List<") &&
                                attr.className == "List<" + changeCase.pascalCase(toName) + ">"
                            )) && attr.name === el.name) || attr.classId === el.to
                        )
                    )
                    me.$set(me.value.fieldDescriptors[idx], "classId", el.to)

                    if((el.relationType.includes('Aggregation') || 
                            el.relationType.includes('Composition')) && 
                            el.sourceMultiplicity == '1' && 
                            (el.targetMultiplicity == '1..n' || el.targetMultiplicity == '0..n')
                    ) {
                        me.$set(me.value.fieldDescriptors[idx], "isList", true)
                        me.$set(me.value.fieldDescriptors[idx], "name", changeCase.camelCase(pluralize(name)))
                        me.$set(me.value.fieldDescriptors[idx], "nameCamelCase", changeCase.camelCase(pluralize(name)))
                        me.$set(me.value.fieldDescriptors[idx], "namePascalCase", changeCase.pascalCase(pluralize(name)))
                        me.$set(me.value.fieldDescriptors[idx], "className", "List<"+changeCase.pascalCase(toName)+">")
                        me.$set(me.value.fieldDescriptors[idx], "label", "- "+changeCase.camelCase(pluralize(name))+": List<" + changeCase.pascalCase(toName)+">")

                    } else {
                        me.$set(me.value.fieldDescriptors[idx], "isList", false)
                        me.$set(me.value.fieldDescriptors[idx], "name", changeCase.camelCase(name))
                        me.$set(me.value.fieldDescriptors[idx], "nameCamelCase", changeCase.camelCase(name))
                        me.$set(me.value.fieldDescriptors[idx], "namePascalCase", changeCase.pascalCase(name))
                        me.$set(me.value.fieldDescriptors[idx], "label", "- "+changeCase.camelCase(name)+": "+changeCase.pascalCase(toName))
                    }
                }
            },
            deleteRelAttribute(relation) {
                var me = this
                const toName = relation.targetElement.name
                const idx = me.value.fieldDescriptors.findIndex((attr) => (
                        (attr.className == toName || 
                        changeCase.camelCase(attr.className) == changeCase.camelCase(toName) ||
                        changeCase.pascalCase(attr.className) == changeCase.pascalCase(toName) ||
                        (attr.className.includes("List<") &&
                            attr.className == "List<" + changeCase.pascalCase(toName) + ">"
                        )) && attr.name === relation.name
                    )
                )

                if (idx > -1) {
                    me.value.fieldDescriptors.splice(idx, 1)
                }
                
                me.refreshImg();
            }
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
