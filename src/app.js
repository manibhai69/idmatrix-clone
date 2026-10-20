import './styles.css';

const state = {
  images: { front: null, back: null },
  cropSide: null,
  busy: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  themeToggle: $('#themeToggle'),
  themeIcon: $('#themeIcon'),
  adminLink: $('#adminLink'),
  toastContainer: $('#toastContainer'),
  loadingOverlay: $('#loadingOverlay'),
  loadingText: $('#loadingText'),
  cropperModal: $('#cropperModal'),
  cropperImage: $('#cropperImage'),
  crossing: $('#chkCrossing'),
  crossingControls: $('#crossingControls'),
  crossingPreset: $('#crossingPreset'),
  customCrossing: $('#customCrossingText'),
  crossingAdjustments: $('#crossingAdjustments'),
  crossingSize: $('#crossingSizeRange'),
  crossingOpacity: $('#crossingOpacityRange'),
  crossingBold: $('#crossingBold'),
  resultSection: $('#resultSection'),
  resultLinks: $('#resultLinks')
};

const sideElements = (side) => ({
  input: $(`#${side}Input`),
  drop: $(`#${side}DropZone`),
  preview: $(`#${side}Preview`),
  image: $(`#${side}PreviewImg`),
  fileName: $(`#${side}FileName`),
  dimensions: $(`#${side}Dimensions`),
  status: $(`#${side}Status`),
  crossing: $(`#${side}CrossingPreview`)
});

function showToast(message, tone = 'default') {
  const toast = document.createElement('div');
  toast.className = `toast ${tone}`;
  toast.textContent = message;
  elements.toastContainer.append(toast);
  window.setTimeout(() => toast.remove(), 4000);
}

function setLoading(isLoading, text = 'Processing…') {
  state.busy = isLoading;
  elements.loadingText.textContent = text;
  elements.loadingOverlay.classList.toggle('hidden', !isLoading);
  $$('button').forEach((button) => { button.disabled = isLoading; });
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function selectedCrossingText() {
  if (!elements.crossing.checked) return '';
  return elements.crossingPreset.value === '__custom__'
    ? elements.customCrossing.value.trim()
    : elements.crossingPreset.value.trim();
}

function updateCrossingControls() {
  const enabled = elements.crossing.checked;
  elements.crossingControls.classList.toggle('hidden', !enabled);
  elements.crossingAdjustments.classList.toggle('hidden', !enabled);
  elements.customCrossing.classList.toggle('hidden', elements.crossingPreset.value !== '__custom__');
  if (enabled && !elements.crossingPreset.value) elements.crossingPreset.value = 'FOR VERIFICATION ONLY';
  updateCrossingAppearance();
}

function updateCrossingAppearance() {
  const text = selectedCrossingText();
  const size = Number(elements.crossingSize.value) || 140;
  const opacity = Number(elements.crossingOpacity.value) || 70;
  $('#crossingSizeValue').textContent = `${size}%`;
  $('#crossingOpacityValue').textContent = `${opacity}% visible`;
  $$('.crossing-preview').forEach((preview) => {
    preview.textContent = text;
    preview.style.setProperty('--crossing-scale', size / 100);
    preview.style.setProperty('--crossing-opacity', elements.crossing.checked && text ? opacity / 100 : 0);
    preview.classList.toggle('bold', elements.crossingBold.checked);
  });
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  elements.themeIcon.innerHTML = `<use href="#icon-${theme === 'dark' ? 'sun' : 'moon'}" />`;
  localStorage.setItem('idmatrix-theme', theme);
}

function setupTheme() {
  const saved = localStorage.getItem('idmatrix-theme');
  setTheme(saved || 'light');
  elements.themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function readFile(file, side) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image files must be 10 MB or smaller.', 'warning');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.images[side] = { dataUrl: reader.result, name: file.name, width: 0, height: 0 };
    updatePreview(side);
    loadImage(reader.result).then((image) => {
      state.images[side].width = image.naturalWidth;
      state.images[side].height = image.naturalHeight;
      updatePreview(side);
    });
    showToast(`${side === 'front' ? 'Front' : 'Back'} image added.`, 'success');
  };
  reader.readAsDataURL(file);
}

function updatePreview(side) {
  const item = state.images[side];
  const ui = sideElements(side);
  const hasImage = Boolean(item);
  ui.drop.classList.toggle('hidden', hasImage);
  ui.preview.classList.toggle('hidden', !hasImage);
  ui.status.textContent = hasImage ? 'Ready' : 'Waiting';
  ui.status.style.color = hasImage ? 'var(--success)' : '';
  if (!hasImage) return;
  ui.image.src = item.dataUrl;
  ui.fileName.textContent = item.name || `${side}-image`;
  ui.dimensions.textContent = item.width ? `${item.width} × ${item.height}` : 'Reading…';
  updateCrossingAppearance();
}

function removeImage(side) {
  const ui = sideElements(side);
  state.images[side] = null;
  ui.input.value = '';
  updatePreview(side);
  showToast(`${side === 'front' ? 'Front' : 'Back'} image removed.`);
}

async function rotateDataUrl(dataUrl, degrees = 90) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const quarterTurn = Math.abs(degrees) % 180 === 90;
  canvas.width = quarterTurn ? image.naturalHeight : image.naturalWidth;
  canvas.height = quarterTurn ? image.naturalWidth : image.naturalHeight;
  const context = canvas.getContext('2d');
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((degrees * Math.PI) / 180);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return canvas.toDataURL('image/jpeg', .96);
}

async function rotateImage(side, degrees = 90) {
  if (!state.images[side]) return;
  state.images[side].dataUrl = await rotateDataUrl(state.images[side].dataUrl, degrees);
  [state.images[side].width, state.images[side].height] = [state.images[side].height, state.images[side].width];
  updatePreview(side);
  showToast(`${side === 'front' ? 'Front' : 'Back'} image rotated.`, 'success');
}

function openCropper(side) {
  if (!state.images[side]) return;
  state.cropSide = side;
  elements.cropperImage.src = state.images[side].dataUrl;
  elements.cropperModal.classList.remove('hidden');
}

function closeCropper() {
  state.cropSide = null;
  elements.cropperModal.classList.add('hidden');
}

async function applyCrop() {
  const side = state.cropSide;
  if (!side || !state.images[side]) return;
  const image = await loadImage(state.images[side].dataUrl);
  const insetX = Math.round(image.naturalWidth * .08);
  const insetY = Math.round(image.naturalHeight * .08);
  const width = Math.max(1, image.naturalWidth - insetX * 2);
  const height = Math.max(1, image.naturalHeight - insetY * 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, insetX, insetY, width, height, 0, 0, width, height);
  state.images[side].dataUrl = canvas.toDataURL('image/jpeg', .96);
  state.images[side].width = width;
  state.images[side].height = height;
  updatePreview(side);
  closeCropper();
  showToast('Image cropped with a balanced inner frame.', 'success');
}

async function trimEdges(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = width, right = 0, top = height, bottom = 0;
  const step = Math.max(1, Math.floor(Math.min(width, height) / 600));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const brightness = data[index] + data[index + 1] + data[index + 2];
      if (data[index + 3] > 12 && brightness < 735) {
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  if (right <= left || bottom <= top || left < width * .01 && right > width * .99 && top < height * .01 && bottom > height * .99) return canvas;
  const pad = Math.round(Math.min(width, height) * .012);
  const cropX = Math.max(0, left - pad);
  const cropY = Math.max(0, top - pad);
  const cropW = Math.min(width - cropX, right - left + pad * 2);
  const cropH = Math.min(height - cropY, bottom - top + pad * 2);
  const trimmed = document.createElement('canvas');
  trimmed.width = cropW;
  trimmed.height = cropH;
  trimmed.getContext('2d').drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return trimmed;
}

async function prepareImage(item, options) {
  if (!item) return null;
  const source = await loadImage(item.dataUrl);
  let canvas = options.autoCrop ? await trimEdges(source) : (() => { const c = document.createElement('canvas'); c.width = source.naturalWidth; c.height = source.naturalHeight; c.getContext('2d').drawImage(source, 0, 0); return c; })();
  if (options.enhance) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const factor = 1.16;
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = Math.max(0, Math.min(255, (pixels.data[i] - 128) * factor + 128 + 2));
      pixels.data[i + 1] = Math.max(0, Math.min(255, (pixels.data[i + 1] - 128) * factor + 128 + 2));
      pixels.data[i + 2] = Math.max(0, Math.min(255, (pixels.data[i + 2] - 128) * factor + 128 + 2));
    }
    context.putImageData(pixels, 0, 0);
  }
  return canvas.toDataURL('image/jpeg', .94);
}

function printCard(imageUrl, crossingText, options) {
  if (!imageUrl) return '<div class="missing-side">Side not supplied</div>';
  const mark = crossingText ? `<span class="print-crossing" style="opacity:${options.opacity / 100};font-size:${options.size}em;font-weight:${options.bold ? 800 : 600}">${escapeHtml(crossingText)}</span>` : '';
  return `<div class="print-image-wrap"><img src="${imageUrl}" alt="ID card side" />${mark}</div>`;
}

function buildPrintHtml(images, crossingText, options, title = 'IDMatrix print sheet') {
  const cells = Array.from({ length: 8 }, () => `<td><div class="print-pair">${printCard(images.front, crossingText, options)}${printCard(images.back, crossingText, options)}</div></td>`);
  const rows = Array.from({ length: 4 }, (_, index) => `<tr>${cells.slice(index * 2, index * 2 + 2).join('')}</tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font-family:Arial,sans-serif}.sheet{width:190mm;margin:0 auto}table{width:100%;border-collapse:separate;border-spacing:5mm 4mm;table-layout:fixed}td{height:57mm;padding:3mm;border:1px dashed #bbc2cc;vertical-align:middle}.print-pair{display:flex;flex-direction:column;gap:2mm;align-items:center}.print-image-wrap{position:relative;width:100%;min-height:18mm;display:grid;place-items:center}.print-image-wrap img{display:block;width:100%;max-height:24mm;object-fit:contain}.print-crossing{position:absolute;inset:auto 0;transform:rotate(-25deg);color:#d7263d;text-align:center;letter-spacing:.04em;line-height:1.05;pointer-events:none}.missing-side{width:100%;padding:8mm 2mm;text-align:center;color:#8b95a7;font-size:8pt}@media print{td{break-inside:avoid}}</style></head><body><main class="sheet"><table><tbody>${rows}</tbody></table></main></body></html>`;
}

function downloadBlob(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openPrintWindow(html) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    showToast('Allow pop-ups to open the PDF print dialog.', 'warning');
    return false;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.addEventListener('load', () => printWindow.print());
  return true;
}

function renderResult(type, wordHtml, pdfHtml) {
  elements.resultLinks.replaceChildren();
  $('#resultCaption').textContent = type === 'both' ? 'Word and PDF-ready outputs prepared locally' : `${type.toUpperCase()} output prepared locally`;
  if (wordHtml) {
    const wordButton = document.createElement('button');
    wordButton.type = 'button';
    wordButton.className = 'button primary';
    wordButton.innerHTML = '<svg aria-hidden="true"><use href="#icon-word" /></svg> Download Word';
    wordButton.addEventListener('click', () => { downloadBlob(wordHtml, 'idmatrix-print-sheet.doc', 'application/msword'); showToast('Word-compatible file downloaded.', 'success'); });
    elements.resultLinks.append(wordButton);
  }
  if (pdfHtml) {
    const pdfButton = document.createElement('button');
    pdfButton.type = 'button';
    pdfButton.className = 'button outline';
    pdfButton.innerHTML = '<svg aria-hidden="true"><use href="#icon-pdf" /></svg> Open PDF print dialog';
    pdfButton.addEventListener('click', () => openPrintWindow(pdfHtml));
    elements.resultLinks.append(pdfButton);
    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.className = 'button outline';
    previewButton.innerHTML = '<svg aria-hidden="true"><use href="#icon-image" /></svg> Preview sheet';
    previewButton.addEventListener('click', () => {
      const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!previewWindow) return showToast('Allow pop-ups to preview the print sheet.', 'warning');
      previewWindow.document.write(pdfHtml);
      previewWindow.document.close();
    });
    elements.resultLinks.append(previewButton);
  }
  elements.resultSection.classList.remove('hidden');
  elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function generate(type) {
  if (state.busy) return;
  if (!state.images.front && !state.images.back) return showToast('Please upload at least one image.', 'warning');
  if (elements.crossing.checked && !selectedCrossingText()) return showToast('Please choose a crossing text or enter custom text.', 'warning');
  setLoading(true, 'Preparing print-ready files…');
  try {
    const options = {
      autoCrop: $('#chkAutoCrop').checked,
      enhance: $('#chkEnhance').checked,
      opacity: Number(elements.crossingOpacity.value),
      size: Number(elements.crossingSize.value) / 100,
      bold: elements.crossingBold.checked
    };
    const images = { front: await prepareImage(state.images.front, options), back: await prepareImage(state.images.back, options) };
    const text = selectedCrossingText();
    const printHtml = buildPrintHtml(images, text, options, 'IDMatrix print sheet');
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    renderResult(type, type === 'pdf' ? '' : printHtml, type === 'word' ? '' : printHtml);
    if (type === 'pdf') openPrintWindow(printHtml);
    showToast(type === 'both' ? 'Word and PDF outputs are ready.' : `${type === 'word' ? 'Word' : 'PDF'} output is ready.`, 'success');
  } catch (error) {
    console.error(error);
    showToast('Something went wrong while preparing the output.', 'error');
  } finally {
    setLoading(false);
  }
}

function setupDropZone(side) {
  const ui = sideElements(side);
  const select = () => ui.input.click();
  ui.drop.addEventListener('click', select);
  ui.drop.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
  ui.input.addEventListener('change', () => readFile(ui.input.files[0], side));
  ['dragenter', 'dragover'].forEach((name) => ui.drop.addEventListener(name, (event) => { event.preventDefault(); ui.drop.classList.add('is-dragging'); }));
  ['dragleave', 'drop'].forEach((name) => ui.drop.addEventListener(name, (event) => { event.preventDefault(); ui.drop.classList.remove('is-dragging'); }));
  ui.drop.addEventListener('drop', (event) => readFile(event.dataTransfer.files[0], side));
}

function setupActions() {
  $$('[data-action]').forEach((button) => button.addEventListener('click', async () => {
    const side = button.dataset.side;
    if (button.dataset.action === 'remove') removeImage(side);
    if (button.dataset.action === 'rotate') await rotateImage(side);
    if (button.dataset.action === 'crop') openCropper(side);
  }));
  $('#btnDocx').addEventListener('click', () => generate('word'));
  $('#btnPdf').addEventListener('click', () => generate('pdf'));
  $('#btnBoth').addEventListener('click', () => generate('both'));
  elements.adminLink.addEventListener('click', (event) => { event.preventDefault(); showToast('The admin area is not included in this public standalone clone.'); });
}

setupTheme();
setupDropZone('front');
setupDropZone('back');
setupActions();
elements.crossing.addEventListener('change', updateCrossingControls);
elements.crossingPreset.addEventListener('change', updateCrossingControls);
elements.customCrossing.addEventListener('input', updateCrossingAppearance);
elements.crossingSize.addEventListener('input', updateCrossingAppearance);
elements.crossingOpacity.addEventListener('input', updateCrossingAppearance);
elements.crossingBold.addEventListener('change', updateCrossingAppearance);
$('#cropClose').addEventListener('click', closeCropper);
$('#cropperModal').addEventListener('click', (event) => { if (event.target === elements.cropperModal) closeCropper(); });
$('#cropRotateLeft').addEventListener('click', async () => { if (state.cropSide) { await rotateImage(state.cropSide, -90); elements.cropperImage.src = state.images[state.cropSide].dataUrl; } });
$('#cropApplyBtn').addEventListener('click', applyCrop);
updateCrossingControls();
