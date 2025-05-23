import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';
import logo from '../../../../assets/images/logo_sgm.png'; // ou .png
import './navLogo.css';

const NavLogo = () => {
  const { state: { collapseMenu }, dispatch } = useContext(ConfigContext);

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) toggleClass.push('on');

  return (
    <div className="navbar-brand header-logo full-logo">
      <Link to="#" className="b-brand">
        <img
          src={logo}
          alt="SGM - Système de Gestion des Marchés"
          className="sgm-logo"
        />
       
      </Link>
      <Link
        to="#"
        className={toggleClass.join(' ')}
        id="mobile-collapse"
        onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}
      >
        <span />
      </Link>
    </div>
  );
};

export default NavLogo;