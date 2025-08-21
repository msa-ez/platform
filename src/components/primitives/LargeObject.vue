<template>
    <div>
        <div v-if="editMode" style="margin-top:-20px;">
            <v-checkbox
                    v-model="isFile"
                    label="Attachment File"
            ></v-checkbox>
            <v-text-field
                v-bind="$attrs"
                v-if="!isFile"
                :label="label" 
                :type="type"
                v-model="value"
                @change="change"
            ></v-text-field>
            <v-file-input
                v-else
                v-bind="$attrs"
                :label="label"
                v-model="file"
                @change="change"
            ></v-file-input>
        </div>
        <div v-else>
            <v-card v-if="isFile" outlined>
                <v-img :src="value" />
                <v-card-title> {{label}} </v-card-title>
            </v-card>
            <div v-else>
                {{label}} :  {{value}}
            </div>
        </div>
    </div>
</template>

<script>  
    export default {
        name: 'LargeObject',
        components:{
        },
        data: () => ({
            isFile: true,
            type: '',
            file: null,
        }),
        props: {
            value: [String, Number, Object],
            editMode: Boolean,
            label: String
        },
        created() {
            if(typeof this.value === 'string') {
                this.type = 'text';
            } else if(typeof this.value === 'number') {
                this.type = 'number';
            }
        },
        methods:{
            change(){
                var me = this;
                var reader = new FileReader();
                reader.onload = function () {
                    var result = reader.result;
                    this.file = result;
                    me.$emit("input", result);
                };
                reader.readAsDataURL( this.file );
            },
        }
    }
</script>
