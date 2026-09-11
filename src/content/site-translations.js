import { displayShow } from './shows-display.js';

export const normalizeText = value => value.replace(/\s+/g, ' ').trim();

const labels = {
  Music: '音乐', MUSIC: '音乐', 'Web-DJ': '网页 DJ', 'WEB-DJ': '网页 DJ', 'Web DJ': '网页 DJ',
  Projects: '项目', PROJECTS: '项目', About: '关于', ABOUT: '关于', Shows: '演出', SHOWS: '演出',
  Press: '媒体', PRESS: '媒体', Merch: '周边', MERCH: '周边', Listen: '收听',
  Newer: '较新', Earlier: '较早', Previous: '上一页', Next: '下一页', All: '全部', Institutions: '艺术机构',
  Date: '日期', Performance: '演出', Location: '地点', Info: '状态', Upcoming: '即将开始', Past: '已结束',
  'Search shows': '搜索演出', 'Clear search': '清除搜索', 'View source': '查看来源',
  'No shows found.': '没有找到相关演出。', 'Try a year, city, venue or performance type.': '试试搜索年份、城市、场地或演出类型。',
  '0 results': '没有结果', 'In development': '开发中', 'Interactive Instrument': '互动乐器',
  'The FakeBook 中指爵士': '中指爵士 The FakeBook', 'LMDJ - Little Monster DJ': 'LMDJ 小怪兽 DJ',
  'AVS Sampler': 'AVS 采样器', 'A performance sampler for mixing, chopping, and sequencing audiovisual clips live.': '用于现场混合、切分与编排音视频片段的表演采样器。',
  'MIDI Controller': 'MIDI 控制器', 'TRI-O - Algorithmic MIDI Controller': 'TRI-O 算法 MIDI 控制器',
  'Game & Interactive Music Album': '游戏与互动音乐专辑', 'Emotional Dance Music DIY Kit': '幻爱锐舞会 DIY 套装',
  'Musical Desktop Companion': '音乐桌面伙伴', 'Bach Typewriter 巴赫打字机': '巴赫打字机',
  'Turn everyday typing into a Bach performance.': '让日常打字成为一场巴赫演奏。',
  'Music for Dance Theatre': '舞蹈剧场配乐', 'Da Wo Xian Ren 打窝仙人': '打窝仙人',
  'Music for the entire immersive dance-theatre production.': '为整部沉浸式舞蹈剧场作品创作音乐。',
  'Dialect / Sound / Place': '方言 / 声音 / 地方', 'Ting Difang: Dialect & Sound 听地方': '听地方：方言与声音',
  'Local dialects, everyday voices and playful listening in Changsha.': '从长沙出发，在方言、日常声音与互动中聆听地方。',
  'Watch the full set': '观看完整演出', 'Open Spotify ↗': '在 Spotify 收听 ↗', 'Open YouTube ↗': '在 YouTube 观看 ↗', 'Open Bandcamp ↗': '在 Bandcamp 收听 ↗',
  'Click to use player': '点击操作播放器', 'Activate player controls': '启用播放器控制',
  'USB DANCE PAD / ALBUM + GAME': 'USB 跳舞毯 / 专辑 + 游戏', 'DIY Dance Kit': 'DIY 跳舞套装',
  'Emotional Dance Music': '幻爱锐舞会', 'Early Technologies': '早期科技', 'AI NI AI DAO': '爱你爱到', 'Cruel Outlets': '残酷奥特莱斯',
  'Out of stock': '暂时缺货', 'View on Bandcamp': '前往 Bandcamp', 'View on Xiaohongshu': '查看小红书介绍',
  'LYRIC T-SHIRT / 2024': '歌词 T 恤 / 2024', 'WeChat Is the Graveyard of Conversation': '微信是聊天的坟墓',
  'An album you can play with your feet. A USB dance pad, the digital album, and a download of the StepMania-based rhythm game.': '一张可以用双脚演奏的专辑。套装包含 USB 跳舞毯、数字专辑，以及基于 StepMania 的节奏游戏。',
  "A lyric made wearable. A black T-shirt named after Jiafeng's song, with custom Chinese lettering by Italian designer Kenshiro Caravaggio Carena.": '把一句歌词穿在身上。这件黑色 T 恤以高嘉丰的同名歌曲为题，由意大利设计师 Kenshiro Caravaggio Carena 创作中文字形。',
  'Project notes': '项目介绍', 'Close project details': '关闭项目介绍', 'Project introduction': '项目介绍', 'Project images': '项目图片',
  'Format': '形式', 'Place': '地点', 'Approach': '方式', 'Focus': '关注', 'Project soundtrack': '项目配乐',
  'Section navigation': '页面导航', 'Scroll navigation right': '向右滑动导航', 'More sections': '更多页面',
  'Choose a release': '选择音乐作品', 'Go to more recent release': '查看较新的作品', 'Go to earlier release': '查看较早的作品',
  'Search shows by year, city, venue or performance type': '按年份、城市、场地或演出类型搜索',
  'Search by year, city, venue or performance type': '按年份、城市、场地或演出类型搜索',
  'Performance archive, newest first': '演出档案，按时间倒序排列', 'Performance archive pages': '演出档案分页',
  'Newer performances': '较新的演出', 'Earlier performances': '较早的演出', 'Filter press sources': '筛选媒体来源',
  'Selected coverage and records': '媒体报道与机构记录', 'Previous press page': '上一页媒体报道', 'Next press page': '下一页媒体报道',
  'Project pages': '项目分页', 'Previous projects page': '上一页项目', 'Next projects page': '下一页项目',
  'Play Web-DJ set video': '播放网页 DJ 演出视频', 'Play TRI-O video': '播放 TRI-O 视频', 'Album cover': '专辑封面',
  'Spotify playlist player': 'Spotify 歌单播放器', 'Spotify album player': 'Spotify 专辑播放器', 'Bandcamp album player': 'Bandcamp 专辑播放器', 'YouTube video player': 'YouTube 视频播放器',
  'Cruel Outlets video': '《残酷奥特莱斯》视频', 'Website under construction': '网站建设中',
  'Jiafeng Gao portrait': '高嘉丰肖像', 'Jiafeng performing a Web-DJ set': '高嘉丰的网页 DJ 演出',
  'The FakeBook camera jazz instrument': '中指爵士摄像头互动乐器', 'TRI-O video thumbnail': 'TRI-O 视频封面',
  'AVS Sampler interface with two video decks, tempo controls and sample pads': 'AVS 采样器界面，包含双视频播放器、速度控制和采样垫',
  'Open AVS Sampler development site (new tab)': '打开 AVS 采样器开发站（新标签页）',
  'Pixel Bach playing the harpsichord, from Bach Typewriter': '巴赫打字机中演奏羽管键琴的像素巴赫',
  'Da Wo Xian Ren dancers performing together under blue stage light': '蓝色舞台灯光下的打窝仙人舞者',
  'Colourful Ting Difang 听地方 logo on the wall of its riverside space': '听地方河边空间墙面上的彩色标志',
  'Emotional Dance Music DIY Dance Kit: USB dance pad and album packaging': '幻爱锐舞会 DIY 套装：USB 跳舞毯与专辑包装',
  'Black T-shirt with white custom Chinese lettering reading 微信是聊天的坟墓': '印有“微信是聊天的坟墓”白色字样的黑色 T 恤'
};

export const staticParagraphsZh = {
  '.webdj-copy > p': [
    '自 2017 年起，高嘉丰持续发展自己的浏览器现场表演实践，并将其称为“网页 DJ”。他不使用传统 DJ 软件，而是完全在浏览器中演出，在 YouTube 视频、田野录音、在线声音生成器、直播、人声清唱，以及来自不同地区和风格的音乐之间穿梭。',
    '整场演出在多个标签页之间实时编排。音乐不一定对拍；他通过打开、叠加、打断和切换不同声音来源来控制节奏。浏览器窗口同步投影给观众，浏览互联网、搜索、缓冲和意外瞬间也因此成为表演中可见的一部分。'
  ],
  '.about-copy > p': [
    '高嘉丰 Jiafeng 是一位常驻上海的歌手、制作人、数字艺术家和开发者，创作横跨实验流行、俱乐部音乐、声音艺术与音乐科技。',
    '他的实践涵盖歌曲、现场表演、浏览器乐器、AI 音乐系统、网页 DJ 和面向艺术机构的声音项目。作品曾在上海当代艺术博物馆、上海油罐艺术中心、深圳戏剧双年展和斯德哥尔摩 EMS 等艺术空间与活动中呈现。他曾为 NTS Radio 上海节目带来 Web-DJ 现场，并做客 Bloodz Boi 的节目。其作品也受到 AVYSS、Dazed、Mixmag 和 Rate Your Music 等平台关注。',
    '他曾获 Margaret Guthman 国际新乐器设计大赛奖项，也是中国较早将 AI、NFT 与流行音乐创作相结合的实践者之一。在他的创作中，技术并非新奇的装饰，而是重新组织声音、情感、作者性与日常数字生活的方式。他毕业于纽约大学 Music Technology 硕士项目。'
  ]
};

export const musicZh = {
  'early-technologies': ['早期科技', '《早期科技》把社交媒体、自动调音与流媒体想象成来自另一个时代的遗物：笨拙、浪漫，又带着一点陌生感。专辑游走于超流行、独立摇滚、金属与电子音乐之间，每首歌都讲述了一个关于科技与日常数字生活的不同故事。'],
  'ai-ni-ai-dao': ['爱你爱到', '《爱你爱到》是一首解构流行单曲，将超流行、金属、未来贝斯与朋克缝合成一个关于迷恋与毁灭的强烈故事。继原版单曲和 MV 之后，《爱你爱到 Remixes》通过跨地域合作拓展了这个世界，参与者包括 Catnapp、galen tipton、recovery girl、Junior Astronaut、Shelhiel、GG龙虾和 Jellyeeee，五个重混版本陆续发布。'],
  'cruel-outlets': ['残酷奥特莱斯', '《残酷奥特莱斯》把高嘉丰的解构流行语言带入更尖锐的情感维度，在紧凑的歌曲结构中，将旋律的张力与数字音色的粗粝感结合起来。'],
  'emotional-dance-music': ['幻爱锐舞会', '《幻爱锐舞会》以俱乐部音乐的尺度探索对比：柔软与冲击、浪漫与断裂、亲密与音量，通过层层交织的电子制作展开。'],
  'beng-di-zhi-da-bing': ['蹦迪治大病', '《蹦迪治大病》发行于 2016 年，用四分钟将泡泡糖流行、未来贝斯与 Trance 压缩在一起，以超现实的中文歌词、失控的幽默和 DIY 俱乐部能量推进。']
};

export const projectsZh = {
  fakebook: {
    title: '中指爵士 The FakeBook', category: '互动乐器', status: '浏览器乐器',
    summary: '一件基于浏览器摄像头的爵士乐器，将手势转化为由实时和弦谱组织的音符。',
    paragraphs: [
      '中指爵士通过摄像头追踪手的位置与手指数，将动作转化为音高、节奏和颤音。音符会被限制在当前爵士和声中，让即兴演奏既直接，又不会变得随意。',
      '滚动和弦谱与 Real Book 风格的伴奏，把浏览器变成一件可以演奏的爵士乐器。项目可以直接在线体验，源代码也在 GitHub 公开。'
    ],
    factLabels: ['输入', '音乐系统', '平台'],
    facts: ['摄像头手势追踪', '爵士和声中的手势控制音符', '网页浏览器'],
    captions: ['摄像头爵士乐器'],
    alts: ['中指爵士摄像头互动乐器界面'],
    source: ['在线体验中指爵士', '高嘉丰创作的浏览器摄像头乐器。'],
    references: ['在 GitHub 查看源代码']
  },
  'emotional-dance-music-kit': {
    title: '幻爱锐舞会 DIY 套装', category: '游戏与互动音乐专辑', status: '互动发行',
    summary: '一张以节奏游戏套装形式发行的专辑，将音乐、USB 跳舞毯与可下载的 StepMania 游戏结合起来。',
    paragraphs: [
      '《幻爱锐舞会》被构想为一张不仅能听、也能亲自玩的专辑。DIY 套装把作品与 USB 跳舞毯和可下载的 StepMania 节奏游戏组合在一起，让聆听变成全身参与的交互体验。',
      '这个项目把专辑延伸到流媒体和实体包装之外：每首歌都成为一个可玩的关卡，连接俱乐部音乐、游戏设计与参与式表演。'
    ],
    factLabels: ['作品', '形式', '平台'],
    facts: ['幻爱锐舞会', '专辑 / 节奏游戏 / USB 跳舞毯', 'StepMania'],
    captions: ['专辑、游戏与 USB 跳舞毯'],
    alts: ['包含专辑视觉与跳舞毯控制器的幻爱锐舞会 DIY 套装'],
    listen: ['幻爱锐舞会', '高嘉丰的音乐专辑', '在 Bandcamp 收听'],
    source: ['在 Bandcamp 查看 DIY 套装', '高嘉丰创作的专辑及互动版本。']
  },
  'bach-typewriter': {
    title: '巴赫打字机', category: '音乐桌面伙伴', status: 'macOS 应用',
    summary: '一件让用户通过一次次键盘敲击，逐音演奏巴赫原作的趣味桌面乐器。',
    paragraphs: [
      '巴赫打字机把普通键盘输入映射到巴赫的原始乐谱。每次按键都会推进一个音符，因此作品仍是巴赫原作，而演奏的时间与乐句则由用户的打字动作形成。',
      '像素巴赫与层叠的桌面窗口，让软件像一位住在电脑里的微型音乐伙伴。该应用开源，并可在 GitHub 获取。'
    ],
    factLabels: ['输入', '输出', '平台'],
    facts: ['电脑键盘', '巴赫原作，由用户逐音敲出', 'macOS'],
    captions: ['巴赫原谱，通过打字演奏'],
    alts: ['巴赫打字机中的 Windows 风格乐谱窗口'],
    source: ['在 GitHub 查看巴赫打字机', '高嘉丰创作的开源音乐桌面伙伴。']
  },
  'ting-difang': {
    title: '听地方：方言与声音', category: '方言 / 声音 / 地方', status: '创作团队与空间',
    summary: '一个以地方方言为根的声音项目，从长沙出发，将语言的节奏、日常聆听和动手参与连接起来。',
    paragraphs: [
      '听地方从方言开始：口音、表达和说话的节奏，让一个地方被听见。在这里，地方语言既传递意义，也是一种声音材料，让日常对话的质感进入聆听与互动的创作实践。',
      '湖南的地方表达与河流声、夏日蝉鸣、长沙和弦风铃以及声音互动并置。方言并不孤立于环境，而是共同日常生活的一部分，将声音、人和地方联系起来。',
      '团队位于长沙圭塘河公园的河边空间，为这一实践提供了一个具体的落脚点。展览与动手活动邀请人们聆听、制作和参与。“听地方”也是一个简单的邀请：听见一个地方，包括那里的人如何说话。'
    ],
    facts: ['地方方言与湖南表达', '声音 / 展览 / 动手制作', '中国长沙圭塘河公园', '聆听地方'],
    captions: ['河边小树屋', '长沙和弦风铃', '在圭塘河玩声音'],
    alts: ['长沙树木与木栈道间的听地方河边空间', '带有听地方长沙和弦标牌的彩色风铃', '体验者操作听地方声音装置的控制器'],
    source: ['在小红书了解听地方', '图片与项目信息来自听地方 Tīng，图片取自公开笔记封面。']
  },
  'da-wo-xian-ren': {
    title: '打窝仙人', category: '舞蹈配乐', status: '沉浸式剧场',
    summary: '一部沉浸式舞蹈剧场作品，由高嘉丰创作全场音乐。',
    paragraphs: [
      '《打窝仙人》与苏州芭蕾舞团合作，将芭蕾带入超现实的水下世界，把网络钓鱼梗的幽默与庄子关于“鱼之乐”的提问并置。观众也被卷入其中，旁观者、垂钓者与被捕获者的身份变得不再确定。',
      '高嘉丰为整部作品创作音乐，将歌曲与现场表演的实践延伸至剧场配乐。音乐贯穿演出始终，也可以通过网易云音乐上的专辑独立聆听。'
    ],
    facts: ['高嘉丰 Jiafeng', '元万斌 / 刘雨成杰', '慕凡'],
    captions: ['舞蹈现场', '演出片段', '一丝厂版演出现场'],
    alts: ['蓝色舞台灯光下的打窝仙人舞者', '阴影与暖色舞台灯光中的打窝仙人表演者', '悬挂渔网下、观众席中的打窝仙人表演者'],
    source: ['在小红书了解打窝仙人', '图片与创作名单来自打窝仙人，图片取自公开笔记封面。']
  }
};

export const pressZh = {
  'nts-bloodz-boi-jiafeng': ['Bloodz Boi 与高嘉丰', '高嘉丰参与 Bloodz Boi 从北京播出的节目，选曲涵盖 Trance、Hyperpop 与 Drum & Bass，并收录 Baby Monster、AC Remote 和 Netflix。', '做客 NTS Bloodz Boi 节目的高嘉丰肖像'],
  'nts-jiafeng-shanghai': ['高嘉丰：上海现场', '为 NTS 上海带来的 Web-DJ 现场，将 YouTube、Bilibili 视频片段与萨克斯、呼麦交织在一起。', '高嘉丰表演 Web-DJ 的演出照片'],
  'avyss-early-technologies': ['早期科技', 'AVYSS 介绍专辑中关于日常科技的陌生而浪漫的故事，以及流行与地下电子音乐之间的游走。', '《早期科技》专辑封面'],
  'avyss-baby-monster': ['Baby Monster：一首关于 AI 的歌', '在《早期科技》发行前，AVYSS 专文介绍这首回应人工智能的单曲。', 'AVYSS 报道中的 Baby Monster 单曲封面'],
  'mixmag-albums-2020': ['2020 年度最佳专辑', 'Eastern Margins 在 Mixmag 年度专辑专题中推荐《幻爱锐舞会》。', 'Mixmag 2020 年度专题图片'],
  'mixmag-asia-interview': ['对谈：幻爱锐舞会', '与 Cheryl Chow 对谈实验流行、互联网文化，以及如何把一张专辑变成跳舞游戏。', 'Mixmag Asia 专访中的高嘉丰'],
  'times-art-museum': ['WAVELENGTH：制造之外', '北京时代美术馆的 WAVELENGTH 展览报道将高嘉丰列为参展艺术家，发表于艺术平台 TrueArt。', '北京时代美术馆 WAVELENGTH 展览图片'],
  'radii-browser-dj': ['NTS 上的浏览器 DJ', 'Josh Feola 介绍高嘉丰的 NTS 浏览器演出：在多个标签页间实时混合网络视频与声音。', 'RADII 浏览器 DJ 报道中的高嘉丰'],
  'mcam-performance': ['冰淇淋硬核歌本', '艺术机构对高嘉丰在上海明当代美术馆即兴表演的活动回顾。', '明当代美术馆活动报道中的集体讨论']
};

const places = {
  Hamburg: '汉堡', Shanghai: '上海', Shenzhen: '深圳', Dali: '大理', Ningbo: '宁波', Hangzhou: '杭州', Changsha: '长沙',
  Suzhou: '苏州', Nanjing: '南京', Hefei: '合肥', Wuxi: '无锡', Yiwu: '义乌', Wenzhou: '温州', Beijing: '北京', Chengdu: '成都',
  Guangzhou: '广州', "Xi'an": '西安', Wuhan: '武汉', Guiyang: '贵阳', Xiamen: '厦门', Taipei: '台北', Fuzhou: '福州', Chiayi: '嘉义',
  'New York': '纽约', Macau: '澳门', Paris: '巴黎', Caen: '卡昂', Prague: '布拉格', Bratislava: '布拉迪斯拉发', Berlin: '柏林',
  Stockholm: '斯德哥尔摩', Uppsala: '乌普萨拉', Chongqing: '重庆', Tainan: '台南', Kaohsiung: '高雄', Taitung: '台东',
  Hsinchu: '新竹', 'Hong Kong': '香港', Yangshuo: '阳朔', 'Not recorded': '未记录',
  China: '中国', Germany: '德国', 'United States': '美国', Taiwan: '台湾', France: '法国', 'Czech Republic': '捷克', Slovakia: '斯洛伐克', Sweden: '瑞典'
};

export function createSiteTranslator({ shows = [], projectDetails = {}, pressItems = [], musicReleases = [] } = {}) {
  const dictionary = new Map(Object.entries(labels));
  const add = (source, target) => { if (source && target) dictionary.set(normalizeText(source), target); };
  for (const [id, project] of Object.entries(projectDetails)) {
    const zh = projectsZh[id];
    if (!zh) continue;
    for (const field of ['title', 'category', 'status', 'summary']) add(project[field], zh[field]);
    add(project.category + ' / ' + project.status, zh.category + ' / ' + zh.status);
    project.paragraphs.forEach((paragraph, index) => add(paragraph, zh.paragraphs[index]));
    project.facts.forEach((fact, index) => {
      add(fact.label, zh.factLabels?.[index]);
      add(fact.value, zh.facts[index]);
    });
    [project.image, ...(project.gallery || [])].forEach((image, index) => {
      add(image.caption, zh.captions[index]); add(image.alt, zh.alts[index]);
    });
    add(project.source?.label, zh.source[0]); add(project.source?.credit, zh.source[1]);
    project.source?.references?.forEach((reference, index) => add(reference.label, zh.references?.[index]));
    if (project.listen && zh.listen) {
      add(project.listen.title, zh.listen[0]);
      add(project.listen.credit, zh.listen[1]);
      add(project.listen.label, zh.listen[2]);
    }
  }
  Object.entries({
    'Music for the entire production': '全场音乐', 'Choreography / co-direction': '编舞 / 联合导演', 'Stage design, writing / co-direction': '舞台设计、编剧 / 联合导演',
    'Music from the production': '作品配乐', 'Full production music by Jiafeng 高嘉丰': '全场音乐：高嘉丰', 'Listen on NetEase Cloud Music': '在网易云音乐收听',
    'Production background (Chinese)': '作品背景介绍', 'View Da Wo Xian Ren 打窝仙人 project details': '查看打窝仙人项目介绍',
    'View Ting Difang: Dialect and Sound 听地方 project details': '查看听地方：方言与声音项目介绍',
    'View The FakeBook 中指爵士 project details': '查看中指爵士项目介绍',
    'View Emotional Dance Music DIY Kit project details': '查看幻爱锐舞会 DIY 套装项目介绍',
    'View Bach Typewriter 巴赫打字机 project details': '查看巴赫打字机项目介绍',
    'Beijing Times Art Museum': '北京时代美术馆', 'McaM / Mingyuan Group': '明当代美术馆 / 明园集团'
  }).forEach(([source, target]) => add(source, target));
  const kinds = { 'Radio show': '电台节目', 'Live radio set': '电台现场', 'Release feature': '作品介绍', 'Year-end selection': '年度推荐', Interview: '专访', 'Exhibition report': '展览报道', Feature: '专题', 'Performance report': '演出回顾' };
  const languages = { EN: '英文', ZH: '中文', JA: '日文' };
  for (const item of pressItems) {
    const zh = pressZh[item.id];
    if (!zh) continue;
    add(item.title, zh[0]); add(item.description, zh[1]); add(item.thumbnail.alt, zh[2]);
    add(`${item.kind} / ${item.language}`, `${kinds[item.kind]} / ${languages[item.language]}`);
  }
  for (const release of musicReleases) {
    const zh = musicZh[release.id];
    if (!zh) continue;
    add(release.titleEn, zh[0]); add(release.description, zh[1]);
  }
  for (const show of shows) {
    const display = displayShow(show);
    const [format, ...venue] = display.chineseTitle.split(' · ');
    const fallback = display.title.split(' @ ').slice(1).join(' @ ');
    add(display.title, `${format} @ ${venue.join(' · ') || fallback}`);
    add(display.location, display.location.split(', ').map(part => places[part] || part).join('，'));
  }
  function translate(source, locale = 'zh-CN') {
    if (locale === 'en') return source;
    const key = normalizeText(source);
    if (!key) return source;
    let result = dictionary.get(key);
    if (!result) {
      const page = key.match(/^(\d+)–(\d+) \/ (\d+) · Page (\d+) of (\d+)$/);
      const count = key.match(/^(\d+) \/ (\d+) · (\d+) (sources|projects)$/);
      const tag = key.match(/^(ALBUM|SINGLE) (\d{4})$/);
      const loading = key.match(/^Loading (.+)\.\.\.$/);
      const cover = key.match(/^(.+) cover$/);
      const image = key.match(/^Show image (\d+): (.+)$/);
      const year = key.match(/^(\d{4}): (.+)$/);
      const external = key.match(/^Open (.+) on (Spotify|YouTube|Bandcamp) \(new tab\)$/);
      const sourceLink = key.match(/^Source for (.+), (\d{4}-\d{2}-\d{2}) \(opens in new tab\)$/);
      if (page) result = `${page[1]}–${page[2]} / ${page[3]} 条 · 第 ${page[4]} / ${page[5]} 页`;
      else if (count) result = `${count[1]} / ${count[2]} · ${count[3]} ${count[4] === 'sources' ? '条来源' : '个项目'}`;
      else if (tag) result = `${tag[1] === 'ALBUM' ? '专辑' : '单曲'} ${tag[2]}`;
      else if (loading) result = `正在加载《${translate(loading[1])}》…`;
      else if (cover) result = `${translate(cover[1])}封面`;
      else if (image) result = `查看图片 ${image[1]}：${translate(image[2])}`;
      else if (year) result = `${year[1]}：${translate(year[2])}`;
      else if (external) result = `在 ${external[2]} 打开《${translate(external[1])}》（新标签页）`;
      else if (sourceLink) result = `${translate(sourceLink[1])}，${sourceLink[2]} 的来源（新标签页）`;
      else if (key.endsWith(' (opens in a new tab)')) result = translate(key.slice(0, -' (opens in a new tab)'.length)) + '（在新标签页打开）';
    }
    if (!result) return source;
    return source.match(/^\s*/)[0] + result + source.match(/\s*$/)[0];
  }
  return { translate, add, dictionary };
}
