const fly = require("flyio");
const atob = require('atob');
const isUrl = require('is-url');

const yaml = require('js-yaml');
const fs   = require('fs');

var line = 0;

exports.handler = function(event, context, callback) {
	const { queryStringParameters } = event;

	const url = decodeURIComponent(queryStringParameters['src']);

	if (!isUrl(url)) {
		return callback(null, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8"
			},
		    statusCode: 400,
		    body: "参数 src 无效，请检查是否提供了正确的节点订阅地址。"
		});
	}
line = 1;
	fly.get(url,null,{
    timeout:50000 //超时设置为5s
}).then(response => {
    line =2;
    var doc = yaml.load(response.data);
    line =3;    
    // DEBUG
    let proxyGroups = doc['proxy-groups'];  
    
    for(let i = 0; i < proxyGroups.length; i++){
      let list = new Array;
      if(proxyGroups[i].name.includes("自动选择")){
        for(let j = 0, j < proxyGroups[i].proxies.length; j++){
          if(!(proxyGroups[i].proxies.includes("解锁节点")) && !(proxyGroups[i].proxies.includes("公益代理，收费请举报并反馈"))){
            list.push( proxyGroups[i].proxies[j]);
          }
        }
      }
      proxyGroups[i].proxies = list;
    }
		

		// DEBUG
		return callback(null, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8"
			},	
			statusCode: 200,
			body: JSON.stringify(doc)
		});
	}).catch(error => {
		// 404
		if (error && !isNaN(error.status)) {
			return callback(null, {
				headers: {
					"Content-Type": "text/plain; charset=utf-8"
				},
				statusCode: 400,
		    	body: "订阅地址网站出现了一个 " + String(error.status) + " 错误: line = " + line + "\n" + "url:" + url + "\n" + JSON.stringify(error)
			});
		}

		// Unknown
		return callback(null, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8"
			},
			statusCode: 500,
	    	body: "Unexpected Error.line = " + line + "\n" + "url:" + url + "\n" + JSON.stringify(error)
		});
	})
    
}
