import { useEffect, useState } from 'react';

const homeStyles = `
/* Personal Showroom - Minimalist Sophistication Design System */
:root {
  --bg-primary: #f8f7f4;
  --text-primary: #1a1d2e;
  --text-secondary: #a39f9f;
  --accent-gold: #d4af7a;
  --border-subtle: #e8e6e2;
  --transition: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.home-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: transparent;
  backdrop-filter: none;
  z-index: 1000;
  transition: all var(--transition);
  padding: 1.5rem 2rem;
}

.navbar.scrolled {
  background-color: rgba(248, 247, 244, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-primary);
}

.nav-links {
  display: flex;
  gap: 2.5rem;
}

.nav-links a {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition);
  position: relative;
}

.nav-links a:hover {
  color: var(--accent-gold);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--accent-gold);
  transition: width var(--transition);
}

.nav-links a:hover::after {
  width: 100%;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 4rem;
  margin-top: 2rem;
}

.hero-content {
  max-width: 900px;
  text-align: center;
  animation: fadeInUp 800ms ease-out;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -2px;
  line-height: 1;
}

.hero-subtitle {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.hero-tagline {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 3rem;
  color: var(--text-primary);
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 3rem 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-description p {
  margin: 1.5rem 0;
}

.divider {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  letter-spacing: 2px;
  margin: 4rem 0;
  opacity: 0.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Container */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* About Section */
.about {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.about h2,
.work h2,
.approach h2,
.services h2,
.resources h2,
.armory h2,
.contact h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 2rem;
  letter-spacing: -1px;
}

.about-intro {
  font-size: 1.25rem;
  line-height: 1.8;
  margin: 2rem 0;
  max-width: 800px;
}

.about-approach {
  margin: 2rem 0;
  font-size: 1rem;
  line-height: 1.8;
}

.about-approach p {
  margin: 1rem 0;
}

.about-approach strong {
  font-weight: 600;
}

.about-closing {
  font-size: 1rem;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--text-primary);
}

/* Work Section */
.work {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 3rem;
  margin: 3rem 0;
}

.work-card {
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-primary);
  transition: all var(--transition);
  animation: fadeInUp 600ms ease-out;
}

.work-card:hover {
  border-color: var(--accent-gold);
  box-shadow: 0 2px 12px rgba(212, 175, 122, 0.1);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.work-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0;
  letter-spacing: -0.5px;
}

.card-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 1rem 0;
}

.card-content {
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 1.5rem 0;
  color: var(--text-primary);
}

.card-content p {
  margin: 0.75rem 0;
}

.card-content strong {
  font-weight: 600;
}

.card-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
  margin-top: 1rem;
}

.card-link:hover {
  color: var(--text-primary);
}

/* Approach Section */
.approach {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.approach-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.step {
  padding: 2rem;
  border-left: 2px solid var(--border-subtle);
  transition: all var(--transition);
  animation: fadeInUp 600ms ease-out;
}

.step:hover {
  border-left-color: var(--accent-gold);
  padding-left: 2.5rem;
}

.step-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 0.5rem;
}

.step h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.step p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.approach-who {
  margin: 3rem 0;
  font-size: 0.95rem;
  line-height: 1.8;
}

.approach-who p {
  margin: 0.75rem 0;
}

.approach-who strong {
  font-weight: 600;
}

/* Services Section */
.services {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin: 3rem 0;
}

.service-card {
  padding: 2.5rem;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-primary);
  transition: all var(--transition);
  animation: fadeInUp 600ms ease-out;
}

.service-card:hover {
  border-color: var(--accent-gold);
  box-shadow: 0 2px 12px rgba(212, 175, 122, 0.1);
}

.service-card h3 {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0 0 1rem;
  letter-spacing: -0.5px;
}

.service-desc {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
}

.service-details {
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 1.5rem 0;
  color: var(--text-primary);
}

.service-details p {
  margin: 0.75rem 0;
}

.service-details strong {
  font-weight: 600;
}

.service-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
  margin-top: 1.5rem;
}

.service-link:hover {
  color: var(--text-primary);
}

/* Host Service */
.host-service {
  margin: 4rem 0;
  padding: 3rem;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-primary);
  animation: fadeInUp 600ms ease-out;
}

.host-service h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.host-tagline {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.host-details {
  font-size: 0.95rem;
  line-height: 1.8;
  margin: 1.5rem 0;
}

.host-details p {
  margin: 0.75rem 0;
}

.host-details strong {
  font-weight: 600;
}

.host-note {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 1rem 0;
  font-style: italic;
}

.host-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
  margin-top: 1rem;
}

.host-link:hover {
  color: var(--text-primary);
}

/* Resources Section */
.resources {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.resources-intro {
  font-size: 1.125rem;
  margin: 2rem 0;
  color: var(--text-primary);
}

.resources-list {
  margin: 2rem 0;
}

.resource-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-subtle);
  animation: fadeInUp 600ms ease-out;
}

.resource-item:last-child {
  border-bottom: none;
}

.resource-item h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.resource-item p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

.resources-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
  margin-top: 1.5rem;
}

.resources-link:hover {
  color: var(--text-primary);
}

/* The Armory Section */
.armory {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.armory-intro {
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--text-primary);
  max-width: 800px;
}

.armory-category {
  margin: 3rem 0;
  animation: fadeInUp 600ms ease-out;
}

.armory-category h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1.5rem;
  letter-spacing: -0.5px;
}

.armory-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.armory-item {
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-primary);
  transition: all var(--transition);
}

.armory-item:hover {
  border-color: var(--accent-gold);
  box-shadow: 0 2px 12px rgba(212, 175, 122, 0.1);
}

.armory-item h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.armory-item p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.armory-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color var(--transition);
}

.armory-link:hover {
  color: var(--text-primary);
}

/* Contact Section */
.contact {
  padding: 6rem 2rem;
  background-color: var(--bg-primary);
}

.contact-intro {
  font-size: 1.125rem;
  margin: 2rem 0 1rem;
  color: var(--text-primary);
}

.contact-criteria {
  font-size: 1rem;
  line-height: 1.8;
  margin: 1rem 0 2rem;
  color: var(--text-primary);
}

.contact-closing {
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 2rem 0;
  color: var(--text-primary);
  max-width: 600px;
}

.contact-actions {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.contact-link {
  display: inline-block;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color var(--transition);
}

.contact-link:hover {
  color: var(--text-primary);
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-subtle);
}

.footer p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.footer-email {
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 5rem 1.5rem 3rem;
    min-height: auto;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-tagline {
    font-size: 1.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .about,
  .work,
  .approach,
  .services,
  .resources,
  .armory,
  .contact {
    padding: 4rem 1.5rem;
  }

  .about h2,
  .work h2,
  .approach h2,
  .services h2,
  .resources h2,
  .armory h2,
  .contact h2 {
    font-size: 2rem;
  }

  .work-grid,
  .services-grid,
  .armory-items {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .approach-steps {
    grid-template-columns: 1fr;
  }

  .contact-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.875rem;
  }

  .hero-tagline {
    font-size: 1rem;
  }

  .about h2,
  .work h2,
  .approach h2,
  .services h2,
  .resources h2,
  .armory h2,
  .contact h2 {
    font-size: 1.5rem;
  }

  .work-card,
  .service-card,
  .armory-item,
  .host-service {
    padding: 1.5rem;
  }

  .section-container {
    padding: 0 1rem;
  }

  .navbar {
    padding: 1rem;
  }

  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`;

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = homeStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-logo">JYNE | iDEAS365</div>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#armory">The Armory</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">เจนจิรา ไชยสิน</h1>
          <p className="hero-subtitle">JYNE | iDEAS365</p>
          <p className="hero-tagline">สถาปนิกระบบ × นักวางแผนธุรกิจ</p>
          
          <div className="hero-description">
            <p>ผมช่วยธุรกิจสร้างระบบที่ใช้งานได้จริง—<br />
            ไม่ใช่แค่ดูดีบนกระดาษ</p>
            
            <p>จากกรอบการวางแผนไปจนถึงการดำเนินงานสด<br />
            ผมเชื่อมจุดต่างๆ ระหว่างสิ่งที่คุณวางแผน<br />
            และสิ่งที่ทีมของคุณสามารถดำเนินการได้จริง</p>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <div className="section-container">
          <h2>ผมทำอะไร</h2>
          
          <p className="about-intro">
            ผมออกแบบระบบการดำเนินงานสำหรับธุรกิจ—<br />
            ประเภทที่ช่วยให้คุณเติบโตโดยไม่ทำให้หมดแรง
          </p>

          <div className="about-approach">
            <p><strong>วิธีการของผมรวมถึง:</strong></p>
            <p>→ การคิดแบบระบบ (โครงสร้าง + กระบวนการ)<br />
            → กลยุทธ์ธุรกิจ (ตลาด + ตัวเลข)<br />
            → การดำเนินการจริง (ทดสอบในสภาพจริง)</p>
          </div>

          <p className="about-closing">
            ผมเคยทำงานในด้านอีคอมเมิร์ส ไลฟ์คอมเมิร์ส<br />
            และการดำเนินงานธุรกิจ—<br />
            มุ่งเน้นไปที่การทำให้สิ่งต่างๆ ง่ายขึ้น<br />
            ไม่ใช่ซับซ้อนขึ้น
          </p>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* Work Section */}
      <section className="work" id="work">
        <div className="section-container">
          <h2>ผลงาน</h2>
          
          <div className="work-grid">
            {/* Column 1: Strategy Frameworks */}
            <div className="work-card">
              <div className="card-icon">📊</div>
              <h3>กรอบการวางแผนกลยุทธ์</h3>
              <p className="card-description">
                แบบแผนธุรกิจที่มีตัวเลขจริง—<br />
                ไม่ใช่แค่ทฤษฎี
              </p>
              <div className="card-content">
                <p><strong>สิ่งที่ผมสร้างขึ้น:</strong></p>
                <p>→ กรอบการเปิดตัวอีคอมเมิร์ส (กลยุทธ์เข้าสู่ตลาด โครงสร้างทีม แบบจำลองทางการเงิน)<br />
                → คู่มือเข้าสู่ตลาด (การวิเคราะห์การแข่งขัน การกำหนดตำแหน่ง การวางแผนเวลา)<br />
                → แผนการเติบโต (ระบบ 7 ขั้นตอนพร้อมการคาดการณ์ ROI)</p>
                <p><strong>รูปแบบ:</strong> คู่มือดิจิทัล เทมเพลต เวิร์กชอป</p>
              </div>
              <a href="#" className="card-link">ดูตัวอย่างผลงาน →</a>
            </div>

            {/* Column 2: Operations Systems */}
            <div className="work-card">
              <div className="card-icon">⚙️</div>
              <h3>ระบบการดำเนินงาน</h3>
              <p className="card-description">
                ออกแบบขั้นตอนการทำงานที่ทีมของคุณสามารถปฏิบัติตามได้
              </p>
              <div className="card-content">
                <p><strong>สิ่งที่ผมเน้น:</strong></p>
                <p>→ การทำแผนที่กระบวนการ (ที่ไหนที่พลังงานสูญเสีย)<br />
                → โครงสร้างทีม (บทบาทชัดเจน ความสามารถที่สมจริง)<br />
                → การรวมระบบเทคโนโลยี (เครื่องมือที่สื่อสารกัน)<br />
                → การติดตามประสิทธิภาพ (เมตริกที่สำคัญ)</p>
                <p><strong>ผลลัพธ์:</strong> ระบบที่ลดความเสียดสี ไม่เพิ่มความซับซ้อน</p>
              </div>
              <a href="#" className="card-link">ดูกรณีศึกษา →</a>
            </div>

            {/* Column 3: Live Commerce Execution */}
            <div className="work-card">
              <div className="card-icon">🎥</div>
              <h3>การดำเนินการไลฟ์คอมเมิร์ส</h3>
              <p className="card-description">
                สร้างระบบการขายสดจากศูนย์ไปยังรายได้
              </p>
              <div className="card-content">
                <p><strong>สิ่งที่ผมทำ:</strong></p>
                <p>→ ออกแบบและจัดการสดที่สร้างยอดขายหลักแสน<br />
                → สร้างกรอบการทำงานที่ซ้ำได้ (สคริปต์ การไหลของสินค้า การจัดเวลา)<br />
                → ฝึกอบรมทีมเกี่ยวกับการดำเนินการไลฟ์คอมเมิร์สที่ยั่งยืน</p>
                <p>นี่ไม่ใช่แค่กลยุทธ์—<br />
                มันถูกทดสอบในสภาพตลาดจริง</p>
              </div>
              <a href="#" className="card-link">เบื้องหลังม่านแสง →</a>
            </div>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="approach">
        <div className="section-container">
          <h2>วิธีการทำงานของผม</h2>
          
          <div className="approach-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>ฟังก่อน</h4>
              <p>เข้าใจปัญหาจริง ไม่ใช่แค่อาการ</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>ทำแผนที่ระบบ</h4>
              <p>ที่ไหนที่มีความเสียดสี? อะไรที่ใช้ได้? อะไรที่ดูดพลังงาน?</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>ออกแบบด้วยข้อจำกัด</h4>
              <p>งบประมาณจริง ระยะเวลาจริง คนจริง</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>สร้างแบบวนซ้ำ</h4>
              <p>เริ่มง่าย ทดสอบ ปรับปรุง ขยายขนาด</p>
            </div>
            <div className="step">
              <div className="step-number">5</div>
              <h4>โอนการเป็นเจ้าของ</h4>
              <p>คุณควรเป็นเจ้าของระบบ ไม่ต้องพึ่งผมตลอดไป</p>
            </div>
          </div>

          <div className="approach-who">
            <p><strong>ผมทำงานกับ:</strong></p>
            <p>→ ธุรกิจเริ่มต้นที่สร้างระบบแรกของพวกเขา<br />
            → แบรนด์ที่เติบโตแก้ไขคอขวดการดำเนินงาน<br />
            → ทีมที่ต้องการความชัดเจนเกี่ยวกับโครงสร้างและกระบวนการ</p>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="section-container">
          <h2>ทำงานกับผม</h2>
          
          <div className="services-grid">
            {/* Service 1 */}
            <div className="service-card">
              <h3>ที่ปรึกษาด้านกลยุทธ์</h3>
              <p className="service-desc">การวางแผนธุรกิจโดยคำนึงถึงความเป็นจริงในการดำเนินงาน</p>
              
              <div className="service-details">
                <p><strong>รวมถึง:</strong></p>
                <p>→ กลยุทธ์ตลาดและการกำหนดตำแหน่ง<br />
                → การสร้างแบบจำลองทางการเงินและการคาดการณ์<br />
                → โครงสร้างทีมและการวางแผนความสามารถ<br />
                → คำแนะนำเกี่ยวกับสแต็กเทคโนโลยี</p>
                
                <p><strong>รูปแบบ:</strong> ตามโครงการหรือค่าธรรมเนียมรายเดือน<br />
                <strong>ระยะเวลา:</strong> 4-12 สัปดาห์</p>
              </div>
              
              <a href="#" className="service-link">เรียนรู้เพิ่มเติม →</a>
            </div>

            {/* Service 2 */}
            <div className="service-card">
              <h3>การออกแบบระบบ</h3>
              <p className="service-desc">สร้างกรอบการดำเนินงานที่ปรับขนาดได้</p>
              
              <div className="service-details">
                <p><strong>รวมถึง:</strong></p>
                <p>→ การทำแผนที่กระบวนการและการออกแบบเวิร์กโฟลว์<br />
                → ขั้นตอนการดำเนินงานมาตรฐาน<br />
                → เมตริกประสิทธิภาพและการติดตาม<br />
                → การฝึกอบรมและเอกสารทีม</p>
                
                <p><strong>รูปแบบ:</strong> การมีส่วนร่วมแบบกำหนดเอง<br />
                <strong>ระยะเวลา:</strong> 6-16 สัปดาห์</p>
              </div>
              
              <a href="#" className="service-link">เรียนรู้เพิ่มเติม →</a>
            </div>

            {/* Service 3 */}
            <div className="service-card">
              <h3>ตั้งค่าไลฟ์คอมเมิร์ส</h3>
              <p className="service-desc">การนำไปใช้การขายสดแบบครบวงจร</p>
              
              <div className="service-details">
                <p><strong>รวมถึง:</strong></p>
                <p>→ กลยุทธ์และการเลือกสินค้า<br />
                → กรอบสคริปต์และการฝึกอบรมพิธีกร<br />
                → ตั้งค่าทางเทคนิคและการดำเนินงาน<br />
                → การปรับปรุงประสิทธิภาพ</p>
                
                <p><strong>รูปแบบ:</strong> แพ็คเกจเปิดตัวหรือการสนับสนุนอย่างต่อเนื่อง<br />
                <strong>ระยะเวลา:</strong> 2-8 สัปดาห์</p>
              </div>
              
              <a href="#" className="service-link">เรียนรู้เพิ่มเติม →</a>
            </div>
          </div>

          {/* Host Service */}
          <div className="host-service">
            <h3>จ้างผมเป็นพิธีกรไลฟ์</h3>
            <p className="host-tagline">รับไลฟ์ให้แบรนด์ | คุณมีสินค้าที่ดี แต่ไม่มีใครจัดการไลฟ์?</p>
            
            <div className="host-details">
              <p><strong>บริการ:</strong></p>
              <p>→ พิธีกร (2 ชั่วโมง)<br />
              → ผู้ช่วยพิธีกร (เพิ่มยอดขายในช่วงเวลาสำคัญ)<br />
              → ที่ปรึกษา (คำแนะนำเบื้องหลังม่านแสง)</p>
              
              <p><strong>เหมาะสำหรับ:</strong></p>
              <p>→ แบรนด์ใหม่ที่ต้องการเริ่มต้น<br />
              → แบรนด์ที่พิธีกรไม่พร้อมอย่างกะทันหัน<br />
              → แคมเปญพิเศษที่ต้องการเพิ่มยอด</p>
              
              <p className="host-note">📌 หมายเหตุ: ยอมรับเฉพาะสินค้าที่ผมเชื่อมั่น (เราดูแลชื่อเสียงของเรา)</p>
            </div>
            
            <a href="#" className="host-link">ตรวจสอบความพร้อม → DM</a>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="resources">
        <div className="section-container">
          <h2>ทรัพยากร</h2>
          <p className="resources-intro">สิ่งที่ผมสร้างขึ้นที่อาจช่วยได้:</p>
          
          <div className="resources-list">
            <div className="resource-item">
              <h4>แบบแผนการเปิดตัวอีคอมเมิร์ส</h4>
              <p>คู่มือ 70 หน้าเกี่ยวกับการเปิดตัวด้วยแบบจำลองทางการเงินจริง</p>
            </div>
            <div className="resource-item">
              <h4>เทมเพลตการคิดแบบระบบ</h4>
              <p>กรอบการทำแผนที่กระบวนการและระบุคอขวด</p>
            </div>
            <div className="resource-item">
              <h4>คู่มือไลฟ์คอมเมิร์ส</h4>
              <p>สิ่งที่ผมเรียนรู้จากการสร้างสดที่มีรายได้หลักแสน</p>
            </div>
          </div>
          
          <a href="#" className="resources-link">เรียกดูทรัพยากร →</a>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* The Armory Section */}
      <section className="armory" id="armory">
        <div className="section-container">
          <h2>คลังอาวุธ</h2>
          <p className="armory-intro">เครื่องมือและระบบ พร้อมใช้งาน<br />
          สร้างสำหรับผู้ก่อตั้งและทีมที่ต้องการดำเนินการด้วยความแม่นยำ</p>
          
          <div className="divider">━━━━━━━━━━━━━━━━━</div>

          {/* Armory Category 1 */}
          <div className="armory-category">
            <h3>แบบแผนกลยุทธ์</h3>
            
            <div className="armory-items">
              <div className="armory-item">
                <h4>แบบแผนการเปิดตัวอีคอมเมิร์ส</h4>
                <p>คู่มือ 70 หน้าพร้อมแบบจำลองทางการเงินจริงเพื่อวางแผนการเข้าสู่ตลาด</p>
                <a href="#" className="armory-link">ดาวน์โหลดแบบแผน →</a>
              </div>
              
              <div className="armory-item">
                <h4>เทมเพลตแผนการเติบโต 7 ขั้นตอน</h4>
                <p>ระบบที่คาดการณ์ได้เพื่อวางแผนการเติบโตจากก่อนเปิดตัวไปจนถึงการขยายขนาด</p>
                <a href="#" className="armory-link">ดาวน์โหลดเทมเพลต →</a>
              </div>
            </div>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>

          {/* Armory Category 2 */}
          <div className="armory-category">
            <h3>ระบบการดำเนินงานและเทมเพลต</h3>
            
            <div className="armory-items">
              <div className="armory-item">
                <h4>ศูนย์การดำเนินงานที่ใช้ Notion</h4>
                <p>ระบบที่สร้างไว้ล่วงหน้าสำหรับการทำแผนที่กระบวนการ โครงสร้างทีม และการติดตามประสิทธิภาพ</p>
                <a href="#" className="armory-link">ปรับใช้ศูนย์ →</a>
              </div>
              
              <div className="armory-item">
                <h4>ชุดกราฟิกไลฟ์คอมเมิร์ส</h4>
                <p>สินค้ากราฟิกมืออาชีพ (กรอบ แบนเนอร์ CTA) สำหรับสดของคุณ</p>
                <a href="#" className="armory-link">ดาวน์โหลดชุด →</a>
              </div>
            </div>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>

          {/* Armory Category 3 */}
          <div className="armory-category">
            <h3>เวิร์กชอปและระบบขนาดเล็ก</h3>
            
            <div className="armory-items">
              <div className="armory-item">
                <h4>เวิร์กชอปตั้งค่าไลฟ์คอมเมิร์ส (บันทึกไว้ล่วงหน้า)</h4>
                <p>คู่มือวิดีโอแบบครบวงจรเกี่ยวกับการสร้างตั้งค่าสดที่มีรายได้หลักแสน</p>
                <a href="#" className="armory-link">เข้าถึงเวิร์กชอป →</a>
              </div>
            </div>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="section-container">
          <h2>มาคุยกัน</h2>
          
          <p className="contact-intro">ถ้าคุณ:</p>
          <p className="contact-criteria">
            → กำลังสร้างบางสิ่งและต้องการระบบที่ชัดเจนขึ้น<br />
            → กำลังเติบโต แต่ติดขัดในการดำเนินงาน<br />
            → วางแผนช่องทางใหม่และต้องการทำให้ถูกต้อง
          </p>
          
          <p className="contact-closing">ผมยินดีที่จะคุยกับคุณ<br />
          ไม่มีความกดดัน แค่การสนทนาเพื่อดูว่าผมสามารถช่วยได้หรือไม่</p>

          <div className="contact-actions">
            <a href="#" className="contact-link">จองการโทร →</a>
            <a href="mailto:jen@ideas365.com" className="contact-link">ส่งอีเมล →</a>
          </div>

          <div className="divider">━━━━━━━━━━━━━━━━━</div>

          <footer className="footer">
            <p>อยู่ที่กรุงเทพฯ ประเทศไทย<br />
            ทำงานกับลูกค้าทั่วโลก</p>
            <p className="footer-email">jen@ideas365.com</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
