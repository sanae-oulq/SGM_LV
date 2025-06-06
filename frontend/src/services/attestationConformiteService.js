import axios from 'axios';

const API_URL = 'http://localhost:5003/api/attestation-conformite';

const attestationConformiteService = {
  // Upload une nouvelle attestation
  upload: async (file, marcheBC) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('marcheBC', marcheBC);

      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'attestation:', error);
      throw error;
    }
  },

  // Récupérer une attestation par son ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'attestation:', error);
      throw error;
    }
  },

  // Récupérer les attestations par marcheBC
  getByMarcheBC: async (marcheBC) => {
    try {
      const response = await axios.get(`${API_URL}/marche/${marcheBC}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des attestations:', error);
      throw error;
    }
  },

  // Télécharger une attestation
  download: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'attestation:', error);
      throw error;
    }
  }
};

export default attestationConformiteService; 