import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Modal, DropdownButton, Dropdown, Tabs, Tab, Table } from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaPlus, FaSave, FaPrint, FaFileAlt, FaSearch, FaCalendarAlt, FaStore, FaShoppingBag, FaUser, FaFileUpload, FaSignature, FaFile, FaDownload, FaClipboardList, FaTag, FaBoxOpen, FaEye, FaTimes, FaCheck, FaHistory, FaInfoCircle, FaUserTie } from 'react-icons/fa';
import './GEDStyles.css';
import axios from 'axios';
import logo from '../../assets/images/logo1.png';

function getNextReceptionId() {
  const year = new Date().getFullYear();
  const key = `receptionIdCounter_${year}`;
  let lastNumber = parseInt(localStorage.getItem(key) || '0', 10);
  lastNumber += 1;
  localStorage.setItem(key, lastNumber.toString());
  const paddedNumber = lastNumber.toString().padStart(8, '0');
  return `REC${year}${paddedNumber}`;
}

const PrintableReceptionHistory = ({ receptionId, receptions, selectedMarcheDetails, selectedPrix }) => {
  console.log('Données de réception pour impression:', receptions);

  // Grouper les réceptions par numeroPrix
  const receptionsByNumPrix = receptions.reduce((acc, reception) => {
    const numPrix = reception.numeroPrix;
    if (!acc[numPrix]) {
      acc[numPrix] = [];
    }
    acc[numPrix].push(reception);
    return acc;
  }, {});

  

  return (
    <div className="print-only">
  <div className="print-header">
    <div className="logo-container">
      <img src={logo} alt="SNRT Logo" className="print-logo" />
    </div>
    <h2 className="text-center mb-4">SNRT - Bon de Réception ({receptionId})</h2>
  </div>
      
      <div className="reception-details mb-4">
        <table className="details-table">
          <tbody>
            <tr>
              <th>Marché:</th>
              <td>{selectedMarcheDetails?.marcheBC || ''}</td>
              <th>Date:</th>
              <td>{new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>Description:</th>
              <td colSpan="3">{selectedMarcheDetails?.descriptionProjet || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Afficher un tableau pour chaque numeroPrix */}
      {Object.entries(receptionsByNumPrix).map(([numPrix, receptionGroup]) => (
        <div key={numPrix} className="mb-4">
          <h4 className="prix-header">Numéro Prix: {numPrix}</h4>
          <Table striped bordered className="reception-table">
            <thead>
              <tr>
                <th>Code Produit</th>
                <th>Désignation</th>
                <th>Code-barre</th>
                <th>SN</th>
                <th>Qte livrée</th>
                <th>Date Réception</th>
                <th>Fin Garantie</th>
              </tr>
            </thead>
            <tbody>
              {receptionGroup.map((reception, index) => (
                <tr key={index}>
                  <td>{reception.codeProduit}</td>
                  <td>{reception.designation}</td>
                  <td>{reception.codeBarre}</td>
                  <td>{reception.sn}</td>
                  <td>{reception.qteLivree}</td>
                  <td>{new Date(reception.dateReception).toLocaleDateString()}</td>
                  <td>{reception.finGarantie ? new Date(reception.finGarantie).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      <div className="signature-section">
        <div className="signature-box">
          <p>Signature du responsable</p>
          <div className="signature-line"></div>
        </div>
        <div className="signature-box">
          <p>Signature du fournisseur</p>
          <div className="signature-line"></div>
        </div>
      </div>
    </div>
  );
};

const FormsElements = () => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showGED, setShowGED] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [fileListDocuments, setFileListDocuments] = useState([]);
  const [selectedFileDocuments, setSelectedFileDocuments] = useState(null);
  const [fileListBRI, setFileListBRI] = useState([]);
  const [selectedFileBRI, setSelectedFileBRI] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTitle, setSignatureTitle] = useState('');
  const [signatureExtension, setSignatureExtension] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState('');
  const [selectedMarketDescription, setSelectedMarketDescription] = useState('');
  const [selectedMarketDate, setSelectedMarketDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMarketSupplier, setSelectedMarketSupplier] = useState('');
  const [showDepotPopup, setShowDepotPopup] = useState(false);
  const [depotFilterText, setDepotFilterText] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [referenceFilterText, setReferenceFilterText] = useState('');
  const [selectedReference, setSelectedReference] = useState('');
  const [selectedNPrix, setSelectedNPrix] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [numeroPrix, setNumeroPrix] = useState('');
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [filteredReferenceData, setFilteredReferenceData] = useState([]);
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [showDetailTable, setShowDetailTable] = useState(false);
  const [detailTableData, setDetailTableData] = useState([]);
  const [isMarketEditable, setIsMarketEditable] = useState(true);
  const [showNewConfirmationModal, setShowNewConfirmationModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [selectedMarketRow, setSelectedMarketRow] = useState(null);
  const [selectedDepotRow, setSelectedDepotRow] = useState(null);
  const [selectedReferenceRow, setSelectedReferenceRow] = useState(null);
  const [selectedDetailRow, setSelectedDetailRow] = useState(null);


  const [showFournisseurPopup, setShowFournisseurPopup] = useState(false);
  const [fournisseurFilterText, setFournisseurFilterText] = useState('');
  const [selectedFournisseurCode, setSelectedFournisseurCode] = useState('');
  const [selectedFournisseurNom, setSelectedFournisseurNom] = useState('');
  const [selectedFournisseurRow, setSelectedFournisseurRow] = useState(null);

  const toggleFournisseurPopup = () => setShowFournisseurPopup(!showFournisseurPopup);

  useEffect(() => {
    const handleClickOutsideFournisseur = (event) => {
      if (showFournisseurPopup && !event.target.closest('.popup')) {
        setShowFournisseurPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideFournisseur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFournisseur);
    };
  }, [showFournisseurPopup]);

  const filteredFournisseurData = [
    { codeFrs: 'F001', NomFrs: 'Fournisseur Alpha' },
    { codeFrs: 'F002', NomFrs: 'Fournisseur Beta' },
    { codeFrs: 'F003', NomFrs: 'Fournisseur Gamma' },
  ].filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(fournisseurFilterText.toLowerCase())
    )
  );

  // Nouveaux états pour la gestion des marchés et des prix
  const [showMarchePopup, setShowMarchePopup] = useState(false);
  const [marcheFilterText, setMarcheFilterText] = useState('');
  const [selectedMarche, setSelectedMarche] = useState('');
  const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
  const [showPrixTable, setShowPrixTable] = useState(false);
  const [prixData, setPrixData] = useState([]);
  const [marcheData, setMarcheData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMarcheDisabled, setIsMarcheDisabled] = useState(false);
  const [marcheArticlesData, setMarcheArticlesData] = useState([]);
  const [detailPrixData, setDetailPrixData] = useState([]);

  // Ajouter ces états au début du composant avec les autres états
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [selectedPrix, setSelectedPrix] = useState(null);
  const [qteRecue, setQteRecue] = useState('');
  const [snCodeBarrePairs, setSnCodeBarrePairs] = useState([]);

  // Ajouter ces nouveaux états
  const [receptionsHistory, setReceptionsHistory] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
const [sessionReceptionId, setSessionReceptionId] = useState(() => getNextReceptionId());
  {/*const [sessionReceptionId, setSessionReceptionId] = useState(() => {
  const year = new Date().getFullYear();
  const key = `receptionIdCounter_${year}`;
  let lastNumber = parseInt(localStorage.getItem(key) || '0', 10);
  lastNumber += 1;
  localStorage.setItem(key, lastNumber.toString());
  const paddedNumber = lastNumber.toString().padStart(8, '0');
  return `REC${year}${paddedNumber}`;
});*}

{/** 
  const [sessionReceptionId, setSessionReceptionId] = useState(() => {
    // Générer un nouvel ID à chaque montage du composant
    const newId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return newId;
  });
*/}
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [selectedReceptionId, setSelectedReceptionId] = useState(null);

  // Nettoyer le localStorage quand le composant est démonté
  useEffect(() => {
    return () => {
      localStorage.removeItem('currentSessionReceptionId');
    };
  }, []);

  const toggleMarchePopup = () => {
    setShowMarchePopup(!showMarchePopup);
    if (!showMarchePopup) {
      fetchMarches();
    }
  };

  const filteredMarcheData = marcheData.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
    )
  );

  // Fonction pour récupérer les marchés
  const fetchMarches = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/amarches');
      console.log('Données reçues de l\'API:', response.data);
      setMarcheData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des marchés:', err);
    }
  };

  useEffect(() => {
    fetchMarches();
  }, []);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    setShowPrintModal(false);
    const printContent = document.getElementById('printable-content');
    const originalDisplay = printContent.style.display;
    printContent.style.display = 'block';
    window.print();
    printContent.style.display = originalDisplay;
  };

  const handleFileSelectDocuments = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('typeFile', file.type);
        formData.append('description', '');
        formData.append('receptionId', isNavigationMode ? selectedReceptionId : sessionReceptionId);

        const response = await axios.post('http://localhost:5003/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const newFileEntry = {
          id: response.data.document._id,
          fileName: file.name,
          date: new Date(response.data.document.date).toLocaleDateString(),
          typeFile: response.data.document.typeFile,
          description: response.data.document.description
        };

        setFileListDocuments([...fileListDocuments, newFileEntry]);
        setInfoMessage('Document uploadé avec succès');
        setShowInfoModal(true);
      } catch (error) {
        console.error('Erreur lors de l\'upload du document:', error);
        setInfoMessage('Erreur lors de l\'upload du document');
        setShowInfoModal(true);
      }
    }
  };

  const handleFileSelectBRI = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('typeFile', file.type);
        formData.append('description', '');
        formData.append('receptionId', isNavigationMode ? selectedReceptionId : sessionReceptionId);

        const response = await axios.post('http://localhost:5003/api/documents/uploadBRI', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const newFileEntry = {
          id: response.data.bri._id,
          fileName: file.name,
          date: new Date(response.data.bri.date).toLocaleDateString(),
          typeFile: response.data.bri.typeFile,
          description: response.data.bri.description
        };

        setFileListBRI([...fileListBRI, newFileEntry]);
        setInfoMessage('BRI uploadé avec succès');
        setShowInfoModal(true);
      } catch (error) {
        console.error('Erreur lors de l\'upload du BRI:', error);
        setInfoMessage('Erreur lors de l\'upload du BRI');
        setShowInfoModal(true);
      }
    }
  };

  const handleRemoveDocuments = async (id) => {
    try {
      await axios.delete(`http://localhost:5003/api/documents/${id}`);
      setFileListDocuments(fileListDocuments.filter((file) => file.id !== id));
      setInfoMessage('Document supprimé avec succès');
      setShowInfoModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      setInfoMessage('Erreur lors de la suppression du document');
      setShowInfoModal(true);
    }
  };

  const handleRemoveBRI = async (id) => {
    try {
      await axios.delete(`http://localhost:5003/api/documents/bri/${id}`);
      setFileListBRI(fileListBRI.filter((file) => file.id !== id));
      setInfoMessage('BRI supprimé avec succès');
      setShowInfoModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression du BRI:', error);
      setInfoMessage('Erreur lors de la suppression du BRI');
      setShowInfoModal(true);
    }
  };

  // Ajouter un useEffect pour charger les documents existants
  useEffect(() => {
    const loadDocuments = async () => {
      if (isNavigationMode && selectedReceptionId) {
        try {
          // Charger les documents
          const documentsResponse = await axios.get(`http://localhost:5003/api/documents/reception/${selectedReceptionId}`);
          setFileListDocuments(documentsResponse.data.map(doc => ({
            id: doc._id,
            fileName: doc.fileName,
            date: new Date(doc.date).toLocaleDateString(),
            typeFile: doc.typeFile,
            description: doc.description
          })));

          // Charger les BRI
          const briResponse = await axios.get(`http://localhost:5003/api/documents/bri/reception/${selectedReceptionId}`);
          setFileListBRI(briResponse.data.map(bri => ({
            id: bri._id,
            fileName: bri.fileName,
            date: new Date(bri.date).toLocaleDateString(),
            typeFile: bri.typeFile,
            description: bri.description
          })));
        } catch (error) {
          console.error('Erreur lors du chargement des documents:', error);
          setInfoMessage('Erreur lors du chargement des documents');
          setShowInfoModal(true);
        }
      }
    };

    loadDocuments();
  }, [isNavigationMode, selectedReceptionId]);

  const handleSignature = () => {
    // Simulate signature upload
    const signatureFile = {
      id: fileListDocuments.length + 1,
      fileName: 'signature.pdf',
      date: new Date().toLocaleDateString(),
      fileData: new Blob(['Signature'], { type: 'application/pdf' }),
    };

    setFileListDocuments([...fileListDocuments, signatureFile]);
  };

  const handleChangeSignature = (e) => {
    const newSignatureFile = e.target.files[0];
    if (newSignatureFile) {
      const updatedFileList = fileListDocuments.map(file =>
        file.fileName === 'signature.pdf' ? { ...file, fileData: newSignatureFile, fileName: newSignatureFile.name } : file
      );
      setFileListDocuments(updatedFileList);
    }
  };

  const handleSignatureUpload = () => {
    if (!signatureTitle) {
      alert('Veuillez saisir le titre !');
      return;
    }

    const canvas = document.getElementById('signatureCanvas');
    canvas.toBlob((blob) => {
    const signatureFile = {
      id: fileListDocuments.length + 1,
        fileName: signatureTitle,
      date: new Date().toLocaleDateString(),
        fileData: blob,
        typeFile: 'image/png',
        description: `${signatureTitle}.png`,
    };

    setFileListDocuments([...fileListDocuments, signatureFile]);
    setShowSignatureModal(false);
    setSignatureTitle('');
    }, 'image/png');
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const toggleDepotPopup = () => setShowDepotPopup(!showDepotPopup);

  const toggleReferencePopup = () => setShowReferencePopup(!showReferencePopup);

  const filteredData = [
    { id: 1, description: 'Project A', family: 'Family A', date: '2023-01-01', supplier: 'Supplier A', memo: 'Memo A' },
    { id: 2, description: 'Project B', family: 'Family B', date: '2023-02-01', supplier: 'Supplier B', memo: 'Memo B' },
    { id: 3, description: 'Project C', family: 'Family C', date: '2023-03-01', supplier: 'Supplier C', memo: 'Memo C' },
  ].filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  const filteredDepotData = [
    { code: 'A1', designation: 'Designation A' },
    { code: 'B2', designation: 'Designation B' },
    { code: 'C3', designation: 'Designation C' },
  ].filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(depotFilterText.toLowerCase())
    )
  );

  const referenceData = [
    { id: 1, codeProd: 'CP1', designation: 'Designation 1', ref: 'Ref1', qteMarche: 100, qteLiv: 50, resteLiv: 50, numJonction: 'NJ1', marche: '1', nPrix: 'NP1' },
    { id: 2, codeProd: 'CP2', designation: 'Designation 2', ref: 'Ref2', qteMarche: 200, qteLiv: 100, resteLiv: 100, numJonction: 'NJ2', marche: '1', nPrix: 'NP2' },
    { id: 3, codeProd: 'CP3', designation: 'Designation 3', ref: 'Ref3', qteMarche: 300, qteLiv: 150, resteLiv: 150, numJonction: 'NJ3', marche: '2', nPrix: 'NP3' },
    { id: 4, codeProd: 'CP4', designation: 'Designation 4', ref: 'Ref4', qteMarche: 400, qteLiv: 200, resteLiv: 200, numJonction: 'NJ4', marche: '2', nPrix: 'NP4' },
    { id: 5, codeProd: 'CP5', designation: 'Designation 5', ref: 'Ref5', qteMarche: 500, qteLiv: 250, resteLiv: 250, numJonction: 'NJ5', marche: '3', nPrix: 'NP5' },
  ];

  useEffect(() => {
    const filteredData = referenceData.filter(item => {
      // D'abord, filtrer par marché
      const matchesMarket = item.marche === selectedMarketId;
      
      // Ensuite, filtrer par texte de recherche si présent
      const searchText = referenceFilterText.toLowerCase();
      const matchesSearch = searchText ? (
        item.id.toString().includes(searchText) ||
        item.codeProd.toLowerCase().includes(searchText) ||
        item.designation.toLowerCase().includes(searchText) ||
        item.ref.toLowerCase().includes(searchText) ||
        item.numJonction.toLowerCase().includes(searchText) ||
        item.nPrix.toLowerCase().includes(searchText)
      ) : true;

      // Les deux conditions doivent être vraies
      return matchesMarket && matchesSearch;
    });
    setFilteredReferenceData(filteredData);
  }, [referenceFilterText, selectedMarketId]);

  useEffect(() => {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return; // Ensure canvas is available
    const ctx = canvas.getContext('2d');
    let drawing = false;

    const startDrawing = () => drawing = true;
    const stopDrawing = () => drawing = false;
    const draw = (event) => {
      if (!drawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';

      ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
    };
  }, [showSignatureModal]); // Re-run effect when modal visibility changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDepotPopup && !event.target.closest('.popup')) {
        setShowDepotPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDepotPopup]);

  useEffect(() => {
    const handleClickOutsideMarket = (event) => {
      if (showPopup && !event.target.closest('.popup')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideMarket);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMarket);
    };
  }, [showPopup]);

  useEffect(() => {
    const handleClickOutsideReference = (event) => {
      if (showReferencePopup && !event.target.closest('.popup')) {
        setShowReferencePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideReference);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideReference);
    };
  }, [showReferencePopup]);

  useEffect(() => {
    const updatedReferenceData = referenceData.filter(item => item.marche === selectedMarketId);
    setFilteredReferenceData(updatedReferenceData);
  }, [selectedMarketId]);

  const clearDetailForm = () => {
    setNumeroPrix('');
    setSelectedReference('');
    setSelectedDesignation('');
    setSelectedQuantity('');
    // Add any other fields that need to be cleared
  };

  const handleNew = () => {
    setIsNavigationMode(false);
    setSelectedReceptionId(null);
    const newId = getNextReceptionId();
setSessionReceptionId(newId);
    //const newId = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    //setSessionReceptionId(newId);
    
    // Réinitialiser les autres états
    setGeneratedNumber('');
    setSelectedMarche('');
    setSelectedMarcheDetails(null);
    setSelectedMarketDate(new Date().toISOString().split('T')[0]);
    setSelectedMarketSupplier('');
    setNumeroPrix('');
    setSelectedReference('');
    setSelectedDesignation('');
    setSelectedQuantity('');
    setIsMarketEditable(true);
    setDetailTableData([]);
    setShowDetailTable(false);
    setShowNewConfirmationModal(false);
    setReceptionsHistory([]); // Réinitialiser l'historique des réceptions
    
    // Réinitialiser les listes de documents GED
    setFileListDocuments([]);
    setFileListBRI([]);
    
    // Réinitialiser les autres champs liés au marché
    setSelectedMarketDescription('');
    setSelectedFournisseurCode('');
    setSelectedFournisseurNom('');

    // Réinitialiser la liste des articles à réceptionner
    setDetailPrixData([]);
    setShowPrixTable(false);
    setPrixData([]);
    setQteRecue('');
    setSnCodeBarrePairs([]);
    setSelectedPrix(null);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseInt(value) >= 0) {
      setSelectedQuantity(value);
    }
  };

  // Données simulées des prix
  const prixInitialData = [
    {
      codeProduit: "REF001",
      designation: "Produit 1",
      numPrix: "NP001",
      qtePrevu: 100,
      qteARecevoir: 100,
      qteRecue: 0
    }
  ];

  const handleReception = (prix) => {
    if (prix.qteARecevoir <= 0) {
      setInfoMessage("La réception n'est pas possible car la quantité totale a déjà été reçue pour cet article.");
      setShowInfoModal(true);
      return;
    }
    setSelectedPrix(prix);
    setShowReceptionModal(true);
    setQteRecue('');
    setSnCodeBarrePairs([]);
  };

  const handleQteRecueChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 0 && Number.isInteger(Number(value)))) {
      setQteRecue(value);
      if (value === '') {
        setSnCodeBarrePairs([]);
      } else {
        const pairs = Array(parseInt(value)).fill().map(() => ({
          sn: '',
          codeBarre: ''
        }));
        setSnCodeBarrePairs(pairs);
      }
    }
  };

  const handleSnChange = (index, value) => {
    const newPairs = [...snCodeBarrePairs];
    newPairs[index].sn = value;
    setSnCodeBarrePairs(newPairs);
  };

  const handleCodeBarreChange = (index, value) => {
    const newPairs = [...snCodeBarrePairs];
    newPairs[index].codeBarre = value;
    setSnCodeBarrePairs(newPairs);
  };

  const handleMarcheSelect = (row) => {
    console.log('Marché sélectionné:', row);
    setSelectedMarche(row.marcheBC);
    setSelectedMarcheDetails(row);
    setShowMarchePopup(false);
    setShowPrixTable(true);
    
    // Extraire et formater les detailsPrix
    if (row.detailProjet && row.detailProjet.length > 0) {
      const details = row.detailProjet.flatMap(projet => {
        // Si detailsPrix existe et n'est pas vide
        if (projet.detailsPrix && projet.detailsPrix.length > 0) {
          // Mapper chaque detailPrix dans le projet
          return projet.detailsPrix.map(prixDetail => {
            console.log('Traitement du prix:', { projet, prixDetail });
            return {
              codeProduit: prixDetail.reference || '',
              designation: prixDetail.designation || '',
              numeroPrix: projet.numeroPrix || '',
              qtePrevu: projet.quantite || 0,
              qteRecue: prixDetail.quantiteLivree || 0,
              qteARecevoir: (projet.quantite || 0) - (prixDetail.quantiteLivree || 0)
            };
          });
        }
        return [];
      });
      
      console.log('Details extraits:', details);
      setDetailPrixData(details);

      // Si nous sommes en mode navigation, charger l'historique
      if (isNavigationMode && selectedReceptionId) {
        loadReceptionHistory(row.marcheBC, selectedReceptionId);
      }
    } else {
      console.log('Pas de detailProjet ou detailsPrix trouvés');
      setDetailPrixData([]);
    }

    // Ne pas mettre à jour la date avec row.date
    // setSelectedMarketDate(row.date || new Date().toISOString().split('T')[0]);
    setSelectedMarketDescription(row.descriptionProjet || '');
  };

  // Fonction pour charger l'historique des réceptions par ID
  const loadReceptionHistory = async (marcheBC, receptionId) => {
    try {
      console.log('Chargement de l\'historique pour:', { marcheBC, receptionId });
      
      if (!marcheBC || !receptionId) {
        console.error('marcheBC ou receptionId manquant');
        return;
      }

      const response = await axios.get(`http://localhost:5003/api/amarches/${marcheBC}`);
      console.log('Réponse du marché:', response.data);
      
      const marche = response.data;
      
      // Extraire toutes les réceptions avec le même receptionId
      const receptions = marche.detailProjet.flatMap(projet => 
        projet.detailsPrix.flatMap(detail => 
          (detail.receptions || [])
          .filter(reception => reception.receptionId === receptionId)
          .map(reception => ({
            codeProduit: detail.reference,
            designation: detail.designation,
            numeroPrix: projet.numeroPrix,
            qteLivree: reception.quantiteLivree,
            sn: reception.sn,
            codeBarre: reception.codeBarre,
            finGarantie: reception.finGarantie,
            dateReception: reception.dateReception,
            receptionId: reception.receptionId
          }))
        )
      );

      console.log('Réceptions trouvées:', receptions);
      setReceptionsHistory(receptions);
    } catch (error) {
      console.error('Erreur détaillée lors du chargement de l\'historique:', error);
      setInfoMessage('Erreur lors du chargement de l\'historique des réceptions: ' + error.message);
      setShowInfoModal(true);
    }
  };

  // Fonction pour initialiser le mode navigation
  const initNavigationMode = async (marcheBC, receptionId) => {
    try {
      console.log('Initialisation du mode navigation:', { marcheBC, receptionId });
      setIsNavigationMode(true);
      setSelectedReceptionId(receptionId);
      
      // Charger les détails du marché
      const response = await axios.get(`http://localhost:5003/api/amarches/${marcheBC}`);
      const marche = response.data;
      
      // Mettre à jour les états du marché
      setSelectedMarcheDetails(marche);
      setSelectedMarche(marcheBC);
      setSelectedMarketDate(marche.date || new Date().toISOString().split('T')[0]);
      setSelectedMarketDescription(marche.descriptionProjet || '');
      
      // Extraire et formater les detailsPrix
      if (marche.detailProjet && marche.detailProjet.length > 0) {
        const details = marche.detailProjet.flatMap(projet => {
          if (projet.detailsPrix && projet.detailsPrix.length > 0) {
            return projet.detailsPrix.map(prixDetail => ({
              codeProduit: prixDetail.reference || '',
              designation: prixDetail.designation || '',
              numeroPrix: projet.numeroPrix || '',
              qtePrevu: projet.quantite || 0,
              qteRecue: prixDetail.quantiteLivree || 0,
              qteARecevoir: (projet.quantite || 0) - (prixDetail.quantiteLivree || 0)
            }));
          }
          return [];
        });
        
        console.log('Details du marché extraits:', details);
        setDetailPrixData(details);
      }
      
      // Charger l'historique des réceptions
      await loadReceptionHistory(marcheBC, receptionId);
    } catch (error) {
      console.error('Erreur détaillée lors de l\'initialisation:', error);
      setInfoMessage('Erreur lors du chargement des données: ' + error.message);
      setShowInfoModal(true);
    }
  };

  // Ajouter useEffect pour gérer l'initialisation depuis la navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const marcheBC = params.get('marcheBC');
    const receptionId = params.get('receptionId');
    
    console.log('Paramètres URL détectés:', { marcheBC, receptionId });
    
    if (marcheBC && receptionId) {
      initNavigationMode(marcheBC, receptionId);
    }
  }, []);

  const handleReceptionSubmit = async () => {
    try {
      // Vérifier que toutes les données requises sont présentes
      if (!selectedPrix?.codeProduit || !selectedPrix?.designation || !qteRecue || !selectedMarketDate) {
        throw new Error('Données manquantes pour la réception');
      }

      // Vérifier que tous les SN et codes-barres sont remplis
      const hasEmptyFields = snCodeBarrePairs.some(pair => !pair.sn || !pair.codeBarre);
      if (hasEmptyFields) {
        setInfoMessage('Tous les numéros de série et codes-barres doivent être remplis');
        setShowInfoModal(true);
        return;
      }

      const receptionIdToUse = isNavigationMode ? selectedReceptionId : sessionReceptionId;

      // Préparer les données pour la mise à jour des detailsPrix
      const newDetailsPrix = {
        reference: selectedPrix.codeProduit,
        designation: selectedPrix.designation,
        quantiteLivree: parseInt(qteRecue),
        dateReception: selectedMarketDate,
        sn: snCodeBarrePairs.map(pair => pair.sn),
        codeBarre: snCodeBarrePairs.map(pair => pair.codeBarre),
        finGarantie: "",
        memo: document.querySelector('textarea[rows="3"]')?.value || "",
        description: selectedMarketDescription || "",
        receptionId: receptionIdToUse  // Utiliser l'ID approprié selon le mode
      };

      console.log('Tentative de mise à jour des detailsPrix avec:', {
        url: `http://localhost:5003/api/amarches/${selectedMarcheDetails.marcheBC}/detailProjet/${selectedPrix.numeroPrix}/detailsPrix`,
        data: newDetailsPrix
      });

      // Appel API pour mettre à jour les detailsPrix
      const response = await axios.put(
        `http://localhost:5003/api/amarches/${selectedMarcheDetails.marcheBC}/detailProjet/${selectedPrix.numeroPrix}/detailsPrix`,
        newDetailsPrix
      );

      console.log('Réponse de la mise à jour des detailsPrix:', response.data);

      // Ajouter les numéros de série dans la table serialnumbers
      for (const pair of snCodeBarrePairs) {
        const serialNumberData = {
          sn: pair.sn,
          codeBarre: pair.codeBarre,
          codeProduit: selectedPrix.codeProduit,
          marche: selectedMarcheDetails.marcheBC,
          idMarche: selectedMarcheDetails._id,
          numeroPrix: selectedPrix.numeroPrix,
          dateReception: selectedMarketDate,
          finGarantie: "",
          receptionId: receptionIdToUse,  // Utiliser l'ID approprié
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        };

        try {
          const snResponse = await axios.post('http://localhost:5003/api/sn', serialNumberData);
          console.log('Numéro de série ajouté avec succès:', snResponse.data);
        } catch (snError) {
          console.error('Erreur lors de l\'ajout du numéro de série:', snError);
          throw new Error(snError.response?.data?.message || snError.message);
        }
      }

      // Mettre à jour l'interface utilisateur
      const updatedDetailPrixData = detailPrixData.map(prix => {
        if (prix.codeProduit === selectedPrix.codeProduit && prix.numeroPrix === selectedPrix.numeroPrix) {
          const nouvelleQteRecue = (parseInt(prix.qteRecue) || 0) + parseInt(qteRecue);
          return {
            ...prix,
            qteRecue: nouvelleQteRecue,
            qteARecevoir: prix.qtePrevu - nouvelleQteRecue
          };
        }
        return prix;
      });
      setDetailPrixData(updatedDetailPrixData);

      // Ajouter à l'historique des réceptions
      const newReceptions = snCodeBarrePairs.map(pair => ({
        codeProduit: selectedPrix.codeProduit,
        designation: selectedPrix.designation,
        numeroPrix: selectedPrix.numeroPrix,
        qteLivree: qteRecue,
        sn: pair.sn,
        codeBarre: pair.codeBarre,
        finGarantie: "",
        dateReception: selectedMarketDate,
        receptionId: receptionIdToUse  // Utiliser l'ID approprié
      }));

      setReceptionsHistory(prevHistory => [...prevHistory, ...newReceptions]);
      
      setInfoMessage("La réception a été enregistrée avec succès.");
      setShowInfoModal(true);
      setShowReceptionModal(false);
      
      // Réinitialiser les champs seulement après un succès
      setQteRecue('');
      setSnCodeBarrePairs([]);

    } catch (error) {
      console.error('Erreur détaillée lors de l\'enregistrement de la réception:', error);
      setInfoMessage(error.message);
      setShowInfoModal(true);
    }
  };

  // Ajouter un useEffect pour logger les changements d'état importants
  useEffect(() => {
    console.log('État actuel:', {
      isNavigationMode,
      selectedReceptionId,
      selectedMarche,
      selectedMarcheDetails,
      detailPrixData,
      receptionsHistory
    });
  }, [isNavigationMode, selectedReceptionId, selectedMarche, selectedMarcheDetails, detailPrixData, receptionsHistory]);

  // Add this useEffect right after the state declarations
  useEffect(() => {
    // Function to update the date
    const updateDate = () => {
      const today = new Date();
      setSelectedMarketDate(today.toISOString().split('T')[0]);
    };

    // Update date initially
    updateDate();

    // Set up an interval to check and update the date every hour
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      
      // Only update if the date has changed
      if (currentDate !== selectedMarketDate) {
        updateDate();
      }
    }, 3600000); // Check every hour (3600000 ms)

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <React.Fragment>
      <Row>
        <Col sm={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Button id="new-button" variant="success" className="ms-2 action-button" onClick={() => setShowNewConfirmationModal(true)}>
                  <FaPlus className="me-2" /> Nouveau
                </Button>
              </div>
              <div>
                <Button variant="secondary" className="me-2 action-button" onClick={() => { setShowGED(true); setShowForm(false); }}>
                  <FaFileAlt className="me-2" /> GED
                </Button>
                <Button variant="info" className="action-button" onClick={handlePrint}>
                  <FaPrint className="me-2" /> Imprimer
                </Button>
              </div>
            </Card.Header>

            <Card.Body>
              {showForm && (
                <Row>
                <Col md={6}>
                    <div id="form-part-1">
                      <Form.Group className="mb-3">
                        <Form.Label><FaCalendarAlt className="me-2" />Date</Form.Label>
                            <Form.Control type="date" value={selectedMarketDate} onChange={(e) => setSelectedMarketDate(e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><FaClipboardList className="me-2" />Marché</Form.Label>
                        <InputGroup>
                              <Form.Control type="text" value={selectedMarche} readOnly />
                              <Button variant="secondary" className="search-button" onClick={toggleMarchePopup}>
                                <FaSearch />
                              </Button>
                        </InputGroup>
                            {showMarchePopup && (
                              <div className="popup">
                                <Form.Control
                                  type="text"
                                  placeholder="Rechercher..."
                                  value={marcheFilterText}
                                  onChange={(e) => setMarcheFilterText(e.target.value)}
                                  className="mb-2"
                                />
                                {isLoading ? (
                                  <div className="text-center p-3">
                                    <span>Chargement des marchés...</span>
                                  </div>
                                ) : error ? (
                                  <div className="text-center p-3 text-danger">
                                    {error}
                                  </div>
                                ) : (
                                  <Table striped bordered hover size="sm">
                                    <thead>
                                      <tr>
                                        <th>Marché BC</th>
                                        <th>Date</th>
                                        <th>Type Marché</th>
                                        <th>Famille Projet</th>
                                        <th>Intitulé Projet</th>
                                        <th>Demandeur</th>
                                        <th>Fiche Projet</th>
                                        <th>Description Projet</th>
                                        <th>Garantie</th>
                                        <th>Délai Execution</th>
                                        <th>Num AO</th>
                                        <th>JDE</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredMarcheData.map((row, index) => (
                                        <tr key={index} onClick={() => handleMarcheSelect(row)}>
                                          <td>{row.marcheBC}</td>
                                          <td>{row.date}</td>
                                          <td>{row.typeMarche}</td>
                                          <td>{row.familleProjet}</td>
                                          <td>{row.intituleProjet}</td>
                                          <td>{row.demandeur}</td>
                                          <td>{row.ficheProjet}</td>
                                          <td>{row.descriptionProjet}</td>
                                          <td>{row.garantie}</td>
                                          <td>{row.delaiExecution}</td>
                                          <td>{row.numAO}</td>
                                          <td>{row.jde}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                )}
                              </div>
                            )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><FaClipboardList className="me-2" />Description</Form.Label>
                            <Form.Control type="text" value={selectedMarketDescription} onChange={(e) => setSelectedMarketDescription(e.target.value)} />
                      </Form.Group>
                    </div>
                </Col>
                 
                <Col md={6}>

                

                 <Form.Group className="mb-3">
                                    <Form.Label><FaUserTie className="me-2" />Fournisseur</Form.Label>
                                    <InputGroup>
                                      <Form.Control type="text" value={selectedFournisseurNom} readOnly className="form-control-modern" />
                                      <Button variant="secondary" className="search-button" onClick={toggleFournisseurPopup}>
                                        <FaSearch />
                                      </Button>
                                    </InputGroup>
                                    {showFournisseurPopup && (
                                      <div className="popup">
                                        <Form.Control
                                          type="text"
                                          placeholder="Filter..."
                                          value={fournisseurFilterText}
                                          onChange={(e) => setFournisseurFilterText(e.target.value)}
                                          className="mb-2 form-control-modern"
                                        />
                                        <Table striped bordered hover size="sm">
                                          <thead>
                                            <tr>
                                              <th>Code Fournisseur</th>
                                              <th>Nom Fournisseur</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {filteredFournisseurData.map((row, index) => (
                                              <tr 
                                                key={index} 
                                                onClick={() => {
                                                  setSelectedFournisseurRow(index);
                                                  setSelectedFournisseurCode(row.codeFrs);
                                                  setSelectedFournisseurNom(row.NomFrs);
                                                  setShowFournisseurPopup(false);
                                                }}
                                                className={selectedFournisseurRow === index ? 'selected-row' : ''}
                                              >
                                                <td>{row.codeFrs}</td>
                                                <td>{row.NomFrs}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </Table>
                                      </div>
                                    )}
                                  </Form.Group>
                  
                  

                  <Form.Group className="mb-3">
                    <Form.Label>Memo</Form.Label>
                        <Form.Control type="text" as="textarea" rows={3} />
                  </Form.Group>

                </Col>
                
              </Row> 
              )}
              
              {showGED && (
                <div className="ged-container">
                  <Button 
                    variant="link" 
                    className="ged-back-button"
                    onClick={() => { setShowGED(false); setShowForm(true); }}
                  >
                    <FaArrowLeft className="me-2" /> Retour
                  </Button>

                  <div className="text-center">
                    <h3 className="ged-title">
                      <FaFileAlt className="me-2" />
                      Zone GED
                    </h3>
                  </div>

                  <div className="ged-section">
                    <div className="mb-4">
                      <h5 className="ged-subtitle">
                        <FaFile className="me-2" />
                        Documents
                      </h5>
                      
                      <Form>
                        <Form.Group className="mb-4 d-flex align-items-center">
                          <div className="file-upload-container">
                            <FaFileUpload className="me-2 text-primary" size={20} />
                            <Form.Control 
                              type="file" 
                              onChange={handleFileSelectDocuments}
                              className="file-upload-input"
                            />
                          </div>
                          <Button 
                            variant="primary"
                            className="scan-button"
                            onClick={() => setShowSignatureModal(true)}
                          >
                            <FaSignature className="me-2" />
                            Numériser
                          </Button>
                        </Form.Group>
                        </Form>

                      <div className="table-responsive">
                        <Table hover bordered className="ged-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Type File</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fileListDocuments.map((file) => (
                            <tr key={file.id}>
                              <td>{file.fileName}</td>
                              <td>{file.typeFile}</td>
                              <td>{file.date}</td>
                              <td>
                                  <Button 
                                    variant="link" 
                                    className="file-link"
                                    onClick={async () => {
                                      try {
                                        // Faire une requête pour obtenir le fichier
                                        const response = await axios.get(
                                          `http://localhost:5003/api/documents/download/${file.id}`,
                                          { responseType: 'blob' }
                                        );
                                        
                                        // Créer un blob à partir de la réponse
                                        const blob = new Blob([response.data], { 
                                          type: response.headers['content-type'] 
                                        });
                                        
                                        // Créer une URL pour le blob
                                        const url = window.URL.createObjectURL(blob);
                                        
                                        // Créer un élément a pour le téléchargement
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.fileName;
                                        document.body.appendChild(a);
                                        a.click();
                                        
                                        // Nettoyer
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      } catch (error) {
                                        console.error('Erreur lors du téléchargement:', error);
                                        setInfoMessage('Erreur lors du téléchargement du fichier: ' + 
                                          (error.response?.data?.message || error.message));
                                        setShowInfoModal(true);
                                      }
                                    }}
                                  >
                                    <FaDownload className="me-2" />
                                    {file.fileName}
                                  </Button>
                              </td>
                                <td className="text-center">
                                  <Button 
                                    variant="outline-danger"
                                    size="sm"
                                    className="delete-button"
                                    onClick={() => handleRemoveDocuments(file.id)}
                                  >
                                    <FaTrash className="me-1" size={12} />
                                    Supprimer
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="ged-subtitle">
                        <FaFile className="me-2" />
                        BRI
                      </h5>
                      
                      <Form>
                        <Form.Group className="mb-4 d-flex align-items-center">
                          <div className="file-upload-container">
                            <FaFileUpload className="me-2 text-primary" size={20} />
                            <Form.Control 
                              type="file" 
                              onChange={handleFileSelectBRI}
                              className="file-upload-input"
                            />
                          </div>
                        </Form.Group>
                      </Form>

                      <div className="table-responsive">
                        <Table hover bordered className="ged-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Type File</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fileListBRI.map((file) => (
                            <tr key={file.id}>
                              <td>{file.fileName}</td>
                              <td>{file.typeFile}</td>
                              <td>{file.date}</td>
                              <td>
                                  <Button 
                                    variant="link" 
                                    className="file-link"
                                    onClick={async () => {
                                      try {
                                        // Faire une requête pour obtenir le fichier
                                        const response = await axios.get(
                                          `http://localhost:5003/api/documents/bri/download/${file.id}`,
                                          { responseType: 'blob' }
                                        );
                                        
                                        // Créer un blob à partir de la réponse
                                        const blob = new Blob([response.data], { 
                                          type: response.headers['content-type'] 
                                        });
                                        
                                        // Créer une URL pour le blob
                                        const url = window.URL.createObjectURL(blob);
                                        
                                        // Créer un élément a pour le téléchargement
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = file.fileName;
                                        document.body.appendChild(a);
                                        a.click();
                                        
                                        // Nettoyer
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                      } catch (error) {
                                        console.error('Erreur lors du téléchargement:', error);
                                        setInfoMessage('Erreur lors du téléchargement du fichier: ' + 
                                          (error.response?.data?.message || error.message));
                                        setShowInfoModal(true);
                                      }
                                    }}
                                  >
                                    <FaDownload className="me-2" />
                                    {file.fileName}
                                  </Button>
                              </td>
                                <td className="text-center">
                                  <Button 
                                    variant="outline-danger"
                                    size="sm"
                                    className="delete-button"
                                    onClick={() => handleRemoveBRI(file.id)}
                                  >
                                    <FaTrash className="me-1" size={12} />
                                    Supprimer
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </Card.Body>
          </Card>
        </Col>
      </Row>

<Modal show={showPrintModal} onHide={() => setShowPrintModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPrint className="me-2" />
            Confirmation d'impression
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir imprimer ce document ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={confirmPrint}>
            <FaCheck className="me-2" /> Confirmer et imprimer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showValidationModal} onHide={() => setShowValidationModal(false)}>
  <Modal.Header closeButton>
          <Modal.Title>
            <FaCheck className="me-2" />
            Validation
          </Modal.Title>
  </Modal.Header>
  <Modal.Body>
          {validationMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
            <FaTimes className="me-2" /> Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSignatureModal} onHide={() => setShowSignatureModal(false)}>
        <Modal.Header closeButton className="signature-modal-header">
          <Modal.Title>
            <FaSignature className="me-2" />
            Signature
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Titre du document</Form.Label>
            <Form.Control 
              type="text" 
              value={signatureTitle} 
              onChange={(e) => setSignatureTitle(e.target.value)}
              placeholder="Entrez un titre..."
              className="signature-title-input"
            />
    </Form.Group>
          <Form.Label className="fw-bold">Zone de signature</Form.Label>
          <div className="signature-canvas-container">
            <canvas 
              id="signatureCanvas" 
              width="400" 
              height="200" 
              className="signature-canvas"
            />
          </div>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="d-flex align-items-center"
            onClick={() => {
              const canvas = document.getElementById('signatureCanvas');
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }}
          >
            <FaTrash className="me-2" size={12} />
            Effacer
          </Button>
  </Modal.Body>
  <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignatureModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSignatureUpload}
            className="upload-button"
          >
            <FaFileUpload className="me-2" />
            Upload
          </Button>
  </Modal.Footer>
</Modal>

      <Modal show={showNewConfirmationModal} onHide={() => setShowNewConfirmationModal(false)}>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Nouveau formulaire
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir créer un nouveau formulaire ? Toutes les données non enregistrées seront perdues.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewConfirmationModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={handleNew}>
            <FaPlus className="me-2" /> Créer nouveau
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReceptionModal} onHide={() => setShowReceptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBoxOpen className="me-2" />
            Réception des articles
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Code Produit</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedPrix?.codeProduit || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Num Prix</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedPrix?.numeroPrix || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Qte Reçue</Form.Label>
              <Form.Control
                type="number"
                value={qteRecue}
                onChange={handleQteRecueChange}
                min="0"
                step="1"
              />
            </Form.Group>
            
            {snCodeBarrePairs.length > 0 && (
              <Card className="mt-3">
                <Card.Header>
                  <h6 className="mb-0">Détails des articles</h6>
                </Card.Header>
                <Card.Body>
                  {snCodeBarrePairs.map((pair, index) => (
                    <Row key={index} className="mb-2">
                      <Col>
                        <Form.Control
                          type="text"
                          placeholder="SN"
                          value={pair.sn}
                          onChange={(e) => handleSnChange(index, e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          placeholder="Code-barre"
                          value={pair.codeBarre}
                          onChange={(e) => handleCodeBarreChange(index, e.target.value)}
                        />
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceptionModal(false)}>
            <FaTimes className="me-2" /> Annuler
          </Button>
          <Button variant="primary" onClick={handleReceptionSubmit}>
            <FaSave className="me-2" /> Recevoir
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)}>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <FaInfoCircle className="me-2" />
            Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {infoMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            <FaTimes className="me-2" /> Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .card {
            background: white;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-bottom: 0.5rem;
          }

          .card-header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 0.5rem 1rem;
          }

          .card-body {
            padding: 0.75rem;
          }

          .card-header .btn {
            margin: 0 0.25rem;
            padding: 0.25rem 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .form-label {
            color: #495057;
            font-weight: 500;
            margin-bottom: 0.25rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .form-control {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            min-height: 32px;
            transition: border-color 0.15s ease-in-out;
          }

          .form-control:focus {
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .input-group .btn {
            padding: 0.25rem 0.5rem;
            background: #e9ecef;
            border-color: #ced4da;
            color: #495057;
            font-size: 0.875rem;
          }

          .table {
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }

          .table thead th {
            background: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            color: #495057;
            font-weight: 600;
            padding: 0.5rem;
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

          .popup {
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 0.15rem;
            margin-top: 2px;
            max-height: 120px;
            overflow-y: auto;
            width: 500px;
            max-width: 95%;
          }

          .popup .table {
            margin: 0;
            font-size: 0.7rem;
          }

          .popup .table thead th {
            padding: 0.15rem 0.25rem;
            font-size: 0.7rem;
            white-space: nowrap;
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .popup .table tbody td {
            padding: 0.15rem 0.25rem;
            font-size: 0.7rem;
          }

          .popup .table tbody tr:hover {
            background-color: #f8f9fa;
            cursor: pointer;
          }

          .popup .form-control {
            font-size: 0.7rem;
            padding: 0.15rem 0.25rem;
            margin-bottom: 0.15rem;
            height: 24px;
          }

          .modal-content {
            border-radius: 4px;
            overflow: hidden;
          }

          .modal-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
          }

          .modal-title {
            color: white;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .modal-body {
            padding: 0.75rem;
          }

          .modal-footer {
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            padding: 0.5rem 1rem;
          }

          .nav-tabs {
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 0.75rem;
          }

          .nav-tabs .nav-link {
            color: #6c757d;
            padding: 0.5rem 0.75rem;
            border: none;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            font-size: 0.875rem;
          }

          .nav-tabs .nav-link.active {
            color: #007bff;
            border-bottom-color: #007bff;
          }

          .btn-success {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
          }

          .btn-primary {
            background: linear-gradient(45deg, #007bff, #0056b3);
            border: none;
          }

          .btn-secondary {
            background: linear-gradient(45deg, #6c757d, #5a6268);
            border: none;
          }

          .btn-info {
            background: linear-gradient(45deg, #17a2b8, #138496);
            border: none;
          }

          .btn-danger {
            background: linear-gradient(45deg, #dc3545, #c82333);
            border: none;
          }

          .btn {
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
            border-radius: 4px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin-right: 0.5rem;
          }

          .btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          .form-group {
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

          .search-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            padding: 0;
            border-radius: 0 4px 4px 0;
          }

          .delete-button {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }

          .delete-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
          }

          .form-label svg {
            color: #6c757d;
            margin-right: 0.5rem;
          }

          .mb-4 {
            margin-bottom: 0.75rem !important;
          }

          .mb-3 {
            margin-bottom: 0.5rem !important;
          }

          .me-2 {
            margin-right: 0.375rem !important;
          }

          .input-group {
            min-height: 32px;
          }

          .input-group .form-control {
            height: 32px;
          }
        `}
      </style>

      {showDetailTable && (
        <Table striped bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Date</th>
              <th>Marché</th>
              <th>Description</th>
              <th>Fournisseur</th>
              <th>N° Prix</th>
              <th>Référence</th>
              <th>Désignation</th>
              <th>Quantité</th>
            </tr>
          </thead>
          <tbody>
            {detailTableData.map((data, index) => (
              <tr 
                key={index} 
                onDoubleClick={() => {
                  setSelectedDetailRow(index);
                  setNumeroPrix(data.numeroPrix);
                  setSelectedReference(data.selectedReference);
                  setSelectedDesignation(data.selectedDesignation);
                  setSelectedQuantity(data.selectedQuantity);
                  setEditingIndex(index);
                }}
                className={selectedDetailRow === index ? 'selected-row' : ''}
              >
                <td>{data.generatedNumber}</td>
                <td>{data.selectedMarketDate}</td>
                <td>{data.selectedMarketId}</td>
                <td>{data.selectedMarketDescription}</td>
                <td>{data.selectedMarketSupplier}</td>
                <td>{data.numeroPrix}</td>
                <td>{data.selectedReference}</td>
                <td>{data.selectedDesignation}</td>
                <td>{data.selectedQuantity}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showPrixTable && detailPrixData.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">Liste des articles à réceptionner</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Code Produit</th>
                  <th>Désignation</th>
                  <th>Num Prix</th>
                  <th>Qte Prévu</th>
                  <th>Qte à Recevoir</th>
                  <th>Qte Reçue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detailPrixData.map((prix, index) => (
                  <tr key={index}>
                    <td>{prix.codeProduit}</td>
                    <td>{prix.designation}</td>
                    <td>{prix.numeroPrix}</td>
                    <td>{prix.qtePrevu}</td>
                    <td>{prix.qteARecevoir}</td>
                    <td>{prix.qteRecue}</td>
                    <td>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleReception(prix)}
                        disabled={prix.qteARecevoir <= 0}
                      >
                        <FaBoxOpen className="me-2" />
                        Réception
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {receptionsHistory.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">
              <FaHistory className="me-2" />
              Historique des réceptions {isNavigationMode ? `(ID: ${selectedReceptionId})` : `(Session: ${sessionReceptionId})`}
            </h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Code Produit</th>
                  <th>Désignation</th>
                  <th>Num Prix</th>
                  <th>Qte livrée</th>
                  <th>SN</th>
                  <th>Code-barre</th>
                  <th>Date Réception</th>
                  <th>Fin Garantie</th>
                </tr>
              </thead>
              <tbody>
                {receptionsHistory.map((reception, index) => (
                  <tr key={index}>
                    <td>{reception.codeProduit}</td>
                    <td>{reception.designation}</td>
                    <td>{reception.numeroPrix}</td>
                    <td>{reception.qteLivree}</td>
                    <td>{reception.sn}</td>
                    <td>{reception.codeBarre}</td>
                    <td>{reception.dateReception}</td>
                    <td>{reception.finGarantie}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Ajout du contenu imprimable */}
      <div id="printable-content" style={{ display: 'none' }}>
        {receptionsHistory.length > 0 && (
          <PrintableReceptionHistory 
            receptionId={receptionsHistory[0].receptionId}
            receptions={receptionsHistory}
            selectedMarcheDetails={selectedMarcheDetails}
            selectedPrix={selectedPrix}
          />
        )}
      </div>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-content, #printable-content * {
              visibility: visible;
            }
              .print-header {
  margin-bottom: 30px;
  text-align: center;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.print-logo {
  max-width: 150px;
  height: auto;
}


            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print-only {
              display: block !important;
              padding: 20px;
            }
            .print-header {
              margin-bottom: 30px;
            }
            .print-header h2 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .reception-details {
              margin: 20px 0;
            }
            .details-table {
              width: 100%;
              margin-bottom: 20px;
              border-collapse: collapse;
            }
            .details-table th {
              text-align: right;
              padding: 8px 10px;
              width: 15%;
              font-weight: bold;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
            }
            .details-table td {
              text-align: left;
              width: 35%;
              padding: 8px 10px;
              border: 1px solid #dee2e6;
            }
            .prix-header {
              font-size: 18px;
              margin: 15px 0;
              padding: 8px;
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
            }
            .reception-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              page-break-inside: auto;  
            }
            .reception-table th, 
            .reception-table td {
              border: 1px solid #dee2e6;
              padding: 8px;
              text-align: left;
              font-size: 12px;  
              white-space: nowrap;  
            }

            .reception-table tr {
              page-break-inside: avoid;  
              page-break-after: auto;  
            }

            .reception-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              padding: 0 50px;
              page-break-inside: avoid;  
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-box p {
              margin-bottom: 50px;
              font-weight: bold;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 10px;
            }
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
              
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default FormsElements;
