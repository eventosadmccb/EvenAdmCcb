document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO SUPABASE ---
    const SUPABASE_URL = 'https://slmliiruyznvwkgwqeil.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsbWxpaXJ1eXpudndrZ3dxZWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzA4MjYsImV4cCI6MjA4MjUwNjgyNn0.491qEsqu-4YUoGkhk7Vcw8nzBvN3hCHZzGxMFhrqF9o';
    
    try {
        // Inicializa globalmente para os outros scripts usarem
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch (e) {
        console.error("Erro ao inicializar o Supabase:", e);
        return;
    }

    // --- ESTADO GLOBAL ---
    const APP_STATE = {
        user: null,
        perfil: null,
        eventos: [],
        isMenuOpen: false,
    };

    // --- SELETORES ATUALIZADOS (Conforme o novo index.html) ---
    const authOverlay = document.getElementById('auth-overlay');
    const authRender = document.getElementById('auth-render');
    const mainLayout = document.getElementById('main-layout');
    const appRender = document.getElementById('app-render'); // Onde as páginas internas aparecem
    const btnMenu = document.getElementById('btn-menu');
    const btnHome = document.getElementById('btn-home');
    const fabAdd = document.getElementById('fab-add');

    // --- FUNÇÕES UTILITÁRIAS ---
    const showErrorBanner = (message) => {
        const container = document.getElementById('notification-banner-container');
        if (container) {
            container.innerHTML = typeof renderErrorBanner === 'function' ? renderErrorBanner(message) : `<div class="bg-red-500 text-white p-4">${message}</div>`;
            setTimeout(() => container.innerHTML = '', 5000);
        }
    };

    // --- NAVEGAÇÃO ---
    const navigateTo = (page) => {
        if (!appRender) return;
        appRender.innerHTML = '';
        
        const isHomePage = page === 'home';
        fabAdd.classList.toggle('hidden', !isHomePage);
        document.getElementById('header-action-bar')?.classList.toggle('hidden', !isHomePage);

        switch (page) {
            case 'home':
                appRender.innerHTML = renderHomePage(APP_STATE.eventos);
                break;
            case 'adms':
            case 'atendentes':
                appRender.innerHTML = `<div class="p-4">Carregando usuários...</div>`;
                // Aqui você chamaria carregarUsuariosAdmin();
                break;
            default:
                appRender.innerHTML = renderHomePage(APP_STATE.eventos);
        }
    };

    // --- LOGIN E SESSÃO ---
    const loginMagico = async () => {
        const emailInput = document.getElementById('login-email');
        const email = emailInput?.value.trim();
        if (!email) {
            showErrorBanner("Por favor, insira um e-mail.");
            return;
        }

        try {
            const { error } = await window.supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            authRender.innerHTML = renderMagicLinkSentMessage(email);
        } catch (error) {
            showErrorBanner(`Erro: ${error.message}`);
        }
    };

    const handleLogout = () => {
        APP_STATE.user = null;
        APP_STATE.perfil = null;
        localStorage.clear();

        // Esconde o app e mostra o Login
        mainLayout.classList.add('hidden');
        authOverlay.classList.remove('hidden');
        authRender.innerHTML = renderLoginForm();

        document.getElementById('btn-enviar-link')?.addEventListener('click', loginMagico);
    };

    const handleUserSession = async (session) => {
        APP_STATE.user = session.user;
        
        // Busca o perfil na tabela 'atendentes'
        const { data: profile, error } = await window.supabase
            .from('atendentes')
            .select('*')
            .eq('id_usuario', APP_STATE.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            showErrorBanner("Erro ao buscar perfil.");
            return;
        }

        APP_STATE.perfil = profile;

        if (!profile) {
            // Se logou mas não tem perfil, mostra formulário de cadastro
            authOverlay.classList.remove('hidden');
            authRender.innerHTML = renderCadastroInicial();
            document.getElementById('btn-finalizar-cadastro')?.addEventListener('click', () => salvarCadastroInicial(APP_STATE.user));
        } else if (profile.nivel_acesso === 'Aguardando') {
            authOverlay.classList.remove('hidden');
            authRender.innerHTML = renderAwaitingApprovalMessage();
        } else {
            // Usuário aprovado: Esconde login e mostra o App
            authOverlay.classList.add('hidden');
            mainLayout.classList.remove('hidden');
            await inicializarApp();
        }
    };

    const inicializarApp = async () => {
        console.log("Iniciando dados do app...");
        // Exemplo: await fetchEventos();
        navigateTo('home');
    };

    // --- ESCUTADOR DE MUDANÇA DE AUTH ---
    window.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Evento Auth:", event);
        if (event === 'SIGNED_IN' && session) {
            handleUserSession(session);
        } else if (event === 'SIGNED_OUT') {
            handleLogout();
        }
    });

    // --- FLUXO INICIAL (MAIN FLOW) ---
    const checkInitialSession = async () => {
        authRender.innerHTML = typeof renderLoadingIndicator === 'function' ? renderLoadingIndicator() : 'Carregando...';
        const { data: { session } } = await window.supabase.auth.getSession();
        
        if (session) {
            handleUserSession(session);
        } else {
            handleLogout();
        }
    };

    // Eventos de botões
    btnMenu?.addEventListener('click', () => typeof openMenu === 'function' && openMenu());
    btnHome?.addEventListener('click', () => navigateTo('home'));

    checkInitialSession();
});