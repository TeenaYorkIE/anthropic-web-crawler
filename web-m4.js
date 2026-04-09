const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const COURSE_URL = "https://anthropic.skilljar.com/claude-code-in-action/";
const OUTPUT_DIR = path.join(__dirname, "videos-m4");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function getJWPlayerM3U8(mediaId) {
  try {
    const url = `https://cdn.jwplayer.com/v2/media/${mediaId}`;
    const { data } = await axios.get(url);

    const sources = data.playlist?.[0]?.sources || [];
    const hls = sources.find((s) => s.file.includes(".m3u8"));

    return hls?.file || null;
  } catch (err) {
    console.error("❌ JW API failed");
    return null;
  }
}

(async () => {
  await fs.ensureDir(OUTPUT_DIR);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  console.log("👉 Open course & login...");
  await page.goto(COURSE_URL, { waitUntil: "networkidle2" });

  await delay(60000); // login manually

  // -----------------------------
  // ✅ STEP 1: Extract lesson links
  // -----------------------------
  let lessonLinks = await page.$$eval("a", (links) =>
    links
      .map((a) => a.href)
      .filter((href) => /\/claude-code-in-action\/\d+$/.test(href))
  );

  lessonLinks = [...new Set(lessonLinks)];

  console.log("✅ Lessons found:", lessonLinks.length);

  // -----------------------------
  // ✅ STEP 2: Loop lessons
  // -----------------------------
  for (let i = 0; i < lessonLinks.length; i++) {
    const lessonUrl = lessonLinks[i];

    console.log(`\n📺 Lesson ${i + 1}`);
    console.log(lessonUrl);

    try {
      await page.goto(lessonUrl, { waitUntil: "networkidle2" });
      await delay(5000);

      // -----------------------------
      // ✅ Extract mediaId
      // -----------------------------
      const mediaId = await page.evaluate(() => {
        try {
          if (window.jwplayer) {
            const player = window.jwplayer();
            const item = player.getPlaylistItem();
            return item?.mediaid || null;
          }
        } catch { }
        return null;
      });

      if (!mediaId) {
        console.log("❌ No mediaId found");
        continue;
      }

      console.log("🎯 Media ID:", mediaId);

      // -----------------------------
      // ✅ Get m3u8
      // -----------------------------
      const m3u8Url = await getJWPlayerM3U8(mediaId);

      if (!m3u8Url) {
        console.log("❌ No m3u8 found");
        continue;
      }

      console.log("🎯 m3u8:", m3u8Url);

      const outputFile = path.join(
        OUTPUT_DIR,
        `video_${String(i + 1).padStart(2, "0")}.mp4`
      );

      // -----------------------------
      // ✅ Download + Convert using yt-dlp
      // -----------------------------
      console.log("⬇️ Downloading & converting to MP4...");

      execSync(
        `yt-dlp -o "${outputFile}" "${m3u8Url}"`,
        { stdio: "inherit" }
      );

      console.log("✅ Saved:", outputFile);

    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  }

  console.log("\n🎉 All videos downloaded as MP4!");
  await browser.close();
})();