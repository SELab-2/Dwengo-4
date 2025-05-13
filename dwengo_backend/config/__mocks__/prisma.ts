import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";

const prisma = mockDeep<PrismaClient>();

// Auto-reset alle mocks vóór elke test
import { beforeEach } from "vitest";
beforeEach(() => {
  mockReset(prisma);
});

export default prisma;
