namespace Engine.Entity
{
    public struct LotSize
    {
        public LotSize(string text)
        {
            Value = 0;
            Text = text;
            if (string.IsNullOrWhiteSpace(text))
                return;

            var indexStart = text.IndexOfFirstDigit();
            if (indexStart > -1)
            {
                var indexEnd = text.IndexOf(' ', indexStart);
                if (indexEnd > -1)
                {
                    text = text.Substring(indexStart, indexEnd - indexStart);
                    if (int.TryParse(text, out int v))
                        Value = v;
                }
            }
        }

        public int Value { get; set; }
        public string Text { get; set; }
        
        public static implicit operator LotSize(int v)
        {
            return new LotSize { Value = v};
        }

        public static implicit operator int(LotSize v)
        {
            return v.Value;
        }

        public override string ToString()
        {
            if (Text.IsEmpty())
                return "";
            return Text + "; " + Value;
        }
    }
}
