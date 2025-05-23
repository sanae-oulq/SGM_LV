import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const BootstrapTable = () => {
  const [tableData, setTableData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receptionData, setReceptionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Récupérer toutes les affectations d'abord
        const affectationsResponse = await axios.get('http://localhost:5003/api/affectations/all');
        const affectations = affectationsResponse.data;

        // 2. Récupérer tous les marchés
        const marchesResponse = await axios.get('http://localhost:5003/api/amarches');
        const marches = marchesResponse.data;

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
          if (passation && aff.etat === 'Affecté') {
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
          return {
            ...aff,
            service: aff.etat === 'Affecté' ? aff.service : '-',
            utilisateur: aff.etat === 'Affecté' ? aff.utilisateur : '-',
            codeChaine: aff.etat === 'Affecté' ? aff.codeChaine : '-',
            nomChaine: aff.etat === 'Affecté' ? aff.nomChaine : '-',
            dateAffectation: aff.etat === 'Affecté' ? aff.dateAffectation : '-',
            typeAffectation: aff.etat === 'Affecté' ? aff.typeAffectation : '-'
          };
        });

        // 3. Créer un Map des affectations pour un accès rapide
        const affectationsMap = new Map(
          updatedAffectations.map(aff => [aff.snReception, aff])
        );

        // 4. Extraire toutes les réceptions des marchés
        const allReceptions = marches.flatMap(marche =>
          marche.detailProjet.flatMap(projet =>
            projet.detailsPrix.flatMap(detail =>
              (detail.receptions || []).map(reception => {
                // Chercher l'affectation correspondante
                const affectation = affectationsMap.get(reception.sn);
                
                return {
                  marche: marche.marcheBC,
                  numeroPrix: projet.numeroPrix,
                  dateReception: reception.dateReception,
                  codeProduit: detail.reference,
                  designation: detail.designation,
                  qteLivree: reception.quantiteLivree,
                  sn: reception.sn,
                  codeBarre: reception.codeBarre,
                  finGarantie: reception.finGarantie,
                  // Si on trouve une affectation, on utilise son état, sinon "Non affecté"
                  etat: affectation ? affectation.etat : 'Non affecté',
                  // Ajouter les autres informations de l'affectation si elle existe
                  dateAffectation: affectation ? affectation.dateAffectation : null,
                  typeAffectation: affectation ? affectation.typeAffectation : null,
                  utilisateur: affectation ? affectation.utilisateur : null,
                  codeChaine: affectation ? affectation.codeChaine : null,
                  service: affectation ? affectation.service : null
                };
              })
            )
          )
        );

        setTableData(allReceptions);
        setFilteredData(allReceptions);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setFilteredData(tableData);
      return;
    }
    const filtered = tableData.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(keyword.toLowerCase())
      );
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
    }
  };

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Card>
            <Card.Header style={{ padding: '0.5rem 1rem', background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Etat des affectations</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau d'etat des  <code> affectations saisies</code>
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
                <div className="text-center p-3">
                  <span>Chargement des réceptions...</span>
                </div>
              ) : error ? (
                <div className="text-center p-3 text-danger">
                  {error}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Marché</th>
                        <th style={styles.tableHeader}>Numéro Prix</th>
                        <th style={styles.tableHeader}>Code Produit</th>
                        <th style={styles.tableHeader}>Désignation</th>
                        <th style={styles.tableHeader}>SN</th>
                        <th style={styles.tableHeader}>Code-barre</th>
                        <th style={styles.tableHeader}>Date affectation</th>
                        <th style={styles.tableHeader}>Type d'affectation</th>
                        <th style={styles.tableHeader}>Utilisateur</th>
                        <th style={styles.tableHeader}>Chaîne</th>
                        <th style={styles.tableHeader}>Service</th>
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
                          }}>{row.numeroPrix}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.codeProduit}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.designation}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.sn}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.codeBarre}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.dateAffectation ? new Date(row.dateAffectation).toLocaleDateString() : '-'}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.typeAffectation || '-'}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.utilisateur || '-'}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.codeChaine || ''}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.service || ''}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: row.etat === 'Affecté' ? 'green' : 'red',
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