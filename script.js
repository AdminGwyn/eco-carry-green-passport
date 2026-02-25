// ===== STATE =====
let currentPage = 0;
let totalPages = 0;
let isTransitioning = false;
let pages = [];
let timelineDots = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  pages = document.querySelectorAll('.page');
  totalPages = pages.length;
  timelineDots = document.querySelectorAll('.timeline-dot');

  initLoadingScreen();
  initPageNavigation();
  initTimelineNav();
  initCountUp();
  initComparisonBars();
  initCertificateActions();
  initQRLookup();
  updateTimelineIndicator();
});

// ===== Loading Screen =====
function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('hidden');
  }, 2000);
}

// ===== Page Navigation (scroll/swipe = flip page) =====
function initPageNavigation() {
  const container = document.getElementById('bookContainer');

  // Mouse wheel
  let wheelTimeout;
  container.addEventListener('wheel', (e) => {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    const activePage = pages[currentPage];

    // Check if horizontal scrolling (e.g. trackpad swipe)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaX > 15) goToPage(currentPage + 1);
        else if (e.deltaX < -15) goToPage(currentPage - 1);
      }, 50);
      return;
    }

    // Check vertical scroll
    const isScrollable = activePage.scrollHeight > activePage.clientHeight;

    // allow a pixel margin for calculating bounds
    const isAtTop = activePage.scrollTop <= 1;
    const isAtBottom = Math.ceil(activePage.scrollTop + activePage.clientHeight) >= activePage.scrollHeight - 1;

    let shouldFlip = false;
    let flipDirection = 0;

    // Scrolling down (deltaY > 0) -> only flip if not scrollable or at bottom
    if (e.deltaY > 15 && (!isScrollable || isAtBottom)) {
      shouldFlip = true;
      flipDirection = 1;
      // Scrolling up (deltaY < 0) -> only flip if not scrollable or at top
    } else if (e.deltaY < -15 && (!isScrollable || isAtTop)) {
      shouldFlip = true;
      flipDirection = -1;
    }

    if (shouldFlip) {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (flipDirection === 1) goToPage(currentPage + 1);
        else if (flipDirection === -1) goToPage(currentPage - 1);
      }, 50);
    }
  }, { passive: false });

  // Touch/swipe
  let touchStartX = 0;
  let touchStartY = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (isTransitioning) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) {
        goToPage(currentPage + 1);
      } else {
        goToPage(currentPage - 1);
      }
    }
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (isTransitioning) return;

    // Ignore keydown if user is typing in an input field
    if (e.target.tagName.toLowerCase() === 'input') return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPage(currentPage - 1);
    }
  });
}

// ===== Go To Page =====
function goToPage(index) {
  if (index < 0 || index >= totalPages || index === currentPage || isTransitioning) return;

  isTransitioning = true;
  currentPage = index;

  // Update page classes
  pages.forEach((page, i) => {
    page.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');

    if (i === currentPage) {
      page.classList.add('active');
      // Scroll page content to top
      page.scrollTop = 0;
    } else if (i === currentPage - 1) {
      page.classList.add('prev');
    } else if (i === currentPage + 1) {
      page.classList.add('next');
    } else if (i < currentPage - 1) {
      page.classList.add('far-prev');
    } else {
      page.classList.add('far-next');
    }
  });

  // Update timeline
  updateTimelineActive();
  updateTimelineIndicator();

  // Trigger page-specific animations
  triggerPageAnimations(currentPage);

  // Unlock after transition
  setTimeout(() => {
    isTransitioning = false;
  }, 950);
}

// ===== Timeline Navigation =====
function initTimelineNav() {
  timelineDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.dataset.target);
      goToPage(target);
    });
  });
}

function updateTimelineActive() {
  timelineDots.forEach(dot => {
    dot.classList.remove('active');
    if (parseInt(dot.dataset.target) === currentPage) {
      dot.classList.add('active');
    }
  });
}

function updateTimelineIndicator() {
  const indicator = document.getElementById('timelineIndicator');
  const activeDot = document.querySelector(`.timeline-dot[data-target="${currentPage}"]`);
  if (!indicator || !activeDot) return;

  const rect = activeDot.getBoundingClientRect();
  const parentRect = activeDot.parentElement.getBoundingClientRect();

  indicator.style.left = (rect.left - parentRect.left) + 'px';
  indicator.style.width = rect.width + 'px';
}

// ===== Page-specific Animations =====
function triggerPageAnimations(pageIndex) {
  // Impact Dashboard counters
  if (pageIndex === 2) {
    setTimeout(() => {
      const counters = pages[2].querySelectorAll('.count-up');
      counters.forEach(c => {
        if (!c.dataset.counted) {
          c.dataset.counted = 'true';
          animateCounter(c);
        }
      });
      // Comparison bars
      const bars = pages[2].querySelectorAll('.bar-fill');
      bars.forEach(bar => {
        const w = bar.dataset.width;
        bar.style.width = w + '%';
      });
    }, 400);
  }
}

// ===== Count Up =====
function initCountUp() {
  // Will be triggered when page 2 becomes active
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const isDecimal = el.dataset.decimal === 'true';
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ===== Comparison Bars =====
function initComparisonBars() {
  // Will be triggered when page 2 becomes active
}

// ===== Certificate Actions =====
function initCertificateActions() {
  const downloadBtn = document.getElementById('downloadCert');
  const shareBtn = document.getElementById('shareCert');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const svgIcon = downloadBtn.querySelector('svg').outerHTML;
      downloadBtn.innerHTML = svgIcon + ' Đang tạo...';
      setTimeout(() => {
        downloadBtn.innerHTML = svgIcon + ' Đã tải xuống!';
        setTimeout(() => {
          downloadBtn.innerHTML = svgIcon + ' Tải Chứng Nhận';
        }, 2000);
      }, 1500);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const svgIcon = shareBtn.querySelector('svg').outerHTML;
      if (navigator.share) {
        navigator.share({
          title: 'Green Contribution Certificate - Eco-carry',
          text: 'Tôi vừa nhận được Chứng nhận Đóng góp Xanh từ Eco-carry! 🌿',
          url: window.location.href
        }).catch(() => { });
      } else {
        navigator.clipboard.writeText(
          `🌿 Chứng nhận Đóng góp Xanh từ Eco-carry! ${window.location.href}`
        ).then(() => {
          shareBtn.innerHTML = svgIcon + ' Đã sao chép!';
          setTimeout(() => {
            shareBtn.innerHTML = svgIcon + ' Chia Sẻ Lên MXH';
          }, 2000);
        });
      }
    });
  }
}

// ===== QR Lookup =====
function initQRLookup() {
  const btn = document.getElementById('lookupBtn');
  const input = document.getElementById('productCode');
  const formContainer = document.getElementById('qrFormContainer');
  const resultContainer = document.getElementById('qrResultContainer');
  const resetBtn = document.getElementById('resetLookupBtn');
  const qrSectionHeader = document.getElementById('qrSectionHeader');

  if (!btn || !input || !formContainer || !resultContainer) return;

  const originalHTML = btn.innerHTML;

  btn.addEventListener('click', () => {
    const code = input.value.trim().toUpperCase();
    if (code) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Đang tra cứu...';
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Đã tìm thấy!';
        btn.style.opacity = '1';

        setTimeout(() => {
          btn.innerHTML = originalHTML;

          // Cho phép mọi mã code đều hiển thị bảng Impact Metric thay vì văng về trang 1
          formContainer.classList.add('hidden');
          resultContainer.classList.remove('hidden');

          if (qrSectionHeader) {
            qrSectionHeader.classList.add('hidden');
          }

          // Cập nhật mã sản phẩm hiển thị theo mã khách nhập vào
          const codeDisplay = resultContainer.querySelector('.revealed-bag-code');
          if (codeDisplay) {
            codeDisplay.textContent = 'Mã SP: ' + code;
          }

          // Kích hoạt chạy số
          const counters = resultContainer.querySelectorAll('.new-counter');
          counters.forEach(c => {
            c.textContent = '0';
            animateCounter(c);
          });

          // Cuộn lên đẩu trang để xem rõ giao diện
          pages[8].scrollTop = 0;
        }, 1200);
      }, 1500);
    } else {
      input.style.borderColor = '#e74c3c';
      input.placeholder = '⚠️ Vui lòng nhập mã...';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = 'VD: ECO-2026-0001';
      }, 2000);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btn.click();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resultContainer.classList.add('hidden');
      formContainer.classList.remove('hidden');
      if (qrSectionHeader) {
        qrSectionHeader.classList.remove('hidden');
      }
      input.value = '';
    });
  }
}

// ===== Resize handler for timeline indicator =====
window.addEventListener('resize', () => {
  updateTimelineIndicator();
});
