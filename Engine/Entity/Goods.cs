using System.Text;

namespace Engine.Entity
{
    public class Goods
    {
        public string Description { get; set; }
        public string Link { get; set; }
        public string LinkImage { get; set; }

        public Price Price { get; set; }
        public Price? PriceShipping { get; set; }
        public Price PriceTotal { get; set; }

        public bool FreeShipping { get; set; }

        public string Unit { get; set; }
        public LotSize? LotSize { get; set; }
        public SubFloat? UnitPrice
        {
            get
            {
                if (LotSize == null || LotSize == 0)
                    return PriceTotal.ValueMin;
                return (PriceTotal.ValueMin + 5) / LotSize; //round to last point
            }
        }

        //public string UnitShipping { get; set; }

        public SubFloat? StoreRating { get; set; }
        public int StoreFeedbackCount { get; set; }
        public string StoreFeedbackLink { get; set; }
        public int StoreOrderCount { get; set; }

        public string StoreName { get; set; }
        public string StoreLink { get; set; }
        public string StorePositiveFeedback { get; set; }

        public string GetBrokenProperty()
        {
            if (Link.IsEmpty())
                return "Link";
            if (Description.IsEmpty())
                return "Description";
            if (LinkImage.IsEmpty())
                return "LinkImage";
            if (Price.ValueMin == null)
                return "Price.ValueMin";

            return null;
        }

        public override string ToString()
        {
            const string sepStr = "; ";
            var str = new StringBuilder();

            if (PriceTotal.ValueMin != 0)
                str.Append(PriceTotal);
            else
                str.Append(Price);

            str.Append(sepStr);
            str.Append(Unit);

            if (LotSize != null)
                str.Append(sepStr).Append(LotSize.ToString());

            return str.ToString();
        }

        public override bool Equals(object obj)
        {
            if (obj == null)
                return false;
            var item = obj as Goods;
            if (item != null)
                return Link.IsEqual(item.Link);

            return base.Equals(obj);
        }

        public override int GetHashCode()
        {
            if (string.IsNullOrWhiteSpace(Link))
                return 0;
            return Link.GetHashCode();
        }
    }
}
