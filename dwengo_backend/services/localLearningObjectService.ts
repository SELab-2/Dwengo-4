import { ContentType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface LocalLearningObjectData {
  // De data die een teacher kan opgeven bij het aanmaken of updaten
  title: string;
  description: string;
  contentType: ContentType; // bv. "text/markdown", "interactive/quiz", ...
  keywords?: Array<string>; // komma-gescheiden of JSON
  targetAges?: Array<number>; // idem
  teacherExclusive?: boolean;
  skosConcepts?: Array<string>;
  copyright?: string;
  licence?: string;
  difficulty?: number;
  estimatedTime?: number;
  available?: boolean;
  contentLocation?: string;
}

export default class LocalLearningObjectService {
  /**
   * Maakt een nieuw leerobject aan in onze eigen databank.
   * Genereert een UUID voor het veld 'id' (Prisma-model heeft id: String @id).
   */
  static async createLearningObject(
    teacherId: number,
    data: LocalLearningObjectData
  ) {
    // Prisma create
    const newObject = await prisma.learningObject.create({
      data: {
        hruid: `${data.title.toLowerCase()}-${Date.now()}`,
        language: "nl", // Kan ook dynamisch
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        keywords: data.keywords ?? [],
        targetAges: data.targetAges ?? [],
        teacherExclusive: data.teacherExclusive ?? false,
        skosConcepts: data.skosConcepts ?? [],
        copyright: data.copyright ?? "",
        licence: data.licence ?? "CC BY Dwengo",
        difficulty: data.difficulty ?? 1,
        estimatedTime: data.estimatedTime ?? 0,
        available: data.available ?? true,
        contentLocation: data.contentLocation ?? "",
        creatorId: teacherId,
      },
    });

    return newObject;
  }

  /**
   * Geeft alle leerobjecten terug die door een bepaalde teacher zijn aangemaakt.
   * Of (afhankelijk van je wensen) alle leerobjecten in de DB als je dat wilt.
   */
  static async getAllLearningObjectsByTeacher(teacherId: number) {
    const objects = await prisma.learningObject.findMany({
      where: { creatorId: teacherId },
      orderBy: { createdAt: "desc" },
    });
    return objects;
  }

  /**
   * Haalt één leerobject op. Optioneel kun je checken of de aanvrager
   * wel de creator is, als je dat in de controller wilt enforce'n.
   */
  static async getLearningObjectById(id: string) {
    return prisma.learningObject.findUnique({
      where: { id },
    });
  }

  /**
   * Update van een bestaand leerobject. We gaan ervan uit dat je al
   * gecontroleerd hebt of de teacher mag updaten (bv. of teacherId === creatorId).
   */
  static async updateLearningObject(
    id: string,
    data: Partial<LocalLearningObjectData>
  ) {
    // Prisma update
    return prisma.learningObject.update({
      where: { id },
      data: {
        // Als we hruid gelijk stellen aan de titel, dan zal hruid hier ook moeten aangepast worden.

        title: data.title,
        description: data.description,
        contentType: data.contentType,
        keywords: data.keywords,
        targetAges: data.targetAges,
        teacherExclusive: data.teacherExclusive,
        skosConcepts: data.skosConcepts,
        copyright: data.copyright,
        licence: data.licence,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        available: data.available,
        contentLocation: data.contentLocation,
      },
    });
  }

  /**
   * Verwijdert een leerobject op basis van zijn id.
   */
  static async deleteLearningObject(id: string) {
    return prisma.learningObject.delete({
      where: { id },
    });
  }
}
