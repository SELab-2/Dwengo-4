import { describe, expect, it, vi, beforeEach } from 'vitest';
import ReferenceValidationService from '../../../services/referenceValidationService';
import prisma from '../../../config/prisma';
import { dwengoAPI } from '../../../config/dwengoAPI';

vi.mock('../../../config/prisma');
vi.mock('../../../config/dwengoAPI', () => ({
  dwengoAPI: {
    get: vi.fn(),
  },
}));

describe('ReferenceValidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== LEEROBJECT LOCAL ==========
  describe('validateLocalLearningObject', () => {
    it('should resolve if learning object exists', async () => {
      (prisma.learningObject.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'abc123' });

      await expect(
        ReferenceValidationService.validateLocalLearningObject('abc123')
      ).resolves.toBeUndefined();
    });

    it('should throw error if learning object does not exist', async () => {
      (prisma.learningObject.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        ReferenceValidationService.validateLocalLearningObject('not-found')
      ).rejects.toThrow("Lokaal leerobject 'not-found' niet gevonden.");
    });
  });

  // ========== LEEROBJECT EXTERN ==========
  describe('validateDwengoLearningObject', () => {
    it('should resolve if valid data received from Dwengo API', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { title: 'object title' } });

      await expect(
        ReferenceValidationService.validateDwengoLearningObject('abc', 'nl', 1)
      ).resolves.toBeUndefined();
    });

    it('should throw error if Dwengo API returns 404', async () => {
      const error = { response: { status: 404 } };
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(
        ReferenceValidationService.validateDwengoLearningObject('notfound', 'nl', 2)
      ).rejects.toThrow('Dwengo leerobject hruid=notfound,language=nl,version=2 niet gevonden (404).');
    });

    it('should throw error if Dwengo API throws other error', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Connection error'));

      await expect(
        ReferenceValidationService.validateDwengoLearningObject('abc', 'nl', 1)
      ).rejects.toThrow('Fout bij Dwengo-check: Connection error');
    });

    it('should throw error if response is missing data', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null });

      await expect(
        ReferenceValidationService.validateDwengoLearningObject('abc', 'nl', 1)
      ).rejects.toThrow('Dwengo leerobject hruid=abc,language=nl,version=1 => geen data ontvangen.');
    });
  });

  // ========== LEEROBJECT WRAPPER ==========
  describe('validateLearningObject (wrapper)', () => {
    it('should call validateDwengoLearningObject for external object', async () => {
      const spy = vi.spyOn(ReferenceValidationService, 'validateDwengoLearningObject').mockResolvedValue();

      await ReferenceValidationService.validateLearningObject(true, undefined, 'abc', 'nl', 1);
      expect(spy).toHaveBeenCalledWith('abc', 'nl', 1);
    });

    it('should throw error if dwengo fields are missing', async () => {
      await expect(
        ReferenceValidationService.validateLearningObject(true)
      ).rejects.toThrow('Missing Dwengo leerobject referenties (hruid/language/version)');
    });

    it('should call validateLocalLearningObject for local object', async () => {
      const spy = vi.spyOn(ReferenceValidationService, 'validateLocalLearningObject').mockResolvedValue();

      await ReferenceValidationService.validateLearningObject(false, 'abc');
      expect(spy).toHaveBeenCalledWith('abc');
    });

    it('should throw error if localId missing', async () => {
      await expect(
        ReferenceValidationService.validateLearningObject(false)
      ).rejects.toThrow('Missing localId voor niet-externe leerobjectvalidatie');
    });
  });

  // ========== LEERPAD LOCAL ==========
  describe('validateLocalLearningPath', () => {
    it('should resolve if learning path exists', async () => {
      (prisma.learningPath.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'path123' });

      await expect(
        ReferenceValidationService.validateLocalLearningPath('path123')
      ).resolves.toBeUndefined();
    });

    it('should throw error if learning path does not exist', async () => {
      (prisma.learningPath.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        ReferenceValidationService.validateLocalLearningPath('not-found')
      ).rejects.toThrow("Lokaal leerpad 'not-found' niet gevonden.");
    });
  });

  // ========== LEERPAD EXTERN ==========
  describe('validateDwengoLearningPath', () => {
    it('should resolve if Dwengo API returns array of results', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [{ id: 1 }] });

      await expect(
        ReferenceValidationService.validateDwengoLearningPath('pad123', 'nl')
      ).resolves.toBeUndefined();
    });

    it('should throw error if Dwengo API returns empty array', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] });

      await expect(
        ReferenceValidationService.validateDwengoLearningPath('pad123', 'nl')
      ).rejects.toThrow('Dwengo leerpad (hruid=pad123, language=nl) niet gevonden (lege array).');
    });

    it('should throw error on Dwengo API failure', async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API failure'));

      await expect(
        ReferenceValidationService.validateDwengoLearningPath('pad123', 'nl')
      ).rejects.toThrow('Fout bij Dwengo-check leerpad: API failure');
    });
  });

  // ========== LEERPAD WRAPPER ==========
  describe('validateLearningPath (wrapper)', () => {
    it('should call validateDwengoLearningPath for external', async () => {
      const spy = vi.spyOn(ReferenceValidationService, 'validateDwengoLearningPath').mockResolvedValue();

      await ReferenceValidationService.validateLearningPath(true, undefined, 'abc', 'nl');
      expect(spy).toHaveBeenCalledWith('abc', 'nl');
    });

    it('should throw error if dwengo learning path fields are missing', async () => {
      await expect(
        ReferenceValidationService.validateLearningPath(true)
      ).rejects.toThrow('Missing Dwengo leerpad referenties (hruid/language)');
    });

    it('should call validateLocalLearningPath for local', async () => {
      const spy = vi.spyOn(ReferenceValidationService, 'validateLocalLearningPath').mockResolvedValue();

      await ReferenceValidationService.validateLearningPath(false, 'localId123');
      expect(spy).toHaveBeenCalledWith('localId123');
    });

    it('should throw error if localId missing for local path', async () => {
      await expect(
        ReferenceValidationService.validateLearningPath(false)
      ).rejects.toThrow('Missing localId voor niet-externe leerpadvalidatie');
    });
  });
});
