import json

from flask import Flask, render_template, request, jsonify
import server_logic
import urllib

app = Flask(__name__, template_folder='Templates')


@app.route('/', methods=['GET'])
def serve_main():
    return render_template('index.html')


@app.route('/partial/<path:path>')
def serve_partial(path):
    return render_template('partial/{}'.format(path))


@app.route('/video', methods=['POST'])
def uploadvideo():
    try:
        video = request.files['video']
        transcript = request.files['transcript']
        video_name = request.form['videoName']
        video_description = request.form['videoDescription']
        vid_id = server_logic.create_id_by_name(video_name)

        server_logic.upload_file_to_blob(name=vid_id, file=video, container_name='videoscontainer')
        server_logic.upload_file_to_blob(name=vid_id, file=transcript, container_name='transcriptscontainer')
        server_logic.enqueue_message(qname='indexq', message=vid_id)
        server_logic.upload_vid_meta_data(blobname=vid_id, videoname=video_name, videodescription=video_description)
    except Exception as e:
        return 'Error', 501
    return '', 200


@app.route('/invertedIndex', methods=['GET'])
def getInvertedIndex():
    try:
        vid_id = request.args.get('vidid')
        index_json = server_logic.get_inverted_index_json(vid_id)
    except Exception as e:
        return 'Error', 501
    return index_json, 200


@app.route('/searchForVideo', methods=['GET'])
def searchForVideo():
    try:
        vid = 'searchterm'
        # videosids = server_logic.get_videos_by_term(search_term)
    except Exception as e:
        return 'Error', 501
    return 'videosids', 200


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        user = server_logic.login(email, password)
        if not user:
            return 'Wrong username or password', 403
        return json.dumps(user), 200
    except Exception as e:
        return 'Error', 501


# def handle_error(status_code, error):
#     response = jsonify({'code': status_code, 'message': error})
#     response.status_code = status_code
#     return response


@app.after_request
def allow_cross_domain(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'content-type'
    return response


if __name__ == '__main__':
    app.run()
