using System.Web.Http;

namespace WebApi.App
{
    public class AdminController : ApiController
    {
        [HttpGet]
        [ActionName("LastException")]
        public string LastException()
        {
            return Catch.LastException;
        }

        [HttpPost]
        [ActionName("ResetException")]
        public void ResetException()
        {
            Catch.Reset();
        }
    }
}
