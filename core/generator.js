"use strict";

/*
 * Geração de CPF, CNPJ numérico e CNPJ alfanumérico (Receita Federal / SERPRO).
 * CNPJ alfanumérico: valor de cada caractere = código ASCII - 48
 * ('0'-'9' => 0-9, 'A'-'Z' => 17-42). Dígitos verificadores sempre numéricos,
 * calculados por módulo 11 com os mesmos pesos do CNPJ tradicional.
 */

const CNPJ_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomDigit() {
  return Math.floor(Math.random() * 10);
}

function charValue(ch) {
  return ch.charCodeAt(0) - 48;
}

// digits: array de números. Pesos decrescem de (length + 1) até 2.
function cpfCheckDigit(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (digits.length + 1 - i);
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

// chars: string de 12 (DV1) ou 13 (DV2) caracteres alfanuméricos.
function cnpjCheckDigit(chars) {
  const weights =
    chars.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < chars.length; i++) {
    sum += charValue(chars[i]) * weights[i];
  }
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function generateCpf() {
  let digits;
  do {
    digits = Array.from({ length: 9 }, randomDigit);
  } while (digits.every((d) => d === digits[0]));
  digits.push(cpfCheckDigit(digits));
  digits.push(cpfCheckDigit(digits));
  return digits.join("");
}

function withCnpjCheckDigits(base12) {
  const dv1 = cnpjCheckDigit(base12);
  const dv2 = cnpjCheckDigit(base12 + dv1);
  return base12 + String(dv1) + String(dv2);
}

function generateCnpj() {
  let root = "";
  for (let i = 0; i < 8; i++) {
    root += randomDigit();
  }
  return withCnpjCheckDigits(root + "0001");
}

function generateCnpjAlpha() {
  let root;
  do {
    root = "";
    for (let i = 0; i < 8; i++) {
      root += CNPJ_ALPHABET[Math.floor(Math.random() * CNPJ_ALPHABET.length)];
    }
  } while (!/[A-Z]/.test(root)); // garante pelo menos uma letra na raiz
  return withCnpjCheckDigits(root + "0001");
}

/*
 * CNH (algoritmo DENATRAN): 9 dígitos + 2 DVs módulo 11.
 * DV1: pesos 9..1. Se resto >= 10, DV1 = 0 e aplica-se desconto 2 no DV2.
 * DV2: pesos 1..9, menos o desconto. Combinações que gerariam DV2 negativo
 * são descartadas na geração (validadores divergem nesse caso raro).
 */
function cnhCheckDigits(base) {
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += Number(base[i]) * (9 - i);
  }
  let discount = 0;
  let dv1 = sum1 % 11;
  if (dv1 >= 10) {
    dv1 = 0;
    discount = 2;
  }
  let sum2 = 0;
  for (let i = 0; i < 9; i++) {
    sum2 += Number(base[i]) * (i + 1);
  }
  const rest2 = sum2 % 11;
  const dv2 = rest2 >= 10 ? 0 : rest2 - discount;
  if (dv2 < 0) {
    return null;
  }
  return String(dv1) + String(dv2);
}

function generateCnh() {
  for (;;) {
    let base = "";
    for (let i = 0; i < 9; i++) {
      base += randomDigit();
    }
    if (/^(\d)\1{8}$/.test(base)) {
      continue;
    }
    const dvs = cnhCheckDigits(base);
    if (dvs !== null) {
      return base + dvs;
    }
  }
}

// PIS/PASEP (NIS): 10 dígitos + 1 DV módulo 11, pesos 3,2,9,8,7,6,5,4,3,2.
function pisCheckDigit(base) {
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(base[i]) * weights[i];
  }
  const dv = 11 - (sum % 11);
  return dv >= 10 ? 0 : dv;
}

function generatePis() {
  let base;
  do {
    base = "";
    for (let i = 0; i < 10; i++) {
      base += randomDigit();
    }
  } while (/^0+$/.test(base));
  return base + pisCheckDigit(base);
}

// RENAVAM: 10 dígitos + 1 DV. Dígitos invertidos, pesos ciclando 2..9,
// DV = (soma * 10) % 11, sendo 10 => 0.
function renavamCheckDigit(base) {
  const reversed = base.split("").reverse();
  let sum = 0;
  let weight = 2;
  for (let i = 0; i < 10; i++) {
    sum += Number(reversed[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const dv = (sum * 10) % 11;
  return dv === 10 ? 0 : dv;
}

function generateRenavam() {
  let base = String(1 + Math.floor(Math.random() * 9));
  for (let i = 0; i < 9; i++) {
    base += randomDigit();
  }
  return base + renavamCheckDigit(base);
}

/*
 * RG padrão SSP-SP (não há padrão nacional): 8 dígitos + 1 DV módulo 11,
 * pesos 2..9. DV 10 é representado pela letra "X".
 */
function rgCheckDigit(base) {
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += Number(base[i]) * (i + 2);
  }
  const dv = (11 - (sum % 11)) % 11;
  return dv === 10 ? "X" : String(dv);
}

function generateRg() {
  let base = String(1 + Math.floor(Math.random() * 9));
  for (let i = 0; i < 7; i++) {
    base += randomDigit();
  }
  return base + rgCheckDigit(base);
}

/*
 * Título de Eleitor: 8 dígitos sequenciais + 2 dígitos de UF (01..28) + 2 DVs.
 * DV = soma ponderada % 11; resto 10 => 0; resto 0 em SP (01) ou MG (02) => 1.
 * DV1: pesos 2..9 sobre os 8 primeiros. DV2: pesos 7,8,9 sobre [uf1, uf2, dv1].
 */
function tituloDigit(values, weights, ufCode) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * weights[i];
  }
  const rest = sum % 11;
  if (rest === 10) {
    return 0;
  }
  if (rest === 0 && (ufCode === "01" || ufCode === "02")) {
    return 1;
  }
  return rest;
}

function generateTitulo() {
  let base = "";
  for (let i = 0; i < 8; i++) {
    base += randomDigit();
  }
  const uf = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  const dv1 = tituloDigit(base.split("").map(Number), [2, 3, 4, 5, 6, 7, 8, 9], uf);
  const dv2 = tituloDigit([Number(uf[0]), Number(uf[1]), dv1], [7, 8, 9], uf);
  return base + uf + String(dv1) + String(dv2);
}

function maskCpf(value) {
  return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function maskCnpj(value) {
  return value.replace(
    /^([0-9A-Z]{2})([0-9A-Z]{3})([0-9A-Z]{3})([0-9A-Z]{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function maskPis(value) {
  return value.replace(/^(\d{3})(\d{5})(\d{2})(\d)$/, "$1.$2.$3-$4");
}

function maskRg(value) {
  return value.replace(/^(\d{2})(\d{3})(\d{3})([\dX])$/, "$1.$2.$3-$4");
}

function maskTitulo(value) {
  return value.replace(/^(\d{4})(\d{4})(\d{4})$/, "$1 $2 $3");
}

// CNH e RENAVAM não têm máscara oficial de pontuação.
function maskNone(value) {
  return value;
}

// Export para testes em Node; no Firefox as funções ficam no escopo do background.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateCpf,
    generateCnpj,
    generateCnpjAlpha,
    generateCnh,
    generatePis,
    generateRenavam,
    generateRg,
    generateTitulo,
    cpfCheckDigit,
    cnpjCheckDigit,
    cnhCheckDigits,
    pisCheckDigit,
    renavamCheckDigit,
    rgCheckDigit,
    tituloDigit,
    maskCpf,
    maskCnpj,
    maskPis,
    maskRg,
    maskTitulo,
    maskNone,
  };
}
