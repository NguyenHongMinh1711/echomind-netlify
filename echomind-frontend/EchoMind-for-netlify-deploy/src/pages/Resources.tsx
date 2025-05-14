import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  Divider,
  Link
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Link as LinkIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useSupabase } from '../contexts/SupabaseContext';
import MainLayout from '../layouts/MainLayout';

// Resource types
type ResourceType = 'article' | 'video' | 'book' | 'link';

// Resource interface
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  type: ResourceType;
  tags: string[];
  is_favorite: boolean;
}

const Resources: React.FC = () => {
  const { supabase, session } = useSupabase();
  const theme = useTheme();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ResourceType | 'all'>('all');

  // Load resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);

        // This would be replaced with actual Supabase query
        // const { data, error } = await supabase
        //   .from('resources')
        //   .select('*')
        //   .order('created_at', { ascending: false });

        // For now, just use placeholder data
        const placeholderData: Resource[] = [
          {
            id: '1',
            title: 'Understanding Depression',
            description: 'A comprehensive guide to understanding depression, its causes, symptoms, and treatment options.',
            url: 'https://www.nimh.nih.gov/health/topics/depression',
            image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
            type: 'article',
            tags: ['depression', 'mental health', 'education'],
            is_favorite: false
          },
          {
            id: '2',
            title: 'Mindfulness Meditation for Anxiety',
            description: 'Learn how mindfulness meditation can help reduce anxiety and improve mental well-being.',
            url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
            image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
            type: 'video',
            tags: ['anxiety', 'meditation', 'mindfulness'],
            is_favorite: true
          },
          {
            id: '3',
            title: 'The Upward Spiral',
            description: 'Using neuroscience to reverse the course of depression, one small change at a time.',
            url: 'https://www.amazon.com/Upward-Spiral-Neuroscience-Reverse-Depression/dp/1626251207',
            image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
            type: 'book',
            tags: ['depression', 'neuroscience', 'self-help'],
            is_favorite: false
          },
          {
            id: '4',
            title: 'Crisis Text Line',
            description: 'Free, 24/7 mental health support via text message.',
            url: 'https://www.crisistextline.org/',
            image_url: 'https://images.unsplash.com/photo-1516387938699-a93567ec168e',
            type: 'link',
            tags: ['crisis', 'support', 'helpline'],
            is_favorite: false
          },
          {
            id: '5',
            title: 'EchoMind Telegram Group Chat',
            description: 'Join our community Telegram group chat for support and discussions.',
            url: 'https://t.me/+R4EEKgf_R585NGI9',
            image_url: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a',
            type: 'link',
            tags: ['community', 'support', 'chat', 'telegram'],
            is_favorite: false
          }
        ];

        setResources(placeholderData);
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [supabase]);

  const handleToggleFavorite = async (id: string) => {
    if (!session?.user) return;

    try {
      // This would be replaced with actual Supabase update
      // const { error } = await supabase
      //   .from('user_favorites')
      //   .upsert({
      //     user_id: session.user.id,
      //     resource_id: id,
      //     is_favorite: !resources.find(r => r.id === id)?.is_favorite
      //   });

      setResources(prev =>
        prev.map(resource =>
          resource.id === id
            ? { ...resource, is_favorite: !resource.is_favorite }
            : resource
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Get icon based on resource type
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'article': return <ArticleIcon />;
      case 'video': return <VideoIcon />;
      case 'book': return <BookIcon />;
      case 'link': return <LinkIcon />;
      default: return <ArticleIcon />;
    }
  };

  // Filter resources based on active tab and search query
  const filteredResources = resources
    .filter(resource =>
      activeTab === 'all' || resource.type === activeTab
    )
    .filter(resource =>
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Resources
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Access a library of mental health resources curated to support your well-being journey.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab label="Articles" value="article" />
            <Tab label="Videos" value="video" />
            <Tab label="Books" value="book" />
            <Tab label="Links" value="link" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredResources.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No resources found matching your criteria.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={resource.image_url}
                    alt={resource.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {resource.title}
                      </Typography>
                      <Box>
                        {getResourceIcon(resource.type)}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {resource.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {resource.tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          onClick={() => setSearchQuery(tag)}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                      size="small"
                      color="primary"
                      component={Link}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
                    >
                      Open
                    </Button>
                    {session && (
                      <Button
                        size="small"
                        color={resource.is_favorite ? 'error' : 'default'}
                        onClick={() => handleToggleFavorite(resource.id)}
                        startIcon={resource.is_favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      >
                        {resource.is_favorite ? 'Favorited' : 'Favorite'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </MainLayout>
  );
};

export default Resources;
