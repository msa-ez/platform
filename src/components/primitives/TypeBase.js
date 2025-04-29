export default {
    props: {
        value: String,
        label: String,
    },
    data() {
        return {
            chips: [
                { label: 'N/A', value: 'N/A' },
                { label: 'null', value: null }
            ]
        }
    },
    methods: {
        change() {
            if(this.value==='') this.value = null
            this.$emit("input", this.value);
            this.$emit('save');
        },
        selectChipValue(value) {
            this.$emit("input", value);
            this.$emit("selectChip");
            event.stopPropagation();
        }
    }
};
