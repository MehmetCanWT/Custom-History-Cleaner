// Geçmişi temizleme işlevi
function clearHistory() {
  chrome.storage.sync.get(["urls", "keywords"], ({ urls, keywords }) => {
    if ((!urls || urls.length === 0) && (!keywords || keywords.length === 0)) return;

    chrome.history.search({ text: "", maxResults: 1000 }, (results) => {
      results.forEach((item) => {
        const matchesUrl = urls && urls.some((url) => item.url.includes(url));
        const matchesKeyword = keywords && keywords.some((keyword) => item.title && item.title.includes(keyword));

        if (matchesUrl || matchesKeyword) {
          chrome.history.deleteUrl({ url: item.url });
        }
      });
    });
  });
}

// Alarm oluşturma ve güncelleme
function updateAlarm() {
  chrome.storage.sync.get(["interval"], ({ interval }) => {
    const period = interval && interval > 0 ? interval : 1; // Varsayılan süre: 1 dakika
    chrome.alarms.clear("periodicCleaner", () => {
      chrome.alarms.create("periodicCleaner", { periodInMinutes: period });
      console.log(`Alarm updated: Runs every ${period} minute(s).`);
    });
  });
}

// Tarayıcı başlatıldığında temizlik yap
chrome.runtime.onStartup.addListener(() => {
  console.log("Browser started. Running initial cleanup...");
  clearHistory(); // Başlatıldığında geçmişi temizle
  updateAlarm(); // Alarmı güncelle
});

// Uzantı yüklendiğinde
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed. Setting up initial cleanup and alarms...");
  clearHistory(); // Uzantı yüklendiğinde geçmişi temizle
  updateAlarm(); // Alarmı güncelle
});

// Alarm tetiklendiğinde
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicCleaner") {
    console.log("Periodic cleaner alarm triggered.");
    clearHistory(); // Belirli aralıklarla geçmişi temizle
  }
});

// Kullanıcı interval değiştirdiğinde alarmı güncelle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.interval) {
    console.log("Interval changed. Updating alarm...");
    updateAlarm(); // Alarmı yeni interval değerine göre güncelle
  }
});