import React, { Suspense, Fragment, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';

import { BASE_URL } from './config/constant';

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element props={true} />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    exact: 'true',
    path: '/login',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: 'true',
    path: '/auth/signin-1',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    exact: 'true',
    path: '/auth/signup-1',
    element: lazy(() => import('./views/auth/signup/SignUp1'))
  },
  {
    path: '*',
    layout: AdminLayout,
    routes: [
      {
        exact: 'true',
        path: '/app/dashboard/default',
        element: lazy(() => import('./views/dashboard'))
      },
      {
        exact: 'true',
        path: '/auth/signin-1',
        element: lazy(() => import('./views/auth/signin/SignIn1'))
      },
      {
        exact: 'true',
        path: '/basic/button',
        element: lazy(() => import('./views/ui-elements/basic/BasicButton'))
      },
      {
        exact: 'true',
        path: '/basic/badges',
        element: lazy(() => import('./views/ui-elements/basic/BasicBadges'))
      },
      {
        exact: 'true',
        path: '/basic/breadcrumb-paging',
        element: lazy(() => import('./views/ui-elements/basic/BasicBreadcrumb'))
      },
      {
        exact: 'true',
        path: '/basic/collapse',
        element: lazy(() => import('./views/ui-elements/basic/BasicCollapse'))
      },
      {
        exact: 'true',
        path: '/basic/tabs-pills',
        element: lazy(() => import('./views/ui-elements/basic/BasicTabsPills'))
      },
      {
        exact: 'true',
        path: '/basic/typography',
        element: lazy(() => import('./views/ui-elements/basic/BasicTypography'))
      },
      {
        exact: 'true',
        path: '/forms/form-basic',
        element: lazy(() => import('./views/forms/FormsElements'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic1',
        element: lazy(() => import('./views/forms/FormsElements1'))
      },
      

      {
        exact: 'true',
        path: '/forms/form-basic-raceptionMarche',
        element: lazy(() => import('./views/forms/FormsElements-receptionMarche'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic-SMarche',
        element: lazy(() => import('./views/forms/FormsElements-SMarche'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic-AffectationE',
        element: lazy(() => import('./views/forms/FormsElements-AffectationE'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic-passation',
        element: lazy(() => import('./views/forms/FormsElements-passation'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic-RetourM',
        element: lazy(() => import('./views/forms/FormsElements-RetourM'))
      },

      {
        exact: 'true',
        path: '/forms/form-basic-FicheDeProjet',
        element: lazy(() => import('./views/forms/FormsElements-FicheDeProjet'))
      },




      {
        exact: 'true',
        path: '/tables/bootstrap',
        element: lazy(() => import('./views/tables/BootstrapTable'))
      },

      {
        exact: 'true',
        path: '/EtatStock',
        element: lazy(() => import('./views/tables/EtatStock'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-SMarche',
        element: lazy(() => import('./views/tables/BootstrapTable-SMarche'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-RMarche',
        element: lazy(() => import('./views/tables/BootstrapTable-RMarche'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-HistoriqueR',
        element: lazy(() => import('./views/tables/BootstrapTable-HistoriqueR'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-EtatAff',
        element: lazy(() => import('./views/tables/BootstrapTable-EtatAff'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-AffectationE',
        element: lazy(() => import('./views/tables/BootstrapTable-AffectationE'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-RetourM',
        element: lazy(() => import('./views/tables/BootstrapTable-RetourM'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-Mouvements',
        element: lazy(() => import('./views/tables/BootstrapTable-Mouvements'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-TrceSN',
        element: lazy(() => import('./views/tables/BootstrapTable-TrceSN'))
      },

      {
        exact: 'true',
        path: '/tables/bootstrap-passation',
        element: lazy(() => import('./views/tables/BootstrapTable-passation'))
      },


      {
        exact: 'true',
        path: '/charts/nvd3',
        element: lazy(() => import('./views/charts/nvd3-chart'))
      },
      {
        exact: 'true',
        path: '/maps/google-map',
        element: lazy(() => import('./views/maps/GoogleMaps'))
      },
      {
        exact: 'true',
        path: '/sample-page',
        element: lazy(() => import('./views/extra/SamplePage'))
      },
      {
        path: '*',
        exact: 'true',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
