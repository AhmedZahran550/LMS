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
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApis } from "@/lib/courseApis";
import { ContentType } from "@lms/shared-types";

export function CourseContentTab({ courseId }: { courseId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("title", contentTitle);
      formData.append("description", contentDesc);
      formData.append("file", selectedFile);

      return await courseApis.uploadContent(courseId, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["learner-course-contents"] });
      setIsAddModalOpen(false);
      setContentTitle("");
      setContentDesc("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

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
      alert(err.response?.data?.message || "Failed to delete content");
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
                <Search className="h-4 w-4 text-slate-400" />
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

          <div className="rounded-md border border-slate-200">
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : contents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('No content found.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  contents.map((content: any, i: number) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium text-slate-500">
                        {(page - 1) * (meta?.itemsPerPage || 10) + i + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {content.title}
                        </div>
                        {content.description && (
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {content.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={content.contentType as any}
                          className="capitalize"
                        >
                          {content.contentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        onOpenChange={setIsAddModalOpen}
        title={t('Upload Content')}
        description={t('Add videos, PDFs, images, or presentations to this course.')}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('Title')}</label>
            <Input
              placeholder="e.g. Introduction Lecture"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('File')}</label>
            <Input
              type="file"
              accept="video/*,application/pdf,image/*,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-slate-500 mt-1">{t('Supported: Video, PDF, Image, PPTX')}</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('Description')}</label>
            <textarea
              className="w-full text-sm p-3 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Content description..."
              rows={3}
              value={contentDesc}
              onChange={(e) => setContentDesc(e.target.value)}
            />
          </div>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!selectedFile || !contentTitle}
            isLoading={uploadMutation.isPending}
            className="w-full"
          >
            <Upload className="me-2 h-4 w-4" /> {t('Upload Content')}
          </Button>
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
