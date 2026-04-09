# 🎥 Skilljar Video Downloader (JW Player आधारित)

This project automatically:

✅ Extracts all lessons from course  
✅ Fetches JW Player media  
✅ Downloads:
   - `.m3u8` files (web.js)
   - `.mp4` videos (web-m4.js)

---

# 🚀 Prerequisites

Make sure you have installed:

## 1. Node.js
  Download: https://nodejs.org  
  Check:
  ```bash
  node -v
  npm -v
  ```

2. Install dependencies
  npm install

3. Install yt-dlp (Required for MP4)
  Mac:
  brew install yt-dlp

  OR (Python):
  pip install -U yt-dlp

4. Install ffmpeg (Important)
  Mac:
  brew install ffmpeg

📁 Project Structure
  project/
  │
  ├── web.js          → Download .m3u8 files
  ├── web-m4.js       → Download .mp4 videos
  ├── package.json
  ├── videos/
  ├── videos-m4/

🔐 Login Required

  This script requires manual login:

  👉 Browser will open
  👉 Login within 60 seconds

▶️ Run Scripts

✅ 1. Download .m3u8 files (Note:- create video folder inside of this project before run this file)
  node web.js

  Output:

    vidoes/video_01.m3u8

✅ 2. Download MP4 videos (Note:- create video-m4 folder inside of this project before run this file)
  node web-m4.js

  Output:
    videos-m4/video_01.mp4


⚠️ Important Notes
  1. MP4 not opening in Music app?

  👉 Use:
    QuickTime Player
    VLC Player

  2. If video has no audio

  Update command inside web-m4.js:
    yt-dlp -f "bv*+ba/b" --merge-output-format mp4