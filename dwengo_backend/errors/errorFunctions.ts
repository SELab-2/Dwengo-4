import { Prisma } from "@prisma/client";
import {
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
    console.error("Prisma error:", error);
    throw new DatabaseError("Something went wrong.");
  }
}

/**
 * This function is used to handle prisma transactions.
 * If the transaction fails, the error will be thrown as a DatabaseError with the same message.
 * If the transaction does not have a clear error message, a generic DatabaseError will be thrown.
 */
export async function handlePrismaTransaction<T>(
  prisma: Prisma.TransactionClient,
  transactionFunction: (_: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await transactionFunction(prisma);
  } catch (error) {
    console.error("Prisma transaction error:", error);
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
