import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportIcon from '@mui/icons-material/Assessment';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const drawerWidth = 240;

const Sidebar = () => {
  const {  } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }, // cite: 10
    { text: 'Submit Activity', icon: <AddCircleIcon />, path: '/activity/add' },
    // Placeholder Admin Routes
    { text: 'Manage Templates', icon: <AdminPanelSettingsIcon />, path: '/admin/templates', admin: true }, // cite: 12
    { text: 'View Reports', icon: <ReportIcon />, path: '/admin/reports', admin: true }, // cite: 13
  ];

  // Simple logic to show admin links (You can refine this using user roles from the authStore)
  const isAdmin = true; // Temporary flag for development visibility

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'primary.dark' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
          EAD Tracker
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navItems.filter(item => !item.admin || isAdmin).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ py: 0.5 }}>
              <ListItemButton 
                component={RouterLink} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  color: 'white',
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main', // Highlight selected item
                    color: 'primary.main',
                    borderRadius: '8px',
                    margin: '0 8px',
                    '&:hover': {
                      bgcolor: 'secondary.light',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;