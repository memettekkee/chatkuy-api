import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// async function testConnection() {
//   try {
//     // Mencoba connect ke database
//     await prisma.$connect();
//     console.log('✅ Berhasil terhubung ke database PostgreSQL');
    
//     // Coba query sederhana
//     const result = await prisma.$queryRaw`SELECT version();`;
//     console.log('PostgreSQL Version:', result);
    
//     // Jika sudah ada model Prisma yang telah di-generate, bisa mencoba query model
//     // contoh: const users = await prisma.user.findMany();
//     // console.log('Total users:', users.length);
    
//     return true;
//   } catch (error) {
//     console.error('❌ Gagal terhubung ke database:', error);
//     return false;
//   } finally {
//     // Selalu disconnect dari prisma di akhir
//     await prisma.$disconnect();
//   }
// }

// // Jalankan fungsi test
// testConnection()
//   .then((connected) => {
//     if (connected) {
//       console.log('Database test selesai, koneksi berhasil!');
//     } else {
//       console.log('Database test selesai, koneksi gagal!');
//     }
//     process.exit(connected ? 0 : 1);
//   })
//   .catch((err) => {
//     console.error('Error pada test:', err);
//     process.exit(1);
//   });