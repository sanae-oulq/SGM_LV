import React, { useState, useEffect } from 'react';
import { Modal, Table, Form, Button, InputGroup } from 'react-bootstrap';
import { FaSearch, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const AffectationsSelector = ({
  show,
  onHide,
  onSelect,
  selectedAffectations,
  setSelectedAffectations,
  setSelectedAffectationDetails
}) => {
  const [affectationData, setAffectationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAffectations = async () => {
      try {
        setIsLoading(true);
        
        // 1. Récupérer tous les marchés
        const marchesResponse = await axios.get('http://localhost:5003/api/amarches');
        const marches = marchesResponse.data;

        // 2. Récupérer toutes les affectations
        const affectationsResponse = await axios.get('http://localhost:5003/api/affectations/all');
        const affectations = affectationsResponse.data;

        // 3. Récupérer toutes les passations
        const passationsResponse = await axios.get('http://localhost:5003/api/passations/all');
        const passations = passationsResponse.data;
        
        // Filtrer les affectations invalides
        const affectationsValides = affectations.filter(aff => 
          aff.snReception && 
          aff.snReception.trim() !== '' &&
          aff.marcheBC && 
          aff.marcheBC.trim() !== '' &&
          aff.numPrix && 
          aff.numPrix.trim() !== '' &&
          aff.affectationId && 
          aff.affectationId.trim() !== ''
        );

        // Créer un Map des passations par affectationId
        const passationsParAffectation = new Map();
        passations.forEach(passation => {
          if (passation.affectationId) {
            passationsParAffectation.set(passation.affectationId, passation);
          }
        });

        // Grouper les affectations par SN
        const affectationsParSN = new Map();
        affectationsValides.forEach(aff => {
          const sn = aff.snReception;
          if (!affectationsParSN.has(sn)) {
            affectationsParSN.set(sn, []);
          }
          affectationsParSN.get(sn).push(aff);
        });

        // Pour chaque SN, trier les affectations par date
        affectationsParSN.forEach((affs, sn) => {
          affs.sort((a, b) => {
            const dateA = new Date(a.dateAffectation).getTime();
            const dateB = new Date(b.dateAffectation).getTime();
            if (dateA !== dateB) {
              return dateB - dateA; // Tri décroissant
            }
            
            // Si même date, comparer par ID d'affectation
            const idA = a.affectationId || '';
            const idB = b.affectationId || '';
            return idB.localeCompare(idA);
          });
        });

        // Sélectionner la dernière affectation active pour chaque SN
        const dernieresAffectations = [];
        affectationsParSN.forEach((affs, sn) => {
          // Trouver la dernière affectation active
          const derniereAffectation = affs.find(aff => 
            aff.etat === 'Affecté'
          );

          if (derniereAffectation) {
            // Vérifier si cette affectation a une passation associée
            const passation = passationsParAffectation.get(derniereAffectation.affectationId);
            if (passation) {
              // Mettre à jour les informations de l'affectation avec celles de la passation
              derniereAffectation.service = passation.newService;
              derniereAffectation.utilisateur = passation.newUser;
              derniereAffectation.codeChaine = passation.codeChaine;
              derniereAffectation.nomChaine = passation.nomChaine;
              derniereAffectation.typeAffectation = passation.typeAffectation;
              derniereAffectation.lieu = passation.lieu;
              derniereAffectation.evenement = passation.evenement;
              derniereAffectation.qualite = passation.qualite;
              derniereAffectation.memo = passation.memo;
            }
            dernieresAffectations.push(derniereAffectation);
          }
        });

        // Trier les affectations finales par date décroissante
        const affectationsTriees = dernieresAffectations.sort((a, b) => {
          const dateA = new Date(a.dateAffectation).getTime();
          const dateB = new Date(b.dateAffectation).getTime();
          return dateB - dateA;
        });
        
        console.log('Affectations filtrées finales avec passations:', affectationsTriees);
        setAffectationData(affectationsTriees);
        setFilteredData(affectationsTriees);
        setError(null);
      } catch (error) {
        console.error('Error fetching affectations:', error);
        setError('Failed to load affectations data');
      } finally {
        setIsLoading(false);
      }
    };

    if (show) {
      fetchAffectations();
    }
  }, [show]);

  useEffect(() => {
    const filtered = affectationData.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchText, affectationData]);

  const handleSelect = (affectation) => {
    const isSelected = selectedAffectations.includes(affectation._id);

    if (isSelected) {
      setSelectedAffectations(prev => prev.filter(id => id !== affectation._id));
      setSelectedAffectationDetails(prev => prev.filter(detail => detail._id !== affectation._id));
    } else {
      setSelectedAffectations(prev => [...prev, affectation._id]);
      setSelectedAffectationDetails(prev => [...prev, affectation]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedAffectations);
    onHide();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Sélectionner les Affectations</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </InputGroup>

        {isLoading && <div className="text-center">Chargement...</div>}
        {error && <div className="text-danger">{error}</div>}

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th>Marché</th>
                <th>Numéro Prix</th>
                <th>Code Produit</th>
                <th>Désignation</th>
                <th>SN</th>
                <th>Code-barre</th>
                <th>Date affectation</th>
                <th>Service</th>
                <th>Utilisateur</th>
                <th>Chaîne</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((affectation) => (
                <tr 
                  key={affectation._id}
                  onClick={() => handleSelect(affectation)}
                  style={{ cursor: 'pointer' }}
                  className={selectedAffectations.includes(affectation._id) ? 'table-primary' : ''}
                >
                  <td className="text-center">
                    <Form.Check
                      type="checkbox"
                      checked={selectedAffectations.includes(affectation._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelect(affectation);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>{affectation.marcheBC || '-'}</td>
                  <td>{affectation.numPrix || '-'}</td>
                  <td>{affectation.codeProduit || '-'}</td>
                  <td>{affectation.designation || '-'}</td>
                  <td>{affectation.snReception || '-'}</td>
                  <td>{affectation.codeBarre || '-'}</td>
                  <td>{formatDate(affectation.dateAffectation)}</td>
                  <td>{affectation.service || '-'}</td>
                  <td>{affectation.utilisateur || '-'}</td>
                  <td>{affectation.codeChaine ? `${affectation.codeChaine} - ${affectation.nomChaine || ''}` : '-'}</td>
                  <td>
                    <span className="badge bg-success">
                      {affectation.etat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirmer ({selectedAffectations.length} sélectionné{selectedAffectations.length !== 1 ? 's' : ''})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AffectationsSelector;