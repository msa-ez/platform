<template>
    <div>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <span v-on="on" class="headline">{{label}}</span>
            </template>
            <span v-if="type == 'org.uengine.modeling.model.Aggregate'">Allowing both primitive types and non-primitive types including user defined Entities or Value Objects.</span>
            <span v-else>Only primitive types are allowed.</span>
        </v-tooltip>
        <v-layout flat @contextmenu.prevent="handleClick($event, element)">
            <v-col>
                <draggable
                        v-model="dataValue"
                        v-bind="dragOptions"
                        @start="drag = true"
                        @end="drag = false"
                >
                    <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                        
                        <div v-for="(element,idx) in value" :key="idx">
                            
                            <v-row  :class="{'mb-6': !attributeEdit || value.indexOf(element) != attributeEditIndex}" 
                                    no-gutters
                            >
                                <v-col cols="1" style="height: 30px;">
                                    <v-checkbox
                                        class="mt-0 mb-0 pt-0"
                                        @change="addCopyList($event, element)"
                                        :disabled="isReadOnly"
                                    ></v-checkbox>
                                </v-col>
                                <v-col cols="1" style="margin-right: 4px;">
                                    <v-icon small
                                            v-if="element.isKey"
                                            disabled
                                    >
                                        mdi-key
                                    </v-icon>
                                    <v-icon small 
                                            v-if="element.isCorrelationKey" 
                                            disabled
                                            style="position:absolute;
                                                left:9px;
                                                margin-top:5px;"
                                    >
                                        mdi-link-variant
                                    </v-icon>
                                    
                                </v-col>
                                <v-col cols="3">
                                    <div v-if="!attributeEdit || value.indexOf(element) != attributeEditIndex" :style="isDuplicated(element) ? 'color:red':''">
                                        {{element.className}}
                                    </div>
                                    <v-select
                                            class="mr-2 mt-0 pt-0 cp-select-box"
                                            v-else-if="attributeEdit && value.indexOf(element) == attributeEditIndex "
                                            v-model="element.className" 
                                            :items="entityTypeList"
                                    ></v-select>
                                </v-col>
                                <v-col cols="4">
                                    <div v-if="!attributeEdit || value.indexOf(element) != attributeEditIndex " :style="isDuplicated(element) ? 'color:red':''">
                                        {{element.name}}
                                    </div>
                                    <v-text-field
                                        class="mr-2 mt-0 pt-0"
                                        v-else-if="attributeEdit && value.indexOf(element) == attributeEditIndex "
                                        v-model="element.name" 
                                        required
                                        @keyup.enter="modifyAttributeItem(element)"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-icon
                                        v-if="attributeEdit && value.indexOf(element) == attributeEditIndex "
                                        small
                                        class="mr-2 cp-save-button"
                                        @click="modifyAttributeItem(element)"
                                        :disabled="isReadOnly"
                                    >
                                        mdi-content-save
                                    </v-icon>
                                    <v-icon
                                            v-else-if="!attributeEdit || value.indexOf(element) != attributeEditIndex"
                                            small
                                            class="mr-2"
                                            @click="editAttributeItem(element)"
                                            :disabled="isReadOnly"
                                    >
                                        edit
                                    </v-icon>
                                    <v-icon
                                            small
                                            @click="deleteAttribute(element, idx)"
                                            :disabled="isReadOnly"
                                    >
                                        delete
                                    </v-icon>
                                </v-col>
                            </v-row>
                            <v-col v-if="attributeEdit && value.indexOf(element) == attributeEditIndex" style="margin-top: -30px; margin-left: 30px;">
                                <v-row style="margin-top:10px;">
                                    <v-checkbox
                                            v-model="element.isKey"
                                            @click="selectKey(element)"
                                            label="Key"
                                            style="font-size: small; margin-right: 15px;"
                                    ></v-checkbox>
                                    <v-checkbox
                                            v-model="element.isCorrelationKey"
                                            label="Correlation Key"
                                            style="font-size: small; margin-right: 15px;"
                                    ></v-checkbox>
                                    <div style="width:100px;">
                                        <v-text-field
                                                v-model="element.displayName"
                                                label="Display Name"
                                                :disabled="isReadOnly"
                                                @keyup.enter="modifyAttributeItem(element)"
                                        >
                                        </v-text-field>
                                    </div>
                                </v-row>
                                <v-row style="margin-top: -30px;">
                                    <v-checkbox
                                            v-model="element.isList"
                                            label="List"
                                            style="font-size: small; margin-right: 15px;"
                                    ></v-checkbox>
                                    <v-checkbox
                                            v-model="element.isName"
                                            label="Name"
                                            style="font-size: small; margin-right: 15px;"
                                    ></v-checkbox>
                                    <v-checkbox
                                            v-model="element.isLob"
                                            label="Large Object"
                                            style="font-size: small;"
                                    ></v-checkbox>
                                </v-row>
                            </v-col>
                        </div>
                    </transition-group>
                </draggable>

                <v-row justify="center" class="attribute-editor">
                    <v-select 
                            style="width: 30px" 
                            v-model="entityType" 
                            :items="entityTypeList"
                            :disabled="isReadOnly"
                            label="Type"
                            class="attribute-type"
                    ></v-select>
                    <v-text-field
                            v-model="entityName" 
                            label="Name"
                            :disabled="isReadOnly"
                            v-on:keyup.enter="addAttribute(entityType, entityName)"
                            required
                            class="attribute-name"
                    ></v-text-field>
                </v-row>
                <v-row justify="end">
                    <v-btn v-if="type == 'org.uengine.modeling.model.Event' || type == 'org.uengine.modeling.model.Command'"
                            depressed text
                            :disabled="isReadOnly"
                            @click="syncAttribute"
                            style="margin-right:10px; color:#1E88E5;"
                    >
                        <v-icon color="black" small>mdi-refresh</v-icon>
                        Sync attributes
                    </v-btn>
                    <v-btn 
                            depressed text
                            style="margin-bottom:10px; color:#1E88E5;" 
                            :disabled="isReadOnly"
                            @click="addAttribute(entityType, entityName)" 
                            dark
                    >ADD ATTRIBUTE</v-btn>
                </v-row>
                <v-row justify="end" v-if="type == 'org.uengine.modeling.model.Aggregate'">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn :disabled="isReadOnly" 
                                    depressed text 
                                    style="color:#1E88E5;"
                                    @click="openUmlClass"
                                    v-on="on"
                            >
                                Edit Aggregate Members by Class Diagram
                            </v-btn>
                        </template>
                        <span>This menu interacts with the Domain Class Modeling Tool to define their ubiquitous language with object-oriented manner.</span>
                    </v-tooltip>
                    
                </v-row>
            </v-col>
        </v-layout>

        <v-dialog v-model="enumDialog" max-width="500">
            <v-card>
                <v-card-title>New Enumeration</v-card-title>
                <v-card-text>
                    <v-text-field
                            v-model="enumValue.name"
                            label="name"
                    ></v-text-field>
                    <div v-if="enumValue.items.length > 0" class="mb-3">
                        <v-row v-for="(item, idx) in enumValue.items" :key="idx">
                            <v-col cols="11">{{item.value}}</v-col>
                            <v-col cols="1">
                                <v-btn x-small icon @click="enumValue.items.splice(idx, 1)">
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </div>
                    <v-text-field
                            v-model="itemValue.value"
                            label="Value"
                            v-on:keyup.enter="addEnumValue"
                    ></v-text-field>
                    <v-row justify="end">
                        <v-btn color="primary" text @click="addEnumValue">Add Item</v-btn>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="enumDialog = false">Close</v-btn>
                    <v-btn color="green darken-1" text @click="addEnumeration">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <vue-context-menu
                :elementId="elementId"
                :options="menuList"
                :ref="'vueSimpleContextMenu'"
                @option-clicked="optionClicked">
        </vue-context-menu>
    </div>
</template>

<script>
    import draggable from 'vuedraggable'
    import umlCanvas from '../class-modeling/UMLClassModelCanvas.vue'
    var changeCase = require('change-case');

    export default {
        name: 'event-storming-attribute',
        props: {
            value: Array,
            isReadOnly: Boolean,
            type: String,
            elementId: String,
            entities: Object,
            label: {
                type: String,
                default: "Attributes"
            },
            duplicatedFieldList:{
                type: Array,
                default: function () {
                    return []
                }
            },
        },
        components: {
            draggable,
            umlCanvas,
        },
        data: function () {
            return {
                drag: false,

                entityTypeList: ['Integer', 'String', 'Boolean', 'Float', 'Double', 'Long', 'Date', 'BigDecimal'],
                entityKey: false,
                entityType: 'String',
                entityName: '',
                voList: ['Address', 'Photo', 'User', 'Email', 'Payment', 'Money', 'Weather', 'Rating', 'File', 'Likes', 'Tags', 'Comment'],

                attributeEdit: false,
                attributeEditIndex: null,

                // copy & paste
                copyList: [],
                menuList: [
                    {
                        name: 'Copy',
                    },
                    {
                        name: 'Paste'
                    }
                ],

                // enumeration
                enumDialog: false,
                enumValue: {
                    name: '',
                    items: []
                },
                itemValue: {
                    value: ''
                },
            }
        },
        computed: {
            dataValue: {
                get() {
                    return this.value
                },
                set(newVal) {
                    this.$emit('input', newVal)
                }
            },
            dragOptions() {
                return {
                    animation: 200,
                    group: "description",
                    disabled: this.isReadOnly,
                    ghostClass: "ghost"
                };
            },
        },
        mounted: function() {
            var me = this
            
            me.setEntityTypeList()

            me.$EventBus.$on('addAttribute', function () {
                me.addAttribute(me.entityType, me.entityName)
            })
        },
        watch: {
            entityType(val) {
                if(val == 'New Enumeration') {
                    this.enumValue = {
                        name: '',
                        items: []
                    }
                    this.enumDialog = true
                }
            },
        },
        methods: {
            addEnumeration() {
                var me = this
                me.entityTypeList.push({text: me.enumValue.name, value: me.enumValue.name})
                me.entityType = me.enumValue.name
                me.addEntity(me.enumValue)
                me.enumDialog = false
            },
            addEnumValue() {
                var me = this
                me.enumValue.items.push(me.itemValue)
                me.itemValue = { value: '' }
            },
            selectKey(item) {
                var me = this

                me.value.forEach(function (ele, idx) {
                    ele.isKey = false
                    // console.log(idx, me.value.fieldDescriptors.indexOf(item))
                    if (idx == me.value.indexOf(item)) {
                        ele.isKey = true
                    }
                })
            },
            editAttributeItem(item) {
                var me = this
                me.attributeEditIndex = me.value.indexOf(item)
                me.attributeEdit = true
            },
            modifyAttributeItem(item) {
                var me = this

                if(me.duplicatedFieldList){
                    if(me.duplicatedFieldList.length>0) return false;
                }

                var tmpObject = {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "name": item.name,
                    "namePascalCase": changeCase.pascalCase(item.name),
                    "nameCamelCase": changeCase.camelCase(item.name),
                    "className": item.className,
                    "isKey": item.isKey,
                    "isName": item.isName,
                    "isList": item.isList,
                    "isVO": item.isVO,
                    "isLob": item.isLob,
                    'isCorrelationKey': item.isCorrelationKey,
                    "displayName": item.displayName
                }

                if(me.voList.includes(tmpObject['className'])) {
                    tmpObject['isVO'] = true;
                }

                if (tmpObject.isList) {
                    if(item.className.includes("String") || item.className.includes("Integer") || item.className.includes("Long") || item.className.includes("Double") || 
                            item.className.includes("Float") || item.className.includes("Boolean") || item.className.includes("Date")) {
                        tmpObject.className = 'List<' + item.className + '>'
                    } else {
                        tmpObject.className = 'List<' + item.namePascalCase + '>'
                    }
                } else if (!tmpObject.isList && !item.className.includes('List')) {
                    tmpObject.className = item.className
                } else {
                    tmpObject.className = item.namePascalCase
                }
                
                me.value[me.attributeEditIndex] = tmpObject
                me.attributeEdit = false
                me.attributeEditIndex = null
            },
            deleteAttribute(val, valIdx) {
                var me = this

                if (val.isKey && me.type.includes('Aggregate')) {
                    alert("Is Primary Key")
                } else {
                    me.value.forEach(function (element, idx) {
                        if (element.name == val.name && idx == valIdx) {
                            if (idx > -1)
                                me.value.splice(idx, 1)
                        }
                    })
                    if(me.type.includes('Aggregate')) {
                        var entityId;
                        Object.values(me.entities.elements).forEach(function(entity) {
                            if(entity) {
                                if(entity._type != 'ClassGroup' && val.className.includes(entity.name)) {
                                    entityId = entity.elementView.id
                                    if(!me.entities.elements[entityId].isAggregateRoot) {
                                        me.entities.elements[entityId] = null
                                    }
                                }
                            }
                        })

                        Object.values(me.entities.relations).forEach(function(item) {
                            if(item) {
                                if(item.to == entityId || item.from == entityId) {
                                    me.entities.relations[item.relationView.id] = null
                                }
                            }
                        })
                    }
                    
                    // vo field delete -> delete relation
                    if(me.type.includes('uml') && val._type.includes('uml.model.FieldDescriptor')){
                        var targetVo = Object.values(me.entities.elements).find(entity => entity !==null && entity.name.toLowerCase() === val.name.toLowerCase());
                        Object.values(me.entities.relations).forEach(function(item) {
                            if(item) {
                                if(item.to == targetVo.elementView.id && item.from == me.elementId) {
                                    me.entities.relations[item.relationView.id] = null
                                }
                            }
                        })
                    }
                }

            },
            addAttribute: function (type, name) {
                var me = this
                if (type.length < 1) {
                    type = 'String'
                }
                if (type.length != 0 && name.length != 0) {
                    let tmpObject = null

                    tmpObject = {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "name": name,
                        "namePascalCase": changeCase.pascalCase(name),
                        "nameCamelCase": changeCase.camelCase(name),
                        "className": type,
                        "isKey": false,
                        "isName": false,
                        "isList": false,
                        "isVO": false,
                        "isLob": false,
                        'isCorrelationKey': false,
                    }

                    if(me.voList.includes(tmpObject['className'])) {
                        tmpObject['isVO'] = true;
                    }

                    if (me.enumValue.items && me.enumValue.items.length > 0) {
                        tmpObject.items = me.enumValue.items
                    }

                    var hasKey = false
                    if(me.value.length == 0){
                        hasKey = true
                    } else {
                        me.value.forEach(function(attr) {
                            if(attr.isKey){
                                hasKey = true
                            }
                        })
                        if(!hasKey){
                            me.value[0].isKey = true
                            hasKey = true
                        }
                    }

                    var check = false
                    // if (((tmpObject.name).toLowerCase() == 'id' && (tmpObject.className).toLowerCase() == 'long') && !hasKey && (!me.type.includes('uml') && !me.type.includes('Command'))) {
                    if (!hasKey && (!me.type.includes('uml') && !me.type.includes('Command'))) {
                        check = true
                    } else {
                        me.value.forEach(function (agg) {
                            // console.log(agg.name)
                            if (JSON.stringify(Object.entries(agg).sort()).toLowerCase() === JSON.stringify(Object.entries(tmpObject).sort()).toLowerCase()) {
                                check = true
                            }
                        })

                        if (!check) {
                            var flag = false
                            Array.from(me.entityTypeList).forEach(
                                function(entity){ 
                                    // console.log(JSON.stringify(entity["text"]))
                                    // console.log(""+type)

                                    if(JSON.stringify(entity["text"]) == type){
                                        flag = true
                                    }
                                }
                            )

                            me.value.push(tmpObject)
                            if(tmpObject['isVO']) {
                                me.addEntity(tmpObject)
                            }
                        }
                    }

                    // this.entityType = ""
                    this.entityName = ""

                }
            },
            handleClick(event, value) {
                var me = this
                var obj = {
                    pageX: event.layerX,
                    pageY: event.layerY
                }
                me.$refs.vueSimpleContextMenu.showMenu(obj, value)
            },
            optionClicked(event) {
                var me = this
                // copy
                if(event.option.name == 'Copy') {
                    localStorage.removeItem('CopyAttribute')

                    if(me.copyList.length <= 0) {
                        localStorage['CopyAttribute'] = JSON.stringify(event.item)
                    } else {
                        localStorage['CopyAttribute'] = JSON.stringify(me.copyList)
                    }
                }
                // paste
                if(event.option.name == 'Paste') {
                    var copyValue = JSON.parse(localStorage.getItem('CopyAttribute'))
                    if(copyValue != null) {
                        if(copyValue.length > 0) {
                            copyValue.forEach(function (item) {
                                if(item.isKey) {
                                    item.isKey = false
                                }
                                var copy = true
                                me.value.forEach(function (attr) {
                                    if(attr.name == item.name && attr.className == item.className) {
                                        copy = false
                                    }
                                })
                                if(copy) {
                                    me.value.push(item)
                                }
                            })
                        } else {
                            var copy = true
                            me.value.forEach(function (attr) {
                                if(attr.name == copyValue.name && attr.className == copyValue.className) {
                                    copy = false
                                }
                            })
                            if(copy) {
                                me.value.push(copyValue)
                            }
                        }
                    }
                }
            },
            addCopyList(event, value) {
                var me = this
                if(event) {
                    me.copyList.push(value)
                } else {
                    me.copyList.splice(me.copyList.indexOf(value), 1)
                }
                localStorage['CopyAttribute'] = JSON.stringify(me.copyList)
            },
            syncAttribute() {
                var me = this
                me.$emit("sync-attribute")
            },
            openUmlClass() {
                var me = this
                me.$emit("open-umlclass")
            },
            setEntityTypeList() {
                var me = this
                if (me.entities == undefined || me.entities.elements == undefined) {
                    return false
                }

                var primitiveTypes = [
                    {text: 'Primitive Types', disabled: true},
                    {text: 'Integer', value: 'Integer'},
                    {text: 'String', value: 'String'},
                    {text: 'Boolean', value: 'Boolean'},
                    {text: 'Float', value: 'Float'},
                    {text: 'Double', value: 'Double'},
                    {text: 'Long', value: 'Long'},
                    {text: 'Date', value: 'Date'},
                    {text: 'BigDecimal', value: 'BigDecimal'},
                ]

                var complexTypes = [
                    {text: 'Complex Types', disabled: true},
                    {text: 'Address', value: 'Address'},
                    {text: 'Photo', value: 'Photo'},
                    {text: 'File', value: 'File'},
                    {text: 'User', value: 'User'},
                    {text: 'Money', value: 'Money'},
                    {text: 'Email', value: 'Email'},
                    {text: 'Payment', value: 'Payment'},
                    {text: 'Weather', value: 'Weather'},
                    {text: 'Likes', value: 'Likes'},
                    {text: 'Tags', value: 'Tags'},
                    {text: 'Comment', value: 'Comment'},
                ]

                var enumTypes = [
                    {text: 'Enumeration Type', disabled: true},
                ]

                var fields = me.value
                if (Object.values(fields).length > 1) {
                    Object.values(fields).forEach(function (item) {
                        if(!me.entityTypeList.includes(item.className) && 
                                !me.voList.includes(item.className)
                        ) {
                            complexTypes.push({
                                text: item.namePascalCase, 
                                value: item.namePascalCase
                            })
                        }
                    })
                }

                if (Object.values(me.entities.elements).length > 1) {
                    Object.values(me.entities.elements).forEach(function (item) {
                        if (item) {
                            if (item._type.includes('Class')) {
                                var isExistClass = false
                                complexTypes.forEach(function(type) {
                                    if(type.text == item.namePascalCase) {
                                        isExistClass = true
                                    }
                                })
                                if(!isExistClass && item.namePascalCase != undefined) {
                                    complexTypes.push({
                                        text: item.namePascalCase, 
                                        value: item.namePascalCase
                                    })
                                }
                            }
                            
                            if (item._type.includes('enum')) {
                                var isExistEnum = false
                                enumTypes.forEach(function(type) {
                                    if(type.text == item.namePascalCase) {
                                        isExistEnum = true
                                    }
                                })
                                if(!isExistEnum && item.namePascalCase != undefined) {
                                    enumTypes.push({text: item.namePascalCase, value: item.namePascalCase})
                                }
                            }
                        }
                    })
                }

                enumTypes.push({text: 'New Enumeration'})

                me.entityTypeList = [...primitiveTypes, ...complexTypes]
                me.entityTypeList = [...me.entityTypeList, ...enumTypes]
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

            // add aggregateRoot.entities
            addEntity(obj) {
                if(!this.type.includes('Class')) {
                    return;
                }
                var me = this;
                var entity, componentInfo;
                
                componentInfo = {
                    'component': 'uml-vo-class',
                    'label': 'Value',
                    'width': 100,
                    'height': 100,
                    'x': 500 + Math.floor(Math.random()*200),
                    'y': 280 + Math.floor(Math.random()*150),
                }
                if(obj.items) {
                    componentInfo['component'] = 'enum-class-definition'
                    componentInfo['isVO'] = false

                    entity = umlCanvas.methods.addElement(componentInfo, true);
                    entity.items = obj.items
                    entity.name = obj.name
                    entity.nameCamelCase = changeCase.camelCase(obj.name)
                    entity.namePascalCase = changeCase.pascalCase(obj.name)
                } else {
                    componentInfo['isVO'] = true
                    
                    var voList = ['Address', 'Photo', 'User', 'Email', 'Payment', 'Money', 'Weather', 'Rating', 'File', 'Likes', 'Tags', 'Comment']
                    if(voList.includes(obj['className'])) {
                        componentInfo['component'] += '-' + changeCase.camelCase(obj['className']);
                    }

                    entity = umlCanvas.methods.addElement(componentInfo, true);
                }
                var isCreated = false
                Object.values(me.entities.elements).forEach(function(entity, idx) {
                    if(entity) {
                        if(obj.className.includes(entity.name)) {
                            isCreated = true
                        }
                    }
                })
                if(!isCreated) {
                    me.entities.elements[entity.elementView.id] = entity
                }
            },
            isDuplicated(element){
                var me = this

                var duplicated = false

                if(me.duplicatedFieldList && element){
                    Object.values(me.duplicatedFieldList).forEach(function(ele) {
                    if(ele.name==element.name){
                        duplicated = true
                    }
                })
                }

                return duplicated;
            }
        },
    }
</script>

<style>

</style>