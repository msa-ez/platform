<template>
    <div v-html="svgContent" :icon="`'${icon}'`" :style="{ width: computedWidth + 'px', height: computedHeight + 'px' }"></div>
</template>

<script>
export default {
    name: 'Icons',
    props: {
        icon: {
            type: String,
            required: true
        },
        color: {
            type: String,
            default: ''
        },
        width: {
            type: [String, Number],
            default: null
        },
        height: {
            type: [String, Number],
            default: null
        },
        size: {
            type: [String, Number],
            default: 24
        }
    },
    data() {
        return {
            svgContent: ''
        };
    },
    computed: {
        // width와 height가 지정되지 않은 경우 size를 사용
        computedWidth() {
            return this.width || this.size;
        },
        computedHeight() {
            return this.height || this.size;
        }
    },
    watch: {
        icon: 'loadSvg',
        color: 'loadSvg',
        width: 'loadSvg',
        height: 'loadSvg',
        size: 'loadSvg'
    },
    mounted() {
        this.loadSvg();
    },
    methods: {
        async loadSvg() {
            const storageKey = `icons-${this.icon}`;
            const cachedSvg = localStorage.getItem(storageKey);
            if (cachedSvg) {
                this.updateSvgContent(cachedSvg);
            } else {
                const response = await fetch(`/assets/icon/${this.icon}.svg`);
                let svg = await response.text();
                localStorage.setItem(storageKey, svg); // 로컬 스토리지에 SVG 저장
                this.updateSvgContent(svg);
            }
        },
        shouldAddFill(svg) {
            return !svg.match(/fill="currentColor"/) && 
                !svg.match(/stroke="currentColor"/) && 
                !svg.match(/stroke="none"/) && 
                !svg.match(/fill="none"/);
        },
        updateSvgContent(svg) {
            if (this.color) {
                // currentColor를 사용하는 stroke 및 fill 속성을 동적으로 변경
                svg = svg.replace(/stroke="currentColor"/g, `stroke="${this.color}"`);
                svg = svg.replace(/fill="currentColor"/g, `fill="${this.color}"`);

                // 조건에 따라 <path>에 fill 속성 추가
                if (this.shouldAddFill(svg)) {
                    svg = svg.replace(/<path/g, `<path fill="${this.color}"`);
                }
            }

            // 루트 SVG 요소에 width와 height 속성 설정
            svg = svg.replace(/<svg/, `<svg width="${this.computedWidth}" height="${this.computedHeight}"`);
            
            this.svgContent = svg;
        },
    }
};
</script>