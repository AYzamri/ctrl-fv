from flask import Flask, render_template, request, jsonify
from azure.storage.queue import QueueService
import json

app = Flask(__name__, template_folder='Templates')
stored = []


@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')


@app.route('/enqueue', methods=['POST'])
def enqueue():
    print('enqueue')
    data = json.loads(request.data.decode("utf-8"))
    message = data['message']
    accName = 'cfvftestac3f'
    queueName = 'q3test'
    accKey = '50hNdU1mXcoWTVMsB00FD55N92kq+/7Xmml43SfeKGby0n+63htAWR9i6AyEW9JglmDkF73T+qw5t5uA/LK0jg=='

    # body = '<QueueMessage><MessageText>{0}</MessageText></QueueMessage>'.format(message)
    # url = 'https://{0}.queue.core.windows.net/{1}/messages?'.format(
    #     accName, queueName)
    # requests.post(url=url, data=body)

    queue_service = QueueService(account_name=accName, account_key=accKey)
    queue_service.put_message(queueName, message)
    return '', 200


@app.route('/dequeue', methods=['POST'])
def dequeue():
    data = request.form
    message = data['message']
    stored.append(message)
    return '', 200


@app.route('/messages', methods=['GET'])
def messages():
    return jsonify(stored)


if __name__ == '__main__':
    app.run()
