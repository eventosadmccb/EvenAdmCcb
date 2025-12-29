
/**
 * Gera o HTML para um banner de erro/notificação.
 * @param {string} message - A mensagem a ser exibida.
 * @returns {string} String de HTML para o banner.
 */
function renderErrorBanner(message) {
  return `
    <div class="error-banner bg-red-600 text-white text-center p-2 fixed top-0 left-0 right-0 z-[100] animate-pulse">
      ${message}
    </div>
  `;
}

/**
 * Gera o HTML de um indicador de carregamento.
 * @returns {string} String de HTML para o indicador.
 */
function renderLoadingIndicator() {
    return `
        <div class="flex justify-center items-center h-full p-8">
            <p class="text-lg font-semibold animate-pulse">Verificando sessão...</p>
        </div>
    `;
}

/**
 * Formata uma string de data YYYY-MM-DD para DD/MM/YY.
 * @param {string} dateString - A string de data a ser formatada.
 * @returns {string} A data formatada.
 */
function formatCardDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return 'N/D';
    try {
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        const [year, month, day] = parts;
        return `${day}/${month}/${year.slice(2)}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Fallback
    }
}


/**
 * Retorna o HTML de um card de evento para a lista principal (estilo "Adm Valente").
 * @param {object} evento - O objeto do evento.
 * @returns {string} String de HTML para o card.
 */
function renderEventCard(evento) {
  const formattedDate = formatCardDate(evento.data_evento);
  const formattedTime = evento.hora_evento ? evento.hora_evento.slice(0, 5) : 'N/D';

  return `
    <div data-id="${evento.id}" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-4 flex items-start gap-4 border-b-2 border-slate-200 dark:border-slate-700 cursor-pointer">
        <!-- Check Icon -->
        <div class="flex-shrink-0 pt-1">
            <i class="fas fa-check-circle text-2xl text-slate-300 dark:text-slate-600"></i>
        </div>
        
        <!-- Event Details -->
        <div class="flex-grow">
            <h3 class="font-bold text-slate-700 dark:text-slate-200">${evento.titulo || 'Evento sem título'}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">${formattedDate} | ${formattedTime}</p>
            
            <div class="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <div class="flex items-center gap-2">
                    <i class="fas fa-map-marker-alt fa-fw text-slate-400"></i>
                    <span>${evento.localidade || 'Não informado'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-user fa-fw text-slate-400"></i>
                    <span>${evento.atendente || 'Não informado'}</span>
                </div>
            </div>
        </div>

        <!-- Badge -->
        <div class="flex-shrink-0">
            <span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">${evento.sigla || 'N/A'}</span>
        </div>
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
 * Renderiza o conteúdo da página inicial (lista de eventos).
 * @param {Array<object>} eventos - A lista de eventos a serem renderizados.
 * @returns {string} O HTML da lista de eventos.
 */
function renderHomePage(eventos = []) {
    if (eventos.length === 0) {
        return '<p class="text-center text-slate-500 py-8">Nenhum evento agendado.</p>';
    }
    return eventos.map(renderEventCard).join('');
}

/**
 * Gera o HTML completo para o menu lateral, incluindo backdrop e painel.
 * @param {number} [pendingCount=0] - O número de usuários aguardando aprovação.
 * @returns {string} String de HTML com a estrutura do menu.
 */
function renderLateralMenu(pendingCount = 0) {
    const menuItems = [
        { page: 'adms', label: 'Adms', icon: '👑' },
        { page: 'atendentes', label: 'Atendentes', icon: '👥' },
        { page: 'setores', label: 'Setores', icon: '🏢' },
        { page: 'cidades', label: 'Cidades', icon: '🏙️' },
        { page: 'localidades', label: 'Localidades', icon: '📍' },
        { page: 'tipos_eventos', label: 'Tipos de Eventos', icon: '🏷️' },
        { page: 'feriados', label: 'Feriados', icon: '🗓️' }
    ];

    const linksHTML = menuItems.map(item => {
        let notificationBadge = '';
        if ((item.page === 'atendentes' || item.page === 'adms') && pendingCount > 0) {
            notificationBadge = `<span class="ml-auto bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">${pendingCount}</span>`;
        }
        return `
            <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" data-page="${item.page}">
                <span class="text-lg">${item.icon}</span>
                <span>${item.label}</span>
                ${notificationBadge}
            </a>
        `;
    }).join('');

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
 * @param {string} title - O título da página.
 * @param {Array<object>} items - Os itens a serem listados.
 * @returns {string} O HTML da tela de gestão.
 */
function renderManagementScreen(title, items = []) {
    const itemCards = items.map(renderManagementCard).join('');
    return `
        <div>
            <h2 class="text-2xl font-bold mb-4 capitalize">${title.replace('_', ' ')}</h2>
            <div class="space-y-3">
                ${itemCards || '<p class="text-center text-slate-500 py-8">Nenhum item cadastrado.</p>'}
            </div>
        </div>
    `;
}


/**
 * Gera o HTML da tela de gestão de usuários (Admins/Atendentes).
 * @param {Array<object>} usuarios - A lista de usuários da tabela 'atendentes'.
 * @returns {string} O HTML completo da tela de gestão.
 */
function renderGestaoUsuarios(usuarios) {
    const userCardsHTML = usuarios.map(renderUsuarioCard).join('');
    return `
        <div class="space-y-6">
            <header>
                <h2 class="text-2xl font-bold">Gestão de Usuários</h2>
            </header>
            
            <div class="relative">
                <input type="search" id="user-search-input" placeholder="Buscar por nome ou e-mail..." class="w-full py-2 pl-10 pr-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-transparent focus:border-indigo-500 focus:ring-0">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>

            <div id="user-list-container" class="space-y-3">
                ${userCardsHTML || `<p class="text-center text-slate-500 py-8">Nenhum usuário encontrado.</p>`}
            </div>
        </div>
    `;
}

/**
 * Gera o HTML de um card de usuário para a tela de gestão.
 * @param {object} usuario - O objeto do usuário.
 * @returns {string} String de HTML para o card do usuário.
 */
function renderUsuarioCard(usuario) {
    const statusBadges = {
        'Aguardando': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'Leitura': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Total': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    const badgeClass = statusBadges[usuario.nivel_acesso] || 'bg-gray-100 text-gray-800';

    const renderActionButtons = () => {
        let buttons = '';
        if (usuario.nivel_acesso === 'Aguardando') {
            buttons += `<button data-action="authorize" data-level="Leitura" data-id="${usuario.id_usuario}" class="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md">Autorizar Leitura</button>`;
            buttons += `<button data-action="authorize" data-level="Total" data-id="${usuario.id_usuario}" class="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md">Autorizar Total</button>`;
        }
        if (usuario.nivel_acesso === 'Leitura') {
            buttons += `<button data-action="authorize" data-level="Total" data-id="${usuario.id_usuario}" class="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md">Autorizar Total</button>`;
        }
        if (usuario.nivel_acesso === 'Total') {
             buttons += `<button data-action="authorize" data-level="Leitura" data-id="${usuario.id_usuario}" class="text-sm font-semibold text-white bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded-md">Rebaixar p/ Leitura</button>`;
        }
        buttons += `<button data-action="remove" data-id="${usuario.id_usuario}" class="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md">Bloquear/Remover</button>`;
        return buttons;
    };

    return `
        <div class="user-card bg-white dark:bg-slate-800 rounded-lg shadow-md p-4" data-id="${usuario.id_usuario}" data-name="${usuario.nome_atendente || ''}" data-email="${usuario.email || ''}">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h3 class="font-bold text-lg">${usuario.nome_atendente || 'Nome não preenchido'}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${usuario.email}</p>
                </div>
                <div class="mt-2 sm:mt-0">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}">${usuario.nivel_acesso}</span>
                </div>
            </div>
            <div class="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3 flex flex-wrap gap-2">
                ${renderActionButtons()}
            </div>
        </div>
    `;
}

/**
 * Gera o HTML para o formulário de primeiro cadastro.
 * @returns {string} HTML do formulário.
 */
function renderCadastroInicial() {
    return `
        <div class="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold mb-4">Finalize seu Cadastro</h2>
            <p class="mb-6 text-slate-600 dark:text-slate-400">Precisamos de mais algumas informações para criar seu perfil.</p>
            <div class="space-y-4">
                <div>
                    <label for="cadastro-nome" class="block text-sm font-medium">Nome Completo</label>
                    <input type="text" id="cadastro-nome" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <div>
                    <label for="cadastro-telefone" class="block text-sm font-medium">Telefone</label>
                    <input type="tel" id="cadastro-telefone" class="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
            </div>
            <button id="btn-finalizar-cadastro" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 mt-8">Salvar e Enviar para Aprovação</button>
        </div>
    `;
}


/**
 * Gera o HTML para a mensagem de "Aguardando aprovação".
 * @returns {string} HTML da mensagem.
 */
function renderAwaitingApprovalMessage() {
    return `
        <div class="text-center">
            <h3 class="text-xl font-bold mb-2">Obrigado pelo seu cadastro!</h3>
            <p>Seu perfil foi enviado para análise por um administrador.</p>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Você será notificado assim que seu acesso for liberado. Por favor, aguarde.</p>
        </div>
    `;
}

/**
 * Gera o HTML para o formulário de login via Magic Link.
 * @returns {string} HTML do formulário de login.
 */
function renderLoginForm() {
    return `
        <div class="max-w-sm mx-auto mt-10 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold text-center mb-2">Acessar Agenda</h2>
            <p class="text-center text-slate-600 dark:text-slate-400 mb-6">Insira seu e-mail para receber um link de acesso.</p>
            <div class="space-y-4">
                <div>
                    <label for="login-email" class="sr-only">E-mail</label>
                    <input type="email" id="login-email" placeholder="seu.email@exemplo.com" class="w-full py-2 px-4 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                </div>
                <button id="btn-enviar-link" class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700">Enviar Link Mágico</button>
            </div>
        </div>
    `;
}

/**
 * Gera o HTML para a mensagem de confirmação de envio do Magic Link.
 * @param {string} email - O e-mail para o qual o link foi enviado.
 * @returns {string} HTML da mensagem de confirmação.
 */
function renderMagicLinkSentMessage(email) {
    return `
        <div class="max-w-sm mx-auto mt-10 text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
            <h2 class="text-2xl font-bold mb-2">Verifique seu E-mail</h2>
            <p class="text-slate-600 dark:text-slate-400">Enviamos um link de acesso para <strong class="text-indigo-600 dark:text-indigo-400">${email}</strong>.</p>
            <p class="mt-4 text-sm text-slate-500">Clique no link para entrar no sistema.</p>
        </div>
    `;
}