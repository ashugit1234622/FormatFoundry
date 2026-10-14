export function setupDropzone({ container, onFilesSelected }) {
  if (!container || typeof onFilesSelected !== 'function') {
    return null;
  }

  container.innerHTML = `
    <input type="file" id="file-input" class="sr-only" multiple />
    <svg class="dropzone-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    <div class="dropzone-prompt">Choose files or drag them here</div>
    <div class="dropzone-subtext">Process files locally in your browser with zero network uploads</div>
    <label for="file-input" class="dropzone-btn">Browse Files</label>
  `;

  const input = container.querySelector('#file-input');
  let dragCounter = 0;

  function handleFiles(fileList) {
    if (fileList && fileList.length > 0) {
      onFilesSelected(fileList);
    }
  }

  container.addEventListener('dragenter', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter += 1;
    container.classList.add('is-dragover');
  });

  container.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  container.addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter -= 1;
    if (dragCounter <= 0) {
      dragCounter = 0;
      container.classList.remove('is-dragover');
    }
  });

  container.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter = 0;
    container.classList.remove('is-dragover');

    const dt = event.dataTransfer;
    if (dt && dt.files) {
      handleFiles(dt.files);
    }
  });

  input.addEventListener('change', () => {
    if (input.files) {
      handleFiles(input.files);
      input.value = '';
    }
  });

  container.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (event.target === container) {
        event.preventDefault();
        input.click();
      }
    }
  });

  return {
    destroy() {
      container.innerHTML = '';
    }
  };
}
