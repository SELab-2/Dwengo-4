import { describe, it, expect, vi, beforeEach } from 'vitest'
import FeedbackService from '../../../services/feedbackService'
import prisma from '../../../config/prisma'

// Typecast mocks correct
const mockFindFirstTeacher = prisma.teacher.findFirst as unknown as ReturnType<typeof vi.fn>
const mockFeedbackFindMany = prisma.feedback.findMany as unknown as ReturnType<typeof vi.fn>
const mockFeedbackCreate = prisma.feedback.create as unknown as ReturnType<typeof vi.fn>
const mockFeedbackFindUnique = prisma.feedback.findUnique as unknown as ReturnType<typeof vi.fn>
const mockFeedbackUpdate = prisma.feedback.update as unknown as ReturnType<typeof vi.fn>
const mockFeedbackDelete = prisma.feedback.delete as unknown as ReturnType<typeof vi.fn>
const mockAssignmentFindFirst = prisma.assignment.findFirst as unknown as ReturnType<typeof vi.fn>

// Global mock override
vi.mock('../../../config/prisma', () => ({
  default: {
    teacher: {
      findFirst: vi.fn(),
    },
    feedback: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    assignment: {
      findFirst: vi.fn(),
    },
  },
}))

describe('FeedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // === hasAssignmentRights ===
  describe('hasAssignmentRights', () => {
    it('retourneert true als teacher rechten heeft', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      const result = await FeedbackService.hasAssignmentRights(10, 1)
      expect(result).toBe(true)
    })

    it('retourneert false als teacher geen rechten heeft', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)
      const result = await FeedbackService.hasAssignmentRights(10, 1)
      expect(result).toBe(false)
    })
  })

  // === hasSubmissionRights ===
  describe('hasSubmissionRights', () => {
    it('retourneert true als teacher rechten heeft op submission', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      const result = await FeedbackService.hasSubmissionRights(1, 99)
      expect(result).toBe(true)
    })

    it('retourneert false als teacher geen rechten heeft op submission', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)
      const result = await FeedbackService.hasSubmissionRights(1, 99)
      expect(result).toBe(false)
    })
  })

  // === getAllFeedbackForEvaluation ===
  describe('getAllFeedbackForEvaluation', () => {
    it('retourneert feedbacklijst als rechten ok zijn', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      mockFeedbackFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await FeedbackService.getAllFeedbackForEvaluation(10, 'ev123', 1)
      expect(result).toHaveLength(2)
    })

    it('gooit error bij onvoldoende rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)

      await expect(FeedbackService.getAllFeedbackForEvaluation(1, 'ev123', 1)).rejects.toThrow(
        'The teacher is unauthorized to perform this action'
      )
    })
  })

  // === createFeedback ===
  describe('createFeedback', () => {
    it('maakt feedback aan als alles ok is', async () => {
      mockFindFirstTeacher
        .mockResolvedValueOnce({ userId: 1 }) // hasSubmissionRights
        .mockResolvedValueOnce(null) // geen toekomstige deadline
      mockAssignmentFindFirst.mockResolvedValue(null)
      mockFeedbackCreate.mockResolvedValue({ id: 1, description: 'Top' })

      const result = await FeedbackService.createFeedback(5, 1, 'Top')
      expect(result).toEqual({ id: 1, description: 'Top' })
    })

    it('gooit error als teacher geen rechten heeft', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)

      await expect(FeedbackService.createFeedback(5, 1, 'Nope')).rejects.toThrow(
        'The teacher is unauthorized to perform this action'
      )
    })

    it('gooit error als deadline in toekomst ligt', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      mockAssignmentFindFirst.mockResolvedValue({ id: 99 })

      await expect(FeedbackService.createFeedback(5, 1, 'Nice')).rejects.toThrow(
        'Deadline in toekomst'
      )
    })
  })

  // === getFeedbackForSubmission ===
  describe('getFeedbackForSubmission', () => {
    it('retourneert feedback als rechten ok zijn', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      mockFeedbackFindUnique.mockResolvedValue({ id: 1, submissionId: 5 })

      const result = await FeedbackService.getFeedbackForSubmission(5, 1)
      expect(result).toEqual({ id: 1, submissionId: 5 })
    })

    it('gooit error bij onvoldoende rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)

      await expect(FeedbackService.getFeedbackForSubmission(5, 1)).rejects.toThrow(
        'The teacher is unauthorized to perform this action'
      )
    })
  })

  // === updateFeedbackForSubmission ===
  describe('updateFeedbackForSubmission', () => {
    it('werkt bij geldige rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      mockFeedbackUpdate.mockResolvedValue({ id: 1, description: 'Updated' })

      const result = await FeedbackService.updateFeedbackForSubmission(5, 'Updated', 1)
      expect(result).toEqual({ id: 1, description: 'Updated' })
    })

    it('gooit error bij onvoldoende rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)

      await expect(
        FeedbackService.updateFeedbackForSubmission(5, 'x', 1)
      ).rejects.toThrow('The teacher is unauthorized to perform this action')
    })
  })

  // === deleteFeedbackForSubmission ===
  describe('deleteFeedbackForSubmission', () => {
    it('verwijdert feedback bij geldige rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue({ userId: 1 })
      mockFeedbackDelete.mockResolvedValue({ id: 99 })

      const result = await FeedbackService.deleteFeedbackForSubmission(5, 1)
      expect(result).toEqual({ id: 99 })
    })

    it('gooit error bij onvoldoende rechten', async () => {
      mockFindFirstTeacher.mockResolvedValue(null)

      await expect(FeedbackService.deleteFeedbackForSubmission(5, 1)).rejects.toThrow(
        'The teacher is unauthorized to perform this action'
      )
    })
  })
})
