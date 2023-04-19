Chart.defaults.global.defaultFontColor = "#fff";
Chart.defaults.global.defaultFontSize = 14;
Chart.defaults.global.defaultFontFamily = "Ruslan Display";

var ctx = document.getElementById('training-loss-step-chart').getContext('2d');

var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
gradientStroke.addColorStop(0, "#dc143c");
gradientStroke.addColorStop(1, "#007bff");

var gradientBkgrd = ctx.createLinearGradient(0, 100, 0, 400);
gradientBkgrd.addColorStop(0, "rgba(0, 123, 255,0.3)");
gradientBkgrd.addColorStop(1, "rgba(0, 123, 255,0)");

var training_loss_step_data = {
    labels: [],
    datasets: [
        {
            label: 'Кривая дорожка',
            data: [],
            backgroundColor: gradientBkgrd,
            borderColor: gradientStroke,
            pointBorderColor: "rgba(255,255,255,0)",
            pointBackgroundColor: "rgba(255,255,255,0)",
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 4,
            pointRadius: 1,
            borderWidth: 5,
            pointHitRadius: 16
        }
    ]
};
var training_loss_step_options = {
    responsive: true,
    scales: {
        xAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'Время раздумий'
            },
            ticks: {
                maxTicksLimit: 1, // Show only the first and last tick
                maxRotation: 0,
                minRotation: 0,
                padding: 30
            }
        }],
        yAxes: [{
            scaleLabel: {
                display: true,
                labelString: 'Вера в гороскопы'
            },
            ticks: {
                maxTicksLimit: 4 // Show only the first and last tick
            }
        }]
    }
};
var training_loss_step_chart = new Chart(ctx, {
    type: 'line',
    data: training_loss_step_data,
    options: training_loss_step_options
});

function calculateMovingAverage(data, interval) {
  const result = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i][2];

    if (i >= interval) {
      sum -= data[i - interval][2];
      const average = sum / interval;
      result.push([data[i][0], average]);
    }
  }
  return result;
}

// Define a function to update the chart with new data
function updateTrainingLossStep(data) {
    const movingAverageData = calculateMovingAverage(data.training_loss_step, Math.round(data.training_loss_step.length / 2));
    training_loss_step_chart.data.datasets[0].data = [];
    training_loss_step_chart.data.labels = [];

    movingAverageData.forEach((item) => {
        if (!training_loss_step_chart.data.datasets[0].data.find((d) => d.x === item[0])) {
            var date = new Date(item[0] * 1000);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime = `${day}.${month}.${year} ` + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

            training_loss_step_chart.data.labels.push(formattedTime);
            training_loss_step_chart.data.datasets[0].data.push({
                x: item[0],
                y: item[1]
            });
        }
    });

    // Update the chart
    training_loss_step_chart.update();
}

function updateData(file) {
    fetch('/event?file=' + file)
    .then(response => response.json())
    .then(data => {
        updateTrainingLossStep(data);
        updateInformation(data);
    })
    .catch(error => console.error(error));
}

// Update the chart every 60 seconds
function updateDataInterval() {
    const selectedEventTrainedOption = selectEventTrainedFile.options[selectEventTrainedFile.selectedIndex];
    if (selectedEventTrainedOption) {
        const file = selectedEventTrainedOption.value;
        if (file != "") {
            updateData(file);
        }
    }
};

const selectEventTrainedFile = document.getElementById('eventTrainedFile');

selectEventTrainedFile.addEventListener("change", function() {
    updateDataInterval();
});

updateDataInterval();
setInterval(updateDataInterval, 60000);