<template>
    <div>
        <edge-element
                selectable
                connectable
                deletable
                :id="value.relationView.id"
                :vertices.sync="vertices"
                :from.sync="value.sourceRef"
                :to.sync="value.targetRef"
                :_style="{
                    'edge-type': 'straight'
                }"
                v-on:removeShape="deleteElement(value)"
        ></edge-element>
    </div>
</template>

<script>
    // import IBpmn from '../IBpmn'

    export default {
        // mixins: [IBpmn],
        name: 'bpmn-mapper-relation',
        props: {
            value: Object,
        },
        computed: {
            type() {
                return 'mapper-relation'
            },
            createNew(from, to, vertices, elementId) {
                return {
                    _type: this.type(),
                    sourceRef: from,
                    targetRef: to,
                    relationView: {
                        style: JSON.stringify({}),
                        value: vertices,
                        id: elementId
                    },
                }
            },
            vertices: {
                get: function () {
                    var style;
                    try {
                        console.log(this.value.relationView.value)
                        return JSON.parse(this.value.relationView.value);
                    } catch (e) {
                        return null;
                    }
                },
                set: function (val) {
                    this.value.relationView.value = JSON.stringify(val);
                }
            }
        },
        data: function () {
            return {
            };
        },
        watch: {
        },
        mounted() {},
        methods: {
            deleteElement: function(element) {
                var me = this;
                // if(element._type.includes('transformers')) {
                //     me.transformers.splice(me.transformers.indexOf(element), 1);
                // } else {
                //     me.mapperRelations.splice(me.mapperRelations.indexOf(element), 1);
                // }
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

