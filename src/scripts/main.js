import { siteContent } from "../content/site.js";

const app = document.querySelector("#app");

function projectCard(project) {
  return `
    <article class="project-card">
      <div class="project-tag">${project.tag}</div>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <a class="text-link" href="${project.href}">Open</a>
    </article>
  `;
}

app.innerHTML = `
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">${siteContent.hero.eyebrow}</p>
      <h1>${siteContent.hero.title}</h1>
      <p class="lede">${siteContent.hero.body}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="${siteContent.hero.primaryHref}">${siteContent.hero.primaryLabel}</a>
        <a class="button button-secondary" href="${siteContent.hero.secondaryHref}">${siteContent.hero.secondaryLabel}</a>
      </div>
    </div>
    <div class="hero-panel">
      <div class="panel-label">Current Mode</div>
      <p>Design the front door first.</p>
      <p>Plug in content second.</p>
      <p>Launch new music tools whenever they are ready.</p>
    </div>
  </section>

  <section class="section" id="about">
    <p class="section-kicker">${siteContent.about.kicker}</p>
    <div class="section-grid">
      <h2>${siteContent.about.title}</h2>
      <p>${siteContent.about.body}</p>
    </div>
  </section>

  <section class="section" id="projects">
    <p class="section-kicker">Projects</p>
    <div class="projects-grid">
      ${siteContent.projects.map(projectCard).join("")}
    </div>
  </section>

  <section class="section" id="notes">
    <p class="section-kicker">${siteContent.notes.kicker}</p>
    <div class="section-grid">
      <h2>${siteContent.notes.title}</h2>
      <p>${siteContent.notes.body}</p>
    </div>
  </section>
`;
