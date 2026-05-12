import assert from 'node:assert/strict';
import test from 'node:test';
import { sharePdfFile } from './pdf-file-share.service';

function createPdfFile(name = 'relatorio.pdf') {
  return new File(['pdf'], name, { type: 'application/pdf' });
}

function setNavigator(value: Partial<Navigator>) {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
}

test('shares PDF files without url or text payload fields', async () => {
  const file = createPdfFile();
  let sharePayload: ShareData | null = null;

  setNavigator({
    canShare: (data) => {
      assert.deepEqual(data, { files: [file] });
      return true;
    },
    share: async (data) => {
      assert.ok(data);
      sharePayload = data;
    },
  });

  const result = await sharePdfFile(file);

  assert.equal(result, 'shared');
  assert.deepEqual(sharePayload, {
    files: [file],
  });
  assert.equal('title' in sharePayload!, false);
  assert.equal('url' in sharePayload!, false);
  assert.equal('text' in sharePayload!, false);
});

test('falls back to download when PDF file sharing is unsupported', async () => {
  const file = createPdfFile();
  const downloadedFiles: File[] = [];

  setNavigator({
    canShare: () => false,
    share: async () => {
      throw new Error('share should not be called');
    },
  });

  const result = await sharePdfFile(file, (downloadedFile) => {
    downloadedFiles.push(downloadedFile);
  });

  assert.equal(result, 'downloaded');
  assert.deepEqual(downloadedFiles, [file]);
});

test('falls back to download when the user cancels sharing', async () => {
  const file = createPdfFile();
  const downloadedFiles: File[] = [];

  setNavigator({
    canShare: () => true,
    share: async () => {
      throw new DOMException('Share cancelled', 'AbortError');
    },
  });

  const result = await sharePdfFile(file, (downloadedFile) => {
    downloadedFiles.push(downloadedFile);
  });

  assert.equal(result, 'downloaded');
  assert.deepEqual(downloadedFiles, [file]);
});
