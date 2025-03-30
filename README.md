# UniHub - Redefining Learning Experience 

UniHub is a **Gen AI-Powered Academic Productivity Platform** utilizing the **Retrieval-Augmented Generation (RAG)** model to help students learn more **effectively** and **efficiently** based on the context of the content.

![UniHub Banner](docs/images/signin_banner.png)
<p align="center">
  🔗 <a href="https://www.unihub.com" style="font-size: 18px"><b>www.unihub.com</b></a>
</p>

## 🚀 Features
- **AI-powered learning assistant** that provides contextual answers.
- **Smart retrieval of academic resources** to enhance learning.
- **Collaboration tools** to improve student engagement.

## 📌 Installation & Setup

1. **Clone the repository:**
```
git clone https://github.com/chisa-dev/UniHub.git
cd UniHub
```

2. **Install dependencies** (if applicable):
   - If using Node.js:
   ```
   npm install
   ```


3. **Run the project**:
   - If using Node.js:
   ```
   npm run dev
   ```


## 🔄 Git Workflow

### **Push changes to origin**
```
git add .
git commit -m "Your commit message"
git push origin main
```

### **Sync updates from origin to client repository**
Run the script to force-sync from origin to the client repository:
```
chmod +x sync.sh
./sync.sh
```

## 🛠️ Automation Script (`sync.sh`)
This script ensures that **origin is the source of truth** and force-pushes updates to the client repository.

```
#!/bin/bash

echo "Fetching latest changes..."
git fetch origin
git fetch client

echo "Resetting client branch to match origin (force overwrite)..."
git reset --hard origin/main  # Ensures local branch exactly matches origin

echo "Force pushing to client repo..."
git push --force client main  # Overwrites the client repo

echo "Sync completed! The client repository is now up-to-date with origin."
```

## 👥 Team Members
- [Gemechis Elias](https://github.com/chisa-dev)
- [Fikiresilase](https://github.com/Fikiresilase)

## 📜 License
This project is licensed under the **GPL-3.0 License**.

---
