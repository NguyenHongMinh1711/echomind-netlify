import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { useSupabase } from '../../contexts/SupabaseContext';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  image_url?: string;
  tags: string[];
  is_saved?: boolean;
  url?: string;
}

const ResourcesList: React.FC = () => {
  const { supabase } = useSupabase();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceType, setResourceType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('resources')
          .select('*');
        
        if (error) throw error;
        
        setResources(data || []);
        setFilteredResources(data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [supabase]);
  
  useEffect(() => {
    // Filter resources based on search term and type
    let filtered = resources;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(term) || 
        resource.description.toLowerCase().includes(term) ||
        resource.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply type filter
    if (resourceType !== 'all') {
      if (resourceType === 'saved') {
        filtered = filtered.filter(resource => resource.is_saved);
      } else {
        filtered = filtered.filter(resource => resource.type === resourceType);
      }
    }
    
    setFilteredResources(filtered);
  }, [resources, searchTerm, resourceType]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeChange = (e: React.SyntheticEvent, newValue: string) => {
    setResourceType(newValue);
  };
  
  const toggleSaveResource = async (id: string, isSaved: boolean) => {
    try {
      // Update local state immediately for better UX
      setResources(prev => 
        prev.map(resource => 
          resource.id === id 
            ? { ...resource, is_saved: !isSaved } 
            : resource
        )
      );
      
      // Update in database
      const { error } = await supabase
        .from('user_saved_resources')
        .upsert(
          { 
            resource_id: id,
            is_saved: !isSaved 
          },
          { onConflict: 'resource_id' }
        );
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving resource:', err);
      // Revert the local state change if the API call failed
      setResources(prev => 
        prev.map(resource => 
          resource.id === id 
            ? { ...resource, is_saved: isSaved } 
            : resource
        )
      );
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Resources
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <Tabs
          value={resourceType}
          onChange={handleTypeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label="All Resources" />
          <Tab value="podcast" label="Podcasts" />
          <Tab value="article" label="Articles" />
          <Tab value="exercise" label="Exercises" />
          <Tab value="saved" label="Saved" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredResources.length === 0 ? (
        <Alert severity="info">No resources found matching your criteria.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {resource.image_url && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={resource.image_url}
                    alt={resource.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {resource.title}
                    </Typography>
                    {resource.is_saved ? (
                      <BookmarkIcon 
                        color="primary" 
                        onClick={() => toggleSaveResource(resource.id, true)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ) : (
                      <BookmarkBorderIcon 
                        onClick={() => toggleSaveResource(resource.id, false)}
                        sx={{ cursor: 'pointer' }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {resource.description}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Chip 
                      label={resource.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    {resource.tags && resource.tags.slice(0, 2).map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ResourcesList;
