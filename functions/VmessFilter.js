const fly = require("flyio");
const atob = require('atob');
const btoa = require('btoa');
const isUrl = require('is-url');
const vmess = require('./addin/ssr');
const emoji = require('./addin/emoji');
var line = 0;

exports.handler = function (event, context, callback) {
  const {
    queryStringParameters
  } = event;

  const url = queryStringParameters['sub'];

  const plain = queryStringParameters['plain']; //不加密
  const exclude = queryStringParameters['exclude']; //正则
  const include = queryStringParameters['include']; //正则
  const preview = queryStringParameters['preview']; //yes则预览,不传不预览
  const flag = queryStringParameters['flag']; //是否添加国旗,不传不处理,left:前面加国旗,right:后面加国旗,remove:移除国旗(如果有)
  const rename = queryStringParameters['rename']; //重命名,格式为 rename=oldname@newname，多个rename可用+连接,如果想移除某字符,则可以oldname@的方式进行
  const addin = queryStringParameters['addin']; //追加文字,格式为addWord@或@addWord或者addWord@addWord,分别表示在最前面/最后面/前后都 进行追加文字(如果同国旗一起使用,国旗始终是在最前面的)

  if (!isUrl(url)) {
    return callback(null, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      },
      statusCode: 400,
      body: "参数 sub 无效，请检查是否提供了正确的节点订阅地址。"
    });
  }

  fly.get(url).then(response => {
    try {
      line = 1;
      const bodyDecoded = atob(response.data);
      const links = bodyDecoded.split('\n');
      line = 2;
      //#region 支持协议过滤
      const filteredLinks = links.filter(link => {
        // Only support vmess now
        if (link.startsWith('vmess://')) return true;
        return false;
      });
      line = 3;
      if (filteredLinks.length == 0) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          },
          statusCode: 400,
          body: "订阅地址中没有节点信息。"
        });
      }
      //#endregion

      //#region 协议具体内容获取
      line = 4;
      const vmessInfos = new Array();
      const vmessLinks = new Array();
      filteredLinks.forEach(link => {
        line=5;
        var result = vmess.analyse(link);
        line=6;
        if (result == null) return true;
        //#region 协议根据名称进行过滤

        if (include && include != "" && !new RegExp(include).test(result.ps)) {
          return true;
        }
        line=7;
        if (exclude && exclude != "" && new RegExp(exclude).test(result.ps)) {
          return true;
        }
        line=8;
        if (addin && addin.indexOf('@') > 0) {
          if (addin.startsWith('@')) {
            result.ps += addin.substring(1, addin.length);
          } else if (addin.endsWith('@')) {
            result.ps = addin.substring(0, addin.length - 1) + result.ps;
          } else {
            var addInfo = addin.split('@');
            result.ps = addInfo[0] + result.ps + addInfo[1];
          }
        }
        line=9;
        if (flag) {
          result.ps = emoji.flagProcess(result.ps, flag);
        }
        line=10;
        if (rename && rename.indexOf('@') >= 0) {
          rename.split('+').forEach(nameStr => {
            var nameInfo = nameStr.split("@");
            if (nameStr.startsWith("@")) {
              //do nothing
            } else if (nameStr.endsWith("@")) {
              result.ps = result.ps.replace(nameInfo[0], "");
            } else {
              result.ps = result.ps.replace(nameInfo[0], nameInfo[1]);
            }
          })
        }
        line=11;
        if (!plain) {
          vmessLinks.push(vmess.getVmessShareLink(result));

          //#endregion
          line = 12;
          vmessInfos.push(result);
        } else {
          let address = result.add + ( ( result.port && result.port.length >　0) ? (':' + result.port) : '');
          let llink = 'vmess = ' + address + ', method=' + result.type + ', password=' + result.id + ', obfs=' + result.net + ', obfs-host=' + (result.host) == undefined? '' : result.host + ', obfs-uri=' + (result.path) == undefined? '' : result.path + ', fast-open=false, udp-relay=false'
              + ', tag=' + result.ps;
          vmessLinks.push(llink);
        }

        line=13;
      });
      if (vmessLinks.length == 0) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          },
          statusCode: 400,
          body: "订阅节点全部解析失败"
        });
      }
      //#endregion
      //#region 结果拼接
      if (preview) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          },
          statusCode: 200,
          body: JSON.stringify({
            vmessInfos,
            vmessLinks
          })
        });
      } else {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          },
          statusCode: 200,
          body: vmessLinks.join('\n')
        });
      }
      //#endregion
    } catch (e) {
      return callback(null, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        },
        statusCode: 500,
        body: "Runtime Error.\n" + JSON.stringify(e) + "\n" + line + "\n" +  JSON.stringify(response)
      });
    }
  }).catch(error => {
    // 404
    if (error && !isNaN(error.status)) {
      return callback(null, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        },
        statusCode: 400,
        body: "订阅地址网站出现了一个 " + String(error.status) + " 错误。"
      });
    }

    // Unknown
    return callback(null, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      },
      statusCode: 500,
      body: "Unexpected Error.\n" + JSON.stringify(error)
    });
  })

}
