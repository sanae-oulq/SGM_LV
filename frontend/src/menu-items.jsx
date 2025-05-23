const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'SNRT Gestion SGM',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Tableau de bord',
          type: 'item',
          icon: 'feather icon-home',
          url: '/app/dashboard/default'
        }
      ]
    },
    {
      id: "ui-element",
      title: "UI-Elements",
      "type": "group",
      "icon": "icon-ui",
      "children": [
        {
          "id": "component",
          "title": "Marché",
          "type": "collapse",
          "icon": "feather icon-box",
          "children": [
            {
              "id": "badges",
              "title": "Liste marché",
              "type": "item",
              "url": "/tables/bootstrap"
            },
            {
              "id": "button",
              "title": "Nouveau marché",
              "type": "item",
              "url": "/forms/form-basic1"
            },

            /**Liste saisie marché */
            {
              "id": "collapse",
              "title": "Liste prix",
              "type": "item",
              "url": "/tables/bootstrap-SMarche"
            },
           /** 
            {
              "id": "breadcrumb",
              "title": "Saisie marché",
              "type": "item",
              "url": "/forms/form-basic-SMarche"
            },

            
            
            {
              "id": "tabs-pills",
              "title": "Fiche de projet",
              "type": "item",
              "url": "/forms/form-basic-FicheDeProjet"
            }
              */
          ]
        },
        {
          id: 'magasin',
          title: 'Réceptions',
          type: 'collapse',
          icon: 'feather icon-menu',
          children: [
            {
              id: 'menu-level-1.1',
              title: 'Réception Marché',
              type: 'item',
              url: '/forms/form-basic-raceptionMarche'
            },
            {
              id: 'menu-level-1.1',
              title: 'Liste Réception Marché',
              type: 'item',
              url: '/tables/bootstrap-RMarche'
            },
            /*
            {
              id: 'menu-level-1.1',
              title: 'Liste Réception Marché SN',
              type: 'item',
              url: '/tables/bootstrap-ListeSN'
            }
              */
          ]
        },
        {
          id: 'affectations',
          title: 'Affectations',
          type: 'collapse',
          icon: 'feather icon-layers',
          children: [
            {
              id: 'menu-level-1.1',
              title: 'Affectation équipement ',
              type: 'item',
              url: '/forms/form-basic-AffectationE'
            },
            {
              id: 'menu-level-1.1',
              title: 'Liste Affectation équipement',
              type: 'item',
              url: '/tables/bootstrap-AffectationE'
            },


            /** a change la page */
            {
              id: 'menu-level-1.1',
              title: 'Etat des affectations ',
              type: 'item',
              url: '/tables/bootstrap-EtatAff'
            }
          ]
        },
        {
          id: 'retour',
          title: 'Retour',
          type: 'collapse',
          icon: 'feather icon-corner-down-left',
          children: [
            {
              id: 'menu-level-1.1',
              title: 'Nouveau retour ',
              type: 'item',
              url: '/forms/form-basic-RetourM'
            },
            {
              id: 'menu-level-1.1',
              title: 'Liste Retours',
              type: 'item',
              url: '/tables/bootstrap-RetourM'
            },


            /** la page situation marche */
            {
              id: 'menu-level-1.1',
              title: 'Historique ',
              type: 'item',
              url: '/tables/bootstrap-HistoriqueR'
            }
          ]
        },
        {
          id: 'passation',
          title: 'Passation',
          type: 'collapse',
          icon: 'feather icon-shuffle',
          children: [

            /**page stock /tables/bootstrap-Stock*/
            {
              id: 'menu-level-1.1',
              title: 'Nouvel passation',
              type: 'item',
              url: '/forms/form-basic-passation'
            },

            /**page trace SN /tables/bootstrap-TrceSN*/
            {
              id: 'menu-level-1.1',
              title: 'Liste passations',
              type: 'item',
              url: '/tables/bootstrap-passation'
            }
          ]
        },
        {
          id: 'stock-suivi',
          title: 'Stock et Suivi',
          type: 'collapse',
          icon: 'feather icon-package',
          children: [
            {
              id: 'forms',
              title: 'Etat Stock',
              type: 'item',
              url: '/EtatStock'
            },

            /**page stock   /tables/bootstrap-Stock */
            {
              id: 'stock-page',
              title: 'Mouvements',
              type: 'item',
              url: '/tables/bootstrap-Mouvements'
            }
          ]
        }
      ]
    },
    /*
    {
      id: 'chart-maps',
      title: 'Chart & Maps',
      type: 'group',
      icon: 'icon-charts',
      children: [
        {
          id: 'charts',
          title: 'Charts',
          type: 'item',
          icon: 'feather icon-pie-chart',
          url: '/charts/nvd3'
        },
        {
          id: 'maps',
          title: 'Maps',
          type: 'item',
          icon: 'feather icon-map',
          url: '/maps/google-map'
        }
      ]
    },
    */
   /*
    {
      id: 'pages',
      title: 'Pages',
      type: 'group',
      icon: 'icon-pages',
      children: [
        {
          id: 'auth',
          title: 'Authentication',
          type: 'collapse',
          icon: 'feather icon-lock',
          badge: {
            title: 'New',
            type: 'label-danger'
          },
          children: [
            {
              id: 'signup-1',
              title: 'Sign up',
              type: 'item',
              url: '/auth/signup-1',
              target: true,
              breadcrumbs: false
            },
            {
              id: 'signin-1',
              title: 'Sign in',
              type: 'item',
              url: '/auth/signin-1',
              target: true,
              breadcrumbs: false
            }
          ]
        },
        {
          id: 'sample-page',
          title: 'Sample Page',
          type: 'item',
          url: '/sample-page',
          classes: 'nav-item',
          icon: 'feather icon-sidebar'
        },
        {
          id: 'documentation',
          title: 'Documentation',
          type: 'item',
          icon: 'feather icon-book',
          classes: 'nav-item',
          url: 'https://codedthemes.gitbook.io/datta/',
          target: true,
          external: true
        },
        
        {
          id: 'disabled-menu',
          title: 'Disabled Menu',
          type: 'item',
          url: '#',
          classes: 'nav-item disabled',
          icon: 'feather icon-power'
        }
      ]
    }
      */
  ]
};

export default menuItems;
