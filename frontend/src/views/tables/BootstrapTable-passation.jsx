import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import { FaSearch, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';

const BootstrapTable = () => {
  const [tableData, setTableData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPassations = async () => {
      try {
        setIsLoading(true);
        // Récupérer toutes les passations
        const passationsResponse = await axios.get('http://localhost:5003/api/passations/all');
        const passations = passationsResponse.data;

        // Créer un Map pour stocker la dernière passation pour chaque SN
        const latestPassationsMap = new Map();

        // Trier les passations par date décroissante et _id
        const sortedPassations = passations.sort((a, b) => {
          const dateA = new Date(a.datePassation).getTime();
          const dateB = new Date(b.datePassation).getTime();
          if (dateA !== dateB) {
            return dateB - dateA;
          }
          // Si les dates sont identiques, utiliser l'_id MongoDB comme critère secondaire
          return b._id.localeCompare(a._id);
        });

        // Pour chaque SN, ne garder que la dernière passation
        sortedPassations.forEach(passation => {
          if (!latestPassationsMap.has(passation.snReception)) {
            latestPassationsMap.set(passation.snReception, passation);
          }
        });

        // Convertir le Map en tableau
        const latestPassations = Array.from(latestPassationsMap.values());

        setTableData(latestPassations);
        setFilteredData(latestPassations);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des passations:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassations();
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

  const handleRowDoubleClick = (row) => {
    const baseUrl = '/SGM';
    const url = `${baseUrl}/forms/form-basic-passation?passationId=${encodeURIComponent(row.passationId)}&showAll=true`;
    window.location.href = url;
  };

  const handleExportExcel = () => {
    // Préparer les données
    const data = filteredData;
    
    // Définir les en-têtes
    const headers = [
      "Passation ID",
      "Date Passation",
      "Type Affectation",
      "Marché",
      "Numéro Prix",
      "SN",
      "Code-barre",
      "Code Produit",
      "Désignation",
      "Ancienne Chaîne",
      "Nouvelle Chaîne",
      "Ancien Service",
      "Nouveau Service",
      "Ancien Utilisateur",
      "Nouvel Utilisateur",
      "Lieu",
      "Événement",
      "Qualité"
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
        formatData(row.passationId),
        formatData(new Date(row.datePassation)),
        formatData(row.typeAffectation),
        formatData(row.marcheBC),
        formatData(row.numPrix),
        formatData(row.snReception),
        formatData(row.codeBarre),
        formatData(row.codeProduit),
        formatData(row.designation),
        formatData(row.previousChaine),
        formatData(row.codeChaine),
        formatData(row.previousService),
        formatData(row.newService),
        formatData(row.previousUser),
        formatData(row.newUser),
        formatData(row.lieu),
        formatData(row.evenement),
        formatData(row.qualite)
      ].join(';'))
    ].join('\r\n');

    

    // Créer le Blob avec l'encodage UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Générer le nom du fichier
    const date = new Date();
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const fileName = `liste_passations_${formattedDate}.csv`;
    
    // Déclencher le téléchargement
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Liste des passations</Card.Title>
                  <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                    Tableau des passations <code>effectuées</code>
                  </span>
                </div>
                <Button 
                  variant="success" 
                  className="action-button" 
                  style={{ background: 'linear-gradient(45deg, #28a745, #20c997)' }}
                  onClick={handleExportExcel}
                >
                  <FaFileExcel className="me-2" /> Export Excel
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
                <FaSearch style={{ color: '#6c757d' }} />
              </div>

              {isLoading ? (
                <div className="text-center p-3">
                  <span>Chargement des passations...</span>
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
                        <th style={styles.tableHeader}>Passation ID</th>
                        <th style={styles.tableHeader}>Date Passation</th>
                        <th style={styles.tableHeader}>Type Affectation</th>
                        <th style={styles.tableHeader}>Marché</th>
                        <th style={styles.tableHeader}>Numéro Prix</th>
                        <th style={styles.tableHeader}>SN</th>
                        <th style={styles.tableHeader}>Code-barre</th>
                        <th style={styles.tableHeader}>Code Produit</th>
                        <th style={styles.tableHeader}>Désignation</th>
                        <th style={styles.tableHeader}>Ancienne Chaîne</th>
                        <th style={styles.tableHeader}>Nouvelle Chaîne</th>
                        <th style={styles.tableHeader}>Ancien Service</th>
                        <th style={styles.tableHeader}>Nouveau Service</th>
                        <th style={styles.tableHeader}>Ancien Utilisateur</th>
                        <th style={styles.tableHeader}>Nouvel Utilisateur</th>
                        <th style={styles.tableHeader}>Lieu</th>
                        <th style={styles.tableHeader}>Événement</th>
                        <th style={styles.tableHeader}>Qualité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, index) => (
                        <tr 
                          key={index}
                          onDoubleClick={() => handleRowDoubleClick(row)}
                          style={{
                            ...styles.tableRow,
                            backgroundColor: 'inherit'
                          }}
                        >
                          <td style={styles.tableCell}>{row.passationId}</td>
                          <td style={styles.tableCell}>{new Date(row.datePassation).toLocaleDateString()}</td>
                          <td style={styles.tableCell}>{row.typeAffectation}</td>
                          <td style={styles.tableCell}>{row.marcheBC}</td>
                          <td style={styles.tableCell}>{row.numPrix}</td>
                          <td style={styles.tableCell}>{row.snReception}</td>
                          <td style={styles.tableCell}>{row.codeBarre}</td>
                          <td style={styles.tableCell}>{row.codeProduit}</td>
                          <td style={styles.tableCell}>{row.designation}</td>
                          <td style={styles.tableCell}>{row.previousChaine || '-'}</td>
                          <td style={styles.tableCell}>{row.codeChaine}</td>
                          <td style={styles.tableCell}>{row.previousService}</td>
                          <td style={styles.tableCell}>{row.newService}</td>
                          <td style={styles.tableCell}>{row.previousUser}</td>
                          <td style={styles.tableCell}>{row.newUser}</td>
                          <td style={styles.tableCell}>{row.lieu || '-'}</td>
                          <td style={styles.tableCell}>{row.evenement || '-'}</td>
                          <td style={styles.tableCell}>{row.qualite || '-'}</td>
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
