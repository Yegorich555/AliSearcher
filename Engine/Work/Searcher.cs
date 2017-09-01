using Engine.Entity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Engine.Work
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Searcher
    {
        public Searcher(AliEngine aliEngine)
        {
            AliEngine = aliEngine;
        }

        public const int ThreadRequestCount = 2;
        public const int AliMaxPageCount = 50; //if upper this value then load speed decrease
        public const int ItemsPerPageDefault = 48;

        #region Property
        [JsonProperty]
        public DateTime? DateResponse { get; private set; }
        [JsonProperty]
        public AliEngine AliEngine { get; private set; }

        public string SearchText { get { return AliEngine?.SearchText; } }

        string mainUrl;
        public string Url
        {
            get
            {
                if (mainUrl == null)
                    mainUrl = AliEngine?.ToUrl(LastShiftedValueMin);
                return mainUrl;
            }
            private set => mainUrl = value;
        }

        [JsonProperty]
        public SubFloat? LastShiftedValueMin { get; private set; }
        [JsonProperty]
        public int? CurrentShiftPage { get; private set; }

        CookieContainer cookies;
        public CookieContainer Cookies
        {
            get
            {
                if (cookies == null)
                    cookies = AliEngine?.Cookies;
                return cookies;
            }

        }

        public string Html { get; private set; }

        [JsonProperty]
        public List<Goods> Goods { get; private set; }

        int? speedRequest;
        public int? PageLoadSpeed  // speed request in ms
        {
            get => speedRequest;
            set
            {
                speedRequest = value;
                LostTime = (CountPages - CurrentPage) * value / 1000; //convert to seconds
            }
        }
        [JsonProperty]
        public int? CountItems { get; private set; }
        [JsonProperty]
        public int? CountPages { get; private set; }
        [JsonProperty]
        public int? CurrentPage { get; private set; }
        [JsonProperty]
        public int? ItemsPerPage { get; private set; }

        public Time LostTime { get; private set; }

        public bool IsNext
        {
            get
            {
                if (CurrentPage == null || Goods == null || CountItems == null || CountPages == null)
                    return true;
                return Goods.Count < CountItems && CurrentPage < CountPages;
            }
        }

        public bool ErrorExist { get; private set; }

        [JsonProperty]
        public bool Paused { get; private set; }

        private string CurrentGoodInfo
        {
            get
            {
                var str = new StringBuilder("Item index: ");
                str.AppendLine(countIndex.ToString());

                str.Append("Link: ");
                str.AppendLine(Url);

                str.Append("Current page: ");
                str.AppendLine(CurrentPage.ToString());

                str.AppendLine("Html: >>>");
                str.AppendLine(Html);
                str.AppendLine("<<<");
                return str.ToString();
            }
        }

        #endregion

        int countIndex;
        #region Methods

        #region Public

        public void Restart()
        {
            Reset();
            Start();
        }

        void Reset()
        {
            CountItems = null;
            CountPages = null;
            LostTime = null;
            ItemsPerPage = null;
            CurrentPage = 0;
            CurrentShiftPage = 0;
            Goods = new List<Goods>(1);
            DateResponse = DateTime.UtcNow;
        }

        public void Stop()
        {
            Paused = true;
        }

        public void Start(bool isOneCycle = false)
        {
            if (Goods == null)
                Reset();
            Paused = false;
            ErrorExist = false;
            while (IsNext)
            {
                ErrorExist = !LoadGoodsFromPage();
                if (ErrorExist)
                    break;
                if (isOneCycle || Paused)  //todo !isOneCycle for 1 page analize
                    return;
            }
            if (IsNext)
                ExceptionCatch.Set("Error " + GetType().FullName + ": " + MethodBase.GetCurrentMethod().Name +
                    "()\n Not all goods loaded (" + (Goods.Count - CountItems) + " items doesn't successfull).");

        }

        public ParseHtmlResult ParseHtml(string html, int? countWaited = null)
        {
            var result = new ParseHtmlResult();
            if (html.IsEmpty())
                return result;
            try
            {
                //get goods
                var countReaded = GetResultCount(html, out int startIndex);
                result.ReadedCountItems = countReaded;

                if (countReaded < 1)
                    return result;

                result.Goods = new List<Goods>();

                int allEndIndex = 0;
                bool first = true;
                var findStruct = new FindStruct { StartIndex = startIndex };

                while (countWaited == null || result.Goods.Count < countWaited)
                {
                    findStruct.StartIndex = html.IndexOf("qrdata", findStruct.StartIndex);
                    if (findStruct.StartIndex < 0)
                        break;

                    if (first)
                    {
                        allEndIndex = html.IndexOfRange("</ul", findStruct.StartIndex);
                        first = false;
                    }
                    else if (findStruct.StartIndex >= allEndIndex)
                        break;

                    var endIndex = html.IndexOf("</li>", findStruct.StartIndex);
                    if (endIndex < 0)
                        break;
                    var goods = new Goods();

                    findStruct.StartIndex = ParseSingleGoods(goods, html, findStruct.StartIndex, endIndex);

                    ++countIndex;
                    if (findStruct.NotOk)
                    {
                        var prop = goods.GetBrokenProperty();
                        if (prop != null)
                        {
                            if (goods.Link.IsEmpty() || goods.LinkImage.IsEmpty())
                                ExceptionCatch.Set("Error " + GetType().FullName + ": " + MethodBase.GetCurrentMethod().Name + "()\nGoods." + prop + " is broken\n" + CurrentGoodInfo);
                        }
                    }
                    else
                        result.Goods.Add(goods);
                }
                result.Success = result.Goods.IsAny();
            }
            catch (Exception ex)
            {
                ExceptionCatch.Set("Error " + GetType().FullName + ": " + MethodBase.GetCurrentMethod().Name + "()\n" + ex);
            }

            return result;
        }
        #endregion

        #region Internal
        bool LoadGoodsFromPage()
        {
            var sw = new Stopwatch();
            sw.Start();

            var ok = true;

            int cnt;
            if (CurrentPage > 0)
            {
                var lostPages = (int)(CountPages - CurrentPage);
                cnt = lostPages < ThreadRequestCount ? lostPages : ThreadRequestCount;
            }
            else //if first readed get only first page
                cnt = 1;


            if (CurrentShiftPage >= AliMaxPageCount) //shifting request by PriceMin of last good every each AliMaxPageCount pages
            {
                CurrentShiftPage = 0;
                LastShiftedValueMin = Goods.Last().Price.ValueMin;
                Url = AliEngine.ToUrl(LastShiftedValueMin);
            }
            var cPage = (int)CurrentShiftPage;

            var t = new Task<ParseHtmlResult>[cnt];

            for (int i = 0; i < cnt; ++i)
            {
                var n = i;
                var waitItems = ItemsPerPage;
                ++cPage;
                if (cPage >= CountPages)
                    waitItems = CountItems - Goods.Count - ItemsPerPage * n;

                //var url = Url + cPage;
                var url = AliEngine.SetUrlPage(cPage); // todo
                t[n] = Task<ParseHtmlResult>.Run(() =>
                {
                    var response = GetResponse(url);
                    if (response.Html.IsEmpty())
                    {
                        ExceptionCatch.Set("Error get response from " + url + ". Status code " + (int)response.StatusCode + " (" + response.StatusCode + ")");
                        //while (!Paused)
                        //{
                        //    Thread.Sleep(5000);
                        //    response = GetResponse(url);
                        //    if (!response.Html.IsEmpty())
                        //        break;
                        //}
                    }

                    if (n == 0)
                        Html = response.Html;
                    var result = ParseHtml(response.Html, waitItems);
                    return result;
                });
            }
            var oldCurPage = CurrentPage;

            Task.WaitAll(t);
            if (CurrentPage > 0) //not first result
            {
                foreach (var task in t)
                {
                    var r = task.Result;
                    if (r == null)
                        return false;
                    if (!r.Success)
                    {
                        ok = false;
                        break;
                    }

                    foreach (var item in r.Goods)
                        Goods.Add(item);
                    ++CurrentPage;
                }
            }
            else //first result
            {
                var r = t[0].Result;
                if (r == null)
                    return false;
                CountItems = r.ReadedCountItems;

                if (CountItems != null)
                {
                    if (CountItems < 1)
                    {
                        CurrentPage = 0;
                        CountPages = 0;
                    }
                    else
                    {
                        CurrentPage = 1;
                        Goods = r.Goods;
                        ItemsPerPage = r.Goods.Count;
                        CountPages = (CountItems + ItemsPerPage - 1) / ItemsPerPage;
                    }
                    Goods.Capacity = (int)CountItems;
                    ok = r.Success;
                }
                else
                    ok = false;
            }

            CurrentShiftPage += CurrentPage - oldCurPage;

            sw.Stop();

            var speed = sw.ElapsedMilliseconds / cnt;
            PageLoadSpeed = speed > int.MaxValue ? int.MaxValue : (int)speed;


            return ok;
        }

        int GetResultCount(string html, out int startIndex)
        {
            var findStruct = html.FindValue("resultCount\":", 0, html.Length);
            var count = -1;
            startIndex = 0;
            try
            {
                if (!int.TryParse(findStruct.Text.Trim().Replace(",", ""), out count))
                    count = -1;
                startIndex = findStruct.StartIndex;
            }
            catch (Exception ex)
            {
                count = -1;
            }

            return count;
        }

        HtmlResponseResult GetResponse(string url)
        {
            var request = WebRequest.Create(url) as HttpWebRequest;
            request.AutomaticDecompression = DecompressionMethods.GZip;
            request.Method = "GET";
            request.AllowAutoRedirect = false;

            request.CookieContainer = Cookies;

            var result = new HtmlResponseResult();

            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                result.StatusCode = response.StatusCode;
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    using (Stream stream = response.GetResponseStream())
                    using (StreamReader reader = new StreamReader(stream))
                        result.Html = reader.ReadToEnd();
                }
            }
            return result;
        }

        int ParseSingleGoods(Goods goods, string html, int startIndex, int endIndex)
        {
            var findStruct = new FindStruct { StartIndex = startIndex };
            try
            {
                //get title
                findStruct = html.FindValue("href=", findStruct.StartIndex, endIndex, "?");
                goods.Link = findStruct.Text;

                findStruct = html.FindValue("src=", findStruct.StartIndex, endIndex);
                goods.LinkImage = findStruct.Text;

                findStruct = html.FindValue("title=", findStruct.StartIndex, endIndex);
                goods.Description = findStruct.Text.HtmlDecode();

                //get price
                findStruct = html.FindValue("itemprop=\"price\"", findStruct.StartIndex, endIndex, "<");
                goods.Price = new Price(findStruct.Text);

                findStruct = html.FindValue("unit\"", findStruct.StartIndex, endIndex, "<");
                goods.Unit = findStruct.Text;

                var storeIndex = html.IndexOfRange("rate-history\"", findStruct.StartIndex, endIndex);

                //get lot size
                findStruct = html.FindValue("min-order\"", findStruct.StartIndex, storeIndex, "<");
                goods.LotSize = new LotSize(findStruct.Text?.Trim());

                //get shipping price
                var shipIndex = html.IndexOfRange("price", findStruct.StartIndex, storeIndex);
                if (shipIndex > 0)
                {
                    findStruct = html.FindValue("value\"", shipIndex, storeIndex, "<");
                    goods.PriceShipping = new Price(findStruct.Text);

                    //findStruct = html.FindValue("unit\"", findStruct.StartIndex, storeIndex, "<");
                    //goods.UnitShipping = findStruct.Text;
                    goods.PriceTotal = Price.Add(goods.Price, goods.PriceShipping?.ValueMin);
                }
                else
                {
                    goods.FreeShipping = true;
                    goods.PriceTotal = goods.Price;
                }

                //get store rating
                var infoMoreIndex = html.IndexOfRange("info-more", findStruct.StartIndex, endIndex);
                var rateStartIndex = html.IndexOfRange("class=\"star", findStruct.StartIndex, infoMoreIndex);
                if (rateStartIndex > 0)
                {
                    findStruct = html.FindValue("title=", findStruct.StartIndex, infoMoreIndex);
                    var str = findStruct.Text;
                    var index = str.IndexOfFirstDigit();
                    var ratingStr = str.Substring(index, str.IndexOf(' ', index) - index);
                    goods.StoreRating = new SubFloat(ratingStr);

                    findStruct = html.FindValue("title=\"Feedback(", findStruct.StartIndex, infoMoreIndex, ")", 0);
                    if (int.TryParse(findStruct.Text, out int countFeedback))
                        goods.StoreFeedbackCount = countFeedback;
                }

                findStruct = html.FindValue("Orders\"", findStruct.StartIndex, infoMoreIndex, "<");
                var cFind = findStruct.Text.FindValue("(", 0, findStruct.Text.Length, ")", 0);
                if (int.TryParse(cFind.Text, out int countOrders))
                    goods.StoreOrderCount = countOrders;

                //get store info
                findStruct = html.FindValue("href=", infoMoreIndex, endIndex);
                goods.StoreLink = findStruct.Text;

                findStruct = html.FindValue("title=", findStruct.StartIndex, endIndex);
                goods.StoreName = findStruct.Text.HtmlDecode();

                findStruct = html.FindValue("href=", findStruct.StartIndex, endIndex);
                goods.StoreFeedbackLink = findStruct.Text;

                findStruct = html.FindValue("sellerPositiveFeedbackPercentage=", findStruct.StartIndex, endIndex);
                goods.StorePositiveFeedback = findStruct.Text;
            }
            catch (Exception ex)
            {
                findStruct.NotOk = true;
                ExceptionCatch.Set("Error " + GetType().FullName + ": " + MethodBase.GetCurrentMethod().Name + "()\n" + ex + "\n" + CurrentGoodInfo);
            }
            return findStruct.StartIndex;
        }

        #endregion

        #endregion
    }
}
