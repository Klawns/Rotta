const EXACT_TEXT_REPLACEMENTS: Array<[from: string, to: string]> = [
  ["Plano nao encontrado.", "Plano não encontrado."],
  [
    "Seu plano nao foi encontrado. Entre em contato com o suporte.",
    "Seu plano não foi encontrado. Entre em contato com o suporte.",
  ],
  [
    "Seu periodo gratuito de 7 dias expirou. Assine para continuar.",
    "Seu período gratuito de 7 dias expirou. Assine para continuar.",
  ],
  [
    "Seu periodo gratuito expirou. Assine para continuar usando as funcionalidades do sistema.",
    "Seu período gratuito expirou. Assine para continuar usando as funcionalidades do sistema.",
  ],
  [
    "Sessao expirada. Faca login novamente.",
    "Sessão expirada. Faça login novamente.",
  ],
  [
    "Voce nao tem permissao para realizar esta acao.",
    "Você não tem permissão para realizar esta ação.",
  ],
  [
    "Nao foi possivel carregar o historico agora.",
    "Não foi possível carregar o histórico agora.",
  ],
  [
    "Nao foi possivel carregar os clientes.",
    "Não foi possível carregar os clientes.",
  ],
  ["Atualizando sugestoes...", "Atualizando sugestões..."],
];

const MOJIBAKE_REPLACEMENTS: Array<[from: string, to: string]> = [
  ["Ã¡", "á"],
  ["Ã ", "à"],
  ["Ã¢", "â"],
  ["Ã£", "ã"],
  ["Ã¤", "ä"],
  ["Ã©", "é"],
  ["Ãª", "ê"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ã´", "ô"],
  ["Ãµ", "õ"],
  ["Ã¶", "ö"],
  ["Ãº", "ú"],
  ["Ã¼", "ü"],
  ["Ã§", "ç"],
  ["Ã", "Á"],
  ["Ã€", "À"],
  ["Ã‚", "Â"],
  ["Ãƒ", "Ã"],
  ["ÃƒÂ£", "ã"],
  ["ÃƒÂ§", "ç"],
  ["ÃƒÂµ", "õ"],
  ["ÃƒÂ¡", "á"],
  ["ÃƒÂ©", "é"],
  ["ÃƒÂ­", "í"],
  ["ÃƒÂ³", "ó"],
  ["ÃƒÂº", "ú"],
  ["Ã‰", "É"],
  ["ÃŠ", "Ê"],
  ["ÃÍ", "Í"],
  ["Ã“", "Ó"],
  ["Ã”", "Ô"],
  ["Ã•", "Õ"],
  ["Ãš", "Ú"],
  ["Ã‡", "Ç"],
  ["Âº", "º"],
  ["Âª", "ª"],
  ["Â ", " "],
  ["â", "’"],
  ["â", "–"],
  ["â", "—"],
  ["�", ""],
];

function replaceAllOccurrences(
  input: string,
  replacements: Array<[string, string]>,
) {
  let next = input;

  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }

  return next;
}

export function normalizePtBrText(text: string) {
  const exactNormalized = replaceAllOccurrences(text, EXACT_TEXT_REPLACEMENTS);

  if (!/[ÃÂ�â]/.test(exactNormalized)) {
    return exactNormalized;
  }

  return replaceAllOccurrences(exactNormalized, MOJIBAKE_REPLACEMENTS);
}
