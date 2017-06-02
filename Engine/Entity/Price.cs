using System.Text;

namespace Engine.Entity
{
    public struct Price
    {
        public Price(string text)
        {
            Currency = null;
            ValueMin = 0;
            ValueMax = 0;

            //Text = text;
            var index = text.IndexOfFirstDigit();
            if (index == -1)
                return;
            Currency = text.Substring(0, index);

            var arr = text.Substring(index).Split('-');
            ValueMin = new SubFloat(arr[0].Trim());
            if (arr.Length > 1)
                ValueMax = new SubFloat(arr[1].Trim());
        }

        public string Currency { get; set; }
        public SubFloat? ValueMin { get; set; }
        public SubFloat? ValueMax { get; set; }

        public static Price Add(Price price, int? addValue)
        {
            return new Price
            {
                Currency = price.Currency,
                ValueMin = price.ValueMin + addValue,
                ValueMax = price.ValueMax > 0 ? price.ValueMax + addValue : 0
            };
        }


        //public string Text { get; set; }

        public override string ToString()
        {
            var str = new StringBuilder(Currency, 4);
            str.Append(ValueMin.ToString());
            if (ValueMax > 0)
            {
                str.Append(" - ");
                str.Append(ValueMax.ToString());
            }
            return str.ToString();
        }
    }
}
