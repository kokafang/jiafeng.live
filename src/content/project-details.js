// Add a record here and a matching data-project-detail button to reuse the dialog.
export const projectDetails = {
  fakebook: {
    title: 'The FakeBook',
    titleZh: '中指爵士',
    category: 'Interactive Instrument',
    status: 'Browser instrument',
    summary: 'A browser-based camera jazz instrument that turns hand gestures into notes shaped by a live chord chart.',
    image: {
      src: '/images/fakebook-project-icon.png',
      alt: 'The FakeBook camera jazz instrument interface',
      caption: 'Camera jazz instrument'
    },
    gallery: [],
    facts: [
      { label: 'Input', value: 'Camera hand tracking' },
      { label: 'Musical system', value: 'Gesture-controlled notes within jazz harmony' },
      { label: 'Platform', value: 'Web browser' }
    ],
    paragraphs: [
      'The FakeBook uses the camera to track hand position and finger count, translating movement into pitch, rhythm and vibrato. Notes are constrained by the current jazz harmony, making improvisation immediate without becoming musically arbitrary.',
      'A scrolling chord chart and Real Book-style backing tracks turn the browser into a playable jazz instrument. The project can be performed online, while its source code is available on GitHub.'
    ],
    source: {
      label: 'Play The FakeBook online',
      href: 'https://fakebook.vercel.app',
      credit: 'A browser-based camera instrument by Jiafeng 高嘉丰.',
      references: [
        { label: 'View source code on GitHub', href: 'https://github.com/kokafang/fakebook' }
      ]
    }
  },
  'emotional-dance-music-kit': {
    title: 'Emotional Dance Music DIY Kit',
    titleZh: '幻爱锐舞会 DIY 套装',
    category: 'Game & Interactive Music Album',
    status: 'Interactive release',
    summary: 'An album released as a playable rhythm-game kit, combining music, a USB dance pad and a downloadable StepMania game.',
    image: {
      src: '/images/diy-dance-kit.jpg',
      alt: 'Emotional Dance Music DIY Kit with album artwork and dance-pad controls',
      caption: 'Album, game and USB dance pad'
    },
    gallery: [],
    facts: [
      { label: 'Release', value: 'Emotional Dance Music' },
      { label: 'Format', value: 'Album / rhythm game / USB dance pad' },
      { label: 'Platform', value: 'StepMania' }
    ],
    paragraphs: [
      'Emotional Dance Music was conceived as an album that could be played as well as heard. The DIY kit pairs the release with a USB dance pad and a downloadable StepMania-based rhythm game, turning listening into a full-body interface.',
      'The project extends the album beyond streaming and physical packaging: each track becomes a playable level, connecting club music, game design and participatory performance.'
    ],
    listen: {
      title: 'Emotional Dance Music',
      credit: 'Album by Jiafeng 高嘉丰',
      label: 'Listen on Bandcamp',
      href: 'https://jiafeng.bandcamp.com/album/emotional-dance-music'
    },
    source: {
      label: 'View the DIY Kit on Bandcamp',
      href: 'https://jiafeng.bandcamp.com/merch/pre-order-emotional-dance-music-diy-dance-kit-usb-dance-pad-included',
      credit: 'Album and interactive edition by Jiafeng 高嘉丰.'
    }
  },
  'bach-typewriter': {
    title: 'Bach Typewriter',
    titleZh: '巴赫打字机',
    category: 'Musical Desktop Companion',
    status: 'macOS app',
    summary: 'A playful desktop instrument that lets the user perform original Bach compositions one keystroke at a time.',
    image: {
      src: '/images/bach-windows-score-background.jpg',
      alt: 'Windows-style score windows from Bach Typewriter',
      caption: 'Original Bach scores, performed through typing',
      overlay: {
        src: '/images/bach-typewriter-sprites.webp',
        alt: 'Pixel Bach playing the harpsichord'
      }
    },
    gallery: [],
    facts: [
      { label: 'Input', value: 'Computer keyboard' },
      { label: 'Output', value: 'Original Bach compositions, typed note by note' },
      { label: 'Platform', value: 'macOS' }
    ],
    paragraphs: [
      'Bach Typewriter maps ordinary keyboard input onto an original Bach score. Each keystroke advances the music by one note, so the composition remains Bach\'s while its timing and phrasing emerge from the user\'s typing.',
      'A pixel Bach and layered desktop windows make the software feel like a tiny musical companion living inside the computer. The application is open source and available on GitHub.'
    ],
    source: {
      label: 'View Bach Typewriter on GitHub',
      href: 'https://github.com/kokafang/bach-typewriter',
      credit: 'An open-source musical desktop companion by Jiafeng 高嘉丰.'
    }
  },
  'da-wo-xian-ren': {
    title: 'Da Wo Xian Ren',
    titleZh: '打窝仙人',
    category: 'Music for Dance',
    status: 'Immersive theatre',
    summary: 'An immersive dance-theatre production with music for the entire performance by Jiafeng.',
    image: {
      src: '/images/da-wo-xian-ren-dance.webp',
      alt: 'Dancers performing Da Wo Xian Ren under blue stage lighting',
      caption: 'Movement and choreography / 舞蹈现场'
    },
    gallery: [
      {
        src: '/images/da-wo-xian-ren-stage.webp',
        alt: 'Da Wo Xian Ren performers between shadow and warm amber stage light',
        caption: 'A scene from the production / 演出片段'
      },
      {
        src: '/images/da-wo-xian-ren-premiere.webp',
        alt: 'A Da Wo Xian Ren performer among the audience beneath suspended fishing nets',
        caption: 'The Yisichang staging / 一丝厂版演出现场'
      }
    ],
    facts: [
      { label: 'Music for the entire production', value: 'Jiafeng 高嘉丰' },
      { label: 'Choreography / co-direction', value: 'Yuan Wanbin 元万斌 / Liu Yuchengjie 刘雨成杰' },
      { label: 'Stage design, writing / co-direction', value: 'Mu Fan 慕凡' }
    ],
    paragraphs: [
      'Created with Suzhou Ballet Theatre, Da Wo Xian Ren brings ballet into a surreal underwater world, pairing the humour of an internet fishing meme with Zhuangzi\'s question about the happiness of fish. The audience is drawn into an encounter where the roles of observer, angler and catch become uncertain.',
      'Jiafeng created the music for the full production, extending his work from songs and live sets into a theatrical soundtrack. The music accompanies the performance from beginning to end, and can also be explored through the release on NetEase Cloud Music.'
    ],
    listen: {
      title: 'Music from the production',
      credit: 'Full production music by Jiafeng 高嘉丰',
      label: 'Listen on NetEase Cloud Music',
      href: 'https://music.163.com/album?id=359619394'
    },
    source: {
      label: 'Explore Da Wo Xian Ren on Xiaohongshu',
      href: 'https://www.xiaohongshu.com/user/profile/5ae14c8d4eacab2764efc947',
      credit: 'Images and creative credits: 打窝仙人. Images are the public post covers.',
      references: [
        { label: 'Production background (Chinese)', href: 'https://www.sohu.com/a/999319412_121123703' }
      ]
    }
  },
  'ting-difang': {
    title: 'Ting Difang: Dialect & Sound',
    titleZh: '听地方',
    category: 'Dialect / Sound / Place',
    status: 'Creative team & space',
    summary: 'A sound project rooted in local dialects, connecting the rhythms of speech with everyday listening and hands-on play in Changsha.',
    image: {
      src: '/images/ting-difang-treehouse.webp',
      alt: 'Ting Difang riverside space among trees and a wooden walkway in Changsha',
      caption: 'The riverside treehouse / 河边小树屋'
    },
    gallery: [
      {
        src: '/images/ting-difang-wind-chimes.webp',
        alt: 'Colourful hanging chimes with a Ting Difang Changsha Chord sign',
        caption: 'Changsha Chord: wind chimes / 长沙和弦风铃'
      },
      {
        src: '/images/ting-difang-sound-play.webp',
        alt: 'Hands interacting with the controls on a Ting Difang sound display',
        caption: 'Playing with sound by the Guitang River / 圭塘河 DJ'
      }
    ],
    facts: [
      { label: 'Focus', value: 'Local dialects & Hunan expressions' },
      { label: 'Format', value: 'Sound / exhibitions / hands-on making' },
      { label: 'Place', value: 'Guitang River Park, Changsha, China' },
      { label: 'Approach', value: 'Listen local' }
    ],
    paragraphs: [
      'Ting Difang begins with dialect: the accents, expressions and speech rhythms through which a place makes itself heard. Local language is approached as sound as much as meaning, bringing the texture of everyday conversation into a creative practice of listening and play.',
      'Hunan expressions sit alongside river sounds, summer cicadas, Changsha Chord wind chimes and playful sound interactions. Dialect is not isolated from its surroundings; it is heard as part of a shared everyday life, connecting voices, people and places.',
      'The team\'s riverside space in Changsha\'s Guitang River Park gives this approach a physical home. Exhibitions and hands-on activities invite people to listen, make and take part. The name Ting Difang suggests that simple invitation: listen to a place, including the way its people speak.'
    ],
    source: {
      label: 'Explore Ting Difang on Xiaohongshu',
      href: 'https://www.xiaohongshu.com/user/profile/5f53295a0000000001002a36',
      credit: 'Images and project information: 听地方 Tīng. Images are the public post covers.'
    }
  }
};
