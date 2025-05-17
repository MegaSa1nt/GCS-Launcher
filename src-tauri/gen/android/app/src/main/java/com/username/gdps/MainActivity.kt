package com.username.launcher

import android.os.Bundle
import android.view.View

class MainActivity : TauriActivity() {
	override fun onCreate(savedInstanceState: Bundle?) {
		window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN
		actionBar?.hide()
		
		super.onCreate(savedInstanceState)
	}
}