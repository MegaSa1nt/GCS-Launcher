plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "sa1nt.gcs"
    compileSdk = 34

    defaultConfig {
        minSdk = 24

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"


        vectorDrawables {
            useSupportLibrary = true
        }

        ndk {
            abiFilters.removeAll(listOf("x86", "x86_64"))
            abiFilters += listOf("arm64-v8a", "armeabi-v7a")
        }
    }

    splits {
        abi {
            isEnable = true
            reset()

            //noinspection ChromeOsAbiSupport. i'm sorry!
            include("arm64-v8a", "armeabi-v7a")

            isUniversalApk = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation("com.squareup.okio:okio:3.9.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json-okio:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")
    implementation("ru.solrudev.ackpine:ackpine-core:0.9.4")
    implementation("ru.solrudev.ackpine:ackpine-ktx:0.9.4")
    implementation("androidx.core:core-ktx:1.9.0")
    implementation("androidx.appcompat:appcompat:1.6.0")
    implementation("com.google.android.material:material:1.7.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    implementation(project(":tauri-android"))
}
