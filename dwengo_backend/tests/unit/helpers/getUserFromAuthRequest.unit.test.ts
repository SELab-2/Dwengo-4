import { describe, it, expect } from 'vitest'
import { getUserFromAuthRequest } from '../../../helpers/getUserFromAuthRequest'
import { UnauthorizedError } from '../../../errors/errors'
import { Role } from '@prisma/client'
import { AuthenticatedRequest } from '../../../interfaces/extendedTypeInterfaces'

// Mock: Geldige request
const validReq = {
  user: {
    id: 1,
    email: 'test@example.com',
    role: Role.STUDENT,
    teacher: undefined,
    student: { klas: 'X' }
  }
} as unknown as AuthenticatedRequest

describe('getUserFromAuthRequest', () => {
  it('retourneert correct als user object geldig is', () => {
    const user = getUserFromAuthRequest(validReq)

    expect(user).toMatchObject({
      id: 1,
      email: 'test@example.com',
      role: Role.STUDENT,
      student: { klas: 'X' }
    })
  })

  it('gooit UnauthorizedError als req.user ontbreekt', () => {
    const req = {} as AuthenticatedRequest

    expect(() => getUserFromAuthRequest(req)).toThrowError(UnauthorizedError)
    expect(() => getUserFromAuthRequest(req)).toThrow('Authentication required')
  })

  it('gooit UnauthorizedError bij ongeldige user structuur (ontbrekende email)', () => {
    const req = {
      user: {
        id: 1
        // email ontbreekt
      }
    } as AuthenticatedRequest

    expect(() => getUserFromAuthRequest(req)).toThrowError(UnauthorizedError)
    expect(() => getUserFromAuthRequest(req)).toThrow('Invalid user object in request')
  })

  it('gooit UnauthorizedError bij ongeldige email structuur', () => {
    const req = {
      user: {
        id: 1,
        email: 'not-an-email'
      }
    } as AuthenticatedRequest

    expect(() => getUserFromAuthRequest(req)).toThrowError(UnauthorizedError)
    expect(() => getUserFromAuthRequest(req)).toThrow('Invalid user object in request')
  })

  it('accepteert ook users zonder role/teacher/student', () => {
    const req = {
      user: {
        id: 42,
        email: 'user@school.com'
      }
    } as AuthenticatedRequest

    const parsed = getUserFromAuthRequest(req)
    expect(parsed).toMatchObject({ id: 42, email: 'user@school.com' })
  })
})
