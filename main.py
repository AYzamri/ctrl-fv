import os
import json
from flask import Flask, render_template, request, jsonify
import server_logic
import urllib.parse
from whoosh.index import *
from whoosh.fields import *

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
        duration = data['duration']
        server_logic.upload_vid_meta_data(blobname=video_id, videoname=video_name, videodescription=video_description,
                                          duration=duration, user_id=user_email)
        server_logic.enqueue_message('video-to-extractor-q', video_id)
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


@app.route('/createUpdateWhooshIndex', methods=['POST'])
def create_update_whoosh_index():
    from azure.storage.blob import BlockBlobService
    try:
        account_name = 'cfvtes9c07'
        account_key = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='
        container_name = "corpus-container"
        block_blob_service = BlockBlobService(account_name, account_key)
        index_dir = "CorpusIndex"

        data = json.loads(request.data.decode())
        video_id = data["videoID"]
        video_content = block_blob_service.get_blob_to_text(container_name, video_id, encoding="utf-16").content    # TODO: Deal with the encoding shit

        if not os.path.exists(index_dir):
            os.mkdir(index_dir)
            schema = Schema(title=TEXT(stored=True), content=TEXT(stored=True, analyzer=StemmingAnalyzer(), spelling=True))
            index = create_in(index_dir, schema)
        else:
            index = open_dir(index_dir)
        index_writer = index.writer()
        index_writer.add_document(title=video_id, content=video_content)
        index_writer.commit()
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
    app.run(threaded=True)
