import { api } from '../api';

export const workspacesAPI = {
  // Listar espaços de trabalho
  getWorkspaces: (params = {}) => {
    return api.get('/workspaces/workspaces/', { params });
  },

  // Obter detalhes de um espaço
  getWorkspace: (slug) => {
    return api.get(`/workspaces/workspaces/${slug}/`);
  },

  // Criar novo espaço
  createWorkspace: (data) => {
    const formData = new FormData();
    
    // Adicionar campos básicos
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        // Adicionar imagens
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      } else if (key === 'categories') {
        // Adicionar categorias
        data.categories.forEach(categoryId => {
          formData.append('categories', categoryId);
        });
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.post('/workspaces/workspaces/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Atualizar espaço
  updateWorkspace: (slug, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      } else if (key === 'categories') {
        data.categories.forEach(categoryId => {
          formData.append('categories', categoryId);
        });
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.patch(`/workspaces/workspaces/${slug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Deletar espaço
  deleteWorkspace: (slug) => {
    return api.delete(`/workspaces/workspaces/${slug}/`);
  },

  // Favoritar/desfavoritar espaço
  toggleFavorite: (slug) => {
    return api.post(`/workspaces/workspaces/${slug}/favorite/`);
  },

  // Reivindicar espaço
  claimWorkspace: (slug) => {
    return api.post(`/workspaces/workspaces/${slug}/claim/`);
  },

  // Espaços em destaque
  getFeaturedWorkspaces: () => {
    return api.get('/workspaces/workspaces/featured/');
  },

  // Espaços mais bem avaliados
  getTopRatedWorkspaces: () => {
    return api.get('/workspaces/workspaces/top_rated/');
  },

  // Espaços mais avaliados
  getMostReviewedWorkspaces: () => {
    return api.get('/workspaces/workspaces/most_reviewed/');
  },

  // Upload de imagem para espaço
  uploadWorkspaceImage: (slug, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData.image);
    formData.append('image_type', imageData.image_type || 'interior');
    formData.append('caption', imageData.caption || '');
    formData.append('alt_text', imageData.alt_text || '');

    return api.post(`/workspaces/workspaces/${slug}/upload-image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Obter favoritos do usuário
  getUserFavorites: () => {
    return api.get('/workspaces/favorites/');
  },

  // Sugestões de busca
  getSearchSuggestions: (query) => {
    return api.get('/workspaces/search/suggestions/', {
      params: { q: query }
    });
  },

  // Estatísticas gerais
  getStats: () => {
    return api.get('/workspaces/stats/');
  },

  // Categorias
  getCategories: () => {
    return api.get('/workspaces/categories/');
  },

  // Avaliações
  getReviews: (params = {}) => {
    return api.get('/workspaces/reviews/', { params });
  },

  // Criar avaliação
  createReview: (data) => {
    const formData = new FormData();
    
    // Adicionar campos básicos
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        // Adicionar imagens
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.post('/workspaces/reviews/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Atualizar avaliação
  updateReview: (id, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        data.images.forEach((image, index) => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    return api.patch(`/workspaces/reviews/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Deletar avaliação
  deleteReview: (id) => {
    return api.delete(`/workspaces/reviews/${id}/`);
  },

  // Obter avaliações do usuário
  getMyReviews: () => {
    return api.get('/workspaces/reviews/my_reviews/');
  },

  // Upload de imagem para avaliação
  uploadReviewImage: (reviewId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData.image);
    formData.append('caption', imageData.caption || '');
    formData.append('alt_text', imageData.alt_text || '');

    return api.post(`/workspaces/reviews/${reviewId}/upload-image/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};