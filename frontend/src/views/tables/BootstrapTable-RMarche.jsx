import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const BootstrapTable = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [receptionData, setReceptionData] = useState([]);

  // Fonction pour récupérer les données de réception
  const fetchReceptionData = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/amarches');
      const marches = response.data;
      
      // Transformer les données pour extraire les réceptions
      const receptions = marches.flatMap(marche => 
        marche.detailProjet.flatMap(projet => 
          projet.detailsPrix.flatMap(detail => 
            (detail.receptions || []).map(reception => ({
              marche: marche.marcheBC,
              numeroPrix: projet.numeroPrix,
              dateReception: reception.dateReception,
              codeProduit: detail.reference,
              designation: detail.designation,
              qteLivree: reception.quantiteLivree,
              sn: reception.sn,
              finGarantie: reception.finGarantie,
              receptionId: reception.receptionId
            }))
          )
        )
      );

      console.log('Réceptions extraites:', receptions);
      setReceptionData(receptions);
      setFilteredData(receptions);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    }
  };

  useEffect(() => {
    fetchReceptionData();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setFilteredData(receptionData);
      return;
    }
    const filtered = receptionData.filter(item => {
      return Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(keyword.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };

  const handleRowDoubleClick = (row) => {
    // Construire l'URL avec le bon chemin de base et inclure le receptionId
    const baseUrl = '/SGM';
    const url = `${baseUrl}/forms/form-basic-raceptionMarche?marcheBC=${encodeURIComponent(row.marche)}&receptionId=${encodeURIComponent(row.receptionId)}`;
    window.location.href = url;
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
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Liste Reception des marchés</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau <code>reception des marchés</code>
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

              <div style={{ overflowX: 'auto' }}>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Marché</th>
                      <th style={styles.tableHeader}>Numéro Prix</th>
                      <th style={styles.tableHeader}>Date Réception</th>
                      <th style={styles.tableHeader}>Code Produit</th>
                      <th style={styles.tableHeader}>Désignation</th>
                      <th style={styles.tableHeader}>Qte livrée</th>
                      <th style={styles.tableHeader}>SN</th>
                      <th style={styles.tableHeader}>Fin Garantie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr 
                        key={index}
                        onClick={() => handleRowClick(index)}
                        onDoubleClick={() => handleRowDoubleClick(row)}
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
                        }}>{row.dateReception}</td>
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
                        }}>{row.qteLivree}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.sn}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.finGarantie}</td>
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