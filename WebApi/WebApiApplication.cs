using Microsoft.Owin.Hosting;
using System;
using WebApi.App;
using WebApi.App_Start;

namespace WebApi
{
    public class WebApiApplication : IDisposable
    {
        IDisposable app;
        public WebApiApplication()
        {
            Worker.Init();
        }

        public void Run()
        {
            var options = new StartOptions();
            options.Urls.Add("http://localhost:" + Config.BasePort);
            options.Urls.Add("http://127.0.0.1:" + Config.BasePort);
            if (Config.AdminRights)
                options.Urls.Add(string.Format("http://{0}:{1}", Environment.MachineName, Config.BasePort));
            app = WebApp.Start<GlobalConfig>(options);
        }

        public void Dispose()
        {
            if (app != null)
                app.Dispose();
        }

        public int Port { get { return Config.BasePort; } }
        public string Address { get { return Config.BaseAddress; } }
    }
}
