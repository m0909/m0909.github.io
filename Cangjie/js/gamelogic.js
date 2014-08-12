const BOARD_TOP = 0;
const BOARD_HEIGHT = 200;
const BOARD_BOTTOM = BOARD_TOP + BOARD_HEIGHT;
const BOARD_LEFT = 0;
const BOARD_WIDTH = 1400;
const BOARD_RIGHT = BOARD_LEFT + BOARD_WIDTH;

const CHAIN_TOP = 0;
const CHAIN_HEIGHT = 125;
const CHAIN_BOTTOM = CHAIN_TOP + CHAIN_HEIGHT;
const CHAIN_LEFT = 0;
const CHAIN_WIDTH = BOARD_WIDTH;
const CHAIN_RIGHT = CHAIN_LEFT + CHAIN_WIDTH;

const CHAIN_FONT = "96pt MingLiu";
const CHAIN_FONT_BOTTOM = CHAIN_BOTTOM - 24;

const CHAIN_CHAR_WIDTH_RAW = 128;
const CHAIN_CHAR_WIDTH = 5 + CHAIN_CHAR_WIDTH_RAW;

const CJ_TOP = CHAIN_BOTTOM + 12;
const CJ_HEIGHT = 32;
const CJ_BOTTOM = CJ_TOP + CJ_HEIGHT;
const CJ_LEFT = CHAIN_LEFT;
const CJ_WIDTH = BOARD_WIDTH;
const CJ_RIGHT = CHAIN_RIGHT;

const CJ_FONT = "24pt SimHei";
const CJ_CHAR_WIDTH_RAW = 25;
const CJ_CHAR_WIDTH = 5 + CJ_CHAR_WIDTH_RAW;
const CJ_FONT_BOTTOM = CJ_BOTTOM - 4;

const CANGJIE_MAPPING = "日月金木水火土竹戈十大中一弓人心手口尸廿山女田難卜Z";

var gameState = {context: ""} ;

// if we have local storage, restore the previous settings
if ( typeof(localStorage) !== "undefined") {
	if ( typeof(localStorage["cj.speed"]) !== "undefined" ) {
		document.getElementById("speed").value = localStorage["cj.speed"];
		document.getElementById("numToPlay").value = localStorage["cj.numToPlay"];
		document.getElementById("maxChain").value = localStorage["cj.maxChain"];
	}
}

function gameDriver() {

	var canvas = document.getElementById("gameBoard");
	gameState.context = canvas.getContext("2d");

	//alert("local storage: maxChain=" + localStorage["cj.maxChain"] + " speed=" + localStorage["cj.speed"] + " numToPlay=" + localStorage["cj.numToPlay"]);
	
	document.getElementById("log").innerHTML = "";  
	
	window.addEventListener('keydown', doKeyDown, false);

	gameState.maxChain = document.getElementById("maxChain").value;
	gameState.speed = document.getElementById("speed").value*1000;
	//writeToDebug("speed="+gameState.speed);
	gameState.numToPlay = document.getElementById("numToPlay").value;
	gameState.option = document.getElementById("gameOption").value;
	gameState.status = 0;
	gameState.currentPosition = 0;
	gameState.throughPosition = -1;
	gameState.endPosition = gameState.numToPlay - 1;
	gameState.codesMatched = 0;
	gameState.charList = "";
	gameState.codeList = "";
	gameState.statistics = [];
	gameState.attempts = 0;
	gameState.score = 0;
	gameState.currentStreak = 0;
	gameState.longestStreak = 0;
	gameState.startTime = getCurrentTime();
	
	localStorage["cj.maxChain"] = gameState.maxChain;
	localStorage["cj.speed"] = gameState.speed/1000;
	localStorage["cj.numToPlay"] = gameState.numToPlay;
	
	loadCharacters(gameState);
	clearBoard(gameState);
	addCharacter(gameState);
	showChain(gameState, 2);		// only need to fill the first character as that is all we have at this point
}

function initializeTimer(gameState) {
	gameState.timer = window.setTimeout( function() { doTimer(gameState); }, gameState.speed);  
}

function clearTimer(gameState) {
	if (typeof(gameState.timer) !== "undefined") {
		window.clearTimeout(gameState.timer);
	}
}

function doTimer(gameState) {
	if (addCharacter(gameState)) {
		showChain(gameState, 3);
	}
}

function loadCharacters(gameState) {

	var position;
	var numberToPlay = gameState.numToPlay;
	var randomNum = -1;
	var previous;
	var appearance;
	var maxAllowed;
	var numCharacters;
	var codeList = [];
	
	// use ASCII for codeList to reduce memory consumption and for faster comparison
	
	gameState.showKeys = false;
	gameState.oneKey = false;
	
	switch (gameState.option) {
		case "keyboard":	
			gameState.showKeys = true;
			// do not place a break here -- we want to cascade to the "letters" section
			
		case "letters":	
			codeList = [
				"日A","月B","金C","木D","水E",
				"火F","土G","竹H","戈I","十J",
				"大K","中L","一M","弓N","人O",
				"心P","手Q","口R","尸S","廿T",
				"山U","女V","田W","難X","卜Y"
				];
			
			gameState.oneKey = true;  // in keyboard and letters mode, we use only one key
			
			break;
			
		case "baseForms":
			codeList = [
				"二MM",		"仁OMM",		"仕OJM",		"仙OU",		"仲OL",		"休OD",		"伙OF",		"估OJR",		"佔OYR",		"佳OGG",
				"佺OOMG",	"來DOO",		"侞OVR",		"侳OOOG",	"保ORD",		"倡OAA",		"占YR",		"卡YMY",		"卦GGY",		"古JR",
				"吐RG",		"呆RD",		"咕RJR",		"品RRR",		"坐OOG",		"坦GAM",		"垣GMAM",	"埋GWG",		"天MK",		"奸VMJ",	
				"如VR",		"妹VJD",		"姑VJR",		"娃VGG",		"尿SE",		"居SJR",		"干MJ",		"忐YMP",		"忑MYP",		"或IRM",
				"扣QR",		"找QI",		"拾QOMR",	"旺AMG",		"昌AA",		"明AB",		"未JD",		"本DM",		"杏DR",		"林DD",
				"桂DGG",		"汁EJ",		"汕EU",		"汗EMJ",		"汪EMG",		"沽EJR",		"沾EYR",		"洽EOMR",	"灶FG",		"炎FF",
				"焚DDF",		"王MG",		"竺HMM",		"答HOMR",	"箋HII",		"里WG",		"針CJ",		"釦CR",		"伐OI",		"錢CII",
				"俠OKOO",	"全OMG",		"合OMR",		"圭GG",		"夾KOO",		"娟VRB",		"捐QRB",		"思WP",		"捉QRYO",	"掛QGGY",
				"早AJ",		"晶AAA",		"朋BB",		"杆DMJ",		"旱AMJ",		"桿DAMJ",	"杛DN",		"杜DG",		"查DAM",		"沖EL",
				"注EYG",		"理MGWG",	"矢OK",		"知OKR",		"竿HMJ",		"肚BG",		"舍OMJR",	"足RYO",		"車JWJ",		"但OAM",
				"柱DYG",		"淋EDD",		"余OMD",		"午OH",		"卒YOOJ",	"吝YKR",		"在KLG",		"屠SJKA"
				];
			break;
			
		case "derivedStrokes":
			codeList = [
				"亡YV",		"介OLL",		"仗OJK",		"仟OHJ",		"仸OHK",		"任OHG",		"企OYLM",	"伏OIK",		"伯OHA",		"伷OLW",
				"伸OLWL",	"佑OKR",		"佖OPH",		"佛OLLN",	"弗LLN",		"佸OHJR",	"沸ELLN",	"活OHJR",	"括QHJR",	"吏JLK",
				"使OJLK",	"侏OHJD",	"朱HJD",		"珠MGHJD",	"呂RHR",		"侶ORHR",	"俰OHDR",	"和HDR",		"入OH",		"八HO",
				"千HJ",		"吠EIK",		"呈RHG",		"程HDRHG",	"呎RSO",		"伬OSO",		"呑HKR",		"哭RRIK",	"圳GLLL",	"川LLL",
				"址GYLM",	"扯QYLM",	"止YLM",		"沚EYLM",	"太KI",		"夭HK",		"尺SO",		"引NL",		"往HOYG",	"必PH",
				"泌EPH",		"戊IH",		"戌IHM",		"戍IHI",		"戎IJ",		"我HQI",		"拍QHA",		"泊EHA",		"白HA",		"有KB",
				"杉DHHH",	"彬DDHHH",	"杊DLLL",	"正MYLM",	"油RLA",		"抽QLW",		"鈾CLW",		"泉HAE",		"灰KF",		"玟MGYK",
				"汶EYK",		"由LW",		"甲WL",		"㳌EWL",		"申LWL",		"坤GLWL",	"界WOLL",	"禾HD",		"秋HDF",		"秘HDPH",
				"笛HLW",		"者JKA",		"舌HJR",		"香HDA",		"冰IME",		"犬IK",		"史LK",		"使OJLK",	"吏JLK",		"更MLWK",
				"右RO",		"佑OKR"
				];	
			break;	
				
		case "derivedHooks":
			// N, S, P, U, B, K
			codeList = [
				"了NN",		"予NINN",	"亢YHN",		"吭RYHN",	"伉OYHN",	"抗QYHN",	"沆EYHN",	"坑GYHN",	"炕FYHN",	"亨YRNN",
				"九KN",		"仇OKN",		"仍ONHS",	"奶VNHS",	"乃NHS",		"刀SH",		"刃SHI",		"仞OSHI",	"代OIP",		"方YHS",
				"仿OYHS",	"坊GYHS",	"勿PHH",		"物HQPHH",	"吻RPHH",	"司SMR",		"伺OSMR",	"伽OKSR",	"枷DKSR",	"加KSR",
				"布KLB",		"佈OKLB",	"可MNR",		"何OMNR",	"河EMNR",	"抲QMNB",	"呵RMNR",	"先HGHU",	"兄RHU",		"內OB",
				"再MGB",		"凡HNI",		"帆LNHNI",	"汎EHNI",	"刁SM",		"刊MJLN",	"利HDLN",	"勺PI",		"灼FPI",		"匀PIM",
				"均GPIM",	"包PRU",		"抱QPRU",	"泡EPRU",	"炮FPRU",	"匆PKK",		"句PR",		"拘QPR",		"枸DPR",		"另RKS",
				"丁MN",		"叮RMN",		"汀EMN",		"釘CMN",		"吃RON",		"乞ON",		"屹UON",		"同BMR",		"桐DBMR",	"洞EBMR",
				"向HBR",		"周BGR",		"惆PBGR",	"凋IMBGR",	"城GIHS",	"成IHS",		"奇KMNR",	"妨VYHS",	"彷HOYHS",	"打QMN",
				"行HOMMN",	"柯DMNR",	"召SHR",		"招QSHR",	"沼ESHR",	"昭ASHR",	"欠NO",		"吹RNO",		"次IMNO",	"炊FNO",
				"氹NE",		"丸KNI",		"男WKS",		"町WMN",		"疋NYO",		"肋BKS",		"肌BHN",		"肪BYHS",	"衍HOEMN",	"角NBG",
				"㫬APA",		"倜OBGR",	"巴AU",		"吧RAU",		"把QAU",		"邑RAU",		"軍BJWJ",	"今OIN",		"令OINI",	"吟ROIN",
				"妗VOIN",	"含OINR",	"𢃑LBAA",	"帕LBHA",	"帖LBYR",	"巾LB",
				"狗KHPR",	"猖KHAA",	"狂KHMG",	"狄KHF",		"犯KHSU",	"狗KHPR"
				];
			break;
			
		case "derivedShapes1":
			// S, B, U, W, P, D, T, J, C
			codeList = [
				"巨SS",		"匡SMG",		"炬FSS",		"佢OSS",		"回WR",		"國WIRM",	"囚WO",		"因WK",		"困WD",		"凶UK",
				"兇UKHU",	"區SRRR",	"匧SKOO",	"央LBK",		"泱ELBK",	"映ALBK",	"目BU",		"且BM",		"咀RBM",		"伹OBM",
				"框DSMG",	"臣SLSL",	"鉅CSS",		"君SKR",		"尹SK",		"伊OSK",		"宭JSKR",	"𡝗VSKR",
				"己SU",		"妃VSU",		"杞DSU",		"忌SUP",
				"比PP",		"化OP",		"指QPA",		"脂BPA",		"皆PPHA",	"昆APP",		"棍DAPP",	"混EAPP",	"錕CAPP",	"才DH",
				"材DDH",		"寸DI",		"村DDI",		"付ODI",		"吋RDI",		"也PD",		"他OPD",		"池EPD",		"拖QOPD",	"子ND",
				"仔OND",		"李DND",		"孖NDND",	"于MD",		"咐RODI",	"批QPP",		"享YRND",	"芋TMD",		"字JND",		"五MDM",
				"伍OMDM",	"好VND",
				"草TAJ",		"萌TAB",		"芭TAU",		"苦TJR",		"茄TKSR",	"芥TOLL",	"芷TYLM",	"定JMYO",
				"卉JT",		"奔KJT",		"荳TMRT",	"豆MRT",		"井TT",		"并TT",		"刑MTLN",	"拼QTT",		"併OTT",		"屏STT",
				"宣JMAM",	"宜JBM",		"官JRLR",	"宮JRHR",	"笑HHK",		"答HOMR",	"笪HAM",		"竺HMM",		
				"扒QC",		"只RC",		"兌CRHU",	"交YCK",		"六YC",		"谷COR",		"俗OCOR",	"分CSH",		"扮QCSH",	"汾ECSH",
				"它JP",		"佗OJP",		"柁DJP",		"沱EJP",		"老JKP",		"佬OJKP",	"姥VJKP",	"尼SP",		"妮VSP",		"呢RSP",
				"泥ESP",		
				"寺GDI",		"侍OGDI",	"待HOGDI",
				"特HQGDI",	"時AGDI",
				"乍OS",		"作OOS",		"昨AOS",		"炸FOS",		"耳SJ",		"茸TSJ",		
				"究JCKN",	"𥥑JCDM",	"窐JCGG",	"窄JCOS"
				];
			break;
			
		case "derivedShapes2":
			// L, Q, I, J, F, N, E
			codeList = [
				"書LGA",		"聿LQ",		"律HOLQ",	"津ELQ",		"牛HQ",		"物HQPHH",	"生HQM",		"姓VHQM",	"件OHQ",		"牡HQG",
				"筆HLQ",		"晝LGAM",	"畫LGWM",	"夫QO",		"伕OQO",		"扶QQO",		"春QKA",		"奏QKHK",	"秦QKHD",	
				"用BQ",		"佣OBQ",		"甬NIBQ",	"羊TQ",		"洋ETQ",		"咩RYQ",		"耕QDTT",	"青QMB",		"倩OQMB",	"清EQMB",
				"初LSH",		"袒LAM",		"裕LCOR",	"被LDHE",	"褂LGGY",
				"舛NIQ",		"韋DMRQ",	
				
				"台IR",		"怡PIR",		"佁OIR",		"始VIR",		"抬QIR",		"允IHU",		"充YIHU",	"至MIG",		"姪VMIG",	"侄OMIG",	
				
				"庫IJWJ",	"廂IDBU",	"府IODI",	"唐ILR",		"塘GILR",	"糖FDILR",
				
				"半FQ",		"伴OFQ",		"拌QFQ",
				"尖FK",		"少FH",		"妙VFH",		"抄QFH",		"炒FFH",		"吵RFH",		"劣FHKS",	"平MFJ",		"坪GMFJ",	"抨QMFJ",
				"泙EMFJ",	"示MMF",		"京YRF",		"掠QYRF",	"涼EYRF",	"否MFR",		"娝VMFR",	"俖OMFR",	
				"肖FB",		"俏OFB",		"梢DFB",		"消EFB",		"筲HFB",		"米FD",		"精FDQMB",	
				
				"名NIR",		"銘CNIR",	"夕NI",		"汐ENI",		"多NINI",	"外NIY",		"久NO",		"玖MGNO",	"畝YWNO",
				"欠NO",		"炊FNO",		"次IMNO",	
				
				"洛EHER",	"各HER",		"格DHER",	"略WHER",	"胳BHER",	"奴VE",		"努VEKS",	"弩VEN",		"帑VELB",	
				"伇OHNE",	"投QHNE",	"及NHE",		"汲ENHE",	"吸RNHE",	"支JE",		"枝DJE",		"技QJE",		
				"叉EI",		"友KE",		"皮DHE",		"柀DDHE",	"波EDHE",	"披QDHE",	"取SJE",
				"泰QKE",		"隶LE",		"𡝯VLE"
				];
			break;
			
		case "derivedShapes3":
			// A B G H K M O R V Y 
			codeList = [
				"反HE",		"坂GHE",		"汳EHE",		"斤HML",		"折QHML",	"芹THML",	"斥HMY",		"拆QHMY",
				"斧CKHML",	
				
				"厄MSU",		"危NMSU",	"厚MAND",	"厘MWG",		"原MHAF",	"昃AMO",		"辰MMMV",	
				"元MMU",		"完JMMU",	"妧VMMU",	"石MR",		"岩UMR",		"宕JMR",		"硑MRTT",	"硼MRBB",	"𥑍MRFQ",
				"百MA",		"佰OMA",		"栢DMA",		"頁MBUC",	"而MBLL",	
				"貢MBUC",	"空JCM",		"腔BJCM",	"倥OJCM",
				
				"病KMOB",	"痕KAV",		"疲KDHE",	
				
				"采BD",		"彩BDHHH",	"菜TBD",		"炙BF",		"𣶋EBF",
				
				"退YAV",		"返YHE",		"近YHML",	"逍YFB",		"速YDL",		"迪YLW",
				"冬HEY",		"寒JTCY",	"斗YJ",

				"衣YHV",		"依OYHV",	"畏WMV",		"喂RWMV",	"偎OWMV",	"良IAV",		"娘VIAV",	"浪EIAV",	"粮FDIAV",
				"根DAV",		"很HOAV",	"銀CAV",		"衷YLHV",	"哀YRHV",	"長SMV",		"張NSMV",	"帳LBSMV",	"倀OSMV",		
				"以VIO",		"似OVIO",	"亡YV",		"忘YVP",		"芒TYV",		"杧DYV",		"忙PYV"
				];
			break;
			
		case "composite":
			//
			codeList = [
				"門AN",		"間ANA",		"開ANMT",	"閉ANHD",	"問ANR",		"閣ANHER",	"們OAN",		"澗EANA",	
				"阿NLMNR",	"陌NLMA",	"限NLAV",	"阻NLBM",	"耶SJNL",	"阪NLHE",	"除NLOMD",	"阮NLMMU",
				"鬥LN",		"鬧LNYLB",
				"隻OGE",		"進YOG",		"崔UOG",		"售OGR",		"集OGD",		"錐COG",		"淮EOG",		"焦OGF",
				"幾VIHI",	"畿VIW",		
				"虎YPHU",	"膚YPWB",	"慮YOWP",	"虔YPYK",
				"贏YNBUC",	"嬴YNV"	
				];
			break;
			
		case "difficult":
			codeList = [
				"肅LX",		"蕭TLX",		"簫HLX",		"鏽CLX",		
				"臼HX",		"兒HXHU",	"舅HXWKS",	
				"兼TXC",		"傔OTXC",	"溓ETXC",	"廉ITXC",
				"身HXH",		
				"慶IXE",		"鹿IXP",		
				"姊VLXH",	
				"淵ELXL",	
				"齊YX",		"擠QYX",		"儕OYX",		"濟EYX"
				];
			break;
			
		case "skippedLeft":
			codeList = [
				"討YRDI",	"訣YRDK",	"話YRHJR",	
				"紅VFM",		"組VFBM",	"綃VFFB",	"結VFGR",	"細VFW",		"紹VFSHR",
				"鄧NTNL",	"鄭YKNL",	"鄺ICNL",	"雅MHOG",	"雖RIOG",	"雞BKOG",
				"韶YASHR",	
				"建NKLQ",	"㢠NKBR",	"廷NKHG",	"廼NKMCW",
				"缺OUDK",	"缸OUM",		"缷OUSL",			
				"放YSOK",	"族YSOOK",	"於YSOY",
				"難TOOG",	"艱TOAV",	"歎TONO",	"彭GTHHH",	"彰YJHHH",	"朝JJB",
				"軸JJLW",	"軚JJKI",	"影AFHHH",	"戟JJI",		"戰RJI",		"戲YTI",		"獻YBIK",	"劃LMLN",	"剷YMLN",
				"數LVOK",	"敦YDOK",	"斂OOOK",	"斬JJHML",	"新YDHML",	"朗IIB",		
				"蝶LIPTD",	"蝴LIJRB",	"蝠LIMRW",
				"貓BHTW",	"豹BHPI",	
				"賂BCHER",	"貼BCYR",	"賠BCYTR",	"賊BCIJ",	"販BCHE",	"賤BCII",
				"趴RMC",		"路RMHER",	"跌RMHQO",	"跋RMIKK",	"跟RMAV",	"蹈RMBHX",
				"鞋TJGG",	"靶TJAU",	"靴TJOP",
				"默WFIK",	"點WFYR",	"黯WFYTA",
				"飲OINO",	"餒OIBV",	"飼OISMR",	"餛OIAPP",	"飽OIPRU",	"飯OIHE",
				"齦YUAV",	"齟YUBM",	"齣YUPR",
				"鯛NFBGR",	"鯖NFQMB",	"鮮NFTQ",
				"期TCB",		"欺TCNO",	"斯TCHML"
				];
			break;
		
		case "skippedRight12L":
			codeList = [
				"悴PTOJ",	"猝KHYOJ",	"摔QYIJ",	"陽NLAMH",	"湯EAMH",	"瀉EJHF",	"濶EANR",	"擱QANR",	"壤GYRV",	"嚷RYRV",	"憶PYTP",	"億OYTP",
				"淚EHSK",	"捩QHSK",	"流EYIU",	"梳DYIU",	"隊NLTPO",	"遂YTPO",	"錄CVNE",	"碌MRVNE",	"侵OSME",	"浸ESME",	"慢PAWE",	"漫EAWE",
				"攝QSJJ",	"灄ESJJ",	"揮QBJJ",	"渾EBJJ",	"倀OSMV",	"張NSMV",	"幌LBAFU",	"㨪QAFU",	"提QAMO",	"堤GAMO",	"槍DOIR",	"滄EOIR",
				"灌ETRG",	"權DTRG",	"債OQMC",	"積HDQMC",	"搖QBOU",	"𡏟GBOU",	"楓DHNI",	"瘋KHNI",	"透YHDS",	"銹CHDS",	"榕DJCR",	"溶EJCR",
				"信OYMR",	"這YYMR",	"源EMHF",	"㷧FMHF",	"儈OOMA",	"膾BOMA",	"鐲CWLI",	"濁EWLI",	"像ONAO",	"橡DNAO",	"撫QOTF",	"嫵VOTF",
				"檔DFBW",	"擋QFBW",	"樺DTMJ",	"嬅VTMJ",	"潑ENOE",	"撥QNOE",	"媽VSQF",	"馮IMSQF",	"徑HOMVM",	"脛BMVM",	"懷PYWV",	"壞GYWV",
				"填GJBC",	"鎮CJBC",	"植DJBM",	"值OJBM",	"儀OTGI",	"㩘QTGI",	"援QBME",	"媛VBME",	"灑EMMP",	"曬AMMP",	"擇QWLJ",	"澤EWLJ",
				"聆SJOII",	"鈴COII",	"環MGWLV",	"還YWLV",	"埗GYLH",	"涉EYLH",	"晚ANAU",	"娩VNAU",	"涕ECNH",	"梯DCNH",	"獲KHTOE",	"鑊CTOE",
				"傷OOAH",	"演EJMC",	"侯ONMK",	"悸PHDD",	"樁DQKX",	"瞎BUJQR",	"濠EYRO",	"惘PBTV",	"煩FMBC",	"償OFBC",	"偽OIKF",	"鑼CWLG",
				"侵OSME",	"浸ESME"
				];
			break;
			
		case "skippedRight1LL":
			codeList = [
				"梧DMMR",	"晤AMMR", 	"潭EMWJ",	"㜤VMWG",	"滂EYBS",	"磅MRYBS",	"傳OJII",	"磚MRJII",	"憾PIRP",	"撼QIRP",	"獨KHWLI",	"鐲CWLI",
				"聯SJVIT",	"關ANVIT",	"鐘CYTG",	"瞳BUYTG",	"噁RMMP",	"𣽏EMMP",	"偉ODMQ",	"暐ADMQ",	"鏡CYTU",	"境GYTU",	"鑽CHUC",	"灒EHUC",
				"播QHDW",	"潘EHDW",	"濯ESMG",	"曜ASMG",	"擾QMBE",	"優OMBE",	"熾FYIA",	"職SJYIA",	"檻DSIT",	"鑑CSIT",
				"揹QLPB",	"灣EVFN",	"攪QHBU",	
				];
			break;
				
		//case "skippedTopBottom":
		//	codeList = [
		//		"學HBND",	"舋HBBM",	"擎TKQ",		"擊JEQ",		"繁OKVIF",	"絮VRVIF",	"黎HHOE",	"戀VFP",		"變VFOK",	
				
		case "skippedInnerFrame":
			codeList = [
				"解NBSHQ",	"亂BBU",		"勵MBKS",	"嫦VFBB",	"喼RNSP",	"煙FMWG",
				"搞QYRB",	"敲YBYR",	"骼BBHER",	"骯BBYHN",	"敵YBOK",	"適YYCB",	"殘MNII",	"列MNLN",	"醋MWTA",	"酒EMCW",	"構DTTB",	"溝ETTB",
				"僧OCWA",	"增GCWA",	"鏗CSEG",	"慳PSEG",	"慢PAWN",	"漫EAWE",	"惱PVVW",	"腦BVVW",	"漂EMWF",	"標DMWF",	"傅OIBI",	"搏QIBI",
				"融MBLMI",	"隔NLMRB",	"夠NNPR",	"侈ONIN",	"璃MGYUB",	"漓EYUB",	"捕QIJB",	"鋪CIJB",	"倫OOMB",	"淪EOMB",	"欖DSWU",	"攬QSWU",	
				"嫡VYCB",	"適YYCB",	"遇YWLB",	"偶OWLB",	"澳EHBK",	"襖LHBK"	,	"錦CHAB",	"棉DHAB",	"涌ENIB",	"桶DNIB",	"橋DHKB",	"嬌VHKB",
				"偏OHSB",	"遍YHSB",	"渴EAPV",	"揭QAPV",	"滿ETLB",	"瞞BUTLB",	"樽DTWI",	"澊ETWI",	"濔EMFB",	"彌NMFB",
				"幫GIHAB",	
				"雲MBMMI",	"雷MBW",				
				];
			break;
			
		case "whole":
			codeList = [
				"甚TMMV",	"州ILIL",	"與HXYC",	"興HXBC",	"鳥HAYF",	"爽KKKK",	"爾MFBK",	"雨MLBY",	"兩MLBO",	"亞MLLM",	"哥MRNR",	"象NAPO",
				"島HAYU",	"凸BSS",		"凹SSU",		"乘HDLP",	"乖HJLP",	"焉MYLF",	"業TCTD",	"叢TCTE",	"幽UVII",	
				"洲EILL",	"堪GTMV",	"嶼UHXC",	"鳴RHAF",	"濔EMFB",	"倆OMLB",	"啞RMLM",	"歌MRNO",	"像ONAO",	"搗QHAU",	"剩HPLN"
				];
			break;
			
		case "threeParts":
			codeList = [
				"樹DGTI",	"廚IGTI",	"灘ETOG",	"攤QTOG",	"柳DHHL",	"聊SJHHL",	"邀YHSK",	"竅JCHSK",	"衍HOEMN",	"衡HONKN",	"漸EJJL",	"慚PJJL",	
				"挺QNKG",	"庭INKG",	"撤QYBK",	"澈EYBK",	"擬QPKO",	"礙MRPKO",	"潮EJJB",	"廟IJJB",	"避YSRJ",	"壀GSRJ",	
				"攏QYBP",	"朧BYBP",	"游EYSD",	"遊YYSD",	"淑EYFE",	"椒DYFE",	"淅EDHL",	"晰ADHL",	"橄DMJK",	"瞰BUMJK",	"懈PNBQ",	"邂YNBQ",
				"概DAIU",	"溉EAIU",	"枊DHVL",	"仰OHVL",	
				"撇QFBK",	"撻QYGQ",	"搬QHYE",	"漲ENSV",	"椰DSJL",	"儲OYRA",	"涮ESBN",	"徵HOUGK",	"撕QTCL",	"溯ETUB",
				"露MBRMR",	"鏴CRMR"
			];
			break;
		
	}
	
	numCharacters = codeList.length;
	maxAllowed = Math.ceil(numberToPlay/numCharacters)
	
	gameState.charList = [];
	gameState.codeList = [];
	appearance = [];
	
	for ( position=0; position < numCharacters; position++) {
		appearance[position] = 0;
	}
	
	for ( position=0; position < numberToPlay; position++ ) {
		do {
			randomNum = parseInt(Math.random() * numCharacters);
			if (randomNum == numCharacters) {
				randomNum = numCharacters-1;
			}
		} while (previous == randomNum || appearance[randomNum] == maxAllowed );	//don't allow immediate duplicate or if the character has been used more than max allowed
		
		gameState.charList[position] = codeList[randomNum].substring(0,1);
		gameState.codeList[position] = codeList[randomNum].substring(1);
		
		// for the keyboard practice, show the same character three times in a row
		if ( gameState.option == "keyboard" ) {
			var needChar = codeList[randomNum].substring(1);
			gameState.codeList[position] = needChar.concat(needChar, needChar) // three copies
		}
		previous = randomNum;
		appearance[randomNum]++;
	}
	
}

function addCharacter(gameState) {

	//alert("timer=" + gameState.timer);
	
	clearTimer(gameState);
	
	
	if ( gameState.throughPosition == gameState.endPosition ) {
		return true;
	}
	
	gameState.throughPosition++;
	
	//var currentTime = Date.now();
	//writeToDebug(currentTime/1000 + gameState.charList[gameState.throughPosition]);
	
	if ( gameState.throughPosition - gameState.currentPosition == gameState.maxChain ) {
		gameState.status = -1;  //lost
		terminateGame(gameState, false);
		return false;
	}
	
	// set a new timer
	initializeTimer(gameState);
	return true;
}

function clearBoard(gameState, color) {

    if( typeof(color) === "undefined" ) {
		color = "white";
	}
	
	gameState.context.fillStyle = color;
	gameState.context.fillRect(BOARD_LEFT, BOARD_TOP, BOARD_WIDTH, BOARD_HEIGHT);
}

function terminateGame(gameState, isGameWon) {
	var color;
	var message;
    var timeElapsed;
	
	showNumberLeft(gameState);
	timeElapsed = (getCurrentTime() - gameState.startTime) / 60;
	document.getElementById("typingSpeed").innerHTML = Math.round(gameState.throughPosition / timeElapsed);

	clearTimer(gameState);
	window.removeEventListener('keydown', doKeyDown, false);	
		
	if ( isGameWon == 1 ) {
		color = "green";
		message = "恭喜\uFF01你贏了\uFF01";
	}
	else {
		color = "black";
		message = "對不起\uFF0C你輸了\u3002";
	}
	
	clearBoard(gameState, color);
	gameState.context.fillStyle = "white";
	gameState.context.font = CHAIN_FONT;
	gameState.context.fillText(message, CHAIN_LEFT, CHAIN_FONT_BOTTOM);

}


/* option = 1 	fill all
			2	fill first only
			3 	fill last only
*/
function showChain(gameState, option) {
	
	if ( option == 1 || option == 2 ) {
		var greenHeight = 0;
		if ( !gameState.oneKey ) {
			greenHeight = ( gameState.codesMatched / gameState.codeList[gameState.currentPosition].length ) * CHAIN_HEIGHT;
		}
		
		if ( greenHeight != 0 ) {
				gameState.context.fillStyle = "green";
				gameState.context.fillRect(CHAIN_LEFT, CHAIN_TOP, CHAIN_CHAR_WIDTH_RAW, greenHeight);
		}

		gameState.context.fillStyle = "#EEEEEE";
		gameState.context.fillRect(CHAIN_LEFT, greenHeight, CHAIN_CHAR_WIDTH_RAW, CHAIN_HEIGHT - greenHeight);

		if ( gameState.showKeys ) {
			gameState.context.fillStyle = "#8F8F8F";
			gameState.context.font = "16pt Monospace";
			gameState.context.fillText(gameState.codeList[gameState.currentPosition][0], CHAIN_LEFT + CHAIN_CHAR_WIDTH_RAW - 14, CHAIN_BOTTOM - 4);
			gameState.context.font = "84pt MingLiu";
			gameState.context.fillStyle = "black";
			gameState.context.fillText(gameState.charList[gameState.currentPosition], CHAIN_LEFT, CHAIN_FONT_BOTTOM - 8);	
		}
		else {
			gameState.context.font = CHAIN_FONT;
			gameState.context.fillStyle = "black";
			gameState.context.fillText(gameState.charList[gameState.currentPosition], CHAIN_LEFT, CHAIN_FONT_BOTTOM);	
		}
		
		showNumberLeft(gameState);
	}
	
	if ( option == 1 ) {
		var relativePosition = 1;
		for ( var position = gameState.currentPosition+1; position < gameState.throughPosition; position++ ) {
			gameState.context.font = CHAIN_FONT;
			gameState.context.fillStyle= "black";
			gameState.context.fillText(gameState.charList[position], CHAIN_LEFT + (relativePosition * CHAIN_CHAR_WIDTH), CHAIN_FONT_BOTTOM);
			relativePosition++;
		}
	}

	if ( ( option == 1 || option == 3 ) ) {
		var relativePosition = gameState.throughPosition - gameState.currentPosition;
		if ( relativePosition != 0 ) {
			gameState.context.font = CHAIN_FONT;
			gameState.context.fillStyle= "black";
			gameState.context.fillText(gameState.charList[gameState.throughPosition], CHAIN_LEFT + relativePosition * CHAIN_CHAR_WIDTH, CHAIN_FONT_BOTTOM);
		}
	}
}

function showCangjie(cangjieCode, position, match) {

	var left;

	if ( typeof(position) === "undefined" ) {
		position = 1;
	}
	
	left = CJ_LEFT + (position - 1) * CJ_CHAR_WIDTH;
	
	gameState.context.fillStyle = "white";
	gameState.context.fillRect(left, CJ_TOP, CJ_CHAR_WIDTH, CJ_HEIGHT);
	
	if ( typeof(cangjieCode) === "undefined" ) {
		return;
	}
	
	if ( match ) {
		gameState.context.fillStyle = "green";
	}
	else {
		gameState.context.fillStyle = "red";
	}
	gameState.context.font = CJ_FONT;
	gameState.context.fillText(cangjieCode, left, CJ_FONT_BOTTOM);
}

function clearCangjie(gameState) {
	gameState.codesMatched = 0;
	showCangjie();
	showChain(gameState, 2);
}

function showNumberLeft(gameState) {
	document.getElementById("characterCounter").innerHTML = gameState.numToPlay;
}

function doKeyDown(e) {

	var inputCangjieCode;
	var isMatched = 0;

	if ( e.keyCode == 27 ) { // escape 
		clearCangjie(gameState);
		return;
	}
		
	inputCangjieCode = getCangjieCode(e.keyCode);
	
	if ( inputCangjieCode != "" ) {
		gameState.attempts++;
		isMatched = (gameState.codeList[gameState.currentPosition][gameState.codesMatched] == String.fromCharCode(e.keyCode) );
		showCangjie(inputCangjieCode, gameState.codesMatched+1, isMatched);
		if ( isMatched ) {
			gameState.codesMatched++;
			if ( gameState.codesMatched == gameState.codeList[gameState.currentPosition].length ) {

				gameState.numToPlay--;
				
				var score = Math.round(100 * gameState.codesMatched / gameState.attempts);
				gameState.attempts = 0;
				gameState.score += score;
				if ( score == 100 ) {
					gameState.currentStreak++;
				}
				if ( gameState.longestStreak < gameState.currentStreak) {
						gameState.longestStreak = gameState.currentStreak;
				}
				if ( score != 100 ) {
					gameState.currentStreak = 0;
				}
				
				displayStatistics(gameState);
				
				if ( gameState.currentPosition == ( gameState.endPosition ) ) {
					gameState.status = 1;  //won!
					terminateGame(gameState, true);
					return;
				}
							
				//writeToDebug("Entered=" + inputCangjieCode + "  Current=" + gameState.currentPosition + " through=" + gameState.throughPosition);
				if ( gameState.currentPosition != gameState.throughPosition || addCharacter(gameState) ) {
					// get a character only if we have no more outstanding characters
				
					gameState.codesMatched = 0;
					gameState.currentPosition++;
					
					clearBoard(gameState);
					showChain(gameState, 1);
				}
			}
			else {
				showChain(gameState, 2);
			}
		}
	}
}

function getCangjieCode(codeValue) {

	if ( codeValue > 96) {
		codeValue = codeValue - 32;
	}

	if ( codeValue >= 65 && codeValue <=90 ) {
		return CANGJIE_MAPPING[codeValue-65];
	}

	return '';
}

function writeToDebug(text) {
	document.getElementById("log").innerHTML = document.getElementById("log").innerHTML + text + "<br/>"
}

function getCurrentTime() {
	return new Date().getTime() / 1000;
}

function displayStatistics(gameState) {
	document.getElementById("score").innerHTML = gameState.score;
	document.getElementById("currentStreak").innerHTML = gameState.currentStreak;
	document.getElementById("longestStreak").innerHTML = gameState.longestStreak;
}