<template>
    <div style="width:100%;">
        <v-alert
            color="#EEEEEE"
            variant="tonal"
            class="pa-2 mt-1 mb-4"
        >
            <v-row class="ma-0 pa-0">
                <!-- 접혀진 상태에서 기본으로 보이는 텍스트 -->
                <v-col :cols="details ? 11 : 12" class="pa-0">
                    <v-card-title class="pa-0">
                        <div style="font-size:12px; line-height: 20px; font-weight: 700;">{{ title }}</div>
                        <a v-if="detailUrl" :href="detailUrl" target="_blank" class="detail-link">{{ $t('DetailComponent.allDetails') }}</a>
                    </v-card-title>
                </v-col>
                <v-spacer></v-spacer>
                <!-- 오른쪽의 토글 아이콘 -->
                <v-col v-if="details" cols="1" class="pa-0 pt-1" style="align-self: flex-start; max-width:24px; margin-top:-6px;">
                    <v-tooltip :text="$t('details')">
                        <template v-slot:activator="{ props }">
                            <v-icon v-bind="props"
                                @click="extendedStatus = !extendedStatus" 
                                color="black"
                            >
                                {{ extendedStatus ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                            </v-icon>
                        </template>
                    </v-tooltip>
                </v-col>
            </v-row>

            <!-- 세부 정보 영역 -->
            <div v-if="extendedStatus" class="pt-1">
                <div v-for="(item, index) in details" :key="index">
                    <div class="mb-4">
                        <div v-if="item.title" style="font-size:14px; white-space: pre-wrap; margin: 10px 0px 0px 0px;">{{ $t(item.title) }}</div>
                        <v-img v-if="item.image"
                            :src="getImagePath(item.image)" 
                            style="border: solid 1px gray; border-radius: 8px;" 
                        />
                    </div> 
                </div>
            </div>
        </v-alert>
    </div>
</template>
<script>
export default {
    name: 'detail-component',
    props: {
        title: String,
        detailUrl: String,
        details: Array
    },
    created() {
    },
    components: {
    },
    data() {
        return {
            extendedStatus: false,
        };
    },
    async mounted() {
    },
    computed: {
    },
    watch: {
    },
    methods: {
        getImagePath(imgName) {
            return `/static/image/detailImage/${imgName}`;
        }
    }
};
</script>

<style scoped>
.detail-link {
    font-size: 16px; 
    font-weight: 900;
    color: gray;
}
</style>