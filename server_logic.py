import os
import json
import pyodbc
import datetime
import urllib.parse
from base64 import b64encode
from whoosh import scoring
from whoosh.qparser import QueryParser
from whoosh.fields import Schema, TEXT
from whoosh.index import create_in, open_dir
from whoosh.analysis import StemmingAnalyzer
from azure.storage.queue import QueueService
from azure.storage.table import TableService
from azure.storage.blob import BlockBlobService, PublicAccess

storage_acc_name = 'cfvtes9c07'
storage_acc_key = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='
table_service = TableService(account_name=storage_acc_name, account_key=storage_acc_key)
corpus_index_dir = "CorpusIndex"


def get_sql_cnxn():
    server = 'cfvtest.database.windows.net'
    database = 'cfvtest'
    username = 'drasco'
    server_password = 'testTest1'
    driver = '{ODBC Driver 13 for SQL Server}'
    cnxn = pyodbc.connect(
        'DRIVER=' + driver + ';PORT=1433;SERVER=' + server + ';PORT=1443;DATABASE=' + database + ';UID=' + username + ';PWD=' + server_password)
    return cnxn


def create_id_by_name(name):
    date_time_str = datetime.datetime.today().strftime('%d%m%Y_%H%M')
    name = '{}_{}.mp4'.format(name, date_time_str)
    return name


def upload_file_to_blob(name, file, container_name):
    block_blob_service = BlockBlobService(account_name=storage_acc_name, account_key=storage_acc_key)
    # Set the permission so the blobs are public.
    block_blob_service.set_container_acl(container_name, public_access=PublicAccess.Container)
    block_blob_service.create_blob_from_stream(container_name=container_name, blob_name=name, stream=file)


def enqueue_message(q_name, message):
    message = b64encode(message.encode('ascii')).decode()
    queue_service = QueueService(account_name=storage_acc_name, account_key=storage_acc_key)
    queue_service.put_message(q_name, message)


def get_inverted_index(vid_id):
    terms = table_service.query_entities(table_name='VideosInvertedIndexes',
                                         filter='PartitionKey eq \'' + vid_id + '\'')
    if not terms.items:
        return {}
    index = {}
    for entry in terms.items:
        word = entry['RowKey']
        index[word] = {}
        for prop in entry:
            if prop.startswith('t_'):
                time = prop.replace('t_', '').replace('_', '.')
                index[word][time] = entry[prop]
    return index


def get_progress_data(vid_id):
    data_returned = table_service.query_entities(table_name='VideosIndexProgress',
                                                 filter='PartitionKey eq \'' + vid_id + '\'')
    if not data_returned.items:
        return {}
    entry = data_returned.items[0]
    progress = {"ID": entry['PartitionKey'], "totalSegments": float(entry['RowKey']),
                'analyzedSegments': sorted([entry[prop] for prop in entry if prop.startswith('t_')])}
    return progress


def get_inverted_index_json(vid_id):
    inverted = get_inverted_index(vid_id)
    progress_data = get_progress_data(vid_id)
    data = {"index": inverted, "progress": progress_data}
    json_text = json.dumps(data)
    parsed = urllib.parse.unquote(json_text)
    return parsed


def upload_vid_meta_data(blob_name, video_name, video_description, duration, user_id='none'):
    cnxn = get_sql_cnxn()
    cursor = cnxn.cursor()
    table = "VideosMetaData"
    query = "INSERT INTO {0} (vid_id,title,description,userID,duration) VALUES('{1}','{2}','{3}','{4}',{5})"
    query = query.format(table, blob_name, video_name, video_description, user_id, duration)
    cursor.execute(query)
    cnxn.commit()


def get_videos_by_term(search_term):
    vid_ids = get_video_ids_by_term(search_term.lower())
    if len(vid_ids) == 0:
        return {}
    video_info = get_video_info_by_vid_ids(vid_ids)
    return video_info


def get_video_ids_by_term(search_term):
    # region Whoosh search
    # index = open_dir(corpus_index_dir)
    # with index.searcher(weighting=scoring.TF_IDF()) as searcher:
    #     query_object = QueryParser("content", index.schema).parse(search_term)
    #     results = searcher.search(query_object, limit=None)
    #     # keywords = results.key_terms("content")
    #     # suggestion = searcher.correct_query(query_object, search_term).string
    # video_ids = {result.fields()["title"] for result in results}
    # endregion

    # region Naive search
    vid_ids = table_service.query_entities(table_name='CorpusInvertedIndex',
                                           filter='PartitionKey eq \'' + search_term + '\'',
                                           select='RowKey')
    if not vid_ids.items or len(vid_ids.items) == 0:
        return []
    video_ids = {record['RowKey'] for record in vid_ids.items}
    # endregion

    return video_ids


def get_video_info_by_vid_ids(vid_ids):
    cnxn = get_sql_cnxn()
    cursor = cnxn.cursor()
    list_vid_ids = list(vid_ids)
    ids_as_string = ','.join('\'{0}\''.format(id) for id in list_vid_ids)
    query = "SELECT * FROM {0} WHERE vid_id in ({1})"
    query = query.format('VideosMetaData', ids_as_string)
    cursor.execute(query)
    columns = [column[0] for column in cursor.description]
    data = cursor.fetchall()
    if not data or len(data) == 0:
        return {}
    results = [dict(zip(columns, row)) for row in data]
    return results


def create_update_whoosh_index(video_id):
    container_name = "corpus-container"
    video_id_no_txt_extension = os.path.splitext(video_id)[0]
    block_blob_service = BlockBlobService(storage_acc_name, storage_acc_key)
    video_content = block_blob_service.get_blob_to_text(container_name, video_id).content
    if not os.path.exists(corpus_index_dir):
        os.mkdir(corpus_index_dir)
        schema = Schema(title=TEXT(stored=True), content=TEXT(stored=True, analyzer=StemmingAnalyzer(), spelling=True))
        # TODO: why do we need stored=True for "content"? Loads memory and reduces performance
        index = create_in(corpus_index_dir, schema)
    else:
        index = open_dir(corpus_index_dir)
    index_writer = index.writer()
    index_writer.add_document(title=video_id_no_txt_extension, content=video_content)
    index_writer.commit()


def login(email, password):
    cnxn = get_sql_cnxn()
    cursor = cnxn.cursor()
    table = 'Users'
    query = "SELECT * FROM {0} WHERE email = '{1}' AND password = '{2}'"
    query = query.format(table, email, password)
    cursor.execute(query)
    user_columns = [column[0] for column in cursor.description]
    user_data = cursor.fetchone()
    if not user_data:
        return None
    user = dict(zip(user_columns, user_data))
    query = "SELECT * FROM VideosMetaData WHERE userID = '{0}'"
    query = query.format(email)
    cursor = cnxn.cursor()
    cursor.execute(query)
    videos_columns = [column[0] for column in cursor.description]
    vids_data = cursor.fetchall()
    vids = [dict(zip(videos_columns, row)) for row in vids_data]
    user['videosData'] = vids
    return user


def signup(user):
    cnxn = get_sql_cnxn()
    table = 'Users'
    query = "SELECT email FROM {0} WHERE email = '{1}'"
    query = query.format(table, user['email'])
    cursor = cnxn.cursor()
    cursor.execute(query)
    data = cursor.fetchall()
    if not data or len(data) == 0:
        query = "INSERT INTO Users(email,username,password,firstName,lastName)" \
                "VALUES ('{0}','{1}','{2}','{3}','{4}')"
        query = query.format(user['email'], user['username'], user['password'], user['firstName']
                             , user['lastName'])
        cursor.execute(query)
        cnxn.commit()
        return True
    else:
        return False
        # raise ValueError('The email is allready in use!')
