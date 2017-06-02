using System.Configuration.Install;
using System.Linq;
using System.ServiceProcess;

namespace WindowsServiceInstaller
{
    public static class ServiceHelper
    {
        public static ServiceController Get(string serviceName)
        {
            return ServiceController.GetServices().FirstOrDefault(a => a.ServiceName.IsEqual(serviceName));
        }

        public static ServiceController Install(string serviceName)
        {
            var commandLineOptions = new string[1] { "/LogFile=install.log" };
            var installer = new AssemblyInstaller(serviceName + ".exe", commandLineOptions)
            {
                UseNewContext = true
            };
            installer.Install(null);
            installer.Commit(null);
            return ServiceController.GetServices().FirstOrDefault(a => a.ServiceName.IsEqual(serviceName));
        }

        public static bool Runned (this ServiceController serv)
        {
            return serv.Status == ServiceControllerStatus.Running ||
                   serv.Status == ServiceControllerStatus.StartPending;
        }


        public static bool IsEqual(this string text, string value)
        {
            return string.Compare(text, value, true) == 0;
        }
    }


}
