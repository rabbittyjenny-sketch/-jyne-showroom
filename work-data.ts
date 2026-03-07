export type WorkCategory = 'ai' | 'live' | 'business';

export interface Project {
    id: string;
    title: string;
    titleTh: string;
    description: string;
    descriptionTh: string;
    category: WorkCategory;
    status: 'live' | 'coming-soon';
    link?: string;
    tags: string[];
    iconType: string;
    logo?: string;
    previewImage?: string;
}

export const projects: Project[] = [
    {
        id: 'soul-cards',
        title: 'Soul Cards',
        titleTh: 'ไพ่ออราเคิล',
        description: 'Soul Sister Oracle Deck - Select 3 cards for guidance',
        descriptionTh: 'เลือกไพ่ 3 ใบจากทั้งสำรับ 36 ใบ เพื่อไกด์ไลน์ในสิ่งที่คุณอยากถาม',
        category: 'ai',
        status: 'live',
        link: 'https://soul-card-oracle.lovable.app/',
        tags: ['AI', 'Mystical', 'Interactive'],
        iconType: 'circle-yellow',
        logo: '/images/soul-weaver-logo.png',
        previewImage: '/images/soulcard.png'
    },
    {
        id: 'soul-weaver',
        title: 'The Soul Weaver',
        titleTh: 'ความลับแห่งดวงดาว',
        description: 'Deep astrological predictions with AI narration',
        descriptionTh: 'ฟังคำทำนายดวงชะตาแบบเจาะลึกตามหลักโหราศาสตร์ตะวันตก ด้วยเสียงบรรยายพิเศษจาก AI',
        category: 'ai',
        status: 'live',
        link: 'https://the-soul-weaver.lovable.app/',
        tags: ['Spiritual', 'Journey', 'AI'],
        iconType: 'circle-yellow',
        logo: '/images/soul-weaver-logo.png',
        previewImage: '/images/soulweaver.png'
    },
    {
        id: 'kaixin',
        title: 'KAIXIN',
        titleTh: 'ค้นหาหินประจำตัว',
        description: 'Find your energy crystal based on birth date',
        descriptionTh: 'กรอกข้อมูล วัน/เดือน/ปีเกิด เพื่อค้นหา Energy Crystal ที่ช่วยเสริมพลังงานบวกให้กับคุณโดยเฉพาะ',
        category: 'ai',
        status: 'live',
        link: 'https://kaisin-e3aeho.manus.space/',
        tags: ['Crystal', 'Energy', 'Personalized'],
        iconType: 'circle-yellow',
        logo: '/images/kaixin_logo.png',
        previewImage: '/images/kaixin2.png'
    },
    {
        id: 'soul-slot',
        title: 'Soul Slot',
        titleTh: 'สุ่มตัวเลขแห่งโชคชะตา',
        description: 'Rune slot machine for daily guidance',
        descriptionTh: 'หมุนสล๊อตลุ้นอักษรรูนส์ 3 ตัวจาก 24 สัญลักษณ์ เพื่อค้นหาคำตอบและแนวทางในแบบของคุณเอง',
        category: 'ai',
        status: 'live',
        link: '/soul-slot/index.html',
        tags: ['Runes', 'Fortune', 'Game'],
        iconType: 'circle-yellow',
        logo: '/images/soulsister_logo.png',
        previewImage: '/images/rune2.png'
    },
    {
        id: 'caption-factory',
        title: 'Caption Factory',
        titleTh: 'โรงงานสร้างแคปชั่น',
        description: 'AI-powered caption generator for social media with engagement prediction',
        descriptionTh: 'สร้างแคปชั่นโซเชียลด้วย AI พร้อมทำนายการมีส่วนร่วม',
        category: 'ai',
        status: 'live',
        link: 'https://ideas365-caption-result.netlify.app/',
        tags: ['AI', 'Social Media', 'Marketing'],
        iconType: 'circle-yellow',
        logo: '/images/ideas365-logo.png',
        previewImage: '/images/captionfactory.png'
    },
    {
        id: 'event-roi-calculator',
        title: 'Event ROI Calculator',
        titleTh: 'คำนวณผลตอบแทนอีเวนต์',
        description: 'Comprehensive event investment and ROI simulation tool',
        descriptionTh: 'เครื่องมือจำลองการลงทุนและผลตอบแทนจากอีเวนต์',
        category: 'business',
        status: 'live',
        link: 'https://event-simulator-roi.netlify.app/',
        tags: ['ROI', 'Events', 'Analytics'],
        iconType: 'circle-green',
        logo: '/images/ideas365-logo.png',
        previewImage: '/images/roi.png'
    },
    {
        id: 'qr-generator',
        title: 'QR Code Generator',
        titleTh: 'สร้าง QR Code',
        description: 'Custom QR code generator with branding options',
        descriptionTh: 'สร้าง QR Code พร้อมปรับแต่งแบรนด์',
        category: 'ai',
        status: 'coming-soon',
        tags: ['QR', 'Tools', 'Branding'],
        iconType: 'circle-yellow'
    },
    {
        id: 'social-commerce-strategy',
        title: 'Social Commerce Architecture',
        titleTh: 'สถาปัตยกรรม Social Commerce',
        description: 'High-conversion multi-platform live selling blueprints for growing brands',
        descriptionTh: 'วางระบบการขายและบริหารจัดการบนโซเชียลมีเดียแบบครบวงจร เพื่อการเติบโตอย่างยั่งยืน',
        category: 'live',
        status: 'live',
        tags: ['Social Selling', 'Architecture', 'Strategy'],
        iconType: 'circle-red'
    },
    {
        id: 'video-production',
        title: 'Video Production',
        titleTh: 'ผลิตวีดีโอ',
        description: 'Product videos, tutorials, and promotional content',
        descriptionTh: 'วีดีโอสินค้า คลิปสอน และคอนเทนต์โปรโมท',
        category: 'live',
        status: 'live',
        tags: ['Video', 'Content', 'Production'],
        iconType: 'circle-red'
    },
    {
        id: 'strategy-consulting',
        title: 'Strategy Consulting',
        titleTh: 'ที่ปรึกษากลยุทธ์',
        description: 'Business blueprints with real numbers, not just vibes',
        descriptionTh: 'แผนธุรกิจที่มีตัวเลขจริง ไม่ใช่แค่ความรู้สึก',
        category: 'business',
        status: 'live',
        tags: ['Strategy', 'Consulting', 'Planning'],
        iconType: 'circle-green'
    },
    {
        id: 'systems-design',
        title: 'Systems Design',
        titleTh: 'ออกแบบระบบ',
        description: 'Operational frameworks that scale without breaking',
        descriptionTh: 'ระบบงานที่ขยายได้โดยไม่พัง',
        category: 'business',
        status: 'live',
        tags: ['Systems', 'Operations', 'Scalability'],
        iconType: 'circle-green'
    },
];
