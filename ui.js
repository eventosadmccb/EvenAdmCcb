
/**
 * Retorna o HTML de um card de evento para a lista principal.
 * @param {object} evento - O objeto do evento.
 * @returns {string} String de HTML para o card.
 */
function renderEventCard(evento) {
  return `
    <div data-id="${evento.id}" class="relative bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 mb-4 transition-transform hover:scale-[1.02] border border-transparent hover:border-indigo-500 cursor-pointer">
      <div class="absolute top-3 right-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-2.5 py-1 rounded-full">${evento.sigla || 'N/A'}</div>
      
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 pr-12">${evento.titulo || 'Evento sem título'}</h3>
      
      <div class="flex items-center text-slate-500 dark:text-slate-400 mb-3 text-sm">
        <span class="font-semibold mr-1">${evento.data || 'N/D'}</span>
        <span>às ${evento.hora || 'N/D'}</span>
      </div>
      
      <p class="text-sm text-slate-600 dark:text-slate-300"><strong class="font-semibold">Local:</strong> ${evento.localidade || 'Não informado'}</p>
      <p class="text-sm text-slate-600 dark:text-slate-300"><strong class="font-semibold">Atendente:</strong> ${evento.atendente || 'Não informado'}</p>
    </div>
  `;
}

/**
 * Retorna o HTML de um card para as telas de gestão.
 * @param {object} item - O objeto do item (ex: cidade, setor).
 * @returns {string} String de HTML para o card.
 */
function renderManagementCard(item) {
    return `
    <div data-id="${item.id}" class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-3 flex justify-between items-center">
        <p class="font-semibold">${item.nome}</p>
        <div>
            <button class="text-blue-500 hover:text-blue-700 p-2">Editar</button>
            <button class="text-red-500 hover:text-red-700 p-2">Excluir</button>
        </div>
    </div>
    `;
}

/**
 * Retorna o HTML de um formulário de cadastro/edição de evento.
 * @param {object | null} evento - O objeto do evento para popular o form (null para novo evento).
 * @returns {string} String de HTML para o formulário.
 */
function renderEventForm(evento = null) {
  return `
    <form id="event-form" data-id="${evento?.id || ''}" class="space-y-4">
      <input type="hidden" name="id" value="${evento?.id || ''}">
      
      <div>
        <label for="evento-titulo" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Evento</label>
        <input type="text" id="evento-titulo" name="titulo" required class="w-full bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3" value="${evento?.titulo || ''}">
      </div>
      
      <div class="grid grid-cols-2 gap-4">
          ${renderCustomDateInput('evento-data', 'Data', evento?.data)}
          ${renderCustomTimeInput('evento-hora', 'Hora', evento?.hora)}
          <input type="hidden" id="data-hidden" name="data" value="${evento?.data || ''}">
          <input type="hidden" id="hora-hidden" name="hora" value="${evento?.hora || ''}">
      </div>
      
      <div>
        <label for="evento-localidade" class="block text-sm font-medium">Localidade</label>
        <input type="text" id="evento-localidade" name="localidade" required class="w-full bg-slate-100 dark:bg-slate-700 border-2 rounded-lg py-2 px-3" value="${evento?.localidade || ''}">
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="evento-atendente" class="block text-sm font-medium">Atendente</label>
          <input type="text" id="evento-atendente" name="atendente" required class="w-full bg-slate-100 dark:bg-slate-700 border-2 rounded-lg py-2 px-3" value="${evento?.atendente || ''}">
        </div>
        <div>
          <label for="evento-sigla" class="block text-sm font-medium">Sigla</label>
          <input type="text" id="evento-sigla" name="sigla" required maxlength="5" class="w-full uppercase bg-slate-100 dark:bg-slate-700 border-2 rounded-lg py-2 px-3" value="${evento?.sigla || ''}">
        </div>
      </div>
    </form>
  `;
}


/**
 * Renderiza o conteúdo da página inicial (lista de eventos).
 * @param {Array<object>} events - A lista de eventos a ser exibida.
 * @returns {string} O HTML completo da página inicial.
 */
function renderHomePage(events) {
    const eventCardsHTML = events.map(renderEventCard).join('');
    return `
        <div>
            ${eventCardsHTML || '<p>Nenhum evento encontrado.</p>'}
        </div>
    `;
}

/**
 * Gera o HTML completo para o menu lateral, incluindo backdrop e painel.
 * @returns {string} String de HTML com a estrutura do menu.
 */
function renderLateralMenu() {
    const menuItems = [
        { page: 'adms', label: 'Adms', icon: '👑' },
        { page: 'atendentes', label: 'Atendentes', icon: '👥' },
        { page: 'setores', label: 'Setores', icon: '🏢' },
        { page: 'cidades', label: 'Cidades', icon: '🏙️' },
        { page: 'localidades', label: 'Localidades', icon: '📍' },
        { page: 'tipos_eventos', label: 'Tipos de Eventos', icon: '🏷️' },
        { page: 'feriados', label: 'Feriados', icon: '🗓️' }
    ];

    const linksHTML = menuItems.map(item => `
        <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" data-page="${item.page}">
            <span class="text-lg">${item.icon}</span>
            <span>${item.label}</span>
        </a>
    `).join('');

    return `
        <div id="menu-backdrop-dynamic" class="fixed inset-0 bg-black bg-opacity-50 z-40 opacity-0 transition-opacity duration-300 ease-in-out"></div>
        <aside id="side-menu-dynamic" class="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-xl transform -translate-x-full transition-transform duration-300 ease-in-out">
            <h2 class="p-4 text-xl font-bold border-b dark:border-slate-700">Gestão</h2>
            <nav id="management-links-dynamic" class="p-2 space-y-1">
                ${linksHTML}
            </nav>
        </aside>
    `;
}

/**
 * Renderiza o conteúdo de uma página de gestão genérica.
 * @param {string} title - O título da página (ex: 'atendentes').
 * @param {Array<object>} items - A lista de itens a serem exibidos.
 * @returns {string} O HTML completo da página de gestão.
 */
function renderManagementScreen(title, items) {
    const itemCardsHTML = items.map(renderManagementCard).join('');
    const capitalizedTitle = title.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return `
        <div class="space-y-6">
            <header>
                <h2 class="text-2xl font-bold capitalize">${capitalizedTitle}</h2>
            </header>
            
            <!-- Barra de Ações da Página de Gestão -->
            <div class="flex flex-col sm:flex-row gap-4">
                <!-- Search Input -->
                <div class="relative flex-grow">
                    <input type="search" id="management-search-input" placeholder="Buscar em ${capitalizedTitle}..." class="w-full py-2 pl-10 pr-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-transparent focus:border-indigo-500 focus:ring-0">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
                <!-- Botão Novo -->
                <button id="btn-management-new" class="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2">
                    <span class="text-xl">+</span>
                    <span>Novo</span>
                </button>
            </div>

            <!-- Lista de Itens -->
            <div id="management-list-container">
                ${itemCardsHTML || `<p class="text-center text-slate-500 py-8">Nenhum item encontrado em ${capitalizedTitle}.</p>`}
            </div>
        </div>
    `;
}

/**
 * Renderiza o conteúdo completo do modal da Agenda.
 * @param {string} calendarHTML - O HTML do calendário.
 * @param {Array<object>} events - A lista de eventos para o dia selecionado.
 * @returns {string} O HTML para o corpo do modal.
 */
function renderAgendaView(calendarHTML, events) {
    const eventsHTML = events.length > 0 
        ? events.map(renderEventCard).join('') 
        : '<p class="text-center text-slate-500 mt-4">Nenhum evento para esta data.</p>';

    return `
        ${calendarHTML}
        <div id="agenda-events-list" class="mt-4 border-t dark:border-slate-700 pt-4 max-h-48 overflow-y-auto">
            ${eventsHTML}
        </div>
    `;
}

/**
 * Renderiza o conteúdo do modal de Filtro Temporal.
 * @returns {string} O HTML para o corpo do modal.
 */
function renderTemporalFilterModalContent() {
    const filters = ['Hoje', 'Esta Semana', 'Este Mês', 'Este Ano'];
    return `
        <div class="space-y-3">
        ${filters.map(filter => `
            <div class="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <span class="font-semibold">${filter}</span>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1 bg-slate-300 dark:bg-slate-600 rounded">-</button>
                    <button class="px-3 py-1 bg-slate-300 dark:bg-slate-600 rounded">+</button>
                </div>
            </div>
        `).join('')}
        </div>
    `;
}