
/*
 * Autenticação administrativa — HELP BICICLETAS
 */

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const supabase = window.helpSupabase;

  const telaLogin = document.getElementById("login-screen");
  const painel = document.getElementById("admin-app");
  const formulario = document.getElementById("login-form");
  const campoEmail = document.getElementById("login-email");
  const campoSenha = document.getElementById("login-password");
  const botaoLogin = document.getElementById("btn-login");
  const mensagem = document.getElementById("login-message");

  function mostrarMensagem(texto, erro) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? "#ed2027" : "#4ade80";
  }

  function mostrarLogin() {
    telaLogin.hidden = false;
    painel.hidden = true;
  }

  function liberarPainel() {
    telaLogin.hidden = true;
    painel.hidden = false;

    window.dispatchEvent(
      new Event("help-admin-authorized")
    );
  }

  async function verificarAdministrador() {
    const { data: usuarioData, error: usuarioErro } =
      await supabase.auth.getUser();

    if (usuarioErro || !usuarioData.user) {
      return false;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", usuarioData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar administrador:", error);
      throw new Error(
        "Não foi possível verificar sua autorização."
      );
    }

    return Boolean(data);
  }

  async function validarAcesso() {
    try {
      const autorizado = await verificarAdministrador();

      if (!autorizado) {
        await supabase.auth.signOut();
        mostrarLogin();
        mostrarMensagem(
          "Esta conta não possui autorização administrativa.",
          true
        );
        return false;
      }

      liberarPainel();
      return true;

    } catch (erro) {
      console.error(erro);
      mostrarLogin();
      mostrarMensagem(erro.message, true);
      return false;
    }
  }

  if (!supabase) {
    mostrarLogin();
    mostrarMensagem(
      "Não foi possível conectar ao sistema.",
      true
    );
    return;
  }

  mostrarLogin();

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    if (!email || !senha) {
      mostrarMensagem(
        "Informe seu e-mail e sua senha.",
        true
      );
      return;
    }

    botaoLogin.disabled = true;
    botaoLogin.textContent = "VERIFICANDO...";
    mostrarMensagem("Validando acesso...", false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (error) {
        throw error;
      }

      const autorizado = await validarAcesso();

      if (autorizado) {
        campoSenha.value = "";
      }

    } catch (erro) {
      console.error("Erro no login:", erro);
      mostrarLogin();
      mostrarMensagem(
        "Não foi possível entrar. Confira o e-mail e a senha.",
        true
      );
    } finally {
      botaoLogin.disabled = false;
      botaoLogin.textContent = "ENTRAR NO PAINEL";
    }
  });

  async function verificarSessaoExistente() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      mostrarLogin();
      mostrarMensagem(
        "Não foi possível verificar sua sessão.",
        true
      );
      return;
    }

    if (data.session) {
      await validarAcesso();
    } else {
      mostrarLogin();
    }
  }

  verificarSessaoExistente();
});
