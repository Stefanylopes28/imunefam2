// Aguarde o DOM carregar antes de adicionar eventos
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("formPaciente")?.addEventListener("submit", cadastrarPaciente);
    document.getElementById("formVacina")?.addEventListener("submit", cadastrarVacina);
    document.getElementById("consultarVacinas")?.addEventListener("click", consultarVacinas);
    loadPacientes();
});


document.addEventListener("DOMContentLoaded", () => {
    loadPacientes();

    document.getElementById("formPaciente").addEventListener("submit", (event) => {
        event.preventDefault();
        cadastrarPaciente();
    });

    document.getElementById("btnEditar").addEventListener("click", salvarEdicao);
    document.getElementById("btnExcluir").addEventListener("click", excluirPaciente);
});

// Função para carregar pacientes e exibir na tabela
function loadPacientes() {
    fetch("http://localhost:3000/pacientes") // Altere para a sua API
        .then(response => response.json())
        .then(pacientes => {
            const tabela = document.querySelector("#pacientes-table tbody");
            tabela.innerHTML = "";

            pacientes.forEach(paciente => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${paciente.id}</td>
                    <td>${paciente.nome}</td>
                    <td>${paciente.cpf || "N/A"}</td>
                    <td>${paciente.sexo}</td>
                    <td>${paciente.data_nascimento}</td>
                    <td>
                        <button class="editar-btn" data-id="${paciente.id}">✏️ Editar</button>
                        <button class="excluir-btn" data-id="${paciente.id}">🗑️ Excluir</button>
                    </td>
                `;

                tabela.appendChild(row);
            });

            document.querySelectorAll(".editar-btn").forEach(botao => {
                botao.addEventListener("click", () => preencherFormulario(botao.getAttribute("data-id")));
            });

            document.querySelectorAll(".excluir-btn").forEach(botao => {
                botao.addEventListener("click", () => excluirPaciente(botao.getAttribute("data-id")));
            });
        })
        .catch(error => console.error("Erro ao carregar pacientes:", error));
}

// Função para cadastrar paciente
function cadastrarPaciente() {
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const sexo = document.getElementById("sexo").value;
    const dataNascimento = document.getElementById("data_nascimento").value;

    fetch("http://localhost:3000/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, sexo, data_nascimento: dataNascimento })
    })
    .then(response => response.json())
    .then(() => {
        alert("Paciente cadastrado com sucesso!");
        loadPacientes();
        document.getElementById("formPaciente").reset();
    })
    .catch(error => console.error("Erro ao cadastrar paciente:", error));
}

// Função para preencher o formulário ao editar
function preencherFormulario(id) {
    fetch(`http://localhost:3000/pacientes/${id}`)
        .then(response => response.json())
        .then(paciente => {
            document.getElementById("pacienteId").value = paciente.id;
            document.getElementById("nome").value = paciente.nome;
            document.getElementById("cpf").value = paciente.cpf || "";
            document.getElementById("sexo").value = paciente.sexo;
            document.getElementById("data_nascimento").value = paciente.data_nascimento;

            // Mostrar botões de edição e exclusão
            document.getElementById("btnCadastrar").style.display = "none";
            document.getElementById("btnEditar").style.display = "inline-block";
            document.getElementById("btnExcluir").style.display = "inline-block";
        })
        .catch(error => console.error("Erro ao carregar paciente para edição:", error));
}

// Função para salvar a edição
function salvarEdicao() {
    const id = document.getElementById("pacienteId").value;
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const sexo = document.getElementById("sexo").value;
    const dataNascimento = document.getElementById("data_nascimento").value;

    fetch(`http://localhost:3000/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, sexo, data_nascimento: dataNascimento })
    })
    .then(response => response.json())
    .then(() => {
        alert("Paciente atualizado com sucesso!");
        resetFormulario();
        loadPacientes();
    })
    .catch(error => console.error("Erro ao editar paciente:", error));
}

// Função para excluir paciente
function excluirPaciente() {
    const id = document.getElementById("pacienteId").value;

    if (confirm("Tem certeza que deseja excluir este paciente?")) {
        fetch(`http://localhost:3000/pacientes/${id}`, {
            method: "DELETE"
        })
        .then(() => {
            alert("Paciente excluído com sucesso!");
            resetFormulario();
            loadPacientes();
        })
        .catch(error => console.error("Erro ao excluir paciente:", error));
    }
}

// Função para resetar o formulário
function resetFormulario() {
    document.getElementById("formPaciente").reset();
    document.getElementById("pacienteId").value = "";
    
    document.getElementById("btnCadastrar").style.display = "inline-block";
    document.getElementById("btnEditar").style.display = "none";
    document.getElementById("btnExcluir").style.display = "none";
}


// Função genérica para envio de dados à API
async function enviarDadosAPI(url, dados, sucessoMsg) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });
        
        const data = await response.json();
        if (response.ok) {
            alert(sucessoMsg);
        } else {
            alert(`Erro: ${data.erro || "Desconhecido"}`);
        }
    } catch (error) {
        alert(`Erro ao comunicar com a API: ${error.message}`);
    }
}


// Função para cadastrar vacina
async function cadastrarVacina(event) {
    event.preventDefault();
    const vacina = getFormValues("formVacina");
    
    await enviarDadosAPI("/vacina/cadastrar", vacina, "Vacina cadastrada com sucesso!");
}


// Consultar vacinas
async function consultarVacinas() {
    try {
        const idPaciente = document.getElementById("paciente-id").value;
        const response = await fetch(`/estatisticas/imunizacoes/paciente/${idPaciente}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById("resultado-vacinas-aplicadas").textContent = `Vacinas aplicadas: ${data.aplicadas}`;
            document.getElementById("resultado-vacinas-proximas").textContent = `Vacinas próximas: ${data.proximas}`;
            document.getElementById("resultado-vacinas-atrasadas").textContent = `Vacinas atrasadas: ${data.atrasadas}`;
            document.getElementById("resultado-vacinas-acima-idade").textContent = `Vacinas acima da idade: ${data.acimaIdade}`;
        } else {
            alert(`Erro: ${data.message}`);
        }
    } catch (error) {
        alert(`Erro ao comunicar com a API: ${error.message}`);
    }
}
