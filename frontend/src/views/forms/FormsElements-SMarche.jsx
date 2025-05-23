import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Modal, Table, Tabs, Tab } from 'react-bootstrap';
import { FaPlus, FaSave, FaPrint, FaFileAlt, FaCalendarAlt, FaSearch, FaClipboardList, FaStore, FaUser, FaTag, FaTrash, FaTimes, FaCheck, FaArrowLeft, FaSignature, FaFileUpload, FaFile, FaDownload } from 'react-icons/fa';
import './GEDStyles.css';

const FormsElements = () => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showGED, setShowGED] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [validationMessage, setValidationMessage] = useState('');
  const [fileListDocuments, setFileListDocuments] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTitle, setSignatureTitle] = useState('');
  
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState({});
  const [courseDev, setCourseDev] = useState('1.0000000');
  
  const [showNumPrixPopup, setShowNumPrixPopup] = useState(false);
  const [numPrixFilterText, setNumPrixFilterText] = useState('');
  const [selectedNumPrix, setSelectedNumPrix] = useState('');
  const [selectedNumPrixDetails, setSelectedNumPrixDetails] = useState({});
  
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [referenceFilterText, setReferenceFilterText] = useState('');
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedReferenceDetails, setSelectedReferenceDetails] = useState({});
  
  const [detailTableData, setDetailTableData] = useState([]);
  const [showDetailTable, setShowDetailTable] = useState(false);

  const [isMarcheDisabled, setIsMarcheDisabled] = useState(false);
  
  const [selectedDevise, setSelectedDevise] = useState('MAD');
  const [selectedUnite, setSelectedUnite] = useState('U');
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');
  
  const [editingIndex, setEditingIndex] = useState(-1);

  const [refExt1, setRefExt1] = useState('');
  const [refExt2, setRefExt2] = useState('');
  const [memo, setMemo] = useState('');

  // Mock data for marché
  const marcheData = [
    { 
      numReception: 'REC001',
      marche: 'M001',
      numPrix: 'NP001',
      descprix: 'Description prix 1',
      dateOpe: '2024-03-20',
      fournisseur: 'Fournisseur 1',
      codeProd: 'CP001',
      designation: 'Designation 1',
      qteMarche: '100',
      qteRecept: '50',
      qteRest: '50'
    }
  ];

  // Mock data for articles in marché
  const marcheArticlesData = [
    {
      num: '1',
      codeProd: 'CP1',
      ref: 'REF1',
      designation: 'Des1',
      designation1: 'Des1-1',
      typeArt: 'Type1',
      marque: 'Marque1',
      unite: 'U',
      qte: '100',
      prixUnit: '10.00',
      numPrix: 'NP1',
      desigPrix: 'DesP1'
    }
  ];

  // Mock data for numéro de prix
  const numPrixData = [
    {
      num_prix: 'NP1',
      objectif_prix: 'Obj1',
      unite: 'U',
      qte_marche: '100'
    }
  ];

  // Mock data for reference
  const referenceData = [
    {
      code: 'C1',
      designation: 'Des1',
      famille: 'Fam1',
      marque: 'Marque1',
      ref: 'Ref1',
      codeExt: 'CE1',
      serialisable: 'Non',
      rayon: 'R1',
      stock_min: '10',
      stock_max: '100',
      designation_long: 'DesLong1'
    }
  ];

  const filteredMarcheData = marcheData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
    )
  );

  const filteredNumPrixData = numPrixData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(numPrixFilterText.toLowerCase())
    )
  );

  const filteredReferenceData = referenceData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(referenceFilterText.toLowerCase())
    )
  );

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    setShowPrintModal(false);
    window.print();
  };

  const handleNew = () => {
    setShowNewModal(true);
  };

  const handleValidate = () => {
    if (!selectedMarche) {
      setValidationMessage('Veuillez sélectionner un marché.');
      setShowValidationModal(true);
      return;
    }

    // Vérifier les champs obligatoires du détail
    if (!selectedNumPrix || !selectedReference || !quantite) {
      setValidationMessage('Veuillez remplir tous les champs obligatoires (Numéro de Prix, Référence, Quantité).');
      setShowValidationModal(true);
      return;
    }

    const updatedData = {
      generatedNumber: generatedNumber || `SM-${Math.floor(Math.random() * 10000)}`,
      selectedDate,
      selectedMarche,
      selectedMarcheDetails,
      selectedDevise,
      courseDev,
      selectedNumPrix,
      selectedNumPrixDetails,
      selectedReference,
      selectedReferenceDetails,
      selectedUnite,
      quantite,
      prix
    };

    if (editingIndex !== -1) {
      // Mise à jour d'une ligne existante
      const updatedTableData = [...detailTableData];
      updatedTableData[editingIndex] = updatedData;
      setDetailTableData(updatedTableData);
      setEditingIndex(-1);
    } else {
      // Ajout d'une nouvelle ligne
      setDetailTableData([...detailTableData, updatedData]);
    }

    setValidationMessage('Validation réussie.');
    setShowValidationModal(true);
    setShowDetailTable(true);
    clearDetailForm();
  };

  const clearDetailForm = () => {
    // Réinitialiser uniquement les champs du formulaire de détail
    setSelectedNumPrix('');
    setSelectedNumPrixDetails({});
    setSelectedReference('');
    setSelectedReferenceDetails({});
    setSelectedUnite('U');
    setQuantite('');
    setPrix('');
    setEditingIndex(-1);
    setRefExt1('');
    setRefExt2('');
    setMemo('');
  };

  const confirmNew = () => {
    setGeneratedNumber('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedMarche('');
    setSelectedMarcheDetails({});
    setCourseDev('1.0000000');
    setDetailTableData([]);
    setShowDetailTable(false);
    setShowNewModal(false);
    setIsMarcheDisabled(false);
  };

  const toggleMarchePopup = () => setShowMarchePopup(!showMarchePopup);
  const toggleNumPrixPopup = () => setShowNumPrixPopup(!showNumPrixPopup);
  const toggleReferencePopup = () => setShowReferencePopup(!showReferencePopup);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseInt(value) >= 0) {
      setQuantite(value);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setPrix(value);
    }
  };

  const handleFileSelectDocuments = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newFile = {
        id: Date.now(),
        fileName: file.name.split('.')[0],
        typeFile: file.type,
        date: new Date().toLocaleDateString(),
        fileData: file
      };
      setFileListDocuments(prevFiles => [...prevFiles, newFile]);
    }
  };

  const handleRemoveDocuments = (id) => {
    setFileListDocuments(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const handleSignatureUpload = () => {
    if (!signatureTitle) {
      alert('Veuillez saisir le titre !');
      return;
    }

    const canvas = document.getElementById('signatureCanvas');
    canvas.toBlob((blob) => {
      const signatureFile = {
        id: Date.now(),
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

  // Initialisation du canvas pour la signature
  useEffect(() => {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas || !showSignatureModal) return;
    
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
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                      <Form.Label><FaFileAlt className="me-2" />Numéro</Form.Label>
                      <Form.Control type="text" value={generatedNumber} readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaCalendarAlt className="me-2" />Date</Form.Label>
                      <Form.Control type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaClipboardList className="me-2" />Marché</Form.Label>
                    <InputGroup>
                        <Form.Control type="text" value={selectedMarche} readOnly />
                        <Button 
                          variant="secondary" 
                          className="search-button" 
                          onClick={toggleMarchePopup}
                          disabled={isMarcheDisabled}
                        >
                          <FaSearch />
                        </Button>
                    </InputGroup>
                      {showMarchePopup && (
                        <div className="popup">
                          <Form.Control
                            type="text"
                            placeholder="Rechercher..."
                            value={marcheFilterText}
                            onChange={(e) => setMarcheFilterText(e.target.value)}
                            className="mb-2"
                          />
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>NumReception</th>
                                <th>Marché</th>
                                <th>NumPrix</th>
                                <th>DescPrix</th>
                                <th>DateOpe</th>
                                <th>Fournisseur</th>
                                <th>CodeProd</th>
                                <th>Designation</th>
                                <th>Qte_Marche</th>
                                <th>Qte_Recept</th>
                                <th>Qte Rest</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredMarcheData.map((row, index) => (
                                <tr key={index} onClick={() => {
                                  setSelectedMarche(row.marche);
                                  setSelectedMarcheDetails(row);
                                  setGeneratedNumber(`SM-${Math.floor(Math.random() * 10000)}`);
                                  setShowMarchePopup(false);
                                  setShowDetailTable(true);
                                  setIsMarcheDisabled(true);
                                  setMarcheArticlesData(marcheArticlesData.filter(article => article.marche === row.marche));
                                }}>
                                  <td>{row.numReception}</td>
                                  <td>{row.marche}</td>
                                  <td>{row.numPrix}</td>
                                  <td>{row.descprix}</td>
                                  <td>{row.dateOpe}</td>
                                  <td>{row.fournisseur}</td>
                                  <td>{row.codeProd}</td>
                                  <td>{row.designation}</td>
                                  <td>{row.qteMarche}</td>
                                  <td>{row.qteRecept}</td>
                                  <td>{row.qteRest}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaStore className="me-2" />Description</Form.Label>
                      <Form.Control type="text" value={selectedMarcheDetails.descprix || ''} readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label><FaUser className="me-2" />Fournisseur</Form.Label>
                      <Form.Control type="text" value={selectedMarcheDetails.fournisseur || ''} readOnly />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Réf Externe 1</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={refExt1}
                        onChange={(e) => setRefExt1(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Réf Externe 2</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={refExt2}
                        onChange={(e) => setRefExt2(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Mémo</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                      />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Devise</Form.Label>
                      <Form.Select 
                        value={selectedDevise}
                        onChange={(e) => setSelectedDevise(e.target.value)}
                      >
                        <option value="MAD">MAD</option>
                        <option value="$">$</option>
                        <option value="€">€</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Cours Dev</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={courseDev}
                        onChange={(e) => setCourseDev(e.target.value)}
                        step="0.0000001"
                      />
                  </Form.Group>
                </Col>
              </Row>
              )}

              {showForm && (
              <Tabs defaultActiveKey="detail" className="mb-3">
                <Tab eventKey="detail" title="Détail">
                    <Row>
                      <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro de Prix</Form.Label>
                    <InputGroup>
                            <Form.Control type="text" value={selectedNumPrix} readOnly />
                            <Button variant="secondary" onClick={toggleNumPrixPopup}>
                              <FaSearch />
                            </Button>
                    </InputGroup>
                          {showNumPrixPopup && (
                            <div className="popup">
                              <Form.Control
                                type="text"
                                placeholder="Rechercher..."
                                value={numPrixFilterText}
                                onChange={(e) => setNumPrixFilterText(e.target.value)}
                                className="mb-2"
                              />
                              <Table striped bordered hover size="sm">
                                <thead>
                                  <tr>
                                    <th>Num Prix</th>
                                    <th>Objectif Prix</th>
                                    <th>Unité</th>
                                    <th>Qte Marché</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredNumPrixData.map((row, index) => (
                                    <tr key={index} onClick={() => {
                                      setSelectedNumPrix(row.num_prix);
                                      setSelectedNumPrixDetails(row);
                                      setShowNumPrixPopup(false);
                                    }}>
                                      <td>{row.num_prix}</td>
                                      <td>{row.objectif_prix}</td>
                                      <td>{row.unite}</td>
                                      <td>{row.qte_marche}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Objectif Prix</Form.Label>
                          <Form.Control type="text" value={selectedNumPrixDetails.objectif_prix || ''} readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Référence</Form.Label>
                    <InputGroup>
                            <Form.Control type="text" value={selectedReference} readOnly />
                            <Button variant="secondary" onClick={toggleReferencePopup}>
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
                                    <th>Désignation</th>
                                    <th>Famille</th>
                                    <th>Marque</th>
                                    <th>Ref</th>
                                    <th>Code Ext</th>
                                    <th>Serialisable</th>
                                    <th>Rayon</th>
                                    <th>Stock Min</th>
                                    <th>Stock Max</th>
                                    <th>Désignation Long</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredReferenceData.map((row, index) => (
                                    <tr key={index} onClick={() => {
                                      setSelectedReference(row.code);
                                      setSelectedReferenceDetails(row);
                                      setShowReferencePopup(false);
                                    }}>
                                      <td>{row.code}</td>
                                      <td>{row.designation}</td>
                                      <td>{row.famille}</td>
                                      <td>{row.marque}</td>
                                      <td>{row.ref}</td>
                                      <td>{row.codeExt}</td>
                                      <td>{row.serialisable}</td>
                                      <td>{row.rayon}</td>
                                      <td>{row.stock_min}</td>
                                      <td>{row.stock_max}</td>
                                      <td>{row.designation_long}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Désignation</Form.Label>
                          <Form.Control type="text" value={selectedReferenceDetails.designation || ''} readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Type Produit</Form.Label>
                          <Form.Control type="text" value={selectedReferenceDetails.famille || ''} readOnly />
                  </Form.Group>
                      </Col>
                      <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Marque</Form.Label>
                          <Form.Control type="text" value={selectedReferenceDetails.marque || ''} readOnly />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unité</Form.Label>
                          <Form.Select 
                            value={selectedUnite}
                            onChange={(e) => setSelectedUnite(e.target.value)}
                          >
                            <option value="U">U</option>
                            <option value="KG">KG</option>
                            <option value="ML">ML</option>
                            <option value="ENS">ENS</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantité</Form.Label>
                          <Form.Control
                            type="number"
                            value={quantite}
                            onChange={handleQuantityChange}
                            min="0"
                            step="1"
                          />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Prix</Form.Label>
                          <Form.Control
                            type="number"
                            value={prix}
                            onChange={handlePriceChange}
                            min="0"
                            step="0.01"
                          />
                  </Form.Group>
                        <Button variant="danger" className="delete-button mt-3" onClick={clearDetailForm}>
                          <FaTrash className="me-2" /> Supprimer
                        </Button>
                      </Col>
                    </Row>
                </Tab>
                <Tab eventKey="trace" title="Trace">
                    <p>Historique des modifications...</p>
                </Tab>
              </Tabs>
              )}

              {showDetailTable && (
                <Table striped bordered hover size="sm" className="mt-3">
                  <thead>
                    <tr>
                      <th>NumReception</th>
                      <th>Marché</th>
                      <th>NumPrix</th>
                      <th>DescPrix</th>
                      <th>DateOpe</th>
                      <th>Fournisseur</th>
                      <th>CodeProd</th>
                      <th>Designation</th>
                      <th>Qte_Marche</th>
                      <th>Qte_Recept</th>
                      <th>Qte Rest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailTableData.map((row, index) => (
                      <tr 
                        key={index}
                        onDoubleClick={() => {
                          setSelectedNumPrix(row.numPrix);
                          setSelectedNumPrixDetails({
                            num_prix: row.numPrix,
                            objectif_prix: row.descprix
                          });
                          setSelectedReference(row.codeProd);
                          setSelectedReferenceDetails({
                            code: row.codeProd,
                            designation: row.designation
                          });
                          setQuantite(row.qteMarche);
                          setPrix(row.prix);
                          setEditingIndex(index);
                        }}
                        className={editingIndex === index ? 'selected-row' : ''}
                      >
                        <td>{row.numReception}</td>
                        <td>{row.marche}</td>
                        <td>{row.numPrix}</td>
                        <td>{row.descprix}</td>
                        <td>{row.dateOpe}</td>
                        <td>{row.fournisseur}</td>
                        <td>{row.codeProd}</td>
                        <td>{row.designation}</td>
                        <td>{row.qteMarche}</td>
                        <td>{row.qteRecept}</td>
                        <td>{row.qteRest}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
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

          /* Styles pour la zone GED */
          .ged-container {
            padding: 0.75rem;
          }

          .ged-back-button {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .ged-title {
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
          }

          .ged-section {
            background: white;
            border-radius: 4px;
            padding: 0.75rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .ged-subtitle {
            margin-bottom: 0.5rem;
            color: #495057;
            font-size: 0.875rem;
          }

          .ged-table {
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }

          /* Styles pour le modal de signature */
          .signature-modal-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
          }

          .signature-title-input {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }

          .signature-canvas-container {
            border: 2px dashed #ced4da;
            border-radius: 4px;
            padding: 0.25rem;
            margin-bottom: 0.5rem;
          }

          .signature-canvas {
            width: 100%;
            height: 150px;
            background-color: white;
          }

          /* Styles pour les boutons de GED */
          .file-upload-container {
            display: flex;
            align-items: center;
            margin-right: 0.5rem;
          }

          .file-upload-input {
            display: inline-block;
            margin-left: 0.5rem;
            font-size: 0.875rem;
          }

          .scan-button {
            margin-left: 0.5rem;
            background: linear-gradient(45deg, #007bff, #0056b3);
            border: none;
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }

          .scan-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }

          .file-link {
            color: #007bff;
            text-decoration: none;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
          }

          .file-link:hover {
            text-decoration: underline;
          }

          .upload-button {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
            display: inline-flex;
            align-items: center;
            font-size: 0.875rem;
          }

          .upload-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default FormsElements;
