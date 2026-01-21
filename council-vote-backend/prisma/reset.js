const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Dropping all tables...');

    // Drop tables in correct order (respecting foreign key constraints)
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "vote_status" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "votes" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "moderator_actions" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "candidate_proposals" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "positions" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "users" CASCADE;');
    
    // Drop enum types
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "Role" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "PositionStatus" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "ProposalStatus" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "ModeratorActionType" CASCADE;');

    console.log('✅ All tables dropped successfully!');
    console.log('\n📝 Now run: npm run prisma:migrate');
    console.log('   Then run: npm run prisma:seed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
