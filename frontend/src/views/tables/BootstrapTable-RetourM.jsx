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
        const response = await axios.get('http://localhost:5003/api/retours/all');
        console.log('Données reçues de l\'API:', response.data);
        
        // Trier les retours par date décroissante et _id
        const sortedRetours = response.data.sort((a, b) => {
          const dateA = new Date(a.dateRetour).getTime();
          const dateB = new Date(b.dateRetour).getTime();
          if (dateA !== dateB) {
            return dateB - dateA;
          }
          // Si les dates sont identiques, utiliser l'_id MongoDB comme critère secondaire
          return b._id.localeCompare(a._id);
        });

        // Créer un Map pour stocker le dernier retour pour chaque SN
        const latestRetoursBySN = new Map();
        sortedRetours.forEach(retour => {
          if (!latestRetoursBySN.has(retour.snReception)) {
            latestRetoursBySN.set(retour.snReception, retour);
          }
        });

        // Convertir le Map en tableau
        const latestRetours = Array.from(latestRetoursBySN.values());
        
        const formattedRetours = latestRetours.map(retour => {
          console.log('Traitement du retour:', retour);
          return {
            marche: retour.marcheBC,
            numeroPrix: retour.numPrix,
            codeProduit: retour.codeProduit,
            designation: retour.designation,
            sn: retour.snReception,
            codeBarre: retour.codeBarre,
            date_D: retour.dateRetour ? new Date(retour.dateRetour).toLocaleDateString() : '-',
            service: retour.service,
            utilisateur: retour.utilisateur,
            responsable: retour.responsable || '-',
            memo: retour.memo || '-',
            etat: retour.etat,
            retourId: retour.retourId
          };
        });
        
        console.log('Données formatées:', formattedRetours);
        setRetours(formattedRetours);
        setFilteredData(formattedRetours);
        setError(null);
      } catch (err) {
        console.error('Erreur détaillée lors de la récupération des retours:', err.response?.data || err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetours();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    if (keyword.trim() === '') {
      setFilteredData(retours);
      return;
    }

    const filtered = retours.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(keyword);
      });
    });

    setFilteredData(filtered);
  };

  const handleRowClick = (index) => {
    setSelectedRow(index === selectedRow ? null : index);
  };

  const handleRowDoubleClick = (row) => {
    const baseUrl = '/SGM';
    const url = `${baseUrl}/forms/form-basic-retourM?retourId=${encodeURIComponent(row.retourId)}`;
    window.location.href = url;
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
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Liste des retours</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau des <code>materiels retournés</code>
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
              ) : filteredData.length === 0 ? (
                <div style={styles.loadingMessage}>
                  Aucun retour trouvé
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
                        <th style={styles.tableHeader}>Date retour</th>
                        <th style={styles.tableHeader}>Service</th>
                        <th style={styles.tableHeader}>Utilisateur</th>
                        <th style={styles.tableHeader}>Responsable</th>
                        <th style={styles.tableHeader}>Mémo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => {
                        console.log('Rendu de la ligne:', row);
                        return (
                          <tr 
                            key={index}
                            onClick={() => handleRowClick(index)}
                            onDoubleClick={() => handleRowDoubleClick(row)}
                            style={{
                              ...styles.tableRow,
                              ...(selectedRow === index ? {
                                backgroundColor: '#e9ecef',
                                color: '#495057'
                              } : {})
                            }}
                          >
                            <td style={styles.tableCell}>{row.marche || '-'}</td>
                            <td style={styles.tableCell}>{row.numeroPrix || '-'}</td>
                            <td style={styles.tableCell}>{row.codeProduit || '-'}</td>
                            <td style={styles.tableCell}>{row.designation || '-'}</td>
                            <td style={styles.tableCell}>{row.sn || '-'}</td>
                            <td style={styles.tableCell}>{row.codeBarre || '-'}</td>
                            <td style={styles.tableCell}>{row.date_D || '-'}</td>
                            <td style={styles.tableCell}>{row.service || '-'}</td>
                            <td style={styles.tableCell}>{row.utilisateur || '-'}</td>
                            <td style={styles.tableCell}>{row.responsable || '-'}</td>
                            <td style={styles.tableCell}>{row.memo || '-'}</td>
                          </tr>
                        );
                      })}
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
