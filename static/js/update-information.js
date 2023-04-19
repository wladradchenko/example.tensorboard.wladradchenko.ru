function updateInformation(data) {
    const startTimeElement = document.getElementById("start-time");
    const timePassedElement = document.getElementById("time-passed");
    const timeBeforeEndElement = document.getElementById("time-before-end");
    const epochElement = document.getElementById("epoch");
    const maxEpochElement = document.getElementById("max-epoch");
    const maxProgress = document.getElementById("max-progress");
    const elapsedTimeElement = document.getElementById("elapsed-time");
    const progressBarElement = document.querySelector("progress");

    startTimeElement.innerText = data.start_time;
    timePassedElement.innerText = data.time_passed;
    timeBeforeEndElement.innerText = data.time_before_end;
    epochElement.innerText = data.epoch;
    maxEpochElement.innerText = data.max_epoch;

    const timePassed = new Date("1970-01-01T" + data.time_passed + "Z");
    const elapsedTime = new Date("1970-01-01T" + data.middle_time_epoch + "Z");
    const timeBeforeEnd = new Date("1970-01-01T" + data.time_before_end + "Z");
    elapsedTimeElement.innerText = elapsedTime.toISOString().substr(11, 8);

    maxProgress.innerText = `${data.progress}%`;
    progressBarElement.value = data.progress;
}