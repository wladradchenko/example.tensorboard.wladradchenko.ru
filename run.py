import os
import time
import yaml
import asyncio
import pathlib
import threading
import subprocess
from aiohttp import web
from dotenv import load_dotenv
from tensorboard.backend.event_processing.event_accumulator import EventAccumulator


class Routes(web.View):
    """
    Pages
    """
    __slots__ = ("name", "types")

    def __init__(self, request: web.Request = None) -> None:
        """
        Initialization
        :param request: request
        """
        super().__init__(request)

    async def main(self, request: web.Request) -> web.FileResponse:
        """
        Main page
        :param request: request
        :return: responce
        """
        return web.FileResponse('static/html/index.html')

    async def event(self, request: web.Request) -> web.Response:
        file = request.query.get("file", None)

        if file:
            try:
                # Load the data from the events file
                event_acc = EventAccumulator(file)
                event_acc.Reload()

                epochs_statistic = event_acc.Scalars('epoch')
                epochs_wall_time = {}
                for i in range(1, len(epochs_statistic)):
                    if epochs_wall_time.get(int(epochs_statistic[i].value)):
                        epochs_wall_time[int(epochs_statistic[i].value)] += epochs_statistic[i].wall_time - \
                                                                            epochs_statistic[i - 1].wall_time
                    else:
                        epochs_wall_time[int(epochs_statistic[i].value)] = epochs_statistic[i].wall_time - \
                                                                           epochs_statistic[i - 1].wall_time
                else:
                    middle_epochs_wall_time = sum(list(epochs_wall_time.values())[:-1]) / len(
                        list(epochs_wall_time.values())[:-1])
                    last_epochs_wall_time = epochs_statistic[-1].wall_time

                max_epoch = 40
                cur_epoch = int(epochs_statistic[-1].value)

                if time.time() - last_epochs_wall_time < round(middle_epochs_wall_time) * 1.5:
                    time_passed = await self.convert_time(time.time() - event_acc.FirstEventTimestamp())
                    time_before_end = await self.convert_time(
                        round(middle_epochs_wall_time) * 40 - (time.time() - event_acc.FirstEventTimestamp()))
                else:
                    max_epoch = cur_epoch
                    time_passed = await self.convert_time(last_epochs_wall_time - event_acc.FirstEventTimestamp())
                    time_before_end = "00:00:00"

                training_loss_step = [(scalar_event.wall_time, scalar_event.step, scalar_event.value) for scalar_event in event_acc.Scalars('training_loss_step')]

                # Extract the scalar summaries
                data = {
                    "start_time": await self.convert_time(event_acc.FirstEventTimestamp(), True, True),
                    "time_passed": time_passed,
                    "middle_time_epoch": await self.convert_time(round(middle_epochs_wall_time)),
                    "time_before_end": time_before_end,
                    "epoch": cur_epoch,
                    "max_epoch": max_epoch,
                    "progress": 100 - (max_epoch - cur_epoch) / max_epoch * 100,
                    "training_loss_step": training_loss_step
                }
            except:
                # Empy data
                data = {
                    "start_time": 0,
                    "time_passed": 0,
                    "middle_time_epoch": 0,
                    "time_before_end": 0,
                    "epoch": 0,
                    "max_epoch": 0,
                    "progress": 0,
                    "training_loss_step": 0
                }
        else:
            # Empy data
            data = {
                "start_time": 0,
                "time_passed": 0,
                "middle_time_epoch": 0,
                "time_before_end": 0,
                "epoch": 0,
                "max_epoch": 0,
                "progress": 0,
                "training_loss_step": 0
            }

        return web.json_response(data)

    async def convert_time(self, timeshtamp, return_date=False, localtime=False):
        """

        :param timeshtamp:
        :param return_date:
        :param localtime:
        :return:
        """
        if return_date:
            if localtime:
                return time.strftime('%m.%d.%Y %H:%M:%S', time.localtime(timeshtamp))
            return time.strftime('%m.%d.%Y %H:%M:%S', time.gmtime(timeshtamp))
        return time.strftime('%H:%M:%S', time.gmtime(timeshtamp))

    async def flatten_dict(self, d, prefix=''):
        for k, v in d.items():
            new_prefix = f"{prefix}: {k}" if prefix else k
            if isinstance(v, dict):
                async for item in self.flatten_dict(v, new_prefix):
                    yield item
            else:
                if v is None:
                    v = 'null'
                yield f" {new_prefix} {v};"

    async def start_training(self, request: web.Request) -> web.Response:
        data = await request.json()

        if pathlib.Path(request.app["log"]).exists() and len(data["nnSettingFile"]) > 0:
            config_dict = yaml.safe_load(data["nnTextYaml"])
            config_str = ""
            async for g in self.flatten_dict(config_dict):
                config_str += g

            cmd = f'python -c "import random; import time; start = time.time(); file = open(\'{request.app["log"]}\', \'a\'); file.write(\'СЕГОДНЯ [ПРОЦЕСС] <ИНФОРМАЦИЯ> Начало сессии. Скрипт запущен\' + \'\\n\'); time.sleep({int(data["nnParameterTwo"])}); file.write(\'СЕГОДНЯ [ПРОЦЕСС] <ИНФОРМАЦИЯ> Принятые данные: {config_str}\'); file.write(\'СЕГОДНЯ [ПРОЦЕСС] <ИНФОРМАЦИЯ> Скрипт отработал. Ответ: \' + str(random.random()) + \'\\n\'); file.close();"'

            # create subprocess asynchronously
            request.app["subprocess"] = threading.Thread(target=subprocess.run, args=(cmd,), kwargs={"shell": True})
            request.app["subprocess"].start()

        return web.Response(status=200)

    async def check_training_status(self, request: web.Request) -> web.json_response:
        # check if the subprocess is still running
        if request.app["subprocess"] is not None:
            if request.app["subprocess"].is_alive():
                status = 'running'
            else:
                status = 'finished'
        else:
            status = 'finished'
        return web.json_response({'status': status})

    async def tail(self, file_path, n=100):
        with open(file_path, "r", encoding="utf8") as f:
            f.seek(0, 2)
            end = f.tell()
            size = 1024
            lines_read = 0
            for i in range(n):
                if end - size > 0:
                    start = end - size
                else:
                    start = 0
                f.seek(start)
                buffer = f.read(end - start)
                lines = buffer.split('\n')
                if len(lines) > 1:
                    for line in lines[-2::-1]:
                        yield line
                        lines_read += 1
                        if lines_read == n:
                            break
                    end = start + len(lines[-1])
                else:
                    end = start
                if lines_read == n:
                    break

    async def log_stream(self, request: web.Request) -> web.json_response:
        if pathlib.Path(request.app["log"]).exists():
            lines = []
            async for line in self.tail(request.app["log"]):
                lines += [line]
            lines_reversed = [lines[i] for i in range(len(lines)-1, -1, -1)]
            return web.json_response({'log': lines_reversed})
        return web.json_response({'log': [404]})

    async def get_select_path_options(self, request: web.Request) -> web.json_response:
        log_train_file = None
        train_yaml_files = {}
        tfevents_files = {}

        for root, dirs, files in os.walk('media'):
            for file in files:
                folders = root.split("/")
                number_folders = [int(dir) for dir in folders if dir.isdigit()]
                if number_folders:
                    val = await self.convert_time(max(number_folders), True)
                else:
                    val = "undefind"

                if ".yaml" in file:
                    key = os.path.join(root, file)
                    train_yaml_files[key] = ""
                if "out.tfevents" in file:
                    key = os.path.join(root, file)
                    tfevents_files[key] = val
                if '.log' in file:
                    log_train_file = os.path.join(root, file)

        request.app["log"] = log_train_file

        return web.json_response({
            'status': 200,
            'input_files': train_yaml_files,
            'tfevents_files': tfevents_files,
            'train_log': log_train_file
        })

async def serve_static(request):
    headers = {'Cache-Control': 'no-cache'}  # set Cache-Control header to no-cache
    return web.FileResponse('media', headers=headers)


async def create_app() -> web.Application:
    """
    Create application
    :return:
    """
    application = web.Application()
    application["subprocess"] = None
    application["log"] = "log"
    application.add_routes([web.get('/', Routes().main),
                            web.post('/', Routes().main),
                            web.get('/event', Routes().event),
                            web.post('/event', Routes().event),
                            web.post('/start_training', Routes().start_training),
                            web.get('/check_training_status', Routes().check_training_status),
                            web.get('/get_select_path_options', Routes().get_select_path_options),
                            web.get('/log_stream', Routes().log_stream),
                            web.static('/static', 'static'),
                            web.static('/media', 'media'),
                            ])

    application.router.add_route('GET', '/media/{tail:.*}', serve_static)

    return application


web.run_app(create_app())
