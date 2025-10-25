# Online Wholesale Admin

A modern, responsive admin dashboard built with React, TypeScript, and Tailwind CSS for managing an online wholesale business.

## Features

- **Product Management**: Add, edit, and manage products with featured product functionality
- **Order Management**: Track and manage customer orders
- **Customer Management**: Manage customer information and profiles
- **Transaction Tracking**: Monitor financial transactions and reports
- **Category & Brand Management**: Organize products by categories and brands
- **Quote Requests**: Handle customer quote requests
- **Promo Codes**: Create and manage promotional codes
- **Location Management**: Manage states, zipcodes, and countries
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: Toggle between themes
- **Real-time Updates**: Live data updates and notifications

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PrimeReact
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Charts**: ApexCharts
- **Icons**: Lucide React
- **Drag & Drop**: React Beautiful DnD, DnD Kit
- **Calendar**: FullCalendar
- **Forms**: Custom form components with validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd onlinewholesale_admin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with optimizations
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run clean` - Clean build directory

## Production Deployment

### Build for Production

```bash
npm run build:prod
```

This will create an optimized production build in the `dist` directory with:
- Minified JavaScript and CSS
- Removed console logs and debug code
- Code splitting for better performance
- Optimized assets

### Environment Configuration

The application uses environment variables for configuration. Update the API endpoints in `vite.config.ts` for your production environment.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, GitHub Pages):
   - Build the project: `npm run build:prod`
   - Deploy the `dist` directory

2. **Web Server** (Apache, Nginx):
   - Build the project: `npm run build:prod`
   - Serve the `dist` directory as static files

3. **Docker**:
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build:prod

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components
│   ├── ecommerce/      # E-commerce specific components
│   ├── form/           # Form components
│   ├── products/       # Product management components
│   └── ui/             # UI component library
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── layout/             # Layout components
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The application is configured to work with a backend API. Update the proxy configuration in `vite.config.ts` to point to your production API endpoint.

### Mock Data Fallback

The application includes mock data fallbacks for development and when the backend is unavailable. This ensures the frontend remains functional during development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.
