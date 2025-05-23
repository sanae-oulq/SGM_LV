import axios from 'axios';

const API_URL = 'http://localhost:5003/api/pv';

// Services pour PV Provisoire
export const createPVProvisoire = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/provisoire`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getAllPVProvisoires = async () => {
    try {
        const response = await axios.get(`${API_URL}/provisoire`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getPVProvisoireById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/provisoire/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updatePVProvisoire = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/provisoire/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deletePVProvisoire = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/provisoire/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const downloadPVProvisoire = async (id, filename) => {
    try {
        const response = await axios.get(`${API_URL}/provisoire/${id}/download`, {
            responseType: 'blob'
        });
        
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw handleError(error);
    }
};

// Services pour PV Définitif
export const createPVDefinitif = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/definitif`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getAllPVDefinitifs = async () => {
    try {
        const response = await axios.get(`${API_URL}/definitif`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getPVDefinitifById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/definitif/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updatePVDefinitif = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/definitif/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deletePVDefinitif = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/definitif/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const downloadPVDefinitif = async (id, filename) => {
    try {
        const response = await axios.get(`${API_URL}/definitif/${id}/download`, {
            responseType: 'blob'
        });
        
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw handleError(error);
    }
};

// Fonction utilitaire pour gérer les erreurs
const handleError = (error) => {
    if (error.response) {
        // Erreur avec réponse du serveur
        const message = error.response.data.message || 'Une erreur est survenue';
        throw new Error(message);
    } else if (error.request) {
        // Erreur sans réponse du serveur
        throw new Error('Impossible de contacter le serveur');
    } else {
        // Autre type d'erreur
        throw new Error('Une erreur est survenue');
    }
}; 