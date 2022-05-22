function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
} 

function checkCookieConnectedCookie() {
    var cookie = getCookie("SPORTICUS_CONNECTED");
    var connectButton = document.getElementById('connect-btn');
    

    if (cookie != null) {
        var parsedCookie = cookie.split(";");
        connectButton.textContent = parsedCookie[0];
        connectButton.setAttribute('href', '/profile')
    }
    else {
        
    }
}

function checkCertifActive() {
    var cookie = getCookie("SPORTICUS_CERTIF");
    var certifstatustext = document.getElementById('certif-status');
    var certifdesc = document.getElementById('certif-description');

    if (cookie != null) {
        if(cookie === 'false') {
            certifstatustext.textContent = "Pas de certificat médical téléversé";
            certifdesc.textContent = "Pour téléverser un certificat, choisissez un fichier puis cliquez sur Téléverser. Il doit être au format pdf."
        } else {
            certifstatustext.textContent = "Vous avez un certificat téléversé";
            certifdesc.textContent = "Vous pouvez le télécharger ou le remplacer en choisissant un fichier puis en cliquant sur Téléverser. Il doit être au format pdf."
        }
        
    }
    else {
        
    } 
}



$(document).ready( function () {
    checkCookieConnectedCookie();
    checkCertifActive();
  });

