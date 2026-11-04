
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

    formulario.addEventListener("submit", async function (evento) {

      evento.preventDefault();

      if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
      }

      const nome = document.getElementById("produto-nome").value.trim();
      const categoria = document.getElementById("produto-categoria").value;
      const preco = Number(document.getElementById("produto-preco").value);
      const estoque = Number(document.getElementById("produto-estoque").value);
      const descricao = document.getElementById("produto-descricao").value.trim();

      const imagem = campoImagem && campoImagem.files.length > 0
        ? campoImagem.files[0]
        : null;

      if (
        !nome ||
        !categoria ||
        !Number.isFinite(preco) ||
        preco < 0 ||
        !Number.isInteger(estoque) ||
        estoque < 0
      ) {
        mensagem.textContent = "Confira os dados informados.";
        mensagem.style.color = "#ed2027";
        return;
      }

      if (imagem) {

        const formatosPermitidos = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];

        if (!formatosPermitidos.includes(imagem.type)) {
          mensagem.textContent = "Use uma imagem JPG, PNG ou WEBP.";
          mensagem.style.color = "#ed2027";
          return;
        }

        if (imagem.size > 5 * 1024 * 1024) {
          mensagem.textContent = "A imagem deve ter no máximo 5 MB.";
          mensagem.style.color = "#ed2027";
          return;
        }
      }

      const botaoSalvar = document.getElementById("btn-salvar-produto");
      let caminhoImagem = null;

      if (botaoSalvar) {
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = "SALVANDO...";
      }

      mensagem.textContent = "Salvando produto...";
      mensagem.style.color = "#a5a5a5";

      try {

        const supabase = window.helpSupabase;

        if (!supabase) {
          throw new Error("Conexão com Supabase não encontrada.");
        }

        let imagemUrl = null;

        // Envia a fotografia para o Storage.
        if (imagem) {

          const extensoes = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
          };

          const nomeArquivo =
            Date.now() + "-" +
            Math.random().toString(36).slice(2) +
            "." + extensoes[imagem.type];

          caminhoImagem = nomeArquivo;

          const { error: erroUpload } = await supabase
            .storage
            .from("produtos-help-bicicletas")
            .upload(caminhoImagem, imagem, {
              cacheControl: "3600",
              contentType: imagem.type,
              upsert: false
            });

          if (erroUpload) {
            throw erroUpload;
          }

          const { data: imagemPublica } = supabase
            .storage
            .from("produtos-help-bicicletas")
            .getPublicUrl(caminhoImagem);

          imagemUrl = imagemPublica.publicUrl;
        }

        // Grava os dados na tabela produtos.
        const { error: erroCadastro } = await supabase
          .from("produtos")
          .insert({
            nome: nome,
            descricao: descricao,
            categoria: categoria,
            preco_centavos: Math.round(preco * 100),
            imagem_url: imagemUrl,
            estoque: estoque,
            ativo: true
          });

        if (erroCadastro) {
          throw erroCadastro;
        }

        // Atualiza a lista com os dados salvos.
        await carregarProdutosSupabase();

        formulario.reset();

        mensagem.textContent =
          "Produto cadastrado com sucesso!";

        mensagem.style.color = "#4ade80";

      } catch (erro) {

        console.error("Erro ao cadastrar produto:", erro);

        // Remove a fotografia caso o cadastro no banco falhe.
        if (caminhoImagem) {

          const { error: erroRemocao } = await window.helpSupabase
            .storage
            .from("produtos-help-bicicletas")
            .remove([caminhoImagem]);

          if (erroRemocao) {
            console.error(
              "Não foi possível remover a fotografia:",
              erroRemocao
            );
          }
        }

        mensagem.textContent =
          "Não foi possível cadastrar. " +
          (erro.message || "Verifique a conexão e tente novamente.");

        mensagem.style.color = "#ed2027";

      } finally {

        if (botaoSalvar) {
          botaoSalvar.disabled = false;
          botaoSalvar.textContent = "Salvar produto";
        }
      }

    });

  }


});
