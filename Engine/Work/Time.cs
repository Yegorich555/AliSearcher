using System;
using System.Text;

namespace Engine.Entity
{
    public struct Time
    {
        public Time(int hour, int minutes, int seconds) : this(hour * 3600 + minutes * 60 + seconds)
        { }

        public Time(int totalSeconds)
        {
            TotalSeconds = totalSeconds;
        }

        public static Time Now
        {
            get
            {
                var now = DateTime.Now;
                return new Time(now.Hour, now.Minute, now.Second);
            }
        }

        public static Time UtcNow
        {
            get
            {
                var now = DateTime.UtcNow;
                return new Time(now.Hour, now.Minute, now.Second);
            }
        }

        public int? Hour { get => TotalSeconds / 3600; }
        public int? Minute { get => (TotalSeconds - Hour * 3600) / 60; }
        public int? Second { get => TotalSeconds - (Hour * 3600 + Minute * 60); }

        public int? TotalSeconds { get; set; }
        public bool Empty { get { return TotalSeconds == 0; } }

        public override string ToString()
        {
            if (TotalSeconds == null)
                return "";
            var str = new StringBuilder();
            str.Append(Hour);

            str.Append(":");
            var _minute = Minute;
            if (_minute < 10)
                str.Append("0");
            str.Append(_minute);

            str.Append(":");
            var _second = Second;
            if (_second < 10)
                str.Append("0");
            str.Append(_second);

            return str.ToString();
        }

        public string ToString(string textWithoutEmpty)
        {
            if (Empty)
                return textWithoutEmpty;
            else
                return this.ToString();
        }

        public bool HasValue { get => TotalSeconds.HasValue; }

        public static implicit operator Time(int? v)
        {
            if (v == null)
                return new Time();
            return new Time { TotalSeconds = v };
        }

        public static implicit operator int? (Time v)
        {
            return v.TotalSeconds;
        }

        public override bool Equals(object obj)
        {
            if (obj == null && this == null)
                return true;
            if (obj == null || this == null)
                return false;

            if (obj is Time)
                return this == (Time)obj;
            return false;
        }

        public override int GetHashCode()
        {
            return TotalSeconds.GetHashCode();
        }
    }


}
