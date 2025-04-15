/// <reference types="chrome" />

import { setupObserver, disconnectObserver } from "./observer";
import { stopSpeech } from "./speech";

const STORAGE_KEY = "moveReaderEnabled";
let isEnabledGlobally = true;

function enableReader(): void {
  if (!isEnabledGlobally) {
    isEnabledGlobally = true;
    setupObserver();
  }
}

function disableReader(): void {
  if (isEnabledGlobally) {
    isEnabledGlobally = false;
    disconnectObserver();
    stopSpeech();
  }
}

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const initialState = result[STORAGE_KEY] ?? true;
  isEnabledGlobally = initialState;
  if (isEnabledGlobally) {
    setupObserver();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes[STORAGE_KEY]) {
    const newState = changes[STORAGE_KEY].newValue ?? true;
    if (newState) {
      enableReader();
    } else {
      disableReader();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (isEnabledGlobally) {
      stopSpeech();
    }
  }
});
