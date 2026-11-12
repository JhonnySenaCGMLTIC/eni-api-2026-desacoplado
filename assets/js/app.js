/ assets/js/app.js
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_AUTH } = window.APP_CONFIG || {};

const grid      = document.getElementById('cardsGrid');
const loading   = document.getElementById('loading');
const errorBox  = document.getElementById('error');
const emptyBox  = document.getElementById('empty');
const searchBox = document.getElementById('searchInput');

let capacitaciones = [];

/* ---------- Helpers ---------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function initials(text) {
  return String(text || '?')
    .trim().split(/\s+/).slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

/* ---------- Render ---------- */
function renderCards(items) {
  grid.innerHTML = '';

  if (!items.length) {
    emptyBox.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  emptyBox.classList.add('hidden');
  grid.classList.remove('hidden');

  items.forEach((c) => {
    const titulo = c.titulo || 'Capacitación sin título';
    const desc   = c.descripcion || 'Sin descripción disponible.';
    const fecha  = formatDate(c.created_at);

    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 flex flex-col overflow-hidden';

    card.innerHTML = `
      <div class="bg-gradient-to-br from-sena-green to-sena-accent p-5 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center font-bold text-sena-green text-lg shrink-0">
          ${escapeHtml(initials(titulo))}
        </div>
        <div class="min-w-0">
          <p class="text-white/80 text-xs uppercase tracking-wide">Capacitación</p>
          <h3 class="text-white font-bold text-lg leading-tight truncate" title="${escapeHtml(titulo)}">
            ${escapeHtml(titulo)}
          </h3>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col gap-4">
        <p class="text-sm text-gray-700 leading-relaxed">${escapeHtml(desc)}</p>

        <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span class="inline-flex items-center gap-1">
            <svg class="w-4 h-4 text-sena-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            ${fecha ? escapeHtml(fecha) : 'Sin fecha'}
          </span>
          <span class="text-gray-400">#${escapeHtml(String(c.id))}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ---------- Búsqueda ---------- */
function applySearch(term) {
  const q = term.trim().toLowerCase();
  if (!q) return renderCards(capacitaciones);
  const filtered = capacitaciones.filter(c =>
    (c.titulo || '').toLowerCase().includes(q) ||
    (c.descripcion || '').toLowerCase().includes(q)
  );
  renderCards(filtered);
}
searchBox.addEventListener('input', (e) => applySearch(e.target.value));

/* ---------- Carga de datos ---------- */
async function loadData() {
  try {
    const res = await fetch(SUPABASE_URL, {
      method: 'GET',
      headers: {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': SUPABASE_AUTH
        //'Accept':        'application/json',
      },
    });

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const data = await res.json();
    capacitaciones = Array.isArray(data) ? data : [];

    loading.classList.add('hidden');
    renderCards(capacitaciones);
  } catch (err) {
    console.error(err);
    loading.classList.add('hidden');
    errorBox.classList.remove('hidden');
    errorBox.textContent = 'No se pudieron cargar las capacitaciones: ' + err.message;
  }
}

loadData();