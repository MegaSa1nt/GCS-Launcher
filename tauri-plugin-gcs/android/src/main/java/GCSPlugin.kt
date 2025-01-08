package sa1nt.gcs

import android.app.Activity
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import android.net.Uri
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
        if(intent != null) {
            val bool = context.startActivity(intent)
            val ret = JSObject()
            ret.put("value", bool)
            invoke.resolve(ret)
        } else {
            val ret = JSObject()
            ret.put("value", false)
            invoke.resolve(ret)
        }
    }

}