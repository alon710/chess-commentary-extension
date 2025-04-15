import { speak, nodeCurrentlyProcessing, lastSpokenNode } from "./speech";
import { debounce } from "./utils";
import { formatMoveForSpeech } from "./formatter";

const MOVE_NODE_SELECTOR = "div.node";
const SELECTED_MOVE_SELECTOR = "div.node.selected";
const MOVE_TEXT_SELECTOR = "span.node-highlight-content";
const MOVE_LIST_COMPONENT_SELECTOR = "wc-simple-move-list";
const SIDEBAR_SELECTOR = "#board-layout-sidebar";

let observer: MutationObserver | null = null;
let observedRoot: Node | null = null;

function findAndSpeakSelectedMove(selectedNode: Element): void {
  if (
    selectedNode === lastSpokenNode ||
    selectedNode === nodeCurrentlyProcessing
  ) {
    return;
  }

  const textElement =
    selectedNode.querySelector<HTMLElement>(MOVE_TEXT_SELECTOR);
  const rawText = textElement?.innerText;
  const text = rawText?.trim();

  if (text) {
    const speechText = formatMoveForSpeech(text);
    speak(speechText, selectedNode);
  }
}

const debouncedFindAndSpeak = debounce(findAndSpeakSelectedMove, 350);

function initializeObserver(rootNodeToObserve: Node) {
  if (observedRoot === rootNodeToObserve) {
    return;
  }
  if (observer) {
    observer.disconnect();
  }

  observedRoot = rootNodeToObserve;

  observer = new MutationObserver((mutationsList) => {
    let nodeToSpeak: Element | null = null;

    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class" &&
        mutation.target.nodeType === Node.ELEMENT_NODE
      ) {
        const element = mutation.target as Element;

        if (element.matches(MOVE_TEXT_SELECTOR)) {
          const isNowSelected = element.classList.contains("selected");
          const wasSelectedBefore = (mutation.oldValue || "").includes(
            "selected"
          );

          if (isNowSelected && !wasSelectedBefore) {
            const parentNode = element.closest(MOVE_NODE_SELECTOR);
            if (parentNode) {
              nodeToSpeak = parentNode;
              break;
            }
          }
        }
      }
    }

    if (nodeToSpeak) {
      debouncedFindAndSpeak(nodeToSpeak);
    }
  });

  observer.observe(rootNodeToObserve, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
  });

  let initialScanNode: Element | null = null;
  if (
    "querySelector" in rootNodeToObserve &&
    typeof rootNodeToObserve.querySelector === "function"
  ) {
    try {
      const selectedSpan = rootNodeToObserve.querySelector(
        MOVE_TEXT_SELECTOR + ".selected"
      );
      if (selectedSpan) {
        initialScanNode = selectedSpan.closest(MOVE_NODE_SELECTOR);
      }
    } catch (e) {}
  } else {
    try {
      const selectedSpan = document.querySelector(
        MOVE_TEXT_SELECTOR + ".selected"
      );
      if (selectedSpan) {
        initialScanNode = selectedSpan.closest(MOVE_NODE_SELECTOR);
      }
    } catch (e) {}
  }
}

export function disconnectObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
    observedRoot = null;
  }
}

export function setupObserver(retries = 5, interval = 1000) {
  const moveListComponent = document.querySelector<Element>(
    MOVE_LIST_COMPONENT_SELECTOR
  );

  if (moveListComponent) {
    if (moveListComponent.shadowRoot) {
      initializeObserver(moveListComponent.shadowRoot);
    } else {
      initializeObserver(moveListComponent);
    }
    return;
  }

  if (retries > 0) {
    setTimeout(() => setupObserver(retries - 1, interval), interval);
  } else {
    const sidebar = document.querySelector(SIDEBAR_SELECTOR);
    if (sidebar) {
      initializeObserver(sidebar);
    } else {
      initializeObserver(document.body);
    }
  }
}
