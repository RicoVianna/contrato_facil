// ==========================
// INICIALIZAÇÃO DO APP
// ==========================

document.addEventListener('DOMContentLoaded', () => {
    inicializarMascaras();
    inicializarEventos();
    carregarDadosLocal(); // <-- Puxa os dados salvos ao abrir o app
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
    
    // Verifica se todos os números são iguais (ex: 111.111.111-11)
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
// INICIALIZAR MÁSCARAS E BUSCA
// ==========================

function inicializarMascaras() {
    aplicarMascaraCPF(document.getElementById("contratanteCPF"));
    aplicarMascaraCPF(document.getElementById("contratadoCPF"));
    aplicarMascaraCPF(document.getElementById("cpfFiador"));
    
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

function aplicarMascaraCPF(input) {
    if (!input) return;
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");
        if (valor.length > 11) valor = valor.slice(0, 11);
        if (valor.length >= 3) valor = valor.replace(/^(\d{3})/, "$1.");
        if (valor.length >= 7) valor = valor.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
        if (valor.length >= 11) valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
        input.value = valor;
    });
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
            
            salvarDadosLocal(); // Salva automaticamente ao puxar o CEP
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
        }
    });
    
    // --> MÁGICA DO SALVAMENTO AUTOMÁTICO <--
    // Escuta qualquer mudança em qualquer campo e salva
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
    
    const btnCopiar = document.getElementById("btnCopiar");
    const resultado = document.getElementById("resultado");
    if (btnCopiar) btnCopiar.style.display = "none";
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

// ==========================
// LÓGICA DE LOCALSTORAGE (SALVAR DADOS AUTOMÁTICOS)
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
        
        cidadeForo: document.getElementById("cidadeForo")?.value || ""
    };
    
    // Salva no navegador do usuário
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
        
        // Dispara a mudança visual se a categoria estiver salva
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
        cCpf.value = "12345678909"; 
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
        dCpf.value = "01234567890"; 
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
    
    salvarDadosLocal(); // Salva automaticamente ao rodar o teste
    
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 300);
}

// ==========================
// GERAÇÃO DO CONTRATO
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
    
    if (!validarCPF(cpfContratante)) { 
        alert(`CPF do ${termo1Exibicao} é inválido! Verifique a digitação.`); 
        return; 
    }
    if (!validarCPF(cpfContratado)) { 
        alert(`CPF do ${termo2Exibicao} é inválido! Verifique a digitação.`); 
        return; 
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

    const estrutura = `
        <div style="line-height:1.6; font-family:Arial; text-align: justify;">
        <h2 style="text-align:center; margin-bottom:30px; text-transform: uppercase;">
        ${categoria === "servico" ? "CONTRATO DE PRESTAÇÃO DE SERVIÇOS" : categoria === "venda" ? "CONTRATO DE COMPRA E VENDA" : "CONTRATO DE LOCAÇÃO"}
        </h2>
        
        <p>Pelo presente instrumento, as partes abaixo qualificadas celebram este contrato, que se regerá pelas seguintes cláusulas e pela legislação aplicável:</p>

        <p><strong>${termo1}:</strong><br>
        <strong>${cNome}</strong>, inscrito(a) no CPF sob o nº ${cpfContratante}, estado civil: ${cEst}, residente e domiciliado(a) na ${cRua}${cNum ? ", " + cNum : ""} - ${cCid}/${cUF}.</p>
        
        <p><strong>${termo2}:</strong><br>
        <strong>${dNome}</strong>, inscrito(a) no CPF sob o nº ${cpfContratado}, estado civil: ${dEst}, residente e domiciliado(a) na ${dRua}${dNum ? ", " + dNum : ""} - ${dCid}/${dUF}.</p>
        
        <br><p><strong>CLÁUSULA PRIMEIRA — DO OBJETO</strong></p>
        <p>O presente contrato tem como objeto ${objeto}, executado e entregue conforme as especificações e padrões de qualidade exigidos para a sua natureza.</p>
        
        <br><p><strong>CLÁUSULA SEGUNDA — DO PREÇO E CONDIÇÕES DE PAGAMENTO</strong></p>
        ${gerarTextoPagamento()}
        
        <br><p><strong>CLÁUSULA TERCEIRA — DO PRAZO E DA EXECUÇÃO</strong></p>
        ${gerarClausulaPrazo(categoria, dataInicio, dataFim)}
        
        <br><p><strong>CLÁUSULA QUARTA — DA INADIMPLÊNCIA E DAS PENALIDADES</strong></p>
        ${gerarClausulaInadimplencia()}
        
        ${categoria === "aluguel" ? `<br><p><strong>CLÁUSULA QUINTA — DAS GARANTIAS LOCATÍCIAS</strong></p>${gerarClausulaGarantia()}` : ''}
        ${categoria === "venda" ? `<br><p><strong>CLÁUSULA QUINTA — DA EVICÇÃO E DOS VÍCIOS REDIBITÓRIOS</strong></p><p>O <strong>${termo2}</strong> responsabiliza-se pela origem e boa procedência do bem objeto deste contrato, respondendo pela evicção de direito e por eventuais vícios ocultos (redibitórios).</p>` : ''}
        
        <br><p><strong>CLÁUSULA ${categoria === "servico" ? "QUINTA" : "SEXTA"} — DO FORO</strong></p>
        <p>As partes elegem o foro da <strong>${foro}</strong> para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.</p>

        <br><br><p>E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma, juntamente com 02 (duas) testemunhas.</p>

        <br><br><br>
        <div style="display:flex; justify-content:space-between; margin-top:50px; text-align:center;">
            <div style="width:45%; border-top:1px solid #000; padding-top:5px;"><strong>${cNome}</strong><br>${termo1Exibicao}</div>
            <div style="width:45%; border-top:1px solid #000; padding-top:5px;"><strong>${dNome}</strong><br>${termo2Exibicao}</div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:80px; text-align:center;">
            <div style="width:45%; border-top:1px solid #000; padding-top:5px;">Testemunha 1<br>CPF:</div>
            <div style="width:45%; border-top:1px solid #000; padding-top:5px;">Testemunha 2<br>CPF:</div>
        </div>
        </div>
    `;
    
    const resultadoEl = document.getElementById("resultado");
    if (resultadoEl) {
        resultadoEl.classList.remove("hidden");
        resultadoEl.innerHTML = estrutura;
    }
    
    const btnCopiar = document.getElementById("btnCopiar");
    if (btnCopiar) btnCopiar.style.display = "block";
    
    salvarDadosLocal(); // Salva os dados finais ao gerar contrato
    
    setTimeout(() => {
        if (resultadoEl) resultadoEl.scrollIntoView({ behavior: "smooth" });
    }, 100);
}

function gerarTextoPagamento() {
    const valor = document.getElementById("valorServico")?.value || "";
    const tipo = document.getElementById("tipoPagamento")?.value || "";
    const parcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const entrada = document.getElementById("valorEntrada")?.value || "";
    const meio = document.getElementById("meioPagamento")?.value || "a combinar";
    const dataPrimeira = document.getElementById("dataPrimeiroVencimento")?.value || "";
    
    const vNum = parseFloat(valor.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
    const eNum = parseFloat(entrada.replace(/\D/g, "").replace(",", ".")) / 100 || 0;
    
    if (tipo === "avista") {
        return `<p>Valor total de <strong>${valor}</strong> pago à vista, via <strong>${meio}</strong>, na data da assinatura deste instrumento.</p>`;
    }
    
    if (tipo === "parcelado") {
        if (parcelas <= 0) return "<p>A forma de pagamento será definida entre as partes.</p>";
        const parcStr = (vNum / parcelas).toFixed(2).replace(".", ",");
        let txt = `<p>O valor total de <strong>${valor}</strong> será pago em <strong>${parcelas} parcelas</strong> fixas de <strong>R$ ${parcStr}</strong> cada, por meio de <strong>${meio}</strong>.</p>`;
        
        if (dataPrimeira) {
            const datasVencimento = calcularDatasParcelas(dataPrimeira, parcelas);
            txt += "<p>Os vencimentos ocorrerão nas seguintes datas: <br><br>";
            datasVencimento.forEach((d, i) => {
                txt += `&nbsp;&nbsp;&nbsp;&nbsp;Parcela ${i + 1}: <strong>R$ ${parcStr}</strong> com vencimento em <strong>${d}</strong>;<br>`;
            });
            txt += "</p>";
        }
        return txt;
    }
    
    if (tipo === "entrada") {
        if (parcelas <= 0 || eNum <= 0) return "<p>A forma de pagamento será definida entre as partes.</p>";
        const rest = vNum - eNum;
        const parcStr = (rest / parcelas).toFixed(2).replace(".", ",");
        const remainingFormatted = rest.toFixed(2).replace(".", ",");
        
        let txt = `<p>O pagamento será realizado com um sinal de <strong>${entrada}</strong> no ato da assinatura. O saldo remanescente de <strong>R$ ${remainingFormatted}</strong> será quitado em <strong>${parcelas} parcelas</strong> de <strong>R$ ${parcStr}</strong> cada, mediante <strong>${meio}</strong>.</p>`;
        
        if (dataPrimeira) {
            const datasVencimento = calcularDatasParcelas(dataPrimeira, parcelas);
            txt += "<p>O saldo remanescente vencerá nas seguintes datas: <br><br>";
            datasVencimento.forEach((d, i) => {
                txt += `&nbsp;&nbsp;&nbsp;&nbsp;Parcela ${i + 1}: <strong>R$ ${parcStr}</strong> com vencimento em <strong>${d}</strong>;<br>`;
            });
            txt += "</p>";
        }
        return txt;
    }
    
    return "<p>A forma de pagamento será definida em termo aditivo entre as partes.</p>";
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

function copiarContrato() {
    const t = document.getElementById("resultado")?.innerText || "";
    if (!t) return alert("Nada para copiar.");
    navigator.clipboard.writeText(t).then(() => alert("✅ Contrato copiado!")).catch(() => alert("❌ Erro ao copiar."));
}

// ==========================
// LIMPAR DADOS DO FORMULÁRIO E MEMÓRIA
// ==========================

function limparDados() {
    // Confirmação de segurança para evitar acidentes
    if (!confirm("Tem certeza que deseja apagar todos os dados preenchidos?")) {
        return;
    }

    // 1. Limpa a memória do navegador (LocalStorage)
    localStorage.removeItem('vibecoding_contrato_dados');

    // 2. Esvazia todos os campos visuais (Inputs, Textareas e Selects)
    const campos = document.querySelectorAll('input, textarea, select');
    campos.forEach(campo => {
        campo.value = '';
    });

    // 3. Esconde o contrato gerado e o botão de copiar (se estiverem aparecendo)
    const resultado = document.getElementById("resultado");
    if (resultado) resultado.classList.add("hidden");
    
    const btnCopiar = document.getElementById("btnCopiar");
    if (btnCopiar) btnCopiar.style.display = "none";

    // 4. Reseta os blocos visuais para o estado original
    handleMudancaCategoria();
    atualizarResumoPagamento();
    
    // 5. Rola a página suavemente para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}