import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaDownload, FaTimes, FaCheck, FaInfoCircle } from 'react-icons/fa';
import './FicheDeProjet.css';

const FormsElements = () => {
  const [fdpList, setFdpList] = useState([]);
  const [showAddFdpModal, setShowAddFdpModal] = useState(false);
  const [showEditFdpModal, setShowEditFdpModal] = useState(false);
  const [showDeleteFdpModal, setShowDeleteFdpModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [selectedFdp, setSelectedFdp] = useState(null);
  const tableRef = React.useRef(null);

  const [fdpFormValues, setFdpFormValues] = useState({
    intituleProjet: "",
    dateProjet: "",
    chefProjet: "",
    commission: "",
    fichier: null,
  });

  const handleFdpInputChange = (e) => {
    const { name, value } = e.target;
    setFdpFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFdpFileChange = (e) => {
    const file = e.target.files[0];
    setFdpFormValues((prevValues) => ({
      ...prevValues,
      fichier: file,
    }));
  };

  const handleAddFdp = () => {
    setSelectedFdp(null); // Désélectionner la ligne en cours
    setShowAddFdpModal(true);
    setFdpFormValues({ 
      intituleProjet: "", 
      dateProjet: new Date().toISOString().split('T')[0], 
      chefProjet: "", 
      commission: "", 
      fichier: null 
    });
  };

  const handleFdpSubmit = () => {
    if (!fdpFormValues.intituleProjet || !fdpFormValues.dateProjet || !fdpFormValues.chefProjet || !fdpFormValues.commission) {
      setValidationMessage("Tous les champs doivent être remplis.");
      setShowValidationModal(true);
      return;
    }

    const fileData = fdpFormValues.fichier ? {
      name: fdpFormValues.fichier.name,
      type: fdpFormValues.fichier.type,
      data: fdpFormValues.fichier
    } : null;

    if (showEditFdpModal) {
      setFdpList((prevList) => prevList.map((fdp) => (fdp === selectedFdp ? { ...fdpFormValues, fichier: fileData || "Aucun" } : fdp)));
      setValidationMessage("Fiche de projet modifiée avec succès.");
    } else {
      setFdpList([...fdpList, { ...fdpFormValues, fichier: fileData || "Aucun" }]);
      setValidationMessage("Fiche de projet ajoutée avec succès.");
    }

    setShowValidationModal(true);
    setShowAddFdpModal(false);
    setShowEditFdpModal(false);
  };

  const handleEditFdp = () => {
    if (selectedFdp) {
      setFdpFormValues(selectedFdp);
      setShowEditFdpModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à modifier.");
      setShowValidationModal(true);
    }
  };

  const handleDeleteFdp = () => {
    if (selectedFdp) {
      setShowDeleteFdpModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à supprimer.");
      setShowValidationModal(true);
    }
  };

  const confirmFdpDelete = () => {
    setFdpList(fdpList.filter((fdp) => fdp !== selectedFdp));
    setSelectedFdp(null);
    setShowDeleteFdpModal(false);
    setValidationMessage("Fiche de projet supprimée avec succès.");
    setShowValidationModal(true);
  };

  const handleRowDoubleClick = (fdp) => {
    setSelectedFdp(fdp);
    setFdpFormValues(fdp);
    setShowEditFdpModal(true);
  };

  const handleFileDownload = (fichier) => {
    if (fichier && fichier !== "Aucun") {
      const url = URL.createObjectURL(fichier.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fichier.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    // Initialiser le canvas de signature quand la modale est affichée
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Effacer le canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const draw = (e) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      lastX = x;
      lastY = y;
    };

    const startDrawing = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [showAddFdpModal, showEditFdpModal]);

  useEffect(() => {
    // Gestionnaire pour désélectionner quand on clique en dehors du tableau
    const handleOutsideClick = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target) && 
          !event.target.closest('.modal') && !event.target.closest('.action-button')) {
        setSelectedFdp(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <Card className="custom-card">
      <Card.Header className="bg-light d-flex justify-content-between align-items-center p-3">
        <div className="d-flex gap-2">
          <Button variant="success" className="action-button" onClick={handleAddFdp}>
            <FaPlus className="me-2" /> Ajouter
          </Button>
          
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip-edit">
                {!selectedFdp ? "Veuillez sélectionner une ligne à modifier" : "Modifier la ligne sélectionnée"}
              </Tooltip>
            }
          >
            <span className="d-inline-block">
              <Button 
                variant="warning" 
                className="action-button" 
                onClick={handleEditFdp} 
                disabled={!selectedFdp}
              >
                <FaEdit className="me-2" /> Modifier
              </Button>
            </span>
          </OverlayTrigger>
          
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="tooltip-delete">
                {!selectedFdp ? "Veuillez sélectionner une ligne à supprimer" : "Supprimer la ligne sélectionnée"}
              </Tooltip>
            }
          >
            <span className="d-inline-block">
              <Button 
                variant="danger" 
                className="action-button" 
                onClick={handleDeleteFdp} 
                disabled={!selectedFdp}
              >
                <FaTrash className="me-2" /> Supprimer
              </Button>
            </span>
          </OverlayTrigger>
      </div>
      </Card.Header>

      <Card.Body className="p-4">
        {fdpList.length === 0 ? (
          <div className="text-center p-4 empty-state">
            <FaInfoCircle size={40} className="text-muted mb-3" />
            <h5>Aucune fiche de projet disponible</h5>
            <p className="text-muted">Cliquez sur "Ajouter" pour créer une nouvelle fiche.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover bordered className="custom-table" ref={tableRef}>
        <thead>
          <tr>
                  <th className="text-center" style={{ width: '50px' }}>#</th>
            <th>Intitulé du Projet</th>
            <th>Date Projet</th>
            <th>Chef de Projet</th>
            <th>Commission</th>
            <th>Fichier</th>
          </tr>
        </thead>
        <tbody>
          {fdpList.map((fdp, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedFdp(fdp)}
                    onDoubleClick={() => handleRowDoubleClick(fdp)}
                    className={selectedFdp === fdp ? "selected-row" : ""}
                  >
                    <td className="text-center">{index + 1}</td>
              <td>{fdp.intituleProjet}</td>
                    <td>{fdp.dateProjet ? (() => {
                      // S'assurer que la date est valide
                      const dateObj = new Date(fdp.dateProjet);
                      if (isNaN(dateObj.getTime())) return 'Date invalide';
                      
                      // Formater la date manuellement en JJ/MM/AAAA
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const year = dateObj.getFullYear().toString().substring(0, 4); // S'assurer que l'année est sur 4 chiffres
                      
                      return `${day}/${month}/${year}`;
                    })() : ''}</td>
              <td>{fdp.chefProjet}</td>
              <td>{fdp.commission}</td>
                    <td>
                      {fdp.fichier !== "Aucun" ? (
                        <Button 
                          variant="link" 
                          className="file-link p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileDownload(fdp.fichier);
                          }}
                        >
                          <FaDownload className="me-2" />
                          {fdp.fichier.name}
                        </Button>
                      ) : (
                        "Aucun"
                      )}
                    </td>
            </tr>
          ))}
        </tbody>
      </Table>
          </div>
        )}

        {/* Modal Ajout/Modification */}
        <Modal 
          show={showAddFdpModal || showEditFdpModal} 
          onHide={() => { 
            setShowAddFdpModal(false); 
            setShowEditFdpModal(false); 
          }} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className="modal-colored-header bg-primary text-white">
            <Modal.Title className="d-flex align-items-center">
              {showEditFdpModal ? (
                <><FaEdit className="me-2" />Modifier la fiche de projet</>
              ) : (
                <><FaPlus className="me-2" />Ajouter une fiche de projet</>
              )}
            </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Intitulé du Projet</Form.Label>
                <Form.Control
                  type="text"
                  name="intituleProjet"
                  value={fdpFormValues.intituleProjet}
                  onChange={handleFdpInputChange}
                  placeholder="Entrez l'intitulé du projet"
                  className="form-control-modern"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Date Projet</Form.Label>
                <Form.Control
                  type="date"
                  name="dateProjet"
                  value={fdpFormValues.dateProjet}
                  onChange={handleFdpInputChange}
                  className="form-control-modern"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Chef de Projet</Form.Label>
                <Form.Control
                  type="text"
                  name="chefProjet"
                  value={fdpFormValues.chefProjet}
                  onChange={handleFdpInputChange}
                  placeholder="Nom du chef de projet"
                  className="form-control-modern"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Commission</Form.Label>
                <Form.Control
                  type="text"
                  name="commission"
                  value={fdpFormValues.commission}
                  onChange={handleFdpInputChange}
                  placeholder="Nom de la commission"
                  className="form-control-modern"
                />
            </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Fichier</Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  onChange={handleFdpFileChange}
                  className="form-control-modern"
                />
            </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="light" 
                  onClick={() => {
                    setShowAddFdpModal(false);
                    setShowEditFdpModal(false);
                  }}
                >
                  <FaTimes className="me-2" /> Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleFdpSubmit}
                  className="action-button"
                >
                  <FaCheck className="me-2" /> {showEditFdpModal ? "Mettre à jour" : "Valider"}
                </Button>
              </div>
          </Form>
        </Modal.Body>
      </Modal>

        {/* Modal Suppression */}
        <Modal 
          show={showDeleteFdpModal} 
          onHide={() => setShowDeleteFdpModal(false)} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className="modal-colored-header bg-danger text-white">
            <Modal.Title className="d-flex align-items-center">
              <FaTrash className="me-2" />
              Supprimer une fiche de projet
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-1">Êtes-vous sûr de vouloir supprimer cette fiche de projet ?</p>
            <p className="mb-0"><strong>Projet : </strong>{selectedFdp?.intituleProjet}</p>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="light" onClick={() => setShowDeleteFdpModal(false)}>
              <FaTimes className="me-2" /> Annuler
            </Button>
            <Button variant="danger" onClick={confirmFdpDelete} className="action-button">
              <FaTrash className="me-2" /> Confirmer la suppression
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de validation */}
        <Modal 
          show={showValidationModal} 
          onHide={() => setShowValidationModal(false)} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className={validationMessage.includes("succès") ? "modal-colored-header bg-success text-white" : "modal-colored-header bg-warning text-white"}>
            <Modal.Title className="d-flex align-items-center">
              {validationMessage.includes("succès") ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
              {validationMessage.includes("succès") ? "Succès" : "Attention"}
            </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-0">{validationMessage}</p>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button 
              variant={validationMessage.includes("succès") ? "success" : "warning"} 
              onClick={() => setShowValidationModal(false)}
              className="action-button"
            >
              <FaCheck className="me-2" /> OK
            </Button>
        </Modal.Footer>
      </Modal>
      </Card.Body>
    </Card>
  );
};

export default FormsElements;