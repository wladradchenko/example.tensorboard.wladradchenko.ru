function startTraining() {
    // disable the button and show the training message
    document.getElementById('train-button').disabled = true;
    document.getElementById('training-message').style.display = 'block';

    const selectInputFilesOptionVal = selectInputFiles.options[selectInputFiles.selectedIndex].value;
    let nnTextYaml;
    if (selectInputFilesOptionVal == "") {
        nnTextYaml = "";
    } else {
        nnTextYaml = document.getElementById('yaml-textarea').value;
    }

    const nnSettingFile = document.getElementById('nnSettingFile');
    const nnSettingFileOptionVal = nnSettingFile.options[nnSettingFile.selectedIndex].value;

    const nnParameterOne = document.getElementById('nnParameterOne');
    const nnParameterOneOptionVal = nnParameterOne.options[nnParameterOne.selectedIndex].value;

    const nnParameterThree = document.getElementById('nnParameterThree');
    const nnParameterThreeOptionVal = nnParameterThree.value;

    const nnParameterTwo = document.getElementById('nnParameterTwo');
    const nnParameterTwoOptionVal = nnParameterTwo.options[nnParameterTwo.selectedIndex].value;

    // make a POST request to start the training
    fetch('/start_training', {
        method: 'POST',
        body: JSON.stringify({
          nnSettingFile: nnSettingFileOptionVal,
          nnTextYaml: nnTextYaml,
          nnParameterOne: nnParameterOneOptionVal,
          nnParameterTwo: nnParameterThreeOptionVal,
          nnParameterThree: nnParameterTwoOptionVal,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
        })
        .then(response => {
        if (response.ok) {
          // polling function to check if the training is finished
          const intervalId = setInterval(() => {
            fetch('/check_training_status')
              .then(response => response.json())
              .then(data => {
                if (data.status === 'finished') {
                  // training is finished, enable the button and hide the training message
                  clearInterval(intervalId);
                  document.getElementById('train-button').disabled = false;
                  document.getElementById('training-message').style.display = 'none';
                }
              })
              .catch(error => console.error(error));
          }, 5000); // check every 5 seconds
        } else {
          console.error(response.statusText);
        }
    })
    .catch(error => console.error(error));
}

window.onload = function() {
  // initial check for training status
  checkTrainingStatus();

  // start interval to check for training status every 5 seconds
  setInterval(checkTrainingStatus, 5000);
}

function checkTrainingStatus() {
  fetch('/check_training_status')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'running') {
        // training is finished, enable the button and hide the training message
        document.getElementById('train-button').disabled = true;
        document.getElementById('training-message').style.display = 'block';
      }
    })
    .catch(error => console.error(error));
}