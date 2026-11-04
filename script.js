
document.addEventListener("DOMContentLoaded", function () {

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

    // Esconde todas as páginas
    paginas.forEach(function (pagina) {
      pagina.classList.remove("active");
    });

    // Mostra a página escolhida
    paginaSelecionada.classList.add("active");

    // Atualiza o botão selecionado
    botoesMenu.forEach(function (botao) {
      botao.classList.toggle(
        "active",
        botao.dataset.page === nomePagina
      );
    });

    // Atualiza o título superior
    if (titulo) {
      titulo.textContent = titulos[nomePagina] || "Painel administrativo";
    }

    // Volta a tela para o início da página
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Navegação pelo menu lateral
  botoesMenu.forEach(function (botao) {

    botao.addEventListener("click", function () {
      abrirPagina(botao.dataset.page);
    });

  });

  // Navegação pelos cartões de acesso rápido
  atalhos.forEach(function (atalho) {

    atalho.addEventListener("click", function () {
      abrirPagina(atalho.dataset.open);
    });

  });

});
