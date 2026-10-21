import './styles/main.css';
import { FileQueue } from './core/file-queue.js';
import { defaultRegistry, registerAllStandardRoutes } from './core/registry.js';
import { convertFile } from './engines/dispatcher.js';
import { setupDropzone } from './ui/dropzone.js';
import { setupStagedList } from './ui/staged-list.js';
import { getToolConfig } from './config/tools-config.js';
import { setupToolsFilter } from './ui/tools-filter.js';

function init() {
  registerAllStandardRoutes(defaultRegistry);

  const toolSlug = document.body?.dataset?.tool || null;
  const toolConfig = toolSlug ? getToolConfig(toolSlug) : null;

  const fileQueue = new FileQueue({
    registry: defaultRegistry,
    preferredTarget: toolConfig?.preferredTarget || null,
    preferredSource: toolConfig?.preferredSource || null
  });

  const MIN_CONVERSION_DELAY_MS = 4000;

  async function handleConvertItem(item) {
    if (!item || !item.selectedTarget || item.status === 'converting') {
      return;
    }

    fileQueue.setStatus(item.id, 'converting');
    const delayPromise = new Promise((resolve) => setTimeout(resolve, MIN_CONVERSION_DELAY_MS));

    try {
      const [result] = await Promise.all([
        convertFile(item.file, item.selectedTarget, {
          sourceFormat: item.detectedFormat,
          arrayProperty: item.selectedArrayProperty || null
        }),
        delayPromise
      ]);
      fileQueue.setResult(item.id, result);
    } catch (err) {
      await delayPromise;
      const message = err instanceof Error ? err.message : 'Conversion failed unexpectedly.';
      fileQueue.setStatus(item.id, 'failed', message);
    }
  }

  async function handleConvertAll() {
    const readyItems = fileQueue.getItems().filter((i) => i.status === 'ready');
    await Promise.all(
      readyItems.map(async (item) => {
        try {
          await handleConvertItem(item);
        } catch {
          fileQueue.setStatus(item.id, 'failed', 'Conversion failed unexpectedly.');
        }
      })
    );
  }

  const dropzoneContainer = document.getElementById('dropzone');
  const stagedListContainer = document.getElementById('staged-container');

  if (dropzoneContainer) {
    setupDropzone({
      container: dropzoneContainer,
      onFilesSelected: (files) => {
        fileQueue.addMultiple(files);
      }
    });
  }

  if (stagedListContainer) {
    setupStagedList({
      container: stagedListContainer,
      queue: fileQueue,
      onConvertItem: handleConvertItem,
      onConvertAll: handleConvertAll,
      defaultInspectionOpen: toolSlug === 'image-inspector'
    });
  }

  const searchInput = document.getElementById('tools-search');
  if (searchInput) {
    setupToolsFilter({ input: searchInput });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
