import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

async function main() {
  const openaiBaseUrl = process.env.OPENAI_BASE_URL?.replace(/\/$/, "");
  const openaiBaseUrlV1 =
    openaiBaseUrl && !openaiBaseUrl.endsWith("/v1")
      ? `${openaiBaseUrl}/v1`
      : openaiBaseUrl;

  const stagehand = new Stagehand({
    env: "LOCAL",
    model: {
      modelName: "google/gemini-3-flash-preview",
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: openaiBaseUrlV1,
    },
    localBrowserLaunchOptions: {
      cdpUrl: "ws://localhost:9222/devtools/browser/3eebd7be-3b33-41c2-8097-35123488e433", 
      headless: false,                          // 保持可見，方便你觀察
      devtools: true,                           // 自動開 DevTools 方便 debug（可選）
      // 可選：如果想額外傳 Chrome args（通常不需要）
      // args: ["--disable-extensions-except=你的擴充ID"],
    },
    experimental: true,  // 如果你要用 hybrid mode 或其他實驗功能，建議加上
    keepAlive: true,
  });

  await stagehand.init();

  console.log(`Stagehand Session Started`);
  console.log(
    `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionId}`
  );

  const page = stagehand.context.pages()[0];

  await page.goto("https://stagehand.dev");

  const extractResult = await stagehand.extract(
    "Extract the value proposition from the page."
  );
  console.log(`Extract result:\n`, extractResult);

  const actResult = await stagehand.act("Click the 'Evals' button.");
  console.log(`Act result:\n`, actResult);

  const observeResult = await stagehand.observe("What can I click on this page?");
  console.log(`Observe result:\n`, observeResult);

  const agent = stagehand.agent({
    mode: "hybrid",
    systemPrompt: "You're a helpful assistant that can control a web browser.",
  });

  const agentResult = await agent.execute(
    "What is the most accurate model to use in Stagehand?"
  );
  console.log(`Agent result:\n`, agentResult);

  await stagehand.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
