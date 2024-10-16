<template>
    <div>
        <edge-element
                :selectable="selectable"
                :movable="movable"
                :deletable="deletable"
                connectable
                :id.sync="value.relationView.id"
                :vertices.sync="vertices"
                :from.sync="value.from"
                :to.sync="value.to"
                :_style="style_"
                :label="value.name"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customRelationMoveAction="delayedRelationMove"
                v-on:removeShape="onRemoveShape"
        >
            <sub-elements>
                <text-element
                        :sub-width="'100%'"
                        :sub-height="25"
                        :sub-top="5"
                        :text="''">
                </text-element>
            </sub-elements>
        </edge-element>

        <class-relation-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></class-relation-panel>
    </div>
</template>

<script>
    import ClassRelationPanel from "../panels/ClassRelationPanel";
    import Element from './EventStormingModelElement'
    import ImageElement from "../../../opengraph/shape/ImageElement";
    import SubElements from "../../../opengraph/shape/SubElements";
    import TextElement from "../../../opengraph/shape/TextElement";

    export default {
        components: {TextElement, SubElements, ImageElement,ClassRelationPanel},
        mixins: [Element],
        name: 'class-relation',
        props: {
            value: Object
        },
        data: function () {
            return {
                name: '',
                oldName: '',
                isView: false,
            }
        },
        created: function () {
            // this.image ='https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/relation.png'
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.Relation'
            },
            style_() {
                var style = {}
                if (!this.value.name)
                    this.value.name = ''

                if (this.value.sourceElement._type.endsWith('Event') && this.value.targetElement._type.endsWith('Policy')){
//                    this.value.name = 'Pub/Sub'
                    style = {
                        "arrow-end": "block",
                        'stroke-width': '1.3',
                        'stroke-dasharray': '- ',
                        'font-size': 14,
                    }
                } else if (this.value.sourceElement._type.endsWith('Policy') && this.value.targetElement._type.endsWith('Event')){
                    style = {
                        "arrow-end": "block",
                        'stroke-width': '1.3',
                        'stroke-dasharray': '- ',
                        'stroke-opacity': 0.3,
                        'font-size': 14,
                    }
                } else if (this.value.sourceElement._type.endsWith('Event') && this.value.targetElement._type.endsWith('Command')) {
                   this.value.name = this.value.name ? this.value.name : 'Req/Res'
                    style = {
                        "arrow-end": "block",
                        'font-size': 14,
                        'z-index': '998'
                    }
                } else if ( (this.value.sourceElement._type.endsWith('Policy') || this.value.sourceElement._type.endsWith('Command')) &&  this.value.targetElement._type.endsWith('View')) {
                    this.value.name = this.value.name ? this.value.name : 'Req/Res'
                    style = {
                        "arrow-end": "block",
                        'font-size': 14,
                    }
                    if (!this.value.fallback)
                        this.value.fallback = false;

                    if (!this.value.circuitBreaker)
                        this.value.circuitBreaker = false
                } else if (this.value.sourceElement._type.endsWith('Command') && this.value.targetElement._type.endsWith('Event')) {
                    style = {
                        "arrow-end": "block",
                        'stroke-width': '1.3',
                        'stroke-dasharray': '- ',
                        'stroke-opacity': 0.3,
                        'font-size': 14,
                    }
                } else if (this.value.sourceElement._type.endsWith('View') && this.value.targetElement._type.endsWith('Aggregate') ) {
                    this.value.name = 'UI-Mashup'
                    style = {
                        "arrow-end": "block",
                        'font-size': 14,
                    }
                } else if (this.value.sourceElement._type.endsWith('Aggregate') && this.value.targetElement._type.endsWith('Aggregate') ) {
                    style = {
                        "arrow-end": "block",
                        "stroke-dasharray": "- ",
                        "stroke": "grey",
                        'font-size': 14,
                    }
                } else if((this.value.sourceElement._type.endsWith('Command') || this.value.sourceElement._type.endsWith('Policy')) && this.value.targetElement._type.endsWith('Aggregate')){
                    return
                }

                return style
            },
            createNew(canvas, elementId, from, to, vertices) {
                return {
                    _type: 'org.uengine.modeling.model.Relation',
                    name: '',
                    displayName: '',
                    id: elementId,
                    sourceElement: from,
                    targetElement: to,
                    from: from.elementView.id,
                    to: to.elementView.id,
                    relationView: {
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none",
                        }),
                        value: vertices,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    hexagonalView: {
                        _type: 'org.uengine.modeling.model.RelationHexagonal',
                        id: elementId,
                        style: JSON.stringify({
                            "arrow-start": "none",
                            "arrow-end": "none",
                        }),
                        value: null,
                        from: from.elementView.id,
                        to: to.elementView.id,
                        needReconnect: true,
                    },
                    sourceMultiplicity: 1,
                    targetMultiplicity: 1,
                }
            },
            vertices: {
                get: function () {
                    var style;
                    try {
                        if(this.canvas.isHexagonal) {
                            return JSON.parse(this.value.hexagonalView.value);
                        } else {
                            return JSON.parse(this.value.relationView.value);
                        }
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    if(this.canvas.isHexagonal) {
                        this.value.hexagonalView.value = JSON.stringify(val);
                    } else {
                        this.value.relationView.value = JSON.stringify(val);
                    }
                }
            },
        },
        watch: {
        },
        mounted: function () {
            var me = this

            if (me.value.sourceElement._type.endsWith('Aggregate') && me.value.targetElement._type.endsWith('Aggregate')) {
                var obj = {
                    action: "addRelation",
                    element: me.value
                }

                me.$EventBus.$emit(`${me.value.from}`, obj)
            }

            me.$EventBus.$on('selectedElementObj', function (selectedObj) {
                var id = selectedObj.id

                if(me.canvas.isHexagonal) {
                    if (selectedObj['selected']) {
                        if(me.value.from === id || me.value.to === id) {
                            me.isView = true
                        }
                    } else {
                        me.isView = false
                    }
                } else {
                    me.isView = true
                }
            });

        },
        beforeDestroy: function() {
            var me = this

            if (me.value.sourceElement._type.endsWith('Aggregate') && me.value.targetElement._type.endsWith('Aggregate')) {
                var obj = {
                    action: "deleteRelation",
                    element: me.value
                }
                me.$EventBus.$emit(`${me.value.from}`, obj)
            }

        },
        methods:{
            onMoveAction(){ },
            validate(executeRelateToValidate, panelValue){
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                // this.$super(Element).validate()

                // Element
                var sourceId = me.value.from
                var source = me.value.sourceElement
                var target = me.value.targetElement
                if (source && source.elementView._type.endsWith("View") && target && target.elementView._type.endsWith("Aggregate")) {
                    if (me.canvas.value.relations[me.value.relationView.id]) {
                        //존재
                        if (me.canvas.value && me.canvas.value.elements[sourceId]) {
                            me.canvas.value.elements[sourceId].dataProjection = 'uimashup'
                        }
                    }
                }
            }
        }
    }
</script>

