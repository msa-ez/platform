class NodeUtil {
    static checkNodeVersion(currentVersion, requiredNodeVersion) {
        const sanitizeInputs = (inputs) => {
          if(inputs.currentVersion.startsWith('v'))
            inputs.currentVersion = inputs.currentVersion.slice(1);

          if(inputs.requiredNodeVersion.startsWith('v'))
            inputs.requiredNodeVersion = inputs.requiredNodeVersion.slice(1);
          
          return inputs;
        }
        const sanitized = sanitizeInputs({ currentVersion, requiredNodeVersion });
        currentVersion = sanitized.currentVersion;
        requiredNodeVersion = sanitized.requiredNodeVersion;
      
        
        const current = currentVersion.split('.').map(Number);
        const required = requiredNodeVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(current.length, required.length); i++) {
          const currentPart = current[i] || 0;
          const requiredPart = required[i] || 0;
          
          if (currentPart > requiredPart) return true;
          if (currentPart < requiredPart) {
            console.error(`\x1b[31m오류: Node.js 버전이 너무 낮습니다!\x1b[0m`);
            console.error(`현재 버전: ${currentVersion}`);
            console.error(`필요한 버전: ${requiredNodeVersion} 이상`);
            console.error(`\n다음 명령어로 필요한 버전을 설치하고 사용하세요:\n`);
            console.error(`  nvm install ${requiredNodeVersion}`);
            console.error(`  nvm use ${requiredNodeVersion}\n`);
            process.exit(1);
          }
        }
    
        return true;
    }
}

module.exports = NodeUtil;