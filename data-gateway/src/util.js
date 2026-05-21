// 공통 유틸.

/** Express 핸들러의 async 예외를 잡아 500 응답으로 변환. */
export function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error('[gateway]', req.method, req.originalUrl, '-', err.message);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
  };
}
