const request = require('supertest');

const createApp = require('../app');

// Teste de integracao: testa a API de ponta a ponta via HTTP real.
// Cada teste recebe uma app nova (factory), garantindo estado isolado.

describe('API /clientes (integracao com supertest)', () => {

  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /clientes', () => {

    test('retorna 200 e um array com os clientes iniciais', async () => {

      const res = await request(app).get('/clientes');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

  });

  describe('GET /clientes/:id', () => {

    test('retorna 200 e o cliente quando o id existe', async () => {

      const res = await request(app).get('/clientes/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body.nome).toBe('Ana Souza');
      expect(res.body.email).toBe('ana@email.com');
    });

    test('retorna 404 com mensagem de erro quando o cliente nao existe', async () => {

      const res = await request(app).get('/clientes/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

  });

  describe('POST /clientes', () => {

    test('retorna 201 e o cliente criado com id gerado', async () => {

      const res = await request(app)
        .post('/clientes')
        .send({
          nome: 'Carlos Silva',
          email: 'carlos@email.com'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).toBe(3);
      expect(res.body.nome).toBe('Carlos Silva');
      expect(res.body.email).toBe('carlos@email.com');
    });

    test('retorna 400 quando o nome esta faltando', async () => {

      const res = await request(app)
        .post('/clientes')
        .send({
          email: 'teste@email.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o email esta faltando', async () => {

      const res = await request(app)
        .post('/clientes')
        .send({
          nome: 'Carlos Silva'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o email ja esta cadastrado', async () => {

      const res = await request(app)
        .post('/clientes')
        .send({
          nome: 'Outra Ana',
          email: 'ana@email.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

    test('cliente criado aparece em GET /clientes', async () => {

      await request(app)
        .post('/clientes')
        .send({
          nome: 'Carlos Silva',
          email: 'carlos@email.com'
        });

      const res = await request(app).get('/clientes');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some(cliente =>
        cliente.email === 'carlos@email.com'
      )).toBe(true);
    });

  });

  describe('PUT /clientes/:id', () => {

    test('retorna 200 e o cliente atualizado quando o id existe', async () => {

      const res = await request(app)
        .put('/clientes/1')
        .send({
          nome: 'Ana Silva',
          email: 'ana.silva@email.com'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body.nome).toBe('Ana Silva');
      expect(res.body.email).toBe('ana.silva@email.com');
    });

    test('retorna 404 quando o cliente nao existe', async () => {

      const res = await request(app)
        .put('/clientes/999')
        .send({
          nome: 'Cliente Inexistente',
          email: 'inexistente@email.com'
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 400 quando o novo email ja pertence a outro cliente', async () => {

      const res = await request(app)
        .put('/clientes/1')
        .send({
          email: 'bruno@email.com'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('erro');
    });

  });

  describe('DELETE /clientes/:id', () => {

    test('retorna 204 quando o cliente e removido com sucesso', async () => {

      const res = await request(app)
        .delete('/clientes/1');

      expect(res.status).toBe(204);
    });

    test('cliente removido nao aparece mais na listagem', async () => {

      await request(app)
        .delete('/clientes/1');

      const res = await request(app)
        .get('/clientes/1');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

    test('retorna 404 quando o cliente nao existe', async () => {

      const res = await request(app)
        .delete('/clientes/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('erro');
    });

  });

});

