import React, { useState } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const BootstrapTable = () => {
  const tableData = [
    { numDoc: 'AF201500002448', typeOpe: 'Affectation', marche_IdDoc: 'amyyadia', marche: '24M/SNRT/2021', dateOpe: '28/10/2024', numSerie: '32-060-797', codeBarre: '88527', codeProd: 'P03644', ref: 'StarTracker PTZ', designation: 'Système de tracking', typeArt: 'EQP', marque: 'MO-SYS', date_d: '28/10/2024', date_f: '28/10/2024', typeAff: 'Définitive', utilisateur: 'HASSAN BOUTA...', service_FRS: 'CHAINE TV ARR...', qualite_RefDocExt: 'DIRECTEUR' },
    { numDoc: 'AF201500002448', typeOpe: 'Affectation', marche_IdDoc: 'amyyadia', marche: '24M/SNRT/2021', dateOpe: '28/10/2024', numSerie: '32-070-743', codeBarre: '88527', codeProd: 'P03312', ref: '-', designation: 'Dispositif de contrôle', typeArt: 'EQP', marque: 'LILLIPUT', date_d: '28/10/2024', date_f: '28/10/2024', typeAff: 'Définitive', utilisateur: 'HASSAN BOUTA...', service_FRS: 'CHAINE TV ARR...', qualite_RefDocExt: 'DIRECTEUR' },
    { numDoc: 'BR20150000327', typeOpe: 'Retour', marche_IdDoc: 'AF201500002157', marche: '-', dateOpe: '28/10/2024', numSerie: '32-060-797', codeBarre: '88527', codeProd: 'P03644', ref: 'StarTracker PTZ', designation: 'Système de tracking', typeArt: 'EQP', marque: 'MO-SYS', date_d: '-', date_f: '-', typeAff: '-', utilisateur: 'MOHAMED EL B...', service_FRS: 'SERVICE EXPLO...', qualite_RefDocExt: 'CHEF DE SERV...' },
  ];

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredData, setFilteredData] = useState(tableData);
  const [selectedRow, setSelectedRow] = useState(null);

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
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Traçabilité SN</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau de <code>traçabilité</code>
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
                      <th style={styles.tableHeader}>NumDoc</th>
                      <th style={styles.tableHeader}>TypeOpe</th>
                      <th style={styles.tableHeader}>Marché_IdDoc</th>
                      <th style={styles.tableHeader}>Marché</th>
                      <th style={styles.tableHeader}>DateOpe</th>
                      <th style={styles.tableHeader}>NumSerie</th>
                      <th style={styles.tableHeader}>code_barre</th>
                      <th style={styles.tableHeader}>CodeProd</th>
                      <th style={styles.tableHeader}>Réf</th>
                      <th style={styles.tableHeader}>Designation</th>
                      <th style={styles.tableHeader}>TypeArt</th>
                      <th style={styles.tableHeader}>Marque</th>
                      <th style={styles.tableHeader}>date_d</th>
                      <th style={styles.tableHeader}>date_f</th>
                      <th style={styles.tableHeader}>TypeAff</th>
                      <th style={styles.tableHeader}>Utilisateur</th>
                      <th style={styles.tableHeader}>Service FRS</th>
                      <th style={styles.tableHeader}>Qualite_RefDocExt</th>
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
                        }}>{row.numDoc}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.typeOpe}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marche_IdDoc}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.dateOpe}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.numSerie}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.codeBarre}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.codeProd}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.ref}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.designation}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.typeArt}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marque}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.date_d}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.date_f}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.typeAff}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.utilisateur}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.service_FRS}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qualite_RefDocExt}</td>
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
