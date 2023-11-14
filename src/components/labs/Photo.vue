<template>
    <v-card style="padding:10px;" outlined>
        <div v-if="editMode" class="filebox">
            <label for="ex_file">+</label> 
            <input @change="onFileChange" accept="image/*" type="file" id="ex_file"> 
        </div>
        <div v-if="images">
            <div style="margin-bottom:-5px;" v-for="(image, index) in images" :key="image">
                <img class="img-size" :src="image" />
                <v-btn
                    class="delete-btn"
                    icon
                    small
                    color="red"
                    @click="removeImage(index)"
                >
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </div>
        </div>
    </v-card>
</template>

<script>
    export default {
        data:() => ({
            images: [],
            editMode: true
        }),
        methods: {
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                    if (!files.length) return;
                    this.createImage(files);
                    this.editMode = false
                },
                createImage(files) {
                var vm = this;
                for (var index = 0; index < files.length; index++) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                    const imageUrl = event.target.result;
                    vm.images.push(imageUrl);
                    }
                    reader.readAsDataURL(files[index]);
                }
            },
            removeImage(index) {
                this.images.splice(index, 1)
                this.editMode = true
            },
        }
    }
</script>
    
    
<style scoped>
    .delete-btn {
        position:absolute; 
        display:block; 
        right:5px; 
        top:5px;
    }
    .img-size {
        width:300px;
        height:148px;
    }
    .filebox input[type="file"] { 
        display:none;
    } 
    .filebox label { 
        display: inline-block; 
        padding: .5em .75em; 
        color: #999; 
        font-size: inherit; 
        line-height: normal; 
        vertical-align: middle; 
        background-color: #fdfdfd; 
        cursor: pointer; 
        border: 1px solid #ebebeb; 
        border-bottom-color: #e2e2e2; 
        border-radius: .25em; 
        width:300px;
        height:150px;
        line-height:130px;
        text-align:center;
    }
</style>
