using System;

namespace WebApi.App
{
    public class CookieChrome
    {
        public string Name { get; set; }
        public string Value { get; set; }
        public string Path { get; set; }
        public string Domain { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
