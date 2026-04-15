const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@renacer.com' },
    update: {},
    create: {
      email: 'admin@renacer.com',
      nombre: 'Administrador',
      password: hash,
      rol: 'ADMIN'
    }
  });
  
  console.log('✅ Admin creado:', admin.email);
  console.log('📝 Contraseña: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());