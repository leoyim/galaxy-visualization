/*
 * 天体数据模型 —— 数值取自公开实测 / 权威汇编，非模拟生成
 * 来源：NASA Planetary Fact Sheet、JPL Solar System Dynamics、
 *       NASA Exoplanet Archive、NASA/IPAC Extragalactic Database (NED)、
 *       SIMBAD / RECONS 邻近恒星表
 * 固化日期：2026-11-07
 *
 * 【如实标注示意部分】
 *  - 银河系螺旋臂点云：程序生成示意（数千亿恒星无法逐颗实测）
 *  - 银河系视图里的恒星系标记位置：示意散布（邻近恒星在 10 万光年尺度下
 *    几乎重合、无法按真实距离分辨），但距离 / 光谱型 / 行星数为实测值
 *  - 本星系群视图：星系距离与天球方位（J2000 赤经赤纬）按实测值换算为三维坐标
 *  - 各层天体"显示尺寸"为可视化放大；系统内轨道 / 距离为真实相对比例
 */
window.CELESTIAL = {
  meta: {
    source: "NASA Planetary Fact Sheet / JPL Solar System Dynamics / NASA Exoplanet Archive / NED / SIMBAD",
    retrieved: "2026-11-07",
    note: "天体显示尺寸已放大（真实比例下不可见）；系统内轨道间距为真实相对比例；公转/自转按真实周期加速演示。"
  },

  // ===== 层级 -1：近邻宇宙 —— 与银河系「平级」的大星系 =====
  // 这些星系直径多在 5–17 万光年、质量 10^11–10^12 M☉，与银河系同量级，
  // 但距离 11–54 百万光年，远超本星系群（约 10 Mly 直径），故单独成层按真实距离绘制。
  // ra = J2000 赤经(小时)，dec = 赤纬(度)，distMly = 实测距离(百万光年)
  nearbyUniverse: {
    note: "与银河系同量级的近邻大星系；距离与天球方位按实测值换算，星系本体尺寸为示意放大。",
    galaxies: [
      { id:"localgroup", name:"本星系群（银河系 / M31 所在）", distMly:0, diameterLy:10000000,
        type:"星系群 · 约 1000 万光年直径", color:0xffd27f, drill:'localgroup',
        facts:["我们所在的星系群，约 80+ 个成员星系","两大成员：银河系、仙女座 M31（≈ 254 万光年）","本图以其为原点，半径 ≈ 5 Mly","点击可下钻查看群内全部 12 个成员"] },
      { id:"ngc253", name:"玉夫座星系 NGC 253", distMly:11.4, ra:0.793, dec:-25.29, diameterLy:90000,
        type:"SAB(s)c 棒旋星系 · 星暴核", color:0xffc890,
        facts:["距地球 ≈ 1140 万光年","直径 ≈ 9 万光年，与银河系同量级","核心剧烈恒星形成（星暴星系）","玉夫座星系群的主导成员"] },
      { id:"m81", name:"波德星系 M81 / NGC 3031", distMly:11.8, ra:9.926, dec:69.07, diameterLy:90000,
        type:"SA(s)ab 宏观旋涡星系", color:0xd8e4ff,
        facts:["距地球 ≈ 1180 万光年","直径 ≈ 9 万光年","视星等 6.9，肉眼可见（极暗条件下）","与 M82 引力相互作用，属 M81 星系群"] },
      { id:"cenA", name:"半人马座 A / NGC 5128", distMly:12.9, ra:13.424, dec:-43.02, diameterLy:60000,
        type:"E/S0 巨椭圆星系 · 强射电源", color:0xffd0a8,
        facts:["距地球 ≈ 1290 万光年","直径 ≈ 6 万光年（含晕更大）","南天最强射电源之一（Centaurus A）","中心黑洞 ≈ 5.5×10⁷ M☉，有明显尘埃带"] },
      { id:"m83", name:"南风车星系 M83 / NGC 5236", distMly:15.2, ra:13.617, dec:-29.87, diameterLy:55000,
        type:"SAB(s)c 棒旋星系", color:0xffd6b0,
        facts:["距地球 ≈ 1520 万光年","直径 ≈ 5.5 万光年","正对地球的宏观旋涡，旋臂清晰","已观测到 6 次超新星爆发"] },
      { id:"m64", name:"黑眼星系 M64 / NGC 4826", distMly:17.0, ra:12.946, dec:21.68, diameterLy:54000,
        type:"(R)SA(rs)ab 旋涡星系", color:0xffe0b8,
        facts:["距地球 ≈ 1700 万光年","直径 ≈ 5.4 万光年","核心前方有明显暗尘埃带（「黑眼」）","内外盘气体反向旋转，疑为并合遗迹"] },
      { id:"m101", name:"风车星系 M101 / NGC 5457", distMly:20.9, ra:14.054, dec:54.35, diameterLy:170000,
        type:"SAB(rs)cd 宏观旋涡星系", color:0xbcd8ff,
        facts:["距地球 ≈ 2090 万光年","直径 ≈ 17 万光年，比银河系更大","不对称旋臂，受伴星系引力扰动","哈勃曾对其进行著名的深场拼接观测"] },
      { id:"m51", name:"涡状星系 M51 / NGC 5194", distMly:23.0, ra:13.498, dec:47.20, diameterLy:76000,
        type:"SA(s)bc pec · 相互作用星系", color:0xc8dcff,
        facts:["距地球 ≈ 2300 万光年","直径 ≈ 7.6 万光年","正与伴星系 NGC 5195 碰撞/交互","首个被辨认出旋涡结构的星系（1845 年罗斯勋爵）"] },
      { id:"ngc6744", name:"NGC 6744（银河系孪生）", distMly:30.0, ra:19.163, dec:-63.86, diameterLy:175000,
        type:"SAB(r)bc 中间棒旋星系", color:0xd8e0ff,
        facts:["距地球 ≈ 3000 万光年","直径 ≈ 17.5 万光年，约为银河系 1.7 倍","形态被认为最接近银河系的近邻星系","有伴星系 NGC 6744A"] },
      { id:"m104", name:"草帽星系 M104 / NGC 4594", distMly:31.0, ra:12.666, dec:-11.62, diameterLy:100000,
        type:"SA(s)a / 透镜状星系", color:0xffe0c0,
        facts:["距地球 ≈ 3100 万光年","亮盘直径 ≈ 5 万光年，含晕 ≈ 10 万光年","侧视呈草帽状，尘埃带横贯盘面","中心黑洞 ≈ 10⁹ M☉"] },
      { id:"m87", name:"室女座 A / M87 / NGC 4486", distMly:53.5, ra:12.514, dec:12.39, diameterLy:120000,
        type:"E0–cD 巨椭圆星系", color:0xfff0b8,
        facts:["距地球 ≈ 5350 万光年","直径 ≈ 12 万光年（含延展晕远大于此）","中心黑洞 ≈ 6.5×10⁹ M☉","2019 年 EHT 发布人类首张黑洞影像 M87*"] },
      { id:"m49", name:"M49 / NGC 4472", distMly:53.0, ra:12.496, dec:8.00, diameterLy:160000,
        type:"E2 巨椭圆星系", color:0xffdfa8,
        facts:["距地球 ≈ 5300 万光年","直径 ≈ 16 万光年","室女座星系团最亮成员之一","拥有数千个球状星团"] },
      { id:"m86", name:"M86 / NGC 4406", distMly:53.0, ra:12.437, dec:12.95, diameterLy:130000,
        type:"E3 / S0 透镜状星系", color:0xffdca0,
        facts:["距地球 ≈ 5300 万光年","直径 ≈ 13 万光年","室女座星系团成员","以高速落向星系团核心，产生 X 射线尾迹"] }
    ]
  },

  // ===== 层级 0：本星系群 —— 真正的「其他星系」=====
  // distMly = 距银河系(太阳)的百万光年数；ra = J2000 赤经(小时)；dec = 赤纬(度)
  // 方位由 ra/dec 换算为三维单位向量，距离按 distMly 线性映射 → 距离与方位均为实测
  localGroup: {
    note: "本星系群主要成员。距离与天球方位按实测值换算；星系本体尺寸为示意放大。",
    galaxies: [
      { id:"milkyway", name:"银河系 Milky Way", distMly:0, diameterLy:100000, type:"SBbc 棒旋星系", color:0xffd27f, drill:'galaxy',
        facts:["直径 ≈ 10 万光年","约 1000–4000 亿颗恒星","中心：人马座 A*（≈ 415 万 M☉ 黑洞）","太阳距银心 ≈ 2.6 万光年，位于猎户臂"] },
      { id:"canismajor", name:"大犬座矮星系", distMly:0.025, ra:7.20, dec:-27.0, diameterLy:2000, type:"dIrr 矮不规则星系（银河系卫星）", color:0xc9b8ff,
        facts:["距地球 ≈ 2.5 万光年","曾被认为是距银河系最近的卫星星系","正被银河系潮汐瓦解","其存在仍有学术争议"] },
      { id:"sagdeg", name:"人马座矮椭球星系", distMly:0.065, ra:18.92, dec:-30.5, diameterLy:10000, type:"dSph 矮椭球星系（银河系卫星）", color:0xb9a8ff,
        facts:["距地球 ≈ 6.5 万光年","正被银河系潮汐瓦解","星流几乎环绕整个银河系","2003 年发现"] },
      { id:"lmc", name:"大麦哲伦云 LMC", distMly:0.1633, ra:5.39, dec:-69.75, diameterLy:14000, type:"IBm 不规则星系（银河系卫星）", color:0xffb0c8,
        facts:["距地球 ≈ 16.3 万光年","银河系最大的卫星星系","南天肉眼可见","含蜘蛛星云 30 Doradus 等恒星形成区"] },
      { id:"smc", name:"小麦哲伦云 SMC", distMly:0.200, ra:0.88, dec:-72.83, diameterLy:7000, type:"Im 不规则星系（银河系卫星）", color:0xffc8d8,
        facts:["距地球 ≈ 20 万光年","银河系卫星星系","与 LMC 由麦哲伦流相连","南天肉眼可见"] },
      { id:"sculptor", name:"玉夫座矮星系", distMly:0.29, ra:1.00, dec:-33.7, diameterLy:3000, type:"dSph 矮椭球星系（银河系卫星）", color:0xa8b8ff,
        facts:["距地球 ≈ 29 万光年","1937 年发现的矮椭球星系","暗物质占比很高","银河系卫星星系"] },
      { id:"fornax", name:"天炉座矮星系", distMly:0.46, ra:2.66, dec:-34.45, diameterLy:6000, type:"dSph 矮椭球星系（银河系卫星）", color:0x9fc0e6,
        facts:["距地球 ≈ 46 万光年","银河系较亮的卫星星系之一","含 5 个球状星团","暗物质主导"] },
      { id:"ngc6822", name:"巴纳德星系 NGC 6822", distMly:1.63, ra:19.75, dec:-14.8, diameterLy:7000, type:"IBm 不规则星系（本星系群成员）", color:0xffcaa0,
        facts:["距地球 ≈ 163 万光年","1884 年由 E.E. Barnard 发现","本星系群成员，非银河系卫星","低金属丰度，类似早期星系"] },
      { id:"m31", name:"仙女座星系 M31", distMly:2.537, ra:0.71, dec:41.27, diameterLy:152000, type:"SA(s)b 旋涡星系", color:0xbcd6ff,
        facts:["距地球 ≈ 254 万光年","本星系群最大星系","直径 ≈ 15.2 万光年","正以 ≈ 110 km/s 接近银河系，约 45 亿年后碰撞合并"] },
      { id:"m32", name:"M32（M31 伴星系）", distMly:2.65, ra:0.71, dec:40.87, diameterLy:6500, type:"cE2 紧凑椭圆星系", color:0xd6e2ff,
        facts:["距地球 ≈ 265 万光年","M31 的伴星系","致密椭圆星系","中心含超大质量黑洞"] },
      { id:"m110", name:"M110（M31 伴星系）", distMly:2.69, ra:0.67, dec:41.68, diameterLy:17000, type:"E5 pec 矮椭圆星系", color:0xc8d8f0,
        facts:["距地球 ≈ 269 万光年","M31 的伴星系","含年轻蓝色恒星与尘埃带","梅西耶天体"] },
      { id:"m33", name:"三角座星系 M33", distMly:2.73, ra:1.56, dec:30.66, diameterLy:60000, type:"SA(s)cd 旋涡星系", color:0x9fd8e6,
        facts:["距地球 ≈ 273 万光年","本星系群第三大星系","直径 ≈ 6 万光年","可能受 M31 引力束缚"] }
    ]
  },

  // ===== 层级 1：银河系总览 =====
  galaxy: {
    armNote: "恒星空间分布为对数螺旋臂示意，并非逐颗实测位置；邻近恒星系标记的位置为示意散布，其距离/光谱/行星数为实测值。",
    core: { name:"人马座 A* / 银心", facts:["距太阳 ≈ 2.6 万光年","中心超大质量黑洞 ≈ 415 万 M☉","2022 年 EHT 发布首张影像 Sgr A*"] },
    arms: ["英仙臂","人马–船底臂","矩尺臂","盾牌–半人马臂","猎户臂（本地臂）"],
    // 邻近恒星系：distLy 为实测距离；planets 为已确认行星数（null=有争议/未确认）
    systems: [
      { id:"sol", name:"太阳系 Solar System", distLy:0, spectral:"G2V", planets:8, color:0xffd27f, drill:'solar',
        facts:["距地球 0 光年（我们所在）","1 颗 G2V 主序星","8 颗行星 + 众多卫星/矮行星","可下钻：太阳系 → 地月系"] },
      { id:"alphaCen", name:"半人马α Alpha Centauri", distLy:4.37, spectral:"G2V + K1V + M5.5Ve", planets:3, color:0xffe0a0, drill:'exo',
        facts:["距地球 4.37 光年","三合星系统：A / B + 比邻星","比邻星是距太阳最近的恒星（4.24 ly）","已确认 3 颗行星（比邻星 b/c/d）"],
        system:{ note:"只绘制比邻星及其行星：α Cen A/B 距比邻星约 13,000 AU，与行星轨道（0.03–1.5 AU）跨度过大，无法同图按真实比例呈现。A/B 互绕 a=23.3 AU、P=79.9 年。",
          stars:[{name:"比邻星 Proxima",radiusKm:107000,color:0xff9a6a}],
          planets:[
            {name:"比邻星 d",aAU:0.02895,periodDays:5.122,radiusRe:0.26,color:0xc0c8d0},
            {name:"比邻星 b",aAU:0.04856,periodDays:11.186,radiusRe:1.08,color:0x8fc7ff},
            {name:"比邻星 c",aAU:1.489,periodDays:1928,radiusRe:2.7,color:0x9fb0c0}
          ] } },
      { id:"barnard", name:"巴纳德星 Barnard", distLy:5.96, spectral:"M4V 红矮星", planets:1, color:0xff9a7a, drill:'exo',
        facts:["距地球 5.96 光年","自行速度最大的恒星之一（10.3″/年）","2024 年确认 Barnard b","质量为 ≥0.37 M⊕ 的亚地球"],
        system:{ note:"Barnard b 于 2024 年经 ESPRESSO 径向速度法确认。",
          stars:[{name:"巴纳德星",radiusKm:136000,color:0xff8a5a}],
          planets:[{name:"Barnard b",aAU:0.0236,periodDays:3.154,radiusRe:0.75,color:0xc8a88a}] } },
      { id:"luhman16", name:"卢曼 16 Luhman 16", distLy:6.52, spectral:"L7.5 + T0.5 双褐矮星", planets:0, color:0xb07850, drill:'exo',
        facts:["距地球 6.52 光年","2013 年发现的双褐矮星系统","两子星互绕周期 ≈ 27 年","目前无已确认行星"] },
      { id:"wise0855", name:"WISE 0855−0714", distLy:7.27, spectral:"Y2 亚褐矮星", planets:0, color:0x8878a0, drill:'exo',
        facts:["距地球 7.27 光年","已知最冷的亚褐矮星之一","表面温度 ≈ −48 °C（约 225 K）","目前无已确认行星"] },
      { id:"wolf359", name:"沃夫 359 Wolf 359", distLy:7.86, spectral:"M6V 红矮星", planets:0, color:0xff7050, drill:'exo',
        facts:["距地球 7.86 光年","低质量红矮星（≈0.09 M☉）","频繁耀斑活动","行星候选体仍有争议，暂无确认"] },
      { id:"gliese411", name:"格利泽 411 / Lalande 21185", distLy:8.31, spectral:"M2V 红矮星", planets:2, color:0xff9c6a, drill:'exo',
        facts:["距地球 8.31 光年","北天最亮红矮星之一","已报告 2 颗行星（含 inner planet）","另有候选体待确认"] },
      { id:"sirius", name:"天狼星 Sirius", distLy:8.60, spectral:"A1V + DA2 白矮星", planets:0, color:0xcfe8ff, drill:'exo',
        facts:["距地球 8.60 光年","夜空中最亮的恒星（视星等 −1.46）","A 星 + 白矮星 B，互绕 ≈ 50.1 年","目前无已确认行星"],
        system:{ note:"Sirius B 是距地球最近的白矮星之一；两星互绕 a≈20 AU、P≈50.1 年。",
          stars:[{name:"Sirius A",radiusKm:1190000,color:0xdceaff},{name:"Sirius B（白矮星）",radiusKm:5840,color:0xffffff}],
          binary:{aAU:20,periodDays:18300}, planets:[] } },
      { id:"ross154", name:"罗斯 154 Ross 154", distLy:9.71, spectral:"M3.5V 红矮星", planets:0, color:0xff8058, drill:'exo',
        facts:["距地球 9.71 光年","活跃耀星","自行较大","目前无已确认行星"] },
      { id:"epsEri", name:"波江座 ε Epsilon Eridani", distLy:10.50, spectral:"K2V 橙矮星", planets:1, color:0xffd8a0, drill:'exo',
        facts:["距地球 10.50 光年","类太阳恒星（≈0.82 M☉）","已确认行星 ε Eri b（a≈3.39 AU）","外围有尘埃盘/柯伊伯带类似结构"],
        system:{ note:"ε Eri b 为长周期巨行星；外侧尘埃盘位于 ≈ 35–75 AU（本图未绘制）。",
          stars:[{name:"波江座 ε",radiusKm:510000,color:0xffd8a0}],
          planets:[{name:"ε Eri b",aAU:3.39,periodDays:2673,radiusRe:11,color:0xd8b890}] } },
      { id:"lacaille9352", name:"拉卡伊 9352", distLy:10.74, spectral:"M0.5V 红矮星", planets:2, color:0xffa878, drill:'exo',
        facts:["距地球 10.74 光年","自行较大的红矮星","已报告 2 颗行星","2020 年由径向速度法确认"] },
      { id:"ross128", name:"罗斯 128 Ross 128", distLy:11.03, spectral:"M4V 红矮星", planets:1, color:0xff7a5a, drill:'exo',
        facts:["距地球 11.03 光年","安静的红矮星（耀斑活动低）","Ross 128 b 位于宜居带内","公转周期 9.87 天"],
        system:{ note:"Ross 128 b 质量 ≈1.4 M⊕，接收辐照约地球的 1.38 倍。",
          stars:[{name:"Ross 128",radiusKm:137000,color:0xff7a5a}],
          planets:[{name:"Ross 128 b",aAU:0.0496,periodDays:9.866,radiusRe:1.1,color:0x9fc8a0}] } },
      { id:"teegarden", name:"蒂加登星 Teegarden's Star", distLy:12.50, spectral:"M7V 红矮星", planets:3, color:0xff6a4a, drill:'exo',
        facts:["距地球 12.50 光年","2003 年才被发现（自行大但极暗）","已报告 3 颗地球质量级行星","其中 2 颗位于宜居带"] },
      { id:"kapteyn", name:"卡普坦星 Kapteyn's Star", distLy:12.83, spectral:"M1V 红矮星", planets:0, color:0xffa060, drill:'exo',
        facts:["距地球 12.83 光年","1897 年发现，自行极大","银河系晕族恒星，逆行轨道","曾报告行星候选但后续被证伪"] },
      { id:"gliese581", name:"格利泽 581 Gliese 581", distLy:20.4, spectral:"M3V 红矮星", planets:null, color:0xff8a62, drill:'exo',
        facts:["距地球 20.4 光年","历史上曾报告多达 6 颗行星","多数信号后证实为恒星活动伪影","按 NASA 档案，当前确认行星数存疑"] },
      { id:"vega", name:"织女星 Vega", distLy:25.0, spectral:"A0V 主序星", planets:0, color:0xdbeaff, drill:'exo',
        facts:["距地球 25.0 光年","夜空第五亮星，夏季大三角之一","高速自转（≈ 236 km/s）呈扁球形","有尘埃盘，但无已确认行星"],
        system:{ note:"织女星外围有红外超辐射揭示的尘埃盘；目前无确认行星。",
          stars:[{name:"织女星 Vega",radiusKm:1640000,color:0xdbeaff}], planets:[] } },
      { id:"arcturus", name:"大角星 Arcturus", distLy:36.7, spectral:"K1.5III 红巨星", planets:0, color:0xffc98a, drill:'exo',
        facts:["距地球 36.7 光年","北天最亮星（视星等 −0.05）","已演化为红巨星（半径 ≈ 25 R☉）","目前无已确认行星"] },
      { id:"trappist1", name:"TRAPPIST-1", distLy:40.7, spectral:"M8V 超冷矮星", planets:7, color:0xff7a5a, drill:'exo',
        facts:["距地球 40.7 光年","7 颗类地行星（b–h），2017 年确认","其中 3–4 颗位于宜居带","行星轨道极紧凑，最外仅 0.062 AU"],
        system:{ note:"7 颗行星近共振链，轨道半长轴与周期均为凌星实测值。",
          stars:[{name:"TRAPPIST-1",radiusKm:82800,color:0xff6a4a}],
          planets:[
            {name:"TRAPPIST-1 b",aAU:0.01154,periodDays:1.5109,radiusRe:1.116,color:0xd8a888},
            {name:"TRAPPIST-1 c",aAU:0.01581,periodDays:2.4218,radiusRe:1.056,color:0xc8a090},
            {name:"TRAPPIST-1 d",aAU:0.02227,periodDays:4.0498,radiusRe:0.777,color:0xa8c0b0},
            {name:"TRAPPIST-1 e",aAU:0.02925,periodDays:6.0996,radiusRe:0.920,color:0x8fc8c0},
            {name:"TRAPPIST-1 f",aAU:0.03849,periodDays:9.2067,radiusRe:1.008,color:0x8fb8d8},
            {name:"TRAPPIST-1 g",aAU:0.04683,periodDays:12.3529,radiusRe:1.008,color:0x8fa8d8},
            {name:"TRAPPIST-1 h",aAU:0.06189,periodDays:18.7672,radiusRe:0.715,color:0xa8a8c8}
          ] } },
      { id:"55cnc", name:"巨蟹座 55 / 55 Cancri", distLy:41.0, spectral:"G8V/K0IV + M4V 双星", planets:5, color:0xffe0a8, drill:'exo',
        facts:["距地球 41.0 光年","已确认 5 颗系外行星（b/c/d/e/f）","55 Cnc e 为炽热超级地球（P=0.74 天）","系统另有远距红矮星伴星"],
        system:{ note:"5 颗行星轨道跨度极大（0.015–5.8 AU），本图按真实相对比例绘制。",
          stars:[{name:"55 Cnc A",radiusKm:660000,color:0xffe0a8}],
          planets:[
            {name:"55 Cnc e",aAU:0.01544,periodDays:0.7365,radiusRe:1.88,color:0xffb070},
            {name:"55 Cnc b",aAU:0.1134,periodDays:14.65,radiusRe:11,color:0xd8b088},
            {name:"55 Cnc c",aAU:0.2373,periodDays:44.4,radiusRe:11,color:0xc0b098},
            {name:"55 Cnc f",aAU:0.781,periodDays:260,radiusRe:11,color:0xa8c0b0},
            {name:"55 Cnc d",aAU:5.76,periodDays:5218,radiusRe:11,color:0x9fb0c8}
          ] } },
      { id:"kepler186", name:"开普勒 186 Kepler-186", distLy:579, spectral:"M1V 红矮星", planets:5, color:0xff9a70, drill:'exo',
        facts:["距地球 ≈ 579 光年","5 颗行星由凌星法确认","Kepler-186f 是首颗在宜居带发现的类地大小行星","由 NASA Kepler 任务发现"] },
      { id:"betelgeuse", name:"参宿四 Betelgeuse", distLy:548, spectral:"M1-2Ia 红超巨星", planets:0, color:0xff9d6e, drill:'exo',
        facts:["距地球 ≈ 548 光年","猎户座肩部，半径 ≈ 700–900 R☉","半规则变星，2019–2020 年「大变暗」","演化末期，未来将发生超新星爆发"] },
      { id:"rigel", name:"参宿七 Rigel", distLy:860, spectral:"B8Ia 蓝超巨星", planets:0, color:0xbfd4ff, drill:'exo',
        facts:["距地球 ≈ 860 光年","猎户座足部，视星等 0.13","光度 ≈ 12 万 L☉","实际为多星系统，主星为蓝超巨星"] }
    ]
  },

  // ===== 层级 2：太阳系（恒星系视图）=====
  solarSystem: {
    sun: {
      name: "太阳 Sun", type: "G2V 主序星", radiusKm: 696340, rotationHours: 609.12,
      color: 0xffb733,
      facts: ["光谱型 G2V", "表面温度 ≈ 5778 K", "占系统总质量 99.86%", "赤道自转周期 ≈ 25.4 天"]
    },
    planets: [
      { id:"mercury", name:"水星 Mercury", aAU:0.3871, periodYr:0.2408, radiusKm:2439.7, rotationHours:1407.6, tiltDeg:0.034, inclDeg:7.00, color:0x9c9c9c,
        facts:["距日 0.39 AU","公转 88 天","轨道倾角 7.0°（相对黄道）","无天然卫星"] },
      { id:"venus", name:"金星 Venus", aAU:0.7233, periodYr:0.6152, radiusKm:6051.8, rotationHours:-5832.5, tiltDeg:177.36, inclDeg:3.39, color:0xe6c98f,
        facts:["距日 0.72 AU","公转 225 天","轨道倾角 3.4°","逆向自转（243 天）"] },
      { id:"earth", name:"地球 Earth", aAU:1.0000, periodYr:1.0000, radiusKm:6371.0, rotationHours:23.934, tiltDeg:23.44, inclDeg:0.00, color:0x4a90d9,
        facts:["距日 1.00 AU","公转 365.25 天","轨道倾角 0°（黄道基准）","1 颗卫星（月球）"],
        moons:[
          { id:"moon", name:"月球 Moon", orbitKm:384400, periodDays:27.3217, rotationDays:27.3217, radiusKm:1737.4, color:0xc8c8c8, inclDeg:5.14,
            facts:["距地 38.44 万 km","公转/自转 27.32 天（潮汐锁定）","白道倾角 5.14°（相对黄道）","直径 3474 km"] }
        ] },
      { id:"mars", name:"火星 Mars", aAU:1.5237, periodYr:1.8808, radiusKm:3389.5, rotationHours:24.623, tiltDeg:25.19, inclDeg:1.85, color:0xc1440e,
        facts:["距日 1.52 AU","公转 687 天","轨道倾角 1.85°","2 颗卫星（火卫一/二）"] },
      { id:"jupiter", name:"木星 Jupiter", aAU:5.2026, periodYr:11.862, radiusKm:69911, rotationHours:9.925, tiltDeg:3.13, inclDeg:1.30, color:0xd8a47f,
        facts:["距日 5.20 AU","公转 11.86 年","轨道倾角 1.30°","已知 95+ 颗卫星"] },
      { id:"saturn", name:"土星 Saturn", aAU:9.5549, periodYr:29.457, radiusKm:58232, rotationHours:10.656, tiltDeg:26.73, inclDeg:2.49, color0:0xe3d2a2, color:0xe3d2a2,
        ring:{ innerKm:66900, outerKm:140220 },
        facts:["距日 9.55 AU","公转 29.5 年","轨道倾角 2.49°","壮观行星环（冰+岩）"] },
      { id:"uranus", name:"天王星 Uranus", aAU:19.218, periodYr:84.011, radiusKm:25362, rotationHours:-17.24, tiltDeg:97.77, inclDeg:0.77, color:0x9fe0e6,
        facts:["距日 19.2 AU","公转 84 年","轨道倾角 0.77°","轴倾角 98°（侧躺自转）"] },
      { id:"neptune", name:"海王星 Neptune", aAU:30.110, periodYr:164.79, radiusKm:24622, rotationHours:16.11, tiltDeg:28.32, inclDeg:1.77, color:0x3f63d6,
        facts:["距日 30.1 AU","公转 164.8 年","轨道倾角 1.77°","已知 14+ 颗卫星"] }
    ]
  },

  // 显示用缩放（仅影响视觉大小，不改变系统内轨道真实比例）
  display: {
    planetSizeExp: 0.42,
    planetSizeBase: 0.9,
    auToUnit: 7.0,          // 太阳系：1 AU = 7 场景单位
    kmToUnitMoon: 1/1500,   // 地月系：1 单位 ≈ 1500 km
    mlyToUnit: 160,         // 本星系群：1 百万光年 = 160 场景单位
    mlyToUnitFar: 13,       // 近邻宇宙：1 百万光年 = 13 场景单位（真实线性距离）
    exoOrbitTarget: 62,     // 系外系统：最外层轨道归一化到 62 场景单位（系统内比例真实）
    defaultDaysPerSec: { nearby:0, localgroup:0, galaxy:0, solar:30, exo:1.5, earthmoon:2 }
  }
};
