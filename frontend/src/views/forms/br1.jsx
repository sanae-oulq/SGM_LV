import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Modal, DropdownButton, Dropdown, Tabs, Tab, Table } from 'react-bootstrap';
import { FaArrowLeft, FaTrash, FaFileUpload, FaSignature, FaFile, FaDownload, FaFileAlt, FaPlus, FaSave, FaPrint, FaSearch, FaCalendarAlt, FaUserAlt, FaMapMarkerAlt, FaStar, FaClipboardList, FaComments, FaCheck, FaTimes, FaEdit, FaBoxOpen } from 'react-icons/fa';
import './GEDStyles.css';
import axios from 'axios';

const FormsElements = () => {
  
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [dateAffectation, setDateAffectation] = useState(new Date().toISOString().split('T')[0]);
  
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showGED, setShowGED] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [datePassation, setDatePassation] = useState(new Date().toISOString().split('T')[0]);
  
  // États pour la passation
  const [sessionPassationId, setSessionPassationId] = useState(() => {
    const newId = `PASS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return newId;
  });

// États existants
  const [showAffectationPopup, setShowAffectationPopup] = useState(false);
  const [affectationFilterText, setAffectationFilterText] = useState('');
  const [selectedAffectations, setSelectedAffectations] = useState([]);
  const [selectedAffectationDetails, setSelectedAffectationDetails] = useState([]);
  const [selectedAffectationServices, setSelectedAffectationServices] = useState([]);
  const [selectedAffectationUsers, setSelectedAffectationUsers] = useState([]);
  const [affectationData, setAffectationData] = useState([]);
  const [filteredAffectationData, setFilteredAffectationData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showServicePopup, setShowServicePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showValidationTable, setShowValidationTable] = useState(false);
  const [validationTableData, setValidationTableData] = useState([]);
  const [fileListDocuments, setFileListDocuments] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTitle, setSignatureTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [showAffectationsSelector, setShowAffectationsSelector] = useState(false);

  // Effet pour charger les affectations
  useEffect(() => {
    const fetchAffectations = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5003/api/affectations/all');
        const affectations = response.data.filter(aff => 
          aff.etat === 'Affecté' && 
          aff.snReception && 
          aff.marcheBC && 
          aff.numPrix
        );
        setAffectationData(affectations);
        setFilteredAffectationData(affectations);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des affectations:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffectations();
  }, []);


   // Effet pour filtrer les affectations
  useEffect(() => {
    const filtered = affectationData.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(affectationFilterText.toLowerCase())
      )
    );
    setFilteredAffectationData(filtered);
  }, [affectationFilterText, affectationData]);

  const toggleAffectationPopup = () => {
    setShowAffectationPopup(!showAffectationPopup);
  };

  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.id = 'printable-content';
    document.body.appendChild(printContent);

    const ComponentToPrint = (
      <PrintableAffectationHistory
        affectationId={sessionPassationId}
        validationTableData={validationTableData}
        selectedMarche={selectedAffectations.join(', ')}
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


  // Nouveaux états
  const [selectedType, setSelectedType] = useState('');
  const [lieu, setLieu] = useState('');
  const [evenement, setEvenement] = useState('');
  const [qualite, setQualite] = useState('');
  

  // Nouveaux états pour la gestion des marchés
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [marcheData, setMarcheData] = useState([]);
  
  // Nouvel état pour les réceptions
  const [receptionData, setReceptionData] = useState([]);
  const [receptionFilterText, setReceptionFilterText] = useState('');
  const [showReceptionPopup, setShowReceptionPopup] = useState(false);
  const [selectedReception, setSelectedReception] = useState('');
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
  
  // Nouveaux états pour GED
  const [signatureImage, setSignatureImage] = useState(null);
  
  const [showNewModal, setShowNewModal] = useState(false);

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

  const confirmPrint = () => {
    setShowPrintModal(false);
    window.print();
  };

  const toggleServicePopup = () => setShowServicePopup(!showServicePopup);
  
  const handleValidate = async () => {
    try {
      if (!selectedService || !selectedUser || selectedAffectationDetails.length === 0) {
        setValidationMessage('Veuillez remplir tous les champs obligatoires');
        setShowValidationModal(true);
        return;
      }

      const passationData = {
        passationId: sessionPassationId,
        datePassation: datePassation,
        affectations: selectedAffectationDetails.map(affectation => ({
          affectationId: affectation._id,
          snReception: affectation.snReception,
          marcheBC: affectation.marcheBC,
          numPrix: affectation.numPrix,
          codeProduit: affectation.codeProduit,
          designation: affectation.designation,
          codeBarre: affectation.codeBarre,
          previousService: affectation.service,
          previousUser: affectation.utilisateur,
          newService: selectedService,
          newUser: selectedUser,
          dateAffectation: new Date().toISOString()
        })),
        memo: memo,
        documents: fileListDocuments.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          typeFile: doc.typeFile
        }))
      };

      const response = await axios.post('http://localhost:5003/api/passations/create', passationData);

      if (response.data.success) {
        setValidationMessage('Passation effectuée avec succès');
        setValidationTableData(selectedAffectationDetails.map(affectation => ({
          ...affectation,
          service: selectedService,
          utilisateur: selectedUser,
          dateAffectation: new Date().toISOString(),
          etat: 'Affecté'
        })));
        setShowValidationTable(true);
      } else {
        throw new Error(response.data.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      setValidationMessage(error.response?.data?.message || error.message);
    } finally {
      setShowValidationModal(true);
    }
  };

  const handleNew = () => {
    setValidationTableData([]);
    setShowAffectationPopup(true);
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
      if (showAffectationPopup && !event.target.closest('.popup')) {
        setShowAffectationPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAffectationPopup]);

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
        formData.append('affectationId', sessionPassationId);

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

  const handleMarcheSelect = (row) => {
    console.log('Marché sélectionné:', row);
    setSelectedMarche(row.marcheBC);
    setSelectedMarcheDetails(row);
    setShowMarchePopup(false);

    // Extraire les réceptions du marché sélectionné
    const receptions = row.detailProjet.flatMap(projet => 
      projet.detailsPrix.map(detail => ({
        marche: row.marcheBC,
        numeroPrix: projet.numeroPrix,
        dateReception: detail.dateReception,
        codeProduit: detail.reference,
        designation: detail.designation,
        qteLivree: detail.quantiteLivree,
        sn: detail.sn,
        finGarantie: detail.finGarantie
      }))
    ).filter(reception => reception.dateReception);
    
    setReceptionData(receptions);
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



  const confirmNew = () => {
    setGeneratedNumber('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedType('');
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
    clearDetailForm();
    setDetailTableData([]);
    setShowDetailTable(false);
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
{/** */}
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
              
{/**
              

              

*/}
              
              
             
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date de Passation</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaCalendarAlt />
                        </InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={datePassation}
                          onChange={(e) => setDatePassation(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Numéro de Passation</Form.Label>
                      <Form.Control
                        type="text"
                        value={sessionPassationId}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Affectations à Transférer</Form.Label>
                      <div className="d-flex align-items-center mb-2">
                        <Button
                          variant="primary"
                          onClick={() => setShowAffectationsSelector(true)}
                        >
                          <FaPlus className="me-2" /> Sélectionner des Affectations
                        </Button>
                        {selectedAffectationDetails.length > 0 && (
                          <span className="ms-3 text-muted">
                            {selectedAffectationDetails.length} affectation(s) sélectionnée(s)
                          </span>
                        )}
                      </div>
                      {selectedAffectationDetails.length > 0 && (
                        <div className="table-responsive">
                          <Table striped bordered hover>
                            <thead>
                              <tr>
                                <th>Marché</th>
                                <th>Numéro Prix</th>
                                <th>Code Produit</th>
                                <th>Désignation</th>
                                <th>SN</th>
                                <th>Service Actuel</th>
                                <th>Utilisateur Actuel</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedAffectationDetails.map((affectation) => (
                                <tr key={affectation._id}>
                                  <td>{affectation.marcheBC || '-'}</td>
                                  <td>{affectation.numPrix || '-'}</td>
                                  <td>{affectation.codeProduit || '-'}</td>
                                  <td>{affectation.designation || '-'}</td>
                                  <td>{affectation.snReception || '-'}</td>
                                  <td>{affectation.service || '-'}</td>
                                  <td>{affectation.utilisateur || '-'}</td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAffectations(prev => 
                                          prev.filter(id => id !== affectation._id)
                                        );
                                        setSelectedAffectationDetails(prev =>
                                          prev.filter(detail => detail._id !== affectation._id)
                                        );
                                      }}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type d'affectation</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaClipboardList />
                        </InputGroup.Text>
                        <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                          <option value="">Sélectionner un type</option>
                          <option value="Definitive">Definitive</option>
                          <option value="Provisoire">Provisoire</option>
                        </Form.Select>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nouvelle Chaîne</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaStar />
                        </InputGroup.Text>
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
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau Service</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUserAlt />
                        </InputGroup.Text>
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
                      <Form.Label>Nouvel Utilisateur</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaUserAlt />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          placeholder="Saisir le nom de l'utilisateur"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lieu</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaMapMarkerAlt />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={lieu}
                          onChange={(e) => setLieu(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Événement</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaCalendarAlt />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={evenement}
                          onChange={(e) => setEvenement(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Qualité</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaStar />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={qualite}
                          onChange={(e) => setQualite(e.target.value)}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Mémo</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Ajouter un commentaire ou des notes supplémentaires..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col className="d-flex justify-content-end">
                    <Button
                      variant="secondary"
                      className="me-2"
                      onClick={() => window.history.back()}
                    >
                      <FaArrowLeft className="me-2" /> Retour
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleValidate}
                      disabled={!selectedService || !selectedUser || selectedAffectationDetails.length === 0}
                    >
                      <FaCheck className="me-2" /> Valider la Passation
                    </Button>
                  </Col>
                </Row>
              </Form>

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
                              <th className="text-center">ID</th>
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
                                <td className="text-center">{file.id}</td>
                                <td>{file.fileName}</td>
                                <td>{file.typeFile}</td>
                                <td>{file.date}</td>
                                <td>
                                  <Button 
                                    variant="link" 
                                    className="file-link"
                                    onClick={() => {
                                      const url = URL.createObjectURL(file.fileData);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = file.fileName + '.' + file.typeFile.split('/')[1];
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    <FaDownload className="me-2" />
                                    {file.fileName + '.' + file.typeFile.split('/')[1]}
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
            padding: 0.15rem;
            margin-top: 2px;
            max-height: 120px;
            overflow-y: auto;
            width: 500px;
            max-width: 95%;
          }

          .popup .table {
            margin: 0;
            font-size: 0.7rem;
          }

          .popup .table thead th {
            padding: 0.15rem 0.25rem;
            font-size: 0.7rem;
            white-space: nowrap;
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .popup .table tbody td {
            padding: 0.15rem 0.25rem;
            font-size: 0.7rem;
          }

          .popup .table tbody tr:hover {
            background-color: #f8f9fa;
            cursor: pointer;
          }

          .popup .form-control {
            font-size: 0.7rem;
            padding: 0.15rem 0.25rem;
            margin-bottom: 0.15rem;
            height: 24px;
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
        `}
      </style>
    </React.Fragment>
  );
};

export default FormsElements;