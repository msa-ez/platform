class TextParseHelper {

  /**
   * @description
   * 이 함수는 주어진 텍스트에서 특정 태그(예: \<think\>...\</think\>)의 내용을 안전하게 추출하기 위한 목적으로 사용됩니다.
   * 텍스트가 완전하지 않거나 일부 잘려있는 경우에도 올바른 결과를 반환할 수 있도록 설계되었습니다.
   * - 만약 태그가 완전하게 포함되어 있다면, 태그내의 내용(tagContents)과 태그 이후의 나머지 텍스트(restText)를 함께 반환합니다.
   * - 텍스트가 불완전하거나 태그구조가 완전하지 않은 경우에는 빈 문자열이나, 부분적인 내용을 반환합니다.
   *
   * @example 기본 사용 예시: 완전한 태그 포함
   * // 입력 텍스트: 태그와 내용이 모두 완전하게 포함된 경우
   * const result = TextParseHelper.parseFrontTagContents("<think>Hello World</think> 추가 텍스트", "think");
   * console.log(result);
   * // 출력 결과: { tagContents: "Hello World", restText: " 추가 텍스트" }
   *
   * @example 응용 사용 예시: 불완전한 태그 입력
   * // 입력 텍스트: 태그 시작이 불완전하게 전달된 경우
   * const partialResult = TextParseHelper.parseFrontTagContents("<thi", "think");
   * console.log(partialResult);
   * // 출력 결과: { tagContents: "", restText: "" }
   *
   * @note
   * - 입력 텍스트가 태그의 시작부만 전달된 경우(예: "<thi")에는 빈 문자열들을 반환하므로, 후속 문자열이 누락될 수 있습니다.
   * - 만약 태그 시작은 있지만, 종료 태그가 누락된 경우에는 태그 이후의 모든 텍스트를 tagContents로 취급합니다.
   * - 태그 이름은 대소문자를 구분하므로 정확하게 입력해야 하며, 첫 번째 발견된 태그만 처리합니다.
   */
  static parseFrontTagContents(text, tagName) {
    const fullTag = `<${tagName}>`;
    if (text.length < fullTag.length && fullTag.startsWith(text))
      return {
        tagContents: "",
        restText: ""
      }


    const startIdx = text.indexOf(fullTag);
    if (startIdx === -1) {
      return {
        tagContents: "",
        restText: text
      }
    }


    const closingTag = `</${tagName}>`;
    const endIdx = text.indexOf(closingTag, startIdx);
    if (endIdx === -1) {
        return {
            tagContents: text.substring(startIdx + fullTag.length),
            restText: ""
        }
    }
    
    return {
        tagContents: text.substring(startIdx + fullTag.length, endIdx),
        restText: text.substring(endIdx + closingTag.length)
    }
  }
  
  /**
   * @description 응답 텍스트에서 JSON 형식의 데이터 블록들을 추출하고, 파싱한 후 필요한 정보를 추출 및 결합하여 최종 텍스트(joinedText)와 관련 메타데이터(error, id, finish_reason)를 반환합니다.
   * 이 함수는 OpenAI, Ollama 등 다양한 AI 서비스의 응답을 일관된 형식으로 처리하기 위해 사용됩니다.
   *
   * @example 기본 사용 예시 (OpenAI 응답 텍스트 처리)
   * // OpenAI 응답 텍스트를 처리하여, 데이터 블록들을 JSON 파싱 후 결합된 텍스트와 관련 정보를 반환합니다.
   * const response = TextParseHelper.parseResponseText(openaiResponseText, {
   *   splitFunction: (text) => text.replace("data: [DONE]", "").trim().split("data: ").filter(Boolean),
   *   extractFunction: (parsed) => {
   *     if (parsed.choices && parsed.choices[0]) {
   *       return {
   *         content: parsed.choices[0].delta.content || "",
   *         id: parsed.id,
   *         finish_reason: parsed.choices[0].finish_reason === 'length' ? 'length' : null,
   *         error: parsed.error || null
   *       };
   *     }
   *     return { content: "", id: parsed.id, finish_reason: null, error: parsed.error || null };
   *   }
   * });
   * console.log(response);
   * // 주의: 입력 텍스트에 불필요한 문자열("data: [DONE]")을 사전에 제거해야 하며, JSON 파싱 오류로 인한 빈 문자열 반환을 고려해야 합니다.
   *
   * @example 응용 사용 예시 (Ollama 응답 텍스트 처리)
   * // Ollama의 경우, 응답 텍스트의 각 줄이 별도의 JSON 객체로 구성된 경우에 사용합니다.
   * const response = TextParseHelper.parseResponseText(ollamaResponseText, {
   *   splitFunction: (text) => text.split("\n").filter(line => line.trim() !== ""),
   *   extractFunction: (parsed) => ({
   *     content: (parsed.message && parsed.message.content) ? parsed.message.content : "",
   *     id: "Ollama",
   *     finish_reason: null,
   *     error: parsed.error || null
   *   })
   * });
   * console.log(response);
   * // 주의: 각 줄의 빈 문자열 여부를 필터링하고, 응답 데이터의 구조가 예상과 달라질 경우에 대비하여 extractFunction을 적절히 수정해야 합니다.
   *
   * @note
   * - 옵션 객체에 포함된 splitFunction, extractFunction, postProcess를 통해 다양한 응답 포맷에 유연하게 대응할 수 있습니다.
   * - JSON 파싱 중 오류가 발생하면 해당 블록은 빈 문자열("")로 처리되며, 관련 오류 정보는 error 속성에 저장됩니다.
   * - joinedText에 포함된 ": null" 문자열은 자동으로 ": 'null'"로 변경되어 반환됩니다.
   * - postProcess 함수가 제공될 경우, 최종 결합된 텍스트에 추가적인 후처리 과정을 적용할 수 있습니다.
   */
  static parseResponseText(responseText, options) {
    const { splitFunction, extractFunction, postProcess } = options;
    const jsonBlocks = splitFunction(responseText);


    let error = null;
    let responseId = "";
    let finishReason = null;
    let thinkContent = ""

    const texts = jsonBlocks.map(jsonStr => {
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        return "";
      }
      
      const extraction = extractFunction(parsed);
      if (extraction.error) error = extraction.error;
      if (extraction.id) responseId = extraction.id;
      if (extraction.finish_reason) finishReason = extraction.finish_reason;
      if (extraction.thinkContent) thinkContent += extraction.thinkContent
      
      return extraction.content || "";
    });


    let joinedText = texts.join('')
    if (joinedText.includes(": null")) {
      joinedText = joinedText.replaceAll(": null", ": 'null'");
    }

    if (postProcess && typeof postProcess === "function") {
      joinedText = postProcess(joinedText);
    }

    
    return {
      error,
      id: responseId,
      finish_reason: finishReason,
      joinedText,
      thinkContent
    };
  }

  /**
   * 처음 Client 클래스 구축시에 스트리밍 값을 확인해보는 용도로 사용
   */
  static mockedParseResponseText(responseText, fixedjoinedText="{\n  \"output\": \"Hello, world!\"\n}") {
    console.log("[*] responseText", {responseText: responseText})

    return {
      error: null,
      id: "mockedId",
      finish_reason: null,
      joinedText: fixedjoinedText
    }
  }
}

module.exports = TextParseHelper