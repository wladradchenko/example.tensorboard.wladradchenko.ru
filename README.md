
<div id="top"></div>

<br />
<div align="center">
  <a href="https://github.com/wladradchenko/example.tensorboard.wladradchenko.ru">
    <img src="static/icon/logo.svg" width="150px" height="150px">
  </a>

  <h3 align="center">Matryoshka TensorBoard</h3>
</div>

<!-- ABOUT THE PROJECT -->
## О проекте / About The Project

Пример работы с tfevents файлами, при помощи tensorboard для просмотра предыдущей статистики обученной модели или просмотр текущего обучения модели с выводом параметров, времени старта, окончания, кол. эпох, training loss на каждом шаге в асинхронном коде. 

Дополнительно в примере есть подход для вызова subprocess команды в потоке и выполнения ее в фоне без блокировки асинхронности. Таким образом появляется файл tfevents во время обучения, который можно просматривать, а повторный вызов команды subprocess заблокирован, пока текущий процесс в потоке is_alive(). Команда может быть использована и для управления обучением на нескольких машинах по ssh (ничего не ограничивает ваше воображение). 

Для получения обновлений данных в реальном времени используются AJAX запросы на JavaScript. Backend на Aiohttp. 

<hr>

The example of working with tfevents files, using tensorboard to view the previous statistics of the trained model or view the current training of the model with the output of parameters, start time, end time, count. epochs, training loss at each step in asynchronous code.

Additionally, the example has an approach for calling a subprocess command on a thread and executing it in the background without blocking async. Thus, a tfevents file appears during training that can be viewed, and the re-invocation of the subprocess command is blocked while the current process in the is_alive () thread. The command can also be used to manage training on multiple machines via ssh (nothing limits your imagination).

AJAX JavaScript requests are used to get real-time data updates. Backend on Aiohttp.

<!-- CONTACT -->
## Контакт / Contact

Авторы / Author: [Владислав Радченко](https://github.com/wladradchenko/)

Почта / Email: [i@wladradchenko.ru](i@wladradchenko.ru)

<p align="right">(<a href="#top">вернуться наверх / back to top</a>)</p>

