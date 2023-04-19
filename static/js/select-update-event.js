// Loop through the dictionary and add options to the select element
function appendOptionFromDict(select, dict) {
    const option = select.options[select.selectedIndex];
    const optionVal = option.value;

    for (let i = select.options.length - 1; i > 0; i--) {
        select.remove(i);
    }

    for (const key in dict) {
      if (dict.hasOwnProperty(key)) {
        const value = dict[key];
        const option = document.createElement('option');
        option.value = key;
        const lastSlashIndex = key.lastIndexOf('/');
        const name = funnyRenameKey(key.substring(lastSlashIndex + 1));
        option.text = `${name} ${value}`;

        if (value === optionVal) {
            option.selected = true;
        }

        select.add(option);
      }
    }
};

function funnyRenameKey(key) {
  // just funny name for example project in github
  if (key.startsWith("out.tfevents.")) {
    const suffix = key.slice("out.tfevents.".length);
    const number = suffix.split('.').pop();
    return `Гороскоп ${number} от`;
  }
  return key;
}

function updateSelectOptions(data) {
    const selectEventTrainedFileTmp = document.getElementById('eventTrainedFile');
    const selectInputFilesTmp = document.getElementById('nnSettingFile');

    appendOptionFromDict(selectEventTrainedFileTmp, data.tfevents_files);
    appendOptionFromDict(selectInputFilesTmp, data.input_files);
}

function updateSelect() {
    fetch('/get_select_path_options')
        .then(response => response.json())
        .then(data => {
            updateSelectOptions(data);
        })
        .catch(error => console.error(error));
}

// Update the chart every 60 seconds
updateSelect();

setInterval(function() {
    updateSelect();
}, 30000);