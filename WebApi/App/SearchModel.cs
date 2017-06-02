using Engine.Entity;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace WebApi.App
{
    public class SearchModel
    {
        public string AliSearchText { get; set; }
        public List<string> AliSearchHist { get; set; } = new List<string>();
        public SubFloat? AliMinPrice { get; set; }
        public SubFloat? AliMaxPrice { get; set; }
        public string Currency { get; set; }
        public string ShipCountry { get; set; }

        public string ResSearchText { get; set; }
        public string ResExcludeText { get; set; }
        public SubFloat? ResMinPrice { get; set; }
        public SubFloat? ResMaxPrice { get; set; }
        public SortModes SortMode { get; set; }
        public int? MaxQuantity { get; set; }
        public int? MinOrders { get; set; }
        public SubFloat? MinRating { get; set; }

        [JsonIgnore]
        public int Page { get; set; } = 1;

        internal bool IsEqualByAli(SearchModel value)
        {
            if (value == null)
                return false;
            //compare price
            if (AliMinPrice != value.AliMinPrice)
                return false;
            if (AliMaxPrice != value.AliMaxPrice)
                return false;

            //compare search text
            var arr1 = AliSearchText.SplitExt(';').ToList();
            var arr2 = value.AliSearchText.SplitExt(';').ToList();
            if (arr1.Count != arr2.Count)
                return false;
            for (int i = 0; i < arr1.Count; ++i)
            {
                if (!arr1[i].IsEqual(arr2[i]))
                    return false;
            }

            //compare other
            if (Currency != value.Currency)
                return false;
            if (ShipCountry != value.ShipCountry)
                return false;

            return true;
        }

        public static bool operator !=(SearchModel v1, SearchModel v2)
        {
            if ((object)v1 == null && (object)v2 == null)
                return false;
            if ((object)v1 == null || (object)v2 == null)
                return true;

            return v1.AliMaxPrice != v2.AliMaxPrice ||
                   v1.AliMinPrice != v2.AliMinPrice ||
                   v1.ResMinPrice != v2.ResMinPrice ||
                   v1.ResMaxPrice != v2.ResMaxPrice ||
                   v1.SortMode != v2.SortMode ||
                   v1.MaxQuantity != v2.MaxQuantity ||
                   !v1.AliSearchText.IsEqual(v2.AliSearchText) ||
                   !v1.ResSearchText.IsEqual(v2.ResSearchText) ||
                   !v1.ShipCountry.IsEqual(v2.ShipCountry) ||
                   !v1.Currency.IsEqual(v2.Currency) ||
                   !v1.ResExcludeText.IsEqual(v2.ResExcludeText) ||
                   v1.MinOrders != v2.MinOrders ||
                   v2.MinRating != v2.MinOrders;
        }

        public static bool operator ==(SearchModel v1, SearchModel v2)
        {
            return !(v1 != v2);
        }

        public override bool Equals(object obj)
        {
            if (obj == null)
                return false;
            var v = obj as SearchModel;
            if (v == null)
                return false;

            return this == v;
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }

    public enum SortModes
    {
        PriceMinToMax,
        PriceMaxToMin,
        MinToMaxPieces,
        MaxToMinPieces,
        SellerRatingMaxToMin,
        SellerRatingMinToMax,
        NumOrdersMaxToMin,
        NumOrdersMinToMax
    }
}
