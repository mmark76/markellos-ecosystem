import '../styles/reset.css';
import '../styles/tokens.css';
import '../styles/global.css';
import '../components/ui-settings/ui-settings.css';
import './legal-page.css';
import '../styles/default-scale.css';
import '../styles/font-options.css';

import { initializeAnalytics } from '../services/analytics-service.js';
import { applyUiSettings } from '../services/ui-settings-service.js';

applyUiSettings();
initializeAnalytics();
