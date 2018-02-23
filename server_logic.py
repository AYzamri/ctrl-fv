from azure.storage.blob import BlockBlobService, PublicAccess
from azure.storage.queue import QueueService
from azure.storage.table import TableService, Entity
import pyodbc
import datetime
import urllib.parse
import json
from base64 import b64encode

storage_acc_name = 'cfvtes9c07'
storage_acc_key = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='


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


def enqueue_message(qname, message):
    message = b64encode(message.encode('ascii')).decode()
    queue_service = QueueService(account_name=storage_acc_name, account_key=storage_acc_key)
    queue_service.put_message(qname, message)


def get_inverted_index(vid_id):
    service = TableService(account_name=storage_acc_name, account_key=storage_acc_key)
    terms = service.query_entities(table_name='VideosInvertedIndexes',
                                   filter='PartitionKey eq \'' + vid_id + '\'',
                                   select='RowKey,Appearances')
    if not terms.items:
        raise Exception('Inverted index for Video ID {} not found'.format(vid_id))
    index = {record['RowKey']: record['Appearances'] for record in terms.items}
    return index


def get_inverted_index_json(vid_id):
    inverted = get_inverted_index(vid_id)
    json_text = json.dumps(inverted)
    parsed = urllib.parse.unquote(json_text)
    return parsed


def upload_vid_meta_data(blobname, videoname, videodescription, user_id='none'):
    cnxn = get_sql_cnxn()
    cursor = cnxn.cursor()
    table = "VideosMetaData"
    query = "INSERT INTO {0} (vid_id,title,description,userID) VALUES('{1}','{2}','{3}','{4}')"
    query = query.format(table, blobname, videoname, videodescription, user_id)
    cursor.execute(query)
    cnxn.commit()


def get_videos_by_term(search_term):
    vid_ids = get_video_ids_by_term(search_term)
    return vid_ids


def get_video_ids_by_term(search_term):
    service = TableService(account_name=storage_acc_name, account_key=storage_acc_key)
    vid_ids = service.query_entities(table_name='CorpusInvertedIndex',
                                     filter='PartitionKey eq \'' + search_term + '\'',
                                     select='RowKey')
    if not vid_ids.items:
        raise Exception('Corpus Inverted index for search term {} not found'.format(search_term))
    return vid_ids.items


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
    cursor = cnxn.cursor()
    query = "INSERT INTO Users(email,username,password,firstName,lastName)" \
            "VALUES ('{0}','{1}','{2}','{3}','{4}')"
    query = query.format(user['email'], user['username'], user['password'], user['firstName']
                         , user['lastName'])
    cursor.execute(query)
    cnxn.commit()
