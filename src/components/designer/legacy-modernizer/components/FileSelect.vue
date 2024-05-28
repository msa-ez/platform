<template>
  <div class="mb-3">
    <input 
      class="form-control" 
      type="file" 
      id="formFile" 
      @change="handleFileUpload"/>
  </div>
</template>

<script>
import FileUploadService from "../services/FileUploadService";
import Convert2GraphService from "../services/Convert2GraphService";

/**
 * 역할:
 * - 사용자가 파일을 선택하면 해당 파일을 서버로 업로드합니다.
 * - 업로드의 성공, 실패 여부에 따라 이벤트를 발생시킵니다.
 * 
 * 구성 요소:
 * - input: 파일을 선택할 수 있는 입력 필드입니다.
 * - handleFileUpload: 파일 선택 시 실행되는 메소드입니다.
 * 
 * 로직 원리:
 * 1. 사용자가 파일을 선택하면 handleFileUpload 메소드가 호출됩니다.
 * 2. 선택된 파일을 FileUploadService를 통해 서버로 업로드합니다.
 * 3. 업로드 성공 시 'upload-success' 이벤트를, 실패 시 'error' 이벤트를 발생시킵니다.
 * 4. 업로드 과정의 시작과 끝에 로딩 상태 이벤트('loading')를 발생시켜 로딩 상태를 관리합니다.
 */

export default {
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];                         
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

<style src="../../../../../public/static/legacy-modernizer/FileSelect.css"></style>