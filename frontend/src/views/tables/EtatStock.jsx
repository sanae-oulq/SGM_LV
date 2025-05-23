import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Table, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch, FaFileExcel, FaPrint, FaClipboardList, FaBoxOpen, FaSync } from 'react-icons/fa';
import axios from 'axios';

const EtatStock = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDesc, setSelectedMarcheDesc] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedArticleDesc, setSelectedArticleDesc] = useState('');
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [showArticlePopup, setShowArticlePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [articleFilterText, setArticleFilterText] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marcheData, setMarcheData] = useState([]);
  const [selectedNumPrix, setSelectedNumPrix] = useState('');
  const [selectedNumPrixDetails, setSelectedNumPrixDetails] = useState(null);
  const [showNumPrixPopup, setShowNumPrixPopup] = useState(false);
  const [numPrixFilterText, setNumPrixFilterText] = useState('');
  const [numPrixData, setNumPrixData] = useState([]);
  const marchePopupRef = useRef(null);
  const numPrixPopupRef = useRef(null);

  // Fonction pour récupérer les marchés
  const fetchMarches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5003/api/amarches');
      console.log('Données reçues de l\'API:', response.data);
      setMarcheData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des marchés:', err);
      setError('Erreur lors du chargement des marchés');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarches();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (marchePopupRef.current && !marchePopupRef.current.contains(event.target)) {
        setShowMarchePopup(false);
      }
      if (numPrixPopupRef.current && !numPrixPopupRef.current.contains(event.target)) {
        setShowNumPrixPopup(false);
      }
      const tableElement = document.querySelector('.main-table');
      if (tableElement && !tableElement.contains(event.target)) {
        setSelectedRow(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMarchePopup = () => {
    setShowMarchePopup(!showMarchePopup);
  };

  const handleMarcheSelect = (row) => {
    console.log('Marché sélectionné:', row);
    setSelectedMarche(row.marcheBC);
    setSelectedMarcheDesc(row.intituleProjet);
    setSelectedMarcheDetails(row);
    setShowMarchePopup(false);

    // Réinitialiser les champs de l'article
    setSelectedNumPrix('');
    setSelectedNumPrixDetails(null);
    setSelectedArticleDesc('');
  };

  const filteredMarcheData = marcheData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
    )
  );

  const articleData = [
    { code: 'A001', designation: 'Article A', famille: 'Family A', marque: 'Brand A', ref: 'REF001', codeExt: 'EXT001', serialisable: 'Yes', rayon: 'R1', stock_min: 10, stock_max: 100, designation_long: 'Long Description A', photo: 'photo1.jpg' },
    { code: 'A002', designation: 'Article B', famille: 'Family B', marque: 'Brand B', ref: 'REF002', codeExt: 'EXT002', serialisable: 'No', rayon: 'R2', stock_min: 20, stock_max: 200, designation_long: 'Long Description B', photo: 'photo2.jpg' },
    { code: 'A003', designation: 'Article C', famille: 'Family C', marque: 'Brand C', ref: 'REF003', codeExt: 'EXT003', serialisable: 'Yes', rayon: 'R3', stock_min: 30, stock_max: 300, designation_long: 'Long Description C', photo: 'photo3.jpg' },
  ];

  const filteredArticleData = articleData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(articleFilterText.toLowerCase())
    )
  );

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const toggleArticlePopup = () => {
    setShowArticlePopup(!showArticlePopup);
  };

  const handleSearch = () => {
    let filtered = [...tableData];
    
    if (selectedMarche) {
      filtered = filtered.filter(item => item.marche === selectedMarche);
    }
    
    if (selectedNumPrix) {
      filtered = filtered.filter(item => item.numeroPrix === selectedNumPrix);
    }
    
    setFilteredTableData(filtered);
    setIsFiltered(true);
  };

  const handleExportExcel = () => {
    // Préparer les données
    const data = (isFiltered ? filteredTableData : tableData);
    
    // Définir les en-têtes
    const headers = [
      "Marché",
      "Numéro Prix",
      "Date Réception",
      "Code Produit",
      "Désignation",
      "Qte Prévu",
      "Qte Reçue",
      "Qte à Recevoir"
    ];

    // Formater les données
    const formatData = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) {
        return value.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      // Gérer les valeurs avec des points-virgules ou retours à la ligne
      if (typeof value === 'string' && (value.includes(';') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Ajouter le BOM pour Excel
    const BOM = '\uFEFF';
    
    // Convertir les données en format CSV
    const csvContent = BOM + [
      headers.join(';'),
      ...data.map(row => [
        formatData(row.marche),
        formatData(row.numeroPrix),
        formatData(new Date(row.dateReception)),
        formatData(row.codeProduit),
        formatData(row.designation),
        formatData(row.qtePrevue),
        formatData(row.qteRecue),
        formatData(row.qteARecevoir)
      ].join(';'))
    ].join('\r\n');

    // Créer le Blob avec l'encodage UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Générer le nom du fichier selon la logique demandée
    const date = new Date();
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    let fileName;
    if (selectedMarche && selectedNumPrix) {
      fileName = `etat_Stock_${selectedMarche}_${selectedNumPrix}_${formattedDate}.csv`;
    } else {
      fileName = `etat_Stock_Complet_${formattedDate}.csv`;
    }
    
    // Déclencher le téléchargement
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    // Réinitialiser tous les états
    setSelectedMarche('');
    setSelectedMarcheDesc('');
    setSelectedMarcheDetails(null);
    setSelectedNumPrix('');
    setSelectedNumPrixDetails(null);
    setSelectedArticleDesc('');
    setFilteredTableData([]);
    setIsFiltered(false);
    
    // Recharger les données
    fetchMarches();
    fetchData();
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5003/api/amarches');
      const marches = response.data;
      
      // Créer un Map pour agréger les quantités
      const receptionsMap = new Map();
      
      marches.forEach(marche => {
        marche.detailProjet.forEach(projet => {
          projet.detailsPrix.forEach(detail => {
            const key = `${marche.marcheBC}-${projet.numeroPrix}-${detail.reference}`;
            
            if (!receptionsMap.has(key)) {
              receptionsMap.set(key, {
                marche: marche.marcheBC,
                numeroPrix: projet.numeroPrix,
                codeProduit: detail.reference,
                designation: detail.designation,
                qtePrevue: projet.quantite || 0,
                qteRecue: 0,
                receptions: []
              });
            }
            
            // Ajouter toutes les réceptions pour ce produit
            if (detail.receptions && detail.receptions.length > 0) {
              const entry = receptionsMap.get(key);
              detail.receptions.forEach(reception => {
                entry.qteRecue += reception.quantiteLivree || 0;
                entry.receptions.push({
                  dateReception: reception.dateReception,
                  quantiteLivree: reception.quantiteLivree || 0
                });
              });
              entry.qteARecevoir = entry.qtePrevue - entry.qteRecue;
              receptionsMap.set(key, entry);
            }
          });
        });
      });

      // Convertir le Map en tableau
      const receptions = Array.from(receptionsMap.values()).flatMap(entry => 
        entry.receptions.map(reception => ({
          marche: entry.marche,
          numeroPrix: entry.numeroPrix,
          dateReception: reception.dateReception,
          codeProduit: entry.codeProduit,
          designation: entry.designation,
          qtePrevue: entry.qtePrevue,
          qteRecue: entry.qteRecue,
          qteARecevoir: entry.qteARecevoir
        }))
      );

      setTableData(receptions);
      setFilteredTableData(receptions);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNumPrixPopup = () => {
    setShowNumPrixPopup(!showNumPrixPopup);
    if (!showNumPrixPopup && selectedMarcheDetails) {
      // Extraire les numéros de prix du marché sélectionné
      const prixData = selectedMarcheDetails.detailProjet.map(projet => ({
        numeroPrix: projet.numeroPrix,
        unite: projet.unite || 'U',
        quantite: projet.quantite || 0,
        prixUnitaire: projet.prixUnitaire || 0,
        objetPrix: projet.objetPrix || '',
        numLot: projet.numLot || '',
        prixTotalHTVA: (projet.quantite || 0) * (projet.prixUnitaire || 0)
      }));
      setNumPrixData(prixData);
    }
  };

  const handleNumPrixSelect = (row) => {
    setSelectedNumPrix(row.numeroPrix);
    setSelectedNumPrixDetails(row);
    setSelectedArticleDesc(row.objetPrix || '');
    setShowNumPrixPopup(false);
  };

  const filteredNumPrixData = numPrixData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(numPrixFilterText.toLowerCase())
    )
  );

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Button 
                    variant="primary" 
                    className="me-2 action-button" 
                    style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)' }}
                    onClick={handleSearch}
                  >
                    <FaSearch className="me-2" /> Rechercher
                  </Button>
                  <Button 
                    variant="success" 
                    className="me-2 action-button" 
                    style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                    onClick={handleExportExcel}
                  >
                    <FaFileExcel className="me-2" /> Export Excel
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="me-2 action-button" 
                    style={{ background: 'linear-gradient(45deg, #6c757d, #495057)' }}
                    onClick={handleRefresh}
                  >
                    <FaSync className="me-2" /> Actualiser
                  </Button>
                </div>
                <div>
                  {/*<Button variant="info" className="action-button" style={{ background: 'linear-gradient(45deg, #17a2b8, #138496)' }}>
                    <FaPrint className="me-2" /> Imprimer
                  </Button>*/}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={12}>
                  {/* Marché section */}
                  <Row className="mb-4">
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
                          <div className="popup" ref={marchePopupRef}>
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
                              <Table striped bordered hover size="sm">
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
                            )}
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      <Form.Group>
                        <Form.Control type="text" value={selectedMarcheDesc} readOnly style={{ marginTop: '32px' }} />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Article section */}
                  <Row className="mb-4">
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaBoxOpen className="me-2" />Equipements</Form.Label>
                        <InputGroup>
                          <Form.Control type="text" value={selectedNumPrix} readOnly />
                          <Button variant="secondary" className="search-button" onClick={toggleNumPrixPopup}>
                            <FaSearch />
                          </Button>
                        </InputGroup>
                        {showNumPrixPopup && (
                          <div className="popup" ref={numPrixPopupRef}>
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
                                  <th>Numéro Prix</th>
                                  <th>Unité</th>
                                  <th>Quantité</th>
                                  <th>Prix Unitaire</th>
                                  <th>Objet Prix</th>
                                  <th>N° Lot</th>
                                  <th>Prix Total HTVA</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredNumPrixData.map((row, index) => (
                                  <tr key={index} onClick={() => handleNumPrixSelect(row)}>
                                    <td>{row.numeroPrix}</td>
                                    <td>{row.unite}</td>
                                    <td>{row.quantite}</td>
                                    <td>{row.prixUnitaire}</td>
                                    <td>{row.objetPrix}</td>
                                    <td>{row.numLot}</td>
                                    <td>{row.prixTotalHTVA}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      <Form.Group>
                        <Form.Control type="text" value={selectedArticleDesc} readOnly style={{ marginTop: '32px' }} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <div style={{ overflowX: 'auto' }}>
                <Table hover responsive className="main-table">
                  <thead>
                    <tr>
                      <th>Marché</th>
                      <th>Numéro Prix</th>
                      <th>Date Réception</th>
                      <th>Code Produit</th>
                      <th>Désignation</th>
                      <th>Qte Prévu</th>
                      <th>Qte Reçue</th>
                      <th>Qte à Recevoir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isFiltered ? filteredTableData : tableData).map((row, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedRow(index)}
                        style={{
                          ...(selectedRow === index ? {
                            backgroundColor: '#0d6efd',
                            color: '#ff69b4'
                          } : {})
                        }}
                      >
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marche}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.numeroPrix}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{new Date(row.dateReception).toLocaleDateString()}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.codeProduit}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.designation}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qtePrevue}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qteRecue}</td>
                        <td style={{
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qteARecevoir}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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

          .popup {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 0.5rem;
            margin-top: 2px;
            max-height: 250px;
            width: 80%;
            overflow-y: auto;
          }

          .popup table {
            font-size: 0.75rem;
          }

          .popup table th,
          .popup table td {
            padding: 0.25rem !important;
            white-space: nowrap;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .form-label {
            color: #495057;
            font-weight: 500;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
          }

          .form-control {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            min-height: 32px;
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
            font-weight: 600;
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

          .popup::-webkit-scrollbar {
            width: 6px;
          }

          .popup::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .popup::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
          }

          .popup::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default EtatStock;
