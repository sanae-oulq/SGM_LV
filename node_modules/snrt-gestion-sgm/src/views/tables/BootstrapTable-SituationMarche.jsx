import React, { useState } from 'react';
import { Row, Col, Card, Table, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const BootstrapTable = () => {
  const tableData = [
    { numReception: 'RP201500000042', marche: '01/SNRT/2016', numPrix: 'NP001', descprix: 'Description prix 1', dateOpe: '20/04/2017', fournisseur: 'ATEME', codeProd: 'P00256', designation: 'DECODEUR IRD', qteMarche: '14,00', qteRecept: '14,00', qteRest: '0,00' },
    { numReception: 'RP201500000042', marche: '01/SNRT/2016', numPrix: 'NP002', descprix: 'Description prix 2', dateOpe: '20/04/2017', fournisseur: 'ATEME', codeProd: 'P00257', designation: 'DECODEUR IRD', qteMarche: '14,00', qteRecept: '14,00', qteRest: '0,00' },
    { numReception: 'RP201500000042', marche: '01/SNRT/2016', numPrix: 'NP003', descprix: 'Description prix 3', dateOpe: '20/04/2017', fournisseur: 'ATEME', codeProd: 'P01680', designation: 'ALIMENTATION', qteMarche: '14,00', qteRecept: '14,00', qteRest: '0,00' },
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
              <Card.Title as="h5" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Situation marche</Card.Title>
              <span className="d-block" style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                Tableau du <code>Situation marche</code>
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
                      <th style={styles.tableHeader}>NumReception</th>
                      <th style={styles.tableHeader}>Marché</th>
                      <th style={styles.tableHeader}>NumPrix</th>
                      <th style={styles.tableHeader}>DescPrix</th>
                      <th style={styles.tableHeader}>DateOpe</th>
                      <th style={styles.tableHeader}>Fournisseur</th>
                      <th style={styles.tableHeader}>CodeProd</th>
                      <th style={styles.tableHeader}>Designation</th>
                      <th style={styles.tableHeader}>Qte_Marche</th>
                      <th style={styles.tableHeader}>Qte_Recept</th>
                      <th style={styles.tableHeader}>Qte Rest</th>
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
                        }}>{row.numReception}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.marche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.numPrix}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.descprix}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.dateOpe}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.fournisseur}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.codeProd}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.designation}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qteMarche}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qteRecept}</td>
                        <td style={{
                          ...styles.tableCell,
                          color: selectedRow === index ? '#ff69b4' : 'inherit'
                        }}>{row.qteRest}</td>
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
