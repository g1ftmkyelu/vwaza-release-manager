import { formatDuration, fileToBase64 } from './helpers';

describe('Helper Utilities', () => {
  describe('formatDuration', () => {
    it('should format seconds correctly to MM:SS', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(59)).toBe('00:59');
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(61)).toBe('01:01');
      expect(formatDuration(3599)).toBe('59:59');
      expect(formatDuration(3600)).toBe('60:00');
      expect(formatDuration(123)).toBe('02:03');
      expect(formatDuration(undefined)).toBe('00:00');
      expect(formatDuration(NaN)).toBe('00:00');
    });

    it('should handle large numbers of seconds', () => {
      expect(formatDuration(7200)).toBe('120:00'); 
    });
  });

  describe('fileToBase64', () => {
    it('should convert a File object to a base64 string', async () => {
      const mockFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
      const base64String = await fileToBase64(mockFile);


      const expectedBase64Prefix = 'data:text/plain;base64,';
      const expectedBase64Content = btoa('hello world');

      expect(base64String).toBe(`${expectedBase64Prefix}${expectedBase64Content}`);
    });

    it('should reject if file reading fails', async () => {
  
      class MockFileReader {
        onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
        readAsDataURL(blob: Blob) {
          if (this.onerror) {
            this.onerror(new ProgressEvent('error'));
          }
        }
      }
 
      const originalFileReader = global.FileReader;
      global.FileReader = MockFileReader as any;

      const mockFile = new File([''], 'error.txt', { type: 'text/plain' });

      await expect(fileToBase64(mockFile)).rejects.toBeInstanceOf(ProgressEvent);


      global.FileReader = originalFileReader;
    });
  });
});