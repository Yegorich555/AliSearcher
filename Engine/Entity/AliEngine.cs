using System;
using System.Net;
using System.Text;

namespace Engine.Entity
{
    public class AliEngine
    {
        public AliEngine Copy()
        {
            var tmp = new AliEngine
            {
                MinPrice = MinPrice,
                MaxPrice = MaxPrice,
                SearchText = SearchText,
                ShipCountry = ShipCountry,
                SortType = SortType,
                Currency = Currency,
                CustomUrl = CustomUrl
            };
            return tmp;
        }

        const string _minPrice = "minPrice";
        const string _maxPrice = "maxPrice";
        const string _searchText = "SearchText";

        [Name(_minPrice)]
        public SubFloat? MinPrice { get; set; } = new SubFloat(0);

        [Name(_maxPrice)]
        public SubFloat? MaxPrice { get; set; } = new SubFloat(20);

        [Name(_searchText)]
        public string SearchText { get; set; } = "led strip 5060";

        [Name("ShipCountry")]
        public string ShipCountry { get; set; } = "BY";

        [Name("SortType")]
        public string SortType { get; set; } = "price_asc";

        public string Currency { get; set; } = "USD";

        string currentUrl;

        string customUrl;
        public string CustomUrl
        {
            get
            {
                return customUrl;
            }
            set
            {
                if (!value.IsEmpty())
                {
                    value = value.ReplaceBetween(_minPrice, "&", null);
                    value = value.ReplaceBetween(_maxPrice, "&", null);
                    customUrl = value; //for first SerUrlPage
                    value = SetUrlPage(1);
                    SearchText = value.FindValue(_searchText, 0, -1, "&").Text;
                }
                customUrl = value;
            }
        }

        CookieContainer cookies;
        public CookieContainer Cookies
        {
            get
            {
                if (cookies == null)
                {
                    cookies = new CookieContainer();
                    cookies.Add(new Cookie("aep_usuc_f", "region=" + ShipCountry.ToStringNull() + "&site=glo&b_locale=en_US&c_tp=" + Currency.ToStringNull(), "/", ".aliexpress.com"));
                    cookies.Add(new Cookie("intl_locale", "en_US", "/", ".aliexpress.com"));
                }
                return cookies;
            }
            set
            {
                cookies = value;
            }
        }

        public static bool operator ==(AliEngine v1, AliEngine v2)
        {
            if ((object)v1 == null && (object)v2 == null)
                return true;
            if ((object)v1 == null || (object)v2 == null)
                return false;

            return v1.CustomUrl.IsEqual(v2.CustomUrl) &&
                   v1.SearchText.IsEqual(v2.SearchText) &&
                   v1.Currency.IsEqual(v2.Currency) &&
                   v1.ShipCountry.IsEqual(v2.ShipCountry) &&
                   v1.MinPrice == v2.MinPrice &&
                   v1.MaxPrice == v2.MaxPrice;
        }

        public static bool operator !=(AliEngine v1, AliEngine v2)
        {
            return !(v1 == v2);
        }

        public override bool Equals(object obj)
        {
            var val = obj as AliEngine;
            return val != null && val == this;
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        public override string ToString()
        {
            var str = new StringBuilder();
            const string sep = "; ";
            str.Append(CustomUrl); str.Append(sep);
            str.Append(SearchText); str.Append(sep);
            str.Append(MinPrice.ToString()); str.Append(sep);
            str.Append(MaxPrice.ToString()); str.Append(sep);
            str.Append(Currency); str.Append(sep);
            str.Append(ShipCountry); str.Append(sep);
            str.Append(SortType); str.Append(sep);
            return str.ToString();
        }

        public string SetUrlPage(int pageNumber)
        {
            if (currentUrl.IsEmpty())
                ToUrl();
            if (!CustomUrl.IsEmpty())
                return currentUrl.ReplaceBetween("{", "}", pageNumber);
            else
                return currentUrl + pageNumber;

        }

        public string ToUrl(SubFloat? shiftedMinValue = null)
        {
            var str = new StringBuilder();
            if (!CustomUrl.IsEmpty())
            {
                str.Append(CustomUrl);
                if (MinPrice.HasValue && MinPrice.Value != 0)
                {
                    str.Append("&");
                    str.Append(_minPrice);
                    str.Append("=");
                    str.Append(MinPrice);
                }

                if (MaxPrice.HasValue && MaxPrice.Value != 0)
                {
                    str.Append("&");
                    str.Append(_maxPrice);
                    str.Append("=");
                    str.Append(MaxPrice);
                }
            }
            else
            {
                str.Append(@"https://www.aliexpress.com/wholesale?site=glo&tc=af&g=y");
                //var str = new StringBuilder(@"https://www.aliexpress.com/wholesale?tc=af&g=y");
                foreach (var prop in GetType().GetProperties())
                {
                    var attrs = prop.GetCustomAttributes(typeof(NameAttribute), false);
                    if (attrs.Length < 1)
                        continue;
                    var attr = attrs[0] as NameAttribute;
                    str.Append("&");
                    str.Append(attr.Name);
                    str.Append("=");
                    object value;

                    if (shiftedMinValue != null && attr.Name.IsEqual(_minPrice))
                        value = shiftedMinValue;
                    else
                        value = prop.GetValue(this);
                    str.Append(value.ToStringNull());
                }
                str.Append("&page=");
            }

            currentUrl = str.ToString();
            return currentUrl;
        }

    }

    public class NameAttribute : Attribute
    {
        public NameAttribute(string name)
        {
            Name = name;
        }
        public string Name { get; set; }
    }
}
