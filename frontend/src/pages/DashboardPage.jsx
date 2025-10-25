// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; 
import { Box, Typography, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuthStore, { API } from '../stores/authStore';
import CustomTable from '../components/ui/CustomTable'; 
import FilterBar from '../components/ui/FilterBar'; 
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Define the structure for the submission list (mock data structure)
const mockSubmissions = [
  { id: 1, templateName: 'Hackathon Participation', date: '2025-10-15', status: 'Pending', proofs: ['url1'] },
  { id: 2, templateName: 'Seminar Attended', date: '2025-10-01', status: 'Approved', proofs: ['url2', 'url3'] },
  { id: 3, templateName: 'Sports Event Winner', date: '2025-09-20', status: 'Draft', proofs: [] },
];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ templateType: '', dateRange: { from: null, to: null } });

  // Dependency Fix: Wrapped fetchSubmissions in useCallback
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = user?.id;
      if (!userId) throw new Error("User ID is missing.");
      
      let query = `?userId=${userId}`;

      if (filters.templateType) query += `&templateId=${filters.templateType}`;
      if (filters.dateRange.from) query += `&from=${filters.dateRange.from}`; 
      if (filters.dateRange.to) query += `&to=${filters.dateRange.to}`; 

      // Calls Naveen's API: GET /api/submissions?userId=<id>&filters... 
      await API.get(`/submissions${query}`); 
      
      // NOTE: Using mock data until actual API is ready (remove these lines when integrating)
      setSubmissions(mockSubmissions); 
      
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError(err.message || 'Could not load your activities.');
    } finally {
      setLoading(false);
    }
  }, [user.id, filters]); // Dependencies for useCallback: user.id and filters

  // Dependency Fix: useEffect now depends only on the stable fetchSubmissions function
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]); 

  const handleViewDetails = (submissionId) => {
    navigate(`/activity/view/${submissionId}`);
  };

  const tableHeaders = [
    { id: 'templateName', label: 'Activity Type' },
    { id: 'date', label: 'Date Submitted' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions', align: 'right' },
  ];
  
  const tableRows = submissions.map(sub => ({
      ...sub,
      actions: (
          <Button 
              variant="outlined" 
              size="small" 
              onClick={() => handleViewDetails(sub.id)}
          >
              View Details
          </Button>
      )
  }));


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} />
            My Dashboard
        </Typography>
        <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/activity/add')} // Rahul's page [cite: 63]
        >
            Add New Activity
        </Button>
      </Box>

      [cite_start]{/* Filter Component (using the FilterBar you created) [cite: 22] */}
      <FilterBar filters={filters} setFilters={setFilters} /> 
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Submitted Activities
          </Typography>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <CustomTable 
              headers={tableHeaders} 
              rows={tableRows}
              // Pagination/sorting props would go here
            />
          )}

          {!loading && !error && submissions.length === 0 && (
            <Alert severity="info">
                You haven't submitted any activities yet.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;