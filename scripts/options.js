document.addEventListener("DOMContentLoaded", () => {
  // Load URLs and Keywords
  loadItems('urls', 'url-list');
  loadItems('keywords', 'keyword-list');

  // Load Cleanup Interval
  loadInterval();

  // Add URL
  const addUrlButton = document.getElementById("add-url-button");
  const urlInput = document.getElementById("url-input");

  if (addUrlButton && urlInput) {
    addUrlButton.addEventListener("click", () => {
      const urlName = urlInput.value.trim();
      if (isValidUrl(urlName)) {
        addNewItem(urlName, 'url-list', 'urls');
        urlInput.value = ""; // Clear input
      } else {
        alert("Please enter a valid URL.");
      }
    });
  }

  // Add Keyword
  const addKeywordButton = document.getElementById("add-keyword-button");
  const keywordInput = document.getElementById("keyword-input");

  if (addKeywordButton && keywordInput) {
    addKeywordButton.addEventListener("click", () => {
      const keywordName = keywordInput.value.trim();
      if (keywordName) {
        addNewItem(keywordName, 'keyword-list', 'keywords');
        keywordInput.value = ""; // Clear input
      } else {
        alert("Please enter a valid keyword.");
      }
    });
  }

  // Save Cleanup Interval
  const saveIntervalButton = document.getElementById("save-interval-button");
  const intervalInput = document.getElementById("interval-input");

  if (saveIntervalButton && intervalInput) {
    saveIntervalButton.addEventListener("click", () => {
      const intervalValue = parseInt(intervalInput.value.trim(), 10);

      if (intervalValue && intervalValue > 0) {
        saveInterval(intervalValue);
        intervalInput.value = ""; // Clear input
      } else {
        alert("Please enter a valid interval in minutes.");
      }
    });
  }
});

// Add new item to list and save to storage
function addNewItem(name, listId, storageKey) {
  const list = document.getElementById(listId);
  const item = document.createElement("div");
  item.className = "item";
  item.innerHTML = `
    <span>${name}</span>
    <button class="remove-button">Remove</button>
  `;
  list.appendChild(item);

  // Attach remove functionality
  const removeButton = item.querySelector(".remove-button");
  removeButton.addEventListener("click", () => removeItem(item, name, storageKey));

  // Save to storage
  saveItem(name, storageKey);
}

// Remove item from list and storage
function removeItem(itemElement, itemName, storageKey) {
  itemElement.remove();

  // Remove from storage
  chrome.storage.sync.get({ [storageKey]: [] }, (data) => {
    const updatedItems = data[storageKey].filter((entry) => entry !== itemName);
    chrome.storage.sync.set({ [storageKey]: updatedItems });
  });
}

// Save item to storage
function saveItem(itemName, storageKey) {
  chrome.storage.sync.get({ [storageKey]: [] }, (data) => {
    const items = data[storageKey];
    items.push(itemName);
    chrome.storage.sync.set({ [storageKey]: items });
  });
}

// Load items from storage
function loadItems(storageKey, listId) {
  chrome.storage.sync.get({ [storageKey]: [] }, (data) => {
    const list = document.getElementById(listId);
    data[storageKey].forEach((itemName) => {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <span>${itemName}</span>
        <button class="remove-button">Remove</button>
      `;
      list.appendChild(item);

      // Attach remove functionality
      const removeButton = item.querySelector(".remove-button");
      removeButton.addEventListener("click", () => removeItem(item, itemName, storageKey));
    });
  });
}

// Save cleanup interval to storage
function saveInterval(interval) {
  chrome.storage.sync.set({ interval });
  document.getElementById("current-interval").innerText = `Current Interval: ${interval} minutes`;
}

// Load cleanup interval from storage
function loadInterval() {
  chrome.storage.sync.get({ interval: null }, (data) => {
    if (data.interval) {
      document.getElementById("current-interval").innerText = `Current Interval: ${data.interval} minutes`;
    }
  });
}

// Validate URL format (no need for http/https)
function isValidUrl(string) {
  const urlRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return urlRegex.test(string);
}