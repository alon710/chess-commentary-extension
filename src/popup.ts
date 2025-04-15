/// <reference types="chrome" />

const toggleSwitch = document.getElementById(
  "toggleSwitch"
) as HTMLInputElement;

const STORAGE_KEY = "moveReaderEnabled";

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const isEnabled = result[STORAGE_KEY] ?? true;
  if (toggleSwitch) {
    toggleSwitch.checked = isEnabled;
  }
});

if (toggleSwitch) {
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ [STORAGE_KEY]: isEnabled });
  });
}
