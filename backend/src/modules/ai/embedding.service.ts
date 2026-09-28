/**
 * Embedding & Vector Similarity Service
 * Hỗ trợ chuyển đổi từ khóa/ngữ nghĩa thành vector và tính toán độ tương đồng Cosine Similarity
 */

export class EmbeddingService {
  /**
   * Tính Cosine Similarity giữa 2 vector đa chiều
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Sinh vector ngữ nghĩa từ văn bản (Semantic Feature Vector)
   * Sử dụng ánh xạ trọng số đặc trưng (Feature Vector Weighting) đa chiều
   */
  public static createFeatureVector(
    interests: string[],
    keywords: string[],
    vocabSize = 64
  ): number[] {
    const vector = new Array(vocabSize).fill(0);
    const combinedTokens = [...interests, ...keywords].map((t) => t.toLowerCase().trim());

    for (const token of combinedTokens) {
      // Băm chuỗi thành chỉ mục vector
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % vocabSize;
      vector[index] += 1;
    }

    // Chuẩn hóa vector đơn vị (L2 Normalization)
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map((v) => v / magnitude);
    }
    return vector;
  }
}
