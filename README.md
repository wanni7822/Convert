# ConfigConverter
[![Netlify Status](https://api.netlify.com/api/v1/badges/9cc59d6d-465a-4425-9211-4152c3f377fc/deploy-status)](https://app.netlify.com/sites/ssrconvert/deploys)

将各种代理软件的配置文件进行转换

## WHY

自己的机场节点快破百了，在一个订阅链接里面，挑选起来很不方便

想找直接订阅过滤的api，发现都不是开源的，有可能会被记录订阅地址

为了解决这个问题，特地写了这个api，自己部署到服务器，所有内容均开源

## API Endpoint

|      地址      |      功能       |  参数   |                  说明                   |
| :------------: | :-------------: | :-----: | :-------------------------------------: |
| /api/SSRFilter | SSR订阅节点过滤 |   sub   |                订阅地址(放在最后喔)                 |
|                |                 | include  | 要显示的节点名称正则表达式(需UrlEncode) |
|                |                 | exclude  |   要移除的节点正则表达式(需UrlEncode)   |
|                |                 | preview |      只要有值就直接预览生成的结果(开发使用,请勿自己传值)      |
|                |                 | rename | 重命名 |
|                |                 | addin |追加名称|
|                |                 | flag |追加名称|

['preview']; //yes则预览,不传不预览
['flag']; //是否添加国旗,不传不处理,left:前面加国旗,right:后面加国旗,remove:移除国旗(如果有)
['rename']; //重命名,格式为 rename=oldname@newname，多个rename可用+连接,如果想移除某字符,则可以oldname@的方式进行
['addin']; //追加文字,格式为addWord@或@addWord或者addWord@addWord,分别表示在最前面/最后面/前后都 进行追加文字(如果同国旗一起使用,国旗始终是在最前面的)


```
rename说明:
	例如我的节点名称为"二星日本-付费SSR"
	我想把日本换成JP,则为:日本@JP
	我想把付费去掉,则为付费@
	
addin说明:
	我想在节点名称前面追加[2倍],则为:[2倍]@
	我想在节点名称后面追加[2倍],则为:@[2倍]
	我想在前面加[2倍]后面加[SSR],则为:[2倍]@[SSR]

```

例如

test.netlify.com/api/vmessfilter?preview=yes&filter=香港&sub=你的订阅地址

此处的香港没有urlencode,知晓一下

## 自部署

上述网址仅供演示使用，随时可能停止。自行使用请点击下面按钮部署至 netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sazs34/Convert)
