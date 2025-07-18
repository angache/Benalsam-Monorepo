import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  Queue as QueueIcon,
  Sync as SyncIcon
} from '@mui/icons-material';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const getStatusChip = (status: boolean, label: string) => {
    return (
      <Chip
        icon={status ? <CheckCircleIcon /> : <ErrorIcon />}
        label={label}
        color={status ? 'success' : 'error'}
        variant="outlined"
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Elasticsearch Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Monitor Elasticsearch sync status and system health
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDashboardData}
              sx={{ minWidth: 120 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<BoltIcon />}
              onClick={triggerManualSync}
              disabled={syncStatus.isRunning}
              sx={{ minWidth: 140 }}
            >
              Manual Sync
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Health Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Elasticsearch
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Active
                  </Typography>
                </Box>
                {getStatusChip(healthStatus.elasticsearch, 'Healthy')}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Redis
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Connected
                  </Typography>
                </Box>
                {getStatusChip(healthStatus.redis, 'Connected')}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Indexer
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Running
                  </Typography>
                </Box>
                {getStatusChip(healthStatus.indexer, 'Running')}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                    Sync Service
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Active
                  </Typography>
                </Box>
                {getStatusChip(healthStatus.syncService, 'Active')}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sync Progress */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Sync Progress
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {syncStatus.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={syncStatus.progress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Synced
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {syncStatus.totalSynced.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={syncStatus.isRunning ? <SyncIcon /> : <InfoIcon />}
                      label={syncStatus.isRunning ? 'Running' : 'Idle'}
                      color={syncStatus.isRunning ? 'primary' : 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Paper>
                </Grid>
              </Grid>

              {syncStatus.lastSyncAt && (
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Sync
                  </Typography>
                  <Typography variant="body2">
                    {new Date(syncStatus.lastSyncAt).toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Indexer Stats */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <StorageIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Indexer Statistics
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="body2" color="primary.main">
                      Total Processed
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {indexerStats.totalProcessed.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Typography variant="body2" color="success.main">
                      Success Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {indexerStats.totalProcessed > 0 
                        ? ((indexerStats.totalSuccess / indexerStats.totalProcessed) * 100).toFixed(1)
                        : 0}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
                    <Typography variant="body2" color="error.main">
                      Failed
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {indexerStats.totalFailed}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="body2" color="warning.main">
                      Avg Time
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                      {indexerStats.avgProcessingTime}ms
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {indexerStats.lastProcessedAt && (
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                  color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Processed
                  </Typography>
                  <Typography variant="body2">
                    {new Date(indexerStats.lastProcessedAt).toLocaleString()}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Queue Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <QueueIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Queue Management
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                  {queueStats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 1 }}>
                  {queueStats.processing}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Processing
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                  {queueStats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}>
                  {queueStats.failed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={retryFailedJobs}
            disabled={queueStats.failed === 0}
            sx={{ minWidth: 200 }}
          >
            Retry Failed Jobs ({queueStats.failed})
          </Button>
        </CardContent>
      </Card>

      {/* Sync Management */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SyncIcon sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Sync Management
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Sync Status
                </Typography>
                <Chip
                  icon={syncStatus.isRunning ? <SyncIcon /> : <InfoIcon />}
                  label={syncStatus.isRunning ? 'Running' : 'Idle'}
                  color={syncStatus.isRunning ? 'primary' : 'default'}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                color: theme.palette.mode === 'dark' ? 'white' : 'inherit'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Next Sync
                </Typography>
                <Typography variant="body2">
                  {syncStatus.nextSyncAt 
                    ? new Date(syncStatus.nextSyncAt).toLocaleString()
                    : "Not scheduled"
                  }
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {syncStatus.errors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Sync Errors
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {syncStatus.errors.map((error, index) => (
                  <Typography component="li" key={index} variant="body2">
                    {error}
                  </Typography>
                ))}
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ElasticsearchDashboardPage; 