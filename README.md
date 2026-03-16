# MaxFolio - Creative Portfolio

A highly creative and professional personal portfolio showcasing two distinct design experiences: **Luxury Minimal** and **Brutalist Editorial**. Built with modern web technologies and optimized for performance, accessibility, and SEO.

## Live Demo

🌐 [maxfolio.co](https://maxfolio.co)

## Features

### Dual Design Experience
- **Luxury Minimal** (`/`) - Elegant, refined aesthetics with sophisticated typography and golden accents
- **Brutalist Editorial** (`/brutalist`) - Bold, raw design with editorial typography and high-contrast elements
- **Design Selector** (`/menu`) - Interactive menu to switch between experiences

### Technical Highlights
- ⚡ **Fast** - Built with Vite for lightning-fast development and optimized production builds
- 🎨 **Beautiful Animations** - Smooth page transitions and micro-interactions with Framer Motion
- 🌙 **Dark/Light Mode** - Theme toggle with system preference detection and persistence
- 📱 **Fully Responsive** - Mobile-first design with custom mobile menus (bottom sheets)
- ♿ **Accessible** - WCAG compliant with proper ARIA labels, focus management, and screen reader support
- 🔍 **SEO Optimized** - Structured data, meta tags, Open Graph, and Twitter Cards
- 📧 **Contact Form** - Web3Forms integration for backendless email sending

### Design Features
- Custom logos for each design theme
- Dynamic favicon that changes per page
- Smooth page transition animations
- Interactive design selector in navigation
- Full-screen mobile menus matching each theme's aesthetic

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom configuration
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Package Manager**: Bun
- **Form Handling**: Web3Forms API

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Logo, ThemeToggle, etc.)
│   ├── modals/          # Modal components (ContactForm)
│   ├── previews/        # Design preview components
│   ├── sections/        # Page sections (ExploreDesigns)
│   └── transitions/     # Page transition system
├── config/              # App configuration
├── context/             # React contexts (Theme)
├── data/                # Portfolio content data
├── hooks/               # Custom hooks (useDynamicFavicon)
├── pages/               # Page components
└── styles/              # Global styles
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

```bash
# Clone the repository
git clone https://github.com/maxbustamanteg/maxfolio.git
cd maxfolio

# Install dependencies
bun install

# Start development server
bun dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_WEB3FORMS_KEY=your-web3forms-access-key
```

Get your free access key at [web3forms.com](https://web3forms.com/)

### Build for Production

```bash
# Build
bun run build

# Preview production build
bun run preview
```

## Customization

### Updating Content

All portfolio content is centralized in `src/data/portfolio-extended.ts`:
- Personal information
- Work experience
- Skills
- Freelance projects
- Contact details

### Theme Colors

Custom theme colors are configured in `tailwind.config.js`:
- `luxury-*` - Luxury Minimal theme colors
- `deco-*` - Art Deco dark mode colors
- `stone-*` - Brutalist theme colors

## Accessibility

This portfolio follows WCAG 2.1 guidelines:
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels and roles
- Keyboard navigation support
- Focus visible indicators
- Reduced motion support
- Screen reader friendly

## SEO

Optimized for search engines with:
- Structured data (JSON-LD)
- Open Graph meta tags
- Twitter Card meta tags
- Sitemap.xml
- Robots.txt
- Canonical URLs
- Dynamic page titles

## Performance

- Lazy loading for images
- Font display swap
- Preconnect to external resources
- Optimized bundle size
- Efficient animations

## License

MIT License - feel free to use this as inspiration for your own portfolio!

## Author

**Maximiliano Bustamante**
- LinkedIn: [maxbustamanteg](https://linkedin.com/in/maxbustamanteg)
- GitHub: [maxbustamanteg](https://github.com/maxbustamanteg)
- Email: maxbustamanteg@gmail.com

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
