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

        // Récupérer tous les marchés
        const marchesResponse = await axios.get('http://localhost:5003/api/amarches');
        const marches = marchesResponse.data;

        // Créer un Map des affectations pour un accès rapide (groupé par SN)
        const affectationsMap = new Map();
        affectations.forEach(aff => {
          if (!affectationsMap.has(aff.snReception)) {
            affectationsMap.set(aff.snReception, []);
          }
          affectationsMap.get(aff.snReception).push(aff);
        });

        // Créer un Map des retours pour un accès rapide (groupé par SN)
        const retoursMap = new Map();
        retours.forEach(ret => {
          if (!retoursMap.has(ret.snReception)) {
            retoursMap.set(ret.snReception, []);
          }
          retoursMap.get(ret.snReception).push(ret);
        });

        // Créer un Map des passations pour un accès rapide (groupé par affectationId)
        const passationsMap = new Map();
        passations.forEach(pass => {
          if (pass.affectationId) {
            if (!passationsMap.has(pass.affectationId)) {
              passationsMap.set(pass.affectationId, []);
            }
            passationsMap.get(pass.affectationId).push(pass);
          }
        });

        // Extraire toutes les réceptions des marchés avec les informations associées
        const formattedData = marches.flatMap(marche =>
          marche.detailProjet.flatMap(projet =>
            projet.detailsPrix.flatMap(detail =>
              (detail.receptions || []).flatMap(reception => {
                const operations = [];
                
                // D'abord, ajouter l'opération de réception
                operations.push({
                  numDoc: reception.receptionId || '-',
                  typeOpe: 'Reception',
                  marche: marche.marcheBC,
                  numeroPrix: projet.numeroPrix,
                  sn: reception.sn || '-',
                  codeBarre: reception.codeBarre || '-',
                  service: '-',
                  responsable: '-',
                  utilisateur: '-',
                  refProduit: detail.reference || '-',
                  dateOpe: reception.dateReception || '-',
                  finGarantie: reception.finGarantie || '-',
                  designation: detail.designation || '-',
                  codeChaine: '-',
                  lieu: '-',
                  evenement: '-',
                  qualite: '-',
                  memo: '-'
                });

                // Récupérer les affectations et retours pour ce SN
                const snAffectations = affectationsMap.get(reception.sn) || [];
                const snRetours = retoursMap.get(reception.sn) || [];

                // Créer un Map des retours par affectationId
                const retoursByAffectationId = new Map();
                snRetours.forEach(ret => {
                  if (ret.affectationId) {
                    retoursByAffectationId.set(ret.affectationId, ret);
                  }
                });

                // Trier les affectations par date
                snAffectations.sort((a, b) => new Date(a.dateAffectation) - new Date(b.dateAffectation));

                // Pour chaque affectation, ajouter l'affectation, ses passations et son retour correspondant
                snAffectations.forEach(aff => {
                  // Ajouter l'affectation
                  operations.push({
                    numDoc: aff.affectationId || '-',
                    typeOpe: 'Affectation',
                    marche: marche.marcheBC,
                    numeroPrix: projet.numeroPrix,
                    sn: reception.sn || '-',
                    codeBarre: reception.codeBarre || '-',
                    service: aff.service || '-',
                    responsable: '-',
                    utilisateur: aff.utilisateur || '-',
                    refProduit: detail.reference || '-',
                    dateOpe: aff.dateAffectation || '-',
                    finGarantie: reception.finGarantie || '-',
                    designation: detail.designation || '-',
                    codeChaine: aff.codeChaine || '-',
                    lieu: '-',
                    evenement: '-',
                    qualite: '-',
                    memo: '-'
                  });

                  // Chercher et ajouter toutes les passations correspondantes
                  const passationsCorrespondantes = passationsMap.get(aff.affectationId) || [];
                  // Trier les passations par date
                  passationsCorrespondantes.sort((a, b) => new Date(a.datePassation) - new Date(b.datePassation));
                  
                  passationsCorrespondantes.forEach(passationCorrespondante => {
                    // Ajouter uniquement la passation avec les nouvelles données
                    operations.push({
                      numDoc: passationCorrespondante.passationId || '-',
                      typeOpe: 'Passation',
                      marche: marche.marcheBC,
                      numeroPrix: projet.numeroPrix,
                      sn: reception.sn || '-',
                      codeBarre: reception.codeBarre || '-',
                      service: passationCorrespondante.newService || '-',
                      responsable: '-',
                      utilisateur: passationCorrespondante.newUser || '-',
                      refProduit: detail.reference || '-',
                      dateOpe: passationCorrespondante.datePassation || '-',
                      finGarantie: reception.finGarantie || '-',
                      designation: detail.designation || '-',
                      codeChaine: passationCorrespondante.codeChaine || '-',
                      lieu: passationCorrespondante.lieu || '-',
                      evenement: passationCorrespondante.evenement || '-',
                      qualite: passationCorrespondante.qualite || '-',
                      memo: passationCorrespondante.memo || '-'
                    });
                  });

                  // Chercher et ajouter le retour correspondant s'il existe
                  const retourCorrespondant = retoursByAffectationId.get(aff.affectationId);
                  if (retourCorrespondant) {
                    operations.push({
                      numDoc: retourCorrespondant.retourId || '-',
                      typeOpe: 'Retour',
                      marche: marche.marcheBC,
                      numeroPrix: projet.numeroPrix,
                      sn: reception.sn || '-',
                      codeBarre: reception.codeBarre || '-',
                      service: aff.service || '-',
                      responsable: retourCorrespondant.responsable || '-',
                      utilisateur: aff.utilisateur || '-',
                      refProduit: detail.reference || '-',
                      dateOpe: retourCorrespondant.dateRetour || '-',
                      finGarantie: reception.finGarantie || '-',
                      designation: detail.designation || '-',
                      codeChaine: aff.codeChaine || '-',
                      lieu: '-',
                      evenement: '-',
                      qualite: '-',
                      memo: '-'
                    });
                  }
                });

                // Trier toutes les opérations par date
                operations.sort((a, b) => new Date(a.dateOpe) - new Date(b.dateOpe));

                return operations;
              })
            )
          )
        ).flat();

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
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    if (keyword.trim() === '') {
      setFilteredData(retours);
      return;
    }
    const filtered = retours.filter(item => {
      return Object.values(item).some(value =>
        value.toString().toLowerCase().includes(keyword.toLowerCase())
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
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Mouvements</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau d'état des<code> matériels</code>
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
                        <th style={styles.tableHeader}>NumDoc</th>
                        <th style={styles.tableHeader}>TypeOpe</th>
                        <th style={styles.tableHeader}>DateOpe</th>
                        <th style={styles.tableHeader}>Marché</th>
                        <th style={styles.tableHeader}>Numéro Prix</th>
                        <th style={styles.tableHeader}>Refproduit</th>
                        <th style={styles.tableHeader}>Designation</th>
                        <th style={styles.tableHeader}>SN</th>
                        <th style={styles.tableHeader}>Code-barre</th>
                        <th style={styles.tableHeader}>Service</th>
                        <th style={styles.tableHeader}>Chaîne</th>
                        <th style={styles.tableHeader}>Utilisateur</th>
                        <th style={styles.tableHeader}>Responsable</th>
                        <th style={styles.tableHeader}>Fin Garantie</th>
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
                            color: selectedRow === index ? '#ff69b4' : 'inherit',
                            position: 'relative'
                          }}>
                            <span 
                              style={{ 
                                display: 'inline-block',
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'help'
                              }}
                              title={row.numDoc}
                            >
                              {row.numDoc}
                            </span>
                          </td>
                          <td style={{
                            ...styles.tableCell,
                            color: row.typeOpe === 'Reception' ? '#28a745' : 
                                  row.typeOpe === 'Affectation' ? '#007bff' : 
                                  row.typeOpe === 'Retour' ? '#dc3545' :
                                  row.typeOpe === 'Passation' ? '#ffc107' : 'inherit',
                            fontWeight: 'bold'
                          }}>{row.typeOpe}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.dateOpe ? new Date(row.dateOpe).toLocaleDateString() : '-'}</td>
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
                          }}>{row.refProduit}</td>
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
                          }}>{row.service}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.codeChaine}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.utilisateur}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.responsable}</td>
                          <td style={{
                            ...styles.tableCell,
                            color: selectedRow === index ? '#ff69b4' : 'inherit'
                          }}>{row.finGarantie && !isNaN(new Date(row.finGarantie)) ? new Date(row.finGarantie).toLocaleDateString() : '-'}</td>
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

          [title] {
            position: relative;
          }

          [title]:hover::after {
            content: attr(title);
            position: absolute;
            left: 0;
            top: 100%;
            white-space: nowrap;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default BootstrapTable;
