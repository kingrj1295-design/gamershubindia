# Setup guide (Phase 1)

## A. Install tools (one time)
1. Node.js: download the "LTS" version from nodejs.org and install it (Next, Next, Finish).
2. Git: download from git-scm.com and install with default options.
3. Code editor: VS Code from code.visualstudio.com.
4. Restart your computer.

## B. Run the website on your computer
1. Unzip the project. Open the folder in VS Code (File > Open Folder).
2. Open the terminal inside VS Code (menu: Terminal > New Terminal).
3. Type `npm install` and press Enter. This downloads the tools the project needs (takes 1-3 minutes). Warnings in yellow are normal. Red "ERR!" lines are not.
4. Type `npm run dev` and press Enter. It prints a link like http://localhost:5173
5. Open that link in your browser. Stop the site with Ctrl + C in the terminal.
6. Tell me anything that looks wrong or any red error text. Copy-paste it to me.

## C. Edit your text
Open `src/data/site.js`. Change About Us text, Discord link, contact email and product details there. Save the file; the browser updates itself.

## D. Upload to GitHub (after you approve Phase 1)
1. Create a free account on github.com. Click New repository, name it `gamershubindia`, keep it Public, click Create.
2. In the VS Code terminal, run these one at a time:
   - `git init` : starts tracking your project
   - `git add .` : selects all files (the `.gitignore` file keeps secret files out)
   - `git commit -m "Phase 1"` : saves a snapshot
   - `git branch -M main` : names the main branch
   - `git remote add origin https://github.com/YOUR-USERNAME/gamershubindia.git` : connects to GitHub (use the link GitHub shows you)
   - `git push -u origin main` : uploads the code

## E. Deploy on Cloudflare Pages
1. Sign up at dash.cloudflare.com. Go to Workers & Pages > Create > Pages > Connect to Git.
2. Pick your `gamershubindia` repo.
3. Framework preset: Vite (or React). Build command: `npm run build`. Output directory: `dist`.
4. Click Save and Deploy. Your site opens at `something.pages.dev`.
