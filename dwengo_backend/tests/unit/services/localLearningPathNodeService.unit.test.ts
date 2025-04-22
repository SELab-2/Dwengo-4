import { describe, it, expect, vi, beforeEach } from "vitest";
import LocalLearningPathNodeService from "../../../services/localLearningPathNodeService";
import prisma from "../../../config/prisma";
import { dwengoAPI } from "../../../config/dwengoAPI";

vi.mock("../../../config/prisma", () => ({
  default: {
    learningPath: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    learningPathNode: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    learningObject: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((fn) => fn(prisma)),
  },
}));

vi.mock("../../../config/dwengoAPI", () => ({
  dwengoAPI: {
    get: vi.fn(),
  },
}));

const pathId = "path123";
const nodeId = "node123";
const teacherId = 1;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.learningPath.findUnique).mockResolvedValue({
    id: pathId,
    creatorId: teacherId,
  });
});

describe("LocalLearningPathNodeService", () => {
  it("haalt alle nodes voor een leerpad op", async () => {
    vi.mocked(prisma.learningPathNode.findMany).mockResolvedValue([]);

    const result = await LocalLearningPathNodeService.getAllNodesForPath(
      teacherId,
      pathId
    );

    expect(prisma.learningPathNode.findMany).toHaveBeenCalledWith({
      where: { learningPathId: pathId },
      orderBy: { createdAt: "asc" },
    });

    expect(result).toEqual([]);
  });

  it("creëert een lokale node", async () => {
    vi.mocked(prisma.learningObject.findUnique).mockResolvedValue({ id: "lo1" });
    vi.mocked(prisma.learningPathNode.create).mockResolvedValue({ id: nodeId });
    vi.mocked(prisma.learningPathNode.count).mockResolvedValue(1);
    vi.mocked(prisma.learningPath.update).mockResolvedValue({});

    const result = await LocalLearningPathNodeService.createNodeForPath(
      teacherId,
      pathId,
      {
        isExternal: false,
        localLearningObjectId: "lo1",
        start_node: true,
      }
    );

    expect(result).toBeDefined();
    expect(prisma.learningPathNode.create).toHaveBeenCalled();
    expect(prisma.learningPath.update).toHaveBeenCalledWith({
      where: { id: pathId },
      data: { num_nodes: 1 },
    });
  });

  it("creëert een externe node (Dwengo)", async () => {
    vi.mocked(dwengoAPI.get).mockResolvedValue({ data: { someMeta: true } });
    vi.mocked(prisma.learningPathNode.create).mockResolvedValue({ id: nodeId });
    vi.mocked(prisma.learningPathNode.count).mockResolvedValue(1);
    vi.mocked(prisma.learningPath.update).mockResolvedValue({});

    const result = await LocalLearningPathNodeService.createNodeForPath(
      teacherId,
      pathId,
      {
        isExternal: true,
        dwengoHruid: "hr123",
        dwengoLanguage: "nl",
        dwengoVersion: 1,
      }
    );

    expect(dwengoAPI.get).toHaveBeenCalled();
    expect(result.id).toBe(nodeId);
  });

  it("updatet een node (switch lokaal ➡️ extern)", async () => {
    vi.mocked(prisma.learningPathNode.findUnique).mockResolvedValue({
      nodeId,
      learningPathId: pathId,
      isExternal: false,
      localLearningObjectId: "lo1",
    });

    vi.mocked(dwengoAPI.get).mockResolvedValue({ data: { ok: true } });
    vi.mocked(prisma.learningPathNode.update).mockResolvedValue({ nodeId });

    const result = await LocalLearningPathNodeService.updateNodeForPath(
      teacherId,
      pathId,
      nodeId,
      {
        isExternal: true,
        dwengoHruid: "hr123",
        dwengoLanguage: "nl",
        dwengoVersion: 2,
      }
    );

    expect(result.nodeId).toBe(nodeId);
    expect(prisma.learningPathNode.update).toHaveBeenCalled();
  });

  it("verwijdert een node met node count update", async () => {
    vi.mocked(prisma.learningPathNode.findUnique).mockResolvedValue({
      nodeId,
      learningPathId: pathId,
    });
    vi.mocked(prisma.learningPathNode.count).mockResolvedValue(0);
    vi.mocked(prisma.learningPathNode.delete).mockResolvedValue({});
    vi.mocked(prisma.learningPath.update).mockResolvedValue({});

    await LocalLearningPathNodeService.deleteNodeFromPath(teacherId, pathId, nodeId);

    expect(prisma.learningPathNode.delete).toHaveBeenCalledWith({ where: { nodeId } });
    expect(prisma.learningPath.update).toHaveBeenCalledWith({
      where: { id: pathId },
      data: { num_nodes: 0 },
    });
  });

  it("gooit een error als node niet bij leerpad hoort", async () => {
    vi.mocked(prisma.learningPathNode.findUnique).mockResolvedValue({
      nodeId,
      learningPathId: "ANDER_PAD_ID",
    });

    await expect(
      LocalLearningPathNodeService.updateNodeForPath(teacherId, pathId, nodeId, {
        isExternal: false,
        localLearningObjectId: "lo123",
      })
    ).rejects.toThrow("Node hoort niet bij dit leerpad.");
  });
});
