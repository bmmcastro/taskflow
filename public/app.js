"use strict";
//projeto taskflow - equipa: diogo, nelson, alexandre e bruno
//o frontend e servido pelo proprio servidor, por isso a api fica no mesmo sitio

//endereco da api (vazio = mesmo endereco da pagina)
const API = "";

//variaveis que guardam o estado da app enquanto a usamos
let utilizadorLogado = null;   //quem fez login
let projetoAtual = null;       //em que projeto estamos
let projetos = [];             //projetos do utilizador (para nao meter o nome no onclick)
let tarefas = [];              //tarefas do projeto que esta aberto

let tarefaEmEdicaoId = null;   //id da tarefa que estamos a editar (null = nova)
let tarefaParaApagarId = null; //id da tarefa que vamos apagar
let projetoParaApagarId = null; //id do projeto que vamos apagar

//filtros do ecra das tarefas
let filtroResponsavel = "Todos";
let ordemCrescente = true;


//TEMA CLARO / ESCURO - Bruno

window.mudarTema = function () {
    const html = document.documentElement;
    const atual = html.getAttribute("data-bs-theme");
    const novo = (atual === "dark") ? "light" : "dark";
    html.setAttribute("data-bs-theme", novo);
    document.getElementById("icone-tema").innerHTML = (novo === "dark") ? '<i class="bi bi-brightness-high"></i>' : '<i class="bi bi-moon-stars"></i>';
    //guardamos a escolha para a proxima vez que abrir
    localStorage.setItem("tema", novo);
};

function aplicarTemaGuardado() {
    const tema = localStorage.getItem("tema") || "light";
    document.documentElement.setAttribute("data-bs-theme", tema);
    document.getElementById("icone-tema").innerHTML = (tema === "dark") ? '<i class="bi bi-brightness-high"></i>' : '<i class="bi bi-moon-stars"></i>';
}


//MENSAGENS (toast em vez de alert)

function mostrarMensagem(texto, cor) {
    const toast = document.getElementById("toast");
    document.getElementById("toast-texto").innerText = texto;
    //mudar a cor do toast conforme for sucesso ou erro
    toast.className = "toast align-items-center text-white border-0 bg-" + (cor || "dark");
    bootstrap.Toast.getOrCreateInstance(toast).show();
}


//AJUDAS PARA OS ECRAS E MODAIS

//esconde todos os ecras e mostra so o que queremos
function mostrarEcra(id) {
    document.getElementById("ecra-inicio").style.display = "none";
    document.getElementById("ecra-sobre").style.display = "none";
    document.getElementById("ecra-faq").style.display = "none";
    document.getElementById("ecra-login").style.display = "none";
    document.getElementById("ecra-projetos").style.display = "none";
    document.getElementById("ecra-tarefas").style.display = "none";
    document.getElementById("ecra-config").style.display = "none";
    //deixamos vazio para o ecra voltar ao seu display natural
    document.getElementById(id).style.display = "";
    fecharMenuMobile();
}

//no telemovel, fecha o menu hamburger depois de carregar numa opcao
function fecharMenuMobile() {
    const menu = document.getElementById("navConteudo");
    if (menu && menu.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
}

//a navbar esta sempre visivel, mas o menu muda conforme temos login feito ou nao
function atualizarNavbar() {
    const logado = utilizadorLogado !== null;
    //os itens "nav-logado" so aparecem com login; os "nav-deslogado" so sem login
    document.querySelectorAll(".nav-logado").forEach(el => el.style.display = logado ? "" : "none");
    document.querySelectorAll(".nav-deslogado").forEach(el => el.style.display = logado ? "none" : "");
}

function abrirModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}

function fecharModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
}

//poe a data num formato que o input date entende (aaaa-mm-dd)
function paraInputData(data) {
    if (!data) return "";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "";
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
}

//mostra a data bonita (dd/mm/aaaa)
function formatarData(data) {
    if (!data) return "-";
    const d = new Date(data);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-PT");
}

//escapar o texto do utilizador para nao deixar meter html/codigo (protege contra XSS)
function escapar(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


//LOGIN E REGISTO - Diogo

window.mostrarRegisto = function () {
    document.getElementById("form-login").style.display = "none";
    document.getElementById("form-registo").style.display = "block";
};

window.mostrarLogin = function () {
    document.getElementById("form-registo").style.display = "none";
    document.getElementById("form-login").style.display = "block";
};

window.fazerLogin = function () {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
        mostrarMensagem("Preenche o email e a password", "danger");
        return;
    }

    fetch(API + "/utilizadores/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
        .then(res => {
            if (!res.ok) { throw new Error("login errado"); }
            return res.json();
        })
        .then(dados => {
            utilizadorLogado = dados.utilizador;
            //guardamos o utilizador para nao ter de fazer login outra vez se atualizar a pagina
            localStorage.setItem("utilizador", JSON.stringify(utilizadorLogado));
            entrarNaApp();
        })
        .catch(() => {
            mostrarMensagem("Email ou password errados", "danger");
        });
};

window.fazerRegisto = function () {
    const nome = document.getElementById("registo-nome").value.trim();
    const email = document.getElementById("registo-email").value.trim();
    const password = document.getElementById("registo-password").value.trim();

    if (!nome || !email || !password) {
        mostrarMensagem("Preenche todos os campos", "danger");
        return;
    }

    fetch(API + "/utilizadores/registo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, email: email, password: password })
    })
        .then(res => {
            if (!res.ok) { throw new Error("erro no registo"); }
            return res.json();
        })
        .then(() => {
            mostrarMensagem("Conta criada! Já podes entrar", "success");
            mostrarLogin();
        })
        .catch(() => {
            mostrarMensagem("Não foi possível criar a conta (talvez o email já exista)", "danger");
        });
};

window.sair = function () {
    utilizadorLogado = null;
    projetoAtual = null;
    localStorage.removeItem("utilizador");
    atualizarNavbar();
    mostrarEcra("ecra-inicio");
};

//PAGINA INICIAL - Bruno
//botoes da pagina inicial que levam ao login ou ao registo
window.irParaLogin = function () {
    mostrarEcra("ecra-login");
    mostrarLogin();
};

window.irParaRegisto = function () {
    mostrarEcra("ecra-login");
    mostrarRegisto();
};

window.voltarAoInicio = function () {
    mostrarEcra("ecra-inicio");
};

//pagina "sobre" (funciona com ou sem login)
window.abrirSobre = function () {
    mostrarEcra("ecra-sobre");
    verificarEstadoApi(); //o Alexandre meteu aqui um teste rapido aos endereços
};

//pagina de ajuda / faq (funciona com ou sem login)
window.abrirFaq = function () {
    mostrarEcra("ecra-faq");
};

//testa os endereços GET principais e mostra se respondem (so leitura, nao mexe na bd)
function verificarEstadoApi() {
    const enderecos = [
        { metodo: "GET", url: "/utilizadores", nome: "Utilizadores" },
        { metodo: "GET", url: "/projetos?utilizador_id=1", nome: "Projetos" },
        { metodo: "GET", url: "/tarefas?projeto_id=1", nome: "Tarefas" },
        { metodo: "GET", url: "/tarefas/relatorio?projeto_id=1", nome: "Relatório" },
        { metodo: "GET", url: "/subtarefas?tarefa_id=1", nome: "Subtarefas" }
    ];

    const lista = document.getElementById("sobre-api-lista");
    const geral = document.getElementById("sobre-api-geral");
    lista.innerHTML = "";

    //para cada endereço criamos uma linha e vamos atualizando o estado
    let okCount = 0;
    let respondidos = 0;

    enderecos.forEach(function (e) {
        const linha = document.createElement("div");
        linha.className = "list-group-item d-flex justify-content-between align-items-center";
        linha.innerHTML = '<span><span class="badge bg-secondary me-2">' + e.metodo + '</span>' + escapar(e.nome) +
            ' <code class="small text-secondary">' + escapar(e.url) + '</code></span>' +
            '<span class="badge bg-secondary rounded-pill"><span class="spinner-border spinner-border-sm"></span></span>';
        lista.appendChild(linha);
        const selo = linha.querySelector("span.badge.rounded-pill");

        const t0 = Date.now();
        fetch(API + e.url)
            .then(function (r) {
                const ms = Date.now() - t0;
                respondidos++;
                if (r.ok) {
                    okCount++;
                    selo.className = "badge bg-success rounded-pill";
                    selo.innerHTML = '<i class="bi bi-check-lg"></i> ' + ms + " ms";
                } else {
                    selo.className = "badge bg-danger rounded-pill";
                    selo.innerText = "HTTP " + r.status;
                }
                atualizarSeloGeral();
            })
            .catch(function () {
                respondidos++;
                selo.className = "badge bg-danger rounded-pill";
                selo.innerText = "sem resposta";
                atualizarSeloGeral();
            });
    });

    //o selo de cima mostra o resumo (ex: 5/5 online)
    function atualizarSeloGeral() {
        if (respondidos < enderecos.length) return;
        if (okCount === enderecos.length) {
            geral.className = "badge bg-success rounded-pill align-middle";
            geral.innerText = "online (" + okCount + "/" + enderecos.length + ")";
        } else if (okCount === 0) {
            geral.className = "badge bg-danger rounded-pill align-middle";
            geral.innerText = "offline";
        } else {
            geral.className = "badge bg-warning text-dark rounded-pill align-middle";
            geral.innerText = okCount + "/" + enderecos.length + " online";
        }
    }
}

//depois do login mostramos o nome e vamos para os projetos
function entrarNaApp() {
    document.getElementById("nome-utilizador").innerText = utilizadorLogado.nome;
    atualizarNavbar();
    mostrarEcra("ecra-projetos");
    carregarProjetos();
}


//PROJETOS - Nelson

function carregarProjetos() {
    fetch(API + "/projetos?utilizador_id=" + utilizadorLogado.id)
        .then(res => res.json())
        .then(lista => {
            projetos = lista; //guardamos para depois irmos buscar o nome pelo id
            const container = document.getElementById("lista-projetos");
            const aviso = document.getElementById("aviso-sem-projetos");
            container.innerHTML = "";

            if (lista.length === 0) {
                aviso.style.display = "block";
                return;
            }
            aviso.style.display = "none";

            lista.forEach(projeto => {
                //a primeira letra do nome para por dentro da bolinha
                const inicial = projeto.nome.charAt(0).toUpperCase();
                //so o criador do projeto ve o botao de apagar
                let botaoApagar = "";
                if (Number(projeto.criador_id) === Number(utilizadorLogado.id)) {
                    botaoApagar = `<button class="btn btn-sm btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" title="Apagar projeto" onclick="event.stopPropagation(); confirmarApagarProjeto(${projeto.id})">🗑️</button>`;
                }
                const coluna = document.createElement("div");
                coluna.className = "col-lg-4 col-md-6";
                coluna.innerHTML = `
                    <div class="card cartao shadow-sm h-100 position-relative" style="cursor: pointer;"
                         onclick="abrirProjeto(${projeto.id})">
                        ${botaoApagar}
                        <div class="card-body d-flex align-items-center gap-3">
                            <div class="projeto-icone">${escapar(inicial)}</div>
                            <div>
                                <h5 class="fw-bold mb-1">${escapar(projeto.nome)}</h5>
                                <p class="text-secondary small mb-0">${escapar(projeto.descricao || "")}</p>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(coluna);
            });
        })
        .catch(() => {
            mostrarMensagem("Erro a carregar os projetos", "danger");
        });
}

window.abrirModalProjeto = function () {
    document.getElementById("projeto-nome").value = "";
    document.getElementById("projeto-desc").value = "";
    abrirModal("modal-projeto");
};

window.guardarProjeto = function () {
    const nome = document.getElementById("projeto-nome").value.trim();
    const descricao = document.getElementById("projeto-desc").value.trim();

    if (!nome) {
        mostrarMensagem("O projeto tem de ter um nome", "danger");
        return;
    }

    fetch(API + "/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, descricao: descricao, utilizador_id: utilizadorLogado.id })
    })
        .then(res => res.json())
        .then(() => {
            fecharModal("modal-projeto");
            mostrarMensagem("Projeto criado", "success");
            carregarProjetos();
        })
        .catch(() => {
            mostrarMensagem("Erro a criar o projeto", "danger");
        });
};

window.abrirProjeto = function (id) {
    //vamos buscar o projeto pelo id (assim nao metemos o nome no onclick)
    const projeto = projetos.find(p => p.id === id);
    if (!projeto) return;
    projetoAtual = { id: projeto.id, nome: projeto.nome };
    document.getElementById("titulo-projeto").innerText = projeto.nome;
    mostrarEcra("ecra-tarefas");
    carregarTarefas();
};

window.voltarAosProjetos = function () {
    mostrarEcra("ecra-projetos");
    carregarProjetos();
};

//Alexandre - abrir o modal a perguntar se queremos mesmo apagar o projeto
window.confirmarApagarProjeto = function (id) {
    projetoParaApagarId = id;
    abrirModal("modal-apagar-projeto");
};

//Alexandre - apagar mesmo o projeto
window.apagarProjetoConfirmado = function () {
    fetch(API + "/projetos/" + projetoParaApagarId + "?utilizador_id=" + utilizadorLogado.id, { method: "DELETE" })
        .then(() => {
            fecharModal("modal-apagar-projeto");
            mostrarMensagem("Projeto apagado", "success");
            carregarProjetos();
        })
        .catch(() => mostrarMensagem("Erro a apagar o projeto", "danger"));
};


//TAREFAS (mostrar e criar) - Bruno

function carregarTarefas() {
    fetch(API + "/tarefas?projeto_id=" + projetoAtual.id)
        .then(res => res.json())
        .then(lista => {
            tarefas = lista;
            atualizarFiltroResponsavel();
            mostrarTarefas();
        })
        .catch(() => {
            mostrarMensagem("Erro a carregar as tarefas", "danger");
        });
}

//poe os nomes dos responsaveis na caixa do filtro
function atualizarFiltroResponsavel() {
    const select = document.getElementById("filtro-responsavel");
    const nomes = [];
    tarefas.forEach(t => {
        if (nomes.indexOf(t.responsavel) === -1) {
            nomes.push(t.responsavel);
        }
    });
    let html = `<option value="Todos">Todas</option>`;
    nomes.forEach(nome => {
        html += `<option value="${nome}">${nome}</option>`;
    });
    select.innerHTML = html;
    select.value = filtroResponsavel;
}

//mostra as tarefas no quadro (uma coluna por estado, estilo trello)
function mostrarTarefas() {
    //fazemos uma copia para nao estragar a lista original
    let lista = tarefas.slice();

    //filtro por pessoa
    if (filtroResponsavel !== "Todos") {
        lista = lista.filter(t => t.responsavel === filtroResponsavel);
    }
    //ordenar por prazo
    lista.sort((a, b) => {
        const dataA = new Date(a.data_conclusao).getTime();
        const dataB = new Date(b.data_conclusao).getTime();
        return ordemCrescente ? dataA - dataB : dataB - dataA;
    });

    //aviso quando nao ha nenhuma tarefa
    document.getElementById("aviso-sem-tarefas").style.display = (lista.length === 0) ? "block" : "none";

    //cada estado tem a sua coluna e o seu contador
    const colunas = [
        { estado: "Por fazer", lista: "lista-por-fazer", contador: "count-por-fazer" },
        { estado: "Em curso", lista: "lista-em-curso", contador: "count-em-curso" },
        { estado: "Concluída", lista: "lista-concluida", contador: "count-concluida" }
    ];

    colunas.forEach(c => {
        const container = document.getElementById(c.lista);
        container.innerHTML = "";
        const desta = lista.filter(t => t.status === c.estado);
        document.getElementById(c.contador).innerText = desta.length;
        desta.forEach(t => {
            const temp = document.createElement("div");
            temp.innerHTML = gerarCartao(t);
            container.appendChild(temp.firstElementChild);
        });
    });
}

//monta o html de um cartao de tarefa (arrastavel)
function gerarCartao(t) {
    //se o prazo ja passou e a tarefa nao esta concluida, a data fica a vermelho
    let atrasada = false;
    if (t.status !== "Concluída" && t.data_conclusao) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const prazo = new Date(t.data_conclusao);
        if (!isNaN(prazo.getTime()) && prazo < hoje) atrasada = true;
    }
    const corPrazo = atrasada ? "bg-danger" : "bg-secondary-subtle text-secondary-emphasis";

    //progresso das subtarefas (percentagem de concluidas)
    const totalSub = Number(t.total_sub || 0);
    const feitasSub = Number(t.concluidas_sub || 0);
    const percSub = totalSub > 0 ? Math.round((feitasSub / totalSub) * 100) : 0;
    let progresso = "";
    if (totalSub > 0) {
        progresso = `
                <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                        <div class="progress-bar bg-success" style="width: ${percSub}%;"></div>
                    </div>
                    <span class="small text-secondary">${feitasSub}/${totalSub}</span>
                </div>`;
    }

    //o link so e mostrado se comecar por http (para nao deixar links javascript:)
    let linkHtml = "";
    if (t.link && /^https?:\/\//i.test(t.link)) {
        linkHtml = `<a href="${escapar(t.link)}" target="_blank" rel="noopener" class="d-inline-block small text-decoration-none mb-2">🔗 anexo</a>`;
    }

    return `
        <div class="card cartao shadow-sm" draggable="true" ondragstart="arrastarInicio(event, ${t.id})">
            <div class="card-body">
                <h6 class="fw-bold mb-1">${escapar(t.titulo)}</h6>
                ${t.descricao ? `<p class="text-secondary small mb-2">${escapar(t.descricao)}</p>` : ""}
                <div class="d-flex flex-wrap gap-1 mb-2">
                    <span class="badge bg-info-subtle text-info-emphasis rounded-pill">👤 ${escapar(t.responsavel)}</span>
                    <span class="badge ${corPrazo} rounded-pill">📅 ${formatarData(t.data_conclusao)}</span>
                </div>
                ${progresso}
                ${linkHtml}
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light flex-fill" onclick="abrirSubtarefas(${t.id})" aria-label="Subtarefas" title="Subtarefas">☑️</button>
                    <button class="btn btn-sm btn-light flex-fill" onclick="editarTarefa(${t.id})" aria-label="Editar tarefa" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-light text-danger flex-fill" onclick="confirmarApagar(${t.id})" aria-label="Apagar tarefa" title="Apagar">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

window.aplicarFiltros = function () {
    filtroResponsavel = document.getElementById("filtro-responsavel").value;
    mostrarTarefas();
};

//arrastar e largar (mover a tarefa de coluna muda o estado) - Bruno
let tarefaArrastadaId = null;

window.arrastarInicio = function (e, id) {
    tarefaArrastadaId = id;
};

window.permitirLargar = function (e) {
    e.preventDefault();
    e.currentTarget.classList.add("arrastar-por-cima");
};

window.sairLargar = function (e) {
    e.currentTarget.classList.remove("arrastar-por-cima");
};

window.largar = function (e, novoEstado) {
    e.preventDefault();
    e.currentTarget.classList.remove("arrastar-por-cima");
    moverTarefa(tarefaArrastadaId, novoEstado);
};

//muda o estado de uma tarefa (usado quando largamos numa coluna)
function moverTarefa(id, novoEstado) {
    const t = tarefas.find(x => x.id === id);
    if (!t || t.status === novoEstado) return;

    fetch(API + "/tarefas/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            titulo: t.titulo,
            descricao: t.descricao,
            responsavel: t.responsavel,
            status: novoEstado,
            data_conclusao: paraInputData(t.data_conclusao),
            link: t.link
        })
    })
        .then(res => res.json())
        .then(() => carregarTarefas())
        .catch(() => mostrarMensagem("Erro a mover a tarefa", "danger"));
}


//SUBTAREFAS (checklist com percentagem) - Alexandre

let subtarefaTarefaId = null;

//abrir o modal das subtarefas de uma tarefa
window.abrirSubtarefas = function (id) {
    subtarefaTarefaId = id;
    //vamos buscar o titulo pelo id (assim nao metemos texto no onclick)
    const t = tarefas.find(x => x.id === id);
    document.getElementById("sub-titulo").innerText = t ? t.titulo : "";
    document.getElementById("sub-nova").value = "";
    carregarSubtarefas();
    abrirModal("modal-subtarefas");
};

//buscar as subtarefas e mostrar a lista + a percentagem
function carregarSubtarefas() {
    fetch(API + "/subtarefas?tarefa_id=" + subtarefaTarefaId)
        .then(res => res.json())
        .then(lista => {
            const ul = document.getElementById("lista-subtarefas");
            ul.innerHTML = "";
            let feitas = 0;

            lista.forEach(s => {
                if (s.concluida) feitas++;
                const item = document.createElement("li");
                item.className = "list-group-item d-flex justify-content-between align-items-center";
                const marcada = s.concluida ? "checked" : "";
                const risca = s.concluida ? "text-decoration-line-through text-secondary" : "";
                item.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${marcada} onchange="alternarSubtarefa(${s.id}, this.checked)">
                        <label class="form-check-label ${risca}">${escapar(s.descricao)}</label>
                    </div>
                    <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="removerSubtarefa(${s.id})">remover</button>
                `;
                ul.appendChild(item);
            });

            //calcular e mostrar a percentagem
            const total = lista.length;
            const perc = total > 0 ? Math.round((feitas / total) * 100) : 0;
            document.getElementById("sub-barra").style.width = perc + "%";
            document.getElementById("sub-percent").innerText = perc + "% concluído (" + feitas + "/" + total + ")";
        })
        .catch(() => mostrarMensagem("Erro a carregar as subtarefas", "danger"));
}

//Nelson - adicionar uma subtarefa
window.adicionarSubtarefa = function () {
    const descricao = document.getElementById("sub-nova").value.trim();
    if (!descricao) {
        mostrarMensagem("Escreve a subtarefa", "danger");
        return;
    }

    fetch(API + "/subtarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tarefa_id: subtarefaTarefaId, descricao: descricao })
    })
        .then(res => res.json())
        .then(() => {
            document.getElementById("sub-nova").value = "";
            carregarSubtarefas();
            carregarTarefas(); //atualizar a percentagem na carta
        })
        .catch(() => mostrarMensagem("Erro a adicionar a subtarefa", "danger"));
};

//Diogo - marcar/desmarcar uma subtarefa
window.alternarSubtarefa = function (id, concluida) {
    fetch(API + "/subtarefas/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concluida: concluida })
    })
        .then(res => res.json())
        .then(() => {
            carregarSubtarefas();
            carregarTarefas(); //atualizar a percentagem na carta
        })
        .catch(() => mostrarMensagem("Erro a atualizar a subtarefa", "danger"));
};

//Diogo - remover uma subtarefa
window.removerSubtarefa = function (id) {
    fetch(API + "/subtarefas/" + id, { method: "DELETE" })
        .then(() => {
            carregarSubtarefas();
            carregarTarefas(); //atualizar a percentagem na carta
        })
        .catch(() => mostrarMensagem("Erro a remover a subtarefa", "danger"));
};

window.mudarOrdem = function () {
    ordemCrescente = !ordemCrescente;
    mostrarTarefas();
};

window.abrirModalTarefa = function () {
    tarefaEmEdicaoId = null;
    document.getElementById("titulo-modal-tarefa").innerText = "Nova Tarefa";
    document.getElementById("tarefa-titulo").value = "";
    document.getElementById("tarefa-desc").value = "";
    document.getElementById("tarefa-responsavel").value = "";
    document.getElementById("tarefa-data").value = "";
    document.getElementById("tarefa-status").value = "Por fazer";
    document.getElementById("tarefa-link").value = "";
    abrirModal("modal-tarefa");
};

window.editarTarefa = function (id) {
    const t = tarefas.find(x => x.id === id);
    if (!t) return;

    tarefaEmEdicaoId = id;
    document.getElementById("titulo-modal-tarefa").innerText = "Editar Tarefa";
    document.getElementById("tarefa-titulo").value = t.titulo;
    document.getElementById("tarefa-desc").value = t.descricao || "";
    document.getElementById("tarefa-responsavel").value = t.responsavel;
    document.getElementById("tarefa-data").value = paraInputData(t.data_conclusao);
    document.getElementById("tarefa-status").value = t.status;
    document.getElementById("tarefa-link").value = t.link || "";
    abrirModal("modal-tarefa");
};

window.guardarTarefa = function () {
    const titulo = document.getElementById("tarefa-titulo").value.trim();
    const descricao = document.getElementById("tarefa-desc").value.trim();
    const responsavel = document.getElementById("tarefa-responsavel").value.trim();
    const data_conclusao = document.getElementById("tarefa-data").value;
    const status = document.getElementById("tarefa-status").value;
    const link = document.getElementById("tarefa-link").value.trim();

    if (!titulo || !responsavel || !data_conclusao) {
        mostrarMensagem("Preenche o título, o responsável e o prazo", "danger");
        return;
    }

    if (tarefaEmEdicaoId === null) {
        //criar tarefa nova (POST)
        fetch(API + "/tarefas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: titulo,
                descricao: descricao,
                criador: utilizadorLogado.nome,
                responsavel: responsavel,
                status: status,
                data_conclusao: data_conclusao,
                link: link,
                projeto_id: projetoAtual.id
            })
        })
            .then(res => res.json())
            .then(() => {
                fecharModal("modal-tarefa");
                mostrarMensagem("Tarefa criada", "success");
                carregarTarefas();
            })
            .catch(() => mostrarMensagem("Erro a criar a tarefa", "danger"));
    } else {
        //atualizar tarefa (PATCH)
        fetch(API + "/tarefas/" + tarefaEmEdicaoId, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: titulo,
                descricao: descricao,
                responsavel: responsavel,
                status: status,
                data_conclusao: data_conclusao,
                link: link
            })
        })
            .then(res => res.json())
            .then(() => {
                fecharModal("modal-tarefa");
                mostrarMensagem("Tarefa atualizada", "success");
                carregarTarefas();
            })
            .catch(() => mostrarMensagem("Erro a atualizar a tarefa", "danger"));
    }
};


//APAGAR TAREFA E MEMBROS - Bruno e Nelson

window.confirmarApagar = function (id) {
    tarefaParaApagarId = id;
    abrirModal("modal-apagar");
};

window.apagarTarefaConfirmado = function () {
    fetch(API + "/tarefas/" + tarefaParaApagarId, { method: "DELETE" })
        .then(() => {
            fecharModal("modal-apagar");
            mostrarMensagem("Tarefa apagada", "success");
            carregarTarefas();
        })
        .catch(() => mostrarMensagem("Erro a apagar a tarefa", "danger"));
};

window.abrirMembros = function () {
    //buscar os membros do projeto
    fetch(API + "/projetos/" + projetoAtual.id + "/membros")
        .then(res => res.json())
        .then(membros => {
            const lista = document.getElementById("lista-membros");
            lista.innerHTML = "";
            membros.forEach(m => {
                const item = document.createElement("li");
                item.className = "list-group-item d-flex justify-content-between align-items-center";
                //o criador tem um crachá; os outros tem botao de remover
                let direita = "";
                if (m.criador) {
                    direita = `<span class="badge bg-secondary rounded-pill">criador</span>`;
                } else {
                    direita = `<button class="btn btn-sm btn-outline-danger rounded-pill" onclick="removerMembro(${m.id})">remover</button>`;
                }
                item.innerHTML = `<span>${escapar(m.nome)} <span class="text-secondary small">${escapar(m.email)}</span></span> ${direita}`;
                lista.appendChild(item);
            });
        })
        .catch(() => mostrarMensagem("Erro a carregar os membros", "danger"));

    //buscar todos os utilizadores para o menu de juntar
    fetch(API + "/utilizadores")
        .then(res => res.json())
        .then(utilizadores => {
            const select = document.getElementById("select-utilizador");
            select.innerHTML = "";
            utilizadores.forEach(u => {
                const op = document.createElement("option");
                op.value = u.id;
                op.innerText = u.nome + " (" + u.email + ")";
                select.appendChild(op);
            });
        })
        .catch(() => mostrarMensagem("Erro a carregar os utilizadores", "danger"));

    abrirModal("modal-membros");
};

window.juntarMembro = function () {
    const utilizador_id = document.getElementById("select-utilizador").value;

    fetch(API + "/projetos/" + projetoAtual.id + "/membros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilizador_id: utilizador_id })
    })
        .then(() => {
            mostrarMensagem("Membro adicionado", "success");
            abrirMembros(); //voltar a carregar a lista
        })
        .catch(() => mostrarMensagem("Erro a juntar o membro", "danger"));
};

//Diogo - remover um membro do projeto (o criador nao pode ser removido)
window.removerMembro = function (utilizadorId) {
    fetch(API + "/projetos/" + projetoAtual.id + "/membros/" + utilizadorId, { method: "DELETE" })
        .then(res => {
            if (!res.ok) { throw new Error("nao deu"); }
            mostrarMensagem("Membro removido", "success");
            abrirMembros(); //voltar a carregar a lista
        })
        .catch(() => mostrarMensagem("Não foi possível remover o membro", "danger"));
};


//RELATORIO - Bruno

window.abrirRelatorio = function () {
    fetch(API + "/tarefas/relatorio?projeto_id=" + projetoAtual.id)
        .then(res => res.json())
        .then(dados => {
            const pct = dados.percentagem || 0;
            let html = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>Progresso do projeto</strong>
                    <span class="badge bg-success">${pct}% concluído</span>
                </div>
                <div class="progress mb-3" style="height: 12px;" role="progressbar" aria-label="Percentagem concluída" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar bg-success" style="width: ${pct}%;"></div>
                </div>
                <ul class="list-unstyled">
                    <li>📝 <strong>Total de tarefas:</strong> ${dados.total}</li>
                    <li>✅ <strong>Concluídas:</strong> ${dados.concluidas}</li>
                    <li>🔄 <strong>Em curso:</strong> ${dados.emCurso || 0}</li>
                    <li>🕒 <strong>Por fazer:</strong> ${dados.porFazer || 0}</li>
                    <li>⚠️ <strong>Atrasadas:</strong> ${dados.atrasadas || 0}</li>
                </ul>
                <hr>
                <strong>Tarefas por pessoa:</strong>
                <ul>`;
            for (const pessoa in dados.porPessoa) {
                html += `<li>👤 ${escapar(pessoa)}: ${dados.porPessoa[pessoa]} tarefa(s)</li>`;
            }
            html += `</ul>`;
            document.getElementById("conteudo-relatorio").innerHTML = html;
            abrirModal("modal-relatorio");
        })
        .catch(() => mostrarMensagem("Erro a carregar o relatório", "danger"));
};


//A MINHA CONTA - Diogo

window.abrirConta = function () {
    fecharMenuMobile();
    document.getElementById("conta-nome").value = utilizadorLogado.nome;
    document.getElementById("conta-email").value = utilizadorLogado.email;
    document.getElementById("conta-password").value = "";
    abrirModal("modal-conta");
};

window.guardarConta = function () {
    const nome = document.getElementById("conta-nome").value.trim();
    const email = document.getElementById("conta-email").value.trim();
    const password = document.getElementById("conta-password").value.trim();

    if (!nome || !email) {
        mostrarMensagem("O nome e o email não podem ficar vazios", "danger");
        return;
    }

    fetch(API + "/utilizadores/" + utilizadorLogado.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, email: email, password: password })
    })
        .then(res => res.json())
        .then(dados => {
            //guardamos os dados novos do utilizador
            utilizadorLogado = dados;
            localStorage.setItem("utilizador", JSON.stringify(utilizadorLogado));
            document.getElementById("nome-utilizador").innerText = utilizadorLogado.nome;
            fecharModal("modal-conta");
            mostrarMensagem("Conta atualizada", "success");
        })
        .catch(() => mostrarMensagem("Erro a atualizar a conta (o email pode já existir)", "danger"));
};


//CONFIGURACOES / ESTADO DA API - Alexandre

//lista de todos os enderecos da nossa api (a "chave" serve para acertar no resultado)
const ENDERECOS = [
    { chave: 'get-utilizadores',  metodo: 'GET',    caminho: '/utilizadores',         quem: 'Diogo', descricao: 'Lista todos os utilizadores',            codigo: "fetch('/utilizadores')" },
    { chave: 'post-registo',      metodo: 'POST',   caminho: '/utilizadores/registo', quem: 'Diogo', descricao: 'Cria uma conta nova',                    codigo: "fetch('/utilizadores/registo', { method: 'POST', body: JSON.stringify({ nome, email, password }) })" },
    { chave: 'post-login',        metodo: 'POST',   caminho: '/utilizadores/login',   quem: 'Diogo',     descricao: 'Verifica o email e a password',          codigo: "fetch('/utilizadores/login', { method: 'POST', body: JSON.stringify({ email, password }) })" },
    { chave: 'patch-utilizador',  metodo: 'PATCH',  caminho: '/utilizadores/:id',     quem: 'Diogo', descricao: 'Atualiza a conta (nome, email, password)', codigo: "fetch('/utilizadores/' + id, { method: 'PATCH', body: JSON.stringify({ nome, email, password }) })" },
    { chave: 'delete-utilizador', metodo: 'DELETE', caminho: '/utilizadores/:id',     quem: 'Diogo', descricao: 'Apaga um utilizador',                    codigo: "fetch('/utilizadores/' + id, { method: 'DELETE' })" },
    { chave: 'get-projetos',      metodo: 'GET',    caminho: '/projetos',             quem: 'Nelson',     descricao: 'Lista os projetos do utilizador',        codigo: "fetch('/projetos?utilizador_id=' + id)" },
    { chave: 'post-projetos',     metodo: 'POST',   caminho: '/projetos',             quem: 'Nelson',     descricao: 'Cria um projeto e junta o criador',      codigo: "fetch('/projetos', { method: 'POST', body: JSON.stringify({ nome, descricao, utilizador_id }) })" },
    { chave: 'get-membros',       metodo: 'GET',    caminho: '/projetos/:id/membros', quem: 'Nelson',     descricao: 'Lista os membros de um projeto',         codigo: "fetch('/projetos/' + id + '/membros')" },
    { chave: 'post-membros',      metodo: 'POST',   caminho: '/projetos/:id/membros', quem: 'Nelson',     descricao: 'Junta um utilizador ao projeto',         codigo: "fetch('/projetos/' + id + '/membros', { method: 'POST', body: JSON.stringify({ utilizador_id }) })" },
    { chave: 'delete-membro',     metodo: 'DELETE', caminho: '/projetos/:id/membros/:uid', quem: 'Nelson', descricao: 'Remove um membro (menos o criador)',      codigo: "fetch('/projetos/' + id + '/membros/' + utilizadorId, { method: 'DELETE' })" },
    { chave: 'delete-projeto',    metodo: 'DELETE', caminho: '/projetos/:id',         quem: 'Nelson', descricao: 'Apaga o projeto (so o criador)',          codigo: "fetch('/projetos/' + id + '?utilizador_id=' + meuId, { method: 'DELETE' })" },
    { chave: 'get-tarefas',       metodo: 'GET',    caminho: '/tarefas',              quem: 'Bruno',     descricao: 'Lista as tarefas de um projeto',         codigo: "fetch('/tarefas?projeto_id=' + id)" },
    { chave: 'get-relatorio',     metodo: 'GET',    caminho: '/tarefas/relatorio',    quem: 'Bruno',    descricao: 'Estatisticas do projeto',                codigo: "fetch('/tarefas/relatorio?projeto_id=' + id)" },
    { chave: 'post-tarefas',      metodo: 'POST',   caminho: '/tarefas',              quem: 'Bruno',     descricao: 'Cria uma tarefa',                        codigo: "fetch('/tarefas', { method: 'POST', body: JSON.stringify({ titulo, responsavel, status, data_conclusao, projeto_id }) })" },
    { chave: 'patch-tarefa',      metodo: 'PATCH',  caminho: '/tarefas/:id',          quem: 'Bruno',     descricao: 'Atualiza uma tarefa',                    codigo: "fetch('/tarefas/' + id, { method: 'PATCH', body: JSON.stringify({ titulo, responsavel, status, data_conclusao }) })" },
    { chave: 'delete-tarefa',     metodo: 'DELETE', caminho: '/tarefas/:id',          quem: 'Bruno',    descricao: 'Apaga uma tarefa',                       codigo: "fetch('/tarefas/' + id, { method: 'DELETE' })" },
    { chave: 'get-subtarefas',    metodo: 'GET',    caminho: '/subtarefas',          quem: 'Alexandre',     descricao: 'Lista as subtarefas de uma tarefa',      codigo: "fetch('/subtarefas?tarefa_id=' + id)" },
    { chave: 'post-subtarefas',   metodo: 'POST',   caminho: '/subtarefas',          quem: 'Alexandre',     descricao: 'Cria uma subtarefa',                     codigo: "fetch('/subtarefas', { method: 'POST', body: JSON.stringify({ tarefa_id, descricao }) })" },
    { chave: 'patch-subtarefa',   metodo: 'PATCH',  caminho: '/subtarefas/:id',      quem: 'Alexandre',    descricao: 'Marca/desmarca uma subtarefa',           codigo: "fetch('/subtarefas/' + id, { method: 'PATCH', body: JSON.stringify({ concluida }) })" },
    { chave: 'delete-subtarefa',  metodo: 'DELETE', caminho: '/subtarefas/:id',      quem: 'Alexandre', descricao: 'Apaga uma subtarefa',                    codigo: "fetch('/subtarefas/' + id, { method: 'DELETE' })" }
];

window.abrirConfig = function () {
    mostrarEcra("ecra-config");
    testarApi();
};

window.voltarDaConfig = function () {
    mostrarEcra("ecra-projetos");
    carregarProjetos();
};

//monta a tabela com todas as linhas a "a testar..."
function construirTabelaConfig() {
    const corpo = document.getElementById("tabela-config");
    corpo.innerHTML = "";
    ENDERECOS.forEach(e => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td><span class="badge bg-secondary">${e.metodo}</span></td>
            <td>
                <code>${e.caminho}</code>
                <div class="text-secondary small">${e.descricao}</div>
                <details class="mt-1">
                    <summary class="small text-primary" style="cursor: pointer;">ver código</summary>
                    <pre class="small bg-body-secondary p-2 rounded mt-1 mb-0" style="white-space: pre-wrap;"><code>${e.codigo}</code></pre>
                </details>
            </td>
            <td>${e.quem}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <span id="estado-${e.chave}"><span class="badge bg-light text-dark">por testar</span></span>
                    <button class="btn btn-sm btn-outline-primary rounded-pill" onclick="testarUm('${e.chave}')" title="Testar só esta rota">▶</button>
                </div>
            </td>
        `;
        corpo.appendChild(linha);
    });
}

//faz um pedido e devolve sempre um objeto com o resultado (nunca rebenta)
function pedir(metodo, caminho, corpo) {
    const opcoes = { method: metodo, headers: { "Content-Type": "application/json" } };
    if (corpo) {
        opcoes.body = JSON.stringify(corpo);
    }
    return fetch(API + caminho, opcoes)
        .then(res => res.text().then(texto => {
            let dados = null;
            try { dados = JSON.parse(texto); } catch (erro) { dados = texto; }
            return { ok: res.ok, status: res.status, dados: dados };
        }))
        .catch(() => ({ ok: false, status: 0, dados: null }));
}

//pinta o resultado de um endereco na tabela (verde = ok, vermelho = erro)
function marcarEstado(chave, resultado) {
    const celula = document.getElementById("estado-" + chave);
    if (!celula) return;
    if (resultado && resultado.ok) {
        celula.innerHTML = `<span class="badge bg-success">✅ OK (${resultado.status})</span>`;
    } else {
        celula.innerHTML = `<span class="badge bg-danger">❌ erro (${resultado ? resultado.status : "-"})</span>`;
    }
}

//testa UMA rota. cada teste cria os dados de que precisa e apaga-os no fim,
//por isso pode correr sozinho sem deixar lixo na base de dados.
async function executarTeste(chave) {
    const meu = utilizadorLogado.id;
    const email = "teste_" + Date.now() + "@teste.pt";

    //--- leituras simples (nao mexem em dados) ---
    if (chave === "get-utilizadores") return await pedir("GET", "/utilizadores");
    if (chave === "post-login") {
        //criamos uma conta so para o teste, fazemos login com ela e apagamos
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (!u.dados || !u.dados.id) return u;
        const r = await pedir("POST", "/utilizadores/login", { email: email, password: "teste123" });
        await pedir("DELETE", "/utilizadores/" + u.dados.id);
        return r;
    }
    if (chave === "get-projetos") return await pedir("GET", "/projetos?utilizador_id=" + meu);
    if (chave === "get-tarefas") return await pedir("GET", "/tarefas?projeto_id=1");
    if (chave === "get-relatorio") return await pedir("GET", "/tarefas/relatorio?projeto_id=1");

    //--- utilizadores (criamos um de teste e apagamos) ---
    if (chave === "post-registo") {
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (u.dados && u.dados.id) await pedir("DELETE", "/utilizadores/" + u.dados.id);
        return u;
    }
    if (chave === "patch-utilizador") {
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (!u.dados || !u.dados.id) return u;
        const r = await pedir("PATCH", "/utilizadores/" + u.dados.id, { nome: "Teste 2", email: email, password: "" });
        await pedir("DELETE", "/utilizadores/" + u.dados.id);
        return r;
    }
    if (chave === "delete-utilizador") {
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (!u.dados || !u.dados.id) return u;
        return await pedir("DELETE", "/utilizadores/" + u.dados.id);
    }

    //--- projetos e membros (criamos um projeto de teste e apagamos) ---
    if (chave === "post-projetos") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        if (p.dados && p.dados.id) await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        return p;
    }
    if (chave === "delete-projeto") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        if (!p.dados || !p.dados.id) return p;
        return await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
    }
    if (chave === "get-membros") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        if (!p.dados || !p.dados.id) return p;
        const r = await pedir("GET", "/projetos/" + p.dados.id + "/membros");
        await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        return r;
    }
    if (chave === "post-membros") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (!p.dados || !p.dados.id || !u.dados || !u.dados.id) return p;
        const r = await pedir("POST", "/projetos/" + p.dados.id + "/membros", { utilizador_id: u.dados.id });
        await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        await pedir("DELETE", "/utilizadores/" + u.dados.id);
        return r;
    }
    if (chave === "delete-membro") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        const u = await pedir("POST", "/utilizadores/registo", { nome: "Teste", email: email, password: "teste123" });
        if (!p.dados || !p.dados.id || !u.dados || !u.dados.id) return p;
        await pedir("POST", "/projetos/" + p.dados.id + "/membros", { utilizador_id: u.dados.id });
        const r = await pedir("DELETE", "/projetos/" + p.dados.id + "/membros/" + u.dados.id);
        await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        await pedir("DELETE", "/utilizadores/" + u.dados.id);
        return r;
    }

    //--- tarefas (criamos um projeto e uma tarefa de teste e apagamos tudo) ---
    if (chave === "post-tarefas" || chave === "patch-tarefa" || chave === "delete-tarefa") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        if (!p.dados || !p.dados.id) return p;
        const t = await pedir("POST", "/tarefas", { titulo: "Tarefa teste", descricao: "x", criador: "Teste", responsavel: "Teste", status: "Por fazer", data_conclusao: "2026-12-31", link: "", projeto_id: p.dados.id });

        let r = t; //por defeito devolvemos o resultado do POST
        if (chave === "patch-tarefa" && t.dados && t.dados.id) {
            r = await pedir("PATCH", "/tarefas/" + t.dados.id, { titulo: "Tarefa teste 2", descricao: "x", responsavel: "Teste", status: "Concluída", data_conclusao: "2026-12-31", link: "" });
        }
        if (chave === "delete-tarefa" && t.dados && t.dados.id) {
            r = await pedir("DELETE", "/tarefas/" + t.dados.id);
        }

        //limpar
        if (t.dados && t.dados.id) await pedir("DELETE", "/tarefas/" + t.dados.id);
        await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        return r;
    }

    //subtarefas (criamos projeto + tarefa, fazemos a operacao e apagamos tudo)
    if (chave === "get-subtarefas" || chave === "post-subtarefas" || chave === "patch-subtarefa" || chave === "delete-subtarefa") {
        const p = await pedir("POST", "/projetos", { nome: "Projeto teste", descricao: "x", utilizador_id: meu });
        if (!p.dados || !p.dados.id) return p;
        const t = await pedir("POST", "/tarefas", { titulo: "Tarefa teste", descricao: "x", criador: "Teste", responsavel: "Teste", status: "Por fazer", data_conclusao: "2026-12-31", link: "", projeto_id: p.dados.id });
        if (!t.dados || !t.dados.id) {
            await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
            return t;
        }

        let r;
        if (chave === "get-subtarefas") {
            r = await pedir("GET", "/subtarefas?tarefa_id=" + t.dados.id);
        } else if (chave === "post-subtarefas") {
            r = await pedir("POST", "/subtarefas", { tarefa_id: t.dados.id, descricao: "Sub teste" });
        } else {
            //patch ou delete: criamos primeiro uma subtarefa
            const s = await pedir("POST", "/subtarefas", { tarefa_id: t.dados.id, descricao: "Sub teste" });
            if (chave === "patch-subtarefa") {
                r = await pedir("PATCH", "/subtarefas/" + s.dados.id, { concluida: true });
            } else {
                r = await pedir("DELETE", "/subtarefas/" + s.dados.id);
            }
        }

        //apagar o projeto apaga a tarefa e as subtarefas em cascata
        await pedir("DELETE", "/projetos/" + p.dados.id + "?utilizador_id=" + meu);
        return r;
    }
}

//botao ▶ de cada linha: testa so aquela rota
window.testarUm = async function (chave) {
    const celula = document.getElementById("estado-" + chave);
    if (celula) celula.innerHTML = `<span class="badge bg-light text-dark">a testar...</span>`;
    try {
        const resultado = await executarTeste(chave);
        marcarEstado(chave, resultado);
    } catch (erro) {
        marcarEstado(chave, { ok: false, status: 0 });
    }
};

//botao "Testar tudo": corre as rotas uma a uma
window.testarApi = async function () {
    construirTabelaConfig();
    for (let i = 0; i < ENDERECOS.length; i++) {
        await testarUm(ENDERECOS[i].chave);
    }
    mostrarMensagem("Testes terminados (os dados de teste foram apagados)", "success");
};


//ARRANQUE DA APP

aplicarTemaGuardado();

//se ja tinhamos feito login antes, entramos logo
const guardado = localStorage.getItem("utilizador");
if (guardado) {
    utilizadorLogado = JSON.parse(guardado);
    entrarNaApp();
} else {
    atualizarNavbar();
    mostrarEcra("ecra-inicio");
}
