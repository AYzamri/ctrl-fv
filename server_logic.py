from azure.storage.blob import BlockBlobService, PublicAccess
from azure.storage.queue import QueueService
import base64

storage_acc_name = 'cfvtes9c07'
storage_acc_key = 'DSTJn6a1dS9aaoJuuw6ZOsnrsiW9V1jODJyHtekkYkc3BWofGVQjS6/ICWO7v51VUpTHSoiZXVvDI66uqTnOJQ=='


def uploav_file_to_blob(name, file, container_name):
    block_blob_service = BlockBlobService(account_name=storage_acc_name, account_key=storage_acc_key)
    # Set the permission so the blobs are public.
    block_blob_service.set_container_acl(container_name, public_access=PublicAccess.Container)
    block_blob_service.create_blob_from_stream(container_name=container_name, blob_name=name, stream=file)


def enqueue_message(qname, message):
    message = base64.b64encode(bytes(message, 'utf-8'))
    queue_service = QueueService(account_name=storage_acc_name, account_key=storage_acc_key)
    queue_service.put_message(qname, message)


def upload_vid_meta_data(blobname, videoname, videodescription):
    print('hel')
