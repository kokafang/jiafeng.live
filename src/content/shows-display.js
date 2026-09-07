// Editorial display translations. Original source wording remains in shows.json.
const titles = {
  '好Yeah音乐节 @ 鄞州花园里': ['Hao Yeah Music Festival @ Yinzhou Huayuanli', '好Yeah音乐节 · 鄞州花园里'],
  '新天地一游记': ['Xintiandi Yiyouji', '新天地一游记'],
  '喜客厅（大理古城）': ['Xi Ke Ting', '喜客厅（大理古城）'],
  'IMX（International Music X）': ['IMX (International Music X)', 'IMX 国际音乐论坛'],
  '育音堂小镇 C厅': ['Yuyintang Town C Hall', '育音堂小镇 C厅'],
  '杭州草莓音乐节 @ 大运河杭钢公园': ['Hangzhou Strawberry Music Festival', '杭州草莓音乐节 · 大运河杭钢公园'],
  '长沙草莓音乐节': ['Changsha Strawberry Music Festival', '长沙草莓音乐节'],
  '对冲联合巡演；场地待公布（原公告）': ['Duichong Joint Tour / Jiafeng × 8:48', '对冲联合巡演 · 场地待核'],
  '对冲联合巡演 @ YYT 育音堂': ['Duichong Joint Tour @ YYT Yuyintang', '对冲联合巡演 · YYT 育音堂'],
  '对冲联合巡演 @ 酒球会': ['Duichong Joint Tour @ 9 Club', '对冲联合巡演 · 酒球会'],
  '对冲联合巡演 @ 山丘 LIVEHOUSE（斜塘店）': ['Duichong Joint Tour @ Shanqiu (Xietang)', '对冲联合巡演 · 山丘 LIVEHOUSE 斜塘店'],
  '对冲联合巡演 @ 1701 Live House': ['Duichong Joint Tour @ 1701 Live House', '对冲联合巡演 · 1701 Live House'],
  '对冲联合巡演 @ 791 CROW': ['Duichong Joint Tour @ 791 CROW', '对冲联合巡演 · 791 CROW'],
  '对冲联合巡演 @ 活塞 Live House': ['Duichong Joint Tour @ Huosai Live House', '对冲联合巡演 · 活塞 Live House'],
  '对冲联合巡演 @ 隔壁酒吧': ['Duichong Joint Tour @ GEBI', '对冲联合巡演 · 隔壁酒吧'],
  '对冲联合巡演 @ 灯塔音乐现场（U-PARK 店）': ['Duichong Joint Tour @ Lighthouse (U-PARK)', '对冲联合巡演 · 灯塔音乐现场 U-PARK 店'],
  '对冲联合巡演 @ 盲堂': ['Duichong Joint Tour @ Mangtang', '对冲联合巡演 · 盲堂'],
  'Early Technologies Release Party @ ByeByeDisco': ['Early Technologies Release Party @ ByeByeDisco', '早期科技发行派对 · ByeByeDisco'],
  'Early Technologies Album Release Party @ OIL': ['Early Technologies Release Party @ OIL', '早期科技发行派对 · OIL'],
  'Tank Shanghai / 油罐艺术中心': ['Tank Shanghai', '油罐艺术中心现场'],
  '成都草莓音乐节 / STILL PARTY 舞台 @ 国际非遗创意产业园': ['Chengdu Strawberry Music Festival / STILL PARTY', '成都草莓音乐节 · 国际非遗创意产业园'],
  '早期科技全国巡演 @ HOU LIVE & MPK': ['Early Technologies Tour @ HOU LIVE & MPK', '早期科技全国巡演 · HOU LIVE & MPK'],
  '早期科技全国巡演 @ MAO 永庆坊店': ['Early Technologies Tour @ MAO (Yongqingfang)', '早期科技全国巡演 · MAO 永庆坊店'],
  '早期科技全国巡演 @ 山丘 Livehouse 新光店': ['Early Technologies Tour @ Shanqiu (Xinguang)', '早期科技全国巡演 · 山丘新光店'],
  '早期科技全国巡演 @ 酒球会': ['Early Technologies Tour @ 9 Club', '早期科技全国巡演 · 酒球会'],
  '早期科技全国巡演 @ CH8 东郊店': ['Early Technologies Tour @ CH8 (Dongjiao)', '早期科技全国巡演 · CH8 东郊店'],
  '早期科技全国巡演 @ 西演 Space·福星现场': ['Early Technologies Tour @ Xiyan Space / Fuxing', '早期科技全国巡演 · 西演 Space 福星现场'],
  '早期科技全国巡演 @ ThreeLive': ['Early Technologies Tour @ ThreeLive', '早期科技全国巡演 · ThreeLive'],
  '早期科技全国巡演 @ MAO Livehouse': ['Early Technologies Tour @ MAO Livehouse', '早期科技全国巡演 · MAO Livehouse'],
  '贵阳草莓音乐节 / MSE @ 白云区曹关赤泥堆场': ['Guiyang Strawberry Music Festival / MSE', '贵阳草莓音乐节 · 曹关赤泥堆场'],
  '幻爱锐舞会电玩专辑巡演 @ OIL': ['Emotional Dance Music Tour @ OIL', '幻爱锐舞会电玩专辑巡演 · OIL'],
  '幻爱锐舞会电玩专辑巡演 @ MAO Livehouse': ['Emotional Dance Music Tour @ MAO Livehouse', '幻爱锐舞会电玩专辑巡演 · MAO Livehouse'],
  '幻爱锐舞会电玩专辑巡演 @ Loopy': ['Emotional Dance Music Tour @ Loopy', '幻爱锐舞会电玩专辑巡演 · Loopy'],
  '幻爱锐舞会电玩专辑巡演 @ 育音堂音乐公园': ['Emotional Dance Music Tour @ Yuyintang Park', '幻爱锐舞会电玩专辑巡演 · 育音堂音乐公园'],
  '幻爱锐舞会电玩专辑巡演 @ 疆进酒 OMNI SPACE': ['Emotional Dance Music Tour @ OMNI SPACE', '幻爱锐舞会电玩专辑巡演 · 疆进酒'],
  '厦门草莓音乐节 / MSE 舞台': ['Xiamen Strawberry Music Festival / MSE', '厦门草莓音乐节 · MSE 舞台'],
  '禾火 OUT Festival @ 公馆水岸广场': ['OUT Festival @ Gongguan Waterfront Plaza', '禾火 OUT 音乐节 · 公馆水岸广场'],
  '高嘉丰 × Lows0n @ TheSigh 瀑布东街口店': ['Jiafeng × Lows0n @ TheSigh (Dongjiekou)', '高嘉丰 × Lows0n · 瀑布东街口店'],
  'Wake Up Festival @ 港坪运动公园': ['Wake Up Festival @ Gangping Sports Park', '觉醒音乐祭 · 港坪运动公园'],
  'B-Side China / china.wav @ ALL': ['B-Side China / china.wav @ ALL', 'B-Side China 对谈与 Web-DJ · ALL'],
  '西湖音乐节': ['West Lake Music Festival', '西湖音乐节'],
  '绿出我人生联合巡演 @ OIL': ['Jiafeng × Lows0n / Green My Life Tour @ OIL', '绿出我人生联合巡演 · OIL'],
  'Young Friends Concert Season 3 @ 糖果': ['Young Friends Concert Season 3 @ Tango', 'Young Friends 第三季联合演出 · 糖果'],
  'adidas Das Days House Party @ 育音堂': ['adidas Das Days House Party @ Yuyintang', 'adidas Das Days 派对 · 育音堂'],
  'NTS: Jiafeng, Live from Shanghai': ['NTS: Jiafeng, Live from Shanghai', 'NTS 上海现场 · 高嘉丰 Web-DJ'],
  '蹦迪治大病全国巡演 @ DDC 黄昏黎明': ['Bengdi Zhi Dabing Tour @ DDC', '蹦迪治大病全国巡演 · 黄昏黎明'],
  '上海的溫泉裡也沒有黑社會：台北濕地站 @ 濕地 venue B1': ['Jiafeng / Taiwan Tour @ Wetland Venue B1', '上海的温泉里也没有黑社会 · 台北湿地站'],
  '撅，日落开始的相聚 @ 明当代美术馆': ['Jue / A Gathering at Sunset @ McaM', '撅，日落开始的相聚 · 明当代美术馆'],
  '一个即兴的周三 @ fRUITYSPACE': ['An Improvised Wednesday @ fRUITYSPACE', '一个即兴的周三 · 水果空间'],
  'R.E.S.O @ 南沙公寓': ['R.E.S.O @ Nansha Apartment', 'R.E.S.O · 南沙公寓'],
  '孤独之星': ['Gudu Zhixing', '孤独之星现场'],
  '汉阳噪 @ 汉艺空间': ['Hanyang Noise @ Hanyi Space', '汉阳噪 · 汉艺空间'],
  '早上好': ['Zaoshanghao', '早上好现场'],
  '光圈': ['Guangquan', '光圈现场'],
  'The Duiyue Gate / 兌悅門': ['The Duiyue Gate', '兑悦门现场'],
  '能盛興工廠': ['Neng Sheng Xing Factory', '能盛兴工厂现场'],
  'Takao Books / 三餘書店': ['Takao Books', '三余书店现场'],
  'Dulan Sugar Factory / 都蘭糖廠': ['Dulan Sugar Factory', '都兰糖厂现场'],
  '江山藝改所': ['Jiang Shan Yi Gai Suo', '江山艺改所现场'],
  'Old Heaven Books / 旧天堂书店': ['Old Heaven Books', '旧天堂书店现场'],
  'Guyuan Wetland Music Festival, Lightning River National Park': ['Guyuan Wetland Music Festival', '沽源湿地音乐节 · 闪电河国家公园'],
  'Orange Isle Music Festival / 橘洲音乐节': ['Orange Isle Music Festival', '橘洲音乐节'],
  'Yuexiu Mountain Park / 越秀山公园': ['Yuexiu Mountain Park', '越秀山公园现场'],
  '2012（旧站原文）': ['2012 (venue name in original archive)', '2012（旧官网所列场地名）'],
  'Private venue': ['Private venue', '私人场地演出'],
  'Private event': ['Private event', '私人活动演出'],
  'MIJI Concert 26 @ Meridian Space': ['MIJI Concert 26 @ Meridian Space', '密集音乐会第 26 场 · Meridian Space'],
  'COMA @ ABC No Rio': ['COMA @ ABC No Rio', 'COMA 系列演出 · ABC No Rio'],
  '1+2+3 Series / Ditmas Park house show': ['1+2+3 Series / Ditmas Park house show', '1+2+3 系列 · Ditmas Park 家庭演出'],
  'Anaïs Maviel: Cross Breath @ 65Fen': ['Anaïs Maviel: Cross Breath @ 65Fen', 'Cross Breath 联合演出 · 65Fen'],
  'Kill The Silence: LUFF does Hong Kong — Opening Live @ LMA': ['Kill The Silence / LUFF Opening Live @ LMA', 'Kill The Silence / LUFF 开幕现场 · LMA'],
  'Chronus Art Center / CAC': ['Chronus Art Center / CAC', '新时线媒体艺术中心现场'],
  'Fruityspace': ['Fruityspace', '水果空间现场'],
  'Meridian Space': ['Meridian Space', '子午线空间现场'],
  'GEBI': ['GEBI', '隔壁现场'],
};

const locations = {
  '杭州，中国': 'Hangzhou, China', '长沙，中国': 'Changsha, China', '上海，中国': 'Shanghai, China',
  '苏州，中国': 'Suzhou, China', '南京，中国': 'Nanjing, China', '合肥，中国': 'Hefei, China',
  '无锡，中国': 'Wuxi, China', '义乌，中国': 'Yiwu, China', '宁波，中国': 'Ningbo, China',
  '温州，中国': 'Wenzhou, China', '北京，中国': 'Beijing, China', '深圳，中国': 'Shenzhen, China',
  '成都，中国': 'Chengdu, China', '广州，中国': 'Guangzhou, China', '西安，中国': "Xi'an, China",
  '武汉，中国': 'Wuhan, China', '贵阳，中国': 'Guiyang, China', '厦门，中国': 'Xiamen, China',
  '台北，台湾': 'Taipei, Taiwan', '福州，中国（地点有冲突）': 'Fuzhou, China *', '嘉义，台湾': 'Chiayi, Taiwan',
  '上海，中国／线上': 'Shanghai, China / Online', 'New York / Brooklyn，美国': 'Brooklyn, New York, US',
  'New York，美国': 'New York, US', '澳门': 'Macau', 'Paris，法国': 'Paris, France',
  'Caen，法国': 'Caen, France', 'Prague，捷克': 'Prague, Czech Republic',
  'Bratislava，斯洛伐克': 'Bratislava, Slovakia', 'Berlin，德国': 'Berlin, Germany',
  'Stockholm，瑞典': 'Stockholm, Sweden', 'Uppsala，瑞典': 'Uppsala, Sweden',
  '重庆，中国': 'Chongqing, China', 'New York / Ridgewood，美国': 'Ridgewood, New York, US',
  '地点未注明': 'Location not recorded', 'New York / Queens，美国': 'Queens, New York, US',
  '台南，台湾': 'Tainan, Taiwan', '高雄，台湾': 'Kaohsiung, Taiwan', '台东，台湾': 'Taitung, Taiwan',
  '新竹，台湾': 'Hsinchu, Taiwan', '香港': 'Hong Kong',
  '中国，具体行政区待核': 'China / location to verify', '阳朔，中国': 'Yangshuo, China',
  '大理，中国': 'Dali, China',
  'Hamburg，德国': 'Hamburg, Germany',
};

const venueOverrides = {
  '杭州草莓音乐节 @ 大运河杭钢公园': 'Grand Canal Hanggang Park',
  '长沙草莓音乐节': 'Venue not recorded',
  '对冲联合巡演；场地待公布（原公告）': 'Venue to verify',
  '成都草莓音乐节 / STILL PARTY 舞台 @ 国际非遗创意产业园': 'International Intangible Cultural Heritage Park',
  '贵阳草莓音乐节 / MSE @ 白云区曹关赤泥堆场': 'Caoguan, Baiyun District / MSE stage',
  '厦门草莓音乐节 / MSE 舞台': 'MSE stage',
  '西湖音乐节': 'Venue not recorded',
  'NTS: Jiafeng, Live from Shanghai': 'NTS Radio',
  'Guyuan Wetland Music Festival, Lightning River National Park': 'Lightning River National Park',
  'Orange Isle Music Festival / 橘洲音乐节': 'Venue not recorded',
  '1+2+3 Series / Ditmas Park house show': 'Ditmas Park / Private venue',
  '1+2+3 Series': 'Venue not recorded',
  '65Fen Music Series': '65Fen',
  '汉阳噪 @ 汉艺空间': 'Hanyi Space',
};

export function displayShow(show) {
  const translatedTitle = titles[show.event]?.[0] || show.event;
  const venue = venueOverrides[show.event] || translatedTitle.split(' @ ').at(-1);
  const festival = /Festival/.test(translatedTitle) ? translatedTitle.split(' @ ')[0].split(' / ')[0] : null;
  const place = festival || venue;
  const placeUncertain = /Venue (?:not recorded|to verify)/.test(place);
  const fullLocation = locations[show.location] || show.location;
  const city = /New York/.test(fullLocation) ? 'New York'
    : /not recorded|location to verify/i.test(fullLocation) ? 'Not recorded'
    : fullLocation.split(',')[0];
  const web = /Browser DJ|Web[- ]?DJ/i.test(show.performance);
  const panel = /Panel Speaker/i.test(show.performance);
  const dj = /\bDJ\b/i.test(show.performance);
  const live = /\bLive\b|\bSolo\b|\bDuo\b|个人现场|人声|手风琴/i.test(show.performance);
  let format = 'Live set';
  let chineseTitle = '现场演出';
  if (panel) { format = 'Panel speaker'; chineseTitle = '论坛嘉宾'; }
  else if (web) { format = 'Web DJ'; chineseTitle = '网页 DJ'; }
  else if (dj && live) { format = 'Hybrid set'; chineseTitle = '混合现场'; }
  else if (dj) { format = 'DJ set'; chineseTitle = 'DJ 演出'; }
  const chinesePlace = placeUncertain ? '场地待核'
    : festival ? titles[show.event]?.[1]?.split(' · ')[0]
    : show.event.includes(' @ ') ? show.event.split(' @ ').at(-1)
    : titles[show.event]?.[1]?.split(' · ').at(-1)?.replace(/现场$/, '');
  if (chinesePlace && /\p{Script=Han}/u.test(chinesePlace)) chineseTitle += ` · ${chinesePlace}`;
  return { format, title: `${format} at ${placeUncertain ? 'an unconfirmed venue' : place}`,
    chineseTitle, venue, location: city, fullLocation,
    formatUncertain: !panel && !web && !dj && !live };
}
