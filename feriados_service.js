
/**
 * @typedef {import('@supabase/supabase-js').SupabaseClient} SupabaseClient
 */

/**
 * @type {SupabaseClient}
 * @global
 * @description Assumes a global Supabase client instance is available, initialized in another script.
 * e.g., window.supabase = supabase.createClient(...)
 */
const supabase = window.supabase;

/**
 * Sincroniza feriados nacionais da Brasil API e feriados estaduais da Bahia com o Supabase.
 * Utiliza 'upsert' para evitar duplicatas, tratando a data como chave de conflito.
 * @param {number} ano - O ano para o qual os feriados serão sincronizados.
 * @returns {Promise<void>}
 */
async function sincronizarFeriados(ano) {
    if (!supabase) {
        console.error('Cliente Supabase não encontrado. A sincronização de feriados foi abortada.');
        return;
    }
    console.log(`Iniciando sincronização de feriados para o ano ${ano}...`);
    try {
        // 1. Fetch de feriados nacionais da Brasil API
        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar feriados na Brasil API: ${response.statusText}`);
        }
        const feriadosNacionaisAPI = await response.json();

        // 2. Mapeamento para o formato do banco de dados
        let feriadosParaSalvar = feriadosNacionaisAPI.map(feriado => ({
            data_feriado: feriado.date,
            nome_feriado: feriado.name,
            tipo_feriado: 'Nacional'
        }));
        
        console.log(`Encontrados ${feriadosParaSalvar.length} feriados nacionais.`);

        // 3. Adicionar feriados estaduais (Bahia) manualmente
        const feriadosEstaduaisBA = [
            {
                data_feriado: `${ano}-07-02`,
                nome_feriado: 'Independência da Bahia',
                tipo_feriado: 'Estadual'
            },
            {
                data_feriado: `${ano}-12-08`,
                nome_feriado: 'Nossa Sra. da Conceição da Praia',
                tipo_feriado: 'Estadual'
            }
        ];
        
        feriadosParaSalvar.push(...feriadosEstaduaisBA);
        console.log('Adicionados 2 feriados estaduais da Bahia.');

        // 4. Persistência Sênior com Upsert no Supabase
        const { error } = await supabase
            .from('feriados')
            .upsert(feriadosParaSalvar, { onConflict: 'data_feriado' });

        if (error) {
            throw new Error(`Erro no Supabase ao fazer upsert: ${error.message}`);
        }

        console.log('Sincronização de feriados com o Supabase concluída com sucesso.');

    } catch (error) {
        console.error('Falha na sincronização de feriados:', error);
    }
}


/**
 * Busca todos os feriados no Supabase e retorna um objeto para consulta rápida.
 * @returns {Promise<Object<string, string>>} Um objeto onde a chave é a data (YYYY-MM-DD) e o valor é o nome do feriado.
 */
async function getFeriadosMap() {
    if (!supabase) {
        console.error('Cliente Supabase não encontrado. Impossível buscar feriados.');
        return {};
    }
    console.log('Buscando mapa de feriados do Supabase...');
    try {
        const { data: feriados, error } = await supabase
            .from('feriados')
            .select('data_feriado, nome_feriado');

        if (error) {
            throw new Error(`Erro no Supabase ao buscar feriados: ${error.message}`);
        }

        if (!feriados) {
            console.warn('Nenhum feriado encontrado no banco de dados.');
            return {};
        }

        // Transforma o array de objetos em um mapa { 'YYYY-MM-DD': 'Nome Feriado' }
        const feriadosMap = feriados.reduce((map, feriado) => {
            map[feriado.data_feriado] = feriado.nome_feriado;
            return map;
        }, {});

        console.log(`Mapa com ${Object.keys(feriadosMap).length} feriados carregado.`);
        return feriadosMap;

    } catch (error) {
        console.error('Falha ao buscar mapa de feriados:', error);
        return {}; // Retorna um objeto vazio em caso de erro para não quebrar a UI
    }
}
