const StorageBase = require('../../../../../CommonStorageBase.vue').default;

class EsValueLangGraphStudioProxy {
    /**
     * 새로운 스레드와 런을 생성하고 결과를 스트리밍합니다.
     * @param {Object} inputData - 입력 데이터
     * @param {Function} onUpdate - 스트리밍 업데이트시 호출될 콜백 함수 (esValue를 인자로 받음)
     * @param {Function} onComplete - 스트리밍 완료시 호출될 콜백 함수 (최종 esValue를 인자로 받음)
     * @param {string} serverUrl - 서버 URL (기본값: DEFAULT_SERVER_URL)
     * @returns {Promise<{threadId: string, runId: string}>} - 생성된 threadId와 runId
     */
    static async createNewThreadRun(inputData, onReady, onUpdate, onComplete, serverUrl = this.DEFAULT_SERVER_URL) {
      try {
        // 1. 스레드 생성
        const threadResponse = await fetch(`${serverUrl}/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
  
        const threadData = await threadResponse.json();
        const threadId = threadData.thread_id;
  
  
        // 2. 런 생성
        const runResponse = await fetch(`${serverUrl}/threads/${threadId}/runs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assistant_id: "eventstorming_generator",
            input: inputData,
            stream_mode: ["events"]
          })
        });
  
        const runData = await runResponse.json();
        const runId = runData.run_id;
  
  
        if(typeof onReady === 'function') {
          onReady(threadId, runId);
        }
  
        // 3. 스트리밍 처리 시작
        await this._handleStream(threadId, runId, onUpdate, onComplete, serverUrl);
  
        return { threadId, runId };
      } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
      }
    }
  
    /**
     * 기존 스레드와 런에 다시 연결하여 결과를 계속 스트리밍합니다.
     * @param {string} threadId - 스레드 ID
     * @param {string} runId - 런 ID
     * @param {Function} onUpdate - 스트리밍 업데이트시 호출될 콜백 함수 (esValue를 인자로 받음)
     * @param {Function} onComplete - 스트리밍 완료시 호출될 콜백 함수 (최종 esValue를 인자로 받음)
     * @param {string} serverUrl - 서버 URL (기본값: DEFAULT_SERVER_URL)
     * @returns {Promise<void>}
     */
    static async reconnectToExistingRun(threadId, runId, onUpdate, onComplete, serverUrl = this.DEFAULT_SERVER_URL) {
      try {
        await this._handleStream(threadId, runId, onUpdate, onComplete, serverUrl);
      } catch (error) {
        console.error('스트림 재연결 오류:', error);
        throw error;
      }
    }
  
    /**
     * 서버 상태 확인
     * @param {string} serverUrl - 서버 URL (기본값: DEFAULT_SERVER_URL)
     * @returns {Promise<boolean>} - 서버가 정상이면 true
     */
    static async healthCheck(serverUrl = this.DEFAULT_SERVER_URL) {
      try {
        const response = await fetch(`${serverUrl}/ok`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        console.log('서버 상태:', data);
        return data.status === 'ok' || response.status === 200;
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        return false;
      }
    }
  
    /**
     * 스트림 처리를 위한 내부 메소드
     * @param {string} threadId - 스레드 ID
     * @param {string} runId - 런 ID
     * @param {Function} onUpdate - 업데이트 콜백
     * @param {Function} onComplete - 완료 콜백
     * @param {string} serverUrl - 서버 URL
     * @returns {Promise<void>}
     * @private
     */
    static async _handleStream(threadId, runId, onUpdate, onComplete, serverUrl) {
      const streamResponse = await fetch(`${serverUrl}/threads/${threadId}/runs/${runId}/stream`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
  
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          // 스트리밍이 완료되면 최종 결과 가져오기
          const finalResponse = await fetch(`${serverUrl}/threads/${threadId}/runs/${runId}/join`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
      
          const finalData = await finalResponse.json();
          const finalEsValue = (finalData.outputs && finalData.outputs.esValue) || {};
          
          if (typeof onComplete === 'function') {
            onComplete(finalEsValue);
          }
          
          break;
        }
        
        // 스트림 데이터를 디코딩하여 기존 버퍼에 추가
        buffer += decoder.decode(value, { stream: true });
        
        // 줄 단위로 처리
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, newlineIndex).trim();
          buffer = buffer.substring(newlineIndex + 1);
          
          if (line && line.startsWith('data:')) {
            try {
              const jsonStr = line.substring(5).trim(); // "data: " 이후의 JSON 문자열 추출
              const data = JSON.parse(jsonStr);
  
              if (data.event === "on_chain_end") {
                const outputState = data.data.output;
                if (outputState && outputState.outputs && outputState.outputs.esValue) {
                  const outputEsValue = outputState.outputs.esValue;
                  
                  if (typeof onUpdate === 'function') {
                    onUpdate(outputEsValue, data.name);
                  }
                }
              }
            } catch (parseError) {
              console.error('JSON 파싱 오류:', parseError);
            }
          }
        }
      }
    }


    static async healthCheckUsingConfig() {
      try {
        const CONFIG_PATH = `db://configs/eventstorming_generator`;
        const storage = new Vue(StorageBase);

        const config = await storage.getObject(CONFIG_PATH);
        if(config.server_url) return true;
      } catch (error) {
        console.error('서버 상태 확인 오류:', error);
        return false;
      }
    }

    static async makeNewJob(jobId, selectedDraftOptions, userInfo, information, preferedLanguage) {
      const JOB_PATH = `db://requestedJobs/eventstorming_generator/${jobId}`;
      const storage = new Vue(StorageBase);

      await storage.setObject(JOB_PATH, {
        "state": {
          "inputs": {
            "jobId": jobId,
            "selectedDraftOptions": selectedDraftOptions,
            "userInfo": userInfo,
            "information": information,
            "preferedLanguage": preferedLanguage
          }
        }
      })

      return jobId;
    }

    static watchJob(jobId, onUpdate, onComplete) {
      const JOB_PATH = `db://jobs/eventstorming_generator/${jobId}/state`;
      const storage = new Vue(StorageBase);

      storage.watch(JOB_PATH, (stateString) => {
        if(!stateString) return;
        
        const state = this.parseJobState(stateString);
        if(state.isCompleted) {
          onComplete(state.esValue, state.logs, state.totalPercentage);
        }
        else {
          onUpdate(state.esValue, state.logs, state.totalPercentage);
        }
      });
    }

    static parseJobState(stateString) {
      const state = JSON.parse(stateString);
      const outputs = state.outputs;
      return {
        isCompleted: outputs.isCompleted,
        esValue: outputs.esValue,
        logs: outputs.logs,
        totalProgressCount: outputs.totalProgressCount,
        currentProgressCount: outputs.currentProgressCount,
        totalPercentage: Math.min(Math.round((outputs.currentProgressCount / outputs.totalProgressCount) * 100), 100)
      }
    }
}

EsValueLangGraphStudioProxy.DEFAULT_SERVER_URL = "http://127.0.0.1:2024"

module.exports = EsValueLangGraphStudioProxy