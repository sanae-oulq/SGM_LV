import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Form, Button, InputGroup, Tabs, Tab, DropdownButton, Dropdown, Table, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaDownload, FaInfoCircle, FaTimes, FaCheck, FaClipboardCheck, FaFolderOpen, FaFolder, FaFileAlt, FaFingerprint, FaCalendarAlt, FaFile, FaFileSignature, FaUsers, FaFileUpload, FaSave, FaTag, FaUserTie, FaCertificate, FaUpload, FaPrint, FaClipboardList, FaSearch, FaUser, FaShoppingBag, FaShieldAlt, FaClock, FaBarcode, FaBriefcase, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import './FicheDeProjet.css'; // Importation du fichier CSS de la fiche projet
import { useLocation, useNavigate } from 'react-router-dom';
import ordreServiceService from '../../services/ordreServiceService';
import pvrptService from '../../services/pvrptService';
import factureService from '../../services/factureService';
import attestationConformiteService from '../../services/attestationConformiteService';
import brisService from "services/brisService";
import axios from 'axios';

const FormsElements = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // État pour le marché/BC
  const [marcheBC, setMarcheBC] = useState('');
  

  // États pour les fichiers
  const [selectedFiles, setSelectedFiles] = useState({
    bris: null,
    attestation: null
  });

  // États pour la validation des BRIs
  const [showBrisValidationModal, setShowBrisValidationModal] = useState(false);
  const [brisValidationMessage, setBrisValidationMessage] = useState("");

  // États pour les attestations de conformité
  const [attestations, setAttestations] = useState([]);
  const [attestationMessage, setAttestationMessage] = useState("");
  const [showAttestationModal, setShowAttestationModal] = useState(false);

  // Charger les attestations quand le marcheBC change
  useEffect(() => {
    const loadAttestations = async () => {
      if (marcheBC) {
        try {
          const data = await attestationConformiteService.getByMarcheBC(marcheBC);
          setAttestations(data);
        } catch (error) {
          console.error('Erreur lors du chargement des attestations:', error);
        }
      } else {
        setAttestations([]);
      }
    };

    loadAttestations();
  }, [marcheBC]);

  // Gestion du téléchargement des attestations
  const handleDownloadAttestation = async (id, filename) => {
    try {
      const response = await attestationConformiteService.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setAttestationMessage('Erreur lors du téléchargement du fichier');
      setShowAttestationModal(true);
    }
  };

  {/**marche details prix */}
    const [showMarchePopup, setShowMarchePopup] = useState(false);
    const [selectedMarche, setSelectedMarche] = useState('');
    const [selectedMarcheDetails, setSelectedMarcheDetails] = useState(null);
    const [marcheFilterText, setMarcheFilterText] = useState('');
    
    const [isMarcheDisabled, setIsMarcheDisabled] = useState(false);
    const [marcheArticlesData, setMarcheArticlesData] = useState([]);
    const [filteredMarcheData, setFilteredMarcheData] = useState([]);
    const toggleMarchePopup = () => setShowMarchePopup(!showMarchePopup);
  
    // Mock data for marché
  const marcheData = [
    { 
      numReception: 'REC001',
      marche: 'M001',
      numPrix: 'NP001',
      descprix: 'Description prix 1',
      dateOpe: '2024-03-20',
      fournisseur: 'Fournisseur 1',
      codeProd: 'CP001',
      designation: 'Designation 1',
      qteMarche: '100',
      qteRecept: '50',
      qteRest: '50'
    }
  ];

   // Récupération des données des marchés depuis l'API
  useEffect(() => {
    const fetchMarches = async () => {
      try {
        const response = await fetch('http://localhost:5003/api/amarches');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des marchés');
        }
        const data = await response.json();
        setFilteredMarcheData(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchMarches();
  }, []);

  // Filtrage des données en fonction du texte de recherche
  useEffect(() => {
    const fetchAndFilterMarches = async () => {
      try {
        const response = await fetch('http://localhost:5003/api/amarches');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des marchés');
        }
        const data = await response.json();
        
        if (marcheFilterText.trim() === '') {
          setFilteredMarcheData(data);
        } else {
          const filtered = data.filter(item =>
            Object.values(item).some(val =>
              String(val).toLowerCase().includes(marcheFilterText.toLowerCase())
            )
          );
          setFilteredMarcheData(filtered);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchAndFilterMarches();
  }, [marcheFilterText]);

  const [factureList, setFactureList] = useState([]);
  const [showAddFactureModal, setShowAddFactureModal] = useState(false);
  const [showEditFactureModal, setShowEditFactureModal] = useState(false);
  const [showDeleteFactureModal, setShowDeleteFactureModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);

  const [factureFormData, setFactureFormData] = useState({
    idAutoGenere: Date.now(),
    numFacture: "",
    dateFacture: "",
    montant: "",
    fichier: null,
    bl: "",
  });

  const [factureValidationMessage, setFactureValidationMessage] = useState('');
  const [showFactureValidationModal, setShowFactureValidationModal] = useState(false);
  const factureTableRef = React.useRef(null);

  // Charger la liste des factures au montage du composant
  useEffect(() => {
    const loadFactures = async () => {
      try {
        const factures = await factureService.getAll();
        setFactureList(factures);
      } catch (error) {
        console.error('Erreur lors du chargement des factures:', error);
        setFactureValidationMessage("Erreur lors du chargement des factures.");
        setShowFactureValidationModal(true);
      }
    };
    loadFactures();
  }, []);

  const handleFactureFileDownloadClick = async (facture) => {
    try {
      const response = await factureService.downloadFile(facture.numFacture);
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire l'extension du type de fichier de la réponse
      const contentType = response.headers['content-type'];
      const extension = contentType ? `.${contentType.split('/').pop()}` : '';
      
      // Définir le nom du fichier
      link.setAttribute('download', `facture_${facture.numFacture}${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      if (error.response && error.response.status === 404) {
        setFactureValidationMessage("Le fichier n'existe pas ou a été supprimé.");
      } else {
        setFactureValidationMessage("Une erreur est survenue lors du téléchargement du fichier.");
      }
      setShowFactureValidationModal(true);
    }
  };
  

  const handleFactureChange = (e) => {
    const { name, value } = e.target;
    setFactureFormData((prevFactureData) => ({
      ...prevFactureData,
      [name]: value,
    }));
  };

  const handleFactureFileChange = (e) => {
    const file = e.target.files[0];
    setFactureFormData((prevFactureData) => ({
      ...prevFactureData,
      fichier: file,
    }));
  };

  const handleAddFacture = () => {
    setSelectedFacture(null); // Désélectionner la ligne en cours avant d'ajouter
    setShowAddFactureModal(true);
    setFactureFormData({ 
      idAutoGenere: Date.now(), 
      numFacture: "", 
      dateFacture: new Date().toISOString().split('T')[0], 
      montant: "", 
      fichier: null, 
      bl: "" 
    });
  };

  const handleSaveFacture = async () => {
    if (!marcheBC) {
      setFactureValidationMessage("Veuillez d'abord saisir un marché dans le champ Marché/BC");
      setShowFactureValidationModal(true);
      return;
    }

    if (!factureFormData.numFacture || !factureFormData.dateFacture || !factureFormData.montant || !factureFormData.bl) {
      setFactureValidationMessage("Tous les champs doivent être remplis.");
      setShowFactureValidationModal(true);
      return;
    }

    try {
      const factureData = {
        ...factureFormData,
        marcheBC: marcheBC,
        document: factureFormData.fichier
      };

      if (selectedFacture) {
        await factureService.update(selectedFacture.numFacture, factureData);
        setFactureValidationMessage("Facture modifiée avec succès.");
      } else {
        await factureService.create(factureData);
        setFactureValidationMessage("Facture ajoutée avec succès.");
      }

      setShowFactureValidationModal(true);
      setShowAddFactureModal(false);
      setShowEditFactureModal(false);
      setSelectedFacture(null);
      
      // Rafraîchir la liste des factures
      const updatedFactures = await factureService.getAll();
      setFactureList(updatedFactures);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la facture:', error);
      setFactureValidationMessage("Erreur lors de la sauvegarde de la facture.");
      setShowFactureValidationModal(true);
    }
  };

  const handleEditFacture = () => {
    if (selectedFacture) {
      setFactureFormData(selectedFacture);
      setShowEditFactureModal(true);
    } else {
      setFactureValidationMessage("Veuillez sélectionner une ligne à modifier.");
      setShowFactureValidationModal(true);
    }
  };

  const handleDeleteFacture = () => {
    if (selectedFacture) {
      setShowDeleteFactureModal(true);
    } else {
      setFactureValidationMessage("Veuillez sélectionner une ligne à supprimer.");
      setShowFactureValidationModal(true);
    }
  };

  const confirmFactureDelete = async () => {
    try {
      await factureService.delete(selectedFacture.numFacture);
      
      // Rafraîchir la liste des factures
      const updatedFactures = await factureService.getAll();
      setFactureList(updatedFactures);
      
      setFactureValidationMessage("Facture supprimée avec succès.");
      setShowFactureValidationModal(true);
      setSelectedFacture(null);
      setShowDeleteFactureModal(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      setFactureValidationMessage("Erreur lors de la suppression de la facture.");
      setShowFactureValidationModal(true);
    }
  };

  {/**nv facture */}

  // Charger les PVRPTs au démarrage
useEffect(() => {
  const loadPvrpts = async () => {
    try {
      const pvrpts = await pvrptService.getAll();
      setPvList(pvrpts);
    } catch (error) {
      console.error('Erreur lors du chargement des PVRPTs:', error);
      setValidationMessage("Erreur lors du chargement des PVRPTs.");
      setShowValidationModal(true);
    }
  };
  loadPvrpts();
}, []);

  const [pvrTechniqueList, setPvrTechniqueList] = useState([]);
  const [showAddPvrModal, setShowAddPvrModal] = useState(false);
  const [showEditPvrModal, setShowEditPvrModal] = useState(false);
  const [showDeletePvrModal, setShowDeletePvrModal] = useState(false);
  const [selectedPvrTechnique, setSelectedPvrTechnique] = useState(null);

  const [pvrTechniqueFormData, setPvrTechniqueFormData] = useState({
    idAutoGenere: Date.now(),
    numeroPvr: "",
    datePvr: "",
    fichier: null,
    bl: "",
    avecReserve: false,
  });

  const handlePvrTechniqueChange = (e) => {
    const { name, value } = e.target;
    setPvrTechniqueFormData((prevPvrData) => ({
      ...prevPvrData,
      [name]: value,
    }));
  };

  const handlePvrTechniqueFileChange = (e) => {
    const file = e.target.files[0];
    setPvrTechniqueFormData((prevPvrData) => ({
      ...prevPvrData,
      fichier: file,
    }));
  };

  const handleAddPvr = () => {
    setShowAddPvrModal(true);
    setPvrTechniqueFormData({ idAutoGenere: Date.now(), numeroPvr: "", datePvr: "", fichier: null, bl: "", avecReserve: false });
  };

  const handleSavePvr = () => {
    if (!pvrTechniqueFormData.numeroPvr || !pvrTechniqueFormData.datePvr || !pvrTechniqueFormData.bl) {
      alert("Tous les champs doivent être remplis.");
      return;
    }

    if (selectedPvrTechnique) {
      setPvrTechniqueList((prevList) =>
        prevList.map((pvrTechnique) =>
          pvrTechnique === selectedPvrTechnique ? { ...pvrTechniqueFormData, fichier: pvrTechniqueFormData.fichier ? pvrTechniqueFormData.fichier.name : "Aucun" } : pvrTechnique
        )
      );
    } else {
      setPvrTechniqueList([...pvrTechniqueList, { ...pvrTechniqueFormData, fichier: pvrTechniqueFormData.fichier ? pvrTechniqueFormData.fichier.name : "Aucun" }]);
    }

    setShowAddPvrModal(false);
    setShowEditPvrModal(false);
    setSelectedPvrTechnique(null);
  };

  const handleEditPvr = () => {
    if (selectedPvrTechnique) {
      setPvrTechniqueFormData(selectedPvrTechnique);
      setShowEditPvrModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à modifier.");
    }
  };

  const handleDeletePvr = () => {
    if (selectedPvrTechnique) {
      setShowDeletePvrModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à supprimer.");
    }
  };

  const confirmPvrDelete = () => {
    setPvrTechniqueList(pvrTechniqueList.filter((pvrTechnique) => pvrTechnique !== selectedPvrTechnique));
    setSelectedPvrTechnique(null);
    setShowDeletePvrModal(false);
  };

{/**nv pvrpt */}

  const [ordreServiceList, setOrdreServiceList] = useState([]);
  const [showAddOrdreServiceModal, setShowAddOrdreServiceModal] = useState(false);
  const [showEditOrdreServiceModal, setShowEditOrdreServiceModal] = useState(false);
  const [showDeleteOrdreServiceModal, setShowDeleteOrdreServiceModal] = useState(false);
  const [selectedOrdreService, setSelectedOrdreService] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const ordreServiceTableRef = React.useRef(null);

  const [ordreServiceFormData, setOrdreServiceFormData] = useState({
    idAutoGenere: Date.now(),
    numeroOrdreService: "",
    dateOrdreService: "",
    typeOs: "Premier OS",
    fichier: null,
  });

  const handleOrdreServiceChange = (e) => {
    const { name, value } = e.target;
    setOrdreServiceFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    if (name === 'marcheBC') {
        setMarcheBC(value);
    }
    
  };

  const handleOrdreServiceFileChange = (e) => {
    const file = e.target.files[0];
    setOrdreServiceFormData((prevFormData) => ({
      ...prevFormData,
      fichier: file,
    }));
  };

  const handleAddOrdreService = () => {
    setSelectedOrdreService(null);
    setShowAddOrdreServiceModal(true);
    setOrdreServiceFormData({ 
      idAutoGenere: Date.now(), 
      numeroOrdreService: "", 
      dateOrdreService: new Date().toISOString().split('T')[0], 
      typeOs: "Premier OS",
      fichier: null 
    });
  };

  // Charger les ordres de service au chargement du composant
  useEffect(() => {
    const fetchOrdreServices = async () => {
      try {
      const data = await ordreServiceService.getAll();
      console.log('Données reçues du serveur:', data);

      // Filtrer les données par marcheBC si présent
      const filteredData = marcheBC ? data.filter(item => item.marcheBC === marcheBC) : [];

      const formattedList = filteredData.map(item => {
          console.log('Item en cours de traitement:', item);
          console.log('Fichier de l\'item:', item.fichier);

          // Extraire le nom du fichier
          let fileName = "Aucun";
          if (item.fichier) {
            if (typeof item.fichier === 'string') {
              fileName = item.fichier;
            } else if (item.fichier.originalname) {
              fileName = item.fichier.originalname;
            } else if (item.fichier.filename) {
              fileName = item.fichier.filename;
            }
          }

          return {
            idAutoGenere: item._id,
            numeroOrdreService: item.numeroOS,
            dateOrdreService: item.dateOS,
            typeOs: item.typeOS,
            originalFileName: fileName,
            fichierComplet: item.fichier, // Garder l'objet fichier complet
            fichier: fileName !== "Aucun" ? (
              <span 
                style={{ 
                  cursor: 'pointer', 
                  color: '#0066cc',
                  textDecoration: 'underline'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileDownload({
                    numeroOrdreService: item.numeroOS,
                    fichier: item.fichier, // Passer l'objet fichier complet
                    originalFileName: fileName
                  });
                }}
              >
                {fileName}
              </span>
            ) : "Aucun"
          };
        });
        
        setOrdreServiceList(formattedList);
      } catch (error) {
        console.error('Erreur lors du chargement des ordres de service:', error);
        setValidationMessage("Erreur lors du chargement des ordres de service");
        setShowValidationModal(true);
      }
    };
    fetchOrdreServices();
  }, [marcheBC]); // Ajout de marcheBC comme dépendance

  const handleFileDownload = async (item) => {
    console.log('handleFileDownload - item complet:', item);

    if (!item || !item.numeroOrdreService) {
      console.error('Données de téléchargement invalides:', item);
      setValidationMessage("Impossible de télécharger le fichier : informations manquantes");
      setShowValidationModal(true);
      return;
    }

    try {
      const response = await ordreServiceService.downloadFile(item.numeroOrdreService);
      
      // Vérifier si la réponse est un blob
      if (!(response.data instanceof Blob)) {
        throw new Error('La réponse n\'est pas un blob');
      }

      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      
      // Récupérer le nom du fichier depuis l'en-tête Content-Disposition
      let fileName = '';
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
          // Décoder le nom du fichier
          try {
            fileName = decodeURIComponent(fileName);
          } catch (e) {
            console.warn('Erreur lors du décodage du nom de fichier:', e);
          }
        }
      }

      // Si pas de nom dans l'en-tête, utiliser le nom original
      if (!fileName && item.fichier) {
        if (typeof item.fichier === 'string') {
          fileName = item.fichier;
        } else if (item.fichier.originalname) {
          fileName = item.fichier.originalname;
        }
      }

      // Fallback si toujours pas de nom
      if (!fileName) {
        fileName = `ordre_service_${item.numeroOrdreService}${getFileExtension(response.data.type)}`;
      }

      console.log('Nom final du fichier:', fileName);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setValidationMessage("Cet ordre de servise n'a pas de fichier associé.");
      setShowValidationModal(true);
    }
  };

  // Fonction utilitaire pour obtenir l'extension de fichier basée sur le type MIME
  const getFileExtension = (mimeType) => {
    const mimeToExt = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
    };
    return mimeToExt[mimeType] || '';
  };

  const handleSaveOrdreService = async () => {
    if (!ordreServiceFormData.numeroOrdreService || !ordreServiceFormData.dateOrdreService || !ordreServiceFormData.typeOs) {
      setValidationMessage("Tous les champs doivent être remplis.");
      setShowValidationModal(true);
      return;
    }

    try {
      // Préparation des données en incluant marcheBC existant
      const formDataToSend = {
        ...ordreServiceFormData,
        marcheBC: marcheBC  // Ajout du marcheBC existant
      };
     

      let savedOrderService;
      if (showEditOrdreServiceModal) {
        savedOrderService = await ordreServiceService.update(
          selectedOrdreService.numeroOrdreService,
          formDataToSend
        );
        setValidationMessage("Ordre de service modifié avec succès.");
      } else {
        savedOrderService = await ordreServiceService.create(formDataToSend);  // Utilisation de formDataToSend
        setValidationMessage("Ordre de service ajouté avec succès.");
      }

      const updatedList = await ordreServiceService.getAll();
// Filtrer par marcheBC
const filteredList = marcheBC ? updatedList.filter(item => item.marcheBC === marcheBC) : [];
const formattedList = filteredList.map(item => ({
        idAutoGenere: item._id,
        numeroOrdreService: item.numeroOS,
        dateOrdreService: item.dateOS,
        typeOs: item.typeOS,
        marcheBC: item.marcheBC,
        fichier: item.fichier && item.fichier.filename ? (
          <span 
            style={{ 
              cursor: 'pointer', 
              color: '#0066cc',
              textDecoration: 'underline'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleFileDownload(item);
            }}
          >
            {item.fichier.originalname || item.fichier.filename}
          </span>
        ) : "Aucun"
      }));

      setOrdreServiceList(formattedList);
      setShowValidationModal(true);
      setShowAddOrdreServiceModal(false);
      setShowEditOrdreServiceModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      setValidationMessage(error.response?.data?.message || "Une erreur est survenue");
      setShowValidationModal(true);
    }
  };

  const handleEditOrdreService = () => {
    if (selectedOrdreService) {
      setOrdreServiceFormData(selectedOrdreService);
      setShowEditOrdreServiceModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à modifier.");
      setShowValidationModal(true);
    }
  };

  const handleDeleteOrdreService = () => {
    if (selectedOrdreService) {
      setShowDeleteOrdreServiceModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à supprimer.");
      setShowValidationModal(true);
    }
  };

  const confirmOrdreServiceDelete = async () => {
    try {
      await ordreServiceService.delete(selectedOrdreService.numeroOrdreService);
      
      const updatedList = await ordreServiceService.getAll();
      const formattedList = updatedList.map(item => ({
        idAutoGenere: item._id,
        numeroOrdreService: item.numeroOS,
        dateOrdreService: item.dateOS,
        typeOs: item.typeOS,
        fichier: item.fichier && item.fichier.filename ? (
          <span 
            style={{ 
              cursor: 'pointer', 
              color: '#0066cc',
              textDecoration: 'underline'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleFileDownload(item);
            }}
          >
            {item.fichier.originalname || item.fichier.filename}
          </span>
        ) : "Aucun"
      }));

      setOrdreServiceList(formattedList);
      setSelectedOrdreService(null);
      setShowDeleteOrdreServiceModal(false);
      setValidationMessage("Ordre de service supprimé avec succès.");
      setShowValidationModal(true);
    } catch (error) {
      console.error('Erreur:', error);
      setValidationMessage(error.response?.data?.message || "Une erreur est survenue lors de la suppression");
      setShowValidationModal(true);
    }
  };

  {/**ordre de service  */}

  // Charger les BRIs au démarrage
useEffect(() => {
  const loadBRIs = async () => {
    try {
      const response = await axios.get('http://localhost:5003/api/bri');
      // Transformer les données pour correspondre exactement au format de handleFileSelectBRIs
      const formattedBris = response.data.map(bri => ({
        id: bri._id,
        fileName: bri.originalname,
        date: new Date(bri.createdAt).toLocaleDateString(),
        fileData: bri,  // Garder l'objet complet pour le téléchargement
        marcheBC: bri.marcheBC
      }));
      
      // Fusionner avec les BRIs existants au lieu de remplacer
      setFileListBRIs(prevBris => {
        const existingIds = prevBris.map(b => b.id);
        const newBris = formattedBris.filter(b => !existingIds.includes(b.id));
        return [...prevBris, ...newBris];
      });
    } catch (error) {
      console.error('Erreur lors du chargement des BRIs:', error);
    }
  };
  loadBRIs();
}, []);

  const [fileListBRIs, setFileListBRIs] = useState([]);
  const [showDeleteBRIModal, setShowDeleteBRIModal] = useState(false);
  const [briToDelete, setBriToDelete] = useState(null);

  // Gérer la sélection de fichier
  const handleFileSelectBRIs = (e) => {
    if (!marcheBC) {
      setBrisValidationMessage("Veuillez d'abord saisir un marché dans le champ Marché/BC");
      setShowBrisValidationModal(true);
      e.target.value = ''; // Reset the file input
      return;
    }
    setSelectedFiles(prev => ({ ...prev, bris: e.target.files[0] }));
  };

  // Télécharger un fichier
  const handleDownloadBRIs = async (fileEntry) => {
    try {
      if (fileEntry.file) {
        // Cas d'un fichier nouvellement uploadé
    const url = URL.createObjectURL(fileEntry.file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileEntry.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
      } else if (fileEntry.fileData && fileEntry.fileData._id) {
        // Cas d'un fichier provenant de la base de données
        const response = await axios.get(`http://localhost:5003/api/bri/${fileEntry.fileData._id}/download`, {
          responseType: 'blob'
        });
        
        const url = URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileEntry.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error("Format de fichier non valide");
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setBrisValidationMessage("Erreur lors du téléchargement du fichier");
      setShowBrisValidationModal(true);
    }
  };

  // Ajouter un fichier au tableau
  const handleUploadBRIs = () => {
    if (!marcheBC) {
      setBrisValidationMessage("Veuillez d'abord saisir un marché dans le champ Marché/BC");
      setShowBrisValidationModal(true);
      return;
    }
  
    if (!selectedFiles.bris) {
      setBrisValidationMessage("Veuillez sélectionner un fichier !");
      setShowBrisValidationModal(true);
      return;
    }

    // Log pour le débogage
    console.log('Fichier sélectionné:', selectedFiles.bris);
  
    const newFileEntry = {
      id: fileListBRIs.length + 1,
      fileName: selectedFiles.bris.name,
      date: new Date().toLocaleDateString(),
      file: selectedFiles.bris,
      marcheBC: marcheBC,
      uploaded: false // Marquer comme non uploadé initialement
    };

    // Log pour le débogage
    console.log('Nouveau fichier ajouté:', newFileEntry);
  
    setFileListBRIs([...fileListBRIs, newFileEntry]);
    setSelectedFiles(prev => ({ ...prev, bris: null }));
  };

  // Supprimer un fichier du tableau et de la base de données
  const handleRemoveBRIs = async (id) => {
    const fileToDelete = fileListBRIs.find(file => file.id === id);
    if (fileToDelete) {
      setBriToDelete(fileToDelete);
      setShowDeleteBRIModal(true);
    }
  };

  const confirmBRIDelete = async () => {
    try {
      if (!briToDelete || !marcheBC) {
        setBrisValidationMessage("Informations manquantes pour la suppression");
        setShowBrisValidationModal(true);
        return;
      }

      console.log('Tentative de suppression:', {
        marcheBC: marcheBC,
        fileName: briToDelete.fileName
      });

      const response = await fetch(`http://localhost:5003/api/bris/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          marcheBC: marcheBC,
          fileName: briToDelete.fileName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression du BRI');
      }

      // Si la suppression est réussie, mettre à jour l'interface
      setFileListBRIs(fileListBRIs.filter((file) => 
        !(file.marcheBC === marcheBC && file.fileName === briToDelete.fileName)
      ));
      setBrisValidationMessage("BRI supprimé avec succès");
      setShowBrisValidationModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setBrisValidationMessage(error.message || "Erreur lors de la suppression du BRI. Veuillez réessayer.");
      setShowBrisValidationModal(true);
    } finally {
      setShowDeleteBRIModal(false);
      setBriToDelete(null);
    }
  };

  const handleSaveBRIs = async () => {
    if (!marcheBC) {
        setBrisValidationMessage("⚠️ Veuillez d'abord saisir un marché dans le champ Marché/BC");
      setShowBrisValidationModal(true);
      return;
    }
  
      // Filtrer pour n'avoir que les fichiers du marché courant qui n'ont pas encore été uploadés
      const filesToUpload = fileListBRIs.filter(file => 
        file.marcheBC === marcheBC && file.file && !file.uploaded
      );

      if (filesToUpload.length === 0) {
        setBrisValidationMessage("ℹ️ Aucun nouveau fichier à enregistrer pour ce marché");
      setShowBrisValidationModal(true);
      return;
    }

    try {
        // Récupérer les détails du marché
      const response = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
      if (!response.ok) {
          throw new Error('❌ Marché non trouvé');
      }
      const marcheDetails = await response.json();
      
      if (!marcheDetails || !marcheDetails._id) {
          throw new Error('❌ Détails du marché invalides');
      }

        // Garder une trace des fichiers traités
      const successfulFiles = [];
        const skippedFiles = [];
      const failedFiles = [];

        // Traiter chaque fichier
        for (const fileEntry of filesToUpload) {
        try {
          // Vérifier si le fichier existe déjà
          const checkResponse = await fetch(`http://localhost:5003/api/bris/check?marcheBC=${marcheBC}&filename=${encodeURIComponent(fileEntry.fileName)}`);
          const checkResult = await checkResponse.json();

          if (checkResult.exists) {
              skippedFiles.push(fileEntry.fileName);
            continue;
          }

          const formData = new FormData();
          formData.append('file', fileEntry.file);
          formData.append('marcheBC', marcheBC);
          formData.append('marcheRef', marcheDetails._id);

            const uploadResponse = await fetch('http://localhost:5003/api/bris', {
            method: 'POST',
            body: formData
          });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              console.error('Erreur upload:', errorData);
            failedFiles.push(fileEntry.fileName);
          } else {
            successfulFiles.push(fileEntry.fileName);
              // Marquer le fichier comme uploadé
              fileEntry.uploaded = true;
          }
        } catch (fileError) {
            console.error("Erreur fichier:", fileError);
          failedFiles.push(fileEntry.fileName);
        }
      }

        // Construire le message de résultat
        const messages = [];
        
      if (successfulFiles.length > 0) {
          messages.push(`✅ ${successfulFiles.length} nouveau(x) fichier(s) ajouté(s) avec succès :\n${successfulFiles.map(f => `   • ${f}`).join('\n')}`);
      }
        
        if (skippedFiles.length > 0) {
          messages.push(`ℹ️ ${skippedFiles.length} fichier(s) déjà existant(s) ignoré(s) :\n${skippedFiles.map(f => `   • ${f}`).join('\n')}`);
        }
        
      if (failedFiles.length > 0) {
          messages.push(`❌ ${failedFiles.length} fichier(s) non ajouté(s) :\n${failedFiles.map(f => `   • ${f}`).join('\n')}`);
      }

        setBrisValidationMessage(messages.join('\n\n'));
      setShowBrisValidationModal(true);

        // Rafraîchir la liste des fichiers depuis le serveur
        if (successfulFiles.length > 0) {
          try {
            const reloadResponse = await fetch(`http://localhost:5003/api/bris/marche/${marcheBC}`);
            if (!reloadResponse.ok) {
              throw new Error('Erreur lors du rechargement des fichiers');
            }
            const reloadedFiles = await reloadResponse.json();
            
            // Convertir les fichiers rechargés au format attendu
            const formattedFiles = reloadedFiles.map(file => ({
              id: file._id,
              fileName: file.originalname,
              date: new Date(file.createdAt).toLocaleDateString(),
              marcheBC: file.marcheBC,
              fileData: file,
              uploaded: true
            }));

            // Mettre à jour la liste en conservant les fichiers des autres marchés
            setFileListBRIs(prevList => {
              const otherFiles = prevList.filter(file => file.marcheBC !== marcheBC);
              return [...otherFiles, ...formattedFiles];
            });
          } catch (error) {
            console.error('Erreur lors du rechargement des fichiers:', error);
          }
      }
    } catch (error) {
      console.error("Erreur détaillée lors de l'enregistrement des fichiers:", error);
      setBrisValidationMessage(error.message || "Erreur lors de l'enregistrement des fichiers. Veuillez réessayer.");
      setShowBrisValidationModal(true);
    }
  };

  {/**BRIs */}

  // Gestion de la sélection de fichier
  const handleFileSelect = (e) => {
    setSelectedFiles(prev => ({ ...prev, attestation: e.target.files[0] })); // Stocke le fichier sélectionné
  };

  // Gestion de la validation et de l'upload
  const handleValidate = async () => {
    if (!marcheBC) {
      setAttestationMessage("Veuillez d'abord saisir un marché dans le champ MarcheBC");
      setShowAttestationModal(true);
      return;
    }

    if (!selectedFiles.attestation) {
      setAttestationMessage("Veuillez sélectionner un fichier avant de valider.");
      setShowAttestationModal(true);
      return;
    }

    try {
      const response = await attestationConformiteService.upload(selectedFiles.attestation, marcheBC);
      console.log("Attestation uploadée:", response);
      
      setAttestationMessage("Attestation de conformité uploadée avec succès !");
      setShowAttestationModal(true);
      
      // Réinitialisation après validation
      setSelectedFiles(prev => ({ ...prev, attestation: null }));

      // Recharger la liste des attestations
      const data = await attestationConformiteService.getByMarcheBC(marcheBC);
      setAttestations(data);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      let errorMessage = "Erreur lors de l'upload de l'attestation.";
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = "Le marché spécifié n'existe pas.";
            break;
          case 400:
            errorMessage = error.response.data.message || "Données invalides.";
            break;
          default:
            errorMessage += " Veuillez réessayer.";
        }
      }
      
      setAttestationMessage(errorMessage);
      setShowAttestationModal(true);
    }
  };

  {/**Attestation de conformite */}

 // États pour le formulaire PV Provisoire
 const [pvpFormData, setPvpFormData] = useState({
  id: "1",
  date: "",
  ficheProjet: null,
  marcheBCType: "marche",
  marcheBC: "" // On garde uniquement marcheBC
});

// États pour le formulaire PV Définitif
const [pvdFormData, setPvdFormData] = useState({
  id: "2",
  date: "",
  ficheProjet: null,
  marcheBCType: "marche",
  marcheBC: "" // On garde uniquement marcheBC
});

// Gestion du changement de fichier pour PV Provisoire
const handlePVPFileChange = (e) => {
  setPvpFormData((prevData) => ({
    ...prevData,
    ficheProjet: e.target.files[0],
  }));
};

// Gestion du changement de fichier pour PV Définitif
const handlePVDFileChange = (e) => {
  setPvdFormData((prevData) => ({
    ...prevData,
    ficheProjet: e.target.files[0],
  }));
};

// Gestion du changement pour PV Provisoire
const handlePVPChange = (e) => {
  const { name, value } = e.target;
  setPvpFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

// Gestion spécifique du type Marché/BC pour PV Provisoire
const handlePVPMarcheBCChange = (e) => {
  setPvpFormData(prevData => ({
    ...prevData,
    marcheBCType: e.target.value
  }));
};

// Gestion du changement pour PV Définitif
const handlePVDChange = (e) => {
  const { name, value } = e.target;
  setPvdFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

// Gestion spécifique du type Marché/BC pour PV Définitif
const handlePVDMarcheBCChange = (e) => {
  setPvdFormData(prevData => ({
    ...prevData,
    marcheBCType: e.target.value
  }));
};

// Gestion de la soumission du formulaire PV Provisoire
const handlePVPSubmit = async () => {
  try {
    // Vérifier si un marché est saisi
    if (!marcheBC) {
      alert('Veuillez d\'abord saisir un marché dans le champ MarcheBC');
      return;
    }

    if (pvpFormData.date && pvpFormData.ficheProjet) {
      // Créer un objet FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('date', pvpFormData.date);
      formData.append('marcheBC', marcheBC);
      formData.append('marcheBCType', pvpFormData.marcheBCType);
      formData.append('ficheProjet', pvpFormData.ficheProjet);

      // Appel API pour sauvegarder le PV provisoire
      const response = await fetch('http://localhost:5003/api/pv/provisoire', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du PV provisoire');
      }

      const result = await response.json();
      console.log("PV provisoire sauvegardé:", result);

      alert("PV de réception provisoire enregistré avec succès !");

      // Réinitialisation du formulaire
      setPvpFormData({
        id: "1",
        date: "",
        ficheProjet: null,
        marcheBCType: "marche",
        marcheBC: ""
      });
    } else {
      alert("Tous les champs du PV de réception provisoire doivent être remplis.");
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du PV provisoire:", error);
    alert("Erreur lors de la sauvegarde du PV provisoire: " + error.message);
  }
};

// Gestion de la soumission du formulaire PV Définitif
const handlePVDSubmit = async () => {
  try {
    // Vérifier si un marché est saisi
    if (!marcheBC) {
      alert('Veuillez d\'abord saisir un marché dans le champ MarcheBC');
      return;
    }

    if (pvdFormData.date && pvdFormData.ficheProjet) {
      // Créer un objet FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('date', pvdFormData.date);
      formData.append('marcheBC', marcheBC);
      formData.append('marcheBCType', pvdFormData.marcheBCType);
      formData.append('ficheProjet', pvdFormData.ficheProjet);

      // Appel API pour sauvegarder le PV définitif
      const response = await fetch('http://localhost:5003/api/pv/definitif', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du PV définitif');
      }

      const result = await response.json();
      console.log("PV définitif sauvegardé:", result);

      alert("PV de réception définitive enregistré avec succès !");

      // Réinitialisation du formulaire
      setPvdFormData({
        id: "2",
        date: "",
        ficheProjet: null,
        marcheBCType: "marche",
        marcheBC: ""
      });
    } else {
      alert("Tous les champs du PV de réception définitive doivent être remplis.");
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du PV définitif:", error);
    alert("Erreur lors de la sauvegarde du PV définitif: " + error.message);
  }
};
  {/**pv */}

  const [fichesFormData, setFichesFormData] = useState({
    intituleProjet: "",
    dateProjet: "",
    chefProjet: "",
    commission: "",
    ficheProjet: null,
    ficheAffectation: null,
  });

  // Gérer les changements dans les champs du formulaire
  const handleFichesChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      // Si c'est un champ de fichier, on stocke le fichier sélectionné
      setFichesFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // On prend le premier fichier téléchargé
      }));
    } else {
      // Pour les autres champs, on met à jour directement la valeur
      setFichesFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Fonction pour valider et soumettre le formulaire
  const handleFichesSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si un marché est saisi
    if (!marcheBC) {
      alert('Veuillez d\'abord saisir un marché dans le champ MarcheBC');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('marcheBC', marcheBC);
      formData.append('intituleProjet', fichesFormData.intituleProjet);
      formData.append('dateProjet', fichesFormData.dateProjet);
      formData.append('chefProjet', fichesFormData.chefProjet);
      formData.append('commission', fichesFormData.commission);
      formData.append('ficheProjet', fichesFormData.ficheProjet);
      formData.append('ficheAffectation', fichesFormData.ficheAffectation);

      const response = await fetch('http://localhost:5003/api/fiches', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde de la fiche');
      }

      const data = await response.json();
      console.log('Fiche sauvegardée:', data);
      alert('Fiche sauvegardée avec succès');
      
      // Réinitialiser le formulaire
      setFichesFormData({
        intituleProjet: '',
        dateProjet: '',
        chefProjet: '',
        commission: '',
        ficheProjet: null,
        ficheAffectation: null
      });
      
      // Fermer le popup
      setShowFicheProjetPopup(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  };
  

  {/**fiches */}
  
{/** 
  // Gérer le changement des inputs pour la facture
  const handleFactureChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFactureFormData((previousFactureData) => ({
      ...previousFactureData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
*/}
  {/**
    // Gérer le changement du fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // On prend le premier fichier téléchargé
    setFactureFormData((previousFactureData) => ({
      ...previousFactureData,
      document: file,
    }));
  };
    
    */}
{/**
  // Ajouter une facture
  const handleAddFacture = () => {
    setShowAddFactureModal(true);
  };
 */}
  // Valider l'ajout ou la modification d'une facture
  const handleFactureSubmit = () => {
    if (factureFormData.numFacture && factureFormData.dateFacture) {
      if (selectedFacture) {
        // Supprimer la ligne sélectionnée avant d'ajouter la ligne modifiée
        setFactureList(factureList.filter((facture) => facture !== selectedFacture)); // Supprimer la ligne sélectionnée
      }
      
      // Ajouter ou mettre à jour la ligne dans le tableau
      setFactureList([
        ...factureList,
        { 
          ...factureFormData, 
          document: factureFormData.document ? factureFormData.document.name : "Non" 
        },
      ]);

      // Fermer les modals et réinitialiser le formulaire
      setShowAddFactureModal(false);
      setShowEditFactureModal(false);
      setFactureFormData({ numFacture: "", dateFacture: "", montant: "", BLs: "", document: null });
      setSelectedFacture(null); // Réinitialiser la ligne sélectionnée
    } else {
      alert("Tous les champs doivent être remplis.");
    }
  };
{/** 
  // Modifier une facture
  const handleEditFacture = () => {
    if (selectedFacture) {
      setFactureFormData(selectedFacture);
      setShowEditFactureModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à modifier.");
    }
  };
  
  // Supprimer une facture
  const handleDeleteFacture = () => {
    if (selectedFacture) {
      setShowDeleteFactureModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à supprimer.");
    }
  };

  // Confirmer la suppression d'une facture
  const confirmFactureDelete = () => {
    setFactureList(factureList.filter((facture) => facture !== selectedFacture)); // Supprimer la ligne sélectionnée
    setSelectedFacture(null);
    setShowDeleteFactureModal(false);
  };
*/}
  {/**facture */}

  const [pvList, setPvList] = useState([]);
  const [showAddPvModal, setShowAddPvModal] = useState(false);
  const [showEditPvModal, setShowEditPvModal] = useState(false);
  const [showDeletePvModal, setShowDeletePvModal] = useState(false);
  const [selectedPv, setSelectedPv] = useState(null);
  
  const [pvFormData, setPvFormData] = useState({
    avecReserve: false,
    BL: "",
    datePVRPT: "",
    document: null, // Champ pour le fichier
  });

  const handlePvrptFileDownloadClick = async (pv) => {
    try {
      const response = await pvrptService.downloadFile(pv.BL);
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire l'extension du type de fichier de la réponse
      const contentType = response.headers['content-type'];
      const extension = contentType ? `.${contentType.split('/').pop()}` : '';
      
      // Définir le nom du fichier
      link.setAttribute('download', `pvrpt_${pv.BL}${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      setValidationMessage("Ce PVRPT n'a pas de fichier associé.");
      setShowValidationModal(true);
    }
  };

  // Gérer le changement des inputs pour PVRPT
  const handlePvChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPvFormData((previousPvData) => ({
      ...previousPvData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Gérer le changement du fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // On prend le premier fichier téléchargé
    setPvFormData((previousPvData) => ({
      ...previousPvData,
      document: file,
    }));
  };

  // Ajouter un PVRPT
  const handleAddPv = () => {
    setSelectedPv(null); // Désélectionner la ligne en cours avant d'ajouter
    setPvFormData({ avecReserve: false, BL: "", datePVRPT: new Date().toISOString().split('T')[0], document: null });
    setShowAddPvModal(true);
  };

  // Valider l'ajout ou la modification d'un PVRPT
  const handlePvSubmit = async () => {
    console.log("marcheBC:", marcheBC);
    if (!marcheBC) {
      alert('Veuillez d\'abord saisir un marché dans le champ MarcheBC');
      return;
    }
  
    if (!pvFormData.datePVRPT) {
      setValidationMessage("La date est obligatoire");
      setShowValidationModal(true);
      return;
    }
  
    if (!pvFormData.BL) {
      setValidationMessage("Le numéro BL est obligatoire");
      setShowValidationModal(true);
      return;
    }
  
    try {
      // Correction de l'URL de l'API (amarche -> amarches)
      const marcheResponse = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
      if (!marcheResponse.ok) throw new Error('Marché non trouvé');
      const marcheData = await marcheResponse.json();
  
      const formData = new FormData();
      formData.append('marcheBC', marcheBC);
      formData.append('datePVRPT', pvFormData.datePVRPT);
      formData.append('BL', pvFormData.BL);
      formData.append('avecReserve', pvFormData.avecReserve);
      if (pvFormData.document) {
        formData.append('document', pvFormData.document);
      }
  
      let response;
      if (showEditPvModal) {
        console.log("Début de la modification", {
          showEditPvModal,
          selectedPv,
          pvFormData,
          BL: pvFormData.BL
        });
        
        try {
          response = await fetch(`http://localhost:5003/api/pvrpt/${pvFormData.BL}`, {
            method: 'PUT',
            body: formData
          });
          console.log("Réponse de l'API:", {
            status: response.status,
            ok: response.ok
          });
        } catch (error) {
          console.error("Erreur lors de l'appel API:", error);
          throw error;
        }
      } else {
        // ➕ AJOUT
        response = await fetch('http://localhost:5003/api/pvrpt', {
          method: 'POST',
          body: formData
        });
      }
      
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }
  
      const data = await response.json();
console.log('PVRPT sauvegardé:', data);

// Recharge la liste complète depuis le backend
const allPvrpt = await pvrptService.getAll();
console.log('Liste complète PVRPT:', allPvrpt);

// Filtre les PVRPT par le marcheBC actuel
const filteredPvrpt = allPvrpt.filter(pv => pv.marcheBC === marcheBC);
setPvList(filteredPvrpt);

setValidationMessage(showEditPvModal ? "PVRPT modifié avec succès." : "PVRPT ajouté avec succès.");
setShowValidationModal(true);
setShowAddPvModal(false);
setShowEditPvModal(false);
setPvFormData({ avecReserve: false, BL: "", datePVRPT: "", document: null });
setSelectedPv(null);
  
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    }
  };
  

  // Modifier un PVRPT
  const handleEditPv = () => {
    if (selectedPv) {
      setPvFormData(selectedPv);
      setShowEditPvModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à modifier.");
      setShowValidationModal(true);
    }
  };

  // Supprimer un PVRPT
  const handleDeletePv = () => {
    if (selectedPv) {
      setShowDeletePvModal(true);
    } else {
      setValidationMessage("Veuillez sélectionner une ligne à supprimer.");
      setShowValidationModal(true);
    }
  };

  // Confirmer la suppression d'un PVRPT
  const confirmPvDelete = async () => {
    if (!selectedPv) return;
  
    try {
      await pvrptService.delete(selectedPv.BL); // Suppression dans la base
      setPvList(pvList.filter((pv) => pv !== selectedPv)); // Mise à jour locale
      setSelectedPv(null);
      setShowDeletePvModal(false);
      setValidationMessage("PVRPT supprimé avec succès.");
      setShowValidationModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert("Erreur lors de la suppression du PVRPT : " + error.message);
    }
  };
  

  // Définition de la référence pour le tableau PVRPT
  const pvTableRef = React.useRef(null);

  // Gestionnaire de clic en dehors du tableau PVRPT (ajouté dans le useEffect)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (pvTableRef.current && !pvTableRef.current.contains(event.target) && 
          !event.target.closest('.modal') && !event.target.closest('.action-button')) {
        setSelectedPv(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

{/*pvrpt */}
  
const [selectedOption, setSelectedOption] = useState("marche");
  const [osList, setOsList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOs, setSelectedOs] = useState(null);
const [showPrintModal, setShowPrintModal] = useState(false);


const [formData, setFormData] = useState({
  numero: "",
  typeOs: "",
  dateOs: "",
  document: null,
});

// Handle input change
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

// Handle the 'Valider' button
const handleValider = () => {
  const { numero, typeOs, dateOs } = formData;
  console.log("Fichier sélectionné : ", document);
  if (numero && typeOs && dateOs) {
    // Add data to the list
    setOsList((prevList) => [
      ...prevList,
      {
        numero,
        typeOs,
        dateOs,
        document: formData.document ? formData.document.name : "Non",
  // Si 'document' existe, utiliser son nom, sinon "Non"
      },
      
    ]);
    // Close the modal
    setShowAddModal(false);
    // Reset formData after adding
    setFormData({
      numero: "",
      typeOs: "",
      dateOs: "", 
      document: null,  // Réinitialiser le champ document
    });
  } else {
    alert("Tous les champs doivent être remplis.");
  }
};

  

  /*const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };*/

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const confirmPrint = () => {
    setShowPrintModal(false);
    window.print();
  };

  const handleAddOs = () => {
    console.log("Bouton Ajouter cliqué - Affichage de la modal : ", showAddModal);
    setShowAddModal(true);
  };

  const handleEditOs = () => {
    if (selectedOs) {
      setFormData(selectedOs); // Populate form with selected OS data
      setShowEditModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à modifier.");
    }
  };

  const handleDeleteOs = () => {
    if (selectedOs) {
      setShowDeleteModal(true);
    } else {
      alert("Veuillez sélectionner une ligne à supprimer.");
    }
  };

  const confirmDelete = () => {
    setOsList(osList.filter((os) => os !== selectedOs)); // Remove selected OS from the list
    setSelectedOs(null); // Clear selected OS
    setShowDeleteModal(false);
  };

  // Ajouter cet useEffect pour la gestion des clics extérieurs
  useEffect(() => {
    // Gestionnaire pour désélectionner quand on clique en dehors du tableau de factures
    const handleOutsideClick = (event) => {
      if (factureTableRef.current && !factureTableRef.current.contains(event.target) && 
          !event.target.closest('.modal') && !event.target.closest('.action-button')) {
        setSelectedFacture(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Ajout de l'effet pour gérer les clics en dehors du tableau
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ordreServiceTableRef.current && !ordreServiceTableRef.current.contains(event.target) && 
          !event.target.closest('.modal') && !event.target.closest('.action-button')) {
        setSelectedOrdreService(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const [showFamilleProjetPopup, setShowFamilleProjetPopup] = useState(false);
  const [familleProjetFilterText, setFamilleProjetFilterText] = useState('');
  const [selectedFamilleProjetCode, setSelectedFamilleProjetCode] = useState('');
  const [selectedFamilleProjetDesignation, setSelectedFamilleProjetDesignation] = useState('');
  const [selectedFamilleProjetRow, setSelectedFamilleProjetRow] = useState(null);

  const toggleFamilleProjetPopup = () => setShowFamilleProjetPopup(!showFamilleProjetPopup);

  useEffect(() => {
    const handleClickOutsideFamilleProjet = (event) => {
      if (showFamilleProjetPopup && !event.target.closest('.popup')) {
        setShowFamilleProjetPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideFamilleProjet);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFamilleProjet);
    };
  }, [showFamilleProjetPopup]);

  const filteredFamilleProjetData = [
  { code: 'LOGICIEL', designation: 'LOGICIEL' },
  { code: 'HABILLEMENT', designation: 'HABILLEMENT' },
  { code: 'PRESTATION', designation: 'PRESTATION' },
  { code: 'L&MI', designation: 'LOGICIEL ET MATERIEL INFORMATIQUE' },
  { code: 'CONSOMABLES', designation: 'CONSOMABLES' },
  { code: 'FORMATION', designation: 'FORMATION' },
  { code: 'EQUIPEMENTS', designation: 'EQUIPEMENTS' },
  { code: 'P1', designation: 'P1' },
  { code: 'P2', designation: 'P2' },
  { code: 'P3', designation: 'P3' }
].filter(item =>
  Object.values(item).some(val =>
    String(val).toLowerCase().includes(familleProjetFilterText.toLowerCase())
  )
);


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
{/**
  const filteredFournisseurData = [
    { codeFrs: 'F001', NomFrs: 'Fournisseur Alpha' },
    { codeFrs: 'F002', NomFrs: 'Fournisseur Beta' },
    { codeFrs: 'F003', NomFrs: 'Fournisseur Gamma' },
  ].filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(fournisseurFilterText.toLowerCase())
    )
  );
   */}

   const filteredFournisseurData = [
  { codeFrs: 'F/00001', NomFrs: 'LTS NETWORK' },
  { codeFrs: 'F/00002', NomFrs: 'NINSIGHT' },
  { codeFrs: 'F/00003', NomFrs: 'STUDIOTECH' },
  { codeFrs: 'F/00004', NomFrs: 'STUDIOTECH MAROC' },
  { codeFrs: 'F/00005', NomFrs: 'TRAFFITEC' },
  { codeFrs: 'F/00006', NomFrs: 'ATEME' },
  { codeFrs: 'F/00007', NomFrs: 'TRADEC' },
  { codeFrs: 'F/00008', NomFrs: 'EVS BROADCAST EQUIPEMENT' },
  { codeFrs: 'F/00009', NomFrs: 'WORKPLUS' },
  { codeFrs: 'F/00010', NomFrs: 'ABCHIR SARL' },
  { codeFrs: 'F/00011', NomFrs: 'AEQ' },
  { codeFrs: 'F/00012', NomFrs: 'PRO ALPHA ET PRO ALPHA EUROPE' },
  { codeFrs: 'F/00013', NomFrs: 'SAVE DIFFUSION' },
  { codeFrs: 'F/00014', NomFrs: 'SIDATE BRAHIM TECHNO' },
  { codeFrs: 'F/00015', NomFrs: 'FUTURE LINK' }
].filter(item =>
  Object.values(item).some(val =>
    String(val).toLowerCase().includes(fournisseurFilterText.toLowerCase())
  )
);


  const [showFicheProjetPopup, setShowFicheProjetPopup] = useState(false);
  const [ficheProjetFilterText, setFicheProjetFilterText] = useState('');
  const [selectedFicheProjetId, setSelectedFicheProjetId] = useState('');
  const [selectedFicheProjetTitle, setSelectedFicheProjetTitle] = useState('');
  const [selectedFicheProjetRow, setSelectedFicheProjetRow] = useState(null);

  const toggleFicheProjetPopup = () => setShowFicheProjetPopup(!showFicheProjetPopup);

  useEffect(() => {
    const handleClickOutsideFicheProjet = (event) => {
      if (showFicheProjetPopup && !event.target.closest('.popup')) {
        setShowFicheProjetPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideFicheProjet);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideFicheProjet);
    };
  }, [showFicheProjetPopup]);

  const filteredFicheProjetData = [
  {
    id: 'FP001',
    title: 'Fourniture et mise en service équipements',
    dateProjet: '2023-05-15',
    chefProjet: 'Ahmed Khalid',
    Commission: 'Touafik Sabri',
    ficheProjetFile: 'doc1.pdf',
    type: 'Construction',
    ficheAffectationFile: 'aff1.pdf'
  },
  {
    id: 'FP002',
    title: 'Acquisition équipements vidéo',
    dateProjet: '2023-06-20',
    chefProjet: 'Sara Mansour',
    Commission: 'Fatima Ahlal',
    ficheProjetFile: 'doc2.pdf',
    type: 'Rénovation',
    ficheAffectationFile: 'aff2.pdf'
  },
  {
    id: 'FP003',
    title: 'Fourniture supports d’enregistrement',
    dateProjet: '2023-07-10',
    chefProjet: 'Mohammed Ali',
    Commission: 'Mahmoud Kibar',
    ficheProjetFile: 'doc3.pdf',
    type: 'Maintenance',
    ficheAffectationFile: 'aff3.pdf'
  },
  {
    id: 'FP004',
    title: 'Deux porteurs mobiles vidéo',
    dateProjet: '2023-08-01',
    chefProjet: 'Fatima Zahra',
    Commission: 'Hamame El Houcine',
    ficheProjetFile: 'doc4.pdf',
    type: 'Transport',
    ficheAffectationFile: 'aff4.pdf'
  },
  {
    id: 'FP005',
    title: 'Installation système transmission',
    dateProjet: '2023-08-18',
    chefProjet: 'Omar El Idrissi',
    Commission: 'Ennia Radouane',
    ficheProjetFile: 'doc5.pdf',
    type: 'Installation',
    ficheAffectationFile: 'aff5.pdf'
  },
  {
    id: 'FP006',
    title: 'Service matériel diffusion',
    dateProjet: '2023-09-02',
    chefProjet: 'Youssef Alami',
    Commission: 'Bahzaqui Mostafa',
    ficheProjetFile: 'doc6.pdf',
    type: 'Diffusion',
    ficheAffectationFile: 'aff6.pdf'
  },
  {
    id: 'FP007',
    title: 'Appareils de production audio',
    dateProjet: '2023-09-20',
    chefProjet: 'Khadija Lahlou',
    Commission: 'Driss Kourou',
    ficheProjetFile: 'doc7.pdf',
    type: 'Production',
    ficheAffectationFile: 'aff7.pdf'
  },
  {
    id: 'FP008',
    title: 'Régie multi-diffusion',
    dateProjet: '2023-10-05',
    chefProjet: 'Hassan Amrani',
    Commission: 'Taoufik Sabri',
    ficheProjetFile: 'doc8.pdf',
    type: 'Régie',
    ficheAffectationFile: 'aff8.pdf'
  }
].filter(item =>
  Object.values(item).some(val =>
    String(val).toLowerCase().includes(ficheProjetFilterText.toLowerCase())
  )
);

  const [showDemandeurPopup, setShowDemandeurPopup] = useState(false);
  const [demandeurFilterText, setDemandeurFilterText] = useState('');
  const [selectedDemandeurId, setSelectedDemandeurId] = useState('');
  const [selectedDemandeurAffectation, setSelectedDemandeurAffectation] = useState('');
  const [selectedDemandeurRow, setSelectedDemandeurRow] = useState(null);

  const toggleDemandeurPopup = () => setShowDemandeurPopup(!showDemandeurPopup);

  useEffect(() => {
    const handleClickOutsideDemandeur = (event) => {
      if (showDemandeurPopup && !event.target.closest('.popup')) {
        setShowDemandeurPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideDemandeur);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDemandeur);
    };
  }, [showDemandeurPopup]);
{/** 
  const filteredDemandeurData = [
    { idaff: 'D001', affectation: 'Affectation Alpha', responsable: 'Omar Hassan', Direction: 'Direction Technique', Département: 'IT', Service: 'Développement' },
    { idaff: 'D002', affectation: 'Affectation Beta', responsable: 'Fatima Zahra', Direction: 'Direction Commerciale', Département: 'Marketing', Service: 'Communication' },
    { idaff: 'D003', affectation: 'Affectation Gamma', responsable: 'Youssef Alami', Direction: 'Direction Financière', Département: 'Finance', Service: 'Comptabilité' },
  ].filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(demandeurFilterText.toLowerCase())
    )
  );
  */}

  const filteredDemandeurData = [
  { idaff: 'D001', affectation: 'DEPARTEMENT AUTOPROMOTION ET MARK...', responsable: 'Nadia Bennis', Direction: 'Communication', Département: 'Marketing', Service: 'Autopromotion' },
  { idaff: 'D002', affectation: 'DIRECTION GENERALE', responsable: 'Youssef Karimi', Direction: 'Générale', Département: 'Administration', Service: 'Direction' },
  { idaff: 'D003', affectation: 'DIRECTION ARTISTIQUE', responsable: 'Samira Fikri', Direction: 'Création', Département: 'Artistique', Service: 'Production' },
  { idaff: 'D004', affectation: 'DEPARTEMENT DES MOYENS FIXES', responsable: 'Amine Raji', Direction: 'Technique', Département: 'Infrastructures', Service: 'Maintenance' },
  { idaff: 'D005', affectation: '863191', responsable: 'Karim El Idrissi', Direction: 'Indéfinie', Département: 'Spécial', Service: 'Spécial' },
  { idaff: 'D006', affectation: 'DIRECTION EXPLOITATION', responsable: 'Rachid Boulahya', Direction: 'Opérations', Département: 'Exploitation', Service: 'Gestion Réseau' },
  { idaff: 'D007', affectation: 'SERVICE COORDINATION TECHNIQUE RADIO', responsable: 'Imane Rami', Direction: 'Technique', Département: 'Radio', Service: 'Coordination' },
  { idaff: 'D008', affectation: 'SERVICE DES ARCHIVES TV', responsable: 'Zineb Saidi', Direction: 'Documentation', Département: 'Archives', Service: 'TV' },
  { idaff: 'D009', affectation: 'SMG-TV', responsable: 'Yassine Mouline', Direction: 'Média', Département: 'Production', Service: 'Streaming' },
  { idaff: 'D010', affectation: 'CHAINE TV ARRYADIA', responsable: 'Hicham Jabrani', Direction: 'Sports', Département: 'Diffusion', Service: 'Arryadia' },
  { idaff: 'D011', affectation: 'PRÊT DIFFUSION', responsable: 'Soukaina Nejjar', Direction: 'Technique', Département: 'Diffusion', Service: 'Prêt' },
  { idaff: 'D012', affectation: 'Installés dans AWS-G500 SN: 13699', responsable: 'Hamza Bouazzaoui', Direction: 'Systèmes', Département: 'Serveurs', Service: 'Installation' },
  { idaff: 'D013', affectation: 'DEPARTEMENT DE LA MAINTENANCE', responsable: 'Laila Amrani', Direction: 'Technique', Département: 'Maintenance', Service: 'Réparation' },
  { idaff: 'D014', affectation: 'DIRECTION TECHNIQUE', responsable: 'Mohamed Reda', Direction: 'Technique', Département: 'Général', Service: 'Direction Technique' }
].filter(item =>
  Object.values(item).some(val =>
    String(val).toLowerCase().includes(demandeurFilterText.toLowerCase())
  )
);


  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [marcheBCType, setMarcheBCType] = useState('marche'); // Pour radio "marche" ou "bc"
  const [selectedTypeMarche, setSelectedTypeMarche] = useState('local'); // Pour select "local" ou "international"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Nouveaux états pour les champs additionnels
  const [intituleProjet, setintituleProjet] = useState('');
  const [descriptionProjet, setDescriptionProjet] = useState('');
  const [garantie, setGarantie] = useState('');
  const [delaiExecution, setDelaiExecution] = useState('');
  const [numAO, setNumAO] = useState('');
  const [jde, setJde] = useState('');

  // Synchroniser les valeurs des champs demandeur
  useEffect(() => {
    // Cette fonction se déclenche quand selectedDemandeurAffectation change
    // Elle garantit que les deux champs demandeur affichent la même valeur
  }, [selectedDemandeurAffectation]);

  const handleMarcheBCChange = (e) => {
    setMarcheBCType(e.target.value);
  };
  

  // Pour gérer les champs de date
  const [defaultDate, setDefaultDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Suppression des redéclarations ci-dessous
  // const [marcheBCType, setMarcheBCType] = useState('marche');
  
  // const handleMarcheBCChange = (e) => {
  //  setMarcheBCType(e.target.value);
  // };

  const [showAMValidationModal, setShowAMValidationModal] = useState(false);
  const [amValidationMessage, setAMValidationMessage] = useState("");
  const [showUploadMarche, setShowUploadMarche] = useState(false);
  const [isFirstValidationDone, setIsFirstValidationDone] = useState(false);
  const [showDetailProjetForm, setShowDetailProjetForm] = useState(false);
  const [isMarcheAlreadySaved, setIsMarcheAlreadySaved] = useState(false);
  const [savedMarcheDetails, setSavedMarcheDetails] = useState(null);
  const [initialFormState, setInitialFormState] = useState({});  // Pour suivre les valeurs initiales du formulaire
  const [detailProjetFromDatabase, setDetailProjetFromDatabase] = useState([]);

  // Mettre à jour initialFormState lors du premier enregistrement
  useEffect(() => {
    if (isMarcheAlreadySaved && Object.keys(initialFormState).length === 0) {
      setInitialFormState({
        marcheBC,
        selectedDate,
        selectedTypeMarche,
        marcheBCType,
        selectedFamilleProjetCode,
        intituleProjet,
        selectedFournisseurCode,
        selectedDemandeurAffectation,
        selectedFicheProjetId,
        descriptionProjet,
        garantie,
        delaiExecution,
        numAO,
        jde
      });
    }
  }, [isMarcheAlreadySaved]);

  const handleAMValidate = async () => {
    if (!isFirstValidationDone) {
      if (!marcheBC.trim()) {
        setAMValidationMessage("Le champ Marché/BC est obligatoire");
        setShowAMValidationModal(true);
        return;
      }

      // Ajout d'enregistrement des données dans la base de données dès la première phase
      try {
        const initialMarcheData = {
          marcheBC: marcheBC,
          date: selectedDate,
          anneeMarche: new Date(selectedDate).getFullYear().toString(),
          typeMarche: selectedTypeMarche,
          marcheBCType: marcheBCType,
          familleProjet: selectedFamilleProjetCode || '',
          intituleProjet: intituleProjet,
          fournisseur: selectedFournisseurCode || '',
          demandeur: selectedDemandeurAffectation || '',
          ficheProjet: selectedFicheProjetId || '',
          descriptionProjet: descriptionProjet,
          garantie: garantie,
          delaiExecution: delaiExecution,
          numAO: numAO,
          jde: jde,
          detailProjet: []
        };

        const response = await fetch('http://localhost:5003/api/amarches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initialMarcheData),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'enregistrement initial');
        }

        // Sauvegarder les détails du marché localement
        setSavedMarcheDetails(initialMarcheData);
        setIsMarcheAlreadySaved(true);
        
        // Mettre à jour l'état initial du formulaire
        setInitialFormState({
          marcheBC,
          selectedDate,
          selectedTypeMarche,
          marcheBCType,
          selectedFamilleProjetCode,
          intituleProjet,
          selectedFournisseurCode,
          selectedDemandeurAffectation,
          selectedFicheProjetId,
          descriptionProjet,
          garantie,
          delaiExecution,
          numAO,
          jde
        });

      setAMValidationMessage("Code créé avec succès");
      setShowAMValidationModal(true);
      setShowUploadMarche(true);
      setIsFirstValidationDone(true);
      } catch (error) {
        console.error('Erreur:', error);
        setAMValidationMessage("Erreur lors de l'enregistrement initial");
        setShowAMValidationModal(true);
        return;
      }
    } else {
      // Vérifier si le formulaire principal a été modifié
      const isMainFormModified = isMarcheAlreadySaved && (
        marcheBC !== initialFormState.marcheBC ||
        selectedDate !== initialFormState.selectedDate ||
        selectedTypeMarche !== initialFormState.selectedTypeMarche ||
        marcheBCType !== initialFormState.marcheBCType ||
        selectedFamilleProjetCode !== initialFormState.selectedFamilleProjetCode ||
        intituleProjet !== initialFormState.intituleProjet ||
        selectedFournisseurCode !== initialFormState.selectedFournisseurCode ||
        selectedDemandeurAffectation !== initialFormState.selectedDemandeurAffectation ||
        selectedFicheProjetId !== initialFormState.selectedFicheProjetId ||
        descriptionProjet !== initialFormState.descriptionProjet ||
        garantie !== initialFormState.garantie ||
        delaiExecution !== initialFormState.delaiExecution ||
        numAO !== initialFormState.numAO ||
        jde !== initialFormState.jde
      );

      // Vérifier spécifiquement si le code marcheBC a été modifié
      const isMarcheBCChanged = marcheBC !== initialFormState.marcheBC;

      // Vérifier si les champs de détail sont vides
      const isDetailFormEmpty = !detailProjetFormData.numeroPrix.trim() && !detailProjetFormData.objetPrix.trim();

      // Si le formulaire principal a été modifié et que les champs de détail sont vides,
      // on met à jour uniquement le formulaire principal sans ajouter de détail
      if (isMainFormModified && isDetailFormEmpty) {
        try {
          // Préparer les données de mise à jour avec les détails existants
          const updateData = {
              marcheBC: marcheBC,
              date: selectedDate,
              anneeMarche: new Date(selectedDate).getFullYear().toString(),
              typeMarche: selectedTypeMarche,
              marcheBCType: marcheBCType,
              familleProjet: selectedFamilleProjetCode || '',
              intituleProjet: intituleProjet,
              fournisseur: selectedFournisseurCode || '',
              demandeur: selectedDemandeurAffectation || '',
              ficheProjet: selectedFicheProjetId || '',
              descriptionProjet: descriptionProjet,
              garantie: garantie,
              delaiExecution: delaiExecution,
              numAO: numAO,
              jde: jde,
            detailProjet: savedMarcheDetails ? savedMarcheDetails.detailProjet : []
          };

          console.log('Tentative de mise à jour du marché:', marcheBC);
          console.log('Données à envoyer:', updateData);

          // Déterminer quelle URL utiliser pour le PUT
          // Si le code marcheBC a changé, utiliser l'ancien code pour le PUT
          const putUrl = isMarcheBCChanged 
            ? `http://localhost:5003/api/amarches/${initialFormState.marcheBC}`
            : `http://localhost:5003/api/amarches/${marcheBC}`;

          // Essayer d'abord avec PUT
          try {
            console.log(`Essai avec PUT ${putUrl}`);
            const putResponse = await fetch(putUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            });
            
            if (!putResponse.ok) {
              // Si PUT échoue, on utilise DELETE+POST comme solution de contournement
              console.log('PUT a échoué avec statut:', putResponse.status);
              throw new Error('PUT a échoué');
            }
            
            const putResult = await putResponse.json();
            console.log('Marché mis à jour avec PUT:', putResult);
            
            // Mettre à jour les informations locales
            setSavedMarcheDetails(updateData);
            setInitialFormState({
              marcheBC,
              selectedDate,
              selectedTypeMarche,
              marcheBCType,
              selectedFamilleProjetCode,
              intituleProjet,
              selectedFournisseurCode,
              selectedDemandeurAffectation,
              selectedFicheProjetId,
              descriptionProjet,
              garantie,
              delaiExecution,
              numAO,
              jde
            });

            setAMValidationMessage("Marché modifié avec succès");
            setShowAMValidationModal(true);
            return;
            
          } catch (putError) {
            console.log('Fallback vers DELETE+POST');
            
            // Si le code marcheBC a changé, supprimer l'ancien marché
            const deleteUrl = isMarcheBCChanged 
              ? `http://localhost:5003/api/amarches/${initialFormState.marcheBC}`
              : `http://localhost:5003/api/amarches/${marcheBC}`;
            
            // Supprimer d'abord le marché existant
            const deleteResponse = await fetch(deleteUrl, {
              method: 'DELETE',
            });
            
            console.log('Résultat de DELETE:', deleteResponse.status);
            
            // Puis créer une nouvelle version avec les informations mises à jour
            const postResponse = await fetch('http://localhost:5003/api/amarches', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            });
            
            if (!postResponse.ok) {
              throw new Error('Erreur lors de la recréation du marché');
            }
            
            const postResult = await postResponse.json();
            console.log('Marché recréé avec POST:', postResult);
            
            // Mettre à jour les informations locales
            setSavedMarcheDetails(updateData);
            setInitialFormState({
              marcheBC,
              selectedDate,
              selectedTypeMarche,
              marcheBCType,
              selectedFamilleProjetCode,
              intituleProjet,
              selectedFournisseurCode,
              selectedDemandeurAffectation,
              selectedFicheProjetId,
              descriptionProjet,
              garantie,
              delaiExecution,
              numAO,
              jde
            });

            setAMValidationMessage("Marché modifié avec succès");
            setShowAMValidationModal(true);
            return;
          }
          
          } catch (error) {
          console.error('Erreur complète lors de la mise à jour:', error);
          setAMValidationMessage("Erreur lors de la modification du marché");
            setShowAMValidationModal(true);
            return;
          }
        }

      // Pour tout autre cas (ajout de détail ou aucune modification du formulaire principal),
      // on conserve la vérification des champs obligatoires
      if (!detailProjetFormData.numeroPrix || !detailProjetFormData.objetPrix) {
        setAMValidationMessage("Veuillez remplir les champs Numéro Prix et Objet Prix");
        setShowAMValidationModal(true);
            return;
      }

      try {
        const prixTotalHTVA = detailProjetFormData.quantite * detailProjetFormData.prixUnitaire;

        // Préparation des données du nouveau détail projet
        const newDetailProjet = {
          ...detailProjetFormData,
          prixTotalHTVA,
          demandeur: selectedDemandeurAffectation || ''
        };

        // Création ou mise à jour du tableau des détails du projet
        let updatedDetailProjet = [];
        
        if (selectedDetailRow !== null) {
          // Mise à jour d'une ligne existante
          console.log('Mise à jour du détail à l\'index', selectedDetailRow);
          updatedDetailProjet = savedMarcheDetails.detailProjet.map((item, index) => 
            index === selectedDetailRow ? newDetailProjet : item
          );
        } else {
          // Vérifier si un détail avec le même numéro de prix existe déjà
          const detailExists = savedMarcheDetails && savedMarcheDetails.detailProjet && 
                              savedMarcheDetails.detailProjet.some((item, idx) => {
                                // Si on est en train de modifier une ligne, elle ne doit pas être considérée comme un doublon
                                if (selectedDetailRow !== null && idx === selectedDetailRow) {
                                  return false;
                                }
                                // Vérifier la correspondance du numéro de prix
                                const isDuplicate = item.numeroPrix === newDetailProjet.numeroPrix;
                                if (isDuplicate) {
                                  console.log('Duplication détectée:', item.numeroPrix, 'VS', newDetailProjet.numeroPrix);
                                }
                                return isDuplicate;
                              });
                              
          console.log('Vérification de duplication pour', newDetailProjet.numeroPrix, 'Résultat:', detailExists);
                             
          if (detailExists) {
            console.log('Empêchement de duplication pour le numéro de prix:', newDetailProjet.numeroPrix);
            setAMValidationMessage("Un détail avec ce numéro de prix existe déjà");
            setShowAMValidationModal(true);
            return;
          }
          
          // Ajout d'un nouveau détail
          console.log('Ajout d\'un nouveau détail');
          updatedDetailProjet = savedMarcheDetails ? 
            [...savedMarcheDetails.detailProjet, newDetailProjet] : 
            [newDetailProjet];
        }

        // Préparation des données complètes du marché, incluant les modifications du formulaire principal
        const amarcheUpdateData = {
          marcheBC: marcheBC,
          date: selectedDate,
          anneeMarche: new Date(selectedDate).getFullYear().toString(),
          typeMarche: selectedTypeMarche,
          marcheBCType: marcheBCType,
          familleProjet: selectedFamilleProjetCode || '',
          intituleProjet: intituleProjet,
          fournisseur: selectedFournisseurCode || '',
          demandeur: selectedDemandeurAffectation || '',
          ficheProjet: selectedFicheProjetId || '',
          descriptionProjet: descriptionProjet,
          garantie: garantie,
          delaiExecution: delaiExecution,
          numAO: numAO,
          jde: jde,
          detailProjet: updatedDetailProjet
        };

        // Si nous avons déjà un marché sauvegardé, utilisez ses valeurs pour les champs non modifiés
        if (savedMarcheDetails && !isMainFormModified) {
              Object.keys(savedMarcheDetails).forEach(key => {
                if (key !== 'detailProjet' && !amarcheUpdateData[key]) {
                  amarcheUpdateData[key] = savedMarcheDetails[key];
                }
              });
            }
            
            console.log('Mise à jour avec nouveau détail:', amarcheUpdateData);
            
        // Utiliser directement PUT pour mettre à jour le marché existant
        try {
          console.log(`Essai avec PUT http://localhost:5003/api/amarches/${marcheBC}`);
          const putResponse = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`, {
            method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
              body: JSON.stringify(amarcheUpdateData),
            });
            
          if (!putResponse.ok) {
            console.log('PUT a échoué avec statut:', putResponse.status);
            throw new Error('PUT a échoué');
            }
            
          const result = await putResponse.json();
          console.log('Marché mis à jour avec PUT:', result);
            
            // Mettre à jour notre version locale des détails du marché
            setSavedMarcheDetails(amarcheUpdateData);
            
            // Mettre à jour le tableau des détails pour l'affichage
          setDetailProjetTableData(amarcheUpdateData.detailProjet);
            setShowDetailProjetTable(true);
            
          // Mettre à jour l'état initial du formulaire avec les nouvelles valeurs
        setInitialFormState({
          marcheBC,
          selectedDate,
          selectedTypeMarche,
          marcheBCType,
          selectedFamilleProjetCode,
          intituleProjet,
          selectedFournisseurCode,
          selectedDemandeurAffectation,
          selectedFicheProjetId,
          descriptionProjet,
          garantie,
          delaiExecution,
          numAO,
          jde
        });

          if (isMainFormModified) {
            setAMValidationMessage("Marché modifié avec succès");
          } else {
            setAMValidationMessage("Détail ajouté avec succès au marché");
          }
        setShowAMValidationModal(true);

            // Réinitialiser le formulaire de détail
            handleDetailFormClear();
            
        } catch (putError) {
          console.log('Fallback vers DELETE+POST pour détail');
          
          // Supprimer d'abord le marché existant
          const deleteResponse = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`, {
            method: 'DELETE',
          });
          
          console.log('Résultat de DELETE:', deleteResponse.status);
          
          // Puis créer une nouvelle version avec les détails mis à jour
          const postResponse = await fetch('http://localhost:5003/api/amarches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(amarcheUpdateData),
          });
          
          if (!postResponse.ok) {
            throw new Error('Erreur lors de la recréation du marché avec détail');
          }
          
          const postResult = await postResponse.json();
          console.log('Marché recréé avec POST (détail):', postResult);
          
          // Mettre à jour notre version locale des détails du marché
          setSavedMarcheDetails(amarcheUpdateData);
          
          // Mettre à jour le tableau des détails pour l'affichage
          setDetailProjetTableData(amarcheUpdateData.detailProjet);
          setShowDetailProjetTable(true);
          
          // Mettre à jour l'état initial du formulaire avec les nouvelles valeurs
        setInitialFormState({
          marcheBC,
          selectedDate,
          selectedTypeMarche,
          marcheBCType,
          selectedFamilleProjetCode,
          intituleProjet,
          selectedFournisseurCode,
          selectedDemandeurAffectation,
          selectedFicheProjetId,
          descriptionProjet,
          garantie,
          delaiExecution,
          numAO,
          jde
        });

        if (isMainFormModified) {
            setAMValidationMessage("Marché modifié avec succès");
        } else {
            setAMValidationMessage("Détail ajouté avec succès au marché");
          }
          setShowAMValidationModal(true);
          
          // Réinitialiser le formulaire de détail
          handleDetailFormClear();
        }
      } catch (error) {
        console.error('Erreur:', error);
        setAMValidationMessage("Erreur lors de l'enregistrement");
        setShowAMValidationModal(true);
      }
    }
  };

  // Modification de la fonction handleNew pour réinitialiser l'état de validation
  const handleNew = () => {
    // Réinitialiser les champs principaux du marché
    setMarcheBC('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTypeMarche('local');
    setMarcheBCType('marche');
    setSelectedFamilleProjetCode('');
    setSelectedFamilleProjetDesignation('');
    setintituleProjet('');
    setSelectedFournisseurCode('');
    setSelectedFournisseurNom('');
    setSelectedDemandeurId('');
    setSelectedDemandeurAffectation('');
    setSelectedFicheProjetId('');
    setSelectedFicheProjetTitle('');
    setDescriptionProjet('');
    setGarantie('');
    setDelaiExecution('');
    setNumAO('');
    setJde('');
    
    // Réinitialiser les tableaux et états pour les détails
    setDetailProjetTableData([]);
    setShowDetailProjetTable(false);
    setSelectedDetailRow(null);
    setShowUploadMarche(false);
    setMarcheFile(null);
    setIsFirstValidationDone(false);
    setIsMarcheAlreadySaved(false);
    setSavedMarcheDetails(null);
    setInitialFormState({});
    
    // Réinitialiser le formulaire de détail
    handleDetailFormClear();
    
    // Autres réinitialisations
    setShowForm(true);
  };

  // Ajouter ces états au début du composant
  const [marcheFile, setMarcheFile] = useState(null);
  const [showMarcheUploadModal, setShowMarcheUploadModal] = useState(false);

  

  const handleMarcheFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setAMValidationMessage("Type de fichier non supporté. Veuillez sélectionner un fichier PDF ou Word.");
      setShowAMValidationModal(true);
      e.target.value = null;
      return;
    }
    setMarcheFile(file);
  }
};


{/** 
  // Ajouter cette fonction de gestion de fichier
  const handleMarcheFileChange = (e) => {
    setMarcheFile(e.target.files[0]);
  };

  const handleMarcheUpload = () => {
    if (!marcheFile) {
      setAMValidationMessage("Veuillez sélectionner un fichier");
      setShowAMValidationModal(true);
      return;
    }
    
    setAMValidationMessage("Fichier uploadé avec succès");
    setShowAMValidationModal(true);
    setShowMarcheUploadModal(false);
    setMarcheFile(null);
  };
*/}

const handleMarcheUpload = async () => {
  if (!marcheFile) {
    setAMValidationMessage("Veuillez sélectionner un fichier");
    setShowAMValidationModal(true);
    return;
  }

  if (!marcheBC) {
    setAMValidationMessage("Veuillez d'abord saisir un marché/BC");
    setShowAMValidationModal(true);
    return;
  }

  const formData = new FormData();
  formData.append('file', marcheFile);
  formData.append('marcheBC', marcheBC);

  try {
    const response = await axios.post('http://localhost:5003/api/marche-documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status === 200) {
      setAMValidationMessage("Fichier uploadé avec succès");
      setShowAMValidationModal(true);
      setShowMarcheUploadModal(false);
      setMarcheFile(null);
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    setAMValidationMessage(error.response?.data?.message || "Une erreur est survenue lors de l'upload du fichier");
    setShowAMValidationModal(true);
  }
};
  // États pour le formulaire de détail projet
  const [detailProjetFormData, setDetailProjetFormData] = useState({
    numeroPrix: '',
    unite: '',
    quantite: '',
    prixUnitaire: '',
    numLot: '',
    objetPrix: ''
  });

  const [detailProjetTableData, setDetailProjetTableData] = useState([]);
  const [showDetailProjetTable, setShowDetailProjetTable] = useState(false);

  // Fonction pour gérer les changements dans le formulaire de détail projet
  const handleDetailProjetChange = (e) => {
    const { name, value } = e.target;
    setDetailProjetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ajouter un état pour la ligne sélectionnée
  const [selectedDetailRow, setSelectedDetailRow] = useState(null);

  // Fonction pour gérer la sélection d'une ligne
  const handleDetailRowSelect = (index) => {
    setSelectedDetailRow(index);
    const data = detailProjetTableData[index];
    setDetailProjetFormData({
      numeroPrix: data.numeroPrix || '',
      unite: data.unite || '',
      quantite: data.quantite || '0.00',
      prixUnitaire: data.prixUnitaire || '0.00',
      numLot: data.numLot || '',
      objetPrix: data.objetPrix || ''
    });
  };

  // Fonction pour supprimer les champs du formulaire
  const handleDetailFormClear = () => {
    console.log('Réinitialisation du formulaire de détail');
    setDetailProjetFormData({
      numeroPrix: '',
      unite: '',
      quantite: '',
      prixUnitaire: '',
      numLot: '',
      objetPrix: ''
    });
    // S'assurer que selectedDetailRow est bien réinitialisé
    setSelectedDetailRow(null);
    // Ne pas réinitialiser isMarcheAlreadySaved ici pour permettre d'ajouter 
    // de nouveaux détails au même marché après avoir cliqué sur Supprimer
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTypeMarcheChange = (e) => {
    setSelectedTypeMarche(e.target.value);
  };

  // Gestionnaires d'événements pour les nouveaux champs
  const handleDescriptionProjetChange = (e) => {
    setDescriptionProjet(e.target.value);
  };

  const handleintituleProjetChange = (e) => {
    setintituleProjet(e.target.value);
  };

  const handleGarantieChange = (e) => {
    setGarantie(e.target.value);
  };

  const handleDelaiExecutionChange = (e) => {
    setDelaiExecution(e.target.value);
  };

  const handleNumAOChange = (e) => {
    setNumAO(e.target.value);
  };

  const handleJdeChange = (e) => {
    setJde(e.target.value);
  };

  // Pré-remplir le formulaire avec les données du marché sélectionné
  useEffect(() => {
    const { state } = location;
    if (state && state.isEdit && state.marche) {
      // Remplir les champs du formulaire
      setMarcheBC(state.marche.marche || '');
      setSelectedDate(state.marche.dateProj || new Date().toISOString().split('T')[0]);
      setSelectedTypeMarche(state.marche.typeMarche || '');
      setMarcheBCType(state.marche.marcheBCType || 'marche');
      setSelectedFamilleProjetCode(state.marche.familleProjet || '');
      setintituleProjet(state.marche.descriptionProj || '');
      setSelectedFournisseurCode(state.marche.fournisseur || '');
      setSelectedDemandeurAffectation(state.marche.demandeur || '');
      setSelectedFournisseurNom(state.marche.selectedFournisseurNom || '');
      setSelectedFamilleProjetDesignation(state.marche.selectedFamilleProjetDesignation || '');
      setSelectedFicheProjetTitle(state.marche.selectedFicheProjetTitle || '');
      setDescriptionProjet(state.marche.memoproj || '');
      setGarantie(state.marche.garantie || '');
      setDelaiExecution(state.marche.delai || '');
      setNumAO(state.marche.refext1 || '');
      setJde(state.marche.jde || '');

      // Initialiser les états de validation
      setIsFirstValidationDone(true);
      setIsMarcheAlreadySaved(true);
      setShowUploadMarche(true);
      
      // Initialiser savedMarcheDetails avec les données complètes
      if (state.savedMarcheDetails) {
        setSavedMarcheDetails(state.savedMarcheDetails);
        setDetailProjetTableData(state.savedMarcheDetails.detailProjet || []);
        setShowDetailProjetTable(true);
      }
      
      // Initialiser l'état initial du formulaire
      setInitialFormState({
        marcheBC: state.marche.marche || '',
        selectedDate: state.marche.dateProj || new Date().toISOString().split('T')[0],
        selectedTypeMarche: state.marche.typeMarche || '',
        marcheBCType: state.marche.marcheBCType || 'marche',
        selectedFamilleProjetCode: state.marche.familleProjet || '',
        intituleProjet: state.marche.descriptionProj || '',
        selectedFournisseurCode: state.marche.fournisseur || '',
        selectedDemandeurAffectation: state.marche.demandeur || '',
        selectedFicheProjetId: state.marche.ficheProjet || '',
        descriptionProjet: state.marche.memoproj || '',
        garantie: state.marche.garantie || '',
        delaiExecution: state.marche.delai || '',
        numAO: state.marche.refext1 || '',
        jde: state.marche.jde || ''
      });
    }
  }, [location]);
  
  // Fonction pour récupérer les détails d'un marché
  const fetchMarcheDetails = async (marcheBC) => {
    if (!marcheBC) {
      console.log('Aucun identifiant de marché fourni');
      return;
    }
    
    try {
      console.log(`Tentative de récupération des détails du marché: ${marcheBC}`);
      const response = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
      
      if (response.status === 404) {
        console.log(`Le marché avec l'identifiant ${marcheBC} n'existe pas`);
        setDetailProjetTableData([]);
        return;
      }
      
      if (!response.ok) {
        console.log(`Erreur ${response.status} lors de la récupération des détails du marché`);
        return;
      }
      
      const data = await response.json();
      console.log('Détails du marché récupérés:', data);
      
      if (data && data.detailProjet && Array.isArray(data.detailProjet)) {
        setDetailProjetFromDatabase(data.detailProjet);
        // Mettre à jour également le tableau des détails pour l'affichage
        setDetailProjetTableData(data.detailProjet);
        setShowDetailProjetTable(true);
      } else {
        console.log('Aucun détail de projet trouvé dans les données récupérées');
        setDetailProjetTableData([]);
      }
    } catch (error) {
      console.log('Erreur lors de la récupération des détails du marché:', error.message);
      // Ne pas afficher d'erreur à l'utilisateur, juste vider le tableau
      setDetailProjetTableData([]);
    }
  };

   // Ajouter l'état pour gérer l'onglet actif
   const [activeMainTab, setActiveMainTab] = useState("infos");

  // Ajouter ces nouvelles variables d'état pour l'onglet "Détails prix"
  const [selectedNumPrix, setSelectedNumPrix] = useState('');
  const [showNumPrixPopup, setShowNumPrixPopup] = useState(false);
  const [numPrixFilterText, setNumPrixFilterText] = useState('');
  const [selectedNumPrixDetails, setSelectedNumPrixDetails] = useState({});
  
  const [selectedReference, setSelectedReference] = useState('');
  const [showReferencePopup, setShowReferencePopup] = useState(false);
  const [referenceFilterText, setReferenceFilterText] = useState('');
  const [selectedReferenceDetails, setSelectedReferenceDetails] = useState({});
  
  const [selectedUnite, setSelectedUnite] = useState('U');
  const [quantite, setQuantite] = useState('');
  const [prix, setPrix] = useState('');
  const [filteredNumPrixData, setFilteredNumPrixData] = useState([]);


  useEffect(() => {
  const fetchNumPrixData = async () => {
    if (marcheBC) {
      try {
        // Récupérer les détails du marché à partir de marcheBC
        const response = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
        if (!response.ok) throw new Error('Marché non trouvé');
        const marcheData = await response.json();
        
        // Si le marché a des détails de projet, les utiliser
        if (marcheData && marcheData.detailProjet) {
          if (numPrixFilterText.trim() === '') {
            setFilteredNumPrixData(marcheData.detailProjet);
          } else {
            const filtered = marcheData.detailProjet.filter(item =>
              Object.values(item).some(val =>
                String(val).toLowerCase().includes(numPrixFilterText.toLowerCase())
              )
            );
            setFilteredNumPrixData(filtered);
          }
        } else {
          setFilteredNumPrixData([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des numéros de prix:', error);
        setFilteredNumPrixData([]);
      }
    } else {
      setFilteredNumPrixData([]);
    }
  };

  fetchNumPrixData();
}, [marcheBC, numPrixFilterText]);

  // Mettre à jour les détails de prix quand un marché est sélectionné
  useEffect(() => {
    if (selectedMarcheDetails && selectedMarcheDetails.detailProjet) {
      if (numPrixFilterText.trim() === '') {
        setFilteredNumPrixData(selectedMarcheDetails.detailProjet);
      } else {
        const filtered = selectedMarcheDetails.detailProjet.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(numPrixFilterText.toLowerCase())
          )
        );
        setFilteredNumPrixData(filtered);
      }
    } else {
      setFilteredNumPrixData([]);
    }
  }, [selectedMarcheDetails, numPrixFilterText]);

  const filteredReferenceData = [
    { code: 'REF001', designation: 'Ordinateur portable', famille: 'Informatique', marque: 'HP', ref: 'HP-2023', codeExt: 'EXT001', serialisable: 'Oui', rayon: 'A1', stock_min: 5, stock_max: 20, designation_long: 'Ordinateur portable HP EliteBook' },
    { code: 'REF002', designation: 'Imprimante laser', famille: 'Informatique', marque: 'Canon', ref: 'CN-2023', codeExt: 'EXT002', serialisable: 'Oui', rayon: 'A2', stock_min: 2, stock_max: 10, designation_long: 'Imprimante laser Canon LBP223dw' },
    { code: 'REF003', designation: 'Chaise de bureau', famille: 'Mobilier', marque: 'Ikea', ref: 'IK-2023', codeExt: 'EXT003', serialisable: 'Non', rayon: 'B1', stock_min: 10, stock_max: 30, designation_long: 'Chaise de bureau ergonomique Ikea Markus' },
  ].filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(referenceFilterText.toLowerCase())
    )
  );

  // Fonctions pour les popups
  const toggleNumPrixPopup = () => setShowNumPrixPopup(!showNumPrixPopup);
  const toggleReferencePopup = () => setShowReferencePopup(!showReferencePopup);

  // Gestionnaires d'événements
  const handleQuantityChange = (e) => {
    setQuantite(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrix(e.target.value);
  };

  const clearDetailForm = () => {
    setSelectedNumPrix('');
    setSelectedNumPrixDetails({});
    setSelectedReference('');
    setSelectedReferenceDetails({});
    setQuantite('');
    setPrix('');
    setSelectedUnite('U');
  };

  const handleSaveDetailsPrix = async () => {
    try {
      console.log('Début de handleSaveDetailsPrix');
      console.log('selectedMarcheDetails:', selectedMarcheDetails);
      console.log('selectedNumPrix:', selectedNumPrix);
      console.log('selectedReference:', selectedReference);
      console.log('selectedReferenceDetails:', selectedReferenceDetails);

      // Validation des champs requis
      //if (!selectedMarcheDetails || !selectedNumPrix || !selectedReference) {
        //alert('Veuillez remplir tous les champs obligatoires (Marché, Numéro de Prix et Référence)');
        //return;
      //}

      // Validation du champ obligatoire Marché/BC
if (!marcheBC) {
  setFactureValidationMessage("Veuillez d'abord saisir un marché dans le champ Marché/BC");
  setShowFactureValidationModal(true);
  return;
}

// Validation des autres champs obligatoires
if (!selectedNumPrix || !selectedReference) {
  alert('Veuillez remplir tous les champs obligatoires (Numéro de Prix et Référence)');
  return;
}

      // Récupérer le detailProjet actuel
      //const currentDetailProjet = selectedMarcheDetails.detailProjet || [];
      //console.log('currentDetailProjet:', currentDetailProjet);

      // Récupérer le detailProjet actuel, même si selectedMarcheDetails est null
let currentDetailProjet = [];
let marcheDetails = selectedMarcheDetails;

if (!marcheDetails || !marcheDetails.detailProjet) {
  // Aller chercher les détails du marché via l'API
  try {
    const response = await fetch(`http://localhost:5003/api/amarches/${marcheBC}`);
    if (!response.ok) {
      alert("Impossible de récupérer les détails du marché.");
      return;
    }
    marcheDetails = await response.json();
    currentDetailProjet = marcheDetails.detailProjet || [];
  } catch (e) {
    alert("Erreur lors de la récupération des détails du marché.");
    return;
  }
} else {
  currentDetailProjet = marcheDetails.detailProjet;
}
console.log('currentDetailProjet:', currentDetailProjet);

      // Trouver l'index du détail avec le numeroPrix correspondant
      const detailIndex = currentDetailProjet.findIndex(detail => detail.numeroPrix === selectedNumPrix);
      console.log('detailIndex:', detailIndex);

      if (detailIndex === -1) {
        alert('Veuillez d\'abord créer le détail projet avec ce numéro de prix');
        return;
      }

      // Créer le nouvel objet detailsPrix
      const newDetailsPrixEntry = {
        reference: selectedReference,
        designation: selectedReferenceDetails?.designation || '',
        typeProduit: selectedReferenceDetails?.type_produit || '',
        marque: selectedReferenceDetails?.marque || ''
      };
      console.log('newDetailsPrixEntry:', newDetailsPrixEntry);

      // Créer une copie du tableau detailProjet
      const updatedDetailProjet = [...currentDetailProjet];

      // Initialiser ou mettre à jour le tableau detailsPrix
      if (!updatedDetailProjet[detailIndex].detailsPrix) {
        updatedDetailProjet[detailIndex].detailsPrix = [];
      }

      // Ajouter le nouveau detailsPrix
      updatedDetailProjet[detailIndex].detailsPrix.push(newDetailsPrixEntry);
      console.log('updatedDetailProjet:', updatedDetailProjet);

      // Préparer les données pour la mise à jour
      const updateData = {
        ...marcheDetails,
        detailProjet: updatedDetailProjet
      };
      console.log('updateData:', updateData);

      // Appel API pour mettre à jour le marché
      const response = await fetch(`http://localhost:5003/api/amarches/${marcheDetails.marcheBC}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur lors de la sauvegarde: ${errorData.message || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Réponse API:', responseData);

      // Mettre à jour l'état local
      setSelectedMarcheDetails(prev => ({
        ...prev,
        detailProjet: updatedDetailProjet
      }));

      // Réinitialiser le formulaire
      //setSelectedNumPrix('');
      //setSelectedReference('');
      //setSelectedReferenceDetails({});

      // Après
// Réinitialiser le formulaire
clearDetailForm();
      
      // Afficher le message de succès
      //alert('Détails prix enregistrés avec succès');

      // Après
      alert('Détails prix enregistrés avec succès');
      // Rafraîchir la page après un court délai
      setTimeout(() => {
  window.location.reload();
}, 1500);
    } catch (error) {
      console.error('Erreur complète:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  };

  // États pour le formulaire de fiche
  const [dateFiche, setDateFiche] = useState('');
  const [typeFiche, setTypeFiche] = useState('');
  const [descriptionFiche, setDescriptionFiche] = useState('');
  const [intituleFiche, setIntituleFiche] = useState('');
  const [garantieFiche, setGarantieFiche] = useState('');
  const [delaiExecutionFiche, setDelaiExecutionFiche] = useState('');
  const [numAOFiche, setNumAOFiche] = useState('');
  const [jdeFiche, setJdeFiche] = useState('');
  const [ficheFile, setFicheFile] = useState(null);

  // Dans la partie du formulaire de fiche, ajoutez les onChange handlers
  return (
    <>

      <Row>
        <Col sm={12}>
          <Card>
            {/* HEADER */}
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Button 
                  id="new-button" 
                  variant="success" 
                  className="ms-2 action-button"
                  onClick={handleNew}
                >
                  <FaPlus className="me-2" /> Nouveau
                </Button>
                <Button 
                  variant="primary" 
                  className="ms-2 action-button" 
                  onClick={handleAMValidate}
                >
                  <FaSave className="me-2" /> Valider
                </Button>
                {showUploadMarche && (
                  <Button 
                    variant="warning" 
                    className="ms-2 action-button"
                    onClick={() => setShowMarcheUploadModal(true)}
                  >
                    <FaUpload className="me-2" />Upload Marché
                  </Button>
                )}
              </div>
              <div>
                {/** 
                <Button variant="info" className="action-button" onClick={handlePrint}>
                  <FaPrint className="me-2" /> Imprimer
                </Button>
                */}
              </div>
            </Card.Header>

            {/* Nouveaux boutons principaux style oval */}
            <div className="d-flex justify-content-between p-2" style={{ backgroundColor: "#f8f9fa" }}>
              <Button 
                variant={activeMainTab === "infos" ? "primary" : "light"}
                className="w-100 mx-1"
                onClick={() => setActiveMainTab("infos")}
                style={{ borderRadius: "50px" }}
              >
                <FaBriefcase className="me-2" /> Infos
              </Button>
              <Button 
                variant={activeMainTab === "suivi-validation" ? "primary" : "light"}
                className="w-100 mx-1"
                onClick={() => setActiveMainTab("suivi-validation")}
                style={{ borderRadius: "50px" }}
              >
                <FaClipboardCheck className="me-2" /> Suivi et Validation
              </Button>
              <Button 
                variant={activeMainTab === "documents-admin" ? "primary" : "light"}
                className="w-100 mx-1"
                onClick={() => setActiveMainTab("documents-admin")}
                style={{ borderRadius: "50px" }}
              >
                <FaFolder className="me-2" /> Documents Admin
              </Button>
            </div>

            {/* BODY */}
            <Card.Body>
            {activeMainTab === "infos" && (
              <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label><FaShoppingBag className="me-2" />Marché/BC</Form.Label>
                        <Form.Control 
                          type="text" 
                          className="form-control-modern"
                          value={marcheBC}
                          onChange={(e) => setMarcheBC(e.target.value)}
                        />
                      </Form.Group>
                  <Form.Group className="mb-3">
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Marché"
                        name="marcheBCType"
                        value="marche"
                        checked={marcheBCType === "marche"}
                        onChange={handleMarcheBCChange}
                        className="form-check-modern"
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="BC"
                        name="marcheBCType"
                        value="bc"
                        checked={marcheBCType === "bc"}
                        onChange={handleMarcheBCChange}
                        className="form-check-modern"
                      />
                    </div>
                  </Form.Group>
                 
                  <Form.Group className="mb-3">
                    <Form.Label><FaFileAlt className="me-2" />Intitulé Projet</Form.Label>
                    <Form.Control type="text" className="form-control-modern" 
                     value={intituleProjet}
                     onChange={(e) => setintituleProjet(e.target.value)}
                     
                    />
                  </Form.Group>
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
                    <Form.Label><FaUser className="me-2" />Demandeur</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" value={selectedDemandeurAffectation} readOnly className="form-control-modern" />
                      <Button variant="secondary" className="search-button" onClick={toggleDemandeurPopup}>
                        <FaSearch />
                      </Button>
                    </InputGroup>
                    {showDemandeurPopup && (
                      <div className="popup">
                        <Form.Control
                          type="text"
                          placeholder="Filter..."
                          value={demandeurFilterText}
                          onChange={(e) => setDemandeurFilterText(e.target.value)}
                          className="mb-2 form-control-modern"
                        />
                        <div className="table-responsive-popup">
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Affectation</th>
                                <th>Responsable</th>
                                <th>Direction</th>
                                <th>Département</th>
                                <th>Service</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDemandeurData.map((row, index) => (
                                <tr 
                                  key={index} 
                                  onClick={() => {
                                    setSelectedDemandeurRow(index);
                                    setSelectedDemandeurId(row.idaff);
                                    setSelectedDemandeurAffectation(row.affectation);
                                    setShowDemandeurPopup(false);
                                  }}
                                  className={selectedDemandeurRow === index ? 'selected-row' : ''}
                                >
                                  <td>{row.idaff}</td>
                                  <td>{row.affectation}</td>
                                  <td>{row.responsable}</td>
                                  <td>{row.Direction}</td>
                                  <td>{row.Département}</td>
                                  <td>{row.Service}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </Form.Group>
                 
                  
                  <Form.Group className="mb-3">
                    <Form.Label><FaTag className="me-2" />Type Marché</Form.Label>
                    <Form.Select 
                      value={selectedTypeMarche} 
                      onChange={handleTypeMarcheChange} 
                      className="form-control-modern"
                    >
                      <option value="" disabled>Sélectionner un type</option>
                      <option value="Local">Local</option>
                      <option value="International">International</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaFileAlt className="me-2" />Description Projet</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={descriptionProjet}
                      onChange={(e) => setDescriptionProjet(e.target.value)}
                      className="form-control-modern"
                    />
                  </Form.Group>
                  
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="form-control-modern"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Année Marché</Form.Label>
                    <Form.Control type="text" className="form-control-modern" />
                  </Form.Group>
                  
                  {/** 
                  <Form.Group className="mb-3">
                    <Form.Label><FaTag className="me-2" />Délai d'exécution (j)</Form.Label>
                    <Form.Control type="number" className="form-control-modern" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaFileAlt className="me-2" />Num AO</Form.Label>
                    <Form.Control type="number" className="form-control-modern" />
                  </Form.Group>
                  */}
                  <Form.Group className="mb-3">
                    <Form.Label><FaShieldAlt className="me-2" />Garantie</Form.Label>
                    <Form.Control
                      type="text"
                      value={garantie}
                      onChange={(e) => setGarantie(e.target.value)}
                      className="form-control-modern"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaClock className="me-2" />Délai d'exécution</Form.Label>
                    <Form.Control
                      type="text"
                      value={delaiExecution}
                      onChange={(e) => setDelaiExecution(e.target.value)}
                      className="form-control-modern"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label><FaClipboardList className="me-2" />Famille Projet</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" value={selectedFamilleProjetDesignation} readOnly className="form-control-modern" />
                      <Button variant="secondary" className="search-button" onClick={toggleFamilleProjetPopup}>
                        <FaSearch />
                      </Button>
                    </InputGroup>
                    {showFamilleProjetPopup && (
                      <div className="popup">
                        <Form.Control
                          type="text"
                          placeholder="Filter..."
                          value={familleProjetFilterText}
                          onChange={(e) => setFamilleProjetFilterText(e.target.value)}
                          className="mb-2 form-control-modern"
                        />
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Code</th>
                              <th>Désignation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredFamilleProjetData.map((row, index) => (
                              <tr 
                                key={index} 
                                onClick={() => {
                                  setSelectedFamilleProjetRow(index);
                                  setSelectedFamilleProjetCode(row.code);
                                  setSelectedFamilleProjetDesignation(row.designation);
                                  setShowFamilleProjetPopup(false);
                                }}
                                className={selectedFamilleProjetRow === index ? 'selected-row' : ''}
                              >
                                <td>{row.code}</td>
                                <td>{row.designation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaFileAlt className="me-2" />Fiche Projet</Form.Label>
                    <InputGroup>
                      <Form.Control type="text" value={selectedFicheProjetTitle} readOnly className="form-control-modern" />
                      <Button variant="secondary" className="search-button" onClick={toggleFicheProjetPopup}>
                        <FaSearch />
                      </Button>
                    </InputGroup>
                    {showFicheProjetPopup && (
                      <div className="popup">
                        <Form.Control
                          type="text"
                          placeholder="Filter..."
                          value={ficheProjetFilterText}
                          onChange={(e) => setFicheProjetFilterText(e.target.value)}
                          className="mb-2 form-control-modern"
                        />
                        <div className="table-responsive-popup">
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Titre</th>
                                <th>Date Projet</th>
                                <th>Chef Projet</th>
                                <th>Commission</th>
                                <th>Type</th>
                                <th>Fiche Projet File</th>
                                <th>Fiche Affectation File</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredFicheProjetData.map((row, index) => (
                                <tr 
                                  key={index} 
                                  onClick={() => {
                                    setSelectedFicheProjetRow(index);
                                    setSelectedFicheProjetId(row.id);
                                    setSelectedFicheProjetTitle(row.title);
                                    setShowFicheProjetPopup(false);
                                  }}
                                  className={selectedFicheProjetRow === index ? 'selected-row' : ''}
                                >
                                  <td>{row.id}</td>
                                  <td>{row.title}</td>
                                  <td>{row.dateProjet}</td>
                                  <td>{row.chefProjet}</td>
                                  <td>{row.Commission}</td>
                                  <td>{row.type}</td>
                                  <td>{row.ficheProjetFile}</td>
                                  <td>{row.ficheAffectationFile}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaFileAlt className="me-2" />Num AO</Form.Label>
                    <Form.Control
                      type="text"
                      value={numAO}
                      onChange={(e) => setNumAO(e.target.value)}
                      className="form-control-modern"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaBarcode className="me-2" />JDE</Form.Label>
                    <Form.Control
                      type="text"
                      value={jde}
                      onChange={(e) => setJde(e.target.value)}
                      className="form-control-modern"
                    />
                  </Form.Group>


                  {/** 
                  <Form.Group className="mb-3">
                    <Form.Label><FaFingerprint className="me-2" />JDE</Form.Label>
                    <Form.Control type="number" className="form-control-modern" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Garantie</Form.Label>
                    <Form.Control type="number" className="form-control-modern" />
                  </Form.Group>
                  */}
                  {/* Suppression du bouton Upload Marché ici */}
                </Col>
              </Row>
            )}

              {/* Onglets */}
              {/* Affichage conditionnel des onglets en fonction du bouton sélectionné */}
              {activeMainTab === "infos" && (
                  


              <Tabs defaultActiveKey="prix" className="mb-3">
              
              
                <Tab eventKey="prix" title="Prix">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Numéro de Prix</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="numeroPrix"
                          value={detailProjetFormData.numeroPrix}
                          onChange={handleDetailProjetChange}
                          className="form-control-modern" 
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Unité</Form.Label>
                        <Form.Select 
                          name="unite"
                          value={detailProjetFormData.unite}
                          onChange={handleDetailProjetChange}
                          className="form-control-modern"
                        >
                          <option value="" disabled>Sélectionner une unité</option>
                          <option value="U">U</option>
                          <option value="ML">ML</option>
                          <option value="KG">KG</option>
                          <option value="ENS">ENS</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><FaClipboardList className="me-2" />Quantité</Form.Label>
                        <Form.Control 
                          type="number" 
                          name="quantite"
                          value={detailProjetFormData.quantite}
                          onChange={handleDetailProjetChange}
                          className="form-control-modern" 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Prix Unit</Form.Label>
                        <Form.Control 
                          type="number" 
                          name="prixUnitaire"
                          value={detailProjetFormData.prixUnitaire}
                          onChange={handleDetailProjetChange}
                          className="form-control-modern" 
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label><FaTag className="me-2" />Num Lot</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="numLot"
                          value={detailProjetFormData.numLot}
                          onChange={handleDetailProjetChange}
                          className="form-control-modern" 
                        />
                      </Form.Group>
                      
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label><FaClipboardList className="me-2" />Objet Prix</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="objetPrix"
                      value={detailProjetFormData.objetPrix}
                      onChange={handleDetailProjetChange}
                      className="form-control-modern" 
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end mt-3">
                    <Button 
                      variant="secondary" 
                      className="me-2" 
                      onClick={handleDetailFormClear}
                      disabled={!detailProjetFormData.numeroPrix && !detailProjetFormData.objetPrix}
                    >
                      {selectedDetailRow !== null ? "Annuler l'édition" : "Effacer"}
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handleAMValidate}
                    >
                      {selectedDetailRow !== null ? "Mettre à jour" : "Valider"}
                    </Button>
                  </div>

                  {/* Tableau des données du détail projet */}
                  {showDetailProjetTable && detailProjetTableData.length > 0 && (
                    <div className="mt-4">
                      <Table hover bordered className="custom-table">
                        <thead>
                          <tr>
                            <th>Numéro Prix</th>
                            <th>Objet Prix</th>
                            <th>Unité</th>
                            <th>Quantité</th>
                            <th>Prix Unitaire</th>
                            <th>Prix Total HTVA</th>
                            <th>Numéro Lot</th>
                            <th>Demandeur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailProjetTableData.map((data, index) => (
                            <tr 
                              key={index}
                              onClick={() => handleDetailRowSelect(index)}
                              className={selectedDetailRow === index ? 'selected-row' : ''}
                            >
                              <td>{data.numeroPrix}</td>
                              <td>{data.objetPrix}</td>
                              <td>{data.unite}</td>
                              <td>{data.quantite}</td>
                              <td>{data.prixUnitaire}</td>
                              <td>{data.prixTotalHTVA}</td>
                              <td>{data.numLot}</td>
                              <td>{data.demandeur}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="fiches" title="Fiches">
                  <Card className="custom-card">
                    <Card.Body className="p-4">
                <Form onSubmit={handleFichesSubmit}>
                        <Row>
                          <Col md={6}>
      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaFileAlt className="me-2" />Intitulé du projet
                              </Form.Label>
        <Form.Control
          as="textarea" rows={3}
          name="intituleProjet"
          value={fichesFormData.intituleProjet}
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>

      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaCalendarAlt className="me-2" />Date du projet
                              </Form.Label>
        <Form.Control
          type="date"
          name="dateProjet"
          value={fichesFormData.dateProjet}
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>

      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaUserTie className="me-2" />Chef de projet
                              </Form.Label>
        <Form.Control
          type="text"
          name="chefProjet"
          value={fichesFormData.chefProjet}
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>
                          </Col>

                          <Col md={6}>
      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaUsers className="me-2" />Commission
                              </Form.Label>
        <Form.Control
          as="textarea" rows={3}
          name="commission"
          value={fichesFormData.commission}
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>

      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaFile className="me-2" />Fiche de projet
                              </Form.Label>
        <Form.Control
          type="file"
          name="ficheProjet"
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>

      <Form.Group className="mb-3">
                              <Form.Label className="fw-bold d-flex align-items-center">
                                <FaFileAlt className="me-2" />Fiche d'affectation
                              </Form.Label>
        <Form.Control
          type="file"
          name="ficheAffectation"
          onChange={handleFichesChange}
          required
                                className="form-control-modern"
        />
      </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-end mt-4">
                          <Button variant="primary" type="submit" className="action-button">
                            <FaCheck className="me-2" /> Valider
      </Button>
                        </div>
    </Form>
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="Détails_prix" title="Détails prix">
                  
                                      <Row>
                                        <Col md={6}>
                                        {/**
                                        <Form.Group className="mb-3">
                                                              <Form.Label><FaClipboardList className="me-2" />Marché</Form.Label>
                                                            <InputGroup>
                                                                <Form.Control type="text" value={selectedMarche} readOnly />
                                                                <Button 
                                                                  variant="secondary" 
                                                                  className="search-button" 
                                                                  onClick={toggleMarchePopup}
                                                                  disabled={isMarcheDisabled}
                                                                >
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
                                <tr key={index} onClick={() => {
                                  setSelectedMarche(row.marcheBC);
                                  setSelectedMarcheDetails(row);
                                  setGeneratedNumber(`SM-${Math.floor(Math.random() * 10000)}`);
                                  setShowMarchePopup(false);
                                  setShowDetailTable(true);
                                  setIsMarcheDisabled(true);
                                  setMarcheArticlesData(marcheArticlesData.filter(article => article.marche === row.marcheBC));
                                }}>
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
                                                                </div>
                                                              )}
                                                          </Form.Group>
                                                           */}


                                    <Form.Group className="mb-3">
                                      <Form.Label>Numéro de Prix</Form.Label>
                                      <InputGroup>
                                              <Form.Control type="text" value={selectedNumPrix} readOnly />
                                              <Button variant="secondary" onClick={toggleNumPrixPopup}>
                                                <FaSearch />
                                              </Button>
                                      </InputGroup>
                                            {showNumPrixPopup && (
                                              <div className="popup">
                                                <Form.Control
                                                  type="text"
                                                  placeholder="Rechercher..."
                                                  value={numPrixFilterText}
                                                  onChange={(e) => setNumPrixFilterText(e.target.value)}
                                                  className="mb-2"
                                                />
                                                <Table striped bordered hover size="sm">
                                                  <thead>
                                                    <tr>
                                                      <th>Numéro Prix</th>
                                                      <th>Unité</th>
                                                      <th>Quantité</th>
                                                      <th>Prix Unitaire</th>
                                                      <th>Objet Prix</th>
                                                      <th>N° Lot</th>
                                                      <th>Prix Total HTVA</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {filteredNumPrixData.map((row, index) => (
                                                      <tr key={index} onClick={() => {
                                                        setSelectedNumPrix(row.numeroPrix);
                                                        setSelectedNumPrixDetails(row);
                                                        setShowNumPrixPopup(false);
                                                        // Remplir automatiquement les champs
                                                        setSelectedUnite(row.unite || 'U');
                                                        setQuantite(row.quantite || '0');
                                                        setPrix(row.prixUnitaire || '0');
                                                        // Remplir le champ Objectif Prix avec la valeur de Objet Prix
                                                        setSelectedNumPrixDetails(prev => ({
                                                          ...prev,
                                                          objectif_prix: row.objetPrix || ''
                                                        }));
                                                      }}>
                                                        <td>{row.numeroPrix}</td>
                                                        <td>{row.unite}</td>
                                                        <td>{row.quantite}</td>
                                                        <td>{row.prixUnitaire}</td>
                                                        <td>{row.objetPrix}</td>
                                                        <td>{row.numLot}</td>
                                                        <td>{row.prixTotalHTVA}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </Table>
                                              </div>
                                            )}
                                          </Form.Group>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Objet Prix</Form.Label>
                                            <Form.Control type="text" value={selectedNumPrixDetails.objectif_prix || ''} readOnly />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Référence</Form.Label>
                                      <InputGroup>
                                              <Form.Control type="text" value={selectedReference} readOnly />
                                              <Button variant="secondary" onClick={toggleReferencePopup}>
                                                <FaSearch />
                                              </Button>
                                      </InputGroup>
                                            {showReferencePopup && (
                                              <div className="popup">
                                                <Form.Control
                                                  type="text"
                                                  placeholder="Rechercher..."
                                                  value={referenceFilterText}
                                                  onChange={(e) => setReferenceFilterText(e.target.value)}
                                                  className="mb-2"
                                                />
                                                <Table striped bordered hover size="sm">
                                                  <thead>
                                                    <tr>
                                                      <th>Code</th>
                                                      <th>Désignation</th>
                                                      <th>Famille</th>
                                                      <th>Marque</th>
                                                      <th>Ref</th>
                                                      <th>Code Ext</th>
                                                      <th>Serialisable</th>
                                                      <th>Rayon</th>
                                                      <th>Stock Min</th>
                                                      <th>Stock Max</th>
                                                      <th>Désignation Long</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {filteredReferenceData.map((row, index) => (
                                                      <tr key={index} onClick={() => {
                                                        setSelectedReference(row.code);
                                                        setSelectedReferenceDetails(row);
                                                        setShowReferencePopup(false);
                                                      }}>
                                                        <td>{row.code}</td>
                                                        <td>{row.designation}</td>
                                                        <td>{row.famille}</td>
                                                        <td>{row.marque}</td>
                                                        <td>{row.ref}</td>
                                                        <td>{row.codeExt}</td>
                                                        <td>{row.serialisable}</td>
                                                        <td>{row.rayon}</td>
                                                        <td>{row.stock_min}</td>
                                                        <td>{row.stock_max}</td>
                                                        <td>{row.designation_long}</td>
                                                      </tr>
                                                    ))}
                                                  </tbody>
                                                </Table>
                                              </div>
                                            )}
                                          </Form.Group>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Désignation</Form.Label>
                                            <Form.Control type="text" value={selectedReferenceDetails.designation || ''} readOnly />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Type Produit</Form.Label>
                                            <Form.Control type="text" value={selectedReferenceDetails.famille || ''} readOnly />
                                    </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Marque</Form.Label>
                                            <Form.Control type="text" value={selectedReferenceDetails.marque || ''} readOnly />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Unité</Form.Label>
                                            <Form.Select 
                                              value={selectedUnite}
                                              onChange={(e) => setSelectedUnite(e.target.value)}
                                            >
                                              <option value="U">U</option>
                                              <option value="KG">KG</option>
                                              <option value="ML">ML</option>
                                              <option value="ENS">ENS</option>
                                      </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quantité</Form.Label>
                                            <Form.Control
                                              type="number"
                                              value={quantite}
                                              onChange={handleQuantityChange}
                                              min="0"
                                              step="1"
                                            />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Prix</Form.Label>
                                            <Form.Control
                                              type="number"
                                              value={prix}
                                              onChange={handlePriceChange}
                                              min="0"
                                              step="0.01"
                                            />
                                    </Form.Group>
                                          <Button variant="danger" className="delete-button mt-3" onClick={clearDetailForm}>
                                            <FaTrash className="me-2" /> Effacer
                                          </Button>
                                          <Button variant="success" className="save-button mt-3 ms-2" onClick={handleSaveDetailsPrix}>
                                            <FaSave className="me-2" /> Enregistrer
                                          </Button>
                                        </Col>
                                      </Row>
                                      
                                      {/* Tableau des détails existants */}
                                      {detailProjetTableData.length > 0 && (
                                        
                                        <div className="mt-4">
                                          {/**
                                          <h5 className="mb-3 d-flex align-items-center">
                                            <FaClipboardList className="me-2" /> Liste des détails du marché
                                          </h5>
                                          */}
                                          <div className="table-responsive">
                                            {/**
                                            <Table hover bordered className="table-modern">
                                              <thead className="bg-light">
                                                <tr>
                                                  <th className="text-nowrap">Numéro Prix</th>
                                                  <th className="text-nowrap">Objet Prix</th>
                                                  <th className="text-nowrap">Unité</th>
                                                  <th className="text-nowrap">Quantité</th>
                                                  <th className="text-nowrap">Prix Unitaire</th>
                                                  <th className="text-nowrap">Prix Total HTVA</th>
                                                  <th className="text-nowrap">N° Lot</th>
                                                  <th className="text-nowrap">Demandeur</th>
                                                  <th className="text-nowrap">Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {detailProjetTableData.map((detail, index) => (
                                                  <tr 
                                                    key={index}
                                                    className={selectedDetailRow === index ? 'selected-row' : ''}
                                                    onClick={() => handleDetailRowSelect(index)}
                                                  >
                                                    <td>{detail.numeroPrix}</td>
                                                    <td>{detail.objetPrix}</td>
                                                    <td>{detail.unite}</td>
                                                    <td>{detail.quantite}</td>
                                                    <td>{detail.prixUnitaire}</td>
                                                    <td>{detail.prixTotalHTVA}</td>
                                                    <td>{detail.numLot}</td>
                                                    <td>{detail.demandeur}</td>
                                                    <td>
                                                      <div className="d-flex gap-2">
                                                        <Button 
                                                          variant="outline-warning" 
                                                          size="sm" 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDetailRowSelect(index);
                                                          }}
                                                        >
                                                          <FaEdit />
                                                        </Button>
                                                        <Button 
                                                          variant="outline-danger" 
                                                          size="sm" 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Supprimer la ligne
                                                            const newDetailProjetTableData = [...detailProjetTableData];
                                                            newDetailProjetTableData.splice(index, 1);
                                                            setDetailProjetTableData(newDetailProjetTableData);
                                                            setSelectedDetailRow(null);
                                                          }}
                                                        >
                                                          <FaTrash />
                                                        </Button>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </Table>
                                            {/** */}
                                          </div>
                                        </div>
                                        
                                      )}
                                      {/* Table to display saved detailPrix */}
                                      {selectedMarcheDetails?.detailPrix && selectedMarcheDetails.detailPrix.length > 0 && (
                                        <div className="mt-4">
                                          <h5 className="mb-3">Détails Prix Enregistrés</h5>
                                          <Table hover bordered>
                                            <thead>
                                              <tr>
                                                <th>Numéro de Prix</th>
                                                <th>Référence</th>
                                                <th>Désignation</th>
                                                <th>Type Produit</th>
                                                <th>Marque</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {selectedMarcheDetails.detailPrix.map((detail, index) => (
                                                <tr key={index}>
                                                  <td>{detail.numeroPrix}</td>
                                                  <td>{detail.reference}</td>
                                                  <td>{detail.designation}</td>
                                                  <td>{detail.typeProduit}</td>
                                                  <td>{detail.marque}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        </div>
                                      )}
                </Tab> 
{/** 
                <Tab eventKey="situation_projet" title="Situation Projet">
                  <p>Contenu de l'onglet Situation Projet...</p>
                </Tab> 
                */}
                <Tab eventKey="ordre_service" title="Ordre de service">
                  <Card className="custom-card">
                    <Card.Header className="bg-light d-flex justify-content-between align-items-center p-3">
                      <div className="d-flex gap-2">
                        <Button variant="success" className="action-button" onClick={handleAddOrdreService}>
                          <FaPlus className="me-2" /> Ajouter
                        </Button>
                        
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-edit-os">
                              {!selectedOrdreService ? "Veuillez sélectionner une ligne à modifier" : "Modifier la ligne sélectionnée"}
                            </Tooltip>
                          }
                        >
                          <span className="d-inline-block">
                            <Button 
                              variant="warning" 
                              className="action-button" 
                              onClick={handleEditOrdreService} 
                              disabled={!selectedOrdreService}
                            >
                              <FaEdit className="me-2" /> Modifier
                            </Button>
                          </span>
                        </OverlayTrigger>
                        
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-delete-os">
                              {!selectedOrdreService ? "Veuillez sélectionner une ligne à supprimer" : "Supprimer la ligne sélectionnée"}
                            </Tooltip>
                          }
                        >
                          <span className="d-inline-block">
                            <Button 
                              variant="danger" 
                              className="action-button" 
                              onClick={handleDeleteOrdreService} 
                              disabled={!selectedOrdreService}
                            >
                              <FaTrash className="me-2" /> Supprimer
                            </Button>
                          </span>
                        </OverlayTrigger>
      </div>
                    </Card.Header>

                    <Card.Body className="p-4">
                      {ordreServiceList.length === 0 ? (
                        <div className="text-center p-4 empty-state">
                          <FaInfoCircle size={40} className="text-muted mb-3" />
                          <h5>Aucun ordre de service disponible</h5>
                          <p className="text-muted">Cliquez sur "Ajouter" pour créer un nouvel ordre de service.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <Table hover bordered className="custom-table" ref={ordreServiceTableRef}>
        <thead>
          <tr>
                                <th className="text-center" style={{ width: '50px' }}>#</th>
            <th>ID Auto-généré</th>
            <th>Numéro OS</th>
            <th>Date OS</th>
                                <th>Type OS</th>
            <th>Fichier</th>
          </tr>
        </thead>
        <tbody>
          {ordreServiceList.map((ordreService, index) => (
                                <tr
                                  key={index}
                                  onClick={() => setSelectedOrdreService(ordreService)}
                                  className={selectedOrdreService === ordreService ? "selected-row" : ""}
                                >
                                  <td className="text-center">{index + 1}</td>
              <td>{ordreService.idAutoGenere}</td>
              <td>{ordreService.numeroOrdreService}</td>
                                  <td>{ordreService.dateOrdreService ? (() => {
                                    const dateObj = new Date(ordreService.dateOrdreService);
                                    if (isNaN(dateObj.getTime())) return 'Date invalide';
                                    
                                    const day = String(dateObj.getDate()).padStart(2, '0');
                                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const year = dateObj.getFullYear().toString().substring(0, 4);
                                    
                                    return `${day}/${month}/${year}`;
                                  })() : ''}</td>
                                  <td>{ordreService.typeOs}</td>
                                  <td>
                                    {ordreService.fichier !== "Aucun" ? (
                                      <Button 
                                        variant="link" 
                                        className="file-link p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleFileDownload(ordreService);
                                        }}
                                      >
                                        <FaDownload className="me-2" />
                                        {ordreService.fichier.name}
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

                      {/* Modal Ajouter OS */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Ordre de Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control type="text" disabled value="ID auto-généré" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Numéro OS</Form.Label>
              <Form.Control
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type OS</Form.Label>
              <Form.Select
                name="typeOs"
                value={formData.typeOs}
                onChange={handleChange}
              >
                <option></option>
                <option>Premier OS</option>
                <option>Arret</option>
                <option>Reprise</option>
                <option>Autres</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date OS</Form.Label>
              <Form.Control
                type="date"
                name="dateOs"
                value={formData.dateOs}
                onChange={handleChange}
              />
            </Form.Group>
        
            <Form.Group className="mb-3">
              <Form.Label>Uploader Document</Form.Label>
              <Form.Control
  type="file"
  name="document"
      onChange={handleFileChange} // Appel de la fonction handleFileChange lors du changement de fichier
   />

            </Form.Group>
            <Button variant="primary" onClick={handleValider}>Valider</Button>
          </Form>
        </Modal.Body>
              </Modal>

              {/* Modal Modifier OS */}
              <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Modifier un Ordre de Service</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro OS</Form.Label>
                      <Form.Control
                        type="text"
                        name="numero"
                        value={formData.numero}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Type OS</Form.Label>
                      <Form.Select
                        name="typeOs"
                        value={formData.typeOs}
                        onChange={handleChange}
                      >
                        <option>Premier OS</option>
                        <option>Arret</option>
                        <option>Reprise</option>
                        <option>Autres</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Date OS</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOs"
                        value={formData.dateOs}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleValider}>Mettre à jour</Button>
                  </Form>
                </Modal.Body>
              </Modal>

                {/* Modal Supprimer OS */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Supprimer un Ordre de Service</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>Êtes-vous sûr de vouloir supprimer cet Ordre de Service ?</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                    Annuler
                  </Button>
                  <Button variant="danger" onClick={confirmDelete}>
                    Confirmer la suppression
                  </Button>
                </Modal.Footer>
              </Modal>


                      {/* Modal Ajout/Modification */}
                      <Modal 
                        show={showAddOrdreServiceModal || showEditOrdreServiceModal} 
                        onHide={() => { 
                          setShowAddOrdreServiceModal(false); 
                          setShowEditOrdreServiceModal(false); 
                        }} 
                        centered
                        className="custom-modal"
                      >
                        <Modal.Header closeButton className="modal-colored-header bg-primary text-white">
                          <Modal.Title className="d-flex align-items-center">
                            {showEditOrdreServiceModal ? (
                              <><FaEdit className="me-2" />Modifier l'ordre de service</>
                            ) : (
                              <><FaPlus className="me-2" />Ajouter un ordre de service</>
                            )}
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Numéro OS</Form.Label>
                              <Form.Control
                                type="text"
                                name="numeroOrdreService"
                                value={ordreServiceFormData.numeroOrdreService}
                                onChange={handleOrdreServiceChange}
                                placeholder="Entrez le numéro d'ordre de service"
                                className="form-control-modern"
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Date OS</Form.Label>
                              <Form.Control
                                type="date"
                                name="dateOrdreService"
                                value={ordreServiceFormData.dateOrdreService}
                                onChange={handleOrdreServiceChange}
                                className="form-control-modern"
                                defaultValue={new Date().toISOString().split('T')[0]}
                              />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Type OS</Form.Label>
                              <Form.Select
                                name="typeOs"
                                value={ordreServiceFormData.typeOs}
                                onChange={handleOrdreServiceChange}
                                className="form-control-modern"
                              >
                                <option value="Premier OS">Premier OS</option>
                                <option value="Arret">Arret</option>
                                <option value="Reprise">Reprise</option>
                                <option value="Autres">Autres</option>
                              </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold">Fichier</Form.Label>
                              <Form.Control
                                type="file"
                                name="fichier"
                                onChange={handleOrdreServiceFileChange}
                                className="form-control-modern"
                              />
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2">
                              <Button 
                                variant="light" 
                                onClick={() => {
                                  setShowAddOrdreServiceModal(false);
                                  setShowEditOrdreServiceModal(false);
                                }}
                              >
                                <FaTimes className="me-2" /> Annuler
                              </Button>
                              <Button 
                                variant="primary" 
                                onClick={handleSaveOrdreService}
                                className="action-button"
                              >
                                <FaCheck className="me-2" /> {showEditOrdreServiceModal ? "Mettre à jour" : "Valider"}
                              </Button>
                            </div>
                          </Form>
                        </Modal.Body>
                      </Modal>

                      {/* Modal Suppression */}
                      <Modal 
                        show={showDeleteOrdreServiceModal} 
                        onHide={() => setShowDeleteOrdreServiceModal(false)} 
                        centered
                        className="custom-modal"
                      >
                        <Modal.Header closeButton className="modal-colored-header bg-danger text-white">
                          <Modal.Title className="d-flex align-items-center">
                            <FaTrash className="me-2" />
                            Supprimer un ordre de service
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                          <p className="mb-1">Êtes-vous sûr de vouloir supprimer cet ordre de service ?</p>
                          <p className="mb-0"><strong>Numéro OS : </strong>{selectedOrdreService?.numeroOrdreService}</p>
                        </Modal.Body>
                        <Modal.Footer className="bg-light">
                          <Button variant="light" onClick={() => setShowDeleteOrdreServiceModal(false)}>
                            <FaTimes className="me-2" /> Annuler
                          </Button>
                          <Button variant="danger" onClick={confirmOrdreServiceDelete} className="action-button">
                            <FaTrash className="me-2" /> Confirmer la suppression
                          </Button>
                        </Modal.Footer>
                      </Modal>

                      {/* Modal de validation pour l'ordre de service */}
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
                </Tab>
                </Tabs>
                )}

                {activeMainTab === "suivi-validation" && (

                
                  
                  <Tabs defaultActiveKey="pvrpt" className="mb-3 secondary-tabs">
                    
                <Tab eventKey="pvrpt" title="PVRPT">
                <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex gap-2">
                      <Button variant="success" className="action-button" onClick={handleAddPv}>
                        <FaPlus className="me-2" /> Ajouter
                      </Button>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-edit-pv">
                            {!selectedPv ? "Veuillez sélectionner une ligne à modifier" : "Modifier la ligne sélectionnée"}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <Button 
                            variant="warning" 
                            className="action-button" 
                            onClick={handleEditPv} 
                            disabled={!selectedPv}
                          >
                            <FaEdit className="me-2" /> Modifier
                          </Button>
                        </span>
                      </OverlayTrigger>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-delete-pv">
                            {!selectedPv ? "Veuillez sélectionner une ligne à supprimer" : "Supprimer la ligne sélectionnée"}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <Button 
                            variant="danger" 
                            className="action-button" 
                            onClick={handleDeletePv} 
                            disabled={!selectedPv}
                          >
                            <FaTrash className="me-2" /> Supprimer
                          </Button>
                        </span>
                      </OverlayTrigger>
                    </div>
      </div>

                  {(() => {
                    const displayedPvs = marcheBC ? pvList.filter(pv => pv.marcheBC === marcheBC) : [];
                    return (
                      displayedPvs.length === 0 ? (
                    <div className="text-center p-4 empty-state">
                      <FaInfoCircle size={40} className="text-muted mb-3" />
                      <h5>Aucun PVRPT disponible</h5>
                      <p className="text-muted">Cliquez sur "Ajouter" pour créer un nouveau PVRPT.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover bordered className="custom-table" ref={pvTableRef}>
        <thead>
          <tr>
                            <th className="text-center" style={{ width: '50px' }}>#</th>
                            <th>Date</th>
            <th>BL</th>
            <th>Avec Réserve</th>
                            <th>Document</th>
          </tr>
        </thead>
        <tbody>
                          {displayedPvs.map((pv, index) => (
                            <tr
                              key={index}
                              onClick={() => setSelectedPv(pv)}
                              onDoubleClick={() => {
                                setPvFormData(pv);
                                setShowEditPvModal(true);
                              }}
                              className={selectedPv === pv ? "selected-row" : ""}
                            >
                              <td className="text-center">{index + 1}</td>
                              <td>{pv.datePVRPT ? (() => {
                                // S'assurer que la date est valide
                                const dateObj = new Date(pv.datePVRPT);
                                if (isNaN(dateObj.getTime())) return 'Date invalide';
                                
                                // Formater la date manuellement en JJ/MM/AAAA
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const year = dateObj.getFullYear().toString().substring(0, 4); // S'assurer que l'année est sur 4 chiffres
                                
                                return `${day}/${month}/${year}`;
                              })() : ''}</td>
                              <td>{pv.BL}</td>
                              <td>{pv.avecReserve ? "Oui" : "Non"}</td>
                              <td>
                                {pv.document && pv.document !== "Aucun" ? (
                                  <Button 
                                    variant="link" 
                                    className="file-link"
                                    onClick={() => handlePvrptFileDownloadClick(pv)}
                                  >
                                    <FaDownload className="me-2" />
                                    Télécharger
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
                  )
                    );
                  })()}
                  {/* Modal Ajout/Modification PVRPT */}
                  <Modal 
                    show={showAddPvModal || showEditPvModal} 
                    onHide={() => { 
                      setShowAddPvModal(false); 
                      setShowEditPvModal(false); 
                    }} 
                    centered
                    className="custom-modal"
                  >
                    <Modal.Header closeButton className="modal-colored-header bg-primary text-white">
                      <Modal.Title className="d-flex align-items-center">
                        {showEditPvModal ? (
                          <><FaEdit className="me-2" />Modifier le PVRPT</>
                        ) : (
                          <><FaPlus className="me-2" />Ajouter un PVRPT</>
                        )}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                      <Form>
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Date PVRPT</Form.Label>
                          <Form.Control
                            type="date"
                            name="datePVRPT"
                            value={pvFormData.datePVRPT}
                            onChange={(e) => setPvFormData({...pvFormData, datePVRPT: e.target.value})}
                            className="form-control-modern"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">BL</Form.Label>
                          <Form.Control
                            type="text"
                            name="BL"
                            value={pvFormData.BL}
                            onChange={(e) => setPvFormData({...pvFormData, BL: e.target.value})}
                            placeholder="Entrez le BL"
                            className="form-control-modern"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="checkbox" 
                            label="Avec réserve" 
                            checked={pvFormData.avecReserve}
                            onChange={(e) => setPvFormData({...pvFormData, avecReserve: e.target.checked})}
                            className="form-check"
                          />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-bold">Document</Form.Label>
                          <Form.Control
                            type="file"
                            name="document"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setPvFormData((prevValues) => ({
                                ...prevValues,
                                document: file,
                              }));
                            }}
                            className="form-control-modern"
                          />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                          <Button 
                            variant="light" 
                            onClick={() => {
                              setShowAddPvModal(false);
                              setShowEditPvModal(false);
                            }}
                          >
                            <FaTimes className="me-2" /> Annuler
                          </Button>
                          <Button 
                            variant="primary" 
                            onClick={handlePvSubmit}
                            className="action-button"
                          >
                            <FaCheck className="me-2" /> {showEditPvModal ? "Mettre à jour" : "Valider"}
                          </Button>
                        </div>
                      </Form>
                    </Modal.Body>
                  </Modal>

                  {/* Modal Suppression PVRPT */}
                  <Modal 
                    show={showDeletePvModal} 
                    onHide={() => setShowDeletePvModal(false)} 
                    centered
                    className="custom-modal"
                  >
                    <Modal.Header closeButton className="modal-colored-header bg-danger text-white">
                      <Modal.Title className="d-flex align-items-center">
                        <FaTrash className="me-2" />
                        Supprimer un PVRPT
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                      <p className="mb-1">Êtes-vous sûr de vouloir supprimer ce PVRPT ?</p>
                      <p className="mb-0"><strong>Date : </strong>{selectedPv?.datePVRPT ? (() => {
                        const dateObj = new Date(selectedPv.datePVRPT);
                        if (isNaN(dateObj.getTime())) return 'Date invalide';
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const year = dateObj.getFullYear().toString().substring(0, 4);
                        return `${day}/${month}/${year}`;
                      })() : ''}</p>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                      <Button variant="light" onClick={() => setShowDeletePvModal(false)}>
                        <FaTimes className="me-2" /> Annuler
                      </Button>
                      <Button variant="danger" onClick={confirmPvDelete} className="action-button">
                        <FaTrash className="me-2" /> Confirmer la suppression
                      </Button>
                    </Modal.Footer>
                  </Modal>

                  {/* Modal de validation PVRPT */}
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
                </Tab>

                <Tab eventKey="pv" title={<><FaClipboardCheck className="me-2" />PV</>}>
                  <Card className="custom-card shadow-sm">
                    <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center p-3">
                      <h5 className="mb-0"><FaClipboardCheck className="me-2" />Procès-verbaux de réception</h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                <Row>
        <Col md={6}>
                          <Card className="mb-4 h-100 shadow-sm">
                            <Card.Header className="bg-info text-white d-flex align-items-center">
                              <FaFileAlt className="me-2" />
                              <h5 className="mb-0">PV de réception provisoire</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaFingerprint className="me-2" />ID
                                  </Form.Label>
                                  <Form.Control type="text" name="id" value={pvpFormData.id} disabled className="form-control-modern" />
            </Form.Group>

            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaCalendarAlt className="me-2" />Date
                                  </Form.Label>
                                  <Form.Control 
                                    type="date" 
                                    name="date"
                                    value={pvpFormData.date}
                                    onChange={handlePVPChange}
                                    defaultValue={defaultDate}
                                  />
            </Form.Group>

            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaTag className="me-2" />Type
                                  </Form.Label>
                                  <div className="d-flex">
                                    <Form.Check
                                      type="radio"
                                      id="pvp-marche-radio"
                                      name="pvpMarcheBC"
                                      label="Marché"
                                      value="marche"
                                      checked={pvpFormData.marcheBCType === 'marche'}
                                      onChange={handlePVPMarcheBCChange}
                                      className="me-3"
                                    />
                                    <Form.Check
                                      type="radio"
                                      id="pvp-bc-radio"
                                      name="pvpMarcheBC"
                                      label="BC"
                                      value="bc"
                                      checked={pvpFormData.marcheBCType === 'bc'}
                                      onChange={handlePVPMarcheBCChange}
                                    />
                                  </div>
            </Form.Group>

                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaFile className="me-2" />Fiche de projet
                                  </Form.Label>
                                  <Form.Control type="file" onChange={handlePVPFileChange} className="form-control-modern" />
            </Form.Group>

                                <div className="d-flex justify-content-end">
                                  <Button variant="primary" onClick={handlePVPSubmit} className="action-button">
                                    <FaCheck className="me-2" /> Enregistrer
                                  </Button>
                                </div>
          </Form>
                            </Card.Body>
                          </Card>
        </Col>

        <Col md={6}>
                          <Card className="mb-4 h-100 shadow-sm">
                            <Card.Header className="bg-info text-white d-flex align-items-center">
                              <FaFileSignature className="me-2" />
                              <h5 className="mb-0">PV de réception définitive</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaFingerprint className="me-2" />ID
                                  </Form.Label>
                                  <Form.Control type="text" name="id" value={pvdFormData.id} disabled className="form-control-modern" />
            </Form.Group>

            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaCalendarAlt className="me-2" />Date
                                  </Form.Label>
                                  <Form.Control 
                                    type="date" 
                                    name="date"
                                    value={pvdFormData.date}
                                    onChange={handlePVDChange}
                                    defaultValue={defaultDate}
                                  />
            </Form.Group>

            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaTag className="me-2" />Type
                                  </Form.Label>
                                  <div className="d-flex">
                                    <Form.Check
                                      type="radio"
                                      id="pvd-marche-radio"
                                      name="pvdMarcheBC"
                                      label="Marché"
                                      value="marche"
                                      checked={pvdFormData.marcheBCType === 'marche'}
                                      onChange={handlePVDMarcheBCChange}
                                      className="me-3"
                                    />
                                    <Form.Check
                                      type="radio"
                                      id="pvd-bc-radio"
                                      name="pvdMarcheBC"
                                      label="BC"
                                      value="bc"
                                      checked={pvdFormData.marcheBCType === 'bc'}
                                      onChange={handlePVDMarcheBCChange}
                                    />
                                  </div>
            </Form.Group>

            <Form.Group className="mb-3">
                                  <Form.Label className="fw-bold d-flex align-items-center">
                                    <FaFile className="me-2" />Fiche de projet
                                  </Form.Label>
                                  <Form.Control type="file" onChange={handlePVDFileChange} className="form-control-modern" />
            </Form.Group>

                                <div className="d-flex justify-content-end">
                                  <Button variant="primary" onClick={handlePVDSubmit} className="action-button">
                                    <FaCheck className="me-2" /> Enregistrer
                                  </Button>
                                </div>
          </Form>
                            </Card.Body>
                          </Card>
        </Col>
      </Row>
                    </Card.Body>
                  </Card>
                </Tab>

                <Tab eventKey="attestation_conformite" title="Attestation de conformité">
                  <Card className="custom-card">
                    <Card.Body className="p-4">
                      <Card>
                        <Card.Header className="">
                          <h5 className="mb-0">Upload de fichier</h5>
                        </Card.Header>
                        <Card.Body>
      <Form>
        <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Sélectionner un fichier</Form.Label>
                              <Form.Control 
                                type="file" 
                                onChange={handleFileSelect} 
                                className="form-control-modern"
                              />
        </Form.Group>

                            {selectedFiles.attestation && (
                              <div className="alert alert-info">
                                <FaInfoCircle className="me-2" />
                                Fichier sélectionné : {selectedFiles.attestation.name}
                              </div>
                            )}

                            <Button 
                              variant="primary" 
                              onClick={handleValidate} 
                              className="action-button"
                            >
                              <FaCheck className="me-2" /> Valider
        </Button>
      </Form>
                        </Card.Body>
                      </Card>

                      {/* Tableau des attestations */}
                      {attestations.length > 0 && (
                        <Card className="mt-4">
                          <Card.Header>
                            <h5 className="mb-0">Attestations de conformité</h5>
                          </Card.Header>
                          <Card.Body>
                            <Table hover bordered responsive>
                              <thead>
                                <tr>
                                  <th>Nom du fichier</th>
                                  <th>Date d'upload</th>
                                  <th>Taille</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {attestations.map((attestation) => (
                                  <tr key={attestation._id}>
                                    <td>{attestation.originalname}</td>
                                    <td>{new Date(attestation.uploadDate).toLocaleDateString()}</td>
                                    <td>{Math.round(attestation.size / 1024)} Ko</td>
                                    <td>
                                      <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => handleDownloadAttestation(attestation._id, attestation.originalname)}
                                      >
                                        <FaDownload className="me-2" /> Télécharger
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </Card.Body>
                        </Card>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Modal spécifique pour les messages d'attestation */}
                  <Modal 
                    show={showAttestationModal} 
                    onHide={() => setShowAttestationModal(false)}
                    centered
                    className="custom-modal"
                  >
                    <Modal.Header closeButton className={attestationMessage.includes("succès") ? "modal-colored-header bg-success text-white" : "modal-colored-header bg-warning text-white"}>
                      <Modal.Title className="d-flex align-items-center">
                        {attestationMessage.includes("succès") ? (
                          <><FaCheck className="me-2" />Succès</>
                        ) : (
                          <><FaExclamationCircle className="me-2" />Attention</>
                        )}
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                      <p className="mb-0">{attestationMessage}</p>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                      <Button 
                        variant={attestationMessage.includes("succès") ? "success" : "warning"} 
                        onClick={() => setShowAttestationModal(false)}
                        className="action-button"
                      >
                        <FaCheck className="me-2" /> OK
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </Tab>
                
                </Tabs>
                )}

                {activeMainTab === "documents-admin" && (
                  <Tabs defaultActiveKey="facture" className="mb-3 secondary-tabs">
                    

                <Tab eventKey="facture" title="Facture">
                <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex gap-2">
                      <Button variant="success" className="action-button" onClick={handleAddFacture}>
                        <FaPlus className="me-2" /> Ajouter
                      </Button>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-edit">
                            {!selectedFacture ? "Veuillez sélectionner une ligne à modifier" : "Modifier la ligne sélectionnée"}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <Button 
                            variant="warning" 
                            className="action-button" 
                            onClick={handleEditFacture} 
                            disabled={!selectedFacture}
                          >
                            <FaEdit className="me-2" /> Modifier
                          </Button>
                        </span>
                      </OverlayTrigger>
                      
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-delete">
                            {!selectedFacture ? "Veuillez sélectionner une ligne à supprimer" : "Supprimer la ligne sélectionnée"}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <Button 
                            variant="danger" 
                            className="action-button" 
                            onClick={handleDeleteFacture} 
                            disabled={!selectedFacture}
                          >
                            <FaTrash className="me-2" /> Supprimer
                          </Button>
                        </span>
                      </OverlayTrigger>
                    </div>
      </div>

                  {(() => {
  const displayedFactures = marcheBC ? factureList.filter(facture => facture.marcheBC === marcheBC) : [];
  return (
    displayedFactures.length === 0 ? (
                    <div className="text-center p-4 empty-state">
                      <FaInfoCircle size={40} className="text-muted mb-3" />
                      <h5>Aucune facture disponible</h5>
                      <p className="text-muted">Cliquez sur "Ajouter" pour créer une nouvelle facture.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover bordered className="custom-table" ref={factureTableRef}>
        <thead>
          <tr>
                            <th className="text-center" style={{ width: '50px' }}>#</th>
            
            <th>Numéro Facture</th>
            <th>Date Facture</th>
            <th>Montant</th>
            <th>Fichier</th>
            <th>BL</th>
          </tr>
        </thead>
        <tbody>
          {displayedFactures.map((facture, index) => (
                            <tr
                              key={index}
                              onClick={() => setSelectedFacture(facture)}
                              onDoubleClick={() => {
                                setFactureFormData(facture);
                                setShowEditFactureModal(true);
                              }}
                              className={selectedFacture === facture ? "selected-row" : ""}
                            >
                              <td className="text-center">{index + 1}</td>
              
              <td>{facture.numFacture}</td>
                              <td>{facture.dateFacture ? (() => {
                                const dateObj = new Date(facture.dateFacture);
                                if (isNaN(dateObj.getTime())) return 'Date invalide';
                                
                                const day = String(dateObj.getDate()).padStart(2, '0');
                                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const year = dateObj.getFullYear().toString().substring(0, 4);
                                
                                return `${day}/${month}/${year}`;
                              })() : ''}</td>
              <td>{facture.montant}</td>
                              <td>
                                {facture.fichier !== "Aucun" ? (
                                  <Button 
                                    variant="link" 
                                    className="file-link p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFactureFileDownloadClick(facture);
                                    }}
                                  >
                                    <FaDownload className="me-2" />
                                    {facture.fichier}
                                  </Button>
                                ) : (
                                  "Aucun"
                                )}
                              </td>
              <td>{facture.bl}</td>
            </tr>
          ))}
        </tbody>
      </Table>
                    </div>
                  )
  );
})()}
                </Tab>

                

                

                <Tab eventKey="bris" title="BRIs">
                  <Card className="custom-card">
                    <Card.Body className="p-4">
                      <Card>
                        {/**<Card.Header className="bg-primary text-white"> */}
                        <Card.Header className="">
                          <h5 className="mb-0">Gestion des Fichiers</h5>
                        </Card.Header>
                        <Card.Body>
                          <Form className="mb-4">
        <Form.Group className="mb-3">
                              <Form.Label className="fw-bold">Sélectionner un fichier</Form.Label>
                              <Form.Control 
                                type="file" 
                                onChange={handleFileSelectBRIs} 
                                className="form-control-modern"
                              />
        </Form.Group>

                            <Button 
                              variant="primary" 
                              onClick={handleUploadBRIs} 
                              className="action-button"
                            >
                              <FaPlus className="me-2" /> Upload
        </Button>
      </Form>

                          <div className="table-responsive">
                            <Table hover bordered className="custom-table">
        <thead>
          <tr>
                                  <th className="text-center" style={{ width: '50px' }}>#</th>
                                  <th>Nom du fichier</th>
            <th>Date</th>
                                  <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {fileListBRIs
              .filter(file => !marcheBC || file.marcheBC === marcheBC)
              .map((file) => (
            <tr key={file.id}>
                                    <td className="text-center">{file.id}</td>
              <td>{file.fileName}</td>
              <td>{file.date}</td>
              <td>
                                      <div className="d-flex gap-2">
                                        <Button 
                                          variant="success" 
                                          onClick={() => handleDownloadBRIs(file)}
                                          className="action-button"
                                        >
                                          <FaDownload className="me-2" /> Télécharger
                </Button>
                                        <Button 
                                          variant="danger" 
                                          onClick={() => handleRemoveBRIs(file.id)}
                                          className="action-button"
                                        >
                                          <FaTrash className="me-2" /> Supprimer
                </Button>
                                      </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
                          </div>

                          <div className="d-flex justify-content-end mt-4">
                            <Button 
                              variant="success" 
                              onClick={handleSaveBRIs} 
                              className="action-button"
                            >
                              <FaCheck className="me-2" /> Enregistrer
      </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Card.Body>
                  </Card>
                </Tab>
                </Tabs>
                )}

             
              <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmation d'impression</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        Êtes-vous sûr de vouloir imprimer ce document ?
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
                          Annuler
                        </Button>
                        <Button variant="primary" onClick={confirmPrint}>
                          Confirmer et imprimer
                        </Button>
                      </Modal.Footer>
                    </Modal>
                    {/**pvrpt */}
                    <Modal show={showAddPvrModal || showEditPvrModal} onHide={() => { setShowAddPvrModal(false); setShowEditPvrModal(false); }}>
        <Modal.Header closeButton>
          <Modal.Title>{showEditPvrModal ? "Modifier le PVR Technique" : "Ajouter un PVR Technique"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Numéro PVR</Form.Label>
              <Form.Control type="text" name="numeroPvr" value={pvrTechniqueFormData.numeroPvr} onChange={handlePvrTechniqueChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date PVR</Form.Label>
              <Form.Control type="date" name="datePvr" value={pvrTechniqueFormData.datePvr} onChange={handlePvrTechniqueChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>BL (Description)</Form.Label>
              <Form.Control as="textarea" name="bl" value={pvrTechniqueFormData.bl} onChange={handlePvrTechniqueChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fichier</Form.Label>
              <Form.Control type="file" name="fichier" onChange={handlePvrTechniqueFileChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Avec réserve"
                name="avecReserve"
                checked={pvrTechniqueFormData.avecReserve}
                onChange={(e) => setPvrTechniqueFormData({ ...pvrTechniqueFormData, avecReserve: e.target.checked })}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSavePvr}>{showEditPvrModal ? "Mettre à jour" : "Valider"}</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeletePvrModal} onHide={() => setShowDeletePvrModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Supprimer un PVR Technique</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer ce PVR Technique ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeletePvrModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={confirmPvrDelete}>Confirmer</Button>
        </Modal.Footer>
      </Modal>

      {/**facture */}
        {/* Modal Ajouter ou Modifier Facture */}
        <Modal 
          show={showAddFactureModal || showEditFactureModal} 
          onHide={() => { 
            setShowAddFactureModal(false); 
            setShowEditFactureModal(false); 
          }} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className="modal-colored-header bg-primary text-white">
            <Modal.Title className="d-flex align-items-center">
              {showEditFactureModal ? (
                <><FaEdit className="me-2" />Modifier la facture</>
              ) : (
                <><FaPlus className="me-2" />Ajouter une facture</>
              )}
            </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Numéro Facture</Form.Label>
                <Form.Control
                  type="text"
                  name="numFacture"
                  value={factureFormData.numFacture}
                  onChange={handleFactureChange}
                  placeholder="Entrez le numéro de facture"
                  className="form-control-modern"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Date Facture</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFacture"
                  value={factureFormData.dateFacture}
                  onChange={handleFactureChange}
                  className="form-control-modern"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Montant</Form.Label>
                <Form.Control
                  type="number"
                  name="montant"
                  value={factureFormData.montant}
                  onChange={handleFactureChange}
                  placeholder="Entrez le montant"
                  className="form-control-modern"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">BL (Description)</Form.Label>
                <Form.Control
                  as="textarea"
                  name="bl"
                  value={factureFormData.bl}
                  onChange={handleFactureChange}
                  placeholder="Description du BL"
                  className="form-control-modern"
                />
            </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Fichier</Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  onChange={handleFactureFileChange}
                  className="form-control-modern"
                />
            </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="light" 
                  onClick={() => {
                    setShowAddFactureModal(false);
                    setShowEditFactureModal(false);
                  }}
                >
                  <FaTimes className="me-2" /> Annuler
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleSaveFacture}
                  className="action-button"
                >
                  <FaCheck className="me-2" /> {showEditFactureModal ? "Mettre à jour" : "Valider"}
                </Button>
              </div>
          </Form>
        </Modal.Body>
      </Modal>

        <Modal 
          show={showDeleteFactureModal} 
          onHide={() => setShowDeleteFactureModal(false)} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className="modal-colored-header bg-danger text-white">
            <Modal.Title className="d-flex align-items-center">
              <FaTrash className="me-2" />
              Supprimer une facture
            </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-1">Êtes-vous sûr de vouloir supprimer cette facture ?</p>
            <p className="mb-0"><strong>Numéro : </strong>{selectedFacture?.numFacture}</p>
        </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="light" onClick={() => setShowDeleteFactureModal(false)}>
              <FaTimes className="me-2" /> Annuler
            </Button>
            <Button variant="danger" onClick={confirmFactureDelete} className="action-button">
              <FaTrash className="me-2" /> Confirmer la suppression
            </Button>
        </Modal.Footer>
      </Modal>

        {/* Modal de validation des factures */}
        <Modal 
          show={showFactureValidationModal} 
          onHide={() => setShowFactureValidationModal(false)} 
          centered
          className="custom-modal"
        >
          <Modal.Header closeButton className={factureValidationMessage.includes("succès") ? "modal-colored-header bg-success text-white" : "modal-colored-header bg-warning text-white"}>
            <Modal.Title className="d-flex align-items-center">
              {factureValidationMessage.includes("succès") ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
              {factureValidationMessage.includes("succès") ? "Succès" : "Attention"}
            </Modal.Title>
        </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-0">{factureValidationMessage}</p>
        </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button 
              variant={factureValidationMessage.includes("succès") ? "success" : "warning"} 
              onClick={() => setShowFactureValidationModal(false)}
              className="action-button"
            >
              <FaCheck className="me-2" /> OK
            </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de validation AM */}
      <Modal 
        show={showAMValidationModal} 
        onHide={() => setShowAMValidationModal(false)} 
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className={amValidationMessage.includes("succès") ? "modal-colored-header bg-success text-white" : "modal-colored-header bg-warning text-white"}>
          <Modal.Title className="d-flex align-items-center">
            {amValidationMessage.includes("succès") ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
            {amValidationMessage.includes("succès") ? "Succès" : "Attention"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="mb-0">{amValidationMessage}</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          {amValidationMessage.includes("liste des marchés") ? (
            <>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowAMValidationModal(false);
                  handleDetailFormClear(); // Vider les champs de détail
                }}
                className="action-button"
              >
                <FaTimes className="me-2" /> Rester sur cette page
              </Button>
              <Button 
                variant="success" 
                onClick={() => {
                  setShowAMValidationModal(false);
                  navigate('/tables/bootstrap');
                }}
                className="action-button"
              >
                <FaCheck className="me-2" /> OK
              </Button>
            </>
          ) : (
          <Button 
            variant={amValidationMessage.includes("succès") ? "success" : "warning"} 
            onClick={() => setShowAMValidationModal(false)}
            className="action-button"
          >
            <FaCheck className="me-2" /> OK
          </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Upload Marché */}
      <Modal 
        show={showMarcheUploadModal} 
        onHide={() => setShowMarcheUploadModal(false)} 
        centered
        className="custom-modal"
      >
        <Modal.Header closeButton className="modal-colored-header bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaUpload className="me-2" />Upload Marché
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Sélectionner le fichier</Form.Label>
            <Form.Control
              type="file"
              onChange={handleMarcheFileChange}
              className="form-control-modern"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="light" onClick={() => setShowMarcheUploadModal(false)}>
            <FaTimes className="me-2" />Annuler
          </Button>
          <Button variant="primary" onClick={handleMarcheUpload} className="action-button">
            <FaUpload className="me-2" />Upload
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modification du formulaire de détail projet pour qu'il n'apparaisse qu'après la première validation */}
      {showDetailProjetForm && (
        <div className="detail-projet-form">
          <Form.Group className="mb-3">
            <Form.Label>Numéro Prix</Form.Label>
            <Form.Control
              type="text"
              value={detailProjetFormData.numeroPrix}
              onChange={(e) => handleDetailProjetChange('numeroPrix', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Objet Prix</Form.Label>
            <Form.Control
              type="text"
              value={detailProjetFormData.objetPrix}
              onChange={(e) => handleDetailProjetChange('objetPrix', e.target.value)}
            />
          </Form.Group>
          {/* ... autres champs du formulaire ... */}
        </div>
      )}

      {/* Modal de validation pour BRIs */}
      <Modal show={showBrisValidationModal} onHide={() => setShowBrisValidationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{brisValidationMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBrisValidationModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add this modal component in your JSX where the other modals are */}
      <Modal show={showDeleteBRIModal} onHide={() => setShowDeleteBRIModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation de suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer ce BRI ?
          {briToDelete && <p>Fichier : {briToDelete.fileName}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteBRIModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={confirmBRIDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

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

          .card-header {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 0.5rem 1rem;
          }

          .card-body {
            padding: 0.75rem;
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

          /* Styles pour la zone GED */
          .ged-container {
            padding: 0.75rem;
          }

          .ged-back-button {
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
          }

          .ged-title {
            margin-bottom: 0.75rem;
            font-size: 1.25rem;
          }

          .ged-section {
            background: white;
            border-radius: 4px;
            padding: 0.75rem;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .ged-subtitle {
            margin-bottom: 0.5rem;
            color: #495057;
            font-size: 0.875rem;
          }

          .ged-table {
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }

          /* Styles pour le modal de signature */
          .signature-modal-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            color: white;
            padding: 0.5rem 1rem;
          }

          .signature-title-input {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }

          .signature-canvas-container {
            border: 2px dashed #ced4da;
            border-radius: 4px;
            padding: 0.25rem;
            margin-bottom: 0.5rem;
          }

          .signature-canvas {
            width: 100%;
            height: 150px;
            background-color: white;
          }

          /* Styles pour les boutons de GED */
          .file-upload-container {
            display: flex;
            align-items: center;
            margin-right: 0.5rem;
          }

          .file-upload-input {
            display: inline-block;
            margin-left: 0.5rem;
            font-size: 0.875rem;
          }

          .scan-button {
            margin-left: 0.5rem;
            background: linear-gradient(45deg, #007bff, #0056b3);
            border: none;
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }

          .scan-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }

          .file-link {
            color: #007bff;
            text-decoration: none;
            display: flex;
            align-items: center;
            font-size: 0.875rem;
          }

          .file-link:hover {
            text-decoration: underline;
          }

          .upload-button {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
            display: inline-flex;
            align-items: center;
            font-size: 0.875rem;
          }

          .upload-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
          }

          .custom-modal .modal-content {
            border-radius: 4px;
            overflow: hidden;
          }

          .custom-modal .modal-header {
            padding: 0.5rem 1rem;
          }

          .custom-modal .modal-colored-header.bg-success {
            background: linear-gradient(45deg, #28a745, #20c997);
          }

          .custom-modal .modal-colored-header.bg-warning {
            background: linear-gradient(45deg, #ffc107, #ff9800);
          }

          .custom-modal .modal-title {
            color: white;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .custom-modal .modal-body {
            padding: 0.75rem;
          }

          .custom-modal .modal-footer {
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            padding: 0.5rem 1rem;
          }

          .custom-modal .action-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            font-size: 0.875rem;
            padding: 0.375rem 0.75rem;
          }

          .custom-modal .btn-success {
            background: linear-gradient(45deg, #28a745, #20c997);
            border: none;
          }

          .custom-modal .btn-warning {
            background: linear-gradient(45deg, #ffc107, #ff9800);
            border: none;
            color: white;
          }
        `}
      </style>

    </>
  );
};

export default FormsElements;
