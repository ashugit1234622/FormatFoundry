import { downloadBlob } from '../utils/download.js';
import { createZipArchive } from '../utils/zip.js';

function escapeHtml(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const targetLabels = {
  'json-pretty': 'JSON (Pretty 2-space)',
  'json-minify': 'JSON (Minify)',
  'csv': 'CSV',
  'tsv': 'TSV',
  'json': 'JSON',
  'html': 'HTML',
  'png': 'PNG',
  'jpeg': 'JPG',
  'webp': 'WEBP',
  'svg': 'SVG'
};

export function setupStagedList({ container, queue, onConvertItem, onConvertAll, defaultInspectionOpen = false }) {
  if (!container || !queue) {
    return null;
  }

  let isArchiving = false;
  let archiveError = null;

  function render(items, summary) {
    if (items.length === 0) {
      container.innerHTML = `
        <div class="staging-container">
          <div class="staging-header">
            <span class="staging-title">Staged Files</span>
            <span class="staging-summary">0 files staged</span>
          </div>
          <div class="empty-state">
            No files staged. Select or drag PNG, JPEG, WebP, SVG, JSON, CSV, TSV, or Markdown files above to begin.
          </div>
        </div>
      `;
      return;
    }

    const countLabel = summary.count === 1 ? 'file' : 'files';
    let summaryText = `${summary.count} ${countLabel} staged · ${summary.totalFormatted}`;
    if (summary.completedCount > 0) {
      summaryText += ` · ${summary.completedCount} converted`;
    }
    if (summary.invalidCount > 0) {
      summaryText += ` · ${summary.invalidCount} invalid`;
    }

    const hasMultipleReady = summary.readyCount > 1;
    const hasCompleted = summary.completedCount > 0;

    const itemsHtml = items
      .map((item) => {
        const safeName = escapeHtml(item.name);
        let badgeText = 'FILE';
        let badgeClass = 'item-ext-badge';

        if (item.detectedFormat) {
          badgeText = item.detectedFormat === 'markdown' ? 'MD' : item.detectedFormat.toUpperCase();
        } else if (item.extension) {
          badgeText = item.extension.toUpperCase();
        }

        if (item.extensionMismatch) {
          badgeClass += ' mismatch';
        }

        let statusBadgeClass = item.status;
        let statusText = 'Ready';

        if (item.status === 'inspecting') {
          statusText = 'Inspecting bytes...';
        } else if (item.status === 'converting') {
          statusText = 'Converting...';
        } else if (item.status === 'completed') {
          statusText = 'Converted';
        } else if (item.status === 'failed') {
          statusText = escapeHtml(item.error || 'Conversion failed');
        } else if (item.status === 'invalid') {
          statusText = escapeHtml(item.error || 'Invalid file');
        } else if (item.status === 'unsupported') {
          statusText = escapeHtml(item.error || 'Unsupported format');
        }

        const mismatchHtml = item.extensionMismatch
          ? `<span class="mismatch-badge">Named .${escapeHtml(item.extension)}</span>`
          : '';

        const deltaSizeHtml = item.result
          ? `<span class="delta-size">→ ${escapeHtml(item.result.sizeFormatted)}</span>`
          : '';

        let warningsHtml = '';
        const itemWarnings = item.warnings || item.result?.warnings || [];
        if (itemWarnings.length > 0) {
          if (itemWarnings.length === 1) {
            warningsHtml = `
              <div class="item-warnings">
                <span class="warning-badge" title="${escapeHtml(itemWarnings[0])}">
                  <span class="warning-icon" aria-hidden="true">⚠</span>
                  <span>${escapeHtml(itemWarnings[0])}</span>
                </span>
              </div>
            `;
          } else {
            warningsHtml = `
              <div class="item-warnings">
                <details class="item-warnings-details">
                  <summary class="warning-badge">
                    <span class="warning-icon" aria-hidden="true">⚠</span>
                    <span>${itemWarnings.length} column notices (click to view)</span>
                  </summary>
                  <ul class="warning-list">
                    ${itemWarnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}
                  </ul>
                </details>
              </div>
            `;
          }
        }

        let targetSelectorHtml = '';
        if (item.availableTargets && item.availableTargets.length > 0) {
          const optionsHtml = item.availableTargets
            .map(
              (target) =>
                `<option value="${target}" ${target === item.selectedTarget ? 'selected' : ''}>${escapeHtml(targetLabels[target] || target.toUpperCase())}</option>`
            )
            .join('');

          targetSelectorHtml = `
            <div class="target-select-wrapper">
              <label for="target-${item.id}" class="target-label">To:</label>
              <select id="target-${item.id}" class="target-select" data-action="change-target" data-id="${item.id}" ${item.status === 'converting' ? 'disabled' : ''}>
                ${optionsHtml}
              </select>
            </div>
          `;
        }

        let actionButtonHtml = '';
        if (item.status === 'ready') {
          actionButtonHtml = `
            <button type="button" class="btn-primary" data-action="convert" data-id="${item.id}">
              Convert
            </button>
          `;
        } else if (item.status === 'converting') {
          actionButtonHtml = `
            <button type="button" class="btn-primary" disabled>
              Converting...
            </button>
          `;
        } else if (item.status === 'completed' && item.result) {
          const safeOutputFilename = escapeHtml(item.result.filename);
          actionButtonHtml = `
            <a href="${item.result.url}" download="${safeOutputFilename}" class="btn-primary btn-download" data-action="download" data-id="${item.id}" aria-label="Download ${safeOutputFilename}">
              Download
            </a>
          `;
        } else if (item.status === 'failed') {
          actionButtonHtml = `
            <button type="button" class="btn-secondary" data-action="convert" data-id="${item.id}">
              Retry
            </button>
          `;
        }

        let inspectionHtml = '';
        if (item.inspection) {
          const insp = item.inspection;
          const dimStr = insp.width && insp.height ? `${insp.width} × ${insp.height} px` : null;
          const ratioStr = insp.aspectRatio ? `${insp.aspectRatio}:1` : null;
          const decodableText = insp.canDecode ? 'Yes' : 'No';
          const decodableClass = insp.canDecode ? 'status-ok' : 'status-err';

          inspectionHtml = `
            <details class="item-inspection" ${defaultInspectionOpen ? 'open' : ''}>
              <summary class="inspection-summary">
                <span class="inspection-toggle-icon" aria-hidden="true">▸</span>
                <span class="inspection-chip">Signature: <strong>${escapeHtml(insp.signatureFormat)}</strong></span>
                <span class="inspection-chip">MIME: <strong>${escapeHtml(insp.browserMime)}</strong></span>
                ${dimStr ? `<span class="inspection-chip">Dimensions: <strong>${dimStr}</strong></span>` : ''}
                <span class="inspection-chip ${decodableClass}">Decodable: <strong>${decodableText}</strong></span>
              </summary>
              <div class="inspection-grid">
                <div class="inspection-cell">
                  <span class="inspection-key">Format by Signature:</span>
                  <span class="inspection-val">${escapeHtml(insp.signatureFormat)}</span>
                </div>
                <div class="inspection-cell">
                  <span class="inspection-key">Browser MIME:</span>
                  <span class="inspection-val">${escapeHtml(insp.browserMime)}</span>
                </div>
                <div class="inspection-cell">
                  <span class="inspection-key">Dimensions:</span>
                  <span class="inspection-val">${dimStr || 'Unavailable'}</span>
                </div>
                <div class="inspection-cell">
                  <span class="inspection-key">Aspect Ratio:</span>
                  <span class="inspection-val">${ratioStr || 'Unavailable'}</span>
                </div>
                <div class="inspection-cell">
                  <span class="inspection-key">File Size:</span>
                  <span class="inspection-val">${escapeHtml(insp.fileSizeFormatted)} (${insp.fileSize.toLocaleString()} B)</span>
                </div>
                <div class="inspection-cell">
                  <span class="inspection-key">Browser Decodable:</span>
                  <span class="inspection-val ${decodableClass}">${insp.canDecode ? 'Yes (Verified in browser)' : 'No (Decode failed)'}</span>
                </div>
                ${insp.viewBox ? `
                  <div class="inspection-cell full-width">
                    <span class="inspection-key">SVG viewBox:</span>
                    <span class="inspection-val">${insp.viewBox.minX} ${insp.viewBox.minY} ${insp.viewBox.width} ${insp.viewBox.height} (Explicit: ${insp.hasExplicitDimensions ? 'Yes' : 'No'})</span>
                  </div>
                ` : ''}
                ${insp.error ? `
                  <div class="inspection-cell full-width">
                    <span class="inspection-key">Inspection Note:</span>
                    <span class="inspection-val status-err">${escapeHtml(insp.error)}</span>
                  </div>
                ` : ''}
              </div>
            </details>
          `;
        }

        return `
          <li class="staged-item ${item.valid ? '' : 'is-invalid'} ${item.status === 'completed' ? 'is-completed' : ''}" data-id="${item.id}">
            <div class="item-main">
              <span class="${badgeClass}">${badgeText}</span>
              <div class="item-details">
                <span class="item-name" title="${safeName}">${safeName}</span>
                <div class="item-meta">
                  <span>${escapeHtml(item.sizeFormatted)}</span>
                  ${deltaSizeHtml}
                  <span class="status-badge ${statusBadgeClass}">${statusText}</span>
                  ${mismatchHtml}
                </div>
                ${warningsHtml}
                ${inspectionHtml}
              </div>
            </div>
            <div class="item-controls">
              ${targetSelectorHtml}
              ${actionButtonHtml}
              <button type="button" class="btn-remove" data-action="remove" data-id="${item.id}" aria-label="Remove ${safeName}">
                Remove
              </button>
            </div>
          </li>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="staging-container">
        <div class="staging-header">
          <div>
            <span class="staging-title">Staged Files</span>
            <span class="staging-summary">${summaryText}</span>
          </div>
          <div class="staging-header-actions">
            ${hasMultipleReady ? '<button type="button" class="btn-primary" data-action="convert-all">Convert All</button>' : ''}
            ${hasCompleted ? `<button type="button" class="btn-primary btn-download" data-action="download-zip" id="btn-download-zip" ${isArchiving ? 'disabled' : ''}>${isArchiving ? 'Archiving...' : `Download All (ZIP)`}</button>` : ''}
            <button type="button" class="btn-secondary btn-danger" data-action="clear-all">
              Clear All
            </button>
          </div>
        </div>
        ${archiveError ? `<div class="archive-error-banner">${escapeHtml(archiveError)}</div>` : ''}
        <ul class="staged-list">
          ${itemsHtml}
        </ul>
        <div class="roadmap-notice">
          <span class="roadmap-badge">Stage 5 Active</span>
          <span>Local conversion engine active. Raster images (PNG, JPG, WebP), SVG vector graphics, structured data (JSON, CSV, TSV), and Markdown documents process strictly in local browser memory with zero network uploads. Bulk ZIP download available.</span>
        </div>
      </div>
    `;

    const clearBtn = container.querySelector('[data-action="clear-all"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        queue.clear();
      });
    }

    const convertAllBtn = container.querySelector('[data-action="convert-all"]');
    if (convertAllBtn && typeof onConvertAll === 'function') {
      convertAllBtn.addEventListener('click', () => {
        onConvertAll();
      });
    }

    const downloadZipBtn = container.querySelector('[data-action="download-zip"]');
    if (downloadZipBtn) {
      downloadZipBtn.addEventListener('click', async () => {
        if (isArchiving) {
          return;
        }

        const completedItems = queue.getItems()
          .filter((item) => item.status === 'completed' && item.result?.blob)
          .map((item) => ({
            filename: item.result.filename,
            blob: item.result.blob
          }));

        if (completedItems.length === 0) {
          archiveError = 'No completed conversions available to archive';
          render(queue.getItems(), queue.getSummary());
          return;
        }

        isArchiving = true;
        archiveError = null;
        render(queue.getItems(), queue.getSummary());

        try {
          const archive = await createZipArchive(completedItems);
          downloadBlob(archive.blob, archive.filename);
        } catch (err) {
          archiveError = err instanceof Error ? err.message : 'Archive generation failed unexpectedly';
        } finally {
          isArchiving = false;
          render(queue.getItems(), queue.getSummary());
        }
      });
    }

    const targetSelects = container.querySelectorAll('[data-action="change-target"]');
    targetSelects.forEach((select) => {
      select.addEventListener('change', (e) => {
        const id = select.getAttribute('data-id');
        if (id) {
          queue.setTarget(id, e.target.value);
        }
      });
    });

    const convertButtons = container.querySelectorAll('[data-action="convert"]');
    convertButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = queue.getItem(id);
        if (item && typeof onConvertItem === 'function') {
          onConvertItem(item);
        }
      });
    });

    const downloadLinks = container.querySelectorAll('[data-action="download"]');
    downloadLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const id = link.getAttribute('data-id');
        const item = queue.getItem(id);
        if (item && item.result && item.result.blob) {
          downloadBlob(item.result.blob, item.result.filename);
        }
      });
    });

    const removeButtons = container.querySelectorAll('[data-action="remove"]');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          queue.remove(id);
        }
      });
    });
  }

  const unsubscribe = queue.subscribe((items, summary) => {
    render(items, summary);
  });

  render(queue.getItems(), queue.getSummary());

  return {
    destroy() {
      unsubscribe();
      container.innerHTML = '';
    }
  };
}
