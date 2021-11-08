Imports System
Imports System.IO
Imports System.Collections.Generic
Imports System.Text
Imports System.DirectoryServices
Imports Newtonsoft.Json
'Imports System.Reflection


Module run
    Private testMode As Boolean = False '正式階段需關閉

    Sub Main()

        'cmds
        Dim cmds As String = Microsoft.VisualBasic.Interaction.Command()

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
        End If

        runFunctionEncryption(cmds)

    End Sub


    Private Function encodeOutput(o As Object) As String
        If testMode Then
            Console.WriteLine(sysFunction.o2j(o, False)) '測試時顯示於螢幕
            Return sysFunction.o2j(o, True)
        Else
            Return sysFunction.o2b(o) '序列化文字有些無法被nodejs解析故需轉為base64
        End If
    End Function


    Private Function runFunctionEncryption(inputB64 As String) As String
        Dim r As Object = Nothing
        Dim outputEncode As String = ""

        'check
        If inputB64 = "" Then
            r = sysFunction.resultError("no input")
            Return encodeOutput(r)
        End If

        'oInput
        Dim oInput As Object = Nothing
        Try
            oInput = sysFunction.b2o(inputB64)
        Catch ex As Exception
            r = sysFunction.resultError("b2o error: " & ex.ToString)
            Return encodeOutput(r)
        End Try

        'mode
        Dim mode As String = ""
        Try
            mode = oInput("mode")
        Catch ex As Exception
            r = sysFunction.resultError("invalid mode in oInput")
            Return encodeOutput(r)
        End Try

        'oOutput
        Dim oOutput As Object = Nothing
        Try
            If mode = "logIn" Then
                oOutput = logIn(oInput("account"), oInput("password"), oInput("ldappath"))
            ElseIf mode = "listUsers" Then
                oOutput = listUsers(oInput("account"), oInput("password"), oInput("ldappath"))
            Else
                Dim e = sysFunction.resultError("invalid mode")
                Return encodeOutput(e)
            End If
        Catch ex As Exception
            r = sysFunction.resultError(mode & " error: " & ex.ToString)
            Return encodeOutput(r)
        End Try

        'encodeOutput
        outputEncode = encodeOutput(oOutput)

        'save
        Dim fdSys As String = System.AppDomain.CurrentDomain.BaseDirectory
        Dim fn As String = fdSys & oInput("__System:OutputFilename")
        sysFunction.writeTextToFile(fn, outputEncode)

        Return "" '已改用存檔方式回傳數據
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
