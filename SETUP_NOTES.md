# Personal Training App Setup Notes

## What we did
- Added a dynamic exercises API in `backend/src/index.js`
- Added exercise cues and examples in `app/App.tsx`
- Wired the client to fetch exercises from `/api/exercises`
- Updated the backend `POST /api/report-card` to return exercise-specific data

## Commands to run

### Backend
```bash
cd /Users/johnlovett/personal-training-app/backend
npm install
npm run dev
```

### App
```bash
cd /Users/johnlovett/personal-training-app/app
npm install
npm run dev
```

## Install Node.js on macOS
### Recommended: Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Then add Homebrew to your shell environment:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```
Then install Node:
```bash
brew install node
```

### Verify
```bash
node -v
npm -v
```

## Important notes
- The macOS password prompt hides input while typing. Type your password and press Enter.
- If you are using someone elses laptop, avoid changing admin account settings without permission.
- I cannot save or transfer admin credentials or account names.
