export let lastSpokenNode: Element | null = null;
export let nodeCurrentlyProcessing: Element | null = null;
let isSpeaking = false;

const utteranceQueue: SpeechSynthesisUtterance[] = [];

function processQueue(): void {
  if (isSpeaking || utteranceQueue.length === 0) {
    return;
  }
  isSpeaking = true;
  const utterance = utteranceQueue.shift();
  if (utterance) {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      if (nodeCurrentlyProcessing) {
        nodeCurrentlyProcessing = null;
      }
      isSpeaking = false;
      setTimeout(processQueue, 0);
    }
  } else {
    isSpeaking = false;
  }
}

export function speak(text: string, associatedNode: Element): void {
  if (!text.trim() || !window.speechSynthesis) {
    nodeCurrentlyProcessing = null;
    return;
  }
  const cleanedText = text.trim();
  if (!cleanedText) {
    nodeCurrentlyProcessing = null;
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = document.documentElement.lang || "en-US";
  utterance.rate = 1.1;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    isSpeaking = false;
    lastSpokenNode = associatedNode;
    nodeCurrentlyProcessing = null;
    setTimeout(processQueue, 0);
  };
  utterance.onerror = (event) => {
    isSpeaking = false;
    if (nodeCurrentlyProcessing === associatedNode) {
      nodeCurrentlyProcessing = null;
    }
    lastSpokenNode = associatedNode;
    setTimeout(processQueue, 0);
  };

  window.speechSynthesis.cancel();
  if (isSpeaking && nodeCurrentlyProcessing) {
    nodeCurrentlyProcessing = null;
  }
  utteranceQueue.length = 0;
  isSpeaking = false;

  utteranceQueue.push(utterance);
  nodeCurrentlyProcessing = associatedNode;
  processQueue();
}

export function stopSpeech(): void {
  window.speechSynthesis.cancel();
  utteranceQueue.length = 0;
  isSpeaking = false;
  lastSpokenNode = null;
  nodeCurrentlyProcessing = null;
}
