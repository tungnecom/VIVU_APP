import { Server, Socket } from 'socket.io';

export class ChatGateway {
  public static init(io: Server): void {
    io.on('connection', (socket: Socket) => {
      console.log(`🔌 WebSocket Client kết nối: ${socket.id}`);

      // 1. Tham gia phòng chat (1-1 hoặc nhóm)
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} đã vào phòng: ${roomId}`);
      });

      // 2. Gửi tin nhắn thời gian thực
      socket.on(
        'send_message',
        (data: {
          roomId: string;
          senderId: string;
          senderName: string;
          senderAvatar: string;
          text: string;
        }) => {
          const messagePayload = {
            id: 'msg_' + Date.now(),
            ...data,
            timestamp: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };

          // Phát tin nhắn đến tất cả thành viên trong phòng
          io.to(data.roomId).emit('new_message', messagePayload);

          // Tự động kích hoạt bot ViVi nếu có từ khóa rủ ăn uống/hẹn hò
          const textLower = data.text.toLowerCase();
          if (
            textLower.includes('đi ăn không') ||
            textLower.includes('quán nào') ||
            textLower.includes('rủ')
          ) {
            setTimeout(() => {
              const botPayload = {
                id: 'bot_' + Date.now(),
                roomId: data.roomId,
                senderId: 'vivi_bot',
                senderName: 'ViVi (Trợ lý)',
                senderAvatar:
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                text: '✨ ViVi gợi ý: Quán Bánh tráng thịt heo Đại Lộc ở Hải Châu đang được chấm 4.8⭐. Các bạn có muốn mình tạo cuộc hẹn nhóm tại đây không?',
                timestamp: new Date().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                isBot: true,
              };
              io.to(data.roomId).emit('new_message', botPayload);
            }, 1200);
          }
        }
      );

      // 3. Sự kiện đang nhập tin nhắn (Typing indicator)
      socket.on('typing', (data: { roomId: string; userName: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('user_typing', data);
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client ngắt kết nối: ${socket.id}`);
      });
    });
  }
}
