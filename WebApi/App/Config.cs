using Engine.Entity;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Security.AccessControl;
using System.Security.Principal;

namespace WebApi.App
{
    public static class Config
    {
        static string appPath;
        static string workPath;
        static bool writeAllow;

        static bool inited = false;
        public static void Init()
        {
            if (inited)
                return;
            inited = true;
            try
            {
                var pricipal = new WindowsPrincipal(WindowsIdentity.GetCurrent());
                AdminRights = pricipal.IsInRole(WindowsBuiltInRole.Administrator);

                var location = Assembly.GetExecutingAssembly().Location;
                appPath = Path.GetDirectoryName(location) + "\\";
                workPath = appPath;

                if (Debugger.IsAttached)
                {
                    var str = Assembly.GetExecutingAssembly().GetName().Name;
                    appPath = Path.GetFullPath(Path.Combine(appPath, @"..\..\..\", str));
                }


                if (File.Exists(Pathes.Config))
                {
                    var lines = File.ReadAllLines(Pathes.Config);
                    if (lines == null || lines.Length < 1)
                        return;

                    var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                    foreach (var line in lines)
                    {
                        if (line.IsEmpty())
                            continue;
                        var arr = line.Split(new char[] { '=', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                        if (arr.Length < 2 || arr[1].IsEmpty())
                            continue;
                        dict.Add(arr[0], arr[1]);
                    }

                    if (dict.TryGetValue("CacheTime", out string value))
                    {
                        if (int.TryParse(value, out int v))
                        {
                            if (v < 0)
                                v = 0;
                            CacheTime = v;
                        }
                    }

                    if (dict.TryGetValue("AutoClearOldCache", out value))
                    {
                        AutoClearOldCache = int.TryParse(value, out int v) && v == 1;
                    }

                    if (dict.TryGetValue("LocalPort", out value))
                    {
                        if (int.TryParse(value, out int v))
                            BasePort = v;
                    }

                    if (dict.TryGetValue("AppPath", out value))
                        workPath = value;

                    if (dict.TryGetValue("AutoContinueSearches", out value))
                    {
                        AutoContinueSearches = int.TryParse(value, out int v) && v == 1;
                    }

                    if (!Directory.Exists(workPath))
                        Directory.CreateDirectory(workPath);

                    writeAllow = HasWritePermissionOnDir(workPath);
                    if (!writeAllow)
                        Catch.Set("Error: not allowed for write in " + workPath);
                }
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        static bool HasWritePermissionOnDir(string path)
        {
            try
            {
                var wrAllow = false;
                var wrDeny = false;
                var accessControlList = Directory.GetAccessControl(path);
                if (accessControlList == null)
                    return false;
                var accessRules = accessControlList.GetAccessRules(true, true, typeof(System.Security.Principal.SecurityIdentifier));
                if (accessRules == null)
                    return false;

                foreach (FileSystemAccessRule rule in accessRules)
                {
                    if ((FileSystemRights.Write & rule.FileSystemRights) != FileSystemRights.Write)
                        continue;

                    if (rule.AccessControlType == AccessControlType.Allow)
                        wrAllow = true;
                    else if (rule.AccessControlType == AccessControlType.Deny)
                        wrDeny = true;
                }

                return wrAllow && !wrDeny;
            }
            catch (Exception ex) { Catch.Set(ex); }
            return false;
        }

        public static class Pathes
        {
            public static string App { get => appPath; }
            public static string Config { get => Path.Combine(appPath, "Config.ini"); }
            public static string Work { get => workPath; }
            public static bool WriteAllow { get => writeAllow; }

            public static string MainPage { get => Path.Combine(App, "Main.html"); }
            public static string LastValues { get => Path.Combine(Work, "LastValues.json"); }
            public static string ExceptionsLog { get => Path.Combine(Work, "Exceptions.log"); }
            public static string Cache { get => Path.Combine(Work, "Cache\\"); }

            public static string CacheFile(string fileName, string extension = "json")
            {
                return Cache + fileName + "." + extension;
            }
        }

        public static int CacheTime { get; private set; } = 7;//in days
        public static bool AutoClearOldCache { get; private set; } = true;
        public static bool AutoContinueSearches { get; private set; }
        public static string BaseAddress { get => "http://localhost:" + BasePort; }
        public static int BasePort { get; private set; } = 8080;
        public static bool AdminRights { get; private set; }
        //public static List<CookieChrome> Cookies { get; set; }

    }
}
