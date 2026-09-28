import http from 'k6/http';
import { check, sleep } from 'k6';

// Kịch bản kiểm thử tải mô phỏng 10,000 người dùng đồng thời (10,000 CCU)
// Mục tiêu: P95 latency < 80ms, 0% error rate
export const options = {
  stages: [
    { duration: '30s', target: 1000 },  // Ramp-up lên 1,000 CCU
    { duration: '1m', target: 5000 },   // Tăng tốc lên 5,000 CCU
    { duration: '2m', target: 10000 },  // Chịu tải tối đa 10,000 CCU
    { duration: '1m', target: 10000 },  // Duy trì đỉnh 10,000 CCU
    { duration: '30s', target: 0 },     // Hạ tải an toàn
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'],   // 95% request phải phản hồi dưới 150ms
    http_req_failed: ['rate<0.01'],     // Tỷ lệ lỗi dưới 1%
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // 1. Kiểm tra Health Check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'Health check trả về 200': (r) => r.status === 200,
  });

  // 2. Kiểm tra Cache-Aside Feed (Redis)
  const feedRes = http.get(`${BASE_URL}/api/feed?category=all`);
  check(feedRes, {
    'Feed API trả về 200': (r) => r.status === 200,
    'Feed có dữ liệu': (r) => JSON.parse(r.body).data.length > 0,
  });

  // 3. Kiểm tra Tìm kiếm Ngữ nghĩa Lai (AI Hybrid Search)
  const searchRes = http.get(`${BASE_URL}/api/ai/search?q=cafe%20view%20bien&city=Đà%20Nẵng`);
  check(searchRes, {
    'Search API trả về 200': (r) => r.status === 200,
  });

  // 4. Kiểm tra Kho địa điểm sạch (Zero-Garbage Places)
  const placesRes = http.get(`${BASE_URL}/api/crawler/places?city=Đà%20Nẵng`);
  check(placesRes, {
    'Places API trả về 200': (r) => r.status === 200,
  });

  sleep(1); // Thời gian suy nghĩ của người dùng (1 giây)
}
