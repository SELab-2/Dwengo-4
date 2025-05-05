import { Prisma, PrismaClient } from "@prisma/client";
import {
  AppError,
  DatabaseError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  UnavailableError,
} from "./errors";

/**
 * Every prisma query should be wrapped in this function to handle prisma errors correctly.
 * If there is some sort of prisma error, this will be caught and a DatabaseError will be thrown.
 */

export async function handlePrismaQuery<T>(
  queryFunction: () => Promise<T>,
): Promise<T> {
  try {
    return await queryFunction();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError(
        "The resource you tried to update/delete was not found.",
      );
    }
    console.error("Prisma error:", error);
    throw new DatabaseError("Something went wrong.");
  }
}

type NullableQuery<T> = () => Promise<T | null>;

/**
 * Ensures the provided fetcher function returns a non-null entity.
 * If the entity is null, an error is thrown with the specified error message.
 *
 * @param {NullableQuery<T>} fetcher - A function that fetches the entity and may return null.
 * @param {string} [errorMessage="Entity not found"] - The error message to use if the entity is not found.
 * @return {Promise<T>} A promise that resolves to the fetched entity if it exists.
 * @throws {NotFoundError} If the fetched entity is null.
 */
export async function assertExists<T>(
  fetcher: NullableQuery<T>,
  errorMessage: string = "The entity you were trying to fetch/update/delete did not exist.",
): Promise<T> {
  const entity = await fetcher();
  if (entity === null) {
    throw new NotFoundError(errorMessage);
  }
  return entity;
}

/**
 * Handles a query function by ensuring the result is not null, throwing an error with the provided message if the result is null.
 *
 * @param {() => Promise<T | null>} queryFunction - A function that performs a query and returns a Promise resolving to the query result or null.
 * @param {string} errorMessage - The error message to be used if the query result is null.
 * @return {Promise<T>} A Promise resolving to the query result if it exists, or throwing an error if the result is null.
 */
export function handleQueryWithExistenceCheck<T>(
  queryFunction: () => Promise<T | null>,
  errorMessage: string,
): Promise<T> {
  return assertExists(() => handlePrismaQuery(queryFunction), errorMessage);
}

/**
 * This function is used to handle prisma transactions.
 * If the transaction fails, the error will be thrown as a DatabaseError with the same message.
 * If the transaction does not have a clear error message, a generic DatabaseError will be thrown.
 */
export async function handlePrismaTransaction<T>(
  prisma: PrismaClient,
  transactionFunction: (_: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(transactionFunction);
  } catch (error) {
    console.error("Prisma transaction error:", error);

    // Re-throw if it's already a known AppError (like NotFoundError)
    if (error instanceof AppError) {
      throw error;
    }

    // Otherwise wrap it in a DatabaseError
    throw new DatabaseError("Something went wrong.");
  }
}

/**
 * This function is used in a function where something is fetched from the Dwengo API.
 * The flow is that the fetch is done in a try catch block.
 * In the try block, there could be errors thrown. If these errors are thrown, the catch will catch them.
 * In the catch block, the error that are thrown in the try block should be rethrown. Only other errors should
 * get converted to NetworkErrors.
 */
export function throwCorrectNetworkError(
  error: Error,
  networkErrorMessage: string,
): void {
  if (
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError ||
    error instanceof UnavailableError
  ) {
    throw error;
  } else {
    throw new NetworkError(networkErrorMessage);
  }
}
