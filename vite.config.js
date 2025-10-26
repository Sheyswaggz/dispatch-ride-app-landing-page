import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import viteImagemin from 'vite-plugin-imagemin';

// ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ _command, mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  return {
    // Base public path
    base: './',

    // Define global constants
    define: {
      __DEV__: JSON.stringify(isDevelopment),
      __PROD__: JSON.stringify(isProduction),
    },

    // Server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
      cors: true,
      strictPort: false,
      hmr: {
        overlay: true,
      },
    },

    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
      host: true,
      cors: true,
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      target: 'es2015',
      cssCodeSplit: true,
      
      // Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
        format: {
          comments: false,
        },
      } : undefined,

      // Rollup options
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Asset file naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const extType = info[info.length - 1];
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          
          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          
          // Manual chunks for better caching
          manualChunks: undefined,
        },
      },

      // Asset handling
      assetsInlineLimit: 4096, // 4kb
      
      // CSS options
      cssMinify: isProduction,
      
      // Report compressed size
      reportCompressedSize: isProduction,
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        // Add any CSS preprocessor options here if needed
      },
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@styles': resolve(__dirname, './src/styles'),
        '@scripts': resolve(__dirname, './src/scripts'),
        '@assets': resolve(__dirname, './src/assets'),
      },
      extensions: ['.js', '.json', '.css'],
    },

    // Optimization
    optimizeDeps: {
      include: [],
      exclude: [],
    },

    // Plugin configuration
    plugins: [
      isProduction && viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 90,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
              active: false,
            },
            {
              name: 'removeEmptyAttrs',
              active: true,
            },
          ],
        },
        webp: {
          quality: 80,
        },
      }),
    ].filter(Boolean),

    // Environment variables prefix
    envPrefix: 'VITE_',

    // Log level
    logLevel: isDevelopment ? 'info' : 'warn',

    // Clear screen
    clearScreen: true,
  };
});