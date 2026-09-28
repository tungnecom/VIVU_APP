import { ENV } from '../../config/env';

export interface IcebreakerContext {
  targetUserName: string;
  sharedInterests: string[];
  candidateCity: string;
  contextType: 'cafe' | 'food' | 'travel' | 'general';
}

export class ViViAIService {
  /**
   * Tạo câu mở lời bắt chuyện thông minh (Psychology-based Icebreaker)
   */
  public static async generateSmartIcebreaker(
    ctx: IcebreakerContext
  ): Promise<{ icebreaker: string; explanation: string }> {
    const primaryInterest = ctx.sharedInterests[0] || 'Du lịch';

    // Trường hợp có GEMINI_API_KEY
    if (ENV.GEMINI_API_KEY) {
      try {
        const prompt = `Bạn là ViVi, trợ lý ảo thông minh của ứng dụng du lịch VIVU. 
Hãy viết 1 câu mở lời bắt chuyện (dưới 35 từ) thật tự nhiên, thân thiện và cuốn hút để người dùng gửi cho ${ctx.targetUserName}.
Họ đều cùng thích: ${ctx.sharedInterests.join(', ')} tại ${ctx.candidateCity}.
Không dùng từ sáo rỗng hoặc quá trang trọng. Trả về đúng 1 câu văn duy nhất tiếng Việt kèm emoji vui tươi.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return {
              icebreaker: text,
              explanation: `Dựa trên điểm chung ${primaryInterest} giữa 2 bạn`,
            };
          }
        }
      } catch (err) {
        // Fallback to built-in rule engine
      }
    }

    // Fallback: Hệ thống sinh câu thông minh theo tâm lý học giao tiếp (Rule-based heuristics)
    const templates: Record<string, string[]> = {
      food: [
        `Chào ${ctx.targetUserName}, mình thấy bạn cũng mê ẩm thực ${ctx.candidateCity}! Bạn đã thử quán bánh tráng thịt heo Đại Lộc ở Hải Châu chưa, chuẩn vị lắm nè! 🍲`,
        `Hi ${ctx.targetUserName}! Cuối tuần này nhóm mình định làm một vòng food tour chợ đêm, bạn có hứng thú đi cùng không? ✨`,
      ],
      cafe: [
        `Chào ${ctx.targetUserName}, mình thấy bạn thích cafe yên tĩnh. Góc tầng 2 ở Nối Cafe ngắm hoàng hôn cực chill luôn, bạn ghé qua đó bao giờ chưa? ☕`,
        `Hi ${ctx.targetUserName}, bạn có gợi ý quán cafe view biển nào đẹp để chill cuối tuần ở ${ctx.candidateCity} không nhỉ? 🌊`,
      ],
      travel: [
        `Chào ${ctx.targetUserName}! Mình thấy bạn cũng thích phượt Sơn Trà. Chiều thứ 7 này tụi mình đổ đèo ngắm hoàng hôn, bạn đi cùng cho vui nhé! 🛵🌄`,
        `Hi ${ctx.targetUserName}, cuối tuần này bạn có kế hoạch khám phá địa điểm nào mới ở ${ctx.candidateCity} chưa? ✨`,
      ],
      general: [
        `Chào ${ctx.targetUserName}, thấy bạn cũng có cùng đam mê ${primaryInterest} với mình! Rất vui được làm quen với bạn trên VIVU nhé 🎉`,
      ],
    };

    const list = templates[ctx.contextType] || templates.general;
    const chosen = list[Math.floor(Math.random() * list.length)];

    return {
      icebreaker: chosen,
      explanation: `Gợi ý tự động dựa trên sở thích ${primaryInterest} và vị trí ${ctx.candidateCity}`,
    };
  }

  /**
   * Tạo 3 gợi ý phản hồi nhanh (Smart Contextual Replies)
   */
  public static generateSmartReplies(lastMessage: string): string[] {
    const lower = lastMessage.toLowerCase();
    if (lower.includes('khi nào') || lower.includes('mấy giờ') || lower.includes('thời gian')) {
      return [
        '17h chiều thứ 7 này nhé bạn!',
        'Mình rảnh vào khoảng 18h tối nay nè.',
        'Để mình check lại lịch rồi nhắn bạn ngay nhé!',
      ];
    }
    if (lower.includes('ở đâu') || lower.includes('địa điểm') || lower.includes('chỗ nào')) {
      return [
        'Gặp nhau ở quán Nối Cafe góc Hải Châu nhé!',
        'Ngay chân cầu Rồng hướng Bạch Đằng bạn nhé.',
        'Bạn chọn địa điểm đi, mình ở khu vực nào cũng tiện.',
      ];
    }
    if (lower.includes('đi không') || lower.includes('tham gia')) {
      return [
        'Nghe hấp dẫn quá, mình tham gia với nhé! 🎉',
        'Cho mình đăng ký 1 suất nha!',
        'Tiếc quá tuần này mình bận mất rồi, hẹn bạn lần sau nhé!',
      ];
    }

    return [
      'Nhất trí nhé! Hẹn gặp bạn.',
      'Cảm ơn bạn nhiều nhé! ✨',
      'Để mình rủ thêm bạn cùng đi cho đông vui nha.',
    ];
  }
}
