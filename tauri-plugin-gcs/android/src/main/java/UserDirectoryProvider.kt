package sa1nt.gcs

import android.provider.DocumentsContract

private val DEFAULT_ROOT_PROJECTION: Array<String> = arrayOf(
    DocumentsContract.Root.COLUMN_ROOT_ID,
    DocumentsContract.Root.COLUMN_FLAGS,
    DocumentsContract.Root.COLUMN_ICON,
    DocumentsContract.Root.COLUMN_TITLE,
    DocumentsContract.Root.COLUMN_DOCUMENT_ID,
)

private val DEFAULT_DOCUMENT_PROJECTION: Array<String> = arrayOf(
    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
    DocumentsContract.Document.COLUMN_MIME_TYPE,
    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
    DocumentsContract.Document.COLUMN_LAST_MODIFIED,
    DocumentsContract.Document.COLUMN_FLAGS,
    DocumentsContract.Document.COLUMN_SIZE
)

