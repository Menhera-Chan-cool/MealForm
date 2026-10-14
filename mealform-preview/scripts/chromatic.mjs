if (!process.env.CHROMATIC_PROJECT_TOKEN?.trim()) {
  console.error('Chưa upload. Hãy đặt CHROMATIC_PROJECT_TOKEN trong môi trường riêng rồi chạy lại; không dán khóa vào chat hoặc commit.');
  process.exit(1);
}
// Cloud upload is opt-in; baseline changes require human review.
const { run } = await import('chromatic/node');
const result = await run({ options: { configFile: 'chromatic.config.json' } });
process.exitCode = result.exitCode;
