
// --- Componente de Modal ---

const modalContainer = document.getElementById('modal-container');

/**
 * Renderiza e exibe um modal com conteúdo customizado.
 * @param {string} title - O título do modal.
 * @param {string} contentHTML - O HTML a ser inserido no corpo do modal.
 * @param {string} footerHTML - O HTML para os botões do rodapé.
 */
function showModal(title, contentHTML, footerHTML) {
    modalContainer.innerHTML = `
        <div id="modal-backdrop" class="fixed inset-0 bg-black bg-opacity-60 z-40"></div>
        <div id="modal-box" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 w-11/12 max-w-lg">
            <div class="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 class="text-xl font-bold">${title}</h2>
                <button id="modal-close-btn" class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>
            <div class="p-6 max-h-[60vh] overflow-y-auto">
                ${contentHTML}
            </div>
            <div class="flex justify-end p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                ${footerHTML}
            </div>
        </div>
    `;
    modalContainer.classList.remove('hidden');
    document.getElementById('modal-close-btn').addEventListener('click', hideModal);
    document.getElementById('modal-backdrop').addEventListener('click', hideModal);
}

/**
 * Oculta o modal.
 */
function hideModal() {
    modalContainer.innerHTML = '';
    modalContainer.classList.add('hidden');
}

// --- Componentes de Formulário Customizados ---

/**
 * Renderiza um input customizado para data.
 * @param {string} id - O ID do elemento.
 * @param {string} label - O texto da label.
 * @param {string} value - O valor inicial.
 * @returns {string} HTML do input.
 */
function renderCustomDateInput(id, label, value = '') {
    return `
        <div>
            <label for="${id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${label}</label>
            <div id="${id}" class="custom-input bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 flex justify-between items-center cursor-pointer">
                <span class="value-text">${value || 'YYYY-MM-DD'}</span>
                <span class="icon">📅</span>
            </div>
        </div>
    `;
}

/**
 * Renderiza um input customizado para hora.
 * @param {string} id - O ID do elemento.
 * @param {string} label - O texto da label.
 * @param {string} value - O valor inicial.
 * @returns {string} HTML do input.
 */
function renderCustomTimeInput(id, label, value = '') {
    return `
        <div>
            <label for="${id}" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">${label}</label>
            <div id="${id}" class="custom-input bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 flex justify-between items-center cursor-pointer">
                <span class="value-text">${value || 'HH:MM'}</span>
                <span class="icon">🕒</span>
            </div>
        </div>
    `;
}

// --- Componente de Calendário ---

/**
 * Gera o HTML para um calendário customizado.
 * @param {number} year - O ano a ser renderizado.
 * @param {number} month - O mês a ser renderizado (0-11).
 * @param {object} options - Opções incluindo events, holidays, selectedDate.
 * @returns {string} String de HTML para o calendário.
 */
function renderCalendar(year, month, options = {}) {
  const { events = [], holidays = [], selectedDate = null } = options;
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo, 1 = Segunda...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  let header = `
    <div class="calendar-container bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-inner">
      <div class="calendar-header">
        <button id="prev-month" class="calendar-nav-btn">&lt;</button>
        <h2 id="month-year" class="text-slate-800 dark:text-slate-100 text-lg font-bold capitalize">${monthName}</h2>
        <button id="next-month" class="calendar-nav-btn">&gt;</button>
      </div>
      <div class="calendar-grid mt-4">
        <div class="day-name text-red-600">D</div><div class="day-name">S</div><div class="day-name">T</div>
        <div class="day-name">Q</div><div class="day-name">Q</div><div class="day-name">S</div><div class="day-name">S</div>
      </div>
      <div id="calendar-body" class="calendar-grid mt-2">
  `;

  let body = '';
  // Células vazias para o início do mês
  for (let i = 0; i < firstDayOfMonth; i++) {
    body += `<div class="day other-month"></div>`;
  }

  // Células dos dias
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay();

    let classes = 'day';
    if (dayOfWeek === 0 || holidays.includes(currentDateStr)) { // Domingo ou Feriado
        classes += ' text-red-600 font-semibold';
    }
    
    if (currentDateStr === selectedDate) {
        classes += ' selected';
    }

    const eventsOnDay = events.filter(e => e.data === currentDateStr);
    let eventDots = '';
    if (eventsOnDay.length > 0) {
        classes += ' has-event';
        eventDots = `<div class="flex justify-center items-end absolute bottom-1 left-0 right-0">${'<div class="w-1 h-1 bg-amber-500 rounded-full mx-px"></div>'.repeat(Math.min(eventsOnDay.length, 4))}</div>`;
    }

    body += `<div class="${classes}" data-date="${currentDateStr}">${day}${eventDots}</div>`;
  }
  
  let footer = `</div></div>`;
  return header + body + footer;
}

/**
 * Abre um seletor de data em um modal e atualiza o elemento alvo.
 * @param {string} targetId - O ID do input customizado de data.
 */
function openDatePicker(targetId) {
    let pickerDate = new Date();
    const targetElement = document.getElementById(targetId);
    // Assumes the hidden input follows the 'id-hidden' naming convention
    const hiddenInput = document.getElementById('data-hidden');

    const updatePickerView = () => {
        const calendarHTML = renderCalendar(pickerDate.getFullYear(), pickerDate.getMonth());
        showModal('Selecione uma Data', calendarHTML, `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Cancelar</button>`);
        addPickerListeners();
    };

    const addPickerListeners = () => {
        document.getElementById('prev-month')?.addEventListener('click', () => {
            pickerDate.setMonth(pickerDate.getMonth() - 1);
            updatePickerView();
        });
        document.getElementById('next-month')?.addEventListener('click', () => {
            pickerDate.setMonth(pickerDate.getMonth() + 1);
            updatePickerView();
        });
        document.getElementById('calendar-body')?.addEventListener('click', (e) => {
            const dayEl = e.target.closest('.day:not(.other-month)');
            if (dayEl) {
                const selectedDate = dayEl.dataset.date;
                if (targetElement) targetElement.querySelector('.value-text').textContent = selectedDate;
                if (hiddenInput) hiddenInput.value = selectedDate;
                hideModal();
            }
        });
    };
    updatePickerView();
}

/**
 * Abre um seletor de hora em um modal e atualiza o elemento alvo.
 * @param {string} targetId - O ID do input customizado de hora.
 */
function openTimePicker(targetId) {
    const targetElement = document.getElementById(targetId);
    const hiddenInput = document.getElementById('hora-hidden');

    let timeSlotsHTML = '<div class="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">';
    for (let hour = 8; hour <= 22; hour++) {
        for (let minute of [0, 30]) {
            if (hour === 22 && minute === 30) continue; // Stop at 22:00
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            timeSlotsHTML += `<div class="time-slot p-3 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-indigo-500 hover:text-white">${timeStr}</div>`;
        }
    }
    timeSlotsHTML += '</div>';

    showModal('Selecione um Horário', timeSlotsHTML, `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Cancelar</button>`);

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const selectedTime = slot.textContent;
            if (targetElement) targetElement.querySelector('.value-text').textContent = selectedTime;
            if (hiddenInput) hiddenInput.value = selectedTime;
            hideModal();
        });
    });
}

/**
 * Exibe um modal de alerta para eventos duplicados.
 * @param {number} originalId - O ID do evento original.
 */
function showDuplicateModal(originalId) {
    const content = `
        <p class="text-center">Já existe um evento idêntico ou muito similar agendado.</p>
        <p class="text-center mt-2 text-sm text-slate-500">Deseja visualizar o evento original?</p>
    `;
    const footer = `
        <button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Fechar</button>
        <button onclick="localizarDuplicata(${originalId})" class="px-4 py-2 bg-amber-500 text-white rounded-lg ml-2">Localizar Duplicata</button>
    `;
    showModal('Evento Duplicado Detectado', content, footer);
}
