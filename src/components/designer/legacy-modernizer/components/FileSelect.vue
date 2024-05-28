<template>
  <v-card class="mb-3"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleFileDrop"
    :class="{ 'drag-over': isDragging }"
  >
    <label for="formFile" class="custom-file-label">
      {{ fileName }}
    </label>
    <input 
      class="form-control d-none" 
      type="file" 
      id="formFile" 
      @change="handleFileUpload"
    />
    <div v-if="isDragging" class="drop-zone">
      드래그하여 파일을 업로드 합니다.
    </div>
  </v-card>
</template>

<script>
import FileUploadService from "../services/FileUploadService";
import Convert2GraphService from "../services/Convert2GraphService";

export default {
  data() {
    return {
      isDragging: false,
      dragCounter: 0,
      fileName: '클릭하여 파일을 업로드 하거나\n파일을 드래그 & 드롭 해주세요',
    };
  },
  methods: {
    handleDragOver() {
      // Prevent default to allow drop
    },
    handleDragEnter() {
      this.dragCounter++;
      this.isDragging = true;
    },
    handleDragLeave() {
      this.dragCounter--;
      if (this.dragCounter === 0) {
        this.isDragging = false;
      }
    },
    async handleFileDrop(event) {
      this.isDragging = false;
      this.dragCounter = 0;
      const file = event.dataTransfer.files[0];
      if (file) {
        this.fileName = file.name;
        await this.uploadFile(file);
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.fileName = file.name;
        await this.uploadFile(file);
      }
    },
    async uploadFile(file) {
      if (!file) return;
      this.$emit("next-sequence", 0);
      this.$emit('loading', true);

      try {
        const result = await FileUploadService.uploadFile(file);
        this.$emit("next-sequence", 1);

        const response = await Convert2GraphService.sendData(result);
        this.$emit("next-sequence", 2);
        this.$emit("send-success", response);

      } catch (error) {
        this.$emit("error", error);
      } finally {
        this.$emit('loading', false);
      }
    },
  },
};
</script>

<style scoped>

.form-control {
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  background-clip: padding-box;
  border-radius: 0.25rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.custom-file-label {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: white;
  border-radius: 0.25rem;
  text-align: center;
  cursor: pointer;
}

.d-none {
  display: none;
}

.drag-over {
  background-color: #f0f0f0;
  border: 2px dashed #007bff;
}

.drop-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff;
  font-size: 1.2em;
  background-color: rgba(255, 255, 255, 1);
}
</style>
