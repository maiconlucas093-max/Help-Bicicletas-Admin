
document.addEventListener("DOMContentLoaded", function () {

  // =================================
  // TESTE DE CONEXÃO COM SUPABASE
  // =================================

  async function testarConexaoSupabase() {
    const indicador = document.querySelector(".status");

    if (!window.helpSupabase) {
      if (indicador) {
        indicador.textContent = "● Supabase não inicializado";
      }
      console.error("Cliente Supabase não encontrado.");
      return;
    }

    if (indicador) {
      indicador.textContent = "● Conectando ao Supabase...";
    }

    try {
      const { error } = await window.helpSupabase
        .from("produtos")
        .select("id")
        .limit(1);

      if (error) {
        throw error;
      }

      if (indicador) {
        indicador.textContent = "● Supabase conectado";
      }

      console.info("HELP BICICLETAS: conexão testada com sucesso.");

    } catch (erro) {
      if (indicador) {
        indicador.textContent = "● Erro na conexão com Supabase";
      }

      console.error("Falha no teste do Supabase:", erro);
    }
  }

  testarConexaoSupabase();

  // =================================
  // NAVEGAÇÃO DO PAINEL
  // =================================

  const botoesMenu = document.querySelectorAll("[data-page]");
  const atalhos = document.querySelectorAll("[data-open]");
  const paginas = document.querySelectorAll(".page");
  const titulo = document.getElementById("page-title");

  const titulos = {
    inicio: "Visão geral",
    produtos: "Produtos",
    estoque: "Estoque",
    servicos: "Serviços mecânicos",
    pedidos: "Pedidos",
    vendas: "Vendas",
    configuracoes: "Configurações"
  };

  function abrirPagina(nomePagina) {

    const paginaSelecionada = document.getElementById(nomePagina);

    if (!paginaSelecionada) {
      console.warn("Página não encontrada:", nomePagina);
      return;
    }

    paginas.forEach(function (pagina) {
      pagina.classList.remove("active");
    });

    paginaSelecionada.classList.add("active");

    botoesMenu.forEach(function (botao) {
      botao.classList.toggle(
        "active",
        botao.dataset.page === nomePagina
      );
    });

    if (titulo) {
      titulo.textContent = titulos[nomePagina] || "Painel administrativo";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  botoesMenu.forEach(function (botao) {

    botao.addEventListener("click", function () {
      abrirPagina(botao.dataset.page);
    });

  });

  atalhos.forEach(function (atalho) {

    atalho.addEventListener("click", function () {
      abrirPagina(atalho.dataset.open);
    });

  });


  // =================================
  // FORMULÁRIO DE PRODUTOS
  // =================================

  const botaoNovoProduto = document.getElementById("btn-novo-produto");
  const formularioCard = document.getElementById("product-form-card");
  const formulario = document.getElementById("product-form");

  const botaoFechar = document.getElementById("btn-fechar-form");
  const botaoCancelar = document.getElementById("btn-cancelar-produto");

  const campoImagem = document.getElementById("produto-imagem");
  const mensagem = document.getElementById("product-form-message");

  function abrirFormulario() {

    if (!formularioCard) return;

    formularioCard.hidden = false;

    if (mensagem) {
      mensagem.textContent = "";
    }

    formularioCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function fecharFormulario() {

    if (!formularioCard) return;

    formularioCard.hidden = true;

    if (mensagem) {
      mensagem.textContent = "";
    }

    if (formulario) {
      formulario.reset();
    }
  }

  if (botaoNovoProduto) {
    botaoNovoProduto.addEventListener("click", abrirFormulario);
  }

  if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharFormulario);
  }

  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", fecharFormulario);
  }


  // =================================
  // VALIDAÇÃO DO CADASTRO
  // =================================

  if (formulario) {

    formulario.addEventListener("submit", function (evento) {

      evento.preventDefault();

      if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
      }

      const nome = document.getElementById("produto-nome").value.trim();
      const categoria = document.getElementById("produto-categoria").value;
      const preco = Number(document.getElementById("produto-preco").value);
      const estoque = Number(document.getElementById("produto-estoque").value);

      if (!nome || !categoria || !Number.isFinite(preco) ||
          preco < 0 || !Number.isInteger(estoque) || estoque < 0) {

        mensagem.textContent = "Confira os dados informados.";
        mensagem.style.color = "#ed2027";
        return;
      }

      // Validação da fotografia
      if (campoImagem && campoImagem.files.length > 0) {

        const imagem = campoImagem.files[0];

        const formatosPermitidos = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];

        if (!formatosPermitidos.includes(imagem.type)) {
          mensagem.textContent = "Formato inválido. Use JPG, PNG ou WEBP.";
          mensagem.style.color = "#ed2027";
          return;
        }

        if (imagem.size > 5 * 1024 * 1024) {
          mensagem.textContent = "A fotografia deve ter no máximo 5 MB.";
          mensagem.style.color = "#ed2027";
          return;
        }
      }

      mensagem.textContent =
        "Dados validados com sucesso! O cadastro ainda não foi gravado. Aguardando integração com o Supabase.";

      mensagem.style.color = "#4ade80";

    });

  }

});
