package sa1nt.gcs

import android.Manifest
import android.app.Activity
import android.content.Context.POWER_SERVICE
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.startActivity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import com.geode.launcher.main.onLaunch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import ru.solrudev.ackpine.installer.PackageInstaller
import ru.solrudev.ackpine.installer.createSession
import ru.solrudev.ackpine.session.Session
import ru.solrudev.ackpine.session.await
import ru.solrudev.ackpine.session.parameters.Confirmation
import java.io.File
import kotlin.coroutines.cancellation.CancellationException


@InvokeArg
class PingArgs {
  var value: String? = null
}

@TauriPlugin
class GCSPlugin(private val activity: Activity): Plugin(activity) {
    private val context = activity.applicationContext
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    @Command
    fun install(invoke: Invoke) {
        scope.launch {
            installSuspended(invoke)
        }
    }

    @Command
    fun openInstallSettings(invoke: Invoke) {
        val canWriteFiles = ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
        if(!canWriteFiles) {
            ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE), 1000)
        }

        val pm = context.getSystemService(POWER_SERVICE) as PowerManager?
        val isBatterySaved = !pm!!.isIgnoringBatteryOptimizations(context.packageName)
        if (isBatterySaved) {
            val batteryIntent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + context.packageName))
            batteryIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            startActivity(context, batteryIntent, null)
        }

        val canInstallApps = context.packageManager.canRequestPackageInstalls()
        if(!canInstallApps) {
            val installIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + context.packageName))
            installIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            startActivity(context, installIntent, null)
        }

        val ret = JSObject()
        ret.put("value", "$canWriteFiles|$isBatterySaved|$canInstallApps")
        invoke.resolve(ret)
    }

    private suspend fun installSuspended(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)
        val value = args.value.toString()
        val apkUri = Uri.fromFile(File(value))
        val packageInstaller = PackageInstaller.getInstance(context)

        val ret = JSObject()

        try {
            when (val result = packageInstaller.createSession(apkUri, {confirmation = Confirmation.IMMEDIATE}).await()) {
                Session.State.Succeeded -> {
                    ret.put("value", "Success")
                    invoke.resolve(ret)
                }
                else -> {
                    ret.put("value", "$result")
                    invoke.resolve(ret)
                }
            }
        } catch (cancellationException: CancellationException) {
            ret.put("value", "Failure")
            invoke.resolve(ret)
        } catch (exception: Exception) {
            println(exception)
            ret.put("value", "$exception")
            invoke.resolve(ret)
        }
    }

    @Command
    fun run(invoke: Invoke) {
        val args = invoke.parseArgs(PingArgs::class.java)
        val value = args.value.toString()
        val intent = context.packageManager.getLaunchIntentForPackage(value)
        val ret = JSObject()

        if(intent != null) {
            try {
                onLaunch(context)
            } catch(e: Exception) {
                ret.put("value", e.message)
                invoke.resolve(ret)
            }
        } else {
            ret.put("value", "false")
            invoke.resolve(ret)
        }
    }
}