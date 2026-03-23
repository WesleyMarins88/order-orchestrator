# Order Orchestrator

API de orquestração de pedidos construída com NestJS, MySQL e Redis/BullMQ.

## Stack

- **NestJS** — framework
- **Prisma v5** — ORM
- **MySQL 8** — banco de dados
- **BullMQ / Redis** — fila de processamento assíncrono

## Como rodar

### Produção (tudo via Docker)

```bash
docker compose up -d
```

API disponível em `http://localhost:3000`.

---

### Desenvolvimento (infra no Docker, aplicação local)

```bash
docker compose up -d mysql redis
npx prisma migrate dev --name init
npm run start:dev
```

Variáveis de ambiente já estão configuradas no `.env`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /webhooks/orders | Recebe um pedido |
| GET | /orders | Lista pedidos (aceita `?status=RECEIVED`) |
| GET | /orders/:id | Detalha um pedido |
| GET | /queue/metrics | Métricas da fila |

## Exemplo de requisição

```bash
curl -X POST http://localhost:3000/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ext-123",
    "customer": { "email": "ana@example.com", "name": "Ana" },
    "items": [{ "sku": "ABC123", "qty": 2, "unit_price": 59.9 }],
    "currency": "USD",
    "idempotency_key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

## Fluxo de processamento

1. `POST /webhooks/orders` valida o payload e verifica a `idempotency_key`
2. Pedido salvo com status `RECEIVED` e enfileirado no Redis
3. Worker consome a fila e busca a cotação da moeda do pedido via [AwesomeAPI](https://economia.awesomeapi.com.br)
4. Em sucesso: cotação salva e status atualizado para `ENRICHED`
5. Em falha após 5 tentativas com backoff exponencial: status `FAILED_ENRICHMENT`

## Status possíveis

| Status | Descrição |
|--------|-----------|
| RECEIVED | Pedido recebido e na fila |
| PROCESSING | Em processamento pelo worker |
| ENRICHED | Cotação obtida com sucesso |
| FAILED_ENRICHMENT | Falhou após esgotar todas as tentativas |
