<template>
    <div>
        <image-element
            v-for="(index) in images.length" :key="index"
            v-bind:image="images[index-1].picture"
            :sub-width="'24px'"
            :sub-height="'24px'"
            :sub-right="(10*(index-1))+'px'"
            :sub-bottom="elementHeight"
        ></image-element>
    </div>
</template>

<script>
export default {
    name: 'multi-user-status-indicator',
    props: {
        images: Array,
        elementHeight: Number
    }
}
</script>