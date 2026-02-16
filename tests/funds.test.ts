import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Fund Endpoints', () => {
  describe('GET /funds', () => {
    it('should return an empty array when no funds exist', async () => {
      const response = await request(app).get('/funds');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all funds', async () => {
      await prisma.fund.create({
        data: {
          name: 'Titanbay Growth Fund I',
          vintage_year: 2024,
          target_size_usd: 250000000.0,
          status: 'Fundraising',
        },
      });

      const response = await request(app).get('/funds');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Titanbay Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 250000000.0,
        status: 'Fundraising',
      });
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('created_at');
    });
  });

  describe('POST /funds', () => {
    it('should create a new fund', async () => {
      const newFund = {
        name: 'Titanbay Growth Fund II',
        vintage_year: 2025,
        target_size_usd: 500000000.0,
        status: 'Fundraising',
      };

      const response = await request(app).post('/funds').send(newFund);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newFund);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app).post('/funds').send({
        vintage_year: 2025,
        target_size_usd: 500000000.0,
        status: 'Fundraising',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when status is invalid', async () => {
      const response = await request(app).post('/funds').send({
        name: 'Test Fund',
        vintage_year: 2025,
        target_size_usd: 500000000.0,
        status: 'InvalidStatus',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when vintage_year is not an integer', async () => {
      const response = await request(app).post('/funds').send({
        name: 'Test Fund',
        vintage_year: 'not-a-year',
        target_size_usd: 500000000.0,
        status: 'Fundraising',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when target_size_usd is negative', async () => {
      const response = await request(app).post('/funds').send({
        name: 'Test Fund',
        vintage_year: 2025,
        target_size_usd: -100,
        status: 'Fundraising',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /funds', () => {
    it('should update an existing fund', async () => {
      const fund = await prisma.fund.create({
        data: {
          name: 'Titanbay Growth Fund I',
          vintage_year: 2024,
          target_size_usd: 250000000.0,
          status: 'Fundraising',
        },
      });

      const response = await request(app).put('/funds').send({
        id: fund.id,
        name: 'Titanbay Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 300000000.0,
        status: 'Investing',
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: fund.id,
        name: 'Titanbay Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 300000000.0,
        status: 'Investing',
      });
    });

    it('should return 404 when fund does not exist', async () => {
      const response = await request(app).put('/funds').send({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Non-existent Fund',
        vintage_year: 2024,
        target_size_usd: 100000000.0,
        status: 'Fundraising',
      });

      expect(response.status).toBe(404);
    });

    it('should return 400 when id is missing', async () => {
      const response = await request(app).put('/funds').send({
        name: 'Test Fund',
        vintage_year: 2024,
        target_size_usd: 100000000.0,
        status: 'Fundraising',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when status is invalid', async () => {
      const fund = await prisma.fund.create({
        data: {
          name: 'Test Fund',
          vintage_year: 2024,
          target_size_usd: 250000000.0,
          status: 'Fundraising',
        },
      });

      const response = await request(app).put('/funds').send({
        id: fund.id,
        name: 'Test Fund',
        vintage_year: 2024,
        target_size_usd: 250000000.0,
        status: 'InvalidStatus',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /funds/:id', () => {
    it('should return a specific fund', async () => {
      const fund = await prisma.fund.create({
        data: {
          name: 'Titanbay Growth Fund I',
          vintage_year: 2024,
          target_size_usd: 250000000.0,
          status: 'Fundraising',
        },
      });

      const response = await request(app).get(`/funds/${fund.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: fund.id,
        name: 'Titanbay Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 250000000.0,
        status: 'Fundraising',
      });
    });

    it('should return 404 when fund does not exist', async () => {
      const response = await request(app).get('/funds/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
    });

    it('should return 400 when id is not a valid UUID', async () => {
      const response = await request(app).get('/funds/not-a-uuid');

      expect(response.status).toBe(400);
    });
  });
});
