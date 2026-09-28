import { projectDetails } from './project-details.js';

// Project years confirmed by the artist; TRI-O uses its documented award year.
// Keep the index order stable while the featured project advances automatically.
export const projectGallery = [
  { id: 'muted-portraits', year: '2015', yearNote: '' },
  { id: 'ting-difang', year: '2026', yearNote: '' },
  { id: 'emotional-dance-music-kit', year: '2020', yearNote: '' },
  { id: 'da-wo-xian-ren', year: '2025', yearNote: '' },
  { id: 'trio', year: '2014', yearNote: 'Award year' },
  { id: 'web-dj', year: '2018–present', yearNote: '' }
].map(({ id, year, yearNote }) => {
  const project = projectDetails[id];
  return {
    id,
    title: project.title,
    titleZh: project.titleZh,
    year,
    yearNote,
    category: project.category,
    summary: project.summary,
    image: {
      ...project.image,
      position: id === 'da-wo-xian-ren' ? 'center 70%' : 'center'
    }
  };
});
