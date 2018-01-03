from flask import Flask, render_template, request
from azure.storage.queue import QueueService
import json

app = Flask(__name__, template_folder='Templates')


@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')


@app.route('/enqueue', methods=['POST'])
def enqueue():
    print('enqueue')
    data = json.loads(request.data.decode("utf-8"))
    message = data['message']
    accName = 'ctrlfvtest8165'
    accKey = 'LqjIxytc6pNz4MZkyEjqFxsi+ibW9A+XBA/634nQ8Di64hqINDNyiV+iVqE76yjYR7FNGpC6BY8yuzcExgNGAw=='
    queue_service = QueueService(account_name=accName, account_key=accKey)
    queue_service.put_message('q2test', message)
    return '', 200


if __name__ == '__main__':
    app.run()
