// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initNavbar();
  initScrollProgress();
  initScrollAnimations();
  initCountUp();
  initComparisonBars();
  initBackToTop();
  initSmoothScroll();
  initQRLookup();
  initCertificateActions();
  initParallax();
});

// ===== Loading Screen =====
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) return;
  
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    // Trigger hero animations after loading
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 300);
  }, 1800);
}

// ===== Navbar =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
  
  // Mobile menu
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
  }
  
  // Close mobile menu on link click
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (mobileMenuBtn) mobileMenuBtn.textContent = '☰';
      });
    });
  }
  
  // Active section highlighting
  const sections = document.querySelectorAll('.section');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 200;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    
    navAnchors.forEach(anchor => {
      anchor.classList.remove('active');
      if (anchor.getAttribute('href') === `#${current}`) {
        anchor.classList.add('active');
      }
    });
  }, { passive: true });
}

// ===== Scroll Progress =====
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / scrollHeight) * 100;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve so animations play once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(el => observer.observe(el));
}

// ===== Count Up Animation =====
function initCountUp() {
  const counters = document.querySelectorAll('.count-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out quad
    const easedProgress = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(easedProgress * target);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ===== Comparison Bars =====
function initComparisonBars() {
  const bars = document.querySelectorAll('.comparison-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        setTimeout(() => {
          entry.target.style.width = `${width}%`;
        }, 300);
      }
    });
  }, { threshold: 0.5 });
  
  bars.forEach(bar => observer.observe(bar));
}

// ===== Back to Top =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80; // navbar height
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== QR Lookup =====
function initQRLookup() {
  const lookupBtn = document.getElementById('lookupBtn');
  const productCode = document.getElementById('productCode');
  
  if (!lookupBtn || !productCode) return;
  
  lookupBtn.addEventListener('click', () => {
    const code = productCode.value.trim();
    if (code) {
      // Simulate lookup with animation
      lookupBtn.textContent = '⏳ Đang tra cứu...';
      lookupBtn.style.opacity = '0.7';
      
      setTimeout(() => {
        lookupBtn.textContent = '✅ Đã tìm thấy!';
        lookupBtn.style.opacity = '1';
        
        // Show results - scroll to supply chain
        setTimeout(() => {
          lookupBtn.textContent = '🔍 Tra Cứu';
          const supplyChain = document.getElementById('supply-chain');
          if (supplyChain) {
            supplyChain.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1500);
      }, 2000);
    } else {
      productCode.style.borderColor = '#e74c3c';
      productCode.placeholder = '⚠️ Vui lòng nhập mã sản phẩm...';
      setTimeout(() => {
        productCode.style.borderColor = '';
        productCode.placeholder = 'Nhập mã sản phẩm (VD: ECO-2026-0001)';
      }, 2000);
    }
  });
  
  // Enter key
  productCode.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      lookupBtn.click();
    }
  });
}

// ===== Certificate Actions =====
function initCertificateActions() {
  const downloadBtn = document.getElementById('downloadCert');
  const shareBtn = document.getElementById('shareCert');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Simulate download
      downloadBtn.innerHTML = '⏳ Đang tạo...';
      setTimeout(() => {
        downloadBtn.innerHTML = '✅ Đã tải xuống!';
        setTimeout(() => {
          downloadBtn.innerHTML = '⬇️ Tải Chứng Nhận';
        }, 2000);
      }, 1500);
    });
  }
  
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      // Try native share API
      if (navigator.share) {
        navigator.share({
          title: 'Green Contribution Certificate - Eco-carry',
          text: 'Tôi vừa nhận được Chứng nhận Đóng góp Xanh từ Eco-carry! 🌿',
          url: window.location.href
        }).catch(() => {});
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(
          `🌿 Tôi vừa nhận được Chứng nhận Đóng góp Xanh từ Eco-carry! Cùng tham gia hành trình tái sinh: ${window.location.href}`
        ).then(() => {
          shareBtn.innerHTML = '✅ Đã sao chép link!';
          setTimeout(() => {
            shareBtn.innerHTML = '📤 Chia Sẻ Lên MXH';
          }, 2000);
        });
      }
    });
  }
}

// ===== Parallax Effect =====
function initParallax() {
  const hero = document.querySelector('.hero-bg-overlay');
  const particles = document.querySelectorAll('.particle');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    if (hero && scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    
    particles.forEach((particle, i) => {
      const speed = 0.1 + (i * 0.05);
      particle.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

// ===== Additional: Smooth reveal for timeline items on hover =====
document.querySelectorAll('.timeline-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.querySelector('.timeline-overlay').style.transform = 'translateY(0)';
    this.querySelector('.timeline-overlay').style.opacity = '1';
  });
});

// ===== Typing effect for hero (subtle) =====
function initTypingEffect() {
  const subtitle = document.querySelector('.hero-subtitle');
  if (!subtitle) return;
  
  const text = subtitle.textContent;
  subtitle.textContent = '';
  subtitle.style.opacity = '1';
  
  let i = 0;
  function type() {
    if (i < text.length) {
      subtitle.textContent += text.charAt(i);
      i++;
      setTimeout(type, 20);
    }
  }
  
  setTimeout(type, 2000);
}
