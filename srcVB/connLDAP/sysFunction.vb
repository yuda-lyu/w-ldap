Imports System.IO
Imports System.Text
Imports Newtonsoft.Json
Imports Newtonsoft.Json.Linq


Public Class sysFunction


    Public Shared Function resultSuccess(msg As Object) As Object
        Dim r As New Dictionary(Of String, Object)
        r.Add("success", msg)
        Return r
    End Function


    Public Shared Function resultError(msg As String) As Object
        Dim r As New Dictionary(Of String, Object)
        r.Add("error", msg)
        Return r
    End Function


    Public Shared Function nowtimetag() As String
        Return Format(Now, "yyyyMMddHHmmssfff")
    End Function


    Public Shared Function j2o(cjson As String) As Object
        Dim oin As Object = JsonConvert.DeserializeObject(cjson)
        If TypeName(oin) = "JArray" Then
            Dim ltdt As New List(Of Dictionary(Of String, Object))
            Dim i As Integer = -1
            For Each o In oin
                i = i + 1
                ltdt.Add(JObj2Dict(o))
            Next
            Return ltdt
        Else
            Return JObj2Dict(oin)
        End If
    End Function


    Private Shared Function JObj2Arr(v As JArray) As List(Of Object)
        Dim dtarr As New List(Of Object)
        For Each c In v

            'JValue, JObject, JArray
            If TypeName(c) = "JValue" Then
                dtarr.Add(c.ToObject(Of Object))
            ElseIf TypeName(c) = "JObject" Then
                dtarr.Add(JObj2Dict(c))
            ElseIf TypeName(c) = "JArray" Then
                dtarr.Add(JObj2Arr(c))
            Else
                MsgBox("JObj2Arr Err TypeName : " & TypeName(c))
            End If

        Next
        Return dtarr
    End Function


    Private Shared Function JObj2Dict(jobj As JObject) As Dictionary(Of String, Object)
        '使用 JsonConvert.DeserializeObject() 將 json 資料格式轉回 JObject 字典物件時，會出現 _t _v 欄位，故需使用遞迴把 JObject 轉回一般字典物件
        Dim dt As New Dictionary(Of String, Object)
        For Each kv As KeyValuePair(Of String, JToken) In jobj

            'JValue, JObject, JArray
            If TypeName(kv.Value) = "JValue" Then
                dt.Add(kv.Key, kv.Value.ToObject(Of Object))
            ElseIf TypeName(kv.Value) = "JObject" Then
                dt.Add(kv.Key, JObj2Dict(kv.Value))
            ElseIf TypeName(kv.Value) = "JArray" Then
                dt.Add(kv.Key, JObj2Arr(kv.Value))
            Else
                MsgBox("JObj2Dict Err TypeName : " & TypeName(kv.Value))
            End If

        Next
        Return dt
    End Function


    Public Shared Function o2b(o As Object) As String
        Try
            Return str2b64(o2j(o, False))
        Catch ex As Exception
        End Try
        Return ""
    End Function


    Public Shared Function b2o(b64 As String) As Object
        Try
            Return j2o(b642str(b64))
        Catch ex As Exception
        End Try
        Return Nothing
    End Function


    Public Shared Function o2j(o As Object, Optional bIndented As Boolean = True) As String
        Dim c As String = Nothing
        Dim fm As Object = Formatting.Indented
        If Not bIndented Then
            fm = Formatting.None
        End If
        Try
            c = Newtonsoft.Json.JsonConvert.SerializeObject(o, fm)
        Catch ex As Exception
            c = ex.ToString
        End Try
        Return c
    End Function


    Public Shared Function str2b64(str As String) As String
        Dim b64 As String = ""
        Try
            Dim data As Byte()
            data = System.Text.ASCIIEncoding.UTF8.GetBytes(str)
            b64 = System.Convert.ToBase64String(data)
        Catch ex As Exception
        End Try
        Return b64
    End Function


    Public Shared Function b642str(b64 As String) As String
        Dim str As String = ""
        Try
            Dim data() As Byte
            data = System.Convert.FromBase64String(b64)
            str = System.Text.ASCIIEncoding.UTF8.GetString(data)
        Catch ex As Exception
        End Try
        Return str
    End Function


    Public Shared Function writeTextToFile(cFN As String, cContent As String) As String
        Try
            Dim sFile As New FileInfo(cFN)
            Dim sStreamWriter As StreamWriter
            sStreamWriter = New StreamWriter(cFN, False, Encoding.UTF8)
            sStreamWriter.Write(cContent)
            sStreamWriter.Flush()
            sStreamWriter.Close()
            Return ""
        Catch ex As Exception
            Return ex.ToString
        End Try
    End Function


End Class
