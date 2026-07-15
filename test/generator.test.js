"use strict";

const assert = require("assert");
const g = require("../generator.js");

// Vetores conhecidos
// CPF 111.444.777-35
assert.strictEqual(g.cpfCheckDigit([1, 1, 1, 4, 4, 4, 7, 7, 7]), 3);
assert.strictEqual(g.cpfCheckDigit([1, 1, 1, 4, 4, 4, 7, 7, 7, 3]), 5);
// CNPJ 11.222.333/0001-81
assert.strictEqual(g.cnpjCheckDigit("112223330001"), 8);
assert.strictEqual(g.cnpjCheckDigit("1122233300018"), 1);
// Exemplo oficial da Receita/SERPRO para CNPJ alfanumérico: 12.ABC.345/01DE-35
assert.strictEqual(g.cnpjCheckDigit("12ABC34501DE"), 3);
assert.strictEqual(g.cnpjCheckDigit("12ABC34501DE3"), 5);

// Máscaras
assert.strictEqual(g.maskCpf("11144477735"), "111.444.777-35");
assert.strictEqual(g.maskCnpj("11222333000181"), "11.222.333/0001-81");
assert.strictEqual(g.maskCnpj("12ABC34501DE35"), "12.ABC.345/01DE-35");

// 1000 documentos gerados de cada tipo, revalidados
for (let i = 0; i < 1000; i++) {
  const cpf = g.generateCpf();
  assert.match(cpf, /^\d{11}$/, cpf);
  const d = cpf.split("").map(Number);
  assert.strictEqual(g.cpfCheckDigit(d.slice(0, 9)), d[9], "CPF DV1: " + cpf);
  assert.strictEqual(g.cpfCheckDigit(d.slice(0, 10)), d[10], "CPF DV2: " + cpf);

  const cnpj = g.generateCnpj();
  assert.match(cnpj, /^\d{8}0001\d{2}$/, cnpj);
  assert.strictEqual(String(g.cnpjCheckDigit(cnpj.slice(0, 12))), cnpj[12], "CNPJ DV1: " + cnpj);
  assert.strictEqual(String(g.cnpjCheckDigit(cnpj.slice(0, 13))), cnpj[13], "CNPJ DV2: " + cnpj);

  const alpha = g.generateCnpjAlpha();
  assert.match(alpha, /^[0-9A-Z]{8}0001\d{2}$/, alpha);
  assert.ok(/[A-Z]/.test(alpha.slice(0, 8)), "raiz sem letra: " + alpha);
  assert.strictEqual(String(g.cnpjCheckDigit(alpha.slice(0, 12))), alpha[12], "CNPJ alfa DV1: " + alpha);
  assert.strictEqual(String(g.cnpjCheckDigit(alpha.slice(0, 13))), alpha[13], "CNPJ alfa DV2: " + alpha);
}

// ---- Novos documentos ----

// Vetores calculados manualmente
// CNH base 123456789: DV1 => soma 165 % 11 = 0; DV2 => soma 285 % 11 = 10 => 0
assert.strictEqual(g.cnhCheckDigits("123456789"), "00");
// PIS base 1234567890: soma 231 % 11 = 0 => DV = 11 => 0
assert.strictEqual(g.pisCheckDigit("1234567890"), 0);
// RENAVAM base 1234567890: soma 231, (231*10) % 11 = 0 => DV 0
assert.strictEqual(g.renavamCheckDigit("1234567890"), 0);
// RG base 12345678: soma 240 % 11 = 9 => DV 2
assert.strictEqual(g.rgCheckDigit("12345678"), "2");
// RG base 60000000: soma 12 % 11 = 1 => DV 10 => "X"
assert.strictEqual(g.rgCheckDigit("60000000"), "X");
// Título base 12345678 UF 03 (RJ): DV1 = 240 % 11 = 9; DV2 = (0*7+3*8+9*9) % 11 = 6
assert.strictEqual(g.tituloDigit([1, 2, 3, 4, 5, 6, 7, 8], [2, 3, 4, 5, 6, 7, 8, 9], "03"), 9);
assert.strictEqual(g.tituloDigit([0, 3, 9], [7, 8, 9], "03"), 6);
// Exceção SP/MG: resto 0 vira 1 em SP (01), permanece 0 nas demais UFs
assert.strictEqual(g.tituloDigit([0, 0, 0, 0, 0, 0, 0, 0], [2, 3, 4, 5, 6, 7, 8, 9], "01"), 1);
assert.strictEqual(g.tituloDigit([0, 0, 0, 0, 0, 0, 0, 0], [2, 3, 4, 5, 6, 7, 8, 9], "03"), 0);

// Máscaras dos novos documentos
assert.strictEqual(g.maskPis("12345678900"), "123.45678.90-0");
assert.strictEqual(g.maskRg("123456782"), "12.345.678-2");
assert.strictEqual(g.maskRg("60000000X"), "60.000.000-X");
assert.strictEqual(g.maskTitulo("123456780396"), "1234 5678 0396");
assert.strictEqual(g.maskNone("12345678900"), "12345678900");

// 1000 documentos gerados de cada novo tipo, revalidados
for (let i = 0; i < 1000; i++) {
  const cnh = g.generateCnh();
  assert.match(cnh, /^\d{11}$/, cnh);
  assert.strictEqual(g.cnhCheckDigits(cnh.slice(0, 9)), cnh.slice(9), "CNH: " + cnh);

  const pis = g.generatePis();
  assert.match(pis, /^\d{11}$/, pis);
  assert.strictEqual(String(g.pisCheckDigit(pis.slice(0, 10))), pis[10], "PIS: " + pis);

  const renavam = g.generateRenavam();
  assert.match(renavam, /^[1-9]\d{10}$/, renavam);
  assert.strictEqual(String(g.renavamCheckDigit(renavam.slice(0, 10))), renavam[10], "RENAVAM: " + renavam);

  const rg = g.generateRg();
  assert.match(rg, /^[1-9]\d{7}[\dX]$/, rg);
  assert.strictEqual(g.rgCheckDigit(rg.slice(0, 8)), rg[8], "RG: " + rg);

  const titulo = g.generateTitulo();
  assert.match(titulo, /^\d{12}$/, titulo);
  const uf = titulo.slice(8, 10);
  assert.ok(Number(uf) >= 1 && Number(uf) <= 28, "UF invalida: " + titulo);
  const dv1 = g.tituloDigit(titulo.slice(0, 8).split("").map(Number), [2, 3, 4, 5, 6, 7, 8, 9], uf);
  assert.strictEqual(String(dv1), titulo[10], "Titulo DV1: " + titulo);
  const dv2 = g.tituloDigit([Number(uf[0]), Number(uf[1]), dv1], [7, 8, 9], uf);
  assert.strictEqual(String(dv2), titulo[11], "Titulo DV2: " + titulo);
}

console.log("OK - todos os testes passaram");
console.log("Amostras:");
console.log("  CPF:", g.maskCpf(g.generateCpf()));
console.log("  CNPJ:", g.maskCnpj(g.generateCnpj()));
console.log("  CNPJ alfanumerico:", g.maskCnpj(g.generateCnpjAlpha()));
console.log("  CNH:", g.generateCnh());
console.log("  PIS/PASEP:", g.maskPis(g.generatePis()));
console.log("  RENAVAM:", g.generateRenavam());
console.log("  RG:", g.maskRg(g.generateRg()));
console.log("  Titulo de Eleitor:", g.maskTitulo(g.generateTitulo()));
