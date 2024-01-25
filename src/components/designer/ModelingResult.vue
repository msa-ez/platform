<template></template>
<script>
    export default {
        async created() {
            var me = this;
            alert(window.location.href.split("?")[1])
        },
        methods: {
        }
    };
</script>
