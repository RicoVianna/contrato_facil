// LÓGICA DE ABERTURA DO APP (SPLASH E LOGIN)
document.addEventListener("DOMContentLoaded", () => {
    // ===== MODO DESENVOLVIMENTO - PULAR LOGIN =====
    // Descomente a linha abaixo para PULAR O LOGIN durante desenvolvimento
    //localStorage.setItem("vibecoo_usuario", "Usuário Teste");<<<<<< Descomentar
    
    const usuarioLogado = localStorage.getItem("vibecoo_usuario");
    
    // Simulando o tempo de carregamento do Splash Screen (2 segundos)
    setTimeout(() => {
        document.getElementById("splash-screen").style.opacity = "0";
        
        setTimeout(() => {
            document.getElementById("splash-screen").style.display = "none";
            
            // SE JÁ FEZ LOGIN, vai direto pro app
            if (usuarioLogado) {
                document.getElementById("login-screen").style.display = "none";
                document.getElementById("container").style.display = "block";
            } else {
                // SENÃO, mostra a tela de Login
                document.getElementById("login-screen").style.display = "flex";
            }
            
        }, 500); // Tempo da transição de opacidade
    }, 2000); // 2000 ms = 2 segundos de splash screen
});

// FUNÇÃO PARA O BOTÃO DE LOGIN
function entrarNoApp() {
    const nome = document.getElementById("usuario-nome").value;
    
    if (nome.trim() === "") {
        alert("Por favor, digite seu nome para continuar.");
        return;
    }
    
    // Salva o nome no celular do usuário (gratuitamente, sem banco de dados!)
    localStorage.setItem("vibecoo_usuario", nome);
    
    // Esconde o login e mostra o app
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("container").style.display = "block";
    
    // Opcional: Você pode colocar uma mensagem de "Olá, [Nome]" no topo do app depois
    alert(`Bem-vindo, ${nome}!`);
}

// ==========================
// INICIALIZAÇÃO DO APP
// ==========================

document.addEventListener('DOMContentLoaded', () => {
    inicializarMascaras();
    inicializarEventos();
    carregarDadosLocal();
    registrarServiceWorker();
});

function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('✅ Service Worker registrado com sucesso'))
            .catch(error => console.error('❌ Erro ao registrar Service Worker:', error));
    }
}

// ==========================
// VALIDAÇÃO DE CPF (Algoritmo Oficial)
// ==========================

function validarCPF(cpf) {
    cpf = cpf.replace(/[^0-9]/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    if (digito2 !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// ==========================
// VALIDAÇÃO DE CNPJ (Algoritmo Oficial)
// ==========================

function validarCNPJ(cnpj) {
    // Remove todos os caracteres não numéricos (pontos, barras, hífens, etc.)
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se o CNPJ tem exatamente 14 dígitos
    if (cnpj.length !== 14) {
        return false;
    }
    
    // Rejeita CNPJs com todos os dígitos iguais (ex: 11111111111111)
    if (/^(\d)\1+$/.test(cnpj)) {
        return false;
    }
    
    // Pesos para o cálculo dos dígitos verificadores
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    // Função auxiliar para calcular o dígito verificador
    function calcularDigito(cnpj, pesos) {
        let soma = 0;
        for (let i = 0; i < pesos.length; i++) {
            soma += parseInt(cnpj[i]) * pesos[i];
        }
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
    
    // Calcula o primeiro dígito verificador
    const digito1 = calcularDigito(cnpj.substring(0, 12), pesos1);
    if (digito1 !== parseInt(cnpj[12])) {
        return false;
    }
    
    // Calcula o segundo dígito verificador
    const digito2 = calcularDigito(cnpj.substring(0, 13), pesos2);
    if (digito2 !== parseInt(cnpj[13])) {
        return false;
    }
    
    // Se passou por todas as validações, o CNPJ é válido
    return true;
}

// ==========================
// INICIALIZAR MÁSCARAS E BUSCA
// ==========================

function inicializarMascaras() {
    // Inicializar CPF/CNPJ com máscara dupla
    const campoContratanteCPF = document.getElementById("contratanteCPF");
    const campoContratadoCPF = document.getElementById("contratadoCPF");
    const campoFiadorCPF = document.getElementById("cpfFiador");
    
    // Define tipo padrão como CPF
    if (campoContratanteCPF) campoContratanteCPF.dataset.tipo = 'cpf';
    if (campoContratadoCPF) campoContratadoCPF.dataset.tipo = 'cpf';
    if (campoFiadorCPF) campoFiadorCPF.dataset.tipo = 'cpf';
    
    // Adiciona listener que responde ao toggle
    [campoContratanteCPF, campoContratadoCPF, campoFiadorCPF].forEach(campo => {
        if (!campo) return;
        campo.addEventListener('input', function(e) {
            const tipo = this.dataset.tipo || 'cpf';
            if (tipo === 'cnpj') {
                this.value = formatarCNPJ(this.value);
            } else {
                this.value = formatarCPF(this.value);
            }
        });
    });
    
    // Rest das máscaras (CEP, Moeda) continuam igual
    const cepContratante = document.getElementById("contratanteCEP");
    aplicarMascaraCEP(cepContratante);
    buscarEnderecoPorCEP(
        cepContratante, 
        document.getElementById("contratanteRua"), 
        document.getElementById("contratanteBairro"), 
        document.getElementById("contratanteCidade"), 
        document.getElementById("contratanteEstado")
    );
    
    const cepContratado = document.getElementById("contratadoCEP");
    aplicarMascaraCEP(cepContratado);
    buscarEnderecoPorCEP(
        cepContratado, 
        document.getElementById("contratadoRua"), 
        document.getElementById("contratadoBairro"), 
        document.getElementById("contratadoCidade"), 
        document.getElementById("contratadoEstado")
    );
    
    aplicarMascaraMoeda(document.getElementById("valorServico"));
    aplicarMascaraMoeda(document.getElementById("valorAluguel"));
    aplicarMascaraMoeda(document.getElementById("valorEntrada"));
}


function aplicarMascaraCEP(input) {
    if (!input) return;
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");
        if (valor.length > 8) valor = valor.slice(0, 8);
        if (valor.length >= 5) valor = valor.replace(/^(\d{5})/, "$1-");
        input.value = valor;
    });
}

function aplicarMascaraMoeda(input) {
    if (!input) return;
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");
        if (valor.length === 0) { input.value = ""; return; }
        valor = (valor / 100).toFixed(2);
        valor = valor.replace(".", ",");
        const partes = valor.split(",");
        partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        input.value = "R$ " + partes.join(",");
    });
}

function buscarEnderecoPorCEP(cepInput, ruaInput, bairroInput, cidadeInput, estadoInput) {
    if (!cepInput) return;
    cepInput.addEventListener("blur", async () => {
        let cep = cepInput.value.replace(/\D/g, "");
        if (cep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                alert("CEP não encontrado");
                return;
            }
            if (ruaInput) ruaInput.value = data.logradouro || "";
            if (bairroInput) bairroInput.value = data.bairro || "";
            if (cidadeInput) cidadeInput.value = data.localidade || "";
            if (estadoInput) estadoInput.value = data.uf || "";
            
            salvarDadosLocal();
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    });
}

// ==========================
// EVENTOS DE INTERFACE E SALVAMENTO
// ==========================

function inicializarEventos() {
    const categoriaEl = document.getElementById("categoria");
    if(categoriaEl) categoriaEl.addEventListener("change", handleMudancaCategoria);
    
    const tipoPagamentoEl = document.getElementById("tipoPagamento");
    if(tipoPagamentoEl) tipoPagamentoEl.addEventListener("change", handleMudancaTipoPagamento);
    
    const tipoGarantiaEl = document.getElementById("tipoGarantia");
    if (tipoGarantiaEl) tipoGarantiaEl.addEventListener("change", handleMudancaTipoGarantia);
    
    ["valorServico", "tipoPagamento", "numeroParcelas", "valorEntrada", "dataPrimeiroVencimento"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", atualizarResumoPagamento);
            el.addEventListener("change", atualizarResumoPagamento);
            if (id === "numeroParcelas" || id === "dataPrimeiroVencimento") {
                el.addEventListener("input", atualizarDatasParcelasSugeridas);
                el.addEventListener("change", atualizarDatasParcelasSugeridas);
            }
        }
    });

    const todosInputs = document.querySelectorAll('input, select, textarea');
    todosInputs.forEach(input => {
        input.addEventListener('input', salvarDadosLocal);
        input.addEventListener('change', salvarDadosLocal);
    });
}

function handleMudancaCategoria() {
    const tipo = document.getElementById("categoria").value;
    const pagamentoPadrao = document.getElementById("pagamentoPadrao");
    const aluguelContainer = document.getElementById("aluguelContainer");
    const campoInicio = document.getElementById("campoDataInicio");
    const labelFim = document.getElementById("labelDataFim");
    
    const tituloParte1 = document.getElementById("tituloParte1");
    const tituloParte2 = document.getElementById("tituloParte2");
    
    if (pagamentoPadrao) pagamentoPadrao.style.display = "block";
    if (aluguelContainer) aluguelContainer.style.display = "none";
    if (campoInicio) campoInicio.style.display = "block";
    if (labelFim) labelFim.innerText = "Data de término";
    
    const containerBotoes = document.getElementById("containerBotoesAcao");
    const resultado = document.getElementById("resultado");
    if (containerBotoes) containerBotoes.style.display = "none";
    if (resultado) resultado.classList.add("hidden");

    if (tipo === "servico") {
        if (labelFim) labelFim.innerText = "Data de término do serviço";
        if (tituloParte1) tituloParte1.innerText = "Dados do Contratante";
        if (tituloParte2) tituloParte2.innerText = "Dados do Contratado";
        
    } else if (tipo === "venda") {
        if (campoInicio) campoInicio.style.display = "none";
        if (labelFim) labelFim.innerText = "Data de entrega do bem";
        if (tituloParte1) tituloParte1.innerText = "Dados do Comprador";
        if (tituloParte2) tituloParte2.innerText = "Dados do Vendedor";
        
    } else if (tipo === "aluguel") {
        if (pagamentoPadrao) pagamentoPadrao.style.display = "none";
        if (aluguelContainer) aluguelContainer.style.display = "block";
        if (labelFim) labelFim.innerText = "Data de término da locação";
        if (tituloParte1) tituloParte1.innerText = "Dados do Locatário";
        if (tituloParte2) tituloParte2.innerText = "Dados do Locador";
        
    } else {
        if (tituloParte1) tituloParte1.innerText = "Dados do Contratante";
        if (tituloParte2) tituloParte2.innerText = "Dados do Contratado";
    }
}

function handleMudancaTipoPagamento() {
    const tipo = document.getElementById("tipoPagamento")?.value || "";
    const parcelasContainer = document.getElementById("parcelasContainer");
    const entradaContainer = document.getElementById("entradaContainer");
    
    if (parcelasContainer) parcelasContainer.style.display = "none";
    if (entradaContainer) entradaContainer.style.display = "none";
    
    if (tipo === "parcelado") {
        if (parcelasContainer) parcelasContainer.style.display = "block";
    } else if (tipo === "entrada") {
        if (parcelasContainer) parcelasContainer.style.display = "block";
        if (entradaContainer) entradaContainer.style.display = "block";
    }
    
    atualizarResumoPagamento();
}

function handleMudancaTipoGarantia() {
    const tipo = document.getElementById("tipoGarantia")?.value || "";
    const caucaoContainer = document.getElementById("caucaoContainer");
    const fiadorContainer = document.getElementById("fiadorContainer");
    const seguroContainer = document.getElementById("seguroContainer");
    
    if (caucaoContainer) caucaoContainer.style.display = "none";
    if (fiadorContainer) fiadorContainer.style.display = "none";
    if (seguroContainer) seguroContainer.style.display = "none";
    
    if (tipo === "caucao" && caucaoContainer) caucaoContainer.style.display = "block";
    if (tipo === "fiador" && fiadorContainer) fiadorContainer.style.display = "block";
    if (tipo === "seguro" && seguroContainer) seguroContainer.style.display = "block";
}

function atualizarResumoPagamento() {
    const resumoEl = document.getElementById("resumoPagamento");
    if (!resumoEl) return;
    
    const valor = document.getElementById("valorServico")?.value || "R$ 0,00";
    const tipo = document.getElementById("tipoPagamento")?.value || "";
    const parcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const entrada = document.getElementById("valorEntrada")?.value || "R$ 0,00";
    
    const valorNum = parseFloat(valor.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
    const entradaNum = parseFloat(entrada.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
    
    if (tipo === "avista") {
        resumoEl.innerHTML = `Pagamento total: ${valor}`;
    } else if (tipo === "parcelado") {
        if (parcelas > 0) {
            const parcelaStr = (valorNum / parcelas).toFixed(2).replace(".", ",");
            resumoEl.innerHTML = `${parcelas}x de R$ ${parcelaStr} <span style="margin-left:10px; font-weight:bold; color:#16a34a;">(Total: ${valor})</span>`;
        } else {
            resumoEl.innerHTML = "";
        }
    } else if (tipo === "entrada") {
        if (parcelas > 0 && entradaNum > 0) {
            const restante = valorNum - entradaNum;
            if (restante < 0) {
                resumoEl.innerHTML = "⚠️ Entrada maior que o valor total";
            } else {
                const parcelaStr = (restante / parcelas).toFixed(2).replace(".", ",");
                resumoEl.innerHTML = `Entrada: ${entrada} + ${parcelas}x de R$ ${parcelaStr} <span style="margin-left:10px; font-weight:bold; color:#16a34a;">(Total: ${valor})</span>`;
            }
        } else {
            resumoEl.innerHTML = "Informe entrada e parcelas";
        }
    } else {
        resumoEl.innerHTML = "";
    }
}

function atualizarDatasParcelasSugeridas() {
    const dataPrimeira = document.getElementById("dataPrimeiroVencimento")?.value || "";
    const numeroParcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const resumoDiv = document.getElementById("resumoParcelasDiv");
    const resumoDatas = document.getElementById("resumoParcelasDatas");
    
    if (!dataPrimeira || numeroParcelas <= 0) {
        if (resumoDiv) resumoDiv.style.display = "none";
        return;
    }
    
    const datas = calcularDatasParcelas(dataPrimeira, numeroParcelas);
    
    if (datas.length > 0) {
        let html = "<ul style=\"margin: 0; padding-left: 20px;\">";
        datas.forEach((data, index) => {
            html += `<li>Parcela ${index + 1}: <strong>${data}</strong></li>`;
        });
        html += "</ul>";
        
        resumoDatas.innerHTML = html;
        if (resumoDiv) resumoDiv.style.display = "block";
    } else {
        if (resumoDiv) resumoDiv.style.display = "none";
    }
}

// ==========================
// LÓGICA DE LOCALSTORAGE
// ==========================

function salvarDadosLocal() {
    const dados = {
        categoria: document.getElementById("categoria")?.value || "",
        objeto: document.getElementById("objeto")?.value || "",
        
        contratanteNome: document.getElementById("contratanteNome")?.value || "",
        contratanteCPF: document.getElementById("contratanteCPF")?.value || "",
        contratanteEstadoCivil: document.getElementById("contratanteEstadoCivil")?.value || "",
        contratanteCEP: document.getElementById("contratanteCEP")?.value || "",
        contratanteRua: document.getElementById("contratanteRua")?.value || "",
        contratanteNumero: document.getElementById("contratanteNumero")?.value || "",
        contratanteBairro: document.getElementById("contratanteBairro")?.value || "",
        contratanteCidade: document.getElementById("contratanteCidade")?.value || "",
        contratanteEstado: document.getElementById("contratanteEstado")?.value || "",
        
        contratadoNome: document.getElementById("contratadoNome")?.value || "",
        contratadoCPF: document.getElementById("contratadoCPF")?.value || "",
        contratadoEstadoCivil: document.getElementById("contratadoEstadoCivil")?.value || "",
        contratadoCEP: document.getElementById("contratadoCEP")?.value || "",
        contratadoRua: document.getElementById("contratadoRua")?.value || "",
        contratadoNumero: document.getElementById("contratadoNumero")?.value || "",
        contratadoBairro: document.getElementById("contratadoBairro")?.value || "",
        contratadoCidade: document.getElementById("contratadoCidade")?.value || "",
        contratadoEstado: document.getElementById("contratadoEstado")?.value || "",
        
        cidadeForo: document.getElementById("cidadeForo")?.value || "",
        clausulasAdicionais: document.getElementById("clausulasAdicionais")?.value || ""
    };
    
    localStorage.setItem('vibecoding_contrato_dados', JSON.stringify(dados));
}

function carregarDadosLocal() {
    const dadosSalvos = localStorage.getItem('vibecoding_contrato_dados');
    if (!dadosSalvos) return;
    
    try {
        const dados = JSON.parse(dadosSalvos);
        
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val) el.value = val;
        };

        setVal("categoria", dados.categoria);
        setVal("objeto", dados.objeto);
        
        setVal("contratanteNome", dados.contratanteNome);
        setVal("contratanteCPF", dados.contratanteCPF);
        setVal("contratanteEstadoCivil", dados.contratanteEstadoCivil);
        setVal("contratanteCEP", dados.contratanteCEP);
        setVal("contratanteRua", dados.contratanteRua);
        setVal("contratanteNumero", dados.contratanteNumero);
        setVal("contratanteBairro", dados.contratanteBairro);
        setVal("contratanteCidade", dados.contratanteCidade);
        setVal("contratanteEstado", dados.contratanteEstado);
        
        setVal("contratadoNome", dados.contratadoNome);
        setVal("contratadoCPF", dados.contratadoCPF);
        setVal("contratadoEstadoCivil", dados.contratadoEstadoCivil);
        setVal("contratadoCEP", dados.contratadoCEP);
        setVal("contratadoRua", dados.contratadoRua);
        setVal("contratadoNumero", dados.contratadoNumero);
        setVal("contratadoBairro", dados.contratadoBairro);
        setVal("contratadoCidade", dados.contratadoCidade);
        setVal("contratadoEstado", dados.contratadoEstado);
        
        setVal("cidadeForo", dados.cidadeForo);
        setVal("clausulasAdicionais", dados.clausulasAdicionais);
        
        if (dados.categoria) {
            const cat = document.getElementById("categoria");
            if (cat) cat.dispatchEvent(new Event("change"));
        }
        
    } catch (e) {
        console.error("Erro ao carregar dados do LocalStorage:", e);
    }
}

// ==========================
// FUNÇÕES DE DATA E PARCELAS
// ==========================

function formatarDataBR(data) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length !== 3) return data;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function calcularDatasParcelas(dataInicial, quantidade) {
    if (!dataInicial) return [];
    const datas = [];
    const partes = dataInicial.split('-');
    const anoInicial = parseInt(partes[0]);
    const mesInicial = parseInt(partes[1]) - 1; 
    const diaInicial = parseInt(partes[2]);

    for (let i = 0; i < quantidade; i++) {
        let data = new Date(anoInicial, mesInicial + i, diaInicial);
        if (data.getMonth() !== ((mesInicial + i) % 12)) {
            data.setDate(0); 
        }
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        datas.push(`${dia}/${mes}/${data.getFullYear()}`);
    }
    return datas;
}


// Função para gerar CPF válido
function gerarCPFValido() {
    let cpf = [];
    for (let i = 0; i < 9; i++) {
        cpf.push(Math.floor(Math.random() * 10));
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += cpf[i] * (10 - i);
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    cpf.push(digito1);

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += cpf[i] * (11 - i);
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    cpf.push(digito2);

    return cpf.slice(0, 3).join('') + '.' + cpf.slice(3, 6).join('') + '.' + cpf.slice(6, 9).join('') + '-' + cpf.slice(9, 11).join('');
}

// Função para gerar CNPJ válido
function gerarCNPJValido() {
    let cnpj = [];
    for (let i = 0; i < 12; i++) {
        cnpj.push(Math.floor(Math.random() * 10));
    }

    let pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 12; i++) {
        soma += cnpj[i] * pesos1[i];
    }
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    cnpj.push(digito1);

    let pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    soma = 0;
    for (let i = 0; i < 13; i++) {
        soma += cnpj[i] * pesos2[i];
    }
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    cnpj.push(digito2);

    return cnpj.slice(0, 2).join('') + '.' + cnpj.slice(2, 5).join('') + '.' + cnpj.slice(5, 8).join('') + '/' + cnpj.slice(8, 12).join('') + '-' + cnpj.slice(12, 14).join('');
}

// ==========================
// PREENCHIMENTO DE TESTE
// ==========================

function preencherTeste() {
    const cat = document.getElementById("categoria");
    if (cat) { 
        cat.value = "servico"; 
        cat.dispatchEvent(new Event("change")); 
    }
    
    const obj = document.getElementById("objeto");
    if (obj) obj.value = "Prestação de serviços de manutenção de sistema e infraestrutura de TI";
    
    document.getElementById("contratanteNome").value = "João da Silva";
    const cCpf = document.getElementById("contratanteCPF");
    if (cCpf) { 
        cCpf.value = gerarCPFValido(); 
        cCpf.dispatchEvent(new Event("input")); 
    }
    document.getElementById("contratanteEstadoCivil").value = "Solteiro(a)";
    const cepContratante = document.getElementById("contratanteCEP");
    if (cepContratante) {
        cepContratante.value = "01001000"; 
        cepContratante.dispatchEvent(new Event("input"));
        setTimeout(() => cepContratante.dispatchEvent(new Event("blur")), 200);
    }
    document.getElementById("contratanteNumero").value = "105";

    document.getElementById("contratadoNome").value = "Maria Oliveira";
    const dCpf = document.getElementById("contratadoCPF");
    if (dCpf) { 
        dCpf.value = gerarCPFValido(); 
        dCpf.dispatchEvent(new Event("input")); 
    }
    document.getElementById("contratadoEstadoCivil").value = "Casado(a)";
    const cepContratado = document.getElementById("contratadoCEP");
    if (cepContratado) {
        cepContratado.value = "01310930"; 
        cepContratado.dispatchEvent(new Event("input"));
        setTimeout(() => cepContratado.dispatchEvent(new Event("blur")), 200);
    }
    document.getElementById("contratadoNumero").value = "230";

    const vs = document.getElementById("valorServico");
    if (vs) { 
        vs.value = "250000"; 
        vs.dispatchEvent(new Event("input")); 
    }
    const pgto = document.getElementById("tipoPagamento");
    if (pgto) { 
        pgto.value = "parcelado"; 
        pgto.dispatchEvent(new Event("change")); 
    }
    document.getElementById("numeroParcelas").value = "3";
    document.getElementById("dataPrimeiroVencimento").value = "2026-05-10";
    document.getElementById("meioPagamento").value = "PIX";
    
    document.getElementById("dataInicio").value = "2026-04-01";
    document.getElementById("dataFim").value = "2026-06-01";
    document.getElementById("cidadeForo").value = "São Paulo/SP";
    
    salvarDadosLocal();
    
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 300);
}

// ==========================
// GERAR CONTRATO (FUNÇÃO PRINCIPAL - CORRIGIDA)
// ==========================

function gerarContrato() {
    const categoria = document.getElementById("categoria")?.value;
    const objeto = document.getElementById("objeto")?.value;
    const foro = document.getElementById("cidadeForo")?.value || "comarca do domicílio do Contratante";
    
    if (!categoria) { alert("Selecione o tipo de contrato!"); return; }
    if (!objeto) { alert("Preencha o objeto do contrato!"); return; }
    
    let termo1 = "CONTRATANTE";
    let termo2 = "CONTRATADO";
    let termo1Exibicao = "Contratante";
    let termo2Exibicao = "Contratado";
    
    if (categoria === "venda") {
        termo1 = "COMPRADOR";
        termo2 = "VENDEDOR";
        termo1Exibicao = "Comprador";
        termo2Exibicao = "Vendedor";
    } else if (categoria === "aluguel") {
        termo1 = "LOCATÁRIO";
        termo2 = "LOCADOR";
        termo1Exibicao = "Locatário";
        termo2Exibicao = "Locador";
    }
    
const cpfContratante = document.getElementById("contratanteCPF")?.value || "";
const cpfContratado = document.getElementById("contratadoCPF")?.value || "";
const tipoContratante = document.getElementById("contratanteCPF")?.dataset.tipo || "cpf";
const tipoContratado = document.getElementById("contratadoCPF")?.dataset.tipo || "cpf";

// Valida CPF ou CNPJ dependendo do tipo
if (tipoContratante === "cnpj") {
    if (!validarCNPJ(cpfContratante)) { 
        alert(`CNPJ do ${termo1Exibicao} é inválido! Verifique a digitação.`); 
        return; 
    }
} else {
    if (!validarCPF(cpfContratante)) { 
        alert(`CPF do ${termo1Exibicao} é inválido! Verifique a digitação.`); 
        return; 
    }
}

if (tipoContratado === "cnpj") {
    if (!validarCNPJ(cpfContratado)) { 
        alert(`CNPJ do ${termo2Exibicao} é inválido! Verifique a digitação.`); 
        return; 
    }
} else {
    if (!validarCPF(cpfContratado)) { 
        alert(`CPF do ${termo2Exibicao} é inválido! Verifique a digitação.`); 
        return; 
    }
}

    const dataInicio = document.getElementById("dataInicio")?.value || "";
    const dataFim = document.getElementById("dataFim")?.value || "";
    
    if (categoria === "servico" || categoria === "aluguel") {
        if (!dataInicio) { alert("Informe a data de início!"); return; }
        if (!dataFim) { alert("Informe a data de término!"); return; }
        if (dataInicio > dataFim) { alert("A data de início não pode ser maior que a final!"); return; }
    } else if (categoria === "venda") {
        if (!dataFim) { alert("Informe a data de entrega do bem!"); return; }
    }

    const cNome = document.getElementById("contratanteNome")?.value || "";
    const cEst = document.getElementById("contratanteEstadoCivil")?.value || "";
    const cRua = document.getElementById("contratanteRua")?.value || "";
    const cNum = document.getElementById("contratanteNumero")?.value || "";
    const cCid = document.getElementById("contratanteCidade")?.value || "";
    const cUF = document.getElementById("contratanteEstado")?.value || "";
    
    const dNome = document.getElementById("contratadoNome")?.value || "";
    const dEst = document.getElementById("contratadoEstadoCivil")?.value || "";
    const dRua = document.getElementById("contratadoRua")?.value || "";
    const dNum = document.getElementById("contratadoNumero")?.value || "";
    const dCid = document.getElementById("contratadoCidade")?.value || "";
    const dUF = document.getElementById("contratadoEstado")?.value || "";

    // Pega o valor das cláusulas adicionais
    const clausulasAdicionais = document.getElementById("clausulasAdicionais")?.value || "";

    // MONTANDO O CONTRATO (ESTRUTURA CORRIGIDA)
    const estrutura = `
    <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333;">
        
        <h1 style="text-align: center; font-size: 18px; margin-bottom: 30px; text-transform: uppercase;">CONTRATO</h1>
        
        <p><strong>Partes:</strong></p>
        <p><strong>${termo1.toUpperCase()}:</strong> ${cNome}, ${cEst}, inscrito(a) no CPF sob o nº <strong>${cpfContratante}</strong>, residente e domiciliado(a) na rua <strong>${cRua}</strong>, nº <strong>${cNum}</strong>, na cidade de <strong>${cCid}</strong>, estado de <strong>${cUF}</strong>.</p>
        <p><strong>${termo2.toUpperCase()}:</strong> ${dNome}, ${dEst}, inscrito(a) no CPF sob o nº <strong>${cpfContratado}</strong>, residente e domiciliado(a) na rua <strong>${dRua}</strong>, nº <strong>${dNum}</strong>, na cidade de <strong>${dCid}</strong>, estado de <strong>${dUF}</strong>.</p>
        
        <br><p><strong>CLÁUSULA PRIMEIRA — DO OBJETO</strong></p>
        <p>${objeto}</p>
        
        <br><p><strong>CLÁUSULA SEGUNDA — DO PRAZO</strong></p>
        ${gerarClausulaPrazo(categoria, dataInicio, dataFim)}
        
        <br><p><strong>CLÁUSULA TERCEIRA — DO VALOR E FORMA DE PAGAMENTO</strong></p>
        ${gerarClausulaValor(categoria)}
        
        <br><p><strong>CLÁUSULA QUARTA — DA INADIMPLÊNCIA</strong></p>
        ${gerarClausulaInadimplencia()}
        
        ${categoria === "aluguel" ? `
        <br><p><strong>CLÁUSULA QUINTA — DA GARANTIA</strong></p>
        ${gerarClausulaGarantia()}
        ` : ''}
        


        ${clausulasAdicionais && clausulasAdicionais.trim() !== "" ? `
        <br><p><strong>CLÁUSULA QUINTA — CLÁUSULAS ADICIONAIS</strong></p>
        <p style="text-align: justify; line-height: 1.6;">
            ${clausulasAdicionais.split('\n').join('<br>')}
        </p>

        <br><p><strong>CLÁUSULA SEXTA — DO FORO</strong></p>
        <p>As partes elegem o foro da <strong>${foro}</strong> para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.</p>
        ` : `
        <br><p><strong>CLÁUSULA QUINTA — DO FORO</strong></p>
        <p>As partes elegem o foro da <strong>${foro}</strong> para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.</p>
        `}

        <br><br>
        <p>E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma, juntamente com 02 (duas) testemunhas.</p>
        
        <!-- BLOCO DE ASSINATURAS USANDO TABELA (BLINDADO PARA IMPRESSÃO) -->
        <table style="width: 100%; margin-top: 50px; border-collapse: collapse; page-break-inside: avoid; border: none;">
            <tr>
                <!-- COLUNA ESQUERDA: CONTRATANTE -->
                <td style="width: 45%; vertical-align: top; text-align: center; border: none; padding: 0;">
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 5px;"></div>
                    <strong>Contratante</strong><br>
                    <span style="font-size: 14px;">${document.getElementById("nomeContratante")?.value || ""}</span>
                </td>
                
                <!-- ESPAÇO CENTRAL -->
                <td style="width: 10%; border: none; padding: 0;"></td>
                
                <!-- COLUNA DIREITA: CONTRATADO -->
                <td style="width: 45%; vertical-align: top; text-align: center; border: none; padding: 0;">
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 5px;"></div>
                    <strong>Contratado</strong><br>
                    <span style="font-size: 14px;">${document.getElementById("nomeContratado")?.value || ""}</span>
                </td>
            </tr>
            
            <!-- LINHA INVISÍVEL PARA DAR ESPAÇO ENTRE AS ASSINATURAS -->
            <tr>
                <td colspan="3" style="height: 60px; border: none; padding: 0;"></td>
            </tr>
            
            <!-- BLOCO DO FIADOR (SE APLICÁVEL) -->
            ${gerarBlocoFiador()}
            
            <tr>
            <!-- COLUNA ESQUERDA: TESTEMUNHA 1 -->
            <td style="width: 45%; vertical-align: top; text-align: center; border: none; padding: 0;">
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 5px;"></div>
                    <strong>TESTEMUNHA 1</strong>
                    <div style="text-align: left; line-height: 1.5; font-size: 14px; margin-top: 10px;">
                        Nome: <br>
                        CPF: 
                    </div>
                </td>
                
                <!-- ESPAÇO CENTRAL -->
                <td style="width: 10%; border: none; padding: 0;"></td>
                
                <!-- COLUNA DIREITA: TESTEMUNHA 2 -->
                <td style="width: 45%; vertical-align: top; text-align: center; border: none; padding: 0;">
                    <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 5px;"></div>
                    <strong>TESTEMUNHA 2</strong>
                    <div style="text-align: left; line-height: 1.5; font-size: 14px; margin-top: 10px;">
                        Nome: <br>
                        CPF: 
                    </div>
                </td>
            </tr>
        </table>

    </div>`;
    // FIM DA TEMPLATE STRING

    // Exibe o contrato
    const resultado = document.getElementById("resultado");
    if (resultado) {
        resultado.innerHTML = estrutura;
        resultado.classList.remove("hidden");
    }

    // Mostra os botões de ação com ESPAÇAMENTO E RESPONSIVIDADE
    const containerBotoes = document.getElementById("containerBotoesAcao");
    if (containerBotoes) {
        containerBotoes.style.display = "flex";
        containerBotoes.style.gap = "15px";
        containerBotoes.style.flexWrap = "wrap";
        containerBotoes.style.justifyContent = "center";
        containerBotoes.style.marginTop = "30px";
    }

    // Scroll para o contrato
    setTimeout(() => {
        window.scrollTo({ top: resultado.offsetTop - 50, behavior: 'smooth' });
    }, 100);
}

function gerarClausulaValor(categoria) {
    const valor = document.getElementById("valorServico")?.value || "";
    const tipo = document.getElementById("tipoPagamento")?.value || "";
    const parcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const entrada = document.getElementById("valorEntrada")?.value || "";
    const meio = document.getElementById("meioPagamento")?.value || "não especificado";
    const dataPrimeira = document.getElementById("dataPrimeiroVencimento")?.value || "";

    if (!valor) {
        return `<p>O valor e forma de pagamento serão acordados entre as partes.</p>`;
    }

    let clausulaValor = `<p>O presente contrato é celebrado em um valor de <strong>${valor}</strong>.</p>`;

    if (tipo === "avista") {
        clausulaValor += `<p>O pagamento deverá ser realizado à vista, em uma única parcela, via <strong>${meio}</strong>.</p>`;
    } else if (tipo === "parcelado") {
        if (parcelas > 0 && dataPrimeira) {
            const datas = calcularDatasParcelas(dataPrimeira, parcelas);
            const valorNum = parseFloat(valor.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
            const parcelaStr = (valorNum / parcelas).toFixed(2).replace(".", ",");
            
            clausulaValor += `<p>O pagamento deverá ser realizado em <strong>${parcelas} parcelas iguais de R$ ${parcelaStr}</strong>, via <strong>${meio}</strong>, conforme cronograma abaixo:</p>`;
            clausulaValor += `<ul style="margin: 10px 0; padding-left: 20px;">`;
            
            datas.forEach((data, index) => {
                clausulaValor += `<li>Parcela ${index + 1}: ${data} - R$ ${parcelaStr}</li>`;
            });
            
            clausulaValor += `</ul>`;
            clausulaValor += `<p><strong>Total: ${valor}</strong></p>`;
        } else {
            clausulaValor += `<p>O pagamento deverá ser realizado parcelado, via <strong>${meio}</strong>.</p>`;
        }
    } else if (tipo === "entrada") {
        if (parcelas > 0 && entrada && dataPrimeira) {
            const valorNum = parseFloat(valor.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
            const entradaNum = parseFloat(entrada.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
            const restante = valorNum - entradaNum;
            const parcelaStr = (restante / parcelas).toFixed(2).replace(".", ",");
            const datas = calcularDatasParcelas(dataPrimeira, parcelas);
            
            clausulaValor += `<p>O pagamento deverá ser realizado em entrada de <strong>${entrada}</strong> seguida de <strong>${parcelas} parcelas de R$ ${parcelaStr}</strong>, via <strong>${meio}</strong>, conforme cronograma abaixo:</p>`;
            clausulaValor += `<ul style="margin: 10px 0; padding-left: 20px;">`;
            
            datas.forEach((data, index) => {
                clausulaValor += `<li>Parcela ${index + 1}: ${data} - R$ ${parcelaStr}</li>`;
            });
            
            clausulaValor += `</ul>`;
            clausulaValor += `<p><strong>Total: ${valor}</strong></p>`;
        } else {
            clausulaValor += `<p>O pagamento deverá ser realizado em entrada seguida de parcelas, via <strong>${meio}</strong>.</p>`;
        }
    }

    return clausulaValor;
}

function gerarClausulaPrazo(categoria, dataInicio, dataFim) {
    const inicioStr = formatarDataBR(dataInicio);
    const fimStr = formatarDataBR(dataFim);
    
    if (categoria === "servico") {
        return `<p>O presente contrato terá sua vigência iniciando-se em <strong>${inicioStr}</strong>, com término previsto para <strong>${fimStr}</strong>. O contrato poderá ser prorrogado mediante Termo Aditivo assinado por ambas as partes.</p>`;
    }
    if (categoria === "venda") {
        return `<p>A posse e a transferência definitiva da propriedade do bem objeto deste contrato ocorrerão na data de entrega estipulada para <strong>${fimStr}</strong>.</p>`;
    }
    if (categoria === "aluguel") {
        return `<p>A locação vigerá por prazo determinado, com início em <strong>${inicioStr}</strong> e término em <strong>${fimStr}</strong>. Findo o prazo, se o LOCATÁRIO continuar na posse do imóvel por mais de trinta dias sem oposição, presumir-se-á prorrogada a locação por prazo indeterminado.</p>`;
    }
    return "";
}

function gerarClausulaInadimplencia() {
    return `
    <p>O não pagamento na data aprazada caracterizará mora de pleno direito, sujeitando a parte inadimplente à <strong>multa penal de 2% (dois por cento)</strong> sobre o débito, além de <strong>juros de mora de 1% (um por cento) ao mês</strong> e atualização monetária pelo IGPM/FGV até a efetiva quitação.</p>
    <p>Sendo necessária a cobrança judicial ou extrajudicial, incidirão honorários advocatícios fixados em 20% (vinte por cento) sobre o valor total do débito atualizado.</p>`;
}

function gerarClausulaGarantia() {
    const tipo = document.getElementById("tipoGarantia")?.value || "";
    if (tipo === "caucao") {
        const meses = document.getElementById("mesesCaucao")?.value || "1";
        return `<p>Em garantia do cumprimento das obrigações assumidas, o LOCATÁRIO entrega a título de caução a quantia equivalente a <strong>${meses} meses de aluguel</strong>, que será restituída ao final do contrato caso não haja débitos pendentes.</p>`;
    }
    if (tipo === "fiador") {
        const nomeF = document.getElementById("nomeFiador")?.value || "";
        const cpfF = document.getElementById("cpfFiador")?.value || "";
        return `<p>Assina o presente instrumento, na qualidade de FIADOR e principal pagador, o Sr(a). <strong>${nomeF}</strong>, inscrito no CPF sob o nº ${cpfF}, assumindo responsabilidade solidária por todas as obrigações locatícias.</p>`;
    }
    if (tipo === "seguro") {
        const seg = document.getElementById("seguradora")?.value || "";
        return `<p>Para a garantia das obrigações pactuadas, o LOCATÁRIO apresenta Apólice de Seguro Fiança Locatícia contratada junto à Seguradora <strong>${seg}</strong>.</p>`;
    }
    return `<p>O presente contrato é celebrado desprovido de qualquer modalidade de garantia locatícia (Art. 37 da Lei 8.245/91).</p>`;
}

// INSERIR APÓS a função gerarClausulaGarantia() (linha ~1100 aproximadamente)

function gerarBlocoFiador() {
    const tipoGarantia = document.getElementById("tipoGarantia")?.value || "";
    
    // Se não é aluguel com fiador, retorna string vazia
    if (tipoGarantia !== "fiador") {
        return "";
    }
    
    const nomeFiador = document.getElementById("nomeFiador")?.value || "";
    const cpfFiador = document.getElementById("cpfFiador")?.value || "";
    
    // Se não tem dados do fiador, retorna vazio
    if (!nomeFiador || !cpfFiador) {
        return "";
    }
    
    // Retorna apenas o HTML da LINHA do fiador na tabela
    return `
        <tr>
            <td colspan="3" style="height: 30px; border: none; padding: 0;"></td>
        </tr>
        
        <tr>
            <td colspan="3" style="width: 100%; vertical-align: top; text-align: center; border: none; padding: 0;">
                <div style="border-bottom: 1px solid #000; width: 100%; margin-bottom: 5px;"></div>
                <strong>FIADOR</strong>
                <div style="text-align: center; line-height: 1.5; font-size: 14px; margin-top: 10px;">
                    <strong>${nomeFiador}</strong><br>
                    CPF: ${cpfFiador}
                </div>
            </td>
        </tr>
    `;
}



function copiarContrato() {
    const t = document.getElementById("resultado")?.innerText || "";
    if (!t) return alert("Nada para copiar.");
    navigator.clipboard.writeText(t).then(() => alert("✅ Contrato copiado!")).catch(() => alert("❌ Erro ao copiar."));
}

// ==========================
// LIMPAR DADOS
// ==========================

function limparDados() {
    if (!confirm("Tem certeza que deseja apagar todos os dados preenchidos?")) {
        return;
    }

    localStorage.removeItem('vibecoding_contrato_dados');

    const campos = document.querySelectorAll('input, textarea, select');
    campos.forEach(campo => {
        campo.value = '';
    });

    const resultado = document.getElementById("resultado");
    if (resultado) resultado.classList.add("hidden");
    
    const containerBotoes = document.getElementById("containerBotoesAcao");
    if (containerBotoes) containerBotoes.style.display = "none";

    handleMudancaCategoria();
    atualizarResumoPagamento();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================
// IMPRIMIR / PDF E WHATSAPP
// ==========================

function imprimirContrato() {
    window.print();
}

function enviarWhatsApp() {
    const texto = document.getElementById("resultado")?.innerText || "";
    if (!texto) { 
        alert("Nada para enviarmos. Gere um contrato primeiro."); 
        return; 
    }
    
    const ehCelular = /iPhone|iPad|iPod|Android|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (ehCelular) {
        alert(
            '✅ Preparando para enviar via WhatsApp...\n\n' +
            '1️⃣ A janela de salvamento será aberta\n' +
            '2️⃣ Salve o PDF na pasta Downloads do seu celular\n' +
            '3️⃣ O WhatsApp será aberto\n' +
            '4️⃣ Selecione um contato ou grupo\n' +
            '5️⃣ Clique no botão + (anexar)\n' +
            '6️⃣ Selecione Documentos\n' +
            '7️⃣ Abra a pasta Downloads\n' +
            '8️⃣ Procure pelo arquivo Contrato que salvou\n' +
            '9️⃣ Anexe e envie\n\n' +
            'Aguarde alguns segundos...'
        );
        
        imprimirContrato();
        
        setTimeout(() => {
            const mensagem = encodeURIComponent(
                'Olá! Estou enviando o contrato em anexo.\n\n' +
                'Por favor, revise e me avise se está tudo certo para assinarmos.\n' +
                'Qualquer dúvida estou à disposição! 👍'
            );
            
            window.location.href = `https://wa.me/?text=${mensagem}`;
        }, 3000);
        
    } else {
        alert(
            '✅ Preparando para enviar via WhatsApp...\n\n' +
            '1️⃣ A janela de salvamento será aberta\n' +
            '2️⃣ Salve o PDF na pasta Downloads do seu computador\n' +
            '3️⃣ O WhatsApp Web será aberto\n' +
            '4️⃣ Clique no botão + (anexar)\n' +
            '5️⃣ Selecione Documentos\n' +
            '6️⃣ Abra a pasta Downloads\n' +
            '7️⃣ Procure pelo arquivo Contrato que salvou\n' +
            '8️⃣ Clique para anexar e envie\n\n' +
            'Aguarde alguns segundos...'
        );
        
        imprimirContrato();
        
        setTimeout(() => {
            const mensagem = encodeURIComponent(
                'Olá! Estou enviando o contrato em anexo.\n\n' +
                'Por favor, revise e me avise se está tudo certo para assinarmos.\n' +
                'Qualquer dúvida estou à disposição! 👍'
            );
            
            window.open(`https://wa.me/?text=${mensagem}`, '_blank');
        }, 3000);
    }
}

// --- FUNÇÕES DO TOGGLE SWITCH (CPF/CNPJ) ---

function alternarContratante() {
    const toggle = document.getElementById('toggleContratante').checked;
    const labelCPF = document.getElementById('labelContratanteCPF');
    const labelNome = document.getElementById('labelContratanteNome');
    const inputField = document.getElementById('contratanteCPF');
    const campoNome = document.getElementById('contratanteNome');
    const campoEstadoCivil = document.getElementById('contratanteEstadoCivil');
    const containerEstadoCivil = document.getElementById('containerEstadoCivilContratante');
    
    if (toggle) {
        // ===== PESSOA JURÍDICA (CNPJ) =====
        labelCPF.textContent = 'CNPJ:';
        if (labelNome) labelNome.textContent = 'Razão Social:';
        if (campoNome) campoNome.placeholder = 'Empresa LTDA';
        if (containerEstadoCivil) containerEstadoCivil.style.display = 'none';
        inputField.placeholder = '00.000.000/0000-00';
        inputField.value = '';
        inputField.dataset.tipo = 'cnpj';
        if (campoNome) campoNome.value = '';
        if (campoEstadoCivil) campoEstadoCivil.value = '';
    } else {
        // ===== PESSOA FÍSICA (CPF) =====
        labelCPF.textContent = 'CPF:';
        if (labelNome) labelNome.textContent = 'Nome:';
        if (campoNome) campoNome.placeholder = 'João da Silva';
        if (containerEstadoCivil) containerEstadoCivil.style.display = 'block';
        inputField.placeholder = '000.000.000-00';
        inputField.value = '';
        inputField.dataset.tipo = 'cpf';
        if (campoNome) campoNome.value = '';
        if (campoEstadoCivil) campoEstadoCivil.value = '';
    }
}

function alternarContratado() {
    const toggle = document.getElementById('toggleContratado').checked;
    const labelCPF = document.getElementById('labelContratadoCPF');
    const labelNome = document.getElementById('labelContratadoNome');
    const inputField = document.getElementById('contratadoCPF');
    const campoNome = document.getElementById('contratadoNome');
    const campoEstadoCivil = document.getElementById('contratadoEstadoCivil');
    const containerEstadoCivil = document.getElementById('containerEstadoCivilContratado');
    
    if (toggle) {
        // ===== PESSOA JURÍDICA (CNPJ) =====
        labelCPF.textContent = 'CNPJ:';
        if (labelNome) labelNome.textContent = 'Razão Social:';
        if (campoNome) campoNome.placeholder = 'Empresa LTDA';
        if (containerEstadoCivil) containerEstadoCivil.style.display = 'none';
        inputField.placeholder = '00.000.000/0000-00';
        inputField.value = '';
        inputField.dataset.tipo = 'cnpj';
        if (campoNome) campoNome.value = '';
        if (campoEstadoCivil) campoEstadoCivil.value = '';
    } else {
        // ===== PESSOA FÍSICA (CPF) =====
        labelCPF.textContent = 'CPF:';
        if (labelNome) labelNome.textContent = 'Nome:';
        if (campoNome) campoNome.placeholder = 'João da Silva';
        if (containerEstadoCivil) containerEstadoCivil.style.display = 'block';
        inputField.placeholder = '000.000.000-00';
        inputField.value = '';
        inputField.dataset.tipo = 'cpf';
        if (campoNome) campoNome.value = '';
        if (campoEstadoCivil) campoEstadoCivil.value = '';
    }
}

// Função auxiliar para formatar CPF automaticamente enquanto digita
function formatarCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.slice(0, 11);
    
    if (valor.length > 8) {
        return valor.slice(0, 3) + '.' + valor.slice(3, 6) + '.' + valor.slice(6, 9) + '-' + valor.slice(9, 11);
    } else if (valor.length > 5) {
        return valor.slice(0, 3) + '.' + valor.slice(3, 6) + '.' + valor.slice(6);
    } else if (valor.length > 2) {
        return valor.slice(0, 3) + '.' + valor.slice(3);
    }
    return valor;
}

function formatarCNPJ(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.slice(0, 14);
    
    if (valor.length > 11) {
        return valor.slice(0, 2) + '.' + valor.slice(2, 5) + '.' + valor.slice(5, 8) + '/' + valor.slice(8, 12) + '-' + valor.slice(12, 14);
    } else if (valor.length > 8) {
        return valor.slice(0, 2) + '.' + valor.slice(2, 5) + '.' + valor.slice(5, 8) + '/' + valor.slice(8);
    } else if (valor.length > 5) {
        return valor.slice(0, 2) + '.' + valor.slice(2, 5) + '.' + valor.slice(5);
    } else if (valor.length > 2) {
        return valor.slice(0, 2) + '.' + valor.slice(2);
    }
    return valor;
}


