import axios from 'axios';

const API_URL = 'http://localhost:5003/api/pvrpt';

const pvrptService = {
    // Créer un nouveau PVRPT
    create: async (data) => {
        try {
            const formData = new FormData();
            formData.append('datePVRPT', data.datePVRPT);
            formData.append('BL', data.BL);
            formData.append('avecReserve', data.avecReserve);
            formData.append('marcheBC', data.marcheBC);
            if (data.document) {
                formData.append('document', data.document);
            }

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du PVRPT:', error);
            throw error;
        }
    },

    // Récupérer tous les PVRPT
    getAll: async () => {
        try {
            console.log('Appel API getAll:', API_URL);
            const response = await axios.get(API_URL);
            console.log('Réponse getAll:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des PVRPT:', error);
            throw error;
        }
    },

    // Mettre à jour un PVRPT
    update: async (BL, data) => {
        try {
            const formData = new FormData();
            formData.append('datePVRPT', data.datePVRPT);
            formData.append('BL', data.BL);
            formData.append('avecReserve', data.avecReserve);
            formData.append('marcheBC', data.marcheBC);
            if (data.document && data.document !== 'Aucun') {
                formData.append('document', data.document);
            }

            const response = await axios.put(`${API_URL}/${BL}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du PVRPT:', error);
            throw error;
        }
    },

    // Supprimer un PVRPT
    delete: async (BL) => {
        try {
            const response = await axios.delete(`${API_URL}/${BL}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression du PVRPT:', error);
            throw error;
        }
    },

    // Télécharger un fichier
    downloadFile: async (BL) => {
        try {
            const response = await axios.get(`${API_URL}/${BL}/download`, {
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

export default pvrptService; 