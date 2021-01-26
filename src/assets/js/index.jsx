import {J, createRoot} from '@Jeact';

import ErrorBoundary from '@com/Errors/ErrorBoundary.jsx';
import '@assets/styles/main.sass';

import Aboutme from './aboutme.jsx';
import {Footer} from '@com/shared.jsx';

createRoot(document.getElementById('root')).render(
<ErrorBoundary>
    <Aboutme />
    <Footer />
</ErrorBoundary>
)
