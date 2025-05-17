package com.geode.launcher.main

import android.content.Context
import android.content.Intent
import com.geode.launcher.GeometryDashActivity
import com.geode.launcher.utils.GeodeUtils

fun onLaunch(context: Context, safeMode: Boolean = false) {
    if (safeMode) {
        GeodeUtils.setAdditionalLaunchArguments(GeodeUtils.ARGUMENT_SAFE_MODE)
    } else {
        GeodeUtils.clearLaunchArguments()
    }

    val launchIntent = Intent(context, GeometryDashActivity::class.java)
    launchIntent.flags = Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_NEW_TASK

    context.startActivity(launchIntent)
}