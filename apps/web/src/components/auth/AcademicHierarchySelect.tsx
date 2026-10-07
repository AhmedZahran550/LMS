'use client';

import React, { useEffect, useMemo } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/SearchableSelect';
import { UserRole } from '@lms/shared-types';
import { useAcademicHierarchy } from '@/hooks/useAcademicHierarchy';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';

interface AcademicHierarchySelectProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  role: UserRole;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function AcademicHierarchySelect({
  register,
  errors,
  role,
  setValue,
  watch,
}: AcademicHierarchySelectProps) {
  const { t } = useTranslation();
  const { universities, isLoading, error, refetch } = useAcademicHierarchy();

  const selectedUniversityId = watch('universityId');
  const selectedFaculty = watch('faculty');

  const selectedUniversity = useMemo(
    () => universities.find((u: any) => u.id === selectedUniversityId),
    [universities, selectedUniversityId]
  );

  const facultyOptions: SearchableSelectOption[] = useMemo(() => {
    if (!selectedUniversity) return [];
    return selectedUniversity.faculties.map((f: any) => ({
      value: f.name,
      label: f.name,
    }));
  }, [selectedUniversity]);

  const departmentOptions: SearchableSelectOption[] = useMemo(() => {
    if (!selectedUniversity || !selectedFaculty) return [];
    const faculty = selectedUniversity.faculties.find((f: any) => f.name === selectedFaculty);
    if (!faculty) return [];
    return faculty.departments.map((d: any) => ({
      value: d.name,
      label: d.name,
    }));
  }, [selectedUniversity, selectedFaculty]);

  const yearOptions: SearchableSelectOption[] = useMemo(() => {
    if (!selectedUniversity || !selectedFaculty) return [];
    const faculty = selectedUniversity.faculties.find((f: any) => f.name === selectedFaculty);
    if (!faculty) return [];
    return faculty.years.map((y: any) => ({
      value: y.name,
      label: y.name,
    }));
  }, [selectedUniversity, selectedFaculty]);

  useEffect(() => {
    if (selectedUniversityId) {
      const stillExists = universities.some((u) => u.id === selectedUniversityId);
      if (!stillExists) {
        setValue('universityId', '');
        setValue('faculty', '');
        setValue('department', '');
        setValue('year', '');
      }
    }
  }, [universities, selectedUniversityId, setValue]);

  useEffect(() => {
    if (selectedUniversity && selectedFaculty) {
      const facultyExists = selectedUniversity.faculties.some((f) => f.name === selectedFaculty);
      if (!facultyExists) {
        setValue('faculty', '');
        setValue('department', '');
        setValue('year', '');
      }
    }
  }, [selectedUniversity, selectedFaculty, setValue]);

  useEffect(() => {
    if (selectedUniversity && selectedFaculty) {
      const faculty = selectedUniversity.faculties.find((f) => f.name === selectedFaculty);
      if (faculty) {
        const deptExists = faculty.departments.some((d) => d.name === watch('department'));
        if (!deptExists) {
          setValue('department', '');
          setValue('year', '');
        }
      }
    }
  }, [selectedUniversity, selectedFaculty, setValue, watch]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--sv-text-primary)]">
          {t('auth.academicHierarchy.title')}
        </label>
        <div className="flex items-center gap-2 rounded-md border border-[var(--sv-border)] px-3 py-2 text-sm text-[var(--sv-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('auth.academicHierarchy.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--sv-text-primary)]">
          {t('auth.academicHierarchy.title')}
        </label>
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{t('auth.academicHierarchy.error')}</span>
          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-800"
          >
            <RotateCcw className="h-3 w-3" />
            {t('auth.academicHierarchy.retry')}
          </button>
        </div>
      </div>
    );
  }

  const universityOptions: SearchableSelectOption[] = universities.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-[var(--sv-text-primary)]">
        {t('auth.academicHierarchy.title')}
      </label>

      <div className="space-y-1.5">
        <SearchableSelect
          options={universityOptions}
          value={watch('universityId')}
          onChange={(val) => {
            setValue('universityId', val);
            setValue('faculty', '');
            setValue('department', '');
            setValue('year', '');
          }}
          placeholder={t('auth.university.select')}
          disabled={isLoading}
          error={!!errors.universityId}
        />
        {errors.universityId && (
          <p className="text-xs text-red-500 mt-1">{errors.universityId.message?.toString()}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <SearchableSelect
          options={facultyOptions}
          value={watch('faculty')}
          onChange={(val) => {
            setValue('faculty', val);
            setValue('department', '');
            setValue('year', '');
          }}
          placeholder={t('auth.faculty.select')}
          disabled={!selectedUniversityId}
          error={!!errors.faculty}
        />
        {errors.faculty && (
          <p className="text-xs text-red-500 mt-1">{errors.faculty.message?.toString()}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <SearchableSelect
          options={departmentOptions}
          value={watch('department')}
          onChange={(val) => {
            setValue('department', val);
            setValue('year', '');
          }}
          placeholder={t('auth.department.select')}
          disabled={!selectedFaculty}
          error={!!errors.department}
        />
        {errors.department && (
          <p className="text-xs text-red-500 mt-1">{errors.department.message?.toString()}</p>
        )}
      </div>

      {role === UserRole.LEARNER && (
        <div className="space-y-1.5">
          <SearchableSelect
            options={yearOptions}
            value={watch('year') || ''}
            onChange={(val) => setValue('year', val)}
            placeholder={t('auth.year.select')}
            disabled={!selectedFaculty}
            error={!!errors.year}
          />
          {errors.year && (
            <p className="text-xs text-red-500 mt-1">{errors.year.message?.toString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
