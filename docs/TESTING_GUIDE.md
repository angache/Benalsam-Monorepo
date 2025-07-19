# 🧪 Turkish Search & Queue System Testing Guide

## 📋 Genel Bakış

Bu rehber, Benalsam projesindeki Turkish search ve queue sistemi entegrasyonunu test etmek için kapsamlı test prosedürlerini içerir.

**Tarih:** 19 Temmuz 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready

---

## 🚀 Hızlı Test Başlangıcı

### 1. Sistem Durumu Kontrolü

```bash
# Tüm servislerin çalışıp çalışmadığını kontrol et
docker-compose -f docker-compose.dev.yml ps

# Beklenen çıktı:
# ✅ admin-backend: Up
# ✅ elasticsearch: Up  
# ✅ redis: Up
# ✅ admin-ui: Up
```

### 2. Health Check Testleri

```bash
# Admin Backend Health Check
curl -s http://localhost:3002/health | jq .

# Elasticsearch Health Check
curl -s http://localhost:3002/api/v1/elasticsearch/health | jq .

# Redis Health Check
curl -s http://localhost:3002/api/v1/elasticsearch/testRedisConnection | jq .
```

---

## 🔍 Turkish Search Testleri

### 1. Temel Arama Testi

```bash
# iPhone araması
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":5}' | jq .

# Beklenen sonuç:
# - 3 sonuç bulunmalı
# - Turkish analyzer çalışmalı
# - Relevance scoring doğru olmalı
```

### 2. Turkish Language Testleri

```bash
# Türkçe karakter testi
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"çok iyi","page":1,"limit":5}' | jq .

# Türkçe kelime testi
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"telefon","page":1,"limit":5}' | jq .

# Kategori araması
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"elektronik","page":1,"limit":5}' | jq .
```

### 3. Gelişmiş Arama Testleri

```bash
# Filtreli arama
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "telefon",
    "filters": {
      "budget_min": 1000,
      "budget_max": 50000
    },
    "page": 1,
    "limit": 5
  }' | jq .

# Sıralama testi
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "elektronik",
    "sort": "created_at",
    "page": 1,
    "limit": 5
  }' | jq .
```

---

## 🔄 Queue System Testleri

### 1. Queue Stats Kontrolü

```bash
# Queue istatistikleri
curl -s http://localhost:3002/api/v1/elasticsearch/queue/stats | jq .

# Beklenen çıktı:
# {
#   "success": true,
#   "data": [
#     {
#       "total_jobs": 0,
#       "pending_jobs": 0,
#       "processing_jobs": 0,
#       "completed_jobs": 0,
#       "failed_jobs": 0
#     }
#   ]
# }
```

### 2. Queue Processor Durumu

```bash
# Admin backend loglarını kontrol et
docker-compose -f docker-compose.dev.yml logs admin-backend --tail=10

# Beklenen loglar:
# ✅ Queue processor started
# ✅ Processing queue jobs...
# ✅ No pending jobs
```

### 3. Manual Queue Test

```bash
# Manuel sync tetikleme
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/triggerManualSync" | jq .

# Sync status kontrolü
curl -s http://localhost:3002/api/v1/elasticsearch/syncStatus | jq .
```

---

## 📊 Elasticsearch Stats Testleri

### 1. Index İstatistikleri

```bash
# Index stats
curl -s http://localhost:3002/api/v1/elasticsearch/stats | jq .

# Beklenen çıktı:
# - Index: benalsam_listings
# - Documents: 12+
# - Status: green
# - Size: ~37KB
```

### 2. Cluster Health

```bash
# Cluster health
curl -s http://localhost:9200/_cluster/health | jq .

# Beklenen çıktı:
# - Status: green
# - Nodes: 1
# - Active shards: 1
```

### 3. Index Mapping Kontrolü

```bash
# Index mapping
curl -s "http://localhost:9200/benalsam_listings/_mapping" | jq .

# Kontrol edilecek alanlar:
# ✅ title: turkish_analyzer
# ✅ description: turkish_analyzer
# ✅ location: text (not geo_point)
# ✅ latitude/longitude: float
```

---

## 🔧 Reindex Testleri

### 1. Manuel Reindex

```bash
# Reindex tetikleme
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/reindex" | jq .

# Beklenen çıktı:
# {
#   "success": true,
#   "data": {
#     "indexed": 12,
#     "duration": "~2s"
#   }
# }
```

### 2. Reindex Sonrası Kontrol

```bash
# Reindex sonrası stats
curl -s http://localhost:3002/api/v1/elasticsearch/stats | jq .

# Search testi
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"test","page":1,"limit":1}' | jq .
```

---

## 🐳 Docker Container Testleri

### 1. Container Durumu

```bash
# Container status
docker-compose -f docker-compose.dev.yml ps

# Container logs
docker-compose -f docker-compose.dev.yml logs elasticsearch --tail=5
docker-compose -f docker-compose.dev.yml logs redis --tail=5
docker-compose -f docker-compose.dev.yml logs admin-backend --tail=10
```

### 2. Container İçi Testler

```bash
# Elasticsearch container testi
docker-compose -f docker-compose.dev.yml exec elasticsearch curl -s localhost:9200/_cluster/health

# Redis container testi
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping

# Admin backend environment testi
docker-compose -f docker-compose.dev.yml exec admin-backend env | grep ELASTICSEARCH
```

---

## 🔍 Performance Testleri

### 1. Search Performance

```bash
# Search response time testi
time curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":5}' > /dev/null

# Beklenen süre: < 200ms
```

### 2. Concurrent Search Test

```bash
# Paralel arama testi
for i in {1..5}; do
  curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
    -H "Content-Type: application/json" \
    -d '{"query":"test","page":1,"limit":1}' &
done
wait

echo "Concurrent search test completed"
```

### 3. Memory Usage Test

```bash
# Container memory kullanımı
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 🧪 Integration Testleri

### 1. End-to-End Test

```bash
#!/bin/bash
echo "🧪 Starting E2E Test..."

# 1. Health check
echo "1. Health check..."
health=$(curl -s http://localhost:3002/health | jq -r '.status')
if [ "$health" = "ok" ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# 2. Elasticsearch health
echo "2. Elasticsearch health..."
es_health=$(curl -s http://localhost:3002/api/v1/elasticsearch/health | jq -r '.data.cluster_name')
if [ -n "$es_health" ]; then
  echo "✅ Elasticsearch health passed"
else
  echo "❌ Elasticsearch health failed"
  exit 1
fi

# 3. Search test
echo "3. Search test..."
search_result=$(curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":1}' | jq -r '.success')
if [ "$search_result" = "true" ]; then
  echo "✅ Search test passed"
else
  echo "❌ Search test failed"
  exit 1
fi

# 4. Queue stats
echo "4. Queue stats..."
queue_stats=$(curl -s http://localhost:3002/api/v1/elasticsearch/queue/stats | jq -r '.success')
if [ "$queue_stats" = "true" ]; then
  echo "✅ Queue stats passed"
else
  echo "❌ Queue stats failed"
  exit 1
fi

echo "🎉 All tests passed!"
```

### 2. Turkish Search E2E Test

```bash
#!/bin/bash
echo "🇹🇷 Turkish Search E2E Test..."

# Test queries
queries=("iphone" "telefon" "elektronik" "çok iyi" "temiz")

for query in "${queries[@]}"; do
  echo "Testing query: $query"
  result=$(curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"$query\",\"page\":1,\"limit\":1}" | jq -r '.success')
  
  if [ "$result" = "true" ]; then
    echo "✅ Query '$query' passed"
  else
    echo "❌ Query '$query' failed"
  fi
done
```

---

## 🐛 Troubleshooting Testleri

### 1. Connection Issues

```bash
# Elasticsearch connection test
curl -s http://localhost:9200/_cluster/health || echo "❌ Elasticsearch connection failed"

# Redis connection test
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping || echo "❌ Redis connection failed"

# Admin backend connection test
curl -s http://localhost:3002/health || echo "❌ Admin backend connection failed"
```

### 2. Memory Issues

```bash
# Elasticsearch memory
curl -s http://localhost:9200/_nodes/stats/jvm | jq '.nodes[].jvm.mem.heap_used_percent'

# Container memory
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}"
```

### 3. Index Issues

```bash
# Index exists check
curl -s http://localhost:9200/_cat/indices | grep benalsam_listings

# Index mapping check
curl -s "http://localhost:9200/benalsam_listings/_mapping" | jq '.benalsam_listings.mappings.properties.title.analyzer'
```

---

## 📊 Test Raporu Template

### Test Sonuçları

```bash
# Test raporu oluştur
echo "📊 Test Raporu - $(date)" > test_report.txt
echo "========================" >> test_report.txt

# Health checks
echo "Health Checks:" >> test_report.txt
curl -s http://localhost:3002/health | jq . >> test_report.txt
echo "" >> test_report.txt

# Elasticsearch stats
echo "Elasticsearch Stats:" >> test_report.txt
curl -s http://localhost:3002/api/v1/elasticsearch/stats | jq . >> test_report.txt
echo "" >> test_report.txt

# Search test
echo "Search Test Results:" >> test_report.txt
curl -s -X POST "http://localhost:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"iphone","page":1,"limit":3}' | jq . >> test_report.txt

echo "Test raporu oluşturuldu: test_report.txt"
```

---

## 🎯 Test Checklist

### ✅ Sistem Durumu
- [ ] Tüm Docker container'lar çalışıyor
- [ ] Health check endpoint'leri çalışıyor
- [ ] Environment variables doğru set edilmiş

### ✅ Elasticsearch
- [ ] Cluster status: green
- [ ] Index oluşturulmuş: benalsam_listings
- [ ] Turkish analyzer konfigürasyonu doğru
- [ ] 12+ document indexed

### ✅ Turkish Search
- [ ] "iphone" araması çalışıyor
- [ ] Türkçe karakterler destekleniyor
- [ ] Relevance scoring doğru
- [ ] Response time < 200ms

### ✅ Queue System
- [ ] Queue stats endpoint çalışıyor
- [ ] Queue processor background'da çalışıyor
- [ ] PostgreSQL bağlantısı aktif
- [ ] Error handling çalışıyor

### ✅ Performance
- [ ] Search response time < 200ms
- [ ] Memory usage < 1GB (Elasticsearch)
- [ ] Concurrent requests destekleniyor
- [ ] No memory leaks

---

## 🚀 Production Test Komutları

```bash
# Production environment test
export ELASTICSEARCH_URL=http://your-production-es:9200
export SUPABASE_URL=https://your-production-supabase.co

# Health check
curl -s http://your-production-admin:3002/health

# Search test
curl -s -X POST "http://your-production-admin:3002/api/v1/elasticsearch/search" \
  -H "Content-Type: application/json" \
  -d '{"query":"test","page":1,"limit":5}'
```

---

**Son Güncelleme:** 19 Temmuz 2025  
**Versiyon:** 1.0.0  
**Durum:** ✅ Production Ready 