// 1. CONFIGURE YOUR TARGET DETAILS
const GITHUB_USERNAME = "cloverrrrrrr"; // <-- Replace with your GitHub username
const REPO_NAME = "cloverrrrrrr.github.io"; // <-- Replace with your repository name

// Core Virtual Filesystem Structure
let filesystem = {
    type: 'dir',
    name: 'root',
    children: {
        'about.txt': { type: 'file', isExternal: false, content: "PROFILE:\nName: Firhan\nFocus: AppSec, Pentesting & Vulnerability Research, Red Teaming." },
        'skills.txt': { type: 'file', isExternal: false, content: "CAPABILITIES:\n- Code   : Python, C, Bash\n- Tools : Burp Suite, Nmap, Metasploit" }
    }
};

let currentDir = filesystem;
const input = document.getElementById('terminal-input');
const body = document.getElementById('terminal-body');
const container = document.getElementById('input-container');

document.addEventListener('click', () => input.focus());

// Navbar utility highlighter
function navigateTab(element) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Global text rendering router inside the console frame
function printRow(text, isPrompt = false, allowHTML = false) {
    const row = document.createElement('div');
    row.className = "output-row";
    
    if (isPrompt) {
        row.innerHTML = `<span class="prompt">firhan@portfolio:/#</span> ${text}`;
    } else if (allowHTML) {
        row.innerHTML = text;
    } else {
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        row.innerHTML = escaped.replace(/\n/g, '<br>');
    }
    
    body.insertBefore(row, container);
    body.scrollTop = body.scrollHeight;
}

async function initializeAutomatedWriteups() {
    // Clean string using standard backticks and correct GitHub endpoints
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/writeups`;
    
    const gridContainer = document.querySelector('.grid-container');
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Could not access /writeups directory via API.");
        
        const files = await response.json();
        
        if (gridContainer) gridContainer.innerHTML = '';

        files.forEach(file => {
            if (file.name.endsWith('.md')) {
                filesystem.children[file.name] = {
                    type: 'file',
                    isExternal: true,
                    path: file.name
                };

                const card = document.createElement('div');
                card.className = 'grid-card';
                card.setAttribute('onclick', `loadWriteup('${file.name}')`);
                
                const icon = file.name.includes('overflow') ? '🖳' : '&lt;/&gt;';
                
                card.innerHTML = `
                    <div class="card-icon">${icon}</div>
                    <h4 class="card-title">./${file.name}</h4>
                    <p class="card-subtitle">Execute via command line: cat ${file.name}</p>
                `;
                
                if (gridContainer) {
                    gridContainer.appendChild(card);
                }
            }
        });
        
        // Success check
        printRow("[+] Dynamic writeups database loaded and synchronized with GitHub repository.");
    } catch (err) {
        console.error(err);
        printRow("[-] Automation Sync Failure: Defaulting to local repository files mode.");
    }
}
// Fetch the targeted CTF markdown file asynchronously and displays it in the modal
async function loadWriteup(fileName) {
    const overlay = document.getElementById('modal-overlay');
    const viewer = document.getElementById('markdown-viewer');
    
    viewer.innerHTML = `<p style="color: var(--text-color)">[*] Mounting secure cluster storage data vectors...</p>`;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    try {
        const response = await fetch(`./writeups/${fileName}`);
        if (!response.ok) throw new Error("Resource not found inside active directory block.");
        const textData = await response.text();
        
        marked.setOptions({ gfm: true, breaks: true });
        viewer.innerHTML = marked.parse(textData);
    } catch (err) {
        viewer.innerHTML = `<p style="color: #ff3333;">[-] Target execution interrupted: ${err.message}</p>`;
    }
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// Terminal Evaluation Interpreter Engine Loop
input.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        const fullLine = this.value.trim();
        this.value = '';
        
        printRow(fullLine, true);
        if (fullLine === '') return;
        
        const segments = fullLine.split(/\s+/);
        const command = segments[0].toLowerCase();
        const parameter = segments[1];
        
        switch (command) {
            case 'help':
                printRow(`System Command Modules:<br>
                - <span class="highlight-green">ls</span>        : Catalog items available in environment path.<br>
                - <span class="highlight-green">cat [file]</span> : Read target data configuration details.<br>
                - <span class="highlight-green">clear</span>     : Purge terminal display logs from panel.`, false, true);
                break;
                
            case 'clear':
                body.querySelectorAll('.output-row').forEach(row => row.remove());
                break;
                
            case 'ls':
                const nodes = Object.keys(currentDir.children).map(node => `<span>${node}</span>`);
                printRow(nodes.join('    '), false, true);
                break;
                
            case 'cat':
                if (!parameter) {
                    printRow("cat: missing targets initialization parameter.");
                    break;
                }
                const target = currentDir.children[parameter];
                if (target && target.type === 'file') {
                    if (target.isExternal) {
                        printRow(`[*] Triggering decoder pipeline visualization for ${parameter}...`);
                        loadWriteup(target.path);
                    } else {
                        printRow(target.content);
                    }
                } else {
                    printRow(`cat: ${parameter}: target object not found inside scope.`);
                }
                break;
                
            default:
                printRow(`system error: command not recognized: "${command}". Run <span class="highlight-green">help</span> to check bindings.`, false, true);
        }
    }
});

// Function to copy email to clipboard from the sidebar
function copyEmail() {
    const email = "your.email@example.com"; // <-- PUT YOUR REAL EMAIL HERE
    navigator.clipboard.writeText(email).then(() => {
        // Find the button and change text temporarily to show success
        const btn = document.querySelector('.action-btn');
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.borderColor = "var(--matrix-green)";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.borderColor = "var(--dim-green)";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy email: ', err);
    });
}

// Dynamic Router Engine function to switch "page views" safely
function switchPage(pageId) {
    // A. Remove selection status color from old navigation anchors
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // B. Find clicked button target context and highlight it
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn'))
                           .find(btn => btn.innerText.toLowerCase().includes(pageId));
    if (activeBtn) activeBtn.classList.add('active');

    // C. Deactivate all page section windows
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));

    // D. Mount the targeted layout canvas panel framework
    const selectedPage = document.getElementById(`page-${pageId}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const burger = document.querySelector('.mobile-menu-toggle');
    
    if (sidebar) {
        sidebar.classList.toggle('menu-active');
        
        // Optional: toggle a state on the burger button itself for visual flair
        if (burger) {
            burger.classList.toggle('open');
        }
    }
}

// Run automation engine immediately when page finishes mounting
window.onload = initializeAutomatedWriteups;