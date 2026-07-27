/**
 * VizualizatorPRO - Core Application Logic & Canvas Engine
 */

// Global State
const state = {
  bgImage: null,
  points: [], // Array of {x, y}
  selectedModel: 'alu_horiz',
  selectedRal: '#374151', // Default RAL 7016 Antracit
  selectedRalName: 'RAL 7016 Antracit',
  fenceHeightCm: 100,
  knownLengthMeters: 5.0,
  slatGapCm: 3,
  pricePerMeter: 140, // Base price €/m
  vatRate: 0.095, // 9.5% DDV za stanovanjske objekte
  customer: {
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  }
};

// Model Presets & Pricing
const MODELS = {
  alu_horiz: { name: 'ALU Letve Horizontalne', icon: '❚❚❚', basePrice: 140, unit: 'm' },
  alu_vert: { name: 'ALU Letve Vertikalne', icon: '|||', basePrice: 155, unit: 'm' },
  glass: { name: 'Steklena Ograja z Inox Nosilci', icon: '░░░', basePrice: 220, unit: 'm' },
  inox: { name: 'Inox Cevna Ograja', icon: '≡≡≡', basePrice: 165, unit: 'm' },
  wrought: { name: 'Kovinska Ograja (Kovana)', icon: '⚓', basePrice: 185, unit: 'm' }
};

const RAL_COLORS = [
  { code: 'RAL 7016', name: 'Antracit siva', hex: '#374151' },
  { code: 'RAL 9005', name: 'Črna mat', hex: '#111827' },
  { code: 'RAL 9016', name: 'Bela prometna', hex: '#f9fafb' },
  { code: 'RAL 8019', name: 'Temno rjava', hex: '#451a03' },
  { code: 'Wood-01', name: 'Zlati hrast (Les)', hex: '#b45309' }
];

// Canvas Setup
let canvas, ctx;
let isDrawing = false;
let isDraggingPoint = -1;

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initEventListeners();
  loadDemoBackground();
  updateCalculation();
});

function initCanvas() {
  canvas = document.getElementById('mainCanvas');
  ctx = canvas.getContext('2d');

  // Set default canvas dimensions
  canvas.width = 1000;
  canvas.height = 650;
  renderCanvas();
}

function loadDemoBackground() {
  // Create a clean vector demo background of a modern house balcony
  const img = new Image();
  const demoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
      </defs>
      <!-- Sky & Background -->
      <rect width="1000" height="650" fill="url(#sky)"/>
      <!-- House Wall -->
      <polygon points="100,100 900,100 900,580 100,580" fill="url(#wall)"/>
      <!-- Roof Header -->
      <rect x="80" y="80" width="840" height="25" fill="#334155"/>
      <!-- Large Terrace Glass Window -->
      <rect x="250" y="150" width="500" height="300" fill="#0284c7" opacity="0.3" stroke="#0f172a" stroke-width="4"/>
      <!-- Concrete Slab Floor -->
      <polygon points="150,450 850,450 870,490 130,490" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
      <!-- Decorative Pillers -->
      <rect x="180" y="150" width="40" height="300" fill="url(#wood)"/>
      <rect x="780" y="150" width="40" height="300" fill="url(#wood)"/>
      <!-- Text Indicator -->
      <text x="500" y="300" fill="#64748b" font-family="sans-serif" font-size="22" text-anchor="middle" font-weight="bold">FOTOGRAFIJA OBJEKTA (KLIKNI ZA RISANJE OGRAJE)</text>
    </svg>
  `;
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(demoSvg)));
  img.onload = () => {
    state.bgImage = img;
    // Set demo initial fence line points
    state.points = [
      { x: 160, y: 445 },
      { x: 840, y: 445 }
    ];
    renderCanvas();
    updateCalculation();
  };
}

function initEventListeners() {
  // File Upload
  const uploadInput = document.getElementById('imageUpload');
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          state.bgImage = img;
          canvas.width = Math.min(img.width, 1200);
          canvas.height = (img.height / img.width) * canvas.width;
          state.points = [
            { x: canvas.width * 0.15, y: canvas.height * 0.7 },
            { x: canvas.width * 0.85, y: canvas.height * 0.7 }
          ];
          renderCanvas();
          updateCalculation();
          showToast('Fotografija uspešno naložena!');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Canvas Mouse & Touch Events for Point Dragging & Node Addition
  canvas.addEventListener('mousedown', onCanvasMouseDown);
  canvas.addEventListener('mousemove', onCanvasMouseMove);
  canvas.addEventListener('mouseup', onCanvasMouseUp);

  // Model Selection Buttons
  document.querySelectorAll('.model-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.model-option').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
      state.selectedModel = el.dataset.model;
      state.pricePerMeter = MODELS[state.selectedModel].basePrice;
      renderCanvas();
      updateCalculation();
    });
  });

  // RAL Color Selection
  document.querySelectorAll('.ral-swatch').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.ral-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      state.selectedRal = el.dataset.hex;
      state.selectedRalName = el.dataset.code + ' ' + el.dataset.name;
      renderCanvas();
    });
  });

  // Controls Inputs
  document.getElementById('fenceHeight').addEventListener('input', (e) => {
    state.fenceHeightCm = parseInt(e.target.value) || 100;
    renderCanvas();
    updateCalculation();
  });

  document.getElementById('knownLength').addEventListener('input', (e) => {
    state.knownLengthMeters = parseFloat(e.target.value) || 1.0;
    updateCalculation();
  });

  document.getElementById('slatGap').addEventListener('input', (e) => {
    state.slatGapCm = parseInt(e.target.value) || 3;
    renderCanvas();
    updateCalculation();
  });

  document.getElementById('vatSelect').addEventListener('change', (e) => {
    state.vatRate = parseFloat(e.target.value);
    updateCalculation();
  });

  // Reset & Clear Buttons
  document.getElementById('resetPointsBtn').addEventListener('click', () => {
    state.points = [
      { x: canvas.width * 0.15, y: canvas.height * 0.7 },
      { x: canvas.width * 0.85, y: canvas.height * 0.7 }
    ];
    renderCanvas();
    updateCalculation();
    showToast('Točke ponastavljene');
  });

  document.getElementById('addPointBtn').addEventListener('click', () => {
    if (state.points.length > 0) {
      const last = state.points[state.points.length - 1];
      state.points.push({ x: last.x + 50, y: last.y - 20 });
      renderCanvas();
      updateCalculation();
      showToast('Dodana nova točka ograje');
    }
  });

  // Modal Triggers
  document.getElementById('generatePdfBtn').addEventListener('click', openQuoteModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('quoteForm').addEventListener('submit', handleQuoteSubmit);

  // Signature Pad Init
  initSignaturePad();
}

// Canvas Interaction Logic
function onCanvasMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  // Check if clicked near an existing node point
  for (let i = 0; i < state.points.length; i++) {
    const pt = state.points[i];
    const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
    if (dist < 15) {
      isDraggingPoint = i;
      return;
    }
  }
}

function onCanvasMouseMove(e) {
  if (isDraggingPoint >= 0) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    state.points[isDraggingPoint].x = (e.clientX - rect.left) * scaleX;
    state.points[isDraggingPoint].y = (e.clientY - rect.top) * scaleY;
    renderCanvas();
    updateCalculation();
  }
}

function onCanvasMouseUp() {
  isDraggingPoint = -1;
}

// Render Engine
function renderCanvas() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Background Image
  if (state.bgImage) {
    ctx.drawImage(state.bgImage, 0, 0, canvas.width, canvas.height);
  }

  if (state.points.length < 2) return;

  // 2. Render 3D/2D Fence Structure along node points
  ctx.save();

  // Draw Segment Lines and Fence Mesh
  for (let i = 0; i < state.points.length - 1; i++) {
    const p1 = state.points[i];
    const p2 = state.points[i + 1];

    drawFenceSegment(p1, p2);
  }

  // 3. Draw Interactive Node Points
  state.points.forEach((pt, index) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Node Index Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`T${index + 1}`, pt.x - 8, pt.y - 14);
  });

  ctx.restore();
}

function drawFenceSegment(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const segmentPixelLen = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const fenceHeightPx = (state.fenceHeightCm / 100) * 80; // Scale factor

  ctx.save();

  // Draw Floor Baseline Line
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();

  // Model-Specific Rendering
  const color = state.selectedRal;

  if (state.selectedModel === 'alu_horiz') {
    // Horizontal Slats
    const numSlats = Math.floor(fenceHeightPx / (12 + state.slatGapCm));
    for (let s = 1; s <= numSlats; s++) {
      const hOffset = s * (10 + state.slatGapCm * 0.8);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y - hOffset);
      ctx.lineTo(p2.x, p2.y - hOffset);
      ctx.lineWidth = 8;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  } else if (state.selectedModel === 'alu_vert') {
    // Vertical Slats
    const numVerts = Math.floor(segmentPixelLen / (15 + state.slatGapCm * 2));
    for (let v = 0; v <= numVerts; v++) {
      const t = v / numVerts;
      const vx = p1.x + dx * t;
      const vy = p1.y + dy * t;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(vx, vy - fenceHeightPx);
      ctx.lineWidth = 6;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    // Top & Bottom Rails
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - fenceHeightPx);
    ctx.lineTo(p2.x, p2.y - fenceHeightPx);
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.stroke();
  } else if (state.selectedModel === 'glass') {
    // Glass Panels with Inox Posts
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p2.x, p2.y - fenceHeightPx);
    ctx.lineTo(p1.x, p1.y - fenceHeightPx);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top Stainless Handrail
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - fenceHeightPx);
    ctx.lineTo(p2.x, p2.y - fenceHeightPx);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();
  } else if (state.selectedModel === 'inox' || state.selectedModel === 'wrought') {
    // Top & Bottom Rail
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y - fenceHeightPx);
    ctx.lineTo(p2.x, p2.y - fenceHeightPx);
    ctx.stroke();

    // Bars
    const numBars = Math.floor(segmentPixelLen / 16);
    for (let b = 0; b <= numBars; b++) {
      const t = b / numBars;
      const bx = p1.x + dx * t;
      const by = p1.y + dy * t;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, by - fenceHeightPx);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  }

  // Draw End Posts
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y + 5);
  ctx.lineTo(p1.x, p1.y - fenceHeightPx - 5);
  ctx.moveTo(p2.x, p2.y + 5);
  ctx.lineTo(p2.x, p2.y - fenceHeightPx - 5);
  ctx.stroke();

  ctx.restore();
}

// Calculation Engine
function updateCalculation() {
  const meters = state.knownLengthMeters;
  const basePrice = MODELS[state.selectedModel].basePrice;

  // Material quantities
  const postsCount = Math.ceil(meters / 1.5) + 1;
  const materialSubtotal = meters * basePrice;
  const laborSubtotal = meters * 35; // €35/m vgradnja/montaža
  const netTotal = materialSubtotal + laborSubtotal;
  const vatAmount = netTotal * state.vatRate;
  const grandTotal = netTotal + vatAmount;

  // Update UI Elements
  document.getElementById('summaryMeters').innerText = `${meters.toFixed(1)} m`;
  document.getElementById('summaryPosts').innerText = `${postsCount} kos`;
  document.getElementById('summaryMaterial').innerText = `${materialSubtotal.toFixed(2)} €`;
  document.getElementById('summaryLabor').innerText = `${laborSubtotal.toFixed(2)} €`;
  document.getElementById('summaryVat').innerText = `${vatAmount.toFixed(2)} € (${(state.vatRate * 100).toFixed(1)}%)`;
  document.getElementById('summaryGrandTotal').innerText = `${grandTotal.toFixed(2)} €`;

  state.calculated = {
    meters,
    postsCount,
    materialSubtotal,
    laborSubtotal,
    netTotal,
    vatAmount,
    grandTotal
  };
}

// Quote Modal & Signature Pad
let signatureCtx, isSigning = false;

function initSignaturePad() {
  const sigCanvas = document.getElementById('signatureCanvas');
  if (!sigCanvas) return;

  signatureCtx = sigCanvas.getContext('2d');
  signatureCtx.strokeStyle = '#f59e0b';
  signatureCtx.lineWidth = 2;

  sigCanvas.addEventListener('mousedown', (e) => {
    isSigning = true;
    const rect = sigCanvas.getBoundingClientRect();
    signatureCtx.beginPath();
    signatureCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  });

  sigCanvas.addEventListener('mousemove', (e) => {
    if (isSigning) {
      const rect = sigCanvas.getBoundingClientRect();
      signatureCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      signatureCtx.stroke();
    }
  });

  sigCanvas.addEventListener('mouseup', () => isSigning = false);
  document.getElementById('clearSigBtn').addEventListener('click', () => {
    signatureCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  });
}

function openQuoteModal() {
  document.getElementById('quoteModal').classList.add('active');
  document.getElementById('modalGrandTotal').innerText = `${state.calculated.grandTotal.toFixed(2)} €`;
}

function closeModal() {
  document.getElementById('quoteModal').classList.remove('active');
}

function handleQuoteSubmit(e) {
  e.preventDefault();

  state.customer.name = document.getElementById('custName').value;
  state.customer.email = document.getElementById('custEmail').value;
  state.customer.phone = document.getElementById('custPhone').value;
  state.customer.address = document.getElementById('custAddress').value;

  generatePdfInvoice();
  closeModal();
  showToast('Predračun v PDF-ju uspešno ustvarjen in prenesen!');
}

function generatePdfInvoice() {
  // Use HTML5 Canvas to render a printable quote document image & trigger download
  const quoteCanvas = document.createElement('canvas');
  quoteCanvas.width = 800;
  quoteCanvas.height = 1100;
  const qctx = quoteCanvas.getContext('2d');

  // Background
  qctx.fillStyle = '#ffffff';
  qctx.fillRect(0, 0, 800, 1100);

  // Header Banner
  qctx.fillStyle = '#0f172a';
  qctx.fillRect(0, 0, 800, 120);

  qctx.fillStyle = '#f59e0b';
  qctx.font = 'bold 28px sans-serif';
  qctx.fillText('VIZUALIZATOR PRO — PONUDBA', 40, 60);

  qctx.fillStyle = '#94a3b8';
  qctx.font = '14px sans-serif';
  qctx.fillText(`Št. ponudbe: VP-${Math.floor(1000 + Math.random() * 9000)} | Datum: ${new Date().toLocaleDateString('sl-SI')}`, 40, 90);

  // Customer Info
  qctx.fillStyle = '#0f172a';
  qctx.font = 'bold 16px sans-serif';
  qctx.fillText('NAROČNIK:', 40, 160);
  qctx.font = '14px sans-serif';
  qctx.fillText(`Ime in priimek: ${state.customer.name || 'Stranka'}`, 40, 185);
  qctx.fillText(`Naslov: ${state.customer.address || 'Neznano'}`, 40, 205);
  qctx.fillText(`Telefon / E-pošta: ${state.customer.phone || '-'} / ${state.customer.email || '-'}`, 40, 225);

  // Project Specs
  qctx.font = 'bold 16px sans-serif';
  qctx.fillText('SPECIFIKACIJA OGRAJE:', 400, 160);
  qctx.font = '14px sans-serif';
  qctx.fillText(`Model: ${MODELS[state.selectedModel].name}`, 400, 185);
  qctx.fillText(`Barvni odtenek: ${state.selectedRalName}`, 400, 205);
  qctx.fillText(`Dolžina / Višina: ${state.knownLengthMeters.toFixed(1)} m / ${state.fenceHeightCm} cm`, 400, 225);

  // Embedded Visualization Screenshot
  qctx.fillStyle = '#cbd5e1';
  qctx.fillRect(40, 260, 720, 360);
  qctx.drawImage(canvas, 40, 260, 720, 360);

  // Items Table
  qctx.fillStyle = '#1e293b';
  qctx.fillRect(40, 640, 720, 35);
  qctx.fillStyle = '#ffffff';
  qctx.font = 'bold 14px sans-serif';
  qctx.fillText('POSTAVKA / OPIS', 50, 663);
  qctx.fillText('KOLIČINA', 450, 663);
  qctx.fillText('CENA Z DDV', 640, 663);

  qctx.fillStyle = '#0f172a';
  qctx.font = '14px sans-serif';

  // Row 1
  qctx.fillText(`Ograjski elementi (${MODELS[state.selectedModel].name})`, 50, 710);
  qctx.fillText(`${state.calculated.meters.toFixed(1)} m`, 450, 710);
  qctx.fillText(`${(state.calculated.materialSubtotal * (1 + state.vatRate)).toFixed(2)} €`, 640, 710);

  // Row 2
  qctx.fillText(`Montaža in vgradnja na terenu`, 50, 740);
  qctx.fillText(`${state.calculated.meters.toFixed(1)} m`, 450, 740);
  qctx.fillText(`${(state.calculated.laborSubtotal * (1 + state.vatRate)).toFixed(2)} €`, 640, 740);

  // Total Summary
  qctx.beginPath();
  qctx.moveTo(40, 770);
  qctx.lineTo(760, 770);
  qctx.strokeStyle = '#cbd5e1';
  qctx.stroke();

  qctx.font = 'bold 20px sans-serif';
  qctx.fillStyle = '#d97706';
  qctx.fillText(`SKUPAJ ZA PLAČILO (z DDV): ${state.calculated.grandTotal.toFixed(2)} €`, 300, 810);

  // Draw Digital Signature if available
  const sigCanvas = document.getElementById('signatureCanvas');
  if (sigCanvas) {
    qctx.fillStyle = '#0f172a';
    qctx.font = '12px sans-serif';
    qctx.fillText('Podpis naročnika / sprejem ponudbe:', 40, 870);
    qctx.drawImage(sigCanvas, 40, 880, 250, 70);
  }

  // Trigger Download
  const link = document.createElement('a');
  link.download = `Ponudba_VizualizatorPRO_${Date.now()}.png`;
  link.href = quoteCanvas.toDataURL('image/png');
  link.click();
}

// Toast System
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
