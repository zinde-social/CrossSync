import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import AutoImport from 'unplugin-auto-import/vite';
// import Components from 'unplugin-vue-components/vite';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

import ChildProcess from 'child_process';

// const production = process.env.NODE_ENV === 'production';

const appVersion = process.env.npm_package_version;
const commitHash = ChildProcess.execSync('git rev-parse --short HEAD').toString();

console.log(`Building CrossSync version: v${appVersion} #${commitHash}`);

export default defineConfig({
    build: {
        rollupOptions: {
            plugins: [nodePolyfills()],
        },
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        target: 'esnext',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            process: 'process/browser',
            stream: 'stream-browserify',
            zlib: 'browserify-zlib',
            util: 'util',
        },
    },
    plugins: [
        vue(),
        viteCommonjs(),

        // Disabled for crx compatibility issues
        //
        // AutoImport({
        //     resolvers: [ElementPlusResolver()],
        // }),
        // Components({
        //     resolvers: [ElementPlusResolver()],
        // }),
        // !production &&
        //     nodePolyfills({
        //         include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
        //     }),
        crx({
            manifest,
            contentScripts: {
                preambleCode: false,
            },
        }),
    ],
    define: {
        __APP_VERSION__: JSON.stringify(appVersion),
        __COMMIT_HASH__: JSON.stringify(commitHash),
    },
});
