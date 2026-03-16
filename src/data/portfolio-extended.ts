export const personalInfo = {
  name: "Maximiliano Bustamante",
  firstName: "Maximiliano",
  title: "Software Engineer",
  subtitle: "Frontend Developer",
  email: "maxbustamanteg@gmail.com",
  phone: "+57 3195940522",
  location: "Medellín, Colombia",
  linkedin: "https://www.linkedin.com/in/maximiliano-bustamante-998b77173/",
  github: "https://github.com/Max-Bustamante69",
  portfolio: "https://maxfolio.co",
  summary:
    "I'm a passionate Software Engineering student at EAFIT University with extensive experience in modern web development. I specialize in React, Next.js, and creating beautiful, functional user experiences that drive business results.",
  availability: "Available for freelance projects and full-time opportunities",
  responseTime: "Typical response time: 2-6 hours",
  currentQuarter: "Q1 2026",
};

export const hero = {
  greeting: "Hi, I'm",
  description: "I'm a passionate Software Engineering student at EAFIT University with extensive experience in modern web development. I specialize in React, Next.js, and creating beautiful, functional user experiences that drive business results.",
  currentFocus: {
    title: "Current Focus",
    items: [
      "Lead Frontend Developer at Ellamau SAS",
      "Building scalable e-commerce solutions with Shopify Liquid",
      "Freelance web development projects"
    ]
  },
  buttons: {  
    getInTouch: "Get In Touch",
    downloadCV: "Download CV"
  }
};

export const skills = {
  languages: ["JavaScript", "TypeScript", "HTML", "CSS", "Python", "Java"],
  frameworks: ["React", "Next.js", "Astro", "Django"],
  databases: ["MongoDB", "PostgreSQL", "SQL", "GraphQL"],
  platforms: ["Shopify", "Salesforce", "WordPress", "Contentful"],
  tools: ["Git", "Vite", "Tailwind CSS", "Framer Motion"],
  spoken: [
    { language: "English", level: "C1 (IELTS Certified)" },
    { language: "Spanish", level: "Native" },
  ],
};

export const skillsDetailed = [
  { name: "React", level: "Expert", description: "Building complex, scalable web applications with modern React patterns", category: "frontend" },
  { name: "JavaScript", level: "Expert", description: "ES6+, async/await, functional programming, and modern JS patterns", category: "frontend" },
  { name: "Next.js", level: "Advanced", description: "Full-stack React framework with SSR, API routes, and optimization", category: "frontend" },
  { name: "TypeScript", level: "Advanced", description: "Type-safe development with advanced TypeScript features", category: "frontend" },
  { name: "Tailwind CSS", level: "Expert", description: "Utility-first CSS framework for rapid UI development", category: "frontend" },
  { name: "Python", level: "Intermediate", description: "Backend development, automation, and data processing", category: "backend" },
  { name: "MongoDB", level: "Advanced", description: "NoSQL database design, aggregation pipelines, and performance optimization", category: "database" },
  { name: "Shopify Liquid", level: "Expert", description: "Shopify's templating language for dynamic e-commerce themes", category: "frontend" },
];

export const education = [
  {
    institution: "EAFIT University",
    degree: "Software Engineering",
    status: "Seventh Semester",
    period: "2023 - Present",
    location: "Medellín, Colombia",
  },
  {
    institution: "Colegio Colombo Británico",
    degree: "High School",
    period: "2008 - 2022",
    location: "Colombia",
  },
];

export const experience = [
  {
    id: "ellamau",
    title: "Lead Frontend Developer",
    company: "Ellamau SAS",
    location: "Remote",
    period: "2024 - Present",
    type: "current",
    description: "Leading the complete frontend architecture and development of an e-commerce platform. Responsible for the entire technology stack planning and implementation.",
    highlights: [
      "Architected complete e-commerce solution using MongoDB, Next.js, and Stripe",
      "Implemented React Query for efficient state management",
      "Designed responsive UI with modern best practices",
    ],
    metrics: [
      { value: "60%", label: "Sales Increase" },
      { value: "30 Days", label: "Timeline" },
      { value: "3", label: "Team Size" },
    ],
    technologies: ["React", "Next.js", "MongoDB", "Stripe", "React Query", "Tailwind CSS"],
    website: "https://ellamau.vercel.app/",
    logo: "https://www.ellamauusa.com/cdn/shop/files/logo_ellamau.png?height=628&pad_color=ffffff&v=1743481196&width=1200",
  },
  {
    id: "digitdeck",
    title: "Frontend Developer",
    company: "Digitdeck",
    location: "Remote",
    period: "2024 - 2026",
    type: "full-time",
    description: "Developed multiple e-commerce storefronts using Shopify and Liquid templating. Built custom plugins and add-ons for enhanced functionality including review systems, resulting in increased sales and improved SEO performance.",
    highlights: [
      "Built multiple Shopify e-commerce storefronts with custom Liquid themes",
      "Developed custom plugins and add-ons for product reviews and ratings",
      "Optimized store performance and SEO for better search rankings",
      "Implemented responsive designs ensuring seamless mobile shopping experience",
    ],
    metrics: [
      { value: "5+", label: "Stores Built" },
      { value: "+45%", label: "Sales Increase" },
      { value: "+60%", label: "SEO Improvement" },
    ],
    technologies: ["Shopify", "Liquid", "JavaScript", "CSS3", "HTML5", "SEO"],
    website: "https://digitdeck.co/",
    logo: "https://framerusercontent.com/images/UJJ3kd6f5grrgPCmw1YV1u0Np80.png",
  },
  {
    id: "rh",
    title: "Frontend Developer",
    company: "RH (Restoration Hardware)",
    location: "Remote",
    period: "2024 - 2026",
    type: "full-time",
    description: "Developed reusable components for migration from Adobe Experience Manager to Contentful Studio, achieving significant cost reduction.",
    highlights: [
      "Created component library for AEM to Contentful migration",
      "Implemented Material UI and Radix UI components",
      "Optimized performance and accessibility standards",
      "Collaborated with design team for pixel-perfect implementations",
    ],
    metrics: [
      { value: "60%", label: "Cost Reduction" },
      { value: "50+", label: "Components Built" },
      { value: "12", label: "Team Members" },
    ],
    technologies: ["React", "Material UI", "Radix UI", "Tailwind CSS", "Contentful", "AEM"],
    website: "https://rh.com/us/en/sale",
    logo: "https://companieslogo.com/img/orig/RH-b5862da2.png?t=1720244493",
  },
  {
    id: "abidata",
    title: "Full Stack Developer",
    company: "ABI Data",
    location: "Medellín, Colombia",
    period: "2025",
    type: "full-time",
    description: "Developed enterprise newsletter software enabling businesses to create, manage, and distribute customized email campaigns. Built both frontend visualization and admin panel, along with backend API endpoints for newsletter and contact management.",
    highlights: [
      "Designed and built newsletter visualization system with React Email",
      "Developed admin panel for newsletter management and customization",
      "Created RESTful API endpoints for contacts and newsletter operations",
      "Integrated frontend with backend services for seamless data flow",
    ],
    metrics: [
      { value: "15+", label: "API Endpoints" },
      { value: "+40%", label: "Efficiency Gain" },
      { value: "20+", label: "Customizations" },
    ],
    technologies: ["Django", "Next.js", "Redux", "React Query", "React Email", "PostgreSQL"],
    website: "https://abidata.co/en/",
    logo: "https://abidata.co/en/wp-content/uploads/2025/05/logo-abi.webp",
  },
  {
    id: "orthofix",
    title: "Frontend & Salesforce Developer",
    company: "Orthofix",
    location: "Remote",
    period: "2023 - 2024",
    type: "full-time",
    description: "Developed patient registration software and section management systems using Lightning Web Components and Salesforce platform.",
    highlights: [
      "Built patient registration system from scratch",
      "Implemented section management with Salesforce",
      "Created Lightning Web Components for enhanced UX",
      "Integrated with medical device tracking systems",
    ],
    metrics: [
      { value: "1000+", label: "Patients Processed" },
      { value: "99.9%", label: "System Uptime" },
      { value: "-75%", label: "Processing Time" },
    ],
    technologies: ["Lightning Web Components", "Salesforce", "JavaScript", "Apex", "SOQL"],
    website: "https://orthofix.com/",
    logo: "https://companieslogo.com/img/orig/OFIX-c56c9c90.png?t=1720244493",
  },
  {
    id: "ibox",
    title: "Frontend React Developer",
    company: "iBox SA",
    location: "Medellín, Colombia",
    period: "2021 - 2022",
    type: "full-time",
    description: "Led the creation of the main company website focused on intelligent locker solutions, establishing the digital presence for the business.",
    highlights: [
      "Implemented responsive design for all devices",
      "Created interactive product showcase",
      "Established company's digital brand presence",
    ],
    metrics: [
      { value: "+200%", label: "Website Traffic" },
      { value: "+150%", label: "Lead Generation" },
      { value: "1.2s", label: "Page Load Time" },
    ],
    technologies: ["React", "JavaScript", "CSS3", "HTML5", "Responsive Design"],
    website: "https://www.iboxsm.com/",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvgxPRL6F4tC3jQeI5Zw_PbfgZLnl6jjvQ4w&s",
  },
];

export const freelanceProjects = [
  {
    id: "drHugo",
    name: "Dr. Hugo Diazgranados",
    description: "Cosmetic Dentist Website",
    details: "Personal website for aesthetic dentist specializing in high-end dentistry",
    year: "2023",
    tech: ["WordPress", "Custom PHP", "CSS"],
    website: "https://drhugodiazgranados.com/",
  },
  {
    id: "sebastian",
    name: "Sebastian Correa",
    description: "Developer Portfolio",
    details: "Personal portfolio for Senior Software Developer",
    year: "2024",
    tech: ["Astro.js", "TypeScript", "Tailwind CSS"],
    website: "https://www.scorrea.dev/",
  },
  {
    id: "pagui",
    name: "Pagui.co",
    description: "OCR Registration Platform",
    details: "Registration software with OCR recognition for Bancolombia Bank clients",
    year: "2025",
    tech: ["Django", "Next.js", "OCR API", "PostgreSQL"],
    website: "https://pagui-kyc.vercel.app/",
  },
  {
    id: "wordle",
    name: "Wordle Clone",
    description: "Word Game",
    details: "Wordle clone built with Vanilla JS",
    year: "2023",
    tech: ["Vanilla JS", "HTML", "CSS"],
    website: "https://wordle-max.vercel.app/",
  },
];

export const stats = [
  { value: "50+", label: "Components Built" },
  { value: "95+", label: "Lighthouse Score" },
  { value: "4+", label: "Years Experience" },
  { value: "15+", label: "Projects Delivered" },
];

export const contact = {
  title: "Let's Work Together",
  subtitle: "Ready to bring your ideas to life with cutting-edge technology and exceptional user experiences? Let's build something amazing together.",
  description: "I'd love to hear about your project. Fill out the form below and I'll get back to you within 24 hours.",
  availability: {
    status: "Available for work",
    description: "Currently accepting new projects for Q1 2026. Typical response time: 2-6 hours.",
  },
  quickHire: {
    title: "Ready to start?",
    description: "Available for freelance projects and full-time opportunities. Let's discuss your next big idea.",
    button: "Quick Email",
  },
};

export const footer = {
  services: [
    "Frontend Development",
    "React Applications", 
    "Next.js Projects",
    "E-commerce Solutions",
    "UI/UX Implementation",
    "Performance Optimization",
    "Responsive Design",
    "API Integration",
  ],
};

export const nav = {
  home: "Home",
  experience: "Experience",
  skills: "Skills",
  contact: "Contact",
};
