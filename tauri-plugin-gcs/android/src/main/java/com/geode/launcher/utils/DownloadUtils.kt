package com.geode.launcher.utils

import android.os.Build
import android.os.FileUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runInterruptible
import kotlinx.coroutines.withContext
import okio.FileSystem
import okio.Path.Companion.toOkioPath
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.zip.ZipInputStream


typealias ProgressCallback = (progress: Long, outOf: Long) -> Unit

object DownloadUtils {
    suspend fun copyZipStreamToDirectory(inputStream: InputStream, output: File) = runInterruptible {
        ZipInputStream(inputStream).use { zipStream ->
            if (output.exists()) output.deleteRecursively()
            output.mkdirs()

            val canonicalOutput = output.canonicalPath

            var entry = zipStream.nextEntry
            while (entry != null) {
                val destination = File(output, entry.name)
                if (!destination.canonicalPath.startsWith(canonicalOutput)) {
                    throw IOException("attempted copy to outside of output directory: ${entry.name}")
                }

                if (destination.isDirectory) {
                    destination.mkdirs()
                } else {
                    destination.parentFile?.mkdirs()

                    destination.outputStream().use { destinationStream ->
                        zipStream.copyTo(destinationStream)
                    }
                }

                entry = zipStream.nextEntry
            }
        }
    }

    /**
     * Extracts a file named by zipPath from inputStream and copies it to outputStream
     *
     * inputStream and outputStream are both closed after this function executes
     */
    suspend fun extractFileFromZipStream(inputStream: InputStream, output: File, zipPath: String) {
        // note to self: ZipInputStreams are a little silly
        // (runInterruptible allows it to cancel, otherwise it waits for the stream to finish)
        runInterruptible {
            inputStream.use { input ->
                output.outputStream().use { out ->
                    // nice indentation
                    ZipInputStream(input).use { zip ->
                        var entry = zip.nextEntry
                        while (entry != null) {
                            if (entry.name == zipPath) {
                                zip.copyTo(out)
                                return@runInterruptible
                            }

                            entry = zip.nextEntry
                        }

                        // no matching entries found, throw exception
                        throw IOException("no file found for $zipPath")
                    }
                }
            }
        }
    }

    suspend fun copyFile(from: File, to: File) {
        val fs = FileSystem.SYSTEM

        val fromPath = from.toOkioPath()
        val toPath = to.toOkioPath()

        withContext(Dispatchers.IO) {
            fs.copy(fromPath, toPath)
        }
    }

    /**
     * Copies data from inputStream to outputStream
     *
     * Both streams are closed upon the conclusion of this function.
     */
    fun copyFile(inputStream: InputStream, outputStream: OutputStream) {
        // gotta love copying
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            inputStream.use { input -> outputStream.use { output ->
                FileUtils.copy(input, output)
            }}
        } else {
            inputStream.use { input -> outputStream.use { output ->
                input.copyTo(output)
            }}
        }
    }

    suspend fun copyDirectory(sourceFile: File, outputFile: File) = withContext(Dispatchers.IO) {
        sourceFile.copyRecursively(
            outputFile,
            overwrite = true
        )
    }
}