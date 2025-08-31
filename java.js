// Tüm webtoon verilerinin global olarak tanımlı olduğunu varsayalım: allWebtoons

document.addEventListener('DOMContentLoaded', () => {
  // Sayfa yüklemesi sırasında ilk işlemleri gerçekleştir
  initializeFAQ();
  initializePage();
  setupEventListeners();
  renderInitialWebtoons();
  

  
  // Ek işlevsellikler: FAQ ve dropdown dokunmatik desteği
  setupFaqToggle();
  setupDropdownTouch();
});

// Sayfa başlatma: URL parametreleri ve hash kontrolü
function initializePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search') || '';
  const selectedTur = window.location.hash.substring(1) || 'tum';
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = searchTerm;
  }
  
  // İlk filtreleme işlemini gerçekleştir
  applyFilters();
}

// Tüm event listener'ları burada ayarlıyoruz
function setupEventListeners() {
  // Arama inputu: gerçek zamanlı filtreleme
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      updateSearchParams(e.target.value);
      applyFilters();
    });
  }
  
  // Arama formu: submit işlemi
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInput').value;
      updateSearchParams(term);
      applyFilters();
    });
  }
  
  // İnteraktif kutular: kategori filtrelemesi
  document.querySelectorAll('.interactive-box').forEach(box => {
    box.addEventListener('click', function() {
      const tur = this.getAttribute('data-tur');
      window.location.hash = tur.toLowerCase();
      applyFilters();
    });
  });
  
  // Hash değiştiğinde (tarayıcı ileri/geri navigasyonu) filtreleri güncelle
  window.addEventListener('hashchange', applyFilters);
}

// URL'deki search parametresini güncelle ve pagination linklerini ayarla (varsa)
function updateSearchParams(searchTerm) {
  const url = new URL(window.location);
  url.searchParams.set('search', searchTerm);
  window.history.replaceState({}, '', url);
  updatePaginationLinks(searchTerm);
}

function updatePaginationLinks(searchTerm) {
  document.querySelectorAll('.pagination a').forEach(link => {
    const newUrl = new URL(link.href);
    newUrl.searchParams.set('search', searchTerm);
    link.href = newUrl.toString();
  });
}

// Tüm filtreleri (sayfa kategorisi, tür ve arama) uygulayan fonksiyon
function applyFilters() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedTur = window.location.hash.substring(1) || 'tum';
  let filtered = allWebtoons.slice(); // Orijinal dizi kopyası
  
  const grid = document.querySelector('.webtoon-grid');
  // Sayfa kategorisi filtresi (sadece arama yoksa)
  if (grid && grid.dataset.category && !searchTerm) {
    filtered = filtered.filter(webtoon => webtoon.category === grid.dataset.category);
  }
  
  // İnteraktif kategori (genre) filtresi: "tum" seçili değilse
  if (selectedTur !== 'tum') {
    filtered = filtered.filter(webtoon => 
      webtoon.genre.toLowerCase() === selectedTur.toLowerCase()
    );
  }
  
  // Arama filtresi: başlık içinde searchTerm araması
  if (searchTerm) {
    filtered = filtered.filter(webtoon => 
      webtoon.title.toLowerCase().includes(searchTerm)
    );
  }
  
  renderWebtoons(filtered);
}

// Filtrelenmiş webtoonları ekrana yazdıran fonksiyon
function renderWebtoons(webtoons) {
  const grid = document.querySelector('.webtoon-grid');
  if (!grid) return;
  
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput ? searchInput.value.trim() : '';
  const basePath = window.location.pathname.includes('/pages/') ? '../' : '';

  // Arama sonucu yoksa mesaj göster
  if (webtoons.length === 0 && searchTerm) {
      grid.innerHTML = `
          <div class="no-results">
              <div class="warning-icon">⚠️</div>
              <h3>"${searchTerm}" ile eşleşen webtoon bulunamadı</h3>
              <p>Şunları denemeyi deneyebilirsiniz:</p>
              <ul>
                  <li>Farklı anahtar kelimeler kullanın</li>
                  <li>Yazım hatalarını kontrol edin</li>
                  <li>Daha genel bir arama yapın</li>
              </ul>
          </div>
      `;
  } else if (webtoons.length === 0) {
      grid.innerHTML = `
          <div class="no-results">
              <div class="warning-icon">😞</div>
              <h3>Bu kategoride webtoon bulunamadı</h3>
          </div>
      `;
  } else {
      grid.innerHTML = webtoons.map(webtoon => `
          <div class="webtoon-card" data-tur="${webtoon.genre}">
              <img src="${basePath}${webtoon.image}" alt="${webtoon.title}" class="webtoon-image">
              <div class="webtoon-info">
                  <h3>${webtoon.title}</h3>
                   <div class="rating">💲 ${webtoon.rating}</div>
              </div>
              <div class="webtoon-overlay">
                  <h4 class="overlay-title">${webtoon.title}</h4>
                  <div class="overlay-content">
                      <p>${webtoon.description}</p>
                      <p class="overlay-genre">Tür: ${webtoon.genre}</p>
                     
                  </div>
              </div>
          </div>
      `).join('');
  }

  // Sonuç sayısını header'da göster
  const resultHeader = document.getElementById('resultHeader');
  if (resultHeader) {
      const resultText = searchTerm 
          ? `"${searchTerm}" için ${webtoons.length} sonuç`
          : `Toplam ${webtoons.length} webtoon`;
      resultHeader.innerHTML = `${resultText} <small>(${new Date().toLocaleDateString()})</small>`;
  }
}

// Sayfa yüklendiğinde grid'in data-category değerine göre ilk webtoon listesini yükler
function renderInitialWebtoons() {
  const grid = document.querySelector('.webtoon-grid');
  if (!grid) return;

  let filtered = allWebtoons;

  if (grid.dataset.category) {
    filtered = filtered.filter(webtoon => webtoon.category === grid.dataset.category);
  }
  
  if (grid.dataset.genre) {
    filtered = filtered.filter(webtoon => webtoon.genre === grid.dataset.genre);
  }

  renderWebtoons(filtered);
}


// SSS (FAQ) bölümündeki soruların açılıp kapanması
function setupFaqToggle() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
}

// Dropdown menü için dokunmatik desteği
function setupDropdownTouch() {
  document.querySelectorAll('.dropdown').forEach(item => {
    item.addEventListener('touchstart', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      const dropdownContent = this.querySelector('.dropdown-content');
      if (dropdownContent) {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
}
// Sayfalama kontrolü için global değişkenler
let currentPage = 1;
const itemsPerPage = 10; // Sayfa başına gösterilecek öğe sayısı
let totalPages = 1;

function initializeApplication() {
  // Önceki kodlar...
  calculateTotalPages();
  setupPagination();
  updatePaginationUI();
}

function calculateTotalPages() {
  const totalItems = allWebtoons.length;
  totalPages = Math.ceil(totalItems / itemsPerPage);
}

function setupPagination() {
  window.changePage = function(offset) {
      const newPage = currentPage + offset;
      if(newPage > 0 && newPage <= totalPages) {
          currentPage = newPage;
          applyAllFilters();
          updatePaginationUI();
          updateURLParameters();
      }
  }

  // Sayısal sayfa linkleri için event listener
  document.querySelectorAll('.page-link[data-page]').forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          currentPage = parseInt(this.dataset.page);
          applyAllFilters();
          updatePaginationUI();
          updateURLParameters();
      });
  });
}

function updatePaginationUI() {
  // Önceki/sonraki butonlarını güncelle
  document.querySelector('.prev-next:first-child').disabled = currentPage === 1;
  document.querySelector('.prev-next:last-child').disabled = currentPage === totalPages;

  // Sayfa numaralarını güncelle
  const pageNumbers = document.querySelector('.page-numbers');
  pageNumbers.innerHTML = '';

  // Dinamik sayfa numaralandırma
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if(currentPage < 4) endPage = Math.min(5, totalPages);
  if(currentPage > totalPages - 3) startPage = Math.max(totalPages - 4, 1);

  // İlk sayfa için
  if(startPage > 1) {
      pageNumbers.innerHTML += `<a href="#" class="page-link" data-page="1">1</a>`;
      if(startPage > 2) pageNumbers.innerHTML += `<span class="page-link">...</span>`;
  }

  // Ana sayfa numaraları
  for(let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? ' active' : '';
      pageNumbers.innerHTML += `<a href="#" class="page-link${activeClass}" data-page="${i}">${i}</a>`;
  }

  // Son sayfa için
  if(endPage < totalPages) {
      if(endPage < totalPages - 1) pageNumbers.innerHTML += `<span class="page-link">...</span>`;
      pageNumbers.innerHTML += `<a href="#" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
  }

  // Yeni sayfa linklerine event listener ekle
  document.querySelectorAll('.page-link[data-page]').forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          currentPage = parseInt(this.dataset.page);
          applyAllFilters();
          updatePaginationUI();
          updateURLParameters();
      });
  });
}

function applyAllFilters() {
  // Önceki filtreleme kodları...
  
  // Sayfalama uygula
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  filtered = filtered.slice(startIndex, endIndex);

  renderWebtoons(filtered);
  updateActiveFiltersUI();
}

function updateURLParameters() {
  const url = new URL(window.location);
  url.searchParams.set('page', currentPage);
  window.history.replaceState({}, '', url);
}

// Sayfa yüklendiğinde URL'den sayfa numarasını al
function checkInitialState() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(urlParams.get('page')) || 1;
  currentPage = initialPage > totalPages ? 1 : initialPage;
}
function initializeFAQ() {
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  
  // Açıklama yüksekliğini ayarla
  answer.style.maxHeight = item.classList.contains('active') ? 
    `${answer.scrollHeight}px` : '0';
  
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    // Tüm FAQ'ları kapat
    faqItems.forEach(otherItem => {
      otherItem.classList.remove('active');
      otherItem.querySelector('.faq-answer').style.maxHeight = '0';
    });
    
    // Sadece tıklananı aç
    if (!isActive) {
      item.classList.add('active');
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

// Dokunmatik cihazlar için optimizasyon
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('touchend', (e) => {
    e.preventDefault();
    question.click();
  });
});
}

