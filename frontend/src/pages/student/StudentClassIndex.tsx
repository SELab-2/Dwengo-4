import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AssignmentsForClassOverview from '../../components/student/AssignmentClassOverview';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClassItem } from '../../types/type';
import { useTranslation } from 'react-i18next';
import { fetchClass, fetchLeaveClass } from '@/util/student/class';

const StudentClassIndex: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { classId } = useParams<{ classId: string }>();

  const {
    data: classItem,
    isLoading,
    isError,
    error,
  } = useQuery<ClassItem>({
    queryKey: ['classItem', classId],
    queryFn: () => fetchClass({ classId: classId }),
  });

  const handleLeaveClass = async () => {
    if (window.confirm(t('classes.leave_class.confirmation'))) {
      try {
        const response = await fetchLeaveClass({ classId: classId });

        queryClient.invalidateQueries({ queryKey: ['classes'] });
        navigate('/student');
      } catch (error) {
        console.error('Fout bij het verwijderen van de klas:', error);
      }
    }
  };

  return (
    <>
      <div className="px-10">
        <div className="flex flex-row justify-between items-end pr-10">
          <div className="text-6xl pt-12 font-bold">
            {isLoading && <p>{t('loading.loading')}</p>}
            {isError && (
              <p className="c-r">
                {error?.info?.message || t('classes.error')}
              </p>
            )}
            {!isLoading && !isError && classItem && classItem.name}
          </div>
          <button
            onClick={handleLeaveClass}
            className="font-bold hover:cursor-pointer hover:underline"
          >
            {t('classes.leave_class.label')}
          </button>
        </div>
        <h2 className="mt-8 text-2xl font-bold">{t('assignments.label')}</h2>
        <div className="w-full mt-4 ">
          <AssignmentsForClassOverview classId={classId} />
        </div>
      </div>
    </>
  );
};

export default StudentClassIndex;
