import React, { useState, useEffect } from 'react';

interface HealthStatus {
  elasticsearch: boolean;
  redis: boolean;
  indexer: boolean;
  syncService: boolean;
}

interface SyncStatus {
  isRunning: boolean;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  totalSynced: number;
  errors: string[];
  progress: number;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface IndexerStats {
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  avgProcessingTime: number;
  lastProcessedAt: string | null;
  isRunning: boolean;
}

const ElasticsearchDashboardPage: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    elasticsearch: false,
    redis: false,
    indexer: false,
    syncService: false
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSyncAt: null,
    nextSyncAt: null,
    totalSynced: 0,
    errors: [],
    progress: 0
  });
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [indexerStats, setIndexerStats] = useState<IndexerStats>({
    totalProcessed: 0,
    totalSuccess: 0,
    totalFailed: 0,
    avgProcessingTime: 0,
    lastProcessedAt: null,
    isRunning: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
  const mockData = {
    healthStatus: {
      elasticsearch: true,
      redis: true,
      indexer: true,
      syncService: true
    },
    syncStatus: {
      isRunning: false,
      lastSyncAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      nextSyncAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
      totalSynced: 15420,
      errors: [],
      progress: 100
    },
    queueStats: {
      pending: 5,
      processing: 2,
      completed: 15420,
      failed: 3,
      total: 15430
    },
    indexerStats: {
      totalProcessed: 15420,
      totalSuccess: 15417,
      totalFailed: 3,
      avgProcessingTime: 125,
      lastProcessedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      isRunning: true
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        setHealthStatus(mockData.healthStatus);
        setSyncStatus(mockData.syncStatus);
        setQueueStats(mockData.queueStats);
        setIndexerStats(mockData.indexerStats);
      } else {
        // In production, fetch real data
        const [healthRes, syncRes, queueRes] = await Promise.all([
          fetch('/api/v1/elasticsearch/health-check'),
          fetch('/api/v1/elasticsearch/sync/status'),
          fetch('/api/v1/elasticsearch/queue/stats')
        ]);

        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealthStatus(healthData.data);
        }

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setSyncStatus(syncData.data.status);
          setIndexerStats(syncData.data.stats);
        }

        if (queueRes.ok) {
          const queueData = await queueRes.json();
          setQueueStats(queueData.data.queue);
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSync = async () => {
    try {
      const response = await fetch('/api/v1/elasticsearch/sync/trigger', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Reload data after sync
        setTimeout(loadDashboardData, 2000);
      }
    } catch (err) {
      console.error('Manual sync error:', err);
    }
  };

  const retryFailedJobs = async () => {
    try {
      const response = await fetch('/api/v1/elasticsearch/queue/retry-failed', {
        method: 'POST'
      });
      
      if (response.ok) {
        loadDashboardData();
      }
    } catch (err) {
      console.error('Retry failed jobs error:', err);
    }
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {status ? '✅' : '❌'} {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Elasticsearch Dashboard</h1>
          <p className="text-gray-600">
            Monitor Elasticsearch sync status and system health
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={triggerManualSync} 
            disabled={syncStatus.isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            ⚡ Manual Sync
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ {error}
        </div>
      )}

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Elasticsearch</h3>
            {getStatusBadge(healthStatus.elasticsearch, 'Healthy')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Redis</h3>
            {getStatusBadge(healthStatus.redis, 'Connected')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Indexer</h3>
            {getStatusBadge(healthStatus.indexer, 'Running')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Sync Service</h3>
            {getStatusBadge(healthStatus.syncService, 'Active')}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Progress */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">📊 Sync Progress</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{syncStatus.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncStatus.progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Synced</p>
                <p className="font-semibold">{syncStatus.totalSynced.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  syncStatus.isRunning 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {syncStatus.isRunning ? '🔄 Running' : '⏸️ Idle'}
                </span>
              </div>
            </div>

            {syncStatus.lastSyncAt && (
              <div className="text-sm">
                <p className="text-gray-600">Last Sync</p>
                <p>{new Date(syncStatus.lastSyncAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Indexer Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">🗄️ Indexer Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Processed</p>
              <p className="font-semibold">{indexerStats.totalProcessed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Success Rate</p>
              <p className="font-semibold">
                {indexerStats.totalProcessed > 0 
                  ? ((indexerStats.totalSuccess / indexerStats.totalProcessed) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Failed</p>
              <p className="font-semibold text-red-600">{indexerStats.totalFailed}</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Time</p>
              <p className="font-semibold">{indexerStats.avgProcessingTime}ms</p>
            </div>
          </div>

          {indexerStats.lastProcessedAt && (
            <div className="text-sm mt-4">
              <p className="text-gray-600">Last Processed</p>
              <p>{new Date(indexerStats.lastProcessedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Queue Management */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">⚙️ Queue Management</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{queueStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{queueStats.processing}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{queueStats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{queueStats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        <button 
          onClick={retryFailedJobs} 
          disabled={queueStats.failed === 0}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          🔄 Retry Failed Jobs ({queueStats.failed})
        </button>
      </div>

      {/* Sync Management */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">🔄 Sync Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium">Sync Status</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              syncStatus.isRunning 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {syncStatus.isRunning ? '🔄 Running' : '⏸️ Idle'}
            </span>
          </div>

          <div>
            <h4 className="font-medium">Next Sync</h4>
            <p className="text-sm text-gray-600">
              {syncStatus.nextSyncAt 
                ? new Date(syncStatus.nextSyncAt).toLocaleString()
                : "Not scheduled"
              }
            </p>
          </div>
        </div>

        {syncStatus.errors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Sync Errors:</strong>
            <ul className="mt-2 list-disc list-inside">
              {syncStatus.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElasticsearchDashboardPage; 