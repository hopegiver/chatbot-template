// Chatbot Template Entry Point

import { styles } from './styles/chatbot.css.js';
import { surveyStyles } from './modules/survey/survey.css.js';
import { Chatbot } from './core/chatbot.js';
import { State, getState } from './core/state.js';
import { APIClient } from './core/api.js';
import { FloatingButton } from './components/FloatingButton.js';
import { ChatWindow } from './components/ChatWindow.js';

// Inject styles
function injectStyles() {
  const styleId = 'chatbot-template-styles';

  // Check if styles already injected
  if (document.getElementById(styleId)) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = styles + '\n\n' + surveyStyles;
  document.head.appendChild(styleElement);
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  injectStyles();

  // Expose global API
  window.ChatbotTemplate = {
    Chatbot,
    State,
    getState,
    APIClient,
    components: {
      FloatingButton,
      ChatWindow
    }
  };

  // Expose Chatbot directly for easier usage
  window.Chatbot = Chatbot;

  console.log('Chatbot Template loaded.');
}

// ES6 exports
export {
  Chatbot,
  State,
  getState,
  APIClient,
  FloatingButton,
  ChatWindow
};
