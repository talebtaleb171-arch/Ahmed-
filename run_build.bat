@echo off
cd /d "c:\Users\Jbuje\Desktop\CAISSE AHMED\mobile\android"
cmd /c "gradlew.bat assembleRelease --console=plain > ..\gradle_build_log.txt 2>&1"
