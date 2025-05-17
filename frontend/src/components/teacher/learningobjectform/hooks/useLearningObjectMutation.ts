import { useMutation, UseMutationResult } from '@tanstack/react-query';
import {
  createLocalLearningObject,
  updateLocalLearningObject,
  LocalLearningObjectData,
  LearningObject,
} from '../../../../util/teacher/localLearningObjects';

export function useLearningObjectMutation(
  isEdit: boolean,
  onSuccess: () => void
): UseMutationResult<
  LearningObject,
  Error,
  { id?: string; data: LocalLearningObjectData }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      isEdit && id
        ? updateLocalLearningObject(id, data)
        : createLocalLearningObject(data),
    onSuccess,
  });
}
