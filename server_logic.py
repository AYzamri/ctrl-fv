from azure.storage.blob import BlockBlobService, PublicAccess
from azure.storage.queue import QueueService
import pyodbc
import datetime
from base64 import b64encode

storage_acc_name = 'cfvtes9c07'
storage_acc_key = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='


def create_id_by_name(name):
    date_time_str = datetime.datetime.today().strftime('%d%m%Y_%H%M')
    name = '{}_{}'.format(name, date_time_str)
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


def upload_vid_meta_data(blobname, videoname, videodescription, user_id='none'):
    server = 'cfvtest.database.windows.net'
    database = 'cfvtest'
    username = 'drasco'
    password = 'testTest1'
    driver = '{ODBC Driver 13 for SQL Server}'
    table = 'VideosMetaData'
    cnxn = pyodbc.connect(
        'DRIVER=' + driver + ';PORT=1433;SERVER=' + server + ';PORT=1443;DATABASE=' + database + ';UID=' + username + ';PWD=' + password)
    cursor = cnxn.cursor()
    query = "INSERT INTO {0} (vid_id,title,description,userID) VALUES('{1}','{2}','{3}','{4}')"
    query = query.format(table, blobname, videoname, videodescription, user_id)
    cursor.execute(query)
    cnxn.commit()
