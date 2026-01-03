import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as crypto from 'crypto'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/ksha-core?schema=public'
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const email = 'admin@ksha.local'
    const password = 'admin'

    // Simple hash function matching AuthService
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            password_hash: passwordHash,
            full_name: 'Admin User',
            role: 'owner',
            settings: {},
        },
    })
    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
