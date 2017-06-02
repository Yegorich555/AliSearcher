using Microsoft.Owin.FileSystems;
using Microsoft.Owin.StaticFiles;
using Newtonsoft.Json.Serialization;
using Owin;
using System.Diagnostics;
using System.Web.Http;
using WebApi.App;

namespace WebApi.App_Start
{
    public class GlobalConfig
    {
        public void Configuration(IAppBuilder appBuilder)
        {
            // Configure Web API for self-host. 
            var config = new HttpConfiguration();
            config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            RouteConfig.RegisterRoutes(config.Routes);
            appBuilder.UseWebApi(config);

            if (Debugger.IsAttached)          
            {
                var path = Config.Pathes.App;
                appBuilder.UseStaticFiles(new StaticFileOptions
                {
                    FileSystem = new PhysicalFileSystem(path)
                });
            }
            else
                appBuilder.UseStaticFiles();
            //var physicalFileSystem = new PhysicalFileSystem(Config.Pathes.App);
            //var options = new FileServerOptions
            //{
            //    EnableDefaultFiles = true,
            //    FileSystem = physicalFileSystem
            //};
            //options.StaticFileOptions.FileSystem = physicalFileSystem;
            //options.StaticFileOptions.ServeUnknownFileTypes = true;
            //appBuilder.UseFileServer(options);

        }
    }
}
