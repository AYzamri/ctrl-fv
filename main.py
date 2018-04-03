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
def uploadvideo():
    try:
        data = json.loads(request.data.decode())
        video_id = data['videoID']
        video_name = data['videoName']
        video_description = data['videoDescription']
        user_email = data['user']
        server_logic.upload_vid_meta_data(blobname=video_id, videoname=video_name, videodescription=video_description,
                                          user_id=user_email)
    except Exception as e:
        return e, 501
    return '', 200


@app.route('/invertedIndex', methods=['GET'])
def getInvertedIndex():
    try:
        vid_id = request.args.get('vidid')
        index_json = server_logic.get_inverted_index_json(vid_id)
    except Exception as e:
        return e, 501
    return index_json, 200


@app.route('/searchForVideo', methods=['GET'])
def searchForVideo():
    try:
        search_term = request.args.get('searchterm')
        search_term = urllib.parse.unquote(search_term)
        videos = server_logic.get_videos_by_term(search_term)
        return json.dumps(videos), 200
    except Exception as e:
        return e, 501


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
        return e, 501


@app.route('/signup', methods=['POST'])
def sigunp():
    try:
        user = request.json
        isUnique = server_logic.signup(user)
        return json.dumps(isUnique), 200
    except Exception as e:
        return e, 501


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
