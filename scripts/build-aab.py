#!/usr/bin/env python3
"""
Build script for generating official Android App Bundle (.AAB) file
for Google Play Store publishing of Positivity & Sacred Reflection Diary.
"""

import os
import sys
import shutil
import zipfile
import subprocess

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORK_DIR = "/tmp/aab_packaging"
AAPT2 = "/opt/tools/aapt2"
BUNDLETOOL = "/opt/tools/bundletool.jar"
ANDROID_JAR = "/opt/tools/android.jar"
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
OUTPUT_AAB = os.path.join(PUBLIC_DIR, "sacred-reflection-diary.aab")
OUTPUT_AAB_ALIAS = os.path.join(PUBLIC_DIR, "app-release.aab")

def run(cmd, cwd=None):
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print("ERROR:", res.stderr)
        sys.exit(1)
    return res.stdout

def main():
    print("=== Building Android App Bundle (.AAB) for Google Play Store ===")
    
    # 1. Clean and setup work dir
    if os.path.exists(WORK_DIR):
        shutil.rmtree(WORK_DIR)
    os.makedirs(WORK_DIR, exist_ok=True)

    res_dir = os.path.join(WORK_DIR, "res")
    for density in ["mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"]:
        os.makedirs(os.path.join(res_dir, density), exist_ok=True)

    # Use icons from public/
    pwa_192 = os.path.join(PUBLIC_DIR, "pwa-192x192.png")
    pwa_512 = os.path.join(PUBLIC_DIR, "pwa-512x512.png")
    
    shutil.copy(pwa_192, os.path.join(res_dir, "mipmap-hdpi", "ic_launcher.png"))
    shutil.copy(pwa_192, os.path.join(res_dir, "mipmap-xhdpi", "ic_launcher.png"))
    shutil.copy(pwa_512, os.path.join(res_dir, "mipmap-xxhdpi", "ic_launcher.png"))
    shutil.copy(pwa_512, os.path.join(res_dir, "mipmap-xxxhdpi", "ic_launcher.png"))

    # 2. Write AndroidManifest.xml
    manifest_path = os.path.join(WORK_DIR, "AndroidManifest.xml")
    manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.sacred.diary"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Sacred Reflection Diary"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name="com.sacred.diary.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
    with open(manifest_path, "w") as f:
        f.write(manifest_content)

    # 3. Compile resources
    compiled_res_zip = os.path.join(WORK_DIR, "compiled_res.zip")
    run([AAPT2, "compile", "--dir", res_dir, "-o", compiled_res_zip])

    # 4. Link resources in proto-format
    linked_apk = os.path.join(WORK_DIR, "linked.apk")
    run([
        AAPT2, "link",
        "--proto-format",
        "-I", ANDROID_JAR,
        "--manifest", manifest_path,
        "--auto-add-overlay",
        "-o", linked_apk,
        compiled_res_zip
    ])

    # 5. Extract linked.apk and prepare base module directory
    raw_dir = os.path.join(WORK_DIR, "raw")
    with zipfile.ZipFile(linked_apk, "r") as z:
        z.extractall(raw_dir)

    base_dir = os.path.join(WORK_DIR, "base")
    os.makedirs(os.path.join(base_dir, "manifest"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "dex"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "assets", "public"), exist_ok=True)

    shutil.copy(os.path.join(raw_dir, "AndroidManifest.xml"), os.path.join(base_dir, "manifest", "AndroidManifest.xml"))
    shutil.copy(os.path.join(raw_dir, "resources.pb"), os.path.join(base_dir, "resources.pb"))
    if os.path.exists(os.path.join(raw_dir, "res")):
        shutil.copytree(os.path.join(raw_dir, "res"), os.path.join(base_dir, "res"), dirs_exist_ok=True)

    # Copy classes.dex
    dex_source = "/tmp/bundle_work/apk_contents/classes.dex"
    if not os.path.exists(dex_source):
        # Extract from public/sacred-reflection-diary.apk if needed
        with zipfile.ZipFile(os.path.join(PUBLIC_DIR, "sacred-reflection-diary.apk"), "r") as apk:
            apk.extract("classes.dex", WORK_DIR)
        dex_source = os.path.join(WORK_DIR, "classes.dex")

    shutil.copy(dex_source, os.path.join(base_dir, "dex", "classes.dex"))

    # Copy web bundle assets into base/assets/public
    # Exclude backend files and archive files to keep AAB clean
    excluded_extensions = {".apk", ".aab", ".idsig", ".map", ".mp4"}
    excluded_filenames = {"server.cjs", "server.js"}

    target_assets_dir = os.path.join(base_dir, "assets", "public")
    if os.path.exists(DIST_DIR):
        for root, _, files in os.walk(DIST_DIR):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in excluded_extensions or file in excluded_filenames:
                    continue
                src_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_path, DIST_DIR)
                dest_path = os.path.join(target_assets_dir, rel_path)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                shutil.copy(src_path, dest_path)

    # 6. Create base.zip
    base_zip = os.path.join(WORK_DIR, "base.zip")
    with zipfile.ZipFile(base_zip, "w", zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(base_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                z.write(full_path, rel_path)

    # 7. Run bundletool to build the .AAB
    run([
        "java", "-jar", BUNDLETOOL,
        "build-bundle",
        f"--modules={base_zip}",
        f"--output={OUTPUT_AAB}",
        "--overwrite"
    ])

    shutil.copy(OUTPUT_AAB, OUTPUT_AAB_ALIAS)

    # 8. Validate bundle
    val_output = run([
        "java", "-jar", BUNDLETOOL,
        "validate",
        f"--bundle={OUTPUT_AAB}"
    ])

    aab_size = os.path.getsize(OUTPUT_AAB) / (1024 * 1024)
    print(f"\nSUCCESS: Android App Bundle (.AAB) built successfully!")
    print(f"File: {OUTPUT_AAB}")
    print(f"Size: {aab_size:.2f} MB")
    print(f"Package: com.sacred.diary (versionCode: 1, versionName: 1.0.0)")

if __name__ == "__main__":
    main()
