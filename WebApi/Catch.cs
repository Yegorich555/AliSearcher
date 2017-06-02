using Engine.Entity;
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using WebApi.App;

namespace WebApi
{
    public static class Catch
    {
        static int countWrites;
        public static void Init()
        {
            ExceptionCatch.Setted += ((object sender, EventArgs e) => { Set(sender as string); });
        }

        static object threadLock = new object();
        public static void Set(Exception ex)
        {
            lock (threadLock)
            {
                try
                {
                    var st = new StackTrace(true);
                    var sf = st.GetFrame(1);

                    var fileName = sf.GetFileName();
                    var method = sf.GetMethod();
                    var lineNumber = sf.GetFileLineNumber();

                    var str = new StringBuilder();
                    str.Append(fileName); str.Append(". ");
                    str.Append(method); str.Append(". Line ");
                    str.Append(lineNumber); str.Append('\n');
                    str.Append(ex);
                    var message = str.ToString();
                    Set(message);
                }
                catch (Exception ex2) { Set(ex.ToString(), "===>>>", ex2.ToString()); }
            }
        }

        public static void Set(params string[] messages)
        {
            if (messages == null || messages.Length < 1)
                return;
            LastException = messages[messages.Length - 1];
            Task.Run(() =>
            {
                try
                {
                    foreach (var item in messages)
                    {
                        var str = new string[] { item, "" };
                        if (countWrites > 5)
                            File.WriteAllLines(Config.Pathes.ExceptionsLog, str);
                        else
                            File.AppendAllLines(Config.Pathes.ExceptionsLog, str);
                        ++countWrites;
                    }

                }
                catch { }
            });
        }

        public static string LastException { get; private set; }

        public static void Reset()
        {
            LastException = null;
        }

    }
}
