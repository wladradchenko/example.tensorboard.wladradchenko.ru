const yamlTextarea = document.getElementById('yaml-textarea');
// get the form and textarea elements
const yamlDivForm = document.getElementById('div-yaml-form');

// function to load log file and display its contents in the textarea
function loadYamlFile(filepath) {
fetch(filepath)
    .then(response => response.text())
    .then(data => yamlTextarea.value = data)
    .catch(error => console.error(error));
}

// load yaml file on page load ////////
const selectInputFiles = document.getElementById('nnSettingFile');

selectInputFiles.addEventListener("change", function() {
const selectInputFilesOption = selectInputFiles.options[selectInputFiles.selectedIndex];
if (selectInputFilesOption) {
    const yamlFile = selectInputFilesOption.value;
    if (yamlFile != "" && yamlFile.endsWith(".yaml")) {
        yamlDivForm.style.display = 'block';
        loadYamlFile(yamlFile);
    } else {
        yamlDivForm.style.display = 'none ';
    }
}
});