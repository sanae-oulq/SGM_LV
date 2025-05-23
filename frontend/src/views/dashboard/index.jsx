import React, { useState, useRef } from 'react';
import { Card, Table, Button, Row, Col, Modal, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Réceptions', value: 35 },
  { label: 'Affectations', value: 21 },
  { label: 'Retours', value: 3 },
  { label: 'Passations', value: 1 }
];

const columns = [
  'AO',
  'Marché',
  'JDE',
  'Fournisseur',
  'Objet',
  'Délais Ex.',
  'Garantie',
  'Documents'
];

const garantieValues = [
  '3 mois', '1 an', '2 mois', '6 mois', '1 an 2 mois', '9 mois', '2 ans', '1 an', '2 mois', '1 an 6 mois'
];

const tableData = [
  {
    AO: '03A0M-SNRT-2025',
    Marche: '03M-SNRT-2025',
    JDE: '24000042',
    Fournisseur: 'Al Aoula',
    Objet: 'Fourniture équipements éclairage',
    Delais: '150',
    Garantie: '1an',
    Documents: true
  },
  {
    AO: '04A0M-SNRT-2025',
    Marche: '04M-SNRT-2025',
    JDE: '24000043',
    Fournisseur: 'Arryadia',
    Objet: 'Installation systèmes sécurité',
    Delais: '120',
    Garantie: '2ans',
    Documents: true
  },
  {
    AO: '05A0M-SNRT-2025',
    Marche: '05M-SNRT-2025',
    JDE: '24000044',
    Fournisseur: 'Tamazight',
    Objet: 'Maintenance équipements',
    Delais: '90',
    Garantie: '6mois',
    Documents: true
  },
  {
    AO: '06A0M-SNRT-2025',
    Marche: '06M-SNRT-2025',
    JDE: '24000045',
    Fournisseur: 'Al Maghribia',
    Objet: 'Fourniture pièces rechange',
    Delais: '180',
    Garantie: '1an',
    Documents: true
  },
  {
    AO: '07A0M-SNRT-2025',
    Marche: '07M-SNRT-2025',
    JDE: '24000046',
    Fournisseur: 'Assadissa',
    Objet: 'Formation personnel',
    Delais: '60',
    Garantie: '3mois',
    Documents: true
  },
  {
    AO: '08A0M-SNRT-2025',
    Marche: '08M-SNRT-2025',
    JDE: '24000047',
    Fournisseur: 'Aflam TV',
    Objet: 'Audit énergétique',
    Delais: '75',
    Garantie: '1an',
    Documents: true
  },
  {
    AO: '09A0M-SNRT-2025',
    Marche: '09M-SNRT-2025',
    JDE: '24000048',
    Fournisseur: 'Laayoune TV',
    Objet: 'Contrôle accès bâtiments',
    Delais: '105',
    Garantie: '2ans',
    Documents: true
  },
  {
    AO: '10A0M-SNRT-2025',
    Marche: '10M-SNRT-2025',
    JDE: '24000049',
    Fournisseur: 'Chada FM',
    Objet: 'Câblage réseau',
    Delais: '45',
    Garantie: '1an',
    Documents: true
  },
  {
    AO: '11A0M-SNRT-2025',
    Marche: '11M-SNRT-2025',
    JDE: '24000050',
    Fournisseur: 'Radio Mohamed VI',
    Objet: 'Système vidéosurveillance',
    Delais: '130',
    Garantie: '1an',
    Documents: true
  },
  {
    AO: '12A0M-SNRT-2025',
    Marche: '12M-SNRT-2025',
    JDE: '24000051',
    Fournisseur: 'SNRT News',
    Objet: 'Modernisation ascenseurs',
    Delais: '160',
    Garantie: '2ans',
    Documents: true
  }
];

const docColumns = [
  'F.Projet', 'F.Affectation', 'OS', 'BL', 'BRIs', 'Doc', 'PVRP', 'PVRD', 'Facture', 'Marché'
];

const DashDefault = () => {
  const [filterText, setFilterText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertDoc, setAlertDoc] = useState('');

  // Pour le popup de téléchargement
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadDoc, setDownloadDoc] = useState('');
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);

  const navigate = useNavigate();

  const filteredData = tableData.filter(row =>
    columns.some(col => {
      if (col === 'Documents') return false;
      const key =
        col === 'AO' ? 'AO' :
        col === 'Marché' ? 'Marche' :
        col === 'Délais Ex.' ? 'Delais' :
        col;
      return row[key].toString().toLowerCase().includes(filterText.toLowerCase());
    })
  );

  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  // Gestion du popup de téléchargement
  const handleDocClick = (docName) => {
    setDownloadDoc(docName);
    setShowDownloadPopup(true);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          setTimeout(() => setShowDownloadPopup(false), 1200);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleCloseDownloadPopup = () => {
    setShowDownloadPopup(false);
    setProgress(0);
    setDownloadDoc('');
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const handleAffectationEquipement = () => {
    navigate('/forms/form-basic-AffectationE');
  };

  const handleNouveauRetour = () => {
    navigate('/forms/form-basic-RetourM');
  };

  const handleReceptionMarche = () => {
    navigate('/forms/form-basic-raceptionMarche');
  };

  const handleNouveauMarche = () => {
    navigate('/forms/form-basic1');
  };

  // Ajout du style global moderne
  return (
    <>
      <style>{`
        body {
          background: linear-gradient(120deg, #f0f4f9 0%, #e9f0fb 100%);
        }
        .dashboard-main-bg {
          background: linear-gradient(120deg, #f0f4f9 0%, #e9f0fb 100%);
          min-height: 100vh;
          padding: 18px 0;
        }
        .dashboard-card {
          border-radius: 14px !important;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
          transition: transform 0.15s, box-shadow 0.15s;
          background: #fff;
        }
        .dashboard-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 18px 0 rgba(0,0,0,0.10);
          z-index: 2;
        }
        .dashboard-stat-value {
          font-size: 25px;
          font-weight: bold;
          margin: 5px 0;
          color: #007bff;
          letter-spacing: 0.5px;
        }
        .dashboard-stat-value.receptions {
          color: #28a745;  /* Vert */
        }
        .dashboard-stat-value.affectations {
          color: #dc3545;  /* Rouge */
        }
        .dashboard-stat-value.retours {
          color: #ffc107;  /* Jaune */
        }
        .dashboard-stat-value.passations {
          color: #6f42c1;  /* Violet */
        }
        .dashboard-stat-label {
          font-size: 13px;
          font-weight: 600;
          color: #444;
          margin-bottom: 2px;
        }
        .dashboard-table th, .dashboard-table td {
          vertical-align: middle !important;
          font-size: 13px;
          padding: 6px 5px !important;
        }
        .dashboard-table th {
          background: #f7fafd !important;
          color: #222;
          font-weight: 700;
          border-bottom: 2px solid #e3eaf2 !important;
        }
        .dashboard-table tbody tr:hover {
          background: #f0f7ff !important;
        }
        .dashboard-folder-icon {
          font-size: 20px;
          color: #007bff;
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
        }
        .dashboard-folder-icon:hover {
          color: #28a745;
          transform: scale(1.12);
        }
        .dashboard-section-title {
          font-size: 16px;
          font-weight: bold;
          color: #222;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .dashboard-info-bar {
          background: #f7fafd;
          border-radius: 8px;
          padding: 6px 12px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
        }
        /* --- MODAL & POPUP STYLE --- */
        .modal-content {
          border-radius: 12px !important;
          box-shadow: 0 6px 18px 0 rgba(0,0,0,0.10) !important;
          background: linear-gradient(120deg, #fafdff 0%, #f0f4f9 100%);
        }
        .modal-header {
          border-bottom: none;
          background: #f7fafd;
          border-radius: 12px 12px 0 0;
        }
        .modal-title {
          color: #007bff !important;
          font-weight: bold;
          font-size: 16px;
          letter-spacing: 0.5px;
        }
        .modal-footer {
          border-top: none;
          background: #f7fafd;
          border-radius: 0 0 12px 12px;
        }
        .dashboard-modal-doc-table th, .dashboard-modal-doc-table td {
          background: transparent !important;
          border: 1px solid #e3eaf2 !important;
          font-size: 13px;
          padding: 6px 5px !important;
        }
        .dashboard-modal-doc-table th {
          background: #e9f0fb !important;
          color: #007bff;
          font-weight: 700;
        }
        .dashboard-modal-doc-table td {
          background: #fff !important;
        }
        .dashboard-modal-doc-table .dashboard-folder-icon {
          font-size: 22px;
          color: #007bff;
          transition: color 0.2s, transform 0.2s;
        }
        .dashboard-modal-doc-table .dashboard-folder-icon:hover {
          color: #ff9800;
          transform: scale(1.13);
        }
        /* Popup téléchargement */
        .modal-download-title {
          color: #28a745;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .modal-download-progress .progress-bar {
          background: linear-gradient(90deg, #007bff 0%, #28a745 100%);
          font-weight: bold;
        }
        .modal-download-message {
          font-size: 13px;
          margin-top: 8px;
          color: #222;
          font-weight: 500;
        }
      `}</style>
      <div className="dashboard-main-bg" style={{ minHeight: '100vh', padding: 20 }}>
      <Row className="mb-3">
        <Col md={2}>
          <Card className="dashboard-card text-center" style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6, letterSpacing: 0.5 }}>MARCHES / BC</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>M</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#007bff', lineHeight: 1 }}>15</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>BC</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#28a745', lineHeight: 1 }}>20</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#222', letterSpacing: 1 }}>2025</div>
            </Card.Body>
          </Card>
        </Col>
        {stats.map((stat, idx) => (
          <Col md={2} key={stat.label}>
            <Card className="dashboard-card text-center">
            <Card.Body>
                <div className="dashboard-stat-label">{stat.label}</div>
                <div className={`dashboard-stat-value ${stat.label.toLowerCase()}`}>{stat.value}</div>
                <div style={{ color: '#888' }}>15jrs</div>
            </Card.Body>
          </Card>
        </Col>
        ))}
        <Col md={2}>
          <Card className="dashboard-card">
            <Card.Body className="d-flex flex-column gap-2">
              <Button variant="outline-secondary" size="sm" onClick={handleAffectationEquipement}>Affectation équipement</Button>
              <Button variant="outline-secondary" size="sm" onClick={handleNouveauRetour}>Nouveau retour</Button>
              <Button variant="outline-secondary" size="sm" onClick={handleReceptionMarche}>Réception Marché</Button>
              <Button variant="outline-secondary" size="sm" onClick={handleNouveauMarche}>Nouveau marché</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="dashboard-info-bar">
        <span>Récemment saisie <span style={{ color: '#007bff' }}>1</span></span>
        <span style={{ margin: '0 10px' }}>|</span>
        <span>Garantie bientôt expirée <span style={{ color: '#dc3545' }}>2</span></span>
              </div>

      <div className="dashboard-card" style={{ borderRadius: 16, padding: 20 }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div></div>
          <div>
            <input
              type="text"
              placeholder="Saisie Filtre"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              style={{
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '4px 8px',
                marginRight: 8
              }}
                    />
                  </div>
                </div>
        <Table bordered hover size="sm" className="dashboard-table" style={{ background: '#fff', marginBottom: 0 }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.AO}>
                <td>{row.AO}</td>
                <td>{row.Marche}</td>
                <td>{row.JDE}</td>
                <td>{row.Fournisseur}</td>
                <td>{row.Objet}</td>
                <td>{row.Delais}</td>
                <td>{row.Garantie}</td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    role="img"
                    aria-label="folder"
                    className="dashboard-folder-icon"
                    onClick={() => handleOpenModal(row)}
                  >
                    📁
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: '#888' }}>
                  Aucune donnée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
                </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <span style={{ fontWeight: 'bold' }}>
              {selectedRow ? `M"${selectedRow.AO}/SNRT/2025` : ''}
            </span>
            <span style={{ float: 'right', marginLeft: 30 }}>Documents</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered className="dashboard-modal-doc-table" style={{ textAlign: 'center', marginBottom: 0 }}>
            <thead>
              <tr>
                {docColumns.map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {docColumns.map((col, idx) => (
                  <td key={col}>
                    <span
                      role="img"
                      aria-label="folder"
                      className="dashboard-folder-icon"
                      onClick={() => handleDocClick(col)}
                    >
                      📁
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Popup de téléchargement */}
      <Modal show={showDownloadPopup} onHide={handleCloseDownloadPopup} centered>
        <Modal.Header closeButton>
          <Modal.Title className="modal-download-title">Téléchargement</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 20, fontWeight: 500, fontSize: 18 }}>
            {downloadDoc ? `${downloadDoc}` : ''}
                  </div>
          <ProgressBar now={progress} animated={progress < 100} className="modal-download-progress" style={{ height: 22, marginBottom: 18, borderRadius: 12 }} />
          <div className="modal-download-message">
            {progress < 100 ? 'En cours de téléchargement...' : `${downloadDoc} téléchargé avec succès !`}
                </div>
        </Modal.Body>
      </Modal>
                  </div>
    </>
  );
};

export default DashDefault;
