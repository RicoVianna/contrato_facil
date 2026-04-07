
// ==========================
// ELEMENTOS
// ==========================
const resultadoEl = document.getElementById("resultado");

// ==========================
// EVENTOS
// ==========================
/*
categoriaEl.addEventListener("change", carregarSubcategorias);
subcategoriaEl.addEventListener("change", carregarTipos);

tipoEl.addEventListener("change", () => {
    if (tipoEl.value === "Outro") {
        outroContainer.classList.remove("hidden");
    } else {
        outroContainer.classList.add("hidden");
        outroInput.value = "";
    }
    renderizarCamposDinamicos(
        categoriaEl.value,
        subcategoriaEl.value,
        tipoEl.value
    );
});
*/


function gerarContrato() {
    const categoria = document.getElementById("categoria").value;
    const objeto = document.getElementById("objeto").value;

    const contratanteNome = document.getElementById("contratanteNome").value;
    const contratanteCPF = document.getElementById("contratanteCPF").value;
    const contratanteEstadoCivil = document.getElementById("contratanteEstadoCivil").value;

    const contratanteRua = document.getElementById("contratanteRua").value;
    const contratanteNumero = document.getElementById("contratanteNumero").value;
    const contratanteCidade = document.getElementById("contratanteCidade").value;
    const contratanteEstado = document.getElementById("contratanteEstado").value;

    const contratadoNome = document.getElementById("contratadoNome").value;
    const contratadoCPF = document.getElementById("contratadoCPF").value;
    const contratadoEstadoCivil = document.getElementById("contratadoEstadoCivil").value;

    const contratadoRua = document.getElementById("contratadoRua").value;
    const contratadoNumero = document.getElementById("contratadoNumero").value;
    const contratadoCidade = document.getElementById("contratadoCidade").value;
    const contratadoEstado = document.getElementById("contratadoEstado").value;
    const valorServico = document.getElementById("valorServico")?.value || "Não informado";
    
    const dataInicio = document.getElementById("dataInicio")?.value || "Não definido";
    const dataFim = document.getElementById("dataFim")?.value || "Não definido";

    const tipoPagamento = document.getElementById("tipoPagamento")?.value;
    const meioPagamento = document.getElementById("meioPagamento").value;
    const numeroParcelas = document.getElementById("numeroParcelas")?.value || 0;
    const valorEntrada = document.getElementById("valorEntrada")?.value || 0;

    if (!categoria) {
        alert("Selecione o tipo de contrato");
        return;
    }

    if (!objeto) {
        alert("Preencha o objeto do contrato");
        return;
    }

    // ==========================
    // VALIDAÇÃO DE PRAZO INTELIGENTE
    // ==========================
    const tipo = categoria;

    // SERVIÇO
    if (tipo === "servico") {
        if (!dataInicio || dataInicio === "Não definido") {
            alert("Informe a data de início do serviço");
            return;
        }

        if (!dataFim || dataFim === "Não definido") {
            alert("Informe a data de término do serviço");
            return;
        }
    }

    // COMPRA E VENDA
    if (tipo === "venda") {
        if (!dataFim || dataFim === "Não definido") {
            alert("Informe a data de entrega do bem");
            return;
        }
    }

    // ALUGUEL
    if (tipo === "aluguel") {
        if (!dataInicio || dataInicio === "Não definido") {
            alert("Informe a data de início da locação");
            return;
        }

        if (!dataFim || dataFim === "Não definido") {
            alert("Informe a data de término da locação");
            return;
        }
    }

    // VALIDAÇÃO LÓGICA
    if (dataInicio && dataFim && dataInicio > dataFim) {
        alert("A data de início não pode ser maior que a data final");
        return;
    }

    // ==========================
    // VALIDAÇÃO GARANTIA ALUGUEL
    // ==========================
    if (categoria === "aluguel") {

        const tipoGarantia = document.getElementById("tipoGarantia")?.value;

        // ✅ PERMITE NÃO TER GARANTIA
        if (!tipoGarantia || tipoGarantia === "nenhuma") {
            // não valida nada
        }

        else if (tipoGarantia === "caucao") {
            const meses = parseInt(document.getElementById("mesesCaucao")?.value) || 0;

            if (meses < 1 || meses > 3) {
                alert("A caução deve ser entre 1 e 3 meses");
                return;
            }
        }

        else if (tipoGarantia === "fiador") {
            const nome = document.getElementById("nomeFiador")?.value;
            const cpf = document.getElementById("cpfFiador")?.value;

            if (!nome) {
                alert("Informe o nome do fiador");
                return;
            }

            if (!cpf || cpf.length < 14) {
                alert("Informe o CPF do fiador");
                return;
            }
        }

        else if (tipoGarantia === "seguro") {
            const seguradora = document.getElementById("seguradora")?.value;

            if (!seguradora) {
                alert("Informe a seguradora");
                return;
            }
        }
    }

    // ==========================
// VALIDAÇÃO DE PAGAMENTO
// ==========================

// 🔴 NÃO VALIDAR PAGAMENTO PARA ALUGUEL
if (categoria !== "aluguel") {

    if (tipoPagamento === "parcelado") {
        if (!numeroParcelas || numeroParcelas <= 0) {
            alert("Informe o número de parcelas");
            return;
        }
    }

    else if (tipoPagamento === "entrada") {
        if (!numeroParcelas || numeroParcelas <= 0) {
            alert("Informe o número de parcelas");
            return;
        }

        const entradaNum = parseFloat(
            valorEntrada.replace(/\./g, "").replace(",", ".")
        ) || 0;

        if (entradaNum <= 0) {
            alert("Informe o valor de entrada");
            return;
        }
    }
}

    const estrutura = `
    <div style="line-height:1.6; font-family:Arial;">

    <h2 style="text-align:center; margin-bottom:30px;">
    ${categoria === "servico" ? "CONTRATO DE PRESTAÇÃO DE SERVIÇOS" :
    categoria === "venda" ? "CONTRATO DE COMPRA E VENDA" :
    "CONTRATO DE LOCAÇÃO"}
    </h2>

    <p><strong>CONTRATANTE:</strong><br>
    ${contratanteNome}, CPF ${contratanteCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}, ${contratanteEstadoCivil}<br>
    Endereço: ${contratanteRua}${contratanteNumero ? ", " + contratanteNumero : ""} - ${contratanteCidade}/${contratanteEstado}
    </p>

    <br>

    <p><strong>CONTRATADO:</strong><br>
    ${contratadoNome}, CPF ${contratadoCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}, ${contratadoEstadoCivil}<br>
    Endereço: ${contratadoRua}${contratadoNumero ? ", " + contratadoNumero : ""} - ${contratadoCidade}/${contratadoEstado}
    </p>

    <br><br>

    <p><strong>CLÁUSULA 1 — OBJETO</strong></p>
    <p>
    O presente contrato tem como objeto ${objeto}, que será executado pelo CONTRATADO em favor do CONTRATANTE, conforme as condições estabelecidas neste instrumento.
    </p>

    <br>

    <p><strong>CLÁUSULA 2 — PAGAMENTO</strong></p>
    <p>
    ${gerarTextoPagamento()}
    </p>

    <br>

    <p><strong>CLÁUSULA 3 — PRAZO</strong></p>
    <p>
    ${gerarClausulaPrazo()}
    </p>

    <br>

    <p><strong>CLÁUSULA 4 — INADIMPLEMENTO</strong></p>
    <p>
    ${gerarClausulaInadimplencia()}
    </p>

    <br>

    <p><strong>CLÁUSULA 5 — GARANTIA</strong></p>
    <p>
    ${gerarClausulaGarantia()}
    </p>

    <br>

    <p><strong>CLÁUSULA 6 — FORO</strong></p>
    <p>
    Fica eleito o foro da comarca das partes.
    </p>

    </div>
    `;
    
    resultadoEl.classList.remove("hidden");
    resultadoEl.innerHTML = estrutura;
    }

aplicarMascaraCPF(document.getElementById("contratanteCPF"));
aplicarMascaraCPF(document.getElementById("contratadoCPF"));

aplicarMascaraCPF(document.getElementById("cpfFiador"));

aplicarMascaraCEP(document.getElementById("contratanteCEP"));
aplicarMascaraCEP(document.getElementById("contratadoCEP"));

buscarEnderecoPorCEP(
    document.getElementById("contratanteCEP"),
    document.getElementById("contratanteRua"),
    document.getElementById("contratanteBairro"),
    document.getElementById("contratanteCidade"),
    document.getElementById("contratanteEstado")
);

buscarEnderecoPorCEP(
    document.getElementById("contratadoCEP"),
    document.getElementById("contratadoRua"),
    document.getElementById("contratadoBairro"),
    document.getElementById("contratadoCidade"),
    document.getElementById("contratadoEstado")
);

function aplicarMascaraCPF(input) {
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.slice(0, 11);
        }

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

        input.value = valor;
    });
}

function buscarEnderecoPorCEP(cepInput, ruaInput, bairroInput, cidadeInput, estadoInput) {

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

            ruaInput.value = data.logradouro || "";
            bairroInput.value = data.bairro || "";
            cidadeInput.value = data.localidade || "";
            estadoInput.value = data.uf || "";

        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        }
    });
}

function aplicarMascaraCEP(input) {
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");

        if (valor.length > 8) {
            valor = valor.slice(0, 8);
        }

        valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

        input.value = valor;
    });
}

function formatarDataBR(data) {
    if (!data || data === "Não definido") return "Não definido";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function aplicarMascaraMoeda(input) {
    input.addEventListener("input", () => {
        let valor = input.value.replace(/\D/g, "");

        valor = (valor / 100).toFixed(2) + "";
        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        input.value = valor;
    });
}

function preencherTeste() {

    // Tipo
    document.getElementById("categoria").value = "servico";

    // Objeto
    document.getElementById("objeto").value = "Prestação de serviços de manutenção de computador";

    // Contratante
    document.getElementById("contratanteNome").value = "João da Silva";
    document.getElementById("contratanteCPF").value = "12345678901";
    document.getElementById("contratanteEstadoCivil").value = "Solteiro";
    const cepContratante = document.getElementById("contratanteCEP");
    cepContratante.value = "01001000";
    cepContratante.dispatchEvent(new Event("blur"));
    document.getElementById("contratanteNumero").value = "100";    

    // Contratado
    document.getElementById("contratadoNome").value = "Maria Oliveira";
    document.getElementById("contratadoCPF").value = "98765432100";
    document.getElementById("contratadoEstadoCivil").value = "Casada";
    const cepContratado = document.getElementById("contratadoCEP");
    cepContratado.value = "01310930";
    cepContratado.dispatchEvent(new Event("blur"));
    document.getElementById("contratadoNumero").value = "200";

    

    // Valor e pagamento (se existir depois)
    const valor = document.getElementById("valorServico");
    if (valor) valor.value = "2500,00";
    aplicarMascaraMoeda(document.getElementById("valorServico"));
    aplicarMascaraMoeda(document.getElementById("valorEntrada"));

    const pagamento = document.getElementById("tipoPagamento");
    if (pagamento) {
        pagamento.value = "parcelado";
        pagamento.dispatchEvent(new Event("change"));
    }

    const meio = document.getElementById("meioPagamento");
    if (meio) meio.value = "PIX";

    const inicio = document.getElementById("dataInicio");
    if (inicio) inicio.value = "2026-04-01";

    const fim = document.getElementById("dataFim");
    if (fim) fim.value = "2026-04-30";

    atualizarResumoPagamento();
}

function copiarContrato() {
    const texto = document.getElementById("resultado").innerText;

    if (!texto) {
        alert("Nada para copiar.");
        return;
    }

    navigator.clipboard.writeText(texto)
        .then(() => {
            alert("Contrato copiado!");
        })
        .catch(() => {
            alert("Erro ao copiar.");
        });
}

aplicarMascaraMoeda(document.getElementById("valorServico"));

const tipoPagamentoEl = document.getElementById("tipoPagamento");
const parcelasContainer = document.getElementById("parcelasContainer");
const entradaContainer = document.getElementById("entradaContainer");

tipoPagamentoEl.addEventListener("change", () => {
    const tipo = tipoPagamentoEl.value.toLowerCase();

    parcelasContainer.style.display = "none";
    entradaContainer.style.display = "none";

    if (tipo === "parcelado") {
        parcelasContainer.style.display = "block";
    }

    if (tipo === "entrada") {
        parcelasContainer.style.display = "block";
        entradaContainer.style.display = "block";
    }
});

// ==========================
// CONTROLE DE EXIBIÇÃO POR TIPO DE CONTRATO
// ==========================

const pagamentoPadrao = document.getElementById("pagamentoPadrao");
const aluguelContainer = document.getElementById("aluguelContainer");


function atualizarResumoPagamento() {

    const resumoEl = document.getElementById("resumoPagamento");
    if (!resumoEl) return;

    const valor = document.getElementById("valorServico")?.value || "0";
    const tipo = document.getElementById("tipoPagamento")?.value;
    const parcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const entrada = document.getElementById("valorEntrada")?.value || "0";

    const valorNum = parseFloat(
        valor.replace(/\./g, "").replace(",", ".")
    ) || 0;

    const entradaNum = parseFloat(
        entrada.replace(/\./g, "").replace(",", ".")
    ) || 0;

    let texto = "";

    if (tipo === "avista") {
        texto = `Pagamento total: R$ ${valor}`;
    }

    else if (tipo === "parcelado") {
        if (parcelas <= 0) {
            texto = "";
        } else {
            const parcela = (valorNum / parcelas)
                .toFixed(2)
                .replace(".", ",");

            texto = `
            ${parcelas}x de R$ ${parcela}
            <span style="margin-left:10px; font-weight:bold; color:#16a34a;">
                (Total: R$ ${valor})
            </span>
            `;
        }
    }

    else if (tipo === "entrada") {
        if (parcelas <= 0 || entradaNum <= 0) {
            texto = "Informe entrada e parcelas";
        } else {
            const restante = valorNum - entradaNum;

            if (restante < 0) {
                texto = "⚠️ Entrada maior que o valor total";
            } else {
                const parcela = (restante / parcelas)
                    .toFixed(2)
                    .replace(".", ",");

                texto = `
                Entrada: R$ ${entrada} + ${parcelas}x de R$ ${parcela}
                <span style="margin-left:10px; font-weight:bold; color:#16a34a;">
                    (Total: R$ ${valor})
                </span>
                `;
            }
        }
    }

    resumoEl.innerHTML = texto;
}

["valorServico", "tipoPagamento", "numeroParcelas", "valorEntrada"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", atualizarResumoPagamento);
        el.addEventListener("change", atualizarResumoPagamento);
    }
});

function gerarTextoPagamento() {
    const valor = document.getElementById("valorServico")?.value || "0";
    const tipo = document.getElementById("tipoPagamento")?.value;
    const parcelas = parseInt(document.getElementById("numeroParcelas")?.value) || 0;
    const entrada = document.getElementById("valorEntrada")?.value || "0";
    const meio = document.getElementById("meioPagamento")?.value || "forma a combinar";

    const valorNum = parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
    const entradaNum = parseFloat(entrada.replace(/\./g, "").replace(",", ".")) || 0;

    // ==========================
    // À VISTA
    // ==========================
    if (tipo === "avista") {
        return `
        O valor total de R$ ${valor} será pago à vista, mediante ${meio}, na data da assinatura deste contrato.

        Em caso de inadimplemento, incidirá multa de 2% sobre o valor devido, acrescida de juros de mora de 1% ao mês, calculados pro rata die, além de correção monetária até a data do efetivo pagamento.

        O não pagamento poderá ensejar a imediata cobrança judicial, bem como a rescisão do presente contrato.
        `;
    }

    // ==========================
    // PARCELADO
    // ==========================
    if (tipo === "parcelado") {
        if (parcelas <= 0) {
            return "A forma de pagamento será definida entre as partes.";
        }

        const parcela = (valorNum / parcelas)
            .toFixed(2)
            .replace(".", ",");

        return `
        O valor total de R$ ${valor} será pago em ${parcelas} parcelas mensais, iguais e sucessivas, no valor de R$ ${parcela} cada, mediante ${meio}.

        O vencimento das parcelas ocorrerá em periodicidade mensal, iniciando-se na data acordada entre as partes.

        O atraso no pagamento de qualquer parcela implicará no vencimento antecipado das demais, podendo o CONTRATANTE exigir o pagamento integral da dívida.

        Em caso de inadimplemento, incidirá multa de 2% sobre o valor em atraso, acrescida de juros de mora de 1% ao mês, além de correção monetária.

        O não pagamento poderá ensejar a adoção de medidas judiciais cabíveis.
        `;
    }

    // ==========================
    // ENTRADA + PARCELAS
    // ==========================
    if (tipo === "entrada") {
        if (parcelas <= 0 || entradaNum <= 0) {
            return "A forma de pagamento será definida entre as partes.";
        }

        const restante = valorNum - entradaNum;

        const parcela = (restante / parcelas)
            .toFixed(2)
            .replace(".", ",");

        return `
        O pagamento será realizado mediante entrada no valor de R$ ${entrada}, a ser paga no ato da assinatura deste contrato, e o saldo remanescente de R$ ${(restante).toFixed(2).replace(".", ",")} será quitado em ${parcelas} parcelas mensais e sucessivas de R$ ${parcela}, mediante ${meio}.

        O atraso no pagamento de qualquer parcela implicará no vencimento antecipado das demais.

        Em caso de inadimplemento, incidirá multa de 2% sobre o valor devido, acrescida de juros de mora de 1% ao mês, além de correção monetária até a data do efetivo pagamento.

        O não pagamento poderá ensejar a rescisão do contrato e a cobrança judicial do débito.
        `;
    }

    return "A forma de pagamento será definida entre as partes.";
}

function gerarClausulaPrazo() {
    const categoria = document.getElementById("categoria").value;

    const dataInicio = document.getElementById("dataInicio")?.value || "";
    const dataFim = document.getElementById("dataFim")?.value || "";

    const inicio = formatarDataBR(dataInicio);
    const fim = formatarDataBR(dataFim);

    // 🔹 PRESTAÇÃO DE SERVIÇOS
    if (categoria === "servico") {
        return `
        O presente contrato terá início em ${inicio} e término em ${fim},
        período durante o qual o CONTRATADO se compromete a executar integralmente os serviços descritos na Cláusula 1.

        Eventual prorrogação do prazo somente poderá ocorrer mediante acordo prévio e expresso entre as partes.
        `;
    }

    // 🔹 COMPRA E VENDA
    if (categoria === "venda") {
        return `
        O bem objeto deste contrato deverá ser entregue até a data de ${fim},
        em condições adequadas de uso, no local a ser ajustado entre as partes.

        O atraso na entrega poderá sujeitar o CONTRATADO às penalidades previstas neste contrato, sem prejuízo de eventuais perdas e danos.
        `;
    }

    // 🔹 LOCAÇÃO
    if (categoria === "aluguel") {
        return `
        O presente contrato vigorará pelo prazo determinado, iniciando-se em ${inicio} e encerrando-se em ${fim},
        obrigando-se as partes ao cumprimento integral de todas as disposições pactuadas durante este período.

        A permanência do LOCATÁRIO no imóvel após o término do prazo, sem oposição do LOCADOR, poderá caracterizar prorrogação automática, nos termos da legislação aplicável.
        `;
    }

    return "O prazo será definido entre as partes.";
}

function gerarClausulaInadimplencia() {
    return `
    O inadimplemento de qualquer obrigação financeira assumida neste contrato
    implicará na incidência de multa de 2% sobre o valor devido, acrescida de
    juros de mora de 1% ao mês, calculados pro rata die, até a data do efetivo pagamento.

    O não pagamento poderá ensejar a adoção de medidas judiciais cabíveis,
    incluindo cobrança e rescisão contratual.
    `;
}

function gerarClausulaGarantia() {
    const categoria = document.getElementById("categoria")?.value;

    if (categoria !== "aluguel") return "";

    const tipo = document.getElementById("tipoGarantia")?.value;

    const valorAluguel = document.getElementById("valorAluguel")?.value || "0";
    const meses = parseInt(document.getElementById("mesesCaucao")?.value) || 0;

    const nomeFiador = document.getElementById("nomeFiador")?.value || "";
    const cpfFiador = document.getElementById("cpfFiador")?.value || "";

    const seguradora = document.getElementById("seguradora")?.value || "";
    const apolice = document.getElementById("apoliceSeguro")?.value || "";

    // SEM GARANTIA
    if (!tipo || tipo === "nenhuma") {
        return `
        O presente contrato é celebrado sem a exigência de garantia locatícia,
        assumindo o LOCATÁRIO integral responsabilidade pelo cumprimento das obrigações pactuadas.
        `;
    }

    // CAUÇÃO
    if (tipo === "caucao") {
        return `
        Como garantia do cumprimento das obrigações contratuais,
        o LOCATÁRIO prestará caução equivalente a ${meses} meses de aluguel,
        considerando o valor mensal de R$ ${valorAluguel}.

        A caução será restituída ao final do contrato, caso não haja débitos ou danos.
        `;
    }

    // FIADOR
    if (tipo === "fiador") {
        return `
        O presente contrato conta com a garantia de fiador,
        sendo indicado o Sr(a). ${nomeFiador}, inscrito no CPF sob o nº ${cpfFiador},
        que se responsabiliza solidariamente pelo cumprimento das obrigações assumidas pelo LOCATÁRIO.
        `;
    }

    // SEGURO
    if (tipo === "seguro") {
        return `
        O LOCATÁRIO obriga-se a contratar seguro fiança junto à seguradora ${seguradora},
        sob a apólice nº ${apolice}, garantindo o cumprimento das obrigações contratuais.
        `;
    }

    return "";
}

// ==========================
// CONTROLE DINÂMICO DE PRAZO
// ==========================
const categoriaEl = document.getElementById("categoria");
const campoInicio = document.getElementById("campoDataInicio");
const campoFim = document.getElementById("campoDataFim");
const labelFim = document.getElementById("labelDataFim");

categoriaEl.addEventListener("change", () => {
    const tipo = categoriaEl.value;

    // ==========================
    // RESET GERAL
    // ==========================
    campoInicio.style.display = "block";
    campoFim.style.display = "block";
    labelFim.innerText = "Data de término";

    pagamentoPadrao.style.display = "block";
    aluguelContainer.style.display = "none";

    // ==========================
    // SERVIÇO
    // ==========================
    if (tipo === "servico") {
        labelFim.innerText = "Data de término do serviço";
    }

    // ==========================
    // COMPRA E VENDA
    // ==========================
    if (tipo === "venda") {
        campoInicio.style.display = "none";
        labelFim.innerText = "Data de entrega do bem";
    }

    // ==========================
    // ALUGUEL
    // ==========================
    if (tipo === "aluguel") {
        labelFim.innerText = "Data de término do contrato";

        // ESCONDE pagamento padrão
        pagamentoPadrao.style.display = "none";

        // MOSTRA aluguel
        aluguelContainer.style.display = "block";
    }
});

const valorAluguelEl = document.getElementById("valorAluguel");
if (valorAluguelEl) aplicarMascaraMoeda(valorAluguelEl);

const valorCaucaoEl = document.getElementById("valorCaucao");
if (valorCaucaoEl) aplicarMascaraMoeda(valorCaucaoEl);

const tipoGarantiaEl = document.getElementById("tipoGarantia");
const caucaoContainer = document.getElementById("caucaoContainer");
const fiadorContainer = document.getElementById("fiadorContainer");
const seguroContainer = document.getElementById("seguroContainer");

tipoGarantiaEl.addEventListener("change", () => {
    const tipo = tipoGarantiaEl.value;

    // RESET
    caucaoContainer.style.display = "none";
    fiadorContainer.style.display = "none";
    seguroContainer.style.display = "none";

    if (tipo === "caucao") {
        caucaoContainer.style.display = "block";
    }

    if (tipo === "fiador") {
        fiadorContainer.style.display = "block";
    }

    if (tipo === "seguro") {
        seguroContainer.style.display = "block";
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const tipoGarantiaEl = document.getElementById("tipoGarantia");
    const caucaoContainer = document.getElementById("caucaoContainer");
    const fiadorContainer = document.getElementById("fiadorContainer");
    const seguroContainer = document.getElementById("seguroContainer");

    if (!tipoGarantiaEl) return;

    tipoGarantiaEl.addEventListener("change", () => {
        const tipo = tipoGarantiaEl.value;

        caucaoContainer.style.display = "none";
        fiadorContainer.style.display = "none";
        seguroContainer.style.display = "none";

        if (tipo === "caucao") {
            caucaoContainer.style.display = "block";
        }

        if (tipo === "fiador") {
            fiadorContainer.style.display = "block";
        }

        if (tipo === "seguro") {
            seguroContainer.style.display = "block";
        }
    });

});