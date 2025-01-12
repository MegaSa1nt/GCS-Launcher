package sa1nt.gcs

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.pm.ActivityInfo
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.customRobTop.BaseRobTopActivity
import com.customRobTop.JniToCpp
import sa1nt.gcs.utils.Constants
import sa1nt.gcs.utils.ConstrainedFrameLayout
import sa1nt.gcs.utils.DownloadUtils
import sa1nt.gcs.utils.GamePackageUtils
import sa1nt.gcs.utils.GeodeUtils
import sa1nt.gcs.utils.LaunchUtils
import sa1nt.gcs.utils.PreferenceUtils
import org.cocos2dx.lib.Cocos2dxEditText
import org.cocos2dx.lib.Cocos2dxGLSurfaceView
import org.cocos2dx.lib.Cocos2dxHelper
import org.cocos2dx.lib.Cocos2dxRenderer
import org.fmod.FMOD
import java.io.File
import java.io.IOException

enum class DisplayMode {
    DEFAULT, LIMITED, FULLSCREEN;

    companion object {
        fun fromInt(i: Int) = when (i) {
            1 -> LIMITED
            2 -> FULLSCREEN
            else -> DEFAULT
        }
    }
}

class GeometryDashActivity : AppCompatActivity(), Cocos2dxHelper.Cocos2dxHelperListener, GeodeUtils.CapabilityListener {
    private var mGLSurfaceView: Cocos2dxGLSurfaceView? = null
    private val sTag = GeometryDashActivity::class.simpleName
    private var mIsRunning = false
    private var mIsOnPause = false
    private var mHasWindowFocus = false

    private var displayMode = DisplayMode.DEFAULT
    private var forceRefreshRate = false

    override fun onCreate(savedInstanceState: Bundle?) {
        setupUIState()
        FMOD.init(this)

        super.onCreate(savedInstanceState)

        // return back to main if Geometry Dash isn't found
        if (!GamePackageUtils.isGameInstalled(packageManager)) {
            returnToMain()
            return
        }

        try {
            createVersionFile()
            tryLoadGame(this, this)
        } catch (e: UnsatisfiedLinkError) {
            Log.e("GeodeLauncher", "Library linkage failure", e)

            // generates helpful information for use in debugging library load failures
            val gdPackageInfo = packageManager.getPackageInfo(Constants.PACKAGE_NAME, 0)
            val abiMismatch = GamePackageUtils.detectAbiMismatch(this, gdPackageInfo, e)

            val is64bit = LaunchUtils.is64bit
            val errorMessage = when {
                abiMismatch && is64bit -> LaunchUtils.LauncherError.LINKER_NEEDS_32BIT
                abiMismatch -> LaunchUtils.LauncherError.LINKER_NEEDS_64BIT
                e.message?.contains("__gxx_personality_v0") == true ->
                    LaunchUtils.LauncherError.LINKER_FAILED_STL
                else -> LaunchUtils.LauncherError.LINKER_FAILED
            }

            returnToMain(errorMessage, e.message, e.stackTraceToString())

            return
        } catch (e: Exception) {
            Log.e("GeodeLauncher", "Uncaught error during game load", e)

            returnToMain(
                LaunchUtils.LauncherError.GENERIC,
                e.message ?: "Unknown Exception",
                e.stackTraceToString()
            )

            return
        }
    }

    private fun createVersionFile() {
        val versionPath = File(this.filesDir, "game_version.txt")
        val gameVersion = GamePackageUtils.getGameVersionCode(packageManager)

        versionPath.writeText("$gameVersion")
    }

    private fun returnToMain(
        error: LaunchUtils.LauncherError? = null,
        returnMessage: String? = null,
        returnExtendedMessage: String? = null
    ) {
        println(error)
    }

    fun tryLoadGame(activity: Activity, context: Context) {
        val gdPackageInfo = context.packageManager.getPackageInfo(Constants.PACKAGE_NAME, 0)

        setupRedirection(gdPackageInfo, context)

        Cocos2dxHelper.init(context, this)

        GeodeUtils.setCapabilityListener(this)

        tryLoadLibrary(gdPackageInfo, Constants.FMOD_LIB_NAME)
        tryLoadLibrary(gdPackageInfo, Constants.COCOS_LIB_NAME)

        if (GamePackageUtils.getGameVersionCode(context.packageManager) >= 39L) {
            /*
            val customSymbols = PreferenceUtils.get(this).getBoolean(PreferenceUtils.Key.CUSTOM_SYMBOL_LIST)
            if (customSymbols) {
                val symbolFile = File(LaunchUtils.getBaseDirectory(this), "exception_symbols.txt")
                LauncherFix.enableCustomSymbolList(symbolFile.path)
            }
            */

            // this fix requires geode v3, which is 2.206+
            // there is a short period in which 2.206 users will still have geode v2, but whatever. ig
            //LauncherFix.performExceptionsRenaming()
        }

        loadInternalMods(context)

        setContentView(createView(context))

        setupPostLibraryLoad(gdPackageInfo, activity)

        try {
            loadGeodeLibrary(context)
        } catch (e: UnsatisfiedLinkError) {
            handleGeodeException(e)
        } catch (e: Exception) {
            handleGeodeException(e)
        }
    }

    private fun handleGeodeException(e: Throwable) {
        e.printStackTrace()

        // ignore load failures if the game is newer than what's supported
        // so people in the future can use their save data
        if (GamePackageUtils.getGameVersionCode(packageManager) <= Constants.SUPPORTED_VERSION_CODE) {
            throw e
        }
    }

    private fun setupRedirection(packageInfo: PackageInfo, context: Context) {
        try {
            //GamePackageUtils.addAssetsFromPackage(assets, packageInfo)
        } catch (e: NoSuchMethodException) {
            Log.e("GeodeLauncher", "Failed to add asset redirection", e)
        }

        try {
            // fixes bugs specific to the new app directory, such as package name
            val saveDir = LaunchUtils.getSaveDirectory(context)
            saveDir.mkdir()

            // make sure it's loaded, just in case
            System.loadLibrary("c++_shared")

            LauncherFix.loadLibrary()
            LauncherFix.setOriginalDataPath(Constants.GJ_DATA_DIR)
            LauncherFix.setDataPath(saveDir.path)
        } catch (e: UnsatisfiedLinkError) {
            Log.e("GeodeLauncher", "Failed to load LauncherFix", e)
        }
    }

    private fun setupPostLibraryLoad(packageInfo: PackageInfo, activity: Activity) {
        // call native functions after native libraries init
        JniToCpp.setupHSSAssets(
            packageInfo.applicationInfo!!.sourceDir,
            Environment.getExternalStorageDirectory().absolutePath
        )
        Cocos2dxHelper.nativeSetApkPath(packageInfo.applicationInfo!!.sourceDir)

        BaseRobTopActivity.setCurrentActivity(activity)
    }

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    private fun tryLoadLibrary(packageInfo: PackageInfo, libraryName: String) {
        val nativeDir = getNativeLibraryDirectory(packageInfo.applicationInfo!!)
        val libraryPath = if (nativeDir.endsWith('/')) "${nativeDir}lib$libraryName.so" else "$nativeDir/lib$libraryName.so"

        try {
            System.load(libraryPath)
        } catch (ule: UnsatisfiedLinkError) {
            // some devices (samsung a series, cough) have an overly restrictive application classloader
            // this is a workaround for that. hopefully
            if (ule.message?.contains("not accessible for the namespace") != true) {
                throw ule
            }

            println("Using copy for library $libraryName")
            loadLibraryCopy(libraryName, libraryPath)
        }
    }

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    private fun loadLibraryCopy(libraryName: String, libraryPath: String) {
        if (libraryPath.contains("!/")) {
            // library in apk can't be loaded directly
            loadLibraryFromAssetsCopy(libraryName)
            return
        }

        val library = File(libraryPath)
        val libraryCopy = File(cacheDir, "lib$libraryName.so")

        libraryCopy.outputStream().use { libraryOutput ->
            library.inputStream().use { inputStream ->
                DownloadUtils.copyFile(inputStream, libraryOutput)
            }
        }

        System.load(libraryCopy.path)

        return
    }

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    private fun loadLibraryFromAssetsCopy(libraryName: String) {
        // loads a library loaded in assets
        // this copies the library to a non-compressed directory

        val arch = LaunchUtils.applicationArchitecture
        val libraryFd = try {
            assets.openNonAssetFd("lib/$arch/lib$libraryName.so")
        } catch (_: Exception) {
            throw UnsatisfiedLinkError("Could not find library lib$libraryName.so for abi $arch")
        }

        // copy the library to a path we can access
        // there doesn't seem to be a way to load a library from a file descriptor
        val libraryCopy = File(this.cacheDir, "lib$libraryName.so")

        libraryCopy.outputStream().use { libraryOutput ->
            libraryFd.createInputStream().use { inputStream ->
                DownloadUtils.copyFile(inputStream, libraryOutput)
            }
        }

        System.load(libraryCopy.path)

        return
    }

    private fun getNativeLibraryDirectory(applicationInfo: ApplicationInfo): String {
        // native libraries have been extracted, so the path is same as usual
        if (applicationInfo.flags and ApplicationInfo.FLAG_EXTRACT_NATIVE_LIBS == ApplicationInfo.FLAG_EXTRACT_NATIVE_LIBS) {
            //return applicationInfo.nativeLibraryDir
        }

        // might be split apks, select the best path for the library
        val sourceDirs = applicationInfo.splitSourceDirs
        val architecture = LaunchUtils.applicationArchitecture

        if (!sourceDirs.isNullOrEmpty()) {
            val configAbi = architecture.replace("-", "_")
            val abiDir = sourceDirs.find { it.contains(configAbi) }

            if (abiDir != null) {
                return "$abiDir!/lib/$architecture/"
            }
        }

        // this configuration should never happen!
        // non split apk, but libraries are stored in apk
        val sourceDir = applicationInfo.sourceDir
        return "$sourceDir!/lib/$architecture/"
    }

    @SuppressLint("UnsafeDynamicallyLoadedCode")
    private fun loadGeodeLibrary(context: Context) {
        // Load Geode if exists
        // bundling the object with the application allows for nicer backtraces
        try {
            // put libgeode.so in jniLibs/armeabi-v7a to get this
            //System.loadLibrary("geode")
            //return
        } catch (e: UnsatisfiedLinkError) {
            // but users may prefer it stored with data
            val geodeFilename = LaunchUtils.geodeFilename
            val geodePath = File(context.filesDir.path, "launcher/$geodeFilename")
            if (geodePath.exists()) {
                System.load(geodePath.path)
                return
            }

           throw e
        }
    }

    private fun createView(context: Context): FrameLayout {
        val frameLayoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        val frameLayout = ConstrainedFrameLayout(context)
        frameLayout.layoutParams = frameLayoutParams

        if (displayMode == DisplayMode.LIMITED) {
            frameLayout.aspectRatio = 1.77f
        }

        val editTextLayoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        val editText = Cocos2dxEditText(context)
        editText.layoutParams = editTextLayoutParams
        frameLayout.addView(editText)

        val glSurfaceView = Cocos2dxGLSurfaceView(context)

        this.mGLSurfaceView = glSurfaceView
        frameLayout.addView(this.mGLSurfaceView)

        glSurfaceView.setEGLContextClientVersion(2)
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8)

        if (isAndroidEmulator()) {
            glSurfaceView.setEGLConfigChooser(8, 8, 8, 8, 16, 0)
        }

        glSurfaceView.initView()

        val renderer = Cocos2dxRenderer(glSurfaceView)
        glSurfaceView.setCocos2dxRenderer(renderer)

        if (forceRefreshRate) {
            renderer.setFrameRate = true
        }

        editText.inputType = 145
        glSurfaceView.cocos2dxEditText = editText

        return frameLayout
    }

    private fun setupUIState() {
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_USER_LANDSCAPE

        displayMode = DisplayMode.fromInt(
            PreferenceUtils.get(this).getInt(PreferenceUtils.Key.DISPLAY_MODE)
        )

        forceRefreshRate = PreferenceUtils.get(this).getBoolean(PreferenceUtils.Key.FORCE_HRR)

        if (forceRefreshRate && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val maxRefreshRate = display?.supportedModes?.maxBy { it.refreshRate }?.refreshRate
            if (maxRefreshRate != null) {
                window.attributes.preferredRefreshRate = maxRefreshRate
            }
        }

        if (displayMode == DisplayMode.FULLSCREEN && Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        hideSystemUi()
    }

    private fun hideSystemUi() {
        WindowCompat.setDecorFitsSystemWindows(window, false)

        WindowCompat.getInsetsController(window, window.decorView).apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }

    override fun onWindowFocusChanged(hasWindowFocus: Boolean) {
        super.onWindowFocusChanged(hasWindowFocus)
        mHasWindowFocus = hasWindowFocus
        if (hasWindowFocus && !mIsOnPause) {
            resumeGame()
        }

        hideSystemUi()
    }

    override fun onDestroy() {
        super.onDestroy()
        FMOD.close()
    }

    private fun resumeGame() {
        mIsRunning = true
//        Cocos2dxHelper.onResume()
        mGLSurfaceView?.onResume()
    }

    private fun pauseGame() {
        mIsRunning = false
//        Cocos2dxHelper.onPause()
        mGLSurfaceView?.onPause()
    }

    override fun onResume() {
        super.onResume()
        mIsOnPause = false
        BaseRobTopActivity.isPaused = false
        if (mHasWindowFocus && !this.mIsRunning) {
            resumeGame()
        }
    }

    override fun onRestart() {
        super.onRestart()
        mIsOnPause = false
        BaseRobTopActivity.isPaused = false
        if (!this.mIsRunning) {
            resumeGame()
        }
    }

    override fun onPause() {
        super.onPause()
        mIsOnPause = true
        BaseRobTopActivity.isPaused = true
        if (mIsRunning) {
            pauseGame()
        }
    }

    override fun runOnGLThread(runnable: Runnable) {
        mGLSurfaceView?.queueEvent(runnable)
    }

    override fun showDialog(title: String, message: String) {
        runOnUiThread {
            AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .show()
        }
    }

    override fun showEditTextDialog(
        title: String,
        message: String,
        inputMode: Int,
        inputFlag: Int,
        returnType: Int,
        maxLength: Int
    ) {
        TODO("Not yet implemented")
    }

    private fun isAndroidEmulator(): Boolean {
        Log.d(sTag, "model=" + Build.MODEL)
        val product = Build.PRODUCT
        Log.d(sTag, "product=$product")
        var isEmulator = false
        if (product != null) {
            isEmulator = product == "sdk" || product.contains("_sdk") || product.contains("sdk_")
        }
        Log.d(sTag, "isEmulator=$isEmulator")
        return isEmulator
    }

    override fun onCapabilityAdded(capability: String): Boolean {
        return when (capability) {
            GeodeUtils.CAPABILITY_EXTENDED_INPUT -> {
                mGLSurfaceView?.useKeyboardEvents = true
                true
            }
            GeodeUtils.CAPABILITY_TIMESTAMP_INPUT -> {
                mGLSurfaceView?.sendTimestampEvents = true
                true
            }
            else -> false
        }
    }

    /**
     * Copies a mod from the launcher's assets to the Geode mods directory.
     * This method is not recommended for casual use, the new mod will not be automatically removed.
     */
    private fun loadInternalMods(context: Context) {
        val internalModBase = "mods"

        val modListing = try {
            context.assets.list(internalModBase)
        } catch (ioe: IOException) {
            emptyArray<String>()
        }

        val modDirectory = File(
            LaunchUtils.getBaseDirectory(context),
            "game/geode/mods"
        )

        modDirectory.mkdirs()

        modListing?.forEach { fileName ->
            if (fileName.endsWith(".geode")) {
                val modOutput = File(modDirectory, fileName)

                val mod = context.assets.open("$internalModBase/$fileName")
                DownloadUtils.copyFile(mod, modOutput.outputStream())

                println("Copied internal mod $fileName")
            }
        }
    }
}
