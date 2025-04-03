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
            const hashKey = `icons-hash-${this.icon}`;

            const response = await fetch(`/assets/icon/${this.icon}.svg`);
            let svg = await response.text();

            // 해시 값 계산
            const hash = await this.calculateHash(svg);

            const cachedHash = localStorage.getItem(hashKey);

            if (cachedHash !== hash) {
                // 해시 값이 다르면 업데이트
                localStorage.setItem(storageKey, svg);
                localStorage.setItem(hashKey, hash);
                this.updateSvgContent(svg);
            } else {
                // 해시 값이 같으면 캐시된 SVG 사용
                const cachedSvg = localStorage.getItem(storageKey);
                if (cachedSvg) {
                    this.updateSvgContent(cachedSvg);
                }
            }
        },
        async calculateHash(content) {
            const encoder = new TextEncoder();
            const data = encoder.encode(content);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
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