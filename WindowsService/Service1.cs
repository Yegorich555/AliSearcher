using System;
using System.ServiceProcess;
using WebApi;
using WebApi.App;

namespace WindowsService
{
    public partial class Service1 : ServiceBase
    {
        public Service1()
        {
            InitializeComponent();
        }

        WebApiApplication app;
        protected override void OnStart(string[] args)
        {
            try
            {
                app = new WebApiApplication();
                app.Run();
            }
            catch (Exception ex) { Catch.Set(ex); }
            base.OnStart(args);
        }

        protected override void OnStop()
        {
            Exit();
            base.OnStop();
        }

        protected override void OnShutdown()
        {
            Exit();
            base.OnShutdown();
        }

        void Exit()
        {
            try
            {
                if (app == null)
                    return;
                Worker.Instance.PauseSearch();
                app.Dispose();
                app = null;
            }
            catch (Exception ex) { Catch.Set(ex); }
        }
    }
}
