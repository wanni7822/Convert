const fly = require("flyio");
const atob = require("atob");
const btoa = require("btoa");
const isUrl = require("is-url");
var process = "";
exports.handler = function (event, context, callback) {
  const { queryStringParameters } = event;

  const url = queryStringParameters["sub"];
  if (!isUrl(url)) {
    return callback(null, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      statusCode: 400,
      body: "参数 sub 无效，请检查是否提供了正确的节点订阅地址。",
    });
  }
  fly.get(url).then((response) => {
    try {
      const bodyDecoded = atob(response.data);
      const links = bodyDecoded.split("\n");
      const filteredLinks = links.filter((link) => {
        // Only support trojan now
        if (link.startsWith("trojan://")) return true;
        return false;
      });
      if (filteredLinks.length == 0) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
          statusCode: 400,
          body: "订阅地址中没有节点信息。",
        });
      }
      const trojanLinks = new Array();
      filteredLinks.forEach((link) => {
        //trojan://065a8279-c58a-3bb1-8e68-313351be866d@trojan9.dotunnel.monster:443?allowinsecure=1&allowInsecure=1&tfo=1#trojan测试节点9
        var pureLink = link.replace("trojan://", "");
        var name = pureLink.split("#")[1];
        var config = pureLink.split("#")[0];
        var pwd = config.split("@")[0];
        var params = config.split("?")[1];
        var uri = config.split(/[@?]/)[1];
        var address = uri.split(":")[0];
        var port = uri.split(":")[1];
        let resultUrl = `trojan = ${uri}, password = ${pwd}, over-tls=true, tls-verification=false, tls-host=${address}, tag=${name}`;
        trojanLinks.push(resultUrl);
      });
      if (trojanLinks.length == 0) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
          statusCode: 400,
          body: "订阅节点全部解析失败",
        });
      }
      return callback(null, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
        statusCode: 200,
        body: btoa(trojanLinks.join("\n")),
      });
    } catch (error) {
      if (error && !isNaN(error.status)) {
        return callback(null, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
          statusCode: 400,
          body: "订阅地址网站出现了一个 " + String(error.status) + " 错误。",
        });
      }

      // Unknown
      return callback(null, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
        statusCode: 500,
        body: "Unexpected Error.\n" + JSON.stringify(error),
      });
    }
  });
};
