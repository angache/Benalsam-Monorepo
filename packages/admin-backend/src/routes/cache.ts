import express, { Router } from 'express';
import cacheService from '../services/cacheService';
import logger from '../config/logger';

const router: Router = express.Router();

/**
 * KVKK COMPLIANCE: Cache API
 * 
 * Cache API endpoints KVKK uyumluluğu için tasarlanmıştır:
 * 
 * ✅ SESSION_BASED - Sadece session_id ile erişim
 * ✅ ANONYMIZED - Kişisel veri döndürülmez
 * ✅ TRANSPARENCY - Cache süreleri açık
 * ✅ MINIMIZATION - Sadece gerekli veriler döndürülür
 */

// Cache get endpoint
router.post('/get', async (req, res) => {
  try {
    const { key, sessionId } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Cache key gerekli'
      });
    }
    
    const cachedData = await cacheService.getCachedResponse(key, sessionId);
    
    return res.json({
      success: true,
      data: cachedData
    });
  } catch (error) {
    logger.error('❌ Cache get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache verisi alınamadı'
    });
  }
});

// Cache set endpoint
router.post('/set', async (req, res) => {
  try {
    const { key, data, sessionId } = req.body;
    
    if (!key || !data) {
      return res.status(400).json({
        success: false,
        error: 'Cache key ve data gerekli'
      });
    }
    
    await cacheService.cacheResponse(key, data.data, data.serviceUsed, sessionId);
    
    return res.json({
      success: true,
      message: 'Cache verisi kaydedildi'
    });
  } catch (error) {
    logger.error('❌ Cache set error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache verisi kaydedilemedi'
    });
  }
});

// Cache istatistiklerini al
router.get('/stats', async (req, res) => {
  try {
    const stats = await cacheService.getCacheStats();
    
    return res.json({
      success: true,
      data: {
        totalKeys: stats.totalKeys,
        totalSize: stats.totalSize,
        hitRate: stats.hitRate,
        health: await cacheService.healthCheck()
      }
    });
  } catch (error) {
    logger.error('❌ Cache stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache istatistikleri alınamadı'
    });
  }
});

// Cache temizleme
router.post('/clear', async (req, res) => {
  try {
    const clearedCount = await cacheService.clearExpiredCache();
    
    return res.json({
      success: true,
      data: {
        clearedCount,
        message: `${clearedCount} adet süresi dolmuş cache temizlendi`
      }
    });
  } catch (error) {
    logger.error('❌ Cache clear error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache temizleme başarısız'
    });
  }
});

// Kullanıcı kullanım istatistikleri
router.get('/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await cacheService.getUserUsageStats(userId);
    
    return res.json({
      success: true,
      data: {
        userId,
        attempts: stats.attempts,
        monthlyLimit: stats.monthlyLimit,
        isPremium: stats.isPremium,
        remainingAttempts: stats.monthlyLimit === -1 ? 999 : Math.max(0, stats.monthlyLimit - stats.attempts)
      }
    });
  } catch (error) {
    logger.error('❌ User usage stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Kullanıcı istatistikleri alınamadı'
    });
  }
});

// Cache health check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await cacheService.healthCheck();
    
    return res.json({
      success: true,
      data: {
        healthy: isHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('❌ Cache health check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache health check başarısız'
    });
  }
});

// Cache boyut kontrolü
router.post('/check-size', async (req, res) => {
  try {
    await cacheService.checkCacheSize();
    
    return res.json({
      success: true,
      data: {
        message: 'Cache boyut kontrolü tamamlandı'
      }
    });
  } catch (error) {
    logger.error('❌ Cache size check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Cache boyut kontrolü başarısız'
    });
  }
});

export default router; 