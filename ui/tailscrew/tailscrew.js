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
        let message = "/sh 青魔螺旋尾/导弹统计：";
        let first = true;
        Object.keys(localStorage).forEach(function(key){
            let value = JSON.parse(localStorage.getItem(key) || '{}');
            let tCount = value['2C95'] || 0;
            let mCount = value['2C8D'] || 0;
            message += (first ? "" : ", ") + key + ":" + tCount + "/" + mCount;
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
        let value = JSON.parse(localStorage.getItem(key) || '{}');
        // console.log(value);
        t.row.add([key, value['2C95'] || 0, value['2C8D'] || 0]);
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

function updateCount(playerName, actionId) {
    let countDict = JSON.parse(localStorage.getItem(playerName) || '{}');
    let count = parseInt(countDict[actionId] || "0");
    count += 1;
    countDict[actionId] = count;
    // console.log(countDict);
    localStorage.setItem(playerName, JSON.stringify(countDict));
    // console.log(localStorage);
    loadStorage();
}

addOverlayListener('onLogEvent', function (e) {
    for (let i = 0; i < e.detail.logs.length; i++) {
        let r = e.detail.logs[i].match('00:0038::(螺旋尾|妖表青魔)');
        if (r) {
            switchHide();
        }
        let tailscrewPattern = /(?<timestamp>^.{14}) ActionEffect 1[56]:(?<sourceId>[0-9A-F]{8}):(?<source>[^:]*?):(?<id>2C95):(?<ability>[^:]*?):(?<targetId>[0-9A-F]{8}):(?<target>[^:]*?):/;
        r = e.detail.logs[i].match(tailscrewPattern);
        if(r){
            updateCount(r.groups.source, '2C95');
        }
        let missilePattern = /(?<timestamp>^.{14}) ActionEffect 1[56]:(?<sourceId>[0-9A-F]{8}):(?<source>[^:]*?):(?<id>2C8D):(?<ability>[^:]*?):(?<targetId>[0-9A-F]{8}):(?<target>[^:]*?):/;
        r = e.detail.logs[i].match(missilePattern);
        if(r){
            updateCount(r.groups.source, '2C8D');
        }
    }
});

addOverlayListener('onPlayerChangedEvent', function (e) {
    charName = e.detail.name;
});

addOverlayListener('onUserFileChanged', function (e) {
    // console.log(`User file ${e.file} changed!`);
});

callOverlayHandler({ call: 'cactbotRequestState' });
