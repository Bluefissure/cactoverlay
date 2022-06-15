const xivapi = 'https://cafemaker.wakingsands.com';
let display = true;
let isObsConnected = false;
const obs = new OBSWebSocket();
const cookiePassword = Cookies.get('password');
let partyWipeLock = false;

if (cookiePassword !== undefined) {
  $('#password').val(cookiePassword);
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function connectObs() {
  const address = $('#address').val();
  const password = $('#password').val();
  let connectParams = {};
  if ( password !== undefined && password.length > 0) {
    connectParams = {
      address: address,
      password: password
    }
  } else {
    connectParams = {
      address: address
    }
  }
  obs.connect(connectParams).then(() => {
    $('#info_msg').html('连接成功！五秒后自动关闭本窗口。');
    $('#error_msg').html('');
    Cookies.set('password', password);
    setTimeout(() => {
      display = false;
      displayOrHideOverlay();
    }, 5000);
    obs.send('GetRecordingFolder').then(folder => {
      if ($('#recording-path').val() === '') {
        $('#recording-path').val(folder['rec-folder'])
      }
    });
  }).catch( (err) => {
      console.error(err);
      $('#info_msg').html('');
      $('#error_msg').html('连接失败！');
  });
}

function setObsRecording(path) {
  if (path === undefined || path === '') return;
  console.log(`Setting Obs recording path to ${path}`);
  obs.send('SetRecordingFolder', {
    'rec-folder': path
  }).then(() => {
    obs.send('GetRecordingFolder').then(folder => {
      $('#recording-path').val(folder['rec-folder'])
    });
  })
}

function stopRecording(resetPath=true) {
  obs.send('GetRecordingStatus').then((data) => {
    if (data['isRecording'] === true) {
      obs.send('StopRecording');
    }
  });
  if(resetPath && $('#recording-path').val() !== '') {
    setObsRecording($('#recording-path').val());
  }
}

function reStartRecording() {
  stopRecording(false);
  let intervalTimes = 0;
  const intervalId = setInterval(() => {
    intervalTimes += 1;
    // console.log("Interval");
    if (intervalTimes >= 60) {
        clearInterval(intervalId);
    }
    obs.send('GetRecordingStatus').then((data) => {
      if (data['isRecording'] === false) {
        sleep(2000).then(() => {
          obs.send('StartRecording');
        });
        clearInterval(intervalId);
      }
    });
  }, 1000);
}

$('#connect-button').on('click', connectObs);

$('#recording-button').on('click', () => {setObsRecording($('#recording-path').val())});

if ($('#password').val() !== undefined && $('#password').val().length > 0) {
  connectObs();
}

obs.on('ConnectionOpened', () => {
  isObsConnected = true;
  console.log(`Obs connected to ${$('#address').val()}.`)
})

obs.on('ConnectionClosed', () => {
  isObsConnected = false;
  console.log(`Obs disconnected.`)
})

obs.on('RecordingStarted', data => {
  console.log(`Recording Started: ${data['recordingFilename']}`);
  // console.log(data);
})

obs.on('RecordingStopped', data => {
  console.log(`Recording Stopped: ${data['recordingFilename']}`);
  // console.log(data);
})

obs.on('error', err => {
    console.error('socket error:', err);
});

// Overlay Events
function displayOrHideOverlay() {
    let div = document.getElementById('div');
    if (display)
        div.style.visibility = 'visible';
    else
        div.style.visibility = 'hidden';
}

function displayOrHideSource(name, isDisplay) {
  sleep(isDisplay ? 0 : 2000).then(() => {
    obs.send('SetSceneItemProperties', {
      item: name,
      visible: isDisplay
    })
  });
}

addOverlayListener("LogLine", (e) => {
    if (e.line[2] === "0038") {
      if (e.line[4] === "obs") {
        display = !display;
        displayOrHideOverlay();
      } else if (e.line[4] === "wipe") {
        reStartRecording();
      }
    } else if (e.line[0] === "33" && /^4000001[026]$/.test(e.line[3])) partyWipe();
});

addOverlayListener("ChangeZone", (e) => {
  if (!isObsConnected) return;
  if (!$('#recording-check').is(':checked')) return;
  let zoneId = e.zoneID;
  fetch(`${xivapi}/TerritoryType/${zoneId}`)
  .then(res => {
    return res.json();
  }).then(territory => {
    const links = territory['GameContentLinks'];
    if ('ContentFinderCondition' in links) {
      const questId = links['ContentFinderCondition']['TerritoryType'];
      fetch(`${xivapi}/ContentFinderCondition/${questId}`)
      .then(res => res.json()).then(quest => {
        const questName = quest['Name'];
        obs.send('GetRecordingStatus').then((data) => {
          if (data['isRecording'] === false) {
            obs.send('GetRecordingFolder').then(folder => {
              const folderPath = $('#recording-path').val();
              obs.send('SetRecordingFolder', {
                'rec-folder': (folderPath === '' || folderPath === undefined)
                              ? folder['rec-folder']
                              : folderPath + `\\${questName}`
              }).then(() => {
                obs.send('StartRecording');
              })
            })
          }
        });
      })
    } else {
      stopRecording();
    }
  });
});

addOverlayListener('OnlineStatusChanged', (e) => {
  if (!isObsConnected) return;
  obs.send('GetSourcesList').then(data => {
    data.sources.forEach(source => {
      if (source.name.indexOf('Image') === 0
          || source.name.indexOf('ACT') === 0) {
        displayOrHideSource(source.name, e.status !== 'InCutscene');
      }
    });
  });
});

// addOverlayListener('onPartyWipe', (e) => {});

addOverlayListener('onGameExistsEvent', (e) => {
  if (!isObsConnected) return;
  stopRecording();
});

function partyWipe(){
  if (partyWipeLock) return;
  if (!isObsConnected) return;
  if (!$('#wipe-check').is(':checked')) return;
  partyWipeLock = true;
  setTimeout(() => (partyWipeLock = false), 3000);
  // console.log("wipe");
  reStartRecording();
}