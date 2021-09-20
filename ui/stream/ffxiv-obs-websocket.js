'use strict';

let charName = '';

function getBeiJingDate() {
    return new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 8 * 60 * 60000).toDateString();
}

function getBeiJingTime() {
    return new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 8 * 60 * 60000).toLocaleTimeString();
}

function getLocaleTime() {
    return new Date().toLocaleTimeString();
}

function get_default_tasks() {
    let tasks = {
        "团队任务": [
            "玛哈古钱",
            "玛哈大古钱",
            "稀有玛哈古钱",
            "拉巴纳斯塔古钱",
            "高古古钱",
            "缪隆德古钱",
            "机械古钱"
        ],
        "大型任务": [
            "古旧的觉醒头盔",
            "古旧的觉醒铠甲",
            "古旧的觉醒手铠",
            "古旧的觉醒长裤",
            "古旧的觉醒锁甲靴",
            "古旧的觉醒腰带",
            "古旧的觉醒饰品",
            "古旧的觉醒长剑",
            "阿尔法透镜",
            "阿尔法长杆",
            "阿尔法曲柄",
            "阿尔法弹簧",
            "阿尔法踏板",
            "阿尔法锁链",
            "阿尔法螺栓",
            "阿尔法幻晶",
            "西格玛透镜",
            "西格玛长杆",
            "西格玛曲柄",
            "西格玛弹簧",
            "西格玛踏板",
            "西格玛锁链",
            "西格玛螺栓",
            "西格玛幻晶",
            "德尔塔透镜",
            "德尔塔长杆",
            "德尔塔曲柄",
            "德尔塔弹簧",
            "德尔塔踏板",
            "德尔塔锁链",
            "德尔塔螺栓",
            "德尔塔幻晶",
            "亚历山大透镜",
            "亚历山大长杆",
            "亚历山大曲柄",
            "亚历山大弹簧",
            "亚历山大踏板",
            "亚历山大锁链",
            "亚历山大螺栓",
            "亚历山大齿轮",
            "弥达斯透镜",
            "弥达斯长杆",
            "弥达斯曲柄",
            "弥达斯弹簧",
            "弥达斯踏板",
            "弥达斯锁链",
            "弥达斯螺栓",
            "弥达斯齿轮",
            "戈耳狄透镜",
            "戈耳狄长杆",
            "戈耳狄曲柄",
            "戈耳狄弹簧",
            "戈耳狄踏板",
            "戈耳狄锁链",
            "戈耳狄螺栓"
        ],
        "讨伐歼灭战：高难度": [
            "云神图腾",
            "武神图腾",
            "魔神图腾",
            "邪龙图腾",
            "女神图腾",
            "鬼神图腾",
            "苍穹甲胄碎片",
            "豪神图腾",
            "美神图腾",
            "神龙图腾",
            "白虎图腾",
            "夜神图腾",
            "朱雀图腾",
            "青龙图腾",
            "冥王图腾",
            "妖灵王图腾",
            "完美神图腾",
        ],
        "其他": [
            "天之陶器碎片",
            "格尔莫拉陶器碎片",
            "战场",
        ]
    }
    return tasks;
}

$(document).ready(function () {
    $('#moogle_table').DataTable({
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
    let t = $('#moogle_table').DataTable();
    t.buttons().container().appendTo($('#moogle_footer'));
    let tasks = get_default_tasks();
    for (let k = 0; k < Object.keys(tasks).length; k++) {
        let category = Object.keys(tasks)[k];
        for (let i = 0; i < tasks[category].length; i++) {
            let itemDom = tasks[category][i];
            if (!itemDom.includes("战场")) {
                itemDom = "<span data-ck-item-name>" + itemDom + "</span>";
            }
            t.row.add([
                itemDom, category, ""
            ]).draw();
        }
    }
    t.order([1, 'asc']).draw();
    loadStorage();
});


function filter(category) {
    let t = $('#moogle_table').DataTable();
    t.columns(1).search(category).draw(false);
}

function loadStorage() {
    let t = $('#moogle_table').DataTable();
    t.rows().every(function () {
        let d = this.data();
        let itemName = d[0].replace("<span data-ck-item-name>", "").replace("</span>", "");
        let info = localStorage.getItem(itemName);
        if (info !== null) {
            // console.log(info);
            this.data([d[0], d[1], info]).draw();
        } else if (d[2] !== "") {
            this.data([d[0], d[1], ""]).draw();
        }
    });
    refreshTotalCredit();
}

function refreshTotalCredit() {
    let t = $('#moogle_table').DataTable();
    let credit = 0;
    t.rows().every(function () {
        let d = this.data();
        if (d[2] !== "") {
            // console.log(d[2]);
            if (d[1] === "团队任务" || d[0].indexOf("格尔莫拉陶器碎片") != -1)
                credit += 3
            else
                credit += 1
        }
    });
    // console.log("credit:" + credit);
    $('#total_credit').html(credit);
    let date = localStorage.getItem("lastUpdate");
    $('#date').html(date);
    return credit;
}

function switchHide() {
    if ($('#moogle_body').hasClass('hide')) {
        $('#moogle_body').removeClass('hide');
        document.getElementById('moogle_html').style.backgroundColor = 'white';
    } else {
        $('#moogle_body').addClass('hide');
        document.getElementById('moogle_html').style.backgroundColor = 'transparent';
    }
}

function updateItem(itemName) {
    let t = $('#moogle_table').DataTable();
    t.rows().every(function () {
        let d = this.data();
        if (d[0].indexOf(itemName) != -1) {
            // console.log(d);
            let date = getBeiJingDate();
            if (localStorage.getItem("lastUpdate") !== date) {
                localStorage.clear();
                localStorage.setItem("lastUpdate", date);
            }
            localStorage.setItem(itemName, getLocaleTime());
        }
    });
    loadStorage();
}

addOverlayListener('onLogEvent', function (e) {
    for (let i = 0; i < e.detail.logs.length; i++) {
        // Match "/echo tts:<stuff>"
        let r = e.detail.logs[i].match('00:0038:(moogle|莫古|库啵|蘑菇)');
        if (r) {
            switchHide();
        }
        let acquireItemPattern = '00:083e:' + charName + '获得了“(.*?)”'
        r = e.detail.logs[i].match(acquireItemPattern);
        if (r) {
            let itemName = r[1];
            updateItem(itemName);
        }
        r = e.detail.logs[i].match("00:083e:获得了.*枚狼印战绩。");
        if (r) {
            updateItem("战场");
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