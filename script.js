import ML_DATA from './data.js';

class MLPortal {
  constructor() {
    this.currentSection = 'home';
    this.theme = localStorage.getItem('theme') || 'dark';
    this.user = JSON.parse(localStorage.getItem('ml_user')) || null;
    this.progress = JSON.parse(localStorage.getItem('ml_progress')) || [];
    this.chatOpen = false;
    this.init();
  }

  init() {
    this.applyTheme();
    this.checkAuth();
    this.updateProgressUI();
    window.app = this;
  }

  checkAuth() {
    const overlay = document.getElementById('auth-overlay');
    const userInfo = document.getElementById('user-info');
    const globalProgress = document.getElementById('global-progress');

    if (this.user) {
      overlay.style.display = 'none';
      userInfo.innerText = `Hello, ${this.user.name}`;
      globalProgress.style.display = 'block';
      this.showSection('home');
    } else {
      overlay.style.display = 'flex';
    }
  }

  handleMockLogin() {
    this.user = { name: "Student Alpha", email: "student@university.edu" };
    localStorage.setItem('ml_user', JSON.stringify(this.user));
    this.checkAuth();
  }

  logout() {
    localStorage.removeItem('ml_user');
    location.reload();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    this.updateThemeIcon();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
      if (this.theme === 'dark') {
        icon.setAttribute('data-lucide', 'sun');
      } else {
        icon.setAttribute('data-lucide', 'moon');
      }
      lucide.createIcons();
    }
  }

  showSection(sectionId) {
    if (!this.user) return;
    this.currentSection = sectionId;
    const homeSection = document.getElementById('home-section');
    const dynamicSection = document.getElementById('dynamic-content');
    const pageTitle = document.getElementById('page-title');
    const contentBody = document.getElementById('content-body');
    const hero = document.getElementById('hero');

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
    });

    if (sectionId === 'home') {
      homeSection.style.display = 'block';
      dynamicSection.style.display = 'none';
      hero.style.display = 'flex';
      return;
    }

    homeSection.style.display = 'none';
    dynamicSection.style.display = 'block';
    hero.style.display = 'none';

    switch (sectionId) {
      case 'notes': pageTitle.innerText = "Unit-wise Notes & Videos"; this.renderNotes(contentBody); break;
      case 'papers': pageTitle.innerText = "Previous Year Papers"; this.renderPapers(contentBody); break;
      case 'questions': pageTitle.innerText = "Question Bank"; this.renderQuestions(contentBody); break;
      case 'assignments': pageTitle.innerText = "Assignments & Deadlines"; this.renderAssignments(contentBody); break;
      case 'resources': pageTitle.innerText = "eBooks & Reference Links"; this.renderResources(contentBody); break;
      case 'syllabus': pageTitle.innerText = "Course Syllabus"; this.renderSyllabus(contentBody); break;
    }
  }

  renderNotes(container) {
    container.innerHTML = `<div class="grid">${ML_DATA.units.map(unit => `
            <div class="card">
                <h3>${unit.title}</h3>
                <div style="margin-bottom: 1rem;">${this.getUnitProgressHTML(unit)}</div>
                <ul>${unit.topics.map(topic => `
                    <li style="flex-direction: column; align-items: flex-start; gap: 10px; padding: 10px; border-bottom: 1px solid var(--border-color);">
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                            <span style="${this.progress.includes(topic.id) ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${topic.name}</span>
                            <div class="done-toggle ${this.progress.includes(topic.id) ? 'active' : ''}" onclick="app.toggleTopicStatus('${topic.id}')">
                                <i data-lucide="${this.progress.includes(topic.id) ? 'check-circle' : 'circle'}" style="width: 14px;"></i>
                                ${this.progress.includes(topic.id) ? 'Done' : 'Mark Done'}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; margin-top: 5px;">
                            <button class="btn btn-outline" onclick="app.showVideo('${topic.video}', '${topic.name}')">Watch Video</button>
                            <a href="${unit.drive}" target="_blank" class="btn btn-primary">PDF Notes</a>
                        </div>
                    </li>`).join('')}
                </ul>
            </div>`).join('')}
        </div>
        <div id="video-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:3000; justify-content:center; align-items:center;">
            <div style="width: 90%; max-width: 800px; background: var(--card-bg); padding: 20px; border-radius: 12px; position: relative;">
                <button onclick="document.getElementById('video-modal').style.display='none'" style="position:absolute; top:-40px; right:0; background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times; Close</button>
                <h3 id="modal-video-title" style="margin-bottom: 15px;">Video Lesson</h3>
                <div class="video-wrapper"><iframe id="video-iframe" src="" allowfullscreen></iframe></div>
            </div>
        </div>`;
    lucide.createIcons();
  }

  getUnitProgressHTML(unit) {
    const total = unit.topics.length;
    const done = unit.topics.filter(t => this.progress.includes(t.id)).length;
    const percent = Math.round((done / total) * 100);
    return `<div style="display: flex; justify-content: space-between; font-size: 0.7rem; opacity: 0.7;"><span>Unit Progress</span><span>${percent}%</span></div>
                <div class="progress-container"><div class="progress-bar" style="width: ${percent}%"></div></div>`;
  }

  toggleTopicStatus(topicId) {
    this.progress = this.progress.includes(topicId) ? this.progress.filter(id => id !== topicId) : [...this.progress, topicId];
    localStorage.setItem('ml_progress', JSON.stringify(this.progress));
    this.updateProgressUI();
    if (this.currentSection === 'notes') this.renderNotes(document.getElementById('content-body'));
  }

  updateProgressUI() {
    const totalTopics = ML_DATA.units.reduce((acc, unit) => acc + unit.topics.length, 0);
    const doneTopics = this.progress.length;
    const percent = Math.round((doneTopics / totalTopics) * 100) || 0;
    const progressBar = document.getElementById('main-progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.innerText = `${percent}%`;
  }

  showVideo(url, title) {
    const modal = document.getElementById('video-modal'), iframe = document.getElementById('video-iframe'), modalTitle = document.getElementById('modal-video-title');
    modalTitle.innerText = title; iframe.src = url; modal.style.display = 'flex';
  }

  renderPapers(container) {
    container.innerHTML = `<div class="grid">${ML_DATA.papers.map(paper => `
            <div class="card"><h3>${paper.year} - ${paper.exam}</h3><p>Full question paper with solution keys.</p>
                <div style="margin-top: 1rem; display: flex; gap: 10px;"><a href="#" class="btn btn-primary">Download PDF</a><a href="#" class="btn btn-outline">View Online</a></div>
            </div>`).join('')}</div>`;
  }

  renderQuestions(container) {
    container.innerHTML = `<div style="margin-bottom: 2rem;"><input type="text" id="q-search" placeholder="Filter questions..." style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color);" oninput="app.filterQuestions(this.value)"></div>
            <div id="questions-list" class="grid">${this.getQuestionsHTML(ML_DATA.questionBank)}</div>`;
  }

  getQuestionsHTML(questions) {
    return questions.map(q => `<div class="card"><div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;"><span class="tag tag-${q.difficulty.toLowerCase()}">${q.difficulty}</span><span style="font-size: 0.8rem; opacity: 0.7;">Unit ${q.unit}</span></div><h4>${q.topic}</h4><p>${q.question}</p></div>`).join('');
  }

  filterQuestions(query) {
    const filtered = ML_DATA.questionBank.filter(q => q.topic.toLowerCase().includes(query.toLowerCase()) || q.question.toLowerCase().includes(query.toLowerCase()));
    document.getElementById('questions-list').innerHTML = this.getQuestionsHTML(filtered);
  }

  renderAssignments(container) {
    container.innerHTML = `<div class="grid">${ML_DATA.assignments.map(a => `<div class="card"><div style="display: flex; justify-content: space-between; margin-bottom: 1rem;"><span class="tag tag-${a.status.toLowerCase()}">${a.status}</span><span style="font-size: 0.8rem; color: #ef4444; font-weight: 600;">Due: ${a.deadline}</span></div><h3>${a.title}</h3><div style="margin-top: 1rem;"><a href="#" class="btn btn-primary">Download Assignment</a></div></div>`).join('')}</div>`;
  }

  renderResources(container) {
    container.innerHTML = `<div class="grid">${ML_DATA.resources.map(r => `<div class="card"><div style="font-size: 0.7rem; text-transform: uppercase; color: var(--primary-color); font-weight: 700;">${r.type}</div><h3 style="margin: 0.5rem 0 1rem;">${r.title}</h3><a href="${r.link}" target="_blank" class="btn btn-outline">Explore Resource</a></div>`).join('')}</div>`;
  }

  renderSyllabus(container) {
    container.innerHTML = `<div class="card" style="padding: 0; overflow: hidden;"><table class="syllabus-table"><thead><tr><th style="width: 100px;">Unit</th><th>Syllabus Coverage</th></tr></thead><tbody>${ML_DATA.syllabus.map(s => `<tr><td>Unit ${s.unit}</td><td>${s.content}</td></tr>`).join('')}</tbody></table></div>`;
  }

  handleSearch(query) {
    if (!query) { if (this.currentSection !== 'home') this.showSection(this.currentSection); return; }
    const contentBody = document.getElementById('content-body');
    document.getElementById('home-section').style.display = 'none';
    document.getElementById('dynamic-content').style.display = 'block';
    document.getElementById('hero').style.display = 'none';
    document.getElementById('page-title').innerText = `Search Results: "${query}"`;
    let resHTML = '<div class="grid">';
    ML_DATA.units.forEach(u => u.topics.forEach(t => { if (t.name.toLowerCase().includes(query.toLowerCase())) resHTML += `<div class="card"><span class="tag" style="background:#e0e7ff;color:#4338ca;">Note</span><h3 style="margin-top: 0.5rem;">${t.name}</h3><p>Found in ${u.title}</p><a href="#" class="btn btn-primary" style="margin-top: 1rem; display: inline-block;">View Note</a></div>`; }));
    ML_DATA.questionBank.forEach(q => { if (q.question.toLowerCase().includes(query.toLowerCase()) || q.topic.toLowerCase().includes(query.toLowerCase())) resHTML += `<div class="card"><span class="tag tag-${q.difficulty.toLowerCase()}">Question - ${q.difficulty}</span><h3 style="margin-top: 0.5rem;">${q.topic}</h3><p>${q.question}</p></div>`; });
    resHTML += '</div>';
    contentBody.innerHTML = resHTML === '<div class="grid"></div>' ? '<div style="text-align: center; padding: 3rem;"><h3>No results found.</h3></div>' : resHTML;
  }

  /* Chatbot Logic */
  toggleChat() {
    this.chatOpen = !this.chatOpen;
    document.getElementById('chatbot-window').style.display = this.chatOpen ? 'flex' : 'none';
  }

  sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    this.appendMessage('user', text);
    input.value = '';
    setTimeout(() => this.processBotResponse(text), 600);
  }

  appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}-msg`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  processBotResponse(userText) {
    const txt = userText.toLowerCase();
    let reply = "I'm not exactly sure about that. Try asking about 'Unit 1', 'Syllabus', or 'Assignments'!";

    if (txt.includes('unit')) {
      const unitMatch = txt.match(/unit\s+(\d)/);
      if (unitMatch) {
        const unit = ML_DATA.units.find(u => u.id == unitMatch[1]);
        if (unit) reply = `For ${unit.title}, we have topics like ${unit.topics[0].name}. You can find them in the Notes section!`;
      } else {
        reply = "We have 6 units in this course. Which one are you looking for?";
      }
    } else if (txt.includes('syllabus')) {
      reply = "The full syllabus is available in the 'Syllabus' tab. It covers everything from AI Basics to Model Tuning.";
    } else if (txt.includes('hi') || txt.includes('hello')) {
      reply = "Hello! Ready to master Machine Learning today?";
    } else if (txt.includes('assignment')) {
      reply = "There are 2 active assignments. Check the 'Assignments' tab for deadlines!";
    } else if (txt.includes('paper') || txt.includes('exam')) {
      reply = "You can find FAT, SAT, and ESE papers in the 'Papers' section.";
    } else if (txt.includes('regression')) {
      reply = "Regression is covered in Unit 4 (Supervised Learning). We have notes and videos for it!";
    }

    this.appendMessage('bot', reply);
  }
}

const app = new MLPortal();
export default app;
