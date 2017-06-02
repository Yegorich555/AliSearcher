using Engine.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace WebApi.App
{
    public static class SearchExtensions
    {
        public static IEnumerable<Goods> MinRating(this IEnumerable<Goods> collection, int? minValue)
        {
            if (minValue == null || minValue == 0)
                return collection;
            return collection.Where(a => a.StoreRating >= minValue);
        }

        public static IEnumerable<Goods> MinOrders(this IEnumerable<Goods> collection, int? minValue)
        {
            if (minValue == null || minValue == 0)
                return collection;
            return collection.Where(a => a.StoreOrderCount >= minValue);
        }

        public static IEnumerable<Goods> MinPrice(this IEnumerable<Goods> collection, SubFloat? minValue)
        {
            if (minValue == null || minValue == 0)
                return collection;
            return collection.Where(a => a.PriceTotal.ValueMin >= minValue);
        }

        public static IEnumerable<Goods> MaxPrice(this IEnumerable<Goods> collection, SubFloat? maxValue)
        {
            if (maxValue == null || maxValue == 0)
                return collection;
            return collection.Where(a => a.PriceTotal.ValueMin <= maxValue);
        }

        public static IEnumerable<Goods> Sort(this IEnumerable<Goods> collection, SortModes sort)
        {
            switch (sort)
            {
                case SortModes.PriceMinToMax:
                    return collection.OrderBy(a => a.PriceTotal.ValueMin).ThenBy(a => a.StoreOrderCount);
                case SortModes.PriceMaxToMin:
                    return collection.OrderByDescending(a => a.PriceTotal.ValueMin).ThenByDescending(a => a.StoreOrderCount);
                case SortModes.MinToMaxPieces:
                    return collection.OrderBy(a => a.UnitPrice).ThenBy(a => a.PriceTotal.ValueMin);
                case SortModes.MaxToMinPieces:
                    return collection.OrderByDescending(a => a.UnitPrice).ThenByDescending(a => a.PriceTotal.ValueMin);
                case SortModes.SellerRatingMinToMax:
                    return collection.OrderBy(a => a.StoreRating).ThenBy(a => a.PriceTotal.ValueMin);
                case SortModes.SellerRatingMaxToMin:
                    return collection.OrderByDescending(a => a.StoreRating).ThenByDescending(a => a.PriceTotal.ValueMin);
                case SortModes.NumOrdersMinToMax:
                    return collection.OrderBy(a => a.StoreOrderCount).ThenBy(a => a.PriceTotal.ValueMin);
                case SortModes.NumOrdersMaxToMin:
                    return collection.OrderByDescending(a => a.StoreOrderCount).ThenByDescending(a => a.PriceTotal.ValueMin);
            }
            return collection;
        }

        public static IList<Goods> CountOut(this IList<Goods> collection, out int count)
        {
            if (collection == null)
                count = 0;
            else
                count = collection.Count;
            return collection;
        }

        public static IEnumerable<Goods> WhereText(this IEnumerable<Goods> collection, string text)
        {
            if (string.IsNullOrWhiteSpace(text) || collection.IsEmpty())
                return collection;
            return collection.WhereText(text.SplitExt(';').ToList());
        }

        public static IEnumerable<Goods> WhereText(this IEnumerable<Goods> collection, IEnumerable<string> arrayText)
        {
            foreach (var text in arrayText)
                foreach (var item in collection.WhereSingleText(text))
                    yield return item;
        }

        public static IEnumerable<Goods> WhereSingleText(this IEnumerable<Goods> collection, string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return collection;
            var arr = text.SplitExt(' ').ToList();
            return collection.Where(a => a.Description.ContainsAll(arr));
        }

        public static IEnumerable<Goods> WhereNoText(this IEnumerable<Goods> collection, string text)
        {
            if (string.IsNullOrWhiteSpace(text) || collection.IsEmpty())
                return collection;
            var ts = text.SplitExt(';').SplitExt(' ');
            return collection.Where(a => a.Description.NotContainsAny(ts));
        }

        public static IEnumerable<Goods> WhereMaxQuantity(this IEnumerable<Goods> collection, int? maxValue)
        {
            if (maxValue == null || maxValue < 1)
                return collection;
            return collection.Where(a => a.LotSize == null || a.LotSize <= maxValue);
        }

        static bool NotContainsAny(this string text, IEnumerable<IEnumerable<string>> arrFind)
        {
            foreach (var t in arrFind)
            {
                if (text.ContainsAll(t))
                    return false;
            }
            return true;
        }

        static bool ContainsAll(this string text, IEnumerable<string> arrFind)
        {
            if (text == null || arrFind == null)
                return false;

            foreach (var str in arrFind)
            {
                if (str == null)
                    return false;
                if (text.IndexOf(str, StringComparison.OrdinalIgnoreCase) < 0)
                    return false;
            }
            return true;
        }

    }
}
