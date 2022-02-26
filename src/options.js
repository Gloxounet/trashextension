// Saves options to chrome.storage
function save_options() {
    var highresmode = document.getElementById('4Kmode').checked;
    var datefilename = document.getElementById('datefilename').checked;
    chrome.storage.sync.set({
      'highresmode': highresmode,
      'datefilename': datefilename
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved!';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    highresmode: false,
    datefilename: true
  }, function(items) {
    document.getElementById('4Kmode').checked = items.highresmode;
    document.getElementById('datefilename').checked = items.datefilename;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);