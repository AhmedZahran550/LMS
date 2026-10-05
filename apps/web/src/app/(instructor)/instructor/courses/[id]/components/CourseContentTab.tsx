"use client";

import { useTranslation } from 'react-i18next';
import React, { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { Pagination } from "@/components/ui/Pagination";
import { ContentPlayerModal } from "@/components/ui/ContentPlayerModal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import {
  Upload,
  X,
  Plus,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Presentation,
  Trash2,
  Eye,
  Search,
  CloudUpload,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApis } from "@/lib/courseApis";
import {
  uploadDirectToProvider,
  isAbortError,
} from "@/lib/directUpload";
import { ContentType } from "@lms/shared-types";
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscriptionGuard } from '@/components/subscription/useSubscriptionGuard';
import { useSnackbar } from '@/components/ui/Snackbar';

type UploadStage = 'idle' | 'validating' | 'uploading' | 'finalizing';

const ACCEPTED_FILE_TYPES =
  "video/*,application/pdf,image/*,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function CourseContentTab({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateSubscription } = useAuthStore();
  const { checkCanUploadContent } = useSubscriptionGuard();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // States for paginated table
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");

  // States for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<any>(null);

  // States for upload form
  const [contentTitle, setContentTitle] = useState("");
  const [contentDesc, setContentDesc] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // States for the 3-phase direct upload lifecycle
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    data: paginatedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "instructor-course-contents",
      courseId,
      page,
      searchQuery,
      filterType,
    ],
    queryFn: async () => {
      const queryOptions: any = { page, limit: 10 };
      if (searchQuery) queryOptions.search = searchQuery;
      if (filterType) queryOptions["filter.contentType"] = `$eq:${filterType}`;
      return await courseApis.getCourseContents(courseId, queryOptions);
    },
  });

  const resetUploadForm = () => {
    setIsAddModalOpen(false);
    setContentTitle("");
    setContentDesc("");
    setSelectedFile(null);
    setIsPreview(false);
    setUploadStage('idle');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const file = selectedFile;
      if (!file) throw new Error(t('Please select a file to upload.'));

      // Phase 1 — Pre-flight: local quota guard, then server-side quota + signed credentials.
      setUploadStage('validating');
      setUploadProgress(0);

      const { allowed, reason } = checkCanUploadContent(file.size);
      if (!allowed) throw new Error(reason || t('Storage limit reached'));

      const session = await courseApis.initUploadSession(courseId, {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        title: contentTitle,
        description: contentDesc || undefined,
        isPreview,
      });

      // Phase 2 — Direct client-to-cloud transmission (zero API bandwidth).
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setUploadStage('uploading');

      let cloudResult: any;
      try {
        cloudResult = await uploadDirectToProvider({
          file,
          uploadSession: {
            uploadUrl: session.uploadUrl,
            httpMethod: session.httpMethod,
            fields: session.fields,
            headers: session.headers,
          },
          onProgress: (percentage) => setUploadProgress(percentage),
          signal: controller.signal,
        });
      } catch (error) {
        // Release the reserved quota and drop any orphaned cloud asset.
        await courseApis.abortUploadSession(session.sessionId).catch(() => {});
        throw error;
      } finally {
        abortControllerRef.current = null;
      }

      // Phase 3 — Commit: server verifies the asset and creates the CourseContent record.
      setUploadStage('finalizing');
      setUploadProgress(100);

      const created = await courseApis.completeUpload(courseId, {
        sessionId: session.sessionId,
        title: contentTitle,
        description: contentDesc || undefined,
        isPreview,
        cloudinaryResult: cloudResult?.public_id
          ? {
              publicId: cloudResult.public_id,
              secureUrl: cloudResult.secure_url,
              bytes: cloudResult.bytes,
              resourceType: cloudResult.resource_type,
              format: cloudResult.format,
            }
          : undefined,
      });

      return { created, uploadedBytes: file.size };
    },
    onSuccess: ({ uploadedBytes }) => {
      if (uploadedBytes > 0) {
        const current =
          useAuthStore.getState().user?.subscription?.totalStorageBytes || 0;
        updateSubscription({ totalStorageBytes: current + uploadedBytes });
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: ["instructor-course-contents"] });
      queryClient.invalidateQueries({ queryKey: ["learner-course-contents"] });
      resetUploadForm();
      showSnackbar(t('Content uploaded successfully!'), 'success');
    },
    onError: (err: any) => {
      setUploadStage('idle');
      setUploadProgress(0);
      abortControllerRef.current = null;
      if (isAbortError(err)) {
        showSnackbar(t('Upload cancelled.'), 'info');
        return;
      }
      showSnackbar(
        err.response?.data?.message || err.message || t('Failed to upload content'),
        'error',
      );
    },
  });

  const isUploading = uploadMutation.isPending;

  const handleCancelUpload = () => {
    abortControllerRef.current?.abort();
  };

  const handleAddModalChange = (open: boolean) => {
    if (!open && uploadStage === 'uploading') {
      handleCancelUpload();
    }
    setIsAddModalOpen(open);
  };

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      await courseApis.deleteContent(courseId, contentId);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["learner-course-contents"] });
      if (activeContent) setActiveContent(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || t("Failed to delete content"));
    },
  });

  const contents = paginatedData?.data || [];
  const meta = paginatedData?.meta;
  console.log("contents", contents);

  const contentTypes = [
    { value: "", label: t("All Types") },
    { value: ContentType.VIDEO, label: t("Video") },
    { value: ContentType.PDF, label: t("PDF") },
    { value: ContentType.IMAGE, label: t("Image") },
    { value: ContentType.PRESENTATION, label: t("Presentation") },
  ];

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{t('Course Content')}</CardTitle>
            <CardDescription>{t('Manage and organize uploaded files.')}</CardDescription>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" /> {t('Add Content')}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters Area */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[var(--sv-text-muted)]" />
              </div>
              <Input
                placeholder={t('Search content...')}
                className="ps-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-[var(--sv-border)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">{t('#')}</TableHead>
                  <TableHead>{t('Title')}</TableHead>
                  <TableHead>{t('Type')}</TableHead>
                  <TableHead>{t('Size')}</TableHead>
                  <TableHead className="text-right">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--sv-primary)] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-[var(--sv-text-muted)]"
                    >
                      {t('No content found.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map((content: any, i: number) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium text-[var(--sv-text-muted)]">
                        {(page - 1) * (meta?.itemsPerPage || 10) + i + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[var(--sv-text-primary)]">
                          {content.title}
                        </div>
                        {content.description && (
                          <div className="text-xs text-[var(--sv-text-muted)] line-clamp-1">
                            {content.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={content.contentType as any}
                          className="capitalize"
                        >
                          {t(content.contentType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[var(--sv-text-muted)]">
                        {(content.size / (1024 * 1024)).toFixed(2)} MB
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveContent(content)}
                          >
                            <Eye className="h-4 w-4 me-1" /> {t('View')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[var(--sv-error)] hover:text-[var(--sv-error-700)] hover:bg-[var(--sv-error-50)]"
                            onClick={() => {
                              if (
                                confirm(t("Are you sure you want to delete this content?"))
                              ) {
                                deleteMutation.mutate(content.id);
                              }
                            }}
                            isLoading={
                              deleteMutation.isPending &&
                              deleteMutation.variables === content.id
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Content Modal */}
      <Dialog
        open={isAddModalOpen}
        onOpenChange={handleAddModalChange}
        title={t('Upload Content')}
        description={t('Add videos, PDFs, images, or presentations to this course.')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('Title')}</label>
              <Input
                placeholder={t('e.g. Introduction Lecture')}
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                disabled={isUploading}
              />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('File')}</label>
            <Input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              ref={fileInputRef}
              disabled={isUploading}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-[var(--sv-text-muted)] mt-1">{t('Supported: Video, PDF, Image, PPTX')}</p>
            {selectedFile && (
              <p className="text-xs text-[var(--sv-text-muted)] mt-1">
                {selectedFile.name} — {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('Description')}</label>
            <textarea
              className="w-full text-sm p-3 border rounded-md border-[var(--sv-border-input)] bg-[var(--sv-bg-input)] text-[var(--sv-text-primary)] placeholder:text-[var(--sv-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sv-ring-focus)]"
              placeholder={t('Content description...')}
              rows={3}
              value={contentDesc}
              disabled={isUploading}
              onChange={(e) => setContentDesc(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--sv-text-primary)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--sv-border-input)]"
              checked={isPreview}
              disabled={isUploading}
              onChange={(e) => setIsPreview(e.target.checked)}
            />
            {t('Free preview for enrolled students')}
          </label>

          {isUploading && (
            <UploadProgressPanel stage={uploadStage} progress={uploadProgress} />
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!selectedFile || !contentTitle || isUploading}
              isLoading={isUploading && uploadStage !== 'uploading'}
              className="flex-1"
            >
              {uploadStage === 'uploading' ? (
                <CloudUpload className="me-2 h-4 w-4" />
              ) : (
                <Upload className="me-2 h-4 w-4" />
              )}
              {t('Upload Content')}
            </Button>
            {isUploading && uploadStage === 'uploading' && (
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                className="text-[var(--sv-error)] hover:bg-[var(--sv-error-50)]"
              >
                <X className="me-2 h-4 w-4" /> {t('Cancel')}
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Fullscreen Player Modal */}
      <ContentPlayerModal
        content={activeContent}
        onClose={() => setActiveContent(null)}
      />
    </>
  );
}

const STAGE_ORDER: UploadStage[] = ['validating', 'uploading', 'finalizing'];

const STAGE_LABELS: Record<UploadStage, string> = {
  idle: '',
  validating: 'Validating quota',
  uploading: 'Uploading to cloud storage',
  finalizing: 'Finalizing content',
};

function UploadProgressPanel({
  stage,
  progress,
}: {
  stage: UploadStage;
  progress: number;
}) {
  const { t } = useTranslation();
  const activeIndex = STAGE_ORDER.indexOf(stage);
  const overall = Math.round(
    ((activeIndex + (stage === 'uploading' ? progress / 100 : stage === 'finalizing' ? 1 : 0)) /
      STAGE_ORDER.length) *
      100,
  );

  return (
    <div className="rounded-xl border border-[var(--sv-border)] bg-[var(--sv-bg-muted)]/40 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--sv-text-primary)]">
          {t('Uploading to secure cloud storage')}
        </span>
        <span className="text-sm tabular-nums text-[var(--sv-text-muted)]">
          {stage === 'uploading' ? `${progress}%` : `${overall}%`}
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--sv-border)]"
        role="progressbar"
        aria-valuenow={stage === 'uploading' ? progress : overall}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--sv-primary)] transition-[width] duration-200 ease-out"
          style={{ width: `${stage === 'uploading' ? progress : overall}%` }}
        />
      </div>

      <ol className="space-y-1">
        {STAGE_ORDER.map((item, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <li
              key={item}
              className={`flex items-center gap-2 text-xs ${
                isActive
                  ? 'font-semibold text-[var(--sv-text-primary)]'
                  : isDone
                    ? 'text-[var(--sv-text-muted)]'
                    : 'text-[var(--sv-text-muted)]/60'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isDone
                    ? 'bg-[var(--sv-primary)]'
                    : isActive
                      ? 'animate-pulse bg-[var(--sv-primary)]'
                      : 'bg-[var(--sv-border)]'
                }`}
              />
              {t(STAGE_LABELS[item])}
              {item === 'uploading' && isActive && (
                <span className="tabular-nums">({progress}%)</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
