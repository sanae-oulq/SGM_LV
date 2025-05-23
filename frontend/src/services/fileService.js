// Préparer le FormData pour l'upload de fichier
export const prepareFileFormData = (file, data) => {
    const formData = new FormData();
    
    // Ajouter le fichier
    if (file) {
        formData.append('file', file);
    }
    
    // Ajouter les autres données
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
        }
    });
    
    return formData;
};

// Valider le type de fichier
export const validateFileType = (file) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non autorisé. Seuls les fichiers PDF, Word, Excel et images sont acceptés.');
    }

    return true;
};

// Valider la taille du fichier
export const validateFileSize = (file, maxSizeMB = 10) => {
    const maxSize = maxSizeMB * 1024 * 1024; // Convertir en bytes
    if (file.size > maxSize) {
        throw new Error(`La taille du fichier ne doit pas dépasser ${maxSizeMB}MB`);
    }
    return true;
};

// Formater la date pour l'affichage
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Créer un lien de téléchargement temporaire
export const createDownloadLink = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// Obtenir l'extension du fichier
export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

// Générer un nom de fichier unique
export const generateUniqueFileName = (originalFileName) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const extension = getFileExtension(originalFileName);
    return `${timestamp}-${random}.${extension}`;
}; 