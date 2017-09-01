using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Engine.Entity
{
    public static class GeneralExtensions
    {
        public static FindStruct FindValue(this string html,
              string searchText,
              int startIndex,
              int endIndex,
              string endText = "\"",
              int indexAdd = 1)
        {
            if (endIndex == -1)
                endIndex = html.Length - 1;
            var indexOf = html.IndexOfRange(searchText, startIndex, endIndex);
            if (indexOf < 0)
                return new FindStruct(null, startIndex);

            startIndex = html.IndexOf(searchText, startIndex) + searchText.Length + indexAdd;
            var lastIndex = html.IndexOf(endText, startIndex);
            if (lastIndex == -1)
                lastIndex = html.Length - 1;
            var str = html.Substring(startIndex, lastIndex - startIndex);
            return new FindStruct(str, ++lastIndex);
        }

        public static string ReplaceBetween(this string text, string startText, string endText, object setter, bool includeFindedText = false)
        {
            var starIndex = text.IndexOf(startText);
            if (starIndex == -1)
                return text;

            var str = new StringBuilder();
            var endIndex = starIndex - 1;
            if (includeFindedText)
                endIndex += startText.Length;
            str.Append(text.SubstringByIndex(0, endIndex)); //first part
            var setText = setter.ToStringNull();
            if (!string.IsNullOrEmpty(setText))
                str.Append(setText); //middle part - setter

            starIndex = text.IndexOf(endText, starIndex + startText.Length);
            if (starIndex > -1) //if than not end
            {
                if (!includeFindedText)
                    starIndex += endText.Length;
                str.Append(text.SubstringByIndex(starIndex)); //last part
            }

            return str.ToString();

        }

        public static string SubstringByIndex(this string text, int startIndex, int endIndex = -1)
        {
            if (endIndex == -1)
                endIndex = text.Length - 1;
            return text.Substring(startIndex, endIndex - startIndex + 1);
        }

        public static int IndexOfFirstDigit(this string text, int startIndex = 0)
        {
            if (text == null)
                return -1;
            for (int i = startIndex; i < text.Length; ++i)
                if (Char.IsDigit(text[i]))
                    return i;
            return -1;
        }

        public static int IndexOfFirstLetter(this string text, int startIndex = 0)
        {
            if (text == null)
                return -1;
            for (int i = startIndex; i < text.Length; ++i)
                if (Char.IsLetter(text[i]))
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
