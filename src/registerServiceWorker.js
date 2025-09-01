/* eslint-disable no-console */

import { register } from 'register-service-worker'

// 서버 측 빌드 버전 읽기 (HTML 메타 태그에서)
function getServerBuildVersion() {
  const metaTag = document.querySelector('meta[name="msaez-build-version"]')
  return metaTag ? metaTag.getAttribute('content') : null
}

// 클라이언트 캐시된 빌드 버전 (JS 파일에 포함)
const CLIENT_BUILD_VERSION = process.env.VUE_APP_BUILD_VERSION || Date.now().toString()

// URL 변경 없이 조용히 캐시 삭제 + 강제 새로고침
async function silentCacheClear() {
  try {
    // Service Worker 등록 해제
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(async (registration) => {
        await registration.unregister()
      }))
    }
    
    // 모든 캐시 삭제
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(async (cacheName) => {
        await caches.delete(cacheName)
      }))
    }
    
    // 이전 버전 localStorage 키들 정리
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('msaez_cache_cleared_v')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // 서버 버전으로 캐시 비움 완료 표시
    const serverVersion = getServerBuildVersion()
    const cacheKey = 'msaez_cache_cleared_v' + serverVersion
    localStorage.setItem(cacheKey, 'true')
    
    // 새로고침 실행
    setTimeout(() => {
      window.location.reload()
    }, 100)
      
  } catch (error) {
    console.error('Cache clearing failed:', error)
    const fallbackKey = 'msaez_cache_cleared_v' + Date.now()
    localStorage.setItem(fallbackKey, 'true')
    window.location.reload()
  }
}

if (process.env.NODE_ENV === 'production') {
  // 서버와 클라이언트 빌드 버전 비교
  const serverBuildVersion = getServerBuildVersion()
  const clientBuildVersion = CLIENT_BUILD_VERSION
  const serverCacheKey = 'msaez_cache_cleared_v' + serverBuildVersion
  const hasBeenCleared = localStorage.getItem(serverCacheKey)
  
  console.log('[MSAEZ] 서버 빌드 버전:', serverBuildVersion || '감지 실패')
  console.log('[MSAEZ] 캐시 버스팅 기록:', hasBeenCleared || '없음')
  
  if (!serverBuildVersion) {
    // 서버 빌드 버전 감지 실패 시 정상 로드
  } else if (serverBuildVersion !== clientBuildVersion || !hasBeenCleared) {
    silentCacheClear()
  } else {
    // 일반 Service Worker 등록
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready () {
        // Service Worker 준비 완료
      },
      registered () {
        // Service Worker 등록 완료
      },
      cached () {
        // Service Worker 캐시 완료
      },
      updatefound () {
        // Service Worker 업데이트 발견
      },
      updated (registration) {
        // Service Worker 업데이트 시 자동 캐시 비움
        silentCacheClear()
      },
      offline () {
        // 오프라인 모드
      },
      error (error) {
        console.error('Service Worker error:', error)
      }
    })
  }
}
