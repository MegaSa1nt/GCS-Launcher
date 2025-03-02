import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

android {
    compileSdk = 34
    namespace = "sa1nt.gcs"

		ndkVersion = "27.2.12479018"
	
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "sa1nt.gcs"
        minSdk = 24
        targetSdk = 34
        versionCode = tauriProperties.getProperty("tauri.android.versionCode", "1").toInt()
        versionName = tauriProperties.getProperty("tauri.android.versionName", "1.0")

				@Suppress("UnstableApiUsage")
				externalNativeBuild {
					cmake {
						arguments("-DUSE_TULIPHOOK:BOOL=OFF", "-DANDROID_STL=c++_shared")
					}
				}

				ndk {
					abiFilters.removeAll(listOf("x86", "x86_64"))
					abiFilters += listOf("arm64-v8a", "armeabi-v7a")
				}
    }

		val keystorePropertiesFile = rootProject.file("signing.properties")
		val keystoreProperties = Properties().apply {
				load(FileInputStream(keystorePropertiesFile))
		}
		signingConfigs {
			create("release") {
					storeFile = file(keystoreProperties["store"] as String)
					storePassword = keystoreProperties["storePassword"] as String
					keyAlias = keystoreProperties["keyAlias"] as String
					keyPassword = keystoreProperties["keyPassword"] as String
			}
	
		}
	
    buildTypes {
        getByName("debug") {
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false
            packaging {                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
				  	isDebuggable = true
				  	isJniDebuggable = true
            isMinifyEnabled = false
						proguardFiles(
							getDefaultProguardFile("proguard-android-optimize.txt"),
							"proguard-rules.pro"
						)
						signingConfig = signingConfigs["release"]
        }
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        buildConfig = true
    }
		externalNativeBuild {
			cmake {
				path = file("src/main/cpp/CMakeLists.txt")
			}
		}
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation("androidx.webkit:webkit:1.6.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.8.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")