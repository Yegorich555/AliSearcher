using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Engine.Entity
{
    public static class GeneralExtensions
    {
        public static int IndexOfFirstDigit(this string text)
        {
            if (text == null)
                return -1;
            for (int i = 0; i < text.Length; ++i)
                if (Char.IsDigit(text[i]))
                    return i;
            return -1;
        }

        public static int IndexOfRange(this string text, string value, int startIndex = 0, int endIndex = -1)
        {
            if (endIndex < 0)
                endIndex = text.Length;
            return text.IndexOf(value, startIndex, endIndex - startIndex);
        }

        public static bool IsEqual(this string text, string value)
        {
            return string.Compare(text, value, true) == 0;
        }

        public static string ToStringNull(this object obj, string nullText = "")
        {
            if (obj == null)
                return nullText;
            else return obj.ToString();
        }

        public static List<IEnumerable<string>> SplitExt(this IEnumerable<string> text, char splitChar)
        {
            var lst = new List<IEnumerable<string>>();
            foreach (var a in text)
            {
                var arr = a.SplitExt(splitChar);
                lst.Add(arr);
            }
            return lst;
        }

        public static IEnumerable<string> SplitExt(this string text, char splitChar)
        {
            var arr = text.Split(splitChar);
            foreach (var item in arr)
                if (!string.IsNullOrWhiteSpace(item))
                    yield return item;
        }

        public static bool IsEmpty(this string text)
        {
            return string.IsNullOrWhiteSpace(text);
        }

        public static string HtmlDecode(this string html)
        {
            if (html.IsEmpty())
                return html;
            return HttpUtility.HtmlDecode(html);
        }

        public static bool IsAny<T>(this IEnumerable<T> collection)
        {
            return collection != null && collection.Any();
        }

        public static bool IsEmpty<T>(this IEnumerable<T> collection)
        {
            return collection == null || !IsAny(collection);
        }

        public static bool Divisible(this int v1, int value)
        {
            return v1.Remainder(value) == 0;
        }

        public static bool Divisible(this int? v1, int? value)
        {
            if (v1 == null || value == null)
                return false;
            return v1.Remainder(value) == 0;
        }

        public static int Remainder(this int v1, int value)
        {
            int v = v1 / value;
            return v1 - v * value;
        }

        public static int? Remainder(this int? v1, int? value)
        {
            int? v = v1 / value;
            return v1 - v * value;
        }
    }
}
