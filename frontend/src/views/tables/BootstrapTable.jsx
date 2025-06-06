import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

     const filteredFournisseurData = [
       { codeFrs: 'F/00001', NomFrs: 'LTS NETWORK' },
       { codeFrs: 'F/00002', NomFrs: 'NINSIGHT' },
       { codeFrs: 'F/00003', NomFrs: 'STUDIOTECH' },
       { codeFrs: 'F/00004', NomFrs: 'STUDIOTECH MAROC' },
       { codeFrs: 'F/00005', NomFrs: 'TRAFFITEC' },
       { codeFrs: 'F/00006', NomFrs: 'ATEME' },
       { codeFrs: 'F/00007', NomFrs: 'TRADEC' },
       { codeFrs: 'F/00008', NomFrs: 'EVS BROADCAST EQUIPEMENT' },
       { codeFrs: 'F/00009', NomFrs: 'WORKPLUS' },
       { codeFrs: 'F/00010', NomFrs: 'ABCHIR SARL' },
       { codeFrs: 'F/00011', NomFrs: 'AEQ' },
       { codeFrs: 'F/00012', NomFrs: 'PRO ALPHA ET PRO ALPHA EUROPE' },
       { codeFrs: 'F/00013', NomFrs: 'SAVE DIFFUSION' },
       { codeFrs: 'F/00014', NomFrs: 'SIDATE BRAHIM TECHNO' },
       { codeFrs: 'F/00015', NomFrs: 'FUTURE LINK' }
     ];
{/** 
          const getFournisseurName = (code) => {
       const found = filteredFournisseurData.find(item => item.codeFrs === code);
       return found ? found.NomFrs : code;
     };
     */}

      const getFournisseurName = (code) => {
       if (!code) return '';
       // Nettoyer le code pour la comparaison
       const cleanCode = code.trim().toUpperCase();
       const found = filteredFournisseurData.find(item => 
         item.codeFrs.trim().toUpperCase() === cleanCode
       );
       return found ? found.NomFrs : code;
     };

const BootstrapTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableData, setTableData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [detailPrix, setDetailPrix] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Vérifier si nous revenons d'une modification
    if (location.state?.updatedMarche) {
      const updatedMarche = location.state.updatedMarche;
      const oldMarcheBC = location.state.oldMarcheBC;
      
      // Mettre à jour le tableau
      updateTableAfterEdit(oldMarcheBC, updatedMarche);
      
      // Réinitialiser l'état de navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Charger les détails du marché sélectionné
  useEffect(() => {
    if (selectedRow !== null) {
      const selectedMarche = filteredData[selectedRow];
      if (selectedMarche) {
        fetchMarcheDetails(selectedMarche.marche);
      }
    } else {
      // Réinitialiser les détails si aucune ligne n'est sélectionnée
      setSelectedMarcheDetails(null);
      setDetailPrix([]);
    }
  }, [selectedRow, filteredData]);

  // Fonction pour récupérer les détails d'un marché spécifique
  const fetchMarcheDetails = async (marcheBC) => {
    if (!marcheBC) {
      console.log('Aucun identifiant de marché fourni');
      setDetailPrix([]);
      return;
    }
    
    try {
      console.log(`Tentative de récupération des détails du marché: ${marcheBC}`);
      const response = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
      
      if (response.status === 404) {
        console.log(`Le marché avec l'identifiant ${marcheBC} n'existe pas`);
        setSelectedMarcheDetails(null);
        setDetailPrix([]);
        return;
      }
      
      if (!response.ok) {
        console.log(`Erreur ${response.status} lors de la récupération des détails du marché`);
        setSelectedMarcheDetails(null);
        setDetailPrix([]);
        return;
      }
      
      const data = await response.json();
      console.log('Détails du marché reçus:', data);
      
      setSelectedMarcheDetails(data);
      
      // Si le marché a des détails de prix, les récupérer
      if (data && data.detailProjet && Array.isArray(data.detailProjet)) {
        setDetailPrix(data.detailProjet);
      } else {
        console.log('Aucun détail de projet trouvé dans les données récupérées');
        setDetailPrix([]);
      }
    } catch (error) {
      console.log('Erreur lors de la récupération des détails du marché:', error.message);
      setSelectedMarcheDetails(null);
      setDetailPrix([]);
    }
  };

  const updateTableAfterEdit = (oldMarcheBC, updatedMarche) => {
    // Mettre à jour tableData
    const newTableData = tableData.map(item => {
      if (item.marche === oldMarcheBC) {
        return {
          marche: updatedMarche.marcheBC,
          anMarche: updatedMarche.anneeMarche,
          famille: updatedMarche.familleProjet,
          dateProj: updatedMarche.date,
          descriptionProj: updatedMarche.intituleProjet,
          refext1: updatedMarche.numAO,
          jde: updatedMarche.jde,
          fournisseur: getFournisseurName(updatedMarche.fournisseur),
          //fournisseur: updatedMarche.fournisseur,
          delai: updatedMarche.delaiExecution,
          memoproj: updatedMarche.descriptionProjet,
          typeMarche: updatedMarche.typeMarche,
          garantie: updatedMarche.garantie,
          demandeur: updatedMarche.demandeur,
          ficheProjet: updatedMarche.ficheProjet,
          familleProjetCode: updatedMarche.familleProjet,
          fournisseurCode: updatedMarche.fournisseur,
          demandeurAffectation: updatedMarche.demandeur,
          ficheProjetId: updatedMarche.ficheProjet,
          marcheBCType: updatedMarche.marcheBCType
        };
      }
      return item;
    });

    setTableData(newTableData);
    setFilteredData(newTableData);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/amarches');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      console.log('Données reçues de l\'API:', data);

      const mappedData = data.map(item => ({
        marche: item.marcheBC || '',
        anMarche: item.anneeMarche || '',
        famille: item.familleProjet || '',
        dateProj: item.date || '',
        descriptionProj: item.intituleProjet || '',
        refext1: item.numAO || '',
        jde: item.jde || '',
        fournisseur: getFournisseurName(item.fournisseur) || '',
        //fournisseur: item.fournisseur || '',
        delai: item.delaiExecution || '',
        memoproj: item.descriptionProjet || '',
        typeMarche: item.typeMarche || '',
        garantie: item.garantie || '',
        demandeur: item.demandeur || '',
        ficheProjet: item.ficheProjet || '',
        familleProjetCode: item.familleProjet || '',
        fournisseurCode: item.fournisseur || '',
        demandeurAffectation: item.demandeur || '',
        ficheProjetId: item.ficheProjet || '',
        marcheBCType: item.marcheBCType || 'marche'
      }));

      console.log('Données mappées:', mappedData);
      setTableData(mappedData);
      setFilteredData(mappedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setFilteredData(tableData);
      return;
    }
    const filtered = tableData.filter(item => {
      return Object.values(item).some(value =>
        value.toString().toLowerCase().includes(keyword.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  const handleSearchApply = () => {
    if (searchKeyword.trim() === '') {
      setFilteredData(tableData);
      return;
    }
    const filtered = tableData.filter(item => {
      return Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  const handleAddMarche = () => {
    navigate('/forms/form-basic1');
  };

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  const handleRowDoubleClick = async (index) => {
    const selectedData = filteredData[index];
    console.log('Données sélectionnées:', selectedData);

    try {
      // Récupérer les détails complets du marché avant la navigation
      const response = await fetch(`http://localhost:5003/api/amarches/${selectedData.marche}`);
      //const response = await fetch(`http://localhost:5003/api/amarches/${encodeURIComponent(selectedData.marche)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails du marché');
      }
      const marcheDetails = await response.json();
      
      const formData = {
        marche: selectedData.marche,
        dateProj: selectedData.dateProj,
        typeMarche: selectedData.typeMarche,
        marcheBCType: selectedData.marcheBCType || 'marche',
        //familleProjet: selectedData.familleProjetCode,
        descriptionProj: selectedData.descriptionProj,
        memoproj: selectedData.memoproj,
        garantie: selectedData.garantie,
        delai: selectedData.delai,
        refext1: selectedData.refext1,
        jde: selectedData.jde,
        anMarche: selectedData.anMarche,
        selectedFicheProjetId: selectedData.ficheProjetId,
        selectedFicheProjetTitle: selectedData.ficheProjet,
       // ficheProjet: selectedData.ficheProjetId,
        selectedFamilleProjetCode: selectedData.familleProjetCode,
        selectedFamilleProjetDesignation: selectedData.famille,
        //familleProjet: selectedData.familleProjetCode,
        selectedFournisseurCode: selectedData.fournisseurCode,
        selectedFournisseurNom: selectedData.fournisseur,
       // fournisseur: selectedData.fournisseurCode,
        selectedDemandeurAffectation: selectedData.demandeurAffectation,
        demandeur: selectedData.demandeurAffectation,
        intituleProjet: selectedData.descriptionProj,
        detailProjet: marcheDetails.detailProjet || [] // Ajouter les détails du projet
      };

      console.log('Données envoyées au formulaire:', formData);

      navigate('/forms/form-basic1', { 
        state: { 
          marche: formData,
          isEdit: true,
          oldMarcheBC: selectedData.marche,
          savedMarcheDetails: marcheDetails // Transmettre les détails complets du marché
        } 
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      // Gérer l'erreur si nécessaire
    }
  };

  const styles = {
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      padding: '0.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #e9ecef'
    },
    searchInput: {
      flex: 1,
      marginRight: '0.5rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      padding: '0.25rem 0.5rem',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      height: '32px'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      color: '#495057',
      fontWeight: '600',
      padding: '0.5rem',
      borderBottom: '1px solid #dee2e6',
      textAlign: 'left',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap'
    },
    tableRow: {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    tableCell: {
      padding: '0.5rem',
      fontSize: '0.875rem',
      borderBottom: '1px solid #dee2e6'
    },
    detailSection: {
      marginTop: '1rem',
      padding: '0.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #e9ecef'
    },
    detailTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#495057',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    detailTable: {
      fontSize: '0.875rem',
      width: '100%'
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header style={{ padding: '0.5rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Liste des marchés</Card.Title>
                  <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Tableau <code>marchés</code>
                  </span>
                </div>
                <Button 
                  variant="primary"
                  onClick={handleAddMarche}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    background: 'linear-gradient(45deg, #007bff, #0056b3)',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FaPlus /> Ajouter marché
                </Button>
              </div>
            </Card.Header>
            <Card.Body style={{ padding: '0.75rem' }}>
              <div style={styles.searchContainer}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  style={styles.searchInput}
                />
                <FaSearch onClick={handleSearchApply} style={{ color: '#6c757d', cursor: 'pointer' }} />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Marché</th>
                      <th style={styles.tableHeader}>Année Marché</th>
                      <th style={styles.tableHeader}>Famille Projet</th>
                      <th style={styles.tableHeader}>Date Projet</th>
                      <th style={styles.tableHeader}>Description</th>
                      <th style={styles.tableHeader}>Num AO</th>
                      <th style={styles.tableHeader}>JDE</th>
                      <th style={styles.tableHeader}>Fournisseur</th>
                      <th style={styles.tableHeader}>Délai</th>
                      <th style={styles.tableHeader}>Mémo</th>
                      <th style={styles.tableHeader}>Type Marché</th>
                      <th style={styles.tableHeader}>Code Famille Projet</th>
                      <th style={styles.tableHeader}>Code Fournisseur</th>
                      <th style={styles.tableHeader}>Demandeur</th>
                      <th style={styles.tableHeader}>Fiche Projet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr 
                        key={index}
                        onClick={() => handleRowClick(index)}
                        onDoubleClick={() => handleRowDoubleClick(index)}
                        style={{
                          ...styles.tableRow,
                          ...(selectedRow === index ? {
                            backgroundColor: '#0d6efd',
                            color: '#ff69b4'
                          } : {})
                        }}
                      >
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.anMarche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.famille}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.dateProj}</td>
                        {/** 
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.descriptionProj}</td>
                        */}

                             <td style={{ ...styles.tableCell, color: selectedRow === index ? '#ff69b4' : 'inherit' }} title={row.descriptionProj}>
       {row.descriptionProj ? (row.descriptionProj.length > 30 ? row.descriptionProj.substring(0, 30) + '...' : row.descriptionProj) : ''}
     </td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.refext1}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.jde}</td>
                         
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.fournisseur}</td>
                        
                        {/**
                             <td style={{ ...styles.tableCell, color: selectedRow === index ? '#ff69b4' : 'inherit' }}>{getFournisseurName(row.fournisseurCode)}</td>
                             */}
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.delai}</td>
                         {/*}
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.memoproj}</td>
                        */}
                             <td style={{ ...styles.tableCell, color: selectedRow === index ? '#ff69b4' : 'inherit' }} title={row.memoproj}>
       {row.memoproj ? (row.memoproj.length > 30 ? row.memoproj.substring(0, 30) + '...' : row.memoproj) : ''}
     </td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.typeMarche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.familleProjetCode}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.fournisseurCode}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.demandeurAffectation}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.ficheProjetId}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Nouvelle section pour afficher les détails de prix du marché sélectionné */}
              {selectedRow !== null && selectedMarcheDetails && (
                <div style={styles.detailSection}>
                  <div style={styles.detailTitle}>
                    <span>Détails Prix du Marché: {filteredData[selectedRow]?.marche}</span>
                  </div>
                  
                  {detailPrix.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <Table hover responsive style={styles.detailTable}>
                        <thead>
                          <tr>
                            <th style={styles.tableHeader}>Numéro Prix</th>
                            <th style={styles.tableHeader}>Objet Prix</th>
                            <th style={styles.tableHeader}>Unité</th>
                            <th style={styles.tableHeader}>Quantité</th>
                            <th style={styles.tableHeader}>Prix Unitaire</th>
                            <th style={styles.tableHeader}>Prix Total HTVA</th>
                            <th style={styles.tableHeader}>N° Lot</th>
                            <th style={styles.tableHeader}>Demandeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailPrix.map((detail, index) => (
                            <tr key={index} style={styles.tableRow}>
                              <td style={styles.tableCell}>{detail.numeroPrix}</td>
                              <td style={styles.tableCell}>{detail.objetPrix}</td>
                              <td style={styles.tableCell}>{detail.unite}</td>
                              <td style={styles.tableCell}>{detail.quantite}</td>
                              <td style={styles.tableCell}>{detail.prixUnitaire}</td>
                              <td style={styles.tableCell}>{detail.prixTotalHTVA}</td>
                              <td style={styles.tableCell}>{detail.numLot}</td>
                              <td style={styles.tableCell}>{detail.demandeur}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p>Aucun détail de prix disponible pour ce marché.</p>
                  )}
                </div>
              )}
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

          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
          }

          .table {
            font-size: 0.875rem;
          }

          .table thead th {
            background: #f8f9fa;
            color: #495057;
            font-weight: 600;
            padding: 0.5rem;
            border-bottom: 1px solid #dee2e6;
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

          .form-control {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            min-height: 32px;
          }

          .selected-row {
            background-color: #0d6efd;
            color: #ff69b4;
          }
          .selected-row td {
            color: #ff69b4;
          }

          .detail-section {
            margin-top: 1rem;
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 0.75rem;
            border: 1px solid #e9ecef;
          }

          .detail-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #495057;
          }

          .detail-table {
            font-size: 0.875rem;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default BootstrapTable;
