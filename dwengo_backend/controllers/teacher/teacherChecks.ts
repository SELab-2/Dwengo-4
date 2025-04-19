import { AccessDeniedError } from "../../errors/errors";

// I have to disable the linter for this enum because it doesn't recognize that
// these enums are used in other files. It only checks if it is used in the same file.
export enum Property {
  // eslint-disable-next-line no-unused-vars
  LearningObject = "learning object",
  // eslint-disable-next-line no-unused-vars
  LearningPath = "learning path",
}

/**
 * Check if a teacher is the creator of a learning object.
 */
export const checkIfTeacherIsCreator = function (
  teacherId: number,
  loCreatorId: number,
  property: Property,
) {
  if (teacherId !== loCreatorId) {
    throw new AccessDeniedError(
      `Teacher is not the creator of this ${property}.`,
    );
  }
};
