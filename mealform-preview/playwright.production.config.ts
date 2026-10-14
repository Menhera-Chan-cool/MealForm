import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/ui',testMatch:'production-ui.spec.ts',workers:1,use:{channel:'chrome',headless:true},webServer:{command:'npm exec -- vite ../meal-viewer --host 127.0.0.1 --port 5175 --strictPort',url:'http://127.0.0.1:5175',reuseExistingServer:!process.env.CI},reporter:'list'});
