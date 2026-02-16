import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config';

const connectionString: string = config.databaseUrl!;
const adapter: PrismaPg = new PrismaPg({ connectionString });
const prisma: PrismaClient = new PrismaClient({ adapter });

export { prisma };
