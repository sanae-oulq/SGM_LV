import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const amarcheService = {
  // Créer un nouveau marché
  createAMarche: async (marcheData) => {
    try {
      const response = await axios.post(`${API_URL}/amarche`, marcheData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer tous les marchés
  getAllAMarches: async () => {
    try {
      const response = await axios.get(`${API_URL}/amarche`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Récupérer un marché par son ID
  getAMarcheById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/amarche/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mettre à jour un marché
  updateAMarche: async (id, marcheData) => {
    try {
      const response = await axios.put(`${API_URL}/amarche/${id}`, marcheData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Supprimer un marché
  deleteAMarche: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/amarche/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default amarcheService; 