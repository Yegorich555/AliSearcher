namespace WebApi.App
{
    public class SearchResponseModel
    {
        public string SearchText { get; set; }
        public int? CountItems { get; set; }
        public int? CountPages { get; set; }
        public int? PageLoadSpeed { get; set; }
        public string LostTime { get; set; }
        public int? CurrentPage { get; set; }
        public bool IsCanceled { get; set; }
        public bool IsSummary { get; set; }
    }
}
