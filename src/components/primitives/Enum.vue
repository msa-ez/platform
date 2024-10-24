<template>
    <div>
        <v-select
            v-bind="$attrs"
            v-model="value"
            @change="change"
            :items="items"
            item-text="label"
            item-value="value"
            :label="label"
        >
        </v-select>
        <v-chip 
            class="gs-rule-example-chip"
            v-for="chip in chips"
            :key="chip.label"
            @click="selectChipValue(chip.value)"
        >
            {{ chip.label }}
        </v-chip>
    </div>
</template>
<script>
import TypeBase from './TypeBase.js';

export default {
    name: 'String',
    mixins: [TypeBase],
    props: {
        items: {
            type: Array,
            default: () => []
        }
    }
}
</script>
