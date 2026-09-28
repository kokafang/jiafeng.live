export const galleryLabels = {
  'Selected Projects': '代表项目',
  'Sound, publishing and performance.': '声音、出版与跨媒介实践。',
  'Tools & Play': '工具与实验',
  'Instruments and experiments to play with.': '可以使用、演奏与探索的工具。',
  'Explore project': '项目介绍',
  'Explore tool': '探索工具',
  'Choose a project': '选择项目',
  '5 sec / project': '每 5 秒切换',
  'Pause slideshow': '暂停轮播',
  'Resume slideshow': '继续轮播',
  'Pause project slideshow': '暂停项目轮播',
  'Resume project slideshow': '继续项目轮播',
  'Open source': '开源',
  'Hand tracking': '手势追踪',
  'DJ / Play': 'DJ / 游戏',
  'Audiovisual': '音视频',
  'A playful approach to DJ performance.': '把 DJ 表演变成一种游戏。',
  'Play project video': '播放项目影像',
  'Selected projects': '代表项目',
  'Select a project': '选择项目',
  'Project index': '项目目录',
  'View project': '查看项目',
  'View project details': '查看项目介绍',
  'Previous project': '上一个项目',
  'Next project': '下一个项目',
  'Pause automatic project switching': '暂停自动切换项目',
  'Resume automatic project switching': '继续自动切换项目',
  'Pause': '暂停',
  'Play': '播放',
  'Auto': '自动',
  'Paused': '已暂停',
  'Year': '年份',
  'Years': '年份',
  'Award year': '获奖年份',
  '2018–present': '2018–至今',
  'TRI-O demonstration': 'TRI-O 演示',
  'Web-DJ live performance': '网页 DJ 现场表演'
};

export const galleryProjectsZh = {
  'muted-portraits': {
    title: '无声肖像 Muted Portraits',
    category: '磁带厂牌 / 声音艺术',
    summary: '一个将听众关于音乐的对话，转化为发行内容的磁带出版项目。',
    year: '2015', yearNote: '',
    image: {
      alt: 'Muted Portraits 的 MP001《植物少年》磁带及包装，李增辉，2015 年',
      caption: '李增辉《植物少年》 · MP001 · 2015'
    }
  },
  'ting-difang': {
    title: '听地方：方言与声音',
    category: '方言 / 声音 / 地方',
    summary: '一个以地方方言为根的声音项目，从长沙出发，将语言的节奏、日常聆听和动手参与连接起来。',
    year: '2026', yearNote: '',
    image: { alt: '长沙树木与木栈道间的听地方河边空间', caption: '河边小树屋' }
  },
  'emotional-dance-music-kit': {
    title: '幻爱锐舞会 DIY 套装',
    category: '游戏与互动音乐专辑',
    summary: '一张以节奏游戏套装形式发行的专辑，将音乐、USB 跳舞毯与可下载的 StepMania 游戏结合起来。',
    year: '2020', yearNote: '',
    image: { alt: '包含专辑视觉与跳舞毯控制器的幻爱锐舞会 DIY 套装', caption: '专辑、游戏与 USB 跳舞毯' }
  },
  'da-wo-xian-ren': {
    title: '打窝仙人',
    category: '舞蹈配乐',
    summary: '一部沉浸式舞蹈剧场作品，由高嘉丰创作全场音乐。',
    year: '2025', yearNote: '',
    image: { alt: '蓝色舞台灯光下的打窝仙人舞者', caption: '舞蹈现场' }
  },
  trio: {
    title: 'TRI-O',
    category: '算法乐器',
    summary: '一件探索人为控制与随机性之间空间的实验乐器，将音乐、灯光与视觉连接起来。',
    year: '2014', yearNote: '获奖年份',
    image: { alt: 'TRI-O 算法 MIDI 控制器', caption: 'TRI-O / 算法演奏' }
  },
  'web-dj': {
    title: '网页 DJ',
    category: '浏览器现场表演',
    summary: '将网页浏览器变成乐器，在多个标签页之间实时编排声音与影像的现场表演实践。',
    year: '2018–至今', yearNote: '',
    image: { alt: '高嘉丰的网页 DJ 演出', caption: '网页 DJ / 浏览器现场表演' }
  }
};

// Appended year facts preserve the existing detail and translation array order.
export const projectYearFactsZh = {
  'emotional-dance-music-kit': { label: '年份', value: '2020' },
  'ting-difang': { label: '年份', value: '2026' },
  'da-wo-xian-ren': { label: '年份', value: '2025' }
};

export const newProjectsZh = {
  trio: {
    title: 'TRI-O', category: '算法乐器', status: '实验 MIDI 控制器',
    summary: galleryProjectsZh.trio.summary,
    paragraphs: [
      'TRI-O 受到《三体》的启发，将乐器控制器视为一种介于人为控制与随机性之间的系统，把算法行为与现场演奏连接起来。',
      '项目探索如何为音乐、灯光与视觉系统赋予更具人性的控制方式，并于 2014 年获得 Margaret Guthman 国际新乐器设计大赛奖项。'
    ],
    factLabels: ['形式', '灵感', '获奖年份'],
    facts: ['算法 MIDI 控制器', '《三体》', '2014'],
    captions: ['TRI-O / 算法演奏'],
    alts: ['TRI-O 算法 MIDI 控制器'],
    source: ['在 YouTube 观看 TRI-O', '高嘉丰创作的实验乐器。所列年份为获奖年份。']
  },
  'web-dj': {
    title: '网页 DJ', category: '浏览器现场表演', status: '自 2018 年持续至今',
    summary: galleryProjectsZh['web-dj'].summary,
    paragraphs: [
      '自 2018 年起，高嘉丰持续发展自己的浏览器现场表演实践，并将其称为“网页 DJ”。他不使用传统 DJ 软件，而是完全在浏览器中演出，在 YouTube 视频、田野录音、在线声音生成器、直播、人声清唱，以及来自不同地区和风格的音乐之间穿梭。',
      '整场演出在多个标签页之间实时编排。音乐不一定对拍；他通过打开、叠加、打断和切换不同声音来源来控制节奏。浏览器窗口同步投影给观众，浏览互联网、搜索、缓冲和意外瞬间也因此成为表演中可见的一部分。'
    ],
    factLabels: ['年份', '形式', '乐器'],
    facts: ['2018–至今', '声音与影像现场', '网页浏览器'],
    captions: ['网页 DJ / 浏览器现场表演'],
    alts: ['高嘉丰的网页 DJ 演出'],
    source: ['观看完整的网页 DJ 演出', '高嘉丰持续进行的现场表演项目，2018 年至今。'],
    references: ['NTS：高嘉丰，上海现场（2018）']
  }
};
