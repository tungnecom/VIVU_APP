import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const CATEGORIES = [
  { name: 'Cafe', type: 'food', ratio: 0.3, names: ['Highlands Coffee', 'The Coffee House', 'Cộng Cà Phê', 'Gozar Coffee', 'Tiệm Cà phê 40'] },
  { name: 'Nhà hàng', type: 'food', ratio: 0.4, names: ['Hải Sản Thời Cổ', 'Cơm Niêu Ngói Đỏ', 'Pizza 4Ps', 'Bánh xèo Bà Dưỡng', 'Mì Quảng Ếch Bếp Trang'] },
  { name: 'Bar/Pub', type: 'entertainment', ratio: 0.1, names: ['Sky36', 'OQ Lounge Pub', 'On The Radio', 'Golden Pine', 'Bamboo2'] },
  { name: 'Điểm du lịch', type: 'tourism', ratio: 0.2, names: ['Cầu Rồng', 'Cầu Tình Yêu', 'Bán đảo Sơn Trà', 'Chợ Hàn', 'Bãi biển Mỹ Khê'] }
];

async function main() {
  console.log('🌐 Bắt đầu khởi tạo dữ liệu mô phỏng 1000 địa điểm tại Đà Nẵng...');
  
  const TOTAL_PLACES = 1000;
  let count = 0;

  try {
    for (let i = 0; i < TOTAL_PLACES; i++) {
      const randCat = Math.random();
      let cumulative = 0;
      let selectedCategory = CATEGORIES[0];
      for (const cat of CATEGORIES) {
        cumulative += cat.ratio;
        if (randCat <= cumulative) {
          selectedCategory = cat;
          break;
        }
      }

      const baseName = selectedCategory.names[Math.floor(Math.random() * selectedCategory.names.length)];
      const name = `${baseName} - Chi nhánh ${Math.floor(Math.random() * 500) + 1}`;
      const category = selectedCategory.name;
      const type = selectedCategory.type;
      
      const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-') + '-' + i;

      // Random coordinates around Da Nang (15.95 to 16.15, 108.15 to 108.30)
      const lat = randomInRange(15.95, 16.15);
      const lon = randomInRange(108.15, 108.30);

      await prisma.place.upsert({
        where: { slug: slug },
        update: {},
        create: {
          name,
          slug,
          category,
          city: 'Đà Nẵng',
          address: `${Math.floor(Math.random() * 200) + 1} Đường ven biển, Đà Nẵng`,
          latitude: lat,
          longitude: lon,
          rating: Number((4.0 + Math.random()).toFixed(1)),
          reviewsCount: Math.floor(Math.random() * 500) + 10,
          description: `Một ${category.toLowerCase()} được đánh giá cao tại Đà Nẵng, rất phù hợp để trải nghiệm.`,
          images: [
              type === 'food' 
                ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'
                : 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600'
          ],
          source: 'Simulated Data',
          zeroGarbageVerified: true,
        }
      });
      count++;
      if (count % 200 === 0) console.log(`...đã khởi tạo ${count} địa điểm...`);
    }
    
    console.log(`🎉 Thành công! Đã lưu tổng cộng ${count} địa điểm vào Database.`);
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
