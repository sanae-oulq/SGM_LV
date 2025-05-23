import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Modal, DropdownButton, Dropdown, Tabs, Tab, Table } from 'react-bootstrap';
import { FaArrowLeft, FaTrash, FaFileUpload, FaSignature, FaFile, FaDownload, FaFileAlt, FaPlus, FaSave, FaPrint, FaSearch, FaCalendarAlt, FaUserAlt, FaMapMarkerAlt, FaStar, FaClipboardList, FaComments, FaCheck, FaTimes, FaEdit, FaBoxOpen } from 'react-icons/fa';
import './GEDStyles.css';
import axios from 'axios';
import ReactDOM from 'react-dom';
import AffectationsSelector from '../../components/AffectationsSelector';

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
  const [datePassation, setDatePassation] = useState(new Date().toISOString().split('T')[0]);
  
  // États pour la passation
  const [sessionPassationId, setSessionPassationId] = useState(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const secondRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PASS-${timestamp}-${random}${secondRandom}`;
  });

  // Nouveaux états
  const [selectedType, setSelectedType] = useState('');
  const [selectedChaine, setSelectedChaine] = useState('');
  const [selectedChaineNom, setSelectedChaineNom] = useState('');
  const [showChainePopup, setShowChainePopup] = useState(false);
  const [chaineFilterText, setChaineFilterText] = useState('');
  const [filteredChaineData, setFilteredChaineData] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [serviceFilterText, setServiceFilterText] = useState('');
  const [filteredServiceData, setFilteredServiceData] = useState([]);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [lieu, setLieu] = useState('');
  const [evenement, setEvenement] = useState('');
  const [qualite, setQualite] = useState('');
  
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

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Passation de Matériel</Card.Title>
            </Card.Header>
            <Card.Body>
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

      <AffectationsSelector
        show={showAffectationsSelector}
        onHide={() => setShowAffectationsSelector(false)}
        onSelect={(selected) => {
          setShowAffectationsSelector(false);
        }}
        selectedAffectations={selectedAffectations}
        setSelectedAffectations={setSelectedAffectations}
        setSelectedAffectationDetails={setSelectedAffectationDetails}
      />

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
