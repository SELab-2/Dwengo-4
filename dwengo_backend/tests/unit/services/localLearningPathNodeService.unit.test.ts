import { beforeEach, describe, expect, it, vi } from "vitest";
import LocalLearningPathNodeService from "../../../services/localLearningPathNodeService";
import { dwengoAPI } from "../../../config/dwengoAPI";
import { mockDeep } from "vitest-mock-extended";
import prisma from "../../../config/prisma";
import { BadRequestError } from "../../../errors/errors";

vi.mock("../../../config/prisma", async () => {
  const { mockDeep } = await import("vitest-mock-extended");
  const prismaMock =
    mockDeep<typeof import("../../../config/prisma").default>();
  return { default: prismaMock };
});
vi.mock("../../../config/dwengoAPI", () => ({
  dwengoAPI: { get: vi.fn() },
}));

const pathId = "path123";
const nodeId = "node123";
const teacherId = 1;

// Create a deep mock transaction client
const mockTx = mockDeep<typeof prisma>();

beforeEach(() => {
  vi.clearAllMocks();

  // Zorg dat teacher toegang heeft tot pad
  (
    prisma.learningPath.findUnique as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    id: pathId,
    creatorId: teacherId,
  });

  // Prisma transactie: geef fake transaction context terug
  (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
    async (fn) => fn(mockTx),
  );

  // Belangrijk: dit wordt gebruikt in validateLocalObject() buiten transaction
  (
    prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
  ).mockResolvedValue({ id: "lo1" });
});

describe("LocalLearningPathNodeService", () => {
  it("creëert een lokale node", async () => {
    mockTx.learningPathNode.create.mockResolvedValue({ id: nodeId } as any);
    mockTx.learningPathNode.count.mockResolvedValue(1);
    mockTx.learningPath.update.mockResolvedValue({} as any);

    const result = await LocalLearningPathNodeService.createNodeForPath(
      teacherId,
      pathId,
      { isExternal: false, localLearningObjectId: "lo1", start_node: true },
    );

    expect(result).toBeDefined();
    expect(mockTx.learningPathNode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ learningPathId: pathId }),
    });
    expect(mockTx.learningPath.update).toHaveBeenCalledWith({
      where: { id: pathId },
      data: { num_nodes: 1 },
    });
  });

  it("creëert een externe node (Dwengo)", async () => {
    (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { someMeta: true },
    });
    mockTx.learningPathNode.create.mockResolvedValue({ id: nodeId } as any);
    mockTx.learningPathNode.count.mockResolvedValue(1);
    mockTx.learningPath.update.mockResolvedValue({} as any);

    const result = await LocalLearningPathNodeService.createNodeForPath(
      teacherId,
      pathId,
      {
        isExternal: true,
        dwengoHruid: "hr123",
        dwengoLanguage: "nl",
        dwengoVersion: 1,
      },
    );

    expect(dwengoAPI.get).toHaveBeenCalledWith(
      `/api/learningObject/getMetadata?hruid=hr123&language=nl&version=1`,
    );
    expect(result.id).toBe(nodeId);
  });

  it("verwijdert een node met node count update", async () => {
    (
      prisma.learningPathNode.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ nodeId, learningPathId: pathId });
    mockTx.learningPathNode.delete.mockResolvedValue({} as any);
    mockTx.learningPathNode.count.mockResolvedValue(0);
    mockTx.learningPath.update.mockResolvedValue({} as any);

    await LocalLearningPathNodeService.deleteNodeFromPath(
      teacherId,
      pathId,
      nodeId,
    );

    expect(mockTx.learningPathNode.delete).toHaveBeenCalledWith({
      where: { nodeId },
    });
    expect(mockTx.learningPath.update).toHaveBeenCalledWith({
      where: { id: pathId },
      data: { num_nodes: 0 },
    });
  });

  it("gooit een error als node niet bij leerpad hoort", async () => {
    (
      prisma.learningPathNode.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ nodeId, learningPathId: "ANDER_PAD_ID" });

    await expect(
      LocalLearningPathNodeService.updateNodeForPath(
        teacherId,
        pathId,
        nodeId,
        { isExternal: false, localLearningObjectId: "lo123" },
      ),
    ).rejects.toThrow(BadRequestError);
    await expect(
      LocalLearningPathNodeService.updateNodeForPath(
        teacherId,
        pathId,
        nodeId,
        { isExternal: false, localLearningObjectId: "lo123" },
      ),
    ).rejects.toThrow("Node is not a part of this learning path.");
  });
});
