<template>
    <div>
        <v-text-field
                v-model="value.name"
                :label="$t('labelText.name')"
        ></v-text-field>

        <v-text-field
                v-model="value.displayName.text"
                label="Display Name"
        ></v-text-field>
        
        <v-text-field
                v-model="value.defaultValueInString"
                label="Default Value In String"
        ></v-text-field>
        
        <label>Global</label>
        <v-switch
                v-model="value.global"
                label="Yes"
        ></v-switch>
        
        <v-select
                v-model="value.persistOption"
                :items="options"
                label="Persist Option"
        ></v-select>
        
        <label>변수 유형</label>
        <v-select
                v-model="category"
                :items="categories"
                item-text="displayName"
                item-value="value"
                label="Category"
        ></v-select>
        <v-select
                v-if="category == 'primitive'"
                v-model="classValue"
                :items="primitiveTypes"
                item-text="displayName"
                item-value="className"
                label="Class"
        ></v-select>
        <v-select
                v-else-if="category == 'class'"
                v-model="classValue"
                :items="classList"
                item-text="name"
                item-value="name"
                label="Class"
        ></v-select>
        <v-select
                v-else
                v-model="classValue"
                label="Class"
        ></v-select>
    </div>
</template>

<script>
    export default {
        name: 'bpmn-object-form',
        props: {
            formData: Object,
            categories: Array,
            classList: Array,
        },
        data: function () {
            return {
                value: this.formData,
                options: [
                    "BPMS",
                    "REST",
                    "DBMS"
                ],
                classValue: '',
                category: '',
                primitiveTypes: [
                    {
                        displayName: '객체(미정)',
                        className: 'java.lang.Object'
                    },
                    {
                        displayName: '문자열',
                        className: 'java.lang.String'
                    },
                    {
                        displayName: '정수형',
                        className: 'java.lang.Integer'
                    },
                    {
                        displayName: '긴 정수형(Long)',
                        className: 'java.lang.Long'
                    },
                    {
                        displayName: '실수형',
                        className: 'java.lang.Double'
                    },
                    {
                        displayName: '예 아니오',
                        className: 'java.lang.Boolean'
                    },
                    {
                        displayName: '날짜',
                        className: 'java.util.Date'
                    },
                    {
                        displayName: '사용자',
                        className: 'org.uengine.kernel.RoleMapping'
                    },
                ],
            }
        },
        mounted: function() {
            var me = this;
            if(me.value.typeClassName) {
                me.category = me.value.typeClassName;
            } else {
                me.category = '';
            }
        },
        watch: {
            value: {
                deep: true,
                handler: function() {
                    this.$emit("input", this.value)
                }
            },
            classValue: {
                deep: true,
                handler: function(val) {
                    if(this.category == 'class') {
                        this.value.typeClassName = this.category
                        this.value.name = val
                    } else {
                        this.value.typeClassName = val;
                    }
                }
            }
        },
        methods: {
        }
    }
</script>