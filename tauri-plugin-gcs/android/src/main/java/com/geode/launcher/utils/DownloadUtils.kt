package com.geode.launcher.utils

import android.os.Build
import android.os.FileUtils
import java.io.InputStream
import java.io.OutputStream

object DownloadUtils {
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
}