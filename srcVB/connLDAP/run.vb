Imports System
Imports System.IO
Imports System.Collections.Generic
Imports System.Text
Imports System.DirectoryServices
Imports Newtonsoft.Json
'Imports System.Reflection


Module run
    Private testMode As Boolean = False '正式階段需關閉

    '離開碼: 0為已完成LDAP呼叫(結果success或error已寫入輸出檔), 1為exe本身之錯誤(訊息寫stderr, 若已知輸出檔名亦以{error}寫入輸出檔), 2為誤用命令列參數
    Private Const exitDone As Integer = 0
    Private Const exitError As Integer = 1
    Private Const exitUsage As Integer = 2

    Function Main() As Integer
        Try

            '輸入只由stdin讀取(base64), 不接受命令列參數, 避免帳密出現在程序之命令列
            If Environment.GetCommandLineArgs().Length > 1 Then
                writeStderr("command-line input is not supported, write base64 input to stdin")
                Return exitUsage
            End If

            'cmds
            Dim cmds As String = ""

            'cmds
            If testMode Then
                Dim dt As New Dictionary(Of String, Object)
                dt.Add("mode", "logIn")
                'dt.Add("mode", "listUsers")
                dt.Add("__System:OutputFilename", "output[" & sysFunction.nowtimetag() & "].json")

                'dt.Add("account", "")
                'dt.Add("password", "")
                'dt.Add("ldappath", "")

                cmds = sysFunction.o2b(dt)
                Console.WriteLine("cmds:")
                Console.WriteLine(cmds)
            Else
                cmds = readStdin() 'stdin未被關閉時(例如於主控台直接執行)會等待至EOF
            End If

            Return runFunctionEncryption(cmds)

        Catch ex As Exception
            writeStderr("connLDAP error: " & ex.Message)
            Return exitError
        End Try
    End Function


    Private Function readStdin() As String
        Dim sr As New StreamReader(Console.OpenStandardInput(), New UTF8Encoding(False))
        Return sr.ReadToEnd().Trim()
    End Function


    Private Sub writeStderr(msg As String)
        Try
            Dim sw As New StreamWriter(Console.OpenStandardError(), New UTF8Encoding(False)) '以UTF-8輸出, 不受主控台字碼頁影響
            sw.Write(msg)
            sw.Flush()
        Catch ex As Exception
        End Try
    End Sub


    Private Function getOutputPath(fnOut As String) As String
        Dim fdSys As String = System.AppDomain.CurrentDomain.BaseDirectory
        Return fdSys & fnOut
    End Function


    '早期錯誤: 訊息寫stderr, 若已知輸出檔名亦以{error}寫入輸出檔, 並以非0離開碼結束
    Private Function reportError(msg As String, fnOut As String) As Integer
        writeStderr(msg)
        If fnOut <> "" Then
            sysFunction.writeTextToFile(getOutputPath(fnOut), encodeOutput(sysFunction.resultError(msg)))
        End If
        Return exitError
    End Function


    Private Function encodeOutput(o As Object) As String
        If testMode Then
            Console.WriteLine(sysFunction.o2j(o, False)) '測試時顯示於螢幕
            Return sysFunction.o2j(o, True)
        Else
            Return sysFunction.o2b(o) '序列化文字有些無法被nodejs解析故需轉為base64
        End If
    End Function


    Private Function runFunctionEncryption(inputB64 As String) As Integer

        'check
        If inputB64 = "" Then
            Return reportError("no input", "")
        End If

        'oInput
        Dim oInput As Object = Nothing
        Try
            oInput = sysFunction.b2o(inputB64)
        Catch ex As Exception
            Return reportError("b2o error: " & ex.Message, "")
        End Try

        'fnOut, 輸出檔名由呼叫端決定
        Dim fnOut As String = ""
        Try
            fnOut = oInput("__System:OutputFilename")
        Catch ex As Exception
            fnOut = ""
        End Try
        If fnOut = "" Then
            Return reportError("invalid __System:OutputFilename in oInput", "")
        End If

        'mode
        Dim mode As String = ""
        Try
            mode = oInput("mode")
        Catch ex As Exception
            Return reportError("invalid mode in oInput", fnOut)
        End Try

        'oOutput
        Dim oOutput As Object = Nothing
        Try
            If mode = "logIn" Then
                oOutput = logIn(oInput("account"), oInput("password"), oInput("ldappath"))
            ElseIf mode = "listUsers" Then
                oOutput = listUsers(oInput("account"), oInput("password"), oInput("ldappath"))
            Else
                Return reportError("invalid mode", fnOut)
            End If
        Catch ex As Exception
            Return reportError(mode & " error: " & ex.Message, fnOut)
        End Try

        'encodeOutput
        Dim outputEncode As String = encodeOutput(oOutput)

        'save, 已改用存檔方式回傳數據
        Dim errWrite As String = sysFunction.writeTextToFile(getOutputPath(fnOut), outputEncode)
        If errWrite <> "" Then
            writeStderr("write output error: " & errWrite)
            Return exitError
        End If

        Return exitDone
    End Function


    Private Function listUsers(name As String, pw As String, ldappath As String) As Object
        Dim r As New Dictionary(Of String, Object)

        Try

            'de
            Dim de As DirectoryEntry = New DirectoryEntry()
            de.Username = name
            de.Password = pw
            de.Path = Replace(ldappath, "ldap", "LDAP",,, CompareMethod.Text) 'ldappath的LDAP一定要為大寫, 故取代成大寫

            'ds
            Dim ds = New DirectorySearcher(de)
            ds.PageSize = Integer.MaxValue
            ds.Filter = "(samaccountname=*)" '預設用samaccountname欄位為*提取全部數據, 可不使用Filter, 但全撈AD資料通常數據很大故會很久

            'FindAll
            Dim res = ds.FindAll()

            r.Add("success", res)
        Catch ex As Exception
            r.Add("error", ex.Message)
        End Try

        Return r
    End Function


    Private Function logIn(name As String, pw As String, ldappath As String) As Object
        Dim r As New Dictionary(Of String, Object)

        Try

            'de
            Dim de As DirectoryEntry = New DirectoryEntry()
            de.Username = name
            de.Password = pw
            de.Path = Replace(ldappath, "ldap", "LDAP",,, CompareMethod.Text) 'ldappath的LDAP一定要為大寫, 故取代成大寫

            'ds
            Dim ds = New DirectorySearcher(de)
            ds.PageSize = Integer.MaxValue
            'ds.Filter = "(samaccountname=*)"
            ds.Filter = "(&(samaccountname=" + name + "))"

            'FindOne
            Dim res = ds.FindOne() 'FindOne是撈自己自己能取得的資料的第一筆, 所以filter沒下, 有撈到資料就算成功, 但這使用者的資訊得要另外撈(例如由FindAll撈全部來比對)

            r.Add("success", res)
        Catch ex As Exception
            r.Add("error", ex.Message)
        End Try

        'Dim c = sysFunction.o2j(r)
        'Console.Write(c)

        Return r
    End Function


End Module
