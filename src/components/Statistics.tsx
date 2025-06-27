import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Button,
  TextField,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Analytics,
  Link,
  Schedule,
  Mouse,
  Clear,
  Refresh
} from '@mui/icons-material';
import { useUrlStorage } from '../hooks/useUrlStorage';
import { ShortenedUrl } from '../types';
import { logger } from '../utils/logger';

const Statistics: React.FC = () => {
  const { getAllUrls, clearAllUrls } = useUrlStorage();
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  const allUrls = getAllUrls();

  const toggleRowExpansion = (urlId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [urlId]: !prev[urlId]
    }));
    logger.info('Toggled row expansion', { urlId, expanded: !expandedRows[urlId] }, 'Statistics');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all URLs and statistics? This action cannot be undone.')) {
      clearAllUrls();
      logger.info('Cleared all URLs and statistics', {}, 'Statistics');
    }
  };

  const isExpired = (url: ShortenedUrl): boolean => {
    return Date.now() > url.expiresAt;
  };

  const getStatusChip = (url: ShortenedUrl) => {
    if (!url.isActive) {
      return <Chip label="Inactive" color="default" size="small" />;
    }
    if (isExpired(url)) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  const filteredAndSortedUrls = useMemo(() => {
    let filtered = allUrls;

    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(url => url.isActive && !isExpired(url));
    } else if (filterStatus === 'expired') {
      filtered = filtered.filter(url => !url.isActive || isExpired(url));
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'clicks':
          aValue = a.clicks.length;
          bValue = b.clicks.length;
          break;
        case 'shortCode':
          aValue = a.shortCode.toLowerCase();
          bValue = b.shortCode.toLowerCase();
          break;
        case 'expiresAt':
          aValue = a.expiresAt;
          bValue = b.expiresAt;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [allUrls, sortBy, sortOrder, filterStatus]);

  const totalUrls = allUrls.length;
  const activeUrls = allUrls.filter(url => url.isActive && !isExpired(url)).length;
  const totalClicks = allUrls.reduce((sum, url) => sum + url.clicks.length, 0);
  const expiredUrls = allUrls.filter(url => isExpired(url)).length;

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Analytics color="primary" />
        URL Statistics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                {totalUrls}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main" gutterBottom>
                {activeUrls}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main" gutterBottom>
                {totalClicks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main" gutterBottom>
                {expiredUrls}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {totalUrls === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          No URLs have been shortened yet. Go to the URL Shortener tab to create your first short URL!
        </Alert>
      ) : (
        <Paper elevation={3}>
          {/* Filters and Controls */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="clicks">Click Count</MenuItem>
                <MenuItem value="shortCode">Short Code</MenuItem>
                <MenuItem value="expiresAt">Expiry Date</MenuItem>
              </TextField>

              <TextField
                select
                label="Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                size="small"
                sx={{ minWidth: 100 }}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </TextField>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Clear />}
                  onClick={handleClearAll}
                  size="small"
                >
                  Clear All
                </Button>
              </Box>
            </Box>
          </Box>

          {/* URLs Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Short Code</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Clicks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedUrls.map((url) => (
                  <React.Fragment key={url.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(url.id)}
                        >
                          {expandedRows[url.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Link fontSize="small" color="action" />
                          <Typography variant="body2" fontFamily="monospace">
                            {url.shortCode}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(url)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(url.expiresAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({formatDuration(url.validityMinutes)})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Mouse fontSize="small" color="action" />
                          <Typography variant="body2">
                            {url.clicks.length}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={expandedRows[url.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Click Details ({url.clicks.length} total)
                            </Typography>
                            {url.clicks.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No clicks recorded yet.
                              </Typography>
                            ) : (
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Timestamp</TableCell>
                                      <TableCell>User Agent</TableCell>
                                      <TableCell>Referrer</TableCell>
                                      <TableCell>IP</TableCell>
                                      <TableCell>Location</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {url.clicks
                                      .sort((a, b) => b.timestamp - a.timestamp)
                                      .map((click) => (
                                      <TableRow key={click.id}>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {formatDateTime(click.timestamp)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography 
                                            variant="body2" 
                                            sx={{ 
                                              maxWidth: 200,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }}
                                          >
                                            {click.userAgent}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {click.referrer || 'Direct'}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2" fontFamily="monospace">
                                            {click.ip}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {click.location}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredAndSortedUrls.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No URLs match the current filters.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Statistics;