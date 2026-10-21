import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/ui',testMatch:'reading-layouts-review.spec.ts',workers:1,use:{channel:'chrome',headless:true},reporter:'list'});
