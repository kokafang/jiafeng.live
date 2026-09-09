// Publication or broadcast dates, not release dates. Source checks are in docs/press-source-notes.md.
export const pressItems = [
  {
    id: 'nts-bloodz-boi-jiafeng', category: 'press', publisher: 'NTS Radio',
    published: '2024-01-17', kind: 'Radio show', language: 'EN',
    title: 'Bloodz Boi w/ Jiafeng',
    thumbnail: { src: '/images/07-gjf个人2（摄影：王玮）.jpg', alt: 'Portrait of Jiafeng, guest on Bloodz Boi on NTS' },
    description: "Jiafeng joins Bloodz Boi's Beijing broadcast, with selections spanning trance, hyperpop and drum & bass, including Baby Monster, AC Remote and Netflix.",
    url: 'https://www.nts.live/shows/bloodz-boi/episodes/bloodz-boi-17th-january-2024'
  },
  {
    id: 'avyss-early-technologies', category: 'press', publisher: 'AVYSS',
    published: '2024-01-05', kind: 'Release feature', language: 'JA',
    title: 'Early Technologies',
    thumbnail: { src: '/images/zaoqi-keji-cover.jpg', alt: 'Early Technologies album artwork' },
    description: 'AVYSS on the album\'s strange, romantic stories about everyday technology, moving between pop and underground electronics.',
    url: 'https://avyss-magazine.com/2024/01/05/48947/'
  },
  {
    id: 'avyss-baby-monster', category: 'press', publisher: 'AVYSS',
    published: '2023-04-11', kind: 'Release feature', language: 'JA',
    title: 'Baby Monster: a song about AI',
    thumbnail: { src: '/images/press-baby-monster.jpg', alt: 'Baby Monster single artwork featured by AVYSS' },
    description: 'A feature on the single\'s response to artificial intelligence, ahead of Early Technologies.',
    url: 'https://avyss-magazine.com/2023/04/11/42747/'
  },
  {
    id: 'mixmag-albums-2020', category: 'press', publisher: 'Mixmag',
    published: '2020', kind: 'Year-end selection', language: 'EN',
    title: 'The Best Albums of 2020',
    thumbnail: { src: '/images/press-mixmag-2020.jpg', alt: 'Mixmag year-end 2020 feature artwork' },
    description: 'Emotional Dance Music selected by Eastern Margins for Mixmag\'s year-end album feature.',
    url: 'https://mixmag.net/feature/the-best-albums-of-the-year-2020'
  },
  {
    id: 'mixmag-asia-interview', category: 'press', publisher: 'Mixmag Asia',
    published: '2020-08-02', kind: 'Interview', language: 'EN',
    title: 'Emotional Dance Music, in conversation',
    thumbnail: { src: '/images/press-mixmag-asia.jpg', alt: 'Jiafeng in the Mixmag Asia interview feature image' },
    description: 'An interview with Cheryl Chow on experimental pop, internet culture and turning an album into a dance game.',
    url: 'https://mixmag.asia/feature/chinese-hyper-pop-artist-gao-jiafeng-emotional-dance-music'
  },
  {
    id: 'times-art-museum', category: 'institutions', publisher: 'Beijing Times Art Museum',
    published: '2019', kind: 'Exhibition report', language: 'ZH',
    title: 'WAVELENGTH: Beyond Manufacturing',
    thumbnail: { src: '/images/press-times-museum.jpg', alt: 'WAVELENGTH exhibition image from Beijing Times Art Museum' },
    description: 'The museum\'s report on WAVELENGTH lists Jiafeng among the participating artists. Published on TrueArt.',
    url: 'https://www.trueart.com/news/346384.html'
  },
  {
    id: 'radii-browser-dj', category: 'press', publisher: 'RADII',
    published: '2018-09-03', kind: 'Feature', language: 'EN',
    title: 'Browser DJ on NTS',
    thumbnail: { src: '/images/press-radii-browser-dj.jpg', alt: 'Jiafeng in the RADII Browser DJ feature image' },
    description: 'Josh Feola looks at Jiafeng\'s browser-based NTS set, mixing internet videos and sounds live across multiple tabs.',
    url: 'https://radii.co/article/listen-gao-jiafeng-inflicts-his-browser-dj-set-on-nts'
  },
  {
    id: 'nts-jiafeng-shanghai', category: 'press', publisher: 'NTS Radio',
    published: '2018-08-26', kind: 'Live radio set', language: 'EN',
    title: 'Jiafeng: Live from Shanghai',
    thumbnail: { src: '/images/webdj-video-cover.png', alt: 'Jiafeng performing a Web-DJ set' },
    description: 'A live Web-DJ set for NTS Shanghai, weaving YouTube and Bilibili clips into a performance with saxophone and throat singing.',
    url: 'https://www.nts.live/shows/shanghai/episodes/jiafeng-live-from-shanghai-26th-august-2018'
  },
  {
    id: 'mcam-performance', category: 'institutions', publisher: 'McaM / Mingyuan Group',
    published: '2017', kind: 'Performance report', language: 'ZH',
    title: 'Ice Cream Hardcore Songbook',
    thumbnail: { src: '/images/press-mcam.jpg', alt: 'Group discussion pictured in the McaM event report' },
    description: 'An institutional recap of Jiafeng\'s improvised performance at Ming Contemporary Art Museum in Shanghai.',
    url: 'https://www.mingyuangroup.com/wap/news-1.aspx?Id=2196'
  }
];

export const pressCategories = [
  { id: 'all', label: 'All' },
  { id: 'press', label: 'Press' },
  { id: 'institutions', label: 'Institutions' }
];

export function getPressPage(category = 'all', page = 0) {
  const matches = pressItems.filter(item => category === 'all' || item.category === category);
  const pageCount = Math.max(1, Math.ceil(matches.length / 4));
  const index = Math.max(0, Math.min(pageCount - 1, page));
  return { items: matches.slice(index * 4, index * 4 + 4), page: index, pageCount, total: matches.length };
}
