import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const AuthFormWrapper = ({ title, children }) => {
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>{title}</Typography>
        {children}
      </Box>
    </Container>
  );
};

export default AuthFormWrapper;