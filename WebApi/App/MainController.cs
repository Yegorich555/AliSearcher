using Engine.Entity;
using Engine.Work;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using WebApi.App;

namespace WebApi.Controllers
{
    public class MainController : ApiController
    {
        Worker worker { get; } = Worker.Instance;

        [HttpGet]
        [ActionName("GetView")]
        public HttpResponseMessage View()
        {
            var response = new HttpResponseMessage();
            response.Content = new StringContent(File.ReadAllText(Config.Pathes.MainPage));
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("text/html");
            return response;
        }

        [HttpGet]
        [ActionName("GetLastValues")]
        public object LastValues()
        {
            var model = worker.LastSearchModel;
            return new
            {
                Model = model,
                ExceptionExist = !Catch.LastException.IsEmpty()
            };
        }

        [HttpGet]
        [ActionName("Search")]
        public object Search([FromUri]SearchModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.AliSearchText))
                return null;

            worker.Search(model);
            return SearchStatus(worker.LastSearchModel);
        }

        const int pageSize = 48;
        public object SearchStatus(SearchModel model)
        {
            try
            {
                var searchStatusItems = GetStatusSearch(worker.Searchers);
                var item = searchStatusItems?.FirstOrDefault(a => !a.IsCanceled);
                bool cancelled = item == null;

                IEnumerable<Goods> goods = null;
                int totalCount = 0;
                int totalPages = 0;

                if (cancelled)
                {
                    if (model.Page == 0)
                        model.Page = 1;

                    //sort by second properties
                    goods = worker.ListGoods
                            .MaxPrice(model.ResMaxPrice)
                            .MinPrice(model.ResMinPrice)
                            .WhereMaxQuantity(model.MaxQuantity)
                            .WhereText(model.ResSearchText)
                            .WhereNoText(model.ResExcludeText) //exclude text
                            .MinOrders(model.MinOrders)
                            .MinRating(model.MinRating)
                            .Distinct()
                            .Sort(model.SortMode)
                            .ToList()
                            .CountOut(out totalCount)
                            .Skip((model.Page - 1) * pageSize)
                            .Take(pageSize)
                            .ToList();

                    totalPages = (totalCount + pageSize - 1) / pageSize;
                }

                return new
                {
                    Canceled = cancelled,
                    SearchStatus = searchStatusItems,
                    Goods = goods,
                    TotalCount = totalCount,
                    TotalPages = totalPages,
                    ExceptionExist = !Catch.LastException.IsEmpty(),
                    AliSearchHist = model.AliSearchHist
                };
            }
            catch (Exception ex)
            {
                Catch.Set(ex);
                return new
                {
                    ExceptionExist = !Catch.LastException.IsEmpty()
                };
            }
        }

        public IEnumerable<SearchResponseModel> GetStatusSearch(List<Searcher> searchers)
        {
            if (searchers == null || searchers.Count < 1)
                return null;
            var list = new List<SearchResponseModel>(searchers.Capacity);
            foreach (var s in searchers)
            {
                var model = new SearchResponseModel()
                {
                    SearchText = s.SearchText,
                    CountItems = s.CountItems,
                    CountPages = s.CountPages,
                    PageLoadSpeed = s.PageLoadSpeed,
                    LostTime = s.LostTime.ToString("---"),
                    CurrentPage = s.CurrentPage,
                    IsCanceled = !s.IsNext || s.ErrorExist
                };
                list.Add(model);
            }

            if (list.Count > 1)
            {
                var model = new SearchResponseModel()
                {
                    SearchText = "Summary:",
                    CountItems = list.Sum(a => a.CountItems),
                    CountPages = list.Sum(a => a.CountPages),
                    PageLoadSpeed = null,
                    LostTime = ((Time)searchers.Sum(a => a.LostTime)).ToStringNull("---"),
                    CurrentPage = list.Sum(a => a.CurrentPage),
                    IsCanceled = !list.Any(a => !a.IsCanceled),
                    IsSummary = true
                };
                list.Add(model);
            }

            return list;
        }
    }
}
