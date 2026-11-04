
document.addEventListener("DOMContentLoaded", function () {

  // =================================
  // ELEMENTOS DA TELA DE PRODUTOS
  // =================================

  const indicador = document.querySelector(".status");
  const contadorProdutos = document.getElementById("product-count");
  const mensagemVazia = document.getElementById("product-empty");
  const tabelaWrapper = document.getElementById("product-table-wrapper");
  const tabelaProdutos = document.getElementById("product-table-body");
  const dashboardProdutos = document.getElementById("dashboard-produtos");
  const dashboardEstoque = document.getElementById("dashboard-estoque");
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
  // Mantém os produtos carregados para permitir a edição.
  let produtosCarregados = [];

  function renderizarProdutos(produtos) {

    if (!tabelaProdutos || !contadorProdutos ||
        !mensagemVazia || !tabelaWrapper) {
      return;
    }

    tabelaProdutos.innerHTML = "";
        produtosCarregados = produtos;
    // Atualiza os indicadores da tela inicial.
    const totalProdutosAtivos = produtos.filter(function(produto) {
      return produto.ativo === true;
    }).length;
    
    const totalItensEstoque = produtos.reduce(function(total, produto) {
      return total + Number(produto.estoque || 0);
    }, 0);
    
    if (dashboardProdutos) {
      dashboardProdutos.textContent = totalProdutosAtivos;
    }
    
    if (dashboardEstoque) {
      dashboardEstoque.textContent = totalItensEstoque;
    }
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
      
      const celulaAcoes = document.createElement("td");
      const botaoEditar = document.createElement("button");
      
      botaoEditar.type = "button";
      botaoEditar.textContent = "EDITAR";
      botaoEditar.dataset.editId = produto.id;
      botaoEditar.style.background = "#ed2027";
      botaoEditar.style.color = "#ffffff";
      botaoEditar.style.border = "0";
      botaoEditar.style.borderRadius = "5px";
      botaoEditar.style.padding = "8px 12px";
      botaoEditar.style.cursor = "pointer";
      
      celulaAcoes.appendChild(botaoEditar);
      linha.appendChild(celulaAcoes);
      
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
    // Identifica o produto que está sendo editado.
  let produtoEmEdicaoId = null;
  
  const tituloFormulario =
    document.getElementById("product-form-title");

  

    function limparModoEdicao() {
    produtoEmEdicaoId = null;
    
    if (tituloFormulario) {
      tituloFormulario.textContent = "Cadastrar produto";
    }
    
    const botaoSalvar = document.getElementById("btn-salvar-produto");
    
    if (botaoSalvar) {
      botaoSalvar.disabled = false;
      botaoSalvar.textContent = "Salvar produto";
    }
  }
  
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
    
    if (formulario) {
      formulario.reset();
    }
    
    limparModoEdicao();
    
    if (mensagem) {
      mensagem.textContent = "";
    }
  }
  
  if (botaoNovoProduto) {
    botaoNovoProduto.addEventListener("click", function() {
      if (formulario) {
        formulario.reset();
      }
      
      limparModoEdicao();
      abrirFormulario();
    });
  }
  
  if (botaoFechar) {
    botaoFechar.addEventListener("click", fecharFormulario);
  }
  
  if (botaoCancelar) {
    botaoCancelar.addEventListener("click", fecharFormulario);
  }
  // =================================
  // CARREGAR PRODUTO PARA EDIÇÃO
  // =================================
  
  if (tabelaProdutos) {
    tabelaProdutos.addEventListener("click", function(evento) {
      
      const botao = evento.target.closest("[data-edit-id]");
      
      if (!botao) return;
      
      const produto = produtosCarregados.find(function(item) {
        return item.id === botao.dataset.editId;
      });
      
      if (!produto) {
        console.error("Produto não encontrado para edição.");
        return;
      }
      
      produtoEmEdicaoId = produto.id;
      
      document.getElementById("produto-nome").value =
        produto.nome || "";
      
      document.getElementById("produto-categoria").value =
        produto.categoria || "";
      
      document.getElementById("produto-preco").value =
        (Number(produto.preco_centavos) / 100).toFixed(2);
      
      document.getElementById("produto-estoque").value =
        Number(produto.estoque || 0);
      
      document.getElementById("produto-descricao").value =
        produto.descricao || "";
      
      campoImagem.value = "";
      
      if (tituloFormulario) {
        tituloFormulario.textContent = "Editar produto";
      }
      
      abrirFormulario();
      
            mensagem.textContent =
        "Produto carregado para edição.";
      
      mensagem.style.color = "#a5a5a5";
      
      const botaoSalvar = document.getElementById("btn-salvar-produto");
      
      if (botaoSalvar) {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = "Atualizar produto";
      }
      

    });
  }

  // =================================
  // VALIDAÇÃO DO CADASTRO
  // =================================

  
    if (formulario) {
    
    formulario.addEventListener("submit", async function(evento) {
      
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
      
      const imagem = campoImagem && campoImagem.files.length > 0 ?
        campoImagem.files[0] :
        null;
      
      const estavaEditando = Boolean(produtoEmEdicaoId);
      
      const produtoAtual = estavaEditando ?
        produtosCarregados.find(function(produto) {
          return produto.id === produtoEmEdicaoId;
        }) :
        null;
      
      if (estavaEditando && !produtoAtual) {
        mensagem.textContent = "Não foi possível localizar o produto.";
        mensagem.style.color = "#ed2027";
        return;
      }
      
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
      
      mensagem.textContent = estavaEditando ?
        "Atualizando produto..." :
        "Salvando produto...";
      
      mensagem.style.color = "#a5a5a5";
      
      try {
        
        const supabase = window.helpSupabase;
        
        if (!supabase) {
          throw new Error("Conexão com Supabase não encontrada.");
        }
        
        // Mantém a fotografia anterior durante a edição.
        let imagemUrl = produtoAtual ?
          produtoAtual.imagem_url :
          null;
        
        // Envia uma nova fotografia, se ela foi selecionada.
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
          
          const { error: erroUpload } = await supabase
            .storage
            .from("produtos-help-bicicletas")
            .upload(nomeArquivo, imagem, {
              cacheControl: "3600",
              contentType: imagem.type,
              upsert: false
            });
          
          if (erroUpload) {
            throw erroUpload;
          }
          
          caminhoImagem = nomeArquivo;
          
          const { data: imagemPublica } = supabase
            .storage
            .from("produtos-help-bicicletas")
            .getPublicUrl(nomeArquivo);
          
          imagemUrl = imagemPublica.publicUrl;
        }
        
        // Prepara os dados do produto.
        const dadosProduto = {
          nome: nome,
          descricao: descricao,
          categoria: categoria,
          preco_centavos: Math.round(preco * 100),
          imagem_url: imagemUrl,
          estoque: estoque
        };
        
        // Atualiza o produto existente ou cadastra um novo.
        if (estavaEditando) {
          
          const { data, error: erroAtualizacao } = await supabase
            .from("produtos")
            .update(dadosProduto)
            .eq("id", produtoEmEdicaoId)
            .select("id");
          
          if (erroAtualizacao) {
            throw erroAtualizacao;
          }
          
          if (!data || data.length === 0) {
            throw new Error(
              "Nenhum produto foi atualizado. Verifique sua autorização."
            );
          }
          
        } else {
          
          const { error: erroCadastro } = await supabase
            .from("produtos")
            .insert({
              ...dadosProduto,
              ativo: true
            });
          
          if (erroCadastro) {
            throw erroCadastro;
          }
        }
        
        // A fotografia agora está vinculada ao registro salvo.
        caminhoImagem = null;
        
        // Atualiza a lista de produtos do painel.
        await carregarProdutosSupabase();
        
        formulario.reset();
        limparModoEdicao();
        
        mensagem.textContent = estavaEditando ?
          "Produto atualizado com sucesso!" :
          "Produto cadastrado com sucesso!";
        
        mensagem.style.color = "#4ade80";
        
      } catch (erro) {
        
        console.error("Erro ao salvar produto:", erro);
        
        // Remove uma nova fotografia se o salvamento falhar.
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
          "Não foi possível salvar. " +
          (erro.message || "Verifique a conexão e tente novamente.");
        
        mensagem.style.color = "#ed2027";
        
      } finally {
        
        if (botaoSalvar) {
          botaoSalvar.disabled = false;
          
          botaoSalvar.textContent = produtoEmEdicaoId ?
            "Atualizar produto" :
            "Salvar produto";
        }
      }
      
    });
    
  }


});
