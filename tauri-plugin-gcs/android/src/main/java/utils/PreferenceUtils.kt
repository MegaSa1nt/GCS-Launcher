package sa1nt.gcs.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.LifecycleOwner

/**
 * Extension object for SharedPreferences to add better key safety and default values.
 */
class PreferenceUtils(private val sharedPreferences: SharedPreferences) {
    companion object {
        private const val FILE_KEY = "GeodeLauncherPreferencesFileKey"

        fun get(context: Context): PreferenceUtils {
            val sharedPreferences = context.getSharedPreferences(FILE_KEY, Context.MODE_PRIVATE)
            return get(sharedPreferences)
        }

        fun get(sharedPreferences: SharedPreferences): PreferenceUtils {
            return PreferenceUtils(sharedPreferences)
        }
    }

    enum class Key {
        LOAD_AUTOMATICALLY,
        UPDATE_AUTOMATICALLY,
        RELEASE_CHANNEL,
        CURRENT_VERSION_TAG,
        CURRENT_VERSION_TIMESTAMP,
        THEME,
        BLACK_BACKGROUND,
        CURRENT_RELEASE_MODIFIED,
        LAST_DISMISSED_UPDATE,
        DISMISSED_GJ_UPDATE,
        LAUNCH_ARGUMENTS,
        LIMIT_ASPECT_RATIO,
        DISPLAY_MODE,
        FORCE_HRR,
        ENABLE_REDESIGN,
        RELEASE_CHANNEL_TAG,
        DEVELOPER_MODE,
        CLEANUP_APKS,
        CUSTOM_SYMBOL_LIST
    }

    private fun defaultValueForBooleanKey(key: Key): Boolean {
        return when (key) {
            Key.UPDATE_AUTOMATICALLY, Key.FORCE_HRR -> true
            else -> false
        }
    }

    private fun defaultValueForIntKey(key: Key) = when (key) {
        Key.DISPLAY_MODE -> if (this.getBoolean(Key.LIMIT_ASPECT_RATIO)) 1 else 0
        // people wanted a reset on nightly anyways, so this is a good excuse to do so
        else -> 0
    }

    private fun keyToName(key: Key): String {
        return when (key) {
            Key.LOAD_AUTOMATICALLY -> "PreferenceLoadAutomatically"
            Key.UPDATE_AUTOMATICALLY -> "PreferenceUpdateAutomatically"
            Key.RELEASE_CHANNEL -> "PreferenceReleaseChannel"
            Key.CURRENT_VERSION_TAG -> "PreferenceCurrentVersionName"
            Key.CURRENT_VERSION_TIMESTAMP -> "PreferenceCurrentVersionDescriptor"
            Key.THEME -> "PreferenceTheme"
            Key.BLACK_BACKGROUND -> "PreferenceBlackBackground"
            Key.CURRENT_RELEASE_MODIFIED -> "PreferenceReleaseModifiedHash"
            Key.LAST_DISMISSED_UPDATE -> "PreferenceLastDismissedUpdate"
            Key.DISMISSED_GJ_UPDATE -> "PreferenceDismissedGJUpdate"
            Key.LAUNCH_ARGUMENTS -> "PreferenceLaunchArguments"
            Key.LIMIT_ASPECT_RATIO -> "PreferenceLimitAspectRatio"
            Key.DISPLAY_MODE -> "PreferenceDisplayMode"
            Key.FORCE_HRR -> "PreferenceForceHighRefreshRate"
            Key.ENABLE_REDESIGN -> "PreferenceEnableRedesign"
            Key.RELEASE_CHANNEL_TAG -> "PreferenceReleaseChannelTag"
            Key.DEVELOPER_MODE -> "PreferenceDeveloperMode"
            Key.CLEANUP_APKS -> "PreferenceCleanupPackages"
            Key.CUSTOM_SYMBOL_LIST -> "PreferenceCustomSymbolList"
        }
    }

    fun getBoolean(key: Key): Boolean {
        val defaultValue = defaultValueForBooleanKey(key)
        val keyName = keyToName(key)

        return sharedPreferences.getBoolean(keyName, defaultValue)
    }

    fun setBoolean(key: Key, value: Boolean) {
        val keyName = keyToName(key)
        sharedPreferences.edit {
            putBoolean(keyName, value)
        }
    }

    fun toggleBoolean(key: Key): Boolean {
        val currentValue = getBoolean(key)
        val keyName = keyToName(key)

        sharedPreferences.edit {
            putBoolean(keyName, !currentValue)
        }

        return !currentValue
    }

    fun getString(key: Key): String? {
        val keyName = keyToName(key)
        return sharedPreferences.getString(keyName, null)
    }

    fun setString(key: Key, value: String?) {
        val keyName = keyToName(key)
        sharedPreferences.edit {
            putString(keyName, value)
        }
    }

    fun getLong(key: Key): Long {
        val keyName = keyToName(key)
        return sharedPreferences.getLong(keyName, 0L)
    }

    fun setLong(key: Key, value: Long) {
        val keyName = keyToName(key)
        sharedPreferences.edit {
            putLong(keyName, value)
        }
    }

    fun getInt(key: Key): Int {
        val keyName = keyToName(key)
        return sharedPreferences.getInt(keyName, defaultValueForIntKey(key))
    }

    fun setInt(key: Key, value: Int) {
        val keyName = keyToName(key)
        sharedPreferences.edit {
            putInt(keyName, value)
        }
    }
}