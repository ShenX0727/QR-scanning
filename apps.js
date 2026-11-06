const APP_DATA = `
微信|#07c160|weixin.qq.com wx.qq.com u.wechat.com wx.tenpay.com mp.weixin.qq.com wechat.com
企业微信|#2b7ce9|work.weixin.qq.com wecom.work
QQ|#12b7f5|qm.qq.com im.qq.com ti.qq.com connect.qq.com
QQ 音乐|#31c27c|y.qq.com
腾讯视频|#ff6a00|v.qq.com
腾讯文档|#1e6fff|docs.qq.com
腾讯会议|#006eff|meeting.tencent.com voovmeeting.com
腾讯地图|#3f7ff6|map.qq.com
腾讯课堂|#23b8ff|ke.qq.com
腾讯网|#1479d7|qq.com tencent.com
支付宝|#1677ff|alipay.com alipay.cn
淘宝|#ff5000|taobao.com tb.cn
天猫|#ff0036|tmall.com tmall.hk
闲鱼|#ffda00|goofish.com 2.taobao.com
飞猪|#ffc900|fliggy.com
饿了么|#0097ff|ele.me
高德地图|#2b85ff|amap.com gaode.com
夸克|#4b5fff|quark.cn
UC 浏览器|#ff7a00|uc.cn
优酷|#1ebeff|youku.com
钉钉|#3296fa|dingtalk.com
阿里云盘|#637dff|aliyundrive.com alipan.com
阿里云|#ff6a00|aliyun.com alibabacloud.com
1688|#ff6000|1688.com
京东|#e1251b|jd.com 3.cn jd.hk
拼多多|#e02e24|yangkeduo.com pinduoduo.com
抖音|#161823|douyin.com iesdouyin.com
今日头条|#f04142|toutiao.com
西瓜视频|#fe2c55|ixigua.com
番茄小说|#fa6725|fanqienovel.com
飞书|#3370ff|feishu.cn larksuite.com
剪映|#000000|capcut.cn jianying.com
CapCut|#000000|capcut.com
快手|#ff4906|kuaishou.com chenzhongtech.com gifshow.com
哔哩哔哩|#fb7299|bilibili.com b23.tv
小红书|#ff2442|xiaohongshu.com xhslink.com
微博|#e6162d|weibo.com weibo.cn
知乎|#1772f6|zhihu.com
豆瓣|#00b51d|douban.com
百度|#2932e1|baidu.com
百度网盘|#06a7ff|pan.baidu.com
百度地图|#3385ff|map.baidu.com
百度贴吧|#3385ff|tieba.baidu.com
文心一言|#4e6ef2|yiyan.baidu.com
网易云音乐|#e60026|music.163.com 163cn.tv
网易邮箱|#c9272f|mail.163.com mail.126.com
网易|#d7000f|163.com 126.com
酷狗音乐|#2ca2f9|kugou.com
酷我音乐|#ffd200|kuwo.cn
喜马拉雅|#f86442|ximalaya.com
小宇宙|#25c5f5|xiaoyuzhoufm.com
爱奇艺|#00be06|iqiyi.com iq.com
芒果 TV|#ff5f00|mgtv.com
虎牙|#ffa200|huya.com
斗鱼|#ff7700|douyu.com
美团|#ffc300|meituan.com
大众点评|#ff6633|dianping.com
携程|#287dfa|ctrip.com
Trip.com|#287dfa|trip.com
去哪儿|#00bcd4|qunar.com
同程旅行|#00c3a5|ly.com
12306|#3b7cdd|12306.cn
滴滴出行|#ff7d41|didiglobal.com xiaojukeji.com didichuxing.com
哈啰|#0080ff|hellobike.com
得物|#000000|dewu.com poizon.com
唯品会|#f10180|vip.com
苏宁易购|#ffaa00|suning.com
什么值得买|#e62828|smzdm.com
小米|#ff6900|mi.com xiaomi.com
华为|#cf0a2c|huawei.com vmall.com
荣耀|#0a0a0a|hihonor.com
OPPO|#046a38|oppo.com
vivo|#415fff|vivo.com vivo.com.cn
一加|#eb0029|oneplus.com
即刻|#ffe411|okjike.com
虎扑|#c60100|hupu.com
懂车帝|#ffcc00|dongchedi.com
汽车之家|#2f7cf6|autohome.com.cn
链家|#00ae66|lianjia.com
贝壳找房|#3072f6|ke.com
58 同城|#ff552e|58.com
BOSS 直聘|#00bebd|zhipin.com
猎聘|#ff6e00|liepin.com
拉勾|#00b38a|lagou.com
脉脉|#3c7dff|maimai.cn
Keep|#584f60|gotokeep.com keep.com
学习通|#e60012|chaoxing.com
中国大学 MOOC|#2b8af0|icourse163.org
石墨文档|#2a2a2a|shimo.im
语雀|#00b96b|yuque.com
金山文档|#2a73ff|kdocs.cn
WPS|#e8473a|wps.cn wps.com
坚果云|#1f8ff0|jianguoyun.com
123 云盘|#3b82f6|123pan.com 123pan.cn
蓝奏云|#3d7eff|lanzou.com lanzoui.com lanzoux.com lanzouw.com lanzoul.com
CSDN|#fc5531|csdn.net
掘金|#1e80ff|juejin.cn
Gitee|#c71d23|gitee.com
少数派|#d71a1b|sspai.com
酷安|#11b66d|coolapk.com
美图秀秀|#ff3a6e|meitu.com
Soul|#25d4d0|soulapp.cn
陌陌|#3cb4ff|immomo.com
探探|#ff5b5b|tantanapp.com
云闪付|#e60012|95516.com unionpay.com
中国银行|#b81c22|boc.cn
工商银行|#c7000b|icbc.com.cn
建设银行|#0066b3|ccb.com
农业银行|#009882|abchina.com
招商银行|#d6000f|cmbchina.com
交通银行|#1d3f8a|bankcomm.com
顺丰|#000000|sf-express.com sf.com
菜鸟|#1a6bff|cainiao.com
中国移动|#0085d0|10086.cn
中国联通|#e60027|10010.com
中国电信|#0060ae|189.cn
瑞幸咖啡|#1a3c8f|luckincoffee.com
喜茶|#000000|heytea.com
蜜雪冰城|#e60012|mxbc.com
肯德基|#e4002b|kfc.com.cn kfc.com
麦当劳|#ffbc0d|mcdonalds.com mcd.cn
星巴克|#00704a|starbucks.com starbucks.com.cn
米哈游|#2c97f6|mihoyo.com hoyoverse.com miyoushe.com
网易游戏|#e4393c|game.163.com
豆包|#3c6bff|doubao.com
Kimi|#000000|kimi.com kimi.moonshot.cn
DeepSeek|#4d6bfe|deepseek.com
通义|#615ced|tongyi.aliyun.com qianwen.aliyun.com
智谱清言|#3859ff|chatglm.cn
政府网站|#c4161c|gov.cn
WhatsApp|#25d366|wa.me whatsapp.com
Telegram|#26a5e4|t.me telegram.me telegram.org telegram.dog
Signal|#3a76f0|signal.me signal.group signal.org
Discord|#5865f2|discord.gg discord.com discordapp.com
Slack|#4a154b|slack.com
Microsoft Teams|#5059c9|teams.microsoft.com teams.live.com
Zoom|#0b5cff|zoom.us zoom.com
Google Meet|#00897b|meet.google.com
Skype|#00aff0|skype.com
LINE|#06c755|line.me lin.ee
LINE Pay|#06c755|pay.line.me
KakaoTalk|#fee500|kakao.com qr.kakao.com
Kakao Map|#258fff|map.kakao.com
Naver|#03c75a|naver.com naver.me
Viber|#7360f2|viber.com
Zalo|#0068ff|zalo.me
Messenger|#0084ff|m.me messenger.com
Facebook|#1877f2|facebook.com fb.com fb.me
Instagram|#e1306c|instagram.com instagr.am
Threads|#000000|threads.net threads.com
X|#000000|x.com twitter.com
TikTok|#000000|tiktok.com
Snapchat|#fffc00|snapchat.com
Pinterest|#e60023|pinterest.com pin.it pinterest.*
Reddit|#ff4500|reddit.com redd.it
Tumblr|#36465d|tumblr.com
LinkedIn|#0a66c2|linkedin.com lnkd.in
Bluesky|#1185fe|bsky.app
Mastodon|#6364ff|mastodon.social joinmastodon.org
VK|#0077ff|vk.com vk.me
OK|#ee8208|ok.ru
YouTube|#ff0000|youtube.com youtu.be
Twitch|#9146ff|twitch.tv
Vimeo|#1ab7ea|vimeo.com
Netflix|#e50914|netflix.com
Disney+|#113ccf|disneyplus.com
Prime Video|#00a8e1|primevideo.com
niconico|#252525|nicovideo.jp nico.ms
Spotify|#1db954|spotify.com spotify.link
Apple Music|#fa243c|music.apple.com
Apple 播客|#9933cc|podcasts.apple.com
App Store|#0d96f6|apps.apple.com itunes.apple.com
Google Play|#01875f|play.google.com
SoundCloud|#ff5500|soundcloud.com on.soundcloud.com
Shazam|#0088ff|shazam.com
Deezer|#a238ff|deezer.com deezer.page.link
Google 地图|#4285f4|maps.google.com maps.app.goo.gl
Apple 地图|#30b0c7|maps.apple.com
Waze|#33ccff|waze.com
Uber|#000000|uber.com
Uber Eats|#06c167|ubereats.com
Lyft|#ff00bf|lyft.com
Grab|#00b14f|grab.com
Gojek|#00aa13|gojek.com
Airbnb|#ff385c|airbnb.* abnb.me
Booking|#003580|booking.com
Agoda|#5542f6|agoda.com
Expedia|#1f2b6c|expedia.*
Tripadvisor|#34e0a1|tripadvisor.*
Klook|#ff5b00|klook.com
Amazon|#ff9900|amazon.* amzn.to amzn.asia a.co
eBay|#e53238|ebay.*
AliExpress|#e43225|aliexpress.com aliexpress.us
Temu|#fb7701|temu.com
SHEIN|#000000|shein.com
Shopee|#ee4d2d|shopee.* shp.ee
Lazada|#0f146d|lazada.*
Etsy|#f1641e|etsy.com etsy.me
Mercado Libre|#ffe600|mercadolibre.* mercadolivre.com.br
Rakuten|#bf0000|rakuten.co.jp rakuten.com
Coupang|#e52528|coupang.com
Mercari|#ff0211|mercari.com jp.mercari.com
Walmart|#0071ce|walmart.com
Target|#cc0000|target.com
Costco|#e31837|costco.*
IKEA|#0058a3|ikea.com ikea.cn
Nike|#111111|nike.com
Adidas|#000000|adidas.*
UNIQLO|#ff0000|uniqlo.com
ZARA|#000000|zara.com
H&M|#e50010|hm.com
Sephora|#000000|sephora.*
Starbucks|#00704a|starbucks.co.jp
DoorDash|#ff3008|doordash.com
Deliveroo|#00ccbc|deliveroo.*
foodpanda|#d70f64|foodpanda.*
Instacart|#43b02a|instacart.com
PayPal|#003087|paypal.com paypal.me
Venmo|#3d95ce|venmo.com
Cash App|#00d632|cash.app
Revolut|#191c1f|revolut.com revolut.me
Wise|#9fe870|wise.com
Stripe|#635bff|stripe.com buy.stripe.com checkout.stripe.com
Google Pay|#4285f4|pay.google.com
PayPay|#ff0033|paypay.ne.jp
Paytm|#00baf2|paytm.com paytm.me
PhonePe|#5f259f|phonepe.com
GitHub|#24292f|github.com gist.github.com
GitLab|#fc6d26|gitlab.com
Notion|#000000|notion.so notion.site
Figma|#a259ff|figma.com
Canva|#00c4cc|canva.com canva.cn
Miro|#ffd02f|miro.com
Trello|#0079bf|trello.com
Asana|#f06a6a|asana.com
Linear|#5e6ad2|linear.app
Jira|#0052cc|atlassian.net atlassian.com
ClickUp|#7b68ee|clickup.com
Airtable|#18bfff|airtable.com
Typeform|#262627|typeform.com
Tally|#000000|tally.so
SurveyMonkey|#00bf6f|surveymonkey.com
Google 表单|#673ab7|forms.gle
Google 文档|#4285f4|docs.google.com
Google 云端硬盘|#1fa463|drive.google.com
Gmail|#ea4335|mail.google.com
Google|#4285f4|google.* goo.gl g.co
Gemini|#4796e3|gemini.google.com
Dropbox|#0061ff|dropbox.com db.tt
OneDrive|#0078d4|onedrive.live.com 1drv.ms
Outlook|#0078d4|outlook.com outlook.live.com
Microsoft 365|#d83b01|office.com sharepoint.com
Microsoft|#737373|microsoft.com
iCloud|#3693f3|icloud.com
Apple|#000000|apple.com apple.co
Evernote|#00a82d|evernote.com
Obsidian|#7c3aed|obsidian.md
Medium|#000000|medium.com
Substack|#ff6719|substack.com
Quora|#b92b27|quora.com
Wikipedia|#000000|wikipedia.org wikimedia.org
Duolingo|#58cc02|duolingo.com
Strava|#fc4c02|strava.com strava.app.link
Steam|#1b2838|steampowered.com steamcommunity.com s.team
Epic Games|#2a2a2a|epicgames.com
PlayStation|#003791|playstation.com
Xbox|#107c10|xbox.com
Nintendo|#e60012|nintendo.com nintendo.co.jp
Roblox|#000000|roblox.com
Pixiv|#0096fa|pixiv.net
Behance|#1769ff|behance.net
Dribbble|#ea4c89|dribbble.com
Unsplash|#000000|unsplash.com
Imgur|#1bb76e|imgur.com
Flickr|#ff0084|flickr.com flic.kr
Linktree|#43e660|linktr.ee
Calendly|#006bff|calendly.com
Eventbrite|#f05537|eventbrite.*
Meetup|#f65858|meetup.com
Patreon|#ff424d|patreon.com
Ko-fi|#29abe0|ko-fi.com
Buy Me a Coffee|#ffdd00|buymeacoffee.com
Kickstarter|#05ce78|kickstarter.com
Tinder|#fe3c72|tinder.com
Bumble|#ffc629|bumble.com
Hinge|#000000|hinge.co
ChatGPT|#10a37f|chatgpt.com chat.openai.com
OpenAI|#000000|openai.com
Claude|#d97757|claude.ai
Perplexity|#20808d|perplexity.ai
Poe|#5d5cde|poe.com
Hugging Face|#ffd21e|huggingface.co hf.co
1Password|#0094f5|1password.com
Bitwarden|#175ddc|bitwarden.com
Proton|#6d4aff|proton.me protonmail.com
Yahoo|#6001d2|yahoo.*
Yandex|#fc3f1d|yandex.* ya.ru
`;

const APP_SCHEMES = {
  '支付宝': u => 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeURIComponent(u),
  '淘宝': u => 'taobao://' + u.replace(/^https?:\/\//, ''),
  '天猫': u => 'tmall://page.tm/webview?url=' + encodeURIComponent(u),
  '京东': u => 'openapp.jdmobile://virtual?params=' + encodeURIComponent(JSON.stringify({ category: 'jump', des: 'm', url: u })),
  '微博': u => 'sinaweibo://browser?url=' + encodeURIComponent(u),
  '钉钉': u => 'dingtalk://dingtalkclient/page/link?url=' + encodeURIComponent(u),
  '微信': () => 'weixin://',
};

const APP_TIPS = {
  '微信': '微信链接要在微信里打开，可以复制后发给自己，或用微信扫一扫',
  '企业微信': '复制后在企业微信里打开',
};

const APPS = APP_DATA.trim().split('\n').map(line => {
  const [name, color, hosts] = line.split('|');
  return { name, color, hosts: hosts.split(' '), scheme: APP_SCHEMES[name], tip: APP_TIPS[name] };
});
