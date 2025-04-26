document.addEventListener("DOMContentLoaded", () => {
  const cleanNowButton = document.getElementById("clean-now-button");
  const settingsButton = document.querySelector(".settings-link"); // Settings linki tanımlı
  const statusMessage = document.getElementById("status-message");

  // "Clean Now" butonuna tıklandığında çalışacak işlev
  cleanNowButton.addEventListener("click", () => {
    statusMessage.innerText = "Cleaning in progress...";
    statusMessage.style.color = "blue";

    // Chrome Storage'dan URL'ler ve anahtar kelimeleri al
    chrome.storage.sync.get(["urls", "keywords"], (data) => {
      const urls = data.urls || []; // Kaydedilmiş URL'ler
      const keywords = data.keywords || []; // Kaydedilmiş anahtar kelimeler

      if (urls.length === 0 && keywords.length === 0) {
        statusMessage.innerText = "No URLs or keywords found to clean.";
        statusMessage.style.color = "red";
        return;
      }

      // Tarayıcı geçmişini ara ve eşleşenleri sil
      chrome.history.search({ text: "", startTime: 0 }, (historyItems) => {
        const itemsToDelete = historyItems.filter((item) => {
          // URL veya başlık anahtar kelimelerine göre eşleşiyor mu?
          return (
            urls.some((url) => item.url.includes(url)) ||
            keywords.some((keyword) => item.title && item.title.includes(keyword))
          );
        });

        // Eşleşen geçmiş öğelerini sil
        itemsToDelete.forEach((item) => {
          chrome.history.deleteUrl({ url: item.url });
        });

        // Temizleme işlemi tamamlandı
        statusMessage.innerText = `Cleaned ${itemsToDelete.length} matching items.`;
        statusMessage.style.color = "green";
      });
    });
  });

  // "Settings" butonuna tıklandığında options.html'i aç
  settingsButton.addEventListener("click", (event) => {
    event.preventDefault(); // Varsayılan bağlantı davranışını engelle
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage(); // Chrome'da options sayfasını aç
    } else {
      window.open(chrome.runtime.getURL("index/options.html")); // Eski tarayıcılar için fallback
    }
  });
});