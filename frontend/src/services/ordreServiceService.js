import axios from 'axios';

const API_URL = 'http://localhost:5003/api/ordreservices';

const ordreServiceService = {
    // Créer un nouvel ordre de service
    create: async (data) => {
        try {
            const formData = new FormData();
            formData.append('numeroOS', data.numeroOrdreService);
            formData.append('dateOS', data.dateOrdreService);
            formData.append('typeOS', data.typeOs);
            formData.append('marcheBC', data.marcheBC);        // Ajoutez cette ligne
            
            if (data.fichier) {
                formData.append('fichier', data.fichier);
            }

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'ordre de service:', error);
            throw error;
        }
    },

    // Récupérer tous les ordres de service
    getAll: async () => {
        try {
            console.log('Appel API getAll:', API_URL);
            const response = await axios.get(API_URL);
            console.log('Réponse getAll:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des ordres de service:', error);
            throw error;
        }
    },

    // Mettre à jour un ordre de service
    update: async (numeroOS, data) => {
        try {
            const formData = new FormData();
            formData.append('numeroOS', data.numeroOrdreService);
            formData.append('dateOS', data.dateOrdreService);
            formData.append('typeOS', data.typeOs);
            formData.append('marcheBC', data.marcheBC);        // Ajoutez cette ligne
            
            if (data.fichier && data.fichier !== 'Aucun') {
                formData.append('fichier', data.fichier);
            }

            const response = await axios.put(`${API_URL}/${numeroOS}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'ordre de service:', error);
            throw error;
        }
    },

    // Supprimer un ordre de service
    delete: async (numeroOS) => {
        try {
            const response = await axios.delete(`${API_URL}/${numeroOS}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'ordre de service:', error);
            throw error;
        }
    },

    // Télécharger un fichier
    downloadFile: async (numeroOS) => {
        try {
            const response = await axios.get(`${API_URL}/${numeroOS}/download`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/octet-stream',
                    'Accept-Charset': 'UTF-8'
                }
            });
            return response;
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier:', error);
            throw error;
        }
    }
};

export default ordreServiceService; 