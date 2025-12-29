
document.addEventListener('DOMContentLoaded', async () => {
    // Evento de Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker Registrado'))
                .catch(err => console.log('Erro no Service Worker:', err));
        });
    }

    // --- INICIALIZAÇÃO DO CLIENTE SUPABASE ---
    const SUPABASE_URL = 'https://<SEU-PROJETO-ID>.supabase.co';
    const SUPABASE_ANON_KEY = '<SUA-CHAVE-PUBLICA-ANON>';
    try {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch(e) {
        console.error("Erro ao inicializar o Supabase. Verifique suas credenciais.", e);
    }

    // --- SELETORES GLOBAIS DO DOM ---
    const appRender = document.getElementById('app-render');
    const btnMenu = document.getElementById('btn-menu');
    const btnHome = document.getElementById('btn-home');
    const fabAdd = document.getElementById('fab-add');
    const btnTodos = document.getElementById('btn-todos');
    const btnAgenda = document.getElementById('btn-agenda');
    const btnMais = document.getElementById('btn-mais');
    const btnPdf = document.getElementById('btn-pdf');
    const btnMultiFilter = document.getElementById('btn-multi-filter');
    const activeFilterLabel = document.getElementById('active-filter-label');
    const recordCountLabel = document.getElementById('record-count-label');
    const menuLateralContainer = document.getElementById('menu-lateral-container');

    // --- ESTADO DA APLICAÇÃO ---
    let eventosFicticios = [
        { id: 1, titulo: 'Reunião de Alinhamento Semanal', data: '2024-07-28', hora: '10:00', localidade: 'Sala 1', atendente: 'Ana', sigla: 'RAS' },
        { id: 2, titulo: 'Apresentação de Projeto', data: '2024-07-29', hora: '14:30', localidade: 'Online', atendente: 'Carlos', sigla: 'APR' },
        { id: 3, titulo: 'Workshop de Inovação', data: '2024-07-29', hora: '09:00', localidade: 'Auditório', atendente: 'Bia', sigla: 'WDI' }
    ];
    let feriadosList = [];
    let isMenuOpen = false;

    // --- FUNÇÕES UTILITÁRIAS ---
    const updateFilterAndCount = (filterText, count) => {
        activeFilterLabel.textContent = `Filtro: ${filterText}`;
        recordCountLabel.textContent = `Registros: ${count}`;
    };

    // --- LÓGICA DE NAVEGAÇÃO / ROTEAMENTO ---
    const navigateTo = (page) => {
        appRender.innerHTML = '';
        fabAdd.classList.toggle('hidden', page !== 'home');
        
        switch (page) {
            case 'home':
                appRender.innerHTML = renderHomePage(eventosFicticios);
                updateFilterAndCount('Todos', eventosFicticios.length);
                break;
            case 'adms':
            case 'atendentes':
            case 'setores':
            case 'cidades':
            case 'localidades':
            case 'tipos_eventos':
            case 'feriados':
                const items = [{id: 1, nome: `Item 1 de ${page}`}, {id: 2, nome: `Item 2 de ${page}`}];
                appRender.innerHTML = renderManagementScreen(page, items);
                break;
            default:
                appRender.innerHTML = renderHomePage(eventosFicticios);
                updateFilterAndCount('Todos', eventosFicticios.length);
        }
    };

    // --- LÓGICA DO MENU LATERAL ---
    const openMenu = () => {
        if (isMenuOpen) return;
        isMenuOpen = true;

        menuLateralContainer.innerHTML = renderLateralMenu();
        menuLateralContainer.classList.remove('hidden');

        const backdrop = document.getElementById('menu-backdrop-dynamic');
        const sideMenu = document.getElementById('side-menu-dynamic');
        const links = document.getElementById('management-links-dynamic');

        backdrop.addEventListener('click', closeMenu);
        links.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.dataset.page) {
                e.preventDefault();
                navigateTo(link.dataset.page);
                closeMenu();
            }
        });

        requestAnimationFrame(() => {
            backdrop.classList.remove('opacity-0');
            sideMenu.classList.remove('-translate-x-full');
        });
    };

    const closeMenu = () => {
        if (!isMenuOpen) return;
        
        const backdrop = document.getElementById('menu-backdrop-dynamic');
        const sideMenu = document.getElementById('side-menu-dynamic');

        if (backdrop && sideMenu) {
            backdrop.classList.add('opacity-0');
            sideMenu.classList.add('-translate-x-full');

            setTimeout(() => {
                menuLateralContainer.classList.add('hidden');
                menuLateralContainer.innerHTML = '';
                isMenuOpen = false;
            }, 300);
        } else {
            menuLateralContainer.classList.add('hidden');
            menuLateralContainer.innerHTML = '';
            isMenuOpen = false;
        }
    };

    // --- MANIPULADORES DE EVENTOS ---
    btnMenu.addEventListener('click', openMenu);
    btnHome.addEventListener('click', () => {
        if (isMenuOpen) closeMenu();
        navigateTo('home');
    });

    btnTodos.addEventListener('click', () => {
        navigateTo('home');
    });
    
    btnAgenda.addEventListener('click', () => {
        let agendaDate = new Date();
        let selectedDateStr = null;

        const updateAgendaView = () => {
            const options = { events: eventosFicticios, holidays: feriadosList, selectedDate: selectedDateStr };
            const calendarHTML = renderCalendar(agendaDate.getFullYear(), agendaDate.getMonth(), options);
            const eventsForDay = selectedDateStr ? eventosFicticios.filter(e => e.data === selectedDateStr) : [];
            const agendaViewHTML = renderAgendaView(calendarHTML, eventsForDay);
            
            const footer = `<button id="agenda-ver-lista" class="px-4 py-2 bg-indigo-600 text-white rounded-lg mr-auto disabled:opacity-50" ${!selectedDateStr ? 'disabled' : ''}>Ver na Lista</button> <button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Fechar</button>`;
            
            showModal('Agenda de Eventos', agendaViewHTML, footer);
            addAgendaListeners();
        };

        const addAgendaListeners = () => {
            document.getElementById('prev-month')?.addEventListener('click', () => { agendaDate.setMonth(agendaDate.getMonth() - 1); updateAgendaView(); });
            document.getElementById('next-month')?.addEventListener('click', () => { agendaDate.setMonth(agendaDate.getMonth() + 1); updateAgendaView(); });
            document.getElementById('calendar-body')?.addEventListener('click', (e) => {
                const dayEl = e.target.closest('.day:not(.other-month)');
                if (dayEl) { selectedDateStr = dayEl.dataset.date; updateAgendaView(); }
            });
            document.getElementById('agenda-ver-lista')?.addEventListener('click', () => {
                if (selectedDateStr) {
                    const filteredEvents = eventosFicticios.filter(e => e.data === selectedDateStr);
                    appRender.innerHTML = renderHomePage(filteredEvents);
                    updateFilterAndCount(selectedDateStr, filteredEvents.length);
                    hideModal();
                }
            });
        };
        updateAgendaView();
    });
    
    btnMais.addEventListener('click', () => {
        showModal('Filtro Temporal', renderTemporalFilterModalContent(), `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Fechar</button>`);
    });

    btnPdf.addEventListener('click', () => {
        showModal('Aviso', '<p>A funcionalidade de exportar PDF ainda não foi implementada.</p>', `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">OK</button>`);
    });

    btnMultiFilter.addEventListener('click', () => {
        showModal('Filtros Avançados', '<p>A funcionalidade de múltiplos filtros ainda não foi implementada.</p>', `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">OK</button>`);
    });

    const openEventForm = (evento = null) => {
        const title = evento ? 'Editar Evento' : 'Novo Evento';
        const footer = `<button class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg" onclick="hideModal()">Cancelar</button> <button id="save-event-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg ml-2">Salvar</button>`;
        showModal(title, renderEventForm(evento), footer);
        document.getElementById('evento-data')?.addEventListener('click', () => openDatePicker('evento-data'));
        document.getElementById('evento-hora')?.addEventListener('click', () => openTimePicker('evento-hora'));
        document.getElementById('save-event-btn').addEventListener('click', handleEventFormSubmit);
    };

    const handleEventFormSubmit = () => {
        const form = document.getElementById('event-form');
        let isValid = true;
        form.querySelectorAll('[required]').forEach(input => {
            input.classList.remove('invalid-field');
            if (!input.value) { input.classList.add('invalid-field'); isValid = false; }
        });

        if (!isValid) return;

        const eventData = Object.fromEntries(new FormData(form).entries());
        if (eventData.id) {
            const index = eventosFicticios.findIndex(e => e.id == eventData.id);
            if (index !== -1) eventosFicticios[index] = { ...eventosFicticios[index], ...eventData };
        } else {
            eventData.id = Date.now();
            eventosFicticios.push(eventData);
        }
        hideModal();
        navigateTo('home');
    };

    fabAdd.addEventListener('click', () => openEventForm(null));

    appRender.addEventListener('click', (e) => {
        const card = e.target.closest('[data-id]');
        if (card) {
            const evento = eventosFicticios.find(e => e.id == card.dataset.id);
            if (evento) openEventForm(evento);
        }
    });
    
    window.localizarDuplicata = (eventoId) => {
        hideModal();
        setTimeout(() => {
            const cardParaDestacar = document.querySelector(`[data-id='${eventoId}']`);
            if (cardParaDestacar) {
                cardParaDestacar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                cardParaDestacar.classList.add('pulse-highlight');

                const removerDestaque = () => {
                    cardParaDestacar.classList.remove('pulse-highlight');
                    document.body.removeEventListener('click', removerDestaque, true);
                    clearTimeout(timeoutId);
                };

                const timeoutId = setTimeout(removerDestaque, 5000);
                document.body.addEventListener('click', removerDestaque, true);
            }
        }, 100);
    }
    
    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    const inicializarApp = async () => {
        try {
            console.log("Inicializando aplicação...");
            const anoAtual = new Date().getFullYear();
            
            await sincronizarFeriados(anoAtual);
            const feriadosMap = await getFeriadosMap();
            feriadosList = Object.keys(feriadosMap);
            console.log(`${feriadosList.length} feriados carregados para o calendário.`);

            navigateTo('home');
        } catch (error) {
            console.error("Erro fatal durante a inicialização do app:", error);
            appRender.innerHTML = `<p class="text-center text-red-500 p-8">Ocorreu um erro ao carregar os dados. Verifique o console e suas credenciais do Supabase.</p>`;
        }
    };
    
    await inicializarApp();
});