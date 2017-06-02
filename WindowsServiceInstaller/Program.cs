using System;
using System.Diagnostics;
using System.ServiceProcess;

namespace WindowsServiceInstaller
{
    class Program
    {
        static void Main(string[] args)
        {
            try
            {
                var nameService = "AliSearcherService";
                if (args != null && args.Length > 1)
                    nameService = args[0];
                var pathService = nameService;

                Console.Write("Check existing service of '" + nameService + "'... ");
                var serv = ServiceHelper.Get(nameService);
                var exist = serv != null;
                Console.WriteLine(exist ? "Exist" : "Not exist");
                if (exist)
                {
                    Console.Write("Checking run status... ");
                    Console.WriteLine(serv.Runned() ? "Runned" : "Stopped");
                }
                else
                {
                    Console.Write("Install service... ");
                    serv = ServiceHelper.Install(pathService);
                    Console.WriteLine(serv != null ? "Ok" : "Denied");

                }
                RunService(serv);

                var ok = serv != null && serv.Runned();
                Console.WriteLine(ok ? "Ok" : "I'm sorry");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error:");
                Console.WriteLine(ex);
            }

            Console.ReadLine();
        }

        static void RunService(ServiceController serv)
        {
            if (serv.Runned())
                return;
            Console.Write("Running... ");
            serv.Start();
            var sw = new Stopwatch();
            sw.Start();
            while (!serv.Runned() && sw.ElapsedMilliseconds < 60000)
            {
            }
            sw.Stop();
            Console.WriteLine(serv.Runned() ? "Ok" : "Error. Break by timeout");
        }

    }
}
