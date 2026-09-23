//Enunciados
describe("PedidoService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    };

    service = new PedidoService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const pedidos = [{ id: 1, cliente: "Ana Souza", total: 10 }];
      mockRepository.findAll.mockReturnValue(pedidos);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(pedidos);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o pedido encontrado", () => {
      const pedidoMock = { id: 1, cliente: "Ana Souza", total: 10, status: "pendente" };
      mockRepository.findById.mockReturnValue(pedidoMock);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(pedidoMock);
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retornar null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(999)).toThrow("Pedido nao encontrado");
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("criar", () => {
    test("repassa dados para mockRepository.create e retorna o pedido criado", () => {
      const dadosPedido = {
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }]
      };
      const pedidoCriado = { id: 1, ...dadosPedido, status: "pendente", total: 10 };
      mockRepository.create.mockReturnValue(pedidoCriado);

      const resultado = service.criar(dadosPedido);

      expect(mockRepository.create).toHaveBeenCalledWith(dadosPedido);
      expect(resultado).toEqual(pedidoCriado);
    });

    test("propaga o erro quando o cliente estiver faltando", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Cliente e obrigatorio");
      });

      expect(() => service.criar({ itens: [{ nome: "Coxinha", precoUnitario: 5, quantidade: 2 }] })).toThrow("Cliente e obrigatorio");
    });

    test("propaga o erro quando a lista de itens estiver vazia", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("A lista de itens nao pode estar vazia");
      });

      expect(() => service.criar({ cliente: "Ana Souza", itens: [] })).toThrow("A lista de itens nao pode estar vazia");
    });

    test("propaga o erro quando algum item tiver preco ou quantidade invalidos", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Preco e quantidade devem ser maiores que zero");
      });

      const dadosInvalidos = {
        cliente: "Ana Souza",
        itens: [{ nome: "Coxinha", precoUnitario: 0, quantidade: -1 }]
      };

      expect(() => service.criar(dadosInvalidos)).toThrow("Preco e quantidade devem ser maiores que zero");
    });
  });

  describe("atualizarStatus", () => {
    test("chama mockRepository.findById e depois mockRepository.updateStatus quando o pedido existe", () => {
      const pedidoExistente = { id: 1, cliente: "Ana Souza", status: "pendente" };
      const pedidoAtualizado = { id: 1, cliente: "Ana Souza", status: "pago" };

      mockRepository.findById.mockReturnValue(pedidoExistente);
      mockRepository.updateStatus.mockReturnValue(pedidoAtualizado);

      const resultado = service.atualizarStatus(1, "pago");

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(1, "pago");
      expect(resultado).toEqual(pedidoAtualizado);
    });

    test("lanca erro 'Pedido nao encontrado' sem chamar mockRepository.updateStatus quando findById retornar null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizarStatus(999, "pago")).toThrow("Pedido nao encontrado");
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
      expect(mockRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo status for invalido", () => {
      mockRepository.findById.mockReturnValue({ id: 1, status: "pendente" });
      mockRepository.updateStatus.mockImplementation(() => {
        throw new Error("Status invalido");
      });

      expect(() => service.atualizarStatus(1, "entregue")).toThrow("Status invalido");
    });

    test("propaga o erro quando o pedido ja estiver cancelado", () => {
      mockRepository.findById.mockReturnValue({ id: 1, status: "cancelado" });
      mockRepository.updateStatus.mockImplementation(() => {
        throw new Error("Pedido cancelado nao pode ser alterado");
      });

      expect(() => service.atualizarStatus(1, "pago")).toThrow("Pedido cancelado nao pode ser alterado");
    });
  });

  describe("remover", () => {
    test("chama mockRepository.delete com o id correto quando o pedido existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("lanca erro 'Pedido nao encontrado' quando o repository retornar false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(999)).toThrow("Pedido nao encontrado");
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});