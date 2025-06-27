# TūlBOX

A modern web-based toolkit for PDF file management and IMDB production search, built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### PDF Manager
- **Upload PDF files** via drag-and-drop or file picker
- **Batch rename** files using flexible search & replace rules (supports regex)
- **Detect and highlight** duplicate or invalid file names
- **Download** all valid, renamed PDF files in one click

### IMDB Search
- **Search** for movies, TV shows, and games (mock IMDB API)
- **View detailed production info**: cast, crew, plot, rating, production companies
- **See international (AKA) titles** with transliteration

### CWR Convertor
- **Upload CWR .v21/.v22 files** via drag-and-drop or file picker
- **Enhanced raw file viewer** makes it easier to read through a raw CWR file
- **Convert** the content to predefined templates
- **Export** to Excel, CSV, or JSON


## Tech Stack
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast development
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [transliteration](https://www.npmjs.com/package/transliteration) for language support

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Lint code with ESLint

## Project Structure
```
/ (root)
├── src/
│   ├── components/      # UI components (DragDropZone, FileTable, etc)
│   ├── pages/           # Main app pages (PDFManager, IMDBSearch)
│   ├── utils/           # Helper functions (fileHelpers, imdbApi, etc)
│   ├── types/           # TypeScript types
│   └── App.tsx          # App entry
├── index.html           # HTML entry
├── tailwind.config.js   # Tailwind config
├── vite.config.ts       # Vite config
└── ...
```

## License
MIT
