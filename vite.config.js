import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * Vite Configuration for Dispatch Ride Landing Page
 * 
 * Production-ready configuration with:
 * - Development server with hot module replacement
 * - Optimized production builds with code splitting
 * - Asset optimization and minification
 * - CSS code splitting for better performance
 * - Source maps for debugging
 */
export default defineConfig(({ command, mode }) => {
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'

  return {
    // Root directory for source files
    root: '.',

    // Public base path when served in development or production
    base: '/',

    // Development server configuration
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: false,
      cors: true,
      // Hot Module Replacement
      hmr: {
        overlay: true,
      },
    },

    // Preview server configuration (for production build preview)
    preview: {
      port: 4173,
      strictPort: false,
      host: true,
      open: false,
      cors: true,
    },

    // Build configuration
    build: {
      // Output directory for production build
      outDir: 'dist',
      
      // Directory for static assets relative to outDir
      assetsDir: 'assets',
      
      // Inline assets smaller than this limit (in bytes)
      assetsInlineLimit: 4096,
      
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Generate source maps for production debugging
      sourcemap: isProduction ? true : false,
      
      // Target browsers for build output
      target: 'es2020',
      
      // Minification configuration
      minify: isProduction ? 'terser' : false,
      
      terserOptions: isProduction ? {
        compress: {
          drop_console: false,
          drop_debugger: true,
          pure_funcs: ['console.log'],
        },
        format: {
          comments: false,
        },
      } : undefined,
      
      // Rollup-specific options
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Asset naming patterns
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            
            // Organize assets by type
            if (/\.(png|jpe?g|svg|gif|webp|avif)$/i.test(assetInfo.name)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            
            if (/\.css$/i.test(assetInfo.name)) {
              return 'assets/css/[name]-[hash][extname]'
            }
            
            return 'assets/[name]-[hash][extname]'
          },
          
          // Manual chunk splitting for better caching
          manualChunks: undefined,
        },
      },
      
      // Chunk size warning limit (in kB)
      chunkSizeWarningLimit: 500,
      
      // Report compressed size
      reportCompressedSize: true,
      
      // Write build output to disk
      write: true,
      
      // Empty outDir on build
      emptyOutDir: true,
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {},
    },

    // Dependency optimization
    optimizeDeps: {
      include: [],
      exclude: [],
    },

    // Define global constants
    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(isProduction),
    },

    // Plugin configuration
    plugins: [],

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@assets': resolve(__dirname, './src/assets'),
        '@styles': resolve(__dirname, './src/styles'),
        '@scripts': resolve(__dirname, './src/scripts'),
      },
      extensions: ['.js', '.json', '.css'],
    },

    // Logging configuration
    logLevel: 'info',

    // Clear screen on rebuild
    clearScreen: true,
  }
})