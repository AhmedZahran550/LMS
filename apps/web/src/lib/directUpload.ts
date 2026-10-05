export interface DirectUploadTarget {
  uploadUrl: string;
  httpMethod: 'POST' | 'PUT';
  fields?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface DirectUploadOptions {
  file: File;
  uploadSession: DirectUploadTarget;
  onProgress?: (percentage: number, loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
}

export class UploadAbortedError extends Error {
  constructor(message = 'Upload aborted by user') {
    super(message);
    this.name = 'AbortError';
  }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof UploadAbortedError ||
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

/**
 * Streams a File straight to the cloud storage provider (Cloudinary / S3 / GCS).
 *
 * The LMS API server never touches the bytes: no multipart buffering, no disk
 * writes, no bandwidth cost on the API tier. Progress is reported through
 * XMLHttpRequest because it exposes upload progress events that `fetch` does not.
 */
export function uploadDirectToProvider({
  file,
  uploadSession,
  onProgress,
  signal,
}: DirectUploadOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadAbortedError());
      return;
    }

    const xhr = new XMLHttpRequest();
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener('abort', onAbort);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (value: any) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    function onAbort() {
      xhr.abort();
      fail(new UploadAbortedError());
    }

    xhr.open(uploadSession.httpMethod || 'POST', uploadSession.uploadUrl);

    if (uploadSession.headers) {
      Object.entries(uploadSession.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent, event.loaded, event.total);
      }
    };

    signal?.addEventListener('abort', onAbort);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          succeed(JSON.parse(xhr.responseText));
        } catch {
          succeed(xhr.responseText);
        }
        return;
      }

      let detail = '';
      try {
        const parsed = JSON.parse(xhr.responseText);
        detail = parsed?.error?.message || parsed?.message || '';
      } catch {
        detail = xhr.responseText?.slice(0, 200) || '';
      }

      fail(
        new Error(
          `Direct upload failed: HTTP ${xhr.status}${detail ? ` — ${detail}` : ''}`,
        ),
      );
    };

    xhr.onerror = () => fail(new Error('Network error during cloud upload'));
    xhr.ontimeout = () => fail(new Error('Cloud upload timed out'));
    xhr.onabort = () => fail(new UploadAbortedError());

    if (uploadSession.httpMethod === 'POST' && uploadSession.fields) {
      const formData = new FormData();
      Object.entries(uploadSession.fields).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      formData.append('file', file);
      xhr.send(formData);
    } else {
      xhr.send(file);
    }
  });
}

export { isAbortError };
