import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString: string = process.env.DATABASE_URL!;
const adapter: PrismaPg = new PrismaPg({ connectionString });
const prisma: PrismaClient = new PrismaClient({ adapter });

const main = async (): Promise<void> => {
  // Clean existing data
  await prisma.investment.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.fund.deleteMany();

  // Create funds
  const fund1 = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000.0,
      status: 'Fundraising',
    },
  });

  const fund2 = await prisma.fund.create({
    data: {
      name: 'Titanbay Growth Fund II',
      vintage_year: 2025,
      target_size_usd: 500000000.0,
      status: 'Fundraising',
    },
  });

  // Create investors
  const investor1 = await prisma.investor.create({
    data: {
      name: 'Goldman Sachs Asset Management',
      investor_type: 'Institution',
      email: 'investments@gsam.com',
    },
  });

  const investor2 = await prisma.investor.create({
    data: {
      name: 'CalPERS',
      investor_type: 'Institution',
      email: 'privateequity@calpers.ca.gov',
    },
  });

  const investor3 = await prisma.investor.create({
    data: {
      name: 'The Smith Family Office',
      investor_type: 'Family_Office',
      email: 'investments@smithfo.com',
    },
  });

  // Create investments
  await prisma.investment.create({
    data: {
      investor_id: investor1.id,
      fund_id: fund1.id,
      amount_usd: 50000000.0,
      investment_date: new Date('2024-03-15'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor2.id,
      fund_id: fund1.id,
      amount_usd: 75000000.0,
      investment_date: new Date('2024-06-01'),
    },
  });

  await prisma.investment.create({
    data: {
      investor_id: investor3.id,
      fund_id: fund2.id,
      amount_usd: 25000000.0,
      investment_date: new Date('2025-01-10'),
    },
  });

  console.info('Seed data created successfully');
  console.info(`  Funds: ${fund1.name}, ${fund2.name}`);
  console.info(`  Investors: ${investor1.name}, ${investor2.name}, ${investor3.name}`);
  console.info('  Investments: 3 commitments created');
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
