import { describe, it, expect, vi, beforeEach } from 'vitest'
import StudentService from '../../../services/studentService'
import prisma from '../../../config/prisma'

// Prisma mocking setup
vi.mock('../../../config/prisma', () => ({
  default: {
    student: {
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
    },
    class: {
      findUnique: vi.fn(),
    },
  },
}))

describe('StudentService', () => {
  const mockFindUniqueOrThrow = prisma.student.findUniqueOrThrow as unknown as ReturnType<typeof vi.fn>
  const mockFindMany = prisma.student.findMany as unknown as ReturnType<typeof vi.fn>
  const mockClassFindUnique = prisma.class.findUnique as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // === findStudentById ===
  describe('findStudentById', () => {
    it('retourneert student met gekoppelde user als ID bestaat', async () => {
      const mockStudent = {
        userId: 1,
        user: {
          email: 'student@example.com',
        },
      }
      mockFindUniqueOrThrow.mockResolvedValue(mockStudent)

      const result = await StudentService.findStudentById(1)
      expect(result).toEqual(mockStudent)
      expect(mockFindUniqueOrThrow).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      })
    })

    it('gooit error door als student niet gevonden wordt', async () => {
      mockFindUniqueOrThrow.mockRejectedValue(new Error('Not found'))

      await expect(StudentService.findStudentById(999)).rejects.toThrow('Not found')
    })
  })

  // === getStudentsByClass ===
  describe('getStudentsByClass', () => {
    it('retourneert studenten gekoppeld aan klas', async () => {
      const classData = {
        classLinks: [
          { student: { userId: 1, user: { email: 's1@test.com' } } },
          { student: { userId: 2, user: { email: 's2@test.com' } } },
        ],
      }

      mockClassFindUnique.mockResolvedValue(classData)

      const result = await StudentService.getStudentsByClass(100)

      expect(result).toEqual([
        { userId: 1, user: { email: 's1@test.com' } },
        { userId: 2, user: { email: 's2@test.com' } },
      ])

      expect(mockClassFindUnique).toHaveBeenCalledWith({
        where: { id: 100 },
        include: {
          classLinks: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      })
    })

    it('gooit error als klas niet bestaat', async () => {
      mockClassFindUnique.mockResolvedValue(null)

      await expect(StudentService.getStudentsByClass(999)).rejects.toThrow(
        'Class with ID: 999 not found'
      )
    })
  })

  // === getStudentsByTeamAssignment ===
  describe('getStudentsByTeamAssignment', () => {
    it('retourneert studenten die deel uitmaken van team & assignment', async () => {
      const mockStudents = [
        { userId: 1, user: { email: 's1@test.com' } },
        { userId: 2, user: { email: 's2@test.com' } },
      ]

      mockFindMany.mockResolvedValue(mockStudents)

      const result = await StudentService.getStudentsByTeamAssignment(10, 20)

      expect(result).toEqual(mockStudents)

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          Team: {
            some: {
              id: 20,
              teamAssignment: {
                assignmentId: 10,
              },
            },
          },
        },
        include: {
          user: true,
        },
      })
    })

    it('retourneert lege array als geen matches zijn', async () => {
      mockFindMany.mockResolvedValue([])

      const result = await StudentService.getStudentsByTeamAssignment(999, 888)
      expect(result).toEqual([])
    })

    it('gooit error als prisma faalt', async () => {
      mockFindMany.mockRejectedValue(new Error('Query failed'))

      await expect(StudentService.getStudentsByTeamAssignment(1, 2)).rejects.toThrow('Query failed')
    })
  })
})
