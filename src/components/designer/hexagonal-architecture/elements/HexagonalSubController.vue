<template>
    <div>
        <sub-controller
                :image="'../event/event.png'"
                v-on:click="addEventElement"
        ></sub-controller>

        <sub-controller
                :image="'../event/command.png'"
                v-on:click="addCommandElement"
        ></sub-controller>

        <sub-controller
                :image="'../event/policy.png'"
                v-on:click="addPolicyElement"
        ></sub-controller>
    </div>
</template>

<script>
    
    export default {
        name: 'hexagonal-sub-controller',
        props: {
            value: Object,
        },
        created() {
            var me = this
            me.modelCanvasComponent = me.getComponent('event-storming-model-canvas')
            me.canvas = me.getComponent('event-storming-model-canvas')
        },
        data: function () {
            return {
                modelCanvasComponent: null,
                canvas: null
            }
        },
        mounted: function () {
        },
        methods: {
            addEventElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {
                    
                    var x = 0;
                    var y = 0;
                    var aggId;
                    Object.values(me.canvas.value.elements).forEach(function(element) {
                        if(element) {
                            if(!element._type.endsWith('BoundedContext') && element.boundedContext.id && element.boundedContext.id == sourceElement.id) {
                                if(element._type.endsWith('Aggregate')) {
                                    x = element.elementView.x + element.elementView.width / 2 + 20;
                                    aggId = element.elementView.id;
                                }
                                if(element._type.endsWith('Event')) {
                                    console.log(y, element.elementView.y)
                                    if(y <= element.elementView.y) {
                                        y = element.elementView.y + (element.elementView.height / 2) + 60
                                    }
                                }
                            }
                        }
                    })
                    me.createElement(sourceElement, 'domain-event-definition', x, y, aggId);
                }
            },
            addCommandElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {

                    var x = 0;
                    var y = 0;
                    var aggId;
                    Object.values(me.canvas.value.elements).forEach(function(element) {
                        if(element) {
                            if(!element._type.endsWith('BoundedContext') && element.boundedContext.id && element.boundedContext.id == sourceElement.id) {
                                if(element._type.endsWith('Aggregate')) {
                                    x = element.elementView.x - element.elementView.width / 2 - 20;
                                    aggId = element.elementView.id;
                                }
                                if(element._type.endsWith('Command') || element._type.endsWith('Policy')) {
                                    if(y <= element.elementView.y) {
                                        y = element.elementView.y + (element.elementView.height / 2) + 60
                                    }
                                }
                            }
                        }
                    })
                    me.createElement(sourceElement, 'command-definition', x, y, aggId);
                }
            },
            addPolicyElement: function (edgeElement, sourceElement) {
                var me = this;
                if (me.value) {

                    var x = 0;
                    var y = 0;
                    var aggId;
                    Object.values(me.canvas.value.elements).forEach(function(element) {
                        if(element) {
                            if(!element._type.endsWith('BoundedContext') && element.boundedContext.id && element.boundedContext.id == sourceElement.id) {
                                if(element._type.endsWith('Aggregate')) {
                                    x = element.elementView.x - element.elementView.width / 2 - 20;
                                    aggId = element.elementView.id;
                                }
                                if(element._type.endsWith('Command') || element._type.endsWith('Policy')) {
                                    if(y <= element.elementView.y) {
                                        y = element.elementView.y + (element.elementView.height / 2) + 60
                                    }
                                }
                            }
                        }
                    })

                    me.createElement(sourceElement, 'policy-definition', x, y, aggId);
                }
            },
            createElement: function (sourceElement, componentName, x, y, aggregateId) {
                var me = this;
                var targetElement;
                
                var targetInfo = {
                    x: x,
                    y: y,
                    width: 100,
                    height: 100,
                    component: componentName
                }
                if (me.canvas) {
                    targetElement = me.canvas.addElement(targetInfo);
 
                    targetElement.boundedContext = {
                        'id': sourceElement.id,
                        'name': sourceElement.$parent.value.name
                    }

                    var targetTop = targetElement.elementView.y - targetElement.elementView.height / 2;
                    var targetBottom = targetElement.elementView.y + targetElement.elementView.height / 2;
                    var bcBottom = sourceElement.y + sourceElement.height / 2;
                    var aggBottom = me.canvas.value.elements[aggregateId].elementView.y + me.canvas.value.elements[aggregateId].elementView.height / 2;

                    if(targetTop > aggBottom) {
                        me.canvas.value.elements[aggregateId].elementView.height += 100;
                        me.canvas.value.elements[aggregateId].elementView.y += 50;
                    }
                    if(targetBottom > bcBottom) {
                        me.canvas.value.elements[sourceElement.id].elementView.height += 100;
                        me.canvas.value.elements[sourceElement.id].elementView.y += 50;
                    }

                    me.canvas.generateHexagonal(me.canvas.value);
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
            setHeight(boundedContext, aggregate) {
                var me = this;
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>

