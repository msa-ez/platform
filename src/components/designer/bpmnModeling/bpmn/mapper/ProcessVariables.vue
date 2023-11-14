<template>
    <div>
        <text-element
                selectable
                :id.sync="value.name"
                :x="50"
                :y.sync="y"
                :width="50"
                :text="value.name"
                :_style="{
                    'font-color': 'grey',
                    'text-anchor': 'start'
                }"
        ></text-element>

        <circle-element 
                :x="100" 
                :y.sync="y" 
                :width="7" 
                :height="7"
                selectable 
                connectable 
                draggable 
                movable
                v-on:selectShape="handleClick($event)"
        ></circle-element>

        <bpmn-mapper-context-menu
                :elementId="value.name"
                :options="menuList"
                :ref="'vueSimpleContextMenu'"
        ></bpmn-mapper-context-menu>
    </div>
</template>

<script>
    // import IBpmn from '../IBpmn'

    export default {
        // mixins: [IBpmn],
        name: 'bpmn-process-variables',
        props: {
            value: Object,
            y: Number,
        },
        computed: {
            defaultStyle(){
                return {}
            },
            createNew(x, y, width, height, elementId, type) {
                return {
                    _type: type,
                    elementView: {
                        '_type': type,
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                }
            },
        },
        data: function () {
            return {
                menuList: [
                    { name: "Edit" },
                    { name: "Delete" },
                ]
            };
        },
        watch: {},
        mounted() {},
        methods: {
            handleClick(event) {
                var me = this
                // event.pageY = event.pageY - 100
                var obj = {
                    pageX: event.x,
                    pageY: event.y
                }
                me.$refs.vueSimpleContextMenu.showMenu(obj);
            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

