# LMS Direct-to-Cloud Upload & Storage Migration Plan

## 1. Executive Summary & Objectives

The LMS platform is migrating exclusively to a **Direct-to-Cloud Upload** paradigm for all course media (videos, PDFs, images, documents). 

### Key Goals:
1. **Eliminate Server-Side Buffering & Bandwidth Bottlenecks**: Remove server-buffered multipart uploads (`Express.Multer`) and local chunk storage (`/api/v1/upload/local/:sessionId/chunk`) developed during initial prototyping.
2. **Standardize on Cloudinary with Extensible Cloud Architecture**: Use Cloudinary as the active cloud storage provider, structured via the **Strategy Pattern** so transitioning to **AWS S3** or **Google Cloud Storage (GCS)** in the future requires zero changes to domain services or controllers.
3. **Frontend Direct Upload Implementation**: Update the Next.js Web App (`apps/web`) to upload files directly from the teacher's browser to the cloud provider with real-time progress tracking, resumability, and abort support.

---

## 2. Direct Upload Architecture & Lifecycle

```
                                  +------------------------------------+
                                  | 1. POST /content/upload-session    |
                                  |    (Validates quota, permissions,  |
                                  |     returns signed Cloud params)   |
                                  +-----------------+------------------+
                                                    |
                                                    v
[ Teacher's Web Browser ] -----------------------------------------------------> [ LMS API Backend ]
        |                                                                               |
        | 2. Direct Upload (PUT / POST)                                                 |
        |    - Real-time progress bar                                                   |
        |    - Zero API server RAM or bandwidth                                         |
        |    - Direct to Cloud Provider (Cloudinary / S3 / GCS)                          |
        v                                                                               |
[ Cloud Storage Provider ]                                                              |
(Cloudinary / AWS S3 / GCS)                                                             |
        |                                                                               |
        | (Upload completes, returns CDN URL & asset ID)                                |
        v                                                                               |
[ Teacher's Web Browser ] -----------------------------------------------------> [ LMS API Backend ]
                                  | 3. POST /content/complete-upload   |
                                  |    (Verifies asset in cloud,       |
                                  |     saves CourseContent record,    |
                                  |     notifies enrolled students)    |
                                  +------------------------------------+
```

### 3-Step Lifecycle:
1. **Pre-Flight Session Initiation**:
   - Client sends `{ fileName, fileSize, mimeType }` to `POST /courses/:courseId/content/upload-session`.
   - Server checks instructor course ownership, validates 5 GB permanent quota + active subscriptions.
   - Server generates short-lived signed credentials / presigned URLs via `StorageService`.
   - Server persists an `UploadSession` with status `PENDING` and a 24-hour expiration.
2. **Direct Client-to-Cloud Upload**:
   - Web client transmits the binary file directly to the storage provider (e.g. Cloudinary endpoint or S3 Presigned URL).
   - Real-time upload progress (`0%` to `100%`) is displayed in the UI via `XMLHttpRequest.upload.onprogress`.
   - If the user cancels, the client aborts the request and invokes `DELETE /upload/session/:sessionId`.
3. **Commit & Post-Upload Verification**:
   - Once cloud storage confirms receipt, the client sends `{ sessionId, title, description, isPreview, cloudinaryResult }` to `POST /courses/:courseId/content/complete-upload`.
   - Server independently queries the storage provider to verify asset authenticity, dimensions, and size.
   - Server updates `UploadSession` to `COMPLETED`, saves the new `CourseContent` record, and issues notifications to enrolled students.

---

## 3. Legacy Cleanup Specification

The following development artifacts and legacy server-buffered methods will be cleanly decommissioned.

### A. Backend Cleanup: Endpoints & Handlers
| File Path | Component | Action | Reason |
| :--- | :--- | :--- | :--- |
| `apps/api/src/modules/upload/upload.controller.ts` | `@Patch('local/:sessionId/chunk')` (`uploadLocalChunk`) | **DELETE** | Development artifact for local chunked uploads; replaced by direct cloud uploads. |
| `apps/api/src/swagger/upload.swagger.ts` | `UploadSwagger.uploadChunk()` | **DELETE** | Documentation for deleted local chunk endpoint. |
| `apps/api/src/modules/course-content/controllers/instructor-course-content.controller.ts` | `@Post()` (`upload`) with `@UseInterceptors(FileInterceptor('file'))` | **DELETE** | Legacy non-direct upload endpoint that buffered entire files through NestJS memory. |
| `apps/api/src/swagger/course-content.swagger.ts` | `CourseContentSwagger.uploadContent()` | **DELETE** | Documentation for deleted server-buffered multipart endpoint. |

### B. Backend Cleanup: Services & Storage
| File Path | Component | Action | Reason |
| :--- | :--- | :--- | :--- |
| `apps/api/src/modules/storage/local-storage.service.ts` | `LocalStorageService` | **DELETE** | Local file system storage is no longer supported in production. |
| `apps/api/src/modules/upload/upload.service.ts` | `appendLocalChunk()` | **DELETE** | Unused without local chunk endpoint. |
| `apps/api/src/modules/upload/upload.service.ts` | Local branching in `getUploadStatus()`, `abortSession()`, `cleanupExpiredSessions()` | **REFACTOR** | Remove all `instanceof LocalStorageService` and local filesystem cleanup logic. |
| `apps/api/src/modules/course-content/course-content.service.ts` | `upload()` method | **DELETE** | Replaced entirely by `completeDirectUpload()`. |
| `apps/api/src/modules/course-content/course-content.service.ts` | `completeDirectUpload()` local branch (`finalizeLocalFile`) | **REFACTOR** | Remove `session.provider === 'local'` branch. |
| `apps/api/src/modules/storage/storage.module.ts` | Dynamic provider factory | **REFACTOR** | Default to `CloudinaryStorageService`; remove `LocalStorageService` provider. |
| `apps/api/src/config/storage.config.ts` | `uploadDir` property | **DELETE** | Remove local file path configuration. |
| `apps/api/src/config/env.validation.ts` | Validation schema | **REFACTOR** | Enforce Cloudinary environment variables; remove fallback to `'local'`. |

*(Note: User profile avatar upload in `profile.controller.ts` for small images can continue using `cloudinary.uploader.upload_stream` or migrate to direct upload).*

---

## 4. Future-Proof Storage Provider Architecture

To make switching to **AWS S3** or **Google Cloud Storage (GCS)** trivial without changing business logic, we define a unified contract in `apps/api/src/modules/storage/storage.service.ts`.

### Unified Strategy Interface
```typescript
export type StorageProviderType = 'cloudinary' | 's3' | 'gcs';

export interface DirectUploadSessionResult {
  provider: StorageProviderType;
  uploadUrl: string;
  httpMethod: 'POST' | 'PUT';
  fields?: Record<string, any>;     // Form fields (Cloudinary signed params or S3 Presigned POST)
  headers?: Record<string, string>; // Headers (S3 Presigned PUT or GCS resumable upload)
  chunkSize: number;
  publicId?: string;
}

export interface VerifiedAssetResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export abstract class StorageService {
  /**
   * Generates direct upload session parameters and short-lived signatures/URLs.
   */
  abstract createDirectUploadSession(
    sessionId: string,
    directory: string,
    filename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<DirectUploadSessionResult>;

  /**
   * Validates that an asset was successfully uploaded to the cloud provider.
   */
  abstract verifyUploadedAsset(
    identifier: string,
    metadata?: Record<string, any>,
  ): Promise<VerifiedAssetResult | null>;

  /**
   * Deletes an asset from cloud storage.
   */
  abstract delete(identifier: string): Promise<void>;

  /**
   * Resolves the public CDN delivery URL for an asset.
   */
  abstract getUrl(identifier: string): string;
}
```

### Provider Implementation Comparison

| Provider | Direct Session Generation (`createDirectUploadSession`) | Client Upload Mechanism | Verification (`verifyUploadedAsset`) |
| :--- | :--- | :--- | :--- |
| **Cloudinary** *(Current)* | Signs folder, public_id, timestamp with API secret | `POST` `FormData` to `https://api.cloudinary.com/v1_1/<cloud>/<type>/upload` | Calls `cloudinary.api.resource(publicId)` |
| **AWS S3** *(Future Option)* | Uses `@aws-sdk/s3-request-presigner` to create Presigned `PUT` or `POST` | `PUT` raw binary file to `https://<bucket>.s3.amazonaws.com/<key>` | Calls `HeadObjectCommand` to verify existence and size |
| **Google Cloud** *(Future Option)* | Uses `@google-cloud/storage` `file.getSignedUrl({ action: 'write' })` | `PUT` binary file/chunks to Google Cloud Storage signed URL | Calls `file.getMetadata()` |

### NestJS Injection Factory (`storage.module.ts`)
```typescript
{
  provide: StorageService,
  useFactory: (configService: ConfigService) => {
    const provider = configService.get<string>('storage.provider') || 'cloudinary';
    switch (provider) {
      case 's3':
        // return new S3StorageService(configService);
      case 'gcs':
        // return new GcsStorageService(configService);
      case 'cloudinary':
      default:
        return new CloudinaryStorageService(configService);
    }
  },
  inject: [ConfigService],
}
```

---

## 5. Web App Updates for Direct Upload

### A. API Client Updates (`apps/web/src/lib/courseApis.ts`)
Remove the legacy `uploadContent` multipart call and introduce:
- `initUploadSession(courseId, params)`: Calls `POST /courses/:courseId/content/upload-session`
- `completeUpload(courseId, data)`: Calls `POST /courses/:courseId/content/complete-upload`
- `abortUploadSession(sessionId)`: Calls `DELETE /upload/session/:sessionId`

### B. Client-Side Direct Upload Utility (`apps/web/src/lib/directUpload.ts`)
Create a robust upload helper supporting:
- Direct transmission to Cloudinary (or S3/GCS)
- Real-time progress monitoring (`0%` to `100%`)
- User cancellation through `AbortSignal`

```typescript
export interface DirectUploadOptions {
  file: File;
  uploadSession: {
    uploadUrl: string;
    httpMethod: string;
    fields?: Record<string, any>;
    headers?: Record<string, string>;
  };
  onProgress?: (percentage: number, loadedBytes: number, totalBytes: number) => void;
  signal?: AbortSignal;
}

export async function uploadDirectToProvider({
  file,
  uploadSession,
  onProgress,
  signal,
}: DirectUploadOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(uploadSession.httpMethod || 'POST', uploadSession.uploadUrl);

    if (uploadSession.headers) {
      Object.entries(uploadSession.headers).forEach(([k, v]) => {
        xhr.setRequestHeader(k, v);
      });
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent, event.loaded, event.total);
      }
    };

    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort();
        reject(new DOMException('Upload aborted by user', 'AbortError'));
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Direct upload failed: HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during cloud upload'));

    if (uploadSession.httpMethod === 'POST' && uploadSession.fields) {
      const formData = new FormData();
      Object.entries(uploadSession.fields).forEach(([key, val]) => {
        formData.append(key, val);
      });
      formData.append('file', file);
      xhr.send(formData);
    } else {
      xhr.send(file);
    }
  });
}
```

### C. UI/UX Enhancements in `CourseContentTab.tsx`
1. **Interactive Progress Bar**:
   - Replaces static loading spinner with an animated progress bar.
   - Stage indicators: `"Validating quota..."` $\rightarrow$ `"Uploading to Cloudinary (<N>%)..."` $\rightarrow$ `"Finalizing content..."`.
2. **Abort / Cancel Button**:
   - Allows cancelling long-running uploads; cleans up the backend session and releases reserved storage quota.
3. **Execution Logic**:
   - Pre-check storage quota with `useSubscriptionGuard`.
   - Call `initUploadSession`.
   - Upload directly to Cloudinary using `uploadDirectToProvider`.
   - Call `completeUpload`.
   - Invalidate React Query caches and reset form state.

---

## 6. Step-by-Step Implementation Roadmap

### Phase 1: Storage Architecture & Backend Cleanup
- [ ] Update `apps/api/src/modules/storage/storage.service.ts` with generalized `DirectUploadSessionResult` and `VerifiedAssetResult`.
- [ ] Delete `apps/api/src/modules/storage/local-storage.service.ts`.
- [ ] Remove `uploadLocalChunk` endpoint in `upload.controller.ts` and `UploadSwagger.uploadChunk` in `upload.swagger.ts`.
- [ ] Remove legacy `upload` endpoint in `instructor-course-content.controller.ts` and `upload()` in `course-content.service.ts`.
- [ ] Clean up local branching in `upload.service.ts` and `course-content.service.ts`.
- [ ] Update `storage.config.ts`, `storage.module.ts`, and `env.validation.ts`.

### Phase 2: Frontend Direct Upload Client
- [ ] Create `apps/web/src/lib/directUpload.ts`.
- [ ] Update `apps/web/src/lib/courseApis.ts` with `initUploadSession`, `completeUpload`, and `abortUploadSession`. Remove legacy `uploadContent`.

### Phase 3: Frontend UI Integration & User Experience
- [ ] Update `CourseContentTab.tsx` to use the 3-step direct upload flow.
- [ ] Add progress bar, upload percentage, stage status, and cancel button.
- [ ] Ensure subscription quota updates and React Query invalidation operate reliably.

### Phase 4: Verification & End-to-End Testing
- [ ] Verify large video uploads directly reach Cloudinary with zero API memory spike.
- [ ] Verify non-video uploads (PDF, documents).
- [ ] Verify quota enforcement rejects oversized files at the pre-flight stage.
- [ ] Verify enrolled students can stream videos and access uploaded resources.
