//Enunciados
describe('API /pedidos (integracao com supertest)', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /pedidos', () => {
    test('retorna 200 e um array com os pedidos iniciais', async () => {
      const res = await request(app).get('/pedidos');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /pedidos/:id', () => {
    test('retorna 200 e o pedido quando o id existe', async () => {
      const res = await request(app).get('/pedidos/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('cliente');
      expect(res.body).toHaveProperty('itens');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('total');
    });

    test('retorna 404 com mensagem de erro quando o pedido nao existe', async () => {
      const res = await request(app).get('/pedidos/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('POST /pedidos', () => {
    test('retorna 201 e o pedido criado com o total calculado corretamente', async () => {
      const novoPedido = {
        cliente: 'Ana Souza',
        itens: [
          { nome: 'Coxinha', precoUnitario: 5, quantidade: 2 },   // 10
          { nome: 'Refrigerante', precoUnitario: 6, quantidade: 3 } // 18
        ]
      };

      const res = await request(app).post('/pedidos').send(novoPedido);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.cliente).toBe('Ana Souza');
      expect(res.body.status).toBe('pendente');
      expect(res.body.total).toBe(28); // 10 + 18 = 28
    });

    test('retorna 400 quando o cliente esta faltando', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({
          itens: [{ nome: 'Coxinha', precoUnitario: 5, quantidade: 1 }]
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando a lista de itens esta vazia', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Ana Souza',
          itens: []
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando algum item tem preco ou quantidade invalidos', async () => {
      const res = await request(app)
        .post('/pedidos')
        .send({
          cliente: 'Ana Souza',
          itens: [{ nome: 'Item Invalido', precoUnitario: 0, quantidade: -1 }]
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('PATCH /pedidos/:id/status', () => {
    test('retorna 200 e o pedido com o novo status quando o id existe', async () => {
      const res = await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'pago' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body.status).toBe('pago');
    });

    test('retorna 404 quando o pedido nao existe', async () => {
      const res = await request(app)
        .patch('/pedidos/999/status')
        .send({ status: 'pago' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o status enviado e invalido', async () => {
      const res = await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'entregue' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 ao tentar alterar o status de um pedido ja cancelado', async () => {
      // 1. Altera o status para 'cancelado'
      await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'cancelado' });

      // 2. Tenta alterar para 'pago' em seguida
      const res = await request(app)
        .patch('/pedidos/1/status')
        .send({ status: 'pago' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });
  });

  describe('DELETE /pedidos/:id', () => {
    test('retorna 204 quando o pedido e removido com sucesso', async () => {
      const res = await request(app).delete('/pedidos/1');

      expect(res.status).toBe(204);
    });

    test('pedido removido nao aparece mais na listagem', async () => {
      await request(app).delete('/pedidos/1');

      const res = await request(app).get('/pedidos/1');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 404 quando o pedido nao existe', async () => {
      const res = await request(app).delete('/pedidos/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });
  });
});

cliente service
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

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const clientes = [{ id: 1, nome: "Ana Souza", email: "ana@email.com" }];
      mockRepository.findAll.mockReturnValue(clientes);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(clientes);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o cliente encontrado", () => {
      const clienteMock = { id: 1, nome: "Ana Souza", email: "ana@email.com" };
      mockRepository.findById.mockReturnValue(clienteMock);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(clienteMock);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(999)).toThrow("Cliente nao encontrado");
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o cliente criado", () => {
      const dadosCliente = { nome: "Carlos Silva", email: "carlos@email.com" };
      const clienteCriado = { id: 1, ...dadosCliente };

      mockRepository.create.mockReturnValue(clienteCriado);

      const resultado = service.criar(dadosCliente);

      expect(mockRepository.create).toHaveBeenCalledWith(dadosCliente);
      expect(resultado).toEqual(clienteCriado);
    });

    test("propaga o erro quando nome ou email estiverem faltando", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Nome e email sao obrigatorios");
      });

      expect(() => service.criar({ nome: "Carlos Silva" })).toThrow("Nome e email sao obrigatorios");
      expect(() => service.criar({ email: "carlos@email.com" })).toThrow("Nome e email sao obrigatorios");
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.criar({ nome: "Carlos", email: "ja_existe@email.com" })).toThrow("Email ja cadastrado");
    });
  });

  describe("atualizar", () => {
    test("chama repository.findById e repository.update quando o cliente existe", () => {
      const clienteExistente = { id: 1, nome: "Ana Souza", email: "ana@email.com" };
      const dadosAtualizacao = { nome: "Ana Souza Silva", email: "ana.silva@email.com" };
      const clienteAtualizado = { id: 1, ...dadosAtualizacao };

      mockRepository.findById.mockReturnValue(clienteExistente);
      mockRepository.update.mockReturnValue(clienteAtualizado);

      const resultado = service.atualizar(1, dadosAtualizacao);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, dadosAtualizacao);
      expect(resultado).toEqual(clienteAtualizado);
    });

    test("lanca erro 'Cliente nao encontrado' sem chamar repository.update quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizar(999, { nome: "Teste" })).toThrow("Cliente nao encontrado");
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      mockRepository.findById.mockReturnValue({ id: 1, nome: "Ana", email: "ana@email.com" });
      mockRepository.update.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.atualizar(1, { email: "outro_existente@email.com" })).toThrow("Email ja cadastrado");
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

      expect(() => service.remover(999)).toThrow("Cliente nao encontrado");
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});