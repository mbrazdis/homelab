# Pre-Release Checklist for Public GitHub

## 🔒 Security & Privacy Review

### ⚠️ CRITICAL - Must Fix Before Publishing

1. **Weather API Key Exposed**
   - File: `frontend/src/app/api/fetchWeather/route.ts`
   - Line 3: `const API_KEY = "TNLMzqzTYsJLYtABJOeA1TuJCPBeKR5X"`
   - **ACTION**: Move to environment variable `NEXT_PUBLIC_WEATHER_API_KEY`

2. **Hardcoded IP Addresses**
   - `frontend/src/app/page.tsx`: `ws://192.168.100.205:8000/ws`
   - `frontend/src/components/customComponents/lightCard.tsx`: `ws://192.168.0.67:8000/ws`
   - `iOS_homelab/iOS_homelab/ViewModels/WebSocketManager.swift`: `ws://192.168.0.67:8000/ws`
   - **ACTION**: Replace with `NEXT_PUBLIC_WS_URL` environment variable

### ✅ Files to Remove/Ignore

- [x] `cert.pem` and `key.pem` - Added to .gitignore
- [x] `*.db` files - Added to .gitignore
- [x] `.env` files - Added to .gitignore
- [x] `*.zip` files - Added to .gitignore
- [ ] Check for any `.DS_Store` files

### 📝 Recommended Actions

1. **Create example configuration files** ✅
   - [x] `core/.env.example`
   - [x] `frontend/.env.example`

2. **Update hardcoded WebSocket URLs**
   ```typescript
   // Replace in all files:
   const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
   useWebSocket(wsUrl);
   ```

3. **Move Weather API Key to env**
   ```typescript
   // frontend/src/app/api/fetchWeather/route.ts
   const API_KEY = process.env.WEATHER_API_KEY;
   if (!API_KEY) {
     return NextResponse.json({ error: "API key not configured" }, { status: 500 });
   }
   ```

4. **Add requirements.txt** for Python dependencies
   ```bash
   cd core
   pip freeze > requirements.txt
   ```

5. **Add package-lock.json** (if not present)
   ```bash
   cd frontend
   npm install
   ```

## 📋 Documentation Review

- [x] README.md created with installation instructions
- [x] LICENSE file added (MIT)
- [x] .gitignore configured
- [x] CONTRIBUTING.md created
- [x] .github/copilot-instructions.md updated
- [ ] Add screenshots to README
- [ ] Update README with your actual GitHub username
- [ ] Add your contact information to README

## 🧪 Testing Before Release

- [ ] Test fresh installation on clean machine
- [ ] Verify all dependencies install correctly
- [ ] Test MQTT broker connection
- [ ] Test WebSocket connection
- [ ] Verify frontend connects to backend
- [ ] Test device discovery and control
- [ ] Check mobile app connectivity

## 🚀 GitHub Repository Setup

1. **Create new repository** on GitHub
2. **Add repository description**: "Modern smart home control platform inspired by Home Assistant"
3. **Add topics**: `smart-home`, `home-automation`, `iot`, `mqtt`, `nextjs`, `fastapi`, `python`, `react`
4. **Enable Issues and Discussions**
5. **Set up branch protection** (optional)

## 📦 First Release

```bash
# After fixing issues above:
git add .
git commit -m "Initial public release"
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"
git push origin main
git push origin v1.0.0
```

## 🎯 Post-Release Tasks

- [ ] Share on Reddit (r/homeassistant, r/homeautomation, r/selfhosted)
- [ ] Share on Twitter/X
- [ ] Share on Home Assistant Community Forum
- [ ] Create demo video or GIF for README
- [ ] Set up GitHub Pages for documentation (optional)

---

**Last Updated**: December 11, 2025
