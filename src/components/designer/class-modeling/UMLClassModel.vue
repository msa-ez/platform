<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <UMLClassModelCanvas
            elementListBeanPath="classDefinitions"
            relationListBeanPath="relations"
            relationVueComponentName="uml-class-relation"
            ref="designer"
            :key="componentKey"
            @forceUpdateKey="forceRerender()"
    ></UMLClassModelCanvas>
</template>

<script>
    import UMLClassModelCanvas from "../class-modeling/UMLClassModelCanvas";

    export default {
        name: 'uml-class-model',
        components: {
            UMLClassModelCanvas
        },
        data() {
            return {
                componentKey: 0,
            }
        },
        methods: {
            forceRerender() {
                this.componentKey += 1;
            },
        }
    }
</script>


