import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlacesController {
  public static async getPlacesByBounds(req: Request, res: Response): Promise<void> {
    try {
      const { south, north, west, east, limit } = req.query;

      if (!south || !north || !west || !east) {
        const places = await prisma.place.findMany({
          take: Number(limit) || 50,
          orderBy: { rating: 'desc' }
        });
        res.status(200).json({ success: true, count: places.length, data: places });
        return;
      }

      const s = parseFloat(south as string);
      const n = parseFloat(north as string);
      const w = parseFloat(west as string);
      const e = parseFloat(east as string);

      const places = await prisma.place.findMany({
        where: {
          latitude: {
            gte: Math.min(s, n),
            lte: Math.max(s, n)
          },
          longitude: {
            gte: Math.min(w, e),
            lte: Math.max(w, e)
          }
        },
        take: Number(limit) || 200, 
        orderBy: { rating: 'desc' }
      });

      res.status(200).json({ success: true, count: places.length, data: places });
    } catch (error: any) {
      console.error('Error fetching places:', error);
      res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu bản đồ' });
    }
  }
}
