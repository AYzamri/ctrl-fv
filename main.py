from flask import Flask, render_template, request
import server_logic

app = Flask(__name__, template_folder='Templates')
stored = []


@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')


#
# @app.route('/enqueue', methods=['POST'])
# def enqueue():
#     print('enqueue')
#     data = json.loads(request.data.decode("utf-8"))
#     message = data['message']
#     queueName = 'indexq'
#     server_logic.enqueue_message(queueName, message)
#     return '', 200
#
#
# @app.route('/dequeue', methods=['POST'])
# def dequeue():
#     data = request.form
#     message = data['message']
#     stored.append(message)
#     return '', 200


@app.route('/video', methods=['POST'])
def uploadvideo():
    file = request.files['file']
    blobName = 'blob1'
    server_logic.uploav_vid_to_blob(name=blobName, vid=file)

    return '', 200


@app.route('/partial/<path:path>')
def serve_partial(path):
    return render_template('partial/{}'.format(path))


@app.after_request
def allow_cross_domain(response):
    """Hook to set up response headers."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'content-type'
    return response


if __name__ == '__main__':
    app.run()
