        import axios from 'axios';

const API_URL = 'http://localhost:5003/api/facture';

const factureService = {
    // Créer une nouvelle facture
    create: async (data) => {
        try {
            const formData = new FormData();
            formData.append('numFacture', data.numFacture);
            formData.append('dateFacture', data.dateFacture);
            formData.append('montant', data.montant);
            formData.append('bl', data.bl);
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
            console.error('Erreur lors de la création de la facture:', error);
            throw error;
        }
    },

    // Récupérer toutes les factures
    getAll: async () => {
        try {
            console.log('Appel API getAll:', API_URL);
            const response = await axios.get(API_URL);
            console.log('Réponse getAll:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des factures:', error);
            throw error;
        }
    },

    // Mettre à jour une facture
    update: async (numFacture, data) => {
        try {
            const formData = new FormData();
            formData.append('numFacture', data.numFacture);
            formData.append('dateFacture', data.dateFacture);
            formData.append('montant', data.montant);
            formData.append('bl', data.bl);
            formData.append('marcheBC', data.marcheBC);
            if (data.document && data.document !== 'Aucun') {
                formData.append('document', data.document);
            }

            const response = await axios.put(`${API_URL}/${numFacture}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la facture:', error);
            throw error;
        }
    },

    // Supprimer une facture
    delete: async (numFacture) => {
        try {
            const response = await axios.delete(`${API_URL}/${numFacture}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de la facture:', error);
            throw error;
        }
    },

    // Télécharger un fichier
    downloadFile: async (numFacture) => {
        try {
            const response = await axios.get(`${API_URL}/${numFacture}/download`, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            });
            return response;
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier:', error);
            throw error;
        }
    }
};

export default factureService; 