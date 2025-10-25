import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import CustomCard from '../components/ui/CustomCard'; // Your reusable card component
//import { API } from '../stores/authStore'; // Your configured Axios instance
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// --- MOCK DATA STRUCTURE ---
// Note: In a real app, this data comes from Naveen's GET /api/submissions/:id
const mockActivityData = {
    id: 1,
    userId: 101,
    templateId: 'HACKATHON_P',
    templateName: 'Major Hackathon Participation',
    status: 'Approved',
    submittedAt: '2025-10-15T10:00:00Z',
    // 'data' holds the fields submitted by Rahul's Dynamic Form
    data: {
        field_title: 'Global Code Sprint 2025',
        field_date: '2025-09-28',
        field_team_size: 4,
        field_summary: 'Developed an AI-powered academic planner.',
    },
    // 'proofs' array contains URLs returned from Shravan's File Upload API
    proofs: [
        { url: 'http://cloudinary.com/proof1.jpg', filename: 'certificate_hackathon.jpg', fileType: 'image/jpeg' }, // cite: 99
        { url: 'http://cloudinary.com/proof2.pdf', filename: 'team_photo.pdf', fileType: 'application/pdf' }, // cite: 99
    ],
};
// --- END MOCK DATA ---

const StatusBadge = ({ status }) => {
    let color, icon;
    switch (status) {
        case 'Approved':
            color = 'success.main';
            icon = <CheckCircleOutlineIcon />;
            break;
        case 'Draft':
            color = 'warning.main';
            icon = <WorkOutlineIcon />;
            break;
        case 'Pending':
        default:
            color = 'info.main';
            icon = <CircularProgress size={16} sx={{ color: color, mr: 1 }} />;
            break;
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: '8px', bgcolor: `${color}10`, color: color, fontWeight: 600 }}>
            {icon}
            <Typography variant="subtitle1" sx={{ ml: 1 }}>{status}</Typography>
        </Box>
    );
};

const ActivityViewPage = () => {
    const { id } = useParams(); // Get the submission ID from the URL: /activity/view/:id
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [id]);

    const fetchSubmissionDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            // Calls Naveen's API: GET /api/submissions/:id
            // const response = await API.get(`/submissions/${id}`);
            // setSubmission(response.data);
            
            // --- MOCK DATA Usage ---
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setSubmission(mockActivityData);
            // --- END MOCK DATA ---

        } catch (err) {
            console.error("Failed to fetch activity details:", err);
            setError('Could not load activity details. Submission may not exist.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={60} color="primary" />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!submission) {
        return <Alert severity="info">Activity not found.</Alert>;
    }

    const formatSubmissionDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    
    // Helper function to capitalize and space out snake_case or camelCase keys
    const formatLabel = (key) => {
        return key.replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .replace('Field', '');
    };


    return (
        <Box sx={{ p: 2 }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mb: 3 }}
            >
                Back to Dashboard
            </Button>

            <Grid container spacing={3}>
                {/* --- HEADER & STATUS (Left Column) --- */}
                <Grid item xs={12} md={8}>
                    <CustomCard>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h5" color="primary.main" fontWeight={700}>
                                {submission.templateName}
                            </Typography>
                            <StatusBadge status={submission.status} />
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <WorkOutlineIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">
                                    **Activity Title:** {submission.data.field_title}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <CalendarMonthIcon sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                    Submitted: {formatSubmissionDate(submission.submittedAt)}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* --- DYNAMIC FORM DATA DISPLAY --- */}
                        <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
                            Submission Details
                        </Typography>
                        <Grid container spacing={2}>
                            {Object.entries(submission.data).map(([key, value]) => (
                                key !== 'field_title' && ( // Don't show the title again
                                    <Grid item xs={12} sm={6} key={key}>
                                        <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: '6px' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatLabel(key)}:
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {value}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )
                            ))}
                        </Grid>
                    </CustomCard>
                </Grid>

                {/* --- PROOFS/ATTACHMENTS (Right Column) --- */}
                <Grid item xs={12} md={4}>
                    <CustomCard title="Attached Proofs" sx={{ height: '100%' }}>
                        <List>
                            {submission.proofs.length > 0 ? (
                                submission.proofs.map((proof, index) => (
                                    <ListItem 
                                        key={index} 
                                        disablePadding 
                                        secondaryAction={
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                target="_blank" 
                                                href={proof.url} 
                                                rel="noopener noreferrer"
                                            >
                                                View
                                            </Button>
                                        }
                                    >
                                        <ListItemIcon>
                                            <AttachFileIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={proof.filename} 
                                            secondary={proof.fileType.split('/')[1]?.toUpperCase() || 'File'} 
                                        />
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No proof files were attached to this submission.
                                </Typography>
                            )}
                        </List>
                        {submission.status === 'Draft' && (
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="secondary" 
                                sx={{ mt: 3 }}
                                onClick={() => navigate(`/activity/edit/${submission.id}`)} // Placeholder edit route
                            >
                                Edit Draft Submission
                            </Button>
                        )}
                    </CustomCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ActivityViewPage;