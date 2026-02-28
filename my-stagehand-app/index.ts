import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";

async function getCdpUrl(): Promise<string> {
  const res = await fetch("http://127.0.0.1:9222/json/version");
  if (!res.ok) {
    throw new Error(
      `无法连接到本地调试端口 9222（HTTP ${res.status}）。请先用 remote-debugging-port 启动 Chrome。`
    );
  }
  const data = (await res.json()) as { webSocketDebuggerUrl?: string };
  if (!data.webSocketDebuggerUrl) {
    throw new Error("调试端口响应中缺少 webSocketDebuggerUrl。");
  }
  return data.webSocketDebuggerUrl;
}

async function main() {
  const openaiBaseUrl = process.env.OPENAI_BASE_URL?.replace(/\/$/, "");
  const openaiBaseUrlV1 =
    openaiBaseUrl && !openaiBaseUrl.endsWith("/v1")
      ? `${openaiBaseUrl}/v1`
      : openaiBaseUrl;

  const cdpUrl = await getCdpUrl();
  console.log(`Using existing Chrome via CDP: ${cdpUrl}`);

  const stagehand = new Stagehand({
    env: "LOCAL",
    model: {
      modelName: "google/gemini-3-flash-preview",
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: openaiBaseUrlV1,
    },
    localBrowserLaunchOptions: {
      cdpUrl,
      headless: false,                          // 保持可見，方便你觀察
      devtools: true,                           // 自動開 DevTools 方便 debug（可選）
      // 可選：如果想額外傳 Chrome args（通常不需要）
      // args: ["--disable-extensions-except=你的擴充ID"],
    },
    experimental: true,  // 如果你要用 hybrid mode 或其他實驗功能，建議加上
    keepAlive: true,
  });

  await stagehand.init();
  console.log("Stagehand 已連接到你的本機 Chrome！");

  // 之後正常使用 agent、observe、act 等


  const startUrl = "https://demo.gwms.jmalltech.com/admin/warehouse/warehouse";

  console.log(`Stagehand Session Started`);
  console.log(`Target: ${startUrl}`);

  const page = stagehand.context.pages()[0];

  await page.goto(startUrl, { waitUntil: "domcontentloaded" });

  await page.waitForTimeout(10000);

  const observeInstruction =
    "List all visible clickable buttons, links, or toolbar actions on this page. " +
    "Return actions I can click, and include the visible label text in each action. " +
    "Avoid destructive or irreversible actions like delete/remove/clear/submit/save/confirm/approve/reject.";

  const observed = await stagehand.observe(observeInstruction);
  const actions = Array.isArray(observed) ? observed : [];

  if (actions.length === 0) {
    console.log("No actions found to test.");
    await stagehand.close();
    return;
  }

  const actionToText = (action: unknown): string => {
    if (typeof action === "string") return action;
    if (action && typeof action === "object") {
      const a = action as Record<string, unknown>;
      if (typeof a.instruction === "string") return a.instruction;
      if (typeof a.description === "string") return a.description;
      if (typeof a.selector === "string") return a.selector;
    }
    try {
      return JSON.stringify(action);
    } catch {
      return String(action);
    }
  };

  console.log(`Found ${actions.length} actions.`);
  const actionsToTest = actions.map((action, index) => ({
    action,
    index,
  }));

  const results: Array<{
    index: number;
    actionText: string;
    status: "ok" | "error";
    beforeUrl: string;
    afterUrl: string;
    change?: string;
    error?: string;
  }> = [];

  for (let i = 0; i < actionsToTest.length; i += 1) {
    const { action } = actionsToTest[i];
    const actionText = actionToText(action);
    console.log(`\n[${i + 1}/${actionsToTest.length}] Testing action: ${actionText}`);

    const beforeUrl = page.url();

    try {
      const actResult = await stagehand.act(action);
      console.log("Act result:", actResult);

      await page.waitForTimeout(1000);

      const changeResult = await stagehand.extract(
        "Briefly describe what changed after the last action. " +
          "Mention any dialog opened, new page/section, or notable UI change."
      );
      const changeText =
        typeof changeResult === "string"
          ? changeResult
          : (changeResult as { extraction?: string })?.extraction ??
            JSON.stringify(changeResult);
      console.log("Observed change:", changeText);

      const afterUrl = page.url();
      results.push({
        index: i,
        actionText,
        status: "ok",
        beforeUrl,
        afterUrl,
        change: changeText,
      });
    } catch (err) {
      const afterUrl = page.url();
      console.error("Action failed:", err);
      results.push({
        index: i,
        actionText,
        status: "error",
        beforeUrl,
        afterUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    const afterUrl = page.url();
    if (afterUrl !== beforeUrl) {
      await page.goto(startUrl, { waitUntil: "domcontentloaded" });
    }
  }

  const okCount = results.filter((r) => r.status === "ok").length;
  const errCount = results.length - okCount;
  const markdownLines: string[] = [];
  markdownLines.push("# AI 操作报告");
  markdownLines.push("");
  markdownLines.push(`- 目标页面: ${startUrl}`);
  markdownLines.push(`- 总操作数: ${results.length}`);
  markdownLines.push(`- 成功: ${okCount}`);
  markdownLines.push(`- 失败: ${errCount}`);
  markdownLines.push("");
  markdownLines.push("## 详细结果");
  markdownLines.push("");
  results.forEach((r, idx) => {
    markdownLines.push(`### ${idx + 1}. ${r.actionText}`);
    markdownLines.push("");
    markdownLines.push(`- 状态: ${r.status}`);
    markdownLines.push(`- 操作前 URL: ${r.beforeUrl}`);
    markdownLines.push(`- 操作后 URL: ${r.afterUrl}`);
    if (r.change) {
      markdownLines.push(`- 页面变化: ${r.change}`);
    }
    if (r.error) {
      markdownLines.push(`- 错误: ${r.error}`);
    }
    markdownLines.push("");
  });

  console.log("\n" + markdownLines.join("\n"));

  await stagehand.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
