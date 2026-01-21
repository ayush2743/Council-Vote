const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Moderators
  const moderator1Password = await bcrypt.hash('mod123', 10);
  const moderator1 = await prisma.user.create({
    data: {
      name: 'Moderator One',
      email: 'moderator1@gmail.com',
      password: moderator1Password,
      role: 'MODERATOR',
    },
  });
  console.log('✅ Created Moderator 1:', moderator1.email);

  const moderator2Password = await bcrypt.hash('mod123', 10);
  const moderator2 = await prisma.user.create({
    data: {
      name: 'Moderator Two',
      email: 'moderator2@gmail.com',
      password: moderator2Password,
      role: 'MODERATOR',
    },
  });
  console.log('✅ Created Moderator 2:', moderator2.email);

  // Create Candidates/Students
  const candidate1Password = await bcrypt.hash('student123', 10);
  const candidate1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@gmail.com',
      password: candidate1Password,
      role: 'CANDIDATE',
    },
  });
  console.log('✅ Created Candidate 1:', candidate1.email);

  const candidate2Password = await bcrypt.hash('student123', 10);
  const candidate2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@gmail.com',
      password: candidate2Password,
      role: 'CANDIDATE',
    },
  });
  console.log('✅ Created Candidate 2:', candidate2.email);

  const candidate3Password = await bcrypt.hash('student123', 10);
  const candidate3 = await prisma.user.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie@gmail.com',
      password: candidate3Password,
      role: 'CANDIDATE',
    },
  });
  console.log('✅ Created Candidate 3:', candidate3.email);

  // Create a Position (by Moderator 1)
  const position1 = await prisma.position.create({
    data: {
      name: 'President',
      description: 'Lead the student council and represent all students',
      applicationEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdBy: moderator1.id,
      status: 'PENDING',
    },
  });
  console.log('✅ Created Position:', position1.name);

  // Create another Position (by Moderator 2)
  const position2 = await prisma.position.create({
    data: {
      name: 'Vice President',
      description: 'Assist the president and manage internal affairs',
      applicationEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      createdBy: moderator2.id,
      status: 'PENDING',
    },
  });
  console.log('✅ Created Position:', position2.name);

  console.log('\n✨ Seeding completed!');
  console.log('\n📋 Sample Credentials:');
  console.log('Super Admin: admin@gmail.com / admin123');
  console.log('Moderator 1: moderator1@gmail.com / mod123');
  console.log('Moderator 2: moderator2@gmail.com / mod123');
  console.log('Candidate 1: alice@gmail.com / student123');
  console.log('Candidate 2: bob@gmail.com / student123');
  console.log('Candidate 3: charlie@gmail.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
