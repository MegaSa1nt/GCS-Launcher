package com.geode.launcher.utils

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.Keep
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.documentfile.provider.DocumentFile
import java.io.File
import java.lang.ref.WeakReference
import kotlin.system.exitProcess

@Keep
@Suppress("unused", "KotlinJniMissingFunction")
object GeodeUtils {
    private lateinit var activity: WeakReference<AppCompatActivity>
    private lateinit var openDirectoryResultLauncher: ActivityResultLauncher<Uri?>
    private lateinit var requestPermissionLauncher: ActivityResultLauncher<String>
    private lateinit var internalRequestPermissionsLauncher: ActivityResultLauncher<Array<String>>
    private lateinit var internalRequestAllFilesLauncher: ActivityResultLauncher<Intent>

    private var afterRequestPermissions: (() -> Unit)? = null
    private var afterRequestPermissionsFailure: (() -> Unit)? = null

    @JvmStatic
    fun getLogcatCrashBuffer(): String {
        return try {
            val logcatProcess = Runtime.getRuntime().exec("logcat -v brief -b crash -d")

            logcatProcess.inputStream.bufferedReader().readText()
        } catch (e: Exception) {
            Log.e("Geode", "Failed to get logcat crash buffer", e)
            ""
        }
    }

    @JvmStatic
    fun writeClipboard(text: String) {
        activity.get()?.run {
            val manager = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Geode", text)
            manager.setPrimaryClip(clip)
        }
    }

    @JvmStatic
    fun readClipboard(): String {
        activity.get()?.run {
            val manager = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = manager.primaryClip
            if (clip != null && clip.itemCount > 0) {
                return clip.getItemAt(0).coerceToText(this).toString()
            }
        }
        return ""
    }

    @JvmStatic
    fun restartGame() {
        activity.get()?.run {
            packageManager.getLaunchIntentForPackage(packageName)?.also {
                val mainIntent = Intent.makeRestartActivityTask(it.component)
                mainIntent.putExtra("restarted", true)
                startActivity(mainIntent)
                exitProcess(0)
            }
        }
    }

    private external fun selectFileCallback(path: String)

    private external fun selectFilesCallback(paths: Array<String>)

    private external fun failedCallback()

    private fun checkForFilePermissions(onSuccess: () -> Unit, onFailure: () -> Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            if (Environment.isExternalStorageManager()) {
                onSuccess()
            } else {
                val intent = Intent(
                    ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                    Uri.fromParts("package","sa1nt.gcs", null)
                )

                internalRequestAllFilesLauncher.launch(intent)
                afterRequestPermissions = onSuccess
                afterRequestPermissionsFailure = onFailure
            }
        } else {
            val permissions = listOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            )

            val context = activity.get()!!

            val needsPermissions = permissions.filter {
                ContextCompat.checkSelfPermission(context, it) != PackageManager.PERMISSION_GRANTED
            }

            if (needsPermissions.isNotEmpty()) {
                internalRequestPermissionsLauncher.launch(needsPermissions.toTypedArray())
                afterRequestPermissions = onSuccess
                afterRequestPermissionsFailure = onFailure
            } else {
                onSuccess()
            }
        }
    }

    @JvmStatic
    fun getBaseDirectory(): String {
        val activity = activity.get()!!
        return LaunchUtils.getBaseDirectory(activity).canonicalPath
    }

    @JvmStatic
    fun getInternalDirectory(): String {
        val activity = activity.get()!!
        return activity.filesDir.canonicalPath
    }

    private val gameVersionMap = mapOf(
        37L to "2.200",
        38L to "2.205"
    )

    @JvmStatic
    fun getGameVersion(): String {
        // these versions should be aligned to windows releases, not what android says
        activity.get()?.run {
            return GamePackageUtils.getUnifiedVersionName(packageManager)
        }

        return ""
    }

    fun isGeodeUri(uri: Uri): Boolean {
        return "com.geode.launcher.user" == uri.authority
    }

    private const val INTERNAL_PERMISSION_PREFIX = "geode.permission_internal"
    private const val MANAGE_ALL_FILES = "${INTERNAL_PERMISSION_PREFIX}.MANAGE_ALL_FILES"

    @JvmStatic
    fun getPermissionStatus(permission: String): Boolean {
        val context = activity.get() ?: return false

        return when (permission) {
            MANAGE_ALL_FILES -> if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Environment.isExternalStorageManager()
            } else {
                val permissions = listOf(
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
                )

                return permissions.all {
                    ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
                }
            }
            else -> ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
        }
    }

    @JvmStatic
    fun requestPermission(permission: String) {
        if (permission == MANAGE_ALL_FILES) {
            // this function handles already having perms for us
            checkForFilePermissions(onSuccess = {
                permissionCallback(true)
            }, onFailure = {
                permissionCallback(false)
            })

            return
        }

        if (getPermissionStatus(permission)) {
            permissionCallback(true)
            return
        }

        try {
            requestPermissionLauncher.launch(permission)
        } catch (e: ActivityNotFoundException) {
            permissionCallback(false)
        }
    }

    private external fun permissionCallback(granted: Boolean)

    const val ARGUMENT_SAFE_MODE = "--geode:safe-mode"

    private var additionalLaunchArguments = arrayListOf<String>()
    fun setAdditionalLaunchArguments(vararg args: String) {
        additionalLaunchArguments.addAll(args)
    }

    fun clearLaunchArguments() = setAdditionalLaunchArguments()

    @JvmStatic
    fun getLaunchArguments(): String? {
        activity.get()?.apply {
            val preferences = PreferenceUtils.get(this)

            val userArgs = preferences.getString(PreferenceUtils.Key.LAUNCH_ARGUMENTS)
            val args = if (!userArgs.isNullOrEmpty()) {
                listOf(userArgs) + additionalLaunchArguments
            } else additionalLaunchArguments

            return args.joinToString(" ")
        }

        return null
    }

    interface CapabilityListener {
        fun onCapabilityAdded(capability: String): Boolean
    }

    const val CAPABILITY_EXTENDED_INPUT = "extended_input"
    const val CAPABILITY_TIMESTAMP_INPUT = "timestamp_inputs"

    private var capabilityListener: WeakReference<CapabilityListener?> = WeakReference(null)

    fun setCapabilityListener(listener: CapabilityListener) {
        capabilityListener = WeakReference(listener)
    }

    @JvmStatic
    fun reportPlatformCapability(capability: String?): Boolean {
        if (capability.isNullOrEmpty()) {
            return false
        }

        return capabilityListener.get()?.onCapabilityAdded(capability) ?: false
    }

    external fun nativeKeyUp(keyCode: Int, modifiers: Int)
    external fun nativeKeyDown(keyCode: Int, modifiers: Int, isRepeating: Boolean)
    external fun nativeActionScroll(scrollX: Float, scrollY: Float)
    external fun resizeSurface(width: Int, height: Int)

    // represents the timestamp of the next input callback, in nanoseconds (most events don't send it, but it's there)
    external fun setNextInputTimestamp(timestamp: Long)
}