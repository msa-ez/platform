export const sentences = {
    mix: `안녕하세요. 즐거운 하루입니다. Hello World! This is a test message. {"key":"value","test":123} 🎉 !@#$%`,
    mix_v2:`인공지능 모델은 다양한 토큰화 방식을 사용하여 텍스트를 처리합니다.
AI 모델은 natural language processing 기술을 활용해 텍스트를 이해합니다.
안녕하세요! 😊 오늘은 #인공지능 연구에 대해 이야기해봅시다. @AI_Research
function tokenCount(text, model) {
  return encoder.encode(text).length * weightMap[model];
}
Transformer 아키텍처는 2017년에 소개되었으며, GPT-4는 약 1.76조 개의 파라미터를 가진 것으로 추정됩니다.
こんにちは, AI 세계! Hello, 인공지능 世界! Bonjour, 딥러닝 universe!
aaaaaaaaaaaaaa bbbbbbbbbbbbbb cccccccccccccc
https://example.com/ai/research?param=value&type=transformer user@example.com
인공지능 기술의 발전으로 인해 우리는 이제 자연어 처리, 컴퓨터 비전, 강화학습 등 다양한 분야에서 놀라운 성과를 경험하고 있으며, 이러한 기술은 의료, 금융, 교육 등 여러 산업 분야에서 혁신을 이끌어내고 있습니다.`
}

export const mockDatas = [
    {
        model: "unknown",
        text: sentences.mix_v2
    },
    {
        model: "o3-mini-2025-01-31",
        text: sentences.mix
    },
    {
        model: "claude-3-7-sonnet-20250219",
        text: sentences.mix
    },
    {
        model: "gemini-2.0-flash",
        text: sentences.mix
    },
    {
        model: "Qwen/QwQ-32B-AWQ",
        text: sentences.mix
    }
]