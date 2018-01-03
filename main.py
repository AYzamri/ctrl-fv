from flask import Flask, render_template, request
from azure.storage.queue import QueueService
import json
# import requests

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
    queueName = 'q2test'
    accKey = 'LqjIxytc6pNz4MZkyEjqFxsi+ibW9A+XBA/634nQ8Di64hqINDNyiV+iVqE76yjYR7FNGpC6BY8yuzcExgNGAw=='

    # body = '<QueueMessage><MessageText>{0}</MessageText></QueueMessage>'.format(message)
    # url = 'https://{0}.queue.core.windows.net/{1}/messages?'.format(
    #     accName, queueName)
    # requests.post(url=url, data=body)

    queue_service = QueueService(account_name=accName, account_key=accKey)
    queue_service.put_message(queueName, message)
    return '', 200

if __name__ == '__main__':
    app.run()
