
using System.Web.Http;

namespace WebApi.App_Start
{
    public class RouteConfig
    {
        public static void RegisterRoutes(HttpRouteCollection routes)
        {
            routes.MapHttpRoute(
                    name: "DefaultApi",
                    routeTemplate: "api/{controller}/{action}/{id}",
                    defaults: new { id = RouteParameter.Optional }
                    );
            routes.MapHttpRoute(
                     name: "Main",
                     routeTemplate: "",
                     defaults: new { controller = "Main", action = "GetView" }
                   );
        }
    }
}
