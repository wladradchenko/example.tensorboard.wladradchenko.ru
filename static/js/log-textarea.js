const logTextarea = document.getElementById('log-textarea');

// function to load log file and display its contents in the textarea
function updateLog() {
    fetch('/log_stream')
    .then(response => response.json())
    .then(data => {
        logTextarea.value = "";
        for (let i = 0; i < data.log.length; i++) {
          logTextarea.value += data.log[i] + '\n';
        }
    })
    .catch(error => console.error(error));
}

// Update the chart every 1 seconds
setInterval(function() {
    updateLog();
}, 1000);