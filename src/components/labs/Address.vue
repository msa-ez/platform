<template>
    <div>
        <v-card class="mx-auto" style="padding:10px;" outlined>
            <span class="headline">Billing Address</span>
            
            <!-- 기본 모드 버튼 SAVE 출력 -->
            <div v-if="editMode">
                <v-card-title class="address-v-card-title">Street</v-card-title>
                <v-text-field
                    class="address-v-text-field"
                    label="Street"
                    outlined
                    v-model="addressStreetInputText"
                ></v-text-field>
                <v-row>
                    <v-col
                        v-for="item in address"
                        :key="item"
                    >
                        <v-card-title class="address-v-card-title">{{ item }}</v-card-title>
                        <v-text-field
                            class="address-v-text-field"
                            :label="item"
                            outlined
                            v-model="addressInputText[item]"
                        >{{ addressInputText[item] }}</v-text-field>
                    </v-col>
                </v-row>
            </div>
            
            <!-- Edit 모드 버튼 EDIT 출력 -->
            <div v-else>
                <v-card-title class="address-v-card-title">Street</v-card-title>
                <v-text-field
                    disabled
                    class="address-v-text-field"
                    label="Street"
                    outlined
                    v-model="addressStreetInputText"
                >{{ addressStreetInputText }}</v-text-field>
                <v-row>
                    <v-col 
                        v-for="item in address"
                        :key="item"
                    >
                        <v-card-title class="address-v-card-title">{{ item }}</v-card-title>
                        <v-text-field
                            disabled
                            class="address-v-text-field"
                            :label="item"
                            outlined
                            v-model="addressInputText[item]"
                        >{{ addressInputText[item] }}</v-text-field>
                    </v-col>
                </v-row>
            </div>
            
            <!-- 수정, 저장 버튼 -->
            <div class="text-right" style ="margin-top:-30px;">
                <v-btn @click="toggleEditMode()" v-if="!editMode" color="primary">
                    EDIT
                </v-btn>
                <v-btn @click="toggleEditMode()" v-if="editMode" color="primary">
                    SAVE
                </v-btn>
            </div>
        </v-card>
    </div>
</template>

<script>
export default {
    name:"address",
    props: {
        editMode: Boolean,
    },
    data:() => ({
        addressStreetInputText:'',
        addressInputText: {
            City:'',
            State:'',
            Zip:'',
        },
        address: [
            'City',
            'State',
            'Zip',
        ],
    }),

    methods: {
        toggleEditMode() {
            this.editMode = !this.editMode
        }
    },
}
</script>

<style scoped>
    .address-v-card-title {
        display: contents;
    }
    .address-v-text-field {
        margin-top:5px;
    }
</style>