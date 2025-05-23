import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Modal, DropdownButton, Dropdown, Tabs, Tab, Table } from 'react-bootstrap';
import { FaArrowLeft, FaTrash, FaFileUpload, FaSignature, FaFile, FaDownload, FaFileAlt, FaPlus, FaSave, FaPrint, FaSearch, FaCalendarAlt, FaUserAlt, FaMapMarkerAlt, FaStar, FaClipboardList, FaComments, FaCheck, FaTimes, FaEdit, FaBoxOpen } from 'react-icons/fa';
import './GEDStyles.css';
import axios from 'axios';
import ReactDOM from 'react-dom';

const PrintableAffectationHistory = ({ affectationId, validationTableData, selectedMarche }) => {
  return (
    <div className="print-only">
      <div className="print-header">
        <h2 className="text-center mb-4">SNRT - Bon d'Affectation ({affectationId})</h2>
      </div>
      
      <div className="affectation-details mb-4">
        <table className="details-table">
          <tbody>
            <tr>
              <th>N° Affectation:</th>
              <td>{affectationId}</td>
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
        <h4 className="section-header">Articles Affectés</h4>
        <Table striped bordered className="affectation-table">
          <thead>
            <tr>
              <th>Marché</th>
              <th>Numéro Prix</th>
              <th>Code Produit</th>
              <th>Désignation</th>
              <th>SN</th>
              <th>Code-barre</th>
              <th>Date affectation</th>
              <th>Service</th>
              <th>Utilisateur</th>
              <th>Chaîne</th>
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
                <td>{new Date(row.dateAffectation).toLocaleDateString()}</td>
                <td>{row.service || '-'}</td>
                <td>{row.utilisateur || '-'}</td>
                <td>{row.codeChaine || '-'}</td>
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
  const [showGED, setShowGED] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState('');
  const [dateAffectation, setDateAffectation] = useState(new Date().toISOString().split('T')[0]);
  
  // Nouveaux états pour la gestion de l'affectationId
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [selectedAffectationId, setSelectedAffectationId] = useState(null);
  const [sessionAffectationId, setSessionAffectationId] = useState(() => {
    const newId = `AFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return newId;
  });
  
  // Nouveaux états pour la gestion des marchés
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [marcheData, setMarcheData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nouvel état pour les réceptions
  const [receptionData, setReceptionData] = useState([]);
  const [receptionFilterText, setReceptionFilterText] = useState('');
  const [showReceptionPopup, setShowReceptionPopup] = useState(false);
  const [selectedReceptions, setSelectedReceptions] = useState([]);

  const [showServicePopup, setShowServicePopup] = useState(false);
  const [serviceFilterText, setServiceFilterText] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceDetails, setSelectedServiceDetails] = useState({
    idaff: '',
    affectation: '',
    responsable: '',
    direction: '',
    departement: '',
    service: ''
  });

  const [showChainePopup, setShowChainePopup] = useState(false);
  const [chaineFilterText, setChaineFilterText] = useState('');
  const [selectedChaine, setSelectedChaine] = useState('');
  const [selectedChaineNom, setSelectedChaineNom] = useState('');

  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [referenceFilterText, setReferenceFilterText] = useState('');
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedReferenceDetails, setSelectedReferenceDetails] = useState({
    codeProd: '',
    ref: '',
    designation: '',
    qteStock: '',
    qteEnt: '',
    qteResumMouv: '',
    numReception: '',
    marche: '',
    numPrix: ''
  });

  const [showDetailTable, setShowDetailTable] = useState(false);
  const [detailTableData, setDetailTableData] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Nouveaux états pour GED
  const [fileListDocuments, setFileListDocuments] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [signatureTitle, setSignatureTitle] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  // Ajout des nouveaux états pour les champs du formulaire
  const [lieu, setLieu] = useState('');
  const [evenement, setEvenement] = useState('');
  const [qualite, setQualite] = useState('');
  const [memo, setMemo] = useState('');

  // Ajouter un nouvel état pour le tableau de validation
  const [showValidationTable, setShowValidationTable] = useState(false);
  const [validationTableData, setValidationTableData] = useState([]);

  const serviceData = [
    { idaff: '1', affectation: 'Aff1', responsable: 'Resp1', direction: 'Dir1', departement: 'Dep1', service: 'Service1' },
    { idaff: '2', affectation: 'Aff2', responsable: 'Resp2', direction: 'Dir2', departement: 'Dep2', service: 'Service2' },
    { idaff: '3', affectation: 'Aff3', responsable: 'Resp3', direction: 'Dir3', departement: 'Dep3', service: 'Service3' }
  ];

  const chaineData = [
    { codeClient: 'AL', nomClient: 'Aloula' },
    { codeClient: 'LA', nomClient: 'Laayoune' },
    { codeClient: 'AT', nomClient: 'Atakafia' }
  ];

  const referenceData = [
    { idL: '1', codeProd: 'CP1', ref: 'Ref1', designation: 'Des1', qteStock: 100, qteEnt: 50, qteResumMouv: 50, numReception: 'NR1', marche: 'M1', numPrix: 'NP1' },
    { idL: '2', codeProd: 'CP2', ref: 'Ref2', designation: 'Des2', qteStock: 200, qteEnt: 100, qteResumMouv: 100, numReception: 'NR2', marche: 'M2', numPrix: 'NP2' }
  ];

  const filteredServiceData = serviceData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(serviceFilterText.toLowerCase())
    )
  );

  const filteredChaineData = chaineData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(chaineFilterText.toLowerCase())
    )
  );

  const filteredReferenceData = referenceData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(referenceFilterText.toLowerCase())
    )
  );

  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.id = 'printable-content';
    document.body.appendChild(printContent);

    const ComponentToPrint = (
      <PrintableAffectationHistory
        affectationId={sessionAffectationId}
        validationTableData={validationTableData}
        selectedMarche={selectedMarche}
      />
    );

    ReactDOM.render(ComponentToPrint, printContent);

    const style = document.createElement('style');
    style.innerHTML = `
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
        .affectation-details {
          margin-bottom: 30px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .details-table th,
        .details-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .details-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          width: 150px;
        }
        .affectation-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .affectation-table th,
        .affectation-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        .affectation-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .section-header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .memo-section {
          margin-bottom: 30px;
        }
        .memo-content {
          border: 1px solid #ddd;
          padding: 15px;
          min-height: 100px;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        .signature-box {
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #000;
          margin-top: 50px;
        }
      }
    `;
    document.head.appendChild(style);

    window.print();

    document.body.removeChild(printContent);
    document.head.removeChild(style);
  };

  const confirmPrint = () => {
    setShowPrintModal(false);
    window.print();
  };

  const toggleServicePopup = () => setShowServicePopup(!showServicePopup);
  const toggleChainePopup = () => setShowChainePopup(!showChainePopup);
  const toggleReferencePopup = () => setShowReferencePopup(!showReferencePopup);

  // Nouvelles fonctions pour la gestion des marchés
  const toggleMarchePopup = () => {
    setShowMarchePopup(!showMarchePopup);
    if (!showMarchePopup) {
      fetchMarches();
    }
  };

  const fetchMarches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5003/api/amarches');
      console.log('Données reçues de l\'API:', response.data);
      setMarcheData(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des marchés:', err);
      setError('Erreur lors du chargement des marchés');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcheSelect = async (row) => {
    console.log('Marché sélectionné:', row);
    setSelectedMarche(row.marcheBC);
    setSelectedMarcheDetails(row);
    setShowMarchePopup(false);

    try {
      // Récupérer les affectations existantes pour ce marché
      const affectationsResponse = await axios.get(`http://localhost:5003/api/affectations?marcheBC=${row.marcheBC}`);
      const affectationsExistantes = affectationsResponse.data;
      
      // Créer un Map pour stocker la dernière affectation pour chaque SN
      const dernieresAffectations = new Map();
      affectationsExistantes.forEach(aff => {
        const existingAff = dernieresAffectations.get(aff.snReception);
        if (!existingAff || new Date(aff.dateAffectation) > new Date(existingAff.dateAffectation)) {
          dernieresAffectations.set(aff.snReception, aff);
        }
      });
      
      // Extraire les SN des réceptions qui sont actuellement affectées (état "Affecté")
      const snAffectes = Array.from(dernieresAffectations.values())
        .filter(aff => aff.etat === "Affecté")
        .map(aff => aff.snReception);

      // Extraire les réceptions du marché sélectionné
      const receptions = row.detailProjet.flatMap(projet => 
        projet.detailsPrix.flatMap(detail => 
          (detail.receptions || [])
          .filter(reception => {
            // Inclure la réception si :
            // 1. Elle n'est pas actuellement affectée (pas dans snAffectes)
            // 2. OU elle a une affectation avec état "Non affecté" (retournée)
            const derniereAffectation = dernieresAffectations.get(reception.sn);
            return !snAffectes.includes(reception.sn) || 
                   (derniereAffectation && derniereAffectation.etat === "Non affecté");
          })
          .map(reception => ({
            marche: row.marcheBC,
            numeroPrix: projet.numeroPrix,
            dateReception: reception.dateReception,
            codeProduit: detail.reference,
            designation: detail.designation,
            qteLivree: reception.quantiteLivree,
            sn: reception.sn,
            codeBarre: reception.codeBarre,
            finGarantie: reception.finGarantie,
            // Ajouter l'information si c'est une réaffectation
            estReaffectation: dernieresAffectations.has(reception.sn) && 
                             dernieresAffectations.get(reception.sn).etat === "Non affecté"
          }))
        )
      );
    
      setReceptionData(receptions);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des affectations:', err);
      setError('Erreur lors du chargement des affectations');
    }
  };

  // Filtrer les données du marché
  const filteredMarcheData = marcheData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
    )
  );

  // Filtrer les données des réceptions
  const filteredReceptionData = receptionData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(receptionFilterText.toLowerCase())
    )
  );

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseInt(value) >= 0) {
      setSelectedQuantity(value);
    }
  };

  const clearDetailForm = () => {
    setSelectedReference('');
    setSelectedReferenceDetails({
      codeProd: '',
      ref: '',
      designation: '',
      qteStock: '',
      qteEnt: '',
      qteResumMouv: '',
      numReception: '',
      marche: '',
      numPrix: ''
    });
    setSelectedQuantity('');
  };

  const handleValidate = async () => {
    // 1. Vérification du type d'affectation
    if (!selectedType) {
      setValidationMessage('Veuillez sélectionner un type d\'affectation.');
      setShowValidationModal(true);
      return;
    }

    // 2. Vérification des réceptions (multiple)
    if (!selectedReceptions || selectedReceptions.length === 0) {
      setValidationMessage('Veuillez sélectionner au moins une réception.');
      setShowValidationModal(true);
      return;
    }

    // 3. Vérification de la chaîne
    if (!selectedChaine) {
      setValidationMessage('Veuillez sélectionner une chaîne.');
      setShowValidationModal(true);
      return;
    }

    // 4. Vérification du service
    if (!selectedService) {
      setValidationMessage('Veuillez sélectionner un service.');
      setShowValidationModal(true);
      return;
    }

    // 5. Vérification de l'utilisateur
    if (!selectedUser) {
      setValidationMessage('Veuillez saisir un utilisateur.');
      setShowValidationModal(true);
      return;
    }

    try {
      // Calculer l'état en fonction des champs requis
      const etat = selectedType && dateAffectation && selectedReceptions ? 'Affecté' : 'Non affecté';

      // Utiliser l'ID approprié selon le mode
      const affectationIdToUse = isNavigationMode ? selectedAffectationId : sessionAffectationId;

      // Préparer les données pour toutes les affectations
      const affectationsData = selectedReceptions.map(sn => {
        const reception = receptionData.find(r => r.sn === sn);
        console.log('Reception trouvée pour SN', sn, ':', reception);

        const affectationData = {
          affectationId: affectationIdToUse,
          dateAffectation,
          typeAffectation: selectedType,
          idMarche: selectedMarcheDetails?._id,
          marcheBC: reception.marche, // Utiliser le marché de la réception
          numPrix: reception?.numeroPrix || '',
          snReception: reception?.sn || '',
          codeBarre: reception?.codeBarre || '',
          codeChaine: selectedChaine,
          nomChaine: selectedChaineNom,
          service: selectedService,
          utilisateur: selectedUser,
          lieu,
          evenement,
          qualite,
          memo,
          etat
        };

        console.log('Données d\'affectation préparées:', affectationData);
        return affectationData;
      });

      console.log('Données à envoyer:', { affectations: affectationsData });

      // Envoyer toutes les affectations en une seule requête
      const response = await axios.post('http://localhost:5003/api/affectations/multiple', {
        affectations: affectationsData
      });

      console.log('Réponse du serveur:', response.data);

      setValidationMessage('Affectations enregistrées avec succès!');
      setShowValidationModal(true);

      // Préparer les données pour le tableau de validation
      const selectedReceptionData = receptionData.filter(r => selectedReceptions.includes(r.sn));
      const validationData = selectedReceptionData.map(r => ({
        marcheBC: r.marche,
        numPrix: r.numeroPrix,
        dateAffectation: dateAffectation,
        codeProduit: r.codeProduit,
        designation: r.designation,
        snReception: r.sn,
        codeBarre: r.codeBarre,
        codeChaine: selectedChaine,
        service: selectedService,
        etat: etat,
        lieu,
        memo
      }));
      setValidationTableData(validationData);
      setShowValidationTable(true);

      // Après la création réussie des affectations
      if (isNavigationMode && selectedAffectationId) {
        // Recharger les données du tableau
        await loadAffectationsHistory(selectedAffectationId);
      }

    } catch (error) {
      console.error('Erreur détaillée lors de la sauvegarde:', error.response?.data || error);
      setValidationMessage('Erreur lors de l\'enregistrement des affectations: ' + (error.response?.data?.message || error.message));
      setShowValidationModal(true);
    }
  };

  const handleNew = () => {
    setValidationTableData([]);
    setShowNewModal(true);
  };

  const confirmNew = () => {
    setIsNavigationMode(false);
    setSelectedAffectationId(null);
    const newId = `AFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionAffectationId(newId);
    
    setGeneratedNumber('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDateAffectation(new Date().toISOString().split('T')[0]);
    setSelectedType('');
    setSelectedMarche('');
    setSelectedMarcheDetails(null);
    setReceptionData([]);
    setSelectedReceptions([]);
    setSelectedService('');
    setSelectedServiceDetails({
      idaff: '',
      affectation: '',
      responsable: '',
      direction: '',
      departement: '',
      service: ''
    });
    setSelectedChaine('');
    setSelectedChaineNom('');
    setSelectedUser('');
    setLieu('');
    setEvenement('');
    setQualite('');
    setMemo('');
    setDetailTableData([]);
    setValidationTableData([]);
    setShowDetailTable(false);
    setShowValidationTable(false);
    setShowNewModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showServicePopup && !event.target.closest('.popup')) {
        setShowServicePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showServicePopup]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChainePopup && !event.target.closest('.popup')) {
        setShowChainePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChainePopup]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReferencePopup && !event.target.closest('.popup')) {
        setShowReferencePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReferencePopup]);

  useEffect(() => {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Effacer le canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';

    const draw = (e) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastX = x;
      lastY = y;
    };

    const startDrawing = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [showSignatureModal]);

  // Fonctions pour la gestion des fichiers
  const handleFileSelectDocuments = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('typeFile', file.type);
        formData.append('description', '');
        formData.append('affectationId', isNavigationMode ? selectedAffectationId : sessionAffectationId);

        const response = await axios.post('http://localhost:5003/api/affecDocuments/upload', formData, {
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
        setInfoMessage('Document uploadé avec succès');
        setShowInfoModal(true);
      } catch (error) {
        console.error('Erreur lors de l\'upload du document:', error);
        setInfoMessage('Erreur lors de l\'upload du document');
        setShowInfoModal(true);
      }
    }
  };

  const handleRemoveDocuments = async (id) => {
    try {
      await axios.delete(`http://localhost:5003/api/affecDocuments/${id}`);
      setFileListDocuments(fileListDocuments.filter((file) => file.id !== id));
      setInfoMessage('Document supprimé avec succès');
      setShowInfoModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      setInfoMessage('Erreur lors de la suppression du document');
      setShowInfoModal(true);
    }
  };

  const handleSignatureUpload = () => {
    if (!signatureTitle) {
      alert('Veuillez saisir le titre !');
      return;
    }

    const canvas = document.getElementById('signatureCanvas');
    canvas.toBlob((blob) => {
      const signatureFile = {
        id: fileListDocuments.length + 1,
        fileName: signatureTitle,
        date: new Date().toLocaleDateString(),
        fileData: blob,
        typeFile: 'image/png',
        description: `${signatureTitle}.png`,
      };

      setFileListDocuments([...fileListDocuments, signatureFile]);
      setShowSignatureModal(false);
      setSignatureTitle('');
    }, 'image/png');
  };

  useEffect(() => {
    const handleClickOutsideMarche = (event) => {
      if (showMarchePopup && !event.target.closest('.popup')) {
        setShowMarchePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMarche);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMarche);
    };
  }, [showMarchePopup]);

  const toggleReceptionPopup = () => {
    setShowReceptionPopup(!showReceptionPopup);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const marcheBC = params.get('marcheBC');
    const affectationId = params.get('affectationId');
    
    console.log('Paramètres URL détectés:', { marcheBC, affectationId });
    
    if (marcheBC && affectationId) {
      initNavigationMode(marcheBC, affectationId);
    }
  }, []);

  const loadAffectationsHistory = async (affectationId) => {
    try {
      console.log('Chargement des affectations pour ID:', affectationId);
      const response = await axios.get(`http://localhost:5003/api/affectations/all`);
      const allAffectations = response.data;
      
      // Filtrer les affectations avec le même ID et qui sont actives
      const sameIdAffectations = allAffectations.filter(aff => 
        aff.affectationId === affectationId && aff.etat === "Affecté"
      );
      
      console.log('Affectations filtrées:', sameIdAffectations);
      setValidationTableData(prevData => {
        // Fusionner les nouvelles données avec les données existantes
        const mergedData = [...sameIdAffectations];
        // Supprimer les doublons basés sur snReception
        return mergedData.filter((item, index, self) =>
          index === self.findIndex((t) => t.snReception === item.snReception)
        );
      });
    } catch (error) {
      console.error('Erreur lors du chargement des affectations:', error);
      setInfoMessage('Erreur lors du chargement des affectations');
      setShowInfoModal(true);
    }
  };

  const initNavigationMode = async (marcheBC, affectationId) => {
    try {
      console.log('Initialisation du mode navigation:', { marcheBC, affectationId });
      setIsNavigationMode(true);
      setSelectedAffectationId(affectationId);
      
      // Charger les détails de l'affectation
      const affectationResponse = await axios.get(`http://localhost:5003/api/affectations/${affectationId}`);
      const affectation = affectationResponse.data;
      
      // Mettre à jour les états avec les données de l'affectation
      setSelectedMarche(affectation.marcheBC);
      setDateAffectation(affectation.dateAffectation);
      setSelectedChaine(affectation.codeChaine);
      setSelectedService(affectation.service);
      setLieu(affectation.lieu);
      setEvenement(affectation.evenement);
      setQualite(affectation.qualite);
      setSelectedUser(affectation.utilisateur);
      setMemo(affectation.memo);

      // Charger les détails du marché
      const marcheResponse = await axios.get(`http://localhost:5003/api/amarches/${marcheBC}`);
      setSelectedMarcheDetails(marcheResponse.data);

      // Charger toutes les affectations avec le même affectationId
      const allAffectationsResponse = await axios.get(`http://localhost:5003/api/affectations/group/${affectationId}`);
      setValidationTableData(allAffectationsResponse.data);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setInfoMessage('Erreur lors du chargement des données: ' + error.message);
      setShowInfoModal(true);
    }
  };

  useEffect(() => {
    if (isNavigationMode && selectedAffectationId) {
      loadAffectationsHistory(selectedAffectationId);
    }
  }, [isNavigationMode, selectedAffectationId]);

  useEffect(() => {
    const loadDocuments = async () => {
      if (isNavigationMode && selectedAffectationId) {
        try {
          const documentsResponse = await axios.get(`http://localhost:5003/api/affecDocuments/affectation/${selectedAffectationId}`);
          setFileListDocuments(documentsResponse.data.map(doc => ({
            id: doc._id,
            fileName: doc.fileName,
            date: new Date(doc.date).toLocaleDateString(),
            typeFile: doc.typeFile,
            description: doc.description
          })));
        } catch (error) {
          console.error('Erreur lors du chargement des documents:', error);
          setInfoMessage('Erreur lors du chargement des documents');
          setShowInfoModal(true);
        }
      }
    };

    loadDocuments();
  }, [isNavigationMode, selectedAffectationId]);

  useEffect(() => {
    const fetchReceptions = async () => {
      try {
        setIsLoading(true);
        // Récupérer tous les marchés
        const marchesResponse = await axios.get('http://localhost:5003/api/amarches');
        const marches = marchesResponse.data;

        // Récupérer toutes les affectations existantes
        const affectationsResponse = await axios.get('http://localhost:5003/api/affectations/all');
        const affectationsExistantes = affectationsResponse.data;
        
        // Créer un Map pour stocker la dernière affectation pour chaque SN
        const dernieresAffectations = new Map();
        affectationsExistantes.forEach(aff => {
          const existingAff = dernieresAffectations.get(aff.snReception);
          if (!existingAff || new Date(aff.dateAffectation) > new Date(existingAff.dateAffectation)) {
            dernieresAffectations.set(aff.snReception, aff);
          }
        });
        
        // Extraire les SN des réceptions qui sont actuellement affectées (état "Affecté")
        const snAffectes = Array.from(dernieresAffectations.values())
          .filter(aff => aff.etat === "Affecté")
          .map(aff => aff.snReception);

        // Extraire toutes les réceptions de tous les marchés
        const allReceptions = marches.flatMap(marche => 
          marche.detailProjet.flatMap(projet => 
            projet.detailsPrix.flatMap(detail => 
              (detail.receptions || [])
              .filter(reception => {
                // Inclure la réception si :
                // 1. Elle n'est pas actuellement affectée (pas dans snAffectes)
                // 2. OU elle a une affectation avec état "Non affecté" (retournée)
                const derniereAffectation = dernieresAffectations.get(reception.sn);
                return !snAffectes.includes(reception.sn) || 
                       (derniereAffectation && derniereAffectation.etat === "Non affecté");
              })
              .map(reception => ({
                marche: marche.marcheBC,
                numeroPrix: projet.numeroPrix,
                dateReception: reception.dateReception,
                codeProduit: detail.reference,
                designation: detail.designation,
                qteLivree: reception.quantiteLivree,
                sn: reception.sn,
                codeBarre: reception.codeBarre,
                finGarantie: reception.finGarantie,
                estReaffectation: dernieresAffectations.has(reception.sn) && 
                                dernieresAffectations.get(reception.sn).etat === "Non affecté"
              }))
            )
          )
        );

        setReceptionData(allReceptions);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceptions();
  }, []);

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
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
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaCalendarAlt className="me-2" />Date affectation</Form.Label>
                      <Form.Control type="date" value={dateAffectation} onChange={(e) => setDateAffectation(e.target.value)} />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                      <Form.Label><FaClipboardList className="me-2" />Type d'affectation</Form.Label>
                      <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                        <option value="">Sélectionner un type</option>
                        <option value="Definitive">Definitive</option>
                        <option value="Provisoire">Provisoire</option>
                      </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                      <Form.Label><FaBoxOpen className="me-2" />Equipements</Form.Label>
                      <InputGroup>
                              <Form.Control type="text" value={selectedReceptions.join(', ')} readOnly />
                              <Button variant="secondary" className="search-button" onClick={toggleReceptionPopup}>
                                <FaSearch />
                              </Button>
                      </InputGroup>
                      {showReceptionPopup && (
                        <div className="popup">
                          <Form.Control
                            type="text"
                            placeholder="Rechercher..."
                            value={receptionFilterText}
                            onChange={(e) => setReceptionFilterText(e.target.value)}
                            className="mb-1"
                            size="sm"
                          />
                          <div className="table-container">
                            <Table striped bordered hover size="sm" className="compact-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '25px', padding: '2px' }}></th>
                                  <th style={{ minWidth: '70px' }}>Marché</th>
                                  <th style={{ minWidth: '60px' }}>N°Prix</th>
                                  <th style={{ minWidth: '75px' }}>Date</th>
                                  <th style={{ minWidth: '70px' }}>Code</th>
                                  <th style={{ minWidth: '100px' }}>Désign.</th>
                                  <th style={{ minWidth: '40px' }}>Qte</th>
                                  <th style={{ minWidth: '70px' }}>SN</th>
                                  <th style={{ minWidth: '70px' }}>C.Barre</th>
                                  <th style={{ minWidth: '75px' }}>Garantie</th>
                                  <th style={{ minWidth: '60px' }}>État</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredReceptionData.map((row, index) => (
                                  <tr key={index}>
                                    <td style={{ padding: '2px', textAlign: 'center' }}>
                                      <Form.Check
                                        type="checkbox"
                                        checked={selectedReceptions.includes(row.sn)}
                                        onChange={e => {
                                          if (e.target.checked) {
                                            setSelectedReceptions(prev => [...prev, row.sn]);
                                            setSelectedMarche(row.marche);
                                          } else {
                                            setSelectedReceptions(prev => prev.filter(sn => sn !== row.sn));
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>{row.marche}</td>
                                    <td>{row.numeroPrix}</td>
                                    <td>{new Date(row.dateReception).toLocaleDateString()}</td>
                                    <td>{row.codeProduit}</td>
                                    <td>{row.designation}</td>
                                    <td className="text-center">{row.qteLivree}</td>
                                    <td>{row.sn}</td>
                                    <td>{row.codeBarre}</td>
                                    <td>{row.finGarantie ? new Date(row.finGarantie).toLocaleDateString() : ''}</td>
                                    <td>
                                      <span className={`etat-badge ${row.estReaffectation ? 'non-affecté' : 'nouveau'}`}>
                                        {row.estReaffectation ? 'Retourné' : 'Nouveau'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                      <Form.Label><FaStar className="me-2" />Chaîne</Form.Label>
                      <InputGroup>
                        <Form.Control type="text" value={selectedChaine} readOnly />
                        <Button variant="secondary" className="search-button" onClick={toggleChainePopup}>
                          <FaSearch />
                        </Button>
                      </InputGroup>
                      {showChainePopup && (
                        <div className="popup">
                          <Form.Control
                            type="text"
                            placeholder="Rechercher..."
                            value={chaineFilterText}
                            onChange={(e) => setChaineFilterText(e.target.value)}
                            className="mb-2"
                          />
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Code Client</th>
                                <th>Nom Client</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredChaineData.map((row, index) => (
                                <tr key={index} onClick={() => {
                                  setSelectedChaine(row.codeClient);
                                  setSelectedChaineNom(row.nomClient);
                                  setShowChainePopup(false);
                                }}>
                                  <td>{row.codeClient}</td>
                                  <td>{row.nomClient}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                      <Form.Label><FaUserAlt className="me-2" />Service</Form.Label>
                      <InputGroup>
                        <Form.Control type="text" value={selectedService} readOnly />
                        <Button variant="secondary" className="search-button" onClick={toggleServicePopup}>
                          <FaSearch />
                        </Button>
                      </InputGroup>
                      {showServicePopup && (
                        <div className="popup">
                          <Form.Control
                            type="text"
                            placeholder="Rechercher..."
                            value={serviceFilterText}
                            onChange={(e) => setServiceFilterText(e.target.value)}
                            className="mb-2"
                          />
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>ID Aff</th>
                                <th>Affectation</th>
                                <th>Responsable</th>
                                <th>Direction</th>
                                <th>Département</th>
                                <th>Service</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredServiceData.map((row, index) => (
                                <tr key={index} onClick={() => {
                                  setSelectedService(row.service);
                                  setSelectedServiceDetails(row);
                                  setShowServicePopup(false);
                                }}>
                                  <td>{row.idaff}</td>
                                  <td>{row.affectation}</td>
                                  <td>{row.responsable}</td>
                                  <td>{row.direction}</td>
                                  <td>{row.departement}</td>
                                  <td>{row.service}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                  </Form.Group>
                  
                  
                  
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaMapMarkerAlt className="me-2" />Lieu</Form.Label>
                      <Form.Control 
                        type="text"
                        value={lieu}
                        onChange={(e) => setLieu(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaCalendarAlt className="me-2" />Événement</Form.Label>
                      <Form.Control 
                        type="text"
                        value={evenement}
                        onChange={(e) => setEvenement(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaStar className="me-2" />Qualité</Form.Label>
                      <Form.Control 
                        type="text"
                        value={qualite}
                        onChange={(e) => setQualite(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaUserAlt className="me-2" />Utilisateur</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        placeholder="Saisir le nom de l'utilisateur"
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaComments className="me-2" />Mémo</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                  </Form.Group>
                </Col>
              </Row>
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
                                          `http://localhost:5003/api/affecDocuments/download/${file.id}`,
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
                                        setInfoMessage('Erreur lors du téléchargement du fichier: ' + 
                                          (error.response?.data?.message || error.message));
                                        setShowInfoModal(true);
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
                      <th>Type</th>
                      <th>Service</th>
                      <th>Chaîne</th>
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
                        setEditingIndex(index);
                      }}>
                        <td>{data.generatedNumber}</td>
                        <td>{data.selectedDate}</td>
                        <td>{data.selectedType}</td>
                        <td>{data.selectedService}</td>
                        <td>{data.selectedChaine}</td>
                        <td>{data.selectedReference}</td>
                        <td>{data.selectedReferenceDetails.designation}</td>
                        <td>{data.selectedQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              {showValidationTable && validationTableData.length > 0 && !isNavigationMode && (
                <Card className="mt-4">
                  <Card.Header>
                    <h5 className="mb-0">Résultat de la validation</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Marché</th>
                          <th>Numéro Prix</th>
                          <th>Date affectation</th>
                          <th>Code Produit</th>
                          <th>Désignation</th>
                          <th>SN</th>
                          <th>Code-barre</th>
                          <th>Chaîne</th>
                          <th>Service</th>
                          <th>État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationTableData.map((affectation, index) => (
                          <tr key={index}>
                            <td>{affectation.marcheBC}</td>
                            <td>{affectation.numPrix}</td>
                            <td>{new Date(affectation.dateAffectation).toLocaleDateString()}</td>
                            <td>{affectation.codeProduit}</td>
                            <td>{affectation.designation}</td>
                            <td>{affectation.snReception}</td>
                            <td>{affectation.codeBarre}</td>
                            <td>{affectation.codeChaine}</td>
                            <td>{affectation.service}</td>
                            <td>
                              <span className={`etat-badge ${affectation.etat.toLowerCase()}`}>
                                {affectation.etat}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {isNavigationMode && validationTableData.length > 0 && (
                <Card className="mt-4">
                  <Card.Header>
                    <h5 className="mb-0">Détails de l'affectation</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Marché</th>
                          <th>Numéro Prix</th>
                          <th>Date affectation</th>
                          <th>Code Produit</th>
                          <th>Désignation</th>
                          <th>SN</th>
                          <th>Code-barre</th>
                          <th>Chaîne</th>
                          <th>Service</th>
                          <th>État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationTableData.map((affectation, index) => (
                          <tr key={index}>
                            <td>{affectation.marcheBC}</td>
                            <td>{affectation.numPrix}</td>
                            <td>{new Date(affectation.dateAffectation).toLocaleDateString()}</td>
                            <td>{affectation.codeProduit}</td>
                            <td>{affectation.designation}</td>
                            <td>{affectation.snReception}</td>
                            <td>{affectation.codeBarre}</td>
                            <td>{affectation.codeChaine}</td>
                            <td>{affectation.service}</td>
                            <td>
                              <span className={`etat-badge ${affectation.etat.toLowerCase()}`}>
                                {affectation.etat}
                              </span>
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
          <Modal.Title>Confirmation d'impression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir imprimer ce document ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={confirmPrint}>
            <FaPrint className="me-2" /> Confirmer et imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Validation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {validationMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
            Fermer
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
            Annuler
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
            Annuler
          </Button>
          <Button variant="primary" onClick={confirmNew}>
            <FaPlus className="me-2" />
            Créer nouveau
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .card {
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-bottom: 0.5rem;
          }

          .card-header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 0.5rem 1rem;
          }

          .card-body {
            padding: 0.75rem;
          }

          .card-header .btn {
            margin: 0 0.25rem;
            padding: 0.25rem 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .form-label {
            color: #495057;
            font-weight: 500;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .form-control {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            min-height: 32px;
            transition: border-color 0.15s ease-in-out;
          }

          .form-control:focus {
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .input-group .btn {
            padding: 0.25rem 0.5rem;
            background: #e9ecef;
            border-color: #ced4da;
            color: #495057;
            font-size: 0.875rem;
          }

          .table {
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }

          .table thead th {
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            color: #495057;
            font-weight: 600;
            padding: 0.5rem;
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

          .popup {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 6px;
            margin-top: 4px;
            width: 85%;
            max-height: 350px;
            display: flex;
            flex-direction: column;
          }

          .popup .form-control {
            margin-bottom: 6px;
            height: 24px;
            font-size: 11px;
            padding: 2px 6px;
          }

          .table-container {
            flex: 1;
            overflow-y: auto;
            margin: -1px;
          }

          .compact-table {
            margin: 0;
            font-size: 11px;
          }

          .compact-table th,
          .compact-table td {
            padding: 2px 4px;
            vertical-align: middle;
            line-height: 1.2;
          }

          .table-container thead th {
            position: sticky;
            top: 0;
            background: #f8f9fa;
            z-index: 1;
            border-bottom: 1px solid #dee2e6;
            font-size: 11px;
            font-weight: 600;
            padding: 4px;
          }

          .table-container tbody td {
            white-space: nowrap;
            font-size: 11px;
          }

          .etat-badge {
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 10px;
            font-weight: 500;
          }

          .text-center {
            text-align: center;
          }

          .modal-content {
            border-radius: 4px;
            overflow: hidden;
          }

          .modal-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
          }

          .modal-title {
            color: white;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .modal-body {
            padding: 0.75rem;
          }

          .modal-footer {
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            padding: 0.5rem 1rem;
          }

          .nav-tabs {
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 0.75rem;
          }

          .nav-tabs .nav-link {
            color: #6c757d;
            padding: 0.5rem 0.75rem;
            border: none;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            font-size: 0.875rem;
          }

          .nav-tabs .nav-link.active {
            color: #007bff;
            border-bottom-color: #007bff;
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

          .btn-info {
            background: linear-gradient(45deg, #17a2b8, #138496);
            border: none;
          }

          .btn-danger {
            background: linear-gradient(45deg, #dc3545, #c82333);
            border: none;
          }

          .btn {
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          .form-group {
            margin-bottom: 0.5rem;
          }

          .action-button {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-right: 0.5rem;
          }

          .action-button:hover {
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

          .delete-button {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }

          .delete-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
          }

          .form-label svg {
            color: #6c757d;
            margin-right: 0.5rem;
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

          .input-group {
            min-height: 32px;
          }

          .input-group .form-control {
            height: 32px;
          }

          .etat-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.875rem;
            text-transform: capitalize;
          }

          .etat-badge.affecté {
            background-color: #28a745;
            color: white;
          }

          .etat-badge.non-affecté {
            background-color: #dc3545;
            color: white;
          }

          .etat-badge.nouveau {
            background-color: #17a2b8;
            color: white;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default FormsElements;
