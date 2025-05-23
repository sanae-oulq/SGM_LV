import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const BootstrapTable = () => {
  const [retours, setRetours] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRetours = async () => {
      try {
        setIsLoading(true);
        // Récupérer toutes les affectations
        const affectationsResponse = await axios.get('http://localhost:5003/api/affectations/all');
        const affectations = affectationsResponse.data;

        // Récupérer tous les retours
        const retoursResponse = await axios.get('http://localhost:5003/api/retours/all');
        const retours = retoursResponse.data;

        // Récupérer toutes les passations
        const passationsResponse = await axios.get('http://localhost:5003/api/passations/all');
        const passations = passationsResponse.data;
        
        // Créer un Map des passations par affectationId
        const passationsMap = new Map();
        passations.forEach(passation => {
          if (passation.affectationId) {
            passationsMap.set(passation.affectationId, passation);
          }
        });

        // Mettre à jour les affectations avec les données des passations
        const updatedAffectations = affectations.map(aff => {
          const passation = passationsMap.get(aff.affectationId);
          if (passation) {
            return {
              ...aff,
              service: passation.newService,
              utilisateur: passation.newUser,
              codeChaine: passation.codeChaine,
              nomChaine: passation.nomChaine,
              dateAffectation: passation.datePassation,
              typeAffectation: passation.typeAffectation,
              lieu: passation.lieu,
              evenement: passation.evenement,
              qualite: passation.qualite,
              memo: passation.memo,
            };
          }
          return aff;
        });

        // Trier les affectations par date décroissante et _id
        const sortedAffectations = updatedAffectations.sort((a, b) => {
          const dateA = new Date(a.dateAffectation).getTime();
          const dateB = new Date(b.dateAffectation).getTime();
          if (dateA !== dateB) {
            return dateB - dateA;
          }
          // Si les dates sont identiques, utiliser l'_id MongoDB comme critère secondaire
          return b._id.localeCompare(a._id);
        });

        // Créer un Map pour stocker la dernière affectation pour chaque SN
        const latestAffectationsMap = new Map();
        sortedAffectations.forEach(aff => {
          if (!latestAffectationsMap.has(aff.snReception)) {
            latestAffectationsMap.set(aff.snReception, aff);
          }
        });

        // Convertir le Map en tableau
        const latestAffectations = Array.from(latestAffectationsMap.values());

        // Créer un Map des retours indexé par affectationId
        const retoursMap = new Map();
        retours.forEach(retour => {
          if (retour.affectationId && retour.affectationId.trim()) {
            retoursMap.set(retour.affectationId.trim(), retour);
          }
        });

        // Formater les données avec les affectations mises à jour
        const formattedData = latestAffectations.map(affectationActuelle => {
          const currentAffectationId = affectationActuelle.affectationId ? affectationActuelle.affectationId.trim() : '';
          
          // 1. Vérifier si l'affectationId existe dans la table retours
          const retourCorrespondant = retoursMap.get(currentAffectationId);
          
          // Si pas trouvé dans la table retours → Non rendu
          if (!retourCorrespondant) {
            return {
              sn: affectationActuelle.snReception || '-',
              service: affectationActuelle.service || '-',
              commentaire: '-',
              responsable: '-',
              utilisateur: affectationActuelle.utilisateur || '-',
              refProduit: affectationActuelle.codeProduit || '-',
              designation: affectationActuelle.designation || '-',
              date_D: '-',
              dateAffectation: new Date(affectationActuelle.dateAffectation).toLocaleString(),
              etat: 'Non rendu',
              affectationId: currentAffectationId
            };
          }
          
          // 2. Si trouvé, vérifier le SN
          const currentSN = affectationActuelle.snReception ? affectationActuelle.snReception.trim() : '';
          const retourSN = retourCorrespondant.snReception ? retourCorrespondant.snReception.trim() : '';
          
          // Si SN différent → Non rendu
          if (currentSN !== retourSN) {
            return {
              sn: affectationActuelle.snReception || '-',
              service: affectationActuelle.service || '-',
              commentaire: '-',
              responsable: '-',
              utilisateur: affectationActuelle.utilisateur || '-',
              refProduit: affectationActuelle.codeProduit || '-',
              designation: affectationActuelle.designation || '-',
              date_D: '-',
              dateAffectation: new Date(affectationActuelle.dateAffectation).toLocaleString(),
              etat: 'Non rendu',
              affectationId: currentAffectationId
            };
          }

          // 3. Si on arrive ici, c'est que :
          // - affectationId a été trouvé dans la table retours ET
          // - SN correspond
          // → donc c'est Rendu
          return {
            sn: affectationActuelle.snReception || '-',
            service: affectationActuelle.service || '-',
            commentaire: retourCorrespondant.memo || '-',
            responsable: retourCorrespondant.responsable || '-',
            utilisateur: affectationActuelle.utilisateur || '-',
            refProduit: affectationActuelle.codeProduit || '-',
            designation: affectationActuelle.designation || '-',
            date_D: new Date(retourCorrespondant.dateRetour).toLocaleDateString(),
            dateAffectation: new Date(affectationActuelle.dateAffectation).toLocaleString(),
            etat: 'Rendu',
            affectationId: currentAffectationId
          };
        });

        // Trier les données : Non rendu en premier, puis par date d'affectation décroissante
        formattedData.sort((a, b) => {
          if (a.etat !== b.etat) {
            return a.etat === 'Non rendu' ? -1 : 1;
          }
          return new Date(b.dateAffectation).getTime() - new Date(a.dateAffectation).getTime();
        });

        setRetours(formattedData);
        setFilteredData(formattedData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetours();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(e.target.value);
    
    if (keyword.trim() === '') {
      setFilteredData(retours);
      return;
    }

    const filtered = retours.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(keyword);
      });
    });
    
    setFilteredData(filtered);
  };

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
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
    loadingMessage: {
      textAlign: 'center',
      padding: '2rem',
      color: '#6c757d'
    },
    errorMessage: {
      textAlign: 'center',
      padding: '2rem',
      color: '#dc3545'
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
          <Card.Header style={{ padding: '0.5rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Historique</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau d'etat des<code> materiels</code>
              </span>
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
                <FaSearch style={{ color: '#6c757d' }} />
              </div>

              {isLoading ? (
                <div style={styles.loadingMessage}>
                  Chargement des données...
                </div>
              ) : error ? (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>SN</th>
                        <th style={styles.tableHeader}>Service</th>
                        <th style={styles.tableHeader}>Commentaire</th>
                        <th style={styles.tableHeader}>Responsable</th>
                        <th style={styles.tableHeader}>Utilisateur</th>
                        <th style={styles.tableHeader}>Refproduit</th>
                        <th style={styles.tableHeader}>Designation</th>
                        <th style={styles.tableHeader}>Date Retour</th>
                        <th style={styles.tableHeader}>Date Affectation</th>
                        <th style={styles.tableHeader}>État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <tr 
                          key={index}
                          onClick={() => handleRowClick(index)}
                          style={{
                            ...styles.tableRow,
                            ...(selectedRow === index ? {
                              backgroundColor: '#e9ecef',
                              color: '#495057'
                            } : {})
                          }}
                        >
                          <td style={styles.tableCell}>{row.sn}</td>
                          <td style={styles.tableCell}>{row.service}</td>
                          <td style={styles.tableCell}>{row.commentaire}</td>
                          <td style={styles.tableCell}>{row.responsable}</td>
                          <td style={styles.tableCell}>{row.utilisateur}</td>
                          <td style={styles.tableCell}>{row.refProduit}</td>
                          <td style={styles.tableCell}>{row.designation}</td>
                          <td style={styles.tableCell}>{row.date_D}</td>
                          <td style={styles.tableCell}>{row.dateAffectation}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: row.etat === 'Rendu' ? 'green' : 'red',
                            fontWeight: 'bold'
                          }}>{row.etat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
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
        `}
      </style>
    </React.Fragment>
  );
};

export default BootstrapTable;
