import { Platform } from 'react-native';

// Địa chỉ backend mặc định
// Android Emulator dùng 10.0.2.2, iOS Simulator & Web dùng localhost
const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export class ApiClient {
  private static baseUrl = API_BASE_URL;

  public static setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * 1. Đăng ký tài khoản
   */
  public static async register(identifier: string, city: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: 'password123', city }),
      });
      return await res.json();
    } catch {
      return { success: true, message: 'Đăng ký thành công (Offline Mode)' };
    }
  }

  /**
   * 2. Đăng nhập
   */
  public static async login(identifier: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: 'password123' }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: {
          token: 'offline_token_2026',
          user: {
            id: 'u_offline',
            name: 'Tùng',
            city: 'Đà Nẵng',
            trustScore: 94,
          },
        },
      };
    }
  }

  /**
   * 3. Tìm kiếm Ngữ nghĩa Lai qua AI
   */
  public static async search(query: string, category = '', city = 'Đà Nẵng') {
    try {
      const url = `${this.baseUrl}/api/ai/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&city=${encodeURIComponent(city)}`;
      const res = await fetch(url);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }

  /**
   * 4. Sinh câu mở lời AI (Icebreaker)
   */
  public static async generateIcebreaker(
    targetUserName: string,
    sharedInterests: string[],
    candidateCity = 'Đà Nẵng'
  ) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/icebreaker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserName,
          sharedInterests,
          candidateCity,
          contextType: 'general',
        }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: {
          icebreaker: `Chào ${targetUserName}! Thấy bạn cũng mê ${sharedInterests[0] || 'du lịch'} ở ${candidateCity}, rất vui được làm quen với bạn trên VIVU nhé! ✨`,
          explanation: 'Gợi ý tự động từ ViVi',
        },
      };
    }
  }

  /**
   * 5. Sinh 3 câu trả lời nhanh ngữ cảnh
   */
  public static async generateSmartReplies(lastMessage: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/ai/smart-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessage }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        data: [
          'Nhất trí nhé! Hẹn gặp bạn.',
          'Cảm ơn bạn nhiều nhé! ✨',
          'Để mình rủ thêm bạn cùng đi cho vui nha.',
        ],
      };
    }
  }

  /**
   * 6. Lấy danh sách ghép cạ bạn đồng hành xếp hạng bởi AI
   */
  public static async getMatchmakingCandidates() {
    try {
      const res = await fetch(`${this.baseUrl}/api/activities/matchmaking`);
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  }
}
