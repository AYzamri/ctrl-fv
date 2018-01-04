from azure.storage.blob import BlockBlobService, PublicAccess
from flask import Flask, render_template, request, jsonify
from azure.storage.queue import QueueService
import json

app = Flask(__name__, template_folder='Templates')
stored = []
accName = 'cfvtes9c07'
accKey = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='


@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')


@app.route('/enqueue', methods=['POST'])
def enqueue():
    print('enqueue')
    data = json.loads(request.data.decode("utf-8"))
    message = data['message']
    accName = 'cfvtes9c07'
    accKey = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='
    queueName = 'indexq'

    queue_service = QueueService(account_name=accName, account_key=accKey)
    queue_service.put_message(queueName, message)
    return '', 200


@app.route('/video', methods=['POST'])
def uploadVideo():
    file = request.files['file']

    block_blob_service = BlockBlobService(account_name=accName, account_key=accKey)
    container_name = 'videoscontainer'
    # Set the permission so the blobs are public.
    block_blob_service.set_container_acl(container_name, public_access=PublicAccess.Container)

    block_blob_service.create_blob_from_stream(container_name=container_name, blob_name='blob1', stream=file)
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
