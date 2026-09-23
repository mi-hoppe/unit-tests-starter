const {soma, subtrai, multiplica, divide, ehPar, raiz, media} = require("./calculadora");

describe("soma", () => {
  test("Soma com dois números positivos", () => {
    expect(soma(2, 3)).toBe(5);
  });
});

describe("raiz", () => {
  test("Calcula a raiz de número não exato com precisão", () => {
    expect(raiz(2)).toBeCloseTo(1.414);
  });

  test("Lançar erro para número negativo", () => {
    expect(() => raiz(-4)).toThrow(
      "Nao e possivel calcular raiz de numero negativo"
    );
  });
});

describe("subtrai", () => {
  test("Subtração de dois números positivos", () => {
    expect(subtrai(3, 2)).toBe(1);
  });
});

describe("multiplica", () => {
  test("Deve retornar o produto correto de dois numeros", () => {
    expect(multiplica(3, 4)).toBe(12);
  });

  test("Deve retornar 0 quando um dos fatores for 0", () => {
    expect(multiplica(5, 0)).toBe(0);
    expect(multiplica(0, 5)).toBe(0);
  });

  test("O resultado deve ser maior do que cada um dos fatores individualmente quando ambos forem maiores que 1", () => {
    const fatorA = 3;
    const fatorB = 4;
    const resultado = multiplica(fatorA, fatorB);

    expect(resultado).toBeGreaterThan(fatorA);
    expect(resultado).toBeGreaterThan(fatorB);
  });
});

describe("divide", () => {
  test("Retornar o resultado correto da divisao", () => {
    expect(divide(10, 2)).toBe(5);
  });

  test("Nao e possivel dividir por zero quando b for 0", () => {
    expect(() => divide(10, 0)).toThrow(
      "Nao e possivel dividir por zero"
    );
  });
});

describe("ehPar", () => {
  test("Retornar um valor verdadeiro para numero par", () => {
    expect(ehPar(4)).toBeTruthy();
  });

  test("Retornar um valor falso para numero impar", () => {
    expect(ehPar(5)).toBeFalsy();
  });
});

describe("media", () => {
  test("Calcular corretamente a media de uma lista de inteiros", () => {
    expect(media([2, 4, 6, 8])).toBe(5);
  });

  test("Calcular corretamente a media quando o resultado for decimal", () => {
    expect(media([1, 2, 4])).toBeCloseTo(2.33, 2);
  });

  test("Lancar erro quando a lista estiver vazia", () => {
    expect(() => media([])).toThrow();
  });

  test("Deve lancar erro quando o argumento nao for um array", () => {
    expect(() => media("nao e um array")).toThrow();
    expect(() => media(123)).toThrow();
  });
});