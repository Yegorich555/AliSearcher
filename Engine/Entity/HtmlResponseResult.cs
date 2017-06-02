using System.Net;

namespace Engine.Entity
{
    public class HtmlResponseResult
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Html { get; set; }
    }
}
