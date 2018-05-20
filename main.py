import json
from flask import Flask, render_template, request, jsonify
import server_logic
import urllib.parse

app = Flask(__name__, template_folder='Templates')


@app.route('/', methods=['GET'])
def serve_main():
    return render_template('index.html')


@app.route('/partial/<path:path>')
def serve_partial(path):
    return render_template('partial/{}'.format(path))


@app.route('/videoData', methods=['POST'])
def upload_video():
    try:
        data = json.loads(request.data.decode())
        video_id = data['videoID']
        video_name = data['videoName']
        video_description = data['videoDescription']
        user_email = data['user']
        duration = data['duration']
        video_url = data['videoUrl']
        server_logic.upload_vid_meta_data(blob_name=video_id,
                                          video_name=video_name,
                                          video_description=video_description,
                                          duration=duration,
                                          user_id=user_email,
                                          video_url=video_url)
        server_logic.enqueue_message('video-to-extractor-q', video_id)
    except Exception as e:
        return repr(e), 501
    return '', 200


@app.route('/videoData', methods=['GET'])
def video_data():
    try:
        vid_id = request.args.get('vidid')
        return json.dumps(server_logic.get_videos_info([vid_id])[0]), 200
    except Exception as e:
        return repr(e), 501


@app.route('/invertedIndex', methods=['GET'])
def get_inverted_index():
    try:
        vid_id = request.args.get('vidid')
        index_json = server_logic.get_inverted_index_json(vid_id)
    except Exception as e:
        return repr(e), 501
    return index_json, 200


@app.route('/searchForVideo', methods=['GET'])
def search_for_video():
    try:
        query = request.args.get('query')
        query = urllib.parse.unquote(query)
        videos = server_logic.search_videos(query)
        return json.dumps(videos), 200
    except Exception as e:
        return repr(e), 501


@app.route('/createUpdateWhooshIndex', methods=['POST'])
def create_update_whoosh_index():
    try:
        data = json.loads(request.data.decode())
        video_id = data["videoID"]
        server_logic.create_update_whoosh_index(video_id)
        return '', 200
    except Exception as e:
        return repr(e), 501


@app.route('/updateVMD', methods=['POST'])
def update_vmd():
    try:
        data = json.loads(request.data.decode())
        video_id = data["videoID"]
        column_name = data["columnName"]
        column_value = data["columnValue"]
        server_logic.update_videos_meta_data(video_id, column_name, column_value)
        return '', 200
    except Exception as e:
        return repr(e), 501


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
        return repr(e), 501


@app.route('/signup', methods=['POST'])
def signup():
    try:
        user = request.json
        isUnique = server_logic.signup(user)
        return json.dumps(isUnique), 200
    except Exception as e:
        return repr(e), 501


# def handle_error(status_code, error):
#     response = jsonify({'code': status_code, 'message': error})
#     response.status_code = status_code
#     return response


@app.after_request
def allow_cross_domain(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'content-type'
    return response


@app.route('/removeVideoFromSystem', methods=['GET'])
def remove_video_from_system():
    try:
        video_id = request.args.get('vid')
        video_id = urllib.parse.unquote(video_id)
        server_logic.remove_video_from_system(video_id)
        return '', 200
    except Exception as e:
        return repr(e), 501


if __name__ == '__main__':
    app.run(threaded=True)
