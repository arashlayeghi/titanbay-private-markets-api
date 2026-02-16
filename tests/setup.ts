import { beforeEach, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.investment.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.fund.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
