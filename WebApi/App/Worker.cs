using Engine.Entity;
using Engine.Work;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.App
{
    public class Worker
    {
        private Worker() { }

        #region Property
        private static Worker instance;
        public static Worker Instance
        {
            get
            {
                if (instance == null)
                    Init();
                return instance;
            }
        }

        public List<Searcher> Searchers { get; private set; }

        SearchModel lastSearchModel;
        public SearchModel LastSearchModel
        {
            get
            {
                try
                {
                    if (lastSearchModel == null && File.Exists(Config.Pathes.LastValues))
                    {
                        var str = File.ReadAllText(Config.Pathes.LastValues);
                        lastSearchModel = JsonConvert.DeserializeObject(str, typeof(SearchModel)) as SearchModel;
                    }
                }
                catch (Exception ex) { Catch.Set(ex); }

                return lastSearchModel;
            }
            set
            {
                try
                {
                    if (value == null)
                        return;
                    var isChange = value != lastSearchModel;
                    var lastAliHist = lastSearchModel?.AliSearchHist;

                    if (isChange)
                    {
                        //save history                       
                        if (lastAliHist == null)
                            lastAliHist = new List<string>();

                        if (!lastAliHist.Any(a => a.IsEqual(value.AliSearchText)))
                        {//add text
                            lastAliHist.Insert(0, value.AliSearchText);
                            if (lastAliHist.Count > 30)
                                lastAliHist.RemoveAt(lastAliHist.Count - 1); //remove last
                        }
                    }

                    lastSearchModel = value;
                    lastSearchModel.AliSearchHist = lastAliHist;

                    if (isChange)
                    {
                        Task.Run(() =>
                            {
                                try
                                {
                                    var json = JsonConvert.SerializeObject(lastSearchModel, Formatting.Indented);
                                    File.WriteAllText(Config.Pathes.LastValues, json);
                                }
                                catch (Exception ex) { Catch.Set(ex); }
                            });
                    }
                }
                catch (Exception ex) { Catch.Set(ex); }
            }
        }

        public IEnumerable<Goods> ListGoods
        {
            get
            {
                foreach (var s in Searchers)
                    foreach (var item in s.Goods)
                        yield return item;
            }
        }
        #endregion

        #region Methods

        public static void Init()
        {
            if (instance == null)
            {
                instance = new Worker();
                Catch.Init();
                Config.Init();

                Task.Run(() =>
                {
                    if (Config.AutoContinueSearches && Config.CacheTime > 0)
                        instance.AutoContinue();
                    if (Config.AutoClearOldCache)
                        ClearOldCache();
                });
            }
        }

        public void Search(SearchModel model)
        {
            try
            {
                if (model == null)
                    return;
                //if (Searchers != null && LastSearchModel == model) //!+todo need run search if all paused
                //{
                //    lastSearchModel = model;
                //    return;
                //}
                //var saveModel
                if (Searchers == null || !model.IsEqualByAli(LastSearchModel))
                {
                    var arr = model.AliSearchText.SplitExt(';');
                    var list = new List<AliEngine>();
                    foreach (var item in arr)
                    {
                        var aliEngine = new AliEngine
                        {
                            SearchText = item.Trim(),
                            Currency = model.Currency,
                            MinPrice = model.AliMinPrice,
                            MaxPrice = model.AliMaxPrice,
                            ShipCountry = model.ShipCountry
                        };
                        list.Add(aliEngine);
                    }

                    StartSearch(list);
                }

                LastSearchModel = model;
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        public void StartSearch(IList<AliEngine> aliEngineArray)
        {
            try
            {
                PauseSearch();
                if (task != null)
                    task.Wait();

                var list = new List<Searcher>(aliEngineArray.Count);
                foreach (var aliEngine in aliEngineArray)
                {
                    Searcher s = Searchers?.FirstOrDefault(a => a.AliEngine == aliEngine);
                    if (s == null)
                    {
                        //from cache
                        s = FromCache(aliEngine);
                        if (s == null)  //init new                           
                            s = new Searcher(aliEngine);
                    }
                    list.Add(s);
                }
                Searchers = list;

                //run async
                task = Task.Run(() =>
                {
                    Continue();
                });
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        Task task;
        void Continue()
        {
            try
            {
                foreach (var s in Searchers) //fot statistics
                {
                    if (s.CountItems == null)//!+todo when pause than next s.Start 
                        s.Start(isOneCycle: true);
                }
                foreach (var s in Searchers)
                {
                    s.Start();
                    CacheSearcher(s);
                }
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        public void PauseSearch()
        {
            try
            {
                if (Searchers != null)
                {
                    foreach (var s in Searchers)
                    {
                        s.Stop();
                        CacheSearcher(s);
                    }
                }
            }
            catch (Exception ex) { Catch.Set(ex); }
        }


        void CacheSearcher(Searcher item)
        {
            try
            {
                if (!Config.Pathes.WriteAllow)
                    return;
                if (Config.CacheTime < 1 || item == null)
                    return;
                if (!Directory.Exists(Config.Pathes.Cache))
                    Directory.CreateDirectory(Config.Pathes.Cache);

                var json = JsonConvert.SerializeObject(item, Formatting.Indented);
                var path = Config.Pathes.CacheFile(item.SearchText);
                File.WriteAllText(path, json);
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        public Searcher FromCache(AliEngine engine)
        {
            try
            {
                if (Config.CacheTime < 1 || !Directory.Exists(Config.Pathes.Cache))
                    return null;

                var path = Config.Pathes.CacheFile(engine.SearchText);
                if (!File.Exists(path))
                    return null;

                var str = File.ReadAllText(path);
                var item = JsonConvert.DeserializeObject(str, typeof(Searcher)) as Searcher;

                if (item.AliEngine != engine)
                    return null;

                if (item.DateResponse == null)
                    return null;

                if ((DateTime.UtcNow - (DateTime)item.DateResponse).TotalDays > Config.CacheTime)
                    return null;

                return item;
            }
            catch (Exception ex) { Catch.Set(ex); }
            return null;
        }

        public static void ClearOldCache()
        {
            try
            {
                var now = DateTime.UtcNow;
                if (!Config.AutoClearOldCache || !Directory.Exists(Config.Pathes.Cache))
                    return;
                foreach (var path in Directory.EnumerateFiles(Config.Pathes.Cache))
                {
                    var str = File.ReadAllText(path);

                    const string dtResponse = "DateResponse";
                    var startIndex = str.IndexOf(dtResponse);
                    if (startIndex < 0)
                        break;
                    startIndex += dtResponse.Length + 2;
                    startIndex = str.IndexOf('\"', startIndex) + 1;
                    var endIndex = str.IndexOf('\"', startIndex) - 1;
                    var dtStr = str.Substring(startIndex, endIndex - startIndex);
                    if (DateTime.TryParse(dtStr, out DateTime dt))
                        if (dt.AddDays(Config.CacheTime) < now)
                            if (Config.Pathes.WriteAllow)
                                File.Delete(path);
                }

            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        public void AutoContinue()
        {
            try
            {
                Search(LastSearchModel);
            }
            catch (Exception ex) { Catch.Set(ex); }
        }

        #endregion
    }
}
