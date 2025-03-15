import { afterAll, beforeEach } from "vitest";
import resetDb from "./reset-db";

beforeEach(async (): Promise<void> => {
  await resetDb();
});

afterAll(async (): Promise<void> => {
  await resetDb();
});
