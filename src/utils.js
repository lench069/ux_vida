function QueryStringToHash(query) {
  var query_string = {};
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    pair[0] = decodeURIComponent(pair[0]);
    pair[1] = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], pair[1]];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
  return query_string;
}

function FormatCurrency(valor) {
  var formatValor = '';
  var decimales = '';

  if (valor.toString().indexOf('.') >= 0) {
    var valorSplit = valor.toString().split('.');
    if (valorSplit[1].length == 1) {
      decimales = ',' + valorSplit[1] + '0';
    } else {
      decimales = ',' + valorSplit[1];
    }
    valor = valorSplit[0];
  }

  while ((valor * 1) > 999) {
    var miles = valor.toString().substr(-3);
    var valor = valor.toString().substr(0, valor.toString().length - 3);
    formatValor = '.' + miles + formatValor;
  }

  return (valor + formatValor + decimales);
}

function CaracterDecimal(valor) {
  if (valor.toString().indexOf('.') >= 0) {
    return '.';
  }
  if (valor.toString().indexOf(',') >= 0) {
    return ',';
  }
  return false;
}

function GetBrowser() {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) { return { name: 'Opera', version: tem[1] }; }
  }
  if (window.navigator.userAgent.indexOf("Edge") > -1) {
    tem = ua.match(/\Edge\/(\d+)/)
    if (tem != null) { return { name: 'Edge', version: tem[1] }; }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
  return {
    name: M[0],
    version: +M[1]
  };
}