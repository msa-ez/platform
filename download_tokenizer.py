from transformers import AutoTokenizer
import sys
import os
import shutil
import logging
import warnings
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    load_dotenv()
    
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        os.environ["HUGGING_FACE_HUB_TOKEN"] = hf_token
        logging.info("Hugging Face 토큰이 설정되었습니다.")
    else:
        warnings.warn("Hugging Face 토큰이 설정되지 않았습니다. 일부 모델은 권한 문제로 다운로드되지 않을 수 있습니다.")
    

    if len(sys.argv) < 2:
        logging.error("""
사용법: python download_tokenizer.py [모델명]
예시: python download_tokenizer.py Qwen/QwQ-32B-AWQ
허깅페이스 홈페이지에서 모델명을 찾아서 입력해주세요.
""")
        sys.exit(1)
    

    model_name = sys.argv[1]
    logging.info(f"'{model_name}' 토큰나이저 다운로드를 시작합니다.")
    
    save_path = os.path.join('./downloads/tokenizers', model_name)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    if os.path.exists(save_path):
        logging.info(f"기존 토큰나이저 삭제 중: {save_path}")
        shutil.rmtree(save_path)
    
    logging.info(f"'{model_name}' 토큰나이저 다운로드 중...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    tokenizer.save_pretrained(save_path)
    logging.info(f"토큰나이저가 성공적으로 다운로드되어 {save_path}에 저장되었습니다.")

if __name__ == "__main__":
    main()