import '../../resources/common.js';
import Regexes from '../../resources/regexes.js';

let charName = '';
let copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };
$(document).ready(function () {
    $('#tailscrew_table').DataTable({
        "paging": false,
        sDom: 'lrtip',
        "scrollY": "500px",
        "scrollCollapse": true,
        buttons: [
            {
                extend: 'copy',
                text: '复制',
                exportOptions: {
                    modifier: {
                        page: 'current'
                    }
                }
            }
        ]
    });
    $('#clearStorageButton').click(() => {
        localStorage.clear();
        loadStorage();
    })
    $('#copyShoutButton').click(() => {
        let message = "/sh 青魔螺旋尾统计：";
        let first = true;
        Object.keys(localStorage).forEach(function(key){
            let value = localStorage.getItem(key);
            message += (first ? "" : ", ") + key + ":" + value;
            first = false;
        });
        message = message.trim(", ");
        copyToClipboard(message);
    })
    
    loadStorage();
});

function loadStorage() {
    let t = $('#tailscrew_table').DataTable();
    t.clear();
    Object.keys(localStorage).forEach(function(key){
        let value = localStorage.getItem(key);
        t.row.add([key, value]);
    });
    t.draw();
}


function switchHide() {
    if ($('#tailscrew_body').hasClass('hide')) {
        $('#tailscrew_body').removeClass('hide');
        document.getElementById('tailscrew_html').style.backgroundColor = 'white';
    } else {
        $('#tailscrew_body').addClass('hide');
        document.getElementById('tailscrew_html').style.backgroundColor = 'transparent';
    }
}

function updateCount(playerName) {
    let count = parseInt(localStorage.getItem(playerName)) || 0;
    count += 1;
    localStorage.setItem(playerName, count);
    loadStorage();
}

addOverlayListener('onLogEvent', function (e) {
    for (let i = 0; i < e.detail.logs.length; i++) {
        let r = e.detail.logs[i].match('00:0038:(螺旋尾|妖表青魔)');
        if (r) {
            switchHide();
        }
        let tailscrewPattern = Regexes.ability({ id: '2C95' });
        r = e.detail.logs[i].match(tailscrewPattern);
        if(r){
            console.log(r);
            updateCount(r.groups.source);
        }
    }
});

addOverlayListener('onPlayerChangedEvent', function (e) {
    charName = e.detail.name;
});

addOverlayListener('onUserFileChanged', function (e) {
    // console.log(`User file ${e.file} changed!`);
});

addOverlayListener('FileChanged', function (e) {
    // console.log(`File ${e.file} changed!`);
});

callOverlayHandler({ call: 'cactbotRequestState' });