import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavSearch = (props) => {
  const { windowWidth } = props;
  const [isOpen, setIsOpen] = useState(windowWidth < 600);
  const [searchString, setSearchString] = useState(windowWidth < 600 ? '100px' : '');
  const [searchText, setSearchText] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  // Fonction pour enlever les highlights précédents
  const removeHighlights = () => {
    const highlights = document.querySelectorAll('mark');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
    setMatchCount(0);
  };

  // Fonction pour highlight le texte
  const highlightText = (text) => {
    if (!text) {
      removeHighlights();
      return;
    }

    removeHighlights();
    let totalMatches = 0;

    // Fonction pour vérifier si un nœud doit être ignoré
    const shouldIgnoreNode = (node) => {
      const nodeName = node.nodeName.toLowerCase();
      return nodeName === 'script' || 
             nodeName === 'style' || 
             nodeName === 'mark' ||
             nodeName === 'input' ||
             nodeName === 'textarea';
    };

    // Fonction récursive pour parcourir et marquer le texte
    const processNode = (node) => {
      if (shouldIgnoreNode(node)) {
        return;
      }

      // Si c'est un nœud texte
      if (node.nodeType === 3) {
        const content = node.textContent;
        if (content.toLowerCase().includes(text.toLowerCase())) {
          const regex = new RegExp(`(${text})`, 'gi');
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let match;

          while ((match = regex.exec(content)) !== null) {
            totalMatches++;
            // Ajouter le texte avant le match
            if (match.index > lastIndex) {
              fragment.appendChild(
                document.createTextNode(content.slice(lastIndex, match.index))
              );
            }

            // Créer le mark pour le texte trouvé
            const mark = document.createElement('mark');
            mark.textContent = match[0];
            mark.style.backgroundColor = '#FF69B4';
            mark.style.color = 'black';
            mark.style.textDecoration = 'underline';
            fragment.appendChild(mark);

            lastIndex = match.index + match[0].length;
          }

          // Ajouter le reste du texte
          if (lastIndex < content.length) {
            fragment.appendChild(
              document.createTextNode(content.slice(lastIndex))
            );
          }

          node.parentNode.replaceChild(fragment, node);
        }
      } else {
        // Pour les autres types de nœuds, parcourir récursivement
        Array.from(node.childNodes).forEach(child => processNode(child));
      }
    };

    // Commencer le traitement depuis le body
    processNode(document.body);
    setMatchCount(totalMatches);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    highlightText(value);
  };

  const searchOnHandler = () => {
    if (windowWidth < 600) {
      document.querySelector('#navbar-right')?.classList.add('d-none');
    }
    setIsOpen(true);
    setSearchString('100px');
  };

  const searchOffHandler = () => {
    setIsOpen(false);
    setSearchString(0);
    setSearchText('');
    removeHighlights();
    setTimeout(() => {
      if (windowWidth < 600) {
        document.querySelector('#navbar-right')?.classList.remove('d-none');
      }
    }, 500);
  };

  let searchClass = ['main-search'];
  if (isOpen) {
    searchClass = [...searchClass, 'open'];
  }

  return (
    <React.Fragment>
      <div id="main-search" className={searchClass.join(' ')}>
        <div className="input-group">
          <input 
            type="text" 
            id="m-search" 
            className="form-control" 
            placeholder="Search . . ." 
            style={{ width: searchString }}
            value={searchText}
            onChange={handleSearchChange}
          />
          {searchText && matchCount > 0 && (
            <div style={{ 
              position: 'absolute', 
              right: '80px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 105, 180, 0.3)',
              color: 'black',
              padding: '0px 2px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 'normal',
              display: 'inline-block',
              lineHeight: '14px',
              border: '1px solid rgba(255, 105, 180, 0.5)'
            }}>
              {matchCount}
            </div>
          )}
          <Link to="#" className="input-group-append search-close" onClick={searchOffHandler}>
            <i className="feather icon-x input-group-text" />
          </Link>
          <span
            onKeyDown={searchOnHandler}
            role="button"
            tabIndex="0"
            className="input-group-append search-btn btn btn-primary"
            onClick={searchOnHandler}
            style={{ borderRadius: '50%', marginLeft: 5 }}
          >
            <i className="feather icon-search input-group-text" />
          </span>
        </div>
      </div>
    </React.Fragment>
  );
};

NavSearch.propTypes = {
  windowWidth: PropTypes.number
};

export default NavSearch;
