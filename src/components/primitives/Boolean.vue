<template>
    <div>
        <v-switch
            v-bind="$attrs"
            v-model="value"
            @change="change"
            @keyup.enter="change"
            :label="label"
        >
        </v-switch>
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
    mixins: [TypeBase]
}
</script>
