/* ==========================================================================
   MARRIAGE BIODATA MAKER - JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const inputs = document.querySelectorAll('[data-bind]');
    const mantraSelect = document.getElementById('mantraSelect');
    const customMantraGroup = document.getElementById('customMantraGroup');
    const customMantraInput = document.getElementById('customMantraInput');
    const previewMantra = document.getElementById('previewMantra');
    const headerTitleInput = document.getElementById('headerTitleInput');
    const previewMainTitle = document.getElementById('previewMainTitle');
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Photo Elements
    const photoFileInput = document.getElementById('photoFileInput');
    const editorPhotoPreview = document.getElementById('editorPhotoPreview');
    const previewPhoto = document.getElementById('previewPhoto');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    const showPhotoToggle = document.getElementById('showPhotoToggle');
    const sheetPhotoWrapper = document.getElementById('sheetPhotoWrapper');
    
    // Header Actions
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    
    // Zoom Controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const fitScreenBtn = document.getElementById('fitScreenBtn');
    const zoomLevelSpan = document.getElementById('zoomLevel');
    const biodataSheet = document.getElementById('biodataSheet');
    
    let currentZoom = 100;

    // Empty Default Data - 100% User Defined from UI
    const defaultData = {
        name: "",
        dob: "",
        bloodGroup: "",
        birthPlace: "",
        height: "",
        subcaste: "Marar",
        caste: "",
        rashi: "",
        education: "",
        occupation: "",
        hobbies: "",
        fatherName: "",
        fatherOcc: "",
        motherName: "",
        motherOcc: "",
        brother1: "",
        sister1: "",
        grandFatherName: "",
        grandMotherName: "",
        address: "",
        phone: ""
    };

    // --- 1. Two-Way Data Binding ---
    function bindInput(input) {
        const key = input.getAttribute('data-bind');
        const targetView = document.querySelector(`[data-view="${key}"]`);
        if (targetView) {
            targetView.textContent = input.value || '-';
            input.addEventListener('input', (e) => {
                targetView.textContent = e.target.value.trim() !== '' ? e.target.value : '-';
            });
        }
    }

    inputs.forEach(input => bindInput(input));

    // --- 1b. Dynamic Brother/Sister Field Management ---
    const brotherContainer = document.getElementById('brotherFieldsContainer');
    const sisterContainer = document.getElementById('sisterFieldsContainer');
    const addBrotherBtn = document.getElementById('addBrotherBtn');
    const addSisterBtn = document.getElementById('addSisterBtn');
    const previewBrothersContainer = document.getElementById('previewBrothersContainer');
    const previewSistersContainer = document.getElementById('previewSistersContainer');

    let brotherCount = 1;
    let sisterCount = 1;
    const MAX_SIBLINGS = 10;

    function createDynamicField(type, index) {
        const item = document.createElement('div');
        item.className = 'dynamic-field-item';
        item.setAttribute('data-index', index);

        const label = type === 'brother' ? 'भाई' : 'बहन';
        const labelEn = type === 'brother' ? 'Brother' : 'Sister';
        const placeholder = type === 'brother' 
            ? `${label} ${index} - नाम एवं जॉब विवरण` 
            : `${label} ${index} - नाम एवं विवरण`;

        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('data-bind', `${type}${index}`);
        input.className = 'form-control';
        input.placeholder = placeholder;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove-field';
        removeBtn.title = `Remove ${labelEn} ${index}`;
        removeBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';

        item.appendChild(input);
        item.appendChild(removeBtn);

        return item;
    }

    function createPreviewRow(type, index) {
        const label = type === 'brother' ? 'भाई' : 'बहन';
        const labelEn = type === 'brother' ? 'Brother' : 'Sister';

        const row = document.createElement('div');
        row.className = 'detail-row';
        row.setAttribute(`data-preview-${type}`, index);

        row.innerHTML = `
            <div class="detail-label">${label} ${index} (${labelEn} ${index})</div>
            <div class="detail-colon">:</div>
            <div class="detail-value" data-view="${type}${index}">-</div>
        `;

        return row;
    }

    function addSiblingField(type) {
        const container = type === 'brother' ? brotherContainer : sisterContainer;
        const previewContainer = type === 'brother' ? previewBrothersContainer : previewSistersContainer;
        let count = type === 'brother' ? ++brotherCount : ++sisterCount;

        if (count > MAX_SIBLINGS) {
            if (type === 'brother') brotherCount--; else sisterCount--;
            return;
        }

        // Create editor field
        const fieldItem = createDynamicField(type, count);
        container.appendChild(fieldItem);

        // Create preview row
        const previewRow = createPreviewRow(type, count);
        previewContainer.appendChild(previewRow);

        // Bind the new input to preview
        const newInput = fieldItem.querySelector('input');
        bindInput(newInput);

        // Remove button handler
        const removeBtn = fieldItem.querySelector('.btn-remove-field');
        removeBtn.addEventListener('click', () => {
            fieldItem.remove();
            previewRow.remove();
            renumberSiblings(type);
        });

        newInput.focus();
    }

    function renumberSiblings(type) {
        const container = type === 'brother' ? brotherContainer : sisterContainer;
        const previewContainer = type === 'brother' ? previewBrothersContainer : previewSistersContainer;
        const items = container.querySelectorAll('.dynamic-field-item');
        const label = type === 'brother' ? 'भाई' : 'बहन';
        const labelEn = type === 'brother' ? 'Brother' : 'Sister';

        // Update count
        if (type === 'brother') brotherCount = items.length;
        else sisterCount = items.length;

        items.forEach((item, i) => {
            const idx = i + 1;
            item.setAttribute('data-index', idx);
            const input = item.querySelector('input');
            const oldKey = input.getAttribute('data-bind');
            const newKey = `${type}${idx}`;
            input.setAttribute('data-bind', newKey);
            input.placeholder = `${label} ${idx} - नाम एवं ${type === 'brother' ? 'जॉब विवरण' : 'विवरण'}`;

            // Update preview row
            const previewRows = previewContainer.querySelectorAll(`.detail-row`);
            if (previewRows[i]) {
                previewRows[i].setAttribute(`data-preview-${type}`, idx);
                previewRows[i].querySelector('.detail-label').textContent = `${label} ${idx} (${labelEn} ${idx})`;
                const valueEl = previewRows[i].querySelector('.detail-value');
                valueEl.setAttribute('data-view', newKey);
                valueEl.textContent = input.value.trim() || '-';
            }

            // Re-bind input
            const clonedInput = input.cloneNode(true);
            clonedInput.value = input.value;
            input.replaceWith(clonedInput);
            bindInput(clonedInput);
        });
    }

    // Add button click handlers
    addBrotherBtn.addEventListener('click', () => addSiblingField('brother'));
    addSisterBtn.addEventListener('click', () => addSiblingField('sister'));

    // --- 2. Accordion Interactivity ---
    const accordionItems = Array.from(document.querySelectorAll('.accordion-item'));

    function setSectionOpen(item, open) {
        accordionItems.forEach(el => {
            el.classList.remove('active');
            el.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });
        if (!open) return;
        item.classList.add('active');
        item.querySelector('.accordion-header').setAttribute('aria-expanded', 'true');
        // Closing the section above shifts content up; bring the opened header to the top
        requestAnimationFrame(() => item.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }

    accordionHeaders.forEach(header => {
        header.setAttribute('aria-expanded', header.parentElement.classList.contains('active'));
        header.addEventListener('click', () => {
            const item = header.parentElement;
            setSectionOpen(item, !item.classList.contains('active'));
        });
    });

    // "Aage badhein" button at the end of each section for a guided, step-by-step flow
    accordionItems.forEach((item, i) => {
        const content = item.querySelector('.accordion-content');
        const next = accordionItems[i + 1];
        const btn = document.createElement('button');
        btn.type = 'button';

        if (next) {
            const nextName = next.querySelector('.acc-name').textContent;
            btn.className = 'acc-next';
            btn.innerHTML = `आगे बढ़ें: <strong>${nextName}</strong> <i class="fa-solid fa-arrow-right"></i>`;
            btn.addEventListener('click', () => setSectionOpen(next, true));
        } else {
            // Last section: jump to the preview (only shown on tablet/phone)
            btn.className = 'acc-next acc-next-preview';
            btn.innerHTML = `<i class="fa-solid fa-eye"></i> बायोडेटा देखें`;
            btn.addEventListener('click', () => setMobileView('preview'));
        }
        content.appendChild(btn);
    });

    // --- 2b. Progress bar & per-section status ---
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const editorSidebar = document.querySelector('.editor-sidebar');

    function hasPhoto() {
        return !previewPhoto.src.startsWith('data:image/svg');
    }

    function updateProgress() {
        const fields = Array.from(document.querySelectorAll('.editor-sidebar [data-bind]'));
        const filledFields = fields.filter(f => f.value.trim() !== '').length;
        const total = fields.length + 1; // +1 for the photo
        const done = filledFields + (hasPhoto() ? 1 : 0);
        const percent = total ? Math.round((done / total) * 100) : 0;

        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        progressFill.classList.toggle('complete', percent === 100);
        updatePreviewGuide(percent);

        accordionItems.forEach(item => {
            const status = item.querySelector('.acc-status');
            const sectionFields = item.querySelectorAll('[data-bind]');

            if (item.querySelector('#photoFileInput')) {
                status.className = 'acc-status' + (hasPhoto() ? ' done' : '');
                status.innerHTML = hasPhoto() ? '<i class="fa-solid fa-check"></i>' : 'वैकल्पिक';
                return;
            }
            if (!sectionFields.length) {
                status.className = 'acc-status';
                status.textContent = item.dataset.optional ? 'वैकल्पिक' : '';
                return;
            }
            const filled = Array.from(sectionFields).filter(f => f.value.trim() !== '').length;
            const complete = filled === sectionFields.length;
            status.className = 'acc-status' + (complete ? ' done' : filled ? ' partial' : '');
            status.innerHTML = complete ? '<i class="fa-solid fa-check"></i>' : `${filled}/${sectionFields.length}`;
        });
    }

    // Covers typing, pasting and dynamically added/removed sibling fields
    editorSidebar.addEventListener('input', updateProgress);
    editorSidebar.addEventListener('click', (e) => {
        if (e.target.closest('.btn-add-field, .btn-remove-field')) requestAnimationFrame(updateProgress);
    });

    // --- 2c. Toast notifications ---
    const toast = document.getElementById('toast');
    let toastTimer;

    function showToast(message, type = 'success') {
        const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        toast.className = `toast show ${type}`;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- 3. Colour theme & frame design: chosen on the preview screen (see section 11) ---

    // --- 4. Mantra & Main Title Handling ---
    mantraSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Custom') {
            customMantraGroup.classList.remove('hidden');
            previewMantra.textContent = customMantraInput.value || '|| Mantra ||';
        } else {
            customMantraGroup.classList.add('hidden');
            previewMantra.textContent = e.target.value;
        }
    });

    customMantraInput.addEventListener('input', (e) => {
        previewMantra.textContent = e.target.value || '|| Mantra ||';
    });

    headerTitleInput.addEventListener('input', (e) => {
        previewMainTitle.textContent = e.target.value || 'BIODATA';
    });

    // --- 5. Photo Upload, Cropper & Visibility ---
    let cropper = null;
    const cropModal = document.getElementById('cropModal');
    const imageToCrop = document.getElementById('imageToCrop');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');
    const closeCropModalBtn = document.getElementById('closeCropModalBtn');
    
    // Crop Tool Controls
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const zoomInCropBtn = document.getElementById('zoomInCropBtn');
    const zoomOutCropBtn = document.getElementById('zoomOutCropBtn');
    const aspectPortraitBtn = document.getElementById('aspectPortraitBtn');
    const aspectSquareBtn = document.getElementById('aspectSquareBtn');
    const aspectFreeBtn = document.getElementById('aspectFreeBtn');

    function openCropModal(imageSrc) {
        imageToCrop.src = imageSrc;
        cropModal.classList.remove('hidden');

        if (cropper) {
            cropper.destroy();
        }

        setTimeout(() => {
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 3 / 4,
                viewMode: 1,
                autoCropArea: 0.9,
                responsive: true,
                background: false
            });
        }, 100);
    }

    function closeCropModal() {
        cropModal.classList.add('hidden');
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        photoFileInput.value = '';
    }

    photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                openCropModal(evt.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // The current photo lives in an in-memory object URL; release the old one
    // whenever it is replaced so repeated uploads don't pile up in RAM.
    let photoObjectUrl = null;

    function setPhotoSrc(src) {
        if (photoObjectUrl && photoObjectUrl !== src) URL.revokeObjectURL(photoObjectUrl);
        photoObjectUrl = src.startsWith('blob:') ? src : null;
        editorPhotoPreview.src = src;
        previewPhoto.src = src;
        invalidateShare();
    }

    applyCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        // Keep the crop at the photo's own resolution — a typical phone photo crop
        // (e.g. 2250x3000) is never downscaled. The 4000px cap only stays under the
        // ~16MP canvas limit on iPhones. max* keeps the crop's aspect ratio.
        const canvas = cropper.getCroppedCanvas({
            maxWidth: 4000,
            maxHeight: 4000,
            fillColor: '#ffffff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        closeCropModal();
        if (!canvas) return;

        // PNG = lossless: no JPEG compression artefacts on the face
        canvas.toBlob((blob) => {
            if (!blob) {
                showToast("फोटो लोड नहीं हो पाई, कृपया दोबारा कोशिश करें", "error");
                return;
            }
            setPhotoSrc(URL.createObjectURL(blob));
            updateProgress();
            showToast(`फोटो पूरी क्वालिटी में जुड़ गई (${canvas.width}×${canvas.height})`);
        }, 'image/png');
    });

    cancelCropBtn.addEventListener('click', closeCropModal);
    closeCropModalBtn.addEventListener('click', closeCropModal);

    // Cropper Toolbar buttons
    rotateLeftBtn.addEventListener('click', () => cropper && cropper.rotate(-90));
    rotateRightBtn.addEventListener('click', () => cropper && cropper.rotate(90));
    zoomInCropBtn.addEventListener('click', () => cropper && cropper.zoom(0.1));
    zoomOutCropBtn.addEventListener('click', () => cropper && cropper.zoom(-0.1));

    aspectPortraitBtn.addEventListener('click', () => {
        if (cropper) {
            cropper.setAspectRatio(3 / 4);
            aspectPortraitBtn.className = "btn btn-sm btn-secondary active";
            aspectSquareBtn.className = "btn btn-sm btn-outline";
            aspectFreeBtn.className = "btn btn-sm btn-outline";
        }
    });

    aspectSquareBtn.addEventListener('click', () => {
        if (cropper) {
            cropper.setAspectRatio(1 / 1);
            aspectSquareBtn.className = "btn btn-sm btn-secondary active";
            aspectPortraitBtn.className = "btn btn-sm btn-outline";
            aspectFreeBtn.className = "btn btn-sm btn-outline";
        }
    });

    aspectFreeBtn.addEventListener('click', () => {
        if (cropper) {
            cropper.setAspectRatio(NaN);
            aspectFreeBtn.className = "btn btn-sm btn-secondary active";
            aspectPortraitBtn.className = "btn btn-sm btn-outline";
            aspectSquareBtn.className = "btn btn-sm btn-outline";
        }
    });

    const defaultPlaceholderSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='200' viewBox='0 0 150 200' fill='none'><rect width='150' height='200' fill='%23f1f5f9'/><circle cx='75' cy='70' r='35' fill='%23cbd5e1'/><path d='M25 170C25 130 45 120 75 120C105 120 125 130 125 170' fill='%23cbd5e1'/><text x='75' y='188' font-family='sans-serif' font-size='11' fill='%2364748b' text-anchor='middle'>Photo Upload</text></svg>";

    removePhotoBtn.addEventListener('click', () => {
        setPhotoSrc(defaultPlaceholderSrc);
        photoFileInput.value = '';
        updateProgress();
    });

    showPhotoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            sheetPhotoWrapper.classList.remove('hidden');
        } else {
            sheetPhotoWrapper.classList.add('hidden');
        }
    });

    // --- 6. Zoom Controls ---
    // CSS `zoom` (not transform) so the sheet's layout box shrinks/grows with it:
    // no phantom scroll space when zoomed out, and scrollable (not clipped) when zoomed in.
    const paperWrapper = document.querySelector('.paper-wrapper');
    const SHEET_WIDTH_PX = 794; // 210mm at 96dpi
    const MIN_ZOOM = 25;
    const MAX_ZOOM = 200;

    function updateZoom(newZoom) {
        currentZoom = Math.min(Math.max(MIN_ZOOM, Math.round(newZoom)), MAX_ZOOM);
        zoomLevelSpan.textContent = `${currentZoom}%`;
        biodataSheet.style.zoom = currentZoom / 100;
    }

    // Fit the A4 page to the available preview width (never upscale past 100%)
    // The preview screen shows the design gallery; the real sheet (used for
    // PDF / PNG / WhatsApp) stays at 100% off-screen, so fitting = laying out the gallery.
    function fitSheetToScreen() {
        if (galleryDirty) refreshGallery();
        else layoutGallery();
    }

    zoomInBtn.addEventListener('click', () => updateZoom(currentZoom + 10));
    zoomOutBtn.addEventListener('click', () => updateZoom(currentZoom - 10));
    fitScreenBtn.addEventListener('click', fitSheetToScreen);

    // --- 7. Save as PNG Image ---
    // Everything happens in the browser: nothing is uploaded or stored.
    const EXPORT_MAX_SCALE = 4;             // 4x = 384 DPI on A4 (3176 x 4492 px)
    const EXPORT_MAX_PIXELS = 16000000;     // stay under iOS Safari's ~16.7MP canvas limit
    const SHEET_HEIGHT_PX = 1123;           // 297mm at 96dpi

    function getExportScale() {
        // Use the real (unzoomed) sheet height in case extra siblings made it taller
        const rect = biodataSheet.getBoundingClientRect();
        const height = rect.height > 0 ? Math.max(SHEET_HEIGHT_PX, rect.height / (currentZoom / 100)) : SHEET_HEIGHT_PX;
        const fitScale = Math.sqrt(EXPORT_MAX_PIXELS / (SHEET_WIDTH_PX * height));
        return Math.max(1, Math.min(EXPORT_MAX_SCALE, Math.floor(fitScale * 100) / 100));
    }

    // html2canvas ignores `object-fit: cover`, which stretches the photo in the export.
    // Pre-render the photo at the frame's exact aspect ratio and output resolution.
    // Rows the user left empty show "-" on screen as a hint, but are left out of the
    // PDF/PNG so the biodata doesn't look unfinished. A section with nothing filled
    // is dropped too — except the first one, which sits beside the photo.
    function hideEmptyRows(sheet) {
        const hidden = [];
        sheet.querySelectorAll('.detail-row').forEach(row => {
            const value = row.querySelector('.detail-value');
            const text = value ? value.textContent.trim() : '';
            if (text === '' || text === '-') {
                row.style.display = 'none';
                hidden.push(row);
            }
        });
        sheet.querySelectorAll('.section-block').forEach((section, i) => {
            if (i === 0) return;
            const rows = Array.from(section.querySelectorAll('.detail-row'));
            if (rows.length && rows.every(r => r.style.display === 'none')) {
                section.style.display = 'none';
                hidden.push(section);
            }
        });
        return () => hidden.forEach(el => { el.style.display = ''; });
    }

    // Keep every design on ONE A4 page: if the filled-in content is taller than the
    // page, shrink text + spacing together (CSS variable --fit, see style.css).
    const A4_HEIGHT_PX = 297 / 25.4 * 96;
    const MIN_FIT = 0.7;

    function fitToPage(sheet) {
        let fit = 1;
        sheet.style.setProperty('--fit', '1');
        for (let i = 0; i < 8; i++) {
            const height = sheet.offsetHeight;
            if (!height || height <= A4_HEIGHT_PX + 1) break;
            fit = Math.max(MIN_FIT, Math.floor(fit * (A4_HEIGHT_PX / height) * 1000) / 1000);
            sheet.style.setProperty('--fit', fit);
            if (fit === MIN_FIT) break;
        }
        return fit;
    }

    function newCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w));
        c.height = Math.max(1, Math.round(h));
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        return c;
    }

    // Crop the photo like `object-fit: cover` and resize it to exactly width x height.
    // Large reductions are done in halving steps: a single big jump (e.g. 3000px -> 600px)
    // skips pixels and looks soft/jagged, stepping keeps the face crisp.
    function drawPhotoCover(img, width, height) {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const targetRatio = width / height;
        let sw = nw, sh = nh;
        if (nw / nh > targetRatio) sw = nh * targetRatio; else sh = nw / targetRatio;
        const sx = (nw - sw) / 2;
        const sy = (nh - sh) / 2;

        let current = newCanvas(sw, sh);
        current.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, current.width, current.height);

        while (current.width / 2 >= width && current.height / 2 >= height) {
            const half = newCanvas(current.width / 2, current.height / 2);
            half.getContext('2d').drawImage(current, 0, 0, half.width, half.height);
            current = half;
        }

        const out = newCanvas(width, height);
        out.getContext('2d').drawImage(current, 0, 0, width, height);
        return out;
    }

    async function prepareExportPhoto(clonedDoc, scale) {
        const clonedImg = clonedDoc.getElementById('previewPhoto');
        const src = previewPhoto;
        if (!clonedImg || !src.naturalWidth || src.src.startsWith('data:image/svg')) return;

        const boxW = clonedImg.clientWidth;
        const boxH = clonedImg.clientHeight;
        if (!boxW || !boxH) return;

        const canvas = drawPhotoCover(src, Math.round(boxW * scale), Math.round(boxH * scale));

        await new Promise(resolve => {
            clonedImg.onload = resolve;
            clonedImg.onerror = resolve;
            clonedImg.src = canvas.toDataURL('image/png');
        });
    }

    function renderSheetCanvas(scale) {
        return html2canvas(biodataSheet, {
            scale,
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            // Render the clone at a desktop width so the output is identical
            // on phone, tablet and desktop, even if the preview tab is hidden
            windowWidth: 1400,
            windowHeight: 1800,
            onclone: async (clonedDoc) => {
                clonedDoc.body.style.height = 'auto';
                clonedDoc.body.style.overflow = 'visible';
                clonedDoc.querySelectorAll('.main-container, .preview-area, .paper-wrapper').forEach(el => {
                    el.style.overflow = 'visible';
                    el.style.height = 'auto';
                });
                const clonedPreview = clonedDoc.querySelector('.preview-area');
                if (clonedPreview) clonedPreview.style.display = 'flex';
                const clonedSheet = clonedDoc.getElementById('biodataSheet');
                if (clonedSheet) clonedSheet.style.zoom = '1';
                const clonedHolder = clonedDoc.querySelector('.sheet-holder');
                if (clonedHolder) clonedHolder.style.cssText = 'position:static;left:auto;';
                const clonedPicker = clonedDoc.querySelector('.design-picker');
                if (clonedPicker) clonedPicker.style.display = 'none';
                // No photo added: leave the grey placeholder out of the image
                if (!hasPhoto()) {
                    const clonedPhotoWrapper = clonedDoc.getElementById('sheetPhotoWrapper');
                    if (clonedPhotoWrapper) clonedPhotoWrapper.classList.add('hidden');
                }
                if (clonedSheet) {
                    hideEmptyRows(clonedSheet);
                    fitToPage(clonedSheet);
                }
                await prepareExportPhoto(clonedDoc, scale);
            }
        });
    }

    function canvasToBlob(canvas) {
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }

    // CRC32 for PNG chunks
    const CRC_TABLE = (() => {
        const table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
            table[n] = c >>> 0;
        }
        return table;
    })();

    function crc32(bytes) {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // Write the DPI into the PNG (pHYs chunk) so it prints at exact A4 size
    // instead of the 96 DPI most apps assume for PNGs without it.
    async function setPngDpi(blob, dpi) {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const IHDR_END = 33; // 8-byte signature + 25-byte IHDR chunk
        const head = new TextDecoder('latin1').decode(bytes.subarray(0, 100));
        if (head.includes('pHYs')) return blob;

        const pixelsPerMeter = Math.round(dpi / 0.0254);
        const chunk = new Uint8Array(21);
        const view = new DataView(chunk.buffer);
        view.setUint32(0, 9);                      // data length
        chunk.set([0x70, 0x48, 0x59, 0x73], 4);    // "pHYs"
        view.setUint32(8, pixelsPerMeter);         // X
        view.setUint32(12, pixelsPerMeter);        // Y
        chunk[16] = 1;                             // unit: metre
        view.setUint32(17, crc32(chunk.subarray(4, 17)));

        return new Blob([bytes.subarray(0, IHDR_END), chunk, bytes.subarray(IHDR_END)], { type: 'image/png' });
    }

    function downloadBlob(blob, fileName) {
        // Object URL instead of a data URL: multi-MB data URLs fail on many phones
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    async function generateBiodataPng() {
        // Make sure web fonts (Hindi, Cinzel, Playfair) are ready so text isn't rendered in a fallback font
        if (document.fonts && document.fonts.ready) await document.fonts.ready;

        let scale = getExportScale();
        let canvas = await renderSheetCanvas(scale);
        let blob = await canvasToBlob(canvas);

        // Low-memory devices can return an empty canvas at high scale; retry at 2x
        if (!blob && scale > 2) {
            scale = 2;
            canvas = await renderSheetCanvas(scale);
            blob = await canvasToBlob(canvas);
        }
        if (!blob) throw new Error('Canvas export failed');

        blob = await setPngDpi(blob, 96 * scale);

        const nameInput = document.querySelector('[data-bind="name"]');
        const candidateName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Vijay_Panche';
        const fileName = `${candidateName.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_')}_Biodata.png`;
        return { blob, fileName, candidateName: nameInput ? nameInput.value.trim() : '' };
    }

    function setBusy(btn, busyLabel) {
        const original = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${busyLabel}</span>`;
        btn.disabled = true;
        return () => {
            btn.innerHTML = original;
            btn.disabled = false;
        };
    }

    // --- Google Sheet Data Sync ---
    window.GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbw9mu5VRV-Yp9ph_7VgStUK6lKDC_S2biU0FjvFnX86K8oWHryssHO0JtCVsc3ilDu1BQ/exec";
    function getFieldValue(bindKey) {
        const el = document.querySelector(`[data-bind="${bindKey}"]`);
        return el ? el.value.trim() : "";
    }

    function getSiblingsSummary(type) {
        const items = Array.from(document.querySelectorAll(`[data-bind^="${type}"]`));
        return items.map(i => i.value.trim()).filter(v => v !== "").join(" | ");
    }

    function collectFormData() {
        return {
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name: getFieldValue('name'),
            dob: getFieldValue('dob'),
            bloodGroup: getFieldValue('bloodGroup'),
            birthPlace: getFieldValue('birthPlace'),
            height: getFieldValue('height'),
            subcaste: getFieldValue('subcaste') || 'Marar',
            caste: getFieldValue('caste'),
            rashi: getFieldValue('rashi'),
            education: getFieldValue('education'),
            occupation: getFieldValue('occupation'),
            hobbies: getFieldValue('hobbies'),
            fatherName: getFieldValue('fatherName'),
            fatherOcc: getFieldValue('fatherOcc'),
            motherName: getFieldValue('motherName'),
            motherOcc: getFieldValue('motherOcc'),
            brothers: getSiblingsSummary('brother'),
            sisters: getSiblingsSummary('sister'),
            grandFatherName: getFieldValue('grandFatherName'),
            grandMotherName: getFieldValue('grandMotherName'),
            phone: getFieldValue('phone'),
            address: getFieldValue('address')
        };
    }

    async function syncDataToSheet() {
        const data = collectFormData();
        if (!data.name) data.name = "N/A";

        const WEBHOOK_URL = window.GOOGLE_SHEET_WEBHOOK_URL || localStorage.getItem('biodata_sheet_webhook') || "";
        if (!WEBHOOK_URL) return;

        try {
            const params = new URLSearchParams();
            Object.keys(data).forEach(key => params.append(key, data[key] || ""));

            await fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: params
            });
            console.log("✅ Biodata synced to Google Sheet!");
            showToast("डेटा Google Sheet में सेव हो गया ✅");
        } catch (err) {
            console.error("Google Sheet Sync Error:", err);
        }
    }

    downloadPngBtn.addEventListener('click', async () => {
        const done = setBusy(downloadPngBtn, 'बन रहा है...');
        try {
            const { blob, fileName } = await generateBiodataPng();
            downloadBlob(blob, fileName);
            showToast("PNG सेव हो गया — फ़ोन के Downloads में देखें");
            syncDataToSheet();
        } catch (err) {
            console.error("PNG export error:", err);
            showToast("PNG सेव नहीं हो पाया, कृपया दोबारा कोशिश करें", "error");
        } finally {
            done();
        }
    });

    // --- 7b. WhatsApp / Share (Web Share API with the PNG file) ---
    const shareBtn = document.getElementById('shareBtn');
    const canShareFiles = (() => {
        try {
            return !!(navigator.canShare && navigator.canShare({
                files: [new File([new Blob(['x'])], 'test.png', { type: 'image/png' })]
            }));
        } catch (e) {
            return false;
        }
    })();

    // A generated file is kept until the biodata changes. Browsers (esp. iPhone Safari)
    // only allow sharing right after a tap, so if generating took too long the
    // second tap shares this ready file instantly.
    let readyShare = null;
    function invalidateShare() {
        if (!readyShare) return;
        readyShare = null;
        shareBtn.classList.remove('share-ready');
    }

    async function shareFile(share) {
        const file = new File([share.blob], share.fileName, { type: 'image/png' });
        const who = share.candidateName ? `${share.candidateName} का ` : '';
        await navigator.share({
            files: [file],
            title: `${who}बायोडेटा`,
            text: `${who}बायोडेटा — Marar Mali Samaj`
        });
    }

    if (canShareFiles) {
        shareBtn.classList.remove('hidden');
        document.getElementById('pdfHelpShareTip').classList.remove('hidden');

        shareBtn.addEventListener('click', async () => {
            if (readyShare) {
                try {
                    await shareFile(readyShare);
                } catch (err) {
                    if (err.name !== 'AbortError') showToast("भेजा नहीं जा सका, कृपया PNG सेव करके भेजें", "error");
                }
                return;
            }

            const done = setBusy(shareBtn, 'तैयार हो रहा है...');
            let share;
            try {
                share = await generateBiodataPng();
            } catch (err) {
                console.error("Share export error:", err);
                showToast("बायोडेटा तैयार नहीं हो पाया, कृपया दोबारा कोशिश करें", "error");
                done();
                return;
            }
            done();

            try {
                await shareFile(share);
            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    readyShare = share;
                    shareBtn.classList.add('share-ready');
                    showToast("बायोडेटा तैयार है — भेजने के लिए WhatsApp बटन फिर से दबाएं");
                } else if (err.name !== 'AbortError') {
                    showToast("भेजा नहीं जा सका, कृपया PNG सेव करके भेजें", "error");
                }
            }
        });
    }

    // --- 8. Print / PDF Download ---
    // Print CSS forces zoom:1 and shows the sheet even from the mobile editor tab
    // Non-technical users often don't know to pick "Save as PDF" on the print screen,
    // so explain it first (can be switched off with "don't show again").
    const pdfHelpModal = document.getElementById('pdfHelpModal');
    const pdfHelpDontShow = document.getElementById('pdfHelpDontShow');
    const PDF_HELP_KEY = 'biodata.hidePdfHelp';

    function readPref(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function writePref(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* private mode: ignore */ }
    }

    function closePdfHelp() {
        pdfHelpModal.classList.add('hidden');
    }

    downloadPdfBtn.addEventListener('click', () => {
        syncDataToSheet();
        if (readPref(PDF_HELP_KEY) === '1') {
            window.print();
            return;
        }
        pdfHelpDontShow.checked = false;
        pdfHelpModal.classList.remove('hidden');
        document.getElementById('pdfHelpContinue').focus();
    });

    document.getElementById('pdfHelpContinue').addEventListener('click', () => {
        if (pdfHelpDontShow.checked) writePref(PDF_HELP_KEY, '1');
        closePdfHelp();
        window.print();
    });
    document.getElementById('pdfHelpCancel').addEventListener('click', closePdfHelp);
    document.getElementById('pdfHelpClose').addEventListener('click', closePdfHelp);
    pdfHelpModal.addEventListener('click', (e) => {
        if (e.target === pdfHelpModal) closePdfHelp();
    });

    // --- 8. Clear Form ---
    resetDataBtn.addEventListener('click', () => {
        if (confirm("क्या आप भरी हुई सारी जानकारी और फोटो मिटाना चाहते हैं?\n\nमिटाने के बाद यह वापस नहीं आएगी।")) {
            // Clear all static inputs (subcaste defaults to Marar)
            document.querySelectorAll('[data-bind]').forEach(input => {
                const key = input.getAttribute('data-bind');
                const isSubcaste = key === 'subcaste';
                input.value = isSubcaste ? "Marar" : "";
                const targetView = document.querySelector(`[data-view="${key}"]`);
                if (targetView) targetView.textContent = isSubcaste ? "Marar" : "-";
            });
            
            // Reset header controls
            mantraSelect.value = "|| ॐ श्री गणेशाय नमः ||";
            customMantraGroup.classList.add('hidden');
            previewMantra.textContent = "|| ॐ श्री गणेशाय नमः ||";
            headerTitleInput.value = "BIODATA";
            previewMainTitle.textContent = "BIODATA";
            
            // Reset photo
            setPhotoSrc(defaultPlaceholderSrc);
            showPhotoToggle.checked = true;
            sheetPhotoWrapper.classList.remove('hidden');

            // Reset dynamic brothers — keep only 1 empty field
            brotherContainer.innerHTML = `
                <div class="dynamic-field-item" data-index="1">
                    <input type="text" data-bind="brother1" class="form-control" placeholder="भाई 1 - नाम एवं जॉब विवरण">
                </div>
            `;
            previewBrothersContainer.innerHTML = `
                <div class="detail-row" data-preview-brother="1">
                    <div class="detail-label">भाई 1 (Brother 1)</div>
                    <div class="detail-colon">:</div>
                    <div class="detail-value" data-view="brother1">-</div>
                </div>
            `;
            brotherCount = 1;
            bindInput(brotherContainer.querySelector('[data-bind="brother1"]'));

            // Reset dynamic sisters — keep only 1 empty field
            sisterContainer.innerHTML = `
                <div class="dynamic-field-item" data-index="1">
                    <input type="text" data-bind="sister1" class="form-control" placeholder="बहन 1 - नाम एवं विवरण">
                </div>
            `;
            previewSistersContainer.innerHTML = '';
            // Add first sister preview row
            const firstSisterPreview = createPreviewRow('sister', 1);
            previewSistersContainer.appendChild(firstSisterPreview);
            sisterCount = 1;
            bindInput(sisterContainer.querySelector('[data-bind="sister1"]'));

            updateProgress();
            showToast("फॉर्म साफ़ हो गया");
        }
    });

    // --- 9. Mobile View Toggle (Editor ↔ Preview) ---
    const mobileEditorBtn = document.getElementById('mobileEditorBtn');
    const mobilePreviewBtn = document.getElementById('mobilePreviewBtn');
    const mainContainer = document.querySelector('.main-container');

    function isMobileView() {
        return window.innerWidth <= 992;
    }

    function setMobileView(view) {
        if (!mainContainer) return;
        mainContainer.classList.remove('show-editor', 'show-preview');
        mainContainer.classList.add(view === 'editor' ? 'show-editor' : 'show-preview');

        if (mobileEditorBtn && mobilePreviewBtn) {
            mobileEditorBtn.classList.toggle('active', view === 'editor');
            mobilePreviewBtn.classList.toggle('active', view === 'preview');
            mobileEditorBtn.setAttribute('aria-pressed', view === 'editor');
            mobilePreviewBtn.setAttribute('aria-pressed', view === 'preview');
        }

        // Same A4 page on every device — just scale it to the screen width
        if (view === 'preview') {
            requestAnimationFrame(fitSheetToScreen);
        }
    }

    if (mobileEditorBtn) {
        mobileEditorBtn.addEventListener('click', () => setMobileView('editor'));
    }

    if (mobilePreviewBtn) {
        mobilePreviewBtn.addEventListener('click', () => setMobileView('preview'));
    }

    // --- 10. Guidance for first-time / non-technical users ---

    // 10a. Status above the preview: what is still missing, with a button that
    //      jumps straight to the first empty field.
    const previewGuide = document.getElementById('previewGuide');
    const pgIcon = document.getElementById('pgIcon');
    const pgMessage = document.getElementById('pgMessage');
    const pgAction = document.getElementById('pgAction');
    let pgTarget = null;

    function firstEmptyField() {
        for (const item of accordionItems) {
            const empty = Array.from(item.querySelectorAll('[data-bind]')).find(f => f.value.trim() === '');
            if (empty) return { item, field: empty };
        }
        return null;
    }

    function goToField(target) {
        if (!target) return;
        if (isMobileView()) setMobileView('editor');
        setSectionOpen(target.item, true);
        // wait for the section to open/scroll, then put the cursor in the field
        if (target.field) setTimeout(() => target.field.focus({ preventScroll: false }), 350);
    }

    function updatePreviewGuide(percent) {
        const nameField = document.querySelector('[data-bind="name"]');
        const where = window.innerWidth <= 768 ? 'नीचे' : 'ऊपर';
        let state, icon, message, action = '';

        if (percent === 0) {
            state = 'warn'; icon = 'fa-pen-to-square';
            message = 'अभी कोई जानकारी नहीं भरी गई है';
            action = '<i class="fa-solid fa-pen"></i> जानकारी भरें';
            pgTarget = { item: nameField.closest('.accordion-item'), field: nameField };
        } else if (!nameField.value.trim()) {
            state = 'warn'; icon = 'fa-user-pen';
            message = 'नाम अभी नहीं भरा गया है';
            action = '<i class="fa-solid fa-pen"></i> नाम भरें';
            pgTarget = { item: nameField.closest('.accordion-item'), field: nameField };
        } else if (!hasPhoto() && showPhotoToggle.checked) {
            state = 'info'; icon = 'fa-camera';
            message = 'फोटो अभी नहीं लगाई गई है';
            action = '<i class="fa-solid fa-camera"></i> फोटो लगाएं';
            pgTarget = { item: photoFileInput.closest('.accordion-item'), field: null };
        } else if (percent < 100) {
            state = 'info'; icon = 'fa-list-check';
            message = `बायोडेटा ${percent}% भरा गया है · खाली लाइनें PDF में नहीं आएंगी`;
            action = '<i class="fa-solid fa-pen"></i> बाकी जानकारी भरें';
            pgTarget = firstEmptyField();
            if (!pgTarget) action = '';
        } else {
            state = 'success'; icon = 'fa-circle-check';
            message = `बायोडेटा तैयार है! ${where} PDF या WhatsApp दबाएं`;
            pgTarget = null;
        }

        previewGuide.className = `preview-guide ${state}`;
        pgIcon.className = `fa-solid ${icon}`;
        pgMessage.textContent = message;
        pgAction.innerHTML = action;
        pgAction.classList.toggle('hidden', !action);
    }

    pgAction.addEventListener('click', () => goToField(pgTarget));

    // 10c. "How it works" card, dismissible (remembered on this device only)
    const HOW_KEY = 'biodata.hideHowTo';
    const howCard = document.getElementById('howItWorks');
    if (readPref(HOW_KEY) === '1') howCard.classList.add('hidden');
    document.getElementById('howClose').addEventListener('click', () => {
        howCard.classList.add('hidden');
        writePref(HOW_KEY, '1');
    });

    // "बायोडेटा कैसे बनाएं?" brings the guide back after it was closed
    document.getElementById('showHowBtn').addEventListener('click', () => {
        howCard.classList.remove('hidden');
        writePref(HOW_KEY, '0');
        editorSidebar.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('footerPreviewBtn').addEventListener('click', () => setMobileView('preview'));

    // 10d. A ready-to-share file is stale once anything changes
    ['input', 'change', 'click'].forEach(evt => editorSidebar.addEventListener(evt, invalidateShare));

    // 10e. Nothing is stored anywhere, so warn before a refresh/back wipes the form
    window.addEventListener('beforeunload', (e) => {
        const hasData = hasPhoto() ||
            Array.from(document.querySelectorAll('.editor-sidebar [data-bind]')).some(f => f.value.trim() !== '');
        if (hasData) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // 10f. Keyboard "Enter / Next" moves to the next field; after the last field
    //       of a section it opens the next section.
    editorSidebar.querySelectorAll('input.form-control').forEach(i => i.setAttribute('enterkeyhint', 'next'));

    editorSidebar.addEventListener('keydown', (e) => {
        const field = e.target;
        if (e.key !== 'Enter' || field.tagName !== 'INPUT' || !field.classList.contains('form-control')) return;
        e.preventDefault();
        const content = field.closest('.accordion-content');
        if (!content) return;
        const fields = Array.from(content.querySelectorAll('input.form-control, textarea.form-control'))
            .filter(f => f.offsetParent !== null);
        const next = fields[fields.indexOf(field) + 1];
        if (next) {
            next.focus();
        } else {
            field.blur();
            const nextBtn = content.querySelector('.acc-next');
            if (nextBtn) nextBtn.click();
        }
    });

    // 10g. On phones, hide the bottom action bar while the keyboard is open so the
    //      form keeps the space. (Class on <html>: <body>'s class is used by themes.)
    const isFormField = el => el && el.matches && el.matches('input.form-control, textarea.form-control, select.form-control');
    editorSidebar.addEventListener('focusin', (e) => {
        if (isFormField(e.target)) document.documentElement.classList.add('is-typing');
    });
    editorSidebar.addEventListener('focusout', () => {
        // moving between two fields fires focusout then focusin; wait a tick
        setTimeout(() => {
            if (!isFormField(document.activeElement)) document.documentElement.classList.remove('is-typing');
        }, 50);
    });

    // 10h. The grey "Photo Upload" placeholder is only a hint on screen — it is left
    //      out of the printed PDF when no photo was added.
    let photoHiddenForPrint = false;
    let restoreEmptyRows = null;
    window.addEventListener('beforeprint', () => {
        restoreEmptyRows = hideEmptyRows(biodataSheet);
        fitToPage(biodataSheet);
        photoHiddenForPrint = !hasPhoto() && !sheetPhotoWrapper.classList.contains('hidden');
        if (photoHiddenForPrint) sheetPhotoWrapper.classList.add('hidden');
    });
    window.addEventListener('afterprint', () => {
        if (photoHiddenForPrint) sheetPhotoWrapper.classList.remove('hidden');
        photoHiddenForPrint = false;
        if (restoreEmptyRows) restoreEmptyRows();
        restoreEmptyRows = null;
        fitToPage(biodataSheet);
    });

    showPhotoToggle.addEventListener('change', updateProgress);

    // --- 11. Design gallery: the user's biodata in every frame, plus colour choice ---
    const THEMES = [
        ['theme-maroon', 'मरून', '#7a1c2c'],
        ['theme-rose', 'गुलाबी', '#9f1239'],
        ['theme-saffron', 'केसरिया', '#c2410c'],
        ['theme-gold', 'सुनहरा', '#b08123'],
        ['theme-chocolate', 'भूरा', '#78350f'],
        ['theme-emerald', 'हरा', '#14532d'],
        ['theme-peacock', 'मोरपंखी', '#0f766e'],
        ['theme-navy', 'नीला', '#1e3a8a'],
        ['theme-lavender', 'बैंगनी', '#6d28d9'],
        ['theme-midnight', 'काला', '#1e293b']
    ];
    const PRESETS = [
        ['preset-royal', 'Royal Traditional', 'fa-crown'],
        ['preset-modern', 'Modern Pill', 'fa-wand-magic-sparkles'],
        ['preset-floral', 'Floral Arch', 'fa-leaf'],
        ['preset-minimal', 'Minimal Classic', 'fa-vector-square'],
        ['preset-mandala', 'Mandala Style', 'fa-circle-notch'],
        ['preset-paisley', 'Paisley Ornate', 'fa-spa'],
        ['preset-ribbon', 'Elegant Ribbon', 'fa-ribbon'],
        ['preset-double-gold', 'Double Frame', 'fa-border-all'],
        ['preset-vintage-gold', 'Vintage Gold', 'fa-gem'],
        ['preset-royal-credenza', 'Royal Palace', 'fa-award'],
        ['preset-ethnic-mandap', 'Ethnic Mandap', 'fa-archway'],
        ['preset-lotus-divine', 'Lotus Divine', 'fa-sun'],
        ['preset-classic-card', 'Invitation Card', 'fa-envelope-open-text'],
        ['preset-modern-split', 'Modern Split', 'fa-table-columns'],
        ['preset-swastik-blessing', 'Mangalik Blessings', 'fa-hands-praying'],
        ['preset-crown-emperor', 'Crown Emperor', 'fa-chess-king']
    ];
    const swatchRow = document.getElementById('swatchRow');
    const designGallery = document.getElementById('designGallery');
    let galleryDirty = true;
    let galleryTimer;

    function currentPreset() {
        const found = PRESETS.find(p => biodataSheet.classList.contains(p[0]));
        return found ? found[0] : 'preset-royal';
    }

    function currentTheme() {
        const found = THEMES.find(t => document.body.classList.contains(t[0]));
        return found ? found[0] : 'theme-maroon';
    }

    // Colour swatches
    const swatches = THEMES.map(([cls, name, color]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-label', name);
        btn.innerHTML = `<span class="swatch-dot" style="background:${color}"></span><span class="swatch-name">${name}</span>`;
        btn.addEventListener('click', () => applyTheme(cls));
        swatchRow.appendChild(btn);
        return { cls, btn };
    });

    function markTheme() {
        const theme = currentTheme();
        swatches.forEach(sw => {
            sw.btn.classList.toggle('selected', sw.cls === theme);
            sw.btn.setAttribute('aria-checked', sw.cls === theme);
        });
    }

    function applyTheme(theme) {
        // theme lives on <body>; every gallery card follows it through CSS variables
        document.body.className = theme;
        markTheme();
        invalidateShare();
    }

    // Design cards
    const cards = PRESETS.map(([cls, name, icon], i) => {
        const card = document.createElement('div');
        card.className = 'design-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'radio');
        card.innerHTML = `
            <div class="design-card-head">
                <span class="design-name"><span class="design-num">${i + 1}</span><i class="fa-solid ${icon}"></i> ${name}</span>
                <span class="design-pick"></span>
            </div>
            <div class="design-card-body"></div>`;
        const choose = () => {
            applyPreset(cls);
            openDesignSheet();
        };
        card.addEventListener('click', choose);
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
        });
        designGallery.appendChild(card);
        return { cls, card, body: card.querySelector('.design-card-body'), pick: card.querySelector('.design-pick') };
    });

    function markPreset() {
        const preset = currentPreset();
        cards.forEach(c => {
            const on = c.cls === preset;
            c.card.classList.toggle('selected', on);
            c.card.setAttribute('aria-checked', on);
            c.pick.innerHTML = on ? '<i class="fa-solid fa-check"></i> चुना गया' : 'चुनें';
        });
    }

    function applyPreset(preset) {
        if (preset === currentPreset()) return;
        biodataSheet.className = `biodata-sheet ${preset}`;
        markPreset();
        invalidateShare();
    }

    function layoutGallery() {
        cards.forEach(c => {
            const sheet = c.body.firstElementChild;
            const width = c.body.clientWidth;
            if (sheet && width) sheet.style.zoom = width / SHEET_WIDTH_PX;
        });
    }

    // Re-draw every card from the real sheet (same data, photo, colour), each in its own frame
    function refreshGallery() {
        if (designGallery.offsetParent === null) {   // preview not on screen (phone editor tab)
            galleryDirty = true;
            return;
        }
        galleryDirty = false;
        cards.forEach(c => {
            const clone = biodataSheet.cloneNode(true);
            clone.removeAttribute('id');
            clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            clone.querySelectorAll('[data-view]').forEach(el => el.removeAttribute('data-view'));
            clone.className = `biodata-sheet ${c.cls}`;
            clone.style.zoom = '';
            clone.setAttribute('aria-hidden', 'true');
            c.body.replaceChildren(clone);
        });
        markPreset();
        layoutGallery();
    }

    // Any change to the real sheet (typing, photo, siblings, mantra...) refreshes the cards
    new MutationObserver(() => {
        clearTimeout(galleryTimer);
        galleryTimer = setTimeout(() => {
            fitToPage(biodataSheet);
            refreshGallery();
        }, 250);
    }).observe(biodataSheet, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['class', 'src']
    });

    fitToPage(biodataSheet);
    // web fonts change text height once they arrive
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            fitToPage(biodataSheet);
            galleryDirty = true;
            fitSheetToScreen();
        });
    }

    // --- 12. Bottom sheet: full view of the chosen design + save / share ---
    const designSheet = document.getElementById('designSheet');
    const bsheetPanel = designSheet.querySelector('.bsheet-panel');
    const bsheetBody = document.getElementById('bsheetBody');
    const bsheetTitle = document.getElementById('bsheetTitle');
    const bsheetZoom = document.getElementById('bsheetZoom');
    let sheetZoomed = false;

    if (canShareFiles) designSheet.querySelector('[data-act="share"]').classList.remove('hidden');

    function isSheetOpen() {
        return !designSheet.classList.contains('hidden');
    }

    function layoutSheetView() {
        const page = bsheetBody.firstElementChild;
        if (!page) return;
        const style = getComputedStyle(bsheetBody);
        const width = bsheetBody.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        page.style.zoom = sheetZoomed ? 1 : Math.min(1, width / SHEET_WIDTH_PX);
        bsheetZoom.innerHTML = sheetZoomed
            ? '<i class="fa-solid fa-magnifying-glass-minus"></i>'
            : '<i class="fa-solid fa-magnifying-glass-plus"></i>';
        bsheetZoom.setAttribute('aria-label', sheetZoomed ? 'पूरा पेज देखें' : 'बड़ा करके देखें');
    }

    function openDesignSheet() {
        const clone = biodataSheet.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        clone.querySelectorAll('[data-view]').forEach(el => el.removeAttribute('data-view'));
        clone.style.zoom = '';
        clone.setAttribute('aria-hidden', 'true');
        bsheetBody.replaceChildren(clone);

        const preset = PRESETS.find(p => p[0] === currentPreset());
        bsheetTitle.innerHTML = `<i class="fa-solid ${preset[2]}"></i> ${preset[1]}`;

        sheetZoomed = false;
        bsheetPanel.style.transform = '';
        designSheet.classList.remove('hidden');
        bsheetBody.scrollTo(0, 0);
        requestAnimationFrame(layoutSheetView);

        // phone "back" closes the sheet instead of leaving the page
        if (!(history.state && history.state.designSheet)) history.pushState({ designSheet: true }, '');
    }

    function hideDesignSheet() {
        designSheet.classList.add('hidden');
        bsheetBody.replaceChildren();
    }

    function closeDesignSheet() {
        if (history.state && history.state.designSheet) history.back();   // popstate hides it
        else hideDesignSheet();
    }

    window.addEventListener('popstate', () => {
        if (isSheetOpen()) hideDesignSheet();
    });

    designSheet.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeDesignSheet));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isSheetOpen()) closeDesignSheet();
    });

    // Tap the page (or the magnifier) to switch between whole page and 100%
    function toggleSheetZoom() {
        sheetZoomed = !sheetZoomed;
        layoutSheetView();
    }
    bsheetZoom.addEventListener('click', toggleSheetZoom);
    bsheetBody.addEventListener('click', toggleSheetZoom);

    // Save / share straight from the sheet (same actions as the main buttons)
    designSheet.querySelector('[data-act="png"]').addEventListener('click', () => downloadPngBtn.click());
    designSheet.querySelector('[data-act="share"]').addEventListener('click', () => shareBtn.click());
    designSheet.querySelector('[data-act="pdf"]').addEventListener('click', () => downloadPdfBtn.click());

    // Swipe the header down to close
    const grab = designSheet.querySelector('.bsheet-grab');
    let dragStartY = null;
    grab.addEventListener('touchstart', e => {
        dragStartY = e.touches[0].clientY;
        bsheetPanel.style.transition = 'none';
    }, { passive: true });
    grab.addEventListener('touchmove', e => {
        if (dragStartY === null) return;
        const dy = Math.max(0, e.touches[0].clientY - dragStartY);
        bsheetPanel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    grab.addEventListener('touchend', e => {
        if (dragStartY === null) return;
        const dy = e.changedTouches[0].clientY - dragStartY;
        dragStartY = null;
        bsheetPanel.style.transition = '';
        if (dy > 110) closeDesignSheet();
        else bsheetPanel.style.transform = '';
    });

    window.addEventListener('resize', () => {
        if (isSheetOpen()) layoutSheetView();
    });

    markTheme();
    markPreset();

    updateProgress();

    // Set initial state
    if (isMobileView()) {
        setMobileView('editor');
    } else {
        fitSheetToScreen();
    }
    // Web fonts change nothing about the sheet width, but re-fit once layout settles
    window.addEventListener('load', fitSheetToScreen);

    // Handle resize / orientation change
    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Mobile browsers fire resize when the address bar or keyboard
            // shows/hides; only react to real width changes
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;

            if (isMobileView()) {
                if (!mainContainer.classList.contains('show-editor') && !mainContainer.classList.contains('show-preview')) {
                    setMobileView('editor');
                }
            } else {
                mainContainer.classList.remove('show-editor', 'show-preview');
            }
            fitSheetToScreen();
        }, 150);
    });

});
