import {J, createRoot} from '@Jeact';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

import Jackie from './Jackie/index.jsx';
import {Footer} from '@com/shared.jsx';

createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
          <Jackie lan={'en'}></Jackie>
          <Footer />
     </ErrorBoundary>
)

