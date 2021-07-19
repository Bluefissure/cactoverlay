import '../../resources/common.js';

let recording = true;

$(document).ready(function() {
    $('#actlog_table').DataTable({
        paging: true,
        scrollX:        true,
        scrollY:        800,
        scroller:       true,
        columns: [
            { 'data': 'Log', 'orderable': false},
        ],
        columnDefs: [
            {
                render: function (data, type, full, meta) {
                    return "<div style='white-space:normal; width:100%;'>" + data + "</div>";
                },
                targets: 0
            }
        ],
        fnInitComplete : function(oSettings, json) {
            $('#actlog_table').parents('.dataTables_wrapper').first().find('thead').hide();
        }
    });
});
    
addOverlayListener('onLogEvent', function(e) {
    if (!recording) return;
    let t = $('#actlog_table').DataTable();
    for (let i = 0; i < e.detail.logs.length; i++) {
        let r = e.detail.logs[i];
        t.row.add({ Log: r });
        // console.log(r);
    }
    t.draw(false);
    let num_rows = t.page.info().recordsTotal;
    t.row(num_rows - 1).scrollTo(false);
});

$('#cleatLogButton').click(() => {
    let t = $('#actlog_table').DataTable();
    t.clear();
    t.draw();
});

$('#startStopButton').click(() => {
    recording = !recording;
    $('#startStopButton').text(recording ? '停止记录' : '开始记录');
});