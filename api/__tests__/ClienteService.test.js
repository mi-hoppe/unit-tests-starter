const ClienteService = require("../services/ClienteService");

describe("ClienteService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ClienteService(mockRepository);
  });

  describe("buscarPorId", () => {
    test("retorna o cliente quando ele existe", () => {
      const cliente = {
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      };

      mockRepository.findById.mockReturnValue(cliente);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(cliente);
    });

    test("lanca erro 'Cliente nao encontrado' quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(99)).toThrow("Cliente nao encontrado");
    });
  });

  describe("criar", () => {
    test("envia os dados para o repository e retorna o cliente criado", () => {
      const dados = {
        nome: "Carlos Silva",
        email: "carlos@email.com",
      };

      const clienteCriado = {
        id: 3,
        ...dados,
      };

      mockRepository.create.mockReturnValue(clienteCriado);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(clienteCriado);
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() =>
        service.criar({
          nome: "Outra Pessoa",
          email: "ana@email.com",
        })
      ).toThrow("Email ja cadastrado");
    });

    test("propaga o erro quando nome ou email nao forem informados", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Nome e email sao obrigatorios");
      });

      expect(() =>
        service.criar({
          nome: "",
          email: "",
        })
      ).toThrow("Nome e email sao obrigatorios");
    });
  });

  describe("atualizar", () => {
    test("atualiza o cliente quando ele existe", () => {
      const clienteExistente = {
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      };

      const dadosAtualizados = {
        nome: "Ana Silva",
        email: "ana.silva@email.com",
      };

      const clienteAtualizado = {
        id: 1,
        ...dadosAtualizados,
      };

      mockRepository.findById.mockReturnValue(clienteExistente);
      mockRepository.update.mockReturnValue(clienteAtualizado);

      const resultado = service.atualizar(1, dadosAtualizados);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(
        1,
        dadosAtualizados
      );
      expect(resultado).toEqual(clienteAtualizado);
    });

    test("lanca erro 'Cliente nao encontrado' quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() =>
        service.atualizar(99, {
          nome: "Novo Nome",
          email: "novo@email.com",
        })
      ).toThrow("Cliente nao encontrado");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      mockRepository.findById.mockReturnValue({
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      });

      mockRepository.update.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() =>
        service.atualizar(1, {
          email: "bruno@email.com",
        })
      ).toThrow("Email ja cadastrado");
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o cliente existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(99)).toThrow("Cliente nao encontrado");
    });
  });
});