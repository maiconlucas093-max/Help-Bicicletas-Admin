
document.addEventListener("DOMContentLoaded", function () {

  // =================================
  // ELEMENTOS DA TELA DE PRODUTOS
  // =================================

  const indicador = document.querySelector(".status");
  const contadorProdutos = document.getElementById("product-count");
  const mensagemVazia = document.getElementById("product-empty");
  const tabelaWrapper = document.getElementById("product-table-wrapper");
  const tabelaProdutos = document.getElementById("product-table-body");

  // =================================
  // CONEXÃO E LEITURA DO SUPABASE
  // =================================

  async function carregarProdutosSupabase() {

    if (!window.helpSupabase) {
      if (indicador) {
        indicador.textContent = "● Supabase não inicializado";
      }

      mostrarErroProdutos("Não foi possível inicializar o Supabase.");
      console.error("Cliente Supabase não encontrado.");
      return;
    }

    if (indicador) {
      indicador.textContent = "● Carregando produtos...";
    }

    try {

      const { data, error } = await window.helpSupabase
        .from("produtos")
        .select(
          "id, nome, descricao, categoria, preco_centavos, imagem_url, estoque, ativo, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (indicador) {
        indicador.textContent = "● Supabase conectado";
      }

      renderizarProdutos(data || []);

      console.info(
        "HELP BICICLETAS: produtos carregados:",
        (data || []).length
      );

    } catch (erro) {

      if (indicador) {
        indicador.textContent = "● Erro ao carregar produtos";
      }

      mostrarErroProdutos(
        "Não foi possível carregar os produtos. Verifique a conexão e as permissões."
      );

      console.error("Erro ao consultar produtos:", erro);
    }
  }

  // =================================
  // FORMATAÇÃO DE PREÇOS
  // =================================

  function formatarPreco(centavos) {

    const valor = Number(centavos) / 100;

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(valor);
  }

  // =================================
  // CRIAÇÃO SEGURA DAS CÉLULAS
  // =================================

  function criarCelula(valor) {

    const celula = document.createElement("td");

    celula.textContent = valor;

    return celula;
  }

  // =================================
  // EXIBIÇÃO DOS PRODUTOS
  // =================================

  function renderizarProdutos(produtos) {

    if (!tabelaProdutos || !contadorProdutos ||
        !mensagemVazia || !tabelaWrapper) {
      return;
    }

    tabelaProdutos.innerHTML = "";

    contadorProdutos.textContent =
      produtos.length === 1
        ? "1 produto"
        : produtos.length + " produtos";

    if (produtos.length === 0) {

      tabelaWrapper.hidden = true;
      mensagemVazia.hidden = false;

      const tituloVazio = mensagemVazia.querySelector("h3");
      const textoVazio = mensagemVazia.querySelector("p");

      if (tituloVazio) {
        tituloVazio.textContent = "Nenhum produto cadastrado";
      }

      if (textoVazio) {
        textoVazio.textContent =
          "Quando você cadastrar produtos no sistema, eles aparecerão aqui.";
      }

      return;
    }

    mensagemVazia.hidden = true;
    tabelaWrapper.hidden = false;

    const categorias = {
      bicicletas: "Bicicletas",
      pecas: "Peças",
      acessorios: "Acessórios",
      vestuario: "Vestuário",
      ferramentas: "Ferramentas",
      geral: "Outros"
    };

    produtos.forEach(function (produto) {

      const linha = document.createElement("tr");

      const nome = produto.nome || "Produto sem nome";

      const categoria =
        categorias[produto.categoria] || produto.categoria || "Outros";

      const preco = formatarPreco(produto.preco_centavos);

      const estoque = Number(produto.estoque || 0);

      const status = produto.ativo
        ? "Ativo"
        : "Inativo";

      linha.appendChild(criarCelula(nome));
      linha.appendChild(criarCelula(categoria));
      linha.appendChild(criarCelula(preco));
      linha.appendChild(criarCelula(String(estoque)));
      linha.appendChild(criarCelula(status));
      linha.appendChild(criarCelula("—"));

      tabelaProdutos.appendChild(linha);
    });
  }

  // =================================
  // MENSAGENS DE ERRO
  // =================================

  function mostrarErroProdutos(texto) {

    if (tabelaWrapper) {
      tabelaWrapper.hidden = true;
    }

    if (mensagemVazia) {

      mensagemVazia.hidden = false;

      const tituloVazio = mensagemVazia.querySelector("h3");
      const textoVazio = mensagemVazia.querySelector("p");

      if (tituloVazio) {
        tituloVazio.textContent = "Não foi possível carregar";
      }

      if (textoVazio) {
        textoVazio.textContent = texto;
      }
    }

    if (contadorProdutos) {
      contadorProdutos.textContent = "Indisponível";
    }
  }

  // Carrega os produtos ao abrir o painel.
  window.addEventListener(
    "help-admin-authorized",
    carregarProdutosSupabase
  );


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

      // Validação da fotografia.
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
        "Dados validados. O cadastro ainda não foi gravado. A gravação será integrada em uma próxima etapa.";

      mensagem.style.color = "#4ade80";

    });

  }

});
