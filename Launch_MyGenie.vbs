Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\racas\Downloads\Geeney"

' Check if port 3000 is already listening
returnCode = WshShell.Run("cmd /c netstat -ano | findstr :3000 | findstr LISTENING", 0, True)

If returnCode <> 0 Then
    ' Start the Next.js server hidden in the background (0 = hidden window) so no IDE or terminal window is needed
    WshShell.Run "cmd /c cd /d ""C:\Users\racas\Downloads\Geeney"" && npm run dev", 0, False
    ' Poll up to 15 seconds until port 3000 is ready
    For i = 1 To 30
        WScript.Sleep 500
        readyCode = WshShell.Run("cmd /c netstat -ano | findstr :3000 | findstr LISTENING", 0, True)
        If readyCode = 0 Then Exit For
    Next
End If

' Open MyGenie in the default web browser
WshShell.Run "http://localhost:3000", 1, False
