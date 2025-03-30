import { Prisma } from "@prisma/client";
import { DatabaseError } from "./errors";

async function handlePrismaQuery<T>(
  queryFunction: () => Promise<T>,
): Promise<T> {
  try {
    return await queryFunction();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      // Handle prisma errors that have clear error messages
      // Throw a new error, this error will propagate up the call stack and be caught by the error middleware.
      throw new DatabaseError(error.message);
    } else {
      throw new DatabaseError("An unknown error occurred.");
    }
  }
}

export default handlePrismaQuery;
