import React, { useState, useEffect } from 'react'; 
import { Row, Col, Card, Form, Button, InputGroup, Modal, DropdownButton, Dropdown, Tabs, Tab, Table } from 'react-bootstrap';
import { FaPlus, FaSave, FaPrint, FaFileAlt, FaCalendarAlt, FaClipboardList, FaStore, FaUser, FaTag, FaTrash, FaArrowLeft, FaSignature, FaFileUpload, FaTimes, FaCheck, FaSearch, FaDownload, FaFile, FaBoxOpen } from 'react-icons/fa';
import './GEDStyles.css';
import axios from 'axios';

const PrintableRetourHistory = ({ retourId, validationTableData, selectedMarche }) => {
  return (
    <div className="print-only">
      <div className="print-header">
        <h2 className="text-center mb-4">SNRT - Bon de Retour ({retourId})</h2>
      </div>
      
      <div className="retour-details mb-4">
        <table className="details-table">
          <tbody>
            <tr>
              <th>N° Retour:</th>
              <td>{retourId}</td>
              <th>Date:</th>
              <td>{new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>Marché:</th>
              <td colSpan="3">{selectedMarche}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h4 className="section-header">Articles Retournés</h4>
        <Table striped bordered className="retour-table">
          <thead>
            <tr>
              <th>Marché</th>
              <th>Numéro Prix</th>
              <th>Code Produit</th>
              <th>Désignation</th>
              <th>SN</th>
              <th>Code-barre</th>
              <th>Date retour</th>
              <th>Service</th>
              <th>Utilisateur</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {validationTableData.map((row, index) => (
              <tr key={index}>
                <td>{row.marcheBC || row.marche || '-'}</td>
                <td>{row.numPrix || row.numeroPrix || '-'}</td>
                <td>{row.codeProduit || '-'}</td>
                <td>{row.designation || '-'}</td>
                <td>{row.snReception || row.sn || '-'}</td>
                <td>{row.codeBarre || '-'}</td>
                <td>{new Date(row.dateRetour).toLocaleDateString()}</td>
                <td>{row.service || '-'}</td>
                <td>{row.utilisateur || '-'}</td>
                <td>{row.responsable || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className="memo-section">
        <h4 className="section-header">Mémo</h4>
        <div className="memo-content">
          {validationTableData[0]?.memo || '-'}
        </div>
      </div>

      <div className="signature-section">
        <div className="signature-box">
          <p>Signature du responsable</p>
          <div className="signature-line"></div>
        </div>
        <div className="signature-box">
          <p>Signature du service</p>
          <div className="signature-line"></div>
        </div>
      </div>
    </div>
  );
};

const FormsElements = () => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showGED, setShowGED] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAffectation, setSelectedAffectation] = useState('');
  const [selectedAffectationDetails, setSelectedAffectationDetails] = useState([]);
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedReferenceDetails, setSelectedReferenceDetails] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');
  const [showAffectationPopup, setShowAffectationPopup] = useState(false);
  const [affectationFilterText, setAffectationFilterText] = useState('');
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [referenceFilterText, setReferenceFilterText] = useState('');
  const [detailTableData, setDetailTableData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [fileListDocuments, setFileListDocuments] = useState([]);
  const [showDetailTable, setShowDetailTable] = useState(false);
  const [responsable, setResponsable] = useState('');
  const [utilisateur, setUtilisateur] = useState('');
  const [designation, setDesignation] = useState('');
  const [isAffectationDisabled, setIsAffectationDisabled] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState('');
  const [showDepotPopup, setShowDepotPopup] = useState(false);
  const [depotFilterText, setDepotFilterText] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marcheData, setMarcheData] = useState([]);
  const [affectationData, setAffectationData] = useState([]);
  const [selectedSN, setSelectedSN] = useState('');
  const [selectedAffectations, setSelectedAffectations] = useState([]);
  const [selectedAffectationServices, setSelectedAffectationServices] = useState([]);
  const [selectedAffectationUsers, setSelectedAffectationUsers] = useState([]);
  const [validationTableData, setValidationTableData] = useState([]);
  const [showValidationTable, setShowValidationTable] = useState(false);
  const [memo, setMemo] = useState('');
  const [sessionRetourId, setSessionRetourId] = useState(() => {
    const newId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return newId;
  });
  const [selectedRetourId, setSelectedRetourId] = useState('');
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [alreadyReturnedSNs, setAlreadyReturnedSNs] = useState([]);

  useEffect(() => {
    const fetchMarches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5003/api/amarches');
        setMarcheData(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des marchés:', err);
        setError('Erreur lors du chargement des marchés');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarches();
  }, []);

  useEffect(() => {
    const fetchAffectations = async () => {
      try {
        setIsLoading(true);
        
        // 1. Récupérer tous les marchés
        const marchesResponse = await axios.get('http://localhost:5003/api/amarches');
        const marches = marchesResponse.data;

        // 2. Récupérer toutes les affectations
        const affectationsResponse = await axios.get('http://localhost:5003/api/affectations/all');
        const affectations = affectationsResponse.data;

        // 3. Récupérer toutes les passations
        const passationsResponse = await axios.get('http://localhost:5003/api/passations/all');
        const passations = passationsResponse.data;
        
        // Créer un Map des passations par affectationId
        const passationsMap = new Map();
        passations.forEach(passation => {
          if (passation.affectationId) {
            passationsMap.set(passation.affectationId, passation);
          }
        });
        
        // Filtrer les affectations invalides
        const affectationsValides = affectations.filter(aff => 
          aff.snReception && 
          aff.snReception.trim() !== '' &&
          aff.marcheBC && 
          aff.marcheBC.trim() !== '' &&
          aff.numPrix && 
          aff.numPrix.trim() !== '' &&
          aff.affectationId && 
          aff.affectationId.trim() !== ''
        );

        // 4. Récupérer tous les retours
        const retoursResponse = await axios.get('http://localhost:5003/api/retours/all');
        const retours = retoursResponse.data;

        // Stocker les SN des retours déjà effectués dans la session courante
        const sessionRetours = retours.filter(r => r.retourId === sessionRetourId);
        setAlreadyReturnedSNs(sessionRetours.map(r => r.snReception));

        // 5. Trier les affectations par SN et date
        const affectationsParSN = new Map();
        
        // Grouper les affectations par SN
        affectationsValides.forEach(aff => {
          const sn = aff.snReception;
          if (!affectationsParSN.has(sn)) {
            affectationsParSN.set(sn, []);
          }
          affectationsParSN.get(sn).push(aff);
        });

        // Pour chaque SN, trier les affectations par date et heure de création
        affectationsParSN.forEach((affs, sn) => {
          affs.sort((a, b) => {
            const dateA = new Date(a.dateAffectation).getTime();
            const dateB = new Date(b.dateAffectation).getTime();
            if (dateA !== dateB) {
              return dateB - dateA;
            }
            return b.affectationId.localeCompare(a.affectationId);
          });
        });

        // 6. Sélectionner la dernière affectation active pour chaque SN
        const dernieresAffectations = [];
        affectationsParSN.forEach((affs, sn) => {
          const derniereAffectation = affs.find(aff => 
            aff.etat === 'Affecté' || aff.etat === 'Non rendu'
          );

          if (derniereAffectation) {
            // Vérifier si une passation existe pour cette affectation
            const passation = passationsMap.get(derniereAffectation.affectationId);
            
            if (passation) {
              // Utiliser les nouvelles données de la passation
              derniereAffectation.service = passation.newService;
              derniereAffectation.utilisateur = passation.newUser;
              derniereAffectation.codeChaine = passation.codeChaine;
              derniereAffectation.nomChaine = passation.nomChaine;
              derniereAffectation.dateAffectation = passation.datePassation;
              derniereAffectation.typeAffectation = passation.typeAffectation;
              derniereAffectation.lieu = passation.lieu;
              derniereAffectation.evenement = passation.evenement;
              derniereAffectation.qualite = passation.qualite;
              derniereAffectation.lieu = passation.lieu;
              derniereAffectation.evenement = passation.evenement;
              derniereAffectation.qualite = passation.qualite;
              derniereAffectation.memo = passation.memo;
            }

            dernieresAffectations.push(derniereAffectation);
          }
        });

        // 7. Filtrer pour n'avoir que les affectations éligibles
        const affectationsFiltered = dernieresAffectations.filter(aff => {
          const notReturnedInSession = !alreadyReturnedSNs.includes(aff.snReception);
          const isEligible = aff.etat === 'Affecté' || aff.etat === 'Non rendu';
          return notReturnedInSession && isEligible;
        });
        
        // Trier les affectations finales par date décroissante
        const affectationsTriees = affectationsFiltered.sort((a, b) => {
          const dateA = new Date(a.dateAffectation).getTime();
          const dateB = new Date(b.dateAffectation).getTime();
          return dateB - dateA;
        });
        
        setAffectationData(affectationsTriees);
        setError(null);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffectations();
  }, [sessionRetourId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const retourId = params.get('retourId');
    
    if (retourId) {
      initNavigationMode(retourId);
    } else {
      // Si pas de paramètres URL, on est en mode création
      initCreationMode();
    }
  }, []);

  // Données mockées pour la référence
  const referenceData = [
    { idL: '1', codeProd: 'CP1', designation: 'Des1', reste: '100', qteAff: '50', qteRetournee: '0', numJonction: 'NJ1', marche: 'M1' },
    { idL: '2', codeProd: 'CP2', designation: 'Des2', reste: '200', qteAff: '100', qteRetournee: '0', numJonction: 'NJ2', marche: 'M2' }
  ];

  // Données mockées pour les dépôts
  const depotData = [
    { code: 'D001', designation: 'Dépôt Principal' },
    { code: 'D002', designation: 'Dépôt Secondaire' },
    { code: 'D003', designation: 'Dépôt Tertiaire' },
    { code: 'D004', designation: 'Dépôt de Stockage' },
    { code: 'D005', designation: 'Dépôt de Distribution' }
  ];

  const filteredMarcheData = marcheData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
    )
  );

  const filteredAffectationData = affectationData
    .filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(affectationFilterText.toLowerCase())
    )
  );

  const filteredReferenceData = referenceData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(referenceFilterText.toLowerCase())
    )
  );

  const filteredDepotData = depotData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(depotFilterText.toLowerCase())
    )
  );

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    setShowPrintModal(false);
    const printContent = document.getElementById('printable-content');
    const originalDisplay = printContent.style.display;
    printContent.style.display = 'block';
    window.print();
    printContent.style.display = originalDisplay;
  };

  const handleNew = () => {
    setShowNewModal(true);
  };

  const handleValidate = async () => {
    console.log('Début de la validation avec les données:', {
      sessionRetourId,
      selectedAffectations,
      selectedDate,
      isNavigationMode,
      selectedRetourId
    });

    if (!selectedAffectations || selectedAffectations.length === 0) {
      console.log('Erreur: Aucune affectation sélectionnée');
      setValidationMessage('Veuillez sélectionner au moins une affectation avant de valider.');
      setShowValidationModal(true);
      return;
    }

    try {
      let formattedDate = selectedDate || new Date().toISOString().split('T')[0];

      // Filtrer pour n'envoyer que les nouveaux retours
      const newRetours = selectedAffectations.filter(sn => !alreadyReturnedSNs.includes(sn));
      console.log('Nouveaux retours à traiter:', newRetours);

      // Trouver les données des affectations sélectionnées dans le tableau
      const retoursData = newRetours.map(sn => {
        // Trouver l'affectation correspondante dans les données du tableau
        const affectation = affectationData.find(row => row.snReception === sn);
        console.log('Données de l\'affectation sélectionnée pour SN', sn, ':', affectation);

        if (!affectation) {
          throw new Error(`Affectation non trouvée pour le SN: ${sn}`);
        }

        // Vérifier que l'affectation est active
        if (affectation.etat !== 'Affecté' && affectation.etat !== 'Non rendu') {
          throw new Error(`L'affectation pour le SN ${sn} n'est pas active (état: ${affectation.etat})`);
        }

        return {
          retourId: sessionRetourId,
          dateRetour: formattedDate,
          marcheBC: affectation.marcheBC,
          idMarche: affectation.idMarche,
          numPrix: affectation.numPrix,
          snReception: affectation.snReception,
          codeBarre: affectation.codeBarre,
          codeChaine: affectation.codeChaine,
          nomChaine: affectation.nomChaine,
          service: affectation.service,
          utilisateur: affectation.utilisateur,
          etat: 'rendu',
          responsable: responsable || '',
          memo: memo || '',
          affectationId: affectation.affectationId,
          codeProduit: affectation.codeProduit,
          designation: affectation.designation
        };
      });

      if (retoursData.length > 0) {
        console.log('Données à envoyer au serveur:', { retours: retoursData });

        try {
          const response = await axios.post('http://localhost:5003/api/retours/multiple', {
            retours: retoursData
          });

          console.log('Réponse du serveur après envoi des retours:', response.data);

          // Mise à jour des états des affectations
          for (const retour of retoursData) {
            try {
              console.log('Mise à jour de l\'état pour SN:', retour.snReception, 'avec affectationId:', retour.affectationId);
              const updateResponse = await axios.put(`http://localhost:5003/api/affectations/${retour.snReception}/etat`, {
                etat: 'Non affecté',
                affectationId: retour.affectationId
              });
              console.log('Réponse de mise à jour d\'état:', updateResponse.data);
            } catch (updateError) {
              console.error(`Erreur lors de la mise à jour de l'état pour SN ${retour.snReception}:`, updateError);
            }
          }

          // Mise à jour de la liste des retours déjà effectués
          setAlreadyReturnedSNs([...alreadyReturnedSNs, ...newRetours]);

          // Mettre à jour le tableau de validation
          const newValidationData = retoursData.map(retour => ({
            ...retour,
            dateRetour: formattedDate
          }));

          setValidationTableData(prevData => {
            const mergedData = [...prevData, ...newValidationData];
            return mergedData.filter((item, index, self) =>
              index === self.findIndex((t) => t.snReception === item.snReception)
            );
          });
          setShowValidationTable(true);

          setValidationMessage('Retours enregistrés avec succès!');
          setShowValidationModal(true);

        } catch (error) {
          console.error('Erreur détaillée lors de l\'envoi au serveur:', error.response?.data || error.message);
          throw error;
        }
      } else {
        setValidationMessage('Aucun nouveau retour à enregistrer.');
        setShowValidationModal(true);
      }

    } catch (error) {
      console.error('Erreur complète lors de la validation:', error);
      console.error('Stack trace:', error.stack);
      let errorMessage = 'Une erreur est survenue lors de l\'enregistrement.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setValidationMessage(errorMessage);
      setShowValidationModal(true);
    }
  };

  const handleFileSelectDocuments = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('typeFile', file.type);
        formData.append('description', '');
        formData.append('retourId', isNavigationMode ? selectedRetourId : sessionRetourId);

        const response = await axios.post('http://localhost:5003/api/retourDocuments/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const newFileEntry = {
          id: response.data.document._id,
          fileName: file.name,
          date: new Date(response.data.document.date).toLocaleDateString(),
          typeFile: response.data.document.typeFile,
          description: response.data.document.description
        };

        setFileListDocuments([...fileListDocuments, newFileEntry]);
        setValidationMessage('Document uploadé avec succès');
        setShowValidationModal(true);
      } catch (error) {
        console.error('Erreur lors de l\'upload du document:', error);
        setValidationMessage('Erreur lors de l\'upload du document');
        setShowValidationModal(true);
      }
    }
  };

  const handleRemoveDocuments = async (id) => {
    try {
      await axios.delete(`http://localhost:5003/api/retourDocuments/${id}`);
      setFileListDocuments(fileListDocuments.filter((file) => file.id !== id));
      setValidationMessage('Document supprimé avec succès');
      setShowValidationModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      setValidationMessage('Erreur lors de la suppression du document');
      setShowValidationModal(true);
    }
  };

  useEffect(() => {
    const loadDocuments = async () => {
      if (isNavigationMode && selectedRetourId) {
        try {
          const documentsResponse = await axios.get(`http://localhost:5003/api/retourDocuments/retour/${selectedRetourId}`);
          setFileListDocuments(documentsResponse.data.map(doc => ({
            id: doc._id,
            fileName: doc.fileName,
            date: new Date(doc.date).toLocaleDateString(),
            typeFile: doc.typeFile,
            description: doc.description
          })));
        } catch (error) {
          console.error('Erreur lors du chargement des documents:', error);
          setValidationMessage('Erreur lors du chargement des documents');
          setShowValidationModal(true);
        }
      }
    };

    loadDocuments();
  }, [isNavigationMode, selectedRetourId]);

  const handleSignatureUpload = async () => {
    if (!signatureTitle) {
      setValidationMessage('Veuillez saisir le titre !');
      setShowValidationModal(true);
      return;
    }

    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) {
      setValidationMessage('Erreur: Canvas non trouvé');
      setShowValidationModal(true);
      return;
    }

    try {
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        const fileName = `${signatureTitle}.png`;
        
        formData.append('file', blob, fileName);
        formData.append('fileName', fileName);
        formData.append('typeFile', 'image/png');
        formData.append('description', 'Signature numérisée');
        formData.append('retourId', isNavigationMode ? selectedRetourId : sessionRetourId);

        try {
          const response = await axios.post('http://localhost:5003/api/retourDocuments/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          const newFileEntry = {
            id: response.data.document._id,
            fileName: fileName,
            date: new Date(response.data.document.date).toLocaleDateString(),
            typeFile: 'image/png',
            description: 'Signature numérisée'
          };

          setFileListDocuments([...fileListDocuments, newFileEntry]);
          setShowSignatureModal(false);
          setSignatureTitle('');
          setValidationMessage('Signature uploadée avec succès');
          setShowValidationModal(true);
        } catch (error) {
          console.error('Erreur lors de l\'upload de la signature:', error);
          setValidationMessage('Erreur lors de l\'upload de la signature');
          setShowValidationModal(true);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erreur lors de la conversion du canvas:', error);
      setValidationMessage('Erreur lors de la création de la signature');
      setShowValidationModal(true);
    }
  };

  const confirmNew = () => {
    // Réinitialiser tous les champs
    setGeneratedNumber('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedAffectation('');
    setSelectedAffectationDetails([]);
    setSelectedAffectations([]);
    setSelectedAffectationServices([]);
    setSelectedAffectationUsers([]);
    setResponsable('');
    setMemo('');
    setSelectedReference('');
    setSelectedReferenceDetails({});
    setSelectedQuantity('');
    setDesignation('');
    setDetailTableData([]);
    setShowDetailTable(false);
    setShowNewModal(false);
    setShowForm(true);
    setIsAffectationDisabled(false);
    setValidationTableData([]);
    setShowValidationTable(false);
    
    // Initialiser le mode création
    initCreationMode();
  };

  const toggleAffectationPopup = () => {
    setShowAffectationPopup(!showAffectationPopup);
  };

  const toggleReferencePopup = () => {
    setShowReferencePopup(!showReferencePopup);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseInt(value) >= 0) {
      setSelectedQuantity(value);
    }
  };

  const clearDetailForm = () => {
    setSelectedReference('');
    setSelectedReferenceDetails({});
    setSelectedQuantity('');
    setDesignation('');
  };

  const toggleDepotPopup = () => {
    setShowDepotPopup(!showDepotPopup);
  };

  const toggleMarchePopup = () => {
    setShowMarchePopup(!showMarchePopup);
  };

  const handleMarcheSelect = async (marche) => {
    console.log('Marché sélectionné:', marche);
    setSelectedMarche(marche.marcheBC);
    setSelectedMarcheDetails(marche);
    setShowMarchePopup(false);

    try {
      // Récupérer les affectations pour ce marché
      const affectationsResponse = await axios.get(`http://localhost:5003/api/affectations?marcheBC=${marche.marcheBC}`);
      setAffectationData(affectationsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des affectations:', err);
      setError('Erreur lors du chargement des affectations');
    }
  };

  // Fonction pour générer un nouveau retourId
  const generateRetourId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `RET-${timestamp}-${random}`;
  };

  // Fonction pour initialiser le mode création
  const initCreationMode = () => {
    const newRetourId = generateRetourId();
    setSessionRetourId(newRetourId);
    setIsCreationMode(true);
    setIsNavigationMode(false);
  };

  // Fonction pour initialiser le mode navigation
  const initNavigationMode = async (retourId) => {
    try {
      console.log('Initialisation du mode navigation:', { retourId });
      setIsNavigationMode(true);
      setIsCreationMode(false);
      setSelectedRetourId(retourId);
      setSessionRetourId(retourId); // Utiliser le même retourId pour la session
      
      // Charger tous les retours associés à ce retourId
      const retourResponse = await axios.get(`http://localhost:5003/api/retours/${retourId}`);
      const retours = retourResponse.data;
      
      if (retours && retours.length > 0) {
        // Mettre à jour les états avec les données du premier retour
        const premierRetour = retours[0];
        setSelectedDate(new Date(premierRetour.dateRetour).toISOString().split('T')[0]);
        setResponsable(premierRetour.responsable || '');
        setMemo(premierRetour.memo || '');

        // Mettre à jour le tableau de validation avec tous les retours
        setValidationTableData(retours.map(retour => ({
          ...retour,
          dateRetour: new Date(retour.dateRetour).toLocaleDateString(),
          etat: 'rendu'
        })));
        setShowValidationTable(true);

        // Mettre à jour alreadyReturnedSNs avec les SN des retours existants
        setAlreadyReturnedSNs(retours.map(r => r.snReception));

        // Mettre à jour les sélections
        setSelectedAffectations(retours.map(r => r.snReception));
        setSelectedAffectationServices(retours.map(r => r.service));
        setSelectedAffectationUsers(retours.map(r => r.utilisateur));
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement du retour:', error);
      setValidationMessage('Erreur lors du chargement des données: ' + error.message);
      setShowValidationModal(true);
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center" style={{ background: 'white' }}>
              <div>
                <Button variant="success" className="ms-2 action-button" onClick={handleNew}>
                  <FaPlus className="me-2" /> Nouveau
                </Button>
                <Button variant="primary" className="ms-2 action-button" onClick={handleValidate}>
                  <FaSave className="me-2" /> Valider
                </Button>
              </div>
                          <div>
                <Button variant="secondary" className="me-2 action-button" onClick={() => { setShowGED(true); setShowForm(false); }}>
                  <FaFileAlt className="me-2" /> GED
                </Button>
                <Button variant="info" className="action-button" onClick={handlePrint}>
                  <FaPrint className="me-2" /> Imprimer
                </Button>
                          </div>
                        </Card.Header>

            <Card.Body>
              {showForm && (
              <>
              <Row>
                  <Col md={4}>
                      <Form.Group className="mb-3">
                      <Form.Label><FaCalendarAlt className="me-2" />Date</Form.Label>
                      <Form.Control
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={(e) => {
                          console.log('Nouvelle date sélectionnée:', e.target.value);
                          setSelectedDate(e.target.value);
                        }}
                        required
                      />
                  </Form.Group>
                  </Col>
                   {/**
                  <Col md={4}>
                  
                  <Form.Group className="mb-3">
                                          <Form.Label><FaClipboardList className="me-2" />Marché</Form.Label>
                                          <InputGroup>
                                                <Form.Control type="text" value={selectedMarche} readOnly />
                                                <Button variant="secondary" className="search-button" onClick={toggleMarchePopup}>
                                                  <FaSearch />
                                                </Button>
                                          </InputGroup>
                                              {showMarchePopup && (
                        <div className="popup" style={{ maxWidth: '400px', width: '100%', overflowX: 'auto' }}>
                                                  <Form.Control
                                                    type="text"
                                                    placeholder="Rechercher..."
                                                    value={marcheFilterText}
                                                    onChange={(e) => setMarcheFilterText(e.target.value)}
                                                    className="mb-2"
                                                  />
                                                  {isLoading ? (
                                                    <div className="text-center p-3">
                                                      <span>Chargement des marchés...</span>
                                                    </div>
                                                  ) : error ? (
                                                    <div className="text-center p-3 text-danger">
                                                      {error}
                                                    </div>
                                                  ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <Table striped bordered hover size="sm" style={{ minWidth: '700px' }}>
                                                      <thead>
                                                        <tr>
                                                          <th>Marché BC</th>
                                                          <th>Date</th>
                                                          <th>Type Marché</th>
                                                          <th>Famille Projet</th>
                                                          <th>Intitulé Projet</th>
                                                          <th>Demandeur</th>
                                                          <th>Fiche Projet</th>
                                                          <th>Description Projet</th>
                                                          <th>Garantie</th>
                                                          <th>Délai Execution</th>
                                                          <th>Num AO</th>
                                                          <th>JDE</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {filteredMarcheData.map((row, index) => (
                                                          <tr key={index} onClick={() => handleMarcheSelect(row)}>
                                                            <td>{row.marcheBC}</td>
                                                            <td>{row.date}</td>
                                                            <td>{row.typeMarche}</td>
                                                            <td>{row.familleProjet}</td>
                                                            <td>{row.intituleProjet}</td>
                                                            <td>{row.demandeur}</td>
                                                            <td>{row.ficheProjet}</td>
                                                            <td>{row.descriptionProjet}</td>
                                                            <td>{row.garantie}</td>
                                                            <td>{row.delaiExecution}</td>
                                                            <td>{row.numAO}</td>
                                                            <td>{row.jde}</td>
                                                          </tr>
                                                        ))}
                                                      </tbody>
                                                    </Table>
                            </div>
                                                  )}
                                                </div>
                                              )}
                                        </Form.Group>

                  </Col>
                  */}
                  <Col md={4}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaClipboardList className="me-2" />Affectations</Form.Label>
                      <InputGroup>
                        <Form.Control 
                          type="text" 
                          value={selectedAffectations.join(', ')} 
                          readOnly 
                          placeholder="Sélectionnez une ou plusieurs affectations..."
                        />
                        <Button 
                          variant="secondary" 
                          className="search-button" 
                          onClick={toggleAffectationPopup}
                          disabled={isAffectationDisabled}
                        >
                          <FaSearch />
                        </Button>
                      </InputGroup>
                      {showAffectationPopup && (
                        <div className="popup" style={{ maxWidth: '400px', width: '100%', overflowX: 'auto' }}>
                          <Form.Control
                            type="text"
                            placeholder="Rechercher..."
                            value={affectationFilterText}
                            onChange={(e) => setAffectationFilterText(e.target.value)}
                            className="mb-2"
                          />
                          {isLoading ? (
                            <div className="text-center p-3">
                              <span>Chargement des affectations...</span>
                            </div>
                          ) : error ? (
                            <div className="text-center p-3 text-danger">
                              {error}
                            </div>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <Table striped bordered hover size="sm" style={{ minWidth: '700px' }}>
                            <thead>
                              <tr>
                                    <th>Check</th>
                                    <th>Marché</th>
                                    <th>Numéro Prix</th>
                                    <th>Code Produit</th>
                                    <th>Désignation</th>
                                    <th>SN</th>
                                    <th>Code-barre</th>
                                    <th>Date affectation</th>
                                    <th>Type d'affectation</th>
                                <th>Utilisateur</th>
                                    <th>Chaîne</th>
                                    <th>Service</th>
                                    <th>État</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAffectationData
                                .filter(row => {
                                  // Vérifier que les champs requis sont présents et non vides
                                  return row.snReception && 
                                         row.snReception.trim() !== '' &&
                                         row.marcheBC && 
                                         row.marcheBC.trim() !== '' &&
                                         row.numPrix && 
                                         row.numPrix.trim() !== '';
                                })
                                .map((row, index) => (
                                  <tr key={index}>
                                    <td>
                                      <Form.Check
                                        type="checkbox"
                                        checked={selectedAffectations.includes(row.snReception)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            // Vérifier que les données sont valides avant d'ajouter
                                            if (row.snReception && row.affectationId) {
                                              setSelectedAffectations([...selectedAffectations, row.snReception]);
                                              setSelectedAffectationDetails([...selectedAffectationDetails, {
                                                sn: row.snReception,
                                                affectationId: row.affectationId,
                                                service: row.service || '-',
                                                utilisateur: row.utilisateur || '-',
                                                dateAffectation: row.dateAffectation
                                              }]);
                                              setSelectedAffectationServices([...selectedAffectationServices, row.service || '-']);
                                              setSelectedAffectationUsers([...selectedAffectationUsers, row.utilisateur || '-']);
                                            }
                                          } else {
                                            setSelectedAffectations(selectedAffectations.filter(sn => sn !== row.snReception));
                                            setSelectedAffectationDetails(selectedAffectationDetails.filter(detail => detail.sn !== row.snReception));
                                            setSelectedAffectationServices(selectedAffectationServices.filter(service => service !== row.service));
                                            setSelectedAffectationUsers(selectedAffectationUsers.filter(user => user !== row.utilisateur));
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>{row.marcheBC || '-'}</td>
                                    <td>{row.numPrix || '-'}</td>
                                    <td>{row.codeProduit || '-'}</td>
                                    <td>{row.designation || '-'}</td>
                                    <td>{row.snReception || '-'}</td>
                                    <td>{row.codeBarre || '-'}</td>
                                    <td>{row.dateAffectation ? new Date(row.dateAffectation).toLocaleDateString() + ' ' + new Date(row.dateAffectation).toLocaleTimeString() : '-'}</td>
                                    <td>{row.typeAffectation || '-'}</td>
                                    <td>{row.utilisateur || '-'}</td>
                                    <td>{row.codeChaine ? `${row.codeChaine} - ${row.nomChaine || ''}` : '-'}</td>
                                    <td>{row.service || '-'}</td>
                                    <td style={{
                                      color: row.etat === 'Affecté' ? 'green' : 'red',
                                      fontWeight: 'bold'
                                    }}>{row.etat || '-'}</td>
                              </tr>
                            ))}
                            </tbody>
                          </Table>
                            </div>
                          )}
                        </div>
                      )}
                  </Form.Group>
                  </Col>
                  <Col md={4}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaStore className="me-2" />Service</Form.Label>
                      <Form.Control type="text" value={selectedAffectationServices.join(', ')} readOnly />
                  </Form.Group>
                </Col>
                </Row>

                <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaUser className="me-2" />Responsable</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={responsable} 
                        onChange={(e) => setResponsable(e.target.value)} 
                      />
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaUser className="me-2" />Utilisateur</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={selectedAffectationUsers.join(', ')} 
                        readOnly 
                      />
                  </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaClipboardList className="me-2" />Mémo</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                  </Form.Group>
                </Col>
              </Row>

{/**
              {showForm && (
              <Tabs defaultActiveKey="detail" className="mb-3">
                <Tab eventKey="detail" title="Détail">
                  <Row>
                    <Col md={6}>
                    <Form.Group className="mb-3">
                          <Form.Label><FaBoxOpen className="me-2" />Référence</Form.Label>
                        <InputGroup>
                            <Form.Control type="text" value={selectedReference} readOnly />
                            <Button variant="secondary" className="search-button" onClick={toggleReferencePopup}>
                              <FaSearch />
                            </Button>
                        </InputGroup>
                          {showReferencePopup && (
                            <div className="popup">
                              <Form.Control
                                type="text"
                                placeholder="Rechercher..."
                                value={referenceFilterText}
                                onChange={(e) => setReferenceFilterText(e.target.value)}
                                className="mb-2"
                              />
                              <Table striped bordered hover size="sm">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Designation</th>
                                    <th>Reste</th>
                                    <th>Qte Aff</th>
                                    <th>Qte Retournée</th>
                                    <th>Num Jonction</th>
                                    <th>Marché</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredReferenceData.map((row, index) => (
                                    <tr key={index} onClick={() => {
                                      setSelectedReference(row.codeProd);
                                      setSelectedReferenceDetails(row);
                                      setDesignation(row.designation);
                                      setShowReferencePopup(false);
                                    }}>
                                      <td>{row.idL}</td>
                                      <td>{row.designation}</td>
                                      <td>{row.reste}</td>
                                      <td>{row.qteAff}</td>
                                      <td>{row.qteRetournee}</td>
                                      <td>{row.numJonction}</td>
                                      <td>{row.marche}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                          <Form.Label><FaClipboardList className="me-2" />Désignation</Form.Label>
                          <Form.Control 
                            type="text" 
                            value={designation} 
                            readOnly 
                          />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                          <Form.Label><FaTag className="me-2" />Quantité</Form.Label>
                          <Form.Control
                            type="number"
                            value={selectedQuantity}
                            onChange={handleQuantityChange}
                            min="0"
                            step="1"
                          />
                      </Form.Group>
                    </Col>
                  </Row>
                    <Button variant="danger" className="delete-button" onClick={clearDetailForm}>
                      <FaTrash className="me-2" /> Supprimer
                    </Button>
                </Tab>
                <Tab eventKey="trace" title="Trace">
                  <p>Historique des modifications...</p>
                </Tab>
              </Tabs>
              )}
 */}
              </>
              )}

              {showGED && (
                <div className="ged-container">
                  <Button 
                    variant="link" 
                    className="ged-back-button"
                    onClick={() => { setShowGED(false); setShowForm(true); }}
                  >
                    <FaArrowLeft className="me-2" /> Retour
                  </Button>

                  <div className="text-center">
                    <h3 className="ged-title">
                      <FaFileAlt className="me-2" />
                      Zone GED
                    </h3>
                  </div>

                  <div className="ged-section">
                    <div className="mb-4">
                      <h5 className="ged-subtitle">
                        <FaFile className="me-2" />
                        Documents
                      </h5>
                      
                      <Form>
                        <Form.Group className="mb-4 d-flex align-items-center">
                          <div className="file-upload-container">
                            <FaFileUpload className="me-2 text-primary" size={20} />
                            <Form.Control 
                              type="file" 
                              onChange={handleFileSelectDocuments}
                              className="file-upload-input"
                            />
                          </div>
                          <Button 
                            variant="primary"
                            className="scan-button"
                            onClick={() => setShowSignatureModal(true)}
                          >
                            <FaSignature className="me-2" />
                            Numériser
                          </Button>
                        </Form.Group>
                      </Form>

                      <div className="table-responsive">
                        <Table hover bordered className="ged-table">
                          <thead>
                            <tr>
                              <th>Nom</th>
                              <th>Type File</th>
                              <th>Date</th>
                              <th>Description</th>
                              <th className="text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fileListDocuments.map((file) => (
                              <tr key={file.id}>
                                <td>{file.fileName}</td>
                                <td>{file.typeFile}</td>
                                <td>{file.date}</td>
                                <td>
                                  <Button 
                                    variant="link" 
                                    className="file-link"
                                    onClick={async () => {
                                      try {
                                        const response = await axios.get(
                                          `http://localhost:5003/api/retourDocuments/download/${file.id}`,
                                          { responseType: 'blob' }
                                        );
                                        
                                        const blob = new Blob([response.data], { 
                                          type: response.headers['content-type'] 
                                        });
                                        
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.fileName;
                                        document.body.appendChild(a);
                                        a.click();
                                        
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      } catch (error) {
                                        console.error('Erreur lors du téléchargement:', error);
                                        setValidationMessage('Erreur lors du téléchargement du fichier');
                                        setShowValidationModal(true);
                                      }
                                    }}
                                  >
                                    <FaDownload className="me-2" />
                                    {file.fileName}
                                  </Button>
                                </td>
                                <td className="text-center">
                                  <Button 
                                    variant="outline-danger"
                                    size="sm"
                                    className="delete-button"
                                    onClick={() => handleRemoveDocuments(file.id)}
                                  >
                                    <FaTrash className="me-1" size={12} />
                                    Supprimer
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showDetailTable && (
                <Table striped bordered hover size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th>Numéro</th>
                      <th>Date</th>
                      <th>Num Affectation</th>
                      <th>Service</th>
                      <th>Responsable</th>
                      <th>Utilisateur</th>
                      <th>Référence</th>
                      <th>Désignation</th>
                      <th>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailTableData.map((data, index) => (
                      <tr key={index} onDoubleClick={() => {
                        setSelectedReference(data.selectedReference);
                        setSelectedReferenceDetails(data.selectedReferenceDetails);
                        setSelectedQuantity(data.selectedQuantity);
                        setDesignation(data.selectedReferenceDetails.designation);
                        setEditingIndex(index);
                      }}>
                        <td>{data.generatedNumber}</td>
                        <td>{data.selectedDate}</td>
                        <td>{data.selectedAffectation}</td>
                        <td>{data.selectedAffectationDetails.service}</td>
                        <td>{data.responsable}</td>
                        <td>{data.utilisateur}</td>
                        <td>{data.selectedReference}</td>
                        <td>{data.selectedReferenceDetails.designation}</td>
                        <td>{data.selectedQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {showValidationTable && (
                <Card className="mt-4">
                  <Card.Header>
                    <Card.Title as="h5">Résultat de la validation</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Marché</th>
                          <th>Numéro Prix</th>
                          <th>Code Produit</th>
                          <th>Désignation</th>
                          <th>SN</th>
                          <th>Code-barre</th>
                          <th>Date retour</th>
                          <th>Service</th>
                          <th>Utilisateur</th>
                          <th>Responsable</th>
                          <th>Mémo</th>
                          <th>État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationTableData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.marcheBC || row.marche || '-'}</td>
                            <td>{row.numPrix || row.numeroPrix || '-'}</td>
                            <td>{row.codeProduit || '-'}</td>
                            <td>{row.designation || '-'}</td>
                            <td>{row.snReception || row.sn || '-'}</td>
                            <td>{row.codeBarre || '-'}</td>
                            <td>{new Date(row.dateRetour).toLocaleDateString()}</td>
                            <td>{row.service || '-'}</td>
                            <td>{row.utilisateur || '-'}</td>
                            <td>{row.responsable || '-'}</td>
                            <td>{row.memo || '-'}</td>
                            <td style={{ 
                              color: row.etat === 'rendu' ? 'green' : 'red',
                              fontWeight: 'bold'
                            }}>
                              {row.etat || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPrint className="me-2" />
            Confirmation d'impression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir imprimer ce document ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={confirmPrint}>
            <FaCheck className="me-2" /> Confirmer et imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheck className="me-2" />
            Validation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {validationMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
            <FaTimes className="me-2" /> Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSignatureModal} onHide={() => setShowSignatureModal(false)}>
        <Modal.Header closeButton className="signature-modal-header">
          <Modal.Title>
            <FaSignature className="me-2" />
            Signature
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Titre du document</Form.Label>
            <Form.Control 
              type="text" 
              value={signatureTitle} 
              onChange={(e) => setSignatureTitle(e.target.value)}
              placeholder="Entrez un titre..."
              className="signature-title-input"
            />
          </Form.Group>
          <Form.Label className="fw-bold">Zone de signature</Form.Label>
          <div className="signature-canvas-container">
            <canvas 
              id="signatureCanvas" 
              width="400" 
              height="200" 
              className="signature-canvas"
            />
          </div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="d-flex align-items-center"
            onClick={() => {
              const canvas = document.getElementById('signatureCanvas');
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }}
          >
            <FaTrash className="me-2" size={12} />
            Effacer
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignatureModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSignatureUpload}
            className="upload-button"
          >
            <FaFileUpload className="me-2" />
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showNewModal} onHide={() => setShowNewModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Nouveau formulaire
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir créer un nouveau formulaire ? Toutes les données non enregistrées seront perdues.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={confirmNew}>
            <FaPlus className="me-2" /> Créer nouveau
          </Button>
        </Modal.Footer>
      </Modal>

      <div id="printable-content" style={{ display: 'none' }}>
        <PrintableRetourHistory 
          retourId={isNavigationMode ? selectedRetourId : sessionRetourId}
          validationTableData={validationTableData}
          selectedMarche={selectedMarche}
        />
      </div>

      <style>
        {`
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 0.5rem;
          }

          .card-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px 8px 0 0;
          }

          .card-body {
            padding: 0.75rem;
          }

          .form-label {
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
          }

          .form-control {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            min-height: 32px;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 500;
            transition: all 0.3s ease;
            font-size: 0.875rem;
          }

          .btn-success {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
          }

          .btn-primary {
            background: linear-gradient(45deg, #007bff, #0056b3);
            border: none;
          }

          .btn-secondary {
            background: linear-gradient(45deg, #6c757d, #5a6268);
            border: none;
          }

          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }

          .search-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            padding: 0;
            border-radius: 0 4px 4px 0;
          }

          .popup {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 10px;
            margin-top: 5px;
            max-height: 200px;
            overflow-y: auto;
            width: 100%;
            max-width: 600px;
          }

          .modal-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
          }

          .mb-4 {
            margin-bottom: 0.75rem !important;
          }

          .mb-3 {
            margin-bottom: 0.5rem !important;
          }

          .me-2 {
            margin-right: 0.375rem !important;
          }

          .table {
            font-size: 0.875rem;
          }

          .table thead th {
            background: #f8f9fa;
            color: #495057;
            font-weight: 500;
            padding: 0.5rem;
            border-bottom: 2px solid #dee2e6;
            white-space: nowrap;
          }

          .table tbody td {
            padding: 0.5rem;
            vertical-align: middle;
          }

          .table tbody tr:hover {
            background-color: #f8f9fa;
            cursor: pointer;
          }

          .table.table-sm td, 
          .table.table-sm th {
            padding: 0.25rem 0.5rem;
          }

          .input-group {
            min-height: 32px;
          }

          .input-group .form-control {
            height: 32px;
          }

          @media print {
            body * {
              visibility: hidden;
            }
            #printable-content, #printable-content * {
              visibility: visible;
            }
            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print-only {
              display: block !important;
              padding: 20px;
            }
            .print-header {
              margin-bottom: 30px;
            }
            .print-header h2 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .retour-details {
              margin: 20px 0;
            }
            .details-table {
              width: 100%;
              margin-bottom: 20px;
              border-collapse: collapse;
            }
            .details-table th {
              text-align: right;
              padding: 8px 10px;
              width: 15%;
              font-weight: bold;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
            }
            .details-table td {
              text-align: left;
              width: 35%;
              padding: 8px 10px;
              border: 1px solid #dee2e6;
            }
            .section-header {
              font-size: 18px;
              margin: 15px 0;
              padding: 8px;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
            }
            .retour-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .retour-table th, 
            .retour-table td {
              border: 1px solid #dee2e6;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            .retour-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .memo-section {
              margin: 20px 0;
            }
            .memo-content {
              padding: 10px;
              border: 1px solid #dee2e6;
              min-height: 60px;
              margin-top: 10px;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              padding: 0 50px;
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-box p {
              margin-bottom: 50px;
              font-weight: bold;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 10px;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default FormsElements;
