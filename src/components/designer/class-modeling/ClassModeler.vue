<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <uml-class-model-canvas
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="uml-class-relation"
            ref="designer"
    ></uml-class-model-canvas>
    
</template>

<script>
    import UMLClassDiagram from "../class-modeling/UMLClassModelCanvas";

    export default {
        name: 'class-designer',
        components: {
            'uml-class-model-canvas': UMLClassDiagram,
        },
        props: {},
        data() {
            return {
                // value: {},
                // elementTypes: [
                //     {
                //         'icon': 'bpmn-icon-start-event-none',//'OG.shape.essencia.Alpha',
                //         'component': 'uml-class-definition',
                //         'label': 'Class',
                //         'width': '100',
                //         'height': '100',
                //         'src': `${ window.location.protocol + "//" + window.location.host}/static/image/symbol/class.png`
                //     },
                // ],
            }
        },
        created: function () {
        },
        mounted: function () {
        },
        methods: {
        }
    }
</script>


