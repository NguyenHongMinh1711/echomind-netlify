import { getSupabaseClient, handleSupabaseError } from './supabaseService';

// Resource type
export type ResourceType = 'article' | 'video' | 'book' | 'link';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string;
  type: ResourceType;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

// User favorite type
export interface UserFavorite {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
}

// Resource with favorite status
export interface ResourceWithFavorite extends Resource {
  is_favorite: boolean;
}

// Get all resources
export const getResources = async (): Promise<ResourceWithFavorite[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get all resources
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (resourcesError) {
      throw resourcesError;
    }
    
    // If user is not authenticated, return resources without favorite status
    if (!user) {
      return (resources || []).map(resource => ({
        ...resource,
        is_favorite: false
      }));
    }
    
    // Get user favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('resource_id')
      .eq('user_id', user.id);
    
    if (favoritesError) {
      throw favoritesError;
    }
    
    // Create a set of favorite resource IDs for quick lookup
    const favoriteIds = new Set((favorites || []).map(fav => fav.resource_id));
    
    // Add favorite status to resources
    return (resources || []).map(resource => ({
      ...resource,
      is_favorite: favoriteIds.has(resource.id)
    }));
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get resources by type
export const getResourcesByType = async (type: ResourceType): Promise<ResourceWithFavorite[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get resources by type
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (resourcesError) {
      throw resourcesError;
    }
    
    // If user is not authenticated, return resources without favorite status
    if (!user) {
      return (resources || []).map(resource => ({
        ...resource,
        is_favorite: false
      }));
    }
    
    // Get user favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('resource_id')
      .eq('user_id', user.id);
    
    if (favoritesError) {
      throw favoritesError;
    }
    
    // Create a set of favorite resource IDs for quick lookup
    const favoriteIds = new Set((favorites || []).map(fav => fav.resource_id));
    
    // Add favorite status to resources
    return (resources || []).map(resource => ({
      ...resource,
      is_favorite: favoriteIds.has(resource.id)
    }));
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Get user's favorite resources
export const getFavoriteResources = async (): Promise<ResourceWithFavorite[]> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get user favorites with resources
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        resource_id,
        resources:resource_id (*)
      `)
      .eq('user_id', user.id);
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match ResourceWithFavorite interface
    return (data || []).map(item => ({
      ...item.resources,
      is_favorite: true
    }));
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};

// Toggle favorite status for a resource
export const toggleFavorite = async (resourceId: string, isFavorite: boolean): Promise<void> => {
  try {
    const supabase = getSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (isFavorite) {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          resource_id: resourceId,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        throw error;
      }
    } else {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId);
      
      if (error) {
        throw error;
      }
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error));
  }
};
