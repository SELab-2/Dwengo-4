import { describe, it, expect, vi, beforeEach } from 'vitest'
import submissionService from '../../../services/submissionService'
import prisma from '../../../config/prisma'
import { AccesDeniedError } from '../../../errors/errors'

// === Mocks ===
const mockFindFirstTeam = prisma.team.findFirst as unknown as ReturnType<typeof vi.fn>
const mockSubmissionCreate = prisma.submission.create as unknown as ReturnType<typeof vi.fn>
const mockSubmissionFindMany = prisma.submission.findMany as unknown as ReturnType<typeof vi.fn>

// === Global prisma mock ===
vi.mock('../../../config/prisma', () => ({
  default: {
    team: {
      findFirst: vi.fn(),
    },
    submission: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('submissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // === createSubmission ===
  describe('createSubmission', () => {
    it('maakt een submission aan als student in team zit', async () => {
      mockFindFirstTeam.mockResolvedValue({ id: 5 })
      mockSubmissionCreate.mockResolvedValue({
        id: 1,
        evaluationId: 'ev123',
        teamId: 5,
        assignmentId: 10,
      })

      const result = await submissionService.createSubmission(1, 'ev123', 10)

      expect(result).toEqual({
        id: 1,
        evaluationId: 'ev123',
        teamId: 5,
        assignmentId: 10,
      })

      expect(mockSubmissionCreate).toHaveBeenCalledWith({
        data: {
          evaluationId: 'ev123',
          teamId: 5,
          assignmentId: 10,
        },
      })
    })

    it('gooit AccesDeniedError als student niet in team zit', async () => {
      mockFindFirstTeam.mockResolvedValue(null)

      await expect(
        submissionService.createSubmission(1, 'ev123', 10)
      ).rejects.toThrow(AccesDeniedError)
    })
  })

  // === getSubmissionsForAssignment ===
  describe('getSubmissionsForAssignment', () => {
    it('haalt submissions op voor student + assignment', async () => {
      const mockSubs = [{ id: 1 }, { id: 2 }]
      mockSubmissionFindMany.mockResolvedValue(mockSubs)

      const result = await submissionService.getSubmissionsForAssignment(10, 1)
      expect(result).toEqual(mockSubs)

      expect(mockSubmissionFindMany).toHaveBeenCalledWith({
        where: {
          assignmentId: 10,
          team: {
            students: {
              some: { userId: 1 },
            },
            teamAssignment: { assignmentId: 10 },
          },
        },
      })
    })

    it('retourneert lege array als geen submissions zijn', async () => {
      mockSubmissionFindMany.mockResolvedValue([])

      const result = await submissionService.getSubmissionsForAssignment(10, 99)
      expect(result).toEqual([])
    })
  })

  // === getSubmissionsForEvaluation ===
  describe('getSubmissionsForEvaluation', () => {
    it('haalt submissions op voor eval, student en assignment', async () => {
      const submissions = [{ id: 1 }]
      mockSubmissionFindMany.mockResolvedValue(submissions)

      const result = await submissionService.getSubmissionsForEvaluation(10, 'ev123', 1)
      expect(result).toEqual(submissions)

      expect(mockSubmissionFindMany).toHaveBeenCalledWith({
        where: {
          assignmentId: 10,
          evaluationId: 'ev123',
          team: {
            students: { some: { userId: 1 } },
            teamAssignment: { assignmentId: 10 },
          },
        },
      })
    })

    it('retourneert lege array bij geen match', async () => {
      mockSubmissionFindMany.mockResolvedValue([])
      const result = await submissionService.getSubmissionsForEvaluation(1, 'evXXX', 2)
      expect(result).toEqual([])
    })
  })

  // === teacherGetSubmissionsForStudent ===
  describe('teacherGetSubmissionsForStudent', () => {
    it('geeft submissions als teacher toegang heeft', async () => {
      const mockData = [{ id: 1 }]
      mockSubmissionFindMany.mockResolvedValue(mockData)

      const result = await submissionService.teacherGetSubmissionsForStudent(5, 2, 10)
      expect(result).toEqual(mockData)

      expect(mockSubmissionFindMany).toHaveBeenCalledWith({
        where: {
          team: {
            students: {
              some: { userId: 5 },
            },
          },
          assignment: {
            id: 10,
            classAssignments: {
              some: {
                class: {
                  ClassTeacher: {
                    some: { teacherId: 2 },
                  },
                },
              },
            },
          },
        },
      })
    })

    it('retourneert lege array als niets gevonden', async () => {
      mockSubmissionFindMany.mockResolvedValue([])
      const result = await submissionService.teacherGetSubmissionsForStudent(1, 1, 1)
      expect(result).toEqual([])
    })
  })

  // === teacherGetSubmissionsForTeam ===
  describe('teacherGetSubmissionsForTeam', () => {
    it('geeft submissions van team met teacher toegang', async () => {
      const subs = [{ id: 101 }]
      mockSubmissionFindMany.mockResolvedValue(subs)

      const result = await submissionService.teacherGetSubmissionsForTeam(4, 3, 10)
      expect(result).toEqual(subs)

      expect(mockSubmissionFindMany).toHaveBeenCalledWith({
        where: {
          team: { id: 4 },
          assignment: {
            id: 10,
            classAssignments: {
              some: {
                class: {
                  ClassTeacher: {
                    some: { teacherId: 3 },
                  },
                },
              },
            },
          },
        },
      })
    })

    it('retourneert lege array bij geen match', async () => {
      mockSubmissionFindMany.mockResolvedValue([])
      const result = await submissionService.teacherGetSubmissionsForTeam(1, 2, 3)
      expect(result).toEqual([])
    })
  })
})
