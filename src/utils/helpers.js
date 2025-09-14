const crypto = require("crypto");

// Função para gerar string aleatória
const gerarStringAleatoria = (tamanho = 32) => {
  return crypto.randomBytes(tamanho).toString("hex");
};

// Função para gerar código de confirmação
const gerarCodigoConfirmacao = (tamanho = 6) => {
  return Math.floor(Math.random() * Math.pow(10, tamanho))
    .toString()
    .padStart(tamanho, "0");
};

// Função para formatar data para exibição
const formatarData = (data, formato = "DD/MM/YYYY HH:mm") => {
  if (!data) return null;

  const d = new Date(data);
  const dia = d.getDate().toString().padStart(2, "0");
  const mes = (d.getMonth() + 1).toString().padStart(2, "0");
  const ano = d.getFullYear();
  const hora = d.getHours().toString().padStart(2, "0");
  const minuto = d.getMinutes().toString().padStart(2, "0");

  return formato
    .replace("DD", dia)
    .replace("MM", mes)
    .replace("YYYY", ano)
    .replace("HH", hora)
    .replace("mm", minuto);
};

// Função para calcular tempo relativo (ex: "há 2 horas")
const tempoRelativo = (data) => {
  if (!data) return null;

  const agora = new Date();
  const dataObj = new Date(data);
  const diffMs = agora - dataObj;
  const diffSegundos = Math.floor(diffMs / 1000);
  const diffMinutos = Math.floor(diffSegundos / 60);
  const diffHoras = Math.floor(diffMinutos / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffSegundos < 60) return "agora mesmo";
  if (diffMinutos < 60)
    return `há ${diffMinutos} minuto${diffMinutos > 1 ? "s" : ""}`;
  if (diffHoras < 24) return `há ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  if (diffDias < 7) return `há ${diffDias} dia${diffDias > 1 ? "s" : ""}`;

  return formatarData(data, "DD/MM/YYYY");
};

// Função para sanitizar string (remover caracteres especiais)
const sanitizarString = (str) => {
  if (!str) return "";
  return str.replace(/[<>]/g, "").trim();
};

// Função para truncar texto
const truncarTexto = (texto, tamanho = 100, sufixo = "...") => {
  if (!texto || texto.length <= tamanho) return texto;
  return texto.substring(0, tamanho) + sufixo;
};

// Função para validar email institucional
const validarEmailInstitucional = (email) => {
  const dominiosValidos = ["@alunos.unisanta.br", "@edu.alunos.unisanta.br"];
  return dominiosValidos.some((dominio) => email.endsWith(dominio));
};

// Função para gerar slug a partir de string
const gerarSlug = (texto) => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim();
};

// Função para capitalizar primeira letra
const capitalizar = (texto) => {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

// Função para capitalizar cada palavra
const capitalizarPalavras = (texto) => {
  if (!texto) return "";
  return texto
    .split(" ")
    .map((palavra) => capitalizar(palavra))
    .join(" ");
};

// Função para gerar hash simples
const gerarHash = (texto) => {
  return crypto.createHash("md5").update(texto).digest("hex");
};

// Função para verificar se string é vazia ou nula
const estaVazio = (valor) => {
  return !valor || valor.toString().trim() === "";
};

// Função para remover acentos
const removerAcentos = (texto) => {
  if (!texto) return "";
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Função para gerar iniciais do nome
const gerarIniciais = (nome) => {
  if (!nome) return "";
  return nome
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

// Função para validar URL
const validarURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Função para extrair domínio de email
const extrairDominioEmail = (email) => {
  if (!email || !email.includes("@")) return null;
  return email.split("@")[1];
};

// Função para gerar cor baseada em string
const gerarCor = (texto) => {
  if (!texto) return "#6B7280";

  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }

  const cor = Math.abs(hash).toString(16).substring(0, 6);
  return `#${cor.padEnd(6, "0")}`;
};

// Função para calcular idade
const calcularIdade = (dataNascimento) => {
  if (!dataNascimento) return null;

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const mesAtual = hoje.getMonth();
  const mesNascimento = nascimento.getMonth();

  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
  ) {
    idade--;
  }

  return idade;
};

// Função para formatar número de telefone
const formatarTelefone = (telefone) => {
  if (!telefone) return "";

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(
      2,
      7
    )}-${numeros.substring(7)}`;
  } else if (numeros.length === 10) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(
      2,
      6
    )}-${numeros.substring(6)}`;
  }

  return telefone;
};

// Função para gerar array de anos (útil para selects)
const gerarArrayAnos = (inicio, fim) => {
  const anos = [];
  for (let ano = inicio; ano <= fim; ano++) {
    anos.push(ano);
  }
  return anos;
};

// Função para verificar se é fim de semana
const ehFimDeSemana = (data = new Date()) => {
  const dia = data.getDay();
  return dia === 0 || dia === 6; // Domingo ou Sábado
};

// Função para adicionar dias a uma data
const adicionarDias = (data, dias) => {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
};

// Função para obter início do dia
const inicioDoDia = (data = new Date()) => {
  const resultado = new Date(data);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
};

// Função para obter fim do dia
const fimDoDia = (data = new Date()) => {
  const resultado = new Date(data);
  resultado.setHours(23, 59, 59, 999);
  return resultado;
};

module.exports = {
  gerarStringAleatoria,
  gerarCodigoConfirmacao,
  formatarData,
  tempoRelativo,
  sanitizarString,
  truncarTexto,
  validarEmailInstitucional,
  gerarSlug,
  capitalizar,
  capitalizarPalavras,
  gerarHash,
  estaVazio,
  removerAcentos,
  gerarIniciais,
  validarURL,
  extrairDominioEmail,
  gerarCor,
  calcularIdade,
  formatarTelefone,
  gerarArrayAnos,
  ehFimDeSemana,
  adicionarDias,
  inicioDoDia,
  fimDoDia,
};
