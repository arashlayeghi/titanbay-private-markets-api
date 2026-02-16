import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Investor Endpoints', () => {
  describe('GET /investors', () => {
    it('should return an empty array when no investors exist', async () => {
      const response = await request(app).get('/investors');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all investors', async () => {
      await prisma.investor.create({
        data: {
          name: 'Goldman Sachs Asset Management',
          investor_type: 'Institution',
          email: 'investments@gsam.com',
        },
      });

      const response = await request(app).get('/investors');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Goldman Sachs Asset Management',
        investor_type: 'Institution',
        email: 'investments@gsam.com',
      });
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('created_at');
    });
  });

  describe('POST /investors', () => {
    it('should create a new investor', async () => {
      const newInvestor = {
        name: 'CalPERS',
        investor_type: 'Institution',
        email: 'privateequity@calpers.ca.gov',
      };

      const response = await request(app).post('/investors').send(newInvestor);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(newInvestor);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app).post('/investors').send({
        investor_type: 'Institution',
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when investor_type is invalid', async () => {
      const response = await request(app).post('/investors').send({
        name: 'Test Investor',
        investor_type: 'InvalidType',
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when email is invalid', async () => {
      const response = await request(app).post('/investors').send({
        name: 'Test Investor',
        investor_type: 'Institution',
        email: 'not-an-email',
      });

      expect(response.status).toBe(400);
    });

    it('should return 409 when email already exists', async () => {
      await prisma.investor.create({
        data: {
          name: 'Existing Investor',
          investor_type: 'Institution',
          email: 'duplicate@example.com',
        },
      });

      const response = await request(app).post('/investors').send({
        name: 'New Investor',
        investor_type: 'Individual',
        email: 'duplicate@example.com',
      });

      expect(response.status).toBe(409);
    });
  });
});
