import axios from 'axios';

const API_URL = 'http://localhost:5003/api/bris';

const brisService = {
    // Créer un nouveau BRI
    create: async (file, marcheBC, marcheRef) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('marcheBC', marcheBC);
            formData.append('marcheRef', marcheRef);

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du BRI:', error);
            throw error;
        }
    },

    // Récupérer tous les BRIs
    getAll: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des BRIs:', error);
            throw error;
        }
    },

    // Récupérer les BRIs par marché
    getByMarche: async (marcheBC) => {
        try {
            const response = await axios.get(`${API_URL}/marche/${marcheBC}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des BRIs:', error);
            throw error;
        }
    },

    // Supprimer un BRI
    delete: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression du BRI:', error);
            throw error;
        }
    },

    // Télécharger un BRI
    download: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}/download`, {
                responseType: 'blob'
            });
            
            // Créer un URL pour le blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Créer un lien temporaire et déclencher le téléchargement
            const link = document.createElement('a');
            link.href = url;
            
            // Utiliser le nom de fichier de l'en-tête Content-Disposition s'il existe
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'bri.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            
            // Nettoyer
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return response;
        } catch (error) {
            console.error('Erreur lors du téléchargement du BRI:', error);
            throw error;
        }
    },

    // Vérifier si un BRI existe pour un marché
    checkExistence: async (marcheBC) => {
        try {
            const bris = await brisService.getByMarche(marcheBC);
            return bris && bris.length > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'existence du BRI:', error);
            return false;
        }
    }
};

export default brisService; 