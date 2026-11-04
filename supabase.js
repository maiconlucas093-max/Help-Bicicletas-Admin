
/*
 * Conexão Supabase — HELP BICICLETAS
 */

(function () {
  "use strict";

  const SUPABASE_URL =
    "https://ikysrrmqcuurhfotziqi.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__oYLUzSk9j1C5ceWpdGn9Q_8RrYtF0z";

  if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error(
      "Biblioteca Supabase não carregada. Verifique o index.html."
    );
    return;
  }

  window.helpSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.info(
    "HELP BICICLETAS: conexão Supabase inicializada."
  );
})();
