import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
// Auto-reset alle mocks vóór elke test
import { beforeEach } from "vitest";

const prisma = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prisma);
});

export default prisma;
