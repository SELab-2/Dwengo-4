import { afterAll, beforeEach } from "vitest";
import resetDb from "./reset-db";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
});
