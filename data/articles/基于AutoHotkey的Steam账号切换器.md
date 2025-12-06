# 基于AutoHotkey的Steam账号切换器

> 原创 于 2023-11-05 17:14:56 发布 · 1k 阅读 · 1 · 1 · CC 4.0 BY-SA版权 版权声明：本文为博主原创文章，遵循 CC 4.0 BY-SA 版权协议，转载请附上原文出处链接和本声明。
> 文章链接：https://blog.csdn.net/aaa_8051/article/details/134231654

## 一、界面展示

主页面
 ![在这里插入图片描述](./基于AutoHotkey的Steam账号切换器.assets/0_1.png)

![image-20251206151825118](./基于AutoHotkey的Steam账号切换器.assets/image-20251206151825118.png)

托盘页面
 ![在这里插入图片描述](./基于AutoHotkey的Steam账号切换器.assets/0_2.png)

## 二、原理与实现

第一步：获取账户信息
读取Steam安装路径下config文件夹内的loginusers.vdf登录信息文件，获取账号名称，昵称、离线状态、登陆时间信息，文件如下所示：
 ![在这里插入图片描述](./基于AutoHotkey的Steam账号切换器.assets/0_3.png)

第二步：注册表写入登录用户
向注册表键HKEY_CURRENT_USER\SOFTWARE\Valve\Steam中的AutoLoginUser写入需要登录的用户名（注意不是昵称，同时，需要该账户以记住密码的方式登录过一次）
第三步：启动Steam

说明1：需要离线启动时，将loginusers.vd文件中对应账户的WantsOfflineMode字段设置为1即可
说明2：新建账户时，只需要将AutoLoginUser清空即可

## 三、代码展示

Steam.ahk

```c
#Requires AutoHotkey v2.0

Class Steam{
   
   

    static SetStartupAccount(accountName := "")
    {
   
   
        try{
   
   
            RegWrite accountName, "REG_SZ", "HKEY_CURRENT_USER\SOFTWARE\Valve\Steam", "AutoLoginUser"
        }catch as e {
   
   
            Steam.Msgbox("账户切换失败" . Steam.ErrorFormat(e))
        }
        return
    }

    static SetStartMode(accountName, mode := "online"){
   
   
        if(mode = "online"){
   
   
            Steam.WriteAccountInfo(accountName, "WantsOfflineMode", 0)
        }else{
   
   
            Steam.WriteAccountInfo(accountName, "WantsOfflineMode", 1)
        }
        
    }

    static Start(){
   
   
        dir := Steam.GetSteamInfo()
        exe := dir . "/steam.exe"
        Steam.Stop()
        try{
   
   
            Run(exe,dir)
        } catch as e {
   
   
            Steam.Msgbox("Steam启动失败!" . Steam.ErrorFormat(e))
        }
        return
    }

    static Stop(){
   
   
        dir := Steam.GetSteamInfo()
        exe := dir . "/steam.exe -shutdown"
        if(PID := ProcessExist("steam.exe")){
   
   
            try{
   
   
                Run(exe,dir)
                count := 0
                while(ProcessExist("steam.exe")){
   
   
                    Sleep(500)
                    if(count++ > 30){
   
   
                        ExitCode := RunWait(A_ComSpec ' /c taskkill /f /t /im steam.exe', , "Hide")
                        break
                    }
                }
            }
        }
        return
    }

    static WriteAccountInfo(accountName, setting, data){
   
   
        settingsArr := Array("AccountName", "PersonaName", "RememberPassword", "WantsOfflineMode", "SkipOfflineModeWarning","AllowAutoLogin", "MostRecent", "Timestamp")
        settingIndex := 0
        flag := 0
        for key,value in settingsArr{
   
   
            if(value = setting){
   
   
                settingIndex := key
                flag := 1
                break
            }
        }
        if(flag = 0){
   
   
            Steam.Msgbox("写入失败，属性无效!")
            return
        }
        AccountInfo := Steam.ReadAccountInfo()
        AccountIndex := 0
        flag := 0
        accountName := "`"" . accountName . "`""
        for key,value in AccountInfo{
   
   
            if(value[2] = accountName){
   
   
                AccountIndex := key
                flag := 1
                break
            }
        }
        if(flag = 0){
   
   
            Steam.Msgbox("写入失败，账号不存在!")
            return
        }

        loginusersVDF := Steam.GetSteamInfo() . "/config/loginusers.vdf"
        AccountInfo[AccountIndex][settingIndex+1] := "`"" . data . "`""

        fo := FileOpen(loginusersVDF, "r")
		foenc := fo.Encoding
		fo.Close()
        fo := FileOpen(loginusersVDF, "w" , foenc)
        fo.Write("`"users`"" . "`n")
        fo.Write("{" . "`n")
        for key,value in AccountInfo{
   
   
            for k,v in value{
   
   
                if(k = 1){
   
   
                    fo.Write(A_Tab . v . "`n")
                    fo.Write(A_Tab . "{" . "`n")
                }else{
   
   
                    fo.Write(A_Tab . A_Tab . "`"" . settingsArr[k - 1] . "`"" . A_Tab . A_Tab . v . "`n")
                }
            }
            fo.Write(A_Tab . "}" . "`n")
        }
        fo.Write("}" . "`n")
        fo.Close()
        return
    }

    static ReadAccountInfo(){
   
   
        loginusersVDF := Steam.GetSteamInfo() . "/config/loginusers.vdf"
        if(temp0 := FileExist(loginusersVDF) and tempInfo := FileRead(loginusersVDF , "UTF-8")){
   
   
            accountArray := Array()
            FoundPos := RegExMatch(tempInfo, "`a`n`r)`"users`"\R{\K(.*)(?=\R})" , &result)
            TempString := StrReplace(result[0],"`n","#")
            StartPos := 1
            FoundPos := 1
            while(FoundPos){
   
   
                    FoundPos := RegExMatch(TempString, "`"(.*?)}", &Match, StartPos)
                    
                    if(Type(Match) != "String"){
   
   
                        StartPos := FoundPos + Match.Len[1]
                        tempArray := StrSplit(Match[1],"#")
                        arr := Array()
                        arr.Push("`"" . tempArray[1])
                        for key,value in tempArray{
   
   
                            if(key = 1 or key = 2 or key = 11)
                                continue
                            temp := StrSplit(value, A_Tab . A_Tab)
                            arr.Push(temp[3])
                        }
                        accountArray.Push(arr)
                    }       
            }
            return accountArray
            
        } else {
   
   
            Steam.MsgBox("未获取到登录信息，请至少登录一次!")
            return Array()
        }
    }

    static GetSteamInfo(){
   
   
        SteamPath := RegRead("HKEY_CURRENT_USER\SOFTWARE\Valve\Steam","SteamPath","Error")
        if(SteamPath = "Error"){
   
   
            Steam.Msgbox("未检测到已安装的Steam程序!")
            ExitApp
        }
        return steamPath
    }

    static Msgbox(data := ""){
   
   
        MsgBox(data, "提示", "48")
    }

    static GetLocalTime(EpochTime := ""){
   
   
        TimeStamp := 19700101000000
        TimeStamp := DateAdd(TimeStamp, EpochTime + 3600 * 8, "Seconds")
        return FormatTime(TimeStamp,"ShortDate") . " " . FormatTime(TimeStamp,"Time")
    }

    static ErrorFormat(e){
   
   
        return "`n#错误详情#`nMessage:" . e.Message . "`nWhat:" . e.What . "`nExtra:" . e.Extra . "File:" . e.File . "`nLine:" . e.Line
    }

}
```

Basic.ahk

```c
#Requires AutoHotkey v2.0


Class log
{
   
   
    static info(data :
```