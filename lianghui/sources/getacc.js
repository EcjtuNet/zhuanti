function get_acc() {

	var domain_url = document.location.toString();
	var fin_domain_url = domain_url.toLowerCase();
	var domain_url_array = fin_domain_url.split("/");
	var fin_domain = domain_url_array[2];
	var acc_default = '860010-2003320000'; 

	var acc_array = {                                   
		'www.qianlong.com'		:	'860010-2003020000',
		'www.21dnn.com'			:	'860010-2003020000',
		'www.beijingnews.com.cn'	:	'860010-2003020000',
		'news.qianlong.com'		:	'860010-2003030000',
		'china.qianlong.com'		:	'860010-2003170000',
		'sports.qianlong.com'		:	'860010-2003040100',
		'bbs.qianlong.com'		:	'860010-2003050000',
		'mil.qianlong.com'		:	'860010-2003060100',
		'mil.21dnn.com'		        :	'860010-2003060100',
		'zgc.qianlong.com'		:	'860010-2003070000',
		'nv.qianlong.com'		:	'860010-2003080100',
		'house.qianlong.com'		:	'860010-2003310000',
		'lianzheng.qianlong.com'	:	'860010-2003290000',
		'world.qianlong.com'	        :	'860010-2003090000',
		'live.qianlong.com'		:	'860010-2003080100',
		'beijing.qianlong.com'		:	'860010-2003101000',
		'life.qianlong.com'		:	'860010-2003110000',
		'fm.qianlong.com'		:	'860010-2003120000',
		'auto.qianlong.com'		:	'860010-2003140000',
		'business.qianlong.com'		:	'860010-2003190000',
		'finance.qianlong.com'		:	'860010-2003180000',
		'tech.qianlong.com'		:	'860010-2003200000',
		'beijingww.qianlong.com'	:	'860010-2003210000',
		'yesee.qianlong.com'		:	'860010-2003220100',
		'www.yesee.com'			:	'860010-2003220100',
		'travel.qianlong.com'		:	'860010-2003230000',
		'edu.qianlong.com'		:	'860010-2003240000',
		'ent.qianlong.com'		:	'860010-2003250100',
		'report.qianlong.com'		:	'860010-2003300000',
		'latestnews.qianlong.com'	:	'860010-2003330000',
		'xmjsy.qianlong.com'		:	'860010-2003270000',
		'chengzhen.qianlong.com'	:	'860010-2003280000',
		'comic.qianlong.com'		:	'860010-2003390200',
		'review.qianlong.com'	        :	'860010-2003340000',
		'review.21dnn.com'	        :	'860010-2003340000',
		'gssd.qianlong.com'	        :	'860010-2003350000',
		'daxing.qianlong.com'	        :	'860010-2003360000',
		'hotwords.qianlong.com'		:	'860010-2003370000',
		'photo.qianlong.com'		:	'860010-2003260000',
		'health.qianlong.com'		:	'860010-2003130000',
		'tv.qianlong.com'		:	'860010-2003400000',
		'english.qianlong.com'		:	'860010-2003410000',
                'sdcsgy.qianlong.com'		:	'860010-2003420000',
                'legal.qianlong.com'		:	'860010-2003430000',
                'hea.qianlong.com'		:	'860010-2003440000',
                '3g.qianlong.com'		:	'860010-2003450100',
                'mi.qianlong.com'		:	'860010-2003450200',
                'mms.qianlong.com'		:	'860010-2003450300',
                'chart.qianlong.com'		:	'860010-2003460000',
		'zhibo.qianlong.com'		:	'860010-2003080100'
	};

	var fin_acc = acc_array[fin_domain];

	if(typeof(fin_acc) == 'undefined' ) {
		fin_acc = acc_default;
	}
	return fin_acc;
}