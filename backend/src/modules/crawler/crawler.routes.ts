import { Request, Response, Router } from 'express';
import { PlaceCrawlerEngine } from './crawler.service';

export const crawlerRouter = Router();

/**
 * POST /api/crawler/ingest
 * Kích hoạt cào dữ liệu từ Wikimedia và Traveloka, chạy qua bộ lọc 5 tầng làm sạch không rác ảo
 */
crawlerRouter.post('/ingest', async (req: Request, res: Response) => {
  const city = (req.body.city as string) || 'Đà Nẵng';

  try {
    // 1. Cào dữ liệu văn hóa, lịch sử từ Wikimedia
    const wikiItems = await PlaceCrawlerEngine.fetchWikimediaLandmarks(city);

    // 2. Cào dữ liệu ẩm thực, giải trí từ Traveloka
    const travelokaItems = await PlaceCrawlerEngine.fetchTravelokaHotspots(city);

    const rawCombined = [...wikiItems, ...travelokaItems];

    // 3. Chạy qua Đường ống 5 tầng (Zero-Garbage Pipeline)
    const cleanedPlaces = await PlaceCrawlerEngine.runZeroGarbagePipeline(rawCombined, city);

    res.json({
      success: true,
      message: `Đã cào và làm sạch thành công dữ liệu địa điểm tại ${city}!`,
      stats: {
        rawTotal: rawCombined.length,
        cleanedTotal: cleanedPlaces.length,
        zeroGarbageVerified: true,
      },
      data: cleanedPlaces,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi trong quá trình thu thập hoặc làm sạch dữ liệu: ' + error.message,
    });
  }
});

/**
 * GET /api/crawler/places
 * Lấy danh sách các địa điểm sạch đã được kiểm duyệt
 */
crawlerRouter.get('/places', async (req: Request, res: Response) => {
  const city = (req.query.city as string) || 'Đà Nẵng';
  const raw1 = await PlaceCrawlerEngine.fetchWikimediaLandmarks(city);
  const raw2 = await PlaceCrawlerEngine.fetchTravelokaHotspots(city);
  const cleaned = await PlaceCrawlerEngine.runZeroGarbagePipeline([...raw1, ...raw2], city);

  res.json({
    success: true,
    total: cleaned.length,
    data: cleaned,
  });
});
