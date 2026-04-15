const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@renacer.com' },
      update: {},
      create: {
        email: 'admin@renacer.com',
        nombre: 'Administrador',
        password: passwordHash,
        rol: 'ADMIN'
      }
    });

    console.log('✅ Usuario admin creado:', admin.email);
    console.log('📝 Contraseña: admin123');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
