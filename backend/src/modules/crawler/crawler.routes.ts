import { Request, Response, Router } from 'express';
import { PlaceCrawlerEngine } from './crawler.service';

export const crawlerRouter = Router();

/**
 * GET /api/crawler/provinces
 * Lấy danh sách 63 tỉnh thành Việt Nam từ Wikidata SPARQL & Tổng cục Thống kê (GSO)
 */
crawlerRouter.get('/provinces', async (req: Request, res: Response) => {
  try {
    const provinces = await PlaceCrawlerEngine.fetchProvincesFromWikidata();
    const region = req.query.region as string;
    const search = req.query.search as string;

    let filtered = provinces;
    if (region) {
      filtered = filtered.filter((p) => p.region.toLowerCase() === region.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Không thể truy vấn danh sách tỉnh thành từ Wikidata: ' + error.message,
    });
  }
});

/**
 * POST /api/crawler/ingest
 * Kích hoạt cào dữ liệu từ Wikimedia và các nền tảng giao đồ ăn/du lịch, chạy qua bộ lọc 5 tầng
 */
crawlerRouter.post('/ingest', async (req: Request, res: Response) => {
  const city = (req.body.city as string) || 'Đà Nẵng';

  try {
    // 1. Cào dữ liệu văn hóa, lịch sử từ Wikimedia / Wikidata
    const wikiItems = await PlaceCrawlerEngine.fetchWikimediaLandmarks(city);

    // 2. Cào dữ liệu ẩm thực, quán xá, giải trí từ ShopeeFood, GrabFood, Traveloka, Foody
    const deliveryItems = await PlaceCrawlerEngine.fetchDeliveryAndHotspotVenues(city);

    const rawCombined = [...wikiItems, ...deliveryItems];

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
 * Lấy danh sách các địa điểm sạch đã được kiểm duyệt (Ẩm thực, Cafe, Du lịch, Di tích, Giải trí)
 */
crawlerRouter.get('/places', async (req: Request, res: Response) => {
  try {
    const city = (req.query.city as string) || 'Đà Nẵng';
    const category = req.query.category as string;

    const raw1 = await PlaceCrawlerEngine.fetchWikimediaLandmarks(city);
    const raw2 = await PlaceCrawlerEngine.fetchDeliveryAndHotspotVenues(city);
    let cleaned = await PlaceCrawlerEngine.runZeroGarbagePipeline([...raw1, ...raw2], city);

    if (category && category !== 'Tất cả') {
      cleaned = cleaned.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    res.json({
      success: true,
      city,
      total: cleaned.length,
      data: cleaned,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu địa điểm: ' + error.message,
    });
  }
});
