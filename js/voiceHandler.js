/**
 * Voice Handler - Manages speech recognition for voice commands
 */

class VoiceHandler {
  constructor(tank, enemies) {
    this.tank = tank;
    this.enemies = enemies;
    this.isListening = false;
    this.lastTranscript = '';
    this.recognition = null;
    this.voiceControlBtn = document.getElementById('voice-control');
    this.transcriptElement = document.getElementById('transcript');
    
    this.init();
  }
  
  init() {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.transcriptElement.textContent = "Sorry, your browser doesn't support the Web Speech API. Try using Chrome!";
      this.voiceControlBtn.disabled = true;
      return;
    }
    
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    // Set up grammar for "hari om"
    const grammar = '#JSGF V1.0; grammar hariom; public <hariom> = hari om;';
    const speechRecognitionList = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)();
    speechRecognitionList.addFromString(grammar, 1);
    this.recognition.grammars = speechRecognitionList;
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Recognition result event
    this.recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        fullTranscript += transcript + ' ';
      }
      
      // Update transcript display
      this.transcriptElement.textContent = `Heard: ${fullTranscript}`;
      
      // Check for "hari om" and fire if detected
      const hariOmCount = (fullTranscript.match(/\bhari om\b/g) || []).length;
      const lastHariOmCount = (this.lastTranscript.match(/\bhari om\b/g) || []).length;
      
      if (hariOmCount > lastHariOmCount) {
        // Fire the nuke for each new "hari om" detected
        for (let i = 0; i < hariOmCount - lastHariOmCount; i++) {
          if (window.gameManager && window.gameManager.state === 'running') {
            this.tank.fireNuke(this.enemies);
          }
        }
      }
      
      this.lastTranscript = fullTranscript;
    };
    
    // Recognition error event
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.transcriptElement.textContent = `Error: ${event.error}`;
      this.stopListening();
    };
    
    // Recognition end event
    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start();
      }
    };
    
    // Button click event
    this.voiceControlBtn.addEventListener('click', () => {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    });
  }
  
  startListening() {
    this.recognition.start();
    this.isListening = true;
    this.voiceControlBtn.textContent = 'Stop Voice Control';
    this.transcriptElement.textContent = 'Listening... Say "hari om" to fire!';
    this.lastTranscript = ''; // Reset on start
  }
  
  stopListening() {
    this.recognition.stop();
    this.isListening = false;
    this.voiceControlBtn.textContent = 'Start Voice Control';
    this.transcriptElement.textContent = 'Voice control stopped. Press button to restart.';
  }
  
  updateReferences(tank, enemies) {
    this.tank = tank;
    this.enemies = enemies;
  }
}

export default VoiceHandler;
