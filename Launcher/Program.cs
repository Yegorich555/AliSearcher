using System;
using System.Runtime.InteropServices;
using System.Threading;
using WebApi;
using WebApi.App;

namespace Launcher
{
    public class Program
    {
        static bool exitSystem = false;

        #region Trap application termination
        [DllImport("Kernel32")]
        private static extern bool SetConsoleCtrlHandler(EventHandler handler, bool add);

        private delegate bool EventHandler(CtrlType sig);
        static EventHandler _handler;

        enum CtrlType
        {
            CTRL_C_EVENT = 0,
            CTRL_BREAK_EVENT = 1,
            CTRL_CLOSE_EVENT = 2,
            CTRL_LOGOFF_EVENT = 5,
            CTRL_SHUTDOWN_EVENT = 6
        }

        private static bool Handler(CtrlType sig)
        {
            Console.WriteLine("Exiting system due to external CTRL-C, or process kill, or shutdown");

            DisposeByExit();

            Console.WriteLine("Cleanup complete");

            //allow main to run off
            exitSystem = true;

            //shutdown right away so there are no lingering threads
            Environment.Exit(-1);

            return true;
        }
        #endregion

        static void Main(string[] args)
        {
            try
            {
                _handler += new EventHandler(Handler);
                SetConsoleCtrlHandler(_handler, true);
                var p = new Program();
                p.Start();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Global exception...See log file in " + Config.Pathes.ExceptionsLog);
                Catch.Set(ex);
                Console.WriteLine(Catch.LastException);

                Console.ReadLine();
            }
        }

        public void Start()
        {
            // start a thread and start doing some processing
            Console.WriteLine("Thread started, processing..");

            using (var app = new WebApiApplication())
            {
                Console.WriteLine("Work path: " + Config.Pathes.Work);
                Console.WriteLine("Writing in work path: " + (Config.Pathes.WriteAllow ? "allowed" : "DENIED"));
                Console.WriteLine("Admin rights: " + (Config.AdminRights ? "yes" : "no"));

                Console.WriteLine("Init server... Base address: " + app.Address);
                app.Run();
                // Create HttpCient and make a request to api/values 
                //HttpClient client = new HttpClient();

                //var response = client.GetAsync(baseAddress + "api/values").Result;

                //Console.WriteLine(response);
                //Console.WriteLine(response.Content.ReadAsStringAsync().Result);
                Console.WriteLine("Listening...");
                while (!exitSystem)
                {
                }
            }
        }

        public static void DisposeByExit()
        {
            try
            {
                Console.WriteLine("Cache data");
                Worker.Instance.PauseSearch(); 
            }
            catch (Exception ex)
            {
                Console.WriteLine("DisposeByExit exception...See log file in " + Config.Pathes.ExceptionsLog);
                Catch.Set(ex);
                Console.WriteLine(Catch.LastException);

                Console.ReadLine();
            }

        }
    }
}
