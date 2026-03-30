interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

export function createRefreshQueue() {
  let failedQueue: FailedRequest[] = [];

  return {
    enqueue(request: FailedRequest) {
      failedQueue.push(request);
    },
    process(error: unknown, token: string | null = null) {
      failedQueue.forEach((request) => {
        if (error) {
          request.reject(error);
          return;
        }

        request.resolve(token);
      });

      failedQueue = [];
    },
  };
}
