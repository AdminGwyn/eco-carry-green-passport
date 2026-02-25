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

  // Mouse wheel - ONLY turn pages on strong horizontal swipe.
  // Native vertical scroll should work normally without turning pages.
  let wheelTimeout;
  container.addEventListener('wheel', (e) => {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    // Check if horizontal scrolling (e.g. trackpad swipe horizontally)
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault(); // Prevent accidental navigation on horizontal swipe
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaX > 20) goToPage(currentPage + 1);
        else if (e.deltaX < -20) goToPage(currentPage - 1);
      }, 50);
    }
    // Else: it is a vertical scroll (e.deltaY). We do NOT preventDefault(). 
    // We do NOT flip pages. We just let the browser scroll the page up/down.

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
    if (e.key === 'Enter') {
      e.preventDefault();
      btn.click();
    }
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

  // ===== HTML5 QR Code Scanner Integration =====
  const startQrScanBtn = document.getElementById('startQrScanBtn');
  const stopQrScanBtn = document.getElementById('stopQrScanBtn');
  const qrScanStatus = document.getElementById('qrScanStatus');
  const qrReader = document.getElementById('qrReader');
  let html5QrcodeScanner = null;

  function stopScan() {
    if (html5QrcodeScanner) {
      // Html5Qrcode.stop() returns a Promise
      html5QrcodeScanner.stop().then(() => {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
        if (qrReader) qrReader.style.display = 'none';
        if (startQrScanBtn) startQrScanBtn.classList.remove('hidden');
        if (stopQrScanBtn) stopQrScanBtn.classList.add('hidden');
        if (qrScanStatus) qrScanStatus.textContent = 'Nhấn vào biểu tượng để bật Camera quét mã';
      }).catch(err => {
        console.error("Failed to stop scanner", err);
      });
    }
  }

  if (startQrScanBtn && qrReader) {
    startQrScanBtn.addEventListener('click', () => {
      if (typeof Html5Qrcode === 'undefined') {
        qrScanStatus.textContent = 'Không tải được thư viện quét mã. Vui lòng tải lại trang.';
        return;
      }

      startQrScanBtn.classList.add('hidden');
      stopQrScanBtn.classList.remove('hidden');
      qrReader.style.display = 'block';
      qrScanStatus.textContent = 'Đang bật Camera... Hãy đưa mã QR vào khung hình';

      html5QrcodeScanner = new Html5Qrcode("qrReader");

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          // Success callback

          // Stop the scanner
          stopScan();

          // If the decoded text is an URL (e.g. from the physical physical tag), try to extract code
          // For now, let's just use the decoded text or a default if it's our URL
          let currentCode = decodedText;
          if (currentCode.includes('eco-carry.site')) {
            // Example if URL format is eco-carry.site/?qr=ECO-2026-0001
            const match = currentCode.match(/ECO-\d{4}-\d{4}/i);
            if (match) currentCode = match[0];
            else currentCode = 'ECO-2026-0001'; // Default Fallback
          }

          input.value = currentCode;
          btn.click(); // Auto submit
        },
        (errorMessage) => {
          // Continues scanning, suppress error output to keep it clean
        }
      ).catch((err) => {
        qrScanStatus.textContent = 'Lỗi truy cập Camera. Vui lòng cấp quyền (Allow) cho trình duyệt.';
        startQrScanBtn.classList.remove('hidden');
        stopQrScanBtn.classList.add('hidden');
        qrReader.style.display = 'none';
      });
    });
  }
  if (stopQrScanBtn) {
    stopQrScanBtn.addEventListener('click', () => {
      stopScan();
    });
  }

  // ===== Scan QR from File Upload =====
  const qrFileInput = document.getElementById('qrFileInput');
  if (qrFileInput) {
    qrFileInput.addEventListener('change', (e) => {
      if (e.target.files.length === 0) return;
      const file = e.target.files[0];

      if (typeof Html5Qrcode === 'undefined') {
        qrScanStatus.textContent = 'Không tải được thư viện quét mã.';
        return;
      }

      qrScanStatus.textContent = 'Đang đọc thẻ mã QR...';
      const html5QrCode = new Html5Qrcode("qrReader");

      html5QrCode.scanFile(file, true)
        .then(decodedText => {
          let currentCode = decodedText;
          if (currentCode.includes('eco-carry.site')) {
            const match = currentCode.match(/ECO-\d{4}-\d{4}/i);
            if (match) currentCode = match[0];
            else currentCode = 'ECO-2026-0001';
          }
          input.value = currentCode;
          qrScanStatus.textContent = 'Nhấn vào biểu tượng để bật Camera quét mã';
          btn.click(); // Auto submit result
        })
        .catch(err => {
          qrScanStatus.textContent = 'Không tìm thấy hoặc không thể đọc được mã QR trong ảnh này.';
          setTimeout(() => {
            qrScanStatus.textContent = 'Nhấn vào biểu tượng để bật Camera quét mã';
          }, 3500);
        })
        .finally(() => {
          html5QrCode.clear(); // Important: cleanup
          qrFileInput.value = ''; // Reset file input so user can upload same file again if wanted
        });
    });
  }
}

// ===== Resize handler for timeline indicator =====
window.addEventListener('resize', () => {
  updateTimelineIndicator();
});
