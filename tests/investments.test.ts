import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

let fundId: string;
let investorId: string;

beforeEach(async () => {
  const fund = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000.0,
      status: 'Fundraising',
    },
  });
  fundId = fund.id;

  const investor = await prisma.investor.create({
    data: {
      name: 'Goldman Sachs Asset Management',
      investor_type: 'Institution',
      email: 'investments@gsam.com',
    },
  });
  investorId = investor.id;
});

describe('Investment Endpoints', () => {
  describe('GET /funds/:fund_id/investments', () => {
    it('should return an empty array when no investments exist', async () => {
      const response = await request(app).get(`/funds/${fundId}/investments`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all investments for a fund', async () => {
      await prisma.investment.create({
        data: {
          investor_id: investorId,
          fund_id: fundId,
          amount_usd: 50000000.0,
          investment_date: new Date('2024-03-15'),
        },
      });

      const response = await request(app).get(`/funds/${fundId}/investments`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        investor_id: investorId,
        fund_id: fundId,
        amount_usd: 50000000.0,
        investment_date: '2024-03-15',
      });
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should return 404 when fund does not exist', async () => {
      const response = await request(app).get(
        '/funds/00000000-0000-0000-0000-000000000000/investments',
      );

      expect(response.status).toBe(404);
    });

    it('should return 400 when fund_id is not a valid UUID', async () => {
      const response = await request(app).get('/funds/not-a-uuid/investments');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /funds/:fund_id/investments', () => {
    it('should create a new investment', async () => {
      const newInvestment = {
        investor_id: investorId,
        amount_usd: 75000000.0,
        investment_date: '2024-09-22',
      };

      const response = await request(app).post(`/funds/${fundId}/investments`).send(newInvestment);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        investor_id: investorId,
        fund_id: fundId,
        amount_usd: 75000000.0,
        investment_date: '2024-09-22',
      });
      expect(response.body).toHaveProperty('id');
    });

    it('should return 404 when fund does not exist', async () => {
      const response = await request(app)
        .post('/funds/00000000-0000-0000-0000-000000000000/investments')
        .send({
          investor_id: investorId,
          amount_usd: 50000000.0,
          investment_date: '2024-09-22',
        });

      expect(response.status).toBe(404);
    });

    it('should return 404 when investor does not exist', async () => {
      const response = await request(app).post(`/funds/${fundId}/investments`).send({
        investor_id: '00000000-0000-0000-0000-000000000000',
        amount_usd: 50000000.0,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(404);
    });

    it('should return 400 when amount_usd is negative', async () => {
      const response = await request(app).post(`/funds/${fundId}/investments`).send({
        investor_id: investorId,
        amount_usd: -100,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when investment_date is invalid', async () => {
      const response = await request(app).post(`/funds/${fundId}/investments`).send({
        investor_id: investorId,
        amount_usd: 50000000.0,
        investment_date: 'not-a-date',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when fund_id is not a valid UUID', async () => {
      const response = await request(app).post('/funds/not-a-uuid/investments').send({
        investor_id: investorId,
        amount_usd: 50000000.0,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when request body contains unrecognized fields', async () => {
      const response = await request(app).post(`/funds/${fundId}/investments`).send({
        investor_id: investorId,
        amount_usd: 50000000.0,
        investment_date: '2024-09-22',
        unexpected_field: 'should not be here',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when investing in a closed fund', async () => {
      const closedFund = await prisma.fund.create({
        data: {
          name: 'Closed Fund',
          vintage_year: 2023,
          target_size_usd: 100000000.0,
          status: 'Closed',
        },
      });

      const response = await request(app).post(`/funds/${closedFund.id}/investments`).send({
        investor_id: investorId,
        amount_usd: 50000000.0,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot invest in a closed fund');
    });

    it('should return 400 when investment exceeds fund target size', async () => {
      const smallFund = await prisma.fund.create({
        data: {
          name: 'Small Fund',
          vintage_year: 2024,
          target_size_usd: 1000000.0,
          status: 'Fundraising',
        },
      });

      const response = await request(app).post(`/funds/${smallFund.id}/investments`).send({
        investor_id: investorId,
        amount_usd: 2000000.0,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("exceeds fund's remaining capacity");
    });

    it('should return 400 when cumulative investments exceed fund target size', async () => {
      await prisma.investment.create({
        data: {
          investor_id: investorId,
          fund_id: fundId,
          amount_usd: 200000000.0,
          investment_date: new Date('2024-03-15'),
        },
      });

      const response = await request(app).post(`/funds/${fundId}/investments`).send({
        investor_id: investorId,
        amount_usd: 100000000.0,
        investment_date: '2024-09-22',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("exceeds fund's remaining capacity");
    });
  });
});
